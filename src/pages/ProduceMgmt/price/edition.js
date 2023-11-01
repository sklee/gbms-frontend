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
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjcCore from "@grapecity/wijmo";
import * as wjCore from '@grapecity/wijmo';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import { CollectionView } from '@grapecity/wijmo';

import Excel from '@components/Common/Excel';
import '/node_modules/flexlayout-react/style/light.css';


const Wrapper = styled.div`
    width: 100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
    #tplBtnViewMode, #tplBtnEditMode {display:none}
`;

const editionList = observer(({tab}) => {

    const stateData = useLocalStore(() => ({apply_date :"", rate_discount :"" })); 

    const { commonStore } = useStore();
    const { Option } = Select;    
    const { confirm } = Modal;

    const state = useLocalStore(() => ({
        type : 'paper-supplier',

        list: [],
        historyList:[],
        paperArr : [],
        data: [],
        ord:[],

        today: moment().format('YYYY-MM-DD'),

        addBtn : true,              //추가버튼 활성화          
        currentEditItem : null,     //row data
        sel:'',
        flex:'',
        addCnt : 1,
        priceEditBl:false,

        //입력리스트
        produce_company : [],
        paper_name : [],

        //페이징
        total: 0,
        pageArr: {
            pageCnt: 30, //리스트 총 갯수
            page: 1, //현재페이지
        },
        gridFilter: null,
        dateItemName: [{id: 1, name: '신청일'}],
    }));    
    
    useEffect(() => {
        getCompany();
        getInfo();
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
        )
        console.log('company',result.data.data)
        state. produce_company = result.data.data;
    },[]);

    const getInfo = useCallback(async () =>{
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/paper-information?display=100&page=1&sort_by=date&order=desc',
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            },
        )
        console.log('info',result.data.data)
        state.paper_name = result.data.data;
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
                console.log('viewdata',response.data.data)
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
            console.log(toJS(e.dataItem))
            temp = [...temp,e.dataItem.id];
        });
        state.selected = temp;

        if(sel.length > 0){
            state.priceEditBl = true;
        } else {
            state.priceEditBl = false;
        }
    }

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["produce_company", "paper_name", "paper_code", "paper_gsm", "paper_color", "paper_type", "paper_standard", "paper_price",
        "rate_discount", "unit_price", "apply_date", "use_yn", "buttons"];
    };

    const initGrid = (grid) => {    
        state.flex= grid;

        state.sel = new Selector(grid, {
            itemChecked: () => {
                showCheckedCount();
            }
        })

        state.sel._col.allowMerging = true;
        state.sel.column = grid.columns[0];
        
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
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + ' ' + html.split('\\n')[1] + "<br/>" + html.split('\\n')[2] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }
            
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                
                if (item == state.currentEditItem ) {
                    // create editors and buttons for the item being edited
                    switch (col.binding) {
                        case 'rate_discount' :
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
                            break;
                        case 'buttons':
                            let btn = '<button id="btnOK" class="btnText blueTxt">확인</button><button id="btnCancel" class="btnText grayTxt">취소</button>';
                            e.cell.innerHTML = btn;
                            e.cell['dataItem'] = item;
                            break;
                    }
                }
                else {
                    // create buttons for items not being edited
                    switch (col.binding) {
                        case 'rate_discount':
                            let priceWrap;
                            if(item.apply_date > state.today){
                                priceWrap ='<button class="btnText title btnRed btn_price">' +item.rate_discount +'</button>';
                            }else{
                                priceWrap ='<button class="btnText title btn_price">' +item.rate_discount +'</button>';
                            }
                            // let priceWrap ='<button class="btnLink title btnRed btn_price">' +item.rate_discount +'</button>';
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
                if(e.target.classList.contains('btn_price')){
                    modalOpen('history',wjCore.closest(e.target, '.wj-cell')['dataItem']);
                }
                if(e.target.classList.contains('btn_modify')){
                    modalOpen('modify',wjCore.closest(e.target, '.wj-cell')['dataItem']);
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
                        commitEdit();
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
                    case 'rate_discount':
                    case 'apply_date':
                        modalOpen('modify',wjCore.closest(e.target, '.wj-cell')['dataItem']);
                        break;
                }    
            } 
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
                paper_name : '',
                paper_code : '',
                paper_gsm : '',
                paper_color : '',
                paper_type : '',
                paper_standard : '',
                paper_price : '',
                apply_date: '',
                rate_discount: '',
                unit_price : '',
                rate_discounts : [],
                use_yn: '',
                addCode: '',
                rowAdd: true
            };
            var view = new CollectionView(state.list)
            view.sourceCollection.splice(0 ,0,state.currentEditItem); //값 삽입
            state.flex.collectionView.refresh(state.currentEditItem); // 삽입된 값 그리드에 반영         
            state.addBtn = false;  
            
        }else{ //행추가를 취소할때
            state.addCnt = state.addCnt+1;
            state.flex.collectionView.remove(state.currentEditItem);
            state.currentEditItem.rowAdd = false;
            state.currentEditItem = null;
            state.addBtn = true;
        }
    }
    //수정 버튼 
    const editItem = (item)=> {
        state.currentEditItem = item;
        state.currentEditItem.rowAdd = true;
        state.flex.invalidate();
        state.flex.collectionView.refresh();
    }

    //확인 버튼
    const commitEdit=()=> {
        if (state.currentEditItem) {
            var validate = true;
            var msg = "";
            state.flex.columns.map((col) => {
                let input = state.flex.hostElement.querySelector('#' + col.binding);
                if (input) {
                    if(col.binding==='rate_discount' && input.value ==""){
                        msg = "할인율을 입력하세요.";
                        validate = false;
                    }
                    if(col.binding==='apply_date' && input.value ==""){
                        msg = "적용일을 입력하세요.";
                        validate = false;
                    }
                    if(col.binding==='paper_name' && input.value ==""){
                        msg = "종이명을 선택하세요.";
                        validate = false;
                    }
                    if(col.binding==='produce_company' && input.value ==""){
                        msg = "공급처를 선택하세요.";
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

            let company = state.flex.hostElement.querySelector('#produce_company');
            let paper = state.flex.hostElement.querySelector('#paper_name');
            let company_id = state.produce_company.filter(col => col.name == company );
            let paper_id = state.produce_company.filter(col => col.name == paper );
            let checker = state.list.find(item => item.paper_standard_id == paper_id && item.produce_company_id == company_id)

            if(checker){
                Modal.error({
                    content: "같은 공급처/종이명은 중복 적용될 수 없습니다.",
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
                    if(col.binding === 'paper_name'){
                        let text = input.querySelector('.wj-form-control').value;
                        let result = state.paper_name.find(col => col.paper_name == text );
                        state.currentEditItem[col.binding] = text;     
                        state.currentEditItem['paper_information_id'] = result.id;
                        if(result){
                            state.currentEditItem.paper_code = result.paper_code;
                            state.currentEditItem.paper_gsm = result.paper_gsm;
                            state.currentEditItem.paper_color = result.paper_color;
                            state.currentEditItem.paper_type = result.paper_type;
                            state.currentEditItem.paper_standard = result.paper_standard;
                            state.currentEditItem.paper_price = result.price;
                            // state.currentEditItem.unit_price = parseInt(Number(result.price) * (100 - Number(result.rate_discount)) / 100);
                        }
                    }
                    if(col.binding === 'rate_discount'){
                        state.currentEditItem[col.binding] = value;
                        state.currentEditItem.unit_price = parseInt(Number(state.currentEditItem.paper_price) * (100 - Number(state.currentEditItem.rate_discount)) / 100);
                    }
                    if(col.binding === 'apply_date'){
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
                        e.paper_name= state.currentEditItem.paper_name;
                        e.use_yn= state.currentEditItem.use_yn;
                        chk = false;
                    }
                }else{
                    if(e.addCode === state.currentEditItem.addCode){
                        e.name= state.currentEditItem.name;
                        e.produce_company= state.currentEditItem.produce_company;
                        e.paper_name= state.currentEditItem.paper_name;
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
    const modifyCancel= (obj)=> {
        if(obj == 'modify'){
            stateData.apply_date = "";
            stateData.rate_discount = "";
            setModalPriceModify(false);
        }
        if(obj == 'history'){
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
            }else if(stateData.rate_discount ==""){
                msg = "할인율을 입력하세요.";
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
                state.flex.hostElement.querySelector('#rate_discount').value = stateData.rate_discount;
                stateData.apply_date = "";
                stateData.rate_discount = "";

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
            data = [...data,{id:e,discounts:[{rate_discount:stateData.rate_discount,apply_date:moment(stateData.apply_date).format('YYYY-MM-DD')}]}];
        });

        commonStore.handleApi({
            method : 'POST', 
            url : `/paper-supplier`,
            data: data
        }).then((result) => {
            Modal.success({
                title: result.result,
                onOk(){
                    getInfo();
                    viewData();
                    state.priceEditBl = false
                    state.selected = null;
                    stateData.apply_date = "";
                    stateData.rate_discount = "";
                    modifyCancel('modify')
                },
            });
        })
    }, []);

    const modalOpen = (obj,item) => {
        if(obj == 'modify'){
            stateData.apply_date = state.flex.hostElement.querySelector('#apply_date').value!=""?moment(state.flex.hostElement.querySelector('#apply_date').value):moment().add(1,'M').startOf('month');
            stateData.rate_discount = state.flex.hostElement.querySelector('#rate_discount').value;
            setModalPriceModify(true);
        }
        if(obj == 'modify_total'){
            stateData.apply_date = moment().add(1,'M').startOf('month');
            setModalPriceModify(true);
        }
        if(obj == 'history'){
            var temp_history = [];
            toJS(item.rate_discounts).map(e=>{
                temp_history = [...temp_history,{price:e.price,apply_date:e.apply_date,worker:e.created_info?.name,unit_price:e.unit_price,rate_discount:e.rate_discount}];
            })
            state.historyList = temp_history;
            setModalPriceHistory(true);
        }
    }

    const handleReset = useCallback(() => {
        return confirm({
            title: `이 창의 입력 내용이 삭제됩니다.`,
            content: `그래도 계속 하시겠습니까?`,
                async onOk() {
                    getInfo();
                    viewData();
                    state.selected = null;
                    stateData.apply_date = "";
                    stateData.rate_discount = "";
                    state.currentEditItem = null;
                },
            });
    }, []);


    //등록
    const handleSubmit = useCallback(async (e)=> {      
        
        const row_data = toJS(state.data);
        var data =[];
        row_data.forEach((item)=>{
            var temp = {
                produce_company_id: item.produce_company_id,
                paper_information_id: item.paper_information_id,
                discounts : [{
                    rate_discount : item.rate_discount,
                    apply_date : item.apply_date
                }],
                use_yn: item.use_yn
            };
            
            if(item.id>0){
                temp['id'] = item.id;
            }
            data = [...data,temp];
        });

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
                            type='primary'
                            onClick={(e) => {modalOpen('modify_total')}}
                        >
                            할인율 일괄수정
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
                    <FlexGridColumn binding="produce_company" header="종이 공급처" width={100}>
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
                                            selectedValue={result.length > 0 ? result[0].id : ''}
                                            // textChanged={handleChangeInput('work_state')}
                                            style={{ width: '100%' }}
                                        />
                                    );
                                } else {
                                    return cell.item.produce_company
                                }
                            }}
                        />
                    </FlexGridColumn>
                    <FlexGridColumn binding="paper_name" header="종이명" width={'*'} minWidth={150}>
                        <FlexGridCellTemplate
                            cellType="Cell"
                            template={(cell) => {
                                let result = state[cell.col.binding].filter(col => col.paper_name == cell.item.paper_name);
                                if(cell.item.rowAdd) {
                                    return (
                                        <wjInput.ComboBox
                                            id={cell.col.binding}
                                            placeholder="선택"
                                            itemsSource={new CollectionView(state[cell.col.binding], {
                                                currentItem: null
                                            })}
                                            selectedValuePath="id"
                                            displayMemberPath="paper_name"
                                            valueMemberPath="id"
                                            selectedValue={result.length > 0 ? result[0].id : ''}
                                            // textChanged={handleChangeInput('work_state')}
                                            style={{ width: '100%' }}
                                        />
                                    );
                                } else {
                                    return cell.item.paper_name
                                }
                            }}
                        />
                    </FlexGridColumn>
                    <FlexGridColumn binding="paper_code" header="종이 코드" width={90}/>
                    <FlexGridColumn binding="paper_gsm" header="평량\n(g/㎡)" width={80} align="right" />
                    <FlexGridColumn binding="paper_color" header="색상" width={80}/>
                    <FlexGridColumn binding="paper_type" header="종이 종류" width={90}/>
                    <FlexGridColumn binding="paper_standard" header="종이 규격" width={100}/>
                    <FlexGridColumn binding="paper_price" header="고시가격" width={90} align="right" />
                    <FlexGridColumn binding="rate_discount" header="할인율" width={80} align="right" />
                    <FlexGridColumn binding="unit_price" header="단가" width={80} align="right" />
                    <FlexGridColumn binding="apply_date" header="할인율\n적용일" width={100} />
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

            <Modal title="할인율 수정" visible={modalPriceModify} onCancel={(e) => {modifyCancel('modify')}} onOk={(e) => {modifyOk('modify',e)}}>
                <Row gutter={10} className="table">
                    <Col xs={24} lg={8} className="label">
                        적용일 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={16}>
                        <DatePicker name="apply_date" onChange={handlePriceInput('apply_date')} value={stateData.apply_date}/>
                    </Col> 
                    <Col xs={24} lg={8} className="label">
                        수정 할인율 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={16}>
                        <Input type="number" name="rate_discount" min={0} max={100} onChange={handlePriceInput('rate_discount')} value={stateData.rate_discount}/>
                    </Col> 
                </Row>
            </Modal>

            <Modal title="할인율 변경 이력" visible={modalPriceHistory} onCancel={(e) => {modifyCancel('history')}} footer={null}>
                <FlexGrid 
                    itemsSource={state.historyList} 
                    headersVisibility="Column"
                    selectionMode="None"
                >
                    <FlexGridColumn binding="price" header="고시가" width={80} align="right" />
                    <FlexGridColumn binding="rate_discount" header="할인율" width={'*'} align="center" />
                    <FlexGridColumn binding="unit_price" header="단가" width={80} align="right" />
                    <FlexGridColumn binding="apply_date" header="할인율 적용일" width={120} align="center" />
                    <FlexGridColumn binding="worker" header="작업자" width={100} align="center" />
                </FlexGrid>
            </Modal>


        </Wrapper>
    );
});

export default editionList;
