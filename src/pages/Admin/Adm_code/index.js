/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect,useState,useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Breadcrumb, Form, Row, Col, Input, Space , Tabs, Card, Button, Collapse, Modal, message} from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import { toJS } from 'mobx';

import useStore from '@stores/useStore';

import * as wjNav from '@grapecity/wijmo.react.nav';
import * as WjcNav from "@grapecity/wijmo.nav";
import * as wjCore from '@grapecity/wijmo';
import { format } from 'morgan';
import e from 'connect-timeout';
import { map } from 'styled-components-breakpoint';
import { resolve } from 'app-root-path';

const { Panel } = Collapse;

const Wrapper = styled.div`
    width: 100%;
    .wj-flexgrid .wj-state-sticky .wj-header {opacity : unset;}
`;


const DEF_STATE = {
    // DB Data
    theInput1: '',
    theInput2: '',
    theInput3: '', 
    theInput4: '', 
    inTxt: '', 
};

const Adm_code = observer(() => {
    const { commonStore } = useStore();
    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 
    const state = useLocalStore(() => ({
        treeControl: [],
        treeControl2: [],
        treeControl3: [],
        treeControl4: [],

        depth4Data: [],
        treeClickVal1: '',  //1depth 클릭데이터
        treeClickVal2: '',  //2depth 클릭데이터
        treeClickVal3: '',  //3depth 클릭데이터
        depth4Code: '',
        inTxt: '',

        upData : [],        //데이터 수정
        ordnumData : [],    //순서변경

        tree1depth : [],    //select 1depth
        tree2depth : [],    //select 2depth
        tree3depth : [],    //select 3depth
        tree4depth : [],    //select 4depth
        errorChk:'',
        addType:'',
        nodes4depth:'',
    }));
    useEffect(() => {
        fetchData();
    }, []);

    //api
    const fetchData = useCallback(async (val) => {    
        var axios = require('axios');

        var config = {
            method: 'GET',
            url:process.env.REACT_APP_API_URL +'/api/v1/codes',
            headers: {
                Accept: 'application/json',
            },
        };

        axios(config)
            .then(function (result) {
                if (result.status !== 200) {
                    Modal.error({
                        title: '오류가 발생했습니다.',
                        content: '오류코드:' + result.data.message,
                    });
                } else {
                    state.tree1depth =result.data.data;
                    
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

    //1depth 상하 수정
    const onDragEnd = (s, e) => {         
        var control = s.nodes;  //s.selectedNode로 할시 순서 오류남 '*nodes : 노드의 자식 노드를 포함하는 배열을 가져옵니다.'

        var arr = [];
        control.map((e, num) => {
            arr = [...arr, e.dataItem.id]
        })

        if(state.ordnumData.length === 0){
            state.ordnumData[0] = arr;
        }else{
            state.ordnumData[0] = arr;
        }
        

    }

     //2depth 상하 수정
     const onDragEnd2 = (s, e) => {         
        var control = s.nodes;  
    
        var arr = [];
        control.map((e, num) => {
            arr = [...arr, e.dataItem.id]
        })
        if(state.ordnumData.length === 0){
            state.ordnumData[0] = [];
            state.ordnumData[1] = arr;
        }else{
            state.ordnumData[1] = arr;
        }
        

    }

    //3depth 상하 수정
    const onDragEnd3 = (s, e) => {         
        var control = s.nodes; 
    
        var arr = [];
        control.map((e, num) => {           
            arr = [...arr, e.dataItem.id]
        })

        if(state.ordnumData.length === 0){
            state.ordnumData[0] = [];
            state.ordnumData[1] = [];
            state.ordnumData[2] = arr;
        }else{
            state.ordnumData[2] = arr;
        }

    }

    //4depth 상하 수정
    const onDragEnd4 = (s, e) => {      
        var control = s.nodes;  
        var arr = [];
        control.map((e, num) => {
            arr = [...arr, e.dataItem.id]
        })
        if(state.ordnumData.length === 0){
            state.ordnumData[0] = [];
            state.ordnumData[1] = [];
            state.ordnumData[2] = [];
            state.ordnumData[3] = arr;
        }else{
            state.ordnumData[3] = arr;
        }

        if(state.errorChk ){
            message.warning('명칭은 빈값일 수 없습니다.');

            for (var i = 0; i < control.length; i++) {
                if(control[i]._e.classList.contains('wj-state-selected')) control[i]._e.classList.remove("wj-state-selected")
                if(control[i]._e.classList.contains('active')) control[i]._e.classList.add("wj-state-selected")
            }
        }        
    }

    const [dataDepth4, setDataDepth4] = useState([]);

    const addNode = (type, depth) => {
        if(state.errorChk ){
            message.warning('명칭은 빈값일 수 없습니다.');
        }else{
            if(stateData.theInput1 != "" || stateData.theInput2 != "" || stateData.theInput3 != "" || stateData.theInput4 != ""){   
                var control = '';                
                var control2 = '';                
                var parentCode = '';

                if(type === '2depth'){
                    var text = '1depth';
                    if(state.treeClickVal1 !== '' && state.treeClickVal1 !== undefined){
                        parentCode = state.treeClickVal1;  
                    }else{
                        parentCode = 0
                    }
                }else if(type === '3depth'){        
                    var text = '2depth';
                    if(state.treeClickVal2 !== '' && state.treeClickVal2 !== undefined){
                        parentCode = state.treeClickVal2;  
                    }else{
                        parentCode = 0
                    }
                    state.tree4depth = [];
                    setDataDepth4([])
                }else if(type === '4depth'){
                    var text = '3depth';
                    if(state.treeClickVal3 !== '' && state.treeClickVal3 !== undefined){
                        parentCode = state.treeClickVal3;  
                    }else{
                        parentCode = 0
                    }
                }            

                if(type === '1depth' || type === '2depth' || type === '3depth'){  
                    var chkType = false;
                    if(type === '1depth'){
                        chkType = true;
                        state.treeClickVal1 = 0;        
                        
                    }else{
                        if(parentCode === 0){                            
                            chkType = false;
                        }else{
                            chkType = true;
                        }

                        var parentChk =true;
                        if(type === '2depth'){                            
                            state.treeClickVal2= 0
                            var name= stateData.theInput2;
                            if(state.treeClickVal1 === 0 || state.treeClickVal1 ===''){
                                parentChk = false;
                            }
                        }else{
                            state.treeClickVal3= 0
                            var name= stateData.theInput3;
                            if(state.treeClickVal2 === 0 || state.treeClickVal2 === 11){
                                parentChk = false;
                            }
                        }                     
                    }

                    if(chkType === true){
                        if(parentChk === false){
                            message.warning(text+'를 선택후 입력해 주세요.');
                            return;
                        }else{
                            if(type === '1depth'){
                                //초기화
                                state.treeClickVal1 = '';
                                state.treeClickVal2 = '';
                                state.treeClickVal3 = '';
                                state.tree2depth = [];
                                state.tree3depth = [];
                                state.tree4depth = [];
                                setDataDepth4([])

                                control = state.treeControl;

                                state.dataDepth2 = []; 
                                var newItem = { id:'', name: stateData.theInput1, parent_code:parentCode, depth: '1', newChk : (control.totalItemCount+1)+parentCode, memo:'',use_yn:'Y'}                                

                                stateData.theInput1 ='';
                                
                                var index = control.nodes ? control.nodes.length : 0;
                                control.selectedNode = control.addChildNode(index, newItem);

                                if(state.upData.length >0 ) {
                                    var chk = false;
                                    for (let i = 0; i< state.upData.length; i++) {
                                        if(state.upData[i].id === newItem.id && state.upData[i].newChk === newItem.newChk){ 
                                            state.upData[i].name = newItem.name
                                            state.upData[i].memo = newItem.memo
                                            state.upData[i].use_yn = newItem.use_yn  
                                            chk = false;
                                            break;                     
                                        }else{
                                            chk = true;
                                        }
                                    }
                                    if(chk == true){ //업뎃 데이터에 추가
                                        state.upData= [...state.upData, newItem];
                                    }      
                                }else{
                                    state.upData = [newItem]
                                }     
                            }else if(type === '2depth'){
                                state.treeClickVal2 = '';
                                state.treeClickVal3 = '';
                                state.tree3depth = [];
                                state.tree4depth = [];
                                setDataDepth4([])

                                control = state.treeControl;
                                control2 = state.treeControl2;

                                var newItem = { id:'', name: name, parent_code:parentCode, depth: '2', newChk : (control.totalItemCount+1)+parentCode, memo:'',use_yn:'Y'},
                                node = control.selectedNode;

                                stateData.theInput2 ='';
                                if(node.dataItem.children2.length > 0){
                                    var index = control2.nodes ? control2.nodes.length : 0;
                                    control2.selectedNode = control2.addChildNode(index, newItem);
                                    control.selectedNode.dataItem.children2 = control2.selectedNode.itemsSource;
                                    // control2.selectedNode.element.classList.add("active");   
                                    // control2.selectedNode.element.classList.add("2depth") ;  


                                }else{
                                    node.dataItem.children2 = [newItem];
                                    state.tree2depth = control.selectedItem.children2
                                }                                
                                    
                                if(state.upData.length >0 ) {
                                    var chk = false;
                                    for (let i = 0; i< state.upData.length; i++) {
                                        if(state.upData[i].id === newItem.id && state.upData[i].newChk === newItem.newChk){ 
                                            state.upData[i].name = newItem.name
                                            state.upData[i].memo = newItem.memo
                                            state.upData[i].use_yn = newItem.use_yn  
                                            chk = false;
                                            break;                     
                                        }else{
                                            chk = true;
                                        }
                                    }
                                    if(chk == true){ //업뎃 데이터에 추가
                                        state.upData= [...state.upData, newItem];
                                    }      
                                }else{
                                    state.upData = [newItem]
                                }    
                             
                            }else{
                                state.treeClickVal3 = '';
                                state.tree4depth = [];
                                setDataDepth4([])

                                control = state.treeControl2;
                                control2 = state.treeControl3;

                                var newItem = { id:'', name: name, parent_code:parentCode, depth: '3', newChk : (control.totalItemCount+1)+parentCode, memo:'',use_yn:'Y'},
                                node = control.selectedNode;

                                stateData.theInput3 ='';
                                if(node.dataItem.children3.length > 0){
                                    var index = control2.nodes ? control2.nodes.length : 0;
                                    control2.selectedNode = control2.addChildNode(index, newItem);
                                    control.selectedNode.dataItem.children3 = control2.selectedNode.itemsSource;
                                    // control2.selectedNode.element.classList.add("active");   
                                    // control2.selectedNode.element.classList.add("2depth") ;  
                                
                                }else{
                                    node.dataItem.children3 = [newItem];
                                    state.tree3depth = control.selectedItem.children3
                                }
                                
                                if(state.upData.length >0 ) {
                                    var chk = false;
                                    for (let i = 0; i< state.upData.length; i++) {
                                        if(state.upData[i].id === newItem.id && state.upData[i].newChk === newItem.newChk){ 
                                            state.upData[i].name = newItem.name
                                            state.upData[i].memo = newItem.memo
                                            state.upData[i].use_yn = newItem.use_yn  
                                            chk = false;
                                            break;                     
                                        }else{
                                            chk = true;
                                        }
                                    }
                                    if(chk == true){ //업뎃 데이터에 추가
                                        state.upData= [...state.upData, newItem];
                                    }      
                                }else{
                                    state.upData = [newItem]
                                }    
                            }                           
                        }  
                    }else{
                        message.warning('새로 추가한 Depth인 경우 등록 후 입력이 가능합니다.');
                        return;
                    }    
                                       
                }else{                  
                    if(state.errorChk){
                        message.warning('명칭은 빈값일 수 없습니다.');
                        return;
                    }else{
                        if(parentCode === ''){
                            message.warning(text+'를 선택후 입력해 주세요.');
                            return;
                        }else{
                            if(parentCode === 0){
                                message.warning('새로 추가한 Depth인 경우 등록 후 입력이 가능합니다.');
                                return;
                            }else{
                                var control4 = state.treeControl4;
                                var control = state.treeControl3;
                                //타입에 따라 control 다름
                                var newItem = { id:'', name: stateData.theInput4, parent_code:parentCode, depth: '4', memo: "",use_yn : 'Y', 
                                ordnum:control.totalItemCount+1,
                                // newChk : (control.totalItemCount+1)+parentCode},  
                                newChk : (state.upData.length +1)+parentCode},  
                                node = control.selectedNode;
                            
                                stateData.theInput4 ='';
                                
     
                                if(node.dataItem.children4.length > 0){
                                    state.addType = 'add';
                                    var index = control4.nodes ? control4.nodes.length : 0;
                                    control4.selectedNode = control4.addChildNode(index, newItem);
                                    control.selectedNode.dataItem.children4 = control4.selectedNode.itemsSource;
                                    control4.selectedNode.element.classList.add("active");   
                                    control4.selectedNode.element.classList.add("4depth-add") ;  

                                    setDataDepth4(control.selectedItem.children4)
                                    // onFormatItem(control4, control.selectedNode, index)
                                    
                                }else{
                                    state.nodes4depth =control4
                                    state.addType = 'first';
                                    node.dataItem.children4 = [newItem];
                                    setDataDepth4(control.selectedItem.children4)
                                    // onFormatItem(control4, control.selectedNode ,'')
                                }
        
                                if(state.upData.length >0 ) {
                                    var chk = false;
                                    for (let i = 0; i< state.upData.length; i++) {
                                        if(state.upData[i].id === newItem.id && state.upData[i].newChk === newItem.newChk){ 
                                            state.upData[i].name = newItem.name
                                            state.upData[i].memo = newItem.memo
                                            state.upData[i].use_yn = newItem.use_yn  
                                            chk = false;
                                            break;                     
                                        }else{
                                            chk = true;
                                        }
                                    }
                                    if(chk == true){ //업뎃 데이터에 추가
                                        state.upData= [...state.upData, newItem];
                                    }      
                                }else{
                                    state.upData= [newItem];
                                }
                            }                    
                        }
                    }

                }                
                
            }else{
                message.warning('내용을 입력해 주세요.');
            }
        }
    } 


    // const toggleAction = (obj)=>{
    //     const elB = document.getElementById(obj);
    //     // 열린 노드 닫기
    //     const el = elB.closest(".wj-control");
    //     const elon = el.getElementsByClassName("active");
    //     for (var i = 0; i < elon.length; i++) {
    //         if(!elon[i].classList.contains('wj-state-selected')) elon[i].classList.remove("active")
    //     }
    //     const elNode = elB.parentNode.parentNode;
    //     if(elNode.classList.contains('active')){
    //         elNode.classList.remove("active")
    //     }else{        
    //         elNode.classList.add("active")
    //     }  
    // }

    const toggleAction = (obj)=>{
        if(state.errorChk){
            //명칭이 빈값인 데이터 토클 활성화
            const elB = document.getElementById(obj);
            const elNode = elB.parentNode.parentNode;
            elNode.classList.add("wj-state-selected")

            message.warning('명칭은 빈값일 수 없습니다.');
        }else{
            const elB = document.getElementById(obj);

            // 열린 노드 닫기
            const el = elB.closest(".wj-control");
            const elon = el.getElementsByClassName("active");

            for (var i = 0; i < elon.length; i++) {
                if(!elon[i].classList.contains('wj-state-selected')) elon[i].classList.remove("active")
            }
            
            //클릭한 노드 열기
            const elNode = elB.parentNode.parentNode;
            elNode.classList.add("active")
        }
    }
    
    const toggleAction4depth = (obj,type)=>{ // 추가할때 펼쳐졌던 토글 닫고 추가한거 펼치기
        const elB4 = document.getElementsByClassName('4depth-add');

        if(elB4.length > 1){
            //열린노드 닫기
            if(elB4[0].classList.contains('wj-state-selected')){
                elB4[0].classList.remove("wj-state-selected")            
            }
            if(elB4[0].classList.contains('active')){
                elB4[0].classList.remove("active")
                elB4[0].classList.remove("4depth-add")        
            }
        }

        if(type === 'drag'){
            toggleAction4depthAdd(obj)
        }else{
            const elB = document.getElementById(obj);
            const elNode = elB.parentNode.parentNode.parentNode;
            console.log(elB)
            console.log(elNode)

            if(elNode.classList.contains('active')){
                elNode.classList.add("4depth-add")
            } 
            state.addType = '';
        }        
    }

    const toggleAction4depthAdd = (obj)=>{  //추가했을때 펼치기 수정하기 
        const elB = document.getElementById(obj);
        const elNode = elB.parentNode.parentNode;

        if(elNode !=='' && elNode !== undefined){            
            if(elNode.classList.contains('wj-node-acc')){
                elNode.classList.add("active")
                elNode.classList.add("wj-state-selected")
                elNode.classList.add("4depth-add")
            }
        }        
        state.addType = '';

    }

    const onFormatItem = (s, e, index) => {  
        if((state.nodes4depth !== '' && state.nodes4depth !== undefined) || (state.treeControl4 !== '' && state.treeControl4 !== undefined)){
            if(state.nodes4depth !== '' && state.nodes4depth !== undefined){
                var node = state.nodes4depth
            }else{
                var node = state.treeControl4
            }

            if(index !== '' && index !== undefined){
                onFormatItemData(node.nodes[index], index)
            }else{
                if(node.nodes.length > 1){
                    node.nodes.forEach((e,num) => {
                        onFormatItemData(e, num)
                    });
                }else{
                    if(node.nodes[0] !== '' && node.nodes[0] !== undefined){
                        onFormatItemData(node.nodes[0], 0)
                    }                   
                }
                
            }
        }
    }

    const onFormatItemData = (data, num) => {  
        // var control = data.nodes[num].dataItem
        // var element=data.nodes[num].element

        var control = data.dataItem
        var element=data.element
    
        var inTxt = control.name; 
        var userYN = control.use_yn;
        element.classList.add('wj-node-acc');

        var btnUseColor = '',
            chkY ='',
            chkN = '';

        if(userYN === 'Y'){
            var chkY = ' checked = "checked"';
            var chkN = '';
            btnUseColor = ''
        }else{
            var chkY ='';
            var chkN = ' checked = "checked"';
            btnUseColor = 'btn_use_color'
        }

        if(control.id === ''){
            var datass = control.newChk;
        }else{
            var datass = control.id;
        }

        var html  = '<div class="acc_wrap" id="acc'+datass+'"><span class="btn_acc '+btnUseColor+'" id="btn'+datass+'">'+ inTxt +'<i class="ant-menu-submenu-arrow btn_modify"></i></span>'+ 
            '<div class="accIn" id="cont'+datass+'"><label>명칭 수정</label>'+
                '<input id="title'+datass+'" type="text" name="name'+datass+'" class="ant-input txtArea disTg disDrag" value="'+ inTxt+'" autoComplete="off" />'+
                '<label>주석</label><textarea id="memo'+datass+'"  class="ant-input" placeholder="해당 코드에 대한 주석입니다."></textarea>'+
                '<div class="code_wrap"><label>코드 사용</label>'+
                    '<div class="radio_wrap">'+
                        '<label class="disTg"><input type="radio" id="useY'+datass+'" name="useYN'+datass+'" value="Y" '+chkY+'>사용</label>'+
                        '<label class="disTg"><input type="radio" id="useN'+datass+'" name="useYN'+datass+'" value="N" '+chkN+'>숨김</label></div>'+
                '</div>'+
            '</div></div>';

        element.innerHTML = html;

        const elCon = document.getElementsByClassName("disTg");
        const elDrag = document.getElementsByClassName("disDrag");

        for (var i = 0; i < elCon.length; i++) {
            elCon[i].addEventListener('click', function(e){e.stopPropagation();}, false);
            
        }
        //드래그 가능하게 하는
        for (var i = 0; i < elDrag.length; i++) {
            elDrag[i].addEventListener('mousedown', function(e){
                setAllowDragging(false);
            }, false);

            elDrag[i].addEventListener('mouseup', function(e){
                setAllowDragging(true);
            }, false);
        }

        if(state.addType ==='first'){
            toggleAction4depthAdd('btn'+datass,'')
        }else if(state.addType ==='add'){
            toggleAction4depth('btn'+datass,'')
        }

        //토글
        element.addEventListener('click', (event) => {
            event.stopPropagation();
            
            if(state.errorChk !== '' && state.errorChk !== undefined){
                message.warning('명칭은 빈값일 수 없습니다.');

                const elB = document.getElementById('btn'+datass)
                const el = elB.closest(".wj-control");

                const ela = el.getElementsByClassName("active");
                const elon = el.getElementsByClassName("wj-state-selected");
                for (var i = 0; i < elon.length; i++) {
                    if(elon[i].classList.contains('wj-state-selected')) elon[i].classList.remove("wj-state-selected")
                }

                for (var i = 0; i < ela.length; i++) {
                    if(ela[i].classList.contains('active')) ela[i].classList.add("wj-state-selected")
                }

            }else{      
                if(event.target.classList.contains('disTg')){
                    return false;
                }
    
                if(event.target.classList.contains('btn_modify')){
                    toggleAction('btn'+datass)
                }              
            }            
        });       

        
        
        //타이틀수정
        const nameChange =  document.getElementById("title"+datass);        
        nameChange.addEventListener("keyup", function(event){
            element.querySelector('span').innerHTML = nameChange.value+'<i class="ant-menu-submenu-arrow btn_modify"></i>';
            control.name = nameChange.value;
            if(inTxt !== nameChange.value && nameChange.value !== '' ){  
                state.errorChk = '';
                dataChange(control);   
            } else{
                state.errorChk = 'btn'+datass;
            }
        }, false);

        //메모
        const memo =  document.getElementById("memo"+datass);      
        memo.addEventListener("keyup", function(event){
            control.memo = memo.value;
            if(memo.value){
                dataChange(control);
            }            
        }, false);
    
        //사용여부
        const useY =  document.getElementById("useY"+datass);
        const useN =  document.getElementById("useN"+datass);
        const elB = document.getElementById("btn"+datass);
        
        useY.addEventListener("click", function(event){
            control.use_yn = useY.value;
            if(userYN != useY.value){
                userYN = useY.value
                elB.classList.remove("btn_use_color")
                dataChange(control);
            }
            
        }, false);
        useN.addEventListener("click", function(event){
            control.use_yn = useN.value;
            if(userYN != useN.value){
                userYN = useN.value
                elB.classList.add("btn_use_color")
                dataChange(control);
            }
        }, false);  

        //textarea 영문,숫자,띄어쓰기 작성이 안되는 부분 수정 
        element.addEventListener('keypress', (event) => {
            event.stopPropagation();
        });
        element.addEventListener('keydown', (event) => {
            event.stopPropagation();
        });
        // end

    }

    //내용수정
    const dataChange=(val)=>{
        console.log(toJS(val))
        var chk = false;
        if(state.upData.length >0 ) { //업뎃데이터가 있을경우
            for (let i = 0; i< state.upData.length; i++) {
                if(state.upData[i].newChk !== ''){
                    if(state.upData[i].id === val.id && state.upData[i].newChk === val.newChk){ 
                        state.upData[i].name = val.name
                        state.upData[i].memo = val.memo
                        state.upData[i].use_yn = val.use_yn  
                        chk = false;
                        break;                     
                    }else{
                        chk = true;
                    }
                }else{
                    if(state.upData[i].id === val.id ){ 
                        state.upData[i].name = val.name
                        state.upData[i].memo = val.memo
                        state.upData[i].use_yn = val.use_yn  
                        chk = false;
                        break;                     
                    }else{
                        chk = true;
                    }
                }                
            }
            if(chk == true){ //업뎃 데이터에 추가
                if(val.newChk !== '' && val.newChk !== undefined){
                    state.upData= [...state.upData, {id : val.id, parent_code : val.parent_code, name : val.name, depth : val.depth, memo : val.memo, newChk:val.newChk, use_yn : val.use_yn}];
                }else{
                    state.upData= [...state.upData, {id : val.id, parent_code : val.parent_code, name : val.name, depth : val.depth, memo : val.memo, use_yn : val.use_yn}];
                }
                
            }
        }else{ //업뎃 데이터가 없을경우
            if(val.newChk !== '' && val.newChk !== undefined){
                state.upData= [{id : val.id, parent_code : val.parent_code, name : val.name, depth : val.depth, memo : val.memo , newChk:val.newChk, use_yn : val.use_yn}];
            }else{
                state.upData= [{id : val.id, parent_code : val.parent_code, name : val.name, depth : val.depth, memo : val.memo, use_yn : val.use_yn}];
            }
            
        }
    }

    const initialized = (control) => {
        state.treeControl= control;
    }

    const initialized2 = ( control) => {
        state.treeControl2 = control;
    }

    const initialized3 = ( control) => {
        state.treeControl3 =control;
    }

    const initialized4 = ( control) => {
        state.treeControl4 =control;
    }

    const onItemClicked1 = (e) => {    
        if(state.errorChk ){ //1depth 명칭 빈값일때 토글 수정              
            toggleAction(state.errorChk,'first-treeview')
        }else{
            if(e.selectedNode.dataItem.code === undefined || e.selectedNode.dataItem.code === ''){
                state.treeClickVal1=0;
                state.tree2depth =[]
            }else{
                state.treeClickVal1=e.selectedNode.dataItem.code;
                state.tree2depth =toJS(e.selectedNode.dataItem.children2)
            } 
                
            //초기화
            state.tree3depth =[];
            state.tree4depth =[];
            setDataDepth4([])
        }
    }

    const onItemClicked2 = (e) => {    
        if(state.errorChk ){ //1depth 명칭 빈값일때 토글 수정              
            toggleAction(state.errorChk,'second-treeview')
        }else{
            if(e.selectedNode.dataItem.code === undefined || e.selectedNode.dataItem.code === ''){
                state.treeClickVal2=0;
                state.tree3depth = []
            }else{
                state.treeClickVal2=e.selectedNode.dataItem.code;
                state.tree3depth =toJS(e.selectedNode.dataItem.children3)
            }        
            
            //초기화
            state.tree4depth =[];
            setDataDepth4([])
        }
    }

    const onItemClicked3 = (e) => {    
        if(state.errorChk ){ //1depth 명칭 빈값일때 토글 수정              
            toggleAction(state.errorChk,'third-treeview')
        }else{
            if(e.selectedNode.dataItem.code === undefined || e.selectedNode.dataItem.code === ''){
                state.treeClickVal3=0;
                state.tree4depth =[];
                setDataDepth4([])
            }else{
                state.treeClickVal3=e.selectedNode.dataItem.code;
                state.tree4depth =toJS(e.selectedNode.dataItem.children4)
                setDataDepth4(e.selectedNode.dataItem.children4)
            }    
        }    
    }

    const handleReset = useCallback(() => {
        return window.ask({
        title: `이 창의 입력 내용이 삭제됩니다.`,
        content: `그래도 계속 하시겠습니까?`,
        async onOk() {
            fetchData();
            state.upData =[];
            state.ordnumData= [];
            state.treeClickVal1= '';
            state.treeClickVal2= '';
            state.treeClickVal3= '';
            state.tree2depth= [];
            state.tree3depth= [];
            state.tree4depth= [];
            setDataDepth4([])
        },
        });
    }, []);


  

    const onNodeEditStarting = (s, e) => {

    }

    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback((type) => (e) => {
        stateData[type] = e.target.value;
    },[],);



    //등록
    const handleSubmit = useCallback(async (e)=> {
        // console.log(toJS(state.upData)); 
        var data = [];

        state.upData.forEach(e => {
            data = [...data,{id:e.id, name:e.name, parent_code : e.parent_code,depth:e.depth, memo:e.memo, use_yn: e.use_yn}]
        });
console.log(toJS(data))
console.log(toJS(state.ordnumData))
// return
        if(state.errorChk !== '' && state.errorChk !== undefined){
            message.warning('명칭은 빈값일 수 없습니다.');
        }else{
            // return
            if(data.length > 0){
                var axios = require('axios');

                var config={
                    method:'POST',
                    url:process.env.REACT_APP_API_URL +'/api/v1/codes',
                    headers:{
                        'Accept':'application/json',
                    },
                        data:data
                    };
                    
                axios(config)
                .then(function(response){
                    if(response.data.id !== '' && response.data.id !== undefined){
                        //odrdnum 뎁스 순서를 알아야함
                        if(state.ordnumData.length > 0){
                            var ids = response.data.id.split(',')
                            for (let i = 0; i < ids.length; i++) {
                                state.ordnumData = [...state.ordnumData, ids[i]]                                
                            }
                            handleput();
                        }else{
                            Modal.success({
                                title:response.data.result,
                                onOk(){                                
                                    state.upData =[];
                                    state.ordnumData= [];
                                    state.treeClickVal1= '';
                                    state.treeClickVal2= '';
                                    state.treeClickVal3= '';
                                    state.tree2depth= [];
                                    state.tree3depth= [];
                                    state.tree4depth= [];
                                    state.addType='';
                                    state.nodes4depth='';
                                    setDataDepth4([])
                                    fetchData();
                                },
                            });
                        }                    
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
                if(state.ordnumData.length > 0){
                    handleput();
                }else{
                    Modal.warning({
                        title : '등록할 내용이 없습니다.',
                    }); 
                }
            }
        }
    }, []);      


    //수정
    const handleput = useCallback(async (e)=> {
        var data = {ids : toJS(state.ordnumData)}

        if(state.errorChk ){
            message.warning('명칭은 빈값일 수 없습니다.');
        }else {
            // return
            if(state.ordnumData.length > 0){
                var axios = require('axios');

                var config={
                    method:'PUT',
                    url:process.env.REACT_APP_API_URL +'/api/v1/codes',
                    headers:{
                        'Accept':'application/json',
                    },
                        data:data
                    };
                    
                axios(config)
                .then(function(response){
                    if(response.data.success != false){
                        Modal.success({
                            title: '정보가 둥록되었습니다.',
                            onOk(){                            
                                state.upData =[];
                                state.ordnumData= [];
                                state.treeClickVal1= '';
                                state.treeClickVal2= '';
                                state.treeClickVal3= '';
                                state.tree2depth= [];
                                state.tree3depth= [];
                                state.tree4depth= [];
                                state.addType='';
                                state.nodes4depth='';
                                setDataDepth4([])
                                fetchData();
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
        }
        
    }, []);      
    
    const [allowDragging, setAllowDragging] = useState(true);

    return (
        <Wrapper>
            <Row gutter={20} className="adm_code_wrap">
            <Col className="gutter-row" span={5}>
                <div className="container_treeview onlylist first-treeview">
                    <wjNav.TreeView isReadOnly={false} 
                        nodeEditStarting={onNodeEditStarting.bind(this)} 
                        itemsSource={state.tree1depth} 
                        displayMemberPath="name" 
                        showCheckboxes={false} allowDragging={true} 
                        dragEnd={onDragEnd.bind(this)} 
                        initialized={initialized.bind(this)}  
                        itemClicked={onItemClicked1.bind(this)} />
                    <div className="add_ipt_wrap">
                        <Input id="theInput1" value={stateData.theInput1} onChange={handleChangeInput('theInput1')} />
                        <Button type="primary" onClick={(e)=>{addNode('1depth', 0)}}>+</Button>
                    </div>
                </div>
            </Col>
            <Col className="gutter-row" span={5}>
                <div className="container_treeview onlylist second-treeview">
                    <wjNav.TreeView 
                        isReadOnly={false} 
                        itemsSource={state.tree2depth} 
                        displayMemberPath="name" 
                        showCheckboxes={false} 
                        allowDragging={true} 
                        dragEnd={onDragEnd2.bind(this)} 
                        initialized={initialized2.bind(this)} 
                        itemClicked={onItemClicked2.bind(this)} />
                    <div className="add_ipt_wrap">
                        <Input id="theInput2" value={stateData.theInput2} onChange={handleChangeInput('theInput2')} />
                        <Button type="primary" onClick={(e)=>{addNode('2depth', 0)}}>+</Button>
                    </div>
                </div>
            </Col>
            <Col className="gutter-row" span={5}>
                <div className="container_treeview onlylist third-treeview">
                    <wjNav.TreeView 
                        itemsSource={state.tree3depth} 
                        displayMemberPath="name" 
                        showCheckboxes={false} 
                        allowDragging={true} 
                        dragEnd={onDragEnd3.bind(this)} 
                        initialized={initialized3.bind(this)} 
                        itemClicked={onItemClicked3.bind(this)} />
                    <div className="add_ipt_wrap">
                        <Input id="theInput3" value={stateData.theInput3} onChange={handleChangeInput('theInput3')} />
                        <Button type="primary" onClick={(e)=>{addNode('3depth', 0)}}>+</Button>
                    </div>
                </div>
            </Col>
            <Col className="gutter-row last-treeview" span={9}>
                <div className="container_treeview">
                    <wjNav.TreeView  
                        isContentHtml={true}
                        // itemsSource={state.tree4depth} 
                        itemsSource={dataDepth4} 
                        // dataItem={state.tree4depth} 
                        displayMemberPath="name" 
                        collapseOnClick={false} 
                        collapseWhenDisabled={true} 
                        showCheckboxes={false} 
                        allowDragging={allowDragging} 
                        dragEnd={onDragEnd4.bind(this)} 
                        formatItem={onFormatItem.bind(this)} 
                        initialized={initialized4.bind(this)} />
                    <div className="add_ipt_wrap">
                        <Input id="theInput4" value={stateData.theInput4} onChange={handleChangeInput('theInput4')} />
                        <Button type="primary" onClick={(e)=>{addNode('4depth', 0)}}>+</Button>
                    </div>
                </div>
            </Col>
            </Row>
            <br />
            <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
            <Col>
                <Button type="primary"  htmlType="button"  onClick={()=>handleSubmit()}>확인</Button>
            </Col>
            <Col>
                <Button htmlType="button" onClick={handleReset}>취소</Button>
            </Col>
            </Row>
        </Wrapper>
    );
});


export default Adm_code;
