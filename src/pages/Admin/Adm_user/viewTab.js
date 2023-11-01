/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Table, Space, Button, Row, Col, Tag, Modal, Breadcrumb, Input, Drawer, Search, Form,Checkbox, Radio, Card,Tabs} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';

import ViewInfo from './viewInfo';
//import History from './history';

const { TabPane } = Tabs;
  
const Wrapper = styled.div`
    width: 100%;
`;


const ViewTab = observer(({id, popoutClose, popoutChk ,viewVisible, viewOnClose} ) => {
    const router = useHistory();
    const { commonStore } = useStore();
    const state = useLocalStore(() => ({
        isRender: false,
        id: '',
        popoutChk: '',
    }));

    const handleChangeTab = useCallback((key) => {
        state.tab = key;
    }, []);

    useEffect(() => { 
        state.id = id;
        state.popoutChk = popoutChk;
    }, [id, popoutChk]);


    useEffect(() => {
        if (router.location.query && router.location.query.tab) {
            state.tab = `${router.location.query.tab}`;
        }
    }, [router.location]);


    const popoutCloseVal = (val) => {
        if(val == "Y"){
            popoutClose();
        }           
    }

    const visibleClose = () => {
        viewOnClose(false);
    };

    return (
        <Wrapper>
            { viewVisible

            ? <Drawer
                    title="보기/수정"
                    placement='right'
                    onClose={visibleClose}
                    visible={viewVisible}
                    className="drawerWrap"
                    keyboard={false}
                    extra={
                    <Button>
                        <CloseOutlined />
                    </Button>
                    }
                >
                    <Tabs activeKey={state.tab} onChange={handleChangeTab}>
                        <TabPane tab="기본 정보" key="info">
                            <ViewInfo id={state.id}  popoutCloseVal={visibleClose} popoutChk="Y"/>
                        </TabPane>
                        <TabPane tab="변경 이력" key="history">
                            {/* <History userid={state.userid}  tab={state.tab}/> */}
                        </TabPane>
                        <TabPane tab="사용 기록" key="useHistory">
                            {/* <UseHistory userid={state.userid}   tab={state.tab}/> */}
                        </TabPane>
                    </Tabs>

              </Drawer>
            : <Tabs activeKey={state.tab} onChange={handleChangeTab}>
                <TabPane tab="기본 정보" key="info" >
                    <ViewInfo id={state.id} popoutCloseVal={popoutCloseVal} popoutChk={state.popoutChk}/>
                </TabPane>
                <TabPane tab="변경 이력" key="history">
                    {/* <History userid={state.userid} tab={state.tab}/> */}
                </TabPane>
                <TabPane tab="사용 기록" key="useHistory">
                    {/* <UseHistory userid={state.userid}  tab={state.tab}/> */}
                </TabPane>
            </Tabs>
        }
        </Wrapper>
    );
});

export default ViewTab;