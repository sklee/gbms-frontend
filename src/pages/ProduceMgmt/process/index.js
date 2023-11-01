/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect,useState } from 'react';
import { useHistory } from 'react-router-dom';
import {  Drawer, Tabs, Button, Modal, Space} from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';

// import sessionChk from "@components/Common/Js/sessionChk";

import PrePressComp from './prePress';
import PrintEditionComp from './printEdition';
import PrintingComp from './printing';
import BindingComp from './binding';
import BindingAddComp from './bindingAdd';
import PostProcessComp from './postProcess';
import AccComp from './accPrd';
import PackagingComp from './packaging';
import PackingGoods from './packingGoods'

const { TabPane } = Tabs;
  
const Wrapper = styled.div`
    width: 100%;
`;

const produceMgmtProcess = observer((props ) => {
    const router = useHistory();
    const { commonStore } = useStore();
    const state = useLocalStore(() => ({
        isRender: false,
        tab:'prePress',
    }));

    const handleChangeTab = useCallback((key) => {
        state.tab = key;
    }, []);

    useEffect(() => { 
        // sessionChk('authorView');  
    }, []);


    useEffect(() => {
        if (router.location.query && router.location.query.tab) {
            state.tab = `${router.location.query.tab}`;
        }
    }, [router.location]);
    
    return (
        <Wrapper>
            <Tabs activeKey={state.tab} onChange={handleChangeTab}>
                <TabPane tab="PrePress" key="prePress">
                    <PrePressComp tab={state.tab} />
                </TabPane>
                <TabPane tab="인쇄 > 인쇄판" key="printEdition">
                    <PrintEditionComp tab={state.tab} />
                </TabPane>
                <TabPane tab="인쇄 > 인쇄" key="printing">
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
                <TabPane tab="포장 물품 제작" key="packingGoods">
                    <PackingGoods tab={state.tab} />
                </TabPane>
            </Tabs>
        </Wrapper>
    );
});

export default produceMgmtProcess;