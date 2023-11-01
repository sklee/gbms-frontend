/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Space, Button, Row, Col,  Modal, Breadcrumb, Input, Upload,  message, Radio, Popover, Select, Typography, Checkbox, DatePicker} from 'antd';
import { PhoneOutlined ,QuestionOutlined, UploadOutlined, PlusOutlined, CloseOutlined,  } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';
import moment from 'moment';
import tooltipData from '@pages/tooltipData';

import AddHolder from '../../Search';

import PopupPostCode from '@components/Common/DaumAddress';

const Wrapper = styled.div`
    width: 100%;
    `;

const DEF_STATE = {
    // DB Data
    id: '',
    start_date: '',
    end_date: '',
    extension_year: '',
    royalty_term_type: '',
    prepaid_royalty: '',
    prepaid_royalty_date: '',
    first_royalty_yn: '',
    exemption_royalty_qty: '',
    special_royalty1: '',
    special_royalty2: '',
    fixed_royalties: [{
        qty:0,
        end_yn:'',
        percent:''
    }],

    brokers:[],
};

const DEF_STATE_OS = {
    // DB Data
    id: '',
    start_date: '',
    end_date: '',
    sale_date: '',
    data_cost: '',
    prepaid_royalty: '',
    royalty_unit: '',
    address: '',
    etc_memo: '',
    fixed_royalties: [{
        qty:0,
        end_yn:'',
        percent:''
    }],

    brokers:[],
};

const DEF_ROYALTY = {
    qty:'',
    end_yn:'',
    percent:''
};

const DEF_BROKER = {
    broker_id: '',
    current_unit: '',
    settlement_cycle: '',
    payment_scope1: '',
    payment_scope2: ''
};

