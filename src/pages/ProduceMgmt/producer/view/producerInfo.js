/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {  Space, Button, Row, Col,  Modal, Input,   message, Radio,  Popover, Select, Typography, Checkbox, Upload} from 'antd';
import { PhoneOutlined ,QuestionOutlined ,UploadOutlined} from '@ant-design/icons';
import { set, toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';
import ReactDOM from "react-dom";

import * as wjInput from '@grapecity/wijmo.react.input';
import { CollectionView } from '@grapecity/wijmo';

import PopupPostCode from '@components/Common/DaumAddress';
import { getData } from 'exif-js';

import * as ValidationCheck from '../validate';

const { Option } = Select;
const { Text } = Typography;

const Wrapper = styled.div`
    width: 100%;
    `;

const DEF_STATE = {
    // DB Data
    id:"",
    name: "",
    company_no: "",
    address:'',
    phone: "",
    fax: "",
    process: [],
    bank_id: "",
    bank:[],
    account_no: "",
    depositor: "",
    memo: "",
    use_yn: "Y",
    company_managers: [],
};

const producerView = observer(({idx, type, popoutCloseVal, popoutChk, drawerChk, onClose}) => {
    const { commonStore } = useStore();

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 

    const state = useLocalStore(() => ({
        id : '',
        data: [],
        drawerback : 'drawerWrap',
        regNoChk: 'Y', //국세청 확인 체크
        bankOption: [], //은행리스트
        popoutChk: '',

        managerArr : 
            {
                name: '',
                department: '',
                company_phone: '',
                cellphone: '',
                email: '',
            }
        ,
    }));

    useEffect(() => {  
        state.id = idx;
        state.popoutChk = popoutChk;
        bankData();
        getData();
    }, []);

    const getData = useCallback(async ()=> {
        var axios = require('axios');

        if(state.id==='')return false;

        var config={
            method:'GET',
            url:process.env.REACT_APP_API_URL +'/api/v1/produce-company/'+state.id,
            headers:{
                'Accept':'application/json',
            }
            };
        axios(config)
        .then(function(response){
            if(response.data.data.id != ''){
                var temp_type = Object.keys(DEF_STATE);
                temp_type.forEach((item)=>{
                    stateData[item] = response.data.data[item]
                });
                stateData['process'] = toJS(response.data.data['process'].split(', '));
                console.log('getData',toJS(stateData));
            }else{
                Modal.error({
                    content:(<div>
                                <p>호출시 문제가 발생하였습니다.</p>
                                <p>재시도해주세요.</p>
                                <p>오류코드: {response.data.error}</p>
                            </div>)
                });  
            }
        })
        .catch(function(error){
            console.log(error);
            Modal.error({
                title : (<div>호출시 문제가 발생하였습니다.<br/>재시도해주세요.</div>)
            });  
        });   
    }, []);

    //은행
    const bankData = useCallback(async () => {
        var axios = require('axios');

        var config = {
            method: 'GET',
            url:process.env.REACT_APP_API_URL +'/api/v1/banks?bank_type_id=1&simple=Y',
            headers: {
                Accept: 'application/json',
            },
        };

        axios(config)
        .then(function (result) {
            if (result.data.success === false) {
                Modal.error({
                    title: '오류가 발생했습니다.',
                    content: '오류코드:' + result.data.message,
                });
            } else {                    
                state.bankOption = result.data.data;       
            }
        })
        .catch(function (error) {
            console.log(error);
            if(error.response !== undefined){
                Modal.error({
                    title: '오류가 발생했습니다. 재시도해주세요.',
                    content: '오류코드:' + error.response.status,
                });
            }
            
        });  
    }, []);

    const popoutClose = (val) => {
        if(drawerChk==='Y'){
            popoutCloseVal(val);
        }else if(popoutChk==='Y'){
            // onClose(false);
            popoutCloseVal(val);
        }
    };

    const classChk=(val)=>{
        if(val === 'Y'){
            state.drawerback = 'drawerback drawerWrap';
        }else{
            state.drawerback = 'drawerWrap';
        }
    }
    //drawer class
    const classChkBtn = (val)=>{
        if(val === 'drawerback'){
            //classChk('Y');
            state.drawerback = 'drawerback drawerWrap';
        }else{
            // classChk('N');
            state.drawerback = 'drawerWrap';
        }        
    }


    const handleChangeInput = useCallback(
        (type) => (e) => {

            if(type === "process"){
                stateData[type] = e;
            } else if(type === "bank_id"){
                stateData[type] = e?.selectedValue;
            } else if(type === 'company_no'){
                var company_no = e.target.value.replace(/[^0-9]/g, '');
                var tmp = '';
                if( company_no.length < 4){
                    tmp = company_no;
                }else if(company_no.length < 6){
                    tmp = company_no.substr(0, 3)+'-'+company_no.substr(3,2);
                }else{              
                    tmp = company_no.substr(0, 3)+'-'+company_no.substr(3,2)+'-'+ company_no.substr(5,12);
                }
                stateData[type] =tmp;    

            }else{
                if(type === "name"){
                    const regExp = /[^ㄱ-ㅎ|ㅏ-ㅣ|가-힣a-zA-Z]/g;
                    if (regExp.test(e.target.value)) {
                      
                    }else{
                        stateData[type] = e.target.value;   
                    }
                }else if(type === 'fax' || type === 'phone'){
                    const regExp = /[^0-9]/g;
                    if (regExp.test(e.target.value)) {
                      
                    }else{
                        stateData[type] = e.target.value;   
                    }
                }else{
                    stateData[type] = e.target.value;    
                }
                
            } 
            
        },
        [],
    );

    const handleChangeTrArr = useCallback((type) => (e) => {
        if (type === 'company_phone' || type === 'cellphone') {
            var phone = e.target.value.replace(/[^0-9]/g, '');
            var tmp = '';
            if( phone.length < 4){
                tmp = phone;
            }else if(phone.length < 7){
                tmp = phone.substr(0, 3)+'-'+phone.substr(3);
            }else if(phone.length < 11){
                tmp = phone.substr(0, 3)+'-'+phone.substr(3, 3)+'-'+phone.substr(6);
            }else{              
                tmp = phone.substr(0, 3)+'-'+phone.substr(3, 4)+'-'+ phone.substr(7);
            }
            state.managerArr = {...state.managerArr,[type] : tmp};    
        }else if(type ==='email'){
            var tmp = e.target.value.replace(/[^\.@a-z|A-Z|0-9]/g,''); 
            state.managerArr = {...state.managerArr,[type] : tmp};    
        }else{
            state.managerArr = {...state.managerArr,[type] : e.target.value};    
        }    
    },[],);

    //거래담당자
    const createBtnTrans = ()=>{
        var chkVal = true;

        if(state.managerArr.name === '' ){
            Modal.error({
                content: '거래 담당자를 모두 작성 후 등록가능합니다.',        
            });
            chkVal = false;
            return;
        }

        if(state.managerArr.department === '' ){
            Modal.error({
                content: '거래 담당자를 모두 작성 후 등록가능합니다.',        
            });
            chkVal = false;
            return;
        }

        if(state.managerArr.company_phone === '' ){
            Modal.error({
                content: '거래 담당자를 모두 작성 후 등록가능합니다.',        
            });
            chkVal = false;
            return;
        }

        if(state.managerArr.cellphone === ''){
            Modal.error({
                content: '거래 담당자를 모두 작성 후 등록가능합니다.',        
            });
            chkVal = false;
            return;
        }
        
        if(state.managerArr.email === ''){
            Modal.error({
                content: '거래 담당자를 모두 작성 후 등록가능합니다.',        
            });
            chkVal = false;
            return;
        }
        

        if(chkVal = true){
            stateData.company_managers =[...stateData.company_managers,state.managerArr] ;
            state.managerArr = {
                name: '',
                department: '',
                company_phone: '',
                cellphone: '',
                email: '',
            };
        }
        
    }

    //담당자 삭제
    const transactionDel = (num)=>{
        var arrList = [];
        stateData.company_managers.map((e,index) => {
            if (index !== num) {
                arrList.push(e);
            }
        });
        stateData.company_managers = arrList;
    }

    //이메일확인
    const handleEmailChk = useCallback((type,subType,num) => (e) => {
        const emailRegex =/^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
        
        if(e.target.value != ''){
            if(emailRegex.test(e.target.value) == false){
                message.warning('올바른 이메일 주소를 입력해주세요.');
                if(stateData.type === '1'){
                    state.managerArr.email = '';
                }else{
                    stateData.email = '';
                }                
            } else{
                if(stateData.type === '1'){
                    state.managerArr.email = e.target.value;
                }else{
                    stateData.email = e.target.value;;
                }
                
            }
        } 
    },[],);

    //등록
    const handleSubmit = useCallback(async (e)=> {

        const data = toJS(stateData);
        let res_validate;
        res_validate = ValidationCheck.AddValidation(data,state.regNoChk);

        if(res_validate.states!==true){
            Modal.error({
                content: res_validate.msg,        
            });
            return;
        }
        
        if(res_validate.states === true ){
            apiSubmit();
        }       
    }, []);  

    const apiSubmit = useCallback(async ()=> {
        const data = toJS(stateData);

        // var json = JSON.stringify(data);
        // return;

        var axios = require('axios');

        var config={
            method:'POST',
            url:process.env.REACT_APP_API_URL +'/api/v1/produce-company',
            headers:{
                'Accept':'application/json',
            },
                data:data
            };
            
        axios(config)
        .then(function(response){
            if(response.data.id != ''){
                Modal.success({
                    title: response.data.result,
                    onOk(){
                        // resetChk();
                        popoutClose('Y')
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
            console.log(error);
            Modal.error({
                title : (<div>등록시 문제가 발생하였습니다.<br/>재시도해주세요.</div>)
            });  
        });   
    }, []);

    return (
        <Wrapper>
            <Row gutter={10} className="table">
                <Col xs={24} lg={4} className="label">
                    사업자명 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={20}>
                    {stateData.name}
                </Col>                
                <Col xs={24} lg={4} className="label">
                    사업자등록번호 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={20}>
                    {stateData.company_no} 
                </Col>
                <Col xs={24} lg={4} className="label">
                    주소
                </Col>
                <Col xs={24} lg={20}>
                    <Input
                        name="address"
                        value={stateData.address}
                        onChange={handleChangeInput('address')}
                    />
                </Col>
                <Col xs={24} lg={4} className="label">
                    전화번호
                </Col>
                <Col xs={24} lg={8}>
                    <Input
                        type="tel"
                        name="phone"
                        maxLength="13"
                        autoComplete="off"
                        value={stateData.phone}
                        onChange={handleChangeInput('phone')}
                    />
                </Col>
                <Col xs={24} lg={4} className="label">
                    팩스번호
                </Col>
                <Col xs={24} lg={8}>
                    <Input
                        type="tel"
                        name="fax"
                        maxLength="13"
                        value={stateData.fax}
                        onChange={handleChangeInput('fax')}
                        autoComplete="off"
                    />
                </Col>
                
                <Col xs={24} lg={4} className="label">
                    담당 공정 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={20}>
                    <Checkbox.Group
                        onChange={handleChangeInput('process')}
                        value={stateData.process}
                    >
                        <Checkbox value="8">PrePress</Checkbox>
                        <Checkbox value="2">종이</Checkbox>
                        <Checkbox value="3">인쇄</Checkbox>
                        <Checkbox value="4">제본</Checkbox>
                        <Checkbox value="5">후가공</Checkbox>
                        <Checkbox value="7">부속 제작</Checkbox>
                        <Checkbox value="6">포장</Checkbox>
                        <Checkbox value="9">포장 물품 제작</Checkbox>
                    </Checkbox.Group>
                </Col>
                
                <Col xs={24} lg={4} className="label">
                    계좌 정보 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={20}>                        
                    <Input.Group>
                        <Row>
                            <Col span={8} style={{padding: '0 10px 0 0'}}>
                                {/* <Select
                                    placeholder="은행 선택"
                                    style={{width:'100%'}}
                                    onChange={handleChangeInput('bank_id')}
                                    value={stateData.bank_id}
                                    // defaultValue={{value:stateData.bank,label:stateData.bank}}
                                >
                                    <Option value={stateData.bank_id} >{stateData.bank?.name}</Option>
                                    {state.bankOption.filter((item)=> item.id != stateData.bank_id).map((e) => (
                                        <Option value={e.id}>
                                            {e.name}
                                        </Option>
                                    ))}
                                    {state.bankOption.map((e) => (
                                        <Option value={e.id}>
                                            {e.name}
                                        </Option>
                                    ))}
                                </Select> */}
                                <wjInput.ComboBox
                                    placeholder="은행 선택"
                                    itemsSource={new CollectionView(state.bankOption, {
                                        currentItem: null
                                    })}
                                    selectedValuePath="id"
                                    displayMemberPath="name"
                                    valueMemberPath="id"
                                    selectedValue={stateData.bank_id}
                                    textChanged={handleChangeInput('bank_id')}
                                    style={{ width: '100%' }}
                                />
                            </Col>

                            <Col span={8} style={{padding: '0 10px 0 0'}}>
                                <Input
                                    name="account_no"
                                    placeholder="계좌번호 (ex.123-12-123)"
                                    autoComplete="off"
                                    maxLength="20"
                                    value={stateData.account_no}
                                    onChange={handleChangeInput('account_no')}
                                />
                            </Col>

                            <Col span={8} style={{padding: '0 10px 0 0'}}>
                                <Input
                                    name="depositor"
                                    placeholder="예금주"
                                    value={stateData.depositor}
                                    onChange={handleChangeInput('depositor')}
                                    autoComplete="off"
                                />
                            </Col>                                    
                        </Row>
                    </Input.Group>   
                </Col>

                <Col xs={24} lg={4} className="label">
                    담당자 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={20}>
                    {stateData.company_managers?.length > 0 &&
                        stateData.company_managers.map((e,index) => (
                            <div>{e.name} / {e.department} / {e.company_phone} / {e.cellphone} / {e.email}<Button shape="circle" className="btn_del" onClick={(e) => transactionDel(index)}>X</Button></div>
                        ))
                    }
                    <Input.Group>
                        <Row>
                            <Col span={4} style={stateData.company_managers?.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                <Input type="text" 
                                    name="name" 
                                    placeholder="성명" 
                                    value={state.managerArr.name} 
                                    onChange={handleChangeTrArr('name')} 
                                    autoComplete="off"
                                />   
                            </Col>
                            <Col span={5} style={stateData.company_managers?.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                <Input type="text" 
                                    name="department" 
                                    placeholder="부서" 
                                    value={state.managerArr.department} 
                                    onChange={handleChangeTrArr('department')} 
                                    autoComplete="off"
                                /> 
                            </Col>

                            <Col span={4} style={stateData.company_managers?.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                <Input
                                    type="tel"
                                    name="company_phone"
                                    maxLength="13"
                                    placeholder="회사 전화번호" 
                                    value={state.managerArr.company_phone} 
                                    onChange={handleChangeTrArr('company_phone')}
                                    prefix={<PhoneOutlined  className="site-form-item-icon" />}
                                    autoComplete="off"
                                /> 
                            </Col>

                            <Col span={4} style={stateData.company_managers?.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                <Input
                                    type="tel"
                                    name="cellphone"
                                    maxLength="13"
                                    placeholder="휴대폰 번호" 
                                    value={state.managerArr.cellphone} 
                                    onChange={handleChangeTrArr('cellphone')}
                                    prefix={<PhoneOutlined  className="site-form-item-icon" />}
                                    autoComplete="off"
                                /> 
                            </Col>

                            <Col span={6} style={stateData.company_managers?.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                <Input 
                                    type="text" 
                                    name="email" 
                                    placeholder="이메일"
                                    value={state.managerArr.email}
                                    onChange={handleChangeTrArr('email')}
                                    onBlur={handleEmailChk('email')}
                                    autoComplete="off"
                                /> 
                            </Col>

                            <Col span={1} style={stateData.company_managers?.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                <Button className="btn btn-primary btn_add" shape="circle" onClick={createBtnTrans}>+</Button>
                            </Col>
                        </Row>
                    </Input.Group> 
                </Col>

                <Col xs={24} lg={4} className="label">
                    기타 참고사항
                </Col>
                <Col xs={24} lg={20}>
                    <Input.TextArea
                        name="memo"
                        value={stateData.memo}
                        onChange={handleChangeInput('memo')}
                        rows={4}
                    />
                </Col>
            </Row>
            <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                <Col>
                    {state.popoutChk === 'Y'
                        ?<>
                            <Button type="button" htmlType="button"  onClick={e => popoutClose('Y')} style={{marginLeft:'10px'}}>
                                닫기
                            </Button>
                        </>

                        : <>
                            <Button type="primary" htmlType="button" onClick={handleSubmit}>
                                확인
                            </Button>
                            {drawerChk == "Y" && state.adminChk === true
                                && <>
                                    <Button htmlType="button" onClick={e => popoutClose('Y')} style={{marginLeft:'10px'}}>
                                        취소
                                    </Button>
                                </>
                            }     
                        </>
                    
                    }
                    
                </Col>
            </Row>      

        </Wrapper>
    );
});

export default producerView;