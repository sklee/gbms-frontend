/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pagination, Button, Row, Col, message, Modal, Select, Checkbox, DatePicker, Input, Space} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';
import moment from 'moment';
import axios from 'axios';

import '@grapecity/wijmo.touch'; // support drag/drop on touch devices
import { FlexGrid, FlexGridColumn, FlexGridCellTemplate } from '@grapecity/wijmo.react.grid';
import { CollectionViewNavigator } from "@grapecity/wijmo.react.input";
import * as wjInput from '@grapecity/wijmo.react.input';
import { Selector } from "@grapecity/wijmo.grid.selector";
import { HeadersVisibility } from "@grapecity/wijmo.grid";
import * as wjcCore from "@grapecity/wijmo";
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { CollectionView , changeType, DataType, isNumber } from '@grapecity/wijmo';

import * as FlexLayout from 'flexlayout-react';
import '/node_modules/flexlayout-react/style/light.css';


const Wrapper = styled.div`
    width: 100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
    #tplBtnViewMode, #tplBtnEditMode {display:none}
`;
const DEF_STATE = {
    // DB Data
    apply_date:"",
    fixed_royalties: [{
        qty:0,
        end_yn:'',
        price:''
    }],
};
const DEF_ROYALTY = {
    qty:'',
    end_yn:'',
    price:''
};
//가격 modal validation 체크
const PRINT_UNIT = ["표지","본문","면지"];

