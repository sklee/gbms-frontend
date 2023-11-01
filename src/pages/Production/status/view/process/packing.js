import React from 'react'
import { Row, Col, Table }      from 'antd'
import { isEmpty, moneyComma }  from '@components/Common/Js';
import { ViewContext }          from '..';

const Packing = ({productionData}) => {
    const providerData  = React.useContext(ViewContext)
    const [selectedRow,      setSelectedRow      ] = React.useState({})
    const [selectedRowIndex, setSelectedRowIndex ] = React.useState(-1)
    const [selectedRowKeys,  setSelectedRowKeys  ] = React.useState([])
    // Table Select Options
    const columns = [{
        dataIndex   : ["produce_process", "name"], 
        title       : "공정", 
        width       : 150
    }, {
        dataIndex   : "work_qty", 
        title       : "작업 수량", 
        width       : 100, 
        align       : "right",
        render      : text => moneyComma(text)
    }, {
        dataIndex   : "price", 
        title       : "단가", 
        width       : 120, 
        align       : "right",
        render      : text => moneyComma(text)
    }, {
        dataIndex   : "total_amount", 
        title       : "합계", 
        width       : 120, 
        align       : "right",
        render      : text => moneyComma(text)
    }, {
        dataIndex : ["produce_company", "name"], 
        title       : "제작처", 
        width       : 120
    }, {
        dataIndex   : ["delivery_produce_company", "name"], 
        title       : "납품처", 
        width       : 120
    }, {
        dataIndex   : "cost_at", 
        title       : "비용 귀속일", 
        width       : 120
    }, ]
    // Table Select Options
    const rowSelection = {
        type : 'radio', 
        selectedRowKeys,
        columnWidth: 0, 
        renderCell: () => <></>,
        onChange: setSelectedRowKeys,
    }
    // 선택한 Row가 달라지면 오른쪽 내용 재구성
    React.useEffect(() => {
        setSelectedRow(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].prints.filter(row => row.id == selectedRowKeys[0])[0] ) 
    }, [selectedRowKeys])
    // selectedRow 에 따라 Index 저장
    React.useEffect(() => {
        setSelectedRowIndex(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints.indexOf(selectedRow))
    }, [selectedRow])

    return(
        <Row>
            {/* 왼쪽 테이블 영역 */}
            <Col xs={8} lg={8}>
                <Table
                    rowKey      = { 'id' }
                    dataSource  = { providerData.detailRowIndex !== -1 ? productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.packings : [] }
                    columns     = { columns }
                    size        = { 'middle' }
                    bordered    = { true }
                    style       = {{ padding: 0, flex: 1, minHeight : 300}}
                    sticky      = {{ offsetHeader : -20 }}
                    scroll      = {{ x : 800, y: 600}}
                    pagination  = { false }
                    onRow       = {(record) => ({
                        onClick : (event) => { setSelectedRowKeys([record.id]) }
                    })}
                    rowSelection= { rowSelection }
                />
            </Col>
            {/* 오른쪽 폼 영역 */}
            <Col xs={16} lg={16} style={{backgroundColor: '#ddd'}}>
                { (selectedRowIndex !== undefined && selectedRowIndex) !== -1 ? 
                    <>
                        <Row style={{border: 0}}>
                            <Col xs={6} lg={3} className="label">제작처</Col>
                            <Col xs={6} lg={9} className="input_box">
                            {
                                !isEmpty(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.packings[selectedRowIndex]?.produce_company) &&
                                <>{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.packings[selectedRowIndex]?.produce_company?.name}</>
                            }
                            </Col>
                            <Col xs={6} lg={3} className="label">납품처</Col>
                            <Col xs={6} lg={9} className="input_box">
                            {
                                !isEmpty(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.packings[selectedRowIndex]?.delivery_produce_company) &&
                                <>{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.packings[selectedRowIndex]?.delivery_produce_company?.name}</>
                            }
                            </Col>
                        </Row>
                        <Row style={{border: 0, marginTop: 10}}>
                            <Col xs={6} lg={3} className="label">공정</Col>
                            <Col xs={6} lg={9} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.packings[selectedRowIndex]?.produce_process?.name}</Col>
                            <Col xs={6} lg={3} className="label">단가 기준</Col>
                            <Col xs={6} lg={9} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.packings[selectedRowIndex]?.process_unit}</Col>
                            <Col xs={6} lg={3} className="label">집책</Col>
                            <Col xs={6} lg={9} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.packings[selectedRowIndex]?.jc}</Col>
                            <Col xs={6} lg={3} className="label">작업 수량</Col>
                            <Col xs={6} lg={9} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.packings[selectedRowIndex]?.work_qty}</Col>
                        </Row>
                        <Row style={{border: 0}}>
                            <Col xs={6} lg={3} className="label">단가</Col>
                            <Col xs={6} lg={9} className="input_box">{moneyComma(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.packings[selectedRowIndex]?.price)}</Col>
                            <Col xs={6} lg={3} className="label">공급가</Col>
                            <Col xs={6} lg={9} className="input_box">{moneyComma(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.packings[selectedRowIndex]?.supply_price)}</Col>
                            <Col xs={6} lg={3} className="label">부가세</Col>
                            <Col xs={6} lg={9} className="input_box">{moneyComma(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.packings[selectedRowIndex]?.vat)}</Col>
                            <Col xs={6} lg={3} className="label">합계</Col>
                            <Col xs={6} lg={9} className="input_box">{moneyComma(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.packings[selectedRowIndex]?.total_amount)}</Col>
                        </Row>
                        <Row style={{border: 0, marginTop: 10}}>
                            <Col xs={6} lg={3} className="label">전달 사항</Col>
                            <Col xs={18} lg={21} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.packings[selectedRowIndex]?.memo}</Col>
                        </Row>
                        <Row style={{border: 0, margin: '10px 0'}}>
                            <Col xs={6} lg={3} className="label">비용 귀속일</Col>
                            <Col xs={18} lg={21} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.packings[selectedRowIndex]?.cost_attribution_date}</Col>
                        </Row>
                    </> : <></>
                }
            </Col>
        </Row>
    )
}

export default Packing