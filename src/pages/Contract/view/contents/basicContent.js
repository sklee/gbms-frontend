/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState } from 'react';
import { Row, Col, Checkbox, Radio, Input, Modal, DatePicker } from 'antd';
import { PhoneOutlined ,QuestionOutlined, UploadOutlined, PlusOutlined  } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';
import moment from 'moment';

import ContCancel from './closes';

const DEF_STATE = {
    // DB Data
    id: '',
    contract_transfer: '',
    copyright_fee_lump_sum: '',
    total_amount: '',
    payment: '',
    payment_date: '',
    payment_timing_type: '',
    payment_timing_content: '',
    targets: [],
    ranges: [],
};

const CLOSE_STATE = {
    // DB Data
    end_date: "",
    close_type: "",
    settlement_copyright_fee_type: "",
    reason_memo: "",
    progress_memo: "",
    loss_price: "",
    detail_memo: "",
    created_at:"",
    contract_managers:[]
};

const ContBasicInfo = observer(( {idx, type, selType, dataInfo, data, orgData, basicVal} ) => {
    const { commonStore } = useStore();
    const { confirm } = Modal;
    const stateData = useLocalStore(() => ({ ...DEF_STATE }));
    const closeData = useLocalStore(() => ({ ...CLOSE_STATE })); 
    const state = useLocalStore(() => ({
        type: '',               //api 타입           
        dataInfo: '',           //저작권자 정보
        selType : '',           //저작권 구분    

        chkData : [],       //계약범위 데이터  
        close_state : '',

        orgData : {
            targets: [],
            ranges: [],
        }
    }));

    useEffect(()=>{
        state.dataInfo= dataInfo;
        state.type = type
        state.selType = selType
        state.close_state = orgData?.pivot.contract_close_yn ? orgData.pivot.contract_close_yn : 'N';
        if(orgData){
            state.orgData = orgData
        }
        const key_list = ['contract_transfer','copyright_fee_lump_sum','total_amount','payment','payment_date','payment_timing_type','payment_timing_content','targets','ranges','check_memo']
        key_list.forEach(key=>{
            stateData[key] = data[key]?data[key]:''
        })
        if(orgData?.pivot.contract_close_yn!=='N'){
            closeApiData(idx);
        }
    },[type]);

    //해지 정보
    const closeApiData = useCallback(async (idx) => {
        const data = {copyright_id:stateData.id};

        commonStore.handleApi({
            method : 'GET',
            url : '/contracts-close/'+idx,
            data : data
        })
        .then((response) => {
            if(response.data.id != ''){
                var temp_type = Object.keys(CLOSE_STATE);
                temp_type.forEach((item)=>{
                    if(item === 'contract_managers'){
                        var temp_type2 = ['id','name','team'];
                        response.data.contract_managers.map((obj)=>{
                            var temp_manager = {};
                            temp_type2.forEach((item2)=>{
                                temp_manager[item2] = obj[item2];
                            });
                            closeData.contract_managers = [...closeData.contract_managers,temp_manager];
                        });
                    }else{
                        closeData[item] = response.data[item];
                    }
                });
            }
        })
    }, []);

    const handleCheck = (e) => {
        var chk = e.target.value;
        if(chk==='Y'){
            confirm({
                title: '해지 확정',
                content: "결재까지 모두 끝났나요? 해지를 확정하면 취소할 수 없습니다. 계속하려면 '확인'을 선택해 주세요.",    
                onOk() {
                    apiClose(chk);
                },    
                onCancel() {
                    return false;      
                },
            });
        }else if(chk==='N'){
            confirm({
                title: '해지 취소',
                content: "해지 등록한 내용이 모두 삭제됩니다. 계속하려면 ‘확인'을 선택해 주세요.",    
                onOk() {
                    apiClose(chk);
                },    
                onCancel() {
                    return false;      
                },
            });
        }else{

        }
    };

    const apiClose = useCallback(async (e)=> {
        const data = {copyright_id:'',contract_close_yn:''};
        data.copyright_id=stateData.id;
        data.contract_close_yn = e;

        commonStore.handleApi({
            method : 'POST',
            url : '/contracts-close/'+idx,
            data : data
        })
        .then((response) => {
            Modal.success({
                title: response.result,
                onOk(){
                    addOnCancelClose();
                },
            });
        })
    }, []);

    const [viewCancelVisible, setViewCancelVisible] = useState(false);
    //재계약
    const showCancelDrawer = (e) => {
        setViewCancelVisible(true);
    };

    const addOnCancelClose = () => {
        setViewCancelVisible(false);
        stateData.id = '';
        // getCopyrights(stateData);
    };

    const handleChangeInput = useCallback(
        (type) => (e) => {
            if (type === 'ranges') {
                stateData[type] = e;
                var temp_ranges = ['book','ebook','audio','other','export'];
                temp_ranges = temp_ranges.filter(x => !stateData[type].includes(x));
                temp_ranges.forEach((item)=>(
                    stateData[item+'s'] = {}
                ));
            }else if (type === 'targets'){
                stateData[type] = e;
            }else if (type === 'payment_date'){
                stateData[type] = e;
            }else if(type === 'payment_timing_type'){
                stateData['payment_timing_content'] = '';
                stateData[type] = e.target.value;
            }else if (type === 'payment_timing_content'){
                if(stateData['payment_timing_type']==="1"){
                    stateData[type] = e;
                }else if(stateData['payment_timing_type']=== "2" || stateData['payment_timing_type']=== "3" ){
                    stateData[type] = e.target.value;
                }
            }else if(type === 'total_amount' || type === 'payment'){
                stateData[type] = e.target.value.replace(/([^0-9])/g, '');
            }else if(type === 'copyright_fee_lump_sum'){
                stateData[type] = e.target.value;
                if(stateData.copyright_fee_lump_sum=='Y'){
                    var temp_ranges = ['book','ebook','audio','other','export'];
                    temp_ranges.forEach((item)=>{
                        stateData[item+'s'] = {};
                    });
                }else{
                    stateData.total_amount= '';
                    stateData.payment= '';
                    stateData.payment_date= '';
                    stateData.payment_timing_type= '';
                    stateData.payment_timing_content= '';
                }
            }else{
                stateData[type] = e.target.value;
            }
            basicVal('basic',stateData)
        },[],
    );

    return (
        <>
            <Row gutter={10} className="table marginUp">
                <div className="table_title">기본 정보</div>
                <Col xs={5} lg={5} className="label">
                    저작권자
                </Col>
                <Col xs={19} lg={19}>
                    {state.dataInfo.name}
                </Col>
                <Col xs={5} lg={5} className="label">
                    저작권 대상 <span className="spanStar">*</span>
                </Col>
                <Col xs={19} lg={19}>  
                    <Checkbox.Group 
                        style={{ width: '100%' }} 
                        onChange={handleChangeInput('targets')}
                        value={stateData.targets}
                        disabled={state.close_state==='N'?false:true}
                    >
                        <Checkbox value="본문" disabled={toJS(state.orgData.targets).includes('본문')}>본문</Checkbox>
                        <Checkbox value="번역" disabled={toJS(state.orgData.targets).includes('번역')}>번역</Checkbox>
                        <Checkbox value="삽화" disabled={toJS(state.orgData.targets).includes('삽화')}>삽화</Checkbox>
                        <Checkbox value="사진" disabled={toJS(state.orgData.targets).includes('사진')}>사진</Checkbox>
                        <Checkbox value="동영상강좌" disabled={toJS(state.orgData.targets).includes('동영상강좌')}>동영상 강좌</Checkbox>
                    </Checkbox.Group>
                </Col>
                <Col xs={5} lg={5} className="label">
                    계약 범위 <span className="spanStar">*</span>
                </Col>
                <Col xs={19} lg={19}>
                    <Checkbox.Group 
                        style={{ width: '100%' }} 
                        onChange={handleChangeInput('ranges')}
                        value={stateData.ranges}
                        disabled={state.close_state==='N'?false:true}
                    >
                        <Checkbox value="book" disabled={toJS(state.orgData.ranges).includes('book')}>종이책</Checkbox>
                        <Checkbox value="ebook" disabled={toJS(state.orgData.ranges).includes('ebook')}>전자책</Checkbox>
                        <Checkbox value="audio" disabled={toJS(state.orgData.ranges).includes('audio')}>오디오북</Checkbox>
                        <Checkbox value="other" disabled={toJS(state.orgData.ranges).includes('other')}>2차 저작권(동영상 강좌 포함)</Checkbox>
                        <Checkbox value="export" disabled={toJS(state.orgData.ranges).includes('export')}>수출 저작권</Checkbox>
                    </Checkbox.Group>
                </Col>
                <Col xs={5} lg={5} className="label">
                    저작권 양도 계약 <span className="spanStar">*</span>
                </Col>
                <Col xs={19} lg={19}>
                    {dataInfo?.add_chk ? 
                    <Radio.Group
                        value={stateData['contract_transfer']}
                        onChange={handleChangeInput('contract_transfer')}
                    >
                    <Radio value="N">아님(No)</Radio>
                    <Radio value="Y">맞음(Yes)</Radio>

                    </Radio.Group>
                    :
                    <>{stateData.contract_transfer==='Y'?'맞음(Yes)':'아님(No)'}</>
                    }
                </Col>
                <Col xs={5} lg={5} className="label">
                    저작권료 일괄 지급(매절) <span className="spanStar">*</span>
                </Col>
                <Col xs={19} lg={19}>
                    {dataInfo?.add_chk ? 
                    <Radio.Group
                        value={stateData['copyright_fee_lump_sum']}
                        onChange={handleChangeInput('copyright_fee_lump_sum')}
                    >
                    <Radio value="N">아님(No)</Radio>
                    <Radio value="Y">맞음(Yes)</Radio>

                    </Radio.Group>
                    :
                    <>{stateData.copyright_fee_lump_sum==='Y'?'맞음(Yes)':'아님(No)'}</>
                    }
                </Col>
                {state.close_state==='N' &&
                    <Col xs={5} lg={5} className="label">
                        계약 변경
                    </Col>
                }
                {state.close_state==='N' &&
                    <Col xs={19} lg={19}>
                    <Radio.Group
                    >
                    <Radio value="cancel" onClick={e=>showCancelDrawer()}>이 저작권자의 계약 해지</Radio>
                    </Radio.Group>
                    </Col>
                }
            </Row>

            {stateData.copyright_fee_lump_sum ==='Y' ?
                <Row gutter={10} className="table marginTop">
                    <div className="table_title">저작권료 일괄 지급(매절) 정보</div>
                    <Col xs={5} lg={5} className="label">
                        전체 금액 <span className="spanStar">*</span>     
                    </Col>
                    <Col xs={19} lg={19}>
                        <Input 
                            type="text" 
                            name="total_amount" 
                            value={stateData.total_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} 
                            onChange={handleChangeInput('total_amount')} 
                            autoComplete="off" 
                            style={{width:'10%'}}
                        />원
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        계약금과 지급 기한 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Input 
                            type="text" 
                            name="payment" 
                            value={stateData.payment.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} 
                            onChange={handleChangeInput('payment')} 
                            autoComplete="off" 
                            style={{width:'10%'}}
                        />원을 &nbsp;
                        <DatePicker 
                            value={stateData.payment_date} 
                            name="payment_date" 
                            onChange={handleChangeInput('payment_date')}
                        />까지 지급(계약금 없으면 0원으로 입력)
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        전체 금액 지급 시기 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Radio.Group
                            value={stateData['payment_timing_type']}
                            onChange={handleChangeInput('payment_timing_type')}
                            style={{width: '100%'}}
                        >
                            <Radio value="1" style={{width: 125, paddingBottom: 10}}>특정날짜
                            </Radio>
                            {stateData['payment_timing_type'] === "1" &&
                                <DatePicker 
                                    value={stateData.payment_timing_content}
                                    name="payment_timing_content"
                                    onChange={handleChangeInput('payment_timing_content')} 
                                    style={{width: 125}}
                                />
                            }
                            <br/>
                            <Radio value="2" style={{width: 125, paddingBottom: 10}}>작업물 수령 후
                            </Radio>
                            {stateData['payment_timing_type'] === "2" && <>
                                <Input 
                                    type="number" 
                                    min="0" 
                                    name="payment_timing_content" 
                                    value={stateData.payment_timing_content} 
                                    onChange={handleChangeInput('payment_timing_content')} 
                                    autoComplete="off" 
                                    style={{width: 125}} 
                                /><span style={{fontSize: 14}}>일 이내</span>
                            </>
                            }
                            <br/>
                            <Radio value="3" style={{width: 125, paddingBottom: 10}}>상품 출시 후
                            </Radio>
                            {stateData['payment_timing_type'] === "3" && <>
                                <Input 
                                    type="number" 
                                    min="0" 
                                    name="payment_timing_content" 
                                    value={stateData.payment_timing_content} 
                                    onChange={handleChangeInput('payment_timing_content')} 
                                    autoComplete="off" 
                                    style={{width: 125}}
                                /><span style={{fontSize: 14}}>일 이내</span>
                            </>}
                            <br/>
                            <Radio value="4">기타</Radio>
                        </Radio.Group>
                    </Col>
                </Row>  
                :<></> 
            }

                <Row gutter={10} className="table marginTop">
                    <div className="table_title">검수, 정산 정보</div>
                    <Col xs={5} lg={5} className="label">
                        기타 참고사항
                    </Col>
                    {state.close_state==='N'?
                    <Col xs={19} lg={19}>
                        <Input.TextArea
                            name="check_memo"
                            rows={4}
                            onChange={handleChangeInput('check_memo')}
                            value={stateData.check_memo}
                            autoComplete="off"
                        /> 
                    </Col>   
                    :
                    <Col xs={19} lg={19}>
                        {stateData.check_memo} 
                    </Col> 
                    }
                </Row>

                {orgData?.pivot.contract_close_yn==='Y' || orgData?.pivot.contract_close_yn==='W' &&
                <Row gutter={10} className="table marginTop">
                    <div className="table_title">계약 해지 정보</div>
                    <Col xs={5} lg={5} className="label">
                            해지 적용일
                        </Col>
                    <Col xs={19} lg={19}>
                        {closeData.end_date}
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        해지 사유 책임(귀속)
                    </Col>
                    <Col xs={19} lg={19}>
                        {closeData.close_type==='1'?'본사':null}
                        {closeData.close_type==='2'?'저작권자':null}
                        {closeData.close_type==='3'?'공동/합의':null}
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        저작권료/비용 정산
                    </Col>
                    <Col xs={19} lg={19}>
                        {closeData.settlement_copyright_fee_type==='1'?'지급한 금액 손실 처리':null}
                        {closeData.settlement_copyright_fee_type==='2'?'본사가 지급할 금액 있음':null}
                        {closeData.settlement_copyright_fee_type==='3'?'본사가 회수할 금액 있음':null}
                        {closeData.settlement_copyright_fee_type==='3'?'정산할 금액 없음':null}
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        해지 사유
                    </Col>
                    <Col xs={19} lg={19}>
                        {closeData.reason_memo}
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        진행 경과
                    </Col>
                    <Col xs={19} lg={19}>
                        {closeData.progress_memo}
                    </Col>
                    {closeData.settlement_copyright_fee_type!=='4'?
                        <Col xs={5} lg={5} className="label">
                            {closeData.settlement_copyright_fee_type==='1'?'손실 처리할 금액과 세부 내역':null}
                            {closeData.settlement_copyright_fee_type==='2'?'본사가 지급할 금액과 세부 내역':null}
                            {closeData.settlement_copyright_fee_type==='3'?'본사가 회수할 금액과 세부 내역':null}
                        </Col>
                        :<></>}
                    {closeData.settlement_copyright_fee_type!=='4'?
                    <Col xs={19} lg={19}>
                        {closeData.loss_price}원 <br/>
                        {closeData.detail_memo}
                    </Col>
                    :<></>}
                    <Col xs={5} lg={5} className="label">
                        담당자와 등록일  
                    </Col>
                    <Col xs={19} lg={19}>
                    {closeData.contract_managers.map((e)=>(e.name+"  "))}
                    ({closeData.created_at})
                    </Col>
                    {orgData?.pivot.contract_close_yn==='W' &&
                    <Col xs={5} lg={5} className="label">
                        해지 등록 처리 
                    </Col>
                    }
                    {orgData?.pivot.contract_close_yn==='W' &&
                    <Col xs={19} lg={19}>
                        <Radio.Group>
                            <Radio value="Y" onClick={(e)=>handleCheck(e)}>확정</Radio>
                            <Radio value="N" onClick={(e)=>handleCheck(e)}>해지 등록 취소</Radio>
                        </Radio.Group>
                    </Col>
                    }
                </Row>
                }
                {viewCancelVisible === true && (
                    <ContCancel
                        idx={idx}
                        type={state.type} 
                        // selType={state.sel_type} 
                        // states={'insert'}
                        data={stateData}
                        visible={viewCancelVisible}
                        onClose={addOnCancelClose}
                    />
                )}
        </>
    );
})

export default ContBasicInfo;