/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import {  Space, Button, Row, Col,  Modal, Input, InputNumber, message, Radio,  Popover, Select, Typography} from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import { toJS } from 'mobx';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';


const Wrapper = styled.div`
    width: 100%;
    .txtForm{font-size:13px}
    `;



const CopyPayDate = observer(({type}) => {
    const state = useLocalStore(() => ({
        type: '',
    }));

    useEffect(() => {       
        state.type= type;
    });

    const [dateApplySort, setDateApplySort] = useState(true);
    const [payDateApplySort, setPayDateApplySort] = useState(true);
    const onChangeDateApplySort = (e) => {
        setDateApplySort( e.target.value);
    };
    const onChangePayDateApplySort = (e) => {
        setPayDateApplySort ( e.target.value);
    };

    return (
        <Wrapper>
            {state.type === "all" 
                && 
                <Row gutter={10} className="table marginTop" style={{borderTop:'none'}}>
                    <div className="table_title">계약 유효기간</div>
                    <Col xs={4} lg={8} xl={4} className="label">
                        유효기간 적용 범위 *
                    </Col>
                    <Col xs={20} lg={16} xl={20}>
                        <Radio.Group
                            onChange={onChangeDateApplySort}
                            value={dateApplySort}
                        >
                            <Radio value={true}>모든 상품 유형에 똑같이 적용</Radio>
                            <Radio value={false}>상품 유형별로 다르게 적용</Radio>
                        </Radio.Group>
                    </Col>
                    <Col xs={4} lg={8} xl={4} className="label">
                        유효기간 *
                    </Col>
                    <Col xs={20} lg={16} xl={20}>
                        {dateApplySort === true ? (
                            <>
                                <div className="txtForm">상품 출시일(제작일)로부터 <InputNumber min={1} />년이며, 계약 연장은 <InputNumber min={1} />년 단위로 함</div>
                            </>
                            ):(
                            <>
                                <Space className="txtForm" direction="vertical">
                                    <div>전자책: 상품 출시일(제작일)로부터 <InputNumber min={1} />년이며, 계약 연장은 <InputNumber min={1} />년 단위로 함</div>
                                    <div>오디오북: 상품 출시일(제작일)로부터 <InputNumber min={1} />년이며, 계약 연장은 <InputNumber min={1} />년 단위로 함</div>
                                    <div>기타 2차 저작물 저작권: 상품 출시일(제작일)로부터 <InputNumber min={1} /> 년이며, 계약 연장은 <InputNumber min={1} />년 단위로 함</div>
                                    <div>수출 저작물 저작권: 상품 출시일(제작일)로부터 <InputNumber min={1} />년이며, 계약 연장은 <InputNumber min={1} />년 단위로 함</div>
                                </Space>
                            </>
                        )}
                    </Col>
                </Row>  
            }                 
            
            <Row gutter={10} className="table marginTop" style={{borderTop:'none'}}>
                <div className="table_title">저작권료 지급 기간</div>
                <Col xs={4} lg={8} xl={4} className="label">
                    유효기간 적용 범위 *
                </Col>
                <Col xs={20} lg={16} xl={20}>
                    <Radio.Group
                        onChange={onChangePayDateApplySort}
                        value={payDateApplySort}
                    >
                        <Radio value={true}>모든 상품 유형에 똑같이 적용</Radio>
                        <Radio value={false}>상품 유형별로 다르게 적용</Radio>
                    </Radio.Group>
                </Col>
                <Col xs={4} lg={8} xl={4} className="label">
                    유효기간 *
                </Col>
                <Col xs={20} lg={16} xl={20}>
                    {payDateApplySort === true ? (
                            <>
                                <div className="txtForm">상품 출시일(제작일)로부터 <InputNumber min={1} />년이며, 계약 연장은 <InputNumber min={1} />년 단위로 함</div>
                            </>
                            ):(
                            <>
                                <Space className="txtForm" direction="vertical">
                                    <div>전자책: 상품 출시일(제작일)로부터 <InputNumber min={1} />년이며, 계약 연장은 <InputNumber min={1} />년 단위로 함</div>
                                    <div>오디오북: 상품 출시일(제작일)로부터 <InputNumber min={1} />년이며, 계약 연장은 <InputNumber min={1} />년 단위로 함</div>
                                    <div>기타 2차 저작물 저작권: 상품 출시일(제작일)로부터 <InputNumber min={1} /> 년이며, 계약 연장은 <InputNumber min={1} />년 단위로 함</div>
                                    <div>수출 저작물 저작권: 상품 출시일(제작일)로부터 <InputNumber min={1} />년이며, 계약 연장은 <InputNumber min={1} />년 단위로 함</div>
                                </Space>
                            </>
                        )}
                </Col>
            </Row>          

        </Wrapper>
    );
});

export default CopyPayDate;