/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState,useRef } from 'react';
import {Table,Space, Button,Row,Col,Modal,Input,Upload,InputNumber,Radio,Popover,Select,Checkbox,Typography,Drawer,message} from 'antd';
// import {SelectProps} from '@type/antd';
import {PhoneOutlined, QuestionOutlined, UploadOutlined, ExclamationCircleOutlined} from '@ant-design/icons';

import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';
import * as wjInput from '@grapecity/wijmo.react.input';
import { CollectionView } from '@grapecity/wijmo';

import multer from 'multer';
import { countBy } from 'lodash';

const Wrapper = styled.div`
    width: 100%;
`;

const DETAILS_STATE = {
    // DB Data
    company: "",                    // 비용 귀속 회사

    details: [{                    // 비용 청구 상세       
        class1_id: '',        // 비용청구 분류1
        class2_id: '',        // 비용청구 분류2
        class3_id: '',        // 비용청구 분류3
        target: '',           // 비용 귀속 대상 구분 - 1:상품, 2:부서/회사
        current_unit: 'KRW',     // 통화 단위
        unit: '',             // 단위
        unit_price: '',       // 단가
        qty: '',              // 수량
        amount: '',           // 공급가
        vat_yn: '',           // 부가세 적용 여부
        vat: '',              // 부가세
        total_amount: "",     // 합계
        refund_target_yn: '', // 환급대상 여부
        remark: "",           // 세부 내용
        attribution_targets: []    // 비용 귀속 대상 ID
    }],
};

