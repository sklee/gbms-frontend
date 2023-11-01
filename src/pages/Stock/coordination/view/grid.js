import React, { useState, useRef, useEffect } from 'react';
import { FlexGrid, FlexGridColumn, FlexGridCellTemplate } from "@grapecity/wijmo.react.grid";
import { Row, Col, Button, Upload, Space, Input, Select, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { CollectionView } from "@grapecity/wijmo";
import * as wjcGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';
import { observer, useLocalStore } from 'mobx-react';


const { Option } = Select;

const index = observer(( props ) =>{

    const state = useLocalStore(() => ({
        list: [
            {
                id: 0,
                prdCode: 'GB1234',
                prdName: '슈퍼파닉스 한글+쓰기 세트(전 5권)',
                price: 70000,
                sum: -5,
                fairQuality: -5,
                equipment: 0,
                disuse: 0,
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
                        case 'prdCode' :
                        case 'prdName' :
                        case 'fairQuality' :
                        case 'equipment' :
                        case 'disuse' :
                        case 'note' :
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item[col.binding]+'"'+'id="'+col.binding+'"'+'value="'+item[col.binding]+'"/>';
                            break;
                        case 'work':
                            e.cell.innerHTML = '<button id="btnDataAdd" class="btnText blueTxt">추가</button><button id="btnRowDel" class="btnText grayTxt">취소</button>';
                            break;
                    }
                } else {
                    switch (col.binding) {
                        case 'amount':
                            if(item.error){
                                e.cell.innerHTML = `<span class='redTxt fontBold'>${item.amount}</span>`
                            } else {
                                e.cell.innerHTML = `<span>${item.amount}</span>`
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
                if(e.target.id === 'amount'){
                    state.currentEditItem[e.target.id] = Number(e.target.value);
                } else {
                    state.currentEditItem[e.target.id] = e.target.value;
                }
                
            }

            if(e.target instanceof HTMLSelectElement) {
                switch(e.target.id){
                    case 'btnSel' :
                        if(e.target.value == '개별'){
                            rowAdd();
                        } else if(e.target.value == '파일') {
                            let uploadInput = document.querySelector('#uploadInput');
                            uploadInput.click();
                        }
                        e.target.value = '';
                        break;
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
            price: '',
            sum: '',
            fairQuality: '',
            equipment: '',
            disuse: '',
            note: '',
            work: '',
            addCode: '',
            modify: true,
            error: false,
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

    const [modalRateModify, setModalRateModify] = useState(false);
    const modalOpen = () => setModalRateModify(true);
    const modalClose = () => setModalRateModify(false);

    const [fileList, setFileList] = useState([]);

    const handleFileChange = (info) => {
        let fileList = [...info.fileList];
    
        // 파일 개수가 2개 이상인 경우, 최근에 업로드한 파일만 유지
        if (fileList.length > 1) {
            fileList = [fileList[fileList.length - 1]];
        }
    
        setFileList(fileList);
    };

    return(
        <>
            <FlexGrid
                itemsSource={state.list}
                initialized={(s) => initGrid(s)}
                style={{maxHeight: '500px', marginTop: 30}}
                headersVisibility="Column"
                selectionMode="None"
                autoRowHeights={true}
                allowSorting={false}
                isReadOnly={true}
            >
                <FlexGridColumn binding="prdCode" header="상품코드" width={100} />
                <FlexGridColumn binding="prdName" header="상품명(내부)" width="*" minWidth={120} />
                <FlexGridColumn binding="price" header="정가" width={90} align="right"/>
                <FlexGridColumn binding="sum" header="합계" width={80} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="fairQuality" header="정품" width={80} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="equipment" header="비품" width={80} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="disuse" header="폐기대기" width={80} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="note" header="비고" width="*" minWidth={120} />
                <FlexGridColumn binding="work" header="작업" width={100} align="center"/>
            </FlexGrid>

            <div id="tplBtnViewMode">
                <div className="btnLayoutWrap">
                    <button id="btnNew" className="btn-layout ant-btn ant-btn-circle">N</button>
                </div>
            </div>

            <div className='nonVisible'>
                <Upload 
                    id="uploadInput" 
                    fileList={fileList}
                    onChange={handleFileChange}
                    // beforeUpload={() => false} // 파일 자동 업로드 방지
                    beforeUpload={modalOpen}
                >
                    <Button>업로드</Button>
                </Upload>
            </div>

            <Modal 
                // title={"공급률 수정" }
                visible={modalRateModify} 
                onCancel={(e) => {modalClose('modify')}}
                footer={
                    <Button key="submit" type="primary" >확인</Button>
                    }
            >
                등록한 파일에 오류가 있습니다.<br />
                확인 후 다시 등록해 주세요.<br />
                <br />
                - 선택한 회사 귀속이 아닌 상품 포함<br />
                - ‘세트 해체’ 선택 후 세트 아닌 상품 포함<br />
            </Modal>
        </>
    );
});

export default index;