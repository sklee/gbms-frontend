import React, { useState } from 'react';
import { Row, Button, Drawer, Select, Modal } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import { Form, Formik } from 'formik';
import { FormikContainer, FormikInput } from '@components/form/CustomInput'

import Grid from './grid';

const { confirm } = Modal;

const index = observer(({ drawerVisible, drawerClose }) =>{
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

    const [modalVisible, setModalVisible] = useState(false);
    const modalOpen = () => setModalVisible(true);
    const modalClose = () => setModalVisible(false);
    const [modalVisible2, setModalVisible2] = useState(false);
    const modalOpen2 = () => setModalVisible2(true);
    const modalClose2 = () => setModalVisible2(false);
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
                            <FormikContainer type={'etc'} perRow={2} label={'주문 출처'} >직접 등록</FormikContainer>
                            <FormikContainer type={'etc'} perRow={2} label={'진행 상태'} ></FormikContainer>
                            <FormikContainer type={'datepicker'} perRow={2} label={'주문일시'} name={'date'} required />
                            <FormikContainer type={'etc'} perRow={2} label={'주문 등록자'} >김명자</FormikContainer>
                            <FormikContainer type={'etc'} perRow={2} label={'출고 요청일시'} ></FormikContainer>
                            <FormikContainer type={'select'} perRow={2} label={'회사'} style={{width: '100%'}} required 
                                data={{
                                    mode : 'tags',
                                    options : [
                                        {value:1, label:'1'}, 
                                        {value:2, label:'2'}, 
                                    ]
                                }}
                            />
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
                            <FormikContainer type={'select'} perRow={3} label={'주문 구분'} name={'orderClassification'} style={{width: '100%'}}
                                data={{
                                    mode : 'tags',
                                    options : [
                                        {value:1, label:'1'}, 
                                        {value:2, label:'2'}, 
                                    ]
                                }}
                            />
                            <FormikContainer type={'select'} perRow={3} label={'공급 조건'} name={'fedCondition'} style={{width: '100%'}}
                                data={{
                                    mode : 'tags',
                                    options : [
                                        {value:1, label:'1'}, 
                                        {value:2, label:'2'}, 
                                    ]
                                }}
                            />
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
                            <FormikContainer type={'etc'} perRow={3} label={'전표 차수'} name={'fedCondition'}>02</FormikContainer>
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
                            <Button type='primary button' onClick={modalOpen}>확인</Button>
                            <Button type='button' style={{margin: '0 10px'}}>취소</Button>
                        </Row>

                        <Modal
                            className='modalTest'
                            visible={modalVisible}
                            title={<div><span className='redTxt'>'출고 중단' 상태</span>의 거래처입니다.</div>}
                            onCancel={modalClose}
                            footer={[
                            <Button type="primary button" onClick={() => {
                                modalClose();
                                modalOpen2();
                            }}>
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

                        <Modal
                            className='modalTest'
                            visible={modalVisible2}
                            title={<div><span className='redTxt'>여신 한도를 초과</span>한 거래처입니다.</div>}
                            onCancel={modalClose2}
                            footer={[
                            <Button type="primary button">
                                확인
                            </Button>,
                            <Button type='button' onClick={modalClose2}>
                                취소
                            </Button>,
                            ]}
                        >
                            <div>- 여신 한도: 0</div>
                            <div>- 채권 합계: 160,800</div>
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