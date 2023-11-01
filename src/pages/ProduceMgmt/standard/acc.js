/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState } from 'react';
import { Pagination, Button, Row, Col, Modal, Select, DatePicker, Input } from 'antd';
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

const accSimList = observer(({tab}) => {
    const { commonStore } = useStore();
    const { Option } = Select;
    const stateData = useLocalStore(() => ({produce_process_id:"", apply_date :"", apply_price :""}));
    const { confirm } = Modal;

    const state = useLocalStore(() => ({
        type : 'simulation-accessory',
        list: [
            {
                id:1,
                produce_process:'CD 제작',
                produce_process_unit:'개',
                avg_price:'215',
                apply_price:'220',
                apply_date:'2022.09.01',
                memo:'',
            },
        ],
        selPrice:'',
        historyList:[
            {
                price:'220',
                apply_date:'2022.09.01',
                worker:'이준호',
            },
            {
                price:'210',
                apply_date:'2022.03.01',
                worker:'이준호',
            }
        ],
        data: [],
        today: moment().format('YYYY-MM-DD'),
        addBtn : true,              //추가버튼 활성화          
        sel:'',
        flex:'',
        gridFilter: null,
        dateItemName: [{id: 1, name: '적용일'}],
    }));    
    
    useEffect(() => { 
        viewData();
        theSearch.current.control.grid = theGrid.current.control;
    }, []);

    const theGrid = React.useRef();
    const theSearch = React.useRef();
    
    const viewData = useCallback(async (val) => {
        if (val == '' || val == '0' || val == undefined) var page = 1;
        else var page = val;
        var axios = require('axios');

        var config = {
            method: 'GET',
            url:
                process.env.REACT_APP_API_URL +'/api/v1/' +state.type,
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
        filter.filterColumns = ["produce_process", "produce_process_unit", "avg_price", "apply_price", "apply_date", "memo", "buttons"];
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
                    case 'apply_price':
                        e.cell.innerHTML = '<button class="btnText title btnRed btn_price">' + commaNum(item.apply_price) +'</button>';
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
                    modalOpen('modify',wjCore.closest(e.target, '.wj-cell')['dataItem']);
                }
               
            }
        });
        grid.autoGenerateColumns = false;
        grid.itemsSource = state.list;
        grid.selectionMode = 0;
        grid.virtualizationThreshold = 20;
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
            stateData.produce_process_id = item.produce_process_id;
            stateData.apply_date = item.apply_date?moment(item.apply_date):moment().add(1,'M').startOf('month');
            stateData.apply_price = item.apply_price;
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
            }else if(stateData.apply_price ==""){
                msg = "적용 단가를 입력하세요.";
                validate = false;
            }
            if(validate!==true){
                Modal.error({
                    content: msg,        
                });
                return false;
            }

            var temp_prices = {}
            temp_prices['produce_process_id'] = stateData.produce_process_id;
            temp_prices['prices']={
                apply_date : stateData.apply_date,
                price : stateData.apply_price,
            }

            state.data = [...state.data, toJS(temp_prices)];

            stateData.produce_process_id = "";
            stateData.apply_date = "";
            stateData.apply_price = "";

            //modalclose
            setModalPriceModify(false);
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

        // console.log('submit',JSON.stringify(toJS(data)[0]));
        // console.log('submit',toJS(data));
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
                    allowSorting={false}
                    allowMerging="ColumnHeaders"
                    selectionMode="None"
                    allowDragging="Both"
                    newRowAtTop={true}
                    autoRowHeights={true}
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                    <FlexGridColumn binding="produce_process" header="공정" width={'*'} minWidth={200} />
                    <FlexGridColumn binding="produce_process_unit" header="단가 기준" width={90} />
                    <FlexGridColumn binding="avg_price" header="평균 단가" width={90} align="right" />
                    <FlexGridColumn binding="apply_price" header="적용 단가" width={90} align="right" />
                    <FlexGridColumn binding="apply_date" header="적용일" width={120} />
                    <FlexGridColumn binding="memo" header="참고사항" width={150} />
                    <FlexGridColumn binding="buttons" header="작업" width={80} align="center" />
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
                        수정 단가 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={16} className="label">
                        <Input type="number" min="0" value={stateData.apply_price} autoComplete="off" onChange={handlePriceInput('apply_price')} />
                    </Col>
                </Row>
            </Modal>

            <Modal title="단가 변경 이력" visible={modalPriceHistory} onCancel={(e) => {modalClose('history')}} footer={null}>
                <FlexGrid 
                    itemsSource={state.historyList} 
                    headersVisibility="Column"
                    autoRowHeights={true}
                >
                    <FlexGridColumn binding="price" header="단가" width={'*'} align="right" />
                    <FlexGridColumn binding="apply_date" header="단가 적용일" width={120} />
                    <FlexGridColumn binding="worker" header="작업자" width={120} />
                </FlexGrid>
            </Modal>

        </Wrapper>
    );
});

export default accSimList;
