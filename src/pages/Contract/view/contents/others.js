/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Space, Button, Row, Col,  Modal, Breadcrumb, Input, Upload,  message, Radio, Popover, Select, Typography, Checkbox, DatePicker} from 'antd';
import { PhoneOutlined ,QuestionOutlined, UploadOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';
import moment from 'moment';

import RenewOthers from './othersRenew';
import ExitRegist from './registExit';

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

const contractsDrawer = observer(({type,selType,states,copyId,data,othersVal}) => {
    const { commonStore } = useStore();

    const { Text } = Typography;
    const { Option } = Select;

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 

    const state = useLocalStore(() => ({
        type: '',               //api 타입           
        sel_type : '',          //저작권 구분
        states : '',            //상태 (등록,수정,조회 etc)
        search_type : 'others', //탭 코드
        status : '',            //계약 상태
    }));
    
    useEffect(() => {       
        state.type= type;
        state.sel_type= selType;
        state.states= states;
        state.status= data.expired_info==='없음'? '신규' : data.expired_info;
        if(data !== null && data !== undefined){
            if(Object.keys(data).length > 0){
                var temp_type = Object.keys(DEF_STATE);
                temp_type.forEach((item)=>{
                    if(item === 'start_date' || item === 'end_date')  {
                        if(data[item]===null){
                            stateData[item] = '';
                        }else{
                            // stateData[item] = moment(data[item]);
                            stateData[item] = data[item];
                        }
                    }else{
                        stateData[item] = data[item];
                    }
                    // stateData[item] = data[item]
            });
            }
        }
    }, [type]);

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

    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback(
        (type) => (e) => {
            if(type === 'start_date' || type === 'end_date')  {
                stateData[type] = e;
            }else{
                stateData[type] = e.target.value;
            }
            othersVal('others',stateData);
        },[],
    );

    return (
        <Wrapper>
            {/* ================================================= 국내 / 해외 직계약  ========================================================== */}
            {stateData.sel_type !=='I'                     
                ?
                <Wrapper>
                    <Row gutter={10} className="table marginTop">
                        <div className="table_title">2차 저작권 계약 상태 : {state.status}</div>
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
                            제3자가 사용할 경우 저작권료
                        </Col>
                        <Col xs={19} lg={19}>
                            영업 및 판매관리 비용으로 매출의 
                            {stateData.deduction_rate}%를 공제하고, 나머지 금액의 
                            {stateData.payment_rate}%를 저작권료로 지급
                        </Col>
                        <Col xs={5} lg={5} className="label">
                            본사가 사용할 경우 저작권료
                        </Col>
                        <Col xs={19} lg={19}>
                            {stateData.company_use_yn==='N'?'계약하지 않음':null}
                            {stateData.company_use_yn==='Y'?'순수입의 '+stateData.company_use_rate+'%를 저작권료로 지급':null}
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
                    {viewRenewVisible === true && (
                        <RenewOthers
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
                        states={'others'}
                        copyId={copyId}
                        data={stateData.id}
                        visible={viewExitVisible}
                        onClose={addOnExitClose}
                    />
                )}
                </Wrapper>
            :<></>
        }
        </Wrapper>
    );
});

export default contractsDrawer;