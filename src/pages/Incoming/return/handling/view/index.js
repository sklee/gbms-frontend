import React, { useState } from 'react';
import { Row, Button, Drawer, Modal } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import { Form, Formik } from 'formik';
import { FormikContainer, FormikInput } from '@components/form/CustomInput'
import moment from 'moment';

import Grid from './grid';

const index = observer(({ drawerVisible, drawerClose }) =>{
    const [formikFieldDefault, setFormikFieldDefault] = React.useState({
        returnDate: moment(),
        receivingDate: moment(),
        processingDate: moment(),
        returnReceivingDate: moment(),
        ref: '',
    });

    const state = useLocalStore(() => ({
        isRender: false,
        tab: 'info',
        drawerback : 'drawerWrap', //drawer class name
        idx: '',
    }));

    const showModal = () => {
        Modal.confirm({
            title: '삭제하면 되돌릴 수 없습니다. 계속하시겠습니까?',
            onOk() {
                console.log('OK');
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

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
                            <FormikContainer type={'datepicker'} perRow={3} label={'거래처 반품일'} name={'returnDate'} dateValue={formikFieldDefault.returnDate}/>
                            <FormikContainer type={'datepicker'} perRow={3} label={'입고일'} name={'receivingDate'} dateValue={formikFieldDefault.receivingDate}/>
                            <FormikContainer type={'datepicker'} perRow={3} label={'라임북 처리일'} name={'processingDate'} dateValue={formikFieldDefault.processingDate}/>
                            <FormikContainer type={'datepicker'} perRow={3} label={'반품 입고일'} name={'returnReceivingDate'} dateValue={formikFieldDefault.returnReceivingDate}/>
                            <FormikContainer type={'etc'} perRow={3} label={'처리자'} >홍길동</FormikContainer>
                            <FormikContainer type={'etc'} perRow={3} label={'회사'} >도서출판 길벗</FormikContainer>
                            <FormikContainer type={'etc'} perRow={2} label={'거래처(본점)'} >110-510  영풍문고</FormikContainer>
                            <FormikContainer type={'etc'} perRow={2} label={'지점'} >천안불당점</FormikContainer>
                        </Row>

                        <Grid />

                        <Row className='table marginUD'>
                            <FormikContainer type={'textarea'} perRow={1} label={'참고 사항'} name={'ref'} />
                            <FormikContainer type={'etc'} perRow={2} label={'수정 일시'}>2023.05.15  10:21</FormikContainer>
                            <FormikContainer type={'etc'} perRow={2} label={'수정자'}>홍길동</FormikContainer>
                        </Row>

                        <Row gutter={[10, 10]} justify='center'>
                            <Button type='primary button'>확인</Button>
                            <Button type='button' style={{margin: '0 10px'}}>취소</Button>
                            <Button type='button' onClick={showModal}>삭제</Button>
                        </Row>

                    </Form>
                )}
            </Formik>
        </Drawer>
    );
});

export default index;