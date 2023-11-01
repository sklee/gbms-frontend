import React from 'react';
import { Button, Row, Col, Table, Input, DatePicker } from 'antd';
import { CollectionView } from '@grapecity/wijmo';
import * as wjInput from '@grapecity/wijmo.react.input';
import { inject, observer } from 'mobx-react';
import { dateFormatYMD } from '@components/Common/Js';
import AddDrawer from './add'
import Excel from '@components/Common/Excel';

const Policy = ({ commonStore }) => {

    const [listData, setListData] = React.useState([])
    const [rowData, setRowData] = React.useState('')
    const [drawerVisible, setDrawerVisible] = React.useState(false);
    const dateItemName = [{id: 1, name: '적용일'}]
    const drawerOpen = () => setDrawerVisible(true)
    const drawerClose = () => {
        setDrawerVisible(false)
        fetchListData()
    };

    const { Search } = Input;

    React.useEffect(() => {
        fetchListData()
    }, [])

    const fetchListData = () => {
        commonStore.handleApi({
            url : '/sales-transaction-policy-groups',
        })
        .then((result) => {
            result.data.map((items) => {
                items.created_at = dateFormatYMD(items.created_at, '.')
            })
            setListData(result.data)
        })
    }

    const columns = [
        {
            dataIndex : "id", 
            title : "그룹 코드",
            width : 100, 
            align : "center"
        }, {
            dataIndex : "name", 
            title : "그룹명" ,
            width : "*",
            minWidth : 150, 
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
            )
        }, {
            dataIndex : "company", 
            title : "대상 회사",
            width : 120,
        }, {
            dataIndex : "accounts_count", 
            title : "등록 거래처 수",
            width : 120,
            align : "right"
        }, {
            dataIndex : "created_at", 
            title : "등록일" ,
            width : 100,
        }, {
            dataIndex : "created_name", 
            title : "등록자" ,
            width : 120,
        },
    ]

    //검색
    const handleSearch = (data) => {
        console.log(data)
        // fetchData(state.pageArr.page, data)
    } 

    return (
        <>
            <Row className="topTableInfo" >
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
                    <Button className="btn btn-primary btn_add" shape="circle" onClick={() => { setRowData(''); drawerOpen(); }}>+</Button>
                </Col>
            </Row>

            <Row className='gridWrap'>
                <Table
                    bordered
                    rowKey = {'id'}
                    size = {'small'}
                    style = {{ padding: 0}}
                    sticky = {{ offsetHeader : -20 }}
                    dataSource = {listData}
                    columns = {columns}
                    pagination  = {{ position : ['bottomLeft'] }}
                />
            </Row>

            <Row className='table_bot'>
                <Col xs={16} lg={16}>
                    <div className='btn-group'>
                        <span>행 개수 : {listData.length}</span>
                    </div>
                </Col>
                <Excel />
            </Row>

            {drawerVisible && 
                <AddDrawer 
                    rowData={rowData}
                    drawerVisible={drawerVisible}
                    drawerClose={drawerClose}
                />
            }
        </>
    )
}

export default inject('commonStore')(observer(Policy))