const printingList = observer(({tab}) => {
    const { commonStore } = useStore();
    const { Option } = Select;    
    const { confirm } = Modal;

    const stateData = useLocalStore(() => ({...DEF_STATE})); 
    const tempData = useLocalStore(() => ({...DEF_STATE}));
    const state = useLocalStore(() => ({
        type : 'process-printing',
        list: [],
        selPriceInfo:[],
        historyList:[],
        produce_company : [],
        print_unit:[],
        paper_standard:[],
        data: [],
        ord:[],
        addCnt : 1,
        disabled : false,

        today: moment().format('YYYY-MM-DD'),

        addBtn : true,              //추가버튼 활성화
        currentEditItem : null,     //row data
        sel:'',
        flex:'',
        prInp:false,
        gridFilter: null,
    }));    
    
    useEffect(() => { 
        getCompany();
        getStandards();
        viewData();
    }, []);

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
        state.produce_company = result.data.data.filter(e => e.process===null ? false : e.process.includes('후가공'));
    },[]);

    const getStandards = useCallback(async () =>{
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/paper-standards',
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            },
        );
        state.paper_standard = result.data.data;
    },[]);

    //리스트
    const viewData = useCallback(async (val) => {
        if (val == '' || val == '0' || val == undefined) var page = 1;
        else var page = val;
        var axios = require('axios');

        var config = {
            method: 'GET',
            url:
                process.env.REACT_APP_API_URL +'/api/v1/' +state.type,
            headers: {
                Accept: 'application/json',
            },
        };

        axios(config)
            .then(function (response) {

                state.list = new CollectionView([...response.data.data], {pageSize : 10});
                // state.list = response.data.data;
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
        filter.filterColumns = ["produce_company", "print_unit", "paper_standard", "frequency", "price", "apply_date", "memo", "simulation_yn", "use_yn", "buttons" ];
    };

    const initGrid = (grid) => {    
        state.flex= grid;

        // let extraRow = new wjGrid.Row();
        // extraRow.allowMerging = true;
        // var panel = grid.columnHeaders;
        // panel.rows.splice(0, 0, extraRow);

        state.sel = new Selector(grid, {})
        state.sel._col.allowMerging = true;

        // state.sel.column = ;

        // for (let colIndex = 0; colIndex <= 14; colIndex++) {
        //     if(colIndex >= 4 && colIndex <= 8){ 
        //         panel.setCellData(0, colIndex, '1대당 종이 여분 매수');
        //     } else {
        //         let col = grid.getColumn(colIndex);
        //         col.allowMerging = true;
        //         panel.setCellData(0, colIndex, col.header);
        //     }            
        // }

        grid.formatItem.addHandler(function (s, e) {
            if(e.panel._ct == 4){
                e.cell.innerHTML = '<div class="v-center">순서</div>';
            }
            if(e.panel == s.rowHeaders){
                // e.cell.innerHTML = '';
                e.cell.innerHTML = s.rows[e.row].dataItem.ordnum?s.rows[e.row].dataItem.ordnum:'';
                e.cell['dataItem'] = s.rows[e.row].dataItem;
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
                        //     var opt = '<option value="">선택</option>';
                        //     for (let index = 0; index < state[col.binding].length; index++) {
                        //         // opt += '<option>'+ state[col.binding][index] +'</option>';
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
                        // case 'paper_standard' :
                        //     var opt = '<option value="">공통</option>';
                        //     for (let index = 0; index < state[col.binding].length; index++) {
                        //         // opt += '<option>'+ state[col.binding][index] +'</option>';
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
                        // case 'print_unit' : 
                        //     var opt= '<option value="">선택</option>';
                        //     for (let index = 0; index < PRINT_UNIT.length; index++) {
                        //         // opt += '<option>'+ PROCESS_UNIT[index] +'</option>';
                        //         if(s.getCellData(e.row, e.col, true)===PRINT_UNIT[index]){
                        //             opt += '<option value="'+PRINT_UNIT[index]+'" selected>'+ PRINT_UNIT[index] +'</option>';
                        //         }else{
                        //             opt += '<option value="'+PRINT_UNIT[index]+'">'+ PRINT_UNIT[index] +'</option>';
                        //         }
                        //     }
                        //     var inhtml = '<select class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'">' +
                        //                 opt +
                        //                 '</select>';
                        //     e.cell.innerHTML = inhtml
                        //     e.cell['dataItem'] = item;
                        //     break;
                        // case 'frequency' :
                        //     var checked = "";
                        //     var disabled = ""
                        //     if(item.print_unit!=="본문"){
                        //         disabled = "disabled";
                        //     }
                        //     var inhtml = '<div class="frequencyWrap">';
                        //         checked = item.cmyk1 == "Y" ?  'checked="checked"' : '';
                        //         inhtml += '<label><input type="checkbox" name="cmyk1'+item.id+'" id="cmyk1" value="'+item.cmyk1+'" '+checked+' '+disabled+' /> 1도</label>';
                        //         checked = item.cmyk2 == "Y" ?  'checked="checked"' : '';
                        //         inhtml += '<label><input type="checkbox" name="cmyk2'+item.id+'" id="cmyk2" value="'+item.cmyk2+'" '+checked+' '+disabled+' /> 2도</label>';
                        //         checked = item.cmyk3 == "Y" ?  'checked="checked"' : '';
                        //         inhtml += '<label><input type="checkbox" name="cmyk3'+item.id+'" id="cmyk3" value="'+item.cmyk3+'" '+checked+' '+disabled+' /> 3도</label>';
                        //         checked = item.cmyk4 == "Y" ?  'checked="checked"' : '';
                        //         inhtml += '<label><input type="checkbox" name="cmyk4'+item.id+'" id="cmyk4" value="'+item.cmyk4+'" '+checked+' '+disabled+' /> 4도</label>';
                        //         inhtml += '</div>';
                        //     e.cell.innerHTML = inhtml;
                        //     break;
                        case 'price':
                            let priceWrap = '';
                            if(state.currentEditItem.id < 1){
                                priceWrap ='<button class="btnText title btnRed btn_price_ipt">단가 입력</button>';
                            }else{
                                priceWrap ='<button class="btnText title btnRed btn_price_modify">단가 수정</button>';
                            }
                            e.cell.innerHTML = priceWrap;
                            e.cell['dataItem'] = item;
                            break;
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
                        case 'paper_standard' :
                            state.currentEditItem[col.binding+'_id'] = toJS(state[col.binding]).find(e => e.name == item[col.binding])?.id;
                            if(state.currentEditItem[col.binding+'_id'] == undefined){
                                state.currentEditItem[col.binding+'_id'] = "";
                            }
                            break;
                        // case 'frequency' :
                        //     var checked = "";
                        //     var inhtml = '<div class="frequencyWrap">';
                        //         checked = item.cmyk1 == "Y" ?  'checked="checked"' : '';
                        //         inhtml += '<label><input type="checkbox" name="'+item.id+'" id="cmyk1'+item.id+'" value="'+item.cmyk1+'" '+checked+' onClick="return false;"/> 1도</label>';
                        //         checked = item.cmyk2 == "Y" ?  'checked="checked"' : '';
                        //         inhtml += '<label><input type="checkbox" name="'+item.id+'" id="cmyk2'+item.id+'" value="'+item.cmyk2+'" '+checked+' onClick="return false;"/> 2도</label>';
                        //         checked = item.cmyk3 == "Y" ?  'checked="checked"' : '';
                        //         inhtml += '<label><input type="checkbox" name="'+item.id+'" id="cmyk3'+item.id+'" value="'+item.cmyk3+'" '+checked+' onClick="return false;"/> 3도</label>';
                        //         checked = item.cmyk4 == "Y" ?  'checked="checked"' : '';
                        //         inhtml += '<label><input type="checkbox" name="'+item.id+'" id="cmyk4'+item.id+'" value="'+item.cmyk4+'" '+checked+' onClick="return false;"/> 4도</label>';
                        //         inhtml += '</div>';
                        //     e.cell.innerHTML = inhtml;
                        //     break;
                        case 'memo' :
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'"'+'value="'+s.getCellData(e.row, e.col, true)+'"/>';
                            break;
                        case 'price':
                            let priceWrap = '';
                            if(state.currentEditItem.id < 1){
                                priceWrap ='<button class="btnText title btnRed btn_price_ipt">단가 입력</button>';
                            }else{
                                priceWrap ='<button class="btnText title btnRed btn_price_modify">단가 수정</button>';
                            }
                            e.cell.innerHTML = priceWrap;
                            e.cell['dataItem'] = item;
                            break;
                        case 'apply_date' :
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'"'+'value="'+s.getCellData(e.row, e.col, true)+'" readonly/>';
                            e.cell['dataItem'] = item;
                            break;
                        case 'simulation_yn':
                            if(item.simulation_yn == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + item.id + '" type="checkbox" name= "'+item.id+'" value="'+item.simulation_yn+'" '+checked+' />';
                            break;
                        case 'use_yn':
                            if(item.use_yn == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + item.id + '" type="checkbox" name= "'+item.id+'" value="'+item.use_yn+'" '+checked+' />';
                            break;
                        case 'buttons':
                            let btn = '<button id="btnOK" class="btnText blueTxt">확인</button><button id="btnCancel" class="btnText grayTxt">취소</button>';
                            e.cell.innerHTML = btn;
                            e.cell['dataItem'] = item;
                            break;
                    }
                }else {
                    // create buttons for items not being edited
                    switch (col.binding) {
                        case 'price':
                            var data = item.price,
                                inhtml = '';
                            for (let index = 0; index < data.length; index++) {
                                const obj = data[index];
                                if(index === 0){
                                    inhtml +='<div>1 ~ ' + obj.qty + ' : <button class="btnText title btnRed btn_price">' + obj.price +' 원</button></div>';
                                }else if(index == data.length-1){
                                    inhtml +='<div>' + data[index-1].qty + ' ~ : <button class="btnText title btnRed btn_price">' + obj.price +' 원</button></div>';
                                }else{
                                    inhtml +='<div>' + data[index-1].qty + ' ~ ' + obj.qty + ' : <button class="btnText title btnRed btn_price">' + obj.price +' 원</button></div>';
                                }
                            }
                            e.cell.innerHTML = inhtml;
                            e.cell['dataItem'] = item;
                            break;
                        // case 'frequency':
                        //     if(item.cmyk1 == "Y" ){
                        //         var checked = 'checked="checked"';
                        //     }else{
                        //         var checked = '';
                        //     }
                        //     e.cell.innerHTML = '<input id="' + col.binding + item.id + '" type="checkbox" name= "'+item.id+'" value="'+item.cmyk1+'" '+checked+' />';
                        //     break;
                        // case 'frequency' :
                        //     var checked = "";
                        //     var inhtml = '<div class="frequencyWrap">';
                        //         checked = item.cmyk1 == "Y" ?  'checked="checked"' : '';
                        //         inhtml += '<label><input type="checkbox" name="'+item.id+'" id="cmyk1'+item.id+'" value="'+item.cmyk1+'" '+checked+' onClick="return false;"/> 1도</label>';
                        //         checked = item.cmyk2 == "Y" ?  'checked="checked"' : '';
                        //         inhtml += '<label><input type="checkbox" name="'+item.id+'" id="cmyk2'+item.id+'" value="'+item.cmyk2+'" '+checked+' onClick="return false;"/> 2도</label>';
                        //         checked = item.cmyk3 == "Y" ?  'checked="checked"' : '';
                        //         inhtml += '<label><input type="checkbox" name="'+item.id+'" id="cmyk3'+item.id+'" value="'+item.cmyk3+'" '+checked+' onClick="return false;"/> 3도</label>';
                        //         checked = item.cmyk4 == "Y" ?  'checked="checked"' : '';
                        //         inhtml += '<label><input type="checkbox" name="'+item.id+'" id="cmyk4'+item.id+'" value="'+item.cmyk4+'" '+checked+' onClick="return false;"/> 4도</label>';
                        //         inhtml += '</div>';
                        //     e.cell.innerHTML = inhtml;
                        //     break;
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
                    modalOpen('modify',wjCore.closest(e.target, '.wj-cell')['dataItem']);
                }
                if(e.target.classList.contains('btn_price_ipt')){
                    modalOpen('ipt',wjCore.closest(e.target, '.wj-cell')['dataItem']);
                }
                if(e.target.classList.contains('btn_price')){
                    modalOpen('price',wjCore.closest(e.target, '.wj-cell')['dataItem']);
                }
                
                switch (e.target.id) {
                    // start editing this item
                    case 'btnEdit':
                        if(state.currentEditItem===null){
                            let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                            // state.selPriceInfo = item.price;
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
                    case 'simulation_yn':
                    case 'cmyk1':
                    case 'cmyk2':
                    case 'cmyk3':
                    case 'cmyk4':
                        if(state.currentEditItem[e.target.id] === 'Y'){
                            grid.hostElement.querySelector('#'+e.target.id).value='N';
                            state.currentEditItem[e.target.id] = 'N'
                        }else{
                            grid.hostElement.querySelector('#'+e.target.id).value='Y';
                            state.currentEditItem[e.target.id] = 'Y'
                        }
                        break;
                    case 'apply_date':
                        modalOpen('ipt');
                        break;
                }    
            }
        });

        // grid.addEventListener(grid.hostElement, 'change', (e) => {
        //     if(e.target.id == "print_unit"){
        //         let input = state.flex.hostElement.querySelector('#' + e.target.id);
        //         if(input){
        //             if(input.value=="본문"){
        //                 state.flex.hostElement.querySelector('#cmyk1').disabled = false;
        //                 state.flex.hostElement.querySelector('#cmyk2').disabled = false;
        //                 state.flex.hostElement.querySelector('#cmyk3').disabled = false;
        //                 state.flex.hostElement.querySelector('#cmyk4').disabled = false;
        //             }else{
        //                 state.flex.hostElement.querySelector('#cmyk1').disabled = true;
        //                 state.flex.hostElement.querySelector('#cmyk2').disabled = true;
        //                 state.flex.hostElement.querySelector('#cmyk3').disabled = true;
        //                 state.flex.hostElement.querySelector('#cmyk4').disabled = true;
        //             }
        //         }
        //     }

        // });
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
                paper_standard:'',
                cmyk1:'',
                cmyk2:'',
                cmyk3:'',
                cmyk4:'',
                price: [],
                apply_date: '',
                prices:[],
                memo: '',
                simulation_yn: '',
                use_yn: '',
                addCode: '',
                rowAdd: true
            };
            var view = new CollectionView(state.list)
            view.sourceCollection.splice(0 ,0,state.currentEditItem); //값 삽입
            // state.flex.columns[3]._sz=200;
            state.flex.collectionView.refresh(state.currentEditItem); // 삽입된 값 그리드에 반영         
            state.addBtn = false;  
            
        }else{ //행추가를 취소할때
            state.flex.collectionView.remove(state.currentEditItem);
            // state.flex.columns[3]._sz=100;
            state.addBtn = true;
            state.addCnt = state.addCnt+1;
            state.currentEditItem = null;
        }
        
    }
    //수정 버튼 
    const editItem = (item) => {
        state.currentEditItem = item;
        state.currentEditItem.rowAdd = true;
        if(item && item.print_unit === '본문'){
            state.disabled = true
        }else{
            state.disabled = false
        }
        tempData.apply_date = item.apply_date;
        tempData.fixed_royalties = toJS(item.price);
        state.flex.invalidate();
        state.flex.collectionView.refresh();
       
    }

    const validationChk= (item)=> {
        var result = {validate :true, msg : ""};
        var valid = tempData.fixed_royalties;

        if(item.produce_company==""){
            result.validate = false;
            result.msg = "제작처를 선택하세요.";
            return result;
        }else if(item.print_unit ==""){
            result.validate = false;
            result.msg = "인쇄 단가를 선택하세요.";
            return result;
        }else if(toJS(valid).length < 1){
            result.validate = false;
            result.msg = "단가를 입력하세요.";
            return result;
        }else if(item.apply_date ==""){
            result.validate = false;
            result.msg = "적용일을 입력하세요.";
            return result;
        }else if(valid[valid.length-1].end_yn != 'Y'){
            result.validate = false;
            result.msg  = '단가의 끝까지 항목을 체크해주세요.';
        }else{
            var loopchk = false;
            valid.forEach((item) => {
                if(item.qty ==='' && item.end_yn != 'Y'){
                    result.msg  = '부수 범위를 공란없이 입력해주세요.';
                    loopchk = true;
                }
                if(item.price === ''){
                    result.msg  = '단가를 공란없이 입력해주세요.';
                    loopchk = true;
                }
            });

            if(loopchk!==false){
                result.validate = false;
            }

            return result;
        }
    }

    //확인 버튼
    const commitEdit=(idx)=> {
        if (state.currentEditItem) {
            var validator = {};
            state.flex.columns.map((col) => {
                let input = state.flex.hostElement.querySelector('#' + col.binding); 
                let inputId = input?.getAttribute('id');
                if(inputId == 'produce_company' || inputId == 'print_unit' || inputId == 'paper_standard'){
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
                    if(inputId === 'produce_company'){
                        let text = input.querySelector('.wj-form-control').value;
                        let result = state.produce_company.filter(col => col.name == text );
                        state.currentEditItem[col.binding] = text;
                        state.currentEditItem['produce_company_id'] = result[0]?.id;
                    }
                    if(inputId === 'print_unit'){
                        let text = input.querySelector('.wj-form-control').value;
                        state.currentEditItem[col.binding] = text;
                    }
                    if(col.binding === 'paper_standard'){
                        let text = input.querySelector('.wj-form-control').value;
                        let result = state.paper_standard.filter(col => col.name == text );
                        state.currentEditItem[col.binding] = text;
                        state.currentEditItem['paper_standard_id'] = result[0]?.id;
                    }
                    if(col.binding === 'cmyk1' || col.binding === 'cmyk2' || col.binding === 'cmyk3' || col.binding === 'cmyk4'){
                        state.currentEditItem[col.binding] = value;
                    }
                    if(col.binding === 'simulation_yn'){
                        state.currentEditItem[col.binding] = value;
                    }
                    if(col.binding === 'apply_date'){
                        state.currentEditItem[col.binding] = value;
                    }
                    if(col.binding === 'use_yn'){
                        state.currentEditItem[col.binding] = value;
                        if(value!=='Y'){
                            state.currentEditItem['simulation_yn'] = 'N';
                        }
                    }
                    if(state.currentEditItem.id <= 0){
                        state.currentEditItem.addCode = state.currentEditItem.id;
                    }
                }                
            });

            if(stateData.fixed_royalties.length > 0){
                // state.currentEditItem.price = toJS(stateData.fixed_royalties);
                state.currentEditItem.price = toJS(tempData.fixed_royalties);
            }

            if(state.currentEditItem.addCode !== undefined){ //수정일 때는 동작 안함
                if(state.flex.hostElement.querySelector('#print_unit').value === "본문" ){
                    if(state.flex.hostElement.querySelector('#cmyk1')){
                        state.currentEditItem['cmyk1'] = state.flex.hostElement.querySelector('#cmyk1').value;
                    }
                    if(state.flex.hostElement.querySelector('#cmyk2')){
                        state.currentEditItem['cmyk2'] = state.flex.hostElement.querySelector('#cmyk2').value;
                    }
                    if(state.flex.hostElement.querySelector('#cmyk3')){
                        state.currentEditItem['cmyk3'] = state.flex.hostElement.querySelector('#cmyk3').value;
                    }
                    if(state.flex.hostElement.querySelector('#cmyk4')){
                        state.currentEditItem['cmyk4'] = state.flex.hostElement.querySelector('#cmyk4').value;
                    }
                }else{
                    state.currentEditItem['cmyk1'] = 'Y';
                    state.currentEditItem['cmyk2'] = 'Y';
                    state.currentEditItem['cmyk3'] = 'Y';
                    state.currentEditItem['cmyk4'] = 'Y';
                }
            }

            tempData.apply_date = "";
            tempData.fixed_royalties = [DEF_ROYALTY];
        }

        if(state.data.length > 0){
            var chk = true;
            state.data.forEach((e) => {    
                //기존 배열에 들어간 user_id와 같으면 값 수정
                if(e.id > 0){
                    if(e.id === state.currentEditItem.id){
                        e.id= state.currentEditItem.id;
                        e.produce_company= state.currentEditItem.produce_company;
                        e.paper_standard= state.currentEditItem.paper_standard;
                        e.cmyk1= state.currentEditItem.cmyk1;
                        e.cmyk2= state.currentEditItem.cmyk2;
                        e.cmyk3= state.currentEditItem.cmyk3;
                        e.cmyk4= state.currentEditItem.cmyk4;
                        e.apply_date= state.currentEditItem.apply_date;
                        e.use_yn= state.currentEditItem.use_yn;
                        e.simulation_yn= state.currentEditItem.simulation_yn;
                        chk = false;
                    }
                }else{
                    if(e.addCode === state.currentEditItem.addCode){
                        e.name= state.currentEditItem.name;
                        e.produce_company= state.currentEditItem.produce_company;
                        e.paper_standard= state.currentEditItem.paper_standard;
                        e.cmyk1= state.currentEditItem.cmyk1;
                        e.cmyk2= state.currentEditItem.cmyk2;
                        e.cmyk3= state.currentEditItem.cmyk3;
                        e.cmyk4= state.currentEditItem.cmyk4;
                        e.apply_date= state.currentEditItem.apply_date;
                        e.use_yn= state.currentEditItem.use_yn;
                        e.simulation_yn= state.currentEditItem.simulation_yn;
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
        state.disabled = false
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

            tempData.apply_date  = "";
            tempData.fixed_royalties = [DEF_ROYALTY];

            state.currentEditItem.rowAdd = false;
            state.currentEditItem = null;
            state.disabled = false
            state.flex.invalidate();
            state.flex.collectionView.refresh();
        }
    }

    const [modalPriceModify, setModalPriceModify] = useState(false);
    const [modalPriceHistory, setModalPriceHistory] = useState(false);
    const modalCancel= (obj)=> {
        if(obj == 'modify'){
            stateData.apply_date = "";
            stateData.fixed_royalties = [DEF_ROYALTY];
            setModalPriceModify(false);
        }
        if(obj == 'price'){
            setModalPriceHistory(false);
        }
        
    }

    const modifyOk= (obj,e)=> {
        if(obj == 'modify'){
            if(state.currentEditItem!== null){  //등록,수정
                var valid = stateData.fixed_royalties;
                var validate = true;
                var msg = "";
                if(stateData.apply_date =="" || stateData.apply_date == null){
                    msg = "적용일을 입력하세요.";
                    validate = false;
                }else if(valid[valid.length-1].end_yn != 'Y'){
                    msg  = '부수 범위의 끝까지 항목을 체크해주세요.';
                    validate = false;
                }

                if(validate!==true){
                    Modal.error({
                        content: msg,        
                    });
                    return false;
                }

                var loopchk = false;
                valid.forEach((item) => {
                    if(item.qty ==='' && item.end_yn != 'Y'){
                        msg  = '부수 범위를 공란없이 입력해주세요.';
                        loopchk = true;
                    }
                    if(item.price === ''){
                        msg  = '단가를 공란없이 입력해주세요.';
                        loopchk = true;
                    }
                });
                if(loopchk!==false){
                    Modal.error({
                        content: msg,
                    });
                    return false;
                }
                state.flex.hostElement.querySelector('#apply_date').value = moment(stateData.apply_date).format('YYYY-MM-DD');
                // tempData.apply_date = toJS(stateData).apply_date;
                tempData.fixed_royalties = toJS(stateData.fixed_royalties);

                stateData.apply_date = "";
                stateData.fixed_royalties = [DEF_ROYALTY];

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
            if(item.price && item.price.length > 0){
                stateData.fixed_royalties = toJS(tempData.fixed_royalties);
            }
            setModalPriceModify(true);
        }
        if(obj == 'ipt'){
            state.prInp=true;
            stateData.apply_date = state.flex.hostElement.querySelector('#apply_date').value!=""?moment(state.flex.hostElement.querySelector('#apply_date').value):moment().add(1,'M').startOf('month');
            // stateData.fixed_royalties = [DEF_ROYALTY];
            stateData.fixed_royalties = toJS(tempData.fixed_royalties);
            setModalPriceModify(true);
        }
        if(obj == 'price'){
            var temp_history = [];
            toJS(item.prices).map(e=>{
                temp_history = [...temp_history,{price:e.price_sub,apply_date:e.apply_date,worker:e.created_info?.name}];
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
                    case 'price':
                        var data = item.price,
                            inhtml = '';
                        for (let index = 0; index < data.length; index++) {
                            const obj = data[index];
                            if(index == 0){
                                inhtml +='<div> 1 ~ '+obj.qty+' : '+obj.price+' 원 </div>';
                            }else if(index ==data.length-1){
                                inhtml +='<div> '+data[index-1].qty+' ~ 끝까지 : '+obj.price+' 원 </div>';
                            }else{
                                inhtml +='<div> '+data[index-1].qty+' ~ '+obj.qty+' : '+obj.price+' 원 </div>';
                            }
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

    const handleChangeRoyalty = useCallback(
        (idx,type) => (e) => {
            if(type === 'end_yn'){
                stateData['fixed_royalties'][idx][type] = e.target.checked ? 'Y' : 'N';
                if(e.target.checked){
                    stateData['fixed_royalties'] = toJS(stateData['fixed_royalties']).filter((item,index) => index <= idx);
                }
            }else{
                stateData['fixed_royalties'][idx][type] = e.target.value;
            }
            // booksVal('books',stateData);
        },[],
    );
    const handleInputRoyalty = useCallback(
        () => (e) => {
            stateData['fixed_royalties'] = [...toJS(stateData['fixed_royalties']),DEF_ROYALTY];
            // booksVal('books',stateData);
        },[],
    );

    const handleReset = useCallback(() => {
        return confirm({
            title: `이 창의 입력 내용이 삭제됩니다.`,
            content: `그래도 계속 하시겠습니까?`,
                async onOk() {
                    getCompany();
                    getStandards();
                    viewData();
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
                print_unit: item.print_unit,
                paper_standard_id: item.paper_standard_id,
                cmyk1 : item.cmyk1,
                cmyk2 : item.cmyk2,
                cmyk3 : item.cmyk3,
                cmyk4 : item.cmyk4,
                prices : {
                    price_sub : item.price,
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
                            getCompany();
                            getStandards();
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


    
    React.useEffect(() => {
        theSearch.current.control.grid = theGrid.current.control;
    }, [])

    const theGrid = React.useRef()
    const theSearch = React.useRef()

    return (
        <Wrapper>
            <Row className="topTableInfo" justify="space-around">
                <Col span={24} className="topTable_right">
                    {/* <Button
                        className="btn-add btn-primary"
                        type="button"
                        onClick={(e) => {rowAdd(state.addBtn)}}
                    >
                       {state.addBtn === true ? <> + <span className="hiddentxt">추가</span></> : <> - <span className="hiddentxt">취소</span></>}
                    </Button> */}
                    <Button className="btn btn-primary btn_add" shape="circle" onClick={(e) => {rowAdd(state.addBtn)}} >
                        {state.addBtn === true ? '+' : '-'}
                    </Button>
                </Col>
            </Row>

            <Row className="gridWrap">       
                <Col xs={24} lg={16}>
                    <FlexGridSearch ref={theSearch} placeholder='FlexGridSearch' />
                </Col>
                <FlexGrid 
                    ref={theGrid}
                    itemsSource={state.list} 
                    stickyHeaders={true} 
                    initialized={(s) => initGrid(s)}
                    style={{ minHeight: '500px', maxHeight: '1000px' }}
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
                    <FlexGridColumn binding="print_unit" header="인쇄단가\n적용" width={120} >
                        <FlexGridCellTemplate
                            cellType="Cell"
                            template={(cell) => {
                                if(cell.item.rowAdd) {
                                    return (
                                        <wjInput.ComboBox
                                            id={cell.col.binding}
                                            placeholder="선택"
                                            itemsSource={new CollectionView(PRINT_UNIT, {
                                                currentItem: null
                                            })}
                                            selectedValue={cell.item.print_unit}
                                            selectedIndexChanged={(e)=>{
                                                var input = e.itemsSource.currentItem;
                                                if(input){
                                                    if(input=="본문"){
                                                        state.disabled = true
                                                    }else{
                                                        state.disabled = false
                                                    }
                                                }
                                            }}
                                            style={{ width: '100%' }}
                                        />
                                    );
                                } else {
                                    return cell.item.print_unit;
                                }
                            }}
                        />
                    </FlexGridColumn>
                    <FlexGridColumn binding="paper_standard" header="종이 규격" width={120} >
                        <FlexGridCellTemplate
                            cellType="Cell"
                            template={(cell) => {
                                let result = state[cell.col.binding].filter(col => col.name == cell.item.paper_standard);
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
                                    return cell.item.paper_standard;
                                }
                            }}
                        />
                    </FlexGridColumn>
                    <FlexGridColumn binding="frequency" header="인쇄 도수" width={200} align="center" >
                        {(state.disabled || !state.disabled) &&
                            <FlexGridCellTemplate
                                cellType="Cell"
                                template={(cell) => {
                                        return (
                                            <div className="frequencyWrap modify_class">
                                                <label><input type="checkbox" name={cell.col.binding} id={cell.col.binding} value={'Y'} defaultChecked={cell.item.cmyk1==='Y'} onChange={(e) =>  {if(state.currentEditItem){state.currentEditItem.cmyk1 = e.target.checked? 'Y':'N'}else{return false}}} disabled={!(state.disabled && cell.item.id === state.currentEditItem?.id)}/> 1도</label>
                                                <label><input type="checkbox" name={cell.col.binding} id={cell.col.binding} value={'Y'} defaultChecked={cell.item.cmyk2==='Y'} onChange={(e) =>  {if(state.currentEditItem){state.currentEditItem.cmyk2 = e.target.checked? 'Y':'N'}else{return false}}} disabled={!(state.disabled && cell.item.id === state.currentEditItem?.id)}/> 2도</label>
                                                <label><input type="checkbox" name={cell.col.binding} id={cell.col.binding} value={'Y'} defaultChecked={cell.item.cmyk3==='Y'} onChange={(e) =>  {if(state.currentEditItem){state.currentEditItem.cmyk3 = e.target.checked? 'Y':'N'}else{return false}}} disabled={!(state.disabled && cell.item.id === state.currentEditItem?.id)}/> 3도</label>
                                                <label><input type="checkbox" name={cell.col.binding} id={cell.col.binding} value={'Y'} defaultChecked={cell.item.cmyk4==='Y'} onChange={(e) =>  {if(state.currentEditItem){state.currentEditItem.cmyk4 = e.target.checked? 'Y':'N'}else{return false}}} disabled={!(state.disabled && cell.item.id === state.currentEditItem?.id)}/> 4도</label>
                                            </div>
                                        );
                                }}
                            />
                        }
                    </FlexGridColumn>
                    <FlexGridColumn binding="price" header="부수 범위와 단가" width={200} align="left" />
                    <FlexGridColumn binding="apply_date" header="단가 적용일" width={120} />
                    <FlexGridColumn binding="memo" header="참고사항" width={150} />
                    <FlexGridColumn binding="simulation_yn" header="시뮬레이션\n적용" width={100} align="center" />
                    <FlexGridColumn binding="use_yn" header="사용\n여부" width={100} align="center" />
                    <FlexGridColumn binding="buttons" header="작업" width={100} align="center" />
                </FlexGrid>     
            </Row>

            <Row gutter={10} className="table table_bot">
                <Col xs={16} lg={8}>
                    <div className="btn-group">
                        {/* <Pagination defaultCurrent={1} defaultPageSize={state.pageArr.pageCnt} current={state.pageArr.page} total={state.total} showSizeChanger={false}/> */}
                        <CollectionViewNavigator headerFormat="Page {currentPage:n0} of {pageCount:n0}" byPage={true} cv={state.list}/>
                    </div>
                </Col>
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
                footer={
                    [
                    <Button key="printingCancel" onClick={(e) => modalCancel('modify')}>취소</Button>,
                    <Button key="printingSubmit" type="primary" onClick={(e) => modifyOk('modify')}>확인</Button>,
                    state.prInp===false && <Button key="printingNew" onClick={(e) => {modalCancel('modify');modalOpen('ipt');}} >새로 입력</Button>,
                    ]
                }
            >
                <Row gutter={10} className="table">
                    <Col xs={24} lg={8} className="label">
                        적용일 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={16}>
                        <DatePicker name="apply_date" onChange={handlePriceInput('apply_date')} value={stateData.apply_date}/>
                    </Col> 
                    <Col xs={24} lg={24} className="label">
                        부수 범위와 단가 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={24}>
                        {state.prInp === true 
                            ?
                            <>
                            {stateData.fixed_royalties.map((item,index) => (
                                <Space key={index}>
                                    {index==0 ? 1 : (stateData.fixed_royalties[index-1].qty !== '' ? (parseInt(stateData.fixed_royalties[index-1].qty)+1) : 'n')}부 ~ 
                                    <Input type="number" min="0" name="qty" value={item.qty} onChange={handleChangeRoyalty(index,'qty')} autoComplete="off" style={{width:'80px'}} />부 또는 
                                    <Checkbox name="end_yn" checked={item.end_yn==='Y'} onChange={handleChangeRoyalty(index,'end_yn')}/> 끝까지 : 
                                    <Input type="number" min="0" name="price" value={item.price} onChange={handleChangeRoyalty(index,'price')} autoComplete="off" style={{width:'100px'}} /> 원
                                    {stateData.fixed_royalties.length == index+1 && item.end_yn !== 'Y' &&
                                    <Button
                                        shape="circle"
                                        icon={
                                            <PlusOutlined
                                                style={{ fontSize: '11px' }}
                                            />
                                        }
                                        size="small"
                                        onClick={handleInputRoyalty()}
                                        style={{ marginLeft: '5px' }}
                                    />
                                    }
                                </Space>
                                ))}
                            </>
                            :
                            <>
                            {stateData.fixed_royalties.map((item,index) => (
                                <Space key={index}>
                                    {index==0 ? 1 : (stateData.fixed_royalties[index-1].qty !== '' ? (parseInt(stateData.fixed_royalties[index-1].qty)+1) : 'n')}부 ~ 
                                    {index === stateData.fixed_royalties.length-1 ? "끝까지" : item.qty+" 부" } :  
                                    <Input type="number" min="0" name="price" value={item.price} onChange={handleChangeRoyalty(index,'price')} autoComplete="off" style={{width:'100px'}} /> 원
                                </Space>
                                ))} 
                            </>
                        }
                        
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
                    <FlexGridColumn binding="price" header="부수 범위와 단가" width={'*'} />
                    <FlexGridColumn binding="apply_date" header="단가 적용일" width={120} />
                    <FlexGridColumn binding="worker" header="작업자" width={120} />
                </FlexGrid>
            </Modal>

        </Wrapper>
    );
});

export default printingList;
