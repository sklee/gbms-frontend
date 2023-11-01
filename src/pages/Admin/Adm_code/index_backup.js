/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect,useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Breadcrumb, Form, Row, Col, Input, Space , Tabs, Card, Button, Collapse, Modal} from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import { toJS } from 'mobx';

import useStore from '@stores/useStore';

import * as wjNav from '@grapecity/wijmo.react.nav';
import * as WjcNav from "@grapecity/wijmo.nav";
import { format } from 'morgan';
import e from 'connect-timeout';
import { map } from 'styled-components-breakpoint';

const { Panel } = Collapse;

const Wrapper = styled.div`
  width: 100%;
`;

const Adm_code = observer(() => {
  const { commonStore } = useStore();
  const state = useLocalStore(() => ({
    treeControl: [],
    depth4Data: [],
    treeClickVal: '',
    treeClickVal1: '',
    treeClickVal2: '',
    treeClickVal3: '',
    depth4Code: '',
  }));
  useEffect(() => {
    fetchData();
  }, []);

  const [treeData,setTreeData] = useState([]);
  const [treeData2,setTreeData2] = useState([]);
  const [treeData3,setTreeData3] = useState([]);
  const [treeData4,setTreeData4] = useState([]);

  const fetchData = useCallback(async () => {
    commonStore.loading = true;
    const result = await commonStore.handleApi({
      method: 'POST',
      url: 'admin/code_list',
    });

    if (result) {
      setTreeData(result);
    }
    commonStore.loading = false;
  }, []);

  const fetchData2 = useCallback(async (val) => {
    commonStore.loading = true;
    const result = await commonStore.handleApi({
      method: 'POST',
      url: 'admin/code_list',
      data : {
        'code' : val,
        'depth_chk' : '2depth',
      },
    });

    if (result) {
      setTreeData2(result);
    }
    commonStore.loading = false;
  }, []);

  const fetchData3 = useCallback(async (val) => {
    commonStore.loading = true;
    const result = await commonStore.handleApi({
      method: 'POST',
      url: 'admin/code_list',
      data : {
        'code' : val,
        'depth_chk' : '3depth',
      },
    });

    if (result) {
      setTreeData3(result);
    }
    commonStore.loading = false;
  }, []);

  const fetchData4 = useCallback(async (val) => {
    commonStore.loading = true;
    const result = await commonStore.handleApi({
      method: 'POST',
      url: 'admin/code_list',
      //url: 'admin/api_list',
      data : {
        'code' : val,
        'depth_chk' : '4depth',
      },
    });

    if (result) {
      setTreeData4(result);
    }
    commonStore.loading = false;
  }, []);

  const onDragStart = (s, e) => {
    if (e && e.node && e.node.hasChildren) {
        //e.cancel = true; // prevent dragging parent nodes
      //e.node.isCollapsed = true; // collapse parent nodes when dragging
    }
  }
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
    if(state.depth4Data == ""){
      num = 0;
    }else{
      num = state.depth4Data.length;
    }

    if(control.dataItem.chkType == "add"){      
      var chk = true;
      var i= 0;
      for(i=0; i < state.depth4Data.length; i++){
        if(state.depth4Data[i].name == control.dataItem.header){
          state.depth4Data[i].array =  control.itemsSource;
          chk = false;
          break;
        }else{
          chk = true;
        }
      }
      
      if(chk == true){
        state.depth4Data[num] = {name : control.dataItem.header, array: control.itemsSource};
      }
    }else{
      var i= 0;
      if(state.depth4Data.length == 0){
        state.depth4Data[0] = {array: control.itemsSource};
      }else{
        for(i=0; i < state.depth4Data.length; i++){
          state.depth4Data[i] = {array: control.itemsSource};
        } 
      }        
    }
  }

  const addNode = (idx, depth) => {
    let newTitle = document.getElementById("theInput").value;
    if(idx == 1){
      newTitle = document.getElementById("theInput2").value;
    }else if(idx == 2){
      newTitle = document.getElementById("theInput3").value;
    }else if(idx == 3){   
      newTitle = document.getElementById("theInput4").value;
    }

    if(newTitle != ""){      
      if(state.treeControl[idx].totalItemCount == 0){ //array 빈값일경우
        let pacodeTxt = '';
        var control = state.treeControl[idx];

        if(idx === 1){
          pacodeTxt = state.treeClickVal;
          setTreeData3([]);
          setTreeData4([]);
          state.depth4Data = [];
        }else if(idx === 2){          
          setTreeData4([]);
          state.depth4Data = [];
          pacodeTxt = state.treeClickVal1;
        }else if(idx === 3){
          pacodeTxt = state.treeClickVal2;          
        }else{
          setTreeData2([]);
          setTreeData3([]);
          setTreeData4([]);
          state.depth4Data = [];
        }

        const result = [{
          header: newTitle,
          code : "",
          pacode: pacodeTxt,
          chkType: "add" , 
          ordNum : "0"
        }];

        if(idx === 1){
          setTreeData2(result);
        }else if(idx === 2){
          setTreeData3(result);

        }else if(idx === 3){
          setTreeData4(result);       

          var num = 0;
          if(state.depth4Data == ""){
            num = 0;
          }else{
            num = state.depth4Data.length;
          }
          
          if(control.itemsSource != "" && control.itemsSource != null ){
            state.depth4Data[num] = {name : newTitle, array: control.itemsSource};
          }else{
            state.depth4Data[num] = {name : newTitle, array: result};
          }          
        }
      }else{
        var control = state.treeControl[idx];

        if(depth == 3){
          var pacode = control.nodes[0].dataItem.pacode;
          var depthData = '4';
        }else{
          if(idx == "1"){
            var pacode = state.treeClickVal;
            var depthData = '2';
          }else if(idx == "2"){
            var pacode = state.treeClickVal1;
            var depthData = '3';
          }else{
            var group_code = state.treeClickVal2;
            var pacode = '';
            var depthData = '1';
          }
          //var pacode = control.nodes[0].dataItem.cd_cg_code;
        }
        var newItem = { header: newTitle, code_add : "", depth:depthData, pacode : pacode, group_code : group_code, chkType: "add" , ordNum : control.nodes.length+1}, node = control.selectedNode;

        if (depth != 0) {                          
            var index = node.nodes ? node.nodes.length : 0;
            control.selectedNode = node.addChildNode(index, newItem);
        }else {
          //초기화
          if(idx === 1){
              state.depth4Data = [];
              setTreeData3([]);
              setTreeData4([]);
          }else if(idx === 2){
              setTreeData4([]);
              state.depth4Data = [];
          }else if(idx === 0){            
              setTreeData2([]);
              setTreeData3([]);
              setTreeData4([]);
              state.depth4Data = [];
          }
          var index = control.nodes ? control.nodes.length : 0;
          control.selectedNode = control.addChildNode(index, newItem);
        }

        if(idx == 3){
          var num = 0;
          if(state.depth4Data == ""){
            num = 0;
          }else{
            num = state.depth4Data.length;
          }
  
          state.depth4Data[num] = {name : newItem.header, array: control.itemsSource};
        }
      }

    }
  }

  const onFormatItem = (s, e) => {
    var inhtml = e.element.innerHTML;
    var inTxt = e.element.innerText; //일반(ex 개발본부)
    //e.element.classList.add('wj-node-acc');
    // e.element.innerHTML = '<div class="acc_wrap"><span class="btn_acc">'+ inTxt +'<i class="ant-menu-submenu-arrow"></i></span> <div class="accIn"><textarea class="ant-input" placeholder="해당 코드에 대한 주석입니다."></textarea></div></div>';
    //e.element.innerHTML = "<Collapse><Panel header='"+inTxt+"'><Input.TextArea /></Panel></Collapse>";
    switch (e.level){
      case 0:
        e.element.innerHTML = '<div class="acc_wrap"><span class="btn_acc">'+ inTxt +'<i class="ant-menu-submenu-arrow"></i></span></div>';
        break;
      case 1:
        e.element.classList.add('wj-node-acc');
        e.element.innerHTML = '<div class="acc_wrap"><span class="btn_acc">'+ inTxt +'<i class="ant-menu-submenu-arrow"></i></span> <div class="accIn"><textarea class="ant-input" placeholder="해당 코드에 대한 주석입니다."></textarea></div></div>';
        break;
    }


  }

  const initialized = (idx, control) => {
    // if(idx == 0){
    //   state.fstTreeControl.push(control);  
    // }else if(idx==3){
    //   state.lstTreeControl.push(control);
    // }
    state.treeControl.push(control);
    // state.treeControl[0].selectedItem = state.treeControl[0].itemsSource[0];
  }

  const onItemClicked = (e) => { //일반코드(ex 개발본부)
    // e.selectedNode.element.getelementByClassName("acc_wrap").classList.add('on');
    //state.isActive ? true : false;
    console.log(e.selectedNode);
    console.log(e.selectedNode.dataItem.depth_chk);
    console.log(e.selectedNode.dataItem.code);
    
    if(e.selectedNode.dataItem.depth_chk == '2depth'){   
      state.treeClickVal1=e.selectedNode.dataItem.code;
      fetchData3(e.selectedNode.dataItem.code);
      if(treeData4){
        setTreeData4([]);
      }
      state.depth4Data = [];
    }else if(e.selectedNode.dataItem.depth_chk == '3depth'){
      state.treeClickVal2=e.selectedNode.dataItem.code;
      fetchData4(e.selectedNode.dataItem.code);
      state.depth4Data = [];
      state.depth4Code = e.selectedNode.dataItem.code;
    }else if(e.selectedNode.dataItem.depth_chk == '4depth'){
      state.treeClickVal3=e.selectedNode.dataItem.code;
      if(e.selectedNode.element.classList.contains('active')){
        e.selectedNode.element.classList.remove('active');
        // e.selectedNode.element.querySelector(".ant-input").removeEventListener('click');
      }else{        
        e.selectedNode.element.classList.add('active');

        const el = document.getElementsByClassName("ant-input");
        for (var i = 0; i < el.length; i++) {
            el[i].addEventListener('click', myFunction, false);
        }
        var myFunction = function() {
            console.log("okoko")
        };

      }      
      
    }else{
      if(e.selectedNode.dataItem.code != "" && e.selectedNode.dataItem.code != undefined ){
        state.treeClickVal=e.selectedNode.dataItem.code;
        fetchData2(e.selectedNode.dataItem.code);
        if(treeData3){
          setTreeData3([]);
        }
        if(treeData4){
          setTreeData4([]);
        }
        state.depth4Data = [];
      }       
    }    
    
  }

  //반복 api
  const apiRequest=(data) => {

    if(data){
      if(data.length > 0){
        var depth = [];
        var cnt = depth.length;

        data.forEach(e => {
          //console.log(e);
          if(e.code_add == "" ){
            if(e.memo == undefined){
              e.memo = '';
            }
            depth[cnt] = {name: e.header, depth:e.depth, memo:e.memo, parent_code : e.parent_code}
            cnt++;
          }
        });
        //repeat(depth);        
      }
    }else{     
      console.log('test');
      //1depth  
      if(treeData.length > 0){
        var depth1 = [];
        var cnt = depth1.length;

        treeData.forEach(e => {
          //console.log(e);
          if(e.code_add == "" ){
            if(e.memo == undefined){
              e.memo = '';
            }
            depth1[cnt] = {name: e.header, depth:'1', memo:e.memo, parent_code : ''}
            cnt++;
          }
        });
        repeat(depth1);        
      }else{
        if(treeData2.length > 0){
          console.log('2');
        }else {
          if(treeData3.length > 0){
            console.log('3');
          }else{
            if (treeData4.length > 0){
              console.log('4');
            }    
          }
        }
      }
    }
  }

  const repeat = (data)=>{
    for (let i = 0; i < data.length; i++) {
      try {
        if(data.length == i){
          console.log('update');
          //코드 등록 완료 후 순서 변경
          //update_chk(data.depth);
        }else{
          api_insert(data[i]);
        }
        
      } catch (err) {
        console.log(err);
        // Modal.error({
        //   content: '등록이 문제가 발생하였습니다. 재시도해주세요. ',        
        // });
      }
    }
  }

  const updateRepeat = (data)=>{
    for (let i = 0; i < data.length; i++) {
      try {
        if(data.length == i){
          console.log('update');
          //코드 등록 완료 후 순서 변경
          //api_update(data.depth);
        }else{
          api_update(data[i]);
        }
        
      } catch (err) {
        console.log(err);
        // Modal.error({
        //   content: '등록이 문제가 발생하였습니다. 재시도해주세요. ',        
        // });
      }
    }
  }

  const update_chk = async(depth) => {
    if(depth == '1'){
      updateRepeat(treeData);
    }else if(depth == '2') {
      updateRepeat(treeData2);
    }else if(depth == '3') {
      updateRepeat(treeData3);
    }else if(depth == '4') {
      updateRepeat(treeData4);
    }
  }

  const api_insert = async(data) =>{   
    var axios = require('axios');
    var data = JSON.stringify(data);
    var data2 = data;

    return new Promise((resolve, reject) => {      
      var config={
        method:'POST',
        url:process.env.REACT_APP_API_URL +'/api/v1/code-groups',
        headers:{
            'Accept':'application/json',
            'Content-Type':'application/json',
        },
            data:data
      };
      axios(config)  // api주소, body에 보낼 값 위에서 받은 num[i]값
      .then(function(response){
        console.log(response);
        // (1) 정상적인 응답이 왔을때 
        if(response.data.data.code != '' ){
          var code = response.data.data.code;
          var parent_code = response.data.data.parent_code;
          var depth = response.data.data.depth;
          
          data2.forEach(e => {
            e.code = code;
            if(parent_code){
              e.parent_code = parent_code;
            }
          });

          treeData.forEach(e => {
            if(e.code == '' && e.header == data2.name){
              e.code = parent_code;
            }            
          });

          resolve("compleate");         

          //adminProc(code, depth, data2);

          
        }else{
          reject("error");
            // Modal.error({
            //     content: '등록이 문제가 발생하였습니다. 재시도해주세요. ',        
            // });  
        }       
      })
      .catch(function(error){
        // (2) 정상적인 응답을 받지 못했을때 
        reject("error")
      })
    })
  }

  const api_update = async(data) =>{   
    var axios = require('axios');
    var data = JSON.stringify(data);
    var data2 = data;

    return new Promise((resolve, reject) => {      
      var config={
        method:'POST',
        url:process.env.REACT_APP_API_URL +'/api/v1/code-groups',
        headers:{
            'Accept':'application/json',
            'Content-Type':'application/json',
        },
            data:data
      };
      axios(config)  // api주소, body에 보낼 값 위에서 받은 num[i]값
      .then(function(response){
        console.log(response);
        // (1) 정상적인 응답이 왔을때 
        if(response.data.data.code != '' ){
          resolve("compleate");
          var code = response.data.data.code;
          var depth = response.data.data.depth;
          //adminProc(code, depth, data2);
        }else{
          reject("error");
            // Modal.error({
            //     content: '등록이 문제가 발생하였습니다. 재시도해주세요. ',        
            // });  
        }       
      })
      .catch(function(error){
        // (2) 정상적인 응답을 받지 못했을때 
        reject("error")
      })
    })
  }
 
  const adminProc = async(code, depth, data)=>{
    var axios = require('axios');

    return new Promise((resolve, reject) => {      
      var config={
        method:'POST',
        url:'admin/admin_code_proc',
        headers:{
            'Accept':'application/json',
            'Content-Type':'application/json',
        },
            data:{
              code:code,
              depth:depth,
              data:data
            }
      };
      axios(config)  // api주소, body에 보낼 값 위에서 받은 num[i]값
      .then(function(response){
        console.log(response);
        // (1) 정상적인 응답이 왔을때 
        if(response.data.user != '' && response.data.info != ''){
          //resolve("compleate");
          //adminProc();
        }else{
          reject("error");
            // Modal.error({
            //     content: '등록이 문제가 발생하였습니다. 재시도해주세요. ',        
            // });  
        }
        
        
      })
      .catch(function(error){
        // (2) 정상적인 응답을 받지 못했을때 
        reject("error")
      })
    })

    
    // commonStore.loading = true;
   
    // const result = await commonStore.handleApi({
    //   method: 'POST',
    //   url: 'admin/admin_code_proc',
    //   data : {
    //     'code' : code,
    //     'depth' : depth,
    //     'data' : data,
    //   },
    // });

    // if (result) {

    // }else{
      

    // }
  }




  const admin_proc = async() => {
    commonStore.loading = true;

    const result = await commonStore.handleApi({
      method: 'POST',
      url: 'admin/admin_code_proc',
      data : {
        '1depth' : treeData,
        '2depth' : treeData2,
        '3depth' : treeData3,
        '4depth' : state.depth4Data,
        '4depth_code' : state.depth4Code,
      },
    });

    if (result) {
      if(result.type == "success"){
        var text = "코드가 수정되었습니다.";
        Modal.success({
          content: text,
        });
        if(state.depth4Data){
          state.depth4Data=[];
          fetchData4(state.treeClickVal2);
        }
       
        if(state.treeClickVal !="" && state.treeClickVal1 == ""){
          fetchData2(state.treeClickVal);
        }else if(state.treeClickVal !="" && state.treeClickVal1 != ""){
          fetchData3(state.treeClickVal1);
        }else{
          fetchData();
        }
        
      }else{
        var text = "오류가 발생하였습니다. 재시도해주세요./n 오류코드 : "+result.message;
        Modal.error({
          content: text,
        });
      }
      
    }

    commonStore.loading = false;
   };

   const handleReset = useCallback(() => {
    return window.ask({
      title: `이 창의 입력 내용이 삭제됩니다.`,
      content: `그래도 계속 하시겠습니까?`,
      async onOk() {
        window.location.reload();
      },
    });
  }, []);


  const test = ()=>{  
    
    if(treeData.length > 0){
      repeatData(treeData);
    }

    if(treeData2.length > 0){
      repeatData(treeData2);
    }


    
   
  }

  const repeatData = (data)=>{
    var axios = require('axios');
    console.log(data);
    // data.forEach(e => {     
    //   if(e.code_add == '' && e.chkType=='add'){
    //     //api 수정 후 재수정--------
    //     // var data = {name : e.header, depth: e.depth, group_code:e.group_code, pacode:e.pacode, memo:e.memo}
    //     // data = JSON.stringify(data);
    //     // var config={
    //     //   method:'POST',
    //     //   url:process.env.REACT_APP_API_URL +'/api/v1/code-groups',
    //     //   headers:{
    //     //       'Accept':'application/json',
    //     //       'Content-Type':'application/json',
    //     //   },
    //     //     data:data
    //     // };
    //     // axios(config)  // api주소, body에 보낼 값 위에서 받은 num[i]값
    //     // .then(function(response){
    //     //   console.log(response);
    //     //   // (1) 정상적인 응답이 왔을때 
    //     //   if(response.data.data.code != '' ){
    //     //     //resolve("compleate");
    //     //     //adminProc();
    //     //   }else{
    //     //     Modal.error({
    //     //       content: '등록이 문제가 발생하였습니다. 재시도해주세요. ',        
    //     //     }); 
    //     //   }
          
          
    //     // })
    //     // .catch(function(error){
    //     //   Modal.error({
    //     //       content: '등록이 문제가 발생하였습니다. 재시도해주세요. ',        
    //     //   }); 
    //     // })
    //     //api 수정 후 재수정 끝--------

    //     //if code 발급되었을 경우 db에 추가
    //     var code = 'P10' ;
    //     if(code != ''){
    //       var config={
    //         method:'POST',
    //         url:'admin/admin_code_proc',
    //         headers:{
    //             'Accept':'application/json',
    //             'Content-Type':'application/json',
    //         },
    //           data:{
    //             code:code,
    //             depth:e.depth,
    //             data:e
    //           }
    //       };
    //       axios(config)  // api주소, body에 보낼 값 위에서 받은 num[i]값
    //       .then(function(response){
    //         console.log(response);
    //         insert_update(code,e);
    //         // (1) 정상적인 응답이 왔을때 
    //         if(response.data.user != '' && response.data.info != ''){
    //           //resolve("compleate");
    //           //adminProc();
              
    //         }else{
              
    //             // Modal.error({
    //             //     content: '등록이 문제가 발생하였습니다. 재시도해주세요. ',        
    //             // });  
    //         }
            
            
    //       })
    //       .catch(function(error){
    //         // (2) 정상적인 응답을 받지 못했을때 
            
    //       })
    //     }
      
    //   }
      
    //   // else{ //업데이트
    //   //   console.log(e);
    //   //   var data = {name : e.header, depth: e.depth, parent_code:e.parent_code, memo : e.memo, ordNum:e.ordnum }
    //   //   data = JSON.stringify(data);
    //   //   console.log(data);
    //   //   // var config={
    //   //   //   method:'POST',
    //   //   //   url:process.env.REACT_APP_API_URL +'/api/v1/code-groups/'+e.code,
    //   //   //   headers:{
    //   //   //       'Accept':'application/json',
    //   //   //       'Content-Type':'application/json',
    //   //   //   },
    //   //   //     data:data
    //   //   // };
    //   //   // axios(config)  // api주소, body에 보낼 값 위에서 받은 num[i]값
    //   //   // .then(function(response){
    //   //   //   console.log(response);
    //   //   //   // (1) 정상적인 응답이 왔을때 
    //   //   //   if(response.data.data.code != '' ){
    //   //   //     //resolve("compleate");
    //   //   //     //adminProc();
    //   //   //   }else{
    //   //   //     return;
    //   //   //     // Modal.error({
    //   //   //     //   content: '등록이 문제가 발생하였습니다. 재시도해주세요. ',        
    //   //   //     // }); 
    //   //   //   }
          
          
    //   //   // })
    //   //   // .catch(function(error){
    //   //   //   // Modal.error({
    //   //   //   //     content: '등록이 문제가 발생하였습니다. 재시도해주세요. ',        
    //   //   //   // }); 
    //   //   // })
    //   // }     
    // })
  }


  const insert_update = (code,data) =>{
    console.log(data);
    if(data.memo != '' && data.memo != undefined){
      data.memo = data.memo;
    }else {
      data.memo = '';
    }
    var data = {name : data.header, depth:data.depth, group_code:data.group_code, memo : data.memo, ordNum:data.ordNum }
    data = JSON.stringify(data);
    
    console.log(data);
    // var config={
    //   method:'POST',
    //   url:process.env.REACT_APP_API_URL +'/api/v1/code-groups/'+code,
    //   headers:{
    //       'Accept':'application/json',
    //       'Content-Type':'application/json',
    //   },
    //     data:data
    // };
    // axios(config)  // api주소, body에 보낼 값 위에서 받은 num[i]값
    // .then(function(response){
    //   console.log(response);
    //   // (1) 정상적인 응답이 왔을때 
    //   if(response.data.data.code != '' ){
    //     //resolve("compleate");
    //     //adminProc();
    //   }else{
    //     return;
    //     // Modal.error({
    //     //   content: '등록이 문제가 발생하였습니다. 재시도해주세요. ',        
    //     // }); 
    //   }
      
      
    // })
    // .catch(function(error){
    //   // Modal.error({
    //   //     content: '등록이 문제가 발생하였습니다. 재시도해주세요. ',        
    //   // }); 
    // })
  }



  return (
    <Wrapper>
        <Row gutter={20} className="adm_code_wrap">
          <Col className="gutter-row" span={5}>
            <div className="container_treeview onlylist">
                <wjNav.TreeView itemsSource={treeData} dataItem={treeData} displayMemberPath="header" childItemsPath="items" imageMemberPath="img" showCheckboxes={false} allowDragging={true} dragStart={onDragStart.bind(this)} dragOver={onDragOver.bind(this)} initialized={initialized.bind(this, 0)}  itemClicked={onItemClicked.bind(this)}></wjNav.TreeView>
                <div className="add_ipt_wrap">
                  <Input id="theInput" />
                  <Button type="primary" onClick={(e)=>{addNode(0, 0)}}>+</Button>
                </div>
            </div>
          </Col>
          <Col className="gutter-row" span={5}>
            <div className="container_treeview onlylist">
                <wjNav.TreeView itemsSource={treeData2} dataItem={treeData2} displayMemberPath="header" childItemsPath="items" imageMemberPath="img" showCheckboxes={false} allowDragging={true} dragStart={onDragStart.bind(this)} dragOver={onDragOver.bind(this)} initialized={initialized.bind(this, 1)} itemClicked={onItemClicked.bind(this)}></wjNav.TreeView>
                <div className="add_ipt_wrap">
                  <Input id="theInput2" />
                  <Button type="primary" onClick={(e)=>{addNode(1, 0)}}>+</Button>
                </div>
            </div>
          </Col>
          <Col className="gutter-row" span={5}>
            <div className="container_treeview onlylist">
                <wjNav.TreeView itemsSource={treeData3} dataItem={treeData3} displayMemberPath="header" childItemsPath="items" imageMemberPath="img" showCheckboxes={false} allowDragging={true} dragStart={onDragStart.bind(this)} dragOver={onDragOver.bind(this)} initialized={initialized.bind(this, 2)} itemClicked={onItemClicked.bind(this)}></wjNav.TreeView>
                <div className="add_ipt_wrap">
                  <Input id="theInput3" />
                  <Button type="primary" onClick={(e)=>{addNode(2, 0)}}>+</Button>
                </div>
            </div>
          </Col>
          <Col className="gutter-row last-treeview" span={9}>
            <div className="container_treeview">
              <wjNav.TreeView itemsSource={treeData4} dataItem={treeData4} displayMemberPath="header" childItemsPath="children" imageMemberPath="img" collapseOnClick={false} collapseWhenDisabled={true} showCheckboxes={false} allowDragging={true} dragStart={onDragStart.bind(this)} dragOver={onDragOver.bind(this)} dragEnd={onDragEnd.bind(this)} formatItem={onFormatItem.bind(this)} initialized={initialized.bind(this, 3)} itemClicked={onItemClicked.bind(this)}></wjNav.TreeView>
              <div className="add_ipt_wrap">
                  <Input id="theInput4" />
                  <Button type="primary" onClick={(e)=>{addNode(3, 0)}}>+</Button>
                </div>
            </div>
          </Col>
        </Row>
        <br />
        <Row gutter={[10, 10]}  justify="center" style={{ marginTop: 20 }}>
          <Col>
            {/* <Button type="primary" htmlType="submit" onClick={admin_proc()}></Button> */}
            {/* <Button htmlType="button"  onClick={admin_proc}> */}
            {/* <Button htmlType="button"  onClick={()=>apiRequest()}> */}
            <Button htmlType="button"  onClick={()=>test()}>
              확인
            </Button>
          </Col>
          <Col>
            <Button htmlType="button" onClick={handleReset}>
              취소
            </Button>
          </Col>
        </Row>
        

    </Wrapper>
  );
});


export default Adm_code;
