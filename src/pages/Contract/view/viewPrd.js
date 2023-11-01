/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState,useMemo,useRef } from 'react';
import {  Row, Col, Radio,  Button, Input,  Table, Search, Modal, Select } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import moment from 'moment';
import axios from 'axios';
import { toJS } from 'mobx';

import * as FlexLayout from "flexlayout-react";
import "/node_modules/flexlayout-react/style/light.css";

import Popout from '@components/Common/popout/popout';

const { Option } = Select;

const Wrapper = styled.div`
  width: 100%;
  .wj-flexgrid .wj-state-sticky .wj-header {opacity : unset;}
  #tplBtnViewMode { display:none; }
`;

const ViewPrd = observer(({ idx, type, tab }) => {
    const { commonStore } = useStore();

    var json = {
      global: {},
      borders: [],
      layout: {
        type: "row",
        weight: 100,
        children: [
          {
            type: "tabtype",
            id: "view-area",
            weight: 100,
            enableDeleteWhenEmpty:true,
            children: [
              {
                type: "tab",
                name: "tab",
                id:"init",
                component: "init",
                enableDrag: false,
              }
            ],
            active: true,
          }
        ]
      }
    };

    const state = useLocalStore(() => ({
      model: FlexLayout.Model.fromJson(json),
      tabLen:1,
      tabInit:false,

      data: [],
      idx : '',
      type: '',
      tab: '',
      typeText: '',
      theGrid : React.createRef(),

      pageArr : [{
        pageCnt : 30,   //리스트 총 갯수
        page : 1,       //현재페이지
        lastPage : 0,   //마지막페이지
        pageText : '',  //페이지 정보
      }],
    }));
  
    useEffect(() => { 
        state.idx = idx;
        state.type = type;
        state.tab = tab;
        if(tab == "viewprd"){
            fetchData(idx, type);
        }

        if(type === 'copyrights'){
            state.typeText = '중개 구분';           
        }else if(type === 'owners'){
            state.typeText = '중개자';
        }else if(type === 'brokers'){
            state.typeText = '권리자';
        }
    }, [idx, type,tab]);

  
    const fetchData = useCallback(async (idx,type) => {
      const result = await axios.get(
        process.env.REACT_APP_API_URL +'/api/v1/'+state.type+'-product/'+idx,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        },
      )
  
      if (result.data.data) {      
        state.data =result.data.data;       
      }
    }, []);

    const columns = useMemo(() => [
        {
            title: '상품 종류',
            dataIndex: 'product_type',
            key: 'product_type',
            render: (_, row) => row.product_type ,
            align: 'left',
            width: 130,
        },
        {
            title: '상품명',
            dataIndex: 'name',
            key: 'name',
            render: (_, row) => <div><a href='/'>{row.name}</a><button type="button" onClick={(e)=>setPopoutOpen(true)}>N</button></div>,
            align: 'left',
            width: 130,
        },
        {
            title: '상품 코드',
            dataIndex: 'code',
            key: 'code',
            render: (_, row) => row.code,
            ellipsis: true,
            width: 130,
            align: 'left',
        },
        {
            title: 'ISBN',
            dataIndex: 'isbn',
            key: 'isbn',
            render: (_, row) => row.isbn ,
            width: 50,
            align: 'center',
        },
        {
            title: '출시 상태',
            dataIndex: 'release',
            key: 'release',
            render: (_,row) => row.release,
            width: 100,
            align: 'center',
        },
        {
            title: '출시일',
            dataIndex: 'release_date',
            key: 'release_date',
            render: (_,row) => row.release_date,
            width: 100,
            align: 'center',
        },
        {
            title: state.typeText,
            // title: typeText,
            dataIndex: 'contribute',
            key: 'contribute',
            render: (_,row) => row.contribute,
            width: 100,
            align: 'center',
        }, 
        {
            title: '저작권 계약일',
            dataIndex: 'contribute',
            key: 'contribute',
            render: (_,row) => row.contribute,
            width: 100,
            align: 'center',
        }, 
        {
            title: '저작권 종료일',
            dataIndex: 'contribute',
            key: 'contribute',
            render: (_,row) => row.contribute,
            width: 100,
            align: 'center',
        }, 
        
    ],[],);
      
    const columns2 = useMemo(() => [
        {
            title: '상품 종류',
            dataIndex: 'product_type',
            key: 'product_type',
            render: (_, row) => row.product_type ,
            align: 'left',
            width: 130,
        },
        {
            title: '상품명',
            dataIndex: 'name',
            key: 'name',
            render: (_, row) => <div><a href='/'>{row.name}</a><button type="button" onClick={(e)=>setPopoutOpen(true)}>N</button></div>,
            align: 'left',
            width: 130,
        },
        {
            title: '상품 코드',
            dataIndex: 'code',
            key: 'code',
            render: (_, row) => row.code,
            ellipsis: true,
            width: 130,
            align: 'left',
        },
        {
            title: 'ISBN',
            dataIndex: 'isbn',
            key: 'isbn',
            render: (_, row) => row.isbn ,
            width: 50,
            align: 'center',
        },
        {
            title: '출시 상태',
            dataIndex: 'release',
            key: 'release',
            render: (_,row) => row.release,
            width: 100,
            align: 'center',
        },
        {
            title: '출시일',
            dataIndex: 'release_date',
            key: 'release_date',
            render: (_,row) => row.release_date,
            width: 100,
            align: 'center',
        },
        {
            title: '기여 구분',
            dataIndex: 'contribute',
            key: 'contribute',
            render: (_,row) => row.contribute,
            width: 100,
            align: 'center',
        },

    ],[],);

    //팝업
    const [popout, setPopoutOpen] = useState(false);
    const closeWindowPortal=()=>{
        setPopoutOpen(false);
    }
  const tabRef = useRef();

  return (
    <Wrapper>

        <Row id="gridWrap" className="gridWrap"  ref={tabRef}>
            <Table
                dataSource={toJS(state.data)}
                columns={state.type === 'contributors' ? columns2 :  columns}
                scroll={{ x: 992, y: 800 }}
                rowKey={(row) => row.id}
            
            />
        </Row>     
        {popout  &&
            <Popout closeWindowPortal={closeWindowPortal} > 
            </Popout>
        }
    </Wrapper>
  );
});

export default ViewPrd;
