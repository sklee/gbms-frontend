/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Table,  Button,  Drawer, Space, Pagination} from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import axios from 'axios';
import styled from 'styled-components';
import useStore from '@stores/useStore';

const Wrapper = styled.div`
    width: 100%;
    `;

const chkListDrawer = observer(({ chkVisible,chkOnClose,overlapChkText,authorNameData = [], typeChk ,keywordTxt}) => {
    const { commonStore } = useStore();

    const state = useLocalStore(() => ({
      type : '',
      title : '',
      keywordTxt:'',
      drawerback: 'drawerWrap',

      list: [],
      total: 0,
      
      //페이징
      pageArr: {
          pageCnt: 30, //리스트 총 갯수
          page: 1, //현재페이지
      },


    }));

    useEffect(() => { 
      state.type = typeChk;

      if(typeChk === 'copyrights'){
        state.title = '저작권자 중복 확인';
      }else if(typeChk === 'contributors'){
          state.title = '기여자 중복 확인';
      }else if(typeChk === 'owners'){
          state.title = '권리자 중복 확인';
      }

      state.keywordTxt = keywordTxt;
      fetchData('',keywordTxt);
      
    }, [typeChk,keywordTxt]);

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
          url:process.env.REACT_APP_API_URL +'/api/v1/' +state.type +'?display='+state.pageArr.pageCnt+'&page='+page+'&sort_by=date&order=desc' +keyword,
          headers: {
              Accept: 'application/json',
          },
        };

        axios(config)
            .then(function (response) {                              
                console.log(response);
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


    const copyrights = useMemo(() => [
        {
          title: '번호',
          dataIndex: state.type+'_cnt',
          key:  state.type+'_cnt',
          render: (_, row) => row.cnt,
          align: 'left',
        },
        {
          title: '성명/사업자명',
          dataIndex: state.type+'_name',
          key:  state.type+'_name',
          render: (_, row) => row.name ,
          align: 'left',
        },
        {
          title: '여권번호, TAX ID 등',
          dataIndex:  state.type+'_person_no',
          key: state.type+'_person_no',
          render: (_, row) => row.person_no,
          align: 'left',
        },
        {
          title: '유형',
          dataIndex: state.type+'_type',
          key: state.type+'_type',
          // render: (_, row) => row.type === '4' ? '해외 거주 외국인' : '해외 사업자',
          render: (_, row) => row.type,
          align: 'center',
        },
        {
          title: '이메일',
          dataIndex: state.type+'_email',
          key: state.type+'_email',
          render: (_,row) => row.email,
          align: 'left',
        },
        {
          title: '최근 저작권 지정 상품',
          dataIndex: state.type+'_latest_product',
          key: state.type+'_latest_product',
          render: (_, row) => row.products,
          align: 'left',
        },     
      ],
      [],
    );

    const contributors = useMemo(
      () => [
        {
          title: '번호',
          dataIndex: state.type+'_cnt',
          key:  state.type+'_cnt',
          render: (_, row) => row.cnt,
          align: 'left',
        },
        {
          title: '성명/사업자명(실명)',
          dataIndex: state.type+'_name',
          key:  state.type+'_name',
          render: (_, row) => row.name,
          align: 'left',
          width: 100,
        },
        {
          title: '성명/사업자명(공개용)',
          dataIndex:  state.type+'_name_public',
          key: state.type+'_name_public',
          render: (_, row) => row.name_public,
          align: 'left',
          width: 100,
        },
        {
          title: '통합전산망 기여자 번호',
          dataIndex: state.type+'_contributor_no',
          key: state.type+'_contributor_no',
          render: (_, row) => row.contributor_no,
          ellipsis: true,
          align: 'center',
        },
        {
          title: '유형',
          dataIndex: state.type+'_type',
          key: state.type+'_type',
          // render: (_, row) => row.type === '1' ? '내국인(한국인)' : row.type === '2' ? '국내 거주 외국인(외국인등록번호 보유)' : '기관(법인, 사업자)',
          render: (_, row) => row.type,
          align: 'center',
        },
        {
          title: '이메일',
          dataIndex: state.type+'_email',
          key: state.type+'_email',
          render: (_,row) => row.email,
          align: 'left',
        },
        {
          title: '최근 기여자 지정 상품',
          dataIndex: state.type+'_latest_product',
          key: state.type+'_latest_product',
          render: (_, row) => row.products,
          align: 'left',
        },     
      ],
      [],
    );

    const owners = useMemo(
      () => [
        {
          title: '번호',
          dataIndex: state.type+'_cnt',
          key:  state.type+'_cnt',
          render: (_, row) => row.cnt,
          align: 'left',
        },
        {
          title: '성명/사업자명',
          dataIndex: state.type+'_name',
          key:  state.type+'_name',
          render: (_, row) => row.name,
          align: 'left',
        },
        {
          title: '유형',
          dataIndex: state.type+'_type',
          key: state.type+'_type',
          // render: (_, row) => row.type === '1' ? '개인' : '기관',
          render: (_, row) => row.type,
          align: 'center',
        },
        {
          title: '국적',
          dataIndex:  state.type+'_country',
          key: state.type+'_country',
          render: (_, row) => row.country,
          align: 'left',
        },  
        {
          title: '최근 권리 지정 상품',
          dataIndex: state.type+'_latest_product',
          key: state.type+'_latest_product',
          render: (_, row) => row.products,
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
            title={state.title}
            placement='right'
            visible={chkVisible}   
            onClose={visibleClose}
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
                // dataSource={toJS(authorNameData)}
                dataSource={state.list}
                columns={state.type === 'contributors' ? contributors : state.type === 'copyrights' ? copyrights : owners}
                scroll={{ x: 992, y: 800 }}
                rowKey={(row) => row.author_id}    
                pagination={false}        
            />
            <div className="table_bot" ><Pagination defaultCurrent={1} current={state.pageArr.page} total={state.total} onChange={pageChange}/></div>   

            <div className="tailBtnWrap" style={{marginTop : '20px', textAlign:'center'}}>
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