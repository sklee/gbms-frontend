/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useState } from 'react';
import { Row, Table, Button, Drawer, Input } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { inject, observer } from 'mobx-react';
import { useLocalStore } from 'mobx-react';
import Search from 'antd/lib/transfer/search';

const ChkProDrawer = ({ commonStore, chkVisible, visibleClose, companyType, searchedProduct }) => {
    const [ listData,       setListData         ] = React.useState([])
    const [ drawerExtended, setDrawerExtended   ] = React.useState(false)

    React.useEffect(() => { 
       fetchData('','',companyType)
    }, [])

    const chkData = (rowData)=>{
        searchedProduct({
            id : rowData.id, 
            internal_name : rowData.name, 
            name : rowData.name, 
            product_code : rowData.product_code,
            product_type : rowData.product_type
        })
        visibleClose('chkProduct')
    }

    //리스트
    const fetchData = React.useCallback(() => {
        // process.env.REACT_APP_API_URL +'/api/v1/products-code/product-search?display='+state.pageArr.pageCnt+'&page='+page +'&sort_by=date&order=desc'+keyword+companyType,
        commonStore.handleApi({
            url : `/products`
        })
        .then((result) => {
            setListData(result.data)
        })
    }, [])

    const column = React.useMemo(() => [
        {
            title: '회사',
            dataIndex: 'company',
            key:  'company',
            width: 100, 
            render: (_, row) => row.company,
            align: 'left',
        }, {
            title: '브랜드',
            dataIndex: 'brand',
            key:  'brand',
            width: 100, 
            render: (_, row) => row.brand ,
            align: 'left',
        }, {
            title: '상품 종류',
            dataIndex:  'product_type_name',
            key: 'product_type_name',
            width: 100, 
            render: (_, row) => row.product_type_name,
            align: 'left',
        }, {
            title: '상품 코드',
            dataIndex: 'product_code',
            key: 'product_code',
            width: 100, 
            render: (_, row) => row.product_code ,
            align: 'left',
        }, {
            title: '상품명',
            dataIndex: 'name',
            key: 'name',
            width: 320, 
            render: (_,row) => row.name,
            align: 'left',
        }, {
            title: '출시 상태',
            dataIndex: 'product_status',
            key: 'product_status',
            width: 140, 
            render: (_, row) => row.product_status,
            align: 'left',
        }, {
            title: '작업',
            dataIndex: 'add',
            key: 'add',
            width: 80, 
            render: (_, row) => <Button onClick={(e)=>{chkData(row)}}>추가</Button>,
            align: 'center',
        },    
    ],[],)

    return (
        <>
            <Drawer
                title={'상품 검색'}
                placement='right'
                visible={chkVisible}
                onClose={() => visibleClose('chkProduct')}
                className={drawerExtended ? 'drawerWrap drawerback' : 'drawerWrap'}
                closable={false}
                keyboard={false}
                extra={
                    <>
                        <Button onClick={() =>{ setDrawerExtended(!drawerExtended) }} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={() => visibleClose('chkProduct')}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >   

                <Table
                    dataIndex={'id'}
                    dataSource={listData}
                    rowKey={(row) => row.author_id}    
                    columns={column}
                    size={'small'}
                    scroll={{ x: 992, y: 800 }}
                    onRow={record => ({onClick: () => {chkData(record)}})}
                />

                <Row gutter={10} className="table_bot">
                    <span>행 개수 : {listData.length}</span>
                </Row>
            </Drawer>
        </>
    );
}

export default inject('commonStore')(observer(ChkProDrawer))