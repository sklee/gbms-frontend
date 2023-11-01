import React, {useState, useEffect, useCallback} from 'react'
import {Drawer, Button, Row, Col, Input, Select, Radio, Tabs, DatePicker, Modal} from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { inject, observer, useLocalStore } from 'mobx-react';
import { toJS } from 'mobx';
import * as wjInput from '@grapecity/wijmo.react.input';
import { CollectionView } from '@grapecity/wijmo';

import ResultTable from './resultTable'; // 시뮬레이션 결과
import ChkProduct from './chkProduct' // 상품검색
import DevCost from './devCost';  // 개발비/기타
import PrdCost from './prdCost';  // 제작비
import * as CalcSim from "../CalcSim.js"

import axios from 'axios';
import useStore from '@stores/useStore';
import moment from 'moment';

const { TabPane } = Tabs;

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

const SimDrawer = ({productionStore, visible, drawerClose, drawerChk}) =>{
    const { commonStore } = useStore();
    const { Option } = Select
    const stateData = useLocalStore(() => ({ ...DEF_STATE }));

    const state = useLocalStore(() => ({
        drawerback : 'drawerWrap', //drawer class name
        type: '',
        prodInfo:{
            product_id: null,
            product_grade: null,
            product_qty: null,
            product_date: null,
        },
        searchedProduct:{
            code: null,
            name: null,
            id: null,
        },
        depart:[],
        connection_type: null,
        tabBtnLeft: true,
        userInfo : [],
        simSale : [],
        teamData : [],
    }));

    useEffect(() =>{
        if(visible){
            state.userInfo = commonStore.user;
            getSimSale();
        }

        return () => {
            productionStore.resetData();
        };
    },[visible])

    const getSimSale = useCallback(async () =>{
        const result = await commonStore.handleApi({
            url: '/simulation-sale?display=100&page=1&sort_by=date&order=desc',
        });
        state.simSale = result.data;
        state.teamData = toJS(state.simSale).find(e=>(e.id === state.userInfo.team));
        // stateData.department_code_id = e.selectedValue;

        const options = [];
        result.data.forEach(e=>{
            options.push({
                label: e.department,
                value: Number(e.id),
            });
        });
        state.depart = options;
    },[]);

    const getProducts = useCallback(async (id) =>{
        const result = await commonStore.handleApi({
            url: '/products/'+id,
        });
        return result.data.contractable
    },[]);

    const searchedProduct = (code, name, id) => {
        state.searchedProduct.code = code;
        state.searchedProduct.name = name;
        state.searchedProduct.id = id;
    }

    const btnDel = () => {
        state.searchedProduct.code = null;
        state.searchedProduct.name = null;
        state.searchedProduct.id = null;
        state.connection_type= null;
    }

    const tabValChange = (type) => {
        if(type == 'Dev'){
            state.tabBtnLeft = true;
        }else {
            state.tabBtnLeft = false;
        }
    }

    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback(
        (type) => (e) => {
            if(type==='product_date'){
                state.prodInfo[type] = e;
            }else if(type === 'connection_type'){
                state[type] = e;
            }else if(type === 'product_qty'){
                state.prodInfo[type] = e.target.value;
            }else if(type==='team'){
                stateData.department_code_id = e.selectedValue;
                state.userInfo['design'] = toJS(state.simSale).find(e=>(e.id === stateData.department_code_id));
            }else if(type==='title'){
                stateData[type] = e.target.value;
            }else{
                state.prodInfo[type] = e.target.value;
            }
    },[],);

    const handleApplyData = useCallback(
        (type) => (e) => {
            if(type==='product'){
                stateData.product_grade = state.prodInfo.product_grade;
                stateData.product_qty = state.prodInfo.product_qty;
                stateData.product_date = state.prodInfo.product_date;
                stateData.product_id = state.searchedProduct.id;

                //qty 변경
                productionStore.qty = state.prodInfo.product_qty
                if(toJS(productionStore.production).length>0){
                    CalcSim.CalcDevCost(productionStore.production,state.prodInfo.product_qty).then(result => {
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

                //상품정보 변경
                getProducts(state.searchedProduct.id).then(data =>{
                    productionStore.contracts = {...toJS(data)};
                })

                //상품 등급 변경
                productionStore.productGrade = stateData.product_grade;
            }else if(type === 'product_cancel'){
                state.prodInfo = {
                    product_id: null,
                    product_grade: null,
                    product_qty: null,
                    product_date: null,
                };
                if(state.searchedProduct.id){
                    btnDel();
                }
            }else{
                // state.prodInfo[type] = e.target.value;
            }
    },[],);

    const getData = (type)=> (data) => {
        if(type==='devcost'){
            stateData.development = toJS(data);
        }else{

        }
    };

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

    //상품 검색    
    const [productVisble, setProductVisble] = useState(false);
    const chkProDrawer = () => {
        if(drawerChk === 'Y'){
            classChkBtn('drawerback');
        }       
        setProductVisble(true);
    };

    //상품검색 닫기
    const chkProOnClose = () => {
        if(drawerChk === 'Y'){
            classChkBtn();
        }
        setProductVisble(false);
    };

    const handleSubmit = useCallback(async (e)=> {      
        
        const sendData = {
            title: stateData.title,
            product_id: stateData.product_id,
            product_grade: stateData.product_grade,
            product_qty: stateData.product_qty,
            product_date: moment(stateData.product_date).format('YYYY-MM-DD'),
            department_code_id: stateData.department_code_id,
            results: [...productionStore.result],
            development: {...productionStore.development},
            productions: [...productionStore.production],
            share: []
        }

        commonStore.handleApi({
            method : 'POST',
            url : `/simulations`,
            data : sendData
        })
        .then((result) => {
            Modal.success({
              content: '등록이 완료되었습니다.',
            })
            drawerClose()
        })
        
    }, []);

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
        <Wrapper className='simDrawer'>
            <Drawer
                title='제작 시뮬레이션 등록'
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
                        <Input type='text' name='title' onChange={handleChangeInput('title')}/>
                    </Col>
                    <Col xs={24} lg={4} className="label">작성자</Col>
                    <Col xs={24} lg={8} >{state.userInfo?.name}</Col>
                    <Col xs={24} lg={4} className="label">부서</Col>
                    <Col xs={24} lg={8} >
                        <wjInput.ComboBox
                            placeholder="부서를 선택하세요."
                            itemsSource={new CollectionView(state.depart)}
                            selectedValuePath="value"
                            displayMemberPath="label"
                            valueMemberPath="value"
                            selectedValue={state.userInfo?.team}
                            selectedIndexChanged={handleChangeInput('team')}
                            style={{ width: '100%' }}
                        />
                    </Col>
                </Row>

                <ResultTable teamData={state.teamData} />
                <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20,marginBottom: 20 }}>
                    <Col>
                        <Button type='primary' htmlType='button' onClick={handleSubmit}>확인</Button>
                        <Button htmlType='button' style={{marginLeft: 10}} onClick={drawerClose}>취소</Button>
                    </Col>
                </Row>

                <div style={{marginBottom: 40}}>
                    <Row gutter={10} className="table marginTop">
                        <div className="table_title">상품 정보</div>
                        <Col xs={24} lg={4} className="label">상품 <span className="spanStar">*</span></Col>
                        <Col xs={24} lg={8}>
                            {state.searchedProduct.name === null ? (
                                <Button className="btn btn-primary btn_add" shape="circle" onClick={(e)=>{chkProDrawer()}}>+</Button>
                            ) : (
                                <>
                                    <div>[{state.searchedProduct.code}]{state.searchedProduct.name}<Button shape="circle" className="btn_del" onClick={(e) => btnDel()}>X</Button></div>
                                </>
                            )}
                            
                        </Col>
                        <Col xs={24} lg={4} className="label">상품 등급 <span className="spanStar">*</span></Col>
                        <Col xs={24} lg={8} >
                            <Radio.Group onChange={handleChangeInput('product_grade')} value={state.prodInfo['product_grade']}>
                                <Radio value={'일반'}>일반</Radio>
                                <Radio value={'준전략'}>준전략</Radio>
                                <Radio value={'전략'}>전략</ Radio>
                            </Radio.Group>
                        </Col>
                        <Col xs={24} lg={4} className="label">발주 수량 <span className="spanStar">*</span></Col>
                        <Col xs={24} lg={8} >
                            <Input type='text' onChange={handleChangeInput('product_qty')} value={state.prodInfo['product_qty']}/>
                        </Col>
                        <Col xs={24} lg={4} className="label">예상 제작일 <span className="spanStar">*</span></Col>
                        <Col xs={24} lg={8} >
                            <DatePicker format={'YYYY-MM-DD'} onChange={handleChangeInput('product_date')} value={state.prodInfo['product_date']}/> * 해당일 기준 예상 비용으로 계산합니다.
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
                    <DevCost 
                        tab={state.tabBtnLeft}
                        teamData={state.teamData}
                        qty={toJS(stateData.product_qty)}
                        data={toJS(stateData)}
                        getData={getData('devcost')}
                    />
                    <PrdCost
                        tab={state.tabBtnLeft}
                        qty={toJS(stateData.product_qty)}
                    />

                { productVisble &&
                    <ChkProduct
                        chkVisible={productVisble}
                        chkProOnClose={chkProOnClose}
                        searchedProduct={searchedProduct}
                    />           
                }     

            </Drawer>
        </Wrapper>
    )
}

export default inject('productionStore')(observer(SimDrawer));