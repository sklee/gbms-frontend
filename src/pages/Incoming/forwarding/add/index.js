import React, { useState } from 'react';
import { Row, Button, Drawer, Modal } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import { Form, Formik } from 'formik';
import { FormikContainer, FormikInput } from '@components/form/CustomInput';
import moment from 'moment';

import Grid from './grid';

const { confirm } = Modal;

const index = observer(({ drawerVisible, drawerClose }) =>{
    const [formikFieldDefault, setFormikFieldDefault] = React.useState({
        receivingDate: moment(),
        type: '',
        company: '',
        accountName: '',
        accountCode: '',
        branchName : '',
        branchCode : '',
        note : '',
        ref : '',
    });

    const state = useLocalStore(() => ({
        isRender: false,
        tab: 'info',
        drawerback : 'drawerWrap', //drawer class name
        idx: '',
    }));

    const drawerClass=(data)=>{
        if(data === 'drawerback'){
            state.drawerback = 'drawerback drawerWrap';
        }else{
            state.drawerback = 'drawerWrap';
        }          
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
            title='회송 입고'
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
                    <Button onClick={drawerVisible}>
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
                            <FormikContainer type={'datepicker'} labelWidth={3} perRow={2} label={'입고일'} name={'receivingDate'} dateValue={formikFieldDefault.receivingDate} required/>
                            <FormikContainer type={'select'} labelWidth={3} perRow={2} label={'유형'} name={'type'} style={{width: '100%'}} required 
                                data={{
                                    // mode : 'tags',
                                    options : [
                                        {value:1, label:'1'}, 
                                        {value:2, label:'2'}, 
                                    ]
                                }}
                            />

                            <FormikContainer type={'etc'} labelWidth={3} perRow={4} label={'처리일'} />
                            <FormikContainer type={'etc'} labelWidth={3} perRow={4} label={'처리자'} />
                            <FormikContainer type={'radio'} labelWidth={3} perRow={2} label={'회사'} name={'company'} required 
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

                            <FormikContainer type={'input'} labelWidth={3} perRow={2} label={'거래처(본점)'} name={'accountName'} style={{width: 'calc(35% - 5px)', marginRight: '5px'}}
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
                            <FormikContainer type={'input'} labelWidth={3} perRow={2} label={'지점'} name={'branchName'} style={{width: 'calc(35% - 5px)', marginRight: '5px'}}
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

                            <FormikContainer type={'input'} labelWidth={3} perRow={1} label={'비고'} name={'note'} style={{width: '100%'}} />
                        </Row>

                        <Grid drawerClass={drawerClass} drawerChk="Y"/>

                        <Row className='table marginUD'>
                            <FormikContainer type={'textarea'} labelWidth={3} perRow={1} label={'참고 사항'} name={'ref'} />
                            <FormikContainer type={'etc'} labelWidth={3} perRow={2} label={'수정 일시'}>2023.05.15  10:21</FormikContainer>
                            <FormikContainer type={'etc'} labelWidth={3} perRow={2} label={'수정자'}>홍길동</FormikContainer>
                        </Row>

                        <Row gutter={[10, 10]} justify='center'>
                            <Button type='primary button'>확인</Button>
                            <Button type='button' style={{margin: '0 10px'}}>취소</Button>
                        </Row>
                    </Form>
                )}
            </Formik>
        </Drawer>
    );
});

export default index;