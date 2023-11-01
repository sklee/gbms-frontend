import React, { useState } from 'react'
import {Row, Col, DatePicker } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { CollectionView } from '@grapecity/wijmo';
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import * as wjCore from '@grapecity/wijmo';

import styled from 'styled-components';

import Excel from '@components/Common/Excel';
import ViewDrawer from '@pages/Product/presentation/view'

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
                id: 1,
                requestDate: '2023.08.03',
                completionDate: '2023.08.03',
                offerer: '홈페이지',
                company: '길벗스쿨',
                classifyUse: '포인트 구매',
                prdCode: 'GA02',
                prdName: '이상한 과자가게 전천당 1권',
                amountApplication: 5,
                location: '본사',
                processingStatus: '주문 등록',
                workday: '2023.08.03',
                worker: '김명자',
            },
        ],
        grid: null,
        dateItemName: [{id: 1, name: '적용일'}],
    }));

    React.useEffect(() => {
        theSearch.current.control.grid = theGrid.current.control;
    }, [])

    const theGrid = React.useRef();
    const theSearch = React.useRef();
    
    const initGrid = (grid) => {
        state.grid = grid;

        grid.formatItem.addHandler(function (s, e) {
            if(e.panel._ct == 4){
                e.cell.innerHTML = '<div class="v-center">선택</div>';
            }

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
        filter.filterColumns = ["requestDate", "completionDate", "offerer", "company", "classifyUse", "prdCode", "prdName", "amountApplication", "location", "processingStatus", "workday", "worker", ];
    };

    const [viewDrawer, setViewDrawer] = useState(false);
    const viewDrawerOpen = () => { setViewDrawer(true); };
    const viewDrawerClose = () => { setViewDrawer(false); };

    return (
        <Wrapper>
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
                    ref={theGrid}
                    itemsSource={state.list} 
                    stickyHeaders={true} 
                    initialized={(s) => initGrid(s)}
                    headersVisibility="Column"
                    isReadOnly={true}
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)}/>
                    <FlexGridColumn binding="requestDate" header="신청일" width={100} />
                    <FlexGridColumn binding="completionDate" header="결재 완료일" width={100} />
                    <FlexGridColumn binding="offerer" header="신청자" width={80} />
                    <FlexGridColumn binding="company" header="회사" width={80} />
                    <FlexGridColumn binding="classifyUse" header="용도 분류" width={100} />
                    <FlexGridColumn binding="prdCode" header="상품코드" width={100} />
                    <FlexGridColumn binding="prdName" header="상품명" width="*" minWidth={150} />
                    <FlexGridColumn binding="amountApplication" header="수량" width={80} />
                    <FlexGridColumn binding="location" header="입고처" width={80} />
                    <FlexGridColumn binding="processingStatus" header="처리 상태" width={100} />
                    <FlexGridColumn binding="workday" header="작업일" width={100} />                    
                    <FlexGridColumn binding="worker" header="작업자" width={80} />
                </FlexGrid>     
            </Row>

            <Row className='table_bot'>
                <Col xs={16} lg={16}>
                    <div className='btn-group'>
                        <span >행 개수 : {state.list.length}</span>
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
