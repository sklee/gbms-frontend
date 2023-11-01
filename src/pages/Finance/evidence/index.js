/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, Fragment } from 'react';
import { observer, useLocalStore } from 'mobx-react';

import { Button, Row, Col ,Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import * as wjcCore from "@grapecity/wijmo";
import { CollectionView } from '@grapecity/wijmo';
import * as wjInput from "@grapecity/wijmo.react.input";
import { FlexGrid, FlexGridColumn,FlexGridCellTemplate } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";

import { toJS } from 'mobx';
import axios from 'axios';
import styled from 'styled-components';
import Excel from '@components/Common/Excel';


const Wrapper = styled.div`
    width: 100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
`;

const financeEvidenceList = observer(({tab}) => {
    
    const { confirm } = Modal;

    const state = useLocalStore(() => ({
        grid : '',
        data:[],
        list: [{id: 1, name : '테스트',  type : 1, user : [25], userID : 25}, {id: 2, name : '테스트2',  type : 2, user : [25], userID : 25}],
        
        flexGrid : null,
        currentEditItem:null,     //row data
        addBtn : true,              //추가버튼 활성화
        memberOption:[],
        
    }));
    
    useEffect(() => { 
        memberData();
        theSearch.current.control.grid = theGrid.current.control;
    }, []);

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    const handleReset = useCallback(() => {
        confirm({
            icon: <ExclamationCircleOutlined />,
            title: '이 창의 입력 내용이 삭제됩니다.',
            content: '그래도 계속 하시겠습니까?',
            onOk() {
                state.list = state.oldData;
                state.data = [];
                viewData();
            },
            onCancel() {
              
            },
        });
    }, []);


    //상세정보
    const viewData = useCallback(async (val) => {    
        
        if (val == '' || val == '0' || val == undefined) {
            var page = 1;
        } else {
            var page = val;
        }
    
        var axios = require('axios');

        var config = {
            method: 'GET',
            url:process.env.REACT_APP_API_URL +'/api/v1/user-accounts?display='+state.pageArr.pageCnt+'&page='+page +'&sort_by=date&order=desc',
            headers: {
                Accept: 'application/json',
            },
        };

        axios(config)
            .then(function (result) {
                if (result.data.success === false) {
                    Modal.error({
                        title: '오류가 발생했습니다.',
                        content: '오류코드:' + result.data.message,
                    });
                } else {
                    var result_page = (page - 1) * state.pageArr.pageCnt;
                    var str_no = result.data.meta.total - result_page;

                    result.data.data.map((e, number) => {
                        e.cnt = str_no - number;
                    });
                    state.list = result.data.data;
                    state.oldData = result.data.data;

                    state.total = result.data.meta.total;
                    state.pageArr.page = result.data.meta.current_page;
                    state.pageArr.pageCnt = result.data.meta.per_page;

                }
            })
            .catch(function (error) {
                console.log(error.response);
            });
        
    }, []);

    //담당자
    const memberData = useCallback(async () => {
        const result = await axios.get(
        process.env.REACT_APP_API_URL +'/api/v1/users?display=500&page=1&sort_by=date&order=desc',
        {
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            },
        },
        )

        var option = []
        result.data.data.forEach(e => {
            option.push({id: e.id, name: e.name})
        });
        console.log(toJS(option))
        state.memberOption = option;

    }, []);


    const initGrid = (grid) => {  
        state.grid =grid;

        //dataItem 추가
        grid.formatItem.addHandler((s, e) => {
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;

                if (item == state.currentEditItem ) {
                    if(item === null || item === undefined || item === ''){       
                        item = {id : 0};
                    }
                    // create editors and buttons for the item being edited
                    switch (col.binding) {     
                        case 'type':
                            if(item.type == 1 ){
                                var checked1 = 'checked="checked"';
                            }else if(item.type == 2 ){
                                var checked2 = 'checked="checked"';
                            }
                            e.cell.innerHTML = '<input id="'+col.binding+item.id+'" type="radio" name= "'+col.binding+item.id+'" value="1" '+checked1+'/><label for="'+col.binding+item.id+'">승인</label><input id="'+col.binding+item.id+'" type="radio" name= "'+col.binding+item.id+'" value="2" '+checked2+'/><label for="'+col.binding+item.id+'">참조</label>';
                            e.cell['dataItem'] = item;
                            break;

                        case 'name':
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'"'+'value="'+s.getCellData(e.row, e.col, true)+'"/>';
                            e.cell['dataItem'] = item;
                            break;

                        case 'buttons':
                            let btn = '<button id="btnOK" class="btnText blueTxt">수정</button>';
                            btn += '<button id="btnCancel" class="btnText grayTxt">취소</button>';
                            e.cell.innerHTML = btn;
                            e.cell['dataItem'] = item;
                            break;                
                    }
                }
                else {
                    // create buttons for items not being edited
                    switch (col.binding) {     
                        case 'name':
                            e.cell['dataItem'] = item;
                            break;
                        case 'type':
                            if(item.type == 1 ){
                                var checked1 = 'checked="checked"';
                            }else if(item.type == 2 ){
                                var checked2 = 'checked="checked"';
                            }
                            e.cell.innerHTML = '<input id="'+col.binding+item.id+'" type="radio" name= "'+col.binding+item.id+'" value="1" '+checked1+' readonly/><label for="type1">승인</label><input id="'+col.binding+item.id+'2" type="radio" name= "'+col.binding+item.id+'" value="2" '+checked2+' readonly /><label for="'+col.binding+item.id+'">참조</label>';
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

        // handle button clicks
         // handle button clicks
         grid.addEventListener(grid.hostElement, 'click', (e) => {
            var ht = grid.hitTest(e);
            state.rowIndex = ht.row;

            if (e.target instanceof HTMLButtonElement) {
                // get button's data item
                let item = wjcCore.closest(e.target, '.wj-cell')['dataItem'];
                // handle buttons
                switch (e.target.id) {
                    // start editing this item
                    case 'btnEdit':
                        editItem(item);
                        break;
                    // commit edits
                    case 'btnOK':
                        commitEdit();
                        break;
                    // cancel edits
                    case 'btnCancel':
                        cancelEdit();
                        break;
                }
            }
        });

        grid.cells.hostElement.addEventListener('keyup',(e)=>{
            let item = wjcCore.closest(e.target, '.wj-cell')['dataItem'];

            if(grid.activeEditor){
                var value=grid.activeEditor.value;
                var numChk = /[^\-0-9]/g;
                
                if(grid.columns[grid.editRange.col].binding ==="name" ){ // country에 바인딩되어 있고 값에 e가 포함된 경우,
                    
                    item.user_account.account_no1 = e.srcElement.value
                }             
            }
        },true);            

    };

    const dataChange = (item)=>{
        state.oldData.map((e) => {     
            var chk = 0;          
            if(e.user_id === item.user_id){
                //기존 데이터에 값이 없었을 경우 추가
                if(e.user_account!== '' && e.user_account !== null &&  e.user_account !== undefined){
                    if(e.user_account.bank_id1 !== '' && e.user_account.account_no1 !== '' ){
                        item.user_account.depositor1 = '수정'
                        chk++;
                    }

                    if(e.user_account.bank_id2 !== '' && e.user_account.account_no2 !== ''){
                        item.user_account.depositor2 ='수정'
                        chk++;
                    }
                }else{
                    if(item.user_account.bank_id1 !== '' && item.user_account.account_no1 !== '' ){
                        item.user_account.depositor1 = '추가'
                    }

                    if(item.user_account.bank_id2 !== '' && item.user_account.account_no2 !== ''){
                        item.user_account.depositor2 ='추가'
                    }
                }

                if(chk > 0){
                    item.user_account.user_account_id = e.user_account.user_account_id
                    item.user_account.use_yn = e.user_account.use_yn                    
                }else{
                    item.user_account.user_account_id = 0
                    item.user_account.use_yn ='Y'
                }
                
                
            }
        })

        var arr = [];
        //배열 재정렬 ( 추가일 경우 id : 0, 수정일 경우 id:user_account.user_account_id *api참고)           
        arr = {
            id: item.id, 
            userID: item.userID, 
            name: item.name, 
            type: item.type, 
            user: item.user, 
            
        }

       
        if(state.data.length >0){
            var chk = true
            state.data.forEach((e) => {                        
                //기존 배열에 들어간 user_id와 같으면 값 수정
                if(e.user_id === arr.user_id){
                    e.id= arr.id
                    e.userID = arr.userID
                    e.name= arr.name
                    e.type= arr.type
                    e.user = arr.user
                    chk = false
                }
            })

            if(chk === true){
                state.data = [...state.data, arr];
            }
            
        }else{                    
            state.data = [...state.data,arr]                
        }

        console.log(toJS(state.data))
    }

    //콤보박스일 경우
    const selectChanged = (s)=>{       
        var item = [];
        item.push(pickOne(state.memberOption));
        return item;
    }

    function pickOne(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    //추가 버튼 
    const rowAdd=(e)=>{    
        if(e === true){ //행추가일때            
            state.currentEditItem = { id: 0, name: '', type : '', user:'', userID : ''};
             
            var view = new CollectionView(state.list)

            view.sourceCollection.splice(0 ,0,state.currentEditItem); //값 삽입
            state.grid.collectionView.refresh(state.currentEditItem); // 삽입된 값 그리드에 반영         

            state.addBtn = false;  
            
        }else{ //행추가를 취소할때
            state.grid.collectionView.remove(state.currentEditItem);
            state.addBtn = true;
        }
        
    }

    //수정 버튼 
    const editItem= (item)=> {
        state.currentEditItem = item;
        state.grid.invalidate()
        
    }

    //확인 버튼
    const commitEdit=()=> {
        var chkVal = true
        
        if (state.currentEditItem) {
            state.grid.columns.forEach((col) => {
                let input = state.grid.hostElement.querySelector('#' + col.binding);

                console.log(input)

                if (input) {                    
                    let value = wjcCore.changeType(input.value, col.dataType, col.format);
                    if (wjcCore.getType(value) == col.dataType) {
                        state.currentEditItem[col.binding] = value;                        
                    }
                    if(col.binding === 'type'){
                        state.currentEditItem[col.binding] = value;         
                    } 
                    if(state.currentEditItem.id === 0){
                        if(state.currentEditItem === null){
                            var num = 0
                        }else{
                            var num = state.currentEditItem.length
                        }
                        state.currentEditItem.addCode = state.currentEditItem.id+num;
                    }                  
                }                
            });
            console.log(toJS(state.currentEditItem))
            if(state.currentEditItem.name ==='' || state.currentEditItem.name ===undefined || state.currentEditItem.name ===null){
                Modal.error({
                    content: '명칭을 작성해주세요.',
                });
                chkVal = false;
                return;
            }

            if(state.currentEditItem.type ==='' || state.currentEditItem.type ===undefined || state.currentEditItem.type ===null){
                Modal.error({
                    content: '결재 구분을 선택해주세요.',
                });
                chkVal = false;
                return;
            }

            if(state.currentEditItem.user.length  === 0 ){
                Modal.error({
                    content: '결재선 포함 대상자를 선택해주세요.',
                });
                chkVal = false;
                return;
            }

            if(chkVal === true){

                if(state.data.length > 0){
                    var chk = true
                    state.data.forEach((e) => {    
                        //기존 배열에 들어간 user_id와 같으면 값 수정
                        if(e.id !== 0){
                            if(e.id === state.currentEditItem.id){
                                e.id= state.currentEditItem.id
                                e.name= state.currentEditItem.name
                                e.user= state.currentEditItem.user
                                e.userID = state.currentEditItem.userID
                                e.type= state.currentEditItem.type
                                chk = false
                            }
                        }else{
                            if(e.addCode === state.currentEditItem.addCode){
                                e.id= state.currentEditItem.id
                                e.name= state.currentEditItem.name
                                e.addCode = state.currentEditItem.addCode
                                e.user= state.currentEditItem.user
                                e.userID = state.currentEditItem.userID
                                e.type= state.currentEditItem.type
                                chk = false
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
                state.grid.invalidate();
                state.addBtn =true;
            }
        }
        
    }

    //취소버튼
    const cancelEdit=()=>{
        if (state.currentEditItem) {
            if(state.currentEditItem.addCode === ''){ //행추가 취소시 행 삭제
                state.grid.collectionView.remove(state.currentEditItem);
            }
            state.currentEditItem = null;
            state.grid.invalidate();
            state.addBtn =true;
        }
    }


    //등록
    const handleSubmit = useCallback(async (e)=> {        
        // console.log(toJS(state.data));
        // return;
        if(state.data.length > 0){
            var axios = require('axios');

            var config={
                method:'POST',
                url:process.env.REACT_APP_API_URL +'/api/v1/user-accounts/',
                headers:{
                    'Accept':'application/json',
                },
                    data:state.data
                };
                
            axios(config)
            .then(function(response){
                // console.log(response);
                if(response.data.success !== false){
                    Modal.success({
                        title: response.data.result,
                        onOk(){
                            state.oldData = state.list;
                            state.data = [];
                            viewData();
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
                console.log(error.response.status);
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

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["name", "type", "userID" ];
    };

    return (
        <Wrapper>
            <Row className="topTableInfo">
                <Col span={20}>
                    <FlexGridSearch ref={theSearch} placeholder='검색' />
                </Col>
                <Col span={4} className="topTable_right">
                    <Button className="btn btn-primary btn_add" shape="circle" onClick={(e) => {rowAdd(state.addBtn)}} >{state.addBtn ? '+' : '-'}</Button>
                </Col>
            </Row>
            <Row className="gridWrap">       
                <FlexGrid 
                    ref={theGrid}
                    itemsSource={state.list} 
                    stickyHeaders={true} 
                    initialized={(s) => initGrid(s)}
                    allowMerging="ColumnHeaders"
                    alternatingRowStep={1}
                    selectionMode="None"
                    headersVisibility="Column"
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                    <FlexGridColumn binding="name" header="명칭" width={'*'} minWidth={100} isReadOnly={true}  allowMerging={true}/>
                    <FlexGridColumn binding="type" header="결재 구분" width={'*'} minWidth={100} align='left' isReadOnly={true} allowMerging={true}/>
                    <FlexGridColumn binding="userID" header="결재선 포함 대상자(순서대로 지정됨)" width={'*'} minWidth={200} align='left'>
                        <FlexGridCellTemplate
                            cellType="Cell"
                            template={() => (
                            <Fragment>
                                <wjInput.MultiSelect
                                placeholder="선택"
                                itemsSource={state.memberOption}
                                selectedValuePath= "id"
                                displayMemberPath= "name"
                                // checkedItems={selectChanged}
                                ></wjInput.MultiSelect>
                            </Fragment>
                            )}
                        />
                    </FlexGridColumn>
                        
                    <FlexGridColumn binding="buttons" header="작업" width={'*'} minWidth={100} align='center' isReadOnly={true} allowMerging={true}/>
                </FlexGrid>     
            </Row>
            <Row gutter={10} className="table table_bot">
                <Col xs={24} lg={16}>
                    <div className="btn-group">
                        <span>행 개수 : {state.list.length}</span>
                    </div>
                </Col>
                <Excel />
            </Row>
        </Wrapper>
    );
});

export default financeEvidenceList;
