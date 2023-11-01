import React, { useState } from 'react';
import { Row, Button, Drawer, Select, Modal } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import { Form, Formik } from 'formik';
import { FormikContainer, FormikInput } from '@components/form/CustomInput'

import Grid from './grid';

const { confirm } = Modal;

const index = observer(({ drawerVisible, drawerClose }) =>{
    const dateFormat = 'YYYY-MM-DD';

    const [formikFieldDefault, setFormikFieldDefault] = React.useState({
        branchNumber: '',
        branchName: '',
        company: '',
        progress: '',
        searchCriteria: '',
        inquiryPeriod : '',
    });

    const state = useLocalStore(() => ({
        isRender: false,
        tab: 'info',
        drawerback : 'drawerWrap', //drawer class name
        idx: '',
    }));

    const deleteHandle = () => {
        confirm({
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
            title='주문/출고 내용'
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
                            <FormikContainer type={'etc'} perRow={2} label={'주문 출처'} >서점 SCM</FormikContainer>
                            <FormikContainer type={'etc'} perRow={2} label={'진행 상태'} >출고 요청</FormikContainer>
                            <FormikContainer type={'etc'} perRow={2} label={'주문일시'} >2023.05.15  08:50</FormikContainer>
                            <FormikContainer type={'etc'} perRow={2} label={'주문 등록자'} >홍길동</FormikContainer>
                            <FormikContainer type={'etc'} perRow={2} label={'출고 요청일시'} >2023.05.15  11:38</FormikContainer>
                            <FormikContainer type={'etc'} perRow={2} label={'회사'} >도서출판 길벗</FormikContainer>
                            <FormikContainer type={'etc'} perRow={2} label={'거래처(본점)'} >
                                <FormikInput type={'input'} style={{width: 'calc(35% - 5px)', marginRight: '5px'}} name={'accountNumber'} extraCompo={
                                    <Select style={{width: '65%'}} name={'accountName'} options={[
                                        {value:1, label:'1'}, 
                                        {value:2, label:'2'}, 
                                    ]} />
                                }/>
                            </FormikContainer>
                            <FormikContainer type={'etc'} perRow={2} label={'지점'} >
                                <FormikInput type={'input'} style={{width: 'calc(35% - 5px)', marginRight: '5px'}} name={'branchNumber'} extraCompo={
                                    <Select style={{width: '65%'}} name={'branchName'} options={[
                                        {value:1, label:'1'}, 
                                        {value:2, label:'2'}, 
                                    ]} />
                                }/>
                            </FormikContainer>
                        </Row>

                        <Row className="table marginUD">
                            <FormikContainer type={'etc'} perRow={3} label={'주문 구분'} name={'orderClassification'} />
                            <FormikContainer type={'etc'} perRow={3} label={'공급 조건'} name={'fedCondition'} />
                            <FormikContainer type={'select'} perRow={3} label={'창고'} name={'warehouse'} style={{width: '100%'}}
                                data={{
                                    mode : 'tags',
                                    options : [
                                        {value:1, label:'1'}, 
                                        {value:2, label:'2'}, 
                                    ]
                                }}
                            />
                            <FormikContainer type={'select'} perRow={3} label={'배송 구분'} name={'shippingClassification'} style={{width: '100%'}}
                                data={{
                                    mode : 'tags',
                                    options : [
                                        {value:1, label:'1'}, 
                                        {value:2, label:'2'}, 
                                    ]
                                }}
                            />
                            <FormikContainer type={'select'} perRow={3} label={'배송 방법'} name={'deliveryMethod'} style={{width: '100%'}}
                                data={{
                                    mode : 'tags',
                                    options : [
                                        {value:1, label:'1'}, 
                                        {value:2, label:'2'}, 
                                    ]
                                }}
                            />
                            <FormikContainer type={'etc'} perRow={3} label={'전표 코드'}>G230802</FormikContainer>
                            <FormikContainer type={'input'} perRow={3} label={'전표 차수'} name={'fedCondition'} value={'01'}/>
                            <FormikContainer type={'input'} perRow={3} label={'적요 구분'} name={'fedCondition'}/>
                            <FormikContainer type={'input'} perRow={3} label={'적요 내용'} name={'fedCondition'}/>
                            <FormikContainer type={'input'} perRow={1} label={'비고'} name={'fedCondition'}/>
                        </Row>

                        <Grid />

                        <Row className='table marginUD'>
                            <FormikContainer type={'textarea'} perRow={1} label={'참고 사항'} name={'ref'} />
                            <FormikContainer type={'etc'} perRow={2} label={'수정 일시'}>2023.05.15  10:21</FormikContainer>
                            <FormikContainer type={'etc'} perRow={2} label={'수정자'}>홍길동</FormikContainer>
                        </Row>

                        <Row gutter={[10, 10]} justify='center'>
                            <Button type='primary submit'>확인</Button>
                            <Button style={{margin: '0 10px'}}>취소</Button>
                            <Button onClick={deleteHandle}>삭제</Button>
                        </Row>
                    </Form>
                )}
            </Formik>
        </Drawer>
    );
});

export default index;