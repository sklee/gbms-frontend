import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Row, Button, Table, Typography, Input } from 'antd';
import { Form, Formik, useFormik, FieldArray, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { observer, useLocalStore } from 'mobx-react';
import FormikInput from '@components/form/CustomInput';
import { toJS } from 'mobx';

import useStore from '@stores/useStore';

const ParcelGrid = observer(( props ) =>{
    const { commonStore } = useStore();
    const [rowEditing, setRowEditing] = useState('')
    const [editingType, setEditingType] = useState('')
    const lastIndex = useRef(1)
    const isEditing = (record) => (record.dataIndex === rowEditing) ? true : (!rowEditing && record.editingType === 'head')

    const option1 = [{
        value: '1',
        label: '날인'
    },{
        value: '2',
        label: '제외'
    }]
    
    const option2 = [{
        value: '1',
        label: '홍보'
    },{
        value: '2',
        label: '저자'
    },{
        value: '3',
        label: '외주 업체'
    },{
        value: '4',
        label: '직원 참고'
    },{
        value: '5',
        label: '영업'
    },{
        value: '6',
        label: '견본'
    },{
        value: '7',
        label: '포인트 구매'
    },{
        value: '8',
        label: 'A/S'
    }]
    const state = useLocalStore(() => ({
        list: [],
        products : [],
    }));

    useEffect(()=>{
        if(props.id){
            props.details.map((item,index)=>{
                item.dataIndex = index + 1
                item.isUpdating = false
                item.editingType = 'edit'
                lastIndex.current = index + 2
            })
            const initRef = secondInitialValues
            initRef.dataIndex = lastIndex.current
            const init_obj = [initRef,...props.details]
            formikHook.setFieldValue('listData',init_obj)
            secondFormikHook.setValues(initRef)
            onSubmit({listData:init_obj})//details 재배열
        }else if(props.details.length > 0){
            props.details.map((item,index)=>{
                item.dataIndex = index + 1
                item.isUpdating = true
                item.editingType = 'add'
                lastIndex.current = index + 2
            })
            const initRef = secondInitialValues
            initRef.dataIndex = lastIndex.current
            const init_obj = [initRef,...props.details]
            formikHook.setFieldValue('listData',init_obj)
            secondFormikHook.setValues(initRef)
            onSubmit({listData:init_obj})//details 재배열
        }else{
            add()
        }
    },[])

    useEffect(()=>{
        state.products = props.company_list
    },[props.company_list])

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
        // record.id && setEditingType('edit')
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
            }
        }
        secondFormikHook.setValues(secondFormikHook.initialValues)
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
        qty: '',
        stamp: '',
        usage: '',
        detail_info: '',
        name: '',
        address: '',
        phone_number: '',
        isUpdating      : true,
        editingType     : 'head'
    };

    const onSubmit = (formData) => {
        const setData = formData.listData.filter(item => item.editingType!=='head')
        const key_list = ['id','product_id','qty','stamp','usage','detail_info','name','address','phone_number']

        const filteredData = setData.map(item =>
            key_list.reduce((obj, key) => {
                if (item.hasOwnProperty(key)) {
                    obj[key] = item[key]
                }
                return obj
            }, {})
        )
        !setData.id && delete filteredData.id
        props.setDetails(filteredData)
    }

    const secondOnSubmit = (formData) => {
        formData.isUpdating = true
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
        qty:            Yup.string().label("수량").required(' '),
        stamp:          Yup.string().label("기증 도장").required(' '),
        usage:          Yup.string().label("용도 분류").required(' '),
        name:           Yup.string().label("성명/사업자명").required(' '),
        address:        Yup.string().label("주소").required(' '),
        phone_number:   Yup.string().label("전화번호").required(' '),
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
            render : (item,record) => isEditing(record) ? 
                        <FormikInput type={'select'} name={'product_id'} style={{width: '100%'}}
                            data={{
                                allowClear      : true, 
                                value           : 'id',
                                label           : 'product_code',
                                options         : state.products,
                            }}
                        />  : state.products.find(e=> e.id ==record.product_id)?.product_code
        }, {
            dataIndex : "product_name", 
            title : "상품명*" ,
            width : 150,
            align : "center",
            render : (item,record) => isEditing(record) ? 
                        <FormikInput type={'select'} name={'product_id'} style={{width: '100%'}}
                            data={{
                                allowClear      : true, 
                                value           : 'id',
                                label           : 'name',
                                options         : state.products,
                            }}
                        /> : state.products.find(e=> e.id ==record.product_id)?.name
        }, {
            dataIndex : "qty", 
            title : "수량*",
            width : 80,
            render : (item,record) => isEditing(record) ? <FormikInput name={'qty'}/> : item
        }, {
            dataIndex : "stamp", 
            title : "기증 도장*",
            width : 120,
            render : (item,record) => isEditing(record) ? 
                        <FormikInput type={'select'} name={'stamp'} style={{width: '100%'}}
                            data={{
                                allowClear      : true, 
                                options         : option1
                            }}
                        /> : option1.find(e=>e.value==item)?.label
        },  {
            dataIndex : "usage_name", 
            title : "용도 분류*" ,
            width : 120,
            align : "center",
            render : (item,record) => isEditing(record) ? 
                        <FormikInput type={'select'} name={'usage'} style={{width: '100%'}}
                            data={{
                                allowClear      : true, 
                                options         : option2
                            }}
                        /> : option2.find(e=>e.value==record.usage)?.label
        }, {
            dataIndex : "detail_info", 
            title : "상세 용도",
            width : 120,
            render : (item,record) => isEditing(record) ? <FormikInput name={'detail_info'}/> : item
        }, {
            dataIndex : "name", 
            title : "성명/사업자명*",
            width : 130,
            render : (item,record) => isEditing(record) ? <FormikInput name={'name'}/> : item
        },  {
            dataIndex : "address", 
            title : "주소*" ,
            width : 180,
            align : "center",
            render : (item,record) => isEditing(record) ? <FormikInput name={'address'}/> : item
        }, {
            dataIndex : "phone_number", 
            title : "전화번호*",
            width : 150,
            render : (item,record) => isEditing(record) ? <FormikInput name={'phone_number'}/> : item
        }, {
            dataIndex : 'work',
            title : '작업',
            width : 120, 
            align : 'center', 
            render: (text, record, index) => !index ? (<>
                    <Typography.Link style={{marginRight: 8}} onClick={()=>save(record)}>추가</Typography.Link>
                    <Typography.Link onClick={()=>reset(record)}>취소</Typography.Link>
                </>)
                : isEditing(record) ? (<>
                    <Typography.Link style={{marginRight: 8}} onClick={()=>save(record)}>확인</Typography.Link>
                    <Typography.Link onClick={()=>cancel(record)}>취소</Typography.Link>
                </>)
                : (<>
                    <Typography.Link style={{marginRight: 8}} onClick={()=>edit(record)}>수정</Typography.Link>
                    <Typography.Link onClick={()=>remove(record)}>삭제</Typography.Link>
                </>)
            
        }
    ]

    return (
        <FormikProvider value={formikHook}>
            <Row className="gridWrap" style={{width: '100%', marginTop: 10}}>
                <FormikProvider value={secondFormikHook}>
                <Table
                    key={'parcelGridKey'}
                    rowKey = {'dataIndex'}
                    dataSource={formikHook.values.listData.filter(e=>e.editingType!=='remove')}
                    style={{width: '100%', marginTop: 10}}
                    bordered = {true}
                    columns={columns}
                    size = {'small'}
                />
                </FormikProvider>
            </Row>
        </FormikProvider>
            
    );
});

export default ParcelGrid;