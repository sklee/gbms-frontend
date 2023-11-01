import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Button, Modal } from 'antd';
import { observer, useLocalStore } from 'mobx-react';

import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import * as wjCore from '@grapecity/wijmo';

import AddDrawer from './add/index';
import ViewDrawer from './view/index';

const ObjectGrid = ({ gridHeight }) => {
    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                company: '길벗',
                receivingLocationClass: '제작처',
                receivingLocation: '신정문화사',
                warehousingWarehouse: '라임북(정품)',
                receivingDate: '2023-02-01',
                processingDate: '2023-02-01',
                quantity: 3,
                type: '기타',
                note: ''
            },
            {
                id: 1,
                company: '길벗',
                receivingLocationClass: '제작처',
                receivingLocation: '신정문화사',
                warehousingWarehouse: '라임북(정품)',
                receivingDate: '2023-02-01',
                processingDate: '2023-02-01',
                quantity: 3,
                type: '기타',
                note: ''
            },
            {
                id: 1,
                company: '길벗',
                receivingLocationClass: '제작처',
                receivingLocation: '신정문화사',
                warehousingWarehouse: '라임북(정품)',
                receivingDate: '2023-02-01',
                processingDate: '2023-02-01',
                quantity: 3,
                type: '기타',
                note: ''
            },
        ],
        grid: null,
        selectRows: [],
    }));

    const initGrid = (grid) => {
        state.grid = grid;

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

                switch (col.binding) {
                    case 'receivingLocation':
                        let name = '<button type="button" id="btnLink" class="btnLink">'+item.receivingLocation+'</button>';
                        e.cell.innerHTML = name+' '+document.getElementById('tplBtnViewMode').innerHTML;
                        e.cell['dataItem'] = item;
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                switch(e.target.id){
                    case 'btnLink' :
                        viewDrawerOpen();
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

    const [addDrawerVisible, setAddDrawerVisble] = useState(false);
    const addDrawerOpen = () => setAddDrawerVisble(true);
    const addDrawerClose = () => setAddDrawerVisble(false);

    const [viewDrawerVisible, setViewDrawerVisble] = useState(false);
    const viewDrawerOpen = () => setViewDrawerVisble(true);
    const viewDrawerClose = () => setViewDrawerVisble(false);

    const theGrid = useRef();
    const theSearch = useRef();

    useEffect(()=>{
        let Grid = theGrid.current.control;
        let search = theSearch.current.control;
        search.grid = Grid;
    },[]);

    const showModal = () => {
        Modal.info({
            title: '반품 자료를 가지고 왔습니다.',
            onOk() {
                console.log('OK');
            }
        });
    };

    return (
        <>
            <Row className='table'>
                <Col className="label" span={24} style={{justifyContent: "space-between"}}>
                    <FlexGridSearch ref={theSearch} placeholder='검색'/>
                    <Button type='primary' shape="circle" onClick={addDrawerOpen}>+</Button>
                </Col>
                <Col span={24}>
                    <FlexGrid
                        ref={theGrid}
                        itemsSource={state.list}
                        initialized={(s) => initGrid(s)}
                        autoRowHeights={true}
                        isReadOnly={true}
                        headersVisibility="Column"
                        selectionMode="Row"
                        style={{ minHeight: `calc(100vh - ${gridHeight}px)`, maxHeight: `calc(100vh - ${gridHeight}px)` }}
                    >
                        <FlexGridColumn binding="company" header="회사" width={70} />
                        <FlexGridColumn binding="receivingLocationClass" header="입고처 구분" width={100} />
                        <FlexGridColumn binding="receivingLocation" header="입고처" width="*" minWidth={120} />
                        <FlexGridColumn binding="warehousingWarehouse" header="입고 창고" width={100} />
                        <FlexGridColumn binding="receivingDate" header="입고일" width={100} />
                        <FlexGridColumn binding="processingDate" header="처리일" width={100} />
                        <FlexGridColumn binding="quantity" header="수량" width={70} />
                        <FlexGridColumn binding="type" header="유형" width={70} />
                        <FlexGridColumn binding="note" header="비고" width={120} />
                    </FlexGrid>
                    <div id="tplBtnViewMode">
                        <div className="btnLayoutWrap">
                            <button id="btnNew" className="btn-layout ant-btn ant-btn-circle">N</button>
                        </div>
                    </div>
                </Col>
            </Row>
            {viewDrawerVisible && <ViewDrawer drawerVisible={viewDrawerVisible} drawerClose={viewDrawerClose} />}
            {addDrawerVisible && <AddDrawer drawerVisible={addDrawerVisible} drawerClose={addDrawerClose} />}
        </>
    );
}

export default ObjectGrid;