/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect,useState } from 'react';
import { useHistory } from 'react-router-dom';
import {  Drawer, Tabs, Button, Modal, Space} from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';

import sessionChk from "@components/Common/Js/sessionChk";

import PaperComp from './paper';
import PrintingComp from './printing';
import BindingComp from './binding'; 
import BindingAddComp from './bindingAdd';
import PostProcessComp from './postProcess';
import AccComp from './acc';
import PackagingComp from './packaging';
import SheetComp from './sheet';
import CoverComp from './cover';
import SaleComp from './sale';

const { TabPane } = Tabs;
const Wrapper = styled.div`
    width: 100%;
`;

const produceMgmtStandard = observer((props ) => {
    const router = useHistory();
    const { commonStore } = useStore();
    const state = useLocalStore(() => ({
        isRender: false,
        tab:'paper',
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
    
    return (
        <Wrapper>
            <Tabs activeKey={state.tab} onChange={handleChangeTab}>
                <TabPane tab="종이" key="paper">
                    <PaperComp tab={state.tab} />
                </TabPane>
                <TabPane tab="인쇄" key="printing">
                    <PrintingComp tab={state.tab} />
                </TabPane>
                <TabPane tab="제본" key="binding">
                    <BindingComp tab={state.tab} />
                </TabPane>
                <TabPane tab="제본 추가작업" key="bindingAdd">
                    <BindingAddComp tab={state.tab} />
                </TabPane>
                <TabPane tab="후가공" key="postProcess">
                    <PostProcessComp tab={state.tab} />
                </TabPane>
                <TabPane tab="부속 제작" key="acc">
                    <AccComp tab={state.tab} />
                </TabPane>
                <TabPane tab="포장" key="packaging">
                    <PackagingComp tab={state.tab} />
                </TabPane>
                <TabPane tab="면지" key="sheet">
                    <SheetComp tab={state.tab} />
                </TabPane>
                <TabPane tab="띠지/커버지" key="cover">
                    <CoverComp tab={state.tab} />
                </TabPane>
                <TabPane tab="판매/재무" key="sale">
                    <SaleComp tab={state.tab} /> 
                </TabPane>
            </Tabs>
        </Wrapper>
    );
});

export default produceMgmtStandard;