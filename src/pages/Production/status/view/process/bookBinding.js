import React, { useState, useEffect } from 'react'
import { Row, Col, Button, Input, Checkbox, DatePicker, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons';

import { observer, useLocalStore } from 'mobx-react';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import * as wjCore from '@grapecity/wijmo';
import { CollectionView } from '@grapecity/wijmo';

import PrdBookBinding from './prdDrawer/bookBinding' // 제본 제작처(공정) 검색
import PrdBookBindingAdd from './prdDrawer/bookBindingAdd' // 제본 추가 작업 제작체(공정) 검색
import Vendor from './vendorDrawer/index'  // 납품처 검색
import { isEmpty, moneyComma } from '@components/Common/Js';
import { ViewContext } from '..';


const BookBinding = ({productionData}) => {
    const providerData  = React.useContext(ViewContext)
    const [selectedRow,      setSelectedRow      ] = React.useState({})
    const [selectedRowIndex, setSelectedRowIndex ] = React.useState(-1)
    const [selectedRowKeys,  setSelectedRowKeys  ] = React.useState([])
    // Table Select Options
    const columns = [{
        dataIndex : ["produce_process", "name"], 
        title     : '공정', 
        width     : 100, 
    }, {
        dataIndex : "quantity", 
        title     : '전체 합계', 
        width     : 100, 
        align     : 'right',
        render    : (text, record, index) => {
            var totalData = 0
            if (record?.binding_attacheds?.total_amount !== null && record?.binding_attacheds?.total_amount !== undefined ) {
                totalData += record?.binding_attacheds?.total_amount
            }
            if (record?.total_amount !== null && record?.total_amount !== undefined) {
                totalData += record?.total_amount
            }
            return (
                <>{moneyComma(totalData)}</>
            )
        }
    }, {
        dataIndex : "binding_attacheds", 
        title     : '제본 합계', 
        width     : 100,
        align     : 'right',
        render    : (text, record, index) => {
            var totalData = 0
            // totalData += 
            for( var i = 0; i < record?.binding_attacheds.length; i++) {
                totalData += record?.binding_attacheds[i]?.total_amount * 1
            }
            return (
                <>{(totalData !== null && totalData !== undefined) ? moneyComma(totalData) : 0}</>
            )
        }
    }, {
        dataIndex : "total_amount", 
        title     : '추가작업 합계', 
        width     : 100, 
        align     : 'right',
        render    : text => moneyComma(text)
    }, {
        dataIndex : ["produce_company", "name"], 
        title     : '제작처', 
        width     : 120, 
    }, {
        dataIndex : ["delivery_produce_company", "name"], 
        title     : '납품처', 
        width     : 100, 
    }, {
        dataIndex : "cost_attribution_date", 
        title     : '비용 귀속일', 
        width     : 100, 
    },]
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
        setSelectedRow(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].bindings.filter(row => row.id == selectedRowKeys[0])[0] ) 
    }, [selectedRowKeys])
    // selectedRow 에 따라 Index 저장
    React.useEffect(() => {
        setSelectedRowIndex(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.bindings.indexOf(selectedRow))
    }, [selectedRow])

    return(
        <Row>
            {/* 왼쪽 테이블 영역 */}
            <Col xs={8} lg={8}>
                <Table
                    rowKey      = { 'id' }
                    dataSource  = { providerData.detailRowIndex !== -1 ? productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.bindings : [] }
                    columns     = { columns }
                    size        = { 'middle' }
                    bordered    = { true }
                    style       = {{ padding: 0, flex: 1}}
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
                { (selectedRowIndex !== undefined && selectedRowIndex !== -1) ? 
                    <>
                        <Row style={{border: 0}}>
                            <Col xs={3} lg={3} className="label">제작처</Col>
                            <Col xs={9} lg={9} className="input_box">
                            {
                                !isEmpty(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.bindings[selectedRowIndex]?.produce_company) &&
                                <>{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.bindings[selectedRowIndex]?.produce_company?.name}</>
                            }
                            </Col>
                            <Col xs={3} lg={3} className="label">납품처</Col>
                            <Col xs={9} lg={9} className="input_box">
                            {
                                !isEmpty(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.bindings[selectedRowIndex]?.delivery_produce_company) &&
                                <>{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.bindings[selectedRowIndex]?.delivery_produce_company?.name}</>
                            }
                            </Col>
                        </Row>
                        <Row style={{border: 0, margin: '10px 0'}}>
                            <Col xs={3} lg={3} className="label">공정</Col>
                            <Col xs={9} lg={5} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.bindings[selectedRowIndex]?.produce_process?.name}</Col>
                            <Col xs={3} lg={3} className="label">쪽수 합계</Col>
                            <Col xs={9} lg={5} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.bindings[selectedRowIndex]?.page_number_sum}</Col>
                            <Col xs={3} lg={3} className="label">단가</Col>
                            <Col xs={9} lg={5} className="input_box">{moneyComma(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.bindings[selectedRowIndex]?.price)}</Col>
                            <Col xs={3} lg={3} className="label">공급가</Col>
                            <Col xs={9} lg={5} className="input_box">{moneyComma(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.bindings[selectedRowIndex]?.supply_price)}</Col>
                            <Col xs={3} lg={3} className="label">부가세</Col>
                            <Col xs={9} lg={5} className="input_box">{moneyComma(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.bindings[selectedRowIndex]?.vat)}</Col>
                            <Col xs={3} lg={3} className="label">합계</Col>
                            <Col xs={9} lg={5} className="input_box">{moneyComma(productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.bindings[selectedRowIndex]?.total_amount)}</Col>
                        </Row>

                        <Row style={{border: 0}}>
                            <Col xs={3} lg={3} className="label">제본<br />추가작업</Col>
                            <Col xs={9} lg={21} style={{padding: 0}}>
                                <ProcessGrid 
                                    productionData={productionData}
                                    selectedRowIndex={selectedRowIndex}
                                />
                            </Col>
                        </Row>

                        <Row style={{border: 0, margin: '10px 0'}}>
                            <Col xs={3} lg={3} className="label">전달 사항</Col>
                            <Col xs={9} lg={21} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.bindings[selectedRowIndex]?.memo}</Col>
                        </Row>

                        <Row style={{border: 0}}>
                            <Col xs={3} lg={3} className="label">비용 귀속일</Col>
                            <Col xs={9} lg={21} className="input_box">{productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.bindings[selectedRowIndex]?.cost_attribution_date}</Col>
                        </Row>
                    </> : <></>
                }
            </Col>
            {/* Drawer Side */}
        </Row>
    )
}

