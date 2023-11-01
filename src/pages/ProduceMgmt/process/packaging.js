/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo,useState } from 'react';
import { Pagination, Button, Row, Col, message, Modal, Select, Checkbox, DatePicker, Input, Space} from 'antd';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';
import moment from 'moment';
import axios from 'axios';

import '@grapecity/wijmo.touch'; // support drag/drop on touch devices
import { FlexGrid, FlexGridColumn, FlexGridCellTemplate } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { CollectionView } from '@grapecity/wijmo';
import * as wjcCore from "@grapecity/wijmo";
import * as wjCore from '@grapecity/wijmo';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import * as wjInput from '@grapecity/wijmo.react.input';


import Excel from '@components/Common/Excel';
import '/node_modules/flexlayout-react/style/light.css';


const Wrapper = styled.div`
    width: 100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
    #tplBtnViewMode, #tplBtnEditMode {display:none}
`;


const packagingList = observer(({tab}) => {
    const { commonStore } = useStore();
    const { Option } = Select;

    const stateData = useLocalStore(() => ({apply_date :"", price :"" })); 
    const { confirm } = Modal;
    const state = useLocalStore(() => ({
        type : 'process-packing',

        list: [],
        selPriceInfo:[],
        historyList:[],
        produce_company:[],
        produce_process:[],
        data: [],
        ord:[],
        addCnt : 1,

        today: moment().format('YYYY-MM-DD'),

        addBtn : true,              //추가버튼 활성화
        currentEditItem : null,     //row data
        sel:'',
        flex:'',
        prInp:false,
        dateItemName: [{id: 1, name: '단가 적용일'}],
    }));    
    
    useEffect(() => {
        getCompany();
        getProcess();
        viewData();
        theSearch.current.control.grid = theGrid.current.control;
    }, []);

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    const getCompany = useCallback(async () =>{
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/produce-company',
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            },
        );
        state.produce_company = result.data.data.filter(e => e.process ? e.process.includes('포장') : false);
    },[]);
    
    const getProcess = useCallback(async () =>{
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/produce-process',
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            },
        );
        state.produce_process = result.data.data.filter(e => e.produce_process_code_id===null ? false : e.produce_process_code_id=='7');
        console.log(toJS(state.produce_process))
    },[]);

    //리스트
    const viewData = useCallback(async (val) => {
        if (val == '' || val == '0' || val == undefined) var page = 1;
        else var page = val;
        var axios = require('axios');

        var config = {
            method: 'GET',
            url:
                process.env.REACT_APP_API_URL +'/api/v1/' +
                state.type,
            headers: {
                Accept: 'application/json',
            },
        };

        axios(config)
            .then(function (response) {
                state.list = response.data.data;
            })
            .catch(function (error) {
                console.log(error.response);
                if (error.response?.status === 401) {
                    Modal.warning({
                        title: (
                            <div>
                                세션이 만료되었습니다.
                                <br />
                                재로그인을 해주세요.
                            </div>
                        ),
                        onOk() {
                            axios.post(
                                process.env.PUBLIC_URL +
                                    '/member/session_logout',
                            );
                            window.location.href =
                                process.env.PUBLIC_URL + '/Login';
                            window.localStorage.clear();
                        },
                    });
                } else {
                    //console.log(error.response)
                }
            });
    }, []);

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["produce_company", "produce_process", "produce_process_unit", "price", "apply_date", "memo", "simulation_yn", "use_yn", "buttons" ];
    };

    const initGrid = (grid) => {    
        state.flex= grid;

        // let extraRow = new wjGrid.Row();
        // extraRow.allowMerging = true;
        // var panel = grid.columnHeaders;
        // panel.rows.splice(0, 0, extraRow);

        // state.sel.column = ;


        grid.formatItem.addHandler(function (s, e) {
            if(e.panel._ct == 4){
                e.cell.innerHTML = '<div class="v-center">순서</div>';
            }

            if(e.panel == s.rowHeaders){
                e.cell.innerHTML = e.row + 1;
                // e.cell.innerHTML = s.rows[e.row].dataItem.ordnum?s.rows[e.row].dataItem.ordnum:'';
                // e.cell['dataItem'] = s.rows[e.row].dataItem;
            }
            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
                let col = s.columns[e.col];
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + ' ' + html.split('\\n')[1] + "<br/>" + html.split('\\n')[2] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                if (item == state.currentEditItem && state.currentEditItem.addCode!==undefined) {
                    // create editors and buttons for the item being edited
                    switch (col.binding) {
                        case 'memo' :
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'"'+'value="'+s.getCellData(e.row, e.col, true)+'"/>';
                            break;
                        // case 'produce_company' :
                        // case 'produce_process' :
                        //     var opt = '<option value="">선택</option>';
                        //     for (let index = 0; index < state[col.binding].length; index++) {
                        //         if(s.getCellData(e.row, e.col, true)===state[col.binding][index].name){
                        //             opt += '<option value="'+state[col.binding][index].id+'" selected>'+ state[col.binding][index].name +'</option>';
                        //         }else{
                        //             opt += '<option value="'+state[col.binding][index].id+'">'+ state[col.binding][index].name +'</option>';
                        //         }
                        //     }
                        //     var inhtml = '<select class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'">' +
                        //                 opt +
                        //                 '</select>';
                        //     e.cell.innerHTML = inhtml
                        //     e.cell['dataItem'] = item;
                        //     break;
                        case 'produce_process_unit' :
                            // e.cell.innerHTML = '<input class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'"'+'value="'+s.getCellData(e.row, e.col, true)+'" readonly/>';
                            e.cell.innerHTML = '';
                            e.cell['dataItem'] = item;
                            break;
                        case 'price' :
                        case 'apply_date' :
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'"'+'value="'+s.getCellData(e.row, e.col, true)+'" readonly/>';
                            e.cell['dataItem'] = item;
                            break;
                        case 'use_yn':
                            if(item.use_yn == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + '" type="checkbox" name= "'+col.binding+item.id+'" value="'+item.use_yn+'" '+checked+' />';
                            e.cell['dataItem'] = item;
                            break;
                        case 'simulation_yn':
                            if(item.simulation_yn == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + '" type="checkbox" name= "'+col.binding+item.id+'" value="'+item.simulation_yn+'" '+checked+' />';
                            e.cell['dataItem'] = item;
                            break;
                        case 'buttons':
                            let btn = '<button id="btnOK" class="btnText blueTxt">확인</button><button id="btnCancel" class="btnText grayTxt">취소</button>';
                            e.cell.innerHTML = btn;
                            e.cell['dataItem'] = item;
                            break;
                    }
                } else if(item == state.currentEditItem ){
                    switch (col.binding) {
                        case 'produce_company' :
                        case 'produce_process' :
                            state.currentEditItem[col.binding+'_id'] = toJS(state[col.binding]).find(e => e.name == item[col.binding])?.id;
                            if(state.currentEditItem[col.binding+'_id'] == undefined){
                                state.currentEditItem[col.binding+'_id'] = "";
                            }
                            break;
                        case 'memo' :
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'"'+'value="'+s.getCellData(e.row, e.col, true)+'"/>';
                            break;
                        case 'price' :
                        case 'apply_date' :
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'"'+'value="'+s.getCellData(e.row, e.col, true)+'" readonly/>';
                            e.cell['dataItem'] = item;
                            break;
                        case 'use_yn':
                            if(item.use_yn == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + '" type="checkbox" name= "'+col.binding+item.id+'" value="'+item.use_yn+'" '+checked+' />';
                            e.cell['dataItem'] = item;
                            break;
                        case 'simulation_yn':
                            if(item.simulation_yn == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + '" type="checkbox" name= "'+col.binding+item.id+'" value="'+item.simulation_yn+'" '+checked+' />';
                            e.cell['dataItem'] = item;
                            break;
                        case 'buttons':
                            let btn = '<button id="btnOK" class="btnText blueTxt">확인</button><button id="btnCancel" class="btnText grayTxt">취소</button>';
                            e.cell.innerHTML = btn;
                            e.cell['dataItem'] = item;
                            break;
                    }
                }else {
                    switch (col.binding) {
                        case 'price':
                            let priceWrap;
                            const test = item.prices.find(obj => obj.apply_date > state.today)
                            // if(item.apply_date > state.today){
                            if(test){
                                priceWrap ='<button class="btnText title btnRed btn_price">' + commaNum(item.price) +'</button>';
                            }else{
                                priceWrap ='<button class="btnText title btn_price">' + commaNum(item.price) +'</button>';
                            }
                            e.cell.innerHTML = priceWrap;
                            e.cell['dataItem'] = item;
                            break;
                        case 'use_yn':
                            if(item.use_yn == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + item.id + '" type="checkbox" name= "'+item.id+'" value="'+item.use_yn+'" '+checked+' onClick="return false;"/>';
                            break;
                        case 'simulation_yn':
                            if(item.simulation_yn == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + item.id + '" type="checkbox" name= "'+item.id+'" value="'+item.simulation_yn+'" '+checked+' onClick="return false;"/>';
                            break;
                        case 'buttons':
                            let btn = '<button id="btnEdit" class="btnText blueTxt">수정</button>';
                            e.cell.innerHTML = btn;
                            e.cell['dataItem'] = item;
                            break;
                    }
                    
                    
                }
            }
        });
        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                // get button's data item
                if(e.target.classList.contains('btn_price_modify')){
                    modalOpen('modify');
                }
                if(e.target.classList.contains('btn_price_ipt')){
                    modalOpen('ipt');
                }
                if(e.target.classList.contains('btn_price')){
                    modalOpen('price',wjCore.closest(e.target, '.wj-cell')['dataItem']);
                }
                
                
                switch (e.target.id) {
                    // start editing this item
                    case 'btnEdit':
                        if(state.currentEditItem===null){
                            let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                            state.selPriceInfo = item.priceInfo;
                            editItem(item);
                        }
                        break;
                    case 'btnCancel':
                        cancelEdit();
                        break;
                    case 'btnLink':
                        break;
                    case 'btnOK':
                        let idx = wjCore.closest(e.target, '.wj-cell')['dataItem'].id;
                        commitEdit(idx);
                        break;
                }
            }
            if (e.target instanceof HTMLInputElement) { 
                switch (e.target.id) {
                    // start editing this item
                    case 'use_yn':
                        if(state.currentEditItem[e.target.id] === 'Y'){
                            grid.hostElement.querySelector('#'+e.target.id).value='N';
                            state.currentEditItem[e.target.id] = 'N'
                        }else{
                            grid.hostElement.querySelector('#'+e.target.id).value='Y';
                            state.currentEditItem[e.target.id] = 'Y'
                        }
                        break;
                    case 'simulation_yn':
                        if(state.currentEditItem[e.target.id] === 'Y'){
                            grid.hostElement.querySelector('#'+e.target.id).value='N';
                            state.currentEditItem[e.target.id] = 'N'
                        }else{
                            grid.hostElement.querySelector('#'+e.target.id).value='Y';
                            state.currentEditItem[e.target.id] = 'Y'
                        }
                        break;
                    case 'price':
                    case 'apply_date':
                        modalOpen('modify');
                        break;
                }    
            }
        });

        //코드 유효성 검사
        grid.addEventListener(grid.hostElement, 'change', (e) => {
            if(e.target.id == "produce_process"){
                let input = state.flex.hostElement.querySelector('#' + e.target.id);
                if(input){
                    if(input.value != ""){
                        state.flex.hostElement.querySelector('#produce_process_unit').value = toJS(state.produce_process).find(element=>element.id==input.value).process_unit;
                    }else{
                        state.flex.hostElement.querySelector('#produce_process_unit').value = "";
                    }
                }
            }
        });
        //사용여부 x 일 때 변경 금지
        grid.draggingRow.addHandler(function (s, e) {
            if(state.currentEditItem){
                e.cancel = true;
                return;
            }
            if(s.rows[e.row].dataItem.use_yn != 'Y'||s.rows[e.row].dataItem.addCode < 1){
                e.cancel = true;
                return;
            }
        });
         //사용여부 x인 곳으로 드래깅 금지
        grid.draggingRowOver.addHandler(function (s, e) {
            if(e.row >= s.rows.length - 1){
                e.cancel = true;
                return;
            }else if(s.rows[e.row+1].dataItem.use_yn != 'Y' || s.rows[e.row].dataItem.addCode < 1){
                e.cancel = true;
                return;
            }
        });
        //순서변경 이벤트 발생
        grid.draggedRow.addHandler(function (s, e) {
            var from = Number(s.rows[e.row].dataItem.ordnum);
            var to = s.rows[e.row-1]?Number(s.rows[e.row-1].dataItem.ordnum):1;

            if(from > to){
                state.ord = addObject(state.ord,[{id:s.rows[e.row].dataItem.id,ordnum:s.rows[e.row+1].dataItem.ordnum}]);
                s.rows[e.row].dataItem.ordnum = s.rows[e.row+1].dataItem.ordnum;
                to = Number(s.rows[e.row+1].dataItem.ordnum);
                for(var i = 1 ; i <(from-to+1);i++){
                    state.ord = addObject(state.ord,[{id:s.rows[e.row+i].dataItem.id,ordnum:s.rows[e.row+i].dataItem.ordnum+1}]);
                    s.rows[e.row+i].dataItem.ordnum = s.rows[e.row+i].dataItem.ordnum+1;
                }
            }else if(from < to){
                state.ord = addObject(state.ord,[{id:s.rows[e.row].dataItem.id,ordnum:s.rows[e.row-1].dataItem.ordnum}]);
                s.rows[e.row].dataItem.ordnum = s.rows[e.row-1].dataItem.ordnum;
                for(var i = 1 ; i <(to-from+1);i++){
                    state.ord = addObject(state.ord,[{id:s.rows[e.row-i].dataItem.id,ordnum:s.rows[e.row-i].dataItem.ordnum-1}]);
                    s.rows[e.row-i].dataItem.ordnum = s.rows[e.row-i].dataItem.ordnum-1;
                }
            }

            const sort_arr = toJS(state.list);
            sort_arr.sort((a, b) => {
                if (a.use_yn === "Y" && b.use_yn === "N") {
                  return -1; // Y가 N보다 먼저 오도록 -1 반환
                } else if (a.use_yn === "N" && b.use_yn === "Y") {
                  return 1; // Y가 N보다 먼저 오도록 -1 반환
                } else {
                  return a.ordnum - b.ordnum; // ordnum를 오름차순으로 정렬
                }
            });

            state.list = toJS(sort_arr);
        });
        grid.autoGenerateColumns = false;
        grid.itemsSource = state.list;
        grid.selectionMode = 0;
        grid.virtualizationThreshold = 20;
    };

    //추가 버튼 
    const rowAdd=(e)=>{    
        if(e === true){ //행추가일때
            state.addCnt = state.addCnt-1;
            state.currentEditItem = {
                id: state.addCnt,
                produce_company: '',
                produce_process : '',
                produce_process_unit: '',
                price: '',
                apply_date: '',
                prices : [],
                memo: '',
                use_yn: '',
                simulation_yn: '',
                addCode: '',
                rowAdd: true,
            };
            var view = new CollectionView(state.list)
            view.sourceCollection.splice(0 ,0,state.currentEditItem); //값 삽입
            state.flex.columns[3]._sz=200;
            state.flex.collectionView.refresh(state.currentEditItem); // 삽입된 값 그리드에 반영         
            state.addBtn = false;  
            
        }else{ //행추가를 취소할때
            state.addCnt = state.addCnt+1;
            state.flex.collectionView.remove(state.currentEditItem);
            state.flex.columns[3]._sz=100;
            state.addBtn = true;
            state.currentEditItem = null;
        }
        
    }
    //수정 버튼 
    const editItem = (item) => {
        state.currentEditItem = item;
        state.currentEditItem.rowAdd = true;
        state.flex.invalidate();
        state.flex.collectionView.refresh();
    }

    //확인 버튼
    const commitEdit=(idx)=> {
        if (state.currentEditItem) {
            var validate = true;
            var msg = "";
            state.flex.columns.map((col) => {
                let input = state.flex.hostElement.querySelector('#' + col.binding);
                let wjvalue = input?.querySelector('.wj-form-control')?.value;
                if (input) {
                    if(col.binding==='produce_process' && wjvalue ==""){
                        msg = "공정을 선택하세요.";
                        validate = false;
                    }
                    if(col.binding==='produce_company' && wjvalue ==""){
                        msg = "제작처를 선택하세요.";
                        validate = false;
                    }
                    if(col.binding==='price' && input.value ==""){
                        msg = "단가를 입력하세요.";
                        validate = false;
                    }
                    if(col.binding==='apply_date' && input.value ==""){
                        msg = "적용일을 입력하세요.";
                        validate = false;
                    }
                }                
            });

            if(validate!==true){
                Modal.error({
                    content: msg,        
                });
                return false;
            }

            state.flex.columns.forEach((col) => {
                let input = state.flex.hostElement.querySelector('#' + col.binding);
                if (input) {                    
                    let value = wjcCore.changeType(input.value, col.dataType, col.format);
                    if (wjcCore.getType(value) == col.dataType) {
                        state.currentEditItem[col.binding] = value;                        
                    }
                    if(col.binding === 'produce_company'){
                        let text = input.querySelector('.wj-form-control').value;
                        let result = state.produce_company.filter(col => col.name == text );
                        state.currentEditItem[col.binding] = text;
                        state.currentEditItem['produce_company_id'] = result[0]?.id;
                    }
                    if(col.binding === 'produce_process'){
                        let text = input.querySelector('.wj-form-control').value;
                        let result = state.produce_process.find(col => col.name == text );
                        state.currentEditItem[col.binding] = text;
                        state.currentEditItem['produce_process_id'] = result.id;
                        var temp_paper = {}
                        if(temp_paper = toJS(state.produce_process).find(element=>element.id==result.id)){
                            state.currentEditItem.produce_process_unit = temp_paper.process_unit;
                        }
                    }
                    if(col.binding === 'price' || col.binding === 'apply_date'){
                        state.currentEditItem[col.binding] = value;       
                    }
                    if(col.binding === 'simulation_yn'){
                        state.currentEditItem[col.binding] = value;       
                    }
                    if(col.binding === 'use_yn'){
                        state.currentEditItem[col.binding] = value;       
                    }
                    if(state.currentEditItem.id <= 0){
                        state.currentEditItem.addCode = state.currentEditItem.id;
                    }
                }                
            });
        }

        if(state.data.length > 0){
            var chk = true;
            state.data.forEach((e) => {    
                //기존 배열에 들어간 user_id와 같으면 값 수정
                if(e.id > 0){
                    if(e.id === state.currentEditItem.id){
                        e.id= state.currentEditItem.id;
                        e.produce_company= state.currentEditItem.produce_company;
                        e.produce_process= state.currentEditItem.produce_process;
                        e.produce_process_unit= state.currentEditItem.produce_process_unit;
                        e.use_yn= state.currentEditItem.use_yn;
                        chk = false;
                    }
                }else{
                    if(e.addCode === state.currentEditItem.addCode){
                        e.name= state.currentEditItem.name;
                        e.produce_company= state.currentEditItem.produce_company;
                        e.produce_process= state.currentEditItem.produce_process;
                        e.produce_process_unit= state.currentEditItem.produce_process_unit;
                        e.use_yn= state.currentEditItem.use_yn;
                        chk = false;
                    }
                }
                
            })

            if(chk === true){
                state.data = [...state.data, state.currentEditItem];
            }
        }else{
            state.data = [...state.data , state.currentEditItem]
        }
        state.currentEditItem.rowAdd = false;
        state.currentEditItem = null;
        state.flex.invalidate();
        state.flex.collectionView.refresh();
        state.addBtn =true;
    }

    const cancelEdit = () => {
        if (state.currentEditItem) {
            if(state.currentEditItem.addCode === ''){ //행추가 취소시 행 삭제
                state.addCnt = state.addCnt+1;
                state.flex.collectionView.remove(state.currentEditItem);
                state.addBtn = true;
            }
            state.currentEditItem.rowAdd = false;
            state.currentEditItem = null;
            state.flex.invalidate();
            state.flex.collectionView.refresh();
        }
    }

    const [modalPriceModify, setModalPriceModify] = useState(false);
    const [modalPriceHistory, setModalPriceHistory] = useState(false);
    const modalCancel= (obj)=> {
        if(obj == 'modify'){
            stateData.apply_date = "";
            stateData.price = "";
            setModalPriceModify(false);
        }
        if(obj == 'price'){
            setModalPriceHistory(false);
        }
    }

    const modifyOk= (obj,e)=> {
        if(obj == 'modify'){
            //validation
            var validate = true;
            var msg = "";
            if(stateData.apply_date =="" || stateData.apply_date == null){
                msg = "적용일을 입력하세요.";
                validate = false;
            }else if(stateData.price ==""){
                msg = "단가를 입력하세요.";
                validate = false;
            }
            if(validate!==true){
                Modal.error({
                    content: msg,        
                });
                return false;
            }
            if(state.currentEditItem!== null){  //등록,수정
                //set data
                state.flex.hostElement.querySelector('#apply_date').value = moment(stateData.apply_date).format('YYYY-MM-DD');
                state.flex.hostElement.querySelector('#price').value = stateData.price;

                //modalclose
                setModalPriceModify(false);
            }
        }
        if(obj == 'history'){
            setModalPriceHistory(false);
        }
    }

    const modalOpen = (obj,item) => {
        if(obj == 'modify'){
            state.prInp=false;
            stateData.apply_date = state.flex.hostElement.querySelector('#apply_date').value!=""?moment(state.flex.hostElement.querySelector('#apply_date').value):moment().add(1,'M').startOf('month');
            stateData.price = state.flex.hostElement.querySelector('#price').value.replace(/,/g, "");
            setModalPriceModify(true);
        }
        if(obj == 'ipt'){
            state.prInp=true;
            setModalPriceModify(true);
        }
        if(obj == 'price'){
            var temp_history = [];
            toJS(item.prices).map(e=>{
                temp_history = [...temp_history,{price:e.price,apply_date:e.apply_date,worker:e.created_info?.name}];
            })
            state.historyList = temp_history;
            setModalPriceHistory(true);
        }
    }

    const initHistoryGrid = (grid) => {    
        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                switch (col.binding) {
                    case 'priceInfo':
                        var data = item.priceInfo,
                            inhtml = '';
                        for (let index = 0; index < data.length; index++) {
                            const obj = data[index];
                            inhtml +='<div>' + obj.ar + ' : ' + obj.pr +'</div>'
                        }
                        e.cell.innerHTML = inhtml;
                        break;
                }
            }
        });
        grid.collectionView.refresh();
    };

    const handlePriceInput = (type) => (e) => {
        if(type === "apply_date"){
            stateData[type] = e; 
        }else if(type === "price"){
            if(e.target.value){
                var regnum = Number(Math.round(e.target.value + "e+2")  + "e-2");
                stateData[type] = regnum;
            }else{
                stateData[type] = e.target.value;
            }
        }else{
            stateData[type] = e.target.value;
        }
    }

    const handleReset = useCallback(() => {
        return confirm({
            title: `이 창의 입력 내용이 삭제됩니다.`,
            content: `그래도 계속 하시겠습니까?`,
                async onOk() {
                    getCompany();
                    getProcess();
                    viewData();
                    stateData.apply_date = "";
                    stateData.price = "";
                    state.currentEditItem = null;
                },
            });
    }, []);

    const addObject = (arr,add) =>{
        toJS(add).map(obj=>{
            const existingObj = arr.find(item => item.id === obj.id);
            if (existingObj) {
                existingObj['ordnum'] = obj.ordnum;
            } else {
                arr= [...arr,obj];
            }
        });
        return arr;
    }

    //등록
    const handleSubmit = useCallback(async (e)=> {      
        
        const row_data = toJS(state.data);
        var data =[];
        row_data.forEach((item)=>{
            var temp = {
                produce_company_id: item.produce_company_id,
                produce_process_id: item.produce_process_id,
                prices : {
                    price : item.price,
                    apply_date : item.apply_date
                },
                memo: item.memo,
                simulation_yn: item.simulation_yn,
                use_yn: item.use_yn
            };
            
            if(item.id>0){
                temp['id'] = item.id;
            }
            data = [...data,temp];
        });

        if(state.ord.length>0){
            data = addObject(data,state.ord);
        }

        if(state.data.length > 0){
            var axios = require('axios');

            var config={
                method:'POST',
                url:process.env.REACT_APP_API_URL +'/api/v1/'+state.type,
                headers:{
                    'Accept':'application/json',
                },
                    data:data
                };
                
            axios(config)
            .then(function(response){
                if(response.data.success !== false){
                    Modal.success({
                        title: response.data.result,
                        onOk(){
                            viewData();
                            state.data = [];
                        },
                    });
                }else{
                    Modal.error({
                        content:(<div>
                                    <p>등록시 문제가 발생하였습니다.</p>
                                    <p>재시도해주세요.</p>
                                    <p>오류코드: {response.data.error}</p>
                                </div>)
                    });  
                }
            })
            .catch(function(error){
                console.log(error.response);
                Modal.error({
                    title : '등록시 문제가 발생하였습니다.',
                    content : '오류코드:'+error.response.status
                });  
            });
        }else{
            Modal.warning({
                title: '등록할 데이터가 없습니다.',
            });  
        }
        
    }, []);

    // 천단위 자동 콤마
    const commaNum = (num) => {
        if(num){
            const number = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return number
        }else{
            return 0;
        }      
    }

    return (
        <Wrapper>
            <Row className="topTableInfo" justify="space-around">
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
                    <Button className="btn btn-primary btn_add" shape="circle" onClick={(e) => {rowAdd(state.addBtn)}} >
                        {state.addBtn === true ? '+' : '-'}
                    </Button>
                </Col>
            </Row>

            <Row className="gridWrap">       
                <FlexGrid 
                    ref={theGrid}
                    itemsSource={state.list} 
                    stickyHeaders={true} 
                    initialized={(s) => initGrid(s)}
                    allowSorting={false}
                    allowMerging="ColumnHeaders"
                    selectionMode="None"
                    allowDragging="Both"
                    newRowAtTop={true}
                    autoRowHeights={true}
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                    <FlexGridColumn binding="produce_company" header="제작처" width={'*'} minWidth={200}>
                        <FlexGridCellTemplate
                            cellType="Cell"
                            template={(cell) => {
                                let result = state[cell.col.binding].filter(col => col.name == cell.item.produce_company);
                                if(cell.item.rowAdd) {
                                    return (
                                        <wjInput.ComboBox
                                            id={cell.col.binding}
                                            placeholder="선택"
                                            itemsSource={new CollectionView(state[cell.col.binding], {
                                                currentItem: null
                                            })}
                                            selectedValuePath="id"
                                            displayMemberPath="name"
                                            valueMemberPath="id"
                                            selectedValue={result.length > 0 ? result?.[0].id : ''}
                                            style={{ width: '100%' }}
                                        />
                                    );
                                } else {
                                    return cell.item.produce_company;
                                }
                            }}
                        />
                    </FlexGridColumn>
                    <FlexGridColumn binding="produce_process" header="공정" width={200} >
                        <FlexGridCellTemplate
                            cellType="Cell"
                            template={(cell) => {
                                let result = state[cell.col.binding].filter(col => col.name == cell.item.produce_process);
                                if(cell.item.rowAdd) {
                                    return (
                                        <wjInput.ComboBox
                                            id={cell.col.binding}
                                            placeholder="선택"
                                            itemsSource={new CollectionView(state[cell.col.binding], {
                                                currentItem: null
                                            })}
                                            selectedValuePath="id"
                                            displayMemberPath="name"
                                            valueMemberPath="id"
                                            selectedValue={result.length > 0 ? result?.[0].id : ''}
                                            style={{ width: '100%' }}
                                        />
                                    );
                                } else {
                                    return cell.item.produce_process;
                                }
                            }}
                        />
                    </FlexGridColumn>
                    <FlexGridColumn binding="produce_process_unit" header="단가 기준" width={100} />
                    <FlexGridColumn binding="price" header="단가" width={100} align="right" />
                    <FlexGridColumn binding="apply_date" header="단가 적용일" width={120} />
                    <FlexGridColumn binding="memo" header="참고사항" width={150} />
                    <FlexGridColumn binding="simulation_yn" header="시뮬레이션\n적용" width={100} align="center" />
                    <FlexGridColumn binding="use_yn" header="사용 여부" width={100} align="center" />
                    <FlexGridColumn binding="buttons" header="작업" width={100} align="center" />
                </FlexGrid>
            </Row>

            <Row gutter={10} className="table table_bot">
                <Col xs={16} lg={16}>
                    <div className="btn-group">
                        {/* <Pagination defaultCurrent={1} defaultPageSize={state.pageArr.pageCnt} current={state.pageArr.page} total={state.total} showSizeChanger={false}/> */}
                        <span>행 개수 : {state.list.length}</span>
                    </div>
                </Col>
                <Excel />
            </Row>

            <Row gutter={[10, 10]}  justify="center" style={{ marginTop: 20 }}>
                <Col>
                    <Button id="btn" type="primary" htmlType="button" onClick={()=>handleSubmit()}>확인</Button>
                </Col>
                <Col>
                    <Button htmlType="button" onClick={handleReset}>취소</Button>
                </Col>
            </Row>

            <Modal 
                title={state.prInp===true ? "단가 입력" : "단가 수정" } 
                visible={modalPriceModify} 
                onCancel={(e) => {modalCancel('modify')}}
                onOk={(e) => {modifyOk('modify',e)}}
            >
                <Row gutter={10} className="table">
                    <Col xs={24} lg={8} className="label">
                        적용일 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={16}>
                        <DatePicker name="apply_date" onChange={handlePriceInput('apply_date')} value={stateData.apply_date}/>
                    </Col> 
                    <Col xs={24} lg={8} className="label">
                        {state.prInp===true 
                            ?
                            <>
                            단가 <span className="spanStar">*</span>
                            </>
                            :
                            <>
                            수정 단가 <span className="spanStar">*</span>
                            </>
                        }
                    </Col>
                    <Col xs={24} lg={16}>
                        <Input type="number" name="price" onChange={handlePriceInput('price')} value={stateData.price}/>
                    </Col> 
                </Row>
            </Modal>

            <Modal title="단가 변경 이력" visible={modalPriceHistory} onCancel={(e) => {modalCancel('price')}} footer={null}>
                <FlexGrid 
                    itemsSource={state.historyList} 
                    initialized={(s) => initHistoryGrid(s)}
                    headersVisibility="Column"
                    autoRowHeights={true}
                >
                    <FlexGridColumn binding="price" header="단가" width={'*'} align="right" />
                    <FlexGridColumn binding="apply_date" header="단가 적용일" width={120} />
                    <FlexGridColumn binding="worker" header="작업자" width={120} />
                </FlexGrid>
            </Modal>

        </Wrapper>
    );
});

export default packagingList;
