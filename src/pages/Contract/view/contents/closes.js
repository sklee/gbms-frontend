/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Space, Button, Row, Col,  Modal, Input, Radio, Typography, Checkbox, message, DatePicker, Drawer} from 'antd';
import { ArrowsAltOutlined, ShrinkOutlined, ExclamationCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';
import moment from 'moment';
import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';

import Popout from '@components/Common/popout/popout';

import CloseReport from './closeReport';

import * as ValidationCheck from '../../Validator/inspect.js';

const Wrapper = styled.div`
    width: 100%;
    `;

const DEF_STATE = {
    // DB Data
    end_date: '',
    type: '',
    settlement_copyright_fee_type: '',
    reason_memo: '',
    progress_memo: '',
    loss_price: '',
    detail_memo: ''
};

const contractsDrawer = observer(({type,idx,data,onClose,visible}) => {
    const { commonStore } = useStore();
    const { confirm } = Modal;

    const { Text } = Typography;
    const [contInfo,setContInfo] = useState({})
    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 

    const state = useLocalStore(() => ({
        idx: '',
        copyright_id : '',
        type: '',               //api 타입
        fee_type_txt : '손실 처리할 금액과 세부 내역',
        search_type : 'exports',         //탭 코드
        drawerback : 'drawerWrap',
    }));
    
    useEffect(() => {       
        state.type= type;
        state.idx = idx;
        if(data !== null && data !== undefined){
            if(Object.keys(data).length > 0){
                state.copyright_id = data.id;
            }
        }
    }, [type]);

    const addOnRenewClose = ()=>{
        onClose(false);
    }

    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback(
        (type) => (e) => {
            if(type === 'end_date')  {
                stateData[type] = e;
            }else if(type === 'settlement_copyright_fee_type'){
                stateData[type] = e.target.value;
                if(stateData.settlement_copyright_fee_type==='1'){
                    state.fee_type_txt = '손실 처리할 금액과 세부 내역';
                }else if(stateData.settlement_copyright_fee_type==='2'){
                    state.fee_type_txt = '본사가 지급할 금액과 세부 내역';
                }else if(stateData.settlement_copyright_fee_type==='3'){
                    state.fee_type_txt = '본사가 회수할 금액과 세부 내역';
                }else{
                    state.fee_type_txt = '';
                    stateData.loss_price = '';
                    stateData.detail_memo = '';
                }
            }else if(type === 'loss_price'){
                stateData[type] = e.target.value.replace(/([^0-9])/g, '');
            }else{
                stateData[type] = e.target.value;
            }
        },[],
    );

    //팝업
    const [popoutOpen, setPopoutOpen] = useState(false);
    const closeWindowPortal = () => {
        setPopoutOpen(false);
        onClose(false)
    };

    const handleCheck = () => {
        if(stateData.settlement_copyright_fee_type!=='4'){
            confirm({
                title: '해지 완료',
                content: '결재용 문서를 다운로드 합니다. 결재 후 재무지원팀에 제출해 주세요.',    
                onOk() {
                    handleSubmit();
                },    
                onCancel() {
                    return false;      
                },
            });
        }else{
            confirm({
                title: '해지 완료',
                content: '정산할 금액이 없기 때문에 결재용 문서는 제공하지 않습니다.',    
                onOk() {
                    handleSubmit();
                },    
                onCancel() {
                    return false;      
                },
            });
        }
    };

    const handleSubmit = useCallback(async (e)=> {
        const data = toJS(stateData);
        //validation check
        let res_validate;
        res_validate = ValidationCheck.CloseValidation(data);
        res_validate = {states:true}

        if(res_validate.states!==true){
            Modal.error({
                content: res_validate.msg,        
            });
            return;
        }
        apiSubmit();
        setPopoutOpen(true);
    }, []);  

    const apiSubmit = useCallback(async ()=> {
        const data = {copyright_id:state.copyright_id, closes:toJS(stateData)};
        data.closes.end_date = data.closes.end_date ? moment(data.closes.end_date).format('YYYY-MM-DD') : null

        commonStore.handleApi({
            method : 'POST',
            url : '/contracts-close/'+state.idx,
            data : data
        })
        .then((result) => {
            apiClose()
        })
    }, []);

    const apiClose = useCallback(async ()=> {
        const data = {copyright_id:'',contract_close_yn:''};
        data.copyright_id=state.copyright_id;
        if(stateData.settlement_copyright_fee_type==4){
            data.contract_close_yn = 'Y';
        }else{
            data.contract_close_yn = 'W';
        }

        commonStore.handleApi({
            method : 'POST',
            url : '/contracts-close/'+state.idx,
            data : data
        })
        .then((result) => {
            Modal.success({
                title: result.result,
                onOk(){
                    if(stateData.settlement_copyright_fee_type==4){
                        onClose(false);                            
                    }else{
                        fetchData().then(()=>{
                            setPopoutOpen(true);
                        })
                        // setPopoutOpen(true);
                        // onClose(false);
                    }
                },
            });
        })
    }, []);

    const fetchData = async () => {
        let apply_url = ''
        if(state.type === 'contracts'){
            apply_url = '/contracts/'
        }else{
            apply_url = '/overseas/'
        }
        const result = await commonStore.handleApi({
            url : apply_url+idx,
        })

        if(result){
            if(result.data){
                const copyright = result.data.copyrights.find(e=> e.id === state.copyright_id)
                var contInfo = {}
                contInfo.created_name = result.data.created_info.name
                contInfo.name = result.data.created_info.name
                contInfo.contract_code = result.data.contract_code
                contInfo.created_at = result.data.created_at
                contInfo.copyright_name = copyright.name
                contInfo.ranges = copyright.pivot?.ranges
                contInfo.targets = copyright.pivot?.targets
                setContInfo(contInfo)
            }
        }
    };

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
                title={'해지 등록'}
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
                    <Row gutter={10} className="table">
                        <Col xs={5} lg={5} className="label">
                                해지 적용일
                            </Col>
                        <Col xs={19} lg={19}>
                            <DatePicker value={stateData.end_date}  name="end_date" onChange={handleChangeInput('end_date')} />
                        </Col>
                        <Col xs={5} lg={5} className="label">
                            해지 사유 책임(귀속) <span className="spanStar">*</span>
                        </Col>
                        <Col xs={19} lg={19}>
                            <Radio.Group
                                value={stateData['type']}
                                onChange={handleChangeInput('type')}
                                name="type"
                            >
                            <Radio value="1">본사</Radio>
                            <Radio value="2">저작권자</Radio>
                            <Radio value="3">공동/합의</Radio>
                            </Radio.Group>
                        </Col>
                        <Col xs={5} lg={5} className="label">
                            저작권료/비용 정산 <span className="spanStar">*</span>
                        </Col>
                        <Col xs={19} lg={19}>
                            <Radio.Group
                                value={stateData['settlement_copyright_fee_type']}
                                onChange={handleChangeInput('settlement_copyright_fee_type')}
                                name="settlement_copyright_fee_type"
                            >
                            <Radio value="1">지급한 금액 손실 처리</Radio>
                            <Radio value="2">본사가 지급할 금액 있음</Radio>
                            <Radio value="3">본사가 회수할 금액 있음</Radio>
                            <Radio value="4">정산할 금액 없음</Radio>
                            </Radio.Group>
                        </Col>
                        <Col xs={5} lg={5} className="label">
                            해지 사유 <span className="spanStar">*</span>
                        </Col>
                        <Col xs={19} lg={19}>
                            <Input.TextArea
                                name="reason_memo"
                                rows={4}
                                onChange={handleChangeInput('reason_memo')}
                                value={stateData.reason_memo}
                                autoComplete="off"
                            />
                        </Col>
                        <Col xs={5} lg={5} className="label">
                            진행 경과 <span className="spanStar">*</span>
                        </Col>
                        <Col xs={19} lg={19}>
                            <Input.TextArea
                                name="progress_memo"
                                rows={4}
                                onChange={handleChangeInput('progress_memo')}
                                value={stateData.progress_memo}
                                autoComplete="off"
                            />
                        </Col>
                        {stateData.settlement_copyright_fee_type!=='4'?
                            <Col xs={5} lg={5} className="label">
                                {state.fee_type_txt}
                                <span className="spanStar">*</span>
                            </Col>
                            :<></>}
                        {stateData.settlement_copyright_fee_type!=='4'?
                        <Col xs={19} lg={19}>
                            <Input type="text" name="loss_price" value={stateData.loss_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={handleChangeInput('loss_price')} autoComplete="off" style={{width:'40%'}}/>원
                            <Input.TextArea
                                name="detail_memo"
                                rows={4}
                                style={{marginTop: '10px'}}
                                onChange={handleChangeInput('detail_memo')}
                                value={stateData.detail_memo}
                                autoComplete="off"
                            />
                        </Col>
                        :<></>}
                    </Row>   
                    <Row style={{display: 'block'}}>
                        <p style={{margin: 0}}><ExclamationCircleOutlined /> ‘확인'하면 결재용 문서를 다운로드 받을 수 있습니다.</p>
                        <p style={{margin: 0}}><ExclamationCircleOutlined /> <span style={{color: 'red'}}>결재 후 아래 작업을 꼭 진행해 주세요.</span></p>
                        <p style={{margin: 0}}> - 저작권 계약 화면에서 해지 확정으로 변경하고, 결재 문서를 재무지원팀에 제출</p>
                        <p style={{margin: 0}}> - 해지 계약서를 ‘계약서 파일과 참고사항'에 등록</p>
                    </Row>
                    <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                        <Col>
                            <Button type="primary" htmlType="button" style={{marginLeft:'10px'}} onClick={handleCheck}>
                                확인
                            </Button>
                            <Button htmlType="button" onClick={addOnRenewClose} style={{marginLeft:'10px'}}>
                                취소
                            </Button>
                        </Col>
                    </Row>

                    {popoutOpen && (
                        <Popout closeWindowPortal={closeWindowPortal} scaleSet={{width:1200}}>
                            <CloseReport
                                type={state.type} 
                                states={'insert'}
                                idx={state.idx}
                                copyright_id={state.copyright_id}
                                contInfo={contInfo}
                                data={stateData}
                                visible={popoutOpen}
                                onClose={closeWindowPortal}
                            />
                        </Popout>
                    )}
                </Wrapper>
            :<></>
        }
        </Drawer>
        </Wrapper>
    );
});

export default contractsDrawer;