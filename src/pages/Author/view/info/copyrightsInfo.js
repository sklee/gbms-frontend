/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {  Space, Button, Row, Col,  Modal, Input,   message, Radio,  Popover, Select, Typography,Upload} from 'antd';
import { PhoneOutlined ,QuestionOutlined ,UploadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { set, toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';
import ReactDOM from "react-dom";
import * as wjInput from '@grapecity/wijmo.react.input';
import { CollectionView } from '@grapecity/wijmo';

import PopupPostCode from '@components/Common/DaumAddress';
import tooltipData from '@pages/tooltipData';

const Wrapper = styled.div`
    width: 100%;
    `;


const DEF_STATE = {
    // DB Data
    type: '',
    name: '',
    person_no: '',
    taxation_type: '',
    email: '',
    phone: '',
    address: '',
    account_type: '',    
    bank: '',    
    bank_id: '',    
    bank_name_eng: '',    
    account_no: '',    
    swift_code: '',    
    depositor: '',       
    copyright_files: [],
    memo: '' ,
    country: '' ,
    tax_rate: '' ,
    managers :''
};

const ownersView = observer(({idx,type,popoutCloseVal,popoutChk, drawerChk}) => {
    const { commonStore } = useStore();

    const { Text } = Typography;
    const { Option } = Select;

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 

    const state = useLocalStore(() => ({
        idx: '',
        type: '',
        popoutChk:'',           //팝업체크

        drawerback : '',        //오른쪽 class
        bankOption: [],         //은행리스트
        memberOption: [],       //담당자 회원 리스트

        create_info:'',         //등록자
        dataOld : [],           //이전 데이터
        updata:'',              //수정된 데이터
        selectedFile:[],
        oldFile:[],
        delFile:[],
        addFile:[],

        address2:'',    //상세주소
        address:'',    //주소
        addModifyChk : false, //주소 바꿨는지 체크
        
        adminChk : true,
        url : '',

        fileChk : 0,    //파일 있는지 체크
        switchRed: false,
        tooltipData : '',
    }));
    
    useEffect(() => {       
        state.type= type;
        state.idx= idx;
        state.popoutChk= popoutChk;

        bankData()
        memberData();
        if(tooltipData !== '' && tooltipData !== undefined){
            var data = []
            tooltipData.forEach((e,num) => {
                if(e.id === 'author'){
                    data = [...data, (<div dangerouslySetInnerHTML={{__html: tooltipData[num].memo}}></div>)]
                }
            });
            // var data = (<div dangerouslySetInnerHTML={{__html: tooltipData[1].memo}}></div>);
            state.tooltipData = data
        }       
        // viewData(idx,type)
    }, [idx]);

    const popoutClose = (val) => {
        popoutCloseVal(val);
    };

    //데이터 초기화
    const reset =() =>{
        for (const key in state.dataOld) {
            stateData[key] = state.dataOld[key];
        }
        state.updata = '';
        state.selectedFile = state.oldFile;
        state.address2 = '';
        setFileList(state.oldFile);
        var managerData = [];
        state.dataOld.managers.forEach(e => {
            managerData = [...managerData, e];          
        });                  
        setManager(managerData);        

        if(state.dataOld.created_info.teams){
            setManagerTxt(state.dataOld.created_info.name+'('+state.dataOld.created_info.teams.name+')');
        }else{    
            setManagerTxt(state.dataOld.created_info.name+'(-)');
        }
    }

    //상세정보
    const viewData = useCallback(async (idx,type) => {    
        const result = await axios.get(
          process.env.REACT_APP_API_URL +'/api/v1/'+type+'/'+idx,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          },
        )
        console.log(result.data.data)
        var data = result.data.data;
        state.dataOld = data;
        state.create_info = data.created_info;
        
        data.files.forEach(e => {
            state.selectedFile = [ ...state.selectedFile, {uid: e.uid, name: e.file_name, file_path: e.file_path, url : '#', use_yn: e.use_yn, id : e.id}]
            stateData.copyright_files = [...stateData.copyright_files, {file_name: e.file_name, file_path: e.file_path, use_yn: e.use_yn, id : e.id}]
            state.fileChk++
        });
        setFileList(state.selectedFile );
        state.oldFile = state.selectedFile;

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
            stateData.managers = managerData;
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
            //state.updata = {...state.updata, 'managers': data.created_info.id};
            stateData.managers = {...stateData.managers, 'managers': data.created_info.id};
            state.dataOld.managers = [data.created_info.id];
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
                viewData(idx,type)
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
        setManager(e);
        stateData.managers = e;
    },[],);  

    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback(
        (type) => (e) => {
            var engChk = /[^a-z|A-Z]/g;
            var korChk =/[^ㄱ-ㅎ|가-힣]/g;
            var emailChk =/[^\.@a-z|A-Z|0-9]/g;
            var accountnoChk =/[^\-0-9]/g;
            var nameEngChk =/[^a-zA-Z0-9.,\s-]/g;
            var addressChk =/[^\s|.,|a-z|A-Z|0-9]/g;
            var taxrateChk =/[^\.0-9]/g;
            var swiftChk =/[^a-z|A-Z|0-9]/g;
            var depositorEngChk =/[^|\s|.,|a-z|A-Z]/g;

            var key = type+'error'

            if (type === 'phone') {
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
               
            } else if (type === 'address2') {
                state.address2 = e.target.value;
            } else if (type === 'address') {
                if(addressChk.test(e.target.value)){
                    message.warning({ content: '영문과 숫자, 일부 특수문자만 입력 가능합니다.', key});      
                }else{
                    stateData[type] = e.target.value.replace(  /[^\s|.,|a-z|A-Z|0-9]/g, '');
                }               
            }else if(type === 'email'){
                if(emailChk.test(e.target.value)){
                    message.warning({ content: '영문과 특수문자만 입력할 수 있습니다.', key});       
                }else{
                    stateData[type] = e.target.value.replace(/[^\.@a-z|A-Z|0-9]/g,'',);   
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
   
            }else if(type === 'bank_id'){
                stateData[type] = e?.selectedValue;
            }else if(type === 'bank_name_eng'){
                if(engChk.test(e.target.value)){
                    message.warning({ content: '영문만 입력 가능합니다.', key});   
                }else{
                    stateData[type] = e.target.value.replace( /[^a-z|A-Z]/g, '');
                } 
            } else if (type === 'depositor') {
                if(stateData.type === '4' || stateData.type === '5'){
                    if(depositorEngChk.test(e.target.value)){
                        message.warning({ content: '영어, 쉼표(,), 마침표(.)만 입력할 수 있습니다.', key});   
                    }else{
                        stateData[type] = e.target.value.replace( /[^|\s|.,|a-z|A-Z]/g, '');
                    }
                }else{
                    if(stateData.account_type === '2' ){
                        if(nameEngChk.test(e.target.value)){
                            message.warning({ content: '영어, 쉼표(,), 마침표(.)만 입력할 수 있습니다.', key});   
                        }else{
                            stateData[type] = e.target.value.replace( /[^|\s|.,|a-z|A-Z]/g, '');
                        }
                    }else{
                        stateData[type] = e.target.value;
                    }   
                }
            } else if (type === 'swift_code') {
                if(swiftChk.test(e.target.value)){
                    message.warning({ content: 'SWIFT CODE는 영문, 숫자 8~11자리입니다. 정보를 확인해주세요.', key}); 
                    // message.warning({ content: '영문과 숫자만 입력할 수 있습니다.', key});  
                }else{
                    stateData[type] = e.target.value.replace(/[^a-z|A-Z|0-9]/g,'',);   
                } 
                       
            }else if(type === 'account_type'){
                if(e.target.value !== stateData.account_type ){
                    stateData.bank_id=''
                    stateData.bank_name_eng=''
                    stateData.bank=''
                    stateData.depositor=''
                    stateData.swift_code=''
                    stateData.account_no=''
                }
                stateData[type] = e.target.value;
            
            }else if(type === 'account_no'){
                if(accountnoChk.test(e.target.value)){
                    message.warning({ content: '숫자와 일부 특수문자만 입력 가능합니다.', key});   
                }else{
                    stateData[type] = e.target.value.replace(/[^\-0-9]/g, '');
                } 
          
            }else if (type === 'country'){
                if(korChk.test(e.target.value)){
                    message.warning({ content: '한글만 입력 가능합니다.', key});   
                }else{
                    stateData[type] = e.target.value.replace(/[^ㄱ-ㅎ|가-힣]/g, '');
                } 
            }else{           
                stateData[type] = e.target.value;
            }                
        },
        [],
    );

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
                    stateData[type] = e.target.value;
                    state.switchRed= false
                }
            }
        },
        [],
    );

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
    // const addPost = (zipcode, address) => {      
    //     stateData.address = '['+zipcode+'] '+address;        
    // }   
    
    //우편    
    const [postVisible, setPostVisible] = useState(false);
    const postPopup = () => {
        setPostVisible(true);
    };
    const postClose = () => {
        setPostVisible(false);
    };
    //우편번호
    const addPost = (zipcode, address) => {
        stateData.address = '[' + zipcode + '] ' + address;
        state.address = '[' + zipcode + '] ' + address;
        state.addModifyChk = true
    };
      
    //이메일확인
    const handleInputChk = useCallback((type) => (e) => {
        if(type === 'email'){
            const emailRegex =/^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;

            if(e.target.value != ''){
                if(emailRegex.test(e.target.value) == false){
                    message.warning('올바른 이메일 주소를 입력해주세요.');
                    stateData[type] ='';
                } else{
                    stateData[type] = e.target.value;
                }
            } 
        }     
    },[],);

    //파일 업로드
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);

    const props = {
        onRemove: (file) => {
            state.fileChk--
            //삭제된 파일 사용여부 변경
            const index = state.selectedFile.indexOf(file);
            if(state.selectedFile[index].id !== '' && state.selectedFile[index].id !== undefined){
                state.selectedFile[index].use_yn = 'N'
            }
            
            state.delFile = [...state.delFile, state.selectedFile[index]]


            var del = [];
            state.selectedFile.forEach(e => {
                if(e.use_yn !== '' && e.use_yn !== undefined){
                    del = [...del , e]
                }
            });
            setFileList(del); 

            //보여지는 데이터에 삭제된 파일 없애기
            // const newFileList = state.selectedFile.slice();
            
            // newFileList.splice(index, 1); 
            // // state.selectedFile = newFileList;        
            // console.log(toJS(newFileList))   
            // setFileList(newFileList); 
            
            //새파일등록 재배열
            var arr = [];
            state.selectedFile.forEach(e => {
                state.addFile.forEach(a=> {
                    if(e.uid === a.uid){
                        arr = [...arr , a]
                    }
                });
            });
            state.addFile = arr;
        },
        beforeUpload: (file) => {
            state.fileChk++
            //추가된 데이터 넣기
            state.selectedFile = [...state.selectedFile, file];

            //기존 데이터에서 사용여부가 N인것만 빼서 재배열
            var fileDelChk = []
            state.selectedFile.forEach(e => {
                if(e.use_yn !== 'N'){
                    fileDelChk = [...fileDelChk, e]
                }
            });
           
            state.addFile = [...state.addFile, file];
            // setFileList(state.selectedFile)
            //사용여부가 N이 아닌것만 보여지는 데이터에 넣어주기
            setFileList(fileDelChk)
            return false;
        },
        fileList,       
    };

    //파일다운
    const fileReturn = (file) => {
        fileDown(file)
    } 
    const fileDown = useCallback(async (data)=> {    

        var axios = require('axios');                  

        var config={
            method:'POST',
            url:'/author/fileDown',
            responseType: 'blob',
            headers:{
                'Content-Type': 'multipart/form-data',
            },
                data:data
            };
                        
        axios(config)
        .then(function(response){
            const blob = new Blob([response.data]);
            // 특정 타입을 정의해야 경우에는 옵션을 사용해 MIME 유형을 정의 할 수 있습니다.
            // const blob = new Blob([this.content], {type: 'text/plain'})

            // blob을 사용해 객체 URL을 생성합니다.
            const fileObjectUrl = window.URL.createObjectURL(blob);

            // blob 객체 URL을 설정할 링크를 만듭니다.
            const link = document.createElement("a");
            link.href = fileObjectUrl;
            link.style.display = "none";

            // 다운로드 파일 이름을 지정 할 수 있습니다.
            // 일반적으로 서버에서 전달해준 파일 이름은 응답 Header의 Content-Disposition에 설정됩니다.
            link.download = data.name;
            document.body.appendChild(link);
            link.click();
            link.remove();

            // 다운로드가 끝난 리소스(객체 URL)를 해제합니다.
            window.URL.revokeObjectURL(fileObjectUrl);
        })
        .catch(function(error){
            console.log(error.response) 
            Modal.error({
                title: '오류가 발생했습니다. 재시도해주세요.',
                content: '오류코드:'+error.response.status,  
            });
           
        });

    }, []); 
    
    //등록
    const handleSubmit = useCallback(async (e)=> {

        let chkVal = true;

        if(stateData.managers === '' ||  stateData.managers.length  === 0 ){
            Modal.error({
                content: '담당자를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

            
        if(stateData.email === "" ){
            Modal.error({
                content: '이메일을 작성해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(state.dataOld.type !== '3'){
            if(stateData['taxation_type'] === "" && (stateData['type'] === "1" || stateData['type'] === "3")){
                Modal.error({
                    content: '과세 구분을 선택해주세요.',        
                });
                chkVal = false;
                return;   
            }
        }
                
        if(stateData['address'] === ""  ){
            Modal.error({
                content: '법적 주소를 작성해주세요.',        
            });
            chkVal = false;
            return;
        } 

        if((stateData['type'] != '4' && stateData['type'] != '5')&&  (stateData.account_type === '1' && stateData.bank_id === '' )){
            Modal.error({
                content: '계좌정보 은행을 선택해주세요.',
            });
            chkVal = false;
            return;
        }    

        if((stateData['type'] != '4' && stateData['type'] != '5')&& 
        ((stateData.account_type === '2' && stateData.bank_name_eng === ''))){
            Modal.error({
                content: '계좌정보 은행을 작성해주세요.',
            });
            chkVal = false;
            return;
        }    


        if((stateData['type'] === '4' || stateData['type'] === '5') && stateData['bank_name_eng'] === ""){
            Modal.error({
                content: '계좌정보 은행을 작성해주세요.',        
            });
            chkVal = false;
            return;
        }    

        if(stateData.account_type !== '1'){
            if(stateData['swift_code'] === ""){
                Modal.error({
                    content: 'SWIFT CODE를 작성해주세요.',        
                });
                chkVal = false;
                return;
            }  else {
                if (stateData['swift_code'].length < 8) {
                    Modal.error({
                        content: 'SWIFT CODE는 영문, 숫자 8~11자리입니다. 정보를 확인해주세요.',        
                    });
                    chkVal = false;
                    return;
                }
            }
        }

        if(stateData['account_no'] === "" ){
            Modal.error({
                content: '계좌번호를 작성해주세요.',        
            });
            chkVal = false;
            return;
        } 

        if(stateData['depositor'] === "" ){
            Modal.error({
                content: '예금주명을 작성해주세요.',        
            });
            chkVal = false;
            return;
        } 

        if(state.fileChk === 0 && stateData['type'] != "4" && stateData['type'] != "5"){
            Modal.error({
                content: '신분증, 계좌 파일을 추가해주세요.',        
            });
            chkVal = false;
            return;
        }            

        if(chkVal === true){            
            if(state.addFile.length > 0 && stateData['type'] != '4' && stateData['type'] != '5'){
                fileUpload();
            }else{
                if(state.addFile.length > 0 ){
                    fileUpload();
                }else{
                    var arr = [];
                    state.selectedFile.forEach(e => {
                        if(e.file_path !== '' && e.file_path !== undefined){
                            arr = [...arr, {file_path : e.file_path , file_name : e.name, use_yn: e.use_yn, id:e.id}]
                        }                    
                    });

                    stateData.copyright_files = arr;

                    apiSubmit();
                }
            }           
        }       
    }, []);  

    const fileUpload = useCallback(async (e) => {
        const formData = new FormData();
        formData.append('type', state.type);
        state.addFile.forEach((file) => {
            formData.append('files[]', file);
        });
        setUploading(true); 

        var axios = require('axios');

        var config = {
            method: 'POST',
            url: '/author/file_upload',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            data: formData,
        };

        axios(config)
        .then((res) => {        
            if(res.data.length === 0 || (res.data.error !== '' && res.data.error !== undefined)){
                Modal.error({
                    title: '파일 등록시 오류가 발생하였습니다.',
                    content: res.data.error,
                });
            }else{        
                //등록한 파일, 기존에 등록된 파일 데이터 재배치
                res.data.forEach(e => {
                    e.use_yn = 'Y'
                });
                stateData.copyright_files = res.data;
                state.selectedFile.forEach(e => {
                    if(e.file_path !== '' && e.file_path !== undefined){
                        stateData.copyright_files = [...stateData.copyright_files, {file_path : e.file_path , file_name : e.name, use_yn: e.use_yn, id:e.id}]
                    }                    
                });

               
                apiSubmit();
            }   
            
        })
        .catch((error)=> {
            console.log(error);
            Modal.error({
                content: '파일 등록시 오류가 발생하였습니다. 재시도해주세요.',
            });
            
        })
        .finally(() => {
            setUploading(false);
        });
    }, []);

    const fileDel = useCallback(async (e) => {
        var axios = require('axios');

        var config = {
            method: 'POST',
            url: '/author/file_delete',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            data: state.delFile,
        };

        axios(config)
        .then((res) => {
            console.log(res);
            
        })
        .catch(function (error) {
            // message.error('upload failed.');
            console.log('error');
        })
    }, []);

    const apiSubmit = useCallback(async (e) => {
        var axios = require('axios');
        var updata = '';

        if(stateData.type === '1' || stateData.type === '2' || stateData.type === '3'){
            if(stateData.account_type === '1'){
                updata = {
                    taxation_type: stateData.taxation_type,
                    email: stateData.email,
                    phone: stateData.phone,
                    address: stateData.address,
                    account_type: stateData.account_type,
                    bank: stateData.bank,
                    account_no: stateData.account_no,
                    // swift_code: stateData.swift_code,
                    depositor: stateData.depositor,
                    copyright_files: stateData.copyright_files,
                    memo: stateData.memo,
                    bank_id : stateData.bank_id,
                    managers : stateData.managers,
                    use_yn:'Y',
                    id:idx
                }
            }else{
                updata = {
                    taxation_type: stateData.taxation_type,
                    email: stateData.email,
                    phone: stateData.phone,
                    address: stateData.address,
                    account_type: stateData.account_type,
                    bank: stateData.bank,
                    account_no: stateData.account_no,
                    swift_code: stateData.swift_code,
                    depositor: stateData.depositor,
                    copyright_files: stateData.copyright_files,
                    memo: stateData.memo,
                    bank_name_eng : stateData.bank_name_eng,
                    managers : stateData.managers,
                    use_yn:'Y',
                    id:idx
                }
            }
            
        }else{
            updata = {
                country: stateData.country,
                email: stateData.email,
                address: stateData.address,
                account_type: '2',
                bank_name_eng: stateData.bank_name_eng,
                account_no: stateData.account_no,
                swift_code: stateData.swift_code,
                depositor: stateData.depositor,
                copyright_files: stateData.copyright_files,
                memo: stateData.memo,
                tax_rate: stateData.tax_rate,
                managers : stateData.managers,
                use_yn:'Y',
                id:idx
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
                if( state.delFile.length > 0){ //파일삭제할 값이 있으면 삭제
                    //fileDel();
                }   
                Modal.success({
                    title: response.data.result,
                    onOk(){
                        for (const key in stateData) {
                            state.dataOld[key] = stateData[key];
                        }

                        for (const key in DEF_STATE) {
                            stateData[key] = DEF_STATE[key];
                        }

                        state.dataOld.managers = stateData.managers;
                        state.addFile = [];
                        state.delFile = [];
                        state.selectedFile = []

                        viewData(idx,type)
                        // var arr = [];
                        // stateData.copyright_files.forEach(e => {
                        //     if(){
                                
                        //     }
                        //     arr= [ ...arr, {uid: e.uid, name: e.file_name, file_path: e.file_path, url : '#'}]
                        // });
                        // console.log(arr);
                        // setFileList(arr);
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
    }, []);


    return (
        <Wrapper>
            <Row gutter={10} className="table"> 
                <Col xs={6} lg={6} className="label">
                    성명/사업자명 
                </Col>
                <Col xs={18} lg={18}>
                    {stateData.name}
                </Col>
                <Col xs={6} lg={6} className="label">
                    유형
                </Col>
                <Col xs={18} lg={18}>
                    {stateData['type'] === '1'
                        ?   '한국인'
                        : stateData['type'] === '2'
                            ?   '한국 사업자'
                            :   stateData['type'] === '3'
                                ?   '한국 거주 외국인'
                                :   stateData['type'] === '4'
                                    ?   '해외 거주자'
                                    :   '해외 사업자'
                        
                    }                    
                </Col>
                {stateData.type !=='4' && stateData.type !=='5'
                    ? <>
                        <Col xs={6} lg={6} className="label">
                            주민/사업자/외국인번호
                        </Col>
                        <Col xs={18} lg={18}>
                            {   stateData.type === '1' || stateData.type === '3' 
                                    ?  (stateData.person_no !=='' && stateData.person_no !== undefined && stateData.person_no !== null ) && stateData.person_no.substring(0,7)+stateData.person_no.substring(7,8)+'******'
                                    :  stateData.person_no                            
                            }   
                        </Col>
                        {stateData.type !== '2' && 
                            <><Col xs={6} lg={6} className="label">
                                과세 구분  { state.adminChk === true && state.popoutChk !== 'Y'&& <span className="spanStar">*</span> }
                                <Popover content={state.tooltipData[0]}>
                                    <Button shape="circle" icon={<QuestionOutlined style={{fontSize: "11px"}} />} size="small" style={{marginLeft: '5px'}} />
                                </Popover>
                            </Col>
                            <Col xs={18} lg={18}> 
                                
                                {state.adminChk === true && state.popoutChk !== 'Y'                           
                                    ?<>                            
                                        <Radio.Group
                                            name="taxation_type"
                                            value={stateData.taxation_type}
                                            onChange={handleChangeInput('taxation_type')}
                                        >
                                            <Radio value="1">사업소득</Radio>
                                            <Radio value="2">기타소득</Radio>
                                        </Radio.Group>
                                    </>

                                    : stateData.taxation_type ==='1'
                                        ? '사업소득'
                                        : '기타소득'
                                }                       
                                
                            </Col></>
                        }
                    </>

                    :<>
                        <Col xs={6} lg={6} className="label">
                            국적{ state.adminChk === true && state.popoutChk !== 'Y'&& <>(한국어)<span className="spanStar">*</span></> }
                        </Col>
                        <Col xs={18} lg={18}>
                            { state.adminChk === true && state.popoutChk !== 'Y'                                
                                ?   <Input className="tableInput"  type="text" name="country" value={stateData.country} onChange={handleChangeInput('country')}  autoComplete="off"/>   
                                :   stateData.country
                            }                            
                        </Col>

                        <Col xs={6} lg={6} className="label">
                            여권번호, TAX ID 등 
                        </Col>
                        <Col xs={18} lg={18}>
                            {stateData.person_no}
                        </Col>

                        <Col xs={6} lg={6} className="label">
                            원천징수 세율
                        </Col>
                        <Col xs={18} lg={18}>
                            { state.adminChk === true && state.popoutChk !== 'Y'                                
                                ? <><Input className="tableInput" type="text" name="tax_rate" value={stateData.tax_rate} onChange={handleChangeInput('tax_rate')}  autoComplete="off" maxLength={4}/> 
                                    <span style={{marginLeft:'3px'}}>% (정보가 없으면 입력하지 않아도 됩니다.) </span> </>
                                : (stateData.tax_rate !== ''&& stateData.tax_rate !== null && stateData.tax_rate !== undefined) && stateData.tax_rate+'%' 
                            }
                        </Col>
                    </>
                }           

                <Col xs={6} lg={6} className="label">
                    이메일 { state.adminChk === true && state.popoutChk !== 'Y'&& <span className="spanStar">*</span> }
                </Col>
                <Col xs={18} lg={18}>
                    { state.adminChk === true && state.popoutChk !== 'Y'
                        ? <Input className="tableInput" type="text" name="email" value={stateData.email} onChange={handleChangeInput('email')}  onBlur={handleInputChk('email')}   autoComplete="off"/> 
                        : stateData.email
                    }
                </Col>


                {stateData.type !=='4' && stateData.type !=='5' &&
                    <><Col xs={6} lg={6} className="label">
                        전화번호
                    </Col>
                    <Col xs={18} lg={18}>
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
                    </Col></>
                }

                <Col xs={6} lg={6} className="label">
                    법적 주소 {state.adminChk === true && state.popoutChk !== 'Y' 
                                ? stateData.type === '4' || stateData.type === '5'
                                    ? <>(영어) <span className="spanStar">*</span></> 
                                    : <span className="spanStar">*</span> : ''}
                </Col>
                <Col xs={18} lg={18}>
                    {state.adminChk === true && state.popoutChk !== 'Y'
                            ? stateData.type !=='4' && stateData.type !=='5' 
                                ? <>
                                    <div className="postBtn" style={{marinBottom: '10px'}}>
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

                                : <>
                                    <Input
                                        name="address"
                                        placeholder ="주소"
                                        value={stateData['address']}
                                        onChange={handleChangeInput('address')}
                                    />
                                </>
                            
                        :   stateData['address']
                    
                    }
                    
                </Col>

                <Col xs={6} lg={6} className="label">
                    계좌 정보 {state.adminChk === true && state.popoutChk !== 'Y' && <span className="spanStar">*</span>}
                </Col>
                <Col xs={18} lg={18}>
                    {state.adminChk === true && state.popoutChk !== 'Y'
                        ? <>
                            {stateData.type ==='4' || stateData.type ==='5'
                                ?<>
                                    
                                    <Input.Group>
                                        <Row>
                                            {/* <Col span={5} style={{paddingLeft:'0px'}}>
                                                <Input
                                                    name="bank"
                                                    value={stateData.bank.name}
                                                    onChange={handleChangeInput('bank')}
                                                    placeholder="은행명(영어)"
                                                    autoComplete="off"
                                                />  
                                            </Col> */}
                                            <Col span={5} style={{padding: '0 10px 0 0'}}>
                                                <Input
                                                    name="bank_name_eng"
                                                    value={stateData.bank_name_eng}
                                                    onChange={handleChangeInput('bank_name_eng')}
                                                    placeholder="은행명(영어)"
                                                    autoComplete="off"
                                                />  
                                            </Col>
                                            <Col span={5} style={{padding: '0 10px 0 0'}}>
                                                <Input
                                                    name="swift_code"
                                                    value={stateData.swift_code}
                                                    onChange={handleChangeInput(
                                                        'swift_code',
                                                    )}
                                                    onBlur={handleSwiftChk('swift_code')}
                                                    style={state.switchRed === false ? {color: '#262626'} : {color: 'red'}}
                                                    maxLength={11}
                                                    placeholder="SWIFT CODE"
                                                    autoComplete="off"
                                                />
                                            </Col>

                                            <Col span={8} style={{padding: '0 10px 0 0'}}>
                                                <Input
                                                    name="account_no"
                                                    value={stateData.account_no}
                                                    onChange={handleChangeInput(
                                                        'account_no',
                                                    )}
                                                    placeholder="계좌번호 (ex.123-12-123)"
                                                    autoComplete="off"
                                                    maxLength="50"
                                                />
                                            </Col>

                                            <Col span={6} style={{padding: '0 10px 0 0'}}>
                                                <Input
                                                    name="depositor"
                                                    value={stateData.depositor}
                                                    onChange={handleChangeInput(
                                                        'depositor',
                                                    )}
                                                    placeholder="예금주"
                                                    autoComplete="off"
                                                />
                                            </Col>                                    
                                        </Row>
                                    </Input.Group>     
                                </>        

                                : <>
                                    <Radio.Group
                                        name="account_type"
                                        value={stateData.account_type}
                                        onChange={handleChangeInput('account_type')}
                                    >
                                        <Radio value="1">국내 계좌</Radio>
                                        <Radio value="2">해외 계좌</Radio>
                                    </Radio.Group>

                                    {stateData.account_type === '1'
                                        ? <>                                           

                                            <Input.Group>
                                                <Row>
                                                    <Col span={8} style={{padding: '10px 10px 0 0'}}>
                                                        {/* <Select style={(stateData.bank_id === '은행 선택' || stateData.bank_id  === ''  )? {color: '#bfbfbf', width: '100%'} : { width: '100%' }}  placeholder="은행 선택"  value={stateData.bank_id !=='' && stateData.bank_id !== undefined ? stateData.bank_id : '은행 선택'} onChange={handleChangeInput('bank_id')} >
                                                            {state.bankOption.map((e,num) => (
                                                                <Option kye={e.id} value={e.id}>
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
                                                            selectedValue={stateData.bank_id}
                                                            textChanged={handleChangeInput('bank_id')}
                                                            style={(state.bank_id === '은행 선택' || state.bank_id  === ''  )? {color: '#bfbfbf', width: '100%'} : { width: '100%' }}
                                                        />
                                                    </Col>

                                                    <Col span={8} style={{padding: '10px 10px 0 0'}}>
                                                        <Input
                                                            name="account_no"
                                                            value={stateData.account_no}
                                                            onChange={handleChangeInput('account_no')}
                                                            placeholder="계좌번호 (ex.123-12-123)"
                                                            autoComplete="off"
                                                            maxLength="20"
                                                        />
                                                    </Col>

                                                    <Col span={8} style={{padding: '10px 10px 0 0'}}>
                                                        <Input
                                                            name="depositor"
                                                            value={stateData.depositor}
                                                            onChange={handleChangeInput('depositor')}
                                                            placeholder="예금주"
                                                            autoComplete="off"
                                                        />
                                                    </Col>                                    
                                                </Row>
                                            </Input.Group>                                    
                                        </>

                                        : <>
                                            <Input.Group>
                                                <Row>
                                                    <Col span={5} style={{padding: '10px 10px 0 0'}}>
                                                        <Input
                                                            name="bank_name_eng"
                                                            value={stateData.bank_name_eng}
                                                            onChange={handleChangeInput('bank_name_eng')}
                                                            placeholder="은행명(영어)"
                                                            autoComplete="off"
                                                        />  
                                                    </Col>
                                                    <Col span={5} style={{padding: '10px 10px 0 0'}}>
                                                        <Input
                                                            name="swift_code"
                                                            value={stateData.swift_code}
                                                            onChange={handleChangeInput(
                                                                'swift_code',
                                                            )}
                                                            onBlur={handleSwiftChk('swift_code')}
                                                            style={state.switchRed === false ? {color: '#262626'} : {color: 'red'}}
                                                            placeholder="SWIFT CODE"
                                                            maxLength={11}
                                                            autoComplete="off"
                                                        />
                                                    </Col>

                                                    <Col span={8} style={{padding: '10px 10px 0 0'}}>
                                                        <Input
                                                            name="account_no"
                                                            value={stateData.account_no}
                                                            onChange={handleChangeInput(
                                                                'account_no',
                                                            )}
                                                            placeholder="계좌번호 (ex.123-12-123)"
                                                            autoComplete="off"
                                                            maxLength="50"
                                                        />
                                                    </Col>

                                                    <Col span={6} style={{padding: '10px 10px 0 0'}}>
                                                        <Input
                                                            name="depositor"
                                                            value={stateData.depositor}
                                                            onChange={handleChangeInput(
                                                                'depositor',
                                                            )}
                                                            placeholder="예금주"
                                                            autoComplete="off"
                                                        />
                                                    </Col>                                    
                                                </Row>
                                            </Input.Group>     
                                        </>                 
                                    } 
                                </> 
                            }   
                        </>   
                        : stateData.account_type === '1'
                            ? '은행: '+stateData.bank.name+'/ 계좌번호: ' +stateData.account_no+'/ 예금주: '+stateData.depositor

                            : '은행: '+stateData.bank_name_eng+'/ SWIFT CODE: '+stateData.swift_code+'/ 계좌번호: ' +stateData.account_no+'/ 예금주: '+stateData.depositor
                    }
                </Col>


                <Col xs={6} lg={6} className="label">
                    신분증, 계좌 파일 {state.adminChk === true && state.popoutChk !== 'Y'&& stateData.type !== '4' && stateData.type !== '5' && <span className="spanStar">*</span>}
                </Col>
                <Col xs={18} lg={18}>
                    { state.adminChk === true && state.popoutChk !== 'Y'
                        ?   <>
                                <Upload {...props} multiple={true} onPreview={fileReturn}>
                                    <Button className='ant-btn-etc-single' icon={<UploadOutlined />}>파일</Button>
                                </Upload>
                                <span className='accessFile'><ExclamationCircleOutlined/> 업로드 가능 확장자: png, pdf,xlsx | 용량 최대: 20MB</span>
                                {/* <Button onClick={fileDown}>test.png</Button> */}                              
                            </>

                        : <>
                            <Upload {...props} multiple={true} onPreview={fileReturn}>
                                    
                            </Upload>
                            <span className='accessFile'><ExclamationCircleOutlined/> 업로드 가능 확장자: png, pdf,xlsx | 용량 최대: 20MB</span>
                        </>

                    }
                </Col>
                <Col xs={6} lg={6} className="label">
                    등록자
                </Col>
                <Col xs={18} lg={18}>
                    {state.create_info.name}
                </Col>

                <Col xs={6} lg={6} className="label">
                    담당자 {state.adminChk === true && state.popoutChk !== 'Y'&& <span className="spanStar">*</span>}
                </Col>
                <Col xs={18} lg={18}>
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
                <Col xs={6} lg={6} className="label">
                    기타 참고사항
                </Col>
                <Col xs={18} lg={18}>
                     { state.adminChk === true && state.popoutChk !== 'Y'
                        ? <Input.TextArea name="memo" rows={4}  onChange={handleChangeInput('memo')} value={stateData.memo} autoComplete="off"/>
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
                                    {/* <Button type="text" htmlType="button" onClick={reset} style={{marginLeft:'10px'}} danger>
                                        초기화
                                    </Button> */}
                                </>
                                // : state.adminChk === true &&
                                //     <Button type="text" htmlType="button" onClick={reset} style={{marginLeft:'10px'}} danger>
                                //         초기화
                                //     </Button>
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

export default ownersView;