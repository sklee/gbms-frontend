/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Row, Col, Table, Button, Drawer, Pagination, Input } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import axios from 'axios';
import styled from 'styled-components';
import useStore from '@stores/useStore';

const Wrapper = styled.div`
    width: 100%;
    `;

const chkAuthorDrawer = observer(({ chkVisible,chkOnClose,authorData,authorType }) => {
    const { commonStore } = useStore();

    const { Search } = Input;

    const state = useLocalStore(() => ({
        list: [],
        total: 0,
        type : '',
        
        //페이징
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },

        drawerback: 'drawerWrap',
    }));

    useEffect(() => { 
        state.type = authorType;
        fetchData();      
    }, [authorType]);

    const chkDatda = (data,code)=>{
        authorData(data,code);
        visibleClose('Y');
    }

    //drawer 닫기
    const visibleClose = (val) => {
        chkOnClose(val);
    };

    //페이징
    const pageChange = (num)=>{
        fetchData(num);
    }

    //검색
    const handleSearch = (data) => {
        console.log(data)
        fetchData(state.pageArr.page, data)
    }    


    //리스트
    const fetchData = useCallback(async (val, data) => {
        console.log(state.type);
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

        var axios = require('axios');
        var config = {
            method: 'GET',
            url: process.env.REACT_APP_API_URL +'/api/v1/products-code/contract-search?display='+state.pageArr.pageCnt+'&page='+page +'&sort_by=date&contract_type='+state.type+'&order=desc'+keyword,
            headers: {
                Accept: 'application/json',
            },
        };

        axios(config)
            .then(function (response) {                              
                // console.log(response);
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
            title: '계약 코드',
            dataIndex: 'contract_code',
            key:  'contract_code',
            render: (_, row) => row.contract_code,
            align: 'left',
        },
        {
            title: '계약명',
            dataIndex: 'name',
            key:  'name',
            render: (_, row) => row.name ,
            align: 'left',
        },
        {
            title: '등록자',
            dataIndex:  'created_name',
            key: 'created_name',
            render: (_, row) => row.created_name,
            align: 'left',
        },
        {
            title: '계약 등록일',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (_, row) => row.created_at,
            align: 'center',
        },
        {
            title: '저작권자/권리자',
            dataIndex: 'copyrights',
            key: 'copyrights',
            render: (_,row) => state.type === '1' ? row.copyrights : row.owners,
            align: 'left',
        },
        {
            title: '종이책',
            dataIndex: 'books_end_date',
            key: 'books_end_date',
            render: (_, row) => <Button onClick={(e)=>{chkDatda(row,'books')}}>{row.books_end_date}</Button>,
            align: 'left',
        },     
        {
            title: '전자책',
            dataIndex: 'ebooks_end_date',
            key: 'ebooks_end_date',
            render: (_, row) =><Button onClick={(e)=>{chkDatda(row,'ebooks')}}>{row.ebooks_end_date}</Button>,
            align: 'left',
        },  
        {
            title: '오디오북',
            dataIndex: 'audios_end_date',
            key: 'audios_end_date',
            render: (_, row) => <Button onClick={(e)=>{chkDatda(row,'audios')}}>{row.audios_end_date}</Button>,
            align: 'left',
        },  
        {
            title: '2차 저작권',
            dataIndex: 'others_end_date',
            key: 'others_end_date',
            render: (_, row) => <Button onClick={(e)=>{chkDatda(row,'others')}}>{row.others_end_date}</Button>,
            align: 'left',
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
                title='저작권 계약 검색'
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

                <div><ExclamationCircleOutlined/> 신청하는 상품 종류의 <span style={{color:'red'}}>계약 종료일을 클릭</span>해 주세요. 계약 종료된 상품(계약 종료일이 붉은 색)은 선택할 수 없습니다.</div>

                <Table
                    //dataSource={toJS(authorNameData)}
                    dataSource={state.list}
                    columns={column}
                    // scroll={{ x: 992, y: 800 }}
                    rowKey={(row) => row.author_id}    
                    pagination={false}    
                />
                {/* <div className="tailBtnWrap" style={{marginTop : 20, textAlign:'center'}}>
                <Button type="primary" htmlType='button' onClick={listOverlapChk}>
                    중복이 아님을 확인하고, 계속 등록합니다.
                </Button>
                <Button htmlType="button" onClick={visibleClose}>
                    취소
                </Button>
                </div> */}
                <Row gutter={10} className="table_bot">
                    <Pagination defaultCurrent={1} current={state.pageArr.page} total={state.total} onChange={pageChange}/>
                    <span style={{margin: '5px 0 0 10px'}}>행 개수 : {state.total}</span>
                </Row>
            </Drawer>
        </Wrapper>
    );
});

export default chkAuthorDrawer;