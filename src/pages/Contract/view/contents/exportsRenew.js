/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Space, Button, Row, Col,  Modal, Input, Radio, Typography, Checkbox, DatePicker, Drawer} from 'antd';
import { ArrowsAltOutlined, ShrinkOutlined, CloseOutlined } from '@ant-design/icons';
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
    payment_rate: ''
};

const contractsDrawer = observer(({type,selType,states,copyId,data,onClose,visible}) => {
    const { commonStore } = useStore();

    const { Text } = Typography;

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 

    const state = useLocalStore(() => ({
        type: '',               //api 타입           
        sel_type : '',          //저작권 구분
        states : '',            //상태 (등록,수정,조회 etc)
        search_type : 'exports',         //탭 코드
        drawerback : 'drawerWrap',
    }));
    
    useEffect(() => {       
        state.type= type;
        state.sel_type= selType;
        state.states= states;
        if(data !== null && data !== undefined){
            if(Object.keys(data).length > 0){
                var temp_type = Object.keys(DEF_STATE);
                temp_type.forEach((item)=>{
                    if(item==='start_date'||item==='end_date'){
                        stateData[item] = moment(data.end_date).add(1,'days');
                    }
                    // stateData[item] = data[item];
                });
            }
        }
    }, [type]);

    const addOnRenewClose = ()=>{
        onClose(false);
    }

    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback(
        (type) => (e) => {
            if(type === 'start_date' || type === 'end_date')  {
                if(moment(e).format('YYYY-MM-DD')<data.end_date){
                    Modal.error({
                        content:(<div>
                                    <p></p>
                                    <p>재계약의 시작일이 기존 계약 기간과 겹칩니다.</p>
                                    <p>그래도 ‘확인'을 선택하면 재계약 시작일의 전날로 기존 계약은 종료된 것으로 변경합니다.</p>
                                </div>)
                    });
                }
                stateData[type] = e;
            }else if(type=== 'extension_year'){
                stateData[type] = e.target.value.replace(/([^0-9])/g, '').slice(0, 1);
            }else{
                stateData[type] = e.target.value;
            }
        },[],
    );

    const handleSubmit = useCallback(async (e)=> {
        //formatting
        var data = toJS(stateData);

        //validate
        var res;
        if(state.type==='contracts'){
            res = validateContracts();
        }else{
            return false;
        }

        if(!res.states){
            Modal.error({
                content: res.msg,        
            });
            return;
        }

        //submit
        data.start_date = moment(data.start_date).format('YYYY-MM-DD')
        data.end_date = moment(data.end_date).format('YYYY-MM-DD')

        const send_data = {
            copyright_id : copyId.copy_id,
            exports : data
        }

        commonStore.handleApi({
            method : 'POST',
            url : '/contracts-add/'+copyId.id,
            data : send_data
        })
        .then((result) => {
            Modal.success({
              content: '등록이 완료되었습니다.',
              onOk() {
                onClose()
              },
            })
        })
    },[],);

    const validateContracts = ()=>{
        var exports = toJS(stateData);
        var msg = '';
        var states = false;
        if(Object.keys(exports).length < 1){
            msg  = '수출 저작권 정보를 입력하세요.';
            return {states : states, msg : msg};
        }
        if(exports.start_date === '' || exports.end_date === '' || exports.extension_year === ''){
            msg  = '2차 저작권 계약 기간을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(exports.royalty_term_type === '' ){
            msg  = '저작권료 지급 기간을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(exports.deduction_rate === '' || exports.payment_rate === '' ){
            msg  = '저작권료을 입력하세요.';
            return {states : states, msg : msg};
        }

        states = true;
        return {states : states, msg : msg};
    }

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
                title={'재계약 등록'}
                placement='right'
                onClose={addOnRenewClose}
                closable={false}
                visible={visible}
                className={state.drawerback}
                keyboard={false}
                extra={
                    <>
                        <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={addOnRenewClose}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >
            {stateData.sel_type !=='I'                     
                ?
                <Wrapper>
                    <Row gutter={10} className="table marginTop">
                        <div className="table_title">수출 저작권</div>
                        <Col xs={5} lg={5} className="label">
                                계약 기간 <span className="spanStar">*</span>
                            </Col>
                        <Col xs={19} lg={19}>
                            <DatePicker value={stateData.start_date} name="start_date" onChange={handleChangeInput('start_date')} style={{width: 115, textAlign: 'right'}} />
                            ~<DatePicker value={stateData.end_date}  name="end_date" onChange={handleChangeInput('end_date')} style={{width: 115, textAlign: 'right'}}/> 이며, &nbsp;
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
                            저작권료 <span className="spanStar">*</span>
                        </Col>
                        <Col xs={19} lg={19}>
                            영업 및 판매관리 비용으로 매출의 &nbsp;
                            <Input type="number" min="0" name="deduction_rate" value={stateData.deduction_rate} onChange={handleChangeInput('deduction_rate')} autoComplete="off" style={{width: 55, textAlign: 'right'}}/>%를 공제하고, 
                            나머지 금액의 &nbsp;
                            <Input type="number" min="0" name="payment_rate" value={stateData.payment_rate} onChange={handleChangeInput('payment_rate')} autoComplete="off" style={{width: 55, textAlign: 'right'}}/>
                            %를 저작권료로 지급
                        </Col>
                    </Row>
                    <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                        <Col>
                            <Button type="primary" htmlType="button" style={{marginLeft:'10px'}} onClick={handleSubmit}>
                                확인
                            </Button>
                            <Button htmlType="button" onClick={addOnRenewClose} style={{marginLeft:'10px'}}>
                                취소
                            </Button>                        
                        </Col>
                    </Row>
                </Wrapper>
            :<></>
        }
        </Drawer>
        </Wrapper>
    );
});

export default contractsDrawer;