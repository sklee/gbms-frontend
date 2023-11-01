import React from 'react';
import { Button, Row, Col, Table, Typography, Modal, Input, DatePicker } from 'antd';
import { CollectionView } from '@grapecity/wijmo';
import * as wjInput from '@grapecity/wijmo.react.input';
import { inject, observer } from 'mobx-react'
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import FormikInput from '@components/form/CustomInput';
import { dateFormatYMD, getCurrentDate } from '@components/Common/Js';
import ListDrawer from './drawer';
import Excel from '@components/Common/Excel';

const AccountGroup = ({ commonStore }) => {
    const [ drawerVisible,   setDrawerVisible ] = React.useState(false);
    const [ rowEditing,      setRowEditing    ] = React.useState('')
    const [ editingType,     setEditingType   ] = React.useState('')
    const [ targetData,      setTargetData ]    = React.useState([])
    const lastIndex                             = React.useRef(0)
    const dateItemName = [{id: 1, name: '적용일'}];

    const isEditing     = (record) => record.dataIndex === rowEditing;
    const drawerOpen    = () => setDrawerVisible(true);
    const drawerClose   = () => { setDrawerVisible(false); setTargetData([]); fetchListData()}

    const { Search } = Input;

    React.useEffect(() => {
        fetchListData()
    }, [])

    const columns = [
        {
            dataIndex : 'id',
            title : "그룹 코드",
            width : 100,
            align : "center"
        }, {
            dataIndex : 'name',
            title : "그룹명", 
            width : "*",
            minWidth : 100,
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'name'}/> : <div onClick={() => { if (record?.id && record.id !== ''){drawerOpen(); setTargetData(record)}}} style={ record?.id && record.id !== '' ? {cursor:'pointer'} : {}}>{text}</div>
        }, {
            dataIndex : 'accounts_count',
            title : '등록 거래처 수',
            width : 120,
            align : "right"
        }, {
    
            dataIndex : 'created_at',
            title : '등록일',
            width : 100,
        }, {
            dataIndex : 'created_name',
            title : '등록자',
            width : 120,
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
                <>
                    <Typography.Link onClick={() => edit(record)} style={{marginRight: 8}}>수정</Typography.Link>
                    <Typography.Link onClick={() => remove(record)}>삭제</Typography.Link>
                </>
            )
        }
    ]

    const initialValues = {
        listData : []
    }

    const secondInitialValues = {
        dataIndex       : lastIndex.current+1,
        id              : '',
        name            : '',
        accounts_count  : 0,
        created_at      : dateFormatYMD(getCurrentDate(), '.'),
        created_name    : commonStore.user.name,
        use_yn          : 'Y',
        isUpdating      : true,
        editingType     : 'add'
    }
    
    const validationSchema = Yup.object({
    })

    const secondValidationSchema = Yup.object({
    })

    const onSubmit = (formData) => {
        let returnArr = []
        const returnData = formData.listData.filter(item => item.isUpdating)
        
        if (returnData.length !== 0) {
            returnData.map((items) => {
                returnArr.push({
                    id      : items.id, 
                    name    : items.name, 
                    use_yn  : items.use_yn
                    // accounts : 
                })
            })
    
            commonStore.handleApi({
                method  : 'POST', 
                url     : `/sales-account-groups`, 
                data    : returnArr
            })
            .then((result) => {
                Modal.success({ content: '수정이 완료되었습니다.' })
                fetchListData()
            })
        }
        else {
            Modal.warning({ content: '변경된 내용이 없습니다.' })
        }
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
    
    const fetchListData = () => {
        commonStore.handleApi({
            url : '/sales-account-groups'
        })
        .then((result) => {
            result.data.map((items, index) => {
                items.dataIndex = index
                items.created_at = dateFormatYMD(items.created_at, '.')
                items.isUpdating = false
                lastIndex.current += 1
            })
            formikHook.setFieldValue('listData', result.data)
        })
    }

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
                if (record.accounts_count === 0) {
                    // 등록 거래처 수가 없을 때
                    formikHook.values.listData[`${targetIndex}`].isUpdating     = true
                    formikHook.values.listData[`${targetIndex}`].editingType    = 'remove'

                    commonStore.handleApi({
                        method : 'DELETE', 
                        url : `/sales-account-groups/${record?.id}`
                    })
                    .then((result) => {
                        console.log(result)
                        fetchListData()
                    })
                    // 
                }
                else {
                    // 등록 거래처가 있을 때
                    Modal.confirm({
                        content: <><div>등록된 거래처가 있습니다.</div><div>그래도 삭제하시겠습니까?</div></>,
                        okText: '확인',
                        cancelText: '취소',
                        onOk: () => {
                            // 삭제 API 돌릴 것

                            commonStore.handleApi({
                                method : 'DELETE', 
                                url : `/sales-account-groups/${record?.id}`
                            })
                            .then((result) => {
                                console.log(result)
                                fetchListData()
                            })
                        }
                    });
                }
            }
        }
        else {
            console.log(record)
        }


        secondFormikHook.setValues(secondFormikHook.initialValues)
    }

    //검색
    const handleSearch = (data) => {
        console.log(data)
        // fetchData(state.pageArr.page, data)
    } 

    return (
        <>
            <FormikProvider value={formikHook}>
                <Row className="topTableInfo">
                    <Col span={20}>
                        <wjInput.ComboBox
                            itemsSource={new CollectionView(dateItemName, {
                                currentItem: null
                            })}
                            selectedValuePath="id"
                            displayMemberPath="name"
                            valueMemberPath="id"
                            placeholder="항목"
                            style={{width: 120}}
                        />
                        <DatePicker.RangePicker 
                            style={{ margin: '0 20px 0 5px'}}
                        />
                        <Search
                            placeholder="검색어 입력"
                            onSearch={handleSearch}
                            enterButton
                            allowClear
                            style={{width: 200 }}
                        />
                    </Col>
                    <Col span={4} className="topTable_right">
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
                            rowKey      = { 'dataIndex' }
                            dataSource  = { formikHook.values.listData }
                            columns     = { columns }
                            pagination  = {{ position : ['bottomLeft'] }}
                            // pagination={{onChange: cancel,}}
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
                        <Button onClick={fetchListData} htmlType="button" style={{marginLeft:'10px'}}>취소</Button>
                    </Col>
                </Row>
            </FormikProvider>

            {drawerVisible && 
                <ListDrawer 
                    drawerVisible={drawerVisible}
                    drawerClose={drawerClose}
                    rowData={targetData}
                />
            }
        </>
    )
}

export default inject('commonStore')(observer(AccountGroup))