/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useRef,useState } from 'react';
import { Button, Row, Col, Modal, Pagination, Input, DatePicker } from 'antd';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { CollectionView } from '@grapecity/wijmo';
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjCore from '@grapecity/wijmo';
import * as wjcGrid from "@grapecity/wijmo.react.grid";
import * as wjGrid from '@grapecity/wijmo.grid';

import * as FlexLayout from 'flexlayout-react';
import '/node_modules/flexlayout-react/style/light.css';

import CommonView from './view';
import AddPrd from './Add';

import Popout from '@components/Common/popout/popout';
import Excel from '@components/Common/Excel';

const Wrapper = styled.div`
    width: 100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
    #tplBtnViewMode {
        display: none;
    }
`;

const accountList = observer((props) => {
    const { commonStore } = useStore();
    const { Search } = Input;

    //flexLayout
    var json = {
        global: {},
        borders: [],
        layout: {
            type: 'row',
            weight: 100,
            children: [
                {
                    type: 'tabset',
                    id: 'view-area',
                    weight: 100,
                    enableDeleteWhenEmpty: true,
                    children: [
                        {
                            type: 'tab',
                            name: 'tab',
                            id: 'init',
                            component: 'init',
                            enableDrag: false,
                        },
                    ],
                    active: true,
                },
            ],
        },
        dateItemName: [{id: 1, name: '신청일'}],
    };

    const state = useLocalStore(() => ({
        //flexLayout
        model: FlexLayout.Model.fromJson(json),
        tabLen: 1,
        tabInit: false,
        theGrid : React.createRef(),

        list: [],
        total: 0,
        idx: '',

        //엑셀
        excelData: '', //리스트 데이터
        column: '', //필터 컬럼

        //페이징
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },
    }));

    useEffect(() => {
        fetchData();
    }, [props]);


    const pageChange = (num)=>{
        let FLEXLAYOUT = document.querySelectorAll(".flexlayout__tab");
        FLEXLAYOUT.forEach((item)=>{
            item.scrollTo(0, 0);
        })
        fetchData(num);
    }

    //현재 리스트  dom확인
    const tabRef = useRef();

    //리스트
    const fetchData = useCallback(async (val) => {

        if (val == '' || val == '0' || val == undefined) {
            var page = 1;
        } else {
            var page = val;
        }

        var axios = require('axios');

        var config = {
            method: 'GET',
            url:process.env.REACT_APP_API_URL +'/api/v1/purchase-accounts?display=' +state.pageArr.pageCnt +'&page=' +page +'&sort_by=date&order=desc',
            headers: {
                Accept: 'application/json',
            },
        };

        axios(config)
            .then(function (response) {                
                var result_page =
                    (page - 1) * state.pageArr.pageCnt;
                var str_no = response.data.meta.total - result_page;

                response.data.data.map((e, number) => {
                    e.cnt = str_no - number;
                    if(e.created_at){
                        e.created_at = e.created_at.substring(0,10);
                    }
                    if(e.allow_search_yn === 'Y'){
                        e.allow_search_yn= '사용'
                    }else{
                        e.allow_search_yn= '숨김'
                    }   
                });

                state.list = response.data.data;
                state.total = response.data.meta.total;
                state.pageArr.page = response.data.meta.current_page;
                state.pageArr.pageCnt = response.data.meta.per_page;
            })
            .catch(function (error) {
                if(error !=='' && error !== undefined){
                    Modal.error({
                        title: '오류가 발생했습니다. 재시도해주세요.',
                        // content: '오류코드:'+error.response.status,  
                    });
                }
                
            });
    }, []);

    //drawer
    const [viewAddVisible, setViewAddVisible] = useState(false);
    const [visible, setVisible] = useState(false);

    //add drawer open
    const showDrawer = () => {
        setViewAddVisible(true);
    };

    //view drawer open
    const viewChk = (idx) => {
        state.idx = idx;
        setVisible(true);
    };

    //view drawer 닫기
    const viewOnClose = () => {
        setVisible(false);
    };

    //add drawer 닫기
    const addOnClose = () => {
        setViewAddVisible(false);
    };

    //위즈모 체크박스 선택
    const initGrid = (grid) => {
        state.grid =grid;

        //header 합치기
        // grid.rowHeaders.columns.splice(0, 1); // no extra columns

        var extraRow = new wjGrid.Row();
        extraRow.allowMerging = true;

        var panel = grid.columnHeaders;
        panel.rows.splice(0, 0, extraRow);

        for (let colIndex = 0; colIndex <= 9; colIndex++) {
            if(colIndex >= 1 && colIndex <= 2  ){
                panel.setCellData(0, colIndex, '거래처 코드(회계)');
            }else{
                let col = grid.getColumn(colIndex);
                col.allowMerging = true;
                panel.setCellData(0, colIndex, col.header);
            }            
        }      

        // grid.formatItem.addHandler(function (s, e) {
        //     if (e.panel == s.columnHeaders && e.range.rowSpan > 1) {
        //         var html = e.cell.innerHTML;
        //         e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
        //     }
        // });
        // grid.autoGenerateColumns = false;
        // grid.itemsSource = state.list;


        //엑셀
        state.excelData = grid;
        if (state.column == '') {
            var columnData = JSON.parse(grid.columnLayout);
            state.column = columnData.columns;
        }

        //버튼 추가
        grid.formatItem.addHandler((s, e) => {
            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + "<br/>" + html.split('\\n')[1] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                // create buttons for items not being edited
                switch (col.binding) {
                    case 'name':                    
                        e.cell.innerHTML ='<button id="btnLink" class="btnLink">' +item.name +'</button>  '+document.getElementById('tplBtnViewMode').innerHTML;
                        e.cell['dataItem'] = item;
                        break;
                }                         
            }
        });

        // handle button clicks
        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                // get button's data item
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                var name = item.name;
                // handle buttons
                state.idx = item.id;
                state.typeChk = item.type

                switch (e.target.id) {
                    // start editing this item
                    case 'btnLink':
                        viewChk(item.id);
                        break;
                    // remove this item from the collection
                    case 'btnDivide':
                        dividelayout(item.id, name);
                        break;
                    // remove this item from the collection
                    case 'btnNew':
                        //state.window = 'Y';
                        setPopoutOpen(true);
                        break;
                }
            }
        });
    };

    //flexlayout 분활
    const dividelayout = (item, tit) => {
        const btnEl = tabRef.current.classList;

        btnEl.forEach((e) => {
            if (e != 'divide') {
                tabRef.current.classList.add('divide');
            }
        });

        addTab(tit);
    };

    const addTab = (tit) => {
        state.tabLen++;
        var tabsetId;
        var tabidx;
        if (state.model.getActiveTabset() == undefined) {
            for (const [key, value] of Object.entries(state.model._idMap)) {
                if (value._attributes.type == 'tabset') {
                    tabsetId = value._attributes.id;
                    break;
                }
            }
        } else {
            tabsetId = state.model.getActiveTabset().getId();
        }
        state.model.doAction(
            FlexLayout.Actions.addNode(
                {
                    type: 'tab',
                    name: tit,
                    component: 'workspace',
                    //id : state.idx,
                    config: { idx: state.idx },
                },
                tabsetId,
                FlexLayout.DockLocation.CENTER,
                -1,
            ),
        );

        if (state.tabInit == false) {
            state.model.doAction(FlexLayout.Actions.deleteTab('init'));
            state.tabInit = true;
        }
    };

    const factory = (node) => {
        node.setEventListener('close', (p) => {
            state.tabLen--;
            if (state.tabLen == 0) {
                tabRef.current.classList.remove('divide');

                node.removeEventListener('close');
            }
        });

        var component = node.getComponent();
        //var tabIdx = node.getId();
        var tabIdx = node.getConfig();
        if (tabIdx) {
            tabIdx = tabIdx.idx;
        }

        if (component === 'workspace') {
            return (
                <CommonView
                    idx={tabIdx}
                    popoutClose={gridEl}
                    popoutChk="N"
                    typeChk={state.typeChk}
                />
            );
        }
    };

    const gridEl = () => {
        // state.tabLen--;
        // if(state.tabLen == 0){
        //     const gridEl = document.getElementById("gridWrap");
        //     gridEl.classList.remove('divide');
        // }
    };

    //팝업
    const [popout, setPopoutOpen] = useState(false);
    const closeWindowPortal = () => {
        setPopoutOpen(false);
    };

    //검색
    const handleSearch = (data) => {
        console.log(data)
        fetchData(state.pageArr.page, data)
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
                    <Search
                        placeholder="검색어 입력"
                        onSearch={handleSearch}
                        enterButton
                        allowClear
                        style={{width: 200 }}
                    />
                </Col>
                <Col span={4} className="topTable_right">
                    {/* <Button
                        className="btn-add btn-primary"
                        type="button"
                        onClick={showDrawer}
                    >
                        +<span className="hiddentxt">추가</span>
                    </Button> */}
                    <Button className="btn btn-primary btn_add" shape="circle" onClick={showDrawer} >+</Button>
                </Col>
            </Row>
            <Row id="gridWrap" className="gridWrap" ref={tabRef}>
                <FlexGrid
                    ref={state.theGrid}
                    itemsSource={state.list}
                    stickyHeaders={true}
                    allowMerging="ColumnHeaders"         
                    headersVisibility="Column" 
                    initialized={(s) => initGrid(s)}
                    alternatingRowStep={0} 
                >
                    {/* <FlexGridColumn binding="cnt" header="순번" width={70} align="center" isReadOnly={true}  allowMerging={true}/> */}
                    <FlexGridColumn binding="account_code" header="거래처 코드\n(내부)" width={100} isReadOnly={true} format="n2"/>                      
                    <FlexGridColumn binding="account_code1" header="도서출판 길벗" width={100} isReadOnly={true} format="n2"/>                      
                    <FlexGridColumn binding="account_code2" header="길벗스쿨" width={100} isReadOnly={true} format="n2"/>                      
                    <FlexGridColumn binding="name" header="성명/사업자명" width={'*'} minWidth={180} isReadOnly={true}  allowMerging={true}/>                      
                    <FlexGridColumn binding="person_no" header="주민/사업자\n등록번호" width={100} isReadOnly={true}  allowMerging={true}/>                      
                    <FlexGridColumn binding="type" header="유형" width={100} isReadOnly={true} allowMerging={true}/>                      
                    <FlexGridColumn binding="taxation_type" header="과세 구분" width={100} isReadOnly={true}  allowMerging={true}/>                      
                    <FlexGridColumn binding="created_at" header="등록일" width={100} isReadOnly={true}  allowMerging={true}/>                      
                    <FlexGridColumn binding="created_info.name" header="등록자" width={70} isReadOnly={true} allowMerging={true}/>                      
                    <FlexGridColumn binding="allow_search_yn" header="사용\n여부" width={60} isReadOnly={true} allowMerging={true}/>                      
                </FlexGrid>
                
                <div className="panelWrap">
                    <FlexLayout.Layout model={state.model}  factory={factory.bind(this)}/>
                </div>
            </Row>

            <div id="tplBtnViewMode">
                <div className="btnLayoutWrap">
                    <button id="btnDivide"className="btn-layout ant-btn ant-btn-circle">D</button>
                    <button id="btnNew" className="btn-layout ant-btn ant-btn-circle" >N</button>
                </div>
            </div>

            <Row gutter={10} className="table table_bot">
                <Col xs={24} lg={16}>
                    <div className="btn-group">
                        {/* <Pagination defaultCurrent={1} defaultPageSize={state.pageArr.pageCnt} current={state.pageArr.page} total={state.total} onChange={pageChange}/> */}
                        <Pagination defaultCurrent={1} defaultPageSize={state.pageArr.pageCnt} current={state.pageArr.page} total={state.total} showSizeChanger={false} onChange={pageChange}/>
                        <span style={{marginLeft: 20}}>행 개수 : {state.total}</span>
                    </div>
                </Col>
                <Excel excelData={state.excelData} type='거래처(매입)관리' />
            </Row>

            {viewAddVisible === true && (
                <AddPrd
                    visible={viewAddVisible}
                    onClose={addOnClose}
                    reset={fetchData}
                />
            )}

            {
                popout && (
                    <Popout closeWindowPortal={closeWindowPortal}>
                        <CommonView
                            idx={state.idx}
                            popoutClose={closeWindowPortal}
                            popoutChk="Y"
                            typeChk={state.typeChk}
                        />
                    </Popout>
                )
            }

            {visible === true && (
                <CommonView
                    idx={state.idx}
                    viewVisible={visible}
                    popoutChk='N'
                    drawerChk='Y'
                    viewOnClose={viewOnClose}
                    typeChk={state.typeChk}
                />
            )}
        </Wrapper>
    );
});

export default React.memo(accountList);
//export default commonList;
