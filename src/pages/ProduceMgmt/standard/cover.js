/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState } from 'react';
import { Pagination, Button, Row, Col, Modal, Select, DatePicker, Input} from 'antd';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';
import moment from 'moment';

import '@grapecity/wijmo.touch'; // support drag/drop on touch devices
import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { CollectionView } from '@grapecity/wijmo';
import * as wjInput from '@grapecity/wijmo.react.input';
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

const coverSimList = observer(({tab}) => {
    const { commonStore } = useStore();
    const { Option } = Select;    
    const stateData = useLocalStore(() => ({
        id:'',
        selType:'',
        selDate:'',
        selPrint:'',
        selBinding:'',
        selPostProcess:'',
    }));
    const { confirm } = Modal;

    const state = useLocalStore(() => ({
        type : 'simulation-belt',
        list: [],
        selType:'',
        selDate:'',
        selPrint:'',
        selBinding:'',
        selPostProcess:'',
        historyList:[],
        today: moment().format('YYYY-MM-DD'),
        addBtn : true,              //추가버튼 활성화          
        sel:'',
        flex:'',
        gridFilter: null,
        total: 0,
        data:[],

        //페이징
        pageArr: {
            pageCnt: 30, //리스트 총 갯수
            page: 1, //현재페이지
        },
        dateItemName: [{id: 1, name: '적용일'}],
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
        var axios = require('axios');

        var config = {
            method: 'GET',
            url:
                process.env.REACT_APP_API_URL +'/api/v1/'
                +state.type +
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
                // state.list = response.data.data;
                var temp_list = response.data.data;
                state.list = [];

                temp_list.map(item=>{
                    state.list = [...state.list,
                        {   ...item,
                            processing : item.processing1,
                            unit_price : item.unit_price1,
                            print_price : item.print_price1,
                            bind_price : item.bind_price1,
                            processing_price : item.processing_price1,
                            apply_date : item.apply_date1,
                        }
                    ];
                    state.list = [...state.list,
                        {   ...item,
                            processing : item.processing2,
                            unit_price : item.unit_price2,
                            print_price : item.print_price2,
                            bind_price : item.bind_price2,
                            processing_price : item.processing_price2,
                            apply_date : item.apply_date2,
                        }
                    ];
                    state.list = [...state.list,
                        {   ...item,
                            processing : item.processing3,
                            unit_price : item.unit_price3,
                            print_price : item.print_price3,
                            bind_price : item.bind_price3,
                            processing_price : item.processing_price3,
                            apply_date : item.apply_date3,
                        }
                    ];
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
        filter.filterColumns = ["paper_name", "processing", "unit_price", "print_price", "bind_price", "processing_price", "apply_date", "buttons"];
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
                
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + ' ' + html.split('\\n')[1] + "<br/>" + html.split('\\n')[2] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }
            
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                // create buttons for items not being edited

                switch (col.binding) {
                    case 'print_price':
                    case 'bind_price':
                    case 'processing_price':
                        if(item[col.binding]){
                            e.cell.innerHTML = '<button class="btnText title btnRed btn_price">' + commaNum(s.getCellData(e.row, e.col, true)) +'</button>';
                        }
                        e.cell['dataItem'] = item;
                        break;
                    case 'buttons':
                        let btn = '<button class="btnText btn_modify blueTxt">수정</button>';
                        e.cell.innerHTML = btn;
                        e.cell['dataItem'] = item;
                        break;
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
                    let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                    stateData.id = item.id;
                    stateData.selType = item.processing;
                    stateData.selDate = item.apply_date?moment(item.apply_date):'';
                    stateData.selPrint = item.print_price;
                    stateData.selBinding = item.bind_price;
                    stateData.selPostProcess = item.processing_price;
                    modalOpen('modify',wjCore.closest(e.target, '.wj-cell')['dataItem']);
                }
               
            }
        });
         //사용여부 x인 곳으로 드래깅 금지
         grid.draggingRowOver.addHandler(function (s, e) {
            let dropIndex = e.row;
            if(dropIndex > dragIndex[0]){
                if(dropIndex==0 || (dropIndex+1) % 3!==0){
                    e.cancel = true;
                    return;
                }
            }else{
                if(dropIndex==0 || (dropIndex) % 3!==0){
                    e.cancel = true;
                    return;
                }
            }
        });
        grid.autoGenerateColumns = false;
        grid.itemsSource = state.list;
    };

    const [modalPriceModify, setModalPriceModify] = useState(false);
    const [modalPriceHistory, setModalPriceHistory] = useState(false);
    const modalClose= (obj)=> {
        if(obj == 'history'){
            setModalPriceHistory(false);
        }
        if(obj == 'modify'){
            setModalPriceModify(false);
        }
    }

    const modifyOk= (obj,e)=> {
        if(obj == 'modify'){
            //validation
            var validate = true;
            var msg = "";

            if(stateData.selDate =="" || stateData.selDate == null){
                msg = "적용일을 입력하세요.";
                validate = false;
            }else if(stateData.selPrint ==""){
                msg = "인쇄비를 입력하세요.";
                validate = false;
            }else if(stateData.selBinding ==""){
                msg = "제본비를 입력하세요.";
                validate = false;
            }else if(stateData.selPostProcess ==""){
                msg = "제본비를 입력하세요.";
                validate = false;
            }
            if(validate!==true){
                Modal.error({
                    content: msg,        
                });
                return false;
            }

            var temp_process = {...state.data.find(e=>e.id == stateData.id)};
            if(Object.keys(temp_process).length === 0){
                temp_process = {};
                temp_process['id'] = stateData.id;
            }

            var type = '';
            if(stateData.selType === '띠지'){
                type = 'processes1';
            }else if(stateData.selType === '커버지(단권)'){
                type = 'processes2';
            }else if(stateData.selType === '커버지(합본)'){
                type = 'processes3';
            }

            temp_process[type]={
                print_price: stateData.selPrint,
                bind_price: stateData.selBinding,
                processing_price: stateData.selPostProcess,
                apply_date: moment(stateData.selDate).format('YYYY-MM-DD')
            }

            state.data = state.data.filter(e=> e.id != stateData.id);

            state.data = [...state.data, toJS(temp_process)];

            stateData.id = "";
            stateData.selDate = "";
            stateData.selPrint = "";
            stateData.selBinding = "";
            stateData.selPostProcess = "";

            //modalclose
            setModalPriceModify(false);
        }
        if(obj == 'history'){
            setModalPriceHistory(false);
        }
    }

    const handlePriceInput = (type) => (e) => {
        if(type === "selDate"){
            stateData[type] = e;
        }else{
            stateData[type] = e.target.value;
        }
    }

    const modalOpen = (obj,item) => {
        if(obj == 'history'){
            var temp_history = [];
            var type = [];
            if(item.processing =='띠지'){
                type = item.processes1;
            }else if(item.processing =='커버지(단권)'){
                type = item.processes2;
            }else if(item.processing =='커버지(합본)'){
                type = item.processes3;
            }
            toJS(type).map(e=>{
                temp_history = [...temp_history,{
                    print_price:e.print_price,
                    bind_price:e.bind_price,
                    processing_price:e.processing_price,
                    apply_date:e.apply_date,
                    worker:e.created_info?.name}];
            })
            state.historyList = temp_history;
            setModalPriceHistory(true);
        }
        if(obj == 'modify'){
            setModalPriceModify(true);
        }
    }

    const handleReset = useCallback(() => {
        return confirm({
            title: `이 창의 입력 내용이 삭제됩니다.`,
            content: `그래도 계속 하시겠습니까?`,
                async onOk() {
                    viewData();
                    state.data = [];
                },
            });
    }, []);

    //등록
    const handleSubmit = useCallback(async (e)=> {      
        
        
        var data =[];
        data = state.data;

        // console.log('submit',toJS(data));
        console.log('submit',JSON.stringify(toJS(data)[0]));
        // return false;

        if(state.data.length > 0){
            var axios = require('axios');

            var config={
                method:'POST',
                url:process.env.REACT_APP_API_URL +'/api/v1/'+state.type,
                headers:{
                    'Accept':'application/json',
                },
                    data:data[0]
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

    // 천단위 자동 콤마
    const commaNum = (num) => {
        if(num){
            const number = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return number
        }else{
            return 0;
        }      
    }
    // 병합된 셀이 속하는 행들의 인덱스 값
    let dragIndex = [];
    // 병합된 셀이 속하는 행들의 인덱스 값을 불러오는 코드
    const draggingRow = (s, e) => {
        dragIndex = [];
        let paper_name = s.rows[e.row].dataItem.paper_name;
        for (var i = 0; i < s.rows.length; i++) {
        if (s.rows[i].dataItem.paper_name == paper_name) {
            dragIndex.push(i);
        }
        }
    };
    // 병합된 셀이 속하는 행들의 위치를 변경하는 코드
    const draggedRow = (s, e) => {
        let dropIndex = e.row,
        arr = s.collectionView.items,
        item = [];
        s.collectionView.deferUpdate(() => {
        for (var i = 0; i < dragIndex.length; i++) {
            item.push(arr[dragIndex[i]]);
        }
        arr.splice(dragIndex[0], dragIndex.length);
        // 아래의 행을 위로 드래그 앤 드롭
        if (dragIndex[0] >= dropIndex) {
            for (var i = 0; i < item.length; i++) {
            arr.splice(dropIndex + i, 0, item[i]);
            }
        }
        // 위의 행을 아래로 드래그 앤 드롭
        else if (dragIndex[0] < dropIndex) {
            for (var i = 0; i < item.length; i++) {
            arr.splice(dropIndex - (item.length - 1) + i, 0, item[i]);
            }
        }
        });
    };

    return (
        <Wrapper>
            <Row className="topTableInfo">
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
                {/* <Col span={24} className="topTable_right">
                    <Button
                        className=''
                        type='primary'
                        onClick={(e) => {modalOpen('modify')}}
                    >
                        적용 단가 일괄수정
                    </Button>
                </Col> */}
            </Row>

            <Row className="gridWrap">       
                <FlexGrid 
                    ref={theGrid}
                    itemsSource={state.list} 
                    stickyHeaders={true} 
                    initialized={(s) => initGrid(s)}
                    allowMerging="Cells"
                    allowSorting={false}
                    selectionMode="None"
                    allowDragging="Both"
                    newRowAtTop={true}
                    autoRowHeights={true}
                    draggingRow={draggingRow}
                    draggedRow={draggedRow}
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                    <FlexGridColumn binding="paper_name" header="종이명" allowMerging={true} width={'*'} minWidth={200} />
                    <FlexGridColumn binding="processing" header="공정" width={150} />
                    <FlexGridColumn binding="unit_price" header="단가 기준" width={90} />
                    <FlexGridColumn binding="print_price" header="인쇄" width={80} align="right" />
                    <FlexGridColumn binding="bind_price" header="제본" width={80} align="right" />
                    <FlexGridColumn binding="processing_price" header="후가공" width={80} align="right" />
                    <FlexGridColumn binding="apply_date" header="단가 적용일" width={100} />
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
                    <Button id="btn" type="primary" htmlType="button" onClick={handleSubmit}>확인</Button>
                </Col>
                <Col>
                    <Button htmlType="button" onClick={handleReset}>취소</Button>
                </Col>
            </Row>

            <Modal 
                title="단가 수정" 
                visible={modalPriceModify} 
                onCancel={(e) => {modalClose('modify')}}
                onOk={(e)=>{modifyOk('modify')}}
            >
                <Row gutter={10} className="table">
                    <Col xs={24} lg={8} className="label">
                        적용일 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={16}>
                        <DatePicker onChange={handlePriceInput('selDate')} value={stateData.selDate} />
                    </Col> 
                    <Col xs={24} lg={24} className="label">
                        수정 단가
                    </Col>
                    <Col xs={24} lg={8} className="label">
                        인쇄 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={16} className="label">
                        <Input type="number" onChange={handlePriceInput('selPrint')} min="0" value={stateData.selPrint} autoComplete="off"  />
                    </Col>
                    <Col xs={24} lg={8} className="label">
                        제본 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={16} className="label">
                        <Input type="number" onChange={handlePriceInput('selBinding')} min="0" value={stateData.selBinding} autoComplete="off"  />
                    </Col>
                    <Col xs={24} lg={8} className="label">
                        후가공 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={16} className="label">
                        <Input type="number" onChange={handlePriceInput('selPostProcess')} min="0" value={stateData.selPostProcess} autoComplete="off"  />
                    </Col>
                </Row>
            </Modal>

            <Modal title="단가 변경 이력" visible={modalPriceHistory} onCancel={(e) => {modalClose('history')}} footer={null}>
                <FlexGrid 
                    itemsSource={state.historyList} 
                    headersVisibility="Column"
                    autoRowHeights={true}
                >
                    <FlexGridColumn binding="print_price" header="인쇄" width={100} align="right" />
                    <FlexGridColumn binding="bind_price" header="제본" width={100} align="right" />
                    <FlexGridColumn binding="processing_price" header="후가공" width={100} align="right" />
                    <FlexGridColumn binding="apply_date" header="단가 적용일" width={100} />
                    <FlexGridColumn binding="worker" header="작업자" width={'*'} />
                </FlexGrid>
            </Modal>

        </Wrapper>
    );
});

export default coverSimList;
