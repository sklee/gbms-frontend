import React, { useState } from 'react';
import {Button, Row, Col, DatePicker } from 'antd';
import { observer, useLocalStore } from 'mobx-react';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { CollectionView } from '@grapecity/wijmo';
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjCore from '@grapecity/wijmo';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";

import Excel from '@components/Common/Excel';
import AddDrawer from './add/drawer';
import ViewDrawer from './view/drawer';


const index = observer((props) => {

    const state = useLocalStore(() => ({
        type : 'simulations',
        list: [
            {   
                id: 0,
                company : '길벗',
                type: "본사 출고",
                movementDate:  '2023.11.02',
                release: '라임북(정품)',
                incoming: '본사',
                amount: '50',
                note: '예스대구 10월 이월 처리',
                registrant: '홍길동',
            },
        ],
        flex: null,
        gridFilter: null,
        dateItemName: [{id: 1, name: '적용일'}],
    }));

    React.useEffect(() => {
        theSearch.current.control.grid = theGrid.current.control;
    }, [])

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = [ "company", "type", "movementDate", "release", "incoming", "amount", "note", "registrant" ];
    };

    const initGrid = (grid) => {
        state.flex= grid;

        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
                let col = s.columns[e.col];
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + '<br/>' + html.split('\\n')[1] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;

                switch (col.binding) {
                    case 'release':
                    case 'incoming':
                        let name ='<button id="btnLink" class="btnLink title">' + item[col.binding] +'</button>';
                        e.cell.innerHTML ='<div class="incell">'+name +' ' +document.getElementById('tplBtnViewMode').innerHTML+'</div>';
                        e.cell['dataItem'] = item;
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            let item = wjCore.closest(e.target, '.wj-cell')?.['dataItem'];
            if (e.target instanceof HTMLButtonElement) {
                switch(e.target.id){
                    case 'btnLink':
                        viewDrawerOpen();
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

    return (
        <>
            <Row className="topTableInfo" >
                <Col span={20}>
                    <wjInput.ComboBox
                        itemsSource={new CollectionView(state.dateItemName, {
                            currentItem: null
                        })}
                        selectedValuePath="id"
                        displayMemberPath="name"
                        valueMemberPath="id"
                        placeholder="항목"
                        style={{width: 120}}
                    />
                    <DatePicker.RangePicker 
                        style={{ margin: '0 20px 0 5px'}}
                    />
                    <FlexGridSearch ref={theSearch} placeholder='검색' />
                </Col>
                <Col span={4} className="topTable_right">
                    <Button className="btn btn-primary btn_add" shape="circle" onClick={addDrawerOpen}>+</Button>
                </Col>
            </Row>

            <Row className='gridWrap'>
                <FlexGrid
                    ref={theGrid}
                    itemsSource={state.list} 
                    initialized={(s) => initGrid(s)}
                    headersVisibility="Column"
                    stickyHeaders={true} 
                    autoRowHeights={true}
                    isReadOnly={true}
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                    <FlexGridColumn header='회사' binding='company' width={70} />
                    <FlexGridColumn header='유형' binding='type' width={120} />
                    <FlexGridColumn header='이동일' binding='movementDate' width={100} />
                    <FlexGridColumn header='출고 창고' binding='release' width="*" minWidth={120} />
                    <FlexGridColumn header='입고 창고' binding='incoming' width="*" minWidth={120} />
                    <FlexGridColumn header='수량' binding='amount' width={70} align='right'/>
                    <FlexGridColumn header='비고' binding='note' width="*" minWidth={150} />
                    <FlexGridColumn header='등록자' binding='registrant' width={80} />
                </FlexGrid>
            </Row>

            <Row className='table_bot'>
                <Col xs={16} lg={16}>
                    <div className='btn-group'>
                        <span>행 개수 : {state.list.length}</span>
                    </div>
                </Col>
                <Excel />
            </Row>

            <div id="tplBtnViewMode">
                <div className="btnLayoutWrap">
                    <button
                        id="btnNew"
                        className="btn-layout ant-btn ant-btn-circle"
                    >
                        N
                    </button>
                </div>
            </div>

            {addDrawerVisible && <AddDrawer drawerVisible={addDrawerVisible} drawerClose={addDrawerClose} />}
            {viewDrawerVisible && <ViewDrawer drawerVisible={viewDrawerVisible} drawerClose={viewDrawerClose} />}
        </>
    )
})

export default index;