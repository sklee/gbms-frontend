/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState } from 'react';
import { Row, Col, Input, Button, message, Modal} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import * as wjNav from '@grapecity/wijmo.react.nav';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';

import Excel from '@components/Common/Excel';



const Wrapper = styled.div`
  width: 100%;
  .wj-flexgrid .wj-state-sticky .wj-header {opacity : unset;}

`;

const DEF_STATE = {
    // DB Data
    theInput: '',
    theInput2: '', 
    theInput3: '', 
    inTxt: '', 
};

const classFicationCode = observer(({tab ,tabChange }) => {
    const { commonStore } = useStore();
    const { confirm } = Modal;

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 

    const state = useLocalStore(() => ({
        data: [],
        upData : [],
        tab: '',

        treeControl: [],
        treeControl2: [],
        treeControl3: [],
        
        dataDepth2: [], //2depth 데이터
        dataDepth3: [], //3depth 데이터
        
        depth2Parent: [], //2depth 부모 데이터 
        depth3Parent: [], //3depth 부모 데이터

        error1depthChk : '',
        error2depthChk : '',
        error3depthChk : '',

        depth3AddChk: false
    }));

    useEffect(() => { 
        state.tab = tab;
        state.upData = [];

        if(tab == 'classificationCode'){
            //초기화
            state.depth3AddChk = false;
            state.dataDepth2 = [];
            state.dataDepth3 = [];
            state.depth2Parent = [];
            state.depth3Parent = [];
            state.upData = [];
            state.error1depthChk= '';
            state.error2depthChk = '';
            state.error3depthChk = '';
            stateData.theInput = '';
            stateData.theInput2 = '';
            stateData.theInput3 = '';
            stateData.inTxt = '';

            viewData();
        }
        
    
    }, [tab]);

    const [allowDragging, setAllowDragging] = useState(true);

    //상세정보
    const viewData = useCallback(async (val) => {    
        if(val){
            var id ='?id='+val
        }else{
            var id ='';
        }
        var axios = require('axios');

        var config = {
            method: 'GET',
            url:process.env.REACT_APP_API_URL +'/api/v1/billing-classification'+id,
            headers: {
                Accept: 'application/json',
            },
        };

        axios(config)
            .then(function (result) {
                if (result.data.success === false) {
                    Modal.error({
                        title: '오류가 발생했습니다.',
                        content: '오류코드:' + result.data.message,
                    });
                } else {
                    if(val){
                        state.dataDepth2 = result.data.data[0].child;
                    }else{
                        state.data = result.data.data;
                    }
                    
                }
            })
            .catch(function (error) {
                console.log(error.response);
                // Modal.error({
                //     title: '오류가 발생했습니다. 재시도해주세요.',
                //     content: '오류코드:' + error.response.status,
                // });
            });
        
    }, []);

    const handleReset = useCallback(() => {
        confirm({
            icon: <ExclamationCircleOutlined />,
            title: '이 창의 입력 내용이 삭제됩니다.',
            content: '그래도 계속 하시겠습니까?',
            onOk() {
                viewData();
                state.dataDepth2 = [];
                state.dataDepth3 = [];
                state.depth2Parent = [];
                state.depth3Parent = [];
                state.upData = [];
                state.error1depthChk= '';
                state.error2depthChk = '';
                state.error3depthChk = '';
                stateData.theInput = '';
                stateData.theInput2 = '';
                stateData.theInput3 = '';
                stateData.inTxt = '';
            },
            onCancel() {
              
            },
        });
        // Modal.warning({
        //     title: '이 창의 입력 내용이 삭제됩니다.',
        //     content: '그래도 계속 하시겠습니까?',
        //     onOk(){
        //         viewData();
        //         state.dataDepth2 = [];
        //         state.dataDepth3 = [];
        //         state.depth2Parent = [];
        //         state.depth3Parent = [];
        //         state.upData = [];
        //         state.error1depthChk= '';
        //         state.error2depthChk = '';
        //         state.error3depthChk = '';
        //         stateData.theInput = '';
        //         stateData.theInput2 = '';
        //         stateData.theInput3 = '';
        //         stateData.inTxt = '';
        //     }
        // });
    }, []);

    const initialized = ( control) => {
        state.treeControl =control;
    }
    const initialized2 = ( control) => {
        state.treeControl2 =control;
    }
    const initialized3 = ( control) => {
        state.treeControl3 =control;
    }
    

    //1depth 클릭시 2depth 데이터 및 1depth 정보 담기
    const onItemClicked = (e) => {   
        if(state.error1depthChk ){ //1depth 명칭 빈값일때 토글 수정              
            toggleAction(state.error1depthChk,'','1depth')
        }else{
            state.dataDepth3 =[];
            // var control = e.selectedItem;  
            var control = e.selectedNode;

            if(control.dataItem.id != 0){ //2depth 데이터
                // viewData(control.dataItem.id)
                state.dataDepth2 = control.dataItem.child;
            } else{
                state.dataDepth2 =[];
            }
            
            state.depth2Parent =[{id: control.dataItem.id, name : control.dataItem.name, ordnum:control.dataItem.ordnum, use_yn: control.dataItem.use_yn}]

            if(control.dataItem.id == '0'){
                toggleAction('btn'+String(control.dataItem.id)+String(control.dataItem.ordnum),'')
            }else{
                toggleAction('btn'+control.dataItem.id,'')
            }           
        }
    }

    //2depth 클릭시 3depth 데이터 및 2depth 정보 담기
    const onItemClicked2 = (e) => {   

        if(state.error2depthChk ){ //1depth 명칭 빈값일때 토글 수정              
            toggleAction(state.error2depthChk,state.error1depthChk,'2depth')
        }else{
            var control = e.selectedNode;
            state.dataDepth3=control.dataItem.children;
            state.depth3Parent =[{id: control.dataItem.id, class1_id: control.dataItem.class1_id, name : control.dataItem.name, ordnum:control.dataItem.ordnum, use_yn: control.dataItem.use_yn}]

            if(control.dataItem.id == '0'){
                toggleAction('btn'+String(control.dataItem.class1_id)+'_'+control.dataItem.id+'_'+String(control.dataItem.ordnum),'class1_id')
            }else{
                toggleAction('btn'+String(control.dataItem.class1_id)+'_'+String(control.dataItem.id),'class1_id')
            }           
        }
    }

    //3depth 클릭시
    const onItemClicked3 = (e) => {   
        if(state.error3depthChk ){ //2depth 명칭 빈값일때 토글 수정            
            toggleAction(state.error3depthChk,state.error2depthChk,'3depth')
        }else{
            var control = e.selectedItem;  
            if(control.id == '0'){
                var text = 'btn'+String(state.depth3Parent[0].id)+'_'+String(control.class2_id)+'_'+String(control.id)+'_'+String(control.ordnum);
                toggleAction(text,'class2_id')
            }else{
                toggleAction('btn'+String(state.depth3Parent[0].id)+'_'+String(control.class2_id)+'_'+String(control.id),'class2_id')
            }          
            
        }       
    }
    
    //1depth 상하 수정
    const onDragEnd = (s, e) => { 
        var control = s.nodes;  //s.selectedNode로 할시 순서 오류남 '*nodes : 노드의 자식 노드를 포함하는 배열을 가져옵니다.'
        state.depth2Parent= [s.selectedItem];        

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
        state.dataDepth2 = control.child;
        state.dataDepth3 = [];
        
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

    //2depth 상하수정
    const onDragEnd2 = (s, e) => {         
        if(state.error1depthChk){                    
            toggleAction(state.error1depthChk,'','2depth')
        }else{
            var control = s.nodes;  //s.selectedNode로 할시 순서 오류남 '*nodes : 노드의 자식 노드를 포함하는 배열을 가져옵니다.'
            var arr = [];
            control.map((e, num) => {
                var chkNum = num+1
                if(e.dataItem.ordnum != chkNum){                
                    e.dataItem.ordnum = chkNum;
                    arr = [...arr, {id: e.dataItem.id, name: e.dataItem.name, ordnum : chkNum,class1_id: e.dataItem.class1_id,use_yn: e.dataItem.use_yn}]
                }
            })
            if(state.upData.length > 0){
                arr.map((e, num)=>{
                    chkArr('2depth',arr[num])
                })
                
            }else{
                state.upData= [{...state.depth2Parent[0], child: arr}];
            }

            //2depth 데이터 셋팅
            var control = s.selectedItem;  
            state.dataDepth3=control.children;
            
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
            const elB = document.getElementById('btn'+String(s.selectedItem.class1_id)+'_'+String(s.selectedItem.id));
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
                    if( eldepth2[i].classList.contains('1depth') ||  eldepth2[i].classList.contains('2depth') ||  eldepth2[i].classList.contains('3depth')){
                        eldepth[i].classList.remove("wj-state-selected")
                    }
                }
            } 
        }      
    }

    //3depth 상하수정
    const onDragEnd3 = (s, e) => { 
        var control = s.nodes; 
        var arr = [];
        control.map((e, num) => {
            var chkNum = num+1
            if(e.dataItem.ordnum != chkNum){
                e.dataItem.ordnum = chkNum;
                arr = [...arr, {id: e.dataItem.id, class2_id: e.dataItem.class2_id, name: e.dataItem.name, ordnum : chkNum , memo: e.dataItem.memo, use_yn: e.dataItem.use_yn
                                , billing_use_yn : e.dataItem.billing_use_yn, product_use_yn : e.dataItem.product_use_yn, department_use_yn : e.dataItem.department_use_yn, 
                                unitprice_use_yn : e.dataItem.unitprice_use_yn, account_code1 : e.dataItem.account_code1, account_code2 : e.dataItem.account_code2}]
            }     
        })

        if(state.upData.length > 0){         
            arr.map((e,num) =>{
                chkArr('3depth',arr[num])
            })          
        }else{
            state.upData= [{...state.depth2Parent[0], child: [{...state.depth3Parent[0], children: arr}] }];
        }

        if(state.error1depthChk || state.error2depthChk || state.error3depthChk){
            message.warning('명칭은 빈값일 수 없습니다.');
        }else{           
            //토글
            const eldepth = document.getElementsByClassName('active');      
            for (var i = 0; i < eldepth.length; i++) {
                if(eldepth[i].classList.contains('1depth')){
                }else if(eldepth[i].classList.contains('2depth')){
                }else{
                    if(eldepth[i].classList.contains('wj-state-selected')){                        
                        eldepth[i].classList.remove("wj-state-selected")
                    }
                    if(eldepth[i].classList.contains('3depth')){
                        eldepth[i].classList.remove("3depth")
                    }
                    if(eldepth[i].classList.contains('active')){
                        eldepth[i].classList.remove("active")
                    }
                }
                
            }
            
            //클릭된 내용만 add
            const elB = document.getElementById('btn'+String(state.depth3Parent.id)+'_'+String(s.selectedItem.class2_id)+'_'+String(s.selectedItem.id));
            if(elB !== undefined && elB !== null && elB !== ''){
                const elNode = elB.parentNode.parentNode;
                if(elNode.classList.contains('active')){ //있으면 active 삭제
                }else{ //없으면 추가
                    elNode.classList.add("3depth")
                    elNode.classList.add("wj-state-selected")
                }
            }

            const eldepth2 = document.getElementsByClassName('wj-state-selected');  
            if(eldepth2.classList != undefined){
                for (var i = 0; i < eldepth2.length; i++) {
                    if( eldepth2[i].classList.contains('1depth') ||  eldepth2[i].classList.contains('2depth') ||  eldepth2[i].classList.contains('3depth')){
                        eldepth[i].classList.remove("wj-state-selected")
                    }
                }
            }
            
        }
    }

    //상하 데이터 수정
    const chkArr = (type,val)=>{
        var chk = false;
        var parentChk = false;
        var parent2Chk = false;

        if(type == '1depth'){            
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
        }else if(type == '2depth'){            
            var parentChk = false;
            for (let i = 0; i< state.upData.length; i++) { //1depth에 데이터가 있을시
                if(state.upData[i].id === val.class1_id){    //1depth 데이터 중 2depth부모가 있을경우
                    let detailChk = state.upData[i].child;
    
                    if(detailChk != '' && detailChk != undefined && detailChk != null){ //2depth부모의 detail이 있을 경우
                        for( let e=0; e < state.upData[i].child.length; e++){
                            if(state.upData[i].child[e].name == val.name){
                                state.upData[i].child[e].ordnum = val.ordnum
                                chk = false;
                                break;
                            }else{
                                chk = true;
                            }                 
                        }  
                        if(chk == true){               
                            state.upData[i].child= [...state.upData[i].child, val];
                        }
                        parentChk = false;
                        break;
                    }else{ //2depth부모의 detail이 없을 경우 추가
                        state.upData[i].child= [val];
                        parentChk = false;
                        break;
                    }
                }else{
                    parentChk = true;
                }
            }

            if(parentChk == true){               
                state.upData= [...state.upData,{...state.dataDepth2[0], child: [val]}];
            }  
        }else{ //3depth
            var parentChk = false;
            for (let i = 0; i< state.upData.length; i++) { //1depth에 데이터가 있을시

                if(state.upData[i].id === state.depth2Parent[0].id){    //1depth 데이터 중 2depth부모 찾기
                    var chk_child = state.upData[i].child;

                    if(chk_child !== '' && chk_child != undefined){

                        for( let e=0; e < state.upData[i].child.length; e++){  // 2depth 데이터가 있을시

                            if(state.upData[i].child[e].id == val.class2_id){  // 2depth 데이터 중 3depth 부모찾기
                                var chk_children = state.upData[i].child[e].children;
                                if(chk_children != '' && chk_children != undefined){
                                    for( let l=0; l < state.upData[i].child[e].children.length; l++){ //3depth 데이터가 있을시

                                        if(state.upData[i].child[e].children[l].name == val.name){ //3depth에 수정하는 데이터가 존재할시
                                            state.upData[i].child[e].children[l].ordnum = val.ordnum
                                            chk = false;
                                            break;
                                        }else{
                                            chk = true;
                                        }                                
                                    }
                                    if(chk == true){      
                                        state.upData[i].child[e].children= [...state.upData[i].child[e].children, val ];
                                        parent2Chk = false;
                                        break;
                                    }
                                   
                                }else{
                                    state.upData[i].child[e].children= [...state.upData[i].child[e].children, val ];
                                    break;
                                }
                            }else{
                                parent2Chk = true;
                            }                 
                        }   
                        if(parent2Chk == true){               
                            state.upData[i].child= [...state.upData[i].child, { ...state.depth3Parent[0],children: [val]} ];
                            parentChk = false;
                            break;
                        }
                        
                    }else{
                        state.upData[i].child= [...state.upData[i].child, { ...state.depth3Parent[0],children: [val]} ];
                        break;
                    }
                }else{
                    parentChk = true;
                }
            }

            if(parentChk == true){               
                state.upData= [...state.upData,[{...state.depth2Parent[0], child: [{ ...state.depth3Parent[0],children: [val]}] }]];
            }            
        }        
    }

    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback((type) => (e) => {
        stateData[type] = e.target.value;
    },[],);

    //추가
    const addNode = (type, depth) => {
        if(state.error1depthChk || state.error2depthChk || state.error3depthChk){
            message.warning('명칭은 빈값일 수 없습니다.');
        }else{
            if(stateData.theInput != "" || stateData.theInput2 != "" || stateData.theInput3 != ""){              
                if(type == '3depth'){
                    if(state.error2depthChk){
                        message.warning('명칭은 빈값일 수 없습니다.');
                        return;
                    }else{
                        if(state.depth3Parent[0] === '' || state.depth3Parent[0] === undefined ){
                            message.warning('2Depth를 선택후 입력해 주세요.');
                            return;
                        }else{
                            if(state.depth3Parent[0].id  === 0||state.depth3Parent[0].id  === '0'){
                                message.warning('새로 추가한 2Depth인 경우 등록 후 3Depth 입력이 가능합니다.');
                                return;
                            }else{
                                // var control = state.treeControl3;
                                var control = state.treeControl2;
                                var control2 = state.treeControl3;

                                var newItem = { id:0, name: stateData.theInput3, ordnum : control2.totalItemCount+1, 'class2_id' :state.depth3Parent[0].id ,  memo:'',use_yn : 'Y'}     
                                stateData.theInput3 ='';

                                var node = control.selectedNode;

                                // if(node){
                                //     var index = node.nodes ? node.nodes.length : 0;
                                //     control.selectedNode = node.addChildNode(index, newItem);
                                // }else{
                                //     var index = control.nodes ? control.nodes.length : 0;
                                //     control.selectedNode = control.addChildNode(index, newItem);
                                // }
                                if(node.dataItem.children.length > 0){
                                    var index = control2.nodes ? control2.nodes.length : 0;
                                    control2.selectedNode = control2.addChildNode(index, newItem);
                                 
                                    onFormatItem('', control2.selectedNode)
                                }else{
                                    node.dataItem.children = [newItem];
                                    state.dataDepth3= control.selectedItem.children;
                                    onFormatItem(control2, control.selectedNode)
                                }

                                state.depth3AddChk = true

                                if(state.upData.length >0 ) {
                                    var chk = false;
                                    var childAddChk = false;
                                    for (let i = 0; i< state.upData.length; i++) {
                                        if(state.upData[i].id === state.depth3Parent[0].class1_id){ //2depth의 부모 1depth가 있으면
                                            let childChk = state.upData[i].child;

                                            if(state.upData[i].child !='' && childChk != undefined && childChk != null){ //1depth child가 있을 경우
                                                for (let e = 0; e< state.upData[i].child.length; e++) {
                                                    if(state.upData[i].child[e].id === newItem.class2_id){
                                                        state.upData[i].child[e].children= [...state.upData[i].child[e].children,newItem];
                                                        childAddChk = false;
                                                        break;
                                                    }else{
                                                        childAddChk = true;
                                                    }
                                                }
                                                
                                                if(childAddChk == true){ //1depth child가 있지만 3뎁스의 부모가 아닌경우
                                                    state.upData[i].child= [...state.upData[i].child,{...state.depth3Parent[0], children : [newItem]}];
                                                }   
                                               
                                            }else{ //1depth가 있지만 child가 없을 경우 추가
                                                state.upData[i]= {...state.upData[i], child: [{...state.depth3Parent[0], children : [newItem] }] };
                                                chk = chk & false;
                                                break;
                                            }
                                        }else{
                                            chk = chk & true;
                                        }
                                    }

                                    if(chk == true){ // 1depth는 있으나 2depth의 부모가 없을 경우
                                        state.upData= [...state.upData,{...state.depth2Parent[0], child: [{...state.depth3Parent[0], children : [newItem] }] }];
                                    }
                                }else{
                                    state.upData= [{...state.depth2Parent[0], child: [{...state.depth3Parent[0], children : [newItem] }] }];
                                }

                                var btn = String(state.depth3Parent[0].id)+'_'+String(newItem.class2_id)+'_'+String(newItem.id)+'_'+String(newItem.ordnum);
                                toggleAction('btn'+btn,'class2_id'); 
                            }
                        }
                    }
                }else if(type == '2depth'){    
                    if(state.error1depthChk){
                        message.warning('명칭은 빈값일 수 없습니다.');
                        return;
                    }else{      
                        if(state.depth2Parent[0] === '' || state.depth2Parent[0] === undefined ){
                            message.warning('1Depth를 선택후 입력해 주세요.');
                            return;
                        }else{
                            if(state.depth2Parent[0].id  === 0||state.depth2Parent[0].id  === '0'){
                                message.warning('새로 추가한 1Depth인 경우 등록 후 2Depth 입력이 가능합니다.');
                                return;
                            }else{
                                state.dataDepth3 = [];   
                                var control = state.treeControl;
                                var control2 = state.treeControl2;

                                var newItem = { id: 0,  name: stateData.theInput2, ordnum : control2.totalItemCount+1, class1_id :state.depth2Parent[0].id ,use_yn: 'Y' } ,
                                node = control.selectedNode; 
                                stateData.theInput2 ='';
                                state.depth3Parent = [{id:0}];                               

                                if(node.dataItem.child.length > 0){
                                    var index = control2.nodes ? control2.nodes.length : 0;
                                    control2.selectedNode = control2.addChildNode(index, newItem);
                                    control2.selectedNode.element.classList.add("active");   
                                    control2.selectedNode.element.classList.add("2depth") ;  
                                
                                    onFormatItem('', control2.selectedNode)
                                }else{                                  
                                    node.dataItem.child = [newItem];
                                    state.dataDepth2= control.selectedItem.child;
                                    onFormatItem(control2, control.selectedNode)
                                }
        
                                if(state.upData.length >0 ) {
                                    var chk = false;
                                    for (let i = 0; i< state.upData.length; i++) {
                                        if(state.upData[i].id === state.depth2Parent[0].id){ //2depth의 부모 1depth가 있으면
                                            let detailChk = state.upData[i].child;

                                            if(state.upData[i].child != '' && detailChk != undefined && detailChk != null){ //1depth child가 있을 경우
                                                state.upData[i].child= [...state.upData[i].child, newItem];
                                                chk = false;
                                                break;
                                            }else{ //1depth가 있지만 child가 없을 경우 추가
                                                state.upData[i]= {...state.upData[i], child:[newItem]};
                                                chk = false;
                                                break;
                                            }
                                        }else{
                                            chk = true;
                                        }
                                    }

                                    if(chk == true){ // 1depth는 있으나 2depth의 부모가 없을 경우
                                        state.upData= [...state.upData,{...state.depth2Parent[0], child: [newItem]}];
                                    }
                                }else{
                                    state.upData= [{...state.depth2Parent[0], child: [newItem]}];
                                }
                            }
                        }    
                        var btn = String(state.depth2Parent[0].id)+'_'+String(newItem.id)+'_'+String(newItem.ordnum);
                        toggleAction('btn'+btn,'class1_id'); 
                    }        
                }else{
                    var control = state.treeControl;
                    state.dataDepth2 = [];     
                    state.dataDepth3 = [];   
                    var newItem = { id:0, name: stateData.theInput, ordnum : control.totalItemCount+1 ,use_yn: 'Y'}

                    stateData.theInput ='';
                    state.depth2Parent = [{id:0}];    

                    var index = control.nodes ? control.nodes.length : 0;
                    control.selectedNode = control.addChildNode(index, newItem);

                    onFormatItem('', control.selectedNode)

                    if(state.upData.length >0 ) {
                        state.upData = [...state.upData, newItem]
                    }else{
                        state.upData = [newItem]
                    }   

                    var btn = String(newItem.id)+String(newItem.ordnum);
                    toggleAction('btn'+btn,'');  
                }       
            }else{
                message.warning('내용을 입력해 주세요.');
            }
        }
    } 

    //format
    const onFormatItem = (s, e) => {

        //2depth, 3depth 인지 확인용
        var parent = e.element.parentNode.parentNode.parentNode.parentNode; 
        
        var control = e;
        // var inTxt = e.element.innerText; 
        var inTxt = e.dataItem.name; 
        var memoHtml = '';
        var useHtml = '';
        
        e.element.classList.add('wj-node-acc');      
    
        
        if(e.dataItem.class2_id !== null && e.dataItem.class2_id !== undefined && e.dataItem.class2_id !== ''){ //3depth
            if(e.dataItem.id == 0 || e.dataItem.id == '0'){
                var datass = String(state.depth3Parent[0].id)+'_'+String(e.dataItem.class2_id)+'_'+String(e.dataItem.id)+'_'+String(e.dataItem.ordnum);
            }else{
                var datass = String(state.depth3Parent[0].id)+'_'+String(e.dataItem.class2_id)+'_'+String(e.dataItem.id);
            }

            if(e.dataItem.memo == undefined || e.dataItem.memo == null){
                var inMemo = '';
            }else{
                var inMemo = e.dataItem.memo;
            }

            var userYN = e.dataItem.use_yn;
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
            
            var memoHtml = '<label>주석</label><input id="memo'+datass+'" type="text" name="memo'+datass+'" class="ant-input disTg" value="'+inMemo+'" placeholder="해당 코드에 대한 주석입니다." />'
            var useHtml =   '<div class="code_wrap"><label>코드 사용</label><div class="radio_wrap">'+
            '<label class="disTg"><input type="radio" id="useY'+datass+'" name="useYN'+datass+'" value="Y" '+chkY+'>사용</label>'+
            '<label class="disTg"><input type="radio" id="useN'+datass+'" name="useYN'+datass+'" value="N" '+chkN+'>숨김</label></div></div>';

        }else if(e.dataItem.class1_id !== null && e.dataItem.class1_id !== undefined && e.dataItem.class1_id !== ''){  //2depth
            if(e.dataItem.id == 0 || e.dataItem.id == '0'){
                var datass = String(e.dataItem.class1_id)+'_'+String(e.dataItem.id)+'_'+String(e.dataItem.ordnum);
            }else{
                var datass = String(e.dataItem.class1_id)+'_'+String(e.dataItem.id);
            }
            btnUseColor = '';

        }else{ //1depth
            btnUseColor = '';
            if(e.dataItem.id == 0){
                var datass = String(e.dataItem.id)+String(e.dataItem.ordnum);
            }else{
                var datass = e.dataItem.id;
            }            
        }

        var html  = '<div class="acc_wrap" id="acc'+datass+'"><span class="btn_acc '+btnUseColor+'" id="btn'+datass+'">'+ inTxt +'<i class="ant-menu-submenu-arrow"></i></span>'+ 
            '<div class="accIn" id="cont'+datass+'"><label>명칭 수정</label>'+
            '<input id="title'+datass+'" type="text" name="name'+datass+'" class="ant-input disTg disDrag" value="'+ inTxt+'" autoComplete="off" />'+
            memoHtml+
            useHtml+'</div></div>';

        e.element.innerHTML = html;

        const elCon = document.getElementsByClassName("disTg");
        const elBtn = document.getElementById("acc"+datass);
        const elDrag = document.getElementsByClassName("disDrag");
        // elBtn.addEventListener("click", function(e){toggleAction("btn"+datass);}, false);
        for (var i = 0; i < elCon.length; i++) {
            elCon[i].addEventListener('click', function(e){e.stopPropagation();}, false);
        }
       
        // const elCon = document.getElementById("cont"+datass);
        // const elBtn = document.getElementById("btn"+datass);
        // elBtn.addEventListener("click", function(e){toggleAction("btn"+datass);}, false);
        // elCon.addEventListener("click", function(e){e.stopPropagation();}, false);   
        
        for (var i = 0; i < elDrag.length; i++) {
            elDrag[i].addEventListener('mousedown', function(e){
                setAllowDragging(false);
            }, false);

            elDrag[i].addEventListener('mouseup', function(e){
                setAllowDragging(true);
            }, false);
        }

        //타이틀수정
        if(parent.classList[3] == 'last-treeview' && parent.classList[3] != undefined ){   //3depth
            const nameChange2 =  document.getElementById("title"+datass);
            nameChange2.addEventListener("keyup", function(event){
                control.element.querySelector('span').innerHTML = nameChange2.value+'<i class="ant-menu-submenu-arrow"></i>';
                control.dataItem.name = nameChange2.value;
                if(inTxt !== nameChange2.value || nameChange2.value !== ''){    
                    state.error3depthChk = '';    
                    state.error2depthChk = '';
                    state.error1depthChk = ''; 
                    dataChange(e.dataItem);
                } else{
                    state.error3depthChk = 'btn'+datass;    
                    state.error2depthChk = 'btn'+e.dataItem.class1_id;    
                    state.error1depthChk = 'btn'+e.dataItem.id;    
                    const elNode = elBtn.parentNode;               
                    elNode.classList.add("wj-state-selected")
     
                }
            }, false);

        }else if( parent.classList[3] == 'middle-treeview' && parent.classList[3] != undefined ){ //2depth
            const nameChange =  document.getElementById("title"+datass);        
            nameChange.addEventListener("keyup", function(event){
                control.element.querySelector('span').innerHTML = nameChange.value+'<i class="ant-menu-submenu-arrow"></i>';
                control.dataItem.name = nameChange.value;
                if(inTxt !== nameChange.value || nameChange.value !== '' ){ 
                    state.error2depthChk =''; 
                    state.error1depthChk = '';
                    dataChange(e.dataItem);   
                } else{
                    state.error1depthChk = 'btn'+e.dataItem.class1_id;  
                    state.error2depthChk = 'btn'+e.dataItem.class1_id;  
                }

            }, false);
        }else{ //1depth
            const nameChange =  document.getElementById("title"+datass);        
            nameChange.addEventListener("keyup", function(event){
                control.element.querySelector('span').innerHTML = nameChange.value+'<i class="ant-menu-submenu-arrow"></i>';
                control.dataItem.name = nameChange.value;
                // if(inTxt !== nameChange.value && nameChange.value !== '' ){  
                //     if(state.error2depthChk =='' || state.error2depthChk == undefined || state.error3depthChk =='' || state.error3depthChk == undefined){
                //         state.error1depthChk = '';
                //     }       
                //     dataChange(e.dataItem);   
                // } else{
                //     state.error1depthChk = 'btn'+datass;
                // }

                if(inTxt !== nameChange.value || nameChange.value !== ''){    
                    state.error1depthChk = '';
                    dataChange(e.dataItem);
                } else{
                    state.error1depthChk = 'btn'+datass;
                    const elNode = elBtn.parentNode;               
                    elNode.classList.add("wj-state-selected")
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
        
        if(useHtml){
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
        }
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

        //3depth
        if(val.class2_id !== null && val.class2_id !== undefined && val.class2_id !== ''){
            var chk = false;
            var childChk = false;
            var childrenChk = false;
            if(state.upData.length >0 ) { //upData가 있을경우
                var length = 0;
                var length2 = 0;
                for (let i = 0; i< state.upData.length; i++) {
                    if(state.upData[i].id === state.depth2Parent[0].id){ //upData에 1depth 데이터가 있을경우 
                        let child_addChk = state.upData[i].child;
                        if(child_addChk!='' && child_addChk != undefined && child_addChk != null){ //child 값이 있을 경우 업뎃
                            for( let e=0; e < state.upData[i].child.length; e++){ //child 값이 있을 경우 업뎃
                                
                                if(state.upData[i].child[e].id == val.class2_id){
                                    let children_chk = state.upData[i].child[e].children;
                                    if(children_chk!='' && children_chk != undefined && children_chk != null){
                                        for(let j=0; j < state.upData[i].child[e].children.length; j++){
                                            if(state.upData[i].child[e].children[j].ordnum == val.ordnum){
                                                state.upData[i].child[e].children[j].name = val.name
                                                state.upData[i].child[e].children[j].memo = val.memo
                                                state.upData[i].child[e].children[j].use_yn = val.use_yn
                                                childrenChk = false;
                                                break;
                                            }else{
                                                childrenChk = true;
                                            } 
                                        }
                                        length2 = e;                      

                                        if(childrenChk == true){ //업뎃 데이터에 부모값만 있을경우 child 추가
                                            state.upData[length].child[length2]= [...state.upData[length].child[length2], val];
                                        }
                                        break;
                                    }else{
                                        state.upData[i].child[e].children= [val];
                                    }
                                }else{
                                    childChk = true;
                                }                                
                                                
                            }   
                            length = i;                      

                            if(childChk == true){ //업뎃 데이터에 부모값만 있을경우 child 추가
                                state.upData[length].child= [...state.upData[length].child, val];
                            }
                            break;
                        }else{ //child 값이 없을 경우
                            state.upData[i].child= {...state.depth3Parent[0], children: [val]};
                        }
                    }else{
                        chk = true;
                    }
                }
                if(chk == true){ //upData가 있지만 1depth 데이터가 없을경우
                    // state.upData= [...state.upData, {...state.depth2Parent[0], child: {...state.depth3Parent, children: [val]}}];
                    state.upData= [...state.upData, {...state.depth2Parent[0], child: [{...state.depth3Parent, children: [val]}]}];
                }
            }else{ //upData가 없을경우
                state.upData= [{...state.depth2Parent[0], child: [{...state.depth3Parent[0], children: [val]}]}];
                // state.upData= [{...state.depth2Parent[0], child: {...state.depth3Parent[0], children: [val]}}];
            }

        }else if(val.class1_id !== null && val.class1_id !== undefined && val.class1_id !== ''){ //2depth
            var chk = false;
            if(state.upData.length >0 ) { //업뎃데이터가 있을경우
                var length = 0;
                for (let i = 0; i< state.upData.length; i++) {

                    if(state.upData[i].id === val.class1_id){ //업뎃 부모 데이터가 있을경우 업뎃
                        var chk_child =state.upData[i].child;
                        if(chk_child != '' && chk_child != undefined){

                            for( let e=0; e < state.upData[i].child.length; e++){ //child 값이 있을 경우 업뎃
                                if(state.upData[i].child[e].ordnum == val.ordnum){
                                    state.upData[i].child[e].name = val.name
                                    state.upData[i].child[e].memo = val.memo
                                    state.upData[i].child[e].use_yn = val.use_yn
                                    chk = false;
                                    break;
                                }else{
                                    chk = true;
                                }                 
                            }   
                            length = i;                      

                            if(chk == true){ //업뎃 데이터에 부모값만 있을경우 child 추가
                                state.upData[length].child= [...state.upData[length].child, val];
                                break;
                            }                            
                        }else{
                            state.upData[length].child= [...state.upData[length].child, val];
                        }
                    }else{
                        chk = true;
                    }
                }
                if(chk == true){ //업뎃 데이터에 추가
                    state.upData= [...state.upData, {...state.depth2Parent[0], child: [val]}];
                }
            }else{ //업뎃 데이터가 없을경우
                state.upData= [{...state.depth2Parent[0], child: [val]}];
            }
        }else{ //1depth
            let data = {id: val.id, name : val.name, ordnum: val.ordnum, use_yn : val.use_yn}
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
        console.log(toJS(state.upData))
    }

    const toggleAction = (obj,bankTypeId, type)=>{    
        if(type){
            if(type === '1depth'){       
                const eldepth = document.getElementsByClassName('wj-node-acc');      
                if(eldepth !== undefined && eldepth !== null && eldepth != ''){
                    for (var i = 0; i < eldepth.length; i++) {     
                        if(eldepth[i].classList.contains('1depth') || eldepth[i].classList.contains('3depth')){
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

                if(state.error3depthChk){
                    if(eldepth !== undefined && eldepth !== null && eldepth != ''){
                        for (var i = 0; i < eldepth.length; i++) {     
                            if(eldepth[i].classList.contains('3depth')){
                                eldepth[i].classList.add("wj-state-selected")
                            } else{
                                if(eldepth[i].classList.contains('2depth')){
                                    eldepth[i].classList.add("wj-state-selected")
                                }else{
                                    if(eldepth[i].classList.contains('1depth')){
                                        eldepth[i].classList.add("wj-state-selected")
                                    }else{
                                        eldepth[i].classList.remove("wj-state-selected")  
                                    }
                                }
                               
                            }
                        }
                    }
                }

                message.warning('명칭은 빈값일 수 없습니다.');
            }else if(type === '2depth'){
                const eldepth = document.getElementsByClassName('wj-node-acc');      
                if(eldepth !== undefined && eldepth !== null && eldepth != ''){
                    for (var i = 0; i < eldepth.length; i++) {     
                        if(eldepth[i].classList.contains('2depth') || eldepth[i].classList.contains('1depth') || eldepth[i].classList.contains('3depth')){
                            eldepth[i].classList.add("wj-state-selected")
                        } else{
                            eldepth[i].classList.remove("wj-state-selected")                                                      
                        } 
                    }
                }

                if(state.error3depthChk){
                    if(eldepth !== undefined && eldepth !== null && eldepth != ''){
                        for (var i = 0; i < eldepth.length; i++) {     
                            if(eldepth[i].classList.contains('3depth')){
                                eldepth[i].classList.add("wj-state-selected")
                            } else{
                                if(eldepth[i].classList.contains('2depth') || eldepth[i].classList.contains('1depth')){
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
                        if(eldepth[i].classList.contains('3depth') || eldepth[i].classList.contains('1depth')){
                            eldepth[i].classList.add("wj-state-selected")
                        } else{
                            if(eldepth[i].classList.contains('2depth') == false){
                                eldepth[i].classList.remove("wj-state-selected")
                            }
                        } 
                    }
                }
                message.warning('명칭은 빈값일 수 없습니다.');
            }
        }else{       
            if(state.error1depthChk || state.error2depthChk || state.error3depthChk){                
                message.warning('명칭은 빈값일 수 없습니다.');
            }else{
                //3depth
                if(bankTypeId == 'class2_id' && bankTypeId  !== null && bankTypeId  !== undefined){
                    //클릭된 내용만 add
                    const elB = document.getElementById(obj);
                    if(elB !== undefined && elB !== null && elB !== ''){
                        const elNode = elB.parentNode.parentNode;
                        if(elNode.classList.contains('active')){ //있으면 active 삭제
                            elNode.classList.remove("active")
                        }else{ //없으면 추가
                            elNode.classList.add("3depth")
                            elNode.classList.add("wj-state-selected")
                            elNode.classList.add("active")                    
                        }
                    }

                    const eldepth = document.getElementsByClassName('wj-node-acc');      
                    for (var i = 0; i < eldepth.length; i++) {                
                        if(eldepth[i].classList.contains('3depth') && eldepth[i].classList.contains('active') && eldepth[i].classList.contains('wj-state-selected') == false){
                            eldepth[i].classList.remove("active")
                            eldepth[i].classList.remove("3depth")                    
                        }
                    }   
                    
                }else if(bankTypeId == 'class1_id' && bankTypeId !== null && bankTypeId !== undefined){ //2depth
                    //클릭된 내용만 add
                    const elB = document.getElementById(obj);
                    const eldepth2 = document.getElementsByClassName('wj-node-acc');      
                    for (var i = 0; i < eldepth2.length; i++) {                
                        if(eldepth2[i].classList.contains('2depth') && eldepth2[i].classList.contains('active') && eldepth2[i].classList.contains('wj-state-selected') == true){
                            eldepth2[i].classList.remove("active")
                            eldepth2[i].classList.remove("2depth")         
                            eldepth2[i].classList.remove("wj-state-selected")         
                        }
                    }

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


    const tabMove = ()=>{
        tabChange(tab)
    }

    //등록
    const handleSubmit = useCallback(async (e)=> {
        console.log(toJS(state.upData)); 
        // return 
        if(state.upData.length > 0){
            if(state.depth3AddChk === true){
                Modal.warning({
                    title:"추가된 코드를 '비용 청구 분류와 코드'에도 반드시 반영해야 합니다.",
                    onOk(){
                        submit();
                    },
                }); 
            }else{
                submit();
            }
           
        }else{
            Modal.warning({
                title : '등록할 내용이 없습니다.',
            }); 
        }
            
    }, []);      

    //등록
    const submit = useCallback(async (e)=> {
      
        var axios = require('axios');

        var config={
            method:'POST',
            url:process.env.REACT_APP_API_URL +'/api/v1/billing-classification/',
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
                        state.dataDepth2 = [];
                        state.dataDepth3 = [];
                        state.depth2Parent = [];
                        state.depth3Parent = [];
                        state.upData = [];
                        state.error1depthChk= '';
                        state.error2depthChk = '';
                        state.error3depthChk = '';
                        stateData.theInput = '';
                        stateData.theInput2 = '';
                        stateData.theInput3 = '';
                        stateData.inTxt = '';

                        if(state.depth3AddChk === true){
                            state.depth3AddChk = false
                            tabMove();  //저장후 비용 청구 분류와 코드로 이동
                        }
                        
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
            
    }, []);      


    

return (
    <Wrapper>
      
        <Row gutter={20} className="adm_code_wrap">
            <Col className="gutter-row" span={5}>
                <div className="container_treeview onlylist">
                    <wjNav.TreeView 
                        isReadOnly={false} 
                        itemsSource={state.data} 
                        displayMemberPath="name" 
                        imageMemberPath="img" 
                        showCheckboxes={false} 
                        allowDragging={allowDragging}
                        dragEnd={onDragEnd.bind(this)} 
                        initialized={initialized.bind(this)}                          
                        formatItem={onFormatItem.bind(this)} 
                        itemClicked={onItemClicked.bind(this)}
                    />

                    <div className="add_ipt_wrap">
                        <Input id="theInput"  value={stateData.theInput} onChange={handleChangeInput('theInput')} />
                        <Button type="primary" onClick={(e)=>{addNode('1depth',0)}}>+</Button>
                    </div>
                </div>
            </Col>

            <Col className="gutter-row middle-treeview" span={5}>
                <div className="container_treeview onlylist">
                    <wjNav.TreeView 
                        isReadOnly={false} 
                        itemsSource={state.dataDepth2} 
                        displayMemberPath="name" 
                        imageMemberPath="img" 
                        showCheckboxes={false} 
                        allowDragging={allowDragging}
                        dragEnd={onDragEnd2.bind(this)} 
                        initialized={initialized2.bind(this)}                          
                        formatItem={onFormatItem.bind(this)} 
                        itemClicked={onItemClicked2.bind(this)}
                    />

                    <div className="add_ipt_wrap">
                        <Input id="theInput"  value={stateData.theInput2} onChange={handleChangeInput('theInput2')} />
                        <Button type="primary" onClick={(e)=>{addNode('2depth',0)}}>+</Button>
                    </div>
                </div>
            </Col>

            <Col className="gutter-row last-treeview" span={9}>
                <div className="container_treeview">
                    <wjNav.TreeView  
                        isReadOnly={false} 
                        itemsSource={state.dataDepth3} 
                        displayMemberPath="name" 
                        imageMemberPath="img" 
                        showCheckboxes={false} 
                        allowDragging={allowDragging}
                        dragEnd={onDragEnd3.bind(this)}                        
                        initialized={initialized3.bind(this)} 
                        formatItem={onFormatItem.bind(this)} 
                        itemClicked={onItemClicked3.bind(this)}
                    />
                    
                    <div className="add_ipt_wrap">
                        <Input id="theInput2" value={stateData.theInput3} onChange={handleChangeInput('theInput3')} />
                        <Button type="primary" onClick={(e)=>{addNode('3depth', 0)}}>+</Button>
                    </div>
                </div>
            </Col>
        </Row>
        <br />
        <Row gutter={[10, 10]}  justify="center" style={{ marginTop: 20 }}>
            <Col>
                <Button type="primary" htmlType="button" onClick={()=>handleSubmit()}>확인</Button>
            </Col>
            <Col>
                <Button htmlType="button" onClick={handleReset}>취소</Button>
            </Col>
        </Row>
        


    </Wrapper>
  );
});

export default classFicationCode;
