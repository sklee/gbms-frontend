import React from 'react'
import { Row, Col, Tabs } from 'antd'
import { PaperBookContext } from '..'
import { observer } from 'mobx-react'
import PrePress     from './prepress'     // prepress
import Paper        from './paper'        // 종이
import Printing     from './printing'     // 인쇄
import BookBinding  from './bookBinding'  // 제본
import Postprocess  from './postprocess'  // 후가공
import Packing      from './packing'      // 포장
import Insert       from './insert'       // 부속 제작

const Proccess = () => {
    const providerData  = React.useContext(PaperBookContext)
    const [tabValue, setTabValue] = React.useState("pre")

    return(
        providerData.detailRowIndex !== -1 && providerData.detailRowIndex !== -2 ? 
        <div style={{margin: '30px 0'}}>
            <Row gutter={10} className="table marginTop">
                <div className="table_title">공정</div>
                <Col xs={24} lg={24}>
                    <Tabs activeKey={tabValue} onChange={setTabValue}>
                        <Tabs.TabPane tab="PrePress" key="pre">
                            <PrePress/>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="종이" key="paper">
                            <Paper/>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="인쇄" key="printing">
                            <Printing/>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="제본" key="binding">
                            <BookBinding/>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="후가공" key="postprocess">
                            <Postprocess/>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="포장" key="packing">
                            <Packing/>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="부속 제작" key="insert">
                            <Insert/>
                        </Tabs.TabPane>
                    </Tabs>
                </Col>
            </Row>
        </div>
        :
        <></>
    )
}

export default observer(Proccess)