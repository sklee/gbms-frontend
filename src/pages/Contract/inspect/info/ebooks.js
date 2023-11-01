/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Space, Button, Row, Col,  Modal, Breadcrumb, Input, Upload,  message, Radio, Popover, Select, Typography, Checkbox, DatePicker} from 'antd';
import { PhoneOutlined ,QuestionOutlined, UploadOutlined, PlusOutlined, CloseOutlined  } from '@ant-design/icons';
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
    start_date: '',
    end_date: '',
    extension_year: '',
    royalty_term_type: '',
    prepaid_royalty: '',
    prepaid_royalty_date: '',
    fixed_royalty: '',
    rental_type: '',
    
    brokers:[],
};
const DEF_STATE_OS = {
    // DB Data
    start_date: '',
    end_date: '',
    sale_date: '',
    data_cost: '',
    prepaid_royalty: '',
    fixed_royalty: '',
    rental_type: '',
    etc_memo: '',
    
    brokers:[],
};

const DEF_BROKER = {
    broker_id: '',
    current_unit: '',
    settlement_cycle: '',
    payment_scope1: '',
    payment_scope2: ''
};

const contractsDrawer = observer(({type, selType, states, data, ebooksVal, drawerClass, drawerChk}) => {
    const { commonStore } = useStore();

    const { Text } = Typography;

    const stateData = useLocalStore(() => (type==='contracts-check'?{ ...DEF_STATE }:{ ...DEF_STATE_OS })); 

    const state = useLocalStore(() => ({
        type: '',               //api 타입           
        sel_type : '',          //저작권 구분
        states : '',            //상태 (등록,수정,조회 etc)
        search_type : 'ebooks',         //탭 코드
        brokers : [],           //중개자 정보
        tooltipData :'',
    }));
    
    useEffect(() => {       
        state.type= type;
        state.sel_type= selType;
        state.states= states;
        if(data !== null && data !== undefined){
            if(Object.keys(data).length > 0){
                var temp_type = Object.keys(type==='contracts-check'?DEF_STATE:DEF_STATE_OS);
                temp_type.forEach((item)=>{
                    if(item === 'start_date' || item === 'end_date' || item ==='prepaid_royalty_date' || item === 'sale_date')  {
                        if(data[item]===null){
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
            state.tooltipData = tooltipData.filter(e=>e.key==='contract_2'||e.key==='contract_4').map(item => {
                return <div dangerouslySetInnerHTML={{__html: item.memo}}></div>;
            });
        }
        stateData.brokers.forEach(item=>{
            getBrokers(item.broker_id);
        });
    }, [type]);

    const overlapSearch = (details) => {
        state.brokers = details;
        stateData.broker_id = details.id;
        ebooksVal('ebooks',stateData);
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
            // stateData[type] =e.target.value;    
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
            ebooksVal('ebooks',stateData);
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

    const handleDeleteBroker = useCallback(
        (idx) => (e) => {
            state.brokers = state.brokers.filter(item=>item.id !== idx);
            stateData.brokers = stateData.brokers.filter((item) => item.broker_id !== idx);
            ebooksVal('ebooks',stateData);
        },[],
    );

    //정기 저작권료 수정
    const handleChangeBroker = useCallback(
        (idx,type) => (e) => {
            stateData['brokers'][idx][type] = e.target.value;
            ebooksVal('ebooks',stateData);
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
                <Row gutter={10} className="table marginTop">
                    <div className="table_title">전자책</div>
                    <Col xs={5} lg={5} className="label">
                            계약 기간 <span className="spanStar">*</span>
                        </Col>
                    <Col xs={19} lg={19}>
                        <DatePicker value={stateData.start_date} disabledDate={e=>handleCheckDate('start_date',e)} name="start_date" onChange={handleChangeInput('start_date')}  />
                        ~<DatePicker value={stateData.end_date} disabledDate={e=>handleCheckDate('end_date',e)} name="end_date" onChange={handleChangeInput('end_date')} /> 이며, &nbsp;
                        <Input type="number" min="0" name="extension_year" value={stateData.extension_year} onChange={handleChangeInput('extension_year')} autoComplete="off" style={{width:'15%'}}/>년 단위로 자동 연장
                        (자동 연장 없으면 0으로 입력)
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        저작권료 지급 기간 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Radio.Group
                            value={stateData.royalty_term_type}
                            onChange={handleChangeInput('royalty_term_type')}
                            name="royalty_term_type"
                        >
                        <Radio value="1">계약 기간과 관계 없이 매출 발생하면 지급</Radio>
                        <Radio value="2">계약 기간 내 매출에 대해서만 지급</Radio>

                        </Radio.Group>

                    </Col>
                    <Col xs={5} lg={5} className="label">
                        선불 저작권료(계약금) <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Input type="text" name="prepaid_royalty" value={stateData.prepaid_royalty.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={handleChangeInput('prepaid_royalty')} autoComplete="off" style={{width:'15%'}}/>원(없으면 0으로 입력)을 &nbsp;
                        <DatePicker value={stateData.prepaid_royalty_date===null?null:stateData.prepaid_royalty_date} disabledDate={e=>handleCheckDate('prepaid_royalty_date',e)} name="prepaid_royalty_date" onChange={handleChangeInput('prepaid_royalty_date')}  />까지 지급
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        정기 저작권료 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        순수입의 <Input type="number" min="0" name="fixed_royalty" value={stateData.fixed_royalty} onChange={handleChangeInput('fixed_royalty')} autoComplete="off" style={{width:'8%'}}/>%
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        대여/구독 가능 여부 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Radio.Group
                            value={stateData['rental_type']}
                            onChange={handleChangeInput('rental_type')}
                            name="rental_type"
                        >
                        <Radio value="Y">가능</Radio>
                        <Radio value="N">불가능</Radio>
                        <Radio value="U">확인 안됨</Radio>

                        </Radio.Group>
                    </Col>
                    {state.sel_type ==='K' &&
                    <Col xs={5} lg={5} className="label">
                        중개자 
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
                            <Col xs={5} lg={5} className="label">
                                중개자에게 지급 범위 <span className="spanStar">*</span>
                            </Col>
                            <Col xs={19} lg={19}>
                                <Radio.Group
                                    value={item['payment_scope1']}
                                    onChange={handleChangeBroker(index,'payment_scope1')}
                                >
                                <Radio value="A">중개자에게 저작권료 모두 지급</Radio>
                                <Radio value="B">중개자에게는 저작권료 중개 수수료
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
                                </Popover>로 <Input type="number" min="0" name="price" value={item.payment_scope2} onChange={handleChangeBroker(index,'payment_scope2')} autoComplete="off" style={{width:'10%'}}/>%
                                를 지급하고 나머지는 저작권자에게 직접 지급

                                </Radio>

                                </Radio.Group>
                            </Col>
                        </Row>
                    ))
                }
            {/* ================================================= 국내 / 해외 직계약 end ========================================================== */}

            {/* ================================================= 해외 수입 ======================================================================= */}
            {state.states ==='insert'                     
                ?
                <Wrapper>

                {state.sel_type ==='I'                      
                    ?
                <Row gutter={10} className="table marginTop">
                    <div className="table_title">전자책</div>
                    <Col xs={5} lg={5} className="label">
                            계약 기간 <span className="spanStar">*</span>
                        </Col>
                    <Col xs={19} lg={19}>
                        <DatePicker value={stateData.start_date} disabledDate={e=>handleCheckDate('start_date',e)} name="start_date" onChange={handleChangeInput('start_date')}  />
                        ~ <DatePicker value={stateData.end_date} disabledDate={e=>handleCheckDate('end_date',e)} name="end_date" onChange={handleChangeInput('end_date')} />
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        판매 기한 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <DatePicker value={stateData.sale_date} disabledDate={e=>handleCheckDate('sale_date',e)} name="sale_date" onChange={handleChangeInput('sale_date')} />
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        데이터비
                    </Col>
                    <Col xs={19} lg={19}>
                        <Input type="text" name="data_cost" value={stateData.data_cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={handleChangeInput('data_cost')} autoComplete="off" style={{width:'20%'}}/>(USD)
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        선불 저작권료(계약금) <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Input type="text" name="prepaid_royalty" value={stateData.prepaid_royalty.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={handleChangeInput('prepaid_royalty')} autoComplete="off" style={{width:'20%'}}/>(USD)
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        정기 저작권료 <span className="spanStar">*</span> 
                    </Col>
                    <Col xs={19} lg={19}>
                        순수입의 <Input type="number" min="0" name="fixed_royalty" value={stateData.fixed_royalty} onChange={handleChangeInput('fixed_royalty')} autoComplete="off" style={{width:'20%'}}/>%
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        대여/구독 가능 여부 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Radio.Group
                            value={stateData['rental_type']}
                            onChange={handleChangeInput('rental_type')}
                        >
                        <Radio value="Y">가능</Radio>
                        <Radio value="N">불가능</Radio>
                        <Radio value="X">확인 안됨</Radio>
                        </Radio.Group>
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
                            <Col xs={5} lg={5} className="label">
                                중개자에게 지급 범위 <span className="spanStar">*</span>
                            </Col>
                            <Col xs={19} lg={19}>
                                <Radio.Group
                                    value={item['payment_scope1']}
                                    onChange={handleChangeBroker(index,'payment_scope1')}
                                >
                                <Radio value="A">중개자에게 저작권료 모두 지급</Radio>
                                <Radio value="B">중개자에게는 저작권료 중개 수수료
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
                                </Popover>로 <Input type="number" min="0" name="price" value={item.payment_scope2} onChange={handleChangeBroker(index,'payment_scope2')} autoComplete="off" style={{width:'10%'}}/>%
                                를 지급하고 나머지는 저작권자에게 직접 지급

                                </Radio>

                                </Radio.Group>
                            </Col>
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