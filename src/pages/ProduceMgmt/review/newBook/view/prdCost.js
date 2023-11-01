import React from 'react'
import { Row, Col } from 'antd';
import { observer } from 'mobx-react';

const PrdCost = ({viewData}) => {
    return (
        <>
            {/* 면지 사양 */}
            <Row className="table marginTop">
                <div className="table_title">면지 사양</div>
                <Col xs={24} lg={4} className="label">종이</Col>
                <Col xs={24} lg={20}>{viewData?.paper_information?.paper_name}</Col>
                <Col xs={24} lg={4} className="label">면지 배열</Col>
                <Col xs={24} lg={20}>
                    <Row>
                        <Col xs={6} lg={2} style={{padding: '10px 12px', fontWeight: 'bold', textAlign: 'center'}}>앞면 1</Col>
                        <Col xs={6} lg={4} style={{padding: '10px 12px', textAlign: 'center'}}>{viewData.front1}</Col>
                        <Col xs={6} lg={2} style={{padding: '10px 12px', fontWeight: 'bold', textAlign: 'center'}}>앞면 2</Col>
                        <Col xs={6} lg={4} style={{padding: '10px 12px', textAlign: 'center'}}>{viewData.front2}</Col>
                        <Col xs={6} lg={2} style={{padding: '10px 12px', fontWeight: 'bold', textAlign: 'center'}}>앞면 3</Col>
                        <Col xs={6} lg={4} style={{padding: '10px 12px', textAlign: 'center'}}>{viewData.front3}</Col>
                        <Col xs={6} lg={2} style={{padding: '10px 12px', fontWeight: 'bold', textAlign: 'center'}}>앞면 4</Col>
                        <Col xs={6} lg={4} style={{padding: '10px 12px', textAlign: 'center'}}>{viewData.front4}</Col>
                    </Row>
                    <Row>
                        <Col xs={6} lg={2} style={{padding: '10px 12px', fontWeight: 'bold', textAlign: 'center'}}>뒷면 1</Col>
                        <Col xs={6} lg={4} style={{padding: '10px 12px', textAlign: 'center'}}>{viewData.back1}</Col>
                        <Col xs={6} lg={2} style={{padding: '10px 12px', fontWeight: 'bold', textAlign: 'center'}}>뒷면 2</Col>
                        <Col xs={6} lg={4} style={{padding: '10px 12px', textAlign: 'center'}}>{viewData.back2}</Col>
                        <Col xs={6} lg={2} style={{padding: '10px 12px', fontWeight: 'bold', textAlign: 'center'}}>뒷면 3</Col>
                        <Col xs={6} lg={4} style={{padding: '10px 12px', textAlign: 'center'}}>{viewData.back3}</Col>
                        <Col xs={6} lg={2} style={{padding: '10px 12px', fontWeight: 'bold', textAlign: 'center'}}>뒷면 4</Col>
                        <Col xs={6} lg={4} style={{padding: '10px 12px', textAlign: 'center'}}>{viewData.back4}</Col>
                    </Row>
                </Col>
                <Col xs={24} lg={4} className="label">인쇄 도수</Col>
                <Col xs={24} lg={20}>{viewData.cmyk}</Col>
                <Col xs={24} lg={4} className="label">별색</Col>
                <Col xs={24} lg={20}>{viewData.spot_color}</Col>
            </Row>
            {/* 추가 정보 */}
            <Row className="table marginTop" style={{marginTop: 20, marginBottom: 20}}>
                <div className="table_title">추가 정보</div>
                <Col xs={24} lg={4} className="label">편집 마감 예정일</Col>
                <Col xs={24} lg={8}>{viewData.due_date}</Col>
                <Col xs={24} lg={4} className="label">입고 요청일</Col>
                <Col xs={24} lg={8}>{viewData.request_date}</Col>
                <Col xs={24} lg={4} className="label">디자인 주체</Col>
                <Col xs={24} lg={8}>{viewData.design_subject}</Col>
                <Col xs={24} lg={4} className="label">내부 담당 디자이너</Col>
                <Col xs={24} lg={8}>{viewData?.designers.map((unit, index) => {
                    let returnText = '' 
                    returnText += unit.name
                    if (index !== viewData.designers.length-1) {
                        returnText += ', '
                    }
                    return returnText
                })}</Col>
                <Col xs={24} lg={24} className="label">추가 요청사항</Col>
                <Col xs={24} lg={24}>{viewData.memo}</Col>
            </Row>
        </>
    )
}

export default observer(PrdCost)