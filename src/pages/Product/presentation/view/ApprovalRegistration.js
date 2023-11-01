import React, { useCallback, useEffect, useState } from 'react';
import {Row, Col, Drawer, Button } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import { Form, Formik } from 'formik';
import { FormikContainer } from '@components/form/CustomInput'
import * as Yup from 'yup';
import useStore from '@stores/useStore';

import styled from 'styled-components';

const Wrapper = styled.div`
    width: 100%;
`;

const ApprovalRegistration = observer(({visible , visibleClose, drawerChk, idx}) =>{
    const { commonStore } = useStore();
    const [formikFieldDefault, setFormikFieldDefault] = useState({
        approval_result: '',
        remark: '',
    });

    const validationSchema = Yup.object().shape({
        approval_result :      Yup.string().label("결재").required(),
    });
    const state = useLocalStore(() => ({
        drawerback: 'drawerWrap',
    }));

    useEffect(() => {
        if(drawerChk !== 'Y'){
            state.drawerback = 'drawerWrap'
        }        
    }, [drawerChk]);

    const onClose=()=>{
        visibleClose();
    }

    const handleApiSubmit = useCallback(async (data)=> {

        console.log('submit',idx,data)

        if(idx){
            commonStore.handleApi({
                url : '/product-presentation-approvals/'+idx,
                method:'PUT',
                data:data
            })
            .then((result) => {
                console.log('res',result)
                onClose()
            })
        }
    }, []);     

    const [ drawerExtended, setDrawerExtended ] = useState(false);
    const drawerSizeHandler = () => {
        if(drawerExtended){
            setDrawerExtended(false);
            state.drawerback = 'drawerWrap';
            
        } else {
            setDrawerExtended(true);
            state.drawerback = 'drawerback drawerWrap';
        }
    }

    return (
        <Wrapper>
            <Drawer
                title='결재 등록'
                visible={visible}
                onClose={visibleClose}
                className={state.drawerback}
                closable={false}
                keyboard={false}
                extra={
                    <>
                        <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={visibleClose}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >
                <Formik 
                    enableReinitialize={true} 
                    initialValues={formikFieldDefault}
                    validationSchema={validationSchema}
                    onSubmit = {(values) => {
                        console.log('submit check')
                        handleApiSubmit(values)
                    }}
                >
                {(props) => (
                    <Form>
                        <Row gutter={10} className="table">
                                <FormikContainer perRow={1} type={'radio'} label={'결재'} name={'approval_result'} required
                                    data={{
                                        radioData : [{
                                            label : '승인', 
                                            value: 1
                                        }, {
                                            label : '반려',
                                            value : 2,
                                        }]
                                    }}
                                />
                                <FormikContainer perRow={1} type={'textarea'} label={'검토 의견'} name={'remark'} />
                        </Row>
                        <Row style={{marginTop: 10}}>
                            <Col xs={24} lg={24} style={{textAlign: 'center'}} ><Button type="primary submit" 
                                onClick={(e)=>{
                                    console.log('onsubmit',props.values)
                                    props.handleSubmit()
                                }}
                            >확인</Button></Col>
                        </Row>
                    </Form>
                )}
            </Formik>
            </Drawer>
        </Wrapper>
    )
})

export default ApprovalRegistration;