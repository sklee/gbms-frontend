import React, {useCallback} from 'react'
import { Tabs } from 'antd';
import { observer, useLocalStore } from 'mobx-react';

import Request from './request';
import Status from './status';
import History from './history';

const { TabPane } = Tabs;

const index = observer((props) => {

	const state = useLocalStore(() => ({
		isRender: false,
		tab: 'request',
	}));

    const handleChangeTab = useCallback((key) => {
        state.tab = key;
    }, []);

	return (
		<Tabs activeKey={state.tab} onChange={handleChangeTab}>
			<TabPane tab="이동 요청" key="request">
				<Request tab={state.tab} />
			</TabPane>
			<TabPane tab="이동 현황/확정" key="status">
				<Status tab={state.tab} />
			</TabPane>
			<TabPane tab="이동 내역" key="breakdown">
				<History tab={state.tab} />
			</TabPane>
		</Tabs>
	);
})

export default index;
