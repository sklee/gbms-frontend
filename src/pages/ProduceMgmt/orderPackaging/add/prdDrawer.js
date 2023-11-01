import React from 'react'
import { Row, Drawer, Space, Button, Table } from 'antd'
import { inject, observer } from 'mobx-react';
import { moneyComma } from '@components/Common/Js';
import { ArrowsAltOutlined, CloseOutlined, ShrinkOutlined } from '@ant-design/icons';

const PrdDrawer = ({ commonStore, viewVisible, visibleClose, setProductDrawerData, selectedRow }) => {
    const [listData, setListData] = React.useState([])
    const [ drawerExtended, setDrawerExtended ] = React.useState(true)
    const columns = [{
        dataIndex : `produce_company`, 
        title : `제작처`, 
        width : 100, 
    }, {
        dataIndex : `produce_process`, 
        title : `공정`, 
        width : 100, 
    }, {
        dataIndex : `produce_process_unit`, 
        title : `단가 기준`, 
        width : 100, 
    }, {
        dataIndex : `price`, 
        title : `단가`, 
        width : 100, 
        render: (text, record, index) => <>{moneyComma(text)}</>
    }, {
        dataIndex : `apply_date`, 
        title : `단가 적용일`, 
        width : 100, 
    }, {
        dataIndex : `memo`, 
        title : `참고사항`, 
        width : 100, 
    },]

    React.useEffect(() => {
        commonStore.handleApi({
            url : '/process-packing-goods'
        })
        .then((result) => {
            setListData(result.data)
        })
    }, [])

    return(
        <Drawer 
            title='제작처(공정) 선택'
            placement='right'
            onClose={visibleClose}
            visible={viewVisible}
            className="drawerWrap"
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
            <Row className='gridWrap'>
                <Table 
                    rowKey      = { 'id' }
                    dataSource  = { listData }
                    columns     = { columns }
                    size        = { 'middle' }
                    bordered    = { true }
                    style       = {{ padding: 0, flex: 1, minHeight : 300}}
                    scroll      = {{ x : 800, y: 600}}
                    pagination  = { false }
                    onRow       = {(record) => ({
                        onClick : (event) => { 
                            visibleClose()
                            setProductDrawerData(record)
                        }
                    })}
                />
            </Row>
        </Drawer>
    )
}

export default inject('commonStore')(observer(PrdDrawer)) 