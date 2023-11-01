/* eslint-disable react-hooks/exhaustive-deps*/
import React        from 'react'
import { observer } from 'mobx-react'
import { Tabs }     from 'antd'
import StandardComp from '@pages/ProduceMgmt/price/standard'
import TypeComp     from '@pages/ProduceMgmt/price/type'
import ColorComp    from '@pages/ProduceMgmt/price/color'
import CorpComp     from '@pages/ProduceMgmt/price/company'
import InfoComp     from '@pages/ProduceMgmt/price/paperInfo'
import EditionComp  from '@pages/ProduceMgmt/price/edition'

const ProduceMgmtPrView = () => {
    const [tab, setTab]     = React.useState('standard')
    const handleChangeTab   = React.useCallback(setTab, [])
    return (
        <Tabs activeKey={tab} onChange={handleChangeTab}>
            <Tabs.TabPane 
                tab="종이 규격"
                key="standard"
            >
                <StandardComp tab={tab} />
            </Tabs.TabPane>

            <Tabs.TabPane 
                tab="종이 종류"
                key="paperType"
            >
                <TypeComp tab={tab} />
            </Tabs.TabPane>

            <Tabs.TabPane 
                tab="종이 색상"
                key="color"
            >
                <ColorComp tab={tab} />
            </Tabs.TabPane>

            <Tabs.TabPane 
                tab="종이 제조사"
                key="company"
            >
                <CorpComp tab={tab} />
            </Tabs.TabPane>

            <Tabs.TabPane 
                tab="종이 정보/가격"
                key="paperInfo"
            >
                <InfoComp tab={tab} />
            </Tabs.TabPane>

            <Tabs.TabPane 
                tab="종이 공급처/할인율"
                key="edition"
            >
                <EditionComp tab={tab} />
            </Tabs.TabPane>
        </Tabs>
    )
}

export default observer(ProduceMgmtPrView)