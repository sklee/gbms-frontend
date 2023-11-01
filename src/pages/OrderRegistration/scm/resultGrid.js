import React, { useState, useMemo } from 'react'
import { Row, Col, Table, Typography, Button } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import * as wjCore from '@grapecity/wijmo';
import * as wjcGrid from '@grapecity/wijmo.grid';
import * as wjGrid from '@grapecity/wijmo.grid';

import View from './view'

const Wrapper = styled.div`
    .wj-row .wj-cell:first-of-type{padding: 0 ;}
    .wj-colfooters .wj-row .wj-cell:first-of-type{padding: 8px 12px;}
    .wj-row .wj-cell:first-of-type button{width: 100%; padding: 8px 12px; text-align: left;}
`;


const resultGrid = observer(({ addTab }) => {
    const { Text } = Typography;

    const state = useLocalStore(() => ({
        detailsList: [
            {
                id: 1,
                branch: '점포',
                fedCondition: '위탁',
                volumeOrders: 700,
                cost: 7000000,
            },
            {
                id: 2,
                branch: '점포',
                fedCondition: '매절',
                volumeOrders: 100,
                cost: 1000000,
            },
            {
                id: 3,
                branch: '인터넷',
                fedCondition: '위탁',
                volumeOrders: 1000,
                cost: 10000000,
            },
            {
                id: 4,
                branch: '인터넷',
                fedCondition: '매절',
                volumeOrders: 0,
                cost: 0,
            },
        ],
    }));

    const mergedRowData ={
        branch: '인터넷',
        fedCondition: '매절',
        volumeOrders: 0,
        cost: 0,
    }

    const [drawerVisible, setDrawerVisible] = useState(false);
    const drawerOpen = () => { setDrawerVisible(true); };
    const drawerClose = () => { setDrawerVisible(false); };

    // 천단위 자동 콤마
    const commaNum = (num) => {
        if(num){
            const number = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return number
        }else{
            return 0;
        }      
    };

    const initGrid = (grid) => {
        grid.columnFooters.rows.push(new wjcGrid.GroupRow());

        grid.formatItem.addHandler(function (s, e) {
            const row = e.panel.rows[e.row];
            if (row instanceof wjcGrid.GroupRow) {
                if (e.col === 0) {
                    e.cell.style.borderRight = 'none';
                    e.cell.textContent = '합계';
                }
            }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;

                switch (col.binding) {
                    case 'branch':
                        e.cell.innerHTML = '<button id="btnDrawer" class="btnText">'+item.branch+'</button>';
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                // get button's data item
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];

                switch (e.target.id) {
                    case 'btnDrawer':
                        drawerOpen();
                        break;
                }
            }

        });
    };

    return (
        <Wrapper>
            <Row className="topTableInfo">
                <Col span={24} className="topTable_right">
                    <Button type='primary'>주문 등록</Button>
                    <Button style={{marginLeft: 10}}>초기화</Button>
                </Col>
            </Row>
            <Row className="gridWrap">
                <FlexGrid
                    itemsSource={state.detailsList} 
                    stickyHeaders={true}
                    initialized={(s) => initGrid(s)}
                    headersVisibility="Column"
                >
                    <FlexGridColumn binding="branch" header="지점" width="*" />
                    <FlexGridColumn binding="fedCondition" header="공급 조건" width="*"/>
                    <FlexGridColumn binding="volumeOrders" header="주문량" width="*" aggregate="Sum"/>
                    <FlexGridColumn binding="cost" header="공급 금액" width="*" aggregate="Sum" />
                </FlexGrid>
            </Row>
            <Row className='table_bot'>
                <div className='btn-group'>
                    <span>행 개수 : {state.detailsList.length}</span>
                </div>
            </Row>

            {drawerVisible && <View drawerVisible={drawerVisible} drawerClose={drawerClose}/> }
        </Wrapper>
    )
});


export default resultGrid;
