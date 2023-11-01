/* eslint-disable react-hooks/exhaustive-deps*/
import React from 'react'
import { Button, Row, Col, Table, Typography, Input } from 'antd'
import { inject, observer } from 'mobx-react'
import '@grapecity/wijmo.touch'; // support drag/drop on touch devices
import '/node_modules/flexlayout-react/style/light.css';
import Excel from '@components/Common/Excel';
import FormikInput from '@components/form/CustomInput';
import { FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
const PriceStandardList = ({ commonStore, tab }) => {

    const [listData,    setListData   ] = React.useState([])
    const [rowEditing,  setRowEditing ] = React.useState('')
    const [addBtn,      setAddBtn     ] = React.useState(false)
    const lastIndex                     = React.useRef(0)

    const { Search } = Input;

    const isEditing = (record) => record.dataIndex === rowEditing;
    
    React.useEffect(() => fetchData(), [])
    const fetchData = React.useCallback(() => {
        commonStore.handleApi({
            url : `/paper-standards`,
        })
        .then((result) => {
            const tableData = result.data
            tableData.map((items, index) => {
                items.dataIndex = index
                lastIndex.current += 1
            })
            setListData(tableData)
        })
    })

    const columns = [
        {
            dataIndex : 'turn', 
            title : "순서" ,
            render : (text, record, index) => <div>{index + 1}</div>,
            align: 'center',
            width: 60
        }, {   
            dataIndex : 'name', 
            title : "종이 규격" ,
            render : (text, record, index) => 
            isEditing(record) ? 
                <FormikInput 
                    name={'name'} 
                    onChange={secondFormikHook.handleChange}
                />
            : 
                <div 
                    onClick={ () => { if (record?.id && record.id !== '') {  }  } }
                    style={ record?.id && record.id !== '' ? {cursor:'pointer'} : {} }
                >
                    {text}
                </div>
        }, {   
            dataIndex : 'paper_grain', 
            title : "종이결", 
            width : 100,
            render : (text, record, index) => 
            isEditing(record) ? 
                <FormikInput 
                    name={'paper_grain'} 
                    onChange={secondFormikHook.handleChange}
                /> 
                : 
                <div 
                    onClick={() => { if (record?.id && record.id !== '') {  }  }} 
                    style={ record?.id && record.id !== '' ? {cursor:'pointer'} : {}}
                >
                    {text}
                </div>
        }, {   
            dataIndex : 'width', 
            title : "가로(mm)" ,
            width : 100,
            align : "right",
            render : (text, record, index) => 
            isEditing(record) ? 
                <FormikInput name={'width'} onChange={secondFormikHook.handleChange}/> 
                : 
                <div 
                    onClick={() => { if (record?.id && record.id !== '') {  }  }} 
                    style={ record?.id && record.id !== '' ? {cursor:'pointer'} : {}}
                >
                    {text}
                </div>
        }, {
            dataIndex : 'height', 
            title : "세로(mm)",
            width : 100,
            align : "right",
            render : (text, record, index) => 
            isEditing(record) ? 
                <FormikInput name={'height'} onChange={secondFormikHook.handleChange}/> 
                : 
                <div 
                    onClick={() => { if (record?.id && record.id !== '') {  }  }} 
                    style={ record?.id && record.id !== '' ? {cursor:'pointer'} : {}}
                >
                    {text}
                </div>
        }, {
            dataIndex : 'paper_cutting', 
            title : "종이절수",
            width : 100,
            align : "right",
            render : (text, record, index) => 
            isEditing(record) ? 
                <FormikInput name={'paper_cutting'} onChange={secondFormikHook.handleChange}/> 
                : 
                <div 
                    onClick={() => { if (record?.id && record.id !== '') {  }  }} 
                    style={ record?.id && record.id !== '' ? {cursor:'pointer'} : {}}
                >
                    {text}
                </div>
        }, {
            dataIndex : 'cover_yn', 
            title : "표지 적용" ,
            width : 100,
            align : "center" ,
            render : (text, record, index) => isEditing(record) ? 
                <FormikInput style={{justifyContent : 'center'}} type={'checkbox'} name={'cover_yn'} data={{checkboxData : [{value : 'Y'}]}}/>
                : 
                <FormikInput style={{justifyContent : 'center'}} type={'checkbox'} name={`cover_yn.${index}`} disabled value={text} data={{checkboxData : [{value : 'Y'}]}}/>
        }, {
            dataIndex : 'use_yn', 
            title : "사용 여부" ,
            width : 100,
            align : "center" ,
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
                    {/* <Typography.Link onClick={() => remove(record)}>삭제</Typography.Link> */}
                </>
            )
        }
    ]

    const save = (record) => {
        setListData(listData.map((data) => data.dataIndex === record.dataIndex ? secondFormikHook.values : data ))
        setRowEditing('')
    }
    const cancel = () => {
        setRowEditing('')
    }

    const edit = (record) => {
        setRowEditing(record.dataIndex)
        secondFormikHook.setValues(record)
    }

    const remove = () => {}
    
    const secondOnSubmit = () => {}

    const secondInitialValues = {
        dataIndex       : lastIndex.current+1 ,
        name            : '',
        paper_grain     : '',
        width           : '',
        height          : '',
        paper_cutting   : '',
        cover_yn        : '',
        use_yn          : '',
    }

    const secondValidationSchema = Yup.object({
    })

    const secondFormikHook = useFormik({
        initialValues : secondInitialValues, 
        onSubmit : secondOnSubmit,
        validationSchema : secondValidationSchema
    })

    const handleSubmit = () => {}

    const handleReset  = () => {}

    const rowAdd = () => {
        setAddBtn(!addBtn)
        if (!addBtn) {
            secondFormikHook.setValues(secondInitialValues)
            setListData([secondInitialValues, ...listData])
            setRowEditing(lastIndex.current+1)
            lastIndex.current++
        }
        else {
            setRowEditing('')
            setListData(listData.filter(data => data.dataIndex !== lastIndex.current))
        }
    }

    //검색
    const handleSearch = (data) => {
        console.log(data)
        // fetchData(state.pageArr.page, data)
    } 

    return (
        <>
            <Row className="topTableInfo" justify="space-around">
                <Col span={20}>
                    <Search
                        placeholder="검색어 입력"
                        onSearch={handleSearch}
                        enterButton
                        allowClear
                        style={{width: 200 }}
                    />
                </Col>
                <Col span={4} className="topTable_right">
                    <Button className="btn btn-primary btn_add" shape="circle" onClick={rowAdd} >
                        {addBtn ? '-' : '+'}
                    </Button>
                </Col>
            </Row>

            <Row className="gridWrap">
                <FormikProvider value={secondFormikHook}>
                    <Table
                        rowKey      = {'dataIndex'}
                        dataSource  = {listData}
                        columns     = {columns}
                        size        = {'small'}
                        style       = {{padding: 0}}
                        bordered    = {true}
                        sticky      = {{ offsetHeader : -20 }}
                        pagination  = {{ pageSize: 50, position : ['bottomLeft'] }}
                    />
                </FormikProvider>
            </Row>

            <Row className='table table_bot'>
                <Col xs={16} lg={16}>
                    <div className='btn-group'>
                        <span>행 개수 : {listData.length}</span>
                    </div>
                </Col>
                <Excel />
            </Row>

            <Row gutter={[10, 10]}  justify="center" style={{ marginTop: 20 }}>
                <Col>
                    <Button id="btn" type="primary" htmlType="button" onClick={handleSubmit}>확인</Button>
                </Col>
                <Col>
                    <Button htmlType="button" onClick={handleReset}>취소</Button>
                </Col>
            </Row>
        </>
    )
}

export default inject('commonStore')(observer(PriceStandardList))
