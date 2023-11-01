import React, { useState } from 'react'
import { Row, Col, DatePicker } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { CollectionView } from '@grapecity/wijmo';
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjCore from '@grapecity/wijmo';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";

import Excel from '@components/Common/Excel';
import View from './view'


const Wrapper = styled.div`
    width: 100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
    #tplBtnViewMode {
        display: none;
    }
`;

const index = observer((props) => {

    const state = useLocalStore(() => ({
        list: [
            {   
                id: 0,
                productCode : 'GA0',
                productName : '상품명 ',
                productType:  '종이책(단권)',
                PublicationCount: '2쇄',
                reviewStatus: '재쇄 검토 요청',
                reviewPerson: '김명자',
                reviewDate: '2023.08.02',
                OrderQuantity: 3000,
                inventoryQuantity: 152,
                inventoryDate: 7.1,
                requestDate: '2023.08.10',
                editor: '홍길동',
                reviewComp: '2023.08.02',
            },
            {   
                id: 1,
                productCode : 'GA0',
                productName : '상품명 ',
                productType:  '종이책(세트)',
                PublicationCount: '2쇄',
                reviewStatus: '재쇄 검토 요청',
                reviewPerson: '김명자',
                reviewDate: '2023.08.02',
                OrderQuantity: 3000,
                inventoryQuantity: 152,
                inventoryDate: 7.1,
                requestDate: '2023.08.10',
                editor: '홍길동',
                reviewComp: '2023.08.02',
            },
        ],
        idx: '',
        grid:'',
        setGoods: null,
        gridFilter: null,
        dateItemName: [{id: 1, name: '적용일'}],
    }));

    React.useEffect(() => {
        theSearch.current.control.grid = theGrid.current.control;
    }, [])

    const theGrid = React.useRef();
    const theSearch = React.useRef();
    
    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["productCode","productName","productType","PublicationCount","reviewStatus","reviewPerson",
            "reviewDate","OrderQuantity","inventoryQuantity","inventoryDate","requestDate","editor","reviewComp"];
    };

    const initGrid = (grid) => {
        state.gridFilter =new wjFilter.FlexGridFilter(grid);
        
        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.columnHeaders) {
                let html = e.cell.innerHTML;
                let col = s.columns[e.col];
                if(col.binding == 'chk'){
                    e.cell.classList.add("headCenter")
                }else{
                    if(html.split('\\n').length > 1){
                        e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + ' ' + html.split('\\n')[1] + "<br/>" + html.split('\\n')[2] + '</div>';
                    }else{
                        e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                    }
                }
            }

            if (e.panel == s.cells) {
                let item = s.rows[e.row].dataItem;
                let col = s.columns[e.col];
                switch (col.binding) {
                    case 'reviewStatus':
                        e.cell.classList.add('cell_blue_bg');
                        e.cell.innerHTML = '<button id="btnLink" class="btnLink">'+ item.reviewStatus +'</button>'
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
                        drawerOpen(item.productType);
                        break;
                }
            }
        });
    }

    const [ viewDrawer, setViewDrawer ] = useState(false);
    const drawerOpen = (type) => {
        if(type == '종이책(세트)'){
            state.setGoods = true;
        } else {
            state.setGoods = false;
        }
        
        setViewDrawer(true);
    }
    const drawerClose = () => setViewDrawer(false);

    return (
        <Wrapper className='productionSim'>
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
                    autoRowHeights={true}
                    allowSorting={false}
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)}/>
                    <FlexGridColumn header='상품 코드' binding='productCode' width={100} />
                    <FlexGridColumn header='상품명' binding='productName' width="*" minWidth={120} />
                    <FlexGridColumn header='상품 종류' binding='productType' width={120} />
                    <FlexGridColumn header='현재\n쇄' binding='PublicationCount' width={70} />
                    <FlexGridColumn header='검토 상태' binding='reviewStatus' width={150} />
                    <FlexGridColumn header='검토\n요청자' binding='reviewPerson' width={80}/>
                    <FlexGridColumn header='검토 요청일' binding='reviewDate' width={100} />
                    <FlexGridColumn header='발주 수량' binding='OrderQuantity' width={90} align="right"/>
                    <FlexGridColumn header='요청 시\n재고 수량' binding='inventoryQuantity' width={100} align="right"/>
                    <FlexGridColumn header='요청 시\n재고 소진일' binding='inventoryDate' width={100} align="right"/>
                    <FlexGridColumn header='입고 요청일' binding='requestDate' width={100} />
                    <FlexGridColumn header='편집\n담당자' binding='editor' width={80} />
                    <FlexGridColumn header='검토 완료일' binding='reviewComp' width={100} />
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

            {viewDrawer == true ? <View viewVisible={viewDrawer} visibleClose={drawerClose} setGoods={state.setGoods}/> : ''}

        </Wrapper>

    )
})

export default index;