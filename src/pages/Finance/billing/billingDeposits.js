import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Row, Col, DatePicker, Modal, Pagination } from 'antd'
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { CollectionView } from '@grapecity/wijmo';
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import * as wjCore from '@grapecity/wijmo';

import * as FlexLayout from 'flexlayout-react';

import Excel from '@components/Common/Excel';
import Popout from '@components/Common/popout/popout';

import ViewInfo from "../../BillingApprovals/Approvals/View";

const Wrapper = styled.div`
    width: 100%;height:100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
    #tplBtnViewMode {
        display: none;
    }
`;

const billingDeposits = observer(({tab,type}) => {
     //flexLayout
     var json = {
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

    const state = useLocalStore(() =>({
        model: FlexLayout.Model.fromJson(json),
        tabLen: 1,
        tabInit: false,
        theGrid : React.createRef(),
        list: [
            // {
            //     billing_code: "221018-002",
            //     name: "작성 테스트3",
            //     company: "도서출판 길벗",
            //     billed_at: "2022-09-27 11:53:32",
            //     max_approval_at: null,
            //     billed_info_name: "김지원",
            //     current_unit: "KRW",
            //     sum_total_amount: "5000",
            //     payment_at: "2022-09-27 11:53:32",
            //     payment_user_info_name: "이해인"
            // },
        ],
        type : '', //국내, 해외
        tab : '',

        //페이징
        total: 0,
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },
        dateItemName: [{id: 1, name: '신청일'}],
    }));

    useEffect(() =>{      
        if(tab == 'billingDeposits'){
            //초기화
            fetchData();   
            console.log(type)       
        }
        theSearch.current.control.grid = theGrid.current.control;
    },[tab,type])

    //페이징
    const pageChange = (num)=>{
        let FLEXLAYOUT = document.querySelectorAll(".flexlayout__tab");
        FLEXLAYOUT.forEach((item)=>{
            item.scrollTo(0, 0);
        })
        fetchData(num);
    }

    const fetchData = useCallback(async (val) => {
        

        if (val == '' || val == '0' || val == undefined) {
            var page = 1;
        } else {
            var page = val;
        }

        var axios = require('axios');

        var config = {
            method: 'GET',
            url:process.env.REACT_APP_API_URL +'/api/v1/deposits/'+type+'?display='+state.pageArr.pageCnt +'&page='+page+'&sort_by=date&order=desc',
            headers: {
                Accept: 'application/json',
            },
        };

        axios(config)
        .then(function (result) {
            console.log(result.data.data)
            if (result.data.success === false) {
                Modal.error({
                    title: '오류가 발생했습니다.',
                    content: '오류코드:' + result.data.message,
                });
            } else {                  
                var result_page =
                    (page - 1) * state.pageArr.pageCnt;
                var str_no = result.data.meta.total - result_page;

                result.data.data.map((e, number) => {
                    e.cnt = str_no - number;                  
                    if(e.payment_at){
                        e.payment_at = e.payment_at.substring(0,10);          
                    }
                    if(e.max_approval_at){
                        e.max_approval_at = e.max_approval_at.substring(0,10);             
                    }   
                    e.payment_total_amount = commaNum(e.payment_total_amount);
                });

                state.list = result.data.data;
                state.total = result.data.meta.total;
                state.pageArr.page = result.data.meta.current_page;
                state.pageArr.pageCnt = result.data.meta.per_page;
            }
        })
        .catch(function (error) {
            console.log(error);
            console.log(error.response);
            if(error.response !== undefined){
                Modal.error({
                    title: '오류가 발생했습니다. 재시도해주세요.',
                    content: '오류코드:' + error.response.status,
                });
            }
            
        });
        
    }, []);
    
    //현재 리스트  dom확인
    const tabRef = useRef();
    const theGrid = useRef();
    const theSearch = useRef();

    const [viewVisible, setViewVisible] = useState(false);

    // drawer open
    const viewDrawer = (idx) => {
        setViewVisible(true);
    }

    // drawer close
    const viewOnClose = (data) => {
        setViewVisible(false);
        if(data === 'Y'){
            fetchData();
        }
    }

    //팝업
    const [popout, setPopoutOpen] = useState(false);
    const closeWindowPortal = () => {
        setPopoutOpen(false);
    };

    const commaNum = (num) => {  
        if(num){
            const number = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return number
        }else{
            return 0;
        }
    } 

    const initGrid = (grid) =>{
        //버튼 추가
        grid.formatItem.addHandler((s, e) => {
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                // create buttons for items not being edited
                switch (col.binding) {
                    case 'name':
                        var name = '<button id="btnLink" class="btnLink">' + item.name +'</button>';
                        e.cell.innerHTML = name + ' ' +
                        document.getElementById('tplBtnViewMode').innerHTML;
                        e.cell['dataItem'] = item;
                        break;
                    case 'max_approval_at':
                        if(item.max_approval_at){
                            let finish_date = item.max_approval_at.split(" ");  
                            e.cell.innerHTML = finish_date[0];
                        }
                        break;
                    case 'billed_at':
                        if(item.billed_at){
                            let finish_date = item.billed_at.split(" ");  
                            e.cell.innerHTML = finish_date[0];
                        }
                        break;
                    case 'payment_at':
                        if(item.payment_at === null){
                            let finish_date = item.payment_at.split(" ");  
                            e.cell.innerHTML = finish_date[0];
                        }
                        break;
                    case 'company': 
                        if (item.company == '도서출판 길벗'){
                            e.cell.innerHTML = '길벗'
                        } else if (item.company == '길벗스쿨'){
                            e.cell.innerHTML = '스쿨'
                        } else {
                            e.cell.innerHTML = item.company;
                        }
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
                state.idx = item.approval_id;
                // state.contractType = item.contract_type;                

                switch (e.target.id) {
                    // start editing this item
                    case 'btnLink':
                        viewDrawer(item.approval_id);
                        break;
                    // remove this item from the collection
                    case 'btnDivide':
                        dividelayout(item.approval_id, name);
                        break;
                    // remove this item from the collection
                    case 'btnNew':
                        setPopoutOpen(true)                                            
                        break;
                }
            }
        });
    }

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
                <ViewInfo
                    idx={state.idx}
                    viewVisible={viewVisible}
                    popoutChk='N'
                    drawerChk='N'
                    onClose={viewOnClose}
                    drawerResetChk={drawerReset}
                    typeChk='deposits'
                />
            );
        }
    };

    const drawerReset = (val) => {
        if(val === 'reset'){
            fetchData();
        }
    };

    const gridEl = () => {
    };

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["billing_code", "name", "company", "billed_at", "max_approval_at", "billed_info.name", "current_unit_name", "sum_total_amount", "payment_total_amount", "payment_at", "payment_user_info.name" ];
    };
    

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
            <Row id='gridWrap' className='gridWrap' ref={tabRef}>
                {type === '1' ?
                        <FlexGrid
                            ref={theGrid}
                            itemsSource={state.list}
                            stickyHeaders={true}
                            headersVisibility="Column" 
                            initialized={(s) => initGrid(s)}
                        >
                            <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                            <FlexGridColumn binding="billing_code" header="청구서 코드" width={100} isReadOnly={true}/>
                            <FlexGridColumn binding="name" header="제목" width="*" isReadOnly={true}/>
                            <FlexGridColumn binding="company" header="회사" width={80} isReadOnly={true}/>
                            <FlexGridColumn binding="billed_at" header="청구일" width={100} isReadOnly={true}/>
                            <FlexGridColumn binding="max_approval_at" header="결재 종료일" width={100} isReadOnly={true}/>
                            <FlexGridColumn binding="billed_info.name" header="청구자" width={80} isReadOnly={true}/>
                            <FlexGridColumn binding="current_unit_name" header="통화 단위" width={100} isReadOnly={true}/>
                            <FlexGridColumn binding="payment_total_amount" header="입금액" width={100} align="right" isReadOnly={true}/>
                            <FlexGridColumn binding="payment_at" header="입금일" width={100} isReadOnly={true}/>
                            <FlexGridColumn binding="payment_user_info.name" header="입금자" width={80} isReadOnly={true}/>
                        </FlexGrid>

                    :
                        <FlexGrid
                            ref={theGrid}
                            itemsSource={state.list}
                            stickyHeaders={true}
                            headersVisibility="Column" 
                            initialized={(s) => initGrid(s)}
                        >
                            <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                            <FlexGridColumn binding="billing_code" header="청구서 코드" width={100} isReadOnly={true}/>
                            <FlexGridColumn binding="name" header="제목" width="*" isReadOnly={true}/>
                            <FlexGridColumn binding="company" header="회사" width={80} isReadOnly={true}/>
                            <FlexGridColumn binding="billed_at" header="청구일" width={100} isReadOnly={true}/>
                            <FlexGridColumn binding="max_approval_at" header="결재 종료일" width={100} isReadOnly={true}/>
                            <FlexGridColumn binding="billed_info.name" header="청구자" width={80} isReadOnly={true}/>
                            <FlexGridColumn binding="current_unit_name" header="통화 단위" width={100} isReadOnly={true}/>
                            <FlexGridColumn binding="sum_total_amount" header="청구 금액" width={100} align="right" isReadOnly={true}/>
                            <FlexGridColumn binding="payment_total_amount" header="입금 원화" width={100} align="right" isReadOnly={true}/>
                            <FlexGridColumn binding="payment_at" header="입금일" width={100} isReadOnly={true}/>
                            <FlexGridColumn binding="payment_user_info.name" header="입금자" width={80} isReadOnly={true}/>
                        </FlexGrid>
                    }

                <div className="panelWrap">
                    <FlexLayout.Layout model={state.model}  factory={factory.bind(this)}/>
                </div>
            </Row>
            <div id="tplBtnViewMode">
                <div className="btnLayoutWrap">
                    <button id="btnDivide" className="btn-layout ant-btn ant-btn-circle" >D</button>
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
                <ViewInfo
                    idx={state.idx}
                    viewVisible={viewVisible}
                    popoutChk='N'
                    drawerChk='Y'
                    onClose={viewOnClose}
                    drawerResetChk={drawerReset}
                    typeChk='deposits'
                />
            )}

            {
                popout && (
                    <Popout closeWindowPortal={closeWindowPortal}>
                        <ViewInfo
                            idx={state.idx}
                            popoutClose={closeWindowPortal}
                            popoutChk="Y"
                        />                        
                    </Popout>
                )
            }
        </Wrapper>
    );
})

export default billingDeposits;
