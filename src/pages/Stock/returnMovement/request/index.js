import React, { useState } from 'react';
import {Button, Row, Col, Modal, Pagination, DatePicker} from 'antd';
import { ExclamationCircleOutlined} from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { Selector } from "@grapecity/wijmo.grid.selector";
import { CollectionView } from "@grapecity/wijmo";
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";

import Excel from '@components/Common/Excel';
import AddDrawer from './addDrawer';

const Wrapper = styled.div`
    width: 100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
    #tplBtnViewMode {
        display: none;
    }
`;

const index = observer((props) => {

    const state = useLocalStore(() => ({
        type : 'simulations',
        list: [
            {   
                id: 0,
                company : '스쿨',
                requestDate : '2023-09-20',
                registrant:  '홍길동',
                prdCode:  'GB1234',
                prdName: "전천당 1권",
                stock: "280/120",
                amount: 150,
                fairQuality: 100,
                recycle: 50,
                cover: 0,
                note: '최대한 빠르게 작업 바랍니다.',
                work: ''
            },
        ],
        idx: 0,
        selector:'',
        flex: null,

        //페이징
        total: 1,
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },
        gridFilter: null,
        currentEditItem: null,
        dateItemName: [{id: 1, name: '적용일'}],
    }));

    React.useEffect(() => {
        theSearch.current.control.grid = theGrid.current.control;
    }, [])

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    const [drawerVisible, setDrawerVisible] = useState(false);
    const drawerOpen = () => setDrawerVisible(true);
    const drawerClose = () => setDrawerVisible(false);

    const [selectorState, setSelectorState] = useState({
        view: new CollectionView(state.list),
        selectedItems: []
    });

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = [ "company", "requestDate", "registrant", "prdCode", "prdName", "stock", "amount", "fairQuality", "recycle", "cover", "note", "work"];
    };

    const initGrid = (grid) => {
        state.flex= grid;

        state.selector = new Selector(grid, {
            itemChecked: (s, e) => {
                setSelectorState({
                    selectedItems: grid.rows.filter(r => r.isSelected)
                });
            }
        });

        let extraRow = new wjGrid.Row();
        extraRow.allowMerging = true;
        
        let panel = grid.columnHeaders;
        panel.rows.splice(0, 0, extraRow);

        console.log(state.selector);
        state.selector._col.allowMerging = true;
        state.selector._col._cssClassAll = "chkAll";

        for (let colIndex = 0; colIndex <= 11; colIndex++) {
            if(colIndex >= 6 && colIndex <= 9){
                panel.setCellData(0, colIndex, '이동 요청 수량');
            }else{
                let col = grid.getColumn(colIndex);
                col.allowMerging = true;
                panel.setCellData(0, colIndex, col.header);
            }            
        }

        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.columnHeaders) {
                let html = e.cell.innerHTML;
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + ' ' + html.split('\\n')[1] + "<br/>" + html.split('\\n')[2] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;

                if (item == state.currentEditItem) {
                    switch (col.binding) {
                        case 'fairQuality':
                        case 'recycle':
                        case 'cover':
                        case 'note':
                            e.cell.innerHTML = `<input class="ant-input" name="${item[col.binding]}" id="${col.binding}" value="${item[col.binding]}"/>`;
                            break;
                            e.cell['dataItem'] = state.currentEditItem;
                        case 'work':
                            e.cell.innerHTML = '<button id="btnDataAdd" class="btnText blueTxt">확인</button><button id="btnRowDel" class="btnText grayTxt">취소</button>';
                            e.cell['dataItem'] = state.currentEditItem;
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
                        showModal('delete', item.id);
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'change', (e) => {
            if(e.target instanceof HTMLInputElement) {
                if(e.target.id === 'fairQuality' || e.target.id === 'recycle' || e.target.id === 'cover'){
                    state.currentEditItem[e.target.id] = Number(e.target.value);
                } else {
                    state.currentEditItem[e.target.id] = e.target.value;
                }
                
            }
        });
    }

    // 삭제 버튼
    const rowDel=(rowId)=>{
        state.list = state.list.filter( row => row.id != rowId);
    }

    // 수정 버튼 
    const editItem = (item) => {
        state.currentEditItem = item;
        state.flex.invalidate()
        state.flex.collectionView.refresh();
    }

    // 확인 버튼
    const commitEdit=(idx)=> {
        state.currentEditItem = null;
        state.flex.invalidate();
        state.flex.collectionView.refresh();
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
            state.currentEditItem.addCode = false;
            state.currentEditItem = null;
            state.flex.invalidate();
            state.flex.collectionView.refresh();
        }
    }

    const showModal = (type, rowId) => {
        if(type === 'request'){
            Modal.info({
                title: "라임북에 반품 이동을 요청했습니다. 현황은 ‘이동 현황/확정' 탭에서 확인할 수 있습니다.",
                onOk() {
                    console.log('OK');
                }
            });
        } else {
            Modal.info({
                title: "삭제하면 되돌릴 수 없습니다. 계속하시겠습니까?",
                onOk() {
                    rowDel(rowId);
                }
            });
        }
        
    };

    return (
        <>
            <Row className="topTableInfo" >
                <Col span={20}>
                    <wjInput.ComboBox
                        itemsSource={new CollectionView(state.dateItemName, {
                            currentItem: null
                        })}
                        selectedValuePath="id"
                        displayMemberPath="name"
                        valueMemberPath="id"
                        placeholder="항목"
                        style={{width: 120}}
                    />
                    <DatePicker.RangePicker 
                        style={{ margin: '0 20px 0 5px'}}
                    />
                    <FlexGridSearch ref={theSearch} placeholder='검색' />
                </Col>
                <Col span={4} className="topTable_right">
                    {selectorState.selectedItems.length >= 1 ? <Button type='button' style={{marginRight: 10}} onClick={()=>{showModal('request')}}>이동 요청</Button> : <Button className="btn btn-primary btn_add" shape="circle" onClick={drawerOpen}>+</Button>}
                </Col>
            </Row>
            <Row className='gridWrap'>
                <FlexGrid
                    ref={theGrid}
                    itemsSource={state.list} 
                    stickyHeaders={true} 
                    initialized={(s) => initGrid(s)}
                    autoRowHeights={true}
                    allowMerging="ColumnHeaders"
                    isReadOnly={true}
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                    <FlexGridColumn header='회사' binding='company' width={70} />
                    <FlexGridColumn header='등록일' binding='requestDate' width={100}/>
                    <FlexGridColumn header='등록자' binding='registrant' width={80} />
                    <FlexGridColumn header='상품코드' binding='prdCode' width={100} />
                    <FlexGridColumn header='상품명(내부)' binding='prdName' width="*" minWidth={120} />
                    <FlexGridColumn header='정품 재고\n(등록 시/현재)' binding='stock' width={110} align='right'/>
                    <FlexGridColumn header='합계' binding='amount' width={70} align='right'/>
                    <FlexGridColumn header='정품대기' binding='fairQuality' width={70} align='right'/>
                    <FlexGridColumn header='재생대기' binding='recycle' width={70} align='right'/>
                    <FlexGridColumn header='표지대기' binding='cover' width={70} align='right'/>
                    <FlexGridColumn header='비고' binding='note' width={120} />
                    <FlexGridColumn header='작업' binding='work' width={100} align='center'/>
                </FlexGrid>
            </Row>

            <Row gutter={10} className="table table_bot">
                <Col xs={16} lg={16}>
                    <div className="btn-group">
                        <Pagination defaultCurrent={1} defaultPageSize={state.pageArr.pageCnt} current={state.pageArr.page} total={state.total} showSizeChanger={false}/>
                        <span style={{marginLeft: 20}}>행 개수 : {state.total}</span>
                    </div>
                </Col>
                <Excel />
            </Row>

            <AddDrawer drawerVisible={drawerVisible} drawerClose={drawerClose} />
        </>
    )
})

export default index;