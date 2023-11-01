/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect,useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Breadcrumb,  Row, Col, Input,  Card, Button, Collapse,Modal} from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import { toJS } from 'mobx';
import axios from 'axios';

import useStore from '@stores/useStore';

import * as wjNav from '@grapecity/wijmo.react.nav';
import * as WjcNav from "@grapecity/wijmo.nav";
import { format } from 'morgan';

const { Panel } = Collapse;

const Wrapper = styled.div`
  width: 100%;
`;

const Adm_menu = observer(() => {
    const { commonStore } = useStore();
    const state = useLocalStore(() => ({
        treeControl: [],
        selParentNode:'',
        menuDataN: [],
        menuDataY: [],
        menuDataUpdate: [],
        allowDragging : true,
        treeData1 : [
            { code:'codenum110',label: 'MENU', chkType:"add" },
            { code:'codenum120',label: 'MENU', chkType:"add" },
            { code:'codenum130',label: 'MENU', chkType:"add" },
        ],
        treeData2 : [
            { code:'codenum210', label: 'test1' },
            { code:'codenum220', label: 'test2', children : [
                { code:'codenum221', label:'test2-1', children : [
                    { code:'codenum221', label:'test2-1-1'},
                ]},
                { code:'codenum222', label:'test2-2'},
            ]},
            { code:'codenum230', label: 'test3' },
            { code:'codenum240', label: 'test4' , children : [
                { code:'codenum241', label:'test4-1'},
            ]},
            { code:'codenum250', label: 'test5' },
        ]

    }));

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = useCallback(async () => {

    }, []);

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

    const formtemplete = (datass, inTxt ) => {
        var html  = '<div class="acc_wrap" id="acc'+datass+'"><span class="btn_acc" id="btn'+datass+'">'+ inTxt +'<i class="ant-menu-submenu-arrow btn_modify"></i></span>'+ 
        '<div class="accIn" id="cont'+datass+'">'+
            '<input type="text" name="name'+datass+'" class="ant-input disTg" value="'+ inTxt+'" autoComplete="off" />'+
        '</div></div>';
        return html;
    }

    const onFormatItem = (s, e) => {
        var inhtml = e.element.innerHTML;
        var inTxt = e.element.innerText;
        e.element.classList.add('wj-node-acc');
        if(e._data.children==null){
            e.element.classList.add('wj-node-page');
        }
        var datass = e.dataItem.code;

        e.element.innerHTML = formtemplete(datass,inTxt);
    
        e.element.addEventListener('click', (event) => {
            event.stopPropagation();
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

    const initialized = (idx, control) => {
        state.treeControl.push(control);
    }

    const addNode = (idx, depth) => { //추가  
        //state.allowDragging = false;
        state.treeControl[0].selectedNode = null;
        let newTitle = document.getElementById("theInput").value;
        
        if(newTitle != ""){
            var control = state.treeControl[idx];
            var newItem = { chkType :"add" ,label: newTitle,code:"codenum250"};
            var index = control.nodes ? control.nodes.length : 0;
            control.selectedNode = control.addChildNode(index, newItem);

            // state.menuDataN[num] = {chkType :"add" , label: newTitle, depth: "1",key: "",memo :"", link:"" , pa_key:"", ordnum: index, reg_yn:"N"};
        }
    }

    const onDragStart = (s, e) => {
        if(s.selectedNode.parentNode) state.selParentNode = s.selectedNode.parentNode;
        if (e && e.node && e.node.hasChildren) {

        }
    }

    const onDragOver = (s, e) => {
        var t1 = e.dragSource.treeView;
        var t2 = e.dropTarget.treeView;
       
        if (t1 != t2 ) {
            e.cancel = false;
        }
        if(t2._e.id=="waitMenu"){
            if (!e.dropTarget.hasChildren && e.position == WjcNav.DropPosition.Into) {
                e.position = WjcNav.DropPosition.Before;
            }
        }
    }


    const onDragEnduseN = (s, e) => { //마우스 놓았을때(미사용)
       
        var control = s.selectedNode;

        if(control.dataItem.chkType != "add"){//이동
            control.dataItem.chkType = "add";
            control.element.classList.remove('wj-node-acc', 'wj-node-page');
            control.element.innerHTML = '<span class="wj-node-text">'+control.dataItem.label+'</span>';
            if(state.selParentNode.hasChildren == false){ //이전 자리 부모노드가 자식이 없으면
                state.selParentNode.element.classList.add("wj-node-page");
            }
        }

        console.log(control)
        

    }

    const onDragEnd = (s, e) => { //마우스 놓았을때(사용)
        var control = s.selectedNode;

        if(control.level>0){//부모창이 있음
            if(control.parentNode._e.classList.contains('wj-node-page')) control.parentNode._e.classList.remove("wj-node-page");
        }

        if(control.dataItem.chkType == "add"){//추가 노드
            console.log("add")
            control.dataItem.chkType = "";
            
            var inTxt = control.dataItem.label;
            var datass = control.dataItem.code;
            control.element.classList.add('wj-node-acc', 'wj-node-page');
            control.element.innerHTML = formtemplete(datass,inTxt);
            control.element.addEventListener('click', (event) => {
                event.stopPropagation();
                if(event.target.classList.contains('disTg')){
                    return false;
                }
                if(event.target.classList.contains('btn_modify')){
                    toggleAction('btn'+datass,'')
                }
            });
        }else{//기존 노드
            if(state.selParentNode.hasChildren == false){ //이전 자리 부모노드가 자식이 없으면
                state.selParentNode.element.classList.add("wj-node-page");
            }
        }

        
        // // e.element.removeEnevtListener('keypress',false)
        // control.element.addEventListener('keypress', (event) => {
        //     event.stopPropagation();
        // });
        // control.element.addEventListener('keydown', (event) => {
        //     event.stopPropagation();
        // });

        //control.parentNode._e.classList.remove("wj-node-page")

        // if(control.parentNode != "" && control.parentNode != null){ //부모값이 있으면
        //     control.itemsSource.forEach(element => {
        //     element['pa_key'] = control.parentNode.dataItem.key;
        //     element['ordnum'] = control.index+1;
        //     element['reg_yn'] = "Y";
        //     if(element['chkType'] != "add"){
        //         element['parent_label'] = control.parentNode.dataItem.label;
        //         if(control.parentNode.dataItem.depth >= element['depth']){
        //         element['depth'] = Number(element['depth']) + 1;
        //         }
        //         element['parent_depth'] = control.parentNode.dataItem.depth;
        //     }else{
        //         if(control.parentNode.dataItem.depth >= element['depth']){
        //         element['depth'] = Number(element['depth']) + 1;
        //         }
        //     }
        //     });

        // }else{    
        //     control.itemsSource.forEach(element => {
        //     element['pa_key'] = "";
        //     if(element['chkType'] == "add"){
        //         element['ordnum'] = control.index+1;
        //     }
        //     element['depth'] = "1";
        //     element['reg_yn'] = "Y";
        //     });
        // } 

        // if(control.dataItem.chkType == "add"){     //새로추가일 경우  
        //     var num = 0;
        //     if(state.menuDataY == ""){
        //     num = 0;
        //     }else{
        //     num = state.menuDataY.length;
        //     }
            
        //     var chk = true;
        //     var i= 0;
        //     for(i=0; i < state.menuDataY.length; i++){
        //     if(state.menuDataY[i].label == control.dataItem.label){
        //         state.menuDataY[i].array =  control.itemsSource;
        //         chk = false;
        //         break;
        //     }else{
        //         chk = true;
        //     }
        //     } 
        
        //     if(chk == true){
        //     state.menuDataY[num] = {label : control.dataItem.label, array: control.itemsSource};
        //     //state.menuDataY[num] = {chkType :"add" ,label: control.dataItem.label, key: "",memo :"", link:"", pa_key:"", ordNum: "", reg_yn:"Y"};
        //     }

        //     //미사용 array에서 값 삭제
        //     for(i=0; i < state.menuDataN.length; i++){
        //     if(state.menuDataN[i].label == control.dataItem.label){
        //         state.menuDataN[i] =  '';
        //         state.menuDataN.splice(j,1);  
        //         break;        
        //     }
        //     }
        // }else{ //기존데이터 수정일경우
            
        //     if(state.menuDataUpdate.length == 0){
        //     state.menuDataUpdate[0] = {label : control.dataItem.label,array: control.itemsSource};
        //     }else{
        //     var i= 0;
        //     for(i=0; i < state.menuDataUpdate.length; i++){
        //         if(state.menuDataUpdate[i].label == control.dataItem.label){
        //         state.menuDataUpdate.splice(i,1);  
        //         break;  
        //         }
        //     }

        //     var num = state.menuDataUpdate.length++;    
        //     state.menuDataUpdate[num] = {label : control.dataItem.label, array: control.itemsSource};
            
        //     }       

        //     //기존 메뉴를 새로 추가한 데이터에 넣었을 경우
        //     var i= 0;
        //     var j= 0;
        //     for(i=0; i < state.menuDataY.length; i++){
        //     for(j=0; j < state.menuDataY[i].array.length; j++){
        //         if(state.menuDataY[i].array[j].label == control.dataItem.label){
        //         state.menuDataY[i].array.splice(j,1);  
        //         break;        
        //         }        
        //     }    
        //     }

        // }

        // console.log(toJS(state.menuDataY));
        // console.log(toJS(state.menuDataUpdate));
    }

    const onTreeExpandedLoadedItems = (s, e) => {
        s.collapseToLevel(10);
    }

    const admin_proc = async() => {
        console.log(toJS(state.menuDataN));
        console.log( toJS(state.menuDataY));
        console.log( toJS(state.menuDataUpdate));

        //등록후 이동가능
        state.allowDragging = true;
        // var config={
        //   method:'put',
        //   url:process.env.REACT_APP_API_URL +'/api/v1/menu',
        //   headers:{
        //       'Accept':'application/json',
        //       'Content-Type':'application/json',
        //   },
        //       data:updata
        //   };
            
        //   axios(config)
        //   .then(function(response){
        //       console.log(JSON.stringify(response.data));
        //       if(response.data.user != '' && response.data.info != ''){
        //           Modal.success({
        //               content: '수정이 완료되었습니다.',
        //           });
        //       }else{
        //           Modal.error({
        //               content: '수정시 문제가 발생하였습니다. 재시도해주세요. ',        
        //           });  
        //       }
        //   })
        //   .catch(function(error){
        //       Modal.error({
        //           content: '수정시 문제가 발생하였습니다. 재시도해주세요. ',        
        //       });
        //   });
        return;
        commonStore.loading = true;
 
        const result = await commonStore.handleApi({
            method: 'POST',
            url: 'admin/menu_proc',
            data : {
            '1depth' : state.menuDataN,
            '2depth' : state.menuDataY,
            'updata' : state.menuDataUpdate,
            },
        });

        if (result) {
            if(result.type == "success"){
            Modal.success({
                content: result.data.result,
            });
            state.menuDataN =[];
            state.menuDataY =[];
            state.menuDataUpdate =[];
            }else{
            Modal.error({
                content: '오류가 발생했습니다. 재시도해주세요.',
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


    return (
        <Wrapper>
            <Card className="card-box adm_menu_wrap">
                <Row gutter={20} className="adm_code_wrap">
                    <Col className="gutter-row" span={8}>
                        <Card title="등록 대기 중 메뉴">
                        <div className="container_treeview onlylist">
                            <wjNav.TreeView id="waitMenu" itemsSource={state.treeData1} dataItem={state.treeData1} displayMemberPath="label" imageMemberPath="img" 
                            showCheckboxes={false} allowDragging={state.allowDragging} dragStart={onDragStart.bind(this)} dragOver={onDragOver.bind(this)} 
                            dragEnd={onDragEnduseN.bind(this)} initialized={initialized.bind(this, 0)} />
                            <div className="add_ipt_wrap">
                                <Input id="theInput" />
                                <Button type="primary" onClick={(e)=>{addNode(0, 0);}}>+</Button>
                            </div>
                        </div>
                        </Card>
                    </Col>
                    <Col className="gutter-row unit" span={1}>
                        <div className="inner"><RightOutlined /></div>
                    </Col>
                    <Col className="gutter-row last-treeview" span={15}>
                        <Card title="등록된 메뉴">
                        <div className="container_treeview">
                            <wjNav.TreeView id="registMenu" itemsSource={state.treeData2} dataItem={state.treeData2} displayMemberPath="label" childItemsPath="children"  
                            showCheckboxes={false} allowDragging={state.allowDragging} dragStart={onDragStart.bind(this)} 
                            dragOver={onDragOver.bind(this)} dragEnd={onDragEnd.bind(this)} formatItem={onFormatItem.bind(this)} loadedItems={onTreeExpandedLoadedItems.bind(this)}
                            initialized={initialized.bind(this, 2)} />
                        </div>
                        </Card>
                    </Col>
                </Row>
                <Row gutter={[20]} style={{ marginTop: 30 }}>
                    <Col span={15} offset={9}>
                        <Row gutter={[10]} justify="center">
                            <Col>
                                <Button type="primary" onClick={admin_proc}>확인</Button>
                            </Col>
                            <Col >
                                <Button onClick={handleReset}>취소</Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                
            </Card>


        </Wrapper>
    );
});

export default Adm_menu;
