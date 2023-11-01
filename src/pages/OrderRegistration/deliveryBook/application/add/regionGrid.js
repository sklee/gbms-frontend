import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Button, Row, Col, Table, Typography } from 'antd';
import { inject, observer } from 'mobx-react'
import { useFormik, FormikProvider, useFormikContext } from 'formik';
import * as Yup from 'yup';
import FormikInput from '@components/form/CustomInput';

const { Text } = Typography;

const RegionGrid = ({ regionData, shippingDetails, setShippingDetails, setIndex }) => {
    const [rowEditing,setRowEditing] = useState('')
    const [editingType,setEditingType] = useState('')
    const [qtySum,setQtySum] = useState(0)
    const [branchList,setBranchList] = useState([])
    const [selBranch,setSelBranch] = useState('')
    const lastIndex = useRef(0)

    const isEditing     = (record) => record.dataIndex === rowEditing;

    useEffect(() => {
        let sum = 0
        const fetchList = regionData.shipping_infos.map((items,index)=>{
            sum += Number(items.shipping_qty)
            items.dataIndex = index
            items.isUpdating = true
            lastIndex.current += 1
            return items
        })
        !qtySum && setQtySum(sum)
        formikHook.setFieldValue('city_id', regionData.city_id)
        formikHook.setFieldValue('part_shipping_qty', sum)
        formikHook.setFieldValue('listData', fetchList)
    }, [regionData])

    const commaNum = (num) => {
        if(num){
            const number = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return number
        }else{
            return 0;
        }
    };

    const getbranch = useCallback(()=>{
        return branchList && selBranch ? branchList.filter(e=>e.sales_account_id === selBranch) :[]
    },[selBranch])

    const columns = [
        {
            dataIndex : 'sales_account_id',
            title : "거래처명(본점) *",
            width : "*",
            minWidth : 100,
            render : (text, record, index) => <div>{record.sales_account_name}</div>
        }, {
            dataIndex : 'region',
            title : '지역',
            width : 120,
        }, {
    
            dataIndex : 'managers',
            title : '담당',
            width : 120,
        }, {
            dataIndex : 'shipping_qty',
            title : '배본수량*',
            width : 80,
            align : "right",
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'shipping_qty'}/> : <div>{record.shipping_qty}</div>
        },{
            dataIndex : 'supply_rate1',
            title : '공급률(위탁)',
            width : 100,
            align : "right",
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'supply_rate1'}/> : <div>{record.supply_rate1}</div>
        },{
            dataIndex : 'newbook_yn',
            title : '신간 배본',
            width : 80,
            render : (text, record, index) => record.newbook_yn === 'Y' ?'예' : '아니오'
        },{
            dataIndex : 'work',
            title : '작업',
            width : 120, 
            align : 'center', 
            render: (text, record, index) => isEditing(record) ? (
                <>
                    <Typography.Link onClick={() => save(record)} style={{marginRight: 8}}>저장</Typography.Link>
                    <Typography.Link onClick={() => cancel(record)}>취소</Typography.Link>
                </>
            ) : (
                <>
                    <Typography.Link onClick={() => edit(record)} style={{marginRight: 8}}>수정</Typography.Link>
                    <Typography.Link onClick={() => remove(record)}>삭제</Typography.Link>
                </>
            )
        }
    ]

    const initialValues = {
        city_id : '',
        part_shipping_qty : '',
        listData : []
    }

    const secondInitialValues = {
        dataIndex               : lastIndex.current+1,
        id                      : '',
        sales_account_id        : '',
        sales_account_name      : '',
        sales_account_branch_id : '',
        region                  : '',
        managers          : '',
        shipping_qty            : 0,
        isUpdating              : true,
        editingType             : 'add'
    }
    
    const validationSchema = Yup.object({
    })

    const secondValidationSchema = Yup.object({
        sales_account_id        : Yup.string().label("거래처명").required(),
        shipping_qty            : Yup.number().label("배본수량").min(1, " ").required(" "),
    })

    const onSubmit = (formData) => {
        const returnData = formData.listData.filter(item => item.isUpdating)
        
        let sum = 0
        returnData.map(item=>sum += Number(item.shipping_qty))
        setQtySum(sum)
        const submitData = {city_id: formData.city_id, city_name:regionData.city_name, shipping_infos: returnData}

        //수정 부분 파싱하여 데이터 저장
        let parse_sum = 0
        const parseData = [...shippingDetails]
        parseData[setIndex.ordersIndex].details.cities[setIndex.citiesIndex] = submitData
        parseData[setIndex.ordersIndex].details.cities.map(item=>{
            item.shipping_infos.map(e=>{parse_sum+=Number(e.shipping_qty)})
        })
        parseData[setIndex.ordersIndex].details.total_shipping_qty = parse_sum
        setShippingDetails(parseData)
    }

    const secondOnSubmit = (formData) => {
        formData.isUpdating = true
        if (!formData.editingType || formData.editingType == '') {
            formData.editingType = editingType
        }

        // REPLACE
        const targetIndex = formikHook.values.listData.findIndex(obj => obj.dataIndex === formData.dataIndex)
        ~targetIndex && formikHook.setFieldValue(`listData[${targetIndex}]`, formData)

        setEditingType('')
        setRowEditing('')

        formikHook.handleSubmit()
    }

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

    const add = () => {
        setEditingType('add')
        formikHook.setFieldValue('listData', [secondInitialValues, ...formikHook.values.listData])
        lastIndex.current += 1
        secondFormikHook.setValues(secondInitialValues)
        setRowEditing(lastIndex.current)
    }

    const save = (record) => {
        secondFormikHook.handleSubmit()
    }

    const cancel = (record) => {
        record && record.id == '' && editingType === 'add' && formikHook.setFieldValue('listData', formikHook.values.listData.filter(item => item.dataIndex !== record.dataIndex))
        
        // 새로 추가한 뒤 다시 추가 버튼을 눌렀을 경우
        !record && editingType === 'add' && formikHook.setFieldValue('listData', formikHook.values.listData.filter((item, index) => index !== 0))

        setRowEditing('')
        setEditingType('')
        secondFormikHook.setValues(secondFormikHook.initialValues)
    }

    const edit = (record) => {
        setRowEditing(record.dataIndex)
        setSelBranch(record.sales_account_id)
        record.id && setEditingType('edit')
        secondFormikHook.setValues(record)
    }
    
    const remove = (record) => {
        setRowEditing('')
        setEditingType('')
        const targetIndex = formikHook.values.listData.findIndex(obj => obj.dataIndex === record.dataIndex)
        if ( ~targetIndex ) {
            formikHook.setFieldValue('listData', formikHook.values.listData.filter(item => item.dataIndex !== record.dataIndex))
        }
        secondFormikHook.setValues(secondFormikHook.initialValues)
        formikHook.handleSubmit()
    }

    return (
        <div style={{marginBottom: 30}}>
            <FormikProvider value={formikHook}>
                <Row className='table marginTop'>
                    <div className="table_title">
                        <Text>{regionData?.city_name + ' (배본 수량 합계: ' + commaNum(qtySum) + ')'}</Text>
                    </div>
                    {/* <Col span={24} className='addLabel' style={{display: 'flex', justifyContent: 'space-between'}}>
                        <Text>{regionData?.city_name + ' (배본 수량 합계: ' + commaNum(qtySum) + ')'}</Text>
                    </Col> */}
                    <Col span={24} className='innerCol'>
                        <Row className='gridWrap'>
                            <FormikProvider value={secondFormikHook}>
                                <Table
                                    bordered
                                    size        = {'small'}
                                    rowKey      = { 'dataIndex' }
                                    dataSource  = { formikHook.values.listData }
                                    columns     = { columns }
                                />
                            </FormikProvider>
                        </Row>
                    </Col>
                </Row>
            </FormikProvider>
        </div>
    )
}

export default inject('commonStore')(observer(RegionGrid))