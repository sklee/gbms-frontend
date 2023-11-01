/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo,useState } from 'react';
import { Pagination, Table, message, Button, Row, Col, Input, Checkbox, Modal,Select, Card,DatePicker,Menu,Dropdown } from 'antd';

import { set, toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';

import styled from 'styled-components';

import useStore from '@stores/useStore';

import * as wjNav from '@grapecity/wijmo.react.nav';
import * as WjcNav from "@grapecity/wijmo.nav";

import moment from 'moment';
import axios from 'axios';

import { InputDate, InputTime, ComboBox, AutoComplete, MultiAutoComplete } from '@grapecity/wijmo.input';
import { FlexGrid, FlexGridColumn  } from '@grapecity/wijmo.react.grid';
import e from 'connect-timeout';

const Wrapper = styled.div`
    width: 100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
`;

const PrdBasic = observer(({tab}) => {
    const { commonStore } = useStore();
    const stateData = useLocalStore(() => ({
        selStep1 : '',
        selStep2 : '',
        selDetail :{value:'', label:''},
        selProcess :{value:'', label:''}
    }));
    
    const { Option } = Select;
    const { confirm } = Modal;

    const state = useLocalStore(() => ({
        treeControl: [],
        depth3Data: [],
        // inTxt: '',
        treeData:[],
        treeData2:[],
        selDetail:[],
        selProcess:[],
        selId:'',

        produce_details : [],
        produce_process : [],

        filter_details : [],
        filter_process : [],

        data:{
            step1:[],
            step2:[],
            step_process:[],
            step_details:[]
        },
    }));
    
    useEffect(() => { 
        state.tab = tab;
        getDetails();
        getProcess();
        viewData();
    }, []);

    const getDetails = useCallback(async () =>{
        const result = await commonStore.handleApi({
            url: '/produce-code-details',
        });
        state.produce_details = result.data;
    },[]);

    const getProcess = useCallback(async () =>{
        const result = await commonStore.handleApi({
            url: '/produce-process-codes',
        });
        state.produce_process = result.data;
    },[]);

    //리스트
    const viewData = useCallback(async (val) => {
        const result = await commonStore.handleApi({
            url: '/produce-code1',
        });
        state.treeData = result.data;
        if(result.data.length==0){
            state.treeData = [{id:"none",name:"",pivot:""}]
        }
        state.treeData.map(e => {
            e['children'] = [];
        });
        viewData2();
    }, []);

    const viewData2 = useCallback(async (val) => {
        const result = await commonStore.handleApi({
            url: '/produce-code2',
        });
        result.data.map((e)=>{
            state.treeData.map((item)=>{
                if(item.id == e.produce_code1_id){
                    item['children'] = [...item['children'],e];
                }
            });
        });
    }, []);

    const viewData3 = useCallback(async (val) => {
        const result = await commonStore.handleApi({
            url: '/produce-code2-details?id='+val,
        });
        
        const temp = result;
        state.selDetail = temp.code_details;
        state.selProcess = temp.process_codes;
        
        if(temp.code_details.length==0){
            state.selDetail = [{id:"none",name:"",pivot:""}]
        }
        if(temp.process_codes.length==0){
            state.selProcess = [{id:"none",name:"",pivot:""}]
        }
        
        var detail_chk = toJS(state.selDetail.map(item2 => item2.id));
        state.filter_details = state.produce_details.filter(item=>!detail_chk.includes(item.id));

        var process_chk = toJS(state.selProcess.map(item2 => item2.id));
        state.filter_process = state.produce_process.filter(item=>!process_chk.includes(item.id));
    }, []);

    const onDragOver = (s, e) => { //e.position : 위치 순서
        if (!e.dropTarget.hasChildren && e.position == WjcNav.DropPosition.Into) {
            e.position = WjcNav.DropPosition.Before;        
        }    
    }

    const onDragEnd = (s, e) => { //마우스 놓았을때
        var control = s.selectedNode;
        if(control.parentNode != "" && control.parentNode != null){ //부모값이 있으면
            control.itemsSource.forEach(element => {
                element['pacode'] = control.parentNode.dataItem.code;
                element['ordNum'] = control.index+1;
            });
        }else{
            control.itemsSource.forEach(element => {
                element['pacode'] = "";
                element['ordNum'] = control.index+1;
            });
        }
        var num = 0;
        if(state.depth3Data == ""){
            num = 0;
        }else{
            num = state.depth3Data.length;
        }

        if(control.dataItem.chkType == "add"){      
            var chk = true;
            var i= 0;
            for(i=0; i < state.depth3Data.length; i++){
                if(state.depth3Data[i].name == control.dataItem.header){
                    state.depth3Data[i].array =  control.itemsSource;
                    chk = false;
                    break;
                }else{
                    chk = true;
                }
            }
            if(chk == true){
                state.depth3Data[num] = {name : control.dataItem.header, array: control.itemsSource};
            }
        }else{
            var i= 0;
            if(state.depth3Data.length == 0){
                state.depth3Data[0] = {array: control.itemsSource};
            }else{
                for(i=0; i < state.depth3Data.length; i++){
                state.depth3Data[i] = {array: control.itemsSource};
                } 
            }        
        }
    }

    const initialized = (control) => {
        state.treeControl.push(control);
    }

    const formtemplete = (datass, inTxt, userYN ) =>{
        var btnUseColor = '',
            chkY ='',
            chkN = '';

        if(userYN === 'Y'){
            chkY = ' checked = "checked"';
            btnUseColor = ''
        } else if(userYN === 'N'){
            chkN = ' checked = "checked"';
            btnUseColor = 'btn_use_color'
        }else{
            btnUseColor = ''
        }
        var html  = '<div class="acc_wrap" id="acc'+datass+'"><span class="btn_acc '+btnUseColor+'" id="btn'+datass+'">'+ inTxt +'<i class="ant-menu-submenu-arrow btn_modify"></i></span>'+ 
            '<div class="accIn" id="cont'+datass+'"><label>명칭 수정</label>'+
                '<input id="title'+datass+'" type="text" name="name'+datass+'" class="ant-input disTg" value="'+ inTxt+'" autoComplete="off" />'+
                '<label>주석</label><textarea class="ant-input" placeholder="해당 코드에 대한 주석입니다." id="txtar'+datass+'"></textarea>'+
                '<div class="code_wrap"><label>코드 사용</label>'+
                    '<div class="radio_wrap">'+
                        '<label class="disTg"><input type="radio" id="useY'+datass+'" name="useYN'+datass+'" value="Y" '+chkY+'>사용</label>'+
                        '<label class="disTg"><input type="radio" id="useN'+datass+'" name="useYN'+datass+'" value="N" '+chkN+'>숨김</label></div>'+
                '</div>'+
            '</div></div>';
        
        return html;
    }

    const onFormatItem = (s, e) => {
        var hostId = s._e.id;

        var inhtml = e.element.innerHTML,
            inTxt = e.dataItem.name, 
            datass = e.dataItem.id;
        e.element.classList.add('wj-node-acc');
        if(datass=="none") e.element.classList.add('wj-node-none');
        if(hostId == 'treeView2'){
            var userYN = e.dataItem.use_yn;
            e.element.innerHTML = formtemplete(datass, inTxt, userYN);
        }else if(hostId == 'treeView3'){
        }else{
            var inHTML = '<div class="acc_wrap" id="acc'+datass+'"><span class="btn_acc"  id="btn'+datass+'">'+ inTxt +'<i class="ant-menu-submenu-arrow btn_modify"></i></span>'+ 
                '<div class="accIn" id="cont'+datass+'" style="text-align:center;">'+
                    '<button class="ant-btn btn_disconn">연결해제</button>'+
                '</div></div>';
            e.element.innerHTML = inHTML;
        }
        e.element.addEventListener('click', (event) => {
            event.stopPropagation();
            if(event.target.classList.contains('disTg')){
                return false;
            }
            if(event.target.classList.contains('btn_modify')){
                toggleAction('btn'+datass,'')
            }
            if(event.target.classList.contains('btn_disconn')){
                handleDisconnect(state.treeControl[2].selectedNode.dataItem.id,e.dataItem.id);
            }
        });

        e.element.addEventListener('change', (event) => {
            if(state.data.step2.find(item=>item.id == datass)){
            }else{
                state.data.step2 = [...state.data.step2,{id:datass}];
            }

            if(event.target.id == 'title'+datass){
                state.data.step2.find(item=>item.id == datass)['name'] = event.target.value;
            }else if(event.target.id == 'txtar'+datass){
                state.data.step2.find(item=>item.id == datass)['memo'] = event.target.value;
            }else if(event.target.id == 'useY'+datass || event.target.id == 'useN'+datass){
                state.data.step2.find(item=>item.id == datass)['use_yn'] = event.target.value;
            }
        });
        // e.element.removeEnevtListener('keypress',false)
        e.element.addEventListener('keypress', (event) => {
            event.stopPropagation();
        });
        e.element.addEventListener('keydown', (event) => {
            event.stopPropagation();
        });
    }

    // const [classAdd,setClassAdd] = useState('');
    const toggleAction = (obj)=>{
        const elB = document.getElementById(obj);
        // 열린 노드 닫기
        const el = elB.closest(".wj-control");
        const elon = el.getElementsByClassName("active");
        for (var i = 0; i < elon.length; i++) {
            if(!elon[i].classList.contains('wj-state-selected')) elon[i].classList.remove("active")
        }
        const elNode = elB.parentNode.parentNode;
        if(elNode.classList.contains('active')){
            elNode.classList.remove("active")
        }else{        
            elNode.classList.add("active")
        }  
    }

    const addNode = (idx) => {
        let newTitle;
        if(idx == 0){
            // newTitle = document.getElementById("theInput").value;
            // document.getElementById("theInput").value="";
            newTitle = stateData.selStep1;
            state.data.step1 = [...state.data.step1,{name:newTitle}];
            newTitle = stateData.selStep1 = '';
        }else if(idx == 1){
            // newTitle = document.getElementById("theInput2").value;
            // document.getElementById("theInput2").value="";
            newTitle = stateData.selStep2;
            if(state.treeControl[0].selectedNode){
                // state.data.step2 = [...state.data.step2,{produce_code1_id:state.treeControl[0].selectedNode.dataItem.id,name:newTitle,}];
                state.data.step2 = [...state.data.step2,{produce_code1_id:state.treeControl[0].selectedNode.dataItem.id,name:newTitle}];
                newTitle = stateData.selStep2 = '';
            }else{
                Modal.warning({
                    content: "1차 분류를 선택하세요.",
                });
                return false;
            }
        }else if(idx == 2){
            newTitle = stateData.selDetail.label;
            if(state.treeControl[1].selectedNode){
                state.data.step_details = [...state.data.step_details,{id:state.treeControl[1].selectedNode.dataItem.id,name:newTitle,sub_id:stateData.selDetail.value}];
                stateData.selDetail.label = '';
                stateData.selDetail.value = '';
            }else{
                Modal.warning({
                    content: "2차 분류를 선택하세요.",
                });
                return false;
            }
        }else if(idx == 3){
            newTitle = stateData.selProcess.label;
            if(state.treeControl[1].selectedNode){
                state.data.step_process = [...state.data.step_process,{id:state.treeControl[1].selectedNode.dataItem.id,name:newTitle,sub_id:stateData.selProcess.value}];
                stateData.selProcess.label = '';
                stateData.selProcess.value = '';
            }else{
                Modal.warning({
                    content: "2차 분류를 선택하세요.",
                });
                return false;
            }
        }
        handleSubmit(idx);

        if(newTitle!=''){
            var control = state.treeControl[idx],
                idnum = control.nodes.length+1,
                newItem = { id:(idnum), name: newTitle}, 
                // node = idx==0? state.treeControl[idx].selectedNode : state.treeControl[idx-1].selectedNode,
                index = control.nodes ? control.nodes.length : 0;

                if(idx == 0){
                    newItem['children'] = [{id:"none",name:"",pivot:""}];
                }else if(idx == 1){
                    newItem['selDetail'] = [{id:"none",name:"",pivot:""}];
                    newItem['selProcess'] = [{id:"none",name:"",pivot:""}];
                }
            if(idx!=1){
                if(index == 0){
                    //control.addChildNode(0, { id:0, name: newTitle });
                }else{
                    control.addChildNode(index, newItem);
                }
            }else{
                control.selectedNode = control.addChildNode(index, newItem);
                var addNode = control.selectedNode;
                var inTxt = addNode.dataItem.name,
                    datass = addNode.dataItem.id,
                    userYN = addNode.dataItem.userYN;

                control.selectedNode.element.classList.add('wj-node-acc');
                control.selectedNode.element.innerHTML = formtemplete(datass, inTxt, userYN);
                control.selectedNode.element.addEventListener('click', (event) => {
                    event.stopPropagation();
                    if(event.target.classList.contains('disTg')){
                        return false;
                    }
                    if(event.target.classList.contains('btn_modify')){
                        toggleAction('btn'+datass,'')
                    }
                });
                // e.element.removeEnevtListener('keypress',false)
                control.selectedNode.element.addEventListener('keypress', (event) => {
                    event.stopPropagation();
                });
                control.selectedNode.element.addEventListener('keydown', (event) => {
                    event.stopPropagation();
                });
            }
        }
    }

    const  dataCheck = (element) => {
        if(state.selId && element.id === state.selId)  {
            return true;
        }else{
            return false;
        }
    }
    const selectedItemChanged = (num, s, e) => {
        if(num==1){
            state.selId = s.selectedNode?.dataItem.id;
            const arr = state.treeData.find(dataCheck);
            if(arr){
                if(arr.children?.length==0){
                    state.treeData2 = [{id:"none",name:"",pivot:""}]
                }else{
                    state.treeData2 = arr.children;
                }
            }
        }else if(num==2){
            state.selId = s.selectedNode?.dataItem.id;
            if(state.treeData2.find(dataCheck)){
                viewData3(state.selId);
            }else{
                //필트 초기화
                state.selDetail = [{id:"none",name:"",pivot:""}]
                state.selProcess = [{id:"none",name:"",pivot:""}]

                //검색 목록 초기화
                state.filter_details = state.produce_details
                state.filter_process = state.produce_process
            }
        }
    };

    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback(
        (type) => (e) => {
            if (type === 'ranges') {
                
            }else if (type==='selStep1' || type==='selStep2'){
                stateData[type] = e.target.value;
            }else{
                stateData[type] = e;
            }
        },[],
    );

    const handleReset = useCallback(() => {
        return confirm({
            title: `이 창의 입력 내용이 삭제됩니다.`,
            content: `그래도 계속 하시겠습니까?`,
                async onOk() {
                    state.treeControl= [];
                    state.depth3Data= [];
                    state.treeData=[];
                    state.treeData2=[];
                    state.selDetail=[];
                    state.selProcess=[];
                    // state.selId='';

                    state.filter_details = [];
                    state.filter_process = [];

                    state.data={
                        step1:[],
                        step2:[],
                        step_process:[],
                        step_details:[]
                    };
                    viewData();
                },
            });
    }, []);

    //등록
    const handleSubmit = useCallback(async (e)=> {
        var url = "";
        var data = [];
        if(e == 0){
            // url = process.env.REACT_APP_API_URL +'/api/v1/produce-code1';
            url = '/produce-code1';
            state.data.step1.map(item => {
                if(item.id && item.id > 0){
                    data = [...data,{id:item.id, name:item.name}];
                }else{
                    data = [...data,{name:item.name}];
                }
            });

            //빈칸 리스트 목록에서 삭제
            data = data.filter(item => item.name != 'none');
        }else if(e == 1){
            // url = process.env.REACT_APP_API_URL +'/api/v1/produce-code2';
            url = '/produce-code2';
            state.data.step2.map(item => {
                if(item.id && item.id > 0){
                    data = [...data,{id:item.id, produce_code1_id:item.produce_code1_id, name:item.name}];
                }else{
                    data = [...data,{produce_code1_id:item.produce_code1_id, name:item.name}];
                }
            });

            //빈칸 리스트 목록에서 삭제
            data = data.filter(item => item.name != 'none');
        }else if(e == 2|| e== 3){
            // url = process.env.REACT_APP_API_URL +'/api/v1/produce-code2-details';
            url = '/produce-code2-details';
            var details = [];
            var process = [];
            state.selDetail.map(item=>{
                details = [...details,item.id];
            });
            state.data.step_details.map(item=>{
                details = [...details,item.sub_id];
            });
            state.selProcess.map(item=>{
                process = [...process,item.id];
            });
            state.data.step_process.map(item=>{
                process = [...process,item.sub_id];
            });
            data = [...data, {id:state.selId, produce_process_detail_id:details, produce_process_code_id:process}];

            //빈칸 리스트 목록에서 삭제
            data.map(item => {
                item.produce_process_code_id = item.produce_process_code_id.filter(x=>x!='none');
                item.produce_process_detail_id = item.produce_process_detail_id.filter(x=>x!='none');
            });
        }else if(e == 4){
            // url = process.env.REACT_APP_API_URL +'/api/v1/produce-code2';
            url = '/produce-code2';
            state.data.step2.map(item => {
                var keys = Object.keys(item);
                var temp = {};
                keys.map(item2  => {
                    temp[item2] = item[item2];
                });
                data = [...data,temp];
            });
        }else{
            return false;
        }

        const result = await commonStore.handleApi({
            url: url,
            method:'POST',
            data : data
        });

        if(result.id != ''){
            Modal.success({
                title: result.result,
                onOk(){
                    // state.treeControl= [];
                    // state.depth3Data= [];
                    // state.treeData=[];
                    // state.treeData2=[];
                    // state.selDetail=[];
                    // state.selProcess=[];
                    // state.selId='';

                    // state.filter_details = [];
                    // state.filter_process = [];

                    state.data={
                        step1:[],
                        step2:[],
                        step_process:[],
                        step_details:[]
                    };
                    stateData.selStep1 = ''
                    stateData.selProcess = ''
                    stateData.selDetail = null
                    stateData.selProcess = null
                    // viewData();
                },
            });
        }else{
            Modal.error({
                content:(<div>
                            <p>등록시 문제가 발생하였습니다.</p>
                            <p>재시도해주세요.</p>
                            <p>오류코드: {result.error}</p>
                        </div>)
            });  
        }
    }, []); 

    //등록
    const handleDisconnect = useCallback(async (detail,process)=> {      
        
        var data = [{
            id : state.selId,
            produce_process_detail_id : [detail],
            produce_process_code_id : [process]
        }];

        if(data.length > 0){
            const result = await commonStore.handleApi({
                url: '/produce-code2-details',
                method:'DELETE',
                data : data
            });

            if(result.success !== false){
                Modal.success({
                    title: result.result,
                    onOk(){
                        state.treeControl= [];
                        state.depth3Data= [];
                        state.treeData=[];
                        state.treeData2=[];
                        state.selDetail=[];
                        state.selProcess=[];
                        // state.selId='';

                        state.filter_details = [];
                        state.filter_process = [];

                        state.data={
                            step1:[],
                            step2:[],
                            step_process:[],
                            step_details:[]
                        };
                        viewData();
                    },
                });
            }else{
                Modal.error({
                    content:(<div>
                                <p>등록시 문제가 발생하였습니다.</p>
                                <p>재시도해주세요.</p>
                                <p>오류코드: {result.error}</p>
                            </div>)
                });  
            }
        }else{
            Modal.warning({
                title: '등록할 데이터가 없습니다.',
            });  
        }
        
    }, []);


    return (
        <Wrapper>
            <Card className="card-box adm_department_wrap">
                <Row gutter={20} className="adm_code_wrap">
                    <Col className="gutter-row" span={6}>
                        <Card title="기본 구성 1차 분류">
                            <div className="container_treeview onlylist">
                                <wjNav.TreeView isReadOnly={false} 
                                    itemsSource={state.treeData}
                                    displayMemberPath="name"
                                    showCheckboxes={false} allowDragging={true} 
                                    selectedItemChanged={selectedItemChanged.bind(this,1)}
                                    dragOver={onDragOver.bind(this)} initialized={initialized.bind(this)}
                                />
                                <div className="add_ipt_wrap">
                                    <Input value={stateData.selStep1} onChange={handleChangeInput('selStep1')}/>
                                    <Button type="primary" onClick={(e)=>{addNode(0)}}>+</Button>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col className="gutter-row" span={6}>
                        <Card title="기본 구성 2차 분류">
                            <div className="container_treeview onlylist">
                                <wjNav.TreeView 
                                    id="treeView2"
                                    itemsSource={state.treeData2}
                                    displayMemberPath="name"
                                    showCheckboxes={false} allowDragging={true} 
                                    formatItem={onFormatItem.bind(this)}
                                    selectedItemChanged={selectedItemChanged.bind(this,2)}
                                    dragOver={onDragOver.bind(this)}  initialized={initialized.bind(this)} />
                                <div className="add_ipt_wrap">
                                    <Input value={stateData.selStep2} onChange={handleChangeInput('selStep2')}/>
                                    <Button type="primary" onClick={(e)=>{addNode(1)}}>+</Button>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col className="gutter-row" span={6}>
                        <Card title="기본 구성과 연결할 상품 세부 구성">
                            <div className="container_treeview onlylist">
                                <wjNav.TreeView 
                                    id="treeView3"
                                    itemsSource={state.selDetail}
                                    displayMemberPath="name"
                                    showCheckboxes={false} allowDragging={true} 
                                    dragOver={onDragOver.bind(this)}
                                    formatItem={onFormatItem.bind(this)} initialized={initialized.bind(this)} />
                                <div className="add_ipt_wrap">
                                    {/* <Input id="theInput3" /> */}
                                    <Select
                                        labelInValue
                                        placeholder="세부 구성 선택"
                                        // onChange={handleChangeInput('bank_id')}
                                        id="theInput3"
                                        value={stateData.selDetail}
                                        onChange={handleChangeInput('selDetail')}
                                    >
                                        {state.filter_details.map((e) => (
                                            <Option key={e.id} value={e.id}>
                                                {e.name}
                                            </Option>
                                        ))}
                                    </Select>
                                    <Button type="primary" onClick={(e)=>{addNode(2)}}>+</Button>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col className="gutter-row last-treeview" span={6}>
                        <Card title="기본 구성과 연결할 공정">
                            <div className="container_treeview">
                                <wjNav.TreeView 
                                    id="treeView4"
                                    itemsSource={state.selProcess} 
                                    displayMemberPath="name" childItemsPath="children" collapseOnClick={false} 
                                    collapseWhenDisabled={true} showCheckboxes={false} allowDragging={true} 
                                    dragOver={onDragOver.bind(this)} dragEnd={onDragEnd.bind(this)} 
                                    formatItem={onFormatItem.bind(this)} initialized={initialized.bind(this)} />
                                <div className="add_ipt_wrap">
                                    {/* <Input id="theInput4" /> */}
                                    <Select
                                        labelInValue
                                        placeholder="공정 선택"
                                        // onChange={handleChangeInput('bank_id')}
                                        id="theInput4"
                                        value={stateData.selProcess}
                                        onChange={handleChangeInput('selProcess')}
                                    >
                                        {state.filter_process.map((e) => (
                                            <Option key={e.id} value={e.id}>
                                                {e.name}
                                            </Option>
                                        ))}
                                    </Select>
                                    <Button type="primary" onClick={(e)=>{addNode(3)}}>+</Button>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    </Row>
                    <br />
                    <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                    <Col>
                        <Button type="primary" onClick={()=>handleSubmit(4)}>확인</Button>
                    </Col>
                    <Col>
                        <Button onClick={handleReset}>취소</Button>
                    </Col>
                </Row>
            </Card>
        </Wrapper>
    );
});

export default PrdBasic;
