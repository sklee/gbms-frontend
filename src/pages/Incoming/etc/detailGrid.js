import React, { useEffect, useRef } from 'react';
import { Row, Col } from 'antd';
import { observer, useLocalStore } from 'mobx-react';

import { FlexGrid, FlexGridColumn, FlexGridCellTemplate } from "@grapecity/wijmo.react.grid";
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import * as wjcGrid from '@grapecity/wijmo.grid';


const ObjectGrid = ({ gridHeight }) => {
    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                prdCode: 'GA03',
                prdName: '경제학 무작정 따라하기',
                isbn: '95512',
                price: 15000,
                quantity: 30,
                note: '',
            },
        ],
        grid: null,
        totalReturnMaterials: null,
    }));

    const initGrid = (grid) => {
        state.grid = grid;

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
                        <FlexGridColumn binding="prdCode" header="상품코드" width={100} />
                        <FlexGridColumn binding="prdName" header="상품명(내부)" width="*" minWidth={120} />
                        <FlexGridColumn binding="isbn" header="ISBN" width={90} />
                        <FlexGridColumn binding="price" header="정가" width={100} />
                        <FlexGridColumn binding="quantity" header="수량" width={70} aggregate="Sum"/>
                        <FlexGridColumn binding="note" header="비고" width={120} />
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