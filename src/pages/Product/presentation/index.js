import React, { useCallback } from 'react';
import { Tabs } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import Request from './request.js';
import Approval from './approval.js';
import Status from './status.js'

const { TabPane } = Tabs;

const Wrapper = styled.div`
    width: 100%;
`;

const index = observer(( props ) => {
    
    const state = useLocalStore(() => ({
        isRender: false,
        tab: 'request',
    }));

    const handleChangeTab = useCallback((key) => {
        state.tab = key;
    }, []);

    return (
        <Wrapper>
            <Tabs activeKey={state.tab} onChange={handleChangeTab}>
                <TabPane tab="증정 신청" key="request">
                    <Request tab={state.tab} />
                </TabPane>
                <TabPane tab="증정 결재" key="approval">
                    <Approval tab={state.tab} />
                </TabPane>
                <TabPane tab="증정 현황" key="status">
                    <Status tab={state.tab} />
                </TabPane>
            </Tabs>
        </Wrapper>
    )
});

export default index;