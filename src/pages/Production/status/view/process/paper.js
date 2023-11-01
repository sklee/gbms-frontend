import React from 'react'
import { Row, Col, Table }   from 'antd'
import { isEmpty, moneyComma }      from '@components/Common/Js';
import { ViewContext }              from '..';

const Paper = ({productionData}) => {
    const providerData  = React.useContext(ViewContext)
    const [selectedRow,      setSelectedRow      ] = React.useState({})
    const [selectedRowIndex, setSelectedRowIndex ] = React.useState(-1)
    const [selectedRowKeys,  setSelectedRowKeys  ] = React.useState([])
    // Table Select Options
    const columns = [{
        dataIndex : "Composition", 
        title     : '세부 구성', 
        width     : 100, 
        ellipsis  : true, 
        render    : () => (
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
        dataIndex : "printPaper", 
        title     : '인쇄 종이', 
        width     : 120,
        ellipsis  : true, 
        render    : () => <>{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.paper_information?.paper_name}</>
    }, {
        dataIndex : "paper_qty", 
        title     : '종이 수량', 
        width     : 80, 
        align     : 'right', 
        render    : (text, record, index) => <>{moneyComma(text)}</>
    }, {
        dataIndex : "price", 
        title     : '단가', 
        width     : 100, 
        align     : 'right', 
        render    : (text, record, index) => <>{moneyComma(text)}</>
    }, {
        dataIndex : "total_amount", 
        title     : '합계', 
        width     : 100, 
        align     : 'right', 
        render    : (text, record, index) => <>{moneyComma(text)}</>
    }, {
        dataIndex : "produce_company_id", 
        title     : '제작처', 
        width     : 120, 
        ellipsis  : true, 
        render    : (text, record, index) => <>{record?.produce_company?.name}</>
    }, {
        dataIndex : "delivery_produce_company_id", 
        title     : '납품처', 
        ellipsis  : true, 
        render    : (text, record, index) => <>{record?.delivery_produce_company?.name}</>
    }, {
        dataIndex : "cost_attribution_date", 
        title     : '비용 귀속일', 
        width     : '120', 
        ellipsis  : true, 
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
        setSelectedRow(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].papers.filter(row => row.id == selectedRowKeys[0])[0] ) 
    }, [selectedRowKeys])
    // selectedRow 에 따라 Index 저장
    React.useEffect(() => {
        setSelectedRowIndex(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.papers.indexOf(selectedRow))
    }, [selectedRow])
    return(
        <Row>
            {/* 왼쪽 테이블 영역 */}
            <Col xs={8} lg={8}>
                <Table
                    rowKey      = { 'id' }
                    dataSource  = { providerData.detailRowIndex !== -1 ? productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.papers : [] }
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
                {(selectedRowIndex !== undefined && selectedRowIndex !== -1)? 
                    <>
                        <Row style={{border: 0}}>
                            <Col xs={3} lg={3} className="label">제작처</Col>
                            <Col xs={9} lg={9} className="input_box">
                            {   
                                !isEmpty(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.papers[selectedRowIndex].produce_company) &&
                                <>{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.papers[selectedRowIndex]?.produce_company?.name} </>
                            }
                            </Col>
                            <Col xs={3} lg={3} className="label">납품처 <span className="spanStar">*</span></Col>
                            <Col xs={9} lg={9} className="input_box">
                            {
                                !isEmpty(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.papers[selectedRowIndex]?.delivery_produce_company) &&
                                <>{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.papers[selectedRowIndex]?.delivery_produce_company?.name} </>
                            }
                            </Col>
                        </Row>
                        <Row style={{border: 0, margin: '10px 0'}}>
                            <Col xs={3} lg={3} className="label">종이 대수</Col>
                            <Col xs={9} lg={5} className="input_box">{Math.round(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.papers[selectedRowIndex]?.ds)}</Col>
                            <Col xs={3} lg={3} className="label">종이 정미</Col>
                            <Col xs={9} lg={5} className="input_box">{Math.round(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.papers[selectedRowIndex]?.jm)}</Col>
                            <Col xs={3} lg={3} className="label">1대당 여분 매수</Col>
                            <Col xs={9} lg={5} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.papers[selectedRowIndex]?.paper_spare}</Col>
                            <Col xs={3} lg={3} className="label">여분</Col>
                            <Col xs={9} lg={5} className="input_box">{Math.round(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.papers[selectedRowIndex]?.spare)}</Col>
                            <Col xs={3} lg={3} className="label">조정</Col>
                            <Col xs={9} lg={5} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.papers[selectedRowIndex]?.adjust}</Col>
                            <Col xs={3} lg={3} className="label">종이 수량</Col>
                            <Col xs={9} lg={5} className="input_box">{moneyComma(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.papers[selectedRowIndex]?.paper_qty)}</Col>
                            <Col xs={3} lg={3} className="label">고시가</Col>
                            <Col xs={9} lg={5} className="input_box">{moneyComma(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.papers[selectedRowIndex]?.notice_price)}</Col>
                            <Col xs={3} lg={3} className="label">할인율</Col>
                            <Col xs={9} lg={5} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.papers[selectedRowIndex]?.rate_discount}</Col>
                            <Col xs={3} lg={3} className="label">단가</Col>
                            <Col xs={9} lg={5} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.papers[selectedRowIndex]?.price}</Col>
                            <Col xs={3} lg={3} className="label">공급가</Col>
                            <Col xs={9} lg={5} className="input_box">{moneyComma(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.papers[selectedRowIndex]?.supply_price)}</Col>
                            <Col xs={3} lg={3} className="label">부가세</Col>
                            <Col xs={9} lg={5} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.papers[selectedRowIndex]?.vat}</Col>
                            <Col xs={3} lg={3} className="label">합계</Col>
                            <Col xs={9} lg={5} className="input_box">{moneyComma(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.papers[selectedRowIndex]?.total_amount)}</Col>
                        </Row>

                        <Row style={{border: 0}}>
                            <Col xs={3} lg={3} className="label">전달 사항</Col>
                            <Col xs={9} lg={21} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.papers[selectedRowIndex].memo}</Col>
                        </Row>

                        <Row style={{border: 0, margin: '10px 0'}}>
                            <Col xs={3} lg={3} className="label">비용 귀속일</Col>
                            <Col xs={9} lg={21} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.papers[selectedRowIndex].cost_attribution_date}</Col>
                        </Row>
                    </> : <></>
                }
                
            </Col>
        </Row>
    )
}

export default Paper