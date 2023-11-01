/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {   Button, Row, Col,  Modal, Input,   message, Radio,   Select, Space} from 'antd';
import { PhoneOutlined ,QuestionOutlined } from '@ant-design/icons';
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
    type: '',
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
    managers :'',
        
    country : '',
    email:'',
    transaction_manager:'', 
};

const brokersView = observer(({idx,type,popoutCloseVal,popoutChk,drawerChk}) => {
    const { commonStore } = useStore();

    const { Option } = Select;

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 

    const state = useLocalStore(() => ({
        idx: '',
        type: '',
        popoutChk:'',           //팝업체크

        create_info:'',         //등록자
        dataOld : [],           //이전 데이터
        updata:'',              //수정된 데이터
        address2 : '',          //상세주소
        
        adminChk : true,        //관리자여부

        drawerback : '',        //오른쪽 class
        bankOption: [],         //은행리스트
        memberOption: [],       //담당자 회원 리스트
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

        accountArr : 
            {
                purpose: '',    
                bank_id: '',    
                account_no: '',    
                account_type: '1',    
                depositor: '', 
                swift_code: '',    
                bank_name_eng: '',    
                id:'',
                use_yn : '',
            }
        ,

        brokerArr : 
            {
                name: '',
                department: '',
                company_phone: '',
                cellphone: '',
                email: '',
            }
        ,
        bankName:[],

        address2:'',    //상세주소
        address:'',    //주소
        addModifyChk : false, //주소 바꿨는지 체크

        accountCount : 0, //용도 카운트
        switchRed: false
    }));
    
    useEffect(() => {       
        state.type= type;
        state.idx= idx;
        state.popoutChk= popoutChk;

        bankData();
        memberData();
        viewData(idx,type);
    }, [idx,type]);

    const popoutClose = (val) => {
        popoutCloseVal(val);
    };

    //데이터 초기화
    const reset =() =>{
        for (const key in state.dataOld) {
            stateData[key] = state.dataOld[key];
        }
        if(stateData.type === '1'){
            state.accountArr.account_type = '1'
        }
        state.updata = '';
        var managerData = [];
        state.dataOld.managers.forEach(e => {
            managerData = [...managerData, e];          
        });                  
        state.bankName = [];
        setManager(managerData);

        if(state.dataOld.created_info.teams){
            setManagerTxt(state.dataOld.created_info.name+'('+state.dataOld.created_info.teams.name+')');
        }else{    
            setManagerTxt(state.dataOld.created_info.name+'(-)');
        }
    }

    //상세정보
    const viewData = useCallback(async (idx,type) => {   
        if((type !== '' && type !== undefined) && (idx !== '' && idx !== undefined)){
            const result = await axios.get(
                process.env.REACT_APP_API_URL +'/api/v1/'+type+'/'+idx,
                {
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  },
                },
            )
            var data = result.data.data;
            state.dataOld = data;
            state.create_info = data.created_info;
    
            if(data == ''){
                Modal.error({
                    content: '문제가 발생하였습니다. 재시도해주세요.' ,        
                }); 
            }else{
                for (const key in stateData) {
                    for (const key2 in data) {
                        if(key === key2){
                            stateData[key] = data[key];
                        }                
                    }                
                } 
                stateData.accounts = data.accounts;
                // stateData.t = data.accounts;
                if(stateData.accounts.length > 0 ){
                    stateData.accounts.forEach(e => {
                        if(stateData.type === '1'){
                            state.bankName = [...state.bankName, e.bank.name]
                        }                        
                        state.accountCount++
                    });
                }                
            }             
    
            if(stateData.accounts.length > 0){
                //용도 선택된거 빼고 arr 재정렬
                // state.useOption = state.useOptionOld.filter((e) => !stateData.accounts.includes(e.purpose));
                if(stateData.accounts.length === 1){
                    state.useOption = state.useOption.filter((e) =>stateData.accounts[0].purpose !== e.purpose);
                }else{
                    state.useOption = [];            
                }
            }

            //담당자      
            if(data.managers.length > 0){
            var managerData = [];
            var managerText = [];
        
            data.managers.forEach(e => {
                managerData = [...managerData, e.id];
                if(e.teams){
                    managerText = [...managerText, e.name+'('+e.teams.name+')'];
                }else{
                    managerText = [...managerText, e.name+'(-)'];
                }
                
            });          
            state.dataOld.managers =managerData;
            setManager(managerData);
            setManagerTxt(managerText);
            
            }else{
                setManager([data.created_info.id]);
                if(data.created_info.teams){
                    setManagerTxt(data.created_info.name+'('+data.created_info.teams.name+')');
                }else{    
                    setManagerTxt(data.created_info.name+'(-)');
                }          
                state.updata = {...state.updata, 'managers': data.created_info.id};
                state.dataOld.managers = [data.created_info.id];
            }         
        }       
        
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
            console.log(error.response);
            if(error.response !== undefined){
                Modal.error({
                    title: '오류가 발생했습니다. 재시도해주세요.',
                    content: '오류코드:' + error.response.status,
                });
            }
            
        });
    }, []);


    //담당자
    const memberData = useCallback(async () => {
        const result = await axios.get(
        process.env.REACT_APP_API_URL +'/api/v1/users?display=500&page=1&sort_by=date&order=desc',
        {
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            },
        },
        )
        const options = [];
        result.data.data.forEach(e=>{
            options.push({
                label: e.name+"("+e.department+")",
                value: Number(e.id),
            });
        });

        // state.memberOption = result.data.data;
        state.memberOption = options;

    }, []);

    //담당자 추가
    const [manager, setManager] = useState([]);
    const [managerTxt, setManagerTxt] = useState('');
    const handleChangeSelect = useCallback( (e) => {
        var num = 0;
        if(state.dataOld.managers.length > 0){
            state.dataOld.managers.forEach((val,index) => {
                if(val === e[index]){
                    num++;
                }
            });
        }

        setManager(e);
        if(state.dataOld.managers.length !== num){
            if(e.length > 0){
                state.updata =  {...state.updata, 'managers': e};
            }else{
                state.updata =  {...state.updata, 'managers': ''};
            }
        } else{
            if(state.updata.managers === ''){
                var text = '';
                for(const key in state.updata){
                    if(key !== 'managers'){
                        text = {...text, [key] : state.updata[key]}
                    }
                }
                state.updata = text
            }
        }
        },[],
    );  

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
            var swiftChk =/[^a-z|A-Z|0-9]/g;

            var key = type+'error'

            if (type === 'phone' || type === 'fax') {
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
            }else if(type ==='country'){
                if(korChk.test(e.target.value)){
                    message.warning({ content: '한글만 입력 가능합니다.', key});  
                }else{
                    stateData[type] = e.target.value.replace(/[^ㄱ-ㅎ|가-힣]/g,'' );
                }   
            }else if(type ==='address2'){
                state[type] = e.target.value;
            }else if(type ==='address'){
                if(nameEngChk.test(e.target.value)){
                    message.warning({ content: '영문과 숫자, 일부 특수문자만 입력 가능합니다.', key});      
                }else{
                    stateData[type] = e.target.value.replace(  /[^a-zA-Z0-9.,\s-]/g, '');
                }   
            }else if(type ==='email'){
                if(emailChk.test(e.target.value)){
                    message.warning({ content: '영문과 특수문자만 입력할 수 있습니다.', key});       
                }else{
                    stateData[type] = e.target.value.replace(/[^\.@a-z|A-Z|0-9]/g,'',);   
                } 
                
            } else if (type === 'name') {
                if (stateData.type === '2') {
                    if(nameEngChk.test(e.target.value)){
                        message.warning({ content: '영문과 숫자, 일부 특수문자만 입력 가능합니다.', key});   
                    }else{
                        stateData[type] = e.target.value.replace( /[^a-zA-Z0-9.,\s-]/g, '');
                    }  
                } else {
                    stateData[type] = e.target.value;
                }
            
            }else{     
                if(type === 'type'){
                    if(stateData['type'] !== e.target.value){
                        for (const key in DEF_STATE) {
                            stateData[key] = DEF_STATE[key];
                        }
                    } 
                }                     
                
                stateData[type] = e.target.value;
                
            }                    
        },
        [],
    );

    const handleChangeArr = useCallback((type) => (e) => {
        var key = type+'error'
        var engChk = /[^a-z|A-Z]/g;
        var swiftChk =/[^a-z|A-Z|0-9]/g;
        var accountnoChk =/[^\-0-9]/g;
        var nameEngChk =/[^a-zA-Z0-9.,\s-]/g;
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
                    stateData[type] = e.target.value.replace( /[^a-zA-Z0-9.,\s-]/g, '');
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
                var value = e.target.value.replace( /[^a-zA-Z0-9.,\s-]/g, '');
                state.accountArr = {...state.accountArr,[type] : value};  
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

    const handleChange = useCallback((type) => (e) => {
        if (type === 'address2') {
            if(e.target.value === '' || e.target.value === undefined){
                stateData.address = state.address;                
            }else{
                stateData.address = state.address+ ', ' + e.target.value;
            }
            
        }
        
    },[],);

    //우편번호
    const addPost = (zipcode, address) => {      
        stateData.address = '['+zipcode+'] '+address;    
        state.address = '[' + zipcode + '] ' + address;  
        state.addModifyChk = true  
    }    

    //우편    
    const [postVisible, setPostVisible] = useState(false);
    const postPopup = () => {
        setPostVisible(true);
    };
    const postClose = () => {
        setPostVisible(false);
    };

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
      
    //이메일확인
    const handleEmailChk = useCallback((type) => (e) => {
        if(type === 'email'){
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
        }     
    },[],);

    //계좌 정보 추가
    const createBtn = ()=>{
        var chkVal = true;

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
        

        if(chkVal = true){
            //용도 선택된거 빼고 arr 재정렬
            state.useOption = state.useOption.filter((e) =>state.accountArr.purpose !== e.purpose);

            //실제 데이터에 넣고 배열 초기화
            if(stateData.type === '1'){
                stateData.accounts  = [...stateData.accounts ,
                    {purpose: state.accountArr.purpose,    
                    bank_id: state.accountArr.bank_id,        
                    account_no: state.accountArr.account_no,       
                    depositor: state.accountArr.depositor,     
                    account_type:state.accountArr.account_type,    
                    use_yn : 'Y'
                }]
            }else{
                stateData.accounts  = [...stateData.accounts ,
                    {purpose: state.accountArr.purpose,    
                    swift_code: state.accountArr.swift_code,        
                    account_no: state.accountArr.account_no,       
                    depositor: state.accountArr.depositor,     
                    bank_name_eng:state.accountArr.bank_name_eng,  
                    use_yn : 'Y'  
                }]
            }

            // stateData.accounts =[...stateData.accounts,state.accountArr] ;
            state.accountArr = {
                purpose: '',    
                bank_id: '',    
                account_no: '',    
                depositor: '', 
                account_type:'',
                swift_code:'',
                bank_name_eng: '',
                id: '',
                use_yn: '',
            };
        }        
    }

    //계좌정보 삭제
    const accountDel = (num)=>{      
        var arrList = [];
        var purposeChk = ''
        stateData.accounts.map((e,index) => {
            if (index === num) {
                e.use_yn = 'N'    
                purposeChk = e.purpose            
            }
            if(e.use_yn === 'Y'){
                state.accountCount++
            }
        });

        console.log(state.accountCount)
        console.log(purposeChk)
        console.log(toJS(state.useOptionOld))

        if(state.accountCount === 0){
            state.useOption = state.useOptionOld
        }else if(state.accountCount === 1){
            state.useOptionOld.map((e) => {
                if (e.purpose === purposeChk) {
                    state.useOption = [...state.useOption, e]
                }
            });
        }        

        console.log(toJS(state.useOption))
        console.log(toJS(stateData.accounts))

        // stateData.accounts = arrList;
        // stateData.accounts.map((e,index) => {
        //     if (index !== num) {
        //         arrList.push(e);
        //     }
        // });
        // stateData.accounts = arrList;

        //용도 배열 재정렬
        // if(purposeChk.length > 0){

        // }
        // if(stateData.accounts.length === 1){
        //     console.log(state.useOptionOld)
        //     // state.useOption = state.useOptionOld.filter((e) =>stateData.accounts[0].purpose !== e.purpose);
        //     // state.useOption = state.useOptionOld.filter((e) =>purposeChk !== e.purpose && e.use_yn === 'N');
        // }else if(stateData.accounts.length === 0){
        //     state.useOption = state.useOptionOld;
        // }else{
        //     state.useOption = []; 
        // }
        // console.log(state.useOption)
        
        //state.useOption = state.useOptionOld.filter((e) => !stateData.accounts.includes(e.purpose));
    }

    //거래담당자 추가
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

    //거래담당자 삭제
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
        var accountsChkCount = 0
        stateData.accounts.forEach(e => {
            if(e.use_yn !=='N'){
                accountsChkCount++
            }            
        });

        let chkVal = true;
        
        if(stateData.managers === '' ){
            Modal.error({
                content: '담당자를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData.name == ""){
            Modal.error({
                content: '사업자명을 작성해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData.type ==='1'){   
            if(stateData.owner_name === ""){
                Modal.error({
                    content: '대표자를 작성해주세요.',        
                });
                chkVal = false;
                return;
            }

            // if(stateData.accounts.length === 0){
            if(accountsChkCount === 0){
                Modal.error({
                    content: '계좌 정보를 작성해주세요.',        
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

            //계좌정보  
            // if(stateData.accounts.length === 0){
            if(accountsChkCount === 0){
                Modal.error({
                    content: '계좌 정보를 작성해주세요.',        
                });
                chkVal = false;
                return;
            }
        }    

        if(chkVal === true){
            var axios = require('axios');
            var updata = '';
            if(stateData.type === '1'){
                updata = {
                    name: stateData.name,
                    owner_name: stateData.owner_name,
                    phone: stateData.phone,
                    fax: stateData.fax,
                    address: stateData.address,
                    memo:stateData.memo,
                    accounts:stateData.accounts,    
                    broker_managers: stateData.broker_managers,      
                    managers : stateData.managers,
                    taxation_type : stateData.taxation_type   ,
                    id: state.idx               
                }
            }else{
                updata = {
                    name: stateData.name,
                    country : stateData.country,
                    phone: stateData.phone,
                    address: stateData.address,
                    email:stateData.email,
                    transaction_manager:stateData.transaction_manager,                    
                    accounts:stateData.accounts,   
                    memo:stateData.memo,
                    managers : stateData.managers,
                    id: state.idx
                }
            }
console.log(toJS(updata))
// return
            var config={
                method:'POST',
                url:process.env.REACT_APP_API_URL +'/api/v1/'+state.type,
                headers:{
                    'Accept':'application/json',
                },
                    data:updata
                };
                
            axios(config)
            .then(function(response){
                if(response.data.id !== ''){
                    Modal.success({
                        title: response.data.result,
                        onOk(){
                            for (const key in stateData) {
                                state.dataOld[key] = stateData[key];
                            }
                        },
                    });
                }else{
                    Modal.error({
                        content:(<div>
                                    <p>수정시 문제가 발생하였습니다.</p>
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
                <Col xs={5} lg={5} className="label">
                    사업자명 {(state.adminChk === true && state.popoutChk !== 'Y' && stateData.type === '2') && '(영어)' } <span className="spanStar">*</span>
                </Col>
                <Col xs={19} lg={19}>
                    { state.adminChk === true && state.popoutChk !== 'Y'
                        ? <Input className="tableInput" type="text" name="name" value={stateData.name} onChange={handleChangeInput('name')} autoComplete="off"/>   
                        : stateData.name
                    }
                </Col>

                {stateData.type !== '1' && <>
                <Col xs={5} lg={5} className="label">
                    유형
                </Col>
                <Col xs={19} lg={19}>
                    {stateData['type'] === '1'
                        ?   '국내 업체'
                        :   '해외 업체'
                        
                    }                    
                </Col>
                </>}

                {stateData.type === '1' 
                    ? <>
                        <Col xs={5} lg={5} className="label">
                            사업자등록번호
                        </Col>
                        <Col xs={19} lg={19}>
                            {stateData.company_no}                          
                        </Col>
                        <Col xs={5} lg={5} className="label">
                            유형
                        </Col>
                        <Col xs={19} lg={19}>
                            {stateData['type'] === '1'
                                ?   '국내 업체'
                                :   '해외 업체'
                                
                            }                    
                        </Col>
                        {/* <Col xs={5} lg={5} className="label">
                            세금 구분
                        </Col>
                        <Col xs={19} lg={19}>
                            {stateData.taxation_type === '1' ? '면세' : '과세'}
                        </Col> */}

                        <Col xs={5} lg={5} className="label">
                            대표자  { state.adminChk === true && state.popoutChk !== 'Y'&& <span className="spanStar">*</span> }
                        </Col>
                        <Col xs={19} lg={19}>
                            { state.adminChk === true && state.popoutChk !== 'Y'
                                ? <Input className="tableInput" type="text" name="owner_name" value={stateData.owner_name} onChange={handleChangeInput('owner_name')} required autoComplete="off"/> 
                                : stateData.owner_name
                            }                            
                        </Col>

                        <Col xs={5} lg={5} className="label">
                            대표 전화번호
                        </Col>
                        <Col xs={19} lg={19}>
                            { state.adminChk === true && state.popoutChk !== 'Y'
                                ? <Input
                                    className="tableInput" 
                                    type="tel"
                                    name="phone"
                                    maxLength="13"
                                    value={stateData.phone}
                                    prefix={<PhoneOutlined  className="site-form-item-icon" />}
                                    onChange={handleChangeInput('phone')}
                                    autoComplete="off"
                                />    
                                : stateData.phone
                            }
                        </Col>

                        <Col xs={5} lg={5} className="label">
                            팩스
                        </Col>
                        <Col xs={19} lg={19}>
                            { state.adminChk === true && state.popoutChk !== 'Y'
                                ? <Input
                                    className="tableInput" 
                                    type="tel"
                                    name="fax"
                                    maxLength="13"
                                    value={stateData.fax}
                                    //prefix={<PhoneOutlined  className="site-form-item-icon" />}
                                    onChange={handleChangeInput('fax')}
                                    autoComplete="off"
                                  />    
                                : stateData.fax
                            }
                        </Col>

                        <Col xs={5} lg={5} className="label">
                            주소  
                        </Col>
                        <Col xs={19} lg={19}>
                            { state.adminChk === true && state.popoutChk !== 'Y'
                                ? <>
                                    <div className="postBtn">
                                        <Space>
                                            {/* <Button className='ant-btn-etc-single' block onClick={() => (postPopup())}> */}
                                            <Button className='ant-btn-etc-single' block onClick={() => {
                                                commonStore.postVisible = true;
                                                commonStore.setFormAddressFunc = (value) => addPost(value.zipcode,value.fullAddress)
                                            }}>
                                                주소검색
                                            </Button>
                                        </Space>
                                    </div>
                                    <div style={{marinBottom: '10px'}}>{stateData.address}</div>    

                                    {state.addModifyChk === true && (
                                        <Input
                                            style={{ marginTop: '5px' }}
                                            name="address2"
                                            placeholder="상세주소"
                                            value={state['address2']}
                                            onChange={handleChangeInput('address2')}
                                            onBlur={handleChange('address2')}
                                            autoComplete="off"
                                        />
                                    )}                
                                </>

                                : stateData.address
                            }
                            
                        </Col>    

                        <Col xs={5} lg={5} className="label">
                            거래 담당자
                        </Col> 
                        
                        <Col xs={19} lg={19}>  
                            { state.adminChk === true && state.popoutChk !== 'Y'
                                ?<>
                                    {stateData.broker_managers.length > 0 &&
                                        stateData.broker_managers.map((e,index) => (
                                            <div>{e.name} / {e.department} / {e.company_phone} / {e.cellphone} / {e.email}<Button shape="circle" className="btn_del" onClick={(e) => transactionDel(index)}>X</Button></div>
                                        ))
                                    }                                

                                    <Input.Group>
                                        <Row>
                                            <Col span={4} style={{padding: '0 10px 0 0'}}>
                                                <Input type="text" 
                                                    name="name" 
                                                    placeholder="성명" 
                                                    value={state.brokerArr.name} 
                                                    onChange={handleChangeTrArr('name')} 
                                                    autoComplete="off"
                                                />   
                                            </Col>
                                            <Col span={5} style={{padding: '0 10px 0 0'}}>
                                                <Input type="text" 
                                                    name="department" 
                                                    placeholder="부서" 
                                                    value={state.brokerArr.department} 
                                                    onChange={handleChangeTrArr('department')} 
                                                    autoComplete="off"
                                                /> 
                                            </Col>

                                            <Col span={4} style={{padding: '0 10px 0 0'}}>
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

                                            <Col span={4} style={{padding: '0 10px 0 0'}}>
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

                                            <Col span={6} style={{padding: '0 10px 0 0'}}>
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

                                            <Col span={1} style={{padding: '0 10px 0 0'}}>
                                                <Button className="btn btn-primary btn_add" shape="circle" onClick={createBtnTrans}>+</Button>
                                                {/* <Button style={{ width: '40px'}} type="primary" onClick={createBtnTrans}>+</Button> */}
                                            </Col>
                                        </Row>
                                    </Input.Group>     
                                </>

                                : 
                                stateData.broker_managers.length > 0 &&
                                stateData.broker_managers.map((e,index) => (
                                    <div>{e.name} / {e.department} / {e.company_phone} / {e.cellphone} / {e.email}</div>
                                ))
                                

                            }
                        </Col>
                    </>

                    : <>                           
                        <Col xs={5} lg={5} className="label">
                            국적(한국어)  { state.adminChk === true && state.popoutChk !== 'Y'&& <span className="spanStar">*</span>}
                        </Col>
                        <Col xs={19} lg={19}>
                            { state.adminChk === true && state.popoutChk !== 'Y'
                                ? <Input className="tableInput" type="text" name="country" value={stateData.country} onChange={handleChangeInput('country')}  autoComplete="off"/>   
                                : stateData.country
                            }                                
                        </Col>

                        <Col xs={5} lg={5} className="label">
                            전화번호 
                        </Col>
                        <Col xs={19} lg={19}>
                            { state.adminChk === true && state.popoutChk !== 'Y'
                                ?
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
                                : stateData.phone
                            }
                        </Col>

                        <Col xs={5} lg={5} className="label">
                            주소(영어) { state.adminChk === true && state.popoutChk !== 'Y'&& <span className="spanStar">*</span>}
                        </Col>
                        <Col xs={19} lg={19}>
                            { state.adminChk === true && state.popoutChk !== 'Y'
                                ?
                                <Input type="text" name="address" value={stateData.address} onChange={handleChangeInput('address')}  autoComplete="off"/> 
                                : stateData.address
                            }  
                        </Col>

                        <Col xs={5} lg={5} className="label">
                            이메일 { state.adminChk === true && state.popoutChk !== 'Y'&& <span className="spanStar">*</span>}
                        </Col>
                        <Col xs={19} lg={19}>
                            { state.adminChk === true && state.popoutChk !== 'Y'
                                ?<Input className="tableInput" type="text" name="email" value={stateData.email} onChange={handleChangeInput('email')}  onBlur={handleEmailChk('email')}   autoComplete="off"/> 
                                : stateData.email
                            }
                        </Col>

                        <Col xs={5} lg={5} className="label">
                            거래 담당자
                        </Col>                                     

                        <Col xs={19} lg={19}>
                            { state.adminChk === true && state.popoutChk !== 'Y'
                                ?<Input 
                                    className="tableInput"     
                                    type="text" 
                                    name="transaction_manager" 
                                    value={stateData.transaction_manager} 
                                    onChange={handleChangeInput('transaction_manager')} 
                                    autoComplete="off"
                                /> 
                                : stateData.transaction_manager
                            }
                        </Col>
                    </>
                
                }

                <Col xs={5} lg={5} className="label">
                    계좌 정보 { state.adminChk === true && popoutChk !== 'Y'&& <span className="spanStar">*</span>}
                </Col> 

                <Col xs={19} lg={19}>
                    { state.adminChk === true && popoutChk !== 'Y' ? (
                        <>
                            { state.accountCount > 0 &&
                                stateData.accounts.map((e,index) => {
                                    if(e.use_yn != 'N' && e.account_type === '1'){       
                                        return <><div>{e.purpose} / {state.bankName[index]} / {e.account_no} / {e.depositor} <Button shape="circle" className="btn_del" 
                                                    onClick={(e) => accountDel(index)}>X</Button></div></>
                                    } else {
                                        if(e.use_yn != 'N'){
                                            return <><div>{e.purpose} / {e.bank_name_eng} / {e.swift_code} / {e.account_no} / {e.depositor} <Button shape="circle" className="btn_del" 
                                                    onClick={(e) => accountDel(index)}>X</Button></div></>
                                        }                                        
                                    }                          
                                })
                            }

                            <Input.Group>
                                <Row>
                                    <Col span={4} style={{padding: '0 10px 0 0'}}>
                                        {/* <Select style={(state.accountArr.purpose === '용도' || state.accountArr.purpose === '') ? {color: '#bfbfbf', width: '100%'} : { width: '100%' }} placeholder="용도" value={state.accountArr.purpose === '' ? '용도' : state.accountArr.purpose}onChange={handleChangeArr('purpose')} >                                
                                            {state.useOption.map((e) => (
                                                <Option value={e.purpose} >
                                                    {e.purpose}
                                                </Option>
                                            ))}
                                        </Select> */}
                                        <wjInput.ComboBox
                                            placeholder="용도"
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
                                            <Col span={5} style={{padding: '0 10px 0 0'}}>
                                                {/* <Select style={(state.accountArr.bank_id === '은행 선택' || state.accountArr.bank_id === ''  )? {color: '#bfbfbf', width: '100%'} : { width: '100%' }} placeholder="은행 선택" value={state.accountArr.bank_id === '' ? '은행 선택' : state.accountArr.bank_id} onChange={handleChangeArr('bank_id')} >
                                                    {state.bankOption.map((e) => (
                                                        <Option value={e.id} >
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
                                                    selectedValue={state.accountArr.bank_id}
                                                    textChanged={handleChangeArr('bank_id')}
                                                    style={{ width: '100%' }}
                                                />
                                            </Col>    
                                        :                                
                                            <>
                                                <Col span={4} style={{padding: '0 10px 0 0'}}>
                                                    <Input
                                                        name="bank_name_eng"
                                                        value={state.accountArr.bank_name_eng}
                                                        onChange={handleChangeArr('bank_name_eng')} 
                                                        placeholder ="은행명(영어)"
                                                        autoComplete="off"
                                                    /> 
                                                </Col>  
                                                <Col span={4} style={{padding: '0 10px 0 0'}}>
                                                    <Input
                                                        name="swift_code"
                                                        value={state.accountArr.swift_code}
                                                        onChange={handleChangeArr('swift_code')} 
                                                        onBlur={handleSwiftChk('swift_code')}
                                                        style={state.switchRed === false ? {color: '#262626'} : {color: 'red'}}
                                                        maxLength={11}
                                                        placeholder ="SWIFT CODE"
                                                        autoComplete="off"
                                                    /> 
                                                </Col>
                                            </>
                                    }

                                    <Col span={stateData.type ==='1' ? 8 : 5} style={{padding: '0 10px 0 0'}}>
                                        <Input
                                            name="account_no"
                                            value={state.accountArr.account_no}
                                            onChange={handleChangeArr('account_no')} 
                                            placeholder ="계좌번호 (ex.123-12-123)"
                                            autoComplete="off"
                                            maxLength="20"
                                        />  
                                    </Col>

                                    <Col span={6} style={{padding: '0 10px 0 0'}}>
                                        <Input
                                            name="depositor"
                                            value={state.accountArr.depositor}
                                            onChange={handleChangeArr('depositor')} 
                                            placeholder ="예금주"
                                            autoComplete="off"
                                        />  
                                    </Col>

                                    <Col span={1} style={{padding: '0 10px 0 0'}}>
                                        <Button className="btn btn-primary btn_add" shape="circle" onClick={createBtn}>+</Button>
                                    </Col>
                                </Row>
                            </Input.Group>
                        </>
                    ) : (
                        state.accountCount > 0 &&
                            stateData.accounts.map((e,index) => {
                                if(stateData.type === '2' && e.use_yn === 'Y'){
                                    return <><div>용도: {e.purpose} / 은행 : {e.bank_name_eng} / SWIFT CODE: {e.swift_code} / 계좌번호: {e.account_no} / 예금주 : {e.depositor}</div></>
                                }else if(stateData.type === '1' && e.use_yn === 'Y'){ 
                                    return <><div>용도: {e.purpose} / 은행 : {state.bankName[index]} / 계좌번호: {e.account_no} / 예금주 : {e.depositor}</div></>
                                }else{
                                    return ''
                                }
                            })                   
                    )}
                </Col>

                <Col xs={5} lg={5} className="label">
                    등록자
                </Col>
                <Col xs={19} lg={19}>
                    {state.create_info.name}
                </Col>

                <Col xs={5} lg={5} className="label">
                    담당자 {state.adminChk === true && state.popoutChk !== 'Y'&& <span className="spanStar">*</span>}
                </Col>
                <Col xs={19} lg={19}>
                    {state.adminChk === true && state.popoutChk !== 'Y'
                        ?   <Select 
                                value={manager} 
                                mode="multiple" 
                                showArrow 
                                style={{ width: '100%' }} 
                                placeholder="담당자를 선택하세요." 
                                onChange={handleChangeSelect} 
                                options={state.memberOption}
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                            />    
                        : managerTxt 
                    }                    
                </Col>
                <Col xs={5} lg={5} className="label">
                    기타 참고사항
                </Col>
                <Col xs={19} lg={19}>
                    { state.adminChk === true && state.popoutChk !== 'Y'
                        ? <Input.TextArea name="memo" rows={4}  onChange={handleChangeInput('memo')} value={stateData.memo}/>
                        : stateData.memo
                    }                    
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

             {postVisible === true && (
                <PopupPostCode chkVisible={postVisible} addPost={addPost} postClose={postClose}/>
            )}     

        </Wrapper>
    );
});

export default brokersView;