import React from 'react'
import { Row, Col, DatePicker, Checkbox, Button, Modal, Table, Input } from 'antd';
import { inject, observer } from 'mobx-react';
import ViewDrawer           from '@pages/ProduceMgmt/orderPaper/paperbookTab'
import moment from 'moment';
import Excel from '@components/Common/Excel';

const OrderMgmt = ({ commonStore, addTab }) => {
    const [listData,         setListData         ] = React.useState([])
    const [rowData,          setRowData          ] = React.useState('')
    const [viewVisible,      setViewVisible      ] = React.useState(false)
    const [modalVisible,     setModalVisible     ] = React.useState(false)
    const [selectedRowKeys,  setSelectedRowKeys  ] = React.useState([])
    
    const modalOpen   = () => setModalVisible(true)
    const modalClose  = () => setModalVisible(false)
    const drawerOpen  = () => {
        modalClose()
        setRowData('')
        setViewVisible(true)
    }
    const drawerClose = () => setViewVisible(false)

    const defaultStartDay = moment().subtract(6, 'days')
    const dateFormat = 'YYYY-MM-DD';
    const today = moment()

    const { Search } = Input;

    const columns = [{
        title : '상품 정보', 
        children : [{
            dataIndex : 'product_code', 
            title : '상품 코드', 
            width : 100, 
        }, {
            dataIndex : 'product_name', 
            title : '상품명 (공식)', 
            width : 200,
            render : (text, record, index) => {
                return (
                    <div onClick={() => {
                        setRowData(record.id); 
                        setViewVisible(true)
                    }} style={{cursor: 'pointer'}} >
                        {text}
                    </div>
                )
            }
        }, {
            dataIndex : 'product_internal_name', 
            title : '상품명 (내부)', 
            width : 200, 
        }, {
            dataIndex : 'product_type', 
            title : '상품 종류', 
            width : 100, 
        }, {
            dataIndex : 'department', 
            title : '부서', 
            width : 120, 
        }, {
            dataIndex : 'product_qty', 
            title : '판/쇄', 
            width : 80, 
        }]
    }, {
        title : '등록/담당자', 
        children : [{
            dataIndex : 'created_name', 
            title : '등록', 
            width : 80, 
        }, {
            dataIndex : 'edit_user_name', 
            title : '편집', 
            width : 80, 
        }, {
            dataIndex : 'production_user_name', 
            title : '제작', 
            width : 80, 
        }, {
            dataIndex : 'production_type', 
            title : '제작 구분', 
            width : 80, 
        }, ], 
    }, {
        title : '등록/담당자', 
        children : [{
            dataIndex : 'status', 
            title : '제작 상태', 
            width : 100, 
        }, {
            dataIndex : 'production_order', 
            title : '우선순위', 
            width : 100, 
        }, {
            dataIndex : 'request_date', 
            title : '입고 요청일', 
            width : 100, 
        }, {
            dataIndex : 'due_date', 
            title : '등록 시 재고 소진일', 
            width : 100, 
        }, {
            dataIndex : 'receiving_date', 
            title : '편집 마감 예정일', 
            width : 100, 
        },]
    }, {
        title : '제작처', 
        children : [{
            dataIndex : 'paper_company', 
            title : '종이', 
            width : 100, 
        }, {
            dataIndex : 'print_company', 
            title : '인쇄', 
            width : 100, 
        }, {
            dataIndex : 'processing_company', 
            title : '후가공', 
            width : 100, 
        }, {
            dataIndex : 'binding_company', 
            title : '제본', 
            width : 100, 
        }, ]
    }, {
        dataIndex : 'editing_deadline', 
        title : '편집 마감', 
        width : 100, 
    }, {
        title : '인쇄 샘플', 
        children : [{
            dataIndex : 'print_arrival', 
            title : '도착', 
            width : 100, 
        }, {
            dataIndex : 'print_inspection', 
            title : '검수', 
            width : 100, 
        }, ]
    }, {
        title : '제본 샘플', 
        children : [{
            dataIndex : 'binding_arrival', 
            title : '도착', 
            width : 100, 
        }, {
            dataIndex : 'binding_inspection', 
            title : '검수', 
            width : 100, 
        }],
    }, {
        title : '제본 샘플', 
        children : [{
            dataIndex : 'receiving_scheduled_date', 
            title : '예정일', 
            width : 100, 
        },{
            dataIndex : 'inbound_qty', 
            title : '수량', 
            width : 80, 
        }, {
            dataIndex : 'stock_qty', 
            title : '여유분', 
            width : 80, 
        
        }]
    }]

    const fetchListData = () => {
        commonStore.handleApi({ url : `/productions` })
        .then((result) => setListData(result.data))
    }

    React.useEffect(() => {
        fetchListData()
    }, [])

    React.useEffect(() => {
        if (!viewVisible) {
            setRowData('')
            setSelectedRowKeys([])
        }
    }, [viewVisible])

    const confirmModal = () => {
        Modal.confirm({
            title:"사양 확정 요청 처리",
            content:"확인 처리하시겠습니까?",
            onOk () {
                console.log("OK다요")
            },
            onCancel () {
                console.log("CANCEL입니다요")
            },
        })
    }

    const addTabSet = (tit, key) =>{
        // addTab(tit, key);
        addTab(key);
        modalClose();
    }

    const onChange = (e) => {
        console.log(`checked = ${e.target.checked}`);
    }

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    }
    
    const rowSelection = {
        type : 'radio', 
        fixed : true, 
        columnWidth : 0, 
        renderCell: () => <></>,
        selectedRowKeys,
        onChange: onSelectChange,
    }

    //검색
    const handleSearch = (data) => {
        console.log(data)
        // fetchData(state.pageArr.page, data)
    }

    return (
        <>
            <Row className="topTableInfo">
                <Col span={20}>
                    <Search
                        placeholder="검색어 입력"
                        onSearch={handleSearch}
                        enterButton
                        allowClear
                        style={{width: 200, marginRight: 10 }}
                    />
                    <span style={{marginRight: 10}}>제작 발주일</span>
                    <DatePicker.RangePicker 
                        defaultValue={[moment(defaultStartDay , dateFormat) , moment(today, dateFormat)]}
                        format={dateFormat}
                        style={{marginRight: 20}}
                    />
                    <span style={{marginRight: 10}}>보기 설정</span>
                    <Checkbox onChange={onChange}>입고(완료) 제외</Checkbox>
                    <Checkbox onChange={onChange}>본인 담당</Checkbox>
                    <Checkbox onChange={onChange}>재고 소진일 10일 미만</Checkbox>
                    <Checkbox onChange={onChange}>우선 순위 지정</Checkbox>
                    <Checkbox onChange={onChange}>편집 마감 등록</Checkbox>
                </Col>
                <Col span={4} className="topTable_right">
                    <Button 
                        onClick={() => confirmModal(true)} 
                        disabled={selectedRowKeys.length === 0 ? true : false}
                    >
                        팀장 확인
                    </Button>
                    <Button className="btn btn-primary btn_add" shape="circle" style={{marginLeft: 10}} onClick={modalOpen}>+</Button>
                </Col>
            </Row>

            <Row>
                <Table 
                    rowKey      = { 'id' }
                    dataSource  = { listData }
                    columns     = { columns }
                    size        = { 'middle' }
                    bordered    = { true }
                    rowSelection= { rowSelection }
                    style       = {{ padding: 0, flex: 1 }}
                    sticky      = {{ offsetHeader : -20 }}
                    scroll      = {{ x : 800, y: 600}}
                    // pagination  = {{ position : ['bottomLeft'] }}
                    pagination = {false}
                    onRow       = {(record, rowIndex) => ({
                        onClick : (event) => {
                            setRowData(record.id); 
                            setViewVisible(true)
                            onSelectChange([record.id])
                        }
                    })}
                />
            </Row>
            <Row className='table table_bot'>
                <Col xs={24} lg={16}>
                    <div className='btn-group'>
                        <span>행 개수 : {listData.length}</span>
                    </div>
                </Col>
                <Excel />
            </Row>

            <Modal 
                title="발주 대상 상품 유형" 
                visible={modalVisible}
                onCancel={modalClose}
                footer={null}
            >
                <p><a onClick={() => drawerOpen('paperBookTab')}>종이책</a></p>
                <p><a onClick={() => drawerOpen('paperBookTab')}>포장물품</a></p>
            </Modal>
            
            <ViewDrawer 
                rowData={rowData} 
                visible={viewVisible} 
                addDrawerClose={drawerClose} 
                listRefresh={fetchListData}
            />
        </>
    )
}


export default inject('commonStore')(observer(OrderMgmt))
