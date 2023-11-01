import React, { useState } from 'react';
import { Row, Col, DatePicker } from 'antd';
import { observer, useLocalStore } from 'mobx-react';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { CollectionView } from '@grapecity/wijmo';
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import * as wjCore from '@grapecity/wijmo';

import Drawer from '@pages/ProduceMgmt/orderPaper/paperbookTab';
import Excel from '@components/Common/Excel';


const Index = observer((props) => {

    const state = useLocalStore(() => ({
        type : 'simulations',
        list: [
            {   
                id: 0,
                company : '길벗',
                department : '경제경영2팀',
                prdName:  '믹스(Mix)',
                level:  '오류',
                process: "편집",
                classification: "내용 오류",
                responsibility: '내부',
                director: '홍길동',
                targetAmount: 1100000,
                processedAmount: 1100000,
                registrationDate: '2023.08.02',
                status: '등록'
            },
        ],
        idx: 0,
        selector:'',
        flex: null,

        //페이징
        total: 1,
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },
        gridFilter: null,
        currentEditItem: null,
        dateItemName: [{id: 1, name: '신청일'}],
    }));

    React.useEffect(() => {
        theSearch.current.control.grid = theGrid.current.control;
    }, [])

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    const [ drawerVisible, setDrawerVisible ] = useState(false);
    const drawerOpen = () => setDrawerVisible(true);
    const drawerClose = () => setDrawerVisible(false);

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = [ "company", "department", "prdName", "level", "process", "classification", "responsibility", "director", "targetAmount", "processedAmount", "registrationDate", "status"];
    };

    const initGrid = (grid) => {
        state.flex= grid;

        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.columnHeaders) {
                let html = e.cell.innerHTML;
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
                    case 'prdName':
                        let name = '<button id="btnLink" class="btnLink">' + item.prdName +'</button>';
                        e.cell.innerHTML = name + ' ' +
                        document.getElementById('tplBtnViewMode').innerHTML;
                        e.cell['dataItem'] = item;
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            let item = wjCore.closest(e.target, '.wj-cell')?.['dataItem'];
            if (e.target instanceof HTMLButtonElement) {
                switch(e.target.id){
                    case 'btnLink':
                        drawerOpen();
                        break;
                }
            }
        });
    };

    return (
        <>
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
            </Row>

            <Row className='gridWrap'>
                <FlexGrid
                    ref={theGrid}
                    itemsSource={state.list} 
                    stickyHeaders={true} 
                    initialized={(s) => initGrid(s)}
                    headersVisibility="Column"
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                    <FlexGridColumn header='회사' binding='company' width={60} />
                    <FlexGridColumn header='부서' binding='department' width={110}/>
                    <FlexGridColumn header='상품명' binding='prdName' width="*" minWidth={150} />
                    <FlexGridColumn header='수준' binding='level' width={80} />
                    <FlexGridColumn header='공정' binding='process' width={80} />
                    <FlexGridColumn header='분류' binding='classification' width={130} />
                    <FlexGridColumn header='책임' binding='responsibility' width={60} />
                    <FlexGridColumn header='책임자' binding='director' width={100} />
                    <FlexGridColumn header='대상 금액' binding='targetAmount' width={100} align='right'/>
                    <FlexGridColumn header='처리 금액' binding='processedAmount' width={100} align='right'/>
                    <FlexGridColumn header='등록일' binding='registrationDate' width={100} />
                    <FlexGridColumn header='처리 상태' binding='status' width={80} />
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

            <div id="tplBtnViewMode">
                <div className="btnLayoutWrap">
                    <button id="btnDivide"className="btn-layout ant-btn ant-btn-circle">D</button>
                    <button id="btnNew" className="btn-layout ant-btn ant-btn-circle" >N</button>
                </div>
            </div>

            <Drawer  visible={drawerVisible} addDrawerClose={drawerClose}/>
        </>
    )
})

export default Index;