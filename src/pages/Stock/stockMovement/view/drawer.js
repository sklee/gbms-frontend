import React, { useState } from 'react';
import { Row, Button, Drawer, Modal } from 'antd';
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

    const showModal = () => {
        Modal.info({
            title: '라임북과 연관된 내용이 수정되었습니다. 라임북에 수정 내용을 공유해 주세요.',
            onOk() {
                drawerClose();
            }
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
            title='재고 이동 내용'
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
                            <FormikContainer type={'radio'} perRow={1} label={'회사'} name={'company'} required 
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
                            <FormikContainer type={'select'} perRow={2} label={'유형'} name={'type'} style={{width: '100%'}} required 
                                data={{
                                    mode : 'tags',
                                    options : [
                                        {value:1, label:'1'}, 
                                        {value:2, label:'2'}, 
                                    ]
                                }}
                            />
                            <FormikContainer type={'datepicker'} perRow={2} label={'이동일'} name={'movementDate'} required dateValue={formikFieldDefault.receivingDate}/>
                            <FormikContainer type={'radio'} perRow={2} label={'출고 창고'} name={'release'} required 
                                data={{
                                    radioData : [{
                                        label : '라임북(정품)', 
                                        value: 1
                                    }, {
                                        label : '라임북(반품)',
                                        value : 2
                                    }, {
                                        label : '본사',
                                        value : 3
                                    }, {
                                        label : '기타',
                                        value : 4
                                    }, {
                                        label : '판권반품',
                                        value : 5
                                    }]
                                }}
                            />
                            <FormikContainer type={'radio'} perRow={2} label={'입고 창고'} name={'incoming'} required 
                                data={{
                                    radioData : [{
                                        label : '라임북(정품)', 
                                        value: 1
                                    }, {
                                        label : '라임북(반품)',
                                        value : 2
                                    }, {
                                        label : '본사',
                                        value : 3
                                    }, {
                                        label : '기타',
                                        value : 4
                                    }, {
                                        label : '판권반품',
                                        value : 5
                                    }]
                                }}
                            />
                            <FormikContainer type={'etc'} perRow={2} label={'등록일시'}></FormikContainer>
                            <FormikContainer type={'etc'} perRow={2} label={'등록자'} >홍길동</FormikContainer>
                            <FormikContainer type={'input'} perRow={1} label={'비고'} name={'note'} />
                        </Row>

                        <Grid />

                        <Row className='table marginUD'>
                            <FormikContainer type={'file'} perRow={1} label={'작업 파일'} name={'addFile'} btnType={'circle'} contentCnt={5}/>
                            <FormikContainer type={'textarea'} perRow={1} label={'참고 사항'} name={'ref'} />
                            <FormikContainer type={'etc'} perRow={2} label={'수정 일시'}>2023.05.15  10:21</FormikContainer>
                            <FormikContainer type={'etc'} perRow={2} label={'수정자'}>홍길동</FormikContainer>
                        </Row>

                        <Row gutter={[10, 10]} justify='center'>
                            <Button type='primary button' onClick={showModal}>확인</Button>
                            <Button type='button' style={{margin: '0 10px'}}>취소</Button>
                        </Row>
                    </Form>
                )}
            </Formik>
        </Drawer>
    );
});

export default index;