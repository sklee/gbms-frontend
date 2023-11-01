import React, { useState } from 'react'
import { Row, Col, Button, Input, Checkbox, DatePicker, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons';

import { observer, useLocalStore } from 'mobx-react';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import * as wjcCore from '@grapecity/wijmo';
import * as wjGrid from "@grapecity/wijmo.grid";

import PrdInsert from './prdDrawer/insert' // 부속제작 제작처(공정) 검색
import Vendor from './vendorDrawer/index'  // 납품처 검색
import { isEmpty, moneyComma } from '@components/Common/Js';
import { ViewContext } from '..';

const { TextArea } = Input;

const Insert = ({productionData}) => {
    const providerData  = React.useContext(ViewContext)
    const [selectedRow,      setSelectedRow      ] = React.useState({})
    const [selectedRowIndex, setSelectedRowIndex ] = React.useState(-1)
    const [selectedRowKeys,  setSelectedRowKeys  ] = React.useState([])
    // Table Select Options
    const columns = [{
        dataIndex : ["produce_process", "name"], 
        title : '공정', 
        width : 150, 
    }, {
        dataIndex : "production_qty", 
        title : '작업 수량', 
        width : 100, 
        align : "right"
    }, {
        dataIndex : "price", 
        title : '단가', 
        width : 120,  
        align : "right", 
        render: text => moneyComma(text)
    }, {
        dataIndex : "total_amount", 
        title : '합계', 
        width : 120, 
        align : "right", 
        render: text => moneyComma(text)
    }, {
        dataIndex : ["produce_company", "name"], 
        title : '제작처', 
        width : 120, 
    }, {
        dataIndex : ["delivery_produce_company", "name"], 
        title : '납품처', 
        minWidth : 120
    }, {
        dataIndex : "cost_attribution_date", 
        title : '비용 귀속일', 
        width : 120, 
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
                    dataSource  = { providerData.detailRowIndex !== -1 ? productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.accessories : [] }
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
            <Col xs={16} lg={16} style={{backgroundColor: '#ddd'}}>
                {(selectedRowIndex !== undefined && selectedRowIndex !== -1) ? 
                    <>
                        <Row style={{border: 0}}>
                            <Col xs={3} lg={3} className="label">제작처</Col>
                            <Col xs={9} lg={9} className="input_box">
                            {   
                                !isEmpty(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.accessories[selectedRowIndex]?.produce_company) &&
                                <>{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.accessories[selectedRowIndex]?.produce_company?.name}</>
                            }
                            </Col>
                            <Col xs={3} lg={3} className="label">납품처</Col>
                            <Col xs={9} lg={9} className="input_box">
                            {
                                !isEmpty(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.accessories[selectedRowIndex]?.delivery_produce_company) &&
                                <>{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.accessories[selectedRowIndex]?.delivery_produce_company?.name}</>
                            }
                            </Col>
                        </Row>
                        <Row style={{border: 0, marginTop: 10}}>
                            <Col xs={3} lg={3} className="label">공정</Col>
                            <Col xs={21} lg={21} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.accessories[selectedRowIndex]?.produce_process?.name}</Col>
                        </Row>
                        <Row style={{border: 0}}>
                            <Col xs={6} lg={3} className="label">단가 기준</Col>
                            <Col xs={6} lg={3} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.accessories[selectedRowIndex]?.produce_process?.process_unit}</Col>
                            <Col xs={6} lg={3} className="label">필요 수량</Col>
                            <Col xs={6} lg={3} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.accessories[selectedRowIndex].need_qty}</Col>
                            <Col xs={6} lg={3} className="label">여분</Col>
                            <Col xs={6} lg={3} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.accessories[selectedRowIndex]?.spare}</Col>
                            <Col xs={6} lg={3} className="label">제작 수량</Col>
                            <Col xs={6} lg={3} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.accessories[selectedRowIndex]?.production_qty}</Col>
                            <Col xs={3} lg={3} className="label">단가</Col>
                            <Col xs={9} lg={3} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.accessories[selectedRowIndex]?.price}</Col>
                            <Col xs={3} lg={3} className="label">공급가</Col>
                            <Col xs={9} lg={3} className="input_box">{moneyComma(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.accessories[selectedRowIndex]?.supply_price)}</Col>
                            <Col xs={3} lg={3} className="label">부가세</Col>
                            <Col xs={9} lg={3} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.accessories[selectedRowIndex]?.vat}</Col>
                            <Col xs={3} lg={3} className="label">합계</Col>
                            <Col xs={9} lg={3} className="input_box">{moneyComma(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.accessories[selectedRowIndex]?.total_amount)}</Col>
                        </Row>

                        <Row style={{border: 0, margin: '10px 0'}}>
                            <Col xs={3} lg={3} className="label">전달 사항</Col>
                            <Col xs={9} lg={21} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.accessories[selectedRowIndex]?.memo}</Col>
                        </Row>
                        <Row style={{border: 0}}>
                            <Col xs={3} lg={3} className="label">비용 귀속일</Col>
                            <Col xs={9} lg={3} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.accessories[selectedRowIndex]?.cost_attribution_date}</Col>
                        </Row>
                    </> : <></>
                }
            </Col>
        </Row>
    )
}

export default Insert