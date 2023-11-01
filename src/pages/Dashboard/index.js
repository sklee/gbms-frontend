/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo,useState } from 'react';
import { Table, Radio, Button, Row, Col, Checkbox,Modal,Select,DatePicker,Menu,Dropdown } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  MinusOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';
import moment from 'moment';




const Wrapper = styled.div`
  width: 100%;
  .add-btn {
    float: right;
  }
  .wj-flexgrid .wj-state-sticky .wj-header {opacity : unset;}
  #tplBtnViewMode {
    display:none;
  }
`;

const { Option } = Select;

const TotalStatus = styled.div`
  .cnt {
    color: ${(props) => props.theme.primaryColor};
    font-size: 1.2rem;
  }
`;

const Dashboard = observer((props) => {
  const { commonStore } = useStore();

 
  const state = useLocalStore(() => ({
    loginChk : false,
  }));

  const [columnType, setColumnType] = useState('');

  useEffect(() => {
    fetchData();

  }, []);

  const fetchData = useCallback(async (val) => {
    commonStore.loading = true;
    const result = await commonStore.handleApi({
      method: 'POST',
      url: 'dashboard/list',
    //   data : {
    //     page : val,
    //     pageCnt : state.pageArr[0].pageCnt,
    //   },
    });

    if (result) {
      //state.list = result.data;

      if(result.message !=""){
          state.loginChk = false;
      }else{
        state.loginChk = true;
      }
    //   state.total = result.meta.total;

    //   state.pageArr[0].lastPage = result.meta.last_page;
    //   state.pageArr[0].page = result.meta.current_page;

    //   state.pageArr[0].pageText = wjCore.format('{index:n0} / {count:n0}', {
    //     index: state.pageArr[0].page,
    //     count: state.pageArr[0].lastPage
    //   })   
      
    }
    commonStore.loading = false;
  }, []);

 
  return (
        <Wrapper>
            home 
        </Wrapper>


    
    
  );
});

export default Dashboard;
