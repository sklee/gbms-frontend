import React from 'react'
import { Row, Col, Button, Modal } from 'antd';
import { Form, useFormik, FormikProvider, Field } from 'formik';
import { getCurrentYmd, isEmpty } from '@components/Common/Js'
import { FormikInput } from '@components/form/CustomInput'
import * as Yup from 'yup';
import { inject, observer } from 'mobx-react';

const SupplyStatus = ({commonStore, data, drawerClose}) => {
    const [formikFieldDefault, setFormikFieldDefault] = React.useState({
        discontinuation_yn : 'N',
        discontinuation_start_date : '', 
        discontinuation_end_date : '',
        discontinuation_note : '',
        return_stop_yn : 'N',
        return_stop_start_date : '',
        return_stop_end_date : '',
        return_stop_note : ''
    })
    
    const validationSchema =    Yup.object({
        // payment_terms               : Yup.number().label("결제 조건").required(), 
        // settlement_start_day        : Yup.number().label("정산 시작일").required(), 
        // settlement_end_day          : Yup.number().label("정산 종료일").required(), 
        // subscription_day_flag       : Yup.number().label("정기 결제 시기").required(), 
        // subscription_day            : Yup.number().label("정기 결제일").required(),
        // credit_note                 : Yup.string().label("참고 사항").nullable(),
        // credit_regulation_yn        : Yup.string().label("여신 규제 여부").required(),
        // credit_limit_amount         : Yup.number().label("여신 한도").nullable(),
        // collateral_amount           : Yup.number().label("담보 금액").nullable(),
        // collateral_type             : Yup.array().label("담보 종류").nullable(),
        // collateral_maturity_date    : Yup.string().label("담보 만기").nullable(),
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

    React.useEffect(() => {
        fetchData()
    }, [])

    const fetchData = React.useCallback(() => {
        if (data?.accountId) {
            commonStore.handleApi({
                url : `/sales-account-supply-status/${data.accountId}`,
            })
            .then((result) => {
                result.data.map((formData) => {
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
    const onSubmit = React.useCallback(async () => {
        let checkFormikHook1 = false
        let checkFormikHook2 = false
        var returnValues = []

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
            }
            else if (checkFormikHook2) {
                returnValues.push(formikHook1.values)
                returnValues[0].company = "1"
            }
            else {
                returnValues.push(formikHook1.values)
                returnValues.push(formikHook2.values)
                returnValues[0].company = "1"
                returnValues[1].company = "2"
            }

            commonStore.handleApi({
                method : 'POST', 
                url : `/sales-account-supply-status/${data.accountId}`,
                data : returnValues
            })
            .then((result) => {
                Modal.success({
                    content: '수정이 완료되었습니다.',
                })
            })
        }

    }, [data])

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

    return (
    <>
        {data.targetCompany.map((targetCompanyId) => (
            <FormikProvider key={targetCompanyId} value={mappingHook[targetCompanyId].formik}>
                <Row className='table marginTop'>
                    <div className="table_title">도서출판 길벗</div>
                    <Col lg={24} className='innerCol'>
                        <Row className="table">
                            <Col lg={4} className='label'>구분</Col>
                            <Col lg={4} className='label'>중단 여부</Col>
                            <Col lg={8} className='label'>중단 기간</Col>
                            <Col lg={8} className='label'>사유</Col>
                            <Col lg={4} className='verCenter'>출고 중단</Col>
                            <Col lg={4} className='verCenter'>
                                <FormikInput type={'radio'} name={'discontinuation_yn'}
                                    data={{
                                        radioData : [{
                                            label : '예',
                                            value : 'Y'
                                        }, {
                                            label : '아니오',
                                            value : 'N'
                                        }]
                                    }}
                                />
                            </Col>
                            <Col lg={8} className='verCenter'>
                                <Row style={{alignItems : 'center'}}>
                                    <FormikInput type={'datepicker'} name={'discontinuation_start_date'}
                                        disabled={mappingHook[targetCompanyId].formik.values.discontinuation_yn == 'Y' ? false : true}
                                    />
                                    <font style={{marginLeft: 10, marginRight: 10}}> ~ </font>
                                    <FormikInput type={'datepicker'} name={'discontinuation_end_date'}
                                        disabled={mappingHook[targetCompanyId].formik.values.discontinuation_yn == 'Y' ? false : true}
                                    />
                                </Row>
                            </Col>
                            <Col lg={8} className='verCenter'>
                                <FormikInput type={'text'} name={'discontinuation_note'}/>
                            </Col>

                            <Col lg={4} className='verCenter'>반품 중단</Col>
                            <Col lg={4} className='verCenter'>
                                <FormikInput type={'radio'} name={'return_stop_yn'}
                                    data={{
                                        radioData : [{
                                            label : '예',
                                            value : 'Y'
                                        }, {
                                            label : '아니오',
                                            value : 'N'
                                        }]
                                    }}
                                />
                            </Col>
                            <Col lg={8} className='verCenter'>
                                <Row style={{alignItems : 'center'}}>
                                    <FormikInput type={'datepicker'} name={'return_stop_start_date'}
                                        disabled={mappingHook[targetCompanyId].formik.values.return_stop_yn == 'Y' ? false : true}
                                    />
                                    <font style={{marginLeft: 10, marginRight: 10}}> ~ </font>
                                    <FormikInput type={'datepicker'} name={'return_stop_end_date'}
                                        disabled={mappingHook[targetCompanyId].formik.values.return_stop_yn == 'Y' ? false : true}
                                    />
                                </Row>
                            </Col>
                            <Col lg={8} className='verCenter'>
                                <FormikInput type={'text'} name={'return_stop_note'}/>
                            </Col>
                        </Row>
                    </Col>
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

export default inject('commonStore')(observer(SupplyStatus))