/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect,useState } from 'react';
import { useHistory } from 'react-router-dom';
import {  Drawer, Tabs, Button, Modal, Space} from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';

// import sessionChk from "@components/Common/Js/sessionChk";

import CopyrightsInfo from './info/copyrightsInfo';
import ContributorsInfo from './info/contributorsInfo';
import BrokersInfo from './info/brokersInfo';
import OwnersInfo from './info/ownersInfo';

import History from './viewHistory';
import Viewprd from './viewPrd';
import PayList from './viewPay';

const { TabPane } = Tabs;
  
const Wrapper = styled.div`
    width: 100%;
`;


const View = observer(({ idx, type, popoutClose, popoutChk ,viewVisible, viewOnClose,drawerChk } ) => {
    const router = useHistory();
    const { commonStore } = useStore();
    const state = useLocalStore(() => ({
        isRender: false,
        tab: 'info',
        drawerback : 'drawerWrap', //drawer class name
        idx: '',
        type: '',
        popoutChk: '',  //팝업체크
        title : '',
        infoTitle : '기본, 세금/계좌 정보'
    }));

    const drawerClass=(data)=>{
        if(data === 'drawerback'){
            state.drawerback = 'drawerback drawerWrap';
        }else{
            state.drawerback = 'drawerWrap';
        }          
    };

    const handleChangeTab = useCallback((key) => {
        state.tab = key;
    }, []);

    useEffect(() => { 
        // sessionChk('authorView');  
        state.idx = idx;
        state.type = type;
        state.popoutChk = popoutChk;
        if(type === 'copyrights'){
            state.title = '저작권';
        }else if(type === 'contributors'){
            state.title = '기여자';
            state.infoTitle = '기본 정보';
        }else if(type === 'brokers'){
            state.title = '중개';
        }else{
            state.title = '권리';
            state.infoTitle = '기본, 세금 정보';
        }
    }, [idx, type]);


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
                                {state.type === 'copyrights' 
                                    ? <CopyrightsInfo idx={idx}  type={state.type} popoutCloseVal={visibleClose} drawerChk={drawerChk}/>
                                    : state.type ==='contributors'
                                        ? <ContributorsInfo idx={idx}  type={state.type} popoutCloseVal={visibleClose} drawerChk={drawerChk}/>
                                        : state.type === 'owners'
                                            ? <OwnersInfo idx={idx}  type={state.type} popoutCloseVal={visibleClose} drawerChk={drawerChk}/>
                                            : <BrokersInfo idx={idx}  type={state.type} popoutCloseVal={visibleClose} drawerChk={drawerChk}/>
                                }
                            </TabPane>
                            <TabPane tab={state.title+' 지정 상품'} key="viewprd">
                                <Viewprd idx={state.idx}  type={state.type}  tab={state.tab} drawerChk='Y' drawerClass={drawerClass}/>
                            </TabPane>

                            {/* 1차 테스트로 인해 잠시 주석 */}
                            {/* {state.type != 'contributors' &&
                                <TabPane tab="저작권료 지급 내역" key="payList">
                                    <PayList idx={state.idx}  type={state.type}  tab={state.tab}/>
                                </TabPane>
                            }
                            
                            <TabPane tab="변경 이력" key="history">
                                <History idx={state.idx}  type={state.type} tab={state.tab}/>
                            </TabPane> */}
                        </Tabs>
                                         
                  </Drawer>
                </>
                :
                <>    
                    <Tabs activeKey={state.tab} onChange={handleChangeTab}>
                        <TabPane tab={state.infoTitle} key="info" >
                            {state.type === 'copyrights' ? (
                                <CopyrightsInfo idx={idx} type={state.type} popoutCloseVal={popoutCloseVal} popoutChk={popoutChk}/>
                            ) : state.type ==='contributors' ? (
                                <ContributorsInfo idx={idx} type={state.type} popoutCloseVal={popoutCloseVal} popoutChk={popoutChk}/>
                            ) : state.type === 'owners' ? (
                                <OwnersInfo idx={idx} type={state.type} popoutCloseVal={popoutCloseVal} popoutChk={popoutChk}/>
                            ) : (
                                <BrokersInfo idx={idx} type={state.type} popoutCloseVal={popoutCloseVal} popoutChk={popoutChk}/>
                            )}
                        </TabPane>
                        <TabPane tab={state.title+' 지정 상품'} key="viewprd">
                            <Viewprd idx={state.idx}  type={state.type}  tab={state.tab} drawerChk='Y' drawerClass={drawerClass}/>
                        </TabPane>
                        {/* 1차 테스트로 인해 잠시 주석 */}
                        {/* {state.type != 'contributors' &&
                            <TabPane tab="저작권료 지급 내역" key="payList">
                                <PayList idx={state.idx}  type={state.type}  tab={state.tab}/>
                            </TabPane>
                        }
                        
                        <TabPane tab="변경 이력" key="history">
                            <History idx={state.idx}  type={state.type} tab={state.tab}/>
                        </TabPane>        */}
                    </Tabs>  
                </>
            }
        </Wrapper>
    );
});

export default View;