import React from 'react'
import { Row, Col, Table } from 'antd'
import { inject, observer, } from 'mobx-react';
import { ViewContext } from '.';

const BasicComp = ({ productionData }) => {
    const providerData  = React.useContext(ViewContext)
    const [selectedRowKeys, setSelectedRowKeys  ] = React.useState([])
    
    // TABLE Setting
    const columns = [{
        dataIndex : [`produce_code2`, `name`], 
        title : "구분", 
        width : 80,
    }, {
        dataIndex : [`produce_format`, `name`],
        title : "판형", 
        width : 120,
    }, {
        dataIndex : "width", 
        title : "가로", 
        width : 80, 
        align : "right",
    }, {
        dataIndex : "height", 
        title : "세로", 
        width : 80, 
        align : "right",
    }, {
        dataIndex : "spine", 
        title : "책등", 
        width : 80, 
        align : "right",
    }, {
        dataIndex : [`paper_standard`, `name`], 
        title : "종이 규격", 
        width : 120,
    }, {
        dataIndex : "paper_cutting", 
        title : "본문 절수", 
        width : 80, 
        align : "right",
    }, {
        dataIndex : "paper_holder", 
        title : "면지 판걸이 수", 
        width : 80, 
        align : "right",
        ellipsis : true
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
        if (productionData.defaults !== undefined) {
            providerData.setSelectedDefaultsRow(productionData.defaults.filter(row => row.id == selectedRowKeys[0])[0] ) 
        }
    }, [selectedRowKeys])

    return (
        <div>
            <Row gutter={10} className="table">
                <Col xs={24} lg={24} className="addLabel">
                    기본 구성
                </Col>
                <Col xs={24} lg={24} style={{display: 'flex', flexWrap: 'wrap', padding: 0, border: 0}}>
                    {/* 왼쪽 테이블 영역 */}
                    <Col xs={8} lg={8}>
                        <Table 
                            rowKey      = { 'id' }
                            dataSource  = { productionData.defaults }
                            columns     = { columns }
                            size        = { 'middle' }
                            bordered    = { true }
                            style       = {{ padding: 0, flex: 1, minHeight : 200}}
                            sticky      = {{ offsetHeader : -20 }}
                            scroll      = {{ x : 800, y: 600}}
                            pagination  = { false }
                            onRow       = {(record) => ({
                                onClick : () => { setSelectedRowKeys([record.id]) }
                            })}
                            rowSelection= { rowSelection }
                        />                        
                    </Col>
                    {/* 오른쪽 폼 영역 */}
                    <Col xs={16} lg={16} style={{backgroundColor: '#ddd'}}>
                        {(providerData.defaultRowIndex !== -1) &&
                            <>
                                <Row style={{border: 0}}>
                                    <Col xs={6} lg={3} className="label">기본 구성</Col>
                                    <Col xs={6} lg={21} className="input_box">
                                        {productionData?.defaults[providerData.defaultRowIndex]?.produce_code1.name + ` > ` + productionData?.defaults[providerData.defaultRowIndex]?.produce_code2.name}
                                    </Col>
                                </Row>
                                <Row style={{border: 0, margin: '10px 0'}}>
                                    <Col xs={6} lg={4} className="label">판형</Col>
                                    <Col xs={6} lg={4} className="input_box">
                                        {productionData?.defaults[providerData.defaultRowIndex]?.produce_format.name}
                                    </Col>
                                    <Col xs={6} lg={4} className="label">가로</Col>
                                    <Col xs={6} lg={4} className="input_box">
                                        {productionData?.defaults[providerData.defaultRowIndex]?.width}
                                    </Col>
                                    <Col xs={6} lg={4} className="label">세로</Col>
                                    <Col xs={6} lg={4} className="input_box">
                                        {productionData?.defaults[providerData.defaultRowIndex]?.height}
                                    </Col>
                                    <Col xs={6} lg={4} className="label">책등</Col>
                                    <Col xs={6} lg={4} className="input_box">
                                        {productionData?.defaults[providerData.defaultRowIndex]?.spine}
                                    </Col>
                                    <Col xs={6} lg={4} className="label">앞날개</Col>
                                    <Col xs={6} lg={4} className="input_box">
                                        {productionData?.defaults[providerData.defaultRowIndex]?.flap_front}
                                    </Col>
                                    <Col xs={6} lg={4} className="label">뒷날개</Col>
                                    <Col xs={6} lg={4} className="input_box">
                                        {productionData?.defaults[providerData.defaultRowIndex]?.flap_back}
                                    </Col>
                                </Row>
                                
                                <Row style={{border: 0}}>
                                    <Col xs={6} lg={4} className="label">종이 규격</Col>
                                    <Col xs={6} lg={4} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.paper_standard?.name}</Col>
                                    <Col xs={6} lg={4} className="label">본문 절수</Col>
                                    <Col xs={6} lg={4} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.paper_cutting}</Col>
                                    <Col xs={6} lg={4} className="label">면지 판걸이 수</Col>
                                    <Col xs={6} lg={4} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.paper_holder}</Col>
                                </Row>
                            </>
                        }
                    </Col>
                </Col>
            </Row>
        </div>
    )
}

export default inject('commonStore')(observer(BasicComp))