/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState,useMemo,useRef } from 'react';
import { Table} from 'antd';

import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';

import { toJS } from 'mobx';


const Wrapper = styled.div`
  width: 100%;
  .wj-flexgrid .wj-state-sticky .wj-header {opacity : unset;}

`;


const Historyinfo = observer(({ idx, type, tab }) => {
  const { commonStore } = useStore();

  const state = useLocalStore(() => ({
    data: [],
    idx : '',
    type: '',
    tab: '',
  }));

  useEffect(() => { 
    state.idx = idx;
    state.type = type;
    state.tab = tab;
    if(tab == "history"){
        fetchData(idx, type);
    }
    
  }, [idx, type,tab]);

  const fetchData = useCallback(async (idx,type) => {
    const result = await axios.get(
      process.env.REACT_APP_API_URL +'/api/v1/'+state.type+'-history/'+idx,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
    )

    if (result.data.data) {
      result.data.data.forEach(e=> {
          if(e.key === 'check_at'){
              e.key = '검수일'
          }else if(e.key === 'check'){
              e.key = '검수자'
          }else if(e.key === 'check_status'){
              e.key = '검수상태'
          }
          
          
          if(e.updated_at){
            e.updated_at = e.updated_at.substring(0,10)
          }
      })
     
      state.data =result.data.data;       
    }
  }, []);

  const columns = useMemo(
    () => [
      {
        title: '저작권자',
        dataIndex: 'revisionable_id',
        key: 'revisionable_id',
        render: (_, row) => row.revisionable_id ,
        align: 'left',
        width: 140,
      },
      {
        title: '구분',
        dataIndex: 'revisionable_type',
        key: 'revisionable_type',
        render: (_, row) => row.revisionable_type,
        align: 'left',
      },
      {
        title: '항목명',
        dataIndex: 'key',
        key: 'key',
        render: (_, row) => row.key,
        ellipsis: true,
        align: 'left',
      },
      {
        title: '변경 전',
        dataIndex: 'old_value',
        key: 'old_value',
        render: (_, row) => row.old_value ,
        width: 180,
        align: 'center',
      },
      {
        title: '변경 후',
        dataIndex: 'new_value',
        key: 'new_value',
        render: (_,row) => row.new_value,
        width: 180,
        align: 'center',
      },
      {
        title: '변경일',
        dataIndex: 'updated_at',
        key: 'updated_at',
        render: (_, row) => row.updated_at ,
        width: 150,
        align: 'center',
      },
      {
        title: '작업자',
        dataIndex: 'user_name',
        key: 'user_name',
        render: (_,row) => row.user_name,
        width: 120,
        align: 'center',
      },
    ],
    [],
  );
  

  return (
    <Wrapper>
      
      <Table
        dataSource={toJS(state.data)}
        columns={columns}
        scroll={{ x: 992, y: 800 }}
        rowKey={(row) => row.id}
      />

    </Wrapper>
  );
});

export default Historyinfo;
