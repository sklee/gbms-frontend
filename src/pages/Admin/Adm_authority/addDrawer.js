/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Table, Space, Button, Row, Col, Modal, Input, Drawer,  Checkbox, } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';

import {
  FlexGrid,
  FlexGridColumn,
  FlexGridCellTemplate,
} from '@grapecity/wijmo.react.grid';

const Wrapper = styled.div`
   width: 100%;
`;


const DEF_STATE = {
  // DB Data
  name : '',
  description : '',
  
};

const addDrawer = observer(({ visible,onClose,viewIdx }) => {
    const { commonStore } = useStore();

    const state = useLocalStore(() => ({ ...DEF_STATE })); 

    const stateData = useLocalStore(() => ({
      drawerback : '',
      idx : '',
      menu_data : [],
      roleGrid: null,
      showAllTree: false,
    }));

    const visibleClose = () => {
      //데이터 초기화
      if(stateData.idx == ""){
        for (const key in DEF_STATE) {
          state[key] = DEF_STATE[key];
        }
      }      
      onClose(false);
    };   

    useEffect(() => {
      fetchData(viewIdx);
      stateData.idx = viewIdx;
    }, [viewIdx]);
    
    const fetchData = useCallback(async (val) => {
      commonStore.loading = true;
      const result = await commonStore.handleApi({
        method: 'POST',
        url: 'admin/authority_id',
        data: {
          idx : val
        },
      });

      if (result) {
        console.log(result);        
        stateData.menu_data = result.menu_data;

        if(val != ""){
          state.name =  result.auth_data.name;
          state.description =result.auth_data.description;
        }
      }
      commonStore.loading = false;
    }, []);

    const onBeginningEdit = useCallback(
      (flexGird, e) => {
        console.log(flexGird);
        console.log(e);
        let binding = flexGird.columns[e.col].binding;
        if (!(binding in flexGird.rows[e.row].dataItem)) {
          // property not on this item?
          e.cancel = true; // can't edit!
          return;
        }

        setTimeout(() => {
          const row = flexGird.rows[e.row];
          if (row.dataItem.children && row.dataItem.children.length) {
            for (let i = row.index + 1; i < flexGird.rows.length; i++) {
              let childRow = flexGird.rows[i];
              if (childRow.level <= row.level) {
                break;
              }
              flexGird.setCellData(i, e.col, row.dataItem[binding]);
            }
          }

          if (row.index > 0) {
            const parentData = flexGird.getCellData(row.index - 1, e.col);
            if (parentData !== row.dataItem[binding]) {
              for (let i = row.index - 1; i >= 0; i--) {
                let parentRow = flexGird.rows[i];
                if (parentRow.level > row.level) {
                  break;
                }
                flexGird.setCellData(i, e.col, false);
              }
            }
          }
        }, 10);
      },
      [],
    );
    
    const handleChangeShowAllTree = useCallback((e) => {
      stateData.showAllTree = !stateData.showAllTree;

      if (stateData.showAllTree) {
        stateData.roleGrid.rows.forEach((row) => {
          row.isCollapsed = false;
        });
      } else {
        stateData.roleGrid.rows.forEach((row) => {
          if (row.level >= 1) {
            row.isCollapsed = true;
          }
        });
      }
    }, []);


    const handleChangeInput = useCallback(
      (type) => (e) => {
        state[type] = e.target.value;    
      },
      [],
    );

    const handleSubmit = useCallback(async (e)=> {
      const data = toJS(state);
      let chkVal = true;
  
      if(state['at_name']== ""){
        Modal.error({
          content: '권한명을 입력해주세요.',        
        });
        chkVal = false;
        return;
      }
  
      // if(state['at_description']== ""){
      //     Modal.error({
      //         content: '설명을 입력해주세요.',        
      //     });
      //     chkVal = false;
      //     return;
      // }

      if(state['menu']== ""){
        Modal.error({
          content: '메뉴의 권한설정을 선택해주세요.',        
        });
        chkVal = false;
        return;
      }
          
      console.log(data); return;
      if(chkVal == true){
        const result = await commonStore.handleApi({
          method: 'POST',
          //url: 'admin/authority_add',
          data: {
              data : data
          },
        });
        
        if(result.author_id){
          Modal.success({
            content: result.result,
          });
        
        }else{
          let text = '';
          if(result.error){
            text = '오류코드: '+result.error;
          }
          Modal.error({
            content: '등록시 문제가 발생하였습니다. 재시도해주세요.'+text ,        
          });       
        }
      }
    }, []);
  
  
  useEffect(() => {
    if(stateData.roleGrid){
      stateData.roleGrid.rows.forEach((row) => {
        row.isReadOnly = false;
        if (row.level >= 1) {
          row.isCollapsed = true;
        }
      });
    }
    
  }, [stateData.roleGrid]);

  return (
    <Wrapper>          
      <Drawer
        title="권한 설정"
        placement='right'
        onClose={visibleClose}
        visible={visible}
        className={stateData.drawerback == '' ? 'drawerWrap' : 'drawerback drawerWrap'}
        keyboard={false}
        extra={
          <Button>
            <CloseOutlined />
          </Button>
        }
      >
        <Row gutter={10}>
          <Col xs={8} lg={4} className="label">
            권한명
          </Col>
          <Col xs={16} lg={8}>
            <Input type="text" name="name" value={state.name} onChange={handleChangeInput('name')} required autoComplete="off"/>   
          </Col>
        </Row>
        <Row gutter={10}>
          <Col xs={8} lg={4} className="label">
            설명
          </Col>
          <Col xs={16} lg={8}>
            <Input type="text" name="description" value={state.description} onChange={handleChangeInput('description')} autoComplete="off"/> 
          </Col>
        </Row>
          
        <FlexGrid
          initialized={(grid) => (stateData.roleGrid = grid)}
          itemsSource={stateData.menu_data}
          headersVisibility="Column"
          beginningEdit={onBeginningEdit}
          childItemsPath={'children'}
          selectionMode="Row"
          allowDragging={false}
          allowResizing={false}
          allowSorting={false}
        >
          <FlexGridColumn binding="label" dataType="String" width="*">
            <FlexGridCellTemplate
              cellType="ColumnHeader"
              template={(context) => {
                return (
                  <Space>
                    <Button
                      type="text"
                      size="small"
                      onClick={handleChangeShowAllTree}
                    >
                      {state.showAllTree ? '[원래대로]' : '[전체 펼치기]'}
                    </Button>
                    <span>메뉴명</span>
                  </Space>
                );
              }}
            />
          </FlexGridColumn>

          <FlexGridColumn binding="authorityRole" header="권한없음"></FlexGridColumn>
          <FlexGridColumn binding="watchRole" header="보기"></FlexGridColumn>
          <FlexGridColumn binding="addRole" header="수정/추가"></FlexGridColumn>
          <FlexGridColumn binding="delRole" header="삭제"></FlexGridColumn>
          <FlexGridCellTemplate cellType="ColumnFooter" template={null} />
        </FlexGrid>


        
        <Button type="button" htmlType="button" onClick={handleSubmit}>
          확인
        </Button>

      </Drawer> 
    </Wrapper>
  );
});

export default addDrawer;