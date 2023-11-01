import React from 'react'
import { Row, Col, Drawer, Space, Button, Radio, Table } from 'antd'
import { inject, observer } from 'mobx-react'
import { ArrowsAltOutlined, CloseOutlined, ShrinkOutlined } from '@ant-design/icons'

const VendorDrawer = ({ commonStore, viewVisible, visibleClose, setVendorDrawerData, drawerVendorTarget, produceTargetId}) => {
    // 납품처 기본 값 선택 (radio default)
    const [ vendorTarget,   setVendorTarget     ] = React.useState('')
    const [ vendorList,     setVendorList       ] = React.useState([])
    const [ listData,       setListData         ] = React.useState([])
    const [ drawerExtended, setDrawerExtended   ] = React.useState(false)
    const columns = [{
        title : '사업자명', 
        dataIndex : 'name', 
        width : 120
    }, {
        title : '사업자등록번호', 
        dataIndex : 'company_no', 
        width : 200
    }, {
        title : '담당 공정', 
        dataIndex : 'process', 
    },]
    React.useEffect(() => {
        // vendorTarget에 따라 url 변경
        commonStore.handleApi({
            url : '/produce-company',
        })
        .then((result) => {
            setVendorList(result.data)
            setVendorTarget(drawerVendorTarget)
        })
    }, [])
    
    React.useEffect(() => {
        // 2:종이, 3:인쇄, 4:제본, 5:후가공, 6:포장, 7:부속 제작, 8:prepress, 9: 포장 물품 제작, 
        switch ( vendorTarget ) {
            case 'same'        : setListData(vendorList.filter(row => row.id === produceTargetId));     break;
            case 'prepress'    : setListData(vendorList.filter(row => row.process_code.includes(8)));   break;
            case 'paper'       : setListData(vendorList.filter(row => row.process_code.includes(2)));   break;
            case 'printing'    : setListData(vendorList.filter(row => row.process_code.includes(3)));   break;
            case 'bookBinding' : setListData(vendorList.filter(row => row.process_code.includes(4)));   break;
            case 'postprocess' : setListData(vendorList.filter(row => row.process_code.includes(5)));   break;
            case 'packing'     : setListData(vendorList.filter(row => row.process_code.includes(6)));   break;
            case 'insert'      : setListData(vendorList.filter(row => row.process_code.includes(7)));   break;
            case 'stock'       : setListData(vendorList.filter(row => row.process_code.includes(9)));   break;
            default            : break;
        }
    }, [vendorTarget])
    return(
        <Drawer 
            title='납품처 선택'
            placement='right'
            onClose={visibleClose}
            visible={viewVisible}
            className={drawerExtended ? 'drawerWrap drawerback' : 'drawerWrap'}
            closable={false}
            keyboard={false}
            extra={
                
                <Space>
                    <Button onClick={() =>{ setDrawerExtended(!drawerExtended) }} style={{marginRight: 10}}>
                        {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                    </Button>
                    <Button onClick={visibleClose}>
                        <CloseOutlined />
                    </Button>
                </Space>
            }
        >
            <Row className="topTableInfo">
                <Col lg={24}>
                    <Radio.Group value={vendorTarget}> 
                        <Radio value={'same'}        onChange={() => setVendorTarget('same')} disabled={produceTargetId == '' ? true : false }>제작처와 같음</Radio>
                        <Radio value={'prepress'}    onChange={() => setVendorTarget('prepress')}>   PrePress    </Radio>
                        <Radio value={'paper'}       onChange={() => setVendorTarget('paper')}>      종이        </Radio>
                        <Radio value={'printing'}    onChange={() => setVendorTarget('printing')}>   인쇄        </Radio>
                        <Radio value={'bookBinding'} onChange={() => setVendorTarget('bookBinding')}>제본        </Radio>
                        <Radio value={'postprocess'} onChange={() => setVendorTarget('postprocess')}>후가공      </Radio>
                        <Radio value={'packing'}     onChange={() => setVendorTarget('packing')}>    포장        </Radio>
                        <Radio value={'insert'}      onChange={() => setVendorTarget('insert')}>     부속 제작   </Radio>
                        <Radio value={'stock'}       onChange={() => setVendorTarget('stock')}>      라임북(창고)</Radio>
                    </Radio.Group> 
                </Col>
            </Row>

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
                            setVendorDrawerData(record)
                        }
                    })}
                />
            </Row>
            
        </Drawer>
    )
}

export default inject('commonStore')(observer(VendorDrawer))