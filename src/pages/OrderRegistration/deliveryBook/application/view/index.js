/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useEffect, useCallback, useState } from 'react';
import { Space, Button, Drawer, Row, Col, Typography, Modal } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
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

const Index = ({ appIdx, drawerVisible, drawerClose }) => {
    const { commonStore } = useStore()
    const [generatedData,setGeneratedData] = useState(null)
    const [formikFieldDefault, setFormikFieldDefault] = useState({
        template_title :'',
        company_name:  '',
        request_date : '',
        orders : [],
    });
    const [shippingDetails,setShippingDetails] = useState([])
    const [selProduct,setSelProduct] = useState('')
    const [companyList, setCompanyList] = useState([])
    const [editPermission, setEditPermission] = useState(true)

    const state = useLocalStore(() => ({
        drawerback:'drawerWrap',
    }));

    useEffect(() => {
        if(appIdx){
            viewData()
        }
    }, []);

    const disabledDate = (date) => {
        return date && date < moment().subtract(1, 'day');
    };

    const viewData = useCallback(async (val) => {
        const result = await commonStore.handleApi({
            url: '/book-distributions/'+appIdx,
        })
        result.data.request_date = moment(result.data.request_date)
        setShippingDetails([{
            product_id: result.data.product_info.product_id,
            details: {
                total_shipping_qty: 0,	// 배본 수량 총합
                cities: result.data.cities
              }
          }
        ])
        result.data.orders = shippingDetails
        setGeneratedData(result.data)
        setFormikFieldDefault(result.data)
        setEditPermission(commonStore.user.team===62 || result.data.applicant_info.id===commonStore.user.id) // 권한 설정
    }, [])

    const handleSubmit = () => {
        // 등록과 수정이 형태가 다르므로 수정 형태로 파싱
        //배본 수량 합계 재계산
        //배본 상세 정보 파싱
        let sum = 0
        const cities = shippingDetails[0].details.cities.map(item=>{
            const infos = item.shipping_infos.map(e=>{
                sum += Number(e.shipping_qty)
                return {
                    id: e.id,
                    shipping_qty: e.shipping_qty,
                    use_yn : e.editingType ==="remove" ? 'N' : 'Y'
                }
            })
            return {
                city_id: item.city_id,
                shipping_infos: infos
            }
        })

        const submitData = {
            request_date: moment(generatedData.request_date).format('YYYY-MM-DD'),
            total_shipping_qty: sum,
            cities: cities
        }

        commonStore.handleApi({
            url: '/book-distributions/'+appIdx,
            method:'PUT',
            data:submitData
        }).then((result) => {
            Modal.success({
              content: result.result,
            })
            drawerClose()
        })
    }

    const validationSchema = Yup.object().shape({
        request_date :  Yup.mixed().test('required', '날짜를 선택해주세요.', (value) => {
            return value && moment(value).isValid();
        }),
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
                            <Button onClick={drawerClose}>
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
                        //request_date만 변경 가능하므로 객체만 타게팅하여 변경
                        setGeneratedData(prevGeneratedData => ({
                            ...prevGeneratedData,
                            request_date: values.request_date,
                        }))
                        handleSubmit()
                    }}
                >
                    {(props) => (
                        <Form>
                        <Row className='table marginUp'>
                            {/* <Col span={24} className='addLabel'>기본 정보</Col> */}
                            <div className="table_title">기본 정보</div>
                            <FormikContainer type={'etc'} perRow={1} name={'template_title'} style={{width: '100%'}} >{props.values.template_title}</FormikContainer>
                            <FormikContainer type={'etc'} perRow={2} label={'회사'} name={'company_name'} >{props.values.company_name}</FormikContainer>
                            <FormikContainer type={'datepicker'} labelWidth={3} perRow={2} label={'배본 요청일'} name={'request_date'} disabledDate={disabledDate} required
                            />
                            <FormikContainer type={'etc'} perRow={1} label={'상품'} name={'orders'} required >
                                {props.values.company_name && 
                                    <ProductGrid {...props} company_list={companyList}
                                        shippingDetails={shippingDetails}
                                        setOrders={e=>props.setFieldValue('orders',e)}
                                        selectRow={setSelProduct}
                                    />}
                            </FormikContainer>
                        </Row>
                    
                        {selProduct && shippingDetails.map((orders,ordersIndex)=>(
                            orders.product_id === selProduct && orders.details.cities.map((cities,citiesIndex)=>(
                                <RegionGrid key={citiesIndex} regionData={cities} shippingDetails={shippingDetails} setShippingDetails={setShippingDetails} setIndex={{ordersIndex,citiesIndex}} />
                            ))
                        ))}

                        <Row gutter={10}  justify="center" style={{ margin: '20px 0 50px' }}>
                            {editPermission && generatedData?.status === "1" && <Button type='primary' onClick={props.handleSubmit}>확인</Button>}
                            <Button style={{marginLeft: 10}} onClick={drawerClose}>취소</Button>
                        </Row>
                        </Form>
                    )}
                </Formik>

                </Drawer>
        </Wrapper>
    );
}

export default observer(Index);