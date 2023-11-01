/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Space, Button, Row, Col,  Modal, Breadcrumb, Input, Upload,  message, Radio, Popover, Select, Typography, Checkbox} from 'antd';
import { PhoneOutlined ,QuestionOutlined, UploadOutlined, PlusOutlined, CloseOutlined  } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';
import moment from 'moment';

import AddHolder from '../../Search';
import RenewEbooks from './ebooksRenew';
import ExitRegist from './registExit';

import PopupPostCode from '@components/Common/DaumAddress';

const Wrapper = styled.div`
    width: 100%;
    `;

const DEF_STATE = {
    // DB Data
    id : '',
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
    id : '',
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

const contractsDrawer = observer(({type,selType,states,copyId,data,ebooksVal,drawerClass,drawerChk}) => {
    const { commonStore } = useStore();

    const { Text } = Typography;

    const stateData = useLocalStore(() => (type==='contracts'?{ ...DEF_STATE }:(type==='contracts-check'?{ ...DEF_STATE }:{ ...DEF_STATE_OS }))); 

    const state = useLocalStore(() => ({
        type: '',               //api 타입           
        sel_type : '',          //저작권 구분
        states : '',            //상태 (등록,수정,조회 etc)
        search_type : 'ebooks',         //탭 코드
        brokers : [],           //중개자 정보
        status : '',
    }));
    
    useEffect(() => {
        state.type= type;
        state.sel_type= selType;
        state.states= states;
        state.status= data.expired_info==='없음'? '신규' : data.expired_info;
        if(data !== null && data !== undefined){
            if(Object.keys(data).length > 0){
                var temp_type = Object.keys(type==='contracts'?DEF_STATE:DEF_STATE_OS);
                temp_type.forEach((item)=>{
                    if(item === 'start_date' || item === 'end_date' || item ==='prepaid_royalty_date' || item === 'sale_date')  {
                        // stateData[item] = moment(data[item]);
                        if(data[item]===null){
                            stateData[item] = '';
                        }else{
                            // stateData[item] = moment(data[item]);
                            stateData[item] = data[item];
                        }
                    }else{
                        stateData[item] = data[item];
                    }
            });
            }
        }
        stateData.brokers.forEach(item=>{
            getBrokers(item.broker_id);
        });

        // - 신규: 최초 계약 등록한 상태
        // - 자동 연장: 자동 연장 계약인 경우, 최초 계약 기간 종료 후 자동 연장이 적용된 상태
        // - 재계약-대기: 재계약을 했지만, 계약 시작일이 도래하지 않은 상태(예: 오늘이 2022.01.01인데, 재계약 시작일은 2022.01.03) (삭제?)
        // - 재계약: 재계약이고, 시작일이 오늘 및 이미 지난 상태(재계약이 적용됨)
        // - 기간 만료: 자동 연장 계약이 아닌 경우, 계약 종료일이 지난 상태
        // - 종료-대기: 후속 재계약이 있는 경우에는 재계약 시작일 전날까지. 종료를 한 경우에는 종료일이 도래하지 않은 상태 (삭제?)
        // - 종료: 후속 재계약이 있는 경우에는 재계약 시작일부터. 종료를 한 경우에는 종료일이 오늘 및 이미 지난 상태

        // - 해지: 해지됐고, 해지 적용일이 오늘 및 이미 지난 상태 ('세부 계약의 기본 정보' 상태가 '해지'인 경우에 똑같이 적용)
    }, [type]);

    const overlapSearch = (details) => {
        state.brokers = [...state.brokers,details];
        // stateData.broker_id = details.id;
        var temp_broker = DEF_BROKER;
        temp_broker.broker_id = details.id;
        stateData.brokers = [...stateData.brokers,temp_broker];
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

    const [viewRenewVisible, setViewRenewVisible] = useState(false);
    const [viewExitVisible, setViewExitVisible] = useState(false);
    //재계약
    const showRenewDrawer = (e) => {
        if(e==='RECONTRACT'){
            setViewRenewVisible(true);
        }else if(e==='END'){
            setViewExitVisible(true);
        }
        // state.search_type = search_type;
    };

    const addOnRenewClose = () => {
        setViewRenewVisible(false);
    };

    const addOnExitClose = () => {
        setViewExitVisible(false);
    };

    const fetchData = () => {};


    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback(
        (type) => (e) => {
                // stateData[type] =e.target.value;    
                if(type === 'start_date' || type === 'end_date' || type ==='prepaid_royalty_date' || type === 'sale_date')  {
                    stateData[type] = e;
                }else{
                    stateData[type] = e.target.value;
                }
                ebooksVal('ebooks',stateData);
        },[],
    );

    return (
        <Wrapper>
            {/* ================================================= 국내 / 해외 직계약  ========================================================== */}
                <Wrapper>

                {state.sel_type !=='I'                    
                    ?
                <Row gutter={10} className="table marginTop">
                    <div className="table_title">전자책 계약 상태 : {state.status}</div>
                    <Col xs={5} lg={5} className="label">
                            계약 기간  
                        </Col>
                    <Col xs={19} lg={19}>
                    {stateData.start_date} ~ {stateData.end_date}이며, {stateData.extension_year}년 단위로 자동 연장
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        저작권료 지급 기간  
                    </Col>
                    <Col xs={19} lg={19}>
                        {stateData.royalty_term_type==='1'?'계약 기간과 관계 없이 매출 발생하면 지급':'계약 기간 내 매출에 대해서만 지급'}
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        선불 저작권료(계약금)  
                    </Col>
                    <Col xs={19} lg={19}>
                        {stateData.prepaid_royalty!=='0' ? stateData.prepaid_royalty+'원을 '+stateData.prepaid_royalty_date+'까지 지급( 지급함)':'없음'}
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        정기 저작권료  
                    </Col>
                    <Col xs={19} lg={19}>
                        순수입의 {stateData.fixed_royalty}%
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        대여/구독 가능 여부  
                    </Col>
                    {(['신규','자동 연장','재계약']).includes(state.status) ?
                    <Col xs={19} lg={19}>
                        <Radio.Group
                            value={stateData['rental_type']}
                            onChange={handleChangeInput('rental_type')}
                            name="rental_type"
                        >
                        <Radio value="Y">가능</Radio>
                        <Radio value="N">불가능</Radio>
                        <Radio value="X">확인 안됨</Radio>

                        </Radio.Group>
                    </Col>
                    :
                    <Col xs={19} lg={19}>
                        {stateData.rental_type==='Y'?'가능':null}
                        {stateData.rental_type==='N'?'불가능':null}
                        {stateData.rental_type==='X'?'확인 안됨':null}
                    </Col>
                    }
                    <Col xs={5} lg={5} className="label">
                        중개자
                    </Col>
                    <Col xs={19} lg={19}>
                        {state.brokers.map(item => {
                            return (<>{item.name}&nbsp;&nbsp;&nbsp;</> );
                        })}
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        출시 상품  
                    </Col>
                    <Col xs={19} lg={19}>
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        담당자와 등록/수정일  
                    </Col>
                    <Col xs={19} lg={19}>
                        {data.created_info.name} ({moment(data.updated_at).format('YYYY.MM.DD')})
                    </Col>
                    {(['신규','자동 연장','재계약']).includes(state.status) &&
                    <Col xs={5} lg={5} className="label">
                        계약 변경  
                    </Col>
                    }
                    {(['신규','자동 연장','재계약']).includes(state.status) &&
                    <Col xs={19} lg={19}>
                        <Radio.Group
                            >
                            <Radio value="RECONTRACT" onClick={e=>showRenewDrawer('RECONTRACT')}>재계약(기간 연장 등 계약 내용 변경 있음)</Radio>
                            <Radio value="END" onClick={e=>showRenewDrawer('END')}>재계약 없이 계약 종료 처리</Radio>
                        </Radio.Group>
                    </Col>
                    }
                </Row>  
                :<></> 
                }
                {state.sel_type!=='I' &&
                    stateData.brokers.map((item) => (
                        <Row gutter={10} className="table marginTop">
                            <div className="table_title">중개 계약 정보</div>
                            <Col xs={5} lg={5} className="label">
                                중개자명        
                            </Col>
                            <Col xs={19} lg={19}>
                                {state.brokers.find(e=>e.id == item.broker_id)?.name}
                            </Col>
                            <Col xs={5} lg={5} className="label">
                                통화단위  
                            </Col>
                            <Col xs={19} lg={19}>
                                {item.current_unit==='KRW'?'원화(KRW)':null}
                                {item.current_unit==='USD'?'달러(USD)':null}
                                {item.current_unit==='EUR'?'유로(EUR)':null}
                                {item.current_unit==='GBP'?'파운드(GBP)':null}
                                {item.current_unit==='JPY'?'엔(JPY)':null}
                                {item.current_unit==='CNY'?'위안(CNY)':null}
                            </Col>
                            <Col xs={5} lg={5} className="label">
                                정산 보고 주기  
                            </Col>
                            <Col xs={19} lg={19}>
                                {item.settlement_cycle==='COMPANY'?'본사 기준에 따름':null}
                                {item.settlement_cycle==='YEAR'?'1년':null}
                                {item.settlement_cycle==='HALF'?'반기':null}
                            </Col>
                            <Col xs={5} lg={5} className="label">
                                중개자에게 지급 범위  
                            </Col>
                            <Col xs={19} lg={19}>
                                {item.payment_scope1==='A'?'중개자에게 저작권료 모두 지급':null}
                                {item.payment_scope1==='B'?'중개자에게는 저작권료 중개 수수료로 '+item.payment_scope2+'%를 지급하고 나머지는 저작권자에게 직접 지급':null}
                            </Col>
                        </Row>
                    ))
                }
            {/* ================================================= 국내 / 해외 직계약 end ========================================================== */}

            {/* ================================================= 해외 수입 ======================================================================= */}
                <Wrapper>

                {state.sel_type ==='I'                      
                    ?
                <Row gutter={10} className="table marginTop">
                    <div className="table_title">전자책 계약 상태 : {state.status}</div>
                    <Col xs={5} lg={5} className="label">
                            계약 기간  
                        </Col>
                    <Col xs={19} lg={19}>
                        {stateData.start_date}  ~ {stateData.end_date}
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        판매 기한  
                    </Col>
                    <Col xs={19} lg={19}>
                        {stateData.sale_date}
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        데이터비
                    </Col>
                    <Col xs={19} lg={19}>
                        {stateData.data_cost}(USD)
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        선불 저작권료(계약금)  
                    </Col>
                    <Col xs={19} lg={19}>
                        {stateData.prepaid_royalty}(USD)
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        정기 저작권료   
                    </Col>
                    <Col xs={19} lg={19}>
                        순수입의 {stateData.fixed_royalty}%
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        대여/구독 가능 여부  
                    </Col>
                    {(['신규','자동 연장','재계약']).includes(state.status) ?
                    <Col xs={19} lg={19}>
                        <Radio.Group
                            value={stateData['rental_type']}
                            onChange={handleChangeInput('rental_type')}
                            name="rental_type"
                        >
                        <Radio value="Y">가능</Radio>
                        <Radio value="N">불가능</Radio>
                        <Radio value="X">확인 안됨</Radio>

                        </Radio.Group>
                    </Col>
                    :
                    <Col xs={19} lg={19}>
                        {stateData.rental_type==='Y'?'가능':null}
                        {stateData.rental_type==='N'?'불가능':null}
                        {stateData.rental_type==='X'?'확인 안됨':null}
                    </Col>
                    }
                    <Col xs={5} lg={5} className="label">
                        기타 참고사항 
                    </Col>
                    {(['신규','자동 연장','재계약']).includes(state.status) ?
                    <Col xs={19} lg={19}>
                        <Input.TextArea
                            name="etc_memo"
                            rows={4}
                            onChange={handleChangeInput('etc_memo')}
                            value={stateData.etc_memo}
                            autoComplete="off"
                        />
                    </Col>
                    :
                    <Col xs={19} lg={19}>
                        {stateData.etc_memo}
                    </Col>
                    }
                    <Col xs={5} lg={5} className="label">
                        중개자
                    </Col>
                    <Col xs={19} lg={19}>
                        {state.brokers.map(item => {
                            return (<>{item.name}&nbsp;&nbsp;&nbsp;</> );
                        })}
                    </Col>
                    {(['신규','자동 연장','재계약']).includes(state.status) &&
                    <Col xs={5} lg={5} className="label">
                        계약 변경  
                    </Col>
                    }
                    {(['신규','자동 연장','재계약']).includes(state.status) &&
                    <Col xs={19} lg={19}>
                        <Radio.Group
                            >
                            <Radio value="RECONTRACT" onClick={e=>showRenewDrawer('RECONTRACT')}>재계약(기간 연장 등 계약 내용 변경 있음)</Radio>
                            <Radio value="END" onClick={e=>showRenewDrawer('END')}>재계약 없이 계약 종료 처리</Radio>
                        </Radio.Group>
                    </Col>
                    }
                </Row>  
                :<></> 
                }
                {state.sel_type==='I' &&
                    stateData.brokers.map((item) => (
                        <Row gutter={10} className="table marginTop" >
                            <div className="table_title">중개 계약 정보</div>
                            <Col xs={5} lg={5} className="label">
                                중개자명        
                            </Col>
                            <Col xs={19} lg={19}>
                                {state.brokers.find(e=>e.id == item.broker_id)?.name}
                            </Col>
                            <Col xs={5} lg={5} className="label">
                                통화단위  
                            </Col>
                            <Col xs={19} lg={19}>
                                {item.current_unit==='USD'?'달러(USD)':null}
                                {item.current_unit==='EUR'?'유로(EUR)':null}
                                {item.current_unit==='GBP'?'파운드(GBP)':null}
                                {item.current_unit==='JPY'?'엔(JPY)':null}
                                {item.current_unit==='CNY'?'위안(CNY)':null}
                            </Col>
                            <Col xs={5} lg={5} className="label">
                                정산 보고 주기  
                            </Col>
                            <Col xs={19} lg={19}>
                                {item.settlement_cycle==='YEAR'?'1년':null}
                                {item.settlement_cycle==='HALF'?'반기':null}
                            </Col>
                            <Col xs={5} lg={5} className="label">
                                중개자에게 지급 범위  
                            </Col>
                            <Col xs={19} lg={19}>
                                {item.payment_scope1==='A'?'중개자에게 저작권료 모두 지급':null}
                                {item.payment_scope1==='B'?'중개자에게는 저작권료 중개 수수료로 '+item.payment_scope2+'%를 지급하고 나머지는 저작권자에게 직접 지급':null}
                            </Col>
                        </Row>  
                    ))
                }
                {/* {viewSearchVisible === true && (
                    <AddHolder
                        type={'brokers'}
                        visible={viewSearchVisible}
                        onClose={addOnClose}
                        overlapSearch={overlapSearch}
                        reset={fetchData}
                    />
                )} */}
            </Wrapper>
                {viewSearchVisible === true && (
                    <AddHolder
                        type={'brokers'}
                        visible={viewSearchVisible}
                        onClose={addOnClose}
                        overlapSearch={overlapSearch}
                        reset={fetchData}
                    />
                )}
                {viewRenewVisible === true && (
                    <RenewEbooks
                        type={state.type} 
                        selType={state.sel_type} 
                        states={'insert'}
                        copyId={copyId}
                        data={stateData}
                        visible={viewRenewVisible}
                        onClose={addOnRenewClose}
                    />
                )}
                {viewExitVisible === true && (
                    <ExitRegist
                        type={state.type} 
                        selType={state.sel_type} 
                        states={'ebooks'}
                        copyId={copyId}
                        data={stateData.id}
                        visible={viewExitVisible}
                        onClose={addOnExitClose}
                    />
                )}
            </Wrapper>
            {/* ================================================= 해외 수입 end =================================================================== */}

        </Wrapper>
    );
});

export default contractsDrawer;