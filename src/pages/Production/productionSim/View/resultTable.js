import React, {useCallback, useEffect, useState} from 'react'
import {Button, Row, Col, Popover, message} from 'antd';
import {QuestionOutlined} from '@ant-design/icons';
import { inject, observer, useLocalStore } from 'mobx-react';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';
import {CollectionView} from '@grapecity/wijmo';
import detailsList from '@pages/BillingApprovals/Billing/View/detailsDrawer';
import useStore from '@stores/useStore';
import { toJS } from 'mobx';

const DEF_RESULTS ={
    price: 0,
    supply_price: 0,//공급가 (price * 0.64)
    royalty: 0,
    logistics_price: 0,
    development_price: 0,
    production_price: 0,
    all_rate: 0.0,
    production_rate: 0.0,
    sales: 0,
    sales_amount: 0,
    year1: 0,
    year2: 0,
    year3: 0
}

const ResultTable = ({productionStore, teamData}) =>{
    const { commonStore } = useStore();
    const state = useLocalStore(() => ({
        list: [
            {
                id: 0,
                price: '',
                supply_price: 0,
                royalty: 0,
                logistics_price: 0,
                development_price: 0,
                production_price: 0,
                all_rate: 0,
                production_rate: 0,
                sales: 0,
                sales_amount: 0,
                year1: 0,
                year2: 0,
                year3 : 0,
                status: 1
            },
        ],
        simulation_sale  : [],             //판매/재무
        qty: 100,
        development_total: 0,
        production_total: 0,
        royalty:0,
        currentEditItem: null,
        flex: '',
        addEdit: false,
        rowId : 1
    }));
    useEffect(()=>{
        // getSimSale();
        state.list = productionStore.results;
    },[])

    useEffect(()=>{
        // getSimSale();
        state.simulation_sale = teamData;
    },[teamData])

    useEffect(() =>{
        //개발비 갱신
        if(Object.keys(productionStore.development).length>0){
            let sum = 0;
            const key_list = ["editing",
            "translation",
            "proofread",
            "typeset",
            "ctp",
            "film",
            "planning",
            "supervise",
            "add_content",
            "editing_data",
            "cover",
            "text",
            "output",
            "design_data",
            "ad",
            "presentation_price",
            "operating_cost"]
            let filteredArr = Object.keys(productionStore.development).reduce((acc, key) => {
                // if (key !== 'presentation_qty') {
                //   acc[key] = productionStore.development[key];
                // }
                if (key_list.includes(key)) {
                    acc[key] = productionStore.development[key];
                }
                return acc;
            }, {});
            Object.values(filteredArr).forEach((value) => {
                if(value && !isNaN(value)){
                    sum += parseInt(value, 10);
                }
            });
            state.development_total = sum;

            const arr = state.list.map(e=>{
                let reCalc = calcResults(e.price);
                return {...reCalc,id : e.id};
            });
            state.list = [...arr];
            productionStore.result = state.list
        }
    },[productionStore.development])

    useEffect(() =>{
        //제작비 갱신
        if(productionStore.production.length>0){
            let sum = 0;
            productionStore.detailsList.map(item => {
                sum += item.sum;
            })
            state.production_total = sum;

            const arr = state.list.map(e=>{
                let reCalc = calcResults(e.price);
                return {...reCalc,id : e.id};
            });
            state.list = arr;
            productionStore.result = state.list
        }
    },[productionStore.production])

    useEffect(() =>{
        //발주수량 갱신
        if(state.qty != productionStore.qty){
            state.qty = productionStore.qty
        }

        //저작권료 갱신
        if(productionStore.contracts){
            if(Object.keys(productionStore.contracts).length>0){
                if(productionStore.contracts.copyrights[0].pivot.copyright_fee_lump_sum == 'Y'){
                    state.royalty = productionStore.contracts.copyrights.find(e=>e.pivot.contract_close_yn =='N').pivot.total_amount;
                }else{
                    if(productionStore.contracts.copyrights[0].pivot.books.length > 0){
                        const books = productionStore.contracts.copyrights[0].pivot.books.find(e=>e.contract_end_yn =='N');
                        if(books){
                            //저작권료 적용 부수
                            var qty = productionStore.qty - books.exemption_royalty_qty
                            //퍼센트
                            var percent = 0;
                            let lst = books.fixed_royalties.map(item => {
                                if(item.qty >= qty){
                                    return item;
                                }
                            })
                            if(!lst){
                                let sort = lst.sort((a,b)=> a.qty - b.qty);
                                percent = sort.length > 0 ? sort[0].percent : books.fixed_royalties.find(item => item.end_yn =='Y').percent;
                            }else{
                                percent = books.fixed_royalties.find(item => item.end_yn =='Y').percent;
                            }
                            state.royalty = percent;
                        }
                    }
                }
            }
            if(Object.keys(productionStore.contracts).length>0){
                const arr = state.list.map(e=>{
                    let reCalc = calcResults(e.price);
                    return {...reCalc,id : e.id};
                });
                state.list = arr;
                productionStore.result = state.list
            }
        }else{
            state.royalty = 0
        }
    },[productionStore.contracts])

    const getSimSale = useCallback(async () =>{
        const result = await commonStore.handleApi({
            url: '/simulation-sale?display=100&page=1&sort_by=date&order=desc',
        });
        state.simulation_sale = result.data.filter(e => e.company_id === commonStore.user.company)[3];  //테스트용 임시 데이터 (현재 매칭 데이터가 없음)
    },[]);

    const calcResults = (price) => {
        var temp = {...DEF_RESULTS};
        if(price){
            temp.price = price  //정가
            temp.supply_price = Math.ceil(temp.price * state.simulation_sale.supply_rate / 100)  // 공급가
            temp.royalty = state.royalty ? state.royalty : 0  // 저작권료
            temp.logistics_price = state.simulation_sale.logistics_ratio / 100 * temp.supply_price * state.qty       // 물류비
            temp.development_price = state.development_total     // 개발비
            temp.production_price = state.production_total      // 제작비
            temp.sales_amount = temp.royalty + temp.logistics_price + temp.development_price + temp.production_price         // 매출액
            temp.all_rate = (temp.sales_amount / (temp.price * state.qty)).toFixed(1)              // 전체 비용 비율
            temp.production_rate = ((temp.production_price) / (temp.price * state.qty)).toFixed(1)          // 제작비 비율
            temp.sales = (temp.sales_amount / temp.supply_price).toFixed(1)                     // 판매량

            if(productionStore.productGrade==='준전략'){
                temp.year1 = temp.sales * state.simulation_sale.ad_semi_strategy_year1 / 100                    // 1년차
                temp.year2 = temp.sales * state.simulation_sale.ad_semi_strategy_year2 / 100                    // 2년차
                temp.year3 = temp.sales * state.simulation_sale.ad_semi_strategy_year3 / 100                    // 3년차
            }else if(productionStore.productGrade==='전략'){
                temp.year1 = temp.sales * state.simulation_sale.ad_strategy_year1 / 100                    // 1년차
                temp.year2 = temp.sales * state.simulation_sale.ad_strategy_year2 / 100                    // 2년차
                temp.year3 = temp.sales * state.simulation_sale.ad_strategy_year3 / 100                    // 3년차
            }else{
                temp.year1 = temp.sales * state.simulation_sale.ad_nomal_year1 / 100                    // 1년차
                temp.year2 = temp.sales * state.simulation_sale.ad_nomal_year2 / 100                    // 2년차
                temp.year3 = temp.sales * state.simulation_sale.ad_nomal_year3 / 100                    // 3년차
            }
        }
        return temp;
    }

    const tooltipContent = (
        <div>
            <p>- 예상 제작비를 반영하기 때문에 현재 실제 제작비와는 다를 수 있습니다.</p>
            <p>- 전체 비용 비율, 제작비 비율은 정가 대비 비율입니다.</p>
            <p>- 공급가는 해당 상품 귀속 부서의 평균 공급률을 적용합니다.</p>
            <p>- 정가’는 수정 즉시, 개발비/기타, 제작비는 ‘적용’ 버튼 클릭 후 결과를 다시<br /> 계산합니다. 변경되면 이전 값을 아래에 보여줍니다.</p>
            <p>- ‘확인' 버튼을 클릭해야 변경 사항이 저장됩니다.</p>
        </div>
    );

    const [messageApi, contextHolder] = message.useMessage();
    const error = () => {
        messageApi.open({
            type: 'error',
            content: '정가 추가는 5개까지 가능합니다',
        });
    };

    const initGrid = (grid) => {
        state.flex= grid;
        grid.rowHeaders.columns.splice(0, 1); // no extra columns

        let extraRow = new wjGrid.Row();
        extraRow.allowMerging = true;

        let panel = grid.columnHeaders;
        panel.rows.splice(0, 0, extraRow);

        for (let colIndex = 0; colIndex <= 14; colIndex++) {
            if(colIndex >= 1 && colIndex <= 2){ 
                panel.setCellData(0, colIndex, '가격');
            } else if(colIndex >= 3 && colIndex <= 8) {
                panel.setCellData(0, colIndex, '비용과 비율');
            } else if(colIndex >= 9 && colIndex <= 10) {
                panel.setCellData(0, colIndex, '손익분기점');
            } else if(colIndex >= 11 && colIndex <= 13) {
                panel.setCellData(0, colIndex, '손익분기 달성을 위한 목표 판매량');
            } else {
                let col = grid.getColumn(colIndex);
                col.allowMerging = true;
                panel.setCellData(0, colIndex, col.header);
            }            
        }

        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.columnHeaders) {
                let html = e.cell.innerHTML;
                let col = s.columns[e.col];
                if(col.binding == 'chk'){
                    e.cell.classList.add("headCenter")
                }else{
                    if(html.split('\\n').length > 1){
                        e.cell.innerHTML = '<div class="v-center">' +html.split('\\n')[0] + "<br/>" + html.split('\\n')[1] + '</div>';

                    }else{
                        e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                    }
                }
            }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;

                switch(col.binding){
                    case 'price' :
                        // e.cell.innerHTML = '<input type="text" class="ant-input" id="price" value="'+ item.price +'"/>';
                        e.cell.innerHTML = '';
                        const inputElement = document.createElement('input');
                        inputElement.type = 'text';
                        inputElement.classList.add('ant-input');
                        inputElement.id = 'price';
                        inputElement.value = item.price;
                        inputElement.addEventListener('blur', obj =>{
                            const reCalc = calcResults(obj.target.value);
                            const arr = state.list.map(sub => {
                                if (sub.id === item.id) {
                                    return {...reCalc,id : sub.id, old_data : sub};
                                }
                                return sub;
                            });
                            state.list = arr;
                            productionStore.result = state.list
                        });
                  
                        // 셀에 input 요소 추가
                        e.cell.appendChild(inputElement);
                        e.cell['dataItem'] = item;
                        break;
                    case 'status' :
                        e.cell.innerHTML = '';
                        if(e.row +1 ===state.list.length){
                            e.cell.innerHTML += '<button id="btnAdd" class="btnText blueTxt">추가</button>';
                            if(item.status == 1){
                                e.cell.innerHTML += '';
                            } else {
                                e.cell.innerHTML += '<br/>';
                            }
                        }
                        if(item.status == 1 || state.list.length===1){
                            e.cell.innerHTML += '';
                        } else {
                            e.cell.innerHTML += '<button id="btnDel" class="btnText redTxt">삭제</button>';
                        }
                        e.cell['dataItem'] = item;
                        break;
                    default :
                        if(col.binding && item.old_data){
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

                switch(e.target.id){
                    case 'btnAdd' :
                        if(state.list.length <= 5){
                            rowAdd();
                        }else{
                            error();
                        }
                        break;
                    case 'btnDel':
                        view.remove(view.currentItem);
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'input', (e) => {
            if (e.target instanceof HTMLInputElement) {
                switch(e.target.id){
                    case 'price' :
                        wjCore.closest(e.target, '.wj-cell')['dataItem'][e.target.id]=e.target.value
                        break;
                }
            }
        });

        grid.selectionMode = 0;
        grid.virtualizationThreshold = 20;
    }

    const rowAdd = (value = '') => {
        state.addEdit = true;
        state.currentEditItem = {
            id : state.rowId,
            price : 0,
            supply_price : 0,
            royalty : 0,
            logistics_price : 0,
            development_price : 0,
            production_price : 0,
            all_rate : 0,
            production_rate : 0,
            sales : 0,
            sales_amount : 0,
            year1 : 0,
            year2 : 0,
            year3 : 0,
            status: 2
        };
        let view = new CollectionView(state.list);
        view.sourceCollection.splice(0 ,0,state.currentEditItem);
        state.flex.collectionView.refresh(state.currentEditItem);
        state.rowId++;
    };

    return (
        <div style={{marginTop: 40, marginBottom: 40}}>
            {contextHolder}
            <Row gutter={10} className="table marginTop">
                <div className="table_title">
                    시뮬레이션 결과
                    <Popover content={tooltipContent}>
                        <Button
                            shape="circle"
                            size="small"
                            className="btn_popover"
                            style={{ marginLeft: '5px' ,marginTop:'0px'}}
                        >?</Button>
                    </Popover>
                </div>
            </Row>
            <Row className='gridWrap'>
                <FlexGrid
                    itemsSource={state.list}
                    initialized={(s) => initGrid(s)}
                    allowMerging="ColumnHeaders"
                    autoRowHeights={true}
                >
                    <FlexGridColumn header='순서' width={50} align='center'/>
                    <FlexGridColumn header='정가' binding='price' width='*' minWidth={100} align='right'/>
                    <FlexGridColumn header={'공급가\\n('+state.simulation_sale?.supply_rate+'%)'} binding='supply_price' width={100} align='right'/>
                    <FlexGridColumn header='저작권료' binding='royalty' width={100} align='right'/>
                    <FlexGridColumn header='물류비' binding='logistics_price' width={100} align='right'/>
                    <FlexGridColumn header='개발비/기타' binding='development_price' width={100} align='right'/>
                    <FlexGridColumn header='제작비' binding='production_price' width={100} align='right'/>
                    <FlexGridColumn header='전체 비용\n비율' binding='all_rate' width={100} align='right'/>
                    <FlexGridColumn header='제작비\n비율' binding='production_rate' width={100} align='right'/>
                    <FlexGridColumn header='판매량' binding='sales' width={100} align='right'/>
                    <FlexGridColumn header='매출액\n(공급가X판매량)' width={110} binding='sales_amount' align='right'/>
                    <FlexGridColumn header='1년차' binding='year1' width={80} align='right'/>
                    <FlexGridColumn header='2년차' binding='year2' width={80} align='right'/>
                    <FlexGridColumn header='3년차' binding='year3' width={80} align='right'/>
                    <FlexGridColumn header='작업' binding='status' width={80} align='center' isReadOnly={true}/>
                </FlexGrid>
            </Row>

        </div>
    )
};

export default inject('productionStore')(observer(ResultTable));