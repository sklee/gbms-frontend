/* eslint-disable react-hooks/exhaustive-deps*/
import React from 'react';
import {Row, Col, Button, Typography, Table, Modal, DatePicker, Input } from 'antd';
import { CollectionView } from '@grapecity/wijmo';
import * as wjInput from '@grapecity/wijmo.react.input';
import { FormikProvider, useFormik } from 'formik';
import FormikInput from '@components/form/CustomInput';
import { inject, observer } from 'mobx-react';
import { dateFormatYMD, getCurrentDate } from '@components/Common/Js'
import ListDrawer from '@pages/SalesMgmt/prdGroup/view';
import * as Yup from 'yup';
import Excel from '@components/Common/Excel';

const ProGroup = ({ commonStore }) => {
    const [ rowEditing,    setRowEditing    ] = React.useState('')
    const [ editingType,   setEditingType   ] = React.useState('')
    const [ userListData,  setUserListData  ] = React.useState([])
    const [ targetData,    setTargetData    ] = React.useState([])
    const [ drawerVisible, setDrawerVisible ] = React.useState(false);
    const lastIndex                           = React.useRef(0)
    const dateItemName = [{id: 1, name: '적용일'}]
    const { Search } = Input;

    const drawerOpen  = () => setDrawerVisible(true);
    const drawerClose = () => { setDrawerVisible(false); setTargetData([]); fetchData()}

    const isEditing   = (record) => record.dataIndex === rowEditing;

    React.useEffect(() => {
        fetchData()
    }, [])

    const fetchData = () => {
        commonStore.handleApi({ url : `/sales-product-groups` })
        .then((result) => {
            result.data.map((items, index) => {
                items.dataIndex = index
                lastIndex.current += 1
            })
            formikHook.setFieldValue('listData', result.data)
        })

        commonStore.handleApi({ url : `/users` })
        .then((result) => { setUserListData(result.data) })
    }

    const columns = [{
        dataIndex : 'name',
        title : "그룹명",
        render : (text, record, index) => isEditing(record) ? 
        <FormikInput name={'name'}/> 
        : 
        <div onClick={() => { if (record?.id && record.id !== ''){drawerOpen(); setTargetData(record)}}} style={ record?.id && record.id !== '' ? {cursor:'pointer'} : {}}>
            {text}
        </div>
    }, {
        dataIndex : 'products_count',
        title : "등록 상품 수",
        width : 120,
        align : 'center'
    }, {
        dataIndex : 'created_at',
        title : "등록일", 
        width : 120, 
        align : 'center', 
        render : text => dateFormatYMD(text, '-')
    }, {
        dataIndex : 'created_name',
        title : "등록자", 
        width : 120,
        align : 'center'
    }, {
        dataIndex : 'use_yn',
        title : '사용 여부',
        width : 100,
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
    }]

    const initialValues = {
        listData : []
    }

    const secondInitialValues = {
        dataIndex       : lastIndex.current+1,
        id              : '',
        name            : '',
        products_count  : 0, 
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
        const returnData = formData.listData.filter(item => item.isUpdating)

        if (editingType == 'remove') {
            // Modal.success({ content: .' })
        }
        else {
            returnData.map((userData) => {
                delete userData.created_at
                delete userData.created_name
                delete userData.editingType
                delete userData.isUpdating
                delete userData.products_count 
                if (editingType == 'add') {
                    delete userData.id
                }
                userData.products = []
            })
    
            commonStore.handleApi({
                method : 'POST', 
                url : '/sales-product-groups',
                data : returnData
            })
            .then((result) => {
                Modal.success({ content: '수정이 완료되었습니다.' })
                fetchData()
            })
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

    //검색
    const handleSearch = (data) => {
        console.log(data)
        // fetchData(state.pageArr.page, data)
    } 

    return (
        <>
            <FormikProvider value={formikHook}>
                <Row className="topTableInfo" justify="space-around">
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
                        />
                    </FormikProvider>
                </Row>
                <Row className='table_bot'>
                    <Col xs={16} lg={16}>
                        <div className='btn-group'>
                            <span>행 개수 : </span>
                        </div>
                    </Col>
                    <Excel />
                </Row>
                <Row gutter={[10, 10]} justify="center">
                    <Col>
                        <Button onClick={formikHook.handleSubmit} type="primary" htmlType="button">확인</Button>
                        {/* <Button htmlType="button" style={{marginLeft:'10px'}}>취소</Button> */}
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

export default inject('commonStore')(observer(ProGroup))
