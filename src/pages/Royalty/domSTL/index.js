import React, {useCallback} from 'react'
import { Tabs } from 'antd';
import { observer, useLocalStore } from 'mobx-react';

import STLData from './stldata';
import STLConfirmed from './stlconfirmed'
import STLDetails from './stldetails'

const { TabPane } = Tabs;

const index = observer((props) => {

	const state = useLocalStore(() => ({
		isRender: false,
		tab: 'stldata',
	}));

    const handleChangeTab = useCallback((key) => {
        state.tab = key;
    }, []);

	return (
		<Tabs activeKey={state.tab} onChange={handleChangeTab}>
			<TabPane tab="정산 자료 생성" key="stldata">
				<STLData tab={state.tab} />
			</TabPane>
			<TabPane tab="정산 확정" key="stlconfirmed">
				<STLConfirmed tab={state.tab} />
			</TabPane>
			<TabPane tab="정산 내역" key="stldetails">
				<STLDetails tab={state.tab} />
			</TabPane>
		</Tabs>
	);
})

export default index;
