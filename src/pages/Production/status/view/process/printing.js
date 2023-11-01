import React from 'react'
import { Row, Col, Table } from 'antd'
import { ViewContext } from '..';
import { isEmpty, moneyComma } from '@components/Common/Js';

const Printing = ({productionData}) => {
    const providerData  = React.useContext(ViewContext)
    const [selectedRow,      setSelectedRow      ] = React.useState({})
    const [selectedRowIndex, setSelectedRowIndex ] = React.useState(-1)
    const [selectedRowKeys,  setSelectedRowKeys  ] = React.useState([])
    // Table Select Options
    const columns = [{
        dataIndex : "Composition", 
        title : "세부 구성", 
        width : 100,
        render : () => (
            <>
                {/* 세부 구성 (ex. 표지, 본문) */}
                {productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.produce_code_detail?.name} 
                {/* 앞면 도수 */}
                ({productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.front_cmyk} / 
                {/* 뒷면 도수 */}
                {productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.back_cmyk})
            </>
        )
    }, {
        dataIndex   : "type", 
        title       : "공정", 
        width       : 80,
        render      : text => <>{ text == 1 ? '인쇄' : '인쇄판' }</>
    }, {
        dataIndex   : "ds", 
        title       : "인쇄(판) 대수", 
        width       : 120, 
        align       : "right", 
        render      : text => moneyComma(Math.round(text))
    }, {
        dataIndex   : "jm_hook", 
        title       : "인쇄 정미", 
        width       : 100, 
        align       : "right", 
        render      : text => moneyComma(Math.round(text))
    }, {
        dataIndex   : "print_qty", 
        title       : "인쇄(판) 수량", 
        width       : 120, 
        align       : "right", 
        render      : text => moneyComma(Math.round(text))
    }, {
        dataIndex   : "price", 
        title       : "단가", 
        width       : 120, 
        align       : "right", 
        render      : text => moneyComma(Math.round(text))
    }, {
        dataIndex   : "total_amount", 
        title       : "합계", 
        width       : 120, 
        align       : "right", 
        render      : text => moneyComma(Math.round(text))
    }, {
        dataIndex   : "printable_id", 
        title       : "제작처", 
        width       : 120,
        render      : (text, record, index) => <>{record?.produce_company?.name}</>
    }, {
        dataIndex   : "produce_company_id",
        title       : "납품처", 
        width       : 120,
        render      : (text, record, index) => <>{record?.delivery_produce_company?.name}</>
    }, {
        dataIndex   : "cost_attribution_date", 
        title       : "비용 귀속일", 
        width       : 120,
    }]
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
                    dataSource  = { providerData.detailRowIndex !== -1 ? productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints : [] }
                    columns     = { columns }
                    size        = { 'middle' }
                    bordered    = { true }
                    style       = {{ padding: 0, flex: 1}}
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
                {(selectedRowIndex !== undefined && selectedRowIndex !== -1) ? 
                    <>
                        <Row style={{border: 0}}>
                            <Col xs={6} lg={4} className="label">제작처</Col>
                            <Col xs={6} lg={8} className="input_box">
                            {
                                !isEmpty(productionData.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints[selectedRowIndex]?.produce_company) && 
                                <>{productionData.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints[selectedRowIndex]?.produce_company?.name}</>
                            }
                            </Col>
                            <Col xs={6} lg={4} className="label">납품처</Col>
                            <Col xs={6} lg={8} className="input_box">
                            {
                                !isEmpty(productionData.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints[selectedRowIndex]?.delivery_produce_company) &&
                                <>{productionData.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints[selectedRowIndex]?.delivery_produce_company?.name}</>
                            }
                            </Col>
                        </Row>

                        {productionData.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints[selectedRowIndex]?.type === 1 ? 
                            <Row style={{border: 0, margin: '10px 0'}}>
                                <Col xs={6} lg={4} className="label">인쇄 완료<br/>요청일</Col>
                                <Col xs={6} lg={8} className="input_box">{productionData.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints[selectedRowIndex]?.request_complete_date}</Col>
                                <Col xs={6} lg={4} className="label">인쇄 대수</Col>
                                <Col xs={6} lg={8} className="input_box">{moneyComma(Math.round(productionData.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints[selectedRowIndex]?.ds))}</Col>
                                <Col xs={6} lg={4} className="label">인쇄 정미</Col>
                                <Col xs={6} lg={8} className="input_box">{moneyComma(Math.round(productionData.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints[selectedRowIndex]?.jm_hook))}</Col>
                                <Col xs={6} lg={4} className="label">인쇄 수량</Col>
                                <Col xs={6} lg={8} className="input_box">{moneyComma(Math.round(productionData.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints[selectedRowIndex]?.print_qty))}</Col>
                            </Row>
                            : 
                            <Row style={{border: 0, margin: '10px 0'}}>
                                <Col xs={6} lg={4} className="label">인쇄판 대수</Col>
                                <Col xs={6} lg={8} className="input_box">{moneyComma(Math.round(productionData.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints[selectedRowIndex]?.ds))}</Col>
                                <Col xs={6} lg={4} className="label">같이걸이</Col>
                                <Col xs={6} lg={8} className="input_box">{moneyComma(Math.round(productionData.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints[selectedRowIndex]?.jm_hook))}</Col>
                                <Col xs={6} lg={4} className="label">인쇄판 수량</Col>
                                <Col xs={6} lg={20} className="input_box">{moneyComma(Math.round(productionData.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints[selectedRowIndex]?.print_qty))}</Col>
                            </Row>
                        }
                        <Row style={{border: 0}}>
                            <Col xs={6} lg={4} className="label">단가</Col>
                            <Col xs={6} lg={8} className="input_box">{productionData.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints[selectedRowIndex]?.price}</Col>
                            <Col xs={6} lg={4} className="label">공급가</Col>
                            <Col xs={6} lg={8} className="input_box">{moneyComma(Math.round(productionData.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints[selectedRowIndex]?.supply_price))}</Col>
                            <Col xs={6} lg={4} className="label">부가세</Col>
                            <Col xs={6} lg={8} className="input_box">{productionData.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints[selectedRowIndex]?.vat}</Col>
                            <Col xs={6} lg={4} className="label">합계</Col>
                            <Col xs={6} lg={8} className="input_box">{moneyComma(Math.round(productionData.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints[selectedRowIndex]?.total_amount))}</Col>
                        </Row>
                        <Row style={{border: 0}}>
                            <Col xs={6} lg={4} className="label">전달 사항</Col>
                            <Col xs={6} lg={20} className="input_box">{productionData.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints[selectedRowIndex]?.memo}</Col>
                        </Row>
                        <Row style={{border: 0, margin: '10px 0'}}>
                            <Col xs={6} lg={4} className="label">비용 귀속일</Col>
                            <Col xs={6} lg={20} className="input_box">{productionData.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints[selectedRowIndex]?.cost_attribution_date}</Col>
                        </Row>
                    </> : <></>
                }
            </Col>
        </Row>
    )
}

export default Printing