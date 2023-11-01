/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState,useMemo,useRef } from 'react';
import { Breadcrumb, Form, Row, Col, Input, Space , Tabs, Card, Button, message, Modal} from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import { toJS } from 'mobx';
import * as wjNav from '@grapecity/wijmo.react.nav';
import * as WjcNav from "@grapecity/wijmo.nav";

const Wrapper = styled.div`
  width: 100%;
  .wj-flexgrid .wj-state-sticky .wj-header {opacity : unset;}

`;

const DEF_STATE = {
    // DB Data
    theInput: '',
    theInput2: '', 
    inTxt: '', 
};

const BankCode = observer(({tab }) => {
    const { commonStore } = useStore();
    const { confirm } = Modal;

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 

    const state = useLocalStore(() => ({
        data: [],
        upData : [],
        tab: '',

        treeControl: '',
        treeControl2: '',
        
        dataDepth2: [],
        parentId: '',
        parentData: [],

        errorChk : '',
        error2depthChk : '',
    }));

    useEffect(() => { 
        state.tab = tab;
        state.upData = [];
        if(tab == 'bank'){
            //초기화
            state.upData =[];
            state.dataDepth2= [];
            state.parentId= '';
            state.parentData= [];
            state.errorChk = '';
            state.error2depthChk = '';
            setDataDepth2();

            viewData();           
        }        
    
    }, [tab]);

    const [dataDepth2, setDataDepth2] = React.useState();
    const [allowDragging, setAllowDragging] = useState(true);

    //상세정보
    const viewData = useCallback(async (val) => {    
        var axios = require('axios');

        var config = {
            method: 'GET',
            url:process.env.REACT_APP_API_URL +'/api/v1/banks',
            headers: {
                Accept: 'application/json',
            },
        };

        axios(config)
            .then(function (result) {
                // if (result.data.success === false) {
                if (result.status !== 200) {
                    Modal.error({
                        title: '오류가 발생했습니다.',
                        content: '오류코드:' + result.data.message,
                    });
                } else {
                    if(val){
                        //state.dataDepth2 = result.data.data[0].detail;
                    }else{
                        state.data = result.data.data;
                    }
                    
                }
            })
            .catch(function (error) {
                if(error.response !== undefined){
                    console.log(error.response);
                    Modal.error({
                        title: '오류가 발생했습니다. 재시도해주세요.',
                        content: '오류코드:' + error.response.status,
                    });
                }                
            });
        
    }, []);

    const handleReset = useCallback(() => {
        confirm({
            icon: <ExclamationCircleOutlined />,
            title: '이 창의 입력 내용이 삭제됩니다.',
            content: '그래도 계속 하시겠습니까?',
            onOk() {
                viewData();
                state.upData =[];
                state.dataDepth2= [];
                state.parentId= '';
                state.parentData= [];
                state.errorChk = '';
                state.error2depthChk = '';
                setDataDepth2();
            },
            onCancel() {
              
            },
        });
        // Modal.warning({
        //     title: '이 창의 입력 내용이 삭제됩니다.',
        //     content: '그래도 계속 하시겠습니까?',
        //     onOk(){
        //         viewData();
        //         state.upData =[];
        //         state.dataDepth2= [];
        //         state.parentId= '';
        //         state.parentData= [];
        //         state.errorChk = '';
        //         state.error2depthChk = '';
        //         setDataDepth2();

        //     }
        // });
    }, []);

    const initialized = ( control) => {
        state.treeControl = control;
    }

    const initialized2 = ( control) => {
        state.treeControl2 =control;
    }
    

    //1depth 클릭시 2depth 데이터 및 1depth 정보 담기
    const onItemClicked = (e) => {   
        if(state.errorChk ){ //1depth 명칭 빈값일때 토글 수정              
            toggleAction(state.errorChk,'','1depth')
        }else{
            var control = e.selectedItem;  
            setDataDepth2(control.detail) //2depth 데이터

            state.parentId = control.id;    //2depth 부모 id
            state.parentData =[{id: control.id, name : control.name, ordnum:control.ordnum, use_yn: control.use_yn}] //2depth 부모 데이터

            if(control.id == '0'){
                toggleAction('btn'+control.id+String(control.ordnum),'')
            }else{
                toggleAction('btn'+control.id,'')
            }           
        }
    }

    //1depth 명칭 빈값일때 2depth 토글 수정
    const onItemClicked2 = (e)=>{       

        if(state.error2depthChk ){ //1depth 명칭 빈값일때 토글 수정            
            toggleAction(state.error2depthChk,state.errorChk,'2depth')
        }else{
            var control = e.selectedItem;  
            if(control.id == '0'){
                var text = 'btn'+String(control.bank_type_id)+control.id+String(control.ordnum);
                toggleAction(text,control.bank_type_id)
            }else{
                toggleAction('btn'+control.id,control.bank_type_id)
            }
            
        }                 
    }

    //1depth 상하 수정
    const onDragEnd = (s, e) => {         
        if(state.errorChk){                    
            toggleAction(state.errorChk,'','1depth')
        }else{
            var control = s.nodes;  //s.selectedNode로 할시 순서 오류남 '*nodes : 노드의 자식 노드를 포함하는 배열을 가져옵니다.'
            state.parentId = s.selectedItem.id;
            state.parentData =s.selectedItem;
    
            var arr = [];
            control.map((e, num) => {
                var chkNum = num+1
                if(e.dataItem.ordnum != chkNum){                
                    e.dataItem.ordnum = chkNum;
                    arr = [...arr, {id: e.dataItem.id, name: e.dataItem.name, ordnum : chkNum,use_yn: e.dataItem.use_yn}]
                }
            })
    
            if(state.upData.length > 0){
                arr.map((e, num)=>{
                    chkArr('1depth',arr[num])
                })
                
            }else{
                state.upData = arr;
            }
    
            //2depth 데이터 셋팅
            var control = s.selectedItem;  
            setDataDepth2(control.detail)
            
            //토글
            const eldepth = document.getElementsByClassName('active');      
            for (var i = 0; i < eldepth.length; i++) {
                if(eldepth[i].classList.contains('wj-state-selected')){                        
                    eldepth[i].classList.remove("wj-state-selected")
                }
                if(eldepth[i].classList.contains('1depth')){
                    eldepth[i].classList.remove("1depth")
                }
                if(eldepth[i].classList.contains('active')){
                    eldepth[i].classList.remove("active")
                }
            }
            
            //클릭된 내용만 add
            const elB = document.getElementById('btn'+s.selectedItem.id);
            if(elB !== undefined && elB !== null && elB !== ''){
                const elNode = elB.parentNode.parentNode;
                if(elNode.classList.contains('active')){ //있으면 active 삭제
                }else{ //없으면 추가
                    elNode.classList.add("1depth")
                    elNode.classList.add("wj-state-selected")
                }
            }            
        }      
    }

    //2depth 상하수정
    const onDragEnd2 = (s, e) => {         
        var control = s.nodes;

        var arr = [];
        control.map((e, num) => {
            var chkNum = num+1
            if(e.dataItem.ordnum != chkNum){
                e.dataItem.ordnum = chkNum;
                arr = [...arr, {id: e.dataItem.id, name: e.dataItem.name, ordnum : chkNum, bank_type_id: e.dataItem.bank_type_id, use_yn: e.dataItem.use_yn, memo: e.dataItem.memo}]
            }            
        })

        if(state.upData.length > 0){         
            arr.map((e,num) =>{
                chkArr('2depth',arr[num])
            })          
        }else{
            state.upData= [{...state.parentData[0], detail: arr}];
        }

        if(state.errorChk || state.error2depthChk){
            message.warning('명칭은 빈값일 수 없습니다.');
        }else{           
            //토글
            const eldepth = document.getElementsByClassName('active');      
            for (var i = 0; i < eldepth.length; i++) {
                if(eldepth[i].classList.contains('1depth')){

                }else{
                    if(eldepth[i].classList.contains('wj-state-selected')){                        
                        eldepth[i].classList.remove("wj-state-selected")
                    }
                    if(eldepth[i].classList.contains('2depth')){
                        eldepth[i].classList.remove("2depth")
                    }
                    if(eldepth[i].classList.contains('active')){
                        eldepth[i].classList.remove("active")
                    }
                }
                
            }
            
            //클릭된 내용만 add
            const elB = document.getElementById('btn'+s.selectedItem.id);
            if(elB !== undefined && elB !== null && elB !== ''){
                const elNode = elB.parentNode.parentNode;
                if(elNode.classList.contains('active')){ //있으면 active 삭제
                }else{ //없으면 추가
                    elNode.classList.add("2depth")
                    elNode.classList.add("wj-state-selected")
                }
            }

            const eldepth2 = document.getElementsByClassName('wj-state-selected');  
            if(eldepth2.classList != undefined){
                for (var i = 0; i < eldepth2.length; i++) {
                    if( eldepth2[i].classList.contains('1depth') ||  eldepth2[i].classList.contains('2depth')){
                        eldepth[i].classList.remove("wj-state-selected")
                    }
                }
            }
            
        }
        
    }

    //상하 데이터 수정
    const chkArr = (type,val)=>{
        if(type == '1depth'){
            var chk = false;
            for (let i = 0; i< state.upData.length; i++) {
                if(state.upData[i].name === val.name){
                    state.upData[i].ordnum = val.ordnum
                    chk=false;
                    break;
                }else{
                    chk = true;
                }
            }
    
            if(chk == true){
                state.upData = [...state.upData, val]
            }
        }else{
            var parentChk = false;
            for (let i = 0; i< state.upData.length; i++) { //1depth에 데이터가 있을시
                if(state.upData[i].id === val.bank_type_id){    //1depth 데이터 중 2depth부모가 있을경우
                    let detailChk = state.upData[i].detail;
    
                    if(state.upData[i].detail != '' && detailChk != undefined && detailChk != null){ //2depth부모의 detail이 있을 경우
                        for( let e=0; e < state.upData[i].detail.length; e++){
                            if(state.upData[i].detail[e].name == val.name){
                                state.upData[i].detail[e].ordnum = val.ordnum
                                chk = false;
                                break;
                            }else{
                                chk = true;
                            }                 
                        }  
                        if(chk == true){               
                            state.upData[i].detail= [...state.upData[i].detail, val];
                        }
                        parentChk = false;
                        break;
                    }else{ //2depth부모의 detail이 없을 경우 추가
                        state.upData[i].detail= [val];
                        parentChk = false;
                        break;
                    }
                }else{
                    parentChk = true;
                }
            }

            if(parentChk == true){               
                state.upData= [...state.upData,{...state.parentData[0], detail: [val]}];
            }            
        }               
        
    }

    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback((type) => (e) => {
        stateData[type] = e.target.value;
    },[],);

    //추가
    const addNode = (type, depth) => {
        if(state.errorChk || state.error2depthChk){
            message.warning('명칭은 빈값일 수 없습니다.');
        }else{
            if(stateData.theInput != "" || stateData.theInput2 != ""){   
                var control = state.treeControl;
                var control2 = state.treeControl2;
                if(type == '2depth'){        
                    if(state.errorChk){
                        message.warning('명칭은 빈값일 수 없습니다.');
                        return;
                    }else{
                        if(state.parentId === ''){
                            message.warning('1Depth를 선택후 입력해 주세요.');
                            return;
                        }else{
                            if(state.parentId === 0||state.parentId === '0'){
                                message.warning('새로 추가한 1Depth인 경우 등록 후 2Depth 입력이 가능합니다.');
                                return;
                            }else{
                                var newItem = { id:'0', bank_type_id :state.parentId, name: stateData.theInput2, ordnum : control2.totalItemCount+1, memo:'',use_yn : 'Y'},  
                                node = control.selectedNode;
                            
                                stateData.theInput2 ='';
      
                                if(node.dataItem.detail.length > 0){
                                    var index = control2.nodes ? control2.nodes.length : 0;
                                    control2.selectedNode = control2.addChildNode(index, newItem);
                                    control2.selectedNode.element.classList.add("active");   
                                    control2.selectedNode.element.classList.add("2depth") ;  
                                
                                    onFormatItem('', control2.selectedNode)
                                }else{
                                    node.dataItem.detail = [newItem];
                                    setDataDepth2(control.selectedItem.detail)
                                    onFormatItem(control2, control.selectedNode)
                                }
        
                                if(state.upData.length >0 ) {
                                    var chk = false;
                                    for (let i = 0; i< state.upData.length; i++) {
                                        if(state.upData[i].id === newItem.bank_type_id){ //2depth의 부모 1depth가 있으면
                                            let detailChk = state.upData[i].detail;
        
                                            if(state.upData[i].detail != '' && detailChk != undefined && detailChk != null){ //1depth detail이 있을 경우
                                                state.upData[i].detail= [...state.upData[i].detail, newItem];
                                                chk = false;
                                                break;
                                            }else{ //1depth가 있지만 detail이 없을 경우 추가
                                                state.upData[i]= {...state.upData[i], detail:[newItem]};
                                                chk = false;
                                                break;
                                            }
                                        }else{
                                            chk = true;
                                        }
                                    }
        
                                    if(chk == true){ // 1depth는 있으나 2depth의 부모가 없을 경우
                                        state.upData= [...state.upData,{...state.parentData[0], detail: [newItem]}];
                                    }
                                }else{
                                    state.upData= [{...state.parentData[0], detail: [newItem]}];
                                }
                            }                    
                        }
                    }

                    var btn = String(newItem.id)+String(newItem.bank_type_id)+String(newItem.ordnum);

                    toggleAction('btn'+btn, newItem.bank_type_id);  
                    
                }else{
                    state.dataDepth2 = []; //오류났던 부분(상단으로 바꾸니 오류 안남)     
                    var newItem = { id:'0', name: stateData.theInput, ordnum : control.totalItemCount+1,use_yn : 'Y'}
                    stateData.theInput ='';
                    state.parentId = 0;      
                    var index = control.nodes ? control.nodes.length : 0;
                    control.selectedNode = control.addChildNode(index, newItem);
                    // control.selectedNode.element.classList.add("active");   
                    // control.selectedNode.element.classList.add("1depth") ;  

                    onFormatItem('', control.selectedNode)

                    if(state.upData.length >0 ) {
                        state.upData = [...state.upData, newItem]
                    }else{
                        state.upData = [newItem]
                    }            

                    var btn = String(newItem.id)+String(newItem.ordnum);

                    toggleAction('btn'+btn,'');  
                    setDataDepth2();     
                }                
                
            }else{
                message.warning('내용을 입력해 주세요.');
            }
        }
    } 

    //format
    const onFormatItem = (s, e) => {
        //2depth인지 확인용
        const parent = e.element.parentNode.parentNode.parentNode.parentNode; 
        
        const control = e;
        // var inTxt = e.element.innerText; 
        var inTxt = e.dataItem.name; 
        var userYN = e.dataItem.use_yn;
        e.element.classList.add('wj-node-acc');
        var btnUseColor = '';

        if(userYN === 'Y'){
            var chkY = ' checked = "checked"';
            var chkN = '';
            btnUseColor = ''
        }else{
            var chkY ='';
            var chkN = ' checked = "checked"';
            btnUseColor = 'btn_use_color'
        }
        
        if(e.dataItem.bank_type_id !== null && e.dataItem.bank_type_id !== undefined && e.dataItem.bank_type_id !== ''){ //2depth
            if(e.dataItem.id == 0 || e.dataItem.id == '0'){
                var datass = String(e.dataItem.bank_type_id)+String(e.dataItem.id)+String(e.dataItem.ordnum);
            }else{
                var datass = e.dataItem.id;
            }
            if(e.dataItem.memo == undefined || e.dataItem.memo == null){
                var inMemo = '';
            }else{
                var inMemo = e.dataItem.memo;
            }
            //textarea 한글만 가능해서 input으로 수정
            // var memoHtml = '<label>주석</label><textarea id="memo'+datass+'" name="memo'+datass+'" class="ant-input" placeholder="해당 코드에 대한 주석입니다."></textarea>'
            var memoHtml = '<label>주석</label><input id="memo'+datass+'" type="text" name="memo'+datass+'" class="ant-input disTg disDrag" value="'+inMemo+'" placeholder="해당 코드에 대한 주석입니다." />'
        }else{ 
            if(e.dataItem.id == 0 || e.dataItem.id == '0'){
                var datass = String(e.dataItem.id)+String(e.dataItem.ordnum);
            }else{
                var datass = e.dataItem.id;
            }
            var memoHtml = ''
        }

        var html  = '<div class="acc_wrap" id="acc'+datass+'"><span class="btn_acc '+btnUseColor+'" id="btn'+datass+'">'+ inTxt +'<i class="ant-menu-submenu-arrow"></i></span>'+ 
            '<div class="accIn" id="cont'+datass+'"><label>명칭 수정</label>'+
            '<input id="title'+datass+'" type="text" name="name'+datass+'" class="ant-input disTg disDrag" value="'+ inTxt+'" autoComplete="off" />'+
            memoHtml+
            '<div class="code_wrap"><label>코드 사용</label><div class="radio_wrap">'+
            '<label class="disTg"><input type="radio" id="useY'+datass+'" name="useYN'+datass+'" value="Y" '+chkY+'>사용</label>'+
            '<label class="disTg"><input type="radio" id="useN'+datass+'" name="useYN'+datass+'" value="N" '+chkN+'>숨김</label></div></div></div></div>';

        e.element.innerHTML = html;
        
        const elCon = document.getElementsByClassName("disTg");
        const elDrag = document.getElementsByClassName("disDrag");
        const elBtn = document.getElementById("acc"+datass);
        // elBtn.addEventListener("click", function(a){toggleAction("btn"+datass,e.dataItem.bank_type_id)}, false);
        for (var i = 0; i < elCon.length; i++) {
            elCon[i].addEventListener('click', function(e){e.stopPropagation();}, false);
            
        }
        for (var i = 0; i < elDrag.length; i++) {
            elDrag[i].addEventListener('mousedown', function(e){
                setAllowDragging(false);
            }, false);

            elDrag[i].addEventListener('mouseup', function(e){
                setAllowDragging(true);
            }, false);
        }

        //타이틀수정
        if(parent.classList[3] != 'last-treeview' && parent.classList[3] == undefined ){        
            var title = control.dataItem.name;        
            const nameChange =  document.getElementById("title"+datass);        
            nameChange.addEventListener("keyup", function(event){
                control.element.querySelector('span').innerHTML = nameChange.value+'<i class="ant-menu-submenu-arrow"></i>';
                control.dataItem.name = nameChange.value;
                if(inTxt !== nameChange.value && nameChange.value !== '' ){  
                    if(state.error2depthChk =='' || state.error2depthChk == undefined){
                        if(e.dataItem.bank_type_id){
                            state.errorChk = '';
                        }else{
                            state.errorChk = '';
                        }   
                    }       
                    dataChange(e.dataItem);   
                } else{
                    if(e.dataItem.bank_type_id){
                        state.errorChk = 'btn'+e.dataItem.bank_id;  
                    }else{
                        state.errorChk = 'btn'+datass;
                    }
                }
            }, false);

        }else{

            const nameChange2 =  document.getElementById("title"+datass);
            // nameChange2.addEventListener("change", function(event){
            nameChange2.addEventListener("keyup", function(event){
                control.element.querySelector('span').innerHTML = nameChange2.value+'<i class="ant-menu-submenu-arrow"></i>';
                control.dataItem.name = nameChange2.value;
                if(inTxt !== nameChange2.value || nameChange2.value !== ''){    
                    if(e.dataItem.bank_type_id){
                        state.error2depthChk = '';    
                        state.errorChk = '';
                    }else{
                        state.errorChk = '';
                    }   
                    dataChange(e.dataItem);
                } else{
                    if(e.dataItem.bank_type_id){
                        state.error2depthChk = 'btn'+datass;    
                        state.errorChk = 'btn'+e.dataItem.bank_id;    
                        const elNode = elBtn.parentNode;               
                        elNode.classList.add("wj-state-selected")
                    }else{
                        state.errorChk = 'btn'+datass;
                        const elNode = elBtn.parentNode;               
                        elNode.classList.add("wj-state-selected")
                    }      
                }
            }, false);
        }

        if(memoHtml){
            //메모
            // var memoTxt = e.element.querySelector('textarea').value;
            const memo =  document.getElementById("memo"+datass);      
            memo.addEventListener("keyup", function(event){
                control.dataItem.memo = memo.value;
                if(memo.value){
                    dataChange(e.dataItem);
                }            
            }, false);
        }
 
        //사용여부
        const useY =  document.getElementById("useY"+datass);
        const useN =  document.getElementById("useN"+datass);
        const elB = document.getElementById("btn"+datass);
        
        useY.addEventListener("click", function(event){
            control.dataItem.use_yn = useY.value;
            if(userYN != useY.value){
                userYN = useY.value
                elB.classList.remove("btn_use_color")
                dataChange(e.dataItem);
            }
            
        }, false);
        useN.addEventListener("click", function(event){
            control.dataItem.use_yn = useN.value;
            if(userYN != useN.value){
                userYN = useN.value
                elB.classList.add("btn_use_color")
                dataChange(e.dataItem);
            }
        }, false);  
        
        // e.element.removeEnevtListener('keypress',false)
        e.element.addEventListener('keypress', (event) => {
            event.stopPropagation();
        });
        e.element.addEventListener('keydown', (event) => {
            event.stopPropagation();
        });
    }  
    

    //내용수정
    const dataChange=(val)=>{
        //2depth
        if(val.bank_type_id !== null && val.bank_type_id !== undefined && val.bank_type_id !== ''){
            var chk = false;
            if(state.upData.length >0 ) { //업뎃데이터가 있을경우
                var length = 0;
                for (let i = 0; i< state.upData.length; i++) {
                    if(state.upData[i].id === val.bank_type_id){ //업뎃 부모 데이터가 있을경우 업뎃
                        for( let e=0; e < state.upData[i].detail.length; e++){ //detail 값이 있을 경우 업뎃
                            if(state.upData[i].detail[e].ordnum == val.ordnum){
                                state.upData[i].detail[e].name = val.name
                                state.upData[i].detail[e].memo = val.memo
                                state.upData[i].detail[e].use_yn = val.use_yn
                                chk = false;
                                break;
                            }else{
                                chk = true;
                            }                 
                        }   
                        length = i;                      

                        if(chk == true){ //업뎃 데이터에 부모값만 있을경우 detail 추가
                            state.upData[length].detail= [...state.upData[length].detail, val];
                        }
                        break;
                    }else{
                        chk = true;
                    }
                }
                if(chk == true){ //업뎃 데이터에 추가
                    state.upData= [...state.upData, {...state.parentData[0], detail: [val]}];
                }
            }else{ //업뎃 데이터가 없을경우
                state.upData= [{...state.parentData[0], detail: [val]}];
            }
        }else{
            let data = {id: val.id, name : val.name, ordnum: val.ordnum, use_yn: val.use_yn}
            if(state.upData.length>0){
                var chk = false;
                for (let i = 0; i< state.upData.length; i++) {
                    if(state.upData[i].id === val.id){
                        state.upData[i].name = val.name
                        state.upData[i].use_yn = val.use_yn
                        chk=false;
                        break;
                    }else{
                        chk = true;
                    }
                }
        
                if(chk == true){
                    state.upData = [...state.upData, data]
                }
            }else{
                state.upData = [data]
            }
        }
    }

    const toggleAction = (obj,bankTypeId, type)=>{    
        if(type){
            if(type === '1depth'){       
                const eldepth = document.getElementsByClassName('wj-node-acc');      
                if(eldepth !== undefined && eldepth !== null && eldepth != ''){
                    for (var i = 0; i < eldepth.length; i++) {     
                        if(eldepth[i].classList.contains('1depth')){
                            eldepth[i].classList.add("wj-state-selected")
                        } else{
                            eldepth[i].classList.remove("wj-state-selected")                                                      
                        } 
                    }
                }

                if(state.error2depthChk){
                    if(eldepth !== undefined && eldepth !== null && eldepth != ''){
                        for (var i = 0; i < eldepth.length; i++) {     
                            if(eldepth[i].classList.contains('2depth')){
                                eldepth[i].classList.add("wj-state-selected")
                            } else{
                                if(eldepth[i].classList.contains('1depth')){
                                    eldepth[i].classList.add("wj-state-selected")
                                }else{
                                    eldepth[i].classList.remove("wj-state-selected")  
                                }
                               
                            }
                        }
                    }
                }

                message.warning('명칭은 빈값일 수 없습니다.');
            }else{
                const eldepth = document.getElementsByClassName('wj-node-acc');      
                if(eldepth !== undefined && eldepth !== null && eldepth != ''){
                    for (var i = 0; i < eldepth.length; i++) {     
                        if(eldepth[i].classList.contains('2depth')){
                            eldepth[i].classList.add("wj-state-selected")
                        } else{
                            if(eldepth[i].classList.contains('1depth') == false){
                                eldepth[i].classList.remove("wj-state-selected")
                            }
                        } 
                    }
                }
                message.warning('명칭은 빈값일 수 없습니다.');
            }
        }else{       
            if(state.errorChk){
                message.warning('명칭은 빈값일 수 없습니다.');
            }else{
                //2depth
                console.log(1)
                if(bankTypeId != '' && bankTypeId !== null && bankTypeId !== undefined){
                    //클릭된 내용만 add
                    const elB = document.getElementById(obj);
                    if(elB !== undefined && elB !== null && elB !== ''){
                        const elNode = elB.parentNode.parentNode;
                        if(elNode.classList.contains('active')){ //있으면 active 삭제
                            elNode.classList.remove("active")
                        }else{ //없으면 추가
                            elNode.classList.add("2depth")
                            elNode.classList.add("wj-state-selected")
                            elNode.classList.add("active")                    
                        }
                    }

                    const eldepth = document.getElementsByClassName('wj-node-acc');      
                    for (var i = 0; i < eldepth.length; i++) {                
                        if(eldepth[i].classList.contains('2depth') && eldepth[i].classList.contains('active') && eldepth[i].classList.contains('wj-state-selected') == false){
                            eldepth[i].classList.remove("active")
                            eldepth[i].classList.remove("2depth")                    
                        }
                    }              
                }else{ //1depth
                    //클릭된 내용만 add
                    const elB = document.getElementById(obj);
                    const eldepth2 = document.getElementsByClassName('wj-node-acc');      
                    for (var i = 0; i < eldepth2.length; i++) {                
                        if(eldepth2[i].classList.contains('1depth') && eldepth2[i].classList.contains('active') && eldepth2[i].classList.contains('wj-state-selected') == true){
                            eldepth2[i].classList.remove("active")
                            eldepth2[i].classList.remove("1depth")         
                            eldepth2[i].classList.remove("wj-state-selected")         
                        }
                    }

                    if(elB !== undefined && elB !== null && elB !== ''){
                        const elNode = elB.parentNode.parentNode;
                        if(elNode.classList.contains('active')){ //있으면 active 삭제
                            elNode.classList.remove("active")
                        }else{ //없으면 추가
                            elNode.classList.add("1depth")
                            elNode.classList.add("wj-state-selected")
                            elNode.classList.add("active")                    
                        }
                    }

                    const eldepth = document.getElementsByClassName('wj-node-acc');      
                    for (var i = 0; i < eldepth.length; i++) {                
                        if(eldepth[i].classList.contains('1depth') && eldepth[i].classList.contains('active') && eldepth[i].classList.contains('wj-state-selected') == false){
                            eldepth[i].classList.remove("active")
                            eldepth[i].classList.remove("1depth")         
                        }
                    }
                }
            }
        }
    }

    //등록
    const handleSubmit = useCallback(async (e)=> {
        console.log(toJS(state.upData)); 
        if(state.errorChk || state.error2depthChk){
            message.warning('내용을 입력해 주세요.');
        }
        // return
        if(state.upData.length > 0){
            var axios = require('axios');

            var config={
                method:'POST',
                url:process.env.REACT_APP_API_URL +'/api/v1/banks/',
                headers:{
                    'Accept':'application/json',
                },
                    data:state.upData
                };
                
            axios(config)
            .then(function(response){
                if(response.data.success != false){
                    Modal.success({
                        title: '정보가 수정되었습니다.',
                        onOk(){
                            viewData();
                            state.upData =[];
                            state.dataDepth2= [];
                            state.parentId= '';
                            state.parentData= [];
                            setDataDepth2();
                        },
                    });
                }else{
                    Modal.error({
                        content:(<div>
                                    <p>등록시 문제가 발생하였습니다.</p>
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
        }else{
            Modal.warning({
                title : '등록할 내용이 없습니다.',
            }); 
        }
    }, []);      

    // const selectedItemChanged = (s) => {
    //     if (s.allowDragging == false) {
    //         s.selectedItem = null;       
    //         console.log(1)     
    //     } else {
    //         state.treeControl.selectedItem = s.selectedItem;
    //     }
    // };

    //  const selectedItemChanged2 = (s) => {
    //     if (s.allowDragging == false) {
    //       s.selectedItem = null;
    //     } else {
    //         state.treeControl.selectedItem = s.selectedItem;
    //     }
    //  };
    

return (
    <Wrapper>
      
        <Row gutter={20} className="adm_code_wrap">
            <Col className="gutter-row" span={10}>
                <div className="container_treeview onlylist">
                    <wjNav.TreeView 
                        isReadOnly={false} 
                        itemsSource={state.data} 
                        // dataItem={state.data} 
                        displayMemberPath="name" 
                        imageMemberPath="img" 
                        showCheckboxes={false} 
                        allowDragging={allowDragging} 
                        dragEnd={onDragEnd.bind(this)} 
                        initialized={initialized.bind(this)}                          
                        formatItem={onFormatItem.bind(this)} 
                        itemClicked={onItemClicked.bind(this)}
                        // selectedItemChanged={selectedItemChanged}
                    />

                    <div className="add_ipt_wrap">
                        <Input id="theInput"  value={stateData.theInput} onChange={handleChangeInput('theInput')} />
                        <Button type="primary" onClick={(e)=>{addNode('1depth',0)}}>+</Button>
                    </div>
                </div>
            </Col>

            <Col className="gutter-row last-treeview" span={14}>
                <div className="container_treeview">
                    <wjNav.TreeView  
                        isReadOnly={false} 
                        itemsSource={dataDepth2} 
                        // dataItem={state.dataDepth2} 
                        displayMemberPath="name" 
                        imageMemberPath="img" 
                        showCheckboxes={false} 
                        allowDragging={allowDragging} 
                        dragEnd={onDragEnd2.bind(this)}     
                        initialized={initialized2.bind(this)} 
                        formatItem={onFormatItem.bind(this)} 
                        itemClicked={onItemClicked2.bind(this)}
                        // selectedItemChanged={selectedItemChanged2}
                    />
                    
                    <div className="add_ipt_wrap">
                        <Input id="theInput2" value={stateData.theInput2} onChange={handleChangeInput('theInput2')} />
                        <Button type="primary" onClick={(e)=>{addNode('2depth', 0)}}>+</Button>
                    </div>
                </div>
            </Col>
        </Row>
        <br />
        <Row gutter={[10, 10]}  justify="center" style={{ marginTop: 20 }}>
            <Col>
                {/* <Button htmlType="button"  onClick={()=>apiRequest(treeData, '1')}>확인</Button> */}
                <Button type="primary" htmlType="button" onClick={()=>handleSubmit()}>확인</Button>
            </Col>
            <Col>
                <Button htmlType="button" onClick={handleReset}>취소</Button>
            </Col>
        </Row>
        


    </Wrapper>
  );
});

export default BankCode;
