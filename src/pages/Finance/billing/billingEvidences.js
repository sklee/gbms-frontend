import React, {useState, useRef, useEffect, useCallback}from 'react'
import {Row, Col, Button, DatePicker, Modal, message, Pagination} from 'antd'
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { Selector } from "@grapecity/wijmo.grid.selector";
import { CollectionView } from "@grapecity/wijmo";
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import * as wjCore from '@grapecity/wijmo';
import * as wjcCore from "@grapecity/wijmo";
import * as wjcGrid from "@grapecity/wijmo.grid";

import * as FlexLayout from 'flexlayout-react';

import { toJS } from 'mobx';
import Popout from '@components/Common/popout/popout';

import Excel from '@components/Common/Excel';
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

const BillingEvidences = ({tab, type}) => {

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

    const { confirm } = Modal;
    const state = useLocalStore(() =>({
        model: FlexLayout.Model.fromJson(json),
        tabLen: 1,
        tabInit: false,
        theGrid : React.createRef(),
        list: [
            // {
            //     billing_code: "221018-002",
            //     name: "작성 테스트3",
            //     max_approval_at: "2022-10-31 16:11:56",
            //     billed_person: '청구자1', 
            //     current_unit: "KRW",
            //     evidence_waiting_amount: 1750,
            //     evidence_total_amount: 550,
            //     type_str: "세금계산서",
            //     submission_timing: "함께 제출",
            // },
            // {
            //     billing_code: "221018-002",
            //     name: "작성 테스트3",
            //     max_approval_at: "2022-10-31 16:11:56",
            //     billed_person: '청구자1', 
            //     current_unit: "KRW",
            //     evidence_waiting_amount: 1750,
            //     evidence_total_amount: 550,
            //     type_str: "영수증",
            //     submission_timing: "함께 제출",
            // }
        ],
        idx: '',
        selector:'',

        type : '', //국내, 해외
        tab : '',

        //페이징
        total: 0,
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },

        chkEvidenceTotalAmount : '',
        receiptsId : '',    //영수증 확인
        receiptsData : '',    //영수증 확인
        dateItemName: [{id: 1, name: '승인일'}],
    }));

    useEffect(() =>{      
        if(tab == 'billingEvidences'){
            //초기화
            fetchData();          
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
            url:process.env.REACT_APP_API_URL +'/api/v1/billing-evidences/'+type+'?display='+state.pageArr.pageCnt +'&page='+page+'&sort_by=date&order=desc',
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
                    if(e.max_approval_at){
                        e.max_approval_at = e.max_approval_at.substring(0,10);             
                    }                     

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
    const [btnDis, setBtnDis] = useState(true);

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
    
    const [selectorState, setSelectorState] = useState({
        view: new CollectionView(),
        selectedItems: []
    });

    const initGrid = (grid) =>{

        state.selector = new Selector(grid, {
            itemChecked: (s, e) => {
                state.receiptsId = []
                state.receiptsData = []

                var chkData= grid.rows.filter(r => r.isSelected)

                chkData.forEach((e,num) => {
                    if(e.dataItem.type_str === '영수증'){
                        state.receiptsId = [...state.receiptsId, e.dataItem.id]
                        state.receiptsData = [...state.receiptsData, e.dataItem]
                    }                   
                })

                if(chkData.length > 0){
                    setBtnDis(false);
                }else {
                    setBtnDis(true);
                }
            }           
        });

        //버튼 추가
        grid.formatItem.addHandler((s, e) => {
            if(e.panel == s.rowHeaders){
                // console.log(grid.rows)
                // grid.rows.forEach((e,num) => {
                //     if(e.dataItem.type_str === '영수증'){
                //        e.isSelected = true
                //     } else{
                //         e.isSelected = false
                //     }              
                // })

                let item = s.rows[e.row].dataItem;
                if(item.type_str !== "영수증"){
                    e.cell.innerHTML = '';
                }
            }
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
                        if(item.max_approval_at !== ''&& item.max_approval_at !== null && item.max_approval_at !== undefined){
                            let finish_date = item.max_approval_at.split(" ");  
                            e.cell.innerHTML = finish_date[0];
                            break;
                        }     
                        
                    case 'evidence_total_amount' : 
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
                // state.idx = item.billing_id
                state.idx = item.approval_id
                ;
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

        //증빙 금액 수정
        grid.beginningEdit.addHandler((s, e) => {
            let item = e.getRow().dataItem, binding = e.getColumn().binding;
            if (item.type_str == '세금계산서' && binding == 'evidence_total_amount') { 
                e.cancel = true;
            }
        });
        
        grid.cells.hostElement.addEventListener('change',(e)=>{
            let item = wjcCore.closest(e.target, '.wj-cell')['dataItem'];
            console.log(e.srcElement.value)
            var numChk = /[^0-9]/g;
            if(numChk.test(e.srcElement.value)){
                // message.warning('숫자만 입력 가능합니다.');
                var key = 'numChkError'
                message.warning({ content: '숫자만 입력 가능합니다.', key});   
            }else{
                payApiSubmit(item.id, e.srcElement.value)
            }            
        },true);         
        
    }

    //증빙금액수정
    const payApiSubmit = useCallback(async (idx,val)=> {
        var axios = require('axios');
        var data = {total_amount: val}
// console.log(idx, data)
// return
        var config={
            method:'PUT',
            url:process.env.REACT_APP_API_URL +'/api/v1/billing-evidences/'+idx,
            headers:{
                'Accept':'application/json',
            },
                data:data
            };
            
        axios(config)
        .then(function(response){
            if(response.data.success != false){
                fetchData()
                // Modal.success({
                //     title: response.data.result,
                //     onOk(){
                //         fetchData()
                //     },
                // });
            }else{
                Modal.error({
                    content:(<div>
                                <p>문제가 발생하였습니다.</p>
                                <p>재시도해주세요.</p>
                                <p>오류코드: {response.data.message}</p>
                            </div>)
                });  
            }
        })
        .catch(function(error){
            console.log(error.response.status);
            Modal.error({
                title : '문제가 발생하였습니다.',
                content : '오류코드:'+error.response.status
            });  
        });
            
    }, []);     

       

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
                    typeChk='evidences'
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


    // //영수증 확인
    // selectorState.selectedItems.forEach(el => {
    //     if(el._data.type_str !== '영수증'){
    //         el.isSelected = false;
    //     }
    // })
    // useEffect(()=>{
    //     if(selectorState.selectedItems.length > 0){
    //         setBtnDis(false);
    //     }else {
    //         setBtnDis(true);
    //     }
    // },[selectorState.selectedItems])

    //영수증확인완료
    const okSubmitChk = ()=>{
        var chk = 0;
        state.receiptsData.forEach(e => {
            if(e.evidence_waiting_amount - e.evidence_total_amount > 0){
                chk++
            }
        });

        if(chk > 0 ){
            confirm({
                title: '증빙 대기 금액이 남아 있습니다.  ',
                content: '그래도 영수증 확인 완료로 등록하시겠습니까?',
                onOk() {
                    receiptsApiSubmit();
                },
                onCancel() {
                    
                },
            });
        }else{
            receiptsApiSubmit();
        }
        
    }
    const receiptsApiSubmit = useCallback(async ()=> {
       
        var data ={id : toJS(state.receiptsId)};
        // console.log(data)
        // return
        var axios = require('axios');

        var config={
            method:'POST',
            url:process.env.REACT_APP_API_URL +'/api/v1/confirm-receipts',
            headers:{
                'Accept':'application/json',
            },
                data:data
            };
            
        axios(config)
        .then(function(response){
            if(response.data.success != false){
                Modal.success({
                    title: response.data.result,
                    onOk(){
                        fetchData()
                    },
                });
            }else{
                Modal.error({
                    content:(<div>
                                <p>문제가 발생하였습니다.</p>
                                <p>재시도해주세요.</p>
                                <p>오류코드: {response.data.message}</p>
                            </div>)
                });  
            }
        })
        .catch(function(error){
            console.log(error.response.status);
            Modal.error({
                title : '문제가 발생하였습니다.',
                content : '오류코드:'+error.response.status
            });  
        });
            
    }, []);     
    
    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["billing_code", "name", "max_approval_at", "billed_info.name", "current_unit_name", "evidence_waiting_amount", "evidence_total_amount", "type_str", "submission_timing" ];
    };

    return (
        <Wrapper>
            <Row className="topTableInfo">
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
                    <Button disabled={btnDis} onClick={(e)=>okSubmitChk()}>영수증 확인 완료</Button>
                </Col>
            </Row>
            <Row id='gridWrap' className='gridWrap' ref={tabRef}>
                <FlexGrid
                    ref={theGrid}
                    itemsSource={state.list}
                    stickyHeaders={true}
                    initialized={(s) => initGrid(s)}
                    // style={{minHeight: '700px'}}
                    // selectionMode="None"
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                    <FlexGridColumn binding="billing_code" header="청구서 코드" width={100} isReadOnly={true}/>
                    <FlexGridColumn binding="name" header="제목" width="*" isReadOnly={true}/>
                    <FlexGridColumn binding="max_approval_at" header="결재 종료일" width={100} isReadOnly={true}/>
                    <FlexGridColumn binding="billed_info.name" header="청구자" width={80} isReadOnly={true}/>
                    <FlexGridColumn binding="current_unit_name" header="통화 단위" width={100} isReadOnly={true}/>
                    <FlexGridColumn binding="evidence_waiting_amount" header="증빙 대기 금액" width={120} align="right" isReadOnly={true}/>
                    <FlexGridColumn binding="evidence_total_amount" header="증빙 금액" width={120} align="right" />
                    <FlexGridColumn binding="type_str" header="증빙 종류" width={100} isReadOnly={true}/>
                    <FlexGridColumn binding="submission_timing" header="제출 시점" width={180} isReadOnly={true}/>
                </FlexGrid>
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
                    typeChk='evidences'
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

       

    )
}

export default observer(BillingEvidences);