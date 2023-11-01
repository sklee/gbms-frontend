import React, { useState } from 'react';
import {Drawer, Button, Row, Col } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';

import styled from 'styled-components';
import { observer, useLocalStore } from 'mobx-react';

const Wrapper = styled.div`
    width: 100%;
`;

const ViewDrawer = observer(({visible, drawerClose, list}) =>{
    const state = useLocalStore(() => ({
        drawerback: 'drawerWrap'
    }));

    const [ drawerExtended, setDrawerExtended ] = useState(false);
    const drawerSizeHandler = () => {
        if(drawerExtended){
            setDrawerExtended(false);
            state.drawerback = 'drawerWrap';
            
        } else {
            setDrawerExtended(true);
            state.drawerback = 'drawerback drawerWrap';
        }
    }

    return(
        <Wrapper>
            <Drawer
                title='보기/수정'
                placement='right'
                className={state.drawerback}
                visible={visible}
                onClose={drawerClose}
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
                <Row gutter={10} className="table">
                    <Col xs={24} lg={4} className="label">상품</Col>
                    <Col xs={24} lg={20}>[상품코드]상품명(공식) / 상품명(내부용)</Col>
                    <Col xs={24} lg={4} className="label">현재 판/쇄</Col>
                    <Col xs={24} lg={20}>현재 판/쇄</Col>
                    <Col xs={24} lg={4} className="label">재쇄 검토 요청</Col>
                    <Col xs={24} lg={8}>김명자 / 2023.08.01</Col>
                    <Col xs={24} lg={4} className="label">편집 확인</Col>
                    <Col xs={24} lg={8}>홍길동 / 2023.08.02</Col>
                    <Col xs={24} lg={4} className="label">발주 수량</Col>
                    <Col xs={24} lg={8}>1,000</Col>
                    <Col xs={24} lg={4} className="label">입고 요청일</Col>
                    <Col xs={24} lg={8}>2023.08.15</Col>

                    <Col xs={24} lg={4} className="label">구성 상품</Col>
                    <Col xs={24} lg={20} style={{padding: 10}}>
                        <Row gutter={10} className='gridWrap'>
                            <FlexGrid
                                itemSource={list}
                                headersVisibility="Column" 
                            >
                                <FlexGridColumn header="상품 코드" />
                                <FlexGridColumn header="상품명 (공식)" />
                                <FlexGridColumn header="상품명 (내부)" />
                                <FlexGridColumn header="편집 마감 예정일" />
                                <FlexGridColumn header="변경 범위" />
                            </FlexGrid>
                        </Row>
                    </Col>

                    <Col xs={24} lg={4} className="label">사양 변경 등 참고사항</Col>
                    <Col xs={24} lg={20}>
                        <p>- 본문 15쪽 수정 예정</p>
                        <p>- 표지에 금박 후가공 하지 않음</p>
                        <p>- 띠지 제거</p>
                    </Col>
                </Row>
                <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                    <Col>
                        <Button type='primary' htmlType='button'>제작 발주 등록</Button>
                        <Button htmlType='button' style={{ margin: '0 10px' }}>제작 발주 취소</Button>
                        <Button type='primary' htmlType='button'>제작 발주 보기</Button>
                    </Col>
                </Row>
            </Drawer>
        </Wrapper>
    )
});

export default ViewDrawer;