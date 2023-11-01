import React, { useState } from 'react'
import { Row, Col } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import * as wjCore from '@grapecity/wijmo';


const orderMgmt = observer(({ addTab }) => {
    const state = useLocalStore(() => ({
        list: [
            {
                row: '1',
                prdCode: 'GA01',
                prdName: '나는경매로1년만에인생을역전했다',
                isbn: '9791140703128',
                price: 20000,
                orderSize: 200,
                errorCont: '출고 중단',
            }
        ],
    }));

    const initGrid = (grid) => {
        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;

                switch (col.binding) {
                    case 'prdCode':
                        e.cell.innerHTML = '<div>[' + item.prdCode +']' + item.prdName + '</div>';
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                // get button's data item
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];

                switch (e.target.id) {
                    case 'btnNew':
                        break;
                }
            }

        });
    };

    return (
        <>
            <Row style={{marginBottom: 10}}>
                <Col><span style={{color: 'red'}}><ExclamationCircleOutlined /> 오류를 해결한 파일을 다시 등록하려면 새고 고침 하세요.</span></Col>
            </Row>

            <Row className="gridWrap">
                <FlexGrid
                    itemsSource={state.list} 
                    stickyHeaders={true}
                    initialized={(s) => initGrid(s)}
                    headersVisibility="Column"
                >
                    <FlexGridColumn binding="row" header="원본 행" width={80} align="center"/>
                    <FlexGridColumn binding="prdCode" header="[상품코드]상품명" width="*" minWidth={150} />
                    <FlexGridColumn binding="prdName" header="상품명(서점)" width="*" minWidth={150} />
                    <FlexGridColumn binding="isbn" header="ISBN(서점)" width={140} />
                    <FlexGridColumn binding="price" header="정가(서점)" width={110} align="right"/>
                    <FlexGridColumn binding="orderSize" header="발주량" width={90} align="right"/>
                    <FlexGridColumn binding="errorCont" header="오류 내용" width={100} />
                </FlexGrid>
            </Row>

            <Row className='table_bot'>
                <div className='btn-group'>
                    <span>행 개수 : {state.list.length}</span>
                </div>
            </Row>
        </>
    )
});


export default orderMgmt;
