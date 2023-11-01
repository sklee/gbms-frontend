import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Button, Modal, Input } from 'antd';
import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import { Selector } from "@grapecity/wijmo.grid.selector";
import * as wjcGrid from '@grapecity/wijmo.grid';
import * as wjGrid from '@grapecity/wijmo.grid';
import { CollectionView } from "@grapecity/wijmo";
import { observer, useLocalStore } from 'mobx-react';


const index = observer(( props ) =>{

    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                chk: '',
                prdName: '믹스',
                prdCode: 'GA02',
                isbn: '96815',
                deliveryQuantity: 20,
                sum: 18,
                genuine: 18,
                equipment: 0,
                disuse: 0,
                price: 15000,
                supplyRate: 60,
                supplyUnit: 9000,
                supplyPrice: 144000,
                work: '',
            },
            {
                id: 2,
                chk: '',
                prdName: '경제학 무작정 따라하기',
                prdCode: 'GA03',
                isbn: '95512',
                deliveryQuantity: 2,
                sum: 2,
                genuine: 2,
                equipment: 0,
                disuse: 0,
                price: 14000,
                supplyRate: 60,
                supplyUnit: 8400,
                supplyPrice: 16800,
                work: '',
            },
        ],
        grid: null,
        selectRows: [],
        addCnt: 1,
        addBtn: true,
        currentEditItem: null,
    }));

    const [selectorState, setSelectorState] = useState({
        view: new CollectionView(state.list),
        selectedItems: []
    });

    const initGrid = (grid) => {
        state.grid = grid;

        let extraRow = new wjGrid.Row();
        extraRow.allowMerging = true;
        var panel = grid.columnHeaders;
        panel.rows.splice(0, 0, extraRow);

        state.selectRows = new Selector(grid, {
            itemChecked: () => {
                setSelectorState({
                    selectedItems: grid.rows.filter(r => r.isSelected)
                });
            }
        })
        state.selectRows._col.allowMerging = true;
        state.selectRows.column = grid.columns[0];

        for (let colIndex = 0; colIndex <= 13; colIndex++) {
            if(colIndex >= 5 && colIndex <= 8){ 
                panel.setCellData(0, colIndex, '출고 수량');
            } else {
                let col = grid.getColumn(colIndex);
                col.allowMerging = true;
                panel.setCellData(0, colIndex, col.header);
            }            
        }

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
                    // case 'supplyRate':
                    //     e.cell.innerHTML = `<div class="v-center"><div>공급률</div> <button class="ant-btn" id="btnModify">수정</button></div>`;
                    //     break;
                    case 'work':
                        if(state.addBtn === true){
                            e.cell.innerHTML = `<div class="v-center"><div>작업</div> <button class="ant-btn" id="btnAdd">추가</button></div>`;
                        } else {
                            e.cell.innerHTML = `<div class="v-center"><div>작업</div> <button class="ant-btn" id="btnAdd">취소</button></div>`;
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
                        case 'prdName':
                            let name = '<button id="btnLink" class="btnLink">'+item.prdName+'</button>';
                            e.cell.innerHTML = name+' '+document.getElementById('tplBtnViewMode').innerHTML;
                            e.cell['dataItem'] = item;
                            break;
                        case 'deliveryQuantity':
                        case 'genuine':
                        case 'equipment':
                        case 'disuse':
                            if(item.example == '회송'){
                                e.cell.innerHTML = item[col.binding];
                            } else {
                                e.cell.innerHTML = '<input class="ant-input" name ="'+item[col.binding]+'"'+'id="'+col.binding+'"'+'value="'+item[col.binding]+'"/>';
                            }
                            e.cell['dataItem'] = item;
                            break;
                        case 'work':
                            if(item.example != '회송'){
                                e.cell.innerHTML = '<button id="btnDataAdd" class="btnText blueTxt">추가</button>';
                            }
                            break;
                    }
                } else {
                    switch (col.binding) {
                        case 'prdName':
                            let name = '<button id="btnLink" class="btnLink">'+item.prdName+'</button>';
                            e.cell.innerHTML = name+' '+document.getElementById('tplBtnViewMode').innerHTML;
                            e.cell['dataItem'] = item;
                            break;
                        case 'deliveryQuantity':
                        case 'genuine':
                        case 'equipment':
                        case 'disuse':
                            if(item.example == '회송'){
                                e.cell.innerHTML = item[col.binding];
                            } else {
                                e.cell.innerHTML = '<input class="ant-input" name ="'+item[col.binding]+'"'+'id="'+col.binding+'"'+'value="'+item[col.binding]+'"/>';
                            }
                            e.cell['dataItem'] = item;
                            break;
                        case 'work':
                            if(item.example != '회송'){
                                e.cell.innerHTML = '<button id="btnEdit" class="btnText blueTxt">수정</button><button id="btnDel" class="btnText redTxt">삭제</button>';
                            }
                            break;
                    }
                }
                
            }
        });


        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                switch(e.target.id){
                    case 'btnModify':
                        modalOpen();
                        break;
                    case 'btnAdd':
                        rowAdd(state.addBtn);
                        break;
                }
            }
            if(e.target instanceof HTMLInputElement) {
                
            }
        });
    };

    const [modalRateModify, setModalRateModify] = useState(false);
    const modalOpen = () => setModalRateModify(true);
    const modalClose = () => setModalRateModify(false);

    //추가 버튼 
    const rowAdd=(e)=>{
        console.log(e == true);
        if(e === true){ //행추가일때
            state.addCnt = state.addCnt-1;
            state.currentEditItem = {
                id: state.addCnt,
                chk: '',
                prdName: '',
                prdCode: '',
                isbn: '',
                deliveryQuantity: '',
                sum: '',
                genuine: '',
                equipment: '',
                disuse: '',
                price: '',
                supplyRate: '',
                supplyUnit: '',
                supplyPrice: '',
                work: '',
            };
            let view = new CollectionView(state.list);
            view.sourceCollection.splice(0 ,0,state.currentEditItem); //값 삽입
            state.grid.collectionView.refresh(state.currentEditItem); // 삽입된 값 그리드에 반영         
            state.addBtn = false;
        }else{ //행추가를 취소할때
            state.addCnt = state.addCnt+1;
            state.grid.collectionView.remove(state.currentEditItem);
            state.addBtn = true;
        }
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
                state.flex.collectionView.remove(state.currentEditItem);
                state.addBtn = true;
            }
            state.currentEditItem = null;
            state.flex.invalidate();
            state.flex.collectionView.refresh();
        }
    }

    return(
        <>
            <FlexGrid
                itemsSource={state.list}
                initialized={(s) => initGrid(s)}
                style={{maxHeight: '500px'}}
                isReadOnly={true}
                selectionMode="None"
                allowMerging="ColumnHeaders"
                headersVisibility="Column"
                allowSorting={false}    
                allowDragging="Both"
                autoRowHeights={true}
                newRowAtTop={true}
                allowAddNew={true}
            >
                <FlexGridColumn binding="chk" header=" " width={50} align="center" cssClass="chk" />
                <FlexGridColumn binding="prdName" header="상품명(내부)" width="*" minWidth={150} />
                <FlexGridColumn binding="prdCode" header="상품 코드" width={90} />
                <FlexGridColumn binding="isbn" header="ISBN" width={90} />
                <FlexGridColumn binding="deliveryQuantity" header="배본\n수량" width={80} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="sum" header="합계" width={70} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="genuine" header="정품" width={70} align="right"aggregate="Sum"/>
                <FlexGridColumn binding="equipment" header="비품" width={70} align="right"aggregate="Sum"/>
                <FlexGridColumn binding="disuse" header="폐기대기" width={85} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="price" header="정가" width={80} align="right" />
                <FlexGridColumn binding="supplyRate" header="공급률" width={70} align="right" />
                <FlexGridColumn binding="supplyUnit" header="공급 단가" width={90} align="right" />
                <FlexGridColumn binding="supplyPrice" header="공급 금액" width={90} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="work" header="작업" width={100} align="center" />
            </FlexGrid>
            <div id="tplBtnViewMode">
                <div className="btnLayoutWrap">
                    <button id="btnNew" className="btn-layout ant-btn ant-btn-circle">N</button>
                </div>
            </div>

            <Modal 
                title={"공급률 수정" } 
                visible={modalRateModify} 
                onCancel={(e) => {modalClose('modify')}}
                footer={
                    <Button key="submit" type="primary" >일괄 적용</Button>
                    }
            >
                선택 건의 공급률을 <Input style={{width: '80px'}}/> %
            </Modal>
        </>
    );
});

export default index;