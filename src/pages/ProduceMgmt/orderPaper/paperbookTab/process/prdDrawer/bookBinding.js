import React from 'react'
import { Row, Drawer, Space, Button, Table } from 'antd'
import { inject, observer } from 'mobx-react';
import { moneyComma } from '@components/Common/Js';
import { ArrowsAltOutlined, CloseOutlined, ShrinkOutlined } from '@ant-design/icons';

const BookBindingDrawer = ({ commonStore, viewVisible, visibleClose, setBindingDrawerData }) => {
    const [ listData,       setListData         ] = React.useState([])
    const [ drawerExtended, setDrawerExtended   ] = React.useState(false)
    const columns = [{
        dataIndex : 'produce_company', 
        title : '제작처', 
        width : 100
    } , {
        dataIndex : 'produce_process', 
        title : '공정', 
        width : 160
    } , {
        dataIndex : 'min_price', 
        title : '최소 금액', 
        width : 80,
        align : 'right', 
        render : text => moneyComma(text)
    } , {
        dataIndex : 'produce_process_unit', 
        title : '단가 기준', 
        width : 80
    } , {
        dataIndex : 'price', 
        title : '단가', 
        align : 'right', 
        width : 80, 
        render : text => moneyComma(text)
    } , {
        dataIndex : 'apply_date', 
        title : '단가 적용일', 
        width : 80
    } , {
        dataIndex : 'memo', 
        title : '참고사항', 
        width : 120
    } ]
    React.useEffect(() => {
        commonStore.handleApi({
            url : `/process-binding`
        })
        .then((result) => {
            delete result.data.prices
            setListData(result.data)
        })
    }, [])

    return(
        <Drawer 
            title='제작처(공정) 선택'
            placement='right'
            onClose={visibleClose}
            visible={viewVisible}
            className={drawerExtended ? 'drawerWrap drawerback' : 'drawerWrap'}
            closable={false}
            keyboard={false}
            extra={
                <>
                    <Button onClick={() =>{ setDrawerExtended(!drawerExtended) }} style={{marginRight: 10}}>
                        {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                    </Button>
                    <Button onClick={visibleClose}>
                        <CloseOutlined />
                    </Button>
                </>
            }
        >
            <Row className="gridWrap">
                <Table 
                    rowKey      = { 'id' }
                    dataSource  = { listData }
                    columns     = { columns }
                    size        = { 'middle' }
                    bordered    = { true }
                    style       = {{ padding: 0, flex: 1, minHeight : 300}}
                    scroll      = {{ x : 800, y: 700}}
                    pagination  = { false }
                    onRow       = {(record) => ({
                        onClick : (event) => { 
                            visibleClose()
                            setBindingDrawerData({
                                produce_company_id : record.produce_company_id,
                                produce_company    : record.produce_company,
                                produce_process_id : record.produce_process_id,
                                produce_process    : record.produce_process,
                                price              : record.price,
                            })
                        }
                    })}
                />
            </Row>
        </Drawer>
    )
}

export default inject('commonStore')(observer(BookBindingDrawer))