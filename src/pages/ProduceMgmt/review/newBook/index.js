import React                from 'react'
import { observer, inject } from 'mobx-react'
import { Row, Col, Table, Input, DatePicker }  from 'antd'
import { CollectionView } from '@grapecity/wijmo';
import * as wjInput from '@grapecity/wijmo.react.input';
import ViewDrawer           from '@pages/ProduceMgmt/review/newBook/view'
import Excel                from '@components/Common/Excel'

const NewBook = ({ commonStore }) => {
    const [listData, setListData]               = React.useState([])
    const [viewVisible, setViewVisible]         = React.useState(false)
    const [rowData, setRowData]                 = React.useState('')
    const [selectedRowKeys, setSelectedRowKeys] = React.useState('')
    
    const drawerOpen                    = () => setViewVisible(true)
    const drawerClose                   = () => setViewVisible(false)
    const { Search }                    = Input;
    const dateItemName                  = [{id: 1, name: '신청일'}];

    React.useEffect(() => {
        fetchData()
    }, [])

    const fetchData = React.useCallback(() => {
        commonStore.handleApi({
            url : `/productions-review-simulations`,
        })
        .then((result) => {
            const tableData = result.data
            setListData(tableData)
        })
    })

    const columns = [{
        dataIndex : "id", 
        title : "그룹 코드",
        width : 80, 
        align : "center"
    }, {
        dataIndex : 'simulation_code', 
        title : '시뮬레이션 코드', 
        width : 120, 
        align : "left"
    }, {
        dataIndex : 'title', 
        title : '제목', 
        width: 180,
        render: (text, record, index) => (
            <div 
                style={{cursor: 'pointer'}} 
                onClick={() => {
                    setRowData(record.id)
                    drawerOpen()
                }}
            >
                {text}
            </div>
        ),
        align : "left", 
        ellipsis : true
    }, {
        dataIndex : 'product_code', 
        title : '상품 코드', 
        width : 80, 
        align : "center"
    }, {
        dataIndex : 'product_name', 
        title : '상품명', 
        width : 240,
        align : "left"
    }, {
        dataIndex : 'company', 
        title : '회사', 
        width : 80, 
        align : "center"
    }, {
        dataIndex : 'department', 
        title : '부서', 
        width : 120, 
        align : "left"
    }, {
        dataIndex : 'created_name', 
        title : '등록자', 
        width : 80, 
        align : "left"
    }, {
        dataIndex : 'request_date', 
        title : '입고 요청일', 
        width : 100, 
        align : "center"
    }, {
        dataIndex : 'request_review_at', 
        title : '검토 요청일', 
        width : 100, 
        align : "center"
    }, {
        dataIndex : 'review_at', 
        title : '검토 완료일', 
        width : 100, 
        align : "center"
    }, {
        dataIndex : 'status', 
        title : '진행 상태', 
        width : 120, 
        align : "center"
    }, {
        dataIndex : 'review_name', 
        title : '제작 담당', 
        width : 100, 
        align : "left"
    },]

    //검색
    const handleSearch = (data) => {
        console.log(data)
        // fetchData(state.pageArr.page, data)
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

    return (
        <>
            <Row className="topTableInfo">
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
            </Row>
            <Row className='gridWrap' style={{display: 'block'}}>
                <Table
                    rowKey      = {'id'}
                    dataSource  = {listData}
                    columns     = {columns}
                    size        = {'small'}
                    style       = {{ padding: 0}}
                    bordered    = {true}
                    rowSelection= { rowSelection }
                    sticky      = {{ offsetHeader : -20 }}
                    pagination  = {false}
                    scroll      = {{ x: 700, y: 600 }}
                    onRow       = {record => ({
                        onClick : event => {
                            setRowData(record.id)
                            drawerOpen()
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
            {viewVisible && 
                <ViewDrawer 
                    rowData={rowData} 
                    visible={viewVisible} 
                    setVisible={setViewVisible}
                    drawerClose={drawerClose} 
                />
            }
        </>
    )
}

export default inject('commonStore')(observer(NewBook))