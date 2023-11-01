/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect } from 'react';
import { Pagination, Button, Row, Col, Modal,Select} from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';
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

const PAPER_STANDARD = ["대국전지", "국전지", "46전지", "46전지 반절"];
const PAPER_GRAIN = ["횡목", "종목"];
const PAPER_CUTTING = [1, 2, 3, 4, 5, 6, 8, 16, 32, 64, 128, 256, 12, 24, 10, 20, 22, 11, 40, 136, 7, 14, 72, 15, 13, 26, 45, 18, 9];
const REFRENCE_STANDARD = ["A1", "A2", "A3", "A4", "A5", "A6", "B1", "B2", "B3", "B4", "B5", "B6"];

const Wrapper = styled.div`
    width: 100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
    #tplBtnViewMode, #tplBtnEditMode {display:none}
`;



const produceEdition = observer(({tab}) => {
    const { commonStore } = useStore();
    
    const { Option } = Select;    
    const { confirm } = Modal;

    const state = useLocalStore(() => ({

        type : 'produce-formats',

        list: [],
        data: [],
        paper_standard : [],

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
        getPaperStandard() 
        viewData();
        theSearch.current.control.grid = theGrid.current.control;
    }, []);

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    const getPaperStandard = useCallback(async () =>{
        const result = await commonStore.handleApi({
            url: '/paper-standards',
        });
        state.paper_standard = result.data
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

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = [ "name", "transform_yn", "paper_standard", "paper_grain", "paper_cutting", "width", "height", "paper_holder", "reference_standard", "simulation_yn", "use_yn", "buttons"];
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
                        case 'name':
                        case 'width':
                        case 'height':
                        case 'paper_holder':
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'"'+'value="'+s.getCellData(e.row, e.col, true)+'"/>';
                            e.cell['dataItem'] = item;
                            break;
                        case 'transform_yn':
                            if(item.transform_yn == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + '" type="checkbox" name= "'+col.binding+item.id+'" value="'+item.transform_yn+'" '+checked+' />';
                            break;
                        case 'simulation_yn':
                            if(item.simulation_yn == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + '" type="checkbox" name= "'+col.binding+item.id+'" value="'+item.simulation_yn+'" '+checked+' />';
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
                        case 'transform_yn':
                            if(item.transform_yn == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + item.id + '" type="checkbox" name= "'+col.binding+item.id+'" value="'+item.transform_yn+'" '+checked+' onClick="return false;" />';
                            break;
                        case 'simulation_yn':
                            if(item.simulation_yn == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + item.id + '" type="checkbox" name= "'+col.binding+item.id+'" value="'+item.simulation_yn+'" '+checked+' onClick="return false;" />';
                            break;
                        case 'use_yn':
                            if(item.use_yn == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + item.id + '" type="checkbox" name= "'+col.binding+item.id+'" value="'+item.use_yn+'" '+checked+' onClick="return false;" />';
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
                if(e.target.id == "simulation_yn"){
                    if(state.currentEditItem.simulation_yn === 'Y'){
                        grid.hostElement.querySelector('#simulation_yn').value='N';
                        state.currentEditItem.simulation_yn = 'N'
                    }else{
                        grid.hostElement.querySelector('#simulation_yn').value='Y';
                        state.currentEditItem.simulation_yn = 'Y'
                    }
                }  
                if(e.target.id == "transform_yn"){
                    if(state.currentEditItem.transform_yn === 'Y'){
                        grid.hostElement.querySelector('#transform_yn').value='N';
                        state.currentEditItem.transform_yn = 'N'
                    }else{
                        grid.hostElement.querySelector('#transform_yn').value='Y';
                        state.currentEditItem.transform_yn = 'Y'
                    }
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
                category:'',
                name:'',
                transform_yn:'',
                paper_standard:'',
                paper_grain:'',
                paper_cutting:'',
                width:'',
                height:'',
                paper_holder : '',
                reference_standard:'',
                simulation_yn:'',
                use_yn:'',
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
                    if(col.binding==='paper_standard' && wjvalue ==""){
                        msg = "종이 규격을 선택하세요.";
                        validate = false;
                    }
                    if(col.binding==='name' && input.value ==""){
                        msg = "판형을 입력하세요.";
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
                    if(col.binding === 'paper_standard'){
                        // let text = input.querySelector('.wj-form-control').value;
                        // let result = state.paper_standard.find(col => col.name == text );
                        // state.currentEditItem[col.binding] = text;
                        // state.currentEditItem['paper_standard_id'] = result? result.id : ''
                    }
                    if(col.binding === 'use_yn'){
                        state.currentEditItem[col.binding] = value;       
                        if(value!=='Y'){
                            state.currentEditItem['simulation_yn'] = 'N';
                        }
                    }
                    if(col.binding === 'simulation_yn'){
                        state.currentEditItem[col.binding] = value; 
                    }
                    if(col.binding === 'transform_yn'){
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
                        e.transform_yn= state.currentEditItem.transform_yn;
                        e.paper_standard= state.currentEditItem.paper_standard;
                        e.paper_holder= state.currentEditItem.paper_holder;
                        e.reference_standard= state.currentEditItem.reference_standard;
                        e.simulation_yn= state.currentEditItem.simulation_yn;
                        e.use_yn= state.currentEditItem.use_yn;
                        chk = false;
                    }
                }else{
                    if(e.addCode === state.currentEditItem.addCode){
                        e.name= state.currentEditItem.name;
                        e.transform_yn= state.currentEditItem.transform_yn;
                        e.paper_standard= state.currentEditItem.paper_standard;
                        e.paper_holder= state.currentEditItem.paper_holder;
                        e.reference_standard= state.currentEditItem.reference_standard;
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
                    name: item.name,
                    transform_yn: item.transform_yn,
                    paper_standard_id: item.paper_standard_id,
                    paper_holder: item.paper_holder,
                    reference_standard: item.reference_standard,
                    simulation_yn: item.simulation_yn,
                    use_yn : item.use_yn
                };
            }else{
                temp = {
                    name: item.name,
                    transform_yn: item.transform_yn,
                    paper_standard_id: item.paper_standard_id,
                    paper_holder: item.paper_holder,
                    reference_standard: item.reference_standard,
                    simulation_yn: item.simulation_yn,
                    use_yn : item.use_yn
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
                    <FlexGridColumn binding="name" header="판형" width={'*'} minWidth={150} />
                    <FlexGridColumn binding="transform_yn" header="변형 여부" width={80} align="center" />
                    <FlexGridColumn binding="paper_standard" header="종이 규격" width={120}>
                        <FlexGridCellTemplate
                            cellType="Cell"
                            template={(cell) => {
                                let result = state[cell.col.binding].filter(col => col.name == cell.item.paper_standard);
                                if(cell.item.rowAdd) {
                                    return (
                                        <wjInput.ComboBox
                                            id={cell.col.binding}
                                            placeholder="선택"
                                            itemsSource={new CollectionView(state.paper_standard, {
                                                currentItem: null
                                            })}
                                            selectedValuePath="id"
                                            displayMemberPath="name"
                                            valueMemberPath="id"
                                            selectedValue={result.length > 0 ? result?.[0].id : ''}
                                            selectedIndexChanged={(e)=>{
                                                state.currentEditItem.paper_standard = e.selectedItem.name // 종이 규격
                                                state.currentEditItem['paper_standard_id'] = e.selectedItem.id // 종이 규격
                                                state.currentEditItem.paper_grain = e.selectedItem.paper_grain // 종이결
                                                state.currentEditItem.paper_cutting = e.selectedItem.paper_cutting // 본문 절수
                                                state.currentEditItem.width = e.selectedItem.width // 가로
                                                state.currentEditItem.height = e.selectedItem.height // 세로
                                            }}
                                            style={{ width: '100%' }}
                                        />
                                    );
                                } else {
                                    return cell.item.paper_standard;
                                }
                            }}
                        />
                    </FlexGridColumn>
                    <FlexGridColumn binding="paper_grain" header="종이결" width={100} >
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
                    <FlexGridColumn binding="paper_cutting" header="본문 절수" width={100} align="right">
                        <FlexGridCellTemplate
                            cellType="Cell"
                            template={(cell) => {
                                if(cell.item.rowAdd) {
                                    return (
                                        <wjInput.ComboBox
                                            id={cell.col.binding}
                                            placeholder="선택"
                                            itemsSource={new CollectionView(PAPER_CUTTING, {
                                                currentItem: null
                                            })}
                                            selectedValue={cell.item.paper_cutting}
                                            style={{ width: '100%' }}
                                        />
                                    );
                                } else {
                                    return cell.item.paper_cutting;
                                }
                            }}
                        />
                    </FlexGridColumn>
                    <FlexGridColumn binding="paper_holder" header="면지\n판걸이 수" width={100} align="right" />
                    <FlexGridColumn binding="width" header="가로(mm)" width={80} align="right" />
                    <FlexGridColumn binding="height" header="세로(mm)" width={80} align="right" />
                    <FlexGridColumn binding="reference_standard" header="참고 규격" width={80}>
                        <FlexGridCellTemplate
                            cellType="Cell"
                            template={(cell) => {
                                if(cell.item.rowAdd) {
                                    return (
                                        <wjInput.ComboBox
                                            id={cell.col.binding}
                                            placeholder="선택"
                                            itemsSource={new CollectionView(REFRENCE_STANDARD, {
                                                currentItem: null
                                            })}
                                            selectedValue={cell.item.reference_standard}
                                            selectedIndexChanged={(e)=>{
                                                state.currentEditItem.reference_standard = e.selectedItem // 세로
                                            }}
                                            style={{ width: '100%' }}
                                        />
                                    );
                                } else {
                                    return cell.item.reference_standard;
                                }
                            }}
                        />
                    </FlexGridColumn>
                    <FlexGridColumn binding="simulation_yn" header="시뮬레이션\n적용" width={80} align="center" />
                    <FlexGridColumn binding="use_yn" header="사용 여부" width={80} align="center" />
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

export default produceEdition;
