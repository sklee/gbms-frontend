/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState,useRef } from 'react';
import {Table,Space, Button,Row,Col,Modal,Input,Upload,InputNumber,Radio,Popover,Select,Checkbox,Typography,Drawer,message} from 'antd';
import {PhoneOutlined, QuestionOutlined, UploadOutlined, PlusOutlined} from '@ant-design/icons';

import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';

// import ClientAdd from './clientAdd';
import ClientAdd from '../../../Finance/account/Add';
import Evidence from './evidence';


const Wrapper = styled.div`
    width: 100%;
`;

const DEF_STATE = {
    // DB Data
    account_division:"",    //거래처 구분
    accountable_id:"",      //거래처 ID
    etc_bank_id:"",         //다른 계좌 - 은행 ID
    etc_account_no:"",      //다른 계좌번호
    etc_depositor:"",       //다른 계좌 예금주
    monthly_payment_yn:"N",      //월 결제 여부
    evidence: [
        // {
        // submission_timing: "",  // 증빙 제출 시점 - 1:함께 제출, 2:입금/사용 후 제출
        // type: "",               // 증빙 종류 - 1:세금계산서, 2:계산서, 3:현금영수증, 4:영수증, 5:개인(원천징수)
        // receipt_submission: "", // 영수증 제출 방법 - 1:출력 영수증을 나중에 제출, 2:파일을 지금 제출
        // scope: "",              // 증빙 범위 - 1:청구 금액 전체, 2:사용한 금액
        // amount: "",             // 공급가
        // vat: "",                // 부가세
        // total_amount: "",       // 합계
        // details: [              // 증빙 상세(세금계산서)
        //     {
        //         // approval_no: '',    // 승인번호
        //         // publisher: "",      // 공급/발행자
        //         // person_no: "",      // 사업자 등록번호
        //         // published_at: "",   // 발행/사용일
        //         // item: "",           // 품목
        //         // total_amount: ""    // 합계
        //     }
        // ],
        // files: [                    // 증빙 파일
        //     {
        //         // file_path: "",      // 경로(파일포함)
        //         // file_name: ""       // 파일이름
        //     }
        // ]
    // }
    ]
};

const BANK_STATE = {
    // DB Data
    etc_bank_id:"",         //다른 계좌 - 은행 ID
    etc_account_no:"",      //다른 계좌번호
    etc_depositor:"",       //다른 계좌 예금주
};


