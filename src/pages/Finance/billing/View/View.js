import React, { useState, useMemo } from 'react'
import {Row, Col, Button, Drawer, Table, Typography, Input} from 'antd'
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import Evidence from '../evidence';

const Wrapper = styled.div`
    width: 100%;height:100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
    #tplBtnViewMode {
        display: none;
    }
`;

const DEF_STATE = {
    billing_status: '',    // 1:작성 중(임시저장), 2:결재 대기(제출)
    name: '',       // 제목
    account_division: '',    // 거래처 구분 - 1:일반 거래처(매입), 2:국내, 직계약 저작권자, 3:해외 수입 중개자, 4:해외 수입 권리자, 5:제작처
    accountable_id: '',    // 거래처 ID
    etc_bank_id: '',    // 다른 계좌 - 은행 ID
    etc_account_no: '', // 다른 계좌 - 계좌번호
    etc_depositor: '',  // 다른 계좌 - 예금주
    monthly_payment_yn: '', // 월 결제 여부
    approval_user_remark: '',   // 결재자 참고사항
    financial_support_remark: '',   // 재무지원팀 참고사항
    evidence: [       // 증빙
        {
            submission_timing: '',   // 증빙 제출 시점 - 1:함께 제출, 2:입금/사용 후 제출
            type: '',        // 증빙 종류 - 1:세금계산서, 2:계산서, 3:현금영수증, 4:영수증, 5:개인(원천징수)
            receipt_submission: '',  // 영수증 제출 방법 - 1:출력 영수증을 나중에 제출, 2:파일을 지금 제출
            scope: '',       // 증빙 범위 - 1:청구 금액 전체, 2:사용한 금액
            amount: '',   // 공급가
            vat: '',       // 부가세
            total_amount: '', // 합계
            details: [    // 증빙 상세(세금계산서)
                {
                    approval_no: '',    // 승인번호
                    publisher: '',    // 공급/발행자
                    person_no: '',    // 사업자 등록번호
                    published_at: '',  // 발행/사용일
                    item: '',        // 품목
                    total_amount: '' // 합계
                }
            ],
            files: [  // 증빙 파일
                {
                    file_path: '',   // 경로(파일포함)
                    file_name: ''          // 파일이름
                }
            ]
        }
    ],
    details: [  // 비용 청구 상세
        {
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
            attribution_targets: []    // 비용 귀속 대상 ID
        }
    ], 
    billing_files: [  // 파일(거래명세서 등)
        {
            file_path: '',  // 경로(파일포함)
            file_name: ''     // 파일이름
        }
    ],
    
    approvals: [  // 결재선 지정
        {
            step: '',  // 단계
            type: '',    // 결재 구분 - 1:승인, 2:참조, 3:청구자
            approval_user_id_list: [] // 결재자 id
        },
        {
            step: '',
            type: '',
            approval_user_id_list: []
        }
    ]
};

