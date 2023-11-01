import React, { useState } from 'react';
import {Button, Row, Col} from 'antd';
import { observer, useLocalStore } from 'mobx-react';

import { FlexGrid, FlexGridColumn, FlexGridColumnGroup, FlexGridCellTemplate } from '@grapecity/wijmo.react.grid';
import { Selector } from "@grapecity/wijmo.grid.selector";
import { CollectionView } from "@grapecity/wijmo";
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';

import AddGrid from './addGrid';


const searchGrid = observer(({ addGridVisible, addGridShow, drawerClose}) => {

    const state = useLocalStore(() => ({
        list: [
            {   
                id: 0,
                department : '어린이교양2팀',
                prdCode : 'GB1234',
                prdName:  '전천당 1권',
                launch:  '출시/출간',
                release: "가능",
                quantity: 2800,
                remainingDays: 15.1,
                amount: 2000,
                fairQuality: 1500,
                recycle: 300,
                cover: 120,
            },
        ],
        idx: 0,
        selector:'',
        flex: null,
    }));

    const [selectorState, setSelectorState] = useState({
        view: new CollectionView(state.list),
        selectedItems: []
    });

    const initGrid = (grid) => {
        state.flex= grid;

        state.selector = new Selector(grid, {
            itemChecked: (s, e) => {
                setSelectorState({
                    selectedItems: grid.rows.filter(r => r.isSelected)
                });
            }
        });

        state.selector._col.allowMerging = true;
        state.selector._col._cssClassAll = "chkAll";

        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.columnHeaders) {
                let html = e.cell.innerHTML;
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + ' ' + html.split('\\n')[1] + "<br/>" + html.split('\\n')[2] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;

                switch (col.binding) {
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            let item = wjCore.closest(e.target, '.wj-cell')?.['dataItem'];
            if (e.target instanceof HTMLButtonElement) {
                switch(e.target.id){

                }
            }
        });
    }

    return (
        <>
            {addGridVisible ? (
                <AddGrid drawerClose={drawerClose}/>
            ) : (
                <>
                    {selectorState.selectedItems.length >= 1 ? (
                        <Row className="topTableInfo" >
                            <Col span={24} className="topTable_right">
                                <Button type='primary' style={{marginRight: 10}} onClick={addGridShow}>선택 추가</Button>
                            </Col>
                        </Row>
                    ): ''}
                    <Row className='gridWrap'>
                        <FlexGrid
                            itemsSource={state.list} 
                            initialized={(s) => initGrid(s)}
                            autoRowHeights={true}
                            allowMerging="ColumnHeaders"
                        >
                            <FlexGridColumnGroup header='부서' binding='department' width={120}/>
                            <FlexGridColumnGroup header='상품코드' binding='prdCode' width={100}/>
                            <FlexGridColumnGroup header='상품명(내부)' binding='prdName' width="*" minWidth={150} />
                            <FlexGridColumnGroup header='상태' align='center'>
                                <FlexGridColumnGroup header='출시' binding='launch' width={90} />
                                <FlexGridColumnGroup header='출고' binding='release' width={70} />
                            </FlexGridColumnGroup>
                            <FlexGridColumnGroup header='정품 재고' align='center'>
                                <FlexGridColumnGroup header='수량' binding='quantity' width={70} align='right'/>
                                <FlexGridColumnGroup header='잔여일' binding='remainingDays' width={80} align='right'/> 
                            </FlexGridColumnGroup>
                            <FlexGridColumnGroup header='반품 재고' align='center'>
                                <FlexGridCellTemplate cellType="ColumnHeader" template={() => {
                                    return (<>
                                        <span>반품 재고</span> 
                                        <button className='ant-btn' style={{marginLeft: 10}}>검색</button>
                                    </>);
                                }} />
                                <FlexGridColumnGroup header='합계' binding='amount' width={80} align='right'/>
                                <FlexGridColumnGroup header='정품대기' binding='fairQuality' width={80} align='right'/>
                                <FlexGridColumnGroup header='재생대기' binding='recycle' width={80} align='right'/>  
                                <FlexGridColumnGroup header='표지대기' binding='cover' width={80} align='right'/>
                            </FlexGridColumnGroup>
                        </FlexGrid>
                    </Row>

                    <Row className='table_bot'>
                        <div className='btn-group'>
                            <span>행 개수 : {state.list.length}</span>
                        </div>
                    </Row>
                </>
            )}
        </>
    )
})

export default searchGrid;