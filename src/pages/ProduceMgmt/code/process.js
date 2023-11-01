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
import * as wjcGrid from '@grapecity/wijmo.grid';
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

const PROCESS_UNIT = ["개", "권", "쪽", "연", "틀", "도수", "기본", "없음"];


const produceProcessList = observer(({tab}) => {
    const { commonStore } = useStore();
    
    const { Option } = Select;    
    const { confirm } = Modal;

    const state = useLocalStore(() => ({
        type : 'produce-process',

        list: [],
        data: [],
        category:[],

        addBtn : true,              //추가버튼 활성화          
        currentEditItem : null,     //row data
        sel:'',
        flex:'',
        addCnt : 1,
    }));    
    
    useEffect(() => { 
        setUnit();
        theSearch.current.control.grid = theGrid.current.control;
    }, []);

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    const grouping = useCallback(async()=>{
        state.list = new wjcCore.CollectionView(state.list, {
            sortDescriptions: ["category", ],
            groupDescriptions: ["category", ]
        });
    }, []);

    //리스트
    const setUnit = useCallback(async (val) => {
        const result = await commonStore.handleApi({
            url: '/produce-process-codes',
        });
        var temp = result.data;
        temp.map(e=>{
            state.category = [...state.category,{'code':e.id,'label':e.name}];
        })
        viewData();
    }, []);

    //리스트
    const viewData = useCallback(async (val) => {
        const result = await commonStore.handleApi({
            url: '/produce-process',
        });
        state.list = result.data;
        state.list.map((e)=>{
            e["category"] = e.code?.name;
        });
        grouping();
    }, []);

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = [ "category", "name", "process_unit", "white_space", "simulation_yn", "use_yn", "buttons" ];
    };

    const initGrid = (grid) => {    
        state.flex= grid;

        grid.formatItem.addHandler(function (s, e) {
            let row = s.rows[e.row];

            if(e.panel._ct == 4){
                e.cell.innerHTML = '<div class="v-center">순서</div>';
            }

            if(e.panel == s.rowHeaders && !(row instanceof wjcGrid.GroupRow)){
                e.cell.innerHTML = e.row + 1;
            }

            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
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
                        case 'white_space':
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'"'+'value="'+s.getCellData(e.row, e.col, true)+'"/>';
                            e.cell['dataItem'] = item;
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
                } else {
                    // create buttons for items not being edited
                    switch (col.binding) {
                        case 'simulation_yn':
                            if(item.simulation_yn == "Y" ){
                                var checked = 'checked="checked"';
                            }else{
                                var checked = '';
                            }
                            e.cell.innerHTML = '<input id="' + col.binding + item.id + '" type="checkbox" name= "'+col.binding+item.id+'" value="'+item.simulation_yn+'" '+checked+' onClick="return false;" />';
                            e.cell['dataItem'] = item;
                            break;
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
                if(e.target.id == "simulation_yn"){
                    if(state.currentEditItem.simulation_yn === 'Y'){
                        grid.hostElement.querySelector('#simulation_yn').value='N';
                        state.currentEditItem.simulation_yn = 'N'
                    }else{
                        grid.hostElement.querySelector('#simulation_yn').value='Y';
                        state.currentEditItem.simulation_yn = 'Y'
                    }
                }      
            } 
        });

        grid.autoGenerateColumns = false;
        grid.itemsSource = state.list;
        //init selection none
        // grid.selectionMode = 0;
    };

    //추가 버튼 
    const rowAdd=(e)=>{    
        if(e === true){ //행추가일때
            state.addCnt = state.addCnt-1;
            state.currentEditItem = { id:state.addCnt,category:'',name:'',process_unit:'',white_space:'',simulation_yn:'',use_yn:'',addCode : '', rowAdd: true};
            var view = state.list;
            view.sourceCollection.splice(0 ,0, state.currentEditItem ); //값 삽입
            state.flex.collectionView.refresh( state.currentEditItem ); // 삽입된 값 그리드에 반영         
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
                let wjvalue = input?.querySelector('.wj-form-control')?.value;
                if (input) {
                    if(col.binding==='process_unit' && wjvalue ==""){
                        msg = "단가기준을 입력하세요.";
                        validate = false;
                    }
                    if(col.binding==='name' && input.value ==""){
                        msg = "공정을 입력하세요.";
                        validate = false;
                    }
                    if(col.binding==='category' && wjvalue ==""){
                        msg = "공정 구분을 입력하세요.";
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
                        let result = state.category.find(col => col.label === text );
                        state.currentEditItem[col.binding] = text;
                        state.currentEditItem['produce_process_code_id'] = result.code;
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
                    if(col.binding === 'white_space'){
                        state.currentEditItem[col.binding] = value;         
                    }
                    if(col.binding === 'process_unit'){
                        state.currentEditItem[col.binding] = input.querySelector('.wj-form-control').value;
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
                        e.category= state.currentEditItem.category;
                        e.process_unit= state.currentEditItem.process_unit;
                        e.produce_process_code_id= state.currentEditItem.produce_process_code_id;
                        e.white_space= state.currentEditItem.white_space;
                        e.simulation_yn= state.currentEditItem.simulation_yn;
                        e.use_yn= state.currentEditItem.use_yn;
                        chk = false;
                    }
                }else{
                    if(e.addCode === state.currentEditItem.addCode){
                        e.name= state.currentEditItem.name;
                        e.category= state.currentEditItem.category;
                        e.process_unit= state.currentEditItem.process_unit;
                        e.produce_process_code_id= state.currentEditItem.produce_process_code_id;
                        e.white_space= state.currentEditItem.white_space;
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
                temp = {
                    id: item.id,
                    name: item.name,
                    produce_process_code_id: item.produce_process_code_id,
                    process_unit: item.process_unit,
                    simulation_yn: item.simulation_yn,
                    white_space : item.white_space,
                    use_yn : item.use_yn
                };
            }else{
                temp = {
                    name: item.name,
                    produce_process_code_id: item.produce_process_code_id,
                    process_unit: item.process_unit,
                    simulation_yn: item.simulation_yn,
                    white_space : item.white_space,
                    use_yn : item.use_yn
                };
            }
            data = [...data,temp];
        });

        if(state.data.length > 0){
            const result = await commonStore.handleApi({
                method: 'POST',
                url: '/produce-process',
                data : data
            });
            Modal.success({
                title: result.result,
                onOk(){
                    viewData();
                    state.data = [];
                },
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
                    <FlexGridColumn binding="category" header="공정 구분" width={300} minWidth={200} >
                        <FlexGridCellTemplate
                            cellType="Cell"
                            template={(cell) => {
                                let result = state[cell.col.binding].find(col => col.label == cell.item.category);
                                if(cell.item.rowAdd) {
                                    return (
                                        <wjInput.ComboBox
                                            id={cell.col.binding}
                                            placeholder="선택"
                                            itemsSource={new CollectionView(state.category, {
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
                    <FlexGridColumn binding="name" header="공정" width={'*'} minWidth={200} />
                    <FlexGridColumn binding="process_unit" header="단가기준" width={120} >
                        <FlexGridCellTemplate
                            cellType="Cell"
                            template={(cell) => {
                                if(cell.item.rowAdd) {
                                    return (
                                        <wjInput.ComboBox
                                            id={cell.col.binding}
                                            placeholder="선택"
                                            itemsSource={new CollectionView(PROCESS_UNIT, {
                                                currentItem: null
                                            })}
                                            selectedValue={cell.item.process_unit}
                                            style={{ width: '100%' }}
                                        />
                                    );
                                } else {
                                    return cell.item.process_unit;
                                }
                            }}
                        />
                    </FlexGridColumn>
                    <FlexGridColumn binding="white_space" header="여분" width={140}  minWidth={120} />
                    <FlexGridColumn binding="simulation_yn" header="시뮬레이션\n적용" width={100} align="center" />
                    <FlexGridColumn binding="use_yn" header="사용 여부" width={100} align="center" />
                    <FlexGridColumn binding="buttons" header="작업" width={100} align="center" />
                </FlexGrid>     
            </Row>

            <Row gutter={10} className="table table_bot">
                <Col xs={16} lg={16}>
                    <div className="btn-group">
                        {/* <Pagination defaultCurrent={1} defaultPageSize={state.pageArr.pageCnt} current={state.pageArr.page} total={state.total} showSizeChanger={false}/> */}
                        <span>행 개수 : {state.list._view?.length}</span>
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

export default produceProcessList;
