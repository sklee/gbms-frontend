import React, { useState } from 'react';
import { Row, Col } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

const Wrapper = styled.div`
    width: 100%;
`;

const index = observer((props) => {

    return (
        <Wrapper>
            <Row className='table marginTop'>
                <div className="table_title">사고 정보</div>
                <Col xs={24} lg={12} className='innerCol' style={{display: 'flex', flexWrap: 'wrap'}}>
                    <div className="ant-col ant-col-xs-24 ant-col-lg-8 label">사고 여부</div>
                    <div className="ant-col ant-col-xs-24 ant-col-lg-16">있음</div>
                    <div className="ant-col ant-col-xs-24 ant-col-lg-8 label">참고 파일</div>
                    <div className="ant-col ant-col-xs-24 ant-col-lg-16">상자.jpg, 내용물.jpg</div>
                </Col>
                <Col xs={24} lg={12} className='innerCol' style={{display: 'flex', flexWrap: 'wrap'}}>
                    <div className="ant-col ant-col-xs-24 ant-col-lg-8 label">사고 내용</div>
                    <div className="ant-col ant-col-xs-24 ant-col-lg-16"></div>
                </Col>
            </Row>


        </Wrapper>
    );

});

export default index;
