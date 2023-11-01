/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState,useMemo,useRef } from 'react';
import { Button, Row, Col, Modal, Pagination } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';
import * as wjGridFilter from '@grapecity/wijmo.grid.filter';

import { toJS } from 'mobx';


const Wrapper = styled.div`
  width: 100%;
  .wj-flexgrid .wj-state-sticky .wj-header {opacity : unset;}

`;


const Historyinfo = observer(({ idx }) => {
  const { commonStore } = useStore();

  const state = useLocalStore(() => ({
    data: [],
    idx : '',
  }));

  useEffect(() => { 
    state.idx = idx;
    fetchData();
  }, [idx]);

  const fetchData = useCallback(async ()=> {
      var axios = require('axios');

      if(state.idx==='')return false;

      var config={
          method:'GET',
          url:process.env.REACT_APP_API_URL +'/api/v1/produce-company-history/'+state.idx,
          headers:{
              'Accept':'application/json',
          }
          };
      axios(config)
      .then(function(response){
          if(response.data.data.id != ''){
              state.data= response.data.data;
          }else{
              Modal.error({
                  content:(<div>
                              <p>호출시 문제가 발생하였습니다.</p>
                              <p>재시도해주세요.</p>
                              <p>오류코드: {response.data.error}</p>
                          </div>)
              });  
          }
      })
      .catch(function(error){
          console.log(error);
          Modal.error({
              title : (<div>호출시 문제가 발생하였습니다.<br/>재시도해주세요.</div>)
          });  
      });   
  }, []);

    const initGrid = (grid) => {
        grid.rowHeaders.columns.splice(0, 1); // no extra columns

    };

  return (
    <Wrapper>
        <FlexGrid
            itemsSource={state.data}
            initialized={(s) => initGrid(s)}
        >
            <FlexGridColumn binding="key" header="항목명" width="*" minWidth={200} isReadOnly={true}/>
            <FlexGridColumn binding="old_value" header="변경 전"  width={200} isReadOnly={true} />
            <FlexGridColumn binding="new_value" header="변경 후"  width={200} isReadOnly={true}/>
            <FlexGridColumn binding="updated_at" header="변경일"  width={100} isReadOnly={true}/>
            <FlexGridColumn binding="user_name" header="작업자"  width={150} isReadOnly={true}/>
        </FlexGrid>
        <Row className='table_bot'>
            <div className='btn-group'>
                <span style={{marginTop: 10}}>행 개수 : {state.data.length}</span>
            </div>
        </Row>
    </Wrapper>
  );
});

export default Historyinfo;
