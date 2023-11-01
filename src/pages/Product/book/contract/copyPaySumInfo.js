/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import {  Space, Button, Row, Col,  Modal, Input, InputNumber, DatePicker, message, Radio,  Popover, Select, Typography} from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import { toJS } from 'mobx';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';


const Wrapper = styled.div`
    width: 100%;
    .radioLabel{display:inline-block;width:100px;}
    `;



const CopyPaySumInfo = observer(({}) => {
    const dateFormat = 'YYYY-MM-DD';

    return (
        <Wrapper>
            <Row gutter={10} className="table marginTop" style={{borderTop:'none'}}>
                <div className="table_title">저작권료 일괄 지급(매절) 정보</div>
                <Col xs={4} lg={8} xl={4} className="label">
                    전체 금액 *
                </Col>
                <Col xs={20} lg={16} xl={20}>
                    <InputNumber />원
                </Col>
                <Col xs={4} lg={8} xl={4} className="label">
                    계약금과 지급 기한 *
                </Col>
                <Col xs={20} lg={16} xl={20}>
                    <InputNumber />원을 <DatePicker name="" format={dateFormat} />까지 지급(계약금 없으면 0원으로 입력)
                </Col>
                <Col xs={4} lg={8} xl={4} className="label">
                    전체 금액 지급 시기 *
                </Col>
                <Col xs={20} lg={16} xl={20}>
                    <Radio.Group>
                        <Space direction="vertical">
                            <Radio value={1}><div className="radioLabel">특정 날짜</div> <DatePicker name="" format={dateFormat} /></Radio>
                            <Radio value={2}><div className="radioLabel">작업물 수령 후</div> <InputNumber />일 이내</Radio>
                            <Radio value={3}><div className="radioLabel">상품 출시 후</div> <InputNumber />일 이내</Radio>
                            <Radio value={4}><div className="radioLabel">기타</div></Radio>
                        </Space>
                    </Radio.Group>
                </Col>
            </Row>            

        </Wrapper>
    );
});

export default CopyPaySumInfo;