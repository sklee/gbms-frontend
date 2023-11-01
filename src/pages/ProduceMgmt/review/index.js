import React 		from 'react'
import { Tabs } 	from 'antd'
import NewBook 		from '@pages/ProduceMgmt/review/newBook'
import Reprinting 	from '@pages/ProduceMgmt/review/reprinting'

const ReviewMgmt = () => {
	const [tab, setTab] 	= React.useState("newBook")
    const handleChangeTab 	= React.useCallback(setTab, [])
	return (
		<Tabs activeKey={tab} onChange={handleChangeTab}>
			<Tabs.TabPane tab="신간(시뮬레이션)" key="newBook">
				<NewBook/>
			</Tabs.TabPane>
			<Tabs.TabPane tab="재쇄" key="reprinting">
				<Reprinting/>
			</Tabs.TabPane>
		</Tabs>
	)
}

export default ReviewMgmt
