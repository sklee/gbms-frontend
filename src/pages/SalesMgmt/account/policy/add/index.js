import React, { useState, useCallback } from 'react';
import { Drawer, Button, Tabs } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';

import BasicPolicy from './basicPolicy';
import PrdPolicy from './prdPolicy';

import styled from 'styled-components';

const { TabPane } = Tabs;

const Wrapper = styled.div`
    width: 100%;
    #tplBtnViewMode {
        display: none;
    }
`;

const Add = ( { drawerVisible, drawerClose, rowData } ) => {

    const state = useLocalStore(() => ({
        drawerback : 'drawerWrap',
        tab: 'basicPolicy',
    }));

    const handleChangeTab = useCallback((key) => {
        state.tab = key;
    }, []);

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
            <Drawer
                title='거래처 목록'
                placement='right'
                onClose={drawerClose}
                visible={drawerVisible}
                className={state.drawerback}
                closable={false}
                keyboard={false}
                extra={
                    <>
                        <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={drawerClose}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >
                <Tabs activeKey={state.tab} onChange={handleChangeTab}>
                    <TabPane tab="기본 정책" key="basicPolicy">
                        <BasicPolicy rowData = {rowData} drawerClose={drawerClose} />
                    </TabPane>
                    <TabPane tab="상품별 정책" key="prdPolicy">
                        <PrdPolicy   rowData = {rowData}/>
                    </TabPane>
                </Tabs>
            </Drawer>
        </Wrapper>
        
    )
}

export default observer(Add)