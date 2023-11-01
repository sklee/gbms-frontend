import React        from 'react'
import { Row, Col, Tabs } from 'antd'
import { inject, observer } from 'mobx-react';
import PrePress     from './prepress'       // prepress
import Paper        from './paper'          // 종이
import Printing     from './printing'       // 인쇄
import BookBinding  from './bookBinding'    // 제본
import Postprocess  from './postprocess'    // 후가공
import Packing      from './packing'        // 포장
import Insert       from './insert'         // 부속 제작
import { ViewContext } from '..';

const Proccess = ({productionData}) => {
    const providerData  = React.useContext(ViewContext)
    const [tabValue, setTabValue] = React.useState("pre")

    return(
        providerData.detailRowIndex !== -1 && providerData.detailRowIndex !== -2 ? 
        <div style={{margin: '30px 0'}}>
            <Row gutter={10} className="table marginTop">
                <div className="table_title">공정</div>
                <Col xs={24} lg={24}>
                    <Tabs activeKey={tabValue} onChange={setTabValue}>
                        <Tabs.TabPane tab="PrePress" key="pre">
                            <PrePress productionData={productionData}/>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="종이" key="paper">
                            <Paper productionData={productionData}/>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="인쇄" key="printing">
                            <Printing productionData={productionData}/>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="제본" key="binding">
                            <BookBinding productionData={productionData}/>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="후가공" key="postprocess">
                            <Postprocess productionData={productionData}/>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="포장" key="packing">
                            <Packing productionData={productionData}/>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="부속 제작" key="insert">
                            <Insert productionData={productionData}/>
                        </Tabs.TabPane>
                    </Tabs>
                </Col>
            </Row>
        </div>
        : <></>
    )
}

export default inject('commonStore')(observer(Proccess))