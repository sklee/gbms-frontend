/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Table, Button, Drawer,Pagination, Input } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import axios from 'axios';
import styled from 'styled-components';
import useStore from '@stores/useStore';

const Wrapper = styled.div`
    width: 100%;
    `;

const chkProDrawer = observer(({ chkVisible,chkProOnClose,proData,companyType }) => {
    const { commonStore } = useStore();

    const { Search } = Input;

    const state = useLocalStore(() => ({
        drawerback: 'drawerWrap',
        list: [],
        total: 0,
        
        //페이징
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },

    }));

    useEffect(() => { 
       fetchData('','',companyType);      
    }, []);

    const chkDatda = (code,name,id)=>{
        proData(code,name,id);
        visibleClose();
    }

    //drawer 닫기
    const visibleClose = () => {
        chkProOnClose();
    };

    //페이징
    const pageChange = (num)=>{
        fetchData(num);
    }

    //검색
    const handleSearch = (data) => {
        fetchData(state.pageArr.page, data, companyType)
    }    

    //리스트
    const fetchData = useCallback(async (val,data, company) => {
        if (val == '' || val == '0' || val == undefined) {
            var page = 1;
        } else {
            var page = val;
        }

        if(data){
            var keyword = '&keyword='+data
        }else{
            var keyword = '';
        }

        if(company){
            var companyType = '&company='+company
        }else{
            var companyType = ''
        }

        var axios = require('axios');
        var config = {
            method: 'GET',
            url: process.env.REACT_APP_API_URL +'/api/v1/products-code/product-search?display='+state.pageArr.pageCnt+'&page='+page +'&sort_by=date&order=desc'+keyword+companyType,
            headers: {
                Accept: 'application/json',
            },
        };

        axios(config)
            .then(function (response) {                              
                console.log(response);
                var result_page =
                    (state.pageArr.page - 1) * state.pageArr.pageCnt;
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

    const column = useMemo(() => [
        {
            title: '회사',
            dataIndex: 'company',
            key:  'company',
            render: (_, row) => {
                if (row.company === '도서출판 길벗') {
                  return '길벗';
                }
                // These two are merged into above cell
                if (row.company === '길벗스쿨') {
                  return '스쿨';
                }
                return row.company;
            },
            align: 'left',
            width:70,
        },
        {
            title: '브랜드',
            dataIndex: 'brand',
            key:  'brand',
            render: (_, row) => {
                if (row.brand === '도서출판 길벗') {
                  return '길벗';
                }
                // These two are merged into above cell
                if (row.brand === '길벗스쿨') {
                  return '스쿨';
                }
                return row.brand;
            },
            align: 'left',
            width:90,
        },
        {
            title: '상품 종류',
            dataIndex:  'product_type',
            key: 'product_type',
            render: (_, row) => row.product_type,
            align: 'left',
            width:120,
        },
        {
            title: '상품 코드',
            dataIndex: 'product_code',
            key: 'product_code',
            render: (_, row) => row.product_code ,
            align: 'left',
            width:120,
        },
        {
            title: '상품명',
            dataIndex: 'name',
            key: 'name',
            render: (_,row) => row.name,
            align: 'left',
            width:'*',
        },
        {
            title: '출시 상태',
            dataIndex: 'product_status',
            key: 'product_status',
            render: (_, row) => row.product_status,
            align: 'left',
            width:130,
        },     
        {
            title: '작업',
            dataIndex: 'add',
            key: 'add',
            render: (_, row) => <button className='btnText blueTxt' onClick={(e)=>{chkDatda(row.product_code, row.name, row.id)}}>추가</button>,
            align: 'center',
            width:100,
        },    
    ],[],);

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
                title={'상품 검색'}
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
                <Search
                    placeholder="검색어 입력"
                    onSearch={handleSearch}
                    enterButton
                    allowClear
                    style={{width: 300, marginBottom: 15}}
                />
                
                <Table
                    dataSource={state.list}
                    columns={column}
                    scroll={{ x: 992 }}
                    rowKey={(row) => row.author_id}    
                    pagination={false}      
                />

                <div className="table_bot" >
                    <div className='btn-group'>
                        <Pagination defaultCurrent={1} current={state.pageArr.page} total={state.total} defaultPageSize={50} onChange={pageChange}/>
                        <span style={{marginLeft: 20}}>행 개수 : {state.total}</span>
                    </div>
                </div>   
            </Drawer>
        </Wrapper>
    );
});

export default chkProDrawer;