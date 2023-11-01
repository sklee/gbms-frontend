import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Button, Modal } from 'antd';
import { observer, useLocalStore } from 'mobx-react';

import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import * as wjcGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';


const ObjectGrid = ({ gridHeight, seletedRowTypeHandler }) => {
    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                account: '신정문화사',
                process: '제본',
                supplyPrice: 10000000,
                vat: 1000000,
                amount: 11000000,
            }, {
                id: 2,
                account: '신정문화사',
                process: '포장',
                supplyPrice: 2000000,
                vat: 200000,
                amount: 2200000,
            },
        ],
        grid: null,
        selectRows: [],
    }));

    const initGrid = (grid) => {
        state.grid = grid;

        grid.columnFooters.rows.push(new wjcGrid.GroupRow());

        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
                let col = s.columns[e.col];
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + "<br/>" + html.split('\\n')[1] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;

            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                switch(e.target.id){
                    case 'btnLink' :
                        break;
                }
            }
            if(e.target instanceof HTMLInputElement) {
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                switch(e.target.id){
                    case 'iptSelect':
                        break;
                }
            }
        });

    };

    const theGrid = useRef();
    const theSearch = useRef();

    useEffect(()=>{
        let Grid = theGrid.current.control;
        let search = theSearch.current.control;
        search.grid = Grid;
    },[]);

    return (
        <Row className='table'>
            <Col className="label" span={24} style={{justifyContent: "space-between"}}>
                <FlexGridSearch ref={theSearch} placeholder='검색'/>
            </Col>
            <Col span={24}>
                <FlexGrid
                    ref={theGrid}
                    itemsSource={state.list}
                    initialized={(s) => initGrid(s)}
                    headersVisibility="Column"
                    isReadOnly={true}
                    selectionMode="Row"
                    autoRowHeights={true}
                    selectionChanged={(grid)=> seletedRowTypeHandler(grid.selectedItems)}
                    loadedRows={(grid)=> seletedRowTypeHandler(grid.selectedItems)}
                    style={{ minHeight: `calc(100vh - ${gridHeight}px)`, maxHeight: `calc(100vh - ${gridHeight}px)` }}
                >
                    <FlexGridColumn binding="account" header="제작처" width="*" minWidth={120} />
                    <FlexGridColumn binding="process" header="공정" width={80} />
                    <FlexGridColumn binding="supplyPrice" header="공급가" width={100} aggregate="Sum"/>
                    <FlexGridColumn binding="vat" header="부가세" width={100} aggregate="Sum"/>
                    <FlexGridColumn binding="amount" header="합계" width={100} aggregate="Sum"/>
                </FlexGrid>
            </Col>
        </Row>
    );
}

export default ObjectGrid;