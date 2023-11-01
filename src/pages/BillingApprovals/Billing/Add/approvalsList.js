/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState,useRef } from 'react';
import {Table,Space, Button,Row,Col,Modal,Input,Upload,InputNumber,Radio,Popover,Select,Checkbox,Typography,Form,message} from 'antd';
import {PhoneOutlined, QuestionOutlined, UploadOutlined, ExclamationCircleOutlined} from '@ant-design/icons';

import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
// import axios from 'axios';
// import useStore from '@stores/useStore';
// import * as wjInput from '@grapecity/wijmo.react.input';

// import ClientAdd from './clientAdd';
// import ClientAdd from '../../../Finance/account/Add';
// import Evidence from './evidence';


const Wrapper = styled.div`
    width: 100%;
`;

const DEF_STATE = {
    // DB Data
    default_approval : '',              // 결재선 기본 저장
    approvals: [                        // 결재선 지정
        {
            step: 1,                    // 단계
            type: "",                   // 결재 구분 - 1:승인, 2:참조, 3:청구자
            approval_user_id_list: []   // 결재자 id
        },
    ]
};


const ApprovalsList = observer(({ approvalsData, approvalsDataReturn, tooltip, memberOption, typeChk, openPosition}) => {
    const { Text } = Typography;
    const { Option } = Select;

    const stateApprovals = useLocalStore(() => ({ ...DEF_STATE }));
  
    const state = useLocalStore(() => ({
        approvalsViewData:[],
        disabled:true,
        count: 1,
        copyCnt :0,
        manager :'' ,
    }));

    const [approvals, setApprovals] = useState([{
        step: 1,                   
        type: "",                   
        approval_user_id_list: []
    },]);

    useEffect(() => {
        //한번만 데이터 넣기
        if(approvalsData !='' && approvalsData != undefined){
            if(state.copyCnt == 0){
                if(approvalsData.default_approval == true){
                    setChecked(true)
                }else{
                    setChecked(false)
                }
                stateApprovals.default_approval = approvalsData.default_approval;

                if(approvalsData.approvals === '' || approvalsData.approvals === undefined){    //결재선 저장값 가져오기
                    stateApprovals.approvals = approvalsData.approvalsLogin;
                    setApprovals(toJS(approvalsData.approvalsLogin))
                    state.count = approvalsData.approvalsLogin.length;  
                }else{
                    if(approvalsData.approvals.length === 0){
                        approvalsData.approvals = [{step: 1,                   
                        type: "",                   
                        approval_user_id_list: []}]

                        stateApprovals.approvals = approvalsData.approvals;
                        setApprovals(toJS(approvalsData.approvals))
                        state.count = approvalsData.approvals.length;  
                        approvalsDataReturn(toJS(stateApprovals))
                    }else{
                    
                        var ts = [];
                        var chk = [];
                        approvalsData.approvals.forEach((e) => {
                            if(e.type === '2'){
                                var stepChk = e.step
                                if(stepChk === e.step){
                                    chk = [...chk, toJS(e.approval_user_id_list)]

                                    if(ts.length === 0){
                                        ts = [{step: e.step, type : e.type, approval_user_id_list : [toJS(e.approval_user_id_list)]}]
                                    }else{
                                        if(chk.length > 1){
                                            ts.forEach((a,num) => {
                                                if(a.step === stepChk && a.type === '2'){
                                                    a.approval_user_id_list = chk;
                                                }
                                            })
                                        } else{
                                            ts = [...ts, {step: e.step, type : e.type, approval_user_id_list : [toJS(e.approval_user_id_list)]}]   
                                        }  
                                    }       
                                }else{
                                    stepChk = e.step
                                }
                            }else{
                                ts = [...ts, {step: e.step, type : e.type, approval_user_id_list : [toJS(e.approval_user_id_list)]}]
                            }
                        });
                        stateApprovals.approvals = ts;
                        setApprovals(toJS(ts))
                        state.count = ts.length;  
                        approvalsDataReturn(toJS(stateApprovals))
                    }
                }
                state.copyCnt++;
                state.disabled = false;
            }
        }
    }, [approvalsData,memberOption]);

    
    //add index에 데이터 넘기기
    const approvalsDataParent = ()=>{
        approvalsDataReturn(toJS(stateApprovals))
    }

    //결재자 추가
    const [manager, setManager] = useState([]);

    //결재선저장
    const [checked, setChecked] = useState(false);

    //input 데이터 
    const handleChangeInput = useCallback((type,key) => (e) => {
        if(type =='type'){
            state.disabled = false;          

            //값이 있는데 type이 변경되었을경우
            if(stateApprovals['approvals'][key]['approval_user_id_list'] != '' && stateApprovals['approvals'][key]['approval_user_id_list'] != undefined){                
                if(stateApprovals['approvals'][key]['type'] != e.target.value){
                    var arr = [];
                    stateApprovals['approvals'].forEach((a,index) => {
                        if(index == key){
                            a.approval_user_id_list = []
                            a.type = e.target.value
                            arr = [...arr, toJS(a)]
                        }    else{
                            arr = [...arr, toJS(a)]
                        }
                       
                    });

                    var arr2 = [];
                    state.manager.forEach((a,index) => {
                        if(index != key){
                            arr2 = [...arr2, toJS(a)]
                        }else{
                            arr2 = [...arr2, []]
                        }                            
                    });
                    state.manager = arr2;
                    setManager(arr2)                 
                    stateApprovals.approvals = arr;
                }              

            }else{        
                if(stateApprovals.approvals[key].type === ''){
                    stateApprovals.approvals[key].type =e.target.value;
                }else{
                    var arr = [];        
                    stateApprovals['approvals'].forEach((a,index) => {
                        if(index == key){
                            a.type = e.target.value
                            arr = [...arr, a]
                        }    else{
                            arr = [...arr, a]
                        }                   
                    });
                    stateApprovals.approvals = arr;
                }
                
            }
            setApprovals(stateApprovals['approvals'])


        }else if(type == 'default_approval'){
            if(e.target.checked == true){
                stateApprovals.default_approval = true;
                setChecked(true)
            }else{
                stateApprovals.default_approval = false;
                setChecked(false)
            }
            
        }else if(type == 'approval_user_id_list'){      
            
            if(Array.isArray(e) == true){
                var val = e;
            }else{
                var val = [e]
            }

            var arr = [];
            var arr2 = [];
            stateApprovals['approvals'].forEach((e,index) => {
                if(index == key){
                    e.approval_user_id_list = val   
                }    
                arr = [...arr, toJS(e.approval_user_id_list)]         
                arr2= [...arr2, e]   
            });

            state.manager = toJS(arr);
            setManager(toJS(arr));
            stateApprovals.approvals = arr2;

            setApprovals(stateApprovals['approvals']);
        }

        approvalsDataParent();
    
    },[],);

    const handleChangeInput2 = useCallback((type,key) => (e) => {
        if(type =='type'){
            state.disabled = false;          
            var arr = stateApprovals.approvals;
            arr[key].type =e.target.value;

            if(arr[key].approval_user_id_list.length > 0){
                arr[key].approval_user_id_list = [];
            }
           
            stateApprovals.approvals = arr
            setApprovals(toJS(stateApprovals.approvals))


        }else if(type == 'default_approval'){
            if(e.target.checked == true){
                stateApprovals.default_approval = true;
                setChecked(true)
            }else{
                stateApprovals.default_approval = false;
                setChecked(false)
            }
            
        }else if(type == 'approval_user_id_list'){
            if(Array.isArray(e) == true){
                var val = e;
            }else{
                var val = [e]
            }

            var arr = stateApprovals.approvals;
            arr[key].approval_user_id_list =val;

            stateApprovals.approvals = arr
            setApprovals(toJS(stateApprovals.approvals))
        }

        approvalsDataParent();
    
    },[],);


    const onChange = (e) => {
        stateApprovals.default_approval = e.target.checked;
        setChecked(e.target.checked);
        approvalsDataReturn(toJS(stateApprovals))
    };

    //추가&삭제
    const approvalsBtn=(type,val)=>{
        if(type == 'add'){
            var chkNum = [];
            stateApprovals.approvals.forEach((e,index) => {
                if((e.type === '' && (e.approval_user_id_list === '' || e.approval_user_id_list === undefined || e.approval_user_id_list.length === 0))
                || (e.type !== '' && (e.approval_user_id_list === '' || e.approval_user_id_list === undefined || e.approval_user_id_list.length === 0)) ){
                    chkNum = [...chkNum, e.step]
                }
            });

            if(chkNum.length > 0){
                var chkNumText = chkNum.join(',');
                message.warning(chkNumText+'단계 결재구분, 결재 추가 후 단계 추가가 가능합니다.');
            }else{
                //단계 추가 클릭한 step 다음으로 데이터 추가
                stateApprovals.approvals.splice(val, 0, {step:val+1, type:'', approval_user_id_list: []})

                var arr = stateApprovals.approvals;
                //step 재정렬
                arr.forEach((e,num) => {
                    if(e.step !== num+1){
                        e.step = num+1
                    }
                });

                stateApprovals.approvals = arr
                setApprovals(toJS(arr))

            }  

            state.disabled =true;
            
        }else{
            if(stateApprovals.approvals.length == 1){
                stateApprovals.approvals= [                        // 결재선 지정
                    {
                        step: 1,                    // 단계
                        type: "",                   // 결재 구분 - 1:승인, 2:참조, 3:청구자
                        approval_user_id_list: []   // 결재자 id
                    }]
                setApprovals(toJS(stateApprovals.approvals))
            }else{
                if(val != ''&& val != undefined){
                    var arr = toJS(stateApprovals.approvals)
                    arr = arr.filter(e=> e.step !== val)
                    arr.forEach((e,num) => {
                        if(e.step !== num+1){
                            e.step = num+1
                        }
                    });

                    stateApprovals.approvals = arr;                    
                    setApprovals(toJS(arr))
       
                }
            }            
        }
        approvalsDataParent();
    }

   
    const approval_column = useMemo(() => [
        {
            title: '단계',
            dataIndex: 'approvalsStep',
            key:  'approvalsStep',
            render: (_, row) => <div style={{textAlign:'center'}}>{row.step}</div>,
            align: 'center',
            width:'80px',
        },
        {
            title: (_, row) => 
            <div>
                결재 구분 <span className="spanStar">*</span>
                    <Popover content={tooltip[0]}>
                        <Button
                            className="btn_tip"
                            shape="circle"
                            icon={<QuestionOutlined style={{ fontSize: '11px' }} />}
                            size="small"
                            style={{ marginLeft: '5px' }}
                        />
                    </Popover>

            </div>
            ,
            dataIndex: 'sort',
            key:  'sort',
            render: (_, row) => 
                <div style={{textAlign:'center'}}> 
                    {/* <Radio.Group value={row.type} onChange={handleChangeInput('type',row.step-1)} disabled={typeChk !=='' && typeChk !== undefined  ? true : false}> */}
                    <Radio.Group value={row.type} onChange={handleChangeInput2('type',row.step-1)} disabled={typeChk !=='' && typeChk !== undefined  ? true : false}>
                        <Radio value="1">승인</Radio>
                        <Radio value="2">참조</Radio>
                    </Radio.Group> 
                </div>,
            align: 'center', 
            width:'200px',
        },
        {
            title: (_, row) => 
            <div>
                결재자 <span className="spanStar">*</span>
                    <Popover content={tooltip[1]}>
                        <Button
                            className="btn_tip"
                            shape="circle"
                            icon={<QuestionOutlined style={{ fontSize: '11px' }} />}
                            size="small"
                            style={{ marginLeft: '5px' }}
                        />
                    </Popover>
                
            </div>
            ,
            dataIndex:  'approval',
            key: 'approval',
            render: (_, row) => 
            <div style={{textAlign:'left'}}>               
                {row.type == '1' ?
                    <><Select 
                        value={row.approval_user_id_list} 
                        showSearch
                        showArrow={false}
                        style={{ width: '100%' }} 
                        placeholder={row.type === '' || row.type === undefined ? '결재 구분을 선택 후 결재자 선택이 가능합니다.' :  '결재자를 선택하세요.'} 
                        onChange={handleChangeInput2('approval_user_id_list',row.step-1)} 
                        options={memberOption}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        disabled={(row.type !='' && row.type != undefined) && (typeChk ==='' || typeChk === undefined) ? false : true}
                    />       </>
                    : row.type == '2' ?
                    <><Select 
                        value={row.approval_user_id_list} 
                        mode="multiple" 
                        allowClear 
                        style={{ width: '100%' }} 
                        placeholder={row.type === '' || row.type === undefined ? '결재 구분을 선택 후 결재자 선택이 가능합니다.' :  '결재자를 선택하세요.'} 
                        onChange={handleChangeInput2('approval_user_id_list',row.step-1)} 
                        options={memberOption}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        disabled={(row.type !='' && row.type != undefined) && (typeChk ==='' || typeChk === undefined)  ? false : true}
                    /> </>
                    :
                    <><Input
                        placeholder='결재 구분을 선택 후 담당자 선택이 가능합니다.'
                        disabled={true}
                        /></>
                }
                                      
            </div>,
            align: 'center',
        },
        {
            title: '작업',
            dataIndex: 'btn',
            key: 'btn',
            render: (_, row) => <div style={{textAlign:'center'}}><Button type='primary' size="small" onClick={(e)=>approvalsBtn('add',row.step)} disabled={typeChk !=='' && typeChk !== undefined  ? true : false}>단계 추가</Button> <Button danger size="small" onClick={(e)=>approvalsBtn('del',row.step)} disabled={typeChk !=='' && typeChk !== undefined  ? true : false}>삭제</Button></div>,
            align: 'center',
            width:'200px',
        },    
    ],[approvals,memberOption,state.disabled, stateApprovals.approvals]);
    
    return (
        <Wrapper>
            <div style={{ marginTop: 40 }}>
                <Row gutter={10} className="table marginTop">
                    <div className="table_title">결재선 지정</div>
                    <Col xs={24} lg={24} className="flexCol" >
                        <Space direction="horizontal">
                            {openPosition == 'presentation' ? (
                                <Text><span style={{color: 'red'}}><ExclamationCircleOutlined /> 영업관리팀은 결재선으로 지정하지 않아도 됩니다.</span></Text>
                            ) : (
                                <Text><span style={{color: 'red'}}><ExclamationCircleOutlined /> 재무지원팀은 결재선으로 지정하지 않아도 됩니다.</span> 단, 비용 지급 요청 외 목적이라면 지정할 수 있습니다.</Text>
                            )}
                            
                        </Space>
                        <Space direction="horizontal">
                            <Checkbox onChange={onChange} checked={checked} disabled={typeChk !=='' && typeChk !== undefined  ? true : false}></Checkbox>
                            현재 결재선을 기본으로 저장
                        </Space>
                    </Col>    
                </Row>
            </div>
            <div style={{ marginTop: 10,marginBottom:40 }}>
                <Table
                    dataSource={approvals}
                    columns={approval_column}
                    rowKey={(row) => row.step}    
                    pagination={false} 
                />

            </div>
      
        </Wrapper>
    );
});

export default ApprovalsList;
