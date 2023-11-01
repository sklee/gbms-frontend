import React, { useState } from 'react';
import { Row, Col } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import * as wjCore from '@grapecity/wijmo';
import * as wjGrid from '@grapecity/wijmo.grid';


const Wrapper = styled.div`
    margin: 30px 0;
    width: 100%;
    .table .btnLink{text-decoration: none}
    .wj-content{margin-bottom: -7px}
`;

const index = observer((props) => {

    const state = useLocalStore(() => ({
        list: [
            {
                id: 0,
                incomingDate: '2023.08.10. 10:02',
                registrant: '홍길동',
                storage: '라임북(정품)',
                quantity: 1000,
                packingMethod: '박스(검정)',
                copies: 10,
                boxQuantity: 100,
                extra: 10,
                sum: 1510,
            }
        ],
        grid: null,
    }));

    //위즈모 체크박스 선택
    const initGrid = (grid) => {
        state.grid =grid;


        let extraRow = new wjGrid.Row();
        extraRow.allowMerging = true;
        
        var panel = grid.columnHeaders;
        panel.rows.splice(0, 0, extraRow);

        for (let colIndex = 0; colIndex <= 8; colIndex++) {
            if(colIndex >= 5 && colIndex <= 8){ 
                panel.setCellData(0, colIndex, '입고 수량');
            } else {
                let col = grid.getColumn(colIndex);
                if(col !=='' && col !== undefined){
                    col.allowMerging = true;
                    panel.setCellData(0, colIndex, col.header);
                }
                
            }            
        }

        //버튼 추가
        grid.formatItem.addHandler((s, e) => {
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
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];

                switch (e.target.id) {
                    // start editing this item
                    case 'btnLink':
                        break;
                }
            }

        });
    };

    return (
        <Wrapper>
            <Row className='table marginTop'>
                <div className="table_title">입고 정보</div>
                <Col span={24} className='innerCol'>
                    <FlexGrid
                        itemsSource={state.list}
                        initialized={(s) => initGrid(s)}
                        headersVisibility="Column" 
                        allowMerging="ColumnHeaders"
                        autoRowHeights={true}
                        isReadOnly={true}
                    >
                        <FlexGridColumn binding="incomingDate" header="입고 등록일시" width={150} />
                        <FlexGridColumn binding="registrant" header="등록자" width={100} />
                        <FlexGridColumn binding="storage" header="입고 창고" width="*" minWidth={120} />
                        <FlexGridColumn binding="quantity" header="입고 잔여\n수량" align="right" width={100} />
                        <FlexGridColumn binding="packingMethod" header="포장 방법" width={100} />
                        <FlexGridColumn binding="copies" header="속당 부수" align="right" width={100} />
                        <FlexGridColumn binding="boxQuantity" header="박스 수량" align="right" width={100} />
                        <FlexGridColumn binding="extra" header="여분" align="right" width={90} />
                        <FlexGridColumn binding="sum" header="합계" align="right" width={100} />
                    </FlexGrid>
                </Col>
                <Col xs={12} lg={4} className='label'>참고사항</Col>
                <Col xs={12} lg={20}></Col>
                <Col xs={12} lg={4} className='label'>입고증</Col>
                <Col xs={12} lg={20}></Col>
            </Row>


        </Wrapper>
    );

});

export default index;
