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

const produceOverbuying = observer(({tab}) => {
    const { commonStore } = useStore();
    
    const { Option } = Select;    
    const { confirm } = Modal;

    const state = useLocalStore(() => ({

        type : 'produce-spares',

        list: [],
        data: [],
        produce_details: [],

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
        getDetails();
        viewData();
        theSearch.current.control.grid = theGrid.current.control;
    }, []);

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    const getDetails = useCallback(async () =>{
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/produce-code-details',
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            },
        );
        state.produce_details = result.data.data;
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
        filter.filterColumns = [ "name", "cmyk0", "cmyk1", "cmyk2", "cmyk3", "cmyk4", "buttons"];
    };

    const initGrid = (grid) => {    
        state.flex= grid;

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
                        case 'cmyk0':
                        case 'cmyk1':
                        case 'cmyk2':
                        case 'cmyk3':
                        case 'cmyk4':
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'"'+'value="'+s.getCellData(e.row, e.col, true)+'"/>';
                            e.cell['dataItem'] = item;
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
                        cancelEdit();
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

    //추가 버튼 
    const rowAdd=(e)=>{    
        if(e === true){ //행추가일때
            state.addCnt = state.addCnt-1;
            state.currentEditItem = { 
                id:state.addCnt,
                name:'',
                cmyk0:'',
                cmyk1:'',
                cmyk2:'',
                cmyk3:'',
                cmyk4:'',
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
                    if(col.binding==='cmyk0' && input.value ==""){
                        msg = "도수를 모두 입력하세요.";
                        validate = false;
                    }
                    if(col.binding==='cmyk1' && input.value ==""){
                        msg = "도수를 모두 입력하세요.";
                        validate = false;
                    }
                    if(col.binding==='cmyk2' && input.value ==""){
                        msg = "도수를 모두 입력하세요.";
                        validate = false;
                    }
                    if(col.binding==='cmyk3' && input.value ==""){
                        msg = "도수를 모두 입력하세요.";
                        validate = false;
                    }
                    if(col.binding==='cmyk4' && input.value ==""){
                        msg = "도수를 모두 입력하세요.";
                        validate = false;
                    }
                    if(col.binding==='name' && wjvalue ==""){
                        msg = "세부 구성을 선택하세요.";
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
                    if(col.binding === 'name'){
                        let text = input.querySelector('.wj-form-control').value;
                        let result = state.produce_details.filter(col => col.name == text );
                        state.currentEditItem[col.binding] = text;     
                        state.currentEditItem['produce_code_detail_id'] = result[0]?.id;
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
                        e.cmyk0= state.currentEditItem.cmyk0;
                        e.cmyk1= state.currentEditItem.cmyk1;
                        e.cmyk2= state.currentEditItem.cmyk2;
                        e.cmyk3= state.currentEditItem.cmyk3;
                        e.cmyk4= state.currentEditItem.cmyk4;
                        chk = false;
                    }
                }else{
                    if(e.addCode === state.currentEditItem.addCode){
                        e.name= state.currentEditItem.name;
                        e.cmyk0= state.currentEditItem.cmyk0;
                        e.cmyk1= state.currentEditItem.cmyk1;
                        e.cmyk2= state.currentEditItem.cmyk2;
                        e.cmyk3= state.currentEditItem.cmyk3;
                        e.cmyk4= state.currentEditItem.cmyk4;
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
            if(item.id>0){
                temp = temp = {
                    id: item.id,
                    produce_code_detail_id: item.produce_code_detail_id,
                    name: item.name,
                    cmyk1: item.cmyk1,
                    cmyk2: item.cmyk2,
                    cmyk3: item.cmyk3,
                    cmyk4: item.cmyk4,
                    cmyk0: item.cmyk0,
                };
            }else{
                temp = {
                    name: item.name,
                    produce_code_detail_id: item.produce_code_detail_id,
                    cmyk1: item.cmyk1,
                    cmyk2: item.cmyk2,
                    cmyk3: item.cmyk3,
                    cmyk4: item.cmyk4,
                    cmyk0: item.cmyk0,
                };
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
            <Row className="topTableInfo">
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
                    <FlexGridColumn binding="name" header="상품 세부 구성" width={'*'} minWidth={200} >
                        <FlexGridCellTemplate
                            cellType="Cell"
                            template={(cell) => {
                                let result = state.produce_details.filter(col => col.name == cell.item.name);
                                if(cell.item.rowAdd) {
                                    return (
                                        <wjInput.ComboBox
                                            id={cell.col.binding}
                                            placeholder="선택"
                                            itemsSource={new CollectionView(state.produce_details, {
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
                                    return cell.item.name;
                                }
                            }}
                        />
                    </FlexGridColumn>
                    <FlexGridColumn binding="cmyk0" header="0도" width={150} align="right" />
                    <FlexGridColumn binding="cmyk1" header="1도" width={150} align="right" />
                    <FlexGridColumn binding="cmyk2" header="2도" width={150} align="right" />
                    <FlexGridColumn binding="cmyk3" header="3도" width={150} align="right" />
                    <FlexGridColumn binding="cmyk4" header="4도" width={150} align="right" />
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

export default produceOverbuying;
