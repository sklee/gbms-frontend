import React, { useState } from 'react'
import { Row, Col, Button, Space, Modal } from 'antd'

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { observer, useLocalStore } from 'mobx-react';

const previewOrder = observer((props) => {
    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                prdCode: 'BO1A2B',
                process: '초록박스 특대(480*315*230)',
                prdComp: '일진포장',
                vendor: '라임북(창고)',
                orderQuantity: 800,
                message: '',
            }
        ],
        drawerback : 'drawerWrap', //drawer class name
    }));

    const initGrid = (grid) => {

        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                // create buttons for items not being edited
                switch (col.binding) {
                    case 'purchaseOrder':
                        e.cell.innerHTML = '<button id="btnView" class="btnText blueTxt">보기</button>'
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                switch (e.target.id) {
                }
            }
        });
    };
    return (
        <>
            <Row gutter={10} className="table">
                <Col xs={14} lg={14} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <h3>(주)도서출판 길벗 - 제작 발주서</h3>
                </Col>
                <Col xs={10} lg={10} style={{display: 'flex', flexWrap: 'wrap', border: 0}} className='innerCol'>
                    <div className="ant-col label ant-col-xs-24 ant-col-lg-6">제작 담당</div>
                    <div className="ant-col ant-col-xs-24 ant-col-lg-18">손일순 / 02-330-9761 / 010-2657-8160</div>
                    <div className="ant-col label ant-col-xs-24 ant-col-lg-6">발주일</div>
                    <div className="ant-col ant-col-xs-24 ant-col-lg-6">2023.05.13</div>
                    <div className="ant-col label ant-col-xs-24 ant-col-lg-6">창고 입고 요청일</div>
                    <div className="ant-col ant-col-xs-24 ant-col-lg-6">2023.05.25</div>
                </Col>
            </Row>

            <div style={{margin: '20px 0'}}>
                <Row gutter={10} className="table marginTop">
                    <div className="table_title"><h4>발주 내용</h4></div>
                    <Col xs={24} lg={24} className='innerCol'>
                        <Row id="gridWrap" className="gridWrap">
                            <FlexGrid
                                itemsSource={state.list}
                                initialized={(s) => initGrid(s)}
                                autoRowHeights={true}
                                allowSorting={false}
                                selectionMode="None"
                                headersVisibility="Column" 
                            >
                                <FlexGridColumn header="상품코드" binding="prdCode" width={120} />
                                <FlexGridColumn header="공정" binding="process" width='*' minWidth={150} />
                                <FlexGridColumn header="제작처" binding="prdComp" width={120} />
                                <FlexGridColumn header="납품처" binding="vendor" width={120} />
                                <FlexGridColumn header="발주 수량" binding="orderQuantity" width={100} align="right"/>
                                <FlexGridColumn header="전달 사항" binding="message" width={200} />
                            </FlexGrid>
                        </Row>
                    </Col>
                </Row>
            </div>

            <Row gutter={10} className="table marginTop">
                <div className="table_title">
                    <h4>주의/요청사항</h4>
                </div>
                <Col xs={24} lg={24}>
                    1. 작업 후 샘플 1부 보내주세요.
                </Col>
            </Row>
            <Row gutter={10} justify="center" style={{margin: '20px 0'}}>
                <Button htmlType="button">엑셀 다운로드</Button>
            </Row>
        </>
        
      );
})

export default previewOrder;