/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useEffect, useCallback, useState } from 'react';
import { Space, Button, Drawer, Row, Col, Modal } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import { Formik, Form, FieldArray } from 'formik';
import { FormikContainer } from '@components/form/CustomInput';
import useStore from '@stores/useStore';
import * as Yup from 'yup';

import styled from 'styled-components';
import RegionGrid from './regionGrid'

const Wrapper = styled.div`
    width: 100%;
`;
const { confirm } = Modal;

const index = observer(({templateIdx, drawerVisible, drawerClose }) => {
    const { commonStore } = useStore();
    const [areaOptions,setAreaOptions] = useState([])
    const [accountOptions,setAccountOptions] = useState([])
    const [formikFieldDefault, setFormikFieldDefault] = useState({
        title: '',
        departments: [],
        total_shipping_qty: 0,
        cities: [],
    })

    const state = useLocalStore(() => ({
        drawerback:'drawerWrap',
        departmentOpt:[],
        areaOpt:[],
    }));

    useEffect(() => {
        accountData()
        areaData().then(areaData=>{
            if(templateIdx){
                fetchData().then(fData=>{
                    const combine = areaData.map(area =>{
                        const matching = fData.cities.find(data=>area.city_id === data.city_id)
                        if(matching){
                            return {...area,shipping_infos: matching.shipping_infos}
                        }
                        return area
                    })
                    delete fData.created_at
                    delete fData.updated_at
                    setFormikFieldDefault({...fData,cities : combine})
                    setAreaOptions(combine)
                })
            }else{
                setFormikFieldDefault({...formikFieldDefault,cities : areaData})
                setAreaOptions(areaData)
            }
        })
    }, [])

    const fetchData = useCallback(async () => {
        const result = await commonStore.handleApi({
            url: '/book-distribution-templates/'+templateIdx,
        });
        // setFormikFieldDefault(result.data)
        return result.data
    }, [])

    const areaData = useCallback(async (val) => {
        const result = await commonStore.handleApi({
            url: '/codes',
            data:{
                parent_code:3178
            }
        });
        const areaOption = result.data.map((e,index) => {
            return {city_id : e.id, city_name : e.name, shipping_infos :[]}
        });
        return areaOption
    }, [])

    const accountData = useCallback(async (val) => {
        const result = await commonStore.handleApi({
            url: '/select-sales-accounts?sort_by=name&order=asc&detail_info=true',
            data:{
                sort_by:'name',
                order:'asc',
                detail_info:true
            }
        });
        setAccountOptions(result.data)
    }, [])

    const handleSubmit = useCallback(async (formData) => {
        const submitData = formData
        submitData.cities = submitData.cities.filter(item=>item.shipping_infos.length > 0)
        delete submitData.department_infos

        const methodType = templateIdx ? 'PUT' : 'POST'
        const idx = templateIdx ?? ''

        commonStore.handleApi({
            url: '/book-distribution-templates/'+idx,
            method : methodType,
            data:submitData
        }).then((result) => {
            Modal.success({
              content: result.result,
            })
            drawerClose()
        })

    }, [])

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
                title='배본 템플릿'
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
                        handleSubmit(values)
                    }}
                >
                    {(props) => (
                        <Form>
                        <div style={{marginBottom: 50}}>
                            <Row className='table marginUp'>
                                <div className="table_title">기본 정보</div>
                                <FormikContainer perRow={1} label={'제목'} name={'title'} />
                                <FormikContainer type={'select'} perRow={1} label={'사용 부서'} name={'departments'} style={{width: '100%'}}
                                    data={{
                                        mode            : 'multiple',
                                        allowClear      : true, 
                                        value           : 'id',
                                        label           : 'name',
                                        optionApiUrl    : '/select-department-codes?depth=3',
                                        optionsApiValue : 'id', 
                                        optionsApiLabel : 'name'
                                    }}
                                />
                                <FormikContainer type={'etc'} perRow={1} label={'배본 수량 합계'} name={'total_shipping_qty'}>{props.values.total_shipping_qty}</FormikContainer>
                            </Row>
                        </div>
                        <FormikContainer type={'etc'} labelWidth={24} label={'지역별 거래처'} name={'cities'}>
                            <FieldArray name={'cities'} render={(arrayHelpers) => {
                                return (areaOptions.map((obj,index) => (
                                    <RegionGrid key={obj.city_id} regionData={obj} accountOptions={accountOptions} 
                                        setCities={e=>{
                                            let sum = 0
                                            props.values.cities.map(item=>{
                                                if(item.city_id !== e.city_id){
                                                    item.shipping_infos.map(obj=>{
                                                        sum += Number(obj.shipping_qty)
                                                    })
                                                }
                                            })
                                            e.shipping_infos.map(obj=>{
                                                sum += Number(obj.shipping_qty)
                                            })
                                            props.setFieldValue('total_shipping_qty',sum)
                                            props.setFieldValue(`cities[${index}]`,e)
                                        }}
                                    />
                                )))
                            }}/>
                        </FormikContainer>

                        <Row gutter={10}  justify="center" style={{ margin: '20px 0 50px' }}>
                            <Button type='primary submit' onClick={()=>props.handleSubmit()}>확인</Button>
                            <Button style={{marginLeft: 10}}>취소</Button>
                        </Row>
                        </Form>
                    )}
                </Formik>

            </Drawer>
        </Wrapper>
    );
});

export default index;