import React, { useCallback } from 'react';
import { Tabs } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import Handling from './handling';
import Status from './status'

const { TabPane } = Tabs;

const Wrapper = styled.div`
    width: 100%;
`;

const index = observer(( props ) => {
    
    const state = useLocalStore(() => ({
        isRender: false,
        tab: 'handling',
    }));

    const handleChangeTab = useCallback((key) => {
        state.tab = key;
    }, []);

    return (
        <Wrapper>
            <Tabs activeKey={state.tab} onChange={handleChangeTab}>
                <TabPane tab="증정 처리" key="handling">
                    <Handling tab={state.tab} />
                </TabPane>
                <TabPane tab="증정 현황" key="status">
                    <Status tab={state.tab} />
                </TabPane>
            </Tabs>
        </Wrapper>
    )
});

export default index;