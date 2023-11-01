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

    console.log(result);
    if (result.data.data) {
      result.data.data.forEach(e=> {
          // if(e.key === 'introduction'){
          //     e.key = '기본 소개글'
          // }else if(e.key === 'managers'){
          //     e.key = '담당자'
          // }else if(e.key === 'email'){
          //     e.key = '이메일'
          // }else if(e.key === 'phone'){
          //     e.key = '전화번호'
          // }else if(e.key ==='public_name'){
          //     e.key = '성명/사업자명(공개용)'
          // }else if(e.key === 'taxation_type'){
          //     e.key = '세금 구분'
          // // }else if(e.key === 'accounts' || e.key === 'bank' || e.key === 'account_no' || e.key === 'depositor' || e.key === 'swift_code' || e.key === 'account_type' || e.key === 'purpose'){
          // }else if(e.key === 'accounts'){
          //     e.key = '계좌 정보'
          // }else if(e.key === 'bank' || e.key === 'bank_name_eng' ){
          //   e.key = '은행명'
          // }else if(e.key === 'account_no'){
          //   e.key = '계좌번호'
          // }else if(e.key === 'depositor'){
          //   e.key = '예금주'
          // }else if(e.key === 'swift_code'){
          //   e.key = 'SWIFT CODE'
          // }else if(e.key === 'purpose'){
          //   e.key = '용도'
          // }else if(e.key ==='fax'){
          //     e.key = '팩스'
          // }else if(e.key === 'file_name'){
          //     e.key = '신분증, 계좌 파일';
          // }else if(e.key === 'address'){
          //   if(state.type === 'brokders'){
          //     e.key = '주소';
          //   }else{
          //     e.key = '법적 주소';
          //   }
          // }else if(e.key === 'country'){
          //   e.key = '국적';
          // }else if(e.key === 'company_no'){
          //   e.key = '사업자등록번호';
          // }else if(e.key === 'owner_name'){
          //   e.key = '대표자';
          // }else if( e.key === 'broker_managers'|| e.key === 'transaction_manager' ){
          //   e.key = '거래 담당자';
          // }else if( e.key === 'memo' ){
          //   e.key = '기타 참고사항';
          // }else if( e.key === 'tax_rate' ){            
          //   e.key = '원천징수 세율';
          // }else if( e.key === 'updated' ){
          //   e.key = '수정자정보';
          // }else if( e.key === 'name' ){
          //   if(state.type === 'brokders'){
          //     e.key = '사업자명';
          //   }else{
          //     e.key = '성명/사업자명';
          //   }            
          // }else if(e.key === 'account_type'){
          //   e.key = '계좌정보 타입';
          //   if(e.old_value == '1' || e.new_value == '1'){
          //     e.old_value = '국내 계좌';
          //   }else{
          //     e.old_value = '해외 계좌';
          //   }
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
        align: 'center',
      },
      {
        title: '작업자',
        dataIndex: 'user_name',
        key: 'user_name',
        render: (_,row) => row.user_name,
        width: 100,
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
