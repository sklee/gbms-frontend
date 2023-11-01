import React, { useState } from 'react';
import { Row, Col, DatePicker } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { CollectionView } from '@grapecity/wijmo';
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";

import Excel from '@components/Common/Excel';
import View from './view'


const Wrapper = styled.div`
    width: 100%;
    #tplBtnViewMode {
        display: none;
    }
`;

const index = observer((props) => {

    const state = useLocalStore(() => ({
        list: [
            {
                id: 0,
                company: '도서출판 길벗',
                prdCode: 'GA02B',
                prdName: '상품명 ',
                prdType: '비매품',
                prdClass: '',
                printing: '',
                prdComp: '카카오',
                moq: '',
                qow: 1000,
                division: '외부 제작',
                registration: '2023.08.12. 11:20',
                status: '입고 등록',
            }
        ],
        grid: null,
    }));

    React.useEffect(() => {
        theSearch.current.control.grid = theGrid.current.control;
    }, [])

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    //위즈모 체크박스 선택
    const initGrid = (grid) => {
        state.grid =grid;

        //버튼 추가
        grid.formatItem.addHandler((s, e) => {
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                switch (col.binding) {
                    case 'prdName':
                        let prdName = '<button id="btnLink" class="btnLink">'+item.prdName+'</button>';
                        e.cell.innerHTML = prdName+' '+document.getElementById('tplBtnViewMode').innerHTML;
                        e.cell['dataItem'] = item;
                        break;
                }
            }
        });

        // handle button clicks
        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                // get button's data item
                // let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];

                switch (e.target.id) {
                    // start editing this item
                    case 'btnLink':
                        viewDrawerOpen();
                        break;
                }
            }

        });
    };

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["company", "prdCode", "prdName", "prdType", "prdClass", "printing", "prdComp", "moq", "qow", "division", "registration", "status"];
    };

    const [viewVisible, setViewVisble] = useState(false);
    const viewDrawerOpen = () => { setViewVisble(true) };
    const viewDrawerClose = () => { setViewVisble(false) };

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
            </Row>
            <Row id="gridWrap" className="gridWrap" >
                <FlexGrid
                    ref={theGrid}
                    itemsSource={state.list}
                    stickyHeaders={true}
                    headersVisibility="Column" 
                    initialized={(s) => initGrid(s)}
                    isReadOnly={true}
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                    <FlexGridColumn binding="company" header="회사" width={80} />
                    <FlexGridColumn binding="prdCode" header="상품 코드" width={100} />
                    <FlexGridColumn binding="prdName" header="상품명" width="*" minWidth={120} />
                    <FlexGridColumn binding="prdType" header="상품 종류" width={100} />
                    <FlexGridColumn binding="prdClass" header="제작 구분" width={100} />
                    <FlexGridColumn binding="printing" header="쇄" width={80} />
                    <FlexGridColumn binding="prdComp" header="제작처" width={100} />
                    <FlexGridColumn binding="moq" header="발주 수량" align="right" width={100} />
                    <FlexGridColumn binding="qow" header="입고 수량" align="right" width={100} />
                    <FlexGridColumn binding="division" header="입고 구분" width={100} />
                    <FlexGridColumn binding="registration" header="입고 등록" width={100} />
                    <FlexGridColumn binding="status" header="입고 상태" width={100} />
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
                    <button id="btnNew" className="btn-layout ant-btn ant-btn-circle" >N</button>
                </div>
            </div>

            {viewVisible && (
                <View 
                    viewVisible={viewVisible}
                    onClose={viewDrawerClose}
                    drawerChk='Y'
                />
            )}

        </Wrapper>
    );

});

export default index;
