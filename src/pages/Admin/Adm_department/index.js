/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as ReactDOM from 'react-dom';
import { Card, Breadcrumb, Space, Table, Radio, Button, Input, Row, Col, Checkbox, Modal, Select, DatePicker, Menu, Dropdown,message } from 'antd';

import { set, toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';

import styled from 'styled-components';
import useStore from '@stores/useStore';

import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjNav from '@grapecity/wijmo.react.nav';
import { CollectionView } from '@grapecity/wijmo';

import moment from 'moment';

const Wrapper = styled.div`
  width: 100%;
  .wj-flexgrid .wj-state-sticky .wj-header {opacity : unset;}
`;

const { Option } = Select;

const DEF_STATE = {
    // DB Data
    theInput: '',
    effectived_at: moment().add(1,'days').toDate(),
    tomorrow: moment().add(1,'days').toDate(),
    effectivedListVal: '',
};

const Adm_department = observer(() => {
    const { commonStore } = useStore();
    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 
    const state = useLocalStore(() => ({
        treeControl: [],    //현재구성
        treeControl2: [],   //수정예정
        crtData:[],        //현재구성 목록 데이터
        modifyData:[],      //수정예정 목록 데이터
        inTxt: '',
        errorChk:'',    //현재구성 이름 빈값 체크
        upData:[],      //현재구성 추가&수정 데이터
        moUpData:[],    //수정 예정 수정 데이터
        effectived_list: [],    //수정 예정과 이력
        productionList: ['제조', '판매관리'],
        addToggle : '',
        today :  moment().format('YYYY-MM-DD'),

    }));
    useEffect(() => {
        handleCodeType();
        fetchData();       
        eFetchData();       
    }, []);

    //api
    const fetchData = useCallback(async (val) => {    
        var axios = require('axios');
console.log(val)
        if(val !== '' && val !== undefined){
            var url ='/api/v1/department-code-logs?effectived_at='+val
        }else{
            var url = '/api/v1/department-codes'
        }

        var config = {
            method: 'GET',
            url:process.env.REACT_APP_API_URL +url,
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
                    if(val !== '' && val !== undefined){
                        result.data.data.forEach(e => {
                            if(e.icube_code === '' || e.icube_code === null || e.icube_code === undefined){
                                e.icube_code = ''
                            }else{
                                e.icube_code = e.icube_code
                            }
                        });
                        state.modifyData = result.data.data
                    }else{
                        state.crtData = result.data.data
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
    
    const eFetchData = useCallback(async (val) => {    
        var axios = require('axios');

        var config = {
            method: 'GET',
            url:process.env.REACT_APP_API_URL +'/api/v1/effectived-department-code-logs?display=50&page=1&sort_by=date&order=desc',
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
                    state.effectived_list = ['선택하세요.']

                    //재정렬
                    let data = result.data.data.sort((a,b) => {
                        if(a.effectived_at > b.effectived_at) return -1;
                        if(a.effectived_at < b.effectived_at) return 1;
                        return 0;
                    });

                    data.forEach(e => {
                        state.effectived_list = [...state.effectived_list, e.effectived_at  ]
                    });

                    if(val !== '' && val !== undefined){
                        // fetchData(val)
                        stateData.effectivedListVal = val
                        // stateData.effectived_at = '';
                    }else{
                        stateData.effectivedListVal = '선택하세요.';
                        // stateData.effectivedListVal = moment(stateData.tomorrow).format('YYYY-MM-DD')    
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

    const handleCodeType = useCallback(async () => {
        var axios = require('axios');

        var config = {
            method: 'GET',
            url: process.env.REACT_APP_API_URL +'/api/v1/users-common-code',
            headers: {
                Accept: 'application/json',
            },
        };

        
        axios(config)
        .then(function (response) {     
            state.companyOption = response.data.company;
            state.departmentOption = response.data.department_type;           
        })
        .catch(function (error) {
            console.log(error.response);
            if(error.response !== undefined){
                if (error.response.status === 401) {
                    Modal.error({
                        title : '문제가 발생하였습니다.',
                        content : '오류코드:'+error.response.status
                    });  
                } 
            }
            
        });
    }, []);

    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback((type) => (e) => {
        stateData[type] = e.target.value;

        // const element = document.getElementById("theInput");

        // element.scrollIntoView();
        // e.target.scrollIntoView({ behavior: "smooth", block: "center" })
    },[],);

    // const handleChangeDate = useCallback((type, val) => {
    //     if(val !== '선택하세요.' && val !== undefined && val !== null){
    //         stateData[type] = moment(val).format('yyyy-MM-DD');
    //         console.log(type)
    //         console.log(stateData[type])
    //         console.log(val)
    //         if(type === 'effectived_list'){
    //             fetchData(stateData[type]) 
    //             stateData.effectivedListVal = moment(val).format('yyyy-MM-DD');
    //         } else{
    //             eFetchData(moment(val.format('YYYY-MM-DD'))) 
    //         }  
    //     }         
        
    // },[],);

    const handleChangeDate = useCallback((type,val) => (e) => {
        if(type === 'effectived_list'){
            if(e.selectedValue !=='' && e.selectedValue !== undefined && e.selectedValue !== null &&  e.selectedValue !== '선택하세요.'){
                console.log(e.selectedValue)
                stateData[type] = e.selectedValue
                stateData.effectivedListVal = e.selectedValue
                fetchData(stateData[type])
            }                 
        }else{
            // eFetchData(e.selectedValue) 
            stateData[type] = moment(e).format('yyyy-MM-DD');
        }  
    },[],);

    const initialized = (control) => {
        state.treeControl= control;
    }

    const initialized2 = ( control) => {
        state.treeControl2 = control;
    }


    const onDragEnd = (s, e) => { //마우스 놓았을때
        console.log(s)

        if(state.upData.length>0){ //새로 추가한 데이터 일 경우 upDate 데이터에서 삭제
            if(s.selectedItem.newChk !=='' && s.selectedItem.newChk !== undefined){ 
                var arr = state.upData.filter(e=>e.newChk !== s.selectedItem.newChk)
                state.upData = arr
            }            
        }

        s.selectedItem.depth = s.selectedPath.length
        // s.selectedItem.ordnum = s.selectedNode.index+1
        
        //위치 변동일 경우 parentNode 변경해야함
        var parentNode = ''
        if(s.selectedNode.parentNode !=='' && s.selectedNode.parentNode !== undefined && s.selectedNode.parentNode !== null){
            parentNode= s.selectedNode.parentNode.dataItem.parent_code
            if(parentNode === '' || parentNode === null || parentNode === undefined){
                parentNode = s.selectedNode.parentNode.dataItem.code
            }
        }

        var chkParentCode = 0
        
        s.selectedNode.itemsSource.forEach((e, num) => {           
            if(num+1 !== e.ordnum){
                if(e.newChk !=='' || e.newChk !==undefined){                    
                    console.log(e.newChk,s.selectedItem.newChk )
                    if(e.newChk === s.selectedItem.newChk){
                        e.depth = s.selectedPath.length
                    }
                    if(s.selectedPath.length > 1){ //depth가 1보다 클경우 parent_code 수정   
                        if(parentNode !=='' && parentNode !== undefined){
                            e.parent_code =parentNode
                            e.newChk = String(e.depth)+(num+1)+'new'
                        }else{
                            chkParentCode++
                        }                                         
                    }
                }else{
                    if(e.id === s.selectedItem.id){
                        e.depth = s.selectedPath.length
                    }
                    if(s.selectedPath.length > 1){ //depth가 1보다 클경우 parent_code 수정
                        e.parent_code = parentNode
                    }
                }

                e.ordnum = num+1
                if(chkParentCode > 0){
                    message.warning('새로 등록한 내용에 하위단계를 등록할 수 없습니다.');
                    var control = state.treeControl;

                    if (control.selectedItem) { //삭제
                        // find the array that contains the item to be removed
                        var parent = control.selectedNode.parentNode;
                        var arr = parent
                            ? parent.dataItem['children']
                            : control.itemsSource;

                            console.log(toJS(arr))
                        // remove the item from the parent collection
                        var index = arr.indexOf(control.selectedItem);
                        arr.splice(index, 1);
                        // refresh the tree
                        control.loadTree();
                    }

                    return;
                }else{
                    dataChange(e)
                }
                
            }
        });
    }

    const onDragEnd2 = (s, e) => { //마우스 놓았을때
        if(state.moUpData.length>0){ //새로 추가한 데이터 일 경우 upDate 데이터에서 삭제
            if(s.selectedItem.newChk !=='' && s.selectedItem.newChk !== undefined){ 
                var arr = state.moUpData.filter(e=>e.newChk !== s.selectedItem.newChk)
                state.moUpData = arr
            }            
        }

        s.selectedItem.depth = s.selectedPath.length
        // s.selectedItem.ordnum = s.selectedNode.index+1
        
        //위치 변동일 경우 parentNode 변경해야함
        var parentNode = ''
        if(s.selectedNode.parentNode !=='' && s.selectedNode.parentNode !== undefined && s.selectedNode.parentNode !== null){
            parentNode= s.selectedNode.parentNode.dataItem.parent_code
            if(parentNode === '' || parentNode === null || parentNode === undefined){
                parentNode = s.selectedNode.parentNode.dataItem.code
            }
        }

        var chkParentCode = 0
        
        s.selectedNode.itemsSource.forEach((e, num) => {           
            if(num+1 !== e.ordnum){
                if(e.newChk !=='' || e.newChk !==undefined){                    
                    console.log(e.newChk,s.selectedItem.newChk )
                    if(e.newChk === s.selectedItem.newChk){
                        e.depth = s.selectedPath.length
                    }
                    if(s.selectedPath.length > 1){ //depth가 1보다 클경우 parent_code 수정   
                        if(parentNode !=='' && parentNode !== undefined){
                            e.parent_code =parentNode
                            e.newChk = String(e.depth)+(num+1)+'new'
                        }else{
                            chkParentCode++
                        }                                         
                    }
                }else{
                    if(e.id === s.selectedItem.id){
                        e.depth = s.selectedPath.length
                    }
                    if(s.selectedPath.length > 1){ //depth가 1보다 클경우 parent_code 수정
                        e.parent_code = parentNode
                    }
                }

                e.ordnum = num+1
                if(chkParentCode > 0){
                    message.warning('새로 등록한 내용에 하위단계를 등록할 수 없습니다.');
                    var control = state.treeControl2;

                    if (control.selectedItem) { //삭제
                        // find the array that contains the item to be removed
                        var parent = control.selectedNode.parentNode;
                        var arr = parent
                            ? parent.dataItem['children']
                            : control.itemsSource;

                            console.log(toJS(arr))
                        // remove the item from the parent collection
                        var index = arr.indexOf(control.selectedItem);
                        arr.splice(index, 1);
                        // refresh the tree
                        control.loadTree();
                    }

                    return;
                }else{
                    dataChange2(e)
                }
                
            }
        });
    }

    const addNode = (idx, depth) => {
        if(state.errorChk ){
            message.warning('명칭은 빈값일 수 없습니다.');
        }else{
            // var theInput = document.getElementById('theInput').value;
            
            if(stateData.theInput != "" ){   
                var control = '';                
                
                if(state.errorChk){
                    message.warning('명칭은 빈값일 수 없습니다.');
                    return;
                }else{                
                   control = state.treeControl;

                    state.dataDepth2 = []; 
                    var newItem = {id : '', parent_code : '', name : stateData.theInput, depth : 1, ordnum : control.nodes.length+1, use_yn : 'Y', 
                                    newChk:'1'+(control.nodes.length+1)+'new',
                                    details : 
                                        {id : '', form:'', produce_sales_mgmt: '', cost_attribution_company: '',icube_code: '' }
                                    };       
                
                    // var newItem = {id : '', parent_code : '', name : stateData.theInput, depth : 1, ordnum : control.nodes.length+1, use_yn : 'Y',                                    
                    //                 details : 
                    //                     {id : '', form:'', produce_sales_mgmt: '', cost_attribution_company: '',icube_code: '' }
                    //                 };   

                        // document.getElementById('theInput').value = '';
                        stateData.theInput = '';
                    
                    var index = control.nodes ? control.nodes.length : 0;
                    control.selectedNode = control.addChildNode(index, newItem);

                    onFormatItem('', control.selectedNode , 'add')

                    dataChange(newItem)
                }                
            }else{
                message.warning('내용을 입력해 주세요.');
            }
        }
    }

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

    const toggleAction2 = (obj)=>{ //추가했을때 펼치기 수정하기
        const elB = document.getElementById(obj);
        const elNode = elB.parentNode.parentNode;

        if(elNode.classList.contains('active')){
            elNode.classList.add("wj-state-selected")
        }else{   
            elNode.classList.add("active")
            elNode.classList.add("wj-state-selected")
        }  

    }

    const onFormatItem = (s, e, add) => {
        const control = e;
        // var elId = s._e.id;
        var inhtml = e.element.innerHTML;
        var inTxt = e.element.innerText; 
        // state.inTxt = e.element.innerText;
        e.element.classList.add('wj-node-acc');

        if(e.dataItem.id === ''){
            var datass = e.dataItem.newChk;
        }else{
            var datass = e.dataItem.id;
        }
        
        if(state.companyOption !=='' && state.companyOption !== undefined){
            var checked = '';
            var companyList = '<option value="">선택</option>';
            state.companyOption.forEach(a => {              
                if(e.dataItem.details.cost_attribution_company === a.id){
                    checked ='selected="selected"' 
                }else{
                    checked = '';
                }
                companyList += '<option value="'+a.id+'" '+checked+'>'+a.name+'</option>'
            });
        }

        if(state.departmentOption !=='' && state.departmentOption !== undefined){
            var checked = '';
            var departmentList = '<option value="">선택</option>'
            state.departmentOption.forEach(a => {
                if(e.dataItem.details.form === a.id){
                    checked ='selected="selected"' 
                }else{
                    checked = '';
                }
                departmentList += '<option value="'+a.id+'" '+checked+'>'+a.name+'</option>'
            });
        }

        if(e.dataItem.details.produce_sales_mgmt !== '' && e.dataItem.details.produce_sales_mgmt !== undefined){
            var mgmtChecked1 = ''
            var mgmtChecked2 = ''
            if(e.dataItem.details.produce_sales_mgmt === 1){
                mgmtChecked1 = 'selected="selected"'
            }else if(e.dataItem.details.produce_sales_mgmt === 2){
                mgmtChecked2 = 'selected="selected"'
            }
        }

        if(e.dataItem.details.icube_code !== '' && e.dataItem.details.icube_code !== undefined && e.dataItem.details.icube_code !== null){
            var icube_code = e.dataItem.details.icube_code
        }else{
            var icube_code = ''
        }
        

        // var html  = '<div class="acc_wrap acc'+datass+'" id="acc'+datass+'"><span class="btn_acc" id="btn'+datass+'">'+ inTxt +'<i class="ant-menu-submenu-arrow btn_modify"></i></span>'+ 
        //     '<div class="accIn" id="cont'+datass+'"><label>명칭 수정</label>'+
        //         '<input id="title'+datass+'" type="text" name="name'+datass+'" class="ant-input disTg disDrag title'+datass+'" value="'+ inTxt+'" autoComplete="off" />'+
        //         '<div class="form_wrap">'+
        //             '<div class="form_item"><label>부서 형태 *</label>'+
        //             '<div class="ipt_wrap"><select class="select disTg form'+datass+'" id="form'+datass+'">'+departmentList+'</select></div></div>'+
        //             '<div class="form_item"><label>제조/판관 *</label>'+
        //             '<div class="ipt_wrap"><select class="select disTg produce_sales_mgmt'+datass+'" id="produce_sales_mgmt'+datass+'"><option value="" '+mgmtChecked1+'>선택</option><option value="1">제조</option><option value="2" '+mgmtChecked2+'>판매관리</option></select></div></div>'+
        //             '<div class="form_item"><label>비용 귀속 *</label>'+
        //             '<div class="ipt_wrap"><select class="select disTgcost_attribution_company'+datass+'" id="cost_attribution_company'+datass+'">'+companyList+'</select></div></div>'+
        //             '<div class="form_item"><label>iCUBE 부서코드 *</label>'+
        //             '<div class="ipt_wrap"><input type="text" id="icube_code'+datass+'" value="'+icube_code+'" class="ant-input disTg disDrag icube_code'+datass+'" autoComplete="off" style="margin:0;" /></div></div>'+
        //         '</div>'+
        //         '<div class="btn_wrap">'+
        //             '<button class="ant-btn ant-btn-default btn-del" id="btnDel'+datass+'">삭제</button>'+
        //         '</div>'+
        //     '</div></div>';
        // e.element.innerHTML = html;     

        const accId = 'acc' + datass;
        const accBtn = 'btn' + datass;
        const accCont = 'cont' + datass;
        const accTit = 'title' + datass;
        const iptName = 'name' + datass;
        const icubeId = 'icube_code' + datass;
        const delId = 'btnDel' + datass;
        const departmentOptSel = state.departmentOption?.filter(a => e.dataItem.details.form === a.id);
        const companyOptSel = state.companyOption?.filter(a => e.dataItem.details.cost_attribution_company === a.id);

        e.element.innerHTML = '';
        ReactDOM.render(
        <div className={`acc_wrap ${accId}`} id={accId}>
            <span className="btn_acc" id={accBtn}>{inTxt}<i className="ant-menu-submenu-arrow btn_modify"></i></span>
            <div className="accIn" id={accCont}>
                <label>명칭 수정</label>
                <input id={accTit} type="text" name={iptName} className={`ant-input disTg disDrag ${accTit}`} value={inTxt} autoComplete="off" />
                <div className="form_wrap">
                    <div className="form_item">
                        <label>부서 형태 *</label>
                        <div className="ipt_wrap">
                            <wjInput.ComboBox
                                itemsSource={new CollectionView(state.departmentOption, {
                                    currentItem: null
                                })}
                                selectedValuePath="id"
                                displayMemberPath="name"
                                valueMemberPath="id"
                                selectedValue={departmentOptSel[0]?.id}
                                placeholder="선택"
                                style={{width: '100%'}}
                            />
                        </div>
                    </div>
                    <div className="form_item">
                        <label>제조/판관 *</label>
                        <div className="ipt_wrap">
                            <wjInput.ComboBox
                                itemsSource={new CollectionView( state.productionList, {
                                    currentItem: null
                                })}
                                // selectedValue={departmentOptSel[0]?.id}
                                placeholder="선택"
                                style={{width: '100%'}}
                            />
                        </div>
                    </div>
                    <div className="form_item">
                        <label>비용 귀속 *</label>
                        <div className="ipt_wrap">
                            <wjInput.ComboBox
                                itemsSource={new CollectionView( state.companyOption, {
                                    currentItem: null
                                })}
                                selectedValuePath="id"
                                displayMemberPath="name"
                                valueMemberPath="id"
                                selectedValue={companyOptSel[0]?.id}
                                placeholder="선택"
                                style={{width: '100%'}}
                            />
                        </div>
                    </div>
                    <div className="form_item">
                        <label>iCUBE 부서코드 *</label>
                        <div className="ipt_wrap">
                            <input type="text" id={icubeId} className={`ant-input disTg disDrag ${icubeId}`} autoComplete="off" value={icube_code} />
                        </div>
                    </div>
                    <div className="btn_wrap">
                        <button className="ant-btn ant-btn-default btn-del" id={delId}>삭제</button>
                    </div>
                </div>
            </div>
        </div>, 
        e.element);
        
        
        // const elCon = document.getElementsByClassName("disTg");
        // const elDrag = document.getElementsByClassName("disDrag");

        // for (var i = 0; i < elCon.length; i++) {
        //     elCon[i].addEventListener('click', function(e){e.stopPropagation();}, false);
            
        // }
        // //드래그 가능하게 하는
        // for (var i = 0; i < elDrag.length; i++) {
        //     elDrag[i].addEventListener('mousedown', function(e){
        //         setAllowDragging(false);
        //     }, false);

        //     elDrag[i].addEventListener('mouseup', function(e){
        //         setAllowDragging(true);
        //     }, false);
        // }
        
        if(add=== 'add'){ //추가 일때 펼치기
            toggleAction2('btn'+datass,'')
        }
        
        e.element.addEventListener('click', (event) => {
            event.stopPropagation();
            if(event.target.classList.contains('title'+datass)){
                //타이틀수정                
                const nameChange =  document.getElementById("title"+datass);  
                nameChange.addEventListener("keyup", function(event){
                    control.element.querySelector('span').innerHTML = nameChange.value+'<i class="ant-menu-submenu-arrow btn_modify"></i>';
                    control.dataItem.name = nameChange.value;
                    if(inTxt !== nameChange.value && nameChange.value !== '' ){  
                        state.errorChk = '';
                        dataChange(control.dataItem); 
                    } else{
                        state.errorChk = 'btn'+datass;
                    }
                }, false);
            }

            if(event.target.classList.contains('form'+datass)){
                //부서
                const formChange =  document.getElementById("form"+datass);        
                formChange.addEventListener("change", function(event){
                    control.dataItem.form = formChange.value;

                    if(formChange.value !== '' && formChange.value !== undefined){
                        dataChange(control.dataItem);
                    }  
                }, false);
            }

            if(event.target.classList.contains('produce_sales_mgmt'+datass)){
                //제조
                const produceChange =  document.getElementById("produce_sales_mgmt"+datass);        
                produceChange.addEventListener("change", function(event){
                    control.dataItem.produce_sales_mgmt = produceChange.value;

                    if(produceChange.value !== '' && produceChange.value !== undefined){
                        dataChange(control.dataItem);
                    }
                }, false);
            }

            if(event.target.classList.contains('disTgcost_attribution_company'+datass)){
                //비용귀속
                const companyChange =  document.getElementById("cost_attribution_company"+datass);        
                companyChange.addEventListener("change", function(event){
                    control.dataItem.cost_attribution_company = companyChange.value;

                    if(companyChange.value !== '' && companyChange.value !== undefined){
                        dataChange(control.dataItem);
                    }

                }, false);
            }

            if(event.target.classList.contains('icube_code'+datass)){
                //icube_code
                const icubeCodeChange =  document.getElementById("icube_code"+datass);        
                icubeCodeChange.addEventListener("keyup", function(event){
                    control.dataItem.icube_code = icubeCodeChange.value;
                    if(icubeCodeChange.value !== '' && icubeCodeChange.value !== undefined){
                        dataChange(control.dataItem);
                    } 
                }, false);
            }                

            if(event.target.classList.contains('btn-del')){
                onRemoveSel();
                return false;
            }
            if(event.target.classList.contains('disTg')){
                return false;
            }
           
            if(event.target.classList.contains('btn_modify')){
                toggleAction('btn'+datass,'')
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
        const control = e;
        // var elId = s._e.id;
        // var inhtml = e.element.innerHTML;
        var inTxt = e.element.innerText; //일반(ex 개발본부)
        state.inTxt = e.element.innerText;
        e.element.classList.add('wj-node-acc');

        // var datass = e.dataItem.id;
        var datass = e.dataItem.code;

        if(state.companyOption !=='' && state.companyOption !== undefined){
            var checked = '';
            var companyList = '<option value="">선택</option>';
            state.companyOption.forEach(a => {              
                if(e.dataItem.details.cost_attribution_company === a.id){
                    checked ='selected="selected"' 
                }else{
                    checked = '';
                }
                companyList += '<option value="'+a.id+'" '+checked+'>'+a.name+'</option>'
            });
        }

        if(state.departmentOption !=='' && state.departmentOption !== undefined){
            var checked = '';
            var departmentList = '<option value="">선택</option>'
            state.departmentOption.forEach(a => {
                if(e.dataItem.details.form === a.id){
                    checked ='selected="selected"' 
                }else{
                    checked = '';
                }
                departmentList += '<option value="'+a.id+'" '+checked+'>'+a.name+'</option>'
            });
        }
        
        if(e.dataItem.details.produce_sales_mgmt !== '' && e.dataItem.details.produce_sales_mgmt !== undefined){
            var mgmtChecked1 = ''
            var mgmtChecked2 = ''
            if(e.dataItem.details.produce_sales_mgmt === 1){
                mgmtChecked1 = 'selected="selected"'
            }else if(e.dataItem.details.produce_sales_mgmt === 2){
                mgmtChecked2 = 'selected="selected"'
            }
        }
        
        if(e.dataItem.details.icube_code !== '' && e.dataItem.details.icube_code !== undefined && e.dataItem.details.icube_code !== null){
            var icube_code = e.dataItem.details.icube_code
        }else{
            var icube_code = ''
        }

        //옵션 selected
        // var html  = 
        // '<div class="acc_wrap acc'+datass+'" id="acc'+datass+'">'+
        //     '<span class="btn_acc" id="btn'+datass+'">'+ inTxt +'<i class="ant-menu-submenu-arrow btn_modify"></i></span>'+ 
        //     '<div class="accIn" id="cont'+datass+'">'+
        //         '<label>명칭 수정</label>'+
        //         '<input id="title'+datass+'" type="text" name="name'+datass+'" class="ant-input disTg disDrag title'+datass+'" value="'+ inTxt+'" autoComplete="off" />'+
        //         '<div class="form_wrap">'+
        //             '<div class="form_item"><label>부서 형태 *</label>'+
        //             '<div class="ipt_wrap"><select class="select disTg form'+datass+'" id="form'+datass+'" >'+departmentList+'</select></div></div>'+
        //             '<div class="form_item"><label>제조/판관 *</label>'+
        //             '<div class="ipt_wrap"><select class="select disTg produce_sales_mgmt'+datass+'" id="produce_sales_mgmt'+datass+'" ><option value="">선택</option><option value="1" '+mgmtChecked1+'>제조</option><option value="2" '+mgmtChecked2+'>판매관리</option></select></div></div>'+
        //             '<div class="form_item"><label>비용 귀속 *</label>'+
        //             '<div class="ipt_wrap"><select class="select disTgcost_attribution_company'+datass+'" id="cost_attribution_company'+datass+'">'+companyList+'</select></div></div>'+
        //             '<div class="form_item"><label>iCUBE 부서코드 *</label>'+
        //             '<div class="ipt_wrap"><input type="text" id="icube_code'+datass+'" class="ant-input disTg disDrag icube_code'+datass+'" autoComplete="off" style="margin:0;" value="'+icube_code+'"/></div></div>'+
        //         '</div>'+
        //         '<div class="btn_wrap">'+
        //             '<button class="ant-btn ant-btn-default btn-del" id="btnDel'+datass+'">삭제</button>'+
        //         '</div>'+
        //     '</div>'+
        // '</div>';
        // e.element.innerHTML = html;

        const accId = 'acc' + datass;
        const accBtn = 'btn' + datass;
        const accCont = 'cont' + datass;
        const accTit = 'title' + datass;
        const iptName = 'name' + datass;
        const icubeId = 'icube_code' + datass;
        const delId = 'btnDel' + datass;
        const departmentOptSel = state.departmentOption?.filter(a => e.dataItem.details.form === a.id);
        const companyOptSel = state.companyOption?.filter(a => e.dataItem.details.cost_attribution_company === a.id);

        e.element.innerHTML = '';
        ReactDOM.render(
        <div className={`acc_wrap ${accId}`} id={accId}>
            <span className="btn_acc" id={accBtn}>{inTxt}<i className="ant-menu-submenu-arrow btn_modify"></i></span>
            <div className="accIn" id={accCont}>
                <label>명칭 수정</label>
                <input id={accTit} type="text" name={iptName} className={`ant-input disTg disDrag ${accTit}`} value={inTxt} autoComplete="off" />
                <div className="form_wrap">
                    <div className="form_item">
                        <label>부서 형태 *</label>
                        <div className="ipt_wrap">
                            <wjInput.ComboBox
                                itemsSource={new CollectionView(state.departmentOption, {
                                    currentItem: null
                                })}
                                selectedValuePath="id"
                                displayMemberPath="name"
                                valueMemberPath="id"
                                selectedValue={departmentOptSel[0]?.id}
                                placeholder="선택"
                                style={{width: '100%'}}
                            />
                        </div>
                    </div>
                    <div className="form_item">
                        <label>제조/판관 *</label>
                        <div className="ipt_wrap">
                            <wjInput.ComboBox
                                itemsSource={new CollectionView( state.productionList, {
                                    currentItem: null
                                })}
                                // selectedValue={departmentOptSel[0]?.id}
                                placeholder="선택"
                                style={{width: '100%'}}
                            />
                        </div>
                    </div>
                    <div className="form_item">
                        <label>비용 귀속 *</label>
                        <div className="ipt_wrap">
                            <wjInput.ComboBox
                                itemsSource={new CollectionView( state.companyOption, {
                                    currentItem: null
                                })}
                                selectedValuePath="id"
                                displayMemberPath="name"
                                valueMemberPath="id"
                                selectedValue={companyOptSel[0]?.id}
                                placeholder="선택"
                                style={{width: '100%'}}
                            />
                        </div>
                    </div>
                    <div className="form_item">
                        <label>iCUBE 부서코드 *</label>
                        <div className="ipt_wrap">
                            <input type="text" id={icubeId} className={`ant-input disTg disDrag ${icubeId}`} autoComplete="off" value={icube_code} />
                        </div>
                    </div>
                    <div className="btn_wrap">
                        <button className="ant-btn ant-btn-default btn-del" id={delId}>삭제</button>
                    </div>
                </div>
            </div>
        </div>, 
        e.element);





        // const elCon = document.getElementsByClassName("disTg");
        // const elDrag = document.getElementsByClassName("disDrag");

        // for (var i = 0; i < elCon.length; i++) {
        //     elCon[i].addEventListener('click', function(e){e.stopPropagation();}, false);
            
        // }
        // //드래그 가능하게 하는
        // for (var i = 0; i < elDrag.length; i++) {
        //     elDrag[i].addEventListener('mousedown', function(e){
        //         setAllowDragging(false);
        //     }, false);

        //     elDrag[i].addEventListener('mouseup', function(e){
        //         setAllowDragging(true);
        //     }, false);
        // }
        
        e.element.addEventListener('click', (event) => {
            event.stopPropagation();

            if(event.target.classList.contains('title'+datass)){
                //타이틀수정                
                const nameChange =  document.getElementById("title"+datass);  
                nameChange.addEventListener("keyup", function(event){
                    control.element.querySelector('span').innerHTML = nameChange.value+'<i class="ant-menu-submenu-arrow btn_modify"></i>';
                    control.dataItem.name = nameChange.value;
                    if(inTxt !== nameChange.value && nameChange.value !== '' ){  
                        state.errorChk = '';
                        dataChange2(control.dataItem); 
                    } else{
                        state.errorChk = 'btn'+datass;
                    }
                }, false);
            }

            if(event.target.classList.contains('form'+datass)){
                //부서
                const formChange =  document.getElementById("form"+datass);        
                formChange.addEventListener("change", function(event){
                    control.dataItem.form = formChange.value;

                    if(formChange.value !== '' && formChange.value !== undefined){
                        dataChange2(control.dataItem);
                    }  
                }, false);
            }

            if(event.target.classList.contains('produce_sales_mgmt'+datass)){
                //제조
                const produceChange =  document.getElementById("produce_sales_mgmt"+datass);        
                produceChange.addEventListener("change", function(event){
                    control.dataItem.produce_sales_mgmt = produceChange.value;

                    if(produceChange.value !== '' && produceChange.value !== undefined){
                        dataChange2(control.dataItem);
                    }
                }, false);
            }

            if(event.target.classList.contains('disTgcost_attribution_company'+datass)){
                //비용귀속
                const companyChange =  document.getElementById("cost_attribution_company"+datass);        
                companyChange.addEventListener("change", function(event){
                    control.dataItem.cost_attribution_company = companyChange.value;

                    if(companyChange.value !== '' && companyChange.value !== undefined){
                        dataChange2(control.dataItem);
                    }

                }, false);
            }

            if(event.target.classList.contains('icube_code'+datass)){
                //icube_code
                const icubeCodeChange =  document.getElementById("icube_code"+datass);      

                icubeCodeChange.addEventListener("keyup", function(event){
                    control.dataItem.icube_code = icubeCodeChange.value;
                    if(icubeCodeChange.value !== '' && icubeCodeChange.value !== undefined){
                        dataChange2(control.dataItem);
                    } 
                }, false);
            }                

            if(event.target.classList.contains('btn-del')){
                onRemoveSel2();
                return false;
            }
            if(event.target.classList.contains('disTg')){
                return false;
            }
           
            if(event.target.classList.contains('btn_modify')){
                toggleAction('btn'+datass,'')
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

    //현재 구성 내용수정
    // const dataChange=(val,parentID)=>{        
    //     console.log(toJS(val))        
    //     if(state.upData.length >0 ) { //업뎃데이터가 있을경우
    //         state.upData = [...state.upData, val]
    //     }else{
    //         state.upData = [val]
    //         // state.upData= [{id : val.id, parent_code : val.parent_code, name : val.name, depth : val.depth, ordnum : val.ordnum, use_yn : val.use_yn, 
    //         //     details : 
    //         //         {form:val.form,produce_sales_mgmt:val.produce_sales_mgmt,cost_attribution_company:val.cost_attribution_company,icube_code:val.icube_code }
    //         //     }];
    //     }

    //     console.log(toJS(state.upData))
    // }

    const dataChange=(val)=>{
        var chk = false;
        if(state.upData.length >0 ) { //업뎃데이터가 있을경우
            for (let i = 0; i< state.upData.length; i++) {
                if(state.upData[i].newChk !== ''){
                    if(state.upData[i].id === val.id && state.upData[i].newChk === val.newChk){ 
                        state.upData[i].name = val.name
                        state.upData[i].details.form = val.form
                        state.upData[i].details.produce_sales_mgmt = val.produce_sales_mgmt
                        state.upData[i].details.cost_attribution_company = val.cost_attribution_company
                        state.upData[i].details.icube_code = val.icube_code
                        chk = false;
                        break;                     
                    }else{
                        chk = true;
                    }
                }else{
                    if(state.upData[i].id === val.id ){ 
                        state.upData[i].name = val.name
                        state.upData[i].details.form = val.form
                        state.upData[i].details.produce_sales_mgmt = val.produce_sales_mgmt
                        state.upData[i].details.cost_attribution_company = val.cost_attribution_company
                        state.upData[i].details.icube_code = val.icube_code
                        chk = false;
                        break;                     
                    }else{
                        chk = true;
                    }
                }                
            }
            if(chk == true){ //업뎃 데이터에 추가
                if(val.newChk !== '' && val.newChk !== undefined){
                    state.upData= [...state.upData, {id : val.id, parent_code : val.parent_code, name : val.name, depth : val.depth, ordnum : val.ordnum, use_yn : val.use_yn , newChk:val.newChk,
                        details : 
                            {id : val.id,  form:val.form,produce_sales_mgmt:val.produce_sales_mgmt,
                                cost_attribution_company:val.cost_attribution_company,icube_code:val.icube_code }
                        }];
                }else{
                    state.upData= [...state.upData, {id : val.id, parent_code : val.parent_code, name : val.name, depth : val.depth, ordnum : val.ordnum, use_yn : val.use_yn, 
                        details : 
                            {id : val.id,  form:val.form,produce_sales_mgmt:val.produce_sales_mgmt,
                                cost_attribution_company:val.cost_attribution_company,icube_code:val.icube_code }
                        }];
                }
                
            }
        }else{ //업뎃 데이터가 없을경우
            if(val.newChk !== '' && val.newChk !== undefined){
                state.upData= [{id : val.id, parent_code : val.parent_code, name : val.name, depth : val.depth, ordnum : val.ordnum, use_yn : val.use_yn , newChk:val.newChk,
                    details : 
                        {id : val.id,  form:val.form,produce_sales_mgmt:val.produce_sales_mgmt,
                            cost_attribution_company:val.cost_attribution_company,icube_code:val.icube_code }
                    }];
            }else{
                state.upData= [{id : val.id, parent_code : val.parent_code, name : val.name, depth : val.depth, ordnum : val.ordnum, use_yn : val.use_yn, 
                                details : 
                                    {id : val.id,  form:val.form,produce_sales_mgmt:val.produce_sales_mgmt,
                                        cost_attribution_company:val.cost_attribution_company,icube_code:val.icube_code }
                                }];
            }
            
        }
    }

    //수정 예정 내용수정
    const dataChange2=(val)=>{
        var chk = false;
        if(state.moUpData.length >0 ) { //업뎃데이터가 있을경우
            for (let i = 0; i< state.moUpData.length; i++) {
                if(state.moUpData[i].id === val.id ){ 
                    state.moUpData[i].name = val.name
                    state.moUpData[i].details.form = val.form
                    state.moUpData[i].details.produce_sales_mgmt = val.produce_sales_mgmt
                    state.moUpData[i].details.cost_attribution_company = val.cost_attribution_company
                    state.moUpData[i].details.icube_code = val.icube_code
                    chk = false;
                    break;                     
                }else{
                    chk = true;
                }
            }
            if(chk == true){ //업뎃 데이터에 추가
                state.moUpData= [...state.moUpData, {id : val.id, parent_code : val.parent_code, name : val.name, depth : val.depth, ordnum : val.ordnum, use_yn : val.use_yn, 
                    details : 
                        {id : val.id,  form:val.form,produce_sales_mgmt:val.produce_sales_mgmt,
                            cost_attribution_company:val.cost_attribution_company,icube_code:val.icube_code }
                    }];
                
            }
        }else{ //업뎃 데이터가 없을경우
            state.moUpData= [{id : val.id, parent_code : val.parent_code, name : val.name, depth : val.depth, ordnum : val.ordnum, use_yn : val.use_yn, 
                            details : 
                                {id : val.id,  form:val.form,produce_sales_mgmt:val.produce_sales_mgmt,
                                    cost_attribution_company:val.cost_attribution_company,icube_code:val.icube_code }
                            }];
            
        }
    }
    
    const onRemoveSel = (e) => {
        var control = state.treeControl;
        if (control.selectedItem) {
            if(control.selectedItem.newChk !=='' && control.selectedItem.newChk !== undefined){
                state.upData = state.upData.filter(e=>e.newChk !== control.selectedItem.newChk)
            }else{
                control.selectedItem.use_yn = 'N'
                dataChange(control.selectedItem)
            }    

            // find the array that contains the item to be removed
            var parent = control.selectedNode.parentNode;
            var arr = parent
                ? parent.dataItem[control.childItemsPath]
                : control.itemsSource;
            // remove the item from the parent collection
            var index = arr.indexOf(control.selectedItem);
            arr.splice(index, 1);
            // refresh the tree
            control.loadTree();
        }
    }

    const onRemoveSel2 = (e) => {
        var control = state.treeControl2;
        if (control.selectedItem) {
            if(control.selectedItem.newChk !=='' && control.selectedItem.newChk !== undefined){
                state.moUpData = state.moUpData.filter(e=>e.newChk !== control.selectedItem.newChk)
            }else{
                control.selectedItem.use_yn = 'N'
                dataChange2(control.selectedItem)
            }  
            // find the array that contains the item to be removed
            var parent = control.selectedNode.parentNode;
            var arr = parent
                ? parent.dataItem[control.childItemsPath]
                : control.itemsSource;
            // remove the item from the parent collection
            var index = arr.indexOf(control.selectedItem);
            arr.splice(index, 1);
            // refresh the tree
            control.loadTree();
        }
    }

    const disabledDate = (current,e) => {
        return moment().add(-1, 'days')._d > current._d;
    };        

    const handleDelete = useCallback(async (e)=> {
        var axios = require('axios');

        var config={
            method:'DELETE',
            url:process.env.REACT_APP_API_URL +'/api/v1/department-code-logs?effectived_at='+moment(stateData.effectivedListVal).format('YYYY-MM-DD'),
            headers:{
                'Accept':'application/json',
            },
                
            };
            
        axios(config)
        .then(function(response){
            Modal.success({
                title:response.data.result,
                onOk(){                                
                    eFetchData();
                    // stateData.effectived_at='';
                    stateData.effectivedListVal='선택하세요.';
                    state.modifyData=[];
                    state.moUpData=[];
                },
            });
        })
        .catch(function(error){
            console.log(error.response.status);
            Modal.error({
                title : '등록시 문제가 발생하였습니다.',
                content : '오류코드:'+error.response.status
            });  
        });
    }, []);

    //현재 구송과 수정취소
    const handleReset = useCallback(() => {
        Modal.warning({
            title: '이 창의 입력 내용이 삭제됩니다.',
            content: '그래도 계속 하시겠습니까?',
            onOk() {
                fetchData();
                state.errorChk=''
                stateData.theInput=''
                state.upData=[]
                state.valChk = 0
            },
        });

    }, []);

    //등록
    const handleSubmit = useCallback(async (e)=> {
        console.log(toJS(state.upData)); 

        var nameChk = [];
        var chk = 0;
        state.upData.forEach(a => {
            if(a.child.length > 0){
                a.child.forEach(e => {
                    if(e.children !=='' && e.children !== undefined){
                        if(e.children.length > 0){
                            e.children.forEach(i => {
                                if(i.details){
                                    if(i.details.form ==='' || i.details.form === undefined){
                                        chk++;                        
                                    }
                                    if(i.details.produce_sales_mgmt ==='' || i.details.produce_sales_mgmt === undefined){
                                        chk++;
                                    }
                                    if(i.details.cost_attribution_company ==='' || i.details.cost_attribution_company === undefined){
                                        chk++;
                                    }
                                    if(i.details.icube_code ==='' || i.details.icube_code === undefined){
                                        chk++;
                                    }                
                                }
                                if(chk > 0){
                                    nameChk = [...nameChk, i.name]
                                }
                            });
                        }
                    }
                    else{
                        if(e.details){
                            if(e.details.form ==='' || e.details.form === undefined){
                                chk++;                        
                            }
                            if(e.details.produce_sales_mgmt ==='' || e.details.produce_sales_mgmt === undefined){
                                chk++;
                            }
                            if(e.details.cost_attribution_company ==='' || e.details.cost_attribution_company === undefined){
                                chk++;
                            }
                            if(e.details.icube_code ==='' || e.details.icube_code === undefined){
                                chk++;
                            }                
                        }
                        if(chk > 0){
                            nameChk = [...nameChk, e.name]
                        }
                    }
                });
            }
            
        });
return
        if(state.errorChk ){
            // message.warning('명칭은 빈값일 수 없습니다.');
            Modal.error({
                title : '명칭은 빈값일 수 없습니다.',
            });
        }else{
            if(chk > 0){
                Modal.warning({
                    title : '아래 명칭의 부서형태, 제조/판관, 비용귀속, iCUBE 부서코드 데이터를 입력해주세요.',
                    content: '명칭 :'+nameChk.join(', ')
                });
            }else{
                // return
                if(stateData.effectived_at !== '' && stateData.effectived_at !== undefined){
                    var effectived_at = moment(stateData.effectived_at).format('YYYY-MM-DD');
                    
                    // return
                    if(state.upData.length > 0){
                        if(state.today < effectived_at){
                            var url = '/api/v1/department-code-logs?effectived_at='+effectived_at
                        }else{
                            var url ='/api/v1/department-codes'
                        }

                        var axios = require('axios');

                        var config={
                            method:'POST',
                            url:process.env.REACT_APP_API_URL +url,
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
                                        state.errorChk=''
                                        state.upData=[]
                                        state.effectived_list = [];
                                        eFetchData(effectived_at);       
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
                }else{
                    Modal.warning({
                        title: '적용일을 선택해주세요.'
                    });  
                }           
            } 
        }
    }, []);  

    //수정 예정과이력 취소
    const handleEffectivedReset= useCallback(() => {
        Modal.error({
            title: '작업했던 내용들이 초기화됩니다.',
            content: '그래도 계속 하시겠습니까?',
            onOk() {
                fetchData(stateData.effectivedListVal);
                state.moUpData=[]
                state.modifyData = []
                stateData.effectivedListVal = '선택하세요.'
            },
        });

    }, []);

    const handleEffectivedSubmit = useCallback(async (e)=> {
        console.log(toJS(state.moUpData)); 

        // return
        if(stateData.effectivedListVal !== '' && stateData.effectivedListVal !== undefined){
            var effectived_at = moment(stateData.effectivedListVal).format('YYYY-MM-DD');
            // console.log(effectived_at)
            // return
            if(state.moUpData.length > 0){
                var axios = require('axios');

                var config={
                    method:'PUT',
                    url:process.env.REACT_APP_API_URL +'/api/v1/department-code-logs?effectived_at='+effectived_at,
                    headers:{
                        'Accept':'application/json',
                    },
                        data:state.moUpData
                    };
                    
                axios(config)
                .then(function(response){
                    if(response.data.id !== '' && response.data.id !== undefined){
                        Modal.success({
                            title:response.data.result,
                            onOk(){                                
                                fetchData(effectived_at);
                                state.moUpData=[]
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
        }else{
            Modal.warning({
                title: '적용일을 선택해주세요.'
            });  
        }            
    }, []);  

    //트리뷰 모두 펼치기
    const onExpandedItem =(s, e) => {
        s.collapseToLevel(10);
    }

    const [allowDragging, setAllowDragging] = useState(true);
    const [allowDragging2, setAllowDragging2] = useState(true);

    return (
        <Wrapper>
            <Card className="card-box adm_department_wrap">
                <Row gutter={20} className="adm_code_wrap">
                    <Col className="gutter-row" span={12}>
                        <Card title="현재 구성과 수정">
                            <div className="container_treeview onlylist">
                                <wjNav.TreeView 
                                    id="treeCrt"
                                    isReadOnly={false} 
                                    isContentHtml={true}
                                    itemsSource={state.crtData} 
                                    displayMemberPath="name"
                                    childItemsPath={'child,children'.split(',')}
                                    showCheckboxes={false} 
                                    allowDragging={allowDragging}
                                    collapseWhenDisabled={true}
                                    dragEnd={onDragEnd.bind(this)} 
                                    initialized={initialized.bind(this)}                          
                                    formatItem={onFormatItem.bind(this)} 
                                    loadedItems={onExpandedItem.bind(this)}
                                />

                                <div className="add_ipt_wrap">
                                    <Input id="theInput" value={stateData.theInput} onChange={handleChangeInput('theInput')} />
                                    <Button type="primary" onClick={(e)=>{addNode(0, 0)}}>+</Button>
                                </div>
                            </div>
                        </Card>
                        <Row style={{marginTop:'20px'}}>
                            <Col xs={24} lg={24} style={{justifyContent:'space-between'}}>
                                <Space direction="horizontal" style={{width:'50%'}}>
                                    <label>적용일</label>
                                    <DatePicker disabledDate={disabledDate.bind(this)} onChange={handleChangeDate('effectived_at')} defaultValue={moment(stateData['effectived_at'])}  />
                                </Space>
                                <Space direction="horizontal" style={{width:'50%',justifyContent:'right'}}>
                                    <Button type="primary" onClick={()=>handleSubmit()}>확인</Button>
                                    <Button onClick={handleReset}>취소</Button>
                                </Space>
                            </Col>
                        </Row>
                    </Col>
                    <Col className="gutter-row" span={12}>
                        <Card title="수정 예정과 이력">
                            <div className="titleOpt">
                                {/* <DatePicker defaultValue={moment('2023-01-06')} format={'YYYY-MM-DD'} value={stateData.effectived_list} /> */}
                                {/* <DatePicker onChange={handleChangeDate.bind(this,'effectived_list')} defaultValue={moment(stateData['effectived_list'])} value={moment(stateData['effectived_list'])} /> */}
                                {/* <Select style={{width : 150}} onChange={handleChangeDate.bind(this,'effectived_list')} defaultValue={stateData.effectivedListVal !== '' && stateData.effectivedListVal !== undefined ? stateData.effectivedListVal :  "선택하세요."}> */}
                                {/* <Select style={{width : 150}} onChange={handleChangeDate.bind(this,'effectived_list')} defaultValue="선택하세요." value={stateData.effectivedListVal}>
                                    {state.effectived_list !== '' && state.effectived_list !== undefined
                                        ?
                                        state.effectived_list.map((e) => (
                                            <>
                                                <Option style={moment(stateData.tomorrow).format('YYYY-MM-DD') === e ? {color : 'red'}: {color : '000000D9'}} value={e}>{e}</Option>
                                            </>
                                        ))
                                        :<>
                                            <Option>선택해주세요.</Option>
                                        </>
                                    }
                                    
                                </Select>*/}
                                <wjInput.ComboBox
                                    itemsSource={state.effectived_list} 
                                    isAnimated={false} 
                                    isDroppedDown={false}
                                    placeholder="선택하세요."
                                    selectedValue={stateData.effectivedListVal}
                                    // selectedIndexChanged={handleChangeDate.bind(this,'effectived_list')}
                                    selectedIndexChanged={handleChangeDate('effectived_list')}
                                />

                            </div>
                            <div className="container_treeview onlylist">
                            <wjNav.TreeView 
                                id="treeModify"
                                isReadOnly={false} 
                                itemsSource={state.modifyData} 
                                displayMemberPath="name" 
                                childItemsPath={'child,children'.split(',')}
                                showCheckboxes={false} 
                                collapseWhenDisabled={false}
                                allowDragging={allowDragging2}
                                dragEnd={onDragEnd2.bind(this)}
                                initialized={initialized2.bind(this)}                          
                                formatItem={onFormatItem2.bind(this)} 
                            />
                            </div>
                            
                        </Card>
                        <Row style={{marginTop:'20px'}}>
                            <Col xs={24} lg={24} style={{justifyContent:'space-between'}}>
                                <Space direction="horizontal" style={{width:'100%',justifyContent:'right'}}>
                                    <label>변경 예정사항</label>
                                    <Button type="primary" onClick={()=>handleEffectivedSubmit()}>확인</Button>
                                    <Button danger onClick={()=>handleDelete()}>삭제</Button>
                                    <Button onClick={handleEffectivedReset}>취소</Button>
                                </Space>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>
        </Wrapper>
    );
});

export default Adm_department;