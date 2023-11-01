import React, { useState } from 'react';
import { Row, Col, Button, Drawer, Modal } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import { Form, Formik } from 'formik';
import { FormikContainer, FormikInput } from '@components/form/CustomInput'
import moment from 'moment';

import Grid from './grid';

const { confirm } = Modal;

const index = observer(({ drawerVisible, drawerClose }) =>{
    const [formikFieldDefault, setFormikFieldDefault] = React.useState({
        returnDate: moment(),
        receivingDate: moment(),
        processingDate: moment(),
        returnReceivingDate: moment(),
        company: '',
        accountName: '',
        accountCode: '',
        branchName: '',
        branchCode: '',
        ref: '',
    });

    const state = useLocalStore(() => ({
        isRender: false,
        tab: 'info',
        drawerback : 'drawerWrap', //drawer class name
        idx: '',
    }));

    const [modalVisible, setModalVisible] = useState(false);
    const modalOpen = () => setModalVisible(true);
    const modalClose = () => setModalVisible(false);

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

    return(
        <Drawer
            title='반품 입고'
            placement='right'
            onClose={drawerClose}
            visible={drawerVisible}
            className={state.drawerback}
            closable={false}
            keyboard={false}
            extra={
                <>
                    <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                        {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                    </Button>
                    <Button onClick={drawerClose}>
                        <CloseOutlined />
                    </Button>
                </>
            }
        >   
            <Formik
                enableReinitialize={true} 
                initialValues={formikFieldDefault}
                onSubmit = {(values) => {
                    console.log(values)
                }}
            >
                {(props)=>(
                    <Form >
                        <Row className="table">
                            <FormikContainer type={'datepicker'} perRow={3} label={'거래처 반품일'} name={'returnDate'} required dateValue={formikFieldDefault.returnDate}/>
                            <FormikContainer type={'datepicker'} perRow={3} label={'입고일'} name={'receivingDate'} required dateValue={formikFieldDefault.receivingDate}/>
                            <FormikContainer type={'datepicker'} perRow={3} label={'라임북 처리일'} name={'processingDate'} required dateValue={formikFieldDefault.processingDate}/>
                            <FormikContainer type={'datepicker'} perRow={3} label={'반품 입고일'} name={'returnReceivingDate'} required dateValue={formikFieldDefault.returnReceivingDate}/>
                            <FormikContainer type={'etc'} perRow={3} label={'처리자'} >홍길동</FormikContainer>

                            <FormikContainer type={'radio'} perRow={3} label={'회사'} name={'company'} required 
                                data={{
                                    radioData : [{
                                        label : '도서출판 길벗', 
                                        value: 1
                                    }, {
                                        label : '길벗스쿨',
                                        value : 2
                                    }]
                                }}
                            />

                            <FormikContainer type={'input'} perRow={2} label={'거래처(본점)'} name={'accountName'} style={{width: 'calc(35% - 5px)', marginRight: '5px'}} required
                                extraCompo={
                                    <FormikInput type={'select'}  name={'accountCode'} style={{width: '65%'}}
                                        data={{
                                            mode : 'tags',
                                            options : [
                                                {value:1, label:'1'}, 
                                                {value:2, label:'2'}, 
                                            ]
                                        }}
                                    />
                                }
                            />
                            <FormikContainer type={'input'} perRow={2} label={'지점'} name={'branchName'} style={{width: 'calc(35% - 5px)', marginRight: '5px'}} 
                                extraCompo={
                                    <FormikInput type={'select'}  name={'branchCode'} style={{width: '65%'}}
                                        data={{
                                            mode : 'tags',
                                            options : [
                                                {value:1, label:'1'}, 
                                                {value:2, label:'2'}, 
                                            ]
                                        }}
                                    />
                                }
                            />
                            <FormikContainer type={'input'} perRow={1} label={'비고'} name={'note'} style={{width: '100%'}} />
                        </Row>

                        <Grid />

                        <Row className='table marginUD'>
                            <FormikContainer type={'textarea'} perRow={1} label={'참고 사항'} name={'ref'} />
                            <FormikContainer type={'etc'} perRow={2} label={'수정 일시'}>2023.05.15  10:21</FormikContainer>
                            <FormikContainer type={'etc'} perRow={2} label={'수정자'}>홍길동</FormikContainer>
                        </Row>

                        <Row gutter={[10, 10]} justify='center'>
                            <Button type='primary button' onClick={modalOpen}>확인</Button>
                            <Button type='button' style={{margin: '0 10px'}}>취소</Button>
                        </Row>

                        <Modal
                            className='modalTest'
                            visible={modalVisible}
                            title={<div><span className='redTxt'>'출고 중단' 상태</span>의 거래처입니다.</div>}
                            onCancel={modalClose}
                            footer={[
                            <Button type="primary button" >
                                확인
                            </Button>,
                            <Button type='button' onClick={modalClose}>
                                취소
                            </Button>,
                            ]}
                        >
                            <div>- 중단 기간: 2023-08-01 ~ 2023-09-30</div>
                            <div>- 사유: 사유입니다.</div>
                            <div style={{marginTop: 10, textAlign: 'center', fontWeight: 'bold'}}>
                                무시하고 출고 하시겠습니까?
                            </div>
                        </Modal>

                    </Form>
                )}
            </Formik>
        </Drawer>
    );
});

export default index;