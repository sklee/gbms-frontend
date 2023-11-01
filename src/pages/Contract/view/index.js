/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect,useState } from 'react';
import { useHistory } from 'react-router-dom';
import {  Drawer, Tabs, Button, Modal, Space} from 'antd';
import { CloseOutlined, ShrinkOutlined, ArrowsAltOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';


import History from './viewHistory';
import PayList from './viewPay';
import Contracts from './viewContracts';
import Overseas from './viewOverseas';

const { TabPane } = Tabs;
  
const Wrapper = styled.div`
    width: 100%;
`;


const View = observer(({ idx, type, popoutChk, popoutClose ,viewVisible, viewOnClose, drawerChk, refChK } ) => {
    const router = useHistory();
    const { commonStore } = useStore();
    const state = useLocalStore(() => ({
        drawerback : 'drawerWrap', //drawer class name
        isRender: false,
        tab: 'info',

        idx: '',
        type: '',
        popoutChk: '',  //팝업 체크
        tabChk: '',  //탭 체크
        title : '',
        infoTitle : '계약 정보'
    }));

    const handleChangeTab = useCallback((key) => {
        state.tab = key;
    }, []);

    useEffect(() => { 
        state.idx = idx;
        state.type = type;
        state.popoutChk = popoutChk;
        if(popoutChk!=='Y'&&drawerChk!=='Y'){
            state.tabChk = 'Y';
        }else{
            state.tabChk = 'N';
        }
        if(refChK=='Y'){
            state.tabChk = 'V';
        }
        if(type === 'contracts'){
            state.title = '직계약';
            state.infoTitle = '계약 정보';
        }else if(type === 'overseas'){
            state.title = '해외 수입';
            state.infoTitle = '계약 정보';
        }else{
            state.title = '';
            state.infoTitle = '';
        }
    }, [idx, type]);


    useEffect(() => {
        if (router.location.query && router.location.query.tab) {
            state.tab = `${router.location.query.tab}`;
        }
    }, [router.location]);

    //drawer close
    const visibleClose = () => {
        // viewOnClose(false);
        if(popoutChk==='Y'){
            popoutClose(false);
        }else{
            viewOnClose(false);
        }
    };

    const drawerClass=(data)=>{
        if(data === 'drawerback'){
            state.drawerback = 'drawerback drawerWrap';
        }else{
            state.drawerback = 'drawerWrap';
        }          
    }

    const [ drawerExtended, setDrawerExtended ] = useState(false);
    const drawerSizeHandler = () => {
        if(drawerExtended){
            setDrawerExtended(false);
            state.drawerback = 'drawerWrap';
            
        } else {
            setDrawerExtended(true);
            state.drawerback = 'drawerback drawerWrap';
        }
    }

    return (
        <Wrapper>
            {viewVisible === true
                ?
                    <Drawer
                        title='보기/수정'
                        placement='right'
                        onClose={visibleClose}
                        visible={viewVisible}
                        className={state.drawerback}
                        closable={false}
                        keyboard={false}
                        extra={
                            <>
                                <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                                    {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                                </Button>
                                <Button onClick={visibleClose}>
                                    <CloseOutlined />
                                </Button>
                            </>
                        }
                    >   
                        <Tabs activeKey={state.tab} onChange={handleChangeTab}>
                            <TabPane tab={state.infoTitle} key="info">
                            {state.type === 'contracts' ?
                                <Contracts idx={state.idx} type={state.type} onClose={visibleClose} tabChk={state.tabChk} drawerClass={drawerClass} drawerChk={drawerChk}/>
                                : (state.type === 'overseas' ?
                                    <Overseas idx={state.idx} type={state.type} onClose={visibleClose} tabChk={state.tabChk} drawerClass={drawerClass} drawerChk={drawerChk}/>
                                    :<></>
                                )
                            }
                            </TabPane>
                            <TabPane tab={'저작권료 지급 내역'} key="payList">
                                <PayList idx={state.idx}  type={state.type}  tab={state.tab}/>
                            </TabPane>
                            <TabPane tab="변경 이력" key="history">
                                <History idx={state.idx}  type={state.type} tab={state.tab}/>
                            </TabPane>
                        </Tabs>
                    </Drawer>
                :  
                    <Tabs activeKey={state.tab} onChange={handleChangeTab}>
                        <TabPane tab={state.infoTitle} key="info" >
                            {state.type === 'contracts' ?
                                <Contracts idx={state.idx} type={state.type} onClose={visibleClose} tabChk={state.tabChk} drawerClass={drawerClass} drawerChk={drawerChk}/>
                                : (state.type === 'overseas' ?
                                    <Overseas idx={state.idx} type={state.type} onClose={visibleClose} tabChk={state.tabChk} drawerClass={drawerClass} drawerChk={drawerChk}/>
                                    :<></>
                                )
                            }
                        </TabPane>
                            <TabPane tab="저작권료 지급 내역" key="payList">
                                <PayList idx={state.idx}  type={state.type}  tab={state.tab}/>
                            </TabPane>
                        <TabPane tab="변경 이력" key="history">
                            <History idx={state.idx}  type={state.type} tab={state.tab}/>
                        </TabPane>       
                    </Tabs>  
            }
        </Wrapper>
    );
});

export default View;