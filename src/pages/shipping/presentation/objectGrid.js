import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Button, Modal } from 'antd';
import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import * as wjcGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';
import { observer, useLocalStore } from 'mobx-react';

import AddDrawer from './add'
import ViewDrawer from './view'

const { confirm } = Modal;

const index = observer(( { gridHeight } ) =>{
    const [addVisible, setAddVisible] = useState(false);
    const addDrawerOpen = () => setAddVisible(true);
    const addDrawerClose = () => setAddVisible(false);
    const [viewVisible, setViewVisible] = useState(false);
    const viewDrawerOpen = () => setViewVisible(true);
    const viewDrawerClose = () => setViewVisible(false);

    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                cnt: '',
                select: null,
                slipCode: 'G230802',
                company: '길벗',
                AccountCode: 'SADC23',
                logisticsCode: '110-510',
                connectionName: '영풍문고',
                branchName: '광화문점',
                orderSource: '서점 SCM',
                division: '일반',
                fedCondition: '위탁',
                warehouse: '라임북(정품)',
                deliveryQuantity: 20,
                supplyAmount: 160800,
                progress: '출고 요청',
                registrationDate: '2023.06.01',
                requestDate: '2023.06.01',
                note: '광화문점',
            },
            {
                id: 2,
                cnt: '',
                select: null,
                slipCode: 'G230802',
                company: '스쿨',
                AccountCode: 'SADC22',
                logisticsCode: '090-923',
                connectionName: '디엠도서유통 ',
                branchName: '',
                orderSource: '주문 SCM',
                division: '신간',
                fedCondition: '위탁',
                warehouse: '라임북(정품)',
                deliveryQuantity: 1,
                supplyAmount: 13200,
                progress: '주문 등록',
                registrationDate: '2023.06.01',
                requestDate: '',
                note: '',
            },
            {
                id: 3,
                cnt: '',
                select: null,
                slipCode: 'G230802',
                company: '스쿨',
                AccountCode: '111',
                logisticsCode: '090-923',
                connectionName: '디엠도서유통 ',
                branchName: '',
                orderSource: '주문 SCM',
                division: '신간',
                fedCondition: '위탁',
                warehouse: '라임북(정품)',
                deliveryQuantity: 1,
                supplyAmount: 13200,
                progress: '주문 등록',
                registrationDate: '2023.06.01',
                requestDate: '',
                note: '',
            },
            {
                id: 4,
                cnt: '',
                select: null,
                slipCode: 'G230802',
                company: '1',
                AccountCode: '111',
                logisticsCode: '090-923',
                connectionName: '1 ',
                branchName: '',
                orderSource: '주문 SCM',
                division: '신간',
                fedCondition: '위탁',
                warehouse: '라임북(정품)',
                deliveryQuantity: 1,
                supplyAmount: 13200,
                progress: '주문 등록',
                registrationDate: '2023.06.01',
                requestDate: '',
                note: '',
            },
        ],
        grid: null,
        selectRows: [],
    }));

    const initGrid = (grid) => {
        state.grid = grid;

        grid.columnFooters.rows.push(new wjcGrid.GroupRow());

        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + "<br/>" + html.split('\\n')[1] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                switch (col.binding) {
                    case 'connectionName':
                        let name = '<button id="btnLink" class="btnLink">'+item.connectionName+'</button>';
                        e.cell.innerHTML = name+' '+document.getElementById('tplBtnViewMode').innerHTML;
                        e.cell['dataItem'] = item;
                        break;
                    case 'cnt':
                        e.cell.classList.add('cell_blue_bg');
                        e.cell.innerHTML = e.row + 1;
                        e.cell['dataItem'] = item;
                        break;
                    case 'select':
                        if (item.progress == '주문 등록'){
                            if (item.select) {
                                e.cell.innerHTML = '<input id="iptSelect" type="checkbox" name= "'+col.binding+item.id+'" value="'+item.select+'" checked/>';
                            } else {
                                if (state.selectRows[0]){
                                    if (state.selectRows[0].connectionName === item.connectionName &&
                                        state.selectRows[0].orderSource === item.orderSource &&
                                        state.selectRows[0].fedCondition === item.fedCondition){
                                            e.cell.innerHTML = '<input id="iptSelect" type="checkbox" name= "'+col.binding+item.id+'" value="'+item.select+'" />';
                                    } else {
                                        e.cell.innerHTML = '<input id="iptSelect" type="checkbox" name= "'+col.binding+item.id+'" value="'+item.select+'" disabled />';
                                    }
                                    
                                } else {
                                    e.cell.innerHTML = '<input id="iptSelect" type="checkbox" name= "'+col.binding+item.id+'" value="'+item.select+'" />';
                                }
                            }
                        }
                        e.cell['dataItem'] = item;
                        break;
                }
            }
        });


        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                switch(e.target.id){
                    case 'btnLink' :
                        viewDrawerOpen();
                        break;
                }
            }
            if(e.target instanceof HTMLInputElement) {
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                switch(e.target.id){
                    case 'iptSelect':
                        if(e.target.checked){
                            state.selectRows = state.selectRows.concat(item);
                        } else {
                            state.selectRows = state.selectRows.filter(selRow => selRow.id !== item.id);
                        }
                        item.select = e.target.checked;
                        state.grid.collectionView.refresh();
                        break;
                }
            }
        });
    };

    const theGrid = useRef();
    const theSearch = useRef();

    useEffect(()=>{
        let Grid = theGrid.current.control;
        let search = theSearch.current.control;
        search.grid = Grid;
    },[]);

    const mergeHandler = () => {
        confirm({
            title: '선택한 출고를 합치면서 주문일은 오늘로, 주문 등록자는 본인으로 변경합니다.',
            onOk() {
                console.log('OK');
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    }

    return(
        <Row className="table">
            <Col className="label" span={24} style={{justifyContent: "space-between"}}>
                <FlexGridSearch ref={theSearch} placeholder='검색'/>
                {state.selectRows[0] ? <Button type='primary' onClick={mergeHandler}>출고 병합</Button> : <Button className="btn btn-primary btn_add" shape="circle" onClick={addDrawerOpen}>+</Button>}
            </Col>
            <Col span={24}>
                <FlexGrid
                    ref={theGrid}
                    itemsSource={state.list}
                    initialized={(s) => initGrid(s)}
                    headersVisibility="Column"
                    selectionMode="Row"
                    autoRowHeights={true}
                    isReadOnly={true}
                    style={{ minHeight: `calc(100vh - ${gridHeight}px)`, maxHeight: `calc(100vh - ${gridHeight}px)` }}
                >
                    <FlexGridColumn binding="select" header="선택" width={50} align="center"/>
                    <FlexGridColumn binding="slipCode" header="전표 코드" width={80} />
                    <FlexGridColumn binding="company" header="회사" width={70} />
                    <FlexGridColumn binding="AccountCode" header="거래처\n코드" width={80} />
                    <FlexGridColumn binding="logisticsCode" header="물류 코드" width={90} />
                    <FlexGridColumn binding="connectionName" header="거래처명" width="*" minWidth={120} />
                    <FlexGridColumn binding="branchName" header="지점명" width="*" minWidth={120} />
                    <FlexGridColumn binding="orderSource" header="주문 출처" width={120} />
                    <FlexGridColumn binding="division" header="구분" width={80} />
                    <FlexGridColumn binding="fedCondition" header="공급 조건" width={80} />
                    <FlexGridColumn binding="warehouse" header="창고" width={80} align="right"/>
                    <FlexGridColumn binding="deliveryQuantity" header="출고\n수량" width={70} align="right" aggregate="Sum"/>
                    <FlexGridColumn binding="supplyAmount" header="공급 금액" width={100} align="right" aggregate="Sum"/>
                    <FlexGridColumn binding="progress" header="진행 상태" width={100} />
                    <FlexGridColumn binding="registrationDate" header="주문 등록일" width={100} />
                    <FlexGridColumn binding="requestDate" header="출고 요청일" width={100} />
                    <FlexGridColumn binding="note" header="비고" width={80} />
                </FlexGrid>
                <div id="tplBtnViewMode">
                    <div className="btnLayoutWrap">
                        <button id="btnNew" className="btn-layout ant-btn ant-btn-circle">N</button>
                    </div>
                </div>
            </Col>
            
            {addVisible && <AddDrawer drawerVisible={addVisible} drawerClose={addDrawerClose} />}
            {viewVisible && <ViewDrawer drawerVisible={viewVisible} drawerClose={viewDrawerClose} />}
        </Row>
    );
});

export default index;