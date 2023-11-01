import React from 'react'
import { Row, Drawer, Space, Button, Table } from 'antd'
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { inject, observer } from 'mobx-react';
import { FormikContext } from 'formik';

const PrintingDrawer = ({ commonStore, viewVisible, visibleClose, setPrintDrawerData }) => {
    const formikHook = React.useContext(FormikContext)
    const [ drawerExtended, setDrawerExtended   ] = React.useState(true)
    const [ listData,       setListData         ] = React.useState([])

    // 발주 수량에 따라 단가 값 변경
    // formikHook.values?.product_qty


    const columns = [{
        title : `제작처`, 
        dataIndex : `produce_company`,
        width : 120
    }, {
        title : `인쇄 도수`, 
        dataIndex : `frequency`,
        width : 120, 
        render : (text, record, index) => {
            let recordText = ''
            if (record.cmyk1 === 'Y') recordText += '1도, '
            if (record.cmyk2 === 'Y') recordText += '2도, '
            if (record.cmyk3 === 'Y') recordText += '3도, '
            if (record.cmyk4 === 'Y') recordText += '4도, '
            recordText = recordText.slice(0, -2)
            return <>{recordText}</>
        }
    }, {
        title : `부수 범위와 단가`, 
        dataIndex : `Range_price`,
        width : 150, 
        render : (text, record, index) => {
            let recordCompo = () => <></>
            let beforePrice = 0
            let beforeQty = 0
            recordCompo = record.price.map((row, index) => {
                // 첫번째 항목이라면
                if (row.qty == null) {
                    beforeQty   = row.qty   !== null ? row.qty : 0
                    beforePrice = row.price !== null ? row.price : 0
                }
                // 마지막 항목이 아니라면
                else if (index + 1 !== record.price.length) {
                    beforeQty   = row.qty   !== null ? row.qty : 0
                    beforePrice = row.price !== null ? row.price : 0
                    return <Row>{`${beforeQty} ~ ${row.qty} : ${beforePrice}원`}</Row>
                }
                else {
                    return <>
                        <Row>{`${beforeQty} ~ ${row.qty} : ${beforePrice}원`}</Row>
                        <Row>{`${row.qty} ~ : ${row.price}원`}</Row>
                    </>
                }
            })

            return recordCompo
        }
    }, {
        title : `단가 적용일`, 
        dataIndex : `apply_date`,
        width : 150
    }, {
        title : `참고사항`, 
        dataIndex : `memo`,
        width : 150,
    }]
    React.useEffect(() => {
        commonStore.handleApi({
            url : `/process-printing`
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
                                // 일단 비워놓는다.
                                price              : 0,
                            })
                        }
                    })}
                />
            </Row>
        </Drawer>
    )
}


export default inject('commonStore')(observer(PrintingDrawer)) 