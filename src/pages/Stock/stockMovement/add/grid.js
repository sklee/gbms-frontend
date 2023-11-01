import React, { useState, useRef, useEffect } from 'react';
import { FlexGrid, FlexGridColumn, FlexGridCellTemplate } from "@grapecity/wijmo.react.grid";
import { Row, Col, Button, Drawer, Space, Input, Select, Modal } from 'antd';

import * as wjCore from '@grapecity/wijmo';
import { CollectionView } from "@grapecity/wijmo";
import { observer, useLocalStore } from 'mobx-react';


const { Option } = Select;

const index = observer(( props ) =>{

    const state = useLocalStore(() => ({
        list: [
            {
                id: 0,
                prdCode: 'GB1234',
                prdName: '슈퍼파닉스 한글 1권 - 모음',
                release: '정품',
                incoming: '폐기대기',
                amount: '10',
                note: '',
                work: '',
                error: true,
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
                switch(col.binding){
                    case 'work':
                        if (state.addBtn) {
                            e.cell.innerHTML = `<div class="v-center">
                                <div>작업</div>
                                <button id="rowAdd" class="ant-btn" type="button">추가</button>
                            </div>`;
                        } else {
                            e.cell.innerHTML = `<div class="v-center">
                                <div>작업</div>
                                <button id="rowDel" class="ant-btn" type="button">취소</button>
                            </div>`;
                        }
                        
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
                if (item == state.currentEditItem) {
                    switch (col.binding) {
                        case 'release':
                        case 'incoming':
                            break;
                        case 'work':
                            e.cell.innerHTML = '<button id="btnDataAdd" class="btnText blueTxt">추가</button>';
                            break;
                        default:
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item[col.binding]+'"'+'id="'+col.binding+'"'+'value="'+item[col.binding]+'"/>';
                            break;
                    }
                } else {
                    switch (col.binding) {
                        case 'amount':
                            if(item.error){
                                e.cell.innerHTML = `<span class='redTxt fontBold'>${item.amount}</span>`
                            }
                            break;
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
                const regex = /[^0-9]/g;
                const num = e.target.id.replace(regex, "");
                const str = e.target.id.replace(new RegExp("[(0-9)]", "gi"), "");

                if(Number(num) === 1){
                    state.currentEditItem[str][num] = Number(e.target.value);
                } else {
                    if(typeof state.currentEditItem[e.target.id] === 'object') {
                        state.currentEditItem[e.target.id][0] = Number(e.target.value);
                    } else {
                        state.currentEditItem[e.target.id] = Number(e.target.value);
                    }
                }
            }
        });

        rowAdd();
    };

    //추가 버튼 
    const rowAdd=(e)=>{
        state.addCnt = state.addCnt-1;
        state.currentEditItem = {
            id: state.list.length,
            prdCode: '',
            prdName: '',
            release: '',
            incoming: '',
            amount: '',
            note: '',
            work: '',
            error: false,
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
        state.addBtn =true;
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
            <FlexGrid
                itemsSource={state.list}
                initialized={(s) => initGrid(s)}
                style={{maxHeight: '500px', marginTop: 30}}
                headersVisibility="Column"
                isReadOnly={true}
                allowSorting={false}
                autoRowHeights={true}
            >
                <FlexGridColumn binding="prdCode" header="상품코드" width={100} />
                <FlexGridColumn binding="prdName" header="상품명(내부)" width="*" minWidth={120} />
                <FlexGridColumn binding="release" header="출고 상태" width={100} >
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
                                return cell.item.release;
                            }
                            
                        }}
                    />
                </FlexGridColumn>
                <FlexGridColumn binding="incoming" header="입고 상태" width={100} >
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
                                return cell.item.incoming;
                            }
                            
                        }}
                    />
                </FlexGridColumn>
                <FlexGridColumn binding="amount" header="수량" width={80} align="right"/>
                <FlexGridColumn binding="note" header="비고" width="*" minWidth={120} />
                <FlexGridColumn binding="work" header="작업" width={100} align="center"/>
            </FlexGrid>

            <div id="tplBtnViewMode">
                <div className="btnLayoutWrap">
                    <button id="btnNew" className="btn-layout ant-btn ant-btn-circle">N</button>
                </div>
            </div>
        </>
    );
});

export default index;