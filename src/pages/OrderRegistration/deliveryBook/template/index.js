import React, { useState, useEffect, useCallback } from 'react'
import {Row, Col, Button, DatePicker } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { CollectionView } from '@grapecity/wijmo';
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import * as wjCore from '@grapecity/wijmo';
import useStore from '@stores/useStore';

import styled from 'styled-components';

import Excel from '@components/Common/Excel';
import Drawer from './drawer'


const Wrapper = styled.div`
    width: 100%;
    #tplBtnViewMode {
        display: none;
    }
`;

const index = observer(( props ) => {
    const { commonStore } = useStore();

    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                title: '[도서출판 길벗]IT전문서 분야 ',
                department_names: 'IT전문서, IT입문서',
                created_at: '2023.06.10',
                created_name: '안민제',
                updated_at: '2023.08.11',
                updated_name: '안민제',
            },
        ],
        grid: null,
        selected:'',

        //pagination
        total: 0,
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },
        dateItemName: [{id: 1, name: '적용일'}],
    }));

    useEffect(() => {
        fetchData()
        theSearch.current.control.grid = theGrid.current.control;
    }, []);

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    const fetchData = useCallback(async ()=>{
        const result = await commonStore.handleApi({
            url: '/book-distribution-templates',
            data: {
                display:state.pageArr.pageCnt,
                page:state.pageArr.page,
                sort_by:'desc',
                order:'desc'
            }
        });
        state.list = result.data
    },[])
    
    const initGrid = (grid) => {
        state.grid = grid

        grid.formatItem.addHandler(function (s, e) {
            let item = s.rows[e.row]?.dataItem;
            if (e.panel == s.cells && item) {
                let col = s.columns[e.col];
                switch (col.binding) {
                    case 'title':
                        let name ='<button id="btnLink" class="btnLink title">' + item.title +'</button>';
                        e.cell.innerHTML ='<div class="incell">'+name +' ' +document.getElementById('tplBtnViewMode').innerHTML+'</div>';
                        e.cell['dataItem'] = item;
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                switch(e.target.id){
                    case 'btnLink':
                        drawerOpen(item);
                        break;
                }
            }
        });
    };

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["title", "department_names", "created_at", "created_name", "updated_at", "updated_name"];
    };

    const [drawerVisible, setDrawerVisible] = useState(false);
    const drawerOpen = (item) => { state.selected=item.id;setDrawerVisible(true); };
    const drawerClose = () => {
        setDrawerVisible(false);
        fetchData()
        state.selected = ''
    };

    return (
        <Wrapper>
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
                <Col span={4} className="topTable_right">
                    <Button className="btn btn-primary btn_add" shape="circle" onClick={drawerOpen}>+</Button>
                </Col>
            </Row>
            <Row className="gridWrap">
                <FlexGrid
                    ref={theGrid}
                    itemsSource={state.list} 
                    stickyHeaders={true} 
                    initialized={(s) => initGrid(s)}
                    headersVisibility="Column"
                    isReadOnly={true}
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)}/>
                    <FlexGridColumn binding="title" header="제목" width="*" minWidth={150} />
                    <FlexGridColumn binding="department_names" header="사용 부서" width="*" minWidth={150} />
                    <FlexGridColumn binding="created_at" header="등록일" width={100} />
                    <FlexGridColumn binding="created_name" header="등록자" width={80} />
                    <FlexGridColumn binding="updated_at" header="수정일" width={100} />
                    <FlexGridColumn binding="updated_name" header="수정자" width={80} />
                </FlexGrid>     
            </Row>

            <Row className='table_bot'>
                <Col xs={16} lg={16}>
                    <div className='btn-group'>
                        <span>행 개수 : {state.list.length}</span>
                    </div>
                </Col>
                <Excel />
            </Row>
            <div id="tplBtnViewMode">
                <div className="btnLayoutWrap">
                    <button
                        id="btnNew"
                        className="btn-layout ant-btn ant-btn-circle"
                    >
                        N
                    </button>
                </div>
            </div>

            {drawerVisible && <Drawer templateIdx={state.selected} drawerVisible={drawerVisible} drawerClose={drawerClose} />}
        </Wrapper>
        
    )
})



export default index;
