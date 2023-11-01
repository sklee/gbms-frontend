/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pagination, Button, Row, Col, message, Modal, Select, DatePicker, Input} from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';
import moment from 'moment';
import axios from 'axios';

import { toJS } from 'mobx';

import '@grapecity/wijmo.touch'; // support drag/drop on touch devices
import { FlexGrid, FlexGridColumn, FlexGridCellTemplate } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { Selector } from "@grapecity/wijmo.grid.selector";
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjcCore from "@grapecity/wijmo";
import * as wjCore from '@grapecity/wijmo';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import { CollectionView, DataType, isNumber } from '@grapecity/wijmo';
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

const PAPER_GRAIN = ["종목", "횡목"];

const paperCompanyList = observer(({tab}) => {

    const stateData = useLocalStore(() => ({apply_date :"", price :"" })); 

    const { commonStore } = useStore();
    const { Option } = Select;
    const { confirm } = Modal;

    const state = useLocalStore(() => ({

        type : 'paper-information',

        list: [],
        historyList:[],
        discountList:[],
        data: [],
        ord:[],

        addBtn : true,              //추가버튼 활성화          
        currentEditItem : null,     //row data
        sel:'',
        flex:'',
        priceEditBl:false,
        addCnt : 1,
        selected : [],

        today: moment().format('YYYY-MM-DD'),

        //입력리스트
        paper_company : [],
        paper_color : [],
        paper_type : [],
        paper_standard : [],

        //페이징
        total: 0,
        pageArr: {
            pageCnt: 100, //리스트 총 갯수
            page: 1, //현재페이지
        },
        dateItemName: [{id: 1, name: '신청일'}],
    }));    
    
    useEffect(() => { 
        getCompany();
        getColor();
        getType();
        getStandard();
        viewData();
        theSearch.current.control.grid = theGrid.current.control;
    }, []);

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    const getCompany = useCallback(async () =>{
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/paper-company',
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            },
        )
        state. paper_company = result.data.data;
    },[]);
    const getColor = useCallback(async () =>{
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/paper-colors',
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            },
        )
        state.paper_color = result.data.data;
    },[]);
    const getType = useCallback(async () =>{
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/paper-types',
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            },
        )
        state.paper_type = result.data.data;
    },[]);
    const getStandard = useCallback(async () =>{
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/paper-standards',
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            },
        )
        state.paper_standard = result.data.data
        state.paper_standard = [...toJS(state.paper_standard),{id: '',name: "변규격",}]
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
                state.type +
                '?display=' +
                state.pageArr.pageCnt +
                '&page=' +
                page +
                '&sort_by=date&order=desc',
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
    
    const [priceEditAll, setPriceEditAll] = useState(false);
    const showCheckedCount = () => {
        let sel =  state.flex.rows.filter(r => r.isSelected);
        var temp = [];
        sel.map(e=>{
            temp = [...temp,e.dataItem.id];
        });
        state.selected = temp;
        
        if(sel.length > 0){
            state.priceEditBl = true;
        } else {
            state.priceEditBl = false;
        }
    }

    // 천단위 자동 콤마
    const commaNum = (num) => {
        if(num){
            const number = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return number
        }else{
            return 0;
        }      
    }

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["paper_code", "paper_gsm", "paper_company", "paper_color", "paper_type", "paper_standard", "paper_grain", "width", "height", "cover", "text", 
        "endpaper", "belt", "memo","paper_name", "price", "apply_date", "simulation_yn", "use_yn", "buttons"];
    };

    const initGrid = (grid) => {    
        state.flex= grid;

        let extraRow = new wjGrid.Row();
        extraRow.allowMerging = true;
        var panel = grid.columnHeaders;
        panel.rows.splice(0, 0, extraRow);

        state.sel = new Selector(grid, {
            itemChecked: () => {
                showCheckedCount();
            }
        })
        
        state.sel._col.allowMerging = true;

        state.sel.column = grid.columns[0];

        for (let colIndex = 0; colIndex <= 20; colIndex++) {
            if(colIndex >= 10 && colIndex <= 13){ 
                panel.setCellData(0, colIndex, '상품 기본 구성 선택 시 노출 여부');
            } else {
                let col = grid.getColumn(colIndex);
                col.allowMerging = true;
                panel.setCellData(0, colIndex, col.header);
            }            
        }
        
        grid.formatItem.addHandler(function (s, e) {
            if(e.panel._ct == 4){
                e.cell.innerHTML = '<div class="v-center">순서</div>';
            }

            if(e.panel == s.rowHeaders){
                e.cell.innerHTML = e.row + 1;
            }

            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
                let col = s.columns[e.col];
                if(col.binding == 'chk'){
                    e.cell.classList.add("headCenter")
                }else{
                    if(html.split('\\n').length > 1){
                        e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + "<br/>" + html.split('\\n')[1] + "<br/>" + html.split('\\n')[2] + '</div>';
                    }else{
                        e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                    }
                }
            }
            
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                if (item == state.currentEditItem ) {
                    switch (col.binding) {
                        case 'paper_gsm':
                        case 'memo' :
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'"'+'value="'+s.getCellData(e.row, e.col, true)+'"/>';
                            e.cell['dataItem'] = item;
                            break;
                        case 'width' :
                        case 'height' :
                            var readonly = "";
                            if(item.paper_standard!="")readonly = "readOnly";
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'"'+'value="'+s.getCellData(e.row, e.col, true)+'" '+readonly+'/>';
                            e.cell['dataItem'] = item;
                            break;
                        // case 'paper_name' :
                        case 'price' :
                        case 'apply_date' :
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'"'+'value="'+s.getCellData(e.row, e.col, true)+'" readonly/>';
                            e.cell['dataItem'] = item;
                            break;
                        case 'cover':
                            if(item.cover == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + '" type="checkbox" name= "'+item.id+'" value="'+item.cover+'" '+checked+' />';
                            e.cell['dataItem'] = item;
                            break;
                        case 'text':
                            if(item.text == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + '" type="checkbox" name= "'+item.id+'" value="'+item.text+'" '+checked+' />';
                            e.cell['dataItem'] = item;
                            break;
                        case 'endpaper':
                            if(item.endpaper == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + '" type="checkbox" name= "'+item.id+'" value="'+item.endpaper+'" '+checked+' />';
                            e.cell['dataItem'] = item;
                            break;
                        case 'belt':
                            if(item.belt == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + '" type="checkbox" name= "'+item.id+'" value="'+item.belt+'" '+checked+' />';
                            e.cell['dataItem'] = item;
                            break;
                        case 'simulation_yn':
                            if(item.simulation_yn == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + '" type="checkbox" name= "'+item.id+'" value="'+item.simulation_yn+'" '+checked+' />';
                            e.cell['dataItem'] = item;
                            break;
                        case 'use_yn':
                            if(item.use_yn == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + '" type="checkbox" name= "'+item.id+'" value="'+item.use_yn+'" '+checked+' />';
                            break;
                        case 'buttons':
                            let btn = '<button id="btnOK" class="btnText blueTxt">확인</button><button id="btnCancel" class="btnText grayTxt">취소</button>';
                            e.cell.innerHTML = btn;
                            e.cell['dataItem'] = item;
                            break;
                    }
                } else {
                    // create buttons for items not being edited
                    switch (col.binding) {
                        case 'cover':
                            if(item.cover == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + item.id + '" type="checkbox" name= "'+item.id+'" value="'+item.cover+'" '+checked+' onClick="return false;" />';
                            e.cell['dataItem'] = item;
                            break;
                        case 'text':
                            if(item.text == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + item.id + '" type="checkbox" name= "'+item.id+'" value="'+item.text+'" '+checked+' onClick="return false;" />';
                            e.cell['dataItem'] = item;
                            break;
                        case 'endpaper':
                            if(item.endpaper == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + item.id + '" type="checkbox" name= "'+item.id+'" value="'+item.endpaper+'" '+checked+' onClick="return false;" />';
                            e.cell['dataItem'] = item;
                            break;
                        case 'belt':
                            if(item.belt == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + item.id + '" type="checkbox" name= "'+item.id+'" value="'+item.belt+'" '+checked+' onClick="return false;" />';
                            e.cell['dataItem'] = item;
                            break;
                        case 'paper_name':
                            let nameWrap = '';
                            if(item.paper_name !== undefined && item.paper_name != ""){
                                nameWrap ='<button class="btnText title btn_name">' +item.paper_name +'</button>';
                            }
                            e.cell.innerHTML = nameWrap;
                            e.cell['dataItem'] = item;
                            break;
                        case 'price':
                            let priceWrap;
                            if(item.apply_date > state.today){
                                priceWrap ='<button class="btnText title btnRed btn_price">' + commaNum(item.price) +'</button>';
                            }else{
                                priceWrap ='<button class="btnText title btn_price">' + commaNum(item.price) +'</button>';
                            }
                            e.cell.innerHTML = priceWrap;
                            e.cell['dataItem'] = item;
                            break;
                        case 'simulation_yn':
                            if(item.simulation_yn == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + item.id + '" type="checkbox" name= "'+item.id+'" value="'+item.simulation_yn+'" '+checked+' onClick="return false;" />';
                            e.cell['dataItem'] = item;
                            break;
                        case 'use_yn':
                            if(item.use_yn == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + item.id + '" type="checkbox" name= "'+item.id+'" value="'+item.use_yn+'" '+checked+' onClick="return false;" />';
                            e.cell['dataItem'] = item;
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
                if(e.target.classList.contains('btn_name')){
                    modalOpen('list',wjCore.closest(e.target, '.wj-cell')['dataItem']);
                } 
                if(e.target.classList.contains('btn_price')){
                    modalOpen('history',wjCore.closest(e.target, '.wj-cell')['dataItem']);
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
                        let item3 = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                        cancelEdit();
                        break;
                    case 'btnLink':
                        let item2 = wjCore.closest(e.target, '.wj-cell')['dataIem'];
                        break;
                    case 'btnOK':
                        commitEdit();
                        break;
                }
            }

            if (e.target instanceof HTMLInputElement) { 
                switch (e.target.id) {
                    // start editing this item
                    case 'use_yn':
                    case 'simulation_yn':
                    case 'cover':
                    case 'text':
                    case 'endpaper':
                    case 'belt':
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
            if(e.target.id == "paper_gsm"||e.target.id == "width"||e.target.id == "height"){
                let input = state.flex.hostElement.querySelector('#' + e.target.id);
                
                if (input) {                    
                    let value = wjcCore.changeType(input.value, DataType.Number, state.flex.columns[0].format);
                    if (!isNumber(value) || value < 0) {
                        e.cancel = true;
                        e.stayInEditMode = true;
                        message.warning('숫자만 입력 가능합니다.');
                        if(state.currentEditItem.addCode === ''){
                            input.value = '';
                        }else{
                            switch (e.target.id) {
                                case 'paper_gsm':
                                    input.value = state.currentEditItem.paper_gsm;
                                    break;
                                case 'width':
                                    input.value = state.currentEditItem.width;
                                    break;
                                case 'height':
                                    input.value = state.currentEditItem.height;
                                    break;
                            }
                        }                                
                    }
                }
            }
            // if(e.target.id == "paper_standard"){
            //     let input = state.flex.hostElement.querySelector('#' + e.target.id);
            //     if(input){
            //         if(input.value=="0"){
            //             state.flex.hostElement.querySelector('#width').readOnly = false;
            //             state.flex.hostElement.querySelector('#height').readOnly = false;
            //         }else{
            //             state.flex.hostElement.querySelector('#width').value = toJS(state.paper_standard).find(element=>element.id==input.value).width;
            //             state.flex.hostElement.querySelector('#height').value = toJS(state.paper_standard).find(element=>element.id==input.value).height;
            //             state.flex.hostElement.querySelector('#width').readOnly = true;
            //             state.flex.hostElement.querySelector('#height').readOnly = true;
            //         }
            //     }
            // }

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
        //init selection none
        grid.selectionMode = 0;
        grid.virtualizationThreshold = 25;
    };

    const inputChangeHandler = (e) => {
        let targetId = e.hostElement.getAttribute('id');
        
        if(targetId == "paper_standard" ){
            if(e){
                if(e.selectedValue===""){
                    state.flex.hostElement.querySelector('#width').readOnly = false;
                    state.flex.hostElement.querySelector('#height').readOnly = false;
                }else{
                    state.flex.hostElement.querySelector('#width').value = toJS(state.paper_standard).find(element=>element.id==e.selectedValue).width;
                    state.flex.hostElement.querySelector('#height').value = toJS(state.paper_standard).find(element=>element.id==e.selectedValue).height;
                    state.flex.hostElement.querySelector('#width').readOnly = true;
                    state.flex.hostElement.querySelector('#height').readOnly = true;
                }
            }
        }
    }

    const initListGrid = (grid) => {
        grid.formatItem.addHandler(function (s, e) {
            if(e.panel._ct == 4){
                e.cell.innerHTML = '<div class="v-center">순서</div>';
            }
        });
    }

    //추가 버튼 
    const rowAdd=(e)=>{    
        if(e === true){ //행추가일때
            state.addCnt = state.addCnt-1;
            state.currentEditItem = { 
                id: state.addCnt, 
                paper_gsm: "",
                paper_company: "",
                paper_color: "",
                paper_type: "",
                paper_standard: "",
                paper_grain: "",
                width: "",
                height: "",
                cover: "",
                text: "",
                endpaper: "",
                belt: "",
                memo: "",
                prices: [],
                simulation_yn: "",
                use_yn: "",
                addCode: "",
                rowAdd: true
            };
            // state.currentEditItem = { 
            //     id: 0, 
            //     gsm: "",
            //     paper_company_id: "",
            //     paper_color_id: "",
            //     paper_type_id: "",
            //     paper_standard_id: "",
            //     paper_standard: "",
            //     paper_grain: "",
            //     width: "",
            //     height: "",
            //     cover: "",
            //     text: "",
            //     endpaper: "",
            //     belt: "",
            //     memo: "",
            //     prices: {
            //         id: "",
            //         price: "",
            //         apply_date: ""
            //     },
            //     simulation_yn: "",
            //     use_yn: '',
            //     addCode: ""
            // };
            var view = new CollectionView(state.list)
            view.sourceCollection.splice(0 ,0,state.currentEditItem); //값 삽입
            state.flex.collectionView.refresh(state.currentEditItem); // 삽입된 값 그리드에 반영         
            state.addBtn = false;  
            
        }else{ //행추가를 취소할때
            state.addCnt = state.addCnt+1;
            state.flex.collectionView.remove(state.currentEditItem);
            state.currentEditItem = null;
            state.addBtn = true;
        }
        
    }
    //수정 버튼 
    const editItem= (item)=> {
        state.currentEditItem = item;
        state.currentEditItem.rowAdd = true;
        state.flex.invalidate()
        state.flex.collectionView.refresh();
    }

    const validationChk= (item)=> {
        var result = {validate :true, msg : ""};
        if(item.paper_gsm ==""){
            result.validate = false;
            result.msg = "평량을 입력하세요.";
            return result;
        }else if(item.paper_company==""){
            result.validate = false;
            result.msg = "제조사를 선택하세요.";
            return result;
        }else if(item.paper_color ==""){
            result.validate = false;
            result.msg = "색상을 선택하세요.";
            return result;
        }else if(item.paper_type ==""){
            result.validate = false;
            result.msg = "종이 종류를 선택하세요.";
            return result;
        }else if(item.paper_standard ==""){
            result.validate = false;
            result.msg = "종이 규격을 선택하세요.";
            return result;
        }else if(item.paper_grain ==""){
            result.validate = false;
            result.msg = "종이결을 선택하세요.";
            return result;
        }else if(item.width ==""){
            result.validate = false;
            result.msg = "가로를 입력하세요.";
            return result;
        }else if(item.height ==""){
            result.validate = false;
            result.msg = "세로를 입력하세요.";
            return result;
        }else if(item.price ==""){
            result.validate = false;
            result.msg = "고시가격을 입력하세요.";
            return result;
        }else if(item.apply_date ==""){
            result.validate = false;
            result.msg = "적용일을 입력하세요.";
            return result;
        }else{
            return result;
        }
    }

    //확인 버튼
    const commitEdit=()=> {
        if (state.currentEditItem) {
            var validator = {};
            state.flex.columns.map((col) => {
                let input = state.flex.hostElement.querySelector('#' + col.binding);
                let inputId = input?.getAttribute('id');

                if(inputId == "paper_company" || inputId == "paper_color" || inputId == "paper_type" || inputId == "paper_standard" || inputId == "paper_grain"){
                    validator[col.binding] = input.querySelector('.wj-form-control').value;
                } else if(input){
                    validator[col.binding] = input.value;
                }
                
            });

            var res = validationChk(toJS(validator));
            
            if(res.validate!==true){
                Modal.error({
                    content: res.msg,        
                });
                return false;
            }

            state.flex.columns.forEach((col) => {
                let input = state.flex.hostElement.querySelector('#' + col.binding);
                let inputId = input?.getAttribute('id');

                if (input) {
                    let value = wjcCore.changeType(input.value, col.dataType, col.format);
                    if (wjcCore.getType(value) == col.dataType) {
                        state.currentEditItem[col.binding] = value;                     
                    }
                    if(inputId === 'paper_company' || inputId === 'paper_type' || inputId === 'paper_standard' || inputId === 'paper_color'){
                        let text = input.querySelector('.wj-form-control').value
                        let result = state[inputId].find(col => col.name == text )
                        state.currentEditItem[col.binding] = text
                        state.currentEditItem[inputId+'_id'] = result ? result.id : null
                    }
                    if(inputId === 'paper_grain'){
                        state.currentEditItem[col.binding] = input.querySelector('.wj-form-control').value;
                    }
                    if(col.binding === 'price' || col.binding === 'apply_date'){
                        state.currentEditItem[col.binding] = value;       
                    }
                    if(col.binding === 'simulation_yn'){
                        state.currentEditItem[col.binding] = value; 
                    }
                    if(col.binding === 'use_yn'){
                        state.currentEditItem[col.binding] = value;       
                        if(value!=='Y'){
                            state.currentEditItem['simulation_yn'] = 'N';
                        }
                    }
                    if(col.binding === 'cover' || col.binding === 'text' || col.binding === 'endpaper' || col.binding === 'belt'){
                        state.currentEditItem[col.binding] = value;
                    }
                    if(state.currentEditItem.id <= 0){
                        state.currentEditItem.addCode = state.currentEditItem.id;
                    }
                }                
            });
        }
        if(state.data.length > 0){
            var chk = true
            state.data.forEach((e) => {    
                //기존 배열에 들어간 user_id와 같으면 값 수정
                if(e.id > 0){
                    if(e.id === state.currentEditItem.id){
                        e.id= state.currentEditItem.id;
                        e.paper_gsm= state.currentEditItem.paper_gsm;
                        e.paper_company= state.currentEditItem.paper_company;
                        e.paper_color= state.currentEditItem.paper_color;
                        e.paper_type= state.currentEditItem.paper_type;
                        e.paper_standard= state.currentEditItem.paper_standard;
                        e.paper_grain= state.currentEditItem.paper_grain;
                        e.width= state.currentEditItem.width;
                        e.height= state.currentEditItem.height;
                        e.cover= state.currentEditItem.cover;
                        e.text= state.currentEditItem.text;
                        e.endpaper= state.currentEditItem.endpaper;
                        e.belt= state.currentEditItem.belt;
                        e.memo= state.currentEditItem.memo;
                        e.simulation_yn= state.currentEditItem.simulation_yn;
                        e.use_yn= state.currentEditItem.use_yn;
                        chk = false;
                    }
                }else{
                    if(e.addCode === state.currentEditItem.addCode){
                        e.paper_gsm= state.currentEditItem.paper_gsm;
                        e.paper_company= state.currentEditItem.paper_company;
                        e.paper_color= state.currentEditItem.paper_color;
                        e.paper_type= state.currentEditItem.paper_type;
                        e.paper_standard= state.currentEditItem.paper_standard;
                        e.paper_grain= state.currentEditItem.paper_grain;
                        e.width= state.currentEditItem.width;
                        e.height= state.currentEditItem.height;
                        e.cover= state.currentEditItem.cover;
                        e.text= state.currentEditItem.text;
                        e.endpaper= state.currentEditItem.endpaper;
                        e.belt= state.currentEditItem.belt;
                        e.memo= state.currentEditItem.memo;
                        e.simulation_yn= state.currentEditItem.simulation_yn;
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
                state.flex.collectionView.remove(state.currentEditItem);
                state.addBtn = true;
                state.addCnt = state.addCnt+1;
            }
            state.currentEditItem.rowAdd = false;
            state.currentEditItem = null;
            state.flex.invalidate();
            state.flex.collectionView.refresh();
        }
    }

    const [modalPriceModify, setModalPriceModify] = useState(false);
    const [modalPriceHistory, setModalPriceHistory] = useState(false);
    const [modalPriceList, setModalPriceList] = useState(false);
    const modifyCancel= (obj)=> {
        if(obj == 'modify'){
            stateData.apply_date = "";
            stateData.price = "";
            setModalPriceModify(false);
        }
        if(obj == 'history'){
            setModalPriceHistory(false);
        }
        if(obj == 'list'){
            setModalPriceList(false);
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
                msg = "고시가격을 입력하세요.";
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
            }else{  //일괄 수정
                //submit
                handlePriceSubmit();
            }
        }
        if(obj == 'history'){
            setModalPriceHistory(false);
        }
        if(obj == 'list'){
            setModalPriceList(false);
        }
    }

    const handlePriceInput = (type) => (e) => {
        if(type === "apply_date"){
            stateData[type] = e; 
        }else{
            stateData[type] = e.target.value;
        }
    }

    const handlePriceSubmit = useCallback(async ()=> {
        var data = [];

        state.selected.map((e)=>{
            data = [...data,{id:e,prices:[{price:stateData.price,apply_date:moment(stateData.apply_date).format('YYYY-MM-DD')}]}];
        });

        commonStore.handleApi({
            method : 'POST', 
            url : `/paper-information`,
            data: data
        }).then((result) => {
            Modal.success({
                title: result.result,
                onOk(){
                    viewData();
                    state.selected = null;
                    stateData.apply_date = "";
                    stateData.price = "";
                    modifyCancel('modify')
                },
            });
        })
    }, []);

    const modalOpen = (obj, item) => {
        if(obj == 'modify'){
            stateData.apply_date = state.flex.hostElement.querySelector('#apply_date').value!=""?moment(state.flex.hostElement.querySelector('#apply_date').value):moment().add(1,'M').startOf('month');
            stateData.price = state.flex.hostElement.querySelector('#price').value.replace(/,/g, "");
            setModalPriceModify(true);
        }
        if(obj == 'modify_total'){
            stateData.apply_date = moment().add(1,'M').startOf('month');
            setModalPriceModify(true);
        }
        if(obj == 'history'){
            var temp_history = [];
            toJS(item.prices).map(e=>{
                temp_history = [...temp_history,{price:e.price,apply_date:e.apply_date,worker:e.created_info?.name}];
            })
            state.historyList = temp_history;
            setModalPriceHistory(true);
        }
        if(obj == 'list'){
            var temp_history = [];
            toJS(item.supply).map(e=>{
                temp_history = [...temp_history,{company:e.company,rate_discount:e.rate_discount,price:e.price,apply_date:e.apply_date}];
            })
            state.discountList = temp_history;
            setModalPriceList(true);
        }
    }

    const handleReset = useCallback(() => {
        return confirm({
            title: `이 창의 입력 내용이 삭제됩니다.`,
            content: `그래도 계속 하시겠습니까?`,
                async onOk() {
                    viewData();
                    state.selected = null;
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
                gsm: item.paper_gsm,
                paper_company_id: item.paper_company_id,
                paper_color_id: item.paper_color_id,
                paper_type_id: item.paper_type_id,
                cover: item.cover,
                text: item.text,
                endpaper: item.endpaper,
                belt: item.belt,
                prices : [{
                    price : item.price,
                    apply_date : item.apply_date
                }],
                memo: item.memo,
                simulation_yn: item.simulation_yn,
                use_yn: item.use_yn
            };
            
            if(item.id>0){
                temp['id'] = item.id;
            }
            if(item.paper_standard_id=="0"){
                temp['paper_standard'] = item.paper_standard;
                temp['paper_grain'] = item.paper_grain;
                temp['width'] = item.width;
                temp['height'] = item.height;
            }else{
                temp['paper_standard_id'] = item.paper_standard_id;
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
                    {state.priceEditBl === true && state.currentEditItem === null ? (
                        <Button
                            className=''
                            type='primary'
                            onClick={(e) => {modalOpen('modify_total')}}
                        >
                            고시가격 일괄수정
                        </Button>
                    ) : (
                        <Button className="btn btn-primary btn_add" shape="circle" onClick={(e) => {rowAdd(state.addBtn)}} >
                            {state.addBtn === true ? '+' : '-'}
                        </Button>
                    )}
                </Col>
            </Row>

            <Row className="gridWrap">       
                <FlexGrid 
                    ref={theGrid}
                    itemsSource={state.list} 
                    stickyHeaders={true} 
                    initialized={(s) => initGrid(s)}
                    // allowAddNew={state.allowAddNew}
                    allowSorting={false}
                    allowMerging="ColumnHeaders"
                    selectionMode="None"
                    allowDragging="Both"
                    // headersVisibility="Column"
                    newRowAtTop={true}
                    autoRowHeights={true}
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                    <FlexGridColumn binding="chk" header=" " width={40} cssClass="chk" />
                    <FlexGridColumn binding="paper_code" header="종이\n코드" width={70} />
                    <FlexGridColumn binding="paper_gsm" header="평량\n(g/㎡)" width={70} align="right" />
                    <FlexGridColumn binding="paper_company" header="제조사" width={80}>
                        <FlexGridCellTemplate
                            cellType="Cell"
                            template={(cell) => {;
                                let result = state[cell.col.binding].find(col => col.name == cell.item.paper_company);
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
                                            selectedValue={result ? result.id : ''}
                                            style={{ width: '100%' }}
                                        />
                                    );
                                } else {
                                    return cell.item.paper_company;
                                }
                            }}
                        />
                    </FlexGridColumn>
                    <FlexGridColumn binding="paper_color" header="색상" width={80}>
                        <FlexGridCellTemplate
                            cellType="Cell"
                            template={(cell) => {
                                let result = state[cell.col.binding].find(col => col.name == cell.item.paper_color);
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
                                            selectedValue={result ? result.id : ''}
                                            style={{ width: '100%' }}
                                        />
                                    );
                                } else {
                                    return cell.item.paper_color;
                                }
                            }}
                        />
                    </FlexGridColumn>
                    <FlexGridColumn binding="paper_type" header="종이\n종류" width={70} >
                        <FlexGridCellTemplate
                            cellType="Cell"
                            template={(cell) => {
                                let result = state[cell.col.binding].find(col => col.name == cell.item.paper_type);
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
                                            selectedValue={result ? result.id : ''}
                                            style={{ width: '100%' }}
                                        />
                                    );
                                } else {
                                    return cell.item.paper_type;
                                }
                            }}
                        />
                    </FlexGridColumn>
                    <FlexGridColumn binding="paper_standard" header="종이\n규격" width={70}>
                        <FlexGridCellTemplate
                            cellType="Cell"
                            template={(cell) => {
                                if(cell.item.rowAdd) {
                                    let result = state[cell.col.binding].find(col => col.name == cell.item.paper_standard);
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
                                            selectedValue={result ? result.id : ''}
                                            selectedIndexChanged={inputChangeHandler}
                                            style={{ width: '100%' }}
                                        />
                                    );
                                } else {
                                    return cell.item.paper_standard;
                                }
                            }}
                        />
                    </FlexGridColumn>
                    <FlexGridColumn binding="paper_grain" header="종이결" width={60}>
                        <FlexGridCellTemplate
                            cellType="Cell"
                            template={(cell) => {
                                
                                if(cell.item.rowAdd) {
                                    return (
                                        <wjInput.ComboBox
                                            id={cell.col.binding}
                                            placeholder="선택"
                                            itemsSource={new CollectionView(PAPER_GRAIN, {
                                                currentItem: null
                                            })}
                                            selectedValue={cell.item.paper_grain}
                                            style={{ width: '100%' }}
                                        />
                                    );
                                } else {
                                    return cell.item.paper_grain;
                                }
                            }}
                        />
                    </FlexGridColumn>
                    <FlexGridColumn binding="width" header="가로\n(mm)" width={60} align="right" />
                    <FlexGridColumn binding="height" header="세로\n(mm)" width={60} align="right" />
                    <FlexGridColumn binding="cover" header="표지" width={60} align="center" />
                    <FlexGridColumn binding="text" header="본문" width={60} align="center" />
                    <FlexGridColumn binding="endpaper" header="면지" width={60} align="center" />
                    <FlexGridColumn binding="belt" header="띠지" width={60} align="center" />
                    <FlexGridColumn binding="memo" header="추가\n표시 정보" width={80} />
                    <FlexGridColumn binding="paper_name" header="종이명" width={'*'} minWidth={180} />
                    <FlexGridColumn binding="price" header="고시가격" width={80} align="right"/>
                    <FlexGridColumn binding="apply_date" header="고시가격\n적용일" width={90} />
                    <FlexGridColumn binding="simulation_yn" header="시뮬레이션\n적용" width={100} align="center" />
                    <FlexGridColumn binding="use_yn" header="사용\n여부" width={60} align="center" />
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

            <Modal title="고시 가격 수정" visible={modalPriceModify} onCancel={(e) => {modifyCancel('modify')}} onOk={(e) => {modifyOk('modify',e)}}>
                <Row gutter={10} className="table">
                    <Col xs={24} lg={8} className="label">
                        적용일 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={16}>
                        <DatePicker name="apply_date" onChange={handlePriceInput('apply_date')} value={stateData.apply_date}/>
                    </Col> 
                    <Col xs={24} lg={8} className="label">
                        수정 고시가격 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={16}>
                        <Input type="number" name="price" onChange={handlePriceInput('price')} value={stateData.price}/>
                    </Col> 
                </Row>
            </Modal>

            <Modal title="고시가격 변경 이력" visible={modalPriceHistory} onCancel={(e) => {modifyCancel('history')}} footer={null}>
                <FlexGrid 
                    itemsSource={state.historyList} 
                    headersVisibility="Column"
                    selectionMode="None"
                >
                    <FlexGridColumn binding="price" header="고시가격" width={'*'} align="right" />
                    <FlexGridColumn binding="apply_date" header="고시가격 적용일" width={150} align="center" />
                    <FlexGridColumn binding="worker" header="작업자" width={150} align="center" />
                </FlexGrid>
            </Modal>

            <Modal title="종이 공급처와 할인율" visible={modalPriceList} onCancel={(e) => {modifyCancel('list')}} footer={null}>
                <FlexGrid 
                    itemsSource={state.discountList} 
                    initialized={(s) => initListGrid(s)}
                    allowDragging="Both"
                    selectionMode="None"
                >
                    <FlexGridColumn binding="company" header="종이 공급처" width={'*'} align="left" />
                    <FlexGridColumn binding="rate_discount" header="할인율" width={60} align="center" />
                    <FlexGridColumn binding="price" header="단가" width={100} align="right" />
                    <FlexGridColumn binding="apply_date" header="할인율 적용일" width={120} align="center" />
                </FlexGrid>
            </Modal>

        </Wrapper>
    );
});

export default paperCompanyList;
