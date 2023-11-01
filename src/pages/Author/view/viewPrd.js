/* eslint-disable react-hooks/exhaustive-deps*/
import React from 'react';
import {  Row,  Button, Input, Table, Select } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import moment from 'moment';
import axios from 'axios';
import { toJS } from 'mobx';
import Popout from '@components/Common/popout/popout';
import View from '@pages/Product/view';
import * as FlexLayout from "flexlayout-react";
import "/node_modules/flexlayout-react/style/light.css";
const Wrapper = styled.div`
  width: 100%;
  .wj-flexgrid .wj-state-sticky .wj-header {opacity : unset;}
  #tplBtnViewMode { display:none; }
`;

const ViewPrd = observer(({ idx, type, tab, drawerChk, drawerClass }) => {
    const [popout, setPopoutOpen] = React.useState(false);
    const [viewVisible, setViewVisible] = React.useState(false);
    const tabRef = React.useRef();
    const { Search } = Input;
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
                    children: [{
                        type: "tab",
                        name: "tab",
                        id:"init",
                        component: "init",
                        enableDrag: false,
                    }],
                    active: true,
                }
            ]
        }
    }
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


      //상품 정보
      prd_idx : '',
      contractType: '',
      viewData : [],

      pageArr : [{
        pageCnt : 30,   //리스트 총 갯수
        page : 1,       //현재페이지
        lastPage : 0,   //마지막페이지
        pageText : '',  //페이지 정보
      }],
    }))
    React.useEffect(() => { 
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
    //drawer class
    const classChkBtn = (val)=>{
        drawerClass(val)     
    }
    const fetchData = React.useCallback(async (idx,type) => {
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
            console.log(result.data.data)
            state.data =result.data.data;       
        }
    }, [])
    const columns = React.useMemo(() => [
        {
            title: '상품 종류',
            dataIndex: 'product_type',
            key: 'product_type',
            render: (_, row) => row.product_type ,
            align: 'left',
            width: 120,
        },
        {
            title: '상품명',
            dataIndex: 'product_name',
            key: 'product_name',
            render: (_, row) => <div className="incell">
                <Button className="btnLink" onClick={(e)=>{state.prd_idx=row.id;viewData('drawer');}}>{row.product_name}</Button>
                <div className="btnLayoutWrap">
                    <Button type="button" shape="circle" onClick={(e)=>{state.prd_idx=row.id;viewData('popout');}}>N</Button>
                </div>
                </div>,
            align: 'left',
            width: '*',
        },
        {
            title: '출시 상태',
            dataIndex: 'release',
            key: 'release',
            render: (_,row) => row.release_date===null?'미출시':'출시(출간)',
            width: 100,
            align: 'left',
        },
        {
            title: '출시일',
            dataIndex: 'release_date',
            key: 'release_date',
            render: (_,row) => row.release_date,
            width: 100,
            align: 'left',
        },
        {
            title: ()=>{if(type === 'copyrights'){
                return '중개 구분';           
            }else if(type === 'owners'){
                return '중개자';
            }else if(type === 'brokers'){
                return '권리자';
            }},
            // title: typeText,
            dataIndex: 'broker',
            key: 'broker',
            render: (_,row) => {if(type === 'copyrights'){
                return row.broker??'직계약';           
            }else if(type === 'owners'){
                return row.broker??'직계약';
            }else if(type === 'brokers'){
                return row.copyright_owener??'직계약';
            }},
            width: 100,
            align: 'left',
        }, 
        {
            title: '저작권 계약일',
            dataIndex: 'contract_date',
            key: 'contract_date',
            render: (_,row) => row.contract_date,
            width: 100,
            align: 'left',
        }, 
        {
            title: '저작권 종료일',
            dataIndex: 'contract_expired_date',
            key: 'contract_expired_date',
            render: (_,row) => {
                if(moment().format('YYYY-MM-DD') > row.contract_expired_date){
                    return <span style={{color:'#FF0000'}}>{row.contract_expired_date}</span>;
                }else{
                    return row.contract_expired_date;
                }
            },
            width: 100,
            align: 'left',
        }, 
        
    ],[],)
    const columns2 = React.useMemo(() => [
        {
            title: '상품 종류',
            dataIndex: 'product_type',
            key: 'product_type',
            render: (_, row) => row.product_type ,
            align: 'left',
            width: 120,
        },
        {
            title: '상품명',
            dataIndex: 'name',
            key: 'name',
            render: (_, row) => <div className="incell">
                    <Button className="btnLink" onClick={(e)=>{state.prd_idx=row.id;viewData('drawer');}}>{row.name}</Button>
                    <div className="btnLayoutWrap">
                        <Button type="button" shape="circle" onClick={(e)=>{state.prd_idx=row.id;viewData('popout');}}>N</Button>
                    </div>
                </div>,
            align: 'left',
            width: '*',
        },
        {
            title: '출시 상태',
            dataIndex: 'release',
            key: 'release',
            render: (_,row) => row.release_date===null?'미출시':'출시(출간)',
            width: 100,
            align: 'left',
        },
        {
            title: '출시일',
            dataIndex: 'release_date',
            key: 'release_date',
            render: (_,row) => row.release_date,
            width: 100,
            align: 'left',
        },
        {
            title: '기여 구분',
            dataIndex: 'contributes',
            key: 'contributes',
            render: (_,row) => row.contributes,
            width: 100,
            align: 'left',
        },

    ],[],)
    //상품정보
    const viewData = React.useCallback(async (type,tit) => {    
        const result = await axios.get(
          process.env.REACT_APP_API_URL +'/api/v1/products/'+state.prd_idx,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          },
        )
        state.viewData = result.data.data;
        state.contractType =result.data.data.contract_type;

        if(type === 'drawer'){
            if(drawerChk === 'Y'){
                classChkBtn('drawerback');
            }
            setViewVisible(true);
        }else{
            setPopoutOpen(true);
        }
    }) 
    //검색
    const handleSearch = (data) => {
        console.log(data)
        fetchData(state.pageArr.page, data)
    } 
    //팝업
    const closeWindowPortal=()=>{
        setPopoutOpen(false);
    }
    const viewOnClose=()=>{
        if(drawerChk === 'Y'){
            classChkBtn();
        }
        setViewVisible(false);
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

            <Row id="gridWrap" className="gridWrap"  ref={tabRef}>
                <Table
                    // size='small'
                    dataSource={toJS(state.data)}
                    columns={state.type === 'contributors' ? columns2 :  columns}
                    scroll={{ x: 992 }}
                    rowKey={(row) => row.id}
                    pagination={{ position: ['bottomLeft'] }}
                />
            </Row>

            <Row gutter={10} className="table_bot">
                <span>행 개수 : {state.data.length}</span>
            </Row> 

            {popout  &&
                <Popout closeWindowPortal={closeWindowPortal} > 
                    <View
                        idx={state.prd_idx}
                        popoutClose={closeWindowPortal}
                        popoutChk="Y"
                        contractType={state.contractType}
                        viewData ={state.viewData}
                    />
                </Popout>
            }

            {viewVisible === true && (
                <View
                    idx={state.prd_idx}
                    viewVisible={viewVisible}
                    popoutChk='N'
                    drawerChk='Y'
                    viewOnClose={viewOnClose}
                    contractType={state.contractType}
                    viewData ={state.viewData}
                />
            )}
        </Wrapper>
    )
})

export default ViewPrd
