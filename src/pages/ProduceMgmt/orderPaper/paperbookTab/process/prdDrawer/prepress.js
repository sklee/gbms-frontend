import React from 'react'
import { Row, Drawer, Button, Table } from 'antd'
import { inject, observer } from 'mobx-react'
import { moneyComma } from '@components/Common/Js'
import { ArrowsAltOutlined, CloseOutlined, ShrinkOutlined } from '@ant-design/icons'

const PrepressDrawer = ({ commonStore, viewVisible, visibleClose, setPrepressDrawerData}) => {
    const [listData, setListData] = React.useState([])
    const [ drawerExtended, setDrawerExtended ] = React.useState(false)
    const columns = [{
        title : `제작처`, 
        dataIndex : `produce_company`,
        width : 120
    }, {
        title : `공정`, 
        dataIndex : `produce_process`,
    }, {
        title : `판형`, 
        dataIndex : `produce_format`,
        width : 120
    }, {
        title : `단가 기준`, 
        dataIndex : `produce_process_unit`,
        width : 100
    }, {
        title : `단가`, 
        dataIndex : `price`,
        width : 100,
        align : 'right',
        render : (text, record, index) => <>{moneyComma(record.price)}</>
    }, {
        title : `단가 적용일`, 
        dataIndex : `apply_date`,
        width : 150
    }, {
        title : `참고사항`, 
        dataIndex : "memo",
        width : 200
    },]
    React.useEffect(() => {
        commonStore.handleApi({
            url : `/process-prepress`
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
                    scroll      = {{ x : 800, y: 600}}
                    pagination  = { false }
                    onRow       = {(record) => ({
                        onClick : (event) => { 
                            visibleClose()
                            setPrepressDrawerData(record)
                        }
                    })}
                />
            </Row>
        </Drawer>
    )
}

export default inject('commonStore')(observer(PrepressDrawer))