/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {  Drawer, Tabs, Button, Modal, Space} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';


import ViewInfo from './viewInfo';
import History from './viewHistory';
import ViewRecord from './viewRecord.js';


const { TabPane } = Tabs;
  
const Wrapper = styled.div`
    width: 100%;
`;


const View = observer(({ idx,  popoutClose, popoutChk ,viewVisible, viewOnClose, drawerChk, viewData } ) => {
    const router = useHistory();
    const { commonStore } = useStore();
    const state = useLocalStore(() => ({
        isRender: false,
        tab: 'info',
        drawerback : 'drawerWrap', //drawer class name

        idx: '',
    }));

    const handleChangeTab = useCallback((key) => {
        state.tab = key;
    }, []);

    useEffect(() => { 
        state.idx = idx;
    }, [idx]);


    useEffect(() => {
        if (router.location.query && router.location.query.tab) {
            state.tab = `${router.location.query.tab}`;
        }
    }, [router.location]);


    //팝업 close
    const popoutCloseVal = (val) => {
        if(val == "Y"){
            popoutClose();
        }           
    }

    //drawer close
    const visibleClose = () => {
        viewOnClose(false);
    };

    const drawerClass=(data)=>{
        if(data === 'drawerback'){
            state.drawerback = 'drawerback drawerWrap';
        }else{
            state.drawerback = 'drawerWrap';
        }          
    }

    return (
        <Wrapper>
            {viewVisible === true
                ?
                <> 
                    <Drawer
                        title='보기/수정'
                        placement='right'
                        onClose={visibleClose}
                        visible={viewVisible}
                        className={state.drawerback}
                        closable={false}
                        keyboard={false}
                        extra={
                            <Button onClick={visibleClose}>
                                <CloseOutlined />
                            </Button>
                        }
                    >   

                        <Tabs activeKey={state.tab} onChange={handleChangeTab}>
                            <TabPane tab="기본 정보" key="info">
                                <ViewInfo idx={idx} tab="info" popoutCloseVal={visibleClose} drawerChk={drawerChk} drawerClass={drawerClass} viewData={viewData}/>
                            </TabPane>
                            <TabPane tab="변경 이력" key="history">
                                <History idx={idx} tab="history" popoutCloseVal={visibleClose} drawerChk={drawerChk} drawerClass={drawerClass} viewData={viewData} />
                            </TabPane>
                            <TabPane tab="사용 기록" key="record">
                                <ViewRecord idx={idx} tab="record" popoutCloseVal={visibleClose} drawerChk={drawerChk} drawerClass={drawerClass} viewData={viewData}/>
                            </TabPane>
                        </Tabs>
                                         
                  </Drawer>
                </>
                :
                <>    
                    <Tabs activeKey={state.tab} onChange={handleChangeTab}>
                        <TabPane tab="기본 정보" key="info">
                            <ViewInfo idx={idx} tab="info" popoutCloseVal={popoutCloseVal} popoutChk={popoutChk} viewData={viewData} />
                        </TabPane>
                        <TabPane tab="변경 이력" key="history">
                            <History idx={idx} tab="history" popoutCloseVal={visibleClose} drawerChk={drawerChk} drawerClass={drawerClass} viewData={viewData} />
                        </TabPane>
                        <TabPane tab="사용 기록" key="record">
                            <ViewRecord idx={idx} tab="record" popoutCloseVal={visibleClose} drawerChk={drawerChk} drawerClass={drawerClass} viewData={viewData}/>
                        </TabPane>
                    </Tabs>  
                </>
            }
        </Wrapper>
    );
});

export default View;