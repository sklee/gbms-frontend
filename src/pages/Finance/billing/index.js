/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect,useState } from 'react';
import { useHistory } from 'react-router-dom';
import {  Drawer, Tabs, Button, Modal, Space, Row, Col, Pagination} from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';
import sessionChk from "@components/Common/Js/sessionChk";

import BillingPayments from './billingPayments';
import BillingEvidences from './billingEvidences';
import BillingDeposits from './billingDeposits';

const { TabPane } = Tabs;

const Wrapper = styled.div`
    width: 100%;
`;


const BillingTab = observer((props) => {
    const router = useHistory();
    const state = useLocalStore(() => ({
        isRender: false,
        tab: 'billingPayments',
        type : '',
    }));

    const handleChangeTab = useCallback((key) => {
        state.tab = key;
    }, []);
    

    useEffect(() => { 
        sessionChk('billing');  
    }, []);
    
    useEffect(() => {
        if (router.location.query && router.location.query.tab) {
            state.tab = `${router.location.query.tab}`;
        }
        // props type 분기에 따른 하드코딩 필요해서 추가
        if(props.type == 'billing1'){
            state.type = 1;
        }else if(props.type == 'billing2'){
            state.type = 2;
        }else{
            state.type = props.type;
        }
    }, [router.location]);
    
    return (
        <Wrapper>           
            <Tabs activeKey={state.tab} onChange={handleChangeTab}>
                <TabPane tab="입금 처리" key="billingPayments">
                    {state.type!=='' && <BillingPayments tab={state.tab} type={state.type}/>}
                </TabPane>    
                <TabPane tab="증빙 처리" key="billingEvidences">
                {state.type!=='' && <BillingEvidences tab={state.tab} type={state.type}/> }
                </TabPane>     
                <TabPane tab="입금 내역" key="billingDeposits">
                {state.type!=='' && <BillingDeposits tab={state.tab} type={state.type}/> }
                </TabPane>  
            </Tabs>         
        </Wrapper>
    );
});

export default BillingTab;