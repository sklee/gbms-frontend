import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Button } from 'antd';
import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import * as wjcGrid from '@grapecity/wijmo.grid';
import * as wjGrid from '@grapecity/wijmo.grid';
import { observer, useLocalStore } from 'mobx-react';

import Drawer from '@pages/Product/view'


const index = observer(( {gridHeight} ) =>{
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
                isbn: '97815315631',
                deliveryQuantity: 1000,
                genuineQuantity: 1000,
                genuineInventory: 15000,
                equipmentQuantity: 0,
                equipmentInventory: 300,
                disuseQuantity: 0,
                disuseInventory: 100,
            },
        ],
        grid: null,
        selectRows: [],
    }));

    const initGrid = (grid) => {
        state.grid = grid;

        let extraRow = new wjGrid.Row();
        extraRow.allowMerging = true;
        let panel = grid.columnHeaders;
        panel.rows.splice(0, 0, extraRow);

        for (let colIndex = 0; colIndex <= 9; colIndex++) {
            if(colIndex >= 4 && colIndex <= 5){ 
                panel.setCellData(0, colIndex, '정품');
            } else if(colIndex >= 6 && colIndex <= 7){
                panel.setCellData(0, colIndex, '비품');
            } else if(colIndex >= 8 && colIndex <= 9){
                panel.setCellData(0, colIndex, '폐기대기');
            } else {
                let col = grid.getColumn(colIndex);
                col.allowMerging = true;
                panel.setCellData(0, colIndex, col.header);
            }            
        }

        grid.columnFooters.rows.push(new wjcGrid.GroupRow());

        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
                let col = s.columns[e.col];

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
        });
    };

    const theGrid = useRef();
    const theSearch = useRef();

    // useEffect(()=>{
    //     let Grid = theGrid.current.control;
    //     let search = theSearch.current.control;
    //     search.grid = Grid;
    // },[]);

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
                    isReadOnly={true}
                    selectionMode="None"
                    allowMerging="ColumnHeaders"
                    style={{ minHeight: `calc(100vh - ${gridHeight}px)`, maxHeight: `calc(100vh - ${gridHeight}px)` }}
                >
                    <FlexGridColumn binding="prdName" header="상품명(내부)" width="*" minWidth={150} />
                    <FlexGridColumn binding="prdCode" header="상품 코드" width={100} />
                    <FlexGridColumn binding="isbn" header="ISBN" width={100} />
                    <FlexGridColumn binding="deliveryQuantity" header="출고 수량\n(합계)" width={90} align="right" aggregate="Sum"/>
                    <FlexGridColumn binding="genuineQuantity" header="수량" width={80} align="right" aggregate="Sum"/>
                    <FlexGridColumn binding="genuineInventory" header="가용재고" width={90} align="right" aggregate="Sum"/>
                    <FlexGridColumn binding="equipmentQuantity" header="수량" width={70} align="right" aggregate="Sum"/>
                    <FlexGridColumn binding="equipmentInventory" header="가용재고" width={80} align="right" aggregate="Sum"/>
                    <FlexGridColumn binding="disuseQuantity" header="수량" width={70} align="right" aggregate="Sum"/>
                    <FlexGridColumn binding="disuseInventory" header="가용재고" width={80} align="right" aggregate="Sum"/>   
                    
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