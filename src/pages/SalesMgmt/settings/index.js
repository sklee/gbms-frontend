import React from 'react'
import {Row, Col, Button, Typography, Table, Select, Modal } from 'antd';
import { inject, observer } from 'mobx-react';
import { FormikProvider, useFormik } from 'formik';
import FormikInput from '@components/form/CustomInput';
import { dateFormatYMD, getCurrentDate } from '@components/Common/Js';
import * as Yup from 'yup';
import Excel from '@components/Common/Excel';

const Settings = ({ commonStore }) => {
    const [ listData,     setListData    ]  = React.useState([])
    const [ rowEditing,   setRowEditing  ]  = React.useState('')
    const [ editingType,  setEditingType ]  = React.useState('')
    const [ userListData, setUserListData ] = React.useState([])
    const lastIndex                         = React.useRef(0)

    const isEditing     = (record) => record.dataIndex === rowEditing;

    React.useEffect(() => {
        fetchData()
    }, [])

    const fetchData = () => {
        commonStore.handleApi({ url : `/sales-managers` })
        .then((result) => {
            var departmentArr = []
            result.data.map((items, index) => {
                items.dataIndex = index
                items.departments.map((element) => {
                    departmentArr.push(element.id)
                })
                items.departments = departmentArr
                departmentArr = []

                lastIndex.current += 1
            })
            formikHook.setFieldValue('listData', result.data)
        })

        commonStore.handleApi({ url : `/users` })
        .then((result) => { setUserListData(result.data) })
    }

    const columns = [{
        dataIndex : 'user_name',
        title : "성명",
        width : 120,
        render : (text, record, index) => isEditing(record) ? 
            <FormikInput 
                style = {{width: '100%'}} 
                type  = {'select'} 
                name  = {`user_name`} 
                data  = {{
                    value : 'name', 
                    label : 'name', 
                    optionApiUrl : `/users`, 
                    optionsApiValue : 'name', 
                    optionsApiLabel : 'name'
                }}
                onChange={(val) => {
                    secondFormikHook.setFieldValue('user_team', userListData.filter((userData) => userData.name === val)[0]?.department)
                }}
            />
            : 
            <>{text}</>
    }, {
        dataIndex : 'user_team',
        title : "소속 부서",
        width : 150,
    }, {
        dataIndex : 'departments',
        title : "담당 부서", 
        render : (text, record, index) => isEditing(record) ? 
            <FormikInput 
                style = {{width: '100%'}} 
                type  = {'select'} 
                name  = {`departments`} 
                data  = {{
                    mode : 'multiple',
                    value : 'id', 
                    label : 'name', 
                    // optionApiUrl : '/select-department-codes?cost_attribution_company=1&rspns=1',
                    optionApiUrl : `/department-code-group-details?department_code_group_id=1`, 
                    optionsApiValue : 'id', 
                    optionsApiLabel : 'name'
                }}
            />
            : 
            <Select
                mode        = {'multiple'}
                style       = {{ width : '100%' }}
                fieldNames  = {{ value : 'id', label : 'name' }}
                allowClear  = {true}
                disabled    = {true}
                value       = {text}
                optionFilterProp = {'name'}
                options     = {[{
                    id: 1,     
                    name: "길벗 사업본부"
                }, {
                    id: 2,     
                    name: "스쿨 개발본부"
                }, {
                    id: 3,     
                    name: "스쿨 마케팅본부"
                }, {
                    id: 4,     
                    name: "어린이단행본&디자인 본부"
                }, {
                    id: 5,     
                    name: "경영지원본부"
                }, {
                    id: 79,    
                    name: "테스트 0419 바로 수정"
                }, {
                    id: 76,    
                    name: "도서출판 길벗(공통)"
                }, {
                    id: 77,    
                    name: "길벗스쿨(공통)"
                }]}
            />
    }, {
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
    }]

    const initialValues = {
        listData : []
    }

    const secondInitialValues = {
        dataIndex  : lastIndex.current+1,
        departments : [], 
        user_id : '', 
        user_name : '', 
        user_team : ''
    }
    
    const validationSchema = Yup.object({
    })

    const secondValidationSchema = Yup.object({
    })

    const onSubmit = (formData) => {
        // const returnData = formData.listData.filter(item => item.isUpdating)
        formData.listData.map((userData) => {
            delete userData.dataIndex
            delete userData.user_name
            delete userData.user_team
            userData.departments = userData.departments.map((deptCode) => {
                return {id : deptCode}
            })
        })

        commonStore.handleApi({
            method : 'POST', 
            url : '/sales-managers',
            data : formData.listData
        })
        .then((result) => {
            Modal.success({ content: '수정이 완료되었습니다.' })
            fetchData()
        })
    }

    const secondOnSubmit = (formData) => {
        // checkbox data setting 
        if (formData.supply_yn == '') {
            formData.supply_yn = 'N' 
        }

        formData.isUpdating = true
        if (!formData.editingType || formData.editingType == '') {
            formData.editingType = editingType
        }

        // REPLACE
        const targetIndex = formikHook.values.listData.findIndex(obj => obj.dataIndex === formData.dataIndex)
        ~targetIndex && formikHook.setFieldValue(`listData[${targetIndex}]`, formData)

        setEditingType('')
        setRowEditing('')
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
        console.log([secondInitialValues, ...formikHook.values.listData])
        lastIndex.current += 1
        secondFormikHook.setValues(secondInitialValues)
        setRowEditing(lastIndex.current)
    }

    const save = (record) => {
        secondFormikHook.handleSubmit()
    }

    const cancel = (record) => {
        // 새로 추가한 거인데 그룹명을 입력 안했으면 해당 Row 삭제
        record && record.id == '' && record.name == '' && formikHook.setFieldValue('listData', formikHook.values.listData.filter(item => item.dataIndex !== record.dataIndex))
        // 새로 추가한 뒤 다시 추가 버튼을 눌렀을 경우
        !record && editingType === 'add' && formikHook.setFieldValue('listData', formikHook.values.listData.filter((item, index) => index !== 0))

        setRowEditing('')
        setEditingType('')
        secondFormikHook.setValues(secondFormikHook.initialValues)
    }

    const edit = (record) => {
        setRowEditing(record.dataIndex)
        record.id && setEditingType('edit')
        secondFormikHook.setValues(record)
    }
    
    const remove = (record) => {
        setRowEditing('')
        setEditingType('')
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
                // formikHook.setFieldValue('listData', )
            }
        }
        else {
            // confirm >> 
            Modal.confirm()
        }
        secondFormikHook.setValues(secondFormikHook.initialValues)
    }

    

    return (
        <>
            <FormikProvider value={formikHook}>
                <Row className="topTableInfo" justify="space-around">
                    <Col span={24} className="topTable_right">
                        <Button className="btn btn-primary btn_add" shape="circle" onClick={() => {
                            editingType !== 'add' ? add() : cancel()
                        }} >
                            {editingType !== 'add' ? '+' : '-'}
                        </Button>
                    </Col>
                </Row>

                <Row className='gridWrap'>
                    <FormikProvider value={secondFormikHook}>
                        <Table
                            bordered
                            rowKey      = { 'user_id' }
                            dataSource  = { formikHook.values.listData }
                            columns     = { columns }
                            pagination  = {{ position : ['bottomLeft'] }}
                        />
                    </FormikProvider>
                </Row>

                <Row className='table_bot'>
                    <Col xs={16} lg={16}>
                        <div className='btn-group'>
                            <span>행 개수 : {formikHook.values.listData.length}</span>
                        </div>
                    </Col>
                    <Excel />
                </Row>

                <Row gutter={[10, 10]} justify="center">
                    <Col>
                        <Button onClick={formikHook.handleSubmit} type="primary" htmlType="button">확인</Button>
                        <Button htmlType="button" style={{marginLeft:'10px'}}>취소</Button>
                    </Col>
                </Row>
            </FormikProvider>
        </>
    )
}

export default inject('commonStore')(observer(Settings))