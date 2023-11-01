import React, { useCallback, useEffect, useState } from 'react'
import {Row, Col, DatePicker } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { CollectionView } from '@grapecity/wijmo';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';
import useStore from '@stores/useStore';

import styled from 'styled-components';

import Excel from '@components/Common/Excel';
import ViewDrawer from './view';

const Wrapper = styled.div`
    width: 100%;
    #tplBtnViewMode {
        display: none;
    }
`;

const index = observer(( props ) => {
    const { commonStore } = useStore();

    const state = useLocalStore(() => ({
        list: [
            {
                id: 3,
                application_date: '2023.08.03',
                max_approval_at: '2023.08.05',
                ship_date: '2023.08.03',
                applicant_name: '홍길동',
                company_name: '스쿨',
                details : {
                    detail_info: '서점 증정',
                    product_department_name: '어린이교양2팀',
                    product_code: 'GA02',
                    product_name: '이상한 과자가게 전천당 1권',
                    qty: 5,
                },
                present_type_name: '본사',
            },
            {
                id: 2,
                application_date: '2023.08.02',
                max_approval_at: '2023.08.04',
                ship_date: '2023.08.03',
                applicant_name: '홍길동2',
                company_name: '길벗',
                details : {
                    detail_info: '서점 증정',
                    product_department_name: '경제경영1팀',
                    product_code: 'GA01',
                    product_name: '경제학 무작정 따라하기(개정판)',
                    qty: 10,
                },
                present_type_name: '본사',
            },
            {
                id: 1,
                application_date: '2023.08.02',
                max_approval_at: '2023.08.04',
                ship_date: '2023.08.03',
                applicant_name: '홍길동2',
                company_name: '길벗',
                details : {
                    detail_info: '홍보',
                    product_department_name: '경제경영1팀',
                    product_code: 'GA01',
                    product_name: '경제학 무작정 따라하기(개정판)',
                    qty: 5,
                },
                present_type_name: '택배',
            },
        ],
        grid: null,
        selectedRowProcessing : {},

        //pagination
        total: 0,
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },
        dateItemName: [{id: 1, name: '신청일'}],
    }));

    useEffect(()=>{
        fetchData()
        theSearch.current.control.grid = theGrid.current.control;
    },[])

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    const fetchData = useCallback(async (val) => {        
        if (val == '' || val == '0' || val == undefined) {
            var page = 1;
        } else {
            var page = val;
        }

        const result = await commonStore.handleApi({
            url: '/product-presentations-status',
            data:{
                display:state.pageArr.pageCnt,
                page:page,
                sort_by:'date',
                order:'desc'
            }
        });
        var res_result = []
        result.data.map(item=>{
            const {details, ...rest} = item
            if(Array.isArray(details) && details.length === 0){
                res_result =  [...res_result,item]
            }else{
                var temp = {}
                details.map(e=>{
                    temp = {...rest,details:e}
                    res_result =  [...res_result,temp]
                })
            }
        })
        state.list = res_result
    }, [])

    class CustomMergeManager extends wjGrid.MergeManager {
        getMergedRange(p, r, c) {
            let rng = null;

            rng = new wjGrid.CellRange(r, c);
            let prevCol = c > 0 ? c - 1 : c;
    
            let val = p.getCellData(r, c, false);
            let prevVal = p.getCellData(r, prevCol);
            
            let id = null
            if(p.rows[r]._data!=null){
                id = p.rows[r]._data.id;
            }
    
            // expand up
            while (rng.row > 0 && 
                (rng.col == 0 || rng.col == 1 || rng.col == 3 || rng.col == 4) &&
                p.getCellData(rng.row - 1, c, false) == val &&
                // p.getCellData(rng.row - 1, prevCol, false) == prevVal &&
                p.rows[rng.row - 1]._data.id == id) {
                rng.row--;
            }
    
            // expand down
            while (rng.row2 < p.rows.length - 1 && 
                (rng.col == 0 || rng.col == 1 || rng.col == 3 || rng.col == 4) &&
                p.getCellData(rng.row2 + 1, c, false) == val &&
                // p.getCellData(rng.row2 + 1, prevCol, false) == prevVal &&
                p.rows[rng.row2 + 1]._data.id == id) {
                rng.row2++;
            }
    
            // don't bother with single-cell ranges
            if (rng.isSingleCell) {
                rng = null;
            }
    
            // done
            return rng;
        }
    }
    
    const initGrid = (grid) => {
        grid.mergeManager = new CustomMergeManager;
        state.grid = grid

        grid.formatItem.addHandler(function (s, e) {
            let item = s.rows[e.row].dataItem;
            if (e.panel == s.cells) {
                let col = s.columns[e.col];
                switch (col.binding) {
                    case 'details.product_name':
                        let name ='<button id="btnLink" class="btnLink title">' + item.details.product_name +'</button>';
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
                        viewDrawerOpen(item);
                        break;
                }
            }
        });
    };

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["application_date", "max_approval_at", "ship_date", "applicant_name", "company_name", "details.detail_info", "details.product_department_name", "details.product_code", "details.product_name", "details.qty", "present_type_name"];
    };

    const [viewDrawer, setViewDrawer] = useState(false);
    const viewDrawerOpen = (processing)=>{
        state.selectedRowProcessing = processing;
        setViewDrawer(true); 
    };
    const viewDrawerClose = (type)=>{ setViewDrawer(false); };

    return (
        <Wrapper>
            <Row className="topTableInfo">
                <Col span={24}>
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
            </Row>
            <Row className="gridWrap">
                <FlexGrid
                    ref={theGrid}
                    itemsSource={state.list} 
                    stickyHeaders={true} 
                    initialized={(s) => initGrid(s)}
                    headersVisibility="Column"
                    isReadOnly={true}
                    selectionMode="None"
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)}/>
                    <FlexGridColumn binding="application_date" header="신청일" width={100} />
                    <FlexGridColumn binding="max_approval_at" header="결재 완료일" width={100} />
                    <FlexGridColumn binding="ship_date" header="출고일" width={100} />
                    <FlexGridColumn binding="applicant_name" header="신청자" width={80} />
                    <FlexGridColumn binding="company_name" header="회사" width={70} />
                    <FlexGridColumn binding="details.detail_info" header="용도 분류" width={100} />
                    <FlexGridColumn binding="details.product_department_name" header="상품 귀속부서" width={120} />
                    <FlexGridColumn binding="details.product_code" header="상품코드" width={100} />
                    <FlexGridColumn binding="details.product_name" header="상품명" width="*" minWidth={120} />
                    <FlexGridColumn binding="details.qty" header="수량" width={80} />
                    <FlexGridColumn binding="present_type_name" header="입고처" width={70} />
                </FlexGrid>     
            </Row>
            <Row gutter={10} className="table table_bot">
                <Col xs={24} lg={16}>
                    <span>행 개수 : {state.list.length}</span>
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

            {viewDrawer && ( 
                <ViewDrawer 
                    drawerVisible={viewDrawer} 
                    drawerClose={viewDrawerClose} 
                    processingState={state.selectedRowProcessing}
                    openPosition="status"
                    drawerChk="Y" 
                />
            )}
        </Wrapper>
        
    )
})



export default index;
