/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Table, Button, Row, Col, Modal, Input, Drawer, Select} from 'antd';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';

import styled from 'styled-components';

import * as wjCore from '@grapecity/wijmo';
import * as wjInput from '@grapecity/wijmo.react.input';

import useStore from '@stores/useStore';

const Wrapper = styled.div`
    width: 100%;
    `;

const { Option } = Select;

const chkListDrawer = observer(({ chkVisible,chkOnClose,idx}) => {
    const { commonStore } = useStore();

    const state = useLocalStore(() => ({
        list: [],
        manager_data: [],
        memberOption: [],
        memberChecked: [],
        total: 0,
        idx: '',
        newData: '',
        insertData: [],
      
        pageArr : [{
            pageCnt : 30,   //리스트 총 갯수
            page : 1,       //현재페이지
            lastPage : 0,   //마지막페이지
            pageText : '',  //페이지 정보
        }]
    }));

    useEffect(() => {        
      console.log(idx);
       fetchData(idx);
       state.idx = idx;
    }, [idx]);

    const visibleClose = () => {
        chkOnClose(false);
    };

    const columns = useMemo(
      () => [
        {
          title: '이름',
          dataIndex: 'name',
          key: 'name',
          render: (_, row) =>  row.username ,
          align: 'center',
          width: 130,
        },
        {
          title: '부서/역할',
          dataIndex: 'team',
          key: 'team',
          render: (_, row) => row.team+' / '+row.role,
          align: 'center',
          width: 130,
        },  
        {
          title: '',
          dataIndex: 'delete',
          key: 'delete',
          render: (_, row) => <Button className="btn-primary" type="button" shape="circle" onClick={e => deleteHandel(row.member_id)}>-</Button>,
          align: 'left',
          width: 50,
        },    
      ],
      [],
    );

    //리스트
    const fetchData = useCallback(async (idx) => {
      commonStore.loading = true;
      const result = await commonStore.handleApi({
        method: 'POST',
        url: 'admin/id_chk_list',
        data : {
          idx : idx
        },
      });

      if (result) {
        state.list = result.list;   

        //수정 또는 삭제시 기본 데이터
        var i = 0;
        if(state.list.length > 0){
          for(i=0; i < state.list.length; i++){
            state.insertData[i] = {member_id : state.list[i].member_id};
          }
        }
        

        //할당되지 않은 계정
        state.memberOption =result.add_list;  
      }
      commonStore.loading = false;
    }, []);

    const handleChangeSelect = useCallback( (e) => {
        var newData = '';
        state.memberOption.forEach(element => {
          if(element.userid == e){
            console.log(element);
            newData = {
              member_id: element.member_id,
              userid: element.userid,
              username: element.username,
              department: element.department,
              team: element.team,
              role: element.role,
            }
          }
        });
        
        state.newData = newData;
        
        },[],
    );

    const handleAdd = () => {
      
      state.list[state.list.length++] = state.newData;
      
      state.insertData[state.insertData.length++] = {member_id : state.newData.member_id};
      
    };

    const deleteHandel = (e) => {
      var i =0;
      for(i=0; i < state.list.length; i++){
        if(state.list[i]['member_id'] === e){
          state.list.splice(i, 1);
          i--;
        }
      }

      for(i=0; i < state.insertData.length; i++){
        if(state.insertData[i]['member_id'] === e){
          state.insertData.splice(i, 1);
          i--;
        }
      }
     
    };

    

    const handleSubmit = useCallback(async (e)=> {
      const data = toJS(state.insertData);
      let chkVal = true;
  
      if(data== ""){
        Modal.error({
            content: '계정 추가 또는 삭제할 데이터가 없습니다.',        
        });
        chkVal = false;
        return;
      }

      if(chkVal == true){
        const result = await commonStore.handleApi({
          method: 'POST',
          url: 'admin/id_add',
          data: {
            data : data,
            auth_id : state.idx
          },
        });
        
        if(result.auth_id){
          Modal.success({
            content: result.result,
            onOk() {
              visibleClose();
              fetchData(state.idx);
            },
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

    return (
        <Wrapper>            
            <Drawer
                title="할당 계정"
                placement='right'
                visible={chkVisible}   
                onClose={visibleClose}    
                className="drawerInnerWrap"  
                keyboard={false}    
            >
                <Select
                    showSearch
                    style={{ width: 200 }}
                    placeholder="추가할 계정 선택"
                    optionFilterProp="children"
                    filterOption={true}
                    onChange={handleChangeSelect}
                >

                    {state.memberOption.map((item) => (
                        <Option value={item['userid']} key={item['userid']} >
                            {item['username']}/{item['department']}
                        </Option>
                    ))}
                </Select>
                <Button className="btn-primary" type="button" shape="circle" onClick={handleAdd}>+</Button>

                <Table
                    dataSource={toJS(state.list)}
                    columns={columns}
                    scroll={{ x: 992, y: 800 }}
                    rowKey={(row) => row.mem_id}
                />

                <Button type="button" htmlType="button" onClick={handleSubmit}>
                    확인
                </Button>
            </Drawer>
           
        </Wrapper>
    );
});

export default chkListDrawer;