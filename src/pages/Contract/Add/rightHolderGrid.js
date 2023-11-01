import React, { useEffect, useState } from 'react';
import {Button, Row, Col, Popover } from 'antd';
import { QuestionOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';
import { toJS } from 'mobx';

import OverseasInfo from './overseasTabInfo';
import ContractInfo from './contractInfo';
import ViewOverseasInfo from '../view/overseasInfo';
import ViewOverseasContents from '../view/overseasContents';


const RightHolderGrid = observer((props) => {

    const state = useLocalStore(() => ({
        list: [],
        dataInfo : {},
        flex: null,
    }));

    const tooltipData = (
        <div>
            <p>- 권리자 선택 후 계약 정보를 입력할 수 있습니다.</p>
            <p>-이 계약의 당사자인 해외 수입 권리자,<br/>(필요한 경우) 중개자가 미리 등록되어 있어야 합니다.</p>
        </div>
    );

    useEffect(()=>{
        state.list = props.gridList;
    },[props.gridList]);

    const initGrid = (grid) => {
        state.flex= grid;

        let extraRow = new wjGrid.Row();
        extraRow.allowMerging = true;
        let panel = grid.columnHeaders;
        panel.rows.splice(0, 0, extraRow);

        for (let colIndex = 0; colIndex <= 4; colIndex++) {
            if(colIndex >= 2&& colIndex <= 4){ 
                panel.setCellData(0, colIndex, '계약 만료일');
            } else {
                let col = grid.getColumn(colIndex);
                col.allowMerging = true;
                panel.setCellData(0, colIndex, col.header);
            }   
        }

        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
                let col = s.columns[e.col];
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + '<br/>' + html.split('\\n')[1] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;

                switch (col.binding) {
                    case 'name':
                        let name ='<button id="btnLink" class="btnLink title">' + item[col.binding] +'</button>';
                        e.cell.innerHTML ='<div class="incell">'+name +' ' +document.getElementById('tplBtnViewMode').innerHTML+'</div>';
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
                        contractInfoOpen(item.id);
                        break;
                }
            }
        });
    };

    const contractInfoOpen = (idx) => {
        state.dataInfo = toJS(state.list).find(e=> e.id === idx)
        props.contractDrawerOpen();
    }

    return (
        <>
            <Row>
                <Col span={24} className="topTable_right" style={{position: 'relative', margin: '20px 0 10px'}} >
                    <div className="table_title" style={{ top: 0 }}>권리자</div>
                    <Button className="btn btn-primary btn_add" shape="circle" onClick={()=>props.searchDrawerOpen('overseas')}>+</Button>
                    <Popover placement="topRight" content={tooltipData}>
                        <Button
                            shape="circle"
                            icon={
                                <QuestionOutlined
                                    style={{ fontSize: '11px' }}
                                />
                            }
                            size="small"
                            style={{ marginLeft: '5px' }}
                        />
                    </Popover>
                </Col>
                <Col span={24}>
                    <FlexGrid
                        itemsSource={state.list} 
                        initialized={(s) => initGrid(s)}
                        selectionMode="None"
                        headersVisibility="Column"
                        allowMerging="ColumnHeaders"
                        autoRowHeights={true}
                        isReadOnly={true}
                    >
                        <FlexGridColumn header='권리자' binding='name' width="*" minWidth={120} />
                        <FlexGridColumn header='계약 상태' binding='status' width={120} />
                        <FlexGridColumn header='종이책' binding='book' width={120} />
                        <FlexGridColumn header='전자책' binding='ebook' width={120} />
                        <FlexGridColumn header='오디오북' binding='audio' width={120} />
                    </FlexGrid>
                </Col>
            </Row>

            <div id="tplBtnViewMode">
                <div className="btnLayoutWrap">
                    <button
                        id="btnNew"
                        className="btn-layout ant-btn ant-btn-circle"
                    >
                        N
                    </button>
                </div>
            </div>
            
            {props.contractDrawerVisible &&
                <>{props.viewPage ? (
                    props.checkStatus === 'C' ? (
                    <>
                        {state.dataInfo.add_chk ?
                        <ViewOverseasInfo 
                            {...props} 
                            dataInfo={state.dataInfo}
                        />
                        :
                        <ViewOverseasContents 
                            {...props} 
                            dataInfo={state.dataInfo}
                        />
                        }
                    </>
                    ) : 
                        <ViewOverseasInfo 
                            {...props} 
                            dataInfo={state.dataInfo}
                        />
                ) : 
                    <OverseasInfo 
                        {...props} 
                        dataInfo={state.dataInfo}
                    />
                    // <ContractInfo
                    //     {...props} 
                    //     dataInfo={state.dataInfo}
                    // />
                }</>
            }
        </>
    )
})

export default RightHolderGrid;