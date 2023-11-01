/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect,useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Drawer, Tabs, Button } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';

import sessionChk from "@components/Common/Js/sessionChk";

import ViewInfo from './viewInfo';
import History from './viewHistory';
import PayList from './viewPay';

const { TabPane } = Tabs;
  
const Wrapper = styled.div`
    width: 100%;
`;


const View = observer(({ idx,  popoutClose, popoutChk ,viewVisible, viewOnClose,drawerChk ,typeChk} ) => {
    const router = useHistory();
    const { commonStore } = useStore();
    const state = useLocalStore(() => ({
        isRender: false,
        tab: 'info',
        idx: '',
        drawerback : 'drawerWrap',
    }));

    const classChk=(val)=>{
        if(val === 'Y'){
            state.drawerback = 'drawerback drawerWrap';
        }else{
            state.drawerback = 'drawerWrap';
        }
    }

    const handleChangeTab = useCallback((key) => {
        state.tab = key;
    }, []);

    useEffect(() => { 
        sessionChk('authorView');  
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
                            <TabPane tab="기본 정보" key="info">                               
                                <ViewInfo idx={idx}  popoutCloseVal={visibleClose} drawerChk={drawerChk}/>
                            </TabPane>
                            <TabPane tab="지급 내역" key="payList">
                                <PayList idx={state.idx}   tab={state.tab} typeChk={typeChk} classChk={classChk}/>
                            </TabPane>
                            <TabPane tab="변경 이력" key="history">
                                <History idx={state.idx}  tab={state.tab}/>
                            </TabPane>
                        </Tabs>
                    </Drawer>
                </>
                :
                <>    
                    <Tabs activeKey={state.tab} onChange={handleChangeTab}>
                        <TabPane tab='기본 정보' key="info" >                            
                            <ViewInfo idx={idx}  popoutCloseVal={popoutCloseVal} popoutChk={popoutChk}/>                                    
                        </TabPane>
                        <TabPane tab="지급 내역" key="payList">
                            <PayList idx={state.idx}   tab={state.tab} typeChk={typeChk}/>
                        </TabPane>                       
                        <TabPane tab="변경 이력" key="history">
                            <History idx={state.idx}  tab={state.tab}/>
                        </TabPane>       
                    </Tabs>  
                </>
            }
        </Wrapper>
    );
});

export default View;