import React from 'react'
import { Row, Col, Button, Modal } from 'antd';
import moment from 'moment';
import { Formik, Form, useFormik, FormikProvider } from 'formik';
import { isEmpty, uploadDataInsert } from '@components/Common/Js'
import FormikInput, { FormikContainer } from '@components/form/CustomInput'
import * as Yup from 'yup';
import { inject, observer } from 'mobx-react';

const PayInfo = ({ commonStore, data, drawerClose }) => {
    const [formikFieldDefault, setFormikFieldDefault] = React.useState({
        payment_terms               : 1,
        settlement_start_day        : 1,
        settlement_end_day          : 99,
        subscription_day_flag       : '',
        subscription_day            : '',
        credit_note                 : '',
        credit_regulation_yn        : 'Y',
        credit_limit_amount         : '',
        collateral_amount           : '',
        collateral_type             : [],
        collateral_maturity_date    : '',
        collateral_paper_files      : []
    })
    
    const validationSchema =    Yup.object({
        payment_terms               : Yup.number().label("결제 조건").required(), 
        settlement_start_day        : Yup.number().label("정산 시작일").required(), 
        settlement_end_day          : Yup.number().label("정산 종료일").required(), 
        subscription_day_flag       : Yup.number().label("정기 결제 시기").required(), 
        subscription_day            : Yup.number().label("정기 결제일").required(),
        credit_note                 : Yup.string().label("참고 사항").nullable(),
        credit_regulation_yn        : Yup.string().label("여신 규제 여부").required(),
        credit_limit_amount         : Yup.number().label("여신 한도").nullable(),
        collateral_amount           : Yup.number().label("담보 금액").nullable(),
        collateral_type             : Yup.array().label("담보 종류").nullable(),
        collateral_maturity_date    : Yup.string().label("담보 만기").nullable(),
        collateral_paper_files      : Yup.array().label("담보 파일").nullable()
    })

    const formikHook1 = useFormik({
        initialValues : formikFieldDefault,
        onSubmit : () => true, 
        validationSchema, 
    })

    const formikHook2 = useFormik({
        initialValues : formikFieldDefault,
        onSubmit : () => true,
        validationSchema,
    })

    const getDateOptions = () => {
        // 1~28 + 99 array
        let optionArr = []
        for (let i = 1; i<=28; i++) {
            let instantObj = {
                label : '',
                value : ''
            }
            instantObj.label = i + '일'
            instantObj.value = i
            optionArr.push(instantObj)
        }

        let instantObj = {
            label : '말일',
            value : 99
        }
        optionArr.push(instantObj)
        return optionArr
    }

    React.useEffect(() => {
        fetchData()
    }, [])

    const fetchData = React.useCallback(() => {
        if (data?.accountId) {
            commonStore.handleApi({
                url : `/sales-account-payment-credit-infos/${data.accountId}`,
            })
            .then((result) => {
                // // 전달된 값 중 필요없는 거 제거 (UPDATE에 영향을 줄 수 있으므로)
                // let deleteKeyList = ['id']
                // deleteKeyList.map((item) => {
                //     delete result.data[item]
                // })

                result.data.map((formData) => {
                    // radio 기본값 구성
                    formData.credit_regulation_yn = formData.credit_regulation_yn ? formData.credit_regulation_yn : formikFieldDefault.credit_regulation_yn
                    // date Type으로 변경
                    formData.collateral_maturity_date  = formData.collateral_maturity_date    ? moment(formData.collateral_maturity_date) : formikFieldDefault.collateral_maturity_date
                    // file Data Array 
                    formData.collateral_paper_files.map((fileData) => {
                        fileData.uid  = fileData.id
                        fileData.url  = fileData.file_path
                        fileData.name = fileData.file_name

                        delete fileData.file_column
                        delete fileData.file_name
                        delete fileData.file_path
                        delete fileData.fileable_id
                        delete fileData.fileable_type
                        delete fileData.id
                    })

                    if (formData.company == 1) {
                        formikHook1.setValues(formData)
                    }
                    if (formData.company == 2) {
                        formikHook2.setValues(formData)
                    }
                })
            })
        }
    }, [data])

    // 2개 form을 validation 후 api sending
    const onSubmit = async () => {
        let checkFormikHook1 = false
        let checkFormikHook2 = false
        let returnValues = []

        // 변수 선언 예정
        if (data.targetCompany.includes(1)) {
            formikHook1.handleSubmit()
        }
        else {
            // 훅1 체크할 필요 없다. 
            checkFormikHook1 = true
        }
        if (data.targetCompany.includes(2)) {
            formikHook2.handleSubmit()
        }
        else {
            // 훅2 체크할 필요 없다. 
            checkFormikHook2 = true
        }

        if ((checkFormikHook1 || isEmpty(await formikHook1.validateForm())) && (checkFormikHook2 || isEmpty(await formikHook2.validateForm()))) {
            if (checkFormikHook1) {
                returnValues.push(formikHook2.values)
                returnValues[0].company = "2"
                returnValues[0].collateral_paper_files = await uploadDataInsert(returnValues[0].collateral_paper_files, 'salesMgmt', commonStore)
            }
            if (checkFormikHook2) {
                returnValues.push(formikHook1.values)
                returnValues[0].company = "1"
                returnValues[0].collateral_paper_files = await uploadDataInsert(returnValues[0].collateral_paper_files, 'salesMgmt', commonStore)
            }
            else {
                returnValues.push(formikHook1.values)
                returnValues[0].company = "1"
                returnValues.push(formikHook2.values)
                returnValues[1].company = "2"
                returnValues[0].collateral_paper_files = await uploadDataInsert(returnValues[0].collateral_paper_files, 'salesMgmt', commonStore)
                returnValues[1].collateral_paper_files = await uploadDataInsert(returnValues[1].collateral_paper_files, 'salesMgmt', commonStore)
            }

            commonStore.handleApi({
                method : 'POST', 
                url : `/sales-account-payment-credit-infos/${data.accountId}`,
                data : returnValues
            })
            .then(() => {
                Modal.success({
                    content: '수정이 완료되었습니다.',
                })
                fetchData()
            })
        }
    }

    // 전달되는 targetCompanyId에 따라 다른 표시값, hook 사용
    const mappingHook = {
        '1': {
            formik : formikHook1, 
            name : '도서출판 길벗'
        }, 
        '2': {
            formik : formikHook2, 
            name : '길벗스쿨'
        }, 
    }

    return(
    <>
        {data.targetCompany.map((targetCompanyId) => (
            <FormikProvider key={targetCompanyId} value={mappingHook[targetCompanyId].formik}>
                <Row className='table marginTop'>
                    <div className="table_title">{mappingHook[targetCompanyId].name}</div>
                    <FormikContainer type={'radio'} perRow={1} label={'결제 조건'} name={'payment_terms'} required
                        data = {{
                            radioData : [{
                                label : '신용 (담보)', 
                                value: 1
                            }, {
                                label : '신용 (현금)',
                                value : 2,
                            }, {
                                label : '현금',
                                value : 3
                            }]
                        }}
                    />                    

                    <FormikContainer type={'etc'} perRow={1} label={'신용 결제 정보'} required>
                        <Row>
                            <Col xs={24} lg={12} className='innerCol' style={{display: 'flex', flexWrap: 'wrap', borderBottom: 0, borderRight: 0}}>
                                <Row ref={(element) => {element && element.style.setProperty('border-right', 0, 'important')}} className='table'>
                                    <FormikContainer type={'etc'} escapeVerCenter = {true} perRow={1} labelWidth={8} label={'정산 시작일'} required>
                                        <Row style={{alignItems: 'center'}}>
                                            <font style={{marginRight: '10px'}}>매월</font>
                                            <FormikInput style={{flex:1}} type={'select'} name={'settlement_start_day'} 
                                                onChange={(value) => {
                                                    let settlementEndDay = (value - 1)
                                                    if (settlementEndDay == 0) {
                                                        mappingHook[targetCompanyId].formik.setFieldValue('settlement_end_day', 99)
                                                        mappingHook[targetCompanyId].formik.setFieldValue('subscription_day_flag', 2)
                                                        mappingHook[targetCompanyId].formik.setFieldValue('subscription_day', 1)
                                                    }
                                                    else if (settlementEndDay == 98) {
                                                        mappingHook[targetCompanyId].formik.setFieldValue('settlement_end_day', 99)
                                                        mappingHook[targetCompanyId].formik.setFieldValue('subscription_day_flag', 2)
                                                        mappingHook[targetCompanyId].formik.setFieldValue('subscription_day', 1)
                                                    }
                                                    else {
                                                        mappingHook[targetCompanyId].formik.setFieldValue('settlement_end_day', settlementEndDay)
                                                        mappingHook[targetCompanyId].formik.setFieldValue('subscription_day_flag', 1)
                                                        mappingHook[targetCompanyId].formik.setFieldValue('subscription_day', value)
                                                    }
                                                }}
                                                data={{
                                                    mode : 'tags',
                                                    options : getDateOptions()
                                                }}
                                            />
                                        </Row>
                                    </FormikContainer>
                                    <FormikContainer perRow={1} labelWidth={8} label={'정산 종료일'} name={'settlement_end_day'} readOnly required>
                                        <font>
                                            {mappingHook[targetCompanyId].formik.values.settlement_end_day == 99 ? '같은 달 ' : '다음 달 '}
                                            {getDateOptions().filter((date) => (date.value == mappingHook[targetCompanyId].formik.values.settlement_end_day))[0]?.label}
                                        </font>
                                    </FormikContainer>

                                    <FormikContainer type={'etc'} perRow={1} labelWidth={8} label={'정기 결제일'} readOnly required>
                                        <font style={{marginRight: '10px'}}>정산 종료일의 </font>
                                        <FormikInput style={{flex:1, marginRight: 10}} type={'select'} name={'subscription_day_flag'} 
                                            data={{
                                                mode : 'tags',
                                                options : [{
                                                    label : '같은 달', 
                                                    value : 1
                                                },{
                                                    label : '다음 달', 
                                                    value : 2
                                                },]
                                            }}
                                        />
                                        <FormikInput style={{flex:1}} type={'select'} name={'subscription_day'} 
                                            data={{
                                                mode : 'tags',
                                                options : getDateOptions()
                                            }}
                                        />
                                    </FormikContainer>
                                </Row>
                            </Col>
                            <Col xs={24} lg={12} className='innerCol' style={{display: 'flex', borderBottom: 0, borderRight: 0}}>
                                <Row ref={(element) => {element && element.style.setProperty('border-left', 0, 'important')}} className='table'>
                                    <FormikContainer type={'textarea'} perRow={1} labelWidth={8} label={'참고 사항'} name={'credit_note'}/>
                                </Row>
                            </Col>
                        </Row>
                    </FormikContainer>

                    <FormikContainer type={'etc'} perRow={1} label={'여신 정보'} required>
                        <Row className='table'>
                            <FormikContainer type={'radio'} perRow={2} label={'여신 규제 여부'} name={'credit_regulation_yn'} required
                                data={{
                                    radioData : [{
                                        label : '예', 
                                        value : 'Y'
                                    },
                                    {
                                        label : '아니오', 
                                        value : 'N'
                                    }]
                                }}
                            />
                            <FormikContainer type={'text'} perRow={2} label={'여신 한도'} name={'credit_limit_amount'}/>
                            <FormikContainer type={'text'} perRow={2} label={'담보 금액'} name={'collateral_amount'}/>
                            <FormikContainer type={'checkbox'} perRow={2} label={'담보 종류'} name={'collateral_type'}
                                data={{
                                    checkboxData : [{
                                        label : '부동산',   value : 1 }, {
                                        label : '질권',     value : 2 }, {
                                        label : '보증금',   value : 3 }, {
                                        label : '기타',     value : 4 },]
                                }} 
                            />
                            <FormikContainer type={'datepicker'} perRow={2} label={'담보 만기'} name={'collateral_maturity_date'}
                                required = {mappingHook[targetCompanyId].formik.values.collateral_type && (mappingHook[targetCompanyId].formik.values.collateral_type.includes('2') || mappingHook[targetCompanyId].formik.values.collateral_type.includes('4')) ? true : false}
                                disabled = {mappingHook[targetCompanyId].formik.values.collateral_type && (mappingHook[targetCompanyId].formik.values.collateral_type.includes('2') || mappingHook[targetCompanyId].formik.values.collateral_type.includes('4')) ? false : true}
                            />
                            <FormikContainer type={'file'} perRow={2} label={'담보 파일'} name={'collateral_paper_files'}/>
                        </Row>
                    </FormikContainer>

                </Row>
            </FormikProvider>
        ))}
        
        <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
            <Col>
                <Button onClick={onSubmit} type="primary" htmlType="button" >확인</Button>
                <Button onClick={drawerClose} htmlType="button" style={{marginLeft:'10px'}}>취소</Button>
            </Col>
        </Row>
        
    </>
    )
}

export default inject('commonStore')(observer(PayInfo))