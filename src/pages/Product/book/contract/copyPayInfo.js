/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import {  Space, Button, Row, Col,  Modal, Input, InputNumber, DatePicker, Checkbox, message, Radio,  Popover, Select, Typography} from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import Icon, { QuestionOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';


const Wrapper = styled.div`
    width: 100%;
    .txtForm{font-size:13px}
    .paySecList{display:block}
    .paySecList .paySec{display:flex;margin-top:5px}
    .paySecList .paySec:first-child{margin-top:0;}
    .paySecList .paySec .sec{margin-right:10px;line-height:30px}
    .paySecList .paySec .detail{display:flex;margin-right:10px;}
    .paySecList .paySec .detail > div{line-height:30px}
    .paySecList .paySec .detail .firstnum{min-width:60px;text-align:right}
    `;



const CopyPayInfo = observer(({}) => {
    const state = useLocalStore(() => ({
        paperCnt: 1,
        paperSecNum :[1],
        paperChk:[false],
        ebookCnt: 1,
        ebookSecNum :[1],
        ebookChk:[false],
        audioCnt: 1,
        audioSecNum :[1],
        audioChk:[false]
    }));
    const dateFormat = 'YYYY-MM-DD';
    const { Text, Link } = Typography;

    const popContent = (
      <div>
        <Space direction="vertical">
            <Text type="secondary">-단일한 비율로 지급하는 경우: 1구간의 “끝까지" 항목 앞을 체크하고 정산 비율을 입력합니다.</Text>
            <Text type="secondary">-구간별로 지급하는 경우: 해당 부수 또는 매출액과 정산 비율을 입력하고, + 버튼을 눌러서 구간을 계속 추가합니다. 마지막 구간에는 “끝까지" 항목 앞을 체크합니다.</Text>
            <Text type="secondary">이 툴팁은 모든 ‘정기 저작권료’에 공통(이 주석은 설명문에서는 제외함)</Text>
        </Space>
      </div>
    );

    const paySecAdd = (obj) => {
        if(obj=='paper'){
            state.paperCnt++;
            state.paperChk.push(false);
        }else if(obj=='ebook'){
            state.ebookCnt++;
            state.ebookChk.push(false);
        }else if(obj=='audio'){
            state.audioCnt++;
            state.audioChk.push(false);
        }
    };

    const [checkPaperCut, setcheckPaperCut] = useState(false);
    const [checkebookCut, setcheckebookCut] = useState(false);
    const [checkaudioCut, setcheckaudioCut] = useState(false);
    const onCheckCut = (obj,num,e) =>{
        if(obj=='paper'){
            if(e.target.checked){
                state.paperCnt = num;
                state.paperChk.splice(num-1);
                state.paperChk.push(true)
                console.log('배열 : '+state.paperChk);
                setcheckPaperCut(true);
            }else{
                state.paperChk.splice(-1)
                state.paperChk.push(false)
                console.log('배열 : '+state.paperChk);
                setcheckPaperCut(false)
            }
        }else if(obj=='ebook'){
            if(e.target.checked){
                state.ebookCnt = num;
                state.ebookChk.splice(num-1);
                state.ebookChk.push(true)
                setcheckebookCut(true);
            }else{
                state.ebookChk.splice(-1)
                state.ebookChk.push(false)
                setcheckebookCut(false)
            }
        }else if(obj=='audio'){
            if(e.target.checked){
                state.audioCnt = num;
                state.audioChk.splice(num-1);
                state.audioChk.push(true)
                setcheckaudioCut(true);
            }else{
                state.audioChk.splice(-1)
                state.audioChk.push(false)
                setcheckaudioCut(false)
            }
        }
    }

    const comma = (num) =>{
        const number = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        return number;
    }

    const numChange = (obj,num,value) => {
        if(obj=='paper'){
            state.paperSecNum[num] = comma(value);
            console.log('배열 : '+state.paperSecNum);
        }else if(obj=='ebook'){

        }else if(obj=='audio'){
            
        }
    }


    return (
        <Wrapper>
            <Row gutter={10} className="table marginTop" style={{borderTop:'none'}}>
                <div className="table_title">종이책</div>
                <Col xs={4} lg={8} xl={4} className="label">
                    선불 저작권료(계약금) *
                </Col>
                <Col xs={20} lg={16} xl={20}>
                    <div className="txtForm"><InputNumber min={1} />원(없으면 0으로 입력)을  <DatePicker name="" format={dateFormat} />까지 지급</div>
                </Col>
                <Col xs={4} lg={8} xl={4} className="label">
                    초판 저작권료 *
                </Col>
                <Col xs={20} lg={16} xl={20}>
                    <Radio.Group>
                        <Radio value={1}>지급</Radio>
                        <Radio value={2}>지급하지 않음</Radio>
                    </Radio.Group>
                </Col>
                <Col xs={4} lg={8} xl={4} className="label">
                    정기 저작권료 *
                    <Popover content={popContent}>
                        <Button className="btn-popover" shape="circle" icon={<QuestionOutlined style={{fontSize: "11px"}} />} size="small" style={{marginLeft: '5px'}} />
                    </Popover>
                </Col>
                <Col xs={20} lg={16} xl={20}>
                    <div className="paySecList">
                        {[...Array(state.paperCnt)].map((n, index) => {
                            return (
                                <div className="paySec" data-index={index+1}>
                                    <div className="sec">{index+1} 구간</div>
                                    <div className="detail">
                                        <div className="firstnum">{state.paperSecNum[index]}부</div> <div> ~ </div> <div><InputNumber onChange={(e) => numChange('paper',index+1,e)} />부 또는 <Checkbox onChange={(e) => onCheckCut('paper',index+1,e)} checked={state.paperChk[index]}></Checkbox>끝까지: <InputNumber min={1} max={100} />%</div>
                                    </div>
                                    {checkPaperCut === false &&
                                        <Button className="btn-primary btn_authorsrch" type="button" onClick={(e) => paySecAdd('paper')}>+</Button>
                                    }
                                </div>
                            )
                        })}
                    </div>
                </Col>
                <Col xs={4} lg={8} xl={4} className="label">
                    저작권료 면제 부수 *
                </Col>
                <Col xs={20} lg={16} xl={20}>
                    <InputNumber />부(없으면 0으로 입력)
                </Col>
                <Col xs={4} lg={8} xl={4} className="label">
                    특판 저작권료 *
                </Col>
                <Col xs={20} lg={16} xl={20}>
                    기준 공급률 <InputNumber min={1} max={100} />% 이하이며, 정가의 <InputNumber min={1} max={100} />%를 저작권료로 지급(계약 내용 없으면 모두 0으로 입력)
                </Col>
            </Row>
            <Row gutter={10} className="table marginTop" style={{borderTop:'none'}}>
                <div className="table_title">전자책</div>
                <Col xs={4} lg={8} xl={4} className="label">
                    선불 저작권료(계약금) *
                </Col>
                <Col xs={20} lg={16} xl={20}>
                    <div className="txtForm"><InputNumber min={1} />원(없으면 0으로 입력)을  <DatePicker name="" format={dateFormat} />까지 지급</div>
                </Col>
                <Col xs={4} lg={8} xl={4} className="label">
                    정기 저작권료 *
                </Col>
                <Col xs={20} lg={16} xl={20}>
                    <div className="paySecList">
                        {[...Array(state.ebookCnt)].map((n, index) => {
                            return (
                                <div className="paySec" data-index={index+1}>
                                    <div className="sec">{index+1} 구간</div>
                                    <div className="detail">
                                        <div className="firstnum">{state.ebookSecNum[index]}부</div> <div> ~ </div> <div><InputNumber onChange={(e) => numChange('ebook',index+1,e)} />부 또는 <Checkbox onChange={(e) => onCheckCut('ebook',index+1,e)} checked={state.ebookChk[index]}></Checkbox>끝까지: <InputNumber min={1} max={100} />%</div>
                                    </div>
                                    {checkebookCut === false &&
                                        <Button className="btn-primary btn_authorsrch" type="button" onClick={(e) => paySecAdd('ebook')}>+</Button>
                                    }
                                </div>
                            )
                        })}
                    </div>
                </Col>
                <Col xs={4} lg={8} xl={4} className="label">
                    대여/구독 가능 여부 *
                </Col>
                <Col xs={20} lg={16} xl={20}>
                    <Radio.Group>
                        <Radio value={1}>가능</Radio>
                        <Radio value={2}>불가능</Radio>
                    </Radio.Group>
                </Col>
            </Row>
            <Row gutter={10} className="table marginTop" style={{borderTop:'none'}}>
                <div className="table_title">오디오북(<Checkbox></Checkbox>나중에 따로 계약 체결할 때 입력)</div>
                <Col xs={4} lg={8} xl={4} className="label">
                    선불 저작권료(계약금) *
                </Col>
                <Col xs={20} lg={16} xl={20}>
                    <div className="txtForm"><InputNumber min={1} />원(없으면 0으로 입력)을 <DatePicker name="" format={dateFormat} />까지 지급</div>
                </Col>
                <Col xs={4} lg={8} xl={4} className="label">
                    공제 비율 *
                </Col>
                <Col xs={20} lg={16} xl={20}>
                    영업 및 판매관리 비용으로 매출의 <InputNumber min={1} max={100} />%를 공제하고 정기 저작권료를 계산(공제하지 않으면 0으로 입력)
                </Col>
                <Col xs={4} lg={8} xl={4} className="label">
                    정기 저작권료 *
                </Col>
                <Col xs={20} lg={16} xl={20}>
                    <div className="paySecList">
                        {[...Array(state.audioCnt)].map((n, index) => {
                            return (
                                <div className="paySec" data-index={index+1}>
                                    <div className="sec">{index+1} 구간</div>
                                    <div className="detail">
                                        <div className="firstnum">{state.audioSecNum[index]}부</div> <div> ~ </div> <div><InputNumber onChange={(e) => numChange('audio',index+1,e)} />부 또는 <Checkbox onChange={(e) => onCheckCut('audio',index+1,e)} checked={state.audioChk[index]}></Checkbox>끝까지: <InputNumber min={1} max={100} />%</div>
                                    </div>
                                    {checkaudioCut === false &&
                                        <Button className="btn-primary btn_authorsrch" type="button" onClick={(e) => paySecAdd('audio')}>+</Button>
                                    }
                                </div>
                            )
                        })}
                    </div>
                </Col>
                <Col xs={4} lg={8} xl={4} className="label">
                    대여/구독 가능 여부 *
                </Col>
                <Col xs={20} lg={16} xl={20}>
                    <Radio.Group>
                        <Radio value={1}>가능</Radio>
                        <Radio value={2}>불가능</Radio>
                    </Radio.Group>
                </Col>
            </Row>
            <Row gutter={10} className="table marginTop" style={{borderTop:'none'}}>
                <div className="table_title">그 외 저작권</div>
                <Col xs={4} lg={8} xl={4} className="label">
                    기타 2차 저작권 *
                </Col>
                <Col xs={20} lg={16} xl={20}>
                    이 저작물을 제3자가 2차적 저작물 개발에 사용할 경우
                    매출에서 관리 비용으로 <InputNumber min={1} max={100} />%를 공제하고, 나머지 금액의 <InputNumber min={1} max={100} />%를 저작권료로 지급
                </Col>
                <Col xs={4} lg={8} xl={4} className="label">
                    수출 저작권 *
                </Col>
                <Col xs={20} lg={16} xl={20}>
                    매출에서 관리 비용으로 <InputNumber min={1} max={100} />%를 공제하고, 나머지 금액의 <InputNumber min={1} max={100} />%를 저작권료로 지급
                </Col>
            </Row>        

        </Wrapper>
    );
});

export default CopyPayInfo;