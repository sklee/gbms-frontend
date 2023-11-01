import React, {useState, useCallback, useEffect} from "react";
import {Row, Col, Button, Table, Input, Radio} from 'antd';
import { inject, observer, useLocalStore } from 'mobx-react';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import * as wjGrid from "@grapecity/wijmo.grid";
import { toJS } from 'mobx';

const DEF_STATE = {
    editing: null,
    translation: null,
    proofread: null,
    typeset: null,
    ctp: null,
    film: null,
    planning: null,
    supervise: null,
    add_content: null,
    editing_data: null,
    design: null,
    cover: null,
    text: null,
    output: null,
    design_data: null,
    ad: null,
    presentation_qty: null,
    presentation_price: null,
    operating_cost: null,
    results: null
};

const DevCost = ({productionStore,tab,teamData,data,getData}) =>{
    const state = useLocalStore(() => ({
        planTotalPrice: 0,
        disignTotalPrice: 0,
        etcTotalPrice: 0,
        total_amount: 0,
        product_qty : 1,
        teamData : [],
        data:{},
        temp_data:{...DEF_STATE},
        old_data:null,
        insideVal : true,
        temp_result : new Array(22).fill(''),

        product_cost : 0,
    }));
    
    useEffect(()=>{
        if(productionStore.development){
            state.data = toJS(data.development)
            const result = JSON.parse(state.data.results)
            if(result){
                setData.map((item)=>{
                    state.temp_result[item.key] = result[item.key]
                })
            }
            getTotalCost()
        }
    },[])

    useEffect(()=>{
        if(data){
            state.product_qty = toJS(data.product_qty);
            state.teamData = toJS(teamData);
            // state.data = data.development;
            state.temp_data = toJS(data.development);
            if(state.old_data==null){
                state.old_data = toJS(data.development);
            }
        }
        if(state.teamData){
            state.temp_data.cover = state.teamData.cover;
            state.temp_data.text = state.teamData.text;
            state.temp_data.operating_cost = state.teamData.operating_cost;
        }

        return () => {
        };

    },[teamData,productionStore.qty]);

    useEffect(()=>{
        var temp = 0;
        productionStore.detailsList.map(e=> {
            temp += e.product_cost;
        })
        state.product_cost = temp;
        state.temp_data.presentation_price = temp * Number(state.temp_data.presentation_qty);
        if(state.data.presentation_price!==state.temp_data.presentation_price){
            state.data.presentation_price = state.temp_data.presentation_price
            productionStore.development.presentation_price = state.data.presentation_price
        }

        return () => {
        };

    },[productionStore.detailsList]);

    //천다위 콤마
    const priceToString= (price)=> {
        if(price){
            return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }        
    }

    const handleChangeInput = useCallback((type) => (e) => {
        state.temp_data[type]= e.target.value;
        if(type ==='design'){
            if(e.target.value==='내부'){
                state.temp_data.cover = state.teamData.cover;
                state.temp_data.text = state.teamData.text;
                state.insideVal = true;
            }else if(e.target.value==='외부'){
                state.insideVal = false;
            }
        }else if(type ==='presentation_qty'){
            // state.temp_data.presentation_price = "제작비 입력 전";
        }
        getTotalCost();
    });

    const getDevCost = useCallback((type) => {
        if(state.data[type] && state.product_qty){
            return (
                <>
                    {(Math.ceil(Number(state.data[type]) / Number(state.product_qty)))}
                    {(state.old_data[type] && state.data[type] !== state.old_data[type]) &&
                        <div className="prev_val">{"("+(Math.ceil(Number(state.old_data[type]) / Number(state.product_qty)))+")"} </div>
                    }
                </>
            );
        }else{
            return (<></>);
        }
    });

    const getTotalCost = useCallback(() => {
        state.planTotalPrice = Number(state.temp_data.editing)||0;
        state.planTotalPrice += Number(state.temp_data.translation)||0;
        state.planTotalPrice += Number(state.temp_data.proofread)||0;
        state.planTotalPrice += Number(state.temp_data.typeset)||0;
        state.planTotalPrice += Number(state.temp_data.ctp)||0;
        state.planTotalPrice += Number(state.temp_data.film)||0;
        state.planTotalPrice += Number(state.temp_data.planning)||0;
        state.planTotalPrice += Number(state.temp_data.supervise)||0;
        state.planTotalPrice += Number(state.temp_data.add_content)||0;
        state.planTotalPrice += Number(state.temp_data.editing_data)||0;

        state.disignTotalPrice = Number(state.temp_data.cover)||0;
        state.disignTotalPrice += Number(state.temp_data.text)||0;
        state.disignTotalPrice += Number(state.temp_data.output)||0;
        state.disignTotalPrice += Number(state.temp_data.design_data)||0;

        state.etcTotalPrice = Number(state.temp_data.ad)||0;
        state.etcTotalPrice += Number(state.temp_data.presentation_price)||0;
        state.etcTotalPrice += Number(state.temp_data.operating_cost)||0;

        state.total_amount = state.planTotalPrice + state.disignTotalPrice + state.etcTotalPrice;
    });

    const handleSubmit = (type) => {
        state.old_data = toJS(state.data);
        setData.map((item)=>{
            const arr = [10,11,16,20,21]
            if(!arr.includes(item.key)){
                state.temp_result[item.key] = isNaN(Math.ceil(Number(state.data[item.id]) / Number(state.product_qty))) ? 0 : Math.ceil(Number(state.data[item.id]) / Number(state.product_qty))
            }
        })
        state.temp_data.results = JSON.stringify(toJS(state.temp_result))

        state.data = toJS(state.temp_data);
        getData(toJS(state.temp_data));
        productionStore.development = {...toJS(state.temp_data)};
    }

    const columns = [
        {
            title: '구분',
            dataIndex: 'separation',
            onCell: (_, index) => {
                if (index === 0) {
                    return {rowSpan: 11};
                } 
                if (index > 0 && index < 11) {
                    return {rowSpan: 0};
                }
                if (index === 11){
                    return {rowSpan: 6};
                }
                if (index > 11 && index < 17) {
                    return {rowSpan: 0};
                }
                if (index === 17){
                    return {rowSpan: 4};
                }
                if (index > 17 && index < 21) {
                    return {rowSpan: 0};
                }
            },
            width: '10%',
        },
        {
            title: '항목',
            dataIndex: 'article',
            width: '20%',
        },
        {
            title: '입력/선택/참고사항',
            dataIndex: 'notes',
            width: '30%',
        },
        {
            title: '금액',
            dataIndex: 'price',
            width: '20%',
            align: 'right',
        },
        {
            title: '상품당 개발비/기타',
            dataIndex: 'devCost',
            width: '20%',
            align: 'right',
            render (data,record) {
                const arr = [10,11,16,20,21]
                if(!arr.includes(record.key)){
                    state.temp_result[record.key] = isNaN(Math.ceil(Number(state.data[record.id]) / Number(state.product_qty))) ? 0 : Math.ceil(Number(state.data[record.id]) / Number(state.product_qty))
                    return getDevCost(record.id);
                }
                return data;
            }
        },

    ];
    
    const setData = [
        {
            key: 0,
            id: 'editing',
            separation: '기획/편집',
            article: '편집 진행',
            notes: '',
            price: <Input id="editing" value={state.temp_data.editing} onChange={handleChangeInput('editing')} style={{textAlign: 'right'}}/>,
            devCost: 0,
        },
        {
            key: 1,
            id: 'translation',
            separation: '기획/편집',
            article: '번역',
            notes: '',
            price: <Input id="translation" value={state.temp_data.translation} onChange={handleChangeInput('translation')} style={{textAlign: 'right'}}/>,
            devCost: 0,
        },
        {
            key: 2,
            id: 'proofread',
            separation: '기획/편집',
            article: '교정교열',
            notes: '',
            price: <Input id="proofread" value={state.temp_data.proofread} onChange={handleChangeInput('proofread')} style={{textAlign: 'right'}}/>,
            devCost: 0,
        },
        {
            key: 3,
            id: 'typeset',
            separation: '기획/편집',
            article: '조판',
            notes: '',
            price: <Input id="typeset" value={state.temp_data.typeset} onChange={handleChangeInput('typeset')} style={{textAlign: 'right'}}/>,
            devCost: 0,
        },
        {
            key: 4,
            id: 'ctp',
            separation: '기획/편집',
            article: '출력 - CTP',
            notes: '',
            price: <Input id="ctp" value={state.temp_data.ctp} onChange={handleChangeInput('ctp')} style={{textAlign: 'right'}}/>,
            devCost: 0,
        },
        {
            key: 5,
            id: 'film',
            separation: '기획/편집',
            article: '출력 - 필름',
            notes: '',
            price: <Input id="film" value={state.temp_data.film} onChange={handleChangeInput('film')} style={{textAlign: 'right'}}/>,
            devCost: 0,
        },
        {
            key: 6,
            id: 'planning',
            separation: '기획/편집',
            article: '도서 기획',
            notes: '',
            price: <Input id="planning" value={state.temp_data.planning} onChange={handleChangeInput('planning')} style={{textAlign: 'right'}}/>,
            devCost: 0,
        },
        {
            key: 7,
            id: 'supervise',
            separation: '기획/편집',
            article: '감수/추천사/원고 의뢰',
            notes: '',
            price: <Input id="supervise" value={state.temp_data.supervise} onChange={handleChangeInput('supervise')} style={{textAlign: 'right'}}/>,
            devCost: 0,
        },
        {
            key: 8,
            id: 'add_content',
            separation: '기획/편집',
            article: '부가 콘텐츠 개발/제작',
            notes: '',
            price: <Input id="add_content" value={state.temp_data.add_content} onChange={handleChangeInput('add_content')} style={{textAlign: 'right'}}/>,
            devCost: 0,
        },
        {
            key: 9,
            id: 'editing_data',
            separation: '기획/편집',
            article: '편집 자료 구매(도서 제외)',
            notes: '',
            price: <Input id="editing_data" value={state.temp_data.editing_data} onChange={handleChangeInput('editing_data')} style={{textAlign: 'right'}}/>,
            devCost: 0,
        },
        {
            key: 10,
            id: 'planTotalPrice',
            separation: '기획/편집',
            article: '소계',
            notes: '',
            price: priceToString(state.planTotalPrice),
            devCost: '',
        },
        {
            key: 11,
            id: 'design',
            separation: '디자인',
            article: '디자인 진행',
            notes: 
            <Radio.Group value={state.temp_data.design} onChange={handleChangeInput('design')}>
                <Radio value={'내부'}>내부</Radio>
                <Radio value={'외부'}>외부</Radio>
            </Radio.Group>
            ,
            price: '',
            devCost: ''
        },
        {
            key: 12,
            id: 'cover',
            separation: '디자인',
            article: '표지',
            notes: state.insideVal? "‘내부’ 선택 시 고정" : '',
            price: <Input disabled={state.insideVal? true : false} value={state.temp_data.cover} onChange={handleChangeInput('cover')} style={{textAlign: 'right'}}/>,
            devCost: 0,
        },
        {
            key: 13,
            id: 'text',
            separation: '디자인',
            article: '본문',
            notes: state.insideVal ? "‘내부’ 선택 시 고정" : '',
            price: <Input disabled={state.insideVal} value={state.temp_data.text} onChange={handleChangeInput('text')} style={{textAlign: 'right'}}/>,
            devCost: 0,
        },
        {
            key: 14,
            id: 'output',
            separation: '디자인',
            article: '출력',
            notes: '',
            price: <Input value={state.temp_data.output} onChange={handleChangeInput('output')} style={{textAlign: 'right'}}/>,
            devCost: 0,
        },
        {
            key: 15,
            id: 'design_data',
            separation: '디자인',
            article: '디자인 자료 구매(도서 제외)',
            notes: '',
            price: <Input value={state.temp_data.design_data} onChange={handleChangeInput('design_data')} style={{textAlign: 'right'}}/>,
            devCost: 0,
        },
        {
            key: 16,
            id: 'disignTotalPrice',
            separation: '디자인',
            article: '소계',
            notes: '',
            price: priceToString(state.disignTotalPrice),
            devCost: ''
        },
        {
            key: 17,
            id: 'ad',
            separation: '기타',
            article: '광고/홍보',
            notes: '',
            price: <Input value={state.temp_data.ad} onChange={handleChangeInput('ad')} style={{textAlign: 'right'}}/>,
            devCost: 0,
        },
        {
            key: 18,
            id: 'presentation_price',
            separation: '기타',
            article: '증정',
            notes: <>수량 <Input style={{width: 100}} value={state.temp_data.presentation_qty} onChange={handleChangeInput('presentation_qty')}/> 부/개</>,
            price: <>{ !state.temp_data.presentation_price ?
                <>제작비 입력 전</>
                // : <Input disabled={true} value={state.temp_data.presentation_price} onChange={handleChangeInput('presentation_price')} style={{textAlign: 'right'}}/>}</>,
                : <Input disabled={true} value={state.temp_data.presentation_price} style={{textAlign: 'right'}}/>}</>,
            devCost: 0,
        },
        {
            key: 19,
            id: 'operating_cost',
            separation: '기타',
            article: '경상비',
            notes: '최근 평균 비용, 예상 출시 종수 등을 고려해서 회사에서 지정',
            price: <Input disabled={true} value={state.temp_data.operating_cost} onChange={handleChangeInput('operating_cost')} style={{textAlign: 'right'}}/>,
            devCost: 0,
        },
        {
            key: 20,
            id: 'etcTotalPrice',
            separation: '기타',
            article: '소계',
            notes: '',
            price: priceToString(state.etcTotalPrice),
            devCost: '',
        },
        {
            key: 21,
            id: 'total_amount',
            separation: '',
            article: '',
            notes: '합계',
            price: priceToString(state.total_amount),
            devCost: ''
        }
    ];

    return tab ?(
        <>
            <Table columns={columns} dataSource={setData} pagination={false} className="devCostTable" style={{marginTop: 20}} />

            <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20, margrinBottom: 40}}>
                <Col>
                    <Button htmlType='button' className='ant-btn-etc' onClick={handleSubmit}>적용</Button>
                    <Button htmlType='button' style={{marginLeft: 10}}>취소</Button>
                </Col>
            </Row>
        </>
    ) : null;
};

export default inject('productionStore')(observer(DevCost));