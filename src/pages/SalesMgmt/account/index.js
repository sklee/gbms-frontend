import React from 'react';
import { Tabs } from 'antd';
import Account from './account/account';
import AccountGroup from './accountGroup/accountGroup'
import Policy from './policy/policy'

const Index = (props) => {
    const [tab, setTab] = React.useState('account')
    return (
        <Tabs activeKey={tab} onChange={setTab}>
            <Tabs.TabPane tab="거래처" key="account">
                <Account tab={tab} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="거래처 그룹" key="accountGroup">
                <AccountGroup tab={tab} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="거래 정책 그룹" key="policy">
                <Policy tab={tab} />
            </Tabs.TabPane>
        </Tabs>
    )
}

export default Index;