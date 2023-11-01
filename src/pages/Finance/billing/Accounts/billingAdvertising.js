import React, {useState, useCallback, useEffect}from 'react'
import {Row, Col, Button, Modal, Upload, message, Radio, Input, Pagination} from 'antd'
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { Selector } from "@grapecity/wijmo.grid.selector";
import { CollectionView } from "@grapecity/wijmo";
import * as wjGrid from '@grapecity/wijmo.grid';
import {InputDate} from '@grapecity/wijmo.react.input';
import * as wjcGridXlsx from '@grapecity/wijmo.grid.xlsx';
import * as wjcXlsx from '@grapecity/wijmo.xlsx';

import { toJS } from 'mobx';

import moment from 'moment';
import Excel from '@components/Common/Excel';
import useStore from '@stores/useStore';

const Wrapper = styled.div`
    width: 100%;
`;

const BillingAdvertising = ({tab})=>{
    const { commonStore } = useStore();
    const { Search } = Input;
    const state = useLocalStore(() => ({
        list: [],
        selector:'',
        start_date: moment().toDate('YYYY-MM-DD'),
        end_date: moment().toDate('YYYY-MM-DD'),

        total: 0,
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },

        userInfo : '',      //로그인정보
        chkCellData : [],   //입금생성파일 데이터

        selectorId : [], //체크 아이디값
        selectorIdChk : 0, //체크 처리상태값 확인

        selectorIdChk: 0 ,   //승인대기 체크
        approval_flag : '', //입금 승인 radio
        chkFile : 0, //입금파일생성 조건 체크

        flex : '',  //입금승인파일생성 grid
        depositResult : [], //입금결과등록데이터
        depositResultError : [], //입금결과등록중 오류데이터

        file :'',       //입금결과등록 파일
        importChk : false
    }));

    useEffect(() =>{      
        state.userInfo = commonStore.user
    },[])

    useEffect(()=>{        
        if(tab == 'billingAdvertising'){
            //초기화
            fetchData();     
        } 
    },[tab]);

    const fetchData = useCallback(async (val,startdate,enddate) => {        
        if (val == '' || val == '0' || val == undefined) {
            var page = 1;
        } else {
            var page = val;
        }

        if(startdate){
            var dateStart = '&startdate='+moment(startdate).format('YYYY-MM-DD');
        }

        if(enddate){
            var dateEnd = '&enddate='+moment(enddate).format('YYYY-MM-DD');
        }

        var axios = require('axios');

        var config = {
            method: 'GET',
            url:process.env.REACT_APP_API_URL +'/api/v1/advertising-monthly-payment?display='+state.pageArr.pageCnt +'&page='+page+'&sort_by=date&order=desc'+dateStart+dateEnd,
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
                var result_page =
                    (page - 1) * state.pageArr.pageCnt;
                var str_no = result.data.meta.total - result_page;

                result.data.data.map((e, number) => {
                    // e.cnt = str_no - number;               
                    if(e.published_at){
                        e.published_at = e.published_at.substring(0,10);           
                    }
                    if(e.payment_approval1_at){
                        e.payment_approval1_at = e.payment_approval1_at.substring(0,10);           
                    }
                    if(e.payment_approval2_at){
                        e.payment_approval2_at = e.payment_approval2_at.substring(0,10);           
                    }
                    e.total_amount = commaNum(e.total_amount);
                    e.vat = commaNum(e.vat);
                    e.amount = commaNum(e.amount);
                    if( e.account_no){
                        // e.account_no = e.account_no.substring(0,3)+'-'+e.account_no.substring(3,2)+'-'+e.account_no.substring(5,5);
                    }
                    
                });

                state.list = result.data.data;
                state.total = result.data.meta.total;
                state.pageArr.page = result.data.meta.current_page;
                state.pageArr.pageCnt = result.data.meta.per_page;
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


    //페이징 데이터
    const pageChange = (num)=>{
        fetchData(num,'','');
    }

    const commaNum = (num) => {  
        if(num){
            const number = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return number
        }else{
            return 0;
        }
    } 

    //승인정보 로그인체크
    const [approvalsChk,setApprovals] = useState(true);
    //입금생성 로그인체크
    const [depositResultChk,setDepositResultChk] = useState(false);
    //입금등록버튼 로그인체크
    const [depositChk,setResultChk] = useState(false);

    const initGrid = (grid) => {
        state.flex= grid;

        state.selector = new Selector(grid, {
            itemChecked: (s, e) => {
                var selectedItem = grid.rows.filter(r => r.isSelected)

                console.log(selectedItem)

                if(selectedItem.length === 0){
                    //*1차 승인: 재무지원팀원(tori86@gilbut.co.kr, wlgp519@gilbut.co.kr) > 2차 승인: 재무지원팀장(wproh@gilbut.co.kr)
                    if(state.userInfo.email === 'tori86@gilbut.co.kr' || state.userInfo.email === 'wlgp519@gilbut.co.kr' || state.userInfo.email === 'wproh@gilbut.co.kr' ){
                        setApprovals(true)
                    }
                    //입금생성 수정권한 확인후
                    if(state.chkCellData.length >0){
                        //setDepositResultChk(true)
                    }
                    
                }else{
                    //승인
                    if(state.userInfo.email === 'tori86@gilbut.co.kr' || state.userInfo.email === 'wlgp519@gilbut.co.kr' || state.userInfo.email === 'wproh@gilbut.co.kr' ){
                        setApprovals(false)
                    }
                    //입금생성 수정권한 확인후
                    if(state.chkCellData.length >0){
                        //setDepositResultChk(false)
                    }

                    //승인
                    var chk = 0;                    
                    var arr = [];                    
                    selectedItem.forEach(e => {
                        console.log(e.dataItem)
                        if(e.dataItem.payment_status !== '승인 대기' && e.dataItem.payment_status !== '1차 승인 대기' && e.dataItem.payment_status !== '2차 승인 대기'){
                            chk++                    
                        }else{                       
                            arr = [...arr,e.dataItem['payments.id']]  
                        }
                    });
                    state.selectorIdChk = chk;                    
                    state.selectorId = arr;
                    console.log(toJS(state.selectorId))
                   

                    //입금생성
                    var chkFile = 0;
                    var arr2 = [];
                    selectedItem.forEach(e => {
                        console.log(e.dataItem)
                        if(e.dataItem.payment_status !== '입금 대기' && e.dataItem.payment_status !== '부분 입금'){
                                chkFile++                   
                        }else{                       
                            e.dataItem.deposit_file.total_amount = e.dataItem.total_amount
                            if(e.dataItem.deposit_file.etc_bank_id !=='' && e.dataItem.deposit_file.etc_bank_id !== undefined && e.dataItem.deposit_file.etc_bank_id !== null){
                                arr2 = [...arr2,{bank_name: e.dataItem.deposit_file.etc_bank_name, 
                                    account_no: e.dataItem.deposit_file.etc_account_no,
                                    total_amount: e.dataItem.deposit_file.total_amount,
                                    depositor: e.dataItem.deposit_file.etc_depositor, 
                                    deposit_code: e.dataItem.deposit_file.deposit_code}]
                            }else{
                                arr2 = [...arr2,e.dataItem.deposit_file]
                            }
                            
                        }
                    });

                    state.chkFile = chkFile;
                    state.chkCellData = arr2
                    console.log(toJS(state.chkCellData))
                }          
            }
        });


        let extraRow = new wjGrid.Row();
        extraRow.allowMerging = true;
        
        var panel = grid.columnHeaders;
        panel.rows.splice(0, 0, extraRow);

        state.selector._col.allowMerging = true;
        state.selector._col._cssClassAll = "chkAll";

        for (let colIndex = 0; colIndex <= 11; colIndex++) {
            if(colIndex >= 7 && colIndex <= 8){ 
                panel.setCellData(0, colIndex, '1차 승인');
            } else if(colIndex >= 9 && colIndex <= 10) {
                panel.setCellData(0, colIndex, '2차 승인');
            } else {
                let col = grid.getColumn(colIndex);
                col.allowMerging = true;
                panel.setCellData(0, colIndex, col.header);
            }            
        }
        
        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.columnHeaders) {
                let html = e.cell.innerHTML;
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + "<br/>" + html.split('\\n')[1] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }

            // center-align merged header cells
            // if (e.panel == s.columnHeaders && e.range.rowSpan > 1) {
            //     var html = e.cell.innerHTML;
            //     e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
            // }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;

                switch (col.binding) {
                    case 'payment_status':
                        if(item.payment_status === '입금 완료'){
                            if(item.payment_at){
                                var payment_at= item.payment_at.substring(0,10);           
                            }
                            e.cell.innerHTML = `${item.payment_status}(${payment_at})`;
                        }
                        break;
                   
                }
            }
        });

        grid.autoGenerateColumns = false;
        grid.itemsSource = state.list;
    }

    const handleChangeDate = useCallback(
        (type) => (date) => {
            if(type === 'start_date'){
                if(moment(date.value).format('YYYY-MM-DD') > moment(state['end_date']).format('YYYY-MM-DD')){
                    state[type] = moment(date.value).format('YYYY-MM-DD');
                    state['end_date'] = moment(state[type]).add(1,'months').format('YYYY-MM-DD');
                }else{
                    state[type] = moment(date.value).format('YYYY-MM-DD');
                }
            }else{                
                if(moment(state['start_date']).format('YYYY-MM-DD') > moment(date.value).format('YYYY-MM-DD')){
                    state[type] = moment(date.value).format('YYYY-MM-DD');
                    state['start_date'] = moment(state[type]).add(-1,'months').format('YYYY-MM-DD');
                }else{
                    state[type] = moment(date.value).format('YYYY-MM-DD');
                }
            }
            // state[type] = date.value;
            // state[type] = moment(date.value).format('YYYY-MM-DD');
        },
        [],
    );

    //승인 모달
    const [approvalModalOpen, setApprovalModalOpen] = useState(false);   
    const showApprovalModal = () => {
        if(state.selectorId.length === 0 && state.selectorIdChk === 0){
            Modal.error({
                title:"승인할 리스트를 선택해주세요.",
                onOk(){
                    return false;
                },
            });
        }else{
            if(state.selectorIdChk === 0){
                setApprovalModalOpen(true);
            }else{
                Modal.error({
                    content: "처리상태가 '승인대기'인 것만 선택해주세요.",        
                });
            }
        } 
        
    };
    const approvalHandleOk = () => {
        setApprovalModalOpen(false);
    };
    const approvalHandleCancel = () => {
        setApprovalModalOpen(false);
    };
    // const [approvalValue, setApprovalValue] = useState(1);
    const approvaOnChange = (e) => {
        state.approval_flag = e.target.value
    };
    //승인 값
    const approvalApiSubmit = useCallback(async (val)=> {
        var axios = require('axios');
        if(state.approval_flag === ''){
            message.warning('입금승인을 선택해주세요.');
        }else{
            var data = {payment_id: toJS(state.selectorId), approval_flag : state.approval_flag }
            console.log( data)
            // return
            var config={
                method:'POST',
                url:process.env.REACT_APP_API_URL +'/api/v1/deposit-approvals',
                headers:{
                    'Accept':'application/json',
                },
                    data:data
                };
                
            axios(config)
            .then(function(response){
                if(response.data.success != false){
                    setApprovalModalOpen(false);
                    Modal.success({
                        title: response.data.result,
                        onOk(){
                            fetchData('',state.start_date,state.end_date)
                            
                            //초기화
                            state.selectorId =[];
                            state.approval_flag = '';
                            state.selectorIdChk =0;
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
                console.log(error.response.status);
                if(error.response.status === 401){
                    Modal.error({
                        title : '재무지원팀장 또는 경영지원본부장만 승인 가능합니다.',
                    }); 
                    
                }else{
                    Modal.error({
                        title : '문제가 발생하였습니다.',
                        content : '오류코드:'+error.response.status
                    });  
                }
            });
        }       
    })   

    const [importModalOpen, setImportModalOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const showImportModal = () => {
        setImportModalOpen(true);
    };
    const importHandleOk = () => {
        setImportModalOpen(false);
    };
    const importHandleCancel = () => {
        state.depositResultError = [];
        state.importChk = false
        setImportModalOpen(false);
        setLoading(false)
    };

    const initializeGrid=(flex)=> {
        state.flex = flex;
        console.log(flex)
    }
    
    //입금파일생성 
    const excelDown =()=> {
        console.log(state.chkCellData)

        if(state.chkCellData.length === 0 && state.chkFile === 0){
            message.warning('입금파일을 생성할 내용을 선택해주세요.');
        }else{
            if(state.chkFile > 0){
                Modal.warning({
                    title : '처리 상태가 "입금 대기" 또는 "부분 입금"인 건만 선택해 주세요.',
                });  

            }else{
                var today = moment().format('YYYY-MM-DD');
                console.log(state.flex)

                wjcGridXlsx.FlexGridXlsxConverter.saveAsync(state.flex, {
                    includeColumnHeaders: true,
                    includeStyles: true,
                }, today+'.xlsx');
            }
        }   
           
    }

    //입금결과등록
    const handelDepositResult = useCallback(async (val)=> {
        if(state.depositResult === 0){
            Modal.warning({
                content: "입금결과를 등록할 데이터가 없습니다.",        
            });
        }else{
            var data = toJS(state.depositResult);
            setLoading(true)
            // return
            var axios = require('axios');

            var config = {
                method: 'POST',
                url:process.env.REACT_APP_API_URL +'/api/v1/deposit-result-file',
                headers:{
                    'Accept':'application/json',
                },
                    data:data
                };
            axios(config)
            .then(function(response){
                setLoading(false)
                console.log(response.data)
                var chk = 0;
                var arr = []
                response.data.status.forEach(e => {
                    if(e.status === 'FAIL'){
                        arr = [...arr,e.deposit_code]
                        chk++;
                    }

                    state.depositResultError = arr.join(',')
                });
                if(chk === 0){
                    setImportModalOpen(false)
                    fetchData('',state.start_date,state.end_date)
                }else{
                    state.importChk = true
                }
            })
            .catch(function(error){
                console.log(error.response.status);
                Modal.error({
                    title : '등록시 문제가 발생하였습니다.',
                    content : '오류코드:'+error.response.status
                });  
            });
        }       
    })

    const load=()=> {
        let fileInput = document.getElementById('importFile');
        if (fileInput.files[0]) {
            loadGrid(state.flex, fileInput.files[0])
            // wjcGridXlsx.FlexGridXlsxConverter.loadAsync(state.flex, state.file, null, function (workbook) {
            //     var arr = [];
            
            //     workbook.sheets[0].rows.forEach((e,index) => {
            //         if(index > 0){
            //             arr = [...arr, {bank_name: e.cells[0].value, account_no : e.cells[1].value, total_amount : e.cells[2].value.replace(",", ""), depositor : e.cells[3].value, deposit_code : e.cells[4].value}]
            //         }
            //     });
            //     console.log(toJS(arr))
            //     state.depositResult = arr;
            //     handelDepositResult()
            // }, function (reason) {
            //     Modal.warning({
            //         title : '오류가 발생되었습니다. 재시도해주세요.',
            //     });  
            // });
        }else{
            Modal.warning({
                title : '데이터를 가져올 파일을 올려주세요.',
            });  

        }
    }

    const loadGrid = (grid, file)=>{
        let reader = new FileReader();
    
        reader.onload = function (e) {
            let _workbook = new wjcXlsx.Workbook(); // workbook 인스턴스 생성
            _workbook.loadAsync(reader.result, (workbook) => {
                let sheet = workbook.sheets[0];
                let excelRow = sheet.rows[0];
                let count = 0;
                for (let i = 0; i < grid.columns.length; i++) {
                    if (excelRow.cells[i].value === grid.columns[i].header) { // 헤더 체크
                        count++;
                    }
                }
                if (count === grid.columns.length) { 
                    var arr = []
                    workbook.sheets[0].rows.forEach((e,index) => {
                        if(index > 0){
                            arr = [...arr, {bank_name: e.cells[0].value, account_no : e.cells[1].value, total_amount : e.cells[2].value, depositor : e.cells[3].value, deposit_code : e.cells[4].value}]
                        }
                    });
                    state.depositResult = arr;
                    handelDepositResult()   

                } else {
                    var key = 'depositResultError'
                    message.warning({ content: '입금파일 엑셀로 입금 결과 등록이 가능합니다. ', key});       
                }
            
            });
        };
        reader.readAsDataURL(file);
    }

    const handleChange = (e) => {
        state.file = e.target.files[0]
    };

    //검색
    const handleSearch = (data) => {
        console.log(data)
        fetchData(state.pageArr.page, data)
    } 

    return (
        <Wrapper>
            <Row className="topTableInfo" >
                <Col span={4}>
                    <Search
                        placeholder="검색어 입력"
                        onSearch={handleSearch}
                        enterButton
                        allowClear
                        style={{width: 200 }}
                    />
                </Col>
                <Col span={20} className="topTable_right">
                    <InputDate value={state.start_date} valueChanged={handleChangeDate('start_date')} style={{height: 34}}/> ~ <InputDate value={state.end_date} valueChanged={handleChangeDate('end_date')} style={{height: 34}}/>
                    <Button style={{marginLeft: 10, marginRight: 10}} onClick={()=>fetchData('',state.start_date,state.end_date)}>선택기간 생성</Button>
                    {/* <Button onClick={(e)=>showApprovalModal()}>승인</Button>
                    <Button>입금 파일 생성</Button>
                    <Button>입금 결과 등록</Button> */}
                    
                    {/* 체크했을때 승인버튼은 재무팀장,경영지원본부장만 보임 */}
                    <Button onClick={showApprovalModal} disabled={approvalsChk}>승인</Button>
                    <>
                    {/* 체크했을때 수정권한인 사람만 보임 */}
                    <Button style={{marginLeft: 10}} onClick={(e)=>excelDown()} >입금 파일 생성</Button> 
                    {/* <><Button style={{marginLeft: 10}} onClick={(e)=>excelDown()} disabled={depositResultChk}>입금 파일 생성</Button> */}

                    {/* 수정권한 있는 사람 항상보임 */}
                    {/* <Button style={{margin: 0, marginLeft: 10}} onClick={(e)=>setImportModalOpen(true)} disabled={depositChk}>입금 결과 등록</Button> */}
                    <Button style={{margin: 0, marginLeft: 10}} onClick={(e)=>setImportModalOpen(true)} >입금 결과 등록</Button> </>
                </Col>
            </Row>
            <Row id='gridWrap' className='gridWrap'>
                <FlexGrid
                    itemsSource={state.list}
                    initialized={(s) => initGrid(s)}
                    stickyHeaders={true}
                    allowMerging="ColumnHeaders"
                >
                    <FlexGridColumn header="거래처명" binding="account_name" width='*' minWidth={120} isReadOnly={true}/>
                    <FlexGridColumn header="사업자 등록 번호" binding="account_no" width={130} isReadOnly={true}/>
                    <FlexGridColumn header="비용 귀속" binding="company" width={100} isReadOnly={true}/>
                    <FlexGridColumn header="세금계산서\n발행일" binding="published_at" width={100} isReadOnly={true}/>
                    <FlexGridColumn header="공급가" binding="amount" align="right" width={100} isReadOnly={true}/>
                    <FlexGridColumn header="부가세" binding="vat" align="right" width={90} isReadOnly={true}/>
                    <FlexGridColumn header="합계" binding="total_amount" align="right" width={100} isReadOnly={true}/>
                    <FlexGridColumn header="승인자" binding="payment_approver1_name" width={70} isReadOnly={true}/>
                    <FlexGridColumn header="승인일" binding="payment_approval1_at" width={100} isReadOnly={true}/>
                    <FlexGridColumn header="승인자" binding="payment_approver2_name" width={70} isReadOnly={true}/>
                    <FlexGridColumn header="승인일" binding="payment_approval2_at" width={100} isReadOnly={true}/>
                    <FlexGridColumn header="처리 상태" binding="payment_status" width={130} isReadOnly={true}/>
                </FlexGrid>
            </Row>

            <Row gutter={10} className="table table_bot">
                <Col xs={16} lg={16}>
                    <div className="btn-group">
                        <Pagination defaultCurrent={1} defaultPageSize={state.pageArr.pageCnt} current={state.pageArr.page} total={state.total} onChange={pageChange}/>
                        <span style={{marginLeft: 20}}>행 개수 : {state.total}</span>
                    </div>
                </Col>
                <Excel />
            </Row>

            {/* 입금승인 테이블 */}
             <FlexGrid
                alternatingRowStep={0}
                initialized={initializeGrid}
                itemsSource={state.chkCellData}
                style={{display:'none'}}
            >
                <FlexGridColumn binding="bank_name" header="은행명" width={150} align="center" />
                <FlexGridColumn binding="account_no" header="계좌번호" width={150} align="center"/>
                <FlexGridColumn binding="total_amount" header="금액" width={150} align="center"/>
                <FlexGridColumn binding="depositor" header="예금주" width={150} align="center"/>
                <FlexGridColumn binding="deposit_code" header="입금 관리 코드" width={150} align="center"/>           
            </FlexGrid>

            {/* 승인모달 */}
            <Modal title="입금 승인" visible={approvalModalOpen} onOk={approvalHandleOk} onCancel={approvalHandleCancel} footer={[
                <Button type="primary" onClick={(e)=>approvalApiSubmit()}>확인</Button>
            ]}>
                <Radio.Group name="approval_flag" onChange={approvaOnChange} >
                    <Radio value='1' style={{marginRight: 30}}>담당 단계만 승인</Radio>
                    <Radio value='2'>1, 2차 모두 승인</Radio>
                </Radio.Group>
            </Modal>

            {/* 입금 결과 */}
            <Modal title="입금 결과 등록" visible={importModalOpen} onOk={importHandleOk} onCancel={importHandleCancel} 
                footer={loading === true ? '' : [              
                    <Button type="primary" onClick={(e)=>load()} style={state.importChk === true ? {display:'none'} : {display:'inline-block'}}>확인</Button>
                        // <Button type="primary" onClick={fileImport}>확인</Button>
                ]}>
                {loading === true ? 
                    (
                        <p>처리 중입니다. 잠시 기다려 주세요<br />끝나면 리스트에 바로 반영됩니다..</p>
                    ) : (state.depositResultError.length > 0) ?
                    (
                        <p>아래 행은 오류로 처리하지 못했습니다.<br />오류 입금관리코드: {state.depositResultError}</p>
                    )                    
                    : (
                        <input type="file" className="form-control"  id="importFile" ref={React.createRef()}
                        onChange={handleChange}
                        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel, application/vnd.ms-excel.sheet.macroEnabled.12"/>
                    )               
                }
            </Modal>
        </Wrapper>
    );
}


export default observer(BillingAdvertising);