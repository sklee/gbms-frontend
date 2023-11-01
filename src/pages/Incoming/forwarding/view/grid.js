import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Button, Modal, Input, Select, Upload } from 'antd';
import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import { Selector } from "@grapecity/wijmo.grid.selector";
import * as wjcGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';
import { CollectionView } from "@grapecity/wijmo";
import { observer, useLocalStore } from 'mobx-react';

// const { Option } = Select;

const index = observer(( props ) =>{

    const state = useLocalStore(() => ({
        list: [
            {
                id: 0,
                prdCode: 'GA03',
                prdName: '경제학 무작정 따라하기',
                isbn: '95512',
                price: 15000,
                quantity: 30,
                slipCode: 'G230802',
                note: '',
                work: '',
            },
        ],
        grid: null,
        addCnt: 1,
        addBtn: true,
        currentEditItem: null,
    }));


    const initGrid = (grid) => {
        state.grid = grid;

        grid.columnFooters.rows.push(new wjcGrid.GroupRow());

        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
                let col = s.columns[e.col];
                switch(col.binding){
                    case 'work':
                        if(state.addBtn){
                            e.cell.innerHTML = `<div class="v-center">
                                <div>작업</div>
                                <button id="btnRowAdd" type="button" class="ant-btn">추가</button>
                            </div>`;
                        } else {
                            e.cell.innerHTML = `<div class="v-center">
                                <div>작업</div>
                                <button id="btnRowDel" type="button" class="ant-btn">취소</button>
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

                if(item == state.currentEditItem){
                    switch (col.binding) {
                        case 'prdCode':
                        case 'prdName':
                        case 'isbn':
                        case 'quantity':
                        case 'slipCode':
                        case 'note':
                            e.cell.innerHTML = '<input id="'+col.binding+'" class="ant-input" value="'+item[col.binding]+'" />';
                            e.cell['dataItem'] = item;
                            break;
                        case 'work':
                            e.cell.innerHTML = '<button id="btnAdd" class="btnText blueTxt" type="button">추가</button><button id="btnCancel" class="btnText redTxt" type="button">취소</button>';
                            e.cell['dataItem'] = item;
                            break;
                    }
                } else {
                    switch (col.binding) {
                        case 'prdName':
                            let name = '<button id="btnLink" class="btnLink">'+item.prdName+'</button>';
                            e.cell.innerHTML = name+' '+document.getElementById('tplBtnViewMode').innerHTML;
                            e.cell['dataItem'] = item;
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
            if (e.target instanceof HTMLButtonElement) {
                let item = wjCore.closest(e.target, '.wj-cell')?.['dataItem'];
                switch(e.target.id){
                    case 'btnRowAdd':
                        rowAdd();
                        break;
                    case 'btnRowDel':
                        cancelEdit();
                        break;
                    case 'btnAdd':
                        commitEdit();
                        break;
                    case 'btnCancel':
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
            if (e.target instanceof HTMLInputElement) {
                state.currentEditItem[e.target.id] = e.target.value;
            }
        });
    };

    //추가 버튼 
    const rowAdd=(e)=>{
        state.addCnt = state.addCnt-1;
        state.currentEditItem = {
            id: state.list.length,
            prdCode: '',
            prdName: '',
            isbn: '',
            price: '',
            quantity: '',
            slipCode: '',
            note: '',
            work: '',
            addCode: '',
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
        state.grid.invalidate()
        state.grid.collectionView.refresh();
    }

    //확인 버튼
    const commitEdit=(idx)=> {
        state.currentEditItem.addCode = false;
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
            state.currentEditItem.addCode = false;
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
                allowMerging="ColumnHeaders"
                allowDragging="Both"
                // selectionMode="None"
                // isReadOnly={true}
                allowSorting={false}
                autoRowHeights={true}
            >
                <FlexGridColumn binding="prdCode" header="상품코드" width={100} />
                <FlexGridColumn binding="prdName" header="상품명(내부)" width="*" minWidth={150} />
                <FlexGridColumn binding="isbn" header="ISBN" width={100} />
                <FlexGridColumn binding="price" header="정가" width={100} align="right"/>
                <FlexGridColumn binding="quantity" header="수량" width={80} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="slipCode" header="연결 전표\n코드" width={100} />
                <FlexGridColumn binding="note" header="비고" width={150} />
                <FlexGridColumn binding="work" header="작업" width={100} align="center" />
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