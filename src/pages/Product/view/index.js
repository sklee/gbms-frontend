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
import ViewApplication from './viewApplication';
import ViewFile from './viewFile';
import ViewDistribute from './viewDistribute';
import ViewProduce from './viewProduce';
import ViewCopyright from './viewCopyright';
import ViewOutside from './viewOutside';

const { TabPane } = Tabs;
  
const Wrapper = styled.div`
    width: 100%;
`;


const View = observer(({ idx,  popoutClose, popoutChk, viewVisible, viewOnClose, drawerChk, contractType, viewData, pageChke} ) => {
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
        // sessionChk('authorView');  
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
                            <TabPane tab="기본, 상태 정보" key="info">
                                <ViewInfo idx={idx}   popoutCloseVal={visibleClose} drawerChk={drawerChk} drawerClass={drawerClass} viewData={viewData} pageChke={pageChke}/>
                            </TabPane>
                            {contractType === '2' &&
                                <TabPane tab="원서 정보" key="application">
                                    <ViewApplication idx={state.idx} tab={state.tab} viewData={viewData}/>
                                </TabPane>
                            } 
                            <TabPane tab="제작 정보" key="2">
                                <ViewProduce idx={state.idx} tab={state.tab} viewData={viewData}/> 
                            </TabPane>
                            <TabPane tab="데이터(파일)" key="file">
                                <ViewFile idx={state.idx} tab={state.tab} viewData={viewData} popoutCloseVal={visibleClose}/>
                            </TabPane>
                            <TabPane tab="유통 정보" key="4">
                                <ViewDistribute idx={state.idx} tab={state.tab} viewData={viewData}/> 
                            </TabPane>
                            <TabPane tab="저작권 정보" key="authorInfo">
                                <ViewCopyright idx={state.idx} tab={state.tab} viewData={viewData}/> 
                            </TabPane>
                            <TabPane tab="외부 판매 정보" key="6">
                                <ViewOutside idx={state.idx} tab={state.tab} viewData={viewData}/> 
                            </TabPane>
                            <TabPane tab="변경 이력" key="history">
                                <History idx={state.idx} tab={state.tab} />
                            </TabPane>
                        </Tabs>
                    </Drawer>
                </>
                :
                <>    
                    <Tabs activeKey={state.tab} onChange={handleChangeTab}>
                        <TabPane tab="기본, 상태 정보" key="info" >
                            <ViewInfo idx={idx}   popoutCloseVal={popoutCloseVal} popoutChk={popoutChk} viewData={viewData} pageChke={pageChke}/>
                        </TabPane>
                        {contractType === '2' &&
                            <TabPane tab="원서 정보" key="application">
                                <ViewApplication idx={state.idx} tab={state.tab} viewData={viewData}/>
                            </TabPane> 
                        }
                        <TabPane tab="제작 정보" key="2">
                            <ViewProduce idx={state.idx}    tab={state.tab}/> 
                        </TabPane> 
                        <TabPane tab="데이터(파일)" key="dataFile">
                            <ViewFile idx={state.idx} tab={state.tab} viewData={viewData} popoutCloseVal={visibleClose}/>
                        </TabPane> 
                        <TabPane tab="유통 정보" key="4">
                            <ViewDistribute idx={state.idx} tab={state.tab}/> 
                        </TabPane> 
                        <TabPane tab="저작권 정보" key="authorInfo">
                            <ViewCopyright idx={state.idx} tab={state.tab}/>
                        </TabPane> 
                        <TabPane tab="외부 판매 정보" key="6">
                            <ViewOutside idx={state.idx} tab={state.tab}/>
                        </TabPane>                           
                        <TabPane tab="변경 이력" key="history">
                            <History idx={state.idx}   tab={state.tab}/>
                        </TabPane>       
                    </Tabs>  
                </>
            }
        </Wrapper>
    );
});

export default View;