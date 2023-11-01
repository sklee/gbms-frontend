/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect } from 'react';
import { Pagination, Button, Row, Col, Modal, Select } from 'antd';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';
import moment from 'moment';
import axios from 'axios';

import '@grapecity/wijmo.touch'; // support drag/drop on touch devices
import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import * as wjcCore from "@grapecity/wijmo";
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


const saleSimList = observer(({tab}) => {
    const { commonStore } = useStore();
    const { Option } = Select;
    const { confirm } = Modal;

    const state = useLocalStore(() => ({
        type : 'simulation-sale',
        list: [
            {
                id:1,
                company:'도서출판 길벗',
                department:'IT수험서1팀',
                operating_cost:'3,000,000',
                supply_rate:'65',
                logistics_ratio:'4.5',
                cover:'1,000,000',
                text:'300,000',
                ad_nomal:'1,000,000',
                ad_semi_strategy:'5,000,000',
                ad_strategy:'10,000,000',
                ad_nomal_year1:'70',
                ad_nomal_year2:'20',
                ad_nomal_year3:'10',
                ad_semi_strategy_year1:'71',
                ad_semi_strategy_year2:'19',
                ad_semi_strategy_year3:'10',
                ad_strategy_year1:'66',
                ad_strategy_year2:'25',
                ad_strategy_year3:'9',
            },
        ],
        data: [],
        today: moment().format('YYYY-MM-DD'),
        addBtn : true,              //추가버튼 활성화          
        sel:'',
        flex:'',
        currentEditItem : null,
        gridFilter: null,
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
        filter.filterColumns = ["company", "department", "operating_cost", "supply_rate", "logistics_ratio", "cover", "text", "ad_nomal", "ad_semi_strategy", "ad_strategy", 
        "ad_nomal_year1", "ad_nomal_year2", "ad_nomal_year3", "ad_semi_strategy_year1", "ad_semi_strategy_year2", "ad_semi_strategy_year3", 
        "ad_strategy_year1", "ad_strategy_year2", "ad_strategy_year3", "buttons"];
    };

    const initGrid = (grid) => {    
        state.flex= grid;

        let extraRow = new wjGrid.Row();
        extraRow.allowMerging = true;
        var panel = grid.columnHeaders;
        panel.rows.splice(0, 0, extraRow);

        for (let colIndex = 0; colIndex <= 19; colIndex++) {
            if(colIndex >= 5 && colIndex <= 6){ 
                panel.setCellData(0, colIndex, '내부 디자인비');
            } else if(colIndex >= 7 && colIndex <= 9){
                panel.setCellData(0, colIndex, '광고비');
            } else if(colIndex >= 10 && colIndex <= 18){
                panel.setCellData(0, colIndex, '손익분기 달성 판매부수');
            } else {
                let col = grid.getColumn(colIndex);
                col.allowMerging = true;
                panel.setCellData(0, colIndex, col.header);
            }            
        }

        grid.formatItem.addHandler(function (s, e) {
            if(e.panel._ct == 4){
                if(e.row == 0){
                    e.cell.style.height = '100px';
                } else if (e.row == 1){
                    e.cell.style.display = 'none';
                }
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
                if(item == state.currentEditItem ){
                    switch (col.binding) {
                        case 'company' :
                        case 'department' :
                            break;
                        case 'buttons':
                            let btn = '<button id="btnOK" class="btnText blueTxt">확인</button><button class="btnText btn_cancel grayTxt" id="btnCancel">취소</button>';
                            e.cell.innerHTML = btn;
                            e.cell['dataItem'] = item;
                            break;
                        default:
                            e.cell.innerHTML = '<input type="number" class="ant-input" name ="'+item.id+'"'+'id="'+col.binding+'"'+'value="'+s.getCellData(e.row, e.col, true).replace(/,/g, '')+'"/>';
                            break;
                    }
                } else {
                    switch (col.binding) {
                        case 'buttons':
                            let btn = '<button class="btnText btn_modify blueTxt" id="btnEdit">수정</button>';
                            e.cell.innerHTML = btn;
                            e.cell['dataItem'] = item;
                            break;
                    }
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                // if(e.target.classList.contains('btn_modify')){
                //     let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                //     editItem(item)
                // }
                switch (e.target.id) {
                    // start editing this item
                    case 'btnEdit':
                        if(state.currentEditItem===null){
                            let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                            state.selPriceInfo = item.priceInfo;
                            editItem(item);
                        }
                        break;
                    case 'btnCancel':
                        cancelEdit();
                        break;
                    case 'btnLink':
                        break;
                    case 'btnOK':
                        let idx = wjCore.closest(e.target, '.wj-cell')['dataItem'].id;
                        commitEdit(idx);
                        break;
                }
            }
        });

        grid.collectionView.refresh();
        grid.virtualizationThreshold = 25;
    };

    //수정 버튼 
    const editItem = (item) => {
        state.currentEditItem = item;
        state.flex.invalidate();
        state.flex.collectionView.refresh();
    }

    //확인 버튼
    const commitEdit=(idx)=> {
        if (state.currentEditItem) {
            var validate = true;
            var msg = "";
            state.flex.columns.map((col) => {
                let input = state.flex.hostElement.querySelector('#' + col.binding);
                if (input) {
                    
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
                    
                    if(state.currentEditItem.id <= 0){
                        state.currentEditItem.addCode = state.currentEditItem.id;
                    }
                }                
            });
        }

        if(state.data.length > 0){
            var chk = true;
            state.data.forEach((e) => {    
                //기존 배열에 들어간 user_id와 같으면 값 수정
                if(e.id > 0){
                    if(e.id === state.currentEditItem.id){
                        e.id= state.currentEditItem.id;
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
                    viewData();
                    state.currentEditItem = null;
                },
            });
    }, []);

    //등록
    const handleSubmit = useCallback(async (e)=> {      
        
        const row_data = toJS(state.data);
        var data =[];
        row_data.forEach((item)=>{
            var temp_type = Object.keys(item);
            var temp_arr = {};
            temp_type.forEach((item2)=>{
                if(item2 != 'department' && item2 !='company'){
                    if(item[item2]){
                        temp_arr[item2] = item[item2];
                    }
                }
            });
            data = [...data,temp_arr];
        });
        
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

    return (
        <Wrapper>
            <Row className="topTableInfo">
                <FlexGridSearch ref={theSearch} placeholder='검색' />
                {/* <Col span={24} className="topTable_right">
                    <Button
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
                    autoRowHeights={true}
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                    <FlexGridColumn binding="company" header="회사" width={'*'} minWidth={70} />
                    <FlexGridColumn binding="department" header="부서" width={120} />
                    <FlexGridColumn binding="operating_cost" header="경상비" width={100} align="right" />
                    <FlexGridColumn binding="supply_rate" header="공급률\n(%)" width={80} align="right" />
                    <FlexGridColumn binding="logistics_ratio" header="물류비율\n(%)" width={80} align="right" />
                    <FlexGridColumn binding="cover" header="표지" width={80} align="right" />
                    <FlexGridColumn binding="text" header="본문" width={80} align="right" />
                    <FlexGridColumn binding="ad_nomal" header="일반" width={90} align="right" />
                    <FlexGridColumn binding="ad_semi_strategy" header="준전략" width={90} align="right" />
                    <FlexGridColumn binding="ad_strategy" header="전략" width={90} align="right" />
                    <FlexGridColumn binding="ad_nomal_year1" header="일반-\n1년차" width={70} align="right" />
                    <FlexGridColumn binding="ad_nomal_year2" header="일반-\n2년차" width={70} align="right" />
                    <FlexGridColumn binding="ad_nomal_year3" header="일반-\n3년차" width={70} align="right" />
                    <FlexGridColumn binding="ad_semi_strategy_year1" header="준전략-\n1년차" width={70} align="right" />
                    <FlexGridColumn binding="ad_semi_strategy_year2" header="준전략-\n2년차" width={70} align="right" />
                    <FlexGridColumn binding="ad_semi_strategy_year3" header="준전략-\n3년차" width={70} align="right" />
                    <FlexGridColumn binding="ad_strategy_year1" header="전략-\n1년차" width={70} align="right" />
                    <FlexGridColumn binding="ad_strategy_year2" header="전략-\n2년차" width={70} align="right" />
                    <FlexGridColumn binding="ad_strategy_year3" header="전략-\n3년차" width={70} align="right" />
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

export default saleSimList;
