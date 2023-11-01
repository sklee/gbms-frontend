/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Row, Col, DatePicker, Pagination } from 'antd';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { CollectionView } from '@grapecity/wijmo';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjcGrid from "@grapecity/wijmo.react.grid";
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';

import * as FlexLayout from 'flexlayout-react';
import '/node_modules/flexlayout-react/style/light.css';

import Excel from '@components/Common/Excel';
import Popout from '@components/Common/popout/popout';
import ApprovalsView from './View/index'



const Wrapper = styled.div`
    width: 100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
    #tplBtnViewMode {
        display: none;
    }
`;

const approvalsList = observer((props) => {
    const { commonStore } = useStore();

    //flexLayout
    const json = {
        global: {},
        borders: [],
        layout: {
            type: 'row',
            weight: 100,
            children: [
                {
                    type: 'tabset',
                    id: 'view-area',
                    weight: 100,
                    enableDeleteWhenEmpty: true,
                    children: [
                        {
                            type: 'tab',
                            name: 'tab',
                            id: 'init',
                            component: 'init',
                            enableDrag: false,
                        },
                    ],
                    active: true,
                },
            ],
        },
    };

    const state = useLocalStore(() => ({
        //flexLayout
        model: FlexLayout.Model.fromJson(json),
        tabLen: 1,
        tabInit: false,
        theGrid : React.createRef(),

        list: [],
        total: 0,
        idx: '',

        //페이징
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },
        gridFilter: null,
        dateItemName: [{id: 1, name: '청구일'}],
    }));

    useEffect(() => {
        fetchData();
        theSearch.current.control.grid = theGrid.current.control;
    }, []);

    //리스트
    const fetchData = useCallback(async (val) => {
    
        if (val == '' || val == '0' || val == undefined) {
            var page = 1;
        } else {
            var page = val;
        }

        var axios = require('axios');

        var config = {
            method: 'GET',
            url: process.env.REACT_APP_API_URL +'/api/v1/billing-approvals?display='+state.pageArr.pageCnt +'&page='+page+'&sort_by=date&order=desc',
            headers: {
                Accept: 'application/json',
            },
        };

        axios(config)
            .then(function (response) {
                var result_page =
                    (page - 1) * state.pageArr.pageCnt;
                var str_no = response.data.meta.total - result_page;

                response.data.data.map((e, number) => {
                    e.cnt = str_no - number;
                    if(e.billed_at){
                        e.billed_at =e.billed_at.substring(0,10);
                    }
                    if(e.payment_at){
                        e.payment_at =e.payment_at.substring(0,10);
                    }
                    if(e.sum_total_amount){
                        e.sum_total_amount = priceToString(e.sum_total_amount);
                    }
                    if(e.current_unit_name){
                        e.current_unit = e.current_unit_name+'('+e.current_unit+')';
                    }
                });

                state.list = response.data.data;
                state.total = response.data.meta.total;
                state.pageArr.page = response.data.meta.current_page;
                state.pageArr.pageCnt = response.data.meta.per_page;

            })
            .catch(function (error) {
                console.log(error.response);
                // if (error.response.status === 401) {
                //     Modal.warning({
                //         title: (
                //             <div>
                //                 세션이 만료되었습니다.
                //                 <br />
                //                 재로그인을 해주세요.
                //             </div>
                //         ),
                //         onOk() {
                //             axios.post(
                //                 process.env.PUBLIC_URL +
                //                     '/member/session_logout',
                //             );
                //             window.location.href =
                //                 process.env.PUBLIC_URL + '/Login';
                //             window.localStorage.clear();
                //         },
                //     });
                // } else {
                //     //console.log(error.response)
                // }
            });
    }, []);

  

    //페이징
    const pageChange = (num)=>{
        let FLEXLAYOUT = document.querySelectorAll(".flexlayout__tab");
        FLEXLAYOUT.forEach((item)=>{
            item.scrollTo(0, 0);
        })
        fetchData(num);
    }

    //현재 리스트  dom확인
    const tabRef = useRef();
    const theGrid = useRef();
    const theSearch = useRef();

    // //상세정보
    const viewData = useCallback(async (type,tit) => {
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/billing-approvals/'+state.idx,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            },
        )
        
        state.viewData = result.data;
        state.contractType =result.data.contract_type;

        if(type === 'drawer'){
            setViewVisible(true);
        }else if(type === 'flex'){
            addTab(tit);
        }else{
            setPopoutOpen(true);
        }
    }) 

    //천다위 콤마
    const priceToString= (price)=> {
        if(price){
            return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }        
    }

    //drawer
    const [viewVisible, setViewVisible] = useState(false);

    // //view drawer open
    const viewDrawer = () => {
        // viewData('drawer');
        setViewVisible(true);
    };

    //view drawer 닫기
    const viewOnClose = (data) => {
        setViewVisible(false);
        if(data === 'Y'){
            fetchData();
        }
    };

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["billing_code", "name", "current_unit_name", "sum_total_amount", "accountable.name", "billed_info.name", "billed_at", "billing_status", "type_status"];
    };

    //위즈모 체크박스 선택
    const initGrid = (grid) => {
        state.grid =grid;
        //버튼 추가
        grid.formatItem.addHandler((s, e) => {
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                // create buttons for items not being edited
                switch (col.binding) {
                    case 'name':
                        let name = `<button id="btnLink" class="btnLink">` + item.name +'</button>';
                        e.cell.innerHTML = name + ' ' +
                            document.getElementById('tplBtnViewMode').innerHTML;
                        e.cell['dataItem'] = item;
                        break;               
                    case 'billing_status':
                        if(item.billing_status === '반려' || item.billing_status === '영수증 제출 대기'  || item.billing_status === '입금 완료(증빙 대기)' ){
                            var txt = '<span class="ant-typography ant-typography-danger redTxt">'+item.billing_status+'</span>'
                        }else{
                            var txt = '<span>'+item.billing_status+'</span>'
                        }
                        e.cell.innerHTML = txt;
                        e.cell['dataItem'] = item;
                        break;
                    case 'type_status':
                        if(item.type_status === '승인(대기)' || item.type_status === '참조(대기)' ){
                            var txt = '<span class="ant-typography ant-typography-danger redTxt">'+item.type_status+'</span>'
                        }else{
                            var txt = '<span>'+item.type_status+'</span>'
                        }
                        e.cell.innerHTML = txt;
                        e.cell['dataItem'] = item;
                        break;
                }                         
            }
        });
        
        // handle button clicks
        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                // get button's data item
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                var name = item.name;
                // handle buttons
                state.idx = item.id;
                switch (e.target.id) {
                    // start editing this item
                    case 'btnLink':
                        viewDrawer(item.id);
                        break;
                    // remove this item from the collection
                    case 'btnDivide':
                        dividelayout(item.id, name);
                        break;
                    // remove this item from the collection
                    case 'btnNew':
                        //state.window = 'Y';
                        setPopoutOpen(true);
                        break;
                }
            }

        });
    };

    //flexlayout 분활
    const dividelayout = (item, tit) => {
        const btnEl = tabRef.current.classList;

        btnEl.forEach((e) => {
            if (e != 'divide') {
                tabRef.current.classList.add('divide');
            }
        });

        addTab(tit);
    };
    
    const addTab = (tit) => {
        state.tabLen++;
        var tabsetId;
        var tabidx;
        if (state.model.getActiveTabset() == undefined) {
            for (const [key, value] of Object.entries(state.model._idMap)) {
                if (value._attributes.type == 'tabset') {
                    tabsetId = value._attributes.id;
                    break;
                }
            }
        } else {
            tabsetId = state.model.getActiveTabset().getId();
        }
        state.model.doAction(
            FlexLayout.Actions.addNode(
                {
                    type: 'tab',
                    name: tit,
                    component: 'workspace',
                    //id : state.idx,
                    config: { idx: state.idx },
                },
                tabsetId,
                FlexLayout.DockLocation.CENTER,
                -1,
            ),
        );

        if (state.tabInit == false) {
            state.model.doAction(FlexLayout.Actions.deleteTab('init'));
            state.tabInit = true;
        }
    };

    const factory = (node) => {
        node.setEventListener('close', (p) => {
            state.tabLen--;
            if (state.tabLen == 0) {
                tabRef.current.classList.remove('divide');

                node.removeEventListener('close');
            }
        });

        var component = node.getComponent();
        //var tabIdx = node.getId();
        var tabIdx = node.getConfig();
        if (tabIdx) {
            tabIdx = tabIdx.idx;
        }

        if (component === 'workspace') {
            return (
                <ApprovalsView
                    idx={state.idx}
                    viewVisible={viewVisible}
                    popoutChk='N'
                    drawerChk='N'
                    onClose={viewOnClose}
                    drawerResetChk={drawerReset}
                />
            );
        }
    };

    const drawerReset = (val) => {
        if(val === 'reset'){
            fetchData(state.pageArr.page);
        }
    };

    //팝업
    const [popout, setPopoutOpen] = useState(false);
    const closeWindowPortal = () => {
        setPopoutOpen(false);
    };

    return (
        <Wrapper >
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
            <Row id="gridWrap" className="gridWrap" ref={tabRef}>
                <FlexGrid
                    ref={theGrid}
                    itemsSource={state.list}
                    stickyHeaders={true}
                    headersVisibility="Column" 
                    initialized={(s) => initGrid(s)}
                    alternatingRowStep={0} 
                    style={{ minHeight: '700px' }}
                    allowSorting={false}
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                    <FlexGridColumn binding="billing_code" header="청구서 코드" width={150} isReadOnly={true} />
                    <FlexGridColumn binding="name" header="제목" width={'*'} minWidth={120} isReadOnly={true} />
                    <FlexGridColumn binding="current_unit_name" header="통화단위" width={100} isReadOnly={true} />
                    <FlexGridColumn binding="sum_total_amount" header="합계(부가세 포함)" width={150} align="right" isReadOnly={true} />
                    <FlexGridColumn binding="accountable.name" header="거래처" width={150} isReadOnly={true} />
                    <FlexGridColumn binding="billed_info.name" header="청구자" width={100} isReadOnly={true} />
                    <FlexGridColumn binding="billed_at" header="청구일" width={100} isReadOnly={true} />
                    <FlexGridColumn binding="billing_status" header="진행 상태" width={150} isReadOnly={true} />
                    <FlexGridColumn binding="type_status" header="결재 현황" width={100} isReadOnly={true} />
                </FlexGrid>
                
                <div className="panelWrap">
                    <FlexLayout.Layout model={state.model}  factory={factory.bind(this)}/>
                </div>
            </Row>
            <div id="tplBtnViewMode">
                <div className="btnLayoutWrap">
                    <button id="btnDivide"className="btn-layout ant-btn ant-btn-circle">D</button>
                    <button id="btnNew" className="btn-layout ant-btn ant-btn-circle" >N</button>
                </div>
            </div>

            <Row gutter={10} className="table table_bot">
                <Col xs={24} lg={16}>
                    <div className="btn-group">
                        <Pagination defaultCurrent={1} defaultPageSize={state.pageArr.pageCnt} current={state.pageArr.page} total={state.total} onChange={pageChange}/>
                        <span style={{marginLeft: 20}}>행 개수 : {state.total}</span>
                    </div>
                </Col>
                <Excel />
            </Row>

            {viewVisible === true && (
                <ApprovalsView
                    idx={state.idx}
                    viewVisible={viewVisible}
                    popoutChk='N'
                    drawerChk='Y'
                    onClose={viewOnClose}
                    drawerResetChk={drawerReset}
                />
            )}

            {
                popout && (
                    <Popout closeWindowPortal={closeWindowPortal}>
                        <ApprovalsView
                            idx={state.idx}
                            popoutClose={closeWindowPortal}
                            popoutChk="Y"
                        />                        
                    </Popout>
                )
            }

        </Wrapper>
    )

});

export default approvalsList;
