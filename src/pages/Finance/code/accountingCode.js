/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect } from 'react';
import { Pagination, Button, Row, Col, message, Modal, Select} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { FlexGrid, FlexGridColumn  } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import { CollectionView, DataType, isNumber } from '@grapecity/wijmo';
import * as wjcCore from "@grapecity/wijmo";
import { observer, useLocalStore } from 'mobx-react';


import styled from 'styled-components';
import useStore from '@stores/useStore';
import Excel from '@components/Common/Excel';


const Wrapper = styled.div`
    width: 100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
`;


const accountingCodeList = observer(({tab,type}) => {
    const { commonStore } = useStore();
    
    const { Option } = Select;    
    const { confirm } = Modal;

    const state = useLocalStore(() => ({
        type : '',                  //길벗, 스쿨 타입
        currentEditItem : null,     //row data
        flex:'',                    //grid데이터
        // allowAddNew: false,         

        data:[],                    //등록 데이터
        list: [],                   //리스트 데이터

        addBtn : true,              //추가버튼 활성화
        //페이징
        total : 0,
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },
    }));    
    
    useEffect(() => { 
        state.tab = tab;
        state.type = type;   
        
        if(tab == 'gilbutCode' || tab == 'schoolCode'){
            viewData();
        }
        theSearch.current.control.grid = theGrid.current.control;
    }, [tab,type]);

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    const handleReset = useCallback(() => {
        confirm({
            icon: <ExclamationCircleOutlined />,
            title: '이 창의 입력 내용이 삭제됩니다.',
            content: '그래도 계속 하시겠습니까?',
            onOk() {
                viewData();
                state.data = [];
            },
            onCancel() {
            },
        });
    }, []);

    const pageChange = (num)=>{
        let FLEXLAYOUT = document.querySelectorAll(".flexlayout__tab");
        FLEXLAYOUT.forEach((item)=>{
            item.scrollTo(0, 0);
        })
        viewData(num);
    }

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
            url:process.env.REACT_APP_API_URL +'/api/v1/douzone-accounting-codes/'+state.type+'?display=' +state.pageArr.pageCnt +'&page=' +page +'&sort_by=date&order=desc',
            headers: {
                Accept: 'application/json',
            },
        };

        axios(config)
            .then(function (result) {
                // console.log(result)
                if (result.data.success === false) {
                    Modal.error({
                        title: '오류가 발생했습니다.',
                        content: '오류코드:' + result.data.message,
                    });
                } else {
                    state.list = result.data.data;

                    state.list.forEach(e => {
                        if(e.use_yn === '' || e.use_yn === null || e.use_yn === undefined){
                            e.use_yn = 'N'
                        }
                    });
// console.log(toJS(state.list))
                    state.total = result.data.meta.total;
                    state.pageArr.page = result.data.meta.current_page;
                    state.pageArr.pageCnt = result.data.meta.per_page;
                }
            })
            .catch(function (error) {
                console.log(error.response);
                Modal.error({
                    title: '오류가 발생했습니다. 재시도해주세요.',
                    content: '오류코드:' + error.response.status,
                });
            });
        
    }, []);


    const initGrid = (grid) => {           
        state.flex= grid;

        // grid.rows.defaultSize = 40;
        // custom formatter to paint buttons and editors
        grid.formatItem.addHandler((s, e) => {
            if (e.panel == s.cells) {
                let col = s.columns[e.col], item = s.rows[e.row].dataItem;

                
                if (item == state.currentEditItem ) {
                    if(item === null || item === undefined || item === ''){       
                        item = {id : 0};
                    }
                    // create editors and buttons for the item being edited
                    switch (col.binding) {
                        
                        case 'buttons':
                            let btn = '<button id="btnOK" class="btnText blueTxt" style={{marginRight: "5px"}}>확인</button>'
                            btn += '<button id="btnCancel" class="btnText redTxt">취소</button>';
                            e.cell.innerHTML = btn;
                            e.cell['dataItem'] = item;
                            break;
                        case 'code':
                        case 'subject':
                        case 'group':
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'"'+'value="'+s.getCellData(e.row, e.col, true)+'"/>';
                            e.cell['dataItem'] = item;
                            break;
                        case 'use_yn':
                            if(item.use_yn == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + '" type="checkbox" name= "'+item.id+'" value="'+item.use_yn+'" '+checked+'/>';
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

                        case 'use_yn':
                            if(item.use_yn == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + '" type="checkbox" name= "'+item.id+'" value="'+item.use_yn+'" '+checked+' onClick="return false;"/>';
                            e.cell['dataItem'] = item;
                            break;
                    }
                    
                }
            }
        });

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
            if (e.target instanceof HTMLInputElement) {
                if(e.target.id == "use_yn"){
                    // handle buttons
                    switch (e.target.id) {
                        case 'use_yn':
                            if(state.currentEditItem !=='' && state.currentEditItem !== null && state.currentEditItem !== undefined){
                                if(state.currentEditItem.use_yn === 'Y'){
                                    grid.hostElement.querySelector('#use_yn').value='N';
                                    state.currentEditItem.use_yn = 'N'
                                }else{
                                    grid.hostElement.querySelector('#use_yn').value='Y';
                                    state.currentEditItem.use_yn = 'Y'
                                }
                            }                            
                            break;
                    }
                }        
            } 
        });
        
        //코드 유효성 검사
        grid.addEventListener(grid.hostElement, 'change', (e) => {
            if(e.target.id == "code"){
                // handle buttons
                switch (e.target.id) {
                    case 'code':
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
                                    input.value = state.currentEditItem.code;
                                }                                
                            }
                        }               
                        break;
                }
            } 

        });

        // exit edit mode when scrolling the grid or losing focus
        // grid.scrollPositionChanged.addHandler(cancelEdit.bind(this));
        // grid.lostFocus.addHandler(cancelEdit.bind(this));       

        // grid = state.flex;
        
    };

    //추가 버튼 
    const rowAdd=(e)=>{    
        if(e === true){ //행추가일때
            state.currentEditItem = { id: 0, code: '', addCode : '', subject:'',group: '',use_yn: ''};
             
            var view = new CollectionView(state.list)

            view.sourceCollection.splice(0 ,0,state.currentEditItem); //값 삽입
            state.flex.collectionView.refresh(state.currentEditItem); // 삽입된 값 그리드에 반영         

            state.addBtn = false;  
            
        }else{ //행추가를 취소할때
            state.flex.collectionView.remove(state.currentEditItem);
            state.addBtn = true;
        }
        
    }

    //수정 버튼 
    const editItem= (item)=> {
        state.currentEditItem = item;
        state.flex.invalidate()
        
    }

    //확인 버튼
    const commitEdit=()=> {
        if (state.currentEditItem) { //수정일때
            var validate = true;
            var msg = "";
            state.flex.columns.map((col) => {
                let input = state.flex.hostElement.querySelector('#' + col.binding);
                // let wjvalue = input?.querySelector('.wj-form-control')?.value;
                if (input) {
                    if(col.binding ==='code' && input.value == "" ){
                        msg = "계정 코드를 입력하세요.";
                        validate = false;
                    }
                    if(col.binding ==='subject' && input.value == "" ){
                        msg = "계정 과목명을 입력하세요.";
                        validate = false;
                    }
                    if(col.binding ==='group' && input.value == "" ){
                        msg = "계정 그룹을 입력하세요.";
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
                    if(state.currentEditItem.id === 0){
                        state.currentEditItem.addCode = state.currentEditItem.code+state.currentEditItem.id;
                    }
                }                
            });
        }

        if(state.data.length > 0){
            var chk = true
            state.data.forEach((e) => {    
                //기존 배열에 들어간 user_id와 같으면 값 수정
                if(e.id !== 0){
                    if(e.id === state.currentEditItem.id){
                        e.id= state.currentEditItem.id
                        e.code= state.currentEditItem.code
                        e.subject= state.currentEditItem.subject
                        e.group = state.currentEditItem.group
                        e.use_yn= state.currentEditItem.use_yn
                        chk = false
                    }
                }else{
                    if(e.addCode === state.currentEditItem.addCode){
                        e.id= state.currentEditItem.id
                        e.code= state.currentEditItem.code
                        e.addCode = state.currentEditItem.addCode
                        e.subject= state.currentEditItem.subject
                        e.group = state.currentEditItem.group
                        e.use_yn= state.currentEditItem.use_yn
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
        state.flex.invalidate();
        state.addBtn =true;
    }

    //취소버튼
    const cancelEdit=()=>{
        if (state.currentEditItem) {
            if(state.currentEditItem.addCode === ''){ //행추가 취소시 행 삭제
                state.flex.collectionView.remove(state.currentEditItem);
            }
            
            state.currentEditItem = null;
            state.flex.invalidate();
            state.addBtn =true;
        }
    }


    //등록
    const handleSubmit = useCallback(async (e)=> {
        if(state.data.length > 0){
            var axios = require('axios');

            var config={
                method:'POST',
                url:process.env.REACT_APP_API_URL +'/api/v1/douzone-accounting-codes/'+state.type,
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
    
    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["code", "subject", "group", "use_yn", "buttons" ];
    };

    return (
        <Wrapper>
            <Row className="topTableInfo" justify="space-around">
                <Col span={20}>
                    <FlexGridSearch ref={theSearch} placeholder='검색' />
                </Col>
                <Col span={4} className="topTable_right">
                    <Button className="btn btn-primary btn_add" shape="circle" onClick={(e) => {rowAdd(state.addBtn)}}>{state.addBtn ? '+' : '-'}</Button>
                </Col>
            </Row>

            <Row className="gridWrap">       
                <FlexGrid 
                    ref={theGrid}
                    itemsSource={state.list} 
                    stickyHeaders={true} 
                    initialized={(s) => initGrid(s)}
                    selectionMode="None" 
                    headersVisibility="Column"
                    newRowAtTop={true}
                    autoRowHeights={true}
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                    <FlexGridColumn binding="code" header="계정 코드" width={'*'} minWidth={200} align="left" />
                    <FlexGridColumn binding="subject" header="계정 과목명" width={'*'} minWidth={200} align="left" />
                    <FlexGridColumn binding="group" header="계정 그룹" width={'*'} minWidth={200} align="left" />
                    <FlexGridColumn binding="use_yn" header="사용 여부" width={'*'} minWidth={100} align="center" />
                    <FlexGridColumn binding="buttons" header="작업" width={'*'} minWidth={100} align="center" />
                </FlexGrid>     
            </Row>

            <div id="tplBtnViewMode">
                <button id="btnEdit" className="ant-btn ant-btn-primary ant-btn-sm">수정</button>
            </div>

            <Row gutter={10} className="table table_bot">
                <Col xs={16} lg={16}>
                    <div className="btn-group">
                        <Pagination defaultCurrent={1} defaultPageSize={state.pageArr.pageCnt} current={state.pageArr.page} total={state.total} showSizeChanger={false} onChange={pageChange}/>
                        <span style={{marginLeft: 20}}>행 개수 : {state.total}</span>
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

export default accountingCodeList;
