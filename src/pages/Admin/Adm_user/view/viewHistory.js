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
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";

import { toJS } from 'mobx';

import * as FlexLayout from 'flexlayout-react';
import '/node_modules/flexlayout-react/style/light.css';

const Wrapper = styled.div`
  width: 100%;
  .wj-flexgrid .wj-state-sticky .wj-header {opacity : unset;}

`;


const ViewHistory = observer(({ idx, tab, viewData }) => {
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
        if(tab == "history"){
            fetchData(idx);
        }
        
    }, [idx, tab]);

    const fetchData = useCallback(async (idx) => {
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/users-history/'+idx,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            },
        )
      
        console.log(result);
        if (result.data.data) {
            result.data.data.forEach(e=> {
                // if(e.key === 'use_yn'){
                //     e.key = '사용여부'
                //     if(e.key === "Y"){
                //         e.old_value = "사용"
                //         e.new_value = "사용"
                //     }else{
                //         e.old_value = "미사용"
                //         e.new_value = "미사용"
                //     }
                // }else if(e.key === 'email'){
                //     e.key = '아이디'
                // }else if(e.key === 'name'){
                //     e.key = '이름'
                // }else if(e.key === 'work_state'){
                //     e.key = '근무 상태'
                // }else if(e.key === 'office_phone'){
                //     e.key = '회사 전화번호'
                // }else if(e.key === 'phone'){
                //     e.key = '휴대폰 번호'
                // }else if(e.key === 'department'){
                //     e.key = '부서'
                // // }else if(e.key === 'email'){ //담당업무 컬럼없음
                // //     e.key = '담당 업무'
                // }else if(e.key === 'join_date'){
                //     e.key = '입사일'
                //     e.join_date = e.join_date.substring(0,10)
                // }else if(e.key === 'work_type'){
                //     e.key = '근무 형태'                    
                // }else if(e.key === 'work_place' || e.key === 'start_time' || e.key === 'end_time'){
                //     e.key = '근무시간과 장소' 
                // }else if(e.key === 'gender'){
                //     e.key = '성별'
                // }else if(e.key ==='birthday' ){
                //     e.key = '생년월일'
                // }else if(e.key ==='birthday_lunar'){
                //     e.key = '생일 음력여부'
                // }else if(e.key === 'mbti'){
                //     e.key = 'MBTI'
                // }else if(e.key === 'profile_content'){
                //     e.key = '공개용 프로필'
                // }else if(e.key === 'memo'  ){
                //     e.key = '관리용 메모'
                // }else if(e.key === 'work_state'  ){
                //     e.key = '근무 상태'
                // }else if(e.key === 'is_admin'  ){
                //     e.key = '관리자 여부'
                // }else if(e.key === 'company'  ){
                //     e.key = '계정 구분'
                // }else if(e.key === 'team'  ){
                //     e.key = '팀'
                // }else if(e.key === 'part'  ){
                //     e.key = '실'
                // }else if(e.key === 'role'  ){
                //     e.key = '부서 내 역할'
                // }else if(e.key === 'position'  ){
                //     e.key = '직급'
                // }else if(e.key === 'changed_at'){
                //     e.key = '변경 적용일'
                // }   

                if(e.updated_at){
                    e.updated_at = e.updated_at.substring(0,10)
                }

                e.name = viewData.data.name
                e.email = viewData.data.email
            })
        }
        
        state.data =result.data.data;       
        
    }, []);

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["key"];
    };

    const initGrid = (grid) => {
        grid.rowHeaders.columns.splice(0, 1); // no extra columns

        state.gridFilter =new wjFilter.FlexGridFilter(grid);

        grid.autoGenerateColumns = false;

        // grid.formatItem.addHandler((s, e) => {
        //     if (e.panel == s.columnHeaders) {
        //         let col = s.columns[e.col];
        //         if(col.binding != "key"){
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
                    <FlexGridColumn binding="name" header="이름" width={145} isReadOnly={true}/>
                    <FlexGridColumn binding="email" header="계정"  width={200} isReadOnly={true} />
                    <FlexGridColumn binding="key" header="항목명"  width="*" minWidth={250} isReadOnly={true}/>
                    <FlexGridColumn binding="old_value" header="변경 전"  width={250} isReadOnly={true}/>
                    <FlexGridColumn binding="new_value" header="변경 후"  width={200} isReadOnly={true}/>
                    <FlexGridColumn binding="updated_at" header="변경 적용일"  width={150} isReadOnly={true}/>
                    <FlexGridColumn binding="user_name" header="작업자"  width={100} isReadOnly={true}/>
                </FlexGrid>
            </Row>
        </Wrapper>
    );
});

export default ViewHistory;
