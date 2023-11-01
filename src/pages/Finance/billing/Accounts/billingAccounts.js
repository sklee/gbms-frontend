import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {Row, Col, Button, Modal, Table, Select, message, Typography, Radio, Pagination, Input } from 'antd';

import { observer, inject, useLocalStore } from 'mobx-react';
import { Field, FieldArray, Form, Formik, FormikProvider, useField, useFormik,} from 'formik';
import { FormikInput, FormikContainer} from '@components/form/CustomInput'
import * as Yup from 'yup';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import * as wjInputC from '@grapecity/wijmo.react.input';
import { CollectionView } from "@grapecity/wijmo";
import * as wjcGridXlsx from '@grapecity/wijmo.grid.xlsx';
import moment from 'moment';

import styled from 'styled-components';
import Column from 'antd/lib/table/Column';
import ColumnGroup from 'antd/lib/table/ColumnGroup';
import useStore from '@stores/useStore';
import { toJS } from 'mobx';

import Excel from '@components/Common/Excel';
import TaxBill from './evidence'

const Wrapper = styled.div`
    width: 100%;
    #tplBtnViewMode {
        display: none;
    }
`;

const BillingAccountsTest = ( props ) => {
    const { commonStore } = useStore();
    const { Search } = Input;
    const [rowEditing, setRowEditing] = React.useState('')
    const [editingType, setEditingType] = React.useState('')
    const lastIndex = React.useRef(0)
    const [pageRegist, setPageRegist] = useState(false)

    const [approvalModalOpen, setApprovalModalOpen] = useState(false)
    const [approvalsChk,setApprovalsChk] = useState(true)
    const [importModalOpen, setImportModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [taxVisible, setTaxVisible] = useState(false)

    const [classOptions,setClassOptions] = useState({
        first: [],
        second: [],
        third: [],
    });

    let timedOut = null

    const isEditing = (record) => pageRegist && record.dataIndex === rowEditing;
    const state = useLocalStore(()=>({
        list : [],
        addBtn : true,              //추가버튼 활성화

        userInfo : {},

        selectCode1:[], //비용청구분류 1depth
        selectCode2:[], //비용청구분류 2depth
        selectCode3:[], //비용청구분류 3depth
        code1Data: [],

        purchaseAccounts : [],
        
        yearOption : Array.from({ length: new Date().getFullYear() - 2020 }, (_, index) => {
            return {value : (new Date().getFullYear() - index).toString(), label : (new Date().getFullYear() - index).toString() + '년'}
        }).reverse(),
        monthOption : Array.from({ length: 12 }, (_, index) => {
            return {value : (index + 1).toString(), label : (index + 1).toString() + '월'}
        }),
        
        year : '',
        month : '',
        billingDate : '',   //최종등록년월
        billingDateChk : false,

        grid : '',  //입금승인파일생성 grid
        chkFile : 0, //입금파일생성 조건 체크
        chkCellData : [],   //입금생성파일 데이터
        selectorId : [], //체크 아이디값
        selectorIdChk : 0, //체크 처리상태값 확인

        depositResult : [], //입금결과등록데이터
        depositResultError : [], //입금결과등록중 오류데이터
        deposit_file:[],        //확인후 넘어오는 데이터

        //pagination
        total: 0,
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },
    }))

    useEffect(()=>{
        state.userInfo = commonStore.user
        chkBillingData().then(()=>{
            fetchData()
        })
        classificationCode()
        getPurchaseAccounts()
    },[])

    const chkBillingData = useCallback(async () => {
        const result = await commonStore.handleApi({
            url: '/max-billing-payment-accounts',
        });
        // state.billingDate = result.year + '-' + result.month;
        state.billingDate = formatYearMonth(result.year,result.month)
        state.billingDateChk = state.billingDate < moment().format('YYYY-MM') ? false : true
        state.year = result.year
        state.month = result.month
    }, [])

    const getPurchaseAccounts = useCallback(async (search) => {
        let keyword = ''
        if(search){
            keyword = '&keyword='+search
        }else{
            keyword = '&keyword=알앤'
        }
        const result = await commonStore.handleApi({
            url: '/search-purchase-accounts?display=100&page=1&sort_by=date&order=desc'+keyword,
        });
        state.purchaseAccounts = result.data.map(e=>{e.value = e.id; e.label = e.name; return e})
    }, [])

    const fetchData = useCallback(async (val) => {        
        if (val == '' || val == '0' || val == undefined) {
            var page = 1;
        } else {
            var page = val;
        }

        const result = await commonStore.handleApi({
            url: '/billing-payment-accounts',
            data:{
                display:state.pageArr.pageCnt,
                page:page,
                sort_by:'date',
                order:'desc',
                req_ym:state.billingDate
            }
        });
        result.data.map((e,index) => {
            if(e.tax_invoice_published_at){
                e.tax_invoice_published_at = e.tax_invoice_published_at.substring(0,10)        
            }
            if(e.payment_approval1_at){
                e.payment_approval1_at = e.payment_approval1_at.substring(0,10)       
            }
            if(e.payment_approval2_at){
                e.payment_approval2_at = e.payment_approval2_at.substring(0,10)      
            }

            e.amount = commaNum(e.amount)
            e.vat = commaNum(e.vat)
            e.total_amount = commaNum(e.total_amount)
            if(e.payment_status === '입금 완료'){
                state.chkStatus++
            }
            e.dataIndex = index
            e.isUpdating = false
            lastIndex.current += 1
        });
        formikHook.setFieldValue('listData', result.data)
        state.list = result.data
        state.total = result.meta.total
        state.pageArr.page = result.meta.current_page
        state.pageArr.pageCnt = result.meta.per_page
    }, [])

    //비용청구분류코드
    const classificationCode = useCallback(async (type,val) => {
        var code2Data,code3Data = []
        var data = {}
        if(type === '2depth'){
            data['parent_id'] = val
            data['depth'] = 2
        }else if(type === '3depth'){
            data['parent_id'] = val
            data['depth'] = 3
        }else{
            if(val){
                data['id'] = val
            }
        }
        const result = await commonStore.handleApi({
            url: '/billing-classification',
            data:data
        })

        if (result.success === false) {
            Modal.error({
                title: '오류가 발생했습니다.',
                content: '오류코드:' + result.message,
            });
        } else {
            result.data = result.data.map(e=>{
                e.value = e.id
                e.label = e.name
                return e
            })
            if(type == '2depth'){
                state.selectCode2 = result.data
                state.selectCode3 = [];
            }else if(type == '3depth'){      
                state.selectCode3 = result.data //3depth select
            }else{
                state.selectCode1 =result.data //1depth select
                state.selectCode2 =[];
                state.selectCode3 =[];
            }
            setClassOptions((prev)=>({
                ...prev,
                first:[...state.selectCode1],
                second:[...state.selectCode2],
                third:[...state.selectCode3],
            }))
        }
    });

    //회원권한
    const checkAccess = () =>{
        //권한 시스템이 미구현이라 임의로 설정
        //백엔드 쪽에서 권한 설정 후 재작업 예정
        if(state.userInfo){
            return !(state.userInfo?.team && state.userInfo?.position)
        }else{
            return true
        }
    }

    const handleChange = useCallback((type) => (e) => {
        if(type==='year'){
            state.year = e.selectedValue
        }else if(type==='month'){
            state.month = e.selectedValue
        }
        // state.billingDate = state.year+'-'+state.month
        state.billingDate = formatYearMonth(state.year,state.month)
        state.billingDateChk = state.billingDate < moment().format('YYYY-MM') ? false : true
        fetchData()
    },[])

    const pageChange = (num)=>{
        fetchData(num);
    }

    function formatYearMonth(year, month) {
        const formattedYear = String(year);
        const formattedMonth = String(month).padStart(2, '0');
        return `${formattedYear}-${formattedMonth}`;
    }

    const add = () => {
        setEditingType('add')
        formikHook.setFieldValue('listData', [secondInitialValues, ...formikHook.values.listData])
        lastIndex.current += 1
        secondFormikHook.setValues(secondInitialValues)
        console.log(toJS(secondFormikHook.values))
        setRowEditing(lastIndex.current)
    }

    const save = (record) => {
        secondFormikHook.handleSubmit()
    }

    const cancel = (record) => {
        // 새로 추가한 거인데 그룹명을 입력 안했으면 해당 Row 삭제
        record && record.id == '' && formikHook.setFieldValue('listData', formikHook.values.listData.filter(item => item.dataIndex !== record.dataIndex))
        // 새로 추가한 뒤 다시 추가 버튼을 눌렀을 경우
        !record && editingType === 'add' && formikHook.setFieldValue('listData', formikHook.values.listData.filter((item, index) => index !== 0))

        setRowEditing('')
        setEditingType('')
        secondFormikHook.setValues(secondFormikHook.initialValues)
    }

    const edit = (record) => {
        setRowEditing(record.dataIndex)
        record.id && setEditingType('edit')
        secondFormikHook.setValues(record)

        //비용청구분류 리스트 초기화
        if(record.class1_id){
            classificationCode('2depth',record.class1_id).then(()=>{
                if(record.class2_id){
                    classificationCode('3depth',record.class2_id)
                }
            })
        }

    }
    
    const remove = (record) => {
        setRowEditing('')
        setEditingType('')
        const targetIndex = formikHook.values.listData.findIndex(obj => obj.dataIndex === record.dataIndex)
        if ( ~targetIndex ) {
            if (record.id == '') {
                // 새로 추가한 거를 삭제하면 바로 화면에서 날리기
                record.id == '' && formikHook.setFieldValue('listData', formikHook.values.listData.filter(item => item.dataIndex !== record.dataIndex))
            }
            else {
                // 이외 기존 있던 거를 삭제하면 editingType remove 추가
                formikHook.values.listData[`${targetIndex}`].isUpdating = true
                formikHook.values.listData[`${targetIndex}`].editingType = 'remove'
            }
        }
        secondFormikHook.setValues(secondFormikHook.initialValues)
    }

    const confirmEdit = (record) => {
        if(record.payment_status==='계산서 대기' || record.payment_status==='승인 대기'){
            return !record.payment_approver1_name && !record.payment_approval1_at && !record.payment_approver2_name && !record.payment_approval2_at
        }else{
            return true
        }
    }

    const evidenceData=(data)=>{
        console.log(data)
        secondFormikHook.values.details = [...data.details]

        //set tax
        secondFormikHook.setFieldValue('tax_invoice_published_at',data.details[0].published_at)
        secondFormikHook.setFieldValue('amount',data.details[0].amount)
        secondFormikHook.setFieldValue('vat',data.details[0].vat)
        secondFormikHook.setFieldValue('total_amount',data.details[0].total_amount)

        console.log(secondFormikHook.values)
    }

    const commaNum = (num) => {  
        if(num){
            const number = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            return number
        }else{
            return 0
        }
    }

    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            // state.selectorId = selectedRowKeys
            if(selectedRowKeys.length === 0){
                setApprovalsChk(true)
            }else{
                setApprovalsChk(false)

                //승인
                var chk = 0;                    
                var arr = [];                    
                selectedRows.forEach(e => {
                    if(e.payment_status !== '승인 대기' && e.payment_status !== '1차 승인 대기' && e.payment_status !== '2차 승인 대기'){
                        chk++                    
                    }else{                       
                        arr = [...arr,e.id]  
                    }
                    });
                state.selectorIdChk = chk;
                state.selectorId = arr;

                //입금생성
                var chkFile = 0;
                var arr2 = [];
                selectedRows.forEach(e => {
                    if(e.payment_status !== '입금 대기' && e.payment_status !== '부분 입금'){
                            chkFile++                   
                    }else{       
                        e.deposit_file.total_amount = e.total_amount                
                        if(e.deposit_file.etc_bank_id !=='' && e.deposit_file.etc_bank_id !== undefined && e.deposit_file.etc_bank_id !== null){
                            arr2 = [...arr2,{
                                    bank_name   : e.deposit_file.etc_bank_name, 
                                    account_no  : e.deposit_file.etc_account_no,
                                    total_amount: e.deposit_file.total_amount,
                                    depositor   : e.deposit_file.etc_depositor, 
                                    deposit_code: e.deposit_file.deposit_code
                                }]
                        }else{
                            arr2 = [...arr2,e.deposit_file]
                        }
                    }
                });
                state.chkFile = chkFile;
                state.chkCellData = arr2
            }
        },
        getCheckboxProps: (record) => ({
            disabled: record.payment_status === '계산서 대기' || record.payment_status==='입금 완료' || !record.payment_status,
            // Column configuration not to be checked
            name: record.name,
        }),
    };

    const initialValues = {
        listData : []
    }

    const secondInitialValues = {
        // DB Data
        dataIndex       : lastIndex.current+1,
        id : '',
        accountable_id: '',  // 거래처 id
        company: "",         // 비용귀속 회사코드
        class1_id: '',       // 비용청구 분류1 id 
        class2_id: '',       // 비용청구 분류2 id
        class3_id: '',       // 비용청구 분류3 id
        amount: "",          // 공급가 합계
        vat: "",             // 부가세 합계
        total_amount: "",    // 총 금액 합계
        details: [
            {
                approval_no:"",     // 세금계산서 승인번호
                publisher:"",       // 세금계산서 공급/발행자
                person_no:"",       // 세금계산서 공급/발행자 사업등록번호
                published_at:"",    // 세금계산서 발행/사용일
                item:"",                  // 세금계산서 품목
                amount: "",              // 공급가
                vat: "",                  // 부가세
                total_amount: ""         // 합계
            }
        ],
        isUpdating      : true,
        editingType     : 'add'
    };

    const modalInitialValues = {
        approval_flag : '',
        payment_id : []
    }

    const onSubmit = (formData) => {
        const tempData = formData.listData.filter(item => item.isUpdating)
        //isupdating,editingType,listData 반영
        const submitList = ['id','accountable_id','company','class1_id','class2_id','class3_id','amount','vat','total_amount','details']

        const returnData = tempData.map(items=>{
            const returnItem = {}
            submitList.forEach(e=>{
                returnItem[e] = items[e]
            })
            if(items.editingType === 'remove'){
                returnItem['use_yn'] = 'N'
            }
            return returnItem
        })

        console.log(returnData)
    }

    const secondOnSubmit = (formData) => {
        console.log(formData)
        formData.isUpdating = true
        if (!formData.editingType || formData.editingType == '') {
            formData.editingType = editingType
        }

        // REPLACE
        const targetIndex = formikHook.values.listData.findIndex(obj => obj.dataIndex === formData.dataIndex)
        ~targetIndex && formikHook.setFieldValue(`listData[${targetIndex}]`, formData)

        setEditingType('')
        setRowEditing('')
    }

    const onModalSubmit = (formData) => {
        formData.payment_id = state.selectorId
        console.log(formData)
    }

    const formikHook = useFormik({
        initialValues : initialValues,
        onSubmit : onSubmit,
    })

    const secondFormikHook = useFormik({
        initialValues : secondInitialValues, 
        onSubmit : secondOnSubmit,
    })

    const modalFormikHook = useFormik({
        initialValues : modalInitialValues, 
        onSubmit : onModalSubmit,
    })

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
        setApprovalModalOpen(true);
    }

    const initializeGrid=(flex)=> {
        state.grid = flex;
    }

    //입금파일생성 
    const excelDown =()=> {
        if(state.chkCellData.length === 0 && state.chkFile === 0){
            message.warning('입금파일을 생성할 내용을 선택해주세요.');
        }else{
            if(state.chkFile > 0){
                Modal.warning({
                    title : '처리 상태가 "입금 대기" 또는 "부분 입금"인 건만 선택해 주세요.',
                });  

            }else{
                var today = moment().format('YYYY-MM-DD');

                wjcGridXlsx.FlexGridXlsxConverter.saveAsync(state.grid, {
                    includeColumnHeaders: true,
                    includeStyles: true,
                }, today+'.xlsx');
            }
        }   
        
    }

    const load=()=> {
        let fileInput = document.getElementById('importFile')
        if (fileInput.files[0]) {
            wjcGridXlsx.FlexGridXlsxConverter.loadAsync(state.grid, fileInput.files[0], null, function (workbook) {
                var arr = []
                workbook.sheets[0].rows.forEach((e,index) => {
                    if(index > 0){
                        arr = [...arr, {bank_name: e.cells[0].value, account_no : e.cells[1].value, total_amount : e.cells[2].value, depositor : e.cells[3].value, deposit_code : e.cells[4].value}]
                    }
                });
                state.depositResult = arr;
                handelDepositResult()
            }, function (reason) {
                console.log(reason)
                Modal.warning({
                    title : '오류가 발생되었습니다. 재시도해주세요.',
                });  
            });
        }else{
            Modal.warning({
                title : '데이터를 가져올 파일을 올려주세요.',
            });  

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
            // console.log(data)
            // return

            commonStore.handleApi({
                url: '/deposit-result-file',
                method: 'POST',
                data:data
            }).then(function(result){
                setLoading(false)
                var chk = 0;
                var arr = []
                result.status.forEach(e => {
                    if(e.status === 'FAIL'){
                        arr = [...arr,e.deposit_code]
                        chk++;
                    }
                    state.depositResultError = arr.join(',')
                });
                if(chk === 0){
                    setImportModalOpen(false)
                    fetchData(state.pageArr.page);
                }else{
                    state.importChk = true

                }
            }).catch(function(error){
                console.log(error.response.status);
                Modal.error({
                    title : '등록시 문제가 발생하였습니다.',
                    content : '오류코드:'+error.response.status
                });  
            });
        }       
    })

    const fetch = (value, callback) => {
        clearTimeout(timedOut);
        timedOut = null;
        const searchAccountsList = async (search) => {
            let keyword = ''
            if(search){
                keyword = '&keyword='+search
            }else{
                keyword = '&keyword=알앤'
            }
            const result = await commonStore.handleApi({
                url: '/search-purchase-accounts?display=100&page=1&sort_by=date&order=desc'+keyword,
            });
            // state.purchaseAccounts = result.data.map(e=>{e.value = e.id; e.label = e.name; return e})
            // callback(state.purchaseAccounts)
            result.data = result.data.map(e=>{e.value = e.id; e.label = e.name; return e})
            state.purchaseAccounts = result.data
            callback(result.data)
        }
        if (value) {
          timedOut = setTimeout(()=>searchAccountsList(value), 500);
        } else {
          callback(state.purchaseAccounts);
        }
    };
    const SearchInput = (props) => {
        const [classList, setClassList] = useState([...props.initOptions])
        const handleSearch = (newValue) => {
            fetch(newValue, setClassList);
        };
        return (
            <Field name={props.name}>
                {({field, form : {touched, errors, setFieldValue}}) => (
                    <Select
                        showSearch
                        value={field.value}
                        name={field.name}
                        placeholder={props.placeholder}
                        style={props.style}
                        defaultActiveFirstOption={false}
                        optionFilterProp = {'label'}
                        filterOption={false}
                        onSearch={(e)=>handleSearch(e)}
                        onChange={optionsValue => {
                            setFieldValue(field.name, optionsValue); 
                            props.onChange && props.onChange(optionsValue);
                        }}
                        notFoundContent={null}
                        options={classList}
                    />
                )}
            </Field>
        );
    };

    const SearchClass = ({form}) => {
        const classificationCode = useCallback(async (type,val) => {
            var submit_data = {}
            if(type === '2depth'){
                submit_data['parent_id'] = val
                submit_data['depth'] = 2
            }else if(type === '3depth'){
                submit_data['parent_id'] = val
                submit_data['depth'] = 3
            }else{
                if(val){
                    submit_data['id'] = val
                }
            }
            const result = await commonStore.handleApi({
                url: '/billing-classification',
                data:submit_data
            })
            result.data = result.data.map(e=>{
                e.value = e.id
                e.label = e.name
                return e
            })
            if(type == '2depth'){
                setClassOptions({...classOptions,second:result.data,third:[]})
            }else if(type == '3depth'){      
                setClassOptions({...classOptions,third:result.data})
            }else{
                setClassOptions({...classOptions,first:result.data})
            }
        });

        const handleSet = (type,val) => {
            if(type==='2depth'){
                form.setFieldValue('class2_id', val.id);
                form.setFieldValue('class2_name', val.name);
                form.setFieldValue('class3_id', '');
                form.setFieldValue('class3_name', '');
                classificationCode('3depth',val.id)
            }else if(type==='3depth'){
                form.setFieldValue('class3_id', val.id);
                form.setFieldValue('class3_name', val.name);
            }else{
                form.setFieldValue('class1_id', val.id);
                form.setFieldValue('class1_name', val.name);
                form.setFieldValue('class2_id', '');
                form.setFieldValue('class2_name', '');
                form.setFieldValue('class3_id', '');
                form.setFieldValue('class3_name', '');
                classificationCode('2depth',val.id)
            }
        };
        return (
            <>
            <Field name="class1_id">
                {({ field }) => { return (
                <Select
                    style={{width : 180}}
                    onChange={(value,record) => {handleSet('1depth',record)}}
                    value={form.values.class1_id}
                    options={classOptions.first}
                />
                )}}
            </Field>

            {form.values.class1_id && (
                <Field name="class2_id">
                {({ field }) => (
                    <Select
                    style={{width : 180}}
                    onChange={(value,record) => {handleSet('2depth',record)}}
                    value={form.values.class2_id}
                    options={classOptions.second}
                    />
                )}
                </Field>
            )}

            {form.values.class2_id && (
                <Field name="class3_id">
                {({ field }) => (
                    <Select
                        style={{width : 180}}
                        onChange={(value,record) => {handleSet('3depth',record)}}
                        value={form.values.class3_id}
                        options={classOptions.third}
                    />
                )}
                </Field>
            )}
            </>
        );
    };

    //검색
    const handleSearch = (data) => {
        console.log(data)
        fetchData(state.pageArr.page, data)
    } 

    return (
        <Wrapper>
            <FormikProvider value={formikHook}>
            <Row className="topTableInfo" >
                <Col span={12}>
                    <Search
                        placeholder="검색어 입력"
                        onSearch={handleSearch}
                        enterButton
                        allowClear
                        style={{width: 200}}
                    />
                </Col>
                <Col span={12} className="topTable_right">
                    <wjInputC.ComboBox
                        placeholder="선택"
                        itemsSource={new CollectionView(state.yearOption, {
                            currentItem: null
                        })}
                        selectedValuePath="value"
                        displayMemberPath="label"
                        valueMemberPath="value"
                        selectedValue={state.year}
                        textChanged={handleChange('year')}
                        style={{ width: 120 }}
                    />
                    <wjInputC.ComboBox
                        placeholder="선택"
                        itemsSource={new CollectionView(state.monthOption, {
                            currentItem: null
                        })}
                        selectedValuePath="value"
                        displayMemberPath="label"
                        valueMemberPath="value"
                        selectedValue={state.month}
                        textChanged={handleChange('month')}
                        style={{ width: 120, margin: '0 10px' }}
                    />
                    {pageRegist &&
                    <>
                    <Button style={{marginLeft: 10}} onClick={showApprovalModal} disabled={approvalsChk}>승인</Button>
                    <Button style={{marginLeft: 10}} onClick={(e)=>excelDown()} disabled={checkAccess() || approvalsChk}>입금 파일 생성</Button> 
                    <Button style={{margin: 0, marginLeft: 10}} onClick={(e)=>setImportModalOpen(true)} disabled={checkAccess()}>입금 결과 등록</Button> 
                    </>
                    }
                    {pageRegist ?
                    <Button className="btn btn-primary btn_add" shape="circle" onClick={() => {editingType !== 'add' ? add() : cancel()}} style={{marginLeft: 10}}>{editingType !== 'add' ? '+' : '-'}</Button>
                    :
                    <Button className="btn btn-primary btn_add" shape="circle" onClick={() => {setPageRegist(true);editingType !== 'add' ? add() : cancel()}} style={{marginLeft: 10}}>{editingType !== 'add' ? '+' : '-'}</Button>
                    }
                </Col>
            </Row>
            <Row className='gridWrap'>
                <FormikProvider value={secondFormikHook}>
                <Table
                    rowKey = {(tableData) => tableData.id}
                    dataSource={formikHook.values.listData.filter(e=>e.editingType!=='remove')}
                    style={{ padding: 0}}
                    bordered = {true}
                    sticky = {{ offsetHeader : -20 }}
                    size = {'small'}
                    rowSelection={pageRegist ?{
                        type: 'checkbox',
                        ...rowSelection,
                    } : false}
                    pagination = {false}
                >
                    <Column title="거래처명"            dataIndex="accountable_name"        key="accountable_name" width={120} ellipsis={true} render={(_val, record) => 
                        isEditing(record) && editingType==='add' ?
                            <SearchInput
                                name={'accountable_id'}
                                placeholder="거래처명"
                                style={{
                                width: '100%',
                                }}
                                onChange={(e)=>{
                                    secondFormikHook.setFieldValue('accountable_person_no',state.purchaseAccounts.find(items=>items.id === e)?.person_no)
                                    secondFormikHook.setFieldValue('accountable_name',state.purchaseAccounts.find(items=>items.id === e)?.name)
                                }}
                                initOptions={state.purchaseAccounts}
                            />
                        :
                        <div>{_val}</div>
                        }/>
                    <Column title="사업자 등록번호"     dataIndex="accountable_person_no"   key="accountable_person_no" width={130} ellipsis={true} render={(_val, record) => 
                        isEditing(record) && editingType==='add' ?
                            <FormikInput name={'accountable_person_no'} style={{width: '100%'}} readOnly/>
                        :
                        <div>{_val}</div>
                        }
                        />
                    <Column title="비용 귀속"           dataIndex="company_name"            key="company_name" width={130} ellipsis={true} 
                        render = {(_val, record, index) => isEditing(record) ? (
                            <FormikInput type={'select'} name={'company'} style={{width: '100%'}} 
                                data={{
                                    allowClear      : true, 
                                    options         : [{
                                        value: 'G',
                                        label: '도서출판 길벗'
                                    },{
                                        value: 'S',
                                        label: '길벗스쿨'
                                    }]
                                }}
                                onChange={(e)=>{
                                    secondFormikHook.setFieldValue('company_name',e==='G'?'도서출판 길벗':'길벗스쿨')
                                }}
                            />
                        ) : (
                            <div>{_val}</div>
                        )}
                    />
                    <Column title="비용 청구 분류"      dataIndex="class_name"             key="class_name" width={300} ellipsis={true} 
                        render={(_val, record) => {
                            return isEditing(record) ? 
                            <Field name={"class_name"}>
                                {(field)=>{
                                    return (
                                    // <SearchClass data={field.form.data} initOptions={initClass} />
                                    <SearchClass {...field}/>
                                    )
                                }
                                }
                            </Field>
                            :
                            <div>{record.class1_name+' > '+record.class2_name+' > '+record.class3_name}</div>}
                        }
                    />
                    <Column title={<div>세금계산서<br/>발행일</div>}   dataIndex="tax_invoice_published_at" key="tax_invoice_published_at" width={100} ellipsis={true}
                        render={(_val, record) => isEditing(record) ? 
                            _val ?
                                <div>{_val}</div>
                                :
                                <Button onClick={()=>setTaxVisible(true)}>확인</Button> 
                            : <div>{_val}</div>
                            
                        }
                    />
                    <Column title="공급가"              dataIndex="amount"                  key="amount" width={80} ellipsis={true} align='right' />
                    <Column title="부가세"              dataIndex="vat"                     key="vat" width={80} ellipsis={true} align='right'/>
                    <Column title="합계"                dataIndex="total_amount"            key="total_amount" width={80} ellipsis={true} align='right'/>
                    <ColumnGroup title="1차 승인">
                        <Column title="승인자"          dataIndex="payment_approver1_name"  key="payment_approver1_name" width={80} ellipsis={true} />
                        <Column title="승인일"          dataIndex="payment_approval1_at"    key="payment_approval1_at" width={100} ellipsis={true} />
                    </ColumnGroup>
                    <ColumnGroup title="2차 승인">
                        <Column title="승인자"          dataIndex="payment_approver2_name"  key="payment_approver2_name" width={80} ellipsis={true} />
                        <Column title="승인일"          dataIndex="payment_approval2_at"    key="payment_approval2_at" width={100} ellipsis={true} />
                    </ColumnGroup>
                    <Column title="처리 상태"           dataIndex="payment_status"          key="payment_status" width={100} ellipsis={true} />
                    {pageRegist &&
                    <Column title="작업"                dataIndex="status"                  key="status" width={110} ellipsis={true} 
                        render = {(_val, record, index) => isEditing(record) ? (
                            <>
                                <Typography.Link onClick={() => save(record)} style={{marginRight: 8}}>저장</Typography.Link>
                                <Typography.Link onClick={() => cancel(record)}>취소</Typography.Link>
                            </>
                        ) : (
                            <>
                                {confirmEdit(record) && 
                                    <Typography.Link onClick={() => edit(record)} style={{marginRight: 8}}>수정</Typography.Link>
                                }
                                {confirmEdit(record) && 
                                <Typography.Link onClick={() => remove(record)}>삭제</Typography.Link>
                                }
                            </>
                        )}
                    />
                    }
                </Table>
                </FormikProvider>
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
            <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                <Col>
                    <Button onClick={formikHook.handleSubmit} type="primary submit" htmlType="button">확인</Button>
                    <Button htmlType="button" style={{marginLeft:'10px'}}>취소</Button>
                </Col>
            </Row>
            </FormikProvider>

            <FormikProvider value={modalFormikHook}>
                <Modal title="입금 승인" visible={approvalModalOpen} onCancel={()=>setApprovalModalOpen(false)} footer={[
                    <Button type="primary" onClick={()=>modalFormikHook.handleSubmit()}>확인</Button>
                ]}>
                    <Field name={'approval_flag'}>
                    {({field, form : {touched, errors, setFieldValue}}) => (
                        <Radio.Group
                        onChange={(e) => {
                            setFieldValue(field.name, e.target.value)
                        }}>
                            <Radio value='1' style={{marginRight: 30}}>담당 단계만 승인</Radio>
                            <Radio value='2'>1, 2차 모두 승인</Radio>
                        </Radio.Group>
                    )}
                    </Field>
                </Modal>
            </FormikProvider>

            <Modal title="입금 결과 등록" visible={importModalOpen} onOk={()=>setImportModalOpen(false)} onCancel={()=>{setImportModalOpen(false);setLoading(false)}} 
                footer={loading === true ? null : [              
                    <Button type="primary" onClick={(e)=>load()} style={state.importChk === true ? {display:'none'} : {display:'inline-block'}}>확인</Button>
                ]}>
                {loading === true ? 
                    (
                        <p>처리 중입니다. 잠시 기다려 주세요<br />끝나면 리스트에 바로 반영됩니다..</p>
                    ) : state.depositResultError.length > 0 ?
                    (
                        <p>아래 행은 오류로 처리하지 못했습니다.<br />오류 입금관리코드: {state.depositResultError}</p>
                    )                    
                    : (
                        <input type="file" className="form-control"  id="importFile" 
                        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel.sheet.macroEnabled.12"/>
                    )               
                }
            </Modal>

            {/* 입금승인 테이블 */}
            <FlexGrid
                alternatingRowStep={0}
                initialized={initializeGrid}
                itemsSource={state.chkCellData}
                allowSorting={false}
                style={{display:'none'}}
            >
                <FlexGridColumn binding="bank_name" header="은행명" width={150} align="center" />
                <FlexGridColumn binding="account_no" header="계좌번호" width={150} align="center"/>
                <FlexGridColumn binding="total_amount" header="금액" width={150} align="center"/>
                <FlexGridColumn binding="depositor" header="예금주" width={150} align="center"/>
                <FlexGridColumn binding="deposit_code" header="입금 관리 코드" width={150} align="center"/>           
            </FlexGrid>

            {taxVisible && <TaxBill visible={taxVisible} onClose={()=>setTaxVisible(false)} evidenceData={evidenceData}/>}

        </Wrapper>
    )
}

export default inject('commonStore')(observer(BillingAccountsTest));