/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Space, Button, Row, Col,  Modal, Breadcrumb, Input, Upload,  message, Radio, Popover, Select, Typography, Checkbox, DatePicker} from 'antd';
import { PhoneOutlined ,QuestionOutlined, UploadOutlined, PlusOutlined  } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';
import moment from 'moment';


const Wrapper = styled.div`
    width: 100%;
    `;

const DEF_STATE = {
    // DB Data
    start_date: '',
    end_date: '',
    extension_year: '',
    royalty_term_type: '',
    deduction_rate: '',
    payment_rate: '',
    company_use_yn: '',
    company_use_rate: ''
};

const contractsDrawer = observer(({type,selType,states,data,othersVal}) => {
    const { commonStore } = useStore();

    const { Text } = Typography;
    const { Option } = Select;

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 

    const state = useLocalStore(() => ({
        type: '',               //api 타입           
        sel_type : '',          //저작권 구분
        states : '',            //상태 (등록,수정,조회 etc)
        search_type : 'others',         //탭 코드

    }));
    
    useEffect(() => {       
        state.type= type;
        state.sel_type= selType;
        state.states= states;
        if(data !== null && data !== undefined){
            if(Object.keys(data).length > 0){
                var temp_type = Object.keys(DEF_STATE);
                temp_type.forEach((item)=>{
                    if(item === 'start_date' || item === 'end_date')  {
                        if(data[item]===null||data[item]===''){
                            stateData[item] = '';
                        }else{
                            stateData[item] = moment(data[item]);
                        }
                    }else{
                        stateData[item] = data[item];
                    }
                    // stateData[item] = data[item]
            });
            }
        }
    }, [type]);


    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback(
        (type) => (e) => {
            if(type === 'start_date' || type === 'end_date')  {
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
            }else{
                stateData[type] = e.target.value;
            }
            othersVal('others',stateData);
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

    return (
        <Wrapper>
            {/* ================================================= 국내 / 해외 직계약  ========================================================== */}
            {stateData.sel_type !=='I'                     
                ?
                <Wrapper>
                    <Row gutter={10} className="table marginUp">
                        <div className="table_title">계약 정보</div>
                        <Col xs={5} lg={5} className="label">
                                계약 기간 <span className="spanStar">*</span>
                            </Col>
                        <Col xs={19} lg={19}>
                            <DatePicker value={stateData.start_date} disabledDate={e=>handleCheckDate('start_date',e)} name="start_date" onChange={handleChangeInput('start_date')} style={{width: 115, textAlign: 'right'}} />
                            ~<DatePicker value={stateData.end_date} disabledDate={e=>handleCheckDate('end_date',e)} name="end_date" onChange={handleChangeInput('end_date')} style={{width: 115, textAlign: 'right'}}/> 이며, &nbsp;
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
                            제3자가 사용할 경우 <br/> 저작권료 <span className="spanStar">*</span>
                        </Col>
                        <Col xs={19} lg={19}>
                            영업 및 판매관리 비용으로 매출의 &nbsp;
                            <Input type="number" min="0" name="deduction_rate" value={stateData.deduction_rate} onChange={handleChangeInput('deduction_rate')} autoComplete="off" style={{width: 55, textAlign: 'right'}}/>%를 공제하고, 
                            나머지 금액의 &nbsp;
                            <Input type="number" min="0" name="payment_rate" value={stateData.payment_rate} onChange={handleChangeInput('payment_rate')} autoComplete="off" style={{width: 55, textAlign: 'right'}}/>
                            %를 저작권료로 지급
                        </Col>
                        <Col xs={5} lg={5} className="label">
                            본사가 사용할 경우 <br/> 저작권료 <span className="spanStar">*</span>
                        </Col>
                        <Col xs={19} lg={19}>
                        <Radio.Group
                                value={stateData['company_use_yn']}
                                onChange={handleChangeInput('company_use_yn')}
                            >
                            <Radio value="N">계약하지 않음</Radio>
                            <Radio value="Y">계약함</Radio>

                            </Radio.Group>
                            <br/>
                            {stateData.company_use_yn == "Y" && 
                            <div>
                            순수입의 &nbsp;
                            <Input type="number" min="0" name="company_use_rate" value={stateData.company_use_rate} onChange={handleChangeInput('company_use_rate')} autoComplete="off" style={{width: 55, textAlign: 'right'}}/>
                            %를 저작권료로 지급
                            </div>
                            }
                        </Col>
                    </Row>  
                </Wrapper>
            :<></>
        }
        </Wrapper>
    );
});

export default contractsDrawer;