import React, { useState, useRef } from 'react'
import {Row, Col, DatePicker, Modal } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { Selector } from "@grapecity/wijmo.grid.selector";
import { CollectionView } from "@grapecity/wijmo";
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';

import styled from 'styled-components';

import Excel from '@components/Common/Excel';
import ViewDrawer from '@pages/Product/presentation/view'

const { confirm } = Modal;
const Wrapper = styled.div`
    width: 100%;
    #tplBtnViewMode {
        display: none;
    }
`;

const index = observer(( props ) => {

    const state = useLocalStore(() => ({
        list: [
            {
                id: 3,
                requestDate: '2023.08.03',
                completionDate: '2023.08.03',
                offerer: '홈페이지',
                company: '길벗스쿨',
                prdCode: 'GA02',
                prdName: '이상한 과자가게 전천당 1권',
                classifyUse: '포인트 구매',
                amountApplication: 5,
                inventory: 200,
                location: '본사',
                errorContent: '출시 상태',
                presentationCode: '2',
            },
            {
                id: 2,
                requestDate: '2023.08.02',
                completionDate: '2023.08.04',
                offerer: '홍길동2',
                company: '도서출판 길벗',
                prdCode: 'GA01',
                prdName: '경제학 무작정 따라하기(개정판)',
                classifyUse: '서점 증정',
                amountApplication: 10,
                inventory: 150,
                location: '본사',
                errorContent: '출고 상태',
                presentationCode: '1',
            },
            {
                id: 1,
                requestDate: '2023.08.02',
                completionDate: '2023.08.04',
                offerer: '홍길동2',
                company: '도서출판 길벗',
                prdCode: 'GA01',
                prdName: '믹스(Mix)',
                classifyUse: '홍보',
                amountApplication: 5,
                inventory: 10,
                location: '택배',
                errorContent: '',
                presentationCode: '1',
            },
        ],
        grid: null,
        dateItemName: [{id: 1, name: '적용일'}],
    }));

    const [selectorState, setSelectorState] = useState({
        view: new CollectionView(state.list),
        selectedItems: []
    });

    React.useEffect(() => {
        theSearch.current.control.grid = flexGridRef.current.control;
    }, [])

    const theSearch = useRef();
    const flexGridRef = useRef(null);
    const flexGrid = flexGridRef.current;
    const mergeManager = new wjGrid.MergeManager(flexGrid);
    
    mergeManager.getMergedRange = (p, r, c) => {
        let rng = new wjGrid.CellRange(r, c);
        let prevCol = c > 0 ? c - 1 : c;
        let val = p.getCellData(r, c, false);
        let prevVal = p.getCellData(r, prevCol);

        let presentationCode = null
        if(p.rows[r]._data!=null){
            presentationCode = p.rows[r]._data.presentationCode;
        }

        // expand up
        while (rng.row > 0 && rng.col < 4 &&
            p.getCellData(rng.row - 1, c, false) == val &&
            p.getCellData(rng.row - 1, prevCol, false) == prevVal &&
            p.rows[rng.row - 1]._data.presentationCode == presentationCode) {
            rng.row--;
        }

        // expand down
        while (rng.row2 < p.rows.length - 1 && rng.col < 4 &&
            p.getCellData(rng.row2 + 1, c, false) == val &&
            p.getCellData(rng.row2 + 1, prevCol, false) == prevVal &&
            p.rows[rng.row2 + 1]._data.presentationCode == presentationCode) {
            rng.row2++;
        }

        // don't bother with single-cell ranges
        if (rng.isSingleCell) {
            rng = null;
        }

        // done
        return rng;
    };
    
    const initGrid = (grid) => {
        state.grid = grid;

        state.selector = new Selector(grid, {
            itemChecked: (s, e) => {
                setSelectorState({
                    selectedItems: grid.rows.filter(r => r.isSelected)
                });
            }
        });

        grid.formatItem.addHandler(function (s, e) {
            if(e.panel._ct == 4){
                e.cell.innerHTML = '<div class="v-center">선택</div>';
            }

            // if(e.panel == s.rowHeaders){
            //     e.cell.innerHTML = '';
            //     e.cell.innerHTML = s.rows[e.row].dataItem.ordnum?s.rows[e.row].dataItem.ordnum:'';
            //     e.cell['dataItem'] = s.rows[e.row].dataItem;
            //     console.log(s.rows[e.row]);    
            // }

            if (e.panel == s.cells) {
                let col = s.columns[e.col];
                let item = s.rows[e.row].dataItem;

                switch (col.binding) {
                    case 'prdName':
                        let name ='<button id="btnLink" class="btnLink title">' + item.prdName +'</button>';
                        e.cell.innerHTML ='<div class="incell">'+name +' ' +document.getElementById('tplBtnViewMode').innerHTML+'</div>';
                        e.cell['dataItem'] = item;
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];

                switch(e.target.id){
                    case 'btnLink':
                        viewDrawerOpen();
                        break;
                }
            }
        });
    };

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["requestDate", "completionDate", "offerer", "company", "prdCode", "prdName", "classifyUse", "amountApplication", "inventory", "location", "errorContent"];
    };

    
    const orderRegist = () => {
        Modal.info({
            content: '주문이 등록되었습니다.',
            onOk() {},
        });
    };

    const presentationCancel = () => {
        confirm({
            content: '선택한 건을 신청 취소하면 이전 상태로 되돌릴 수 없습니다. 계속하시겠습니까?',
            onOk() {},
            onCancel() {},
        });
    };

    const [viewDrawer, setViewDrawer] = useState(false);
    const viewDrawerOpen = () => { setViewDrawer(true); };
    const viewDrawerClose = () => { setViewDrawer(false); };

    return (
        <Wrapper>
            {/* { selectorState.selectedItems.length >= 1 && 
                <Row className="topTableInfo" justify="space-around">
                    <Col span={24} className="topTable_right">
                        <Button 
                            type='primary' 
                            style={{marginRight: 10}}
                            onClick={orderRegist}
                        >주문 등록</Button>
                        <Button
                            type='primary'
                            onClick={presentationCancel}
                        >주문 취소</Button>
                    </Col>
                </Row>
            } */}
            <Row className="topTableInfo">
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
            </Row>
            <Row className="gridWrap">
                <FlexGrid
                    ref={flexGridRef}
                    itemsSource={state.list} 
                    stickyHeaders={true} 
                    initialized={(s) => initGrid(s)}
                    isReadOnly={true}
                    mergeManager={mergeManager}
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)}/>
                    <FlexGridColumn binding="requestDate" header="신청일" width={100} />
                    <FlexGridColumn binding="completionDate" header="결재 완료일" width={100} />
                    <FlexGridColumn binding="offerer" header="신청자" width={80} />
                    <FlexGridColumn binding="company" header="회사" width={80} />
                    <FlexGridColumn binding="prdCode" header="상품코드" width={100} />
                    <FlexGridColumn binding="prdName" header="상품명" width="*" minWidth={120} />
                    <FlexGridColumn binding="classifyUse" header="용도 분류" width={100} />
                    <FlexGridColumn binding="amountApplication" header="신청 수량" width={90} />
                    <FlexGridColumn binding="inventory" header="가용재고" width={90} />
                    <FlexGridColumn binding="location" header="입고처" width={80} />
                    <FlexGridColumn binding="errorContent" header="오류 내용" width={90} />
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

            {viewDrawer && <ViewDrawer drawerVisible={viewDrawer} drawerClose={viewDrawerClose}/>}
        </Wrapper>
        
    )
})



export default index;
