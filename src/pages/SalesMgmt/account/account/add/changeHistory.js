import React, { useState, useCallback } from 'react'
import {Row, Col, Input, Select, Radio, DatePicker, Checkbox, Button, Upload } from 'antd';
import { UploadOutlined, PhoneOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';

import '@grapecity/wijmo.touch'; // support drag/drop on touch devices
import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { Selector } from "@grapecity/wijmo.grid.selector";
import { HeadersVisibility } from "@grapecity/wijmo.grid";
import * as wjcCore from "@grapecity/wijmo";
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import { CollectionView , changeType, DataType, isNumber } from '@grapecity/wijmo';

import styled from 'styled-components';

import BookDrawer from './bookDrawer'

const Wrapper = styled.div`
    width: 100%;
`;
const { Option } = Select;

const payInfo = observer(( props ) => {

    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                division: '사업자 정보',
                itemName: '사업자명',
                before: 'A주식회사',
                after: 'B주식회사',
                changeDate: '2023.10.11',
                worker: '담당자1',
            }
        ],
        flex: null,
    }));

    const initGrid = (grid) => {    
        state.flex = grid

        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                switch (col.binding) {
                    case 'use_yn':
                        break;
                }
            }            
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
            }
        });
    };

    return(
        <Wrapper>
            <Row className="gridWrap">       
                <FlexGrid 
                    itemsSource={state.list} 
                    initialized={(s) => initGrid(s)}
                    allowSorting={false}
                    selectionMode="None"
                    allowDragging="Both"
                    newRowAtTop={true}
                    autoRowHeights={true}
                    headersVisibility="Column"
                >
                    <FlexGridColumn binding="division" header="구분" width={100} />
                    <FlexGridColumn binding="itemName" header="항목명" width="*" minWidth={120} />
                    <FlexGridColumn binding="before" header="변경 전" width={150} />
                    <FlexGridColumn binding="after" header="변경 후" width={150} />
                    <FlexGridColumn binding="changeDate" header="변경일" width={120} />
                    <FlexGridColumn binding="worker" header="작업자" width={100} />
                </FlexGrid>     
            </Row>
            <Row className='table_bot'>
                <div className='btn-group'>
                    <span>행 개수 : {state.list.length}</span>
                </div>
            </Row>

        </Wrapper>
    )
});

export default payInfo;