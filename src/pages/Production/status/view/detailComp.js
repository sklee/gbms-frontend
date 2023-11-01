import React from 'react'
import { Row, Col, Table } from 'antd'
import { ViewContext } from '.';

const DetailComp = ({productionData}) => {
    const providerData  = React.useContext(ViewContext)
    const [selectedRowKeys, setSelectedRowKeys  ] = React.useState([])
    // TABLE Setting
    const columns = [{
        dataIndex : 'produce_code_detail_id', 
        title : '구분',
        width : 120, 
        ellipsis : true, 
        render : (text, record, index) => <>{record?.produce_code_detail?.name} ({record?.front_cmyk}/{record?.back_cmyk}도)</>
    }, {
        dataIndex : "page_number", 
        title : "쪽수" , 
        width : 60, 
        align : "right", 
    }, {
        dataIndex : ["paper_standard", "name"], 
        title : "종이 규격", 
        width : 120, 
    }, {
        dataIndex : "main_outside", 
        title : "본문 적용 절수",
        width : 80,  
        align: "right"
    }, {
        dataIndex : "width", 
        title : "가로" , 
        width : 80,  
        align : "right"
    }, {
        dataIndex : "height", 
        title : "세로" , 
        width : 80,  
        align : "right"
    }, {
        dataIndex : ["paper_information", "paper_name"], 
        title : "인쇄 종이", 
        ellipsis : true, 
    }, {
        dataIndex : "memo", 
        title : "판걸이 설명", 
        width : 120, 
        ellipsis : true, 
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
        providerData.setSelectedDetailsRow(productionData.defaults[providerData.defaultRowIndex]?.details.filter(row => row.id == selectedRowKeys[0])[0] ) 
    }, [selectedRowKeys])

    return(
        <div style={{margin: '30px 0'}}>
            <Row gutter={10} className="table">
                <Col xs={24} lg={24} className="addLabel">세부 구성</Col>
                <Col xs={24} lg={24} style={{display: 'flex', flexWrap: 'wrap', padding: 0, border: 0}}>
                    {/* 왼쪽 테이블 영역 */}
                    <Col xs={8} lg={8}>
                        <Table 
                            rowKey      = { 'id' }
                            dataSource  = { providerData.defaultRowIndex !== -1 ? productionData?.defaults[providerData.defaultRowIndex]?.details : [] }
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
                        {(providerData.detailRowIndex !== -1 ) && 
                            <>
                                <Row style={{border: 0}}>
                                    <Col xs={6} lg={4} className="label">세부 구성</Col>
                                    <Col xs={6} lg={8} className="input_box"> {productionData.defaults[providerData.defaultRowIndex]?.details?.[providerData.detailRowIndex]?.produce_code_detail.name}</Col>
                                    <Col xs={6} lg={4} className="label">쪽수</Col>
                                    <Col xs={6} lg={8} className="input_box verCenter"> {productionData.defaults[providerData.defaultRowIndex]?.details?.[providerData.detailRowIndex]?.page_number}</Col>
                                    <Col xs={6} lg={4} className="label">종이 규격</Col>
                                    <Col xs={6} lg={8} className="input_box verCenter">{productionData.defaults[providerData.defaultRowIndex]?.details?.[providerData.detailRowIndex]?.paper_standard.name}</Col>
                                    <Col xs={6} lg={4} className="label">{productionData.defaults[providerData.defaultRowIndex]?.details?.[providerData.detailRowIndex]?.produce_code_detail?.print_unit == "본문" ? "본문 적용 절수" : "면지 판걸이 수" }</Col>
                                    <Col xs={6} lg={8} className="input_box verCenter">{productionData.defaults[providerData.defaultRowIndex]?.details?.[providerData.detailRowIndex]?.main_outside}</Col>
                                    <Col xs={6} lg={4} className="label">가로</Col>
                                    <Col xs={6} lg={8} className="input_box verCenter">{productionData.defaults[providerData.defaultRowIndex]?.details?.[providerData.detailRowIndex]?.width}</Col>
                                    <Col xs={6} lg={4} className="label">세로</Col>
                                    <Col xs={6} lg={8} className="input_box verCenter">{productionData.defaults[providerData.defaultRowIndex]?.details?.[providerData.detailRowIndex]?.height}</Col>
                                    <Col xs={6} lg={4} className="label">인쇄 종이</Col>
                                    <Col xs={6} lg={8} className="input_box verCenter">{productionData.defaults[providerData.defaultRowIndex]?.details?.[providerData.detailRowIndex]?.paper_information_id}</Col>
                                    <Col xs={6} lg={4} className="label">판걸이 설명</Col>
                                    <Col xs={6} lg={8} className="input_box verCenter">{productionData.defaults[providerData.defaultRowIndex]?.details?.[providerData.detailRowIndex]?.memo}</Col>
                                </Row>
                                <Row style={{width: '100%', border: 0, marginTop: 10}}>
                                    <Col lg={4} className="label">색상</Col>
                                    <Col lg={5} className="label">원색</Col>
                                    <Col lg={5} className="label">별색</Col>
                                    <Col lg={5} className="label">바탕 별색</Col>
                                    <Col lg={5} className="label">도수</Col>
                                    <Col lg={4} className="label">앞면</Col>
                                    <Col lg={5} className="input_box" style={{alignItems: 'center'}}>{productionData.defaults[providerData.defaultRowIndex]?.details?.[providerData.detailRowIndex]?.front_primary_color}</Col>
                                    <Col lg={5} className="input_box" style={{alignItems: 'center'}}>{productionData.defaults[providerData.defaultRowIndex]?.details?.[providerData.detailRowIndex]?.front_spot_color}</Col>
                                    <Col lg={5} className="input_box" style={{alignItems: 'center'}}>{productionData.defaults[providerData.defaultRowIndex]?.details?.[providerData.detailRowIndex]?.front_background_color}</Col>
                                    <Col lg={5} className="input_box" style={{alignItems: 'center'}}>{productionData.defaults[providerData.defaultRowIndex]?.details?.[providerData.detailRowIndex]?.front_cmyk}</Col>
                                    <Col lg={4} className="label">뒷면</Col>
                                    <Col lg={5} className="input_box" style={{alignItems: 'center'}}>{productionData.defaults[providerData.defaultRowIndex]?.details?.[providerData.detailRowIndex]?.back_primary_color}</Col>
                                    <Col lg={5} className="input_box" style={{alignItems: 'center'}}>{productionData.defaults[providerData.defaultRowIndex]?.details?.[providerData.detailRowIndex]?.back_spot_color}</Col>
                                    <Col lg={5} className="input_box" style={{alignItems: 'center'}}>{productionData.defaults[providerData.defaultRowIndex]?.details?.[providerData.detailRowIndex]?.back_background_color}</Col>
                                    <Col lg={5} className="input_box" style={{alignItems: 'center'}}>{productionData.defaults[providerData.defaultRowIndex]?.details?.[providerData.detailRowIndex]?.back_cmyk}</Col>
                                </Row>
                            </>
                        }
                    </Col>
                </Col>
            </Row>
        </div>
    );
}

export default DetailComp