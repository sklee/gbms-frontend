import React, {useState} from 'react';
import {Button, Row, Col, Modal } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import moment from 'moment';

import { FlexGrid, FlexGridColumn, FlexGridCellTemplate } from '@grapecity/wijmo.react.grid';
import { Form, Formik } from 'formik';
import { FormikContainer, FormikInput } from '@components/form/CustomInput'
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";

import { FlexGridDetail } from '@grapecity/wijmo.react.grid.detail';

import Excel from '@components/Common/Excel';


const index = observer((props) => {
    const [formikFieldDefault, setFormikFieldDefault] = React.useState({
        company: '',
        movementDate : [moment(), moment()],
        product: '',
    });

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
            },
        ],
        idx: 0,
        selector:'',
        flex: null,

        //페이징
        total: 1,
        pageArr: {
            pageCnt: 30, //리스트 총 갯수
            page: 1, //현재페이지
        },
        gridFilter: null,
        currentEditItem: null,
    }));

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
                        case 'work':
                            e.cell.innerHTML = '<button id="btnModify" class="btnText blueTxt" type="button">수정</button>';
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
                        showModal();
                        break;
                    case 'btnRowDel':
                        cancelEdit();
                        break;
                    case 'btnModify':
                        editItem(item);
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

    const showModal = () => {
        Modal.info({
            title: "라임북과 연관된 내용이 수정되었습니다. 라임북에 수정 내용을 공유해 주세요.",
            onOk() {
                setGridVisible(false);
                commitEdit();
            }
        });
    };

    const [gridVisible, setGridVisible] = useState(false);


    return (
        <Formik
            enableReinitialize={true} 
            initialValues={formikFieldDefault}
            onSubmit = {(values) => {
                console.log(values)
            }}
        >
            {(props)=>(
                <Form>
                    <Row className='table'>
                        <FormikContainer type={'radio'} labelWidth={2} perRow={2.4} label={'회사'} name={'company'} required
                            data = {{
                                radioData : [{
                                    label : '전체', 
                                    value: 0
                                },{
                                    label : '도서출판 길벗', 
                                    value: 1
                                }, {
                                    label : '길벗스쿨',
                                    value : 2
                                }]
                            }}
                        />
                        <FormikContainer type={'datepicker'} labelWidth={2} perRow={3} label={'이동일'} name={'movementDate'} data={'range'} dateValue={formikFieldDefault.inquiryPeriod} />
                        <FormikContainer type={'input'} labelWidth={2} perRow={4} label={'상품'} name={'product'} />
                    </Row>

                    <Row justify='center' style={{margin: 30}}>
                        <Button type='primary submit' onClick={()=>{setGridVisible(true)}}>검색</Button>
                    </Row>

                    {gridVisible && (
                        <>
                            <Row className='gridWrap'>
                                <FlexGrid
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
                                            <div className='codeProcessDiv'>- 수정자: 홍길동2</div>
                                            <div className='codeProcessDiv'>- 수정일시: 2023-09-20 13:30</div>
                                        </React.Fragment>)}/>
                                </FlexGrid>
                            </Row>

                            <Row className='table_bot'>
                                <Col xs={16} lg={16}>
                                    <div className='btn-group'>
                                        <span>행 개수 : {state.list.length}</span>
                                    </div>
                                </Col>
                                <Excel />
                            </Row>
                        </>

                    )}
                </Form>
            )}
        </Formik>
    )
})

export default index;