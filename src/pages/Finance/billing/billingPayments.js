import React, {useState, useRef, useEffect, useCallback } from 'react'
import { Row, Col, Button, Upload, Modal, Radio, Pagination, message, DatePicker } from 'antd'
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { Selector } from "@grapecity/wijmo.grid.selector";
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { CollectionView } from '@grapecity/wijmo';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';
import * as wjcGridXlsx from '@grapecity/wijmo.grid.xlsx';
import * as wjcXlsx from '@grapecity/wijmo.xlsx';

import * as FlexLayout from 'flexlayout-react';
import '/node_modules/flexlayout-react/style/light.css';
import Excel from '@components/Common/Excel';
import Popout from '@components/Common/popout/popout';

import {  toJS } from 'mobx';
import moment from 'moment';

// import View from './View/View'
// import ViewInfo from "./View";
import ViewInfo from "../../BillingApprovals/Approvals/View";
import useStore from '@stores/useStore';

const Wrapper = styled.div`
    width: 100%;height:100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
    #tplBtnViewMode {
        display: none;
    }
`;

wjCore.setLicenseKey(window.evalkey);


const BillingPayments = ({tab,type })=>{
    const { commonStore } = useStore()

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

    const state = useLocalStore(()=> ({
        model: FlexLayout.Model.fromJson(json),
        tabLen: 1,
        tabInit: false,
        theGrid : React.createRef(),
        list: [
            // {
            //     billing_code: '221002-026', 
            //     name: '선불 저작권료-홍길동', 
            //     company: '길벗스쿨', 
            //     current_unit: '원화(KRW)', 
            //     sum_total_amount: '5000000', 
            //     billed_at: '2022.10.03', 
            //     billed_person: '청구자1', 
            //     okPerson1: '노원표', 
            //     okDate1: "2022.10.04", 
            //     okPerson2: '', 
            //     okDate2: "", 
            //     status: '승인 대기'
            // },
            // {
            //     billing_code: '221002-026', 
            //     name: '선불 저작권료-홍길동', 
            //     company: '길벗스쿨', 
            //     current_unit: '원화(KRW)', 
            //     sum_total_amount: '5000000', 
            //     billed_at: '2022.10.03', 
            //     billed_person: '청구자1', 
            //     okPerson1: '노원표', 
            //     okDate1: "2022.10.04", 
            //     okPerson2: '', 
            //     okDate2: "", 
            //     status: '승인 대기'
            // },
        ],
        depositFile: [],
        selector:'',

        type : '', //국내, 해외
        tab : '',
       
        //페이징
        total: 0,
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },

        selectorId : [], //체크 아이디값
        adminChk : true,

        chkCellData : [],   //입금생성파일 데이터

        userInfo : '',      //로그인정보

        selectorIdChk: 0 ,   //승인대기 체크
        approval_flag : '', //입금 승인 radio
        chkFile : 0, //입금파일생성 조건 체크

        grid : '',  
        flex : '',  //입금승인파일생성 grid
        depositResult : [], //입금결과등록데이터
        depositResultError : [], //입금결과등록중 오류데이터

        importChk : false,
        dateItemName: [{id: 1, name: '승인일'}],
    }));

    useEffect(() =>{      
        // loginChk()    
        state.userInfo = commonStore.user 
        theSearch.current.control.grid = theGrid.current.control;
    },[])

    useEffect(() =>{      
        if(tab == 'billingPayments'){
            //초기화
            fetchData();          
        }    
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
            url:process.env.REACT_APP_API_URL +'/api/v1/billing-payments/'+type+'?display='+state.pageArr.pageCnt +'&page='+page+'&sort_by=date&order=desc',
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
                    e.sum_total_amount = Number(e.sum_total_amount)
                    if(e.payment_approval1_at){
                        e.payment_approval1_at = e.payment_approval1_at.substring(0,10);           
                    }
                    if(e.payment_approval2_at){
                        e.payment_approval2_at = e.payment_approval2_at.substring(0,10);           
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

    //정보 불러오기
    const loginChk = useCallback(async () => {
        var axios = require('axios');

        var config = {
            method: 'POST',
            url: process.env.REACT_APP_API_URL +'/api/v1/login-check',
            headers: {
                'Content-type': 'application/json',
            },
        };

        axios(config)
        .then(function (result) {
            state.userInfo = result.data;
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
            fetchData(state.pageArr.page);
        }
    }

    //팝업
    const [popout, setPopoutOpen] = useState(false);
    const closeWindowPortal = () => {
        setPopoutOpen(false);
    };


    //승인정보 로그인체크
    const [approvalsChk,setApprovals] = useState(true);
    //입금생성 로그인체크
    const [depositResultChk,setDepositResultChk] = useState(false);
    
    const initGrid = (grid) =>{
        state.grid= grid
        state.selector = new Selector(grid, {
            itemChecked: (s, e) => {
                var selectedItem = grid.rows.filter(r => r.isSelected)

                if(selectedItem.length === 0){
                    if(state.userInfo.email === 'tori86@gilbut.co.kr' || state.userInfo.email === 'wlgp519@gilbut.co.kr' || state.userInfo.email === 'wproh@gilbut.co.kr' ){
                        setApprovals(true)
                    }
                    //입금생성 수정권한 확인후
                    //setDepositResultChk(true)
                }else{
                    //승인
                    if(state.userInfo.email === 'tori86@gilbut.co.kr' || state.userInfo.email === 'wlgp519@gilbut.co.kr' || state.userInfo.email === 'wproh@gilbut.co.kr'){
                        setApprovals(false)
                    }
                    //입금생성 수정권한 확인후
                    //setDepositResultChk(false)

                    //승인
                    var chk = 0;                    
                    var arr = [];                    
                    selectedItem.forEach(e => {
                        if(e.dataItem.payment_status !== '승인 대기' && e.dataItem.payment_status !== '1차 승인 대기' && e.dataItem.payment_status !== '2차 승인 대기'  && e.dataItem.payment_status !== '영수증 확인 완료'){
                            chk++                    
                        }else{                       
                            arr = [...arr,e.dataItem['payments.id']]  
                        }
                    });
                    state.selectorIdChk = chk;                    
                    state.selectorId = arr;
                    console.log(toJS(state.selectorId))
                   

                    //입금생성
                    if(type === 1){            
                        var chkFile = 0;
                        var arr2 = [];
                        selectedItem.forEach(e => {
                            console.log(e.dataItem)
                            if(e.dataItem.payment_status !== '입금 대기' && e.dataItem.payment_status !== '부분 입금'){
                                    chkFile++                   
                            }else{                     
                                // e.dataItem.deposit_file.total_amount = e.dataItem.total_amount                  
                                // e.dataItem.deposit_file.total_amount = e.dataItem.amount                  
                                if(e.dataItem.deposit_file.etc_bank_id !=='' && e.dataItem.deposit_file.etc_bank_id !== undefined && e.dataItem.deposit_file.etc_bank_id !== null){
                                    arr2 = [...arr2,{bank_name: e.dataItem.deposit_file.etc_bank_name, 
                                        account_no: e.dataItem.deposit_file.etc_account_no,
                                        total_amount: e.dataItem.deposit_file.total_amount,
                                        depositor: e.dataItem.deposit_file.etc_depositor, 
                                        deposit_code: e.dataItem.deposit_file.deposit_code}]
                                }else{
                                    arr2 = [...arr2,e.dataItem.deposit_file]
                                }
                            }
                        });
                        state.chkFile = chkFile;
                        state.chkCellData = arr2
                        console.log('chkCellData',toJS(state.chkCellData))
                    }
                    
                }          
                
            }
        })

        
        let extraRow = new wjGrid.Row();
        extraRow.allowMerging = true;
        
        var panel = grid.columnHeaders;
        panel.rows.splice(0, 0, extraRow);

        state.selector._col.allowMerging = true;
        state.selector._col._cssClassAll = "chkAll";

        for (let colIndex = 0; colIndex <= 12; colIndex++) {
            if(colIndex >= 8 && colIndex <= 9){ 
                panel.setCellData(0, colIndex, '1차 승인');
            } else if(colIndex >= 10 && colIndex <= 11) {
                panel.setCellData(0, colIndex, '2차 승인');
            } else {
                let col = grid.getColumn(colIndex);
                if(col !=='' && col !== undefined){
                    col.allowMerging = true;
                    panel.setCellData(0, colIndex, col.header);
                }
                
            }            
        }

        grid.autoGenerateColumns = false;
        grid.itemsSource = state.list;

        //버튼 추가
        grid.formatItem.addHandler((s, e) => {
            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
                let col = s.columns[e.col];
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + '<br/>' + html.split('\\n')[1] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }

            // 권한 기능 완료시 재작업을 위해 보류 (막아둠)
            if(e.panel == s.rowHeaders && type !== '1'){
                let item = s.rows[e.row].dataItem;
                if(item.payment_status !== "1차 승인 대기" && item.payment_status !== "2차 승인 대기"){
                    e.cell.innerHTML = '';
                }
            }
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                // create buttons for items not being edited
                switch (col.binding) {
                    case 'name':
                        let name = '<button id="btnLink" class="btnLink">' + item.name +'</button>';
                        e.cell.innerHTML = name + ' ' +
                            document.getElementById('tplBtnViewMode').innerHTML;
                        e.cell['dataItem'] = item;
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
                        //state.window = 'Y';
                        setPopoutOpen(true);                      
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
                // <ViewInfo
                //     idx={tabIdx}
                //     popoutClose={gridEl}
                //     popoutChk="N"
                //     typeChk="payments"
                // />

                <ViewInfo
                    idx={state.idx}
                    viewVisible={viewVisible}
                    popoutChk='N'
                    drawerChk='N'
                    onClose={viewOnClose}
                    drawerResetChk={drawerReset}
                    typeChk='payments'
                />
            );
        }
    };

    const drawerReset = (val) => {
        if(val === 'reset'){
            fetchData();
        }
        viewOnClose()
    };

    const gridEl = () => {
    };

    const depositProps = {
        name: 'file',
        action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
        headers: {
            authorization: 'authorization-text',
        },
        beforeUpload: (file) => {
            state.depositFile = file;
            if (file.name.split(".").reverse()[0] !== ("xlsx")) {
                Modal.error({
                    title:"엑셀 파일만 선택 가능 합니다.",
                    onOk(){
                        return false;
                    },
                });
            }
            return file.name.split(".").reverse()[0] === ("xlsx") ? true : Upload.LIST_IGNORE;
        },

        onChange(info) {
            // if (info.file.status === 'uploading') {}
            if (info.file.status === 'done') {
                showImportModal();
            } else if (info.file.status === 'error') {
                Modal.error({
                    title:"업로드 중 오류가 발생하였습니다.",
                    onOk(){
                        return false;
                    },
                });
            }
        },
    };

    //승인 모달
    const [approvalModalOpen, setApprovalModalOpen] = useState(false);   
    const showApprovalModal = () => {
        // if(state.selectorId !=='' && state.selectorId !== undefined &&  state.selectorId.length > 0){
        //     setApprovalModalOpen(true);
        // }else{
        //     Modal.error({
        //         title:"승인할 리스트를 선택해주세요.",
        //         onOk(){
        //             return false;
        //         },
        //     });
        // }

        if(state.selectorId.length === 0 && state.selectorIdChk === 0){
            Modal.error({
                title:"승인할 리스트를 선택해주세요.",
                onOk(){
                    return false;
                },
            });
        }else{
            if(state.selectorIdChk === 0){
                setApprovalModalOpen(true);
            }else{
                Modal.error({
                    content: "처리상태가 '승인대기, 영수증 확인 완료'인 것만 선택해주세요.",        
                });
            }
        } 
        
    };
    const approvalHandleOk = () => {
        setApprovalModalOpen(false);
    };
    const approvalHandleCancel = () => {
        setApprovalModalOpen(false);
    };
    // const [approvalValue, setApprovalValue] = useState(1);
    const approvaOnChange = (e) => {
        // setApprovalValue(e.target.value);
        // console.log(e.target.value)
        // approvalApiSubmit(e.target.value)
        state.approval_flag = e.target.value
    };
    //승인 값
    const approvalApiSubmit = useCallback(async (val)=> {
        var axios = require('axios');
        if(state.approval_flag === ''){
            message.warning('입금승인을 선택해주세요.');
            // Modal.error({
            //     content: "입금승인을 선택해주세요.",        
            // });
        }else{
            var data = {payment_id: toJS(state.selectorId), approval_flag : state.approval_flag }
            var config={
                method:'POST',
                url:process.env.REACT_APP_API_URL +'/api/v1/deposit-approvals',
                headers:{
                    'Accept':'application/json',
                },
                    data:data
                };
                
            axios(config)
            .then(function(response){
                if(response.data.success != false){
                    setApprovalModalOpen(false);
                    setApprovals(true)
                    Modal.success({
                        title: response.data.result,
                        onOk(){
                            fetchData(state.pageArr.page)
                            //초기화
                            state.selectorId =[];
                            state.approval_flag = '';
                            state.selectorIdChk =0;                            
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
                if(error.response.status === 401){
                    Modal.error({
                        title : '재무지원팀장 또는 경영지원본부장만 승인 가능합니다.',
                    }); 
                    
                }else{
                    Modal.error({
                        title : '문제가 발생하였습니다.',
                        content : '오류코드:'+error.response.status
                    });  
                }
            });
        }       
    })
          

    const fileImport = () =>{
        // 엑셀 파일 리스트에 반영하는 코드
        setLoading(true);
    }

    const importModalChk = ()=>{
        setImportModalOpen(true)
        setImportChk(false)
    }

    const [importModalOpen, setImportModalOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [importChk, setImportChk] = useState(false);

    const showImportModal = () => {
        setImportChk(false)
        setImportModalOpen(true);
    };
    const importHandleOk = () => {
        setImportModalOpen(false);
        setImportChk(false)
    };
    const importHandleCancel = () => {
        setImportChk(true)
        state.depositResultError = []
        // document.getElementById('importFile').value('')
        setImportModalOpen(false);
        setLoading(false)
    };

    const showErrorModal = () => {
        setErrorModalOpen(true);
    };
    const errorHandleOk = () => {
        setErrorModalOpen(false);
    };
    const errorHandleCancel = () => {
        setErrorModalOpen(false);
    };

    const initializeGrid=(flex)=> {
        state.flex = flex;
    }
    
    //입금파일생성 
    const excelDown =()=> {
        if(state.chkCellData.length === 0 && state.chkFile === 0){
            message.warning('입금파일을 생성할 내용을 선택해주세요.');
        }else{
            if(state.chkFile > 0){
                Modal.warning({
                    title : '처리 상태가 "입금 대기" 또는 "부분 입금"인 건만 선택해 주세요.',
                });  

            }else{
                var today = moment().format('YYYY-MM-DD');

                wjcGridXlsx.FlexGridXlsxConverter.saveAsync(state.flex, {
                    includeColumnHeaders: true,
                    includeStyles: true,
                }, today+'.xlsx');
            }
        }   
           
    }

    //입금결과등록
    const handelDepositResult = useCallback(async (val)=> {
        if(state.depositResult === 0){
            Modal.warning({
                content: "입금결과를 등록할 데이터가 없습니다.",        
            });
        }else{
            if (type === '1') {
                var url = 'deposit-result-file';
            } else {
                var url = 'deposit-result-overseas';
            }
            
            var  chk  = 0
            var accountChk = []
            state.depositResult.forEach(e => {
                if(e.total_amount !== '' && e.total_amount !== undefined  && e.total_amount !== null){
                    e.total_amount = e.total_amount
                }else{
                    e.total_amount = 0
                }
                if(e.account_no === '' || e.account_no === undefined || e.account_no === null){
                    accountChk = [...accountChk, e.deposit_code]
                }
                if(e.deposit_code === '' || e.deposit_code === undefined || e.deposit_code === null){
                    chk++
                }
            });

            if(chk > 0){
                state.depositResultError = '입금관리코드 없음'
                setImportChk(true)
                // Modal.error({
                //     title : '입금관리코드가 없는 데이터가 있습니다.',
                //     content : '엑셀파일을 확인해주세요.',
                // });  
            }else if(accountChk.length > 0){
                state.depositResultError = accountChk.join(',')
                setImportChk(true)
            }else{

                var data = toJS(state.depositResult);

                setLoading(true)
                // return
                var axios = require('axios');

                var config = {
                    method: 'POST',
                    url:process.env.REACT_APP_API_URL +'/api/v1/'+url,
                    headers:{
                        'Accept':'application/json',
                    },
                        data:data
                    };
                axios(config)
                .then(function(response){
                    setLoading(false)
                    console.log(response.data)
                    var chk = 0;
                    var arr = []
                    response.data.status.forEach(e => {
                        if(e.status === 'FAIL'){
                            arr = [...arr,e.deposit_code]
                            chk++;
                        }

                        state.depositResultError = arr.join(',')
                    });
                    if(chk === 0){
                        setImportModalOpen(false)
                        state.chkCellData = []                        
                        fetchData(state.pageArr.page);
                    }else{
                        state.importChk = true
                        setImportChk(true)

                    }

                })
                .catch(function(error){
                    console.log(error);
                    // Modal.error({
                    //     title : '등록시 문제가 발생하였습니다.',
                    //     content : '오류코드:'+error.response.status
                    // });  
                });
            }       
        }
    })

    const load=()=> {
        let fileInput = document.getElementById('importFile');
        if (fileInput.files[0]) {
            loadGrid(state.flex, fileInput.files[0])
            // wjcGridXlsx.FlexGridXlsxConverter.loadAsync(state.flex, fileInput.files[0], dataImported);
            // wjcGridXlsx.FlexGridXlsxConverter.loadAsync(state.flex,fileInput.files[0],{includeColumnHeaders: true},dataImported);
            // wjcGridXlsx.FlexGridXlsxConverter.loadAsync(state.flex, fileInput.files[0], null, function (workbook) {
            //     var arr = [];
            
            //     workbook.sheets[0].rows.forEach((e,index) => {
            //         if(index > 0){
            //             arr = [...arr, {bank_name: e.cells[0].value, account_no : e.cells[1].value, total_amount : e.cells[2].value, depositor : e.cells[3].value, deposit_code : e.cells[4].value}]
            //         }
            //     });
            //     state.depositResult = arr;
            //     handelDepositResult()                
            // }, function (reason) {
            //     Modal.warning({
            //         title : '오류가 발생되었습니다. 재시도해주세요.',
            //     });  
            // });
        }else{
            Modal.warning({
                title : '데이터를 가져올 파일을 올려주세요.',
            });  

        }
    }

    const loadGrid = (grid, file)=>{
        let reader = new FileReader();
    
        reader.onload = function (e) {
            let _workbook = new wjcXlsx.Workbook(); // workbook 인스턴스 생성
            _workbook.loadAsync(reader.result, (workbook) => {
                let sheet = workbook.sheets[0];
                let excelRow = sheet.rows[0];
                let count = 0;
                for (let i = 0; i < grid.columns.length; i++) {
                    if (excelRow.cells[i].value === grid.columns[i].header) { // 헤더 체크
                        count++;
                    }
                }
                if (count === grid.columns.length) { 
                    var arr = []
                    workbook.sheets[0].rows.forEach((e,index) => {
                        if(index > 0){
                            arr = [...arr, {bank_name: e.cells[0].value, account_no : e.cells[1].value, total_amount : e.cells[2].value, depositor : e.cells[3].value, deposit_code : e.cells[4].value}]
                        }
                    });
                    state.depositResult = arr;
                    handelDepositResult()   

                } else {
                    var key = 'depositResultError'
                    message.warning({ content: '입금파일 엑셀로 입금 결과 등록이 가능합니다. ', key});       
                }
            
            });
        };
        reader.readAsDataURL(file);
    }

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["billing_code", "name", "company", "current_unit", "sum_total_amount", "accountable.name", "billed_at", "billed_info.name", "payment_approver1_info.name", "payment_approval1_at", "payment_approver2_info.name", "payment_approval2_at", "payment_status" ];
    };

    return (
        <Wrapper>
            <Row className="topTableInfo">
                <Col span={16}>
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
                <Col span={8} className="topTable_right">
                    {/* 체크했을때 승인버튼은 재무팀장,경영지원본부장만 보임 */}
                    {/* {state.adminChk === true &&  */}
                    {/* {(state.userInfo.team === '64' || state.userInfo.team === '5') &&  */}
                        <Button onClick={showApprovalModal} disabled={approvalsChk}>승인</Button>
                    {/* } */}
                    {type == '1' &&
                        <>
                        {/* 체크했을때 수정권한인 사람만 보임 */}
                        <Button style={{marginLeft: 10}} onClick={(e)=>excelDown()}>입금 파일 생성</Button> 
                        {/* <><Button style={{marginLeft: 10}} onClick={(e)=>excelDown()} disabled={depositResultChk}>입금 파일 생성</Button> */}

                        {/* 수정권한 있는 사람 항상보임 */}
                        {/* <Button style={{margin: 0, marginLeft: 10}} onClick={(e)=>setImportModalOpen(true)} disabled={depositResultChk}>입금 결과 등록</Button> */}
                        <Button style={{margin: 0, marginLeft: 10}} onClick={(e)=>importModalChk()} >입금 결과 등록</Button> </>
                    }                    
                </Col>
            </Row>

            <Row id='gridWrap' className='gridWrap' ref={tabRef}>
                {type === '1' ? 
                    <FlexGrid
                        ref={theGrid}
                        itemsSource={state.list}
                        isReadOnly={true}
                        stickyHeaders={true}
                        allowMerging="ColumnHeaders"
                        initialized={(s) => initGrid(s)}
                        autoRowHeights={true}
                    >
                        <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                        <FlexGridColumn binding="billing_code" header="청구서 코드" width={110} isReadOnly={true}/>
                        <FlexGridColumn binding="name" header="제목" minWidth={200} width={'*'} isReadOnly={true}/>
                        <FlexGridColumn binding="company" header="회사" width={70} isReadOnly={true}/>
                        <FlexGridColumn binding="current_unit" header="통화 단위" width={80} isReadOnly={true}/>
                        <FlexGridColumn binding="sum_total_amount" header="합계\n(부가세 포함)" width={100} align="right" isReadOnly={true}/>
                        <FlexGridColumn binding="accountable.name" header="거래처명" width={180} isReadOnly={true}/>
                        <FlexGridColumn binding="billed_at" header="청구일" width={100} isReadOnly={true}/>
                        <FlexGridColumn binding="billed_info.name" header="청구자" width={80} isReadOnly={true}/>
                        <FlexGridColumn binding="payment_approver1_info.name" header="승인자" width={80} isReadOnly={true}/>
                        <FlexGridColumn binding="payment_approval1_at" header="승인일" width={100} isReadOnly={true}/>
                        <FlexGridColumn binding="payment_approver2_info.name" header="승인자" width={80} isReadOnly={true}/>
                        <FlexGridColumn binding="payment_approval2_at" header="승인일" width={100} isReadOnly={true}/>
                        <FlexGridColumn binding="payment_status" header="처리 상태" width={110} isReadOnly={true}/>
                    </FlexGrid>
                :
                    <FlexGrid
                        ref={theGrid}
                        itemsSource={state.list}
                        isReadOnly={true}
                        stickyHeaders={true}
                        allowMerging="ColumnHeaders"
                        initialized={(s) => initGrid(s)}
                    >
                        <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                        <FlexGridColumn binding="billing_code" header="청구서 코드" width={110} isReadOnly={true}/>
                        <FlexGridColumn binding="name" header="제목" minWidth={200} width={'*'} isReadOnly={true}/>
                        <FlexGridColumn binding="company" header="회사" width={70} isReadOnly={true}/>
                        <FlexGridColumn binding="current_unit" header="통화 단위" width={80} isReadOnly={true}/>
                        <FlexGridColumn binding="sum_total_amount" header="합계" width={80} align="right" isReadOnly={true}/>
                        <FlexGridColumn binding="accountable.name" header="거래처명" width={180} isReadOnly={true}/>
                        <FlexGridColumn binding="billed_at" header="청구일" width={100} isReadOnly={true}/>
                        <FlexGridColumn binding="billed_info.name" header="청구자" width={80} isReadOnly={true}/>                        
                        <FlexGridColumn binding="payment_approver1_info.name" header="승인자" width={80} isReadOnly={true}/>
                        <FlexGridColumn binding="payment_approval1_at" header="승인일" width={100} isReadOnly={true}/>
                        <FlexGridColumn binding="payment_approver2_info.name" header="승인자" width={80} isReadOnly={true}/>
                        <FlexGridColumn binding="payment_approval2_at" header="승인일" width={100} isReadOnly={true}/>
                        <FlexGridColumn binding="payment_status" header="처리 상태" width={110} isReadOnly={true}/>
                    </FlexGrid>
                }
                <div className="panelWrap">
                    <FlexLayout.Layout model={state.model}  factory={factory.bind(this)}/>
                </div>
            </Row>

            <Row gutter={10} className="table table_bot">
                <Col xs={24} lg={16}>
                    <div className="btn-group">
                        <Pagination defaultCurrent={1} defaultPageSize={state.pageArr.pageCnt} current={state.pageArr.page} total={state.total} onChange={pageChange}/>
                        <span style={{marginLeft: 20}}>행 개수 : {state.total}</span>
                    </div>
                </Col>
                <Excel />
            </Row>

            <div id="tplBtnViewMode">
                <div className="btnLayoutWrap">
                    <button id="btnDivide" className="btn-layout ant-btn ant-btn-circle" >D</button>
                    <button id="btnNew" className="btn-layout ant-btn ant-btn-circle" >N</button>
                </div>
            </div>

            {viewVisible === true && (
                <ViewInfo 
                    // idx={state.idx}
                    // viewVisible={viewVisible}
                    // popoutChk='N'
                    // drawerChk='Y'
                    // onClose={viewOnClose}
                    
                    idx={state.idx}
                    viewVisible={viewVisible}
                    popoutChk='N'
                    drawerChk='Y'
                    onClose={viewOnClose}
                    drawerResetChk={drawerReset}
                    typeChk='payments'
                    typeChkType ={type}
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

            {/* 입금승인 테이블 */}
            <FlexGrid
                isReadOnly={true}
                selectionMode="Row"
                initialized={initializeGrid}
                itemsSource={state.chkCellData}
                style={{display:'none'}}
            >
                <FlexGridColumn binding="bank_name" header="은행명" width={150}/>
                <FlexGridColumn binding="account_no" header="계좌번호" width={150}/>
                <FlexGridColumn binding="total_amount" header="금액" width={150} align="right"/>
                <FlexGridColumn binding="depositor" header="예금주" width={150}/>
                <FlexGridColumn binding="deposit_code" header="입금 관리 코드" width={150}/>           
            </FlexGrid>


            <Modal title="입금 승인" visible={approvalModalOpen} onOk={approvalHandleOk} onCancel={approvalHandleCancel} footer={[
                <Button type="primary" onClick={(e)=>approvalApiSubmit()}>확인</Button>
            ]}>
                <Radio.Group name="approval_flag" onChange={approvaOnChange} value={state.approval_flag}>
                    <Radio value='1' style={{marginRight: 30}}>담당 단계만 승인</Radio>
                    <Radio value='2'>1, 2차 모두 승인</Radio>
                </Radio.Group>
            </Modal>

            <Modal title="입금 결과 등록" visible={importModalOpen} onOk={importHandleOk} onCancel={importHandleCancel} 
                footer={loading === true ? null : [              
                    <Button type="primary" onClick={(e)=>load()} style={importChk === true ? {display:'none'} : {display:'inline-block'}}>확인</Button>
                ]}>
                {loading === true ? 
                    (
                        <p>처리 중입니다. 잠시 기다려 주세요<br />끝나면 리스트에 바로 반영됩니다..</p>
                    ) : state.depositResultError.length > 0 ?
                    (
                        <p>아래 행은 오류로 처리하지 못했습니다.<br />오류 입금관리코드: {state.depositResultError}</p>
                    )                    
                    : (
                        <input type="file" className="form-control"  id="importFile" 
                        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel.sheet.macroEnabled.12"/>
                    )               
                }
            </Modal>


        </Wrapper>
    )
}

export default observer(BillingPayments);