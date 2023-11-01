/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useEffect, useCallback, useState } from 'react';
import { Space, Button, Drawer, Row, Col, Typography, Modal } from 'antd';
import { ExclamationCircleOutlined, CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import moment from 'moment'

import { Formik, Form, FormikProvider } from 'formik';
import { FormikContainer } from '@components/form/CustomInput';
import useStore from '@stores/useStore';
import * as Yup from 'yup';

import styled from 'styled-components';

import RegionGrid from './regionGrid';
import ProductGrid from './productGrid'

const { Text } = Typography;
const Wrapper = styled.div`
    width: 100%;
`;

const Index = ({ drawerVisible, drawerClose }) => {
    const { commonStore } = useStore()
    const [generatedData,setGeneratedData] = useState(null)
    const [formikFieldDefault, setFormikFieldDefault] = useState({
        template_id :'',
        company:  '',
        request_date : '',
        orders : [],
    });
    const [shippingDetails,setShippingDetails] = useState([])
    const [selProduct,setSelProduct] = useState('')
    const [companyList, setCompanyList] = useState([])

    const state = useLocalStore(() => ({
        drawerback:'drawerWrap',
    }));

    useEffect(() => {
    }, []);

    const disabledDate = (date) => {
        return date && date < moment().subtract(1, 'day');
    };

    const getProducts = useCallback(async (val) => {
        const result = await commonStore.handleApi({
            url: '/product-search',
            data:{
                company:val,
                is_new:true,
            }
        })
        if(result.data.length > 0){
            setCompanyList([...result.data])
        }else{
            setCompanyList([])
        }
    }, [])

    const handleSubmit = () => {
        const submitData = generatedData
        submitData.orders = shippingDetails

        commonStore.handleApi({
            url: '/book-distributions',
            method:'POST',
            data:submitData
        }).then((result) => {
            Modal.success({
              content: result.result,
            })
            drawerClose()
        })
    }

    const validationSchema = Yup.object().shape({
        template_id :   Yup.string().label("배본 템플릿").required(),
        company :       Yup.string().label("회사").required(),
        // request_date :  Yup.string().label("배본 요청일").required(),
        request_date :  Yup.mixed().test('required', '날짜를 선택해주세요.', (value) => {
            return value && moment(value).isValid();
        }),
        orders :        Yup.array().min(1,'1개 이상 등록').required(),
    });

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
                    title='배본 신청'
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
                    validationSchema={validationSchema}
                    onSubmit = {(values) => {
                        const setData = values
                        const string = values.orders.map(e=>e.product_id).join(',')
                        commonStore.handleApi({
                            url: '/book-distribution-details',
                            data:{
                                template_id : values.template_id,
                                company : values.company,
                                product_id : string,
                            }
                        }).then(result =>{
                            setData.orders = result.data
                            setShippingDetails(result.data)
                            setGeneratedData(setData)
                        })
                    }}
                >
                    {(props) => (
                        <Form>
                        <Row className='table marginUp'>
                            <div className="table_title">기본 정보</div>
                            <FormikContainer type={'select'} perRow={1} label={'배본 템플릿'} name={'template_id'} style={{width: '100%'}} required
                                data={{
                                    allowClear      : true, 
                                    value           : 'id',
                                    label           : 'title',
                                    optionApiUrl    : '/book-distribution-templates?display=500&page=1&sort_by=name&order=asc',
                                    optionsApiValue : 'id', 
                                    optionsApiLabel : 'title'
                                }}
                            />
                            <FormikContainer type={'radio'} perRow={2} label={'회사'} name={'company'} required
                                data = {{
                                    radioData : [{
                                        label : '도서출판 길벗', 
                                        value: 'G'
                                    }, {
                                        label : '길벗스쿨',
                                        value : 'S',
                                    }]
                                }}
                                onChange = {(e)=>{getProducts(e.target.value)}}
                            />
                            <FormikContainer type={'datepicker'} labelWidth={3} perRow={2} label={'배본 요청일'} name={'request_date'} disabledDate={disabledDate} required/>
                            <FormikContainer type={'etc'} perRow={1} label={'상품'} name={'orders'} required >
                                {props.values.company && 
                                    <ProductGrid {...props} company_list={companyList}
                                        shippingDetails={shippingDetails}
                                        setOrders={e=>props.setFieldValue('orders',e)}
                                        selectRow={setSelProduct}
                                    />}
                            </FormikContainer>
                        </Row>

                    <Row gutter={10}  justify="center" style={{ margin: '20px 0 50px' }}>
                        <Button type='primary' onClick={props.handleSubmit}>생성</Button>
                    </Row>
                    <Row style={{marginBottom: 10}}>
                        <Text><ExclamationCircleOutlined /> ‘생성’ 후 위쪽 상품명을 클릭하면 아래에 배본 상세 내역이 변경됩니다.</Text>
                    </Row>
                    
                </Form>
                    )}
                </Formik>
                    {selProduct && shippingDetails.map((orders,ordersIndex)=>(
                        orders.product_id === selProduct && orders.details.cities.map((cities,citiesIndex)=>(
                            <RegionGrid key={citiesIndex} regionData={cities} shippingDetails={shippingDetails} setShippingDetails={setShippingDetails} setIndex={{ordersIndex,citiesIndex}} />
                        ))
                    ))}

                    <Row gutter={10}  justify="center" style={{ margin: '20px 0 50px' }}>
                        <Button type='primary' onClick={handleSubmit}>확인</Button>
                        <Button style={{marginLeft: 10}}>취소</Button>
                    </Row>


                </Drawer>
        </Wrapper>
    );
}

export default observer(Index);