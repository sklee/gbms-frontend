import React, { useCallback } from 'react'
import { Row, Col, Input, Button, Modal } from 'antd';
import { inject, observer } from 'mobx-react';
import { FieldArray, Form, Formik, useField, useFormik } from 'formik';
import { FormikInput, FormikContainer, transformAddress, decodeTransformAddress } from '@components/form/CustomInput'
import * as Yup from 'yup';

import {getCurrentDate, uploadDataInsert} from '@components/Common/Js';

const BusinessInfo = ( {commonStore, data, drawerClose} ) => {
    const [formikFieldDefault, setFormikFieldDefault] = React.useState({
        business_name : '', 
        business_number : '', 
        representative_name : '', 
        address : {
            fullAddress : {
                zipcode : '',
                fullAddress : ''
            },
            detailAddress : ''
        }, 
        business_type : '', 
        industry : '', 
        tax_invoice_email : '', 
        business_name_internal : '', 
        sales_classification : null, 
        region : '', 
        shipping_address : {
            fullAddress : {
                zipcode : '',
                fullAddress : ''
            },
            detailAddress : ''
        }, 
        main_phone_number : '', 
        note : '',
        business_contacts : [], 
        sales_managers : [], 
        account_groups : [], 
        created_at : getCurrentDate(), 
        business_registration_files : [], 
    })
    
    const validationSchema =    Yup.object().shape({
        business_name :         Yup.string().label("사업자명").required(),
        business_number :       Yup.string().label("사업자 등록번호").required(),
        representative_name :   Yup.string().label("대표자").required(), 
        address :               Yup.object().shape({
            fullAddress :       Yup.object().shape({
                zipcode :       Yup.string().label("우편번호").required(), 
                fullAddress :   Yup.string().label("주소").required(), 
            }).nullable(), 
            detailAddress :     Yup.string().label("상세 주소").required(), 
        }),
        business_type :         Yup.string().label("업태").required(), 
        industry :              Yup.string().label("종목").required(), 
        tax_invoice_email :     Yup.string().label("세금계산서 메일").email().required(), 
        business_name_internal :Yup.string().label("사업자명 (내부)").required(), 
        sales_classification :  Yup.string().label("판매구분").nullable().required(), 
        region :                Yup.string().label("지역").nullable(), 
        shipping_address :      Yup.object().shape({
            fullAddress :       Yup.object().shape({
                zipcode :       Yup.string().label("우편번호").required(), 
                fullAddress :   Yup.string().label("배송지 주소").required(), 
            }).nullable(), 
            detailAddress :     Yup.string().label("상세 주소").required(), 
        }),
        main_phone_number :     Yup.string().label("대표 전화번호"), 
        sales_managers :        Yup.array().label('영업 담당자')
    })
    // business_registration_files :            [], 
    // business_contacts : [], 
    // account_groups : [], 
    // created_at : '', 

    React.useEffect(() => {
        console.log(data)
        fetchData()
    }, [data.accountId])

    const fetchData = useCallback(() => {
        if (data?.accountId) {
            commonStore.handleApi({
                url : `/sales-accounts/${data.accountId}`,
            })
            .then((result) => {
                let deleteKeyList = [
                    'account_code',
                    'account_code1',
                    'account_code2',
                    'updated_at',
                    // 'created_at',
                    'created_info',
                    'default_shipping_method',
                    'logistics_code',
                    'trade_end_date',
                    'trade_product_type',
                    'trading_start_date',
                    'trading_status',
                    'trading_target_company'
                ]
                let deleteKeyList2 = [
                    'created_at',
                    'created_id',
                    'id',
                    'note',
                    'sales_account_id',
                    'updated_at',
                    'updated_id'
                ]

                deleteKeyList.map((item) => {
                    delete result.data[item]
                })
                deleteKeyList2.map((item) => {
                    delete result.data.business_contacts[item]
                })
                
                let accountGroup = []
                result.data.account_groups.map((item) => {
                    accountGroup.push(item.group_id)
                }) 
                result.data.account_groups = accountGroup
                
                let salesManagers = []
                result.data.sales_managers.map((item) => {
                    salesManagers.push(item.id)
                }) 
                result.data.sales_managers = salesManagers

                // file Data Array 
                result.data.business_registration_files.map((fileData) => {
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
                
                const resultData = transformAddress(transformAddress(result.data, 'zip_code', 'address', 'address_detail'), 'shipping_zip_code', 'shipping_address', 'shipping_address_detail')
                setFormikFieldDefault(resultData)
            })
        }
    }, [data])

    const onSubmit = useCallback(async (formData) => {
        decodeTransformAddress(decodeTransformAddress(formData, 'zip_code', 'address', 'address_detail'), 'shipping_zip_code', 'shipping_address', 'shipping_address_detail')
        formData.business_registration_files = await uploadDataInsert(formData.business_registration_files, 'salesMgmt', commonStore)
        
        if (data.accountId) {
            commonStore.handleApi({
                method : 'PUT',
                url : `/sales-accounts/${data.accountId}`,
                data : formData
            })
            .then((result) => {
                Modal.success({
                    content: '수정이 완료되었습니다.',
                })
                fetchData()
            })
        }
        else {
            commonStore.handleApi({
                method : 'POST',
                url : `/sales-accounts`,
                data : formData
            })
            .then((result) => {
                Modal.success({
                  content: '등록이 완료되었습니다.',
                })
                data.setAccountId(result?.id)
                fetchData()
            })
        }
    }, [])

    const NewBusinessContacts = ({arrayHelpers, values }) => {
        const [field, meta, helpers] = useField('new_business_contacts')
        return (
            <Row>
                <Col span={4} style={{padding: '0 10px 0 0'}}>
                    <FormikInput name={`new_business_contacts.name`} placeholder="성명" />
                </Col>
                <Col span={4} style={{padding: '0 10px 0 0'}}>
                    <FormikInput name={`new_business_contacts.company_phone_number`} placeholder="회사 전화번호" />
                </Col>
                <Col span={4} style={{padding: '0 10px 0 0'}}>
                    <FormikInput name={`new_business_contacts.phone_number`} placeholder="휴대폰 번호" />
                </Col>
                <Col span={6} style={{padding: '0 10px 0 0'}}>
                    <FormikInput name={`new_business_contacts.email`} placeholder='이메일'/>
                </Col>
                <Col span={5} style={{padding: '0 10px 0 0'}}>
                    <FormikInput name={`new_business_contacts.note`} placeholder='참고 사항'/>
                </Col>
                <Col span={1} style={{padding: '0 10px 0 0'}}>
                    <Button type="primary" shape="circle" onClick={()=> {arrayHelpers.push(values.new_business_contacts); helpers.setValue({})}}>+</Button>
                </Col>
            </Row>
        )
    }

    return (
        <Formik
            enableReinitialize={true} 
            initialValues={formikFieldDefault}
            validationSchema={validationSchema}
            onSubmit = {onSubmit}
        >
        {(props) => (
            <Form>
                <Row className='table marginTop'>
                    <div className="table_title">사업자등록 정보</div>
                    <FormikContainer perRow={1} label={'사업자명'} name={'business_name'} onChange={(val) => { props.setFieldValue('business_name_internal', val.target.value)}} readOnly required/>
                    <FormikContainer perRow={2} label={'사업자등록번호'} name={'business_number'} required
                        style={{width: 'calc(100% - 155px)', marginRight: 10}} 
                        extraCompo={<Button type='primary' onClick={() => {
                            // 버튼 커스텀 및 유효성 검사 추가
                            let trimedBusinessNumber = props.values.business_number.trim().replaceAll('-', '')
                            if (trimedBusinessNumber == '') {
                                props.setFieldError('business_number', '사업자 등록번호를 입력해주세요.')
                            }
                            else if (trimedBusinessNumber.length !== 10) {
                                props.setFieldError('business_number', '사업자 등록번호를 10자리로 입력해주세요.')
                            }
                            else if (trimedBusinessNumber.match(/[^0-9]/g)) {
                                props.setFieldError('business_number', '사업자 등록번호는 숫자와 -로만 입력해주세요.')
                            }
                            else {
                                commonStore.handleApi({
                                    method : 'GET',
                                    url : '/check-bizInfo', 
                                    data : {
                                        company     : 1, 
                                        corp_num    : trimedBusinessNumber
                                    }
                                })
                                .then((result) => {
                                    result && result.BizInfo &&
                                    !result.BizInfo.companyRegNum ? 
                                    props.setFieldError('business_number', '등록되지 않은 사업자입니다.')
                                    :
                                    props.setFieldValue('business_name', result.BizInfo.corpName)
                                    props.setFieldValue('representative_name', result.BizInfo.ceoname)
                                    props.setFieldValue('business_name_internal', result.BizInfo.corpName)
                                    props.setFieldValue('business_number', trimedBusinessNumber)
                                })
                            }
                            
                        }}>국세청 확인(필수)</Button>}
                    />
                    <FormikContainer perRow={2} label={'대표자'} name={'representative_name'} readOnly required/>
                    <FormikContainer type={'address'} perRow={1} label={'주소'} name={'address'} required commonStore={commonStore}/>
                    <FormikContainer perRow={2} label={'업태'} name={'business_type'} required/>
                    <FormikContainer perRow={2} label={'종목'} name={'industry'} required/>
                    <FormikContainer perRow={2} type={'file'} label={'사업자등록증 파일'} name={'business_registration_files'}/>
                    <FormikContainer perRow={2} label={'세금계산서 메일'} name={'tax_invoice_email'} required/>
                </Row>
                <Row className='table marginTop'>
                    <div className="table_title">추가 정보</div>
                    <FormikContainer perRow={1} label={'사업자명(내부)'} name={'business_name_internal'} required/>
                    <FormikContainer type={'select'} perRow={2} label={'판매구분'} placeholder={'판매구분'} name={'sales_classification'} style={{width: '100%'}} required 
                        data={{
                            mode : 'tags',
                            options : [
                                {value:1, label:'총판'}, 
                                {value:2, label:'도매'}, 
                                {value:3, label:'소매'}, 
                                {value:4, label:'대학'}, 
                                {value:5, label:'학원'}, 
                                {value:6, label:'전문점'}, 
                                {value:7, label:'ELT'}, 
                                {value:8, label:'기타'}, 
                            ]
                        }}
                    />
                    <FormikContainer perRow={2} label={'지역'} name={'region'}/>
                    <FormikContainer type={'address'} perRow={1} label={'배송지 주소'} name={'shipping_address'} readOnly required  commonStore={commonStore}/>
                    <FormikContainer perRow={2} label={'대표 전화번호'} name={'main_phone_number'}/>
                    <FormikContainer perRow={2} label={'영업 담당자'} name={'sales_managers'} readOnly type={'etc'}>
                        <FormikInput type={'select'} placeholder={'영업 담당자'} name={'sales_managers'} style={{width: '100%'}}
                            data={{
                                mode            : 'multiple',
                                allowClear      : true, 
                                value           : 'id',
                                label           : 'name',
                                optionApiUrl    : '/sales-managers',
                                optionsApiValue : 'user_id', 
                                optionsApiLabel : 'user_name'
                            }}
                        />
                    </FormikContainer>
                    <FormikContainer type={'etc'} perRow={1} label={'업체 담당자'} name={'business_contacts'}>
                        <FieldArray name={'business_contacts'} render={(arrayHelpers) => (
                            <Input.Group>
                                { props.values && props.values.business_contacts && props.values.business_contacts.length > 0 && (
                                    props.values.business_contacts.map((member, index) => (
                                        <Row key={index}>
                                            <Col span={4} style={{padding: '0 10px 10px 0'}}><FormikInput name={`business_contacts.${index}.name`} placeholder="성명" /></Col>
                                            <Col span={4} style={{padding: '0 10px 10px 0'}}><FormikInput name={`business_contacts.${index}.company_phone_number`} placeholder="회사 전화번호" /></Col>
                                            <Col span={4} style={{padding: '0 10px 10px 0'}}><FormikInput name={`business_contacts.${index}.phone_number`} placeholder="휴대폰 번호" /></Col>
                                            <Col span={6} style={{padding: '0 10px 10px 0'}}><FormikInput name={`business_contacts.${index}.email`} placeholder='이메일'/></Col>
                                            <Col span={5} style={{padding: '0 10px 10px 0'}}><FormikInput name={`business_contacts.${index}.note`} placeholder='참고 사항'/></Col>
                                            <Col span={1} style={{padding: '0 10px 10px 0'}}><Button type="default" shape="circle" onClick={()=> arrayHelpers.remove(index)}>-</Button></Col>
                                        </Row>
                                    ))
                                )}
                                <NewBusinessContacts arrayHelpers={arrayHelpers} {...props}/>
                            </Input.Group>
                        )}/>
                    </FormikContainer>
                    <FormikContainer perRow={2} label={'거래처 그룹'} name={'account_groups'} readOnly type={'etc'}>
                        <FormikInput type={'select'} placeholder={'거래처 그룹'} name={'account_groups'} style={{width: '100%'}}
                            data={{
                                mode            : 'multiple',
                                allowClear      : true, 
                                value           : 'id',
                                label           : 'name',
                                optionApiUrl    : '/sales-account-groups',
                                optionsApiValue : 'id', 
                                optionsApiLabel : 'name'
                            }}
                        />
                    </FormikContainer>
                    <FormikContainer perRow={2} label={'등록일'} name={'created_at'} readOnly/>
                    <FormikContainer type={'textarea'} perRow={1} label={'참고 사항'} name={'note'} readOnly/>
                </Row>

                <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                    <Col>
                        <Button onClick={props.handleSubmit} type="primary submit" htmlType="button">확인</Button>
                        <Button onClick={drawerClose} htmlType="button" style={{marginLeft:'10px'}}>취소</Button>
                    </Col>
                </Row>
            </Form>
            )}
        </Formik>
    )
}

export default inject('commonStore')(observer(BusinessInfo))