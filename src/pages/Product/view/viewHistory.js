import React, { useState, useRef } from 'react';
import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { Row, Col, Button, Drawer, Space, Input, Select, Modal } from 'antd';

import * as wjCore from '@grapecity/wijmo';
import { CollectionView } from "@grapecity/wijmo";
import { observer, useLocalStore } from 'mobx-react';


const { Option } = Select;

const OutsideDrawer = observer(( props ) =>{

    React.useEffect(() => {
        theSearch.current.control.grid = theGrid.current.control;
    }, [])

    const theGrid = useRef();
    const theSearch = useRef();

    const state = useLocalStore(() => ({
        list: [
            {
                id: 0,
                division: '기본, 상태 정보',
                ItemName: '정가',
                befor: 14000,
                after: 15000,
                changeDate: '2022-05-20',
                worker: '담당자1',
            },
        ],
        grid: null,
        addCnt: 1,
        addBtn: true,
        currentEditItem: null,
        disuseDataSum: null
    }));

    const initGrid = (grid) => {
        state.grid = grid;

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
        });

    };


    return(
        <>
            <Row className="topTableInfo">
                <FlexGridSearch ref={theSearch} placeholder='검색' />
            </Row>
            <Row id="gridWrap" className="gridWrap">
                <FlexGrid
                    ref={theGrid}
                    itemsSource={state.list}
                    initialized={(s) => initGrid(s)}
                    headersVisibility="Column"
                    isReadOnly={true}
                    allowSorting={false}
                    autoRowHeights={true}
                >
                    <FlexGridColumn binding="division" header="구분" width="*" minWidth={120} />
                    <FlexGridColumn binding="ItemName" header="항목명" width="*" minWidth={120} />
                    <FlexGridColumn binding="befor" header="변경 전" width="*" minWidth={120} align="right"/>
                    <FlexGridColumn binding="after" header="변경 후" width="*" minWidth={120} align="right"/>
                    <FlexGridColumn binding="changeDate" header="변경일" width={100} />
                    <FlexGridColumn binding="worker" header="작업자" width={100} />
                </FlexGrid>
            </Row>
            <Row gutter={10} className="table_bot">
                <span>행 개수 : {state.list.length}</span>
            </Row>
        </>
        
    );
});

export default OutsideDrawer;