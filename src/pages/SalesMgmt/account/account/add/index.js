import React from 'react'
import { Drawer, Button, Tabs } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';

import BusinessInfo  from '@pages/SalesMgmt/account/account/add/businessInfo'    // 사업자 정보
import TradeInfo     from '@pages/SalesMgmt/account/account/add/tradeInfo'       // 거래 정보
import TradePolicy   from '@pages/SalesMgmt/account/account/add/tradePolicy'     // 거래 정책
import PayInfo       from '@pages/SalesMgmt/account/account/add/payInfo'         // 결제/여신 정보
import SupplyStatus  from '@pages/SalesMgmt/account/account/add/supplyStatus'    // 공급 상태
import BranchInfo    from '@pages/SalesMgmt/account/account/add/branchInfo'      // 지점 정보
import ChangeHistory from '@pages/SalesMgmt/account/account/add/changeHistory'   // 변경 이력

const AccountTabList = ({ drawerVisible, drawerClose, data }) => {
    const state = useLocalStore(() => ({
        drawerback: 'drawerWrap',
    }));

    const [targetId, setTargetId] = React.useState(data.id)
    const [targetCompany, setTargetCompany] = React.useState(data.targetCompany)
    const [ drawerExtended, setDrawerExtended ] = React.useState(false)
    const [tab, setTab] = React.useState('businPerson')
    const handleChangeTab = React.useCallback((key) => {
        setTab(key);
    }, [])
    
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
            <Drawer
                title='거래처(매출) 정보'
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
                <Tabs activeKey={tab} onChange={handleChangeTab}>
                    <Tabs.TabPane tab="사업자 정보" key="businPerson">
                        <BusinessInfo tab={tab}   data={{ accountId : targetId, setAccountId : setTargetId }} drawerClose={drawerClose}/>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="거래 정보" key="tradeInfo"        disabled={!targetId ? true : false}>
                        <TradeInfo tab={tab}      data={{ accountId : targetId, setTargetCompany : setTargetCompany }} drawerClose={drawerClose}/>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="거래 정책" key="tradePolicy"      disabled={!targetId || targetCompany?.length == 0 ? true : false}>
                        <TradePolicy tab={tab}    data={{ accountId : targetId, targetCompany : targetCompany }} drawerClose={drawerClose}/>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="결제/여신 정보" key="payInfo"     disabled={!targetId || targetCompany?.length == 0 ? true : false}>
                        <PayInfo tab={tab}        data={{ accountId : targetId, targetCompany : targetCompany }} drawerClose={drawerClose}/>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="공급 상태" key="supplyStatus"     disabled={!targetId || targetCompany?.length == 0 ? true : false}>
                        <SupplyStatus tab={tab}   data={{ accountId : targetId, targetCompany : targetCompany }} drawerClose={drawerClose}/>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="지점 정보" key="branchInfo"       disabled={!targetId || targetCompany?.length == 0 ? true : false}>
                        <BranchInfo tab={tab}     data={{ accountId : targetId, targetCompany : targetCompany }} drawerClose={drawerClose}/>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="변경 이력" key="changeHistory"    disabled={!targetId || targetCompany?.length == 0 ? true : false}>
                        <ChangeHistory tab={tab}  data={{ accountId : targetId, targetCompany : targetCompany }} drawerClose={drawerClose}/>
                    </Tabs.TabPane>
                </Tabs>
            </Drawer>
        </>
        
    )
}

export default observer(AccountTabList)