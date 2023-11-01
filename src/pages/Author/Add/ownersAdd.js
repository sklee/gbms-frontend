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
import { forEach } from 'jszip';
import e from 'cors';

const Wrapper = styled.div`
    width: 100%;
    `;

const DEF_STATE = {
    // DB Data
    type: '',
    name: '',
    country: '',
    address: '',
    tax_rate: '',
    memo: '' 
    
};

const ownersDrawer = observer(({type,onClose,reset, classChk}) => {
    const { commonStore } = useStore();

    const { Text } = Typography;

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 

    const state = useLocalStore(() => ({
        type: '',

        chkData : [],       //실명 중복 리스트 데이터                
        overlapChk : 'N',   //실명 중복 확인여부 체크
        keywordTxt : '',    //실명text

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
                content: '성명/사업자명을 작성 후 중복확인 버튼을 클릭해주세요.',        
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

            var korChk =/[^ㄱ-ㅎ|가-힣]/g;
            var taxrateChk =/[^\.0-9]/g;
            var nameEngChk =/[^a-zA-Z0-9.,\s-]/g;
            var addressChk =/[^\s|.,|a-z|A-Z|0-9]/g;

            var key = type+'error'

            if(type ==='address'){
                if(addressChk.test(e.target.value)){
                    message.warning({ content: '영문과 숫자, 일부 특수문자만 입력 가능합니다.', key});      
                }else{
                    stateData[type] = e.target.value.replace(  /[^\s|.,|a-z|A-Z|0-9]/g, '');
                }
                
            }else if (type === 'name'){
                state.overlapChk='N'
                if(nameEngChk.test(e.target.value)){
                    message.warning({ content: '영문과 일부 특수문자만 입력 가능합니다.', key});   
                }else{
                    stateData[type] = e.target.value.replace( /[^a-zA-Z0-9.,\s-]/g, '');
                    state.keywordTxt = e.target.value.replace( /[^a-zA-Z0-9.,\s-]/g, '');
                }           
   
            }else if (type === 'country'){
                if(korChk.test(e.target.value)){
                    message.warning({ content: '한글만 입력 가능합니다.', key});   
                }else{
                    stateData[type] = e.target.value.replace(/[^ㄱ-ㅎ|가-힣]/g, '');
                } 
 
            }else if(type === 'tax_rate'){
                if(taxrateChk.test(e.target.value)){
                    message.warning({ content: '숫자와 일부 특수문자만 입력 가능합니다.', key});   
                }else{

                    var tax_rate = e.target.value.replace(/[^\.0-9]/g, '');
                    
                    var tmp = '';
                    if(tax_rate.length > 2){
                        tax_rate = tax_rate.replace('.', '');
                        tmp =  tax_rate.substr(0, 2) +'.'+ tax_rate.substr(2, 1);
                    }else{
                        tax_rate = tax_rate.replace('.', '');
                        tmp =  tax_rate
                    }
                    stateData[type] =tmp
                }             
            }else{                   
                stateData[type] = e.target.value;
            }                 
        },[],
    );
     
      
    //중복체크(이름)
    const handleChange = useCallback((type) => (e) => {
        if(e.target.value){
            state.keywordTxt = e.target.value;
            chkData();
        }
    },[],);
    
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

            console.log(response);
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

    //등록
    const handleSubmit = useCallback(async (e)=> {
        const data = toJS(stateData);

        let chkVal = true;

        if(stateData['type']=== ""){
            Modal.error({
                content: '유형을 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData['name'] === ""){
            Modal.error({
                content: '성명/사업자명을 작성해주세요.',        
            });
            chkVal = false;
            return;
        }else{
            if(state.overlapChk=== "N"){
                Modal.error({
                    content: '성명/사업자명의 중복확인을 해주세요.',        
                });
                chkVal = false;
                return;
            }
        }      

        if(stateData['country'] === ""){
            Modal.error({
                content: '국적을 작성해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData['address'] === ""){
            Modal.error({
                content: '법적주소를 작성해주세요.',        
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
                console.log(error.response.status);
                Modal.error({
                    title : '등록시 문제가 발생하였습니다.',
                    content : '오류코드:'+error.response.status
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
                    <Radio value="6">개인</Radio>
                    <Radio value="7">사업자</Radio>
                    </Radio.Group>
                </Col>

                <Col xs={24} lg={6} className="label">
                    성명/사업자명(영어) <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={18}>
                    {/* <Space className="ipt_group" style={{width:'35%'}}>
                        <Input.Group>
                            <Input
                                type="text"
                                name="name"
                                value={stateData.name}
                                onChange={handleChangeInput('name')}
                                autoComplete="off"
                                style={{
                                    width: 'calc(100% - 130px)',
                                    borderRight: '0',
                                }}
                            />
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
                                style={{ width: '130px' }}
                            >
                                중복 확인(필수)
                            </Button>
                        </Input.Group>

                        
                    </Space> */}
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
                    국적(한국어) <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={18}>
                    <Input className="tableInput" type="text" name="country" value={stateData.country} onChange={handleChangeInput('country')}  autoComplete="off"/>   
                </Col>
                
                <Col xs={24} lg={6} className="label">
                    원천징수 세율
                </Col>
                <Col xs={24} lg={18}>
                    <Input className="tableInput" type="text" name="tax_rate" value={stateData.tax_rate} onChange={handleChangeInput('tax_rate')}  autoComplete="off" maxLength={4}/> 
                    <span style={{marginLeft:'3px'}}>% (정보가 없으면 입력하지 않아도 됩니다.) </span>
                </Col>

                <Col xs={24} lg={6} className="label">
                    법적주소(영어) <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={18}>
                    <Input type="text" name="address" value={stateData.address} onChange={handleChangeInput('address')}  autoComplete="off"/>   
                </Col>

                <Col xs={24} lg={6} className="label">
                    기타 참고사항
                </Col>
                <Col xs={24} lg={18}>
                    <Input.TextArea name="memo" rows={4} value={stateData.memo} onChange={handleChangeInput('memo')} autoComplete="off"/>
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

export default ownersDrawer;