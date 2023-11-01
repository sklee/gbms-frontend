import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Button } from 'antd';
import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import * as wjcGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';
import { observer, useLocalStore } from 'mobx-react';

import Drawer from '@pages/Product/view'


const index = observer(( { gridHeight } ) =>{
    const [drawerVisible, setDrawerVisible] = useState(false);
    const drawerOpen = () => setDrawerVisible(true);
    const drawerClose = () => setDrawerVisible(false);

    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                cnt: '',
                prdName: '믹스',
                prdCode: 'GA02',
                isbn: '978',
                deliveryQuantity: 18,
                inventory: 1500,
                price: 15000,
                supplyRate: 60,
                supplyPrice: 9000,
                supplyAmount: 144000,
            },
            {
                id: 1,
                cnt: '',
                prdName: '경제학 무작정 따라하기(개정판)',
                prdCode: 'GA03',
                isbn: '978',
                deliveryQuantity: 2,
                inventory: 300,
                price: 14000,
                supplyRate: 60,
                supplyPrice: 8400,
                supplyAmount: 16800,
            },
        ],
        grid: null,
        selectRows: [],
    }));

    const initGrid = (grid) => {
        state.grid = grid;

        grid.columnFooters.rows.push(new wjcGrid.GroupRow());

        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + "<br/>" + html.split('\\n')[1] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                switch (col.binding) {
                    case 'cnt':
                        e.cell.innerHTML = e.row + 1;
                        e.cell['dataItem'] = item;
                        break;
                    case 'prdName':
                        let name = '<button id="btnLink" class="btnLink">'+item.prdName+'</button>';
                        e.cell.innerHTML = name+' '+document.getElementById('tplBtnViewMode').innerHTML;
                        e.cell['dataItem'] = item;
                        break;
                }
            }
        });


        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                switch(e.target.id){
                    case 'btnLink' :
                        drawerOpen();
                        break;
                }
            }
            if(e.target instanceof HTMLInputElement) {
                
            }
        });
    };

    const theGrid = useRef();
    const theSearch = useRef();

    useEffect(()=>{
        let Grid = theGrid.current.control;
        let search = theSearch.current.control;
        search.grid = Grid;
    },[]);

    return(
        <Row className="table">
            <Col className="label" span={24} style={{justifyContent: 'left'}}>
                <FlexGridSearch ref={theSearch} placeholder='검색'/>
            </Col>
            <Col span={24}>
                <FlexGrid
                                                                                          ref={theGrid}
                    itemsSource={state.list}
                    initialized={(s) => initGrid(s)}
                    headersVisibility="Column"
                    selectionMode="None"
                    autoRowHeights={true}
                    isReadOnly={true}
                    style={{ minHeight: `calc(100vh - ${gridHeight}px)`, maxHeight: `calc(100vh - ${gridHeight}px)` }}
                >z
                    <FlexGridColumn binding="prdName" header="상품명(내부)" width="*" minWidth={120} />
                    <FlexGridColumn binding="prdCode" header="상품 코드" width={100} />
                    <FlexGridColumn binding="isbn" header="ISBN" width={100} />
                    <FlexGridColumn binding="deliveryQuantity" header="출고\n수량" width={80} align="right" aggregate="Sum"/>
                    <FlexGridColumn binding="inventory" header="가용재고\n(정품)" width={100} align="right" aggregate="Sum"/>
                    <FlexGridColumn binding="price" header="정가" width={100} align="right"/>
                    <FlexGridColumn binding="supplyRate" header="공급률" width={70} align="right"/>
                    <FlexGridColumn binding="supplyPrice" header="공급 단가" width={90} align="right"/>
                    <FlexGridColumn binding="supplyAmount" header="공급 금액" width={90} align="right" aggregate="Sum"/>
                </FlexGrid>
                <div id="tplBtnViewMode">
                    <div className="btnLayoutWrap">
                        <button id="btnNew" className="btn-layout ant-btn ant-btn-circle">N</button>
                    </div>
                </div>
            </Col>

            
            {drawerVisible && <Drawer viewVisible={drawerVisible} viewOnClose={drawerClose} drawerChk="Y"/>}
            {/* <Drawer viewVisible={true} /> */}
            
        </Row>
    );
});

export default index;