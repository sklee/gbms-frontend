/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState,useMemo,useRef } from 'react';
import { Table, Space, Button, Row, Input, Pagination } from 'antd';

import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';

import { toJS } from 'mobx';
import Popout from '@components/Common/popout/popout';
import * as wjInput from '@grapecity/wijmo.react.input';
import { CollectionView } from '@grapecity/wijmo';

// import CommonView from '../../../BillingApprovals/Approvals/View';
import CommonView from '../../../BillingApprovals/Billing/View';

const Wrapper = styled.div`
  width: 100%;
  .wj-flexgrid .wj-state-sticky .wj-header {opacity : unset;}
  .ant-space-item .ant-btn{height: 24px; line-height: 1;}
  .ant-space-item .ant-btn-circle{min-width: 24px}
  .ant-space-item .ant-btn-circle span{font-size: 12px}
`;


const PayList = observer(({ idx,  tab ,typeChk ,classChk}) => {
  const { commonStore } = useStore();
  const { Search } = Input;

  const state = useLocalStore(() => ({
    list: [],
    idx : '',
    tab: '',
    account : '',
    typeText : '',
    options:[],
    billing_id:'',

    //페이징
    total: 0,
    pageArr: {
      pageCnt: 30, //리스트 총 갯수
      page: 1, //현재페이지
    },
  }));

  useEffect(() => { 
    state.idx = idx;
    state.tab = tab;
    if(tab == "payList"){
      console.log(typeChk)
      if(typeChk == '한국인' || typeChk=='한국 사업자' || typeChk=='한국 거주 외국인'){
        state.account = '1';
        state.options = [{ value: state.account,  label: '청구(국내)'},{value: 3, label: '정기(정기 거래처)' }]
      }else{
        state.account = '2';
        state.options = [{ value: state.account,  label: '청구(해외)'},{value: 3, label: '정기(정기 거래처)' }]
      }      
      fetchData('',state.account);
      
    }
    
  }, [idx,tab]);

  const pageChange = (num)=>{
    fetchData(num);
  }

  const fetchData = useCallback(async (val,type) => {
    if (val == '' || val == '0' || val == undefined) {
        var page = 1;
    } else {
        var page = val;
    }

    var axios = require('axios');

    var config = {
        method: 'GET',
        url:process.env.REACT_APP_API_URL +'/api/v1/purchase-account-payments/'+idx+'?type='+type+'&display=' +state.pageArr.pageCnt +'&page=' +page +'&sort_by=date&order=desc',
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
                if(e.billed_at){
                    e.billed_at = e.billed_at.substring(0,10);
                }
                if(e.payment_at){
                  e.payment_at = e.payment_at.substring(0,10);
                }
                if(e.tax_invoice_published_at){
                  e.tax_invoice_published_at = e.tax_invoice_published_at.substring(0,10);
                }
                if(e.billed_info){
                  if(e.billed_info.name){
                    e.billed_info_name = e.billed_info.name;
                  }else{
                    e.billed_info_name ='';
                  }
                }else{
                  e.billed_info_name ='';
                }
                if(e.payment_user_info){
                  if(e.payment_user_info.name){
                    e.payment_user_info_name = e.payment_user_info.name;
                  }else{
                    e.payment_user_info_name ='';
                  }
                }
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

  //천다위 콤마
  const priceToString= (price)=> {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } 

  const handleChange = (value) => {
    state.account = value.selectedValue;
    fetchData('',value.selectedValue);
  }

  //drawer class
  const classChkBtn = (val) => {
    if (val === 'drawerback') {
        classChk('Y');
    } else {
        classChk('N');
    }
  };

  //기본정보
  const [visible, setVisible] = useState(false);
  const visibleDrawer = (data) => {
    state.billing_id = data.billing_id
    classChkBtn('drawerback');
    setVisible(true);
   
  };
  const viewOnClose = () => {
    classChkBtn('');
    setVisible(false);
  };

  //팝업
  const [popout, setPopoutOpen] = useState(false);
  const popoutVisible=(data)=>{
    state.billing_id = data.billing_id
    setPopoutOpen(true);
}
  const closeWindowPortal=()=>{
      setPopoutOpen(false);
  }

  const columns = useMemo(
    () => [
      {
        title: '청구서코드',
        dataIndex: 'billing_code',
        key: 'billing_code',
        render: (_, row) => row.billing_code ,
        align: 'left',
        width: 100,
      },
      {
        title: '제목',
        dataIndex: 'name',
        key: 'name',
        // render: (_, row) => row.name,
        render: (_, row) => <Space direction="horizontal"><Button className="btnLink" onClick={(e)=>visibleDrawer(row)}>{row.name}</Button>
        <Button type="button" shape="circle" onClick={(e)=>popoutVisible(row)}>N</Button></Space>,
        align: 'left',
        width: 150,
      },
      {
        title: '회사',
        dataIndex: 'company',
        key: 'company',
        render: (_, row) => row.company,
        ellipsis: true,
        align: 'left',
        width: 80,
      },
      {
        title: '청구일',
        dataIndex: 'billed_at',
        key: 'billed_at',
        render: (_, row) => row.billed_at ,
        width: 100,
        align: 'left',
      },
      {
        title: '결제 종료일',
        dataIndex: 'max_approval_at',
        key: 'max_approval_at',
        render: (_,row) => row.max_approval_at,
        width: 100,
        align: 'left',
      },
      {
        title: '청구자',
        dataIndex: 'billed_info_name',
        key: 'billed_info_name',
        render: (_,row) => row.billed_info_name,
        width: 70,
        align: 'left',
      },
      {
        title: '통화 단위',
        dataIndex: 'current_unit',
        key: 'current_unit',
        render: (_,row) => row.current_unit_name,
        width: 80,
        align: 'left',
      },
      {
        title: '입금액',
        dataIndex: 'payment_total_amount',
        key: 'payment_total_amount',
        render: (_,row) => row.payment_total_amount =='' || row.payment_total_amount == undefined ? '' : priceToString(row.payment_total_amount),
        width: 100,
        align: 'left',
      },
      {
        title: '입금일',
        dataIndex: 'payment_at',
        key: 'payment_at',
        render: (_,row) => row.payment_at,
        width: 100,
        align: 'left',
      },
      {
        title: '입금자',
        dataIndex: 'payment_user_info_name',
        key: 'payment_user_info_name',
        render: (_,row) => row.payment_user_info_name,
        width: 70,
        align: 'left',
      },
    ],
    [],
  );

  const columns2 = useMemo(
    () => [
      {
        title: '청구서코드',
        dataIndex: 'billing_code',
        key: 'billing_code',
        render: (_, row) => row.billing_code ,
        align: 'left',
        width: 100,
      },
      {
        title: '제목',
        dataIndex: 'name',
        key: 'name',
        // render: (_, row) => row.name,
        render: (_, row) => <Space direction="horizontal"><Button className="btnLink" onClick={(e)=>visibleDrawer(row)}>{row.name}</Button>
        <Button type="button" shape="circle" onClick={(e)=>popoutVisible(row)}>N</Button></Space>,
        align: 'left',
        width: 150,
      },
      {
        title: '회사',
        dataIndex: 'company',
        key: 'company',
        render: (_, row) => row.company,
        ellipsis: true,
        align: 'left',
        width: 80,
      },
      {
        title: '청구일',
        dataIndex: 'billed_at',
        key: 'billed_at',
        render: (_, row) => row.billed_at ,
        width: 100,
        align: 'left',
      },
      {
        title: '결제 종료일',
        dataIndex: 'max_approval_at',
        key: 'max_approval_at',
        render: (_,row) => row.max_approval_at,
        width: 100,
        align: 'left',
      },
      {
        title: '청구자',
        dataIndex: 'billed_info_name',
        key: 'billed_info_name',
        render: (_,row) => row.billed_info_name,
        width: 70,
        align: 'left',
      },
      {
        title: '통화 단위',
        dataIndex: 'current_unit',
        key: 'current_unit',
        render: (_,row) => row.current_unit_name,
        width: 80,
        align: 'left',
      },
      {
        title: '청구 금액',
        dataIndex: 'sum_total_amount',
        key: 'sum_total_amount',
        render: (_,row) =>  row.sum_total_amount =='' || row.sum_total_amount == undefined ? '' : priceToString(row.sum_total_amount),
        width: 100,
        align: 'left',
      },
      {
        title: '입금 원화',
        dataIndex: 'payment_total_amount',
        key: 'payment_total_amount',
        render: (_,row) =>  row.payment_total_amount =='' || row.payment_total_amount == undefined ? '' : priceToString(row.payment_total_amount),
        width: 80,
        align: 'left',
      },
      {
        title: '입금일',
        dataIndex: 'payment_at',
        key: 'payment_at',
        render: (_,row) => row.payment_at,
        width: 100,
        align: 'left',
      },
      {
        title: '입금자',
        dataIndex: 'payment_user_info_name',
        key: 'payment_user_info_name',
        render: (_,row) => row.payment_user_info_name,
        width: 70,
        align: 'left',
      },
    ],
    [],
  );

  const columns3= useMemo(
    () => [
      {
        title: '비용 귀속',
        dataIndex: 'company_name',
        key: 'company_name',
        render: (_, row) => row.company_name ,
        align: 'left',
        width: 150,
      },
      {
        title: '비용 청구 분류',
        dataIndex: 'class1_name',
        key: 'class1_name',
        render: (_, row) => row.class1_name != '' && row.class1_name != undefined ? row.class1_name+' > '+row.class2_name+' > '+row.class3_name : '',
        align: 'left',
      },
      {
        title: '세금계산서 발행일',
        dataIndex: 'tax_invoice_published_at',
        key: 'tax_invoice_published_at',
        render: (_, row) => row.tax_invoice_published_at,
        ellipsis: true,
        align: 'left',
        width: 150,
      },
      {
        title: '공급가',
        dataIndex: 'amount',
        key: 'amount',
        render: (_, row) => row.amount =='' || row.amount == undefined ? '' : priceToString(row.amount) ,
        width: 150,
        align: 'center',
      },
      {
        title: '부가세',
        dataIndex: 'vat',
        key: 'vat',
        render: (_,row) => row.vat =='' || row.vat == undefined ? '' : priceToString(row.vat),
        width: 100,
        align: 'center',
      },
      {
        title: '합계',
        dataIndex: 'total_amount',
        key: 'total_amount',
        render: (_,row) => row.total_amount =='' || row.total_amount == undefined ? '' : priceToString(row.total_amount),
        width: 100,
        align: 'center',
      },
      {
        title: '입금일',
        dataIndex: 'payment_at',
        key: 'payment_at',
        render: (_,row) => row.payment_at,
        width: 105,
        align: 'center',
      },
      {
        title: '입금자',
        dataIndex: 'payment_user_info',
        key: 'payment_user_info',
        render: (_,row) => row.payment_user_info_name,
        width: 100,
        align: 'center',
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
      <Row>
          <Search
              placeholder="검색"
              onSearch={handleSearch}
              enterButton
              allowClear
              style={{width: 300, margin: '0 10px 15px 0'}}
          />
          <wjInput.ComboBox
              placeholder="조회할 목록"
              itemsSource={new CollectionView(state.options, {
                  currentItem: null
              })}
              selectedValuePath="value"
              displayMemberPath="label"
              valueMemberPath="value"
              textChanged={handleChange}
              style={{ width: 200 , marginBottom: 20}}
          />
      </Row>
      
      <Table
        dataSource={toJS(state.list)}
        columns={state.account == '3' ? columns3 : state.account == '2'? columns2 : columns}
        scroll={{ x: 992, y: 800 }}
        rowKey={(row) => row.id}
        pagination={false}   
      />

      <Row gutter={10} className="table_bot">
          <Pagination defaultCurrent={1} current={state.pageArr.page} total={state.total} onChange={pageChange}/>
          <span style={{margin: '5px 0 0 10px'}}>행 개수 : {state.total}</span>
      </Row>

      {popout  &&
          <Popout closeWindowPortal={closeWindowPortal} > 
              <CommonView idx={state.billing_id} popoutClose={closeWindowPortal} popoutChk="Y" /> 
          </Popout>       
      }


      {visible === true && (
        <CommonView
            idx={state.billing_id}
            viewVisible={visible}
            popoutChk='N'
            drawerChk='Y'
            onClose={viewOnClose}
            pageChk='billingPay'
        />
      )}

    </Wrapper>
  );
});

export default PayList;
