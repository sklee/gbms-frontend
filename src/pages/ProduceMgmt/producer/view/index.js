/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Drawer, Tabs, Button } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react'
import ProducerInfo from './producerInfo.js'
import History from './viewHistory'

const View = observer(({ idx, viewVisible, popoutChk, drawerChk, viewOnClose, popoutClose } ) => {
    const router = useHistory();
    const state = useLocalStore(() => ({
        isRender: false,
        tab: 'info',
        idx: '',
        popoutChk: '',  //팝업체크
        title : '',
        infoTitle : '기본, 세금/계좌 정보',
        drawerback: 'drawerWrap'
    }));

    const handleChangeTab = React.useCallback((key) => {
        state.tab = key;
    }, []);

    React.useEffect(() => { 
        // sessionChk('ProduceMgmtView');
        state.idx = idx;
        state.popoutChk = popoutChk;
    }, [idx]);


    React.useEffect(() => {
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
        <>
            {viewVisible === true && popoutChk !== 'Y'
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
                        <Tabs.TabPane tab="기본 정보" key="info">
                            <ProducerInfo idx={idx} popoutCloseVal={visibleClose} drawerChk={drawerChk}/>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="정산 내역" key="viewprd">
                            {/* <Viewprd idx={state.idx}  type={state.type}  tab={state.tab}/> */}
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="변경 이력" key="history">
                            <History idx={state.idx} />
                        </Tabs.TabPane>
                    </Tabs>
                </Drawer>
                </>
                :
                <> 
                    <Tabs activeKey={state.tab} onChange={handleChangeTab}>
                        <Tabs.TabPane tab="기본 정보" key="info">
                            <ProducerInfo idx={idx} popoutCloseVal={popoutCloseVal} popoutChk={popoutChk} drawerChk={drawerChk}/>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="정산 내역" key="viewprd">
                            {/* <Viewprd idx={state.idx}  type={state.type}  tab={state.tab}/> */}
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="변경 이력" key="history">
                            <History idx={state.idx} />
                        </Tabs.TabPane>
                    </Tabs>  
                </>
            }
        </>
    );
});

export default View;