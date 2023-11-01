import React, { useState } from 'react';
import { Row, Col, Table, Button, Typography, Modal, Drawer } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { inject, observer, useLocalStore } from 'mobx-react';
import { FormikProvider, useFormik } from 'formik';
import FormikInput from '@components/form/CustomInput';
import * as Yup from 'yup';

const BookDrawer = ({ visible, onClose, commonStore, drawerClose, rowData, companyData }) => {
    const state = useLocalStore(() => ({
        drawerback: 'drawerWrap',
    }));

    const [rowEditing, setRowEditing]       = React.useState('')
    const [selectedRows, setSelectedRows]   = React.useState([])
    const lastIndex                         = React.useRef(0)

    const isEditing = (record) => record.dataIndex === rowEditing

    React.useEffect(() => {
        fetchListData()
    }, [])

    const fetchListData = () => {
        commonStore.handleApi({
            method : 'GET', 
            // url : `/sales-transaction-policy-group-products/${rowData}`,
            url : `/sales-account-product-policies/${rowData}?company=${companyData}`
        })
        .then((result) => {
            result.data.map((e, index) => {
                e.dataIndex = lastIndex.current
                lastIndex.current += 1
            })
            formikHook2.setFieldValue('products', result.data)
        })
    }

    const rowSelection = {
        onChange: (selectedRowKeys, rows) => {
            setSelectedRows(rows)
        },
        getCheckboxProps: (record) => ({
            disabled: record.id === 'Disabled User',
            id: record.id,
        }),
    }

    const initialValues = {
        department_id : '',
        department_name : '',
        supply_rate1 : '0',
        supply_rate2 : '0',
        supply_rate3 : '0',
        supply_rate4 : '0',
        supply_rate5 : '0',
        buyout_quantity : '0',
        supply_yn : ['Y'],
        isUpdating : false
    }

    const initialValues2 = {
        batch_target : 'supply_rate1', 
        batch_data : '',
        products : [], 
    }

    const onSubmit = (formData) => {
        if (formData.supply_yn == '') {
            formData.supply_yn = 'N' 
        }
        else {
            formData.supply_yn = formData.supply_yn[0]
        }

        // REPLACE
        const resultData = formikHook2.values.products.map((element) => {
            if (element.dataIndex == formData.dataIndex) {
                formData.isUpdating = true
                return formData
            }
            else {
                return element
            }
        })

        formikHook2.setFieldValue('products', resultData)
        setRowEditing('')
    }

    const onSubmit2 = (formData) => {
        formData.products = formData.products.filter((item) => item.isUpdating)
        delete formData.batch_target
        delete formData.batch_data
        commonStore.handleApi({
            method : 'POST', 
            url : `/sales-transaction-policy-group-products/${rowData}`, 
            data : formData
        })
        .then((result) => {
            Modal.success({
                content: '수정이 완료되었습니다.',
            })
            fetchListData()
        })
    }

    const validationSchema = Yup.object({
        department_name :   Yup.string().label("부서명"),
        supply_rate1 :      Yup.number().label("위탁"),
        supply_rate2 :      Yup.number().label("현매"),
        supply_rate3 :      Yup.number().label("매절"),
        supply_rate4 :      Yup.number().label("납품"),
        supply_rate5 :      Yup.number().label("기타"),
        buyout_quantity :   Yup.number().label("매절 부수"),
    })

    const formikHook = useFormik({ initialValues, onSubmit, validationSchema })

    const formikHook2 = useFormik({ initialValues : initialValues2, onSubmit : onSubmit2, validationSchema })

    const columns = [
        {
            dataIndex : 'department_name', 
            title : "부서",
            width : 100,
            editable: true,
            ellipsis: true,
            style: {alignItems: 'flex-start', paddingLeft: 10}, 
            render : (text, record, index) => (
                isEditing(record) ? 
                    <FormikInput name={'department_name'}/> 
                    : 
                    <>{text}</>
            )
        }, {
            dataIndex : 'product_id', 
            title : "상품코드",
            width : 100,
            editable: true,
            ellipsis: true,
            align : 'center',
            style: {alignItems: 'flex-end', paddingRight: 10}
        }, {
            dataIndex : 'product_name', 
            title : "상품명",
            width : 420,
            editable: true,
            ellipsis: true,
            style: {alignItems: 'flex-start', paddingLeft: 10}
        }, {
            dataIndex : 'isbn', 
            title : "ISBN",
            width : 160,
            editable: true,
            align : 'center',
            // render : (text, record, index) => isEditing(record) ? <FormikInput name={'isbn'}/> : <>{text}</>
        }, {
            dataIndex : 'go_date', 
            title : "출시일",
            width : 120,
            editable: true,
            align : 'center',
            // render : (text, record, index) => isEditing(record) ? <FormikInput name={'go_date'}/> : <>{text}</>
        }, {
            dataIndex : 'supply_rate1', 
            title : "위탁",
            width : 60,
            editable: true,
            align : 'center',
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'supply_rate1'}/> : <>{text}</>
        }, {
            dataIndex : 'supply_rate2', 
            title : "현매",
            width : 60,
            editable: true,
            align : 'center',
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'supply_rate2'}/> : <>{text}</>
        }, {
            dataIndex : 'supply_rate3', 
            title : "매절",
            width : 60,
            editable: true,
            align : 'center',
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'supply_rate3'}/> : <>{text}</>
        }, {
            dataIndex : 'supply_rate4', 
            title : "납품",
            width : 60,
            editable: true,
            align : 'center',
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'supply_rate4'}/> : <>{text}</>
        }, {
            dataIndex : 'supply_rate5', 
            title : "기타",
            width : 60,
            editable: true,
            align : 'center',
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'supply_rate5'}/> : <>{text}</>
        }, {
            dataIndex : 'buyout_quantity', 
            title : "매절",
            width : 60,
            editable: true,
            align : 'center',
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'buyout_quantity'}/> : <>{text}</>
        }, {
            dataIndex : 'supply_yn', 
            title : "공급 여부",
            width : 80,
            editable: true,
            align : 'center',
            render : (text, record, index) => isEditing(record) ? 
                <FormikInput style={{justifyContent : 'center'}} type={'checkbox'} name={'supply_yn'} data={{checkboxData : [{value : 'Y'}]}}/>
                : 
                <FormikInput style={{justifyContent : 'center'}} type={'checkbox'} name={`supply_yn.${index}`} disabled value={text} data={{checkboxData : [{value : 'Y'}]}}/>
        }, {
            dataIndex : 'work', 
            title : "작업",
            width : 80,
            align : 'center',
            fixed : 'right',
            render: (text, record, index) => isEditing(record) ? (
                <div style={{textAlign: 'center'}}>
                    <Typography.Link onClick={() => save(record)} style={{marginRight: 5}}>저장</Typography.Link>
                    <Typography.Link onClick={cancel}>취소</Typography.Link>
                </div>
            ) : (
                <div style={{textAlign: 'center', width: '100%'}}>
                    <Typography.Link disabled={rowEditing !== ''} onClick={() => edit(record)}>수정</Typography.Link>
                </div>
            )
        }
    ]

    const edit = (record) => {
        setRowEditing(record.dataIndex)
        if (record.supply_rate1 === null) record.supply_rate1 = 0
        if (record.supply_rate2 === null) record.supply_rate2 = 0
        if (record.supply_rate3 === null) record.supply_rate3 = 0
        if (record.supply_rate4 === null) record.supply_rate4 = 0
        if (record.supply_rate5 === null) record.supply_rate5 = 0
        if (record.buyout_quantity === null) record.buyout_quantity = 0
        formikHook.setValues(record)
    }
    
    const cancel = () => {
        formikHook.setValues(formikHook.initialValues)
        setRowEditing('')
    }

    const save = async (e) => {
        formikHook.handleSubmit()
    }

    const batchChange = () => {
        let resultDataIndex = []
        selectedRows.map(item => resultDataIndex.push(item.dataIndex))
        const mergeListData   = formikHook2.values.products.filter(rowData => !resultDataIndex.includes(rowData.dataIndex))
        const resultListData  = formikHook2.values.products.filter(rowData => resultDataIndex.includes(rowData.dataIndex))
        resultListData.map(item => {
            item.isUpdating = true
            item[formikHook2.values.batch_target] = formikHook2.values.batch_data
        })
        const returnData      = [...resultListData, ...mergeListData]
        formikHook2.setFieldValue('products', returnData)
    }

    const [ drawerExtended, setDrawerExtended ] = useState(false);
    const drawerSizeHandler = () => {
        if(drawerExtended){
            setDrawerExtended(false);
            state.drawerback = 'drawerWrap';
            
        } else {
            setDrawerExtended(true);
            state.drawerback = 'drawerback drawerWrap';
        }
    }

    return(
        <>
            <Drawer
                title='도서별 거래 정책'
                placement='right'
                onClose={onClose}
                visible={visible}
                className={state.drawerback}
                closable={false}
                keyboard={false}
                extra={
                    <>
                        <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={onClose}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >
                <FormikProvider value={formikHook2}>
                    <Row gutter={10}>
    
                        <Col style={{ display: 'flex', flex: 2, justifyContent: 'flex-end', alignItems: 'center', padding:20 }}>
                            <Row style={{marginRight: 10}}>
                                선택한 상품의 
                            </Row>
                            <Row>
                                <FormikInput type={'select'} name={'batch_target'} style={{width: 200}}
                                    data={{
                                        options: [{
                                            label : '위탁', 
                                            value : 'supply_rate1'
                                        }, {
                                            label : '현매', 
                                            value : 'supply_rate2'
                                        }, {
                                            label : '매절', 
                                            value : 'supply_rate3'
                                        }, {
                                            label : '납품', 
                                            value : 'supply_rate4'
                                        }, {
                                            label : '기타', 
                                            value : 'supply_rate5'
                                        }, {
                                            label : '매절', 
                                            value : 'buyout_quantity'
                                        },]
                                    }}
                                />
                            </Row>
                            <Row style={{marginLeft: 5, marginRight: 10}}>
                                을/를
                            </Row>
                            <Row>
                                <FormikInput name="batch_data"/>
                            </Row> 
                            <Row style={{marginLeft: 5, marginRight: 10}}>
                                로 
                            </Row>
                            <Button onClick={() => {batchChange()}}>일괄 변경</Button>
                        </Col>
                    </Row>
                    <Row className='gridWrap'>
                        <FormikProvider value={formikHook}>
                            <Table
                                rowKey={'dataIndex'}
                                style={{ width: '100%', overflow: 'scroll' }}
                                dataSource={formikHook2.values.products}
                                columns={columns}
                                scroll={{ x : 1300,  y : 500 }}
                                rowSelection={{ fixed: 'left', type: 'checkbox', ...rowSelection, }}
                                pagination={{ position: ['bottomRight'], }}
                            />
                        </FormikProvider>
                    </Row>
    
                    <Row gutter={[10, 10]} justify="center">
                        <Col>
                            <Button onClick={formikHook2.handleSubmit} type="primary" htmlType="button">확인</Button>
                            <Button onClick={onClose} htmlType="button" style={{marginLeft:'10px'}}>취소</Button>
                        </Col>
                    </Row>
                </FormikProvider>
            </Drawer>
        </>
    )
}

export default inject('commonStore')(observer(BookDrawer))