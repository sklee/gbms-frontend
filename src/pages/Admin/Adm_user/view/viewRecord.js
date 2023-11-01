/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { Button, Row, Col, Modal, Pagination } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';
// import * as wjGridFilter from '@grapecity/wijmo.grid.filter';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";

import { toJS } from 'mobx';

import * as FlexLayout from 'flexlayout-react';
import '/node_modules/flexlayout-react/style/light.css';

const Wrapper = styled.div`
  width: 100%;
  .wj-flexgrid .wj-state-sticky .wj-header {opacity : unset;}

`;


const ViewRecord = observer(({ idx, tab }) => {
    const { commonStore } = useStore();

    const state = useLocalStore(() => ({
        data: [],
        idx : '',
        tab: '',
        gridFilter:null,

    }));

    useEffect(() => { 
        state.idx = idx;
        state.tab = tab;
        if(tab == "record"){
            fetchData(idx);
        }
        
    }, [idx, tab]);

    const fetchData = useCallback(async (idx) => {
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/users-activity/'+idx,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            },
        )
      
        if (result.data.data) {
            state.data =result.data.data;       
        }
        
        
        
    }, []);

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["name","email","job_category"];
    };

    const initGrid = (grid) => {
        grid.rowHeaders.columns.splice(0, 1); // no extra columns

        state.gridFilter =new wjFilter.FlexGridFilter(grid);

        grid.autoGenerateColumns = false;

        // grid.formatItem.addHandler((s, e) => {
        //     if (e.panel == s.columnHeaders) {
        //         let col = s.columns[e.col];
        //         if(col.binding == "date" || col.binding == "ip" ){
        //             var html = e.cell.innerHTML;
        //             e.cell.innerHTML = '<div class="nofilter">' + html + '</div>';
        //         }
        //     }
        // })
    };


    return (
        <Wrapper>
            <Row>
                <FlexGrid
                    itemsSource={state.data}
                    initialized={(s) => initGrid(s)}
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                    <FlexGridColumn binding="name" header="이름" width={200} isReadOnly={true}/>
                    <FlexGridColumn binding="email" header="계정"  width={200} isReadOnly={true} />
                    <FlexGridColumn binding="job_category" header="작업 구분"   width="*" minWidth={200} isReadOnly={true}/>
                    <FlexGridColumn binding="created_at" header="작업 일시"  width={200} isReadOnly={true}/>
                    <FlexGridColumn binding="ip" header="IP"  width={200} isReadOnly={true}/>
                </FlexGrid>
            </Row>
        </Wrapper>
    );
});

export default ViewRecord;