const detailsList = observer(({  detailsData,copyDetailsData, detailsDataReturn, tooltip ,company, typeChk}) => {
    const { Text } = Typography;
    const { Option } = Select;

    const stateDetails = useLocalStore(() => ({ ...DETAILS_STATE }));
   
    const state = useLocalStore(() => ({
       
        selectCode1:[], //비용청구분류 1depth
        selectCode2:[], //비용청구분류 2depth
        selectCode3:[], //비용청구분류 3depth
        code1Data:[],   //비용청구분류 1depth 선택값
        code2Data:[],   //비용청구분류 2depth 선택값
        code3Data:[],   //비용청구분류 3depth 선택값

        detailsColumn : [],  //청구내용 테이블 데이터

        selectTarget:[],        //비용귀속대상 리스트
        contributors:[],        //비용귀속대상 선택값 리스트
        contributorsOld:[],     //비용귀속대상 선택값 리스트

        detailsDataOld:[],

        modifyData: [],
        productData: [],

        copyDetailsData: [],    //복제 데이터

        attributionTargets: '',
        contributorsCnt:0,
    }));

    useEffect(() => {
        if(company !== '' && company !== undefined){
            stateDetails.company = company
        }
        classificationCode('','');  //비용청구분류
    }, [company]);    

    useEffect(() => {
        if(copyDetailsData.length > 0){
            classificationCode('','','modify');  //비용청구분류
        }      
        
    }, [copyDetailsData]);    

    useEffect(() => {              
        if(detailsData!= '' && detailsData != undefined && (company !='' && company != undefined)){   //값이 있으면 초기화
            stateDetails.details =  [{                    // 비용 청구 상세       
                class1_id: '',        // 비용청구 분류1
                class2_id: '',        // 비용청구 분류2
                class3_id: '',        // 비용청구 분류3
                target: '',           // 비용 귀속 대상 구분 - 1:상품, 2:부서/회사
                current_unit: 'KRW',     // 통화 단위
                unit: '',             // 단위
                unit_price: '',       // 단가
                qty: '',              // 수량
                amount: '',           // 공급가
                vat_yn: '',           // 부가세 적용 여부
                vat: '',              // 부가세
                total_amount: "",     // 합계
                refund_target_yn: '', // 환급대상 여부
                remark: "",           // 세부 내용
                attribution_targets: []    // 비용 귀속 대상 ID
            }]

            state.contributors=[];
            state.selectCode2=[];
            state.selectCode3=[];
            state.code1Data=[];
            state.code2Data=[];
            state.code3Data=[];
            setRefundTargetActive(true);
            setInputActive(true)
            setChkDisabled(true)
            setCurrentUnitChk(true)
            
        }
    }, [detailsData]);

    //값이 있으면 disabled true
    const [chkDisabled, setChkDisabled] = useState(false);
    
    //비용분류 선택 후 활성화
    const [inputActive, setInputActive] = useState(true);
    //비용귀속대상
    const [inputChkActive, setInputChkActive] = useState(true);
    //통화단위 활성화
    const [currentUnitChk, setCurrentUnitChk] = useState(true);
    //환급대상 활성화
    const [refundTargetActive, setRefundTargetActive] = useState(true);    
    //state.code3Data.unitprice_use_yn 확인
    const [unitpriceUseYn, setUnitpriceUseYn] = useState('');

    const [productChk, setProductChk] = useState(true);
    const [departmentChk, setDepartmentChk] = useState(true);

    const scrollTop = () => {
        document.querySelector(".ant-drawer-body").scroll({top : 0, behavior: 'smooth'});
        
    };


    const handleChangeDetails = useCallback((type) => (e) => {
        var numChk = /[^0-9|,]/g;
        var key = type+'error'
        // var val = e.target.value;
       if(type == 'company'){
            stateDetails[type] = e.target.value;
        }else if(type === 'class1_id'){
            classificationCode('1depth', e?.selectedValue);
            stateDetails['details'][0][type] = e?.selectedValue;
        }else if(type === 'class2_id'){
            classificationCode('2depth', e?.selectedValue);
            stateDetails['details'][0][type] = e?.selectedValue;
        }else if(type === 'class3_id'){
            classificationCode('3depth', e?.selectedValue);
            stateDetails['details'][0][type] = e?.selectedValue;
        }else if(type == 'vat_yn'){
            if(e.target.checked == true){
                var vatPay = Number(stateDetails['details'][0]['amount']) * 0.1;
                stateDetails['details'][0]['vat']  = Math.round(vatPay);
                stateDetails['details'][0][type]  = 'Y';

                stateDetails['details'][0]['total_amount'] =Number(stateDetails['details'][0].vat) + Number(stateDetails['details'][0]['amount']);
            }else{
                stateDetails['details'][0]['vat'] = 0;
                stateDetails['details'][0]['total_amount'] = 0 + Number(stateDetails['details'][0]['amount']);
                stateDetails['details'][0][type]  = 'N';
            }
        }else if(type == 'vat'){
            if(numChk.test(e.target.value) ){
                message.warning({ content: '숫자만 입력 가능합니다.', key});       
            }else{
                // replace(/\$\s?|(,*)/g, '')
                var vat = e.target.value.replace(/\$\s?|(,*)/g, '')
                stateDetails['details'][0][type] = vat.replace(/[^0-9]/g, '');
                stateDetails['details'][0]['total_amount'] =Number(vat) + Number(stateDetails['details'][0]['amount']);
            }    
            
        }else if(type == 'unit' || type == 'unit_price' || type == 'qty'){
            if(type != 'unit'){
                stateDetails['details'][0][type] =  e;                
            }else{                
                stateDetails['details'][0][type] = e.target.value;
            }             
            if( stateDetails['details'][0].unit && stateDetails['details'][0].unit_price && stateDetails['details'][0].qty){
                stateDetails['details'][0].amount = Number(stateDetails['details'][0].unit_price) * Number(stateDetails['details'][0].qty);
                stateDetails['details'][0].total_amount =stateDetails['details'][0].amount ;
            }else{
                stateDetails['details'][0].amount ='';
                stateDetails['details'][0].total_amount ='';
            }
            if(stateDetails.details[0].vat_yn === 'Y'){
                var vatPay = Number(stateDetails['details'][0]['amount']) * 0.1;
                stateDetails['details'][0]['vat']  = Math.round(vatPay);
                stateDetails['details'][0].total_amount =stateDetails['details'][0].amount + stateDetails['details'][0]['vat'];
            }
        }else if(type === 'contributors'){
            var data = state.productData.filter(a=> a.value === e?.selectedValue);
            // state.contributors = [...state.contributors,{id:e, name: data[0].label, index: state.contributors.length}];
            state.contributors = [...state.contributors,{id: e?.selectedValue, name: data[0].label, index: state.contributorsCnt}];
            stateDetails['details'][0].attribution_targets = [...stateDetails['details'][0].attribution_targets,e];
            // state.attributionTargets =e
            state.attributionTargets =''
        }else if (type === 'amount'){
            stateDetails['details'][0].amount = e;
            stateDetails['details'][0].total_amount =stateDetails['details'][0].amount ;
            
            if(stateDetails.details[0].vat_yn === 'Y'){
                var vatPay = Number(stateDetails['details'][0]['amount']) * 0.1;
                stateDetails['details'][0]['vat']  = Math.round(vatPay);
                stateDetails['details'][0].total_amount =stateDetails['details'][0].amount + stateDetails['details'][0]['vat'];
            }
        }else if(type == 'target'){
            if(stateDetails['details'][0]['target'] !== e.target.value){
                stateDetails['details'][0][type] = e.target.value;
                prodcutView()
            }                
        }else{
            if(type == 'current_unit'){
                if(e.target.value != 'KRW'){
                    Modal.warning({
                        title: '공급가에는 해당 통화 금액을 입력해 주세요.',
                        content: '(예: $100이면 그대로 환율 적용하지 않고 100을 입력)',
                    });
                }                
            }
            
            stateDetails['details'][0][type] = e.target.value;
        }

        
    },[],);

    //비용청구분류코드
    const classificationCode = useCallback(async (type,val,modify) => {
        var axios = require('axios');
        if(type == '3depth'){
            state.code3Data = state.selectCode3.find(e=> e.id == val);

            stateDetails['details'][0].attribution_targets = [];            
            // state.contributors=[];               

            if(state.code3Data !== '' && state.code3Data !== undefined){
                //환급 대상 여부(일반 비용 > 복지/교육 > 교육/훈련'일 경우에만 활성화)
                if(state.code1Data.id === 8 && state.code2Data.id === 21 && state.code3Data.id === 77){
                    setRefundTargetActive(false)   
                }else{
                    setRefundTargetActive(true)   
                }

                //통화단위
                if(state.detailsColumn !=='' && state.detailsColumn !== undefined && state.detailsColumn.length > 0){
                    setCurrentUnitChk(true)  
                } else{
                    setCurrentUnitChk(false)  
                }

                setInputActive(false)
                setInputChkActive(false)

                if(state.code3Data.unitprice_use_yn !== '' && state.code3Data.unitprice_use_yn !== undefined ){
                    setUnitpriceUseYn(state.code3Data.unitprice_use_yn)
                }

                if(state.code3Data.product_use_yn == 'Y' && state.code3Data.department_use_yn == 'Y' || state.code3Data.product_use_yn == 'Y' && state.code3Data.department_use_yn == 'N'){                
                    stateDetails['details'][0].target = '1';
                }else if(state.code3Data.product_use_yn == 'N' && state.code3Data.department_use_yn == 'Y'){                
                    stateDetails['details'][0].target = '2';
                }

                if(state.code3Data.product_use_yn == 'Y' && state.code3Data.department_use_yn == 'Y' || state.code3Data.product_use_yn == 'Y' && state.code3Data.department_use_yn == 'N'){
                    setProductChk(false)
                }

                if(state.code3Data.product_use_yn == 'N' && state.code3Data.department_use_yn == 'Y' || state.code3Data.product_use_yn == 'Y' && state.code3Data.department_use_yn == 'Y'){
                    setDepartmentChk(false)
                }

                prodcutView()

                //청구서가 복제일때 비용귀속 수정을 누르면 비용귀속대상이 같으면 비용청구분류 삭제가 안되도록 수정
                if(state.copyDetailsData.length > 0){
                    console.log(state.copyDetailsData[0].target , stateDetails['details'][0].target)
                    if(state.copyDetailsData[0].target !== stateDetails['details'][0].target){
                        state.contributors=[];   
                    }
                }
            }            
                   
            
        }else{
            var depth = '';
            var id = '';
            if(type == '2depth'){
                state.code2Data = state.selectCode2.find(e=> e.id == val);
                state.code3Data =[];
                depth = 'parent_id='+val+'&depth=3';
            }else if(type == '1depth'){
                id = 'id='+val;        
            }else{
                id = '';
            }   

            var config = {
                method: 'GET',
                url:process.env.REACT_APP_API_URL +'/api/v1/billing-classification?'+id+depth,
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
                    if(type == '1depth'){
                        state.selectCode2 = result.data.data[0].child; //2depth select
                        state.selectCode3 =[];
                        state.code1Data = result.data.data[0]; //1dept 선택한 데이터       
                        stateDetails['details'][0].attribution_targets = [];            
                        // state.contributors=[];   
                        stateDetails['details'][0].class2_id = '';
                        
                    }else if(type == '2depth'){      
                        state.selectCode3 = result.data.data; //3depth select       
                        stateDetails['details'][0].attribution_targets = [];
                        // state.contributors=[];
                         
                    }else{
                        state.selectCode1 = result.data.data; //1depth select
                        state.selectCode2 =[];
                        state.selectCode3 =[];
                        state.code2Data =[];
                        
                        stateDetails['details'][0].class1_id = '';
                        stateDetails['details'][0].class2_id = '';
                    }

                    state.code3Data =[];
                    stateDetails['details'][0].class3_id = '';  
                    stateDetails['details'][0].unit = '';
                    stateDetails['details'][0].unit_price = '';
                    stateDetails['details'][0].vat = '';
                    stateDetails['details'][0].vat_yn = '';
                    stateDetails['details'][0].total_amount = '';
                    stateDetails['details'][0].amount = '';
                    
                    if(modify == 'modify'){
                        chkModify();
                    }
                }
            })
            .catch(function (error) {
                if(error.response != undefined && error.response != ''){
                    console.log(error.response);
                    Modal.error({
                        title: '오류가 발생했습니다. 재시도해주세요.',
                        content: '오류코드:' + error.response.status,
                    });
                }
            });
        }
        
    });

    const chkModify=()=>{
        if(state.detailsColumn =='' || state.detailsColumn == undefined){
            console.log(toJS(copyDetailsData))
            state.contributorsCnt = copyDetailsData.length
            var cnt = 0;
            var arr = [];
            // var company = '';
            var contributors = [];
            copyDetailsData.forEach(val => {
                if(val.class1_id){
                    // company = val.company;
                    var depth1 = state.selectCode1.find(e=> e.id == val.class1_id);
                    state.code1Data = depth1;                    
                    if(state.code1Data !==''){
                        state.code2Data = state.code1Data.child.find(e=> e.id == val.class2_id);
                        state.code3Data = state.code2Data.children.find(e=> e.id == val.class3_id);

                        var text = state.code1Data.name+' > '+state.code2Data.name+' > '+state.code3Data.name;
                        var typeText='';
                        var attribution_targets='';                       

                        if(val.attribution_targets.length > 1){
                            var contributorsText = [];
                            var contributorsData = [];
                            val.attribution_targets.forEach(a =>{
                                attribution_targets = [...attribution_targets, a.attributionable_id]
                                contributorsText= [...contributorsText, {id:a.attributionable_id, name : a.attributionable_name}]
                                contributorsData= [...contributorsData, {id:a.attributionable_id, name : a.attributionable_name, index:copyDetailsData.length-1}]
                                if(val.attribution_targets[0].attributionable.product_code){
                                    var proudctCode = '('+a.attributionable.product_code+')'
                                }else{
                                    var proudctCode = '';
                                }
                                
                                typeText = [...typeText, a.attributionable_name+proudctCode];
                            })
                            // contributors[cnt] =contributorsText
                            contributors[cnt] =contributorsData
                            typeText= typeText.join(', ')

                        } else{
                            attribution_targets = [...attribution_targets, val.attribution_targets[0].attributionable_id]
                            // contributors[cnt] = [{id:val.attribution_targets[0].attributionable_id, name : val.attribution_targets[0].attributionable_name}]
                            contributors[cnt] = {id:val.attribution_targets[0].attributionable_id, name : val.attribution_targets[0].attributionable_name, index : copyDetailsData.length-1}
                            if(val.attribution_targets[0].attributionable.product_code){
                                var proudctCode = '('+val.attribution_targets[0].attributionable.product_code+')'
                            }else{
                                var proudctCode = '';
                            }
                            typeText = val.attribution_targets[0].attributionable_name+proudctCode
                        }
                       

                        val.attribution_targets = attribution_targets;
                        state.contributorsOld = contributors;
                       
                        arr = [...arr, {num:cnt, optionText : text, typeText:typeText, current_unit: val.current_unit, total_amount : val.total_amount}];           
                        cnt++;
                        typeText = '';

                    }                   
                }
            });     
            state.detailsColumn = arr;
            if(company !== '' && company !== undefined){
                stateDetails.company = company;
            }else{
                stateDetails.company = copyDetailsData[0].company;
            }
           
            // stateDetails['details'][0] = copyDetailsData[0];
            state.modifyData = copyDetailsData;
            stateDetails.details[0].attribution_targets = copyDetailsData[0].attribution_targets

            state.copyDetailsData = copyDetailsData;
            
            // state.contributors = contributors;
            setInputActive(true)
            setInputChkActive(true)
            setChkDisabled(true)
            setCurrentUnitChk(true)
            if(state.code3Data.unitprice_use_yn !== '' && state.code3Data.unitprice_use_yn !== undefined ){
                setUnitpriceUseYn(state.code3Data.unitprice_use_yn)
            }
            
        }
    }

    const commaNum = (num) => {  
        if(num){
            const number = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return number
        }else{
            return 0;
        }

    }   
    
    //수정일때
    const [detailsModifyNum, setDetailsModifyNum] = useState('');
    const detailschange= (type,val)=>{
        var data = '' ;
        if(copyDetailsData.length > 0){
            data = copyDetailsData;
        }else{
            data = detailsData;
        }
        console.log(toJS(data))
        console.log(toJS(val))
        // 수정일 경우 details.id 전송해야함
        if(type == 'copy' || type == 'modify'){            
            if(type == 'modify'){
                scrollTop();
                setDetailsModifyNum(val.num);
            }else{
                setDetailsModifyNum('');
            } 

            var arr = []
            for (const key in data[0]) {
                if(key !== 'attribution_targets'){
                    stateDetails['details'][0][key] = data[0][key];
                }else{
                    if(data[0]['attribution_targets'].length > 1){                            
                        data[0]['attribution_targets'].forEach(e => {
                            arr = [...arr, e]
                        });
                        stateDetails['details'][0][key] = arr
                    }else{
                        stateDetails['details'][0][key] = data[0]['attribution_targets'];
                    }
                }                    
            } 
           
            var depth1 = state.selectCode1.find(e=> e.id == stateDetails['details'][0].class1_id);
            state.code1Data = depth1;           
            state.selectCode2 = depth1.child;
            state.code2Data = state.selectCode2.find(e=> e.id == stateDetails['details'][0].class2_id);
            state.selectCode3 = state.code2Data.children;
            state.code3Data = state.selectCode3.find(e=> e.id == stateDetails['details'][0].class3_id);


            if(state.code3Data !='' && state.code3Data != undefined){                            
                if(state.code1Data.id === 8 && state.code2Data.id === 21 && state.code3Data.id === 77){
                    setRefundTargetActive(false)   
                }else{
                    setRefundTargetActive(true)   
                }
                state.contributors = state.contributorsOld.filter(e=>e.index === val.num); 
                if(type == 'copy' ){
                    setInputActive(false)                    
                    setCurrentUnitChk(true)                   
                }else{
                    setInputActive(false)
                    setCurrentUnitChk(true)   
                }
                setInputChkActive(false)
                setUnitpriceUseYn('Y')

                if(state.code3Data.unitprice_use_yn !== '' && state.code3Data.unitprice_use_yn !== undefined ){
                    setUnitpriceUseYn(state.code3Data.unitprice_use_yn)
                }    
                
                if(state.code3Data.product_use_yn == 'Y' && state.code3Data.department_use_yn == 'Y' || state.code3Data.product_use_yn == 'Y' && state.code3Data.department_use_yn == 'N'){                
                    stateDetails['details'][0].target = '1';                    
                }else if(state.code3Data.product_use_yn == 'N' && state.code3Data.department_use_yn == 'Y'){                
                    stateDetails['details'][0].target = '2';
                }
                prodcutView()
            } 
   
        }else{
            if(data.length == 0){
                if(copyDetailsData !== ''  && copyDetailsData !== undefined){
                    copyDetailsData = []
                }else{
                    detailsData = []
                }
                state.contributorsOld = [];
                state.detailsColumn = [];                    

                detailsDataReturn('','');                
            }else{
                var arr = [];
                data.forEach((e,index) => {
                    if(index != val.num){
                        arr = [...arr, e]
                    }
                });

                detailsData = arr;

                if(copyDetailsData !== '' && copyDetailsData !== undefined){
                    copyDetailsData = arr
                }else{
                    detailsData = arr
                }

                var arr2 = [];
                state.contributorsOld.forEach((e,index) => {
                    if(index != val.num){
                        arr2 = [...arr2, e]
                    }
                });
                state.contributorsOld = arr2;     
                
                var arr3 = [];
                var cnt = 0;
                state.detailsColumn.forEach((e,index) => {
                    if(index != val.num){
                        if(e.num){
                            e.num = cnt;
                        }
                        arr3 = [...arr3, e];
                        cnt++;
                    }
                });
                state.detailsColumn = arr3;
                
                if(copyDetailsData !== '' && copyDetailsData !== undefined){
                    detailsDataReturn(copyDetailsData,'del');
                }else{
                    detailsDataReturn(detailsData,'del');
                }

                if(arr.length === 0){
                    //초기화
                    stateDetails.details =  [{                    // 비용 청구 상세       
                        class1_id: '',        // 비용청구 분류1
                        class2_id: '',        // 비용청구 분류2
                        class3_id: '',        // 비용청구 분류3
                        target: '',           // 비용 귀속 대상 구분 - 1:상품, 2:부서/회사
                        current_unit: 'KRW',     // 통화 단위
                        unit: '',             // 단위
                        unit_price: '',       // 단가
                        qty: '',              // 수량
                        amount: '',           // 공급가
                        vat_yn: '',           // 부가세 적용 여부
                        vat: '',              // 부가세
                        total_amount: "",     // 합계
                        refund_target_yn: '', // 환급대상 여부
                        remark: "",           // 세부 내용
                        attribution_targets: []    // 비용 귀속 대상 ID
                    }]
        
                    state.contributors=[];
                    state.selectCode2=[];
                    state.selectCode3=[];
                    state.code1Data=[];
                    state.code2Data=[];
                    state.code3Data=[];
                    setRefundTargetActive(true);
                    setInputActive(true)
                    setChkDisabled(true)
                    setCurrentUnitChk(true)

                    console.log(toJS(stateDetails.details))
                }
               
            }       
           
           
        }
    }


    //비용청구 반영
    const detailsAdd =()=>{
        let chkVal = true;        

        if(stateDetails.company == ""  ){
            Modal.error({
                content: '비용 귀속 회사를 선택해주세요.',        
            });
            chkVal = false;
            return;
        } 

        if(stateDetails['details'][0].class1_id == ""  ){
            Modal.error({
                content: '비용 청구 분류를 선택해주세요.',        
            });
            chkVal = false;
            return;
        } 

        if(stateDetails['details'][0].class2_id == ""  ){
            Modal.error({
                content: '비용 청구 분류를 선택해주세요.',        
            });
            chkVal = false;
            return;
        } 

        if(stateDetails['details'][0].class3_id == ""  ){
            Modal.error({
                content: '비용 청구 분류를 선택해주세요.',        
            });
            chkVal = false;
            return;
        } 

        if(stateDetails['details'][0].target == "" && ((state.code3Data.product_use_yn == 'Y' && state.code3Data.department_use_yn == 'Y' || state.code3Data.product_use_yn == 'Y' && state.code3Data.department_use_yn == 'N' || state.code3Data.product_use_yn == 'N' && state.code3Data.department_use_yn == 'Y'))  ){
            Modal.error({
                content: '비용 귀속 대상을 선택해주세요.',        
            });
            chkVal = false;
            return;
        } 
        // if(stateDetails['details'][0].attribution_targets === "" && stateDetails['details'][0].attribution_targets === undefined  
        if(stateDetails['details'][0].attribution_targets.length === 0
        && ((state.code3Data.product_use_yn == 'Y' && state.code3Data.department_use_yn == 'Y' 
        || state.code3Data.product_use_yn == 'Y' && state.code3Data.department_use_yn == 'N' 
        || state.code3Data.product_use_yn == 'N' && state.code3Data.department_use_yn == 'Y'
        )) ){
            Modal.error({
                content: '비용 귀속 대상을 선택해주세요.',        
            });
            chkVal = false;
            return;
        } 

        if(stateDetails['details'][0].current_unit == ""  ){
            Modal.error({
                content: '통화 단위를 선택해주세요.',        
            });
            chkVal = false;
            return;
        } 

        if(stateDetails['details'][0].unit == ""  && state.code3Data.unitprice_use_yn =='Y'){
            Modal.error({
                content: '단위를 작성해주세요.',        
            });
            chkVal = false;
            return;
        } 

        if(stateDetails['details'][0].unit_price == "" && state.code3Data.unitprice_use_yn =='Y' ){
            Modal.error({
                content: '단가를 작성해주세요.',        
            });
            chkVal = false;
            return;
        } 

        if(stateDetails['details'][0].qty == "" && state.code3Data.unitprice_use_yn =='Y' ){
            Modal.error({
                content: '수량을 작성해주세요.',        
            });
            chkVal = false;
            return;
        } 

        if(stateDetails['details'][0].refund_target_yn == "" && refundTargetActive == false){
            Modal.error({
                content: '환급 대상 여부를 선택해주세요.',        
            });
            chkVal = false;
            return;
        } 
// return
        if(chkVal == true){
            if(typeof detailsModifyNum == 'string'){   //수정이 아닐경우
                var text = state.code1Data.name+' > '+state.code2Data.name+' > '+state.code3Data.name;
                var typeText='';
                if(state.contributors != '' && state.contributors != undefined){
                    state.contributors.forEach(a => {
                        typeText = [...typeText, a.name]
                        state.contributorsOld = [...state.contributorsOld, {id : a.id, name: a.name, index :state.contributorsCnt}]

                    });
                    typeText =typeText.join(', ');
                }
                
                var cnt = state.detailsColumn.length;

                state.detailsColumn = [...state.detailsColumn, {num:cnt, optionText : text, typeText: typeText, current_unit: stateDetails['details'][0].current_unit, total_amount : stateDetails['details'][0].total_amount}];           

                if(detailsData.length == 0){
                    detailsData =[stateDetails['details']];
                }else{                   
                    detailsData =[...detailsData, stateDetails['details']];     
                    
                }   

                var total = 0
                state.detailsColumn.forEach(e => {
                    total = total +e.total_amount
                });

                state.attributionTargets = ''
                detailsDataReturn(stateDetails,detailsModifyNum,total);
                state.contributors=[];
                state.contributorsCnt++                
 
            }else{              
                var text = state.code1Data.name+' > '+state.code2Data.name+' > '+state.code3Data.name;
                var typeText='';
                if(state.contributors != '' && state.contributors != undefined){
                    state.contributors.forEach(a => {
                        typeText = [...typeText, a.name]
                        state.contributorsOld = [...state.contributorsOld, {id : a.id, name: a.name, index :state.contributorsCnt}]
                    });
                    typeText =typeText.join(', ');
                }
                var arr = [];
                state.detailsColumn.forEach((e,num) => {
                    if(num != detailsModifyNum){
                        arr[e.num] = e
                    }
                });  
                arr[detailsModifyNum] = {num:detailsModifyNum, optionText : text, typeText: typeText, current_unit: stateDetails['details'][0].current_unit, total_amount : stateDetails['details'][0].total_amount};           
                state.detailsColumn = arr;

                var total = 0
                state.detailsColumn.forEach(e => {
                    total = total +e.total_amount
                });

                // console.log(toJS(stateDetails))
                detailsDataReturn(stateDetails.details[0],detailsModifyNum,total);
                
                //초기화
                stateDetails.details =  [{                    // 비용 청구 상세       
                    class1_id: '',        // 비용청구 분류1
                    class2_id: '',        // 비용청구 분류2
                    class3_id: '',        // 비용청구 분류3
                    target: '',           // 비용 귀속 대상 구분 - 1:상품, 2:부서/회사
                    current_unit: 'KRW',     // 통화 단위
                    unit: '',             // 단위
                    unit_price: '',       // 단가
                    qty: '',              // 수량
                    amount: '',           // 공급가
                    vat_yn: '',           // 부가세 적용 여부
                    vat: '',              // 부가세
                    total_amount: "",     // 합계
                    refund_target_yn: '', // 환급대상 여부
                    remark: "",           // 세부 내용
                    attribution_targets: []    // 비용 귀속 대상 ID
                }]
    
                state.contributors=[];
                state.selectCode2=[];
                state.selectCode3=[];
                state.code1Data=[];
                state.code2Data=[];
                state.code3Data=[];
                setRefundTargetActive(true);
                setInputActive(true)
                setChkDisabled(true)
                setCurrentUnitChk(true)
            }           
            setDetailsModifyNum('')
        }
    }

    //비용귀속
    const prodcutView = (type) => {
        var url = '';
        if(stateDetails['details'][0].target =='1' && (state.code3Data.product_use_yn == 'Y' && state.code3Data.department_use_yn == 'Y' 
        || state.code3Data.product_use_yn == 'Y' && state.code3Data.department_use_yn == 'N')){                
            url = 'products?display=3000&page=1&sort_by=date&order=desc&comepany='+stateDetails.company;

        }else if(stateDetails['details'][0].target =='2' && (state.code3Data.product_use_yn == 'Y' && state.code3Data.department_use_yn == 'Y' || 
            state.code3Data.product_use_yn == 'N' && state.code3Data.department_use_yn == 'Y')){     
            if(stateDetails.company != '' && stateDetails.company != undefined){
                if(stateDetails.company == 'G'){
                    var company = '1';
                }else{
                    var company = '2';
                }
                url = 'select-department-codes?cost_attribution_company='+company;
            }else{
                url = '';
                message.warning('비용귀속회사 선택 후 검색이 가능합니다.');
            }        
            
        }else{
            url = '';
        }

        if(url !== '' && url !== undefined){           
            var axios = require('axios');

            var config = {
                method: 'GET',
                url:process.env.REACT_APP_API_URL +'/api/v1/'+url,
                headers: {
                    Accept: 'application/json',
                },
            };
    
            axios(config)
            .then(function (result) {
                if (result.data.data !='' ) {
                    var data = result.data.data;
                    var arr = [];
                    if(stateDetails.details[0].target == 2){
                        data.forEach(item => {
                            arr = [...arr, { value: Number(item.id), label: item.name}]
                        });
                    }else{
                        data.forEach(item => {
                            arr = [...arr, { value: item.id, label: '['+item.product_code+'] '+item.name}]
                        });
                    }
                    
                    // setData(arr)
                    state.productData = arr
                }
            })
            .catch(function (error) {
                console.log(error.response);
                Modal.error({
                    title: '오류가 발생했습니다. 재시도해주세요.',
                    content: '오류코드:' + error.response.status,
                });
            });
        }            
    };
 
    //비용귀속 리스트
    const fetch = (value, setData) => {

        var url = '';

        if(stateDetails['details'][0].target =='1' && (state.code3Data.product_use_yn == 'Y' && state.code3Data.department_use_yn == 'Y' 
        || state.code3Data.product_use_yn == 'Y' && state.code3Data.department_use_yn == 'N')){                
            url = 'products?display=10&page=1&sort_by=date&order=desc&keyword='+value;

        }else if(stateDetails['details'][0].target =='2' && (state.code3Data.product_use_yn == 'Y' && state.code3Data.department_use_yn == 'Y'  || state.code3Data.product_use_yn == 'N' && state.code3Data.department_use_yn == 'Y')){     
            if(stateDetails.company != '' && stateDetails.company != undefined){
                if(stateDetails.company == 'G'){
                    var company = '1';
                }else{
                    var company = '2';
                }
                // url = 'department-codes?cost_attribution_company='+company+'&keyword='+value;
                url = 'select-department-codes?cost_attribution_company='+company+'&keyword='+value;
            }else{
                url = '';
                message.warning('비용귀속회사 선택 후 검색이 가능합니다.');
            }        
            
        }else{
            url = '';
        }

        if(url){           
            var axios = require('axios');

            var config = {
                method: 'GET',
                url:process.env.REACT_APP_API_URL +'/api/v1/'+url,
                headers: {
                    Accept: 'application/json',
                },
            };
    
            axios(config)
            .then(function (result) {
                if (result.data.data !='' ) {
                    var data = result.data.data;
                    var arr = [];
                    if(stateDetails.details[0].target == 2){
                        data.forEach(item => {
                            arr = [...arr, { value: Number(item.id), label: item.name}]
                        });
                    }else{
                        data.forEach(item => {
                            arr = [...arr, { value: item.id, label: '['+item.product_code+'] '+item.name}]
                        });
                    }
                    
                    setData(arr)
                }
            })
            .catch(function (error) {
                console.log(error.response);
                Modal.error({
                    title: '오류가 발생했습니다. 재시도해주세요.',
                    content: '오류코드:' + error.response.status,
                });
            });
        }            
    };
    const SearchInput = (props) => {
        const [data, setData] = useState([]);
        const [value, setValue] = useState();
      
        const handleSearch = (newValue) => {
          if (newValue) {
            fetch(newValue, setData);
          } else {
            setData([]);
          }
        };
      
        const handleChange = (id, val) => {    
            state.contributors = [...state.contributors,{id:id, name: val.label, index: state.contributors.length}];
            stateDetails['details'][0].attribution_targets = [...stateDetails['details'][0].attribution_targets,id];
            console.log(toJS(stateDetails['details']))
            setValue(id);
        };
      
        return (
          <Select
            showSearch
            value={value}
            placeholder={props.placeholder}
            style={props.style}
            defaultActiveFirstOption={false}
            showArrow={false}
            filterOption={false}
            onSearch={handleSearch}
            onChange={handleChange}
            notFoundContent={null}
            options={data}
            disabled={inputChkActive == false && stateDetails['details'][0].target != '' ? false: true}
          />
        );
    };
    const TargetSelect= () => <SearchInput placeholder="" style={{ width: 200 }} />;

    // 비용 귀소 대상 삭제
    const btnDel = (type,num)=>{
        var arrList = [];
        var arrList2 = [];
        var arrList3 = [];
        var chkIndex = '';

        if(type === 'contributors'){ // 비용귀속대상 삭제
            if(state.contributors.length == 1){
                state.contributors = [];
            }else{
                console.log(toJS(state.contributors))
                state.contributors.map((e) => {
                    if (e.id !== num) {
                        arrList.push(e);
                        // arrList2.push(e.id);
                        arrList2=[...arrList2, e.id]
                    }else{
                        chkIndex = e.index
                    }
                });
                console.log(toJS(arrList))
                console.log(toJS(arrList2))
                state.contributors = arrList;       

                state.contributorsOld.forEach(e => {
                    if (e.index !== chkIndex) {
                        arrList3.push(e);
                    }else{
                        if(e.id !== num){
                            arrList3.push(e);
                        }
                    }
                });
                // state.contributorsOld[chkIndex] = arrList;   
                console.log(toJS(arrList3))
                state.contributorsOld = arrList3;   
            }
            stateDetails['details'][0].attribution_targets = arrList2;

            console.log(toJS(stateDetails['details']))
            console.log(toJS(state.contributorsOld))
        }        
    }
  

    const column = useMemo(() => [
        {
            title: '비용 분류',
            dataIndex: 'billing_sort',
            key:  'billing_sort',
            render: (_, row) => <div>{row.optionText}</div>,
            align: 'left',
        },
        {
            title: '귀속 대상',
            dataIndex: 'billing_target',
            key:  'billing_target',
            // render: (_, row) => <div style={{textAlign:'left'}}>{row.typeText.join(', ')}</div>,
            render: (_, row) => <div>{row.typeText}</div>,
            align: 'left',
        },
        {
            title: '통화',
            dataIndex:  'billing_current_unit',
            key: 'billing_current_unit',
            render: (_, row) => <div>
                {row.current_unit =='KRW' ? '원화(KRW)' : row.current_unit =='USD' ? '달러(USD)' : row.current_unit =='EUR' ? '유로(EUR)' : row.current_unit =='GBP' ? '파운드(GBP)' : 
                row.current_unit =='JPY' ? '엔(JPY)' : '위안(CNY)'}
            </div>,
            align: 'left',
        },
        {
            title: '합계',
            dataIndex: 'billing_cost',
            key: 'billing_cost',
            render: (_, row) => <div>{row.total_amount !='' && row.total_amount !=undefined ? commaNum(row.total_amount) : '' }</div>,
            align: 'right',
        },
        {
            title: '작업',
            dataIndex: 'billing_btn',
            key: 'billing_btn',
            render: (_, row) => <div><Button type='primary' size="small" onClick={(e)=>detailschange('modify',row)}>수정</Button> <Button type='primary' size="small" onClick={(e)=>detailschange('copy',row)} disabled={typeChk !=='' && typeChk !== undefined  ? true : false}>복제</Button> <Button danger size="small" onClick={(e)=>detailschange('del',row)} disabled={typeChk !=='' && typeChk !== undefined  ? true : false}>삭제</Button></div>,
            align: 'center',
        },    
    ],[state.detailsColumn]);

    const initialized = useCallback((type) => (e) => {
        e.inputElement.addEventListener('keydown',function(event){
            if(event.keyCode==38 || event.keyCode==40) {
                e.isDroppedDown=true;
                event.stopPropagation();
            }
        })
    });

    return (
        <Wrapper>
            <Row gutter={10} className="table marginTop">
                <div className="table_title">청구 내용</div>
                <Col xs={24} lg={5} className="label">
                    귀속 회사 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={19}>
                    <Radio.Group name="company" value={stateDetails.company} onChange={handleChangeDetails('company')} 
                    // disabled={(detailsData !=='' && detailsData !== undefined) || (copyDetailsData !== '' && copyDetailsData !== undefined) ? true : false}>
                    disabled={chkDisabled}>
                        <Radio value='G'>도서출판 길벗</Radio>
                        <Radio value='S'>길벗스쿨</Radio>
                    </Radio.Group> 
                </Col>
                <Col xs={24} lg={5} className="label">
                    청구 분류 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={19}>
                    <wjInput.ComboBox
                        placeholder="선택"
                        itemsSource={new CollectionView(state.selectCode1, {
                            currentItem: null
                        })}
                        selectedValuePath="id"
                        displayMemberPath="name"
                        valueMemberPath="id"
                        selectedValue={stateDetails['details'][0].class1_id =='' || stateDetails['details'][0].class1_id == undefined ? '선택해 주세요.': stateDetails['details'][0].class1_id}
                        textChanged={handleChangeDetails('class1_id')}
                        style={{ width: '20%' }}
                        disabled={(typeChk !=='' && typeChk !== undefined) && (detailsModifyNum ==='' || detailsModifyNum === undefined )? true : false}
                    />

                    {(state.selectCode2 !='' && state.selectCode2 != undefined )&&
                        <wjInput.ComboBox
                            placeholder="선택"
                            itemsSource={new CollectionView(state.selectCode2, {
                                currentItem: null
                            })}
                            selectedValuePath="id"
                            displayMemberPath="name"
                            valueMemberPath="id"
                            selectedValue={stateDetails['details'][0].class2_id =='' || stateDetails['details'][0].class2_id == undefined ? '선택해 주세요.': stateDetails['details'][0].class2_id}
                            textChanged={handleChangeDetails('class2_id')}
                            style={{ width: '20%' }}
                        />

                    }
                    {(state.selectCode3 !='' && state.selectCode3 != undefined) &&
                        <wjInput.ComboBox
                            placeholder="선택"
                            itemsSource={new CollectionView(state.selectCode3, {
                                currentItem: null
                            })}
                            selectedValuePath="id"
                            displayMemberPath="name"
                            valueMemberPath="id"
                            selectedValue={stateDetails['details'][0].class3_id =='' || stateDetails['details'][0].class3_id == undefined ? '선택해 주세요.': stateDetails['details'][0].class3_id}
                            textChanged={handleChangeDetails('class3_id')}
                            style={{ width: '20%' }}
                        />
                    }
                </Col>
                {/* 비용 청구 붆류 선택시 귀속대상 항목 노출 */}
                <Col xs={24} lg={5} className="label">
                    귀속 대상 <span className="spanStar">*</span>
                    <Popover content={tooltip}>
                        <Button
                            className="btn_tip"
                            shape="circle"
                            icon={<QuestionOutlined style={{ fontSize: '11px' }} />}
                            size="small"
                            style={{ marginLeft: '5px' }}
                        />
                    </Popover>
                </Col>
                <Col xs={24} lg={19}>                        
                    <Row> 
                        <Col xs={24} lg={24}>
                            <Radio.Group onChange={handleChangeDetails('target')} value={stateDetails['details'][0].target } disabled={inputActive}>
                                <Radio value="1" disabled={inputActive == false && stateDetails['details'][0].target != '' && 
                                (state.contributors == '' || state.contributors == undefined) && productChk === false
                                ? false: true}>상품</Radio>
                                <Radio value="2" disabled={inputActive == false && stateDetails['details'][0].target != '' && 
                                (state.contributors == '' || state.contributors == undefined)  && departmentChk === false
                                ? false: true}>부서/회사</Radio>
                            </Radio.Group>

                            <wjInput.ComboBox
                                initialized={initialized()}
                                placeholder="선택"
                                itemsSource={new CollectionView(state.productData, {
                                    currentItem: null
                                })}
                                selectedValuePath="value"
                                displayMemberPath="label"
                                valueMemberPath="value"
                                textChanged={handleChangeDetails('contributors')}
                                style={{ width: 500 }}
                            />
                        </Col>
                    </Row>
                    <Row style={state.contributors != '' && state.contributors != undefined ? {marginTop: 10} : {}}> 
                        <Col xs={24} lg={24}>
                            <div className="inner_dv">
                                { state.contributors != '' && state.contributors != undefined &&
                                    state.contributors.map((e) => (
                                        <span className="dvInline">{e.name}
                                            <Button size='small' className="btn_del" onClick={(a) => btnDel('contributors',e.id, e.index)}>X</Button>
                                        </span>
                                    ))
                                } 
                            </div>                                            
                        </Col>
                    </Row>
                </Col>
                <Col xs={24} lg={5} className="label">
                    통화 단위 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={19}>
                    <Radio.Group onChange={handleChangeDetails('current_unit')} value={stateDetails.details[0].current_unit} 
                        disabled={currentUnitChk}>
                        <Radio value='KRW'>원화(KRW)</Radio>
                        <Radio value='USD'>달러(USD)</Radio>
                        <Radio value='EUR'>유로(EUR)</Radio>
                        <Radio value='GBP'>파운드(GBP)</Radio>
                        <Radio value='JPY'>엔(JPY)</Radio>
                        <Radio value='CNY'>위안(CNY)</Radio>
                    </Radio.Group>
                </Col>
                {/*단위, 단가, 수량: ‘단가 관리’가 ‘적용’인 비용 분류만 활성화*/}
                <Col xs={24} lg={5} className="label">
                    단위 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={3}>
                    <Input className="" type="text" name="unit" autoComplete="off" onChange={handleChangeDetails('unit')} 
                    disabled={inputActive == false && unitpriceUseYn =='Y' && (typeChk ==='' || typeChk === undefined) ? false : true} value={stateDetails['details'][0].unit}/> 
                </Col>
                <Col xs={24} lg={4} className="label">
                    단가 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={4}>
                     <InputNumber
                        value={stateDetails['details'][0]['unit_price']}
                        onChange={handleChangeDetails('unit_price')}
                        formatter={value => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        controls={false}
                        autoComplete="off"
                        // status='warning'
                        stringMode={false}
                        disabled={inputActive == false && unitpriceUseYn =='Y' && (typeChk ==='' || typeChk === undefined) ? false : true}
                    />
                </Col>
                <Col xs={24} lg={4} className="label">
                    수량 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={4}>
                    <InputNumber
                        value={stateDetails['details'][0]['qty']}
                        onChange={handleChangeDetails('qty')}
                        formatter={value => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        controls={false}
                        autoComplete="off"
                        disabled={inputActive == false && unitpriceUseYn =='Y' && (typeChk ==='' || typeChk === undefined) ? false : true}
                    />
                </Col>
                {/*비용 청구 분류가 ‘일반 비용 > 복지/교육 > 교육/훈련'일 경우에만 활성화*/}
                <Col xs={24} lg={5} className="label">
                    환급 대상 여부 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={19}> 
                    <Radio.Group name="refund_target_yn" value={stateDetails.details[0].refund_target_yn} onChange={handleChangeDetails('refund_target_yn')} 
                        disabled={(refundTargetActive ==false ) && (typeChk ==='' || typeChk === undefined)? false : true}>
                        <Radio value="N">환급 대상 아님</Radio>
                        <Radio value="Y">환급 대상</Radio>
                    </Radio.Group>
                </Col>

                <Col xs={24} lg={5} className="label">
                    공급가 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={3}>
                    {unitpriceUseYn === 'N' 
                        ?    <InputNumber
                                value={stateDetails['details'][0]['amount']}
                                onChange={handleChangeDetails('amount')}
                                formatter={value => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                controls={false}
                                autoComplete="off"
                            />
                            
                        : <Input className="" type="text" name="amount" autoComplete="off" disabled={true} 
                        value={stateDetails.details[0].amount!='' && stateDetails.details[0].amount != undefined ? commaNum(stateDetails.details[0].amount) : ''}
                        onChange={handleChangeDetails('amount')}/>
                    }
                </Col>

                <Col xs={24} lg={4} className="label">
                    부가세(적용 <Checkbox name="vat_yn" checked={stateDetails.details[0].vat_yn === 'Y' ? true : false}
                    disabled={inputActive ==false && stateDetails.details[0].current_unit =='KRW' && unitpriceUseYn !=='' && (typeChk ==='' || typeChk === undefined) ? false : true} 
                    onChange={handleChangeDetails('vat_yn')}></Checkbox>)
                </Col>
                <Col xs={24} lg={4}>
                    <Input className="" type="text" name="vat" 
                    value={stateDetails.details[0].vat!='' && stateDetails.details[0].vat != undefined ? commaNum(stateDetails.details[0].vat) : ''} autoComplete="off" 
                    onChange={handleChangeDetails('vat')} disabled={inputActive ==false && stateDetails.details[0].current_unit =='KRW' && unitpriceUseYn !=='' && (typeChk ==='' || typeChk === undefined) ? false : true} /> 
                </Col> 
                <Col xs={24} lg={4} className="label">
                    합계 
                </Col>
                <Col xs={24} lg={4}>
                    <Input className="" type="text" autoComplete="off" disabled={true} 
                    value={stateDetails.details[0].total_amount!='' && stateDetails.details[0].total_amount != undefined ? commaNum(stateDetails.details[0].total_amount) : ''}/>
                </Col>

                <Col xs={24} lg={5} className="label">
                    세부 내용
                </Col>
                <Col xs={24} lg={19}>
                    <Input.TextArea name="remark" rows={4} autoComplete="off" disabled={inputActive ==false && (typeChk ==='' || typeChk === undefined) ? false : true} onChange={handleChangeDetails('remark')} value={stateDetails.details[0].remark}/>
                </Col>
            </Row>
            <div style={{marginTop: '10px',marginBottom:'20px',fontWeight: '600'}}>
                <ExclamationCircleOutlined /><span style={{color: 'red'}}> 입금 받을 거래처가 같을 때</span>만 청구 내용을 추가해 주세요.(거래처가 다르면 새로 청구 추가해야 함)
                <div style={{marginTop: '10px',textAlign:'center'}}>
                    <Button type="primary" onClick={detailsAdd} disabled={(typeChk !=='' && typeChk !== undefined) && (detailsModifyNum ==='' || detailsModifyNum === undefined )? true : false}>입력한 청구 내용 반영</Button>
                </div>
            </div>

            <div id='sumTable' style={{ marginBottom: 40 }}>
                <Table
                    dataSource={state.detailsColumn}
                    columns={column}
                    rowKey={(row) => row.num}    
                    pagination={false} 
                    summary={pageData => {
                        let totalCost = 0;
                        let currency= "원화(KRW)"; 
                        
                        if(pageData != '' && pageData != undefined){
                            if(pageData[0].current_unit =='KRW'){ 
                                currency = '원화(KRW)';
                            }else if(pageData[0].current_unit =='USD'){
                                currency = '달러(USD)';
                            }else if(pageData[0].current_unit =='EUR'){
                                currency = '유로(EUR)';
                            }else if(pageData[0].current_unit =='GBP'){
                                currency = '파운드(GBP)';
                            }else if(pageData[0].current_unit =='JPY'){
                                currency = '엔(JPY)';
                            }else if(pageData[0].current_unit =='CNY'){
                                currency = '위안(CNY)';
                            } else{
                                currency= "원화(KRW)"; 
                            }
                            
                            pageData.forEach(e => {
                                totalCost += Number(e.total_amount);
                            });
                            state.totalCost = totalCost;
                        }
                        return (
                            <>
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} colSpan={2} align={'center'}><Text strong>청구 합계</Text></Table.Summary.Cell>
                                    <Table.Summary.Cell index={2} align={'left'}>{currency}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={3} align={'right'}><Text strong>{commaNum(totalCost)}</Text></Table.Summary.Cell>
                                    <Table.Summary.Cell index={4}></Table.Summary.Cell>
                                </Table.Summary.Row>
                            </>
                        );
                    }}
                />
            </div>
            
        </Wrapper>
    );
});

export default detailsList;