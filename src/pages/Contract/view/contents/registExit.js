/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Space, Button, Row, Col,  Modal, Input, Radio, Popover, Typography, Checkbox, DatePicker, Drawer} from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';
import moment from 'moment';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';

const Wrapper = styled.div`
    width: 100%;
    `;

const DEF_STATE = {
    id :'',
    contract_end_date :'',
    reason_memo : '',
};

const contractsDrawer = observer(({type,selType,states,copyId,data,onClose,visible}) => {
    const { commonStore } = useStore();

    const { Text } = Typography;

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 

    const state = useLocalStore(() => ({
        type: '',               //api 타입           
        sel_type : '',          //저작권 구분
        states : '',            //상태 (등록,수정,조회 etc)
        copyright_id:null,
        id:null,
        brokers : [],           //중개자 정보
        drawerback : 'drawerWrap',
    }));
    
    useEffect(() => {       
        state.type= type;
        state.sel_type= selType;
        state.states= states;
        state.copyright_id = copyId.copy_id;
        state.id = data;
    }, [type]);


    const visibleClose = ()=>{
        onClose(false);
    }

    const fetchData = () => {};
    

    const handleChangeInput = useCallback(
        (type) => (e) => {
            if(type==='contract_end_date'){
                if(!handleCheckDate(type,e)){
                    stateData[type] = e;
                }else{
                    stateData[type] = '';
                }
            }else{
                stateData[type] =e.target.value;
            }
        },[],
    );

    const handleCheckDate = useCallback(
        (date) => {
            return date && date < moment().subtract(1, 'day');
        },[],
    );

    const handleSubmit = useCallback(async (e)=> {
        //formatting
        var data = {copyright_id : state.copyright_id};
        data[state.states] = {
            id: state.id,
            contract_end_date : moment(stateData.contract_end_date).format('YYYY-MM-DD'),
            reason_memo : stateData.reason_memo
        };

        delete data.contract_end_date


        //validate
        let msg = '';
        let states = true;
        if(!stateData.contract_end_date){
            msg = '종료 적용일을 선택해주세요.';
            states = false;
        }else if(!stateData.reason_memo){
            msg = '종료 사유를 작성해 주세요.';
            states = false;
        }

        if(!states){
            Modal.error({
                content: msg,        
            });
            return;
        }

        commonStore.handleApi({
            method : 'POST',
            url : '/contracts-end/'+copyId.id,
            data : data
        })
        .then((result) => {
            Modal.success({
                content: '계약이 종료되었습니다.',
                onOk() {
                    onClose()
                },
            })
        })  
    },[],);

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
                title={'종료 등록'}
                placement='right'
                onClose={visibleClose}
                closable={false}
                visible={visible}
                className={state.drawerback}
                keyboard={false}
                extra={
                    <>
                        <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={visibleClose}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >
            <Wrapper>
                <Row gutter={10} className="table">
                    <Col xs={5} lg={5} className="label">
                        종료 적용일 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <DatePicker value={stateData.contract_end_date} disabledDate={e=>handleCheckDate(e)} name="contract_end_date" onChange={handleChangeInput('contract_end_date')}  />
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        종료 사유 <span className="spanStar">*</span>
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
                </Row>
                <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                    <Col>
                        <Button type="primary" htmlType="button" style={{marginLeft:'10px'}} onClick={handleSubmit}>
                            확인
                        </Button>
                        <Button htmlType="button" onClick={visibleClose} style={{marginLeft:'10px'}}>
                            취소
                        </Button>                        
                    </Col>
                </Row>
                
            </Wrapper>
            </Drawer>
        </Wrapper>
    );
});

export default contractsDrawer;