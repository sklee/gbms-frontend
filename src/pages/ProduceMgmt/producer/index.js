/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState, useRef, } from 'react';
import { Button, Row, Col, Modal, DatePicker } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { CollectionView } from '@grapecity/wijmo';
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjCore from '@grapecity/wijmo';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import * as FlexLayout from 'flexlayout-react';
import '/node_modules/flexlayout-react/style/light.css';

import AddProducer from './add/add';
import CommonView from './view';

import Excel from '@components/Common/Excel';
import Popout from '@components/Common/popout/popout';

const Wrapper = styled.div`
    width: 100%;height:100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
    #tplBtnViewMode {
        display: none;
    }
`;

const producerList = observer((props) => {
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
        type : 'produce-company',
        model: FlexLayout.Model.fromJson(json),
        tabLen: 1,
        tabInit: false,

        list: [
            {
                ordnum:'10',
                code:'PD220012',
                name:'경문제책사',
                company_no:'123-12-12345',
                process:'인쇄, 제본',
                created_at:'2022.01.01',
                created_id:'이준호',
                use_yn:'Y',
              }
        ],
        total: 0,
        idx: '',
        contractType: '',

        //상세정보
        viewData : [],

        //페이징
        pageArr: {
            pageCnt: 30, //리스트 총 갯수
            page: 1, //현재페이지
        },
        gridFilter: null,
        dateItemName: [{id: 1, name: '등록일'}],
    }));

    useEffect(() => {
        fetchData();
        theSearch.current.control.grid = theGrid.current.control;
    }, []);

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
                       e.created_id = e.created_info.name;
                    }else{
                        e.created_id = '미입력';
                    }
                });

                var result_page =
                    (page - 1) * state.pageArr.pageCnt;
                var str_no = response.data.meta.total - result_page;

                response.data.data.map((e, number) => {
                    e.ordnum = str_no - number;
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

    const tabRef = useRef();

    //상세정보
    const viewData = useCallback(async (type,tit) => {
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
        filter.filterColumns = ["ordnum", "code", "name", "company_no", "process", "created_at", "created_id", "use_yn"];
    };

    //위즈모 체크박스 선택
    const initGrid = (grid) => {

        // center-align merged header cells
        grid.formatItem.addHandler(function (s, e) {
            if(e.panel._ct == 4){
                e.cell.innerHTML = '<div class="v-center">순서</div>';
            }

            if(e.panel == s.rowHeaders){
                e.cell.innerHTML = e.row + 1;
            }

            if (e.panel == s.columnHeaders && e.range.rowSpan > 1) {
                var html = e.cell.innerHTML;
                e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
            }
        });
        grid.autoGenerateColumns = false;
        grid.itemsSource = state.list;

        //버튼 추가
        grid.formatItem.addHandler((s, e) => {
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                // create buttons for items not being edited
                switch (col.binding) {
                    case 'name':
                        let name ='<button id="btnLink" class="btnText title">' +item.name +'</button>';
                        e.cell.innerHTML ='<div class="incell">'+name +' ' +document.getElementById('tplBtnViewMode').innerHTML+'</div>';
                        e.cell['dataItem'] = item;
                        break;
                    case 'use_yn' :
                        if(item.use_yn == "Y" ){
                            var checked = 'checked="checked"';
                        }else{
                            var checked = '';
                        }
                        e.cell.innerHTML = '<input id="useChecker" type="checkbox" name= "'+item.id+'" value="'+item.use_yn+'" '+checked+' />';
                        // e.cell.innerHTML = '<input id="' + col.binding + item.id + '" type="checkbox" name= "'+item.id+'" value="'+item.use_yn+'" '+checked+' />';
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

            if (e.target instanceof HTMLInputElement) {
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                var name = item.name;
                state.idx = item.id;

                switch (e.target.id) {
                    case 'useChecker':
                        //state.window = 'Y';
                        useChk(item.id,item.use_yn);                     
                        break;
                }
            }
        });
    };

    const useChk = (item,val) => {
        var use_data = val==='Y'?'N':(val==='N'?'Y':val);

        var data = {id:item,use_yn:use_data};
        var axios = require('axios');

        var config={
            method:'POST',
            url:process.env.REACT_APP_API_URL +'/api/v1/produce-company',
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
                        fetchData();
                    },
                });
            }else{
                Modal.error({
                    content:(<div>
                                <p>수정시 문제가 발생하였습니다.</p>
                                <p>재시도해주세요.</p>
                                <p>오류코드: {response.data.error}</p>
                            </div>)
                });  
            }
        })
        .catch(function(error){
            console.log(error);
            Modal.error({
                title : (<div>수정시 문제가 발생하였습니다.<br/>재시도해주세요.</div>)
            });  
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
                <CommonView
                    idx={tabIdx}
                    popoutClose={gridEl}
                    popoutChk='N'
                    drawerChk='N'
                    // viewVisible={viewVisible}
                    // viewOnClose={viewOnClose}
                />
            );
        }
    };
    const gridEl = () => {
       
    };

    //팝업
    const [popout, setPopoutOpen] = useState(false);
    const closeWindowPortal = () => {
        setPopoutOpen(false);
    };

    const testChk = ()=>{
        setViewVisible(true)
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
                    allowMerging="ColumnHeaders"
                    alternatingRowStep={0}
                    allowSorting={false}
                >   
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                    <FlexGridColumn binding="code" header="제작처 코드" width={100} allowMerging={true} isReadOnly={true} />
                    <FlexGridColumn binding="name" header="사업자명" width="*" minWidth={200} allowMerging={true} isReadOnly={true} />
                    <FlexGridColumn binding="company_no" header="사업자등록번호"width={120} allowMerging={true} isReadOnly={true} />
                    <FlexGridColumn binding="process" header="담당 공정" width="*" minWidth={200} allowMerging={true} isReadOnly={true} />
                    <FlexGridColumn binding="created_at" header="등록일" width={100} allowMerging={true} isReadOnly={true} />
                    <FlexGridColumn binding="created_id" header="등록자" width={100} allowMerging={true} isReadOnly={true} />
                    <FlexGridColumn binding="use_yn" header="사용 여부" width={100} allowMerging={true} isReadOnly={true} align="center"/>
                </FlexGrid>

                <div className="panelWrap">
                    <FlexLayout.Layout model={state.model} factory={factory.bind(this)} />
                </div>
            </Row>

            <div id="tplBtnViewMode">
                <div className="btnLayoutWrap">
                    <button id="btnDivide" className="btn-layout ant-btn ant-btn-circle" >D</button>
                    <button id="btnNew" className="btn-layout ant-btn ant-btn-circle" >N</button>
                </div>
            </div>

            <Row gutter={10} className="table table_bot">
                <Col xs={16} lg={16}>
                    <div className="btn-group">
                        {/* <Pagination defaultCurrent={1} defaultPageSize={state.pageArr.pageCnt} current={state.pageArr.page} total={state.total} onChange={pageChange}/> */}
                        <span>행 개수 : {state.total}</span>
                    </div>
                </Col>
                <Excel />
            </Row>

            {viewAddVisible === true && (
                <AddProducer
                    visible={viewAddVisible}
                    popoutChk='N'
                    drawerChk='N'
                    onClose={addOnClose}
                    // reset={fetchData}
                />
            )}

            {viewVisible === true && (
                <CommonView
                    idx={state.idx}
                    viewVisible={viewVisible}
                    popoutChk='N'
                    drawerChk='Y'
                    viewOnClose={viewOnClose}
                />
            )}

            {
                popout && (
                    <Popout closeWindowPortal={closeWindowPortal}>
                        <CommonView
                            idx={state.idx}
                            viewVisible={popout}
                            popoutClose={closeWindowPortal}
                            popoutChk="Y"
                            drawerChk='N'
                        />
                    </Popout>
                )
            }


        </Wrapper>
    );
});

export default React.memo(producerList);
//export default commonList;
