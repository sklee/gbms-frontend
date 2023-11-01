import React, {useState, useCallback, useEffect} from 'react';
import {Drawer, Button, Row, Col, Input, Select, Radio, DatePicker} from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { observer, useLocalStore } from 'mobx-react';
import moment from 'moment';

const Wrapper = styled.div`
    width: 100%;
`;

const PrdReview = observer(({visible, drawerClose, disabled, drawerClass, drawerChk}) =>{
    const { Option } = Select;

    const state = useLocalStore(() => ({
        deadline: moment().add(8, 'days'),
        requestDate: '',
        insideDsn: null,
        drawerback: 'drawerWrap'
    }));

    const valueChange = useCallback((type) => (e) => {
        if(type === 'deadline'){
            state.deadline = e.format('YYYY-MM-DD');
            state.requestDate = moment(e).add(7, 'days').format('YYYY-MM-DD');
        }
        if(type === 'requestDate'){
            state.requestDate = e.format('YYYY-MM-DD');
        }
        if(type === 'insideDsn'){
            state.insideDsn = e.target.value;
        }
    });

    const disabledDate = (current) => {
        // Can not select days before today and today
        return current && current < moment().add(7, 'days');
    };

    const disabledRequestDate = (current) => {
        // Can not select days before today and today
        return current && current < moment(state.deadline).subtract(5, 'days');
        
    };

    useEffect(()=>{
        state.requestDate = moment(state.deadline).add(7, 'days');
    },[state])

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

    return (
        <Wrapper>
            <Drawer
                title='제작 검토 요청'
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
                <Row className="table marginTop">
                    <div className="table_title">면지 사양</div>
                    <Col xs={24} lg={4} className="label">
                        종이 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={20}>
                        <Select placeholder='선택해 주세요.' disabled={disabled}></Select>
                    </Col>

                    <Col xs={24} lg={4} className="label">면지 배열</Col>
                    <Col xs={24} lg={20} style={{display: 'flex', flexWrap: 'wrap', padding: 0, border: 0}}>
                        <div className="ant-col ant-col-xs-24 ant-col-lg-6">
                            앞1
                            <Input style={{width: 'calc(100% - 35px)', marginLeft: 10}} disabled={disabled}/>
                        </div>
                        <div className="ant-col ant-col-xs-24 ant-col-lg-6">
                            앞2
                            <Input style={{width: 'calc(100% - 35px)', marginLeft: 10}} disabled={disabled}/>
                        </div>
                        <div className="ant-col ant-col-xs-24 ant-col-lg-6">
                            앞3
                            <Input style={{width: 'calc(100% - 35px)', marginLeft: 10}} disabled={disabled}/>
                        </div>
                        <div className="ant-col ant-col-xs-24 ant-col-lg-6">
                            앞4
                            <Input style={{width: 'calc(100% - 35px)', marginLeft: 10}} disabled={disabled}/>
                        </div>
                        <div className="ant-col ant-col-xs-24 ant-col-lg-6">
                            뒤1
                            <Input style={{width: 'calc(100% - 35px)', marginLeft: 10}} disabled={disabled}/>
                        </div>
                        <div className="ant-col ant-col-xs-24 ant-col-lg-6">
                            뒤2
                            <Input style={{width: 'calc(100% - 35px)', marginLeft: 10}} disabled={disabled}/>
                        </div>
                        <div className="ant-col ant-col-xs-24 ant-col-lg-6">
                            뒤3
                            <Input style={{width: 'calc(100% - 35px)', marginLeft: 10}} disabled={disabled}/>
                        </div>
                        <div className="ant-col ant-col-xs-24 ant-col-lg-6">
                            뒤4
                            <Input style={{width: 'calc(100% - 35px)', marginLeft: 10}} disabled={disabled}/>
                        </div>
                    </Col>

                    <Col xs={24} lg={4} className="label">인쇄 도수 <span className="spanStar">*</span></Col>
                    <Col xs={24} lg={20}>
                            <Radio.Group disabled={disabled}>
                                <Radio value={0}>0도(인쇄 없음)</Radio>
                                <Radio value={1}>1도</Radio>
                                <Radio value={2}>2도</ Radio>
                                <Radio value={3}>3도</ Radio>
                            </Radio.Group>
                    </Col>

                    <Col xs={24} lg={4} className="label">별색</Col>
                    <Col xs={24} lg={20}>
                            <Input disabled={disabled}/>
                    </Col>
                </Row>

                <div style={{marginTop: 20, marginBottom: 20}}>
                    <Row className="table marginTop">
                        <div className="table_title">추가 정보</div>
                        <Col xs={24} lg={4} className="label">편집 마감 예정일 <span className="spanStar">*</span></Col>
                        <Col xs={24} lg={8}>
                            <DatePicker format={'YYYY-MM-DD'} value={moment(state.deadline)} onChange={valueChange('deadline')} disabledDate={disabledDate} disabled={disabled}/>
                        </Col>
                        <Col xs={24} lg={4} className="label">입고 요청일 <span className="spanStar">*</span></Col>
                        <Col xs={24} lg={8}>
                            <DatePicker format={'YYYY-MM-DD'} value={state.requestDate ? moment(state.requestDate) : null} onChange={valueChange('requestDate')} disabledDate={disabledRequestDate} disabled={disabled}/>
                        </Col>
                        
                        <Col xs={24} lg={4} className="label">디자인 주체 <span className="spanStar">*</span></Col>
                        <Col xs={24} lg={8}>
                            <Radio.Group value={state.insideDsn} onChange={valueChange('insideDsn')} disabled={disabled}>
                                <Radio value={0}>내부</Radio>
                                <Radio value={1}>외부</Radio>
                            </Radio.Group>
                        </Col>

                        <Col xs={24} lg={4} className="label">내부 담당 디자이너 { state.insideDsn === 0 ? <span className="spanStar">*</span> : ''}</Col>
                        <Col xs={24} lg={8}>
                            <Select mode="multiple" showArrow style={{ width: '100%' }} placeholder="담당자를 선택하세요." disabled={state.insideDsn === 0 ? false : true}>
                                <Option key={1}>담당자1</Option>
                                <Option key={2}>담당자2</Option>
                                <Option key={3}>담당자3</Option>
                            </Select>
                        </Col>

                        <Col xs={24} lg={24} className="label">추가 요청사항 <span className="spanStar">*</span></Col>
                        <Col xs={24} lg={24} >
                            제작팀에서 세부 제작 사양을 결정하는데 필요한 정보를 최대한 자세하게 작성해 주세요.
                            <Input.TextArea name="memo" rows={4} autoComplete="off" disabled={disabled}/>
                        </Col>
                    </Row>
                </div>

                <Row gutter={[10, 10]} justify="center" style={{marginBottom: 20}}>
                    <Col>
                        <Button type='primary' htmlType='button'>확인</Button>
                    </Col>
                </Row>

            </Drawer>
        </Wrapper>
    );
})

export default PrdReview;