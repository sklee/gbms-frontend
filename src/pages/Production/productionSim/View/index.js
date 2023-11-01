import React, {useState, useCallback, useEffect} from 'react'
import {Drawer, Button, Row, Col, Input, Select, Radio, DatePicker, Modal} from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { inject, observer, useLocalStore } from 'mobx-react';
import { toJS } from 'mobx';
import * as wjInput from '@grapecity/wijmo.react.input';
import { CollectionView } from '@grapecity/wijmo';

import ResultTable from './resultTable'; // 시뮬레이션 결과
import DevCost from './devCost';  // 개발비/기타
import PrdCost from './prdCost';  // 제작비
import PrdReview from './prdReview'; // 제작 검토 요청
import * as CalcSim from "../CalcSim.js"

import useStore from '@stores/useStore';
import moment from 'moment';

const Wrapper = styled.div`
    width: 100%;
`;

const DEF_STATE = {
    title: "",
    product_id: "",
    product_grade: "",
    product_qty: 100,
    product_date: "",
    department_code_id: "",
    results: [],
    development: {},
    production: {},
    share: []
};

const ViewDrawer = ({productionStore, visible, drawerClose, list, drawerChk}) =>{
    const { commonStore } = useStore();
    const { Option } = Select;
    const stateData = useLocalStore(() => ({ ...DEF_STATE }));

    const state = useLocalStore(() => ({
        drawerback : 'drawerWrap', //drawer class name
        data : {},
        rowList: [],
        sharers: [],
        sharersOption: [
            {
                id: 0,
                name: '허두영',
            },
            {
                id: 1,
                name: '홍길동',
            },
            {
                id: 2,
                name: '김철수',
            },
        ],
        prodInfo:{
            product_id: null,
            product_grade: 1,
            product_qty: 3000,
            product_date: null,
        },
        searchedProduct:{
            code: null,
            name: null,
            id: null,
        },
        depart:[],
        product:{},
        connection_type: null,
        tabBtnLeft: true,
        userInfo : {},
        simSale : [],
        teamData : [],
        init : false,
    }));

    useEffect(()=>{
        fetchData().then(()=>{
            if(toJS(productionStore.production).length>0){
                //basic set
                let book_cnt = [1,1,1]
                const set_basic = productionStore.production.map(e=>{
                    if(e.composition==='본책'){
                        e['basic']=e.composition+book_cnt[0]
                        book_cnt[0]++
                    }else if(e.composition==='별책'){
                        e['basic']=e.composition+book_cnt[1]
                        book_cnt[1]++
                    }else if(e.composition==='합본'){
                        e['basic']=e.composition+book_cnt[2]
                        book_cnt[2]++
                    }
                    return e
                })

                //init
                CalcSim.CalcDevCost(productionStore.production,stateData.product_qty).then(result => {
                    const temp = result;
                    var temp_details = [];
                    var temp_process = [];
                    temp.map(data=>{
                        const resres = data;
                        temp_details = [...temp_details,resres.detailsList];
                        temp_process = [...temp_process,resres.processList];
                    })

                    productionStore.detailsList = [...temp_details];
                    productionStore.processList = [...temp_process];
                });
            }
            getSimSale().then(()=>{
                state.init = true
            })
        })

        return () => {
            productionStore.resetData()
        };
    },[list]);

    const fetchData = useCallback(async () =>{
        const result = await commonStore.handleApi({
            url: '/simulations/'+list,
        });
        state.data = result.data
        state.product = result.data.product
        stateData.title = result.data.title
        stateData.product_id = result.data.product_id
        stateData.product_grade = result.data.product_grade
        stateData.product_qty = result.data.product_qty
        stateData.product_date = moment(result.data.product_date)
        stateData.department_code_id = result.data.department_code_id
        state.userInfo = {...result.data.created_info}
        stateData.results = [...result.data.results]
        stateData.development = {...result.data.development}
        stateData.production = [...result.data.production]

        productionStore.product_qty = result.data.product_qty
        productionStore.results = [...result.data.results]
        productionStore.development = {...result.data.development}
        productionStore.production = [...result.data.production]
        productionStore.contracts = result.data.product?.contractable
        stateData.share = []
    },[]);

    const getSimSale = useCallback(async () =>{
        const result = await commonStore.handleApi({
            url: '/simulation-sale?display=100&page=1&sort_by=date&order=desc',
        });
        state.simSale = result.data;
        state.teamData = toJS(state.simSale).find(e=>(e.id === state.userInfo.team));
    },[]);

    const drawerClass=(data)=>{
        if(data === 'drawerback'){
            state.drawerback = 'drawerback drawerWrap';
        }else{
            state.drawerback = 'drawerWrap';
        }          
    }

    //drawer class
    const classChkBtn = (val)=>{
        drawerClass(val)     
    }

    const btnDel = () => {
        state.searchedProduct.code = null;
        state.searchedProduct.name = null;
        state.searchedProduct.id = null;
        state.connection_type= null;
    }

    const [reviewStatus, setReviewStatus] = useState(null);
    const [prdReviewVisible, setPrdReviewVisible] = useState(false);
    const [sharers, setSharers] = useState([]);
    const handleChangeSelect = useCallback( (e) => {        
        setSharers(e);
        state.sharers = e;
    },[],);

    const tabValChange = (type) => {
        if(type == 'Dev'){
            state.tabBtnLeft = true;
        }else {
            state.tabBtnLeft = false;
        }
    }

    const PrdReviewOpen = (type)=>{
        if(type === 'request'){
            if(drawerChk === 'Y'){
                classChkBtn();
            }
            setReviewStatus(false);
        } 
        if(type === 'waiting'){  
            if(drawerChk === 'Y'){
                classChkBtn('drawerback');
            }       
            setReviewStatus(true);
        }
        if(drawerChk === 'Y'){
            classChkBtn('drawerback');
        }       
        setPrdReviewVisible(true);
    }

    const PrdReviewClose = ()=>{
        if(drawerChk === 'Y'){
            classChkBtn();
        }
        setPrdReviewVisible(false);
    }

    const reviewCompModal = () =>{
        Modal.confirm({
                title: '제작 검토 완료',
                content: (
                <div>
                    <p>제작 검토가 끝났기 때문에 제작 현황 화면으로 이동합니다.</p>
                </div>
                ),
                onOk() {},
                onCancel() {},
            });
    }

    const getData = (type)=> (data) => {
        if(type==='devcost'){
            stateData.development = toJS(data);
        }else{

        }
    };

    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback(
        (type) => (e) => {
            if(type==='product_date'){
                stateData[type] = e;
            }else{
                stateData[type] = e.target.value;
            }
    },[],);

    const handleApplyData = useCallback(
        (type) => (e) => {
            if(type==='product'){
                //qty 변경
                productionStore.qty = stateData.product_qty
                if(toJS(productionStore.production).length>0){
                    CalcSim.CalcDevCost(productionStore.production,stateData.product_qty).then(result => {
                        const temp = result;
                        var temp_details = [];
                        var temp_process = [];
                        temp.map(data=>{
                            const resres = data;
                            temp_details = [...temp_details,resres.detailsList];
                            temp_process = [...temp_process,resres.processList];
                        })

                        //old_data 적용
                        const updateProcess = temp_process.map(item => {
                            var matching = productionStore.processList.find(e=> e.basic === item.baisic)
                            if(matching){
                                if(matching.old_data){
                                    return {...item, old_data : matching.old_data}
                                }else{
                                    return item
                                }
                            }else{
                                return item
                            }
                        })
                        const updateDetails = temp_details.map(item => {
                            var matching = productionStore.detailsList.find(e=> e.basic === item.baisic)
                            if(matching){
                                if(matching.old_data){
                                    return {...item, old_data : matching.old_data}
                                }else{
                                    return item
                                }
                            }else{
                                return item
                            }
                        })

                        productionStore.detailsList = [...updateDetails];
                        productionStore.processList = [...updateProcess];

                        //setData.results 변경 반영
                        productionStore.production.map(e=>{
                            e.results = JSON.stringify(toJS(e.results));
                        })
                    });
                }

                //상품 등급 변경
                productionStore.productGrade = stateData.product_grade;
            }else if(type === 'product_cancel'){
                stateData = {
                    product_id: null,
                    product_grade: null,
                    product_qty: null,
                    product_date: null,
                };
                if(state.searchedProduct.id){
                    btnDel();
                }
            }else{
                // stateData[type] = e.target.value;
            }
    },[],);

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

    return(
        <Wrapper>
            <Drawer
                title='보기/수정'
                placement='right'
                className={state.drawerback}
                visible={visible}
                onClose={drawerClose}
                closable={false}
                keyboard={false}
                extra={
                    <>
                        <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={drawerClose}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >
                <Row gutter={10} className="table marginTop">
                    <div className="table_title">기본 정보</div>
                    <Col xs={24} lg={4} className="label">
                        제목 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={20}>
                        <Input type='text' name='title' value={stateData.title} onChange={handleChangeInput('title')}/>
                    </Col>
                    <Col xs={24} lg={4} className="label">작성자</Col>
                    <Col xs={24} lg={8}>{state.userInfo.name}</Col>
                    <Col xs={24} lg={4} className="label">부서</Col>
                    <Col xs={24} lg={8}>{state.userInfo.name}</Col>
                    <Col xs={24} lg={4} className="label">시뮬레이션 코드</Col>
                    <Col xs={24} lg={8}>{state.data.simulation_code}</Col>
                    <Col xs={24} lg={4} className="label">진행 상태</Col>
                    <Col xs={24} lg={8}>
                        {!(state.data) ? '' : state.data.status === '1' ? (
                            <>등록 <Button htmlType='button' onClick={() => PrdReviewOpen('request')}>제작 검토 요청</Button></>
                        ) : state.data.status === '2' ? (
                            <Button htmlType='button' onClick={() => PrdReviewOpen('waiting')}>제작 검토 대기</Button>
                        ) : state.data.status === '3' ? ( 
                            <Button htmlType='button' onClick={reviewCompModal}>제작 검토 완료</Button> 
                        ) : ""
                        }
                    </Col>
                    <Col xs={24} lg={4} className="label">최초 등록</Col>
                    <Col xs={24} lg={8}>{moment(state.data.created_at).format('YYYY.MM.DD')}</Col>
                    <Col xs={24} lg={4} className="label">업데이트</Col>
                    <Col xs={24} lg={8}>{moment(state.data.updated_at).format('YYYY.MM.DD')}</Col>
                    <Col xs={24} lg={4} className="label">공유</Col>
                    <Col xs={24} lg={20}>
                        <Select value={sharers} mode="multiple" showArrow style={{ width: '100%' }} placeholder="담당자를 선택하세요." onChange={handleChangeSelect}>
                            {state.sharersOption.map((item) => (
                                <Option value={item['id']} key={item['id']} > {item['name']} </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>

                {state.init &&<ResultTable teamData={state.teamData} />}
                <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20,marginBottom: 20 }}>
                    <Col>
                        <Button type='primary' htmlType='button' onClick={() => {
                            // handleSubmit
                        }}>확인</Button>
                        <Button htmlType='button' style={{marginLeft: 10}} onClick={drawerClose}>취소</Button>
                    </Col>
                </Row>

                <div style={{marginBottom: 40}}>
                    <Row gutter={10} className="table marginTop">
                        <div className="table_title">상품 정보</div>
                        <Col xs={24} lg={4} className="label">상품 <span className="spanStar">*</span></Col>
                        <Col xs={24} lg={8}>[{state.product?.product_code}]{state.product?.name}</Col>
                        <Col xs={24} lg={4} className="label">상품 등급 <span className="spanStar">*</span></Col>
                        <Col xs={24} lg={8} >
                            <Radio.Group onChange={handleChangeInput('product_grade')} value={stateData.product_grade}>
                                <Radio value={'일반'}>일반</Radio>
                                <Radio value={'준전략'}>준전략</Radio>
                                <Radio value={'전략'}>전략</ Radio>
                            </Radio.Group>
                        </Col>
                        <Col xs={24} lg={4} className="label">발주 수량 <span className="spanStar">*</span></Col>
                        <Col xs={24} lg={8} >
                            <Input type='text' onChange={handleChangeInput('product_qty')} value={stateData.product_qty}/>
                        </Col>
                        <Col xs={24} lg={4} className="label">예상 제작일 <span className="spanStar">*</span></Col>
                        <Col xs={24} lg={8} >
                            <DatePicker format={'YYYY-MM-DD'} value={stateData.product_date} onChange={handleChangeInput('product_date')}/> * 해당일 기준 예상 비용으로 계산합니다.
                        </Col>
                    </Row>
                    <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                        <Col>
                            <Button htmlType='button' className='ant-btn-etc' onClick={handleApplyData('product')}>적용</Button>
                            <Button htmlType='button' style={{marginLeft: 10}} onClick={handleApplyData('product_cancel')}>취소</Button>
                        </Col>
                    </Row>
                </div>

                <Row style={{marginBottom: 20}} >
                    <Col>
                        <Button className='tab_btn' type={state.tabBtnLeft ? 'primary' : ''} htmlType='button' onClick={(e) => tabValChange('Dev')}>개발비/기타</Button>
                        <Button className='tab_btn' type={state.tabBtnLeft ? '' : 'primary'} htmlType='button' onClick={(e) => tabValChange('Prd')}>제작비</Button>
                    </Col>
                </Row>
                {/* { state.tabBtnLeft ? <DevCost tab={state.tab}/> : <PrdCost tab={state.tab} /> } */}
                {state.init &&
                <DevCost 
                    tab={state.tabBtnLeft}
                    teamData={state.teamData}
                    qty={toJS(stateData.product_qty)}
                    data={stateData}
                    getData={getData('devcost')}
                />
                }
                {state.init &&
                <PrdCost
                    tab={state.tabBtnLeft}
                    qty={toJS(stateData.product_qty)}
                />
                }

                <PrdReview visible={prdReviewVisible} drawerClose={PrdReviewClose} disabled={reviewStatus}/>

            </Drawer>
        </Wrapper>
    );
};

export default inject('productionStore')(observer(ViewDrawer));