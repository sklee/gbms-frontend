/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect } from 'react';
import { Pagination, Button, Row, Col, Modal,Select} from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';
import axios from 'axios';

import { toJS } from 'mobx';

import '@grapecity/wijmo.touch'; // support drag/drop on touch devices
import { FlexGrid, FlexGridColumn, FlexGridCellTemplate } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import * as wjcCore from "@grapecity/wijmo";
import * as wjCore from '@grapecity/wijmo';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import * as wjInput from '@grapecity/wijmo.react.input';
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


const produceAccidentCont = observer(({tab}) => {
    const { commonStore } = useStore();
    
    const { Option } = Select;    
    const { confirm } = Modal;

    const state = useLocalStore(() => ({

        type : 'produce-accident-contents',

        list: [],
        data: [],
        category:[],

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
        gridFilter: null,
    }));    
    
    useEffect(() => { 
        getCodes();
        viewData();
        theSearch.current.control.grid = theGrid.current.control;
    }, []);

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    const getCodes = useCallback(async () =>{
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/produce-accident-codes',
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            },
        );
        // state.category = result.data.data;
        state.category = [];
        var temp = result.data.data;
        temp.map(e=>{
            state.category = [...state.category,{'code':e.id,'label':e.name}];
        })
    },[]);

    //리스트
    const viewData = useCallback(async (val) => {
        if (val == '' || val == '0' || val == undefined) var page = 1;
        else var page = val;
        var axios = require('axios');

        var config = {
            method: 'GET',
            url:
                process.env.REACT_APP_API_URL +'/api/v1/' + state.type,
            headers: {
                Accept: 'application/json',
            },
        };

        axios(config)
            .then(function (response) {
                state.list = response.data.data;
                state.list.map((e)=>{
                    e["category"] = e.code?.name;
                });
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
        filter.filterColumns = [ "category", "contents", "buttons"];
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
            }

            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
                let col = s.columns[e.col];
                e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
            }
            
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;

                if (item == state.currentEditItem ) {
                    // create editors and buttons for the item being edited
                    switch (col.binding) {
                        // case 'category':
                        //     var opt = '<option value="">선택</option>';
                        //     for (let index = 0; index < state.category.length; index++) {
                        //         if(s.getCellData(e.row, e.col, true)===state.category[index].label){
                        //             opt += '<option value="'+state.category[index].code+'" selected>'+ state.category[index].label +'</option>';
                        //         }else{
                        //             opt += '<option value="'+state.category[index].code+'">'+ state.category[index].label +'</option>';
                        //         }
                        //     }
                        //     var inhtml = '<select class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'">' +
                        //                 opt +
                        //                 '</select>';
                        //     e.cell.innerHTML = inhtml
                        //     e.cell['dataItem'] = item;
                        //     break;
                        case 'contents':
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'"'+'value="'+s.getCellData(e.row, e.col, true)+'"/>';
                            e.cell['dataItem'] = item;
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
                        case 'buttons':
                            let btn = '<button id="btnEdit" class="btnText blueTxt">수정</button><button id="btnDel" class="btnText redTxt">삭제</button>';
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
                        editItem(item);
                        break;
                    case 'btnCancel':
                        cancelEdit();
                        break;
                    case 'btnDel':
                        let item2 = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                        deleteEdit(item2)
                        break;
                    case 'btnOK':
                        commitEdit();
                        break;
                }
            }
        
        });

        grid.autoGenerateColumns = false;
        grid.itemsSource = state.list;
        grid.virtualizationThreshold = 20;
    };

    const deleteEdit=(item)=>{

        state.data = state.data.filter(f=>f.id!=item.id);
        if(item.id > 0){
            state.data = [...state.data, {id:item.id,use_yn :'N'}];
        }
        state.flex.collectionView.remove(item);
    }

    //추가 버튼 
    const rowAdd=(e)=>{    
        if(e === true){ //행추가일때
            state.addCnt = state.addCnt-1;
            state.currentEditItem = { 
                id:state.addCnt,
                category:'',
                contents:'',
                addCode : '',
                rowAdd: true,
            };
             
            var view = new CollectionView(state.list)

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
                let wjvalue = input?.querySelector('.wj-form-control')?.value;
                if (input) {
                    if(col.binding==='category' && wjvalue ==""){
                        msg = "사고 공정을 선택하세요.";
                        validate = false;
                    }
                    if(col.binding==='contents' && input.value ==""){
                        msg = "사고 내용을 입력하세요.";
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
                    if(col.binding === 'category'){
                        let text = input.querySelector('.wj-form-control').value;
                        let result = state.category.find(col => col.label == text );
                        state.currentEditItem[col.binding] = text;     
                        state.currentEditItem['produce_accident_code_id'] = result.code;
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
                        e.category= state.currentEditItem.produce_accident_code_id;
                        e.contents= state.currentEditItem.contents;
                        chk = false;
                    }
                }else{
                    if(e.addCode === state.currentEditItem.addCode){
                        e.category= state.currentEditItem.produce_accident_code_id;
                        e.contents= state.currentEditItem.contents;
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

    //등록
    const handleSubmit = useCallback(async (e)=> {      
        
        const row_data = toJS(state.data);
        var data =[];
        row_data.forEach((item)=>{
            var temp = {};
            if(item.use_yn == 'N'){
                temp = {
                    id: item.id,
                    use_yn : item.use_yn,
                };
            }else{
                if(item.id>0){
                    temp = {
                        id: item.id,
                        produce_accident_code_id: item.produce_accident_code_id,
                        contents: item.contents,
                    };
                }else{
                    temp = {
                        produce_accident_code_id: item.produce_accident_code_id,
                        contents: item.contents,
                    };
                }
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
            <Row className="topTableInfo" >
                <Col span={20}>
                    <FlexGridSearch ref={theSearch} placeholder='검색' />
                </Col>
                <Col span={4} className="topTable_right">
                    <Button className="btn btn-primary btn_add" shape="circle" onClick={(e) => {rowAdd(state.addBtn)}}>
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
                    <FlexGridColumn binding="category" header="사고 공정" width={150} >
                        <FlexGridCellTemplate
                            cellType="Cell"
                            template={(cell) => {
                                let result = state[cell.col.binding].find(col => col.label == cell.item.category);
                                if(cell.item.rowAdd) {
                                    return (
                                        <wjInput.ComboBox
                                            id={cell.col.binding}
                                            placeholder="선택"
                                            itemsSource={new CollectionView(state[cell.col.binding], {
                                                currentItem: null
                                            })}
                                            selectedValuePath="code"
                                            displayMemberPath="label"
                                            valueMemberPath="code"
                                            selectedValue={result?.code}
                                            style={{ width: '100%' }}
                                        />
                                    );
                                } else {
                                    return cell.item.category;
                                }
                            }}
                        />
                    </FlexGridColumn>
                    <FlexGridColumn binding="contents" header="사고 내용" width={'*'} minWidth={200} />
                    <FlexGridColumn binding="buttons" header="작업" width={100} align="center"/>
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

export default produceAccidentCont;
