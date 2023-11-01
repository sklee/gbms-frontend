import React, {useCallback, useState, useEffect} from 'react';
import {Row, Col, Button, Modal, message, Radio, Input, Pagination} from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { Selector } from "@grapecity/wijmo.grid.selector";
import { CollectionView } from "@grapecity/wijmo";
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjcCore from "@grapecity/wijmo";
import * as wjcGridXlsx from '@grapecity/wijmo.grid.xlsx';
import * as wjInputC from '@grapecity/wijmo.react.input';
import useStore from '@stores/useStore';
import Excel from '@components/Common/Excel';

import { toJS } from 'mobx';
import moment from 'moment';

import { InputDate, InputTime, ComboBox, AutoComplete, MultiAutoComplete } from '@grapecity/wijmo.input';

const Wrapper = styled.div`
    width: 100%;
    #tplBtnViewModeUser, #tplBtnEditModeUser {display:none}
`;

const billingUsers  = observer(({tab})=>{
    const { commonStore } = useStore();
    const { Search } = Input;
    const [pageRegist, setPageRegist] = useState(false)

    const state = useLocalStore(() => ({
        list: [],
        data:[],
        addBtn: true,
        currentEditItem : null,
        selector:'',
        flex:'',

        total: 0,
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },

        yearOption : Array.from({ length: new Date().getFullYear() - 2020 }, (_, index) => {
            return {value : (new Date().getFullYear() - index).toString(), label : (new Date().getFullYear() - index).toString() + '년'}
        }).reverse(),
        monthOption : Array.from({ length: 12 }, (_, index) => {
            return {value : (index + 1).toString(), label : (index + 1).toString() + '월'}
        }),
        
        year : '',
        month : '',
        billingDate : '',   //최종등록년월
        billingDateChk : false,

        memberOption : [], //사용자
        selectorId : [], //체크 아이디값
        selectorIdChk : 0, //체크 처리상태값
        approval_flag : '', //입금 승인 radio

        deposit_file:[],
        name : '',

        userInfo : '',      //로그인정보
        chkCellData : [],   //입금생성파일 데이터    

        selectorId : [], //체크 아이디값
        selectorIdChk : 0, //체크 처리상태값 확인

        selectorIdChk: 0 ,   //승인대기 체크
        approval_flag : '', //입금 승인 radio
        chkFile : 0, //입금파일생성 조건 체크

        grid : '',  //입금승인파일생성 grid
        depositResult : [], //입금결과등록데이터
        depositResultError : [], //입금결과등록중 오류데이터

        importChk : false
    }));

    useEffect(()=>{
        state.userInfo = commonStore.user
        if(tab == 'billingUsers'){
            //초기화
            chkBillingData().then(()=>{
                fetchData('')
            })   
            memberData();
            state.deposit_file=[]
        } 
    },[]);

    const fetchData = useCallback(async (val, type) => {        
        if (val == '' || val == '0' || val == undefined) {
            var page = 1;
        } else {
            var page = val;
        }

        const result = await commonStore.handleApi({
            url: '/billing-payment-users',
            data:{
                display:state.pageArr.pageCnt,
                page:page,
                sort_by:'date',
                order:'desc',
                req_ym : state.billingDate
            }
        });
        result.data.map((e, number) => {
            // e.cnt = str_no - number;               
            if(e.payment_at){
                e.payment_at = e.payment_at.substring(0,10);           
            }
            if(e.payment_approval1_at){
                e.payment_approval1_at = e.payment_approval1_at.substring(0,10);           
            }
            if(e.payment_approval2_at){
                e.payment_approval2_at = e.payment_approval2_at.substring(0,10);           
            }
            e.total_amount = Number(e.total_amount);
            e.fuel_cost = Number(e.fuel_cost);
            e.communication_cost = Number(e.communication_cost);
            e.vehicle_maintenance_cost = Number(e.vehicle_maintenance_cost);

        });
        setList(result.data);
        state.list = result.data;
        state.total = result.meta.total;
        state.pageArr.page = result.meta.current_page;
        state.pageArr.pageCnt = result.meta.per_page;
    }, []);

    const chkBillingData = useCallback(async () => {
        const result = await commonStore.handleApi({
            url: '/max-billing-payment-users',
        });
        // state.billingDate = result.year + '-' + result.month;
        state.billingDate = formatYearMonth(result.year,result.month)
        state.billingDateChk = state.billingDate < moment().format('YYYY-MM') ? false : true
        state.year = result.year
        state.month = result.month
    }, []);
    
    const memberData = useCallback(async () => {
        const result = await commonStore.handleApi({
            url: '/users',
            data:{
                display:500,
                page:1,
                sort_by:'date',
                order:'desc'
            }
        });
        if (result.success === false) {
            Modal.error({
                title: '오류가 발생했습니다.',
                content: '오류코드:' + result.message,
            });
        }else{                 
            state.memberOption = result.data;
            var depth1 = [{id:'', name:'선택해주세요.'}]    
            state.memberOption = depth1.concat(toJS(state.memberOption))
        }
    }, []);

    //페이징 데이터
    const pageChange = (num)=>{
        fetchData(num,'','');
    }

    function formatYearMonth(year, month) {
        const formattedYear = String(year);
        const formattedMonth = String(month).padStart(2, '0');
        return `${formattedYear}-${formattedMonth}`;
    }

    //승인정보 로그인체크
    const [approvalsChk,setApprovals] = useState(true);
    //입금생성 로그인체크
    const [depositResultChk,setDepositResultChk] = useState(false);

    const initGrid = (grid) => {
        state.flex= grid;

        state.selector = new Selector(grid, {
            itemChecked: (s, e) => {
                var selectedItem = grid.rows.filter(r => r.isSelected)
                if(state.deposit_file.length > 0){                 
                    if(selectedItem.length === 0){
                        if(state.userInfo.email === 'tori86@gilbut.co.kr' || state.userInfo.email === 'wlgp519@gilbut.co.kr' || state.userInfo.email === 'wproh@gilbut.co.kr' ){
                            setApprovals(true)
                        }
                        //입금생성 수정권한 확인후
                        //setDepositResultChk(true)
                    }else{
                        //승인
                        if(state.userInfo.email === 'tori86@gilbut.co.kr' || state.userInfo.email === 'wlgp519@gilbut.co.kr' || state.userInfo.email === 'wproh@gilbut.co.kr' ){
                            setApprovals(false)
                        }
                        //입금생성 수정권한 확인후
                        //setDepositResultChk(false)

                        //승인
                        var chk = 0;                    
                        var arr = [];                    
                        selectedItem.forEach(e => {
                            if(e.dataItem.payment_status !== '승인 대기' && e.dataItem.payment_status !== '1차 승인 대기' && e.dataItem.payment_status !== '2차 승인 대기'){
                                chk++                    
                            }else{                       
                                arr = [...arr,e.dataItem.deposit_file.payment_id]  
                            }
                        }); 
                        state.selectorIdChk = chk;                    
                        state.selectorId = arr;
                    }    
                }

                //입금생성
                var chkFile = 0;
                var arr2 = [];
                selectedItem.forEach(e => {
                    if(e.dataItem.payment_status !== '입금 대기' && e.dataItem.payment_status !== '부분 입금'){
                            chkFile++                   
                    }else{               
                        e.dataItem.deposit_file.total_amount = e.dataItem.total_amount        
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
            }
        });
      

        let extraRow = new wjGrid.Row();
        extraRow.allowMerging = true;
        
        var panel = grid.columnHeaders;
        panel.rows.splice(0, 0, extraRow);

        state.selector._col.allowMerging = true;
        state.selector._col._cssClassAll = "chkAll";

        for (let colIndex = 0; colIndex <= 13; colIndex++) {
            if(colIndex >= 7 && colIndex <= 8){ 
                panel.setCellData(0, colIndex, '1차 승인');
            } else if(colIndex >= 9 && colIndex <= 10) {
                panel.setCellData(0, colIndex, '2차 승인');
            } else {
                let col = grid.getColumn(colIndex);
                col.allowMerging = true;
                panel.setCellData(0, colIndex, col.header);
            }            
        };

        grid.formatItem.addHandler(function (s, e) {
            // center-align merged header cells
            if (e.panel == s.columnHeaders && e.range.rowSpan > 1) {
                var html = e.cell.innerHTML;
                e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
            }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                    
                if (item == state.currentEditItem && !state.currentEditItem.id) {
                    switch(col.binding){
                        case 'communication_cost':
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'"'+'value="66000" />';
                            e.cell['dataItem'] = item;
                            break;
                        case 'vehicle_maintenance_cost':
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'"'+'value="350000" />';
                            e.cell['dataItem'] = item;
                            break;
                        case 'fuel_cost':
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'"'+'value="200000" />';
                            e.cell['dataItem'] = item;
                            break;
                        case 'total_amount':
                            e.cell['dataItem'] = item;
                            break;
                        case 'status':
                            let btn = '<button id="btnOK" class="btnText blueTxt" style={{marginRight:"5px"}}>확인</button>';
                            btn += '<button id="btnCancel" class="btnText redTxt">삭제</button>';
                            e.cell.innerHTML = btn;
                            e.cell['dataItem'] = item;
                            break;
                        default :
                            e.cell['dataItem'] = item;
                            break;
                    }
                } else if (state.currentEditItem && item?.id == state.currentEditItem?.id) {
                    switch(col.binding){
                        case 'communication_cost':
                        case 'vehicle_maintenance_cost':
                        case 'fuel_cost':
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'"'+'value="'+s.getCellData(e.row, e.col, true)+'" />';
                            e.cell['dataItem'] = item;
                            break;
                        case 'total_amount':
                            e.cell['dataItem'] = item;
                            break;
                        case 'status':
                            let btn = '<button id="btnOK" class="btnText blueTxt" style={{marginRight:"5px"}}>확인</button>';
                            btn += '<button id="btnCancel" class="btnText redTxt">취소</button>';
                            e.cell.innerHTML = btn;
                            e.cell['dataItem'] = item;
                            break;
                        default :
                            e.cell['dataItem'] = item;
                            break;
                    }
                } else {
                    switch(col.binding){
                        case 'communication_cost':
                            e.cell['dataItem'] = item;
                            break;
                        case 'vehicle_maintenance_cost':
                            e.cell['dataItem'] = item;
                            break;
                        case 'fuel_cost':
                            e.cell['dataItem'] = item;
                            break;
                        case 'total_amount':
                            e.cell['dataItem'] = item;
                            break;
                        case 'status':
                            let btn = '<button id="btnEdit" class="btnText blueTxt">수정</button><button id="btnDel" class="btnText redTxt">삭제</button>'
                            e.cell.innerHTML = btn;
                            e.cell['dataItem'] = item;
                            break;
                        default :
                            e.cell['dataItem'] = item;
                            break;
                    }
                }
            }

        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                // get button's data item
                let item = wjcCore.closest(e.target, '.wj-cell')['dataItem'];
                // handle buttons
                switch (e.target.id) {
                    // start editing this item
                    case 'btnOK':
                        commitEdit(item.id);
                        break;
                    case 'btnEdit':
                        editItem(item);
                        break;
                    case 'btnCancel':
                        cancelEdit();
                        break;
                    case 'btnDel':
                        // delItem(item);
                        (grid.collectionView).remove(item);
                        removeItem(item)
                        break;
                       
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'change', (e) => {
            if (e.target instanceof HTMLInputElement) {
                if(state.currentEditItem){
                    state.currentEditItem[e.target.id] = parseInt(e.target.value.replace(/,/g, ''))
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'keyup',(e)=>{
            let item = wjcCore.closest(e.target, '.wj-cell')['dataItem'];

            if(grid.activeEditor){
                var value=grid.activeEditor.value;
                var numChk = /[^\,0-9]/g;

                if(grid.columns[grid.editRange.col].binding ==="communication_cost" ){ 
                    if(numChk.test(value)){
                        message.warning('숫자만 입력 가능합니다.');
                        e.srcElement.value = 0;
                    }
                    
                    item.communication_cost = Number(e.srcElement.value)
                    item.total_amount = Number(e.srcElement.value)+item.vehicle_maintenance_cost+item.fuel_cost;
                }

                if(grid.columns[grid.editRange.col].binding ==="vehicle_maintenance_cost" ){ 
                    if(numChk.test(value)){
                        message.warning('숫자만 입력 가능합니다.');
                        e.srcElement.value = 0;
                    }
                    item.vehicle_maintenance_cost = Number(e.srcElement.value)
                    item.total_amount = Number(e.srcElement.value)+item.communication_cost+item.fuel_cost;
                }

                if(grid.columns[grid.editRange.col].binding ==="fuel_cost" ){ 
                    if(numChk.test(value)){
                        message.warning('숫자만 입력 가능합니다.');
                        e.srcElement.value = 0;
                    }
                    item.fuel_cost = Number(e.srcElement.value)
                    item.total_amount = Number(e.srcElement.value)+item.communication_cost+item.vehicle_maintenance_cost;
                }

                // dataChange(item)
            }
        },true);       
        

        // 특정 열의 셀에 콤보박스를 추가하는 코드
        grid.itemFormatter = (panel, r, c, cell) => {
            if (panel.cellType == wjGrid.CellType.Cell) {
                let col = panel.columns[c];
                let dataItem = panel.rows[r].dataItem;
                // select 열에 콤보박스 삽입
                if (col.binding === "user_name") {
                    if(state.currentEditItem !== '' && state.currentEditItem !== null && 
                    ((state.currentEditItem.id===''&&dataItem.id===''&&state.currentEditItem.user_id ===dataItem.user_id))) {
                        createList(cell, r, c);
                    }
                }
            }
        };

        // grid.collectionView
        // grid.itemsSource
    };

    const initGridViews = (grid) => {
        state.flex= grid;
        console.log('initGridViews')
        
        var panel = grid.columnHeaders;

        for (let colIndex = 0; colIndex <= 12; colIndex++) {
            if(colIndex >= 7 && colIndex <= 8){ 
                panel.setCellData(0, colIndex, '1차 승인');
            } else if(colIndex >= 9 && colIndex <= 10) {
                panel.setCellData(0, colIndex, '2차 승인');
            } else {
                let col = grid.getColumn(colIndex);
                col.allowMerging = true;
                panel.setCellData(0, colIndex, col.header);
            }            
        };

        grid.formatItem.addHandler(function (s, e) {
            // center-align merged header cells
            if (e.panel == s.columnHeaders && e.range.rowSpan > 1) {
                var html = e.cell.innerHTML;
                e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
            }

        });

    };

    // 콤보 박스 리스트 생성
    const createList=(cell, r, c)=> {        
        let combo = new AutoComplete(document.createElement("div"), {
            itemsSource: toJS(state.memberOption),
            selectedValuePath: "id",
            displayMemberPath: "name",
            selectedValue:state.flex.selectedItems[0]?.user_id,
            beginsWithSearch:true,
            minLength:1, // 자동완성 제안을 트리거할 최소 입력 길이 가져오거나 설정
            textChanged: (s, e) => {
                var memData = state.memberOption.find(e=> e.id === s.selectedValue);
                if(memData && s.selectedValue !== null && s.selectedValue !== undefined){    
                    state.flex.setCellData(r,c+1,memData.company); // 값 설정하기                               
                    state.flex.setCellData(r,c+2,memData.department); // 값 설정하기
                    state.flex.selectedItems.forEach(e => {
                        e.user_id = memData.id
                    });
                    state.currentEditItem.user_name = memData.name
                    state.currentEditItem.user_id = memData.id
                    state.name = memData.name
                }else{
                    state.currentEditItem.user_name = ''
                    state.currentEditItem.user_id = ''
                }
            }
        });
        // 셀에 첫번째 콤보박스 추가
        cell.innerHTML = '';
        cell.appendChild(combo.hostElement);
        // 리스트에 첫번째 콤보박스 추가
        // dataItem.list = [combo];
    }

    //취소버튼
    const cancelEdit = () => {
        if(state.currentEditItem.rowAdd){ //행추가 취소시 행 삭제
            state.flex.collectionView.remove(state.currentEditItem);
        }
        state.addBtn = true;
        state.currentEditItem = null;
        state.flex.invalidate();
        state.flex.collectionView.refresh();
    }
    //확인 버튼 확인
    const commitEdit=(id)=> {
        if(state.currentEditItem.user_name === ''){
            Modal.error({
                content: '성명을 선택해주세요.',        
            });
            return; 
        }
        if(state.data.length > 0){
            var chk = true;
            state.data.forEach((e) => {    
                //기존 배열에 들어간 user_id와 같으면 값 수정
                if(e.id){
                    if(e.id === state.currentEditItem.id){
                        console.log('modify id',state.currentEditItem)
                        e.id= state.currentEditItem.id;
                        e.user_id= state.currentEditItem.user_id;
                        e.communication_cost= state.currentEditItem.communication_cost;
                        e.vehicle_maintenance_cost= state.currentEditItem.vehicle_maintenance_cost;
                        e.fuel_cost= state.currentEditItem.fuel_cost;
                        chk = false;
                    }
                }else{
                    if(e.user_id === state.currentEditItem.user_id){
                        console.log('modify',state.currentEditItem)
                        e.user_id= state.currentEditItem.user_id;
                        e.communication_cost= state.currentEditItem.communication_cost;
                        e.vehicle_maintenance_cost= state.currentEditItem.vehicle_maintenance_cost;
                        e.fuel_cost= state.currentEditItem.fuel_cost;
                        chk = false;
                    }
                }
            })
            if(chk === true){
                console.log('insert add',state.currentEditItem);
                state.data = [...state.data, state.currentEditItem];
            }
        }else{
            console.log('insert new',state.currentEditItem);
            state.data = [...state.data , state.currentEditItem];
        }
        setList((prevList) => {
            let newList = [...prevList];
            for(let idx in newList){
                if (newList[idx].id == id){
                    newList[idx]['communication_cost'] = Number(state.currentEditItem.communication_cost);
                    newList[idx]['vehicle_maintenance_cost'] = Number(state.currentEditItem.vehicle_maintenance_cost);
                    newList[idx]['fuel_cost'] = Number(state.currentEditItem.fuel_cost);
                    newList[idx]['rowAdd'] = state.currentEditItem.rowAdd;
                    newList[idx]['editType'] = state.currentEditItem.editType;
                }
            }
            return newList;
        });
        state.currentEditItem = null;
        state.name = '';
        state.flex.invalidate();
        state.flex.collectionView.refresh();
        state.addBtn = true;
        state.list = [];
    }

    //추가 버튼 
    const rowAdd=(e)=>{    
        if(e === true){ //행추가일때            
            //inti value
            state.currentEditItem = {
                id: "",
                user_id : '',
                user_name : '',
                department : '',
                part : '',
                team : '',
                communication_cost: 66000,
                fuel_cost: 200000,        
                total_amount: 0,
                vehicle_maintenance_cost: 350000 ,      
                payment_approval1_at: '',
                payment_approval2_at: '',
                payment_approver1_id:"",
                payment_approver1_name: "",
                payment_approver2_id: "",
                payment_approver2_name: "",
                payment_status: "승인 대기",
                rowAdd : true,
                editType : 'add'
            }

            var view = new CollectionView(list)

            view.sourceCollection.splice(0 ,0,state.currentEditItem); //값 삽입
            state.flex.collectionView.refresh(state.currentEditItem); // 삽입된 값 그리드에 반영         

            state.addBtn = false;  
        }else{ //행추가를 취소할때
            state.flex.collectionView.remove(state.currentEditItem);
            state.currentEditItem = null;
            state.addBtn = true;
            state.flex.invalidate();
            state.flex.collectionView.refresh();
        }
    }

    //수정 버튼 
    const editItem = (item) => {
        state.currentEditItem = item;
        state.currentEditItem['rowAdd'] = true;
        if(!state.currentEditItem.editItem){
            state.currentEditItem['editType'] = 'edit'
        }
        state.flex.invalidate();
        state.flex.collectionView.refresh();
    }

    const removeItem = (item) => {
        console.log('remove',item)
        if(item.rowAdd){
            if(item.editType && item.editType==='add'){
                // state.data = state.data.filter(e=>e.editType==='add'&&e.user_id !== item.user_id)
                state.data = state.data.filter(e=>e.editType!=='add'||(e.editType==='add'&&e.user_id !== item.user_id))
            }else{
                const tempData = state.data.map(sub=>{
                    if(sub.id===item.id){
                        return {...sub,use_yn : 'N'}
                    }
                    return sub
                })
                
                state.data = [...tempData]
            }
        }else{
            state.data = [...state.data,{id:item.id,use_yn:'N'}]
        }
        console.log(toJS(state.data))
        state.flex.invalidate();
        state.flex.collectionView.refresh();
    }

    const handleChange = useCallback((type) => (e) => {
        if(type==='year'){
            state.year = e.selectedValue
        }else if(type==='month'){
            state.month = e.selectedValue
        }
        // state.billingDate = state.year+'-'+state.month
        state.billingDate = formatYearMonth(state.year,state.month)
        state.billingDateChk = state.billingDate < moment().format('YYYY-MM') ? false : true
        if(state.year && state.month){
            fetchData()
        }
    },[])

    const [list ,setList] = useState([])

    const handleCancel=()=>{
        state.data = [];
        fetchData();
    }
    
     //승인 모달
    const [approvalModalOpen, setApprovalModalOpen] = useState(false);   
    const showApprovalModal = () => {
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
                    content: "처리상태가 '승인대기'인 것만 선택해주세요.",        
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
        state.approval_flag = e.target.value
    };
    //승인 값
    const approvalApiSubmit = useCallback(async (val)=> {
        var axios = require('axios');
        if(state.approval_flag === ''){
        message.warning('입금승인을 선택해주세요.');
        }else{
            var data = {payment_id: toJS(state.selectorId), approval_flag : state.approval_flag }

            commonStore.handleApi({
                url: '/deposit-result-users',
                method: 'POST',
                data:data
            }).then((result)=>{
                if(result.success != false){
                    setApprovalModalOpen(false);
                    setApprovals(true)
                    state.deposit_file=[];
                    state.flex.rows.forEach((r) => {
                        if (r.isSelected === false) {
                            r.isSelected = false;
                        }else{
                            r.isSelected = false;
                        }
                    });
                    Modal.success({
                        title: result.result,
                        onOk(){
                            state.list.forEach(e => {
                                e.payment_approver1_id = state.userInfo.id
                                e.payment_approver1_name =state.userInfo.name
                                e.payment_approval1_at= moment().format('YYYY-MM-DD');
                                e.payment_approver2_id =state.userInfo.id
                                e.payment_approver2_name =state.userInfo.name
                                e.payment_approval2_at= moment().format('YYYY-MM-DD');
                                e.payment_status= '입금 대기';
                            });
                            setList(state.list)
                            state.flex.itemsSource = state.list 
                            state.flex.collectionView.refresh();
    
                            // fetchData()
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
                                    <p>오류코드: {result.message}</p>
                                </div>)
                    });  
                }
            })
        }       
    })   

    const [importModalOpen, setImportModalOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const showImportModal = () => {
        setImportModalOpen(true);
    };
    const importHandleOk = () => {
        setImportModalOpen(false);
    };
    const importHandleCancel = () => {
    state.importChk = false
    setImportModalOpen(false);
    setLoading(false)
    };

    const initializeGrid=(flex)=> {
    state.grid = flex;
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

                wjcGridXlsx.FlexGridXlsxConverter.saveAsync(state.grid, {
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
            var data = toJS(state.depositResult);
            setLoading(true)

            commonStore.handleApi({
                url: '/deposit-result-users',
                method: 'POST',
                data:data
            }).then((result)=>{
                setLoading(false)
                console.log(result)
                var chk = 0;
                var arr = []
                result.status.forEach(e => {
                    if(e.status === 'FAIL'){
                        arr = [...arr,e.deposit_code]
                        chk++;
                    }
                    state.depositResultError = arr.join(',')
                });
                if(chk === 0){
                    setImportModalOpen(false)
                    fetchData();
                }else{
                    state.importChk = true
                }
            })
        }       
    })

    const load=()=> {
        let fileInput = document.getElementById('importFile');

        if (fileInput.files[0]) {
            wjcGridXlsx.FlexGridXlsxConverter.loadAsync(state.grid, fileInput.files[0], null, function (workbook) {
                // var app = worksheet.application ;
                var arr = [];
            
                workbook.sheets[0].rows.forEach((e,index) => {
                    if(index > 0){
                    arr = [...arr, {bank_name: e.cells[0].value, account_no : e.cells[1].value, total_amount : String(e.cells[2].value).replace(/,/g, ""), depositor : e.cells[3].value, deposit_code : e.cells[4].value}]
                    }
                });
                state.depositResult = arr;
                handelDepositResult()
            }, function (reason) {
                console.log('err',reason)
                Modal.warning({
                    title : '오류가 발생되었습니다. 재시도해주세요.',
                });  
            });
        }else{
            Modal.warning({
                title : '데이터를 가져올 파일을 올려주세요.',
            });  
        }
    }
    
    //등록
    const handleSubmit = useCallback(async ()=> {
        if(state.addBtn === false){
            Modal.warning({
                title : '추가중인 내용이 있습니다.',
                content : '완료 후 확인 버튼을 눌러주세요.'
            });  
        }else{
                var data = [];

                const submitList = ['id','user_id','communication_cost','vehicle_maintenance_cost','fuel_cost']

                const returnData = toJS(state.data).map(items=>{
                    const returnItem = {}
                    submitList.forEach(e=>{
                        returnItem[e] = items[e]
                    })
                    if(items.use_yn === 'N'){
                        returnItem['use_yn'] = 'N'
                    }
                    return returnItem
                })

                // console.log(toJS(returnData))
                // return

                commonStore.handleApi({
                    url: '/billing-payment-users',
                    method: 'POST',
                    data:returnData
                }).then((result)=>{
                    if(result.success != false){
                        Modal.success({
                            title: '정보가 등록되었습니다.',
                            onOk(){
                                state.deposit_file = result.deposit_file
                                state.list.forEach(e => {
                                    result.deposit_file.forEach(a => {
                                        if(e.user_id === a.user_id){
                                            e.deposit_file = a
                                        }                                        
                                    })
                                })
                                setList(state.list)
                                state.flex.itemsSource = state.list
                                state.flex.collectionView.refresh()
                            },
                        })
                    }else{
                        Modal.error({
                            content:(<div>
                                        <p>등록시 문제가 발생하였습니다.</p>
                                        <p>재시도해주세요.</p>
                                        <p>오류코드: {result.message}</p>
                                    </div>)
                        });  
                    }
                })
        }
       
    }, []);

    //검색
    const handleSearch = (data) => {
        console.log(data)
        fetchData(state.pageArr.page, data)
    }

    //보기 <> 수정 페이지 분리 및 handleapi 적용 230630
    return (
        <Wrapper>
            <Row className="topTableInfo" >
                <Col span={4}>
                    <Search
                        placeholder="검색어 입력"
                        onSearch={handleSearch}
                        enterButton
                        allowClear
                        style={{width: 200 }}
                    />
                </Col>
                <Col span={20} className="topTable_right">
                    <wjInputC.ComboBox
                        placeholder="선택"
                        itemsSource={new CollectionView(state.yearOption, {
                            currentItem: null
                        })}
                        selectedValuePath="value"
                        displayMemberPath="label"
                        valueMemberPath="value"
                        selectedValue={state.year}
                        textChanged={handleChange('year')}
                        style={{ width: 120 }}
                    />
                    <wjInputC.ComboBox
                        placeholder="선택"
                        itemsSource={new CollectionView(state.monthOption, {
                            currentItem: null
                        })}
                        selectedValuePath="value"
                        displayMemberPath="label"
                        valueMemberPath="value"
                        selectedValue={state.month}
                        textChanged={handleChange('month')}
                        style={{ width: 120, margin: '0 10px' }}
                    />
                    {pageRegist &&
                    <>
                    {/* 체크했을때 승인버튼은 재무팀장,경영지원본부장만 보임 */}
                    <Button onClick={showApprovalModal} disabled={approvalsChk}>승인</Button>
                    {/* 체크했을때 수정권한인 사람만 보임 */}
                    <Button style={{marginLeft: 10}} onClick={(e)=>excelDown()}>입금 파일 생성</Button> 
                    {/* 수정권한 있는 사람 항상보임 */}
                    <Button style={{margin: 0, marginLeft: 10}} onClick={(e)=>setImportModalOpen(true)} >입금 결과 등록</Button> 
                    </>
                    }
                    {pageRegist ?
                    <Button className="btn btn-primary btn_add" shape="circle" onClick={(e) => {rowAdd(state.addBtn)}} style={{marginLeft: 10}}>
                        {state.addBtn === true ? '+' : '-'}
                    </Button>
                    :
                    <Button className="btn btn-primary btn_add" shape="circle" onClick={(e) => {setPageRegist(true);rowAdd(state.addBtn)}} style={{marginLeft: 10}}>
                        {state.addBtn === true ? '+' : '-'}
                    </Button>
                    }
                </Col>
            </Row>
            <Row className='gridWrap'>
                {pageRegist &&
                <FlexGrid
                    // itemsSource={state.list}
                    itemsSource={list}
                    initialized={(s) => initGrid(s)}
                    allowSorting={false}
                    headersVisibility="Column"
                    allowMerging="ColumnHeaders"
                    selectionMode="None"
                    newRowAtTop={true}
                    autoRowHeights={true}
                >
                    <FlexGridColumn header="성명" binding="user_name" width={70} isReadOnly={true}/>
                    <FlexGridColumn header="회사" binding="company" width={120} minWidth={80} isReadOnly={true}/>
                    <FlexGridColumn header="부서" binding="department" width="*" minWidth={120} isReadOnly={true}/>
                    <FlexGridColumn header="통신비" binding="communication_cost" align="right" width={90} format="n0"/>
                    <FlexGridColumn header="차량 유지비" binding="vehicle_maintenance_cost" align="right" width={90} format="n0"/>
                    <FlexGridColumn header="주유비" binding="fuel_cost" align="right" width={90} format="n0"/>
                    <FlexGridColumn header="합계" binding="total_amount" align="right" width={90} isReadOnly={true} format="n0"/>
                    <FlexGridColumn header="승인자" binding="payment_approver1_name" width={80} isReadOnly={true}/>
                    <FlexGridColumn header="승인일" binding="payment_approval1_at" width={100} isReadOnly={true}/>
                    <FlexGridColumn header="승인자" binding="payment_approver2_name" width={80} isReadOnly={true}/>
                    <FlexGridColumn header="승인일" binding="payment_approval2_at" width={100} isReadOnly={true}/>
                    <FlexGridColumn header="처리 상태" binding="payment_status" width={100} isReadOnly={true}/>
                    <FlexGridColumn header="입금일" binding="payment_at" width={100} isReadOnly={true}/>
                    <FlexGridColumn header="작업" binding="status" align="center" width={100} isReadOnly={true}/>
                </FlexGrid>
                }
                {!pageRegist &&
                <FlexGrid
                    // itemsSource={state.list}
                    itemsSource={list}
                    initialized={(s) => initGridViews(s)}
                    allowSorting={false}
                    headersVisibility="Column"
                    allowMerging="ColumnHeaders"
                    selectionMode="None"
                    newRowAtTop={true}
                    autoRowHeights={true}
                >
                    <FlexGridColumn header="성명" binding="user_name" width={70} isReadOnly={true}/>
                    <FlexGridColumn header="회사" binding="company" width={120} minWidth={80} isReadOnly={true}/>
                    <FlexGridColumn header="부서" binding="department" width="*" minWidth={120} isReadOnly={true}/>
                    <FlexGridColumn header="통신비" binding="communication_cost" align="right" width={100} format="n0"/>
                    <FlexGridColumn header="차량 유지비" binding="vehicle_maintenance_cost" align="right" width={100} format="n0"/>
                    <FlexGridColumn header="주유비" binding="fuel_cost" align="right" width={100} format="n0"/>
                    <FlexGridColumn header="합계" binding="total_amount" align="right" width={100} isReadOnly={true} format="n0"/>
                    <FlexGridColumn header="승인자" binding="payment_approver1_name" width={80} isReadOnly={true}/>
                    <FlexGridColumn header="승인일" binding="payment_approval1_at" width={100} isReadOnly={true}/>
                    <FlexGridColumn header="승인자" binding="payment_approver2_name" width={80} isReadOnly={true}/>
                    <FlexGridColumn header="승인일" binding="payment_approval2_at" width={100} isReadOnly={true}/>
                    <FlexGridColumn header="처리 상태" binding="payment_status" width={100} isReadOnly={true}/>
                    <FlexGridColumn header="입금일" binding="payment_at" width={100} isReadOnly={true}/>
                </FlexGrid>
                }
            </Row>

            <Row gutter={10} className="table table_bot">
                <Col xs={16} lg={16}>
                    <div className="btn-group">
                        <Pagination defaultCurrent={1} defaultPageSize={state.pageArr.pageCnt} current={state.pageArr.page} total={state.total} onChange={pageChange}/>
                        <span style={{marginLeft: 20}}>행 개수 : {state.total}</span>
                    </div>
                </Col>
                <Excel />
            </Row>
            {pageRegist &&
            <Row gutter={[10, 10]} justify="center" >
                <Col>
                    <Button type="primary" htmlType="button" onClick={(e)=>handleSubmit()}>확인</Button>
                    <Button htmlType="button" style={{ marginLeft: 10 }} onClick={()=>handleCancel()}>취소</Button>
                </Col>
            </Row>
            }

            {/* 입금승인 테이블 */}
            <FlexGrid
                alternatingRowStep={0}
                initialized={initializeGrid}
                itemsSource={state.chkCellData}
                allowSorting={false}
                style={{display:'none'}}
            >
                <FlexGridColumn binding="bank_name" header="은행명" width={150} align="center" />
                <FlexGridColumn binding="account_no" header="계좌번호" width={150} align="center"/>
                <FlexGridColumn binding="total_amount" header="금액" width={150} align="center"/>
                <FlexGridColumn binding="depositor" header="예금주" width={150} align="center"/>
                <FlexGridColumn binding="deposit_code" header="입금 관리 코드" width={150} align="center"/>           
            </FlexGrid>

            {/* 승인모달 */}
            <Modal title="입금 승인" visible={approvalModalOpen} onOk={approvalHandleOk} onCancel={approvalHandleCancel} footer={[
                <Button type="primary" onClick={(e)=>approvalApiSubmit()}>확인</Button>
            ]}>
                <Radio.Group name="approval_flag" onChange={approvaOnChange} >
                    <Radio value='1' style={{marginRight: 30}}>담당 단계만 승인</Radio>
                    <Radio value='2'>1, 2차 모두 승인</Radio>
                </Radio.Group>
            </Modal>

            {/* 입금 결과 */}
            <Modal title="입금 결과 등록" visible={importModalOpen} onOk={importHandleOk} onCancel={importHandleCancel} 
                footer={loading === true ? null : [              
                    <Button type="primary" onClick={(e)=>load()} style={state.importChk === true ? {display:'none'} : {display:'inline-block'}} key={'importkey'}>확인</Button>
                        // <Button type="primary" onClick={fileImport}>확인</Button>
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
})

export default billingUsers;