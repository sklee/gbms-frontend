/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState } from 'react';
import { Pagination, Button, Row, Col, Modal, Select, DatePicker, Input,Radio} from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import { toJS } from 'mobx';

import useStore from '@stores/useStore';
import moment from 'moment';

import '@grapecity/wijmo.touch'; // support drag/drop on touch devices
import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { Selector } from "@grapecity/wijmo.grid.selector";
import { CollectionView } from '@grapecity/wijmo';
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjGrid from '@grapecity/wijmo.grid';
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

const paperSimList = observer(({tab}) => {
    const { commonStore } = useStore();
    const { Option } = Select;
    const stateData = useLocalStore(() => ({apply_date :"", fix_type :"", price_control :"", price :""}));
    const { confirm } = Modal;

    const state = useLocalStore(() => ({
        type : 'simulation-paper',

        list: [],
        historyList:[],
        data: [],

        addBtn : true,              //추가버튼 활성화          
        currentEditItem : null,     //row data
        sel:'',
        flex:'',
        priceEditBl:false,

        addCnt : 1,
        selected : [],

        today: moment().format('YYYY-MM-DD'),

        //페이징
        total: 1000,
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },
        gridFilter: null,
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
                process.env.REACT_APP_API_URL +'/api/v1/' +state.type+
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

                state.total = response.data.meta.total;
                state.pageArr.page = response.data.meta.current_page;
                state.pageArr.pageCnt = response.data.meta.per_page;
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

    const pageChange = (num)=>{
        let FLEXLAYOUT = document.querySelectorAll(".flexlayout__tab");
        FLEXLAYOUT.forEach((item)=>{
            item.scrollTo(0, 0);
        })
        viewData(num);
    }
    
    const [priceEditAll, setPriceEditAll] = useState(false);
    const showCheckedCount = () => {
        let sel =  state.flex.rows.filter(r => r.isSelected);
        var temp = [];
        sel.map(e=>{
            temp = [...temp,{id:e.dataItem.id,apply_price:e.dataItem.apply_price}];
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
        filter.filterColumns = ["paper_code", "paper_gsm", "paper_company", "paper_color", "paper_type", "paper_standard", "paper_grain", "width", "height", 
        "cover", "text", "endpaper", "belt", "memo", "paper_name", "price", "avg_price", "apply_price", "apply_date" ];
    };

    const initGrid = (grid) => {    
        state.flex= grid;

        let extraRow = new wjGrid.Row();
        extraRow.allowMerging = true;
        var panel = grid.columnHeaders;
        panel.rows.splice(0, 0, extraRow);

        state.sel = new Selector(grid, {
            itemChecked: () => {
                showCheckedCount();
            }
        })
        
        state.sel._col.allowMerging = true;
        state.sel.column = grid.columns[0];

        for (let colIndex = 0; colIndex <= 19; colIndex++) {
            if(colIndex >= 10 && colIndex <= 13){ 
                panel.setCellData(0, colIndex, '상품 기본 구성 선택 시 노출 여부');
            } else {
                let col = grid.getColumn(colIndex);
                col.allowMerging = true;
                panel.setCellData(0, colIndex, col.header);
            }            
        }

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
                if(col.binding == 'chk'){
                    e.cell.classList.add("headCenter")
                }else{
                    if(html.split('\\n').length > 1){
                        e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + ' ' + html.split('\\n')[1] + "<br/>" + html.split('\\n')[2] + '</div>';
                    }else{
                        e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                    }
                }
            }
            
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                
                // create buttons for items not being edited
                switch (col.binding) {
                    case 'cover':
                    case 'text':
                    case 'endpaper':
                    case 'belt':
                        var val = s.getCellData(e.row, e.col, true);
                        if(val == "Y"){
                            var checked = 'checked="checked"';
                        }else{
                            var checked = '';
                        }
                        e.cell.innerHTML = '<input id="' + col.binding + item.id + '" type="checkbox" name= "'+item.id+'" value="'+val+'" '+checked+' onClick="return false;" />';
                        e.cell['dataItem'] = item;
                        break;
                    case 'apply_price':
                        let priceWrap = '';
                        if(item.apply_price){
                            priceWrap ='<button class="btnText title btnRed btn_price">' + commaNum(item.apply_price) +'</button>';
                        }
                        e.cell.innerHTML = priceWrap;
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
            }
        });
        grid.autoGenerateColumns = false;
        grid.itemsSource = state.list;

        //init selection none
        grid.selectionMode = 0;
        grid.virtualizationThreshold = 30;
    };

    const initListGrid = (grid) => {
        grid.formatItem.addHandler(function (s, e) {
            if(e.panel._ct == 4){
                e.cell.innerHTML = '<div class="v-center">순서</div>';
            }
        });
    }

    const [modalPriceModify, setModalPriceModify] = useState(false);
    const [modalPriceHistory, setModalPriceHistory] = useState(false);
    const modalClose= (obj)=> {
        if(obj == 'history'){
            setModalPriceHistory(false);
        }
        if(obj == 'modify'){
            stateData.apply_date = "";
            stateData.fix_type = "";
            stateData.price_control = "";
            stateData.price = "";
            setModalPriceModify(false);
        }
    }

    const modalOpen = (obj,item) => {
        if(obj == 'history'){
            var temp_history = [];
            toJS(item.apply_prices).map(e=>{
                temp_history = [...temp_history,{price:e.price,apply_date:e.apply_date,worker:e.created_info?.name}];
            })
            state.historyList = temp_history;
            setModalPriceHistory(true);
        }
        if(obj == 'modify'){
            stateData.apply_date = moment().add(1,'M').startOf('month');
            setModalPriceModify(true);
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
            }else if(stateData.price ==""){
                msg = "고시가격을 입력하세요.";
                validate = false;
            }else if(stateData.price_control ==""){
                msg = "인상/인하를 선택하세요.";
                validate = false;
            }else if(stateData.fix_type ==""){
                msg = "수정방법을 입력하세요.";
                validate = false;
            }
            if(validate!==true){
                Modal.error({
                    content: msg,        
                });
                return false;
            }
            //modalclose
            setModalPriceModify(false);
        }
        if(obj == 'history'){
            setModalPriceHistory(false);
        }
    }

    const handleReset = useCallback(() => {
        return confirm({
            title: `이 창의 입력 내용이 삭제됩니다.`,
            content: `그래도 계속 하시겠습니까?`,
                async onOk() {
                    viewData();
                    state.selected = null;
                    stateData.apply_date = "";
                    stateData.fix_type = "";
                    stateData.price_control = "";
                    stateData.price = "";
                },
            });
    }, []);

    const handlePriceInput = (type) => (e) => {
        if(type === "apply_date"){
            stateData[type] = e; 
        }else{
            stateData[type] = e.target.value;
        }
    }

    const handlePriceSubmit = useCallback(async ()=> {
        var validate = true;
        if(!state.priceEditBl){
            Modal.error({
                content: "변경할 항목을 선택해주세요",        
            });
            return false;
        }else if(stateData.apply_date =="" || stateData.apply_date == null){
            validate = false;
        }else if(stateData.price ==""){
            validate = false;
        }else if(stateData.price_control ==""){
            validate = false;
        }else if(stateData.fix_type ==""){
            validate = false;
        }
        if(validate!==true){
            Modal.error({
                content: "단가 일괄 등록을 정확히 입력해주세요.",        
            });
            return false;
        }

        var data = [];

        state.selected.map((e)=>{
            var temp_price = e.apply_price;
            if(stateData.fix_type==1){
                if(stateData.price_control==1){
                    temp_price = temp_price * (1+(stateData.price/100));
                }else if(stateData.price_control==2){
                    temp_price = temp_price * (1-(stateData.price/100));
                }
            }else if(stateData.fix_type==2){
                temp_price = stateData.price;
            }
            data = [...data, {
                    id:e.id,
                    prices:[{
                        price:temp_price,
                        apply_date:moment(stateData.apply_date).format('YYYY-MM-DD')
                    }]
                }];
        });

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
            if(response.data.id != ''){
                Modal.success({
                    title: response.data.result,
                    onOk(){
                        viewData();
                        state.selected = null;
                        stateData.apply_date = "";
                        stateData.price_control = "";
                        stateData.fix_type = "";
                        stateData.price = "";
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
            console.log(error);
            Modal.error({
                title : (<div>등록시 문제가 발생하였습니다.<br/>재시도해주세요.</div>)
            });  
        });   
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
                    <Button
                        type='primary'
                        onClick={(e) => {modalOpen('modify')}}
                    >
                        적용 단가 일괄적용
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
                    <FlexGridColumn binding="chk" header=" " width={50} align="center" cssClass="chk" />
                    <FlexGridColumn binding="paper_code" header="종이\n코드" width={80} />
                    <FlexGridColumn binding="paper_gsm" header="평량\n(g/㎡)" width={70} align="right" />
                    <FlexGridColumn binding="paper_company" header="제조사" width={100} />
                    <FlexGridColumn binding="paper_color" header="색상" width={100} />
                    <FlexGridColumn binding="paper_type" header="종이\n종류" width={90} />
                    <FlexGridColumn binding="paper_standard" header="종이\n규격" width={100} />
                    <FlexGridColumn binding="paper_grain" header="종이결" width={80} />
                    <FlexGridColumn binding="width" header="가로\n(mm)" width={70} align="right" />
                    <FlexGridColumn binding="height" header="세로\n(mm)" width={70} align="right" />
                    <FlexGridColumn binding="cover" header="표지" width={60} align="center" />
                    <FlexGridColumn binding="text" header="본문" width={60} align="center" />
                    <FlexGridColumn binding="endpaper" header="면지" width={60} align="center" />
                    <FlexGridColumn binding="belt" header="띠지" width={60} align="center" />
                    <FlexGridColumn binding="memo" header="추가\n표시 정보" width={80} />
                    <FlexGridColumn binding="paper_name" header="종이명" width={'*'} minWidth={200} />
                    <FlexGridColumn binding="price" header="고시가격" width={80} align="right" />
                    <FlexGridColumn binding="avg_price" header="평균\n단가" width={80} align="right" />
                    <FlexGridColumn binding="apply_price" header="적용\n단가" width={80} align="right" />
                    <FlexGridColumn binding="apply_date" header="적용일" width={100} />
                </FlexGrid>     
            </Row>

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
                    <Button id="btn" type="primary" htmlType="button" onClick={e=>{handlePriceSubmit()}}>확인</Button>
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
                        <DatePicker onChange={handlePriceInput('apply_date')} value={stateData.apply_date} />
                    </Col>
                    <Col xs={24} lg={8} className="label">
                        인상/인하 선택 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={16}>
                        <Radio.Group
                            onChange={handlePriceInput('price_control')} 
                            value={stateData.price_control}
                            required
                        >
                            <Radio value="1">인상</Radio>
                            <Radio value="2">인하</Radio>
                        </Radio.Group>
                    </Col>
                    <Col xs={24} lg={8} className="label">
                        수정 방법 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={16}>
                        <Radio.Group
                            onChange={handlePriceInput('fix_type')} 
                            value={stateData.fix_type}
                            required
                        >
                            <Radio value="1">비율(%)</Radio>
                            <Radio value="2">정액</Radio>
                        </Radio.Group>
                    </Col>
                    <Col xs={24} lg={8} className="label">
                        수정 값 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={16}>
                        <Input name="name" onChange={handlePriceInput('price')} value={stateData.price}/>
                    </Col>
                </Row>
            </Modal>

            <Modal title="단가 변경 이력" visible={modalPriceHistory} onCancel={(e) => {modalClose('history')}} footer={null}>
                <FlexGrid 
                    itemsSource={state.historyList} 
                    headersVisibility="Column"
                >
                    <FlexGridColumn binding="price" header="적용 단가" width={'*'} align="right" />
                    <FlexGridColumn binding="apply_date" header="단가 적용일" width={150} />
                    <FlexGridColumn binding="worker" header="작업자" width={150} />
                </FlexGrid>
            </Modal>

        </Wrapper>
    );
});

export default paperSimList;
