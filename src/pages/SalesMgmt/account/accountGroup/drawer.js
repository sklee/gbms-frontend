import React, { useState } from 'react';
import { Row, Drawer, Button, Typography, Table } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { inject, observer, useLocalStore } from 'mobx-react';

const AccountGroupDrawer = ({ commonStore, drawerVisible, drawerClose, rowData }) => {
    const state = useLocalStore(() => ({
        drawerback: 'drawerWrap',
    }));

    const [listData, setListData] = React.useState([])
    React.useEffect(() => {
        fetchListData()
    }, [])

    const fetchListData = () => {
        commonStore.handleApi({
            url : `/sales-account-groups/${rowData?.id}`,
        })
        .then((result) => {
            setListData(result.data)
        })
    }

    const columns = [
        // {
        //     dataIndex : "id",
        //     title : "순번",
        //     width : 100, 
        //     align : "center"
        // }, 
        {
            dataIndex : "account_code", 
            title : "거래처 코드 (내부)" ,
            width : 150,
            align : "center"
        }, {
            dataIndex : "business_name", 
            title : "거래처명",
            width : '*',
        }, {
            dataIndex : 'work',
            title : '작업',
            width : 120, 
            align : 'center', 
            render: (text, record, index) => <Typography.Link style={{color: 'red'}} onClick={() => remove(record)}>제외</Typography.Link>
        }
    ]

    const remove = (record) => {
        commonStore.handleApi({
            method  : 'DELETE', 
            url     : `/sales-account-groups/${rowData.id}/account/${record.account_id}`, 
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

    return (
        <>
            <Drawer
                title='거래처 목록'
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
                <Row className="gridWrap">
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
                </Row>

                <Row className='table_bot'>
                    <div className='btn-group'>
                        <span>행 개수 : {listData.length}</span>
                    </div>
                </Row>

            </Drawer>
        </>
    )
}

export default inject('commonStore')(observer(AccountGroupDrawer))