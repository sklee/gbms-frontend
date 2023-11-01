import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Button, Row, Col, Table, Typography, Modal } from 'antd';
import { inject, observer } from 'mobx-react'
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import FormikInput from '@components/form/CustomInput';

const { Text } = Typography;

const RegionGrid = ({ regionData, accountOptions, setCities }) => {
    const [rowEditing,setRowEditing] = useState('')
    const [editingType,setEditingType] = useState('')
    const [qtySum,setQtySum] = useState(0)
    const [accountList,setAccountList] = useState([])
    const [branchList,setBranchList] = useState([])
    const [selBranch,setSelBranch] = useState('')
    const lastIndex = useRef(0)

    const isEditing     = (record) => record.dataIndex === rowEditing;

    useEffect(() => {
        let sum = 0
        const fetchList = regionData.shipping_infos.map((items,index)=>{
            sum += items.shipping_qty
            items.dataIndex = index
            items.isUpdating = true
            lastIndex.current += 1
            return items
        })
        setQtySum(sum)
        formikHook.setFieldValue('city_id', regionData.city_id)
        formikHook.setFieldValue('part_shipping_qty', sum)
        formikHook.setFieldValue('listData', fetchList)
    }, [])

    useEffect(() => {
        const temp_branch = []
        accountOptions.map(item=>{
            item.branches.map(obj=>{
                temp_branch.push(obj)
            })
        })
        setAccountList(accountOptions)
        setBranchList([...temp_branch])
    }, [accountOptions])

    const commaNum = (num) => {
        if(num){
            const number = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return number
        }else{
            return 0;
        }
    };

    const getbranch = useCallback(()=>{
        // return branchList ? (selBranch ? branchList.filter(e=>e.sales_account_id === selBranch) :[]) : []
        return branchList && selBranch ? branchList.filter(e=>e.sales_account_id === selBranch) :[]
    },[selBranch])

    const columns = [
        {
            dataIndex : 'sales_account_id',
            title : "거래처명(본점) *",
            width : "*",
            minWidth : 100,
            render : (text, record, index) => isEditing(record) ? <FormikInput type={'select'} style={{width:'100%'}} name={'sales_account_id'} 
                    data={{
                        allowClear      : true, 
                        value           : 'id',
                        label           : 'name',
                        options         : accountList??[],
                    }}
                    onChange={((e,f,g)=>{
                        secondFormikHook.setFieldValue('region',accountList.find(item=>item.id===e).region)
                        secondFormikHook.setFieldValue('sales_managers',accountList.find(item=>item.id===e).sales_managers)
                        secondFormikHook.setFieldValue('sales_account_branch_id','')
                        setSelBranch(e)
                    })}
                /> : <div>{accountList?accountList.find(item=>item.id===record.sales_account_id)?.name:record.sales_account_name}</div>
        }, {
            dataIndex : 'sales_account_branch_id',
            title : "지점", 
            width : 180,
            render : (text, record, index) => isEditing(record) ? <FormikInput type={'select'} style={{width:'100%'}} name={'sales_account_branch_id'}
                    data={{
                        allowClear      : true, 
                        value           : 'id',
                        label           : 'name',
                        options         : getbranch(),
                    }}
                    disabled={getbranch().length===0}
            /> : <div>{branchList.find(item=>item.id===record.sales_account_branch_id)?.name}</div>
        }, {
            dataIndex : 'region',
            title : '지역',
            width : 120,
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'region'} readOnly/> : <div>{record.region}</div>
        }, {
    
            dataIndex : 'sales_managers',
            title : '담당',
            width : 120,
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'sales_managers'} readOnly/> : <div>{record.sales_managers}</div>
        }, {
            dataIndex : 'shipping_qty',
            title : '배본수량*',
            width : 80,
            align : "right",
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'shipping_qty'}/> : <div>{record.shipping_qty}</div>
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
        sales_managers          : '',
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
        const filteredData = returnData.map(({sales_account_id, sales_account_branch_id, shipping_qty})=>({sales_account_id, sales_account_branch_id, shipping_qty}))

        let sum = 0
        returnData.map(item=>sum += Number(item.shipping_qty))
        setQtySum(sum)

        const submitData = {city_id: formData.city_id, shipping_infos: filteredData}
        setCities(submitData)
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
                    <div className="table_title" style={{width: '100%', justifyContent: 'space-between'}}>
                        <Text>{regionData.city_name + ' (배본 수량 합계: ' + commaNum(qtySum) + ')'}</Text>
                        <Button  type={'button'} className="btn btn-primary btn_add" shape="circle" onClick={() => {
                            editingType !== 'add' ? add() : cancel()
                        }} >
                            {editingType !== 'add' ? '+' : '-'}
                        </Button>
                    </div>

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