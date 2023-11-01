/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useEffect, useState } from 'react';
import { Row, Button, Modal } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import useStore from '@stores/useStore';

import { Form, Formik } from 'formik';
import { FormikContainer, FormikInput } from '@components/form/CustomInput';
import moment from 'moment';

import Popout from '@components/Common/popout/popout';
import ContractViewDrawer from '@pages/Contract/view';


const CopyrightDrawer = observer(( prop ) => {
    const { commonStore } = useStore();
    const [formikFieldDefault, setFormikFieldDefault] = useState({
        name: null,
        type: null,
        copyrightHolder: null,
        intermediary: null,
        sales_amount: null,
        copyright_calculation_yn: 1,
    });

    const state = useLocalStore(() => ({
        type: '',
        idx: '',
    }));

    const [visible, setVisible] = useState(false);
    const viewOpen = () => setVisible(true);
    const viewClose = () => setVisible(false);
        

    const [popout, setPopoutOpen] = useState(false);
    const closeWindowPortal = () => {
        setPopoutOpen(false);
    };

    useEffect(() => { 
        if(prop?.viewData?.contractable){
            const temp ={}
            Object.keys(formikFieldDefault).forEach(key=>{
                temp[key] = toJS(prop.viewData.contractable[key])
            })
            console.log('viewCopyright',temp)
            setFormikFieldDefault(temp)
        }
    }, []);

    const handleSubmit = (data) =>{
        commonStore.handleApi({
            url: `/products/${prop.viewData.id}/contract`,
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
                const key_list = ['sales_amount','standard_product_id','copyright_calculation_yn']
                const submitData = {}
                key_list.map(key=>{submitData[key] = values[key]})
                if(submitData.sales_amount.includes('Y')){
                    submitData.sales_amount = 'Y'
                }else{
                    submitData.sales_amount = 'N'
                }

                console.log(submitData)
                // handleSubmit(submitData) //api 작업중이므로 submit 막아둠
            }}
        >
            {(props)=>(
                <Form >
                    <Row className="table search_table">
                        <FormikContainer type={'etc'} perRow={2} label={'저작권 계약명'} name={'name'}>
                            <button className='btnLink title' onClick={viewOpen} style={{textDecoration: 'none'}}>저작권 계약명입니다.</button>
                            <div id="tplBtnViewMode" style={{display: 'block'}}>
                                <div className="btnLayoutWrap">
                                    <button id="btnNew" className="btn-layout ant-btn ant-btn-circle" onClick={()=>setPopoutOpen(true)}>N</button>
                                </div>
                            </div>
                        </FormikContainer>
                        <FormikContainer type={'etc'} perRow={2} label={'저작권 구분'} name={'type'} >{props.values.type==='K'?'국내':props.values.type==='I'?'해외수입':''}</FormikContainer>
                        <FormikContainer type={'etc'} perRow={2} label={'저작권자/권리자'} name={'copyrightHolder'} />
                        <FormikContainer type={'etc'} perRow={2} label={'중개자'} name={'intermediary'} />
                        <FormikContainer type={'checkbox'} perRow={2} label={'판매량 합산'} name={'sales_amount'}
                            data = {{
                                checkboxData : [{
                                    label : '적용',
                                    value: 'Y'
                                }]
                            }}
                            extraCompo={
                                props.values.sales_amount && props.values.sales_amount.includes('Y') ? (
                                    <FormikInput type={'select'}  name={'standard_product_id'} style={{width: 'calc(100% - 70px)'}} placeholder='기준 상품 선택'
                                        data={{
                                            mode            : 'tags',
                                            allowClear      : true, 
                                            value           : 'id',
                                            label           : 'name',
                                            optionApiUrl    : '/product-search?company='+prop.viewData.contractable.company,
                                            optionsApiValue : 'id', 
                                            optionsApiLabel : 'name'
                                        }}
                                    />
                                ) : ''
                            }
                        />

                        <FormikContainer type={'radio'} perRow={2} label={'저작권 정산 여부'} name={'copyright_calculation_yn'}
                            data = {{
                                radioData : [{
                                    label : '예',
                                    value: 'Y'
                                }, {
                                    label : '아니오(저작권 정산 시 제외하고 계산 및 지급)',
                                    value : 'N',
                                }]
                            }}
                        />
                    </Row>

                    <Row justify='center' style={{margin: 30}}>
                        <Button type='primary submit' onClick={props.handleSubmit} >확인</Button>
                        <Button type='button' style={{marginLeft: 10}}>취소</Button>
                    </Row>

                    {visible === true && (
                        <ContractViewDrawer
                            idx={state.idx}
                            type={state.type}
                            viewVisible={visible}
                            popoutChk='N'
                            drawerChk='Y'
                            viewOnClose={viewClose}
                        />
                    )}

                    {popout && (
                        <Popout closeWindowPortal={closeWindowPortal}>
                            <ContractViewDrawer
                                idx={state.idx}
                                type={state.type}
                                popoutClose={closeWindowPortal}
                                popoutChk="Y"
                                viewOnClose={viewClose}
                            />
                        </Popout>
                    )}

                </Form>
            )}
        </Formik>
    );
});

export default CopyrightDrawer;