/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect,useState } from 'react';
import { useHistory } from 'react-router-dom';
import {  Drawer, Tabs, Button, Modal, Space} from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';

// import sessionChk from "@components/Common/Js/sessionChk";

import BasicComp from './basic';
import DetailComp from './detail';
import Composition from './composition';
import Process from './process';
import Edition from './edition';
import Overbuying from './overbuying';
import Accident from './accident';
import AccidentCont from './accidentCont';

const { TabPane } = Tabs;
  
const Wrapper = styled.div`
    width: 100%;
`;

const produceMgmtCodeView = observer((props ) => {
    const router = useHistory();
    const { commonStore } = useStore();
    const state = useLocalStore(() => ({
        isRender: false,
        tab: 'basic',
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
                <TabPane tab="상품 기본 구성" key="basic">
                    <BasicComp tab={state.tab} />
                </TabPane>
                <TabPane tab="상품 세부 구성" key="detail">
                    <DetailComp tab={state.tab} />
                </TabPane>
                <TabPane tab="상품 구성 방식" key="composition">
                    <Composition tab={state.tab} />
                </TabPane>
                <TabPane tab="공정" key="process">
                    <Process tab={state.tab} />
                </TabPane>
                <TabPane tab="판형" key="edition">
                    <Edition tab={state.tab} />
                </TabPane>
                <TabPane tab="1대당 여분 매수" key="overBuying">
                    <Overbuying tab={state.tab} />
                </TabPane>
                <TabPane tab="사고 분류" key="accident">
                    <Accident tab={state.tab} />
                </TabPane>
                <TabPane tab="사고 내용 템플릿" key="accidentCont">
                    <AccidentCont tab={state.tab} />
                </TabPane>
            </Tabs>
        </Wrapper>
    );
});

export default produceMgmtCodeView;