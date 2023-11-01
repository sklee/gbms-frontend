import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Button, Modal, Input, Select, Upload } from 'antd';
import { FlexGrid, FlexGridColumn, FlexGridCellTemplate } from "@grapecity/wijmo.react.grid";
import { Selector } from "@grapecity/wijmo.grid.selector";
import * as wjcGrid from '@grapecity/wijmo.grid';
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';
import { CollectionView } from "@grapecity/wijmo";
import { observer, useLocalStore } from 'mobx-react';

// const { Option } = Select;

const index = observer(( props ) =>{

    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                prdCode: ['GA20', 'GA30'],
                prdName: '경제학 무작정 따라하기',
                isbn: '987',
                price: 15000,
                releaseDate: '2021-03-17',
                supplyRate: [70, 65],
                release: [1230, 2000],
                return: [1225, 100],
                difference: [5, 1900],
                returnMaterials: 12,
                processedQuantity: 12,
                returnAmount: 442500,
                equipmentData: 10,
                equipmentReturn: [5, 5],
                equipmentBack: 0,
                disuseData: 2,
                disuseReturn: [2, 0],
                disuseBack: 0,
                note: '',
                work: '',
            },
            {
                id: 0,
                prdCode: 'GA20',
                prdName: '경제학 무작정 따라하기',
                isbn: '978',
                price: 15000,
                releaseDate: '2018-08-24',
                supplyRate: [75, 70],
                release: [12, 10],
                return: [10, 6],
                difference: [2, 4],
                returnMaterials: 9,
                processedQuantity: 8,
                returnAmount: 442500,
                equipmentData: 7,
                equipmentReturn: [2, 4],
                equipmentBack: 1,
                disuseData: 2,
                disuseReturn: [0, 0],
                disuseBack: 1,
                note: '',
                work: '',
            },
        ],
        grid: null,
        addCnt: 1,
        addBtn: true,
        currentEditItem: null,
        returnMaterials: null,
        disuseData: null
    }));

    const flexGridRef = useRef();

    const flexGrid = flexGridRef.current;
    const mergeManager = new wjGrid.MergeManager(flexGrid);
    
    mergeManager.getMergedRange = (p, r, c) => {
        let rng = null;

        rng = new wjGrid.CellRange(r, c);
        let prevCol = c > 0 ? c - 1 : c;

        let val = p.getCellData(r, c, false);
        let prevVal = p.getCellData(r, prevCol);

        
        
        let isbn = null;
        let price = null;
        if(p.rows[r]._data!=null){
            isbn = p.rows[r]._data.isbn;
        }
        if(p.rows[r]._data!=null){
            price = p.rows[r]._data.price;
        }

        // header left / right
        for (let i = rng.col; i < p.columns.length - 1; i++) {
            if (p.getCellData(rng.row, i, true) != p.getCellData(rng.row, i + 1, true)) break;
            if(p._e.className == 'wj-colheaders') rng.col2 = i + 1;
        }
        for (let i = rng.col; i > 0; i--) {
            if (p.getCellData(rng.row, i, true) != p.getCellData(rng.row, i - 1, true)) break;
            if(p._e.className == 'wj-colheaders') rng.col = i - 1;
            
        }

        // header expand up
        while (rng.row > 0 && p._e.className == 'wj-colheaders' && 
            (rng.col < 5 || rng.col == 9 || rng.col == 10 || rng.col == 11 || rng.col > 17) &&
            p.getCellData(rng.row - 1, c, false) == val) {
            rng.row--;
        }

        // header expand down
        while (rng.row2 < p.rows.length - 1 && p._e.className == 'wj-colheaders' && 
            (rng.col < 5 || rng.col == 9 || rng.col == 10 || rng.col == 11 || rng.col > 17) &&
            p.getCellData(rng.row2 + 1, c, false) == val) {
            rng.row2++;
        }


        // expand up
        while (rng.row > 0 && p._e.className == 'wj-cells' && 
            (rng.col < 5 || rng.col == 9 || rng.col == 10 || rng.col == 11) &&
            p.getCellData(rng.row - 1, c, false) == val &&
            // p.getCellData(rng.row - 1, prevCol, false) == prevVal &&
            p.rows[rng.row - 1]._data?.isbn == isbn && 
            p.rows[rng.row - 1]._data?.price == price) {
            rng.row--;
        }

        // expand down
        while (rng.row2 < p.rows.length - 1 && p._e.className == 'wj-cells' && 
            (rng.col < 5 || rng.col == 9 || rng.col == 10 || rng.col == 11) &&
            p.getCellData(rng.row2 + 1, c, false) == val &&
            // p.getCellData(rng.row2 + 1, prevCol, false) == prevVal &&
            p.rows[rng.row2 + 1]._data?.isbn == isbn &&
            p.rows[rng.row2 + 1]._data?.price == price) {
            rng.row2++;
        }

        // don't bother with single-cell ranges
        if (rng.isSingleCell) {
            rng = null;
        }

        // done
        return rng;
    };

    const initGrid = (grid) => {
        state.grid = grid;

        let extraRow = new wjGrid.Row();
        extraRow.allowMerging = true;
        var panel = grid.columnHeaders;
        panel.rows.splice(0, 0, extraRow);

        for (let colIndex = 0; colIndex <= 19; colIndex++) {
            if(colIndex >= 5 && colIndex <= 8){ 
                panel.setCellData(0, colIndex, '출고 내역');
            } else if(colIndex >= 12 && colIndex <= 14){
                panel.setCellData(0, colIndex, '비품');
            } else if(colIndex >= 15 && colIndex <= 17){
                panel.setCellData(0, colIndex, '폐기대기');
            } else {
                let col = grid.getColumn(colIndex);
                col.allowMerging = true;
                panel.setCellData(0, colIndex, col.header);
            }
        }

        grid.columnFooters.rows.push(new wjcGrid.GroupRow());

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
                        case 'prdCode':
                        case 'prdName':
                        case 'isbn':
                        case 'equipmentData':
                        case 'equipmentReturn':
                        case 'equipmentBack':
                        case 'disuseData':
                        case 'disuseReturn':
                        case 'disuseBack':
                        case 'note':
                            if (typeof item[col.binding] === 'object') {
                                e.cell.innerHTML = `<div>
                                    <input class="ant-input" name="${item[col.binding][0]}" id="${col.binding}" value="${item[col.binding][0]}"/>
                                </div>
                                <div>
                                <input class="ant-input" name="${item[col.binding][1]}" id="${col.binding+1}" value="${item[col.binding][1]}"/>
                                </div>`;
                            } else {
                                e.cell.innerHTML = '<input class="ant-input" name ="'+item[col.binding]+'"'+'id="'+col.binding+'"'+'value="'+item[col.binding]+'"/>';
                            }
                            e.cell['dataItem'] = item;
                            break;
                        case 'work':
                            if(item.example != '회송'){
                                e.cell.innerHTML = '<button id="btnDataAdd" class="btnText blueTxt">추가</button><button id="btnRowDel" class="btnText grayTxt">취소</button>';
                            }
                            break;
                    }
                } else {
                    switch (col.binding) {
                        case 'prdCode':
                        case 'supplyRate':
                        case 'release':
                        case 'return':
                        case 'difference':
                        case 'equipmentReturn':
                            if (typeof item[col.binding] === 'object') {
                                e.cell.classList.add('noPad');
                                e.cell.innerHTML = '<div class="divide">'+item[col.binding][0]+'</div><div class="divide">'+item[col.binding][1]+'</div>';
                            }
                            e.cell['dataItem'] = item;
                            break;
                        case 'returnMaterials':
                        case 'processedQuantity':
                            if(item.returnMaterials !== item.processedQuantity){
                                e.cell.innerHTML = '<span class="redTxt fontBold">'+item[col.binding]+'</span>';
                            }
                            e.cell['dataItem'] = item;
                            break;
                        case 'disuseReturn':
                            if (typeof item[col.binding] === 'object') {
                                e.cell.classList.add('noPad');
                                if(item.disuseData !== item.disuseReturn[0] + item.disuseReturn[1] + item.disuseBack) {
                                    e.cell.innerHTML = '<div class="divide redTxt fontBold">'+item[col.binding][0]+'</div><div class="divide redTxt fontBold">'+item[col.binding][1]+'</div>';
                                } else {
                                    e.cell.innerHTML = '<div class="divide">'+item[col.binding][0]+'</div><div class="divide">'+item[col.binding][1]+'</div>';
                                }
                            }
                            e.cell['dataItem'] = item;
                            break;
                        case 'disuseBack':
                            if(item.disuseData !== item.disuseReturn[0] + item.disuseReturn[1] + item.disuseBack) {
                                e.cell.innerHTML = '<span class="redTxt fontBold">'+item[col.binding]+'</span>';
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
            if(e.target instanceof HTMLSelectElement) {
                switch(e.target.id){
                    case 'btnSel' :
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
            releaseDate: '',
            supplyRate: '',
            release: '',
            return: '',
            difference: '',
            returnMaterials: '',
            processedQuantity: '',
            returnAmount: '',
            equipmentData: 0,
            equipmentReturn: 0,
            equipmentBack: 0,
            disuseData: 0,
            disuseReturn: 0,
            disuseBack: 0,
            note: '',
            work: '',
            addCode: ''
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
                ref={flexGridRef}
                itemsSource={state.list}
                initialized={(s) => initGrid(s)}
                style={{maxHeight: '500px', marginTop: 30}}
                mergeManager={mergeManager}
                headersVisibility="Column"
                allowMerging="ColumnHeaders"
                allowDragging="Both"
                selectionMode="None"
                isReadOnly={true}
                allowSorting={false}
                autoRowHeights={true}
            >
                <FlexGridColumn binding="prdCode" header="상품코드" width={80} />
                <FlexGridColumn binding="prdName" header="상품명" width="*" minWidth={120} />
                <FlexGridColumn binding="isbn" header="ISBN" width={90} />
                <FlexGridColumn binding="price" header="정가" width={90} align="right"/>
                <FlexGridColumn binding="releaseDate" header="출시일" width={100} />
                <FlexGridColumn binding="supplyRate" header="공급률" width={70} align="right"/>
                <FlexGridColumn binding="release" header="출고" width={70} align="right"/>
                <FlexGridColumn binding="return" header="반품" width={70} align="right"/>
                <FlexGridColumn binding="difference" header="차이" width={70} align="right"/>
                <FlexGridColumn binding="returnMaterials" header="반품\n자료" width={70} align="right" aggregate="Sum">
                    <FlexGridCellTemplate
                        cellType="ColumnFooter"
                        template={(cell) => {
                            state.returnMaterials = cell.value;
                            return cell.value;
                        }}
                    />
                </FlexGridColumn>
                <FlexGridColumn binding="processedQuantity" header="처리\n수량" width={70} align="right" aggregate="Sum">
                    <FlexGridCellTemplate
                        cellType="ColumnFooter"
                        template={(cell) => {
                            if(state.returnMaterials == cell.value){
                                return cell.value;
                            } else {
                                return <span class="redTxt">{cell.value}</span>;
                            }
                        }}
                    />
                </FlexGridColumn>
                <FlexGridColumn binding="returnAmount" header="반품 금액" width={90} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="equipmentData" header="자료" width={70} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="equipmentReturn" header="반품" width={70} align="right" aggregate="Sum">
                    <FlexGridCellTemplate
                        cellType="ColumnFooter"
                        template={(context) => {
                            let sum = 0;
                            state.list.forEach((item)=>{
                                if(typeof item.equipmentReturn === 'object'){
                                    item.equipmentReturn.forEach((item)=>{
                                        sum += item;
                                    })
                                } else {
                                    sum += item.equipmentReturn;
                                }
                            });
                            return sum;
                        }}
                    />
                </FlexGridColumn>
                <FlexGridColumn binding="equipmentBack" header="회송" width={70} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="disuseData" header="자료" width={70} align="right" aggregate="Sum">
                    <FlexGridCellTemplate
                        cellType="ColumnFooter"
                        template={(context) => {
                            state.disuseData = context.value;
                            return context.value;
                        }}
                    />
                </FlexGridColumn>
                <FlexGridColumn binding="disuseReturn" header="반품" width={70} align="right" aggregate="Sum">
                    <FlexGridCellTemplate
                        cellType="ColumnFooter"
                        template={(context) => {
                            let returnSum = 0;
                            let backSum = 0;

                            state.list.forEach((item)=>{
                                if(typeof item.disuseReturn === 'object'){
                                    item.disuseReturn.forEach((item)=>{
                                        returnSum += item;
                                    })
                                } else {
                                    returnSum += item.disuseReturn;
                                }

                                if(item.disuseBack) {
                                    backSum += item.disuseBack;
                                }
                            });

                            if(state.disuseData > returnSum + backSum){
                                return <span class="redTxt">{returnSum}</span>;
                            } else {
                                return returnSum;
                            }
                        }}
                    />
                </FlexGridColumn>
                <FlexGridColumn binding="disuseBack" header="회송" width={70} align="right" aggregate="Sum">
                    <FlexGridCellTemplate
                        cellType="ColumnFooter"
                        template={(context) => {
                            let returnSum = 0;
                            let backSum = 0;

                            state.list.forEach((item)=>{
                                if(typeof item.disuseReturn === 'object'){
                                    item.disuseReturn.forEach((item)=>{
                                        returnSum += item;
                                    })
                                } else {
                                    returnSum += item.disuseReturn;
                                }

                                if(item.disuseBack) {
                                    backSum += item.disuseBack;
                                }
                            });

                            if(state.disuseData > returnSum + backSum){
                                return <span class="redTxt">{backSum}</span>;
                            } else {
                                return backSum;
                            }
                        }}
                    />
                </FlexGridColumn>
                <FlexGridColumn binding="note" header="비고" width={120} />
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