/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {  Space, Button, Row, Col,  Modal, Input,   message, Radio,  Popover, Select, Typography,Upload} from 'antd';
import { ExclamationCircleOutlined, UploadOutlined} from '@ant-design/icons';
import { set, toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';
import ReactDOM from "react-dom";
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
    name_origin: '',
    person_no: '',
    taxation_type: '',
    address: '',
    account_type: '1',
    bank_name: '',
    bank_id: '',
    bank_name_eng: '',
    account_no: '',
    swift_code: '',
    depositor: '',
    upload_files: [],
    memo: '',
    country: '',
    tax_rate: '',
    allow_search_yn: '',
    account_code1:'',
    account_code2:'',
};

const viewList = observer(({idx,popoutCloseVal,popoutChk, drawerChk}) => {
    const { commonStore } = useStore();

    const { Option } = Select;

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 

    const state = useLocalStore(() => ({
        idx: '',
        popoutChk:'',           //팝업체크

        drawerback : '',        //오른쪽 class
        bankOption: [],         //은행리스트

        dataOld : [],           //이전 데이터
        updata:'',              //수정된 데이터
        selectedFile:[],
        oldFile:[],
        delFile:[],
        addFile:[],
        
        adminChk : true,
        accountAdd : false,
        url : '',
        switchRed: false
    }));
    
    useEffect(() => {       
        state.idx= idx;
        state.popoutChk= popoutChk;

        bankData();
        viewData(idx);
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
        setFileList(state.oldFile);
        
    }

    //상세정보
    const viewData = useCallback(async (idx) => {    
        const result = await axios.get(
          process.env.REACT_APP_API_URL +'/api/v1/purchase-accounts/'+idx,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          },
        )
        // if(result.data.data.allow_search_yn === null || result.data.data.allow_search_yn === undefined || result.data.data.allow_search_yn === ''){
        //     result.data.data.allow_search_yn = 'Y'
        // }else{
        //     result.data.data.allow_search_yn =result.data.data.allow_search_yn
        // }

        var data = result.data.data;
        state.dataOld = data;        

        data.files.forEach(e => {
            state.selectedFile = [ ...state.selectedFile, {uid: e.uid, name: e.file_name, file_path: e.file_path, url : '#'}]
            stateData.upload_files = [...stateData.upload_files, {file_name: e.file_name, file_path: e.file_path}]
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
            console.log(result)
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
            var engChk = /[^a-z|A-Z]/g;
            var korChk =/[^ㄱ-ㅎ|가-힣]/g;
            var addressChk =/[^\s|.,|a-z|A-Z|0-9]/g;
            var swiftChk =/[^a-z|A-Z|0-9]/g;
            var accountnoChk =/[^\-0-9]/g;
            var taxrateChk =/[^\.0-9]/g;
            var nameEngChk =/[^a-zA-Z0-9.,\s-]/g;
            var depositorEngChk =/[^|\s|.,|a-z|A-Z|0-9]/g;

            var key = type+'error'

            if(type ==='address'){
                if(nameEngChk.test(e.target.value)){
                    message.warning({ content: '영문과 숫자, 일부 특수문자만 입력 가능합니다.', key});      
                }else{
                    stateData[type] = e.target.value.replace( /[^a-zA-Z0-9.,\s-]/g, '');
                }  
            }else if(type == 'bank_name_eng'){     
                if(engChk.test(e.target.value)){
                    message.warning({ content: '영문만 입력 가능합니다.', key});   
                }else{
                    stateData[type] = e.target.value.replace( /[^a-z|A-Z]/g, '');
                }          
            }else if (type === 'bank_id'){               
                if(stateData.account_type === '1'){
                    stateData[type] = e?.selectedValue;
                }
                // else{
                //     if(etcChk.test(e.target.value)){
                //         message.warning({ content: '영문만 입력 가능합니다.', key});    
                //     }else{
                //         stateData[type] = e.target.value.replace( /[^a-z|A-Z]/g, '');
                //     } 
                // }
            } else if (type === 'swift_code') {
                if(swiftChk.test(e.target.value)){
                    message.warning({ content: 'SWIFT CODE는 영문, 숫자 8~11자리입니다. 정보를 확인해주세요.', key}); 
                }else{
                    stateData[type] = e.target.value.replace(/[^a-z|A-Z|0-9]/g,'',);   
                } 
            }else if(type === 'account_type'){
                stateData[type] =e.target.value;   
                stateData.depositor = ''
                stateData.account_no = ''
                stateData.swift_code = ''
                stateData.bank_name_eng = ''
                stateData.bank_id = ''
            
            } else if (type === 'account_no' ) {
                if(accountnoChk.test(e.target.value)){
                    message.warning({ content: '숫자와 일부 특수문자만 입력 가능합니다.', key});   
                }else{
                    stateData[type] = e.target.value.replace(/[^\-0-9]/g, '');
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
            }else if(type === 'depositor'){
                if ((stateData.type === '4' || stateData.type === '5') && stateData.account_type==='2') {
                    if(depositorEngChk.test(e.target.value)){
                        message.warning({ content: '영어, 숫자, 쉼표(,), 마침표(.)만 입력할 수 있습니다.', key});   
                    }else{
                        stateData[type] = e.target.value.replace( /[^|\s|.,|a-z|A-Z|0-9]/g, '');
                        state.keywordTxt = stateData[type];
                    } 
                } else {
                    stateData[type] = e.target.value;                    
                }   
            } else if (type === 'name') {
                if (stateData.type === '4' || stateData.type === '5') {
                    if(nameEngChk.test(e.target.value)){
                        message.warning({ content: '영문과 숫자, 일부 특수문자만 입력 가능합니다.', key});   
                    }else{
                        stateData[type] = e.target.value.replace( /[^a-zA-Z0-9.,\s-]/g, '');
                        // state.namekeyword = stateData[type];
                        state.keywordTxt = stateData[type];
                    } 
                } else {
                    stateData[type] = e.target.value;                    
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

    //계좌정보 삭제
    const accountDel = ()=>{      
        state.accountAdd = true;
        
        stateData.bank = '';
        stateData.bank_id ='';
        stateData.account_no ='';
        stateData.account_type ='1';
        stateData.depositor ='';
        stateData.swift_code ='';
        stateData.bank_name_eng ='';
        
    }

 
    //파일 업로드
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);

    const props = {
        onRemove: (file) => {
            const index = state.selectedFile.indexOf(file);
            state.delFile = [...state.delFile, state.selectedFile[index]]

            const newFileList = state.selectedFile.slice();
            newFileList.splice(index, 1);
            state.selectedFile = newFileList;           
            setFileList(newFileList);

            console.log(toJS(state.selectedFile));

            //새파일등록 재배열
            var arr = [];
            state.selectedFile.forEach(e => {
                state.addFile.forEach(a=> {
                    if(e.uid === a.uid){
                        console.log(a);
                        arr = [...arr , a]
                    }
                });
            });
            state.addFile = arr;
        },
        beforeUpload: (file) => {
            state.selectedFile = [...state.selectedFile, file];
            state.addFile = [...state.addFile, file];
            setFileList(state.selectedFile)
            return false;
        },
        fileList,       
    };

    //파일다운
    const fileReturn = (file) => {
        console.log(file);
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

        if(stateData['allow_search_yn'] === "" || stateData['allow_search_yn'] === undefined || stateData['allow_search_yn'] === null  ){
            Modal.error({
                content: '사용 여부를 선택해주세요.',        
            });
            chkVal = false;
            return;
        } 

        if(stateData['name'] === ""  ){
            Modal.error({
                content: '성명/사업자명을 작성해주세요.',        
            });
            chkVal = false;
            return;        } 


        if(stateData['taxation_type'] === "" && (stateData.type !== '4' && stateData.type !== '5')){
            Modal.error({
                content: '과세 구분을 선택해주세요.',        
            });
            chkVal = false;
            return;   
        }

        if(stateData['country'] === "" && (stateData.type === '4'  || stateData.type === '5')){
            Modal.error({
                content: '국적을 작성해주세요.',        
            });
            chkVal = false;
            return;
        }
                
        if(stateData['address'] === "" && (stateData.type === '4'  || stateData.type === '5')){
            Modal.error({
                content: '법적 주소를 작성해주세요.',        
            });
            chkVal = false;
            return;
        } 

        if(stateData.type !== '4' && stateData.type !== '5'){
            if(stateData['bank_id'] === "" ){
                Modal.error({
                    content: '계좌정보 은행을 선택해주세요.',        
                });
                chkVal = false;
                return;
            }
        }else{
           if(stateData.account_type === '1'){
                if(stateData['bank_id'] === "" ){
                    Modal.error({
                        content: '계좌정보 은행을 선택해주세요.',        
                    });
                    chkVal = false;
                    return;
                }
           }else{
                if(stateData['bank_name_eng'] === "" ){
                    Modal.error({
                        content: '계좌정보 은행을 선택해주세요.',        
                    });
                    chkVal = false;
                    return;
                } 
                if(stateData['swift_code'] === ""  ){
                    Modal.error({
                        content: 'SWIFT CODE를 작성해주세요.',        
                    });
                    chkVal = false;
                    return;
                }else{
    
                    // if (stateData['swift_code'].length >= 8 && stateData['swift_code'] <= 11) {
                    if (stateData['swift_code'].length < 8) {
                        Modal.error({
                            content: 'SWIFT CODE는 영문, 숫자 8~11자리입니다. 정보를 확인해주세요.',        
                        });
                        chkVal = false;
                        return;
                    }
                }
           } 
        }
        // if(stateData['bank_id'] === "" && (stateData.type !== '4' && stateData.type !== '5')){
        //     Modal.error({
        //         content: '계좌정보 은행을 선택해주세요.',        
        //     });
        //     chkVal = false;
        //     return;
        // }
        // if(stateData['bank_id'] === "" && stateData.account_type === '1' && (stateData.type === '4' || stateData.type === '5')){
        //     Modal.error({
        //         content: '계좌정보 은행을 선택해주세요.',        
        //     });
        //     chkVal = false;
        //     return;
        // }   
       
        
        // if(stateData['bank_name_eng'] === "" && (stateData.type === '4'  || stateData.type === '5')){
        //     Modal.error({
        //         content: '계좌정보 은행을 선택해주세요.',        
        //     });
        //     chkVal = false;
        //     return;
        // } 

        

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

         

        if(chkVal === true){        
            if(state.addFile.length > 0 ){
                fileUpload();
            }else{
                apiSubmit();
            }
        }       
    }, []);  

    const fileUpload = useCallback(async (e) => {
        const formData = new FormData();
        formData.append('uploadFolder', 'account');
        formData.append('topUploadFolder', 'finance');
        state.addFile.forEach((file) => {
            formData.append('files[]', file);
        });
        setUploading(true); 

        var axios = require('axios');

        var config = {
            method: 'POST',
            url: '/common/file_upload',
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
                stateData.upload_files = res.data;
                state.selectedFile.forEach(e => {
                    if(e.file_path !== '' && e.file_path !== undefined){
                        stateData.upload_files = [...stateData.upload_files, {file_path : e.file_path , file_name : e.name}]
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
            updata = {
                allow_search_yn:stateData.allow_search_yn,
                name:stateData.name,
                // person_no:stateData.person_no,
                taxation_type: stateData.taxation_type,
                account_type: stateData.account_type,
                bank_id: stateData.bank_id,
                account_no: stateData.account_no,
                depositor: stateData.depositor,
                upload_files: stateData.upload_files,
                memo: stateData.memo
            }
        }else{
            if(stateData.account_type === '1'){
                updata = {
                    allow_search_yn:stateData.allow_search_yn,
                    name:stateData.name,
                    name_origin:stateData.name_origin,
                    country: stateData.country,
                    tax_rate: stateData.tax_rate,
                    address: stateData.address,
                    account_type: stateData.account_type,
                    bank_id: stateData.bank_id,
                    account_no: stateData.account_no,
                    depositor: stateData.depositor,
                    upload_files: stateData.upload_files,
                    memo: stateData.memo    
                }
            }else{
                updata = {
                    allow_search_yn:stateData.allow_search_yn,
                    name:stateData.name,
                    name_origin:stateData.name_origin,
                    country: stateData.country,
                    tax_rate: stateData.tax_rate,
                    address: stateData.address,
                    account_type: stateData.account_type,
                    bank_name_eng: stateData.bank_name_eng,
                    account_no: stateData.account_no,
                    swift_code: stateData.swift_code,
                    depositor: stateData.depositor,
                    upload_files: stateData.upload_files,
                    memo: stateData.memo    
                }
            }
            
        }
       

        var config={
            method:'PUT',
            url:process.env.REACT_APP_API_URL +'/api/v1/purchase-accounts/'+state.idx,
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
                        state.addFile = [];
                        state.delFile = [];

                        var arr = [];
                        stateData.upload_files.forEach(e => {
                            arr= [ ...arr, {uid: e.uid, name: e.file_name, file_path: e.file_path, url : '#'}]
                        });
                        console.log(arr);
                        setFileList(arr);
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
    

    const accountCodeAdd = useCallback(async (e) => {
        var axios = require('axios');
       
        if(e !== '' && e !== undefined){
            var data = {account_code_target: [e]}
            var config={
                method:'PUT',
                url:process.env.REACT_APP_API_URL +'/api/v1/purchase-account-code/'+state.idx,
                headers:{
                    'Accept':'application/json',
                },
                    data:data
                };
                
            axios(config)
            .then(function(response){
                if(response.data.id !== ''){
                    Modal.success({
                        title: response.data.result,
                        onOk(){
                            if(e === 'G'){
                                stateData.account_code1 = response.data.account_code1
                            }else{
                                stateData.account_code2 = response.data.account_code2
                            }
                        },
                    });
                }else{
                    Modal.error({
                        content:(<div>
                                    <p>문제가 발생하였습니다.</p>
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
                <Col xs={6} lg={6} className="label">
                    사용 여부 {state.adminChk === true && state.popoutChk !== 'Y'&& <span className="spanStar">*</span>}
                </Col>
                <Col xs={18} lg={18}>
                    {state.adminChk === true && state.popoutChk !== 'Y'
                        ?   <>
                            <Radio.Group
                                value={stateData['allow_search_yn']}
                                onChange={handleChangeInput('allow_search_yn')}
                            >
                                <Radio value="Y">사용</Radio>
                                <Radio value="N">숨김</Radio>
                            </Radio.Group>
                        </>
                        : stateData['allow_search_yn'] === 'Y' ? '사용' : '숨김'
                    }                    
                </Col>

                <Col xs={6} lg={6} className="label">
                    거래처 코드(회계) 
                </Col>
                <Col xs={18} lg={18}>
                    {stateData.account_code1 !== '' && stateData.account_code1 !== undefined ? '도서출판 길벗 : '+stateData.account_code1+' / '
                        :   state.adminChk === true && state.popoutChk !== 'Y' &&
                            <>도서출판 길벗 : <Button onClick={(e)=>accountCodeAdd('G')}>생성</Button> / </>
                    }
                    {stateData.account_code2 !== '' && stateData.account_code2 !== undefined ? '길벗스쿨 : '+stateData.account_code2 
                       :   state.adminChk === true && state.popoutChk !== 'Y' &&
                       <>길벗스쿨 : <Button onClick={(e)=>accountCodeAdd('S')}>생성</Button></>
                    }             
                </Col>

                <Col xs={6} lg={6} className="label">
                    유형
                </Col>
                <Col xs={18} lg={18}>
                    {stateData['type'] === '1'
                        ?   '한국인(주민등록번호 보유)'
                        : stateData['type'] === '2'
                            ?   '한국 사업자'
                            :   stateData['type'] === '3'
                                ?   '한국 거주 외국인(외국인등록번호 보유)'
                                :   stateData['type'] === '4'
                                    ?   '해외 거주자'
                                    :   '해외 사업자'
                        
                    }                    
                </Col>

                <Col xs={6} lg={6} className="label">
                    성명/사업자명 
                    {state.adminChk === true && state.popoutChk !== 'Y' 
                        ? stateData.type === '4' || stateData.type === '5'
                            ? <>(영어) <span className="spanStar">*</span></> 
                            : <span className="spanStar">*</span> 
                        : stateData.type === '4' || stateData.type === '5'
                            ? <>(영어)</> 
                            : ''
                    }
                </Col>
                <Col xs={18} lg={18}>
                    { state.adminChk === true && state.popoutChk !== 'Y'
                        ? <Input className="tableInput" type="text" name="name" value={stateData.name} onChange={handleChangeInput('name')} autoComplete="off"/> 
                        : stateData.name
                    }
                </Col>
                
                {stateData.type !=='4' && stateData.type !=='5'
                    ? <>
                        <Col xs={6} lg={6} className="label">
                            주민/사업자/외국인번호
                        </Col>
                        <Col xs={18} lg={18}>
                            {stateData.person_no    }
                        </Col>
                        
                        {stateData.type !== '2' && 
                            <><Col xs={6} lg={6} className="label">
                                과세 구분  { state.adminChk === true && state.popoutChk !== 'Y'&& <span className="spanStar">*</span> }                            
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
                                        <Radio value="5">과세없음</Radio>
                                    </Radio.Group>
                                </>

                                : stateData.taxation_type ==='1'
                                    ? '사업소득' 
                                    : stateData.taxation_type ==='2' 
                                        ? '기타소득'
                                        : '과세없음'
                            }                       
                            
                            </Col></>
                        }
                    </>

                    :<>
                        <Col xs={6} lg={6} className="label">
                            성명/사업자명{ stateData.type === '4' || stateData.type === '5' ? <>(원어)</> : '' }
                        </Col>
                        <Col xs={18} lg={18}>
                            { state.adminChk === true && state.popoutChk !== 'Y'                                
                                ?   <Input className="tableInput"  type="text" name="name_origin" value={stateData.name_origin} onChange={handleChangeInput('name_origin')}  autoComplete="off"/>   
                                :   stateData.name_origin
                            }                            
                        </Col>

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
                            원천징수 세율
                        </Col>
                        <Col xs={18} lg={18}>
                            { state.adminChk === true && state.popoutChk !== 'Y'                                
                                ? <><Input className="tableInput" type="text" name="tax_rate" value={stateData.tax_rate} onChange={handleChangeInput('tax_rate')}  autoComplete="off" /> 
                                    <span style={{marginLeft:'3px'}}>% (정보가 없으면 입력하지 않아도 됩니다.) </span> </>
                                : (stateData.tax_rate !== ''&& stateData.tax_rate !== null && stateData.tax_rate !== undefined) && stateData.tax_rate+'%' 
                            }
                        </Col>

                        <Col xs={6} lg={6} className="label">
                            법적 주소(영어) {state.adminChk === true && state.popoutChk !== 'Y' && <><span className="spanStar">*</span></> }
                        </Col>
                        <Col xs={18} lg={18}>
                            {state.adminChk === true && state.popoutChk !== 'Y'
                                    ? (stateData.type ==='4' || stateData.type ==='5' ) &&
                                        <><Input
                                            name="address"
                                            placeholder ="주소"
                                            value={stateData['address']}
                                            onChange={handleChangeInput('address')}
                                        /></>
                                    
                                :   stateData['address']                            
                            }                            
                        </Col>
                    </>
                }                        
                

                <Col xs={6} lg={6} className="label">
                    계좌 정보 {state.adminChk === true && state.popoutChk !== 'Y' && <span className="spanStar">*</span>}
                </Col>
                <Col xs={18} lg={18}>
                    {state.adminChk === true && state.popoutChk !== 'Y'
                        ? <>
                            {state.accountAdd === false ?

                                stateData.type === '1' || stateData.type === '2' || stateData.type === '3' 
                                ?   <div>{stateData.bank_name} / {stateData.account_no} / {stateData.depositor} <Button shape="circle" className="btn_del" onClick={(e) => accountDel()}>X</Button></div>


                                : stateData.account_type === '1' 
                                    ?   <div>{stateData.bank_name} / {stateData.account_no} / {stateData.depositor} <Button shape="circle" className="btn_del" onClick={(e) => accountDel()}>X</Button></div>

                                    :   <div>{stateData.bank_name_eng} / {stateData.swift_code} / {stateData.account_no} / {stateData.depositor} <Button shape="circle" className="btn_del" onClick={(e) => accountDel()}>X</Button></div>                                   


                            : state.accountAdd === true &&
                                (stateData.type !=='4' && stateData.type !=='5') 
                                    ? <><Input.Group>
                                        <Row>
                                            <Col span={8} style={{padding: '0 10px 0 0'}}>
                            
                                                {/* <Select style={(stateData.bank_id === '은행 선택' || stateData.bank_id === ''  )? {color: '#bfbfbf', width: '100%'} : { width: '100%' }} 
                                                    placeholder="은행 선택"  value={stateData.bank_id === '' ? '은행 선택' : stateData.bank_id}
                                                    onChange={handleChangeInput('bank_id')} >
                                                    {state.bankOption.map((e) => (
                                                        <Option value={e.id}>
                                                            {e.name}
                                                        </Option>
                                                    ))}
                                                </Select> */}
                                                <wjInput.ComboBox
                                                    placeholder="선택"
                                                    itemsSource={new CollectionView(state.bankOption, {
                                                        currentItem: null
                                                    })}
                                                    selectedValuePath="id"
                                                    displayMemberPath="name"
                                                    valueMemberPath="id"
                                                    textChanged={handleChangeInput('bank_id')}
                                                    style={{ width: '100%' }}
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
                                                    maxLength="20"
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
                                    </Input.Group> </>        

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
                                                        {/* <Select style={{ width: '100%' }} placeholder="은행 선택"  value={stateData.bank_id} onChange={handleChangeInput('bank_id')} > */}
                                                        {/* <Select style={(stateData.bank_id === '은행 선택' || stateData.bank_id === ''  )? {color: '#bfbfbf', width: '100%'} : { width: '100%' }} 
                                                            placeholder="은행 선택"  value={stateData.bank_id === '' ? '은행 선택' : stateData.bank_id}
                                                            onChange={handleChangeInput('bank_id')} >
                                                            {state.bankOption.map((e) => (
                                                                <Option value={e.id}>
                                                                    {e.name}
                                                                </Option>
                                                            ))}
                                                        </Select> */}
                                                        <wjInput.ComboBox
                                                            placeholder="선택"
                                                            itemsSource={new CollectionView(state.bankOption, {
                                                                currentItem: null
                                                            })}
                                                            selectedValuePath="id"
                                                            displayMemberPath="name"
                                                            valueMemberPath="id"
                                                            textChanged={handleChangeInput('bank_id')}
                                                            style={{ width: '100%' }}
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
                                                            onChange={handleChangeInput('swift_code')}
                                                            onBlur={handleSwiftChk('swift_code')}
                                                            style={state.switchRed === false ? {color: '#262626'} : {color: 'red'}}
                                                            maxLength={11}
                                                            placeholder="SWIFT CODE"
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
                        : (stateData.type !== '4' && stateData.type !== '5' )
                            ? '은행: '+stateData.bank_name+'/ 계좌번호: ' +stateData.account_no+'/ 예금주: '+stateData.depositor
                            
                            : stateData.account_type === '1'
                                ? '은행: '+stateData.bank_name+'/ 계좌번호: ' +stateData.account_no+'/ 예금주: '+stateData.depositor

                                : '은행: '+stateData.bank_name_eng+'/ SWIFT CODE: '+stateData.swift_code+'/ 계좌번호: ' +stateData.account_no+'/ 예금주: '+stateData.depositor
                                
                    }
                </Col>


                <Col xs={6} lg={6} className="label">
                    파일 
                </Col>
                <Col xs={18} lg={18}>
                    { state.adminChk === true && state.popoutChk !== 'Y'
                        ?   <>
                                <Upload {...props} multiple={true} onPreview={fileReturn}>
                                    <Button icon={<UploadOutlined />}>파일</Button>
                                </Upload>
                                <span className='accessFile'><ExclamationCircleOutlined/> 업로드 가능 확장자: png, pdf,xlsx | 용량 최대: 20MB</span>
                            </>
                        : <>
                            <Upload {...props} multiple={true} onPreview={fileReturn}></Upload>
                            <span className='accessFile'><ExclamationCircleOutlined/> 업로드 가능 확장자: png, pdf,xlsx | 용량 최대: 20MB</span>
                        </>
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
                            <Button type="button" htmlType="button"  onClick={e => popoutClose('Y')} style={{marginLeft:'10px'}}> 닫기</Button>
                        </>

                        : <>
                            <Button type="primary" htmlType="button" onClick={handleSubmit}> 확인</Button>
                            {drawerChk == "Y" && state.adminChk === true && 
                                <Button htmlType="button" onClick={e => popoutClose('Y')} style={{marginLeft:'10px'}}> 취소 </Button>
                            }     
                        </>                    
                    }
                    
                </Col>
            </Row>          

        </Wrapper>
    );
});

export default viewList;