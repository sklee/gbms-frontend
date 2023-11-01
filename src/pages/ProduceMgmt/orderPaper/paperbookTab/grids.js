import React from 'react';
import { Row, Col, Button, Input, DatePicker, Popover } from 'antd'
import { observer } from 'mobx-react';

import BasicComp from './basicComp'; // 기본구성
import DetailComp from './detailComp'; // 세부구성
import Process from './process';  // 공정


const index = observer((props) => {
    return(
        <>
            <Row gutter={10} className="table">
                <Col xs={24} lg={3} className="label">상품</Col>
                <Col xs={24} lg={9}></Col>
                <Col xs={24} lg={3} className="label">쇄</Col>
                <Col xs={24} lg={3}></Col>
                <Col xs={24} lg={3} className="label">발주 수량</Col>
                <Col xs={24} lg={3}></Col>
            </Row>
            
            <BasicComp />
            <DetailComp />
            <Process />

            <Row gutter={10} justify="center" style={{ padding: "30px 0 50px" }}>
                <Col>
                    <Button
                        type="primary"
                        htmlType="button"
                        style={{ marginLeft: '10px' }}
                    >
                        확인
                    </Button>
                    <Button  
                        htmlType="button"
                        style={{ marginLeft: '10px' }}
                    >
                        취소
                    </Button>
                </Col>
            </Row>
        </>
    );
});

export default index;