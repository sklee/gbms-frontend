import React, { useState } from 'react';
import { Row, Col, DatePicker, Radio, Upload, Button } from 'antd';
import { UploadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import ErrorGrid from './errorGrid';
import ResultGrid from './resultGrid';

const Wrapper = styled.div`
    width: 100%;
`;

const index = observer((props) => {

    return (
        <Wrapper className='flexcontWrap'>
            <Row className='table'>
                <Col span={2} className='label'>주문일</Col>
                <Col span={4}>
                    <DatePicker />
                </Col>
                <Col span={2} className='label'>서점</Col>
                <Col span={8}>
                    <Radio.Group>                            
                        <Radio value='kb'>교보문고</Radio>
                        <Radio value='yes'>예스24</Radio>
                        <Radio value='aladin'>알라딘</Radio>
                        <Radio value='yp'>영풍문고</Radio>
                    </Radio.Group>
                </Col>
                <Col span={2} className='label'>회사</Col>
                <Col span={6}>
                    <Radio.Group>                            
                        <Radio value='G'>도서출판 길벗</Radio>
                        <Radio value='S'>길벗스쿨</Radio>
                    </Radio.Group>
                </Col>
            </Row>
            <Row gutter={10} justify="center" style={{margin: '30px 0 50px'}}>
                <Col>
                    <Upload
                        fileList={null}
                    >
                        <Button icon={<UploadOutlined />}>파일</Button>
                    </Upload>
                    {/* <span className='accessFile'><ExclamationCircleOutlined/> 업로드 가능 확장자: png, pdf,xlsx | 용량 최대: 20MB</span> */}
                </Col>
            </Row>

            <ErrorGrid />
            <ResultGrid />

        </Wrapper>
    );
})

export default index;