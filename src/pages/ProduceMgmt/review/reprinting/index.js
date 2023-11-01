import React from 'react'
import { inject, observer } from 'mobx-react';
import { Row, Col, Input, Table, DatePicker } from 'antd';
import { CollectionView } from '@grapecity/wijmo';
import * as wjInput from '@grapecity/wijmo.react.input';
import ViewDrawer from '@pages/ProduceMgmt/review/reprinting/view'
import Excel from '@components/Common/Excel';

const Reprinting = ({ commonStore }) => {
    const { Search }                    = Input;
    const [listData,    setListData]    = React.useState([])
    const [targetId,    setTargetId]    = React.useState('')
    const [viewVisible, setViewVisible] = React.useState(false)
    const [thisStatus,  setThisStatus]  = React.useState('')
    const dateItemName                  = [{id: 1, name: '신청일'}]

    React.useEffect(() => {
        fetchData()
    }, [])

    const fetchData = () => {
        commonStore.handleApi({
            url : `/productions-review-reprints`,
            data: { status : 2 }
        })
        .then((result) => {
            setListData(result.data)
        })
    }

    const columns = [
        {
            dataIndex : 'product_code', 
            title : '상품 코드', 
            width : 100,
        }, {
            dataIndex : 'product_name', 
            title : '상품명 (공식)', 
            width : 300,
            ellipsis : true, 
            render: (data, rowData, index) => (
                <div 
                    style={{cursor: 'pointer'}} 
                    onClick={() => {
                        setThisStatus(rowData.status)
                        viewDrawerOpen(rowData.id)
                    }}
                >
                    {data}
                </div>
            )
        }, {
            dataIndex : 'product_internal_name', 
            title : '상품명 (내부)', 
            width : 200,
            ellipsis : true
        }, {
            dataIndex : 'product_type', 
            title : '상품 종류', 
            width : 100, 
        }, {
            dataIndex : 'department', 
            title : '부서', 
            width : 100, 
        }, {
            dataIndex : 'printing_name', 
            title : '판/쇄', 
            width : 80
        }, {
            dataIndex : 'review_requester', 
            title : '검토 요청자', 
            width : 80
        }, {
            dataIndex : 'due_date', 
            title : '검토 요청일', 
            width : 100, 
        }, {
            dataIndex : 'edit_user_name', 
            title : '편집 담당자', 
            width : 100, 
        }, {
            dataIndex : 'editor_at', 
            title : '편집 확인일', 
            width : 100, 
        }, {
            dataIndex : 'modification_range', 
            title : '변경 범위', 
            width : 120
        }, {
            dataIndex : 'product_qty', 
            title : '발주 수량', 
            width : 80, 
            align : 'right'
        }, {
            dataIndex : 'stock_qty', 
            title : '재고 수량', 
            width : 80, 
            align : 'right'
        }, {
            dataIndex : 'stock_date', 
            title : '재고 소진일', 
            width : 100, 
        }, {
            dataIndex : 'edit_11', 
            title : '편집 마감 예정일', 
            width : 100, 
            ellipsis : true
        }, {
            dataIndex : 'request_date', 
            title : '입고 요청일', 
            width : 100, 
        }, {
            dataIndex : 'status', 
            title : '진행 상태', 
            width : 120, 
        }, {
            dataIndex : 'production_user_name', 
            title : '제작 담당', 
            width : 100
        }
    ]

    const viewDrawerOpen = (id) => {
        setTargetId(id)
        setViewVisible(true)
    }

    const viewDrawerClose = React.useCallback(() => {
        setTargetId('')
        setViewVisible(false)
    })

    //검색
    const handleSearch = (data) => {
        console.log(data)
        // fetchData(state.pageArr.page, data)
    } 

    return(
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
                    size        = {'middle'}
                    bordered    = {true}
                    style       = {{ padding: 0 }}
                    sticky      = {{ offsetHeader : -20 }}
                    // pagination  = {{ position : ['bottomLeft'] }}
                    scroll      = {{ x: 700, y: 600 }}
                />
            </Row>
            <ViewDrawer 
                list={targetId} 
                visible={viewVisible} 
                drawerClose={viewDrawerClose} 
                status={thisStatus}
            />
        </>
    )
}

export default inject('commonStore')(observer(Reprinting))