import React, { useCallback } from 'react';
import { Tabs } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import Application from './application/index'
import Template from './template'

const { TabPane } = Tabs;

const Wrapper = styled.div`
    width: 100%;
`;

const index = observer(( props ) => {
    
    const state = useLocalStore(() => ({
        isRender: false,
        tab: 'application',
    }));

    const handleChangeTab = useCallback((key) => {
        state.tab = key;
    }, []);

    return (
        <Wrapper>
            <Tabs activeKey={state.tab} onChange={handleChangeTab}>
                <TabPane tab="신청과 처리" key="application">
                    <Application tab={state.tab} />
                </TabPane>
                <TabPane tab="배본 템플릿 처리" key="template">
                    <Template tab={state.tab} />
                </TabPane>
            </Tabs>
        </Wrapper>
    )
});

export default index;