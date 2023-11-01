import React from 'react'
import {Row, Col, Button, Typography, Table, Modal } from 'antd';
import { observer, inject } from 'mobx-react';
import { useFormik, FormikProvider } from 'formik';
import { getCurrentYmd } from '@components/Common/Js';
import FormikInput, { FormikContainer } from '@components/form/CustomInput';
import * as Yup from 'yup';

const BasicPolicy = ({ commonStore, drawerClose, rowData }) => {
    const [rowEditing, setRowEditing] = React.useState('')
    const isEditing = (record) => record.department_id === rowEditing;

    const initialValues = {
        name : '', 
        company : '1', 
        overwrite_yn : 'N', 
        departments : [{
            department_id : '',
            department_name : '',
            supply_rate1 : '',
            supply_rate2 : '',
            supply_rate3 : '',
            supply_rate4 : '',
            supply_rate5 : '',
            buyout_quantity : '',
            supply_yn : 'Y',
        }], 
        created_at : getCurrentYmd(), 
        created_name : commonStore.user.name, 
    }

    const secondInitialValues = {
        department_id : '',
        department_name : '',
        supply_rate1 : '0',
        supply_rate2 : '0',
        supply_rate3 : '0',
        supply_rate4 : '0',
        supply_rate5 : '0',
        buyout_quantity : '0',
        supply_yn : 'Y',
    }

    const validationSchema = Yup.object({
        name : Yup.string().label('대표자').required(), 
        company : Yup.string().label('대상 회사').required(), 
    })

    const secondValidationSchema = Yup.object({
        department_name :   Yup.string().label("부서명").required(), 
        supply_rate1 :      Yup.number().label("위탁").required(),
        supply_rate2 :      Yup.number().label("현매").required(),
        supply_rate3 :      Yup.number().label("매절").required(),
        supply_rate4 :      Yup.number().label("납품").required(),
        supply_rate5 :      Yup.number().label("기타").required(),
        buyout_quantity :   Yup.number().label("매절 부수").required(),
    })

    const secondOnSubmit = (formData) => {
        // checkbox data setting 
        if (formData.supply_yn == '') {
            formData.supply_yn = 'N' 
        }
        // REPLACE
        const targetIndex = formikHook.values.departments.findIndex(obj => obj.department_id === formData.department_id)
        ~targetIndex && formikHook.setFieldValue(`departments[${targetIndex}]`, formData)
        setRowEditing('')
    }

    const onSubmit = (formData) => {
        delete formData.created_at
        delete formData.created_name

        commonStore.handleApi({
            method : 'POST', 
            url : '/sales-transaction-policy-groups', 
            data : formData
        })
        .then(() => {
            Modal.success({
                content: '등록이 완료되었습니다.',
                afterClose: drawerClose
            })
        })
        
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

    React.useEffect(() => {
        fetchListData()
        // console.log(rowData)
        // rowData !== '' && fetchListData()
        // rowData === '' && fetchDefaultData("1")
    }, [])

    const fetchListData = () => {
        commonStore.handleApi({
            method : 'GET', 
            url : `/sales-transaction-policy-groups/${rowData}`
        })
        .then((result) => {
            result.data.overwrite_yn = 'N'
            delete result.data.updated_at
            delete result.data.updated_name
            formikHook.setValues(result.data)
        })
    }

    const fetchDefaultData = (company) => {
        commonStore.handleApi({
            method : 'GET', 
            url : `/select-department-codes`,
            data : {
                cost_attribution_company : company,
                rspns : 1
            }
        })
        .then((result) => {
            // 신규 부서 기본 정책 밀어넣기
            result.data.map((item) => {
                item.department_id = item.id
                item.department_name = item.name
                item.supply_rate1 = 0
                item.supply_rate2 = 0
                item.supply_rate3 = 0
                item.supply_rate4 = 0
                item.supply_rate5 = 0
                item.buyout_quantity = 0
                item.supply_yn = 'Y'

                delete item.id
                delete item.name
                delete item.code
            })
            
            result.data.unshift({
                department_id : 0,
                department_name : '신규 부서 기본 정책',
                supply_rate1 : 0,
                supply_rate2 : 0,
                supply_rate3 : 0,
                supply_rate4 : 0,
                supply_rate5 : 0,
                buyout_quantity : 0,
                supply_yn : 'Y'
            })

            formikHook.setFieldValue('departments', result.data)
        })
    }

    const edit = (record) => {
        delete record.id
        delete record.group_id
        setRowEditing(record.department_id)
        secondFormikHook.setValues(record)
    }
    
    const cancel = () => {
        secondFormikHook.setValues(secondFormikHook.initialValues)
        setRowEditing('')
    }

    const save = async (e) => {
        secondFormikHook.handleSubmit()
    }

    const columns = [{
        dataIndex : 'department_name', 
        title : "부서",
        width : "*",
        editable: true,
        render : (text, record, index) => isEditing(record) ? <FormikInput name={'department_name'}/> : <>{text}</>
    }, {
        dataIndex : 'supply_rate1', 
        title : "위탁",
        width : 100,
        editable: true,
        align : 'right',
        render : (text, record, index) => isEditing(record) ? <FormikInput name={'supply_rate1'}/> : <>{text}</>
    }, {
        dataIndex : 'supply_rate2', 
        title : "현매",
        width : 100,
        editable: true,
        align : 'right',
        render : (text, record, index) => isEditing(record) ? <FormikInput name={'supply_rate2'}/> : <>{text}</>
    }, {
        dataIndex : 'supply_rate3', 
        title : "매절",
        width : 100,
        editable: true,
        align : 'right',
        render : (text, record, index) => isEditing(record) ? <FormikInput name={'supply_rate3'}/> : <>{text}</>
    }, {
        dataIndex : 'supply_rate4', 
        title : "납품",
        width : 100,
        editable: true,
        align : 'right',
        render : (text, record, index) => isEditing(record) ? <FormikInput name={'supply_rate4'}/> : <>{text}</>
    }, {
        dataIndex : 'supply_rate5', 
        title : "기타",
        width : 100,
        editable: true,
        align : 'right',
        render : (text, record, index) => isEditing(record) ? <FormikInput name={'supply_rate5'}/> : <>{text}</>
    }, {
        dataIndex : 'buyout_quantity', 
        title : "매절 부수",
        width : 100,
        editable: true,
        align : 'right',
        render : (text, record, index) => isEditing(record) ? <FormikInput name={'buyout_quantity'}/> : <>{text}</>
    }, {
        dataIndex : 'supply_yn', 
        title : "공급 여부",
        width : 100,
        editable: true,
        align : 'center',
        render : (text, record, index) => isEditing(record) ? 
            <FormikInput style={{justifyContent : 'center'}} type={'checkbox'} name={'supply_yn'} data={{checkboxData : [{value : 'Y'}]}}/>
            : 
            <FormikInput style={{justifyContent : 'center'}} type={'checkbox'} name={`supply_yn.${index}`} disabled value={text} data={{checkboxData : [{value : 'Y'}]}}/>
    }, {
        dataIndex : 'work', 
        title : "작업",
        width : 100,
        align : 'center',
        render: (text, record, index) => isEditing(record) ? (
            <>
                <Typography.Link onClick={() => save(record.department_id)} style={{marginRight: 8}}>저장</Typography.Link>
                <Typography.Link onClick={cancel}>취소</Typography.Link>
            </>
        ) : (
            <>
                <Typography.Link disabled={rowEditing !== ''} onClick={() => edit(record)}>수정</Typography.Link>
            </>
        )
    }]

    return (
        <FormikProvider value={formikHook}>
            <Row className='table'>
                <FormikContainer perRow={2} label={'대표자'} name={'name'} required/>
                <FormikContainer perRow={2} type={'radio'} label={'대상 회사'} name={'company'} required disabled={rowData !== '' ? true : false} 
                    onChange = {(e) => fetchDefaultData(e.target.value)}
                    data = {{
                        radioData : [
                            {
                                label : '도서출판 길벗', 
                                value : "1"
                            }, {
                                label : '길벗스쿨', 
                                value : "2"
                            },
                        ]
                    }}
                />
                <FormikContainer perRow={2} label={'등록일'} name={'created_at'} disabled readOnly/>
                <FormikContainer perRow={2} label={'등록자'} name={'created_name'} disabled readOnly/>
            </Row>

            <Row className="gridWrap" style={{ margin: '20px 0' }}>
                <FormikProvider value={secondFormikHook}>
                    <Table
                        bordered
                        rowKey={'department_id'}
                        dataSource={formikHook.values.departments}
                        columns={columns}
                    />
                </FormikProvider>
            </Row>

            <Row gutter={10} justify="center" style={{ margin: '20px 0' }}>
                <FormikInput type={'radio'} name={'overwrite_yn'} 
                    data={{
                        align : 'column', 
                        radioData : [
                            {
                                label : '앞으로 등록되는 거래처에만 수정사항을 반영합니다.', 
                                value : 'Y'
                            }, {
                                label : '이미 등록된 모든 거래처에도 수정사항을 반영합니다.', 
                                value : 'N'
                            }
                        ]
                    }}
                />
            </Row>

            <Row gutter={[10, 10]} justify="center">
                <Col>
                    <Button onClick={formikHook.handleSubmit} type="primary" htmlType="button">확인</Button>
                    <Button onClick={drawerClose} htmlType="button" style={{marginLeft:'10px'}}>취소</Button>
                </Col>
            </Row>

        </FormikProvider>
        
    )
}

export default inject('commonStore')(observer(BasicPolicy))
