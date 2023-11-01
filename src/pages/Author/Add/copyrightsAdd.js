/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState,useRef } from 'react';
import {
    Space,
    Button,
    Row,
    Col,
    Modal,
    Breadcrumb,
    Input,
    Upload,
    message,
    Radio,
    Popover,
    Select,
    Typography,
} from 'antd';
import {
    PhoneOutlined,
    ExclamationCircleOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';

import * as wjInput from '@grapecity/wijmo.react.input';
import { CollectionView } from '@grapecity/wijmo';
import PopupPostCode from '@components/Common/DaumAddress';
import tooltipData from '@pages/tooltipData';
import ChkDrawer from './chkList';
// import e from 'connect-timeout';
import multer from 'multer';


const Wrapper = styled.div`
    width: 100%;
`;

const DEF_STATE = {
    // DB Data
    type: '1',
    name: '',
    person_no: '',
    taxation_type: '',
    email: '',
    phone: '',
    address: '',
    account_type: '1',
    bank: '',
    bank_id: '',
    bank_name_eng: '',
    account_no: '',
    swift_code: '',
    depositor: '',
    copyright_files: [],
    memo: '',
    country: '', 
    tax_rate: '',
};

const copyDrawer = observer(({ type, onClose, reset, classChk }) => {
    const { commonStore } = useStore();

    const { Text } = Typography;
    const { Option } = Select;
    const { confirm } = Modal;

    const stateData = useLocalStore(() => ({ ...DEF_STATE }));

    const state = useLocalStore(() => ({
        type: '', //api 타입
        bankOption: [], //은행리스트

        companyNoChk: 'N', //사업자번호 확인 체크
        regNoChk: 'N', //국세청 확인 체크
        keywordChk : false, //중복 확인했는지 여부

        chkData: [], //실명 중복 리스트 데이터
        overlapChk: 'N', //실명 중복 확인여부 체크

        address2: '',
        address: '',

        selectedFile: [],
        fileUploadedSuccessfully: false,
        hashFileName: '',
        personkeyword:'',
        namekeyword:'',

        personDelChk : 0,
        tooltipData : '',
        switchRed: false
    }));

    useEffect(() => {
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

        state.type = type;

        bankData();
    }, []);

    const visibleClose = () => {
        //데이터 초기화
        for (const key in DEF_STATE) {
            stateData[key] = DEF_STATE[key];
        }
        state.overlapChk = 'N';
        state.companyNoChk = 'N';
        state.regNoChk = 'N';
        state.chkData = [];
        onClose(false);
    };

    //추가 후 리스트 리셋
    const resetChk = () => {
        reset(true);
    };
   
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

    //drawer class
    const classChkBtn = (val) => {
        if (val === 'drawerback') {
            classChk('Y');
        } else {
            classChk('N');
        }
    };

    //실명 중복리스트
    const [chkVisible, setChkVisible] = useState(false);
    const chkListDrawer = () => {
        if (state.namekeyword != '') {
            classChkBtn('drawerback');
            setChkVisible(true);
        } else {
            Modal.error({
                content:
                    '성명/사업자명을 작성 후 중복확인 버튼을 클릭해주세요.',
            });
        }
    };

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
    };

    //실명 중복체크 리스트 닫기
    const chkOnClose = () => {
        classChkBtn();
        setChkVisible(false);
    };

    //실명 중복체크에 대한 확인
    const overlapChk = (data) => {
        if(data === 'Y'){
            state.overlapChk = 'Y';
        }else{
            state.overlapChk = 'N';
        }
        
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
            var depositorEngChk =/[^|\s|.,|a-z|A-Z|0-9]/g;
            var accountnoChk =/[^\-0-9]/g;
            var taxrateChk =/[^\.0-9]/g;
            var nameEngChk =/[^a-zA-Z0-9.,\s-]/g;
            // var nameEngChk =/[^\s|.,|a-z|A-Z]/g;
            var addressChk =/[^\s|.,|a-z|A-Z|0-9]/g;

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
            } else if (type === 'person_no') {
                if (stateData.type !== '4' && stateData.type !== '5') {
                    var person_no = e.target.value.replace(/[^0-9]/g, '');
                    var tmp = '';

                    if (stateData.type === '1' || stateData.type === '3') {
                        if (person_no.length < 7) {
                            tmp = person_no;
                        } else {
                            tmp =
                                person_no.substr(0, 6) +
                                '-' +
                                person_no.substr(6, 13);
                        }
                    } else if (stateData.type === '2') {
                        if (person_no.length < 4) {
                            tmp = person_no;
                        } else if (person_no.length < 6) {
                            tmp =
                                person_no.substr(0, 3) +
                                '-' +
                                person_no.substr(3, 2);
                        } else {
                            tmp =
                                person_no.substr(0, 3) +
                                '-' +
                                person_no.substr(3, 2) +
                                '-' +
                                person_no.substr(5, 12);
                        }
                    }

                    if(tmp !== ''){
                        state.personkeyword = tmp;
                    }
                    stateData[type] = tmp;
                    if(tmp === ''){
                        state.personDelChk++
                    }else{
                        state.personDelChk=0;
                    }
                    
                } else {
                    stateData[type] = e.target.value;
                    if(tmp !== ''){
                        state.personkeyword = e.target.value;
                    }
                }
            }else if(type === 'email'){       
                if(emailChk.test(e.target.value)){
                    message.warning({ content: '영문과 특수문자만 입력할 수 있습니다.', key});       
                }else{
                    stateData[type] = e.target.value.replace(/[^\.@a-z|A-Z|0-9]/g,'',);   
                }          
                            
            } else if (type === 'address2') {
                state.address2 = e.target.value;
            } else if (type === 'address') {
                if(addressChk.test(e.target.value)){
                    message.warning({ content: '영문과 숫자, 일부 특수문자만 입력 가능합니다.', key});      
                }else{
                    stateData[type] = e.target.value.replace(  /[^\s|.,|a-z|A-Z|0-9]/g, '');
                }
            } else if (type === 'bank_id') {
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
                        message.warning({ content: '영어, 숫자, 쉼표(,), 마침표(.)만 입력할 수 있습니다.', key});   
                    }else{
                        stateData[type] = e.target.value.replace( /[^|\s|.,|a-z|A-Z|0-9]/g, '');
                    }
                }else{
                    if(stateData.account_type === '2' ){
                        if(depositorEngChk.test(e.target.value)){
                            message.warning({ content: '영어, 숫자, 쉼표(,), 마침표(.)만 입력할 수 있습니다.', key});   
                        }else{
                            stateData[type] = e.target.value.replace( /[^|\s|.,|a-z|A-Z|0-9]/g, '');
                        }
                    }else{
                        stateData[type] = e.target.value;
                    }   
                }
                           
            } else if (type === 'account_type') {
                
                if(e.target.value !== stateData.account_type ){
                    stateData.bank_id=''
                    stateData.bank_name_eng=''
                    stateData.bank=''
                    stateData.depositor=''
                    stateData.swift_code=''
                    stateData.account_no=''
                }
                stateData[type] = e.target.value;
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
                    // tax_rate = tax_rate.replace('.', '');
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
            } else if (type === 'name') {
                if (stateData.type === '4' || stateData.type === '5') {
                    if(nameEngChk.test(e.target.value)){
                        message.warning({ content: '영문과 일부 특수문자만 입력 가능합니다.', key});   
                    }else{
                        stateData[type] = e.target.value.replace( /[^a-zA-Z0-9.,\s-]/g, '');
                        state.namekeyword = stateData[type];
                    } 
                } else {
                    stateData[type] = e.target.value;                    
                }
                
            } else if (type === 'country') {
                if(korChk.test(e.target.value)){
                    message.warning({ content: '한글만 입력 가능합니다.', key});   
                }else{
                    stateData[type] = e.target.value.replace(/[^ㄱ-ㅎ|가-힣]/g, '');
                } 

            } else if (type === 'swift_code') {
                if(swiftChk.test(e.target.value)){
                    message.warning({ content: 'SWIFT CODE는 영문, 숫자 8~11자리입니다. 정보를 확인해주세요.', key}); 
                    // message.warning({ content: '영문과 숫자만 입력할 수 있습니다.', key});  
                }else{
                    stateData[type] = e.target.value.replace(/[^a-z|A-Z|0-9]/g,'',);   
                } 
            } else {
                if (stateData.type !== e.target.value && type === 'type') {
                    var chk = 0;
                    for (const key in DEF_STATE) {                        
                        if(key !== 'account_type' && key !== 'type'){
                            if(key !== 'copyright_files'){
                                if(stateData[key] !== '' && stateData[key] !== undefined){
                                    chk++
                                }
                            }else if(key === 'copyright_files'){
                                if(stateData['copyright_files'].length > 0 ){
                                    chk++
                                }
                            }                            
                        }                        
                    }

                    if(chk > 0){
                        confirm({
                            title: '저작권자 유형을 변경하면 입력된 정보가 초기화 됩니다. ',
                            content: '변경하시겠습니까?',
                            onOk() {
                                stateData[type] = e.target.value;
                                
                                state.keywordTxt = '';
                                state.regNoChk = 'N';
                                state.companyNoChk = 'N';
                                state.overlapChk = 'N';
                                state.chkData = [];
                                
                                //초기화
                                stateData.person_no = '';
                                stateData.name= '';
                                stateData.taxation_type= '';
                                stateData.email= '';
                                stateData.phone= '';
                                stateData.address= '';
                                stateData.account_type= '1';
                                stateData.bank= '';
                                stateData.bank_id= '';
                                stateData.bank_name_eng= '';
                                stateData.account_no= '';
                                stateData.swift_code= '';
                                stateData.depositor= '';
                                stateData.memo= '';
                                stateData.country= ''; 
                                stateData.tax_rate= '';
                                stateData.copyright_files= [];
                            },
                            onCancel() {
                                stateData[type] = stateData.type;
                            },
                        });
                    } else{
                        stateData[type] = e.target.value;
                    }               
                    
                }else{
                    stateData[type] = e.target.value;
                }
                
            }
        },
        [],
    );

    const handleChange = useCallback(
        (type) => (e) => {
            if (type === 'address2') {
                if(e.target.value === '' || e.target.value === undefined){
                    stateData.address = state.address;
                }else{
                    stateData.address = state.address+ ', ' + e.target.value;
                }
                
            }
        },
        [],
    );

    //중복체크
    const fetchData = useCallback(async (type) => {
        var url = ''
        if (state.namekeyword !== '' && state.namekeyword !== undefined) {
            url = process.env.REACT_APP_API_URL +'/api/v1/' +state.type +'?display=10&page=1&sort_by=date&order=desc&keyword=' + state.namekeyword;
        } 
        if(state.personkeyword !== '' && state.personkeyword !== undefined) {
            url = process.env.REACT_APP_API_URL +'/api/v1/' +state.type +'?display=10&page=1&sort_by=date&order=desc&person_no=' + state.personkeyword;
        }

        if (url !== '' && url !== undefined) {
            var axios = require('axios');

            var config = {
                method: 'GET',
                url:url,
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
                            stateData['person_no'] = '';
                            state.personkeyword = '';
                            state.namekeyword = '';
                        },
                    });
                } else {
                    if (result.data.data.length > 0) {                            
                        if (state.namekeyword !== '' && state.namekeyword !== undefined) {
                            state.chkData = result.data.data;
                            state.namekeyword = '';
                        } else {
                            Modal.warning({
                                title: '같은 번호의 저작권자가 있어서 등록할 수 없습니다.',
                                content: '중복 여부 확인 후 진행해 주세요.',
                                onOk() {
                                    stateData['person_no'] = '';
                                    state.personkeyword = '';
                                    state.keywordChk = false;
                                },
                            });
                        }
                    } else {
                        if (stateData.type === '2') {
                            state.companyNoChk = 'Y';
                            regNoChk('companyNoChk');
                            // state.keywordChk = true;
                        }
                        
                    }
                    
                }
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
    }, []);

    
    //국세청
    const regNoChk = useCallback(async (val) => {
        if ((stateData['person_no'] === '' || stateData['person_no'] === undefined ) && state.personDelChk === 0) {
            Modal.error({
                content: '사업자번호를 등록 후 클릭해주세요.',
            });
        } else {

            if(stateData['person_no'] !== '' && stateData['person_no'] !== undefined && state.personDelChk === 0){

                commonStore.handleApi({
                    url : '/check-bizInfo', 
                    data : {
                        company     : 1, 
                        corp_num    : stateData['person_no'].replace(/-/g, '')
                    },
                    afterAjaxErrorFunction : (error) => {
                        console.log(error)
                        error && error.BizInfo &&
                        !error.BizInfo.companyRegNum ? 
                            Modal.warning({
                                title: (
                                    <div>
                                        등록되지 않은 사업자입니다.
                                    </div>
                                ),
                            })
                        :
                        Modal.error({
                            title: '오류가 발생했습니다. 재시도해주세요.',
                            content: '오류코드:' + error.message,
                        })
                        stateData['person_no'] = '';
                        state.personkeyword = '';
                        state.keywordTxt = '';
                    }
                }).then((result) => {
                    result && result.BizInfo &&
                    !result.BizInfo.companyRegNum ? 
                        Modal.warning({
                            title: (
                                <div>
                                    등록되지 않은 사업자입니다.
                                </div>
                            ),
                        })
                    :
                        Modal.success({
                            title: '국세청 확인이 완료되었습니다.',
                            onOk() {
                                state.regNoChk = 'Y';
                            },
                        })
                    
                    state.personDelChk = 0;
                    
                })
                // var axios = require('axios');

                // var config = {
                //     method: 'GET',
                //     url:process.env.REACT_APP_API_URL +'/api/v1/check-corpnum?corp_num='+stateData['person_no'],
                //     headers: {
                //         Accept: 'application/json',
                //     },
                // };

                // axios(config)
                // .then(function (result) {
                //     if (result.data.result === null ||  result.data.result === '0' ||  result.data.result === '1' ||  result.data.result === '2' ||  result.data.result === '3') {
                //         Modal.warning({
                //             title: (
                //                 <div>
                //                     이 사업자는 현재 휴업 또는 폐업 상태로
                //                     <br />
                //                     등록할 수 없습니다.
                //                 </div>
                //             ),
                //         });
                //     } else {
                //         Modal.success({
                //             title: '국세청 확인이 완료되었습니다.',
                //             onOk() {
                //                 state.regNoChk = 'Y';
                //                 // if (result.data.result.taxType == '20') {
                //                 //     stateData.taxation_type = '3';
                //                 // } else {
                //                 //     stateData.taxation_type = '4';
                //                 // }
                //             },
                //         });
                //     }
                //     state.personDelChk = 0;
                // })
                // .catch(function (error) {
                //     console.log(error.response);
                //     Modal.error({
                //         title: '오류가 발생했습니다. 재시도해주세요.',
                //         content: '오류코드:' + error.response.status,
                //         onOk() {
                //             stateData['person_no'] = '';
                //             state.personkeyword = '';
                //             state.keywordTxt = '';
                //         },
                //     });
                // });          
    
                
            }
        }
    }, []);

    // const regNoChkOld = useCallback(async (val) => {
    //     console.log(state.personDelChk)
    //     if ((stateData['person_no'] === '' || stateData['person_no'] === undefined ) && state.personDelChk === 0) {
    //         Modal.error({
    //             content: '사업자번호를 등록 후 클릭해주세요.',
    //         });
    //     } else {
    //         // if(val === ''){
    //         //     fetchData();
    //         // }else{
    //             if(stateData['person_no'] !== '' && stateData['person_no'] !== undefined && state.personDelChk === 0){

    //                 commonStore.loading = true;
    //                 const result = await commonStore.handleApi({
    //                     method: 'POST',
    //                     url: 'author/api_regno',
    //                     data: {
    //                         reg_no: stateData['person_no'],
    //                     },
    //                 });
        
    //                 if (result.data) {
    //                     if (
    //                         result.data[0].b_stt_cd == '02' ||
    //                         result.data[0].b_stt_cd == '03'
    //                     ) {
    //                         Modal.warning({
    //                             title: (
    //                                 <div>
    //                                     이 사업자는 현재 휴업 또는 폐업 상태로
    //                                     <br />
    //                                     등록할 수 없습니다.
    //                                 </div>
    //                             ),
    //                         });
    //                     } else {
    //                         if (result.data[0].b_no == '') {
    //                             Modal.error({
    //                                 content: result.data[0].tax_type,
    //                             });
    //                         } else {
    //                             if (result.data[0].b_stt_cd == '') {
    //                                 Modal.error({
    //                                     content: result.data[0].tax_type,
    //                                 });
    //                             } else {
    //                                 Modal.success({
    //                                     title: '국세청 확인이 완료되었습니다.',
    //                                     onOk() {
    //                                         state.regNoChk = 'Y';
    //                                         if (result.data[0].tax_type_cd == '04') {
    //                                             stateData.taxation_type = '3';
    //                                         } else {
    //                                             stateData.taxation_type = '4';
    //                                         }
    //                                     },
    //                                 });
    //                             }
    //                         }
    //                     }
    //                     state.personDelChk = 0;
    //                 } else {
    //                     Modal.error({
    //                         title: '오류가 발생했습니다.',
    //                         content: result.status_code,
    //                     });
    //                 }
    //                 commonStore.loading = false;
    //             }
    //         // }        
    //     }
    // }, []);

    //이메일확인
    const handleEmailChk = useCallback(
        (type) => (e) => {
            const emailRegex =
                /^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;

            if (e.target.value != '') {
                if (emailRegex.test(e.target.value) == false) {
                    message.warning('올바른 이메일 주소를 입력해주세요.');
                    stateData[type] = '';
                } else {
                    stateData[type] = e.target.value;
                }
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


    //파일 업로드
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);   

    const props = {
        onRemove: (file) => {
            const index = state.selectedFile.indexOf(file);
            const newFileList = state.selectedFile.slice();
            newFileList.splice(index, 1);
            state.selectedFile = newFileList;
            setFileList(state.selectedFile);
        },
        beforeUpload: (file) => {
            state.selectedFile = [...state.selectedFile, file];
            setFileList(state.selectedFile)
            return false;
        },
        fileList,
    };
   
    

    //등록
    const handleSubmit = useCallback(async (e) => {       
        let chkVal = true;

        if (stateData['type'] == '') {
            Modal.error({
                content: '유형을 선택해주세요.',
            });
            chkVal = false;
            return;
        }
console.log(state.overlapChk)
        if (stateData['name'] == '') {
            state.overlapChk = 'N';
            Modal.error({
                content: '성명/사업자명을 작성해주세요.',
            });
            chkVal = false;
            return;
        }else {
            console.log(state.overlapChk)
            if((stateData['type'] === '4' || stateData['type'] === '5') && state.overlapChk === 'N'){
                Modal.error({
                    content: '성명/사업자명 중복확인을 해주세요.',
                });
                chkVal = false;
                return;
            }
        }

        if (stateData['email'] == '') {
            Modal.error({
                content: '이메일을 작성해주세요.',
            });
            chkVal = false;
            return;
        }

        if (stateData['address'] === '') {
            Modal.error({
                content: '법적 주소를 작성해주세요.',
            });
            chkVal = false;
            return;
        }

        if (stateData['type'] != '4' && stateData['type'] != '5') {
            if (stateData['person_no'] == '') {
                Modal.error({
                    content: '주민/사업자/외국인번호를 작성해주세요.',
                });
                chkVal = false;
                return;
            }else{
                console.log(stateData['person_no'].length)
                if (stateData['person_no'].length < 14 && stateData['type'] !== '2') {
                    Modal.error({
                        content: '주민/사업자/외국인번호의 입력한 정보를 확인해주세요.',
                    });
                    chkVal = false;
                    return;
                } 
            }
            if (stateData['type'] !== '2') {
                if (stateData['taxation_type'] == '') {
                    Modal.error({
                        content: '과세 구분을 선택해주세요.',
                    });
                    chkVal = false;
                    return;
                }
            } else {
                if (state.regNoChk === 'N') {
                    Modal.error({
                        content: '국세청 확인을 해주세요.',
                    });
                    chkVal = false;
                    return;
                }
            }
            if(stateData.account_type === '1' && stateData.bank_id === '' ){
                Modal.error({
                    content: '계좌정보 은행을 선택해주세요.',
                });
                chkVal = false;
                return;
            }   
            
            if( stateData.account_type === '2' && stateData.bank_name_eng === ''){
                Modal.error({
                    content: '계좌정보 은행을 작성해주세요.',
                });
                chkVal = false;
                return;
            } 

            if (stateData['account_no'] === '') {
                Modal.error({
                    content: '계좌번호를 작성해주세요.',
                });
                chkVal = false;
                return;
            }

            if (stateData['depositor'] === '') {
                Modal.error({
                    content: '예금주명을 작성해주세요.',
                });
                chkVal = false;
                return;
            }

            if (state.selectedFile.length === 0) {
                Modal.error({
                    content: '신분증, 계좌 파일을 추가해주세요.',
                });
                chkVal = false;
                return;
            }
            
        } else {            
            if (stateData['person_no'] == '') {
                Modal.error({
                    content: '여권번호, TAX ID을 작성해주세요.',
                });
                chkVal = false;
                return;
            }

            if (stateData['bank_name_eng'] === '') {
                Modal.error({
                    content: '계좌정보 은행을 작성해주세요.',
                });
                chkVal = false;
                return;
            }

            if (stateData['swift_code'] === '') {
                Modal.error({
                    content: 'SWIFT CODE를 작성해주세요.',
                });
                chkVal = false;
                return;
            } else{    
                if (stateData['swift_code'].length < 8) {
                    Modal.error({
                        content: 'SWIFT CODE는 영문, 숫자 8~11자리입니다. 정보를 확인해주세요.',        
                    });
                    chkVal = false;
                    return;
                }
            }

            if (stateData['account_no'] === '') {
                Modal.error({
                    content: '계좌번호를 작성해주세요.',
                });
                chkVal = false;
                return;
            }

            if (stateData['depositor'] === '') {
                Modal.error({
                    content: '예금주명을 작성해주세요.',
                });
                chkVal = false;
                return;
            }
        }
        
        if (chkVal == true) {

            if(state.selectedFile.length > 0 && stateData['type'] != '4' && stateData['type'] != '5'){
                fileUpload();
            }else{
                if(state.selectedFile.length > 0 ){
                    fileUpload();
                }else{
                    apiSubmit();
                }
            }            
        }
        
    }, []);

    const fileUpload = useCallback(async (e) => {
        const formData = new FormData();
            formData.append('type', state.type);
            // fileList.forEach((file) => {
            state.selectedFile.forEach((file) => {
                formData.append('files[]', file);
            });
            setUploading(true); // You can use any AJAX library you like

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
                res.data.forEach(e => {
                    e.use_yn = 'Y'
                });
                stateData.copyright_files = res.data;    
                if(res.data.length === 0 || (res.data.error !== '' && res.data.error !== undefined)){
                    Modal.error({
                        title: '파일 등록시 오류가 발생하였습니다.',
                        content: res.data.error,
                    });
                }else{
                    apiSubmit();
                }   
               
            })
            .catch(function (error) {
                // message.error('upload failed.');
                console.log(error);
                Modal.error({
                    content: '파일 등록시 오류가 발생하였습니다. 재시도해주세요.',
                });
            })
            .finally(() => {
                setUploading(false);
            });
    }, []);

    const apiSubmit = useCallback(async (e) => {
        var axios = require('axios');
    
        var data = '';

        if(stateData.type === '1' || stateData.type === '2' || stateData.type === '3'){           
            if(stateData.account_type === '1'){
                data = {
                    type:stateData.type,
                    name:stateData.name,
                    person_no:stateData.person_no,
                    taxation_type: stateData.taxation_type,
                    email: stateData.email,
                    phone: stateData.phone,
                    address: stateData.address,
                    account_type: stateData.account_type,
                    account_no: stateData.account_no,
                    depositor: stateData.depositor,
                    swift_code: stateData.swift_code,
                    copyright_files: stateData.copyright_files,
                    // copyright_files: JSON.stringify(stateData.copyright_files),
                    bank_id : stateData.bank_id,
                    memo: stateData.memo,
                    use_yn:'Y'
                }
            }else{
                data = {
                    type:stateData.type,
                    name:stateData.name,
                    person_no:stateData.person_no,
                    taxation_type: stateData.taxation_type,
                    email: stateData.email,
                    phone: stateData.phone,
                    address: stateData.address,
                    account_type: stateData.account_type,
                    account_no: stateData.account_no,
                    depositor: stateData.depositor,
                    swift_code: stateData.swift_code,
                    copyright_files: stateData.copyright_files,
                    // copyright_files: JSON.stringify(stateData.copyright_files),
                    bank_name_eng : stateData.bank_name_eng,
                    memo: stateData.memo,
                    use_yn:'Y'
                }
            }            
        }else{
            data = {
                type:stateData.type,
                name:stateData.name,
                country: stateData.country,
                person_no:stateData.person_no,
                tax_rate: stateData.tax_rate,
                email: stateData.email,
                address: stateData.address,
                account_type: '2',
                // bank: stateData.bank,
                bank_name_eng: stateData.bank_name_eng,
                account_no: stateData.account_no,
                swift_code: stateData.swift_code,
                depositor: stateData.depositor,
                copyright_files: stateData.copyright_files,
                memo: stateData.memo        ,
                use_yn:'Y'            
            }
        }
        // console.log(toJS(data))
        // return

        var config = {
            method: 'POST',
            url: process.env.REACT_APP_API_URL +'/api/v1/' + state.type,
            headers: {
                Accept: 'application/json',
            },
            data: data,
        };

        axios(config)
        .then(function (response) {
            console.log(response);
            if (response.data.success != false) {
                Modal.success({
                    title: response.data.result,
                    onOk() {
                        resetChk();
                        visibleClose();
                    },
                });
            } else {
                Modal.error({
                    content: (
                        <div>
                            <p>등록시 문제가 발생하였습니다.</p>
                            <p>재시도해주세요.</p>
                            <p>오류코드: {response.data.error}</p>
                        </div>
                    ),
                });
            }
        })
        .catch(function (error) {
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
                <Col xs={24} lg={5} className="label">
                    성명/사업자명{' '}
                    {(stateData.type === '4' || stateData.type === '5') &&
                        '(영어)'}{' '}
                    <span className="spanStar">*</span>
                </Col>

                <Col xs={24} lg={19}>
                    {stateData.type === '4' || stateData.type === '5' ? (
                        <>
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
                                        >
                                            중복 확인(필수)
                                        </Button>
                                    </Col>
                                </Row>
                            </Input.Group>
                        </>
                    ) : (
                        <>
                            <Input
                                className="tableInput"
                                type="text"
                                name="name"
                                value={stateData.name}
                                onChange={handleChangeInput('name')}
                                autoComplete="off"
                            />
                        </>
                    )}
                </Col>
                <Col xs={24} lg={5} className="label">
                    유형 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={19}>
                    <Radio.Group
                        value={stateData['type']}
                        onChange={handleChangeInput('type')}
                    >
                        <Radio value="1">한국인(주민등록번호 보유)</Radio>
                        <Radio value="2">한국 사업자</Radio>
                        <Radio value="3">
                            한국 거주 외국인(외국인등록번호 보유)
                        </Radio>
                        <Radio value="4">해외 거주자</Radio>
                        <Radio value="5">해외 사업자</Radio>
                    </Radio.Group>
                </Col>

                {stateData.type !== '4' && stateData.type !== '5' ? (
                    <>
                        <Col xs={24} lg={5} className="label">
                            주민/사업자/외국인번호 <span className="spanStar">*</span>
                        </Col>
                        <Col xs={24} lg={19}>
                            
                            {stateData.type === '2'  
                                ? <> 
                                    <Input.Group>
                                        <Row>
                                            <Col span={5} style={{padding: '0 10px 0 0'}}>
                                                <Input
                                                    type="tel"
                                                    name="person_no"
                                                    maxLength="14"
                                                    value={stateData.person_no}
                                                    onChange={handleChangeInput(
                                                        'person_no',
                                                    )}
                                                    onBlur={fetchData}
                                                    autoComplete="off"
                                                />  
                                            </Col>
                                            <Col span={5} style={{padding: '0 10px 0 0'}}>
                                                <Input type="hidden" id="regNoChk" name="regNoChk" value={state.regNoChk} />    
                                                {/* <Button type="primary" className="btn_inner" style={{ width: '143px' }} onClick={regNoChk} > */}
                                                {/* <Button type="primary" className="btn_inner" style={{ width: '143px' }} onClick={fetchData} > */}
                                                <Button type="primary" className="btn_inner" style={{ width: '143px' }} onClick={(e)=>state.keywordChk === true ?regNoChk() : ''} >
                                                    국세청 확인(필수)
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Input.Group>     
                                    </>                                     
                                : 
                                    <Input
                                        className="tableInput"
                                        type="tel"
                                        name="person_no"
                                        maxLength="14"
                                        value={stateData.person_no}
                                        onChange={handleChangeInput(
                                            'person_no',
                                        )}
                                        onBlur={fetchData}
                                        autoComplete="off"                                               
                                    />
                            }                                 
                        </Col>
                        {stateData.type !== '2' &&
                            <><Col xs={24} lg={5} className="label">
                                과세 구분 <span className="spanStar">*</span>
                                {/* <Popover content={tooltipText}> */}
                                <Popover content={state.tooltipData[0]}>
                                    <Button
                                        shape="circle"
                                        size="small" 
                                        className="btn_popover"
                                        style={{ marginLeft: '5px' }}
                                    >?</Button>
                                </Popover>
                            </Col>
                            <Col xs={24} lg={19}>
                                <Radio.Group
                                    name="taxation_type"
                                    value={stateData.taxation_type}
                                    onChange={handleChangeInput(
                                        'taxation_type',
                                    )}
                                >
                                    <Radio value="1">사업소득</Radio>
                                    <Radio value="2">기타소득</Radio>
                                </Radio.Group>
                            </Col></>
                        }
                    </>
                ) : (
                    <>
                        <Col xs={24} lg={5} className="label">
                            국적(한국어) <span className="spanStar">*</span>
                        </Col>
                        <Col xs={24} lg={19}>
                            <Input
                                className="tableInput"
                                type="text"
                                name="country"
                                value={stateData.country}
                                onChange={handleChangeInput('country')}
                                autoComplete="off"
                            />
                        </Col>

                        <Col xs={24} lg={5} className="label">
                            여권번호, TAX ID 등 <span className="spanStar">*</span>
                            <Popover content={state.tooltipData[1]}>
                            <Button
                                    shape="circle"
                                    size="small"
                                    className="btn_popover"
                                    style={{ marginLeft: '5px' }}
                                >?</Button>
                            </Popover>
                        </Col>
                        <Col xs={24} lg={19}>
                            <Input
                                className="tableInput"
                                type="text"
                                name="person_no"
                                value={stateData.person_no}
                                onChange={handleChangeInput('person_no')}
                                autoComplete="off"
                            />
                        </Col>

                        <Col xs={24} lg={5} className="label">
                            원천징수 세율
                        </Col>
                        <Col xs={24} lg={19}>
                            <Input className="tableInput" type="text" name="tax_rate" value={stateData.tax_rate} onChange={handleChangeInput('tax_rate')}  autoComplete="off" maxLength={4}/> 
                            <span style={{marginLeft:'3px'}}>% (정보가 없으면 입력하지 않아도 됩니다.) </span>
                        </Col>
                    </>
                )}

                <Col xs={24} lg={5} className="label">
                    이메일 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={19}>
                    <Input
                        className="tableInput"
                        type="text"
                        name="email"
                        value={stateData.email}
                        onChange={handleChangeInput('email')}
                        onBlur={handleEmailChk('email')}
                        autoComplete="off"
                    />
                </Col>

                {stateData.type !== '4' && stateData.type !== '5' && (
                    <>
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
                                prefix={
                                    <PhoneOutlined className="site-form-item-icon" />
                                }
                                onChange={handleChangeInput('phone')}
                                autoComplete="off"
                            />
                        </Col>{' '}
                    </>
                )}

                <Col xs={24} lg={5} className="label">
                    법적 주소{' '}
                    {(stateData.type === '4' || stateData.type === '5') &&
                        '(영어)'}{' '}
                    <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={19}>
                    {stateData.type !== '4' && stateData.type !== '5' ? (
                        <>
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
                            {stateData.address}

                            {stateData.address && (
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
                    ) : (
                        <>
                            <Input
                                name="address"
                                placeholder="주소"
                                value={stateData['address']}
                                onChange={handleChangeInput('address')}
                                autoComplete="off"
                            />
                        </>
                    )}
                </Col>

                <Col xs={24} lg={5} className="label">
                    계좌 정보 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={19}>
                    {stateData.type === '4' || stateData.type === '5'
                        ? <>                            
                            <Input.Group>
                                <Row>
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
                                                'swift_code'
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
                                                'account_no'
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
                                                'depositor'
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

                            {stateData.account_type === '1' ? (
                                <>
                                    <Input.Group>
                                        <Row>
                                            <Col span={8} style={{padding: '10px 10px 0 0'}}>
                                                {/* <Select
                                                    placeholder="은행 선택"
                                                    onChange={handleChangeInput('bank_id')}
                                                    style={(stateData.bank_id === '은행 선택' || stateData.bank_id  === ''  )? {color: '#bfbfbf', width: '100%'} : { width: '100%' }} 
                                                    value={state.bank_id !=='' && state.bank_id !== undefined ? state.bank_id : '은행 선택'} 

                                                >
                                                    {state.bankOption.map((e) => (
                                                        <Option key={e.id} value={e.id}>
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
                                                    selectedValue={state.bank_id}
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
                            ) : (
                                <>                                   
                                    <Input.Group>
                                        <Row>
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
                                                    onChange={handleChangeInput('swift_code')}
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
                                                        'account_no'
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
                                                        'depositor'
                                                    )}
                                                    placeholder="예금주"
                                                    autoComplete="off"
                                                />
                                            </Col>                                    
                                        </Row>
                                    </Input.Group>     
                                </>
                            )}
                        </>
                        
                    }
                    
                </Col>

                <Col xs={24} lg={5} className="label">
                    신분증, 계좌 파일{' '}
                    {stateData.type !== '4' && stateData.type !== '5' && <span className="spanStar">*</span>}
                </Col>
                <Col xs={24} lg={19}>
                    <Upload {...props} multiple={true}>
                        <Button className='ant-btn-etc-single' icon={<UploadOutlined />}>파일</Button>
                    </Upload>
                    <span className='accessFile'><ExclamationCircleOutlined/> 업로드 가능 확장자: png, pdf,xlsx | 용량 최대: 20MB</span>
                </Col>

                <Col xs={24} lg={5} className="label">
                    기타 참고사항
                </Col>
                <Col xs={24} lg={19}>
                    <Input.TextArea
                        name="memo"
                        rows={4}
                        onChange={handleChangeInput('memo')}
                        value={stateData.memo}
                        autoComplete="off"
                    />
                </Col>
            </Row>

            <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                <Col>
                    <Button
                        type="primary"
                        htmlType="button"
                        onClick={handleSubmit}
                    >
                        {uploading ? 'Uploading' : '확인'}
                    </Button>
                    <Button
                        htmlType="button"
                        onClick={visibleClose}
                        style={{ marginLeft: '10px' }}
                    >
                        취소
                    </Button>
                </Col>
            </Row>

            {chkVisible === true && (
                <ChkDrawer
                    chkVisible={chkVisible}
                    chkOnClose={chkOnClose}
                    overlapChkText={overlapChk}
                    authorNameData={state.chkData}
                    typeChk={state.type}
                    keywordTxt={state.namekeyword}
                />
            )}

            {postVisible === true && (
                <PopupPostCode chkVisible={postVisible} addPost={addPost} postClose={postClose}/>
            )}

        </Wrapper>
    );
});

export default copyDrawer;
