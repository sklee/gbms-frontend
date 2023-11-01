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
        company:'',
        type: '',
        movementDate: moment(),
        release: '',
        incoming: '',
        note: '',
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
            title: "변경 수량이 선택 창고의 재고를 초과합니다. ‘수량'에 붉은 색으로 표시된 건을 확인해 주세요.",
            onOk() {
                
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
            title='상태 변경 내용'
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
                            <FormikContainer type={'radio'} label={'회사'} name={'company'} labelWidth={3} perRow={2} required 
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
                            <FormikContainer type={'select'} label={'유형'} name={'type'} labelWidth={3} perRow={2} style={{width: '100%'}} required 
                                data={{
                                    mode : 'tags',
                                    options : [
                                        {value:1, label:'1'}, 
                                        {value:2, label:'2'}, 
                                    ]
                                }}
                            />
                            <FormikContainer type={'radio'} label={'창고'} name={'storage'} labelWidth={3} perRow={2} required
                                disabled={formikFieldDefault.release === '' ? false : true}
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
                            <FormikContainer type={'datepicker'} label={'변경일'} name={'movementDate'} labelWidth={3} perRow={2} required dateValue={formikFieldDefault.movementDate}/>

                            <FormikContainer type={'etc'} label={'등록일시'} labelWidth={3} perRow={2}></FormikContainer>
                            <FormikContainer type={'etc'} label={'등록자'} labelWidth={3} perRow={2}>홍길동</FormikContainer>
                            <FormikContainer type={'input'} label={'비고'} name={'note'} labelWidth={3} perRow={1}/>
                        </Row>

                        <Grid />

                        <Row className='table marginUD'>
                            <FormikContainer type={'file'} label={'작업 파일'} name={'addFile'} btnType={'circle'} contentCnt={5} labelWidth={3} perRow={1} />
                            <FormikContainer type={'textarea'} label={'참고 사항'} name={'ref'} labelWidth={3} perRow={1} />
                            <FormikContainer type={'etc'} label={'수정 일시'} labelWidth={3} perRow={2} >2023.05.15  10:21</FormikContainer>
                            <FormikContainer type={'etc'} label={'수정자'} labelWidth={3} perRow={2} >홍길동</FormikContainer>
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