const ProcessGrid = ({productionData, selectedRowIndex}) =>{
    const providerData  = React.useContext(ViewContext)
    const columns = [{
        dataIndex : ["produce_process", "name"],
        title     : "제본 추가작업", 
        ellipsis  : true, 
        width     : 200, 
    }, {
        dataIndex : "qty", 
        title     : "수량", 
        align     : "right",
        width     : 80, 
        render    : text => moneyComma(text)
    }, {
        dataIndex : ["produce_process", "process_unit"], 
        title     : "단가 기준", 
        width     : 80,
    }, {
        dataIndex : "price", 
        title     : "단가", 
        align     : "right", 
        width     : 80, 
        render    : text => moneyComma(text)
    }, {
        dataIndex : "supply_price", 
        title     : "공급가", 
        align     : "right", 
        width     : 80, 
        render    : text => moneyComma(text)
    }, {
        dataIndex : "vat", 
        title     : "부가세", 
        align     : "right", 
        width     : 80, 
        render    : text => moneyComma(text)
    }, {
        dataIndex : "total_amount", 
        title     : "합계", 
        align     : "right", 
        width     : 80, 
        render    : text => moneyComma(text)
    }]

    if (1111 !== undefined) {
        return (
            <Table 
                rowKey      = { 'id' }
                dataSource  = { 
                    productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.bindings[selectedRowIndex]?.binding_attacheds !== undefined ? 
                    productionData?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.bindings[selectedRowIndex]?.binding_attacheds : [] 
                }
                bordered    = { true }
                columns     = { columns }
                size        = { 'middle' }
                style       = {{ padding: 0, flex: 1}}
                scroll      = {{ x : 800, y: 600}}
                pagination  = { false }
            />
        )
    }
    else {
        return <></>
    }
}


export default BookBinding