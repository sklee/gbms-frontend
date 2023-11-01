import React, { useCallback, useEffect, useMemo, useState,useRef } from 'react';
import {Row, Col, Drawer, Input, Button, Space, Modal} from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import { toJS } from 'mobx';

import styled from 'styled-components';



const Wrapper = styled.div`
    width: 100%;
`;

const DEF_STATE = {
    // DB Data

    billing_status: '',     // 6:본인 취소, 12:재무팀 취소
    remark: '',             

};

const ChargeCancel = observer(({visible , onClose, drawerChk, idx, createdId, userInfoID}) =>{
    const stateData = useLocalStore(() => ({ ...DEF_STATE }));

    const state = useLocalStore(() => ({
        drawerback: 'drawerWrap',
    }));

    useEffect(() => {
        if(drawerChk !== 'Y'){
            state.drawerback = 'drawerWrap'
        }        
    }, [drawerChk]);

    const chkOnClose = () => {
        //데이터 초기화
        for (const key in DEF_STATE) {
            stateData[key] = DEF_STATE[key];
        }    
        onClose('Y');
    };

    const handleChangeInput = useCallback((type) => (e) => {
        stateData[type] = e.target.value;
        
    },[],);
    
    const handleApiSubmit = useCallback(async ()=> {        
        
        if(userInfoID === createdId){
            stateData.billing_status = 6;
        }else{
            stateData.billing_status = 12;
        }

        var data = toJS(stateData);
        // console.log(data)
        // return;
        let chkVal = true;       

        if(stateData.remark == ''){
            Modal.error({
                content: '청구 취소 내용을 작성해주세요.',        
            });
            chkVal = false;
            return;
        }
        // return;
        if(chkVal === true){
            var axios = require('axios');

            var config={
                method:'PUT',
                url:process.env.REACT_APP_API_URL +'/api/v1/billings/'+idx,
                headers:{
                    'Accept':'application/json',
                },
                    data:data
                };
                
            axios(config)
            .then(function(response){
                if(response.data.success != false){
                    Modal.success({
                        title: response.data.result,
                        onOk(){
                            chkOnClose();
                        },
                    });
                }else{
                    Modal.error({
                        content:(<div>
                                    <p>등록시 문제가 발생하였습니다.</p>
                                    <p>재시도해주세요.</p>
                                    <p>오류코드: {response.data.message}</p>
                                </div>)
                    });  
                }
            })
            .catch(function(error){
                console.log(error.response.status);
                Modal.error({
                    title : '등록시 문제가 발생하였습니다.',
                    content : '오류코드:'+error.response.status
                });  
            });
        }
            
    }, []);
    
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
                title='청구 취소 내용'
                visible={visible}
                onClose={onClose}
                className={state.drawerback}    
                closable={false}
                keyboard={false}
                extra={
                    <>
                        <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={onClose}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >
                <Row gutter={10} >
                    <Col xs={24} lg={24}>* 입력한 내용은  이미 결재한 결재자도 볼 수 있으며, 청구 취소를 다시 취소할 수는 없습니다. </Col>
                    <Col xs={24} lg={24} style={{marginTop: 10, marginBottom: 20}}>
                        <Input.TextArea rows={4} name="remark" onChange={handleChangeInput('remark')} value={stateData.remark}/>
                    </Col>
                    <Col xs={24} lg={24} style={{textAlign: 'center'}} ><Button type="primary" onClick={(e)=>handleApiSubmit()}>확인</Button></Col>
                </Row>
            </Drawer>
        </Wrapper>
    )
})

export default ChargeCancel;