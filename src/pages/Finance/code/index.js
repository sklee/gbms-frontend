/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect,useState } from 'react';
import { useHistory } from 'react-router-dom';
import {  Drawer, Tabs, Button, Modal, Space} from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';

import sessionChk from "@components/Common/Js/sessionChk";

import BankCode from './bankCode';
import AccountsCode from './accountsCode';
import ClassificationCode from './classificationCode';
import AccountingCode from './accountingCode';
import BillingClassCode from './billingClassCode';


const { TabPane } = Tabs;
  
const Wrapper = styled.div`
    width: 100%;
`;


const View = observer((props ) => {
    const router = useHistory();
    const { commonStore } = useStore();
    const state = useLocalStore(() => ({
        isRender: false,
        tab: 'accountsCode',

    }));

    const handleChangeTab = useCallback((key) => {
        state.tab = key;
    }, []);

    useEffect(() => { 
        sessionChk('authorView');  
    }, []);


    useEffect(() => {
        if (router.location.query && router.location.query.tab) {
            state.tab = `${router.location.query.tab}`;
        }
    }, [router.location]);
    

    const tabChange = (tab)=>{
        if(tab == 'classificationCode'){
            handleChangeTab('billingClassCode');
        }
    }

    return (
        <Wrapper>           
            <Tabs activeKey={state.tab} onChange={handleChangeTab}>
                <TabPane tab="임직원 계좌" key="accountsCode">
                    <AccountsCode tab={state.tab}/>
                </TabPane>    
                <TabPane tab="은행" key="bank">
                    <BankCode tab={state.tab}/>
                </TabPane>     
                <TabPane tab="비용 청구 분류" key="classificationCode">
                    <ClassificationCode tab={state.tab} tabChange={tabChange}/>
                </TabPane>  
                <TabPane tab="비용 청구 분류와 코드" key="billingClassCode">
                    <BillingClassCode tab={state.tab}/>
                </TabPane> 
                <TabPane tab="회계 계정 코드(도서출판 길벗)" key="gilbutCode">
                    <AccountingCode tab={state.tab} type="1"/>
                </TabPane> 
                <TabPane tab="회계 계정 코드(길벗 스쿨)" key="schoolCode">
                    <AccountingCode tab={state.tab} type="2"/>
                </TabPane> 
            </Tabs>  
        </Wrapper>
    );
});

export default View;