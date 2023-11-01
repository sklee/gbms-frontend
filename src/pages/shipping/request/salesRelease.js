import React, { useState, useEffect } from 'react';
import { Row, Col, Tabs, Button } from 'antd';
import { CaretRightOutlined, CaretLeftOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import { Selector } from "@grapecity/wijmo.grid.selector";
import * as wjcGrid from '@grapecity/wijmo.grid';
import * as wjGrid from '@grapecity/wijmo.grid';
import { CollectionView } from "@grapecity/wijmo";
import SplitPane from "react-split-pane";

import ViewDrawer from '../sale/view';

const index = observer(({ tab, gridHeight }) =>{
    const state = useLocalStore(() => ({
        leftGridList: [
            {
                id: 1,
                chk: '',
                releaseCount: 1,
                accountCode: 'SADC23',
                logisticsCode: '110-510',
                accountName: '영풍문고 ',
                branchName: '광화문점',
                addressName: '영풍문고',
                orderMagnitude: 1,
                division: '일반',
                forwardingType: '일반',
                fedCondition: '위탁',
                forwardingQuantity: 20,
                amountSupplied: 160800,
                progressStatus: '출고 등록',
                note: '광화문점',
                requestor: '',
                requestTime: '',
            },
            {
                id: 1,
                chk: '',
                releaseCount: 1,
                accountCode: 'SADC23',
                logisticsCode: '110-510',
                accountName: '영풍문고 ',
                branchName: '광화문점',
                addressName: '영풍문고',
                orderMagnitude: 1,
                division: '일반',
                forwardingType: '일반',
                fedCondition: '위탁',
                forwardingQuantity: 20,
                amountSupplied: 160800,
                progressStatus: '출고 등록',
                note: '광화문점',
                requestor: '',
                requestTime: '',
            },
        ],
        rightGridList: [
            {
                id: 1,
                chk: '',
                releaseCount: 1,
                accountCode: 'SADC23',
                logisticsCode: '110-510',
                accountName: '교보문고 ',
                branchName: '광화문점',
                addressName: '영풍문고',
                orderMagnitude: 1,
                division: '일반',
                forwardingType: '일반',
                fedCondition: '위탁',
                forwardingQuantity: 20,
                amountSupplied: 160800,
                progressStatus: '출고 등록',
                note: '광화문점',
                requestor: '',
                requestTime: '',
            }
        ],
    }));

    return(
        <SplitPane
            // split="vertical"
            // maxSize={-100}
            minSize={100}
            defaultSize={"50%"}
        >
            <div>
                <Row className="table">
                    <Col className="label" span={24}>
                        출고 요청한 내역
                        <Button
                            type='primary button'
                            style={{position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)'}}
                        >선택 이동 <CaretRightOutlined /></Button>
                    </Col>
                    <Col span={24}>
                        {tab == 'etcRelease' ? <EtcGrid list={state.leftGridList} gridHeight={gridHeight} /> : <Grid list={state.leftGridList} gridHeight={gridHeight}/>}
                    </Col>
                </Row>
            </div>
            <div>
                <Row className="table">
                    <Col className="label" span={24} style={{backgroundColor: '#a1a1a1', color: '#fff'}}>
                        출고 요청한 내역
                        <Button
                            type='primary button'
                            style={{position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)'}}
                        ><CaretLeftOutlined /> 선택 이동</Button>
                    </Col>
                    <Col span={24}>
                        {tab == 'etcRelease' ? <EtcGrid list={state.rightGridList} gridHeight={gridHeight}/> : <Grid list={state.rightGridList} gridHeight={gridHeight}/>}
                        
                    </Col>
                </Row>
                <div style={{display: 'flex', justifyContent: 'center', paddingTop: 30}}>
                    <Button type='primary button' style={{marginRight: 10}}>출고 요청</Button>
                    <Button type='button'>취소</Button>
                </div>
            </div>
        </SplitPane>
        // <Row>   
        //     <Col span={12} style={{paddingRight: 10}}>
        //         <Row className="table">
        //             <Col className="label" span={24}>
        //                 출고 요청한 내역
        //                 <Button
        //                     type='primary button'
        //                     style={{position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)'}}
        //                 >선택 이동 <CaretRightOutlined /></Button>
        //             </Col>
        //             <Col span={24}>
        //                 {tab == 'etcRelease' ? <EtcGrid list={state.leftGridList}/> : <Grid list={state.leftGridList}/>}
        //             </Col>
        //         </Row>
        //     </Col>
        //     <Col span={12}>
        //         <Row className="table">
        //             <Col className="label" span={24} style={{backgroundColor: '#a1a1a1', color: '#fff'}}>
        //                 출고 요청한 내역
        //                 <Button
        //                     type='primary button'
        //                     style={{position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)'}}
        //                 ><CaretLeftOutlined /> 선택 이동</Button>
        //             </Col>
        //             <Col span={24}>
        //                 {tab == 'etcRelease' ? <EtcGrid list={state.rightGridList}/> : <Grid list={state.rightGridList}/>}
                        
        //             </Col>
        //         </Row>
        //         <div style={{display: 'flex', justifyContent: 'center', paddingTop: 30}}>
        //             <Button type='primary button' style={{marginRight: 10}}>출고 요청</Button>
        //             <Button type='button'>취소</Button>
        //         </div>
        //     </Col>
        // </Row>
    );
});

export default index;


const Grid = observer(({ list, gridHeight }) => {
    const state = useLocalStore(() => ({
        list: [],
        grid: null,
        addCnt: 1,
        addBtn: true,
        currentEditItem: null,
    }));

    const [selectorState, setSelectorState] = useState({
        view: new CollectionView(state.list),
        selectedItems: []
    });

    const [viewVisible, setDrawerVisible] = useState(false);
    const viewDrawerOpen = () => setDrawerVisible(true);
    const viewDrawerClose = () => setDrawerVisible(false);

    useEffect(()=>{
        state.list = list;
    },[list]);

    const initGrid = (grid) => {
        state.grid = grid;

        state.selectRows = new Selector(grid, {
            itemChecked: () => {
                setSelectorState({
                    selectedItems: grid.rows.filter(r => r.isSelected)
                });
            }
        })
        state.selectRows._col.allowMerging = true;
        state.selectRows.column = grid.columns[0];

        grid.columnFooters.rows.push(new wjcGrid.GroupRow());

        grid.formatItem.addHandler(function (s, e) {
            // if(e.panel._ct == 4){
            //     e.cell.innerHTML = '<div class="v-center">순서</div>';
            // }

            // if(e.panel == s.rowHeaders){
            //     e.cell.innerHTML = e.row + 1;
            // }

            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
                let col = s.columns[e.col];
                switch(col.binding){
                    case 'chk':
                        e.cell.classList.add("headCenter")
                        break;
                    default:
                        if(html.split('\\n').length > 1){
                            e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + "<br/>" + html.split('\\n')[1] + '</div>';
                        }else{
                            e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                        }
                }
            }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;

                switch (col.binding) {
                    case 'accountName':
                        let name = '<button id="btnLink" class="btnLink">'+item.accountName+'</button>';
                        e.cell.innerHTML = name+' '+document.getElementById('tplBtnViewMode').innerHTML;
                        e.cell['dataItem'] = item;
                        break;
                }
            }
        });


        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                switch(e.target.id){
                    case 'btnLink':
                        viewDrawerOpen();
                        break;
                }
            }
        });
    };



    return (
        <>
            <FlexGrid
                itemsSource={state.list}
                initialized={(s) => initGrid(s)}
                isReadOnly={true}
                selectionMode="None"
                allowMerging="ColumnHeaders"
                headersVisibility="Column"
                autoRowHeights={true}
                style={{ minHeight: `calc(100vh - ${gridHeight}px)`, maxHeight: `calc(100vh - ${gridHeight}px)` }}
            >
                <FlexGridColumn binding="chk" header=" " width={50} align="center" cssClass="chk" />
                <FlexGridColumn binding="releaseCount" header="출고\n차수" width={60} />
                <FlexGridColumn binding="accountCode" header="거래처 코드" width={90} />
                <FlexGridColumn binding="logisticsCode" header="물류 코드" width={90} />
                <FlexGridColumn binding="accountName" header="거래처명" width={'*'} minWidth={120} />
                <FlexGridColumn binding="branchName" header="지점명" width={100} />
                <FlexGridColumn binding="orderMagnitude" header="전표\n차수" width={60} />
                <FlexGridColumn binding="division" header="구분" width={70} />
                <FlexGridColumn binding="fedCondition" header="공급\n조건" width={70} />
                <FlexGridColumn binding="forwardingQuantity" header="출고\n수량" width={70} aggregate="Sum"/>
                <FlexGridColumn binding="amountSupplied" header="공급 금액" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="progressStatus" header="진행 상태" width={100} />
                <FlexGridColumn binding="note" header="비고" width={100} />
                <FlexGridColumn binding="requestor" header="요청자" width={100} />
                <FlexGridColumn binding="requestTime" header="요청 시간" width={100} />
            </FlexGrid>
            <div id="tplBtnViewMode">
                <div className="btnLayoutWrap">
                    <button id="btnNew" className="btn-layout ant-btn ant-btn-circle">N</button>
                </div>
            </div>
            {viewVisible && <ViewDrawer drawerVisible={viewVisible} drawerClose={viewDrawerClose} />}
        </>
    );
});

