import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Button, Modal } from 'antd';
import { observer, useLocalStore } from 'mobx-react';

import { FlexGrid, FlexGridColumn, FlexGridCellTemplate } from "@grapecity/wijmo.react.grid";
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import * as wjcGrid from '@grapecity/wijmo.grid';
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';



const ObjectGrid = ({ gridHeight }) => {
    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                prdCode: 'GA20',
                prdName: '일본어 무따기',
                isbn: '987',
                price: 12000,
                releaseDate: '2021-03-17',
                returnMaterials: 12,
                processedQuantity: 12,
                returnAmount: 97800,
                equipmentData: 10,
                equipmentReturn: 10,
                equipmentBack: 0,
                disuseData: 2,
                disuseReturn: 2,
                disuseBack: 0,
                note: '',
            },
            {
                id: 2,
                prdCode: 'GA20',
                prdName: '경제학 무작정 따라하기',
                isbn: '978',
                price: 15000,
                releaseDate: '2018-08-24',
                returnMaterials: 9,
                processedQuantity: 8,
                returnAmount: 442500,
                equipmentData: 7,
                equipmentReturn: 6,
                equipmentBack: 1,
                disuseData: 2,
                disuseReturn: 0,
                disuseBack: 1,
                note: '',
            },
        ],
        grid: null,
        totalReturnMaterials: null,
    }));

    const initGrid = (grid) => {
        state.grid = grid;

        let extraRow = new wjGrid.Row();
        extraRow.allowMerging = true;
        var panel = grid.columnHeaders;
        panel.rows.splice(0, 0, extraRow);

        for (let colIndex = 0; colIndex <= 14; colIndex++) {
            if(colIndex >= 8 && colIndex <= 10){ 
                panel.setCellData(0, colIndex, '비품');
            } else if(colIndex >= 11 && colIndex <= 13){
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
                    case 'prdName':
                        let name = '<button type="button" id="btnLink" class="btnLink">'+item.prdName+'</button>';
                        e.cell.innerHTML = name+' '+document.getElementById('tplBtnViewMode').innerHTML;
                        e.cell['dataItem'] = item;
                        break;
                    case 'returnMaterials':
                    case 'processedQuantity':
                        if(item.returnMaterials !== item.processedQuantity){
                            e.cell.innerHTML = `<span class="redTxt fontBold">${item[col.binding]}</span>`
                        }
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                switch(e.target.id){
                    case 'btnLink' :
                        // viewDrawerOpen();
                        break;
                }
            }
            if(e.target instanceof HTMLInputElement) {
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                switch(e.target.id){
                    case 'iptSelect':
                        break;
                }
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

    return (
        <>
            <Row className='table'>
                <Col className="label" span={24} style={{justifyContent: 'flex-start'}}>
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
                        autoRowHeights={true}
                        allowMerging="ColumnHeaders"
                        style={{ minHeight: `calc(100vh - ${gridHeight}px)`, maxHeight: `calc(100vh - ${gridHeight}px)` }}
                    >
                        <FlexGridColumn binding="prdCode" header="상품코드" width={80} />
                        <FlexGridColumn binding="prdName" header="상품명" width="*" minWidth={120} />
                        <FlexGridColumn binding="isbn" header="ISBN" width={80} />
                        <FlexGridColumn binding="price" header="정가" width={90} />
                        <FlexGridColumn binding="releaseDate" header="출시일" width={100} />
                        <FlexGridColumn binding="returnMaterials" header="반품\n자료" width={70} aggregate="Sum">
                            <FlexGridCellTemplate cellType="ColumnFooter" template={(cell) => {
                                state.totalReturnMaterials = cell.value;
                                return cell.value;
                            }} />
                        </FlexGridColumn>

                        <FlexGridColumn binding="processedQuantity" header="처리\n수량" width={70} aggregate="Sum">
                            <FlexGridCellTemplate cellType="ColumnFooter" template={(cell) => {
                                    if(state.totalReturnMaterials == cell.value) {
                                        return cell.value;
                                    } else {
                                        return <span class="redTxt">{cell.value}</span>;
                                    }
                                }} 
                            />
                        </FlexGridColumn>
                        <FlexGridColumn binding="returnAmount" header="반품 금액" width={100} aggregate="Sum"/>
                        <FlexGridColumn binding="equipmentData" header="자료" width={70} aggregate="Sum"/>
                        <FlexGridColumn binding="equipmentReturn" header="반품" width={70} aggregate="Sum"/>
                        <FlexGridColumn binding="equipmentBack" header="회송" width={70} aggregate="Sum"/>
                        <FlexGridColumn binding="disuseData" header="자료" width={70} aggregate="Sum"/>
                        <FlexGridColumn binding="disuseReturn" header="반품" width={70} aggregate="Sum"/>
                        <FlexGridColumn binding="disuseBack" header="회송" width={70} aggregate="Sum"/>
                        <FlexGridColumn binding="note" header="비고" width={100} />
                    </FlexGrid>
                    <div id="tplBtnViewMode">
                        <div className="btnLayoutWrap">
                            <button id="btnNew" className="btn-layout ant-btn ant-btn-circle">N</button>
                        </div>
                    </div>
                </Col>
            </Row>
        </>
    );
}

export default ObjectGrid;