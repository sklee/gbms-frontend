import React, { useState, useCallback } from 'react';
import { Row, Tabs } from 'antd';
import { observer, useLocalStore } from 'mobx-react';

import Handling from './handling';
import Original from './original';

const { TabPane } = Tabs;

const index = observer((props) => {

    const [tabKey, setTabKey] = useState('handling');
    const handleChangeTab = useCallback((key) => {
        setTabKey(key);
    }, []);

    return (
        <>
            <Tabs activeKey={tabKey} onChange={handleChangeTab} >
                <TabPane tab="반품 자료와 처리" key="handling">
                    <Handling tab={tabKey} />
                </TabPane>
                <TabPane tab="반품 자료 원본" key="original">
                    <Original tab={tabKey} />
                </TabPane>
            </Tabs>
        </>
    );

});

export default index;
