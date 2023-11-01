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

const evidenceDrawer = observer(({ chkVisible,evidenceClose ,chkEvidencData, tooltip, totalCost, authorViewData, infoData,infoIdx, pageChk, chkBillingData}) => {
    const { commonStore } = useStore();
    const { Text } = Typography;
    const { Title } = Typography;
    const { Option } = Select;
    const { Search } = Input;

    const stateData = useLocalStore(() => ({ ...DEF_STATE }));

    const state = useLocalStore(() => ({
        evidenceViewType:'X',
        evidenceDate:0,
        evidenceType:0,
        list: [],
        listData : [],
        firstItemName : '', //첫번째 품목명
        totalAmount : 0,    //승인번호조회 합계
        drawerback: 'drawerWrap',

        files:[],
        files_add:[],

        infoData:[],
        
    }));

    //승인번호조회시 합계 체크
    const [chkTotalPay, setChkTotalPay] = useState(true);
    
    useEffect(() =>{
        state.infoData = infoData;
    },[infoData])


    //add evidenceList 값 넘기기
    const chkEvidencDataParent = ()=>{
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
            console.log(toJS(stateData))
            if(state.infoData !=='' && state.infoData !== undefined){
                state.infoData.evidence[0] = stateData;
                if(state.infoData.evidence[0].files !== '' && state.infoData.evidence[0].files !== undefined){
                    handelFileSubmit(state.infoData)         
                }else{
                    handleApiSubmit(state.infoData)         
                }
                       
            }else{
                chkEvidencData(stateData);
                visibleClose();
            }            
        }
        
    }    

    const evidencChkData = ()=>{
        let chkVal = true;       

        if(stateData.type == '1' || stateData.type == '2' || stateData.type == '3'){
            if((stateData.details == '' || stateData.details == undefined) && stateData.submission_timing == '1'){
                Modal.error({
                    content: '승인번호 조회를 해주세요.',        
                });
                chkVal = false;
                return;
            }
        }

        if(chkVal == true){
            console.log(toJS(stateData))
            chkBillingData(stateData);
            visibleClose();
        }
        
    }

    //drawer 닫기
    const visibleClose = (type) => {      
        if(type === 'del'){
            for (const key in DEF_STATE) {
                stateData[key] = DEF_STATE[key];
            }
            chkEvidencData('');
        } 
        if(state.info !== '' && state.info  !== undefined){
            evidenceClose('Y');
        }else{
            evidenceClose();
        }
       
    };

    const [taxNumber, setTaxNumber] = useState('');
    const handleChangeEvidence = useCallback((type) => (e) => {
        // var taxNumberChk = /[^\-0-9|a-z|A-Z]/g;
        var taxNumberChk = /[^|0-9|\-|a-z|A-Z]/g;
        var key = 'taxNumberError'
        if(type == 'taxNumber'){     
            console.log(e.target.value)
            var text = e.target.value
            console.log(taxNumberChk.test(text))
            console.log(taxNumberChk.test(text), false)

            if(taxNumberChk.test(text)){
                console.log(1)
                var key = 'taxNumberError'
                message.warning({ content: '영문과 숫자, 일부 특수문자만 입력 가능합니다.', key});   
            }else{
                console.log(2)
                var val = text.replace(/[^|0-9|\-|a-z|A-Z]/g,'',);
                setTaxNumber(val)
                if(val.length >= 24 || val.length <= 26){
                    val = val.replace(/-/g,'');
                    fetch(val);
                }                   
            }
                    
        }else{       
            // if(stateData[type] == 'type'){
            if(type === 'type'){
                if(e.target.value =='1' || e.target.value =='2' ||e.target.value =='3'){
                    stateData.files = [];
                    stateData.scope = '';
                    stateData.receipt_submission = '';
                    if(stateData.submission_timing === '1'){
                        setChkTotalPay(false);
                    }
                }else if(e.target.value =='4'){
                    stateData.details = [];
                    stateData.files = [];
                    stateData.scope = '';
                    if(stateData.submission_timing === '1'){
                        setChkTotalPay(true);
                    } 
                }else {
                    stateData.details = [];
                    stateData.files = [];
                    stateData.receipt_submission = '';
                    if(stateData.submission_timing === '1'){
                        setChkTotalPay(true);
                    } 
                }
            }     
            if(type === 'submission_timing'){
                if(e.target.value =='1' ){

                    if(stateData.type === '1' || stateData.type === '2' || stateData.type === '3'){
                        stateData.files = [];
                        stateData.scope = '';
                        stateData.receipt_submission = '';
                        setChkTotalPay(false);
                    }else if(stateData.type === '4'){
                        stateData.details = [];
                        stateData.files = [];
                        stateData.scope = '';
                        setChkTotalPay(true);
                    }else{
                        stateData.details = [];
                        stateData.files = [];
                        stateData.receipt_submission = '';
                        setChkTotalPay(true);
                    }
                    
                }else if(e.target.value =='2'){
                    setChkTotalPay(true);
                }
            }
            stateData[type] = e.target.value;
            // chkEvidencDataParent();
            chkEvidencData(stateData);
        }
       
    },[],);


    // 테이블
    const column = useMemo(() => [
        {
            title: '공급/발행자',
            dataIndex: 'invoicerCorpName',
            key:  'invoicerCorpName',
            render: (_, row) => <div>{row.invoicerCorpName}</div>,
            align: 'left',
        },
        {
            title: '사업자등록번호',
            dataIndex: 'invoicerCorpNum ',
            key:  'invoicerCorpNum',
            render: (_, row) => <div>{row.invoicerCorpNum}</div>,
            align: 'left',
        },
        {
            title: '발행/사용일',
            dataIndex:  'evidence_issueDate',
            key: 'evidence_issueDate',
            render: (_, row) => <div>{row.issueDate}</div>,
            align: 'left',
        },
        {
            title: '품목',
            dataIndex: 'evidence_itemName',
            key: 'evidence_itemName',
            render: (_, row) => <div>{row.itemName}</div>,
            // render: (_, row) => <div style={{textAlign:'left'}}>{state.listData.length > 1  ? state.firstItemName+' 외 '+state.listData.length+'건' : row.itemName}</div>,
            align: 'left',
        },
        {
            title: '합계',
            dataIndex: 'evidence_totalAmount',
            key: 'evidence_totalAmount',
            render: (_, row) => <div>{row.totalAmount !='' && row.totalAmount != undefined ? commaNum(row.totalAmount) : ''}</div>,
            align: 'right',
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
                    if(pageChk === 'billingInfo'){
                        console.log(toJS(infoData))

                        var person_no = infoData.accountable.person_no.replace(/-/g,'');

                        if(person_no !== data.invoicerCorpNum){                       
                            Modal.error({
                                title: '등록한 거래처와 증빙의 발행자가 다릅니다. ',
                                content: ' 다시 확인해 주세요.',
                            });
                        }else{                
                            if(state.listData != '' && state.listData != undefined){
                                state.listData = [...state.listData, data];                        
                            }else{
                                state.listData = [data];
                                state.firstItemName = data.itemName ;
                            }    
                            stateData.details = [...stateData.details, 
                                { approval_no: data.ntsconfirmNum,publisher: data.invoicerCorpName,person_no: data.invoicerCorpNum,
                                    published_at: data.issueDate,item: data.id,total_amount: data.totalAmount }];
    
                            stateData.total_amount=data.totalAmount
                            stateData.amount=data.supplyCostTotal
                            stateData.vat=data.taxTotal
    
                            console.log(toJS(state.listData))
                            console.log(toJS(stateData.details))                           
                        }

                    }else{                       
                        console.log(toJS(stateData.details))
                        console.log(toJS(authorViewData))
                        
                        if(authorViewData !== '' && authorViewData !== undefined){
                            
                            if(authorViewData.person_no === '' || authorViewData.person_no === undefined){
                                Modal.error({
                                    title: '등록한 거래처와 증빙의 발행자가 다릅니다. ',
                                    content: ' 다시 확인해 주세요.',
                                });
                            }else{
                                var person_no = authorViewData.person_no.replace(/-/g,'');

                                if(person_no !== data.invoicerCorpNum){                       
                                    Modal.error({
                                        title: '등록한 거래처와 증빙의 발행자가 다릅니다. ',
                                        content: ' 다시 확인해 주세요.',
                                    });
                                }else{
                                    if(state.listData != '' && state.listData != undefined){
                                        state.listData = [...state.listData, data];                        
                                    }else{
                                        state.listData = [data];
                                        state.firstItemName = data.itemName ;
                                    }    
                                    stateData.details = [...stateData.details, 
                                        { approval_no: data.ntsconfirmNum,publisher: data.invoicerCorpName,person_no: data.invoicerCorpNum,
                                            published_at: data.issueDate,item: data.id,total_amount: data.totalAmount , amount: data.supplyCostTotal, vat: data.taxTotal}];
            
                                            stateData.total_amount=data.totalAmount
                                            stateData.amount=data.supplyCostTotal
                                            stateData.vat=data.taxTotal
            
                                    console.log(toJS(state.listData))
                                    console.log(toJS(stateData.details))
                                    chkEvidencData(stateData);
                                }
                            }
                        }
                    }                   
                    
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
                    }else if(error.response.status == 409){
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

    const [loading, setLoading] = useState(false); //로딩
    const handelFileSubmit = useCallback(async (data) => {
        const formData = new FormData();
        formData.append('topUploadFolder', 'billing_approvals');              

        var cnt = 0;

        if(data.evidence[0].files.length > 0){
            formData.append('uploadFolder', 'evidence');   
            data.evidence[0].files.forEach((file) => {
                formData.append('files_evidence[]', file);
            });
            cnt++;
        }

        setLoading(true); 


        if(cnt == 0){  
            handleApiSubmit(data);
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
    
                // if(res.data.length === 0 || (res.data.error !== '' && res.data.error !== undefined)){
                if(res.data.error !== '' && res.data.error !== undefined){
                    Modal.error({
                        title: '파일 등록시 오류가 발생하였습니다.',
                        content: res.data.error,
                    });
                }else{
                    data.evidence[0].files = res.data.files_evidence !=='' && res.data.files_evidence != undefined ? res.data.files_evidence : data.evidence[0].files; 

                    handleApiSubmit(data);
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
                setLoading(false); 
            });
        }
       
    }, []);


    const handleApiSubmit = useCallback(async (val)=> {
        // var data = toJS(data);       
        var data = toJS({evidence: [     
            {
                submission_timing: val.evidence[0].submission_timing,  
                type: val.evidence[0].type,   
                receipt_submission: val.evidence[0].receipt_submission,  
                scope:val.evidence[0].scope,        
                amount: val.evidence[0].amount,  
                vat: val.evidence[0].vat,         
                total_amount: val.evidence[0].total_amount,  
                details: val.evidence[0].details,  
                files: val.evidence[0].files,  
            }
        ]})

        var axios = require('axios');

        var config={
            method:'PUT',
            url:process.env.REACT_APP_API_URL +'/api/v1/billings/evidences/'+infoIdx,
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
                        visibleClose();
                    },
                });
            }else{
                Modal.error({
                    content:(<div>
                                <p>회수시 문제가 발생하였습니다.</p>
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
                    {pageChk === '' || pageChk === undefined &&
                        <><Col xs={24} lg={5} className="label">
                            제출 시점 <span className="spanStar">*</span>
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
                            종류 <span className="spanStar">*</span>
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
                        </Col></>
                    }
                    { stateData.submission_timing === '1' || pageChk === 'billingInfo'  ?
                        
                        ((stateData.type == '1' ||  stateData.type == '2' ||  stateData.type == '3')) || pageChk === 'billingInfo' ?
                            <><Col xs={24} lg={5} className="label">
                                증빙 제출 <span className="spanStar">*</span>
                                {/* <Popover content={tooltip}>
                                    <Button
                                        className="btn_tip"
                                        shape="circle"
                                        icon={<QuestionOutlined style={{ fontSize: '11px' }} />}
                                        size="small"
                                        style={{ marginLeft: '5px' }}
                                    />
                                </Popover> */}
                            </Col>
                            <Col xs={24} lg={19}>
                                {/* <SelectTax />     */}
                                <div style={{width: '100%'}}>
                                    승인번호로 추가 &nbsp;
                                    <Input
                                        name="taxNumber"
                                        onChange={handleChangeEvidence('taxNumber')}
                                        autoComplete="off"
                                        maxLength="26"
                                        value={taxNumber}
                                        style={{width: 'calc(100% - 115px)'}}
                                    />
                                </div>
                                
                                <Space style={{marginTop: '10px',marginBottom:'20px'}}  direction="vertical">
                                    <Text><ExclamationCircleOutlined /> 발급 받은 세금계산서/계산서/현금영수증의 “승인번호" 항목에 있는 값을 복사해서 붙여 넣으면 됩니다.</Text>
                                    <Text><ExclamationCircleOutlined /> 수정(마이너스) 세금계산서가 발행된 경우 최초, 수정, 최종 증빙을 모두 조회해서 추가해 주세요.</Text>
                                </Space>

                                {(stateData.submission_timing === '1'  && (stateData.type == '1' ||  stateData.type == '2' ||  stateData.type == '3')) ? (
                                        <Table
                                            dataSource={state.listData}
                                            columns={column}
                                            rowKey={(row) => row.id}    
                                            pagination={false} 
                                            summary={pageData => {
                                                let totalPay = 0;                                    
                                                let totalAmount = 0;                                    
                                                let totalVat = 0;                                    
                                                pageData.forEach(e => {
                                                    totalPay += Number(e.totalAmount);
                                                    totalAmount += Number(e.supplyCostTotal);
                                                    totalVat += Number(e.taxTotal);
                                                });
                                                state.totalAmount = totalPay;
                                                console.log(totalCost , state.totalAmount)
                                                if(stateData.type == '1' || stateData.type == '2' || stateData.type == '3'){
                                                    if(totalCost == state.totalAmount ){
                                                        setChkTotalPay(true);
                                                    } else{
                                                        setChkTotalPay(false);
                                                    }          
                                                    // stateData.amount = totalAmount;
                                                    // stateData.total_amount = totalAmount;
                                                    // stateData.vat = totalVat;
                                                }else{
                                                    setChkTotalPay(true);
                                                }   
                                                
                                                return ('')                             
                                            }}
                                        />
                                    ) : pageChk === 'billingInfo' && (
                                        <Table
                                            dataSource={state.listData}
                                            columns={column}
                                            rowKey={(row) => row.id}    
                                            pagination={false} 
                                            summary={pageData => {
                                                let totalPay = 0;                                    
                                                let totalAmount = 0;                                    
                                                let totalVat = 0;                                    
                                                pageData.forEach(e => {
                                                    totalPay += Number(e.totalAmount);
                                                    totalAmount += Number(e.supplyCostTotal);
                                                    totalVat += Number(e.taxTotal);
                                                });
                                                state.totalAmount = totalPay;
                                                console.log(totalCost , state.totalAmount)
                                                setChkTotalPay(true);
                                                // if(stateData.type == '1' || stateData.type == '2' || stateData.type == '3'){
                                                //     if(totalCost == state.totalAmount ){
                                                //         setChkTotalPay(true);
                                                //     } else{
                                                //         setChkTotalPay(false);
                                                //     }          
                                                //     // stateData.amount = totalAmount;
                                                //     // stateData.total_amount = totalAmount;
                                                //     // stateData.vat = totalVat;
                                                // }else{
                                                //     setChkTotalPay(true);
                                                // }   
                                                
                                                return ('')                             
                                            }}
                                        />
                                )}
                            </Col>
                            </>
                        
                        : stateData.type === '4' ?
                            <>
                            <Col xs={24} lg={5} className="label">
                                제출 방법 <span className="spanStar">*</span>
                            </Col>
                            <Col xs={24} lg={19}>
                                <Space direction="vertical">
                                    <Radio.Group
                                        onChange={handleChangeEvidence('receipt_submission')}
                                        value={stateData.receipt_submission}
                                    >
                                        <Radio value="1">출력된 영수증을 나중에 제출</Radio>
                                        <Radio value="2">온라인에서 다운로드 받은 파일 첨부</Radio>
                                    </Radio.Group>
                                    <Text><ExclamationCircleOutlined /> 출력 영수증과 파일 영수증이 섞여 있으면 ‘출력된 영수증을 나중에 제출’을 선택해주세요.</Text>
                                </Space>
                            </Col>
                            { stateData.receipt_submission == '1'
                                ?
                                <>
                                    <Col xs={24} lg={5} className="label">
                                        증빙 제출
                                    </Col>
                                    <Col xs={24} lg={19}>
                                        <Text><ExclamationCircleOutlined /> <span style={{color: 'red'}}>청구서 결재가 끝나면</span> '영수증 제출용 문서'를 다운 받을 수 있습니다. 그 때 증빙을 제출하면 됩니다.</Text>
                                    </Col>
                                </>
                                : stateData.receipt_submission == '2' &&
                                <>
                                    <Col xs={24} lg={5} className="label">
                                        증빙 제출 <span className="spanStar">*</span>
                                    </Col>
                                    <Col xs={24} lg={19}>
                                        <Space direction="vertical">
                                            <Upload {...props} multiple={true}>
                                                <Button icon={<UploadOutlined />}>파일</Button>
                                            </Upload>
                                            <span className='accessFile'><ExclamationCircleOutlined/> 업로드 가능 확장자: png, pdf,xlsx | 용량 최대: 20MB</span>
                                            <Text ><ExclamationCircleOutlined /> <span style={{color: 'red'}}>원본이 파일 형태인 경우에만 파일을 첨부</span>해 주세요. 출력된 영수증을 스캔하면 안됩니다.</Text>
                                        </Space>
                                        
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
                                <Space direction="vertical">
                                    <Upload {...props} multiple={true}>
                                        <Button icon={<UploadOutlined />}>파일</Button>
                                    </Upload>
                                    <span className='accessFile'><ExclamationCircleOutlined/> 업로드 가능 확장자: png, pdf,xlsx | 용량 최대: 20MB</span>
                                    <Text><ExclamationCircleOutlined /> 일회성이 아니고 최초 거래인 경우 신분증 파일(주민등록증, 운전면허증, 여권 등)을 첨부해 주세요.</Text>
                                </Space>
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
                            <Col xs={24} lg={5} className="label">
                                증빙 제출
                            </Col>
                            <Col xs={24} lg={19}>
                                <Text><ExclamationCircleOutlined /> 결재와 입금이 끝나면 ‘입금/증빙 상태'가 “입금 완료(증빙 대기)”로 표시되며, 나중에 증빙을 받으면 등록합니다.</Text>
                            </Col>
                        </>
                    }
                </Row>

                { (stateData.submission_timing === '1'  && (stateData.type == '1' ||  stateData.type == '2' ||  stateData.type == '3')) ? (
                    <Space style={{marginTop: '10px',marginBottom:'20px'}}  direction="vertical">
                        {/* <Text><ExclamationCircleOutlined /> 수정(마이너스) 세금계산서가 발행된 경우 최초, 수정, 최종 증빙을 모두 조회해서 추가해 주세요.</Text> */}
                        <Text><ExclamationCircleOutlined /> <span style={{color: 'red'}}> 청구 내용과 증빙의 합계 금액이 일치해야 '확인' 버튼이 활성화</span> 됩니다.</Text>
                    </Space>
                ) : pageChk === 'billingInfo' && (
                    <Space style={{marginTop: '10px',marginBottom:'20px'}}  direction="vertical">
                        {/* <Text><ExclamationCircleOutlined /> 수정(마이너스) 세금계산서가 발행된 경우 최초, 수정, 최종 증빙을 모두 조회해서 추가해 주세요.</Text> */}
                        <Text><ExclamationCircleOutlined /> <span style={{color: 'red'}}> 청구 내용과 증빙의 합계 금액이 일치해야 '확인' 버튼이 활성화</span> 됩니다.</Text>
                    </Space>
                )}

                <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                    <Col>
                        {pageChk === '' || pageChk === undefined ? 
                            <>{chkTotalPay === true &&
                                <Button
                                    type="primary"
                                    htmlType="button"
                                    onClick={(e)=>chkEvidencDataParent()}
                                >
                                    {loading ? 'Uploading' : '확인'}
                                </Button>
                            }
                            <Button
                                htmlType="button"
                                onClick={(e) => visibleClose('del')}
                                style={{ marginLeft: '10px' }}
                            >
                                취소
                            </Button></>
                        : <>
                                <Button
                                    type="primary"
                                    htmlType="button"
                                    onClick={(e)=>evidencChkData()}
                                >
                                    {loading ? 'Uploading' : '확인'}
                                </Button>
                            </>
                        }
                    </Col>
                </Row>
            </Drawer>
        </Wrapper>
    );
});

export default evidenceDrawer;