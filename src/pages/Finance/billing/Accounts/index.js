/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect,useState } from 'react';
import { useHistory } from 'react-router-dom';
import {  Drawer, Tabs, Button, Modal, Space} from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';

import sessionChk from "@components/Common/Js/sessionChk";


import BillingAccounts from './billingAccounts';
import BillingAdvertising from './billingAdvertising';
import BillingUsers from './billingUsers';


const { TabPane } = Tabs;
  
const Wrapper = styled.div`
    width: 100%;
`;


const BillingAccountsTab = observer((props ) => {
    const router = useHistory();
    const { commonStore } = useStore();
    const state = useLocalStore(() => ({
        isRender: false,
        tab: 'billingAccounts',
    }));

    const handleChangeTab = useCallback((key) => {
        state.tab = key;
    }, []);

    useEffect(() => {
    }, []);


    useEffect(() => {
        if (router.location.query && router.location.query.tab) {
            state.tab = `${router.location.query.tab}`;
        }
    }, [router.location]);
    

    return (
        <Wrapper>           
            <Tabs activeKey={state.tab} onChange={handleChangeTab}>
                <TabPane tab="정기 거래처" key="billingAccounts">
                    <BillingAccounts tab={state.tab}/>
                </TabPane>    
                <TabPane tab="광고비 월 결제" key="billingAdvertising">
                    <BillingAdvertising tab={state.tab}/>
                </TabPane>     
                <TabPane tab="직원 비용" key="billingUsers">
                    <BillingUsers tab={state.tab} />
                </TabPane>  
            </Tabs>  
        </Wrapper>
    );
});

export default BillingAccountsTab;