const View = observer(({visible, visibleClose}) => {
    const { Text } = Typography;

    const stateData = useLocalStore(() => ({ ...DEF_STATE }));
    
    const state = useLocalStore(() => ({
        list: [
            {
                id:0,
                sort:'마케팅 > 강연/행사 > 홍보/진행비',
                target:'국어학습서팀',
                currency:'원화(KRW)',
                cost:550000
            },
            {
                id:1,
                sort:'마케팅 > 광고/홍보 > 서점 광고 - 온라인',
                target:'기적의 한글학습(GBO1A2C), 기적의 계산법(GBO1A2C)',
                currency:'원화(KRW)',
                cost:2200000
            }
        ],
        approval_list :[
            {
                id:0,
                sort:1,
                approval:'허두영(IT자원팀/팀장)',
                status: 1,
                date: "2022.10.11",
                content: `예정 대비 비용이 줄었네요. 수고하셨습니다.
                이후 과정은 연관 부서와 잘 협의해서 진행 바랍니다.`
            },
            {
                id:1,
                step:2,
                approval:'장한규(경영지원본부/본부장)',
                status: 1,
                date: "2022.10.11",
                content: `예정 대비 비용이 줄었네요. 수고하셨습니다.
                이후 과정은 연관 부서와 잘 협의해서 진행 바랍니다.`
            }
        ],
        bankOption: [], //은행리스트
        drawerback:'drawerWrap',
        selectCode1:[],
        selectCode2:[],
        selectCode3:[],
        code1Data:[],
        code2Data:[],
        code3Data:[],

        selectTarget:[],        //비용귀속대상 리스트
        contributors:[],        //비용귀속대상 선택값 리스트

        copyData : [],  //복제 데이터일 경우
        company : [],  //부서&회사
        detailsColumn : [],  //청구입력
    }));

    const commaNum = (num) => {
        if(num){
            const number = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return number
        }else{
            return 0;
        }      
    }

    const receiptPriceTrans = (num) =>{
        let price = num.replace(/\,/g, "")
        setEvidencePrice(commaNum(price));
    }

    const column = useMemo(() => [
        {
            title: '비용 분류',
            dataIndex: 'sort',
            key:  'sort',
            render: (_, row) => <div style={{textAlign:'left'}}>{state.code1Data.name+' > '+state.code2Data.name+' > '+state.code3Data.name}</div>,
            align: 'center',
        },
        {
            title: '비용 귀속 대상 상품, 부서/회사',
            dataIndex: 'target',
            key:  'target',
            render: (_, row) => <div style={{textAlign:'left'}}>{state.contributors}</div>,
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
            render: (_, row) => <div><Button size="small" onClick={(e)=>detailschange('modify',row)}>수정</Button> <Button size="small" onClick={(e)=>detailschange('copy',row)}>복제</Button> <Button size="small" onClick={detailschange('del',row)}>삭제</Button></div>,
            align: 'center',
        },    
    ],[],);

    const approval_column = useMemo(() => [
        {
            title: '단계',
            dataIndex: 'id',
            key:  'id',
            render: (_, row) => <div>{row.id + 1}</div>,
            align: 'center',
            width:'5%',
        },
        {
            title: '결재 구분',
            dataIndex: 'sort',
            key:  'sort',
            render: (_, row) => <div style={{textAlign:'center'}}> {row.sort == 1 ? '승인' : '참조'}</div>,
            align: 'center',
            width:'10%',
        },
        {
            title: '결재자',
            dataIndex:  'approval',
            key: 'approval',
            render: (_, row) => <div style={{textAlign:'center'}}>{row.approval}</div>,
            align: 'center',
            width: '20%',
        },
        {
            title: '결과',
            dataIndex:  'status',
            key: 'status',
            render: (_, row) => <div style={{textAlign:'center'}}>{row.status == 1 ? '승인' : '참조'}({row.date})</div>,
            align: 'center',
            width: '5%',
        },
        {
            title: '검토내용',
            dataIndex: 'content',
            key: 'content',
            render: (_, row) => <div style={{textAlign:'center'}}>{row.content}</div>,
            align: 'center',
            width:'50%',
        },    
    ],[],);

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

    const [receiptVisible, setReceiptVisible] = useState(false);
    const [receiptVisible2, setReceiptVisible2] = useState(false);
    const [evidencePrice, setEvidencePrice] = useState(null);
    const [pdfVisible, setPdfVisible] = useState(false);

    
    const [evidence, setEvidence] = useState(false);
    const evidenceDrawer = () => {
        classChkBtn('drawerback');
        setEvidence(true);
    };
    
    const evidenceClose = () => {
        classChkBtn();
        setEvidence(false);
    }

    const pdfClose = () => {
        setPdfVisible(false);
    }


    const detailschange= (type,val)=>{
        if(type == 'modify'){

        }else if(type == 'copy'){
            
        }else{
            if(stateData.details.length > 0){
                // stateData.details.map((e, index) => {
                //     if(index !== row){
                //     }
                // })
            }
            
        }
    }

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
            <Drawer
                title='보기 / 수정'
                placement='right'
                onClose={visibleClose}
                visible={visible}
                className={state.drawerback}
                closable={false}
                keyboard={false}
                extra={
                    <>
                        <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={visibleClose}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >

                <Row gutter={10} className="table">
                    <Col xs={3} lg={3} className="label">청구서 코드</Col>
                    <Col xs={5} lg={5}></Col>
                    <Col xs={3} lg={3} className="label">청구일</Col>
                    <Col xs={5} lg={5}></Col>
                    <Col xs={3} lg={3} className="label">청구자</Col>
                    <Col xs={5} lg={5}></Col>
                    <Col xs={3} lg={3} className="label">제목</Col>
                    <Col xs={21} lg={21}></Col>
                </Row>

                <div style={{ marginTop: 40, marginBottom: 40 }}>
                    <Table
                        // dataSource={state.list}
                        dataSource={stateData.details}
                        columns={column}
                        rowKey={(row) => row.id}    
                        pagination={false} 
                        summary={pageData => {
                            let totalCost = 0;
                            let currency= "원화(KRW)"; 
                            // if(pageData != '' && pageData != undefined){
                            //     console.log(pageData)
                            //     // if(currency!='')currency = pageData[0].current_unit;
                            //     pageData.forEach(({ e }) => {
                            //         console.log(e)
                            //         // var pay = e.total_amount.replace(/,/g, '');
                            //         // totalCost += pay;
                            //     });
                            // }
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
                    <Col xs={20} lg={20}>일반 거래처</Col>
                    <Col xs={4} lg={4} className="label">성명/사업자명</Col>
                    <Col xs={20} lg={20}></Col>
                    <Col xs={4} lg={4} className="label">유형</Col>
                    <Col xs={8} lg={8}>한국인</Col>
                    <Col xs={4} lg={4} className="label">주민/사업자/외국인번호</Col>
                    <Col xs={8} lg={8}>720619-*******</Col>
                    <Col xs={4} lg={4} className="label">과세 구분</Col>
                    <Col xs={8} lg={8}>사업소득</Col>
                    <Col xs={4} lg={4} className="label">계좌 정보</Col>
                    <Col xs={8} lg={8}>국민은행 / 123-12-123456 / 홍길동</Col>
                </Row>

                <div style={{ marginTop: 40, marginBottom: 20 }}>
                    <Row gutter={10} className="table marginTop">
                        <div className="table_title">증빙</div>
                        <Col xs={4} lg={4} className="label">증빙 종류</Col>
                        <Col xs={8} lg={8}>세금계산서</Col>
                        <Col xs={4} lg={4} className="label">제출 시점</Col>
                        <Col xs={8} lg={8}>입금/사용 후 제출</Col>
                        <Col xs={4} lg={4} className="label">증빙 대기 금액</Col>
                        <Col xs={8} lg={8}>500,000</Col>
                        <Col xs={4} lg={4} className="label">증빙 제출</Col>
                        <Col xs={8} lg={8}><Button onClick={stateData.details === '영수증'? ()=>{setReceiptVisible(prev => !prev)} : (e)=> {evidenceDrawer()}} >등록</Button></Col>
                    </Row>
                </div>

                {receiptVisible === true && (
                    <Row gutter={5} className="table" justify='end' style={{ border: 0 }}>
                        <Col xs={4} lg={4} className="label" style={{borderTop: "1px solid #eee", borderLeft: "1px solid #eee"}}>증빙 금액</Col>
                        <Col xs={8} lg={8} style={{borderTop: "1px solid #eee"}}>
                            {receiptVisible2 === false ? (
                                <>
                                    <Input type='text' style={{width: 200, marginRight: 10}} onChange={(e) => receiptPriceTrans(e.target.value)} value={evidencePrice}/>
                                    <Button onClick={()=>{setReceiptVisible2(prev => !prev)}}>확인</Button>
                                </>
                            ) : (
                                <>
                                    <span style={{marginRight: 15}}>{evidencePrice}</span>
                                    <Button onClick={() => setPdfVisible(prev => !prev)}>영수증 제출용 문서 다운로드</Button>
                                </>
                            )}
                        </Col>
                    </Row>
                )}

                <div style={{ marginTop: 40,marginBottom:40 }}>
                    <Table
                            dataSource={state.approval_list}
                            columns={approval_column}
                            rowKey={(row) => row.id}    
                            pagination={false} 
                        />
                </div>

                <Row gutter={10} className="table marginTop">
                    <div className="table_title">추가 사항</div>
                    <Col xs={24} lg={5} className="label">
                        결재자 참고사항
                    </Col>
                    <Col xs={24} lg={19}></Col>
                    <Col xs={24} lg={5} className="label">
                        재무지원팀 참고사항
                    </Col>
                    <Col xs={24} lg={19}></Col>
                    <Col xs={24} lg={5} className="label">
                        파일(거래명세서 등)
                    </Col>
                    <Col xs={24} lg={19}>
                        파일명.pdf
                    </Col>
                </Row>
                
                <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20, marginBottom: 40 }}>
                    <Col>
                        <Button htmlType="button" type='primary'>수정</Button>
                        <Button htmlType="button" style={{marginLeft: 10}}>청구 취소</Button>
                    </Col>
                </Row>

                { evidence &&
                    <Evidence  
                        chkVisible={evidence}
                        evidenceClose={evidenceClose}
                    />           
                }
            </Drawer>
        </Wrapper>
    )
})

export default View;