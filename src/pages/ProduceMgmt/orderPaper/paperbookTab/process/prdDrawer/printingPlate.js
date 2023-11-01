import React from 'react'
import { Row, Drawer, Space, Button, Table } from 'antd'
import { inject, observer } from 'mobx-react';
import { moneyComma } from '@components/Common/Js';
import { ArrowsAltOutlined, CloseOutlined, ShrinkOutlined } from '@ant-design/icons';

const PrintingPlateDrawer = ({ commonStore, viewVisible, visibleClose, setPrintDrawerData }) => {
    const [listData, setListData] = React.useState([])
    const [ drawerExtended, setDrawerExtended ] = React.useState(false)
    const columns = [{
        dataIndex : `produce_company`,
        title     : `제작처`, 
        width     : 200
    }, {
        dataIndex : `cmyk`,
        title     : `단가 기준`, 
        width     : 60, 
        render    : text => <>{text}도</>
    }, {
        dataIndex : `price`,
        title     : `단가`, 
        width     : 60, 
        align     : 'right',
        render    : text => moneyComma(text)
    }, {
        dataIndex : `apply_date`,
        title     : `단가 적용일`, 
        width     : 60, 
    }, {
        dataIndex : `memo`,
        title     : `참고 사항`, 
        width     : 180, 
    }]
    React.useEffect(() => {
        commonStore.handleApi({
            url : `/process-printing-plate`
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
                            setPrintDrawerData({
                                produce_company_id : record.produce_company_id,
                                produce_company    : record.produce_company,
                                price              : record.price,
                            })
                        }
                    })}
                />
            </Row>
        </Drawer>
    )
}

export default inject('commonStore')(observer(PrintingPlateDrawer))