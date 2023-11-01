import React from 'react';
import { Button, Row, Col, Modal, Pagination, DatePicker } from 'antd';
import { ExclamationCircleOutlined} from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';

import { FlexGrid, FlexGridColumn, FlexGridCellTemplate } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { CollectionView } from '@grapecity/wijmo';
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";

import { FlexGridDetail } from '@grapecity/wijmo.react.grid.detail';

import Excel from '@components/Common/Excel';



const index = observer((props) => {

    const state = useLocalStore(() => ({
        type : 'simulations',
        list: [
            {   
                id: 0,
                company : '스쿨',
                prdName: "전천당 1권",
                requestDate : '2023-09-17',
                movementDate:  '2023-09-18',
                sum: {
                    gb: 250,
                    lime: 300
                },
                fairQuality: {
                    gb: 100,
                    lime: 200
                },
                recycle: {
                    gb: 150,
                    lime: 100
                },
                cover: {
                    gb: 0,
                    lime: 0
                },
                work: '',
                progress: '이동 요청',
            },
            {   
                id: 1,
                company : '스쿨',
                prdName: "전천당 1권",
                requestDate : '2023-09-17',
                movementDate:  '2023-09-18',
                sum: {
                    gb: 250,
                    lime: 300
                },
                fairQuality: {
                    gb: 100,
                    lime: 200
                },
                recycle: {
                    gb: 150,
                    lime: 100
                },
                cover: {
                    gb: 0,
                    lime: 0
                },
                work: '',
                progress: '라임북 처리',
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

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = [ "company", "prdName", "requestDate", "movementDate", "sum.gb", "sum.lime", "fairQuality.gb", "fairQuality.lime", "recycle.gb", "recycle.lime", "cover.gb", "cover.lime", "work"];
    };

    const initGrid = (grid) => {
        state.flex= grid;

        let extraRow = new wjGrid.Row();
        extraRow.allowMerging = true;
        
        let panel = grid.columnHeaders;
        panel.rows.splice(0, 0, extraRow);

        // grid._eTLCt.allowMerging = true;
        // console.log(grid);

        for (let colIndex = 0; colIndex <= 12; colIndex++) {
            if(colIndex >= 4 && colIndex <= 5){
                panel.setCellData(0, colIndex, '합계');
            } else if(colIndex >= 6 && colIndex <= 7){
                panel.setCellData(0, colIndex, '정품대기');
            } else if(colIndex >= 8 && colIndex <= 9){
                panel.setCellData(0, colIndex, '재생대기');
            } else if(colIndex >= 10 && colIndex <= 11){
                panel.setCellData(0, colIndex, '표지대기');
            } else{
                let col = grid.getColumn(colIndex);
                col.allowMerging = true;
                panel.setCellData(0, colIndex, col.header);
            }            
        }

        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
                let col = s.columns[e.col];
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + '<br/>' + html.split('\\n')[1] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                if (item == state.currentEditItem) {
                    switch (col.binding) {
                        case 'fairQuality.lime':
                        case 'recycle.lime':
                        case 'cover.lime':
                            e.cell.innerHTML = `<input class="ant-input" name="${item[col.binding]}" id="${col.binding.split('.')[0]+item.id}" value="${item[col.binding.split('.')[0]]['lime']}"/>`;
                            e.cell['dataItem'] = state.currentEditItem;
                            break;
                        case 'work':
                            e.cell.innerHTML = '<button id="btnDataAdd" class="btnText blueTxt">확인</button><button id="btnRowDel" class="btnText grayTxt">취소</button>';
                            e.cell['dataItem'] = state.currentEditItem;
                            break;
                    }
                } else {
                    switch (col.binding) {
                        case 'sum.lime':
                        case 'fairQuality.lime':
                        case 'recycle.lime':
                        case 'cover.lime':
                            if (item[col.binding.split('.')[0]]['gb'] < item[col.binding.split('.')[0]]['lime']) {
                                e.cell.innerHTML = `<span class="redTxt">${item[col.binding.split('.')[0]]['lime']}</span>`
                            } else if (item[col.binding.split('.')[0]]['gb'] > item[col.binding.split('.')[0]]['lime']){
                                e.cell.innerHTML = `<span class="blueTxt">${item[col.binding.split('.')[0]]['lime']}</span>`
                            } else {
                                e.cell.innerHTML = item[col.binding.split('.')[0]]['lime'];
                            }
                            break;
                        case 'work':
                            if(item.progress === '이동 요청'){
                                e.cell.innerHTML = '<button id="btnModify" class="btnText blueTxt" type="button">수정</button><button id="btnDel" class="btnText redTxt" type="button">삭제</button>';
                            } else {
                                e.cell.innerHTML = '<button id="btnDecide" class="btnText blueTxt" type="button">확정</button><button id="btnDel" class="btnText redTxt" type="button">삭제</button>';
                            }
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

        grid.addEventListener(grid.hostElement, 'input', (e) => {
            let item = wjCore.closest(e.target, '.wj-cell')?.['dataItem'];
            const str = e.target.id.replace(new RegExp("[(0-9)]", "gi"), "");
            
            if(e.target instanceof HTMLInputElement) {
                if(str === 'fairQuality' || str === 'recycle' || str === 'cover'){
                    state.currentEditItem[str]['lime'] = Number(e.target.value);
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
        if(type === 'inquiry'){
            Modal.info({
                title: "새로 불러 올 라임북 반품 이동자료가 없습니다.",
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
                    <Button type='primary' style={{marginRight: 10}} onClick={()=>{showModal()}}>이동 결과 조회</Button>
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
                    <FlexGridCellTemplate cellType="TopLeft" template={(cell) => cell.col.allowMerging = true} />
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                    <FlexGridColumn header='회사' binding='company' width={70} />
                    <FlexGridColumn header='상품명(내부)' binding='prdName' width="*" minWidth={120} />
                    <FlexGridColumn header='요청일' binding='requestDate' width={100}/>
                    <FlexGridColumn header='이동일' binding='movementDate' width={100} />
                    <FlexGridColumn header='길벗' binding='sum.gb' width={80} align='right'/>
                    <FlexGridColumn header='라임북' binding='sum.lime' width={80} align='right'/>
                    <FlexGridColumn header='길벗' binding='fairQuality.gb' width={80} align='right'/>
                    <FlexGridColumn header='라임북' binding='fairQuality.lime' width={80} align='right'/>
                    <FlexGridColumn header='길벗' binding='recycle.gb' width={80} align='right'/>
                    <FlexGridColumn header='라임북' binding='recycle.lime' width={80} align='right'/>
                    <FlexGridColumn header='길벗' binding='cover.gb' width={80} align='right'/>
                    <FlexGridColumn header='라임북' binding='cover.lime' width={80} align='right'/>
                    <FlexGridColumn header='작업' binding='work' width={100} align='center'/>
                    <FlexGridDetail isAnimated template={ctx => 
                        (<React.Fragment>
                            <div className='codeProcessDiv'>- 요청자: 홍길동</div>
                            <div className='codeProcessDiv'>- 요청일시: 2023-09-17  15:30</div>
                            <div className='codeProcessDiv'>- 요청사항: 09/20에 대량 납품 예정</div>
                            <div className='codeProcessDiv'>- 물류 SCM 등록일시: 2023-09-18  18:20</div>
                            <div className='codeProcessDiv'>- 이동 결과 조회일시: 2023-09-19  10:10</div>
                            <div className='codeProcessDiv'>- 라임북 코멘트: 재고 오류로, 보유 수량 모두 처리함</div>
                            <div className='codeProcessDiv'>- 작업 파일: <Button>반품 이동_2023-09-18_라임북.pdf</Button></div>
                        </React.Fragment>)}/>
                </FlexGrid>
            </Row>

            <Row gutter={10} className="table table_bot">
                <Col xs={16} lg={16}>
                    <div className="btn-group">
                        <Pagination defaultCurrent={1} defaultPageSize={state.pageArr.pageCnt} current={state.pageArr.page} total={state.total} showSizeChanger={false}/>
                        <span style={{marginLeft: 20}}>행 개수 : {state.list.length}</span>
                    </div>
                </Col>
                <Excel />
            </Row>
        </>
    )
})

export default index;