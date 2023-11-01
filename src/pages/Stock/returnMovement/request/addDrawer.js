import React, { useState } from 'react';
import { Row, Button, Drawer } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import { Form, Formik } from 'formik';
import { FormikContainer, FormikInput } from '@components/form/CustomInput'
import moment from 'moment';

import SearchGrid from './searchGrid';


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

    const [addGridVisible, setAddGridVisible] = useState(false);
    const addGridShow = () => setAddGridVisible(true);
    const addGridHide = () => setAddGridVisible(false);

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
            title='재고 검색'
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
                            <FormikContainer type={'radio'} label={'회사'} name={'company'} perRow={2} required 
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
                            <FormikContainer type={'input'} label={'상품명'} name={'prdName'} perRow={2} />
                            <FormikContainer type={'checkbox'} label={'상태 조건'} name={'Condition'} perRow={2} 
                                data={{
                                    checkboxData: [{
                                        label : "'단종/절판' 제외",
                                        value: 1
                                    } ,{
                                        label : "'출고 중단(재고 부족)'만 포함",
                                        value: 2
                                    }]
                                }}
                            />
                            <FormikContainer type={'etc'} label={'재고 조건'} perRow={2}>
                                <FormikInput type={'checkbox'} name={'stock'} style={{marginRight: 20}}
                                    data={{
                                        checkboxData: [{
                                            label : "정품 재고",
                                            value: 1
                                        }]
                                    }}
                                    extraCompo={
                                        <>
                                            <FormikInput type={'input'}  name={'stockQuantity'} style={{width: '50px'}}/> 개 이하
                                        </>
                                    }
                                />
                                <FormikInput type={'checkbox'} name={'remaining'}
                                    data={{
                                        checkboxData: [{
                                            label : "잔여일 ",
                                            value: 2
                                        }]
                                    }}
                                    extraCompo={
                                        <>
                                            <FormikInput type={'input'}  name={'remainingDays'} style={{width: '50px'}}/> 일 이하
                                        </>
                                    }
                                />
                            </FormikContainer>
                        </Row>

                        <Row justify='center' style={{margin: '30px 0'}}>
                            <Button type='primary button'>검색</Button>
                        </Row>

                        <SearchGrid addGridVisible={addGridVisible} addGridShow={addGridShow} drawerClose={drawerClose}/>
                        
                    </Form>
                )}
            </Formik>
        </Drawer>
    );
});

export default index;