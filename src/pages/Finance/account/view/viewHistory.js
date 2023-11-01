/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState,useMemo,useRef } from 'react';
import { Row, Table, Input } from 'antd';

import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';

import { toJS } from 'mobx';


const Wrapper = styled.div`
  width: 100%;
  .wj-flexgrid .wj-state-sticky .wj-header {opacity : unset;}

`;


const viewHistory = observer(({ idx,  tab }) => {
  const { commonStore } = useStore();
  const { Search } = Input;

  const state = useLocalStore(() => ({
    data: [],
    idx : '',
    tab: '',
  }));

  useEffect(() => { 
    state.idx = idx;
    state.tab = tab;
    if(tab == "history"){
        fetchData(idx);
    }
    
  }, [idx, tab]);

  const fetchData = useCallback(async (idx) => {
    const result = await axios.get(
      process.env.REACT_APP_API_URL +'/api/v1/purchase-accounts-history/'+idx,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
    )

    if (result.data.data) {
      result.data.data.forEach(e=> {
        //   if(e.key ==='name'){
        //       e.key = '성명/사업자명'
        //   }else if(e.key === 'taxation_type'){
        //     if(e.old_value == '1' || e.new_value == '1'){
        //       e.old_value = '사업소득';
        //       e.new_value = '사업소득';
        //     }else{
        //       e.old_value = '기타소득';
        //       e.new_value = '기타소득';
        //     }
        //     e.key = '과세 구분'
        //   }else if(e.key === 'bank_id' || e.key === 'bank_name_eng'){
        //     e.key = '은행명'
        //   }else if(e.key === 'account_no'){
        //     e.key = '계좌번호'
        //   }else if(e.key === 'depositor'){
        //     e.key = '예금주'
        //   }else if(e.key === 'swift_code'){
        //     e.key = 'SWIFT CODE'
        //   }else if(e.key === 'name_origin'){
        //     e.key = '성명/사업자명(원어)'
        //   }else if(e.key === 'file_name'){
        //       e.key = '파일';
        //   }else if(e.key === 'address'){
        //       e.key = '주소';
        //   }else if(e.key === 'country'){
        //     e.key = '국적';
        //   }else if(e.key === 'person_no'){
        //     e.key = '주민/사업자/외국인번호';
        //   }else if( e.key === 'memo' ){
        //     e.key = '기타 참고사항';
          
        //   }else if(e.key === 'account_type'){
        //     e.key = '계좌정보 타입';
        //     if(e.old_value == '1' || e.new_value == '1'){
        //       e.old_value = '국내 계좌';
        //       e.new_value = '국내 계좌';
        //     }else{
        //       e.old_value = '해외 계좌';
        //       e.new_value = '해외 계좌';
        //     }
        //   }else if(e.key === 'use_yn'){
        //     e.key = '사용여부';
        //     if(e.old_value == 'Y' || e.new_value == 'Y'){
        //       e.old_value = '사용';
        //       e.new_value = '사용';
        //     }else{
        //       e.old_value = '숨김';
        //       e.new_value = '숨김';
        //     }
        // }   
          
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
        title: '항목명',
        dataIndex: 'key',
        key: 'key',
        render: (_, row) => row.key ,
        align: 'left',
        width: 200,
      },
      {
        title: '변경 전',
        dataIndex: 'old_value',
        key: 'old_value',
        render: (_, row) => row.old_value,
        align: 'left',
      },
      {
        title: '변경 후',
        dataIndex: 'new_value',
        key: 'new_value',
        render: (_, row) => row.new_value,
        ellipsis: true,
        align: 'left',
      },
      {
        title: '변경일',
        dataIndex: 'updated_at',
        key: 'updated_at',
        render: (_, row) => row.updated_at ,
        width: 150,
        align: 'left',
      },
      {
        title: '작업자',
        dataIndex: 'user_name',
        key: 'user_name',
        render: (_,row) => row.user_name,
        width: 100,
        align: 'left',
      },
    ],
    [],
  );
  
  //검색
  const handleSearch = (data) => {
    console.log(data)
    fetchData(state.pageArr.page, data)
  }

  return (
    <Wrapper>
      <Search
        placeholder="검색어 입력"
        onSearch={handleSearch}
        enterButton
        allowClear
        style={{width: 300, marginBottom: 15}}
      />

      <Table
        dataSource={toJS(state.data)}
        columns={columns}
        scroll={{ x: 992, y: 800 }}
        rowKey={(row) => row.id}
      />

      <Row gutter={10} className="table_bot">
        <span>행 개수 : {state.data.length}</span>
      </Row>

    </Wrapper>
  );
});

export default viewHistory;
