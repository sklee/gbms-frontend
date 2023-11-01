/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Breadcrumb, Space, Table, Radio, Button, Input, Row, Col, Checkbox, Modal, Select, DatePicker, Menu, message } from 'antd';

import { set, toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';

import styled from 'styled-components';
import useStore from '@stores/useStore';

import * as wjNav from '@grapecity/wijmo.react.nav';
import * as WjcNav from "@grapecity/wijmo.nav";
import * as wjCore from '@grapecity/wijmo';
import { format } from 'morgan';

import * as wijmo from '@grapecity/wijmo';
import * as wjcGrid from '@grapecity/wijmo.grid';
import moment from 'moment';

const Wrapper = styled.div`
  width: 100%;
  .wj-flexgrid .wj-state-sticky .wj-header {opacity : unset;}
`;

const DEF_STATE = {
    // DB Data
    theInput: '',
};

const Adm_group = observer(() => {
    const { commonStore } = useStore();
    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 
    const state = useLocalStore(() => ({
        treeControl1: [],
        treeControl2: [],
        groupData:[
            {
                id:'P010101C001', name: '길벗 사업본부', child: [
                    { 
                        id:'P010101C0010', name: '개발본부(부서코드)' , children: [
                            { id:'P010101C0110', name: '어학&실용서실(부서코드)' , 
                                // children: [
                                // { id:'P010101C0111', name: '성인어학팀(부서코드)' },
                                // { id:'P010101C0112', name: '취미실용서팀(부서코드)' },
                                // { id:'P010101C0113', name: '콘텐츠유닛(부서코드)' },
                                // ]
                            },
                            { id:'P010101C0120', name: 'IT단행본실(부서코드)' },
                        ]
                    },
                ]
            },
            {
                id:'X010101C002', name: '길벗스쿨 학습본부', child: [
                    { 
                        id:'X010101C0010', name: '어학&실용서실(부서코드)' , children: [
                            { id:'X010101C0100', name: '성인어학팀(부서코드)' },
                            { id:'X010101C0101', name: '취미실용서팀(부서코드)' },
                            { id:'X010101C0102', name: '자녀교육서팀(부서코드)' },
                        ]
                    },
                ]
            },
        ],
        upData:[],
        detailUpData:[],
        detailData:[],
        selId:'',
        btnClick : true,
        errorChk:'',
        groupID:'',
        isCheck:[],
        
    }));
    useEffect(() => {
        fetchData();
    }, []);

    //api
    const fetchData = useCallback(async (val) => {    
        var url = '';
        if(val !== '' && val !== undefined){
            url = 'department-code-group-details?department_code_group_id='+val
        }else{
            url = 'department-code-groups'
        }

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
                if (result.status !== 200) {
                    Modal.error({
                        title: '오류가 발생했습니다.',
                        content: '오류코드:' + result.data.message,
                    });
                } else {
                    if(val !== '' && val !== undefined){
                        state.detailData = result.data.data      
                        var arr = [];                     
                        result.data.data.forEach(e => {
                            if(e.is_checked === true){
                                arr = [...arr, e.id]
                                e.child.forEach(c=> {
                                    if(c.is_checked === true){
                                        arr = [...arr, c.id]
                                        c.children.forEach(a => {
                                            if(a.is_checked === true){
                                                arr = [...arr, a.id]
                                            }
                                        })
                                    }
                                })
                            }
                        });     
                        
                        state.detailUpData =arr;
                        
                        console.log(toJS(arr))

                    }else{
                        state.groupData = result.data.data
                    }
                    
                    console.log(toJS(state.groupData))                    
                    console.log(toJS(state.detailData))                    
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

    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback((type) => (e) => {
        stateData[type] = e.target.value;
    },[],);


    const initialized1 = (control) => {
        state.treeControl1=control

    }

    const initialized2 = (control) => {
        state.treeControl2= control

    }

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
        console.log(s)

        if(state.upData.length>0){ 
            if(s.selectedItem.newChk !=='' && s.selectedItem.newChk !== undefined){ 
                var arr = state.upData.filter(e=>e.newChk !== s.selectedItem.newChk)
                state.upData = arr
            }            
        }

        s.selectedNode.itemsSource.forEach((e, num) => {           
            if(num+1 !== e.ordnum){
                // if(e.newChk !=='' && e.newChk !==undefined){        
                //     e.newChk = (num+1)
                // }
                e.ordnum = num+1
                dataChange(e)
            }
        });
        state.treeControl1.loadTree();
        // console.log(s)
    }

    const addNode = (idx, depth) => {
        if(state.errorChk){
            message.warning('명칭은 빈값일 수 없습니다.');
        }else{
            if(stateData.theInput != "" ){   
                var control = state.treeControl1;            
                
                if(state.errorChk){
                    message.warning('명칭은 빈값일 수 없습니다.');
                    return;
                }else{                               
                   state.detailData = []; 
                   var newItem = {id : '', name : stateData.theInput, ordnum : control.nodes.length+1, use_yn : 'Y', newChk:'new'+(control.nodes.length+1)};                         

                   stateData.theInput ='';
                   
                   var index = control.nodes ? control.nodes.length : 0;
                   control.selectedNode = control.addChildNode(index, newItem);

                   onFormatItem('', control.selectedNode)

                   dataChange(newItem)
                }                
            }else{
                message.warning('내용을 입력해 주세요.');
            }
        }
    }
    const onExpandedLoadedItems = (s, e) => {
        s.collapseToLevel(10);
    }

    const onFormatItem = (s, e) => {
        // var elId = s._e.id;
        // var inhtml = e.element.innerHTML;
        var inTxt = e.element.innerText; //일반(ex 개발본부)
        state.inTxt = e.element.innerText;
        e.element.classList.add('wj-node-acc');
        
        if(e.dataItem.id !== '' && e.dataItem.id !== undefined){
            var datass = e.dataItem.id;
        }else{
            var datass = e.dataItem.newChk;
        }
        

        // var html  = '<div class="acc_wrap" id="acc'+datass+'"><div class="tit_inBtn" id="btn'+datass+'">'+ inTxt +'<button type="button" class="ant-btn ant-btn-default btn-del">삭제</button></div></div>';
        var html  = '<div class="acc_wrap" id="acc'+datass+'"><div class="tit_inBtn" id="btn'+datass+'"><input style="width:50%" id="title'+datass+'" type="text" name="name'+datass+'" class="ant-input disTg title'+datass+'" value="'+ inTxt+'" autoComplete="off" /><button type="button" class="ant-btn ant-btn-default btn-del">삭제</button></div></div>';
        e.element.innerHTML = html;

        e.element.addEventListener('click', (event) => {
            event.stopPropagation();

            // if(event.target.classList.contains('tit_inBtn')){
            //     console.log(1)
            //     if(state.btnClick === true){
            //         var input = '<input style="width:50%" id="title'+datass+'" type="text" name="name'+datass+'" class="ant-input disTg title'+datass+'" value="'+ inTxt+'" autoComplete="off" />';
            //         state.btnClick = false
            //     }else{
            //         state.btnClick = true
            //         var input = inTxt
            //     }
                
            //     var html2  = '<div class="acc_wrap" id="acc'+datass+'"><div class="tit_inBtn" id="btn'+datass+'">'+ input +'<button type="button" class="ant-btn ant-btn-default btn-del">삭제</button></div></div>';
            //     e.element.innerHTML = html2;
            // }

            if(event.target.classList.contains('title'+datass)){
                //타이틀수정                
                const nameChange =  document.getElementById("title"+datass);  
                nameChange.addEventListener("keyup", function(event){
                    e.dataItem.name = nameChange.value;                   
                    if(inTxt !== nameChange.value && nameChange.value !== '' ){  
                        state.errorChk = '';
                        dataChange(e.dataItem)
                    } else{
                        state.errorChk = 'title'+datass;
                    }
                }, false);
            }          

            if(event.target.classList.contains('btn-del')){
                onRemoveSel(); 
                return false;
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

    const onFormatItem2 = (s, e) => {
        //상위단계를 클릭했을때 하위 id에 대한 데이터를 넘기지 않으면 부모code와 확인해서 체크해주기(문의내역 확인)
        // state.isCheck.forEach(v => {   
        //     if(v === e.dataItem.parent_code){
        //         console.log(e.dataItem.name)
        //         e.dataItem.is_checked = true
        //     }
        // });
        
        // console.log(s)
        // console.log(s.selectedNode)
        // if(s.selectedNode.hasChildren){
        //     var liEl = s.selectedNode._e.nextElementSibling,
        //         chk = liEl.getElementsByClassName("wj-node-check"),
        //         chked = true;

        //     if(liEl.classList.contains('disable')){ 
        //         chked = false;
        //         liEl.classList.remove('disable')
        //     }else{
        //         liEl.classList.add('disable')
        //     }
        //     for (let index = 0; index < chk.length; index++) {
        //         const element = chk[index];
        //         element.disabled = chked;
        //     } 
        // }

        var inTxt = e.element.innerText; //일반(ex 개발본부)
        state.inTxt = e.element.innerText;
        e.element.classList.add('wj-node-acc');
        var datass = e.dataItem.id;

        if(e.dataItem.is_checked === true){
            console.log(e)
            if( e.level === 0 || e.level === 1){
                var liEl = e._e.nextElementSibling,
                    chk = liEl.getElementsByClassName("wj-node-check"),
                    chked = true;

                if(liEl.classList.contains('disable')){ 
                    chked = false;
                    liEl.classList.remove('disable')
                }else{
                    liEl.classList.add('disable')
                }
                for (let index = 0; index < chk.length; index++) {
                    const element = chk[index];
                    element.disabled = chked;
                } 
            }
            // var checked = ''
            var checked = 'checked = checked'
        }else{
            var checked = ''
        }
        

        var html  = '<div class="acc_wrap" id="acc'+datass+'"><div class="tit_inBtn" id="btn'+datass+'">'+ inTxt +'<input type="checkbox" tabindex="-1" class="wj-node-check" '+checked+'></div></div>';
        e.element.innerHTML = html;

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
        var chk = false;
        if(state.upData.length >0 ) { //업뎃데이터가 있을경우
            for (let i = 0; i< state.upData.length; i++) {
                if(state.upData[i].newChk !== ''){
                    if(state.upData[i].id === val.id && state.upData[i].newChk === val.newChk){ 
                        state.upData[i].name = val.name
                        state.upData[i].ordnum = val.ordnum
                        state.upData[i].use_yn = val.use_yn
                        chk = false;
                        break;                     
                    }else{
                        chk = true;
                    }
                }else{
                    if(state.upData[i].id === val.id ){ 
                        state.upData[i].name = val.name
                        state.upData[i].ordnum = val.ordnum
                        state.upData[i].use_yn = val.use_yn
                        chk = false;
                        break;                     
                    }else{
                        chk = true;
                    }
                }                
            }
            if(chk == true){ //업뎃 데이터에 추가
                state.upData= [...state.upData, val];
            }
        }else{ //업뎃 데이터가 없을경우
            state.upData= [val];
            
        }
    }


    const onRemoveSel = (e) => {
        var control = state.treeControl1;
        if (control.selectedItem) {
            if(control.selectedItem.newChk !=='' && control.selectedItem.newChk !== undefined){
                state.upData = state.upData.filter(e=>e.newChk !== control.selectedItem.newChk)
            }else{
                control.selectedItem.use_yn = 'N'
                dataChange(control.selectedItem)
            }    
           
            var parent = control.selectedNode.parentNode;
            var arr = parent
                ? parent.dataItem[control.childItemsPath]
                : control.itemsSource;
            var index = arr.indexOf(control.selectedItem);
            arr.splice(index, 1);
            control.loadTree();
        }
        state.detailData = [];
    }

    const selectedItemChanged = (s, e) => {
        if(s.selectedNode !== '' && s.selectedNode !== undefined && s.selectedNode !== null ){
            if(s.selectedNode.dataItem.id !== '' && s.selectedNode.dataItem.id !== undefined){
                state.groupID = s.selectedNode.dataItem.id
                fetchData(s.selectedNode.dataItem.id)
            }else{
                state.detailData=[];
            }
            
        }
    }


    const onCheckedItemsChanged = (s, e) => {
        //상위단계를 체크시 하위단계 id값을 가져와야함
        if(s.selectedNode.isChecked  === false){
            var arr = [];

            if(s.selectedItem.child !=='' && s.selectedItem.child !==undefined){
                var childData = s.selectedItem.child

                childData.forEach(e => {
                    state.detailUpData = state.detailUpData.filter(a => a !== e.id)
                    if(e.children){
                        e.children.forEach(e => {
                            state.detailUpData = state.detailUpData.filter(a => a !== e.id)
                        });
                    }                    
                });      
                state.detailUpData = state.detailUpData.filter(a => a !== s.selectedItem.id)
            }else if(s.selectedItem.children !=='' && s.selectedItem.children !==undefined){
                s.selectedItem.children.forEach(e => {
                    state.detailUpData = state.detailUpData.filter(a => a !== e.id)
                });
                state.detailUpData = state.detailUpData.filter(a => a !== s.selectedItem.id)
            }else{
                state.detailUpData = state.detailUpData.filter(a => a !== s.selectedItem.id)
            }          
        }else{

            if(s.selectedItem.child !=='' && s.selectedItem.child !==undefined){
                state.detailUpData = [...state.detailUpData, s.selectedItem.id]
                
                var childData = s.selectedItem.child   
                childData.forEach(e => {
                    state.detailUpData = [...state.detailUpData, e.id]
                    if(e.children){
                        e.children.forEach(e => {
                            state.detailUpData = [...state.detailUpData, e.id]
                        });
                    }
                });
            
            }else if(s.selectedItem.children !=='' && s.selectedItem.children !==undefined){
                state.detailUpData = [...state.detailUpData, s.selectedItem.id]

                s.selectedItem.children.forEach(e => {
                    state.detailUpData = [...state.detailUpData, e.id]
                });
            }else{
                state.detailUpData = [...state.detailUpData, s.selectedItem.id]
            }
        }
        console.log(toJS(state.detailUpData))
        if(s.selectedNode.hasChildren){
            var liEl = s.selectedNode._e.nextElementSibling,
                chk = liEl.getElementsByClassName("wj-node-check"),
                chked = true;

            if(liEl.classList.contains('disable')){ 
                chked = false;
                liEl.classList.remove('disable')
            }else{
                liEl.classList.add('disable')
            }
            for (let index = 0; index < chk.length; index++) {
                const element = chk[index];
                element.disabled = chked;
            } 
        }
    }

    //취소
    const handleReset = useCallback((type) => {
        Modal.warning({
            title: '작업했던 내용들이 초기화됩니다.',
            content: '그래도 계속 하시겠습니까?',
            onOk() {
                fetchData();
                if(type === 'details'){
                    state.detailUpData=[];
                }else{
                    state.upData=[];
                    stateData.theInput='';
                    state.detailData =[];
                }
                
            },
        });

    }, []);


    //등록
    const handleSubmit = useCallback(async (e)=> {
        console.log(toJS(state.upData));        
       
        if(state.errorChk){
            message.warning('명칭은 빈값일 수 없습니다.');
        }else{
            // return
            if(state.upData.length > 0){
                var axios = require('axios');

                var config={
                    method:'POST',
                    url:process.env.REACT_APP_API_URL +'/api/v1/department-code-groups',
                    headers:{
                        'Accept':'application/json',
                    },
                        data:state.upData
                    };
                    
                axios(config)
                .then(function(response){
                    if(response.data.id !== '' && response.data.id !== undefined){
                        Modal.success({
                            title:response.data.result,
                            onOk(){                                
                                fetchData();
                                state.upData=[];
                                stateData.theInput ='';
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
                    title : '등록할 내용이 없습니다.'
                });  
            }
        }            
    }, []);  

    const handleDetailsSubmit = useCallback(async (e)=> {
        // console.log(toJS(state.detailUpData)); 
       
            // return
        if(state.detailUpData.length > 0){
            if(state.groupID !== '' && state.groupID !== undefined){
                var axios = require('axios');

                var config={
                    method:'POST',
                    url:process.env.REACT_APP_API_URL +'/api/v1/department-code-group-details?department_code_group_id='+state.groupID,
                    headers:{
                        'Accept':'application/json',
                    },
                        data:state.detailUpData
                    };
                    
                axios(config)
                .then(function(response){
                    if(response.data.id !== '' && response.data.id !== undefined){
                        Modal.success({
                            title:response.data.result,
                            onOk(){                                
                                fetchData();
                                state.detailUpData=[];
                                state.detailData=[];
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
            }
        }else{
            Modal.warning({
                title : '선택 그룹의 구성을 선택해주세요.',
            });  
        }
    }, []);  

    
    return (
        <Wrapper>
            <Card className="card-box adm_department_wrap">
                <Row gutter={20} className="adm_code_wrap">
                    <Col className="gutter-row" span={8}>
                        <Card title="부서 그룹">
                            <div className="container_treeview onlylist">
                                <wjNav.TreeView 
                                    id="treeGroup"
                                    isReadOnly={false} 
                                    isContentHtml={true}
                                    itemsSource={state.groupData} 
                                    displayMemberPath="name"
                                    showCheckboxes={false} 
                                    allowDragging={true}
                                    collapseWhenDisabled={true}
                                    dragEnd={onDragEnd.bind(this)} 
                                    initialized={initialized1.bind(this)}                          
                                    formatItem={onFormatItem.bind(this)} 
                                    selectedItemChanged={selectedItemChanged.bind(this)}
                                />
                                <div className="add_ipt_wrap">
                                    <Input id="theInput"  value={stateData.theInput} onChange={handleChangeInput('theInput')} />
                                    <Button type="primary" onClick={(e)=>{addNode(0, 0)}}>+</Button>
                                </div>
                            </div>
                        </Card>
                        <Row style={{marginTop:'20px'}}>
                            <Col xs={24} lg={24}>
                                <Space direction="horizontal" style={{width:'100%',justifyContent:'center'}}>
                                    <Button type="primary" onClick={()=>handleSubmit()}>확인</Button>
                                    <Button onClick={()=>handleReset('')}>취소</Button>
                                </Space>
                            </Col>
                        </Row>
                    </Col>
                    <Col className="gutter-row" span={16}>
                        <Card title="선택 그룹의 구성">
                            <div className="container_treeview onlylist">
                                <wjNav.TreeView 
                                    id="treeCell"
                                    isReadOnly={false} 
                                    itemsSource={state.detailData} 
                                    displayMemberPath="name" 
                                    childItemsPath={'child,children'.split(',')}
                                    showCheckboxes={true} 
                                    collapseWhenDisabled={false}
                                    allowDragging={true}
                                    initialized={initialized2.bind(this)}
                                    formatItem={onFormatItem2.bind(this)}
                                    checkedItemsChanged={onCheckedItemsChanged.bind(this)}
                                    loadedItems={onExpandedLoadedItems.bind(this)}
                                />
                            </div>
                        </Card>
                        <Row style={{marginTop:'20px'}}>
                            <Col xs={24} lg={24}>
                                <Space direction="horizontal" style={{width:'100%',justifyContent:'center'}}>
                                    <Button type="primary" onClick={()=>handleDetailsSubmit()}>확인</Button>
                                    <Button onClick={()=>handleReset('details')}>취소</Button>
                                </Space>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>
        </Wrapper>
    );
});

export default Adm_group;
