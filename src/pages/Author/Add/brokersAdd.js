/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Space, Button, Row, Col,  Modal, Breadcrumb, Input, Drawer,  message, Radio, Popover, Select, Typography} from 'antd';
import { PhoneOutlined  } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';
import * as wjInput from '@grapecity/wijmo.react.input';
import { CollectionView } from '@grapecity/wijmo';

import PopupPostCode from '@components/Common/DaumAddress';

const Wrapper = styled.div`
    width: 100%;
    `;

const DEF_STATE = {
    // DB Data
    type: '1',
    name: '',
    company_no: '',
    owner_name: '',
    phone: '',
    fax: '',
    address: '',
    memo: '',
    taxation_type: '',
    accounts: [],    
    broker_managers: [],
        
    country : '',
    email:'',
    transaction_manager:'', 
    
};

const brokersDrawer = observer(({type,onClose,reset,classChk}) => {
    const { commonStore } = useStore();

    const { Text } = Typography;
    const { Option } = Select;
    const { confirm } = Modal;

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 

    const state = useLocalStore(() => ({
        type: '',

        bankOption: [],     //은행리스트
        companyNoChk : 'N', //사업자번호 확인 체크
        regNoChk:'N',       //국세청 확인 체크

        useOption: [            //용도리스트
            {
                idx : '1',
                purpose : '수입',
            },
            {
                idx : '2',
                purpose : '수출',
            }
        ],          
        useOptionOld: [         //용도리스트 백업
            {
                idx : '1',
                purpose : '수입',
            },
            {
                idx : '2',
                purpose : '수출',
            }
        ],

        //계좌정보
        accountArr : 
            {
                purpose: '',    
                bank_id: '',    
                bank : '',
                account_no: '',    
                account_type: '1',    
                depositor: '', 
                swift_code: '',    
                bank_name_eng: '',    
            }
        ,
        bankName : [],

        //국내 거래처담당자
        brokerArr : 
            {
                name: '',
                department: '',
                company_phone: '',
                cellphone: '',
                email: '',
            }
        ,

        address : '',       //주소
        address2 : '',      //상세주소

        companyDelChk : 0,   //빈값체크
        companyNokeyword : '',  //사업자번호
        switchRed : false
    }));
    
    useEffect(() => {       
        state.type= type;
        bankData();
    }, [type]);


    const visibleClose = () => {
        //데이터 초기화
        for (const key in DEF_STATE) {
            stateData[key] = DEF_STATE[key];
        }
        state.companyNoChk='N';
        state.regNoChk='N';
        onClose(false);
    };    

    //추가 후 리스트 리셋
    const resetChk = ()=>{
        reset(true);
    }


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
            console.log(error.response);
            if(error.response !== undefined){
                Modal.error({
                    title: '오류가 발생했습니다. 재시도해주세요.',
                    content: '오류코드:' + error.response.status,
                });
            }
            
        });
    }, []);

    
    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback(
        (type) => (e) => {
            var korChk =/[^ㄱ-ㅎ|가-힣]/g;
            var emailChk =/[^\.@a-z|A-Z|0-9]/g;
            var nameEngChk =/[^a-zA-Z0-9.,\s-]/g;
            var addressChk =/[^\s|.,|a-z|A-Z|0-9]/g;
            var swiftChk =/[^a-z|A-Z|0-9]/g;

            var key = type+'error'

            if (type === 'phone' || type === 'fax') {
                if(stateData['type'] === '2'){
                    stateData[type] = e.target.value
                }else{
                    var phone = e.target.value.replace(/[^0-9]/g, '');
                    var tmp = '';
                    if (phone.length <= 4) {
                        tmp = phone;
                    } else if (phone.length < 7) {
                        tmp = phone.substr(0, 3) + '-' + phone.substr(3);
                    } else if (phone.length <= 9) {
                        tmp =phone.substr(0, 2) +'-' +phone.substr(2, 3) +'-' +phone.substr(5);
                    } else if (phone.length === 10) {
                        tmp =phone.substr(0, 3) +'-' +phone.substr(3, 3) +'-' +phone.substr(6);
                    } else {
                        tmp =phone.substr(0, 3) +'-' +phone.substr(3, 4) +'-' +phone.substr(7);
                    }
                    stateData[type] = tmp;
                }
               
            }else if(type === 'company_no'){
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
                state.companyNokeyword = tmp;

                if(tmp === ''){
                    state.companyDelChk++
                }else{
                    state.companyDelChk = 0
                }                
           
            }else if(type ==='email'){
                if(emailChk.test(e.target.value)){
                    message.warning({ content: '영문과 특수문자만 입력할 수 있습니다.', key});       
                }else{
                    stateData[type] = e.target.value.replace(/[^\.@a-z|A-Z|0-9]/g,'',);   
                } 
            }else if(type ==='address2'){
                state[type] = e.target.value;
            }else if(type ==='address'){
                if(addressChk.test(e.target.value)){
                    message.warning({ content: '영문과 숫자, 일부 특수문자만 입력 가능합니다.', key});      
                }else{
                    stateData[type] = e.target.value.replace(  /[^\s|.,|a-z|A-Z|0-9]/g, '');
                }            
            }else if(type ==='country'){
                if(korChk.test(e.target.value)){
                    message.warning({ content: '한글만 입력 가능합니다.', key});  
                }else{
                    stateData[type] = e.target.value.replace(/[^ㄱ-ㅎ|가-힣]/g,'' );
                }  
                
            } else if (type === 'name') {
                if (stateData.type === '2' ) {
                    if(nameEngChk.test(e.target.value)){
                        message.warning({ content: '영문과 일부 특수문자만 입력 가능합니다.', key});   
                    }else{
                        stateData[type] = e.target.value.replace( /[^\s|.,|a-z|A-Z]/g, '');
                    } 
                    
                } else {
                    stateData[type] = e.target.value;
                }
            }else{     
                if(type === 'type'){
                    if (stateData.type !== e.target.value ) {
                        var chk = 0;

                        let strArr = Object.keys(state.accountArr);
                        for (let i = 0; i < strArr.length; i++) {
                            if(strArr[i] !== 'account_type'){
                                if(state.accountArr[strArr[i]] !== '' && state.accountArr[strArr[i]] !== undefined){
                                    chk++
                               }
                            }                          
                        }

                        let btoArr = Object.keys(state.brokerArr);
                        for (let i = 0; i < btoArr.length; i++) {
                            if(state.brokerArr[btoArr[i]] !== '' && state.brokerArr[btoArr[i]] !== undefined){
                                chk++
                            }
                        }
                       
                        for (const key in DEF_STATE) {                        
                            if(key !== 'type'){
                                if(key !== 'accounts' && key !== 'broker_managers'){
                                    if(stateData[key] !== '' && stateData[key] !== undefined){
                                        chk++
                                    }
                                }else if(key === 'accounts'){
                                    if(stateData['accounts'].length > 0 ){
                                        chk++
                                    }
                                }  else if(key === 'broker_managers'){
                                    if(stateData['broker_managers'].length > 0 ){
                                        chk++
                                    }
                                }                            
                            }                        
                        }

                        if(chk > 0){
                            confirm({
                                title: '중개자 유형을 변경하면 입력된 정보가 초기화 됩니다. ',
                                content: '변경하시겠습니까?',
                                onOk() {
                                    stateData[type] = e.target.value;

                                    //초기화
                                    state.companyNoChk='N';
                                    state.regNoChk='N';
                                    state.address='';
                                    state.address2='';
                                    stateData.name = '';
                                    stateData.company_no = '';
                                    stateData.owner_name= '';
                                    stateData.phone= '';
                                    stateData.fax= '';
                                    stateData.address= '';
                                    stateData.memo= '';
                                    stateData.country= '';
                                    stateData.email= '';
                                    stateData.transaction_manager= '';
                                    stateData.accounts= [];
                                    stateData.broker_managers= [];
                                    state.accountArr = 
                                    {
                                        purpose: '',    
                                        bank_id: '',    
                                        bank : '',
                                        account_no: '',    
                                        account_type: '1',    
                                        depositor: '', 
                                        swift_code: '',    
                                        bank_name_eng: '',    
                                    }
                                
                                    state.brokerArr =
                                        {
                                            name: '',
                                            department: '',
                                            company_phone: '',
                                            cellphone: '',
                                            email: '',
                                        }

                                },
                                onCancel() {
                                    stateData[type] = stateData.type;
                                },
                            });
                        } else{
                            stateData[type] = e.target.value;
                        }          
                    }

                    if(e.target.value === '1'){
                        state.accountArr.account_type = '1'
                    }
                }   else{
                    stateData[type] = e.target.value;
                }                
                
                
                
            }                    
        },[],
    );

    const handleChangeArr = useCallback((type) => (e) => {
        var key = type+'error'
        var engChk = /[^a-z|A-Z]/g;
        var swiftChk =/[^a-z|A-Z|0-9]/g;
        var accountnoChk =/[^\-0-9]/g;
        // var nameEngChk =/[^a-zA-Z0-9.,\s-]/g;
        var nameEngChk =/[^|a-z|A-Z|,.-|0-9]/g;
        var depositorEngChk =/[^|\s|.,|a-z|A-Z|0-9]/g;
        
        if (type === 'account_no'){
            if(accountnoChk.test(e.target.value)){
                message.warning({ content: '숫자와 일부 특수문자만 입력 가능합니다.', key});   
            }else{
                var account_no = e.target.value.replace(/[^\-0-9]/g, '');
                state.accountArr = {...state.accountArr,[type] : account_no};
            } 
        } else if (type === 'name') {
            if (stateData.type === '4' || stateData.type === '5') {
                if(nameEngChk.test(e.target.value)){
                    message.warning({ content: '영문과 숫자, 일부 특수문자만 입력 가능합니다.', key});   
                }else{
                    stateData[type] = e.target.value.replace( /[^|a-z|A-Z|,.-|0-9]/g, '');
                    state.namekeyword = stateData[type];
                } 
            } else {
                stateData[type] = e.target.value;                    
            }
            
               
        }else if (type === 'purpose' ){
            state.accountArr = {...state.accountArr,[type] : e?.selectedValue};  
        }else if (type === 'bank_id' ){
            state.accountArr = {...state.accountArr,[type] : e?.selectedValue};  
        }else if (type === 'bank_name_eng' ){
            if(nameEngChk.test(e.target.value)){
                message.warning({ content: '영문과 숫자, 일부 특수문자만 입력 가능합니다.', key});   
            }else{
                state.accountArr = {...state.accountArr,[type] : e.target.value.replace( /[^|a-z|A-Z|,.-|0-9]/g, '')};  
            } 
        } else if (type === 'swift_code') {
            if(swiftChk.test(e.target.value)){
                message.warning({ content: 'SWIFT CODE는 영문, 숫자 8~11자리입니다. 정보를 확인해주세요.', key});   
            }else{
                var value = e.target.value.replace(/[^a-z|A-Z|0-9]/g,'',);  
                state.accountArr = {...state.accountArr,[type] : value};  
            } 
        }else if (type === 'depositor') {
            if(stateData.type === '1'){
                state.accountArr = {...state.accountArr,[type] : e.target.value};  
            }else{
                if(depositorEngChk.test(e.target.value)){
                    message.warning({ content: '영어, 숫자, 쉼표(,), 마침표(.)만 입력할 수 있습니다.', key});
                }else{
                    var value = e.target.value.replace( /[^|\s|.,|a-z|A-Z|0-9]/g, '');
                    state.accountArr = {...state.accountArr,[type] : value};  
                }     
            }                   
        }else{
            state.accountArr = {...state.accountArr,[type] : e.target.value};    
        }    
    },[],);

    const handleChangeTrArr = useCallback((type) => (e) => {
        var key = type+'error'
        var emailChk =/[^\.@a-z|A-Z|0-9]/g;
        if (type === 'cellphone') {
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
            state.brokerArr = {...state.brokerArr,[type] : tmp};    
        }else if (type === 'company_phone') {
            var phone = e.target.value.replace(/[^0-9]/g, '');
            var tmp = '';
            if (phone.length <= 4) {
                tmp = phone;
            } else if (phone.length < 7) {
                tmp = phone.substr(0, 3) + '-' + phone.substr(3);
            } else if (phone.length <= 9) {
                tmp =phone.substr(0, 2) +'-' +phone.substr(2, 3) +'-' +phone.substr(5);
            } else if (phone.length === 10) {
                tmp =phone.substr(0, 3) +'-' +phone.substr(3, 3) +'-' +phone.substr(6);
            } else {
                tmp =phone.substr(0, 3) +'-' +phone.substr(3, 4) +'-' +phone.substr(7);
            }
            state.brokerArr = {...state.brokerArr,[type] : tmp};    
        }else if(type ==='email'){
            if(emailChk.test(e.target.value)){
                message.warning({ content: '영문과 특수문자만 입력할 수 있습니다.', key});       
            }else{
                var tmp = e.target.value.replace(/[^\.@a-z|A-Z|0-9]/g,'',);   
                state.brokerArr = {...state.brokerArr,[type] : tmp};     
            }               
        }else{
            state.brokerArr = {...state.brokerArr,[type] : e.target.value};    
        }    
    },[],);


    //우편번호
    const addPost = (zipcode, address) => {    
        stateData.address = '['+zipcode+'] '+address;
        state.address = '[' + zipcode + '] ' + address;
        state['company_zipcode'] = zipcode;
        state['company_address1'] = address;
    }

    //우편    
    const [postVisible, setPostVisible] = useState(false);
    const postPopup = () => {
        setPostVisible(true);
    };
    const postClose = () => {
        setPostVisible(false);
    };

    //중복체크
    const fetchData = useCallback(async () => {
        console.log(state.companyNokeyword)
        if (state.companyNokeyword !== '' && state.companyNokeyword !== undefined) {
            var axios = require('axios');

            var config = {
                method: 'GET',
                url:process.env.REACT_APP_API_URL +'/api/v1/' +state.type +'?display=10&page=1&sort_by=date&order=desc&company_no=' + state.companyNokeyword,
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
                        onOk() {
                            stateData['company_no'] = '';
                            state.companyNokeyword = '';
                            state.namekeyword = '';
                            state.keywordChk = false;
                        },
                    });
                } else {
                    if (result.data.data.length > 0) {                          
                        Modal.warning({
                            title: '같은 번호의 저작권자가 있어서 등록할 수 없습니다.',
                            content: '중복 여부 확인 후 진행해 주세요.',
                            onOk() {
                                stateData['company_no'] = '';
                                state.companyNokeyword = '';
                                state.keywordChk = false;
                            },
                        });
                    } else {
                        state.companyNoChk = 'Y';
                        regNoChk();
                        state.keywordChk = true
                        
                    }
                    
                }
            })
            .catch(function (error) {
                console.log(error.response);
                Modal.error({
                    title: '오류가 발생했습니다. 재시도해주세요.',
                    content: '오류코드:' + error.response.status,
                    onOk() {
                        stateData['company_no'] = '';
                        state.companyNokeyword = '';
                        state.keywordTxt = '';
                    },
                });
            });
        }
    }, []);



    //국세청
    const regNoChk = useCallback(async () => {
        if((stateData['company_no'] == '' || stateData['company_no'] === undefined )&& state.companyDelChk === 0){
            Modal.error({
                content: '사업자번호를 등록 후 클릭해주세요.',        
            }); 
        }else{
            if(stateData['company_no'] !== '' && stateData['company_no'] !== undefined && state.companyDelChk === 0){
                    
                var axios = require('axios');

                var config = {
                    method: 'GET',
                    url:process.env.REACT_APP_API_URL +'/api/v1/check-corpnum?corp_num='+stateData['company_no'],
                    headers: {
                        Accept: 'application/json',
                    },
                };

                axios(config)
                .then(function (result) {
                    if (result.data.result === null ||  result.data.result === '0' ||  result.data.result === '1' ||  result.data.result === '2' ||  result.data.result === '3') {
                        Modal.warning({
                            title: (
                                <div>
                                    이 사업자는 현재 휴업 또는 폐업 상태로
                                    <br />
                                    등록할 수 없습니다.
                                </div>
                            ),
                        });
                    } else {
                        Modal.success({
                            title: '국세청 확인이 완료되었습니다.',
                            onOk() {
                                state.regNoChk = 'Y';
                                // if (result.data.result.taxType == '20') {
                                //     stateData.taxation_type = '3';
                                // } else {
                                //     stateData.taxation_type = '4';
                                // }
                            },
                        });
                    }
                    // state.companyDelChk = 0;
                })
                .catch(function (error) {
                    console.log(error.response);
                    Modal.error({
                        title: '오류가 발생했습니다. 재시도해주세요.',
                        content: '오류코드:' + error.response.status,
                        onOk() {
                            stateData['person_no'] = '';
                            state.personkeyword = '';
                            state.keywordTxt = '';
                        },
                    });
                });         
            }
        }
        
    }, []);

      
    const handleChange = useCallback((type) => (e) => {
        if(e.target.value === '' || e.target.value === undefined){
            stateData.address = state.address;                
        }else{
            stateData.address = state.address+ ', ' + e.target.value;
        }
       
    },[],);

    //이메일확인
    const handleEmailChk = useCallback((type,subType,num) => (e) => {
        const emailRegex =/^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
        
        if(e.target.value != ''){
            if(emailRegex.test(e.target.value) == false){
                message.warning('올바른 이메일 주소를 입력해주세요.');
                if(stateData.type === '1'){
                    state.brokerArr.email = '';
                }else{
                    stateData.email = '';
                }                
            } else{
                if(stateData.type === '1'){
                    state.brokerArr.email = e.target.value;
                }else{
                    stateData.email = e.target.value;;
                }
                
            }
        } 
    },[],);

    //swift code 확인
    const handleSwiftChk = useCallback(
        (type) => (e) => {
            const swiftRegex =
                /^[a-zA-Z0-9]{8,11}$/i;

            if (e.target.value != '') {
                if (swiftRegex.test(e.target.value) == false) {
                    var key = 'swiftCodeError'
                    message.warning({ content: 'SWIFT CODE는 영문, 숫자 8~11자리입니다. 정보를 확인해주세요.', key}); 
                    // stateData[type] = '';
                    state.switchRed= true
                } else {
                    state.switchRed= false
                    state.accountArr.swift_code =e.target.value;
                }
            }
        },
        [],
    );

    //계좌 정보 
    const createBtn = ()=>{
        var chkVal = true;
        if(stateData.type === '1'){
            state.accountArr.account_type = '1';
        }else{
            state.accountArr.account_type = '2';
        }
        if(state.accountArr.purpose === '' ){
            Modal.error({
                content: '계좌정보를 모두 작성 후 등록가능합니다.',        
            });
            chkVal = false;
            return;
        }

        if(stateData.type === '1'){
            if(state.accountArr.account_type === '' ){
                Modal.error({
                    content: '계좌정보를 모두 작성 후 등록가능합니다.',        
                });
                chkVal = false;
                return;
            }

            if(state.accountArr.bank_id === '' ){
                Modal.error({
                    content: '계좌정보를 모두 작성 후 등록가능합니다.',        
                });
                chkVal = false;
                return;
            }
        }else{
            if(state.accountArr.bank_name_eng === '' ){
                Modal.error({
                    content: '계좌정보를 모두 작성 후 등록가능합니다.',        
                });
                chkVal = false;
                return;
            }

            if (state.accountArr.swift_code === '') {
                Modal.error({
                    content: 'SWIFT CODE를 작성해주세요.',
                });
                chkVal = false;
                return;
            } else{  

                if(state.accountArr.swift_code.length < 8 ){
                    Modal.error({
                        content: 'SWIFT CODE는 영문, 숫자 8~11자리입니다. 정보를 확인해주세요.',      
                    });
                    chkVal = false;
                    return;
                }
            }
        }       

        if(state.accountArr.account_no === '' ){
            Modal.error({
                content: '계좌정보를 모두 작성 후 등록가능합니다.',        
            });
            chkVal = false;
            return;
        }

        if(state.accountArr.depositor === ''){
            Modal.error({
                content: '계좌정보를 모두 작성 후 등록가능합니다.',        
            });
            chkVal = false;
            return;
        }
        

        if(chkVal === true){
            //용도 선택된거 빼고 arr 재정렬
            state.useOption = state.useOption.filter((e) =>state.accountArr.purpose !== e.purpose);
            if(stateData['type'] === '1'){
                var arr = state.bankOption.filter((e) =>e.id === state.accountArr.bank_id);
                state.bankName = [...state.bankName, arr[0].name]
            }            

            //실제 데이터에 넣고 배열 초기화
            if(stateData.type === '1'){
                stateData.accounts  = [...stateData.accounts ,
                    {purpose: state.accountArr.purpose,    
                    bank_id: state.accountArr.bank_id,        
                    account_no: state.accountArr.account_no,       
                    depositor: state.accountArr.depositor,     
                    account_type:state.accountArr.account_type,    
                    use_yn:'Y'
                }]
            }else{
                stateData.accounts  = [...stateData.accounts ,
                    {purpose: state.accountArr.purpose,    
                        swift_code: state.accountArr.swift_code,        
                    account_no: state.accountArr.account_no,       
                    depositor: state.accountArr.depositor,     
                    bank_name_eng:state.accountArr.bank_name_eng,    
                    account_type:state.accountArr.account_type,   
                    use_yn:'Y'
                }]
            }
            console.log(toJS(stateData.accounts))
            // stateData.accounts =[...stateData.accounts,state.accountArr] ;
            state.accountArr = {
                purpose: '',    
                bank_id: '',    
                account_no: '',    
                depositor: '', 
                account_type:'',
                swift_code:'',
                bank_name_eng: '',
                use_yn: 'Y',
            };
           
        }        
    }

    //계좌 정보 삭제
    const accountDel = (num)=>{       
        var arrList = [];
        stateData.accounts.map((e,index) => {
            if (index !== num) {
                arrList.push(e);
            }
        });
        stateData.accounts = arrList;
        // state.useOption = state.useOptionOld.filter((e) => !stateData.accounts.includes(e.purpose));
        state.useOption = state.useOptionOld.filter((e) => e.purpose !== stateData.accounts[0].purpose);
    }

    //거래담당자
    const createBtnTrans = ()=>{
        var chkVal = true;

        if(state.brokerArr.name === '' ){
            Modal.error({
                content: '거래 담당자를 모두 작성 후 등록가능합니다.',        
            });
            chkVal = false;
            return;
        }

        if(state.brokerArr.department === '' ){
            Modal.error({
                content: '거래 담당자를 모두 작성 후 등록가능합니다.',        
            });
            chkVal = false;
            return;
        }

        if(state.brokerArr.company_phone === '' ){
            Modal.error({
                content: '거래 담당자를 모두 작성 후 등록가능합니다.',        
            });
            chkVal = false;
            return;
        }

        if(state.brokerArr.cellphone === ''){
            Modal.error({
                content: '거래 담당자를 모두 작성 후 등록가능합니다.',        
            });
            chkVal = false;
            return;
        }
        
        if(state.brokerArr.email === ''){
            Modal.error({
                content: '거래 담당자를 모두 작성 후 등록가능합니다.',        
            });
            chkVal = false;
            return;
        }
        

        if(chkVal = true){
            stateData.broker_managers =[...stateData.broker_managers,state.brokerArr] ;
            state.brokerArr = {
                name: '',
                department: '',
                company_phone: '',
                cellphone: '',
                email: '',
            };
        }
        
    }
    
    //거래 담당자 삭제
    const transactionDel = (num)=>{
        var arrList = [];
        stateData.broker_managers.map((e,index) => {
            if (index !== num) {
                arrList.push(e);
            }
        });
        stateData.broker_managers = arrList;
    }
    

    //등록
    const handleSubmit = useCallback(async (e)=> {
        let chkVal = true;

        if(stateData['name'] == ""){
            Modal.error({
                content: '사업자명을 작성해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData.type ==='1'){
            if(stateData['company_no'] == ''){
                Modal.error({
                    content: '사업자등록번호를 작성해주세요.',        
                });
                chkVal = false;
                return; 
            }else{
                if(state.regNoChk === 'N'){
                    Modal.error({
                        content: '국세청 확인을 해주세요.',        
                    });
                    chkVal = false;
                    return;
                }                
            }

            if(stateData['owner_name'] == ""){
                Modal.error({
                    content: '대표자를 작성해주세요.',        
                });
                chkVal = false;
                return;
            }
        } else {
            if(stateData.country ===''){
                Modal.error({
                    content: '국적을 작성해주세요.',        
                });
                chkVal = false;
                return;
            }

            if(stateData.address ===''){
                Modal.error({
                    content: '주소를 작성해주세요.',        
                });
                chkVal = false;
                return;
            }

            if(stateData.email ===''){
                Modal.error({
                    content: '이메일을 작성해주세요.',        
                });
                chkVal = false;
                return;
            }
        }
        

        //계좌정보    
        // if(stateData.accounts === "" || stateData.accounts === undefined){
        if(stateData.accounts.length === 0){
            Modal.error({
                content: '계좌정보를 작성해주세요.',        
            });
            chkVal = false;
            return;
        }  

        // if(stateData.type === '1'){
        //     if(stateData.accounts.bank_id === ""){
        //         Modal.error({
        //             content: '계좌정보 은행을 선택해주세요.',        
        //         });
        //         chkVal = false;
        //         return;
        //     }    
        // }else{
        //     if(stateData.accounts.bank_name_eng === ""){
        //         Modal.error({
        //             content: '계좌정보 은행을 선택해주세요.',        
        //         });
        //         chkVal = false;
        //         return;
        //     }    
        // }
        

        // if(stateData.accounts.account_no === ""){
        //     Modal.error({
        //         content: '계좌번호를 작성해주세요.',        
        //     });
        //     chkVal = false;
        //     return;
        // } 

        // if(stateData.accounts.swift_code === "" && stateData.type ==='2'){
        //     Modal.error({
        //         content: 'SWIFT CODE를 작성해주세요.',        
        //     });
        //     chkVal = false;
        //     return;
        // } else{
        //     if (stateData['swift_code'].length < 8) {
        //         Modal.error({
        //             content: 'SWIFT CODE는 영문, 숫자 8~11자리입니다. 정보를 확인해주세요.',        
        //         });
        //         chkVal = false;
        //         return;
        //     }
        // }

        // if(stateData.accounts.depositor === ''){
        //     Modal.error({
        //         content: '예금주명을 작성해주세요.',        
        //     });
        //     chkVal = false;
        //     return;
        // }
   
        if(chkVal == true){
            var axios = require('axios');
            var data = '';
            if(stateData.type === '1'){
                data = {
                    type: stateData.type,
                    name: stateData.name,
                    company_no: stateData.company_no, 
                    // taxation_type: stateData.taxation_type,                   
                    owner_name: stateData.owner_name,
                    phone: stateData.phone,
                    fax: stateData.fax,
                    address: stateData.address,
                    memo:stateData.memo,                    
                    accounts:stateData.accounts,    
                    broker_managers: stateData.broker_managers                        
                }
            }else{
                data = {
                    type: stateData.type,
                    name: stateData.name,
                    country : stateData.country,
                    phone: stateData.phone,
                    address: stateData.address,
                    email:stateData.email,
                    transaction_manager:stateData.transaction_manager,                    
                    accounts:stateData.accounts,   
                    memo:stateData.memo 
                }
            }

            
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
                <Col xs={24} lg={5} className="label">
                    유형 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={19}>
                    <Radio.Group
                        value={stateData['type']}
                        onChange={handleChangeInput('type')}
                    >
                        <Radio value="1">국내 업체</Radio>
                        <Radio value="2">해외 업체</Radio>                
                    </Radio.Group>
                </Col>

                <Col xs={24} lg={5} className="label">
                    사업자명 {stateData.type === '2' && '(영어)'} <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={19}>
                    <Input className="tableInput" type="text" name="name" value={stateData.name} onChange={handleChangeInput('name')}  required autoComplete="off"/>   
                </Col>

                {stateData.type === '1' 
                    ? <>
                        <Col xs={24} lg={5} className="label">
                            사업자등록번호 <span className="spanStar">*</span>
                        </Col>
                        <Col xs={24} lg={19}>                              
                            <Input.Group>
                                <Row>
                                    <Col span={5} style={{padding: '0 10px 0 0'}}>
                                        <Input
                                            type="tel"
                                            name="company_no"
                                            maxLength="12"
                                            value={stateData.company_no}
                                            onChange={handleChangeInput('company_no')}
                                            onBlur={fetchData}
                                            autoComplete="off"
                                        />    
                                    </Col>
                                    <Col span={5} style={{padding: '0 10px 0 0'}}>
                                        <Input type="hidden" id="regNoChk" name="regNoChk" value={state.regNoChk} />    
                                        <Button type="primary" className="btn_inner" style={{ width: '143px' }} onClick={(e)=>state.keywordChk === true ?regNoChk() : ''} >
                                            국세청 확인(필수)
                                        </Button>
                                    </Col>
                                </Row>
                            </Input.Group>                      
                        </Col>
                        
                        {/* <Col xs={24} lg={5} className="label">
                            세금 구분
                        </Col>
                        <Col xs={24} lg={19}>
                            {stateData.taxation_type === '1' ? '면세' : stateData.taxation_type === '2' ? '과세' : ''}
                        </Col> */}

                        <Col xs={24} lg={5} className="label">
                            대표자 <span className="spanStar">*</span>
                        </Col>
                        <Col xs={24} lg={19}>
                            <Input className="tableInput" type="text" name="owner_name" value={stateData.owner_name} onChange={handleChangeInput('owner_name')} required autoComplete="off"/> 
                        </Col>

                        <Col xs={24} lg={5} className="label">
                            대표 전화번호
                        </Col>
                        <Col xs={24} lg={19}>
                            <Input
                                className="tableInput"
                                type="tel"
                                name="phone"
                                maxLength="13"
                                value={stateData.phone}
                                prefix={<PhoneOutlined  className="site-form-item-icon" />}
                                onChange={handleChangeInput('phone')}
                                autoComplete="off"
                            />    
                        </Col>

                        <Col xs={24} lg={5} className="label">
                            팩스
                        </Col>
                        <Col xs={24} lg={19}>
                            <Input
                                className="tableInput"
                                type="tel"
                                name="fax"
                                maxLength="13"
                                value={stateData.fax}
                                //prefix={<PhoneOutlined  className="site-form-item-icon" />}
                                onChange={handleChangeInput('fax')}
                                autoComplete="off"
                            />    
                        </Col>

                        <Col xs={24} lg={5} className="label">
                            주소  
                        </Col>
                        <Col xs={24} lg={19}>
                            <Space>
                                {/* <Button className='ant-btn-etc-single' block onClick={() => (postPopup())}> */}
                                <Button className='ant-btn-etc-single' block onClick={() => {
                                        commonStore.postVisible = true;
                                        commonStore.setFormAddressFunc = (value) => addPost(value.zipcode,value.fullAddress)
                                    }}>
                                    주소검색
                                </Button>
                            </Space>
                            {stateData.address}                         
                        
                            {stateData.address && 
                                <Input
                                    style={{marginTop:'5px'}}
                                    name="address2"
                                    placeholder ="상세주소"
                                    value={state['address2']}
                                    onChange={handleChangeInput('address2')}
                                    onBlur={handleChange('address2')}
                                    autoComplete="off"
                                />
                            }
                        </Col>    

                        <Col xs={24} lg={5} className="label">
                            거래 담당자
                        </Col> 
                        
                        <Col xs={24} lg={19}>   
                            {stateData.broker_managers.length > 0 &&
                                stateData.broker_managers.map((e,index) => (
                                    <div>{e.name} / {e.department} / {e.company_phone} / {e.cellphone} / {e.email}<Button shape="circle" className="btn_del" onClick={(e) => transactionDel(index)}>X</Button></div>
                                ))
                            }                           
                            <Input.Group>
                                <Row>
                                    <Col span={4} style={stateData.broker_managers.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                        <Input type="text" 
                                            name="name" 
                                            placeholder="성명" 
                                            value={state.brokerArr.name} 
                                            onChange={handleChangeTrArr('name')} 
                                            autoComplete="off"
                                        />   
                                    </Col>
                                    <Col span={5} style={stateData.broker_managers.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                        <Input type="text" 
                                            name="department" 
                                            placeholder="부서" 
                                            value={state.brokerArr.department} 
                                            onChange={handleChangeTrArr('department')} 
                                            autoComplete="off"
                                        /> 
                                    </Col>

                                    <Col span={4} style={stateData.broker_managers.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                        <Input
                                            type="tel"
                                            name="company_phone"
                                            maxLength="13"
                                            placeholder="회사 전화번호" 
                                            value={state.brokerArr.company_phone}
                                            prefix={<PhoneOutlined  className="site-form-item-icon" />}
                                            onChange={handleChangeTrArr('company_phone')} 
                                            autoComplete="off"
                                        /> 
                                    </Col>

                                    <Col span={4} style={stateData.broker_managers.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                        <Input
                                            type="tel"
                                            name="cellphone"
                                            maxLength="13"
                                            placeholder="휴대폰 번호" 
                                            value={state.brokerArr.cellphone}
                                            prefix={<PhoneOutlined  className="site-form-item-icon" />}
                                            onChange={handleChangeTrArr('cellphone')} 
                                            autoComplete="off"
                                        /> 
                                    </Col>

                                    <Col span={6} style={stateData.broker_managers.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                        <Input 
                                            type="text" 
                                            name="email" 
                                            placeholder="이메일" 
                                            value={state.brokerArr.email} 
                                            onChange={handleChangeTrArr('email')} 
                                            onBlur={handleEmailChk('email')} 
                                            autoComplete="off"
                                        /> 
                                    </Col>

                                    <Col span={1} style={stateData.broker_managers.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                        <Button className="btn btn-primary btn_add" shape="circle" onClick={createBtnTrans}>+</Button>
                                        {/* <Button style={{ width: '40px'}} type="primary" onClick={createBtnTrans}>+</Button> */}
                                    </Col>
                                </Row>
                            </Input.Group>     
                        </Col>
                    </>

                    : <>                           
                        <Col xs={24} lg={5} className="label">
                            국적(한글) <span className="spanStar">*</span>
                        </Col>
                        <Col xs={24} lg={19}>
                            <Input className="tableInput" type="text" name="country" value={stateData.country} onChange={handleChangeInput('country')}  autoComplete="off"/>   
                        </Col>

                        <Col xs={24} lg={5} className="label">
                            전화번호
                        </Col>
                        <Col xs={24} lg={19}>
                            <Input
                                className="tableInput"
                                type="tel"
                                name="phone"
                                maxLength="13"
                                value={stateData.phone}
                                prefix={<PhoneOutlined  className="site-form-item-icon" />}
                                onChange={handleChangeInput('phone')}
                                autoComplete="off"
                            />    
                        </Col>

                        <Col xs={24} lg={5} className="label">
                            주소(영어) <span className="spanStar">*</span>
                        </Col>
                        <Col xs={24} lg={19}>
                            <Input type="text" name="address" value={stateData.address} onChange={handleChangeInput('address')}  autoComplete="off"/>   
                        </Col>

                        <Col xs={24} lg={5} className="label">
                            이메일 <span className="spanStar">*</span>
                        </Col>
                        <Col xs={24} lg={19}>
                            <Input className="tableInput" type="text" name="email" value={stateData.email} onChange={handleChangeInput('email')}  onBlur={handleEmailChk('email')}   autoComplete="off"/> 
                        </Col>

                        <Col xs={24} lg={5} className="label">
                            거래 담당자
                        </Col>                                     

                        <Col xs={24} lg={19}>
                            <Input type="text" 
                                className="tableInput"
                                name="transaction_manager" 
                                value={stateData.transaction_manager} 
                                onChange={handleChangeInput('transaction_manager')} 
                                autoComplete="off"
                            /> 
                        </Col>
                    </>
                
                }

                <Col xs={24} lg={5} className="label">
                    계좌 정보 <span className="spanStar">*</span>
                </Col> 

                <Col xs={24} lg={19}>
                    {   
                        stateData.accounts.length > 0 &&
                        
                        stateData.type === '1' ?
                        
                        stateData.accounts.map((e,index) => (
                            <div>{e.purpose} / {state.bankName[index] }/ {e.account_no} / {e.depositor}<Button shape="circle" className="btn_del" onClick={(e) => accountDel(index)}>X</Button></div>
                        ))

                        :
                        stateData.accounts.map((e,index) => (
                            <div>{e.purpose} / {e.bank_name_eng} / {e.swift_code} / {e.account_no} / {e.depositor}<Button shape="circle" className="btn_del" onClick={(e) => accountDel(index)}>X</Button></div>
                        ))
                    }             

                    <Input.Group>
                        <Row>
                            <Col span={4} style={stateData.accounts.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                {/* <Select style={(state.accountArr.purpose === '용도' || state.accountArr.purpose === '') ? {color: '#bfbfbf', width: '100%'} : { width: '100%' }} placeholder="용도" value={state.accountArr.purpose === '' ? '용도' : state.accountArr.purpose}onChange={handleChangeArr('purpose')} >                                
                                    {state.useOption.map((e) => (
                                        <Option value={e.purpose} >
                                            {e.purpose}
                                        </Option>
                                    ))}
                                </Select> */}
                                <wjInput.ComboBox
                                    placeholder={"용도"}
                                    itemsSource={new CollectionView(state.useOption, {
                                        currentItem: null
                                    })}
                                    selectedValuePath="purpose"
                                    displayMemberPath="purpose"
                                    valueMemberPath="purpose"
                                    selectedValue={state.accountArr.purpose}
                                    textChanged={handleChangeArr('purpose')}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            {stateData.type ==='1' 
                                ? 
                                    <Col span={5} style={stateData.accounts.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                        {/* <Select style={(state.accountArr.bank_id === '은행 선택' || state.accountArr.bank_id === ''  )? {color: '#bfbfbf', width: '100%'} : { width: '100%' }} placeholder="은행 선택" value={state.accountArr.bank_id === '' ? '은행 선택' : state.accountArr.bank_id} onChange={handleChangeArr('bank_id')} >
                                            {state.bankOption.map((e) => (
                                                <Option value={e.id} >
                                                    {e.name}
                                                </Option>
                                            ))}
                                        </Select> */}

                                        <wjInput.ComboBox
                                            placeholder={"은행 선택"}
                                            itemsSource={new CollectionView(state.bankOption, {
                                                currentItem: null
                                            })}
                                            selectedValuePath="id"
                                            displayMemberPath="name"
                                            valueMemberPath="id"
                                            selectedValue={state.accountArr.bank_id}
                                            textChanged={handleChangeArr('bank_id')}
                                            style={{ width: '100%' }}
                                        />
                                    </Col>    
                                :                                
                                    <><Col span={4} style={stateData.accounts.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                        <Input
                                            name="bank_name_eng"
                                            value={state.accountArr.bank_name_eng}
                                            onChange={handleChangeArr('bank_name_eng')} 
                                            placeholder ="은행명(영어)"
                                            autoComplete="off"
                                        /> 
                                    </Col>  
                                    <Col span={4} style={stateData.accounts.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                        <Input
                                            name="swift_code"
                                            value={state.accountArr.swift_code}
                                            onChange={handleChangeArr('swift_code')} 
                                            onBlur={handleSwiftChk('swift_code')}
                                            placeholder ="SWIFT CODE"
                                            style={state.switchRed === false ? {color: '#262626'} : {color: 'red'}}
                                            maxLength={11}
                                            autoComplete="off"
                                        /> 
                                    </Col>  </>
                            }

                            <Col span={stateData.type ==='1' ? 8 : 5} style={stateData.accounts.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                <Input
                                    name="account_no"
                                    value={state.accountArr.account_no}
                                    onChange={handleChangeArr('account_no')} 
                                    placeholder ="계좌번호 (ex.123-12-123)"
                                    autoComplete="off"
                                    maxLength="20"
                                />  
                            </Col>

                            <Col span={6} style={stateData.accounts.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                <Input
                                    name="depositor"
                                    value={state.accountArr.depositor}
                                    onChange={handleChangeArr('depositor')} 
                                    placeholder ="예금주"
                                    autoComplete="off"
                                />  
                            </Col>

                            <Col span={1} style={stateData.accounts.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                <Button className="btn btn-primary btn_add" shape="circle" onClick={createBtn}>+</Button>
                                {/* <Button type="primary" onClick={createBtn}>+</Button> */}
                            </Col>
                        </Row>
                    </Input.Group>     
                </Col>

                <Col xs={24} lg={5} className="label">
                    기타 참고사항
                </Col>
                <Col xs={24} lg={19}>
                    <Input.TextArea name="memo" rows={4}  onChange={handleChangeInput('memo')} value={stateData.memo}/>
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
        
            {postVisible === true && (
                <PopupPostCode chkVisible={postVisible} addPost={addPost} postClose={postClose}/>
            )}

        </Wrapper>
    );
});

export default brokersDrawer;