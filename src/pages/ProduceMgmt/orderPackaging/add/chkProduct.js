/* eslint-disable react-hooks/exhaustive-deps*/
import React from 'react';
import { Table,  Button,  Drawer,Pagination, Input, Row, Col, Space} from 'antd';
import { inject, observer } from 'mobx-react';

const ChkProDrawer = ({ commonStore, viewVisible, visibleClose, setProductDrawerData }) => {
    const [listData,    setListData ] = React.useState([])
    const [total,       setTotal    ] = React.useState(0)
    const [page,        setPage     ] = React.useState(1)
    const [keyword,     setKeyword  ] = React.useState('')
    //페이징
    const pageChange = (pageNum) => {
        setPage(pageNum)
    }
    //검색
    const handleSearch = (keyword) => {
        setKeyword(keyword)
        setPage(1)
    }
    //리스트
    const fetchData = () => {
        commonStore.handleApi({
            url : `/products-code/product-search`, 
            data: {
                display : 10, 
                page    : page, 
                keyword : keyword,
                sort_by : `date`, 
                order   : `desc`, 
                company : `S`,
            }
        })
        .then(result => {
            setTotal(result?.meta?.total)
            setListData(result.data)
        })
    }
    const columns = [{
        title: '회사',
        dataIndex: 'company',
        key:  'company',
        render: (_, row) => row.company,
        align: 'left',
    }, {
        title: '브랜드',
        dataIndex: 'brand',
        key:  'brand',
        render: (_, row) => row.brand ,
        align: 'left',
    }, {
        title: '상품 종류',
        dataIndex:  'product_type',
        key: 'product_type',
        render: (_, row) => row.product_type,
        align: 'left',
    }, {
        title: '상품 코드',
        dataIndex: 'product_code',
        key: 'product_code',
        render: (_, row) => row.product_code ,
        align: 'left',
    }, {
        title: '상품명',
        dataIndex: 'name',
        key: 'name',
        render: (_,row) => row.name,
        align: 'left',
    }, {
        title: '출시 상태',
        dataIndex: 'product_status',
        key: 'product_status',
        render: (_, row) => row.product_status,
        align: 'left',
    }]

    React.useEffect(() => { 
        fetchData()     
     }, [])

    React.useEffect(() => fetchData(), [page, keyword])

    return (
        <Drawer
            title={'상품 검색'}
            placement='right'
            visible={viewVisible}
            onClose={visibleClose}
            className="drawerWrap"
            closable={false}
            keyboard={false}
            extra={
                <Space>
                    <Button onClick={visibleClose}>X</Button>
                </Space>
            }         
        >
            <Row className='searchDiv' style={{justifyContent: 'flex-end'}}>
                <Input.Search
                    placeholder="검색어 입력"
                    onSearch={handleSearch}
                    style={{width: 300}}
                    enterButton
                    allowClear
                />
            </Row>
            <Table
                dataIndex   = {`id`}
                dataSource  = {listData}
                columns     = {columns}
                scroll      = {{ x: 992, y: 800 }}
                rowKey      = {(row) => row.author_id}
                pagination  = {false}
                onRow       = {record => ({
                    onClick : event => { setProductDrawerData(record); visibleClose(); }
                })}
            />
            <Row className="table_bot" style={{justifyContent: 'flex-end'}}>
                <Pagination defaultCurrent={1} current={page} total={total} showSizeChanger={false} onChange={pageChange}/>
            </Row>
        </Drawer>
    )
}

export default inject('commonStore')(observer(ChkProDrawer))
