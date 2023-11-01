import React, { useState, useRef, useEffect } from 'react';
import { FlexGrid, FlexGridColumn, FlexGridCellTemplate } from "@grapecity/wijmo.react.grid";
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { Row, Col, Button, Drawer, Space, Input, Select, Modal } from 'antd';

import * as wjCore from '@grapecity/wijmo';
import { CollectionView } from "@grapecity/wijmo";
import { observer, useLocalStore } from 'mobx-react';


const { Option } = Select;

const OutsideDrawer = observer(( props ) =>{

    React.useEffect(() => {
        theSearch.current.control.grid = theGrid.current.control;
    }, [])

    const theGrid = useRef();
    const theSearch = useRef();

    const state = useLocalStore(() => ({
        list: [
            {
                id: 0,
                accountName: '한국출판콘텐츠(KPC)',
                prdCode: 'ABC1122334455',
                prdName: '',
                period: '월',
                ref: '',
                registrationDate: '2022-05-20',
                registrant: '김명자',
                work: '',
            },
        ],
        grid: null,
        addCnt: 1,
        addBtn: true,
        currentEditItem: null,
        disuseDataSum: null
    }));

    const initGrid = (grid) => {
        state.grid = grid;

        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
                let col = s.columns[e.col];
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + "<br/>" + html.split('\\n')[1] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                if (item == state.currentEditItem) {
                    switch (col.binding) {
                        case 'work':
                            e.cell.innerHTML = '<button id="btnDataAdd" class="btnText blueTxt">추가</button>';
                            break;
                        case 'prdCode':
                        case 'prdName':
                        case 'ref':
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item[col.binding]+'"'+'id="'+col.binding+'"'+'value="'+item[col.binding]+'"/>';
                            break;
                    }
                } else {
                    switch (col.binding) {
                        case 'work':
                            e.cell.innerHTML = '<button id="btnModify" class="btnText blueTxt" type="button">수정</button><button id="btnDel" class="btnText redTxt" type="button">삭제</button>';
                            e.cell['dataItem'] = item;
                            break;
                    }
                }
                
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            let item = wjCore.closest(e.target, '.wj-cell')?.['dataItem'];
            if (e.target instanceof HTMLButtonElement) {
                switch(e.target.id){
                    case 'rowAdd':
                        rowAdd();
                        break;
                    case 'rowDel':
                        cancelEdit();
                        break;
                    case 'btnDataAdd':
                        commitEdit()
                        break;
                    case 'btnRowDel':
                        cancelEdit();
                        break;
                    case 'btnModify':
                        editItem(item);
                        break;
                    case 'btnDel':
                        rowDel(item.id);
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'change', (e) => {
            if(e.target instanceof HTMLInputElement) {
                if(e.target.id === 'amount'){
                    state.currentEditItem[e.target.id] = Number(e.target.value);
                } else {
                    state.currentEditItem[e.target.id] = e.target.value;
                }
                
            }
        });
    };

    //추가 버튼 
    const rowAdd=(e)=>{
        state.addCnt = state.addCnt-1;
        state.currentEditItem = {
            id: state.list.length,
            accountName: '',
            prdCode: '',
            prdName: '',
            period: '',
            ref: '',
            registrationDate: '',
            registrant: '',
            work: '',
            addCode: '',
            modify: true
        };
        let view = new CollectionView(state.list);
        view.sourceCollection.splice(0 ,0,state.currentEditItem); //값 삽입
        state.grid.collectionView.refresh(state.currentEditItem); // 삽입된 값 그리드에 반영
        state.addBtn = false;
    }

    const rowDel=(rowId)=>{
        state.list = state.list.filter( row => row.id != rowId);
    }

    //수정 버튼 
    const editItem = (item) => {
        state.currentEditItem = item;
        state.currentEditItem.modify = true;
        state.grid.invalidate()
        state.grid.collectionView.refresh();
    }

    //확인 버튼
    const commitEdit=(idx)=> {
        state.currentEditItem.modify = false;
        state.currentEditItem = null;
        state.grid.invalidate();
        state.grid.collectionView.refresh();
        state.addBtn = true;
    }

    // 취소 버튼
    const cancelEdit = () => {
        if (state.currentEditItem) {
            if(state.currentEditItem.addCode === ''){ //행추가 취소시 행 삭제
                state.addCnt = state.addCnt+1;
                state.grid.collectionView.remove(state.currentEditItem);
                state.addBtn = true;
            }
            state.currentEditItem.modify = false;
            state.currentEditItem = null;
            state.grid.invalidate();
            state.grid.collectionView.refresh();
        }
    }

    return(
        <>
            <Row className="topTableInfo" justify="space-around">
                <Col span={16}>
                    <FlexGridSearch ref={theSearch} placeholder='검색' />
                </Col>
                <Col span={8} className="topTable_right">
                    {state.addBtn == 1 ? (
                        <Button className="btn btn-primary btn_add" shape="circle" onClick={rowAdd}>+</Button>
                    ) : (
                        <Button className="btn btn-primary btn_add" shape="circle" onClick={cancelEdit}>-</Button>
                    )}
                    
                </Col>
            </Row>
            <Row id="gridWrap" className="gridWrap">
                <FlexGrid
                    ref={theGrid}
                    itemsSource={state.list}
                    initialized={(s) => initGrid(s)}
                    headersVisibility="Column"
                    isReadOnly={true}
                    allowSorting={false}
                    autoRowHeights={true}
                >
                    <FlexGridColumn binding="accountName" header="거래처명*" width={150}>
                        <FlexGridCellTemplate
                            cellType="Cell"
                            template={(cell) => {
                                if(cell.item.modify) {
                                    return (                
                                    <Select
                                        style={{ width: '100%' }}
                                        placeholder="선택"
                                    >
                                        <Option value={1}>1</Option>
                                    </Select>);
                                } else {
                                    return cell.item.accountName;
                                }
                                
                            }}
                        />
                    </FlexGridColumn>
                    <FlexGridColumn binding="prdCode" header="거래처\n상품 코드*" width={120} />
                    <FlexGridColumn binding="prdName" header="거래처의 상품명" width="*" minWidth={120}/>
                    <FlexGridColumn binding="period" header="정산 주기*" width={100} >
                        <FlexGridCellTemplate
                            cellType="Cell"
                            template={(cell) => {
                                if(cell.item.modify) {
                                    return (                
                                    <Select
                                        style={{ width: '100%' }}
                                        placeholder="선택"
                                    >
                                        <Option value={1}>1</Option>
                                    </Select>);
                                } else {
                                    return cell.item.period;
                                }
                                
                            }}
                        />
                    </FlexGridColumn>
                    <FlexGridColumn binding="ref" header="참고 사항" width={150} />
                    <FlexGridColumn binding="registrationDate" header="등록일" width={100} />
                    <FlexGridColumn binding="registrant" header="등록자" width={80} />
                    <FlexGridColumn binding="work" header="작업" width={100} align="center"/>
                </FlexGrid>

                <div id="tplBtnViewMode">
                    <div className="btnLayoutWrap">
                        <button id="btnNew" className="btn-layout ant-btn ant-btn-circle">N</button>
                    </div>
                </div>
            </Row>
            <Row gutter={10} className="table_bot">
                <span>행 개수 : {state.list.length}</span>
            </Row>
            <Row justify='center' style={{margin: 30}}>
                <Button type='primary submit' >확인</Button>
                <Button type='button' style={{marginLeft: 10}}>취소</Button>
            </Row>
        </>
    );
});

export default OutsideDrawer;