const contractsDrawer = observer(({type,selType,states,data,booksVal,drawerClass,drawerChk}) => {
    const { commonStore } = useStore();

    const { Text } = Typography;

    const stateData = useLocalStore(() => (type==='contracts'?{ ...DEF_STATE }:(type==='contracts-check'?{ ...DEF_STATE }:{ ...DEF_STATE_OS }))); 

    const state = useLocalStore(() => ({
        type: '',               //api 타입           
        sel_type : '',          //저작권 구분
        states : '',            //상태 (등록,수정,조회 etc)
        search_type : 'books',         //탭 코드
        brokers : [],           //중개자 정보
        tooltipData :'',
    }));
    
    useEffect(() => {     
        state.type= type;
        state.sel_type= selType;
        state.states= states;
        if(data !== null && data !== undefined){
            if(Object.keys(data).length > 0){
                var temp_type = Object.keys(type==='overseas'?DEF_STATE_OS:DEF_STATE);
                temp_type.forEach((item)=>{
                    if(item === 'start_date' || item === 'end_date' || item ==='prepaid_royalty_date' || item === 'sale_date')  {
                        if(data[item]===null||data[item]===''){
                            stateData[item] = '';
                        }else{
                            stateData[item] = moment(data[item]);
                        }
                    }else{
                        stateData[item] = data[item];
                    }
                    // stateData[item] = data[item];
            });
            }
        }
        if(tooltipData){
            state.tooltipData = tooltipData.filter(e=>e.id==='contract').map(item => {
                return <div dangerouslySetInnerHTML={{__html: item.memo}}></div>
            });
        }
        stateData.brokers.forEach(item=>{
            getBrokers(item.broker_id);
        });
    }, [type]);

    //drawer class
    const classChkBtn = (val)=>{
        drawerClass(val)     
    }

    const [viewSearchVisible, setViewSearchVisible] = useState(false);
    //검색
    const showSearchDrawer = (search_type) => {
        state.search_type = search_type;
        if(drawerChk === 'Y'){
            classChkBtn('drawerback');
        } 
        setViewSearchVisible(true);
    };

    const overlapSearch = (details) => {
        state.brokers = [...state.brokers,details];
        // stateData.broker_id = details.id;
        var temp_broker = DEF_BROKER;
        temp_broker.broker_id = details.id;
        stateData.brokers = [...stateData.brokers,temp_broker];
        booksVal('books',stateData);
    };

    const getBrokers  = useCallback(async (id) => {
        commonStore.loading = true;

        var config = {
            method: 'GET',
            url:
                process.env.REACT_APP_API_URL +'/api/v1/brokers/'+id,
            headers: {
                Accept: 'application/json',
            },
        };
        axios(config)
        .then(function (response) {
            state.brokers = [...state.brokers,{id:response.data.data.id ,name : response.data.data.name}];
        })
        commonStore.loading = false;
    });

     //search drawer 닫기
    const addOnClose = () => {
        if(drawerChk === 'Y'){
            classChkBtn();
        }
        setViewSearchVisible(false);
    };

    const fetchData = () => {};


    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback(
        (type) => (e) => {
            if(type === 'start_date' || type === 'end_date' || type ==='prepaid_royalty_date' || type === 'sale_date')  {
                if(!handleCheckDate(type,e)){
                    stateData[type] = e;
                    if(type === 'start_date' && stateData.end_date){
                        stateData['end_date'] = stateData.start_date >= stateData.end_date ? '' : stateData.end_date;
                    }
                }else{
                    stateData[type] = stateData[type];
                }
            }else if(type=== 'extension_year'){
                stateData[type] = e.target.value.replace(/([^0-9])/g, '').slice(0, 1);
            }else if(type === 'prepaid_royalty' || type==='data_cost'){
                stateData[type] = e.target.value.replace(/([^0-9])/g, '');
            }else{
                stateData[type] = e.target.value;
            }
            booksVal('books',stateData);
        },[],
    );

    const handleCheckDate = useCallback(
        (type,date) => {
            if(type==='start_date'|| type ==='prepaid_royalty_date' || type === 'sale_date'){
                return date && date < moment().subtract(1, 'day');
            }else if(type==='end_date'){
                if(stateData.start_date){
                    return date && date < stateData.start_date;
                }else{
                    return date && date < moment();
                }
            }else{
                return true;
            }
        },[],
    );

    //정기 저작권료 수정
    const handleChangeRoyalty = useCallback(
        (idx,type) => (e) => {
            if(type === 'end_yn'){
                stateData['fixed_royalties'][idx][type] = e.target.checked ? 'Y' : 'N';
                if(e.target.checked){
                    stateData['fixed_royalties'] = toJS(stateData['fixed_royalties']).filter((item,index) => index <= idx);
                }
            }else if(type === 'qty'){
                stateData['fixed_royalties'][idx][type] = e.target.value.replace(/([^0-9])/g, '');
            }else{
                stateData['fixed_royalties'][idx][type] = e.target.value;
            }
            booksVal('books',stateData);
        },[],
    );

    //정기 저작권료 추가
    const handleInputRoyalty = useCallback(
        () => (e) => {
            stateData['fixed_royalties'] = [...toJS(stateData['fixed_royalties']),DEF_ROYALTY];
            booksVal('books',stateData);
        },[],
    );
    //정기 저작권료 삭제
    const handleDeleteRoyalty = useCallback(
        (idx) => (e) => {
            stateData['fixed_royalties'].filter((item) => item.id !== idx);
            booksVal('books',stateData);
        },[],
    );

    //부수 검증
    const handleBlurRoyalty = useCallback(
        (idx) => (e) => {
            //현재 입력값 수정시 alert
            if(idx == 0){
                if(stateData['fixed_royalties'][idx]['end_yn'] !== 'Y'){
                    if(isNaN(stateData['fixed_royalties'][idx]['qty']) || stateData['fixed_royalties'][idx]['qty'] <= 1){
                        message.warning('유효한 부수 범위를 설정해주세요.');
                    }
                }
            }else{
                if(stateData['fixed_royalties'][idx]['end_yn'] !== 'Y'){
                    if(isNaN(stateData['fixed_royalties'][idx]['qty']) || stateData['fixed_royalties'][idx]['qty'] <= Number(stateData['fixed_royalties'][idx-1]['qty'])+1){
                        message.warning('이전 구간보다 큰 부수 범위를 설정해주세요.');
                    }
                }
            }
        },[],
    );

    const handleDeleteBroker = useCallback(
        (idx) => (e) => {
            state.brokers = state.brokers.filter(item=>item.id !== idx);
            stateData.brokers = stateData.brokers.filter((item) => item.broker_id !== idx);
            booksVal('books',stateData);
        },[],
    );

    //정기 저작권료 수정
    const handleChangeBroker = useCallback(
        (idx,type) => (e) => {
            stateData['brokers'][idx][type] = e.target.value;
            booksVal('books',stateData);
        },[],
    );

    return (
        <Wrapper>
            {/* ================================================= 국내 / 해외 직계약  ========================================================== */}
            {state.states ==='insert'                     
                ?
                <Wrapper>

                {state.sel_type !=='I'                      
                    ?
                <Row gutter={10} className="table marginUp">
                    <div className="table_title">계약 정보</div>
                    <Col xs={5} lg={5} className="label">
                            계약 기간 <span className="spanStar">*</span>
                        </Col>
                    <Col xs={19} lg={19}>
                        <DatePicker value={stateData.start_date} disabledDate={e=>handleCheckDate('start_date',e)} name="start_date" onChange={handleChangeInput('start_date')} style={{width: 115, textAlign: 'right'}} />
                        ~<DatePicker value={stateData.end_date} disabledDate={e=>handleCheckDate('end_date',e)} name="end_date" onChange={handleChangeInput('end_date')} style={{width: 115, textAlign: 'right'}}/> 이며,&nbsp;
                        <Input type="number" min="0" name="extension_year" value={stateData.extension_year} onChange={handleChangeInput('extension_year')} autoComplete="off" style={{width: 55, textAlign: 'right'}}/>년 단위로 자동 연장
                        (자동 연장 없으면 0으로 입력)
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        저작권료 지급 기간 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Radio.Group
                            value={stateData['royalty_term_type']}
                            onChange={handleChangeInput('royalty_term_type')}
                        >
                            <Radio value="1">계약 기간과 관계 없이 매출 발생하면 지급</Radio>
                            <Radio value="2">계약 기간 내 매출에 대해서만 지급</Radio>
                        </Radio.Group>
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        선불 저작권료(계약금) <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Input type="text" name="prepaid_royalty" value={stateData.prepaid_royalty.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={handleChangeInput('prepaid_royalty')} autoComplete="off" style={{width: 95, textAlign: 'right'}}/>원(없으면 0으로 입력)을 &nbsp;
                        <DatePicker value={stateData.prepaid_royalty_date===null?null:stateData.prepaid_royalty_date} disabledDate={e=>handleCheckDate('prepaid_royalty_date',e)} name="prepaid_royalty_date" onChange={handleChangeInput('prepaid_royalty_date')} style={{width: 115, textAlign: 'right'}} />까지 지급
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        초판 저작권료 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Radio.Group
                            value={stateData['first_royalty_yn']}
                            onChange={handleChangeInput('first_royalty_yn')}
                        >
                            <Radio value="Y">지급</Radio>
                            <Radio value="N">지급하지 않음</Radio>
                        </Radio.Group>
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        정기 저작권료 <span className="spanStar">*</span> 
                        <Popover content={state.tooltipData[0]}>
                            <Button
                                shape="circle"
                                icon={
                                    <QuestionOutlined
                                        style={{ fontSize: '11px' }}
                                    />
                                }
                                size="small"
                                style={{ marginLeft: '5px' }}
                            />
                        </Popover>
                    </Col>
                    <Col xs={19} lg={19}>
                        {stateData.fixed_royalties.map((item,index) => (
                            <div style={index > 0 ? {marginTop: 10} : {}}>
                                <Space>
                                    <span style={{fontWeight: 700}}>{index+1}구간</span> 
                                    <span style={{display: 'inline-block', width: 70, textAlign: 'right'}}>
                                        {index==0 ? 1 : (stateData.fixed_royalties[index-1].qty !== '' ? (parseInt(stateData.fixed_royalties[index-1].qty)+1) : 'n')}부 ~
                                    </span>
                                    <Input type="text" name="qty" value={item.qty?item.qty.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","):''} onChange={handleChangeRoyalty(index,'qty')} autoComplete="off" onBlur={handleBlurRoyalty(index)} style={{width: 70, textAlign: 'right'}}/>부 또는 
                                    <Checkbox name="end_yn" checked={item.end_yn==='Y'} onChange={handleChangeRoyalty(index,'end_yn')}/> 끝까지 : 
                                    <Input type="number" min="0" name="percent" value={item.percent} onChange={handleChangeRoyalty(index,'percent')} autoComplete="off" style={{width: 55, textAlign: 'right'}}/> %
                                    {stateData.fixed_royalties.length == index+1 && item.end_yn !== 'Y' &&
                                        <Button className="btn btn-primary btn_add" shape="circle" onClick={handleInputRoyalty()} style={{ marginLeft: '5px' }}>+</Button>
                                    }
                                </Space>
                            </div>
                        ))}
                    </Col>
                    {stateData.first_royalty_yn == 'Y' && 
                    <Col xs={5} lg={5} className="label">
                        저작권료 면제 부수 <span className="spanStar">*</span>
                    </Col>
                    }
                    {stateData.first_royalty_yn == 'Y' && 
                    <Col xs={19} lg={19}>
                        <Input type="number" min="0" name="exemption_royalty_qty" value={stateData.exemption_royalty_qty} onChange={handleChangeInput('exemption_royalty_qty')} autoComplete="off" style={{width: 70, textAlign: 'right'}}/>부(없으면 0으로 입력)
                    </Col>
                    }
                    <Col xs={5} lg={5} className="label">
                        특판 저작권료 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        기준 공급률 
                        <Input type="number" min="0" name="special_royalty1" value={stateData.special_royalty1} onChange={handleChangeInput('special_royalty1')} autoComplete="off" style={{width: 55, textAlign: 'right'}}/>
                        % 이하이며, 정가의 &nbsp;
                        <Input type="number" min="0" name="special_royalty2" value={stateData.special_royalty2} onChange={handleChangeInput('special_royalty2')} autoComplete="off" style={{width: 55, textAlign: 'right'}}/>
                        %를 저작권료로 지급 (계약 내용 없으면 모두 0으로 입력)
                    </Col>
                    {state.sel_type ==='K' &&
                    <Col xs={5} lg={5} className="label">
                        중개자 
                        <Popover content={state.tooltipData[1]}>
                            <Button
                                shape="circle"
                                icon={
                                    <QuestionOutlined
                                        style={{ fontSize: '11px' }}
                                    />
                                }
                                size="small"
                                style={{ marginLeft: '5px' }}
                            />
                        </Popover>
                    </Col>
                    }
                    {state.sel_type ==='K' &&
                    <Col xs={19} lg={19}>
                        {state.brokers.map(item => (
                            <Space>
                                {item.name}
                                <Button
                                    shape="circle"
                                    icon={
                                        <CloseOutlined
                                            style={{ fontSize: '11px' }}
                                        />
                                    }
                                    onClick={handleDeleteBroker(item.id)}
                                    size="small"
                                    style={{ marginLeft: '5px' }}
                                />
                            </Space>
                        ))}
                        <Button className="btn btn-primary btn_add" shape="circle" onClick={(e) => {showSearchDrawer('brokers');}} style={{ marginLeft: '5px' }}>+</Button>
                    </Col>
                    }
                </Row>  
                :<></> 
                }
                 {state.sel_type!=='I' && 
                    stateData.brokers.map((item,index) => (
                        <Row gutter={10} className="table marginTop">
                            <div className="table_title">중개 계약 정보</div>
                            <Col xs={5} lg={5} className="label">
                                중개자명        
                            </Col>
                            <Col xs={19} lg={19}>
                                {state.brokers.find(e=>e.id == item.broker_id)?.name}
                            </Col>
                            <Col xs={5} lg={5} className="label">
                                통화단위 <span className="spanStar">*</span>
                            </Col>
                            <Col xs={19} lg={19}>
                                <Radio.Group
                                    value={item['current_unit']}
                                    onChange={handleChangeBroker(index,'current_unit')}
                                >
                                <Radio value="KRW">원화(KRW)</Radio>
                                <Radio value="USD">달러(USD)</Radio>
                                <Radio value="EUR">유로(EUR)</Radio>
                                <Radio value="GBP">파운드(GBP)</Radio>
                                <Radio value="JPY">엔(JPY)</Radio>
                                <Radio value="CNY">위안(CNY)</Radio>

                                </Radio.Group>
                            </Col>
                            <Col xs={5} lg={5} className="label">
                                정산 보고 주기 <span className="spanStar">*</span>
                            </Col>
                            <Col xs={19} lg={19}>
                                <Radio.Group
                                    value={item['settlement_cycle']}
                                    onChange={handleChangeBroker(index,'settlement_cycle')}
                                >
                                <Radio value="COMPANY">본사 기준에 따름</Radio>
                                <Radio value="YEAR">1년</Radio>
                                <Radio value="HALF">반기</Radio>
                                </Radio.Group>
                            </Col>
                            {/* <Col xs={5} lg={5} className="label">
                                중개자에게 지급 범위 <span className="spanStar">*</span>
                            </Col>
                            <Col xs={19} lg={19}>
                                <Radio.Group
                                    value={item['payment_scope1']}
                                    onChange={handleChangeBroker(index,'payment_scope1')}
                                >
                                <Radio value="A">중개자에게 저작권료 모두 지급</Radio>
                                <Radio value="B">중개자에게는 저작권료 중개 수수료
                                <Popover content={state.tooltipData[3]}>
                                    <Button
                                        shape="circle"
                                        icon={
                                            <QuestionOutlined
                                                style={{ fontSize: '11px' }}
                                            />
                                        }
                                        size="small"
                                        style={{marginLeft: '5px' }}
                                    />
                                </Popover>로 <Input type="number" min="0" name="price" value={item.payment_scope2} onChange={handleChangeBroker(index,'payment_scope2')} autoComplete="off" style={{width:'10%'}}/>%
                                를 지급하고 나머지는 저작권자에게 직접 지급

                                </Radio>

                                </Radio.Group>
                            </Col> */}
                        </Row>
                    ))
                }
                </Wrapper>:<></>   
            }
            {/* ================================================= 국내 / 해외 직계약 end ========================================================== */}
            {/* ================================================= 해외 수입 ======================================================================= */}
            {state.states ==='insert'                     
                ?
                <Wrapper>

                {state.sel_type ==='I'                      
                    ?
                <Row gutter={10} className="table marginUp">
                    <div className="table_title">계약 정보</div>
                    <Col xs={5} lg={5} className="label">
                            계약 기간 <span className="spanStar">*</span>
                        </Col>
                    <Col xs={19} lg={19}>
                        <DatePicker value={stateData.start_date} disabledDate={e=>handleCheckDate('start_date',e)} name="start_date" onChange={handleChangeInput('start_date')} style={{width: 115, textAlign: 'right'}} />
                        ~ <DatePicker value={stateData.end_date} disabledDate={e=>handleCheckDate('end_date',e)} name="end_date" onChange={handleChangeInput('end_date')} style={{width: 115, textAlign: 'right'}}/>
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        판매 기한 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <DatePicker value={stateData.sale_date} disabledDate={e=>handleCheckDate('sale_date',e)} name="sale_date" onChange={handleChangeInput('sale_date')} style={{width: 115, textAlign: 'right'}}/>
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        데이터비
                    </Col>
                    <Col xs={19} lg={19}>
                        <Input type="text" name="data_cost" value={stateData.data_cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={handleChangeInput('data_cost')} autoComplete="off" style={{width: 95, textAlign: 'right'}}/>(USD)
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        선불 저작권료(계약금) <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Input type="text" name="prepaid_royalty" value={stateData.prepaid_royalty.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={handleChangeInput('prepaid_royalty')} autoComplete="off" style={{width: 95, textAlign: 'right'}}/>(USD)
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        저작권료 정산 단위 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Radio.Group
                            value={stateData['royalty_unit']}
                            onChange={handleChangeInput('royalty_unit')}
                        >
                        <Radio value="SALE">판매 부수</Radio>
                        <Radio value="PRINT">인쇄 부수</Radio>

                        </Radio.Group>
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        정기 저작권료 <span className="spanStar">*</span> 
                        <Popover content={state.tooltipData[0]}>
                            <Button
                                shape="circle"
                                icon={
                                    <QuestionOutlined
                                        style={{ fontSize: '11px' }}
                                    />
                                }
                                size="small"
                                style={{ marginLeft: '5px' }}
                            />
                        </Popover>
                    </Col>
                    <Col xs={19} lg={19}>
                        {stateData.fixed_royalties.map((item,index) => (
                            <div style={index > 0 ? {marginTop: 10} : {}}>
                                <Space>
                                    {index+1}구간 
                                    <span style={{display: 'inline-block', width: 70, textAlign: 'right'}}>
                                        {index==0 ? 1 : (stateData.fixed_royalties[index-1].qty !== '' ? (parseInt(stateData.fixed_royalties[index-1].qty)+1) : 'n')}부 ~ 
                                    </span>
                                    <Input type="text" name="qty" value={item.qty?item.qty.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","):''} onChange={handleChangeRoyalty(index,'qty')} autoComplete="off" onBlur={handleBlurRoyalty(index)} style={{width: 70, textAlign: 'right'}}/>부 또는 
                                    <Checkbox checked={item.end_yn==='Y'} name="end_yn" onChange={handleChangeRoyalty(index,'end_yn')}/> 끝까지 : 
                                    <Input type="number" min="0" name="percent" value={item.percent} onChange={handleChangeRoyalty(index,'percent')} autoComplete="off" style={{width: 55, textAlign: 'right'}}/> %
                                    {stateData.fixed_royalties.length == index+1 && item.end_yn !== 'Y' &&
                                        <Button className="btn btn-primary btn_add" shape="circle" onClick={handleInputRoyalty()} style={{ marginLeft: '5px' }}>+</Button>
                                    }
                                </Space>
                            </div>
                        ))}
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        증정본 발송 주소 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Input.TextArea
                            name="address"
                            rows={2}
                            onChange={handleChangeInput('address')}
                            value={stateData.address}
                            autoComplete="off"
                        />
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        기타 참고사항
                    </Col>
                    <Col xs={19} lg={19}>
                        <Input.TextArea
                            name="etc_memo"
                            rows={4}
                            onChange={handleChangeInput('etc_memo')}
                            value={stateData.etc_memo}
                            autoComplete="off"
                        />
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        중개자 <span className="spanStar">*</span>
                        <Popover content={state.tooltipData[1]}>
                            <Button
                                shape="circle"
                                icon={
                                    <QuestionOutlined
                                        style={{ fontSize: '11px' }}
                                    />
                                }
                                size="small"
                                style={{ marginLeft: '5px' }}
                            />
                        </Popover>
                    </Col>
                    <Col xs={19} lg={19}>
                        {state.brokers.map(item => (
                            <Space>
                                {item.name}
                                <Button
                                    shape="circle"
                                    icon={
                                        <CloseOutlined
                                            style={{ fontSize: '11px' }}
                                        />
                                    }
                                    onClick={handleDeleteBroker(item.id)}
                                    size="small"
                                    style={{ marginLeft: '5px' }}
                                />
                            </Space>
                        ))}
                        <Button className="btn btn-primary btn_add" shape="circle" onClick={(e) => {showSearchDrawer('brokers');}} style={{ marginLeft: '5px' }}>+</Button>
                    </Col>
                </Row>  
                :<></> 
                }
                {state.sel_type==='I' && 
                    stateData.brokers.map((item,index) => (
                        <Row gutter={10} className="table marginTop">
                            <div className="table_title">중개 계약 정보</div>
                            <Col xs={5} lg={5} className="label">
                                중개자명        
                            </Col>
                            <Col xs={19} lg={19}>
                                {state.brokers.find(e=>e.id == item.broker_id)?.name}
                            </Col>
                            <Col xs={5} lg={5} className="label">
                                통화단위 <span className="spanStar">*</span>
                            </Col>
                            <Col xs={19} lg={19}>
                                <Radio.Group
                                    value={item['current_unit']}
                                    onChange={handleChangeBroker(index,'current_unit')}
                                >
                                <Radio value="USD">달러(USD)</Radio>
                                <Radio value="EUR">유로(EUR)</Radio>
                                <Radio value="GBP">파운드(GBP)</Radio>
                                <Radio value="JPY">엔(JPY)</Radio>
                                <Radio value="CNY">위안(CNY)</Radio>

                                </Radio.Group>
                            </Col>
                            <Col xs={5} lg={5} className="label">
                                정산 보고 주기 <span className="spanStar">*</span>
                            </Col>
                            <Col xs={19} lg={19}>
                                <Radio.Group
                                    value={item['settlement_cycle']}
                                    onChange={handleChangeBroker(index,'settlement_cycle')}
                                >
                                <Radio value="YEAR">1년</Radio>
                                <Radio value="HALF">반기</Radio>
                                </Radio.Group>
                            </Col>
                            {/* <Col xs={5} lg={5} className="label">
                                중개자에게 지급 범위 <span className="spanStar">*</span>
                            </Col>
                            <Col xs={19} lg={19}>
                                <Radio.Group
                                    value={item['payment_scope1']}
                                    onChange={handleChangeBroker(index,'payment_scope1')}
                                >
                                <Radio value="A">중개자에게 저작권료 모두 지급</Radio>
                                <Radio value="B">중개자에게는 저작권료 중개 수수료
                                <Popover content={state.tooltipData[3]}>
                                    <Button
                                        shape="circle"
                                        icon={
                                            <QuestionOutlined
                                                style={{ fontSize: '11px' }}
                                            />
                                        }
                                        size="small"
                                        style={{marginLeft: '5px' }}
                                    />
                                </Popover>로 <Input type="number" min="0" name="price" value={item.payment_scope2} onChange={handleChangeBroker(index,'payment_scope2')} autoComplete="off" style={{width:'10%'}}/>%
                                를 지급하고 나머지는 저작권자에게 직접 지급

                                </Radio>

                                </Radio.Group>
                            </Col> */}
                        </Row>  
                    ))
                }
                {viewSearchVisible === true && (
                    <AddHolder
                        type={'brokers'}
                        visible={viewSearchVisible}
                        onClose={addOnClose}
                        overlapSearch={overlapSearch}
                        reset={fetchData}
                    />
                )}
            </Wrapper>
            :<></>
        }
            {/* ================================================= 해외 수입 end =================================================================== */}

        </Wrapper>
    );
});

export default contractsDrawer;