const EvidenceList = observer(({ totalCost, authorData, bankData ,tooltip, classChkBtn, evidenceData, typeChk, authorDataType, userInfo}) => {
    const { Text } = Typography;
    const { Option } = Select;
    const { confirm } = Modal;

    const stateData = useLocalStore(() => ({ ...DEF_STATE }));
    const stateBank = useLocalStore(() => ({ ...BANK_STATE }));
  
    const state = useLocalStore(() => ({
        // authorViewData:[],
        authorViewData:'',
        bankName : '',
        copyCnt :0,
        first : true,
    }));


    useEffect(() => {
        //한번만 데이터 넣기
        if(evidenceData !='' && evidenceData != undefined){
            if(state.copyCnt == 0){
                console.log(toJS(evidenceData))

                stateData.account_division = evidenceData.account_division;
                stateData.accountable_id = evidenceData.accountable_id;
                stateData.etc_bank_id = evidenceData.etc_bank_id;
                stateData.etc_account_no = evidenceData.etc_account_no;
                stateData.etc_depositor = evidenceData.etc_depositor;
                if(evidenceData.monthly_payment_yn !== '' && evidenceData.monthly_payment_yn !== undefined && evidenceData.monthly_payment_yn !== null){
                    stateData.monthly_payment_yn = evidenceData.monthly_payment_yn;
                }else{
                    stateData.monthly_payment_yn = 'N'
                }
                
                stateData.evidence = evidenceData.evidence;

                if(evidenceData.evidence.length > 0){
                    state.authorViewData = evidenceData.evidence[0].details;
                }
                
                if(stateData.account_division){
                    fetchView(stateData.accountable_id);
                }                
                state.copyCnt++;
                
            }           
        }     
       
    }, [evidenceData]);

    //add index에 데이터 넘기기
    const authorDataParent = ()=>{
        authorData(toJS(stateData))
        // authorDataType(state.authorViewData.type)
        // console.log(state.authorViewData.type)
        console.log(toJS(stateData))
    }

    //증빙 데이터
    const chkEvidencData=(data)=>{
        if(data !== '' && data !== undefined){
            stateData.evidence = [data];
        }else{
            stateData.evidence = [];
        }
        
        authorDataParent()
    }

    //거래처 등록    
    const [clientAdd, setClientAdd] = useState(false);
    const clientAddDrawer = () => {
        classChkBtn('drawerback');
        setClientAdd(true);
    };
    //거래처 등록 닫기
    const clientAddClose = () => {
        classChkBtn();
        setClientAdd(false);
    };

    //증빙 등록    
    const [evidence, setEvidence] = useState(false);
    const evidenceDrawer = () => {
        classChkBtn('drawerback');
        setEvidence(true);
    };

    //증빙 등록 닫기
    const evidenceClose = () => {
        classChkBtn();
        setEvidence(false);
    };

    //증빙 데이터 삭제
    const evidenceDel=()=>{
        stateData.evidence = [];
    }

    //은행
    const [bankIpt, setBankIpt] = useState(false);
    const bankIptView = (bl) => {
        setBankIpt(bl);
    };

    
    
    //input 데이터 
    const handleChangeInput = useCallback((type) => (e) => {
        if(type ==='etc_bank_id'){ 
            stateBank[type] = e;
            bankNameSelect(e)
        }else if( type == 'etc_account_no'){
            stateBank[type] = e.target.value.replace(/[^\-0-9]/g, '');
        }else if(type == 'etc_depositor' ){
            stateBank[type] = e.target.value;
        }else if(type == 'account_division' ){
            if(stateData.account_division !== e.target.value  && (stateData.account_division !== '' && stateData.account_division !== undefined)){
                if(state.authorViewData !== '' && state.authorViewData !== undefined){
                    confirm({
                        title: '거래처 구분을 변경하면 현재 지정된 거래처 정보가 초기화 됩니다. ',
                        content: '계속하시겠습니까?',
                        onOk() {
                            state.authorViewData = '';
                            stateData[type] = e.target.value;
                            setENameValue('')
                        },
                        onCancel() {
                            stateData[type] = stateData.account_division;
                        },
                    });   
                }else{
                    stateData[type] = e.target.value;
                }                      
            }else{
                stateData[type] = e.target.value;
            }           
        }else{           
            stateData[type] = e.target.value;     
        }
        authorDataParent()
        
    },[],);

    const handleClientChange = useCallback((type,e) => {
        stateData[type] = e;
        authorDataParent()
    },[],);


    //거래처 등록
    const clientAddData=(data)=>{
        state.authorViewData = data;
        stateData.accountable_id = data.chk_id;
        
        var bank = bankData.filter(e=>e.id ===data.bank_id)
        state.authorViewData.bank_name = bank[0].name

        setENameValue(data.name)
        
        authorDataParent()
    }   


    //거래처 구분 Select
    const fetch = (value, setData) => {
        var url = '';
        if(stateData.account_division == '1'){
            url = 'search-purchase-accounts?display=100&page=1&sort_by=date&order=desc&keyword='+value;
        }else if(stateData.account_division == '2'){
            // url = 'copyrights?display=20&page=1&sort_by=date&order=desc&type=국내&keyword='+value;
            url = 'copyrights?display=100&page=1&sort_by=date&order=desc&keyword='+value;
        }else if(stateData.account_division == '3'){
            url = 'brokers?display=100&page=1&sort_by=date&order=desc&keyword='+value;
        }else if(stateData.account_division == '4'){
            url = 'produce-company?display=100&page=1&sort_by=date&order=desc&keyword='+value;
        }else if(stateData.account_division == '5'){
            url = 'user-accounts?display=100&page=1&sort_by=date&order=desc&keyword='+value;
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
                    // if(userInfo !=='' && userInfo !== undefined && state.first === true){
                    //     var data = result.data.data;
                    //     state.authorViewData = toJS(data[0]);  
                    //     console.log(state.authorViewData)
                    //     stateData.etc_account_no ='';
                    //     stateData.etc_bank_id ='';
                    //     stateData.etc_depositor ='';

                    //     stateData.accountable_id = data[0].user_id;
                        
                    //     setENameValue(data[0].name)
                    //     authorDataParent()
                    //     state.first = false
                    // }else{
                        var data = result.data.data;
                        var arr = [];
                        data.forEach(item => {
                            if(stateData.account_division == '5'){
                                arr = [...arr, { value: item.email, label: item.name}]
                            }else{
                                // if(item.type === '한국인'){
                                //     arr = [...arr, { value: item.id, label: item.name+'('+item.person_no.substring(0,2)+'년생)'}]
                                // }else{
                                //     arr = [...arr, { value: item.id, label: item.name}]
                                // }
                                arr = [...arr, { value: item.id, label: item.name}]
                            }                         
                        });
                        setData(arr)                  
                    // }  
                }
            })
            .catch(function (error) {
                console.log(error);
                if(error!== '' && error !== undefined){
                    Modal.error({
                        title: '오류가 발생했습니다. 재시도해주세요.',
                        content: '오류코드:' + error.response.status,
                    });
                }
                
            });
        }            
    };

    //비용귀속 리스트
    const fetchView = (value, type) => {
        var url = '';
        if(value){       
            if(stateData.account_division == '1'){
                url = 'purchase-accounts/'+value;
            }else if(stateData.account_division == '2'){
                url = 'copyrights/'+value;
            }else if(stateData.account_division == '3'){
                url = 'brokers/'+value;
            }else if(stateData.account_division == '4'){
                url = 'produce-company/'+value;
            }else if(stateData.account_division == '5'){
                // url = 'user-accounts/'+value;
                url = 'user-accounts?display=100&page=1&sort_by=date&order=desc&keyword='+value;
            }
           
            // return;
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
                        // var data = result.data.data;
                        // console.log(toJS(data))
        
                        // state.authorViewData = toJS(data);  
                        // stateData.etc_account_no ='';
                        // stateData.etc_bank_id ='';
                        // stateData.etc_depositor ='';

                        // // handleClientChange('accountable_id', data.id) 
                        // if(stateData.account_division == '5'){                             
                        //     stateData.accountable_id = data.user_id;
                        // }else{
                        //     stateData.accountable_id = data.id;
                        // }

                        if(stateData.account_division == '5'){       
                            var data = result.data.data[0];                      
                            stateData.accountable_id = data.user_id;
                        }else{
                            var data = result.data.data;
                            stateData.accountable_id = data.id;
                        }

                        state.authorViewData = toJS(data);  
                        stateData.etc_account_no ='';
                        stateData.etc_bank_id ='';
                        stateData.etc_depositor ='';
                        
                        setENameValue(data.name)
                        authorDataParent()                        
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
        }    
    };

    const [eNameValue, setENameValue] = useState('');
    const SearchInput = (props) => {
        useEffect(() => {
            if(stateData.account_division === '5'  && state.first === true){
                // handleSearch(props.userInfo.name)
                handleChange(props.userInfo.email, { value: props.userInfo.email, label: props.userInfo.name})
                state.first = false
            }            
        }, []);

        const [data, setData] = useState([]);
        const [value, setValue] = useState('');
        const [text, setText] = useState(props.placeholder)
      
        const handleSearch = (newValue) => {
            if(stateData.account_division !== '' && stateData.account_division !== undefined){
                if (newValue) {
                    fetch(newValue, setData);
                } else {
                    setData([]);
                }
            }else{
                message.warning('거래처 구분을 선택 후 작성해주세요.');
                setValue('');
            }

            
        };
      
        const handleChange = (id, val) => {      
            fetchView(id);
            // setValue(id);
            setValue(val.label);
            setENameValue(val.label);

        };

        const handleFocus=(val)=>{
            setText('')
        }

        const handleMouseLeave=(val)=>{
            if(val === '' || val === undefined || val === null){
                setText(props.placeholder)
            }
        }


        return (
          <Select
            showSearch
            value={text}
            // defaultValue={props.placeholder}
            // placeholder={props.placeholder}
            style={props.style}
            defaultActiveFirstOption={false}
            showArrow={false}
            filterOption={false}
            onSearch={handleSearch}
            onChange={handleChange}
            notFoundContent={null}
            options={data}
            onFocus={handleFocus}
            onMouseLeave={(e)=>handleMouseLeave(value)}
            disabled={typeChk !=='' && typeChk !== undefined  ? true : false}
          />
        );
    };

    const TargetSelect= (e) => <SearchInput placeholder ={e.placeholderText} userInfo={e.userInfo} style={{ width: 200 }} />;

    const bankModify=()=>{
        stateData.etc_account_no = stateBank.etc_account_no ;
        stateData.etc_bank_id = stateBank.etc_bank_id;
        stateData.etc_depositor = stateBank.etc_depositor;

        bankNameSelect(stateBank.etc_bank_id);
        
        bankIptView(false)
        authorDataParent()
    }  

    const bankNameSelect = (id)=>{
        bankData.forEach(e => {
            if(e.id == id){
                state.bankName = e.name;
            }
        });
    }
    
    return (
        <Wrapper>
           <Row gutter={10} className="table marginTop">
                <div className="table_title">거래처와 증빙</div>
                <Col xs={24} lg={5} className="label">
                    거래처 구분 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={19}>
                    <Radio.Group onChange={handleChangeInput('account_division')} value={stateData.account_division}  disabled={typeChk !=='' && typeChk !== undefined  ? true : false}>
                        <Radio value="1">일반 거래처</Radio>
                        <Radio value="5">임직원</Radio>
                        <Radio value="2">국내, 직계약 저작권자</Radio>
                        <Radio value="3">해외 수입 중개자</Radio>
                        <Radio value="4">제작처</Radio>
                    </Radio.Group> 
                </Col>
                <Col xs={24} lg={5} className="label">
                    성명/사업자명 <span className="spanStar">*</span>
                    <Popover content={tooltip[0]}>
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
                    <Input.Group>
                        <Space direction="horizontal">
                            <TargetSelect placeholderText={eNameValue} userInfo={userInfo}/>
                            {
                                stateData.account_division === '1' && (typeChk ==='' || typeChk === undefined)  &&
                                <Button type="primary" className="btn_inner" onClick={(e)=> {clientAddDrawer()}}>거래처 새로 입력</Button>
                            }
                        </Space>
                    </Input.Group>
                </Col>

                {state.authorViewData !='' && state.authorViewData != undefined &&                   
                    <>{( stateData.account_division === '1' && (state.authorViewData.type === '1' || state.authorViewData.type === '2' || state.authorViewData.type === '3'))  
                    || stateData.account_division == '4' || (stateData.account_division == '2' && (state.authorViewData.type === '1' || state.authorViewData.type === '2' || state.authorViewData.type === '3'))
                    ? 
                        <>{stateData.account_division != 4 ?
                            <><Col xs={24} lg={5} className="label">
                                유형
                            </Col>
                            <Col xs={24} lg={19}>
                                {state.authorViewData.type == '1' ? '한국인(주민등록번호 보유)' : state.authorViewData.type == '2' ? '한국 사업자': '한국 거주 외국인(외국인등록번호 보유)'}
                            </Col></>

                        :
                            <><Col xs={24} lg={5} className="label">
                                유형
                            </Col>
                            <Col xs={24} lg={19}>
                                한국 사업자
                            </Col></>
                        }
                        <Col xs={24} lg={5} className="label">
                            주민/사업자/외국인번호
                        </Col>
                        <Col xs={24} lg={19}>
                            {stateData.account_division == '4' ? state.authorViewData.company_no :
                            state.authorViewData.type == '2' ? state.authorViewData.person_no: state.authorViewData.person_no.substring(0,7)+'*******'}
                        </Col>
                        {state.authorViewData.type !== '2' &&
                            <><Col xs={24} lg={5} className="label">
                                과세 구분
                            </Col>
                            <Col xs={24} lg={19}>
                                {state.authorViewData.taxation_type== '1' ? '사업소득' : state.authorViewData.taxation_type== '2' ? '기타소득' : state.authorViewData.taxation_type== '3' ? '면세' : '과세'}
                            </Col></>
                        }
                        <Col xs={24} lg={5} className="label">
                            계좌 정보
                        </Col>
                        <Col xs={24} lg={19}>
                            {bankIpt === false ?                      
                                stateData.etc_account_no != ''
                                ?   <><Text style={{ marginRight: '5px' }}> {state.bankName} / {stateData.etc_account_no} / {stateData.etc_depositor}</Text>
                                    { typeChk !=='' && typeChk !== undefined  ? '' : <Button onClick={(e)=> {bankIptView(true)}}>다른 계좌(가상 계좌 등) 입력</Button> }
                                    </>
                                : stateData.account_division === '4' ? 
                                    <> <Text style={{ marginRight: '5px' }}> {state.authorViewData.bank =='' || state.authorViewData.bank == undefined 
                                        ? '': state.authorViewData.bank.name} / {state.authorViewData.account_no} / {state.authorViewData.depositor}</Text>
                                        { typeChk !=='' && typeChk !== undefined  ? '' : <Button onClick={(e)=> {bankIptView(true)}}>다른 계좌(가상 계좌 등) 입력</Button>}</>
                                    
                                    : state.authorViewData.account_type === '1' || state.authorViewData.account_type === '' || state.authorViewData.account_type === undefined || state.authorViewData.account_type === null
                                        ?
                                        <> <Text style={{ marginRight: '5px' }}> 
                                            {state.authorViewData.bank_name} / {state.authorViewData.account_no} / {state.authorViewData.depositor}</Text>
                                            {stateData.account_division === '1' && (typeChk ==='' || typeChk === undefined ) 
                                            ?  <Button onClick={(e)=> {bankIptView(true)}}>다른 계좌(가상 계좌 등) 입력</Button> : ''}  </>

                                        : <> <Text style={{ marginRight: '5px' }}> 
                                            {state.authorViewData.bank_name_eng} / {state.authorViewData.swift_code} / {state.authorViewData.account_no} / {state.authorViewData.depositor}</Text>
                                            {/* { typeChk !=='' && typeChk !== undefined  ? '' : <Button onClick={(e)=> {bankIptView(true)}}>다른 계좌(가상 계좌 등) 입력</Button>}  */}
                                        </>

                            : <>
                                <Input.Group>
                                    <Space direction="horizontal" >
                                            <Select
                                                placeholder="은행 선택"
                                                value={stateBank.etc_bank_id != '' && stateBank.etc_bank_id != undefined ? stateBank.etc_bank_id:'선택해주세요.'}
                                                onChange={handleChangeInput('etc_bank_id')}
                                                style={{width:'100%'}}
                                            >
                                                {bankData.map((e) => (
                                                    <Option value={e.id}>
                                                        {e.name}
                                                    </Option>
                                                ))}
                                            </Select>

                                            <Input
                                                name="etc_account_no"
                                                value={stateBank.etc_account_no}
                                                onChange={handleChangeInput(
                                                    'etc_account_no'
                                                )}
                                                placeholder="계좌번호 (ex.123-12-123)"
                                                autoComplete="off"
                                                maxLength="20"
                                            />

                                            <Input
                                                name="etc_depositor"
                                                value={stateBank.etc_depositor}
                                                onChange={handleChangeInput(
                                                    'etc_depositor'
                                                )}
                                                placeholder="예금주"
                                                autoComplete="off"
                                            />
                                            <Button type="primary" onClick={(e)=> {bankModify()}}>확인</Button>
                                            <Button  onClick={(e)=> {bankIptView(false)}}>취소</Button>
                                    </Space>
                                </Input.Group>
                                </>
                            }
                        </Col>
            
                        <Col xs={24} lg={5} className="label">
                            월 결제 여부 <span className="spanStar">*</span>
                            <Popover content={tooltip[1]}>
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
                            <Radio.Group onChange={handleChangeInput('monthly_payment_yn')} value={stateData.monthly_payment_yn} disabled={typeChk !=='' && typeChk !== undefined  ? true : false}>
                                <Radio value="N">아님</Radio>
                                <Radio value="Y">맞음(예: 서점 광고비를 월 1회 모아서 지급)</Radio>
                            </Radio.Group> 
                        </Col>     
                        </>               
                    : stateData.account_division === '5' ? 
                        <> <Col xs={24} lg={5} className="label">
                            계좌 정보
                        </Col>
                        <Col xs={24} lg={19}>
                            {state.authorViewData.user_account.bank_name2 !=='' && state.authorViewData.user_account.bank_name2 !== undefined && state.authorViewData.user_account.bank_name2 !== null 
                            || state.authorViewData.user_account.account_no2 !=='' && state.authorViewData.user_account.account_no2 !== undefined && state.authorViewData.user_account.account_no2 !== null 
                            || state.authorViewData.user_account.depositor2 !=='' && state.authorViewData.user_account.depositor2 !== undefined && state.authorViewData.user_account.depositor2 !== null 
                            ? <><Text style={{ marginRight: '5px' }}> {state.authorViewData.user_account.bank_name2} / {state.authorViewData.user_account.account_no2} / {state.authorViewData.user_account.depositor2} ('개인 비용 계좌' 수정은 재무지원팀에 요청해 주세요.)</Text></>
                            : " ('개인 비용 계좌' 수정은 재무지원팀에 요청해 주세요.)" }
                        </Col> </>     
                    :
                      <>
                        <Col xs={24} lg={5} className="label">
                            유형
                        </Col>
                        <Col xs={24} lg={19}>
                            {stateData.account_division !== '3' ?
                                state.authorViewData.type == '1' ? '한국인(주민등록번호 보유)' : state.authorViewData.type == '2' ? '한국 사업자'
                                : state.authorViewData.type == '3' ? '한국 거주 외국인(외국인등록번호 보유)': state.authorViewData.type == '4' ? '해외 거주자': '해외 사업자'
                            : state.authorViewData.type == '1' ? '국내 업체': '해외 업체'
                            
                            }
                        </Col>
                        <Col xs={24} lg={5} className="label">
                            성명/사업자명(원어)
                        </Col>
                        <Col xs={24} lg={19}>
                            {state.authorViewData.name}
                        </Col>
                        <Col xs={24} lg={5} className="label">
                            국적
                        </Col>
                        <Col xs={24} lg={19}>
                            {state.authorViewData.country}
                        </Col>
                        <Col xs={24} lg={5} className="label">
                            계좌 정보
                        </Col>
                        <Col xs={24} lg={19}>
                            {stateData.account_division == '1' || stateData.account_division == '2' ?        
                                state.authorViewData.account_type === '2' || state.authorViewData.account_type === '' || state.authorViewData.account_type === undefined || state.authorViewData.account_type === null    
                                ? <> <Text style={{ marginRight: '5px' }}> {state.authorViewData.bank_name_eng} / {state.authorViewData.swift_code} / {state.authorViewData.account_no} / {state.authorViewData.depositor}</Text></>
                                : <><Text style={{ marginRight: '5px' }}> {state.authorViewData.bank_name} / {state.authorViewData.account_no} / {state.authorViewData.depositor}</Text></>
                            :
                                <> { state.authorViewData.accounts.map((e)=>(
                                    e.purpose == '수입' &&
                                        <Text style={{ marginRight: '5px' }}> {e.purpose} / {e.bank_name_eng} / {e.swift_code} / {e.account_no} / {e.depositor}</Text> 
                                ))}</>
                            }
                        </Col> </>              
                    }

                    <Col xs={24} lg={5} className="label">
                        증빙 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={19}>
                        <Row>
                            <Col>
                            {stateData.evidence != '' && stateData.evidence != undefined ? (
                                <div>{stateData.evidence[0].type == 1 ? '세금계산서': stateData.evidence[0].type == 2 ? '계산서':stateData.evidence[0].type == 3 ? '현금영수증':stateData.evidence[0].type == 4 ? '영수증': stateData.evidence[0].type == 5 ?'개인(원천징수)' : ''}
                                ({stateData.evidence[0].submission_timing == 1 ? '함께 제출': stateData.evidence[0].submission_timing == 2? '입금/사용 후 제출' :''})
                                <Button  disabled={typeChk !=='' && typeChk !== undefined  ? true : false} shape="circle" className="btn_del" onClick={(e)=>evidenceDel()}>X</Button></div>
                            ) : (
                                <Button className="btn btn-primary btn_add" shape="circle" onClick={(e)=> {evidenceDrawer()}} style={{backgroundColor: 'none'}}>+</Button> 
                            ) }
                            </Col>
                        </Row>
                    </Col> </>
                }
            </Row>  

            
            { clientAdd === true &&
                <ClientAdd  
                    visible={clientAdd}
                    onClose={clientAddClose}
                    chkPage="billingEvidenceList"
                    chkPageAddData={clientAddData}
                />           
            } 

            { evidence === true &&
                <Evidence  
                    chkVisible={evidence}
                    evidenceClose={evidenceClose}
                    chkEvidencData={chkEvidencData}
                    tooltip={tooltip[2]}
                    totalCost = {totalCost}
                    authorViewData={state.authorViewData}
                />           
            }
        </Wrapper>
    );
});

export default EvidenceList;
