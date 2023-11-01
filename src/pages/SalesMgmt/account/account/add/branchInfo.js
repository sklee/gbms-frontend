import React from 'react'
import {Row, Col, Button, Modal, Typography, Table } from 'antd';

import { inject, observer } from 'mobx-react';
import FormikInput from '@components/form/CustomInput';
import * as Yup from 'yup';
import { useFormik, FormikProvider } from 'formik';

const BranchInfo = ({ commonStore, data, drawerClose }) => {
    const [listData, setListData] = React.useState([])
    const [rowEditing, setRowEditing] = React.useState('')
    const [editingType, setEditingType] = React.useState('')
    const lastIndex = React.useRef(0)
    const isEditing = (record) => record.dataIndex === rowEditing;

    const columns = [
        {
            dataIndex : 'branch_code',
            title : "지점코드",
            width : 100,
            align : "center", 
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'branch_code'}/> : <>{text}</>
        }, {
            dataIndex : 'logistics_code',
            title : "물류코드", 
            width : "*",
            minWidth : 100,
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'logistics_code'}/> : <>{text}</>
        }, {
            dataIndex : 'name',
            title : '지점명',
            width : 120,
            align : "center",
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'name'}/> : <>{text}</>
        }, {

            dataIndex : 'region',
            title : '지역',
            width : 120,
            align : "center",
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'region'}/> : <>{text}</>
        }, {
            dataIndex : 'phone_number',
            title : '전화번호',
            width : 120,
            align : "center",
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'phone_number'}/> : <>{text}</>
        }, {
            dataIndex : 'note',
            title : '참고사항',
            width : 120,
            align : "center",
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'note'}/> : <>{text}</>
        }, {
            dataIndex : 'use_yn',
            title : '사용 여부',
            width : 120,
            align : 'center',
            render : (text, record, index) => isEditing(record) ? 
            <FormikInput style={{justifyContent : 'center'}} type={'checkbox'} name={'use_yn'} data={{checkboxData : [{value : 'Y'}]}}/>
            : 
            <FormikInput style={{justifyContent : 'center'}} type={'checkbox'} name={`use_yn.${index}`} disabled value={text} data={{checkboxData : [{value : 'Y'}]}}/>
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
                <Typography.Link onClick={() => edit(record)} style={{marginRight: 8}}>수정</Typography.Link>
            )
        }
    ]

    const initialValues = {
        dataIndex       : lastIndex.current+1,
        id              : '',
        branch_code     : '',
        logistics_code  : '',
        name            : '',
        region          : '',
        note            : '',
        phone_number    : '',
        isUpdating      : true,
        editingType     : 'add'
    }

    const validationSchema = Yup.object({
        logistics_code : Yup.string().label('물류코드').required(), 
        name : Yup.string().label('지점명').required(),
    })

    const onSubmit = (formData) => {
        formData.isUpdating = true
        if (!formData.editingType || formData.editingType == '') {
            formData.editingType = editingType
        }

        // REPLACE
        const targetIndex = listData.findIndex(obj => obj.dataIndex === formData.dataIndex)
        if (~targetIndex) {
            const thisListData = listData.map((item, index) => {
                if (index === targetIndex ) return formData
                else return item
            })
            setListData(thisListData)
        }

        setEditingType('')
        setRowEditing('')
    }

    const formikHook = useFormik({
        initialValues : initialValues, 
        onSubmit : onSubmit,
        validationSchema : validationSchema
    })

    const add = () => {
        setEditingType('add')
        setListData([initialValues, ...listData])
        lastIndex.current += 1
        formikHook.setValues(initialValues)
        setRowEditing(lastIndex.current)
    }

    const save = (record) => {
        formikHook.handleSubmit()
    }

    const cancel = (record) => {
        // 새로 추가한 거인데 필수값도 없으면 날리기
        record && record.name === '' && record.id == '' && setListData(listData.filter(item => item.dataIndex !== record.dataIndex))
        // 새로 추가한 뒤 다시 추가 버튼을 눌렀을 경우
        !record && editingType === 'add' && setListData(listData.filter((item, index) => index !== 0))
        setRowEditing('')
        setEditingType('')
        formikHook.setValues(formikHook.initialValues)
    }

    const edit = (record) => {
        setRowEditing(record.dataIndex)
        record.id && setEditingType('edit')
        formikHook.setValues(record)
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
            }
        }
        formikHook.setValues(formikHook.initialValues)
    }

    const formSubmit = () => {
        var sendData = listData.filter(item => item.isUpdating)

        sendData.map((item) => {
            // 공통적인 부분 잘라내기
            delete item.isUpdating
            delete item.dataIndex
            // 추가하는 것에는 id값을 넣지 않는다. 
            if (item.editingType == 'add') {
                delete item.id
            }
            delete item.editingType
        })

        console.log(sendData)
        


        commonStore.handleApi({
            method : 'POST',
            url : `/sales-account-branches/${data.accountId}`,
            data : sendData
        })
        .then(() => {
            Modal.success({
                content: '수정이 완료되었습니다.',
            })
        })
    }

    const fetchData = () => {
        if (data?.accountId) {
            commonStore.handleApi({
                url : `/sales-account-branches/${data.accountId}`,
            })
            .then((result) => {
                result.data.map((item) => {
                    item.dataIndex = lastIndex.current
                    item.isUpdating = false
                    lastIndex.current += 1
                })

                setListData(result.data)
            })
        }
    }

    React.useEffect(() => {
        fetchData()
    }, [])

    return(
        <>
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
                <FormikProvider value={formikHook}>
                    <Table
                        bordered
                        rowKey={'dataIndex'}
                        dataSource={listData}
                        columns={columns}
                        pagination={{onChange: cancel,}}
                    />
                </FormikProvider>
            </Row>

            <Row className='table_bot'>
                <div className='btn-group'>
                    <span>행 개수 : {listData.length}</span>
                </div>
            </Row>


            <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                <Col>
                    <Button onClick={formSubmit} type="primary" htmlType="button">확인</Button>
                    <Button onClick={drawerClose} htmlType="button" style={{marginLeft:'10px'}}>취소</Button>
                </Col>
            </Row>

        </>
    )
}


export default inject('commonStore')(observer(BranchInfo))