import React from 'react'
import { Row, Drawer, Button, Table } from 'antd'
import { FormikContext } from 'formik';
import { PaperBookContext } from '../..';
import { inject, observer } from 'mobx-react';
import { ArrowsAltOutlined, CloseOutlined, ShrinkOutlined } from '@ant-design/icons';

const PaperDrawer = ({ commonStore, viewVisible, visibleClose, setPaperDrawerData }) => {
    const [ listData,       setListData         ] = React.useState([])
    const [ drawerExtended, setDrawerExtended   ] = React.useState(false)
    const formikHook              = React.useContext(FormikContext)
    const providerData            = React.useContext(PaperBookContext)
    const columns = [{
        dataIndex : "produce_company", 
        title : "종이 공급처", 
    }, {
        dataIndex : "paper_gsm", 
        title : "평량(g/㎡)", 
        width : 120, 
        align : "right"
    }, {
        dataIndex : "paper_color", 
        title : "색상", 
        width : 80, 
    }, {
        dataIndex : "paper_type", 
        title : "종이 종류", 
        width : 120, 
    }, {
        dataIndex : "paper_standard", 
        title : "종이 규격", 
        width : 120, 
    }, {
        dataIndex : "paper_price", 
        title : "고시가격", 
        width : 120,  
        align : "right"
    }, {
        dataIndex : "rate_discount", 
        title : "할인율", 
        align : "right",
        width : 100, 
    }, {
        dataIndex : "unit_price", 
        title : "단가", 
        width : 120, 
        align : "right"
    }, {
        dataIndex : "apply_date", 
        title : "할인율 적용일", 
        width : 120, 
    }, {
        dataIndex : "status", 
        title : "작업", 
        width : 100,  
        align : "center"
    }, ]
    React.useEffect(() => {
        commonStore.handleApi({
            url : '/paper-supplier'
        })
        .then((result) => {
            // 종이 규격 데이터 가져와서 
            // 목록 필터링
            result.data = result.data.filter(row => row.paper_standard_id === formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.paper_standard_id)
            setListData(result.data)
        })
    }, [formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.paper_standard_id])
    return(
        <>
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
                                setPaperDrawerData(record)
                            }
                        })}
                    />
                </Row>
                {/* <Row gutter={10} className="table_bot">
                    <span>행 개수 : {state.list.length}</span>
                </Row> */}
            </Drawer>
        </>
    )
}


export default inject('commonStore')(observer(PaperDrawer))