const EtcGrid = observer(({ list, gridHeight}) => {
    const state = useLocalStore(() => ({
        list: [],
        grid: null,
        addCnt: 1,
        addBtn: true,
        currentEditItem: null,
    }));

    const [selectorState, setSelectorState] = useState({
        view: new CollectionView(state.list),
        selectedItems: []
    });

    const [viewVisible, setDrawerVisible] = useState(false);
    const viewDrawerOpen = () => setDrawerVisible(true);
    const viewDrawerClose = () => setDrawerVisible(false);

    useEffect(()=>{
        state.list = list;
    },[list]);

    const initGrid = (grid) => {
        state.grid = grid;

        state.selectRows = new Selector(grid, {
            itemChecked: () => {
                setSelectorState({
                    selectedItems: grid.rows.filter(r => r.isSelected)
                });
            }
        })
        state.selectRows._col.allowMerging = true;
        state.selectRows.column = grid.columns[0];

        grid.columnFooters.rows.push(new wjcGrid.GroupRow());

        grid.formatItem.addHandler(function (s, e) {
            if(e.panel._ct == 4){
                e.cell.innerHTML = '<div class="v-center">순서</div>';
            }

            if(e.panel == s.rowHeaders){
                e.cell.innerHTML = e.row + 1;
            }

            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
                let col = s.columns[e.col];
                switch(col.binding){
                    case 'chk':
                        e.cell.classList.add("headCenter")
                        break;
                    default:
                        if(html.split('\\n').length > 1){
                            e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + "<br/>" + html.split('\\n')[1] + '</div>';
                        }else{
                            e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                        }
                }
            }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;

                switch (col.binding) {
                    case 'addressName':
                        let name = '<button id="btnLink" class="btnLink">'+item.addressName+'</button>';
                        e.cell.innerHTML = name+' '+document.getElementById('tplBtnViewMode').innerHTML;
                        e.cell['dataItem'] = item;
                        break;
                }
            }
        });


        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                switch(e.target.id){
                    case 'btnLink':
                        viewDrawerOpen();
                        break;
                }
            }
        });
    };



    return (
        <>
            <FlexGrid
                itemsSource={state.list}
                initialized={(s) => initGrid(s)}
                isReadOnly={true}
                selectionMode="None"
                allowMerging="ColumnHeaders"
                headersVisibility="Column"
                autoRowHeights={true}
                style={{ minHeight: `calc(100vh - ${gridHeight}px)`, maxHeight: `calc(100vh - ${gridHeight}px)` }}
            >
                <FlexGridColumn binding="chk" header=" " width={50} align="center" cssClass="chk" />
                <FlexGridColumn binding="releaseCount" header="출고\n차수" width={60} />
                <FlexGridColumn binding="accountCode" header="거래처 코드" width={90} />
                <FlexGridColumn binding="logisticsCode" header="물류 코드" width={90} />
                <FlexGridColumn binding="addressName" header="출고처명" width={'*'} minWidth={120} />
                <FlexGridColumn binding="orderMagnitude" header="전표\n차수" width={60} />
                <FlexGridColumn binding="forwardingType" header="출고\n유형" width={80} />
                <FlexGridColumn binding="forwardingQuantity" header="출고\n수량" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="progressStatus" header="진행 상태" width={100} />
                <FlexGridColumn binding="note" header="비고" width={100} />
                <FlexGridColumn binding="requestor" header="요청자" width={100} />
                <FlexGridColumn binding="requestTime" header="요청 시간" width={100} />
            </FlexGrid>
            <div id="tplBtnViewMode">
                <div className="btnLayoutWrap">
                    <button id="btnNew" className="btn-layout ant-btn ant-btn-circle">N</button>
                </div>
            </div>
            {viewVisible && <ViewDrawer drawerVisible={viewVisible} drawerClose={viewDrawerClose} />}
        </>
    );
});