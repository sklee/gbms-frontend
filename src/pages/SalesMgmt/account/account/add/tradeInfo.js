import React from 'react'
import { Row, Col, Button, Modal, } from 'antd';
import moment from 'moment';
import { Form, Formik } from 'formik';
import { FormikContainer } from '@components/form/CustomInput'
import * as Yup from 'yup';
import { inject, observer } from 'mobx-react';

const TradeInfo = ({ commonStore, data, drawerClose }, props ) => {
    const [formikFieldDefault, setFormikFieldDefault] = React.useState({
        account_code : '',
        account_code1 : '',
        account_code2 : '',
        trading_status : '1',
        trading_start_date : '',
        trade_end_date : '',
        trading_target_company : [],
        trade_product_type : [], 
        logistics_code : '',
        default_shipping_method : ''
    })
    
    const validationSchema =    Yup.object().shape({
        trading_status :        Yup.string().label("거래 상태").required(),
        trading_start_date :    Yup.string().label("거래 시작일"),
        trade_end_date :        Yup.string().label("거래 종료일"),
        trading_target_company :Yup.array().label("거래 대상 회사").min(1).required(), 
        trade_product_type :    Yup.array().label("거래 상품 종류").min(1).required(), 
        logistics_code :        Yup.string().label("물류 코드").nullable(), 
        default_shipping_method:Yup.string().label("기본 배송 방법").nullable(), 
    })

    React.useEffect(() => {
        fetchData()
    }, [])

    const fetchData = React.useCallback(() => {
        if (data?.accountId) {
            commonStore.handleApi({
                url : `/sales-account-trading-infos/${data.accountId}`,
            })
            .then((result) => {
                // 전달된 값 중 필요없는 거 제거 (UPDATE에 영향을 줄 수 있으므로)
                let deleteKeyList = ['id']
                deleteKeyList.map((item) => {
                    delete result.data[item]
                })

                if (result.data.trading_start_date == '0000-00-00') result.data.trading_start_date = null
                if (result.data.trade_end_date     == '0000-00-00') result.data.trade_end_date = null

                // radio 기본값 구성
                result.data.trading_status = result.data.trading_status ? result.data.trading_status : formikFieldDefault.trading_status
                // date Type으로 변경
                result.data.trading_start_date = result.data.trading_start_date ? moment(result.data.trading_start_date) : formikFieldDefault.trading_start_date
                result.data.trade_end_date     = result.data.trade_end_date     ? moment(result.data.trade_end_date)     : formikFieldDefault.trade_end_date

                setFormikFieldDefault(result.data)
            })
        }
    }, [data])

    const onSubmit = React.useCallback((formData) => {
        // datejs > string
        // 아니면 API가 못 받는다. 
        formData.trading_start_date = moment(formData.trading_start_date).format('YYYY-MM-DD')
        formData.trade_end_date = moment(formData.trade_end_date).format('YYYY-MM-DD')

        commonStore.handleApi({
            method : 'POST',
            url : `/sales-account-trading-infos/${data.accountId}`,
            data : formData
        })
        .then((result) => {
            // 원래 형식으로 재변환
            // 안하면 터진다.
            formData.trading_start_date = moment(formData.trading_start_date)
            formData.trade_end_date = moment(formData.trade_end_date)
            data.setTargetCompany(formData.trading_target_company)
            Modal.success({
                content: '수정이 완료되었습니다.',
            })
        })
    })

    const makeAccountCode = (type) => {
        let resultAccountCode = commonStore.handleApi({
            method : 'PUT',
            // url : `/sales-account-trading-infos/${data?.accountId}`,
            url : `/sales-account-code/${data?.accountId}`,
            data : {'account_code_target' : [type]}
        })
        .then((result) => {
            if (type == 'G') {
                return result.account_code1
            }
            else if (type == 'S') {
                return result.account_code2
            }
        })

        return resultAccountCode
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
                <Row className='table'>
                    <FormikContainer type={'etc'} perRow={2} label={'거래처 코드(내부)'} name={'account_codes'} readOnly required>
                        <>
                            {props.values.account_code}
                        </>
                    </FormikContainer>
                    <FormikContainer type={'etc'} perRow={2} label={'거래처 코드(회계)'} readOnly required>
                        <Row style={{alignItems:'center'}}>
                            <div>
                                도서출판 길벗
                            </div>
                            <div style={{marginLeft: 5, marginRight: 5, fontWeight: 500}}>
                                {props.values.account_code1 ? 
                                    props.values.account_code1
                                    :
                                    <Button type='primary' onClick={async () => { props.setFieldValue('account_code1', await makeAccountCode('G')) }}>생성</Button>
                                }
                            </div>
                            <div>
                                길벗스쿨
                            </div>
                            <div style={{marginLeft: 5, marginRight: 5, fontWeight: 500}}>
                                {props.values.account_code2 ? 
                                    props.values.account_code2
                                    :
                                    <Button type='primary' onClick={async () => { props.setFieldValue('account_code2', await makeAccountCode('S')) }}>생성</Button>
                                }
                            </div>
                        </Row>
                    </FormikContainer>

                    <FormikContainer type={'radio'} perRow={1} label={'거래 상태'} name={'trading_status'} readOnly required 
                        onChange={() => {
                            props.values.trading_status == 1 && props.setFieldValue('trading_start_date', '')
                        }}
                        data={{
                            radioData : [{
                                label : '거래 중', 
                                value : '1'
                            },
                            {
                                label : '거래 중단', 
                                value : '2'
                            },
                            {
                                label : '기타', 
                                value : '3'
                            }]
                        }}
                    />
                    <FormikContainer type={'datepicker'} perRow={2} label={'거래 시작일'} name={'trading_start_date'} required={props.values.trading_status == 2 ? true : false}/>
                    <FormikContainer type={'datepicker'} perRow={2} label={'거래 종료일'} name={'trade_end_date'}/>

                    <FormikContainer type={'checkbox'} perRow={1} label={'거래 대상 회사'} name={'trading_target_company'} readOnly required
                        data={{
                            checkboxData : [{
                                label : '도서출판 길벗', 
                                value : 1
                            },{
                                label : '길벗스쿨', 
                                value : 2
                            },]
                        }}
                    />
                    <FormikContainer type={'checkbox'} perRow={1} label={'거래 상품 종류'} name={'trade_product_type'} readOnly required
                        onChange = {(value) => {console.log(value)}}
                        data={{
                            checkboxData : [{
                                label : '종이책', 
                                value : 1
                            },{
                                label : '전자책', 
                                value : 2
                            },{
                                label : '오디오북', 
                                value : 3
                            },{
                                label : '동영상 강좌', 
                                value : 4
                            },{
                                label : '기타 2차 저작물', 
                                value : 5
                            },{
                                label : '판매용 일반 제품', 
                                value : 6
                            },]
                        }}
                    />
                    <FormikContainer perRow={1} label={'물류 코드'} name={'logistics_code'} 
                        required = {props.values.trade_product_type && props.values.trade_product_type !== undefined && props.values.trade_product_type.length != 0 && (props.values.trade_product_type.includes(1) || props.values.trade_product_type.includes(6)) ? true : false}
                        disabled = {props.values.trade_product_type && props.values.trade_product_type !== undefined && props.values.trade_product_type.length != 0 && (props.values.trade_product_type.includes(1) || props.values.trade_product_type.includes(6)) ? false : true} 
                    />
                    <FormikContainer type={'radio'} perRow={1} label={'기본 배송 방법'} name={'default_shipping_method'}
                        required = {props.values.trade_product_type && props.values.trade_product_type !== undefined && props.values.trade_product_type.length != 0 && (props.values.trade_product_type.includes(1) || props.values.trade_product_type.includes(6)) ? true : false}
                        disabled = {props.values.trade_product_type && props.values.trade_product_type !== undefined && props.values.trade_product_type.length != 0 && (props.values.trade_product_type.includes(1) || props.values.trade_product_type.includes(6)) ? false : true}
                        data={{
                            // 1:시내, 2:지방, 3:화물, 4:택배, 5:택배/퀵, 6:기타
                            radioData : [{
                                label : '시내', 
                                value : '1'
                            }, {
                                label : '지방',
                                value : '2'
                            }, {
                                label : '화물',
                                value : '3'
                            }, {
                                label : '택배',
                                value : '4',
                            }, {
                                label : '택배/퀵', 
                                value : '5',
                            }, {
                                label : '기타', 
                                value : '6',
                            }]
                        }}
                    />
                </Row>
                <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                    <Col>
                        <Button onClick={props.handleSubmit} type="primary" htmlType="button">확인</Button>
                        <Button onClick={drawerClose} htmlType="button" style={{marginLeft:'10px'}}>취소</Button>
                    </Col>
                </Row>
            </Form>
            )}
        </Formik>
    )
}

export default inject('commonStore')(observer(TradeInfo))