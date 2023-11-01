/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useEffect, useState } from 'react';
import { Row, Button, Modal } from 'antd';
import { toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import useStore from '@stores/useStore';

import { Form, Formik } from 'formik';
import { FormikContainer, FormikInput } from '@components/form/CustomInput'
import moment from 'moment';


const DistributeDrawer = ( props ) => {
    const { commonStore } = useStore();
    const [formikFieldDefault, setFormikFieldDefault] = useState({
        name: null,
        internal_name: null,
        groups : [],
        added_to_trading_policy_yn : null,
        order_scm_visibility: null,
        release_status : null,
        release_date: null,
        shipping_status : null,
        shipping_date: null,
        shipping_discontinuation_reason : null,
        returnable : null,
        returnable_date: null,
        return_discontinuation_reason : null,
    });
    const toDate = moment().format('YYYY-MM-DD')

    useEffect(() => { 
        if(props?.viewData?.distribution){
            const temp ={}
            Object.keys(formikFieldDefault).forEach(key=>{
                if(key==='release_date' || key==='shipping_date' || key==='returnable_date' ){
                    temp[key] = moment(toJS(props.viewData.distribution[key]??''))
                }else if(key==='groups'){
                    temp[key] = props.viewData.distribution.groups.map(e=>e.id)
                }else{
                    temp[key] = toJS(props.viewData.distribution[key])
                }
            })
            temp.name = props.viewData.name
            temp.internal_name = props.viewData.internal_name
            if(!temp.internal_name && temp.name){
                temp.internal_name = temp.name
            }
            setFormikFieldDefault(temp)
        }
    }, []);

    const handleSubmit = (data) =>{
        commonStore.handleApi({
            url: `/products/${props.viewData.id}/distribution`,
            method: 'PUT',
            data:data
        }).then((result)=>{
            Modal.success({
                content: '저장 되었습니다.',
                onOk() {

                },
            })
        })
    }

    return (
        <Formik
            enableReinitialize={true} 
            initialValues={formikFieldDefault}
            onSubmit = {(values) => {
                const submitData = values
                if(submitData.added_to_trading_policy_yn.includes('Y')){
                    submitData.added_to_trading_policy_yn = 'Y'
                }else{
                    submitData.added_to_trading_policy_yn = 'N'
                }
                if(submitData.release_date)submitData.release_date = moment(submitData.release_date).format('YYYY-MM-DD')
                if(submitData.returnable_date)submitData.returnable_date = moment(submitData.returnable_date).format('YYYY-MM-DD')
                if(submitData.shipping_date)submitData.shipping_date = moment(submitData.shipping_date).format('YYYY-MM-DD')
                handleSubmit(submitData)
            }}
        >
            {(props)=>(
                <Form >
                    <Row className="table search_table">
                        <FormikContainer type={'etc'} perRow={1} label={'상품명(공식)'} name={'name'} >{props.values.name}</FormikContainer>
                        <FormikContainer type={'input'} perRow={1} label={'상품명(내부용)'} name={'internal_name'} required/>
                        <FormikContainer type={'select'} perRow={1} label={'상품 그룹'} name={'groups'} style={{width: '100%'}}
                            data={{
                                mode            : 'multiple',
                                allowClear      : true, 
                                value           : 'id',
                                label           : 'name',
                                optionApiUrl    : '/sales-product-groups',
                                optionsApiValue : 'id', 
                                optionsApiLabel : 'name'
                            }}
                        />
                        <FormikContainer type={'checkbox'} perRow={1} label={'거래 정책에 추가'} name={'added_to_trading_policy_yn'}
                            data = {{
                                checkboxData : [{
                                    label : `추가(추가하면 ‘거래 정책 그룹'의 “상품별 정책"에 반영됨)`,
                                    value: 'Y'
                                }]
                            }}
                        />
                        <FormikContainer type={'radio'} perRow={1} label={'주문 SCM 노출'} name={'order_scm_visibility'}
                            data = {{
                                radioData : [{
                                    label : '노출(거래처별 정책에 따라 최종 노출 여부 다름)', 
                                    value: 1
                                }, {
                                    label : '숨김',
                                    value : 2,
                                }]
                            }}
                        />
                        <FormikContainer type={'radio'} perRow={1} label={'출시 상태'} name={'release_status'}
                            data = {{
                                radioData : [{
                                    label : '상품 코드 발급', 
                                    value: 1
                                }, {
                                    label : (props.values.release_status == 2 ? (
                                        props.values.release_date == null ? (
                                                    <>출시/출간 (출시일: <FormikInput type={'datepicker'} name={'release_date'}/>)</>
                                                ) : (
                                                    <>출시/출간(출시일: {props.values.release_date.format('YYYY-MM-DD')})<Button shape="circle" className="btn_del" 
                                                    onClick={() => {props.setFieldValue('release_date',null)}}>X</Button></>
                                                )
                                            ) : '출시/출간'),
                                    value : 2,
                                }, {
                                    label : (props.values.release_status == 3 ? `출시/출간 취소(설정일: ${toDate})` : '출시/출간 취소'),
                                    value : 3,
                                }, {
                                    label : (props.values.release_status == 4 ? `단종/절판(설정일: ${toDate})` : '단종/절판'),
                                    value : 4,
                                }]
                            }}
                        />
                        <FormikContainer type={'radio'} perRow={1} label={'출고 상태'} name={'shipping_status'}
                            data = {{
                                radioData : [{
                                    label : '최초 입고 전', 
                                    value: 1
                                }, {
                                    label : '가능',
                                    value : 2,
                                }, {
                                    label : '중단(재고 부족)',
                                    value : 3,
                                }, {
                                    label : (props.values.shipping_status == 4 ? (
                                        props.values.shipping_date == null ? (
                                            <>
                                                중단 (해제일: <FormikInput type={'datepicker'} name={'shipping_date'}/>)
                                            </>
                                        ) : (
                                            <>
                                                중단(설정일: {toDate}) / 해제 예정일: {props.values.shipping_date.format('YYYY-MM-DD')}
                                                <Button shape="circle" className="btn_del" 
                                                    onClick={(e) => {props.setFieldValue('shipping_date',null)}}
                                                >X</Button>
                                            </> 
                                        )
                                    ) : '중단(자동 해제)'),
                                    value : 4,
                                }, {
                                    label : (props.values.shipping_status == 5 ? `중단(설정일: ${toDate})` : '중단(수동 해제)'),
                                    value : 5,
                                }]
                            }}
                        />
                        <FormikContainer type={'input'} perRow={1} label={'출고 중단 사유'} name={'shipping_discontinuation_reason'}/>
                        <FormikContainer type={'radio'} perRow={1} label={'반품 가능 여부'} name={'returnable'}
                            data = {{
                                radioData : [{
                                    label : '최초 입고 전', 
                                    value: 1
                                }, {
                                    label : '가능',
                                    value : 2,
                                }, {
                                    label : (props.values.returnable == 3 ? (
                                        props.values.returnable_date == null ? (
                                            <>
                                                중단 (해제일: <FormikInput type={'datepicker'} name={'returnable_date'}/>)
                                            </>
                                        ) : (
                                            <>
                                                중단(설정일: {toDate}) / 해제 예정일: {props.values.returnable_date.format('YYYY-MM-DD')}
                                                <Button shape="circle" className="btn_del" 
                                                    onClick={(e) => {props.setFieldValue('returnable_date',null)}}
                                                >X</Button>
                                            </> 
                                        )
                                    ) : '중단(자동 해제)'),
                                    value : 3,
                                }, {
                                    label : (props.values.returnable == 4 ? `중단(설정일: ${toDate})` : '중단(수동 해제)'),
                                    value : 4,
                                }]
                            }}
                        />
                        <FormikContainer type={'input'} perRow={1} label={'반품 중단 사유'} name={'return_discontinuation_reason'}/>
                    </Row>
                    <Row justify='center' style={{margin: 30}}>
                        <Button type='primary submit' onClick={props.handleSubmit} >확인</Button>
                        <Button type='button' style={{marginLeft: 10}}>취소</Button>
                    </Row>
                </Form>
            )}
        </Formik>
    );
};

export default observer(DistributeDrawer);