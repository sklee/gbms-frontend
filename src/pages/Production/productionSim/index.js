import React, { useCallback, useEffect, useState, useRef } from 'react';
import {Button, Row, Col, Modal, Pagination, DatePicker} from 'antd';
import { ExclamationCircleOutlined} from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { Selector } from "@grapecity/wijmo.grid.selector";
import { CollectionView } from "@grapecity/wijmo";
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjCore from '@grapecity/wijmo';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";

import Excel from '@components/Common/Excel';
import SimDrawer from './Add'; // 등록 Drawer
import ViewDrawer from './View'; // 보기/수정 Drawer

const Wrapper = styled.div`
    width: 100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
    #tplBtnViewMode {
        display: none;
    }
`;

const productionSim = observer((props) => {

    const state = useLocalStore(() => ({
        type : 'simulations',
        list: [
            {   
                id: 0,
                simulation_code : 'SI23010013',
                title : '시뮬레이션 1',
                product_code:  '',
                product_name:  '',
                created_name: "허두영",
                created_at: "2018-09-18",
                updated_at: "2018-09-18",
                share: "",
                status: '등록',
                review_at: "2023-03-10",
                review_name: '',
                used: 'Y'
            },
        ],
        idx: 0,
        selector:'',
        flex:'',

        //페이징
        total: 1,
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },
        gridFilter: null,
        dateItemName: [{id: 1, name: '적용일'}],
    }));

    useEffect(() => {
        // state.type = props.type;
        theSearch.current.control.grid = theGrid.current.control;
        fetchData();
    }, [props]);

    const theGrid = useRef();
    const theSearch = useRef();

    const pageChange = (num)=>{
        let FLEXLAYOUT = document.querySelectorAll(".flexlayout__tab");
        FLEXLAYOUT.forEach((item)=>{
            item.scrollTo(0, 0);
        })
        fetchData(num);
    }


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
            })
            .catch(function (error) {
                console.log(error.response);
                if(error.response){
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
                }
            });
    }, []);

    const [viewVisible, setViewVisible] = useState(false);
    const [simvisible, setSimvisible] = useState(false);
    const [selectorState, setSelectorState] = useState({
        view: new CollectionView(state.list),
        selectedItems: []
    });

    const simDrawerOpen = () => {
        setSimvisible(true);
    }
    const simDrawerClose = () => {
        setSimvisible(false);
    }
    const viewDrawerOpen = () =>{
        setViewVisible(true);
    }
    const viewDrawerClose = () =>{
        setViewVisible(false);
    }

    const rowDel = () =>{
        let view = state.flex.collectionView;
        view.remove(view.currentItem);
    }

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = [ "simulation_code", "title", "product_code", "product_name", "created_name", "created_at", "updated_at", "share", "status", "review_at", "review_name", "used"];
    };

    const initGrid = (grid) => {
        state.flex= grid;

        state.selector = new Selector(grid, {
            itemChecked: (s, e) => {
                setSelectorState({
                    selectedItems: grid.rows.filter(r => r.isSelected)
                });
            }
        });

        grid.formatItem.addHandler(function (s, e) {
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
                switch (col.binding) {
                    case 'title' :
                        let title = '<button id="btnLink" class="btnLink">' + item.title +'</button>';
                        e.cell.innerHTML = title + ' ' +
                            document.getElementById('tplBtnViewMode').innerHTML;
                        e.cell['dataItem'] = item;
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                state.idx = item.id;
                
                switch (e.target.id) {
                    case 'btnLink':
                        viewDrawerOpen(item.id);
                        break;
                }
            }
        });
    }

    return (
        <Wrapper className='productionSim'>
            <Row className="topTableInfo" >
                <Col span={24}><ExclamationCircleOutlined /> 진행 상태가 <span style={{color: 'red'}}>‘제작 검토 완료’가 되면 제작 현황 메뉴</span>에서 세부 제작 사양 확인, 발주 요청 등 이후 단계를 진행할 수 있습니다.</Col>
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
                    {selectorState.selectedItems.length === 0 ?
                        <Button className="btn btn-primary btn_add" shape="circle" onClick={simDrawerOpen}>+</Button>
                    : 
                        <Button onClick={rowDel}>선택 삭제</Button>
                    }
                </Col>
            </Row>
            <Row className='gridWrap'>
                <FlexGrid
                    ref={theGrid}
                    itemsSource={state.list} 
                    stickyHeaders={true} 
                    initialized={(s) => initGrid(s)}
                    allowSorting={false}
                    autoRowHeights={true}
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                    <FlexGridColumn header='시뮬레이션\n코드' binding='simulation_code' width={100} />
                    <FlexGridColumn header='제목' binding='title' width="*" minWidth={120}/>
                    <FlexGridColumn header='상품 코드' binding='product_code' width={100} />
                    <FlexGridColumn header='상품명' binding='product_name' width={120} />
                    <FlexGridColumn header='등록자' binding='created_name' width={80} />
                    <FlexGridColumn header='최초 등록' binding='created_at' width={100} />
                    <FlexGridColumn header='업데이트' binding='updated_at' width={100} />
                    <FlexGridColumn header='공유' binding='share' width={120}/>
                    <FlexGridColumn header='진행 상태' binding='status' width={120} />
                    <FlexGridColumn header='검토 완료일' binding='review_at' width={100} />
                    <FlexGridColumn header='검토 담당' binding='review_name' width={90} />
                    <FlexGridColumn header='작업' binding='used' width={80} align='center'/>
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
            <div id="tplBtnViewMode">
                <div className="btnLayoutWrap">
                    <button id="btnNew" className="btn-layout ant-btn ant-btn-circle" >N</button>
                </div>
            </div>

            {/* {simvisible === true && <SimDrawer visible={simvisible} drawerClose={simDrawerClose}/> }
            {modifyVisible === true && <ModifyDrawer visible={modifyVisible} drawerClose={modifyDrawerClose} /> } */}

            {simvisible && 
                <SimDrawer visible={simvisible} drawerClose={simDrawerClose} drawerChk="Y"/>
            }
            {viewVisible && 
                <ViewDrawer list={state.idx} visible={viewVisible} drawerClose={viewDrawerClose} drawerChk="Y"/>
            }

        </Wrapper>
    )
})

export default productionSim;