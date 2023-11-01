/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Table,  Button,  Drawer, Space} from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import axios from 'axios';
import styled from 'styled-components';
import useStore from '@stores/useStore';

const Wrapper = styled.div`
    width: 100%;
    `;

const chkListDrawer = observer(({ chkVisible,chkOnClose,overlapChkText,authorNameData = [], keywordTxt }) => {
    const { commonStore } = useStore();

    const state = useLocalStore(() => ({
      keywordTxt : '',
      list: [],
      total: 0,
      drawerback: 'drawerWrap',
      //페이징
      pageArr: {
          pageCnt: 30, //리스트 총 갯수
          page: 1, //현재페이지
      },

    }));

    useEffect(() => { 
      state.keywordTxt = keywordTxt;
      fetchData('', keywordTxt);
      
    }, [keywordTxt]);
  
    const visibleClose = () => {
      chkOnClose(false);
    };
    const listOverlapChk = () => {
      overlapChkText('Y');
      chkOnClose(false);
    };

    //페이징
      const pageChange = (num)=>{
        fetchData(num);
    }

    //리스트
    const fetchData = useCallback(async (val, data) => {
      if (val == '' || val == '0' || val == undefined) {
          var page = 1;
      } else {
          var page = val;
      }

      if(data){
          var keyword = '&keyword='+data
      }

      var axios = require('axios');

      var config = {
        method: 'GET',
        url:process.env.REACT_APP_API_URL +'/api/v1/purchase-accounts?display='+state.pageArr.pageCnt+'&page='+page+'&sort_by=date&order=desc' +keyword,
        headers: {
            Accept: 'application/json',
        },
      };

      axios(config)
          .then(function (response) {                              
              var result_page =
                  (page - 1) * state.pageArr.pageCnt;
              var str_no = response.data.meta.total - result_page;

              response.data.data.map((e, number) => {
                  e.cnt = str_no - number;
              });

              state.list = response.data.data;
              state.total = response.data.meta.total;
              state.pageArr.page = response.data.meta.current_page;
              state.pageArr.pageCnt = response.data.meta.per_page;
          })
          .catch(function (error) {
              console.log(error.response);                
          });
    }, []);    

    const column = useMemo(
      () => [
        {
          title: '번호',
          dataIndex: 'cnt',
          key:  'cnt',
          render: (_, row) => row.cnt,
          align: 'left',
        },
        {
          title: '성명/사업자명(영어)',
          dataIndex: 'name',
          key:  'name',
          render: (_, row) => row.name,
          align: 'left',
        },
        {
          title: '성명/사업자명(원어)',
          dataIndex: 'name_origin',
          key: 'name_origin',
          render: (_, row) => row.name_origin,
          align: 'center',
        },
        {
          title: '유형',
          dataIndex:  'type',
          key: 'type',
          render: (_, row) => row.type,
          align: 'left',
        },  
        {
          title: '국적',
          dataIndex: 'country',
          key: 'country',
          render: (_, row) => row.country,
          align: 'left',
        },     
      ],
      [],
    );

    const [ drawerExtended, setDrawerExtended ] = useState(false);
    const drawerSizeHandler = () => {
        if(drawerExtended){
            setDrawerExtended(false);
            state.drawerback = 'drawerWrap';
            
        } else {
            setDrawerExtended(true);
            state.drawerback = 'drawerback drawerWrap';
        }
    }

    return (
        <Wrapper>
            
          <Drawer
            title='거래처(매입) 중복 확인'
            placement='right'
            onClose={visibleClose}
            visible={chkVisible}   
            className={state.drawerback}        
            closable={false}
            keyboard={false}
            extra={
              <>
                  <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                      {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                  </Button>
                  <Button onClick={visibleClose}>
                      <CloseOutlined />
                  </Button>
              </>
          }  
          >

            <Table
                dataSource={state.list}
                columns={column}
                scroll={{ x: 992, y: 800 }}
                rowKey={(row) => row.author_id}        
            />
            <div className="tailBtnWrap" style={{marginTop : 20, textAlign:'center'}}>
              <Button type="primary" htmlType='button' onClick={listOverlapChk}>
                  중복이 아님을 확인하고, 계속 등록합니다.
              </Button>
              <Button htmlType="button" onClick={visibleClose}>
                  취소
              </Button>
            </div>
          </Drawer>
        </Wrapper>
    );
});

export default chkListDrawer;