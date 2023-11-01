import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import {Row, Col, Drawer, Tabs, Button, Modal, Space, Table, Typography, Input} from 'antd';
import {PhoneOutlined, QuestionOutlined, UploadOutlined,} from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import moment from 'moment';

import useStore from '@stores/useStore';


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


const billingInfo = observer(({idx,  popoutClose, popoutChk ,viewVisible,  drawerChk, viewData , drawerClass}) =>{
    const { commonStore } = useStore();

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
    }));
    

    useEffect(() =>{
        fetchData(idx);
        approvalsData(idx);
    },[idx])

    const approvalsData = useCallback(async (id) => {
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
                state.approvalsType = result.data.data.type;
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

    const fetchData = useCallback(async (id) => {
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

                for (const key in result.data.data) {
                    for (const key2 in stateData) {
                        if(key == key2){
                            stateData[key] = result.data.data[key];
                        }                       
                    }
                }

                var detailsAtt = result.data.data.details;
                state.detailsData = {company: result.data.data.company, details : result.data.data.details};

                //청구내용 배열
                var text = '';
                detailsAtt.forEach((e,num) => {                    
                    e.attribution_targets.forEach(a =>{
                        text = a.attributionable_name;
                    })
                    
                    if(state.detailsList.length == 1){
                        state.detailsList = {id: num , attributionTargetsText:text, total_amount : e.total_amount, current_unit : e.current_unit};
                    }else{
                        state.detailsList.forEach()
                        state.detailsList = [...state.detailsList,{id: num , attributionTargetsText:text, total_amount : e.total_amount, current_unit : e.current_unit}]
                    }
                    classificationCode(e.class1_id, num) 
                });        
                
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
                console.log(stateData.evidence[0].total_amount)
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

    const classificationCode = useCallback(async (id, num) => {
        var axios = require('axios');
 
        var config = {
            method: 'GET',
            url:process.env.REACT_APP_API_URL +'/api/v1/billing-classification?id='+id,
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
                var class1 = result.data.data[0];
                var class2 = result.data.data[0].child.filter(e=> e.id == stateData.details[0].class2_id);
                var class3 = class2[0].children.filter(e=> e.id == stateData.details[0].class3_id);

                state.classData = {class1 : class1.name , class2 : class2[0].name , class3 : class3[0].name};

                state.detailsList.forEach(e => {
                    if(e.id == num){
                        e.detailsClassText = class1.name+' > '+class2[0].name+' > '+class3[0].name;
                    }
                });
                
            }
        })
        .catch(function (error) {
            console.log(error.response);
            Modal.error({
                title: '오류가 발생했습니다. 재시도해주세요.',
                content: '오류코드:' + error.response.status,
            });
        });
        
    });


    const column = useMemo(() => [
        {
            title: '비용 분류',
            dataIndex: 'sort',
            key:  'sort',
            render: (_, row) => <div style={{textAlign:'left'}}>{row.detailsClassText}</div>,
            align: 'center',
        },
        {
            title: '비용 귀속 대상 상품, 부서/회사',
            dataIndex: 'target',
            key:  'target',
            render: (_, row) => <div style={{textAlign:'left'}}>{row.attributionTargetsText}</div>,
            align: 'center',
        },
        {
            title: '통화 단위',
            dataIndex:  'current_unit',
            key: 'current_unit',
            render: (_, row) => <div style={{textAlign:'center'}}>
                {row.current_unit =='KRW' ? '원화(KRW)' : row.current_unit =='USD' ? '달러(USD)' : row.current_unit =='EUR' ? '유로(EUR)' : row.current_unit =='GBP' ? '파운드(GBP)' : 
                row.current_unit =='JPY' ? '엔(JPY)' : '위안(CNY)'}
            </div>,
            align: 'center',
        },
        {
            title: '합계',
            dataIndex: 'cost',
            key: 'cost',
            render: (_, row) => <div style={{textAlign:'right'}}>{commaNum(row.total_amount)}</div>,
            align: 'center',
        },
        {
            title: '작업',
            dataIndex: 'btn',
            key: 'btn',
            render: (_, row) => <div>{popoutChk !== 'Y' && <><Button size="small" onClick={(e)=>chkDrawer()}>보기</Button> </>  }</div>,
            align: 'center',
        },    
    ],[state.detailsList, popoutChk],);

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
            render: (_, row) => <div style={{textAlign:'center'}}> {row.type == 1 ? '승인' : '참조'}</div>,
            align: 'center',
            width:'10%',
        },
        {
            title: '결재자',
            dataIndex:  'approval',
            key: 'approval',
            // render: (_, row) => <div style={{textAlign:'center'}}>{row.approval_user_info.name}({row.approval_user_info.team_info[0].name}/{row.approval_user_info.position_info[0].name})</div>,
            render: (_, row) => <div style={{textAlign:'center'}}>{row.approval_user_info.name}
            ({row.approval_user_info.team_info.name}/{row.approval_user_info.position_info.name})</div>,
            align: 'center',
            width: '20%',
        },
        {
            title: '결과',
            dataIndex:  'status',
            key: 'status',
            render: (_, row) => <div style={{textAlign:'center'}}>{row.approval_result == 1 ? '승인' : row.approval_result == 2 ? '반려' : row.approval_result == 3 ?  '취소' : ''}
            {row.approval_result !='' && row.approval_result != undefined && '('+row.approval_at+')'}</div>,
            align: 'center',
            width: '5%',
        },
        {
            title: '검토내용',
            dataIndex: 'content',
            key: 'content',
            render: (_, row) => <div style={{textAlign:'center'}}>{row.remark}</div>,
            align: 'center',
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
    const chkDrawer = () => {
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
    const approvalClose = () => {
        if(drawerChk === 'Y'){
            classChkBtn();
        }      
        setApprovalVisible(false);
        // fetchData(idx)
    };



    return(
        <Wrapper>
            {/* 1:작성 중, 2:결재 대기, 3:회수, 4:결재 시작, 5:반려, 6:청구 취소, 7:결재 종료, 8:영수증 제출 대기, 9:영수증 확인 완료, 10:입금 완료(증빙 대기), 11:입금/처리 완료, 12:재무팀 취소 */}
                <Row gutter={10} className="table">
                    <Col xs={3} lg={3} className="label">청구서 코드</Col>
                    <Col xs={5} lg={5}>{stateData.billing_code}</Col>
                    <Col xs={3} lg={3} className="label">청구일</Col>
                    <Col xs={5} lg={5}>2022-11-11</Col>
                    <Col xs={3} lg={3} className="label">청구자</Col>
                    <Col xs={5} lg={5}>없음</Col>
                    <Col xs={3} lg={3} className="label">제목</Col>
                    <Col xs={21} lg={21}>{stateData.name}</Col>
                </Row>               

                <div style={{ marginTop: 40, marginBottom: 40 }}>
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
                                        <Table.Summary.Cell index={2} align={'center'}>{currency}</Table.Summary.Cell>
                                        <Table.Summary.Cell index={3} align={'right'}><Text strong>{commaNum(totalCost)}</Text></Table.Summary.Cell>
                                        <Table.Summary.Cell index={4}></Table.Summary.Cell>
                                    </Table.Summary.Row>
                                </>
                            );
                        }}
                    />
                </div>

                <Row gutter={10} className="table marginTop">
                    <div className="table_title">거래처</div>
                    <Col xs={4} lg={4} className="label">거래처 구분</Col>
                    <Col xs={20} lg={20}>{stateData.account_division == '1' ? '일반 거래처' : stateData.account_division == '2' ? '국내, 직계약 저작권자':stateData.account_division == '3' ? '해외 수입 중개자': '제작처'}</Col>
                    <Col xs={4} lg={4} className="label">성명/사업자명</Col>
                    <Col xs={20} lg={20}>{stateData.accountable.name}</Col>
                    
                    {stateData.accountable.type == '1' || stateData.accountable.type == '2' ||  stateData.accountable.type == '3'
                    ?
                    <>
                        <Col xs={4} lg={4} className="label">유형</Col>
                        <Col xs={8} lg={8}> {stateData.accountable.type == '1' ? '한국인(주민등록번호 보유)' : stateData.accountable.type == '2' ? '한국 사업자'
                                : stateData.accountable.type == '3' ? '한국 거주 외국인(외국인등록번호 보유)': stateData.accountable.type == '4' ? '해외 거주자': '해외 사업자'}</Col>
                        <Col xs={4} lg={4} className="label">주민/사업자/외국인번호</Col>
                        <Col xs={8} lg={8}>
                            {stateData.accountable.type == '1' ||  stateData.accountable.type == '3' 
                            ? stateData.accountable.person_no.substring(0,7)+'*******'
                            :  stateData.accountable.person_no 
                            }</Col>
                        <Col xs={4} lg={4} className="label">과세 구분</Col>
                        <Col xs={8} lg={8}>{stateData.accountable.taxation_type == '1' ? '사업소득' : '기타소득'}</Col>
                        <Col xs={4} lg={4} className="label">계좌 정보</Col>
                        <Col xs={8} lg={8}>
                            { stateData.etc_account_no !='' && stateData.etc_account_no != undefined 
                            ? stateData.etc_bank_id+' / '+stateData.etc_account_no+' / '+stateData.etc_depositor 
                            // :  stateData.accountable.type == '1' ||  stateData.accountable.type == '2'
                            //     ? stateData.accountable.account_no+' / '+stateData.accountable.bank+' / '+stateData.accountable.depositor
                                : stateData.accountable.account_no+' / '+stateData.accountable.bank_name_eng+' / '+stateData.accountable.depositor
                            }
                        </Col>
                    </>
                    :
                    <>
                        <Col xs={4} lg={4} className="label">유형</Col>
                        <Col xs={8} lg={8}> {stateData.accountable.type == '1' ? '한국인(주민등록번호 보유)' : stateData.accountable.type == '2' ? '한국 사업자'
                                : stateData.accountable.type == '3' ? '한국 거주 외국인(외국인등록번호 보유)': stateData.accountable.type == '4' ? '해외 거주자': '해외 사업자'}</Col>
                        <Col xs={4} lg={4} className="label">국적</Col>
                        <Col xs={8} lg={8}>{stateData.accountable.country}</Col>
                        <Col xs={4} lg={4} className="label">계좌 정보</Col>
                        <Col xs={8} lg={8}>
                            { stateData.etc_account_no !='' && stateData.etc_account_no != undefined 
                            ? stateData.etc_bank_id+' / '+stateData.etc_account_no+' / '+stateData.etc_depositor 
                            : stateData.accountable.bank_name_eng+' / '+stateData.accountable.swift_code+' / '+stateData.accountable.account_no+' / '+stateData.accountable.depositor
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
                        <Col xs={8} lg={8}>{stateData.evidence[0].submission_timing == ' 1' ? '함께 제출' : '입금/사용 후 제출' }</Col>
                        {/* {(stateData.billing_status == '8' || stateData.billing_status == '10') &&
                            <>
                                <Col xs={4} lg={4} className="label">증빙 대기 금액</Col>
                                <Col xs={8} lg={8}>{Number(state.detailsTotalAmount) - Number(state.evidenceTotalAmount) == '' ? 0 : commaNum(Number(state.detailsTotalAmount) - Number(state.evidenceTotalAmount))}</Col>                            
                            
                            { popoutChk !== 'Y' && 
                                (stateData.evidence[0].type == '1' || stateData.evidence[0].type == '2' || stateData.evidence[0].type == '3') 
                                ?
                                    <><Col xs={4} lg={4} className="label">증빙 제출</Col>
                                    <Col xs={8} lg={8}>
                                        <Button className="btn btn-primary btn_add" shape="circle" onClick={(e)=> {evidenceDrawer()}}>+</Button>    
                                    </Col></>  
                                :
                                <><Col xs={4} lg={4} className="label">증빙 금액</Col>
                                <Col xs={8} lg={8}>
                                    {receiptVisible == false ?
                                        <>  
                                            <Input type='text' style={{width: 200, marginRight: 10}} onChange={(e) => receiptPriceTrans(e.target.value) } value={evidencePrice}/>
                                            <Button onClick={()=>{setReceiptVisible(prev => !prev)}}>확인</Button>
                                        </>                                    
                                        :                                    
                                        <>
                                            <span style={{marginRight: 15}}>{evidencePrice}</span>
                                            { stateData.billing_status == '9'   
                                                ? '영수증 확인 완료'
                                                : <><Button onClick={() => pdfErawer()}>영수증 제출용 문서 다운로드</Button></>

                                            }
                                            
                                        </>
                                    }
                                </Col></>  
                            } 
                            </>
                        } */}
                    </Row>
                </div>
                
                <div style={{ marginTop: 40,marginBottom:40 }}>
                    <Table
                            // dataSource={state.approval_list}
                            dataSource={stateData.approvals}
                            columns={approval_column}
                            rowKey={(row) => row.step}    
                            pagination={false} 
                        />
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
                        { stateData.files != '' && stateData.files != undefined &&                            
                            stateData.files.map((e,num) => {
                                if(num > 0){
                                    var text = ', ';
                                }else{
                                    var text = ' ';
                                }
                                return e.file_name+text;
                            })   
                        }
                    </Col>
                </Row>

                <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20, marginBottom: 40 }}>
                    <Col>
                        {popoutChk === 'Y'
                            ?<>
                                <Button type="button" htmlType="button"  onClick={e => popoutClose('Y')} style={{marginLeft:'10px'}}>
                                    닫기
                                </Button>
                            </>
                        :                     
                            <>
                            <Button
                                htmlType="button"
                                onClick={(e)=>approvalDrawer()}
                                style={{ marginLeft: '10px' }}
                            >
                                수정
                            </Button>
                            <Button
                                htmlType="button"
                                onClick={(e)=>approvalDrawer()}
                                style={{ marginLeft: '10px' }}
                            >
                                청구 취소
                            </Button>
                            </>             
                        }
                        
                        
                    </Col>
                </Row>
        </Wrapper>
    );
})

export default billingInfo;