/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Table,  Button,  Drawer,Pagination, Input, Row, DatePicker, Col, Checkbox} from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import axios from 'axios';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import moment from 'moment';

const Wrapper = styled.div`
    width: 100%;
    `;

const DEF_STATE = {
    // DB Data
    price:'',
    price_date: '',
};

const addDrawer = observer(({ addVisible,addOnClose,addData, typeChk,drawerChk }) => {
    const { commonStore } = useStore();

    const { Search } = Input;

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 
    const [list, setList] = useState('');

    const state = useLocalStore(() => ({
        type : '',
        title : '',
        drawerback: 'drawerWrap',

        list: [],
        total: 0,

        authorVal : '',
        authorKey : '',

        today: moment().format('YYYY-MM-DD'),
        
        //페이징
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },
    }));

    useEffect(() => { 
        state.type = typeChk;

        if(typeChk === 'product'){
            state.title = '상품 등록'
            fetchData('','','products');
        }else if(typeChk === 'price'){         
            state.title = '정가 변경 등록'  
        }else{           
            state.title = '기여자 등록'
            fetchData('','','contributors');      
        }       
        if(drawerChk !== 'Y'){
            state.drawerback = 'drawerWrap'
        }
      
    }, [typeChk]);

    const chkDatda = (data,type)=>{
        if(type === 'price'){
            addData(stateData,state.type)
            addOnClose();
        }else{
            console.log(data)
            addData(data,state.type);      
            addOnClose();      
        }       
    }

    //drawer 닫기
    const visibleClose = () => {
        addOnClose();
    };

    //페이징
    const pageChange = (num)=>{
        fetchData(num);
    }

    //검색
    const handleSearch = (data) => {
        console.log(data)
        fetchData(state.pageArr.page, data,'products','contributors')
    }    

    const handleChangeInput = useCallback((type) => (e) => {
        if(type ==='expected_release_date' || type === 'release_date'){
            stateData[type] = e.format('YYYY-MM-DD');  
        }else if(type === 'price'){
            var price = e.target.value.split(',').join("");
            stateData[type] = priceToString(price)                   
        }else{                   
            stateData[type] = e.target.value;
        }                 
    },[],);

    //기여 구분 선택 drawer
    const [checkVisible, setCheckVisible] = useState(false);
    const [chkboxVal, setChkboxVal] = useState('');
    const checkVisibleClose = () => {
        state.drawerback = 'drawerInnerWrap';
        setCheckVisible(false);
        setChkboxVal('');
    };

    const authorAddBtn = (e)=>{
        setCheckVisible(true);   
        state.authorKey =e ;
        state.drawerback = 'drawerback drawerInnerWrap';     
    }     

    //기여 구분 선택
    const onChkboxChange=(val)=>{
        console.log(val);
        setChkboxVal(val)
    }
    
    const okAuthorChkbox = (val)=>{

        var arr = []
        var arrData = []
        state.list.forEach((e) => {
            if(state.authorKey.id === e.id){
                e.authorType = val;
                arrData = [e]
            }
            arr = [...arr, e]
            
        });
        console.log(arrData)
        state.list = arr
        state.drawerback = 'drawerInnerWrap';        
        setCheckVisible(false);
        // setList(state.list);
        setList(arr);
        chkDatda(arrData, '')
        
    }

    const EditableCell = ({
        editing,
        dataIndex,
        title,
        inputType,
        record,
        index,
        children,
        ...restProps
    }) => {
        return (
            
        <td {...restProps}>
            {editing ? (
                state.authorVal
            ) : (
                children
            )}
        </td>
        );
    };

    // const save = async (data) => {
    //     try {
    //     //   const row = await form.validateFields();
    //       const newData = [...data];
    //       const index = newData.findIndex((item) => state.authorKey === item.key);
    // console.log(index)
    // console.log(state.authorKey)
    //       if (index > -1) {
    //         const item = newData[index];
    //         console.log(item)
    //         state.list[state.authorKey]['latest_product'] = item;
    //         // newData.splice(index, 1, { ...item });
    //         // setList(state.list);latest_product
    //         // https://codesandbox.io/s/3sowin?file=/demo.js:1022-1026
    //         // setEditingKey('');
    //       } 
    //     //   else {
    //     //     newData.push(row);
    //     //     // setData(newData);
    //     //     // setEditingKey('');
    //     //   }

    //       console.log(newData)
    //     } catch (errInfo) {
    //       console.log('Validate Failed:', errInfo);
    //     }
    //   };

    //천다위 콤마
    const priceToString= (price)=> {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    //리스트
    const fetchData = useCallback(async (val, data, type,contributors) => {
        if (val == '' || val == '0' || val == undefined) {
            var page = 1;
        } else {
            var page = val;
        }

        if(data){
            var keyword = '&keyword='+data
        }else{
            var keyword = ''
        }

        var axios = require('axios');
        if(contributors === 'contributors'){
            type = 'contributors'
        }

        var config = {
            method: 'GET',
            url: process.env.REACT_APP_API_URL +'/api/v1/'+type+'?display='+state.pageArr.pageCnt+'&page='+page +'&sort_by=date&order=desc'+keyword,
            headers: {
                Accept: 'application/json',
            },
        };

        axios(config)
            .then(function (response) {                              
                var result_page =
                    (state.pageArr.page - 1) * state.pageArr.pageCnt;
                var str_no = response.data.meta.total - result_page;
                console.log(response.data.data)
                response.data.data.map((e, number) => {
                    e.cnt = str_no - number;
                    if(type !== 'products'){
                        if(e.latest_product.length > 0 ){
                            var prd = [];
                            e.latest_product.map((a) => {
                                prd = [...prd, a.name]
                            });
                            // e.latest_product = prd.join(',')
                            e.latest_product = prd
                        }else{
                            e.latest_product = ''
                        }
                    }
                    if(type === 'products'){

                    }
                    
                });
    console.log(response.data.data)
                setList(response.data.data);
                state.list = response.data.data;
                state.total = response.data.meta.total;
                state.pageArr.page = response.data.meta.current_page;
                state.pageArr.pageCnt = response.data.meta.per_page;
            })
            .catch(function (error) {
                console.log(error);
            });
    }, []);    

    const contributors = useMemo(() => [
        // {
        //     title: '번호',
        //     dataIndex: '_cnt',
        //     key:  '_cnt',
        //     render: (_, row) => row.cnt,
        //     align: 'center',
        //     width: 80,
        // },
        {
            title: '성명/사업자명(실명)',
            dataIndex: '_name',
            key:  '_name',
            render: (_, row) => row.name ,
            align: 'left',
            width: 120,
        },
        {
            title: '성명/사업자명(공개용)',
            dataIndex: 'public_name',
            key:  'public_name',
            render: (_, row) => row.public_name ,
            align: 'left',
            width: 120,
        },
        // {
        //     title: '통합전산망 기여자 번호',
        //     dataIndex:  'contributor_no',
        //     key: 'contributor_no',
        //     render: (_, row) => row.contributor_no,
        //     align: 'left',
        // },
        {
            title: '유형',
            dataIndex: '_type',
            key: '_type',
            render: (_, row) => row.type,
            align: 'left',
            width:100,
        },
        {
            title: '이메일',
            dataIndex: 'email',
            key: 'email',
            render: (_,row) => row.email,
            align: 'left',
            width:200,
        },
        {
            title: '최근 기여자 지정 상품',
            dataIndex: 'latest_product',
            key: 'latest_product',
            // render: (_, row) => row.latest_product,
            render: (_, row) => row.latest_product.length > 0 ? row.latest_product.map((e) => (<div id='proBtn'>{e}</div>)) : row.latest_product,
            align: 'left',
            width:200,
        },   
        {
            title: '작업',
            dataIndex: 'authorType',
            key: 'authorType',
            render: (_, row) => row.authorType !== '' && row.authorType !== undefined ? row.authorType.join(", ") : <button className='btnText blueTxt' type="primary" onClick={(e)=>{authorAddBtn(row)}}>추가</button> ,
            align: 'center',
            editable: true,
            width: 80,
        },  
        // {
        //     title: '작업',
        //     dataIndex: 'addBtn',
        //     key: 'addBtn',
        //     width: 80,
        //     render: (_, row) => row.author_type !== '' && row.authorType !== undefined && <Button onClick={(e)=>{chkDatda(row)}}>추가</Button>,
        //     align: 'left',
        //     // editable: true,
        // },    
      ],
      [list, state.list],
    );

    const product = useMemo(
      () => [
        {
          title: '상품 코드',
          dataIndex: 'code',
          key:  'code',
          render: (_, row) => row.cnt,
          align: 'left',
        },
        {
          title: '상품명(공식)',
          dataIndex: 'name',
          key:  'name',
          render: (_, row) => row.name,
          align: 'left',
        },
        {
          title: '상품명(내부용)',
          dataIndex:  'internal_name',
          key: 'internal_name',
          render: (_, row) => row.internal_name,
          align: 'left',
        },
        {
          title: '회사',
          dataIndex: 'company',
          key: 'company',
          render: (_, row) => row.company,
          ellipsis: true,
          align: 'left',
        },
        {
          title: '브랜드',
          dataIndex: 'brand',
          key: 'brand',
          render: (_, row) => row.brand,
          align: 'left',
        },
        {
          title: '상품 종류',
          dataIndex: 'product_type',
          key: 'product_type',
          render: (_,row) => row.product_type,
          align: 'left',
        },
        {
            title: '출시 상태',
            dataIndex: 'release',
            key: 'release',
            render: (_,row) => row.release,
            align: 'left',
        },
        {
            title: '저작권 종료일',
            dataIndex: 'last_date',
            key: 'last_date',
            render: (_,row) => row.last_date,
            align: 'left',
        },
        {
            title: '작업',
            dataIndex: 'addBtn',
            key: 'addBtn',
            width: 80,
            // render: (_, row) => row.product_type === '' && row.last_date > state.today && <Button onClick={(e)=>{chkDatda(row)}}>추가</Button>,
            render: (_, row) => row.product_type === '비매품' || row.product_type === '종이책(세트)' || row.product_type === '오디오북' || row.last_date < state.today ? '' : <button className='btnText blueTxt' onClick={(e)=>{chkDatda(row)}}>추가</button>,
            align: 'center',
            align: 'center',
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
                visible={addVisible}  
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
                {state.type !== 'price'
                    ?<> 
                        <Search
                            placeholder="검색어 입력"
                            onSearch={handleSearch}
                            enterButton
                            allowClear
                            style={{width: 300, marginBottom: 15}}
                        />
                        
                        <Table
                            dataSource={list}
                            columns={state.type === 'contributors' ? contributors : product}
                            // scroll={{ x: 992, y: 800 }}
                            // scroll={{ y: 600 }}
                            rowKey={(row) => row.id}       
                            pagination={false}     
                            components={{
                                body: {
                                    cell: EditableCell,
                                },
                            }}
                        /> 

                        <div className="table_bot" >
                            <div className='btn-group'>
                                <Pagination defaultCurrent={1} defaultPageSize={50} current={state.pageArr.page} total={state.total} showSizeChanger={false} onChange={pageChange}/> 
                                <span style={{marginLeft: 20}}>행 개수 : {state.total}</span>
                            </div>
                            
                        </div>
                    </>

                    :<>
                        <Row gutter={10} className="table">       
                            <Col xs={24} lg={6} className="label">
                                변경할 정가
                            </Col>
                            <Col xs={24} lg={18}>
                                <Input className="tableInput" type="text" name="price" value={stateData.price} onChange={handleChangeInput('price')}  autoComplete="off" />                                           
                            </Col>

                            <Col xs={24} lg={6} className="label">
                                반영일
                            </Col>
                            <Col xs={24} lg={18}>
                                <DatePicker defaultValue={moment()} format={'YYYY-MM-DD'} onChange={handleChangeInput('price_date')}  />                                         
                            </Col>                            
                        </Row>
                        <div style={{marginTop: '10px',fontWeight: '600'}}>* 통합전산망에도 정가 변경을 꼭 등록해주세요.</div>

                        <div className="tailBtnWrap" style={{marginTop : 20, textAlign:'center'}}>
                            <Button type="button" className="btn-primary" onClick={(e) =>chkDatda('','price')}>
                                확인
                            </Button>
                            <Button htmlType="button" onClick={visibleClose}>
                                취소
                            </Button>
                        </div>
                    </>
                }
               

                
            </Drawer>
            
            {checkVisible === true &&
                <Drawer
                    title='기여 구분 선택'
                    placement='right'
                    visible={checkVisible}  
                    onClose={checkVisibleClose}  
                    className={state.drawerback}
                    closable={false}
                    keyboard={false}
                    extra={
                        <>
                            <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                                {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                            </Button>
                            <Button onClick={checkVisibleClose}>
                                <CloseOutlined />
                            </Button>
                        </>
                    }   
                >
                    <Checkbox.Group style={{width: '100%',}} onChange={onChkboxChange} >  
                        <Row>
                            <Col span={4}>
                                <Checkbox value="저자">저자</Checkbox>
                            </Col>
                            <Col span={4}>
                                <Checkbox value="번역">번역</Checkbox>
                            </Col>
                            <Col span={4}>
                                <Checkbox value="감수">감수</Checkbox>
                            </Col>
                            <Col span={4}>
                                <Checkbox value="삽화">삽화</Checkbox>
                            </Col>
                            <Col span={4}>
                                <Checkbox value="사진">사진</Checkbox>
                            </Col>
                            <Col span={4}>
                                <Checkbox value="기획">기획</Checkbox>
                            </Col>
                        </Row>
                    </Checkbox.Group>

                    <div className="tailBtnWrap" style={{marginTop : 20, textAlign:'center'}}>
                        <Button type="button" className="btn-primary" onClick={(e) =>okAuthorChkbox(chkboxVal)}>
                            확인
                        </Button>
                        <Button htmlType="button" onClick={checkVisibleClose}>
                            취소
                        </Button>
                    </div>
                </Drawer>
            }

        </Wrapper>
    );
});

export default addDrawer;