/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Table, Space, Button, Row, Col, Modal, Input, Upload, message, Radio, Popover, Select, Typography, Drawer, Checkbox } from 'antd';
import { CloseOutlined, QuestionOutlined, UploadOutlined, ExclamationCircleOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import axios from 'axios';
import styled from 'styled-components';
import useStore from '@stores/useStore';

const Wrapper = styled.div`
    width: 100%;
    `;

const DEF_STATE = {
    // DB Data
    submission_timing: "",  // 증빙 제출 시점 - 1:함께 제출, 2:입금/사용 후 제출
    type: "",               // 증빙 종류 - 1:세금계산서, 2:계산서, 3:현금영수증, 4:영수증, 5:개인(원천징수)
    receipt_submission: "", // 영수증 제출 방법 - 1:출력 영수증을 나중에 제출, 2:파일을 지금 제출
    scope: "",              // 증빙 범위 - 1:청구 금액 전체, 2:사용한 금액
    amount: "",             // 공급가
    vat: "",                // 부가세
    total_amount: "",       // 합계
    details: [              // 증빙 상세(세금계산서)
        // {
        //     approval_no: '',    // 승인번호
        //     publisher: "",      // 공급/발행자
        //     person_no: "",      // 사업자 등록번호
        //     published_at: "",   // 발행/사용일
        //     item: "",           // 품목
        //     total_amount: ""    // 합계
        // }
    ],
    files: [                    // 증빙 파일
        // {
        //     file_path: "",      // 경로(파일포함)
        //     file_name: ""       // 파일이름
        // }
    ]
};

const evidenceDrawer = observer(({ chkVisible,evidenceClose ,chkEvidencData, tooltip, totalCost}) => {
    const { commonStore } = useStore();
    const { Text } = Typography;
    const { Title } = Typography;
    const { Option } = Select;
    const { Search } = Input;

    const stateData = useLocalStore(() => ({ ...DEF_STATE }));

    const state = useLocalStore(() => ({
        drawerback: 'drawerWrap',
        evidenceViewType:'X',
        evidenceDate:0,
        evidenceType:0,
        list: [
            {
                id:0,
                supply:'(주)네이버',
                businessNum:'123-12-1234',
                issueDate:'2022.11.02',
                item:'온라인 광고 충전 외 2건',
                total:3500000
            },
            {
                id:1,
                supply:'(주)네이버',
                businessNum:'123-12-1234',
                issueDate:'2022.11.02',
                item:'온라인 광고 충전 외 2건',
                total:-3500000
            }
        ],
        listData : [],
        firstItemName : '', //첫번째 품목명
        totalAmount : 0,    //승인번호조회 합계
        chkTotalPay : true,    //승인번호조회시 합계 체크

        files:[],
        files_add:[],
    }));

    useEffect(() => { 
        console.log(totalCost)
    }, []);

    //add evidenceList 값 넘기기
    const chkEvidencDataParent = ()=>{
        console.log(toJS(stateData));
        let chkVal = true;       

        if(stateData.submission_timing == ''){
            Modal.error({
                content: '증빙 제출 시점을 선택해주세요.',        
            });
            chkVal = false;
            return;
        }else {
            if(stateData.submission_timing == '2' && stateData.scope == ''){
                Modal.error({
                    content: '증빙 범위를 선택해주세요.',        
                });
                chkVal = false;
                return;
            }
        }

        if(stateData.type  == ''){
            Modal.error({
                content: '증빙 종류를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }else{

            if(stateData.type == '1' || stateData.type == '2' || stateData.type == '3'){
                if((stateData.details == '' || stateData.details == undefined) && stateData.submission_timing == '1'){
                    Modal.error({
                        content: '승인번호 조회를 해주세요.',        
                    });
                    chkVal = false;
                    return;
                }
            }else if (stateData.type == '4'){
                if(stateData.receipt_submission == '' && stateData.submission_timing == '1'){
                    Modal.error({
                        content: '영수증 제출 방법을 선택해주세요.',        
                    });
                    chkVal = false;
                    return;
                }else {
                    if(stateData.receipt_submission == 2 && (stateData.files == '' || stateData.files == undefined) && stateData.submission_timing == '1'){
                        Modal.error({
                            content: '영수증 파일을 등록해주세요.',        
                        });
                        chkVal = false;
                        return;
                    }
                }
            }

        }
        if(chkVal == true){
            chkEvidencData(stateData);
            visibleClose();
        }
        
    }

    //drawer 닫기
    const visibleClose = () => {
        evidenceClose();
    };

    const handleChangeEvidence = useCallback((type) => (e) => {
        if(type == 'taxNumber'){
            console.log(e.target.value.length)
            if(e.target.value.length ==24){
                fetch(e.target.value);
            }           
        }else{       
            if(stateData[type] == 'type'){
                if(e.target.value =='1' || e.target.value =='2' ||e.target.value =='3'){
                    stateData.files = [];
                    stateData.scope = '';
                    stateData.receipt_submission = '';
                }else if(e.target.value =='4'){
                    stateData.details = [];
                    stateData.files = [];
                    stateData.scope = '';
                }else {
                    stateData.details = [];
                    stateData.files = [];
                    stateData.receipt_submission = '';
                }
            }     
            stateData[type] = e.target.value;
            // chkEvidencDataParent();
        }
       
    },[],);

    const onSearch = (val) => {
        console.log(val);
    }


    // 테이블
    const column = useMemo(() => [
        {
            title: '공급/발행자',
            dataIndex: 'invoicerCorpName',
            key:  'invoicerCorpName',
            render: (_, row) => <div style={{textAlign:'left'}}>{row.invoicerCorpName}</div>,
            align: 'center',
        },
        {
            title: '사업자등록번호',
            dataIndex: 'invoicerCorpNum ',
            key:  'invoicerCorpNum',
            render: (_, row) => <div style={{textAlign:'center'}}>{row.invoicerCorpNum}</div>,
            align: 'center',
        },
        {
            title: '발행/사용일',
            dataIndex:  'evidence_issueDate',
            key: 'evidence_issueDate',
            render: (_, row) => <div style={{textAlign:'center'}}>{row.issueDate}</div>,
            align: 'center',
        },
        {
            title: '품목',
            dataIndex: 'evidence_itemName',
            key: 'evidence_itemName',
            // render: (_, row) => <div style={{textAlign:'left'}}>{row.itemName}</div>,
            render: (_, row) => <div style={{textAlign:'left'}}>{state.listData.length > 1  ? state.firstItemName+' 외 '+state.listData.length+'건' : row.itemName}</div>,
            align: 'center',
        },
        {
            title: '합계',
            dataIndex: 'evidence_totalAmount',
            key: 'evidence_totalAmount',
            render: (_, row) => <div style={{textAlign:'right'}}>{row.totalAmount !='' && row.totalAmount != undefined ? commaNum(row.totalAmount) : ''}</div>,
            align: 'center',
        },    
    ],[state.listData],);
    
    const commaNum = (num) => {
        const number = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return number
    }

    //파일 업로드
    const [fileList, setFileList] = useState([]);
    const props = {
        onRemove: (file) => {
            //삭제 파일 재배열
            var arr = [];
            state.files.forEach(e => {
                if(e.uid != file.uid){
                    arr = [...arr, e]                    
                }                
            });

            // //기존 데이터가 있을경우 재배열
            // if(stateData.files.length > 0){                  
            //     var arr2 = [];
            //     stateData.files.forEach(e => {
            //         if(e.file_path != file.file_path){
            //             arr2 = [...arr2, e];                                  
            //         }
            //     });        
            //     stateData.files = arr2;    
            // }

            // //추가파일을 삭제시 재배열
            // if(state.files_add.length > 0){
            //     var arr3 = [];
            //     state.files_add.forEach(e => {
            //         if(e.uid != file.uid){
            //             arr3 = [...arr3, e];
            //         }
            //     });        
            //     state.files_add = arr3;          
            // }

            console.log(toJS(arr))
            console.log(toJS(stateData.files))
            console.log(toJS(state.files))

            setFileList(arr);
            state.files = arr;
        },
        beforeUpload: (file) => {
            state.files = [...state.files, file];
            stateData.files = [...stateData.files, file];
            // state.files_add = [... state.files_add, file];
                      
            console.log(toJS(stateData.files))
            setFileList(state.files)
            return false;
        },
        fileList:fileList,
    };
    

    const fetch = (value) => {
        console.log(value)

        if(value){           
            var axios = require('axios');

            var config = {
                method: 'GET',
                url:process.env.REACT_APP_API_URL +'/api/v1/tax-invoice/'+value,
                headers: {
                    Accept: 'application/json',
                },
            };
    
            axios(config)
            .then(function (result) {
                if (result.data.Taxinvoice !='' ) {
                    var data = result.data.Taxinvoice;
                    if(state.listData != '' && state.listData != undefined){
                        state.listData = [...state.listData, data];                        
                    }else{
                        state.listData = [data];
                        state.firstItemName = data.itemName ;
                    }    
                    stateData.details = [...stateData.details, 
                        { approval_no: data.ntsconfirmNum,publisher: data.invoicerCorpName,person_no: data.invoicerCorpNum,
                            published_at: data.issueDate,item: data.id,total_amount: data.totalAmount }];
                    console.log(toJS(stateData.details))     
                    //공급가 등 합쳐서 계산
                }else{
                    Modal.error({
                        title: '발행된 내역이 없습니다. ',
                        content: '승인번호를 다시 확인하거나, 국세청에서 내역을 받아오기 위해 1시간 정도 뒤에 다시 시도해 주세요.',
                    });
                }
            })
            .catch(function (error) {
                if(error.response != undefined && error.response != ''){
                    console.log(error.response);
                    if(error.response.status == 500){
                        Modal.error({
                            title: error.response.data.message,
                        });
                    }else{
                        Modal.error({
                            title: '오류가 발생했습니다. 재시도해주세요.',
                            content: '오류코드:' + error.response.status,
                        });
                    }
                    
                }
            });
        }            
    };

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
                title={'증빙 등록'}
                placement='right'
                visible={chkVisible}   
                onClose={visibleClose}     
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
                    <Col xs={24} lg={5} className="label">
                        증빙 제출 시점 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={19}>
                        <Radio.Group
                            onChange={handleChangeEvidence('submission_timing')}
                            value={stateData.submission_timing}
                        >
                            <Radio value="1">함께 제출</Radio>
                            <Radio value="2">입금/사용 후 제출</Radio>
                        </Radio.Group>
                    </Col>
                    <Col xs={24} lg={5} className="label">
                        증빙 종류 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={19}>
                        <Radio.Group
                            onChange={handleChangeEvidence('type')}
                            value={stateData.type}
                        >
                            <Radio value="1">세금계산서</Radio>
                            <Radio value="2">계산서</Radio>
                            <Radio value="3">현금영수증</Radio>
                            <Radio value="4">영수증</Radio>
                            {stateData.submission_timing ==1 && <Radio value="5">개인(원천징수)</Radio>}
                        </Radio.Group>
                    </Col>
                    { stateData.submission_timing === '1'  ?
                        
                        (stateData.type == '1' ||  stateData.type == '2' ||  stateData.type == '3') ?
                            <><Col xs={24} lg={5} className="label">
                                승인번호 조회 <span className="spanStar">*</span>
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
                                {/* <SelectTax />     */}
                                <Input
                                    name="taxNumber"
                                    onChange={handleChangeEvidence('taxNumber')}
                                    autoComplete="off"
                                    maxLength="24"
                                />                      
                            </Col>
                            </>
                        
                        : stateData.type === '4' ?
                            <>
                            <Col xs={24} lg={5} className="label">
                                영수증 제출 방법 <span className="spanStar">*</span>
                            </Col>
                            <Col xs={24} lg={19}>
                                <Space style={{marginTop: '10px',marginBottom:'20px'}}  direction="vertical">
                                    <Radio.Group
                                        onChange={handleChangeEvidence('receipt_submission')}
                                        value={stateData.receipt_submission}
                                    >
                                        <Radio value="1">출력된 영수증을 나중에 제출</Radio>
                                        <Radio value="2">온라인에서 다운로드 받은 파일 첨부</Radio>
                                    </Radio.Group>
                                    <Text>* 출력 영수증과 파일 영수증이 섞여 있으면 ‘나중에 제출’로 진행해 주세요.</Text>
                                </Space>
                            </Col>
                            { stateData.receipt_submission == '1'
                                ?
                                <>
                                    <Col xs={24} lg={24}>
                                        <Space style={{width:'100%',padding:'10px 0',textAlign:'center'}} direction="vertical">
                                            <Title level={4}>결재가 끝나면 <Text type="danger">영수증 제출용 문서를 출력한 뒤, 영수증을 묶어서 재무지원팀에 제출</Text>하면 됩니다.</Title>
                                            <Title level={4}>제출 대상 청구서는 비용 청구 리스트에서 확인할 수 있습니다.</Title>
                                        </Space>
                                    </Col>
                                </>
                                : stateData.receipt_submission == '2' &&
                                <>
                                    <Col xs={24} lg={24}>
                                        <Space style={{width:'100%',padding:'10px 0',textAlign:'center'}} direction="vertical">
                                            <Title level={4}><Text type="danger">원본이 파일 형태인 경우에만 파일을 첨부</Text>해 주세요. 출력된 것을 다시 스캔하면 안됩니다.</Title>
                                        </Space>
                                    </Col>
                                    <Col xs={24} lg={5} className="label">
                                        영수증 파일 <span className="spanStar">*</span>
                                    </Col>
                                    <Col xs={24} lg={19}>
                                        <Upload {...props} multiple={true} >
                                            <Button icon={<UploadOutlined />}>파일</Button>
                                        </Upload>
                                        <span className='accessFile'><ExclamationCircleOutlined/> 업로드 가능 확장자: png, pdf,xlsx | 용량 최대: 20MB</span>
                                    </Col>
                                </>
                            }
                        </>
                        : stateData.type == '5' &&
                        <>
                            <Col xs={24} lg={5} className="label">
                                참고 파일
                            </Col>
                            <Col xs={24} lg={19}>
                                <Upload {...props} multiple={true}>
                                    <Button icon={<UploadOutlined />}>파일</Button>
                                </Upload>
                                <span className='accessFile'><ExclamationCircleOutlined/> 업로드 가능 확장자: png, pdf,xlsx | 용량 최대: 20MB</span>
                            </Col>
                        </>
                   
                    : stateData.submission_timing === '2' &&
                        <>
                            <Col xs={24} lg={5} className="label">
                                증빙 범위 <span className="spanStar">*</span>
                            </Col>
                            <Col xs={24} lg={19}>
                                <Radio.Group onChange={handleChangeEvidence('scope')} value={stateData.scope}>
                                    <Radio value="1">청구 금액 전체에 대해 한 번만 발행</Radio>
                                    <Radio value="2">사용한 금액만큼만 발행</Radio>
                                </Radio.Group>
                            </Col>
                            <Col xs={24} lg={24}>
                                <Space style={{width:'100%',padding:'10px 0',textAlign:'center'}} direction="vertical">
                                    <Title level={4}>비용 청구 현황에서 이 건은 '증빙 제출 대기'로 표시되며, 증빙을 받으면 등록하면 됩니다.</Title>
                                </Space>
                            </Col>
                        </>
                    }
                </Row>
                { stateData.submission_timing === '1'  && (stateData.type == '1' ||  stateData.type == '2' ||  stateData.type == '3') &&
                    <>
                    <Space style={{marginTop: '10px',marginBottom:'20px'}}  direction="vertical">
                        <Text>* 수정(마이너스) 세금계산서가 발행된 경우 최초, 수정, 최종 증빙을 모두 조회해서 추가해 주세요.</Text>
                        <Text>* <Text type="danger">청구와 증빙의 합계가 일치해야 '확인' 버튼이 활성화</Text> 됩니다.</Text>
                    </Space>
                    <div  style={{ marginBottom: 40 }}>
                        <Table
                            dataSource={state.listData}
                            columns={column}
                            rowKey={(row) => row.invoicerCorpNum}    
                            pagination={false} 
                            summary={pageData => {
                                let totalPay = 0;                                    
                                pageData.forEach(e => {
                                    totalPay += Number(e.totalAmount);
                                });
                                state.totalAmount = totalPay;
                                if(stateData.type == '1' || stateData.type == '2' || stateData.type == '3'){
                                    if(totalCost == state.totalAmount ){
                                        state.chkTotalPay = true;
                                    } else{
                                        state.chkTotalPay = false;
                                    }          
                                    console.log(totalCost,state.totalAmount)
                                }                                
                            }}
                        />
                    </div>
                    </>
                }
 
                <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                    <Col>
                        {state.chkTotalPay == true &&
                            <Button
                                type="primary"
                                htmlType="button"
                                onClick={(e)=>chkEvidencDataParent()}
                            >
                                확인
                            </Button>
                        }
                        <Button
                            htmlType="button"
                            onClick={visibleClose}
                            style={{ marginLeft: '10px' }}
                        >
                            취소
                        </Button>
                    </Col>
                </Row>
            </Drawer>
        </Wrapper>
    );
});

export default evidenceDrawer;