/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect } from 'react';
import { Button, Row, Col, Modal, Select } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';
import { toJS } from 'mobx';

import '@grapecity/wijmo.touch'; // support drag/drop on touch devices
import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { CollectionView } from '@grapecity/wijmo';
import * as wjcCore from "@grapecity/wijmo";
import * as wjCore from '@grapecity/wijmo';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";

import Excel from '@components/Common/Excel';
import '/node_modules/flexlayout-react/style/light.css';

const Wrapper = styled.div`
    width: 100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
    #tplBtnViewMode, #tplBtnEditMode {display:none}
`;

const paperCompanyList = observer(({tab}) => {
    const { commonStore } = useStore();
    
    const { Option } = Select;    
    const { confirm } = Modal;

    const state = useLocalStore(() => ({
        
        type : 'paper-company',

        list: [],
        data: [],
        ord:[],

        addBtn : true,              //추가버튼 활성화          
        currentEditItem : null,     //row data
        sel:'',
        flex:'',
        addCnt : 1,

        //페이징
        total: 0,
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },
    }));    
    
    useEffect(() => { 
        viewData();
        theSearch.current.control.grid = theGrid.current.control;
    }, []);

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    //리스트
    const viewData = useCallback(async (val) => {
        if (val == '' || val == '0' || val == undefined) var page = 1;
        else var page = val;

        const result = await commonStore.handleApi({
            url: '/paper-company',
            data:{
                display:state.pageArr.pageCnt,
                page:page,
                sort_by:'date',
                order:'desc',
            }
        });
        state.list = result.data
    }, []);

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["name", "use_yn", "buttons"];
    };

    const initGrid = (grid) => {    
        state.flex= grid;

        // let extraRow = new wjGrid.Row();
        // extraRow.allowMerging = true;
        // var panel = grid.columnHeaders;
        // panel.rows.splice(0, 0, extraRow);

        // state.sel = new Selector(grid, {})
        // state.sel._col.allowMerging = true;
        
        // state.sel._grid._eTLCt.firstChild.innerHTML='<div class="v-center">순서</div>';
        
        
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
                e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
            }
            
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                if (item == state.currentEditItem ) {
                    // create editors and buttons for the item being edited
                    switch (col.binding) {
                        case 'name':
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'"'+'value="'+s.getCellData(e.row, e.col, true)+'"/>';
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
                        case 'use_yn':
                            if(item.use_yn == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + item.id + '" type="checkbox" name= "'+col.binding+item.id+'" value="'+item.use_yn+'" '+checked+' onClick="return false;" />';
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
                switch (e.target.id) {
                    // start editing this item
                    case 'btnEdit':
                        let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                        state.selPriceInfo = item.priceInfo;
                        editItem(item);
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
                if(e.target.id == "use_yn"){
                    if(state.currentEditItem.use_yn === 'Y'){
                        grid.hostElement.querySelector('#use_yn').value='N';
                        state.currentEditItem.use_yn = 'N'
                    }else{
                        grid.hostElement.querySelector('#use_yn').value='Y';
                        state.currentEditItem.use_yn = 'Y'
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
        grid.virtualizationThreshold = 20;
    };

    //추가 버튼 
    const rowAdd=(e)=>{    
        if(e === true){ //행추가일때
            state.addCnt = state.addCnt-1;
            state.currentEditItem = { id: state.addCnt, name: '',use_yn: '',addCode : ''};
             
            var view = new CollectionView(state.list)
            console.log(view);

            view.sourceCollection.splice(0 ,0,state.currentEditItem); //값 삽입
            state.flex.collectionView.refresh(state.currentEditItem); // 삽입된 값 그리드에 반영         
            state.addBtn = false;  
            
        }else{ //행추가를 취소할때
            state.addCnt = state.addCnt+1;
            state.flex.collectionView.remove(state.currentEditItem);
            state.addBtn = true;
        }
        
    }
    //수정 버튼 
    const editItem= (item)=> {
        state.currentEditItem = item;
        state.flex.invalidate()
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
                    if(col.binding==='name' && input.value ==""){
                        msg = "제조사를 입력하세요.";
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
            var chk = true
            state.data.forEach((e) => {    
                //기존 배열에 들어간 user_id와 같으면 값 수정
                if(e.id > 0){
                    if(e.id === state.currentEditItem.id){
                        e.id= state.currentEditItem.id;
                        e.name= state.currentEditItem.name;
                        e.use_yn= state.currentEditItem.use_yn;
                        chk = false;
                    }
                }else{
                    if(e.addCode === state.currentEditItem.addCode){
                        e.name= state.currentEditItem.name;
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

            state.currentEditItem = null;
            state.flex.invalidate();
            state.flex.collectionView.refresh();
        }
    }

    const handleReset = useCallback(() => {
        return confirm({
            title: `이 창의 입력 내용이 삭제됩니다.`,
            content: `그래도 계속 하시겠습니까?`,
                async onOk() {
                    state.data = [];
                    viewData();
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
            var temp = {};
            if(item.id>0){
                temp = temp = {
                    id: item.id,
                    name: item.name,
                    use_yn : item.use_yn
                };
            }else{
                temp = {
                    name: item.name,
                    use_yn : item.use_yn
                };
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
                    <FlexGridColumn binding="name" header="종이 제조사" width={'*'} minWidth={200} />
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

        </Wrapper>
    );
});

export default paperCompanyList;
