import React, { useCallback, useEffect, useState, useMemo, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import {Row, Col, Drawer, Tabs, Button, Modal, Space, Table, Typography, Upload, InputNumber} from 'antd';
import {ExclamationCircleOutlined, QuestionOutlined, UploadOutlined,} from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import moment from 'moment';

import useStore from '@stores/useStore';

// import {LoginChk} from "@components/Common/Js/loginChk";
import DetailsDrawer from '../../Billing/View/detailsDrawer';
import ApprovalRegistration from './ApprovalRegistration';
import ChargeCancel from '../../Billing/View/ChargeCancel';
import BillingModify from '../../Billing/Add/';

const Wrapper = styled.div`
    width: 100%;
`;

const DEF_STATE = {
    id:'',
    billing_code : '',
    name: '',       // 제목
    billing_status: '',    // 1:작성 중(임시저장), 2:결재 대기(제출)
    company:'',
    account_division: '',    // 거래처 구분 - 1:일반 거래처(매입), 2:국내, 직계약 저작권자, 3:해외 수입 중개자, 4:해외 수입 권리자, 5:제작처
    accountable_id: '',    // 거래처 ID
    accountable_type : '',
    etc_bank_id: '',    // 다른 계좌 - 은행 ID
    etc_account_no: '', // 다른 계좌 - 계좌번호
    etc_depositor: '',  // 다른 계좌 - 예금주
    monthly_payment_yn: '', // 월 결제 여부
    approval_user_remark: '',   // 결재자 참고사항
    financial_support_remark: '',   // 재무지원팀 참고사항
    use_yn: '',
    billed_id: '',
    billed_at: '',
    billed_info : [],
    created_id: '',
    updated_id: '',
    created_at: '',
    updated_at: '',
    accountable: '',
    details: [  // 비용 청구 상세
        {
            id:'',
            billing_id : '',
            company: '', // 비용 귀속 회사
            class1_id: '', // 비용청구 분류1
            class2_id: '', // 비용청구 분류2
            class3_id: '', // 비용청구 분류3
            target: '', // 비용 귀속 대상 구분 - 1:상품, 2:부서/회사
            current_unit: 'KRW',  // 통화 단위
            unit: '',           // 단위
            unit_price: '',     // 단가
            qty: '',            // 수량
            amount: '',         // 공급가
            vat_yn: '',         // 부가세 적용 여부
            vat: '',            // 부가세
            total_amount: '', // 합계
            refund_target_yn: '', // 환급대상 여부
            remark: '',         // 세부 내용
            attribution_targets: [],    // 비용 귀속 대상 ID
            created_id: '',
            updated_id: '',
            created_at: '',
            updated_at: '',
            payment_overseas: ''
        }
    ], 
    payments : '',
    files : '',
    evidence: [       // 증빙
        {
            id:'',
            billing_id : '',
            submission_timing: '',   // 증빙 제출 시점 - 1:함께 제출, 2:입금/사용 후 제출
            type: '',        // 증빙 종류 - 1:세금계산서, 2:계산서, 3:현금영수증, 4:영수증, 5:개인(원천징수)
            receipt_submission: '',  // 영수증 제출 방법 - 1:출력 영수증을 나중에 제출, 2:파일을 지금 제출
            scope: '',       // 증빙 범위 - 1:청구 금액 전체, 2:사용한 금액
            amount: '',   // 공급가
            vat: '',       // 부가세
            total_amount: '', // 합계
            use_yn:'',
            created_id: '',
            updated_id: '',
            created_at: '',
            updated_at: '',
            details: [    // 증빙 상세(세금계산서)
               
            ],
            files: [  // 증빙 파일
                
            ]
        }
    ],    
   
    
    approvals: [  // 결재선 지정
        {
            id: '',
            billing_id:'',
            step:'',
            type: '',
            approval_user_id: '',
            approval_result: '',
            approval_at: '',
            remark: '',
            read_id: '',
            read_at: '',
            use_yn: '',
            created_id: '',
            updated_id: '',
            created_at: '',
            updated_at: '',
            approval_user_info: {
                id: '',
                name: '',
                position: '',
                department:'',
                part: '',
                team: '',
                position_info: {
                    id: '',
                    name:''
                },
                department_info: {
                    id: '',
                    name:''
                },
                part_info: {
                    id: '',
                    name:''
                },
                team_info: {
                    id: '',
                    name:''
                }
            }
        }
    ]
};


const ApprovalsInfo = observer(({idx,  popoutClose, popoutChk ,onClose, viewVisible,  drawerChk, viewData , drawerClass, drawerResetChk, typeChk, typeChkType}) =>{

    const { Text } = Typography;

    const stateData = useLocalStore(() => ({ ...DEF_STATE }));

    const state = useLocalStore(() => ({
        approval_list :[],
        drawerback:'drawerWrap',

        selectTarget:[],        //비용귀속대상 리스트
        contributors:[],        //비용귀속대상 선택값 리스트

        copyData : [],  //복제 데이터일 경우
        company : [],  //부서&회사
        detailsColumn : [],  //청구입력

        detailsList : [],   //청구table내용
        detailsData : [],   //청구내용

        classData : [],
        detailsTotalAmount : 0, //청구합계(details total_amount의 합계)
        evidenceTotalAmount : 0, //증빙제출된 금액(evidence total_amount의 합계)

        approvalsType : '',      
        userInfo:[],  
        chkId : false,                     //승인id 체크
        allow_approval_target : false,  //승인대기 체크

        selectCode1 : [], //비용귀속
        chkDataNum:0,

        modifyIdx : '', //수정시 billid id

        idx : '',
        // depositResult :[{   //입금처리 해외 입금결과등록
        //     billing_detail_id: '',     // details.id
        //     deposit_krw: '',        // 입금 원화
        //     fee: ''  // 수수료}
        // }],
        depositResult :[],
        depositResultStatus : '' ,  //입금처리 해외 입금결과등록 처리 데이터
        detailsListPayment : [],    //입금처리 해외 청구내용

        billing_id : '', //청구서 id
        detail_id : '', //detail id
    }));
    
    useEffect(() =>{
        // classificationCode();    
        loginChk();    
    },[])

    useEffect(() =>{
        if(typeChk === '' || typeChk === undefined){
            state.idx = idx            
        }
        classificationCode(idx);  
        // fetchData(idx);
       
    //    console.log(LoginChk)

    },[idx,typeChk])

    //정보 불러오기
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
            state.userInfo = result.data;            
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

   
    const fetchData = useCallback(async (id) => {
        var axios = require('axios');

        var config = {
            method: 'GET',
            url:process.env.REACT_APP_API_URL +'/api/v1/billing-approvals/'+id,
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
                state.billing_id =   result.data.data.billing_id;
                //승인대상 체크     
                var chkID = 0;
                result.data.data.approvals.forEach((e,num) => {                    
                    if(e.type === '1'){
                        if(state.userInfo.id === e.approval_user_id){
                            chkID++;
                        }
                    }
                });       

                state.modifyIdx = result.data.data.billing_id
                if(typeChk !==''){
                    state.idx = result.data.data.billing_id
                }
                

                if(chkID > 0){
                    state.chkId = true;
                }else{
                    state.chkId = false;
                }

                state.allow_approval_target = result.data.data.allow_approval_target;
                for (const key in result.data.data) {
                    for (const key2 in stateData) {
                        if(key == key2){
                            stateData[key] = result.data.data[key];
                        }                       
                    }
                }

                var detailsAtt = result.data.data.details;
                state.detailsData = {company: result.data.data.company, details : result.data.data.details};
                stateData.billed_at = stateData.billed_at.substring(0,10);

                //청구내용 배열
                var text = '';
                detailsAtt.forEach((e,num) => {       
                     var depth1 = state.selectCode1.find(a=> a.id == e.class1_id);
                     console.log(depth1)
                     if(depth1 !== '' && depth1 !== undefined){
                         var depth2 = depth1.child.find(a=> a.id == e.class2_id);
                         var depth3 = depth2.children.find(a=> a.id == e.class3_id);
     
                         var depthText = depth1.name+' > '+depth2.name+' > '+depth3.name;    
                     }
                     state.classData = [...state.classData , {class1 : depth1.name, class2: depth2.name, class3: depth3.name}]     
 
                     if(e.attribution_targets.length > 1){
                          e.attribution_targets.forEach(a =>{
                             if(a.attributionable.product_code){
                                 var proudctCode = '('+a.attributionable.product_code+')'
                             }else{
                                 var proudctCode = '';
                             }
                             text = [...text, a.attributionable_name+proudctCode];
                         })
                         text= text.join(', ')
                         
                     } else{
                         if(e.attribution_targets[0].attributionable.product_code){
                             var proudctCode = '('+e.attribution_targets[0].attributionable.product_code+')'
                         }else{
                             var proudctCode = '';
                         }
                         text = e.attribution_targets[0].attributionable_name+proudctCode
                     }
                    
                     
                     if(state.detailsList.length == 0){
                        state.detailsList = [{id: num , attributionTargetsText:text, total_amount : e.total_amount, current_unit : e.current_unit, detailsClassText : depthText}];
                        state.detailsListPayment = [{id: num , attributionTargetsText:text, total_amount : e.total_amount, current_unit : e.current_unit, 
                                                        detailsClassText : depthText, deposit_krw: '', fee:'', detailsId:e.id}];
                     }else{
                        state.detailsList = [...state.detailsList,{id: num , attributionTargetsText:text, total_amount : e.total_amount, current_unit : e.current_unit, detailsClassText : depthText}]
                        state.detailsListPayment = [...state.detailsListPayment,{id: num , attributionTargetsText:text, total_amount : e.total_amount, current_unit : e.current_unit, 
                                                        detailsClassText : depthText, deposit_krw: '', fee:'', detailsId:e.id}]
                     }
                     text = '';
                 });        
                 //입금결과등록 후 2개씩 뜨는 이유 수정하기
                 console.log(state.detailsListPayment)
                 result.data.data.details.map(e=>{
                     if(e.total_amount !='' && e.total_amount != null && e.total_amount != undefined){
                         state.detailsTotalAmount = state.detailsTotalAmount+Number(e.total_amount);
                     }                    
                 })
 
                 if(result.data.data.evidence[0].details.length > 0){
                     result.data.data.evidence[0].details.map(e=>{
                         if(e.total_amount !='' && e.total_amount != null && e.total_amount != undefined){
                             state.evidenceTotalAmount = state.evidenceTotalAmount+Number(e.total_amount);
                         }                    
                     })
                 }
                 
                 stateData.evidence[0].total_amount = Number(state.detailsTotalAmount) - Number(state.evidenceTotalAmount) ;

                 var arr = []
                 if(stateData.files.length>0){
                    stateData.files.forEach(e => {
                        arr = [...arr, {uid: e.uid, name: e.file_name, file_path: e.file_path, url : '#', use_yn: e.use_yn, id : e.id}]
                    });
                    setFileList(arr)
                    console.log(arr)

                    // data.files.forEach(e => {
                    //     state.selectedFile = [ ...state.selectedFile, {uid: e.uid, name: e.file_name, file_path: e.file_path, url : '#', use_yn: e.use_yn, id : e.id}]
                    //     stateData.copyright_files = [...stateData.copyright_files, {file_name: e.file_name, file_path: e.file_path, use_yn: e.use_yn, id : e.id}]
                    //     state.fileChk++
                    // });
                    // setFileList(state.selectedFile );
                 }
                

                // var text = '';
                // detailsAtt.forEach((e,num) => {                    
                //     e.attribution_targets.forEach(a =>{
                //         text = a.attributionable_name;
                //     })
                //     if(state.detailsList.length == 0){
                //         state.detailsList = [{id: num , attributionTargetsText:text, total_amount : e.total_amount, current_unit : e.current_unit}];
                //     }else{
                //         state.detailsList = [...state.detailsList,{id: num , attributionTargetsText:text, total_amount : e.total_amount, current_unit : e.current_unit}]
                //     }
                //     // classificationCode(e.class1_id, num) 
                // });        
                
                // result.data.data.details.map(e=>{
                //     if(e.total_amount !='' && e.total_amount != null && e.total_amount != undefined){
                //         state.detailsTotalAmount = state.detailsTotalAmount+Number(e.total_amount);
                //     }                    
                // })

                // if(result.data.data.evidence[0].details.length > 0){
                //     result.data.data.evidence[0].details.map(e=>{
                //         if(e.total_amount !='' && e.total_amount != null && e.total_amount != undefined){
                //             state.evidenceTotalAmount = state.evidenceTotalAmount+Number(e.total_amount);
                //         }                    
                //     })
                // }
                
                // stateData.evidence[0].total_amount = Number(state.detailsTotalAmount) - Number(state.evidenceTotalAmount) ;
                // console.log(stateData.evidence[0].total_amount)

                // console.log(toJS(stateData))
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

    const classificationCode = useCallback(async (idx) => {
        var axios = require('axios');
 
        var config = {
            method: 'GET',
            url:process.env.REACT_APP_API_URL +'/api/v1/billing-classification',
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
                state.selectCode1 = result.data.data;
                fetchData(idx);
                // var class1 = result.data.data[0];
                // var class2 = result.data.data[0].child.filter(e=> e.id == stateData.details[0].class2_id);
                // var class3 = class2[0].children.filter(e=> e.id == stateData.details[0].class3_id);

                // state.classData = {class1 : class1.name , class2 : class2[0].name , class3 : class3[0].name};

                // state.detailsList.forEach(e => {
                //     if(e.id == num){
                //         e.detailsClassText = class1.name+' > '+class2[0].name+' > '+class3[0].name;
                //     }
                // });
                
            }
        })
        .catch(function (error) {
            if(error){
                if(error.response !== '' && error.response !== undefined){
                    var text = '오류코드:' + error.response.status;
                }else{
                    text = ''
                }
                console.log(error.response);
                Modal.error({
                    title: '오류가 발생했습니다. 재시도해주세요.',
                    content: text,
                });
            }
            
        });
        
    });

    //입금처리 해외 - 입금 결과 데이터
    const handelOnChange =useCallback((type,id,detailsId) => (e) =>{
            var arr = [];
            state.detailsListPayment.forEach((a,num) => {
                if(num === id){
                    if(type === 'deposit_krw'){
                        a.deposit_krw = e
                    }
                    if(type === 'fee'){
                        a.fee = e
                    }
                }
                arr = [...arr, a]
            });
            state.detailsListPayment = arr;
            
        },[],);



    const column = useMemo(() => [
        {
            title: '비용 분류',
            dataIndex: 'sort',
            key:  'sort',
            render: (_, row) => <div>{row.detailsClassText}</div>,
            align: 'left',
        },
        {
            title: '비용 귀속 대상 상품, 부서/회사',
            dataIndex: 'target',
            key:  'target',
            render: (_, row) => <div>{row.attributionTargetsText}</div>,
            align: 'left',
        },
        {
            title: '통화 단위',
            dataIndex:  'current_unit',
            key: 'current_unit',
            render: (_, row) => <div>
                {row.current_unit =='KRW' ? '원화(KRW)' : row.current_unit =='USD' ? '달러(USD)' : row.current_unit =='EUR' ? '유로(EUR)' : row.current_unit =='GBP' ? '파운드(GBP)' : 
                row.current_unit =='JPY' ? '엔(JPY)' : '위안(CNY)'}
            </div>,
            align: 'left',
        },
        {
            title: '합계',
            dataIndex: 'cost',
            key: 'cost',
            render: (_, row) => <div>{commaNum(row.total_amount)}</div>,
            align: 'right',
        },
        {
            title: '작업',
            dataIndex: 'btn',
            key: 'btn',
            render: (_, row) => <div>{popoutChk !== 'Y' && <><Button size="small" onClick={(e)=>chkDrawer(row)}>보기</Button> </>  }</div>,
            align: 'center',
        },    
    ],[state.detailsList, popoutChk],);
    
    const column_payment = useMemo(() => [
        {
            title: '비용 분류',
            dataIndex: 'sort',
            key:  'sort',
            render: (_, row) => <div>{row.detailsClassText}</div>,
            align: 'left',
        },
        {
            title: '비용 귀속 대상 상품, 부서/회사',
            dataIndex: 'target',
            key:  'target',
            render: (_, row) => <div>{row.attributionTargetsText}</div>,
            align: 'left',
        },
        {
            title: '통화 단위',
            dataIndex:  'current_unit',
            key: 'current_unit',
            render: (_, row) => <div>
                {row.current_unit =='KRW' ? '원화(KRW)' : row.current_unit =='USD' ? '달러(USD)' : row.current_unit =='EUR' ? '유로(EUR)' : row.current_unit =='GBP' ? '파운드(GBP)' : 
                row.current_unit =='JPY' ? '엔(JPY)' : '위안(CNY)'}
            </div>,
            align: 'left',
        },
        {
            title: '합계',
            dataIndex: 'cost',
            key: 'cost',
            render: (_, row) => <div>{commaNum(row.total_amount)}</div>,
            align: 'right',
        },
        {
            title: <span>입금 원화 <em style={{color: 'red'}}>*</em></span>,
            dataIndex: 'deposit_krw',
            key: 'deposit_krw',
            // render: (_, row) => <div style={{textAlign:'right'}}><Input name="deposit_krw" value = {state.depositResult[row.id].deposit_krw} onChange={(e)=> handelOnChange('deposit_krw',row.id)} /></div>,
            // render: (_, row) => <Input value={priceToString(state.etcPrice)} onChange={handelOnChange('deposit_krw',row.id)} />,
            // render: (_, row) => <Input value={row.deposit_krw} onChange={handelOnChange('deposit_krw',row.id)} disabled={stateData.payments.payment_status !== '3' ? true : false} />,
            render: (_, row) =><InputNumber
                                    value={row.deposit_krw}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    onChange={handelOnChange('deposit_krw',row.id, row.detailsId)} 
                                    disabled={stateData.payments.payment_status !== '3' ? true : false} 
                                    controls={false}
                                /> ,
            align: 'center',
        },
        {
            title: <span>수수료 <em style={{color: 'red'}}>*</em></span>,
            dataIndex: 'fee',
            key: 'fee',
            // render: (_, row) => <div style={{textAlign:'right'}}><Input name="fee" value = {state.depositResult[row.id].fee}  onChange={(e)=> handelOnChange('fee',row.id)} /></div>,
            // render: (_, row) => <Input value={row.fee} onChange={handelOnChange('fee',row.id)} disabled={stateData.payments.payment_status !== '3' ? true : false}/>,
            render: (_, row) =><InputNumber
                                value={row.fee}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                onChange={handelOnChange('fee',row.id, row.detailsId)} 
                                disabled={stateData.payments.payment_status !== '3' ? true : false} 
                                controls={false}
                            /> ,
            align: 'center',
        },
        {
            title: '작업',
            dataIndex: 'btn',
            key: 'btn',
            render: (_, row) => <div>{popoutChk !== 'Y' && <><Button size="small" onClick={(e)=>chkDrawer(row)}>보기</Button> </>  }</div>,
            align: 'center',
        },    
    ],[state.detailsListPayment, popoutChk],);

    const approval_column = useMemo(() => [
        {
            title: '단계',
            dataIndex: 'id',
            key:  'id',
            render: (_, row) => <div>{row.step}</div>,
            align: 'center',
            width:'5%',
        },
        {
            title: '결재 구분',
            dataIndex: 'sort',
            key:  'sort',
            render: (_, row) => <div > {row.type == 1 ? '승인' : '참조'}</div>,
            align: 'left',
            width:'8%',
        },
        {
            title: '결재자',
            dataIndex:  'approval',
            key: 'approval',
            // render: (_, row) => <div style={{textAlign:'center'}}>{row.approval_user_info.name}({row.approval_user_info.team_info[0].name}/{row.approval_user_info.position_info[0].name})</div>,
            render: (_, row) => <div>{row.approval_user_info.name}
            ({row.approval_user_info.team_info.name}/{row.approval_user_info.position_info.name})</div>,
            align: 'left',
            width: '19%',
        },
        {
            title: '결과',
            dataIndex:  'status',
            key: 'status',
            render: (_, row) => <div>{row.approval_result == 1 ? '승인' : row.approval_result == 2 ? '반려' : row.approval_result == 3 ?  '취소' : ''}
            {row.approval_result !='' && row.approval_result != undefined && '('+row.approval_at.substring(0,10)+')'}</div>,
            align: 'left',
            width: '19%',
        },
        {
            title: '검토내용',
            dataIndex: 'content',
            key: 'content',
            render: (_, row) => <div>{row.remark}</div>,
            align: 'left',
            width:'50%',
        },    
    ],[],);


    //drawer class
    const classChkBtn = (val)=>{
        drawerClass(val)     
    }

    //청구내용 보기
    const [detailsVisible, setDetailsVisible] =  useState(false);
    const detailsOnClose = () => {
        if(drawerChk === 'Y'){
            classChkBtn();
        }
        setDetailsVisible(false);
    };  
    const chkDrawer = (data) => {
        state.chkDataNum = data.id;
        if(drawerChk === 'Y'){
            classChkBtn('drawerback');
        }       
        setDetailsVisible(true);
    };


    // 천단위 자동 콤마
    const commaNum = (num) => {
        if(num){
            const number = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return number
        }else{
            return 0;
        }      
    }

    //승인반려
    const [approvalVisible, setApprovalVisible] = useState(false);
    const approvalDrawer = () => {
        if(drawerChk === 'Y'){
            classChkBtn('drawerback');
        } 
        setApprovalVisible(true);
    };  
    const approvalClose = (data) => {
        if(drawerChk === 'Y'){
            classChkBtn();
        }      
        setApprovalVisible(false);
        // if(data === 'Y'){
        //     // fetchData(idx)
        //     onClose('Y')
        // }
        if(data === 'Y'){
            state.detailsList = []
            fetchData(idx);
            // onClose('reset')
            drawerResetChk('reset')
        }
    
        
    };

    //수정
    const [modifyVisible, setModifyVisible] = useState(false);
    const modifyOnClose = () => {
        if(drawerChk === 'Y'){
            classChkBtn();
        }
        setModifyVisible(false);
    };  
    const modifyDrawer = () => {
        console.log(toJS(stateData))
        var arr =[];
        //결재선지정 재배열
        stateData.approvals.forEach(e => {
            arr = [...arr, {step : e.step,type : e.type, approval_user_id_list : e.approval_user_id}]
        });

        //detials 재배열 
        var arr2 = [];
        var arrAttribution = [];
        var attributionable = [];
        console.log(stateData.company)
        stateData.details.forEach((e,num) => {
            arr2 = [...arr2, {id: e.id, company : stateData.company, class1_id : e.class1_id,class2_id : e.class2_id,class3_id : e.class3_id, 
                target : e.target, current_unit : e.current_unit, unit : e.unit , unit_price : e.unit_price, qty : e.qty, amount : e.amount, vat_yn : e.vat_yn, 
                vat : e.vat, total_amount : e.total_amount, refund_target_yn : e.refund_target_yn, remark : e.remark, attribution_targets :e.attribution_targets}]
        });

        //evidence 재배열 
        var arr3 = [];
        var arrDetails = [];
        stateData.evidence.forEach((e,num) => {
            if(stateData.details[num].details !== '' && stateData.details[num].details !== undefined){
                stateData.details[num].details.forEach(a => {
                    arrDetails = [...arrDetails, {approval_no: a.approval_no, publisher:a.publisher, person_no : a.person_no, published_at: a.published_at, item : a.item, total_amount: a.total_amount}]
                });
            }else{
                arrDetails = [];
            }
            arr3 = [...arr3, {submission_timing : e.submission_timing, type : e.type,receipt_submission : e.receipt_submission,scope : e.scope, 
                amount : e.amount, vat : e.vat, total_amount : e.total_amount , details : arrDetails, files : e.files}]
        });


        state.updata = {
            name: stateData.name,       // 제목
            billing_status: stateData.billing_status,    // 1:작성 중(임시저장), 2:결재 대기(제출)
            account_division: stateData.account_division,    // 거래처 구분 - 1:일반 거래처(매입), 2:국내, 직계약 저작권자, 3:해외 수입 중개자, 4:해외 수입 권리자, 5:제작처
            accountable_id: stateData.accountable_id,    // 거래처 ID
            etc_bank_id: stateData.etc_bank_id,    // 다른 계좌 - 은행 ID
            etc_account_no: stateData.etc_account_no, // 다른 계좌 - 계좌번호
            etc_depositor: stateData.etc_depositor,  // 다른 계좌 - 예금주
            monthly_payment_yn: stateData.monthly_payment_yn, // 월 결제 여부
            approval_user_remark: stateData.approval_user_remark,   // 결재자 참고사항
            financial_support_remark: stateData.financial_support_remark,   // 재무지원팀 참고사항
            default_approval:stateData.default_approval,        //결재전 저장여부
            billing_files : stateData.files,
            approvals : arr,
            details : arr2,
            evidence : arr3
        }

        console.log(toJS(state.updata))
        if(drawerChk === 'Y'){
            classChkBtn('drawerback');
        }       
        setModifyVisible(true);
    };
    const modifyClose=(data)=>{
        if(data === 'Y'){
            fetchData(idx);
        }
    }

    //청구취소
    const [ChargeCancelVisible, setChargeCancelVisible] = useState(false);
    const ChargeClose = (data) => {
        if(drawerChk === 'Y'){
            classChkBtn();
        }
        setChargeCancelVisible(false)
        if(data === 'Y'){
            fetchData(idx);
            drawerResetChk('reset')
        }
    
    };
    const ChargeCancelDrawer = ()=>{
        if(drawerChk === 'Y'){
            classChkBtn('drawerback');
        } 
        setChargeCancelVisible(true);
    }

    //입금처리 해외 입금 결과 등록
    const depositResult = useCallback(async ()=> {
        var data = [];
        var cnt = 0;
        state.detailsListPayment.forEach(e => {
            if(e.deposit_krw === '' || e.deposit_krw === undefined || e.fee === '' || e.fee === '' ){
                cnt++;
            }else{
                data = [...data, {billing_detail_id: e.detailsId , deposit_krw:e.deposit_krw, fee: e.fee}]
            }   
            
        });
        if(cnt > 0){
            Modal.warning({
                title : "입금원화 또는 수수료 데이터가 등록되지 않았습니다.",
                content: "확인 후 입금 결과 등록을 해주세요.",        
            });
        }else{           
            // console.log(data)
            // return
            var axios = require('axios');

            var config = {
                method: 'POST',
                url:process.env.REACT_APP_API_URL +'/api/v1/deposit-result-overseas',
                headers:{
                    'Accept':'application/json',
                },
                    data:data
                };
            axios(config)
            .then(function(response){
                if(response.data.success !== false){
                    Modal.success({
                        title: response.data.result,
                        onOk(){
                            state.depositResultStatus = response.data.status
                            state.detailsListPayment = [];
                            // classificationCode(idx);  
                            modifyClose('Y')
                            drawerResetChk('reset')
                        },
                    });
                }else{
                    Modal.error({
                        content:(<div>
                                    <p>문제가 발생하였습니다.</p>
                                    <p>재시도해주세요.</p>
                                    <p>오류코드: {response.data.message}</p>
                                </div>)
                    });  
                }
            })
            .catch(function(error){
                console.log(error);
                // Modal.error({
                //     title : '등록시 문제가 발생하였습니다.',
                //     content : '오류코드:'+error.response.status
                // });  
            });
        }       
    })

    //파일다운
    const [fileList, setFileList] = useState([]);
    const fileReturn = (file) => {
        console.log(file)
        console.log(file.file_path)
        // fileDown(file.file_path)
        fileDown(file)
    } 
    const [loading, setLoading] = useState(false); //로딩
    const fileDown = useCallback(async (data)=> {    

        var axios = require('axios'); 
        setLoading(true);          

        var config={
            method:'POST',
            url:'/common/fileDown',
            // url:'/Billing/fileDown',
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
            setLoading(false);    
        })
        .catch(function(error){
            console.log(error.response) 
            Modal.error({
                title: '오류가 발생했습니다. 재시도해주세요.',
                content: '오류코드:'+error.response.status,  
            });
            setLoading(false); 
        });

    }, []); 

    return(
        <Wrapper>
            {/* 1:작성 중, 2:결재 대기, 3:회수, 4:결재 시작, 5:반려, 6:청구 취소, 7:결재 종료, 8:영수증 제출 대기, 9:영수증 확인 완료, 10:입금 완료(증빙 대기), 11:입금/처리 완료, 12:재무팀 취소 */}
                <Row gutter={10} className="table">
                    <Col xs={3} lg={3} className="label">청구서 코드</Col>
                    <Col xs={5} lg={5}>{stateData.billing_code}</Col>
                    <Col xs={3} lg={3} className="label">청구일</Col>
                    <Col xs={5} lg={5}>{stateData.billed_at}</Col>
                    <Col xs={3} lg={3} className="label">청구자</Col>
                    <Col xs={5} lg={5}>{stateData.billed_info !=='' && stateData.billed_info !== undefined ? stateData.billed_info.name : ''}</Col>
                    <Col xs={3} lg={3} className="label">제목</Col>
                    <Col xs={21} lg={21}>{stateData.name}</Col>
                </Row>   

                <div style={{ marginTop: 40, marginBottom: 40 }}>
                    <Row gutter={10} className="table marginTop">
                        <div className="table_title">청구 내용</div>
                        <Col xs={24} lg={24} style={{padding: 0}} className='innerCol'>
                            {(typeChk === 'payments' && typeChkType === '2' && stateData.payments.payment_status === '3') ?
                                <Table
                                    // dataSource={state.list}
                                    dataSource={state.detailsListPayment}
                                    columns={column_payment}
                                    rowKey={(row) => row.id}    
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
                            :
                                <Table
                                    // dataSource={state.list}
                                    dataSource={state.detailsList}
                                    columns={column}
                                    rowKey={(row) => row.id}    
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
                            }
                        </Col>
                    </Row>
                </div>

                <Row gutter={10} className="table marginTop">
                    <div className="table_title">거래처</div>
                    <Col xs={4} lg={4} className="label">거래처 구분</Col>
                    <Col xs={20} lg={20}>{stateData.account_division == '1' ? '일반 거래처' : stateData.account_division == '2' ? '국내, 직계약 저작권자':stateData.account_division == '3' ? '해외 수입 중개자': stateData.account_division == '5' ? '임직원' : ''}</Col>
                    <Col xs={4} lg={4} className="label">성명/사업자명</Col>
                    <Col xs={20} lg={20}>{stateData.accountable?.name}</Col>
                    
                    
                    {( stateData.account_division === '1' && (stateData.accountable.type === '1' || stateData.accountable.type === '2' || stateData.accountable.type === '3'))
                    || stateData.account_division == '2' ||  stateData.account_division === '4'
                    ?
                    <>
                        {stateData.account_division != '4' ?
                            <><Col xs={4} lg={4} className="label">유형</Col>
                            <Col xs={8} lg={8}> {stateData.accountable.type == '1' ? '한국인(주민등록번호 보유)' : stateData.accountable.type == '2' ? '한국 사업자'
                                : stateData.accountable.type == '3' ? '한국 거주 외국인(외국인등록번호 보유)': stateData.accountable.type == '4' ? '해외 거주자': '해외 사업자'}</Col></>
                        :
                            <><Col xs={4} lg={4} className="label">유형</Col>
                            <Col xs={8} lg={8}>
                                한국 사업자
                            </Col></>
                        }                       
                        <Col xs={4} lg={4} className="label">주민/사업자/외국인번호</Col>
                        <Col xs={8} lg={8}>
                            {stateData.account_division === '4' 
                            ? stateData.accountable.company_no
                            : stateData.accountable.type == '1' ||  stateData.accountable.type == '3' 
                                ? typeChk === 'payments' || typeChk === 'deposits'
                                    ? stateData.accountable.person_no
                                    : stateData.accountable.person_no.substring(0,7)+'*******'
                                :  stateData.accountable.person_no 
                                }
                        </Col>
                        <Col xs={4} lg={4} className="label">과세 구분</Col>
                        <Col xs={8} lg={8}>{stateData.accountable.taxation_type == '1' ? '사업소득' : stateData.accountable.taxation_type == '2' ? '기타소득' : stateData.accountable.taxation_type == '3' ? '면세' : '과세'}</Col>
                        <Col xs={4} lg={4} className="label">계좌 정보</Col>
                        <Col xs={8} lg={8}>
                            {stateData.etc_account_no != '' && stateData.etc_account_no != undefined 
                                ? state.etc_bank_name+' / '+stateData.etc_account_no+' / '+stateData.etc_depositor                              
                                : stateData.account_division === '4' ? 
                                    <> <Text style={{ marginRight: '5px' }}> 
                                        {stateData.accountable.bank_name} / {stateData.accountable.account_no} / {stateData.accountable.depositor}</Text>
                                    </>
                                : stateData.accountable.account_type === '1' || stateData.accountable.account_type === '' || stateData.accountable.account_type === undefined || stateData.accountable.account_type === null
                                    ?   <> <Text style={{ marginRight: '5px' }}> 
                                            {stateData.accountable.bank_name} / {stateData.accountable.account_no} / {stateData.accountable.depositor}</Text>
                                        </>
                                    :   <><Text style={{ marginRight: '5px' }}> {stateData.accountable.bank_name_eng} / {stateData.accountable.swift_code} / {stateData.accountable.account_no} / {stateData.accountable.depositor}</Text></>
                            }
                        </Col>
                    </>
                    : stateData.account_division === '5'
                        ?<>
                            <Col xs={4} lg={4} className="label">계좌 정보</Col>
                            <Col xs={20} lg={20}>
                                { stateData.accountable.bank_name !== '' && stateData.accountable.bank_name !== undefined && stateData.accountable.bank_name !== null
                                    || stateData.accountable.account_no !== '' && stateData.accountable.account_no !== undefined && stateData.accountable.account_no !== null
                                    || stateData.accountable.depositor !== '' && stateData.accountable.depositor !== undefined && stateData.accountable.depositor !== null
                                    ? <><Text style={{ marginRight: '5px' }}>{stateData.accountable.bank_name} / {stateData.accountable.account_no} / {stateData.accountable.depositor }</Text></>
                                    : ''}
                            </Col>
                        </>

                        :
                        <>
                            <Col xs={4} lg={4} className="label">유형</Col>
                            <Col xs={20} lg={20}> 
                                {stateData.account_division !== '3' ?
                                    stateData.accountable.type == '1' ? '한국인(주민등록번호 보유)' : stateData.accountable.type == '2' ? '한국 사업자'
                                    : stateData.accountable.type == '3' ? '한국 거주 외국인(외국인등록번호 보유)': stateData.accountable.type == '4' ? '해외 거주자': '해외 사업자'
                                :'해외 업체'
                                
                                }   
                            </Col>
                            <Col xs={4} lg={4} className="label">국적</Col>
                            <Col xs={8} lg={8}>{stateData.accountable.country}</Col>
                            <Col xs={4} lg={4} className="label">계좌 정보</Col>
                            <Col xs={8} lg={8}>
                                {stateData.account_division == '1' || stateData.account_division == '2' ?                                
                                    <>{stateData.accountable.bank_name_eng} / {stateData.accountable.swift_code} / {stateData.accountable.account_no} / {stateData.accountable.depositor}</>
                                :
                                    <>{stateData.accountable.purpose+' / '+stateData.accountable.bank_name_eng+' / '+stateData.accountable.swift_code+' / '+stateData.accountable.account_no+' / '+stateData.accountable.depositor}
                                    </>
                                }
                            </Col>
                        </>
                    }
                </Row>

                <div style={{ marginTop: 40, marginBottom: 20 }}>
                    <Row gutter={10} className="table marginTop">
                        <div className="table_title">증빙</div>
                        <Col xs={4} lg={4} className="label">증빙 종류</Col>
                        <Col xs={8} lg={8}>{stateData.evidence[0].type == '1' ? '세금계산서' :stateData.evidence[0].type == '2' ? '계산서' :stateData.evidence[0].type == '3' ? '현금영수증' :stateData.evidence[0].type == '4' ? '영수증' : '개인(원천징수)'}</Col>
                        <Col xs={4} lg={4} className="label">제출 시점</Col>
                        <Col xs={8} lg={8}>{stateData.evidence[0].submission_timing == '1' ? '함께 제출' : '입금/사용 후 제출' }</Col>                       
                    </Row>
                </div>

                <div style={{ marginTop: 40,marginBottom:40 }}>
                    <Row gutter={10} className="table marginTop">
                        <div className="table_title">증빙</div>
                        <Col xs={24} lg={24} style={{padding: 0}} className='innerCol'>
                            <Table
                                // dataSource={state.approval_list}
                                dataSource={stateData.approvals}
                                columns={approval_column}
                                rowKey={(row) => row.approval_user_id}    
                                pagination={false} 
                            />
                        </Col>
                    </Row>
                </div>
                
                <Row gutter={10} className="table marginTop">
                    <div className="table_title">추가 사항</div>
                    <Col xs={24} lg={5} className="label">
                        결재자 참고사항
                    </Col>
                    <Col xs={24} lg={19}>{stateData.approval_user_remark}</Col>
                    <Col xs={24} lg={5} className="label">
                        재무지원팀 참고사항
                    </Col>
                    <Col xs={24} lg={19}>{stateData.financial_support_remark}</Col>
                    <Col xs={24} lg={5} className="label">
                        파일(거래명세서 등)
                    </Col>
                    <Col xs={24} lg={19}>
                        {/* { stateData.files != '' && stateData.files != undefined &&                            
                            stateData.files.map((e,num) => {
                                if(num > 0){
                                    var text = ', ';
                                }else{
                                    var text = ' ';
                                }
                                return e.file_name+text;
                            })   
                        } */}
                        {fileList.length > 0 && 
                            <>
                                <Upload multiple={true} onPreview={fileReturn} fileList={fileList}></Upload>
                                <span className='accessFile'><ExclamationCircleOutlined/> 업로드 가능 확장자: png, pdf,xlsx | 용량 최대: 20MB</span>
                            </>
                        }

                    </Col>
                </Row>

                <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20, marginBottom: 40 }}>
                    <Col>
                        {typeChk !== '' && typeChk !== undefined
                            ? typeChk === 'payments' || typeChk === 'evidences' 
                                ?<>
                                    {popoutChk === 'Y'
                                        ?<>
                                            <Button type="primary" htmlType="button"  onClick={e => popoutClose('Y')} style={{marginLeft:'10px'}}>
                                                닫기
                                            </Button>
                                        </>
                                    : 
                                        <>
                                        {(typeChk === 'payments' && typeChkType === '2' && stateData.payments.payment_status === '3') &&

                                            <Button
                                                type="primary"
                                                htmlType="button"
                                                onClick={(e)=> depositResult()}
                                                style={{ marginRight: '10px' }}
                                            >
                                                입금 결과 등록
                                            </Button>
                                        
                                        }
                                            <Button
                                                type="primary"
                                                htmlType="button"
                                                onClick={(e)=> modifyDrawer()}
                                            >
                                                수정
                                            </Button>

                                        {/* { typeChk === 'payments' && (state.userInfo.team === '46' || state.created_id === state.userInfo.id) && */}
                                        { typeChk === 'payments' &&
                                        
                                            <Button
                                                type="primary"
                                                htmlType="button"
                                                onClick={(e)=>ChargeCancelDrawer()}
                                                style={{ marginLeft: '10px' }}
                                            >
                                                청구 취소
                                            </Button>
                                        
                                        }           
                                        </>             
                                    }
                                    </>    
                                : ''
        

                            : <>
                                {popoutChk === 'Y'
                                    ?<>
                                        <Button type="primary" htmlType="button"  onClick={e => popoutClose('Y')} style={{marginLeft:'10px'}}>
                                            닫기
                                        </Button>
                                    </>
                                : (state.allow_approval_target === true  &&  state.chkId === true) &&  
                                        <>
                                        <Button
                                            type="primary"
                                            htmlType="button"
                                            onClick={(e)=>approvalDrawer()}
                                            style={{ marginLeft: '10px' }}
                                        >
                                            승인/반려
                                        </Button>
                                    </>             
                                }
                            </>                       
                        
                        }
                        
                        
                        
                    </Col>
                </Row>

                {   detailsVisible &&
                    <DetailsDrawer 
                        detailsData={state.detailsData}
                        detailsVisible={detailsVisible}
                        detailsOnClose={detailsOnClose}
                        drawerChk={drawerChk}
                        detailsTabledata={state.detailsList}
                        classData={state.classData}
                        chkDataNum={state.chkDataNum}
                    />
                }

                { approvalVisible &&
                    <ApprovalRegistration 
                        visible={approvalVisible}
                        visibleClose={approvalClose}
                        drawerChk={drawerChk}
                        idx={idx}
                    />
                }  

                { ChargeCancelVisible &&
                    <ChargeCancel 
                        visible={ChargeCancelVisible}
                        onClose={ChargeClose}
                        drawerChk={drawerChk}
                        // idx={idx}
                        idx={state.idx}
                        createdId={state.created_id }
                        userInfoID={state.userInfo.id}
                    />
                }   

                { modifyVisible &&
                    <BillingModify 
                        visible={modifyVisible}
                        onClose={modifyOnClose}
                        modifyData = {state.updata}
                        modifyIdx = {state.modifyIdx}
                        modifyClose={modifyClose}
                        typeChk={typeChk}
                    />
                }


        </Wrapper>
    );
})

export default ApprovalsInfo;