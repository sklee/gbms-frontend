import React, { useState } from 'react';
import { Row, Drawer, Button, Typography, Table, Input } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { inject, observer, useLocalStore } from 'mobx-react';

const View = ({ commonStore, drawerVisible, drawerClose, rowData }) => {
    const { Search } = Input;

    const state = useLocalStore(() => ({
        drawerback: 'drawerWrap',
    }));
    
    const [listData, setListData] = React.useState([])
    React.useEffect(() => {
        fetchListData()
    }, [])

    const fetchListData = () => {
        commonStore.handleApi({
            url : `/sales-product-groups/${rowData?.id}`,
        })
        .then((result) => {
            setListData(result.data)
        })
    }

    const columns = [{
        dataIndex : 'company_name', 
        title : "회사", 
        width : 120
    }, {
        dataIndex : 'department_name', 
        title : "부서", 
        width : 120
    }, {
        dataIndex : 'product_status', 
        title : "출시 상태", 
        width : 120,
        align : 'center'
    }, {
        dataIndex : 'product_code', 
        title : "상품 코드", 
        width : 120, 
        align : 'center'
    }, {
        dataIndex : 'product_name', 
        title : "상품명(공식)", 
    }, {
        dataIndex : 'work', 
        title : "작업", 
        width : 80, 
        align : 'center', 
        render: (text, record, index) => <Typography.Link style={{color: 'red'}} onClick={() => remove(record)}>제외</Typography.Link>
    }, ]

    const remove = (record) => {
        commonStore.handleApi({
            method  : 'DELETE', 
            url : `/sales-product-groups/${record.id}`
            // url     : `/sales-account-groups/${rowData.id}/account/${record.account_id}`, 
        })
        .then(() => {
            fetchListData()
        })
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

    //검색
    const handleSearch = (data) => {
        console.log(data)
        // fetchData(state.pageArr.page, data)
    } 

    return (
        <>
            <Drawer
                title='상품 목록'
                placement='right'
                onClose={drawerClose}
                visible={drawerVisible}
                className={state.drawerback}
                closable={false}
                keyboard={false}
                extra={
                    <>
                        <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={drawerClose}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >
                <Search
                    placeholder="검색어 입력"
                    onSearch={handleSearch}
                    enterButton
                    allowClear
                    style={{width: 300, marginBottom: 15}}
                />
                
                <Table
                    bordered
                    rowKey = {'id'}
                    size = {'large'}
                    style = {{ padding: 0}}
                    sticky = {{ offsetHeader : -20 }}
                    dataSource = {listData}
                    columns = {columns}
                    pagination  = {{ position : ['bottomLeft'] }}
                />

                <Row className='table_bot'>
                    <div className='btn-group'>
                        <span>행 개수 : {listData.length}</span>
                    </div>
                </Row>
            </Drawer>
        </>
    )
}

export default inject('commonStore')(observer(View))