import React, {useState, useEffect, useCallback} from "react";
import {Row, Col, Button, Radio, Select} from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { inject, observer, useLocalStore } from 'mobx-react';

import '@grapecity/wijmo.styles/wijmo.css';
import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import * as wjCore from '@grapecity/wijmo';
import * as wjcGrid from '@grapecity/wijmo.grid';
import { toJS } from 'mobx';

import AddBookTable from "./addBookTable"; // 본책, 별책 추가
import BoundVolumes from "./boundVolumes"; // 합본 추가
import * as CalcSim from "../CalcSim.js"

const DEF_DETAILS = {
    basic: null,
    cover: 0,
    content: 0,
    end_paper: 0,
    binding: 0,
    book_band: 0,
    adjuncts: 0,
    packing: 0,
    sum: 0,
    product_cost: 0,
    work_status: null,
};

const DEF_PROCESS = {
    basic: null,
    paper: 0,
    print: 0,
    binding: 0,
    postprocess: 0,
    adjuncts: 0,
    packing: 0,
    sum: 0,
    product_cost: 0,
    work_status: null,
};

const PrdCost = ({productionStore, tab, qty}) =>{
    const { Option } = Select;  

    const state = useLocalStore(() => ({
        qty : 0,
        type :'',
        basic: null,
        produce_format_id: null, //판형 (통일)
        basicCount : [0,0,0], // 본책, 별책, 합본
        setData : [],
        detailsList:[],
        processList:[],
        modData : null,
        radioValue : 1,
        addBookValue : false,
        boundVolumesValue: false,
    }));

    useEffect(() =>{
        state.qty = qty;
        // if(toJS(state.setData).length){
        //     state.processList = [];
        //     state.detailsList = [];
        //     console.log(state.setData);
        //     CalcSim.CalcDevCost(state.setData,qty).then(result => {
        //         const temp = result;
        //         temp.map(obj=> {
        //             obj.then(data=>{
        //                 const resres = data;
        //                 console.log(resres);
        //                 state.processList = [...state.processList, resres.processList];
        //                 state.detailsList = [...state.detailsList, resres.detailsList];
                        
        //                 productionStore.detailsList = [...state.detailsList];
        //                 productionStore.processList = [...state.processList];
        //             })
        //         })
        //     });
        // }
    },[qty])

    useEffect(() =>{
        state.processList = productionStore.processList.map(e=> {
            const sel = state.processList.find(item => item.basic === e.basic);
            if(sel){
                if(sel.old_data){
                    e['old_data'] = sel.old_data;
                    return {...e}
                }
            }
            return {...e}
        });
        state.detailsList = productionStore.detailsList.map(e=> {
            const sel = state.detailsList.find(item => item.basic === e.basic);
            if(sel){
                if(sel.old_data){
                    e['old_data'] = sel.old_data;
                    return {...e}
                }
            }
            return {...e}
        });
        // state.processList = [...productionStore.processList]
        // state.detailsList = [...productionStore.detailsList]

        return () => {

        };
    },[productionStore.detailsList])

    const valueChange = ((type) => (e) => {
        if(type === 'radio'){
            state.radioValue = e.target.value;
        }
    })

    const addBookOpen = (type)=>{
        if(state.addBookValue){
            addBookClose();
        }
        state.type = type;
        state.modData = null;

        var temp_basic = '';
        //set basic
        if(state.type == '본책'){
            state.basicCount[0] += 1;
            temp_basic = state.type + state.basicCount[0];
        }else if(state.type == '별책'){
            state.basicCount[1] += 1;
            temp_basic = state.type + state.basicCount[1];
        }else if(state.type == '합본'){
            state.basicCount[2] += 1;
            temp_basic = '합본' + state.basicCount[2];
        }
        var basic = {};
        basic['composition'] = state.type;
        basic['basic'] = temp_basic;
        if(state.produce_format_id)basic['produce_format_id'] = state.produce_format_id;
        state.basic = basic;

        state.boundVolumesValue = false;
        state.addBookValue = true;
    }

    const modBookOpen = (data)=>{
        if(state.addBookValue){
            addBookClose();
        }
        if(state.boundVolumesValue){
            boundVolClose();
        }
        var setData = state.setData.find(e=>e.basic == data);
        
        if(!setData){
            console.log('mod err',toJS(data));
            return false;
        }else{
            state.modData = setData;
        }

        if(Number(state.modData.type) <= 2){
            state.boundVolumesValue = false;
            state.addBookValue = true;
        }else{
            state.addBookValue = false;
            state.boundVolumesValue = true;
        }
    }

    const addBookClose = ()=>{
        state.addBookValue = false;
    }

    const boundVolOpen = ()=>{
        if(state.addBookValue){
            boundVolClose();
        }
        state.type = '합본';
        state.modData = null;

        var temp_basic = '';
        //set basic
        if(state.type == '본책'){
            state.basicCount[0] += 1;
            temp_basic = state.type + state.basicCount[0];
        }else if(state.type == '별책'){
            state.basicCount[1] += 1;
            temp_basic = state.type + state.basicCount[1];
        }else if(state.type == '합본'){
            state.basicCount[2] += 1;
            temp_basic = '합본' + state.basicCount[2];
        }
        var basic = {};
        basic['composition'] = state.type;
        basic['basic'] = temp_basic;
        basic['count'] = toJS(state.setData).length;     //err count step
        state.basic = basic;

        state.addBookValue = false;
        state.boundVolumesValue = true;
    }
    const boundVolClose = ()=>{
        state.boundVolumesValue = false;
    }

    const initGrid = (grid) => {    
        state.flex= grid;

        grid.columnFooters.rows.push(new wjcGrid.GroupRow());
        grid.columnFooters.setCellData(0, 0, '합계');

        grid.formatItem.addHandler(function (s, e) {
            if(e.panel._ct == 4){
                e.cell.innerHTML = '<div class="v-center">순서</div>';
            }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                
                switch (col.binding) {
                    case 'basic':
                        if(item){
                            e.cell.innerHTML = '<button id="btnDetail" class="btnText">'+item.basic+'</button>';
                        }else{
                            e.cell.innerHTML = '<button id="btnDetail" class="btnText">테스트용 임시</button>';
                        }
                        // e.cell.innerHTML = '<button id="btnDetail" class="btnText">'+item.basic+'</button>';
                        e.cell['dataItem'] = item;
                        break;
                    case 'work_status' :
                        e.cell.innerHTML = '<button id="btnDel" class="btnText redTxt">삭제</button>';
                        e.cell['dataItem'] = item;
                        break;
                    default :
                        if(item.old_data){
                            e.cell.innerHTML = item[col.binding]+ '<div className="prev_val">('+item.old_data[col.binding]+')</div>';
                            // e.cell['dataItem'] = item;
                        }else{
                            // e.cell.innerHTML = item[col.binding];
                            // e.cell['dataItem'] = item;
                        }
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            let view = grid.collectionView;
            if (e.target instanceof HTMLButtonElement) {
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                
                switch (e.target.id) {
                    case 'btnDetail':
                        modBookOpen(item.basic);
                        break;
                    case 'btnDel' :
                        view.remove(view.currentItem);
                        delBook(item.basic);
                        break;
                }
            }
        });

        grid.selectionMode = 0;
        grid.virtualizationThreshold = 20;
    };

    const getBook = (data) => {
        var temp_basic = data.basic;
        var prdCost = 0;
        if(!state.produce_format_id)state.produce_format_id = data.produce_format_id;

        //set process list
        var temp_process = { ...DEF_PROCESS };
        if(state.type !== '합본'){
            data.results.map((e,index) => {
                if(index === 5)temp_process.paper += parseFloat(e.paper); // 종이
                if(index === 5 || index === 13 || index === 14)temp_process.print += parseFloat(e.print); // 인쇄
                if(index !== 10)temp_process.binding += parseFloat(e.binding); // 제본
                temp_process.postprocess += parseFloat(e.postprocess); // 후가공
                temp_process.adjuncts += parseFloat(e.adjuncts); // 부속물
                temp_process.packing += parseFloat(e.packing); // 포장
                prdCost += parseFloat(e.prdCost); // 합계
            });
            temp_process['basic'] = temp_basic;
            temp_process.paper *= state.qty * 1.1;
            temp_process.paper += data.results[2].prdCost;
            temp_process.paper += data.results[6].prdCost;
            temp_process.paper += data.results[13].prdCost - ((data.results[13].print+data.results[13].binding+data.results[13].postprocess)*state.qty*1.1);
            temp_process.paper += data.results[14].prdCost - ((data.results[14].print+data.results[14].binding+data.results[14].postprocess)*state.qty*1.1);

            temp_process.print *= state.qty * 1.1;
            temp_process.print += data.results[3].prdCost;
            temp_process.print += data.results[7].prdCost;
            temp_process.print += data.results[8].prdCost;
            temp_process.print += data.results[9].prdCost;

            temp_process.binding *= state.qty * 1.1;
            temp_process.binding += data.results[10].prdCost;
            temp_process.postprocess *= state.qty * 1.1;
            temp_process.adjuncts *= state.qty * 1.1;
            temp_process.packing *= state.qty * 1.1;
        }else{
            data.results.map((e,index) => {
                if(index !== 2 && index !== 6)temp_process.paper += parseFloat(e.paper); // 종이
                if(index !== 3)temp_process.print += parseFloat(e.print); // 인쇄
                temp_process.binding += parseFloat(e.binding); // 제본
                temp_process.postprocess += parseFloat(e.postprocess); // 후가공
                temp_process.adjuncts += parseFloat(e.adjuncts); // 부속물
                temp_process.packing += parseFloat(e.packing); // 포장
                prdCost += parseFloat(e.prdCost); // 합계
            });
            temp_process['basic'] = temp_basic;
            temp_process.paper *= state.qty * 1.1;
            temp_process.paper += data.results[2].prdCost;
            temp_process.paper += data.results[6].prdCost - ((data.results[6].print+data.results[6].binding+data.results[6].postprocess)*state.qty*1.1);

            temp_process.print *= state.qty * 1.1;
            temp_process.print += data.results[3].prdCost;

            temp_process.binding *= state.qty * 1.1;
            temp_process.postprocess *= state.qty * 1.1;
            temp_process.adjuncts *= state.qty * 1.1;
            temp_process.packing *= state.qty * 1.1;
        }

        temp_process.paper = Math.round(temp_process.paper);
        temp_process.print = Math.floor(temp_process.print);
        temp_process.binding = Math.floor(temp_process.binding);
        temp_process.postprocess = Math.floor(temp_process.postprocess);
        temp_process.adjuncts = Math.floor(temp_process.adjuncts);
        temp_process.packing = Math.floor(temp_process.packing);

        temp_process.sum = prdCost;
        temp_process.product_cost = Math.round(prdCost / state.qty);

        //set details list
        if(state.type !== '합본'){
            var temp_details = { ...DEF_DETAILS };
            temp_details.cover += (parseFloat(data.results[2].prdCost) + parseFloat(data.results[3].prdCost) + parseFloat(data.results[4].prdCost)); // 표지
            temp_details.end_paper += (parseFloat(data.results[5].prdCost)); // 면지
            temp_details.content += (parseFloat(data.results[6].prdCost) + parseFloat(data.results[7].prdCost) + parseFloat(data.results[8].prdCost) + parseFloat(data.results[9].prdCost)); // 본문
            temp_details.binding += (parseFloat(data.results[10].prdCost) + parseFloat(data.results[11].prdCost)); // 제본
            temp_details.adjuncts += (parseFloat(data.results[12].prdCost)); // 부속물
            temp_details.book_band += (parseFloat(data.results[13].prdCost) + parseFloat(data.results[14].prdCost)); // 띠지/커버지
            temp_details.packing += (parseFloat(data.results[15].prdCost)); // 포장
            temp_details['basic'] = temp_basic;
            temp_details.sum = prdCost;
            temp_details.product_cost = Math.round(prdCost / state.qty);
        }else{
            var temp_details = { ...DEF_DETAILS };
            temp_details.cover += (parseFloat(data.results[2].prdCost) + parseFloat(data.results[3].prdCost) + parseFloat(data.results[4].prdCost) + parseFloat(data.results[6].prdCost)
            - Math.floor(parseFloat((data.results[6].binding) * state.qty * 1.1))); // 표지
            temp_details.binding += (parseFloat(data.results[5].prdCost + Math.floor(parseFloat((data.results[6].binding) * state.qty * 1.1)))); // 제본
            // temp_details.book_band += (parseFloat(data.results[6].prdCost)); // 띠지/커버지
            temp_details.packing += (parseFloat(data.results[7].prdCost)); // 포장
            temp_details['basic'] = temp_basic;
            temp_details.sum = prdCost;
            temp_details.product_cost = Math.round(prdCost / state.qty);
        }


        if(state.setData.find(e=>e.basic == temp_basic)){
            //수정
            state.processList = state.processList.map(e=>{
                if(e.basic == temp_basic){
                    temp_process['old_data'] = e;   //비교 데이터
                    return {...temp_process};
                }else{
                    return {...e}
                }
            });
            state.detailsList = state.detailsList.map(e=>{
                if(e.basic == temp_basic){
                    temp_details['old_data'] = e;   //비교 데이터
                    return {...temp_details};
                }else{
                    return {...e}
                }
            });

            var log = {...toJS(data)};
            log.results = JSON.stringify(toJS(log.results));
            state.setData = state.setData.map(e=>{
                if(e.basic == temp_basic){
                    return {...log};
                }else{
                    return {...e}
                }
            });
        }else{
            //입력
            state.processList = [...state.processList,temp_process];
            state.detailsList = [...state.detailsList,temp_details];
            var log = {...toJS(data)};
            log.results = JSON.stringify(toJS(log.results));
            //set submit data
            state.setData = [...state.setData, log];
        }

        productionStore.production = [...state.setData];
        productionStore.detailsList = [...state.detailsList];
        productionStore.processList = [...state.processList];

        addBookClose();
        boundVolClose();
    };
    
    const delBook = (data) => {
        state.setData = state.setData.filter(e=>e.basic != data);
        state.processList = state.processList.filter(e=>e.basic != data);
        state.detailsList = state.detailsList.filter(e=>e.basic != data);
    };

    return !tab ? (
        <>
            <Row>
                <Col>
                    <Radio.Group value={state.radioValue} onChange={valueChange('radio')}>
                        <Radio value={1}>세부 구성별로 보기</Radio>
                        <Radio value={2}>공정별로 보기</Radio>
                    </Radio.Group>
                </Col>
            </Row>
            <Row 
                className='gridWrap'
                style={{marginTop: 20, marginBottom: 20}}
            >
                {state.radioValue === 1 ? (
                    <FlexGrid
                        itemsSource={state.detailsList}
                        initialized={(s) => initGrid(s)}
                        autoRowHeights={true}
                    >
                        <FlexGridColumn header="기본 구성" binding='basic' width='*' minWidth={120} isReadOnly={true}/>
                        <FlexGridColumn header="표지" binding='cover' aggregate="Sum" width={120} align="right"/>
                        <FlexGridColumn header="본문" binding='content' aggregate="Sum" width={120} align="right"/>
                        <FlexGridColumn header="면지" binding='end_paper' aggregate="Sum" width={120} align="right"/>
                        <FlexGridColumn header="(제본)" binding='binding' aggregate="Sum" width={120} align="right"/>
                        <FlexGridColumn header="띠지/커버지" binding='book_band' aggregate="Sum" width={120} align="right"/>
                        <FlexGridColumn header="부속물" binding='adjuncts' aggregate="Sum" width={120} align="right"/>
                        <FlexGridColumn header="포장" binding='packing' aggregate="Sum" width={120} align="right"/>
                        <FlexGridColumn header="합계" binding='sum' aggregate="Sum" width={120} align="right"/>
                        <FlexGridColumn header="상품당 제작비" binding='product_cost' aggregate="Sum" width={120} align="right"/>
                        <FlexGridColumn header="작업" binding='work_status' width={80} align="center"/>
                    </FlexGrid>
                ) : (
                    <FlexGrid
                        itemsSource={state.processList}
                        initialized={(s) => initGrid(s)}
                        autoRowHeights={true}
                    >
                        <FlexGridColumn header="기본 구성" binding='basic' width='*' minWidth={120}/>
                        <FlexGridColumn header="종이" binding='paper' aggregate="Sum" width={120} align="right"/>
                        <FlexGridColumn header="인쇄" binding='print' aggregate="Sum" width={120} align="right"/>
                        <FlexGridColumn header="제본" binding='binding' aggregate="Sum" width={120} align="right"/>
                        <FlexGridColumn header="후가공" binding='postprocess' aggregate="Sum" width={120} align="right"/>
                        <FlexGridColumn header="(부속물)" binding='adjuncts' aggregate="Sum" width={120} align="right"/>
                        <FlexGridColumn header="(포장)" binding='packing' aggregate="Sum" width={120} align="right"/>
                        <FlexGridColumn header="합계" binding='sum' aggregate="Sum" width={120} align="right"/>
                        <FlexGridColumn header="상품당 제작비" binding='product_cost' aggregate="Sum" width={120} align="right"/>
                        <FlexGridColumn header="작업" binding='work_status' width={80} align="center" />
                    </FlexGrid>
                )}
            </Row>
            <Row gutter={[10, 10]} justify="center" style={{marginBottom: 20}}>
                <Col style={{position: 'relative'}}>
                    <Button type='primary' htmlType='button' onClick={e=>addBookOpen('본책')}>본책 추가</Button>
                    <Button type='primary' htmlType='button' style={{marginLeft: 10}} onClick={e=>addBookOpen('별책')}>별책 추가</Button>
                    {state.radioValue === 1 && state.detailsList.length > 1 ? (
                        <>
                            <Button type='primary' htmlType='button' style={{marginLeft: 10}} onClick={boundVolOpen}>합본 추가</Button>
                            <p style={{position: 'absolute', top: '18%', right: '-108%'}}><ExclamationCircleOutlined /> <span style={{color: 'red'}}>기본 구성이 2개 이상이면 합본 추가는 필수입니다.</span></p>
                        </>
                    ) : ('')}
                    {state.radioValue === 2 && state.processList.length > 1 ? (
                        <>
                            <Button type='primary' htmlType='button' style={{marginLeft: 10}} onClick={boundVolOpen}>합본 추가</Button>
                            <p style={{position: 'absolute', top: '18%', right: '-108%'}}><ExclamationCircleOutlined /> <span style={{color: 'red'}}>기본 구성이 2개 이상이면 합본 추가는 필수입니다.</span></p>
                        </>
                    ) : ('')}
                </Col>
            </Row>

            {state.boundVolumesValue ? <BoundVolumes onClose={boundVolClose} qty={state.qty} getBook={getBook} basic={toJS(state.basic)} modData={toJS(state.modData)}/> : ''} 
            
            {state.addBookValue ? <AddBookTable onClose={addBookClose} qty={state.qty} getBook={getBook} basic={toJS(state.basic)} modData={toJS(state.modData)} /> : ''}
        </>
    ) : null;
};

export default inject('productionStore')(observer(PrdCost));