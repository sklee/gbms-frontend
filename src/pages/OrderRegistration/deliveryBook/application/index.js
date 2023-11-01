import React, { useState, useRef, useEffect, useCallback } from 'react'
import {Row, Col, Button, Modal, DatePicker } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { CollectionView } from '@grapecity/wijmo';
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import * as wjCore from '@grapecity/wijmo';
import useStore from '@stores/useStore';

import styled from 'styled-components';

import Excel from '@components/Common/Excel';
import AddDrawer from './add';
import ViewDrawer from './view';
import { toJS } from 'mobx';

const Wrapper = styled.div`
    width: 100%;
    #tplBtnViewMode {
        display: none;
    }
`;

const Index = ( props ) => {
    const { commonStore } = useStore();
    const [viewDrawer, setViewDrawer] = useState(false);
    const [addDrawer, setaddDrawer] = useState(false);
    const [editPermission, setEditPermission] = useState(true);
    const [editConfirm, setEditConfirm] = useState(true);

    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                application_date: '2023.08.11',
                applicant_name: '홍길동',
                company_name: '도서출판 길벗',
                product_name: '믹스',
                total_shipping_qty: 800,
                request_date: '2023.08.15',
                order_date: '',
                status_name: '배본 신청',
            },
        ],
        selectorId :null,
        grid: null,
        selectRows: [],

        //pagination
        total: 0,
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },
        dateItemName: [{id: 1, name: '적용일'}],
    }));

    useEffect(()=>{
        fetchData()
        setEditPermission(commonStore.user.team!==62) //영업관리팀 권한 설정
        setEditPermission(false)
        theSearch.current.control.grid = theGrid.current.control;
    },[])

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    const fetchData = useCallback(async ()=>{
        const result = await commonStore.handleApi({
            url: '/book-distributions',
            data: {
                display:state.pageArr.pageCnt,
                page:state.pageArr.page
            }
        });
        state.list = result.data
    },[])

    const handleSubmit = useCallback(async ()=>{
        const orderList = toJS(state.selectRows).map(item=>item.id)

        commonStore.handleApi({
            url: '/order-book-distributions',
            method: 'POST',
            data: { order_ids : orderList }
        }).then((result) => {
            if(result.success !==false){
                Modal.success({
                    title: result.result,
                    onOk() {
                        fetchData()
                        state.selectRows = []
                    },
                })
            }
        })
    },[])
    
    const initGrid = (grid) => {
        state.grid = grid

        grid.formatItem.addHandler(function (s, e) {
            let item = s.rows[e.row]?.dataItem;

            if(e.panel == s.rowHeaders){
                let item = s.rows[e.row].dataItem;
                if(item.status !== "1" ){
                    e.cell.innerHTML = '';
                }
            }

            if (e.panel == s.cells) {
                let col = s.columns[e.col];
                switch (col.binding) {
                    case 'product_name':
                        let name ='<button id="btnLink" class="btnLink title">' + item.product_name +'</button>';
                        e.cell.innerHTML ='<div class="incell">'+name +' ' +document.getElementById('tplBtnViewMode').innerHTML+'</div>';
                        e.cell['dataItem'] = item;
                        break;
                    case 'select':
                        if (item.select) {
                            e.cell.innerHTML = '<input id="iptSelect" type="checkbox" name= "'+col.binding+item.id+'" value="'+item.select+'" checked/>';
                        } else {
                            if(item.status!=="1"){
                                e.cell.innerHTML = ''
                            }else{
                                if (state.selectRows.length > 0){
                                    if (state.selectRows[0].company_name === item.company_name){
                                            e.cell.innerHTML = '<input id="iptSelect" type="checkbox" name= "'+col.binding+item.id+'" value="'+item.select+'" />';
                                    } else {
                                        e.cell.innerHTML = '<input id="iptSelect" type="checkbox" name= "'+col.binding+item.id+'" value="'+item.select+'" disabled />';
                                    }
                                } else {
                                    e.cell.innerHTML = '<input id="iptSelect" type="checkbox" name= "'+col.binding+item.id+'" value="'+item.select+'" />';
                                }
                            }
                        }
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
                        viewDrawerOpen(item.id);
                        break;
                }
            }

            if(e.target instanceof HTMLInputElement) {
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                switch(e.target.id){
                    case 'iptSelect':
                        if(e.target.checked){
                            state.selectRows = state.selectRows.concat(item);
                        } else {
                            state.selectRows = state.selectRows.filter(selRow => selRow.id !== item.id);
                        }
                        if(state.selectRows.length == 0){
                            setEditConfirm(true);
                        } else {
                            setEditConfirm(false);
                        }
                        item.select = e.target.checked;
                        state.grid.collectionView.refresh();
                        break;
                }
            }
        });
    };

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["application_date", "applicant_name", "company_name", "product_name", "total_shipping_qty", "request_date", "order_date", "status_name"];
    };

    const addDrawerOpen = () => { setaddDrawer(true); };
    const addDrawerClose = () => { setaddDrawer(false); };
    const viewDrawerOpen = (idx) => {
        state.selectorId = idx
        setViewDrawer(true);
    };
    const viewDrawerClose = () => { setViewDrawer(false); };

    return (
        <Wrapper>
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
                    <Button type='primary' style={{marginRight: 10}} disabled={editPermission || editConfirm} onClick={handleSubmit}>주문 등록</Button>
                    <Button className="btn btn-primary btn_add" shape="circle" onClick={addDrawerOpen}>+</Button>
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
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)}/>
                    <FlexGridColumn binding="select" header="선택" width={55} align="center"/>
                    <FlexGridColumn binding="application_date" header="신청일" width={100} />
                    <FlexGridColumn binding="applicant_name" header="신청자" width={80} />
                    <FlexGridColumn binding="company_name" header="회사" width={80} />
                    <FlexGridColumn binding="product_name" header="상품" width="*" minWidth={150} />
                    <FlexGridColumn binding="total_shipping_qty" header="배본 수량" width={100} />
                    <FlexGridColumn binding="request_date" header="배본 요청일" width={100} />
                    <FlexGridColumn binding="order_date" header="주문일" width={120} />
                    <FlexGridColumn binding="status_name" header="진행 상태" width={100} />
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

            {addDrawer && <AddDrawer drawerVisible={addDrawer} drawerClose={addDrawerClose}/>}
            {viewDrawer && <ViewDrawer appIdx={state.selectorId} drawerVisible={viewDrawer} drawerClose={viewDrawerClose}/>}
        </Wrapper>
    )
}

export default observer(Index);
