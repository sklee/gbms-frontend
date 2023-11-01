/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Breadcrumb, Form, Row, Col, Input, Space , Tabs, Card, Button, Collapse} from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';

import * as wjNav from '@grapecity/wijmo.react.nav';
import * as WjcNav from "@grapecity/wijmo.nav";
import { format } from 'morgan';

const { Panel } = Collapse;

const Wrapper = styled.div`
  width: 100%;
`;

const treeData = [
  {
    header: '보고서 1',
  },
  {
    header: '통계 유형 2',
  },
];
const treeData2 = [{
    header: '개발본부',
    txts:'',
    items: [
      { 
        header: '어학실' , 
        txts:'',
        items:[
          {
            header:'성인어학 1팀',
            txts:''
          },
          {
            header:'성인어학 2팀',
            txts:''
          }
        ]
      },
    ]
  }
];


const Adm_menu = observer(() => {
  const { commonStore } = useStore();
  const state = useLocalStore(() => ({
    treeControl: [],
  }));


  useEffect(() => {
    // function watchScroll() {
    //   document.getElementByClassName('btn_acc').addEventListener("click", accToggleEct);
    // }
    // watchScroll();
    // return () => {
    //   document.getElementByClassName('btn_acc').removeEventListener("click", accToggleEct);
    // };
  });
  

  const onDragStart = (s, e) => {
    if (e && e.node && e.node.hasChildren) {
        //e.cancel = true; // prevent dragging parent nodes
      //e.node.isCollapsed = true; // collapse parent nodes when dragging
    }
  }
  const onDragOver = (s, e) => {
    if (!e.dropTarget.hasChildren && e.position == WjcNav.DropPosition.Into) {
        e.position = WjcNav.DropPosition.Before;
    }
  }

  const addNode = (idx, depth) => {
    let newTitle = document.getElementById("theInput").value;
    if(idx == 1){
      newTitle = document.getElementById("theInput2").value;
    }else if(idx == 2){
      newTitle = document.getElementById("theInput3").value;
    }
    
    if(newTitle != ""){
      var control = state.treeControl[idx]
      var newItem = { header: newTitle }, node = control.selectedNode;
      if (depth != 0) {
          var index = node.nodes ? node.nodes.length : 0;
          control.selectedNode = node.addChildNode(index, newItem);
      }
      else {
        var index = control.nodes ? control.nodes.length : 0;
        control.selectedNode = control.addChildNode(index, newItem);
      }
    }
  }

  const onFormatItem = (s, e) => {
    var inhtml = e.element.innerHTML;
    var inTxt = e.element.innerText;

    // var el = document.getElementById('cloneEl').children;
    // var cloneObj = Object.assign({}, el);
    // Set up the button
    e.element.classList.add('wj-node-acc');
    e.element.innerHTML = '<div class="acc_wrap"><span class="btn_acc">'+ inTxt +'<i class="ant-menu-submenu-arrow"></i></span> <div class="accIn"><input type="text" className="ant-input" /></div></div>';
    // e.element.innerHTML = cloneObj;

    // var buttonEl = document.getElementsByClassName('btn_acc');
    // buttonEl.addEventListener('click', () => alert("Hi user!"));


    
  }

  const initialized = (idx, control) => {
    // if(idx == 0){
    //   state.fstTreeControl.push(control);  
    // }else if(idx==3){
    //   state.lstTreeControl.push(control);
    // }

    state.treeControl.push(control);
    // state.treeControl[0].selectedItem = state.treeControl[0].itemsSource[0];
    // console.log(state.treeControl[idx].selectedItem);

  }

  const onItemClicked = (e) => {
    // e.selectedNode.element.getelementByClassName("acc_wrap").classList.add('on');
    //state.isActive ? true : false;
    
    if(e.selectedNode.element.classList.contains('active')){
      e.selectedNode.element.classList.remove('active');
    }else{
      e.selectedNode.element.classList.add('active');
    }
  }

  


  

  return (
    <Wrapper>
      <Breadcrumb>
        <Breadcrumb.Item>Home</Breadcrumb.Item>
        <Breadcrumb.Item>관리</Breadcrumb.Item>
        <Breadcrumb.Item>메뉴</Breadcrumb.Item>
      </Breadcrumb>

      <Card className="card-box adm_menu_wrap">
        <Row gutter={20} className="">
          <Col className="gutter-row" span={8}>
            <Card title="등록 대기 중 메뉴">
              <div className="container_treeview onlylist">
                <wjNav.TreeView itemsSource={treeData} displayMemberPath="header" childItemsPath="items" imageMemberPath="img" showCheckboxes={false} allowDragging={true} dragStart={onDragStart.bind(this)} dragOver={onDragOver.bind(this)} initialized={initialized.bind(this, 0)}></wjNav.TreeView>
                <div className="add_ipt_wrap">
                  <Input id="theInput" />
                  <Button type="primary" onClick={(e)=>{addNode(0, 0)}}>+</Button>
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
                <wjNav.TreeView itemsSource={treeData2} displayMemberPath="header" childItemsPath="items" imageMemberPath="img" collapseOnClick={false} collapseWhenDisabled={true} showCheckboxes={false} allowDragging={true} dragStart={onDragStart.bind(this)} dragOver={onDragOver.bind(this)} formatItem={onFormatItem.bind(this)} initialized={initialized.bind(this, 2)}></wjNav.TreeView>
              </div>
            </Card>
          </Col>
        </Row>
        <br />
        <Row gutter={[10, 10]}  justify="center" style={{ marginTop: 20 }}>
          <Col>
            <Button type="primary" htmlType="submit">
              확인
            </Button>
          </Col>
          <Col>
            <Button htmlType="button">
              취소
            </Button>
          </Col>
        </Row>
        
      </Card>

      <div id="cloneEl">
        <div className="acc_wrap" ><span className="btn_acc"><i className="ant-menu-submenu-arrow"></i></span> <div className="accIn"><input type="text" className="ant-input" /></div></div>
      </div>

    </Wrapper>
  );
});

export default Adm_menu;
