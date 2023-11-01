/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState,useRef } from 'react';
import {Table,Space, Button,Row,Col,Modal,Input,Upload,InputNumber,Radio,Popover,Select,Checkbox,Typography,Drawer,message} from 'antd';
// import {SelectProps} from '@type/antd';
import { CloseOutlined, UploadOutlined, ExclamationCircleOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';

import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';


import BillingDetails from './detailsList'; //청구내용
import AuthorList from './evidenceList'; //거래처와 증빙
import ApprovalsList from './approvalsList'; //결재선 지정

import tooltipData from '@pages/tooltipData';


const Wrapper = styled.div`
    width: 100%;
`;

const DEF_STATE = {
    // DB Data

    billing_status: '',             // 1:작성 중(임시저장), 2:결재 대기(제출)
    name: '',                       // 제목
    company: "",                    // 비용 귀속 회사
    account_division: "",           // 거래처 구분 - 1:일반 거래처(매입), 2:국내, 직계약 저작권자, 3:해외 수입 중개자, 4:해외 수입 권리자, 5:제작처
    accountable_id: '',             // 거래처 ID
    etc_bank_id: '',                // 다른 계좌 - 은행 ID
    etc_account_no: "",             // 다른 계좌 - 계좌번호
    etc_depositor: "",              // 다른 계좌 - 예금주
    monthly_payment_yn: '',         // 월 결제 여부
    approval_user_remark: "",       // 결재자 참고사항
    financial_support_remark: '',   // 재무지원팀 참고사항
    evidence: [                     // 증빙
        
    ],
    details: [                    // 비용 청구 상세
        
    ],
    billing_files: [              // 파일(거래명세서 등)
        // {
        //     file_path: "",        // 경로(파일포함)
        //     file_name: ""         // 파일이름
        // }
    ],    
    default_approval:false,           //결재선 기본 저장
    approvals: [                  // 결재선 지정
        // {
        //     step: '',             // 단계
        //     type: "",             // 결재 구분 - 1:승인, 2:참조, 3:청구자
        //     approval_user_id_list: [] // 결재자 id
        // },
    ],
    self_approval : false       //본인 결재 여부
};


const billingDrawer = observer(({  visible, onClose, copyIdx, reset, modifyData, modifyIdx,modifyClose,typeChk }) => {
    const state = useLocalStore(() => ({
        drawerback:'drawerWrap',
    }))

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
            {visible === true ? (
                // 청구서 추가 일때
                <Drawer
                    title='청구서 작성'
                    placement='right'
                    onClose={onClose}
                    visible={visible}
                    className={state.drawerback}
                    closable={false}
                    keyboard={false}
                    extra={
                        <>
                            <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                                {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                            </Button>
                            <Button onClick={onClose}>
                                <CloseOutlined />
                            </Button>
                        </>
                    }
                >
                    <AddDrawer
                        onClose={onClose}
                        modifyChk={!visible}
                        copyIdx={copyIdx}
                        reset={reset}
                        modifyData={modifyData}
                        modifyIdx={modifyIdx}
                        modifyClose={modifyClose}
                        typeChk={typeChk}
                    />
                </Drawer>
            ) : (
                // 청구서 보기,수정에서 수정 버튼 클릭했을때
                <AddDrawer
                    modifyChk={!visible}
                    copyIdx={copyIdx}
                    reset={reset}
                    modifyData={modifyData}
                    modifyIdx={modifyIdx}
                    modifyClose={modifyClose}
                    typeChk={typeChk}
                    onClose={onClose}
                />
            )}

        </Wrapper>
    );
});

export default billingDrawer;


const AddDrawer = observer(({  visible, onClose, copyIdx, reset, modifyData, modifyIdx,modifyClose,typeChk, modifyChk }) =>{
    const { commonStore } = useStore();

    const { Text } = Typography;
    const { Option } = Select;
    const { confirm } = Modal;

    const stateData = useLocalStore(() => ({ ...DEF_STATE }));

    const state = useLocalStore(() => ({
       
        bankOption: [], //은행리스트
        drawerback:'drawerWrap',
        memberOption :[],   //결재자

        modifyData : [],      //수정 데이터일 경우
        copyData : [],      //복제 데이터일 경우
        company : [],       //부서&회사
        detailsColumn : [],  //청구입력

        detailsModify : '', //수정일때 num 체크
        totalCost : 0,
        billingFiles :'',   //파일(거래명세서 등)
        detailsCopyData : [],   //수정 또는 복제 데이터

        evidenceData: '', //거래처 데이터 담기
        defaultApproval: '', //결재선 기본저장 데이터 담기
        detailsData : [],
        copyIdx:'',

        detailsInfo : [], //수정시 기존 details 데이터
        authorDataTypeReturn : '',  //일반 거래처 월결제여부 체크

        billing_status_chk : false,

        tooltipData : '',
        userInfo:'',
    }));

    const scrollHandle = () => {
        const drawer = document.querySelector(".ant-drawer-body");
        const sumTable = document.querySelector("#sumTable");
        const botPos = sumTable.offsetTop + sumTable.offsetHeight - 50;

        drawer.scroll({top : botPos, behavior: 'smooth'});
    }

    const useDidMountEffect = (func, deps) => {
        const didMount = useRef(false);
    
        useEffect(() => {
            if (didMount.current) func();
            else didMount.current = true;
        }, deps);
    };

    useDidMountEffect(() => {
        scrollHandle();
    }, [state.detailsData]);

    useEffect(() => {
        if(tooltipData !== '' && tooltipData !== undefined){
            var data = []
            tooltipData.forEach((e,num) => {
                if(e.id === 'billingApprovals'){
                    data = [...data, (<div dangerouslySetInnerHTML={{__html: tooltipData[num].memo}}></div>)]
                }
            });
            state.tooltipData = data
        }  
        bankData();        
        memberData();       
    }, []);

    useEffect(() => {
        if((copyIdx ==='' || copyIdx === undefined) && (modifyData  ===''|| modifyData === undefined)){
            loginChk();
        }

        if(copyIdx !='' && copyIdx != undefined){ //복제일 경우
            state.copyIdx = copyIdx;
            copyData(copyIdx);
        }
        if(modifyData  !='' && modifyData != undefined){ //수정일 경우
            console.log(toJS(modifyData))
            state.modifyData = modifyData;    
            if(modifyData.billing_status !== 1){
                state.billing_status_chk = true
            }

            //데이터 담기
            for (const key in modifyData) {
                for (const key2 in stateData) {
                    if(key == key2){
                        stateData[key] = modifyData[key];
                    }                       
                }
            }           

            //거래처 데이터 담음
            state.evidenceData = {account_division : stateData.account_division,accountable_id : stateData.accountable_id,etc_bank_id : stateData.etc_bank_id,
            etc_account_no : stateData.etc_account_no,etc_depositor : stateData.etc_depositor,monthly_payment_yn : stateData.monthly_payment_yn,
            evidence : stateData.evidence};
            
            // //결재선 데이터 담기
            // state.defaultApproval = {default_approval : state.modifyData.default_approval, approvals: state.modifyData.approvals}
            state.defaultApproval = {default_approval : false, approvals: state.modifyData.approvals}

            console.log(toJS(stateData))
        }
        
        
    }, [copyIdx,modifyData]);

    //추가 후 리스트 리셋
    const resetChk = () => {
        reset(true);
    };
    
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

    const classChk=(val)=>{
        if(val === 'Y'){
            state.drawerback = 'drawerback drawerWrap';
        }else{
            state.drawerback = 'drawerWrap';
        }
    }

    const visibleClose = (val) => {
        //데이터 초기화
        for (const key in DEF_STATE) {
            stateData[key] = DEF_STATE[key];
        }
        state.bankOption = []; 
        state.memberOption =[];   
        state.copyData =[];   
        state.company ='';   
        state.detailsColumn =[];   

        state.detailsModify ='';   
        state.totalCost =0;   
        state.billingFiles ='';   
        state.detailsCopyData =[]; 

        state.evidenceData='';   
        state.defaultApproval='';   

        onClose(false);
        if(modifyData != '' && modifyData != undefined){
            if(val === 'close'){
                modifyClose()
            }else{
                modifyClose('Y')
            }
            
        }
    };

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

    //결재선 기본 저장 불러오기
    const loginChk = useCallback(async () => {
        var axios = require('axios');

        var config = {
            method: 'POST',
            url: process.env.REACT_APP_API_URL +'/api/v1/login-check',
            headers: {
                'Content-type': 'application/json',
            },
        };

        axios(config)
        .then(function (result) {
            if(result.data.company === 22){
                stateData.company = 'G'
            }else if(result.data.company === 23){
                stateData.company = 'S'
            }
            state.userInfo = result.data
            defaultapproval(result.data.id);
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

    const defaultapproval = useCallback(async (id) => {
        var axios = require('axios');

        var config = {
            method: 'GET',
            url:process.env.REACT_APP_API_URL +'/api/v1/billing-default-approvals/'+id,
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
                //결재선 기본 저장값 같이 담아서 보내기          
                if(result.data.data !='' && result.data.data != undefined){
                    stateData.approvals = result.data.data;
                    stateData.default_approval = true;
                    state.defaultApproval= {default_approval : true, approvalsLogin: result.data.data};
                }else{
                    stateData.default_approval = false;
                }
              
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
        //재직중인 사람만 불러오기
        const result = await axios.get(
        process.env.REACT_APP_API_URL +'/api/v1/users?display=500&page=1&sort_by=date&order=desc&work_state=33',
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
                label: e.name+"("+e.department+"/"+e.position+")",
                value: Number(e.id),
            });
        });

        state.memberOption = options;
    }, []);

    const copyData = useCallback(async (id) => {
        var axios = require('axios');

        var config = {
            method: 'GET',
            url:process.env.REACT_APP_API_URL +'/api/v1/billings/'+id,
            headers: {
                Accept: 'application/json',
            },
        };

        axios(config)
        .then(function (result) {
            console.log(result.data.data)
            if (result.data.success === false) {
                Modal.error({
                    title: '오류가 발생했습니다.',
                    content: '오류코드:' + result.data.message,
                });
            } else {                    
                state.copyData = result.data.data;    

                //결재선지정 재배열
                var arr = [];
                state.copyData.approvals.forEach(e => {
                    if(e.type === '2'){
                        arr = [...arr, {step : e.step,type : e.type,approval_user_id_list : toJS(e.approval_user_id)}]
                    }else{
                        arr = [...arr, {step : e.step,type : e.type,approval_user_id_list : toJS(e.approval_user_id)}]
                    }
                    
                });

                //detials 재배열 
                var arr2 = [];
                var pay = 0;
                for (var i =0; i < result.data.data.details.length; i++){
                    for (const key3 in result.data.data.details[i]) {
                        if(key3 != 'id' && key3 != 'created_at' && key3 != 'created_id' && key3 != 'payment_overseas' && key3 != 'updated_at' && key3 != 'updated_id'  && key3 != 'billing_id'){
                            arr2 = {...arr2, [key3] : result.data.data.details[i][key3]};                           
                        }                              
                    }
                    pay = Number(pay) + Number( result.data.data.details[i].total_amount)
                }

                //데이터 담기
                for (const key in result.data.data) {
                    for (const key2 in stateData) {
                        if(key == key2){
                            stateData[key] = result.data.data[key];
                        }                       
                    }
                }           

                //복제시 파일 정보 삭제
                stateData.billing_files = [];
                stateData.evidence[0].files = [];
                
                stateData.approvals = arr;
                stateData.details = [arr2];

                //거래처만 담기
                stateData.evidence = [];
                //거래처 데이터 담음
                state.evidenceData = {account_division : stateData.account_division,accountable_id : stateData.accountable_id,etc_bank_id : stateData.etc_bank_id,
                etc_account_no : stateData.etc_account_no,etc_depositor : stateData.etc_depositor,monthly_payment_yn : stateData.monthly_payment_yn,
                evidence : []};
                
                //결재선 데이터 담기
                // state.defaultApproval = {default_approval : 'N', approvals: arr}
                state.defaultApproval = {default_approval : false, approvals: arr}
                state.totalCost = pay;

                console.log(toJS(stateData))
                console.log(toJS(state.evidenceData))
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

    const handleChangeInput = useCallback((type) => (e) => {
        if(type == 'company'){
            stateData[type] = e.target.value;  
        }else if(type == 'name'){
            stateData[type] = e.target.value;

        }else if(type == 'approval_user_remark' || type == 'financial_support_remark'){
            stateData[type] = e.target.value;
        }else{
 
            stateData[type] = e.target.value;
        }

        
    },[],);

    //파일 업로드
    const [billingFileList, setBillingFileList] = useState([]);

    const billingProps = {
        onRemove: (file) => {
            //삭제 파일 재배열
            var arr = [];
            state.billingFiles.forEach(e => {
                if(e.uid != file.uid){
                    arr = [...arr, e]                    
                }                
            });
            setBillingFileList(arr);
            state.billingFiles = arr;
        },
        beforeUpload: (file) => {
            state.billingFiles = [...state.billingFiles, file];
                      
            setBillingFileList(state.billingFiles)
            return false;
        },
        fileList:billingFileList,
    }; 

    //청구내용 데이터 리턴
    const detailsDataReturn=(data, num,totalCost )=>{
        console.log(toJS(stateData.details))
        console.log(toJS(state.detailsData))
        console.log(toJS(data))
        if(typeof num === 'string' || num === ''){
            if(num == 'del'){
                // stateData.details = data;  
                if(data.length === 0){
                    state.detailsData = [];
                    stateData.details= []
                }else{
                    state.detailsData = data;
                }                
            }else{
                data.details.forEach(e => {
                    e.company = data.company
                });
                stateData.company = data.company;
                if(state.detailsData === '' || state.detailsData === undefined  || state.detailsData.length === 0){
                    state.detailsData = stateData.details;
                }                 
                state.detailsData = [...state.detailsData,data.details[0]];  

                state.totalCost = totalCost
            }
        }else{
            if(state.detailsData === '' || state.detailsData === undefined  || state.detailsData.length === 0){
                state.detailsData = stateData.details;
            }  

            state.detailsData[num] = data;
            state.totalCost = totalCost
            
        }

        console.log(state.totalCost)
        console.log(toJS(state.detailsData))
        console.log(toJS(stateData))
        
    }

    //거래처증빙 데이터 리턴
    const authorDataReturn=(data)=>{
        console.log(data)
        stateData.account_division = data.account_division;
        stateData.accountable_id = data.accountable_id;
        stateData.etc_bank_id = data.etc_bank_id;
        stateData.etc_depositor = data.etc_depositor;
        stateData.etc_account_no = data.etc_account_no;
        stateData.monthly_payment_yn = data.monthly_payment_yn;
        stateData.evidence = data.evidence;
        console.log(stateData)
    }

    const authorDataTypeReturn=(data)=>{
        state.authorDataTypeReturn = data;
    }
   
    //결재선 지정
    const approvalsDataReturn=(data)=>{
        stateData.default_approval=data.default_approval ;
        stateData.approvals=data.approvals ;
    }

    //등록
    const handleChkSubmit = useCallback(async (e, idx)=> {
        console.log(toJS(state.detailsData))
        console.log(toJS(stateData.details))

        //1:작성 중, 2:결재 대기, 3:회수, 4:결재 시작, 5:반려, 6:청구 취소, 7:결재 종료, 8:영수증 제출 대기, 9:영수증 확인 완료, 10:입금 완료(증빙 대기), 11:입금/처리 완료, 12:재무팀 취소
        if(e == 'save'){
            stateData.billing_status = '2'
        }else if(e == 'collect'){ 
            stateData.billing_status = '3'
        }else{
            stateData.billing_status = '1'
        }

        //파일 있을 경우
        if(stateData.billing_files.length > 0){
            var fileArr = []
            stateData.billing_files.forEach(e => {
                fileArr = [...fileArr, {file_name : e.file_name, file_path : e.file_path}]    
            });

            for (const key3 in stateData) {
                if(key3 == 'billing_files' ){
                    stateData[key3] = fileArr;
                }
            }
        }
        
        //결재선 값이 없으면 스스로결재종료
        var selfChk = 0;
        if(stateData.approvals.length === 0){
            selfChk++
        }else{
            stateData.approvals.forEach(e => {
                if((e.type === '' || e.type === undefined) && e.approval_user_id_list.length === 0){
                    selfChk++
                }else{
                    if(Array.isArray(e.approval_user_id_list) === false){
                        e.approval_user_id_list = e.approval_user_id_list
                    } 
                }             
            });
        }

        if(selfChk > 0 ){
            stateData.approvals = []
            if(stateData.billing_status !== '1'){     
                stateData.self_approval = true
            }else{
                stateData.self_approval = false
            }       
        }else{
            stateData.self_approval = false
        }


        if(state.detailsData != '' && state.detailsData != undefined){
            stateData.details = state.detailsData;
            
        }else{           
            //복제일경우 재배열
            if((modifyData !== '' && modifyData !== undefined)){
                var arr = [];
                for (const key3 in stateData) {
                    if(key3 != 'company' ){
                        arr = {...arr, [key3] : toJS(stateData[key3])};
                    }
                }

                console.log(toJS(arr))
            }else{
                var arr2 = []
                stateData.details.forEach(e => {
                    var chkAtt = 0;
                    e.attribution_targets.forEach(a => {
                        if(a.attributionable_id !== '' && a.attributionable_id !== undefined){
                            arr2 = [...arr2, a.attributionable_id]
                        }else{
                            chkAtt++;
                        }             
                    });
                    if(chkAtt === 0){
                        e.attribution_targets = arr2
                    }                    
                    arr2 = [];                
                });    
                console.log(toJS(stateData.details))
            }
        }   
        
      
        console.log(toJS(stateData))
        console.log(toJS(arr))
        // return;
        
        let chkVal = true;       

        if(stateData.billing_status === '1'){
            if(stateData.name == ''){
                Modal.error({
                    content: '제목을 작성해주세요.',        
                });
                chkVal = false;
                return;
            }
            
            if( stateData.self_approval === true){
                if(stateData.details == '' || stateData.details == undefined || stateData.company ==''){
                    Modal.error({
                        content: '청구 내용은 반드시 하나 이상이 등록되어야 합니다.',        
                    });
                    chkVal = false;
                    return;
                }

                if(stateData.account_division == '' || stateData.account_division == undefined || stateData.account_division == null){
                    Modal.error({
                        content: '거래처를 지정해주세요.',        
                    });
                    chkVal = false;
                    return;
                }
    
                if(stateData.accountable_id == '' || stateData.accountable_id == undefined || stateData.accountable_id == null){
                    Modal.error({
                        content: '거래처를 지정해주세요.',        
                    });
                    chkVal = false;
                    return;
                }
    
                if(stateData.evidence == '' || stateData.evidence == undefined ){
                    Modal.error({
                        content: '증빙을 추가해 주세요',        
                    });
                    chkVal = false;
                    return;
                }
                
            }            
              
        }else{
           
            if((modifyData !== '' && modifyData !== undefined) || (copyIdx !== '' && copyIdx !== undefined)){
                if(stateData.details == '' || stateData.details == undefined ){
                    Modal.error({
                        content: '청구 내용은 반드시 하나 이상이 등록되어야 합니다.',        
                    });
                    chkVal = false;
                    return;
                }

            }else{
                if(stateData.details == '' || stateData.details == undefined || stateData.company ==''){
                    Modal.error({
                        content: '청구 내용은 반드시 하나 이상이 등록되어야 합니다.',        
                    });
                    chkVal = false;
                    return;
                }
            }

            if(stateData.account_division == '' || stateData.account_division == undefined || stateData.account_division == null){
                Modal.error({
                    content: '거래처를 지정해주세요.',        
                });
                chkVal = false;
                return;
            }

            if(stateData.accountable_id == '' || stateData.accountable_id == undefined || stateData.accountable_id == null){
                Modal.error({
                    content: '거래처를 지정해주세요.',        
                });
                chkVal = false;
                return;
            }

            if(stateData.accountable_id == '' ){
                Modal.error({
                    content: '성명/사업자명을 작성해주세요.',        
                });
                chkVal = false;
                return;
            }
            if(stateData.monthly_payment_yn == '' && ((stateData.account_division == 1 && (state.authorDataTypeReturn === '1' || state.authorDataTypeReturn === '2' || state.authorDataTypeReturn === '3')) || stateData.account_division == 2 || stateData.account_division == 4 )){
                Modal.error({
                    content: '월 결제 여부를 선택해주세요.',        
                });
                chkVal = false;
                return;
            }

            if(stateData.evidence == '' || stateData.evidence == undefined ){
                Modal.error({
                    content: '증빙을 추가해 주세요',        
                });
                chkVal = false;
                return;
            }
        }
        // return;
        if(chkVal == true){
            if((stateData.approvals == '' || stateData.approvals == undefined ) && stateData.billing_status !== '1'){
                confirm({
                    title: '결재선이 없습니다. ',
                    content: '그래도 제출하시겠습니까?',
                    onOk() {
                        // if((stateData.billing_files !='' && stateData.billing_files != undefined) || (stateData.evidence.files !='' && stateData.evidence.files != undefined)){
                        if((state.billingFiles !='' && state.billingFiles != undefined) || (stateData.evidence.length > 0 && (stateData.evidence[0].files !='' && stateData.evidence[0].files != undefined))){
                            handelFileSubmit(idx,arr);
                        }else{
                            handleApiSubmit(idx,arr);
                        }
                    },
                    onCancel() {
                        
                    },
                });
            }else{
                if((state.billingFiles !='' && state.billingFiles != undefined) || (stateData.evidence.length > 0 && (stateData.evidence[0].files !='' && stateData.evidence[0].files != undefined))){
                    handelFileSubmit(idx,arr);
                }else{
                    handleApiSubmit(idx,arr);
                }
            }           
            
        }       
       
   
    }, []);     

    const [loading, setLoading] = useState(false); //로딩
    const handelFileSubmit = useCallback(async (idx,data) => {
        const formData = new FormData();
        formData.append('topUploadFolder', 'billing_approvals');              

        var cnt = 0;

        if(state.billingFiles.length > 0){
            state.billingFiles.forEach((file) => {
                formData.append('files_billing[]', file);
            });
            cnt++;
        }

        if(stateData.evidence[0].files.length > 0){
            formData.append('uploadFolder', 'evidence');   
            stateData.evidence[0].files.forEach((file) => {
                formData.append('files_evidence[]', file);
            });
            cnt++;
        }

        setLoading(true); 


        if(cnt == 0){  
            handleApiSubmit(idx);
        }else{ //파일이 등록될 경우
            var axios = require('axios');

            var config = {
                method: 'POST',
                url: '/billing/file_upload',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                data: formData,
            };
    
            axios(config)
            .then((res) => {
    
                if(res.data.error !== '' && res.data.error !== undefined){
                    Modal.error({
                        title: '파일 등록시 오류가 발생하였습니다.',
                        content: res.data.error,
                    });
                }else{
                    if(data !== '' && data !== undefined){
                        data.billing_files = res.data.files_billing !=='' && res.data.files_billing != undefined ? 
                        data.billing_files.concat(res.data.files_billing) : data.billing_files;  
                        data.evidence[0].files = res.data.files_evidence !=='' && res.data.files_evidence != undefined ? res.data.files_evidence : data.evidence[0].files; 
                    }else{
                        stateData.billing_files = res.data.files_billing !=='' && res.data.files_billing != undefined ? 
                        stateData.billing_files.concat(res.data.files_billing) : stateData.billing_files;  
                        stateData.evidence[0].files = res.data.files_evidence !=='' && res.data.files_evidence != undefined ? res.data.files_evidence : stateData.evidence[0].files; 
                    }

                    handleApiSubmit(idx,data);
                }   
                
            })
            .catch(function (error) {
                console.log(error);
                Modal.error({
                    content: '파일 등록시 오류가 발생하였습니다. 재시도해주세요.',
                });
            })
            .finally(() => {
                setLoading(false); 
            });
        }
       
    }, []);

    const handleApiSubmit = useCallback(async (idx,val)=> {
        if(val !=='' && val !== undefined){
            var data = val
        }else{
            var data = toJS(stateData);
        }

        // console.log(toJS(data))
        // console.log(toJS(val))
        // return
        var axios = require('axios');

        if(id!='' && id != undefined || modifyData !='' && modifyData!= undefined){
            var method = 'PUT';
            var id = modifyIdx;
        }else{
            var method = 'POST'
            var id = '';
        }
        // return
        var config={
            method:method,
            url:process.env.REACT_APP_API_URL +'/api/v1/billings/'+id,
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
                        if(modifyData === '' || modifyData === undefined){
                            resetChk();
                        }          
                        if(modifyIdx !== '' && modifyIdx !== undefined){
                            visibleClose('close');
                        }  else{
                            visibleClose();
                        }

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
            
    }, []);     

    return(
        <>
            <Row gutter={10} className="table">                
                <Col xs={24} lg={5} className="label">
                    제목 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={19}>
                    <Input className="tableInput widfull" type="text" name="name" autoComplete="off" onChange={handleChangeInput('name')} value={stateData.name} /> 
                </Col>
            </Row>
            {/* <div style={{marginTop: '10px',marginBottom:'20px',fontWeight: '600'}}><ExclamationCircleOutlined /> 제목으로 묶인 단위로 결재가 진행됩니다. 성격이 다른 건은 청구서를 새로 작성해 주세요.</div> */}

            {/* 청구 내용 */}
            <BillingDetails  detailsData={state.detailsData} copyDetailsData={stateData.details} detailsDataReturn ={detailsDataReturn} tooltip={state.tooltipData[0]} 
                company={stateData.company} typeChk={typeChk}/>        

            {/* 청구내용이 있을 경우 아래내용 활성화 */}
            { (state.detailsData.length > 0 || copyIdx !== '')&&  
                // 거래처와 증빙             
                <><AuthorList totalCost={state.totalCost} authorData={authorDataReturn} bankData={state.bankOption} 
                tooltip={[state.tooltipData[1],state.tooltipData[2],state.tooltipData[3]]} classChkBtn={classChkBtn}  evidenceData={toJS(state.evidenceData)} typeChk={typeChk} authorDataType={authorDataTypeReturn}
                userInfo={state.userInfo}/>                 
                

                {/* 결재선 지정  */}
                <ApprovalsList approvalsData={state.defaultApproval} approvalsDataReturn={approvalsDataReturn} tooltip={[state.tooltipData[4],state.tooltipData[5]]} 
                memberOption={state.memberOption} typeChk={typeChk} />        

            
                <Row gutter={10} className="table marginTop">
                    <div className="table_title">추가 사항</div>
                    <Col xs={24} lg={5} className="label">
                        결재자 참고사항
                    </Col>
                    <Col xs={24} lg={19}>
                        <Input.TextArea name="approval_user_remark" value={stateData.approval_user_remark} rows={4} autoComplete="off" 
                        onChange={handleChangeInput('approval_user_remark')} disabled={typeChk !=='' && typeChk !== undefined ? true : false}/>
                    </Col>
                    <Col xs={24} lg={5} className="label">
                        재무지원팀 참고사항
                    </Col>
                    <Col xs={24} lg={19}>
                        <Input.TextArea name="financial_support_remark" value={stateData.financial_support_remark} rows={4} autoComplete="off"  
                        onChange={handleChangeInput('financial_support_remark')}  disabled={typeChk !=='' && typeChk !== undefined  ? true : false}/>
                    </Col>
                    <Col xs={24} lg={5} className="label">
                        파일(거래명세서 등)
                    </Col>
                    <Col xs={24} lg={19}>
                        <Upload {...billingProps} multiple={true}>
                            <Button className='ant-btn-etc-single' icon={<UploadOutlined />}>파일</Button>
                        </Upload>
                        <span className='accessFile'><ExclamationCircleOutlined/> 업로드 가능 확장자: png, pdf,xlsx | 용량 최대: 20MB</span>
                    </Col>

                </Row></>
            }
            
            <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                <Col>
                    {state.billing_status_chk === false &&
                        <Button
                            type="primary"
                            htmlType="button"
                            onClick={(e)=>handleChkSubmit('','')}
                        >
                            임시 저장
                        </Button>
                    }
                    <Button
                        type="primary"
                        htmlType="button"
                        style={{ marginLeft: '10px' }}
                        onClick={(e)=>handleChkSubmit('save','')}
                    >
                        제출
                    </Button>
                    <Button  
                        htmlType="button"
                        onClick={onClose}
                        style={{ marginLeft: '10px' }}
                    >
                        취소
                    </Button>
                    
                </Col>
            </Row>
        </>

    );
})