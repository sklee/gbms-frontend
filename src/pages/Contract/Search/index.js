/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {  Space, Button, Drawer, Row, Modal ,Table, Input} from 'antd';
import { CloseOutlined, ShrinkOutlined, ArrowsAltOutlined } from '@ant-design/icons';
import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import * as wjCore from '@grapecity/wijmo';

import * as FlexLayout from 'flexlayout-react';
import '/node_modules/flexlayout-react/style/light.css';

import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';


const { Search } = Input;
const Wrapper = styled.div`
    width: 100%;
    `;

const addDrawer = observer(({type, visible, onClose, overlapSearch, reset} ) => {

    const state = useLocalStore(() => ({
        type : '',
        idx: '',
        title : '',
        list: [],
        search : '',
        drawerback : 'drawerWrap',

        total: 0,

    }));

    const copyrights = useMemo(() => [
        {
          title: '성명/사업자명',
          dataIndex: state.type+'_name',
          key:  state.type+'_name',
          render: (_, row) => row.name ,
          align: 'left',
          width: '15%',
        },
        {
          title: '저작권자 유형',
          dataIndex:  state.type+'_type',
          key: state.type+'_type',
          render: (_, row) => row.type,
          align: 'left',
          width: '12%',
        },
        {
          title: '주민/사업자/외국인번호',
          dataIndex: state.type+'_person_no',
          key: state.type+'_person_no',
          render: (_, row) => row.person_no,
          align: 'left',
          width: '15%',
        },
        {
          title: '이메일',
          dataIndex: state.type+'_email',
          key: state.type+'_email',
          render: (_,row) => row.email,
          align: 'left',
          width: '15%',
        },
        {
          title: '최근 저작권자 지정 상품',
          dataIndex: state.type+'_latest_product',
          key: state.type+'_latest_product',
          render: (_, row) => row.latest_products.map(obj => obj.name).join('\n'),
          align: 'left',
          width: '33%',
        },     
        {
            title: '작업',
            dataIndex: state.type+'_works',
            key: state.type+'_works',
            render: (_, row) => 
                <Button
                    type="primary" 
                    size="small"
                    style={{ marginLeft: '5px' }}
                    onClick={(e) => {handleSearchSelect(row)}}
                >선택</Button>
            ,
            align: 'center',
            width: '10%',
          },    
      ],
      [],
    );
    const brokers = useMemo(() => [
        {
          title: '성명/사업자명',
          dataIndex: state.type+'_name',
          key:  state.type+'_name',
          render: (_, row) => row.name ,
          align: 'left',
          width: '53%',
        },
        {
          title: '유형',
          dataIndex:  state.type+'_type',
          key: state.type+'_type',
          render: (_, row) => row.type,
          align: 'left',
          width: '17%',
        },
        {
          title: '사업자 등록번호',
          dataIndex: state.type+'_reg_no',
          key: state.type+'_reg_no',
          render: (_, row) => row.reg_no,
          align: 'left',
          width: '20%',
        },   
        {
            title: '작업',
            dataIndex: state.type+'_works',
            key: state.type+'_works',
            render: (_, row) => 
                <Button
                    type="primary" 
                    size="small"
                    style={{ marginLeft: '5px' }}
                    onClick={(e) => {handleSearchSelect(row)}}
                >선택</Button>
            ,
            align: 'center',
            width: '10%',
          },    
      ],
      [],
    );
    const owners = useMemo(() => [
        {
          title: '성명/사업자명',
          dataIndex: state.type+'_name',
          key:  state.type+'_name',
          render: (_, row) => row.name ,
          align: 'left',
          width: '23%',
        },
        {
          title: '유형',
          dataIndex:  state.type+'_type',
          key: state.type+'_type',
          render: (_, row) => row.type,
          align: 'left',
          width: '12%',
        },
        {
          title: '국적',
          dataIndex: state.type+'_country',
          key: state.type+'_country',
          render: (_, row) => row.country,
          align: 'left',
          width: '15%',
        },    
        {
            title: '작업',
            dataIndex: state.type+'_works',
            key: state.type+'_works',
            render: (_, row) => 
                <Button
                    type="primary" 
                    size="small"
                    style={{ marginLeft: '5px' }}
                    onClick={(e) => {handleSearchSelect(row)}}
                >선택</Button>
            ,
            align: 'center',
            width: '10%',
          },    
      ],
      [],
    );
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 50,
        position: ['bottomLeft'],
    });

    
    useEffect(() => {    
        state.type = type;
        if(type === 'copyrights'){
            state.title = '국내,해외 직계약 저작권자 검색';
        }else if(type === 'brokers'){
            state.title = '중개자 검색';
        }else{
            state.title = '해외 수입 권리자 검색';
        }
        fetchData({pagination});
    }, [type]);

    //리스트
    const fetchData = useCallback(async (paging = {}) => {
        if(paging.pagination.current == undefined){
            var page = 1;
        }else{
            var page = paging.pagination.current;
        }
        if(state.search == undefined || state.search == null){
            var search = '';
        }else{
            var search = state.search;
        }

        var axios = require('axios');
        if(state.type =='' || state.type == undefined){
            var config = {
                method: 'GET',
                url:
                    process.env.REACT_APP_API_URL +'/api/v1/copyrights?keyword='+
                    search
                    +'&display=50&page=' +
                    page +
                    '&sort_by=date&order=desc',
                headers: {
                    Accept: 'application/json',
                },
            };
        }else if (state.type =='overseas'){
            var config = {
                method: 'GET',
                url:
                    process.env.REACT_APP_API_URL +'/api/v1/owners?keyword='+
                    search
                    +'&display=50&page=' +
                    page +
                    '&sort_by=date&order=desc',
                headers: {
                    Accept: 'application/json',
                },
            };
        }else{
            var config = {
                method: 'GET',
                url:
                    process.env.REACT_APP_API_URL +'/api/v1/'+state.type+'?keyword='+
                    search
                    +'&display=50&page=' +
                    page +
                    '&sort_by=date&order=desc',
                headers: {
                    Accept: 'application/json',
                },
            };
        }
        axios(config)
            .then(function (response) {
                state.list = response.data.data;
                state.total = response.data.meta.total;

                setPagination(pagination => {
                    return {
                        ...pagination,
                        current: page,
                        pageSize: 50,
                        total: response.data.meta.total, };
                });
            })
            .catch(function (error) {
                console.log(error.response);
                if (error.response.status === 401) {
                    Modal.warning({
                        title: (
                            <div>
                                세션이 만료되었습니다.
                                <br />
                                재로그인을 해주세요.
                            </div>
                        ),
                        onOk() {
                            axios.post(
                                process.env.PUBLIC_URL +
                                    '/member/session_logout',
                            );
                            window.location.href =
                                process.env.PUBLIC_URL + '/Login';
                            window.localStorage.clear();
                        },
                    });
                } else {
                    //console.log(error.response)
                }
            });
    }, []);

    const handleTableChange = (newPagination, filters) => {
        fetchData({
          pagination: newPagination,
          ...filters,
        });
    };

    const addOnClose = ()=>{
        onClose(false);
    }

    const handleSearchSelect = (details={}) =>{
        overlapSearch(details);
        addOnClose();
    };

    const onSearch = (value) => {
        state.search = value;
        fetchData({pagination});
    };

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
                onClose={addOnClose}
                closable={false}
                visible={visible}
                className={state.drawerback}
                keyboard={false}
                extra={
                    <>
                        <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={addOnClose}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >
                <Search
                    placeholder="검색어 입력"
                    allowClear
                    onSearch={onSearch}
                    style={{
                        width: 200,
                        marginBottom: 20,
                    }}
                />
                <Table
                    dataSource={toJS(state.list)}
                    columns={
                        state.type=='copyrights' ? copyrights : (state.type=='brokers' ? brokers : owners)
                    }
                    scroll={{ x: 992 }}
                    rowKey={(row) => row.id}
                    pagination={pagination}
                    onChange={handleTableChange}  
                />

                <span style={{marginTop: 20}}>행 개수 : {state.list.length}</span>

            </Drawer>
        </Wrapper>
    );
});

export default addDrawer;