import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Row, Button, Table, Typography, Input } from 'antd';
import { Form, Formik, useFormik, FieldArray, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { observer, useLocalStore } from 'mobx-react';
import FormikInput from '@components/form/CustomInput';
import { toJS } from 'mobx';

import useStore from '@stores/useStore';
import moment from 'moment';
import { TranslationOutlined } from '@ant-design/icons';

const ProductGrid = ( props ) =>{
    const { commonStore } = useStore();
    const [rowEditing, setRowEditing] = useState('')
    const [editingType, setEditingType] = useState('')
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const lastIndex = useRef(1)
    const isEditing = (record) => (record.dataIndex === rowEditing) ? true : (!rowEditing && record.editingType === 'head')

    const state = useLocalStore(() => ({
        list: [],
        products : [],
    }));

    useEffect(()=>{
        formikHook.setFieldValue(`listData`,[props.values.product_info])
    },[])

    useEffect(()=>{
        state.products = props.company_list
    },[props.company_list])

    useEffect(()=>{
        formikHook.values.listData.map((item,index)=>{
            if(item.editingType!=='head'&& item.product_id){
                let sum = 0
                props.values.orders.find(e=>e.product_id===item.product_id).details.cities.map(e=>{
                    e.shipping_infos.map(f=>{
                        sum += Number(f.shipping_qty)
                    })
                })
                formikHook.setFieldValue(`listData[${index}].details.total_shipping_qty`,sum)
            }
        })
    },[props.values.orders])

    useEffect(()=>{
        if(props.shippingDetails.length > 0){
            props.shippingDetails.map(item=>{
                const selectedIndex = formikHook.values.listData.findIndex(obj=>obj.product_id===item.product_id)
                if(selectedIndex!==-1){
                    let sum = 0
                    item.details.cities.map(e=>{
                        e.shipping_infos.map(f=>{
                            sum += Number(f.shipping_qty)
                        })
                    })
                    formikHook.setFieldValue(`listData[${selectedIndex}].details.total_shipping_qty`,sum)
                }
            })
        }
    },[props.shippingDetails])

    const productSearch = useCallback(async (value)=>{
        const item = state.products.find(e=>e.id === value)
        secondFormikHook.setFieldValue('product_qty',item.product_qty)
        secondFormikHook.setFieldValue('price',item.price)
    },[])

    const add = () => {
        setEditingType('add')
        formikHook.setFieldValue('listData', [secondInitialValues, ...formikHook.values.listData])
        lastIndex.current += 1
        secondFormikHook.setValues(secondInitialValues)
        setRowEditing(lastIndex.current)
    }

    const reset = (record) => {
        secondFormikHook.setValues(secondInitialValues)
    }

    const save = (record) => {
        secondFormikHook.handleSubmit()
    }

    const cancel = (record) => {
        setRowEditing(lastIndex.current)
        setEditingType('add')
        secondFormikHook.setValues(secondFormikHook.initialValues)
    }

    const edit = (record) => {
        setRowEditing(record.dataIndex)
        setEditingType('edit')
        secondFormikHook.setValues(record)
    }
    
    const remove = (record) => {
        setRowEditing(lastIndex.current)
        setEditingType('add')
        const targetIndex = formikHook.values.listData.findIndex(obj => obj.dataIndex === record.dataIndex)
        if ( ~targetIndex ) {
            if (record.id == '') {
                // 새로 추가한 거를 삭제하면 바로 화면에서 날리기
                record.id == '' && formikHook.setFieldValue('listData', formikHook.values.listData.filter(item => item.dataIndex !== record.dataIndex))
            }
            else {
                // 이외 기존 있던 거를 삭제하면 editingType remove 추가
                formikHook.values.listData[`${targetIndex}`].isUpdating = true
                formikHook.values.listData[`${targetIndex}`].editingType = 'remove'
                formikHook.values.listData[`${targetIndex}`].remove = true
            }
        }
        formikHook.handleSubmit()
    }

    const initialValues = {
        listData : []
    }

    const secondInitialValues = {
        // DB Data
        dataIndex       : lastIndex.current+1,
        id: '',
        product_id: '',
        details : {
            total_shipping_qty: '',
            cities: []
        },
        isUpdating      : true,
        editingType     : 'head'
    };

    const onSubmit = (formData) => {
        const setData = formData.listData.filter(item => item.editingType!=='head')
        //dataIndex는 상세 내역 구분자로 사용
        const key_list = ['dataIndex','id','product_id','details','remove']

        const filteredData = setData.map(item =>
            key_list.reduce((obj, key) => {
                if (item.hasOwnProperty(key)) {
                    obj[key] = item[key]
                }
                return obj
            }, {})
        )
        setSelectedRowKeys([])
        props.selectRow('')
        props.setOrders(filteredData)
    }

    const secondOnSubmit = (formData) => {
        formData.isUpdating = TranslationOutlined
        if (!formData.editingType || formData.editingType == '') {
            formData.editingType = editingType
        }
        // REPLACE
        const targetIndex = formikHook.values.listData.findIndex(obj => obj.dataIndex === formData.dataIndex)
        // ~targetIndex && formikHook.setFieldValue(`listData[${targetIndex}]`, formData)

        if(formData.editingType === 'head'){
            var listData = formikHook.values.listData
            formData.editingType = 'add'
            listData[targetIndex] = formData
            listData = [secondInitialValues,...listData]
            formikHook.setFieldValue(`listData`, listData)
            lastIndex.current += 1
            secondFormikHook.setValues(secondInitialValues)
        }else{
            // REPLACE
            ~targetIndex && formikHook.setFieldValue(`listData[${targetIndex}]`, formData)
            secondFormikHook.setValues(secondInitialValues)
        }

        setEditingType('add')
        setRowEditing(lastIndex.current)
        formikHook.handleSubmit()
    }

    const validationSchema = Yup.object({
    })

    const secondValidationSchema = Yup.object().shape({
        //가독성 문제로 빈값으로 set
        product_id:     Yup.string().label("상품").required(' '),
    })

    const formikHook = useFormik({
        initialValues : initialValues, 
        onSubmit : onSubmit,
        validationSchema : validationSchema
    })

    const secondFormikHook = useFormik({
        initialValues : secondInitialValues, 
        onSubmit : secondOnSubmit,
        validationSchema : secondValidationSchema
    })

    const columns = [
        {
            dataIndex : "product_code",
            title : "상품코드*",
            width : 120, 
            align : "center",
        }, {
            dataIndex : "product_name", 
            title : "상품명*" ,
            width : 300,
            align : "center",
        }, {
            dataIndex : "product_qty", 
            title : "초판 제작 수량*",
            width : 100,
        },{
            dataIndex : "price", 
            title : "정가*",
            width : 80,
        },{
            dataIndex : ['details','total_shipping_qty'], 
            title : "배본 수량*",
            width : 80,
        },  
        // {
        //     dataIndex : 'work',
        //     title : '작업',
        //     width : 100, 
        //     align : 'center', 
        //     render: (text, record, index) => !index ? (<>
        //             <Typography.Link style={{marginRight: 8}} onClick={()=>save(record)}>추가</Typography.Link>
        //             <Typography.Link onClick={()=>reset(record)}>취소</Typography.Link>
        //         </>)
        //         : isEditing(record) ? (<>
        //             <Typography.Link style={{marginRight: 8}} onClick={()=>save(record)}>확인</Typography.Link>
        //             <Typography.Link onClick={()=>cancel(record)}>취소</Typography.Link>
        //         </>)
        //         : (<>
        //             <Typography.Link style={{marginRight: 8}} onClick={()=>edit(record)}>수정</Typography.Link>
        //             <Typography.Link onClick={()=>remove(record)}>삭제</Typography.Link>
        //         </>)
            
        // }
    ]

    const rowSelection = {
        type : 'radio', 
        fixed : true,
        selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows)=>{
            setSelectedRowKeys(selectedRowKeys)
            props.selectRow(selectedRows[0].product_id)
        },
        getCheckboxProps: (record) => ({
            disabled: record.editingType === 'head',
            name: record.name,
        }),
      }

    return (
        <FormikProvider value={formikHook}>
            <Row className="gridWrap" style={{width: '100%', marginTop: 10}}>
                <FormikProvider value={secondFormikHook}>
                <Table
                    rowKey = {'product_id'}
                    dataSource={formikHook.values.listData.filter(e=>e.editingType!=='remove')}
                    style={{width: '100%', marginTop: 10}}
                    bordered = {true}
                    columns={columns}
                    size = {'small'}
                    rowSelection={rowSelection}
                />
                </FormikProvider>
            </Row>
        </FormikProvider>
            
    );
};

export default observer(ProductGrid);