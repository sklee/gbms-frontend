/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Space, Button, Row, Col,  Modal, Breadcrumb, Input, Drawer,  message, Radio, Popover, Select, Typography} from 'antd';
import { PhoneOutlined ,QuestionOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';


import PopupPostCode from '@components/Common/DaumAddress';
import ChkDrawer from './chkList';

const Wrapper = styled.div`
    width: 100%;
    `;

const DEF_STATE = {
    // DB Data
    type:'',
    name:'',
    public_name: '',
    email: '',
    introduction: '',
    memo: '',    
};

const contributorsDrawer = observer(({type,onClose,reset,classChk}) => {
    const { commonStore } = useStore();

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 

    const state = useLocalStore(() => ({
        type: '',

        keywordTxt : '',    //실명,주민,사업자번호 값(중복확인값)
        chkData : [],       //실명 중복 리스트 데이터                
        overlapChk : 'N',   //실명 중복 확인여부 체크

    }));
    
    useEffect(() => {       
        state.type= type;
    }, [type]);


    const visibleClose = () => {
        //데이터 초기화
        for (const key in DEF_STATE) {
            stateData[key] = DEF_STATE[key];
        }
        state.overlapChk= 'N';
        onClose(false);
    };    

    //추가 후 리스트 리셋
    const resetChk = ()=>{
        reset(true);
    }


    //drawer class
    const classChkBtn = (val)=>{
        if(val === 'drawerback'){
            classChk('Y');
        }else{
            classChk('N');
        }        
    }

    //실명 중복리스트
    const [chkVisible, setChkVisible] = useState(false);
    const chkListDrawer = () => {
        console.log(state.keywordTxt)
        if(state.keywordTxt != ""){
            // chkData();
            // classChkBtn('drawerback');
            // if(state.chkData){
            //     setChkVisible(true);
            // }   
            classChkBtn('drawerback');
            setChkVisible(true);
        }else{
            Modal.error({
                content: '성명/사업자명(실명)을 작성 후 중복확인 버튼을 클릭해주세요.',        
            }); 
        }
        
    };

    //실명 중복체크 리스트 닫기
    const chkOnClose = () => {
        classChkBtn();
        setChkVisible(false);
    };

    //실명 중복체크에 대한 확인
    const overlapChk = () => {
        state.overlapChk = 'Y';
    };

    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback(
        (type) => (e) => {
            var engChk = /[^a-z|A-Z]/g;
            var numChk = /[^0-9]/g;
            var korChk =/[^ㄱ-ㅎ|가-힣]/g;
            var etcChk =/[^a-z|A-Z|~!@#$%^&*()_+|<>?:{},.]/g;
            var emailChk =/[^\.@a-z|A-Z|0-9]/g;
            var swiftChk =/[^a-z|A-Z|0-9]/g;
            var depositorEngChk =/[^a-z|A-Z|,.]/g;
            var accountnoChk =/[^\-0-9]/g;
            var taxrateChk =/[^\.0-9]/g;
            var nameEngChk =/[^a-zA-Z0-9.,\s-]/g;
            var addressChk =/[^\s|.,|a-z|A-Z|0-9]/g;

            var key = type+'error'

            if(type === 'email'){
                if(emailChk.test(e.target.value)){
                    message.warning({ content: '영문과 특수문자만 입력할 수 있습니다.', key});       
                }else{
                    stateData[type] = e.target.value.replace(/[^\.@a-z|A-Z|0-9]/g,'',);   
                } 
            }else{
                if(type === 'name'){
                    state.overlapChk='N'
                    state.keywordTxt = e.target.value;
                }
                stateData[type] = e.target.value;
            }
            
                
        },[],
    );
    

    const chkData = useCallback(async () => {
        var axios = require('axios');

        var config = {
            method: 'GET',
            url:process.env.REACT_APP_API_URL +'/api/v1/'+state.type+'?display=10&page=1&sort_by=date&order=desc&keyword='+state.keywordTxt,
            headers: {
                Accept: 'application/json',
            },
        };
        axios(config)
        .then(function (response) {                
            response.data.data.map((e, number) => {
                e.cnt = response.data.meta.total -number;
            });
            state.chkData= response.data.data;
        })
        .catch(function (error) {
            console.log(error.response);
            if (error.response.status === 401) {
                Modal.warning({
                    title: '오류가 발생했습니다.',
                    content : '오류코드 : '+error.response.status                    
                });
            } 
        });
      }, []);

    //이메일확인
    const handleEmailChk = useCallback((type) => (e) => {
        const emailRegex =/^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
        
        if(e.target.value != ''){
            if(emailRegex.test(e.target.value) == false){
                message.warning('올바른 이메일 주소를 입력해주세요.');
                stateData[type] ='';
            } else{
                stateData[type] = e.target.value;
            }
        } 
    },[],);


    //등록
    const handleSubmit = useCallback(async (e)=> {

        const data = toJS(stateData);

        let chkVal = true;

        if(stateData['type']== ""){
            Modal.error({
                content: '유형을 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData['name'] == ""){
            state.overlapChkText ='N';
            Modal.error({
                content: '성명/사업자명(실명)을 작성해주세요.',        
            });
            chkVal = false;
            return;
        }else{
            if(state.overlapChk === "N" ){
                Modal.error({
                    content: '성명/사업자명(실명) 중복확인을 해주세요.',        
                });
                chkVal = false;
                return;
            }
        }        

        if(stateData['public_name'] == ""){
            Modal.error({
                content: '성명/사업자명(공개용)을 작성해주세요.',        
            });
            chkVal = false;
            return;
        }


       
        if(chkVal == true){
            var axios = require('axios');

            var config={
                method:'POST',
                url:process.env.REACT_APP_API_URL +'/api/v1/'+state.type,
                headers:{
                    'Accept':'application/json',
                },
                    data:data
                };
                
            axios(config)
            .then(function(response){
                //console.log(response);
                if(response.data.id != ''){
                    Modal.success({
                        title: response.data.result,
                        onOk(){
                            resetChk();
                            visibleClose();
                        },
                    });
                }else{
                    Modal.error({
                        content:(<div>
                                    <p>등록시 문제가 발생하였습니다.</p>
                                    <p>재시도해주세요.</p>
                                    <p>오류코드: {response.data.error}</p>
                                </div>)
                    });  
                }
            })
            .catch(function(error){
                console.log(error.response) 
                Modal.error({
                    title: '오류가 발생했습니다. 재시도해주세요.',
                    content: '오류코드:'+error.response.status,  
                });    
            });
        }       
    }, []);  


    return (
        <Wrapper>
            <Row gutter={10} className="table">        
                <Col xs={24} lg={6} className="label">
                    유형 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={18}>
                    <Radio.Group
                        value={stateData['type']}
                        onChange={handleChangeInput('type')}
                        required
                    >
                    <Radio value="1">개인</Radio>
                    <Radio value="2">사업자</Radio>
                    </Radio.Group>
                </Col>

                <Col xs={24} lg={6} className="label">
                    성명/사업자명(실명) <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={18}>
                    <Input.Group>
                        <Row>
                            <Col span={5} style={{padding: '0 10px 0 0'}}>
                                <Input
                                    type="text"
                                    name="name"
                                    value={stateData.name}
                                    onChange={handleChangeInput('name')}
                                    autoComplete="off"
                                />
                            </Col>
                            <Col span={10} style={{padding: '0 10px 0 0'}}>
                                <Input
                                    type="hidden"
                                    id="overlapChk"
                                    name="overlapChk"
                                    value={state.overlapChk}
                                />
                                <Button
                                    type="primary"
                                    onClick={chkListDrawer}
                                    className="btn_inner"
                                    style={{ width: '135px' }}
                                >
                                    중복 확인(필수)
                                </Button>
                            </Col>
                        </Row>
                    </Input.Group>
                </Col>

                <Col xs={24} lg={6} className="label">
                    성명/사업자명(공개용) <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={18}>
                    <Input className="tableInput" type="text" name="public_name" value={stateData.public_name} onChange={handleChangeInput('public_name')} autoComplete="off"/> 
                </Col>

                <Col xs={24} lg={6} className="label">
                    이메일
                </Col>
                <Col xs={24} lg={18}>
                    <Input className="tableInput" type="text" name="email" value={stateData.email} onChange={handleChangeInput('email')}  onBlur={handleEmailChk('email')}   autoComplete="off"/> 
                </Col>

                <Col xs={24} lg={6} className="label" style={{textAglign:'center'}}>
                    기본 소개글<br/>
                    (서점, 홈페이지용)
                </Col>
                <Col xs={24} lg={18}>
                    <Input.TextArea name="introduction" rows={4} value={stateData.introduction} onChange={handleChangeInput('introduction')} autoComplete="off"/>
                </Col>

                <Col xs={24} lg={6} className="label">
                    기타 참고사항
                </Col>
                <Col xs={24} lg={18}>
                    <Input.TextArea name="memo" rows={4}  onChange={handleChangeInput('memo')} value={stateData.memo} autoComplete="off"/>
                </Col>
            </Row>       
            
            <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                <Col>
                    <Button type="primary" htmlType="button" onClick={handleSubmit}>
                        확인
                    </Button>
                    <Button htmlType="button" onClick={visibleClose} style={{marginLeft:'10px'}}>
                        취소
                    </Button>                        
                </Col>
            </Row> 
        
            
            { chkVisible === true &&
                <ChkDrawer  
                    chkVisible={chkVisible}
                    chkOnClose={chkOnClose}
                    overlapChkText={overlapChk}
                    authorNameData={state.chkData}
                    typeChk={state.type}
                    keywordTxt={state.keywordTxt}
                />            
                
            }            

        </Wrapper>
    );
});

export default contributorsDrawer;