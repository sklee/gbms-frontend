/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState, useRef, } from 'react';
import { Button, Row, Col, Modal, Pagination } from 'antd';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';


import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';
import * as wjcCore from "@grapecity/wijmo";
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";

import * as FlexLayout from 'flexlayout-react';
import '/node_modules/flexlayout-react/style/light.css';

import AddUser from './add/add';
import View from './view/view';

import Popout from '@components/Common/popout/popout';
// import Excel from '@components/Common/Excel';


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

        //상세정보
        viewData : [],

        //페이징
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },
        gridFilter:null,
        grid : '',
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
            url: process.env.REACT_APP_API_URL +'/api/v1/users?display='+state.pageArr.pageCnt+'&page='+page +'&sort_by=name&order=asc',
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
                if(e.role === '책임자'){
                    e.role = e.role+'('+e.department+'>'+e.position+')'
                }else{
                    e.role = e.role
                }
            });

            // state.list = response.data.data;
            state.total = response.data.meta.total;
            state.pageArr.page = response.data.meta.current_page;
            state.pageArr.pageCnt = response.data.meta.per_page;
            
            // state.list = new wjCore.CollectionView(response.data.data)
            // console.log(state.list)
            setSource(new wjCore.CollectionView(response.data.data))
            handelSort(state.grid)
        })
        .catch(function (error) {
            console.log(error.response);
            if(error.response !== undefined){
                if (error.response.status === 401) {
                    Modal.error({
                        title : '문제가 발생하였습니다.',
                        content : '오류코드:'+error.response.status
                    });  
                } 
            }
            
        });
    }, []);

    const handleApiSubmit = useCallback(async (id,use)=> {
        var axios = require('axios');
        var data = {use_yn: use }
        // console.log(id)
        // console.log(data)
// return
        var config={
            method:'DELETE',
            url:process.env.REACT_APP_API_URL +'/api/v1/users/'+id,
            headers:{
                'Accept':'application/json',
            },
                data:data
            };
            
        axios(config)
        .then(function(response){
            if(response.data.success != false){
                fetchData(state.pageArr.page)
            }else{
                Modal.error({
                    content:(<div>
                                <p>문제가 발생하였습니다.</p>
                                <p>재시도해주세요.</p>
                                <p>오류코드: {response.data.message}</p>
                            </div>)
                });  
            }
        })
        .catch(function(error){
            console.log(error.response.status);
            Modal.error({
                title : '문제가 발생하였습니다.',
                content : '오류코드:'+error.response.status
            });  
        });
            
    }, []);     


     //상세정보
     const viewData = useCallback(async (type,tit) => {    
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/users/'+state.idx,
            {
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                },
            },
        )
        state.viewData = result.data;
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

    // const [source, setSource] = React.useState(
    //     new wjCore.CollectionView(state.list)
    // );
    // const [source, setSource] = React.useState();
    const [source, setSource] = useState([]);
    // const [grid, setGrid] = useState();
    // console.log(toJS(source))

    const handelSort =(grid)=>{
         //재정렬    ->list 데이터가 담길때 리로드가 안되어서 안담김
        // work_state 특정 값을 기준으로 재정렬합니다.
        // waitingIndex 는 '대기중' 값이 들어간 열의 갯수를 의미합니다.
        // cancelIndex는 '취소' 값이 들어간 열의 갯수를 의미합니다.
        
        var waitingIndex = 0,
        cancelIndex = 0;

        if(grid.collectionView !== '' && grid.collectionView !== undefined){
            for (var i = 0; i < grid.collectionView.items.length; i++) {
                // work_state 값이 '재직중' 인 열을 그리드의 상단으로 위치를 변경합니다.                

                // if (grid.collectionView.items[i].work_state == "재직") {
                if (grid.collectionView.items[i].work_state == "재직" && grid.collectionView.items[i].use_yn == "Y") {
                    grid.collectionView.items.splice(
                        waitingIndex,
                        0,
                        grid.collectionView.items[i]
                    );
                    grid.collectionView.items.splice(i + 1, 1);
                    waitingIndex++;
                }
                // //use_yn 값이 'Y' 인 열을 work_state 값이 '재직중' 인 열의 하단으로 위치를 변경합니다.
                // if (grid.collectionView.items[i].use_yn == "Y") {
                //     grid.collectionView.items.splice(
                //         waitingIndex + cancelIndex,
                //         0,
                //         grid.collectionView.items[i]
                //     );
                //     grid.collectionView.items.splice(i + 1, 1);
                //     cancelIndex++;
                // }         
                
                // if (grid.collectionView.items[i].use_yn == "Y") {
                //     grid.collectionView.items.splice(
                //         waitingIndex,
                //         0,
                //         grid.collectionView.items[i]
                //     );
                //     grid.collectionView.items.splice(i + 1, 1);
                //     waitingIndex++;
                // }
            }
            grid.collectionView.refresh();

            // 재정렬된 열을 고정시킵니다.
            for (var i = 0; i < waitingIndex + cancelIndex; i++) {
                grid.collectionView.items[i].pinnedRow = true;
            }

            grid.collectionView.sortConverter = function (sd, item, val) {
                if (!item["pinnedRow"] || sd.property !== "work_state" || sd.property !== "use_yn") {
                    return val;
                }
                // 고정된 열의 차순을 무한대로 지정합니다.
                return sd.ascending ? -Infinity : Infinity;
            };
        }
        // setGrid(grid);

        // status 행을 오름차순으로 정렬합니다.
        // state.list.sortDescriptions.clear();
        // state.list.sortDescriptions.push(new wjCore.SortDescription("work_state", true))
        
        source.sortDescriptions.clear();
        source.sortDescriptions.push(new wjCore.SortDescription("work_state", true))
        // source.sortDescriptions.push(new wjCore.SortDescription("use_yn", true))
        source.sortDescriptions.push(new wjCore.SortDescription("name", true))

    }

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["cnt", "name", "email", "company","department","role","position","work_state","use_yn"];
    };
    //위즈모 체크박스 선택
    const initGrid = (grid) => {
        state.grid = grid;

        grid.showRowHeaders = true;
        // grid.rowHeaders.columns.splice(0, 1); // no extra columns

        // state.gridFilter =new wjGridFilter.FlexGridFilter(grid);

        grid.autoGenerateColumns = false;
        // grid.itemsSource = state.list;

        //버튼 추가
        grid.formatItem.addHandler((s, e) => {

            //순번수정
            // var result_page =
            //     (state.pageArr.page - 1) * state.pageArr.pageCnt;
            //     var str_no = state.total - result_page;
            // if (e.panel == s.rowHeaders && e.row > -1) {
            //     e.cell.textContent = (str_no-e.row).toString();
            // }
            //end


            if (e.panel == s.columnHeaders) {
                let col = s.columns[e.col];
                if(col.binding == "cnt" || col.binding == "name" || col.binding == "userid"){
                    var html = e.cell.innerHTML;
                    e.cell.innerHTML = '<div class="nofilter">' + html + '</div>';
                }
            }
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem; 
                // create buttons for items not being edited
                switch (col.binding) {
                    case 'name':
                        let name ='<button id="btnLink" class="btnLink title">' +item.name +'</button>';
                        e.cell.innerHTML ='<div class="incell">'+name +' ' +document.getElementById('tplBtnViewMode').innerHTML+'</div>';
                        e.cell['dataItem'] = item;
                        break;
                    case 'use_yn':
                        if(item.use_yn == "Y" ){
                            var checked = 'checked="checked"';
                        }else{
                            var checked = '';
                        }
                        e.cell.innerHTML = '<input id="' + col.binding +item.id+ '" type="checkbox" name= "'+item.id+'" value="'+item.use_yn+'" '+checked+' />';
                        e.cell['dataItem'] = item;
                        break;

                    case 'company':
                        if (item.company == '도서출판 길벗'){
                            e.cell.innerHTML = '길벗'
                        } else if (item.company == '길벗스쿨'){
                            e.cell.innerHTML = '스쿨'
                        } else {
                            e.cell.innerHTML = item.company;
                        }
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
                        viewDrawer(item.id);
                        break;
                    // remove this item from the collection
                    case 'btnDivide':
                        dividelayout(item.id, name);
                        break;
                    // remove this item from the collection
                    case 'btnNew':
                        //state.window = 'Y';
                        viewData('popout')                        
                        break;
                }
            }
        });

        // 체크박스 clicks
        grid.addEventListener(grid.hostElement, 'change', (e) => {
            if (e.target instanceof HTMLInputElement) {
                let item = wjcCore.closest(e.target, '.wj-cell')['dataItem'];
                var id = 'use_yn'+item.id
                if(e.target.id == id){
                    switch (e.target.id) {
                        case id:
                            
                            console.log(grid.hostElement.querySelector('#'+id).value)
                            if(grid.hostElement.querySelector('#'+id).value === 'Y'){
                                grid.hostElement.querySelector('#'+id).value='N';
                                item.use_yn = 'N'
                            }else{
                                grid.hostElement.querySelector('#'+id).value='Y';
                                item.use_yn = 'Y'
                            }                            
                            break;
                    }
                }  
                handleApiSubmit(item.id, item.use_yn)
                
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


    return (
        <Wrapper>
            <Row className="topTableInfo" justify="space-around">
                <Col span={24} className="topTable_right">
                    <Button className="btn btn-primary btn_add" shape="circle" onClick={showDrawer}>+</Button>
                    <span class="material-symbols-outlined"></span>
                </Col>
            </Row>
            <Row id="gridWrap" className="gridWrap" ref={tabRef}>
                <FlexGrid
                    // ref={state.theGrid}
                    // itemsSource={state.list}
                    itemsSource={source}
                    isReadOnly={true}
                    stickyHeaders={true}
                    initialized={(s) => initGrid(s)}
                    allowMerging="ColumnHeaders"
                    headersVisibility="Column"
                    alternatingRowStep={0}
                    allowSorting={false}
                    style={{ minHeight: '700px' }}
                    className="custom-colors"
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                    {/* <FlexGridColumn binding="cnt" header="순번" width={80} align="center" isReadOnly={true}/> */}
                    <FlexGridColumn binding="cnt" header="순번" width={80} align="center" isReadOnly={true}  allowMerging={true}/>
                    <FlexGridColumn binding="name" header="이름" width="*" minWidth={200} align="left" isReadOnly={true}/>
                    <FlexGridColumn binding="email" header="계정"  width={200} align="left" isReadOnly={true} />
                    <FlexGridColumn binding="company" header="소속 회사"  width={200} align="center" isReadOnly={true} />
                    <FlexGridColumn binding="department" header="부서"  width={200} align="center" isReadOnly={true} />
                    <FlexGridColumn binding="role" header="부서 내 역할"  width="*" align="center" isReadOnly={true}/>
                    <FlexGridColumn binding="position" header="직급"  width={100} align="center" isReadOnly={true}/>
                    <FlexGridColumn binding="work_state" header="근무 상태"  width={100} align="center" isReadOnly={true}/>
                    <FlexGridColumn binding="use_yn" header="사용 여부"  width={100} align="center" />
                </FlexGrid>

                <div className="panelWrap">
                    <FlexLayout.Layout model={state.model} factory={factory.bind(this)} />
                </div>
            </Row>

            <div id="tplBtnViewMode">
                <div className="btnLayoutWrap">
                    {/* <button id="btnDivide" className="btn-layout ant-btn ant-btn-circle" >D</button> */}
                    <button id="btnNew" className="btn-layout ant-btn ant-btn-circle" >N</button>
                </div>
            </div>

            <Row gutter={10} className="table table_bot">
                <Col xs={24} lg={24}>
                    <div className="btn-group">
                        <Pagination defaultCurrent={1} defaultPageSize={state.pageArr.pageCnt} current={state.pageArr.page} total={state.total} onChange={pageChange}/>
                    </div>
                </Col>
            </Row>

            {viewAddVisible === true && (
                <AddUser
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
