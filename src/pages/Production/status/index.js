import React, { useState, useEffect, useMemo } from 'react'
import { Row, Col, DatePicker, Checkbox, Button, Modal } from 'antd';

import moment from 'moment';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { Selector } from "@grapecity/wijmo.grid.selector";
import { CollectionView } from "@grapecity/wijmo";
import * as wjCore from '@grapecity/wijmo';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";

import Excel from '@components/Common/Excel';
import View from './view/index'


const Wrapper = styled.div`
    width: 100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
    #tplBtnViewMode {
        display: none;
    }
`;

const productionStatus = observer((props) => {
    const { RangePicker } = DatePicker;
    const dateFormat = 'YYYY-MM-DD';

    const state = useLocalStore(() => ({
        list: [
            {   
                id: 0,
                productCode : 'GA0',
                productName : '상품명 ',
                productType:  '종이책(단권)',
                department:  'A팀',
                PublicationCount: '2쇄',
                editor: '홍길동',
                productionDirector: '이진혁',
                productionDivision: '신간',
                productionState: '사양 확정 요청',
                finalChange: '2023.08.01',
                orderQuantity: 3000,
                incomingQuantity: '',
                incomingDate: '',
            },
            {   
                id: 1,
                productCode : '',
                productName : '상품명 ',
                productType:  '종이책(단권)',
                department:  'A팀',
                PublicationCount: '2쇄-1',
                editor: '홍길동',
                productionDirector: '이진혁',
                productionDivision: '신간',
                productionState: '인쇄 샘플 도착',
                finalChange: '2023.08.03',
                orderQuantity: 5000,
                incomingQuantity: '',
                incomingDate: '',
            },
            {   
                id: 2,
                productCode : '',
                productName : '상품명 ',
                productType:  '종이책(단권)',
                department:  'B팀',
                PublicationCount: '2쇄',
                editor: '홍길동2',
                productionDirector: '이진혁',
                productionDivision: '재쇄',
                productionState: '입고(완료)',
                finalChange: '2023.08.05',
                orderQuantity: 1000,
                incomingQuantity: 1050,
                incomingDate: '2023.08.05',
            },
        ],
        idx: '',
        selector:'',
        grid:'',
        selectordata: [],
        selState: '',
        startDate: new Date('2000-01-01'),
        endDate: new Date(),
        incomingChkBox: false,
        oneselfChkBox: false,
        gridFilter: null,
    }));

    const [selectorState, setSelectorState] = useState({
        view: new CollectionView(state.list),
        selectedItems: []
    });

    useEffect(()=>{
        state.selState = selectorState.selectedItems[0]?._data.productionState;
        theSearch.current.control.grid = theGrid.current.control;
    },[selectorState]);

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    const onChange = (e) => {
        const {value, checked} = e.target
        if(value == 'incoming'){
            state.incomingChkBox = checked;
        }else{
            state.oneselfChkBox = checked;
        }
    };

    const onRangeChange = (dates, dateStrings) => {
        if (dates) {
            state.startDate = new Date(dateStrings[0]);
            state.endDate = new Date(dateStrings[1]);
        } else {
            state.startDate = new Date('2000-01-01');
            state.endDate = new Date();
        }
    };

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = [ "productCode", "productName", "productType", "department", "PublicationCount", "editor", "productionDirector", "productionDivision", 
        "productionState", "finalChange", "orderQuantity", "incomingQuantity", "incomingDate"];
    };

    const initGrid = (grid) => {
        state.grid= grid;

        state.selector = new Selector(grid, {
            itemChecked: (s, e) => {
                setSelectorState({
                    selectedItems: grid.rows.filter(r => r.isSelected)
                });
            }
        });

        grid.formatItem.addHandler(function (s, e) {

            // 체크박스 여부 및 비활성화 설정
            if(e.panel == s.rowHeaders){
                let item = s.rows[e.row].dataItem;
                if(item){
                    if(item.productionState == "입고(완료)"){
                        e.cell.innerHTML = '';
                    } else{
                        let chkBox = e.cell.getElementsByTagName('input');
                        if(state.selState == undefined){
                            return ;
                        } else if(item.productionState != state.selState){
                            chkBox[0].setAttribute('disabled', 'true');
                        } else{
                            chkBox[0].removeAttribute('disabled');
                        }
                    }
                }
            }

            if(e.panel._ct == 4){
                e.cell.innerHTML = '<div class="v-center">선택</div>';
            }

            if (e.panel == s.cells) {
                let item = s.rows[e.row].dataItem;
                let col = s.columns[e.col];
                switch (col.binding) {
                    case 'productionState':
                        e.cell.classList.add('cell_blue_bg');
                        e.cell.innerHTML = '<button id="btnLink" class="btnText">'+item.productionState+'</button>';
                        break;
                    case 'productName' :
                        let productName = '<button id="btnLink" class="btnLink">' + item.productName +'</button>';
                        e.cell.innerHTML = productName + ' ' +
                            document.getElementById('tplBtnViewMode').innerHTML;
                        e.cell['dataItem'] = item;
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                switch (e.target.id) {
                    case 'btnLink':
                        drawerOpen();
                        break;
                }
            }
        });
    }

    const [ viewDrawer, setViewDrawer ] = useState(false);
    const drawerOpen = () => setViewDrawer(true);
    const drawerClose = () => setViewDrawer(false);

    return (
        <Wrapper className='productionSim'>
            <Row className="topTableInfo">
                <Col span={20}>
                    <FlexGridSearch ref={theSearch} placeholder='검색' style={{ marginRight: 10 }}/>
                    <span style={{marginRight: 10}}>제작 발주일</span>
                    <RangePicker 
                        format={dateFormat}
                        style={{marginRight: 20}}
                        onChange={onRangeChange}
                    />
                    <span style={{marginRight: 10}}>보기 설정</span>
                    <Checkbox onChange={onChange} value="incoming">입고(완료) 제외</Checkbox>
                    <Checkbox onChange={onChange} value="oneself">본인 담당</Checkbox>
                </Col>
                <Col span={4} className="topTable_right">
                    {
                        state.selState == undefined ? <Button>선택 후 일괄 작업</Button> : 
                        state.selState == '사양 확정 요청' ? <Button>사양 확정</Button> :
                        state.selState == '사양 확정' ? <Button>편집 마감 완료</Button> :
                        state.selState == '인쇄 샘플 도착' ? <Button>인쇄 샘플 검수 완료</Button> :
                        state.selState == '제본 샘플 도착' ? <Button>제본 샘플 검수 완료</Button> : ''
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
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                    <FlexGridColumn header='상품 코드' binding='productCode' width={100} />
                    <FlexGridColumn header='상품명' binding='productName' width="*" minWidth={120} />
                    <FlexGridColumn header='상품 종류' binding='productType' width={100} />
                    <FlexGridColumn header='부서' binding='department' width={100} />
                    <FlexGridColumn header='쇄' binding='PublicationCount' width={70} />
                    <FlexGridColumn header='편집 담당' binding='editor' width={90} />
                    <FlexGridColumn header='제작 담당' binding='productionDirector' width={90}/>
                    <FlexGridColumn header='제작 구분' binding='productionDivision' width={90} />
                    <FlexGridColumn header='제작 상태' binding='productionState' width={140} />
                    <FlexGridColumn header='마지막 변경' binding='finalChange' width={100} />
                    <FlexGridColumn header='발주 수량' binding='orderQuantity' width={90} align="right"/>
                    <FlexGridColumn header='입고 수량' binding='incomingQuantity' width={90} align="right"/>
                    <FlexGridColumn header='입고일' binding='incomingDate' width={100} />
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

            {viewDrawer ? 
                <View
                    drawerChk='Y'
                    chkVisible={viewDrawer}
                    visibleClose={drawerClose}
                /> : ''}
        </Wrapper>
    )
})

export default productionStatus;