import React from 'react'
import { Row, Col, Button, Table } from 'antd';
import { inject, observer } from 'mobx-react';
import AddDrawer from './add'

const OrderPackaging = ({commonStore}) => {
    const [ listData,    setListData    ] = React.useState([])
    const [ addDrawer,   setAddDrawer   ] = React.useState(false)
    const [ selectedRow, setSelectedRow ] = React.useState({})
    const lastIndex                    = React.useRef(0)
    const addDrawerOpen  = () => setAddDrawer(true)
    const addDrawerClose = () => setAddDrawer(false)
    React.useEffect(() => {
        fetchData()
    }, [])

    const fetchData = () => {
        commonStore.handleApi({
            url : `/packings`
        })
        .then(result => {
            result.data.map((unit) => {
                unit.dataIndex = lastIndex.current
                lastIndex.current++
            })
            setListData(result.data)
        })
    }

    const columns = [{
        dataIndex   : `product_code`, 
        title       : `상품 코드`, 
        width       : 120, 
    }, {
        dataIndex   : `product_name`, 
        title       : `상품명`, 
        width       : 200, 
        ellipsis    : true
    }, {
        dataIndex   : `company`, 
        title       : `회사`, 
        width       : 80, 
    }, {
        dataIndex   : `status`, 
        title       : `제작 상태`, 
        width       : 100, 
    }, {
        dataIndex   : `produce_company`, 
        title       : `제작처`, 
        width       : 120, 
    }, {
        dataIndex   : `product_qty`, 
        title       : `발주 수량`, 
        width       : 100, 
        align       : `right`
    }, {
        dataIndex   : `order_date`, 
        title       : `제작 발주일`, 
        width       : 100, 
    }, {
        dataIndex   : `order_request_date`, 
        title       : `입고 요청일`, 
        width       : 100, 
    }, {
        dataIndex   : `receiving_date`, 
        title       : `입고일`, 
        width       : 100, 
    }, {
        dataIndex   : `receiving_qty`, 
        title       : `입고 수량`, 
        width       : 100, 
        align       : `right`
    }, {
        dataIndex   : `production_user`, 
        title       : `제작 담당`, 
        width       : 80, 
    }, ]

    return (
        <>
            <Row className="topTableInfo">
                <Col span={24} className="topTable_right">
                    <Button className="btn btn-primary btn_add" shape="circle" onClick={() => {setSelectedRow({}); addDrawerOpen()}} style={{marginLeft: 10}}>+</Button>
                </Col>
            </Row>
            <Row className="gridWrap">
                <Table
                    rowKey      = {'dataIndex'}
                    dataSource  = {listData}
                    columns     = {columns}
                    size        = {'middle'}
                    style       = {{ minHeight: '700px', padding: 0}}
                    bordered    = {true}
                    onRow       = {(record) => ({
                        onClick : (event) => {
                            setSelectedRow(record)
                            setAddDrawer(true)
                        }
                    })}
                />
            </Row>
            {addDrawer ? <AddDrawer addVisible={addDrawer} drawerClose={addDrawerClose} drawerChk='Y' rowData={selectedRow} refreshList={fetchData} /> : ''}
        </>
    )
}

export default inject('commonStore')(observer(OrderPackaging))