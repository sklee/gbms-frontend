import React, { useState } from 'react';
import {Button, Row, Col} from 'antd';
import { observer, useLocalStore } from 'mobx-react';

import { FlexGrid, FlexGridColumn, FlexGridColumnGroup, FlexGridCellTemplate } from '@grapecity/wijmo.react.grid';
import { CollectionView } from "@grapecity/wijmo";
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';


const searchGrid = observer(({ drawerClose }) => {

    const state = useLocalStore(() => ({
        list: [
            {   
                id: 0,
                prdCode : 'GB1234',
                prdName:  '전천당 1권',
                stock:  280,
                sum: 2000,
                fairQuality: 1500,
                recycle: 300,
                cover: 200,
                requestedTerm: '',
            },
            {   
                id: 1,
                prdCode : 'GB1234',
                prdName:  '전천당 1권',
                stock:  280,
                sum: 2000,
                fairQuality: 1500,
                recycle: 300,
                cover: 200,
                requestedTerm: '',
            },
        ],
        idx: 0,
        flex: null,
    }));

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
                    case 'fairQuality':
                    case 'recycle':
                    case 'cover':
                    case 'requestedTerm':
                        e.cell.innerHTML = `<input class="ant-input ${col.binding}" name="${item[col.binding]}" id="${col.binding+item.id}" value="${item[col.binding]}"/>`;
                        e.cell['dataItem'] = item;
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            let item = wjCore.closest(e.target, '.wj-cell')?.['dataItem'];
            if (e.target instanceof HTMLButtonElement) {
                switch(e.target.id){

                }
            }
        });

        grid.addEventListener(grid.hostElement, 'input', (e) => {
            let item = wjCore.closest(e.target, '.wj-cell')?.['dataItem'];
            if (e.target instanceof HTMLInputElement) {
                switch(e.target.classList[1]){
                    case 'fairQuality':
                    case 'recycle':
                    case 'cover':
                        state.flex.itemsSource.forEach((row)=>{
                            if(row.id == item.id){
                                row[e.target.classList[1]] = Number(e.target.value);

                                if(row.sum < row.fairQuality + row.recycle + row.cover){
                                    document.querySelector('#fairQuality'+row.id).classList.add('redTxt');
                                    document.querySelector('#recycle'+row.id).classList.add('redTxt');
                                    document.querySelector('#cover'+row.id).classList.add('redTxt');
                                    setButtonStatus(true);
                                } else {
                                    document.querySelector('#fairQuality'+row.id).classList.remove('redTxt');
                                    document.querySelector('#recycle'+row.id).classList.remove('redTxt');
                                    document.querySelector('#cover'+row.id).classList.remove('redTxt');
                                    setButtonStatus(false);
                                }
                            }
                        });
                        break;
                }
            }
        });
    }

    const [ buttonStatus, setButtonStatus ] = useState(false);

    return (
        <>
            <Row className='gridWrap'>
                <FlexGrid
                    itemsSource={state.list} 
                    initialized={(s) => initGrid(s)}
                    allowMerging="ColumnHeaders"
                    headersVisibility="Column"
                    autoRowHeights={true}
                >
                    <FlexGridColumn header='상품코드' binding='prdCode' width={120}/>
                    <FlexGridColumn header='상품명(내부)' binding='prdName' width="*" minWidth={120}/>
                    <FlexGridColumn header='정품 재고' binding='stock' width={120}/>
                    <FlexGridColumn header='합계' binding='sum' width={120}/>
                    <FlexGridColumn header='정품대기' binding='fairQuality' width={120}/>
                    <FlexGridColumn header='재생대기' binding='recycle' width={120}/>
                    <FlexGridColumn header='표지대기' binding='cover' width={120}/>
                    <FlexGridColumn header='요청 사항' binding='requestedTerm' width={120}/>
                </FlexGrid>
            </Row>

            <Row className='table_bot'>
                <div className='btn-group'>
                    <span>행 개수 : {state.list.length}</span>
                </div>
            </Row>
            
            <Row justify='center' style={{margin: '30px 0'}}>
                <Button type='button primary' style={{marginRight: 10}} onClick={drawerClose} disabled={buttonStatus}>확인</Button>
                <Button type='button' >취소</Button>
            </Row>
        </>
    )
})

export default searchGrid;