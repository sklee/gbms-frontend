import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {Row, Col, Drawer, Input, Button, Space, Radio, Modal} from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';

import styled from 'styled-components';
import { toJS } from 'mobx';



const Wrapper = styled.div`
    width: 100%;
`;



const DEF_STATE = {
    // DB Data

    approval_result: '',            
    remark: '',                  
  
};

const ApprovalRegistration = observer(({visible , visibleClose, drawerChk, idx}) =>{
    const stateData = useLocalStore(() => ({ ...DEF_STATE }));
    const state = useLocalStore(() => ({
        drawerback: 'drawerInnerWrap',
    }));

    useEffect(() => {
        if(drawerChk !== 'Y'){
            state.drawerback = 'drawerWrap'
        }        
    }, [drawerChk]);

    const handleChangeInput = useCallback((type) => (e) => {
        stateData[type] = e.target.value;
    },[],);
    
    const onClose=()=>{
        visibleClose('Y');
        stateData.approval_result = '';
        stateData.remark = '';
    }

    const handleApiSubmit = useCallback(async ()=> {
        
        var data = toJS(stateData);
        console.log(data)
        console.log(idx)

        let chkVal = true;       

        if(stateData.approval_result == ''){
            Modal.error({
                content: '결재를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }
        // onClose();
        // return;
        if(chkVal ===true  ){    
            var axios = require('axios');

            var config={
                method:'PUT',
                url:process.env.REACT_APP_API_URL +'/api/v1/billing-approvals/'+idx,
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
                            onClose();
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
                title='결재 등록'
                visible={visible}
                visibleClose={visibleClose}
                className={state.drawerback}
                closable={false}
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
                <Row gutter={10} className="table">
                    <Col xs={6} lg={6} className="label">결재 <span className="spanStar">*</span></Col>
                    <Col xs={18} lg={18}>
                        <Radio.Group name="approval_result" onChange={handleChangeInput('approval_result')}>
                            <Radio value={1}>승인</Radio>
                            <Radio value={2}>반려</Radio>
                        </Radio.Group>
                    </Col>
                    <Col xs={6} lg={6} className="label">검토 의견</Col>
                    <Col xs={18} lg={18}>
                        <Input.TextArea name="remark" onChange={handleChangeInput('remark')}/>
                    </Col>
                </Row>
                <Row style={{marginTop: 10}}>
                    <Col xs={24} lg={24} style={{textAlign: 'center'}} ><Button type="primary" onClick={(e)=>handleApiSubmit()}>확인</Button></Col>
                </Row>
            </Drawer>
        </Wrapper>
    )
})

export default ApprovalRegistration;