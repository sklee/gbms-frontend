/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState, useRef, } from 'react';
import { Button, Row, Col, Modal,Pagination, Tabs, DatePicker } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { CollectionView } from '@grapecity/wijmo';
import * as wjCore from '@grapecity/wijmo';
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import { Tooltip, PopupPosition } from '@grapecity/wijmo';

import * as FlexLayout from 'flexlayout-react';
import '/node_modules/flexlayout-react/style/light.css';

import CommonView from './view';
import AddCont from './Add';
import AddInspect from './inspect';

import Popout from '@components/Common/popout/popout';
import Excel from '@components/Common/Excel';
import tooltipData from '@pages/tooltipData';

// import NewWindow from 'react-new-window'

const Wrapper = styled.div`
    width: 100%;
    .wj-cell .v-center{
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .wj-cell .v-center p{margin: 0;}
    .wj-cell .v-center .wj-elem-filter{
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
    }
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
    #tplBtnViewMode {
        display: none;
    }

    .ready-value {
        color: #FF0000;
    }
`;

const commonList = observer((props) => {
    const { commonStore } = useStore();

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
    };

    const state = useLocalStore(() => ({
        //flexLayout
        model: FlexLayout.Model.fromJson(json),
        tabLen: 1,
        tabInit: false,

        type: '',
        list: [],
        total: 100,
        idx: '',
        tooltipData :'',

        //엑셀
        excelData: '', //리스트 데이터
        column: '', //필터 컬럼

        //페이징
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },

        hdrTips : new Tooltip({
            position: PopupPosition.Above,
            showAtMouse: true,
            showDelay: 600,
            cssClass: 'hdr-tip'
        }),
        dateItemName: [{id: 1, name: '계약 등록일'}],
    }));

    useEffect(() => {
        state.type = props.type;
        if(tooltipData){
            state.tooltipData = tooltipData.find(e=>e.key==='contract_5').memo;
        }
        fetchData();
    }, [props]);

    //페이징 데이터
    // const [pageArr, setPageArr] = useState([]);
    // const listReset = (val) => {
    //     fetchData(val);
    // };
    const pageChange = (num)=>{
        let FLEXLAYOUT = document.querySelectorAll(".flexlayout__tab");
        FLEXLAYOUT.forEach((item)=>{
            item.scrollTo(0, 0);
        })
        fetchData(num);
    }

    //현재 리스트  dom확인
    const tabRef = useRef();
    const theGrid = useRef();
    const theSearch = useRef();

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
                response.data.data.forEach((e) => {
                    if (e.created_info && e.created_info.name) {
                       e.registrant = e.created_info.name;
                    }else{
                        e.registrant = '미입력';
                    }
                });

                var result_page =
                    (page - 1) * state.pageArr.pageCnt;
                var str_no = response.data.meta.total - result_page;

                response.data.data.map((e, number) => {
                    e.cnt = str_no - number;
                });

                state.list = response.data.data;
                state.total = response.data.meta.total;
                state.pageArr.page = response.data.meta.current_page;
                state.pageArr.pageCnt = response.data.meta.per_page;

                // setPageArr({
                //     lastPage: response.data.meta.last_page,
                //     page: response.data.meta.current_page,
                // });
            })
            .catch(function (error) {
                console.log(error.response);
                if (error.response.status === 401) {
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

    //drawer
    const [viewAddVisible, setViewAddVisible] = useState(false);
    const [visible, setVisible] = useState(false);
    const [Checkvisible, setCheckVisible] = useState(false);

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

     //check drawer open
     const checkVisibleOn = (idx) => {
        state.idx = idx;
        setCheckVisible(true);
    };

    //check drawer 닫기
    const checlVisibleOnClose = () => {
        setCheckVisible(false);
    };

    //add drawer 닫기
    const addOnClose = () => {
        setViewAddVisible(false);
    };

    //test tab
    const changeTab = (type) => {
        state.type = type;
        fetchData();
    };

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["code", "contract_code", "name", "type", "registrant", "managers", "created_at", "contract_status", "recent", "check_status", "work", "manager", "regist_date"];
    };

    //위즈모 체크박스 선택
    const initGrid = (grid) => {
        //엑셀
        state.excelData = grid;
        if (state.column == '') {
            var columnData = JSON.parse(grid.columnLayout);
            state.column = columnData.columns;
        }
        //헤더 높이 강제로 높이기
        if(props.type === 'contracts' || props.type === 'overseas'){
            grid.columnHeaders.rows.defaultSize = 45;
        }

        //버튼 추가
        grid.formatItem.addHandler((s, e) => {
            let col = s.columns[e.col];
            let html = e.cell.innerHTML;
            
            if (e.panel == s.columnHeaders) {
                if(col.binding == "contract_status" || col.binding == "regist_expiry"){
                    e.cell.innerHTML = '<div class="v-center"> <p>30일 내<br/>계약 종료</p>' + ' <button type="button" class="ant-btn ant-btn-circle ant-btn-default ant-btn-sm" id="btnTooltip" onclick="return false;"><span>?</span></button>' +
                    `<button class="wj-btn wj-btn-glyph wj-right wj-elem-filter" type="button" tabindex="-1" aria-label="열에 대 한 필터를 편집 30일내 계약 종료" aria-haspopup="dialog" aria-expanded="false" aria-pressed="false">
                            <span class="wj-glyph-filter"></span>
                        </button>
                    </div>`;
                    // var tip = '<span class="ant-typography ant-typography-secondary">- 세부 저작권자/상품별 계약 중 30일 이내에 종료되는 건이 있는지 표시합니다.</span>';
                    let tip = state.tooltipData;
                    state.hdrTips.setTooltip(document.getElementById("btnTooltip"), tip);
                } else {
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }
            if (e.panel == s.cells) {
                let item = s.rows[e.row].dataItem;
                // create buttons for items not being edited
                if(state.type !== 'contracts-check' && state.type !== 'overseas-check'){
                    switch (col.binding) {
                        case 'contract_status':
                            let statusWrap;
                            if(item.contract_status=='있음'){
                                statusWrap = '<span class="ready-value">'+item.contract_status+'</span>';
                                e.cell.innerHTML = statusWrap;
                            }
                            e.cell['dataItem'] = item;
                            break;
                        case 'name':
                            let name =
                                '<button id="btnLink" class="btnLink">' +
                                item.name +
                                '</button>';
                            e.cell.innerHTML =
                                name +
                                ' ' +
                                document.getElementById('tplBtnViewMode').innerHTML;
                            e.cell['dataItem'] = item;
                            break;
                    }
                }else{
                    switch (col.binding) {
                        case 'contract_status':
                            let statusWrap;
                            if(item.contract_status=='있음'){
                                statusWrap = '<span class="ready-value">'+item.contract_status+'</span>';
                                e.cell.innerHTML = statusWrap;
                            }
                            e.cell['dataItem'] = item;
                            break;
                        case 'name':
                            let name = '<button id="btnWork" class="btnLink">' + item.name + '</button>';
                            e.cell.innerHTML = name + document.getElementById('tplBtnViewMode').innerHTML;;
                            e.cell['dataItem'] = item;
                            break
                    }
                }
            }
        });

        // handle button clicks
        grid.addEventListener(grid.hostElement, 'click', (e) => {
            
            if (e.target instanceof HTMLButtonElement) {
                
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                if(item){
                    // get button's data item
                    var name = item.name;
                    // handle buttons
                    state.idx = item.id;
                }
                if(state.type !== 'contracts-check' && state.type !== 'overseas-check'){
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
                        case 'btnWork':
                            checkVisibleOn(item.id);
                            break;
                    }
                }else{
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
                            setPopout2Open(true);
                            break;
                        case 'btnWork':
                            checkVisibleOn(item.id);
                            break;
                    }
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
                    type={state.type}
                    popoutClose={gridEl}
                    popoutChk="N"
                    viewOnClose={viewOnClose}
                />
            );
        }
    };

    const onFormatItem = (flexGrid, e) => {
        if (e.panel == flexGrid.cells) {
            let value = e.panel.getCellData(e.row, e.col, false);
            wjCore.toggleClass(e.cell, 'ready-value', value==='대기 중');
        }
    };

    const onFormatItem2 = (flexGrid, e) => {
        if (e.panel == flexGrid.cells) {
            let value = e.panel.getCellData(e.row, e.col, false);
            wjCore.toggleClass(e.cell, 'ready-value', value==='대기 중');
        }
    };

    const gridEl = () => {
        // state.tabLen--;
        // if(state.tabLen == 0){
        //     const gridEl = document.getElementById("gridWrap");
        //     gridEl.classList.remove('divide');
        // }
    };

    // 저작권 계약 팝업
    const [popout, setPopoutOpen] = useState(false);
    const closeWindowPortal = () => {
        setPopoutOpen(false);
    };

    // 저작권 계약 검수 팝업
    const [popout2, setPopout2Open] = useState(false);
    const closeWindowPortal2 = () => {
        setPopout2Open(false);
    };

    if(theSearch.current && theGrid.current.control){
        theSearch.current.control.grid = theGrid.current.control;
    }

    return (
        <Wrapper>
            {(state.type !=='contracts-check' && state.type !=='overseas-check') ? (
                <Tabs activeKey={state.type}  onChange={changeTab} >
                    <Tabs.TabPane tab="국내,해외 직계약" key="contracts">
                        <Row className="topTableInfo">
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
                            {(state.type !=='contracts-check' && state.type !=='overseas-check') && (
                            <Col span={4} className="topTable_right">
                                <Button className="btn btn-primary btn_add" shape="circle" onClick={showDrawer}>+</Button>
                            </Col>
                            )}
                        </Row>
                        <FlexGrid
                            data-header="dbheader"
                            ref={theGrid}
                            itemsSource={state.list}
                            isReadOnly={true}
                            stickyHeaders={true}
                            headersVisibility="Column" 
                            initialized={(s) => initGrid(s)}
                            // style={{ minHeight: '700px' }}
                            allowSorting={false}
                            autoRowHeights={true}
                            isVisible={false}
                        >
                            <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                            {/* <FlexGridColumn
                                binding="cnt"
                                header="순번"
                                width={60}
                                align="center"
                            /> */}
                            <FlexGridColumn
                                binding="contract_code"
                                header="계약 코드"
                                width={100}
                            />
                            <FlexGridColumn
                                binding="name"
                                header="계약명"
                                width="*"
                                minWidth={200}
                            />
                            <FlexGridColumn
                                binding="type"
                                header="유형"
                                width={80}
                            />
                            <FlexGridColumn
                                binding="registrant"
                                header="등록자"
                                width={90}
                            />
                            <FlexGridColumn
                                binding="managers"
                                header="담당자"
                                width={180}
                            />
                            <FlexGridColumn
                                binding="created_at"
                                header="계약 등록일"
                                width={100}
                            />
                            <FlexGridColumn
                                binding="contract_status"
                                header="30일내 계약 종료"
                                width={150}
                                wordWrap={true}
                            />
                            <FlexGridColumn
                                binding="recent"
                                header="최근 등록 상품"
                                width="*"
                            />
                        </FlexGrid>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="해외 수입" key="overseas">
                        <Row className="topTableInfo">
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
                            {(state.type !=='contracts-check' && state.type !=='overseas-check') && (
                            <Col span={4} className="topTable_right">
                                <Button className="btn btn-primary btn_add" shape="circle" onClick={showDrawer}>+</Button>
                            </Col>
                            )}
                        </Row>
                        <FlexGrid
                            data-header="dbheader"
                            ref={theGrid}
                            itemsSource={state.list}
                            isReadOnly={true}
                            stickyHeaders={true}
                            headersVisibility="Column" 
                            initialized={(s) => initGrid(s)}
                            // style={{ minHeight: '700px' }}
                            allowSorting={false}
                            autoRowHeights={true}
                            isVisible={false}
                        >
                            <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                            {/* <FlexGridColumn
                                binding="cnt"
                                header="순번"
                                width={60}
                                align="center"
                            /> */}
                            <FlexGridColumn
                                binding="contract_code"
                                header="계약 코드"
                                width={100}
                            />
                            <FlexGridColumn
                                binding="name"
                                header="계약명"
                                width="*"
                                minWidth={200}
                            />
                            <FlexGridColumn
                                binding="type"
                                header="유형"
                                width={80}
                            />
                            <FlexGridColumn
                                binding="registrant"
                                header="등록자"
                                width={90}
                            />
                            <FlexGridColumn
                                binding="managers"
                                header="담당자"
                                width={180}
                            />
                            <FlexGridColumn
                                binding="created_at"
                                header="계약 등록일"
                                width={100}
                            />
                            <FlexGridColumn
                                binding="contract_status"
                                header="30일내 계약 종료"
                                width={150}
                                wordWrap={true}
                            />
                            <FlexGridColumn
                                binding="recent"
                                header="최근 등록 상품"
                                width="*"
                            />
                        </FlexGrid>
                    </Tabs.TabPane>
                </Tabs>
            ) : (
                <Tabs activeKey={state.type}  onChange={changeTab} >
                    <Tabs.TabPane tab="국내,해외 직계약" key="contracts-check">
                        <Row className="topTableInfo">
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
                            {(state.type !=='contracts-check' && state.type !=='overseas-check') && (
                            <Col span={4} className="topTable_right">
                                <Button className="btn btn-primary btn_add" shape="circle" onClick={showDrawer}>+</Button>
                            </Col>
                            )}
                        </Row>
                        <FlexGrid
                            ref={theGrid}
                            itemsSource={state.list}
                            isReadOnly={true}
                            stickyHeaders={true}
                            headersVisibility="Column" 
                            initialized={(s) => initGrid(s)}
                            formatItem={onFormatItem}
                            // style={{ minHeight: '700px' }}
                            allowSorting={false}
                            autoRowHeights={true}
                        >
                            <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                            {/* <FlexGridColumn
                                binding="cnt"
                                header="순번"
                                width={60}
                                align="center"
                                isReadOnly={true}
                            /> */}
                            <FlexGridColumn
                                binding="contract_code"
                                header="계약 코드"
                                width={100}
                            />
                            <FlexGridColumn
                                binding="name"
                                header="계약명"
                                width={"*"}
                                minWidth={200}
                            />
                            <FlexGridColumn
                                binding="registrant"
                                header="등록자"
                                width={80}
                            />
                            <FlexGridColumn
                                binding="created_at"
                                header="계약 등록일"
                                width={100}
                            />
                            <FlexGridColumn
                                binding="check_status"
                                header="검수 상태"
                                width={120}
                            />
                            <FlexGridColumn
                                binding="work"
                                header="작업"
                                width={100}
                                align="center"
                            />
                        </FlexGrid>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="해외 수입" key="overseas-check">
                        <Row className="topTableInfo">
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
                            {(state.type !=='contracts-check' && state.type !=='overseas-check') && (
                            <Col span={4} className="topTable_right">
                                <Button className="btn btn-primary btn_add" shape="circle" onClick={showDrawer}>+</Button>
                            </Col>
                            )}
                        </Row>
                        <FlexGrid
                            ref={theGrid}
                            itemsSource={state.list}
                            isReadOnly={true}
                            stickyHeaders={true}
                            headersVisibility="Column" 
                            initialized={(s) => initGrid(s)}
                            formatItem={onFormatItem2}
                            // style={{ minHeight: '700px' }}
                            allowSorting={false}
                            autoRowHeights={true}
                        >
                            <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                            {/* <FlexGridColumn
                                binding="cnt"
                                header="순번"
                                width={60}
                                align="center"
                                isReadOnly={true}
                            /> */}
                            <FlexGridColumn
                                binding="contract_code"
                                header="계약 코드"
                                width={100}
                            />
                            <FlexGridColumn
                                binding="name"
                                header="계약명"
                                width={"*"}
                                minWidth={200}
                            />
                            <FlexGridColumn
                                binding="registrant"
                                header="등록자"
                                width={80}
                            />
                            <FlexGridColumn
                                binding="created_at"
                                header="계약 등록일"
                                width={100}
                            />
                            <FlexGridColumn
                                binding="check_status"
                                header="검수 상태"
                                width={120}
                            />
                            <FlexGridColumn
                                binding="work"
                                header="작업"
                                width={100}
                                align="center"
                            />
                        </FlexGrid>
                    </Tabs.TabPane>
                </Tabs>
            )}



            {/* <Row className="topTableInfo" justify="space-around">
            {(state.type !=='contracts-check' && state.type !=='overseas-check') ? (
                <Col span={24} >
                    <Button
                        onClick={(e)=>{changeTab('contracts')}}
                        type={state.type === 'contracts' ? 'primary' : 'default'}
                    >
                        국내,해외 직계약
                    </Button>
                    <Button
                        onClick={(e)=>{changeTab('overseas')}}
                        type={state.type === 'overseas' ? 'primary' : 'default'}
                    >
                        해외 수입
                    </Button>
                </Col>
                ) :(
                <Col span={24} >
                    <Button
                        onClick={(e)=>{changeTab('contracts-check')}}
                        type={state.type === 'contracts-check' ? 'primary' : 'default'}
                    >
                        국내,해외 직계약
                    </Button>
                    <Button
                        onClick={(e)=>{changeTab('overseas-check')}}
                        type={state.type === 'overseas-check' ? 'primary' : 'default'}
                    >
                        해외 수입
                    </Button>
                </Col>
                )}
                {(state.type !=='contracts-check' && state.type !=='overseas-check') && (
                <Col span={24} className="topTable_right">
                    <Button className="btn btn-primary btn_add" shape="circle" onClick={showDrawer}>+</Button>
                </Col>
                )}
            </Row>
            <Row id="gridWrap" className="gridWrap" ref={tabRef}>
                {(state.type === 'contracts' || state.type === 'overseas') ? (
                    <FlexGrid
                        data-header="dbheader"
                        ref={state.theGrid}
                        itemsSource={state.list}
                        isReadOnly={true}
                        stickyHeaders={true}
                        headersVisibility="Column" 
                        initialized={(s) => initGrid(s)}
                        style={{ minHeight: '700px' }}
                        allowSorting={false}
                        autoRowHeights={true}
                        isVisible={false}
                    >
                        <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                        <FlexGridColumn
                            binding="cnt"
                            header="순번1"
                            width={80}
                            align="center"
                        />
                        <FlexGridColumn
                            binding="contract_code"
                            header="계약 코드"
                            width={120}
                        />
                        <FlexGridColumn
                            binding="name"
                            header="계약명"
                            width="*"
                            minWidth={200}
                        />
                        <FlexGridColumn
                            binding="type"
                            header="유형"
                            width={100}
                        />
                        <FlexGridColumn
                            binding="registrant"
                            header="등록자"
                            width={100}
                        />
                        <FlexGridColumn
                            binding="managers"
                            header="담당자"
                            width={180}
                        />
                        <FlexGridColumn
                            binding="created_at"
                            header="계약 등록일"
                            width={120}
                        />
                        <FlexGridColumn
                            binding="contract_status"
                            header="30일내 계약 종료"
                            width={150}
                            wordWrap={true}
                        />
                        <FlexGridColumn
                            binding="recent"
                            header="최근 등록 상품"
                            width="*"
                        />
                    </FlexGrid>
                ) : (state.type === 'contracts-check' || state.type !=='overseas-check') ? (
                    <FlexGrid
                        ref={state.theGrid}
                        itemsSource={state.list}
                        isReadOnly={true}
                        stickyHeaders={true}
                        headersVisibility="Column" 
                        initialized={(s) => initGrid(s)}
                        formatItem={onFormatItem}
                        style={{ minHeight: '700px' }}
                        allowSorting={false}
                        autoRowHeights={true}
                    >
                        <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                        <FlexGridColumn
                            binding="cnt"
                            header="순번2"
                            width={120}
                            align="center"
                            isReadOnly={true}
                        />
                        <FlexGridColumn
                            binding="contract_code"
                            header="계약 코드"
                            width={180}
                        />
                        <FlexGridColumn
                            binding="name"
                            header="계약명"
                            width={"*"}
                            minWidth={400}
                        />
                        <FlexGridColumn
                            binding="registrant"
                            header="등록자"
                            width={180}
                        />
                        <FlexGridColumn
                            binding="created_at"
                            header="계약 등록일"
                            width={180}
                        />
                        <FlexGridColumn
                            binding="check_status"
                            header="검수 상태"
                            width={220}
                        />
                        <FlexGridColumn
                            binding="work"
                            header="작업"
                            width={100}
                            align="center"
                        />
                    </FlexGrid>
                ) : (state.type ==='overseas-check') ? (
                    <FlexGrid
                        ref={state.theGrid}
                        itemsSource={state.list}
                        isReadOnly={true}
                        stickyHeaders={true}
                        headersVisibility="Column" 
                        initialized={(s) => initGrid(s)}
                        formatItem={onFormatItem2}
                        style={{ minHeight: '700px' }}
                        allowSorting={false}
                        autoRowHeights={true}
                    >
                        <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                        <FlexGridColumn
                            binding="cnt"
                            header="순번3"
                            width={120}
                            align="center"
                            isReadOnly={true}
                        />
                        <FlexGridColumn
                            binding="contract_code"
                            header="계약 코드"
                            width={180}
                        />
                        <FlexGridColumn
                            binding="name"
                            header="계약명"
                            width={"*"}
                            minWidth={400}
                        />
                        <FlexGridColumn
                            binding="registrant"
                            header="등록자"
                            width={180}
                        />
                        <FlexGridColumn
                            binding="created_at"
                            header="계약 등록일"
                            width={180}
                        />
                        <FlexGridColumn
                            binding="check_status"
                            header="검수 상태"
                            width={220}
                        />
                        <FlexGridColumn
                            binding="work"
                            header="작업"
                            width={100}
                            align="center"
                        />
                </FlexGrid>
                ) : (
                    //저작권 계약
                    <FlexGrid
                        ref={state.theGrid}
                        itemsSource={state.list}
                        isReadOnly={true}
                        stickyHeaders={true}
                        headersVisibility="Column" 
                        initialized={(s) => initGrid(s)}
                        style={{ minHeight: '700px' }}
                        allowSorting={false}
                        autoRowHeights={true}
                    >
                        <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                        <FlexGridColumn
                            binding="cnt"
                            header="순번4"
                            width={80}
                            align="center"
                            isReadOnly={true}
                        />
                        <FlexGridColumn
                            binding="code"
                            header="계약 코드"
                            width={100}
                        />
                        <FlexGridColumn
                            binding="name"
                            header="계약명"
                            width="*" minWidth={200} 
                        />
                        <FlexGridColumn
                            binding="type"
                            header="유형"
                            width={100}
                        />
                        <FlexGridColumn
                            binding="registrant"
                            header="등록자"
                            width={100}
                        />
                        <FlexGridColumn
                            binding="manager"
                            header="담당자"
                            width={100}
                        />
                        <FlexGridColumn
                            binding="regist_date"
                            header="계약 등록일"
                            width={100}
                        />
                        <FlexGridColumn
                            binding="contract_status"
                            header="30일내 계약 종료"
                            width={200}
                        />
                        <FlexGridColumn
                            binding="recent"
                            header="최근 등록 상품"
                            width="*" minWidth={300} 
                        />
                    </FlexGrid>
                )}

                <div className="panelWrap">
                    <FlexLayout.Layout
                        model={state.model}
                        factory={factory.bind(this)}
                    />
                </div>
            </Row> */}

            <div id="tplBtnViewMode">
                <div className="btnLayoutWrap">
                    <button
                        id="btnDivide"
                        className="btn-layout ant-btn ant-btn-circle"
                    >
                        D
                    </button>
                    <button
                        id="btnNew"
                        className="btn-layout ant-btn ant-btn-circle"
                    >
                        N
                    </button>
                </div>
            </div>

            <Row gutter={10} className="table table_bot">
                {/* <Pagination
                    pageData={pageArr}
                    type={state.type}
                    listReset={listReset}
                /> */}
                <Col xs={24} lg={16}>
                    <div className="btn-group">
                        {/* <Pagination defaultCurrent={1} defaultPageSize={state.pageArr.pageCnt} current={state.pageArr.page} total={state.total} showSizeChanger={false} onChange={pageChange}/> */}
                        <Pagination defaultCurrent={1} defaultPageSize={state.pageArr.pageCnt} current={state.pageArr.page} total={state.total} showSizeChanger={false} onChange={pageChange}/>
                        <span style={{marginLeft: 20}}>행 개수 : {state.total}</span>
                    </div>
                </Col>
                <Excel excelData={state.excelData} type={state.type} />
            </Row>

            {viewAddVisible === true && (
                <AddCont
                    type={state.type}
                    visible={viewAddVisible}
                    onClose={addOnClose}
                    reset={fetchData}
                    drawerChk="Y"
                />
            )}

            {Checkvisible === true && (
                <AddInspect
                    idx={state.idx}
                    type={state.type}
                    visible={Checkvisible}
                    onClose={checlVisibleOnClose}
                    reset={fetchData}
                    drawerChk="Y"
                />
            )}

            {popout && (
                // <Popout closeWindowPortal={closeWindowPortal}  idx={state.idx} type={state.type} >
                <Popout closeWindowPortal={closeWindowPortal}>
                    <CommonView
                        idx={state.idx}
                        type={state.type}
                        popoutClose={closeWindowPortal}
                        popoutChk="Y"
                        viewOnClose={viewOnClose}
                    />
                </Popout>
            )}

            {popout2 && (
                // <Popout closeWindowPortal={closeWindowPortal}  idx={state.idx} type={state.type} >
                <Popout closeWindowPortal={closeWindowPortal2}>
                    <AddInspect
                        idx={state.idx}
                        type={state.type}
                        visible={Checkvisible}
                        onClose={checlVisibleOnClose}
                        reset={fetchData}
                        drawerChk="Y"
                    />
                </Popout>
            )}

            {visible === true && (
                <CommonView
                    idx={state.idx}
                    type={state.type}
                    viewVisible={visible}
                    popoutChk='N'
                    drawerChk='Y'
                    viewOnClose={viewOnClose}
                />
                // <AddCont
                //     type={state.type}
                //     visible={visible}
                //     onClose={viewOnClose}
                //     reset={fetchData}
                // />
            )}
        </Wrapper>
    );
});

export default React.memo(commonList);
//export default commonList;