import React from 'react'
import { Row, Col, Button, Modal } from 'antd';
import { inject, observer } from 'mobx-react';
import { Form, Formik, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import { FormikContainer } from '@components/form/CustomInput'
import { isEmpty } from '@components/Common/Js';
import BookDrawer from './bookDrawer'

const TradeInfo = ({ commonStore, data, drawerClose }) => {
    const [bookDrawer, setBookDrawer] = React.useState(false);
    const bookDrawerOpen = () => setBookDrawer(true)
    const bookDrawerClose = () => setBookDrawer(false)

    const formikFieldDefault1 = {
        policy_group_id : '',
        buyout_yn   : 'Y',
        newbook_yn  : 'Y',
    }
    const formikFieldDefault2 = {
        policy_group_id : '',
        buyout_yn   : 'Y',
        newbook_yn  : 'Y',
    }
    
    const validationSchema = Yup.object({
        policy_group_id : Yup.string().label("거래 정책 그룹").required(), 
    })
    
    React.useEffect(() => {
        fetchData()
    }, [])

    const fetchData = () => {
        if (data?.accountId) {
            commonStore.handleApi({
                url : `/sales-account-trading-policies/${data?.accountId}`,
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
    }

    const formikHook1 = useFormik({
        initialValues : formikFieldDefault1,
        onSubmit : () => true, 
        validationSchema, 
    })

    const formikHook2 = useFormik({
        initialValues : formikFieldDefault2,
        onSubmit : () => true,
        validationSchema : validationSchema,
    })

    // 2개 form을 validation 후 api sending
    const onSubmit = async () => {
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
                url : `/sales-account-trading-policies/${data.accountId}`,
                data : returnValues
            })
            .then((result) => {
                Modal.success({
                    content: '수정이 완료되었습니다.',
                })
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

    return (
    <>
        {data.targetCompany.map((targetCompanyId) => (
            <FormikProvider key={targetCompanyId} value={mappingHook[targetCompanyId].formik}>
                <Form>
                    <Row className='table marginTop'>
                        <div className="table_title">{mappingHook[targetCompanyId].name}</div>

                        <FormikContainer perRow={1} label={'거래 정책 그룹'} type={'select'} name={'policy_group_id'} placeholder = {'거래 정책 그룹을 선택하세요'}
                            data={{
                                mode            : 'tags',
                                value           : 'id',
                                label           : 'name',
                                optionApiUrl    : '/sales-transaction-policy-groups', 
                                optionsApiValue : 'id', 
                                optionsApiLabel : 'name'
                            }}

                            style={{width: 'calc(100% - 155px)', marginRight: 10}} 
                            extraCompo={<Button style={{flex:1}} type='primary' onClick={bookDrawerOpen}>도서별 설정</Button>}
                        />

                        <FormikContainer perRow={2} label={'매절 가능 여부'} type={'radio'} name={'buyout_yn'} 
                            data={{
                                radioData : [{
                                    label : '예', 
                                    value: 'Y'
                                }, {
                                    label : '아니오',
                                    value : 'N',
                                }]
                            }}
                        />

                        <FormikContainer perRow={2} label={'신간 배본 여부'} type={'radio'} name={'newbook_yn'} 
                            data={{
                                radioData : [{
                                    label : '예', 
                                    value: 'Y'
                                }, {
                                    label : '아니오',
                                    value : 'N',
                                }]
                            }}
                        />
                    </Row>
                </Form>
            </FormikProvider>
        ))}

        <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
            <Col>
                <Button onClick={onSubmit} type="primary" htmlType="button" >확인</Button>
                <Button onClick={drawerClose} htmlType="button" style={{marginLeft:'10px'}}>취소</Button>
            </Col>
        </Row>

        {bookDrawer && 
            <BookDrawer 
                companyData={data?.targetCompany}
                rowData={data?.accountId}
                visible={bookDrawer}
                onClose={bookDrawerClose}
            />
        }
    </>
    )
}

export default inject('commonStore')(observer(TradeInfo))