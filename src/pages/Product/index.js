/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState, useRef, } from 'react';
import { Button, Row, Col, Modal, DatePicker } from 'antd';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { CollectionViewNavigator } from "@grapecity/wijmo.react.input";
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import { CollectionView } from '@grapecity/wijmo';
import * as wjInput from '@grapecity/wijmo.react.input';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';

import * as FlexLayout from 'flexlayout-react';
import '/node_modules/flexlayout-react/style/light.css';

import AddPrd from './codeAdd/add';
import View from './view';

import Popout from '@components/Common/popout/popout';
import Excel from '@components/Common/Excel';

import moment from 'moment';


const Wrapper = styled.div`
    width: 100%;height:100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
    #tplBtnViewMode {
        display: none;
    }
`;

const proList = observer((props) => {
    const { commonStore } = useStore();

    React.useEffect(() => {
        theSearch.current.control.grid = theGrid.current.control;
    }, [])

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

        list: [],
        total: 0,
        idx: '',
        contractType: '',

        //상세정보
        viewData : [],

        //엑셀
        excelData: '', //리스트 데이터
        column: '', //필터 컬럼

        //페이징
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },
        gridFilter: null,
        dateItemName: [{id: 1, name: '저작권 종료일'}],
    }));

    useEffect(() => {
        fetchData();
    }, []);

    //페이징 데이터
    const pageChange = (num)=>{
        let FLEXLAYOUT = document.querySelectorAll(".flexlayout__tab");
        FLEXLAYOUT.forEach((item)=>{
            item.scrollTo(0, 0);
        })
        fetchData(num);
    }

    //현재 리스트  dom확인
    const tabRef = useRef();
    const theGrid = useRef()

    const theSearch = useRef()

    //리스트
    const fetchData = useCallback(async (val) => {
        if (state.type === 'brokersOverseas') {
            state.type = 'brokers';
        }
        if (val == '' || val == '0' || val == undefined) {
            var page = 1;
        } else {
            var page = val;
        }

        var axios = require('axios');

        var config = {
            method: 'GET',
            // url: process.env.REACT_APP_API_URL +'/api/v1/products?display='+state.pageArr.pageCnt+'&page='+page +'&sort_by=date&order=desc',
            url : process.env.REACT_APP_API_URL +'/api/v1/products?display=10000',
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
                    if(!e.department){
                        e.department = {...e.created_info.department_info}
                    }
                    if(e.managers.length > 0){
                        e.manager = e.managers[0].name
                    }
                });

                state.list = new CollectionView([...response.data.data], {pageSize : 50});
                state.total = response.data.meta.total;
                state.pageArr.page = response.data.meta.current_page;
                state.pageArr.pageCnt = response.data.meta.per_page;
            })
            .catch(function (error) {
                console.log(error.response);
                if (error.response?.status === 401) {
                    // Modal.warning({
                    //     title: (
                    //         <div>
                    //             세션이 만료되었습니다.
                    //             <br />
                    //             재로그인을 해주세요.
                    //         </div>
                    //     ),
                    //     onOk() {
                    //         axios.post(
                    //             process.env.PUBLIC_URL +
                    //                 '/member/session_logout',
                    //         );
                    //         window.location.href =
                    //             process.env.PUBLIC_URL + '/Login';
                    //         window.localStorage.clear();
                    //     },
                    // });
                } else {
                    //console.log(error.response)
                }
            });
    }, []);

     //상세정보
     const viewData = useCallback(async (type,tit) => {    
        const result = await axios.get(
          process.env.REACT_APP_API_URL +'/api/v1/products/'+state.idx,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          },
        )
        state.viewData = result.data.data;
        state.contractType =result.data.data.contract_type;

        if(type === 'drawer'){
            setViewVisible(true);
        }else if(type === 'flex'){
            addTab(tit);
        }else{
            setPopoutOpen(true);
        }
    }) 


    //drawer
    const [viewAddVisible, setViewAddVisible] = useState(false);
    const [viewVisible, setViewVisible] = useState(false);

    //add drawer open
    const showDrawer = () => {
        setViewAddVisible(true);
    };

    const viewDrawer = () => {
        viewData('drawer');
        // setViewVisible(true);
    };

    //add drawer 닫기
    const addOnClose = () => {
        setViewAddVisible(false);
    };

    const viewOnClose=()=>{
        setViewVisible(false);
    }

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["product_code", "name", "company", "brand", "department.name", "product_type", "printing", "isbn", "created_info.name", "manager", "release_date", "contract_expired_date"];
    };

    //위즈모 체크박스 선택
    const initGrid = (grid) => {
        grid.autoSizeRow(15, true); //그리드 제목 줄바꿈 autoSizeRow(해당열index, true)
        grid.rowHeaders.columns.splice(0, 1); // no extra columns

        //엑셀
        state.excelData = grid;
        if (state.column == '') {
            var columnData = JSON.parse(grid.columnLayout);
            state.column = columnData.columns;
        }      

        //header 합치기
        //create extra header row
        var extraRow = new wjGrid.Row();
        extraRow.allowMerging = true;
        //
        // add extra header row to the grid
        var panel = grid.columnHeaders;
        panel.rows.splice(0, 0, extraRow);
        
        // populate the extra header row
        // for (let colIndex = 14; colIndex <= 16; colIndex++) {
        //     panel.setCellData(0, colIndex, '상태');
        // }

        // merge "Country" and "Active" headers vertically
        // ['a', 'b'].forEach(function (binding) {
        //     let col = grid.getColumn(binding);
        //     col.allowMerging = true;
        //     panel.setCellData(0, col.index, col.header);
        // });

        for (let colIndex = 0; colIndex <= 13; colIndex++) {
            if(colIndex >= 10 && colIndex <= 11){
                panel.setCellData(0, colIndex, '상태');
            }else{
                let col = grid.getColumn(colIndex);
                col.allowMerging = true;
                panel.setCellData(0, colIndex, col.header);
            }            
        }      

        // center-align merged header cells
        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.columnHeaders && e.range.rowSpan > 1) {
                var html = e.cell.innerHTML;
                // e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
            }
        });



        grid.autoGenerateColumns = false;
        grid.itemsSource = state.list;

        //버튼 추가
        grid.formatItem.addHandler((s, e) => {
            if (e.panel == s.columnHeaders) {
                let html = e.cell.innerHTML;

                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + html.split('\\n')[1] + "<br/>" + html.split('\\n')[2] +  '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                // create buttons for items not being edited
                switch (col.binding) {
                    case 'cnt':
                        let num = item[col.binding];
                        e.cell.innerHTML = num;
                        break;
                    case 'name':
                    case 'internal_name':
                        let name = '<button id="btnLink" class="btnLink title">' + item[col.binding] + '</button>';
                        e.cell.innerHTML = '<div class="incell">' + name + ' ' + document.getElementById('tplBtnViewMode').innerHTML + '</div>';
                        e.cell['dataItem'] = item;
                        break;
                    case 'company':
                    case 'brand':
                        let company = item[col.binding];
                        if (company == '도서출판 길벗') {
                            company = '길벗';
                        } else if (company == '길벗스쿨') {
                            company = '스쿨';
                        }
                        e.cell.innerHTML = company;
                        break;
                    case 'contract_expired_date':
                        let date = item.contract_expired_date || '';
                        let today = moment().format('YYYY-MM-DD');
                        let txt = today > date ? '<span class="ant-typography ant-typography-danger redTxt">' + date + '</span>' : '<span>' + date + '</span>';
                        e.cell.innerHTML = txt;
                        e.cell['dataItem'] = item;
                        break;
                }
            }
        })

        // handle button clicks
        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                // get button's data item
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                var name = item.name;
                // handle buttons
                state.idx = item.id;
                // state.contractType = item.contract_type;                

                switch (e.target.id) {
                    // start editing this item
                    case 'btnLink':
                        if(item.product_code === '대기 중'){
                            Modal.warning({
                                title: '상품코드 발급 후 보기/수정 가능합니다.',
                            });
                        }else{
                            viewDrawer(item.id);
                        }                        
                        break;
                    // remove this item from the collection
                    case 'btnDivide':
                        dividelayout(item.id, name);
                        break;
                    // remove this item from the collection
                    case 'btnNew':
                        //state.window = 'Y';
                        if(item.product_code === '대기 중'){
                            Modal.warning({
                                title: '상품코드 발급 후 보기/수정 가능합니다.',
                            });
                        }else{
                            viewData('popout')     
                        }                   
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

        viewData('flex',tit);       
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
                <View
                    idx={tabIdx}
                    viewVisible={viewVisible}
                    popoutChk='N'
                    drawerChk='N'
                    viewOnClose={gridEl}
                    contractType={state.contractType}
                    viewData ={state.viewData}

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

    const testChk = ()=>{
        setViewVisible(true)
    }

    // 천단위 자동 콤마
    const commaNum = (num) => {
        if(num){
            const number = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return number
        }else{
            return 0;
        }      
    }

    //그리드 제목 줄바꿈
    const formatItem =(s, e) => {
        if (e.panel == s.columnHeaders) {
            if(e.cell.textContent === '저작권 종료일'){
                e.cell.textContent= '저작권\n종료일'
            }
            e.cell.innerHTML = e.cell.textContent;
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
                    <Button className="btn btn-primary btn_add" shape="circle" onClick={showDrawer}>+</Button>
                </Col>
            </Row>
            <Row id="gridWrap" className="gridWrap" ref={tabRef}>
                <FlexGrid
                    ref={theGrid}
                    itemsSource={state.list}
                    isReadOnly={true}
                    stickyHeaders={true}
                    initialized={(s) => initGrid(s)}
                    formatItem={formatItem}
                    allowMerging="ColumnHeaders"
                    alternatingRowStep={0}
                    headersVisibility={'Column'}
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)}/>
                    {/* <FlexGridColumn binding="cnt" header="순번" width={70} align="center" allowMerging={true} isReadOnly={true} /> */}
                    <FlexGridColumn binding="product_code" header="상품코드" width={80} align="left" allowMerging={true} isReadOnly={true} />
                    <FlexGridColumn binding="name" header="상품명" width="*" minWidth={200} align="left" allowMerging={true} isReadOnly={true} />
                    {/* <FlexGridColumn binding="internal_name" header="상품명(내부)"width="*" minWidth={200} align="left" allowMerging={true} isReadOnly={true} /> */}
                    <FlexGridColumn binding="company" header="회사" width={60} align="left" allowMerging={true} isReadOnly={true} />
                    <FlexGridColumn binding="brand" header="브랜드" width={90} align="left" allowMerging={true} isReadOnly={true} />
                    {/* <FlexGridColumn binding="department" header="사업부" width={110} align="left" allowMerging={true} isReadOnly={true} /> */}
                    <FlexGridColumn binding="department.name" header="부서" width={90} align="left" allowMerging={true} isReadOnly={true} />
                    <FlexGridColumn binding="product_type_name" header="상품 종류"width={110}  align="left" allowMerging={true} isReadOnly={true} />
                    <FlexGridColumn binding="isbn" header="ISBN/\n바코드" width={90} align="left" allowMerging={true} isReadOnly={true} />
                    <FlexGridColumn binding="printing" header="최종\n쇄" width={60} align="left" allowMerging={true} isReadOnly={true} />
                    <FlexGridColumn binding="created_info.name" header="등록자" width={70} align="left" allowMerging={true} isReadOnly={true} />
                    <FlexGridColumn binding="manager" header="담당자" width={70} align="left" allowMerging={true} isReadOnly={true} />                    
                    <FlexGridColumn binding="" header="출시" width={70} format="n3" align="left" isReadOnly={true} />
                    {/* <FlexGridColumn binding="release_date" header="제작" width={70} format="n3" align="left" isReadOnly={true} /> */}
                    <FlexGridColumn binding="" header="출고" width={70} format="n3" align="left" isReadOnly={true} />
                    <FlexGridColumn binding="" header="정품재고" width={80} align="left" allowMerging={true} isReadOnly={true} />
                    <FlexGridColumn binding="contract_expired_date" header="저작권\n종료일" width={100} align="left" allowMerging={true} isReadOnly={true} />
                </FlexGrid>

                {/* <div className="panelWrap">
                    <FlexLayout.Layout model={state.model} factory={factory.bind(this)} />
                </div> */}
            </Row>

            <div id="tplBtnViewMode">
                <div className="btnLayoutWrap">
                    {/* <button id="btnDivide" className="btn-layout ant-btn ant-btn-circle" >D</button> */}
                    <button id="btnNew" className="btn-layout ant-btn ant-btn-circle" >N</button>
                </div>
            </div>

            <Row gutter={10} className="table table_bot">
                <Col xs={24} lg={16}>
                    {/* <div className="btn-group">
                        <Pagination defaultCurrent={1} defaultPageSize={state.pageArr.pageCnt} current={state.pageArr.page} total={state.total} onChange={pageChange}/>
                    </div> */}
                    <CollectionViewNavigator headerFormat="Page {currentPage:n0} of {pageCount:n0}" byPage={true} cv={state.list}/>
                    <span style={{marginLeft: 20}}>행 개수 : {state.total}</span>
                </Col>
                <Excel excelData={state.excelData} type={state.type} />
            </Row>

            {viewAddVisible === true && (
                <AddPrd
                    visible={viewAddVisible}
                    onClose={addOnClose}
                    reset={fetchData}
                />
            )}

            {viewVisible === true && (
                <View
                    idx={state.idx}
                    viewVisible={viewVisible}
                    popoutChk='N'
                    drawerChk='Y'
                    viewOnClose={viewOnClose}
                    contractType={state.contractType}
                    viewData ={state.viewData}

                />
            )}

            {
                popout && (
                    <Popout closeWindowPortal={closeWindowPortal}>
                        <View
                            idx={state.idx}
                            popoutClose={closeWindowPortal}
                            popoutChk="Y"
                            contractType={state.contractType}
                            viewData ={state.viewData}
                        />
                    </Popout>
                )
            }



        </Wrapper>
    );
});

export default React.memo(proList);
//export default commonList;
