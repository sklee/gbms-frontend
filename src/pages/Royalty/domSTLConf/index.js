import React, { useCallback, useState } from 'react';
import {Button, Row, Col, Modal, Pagination, DatePicker} from 'antd';
import { ExclamationCircleOutlined} from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { Selector } from "@grapecity/wijmo.grid.selector";
import { CollectionView } from "@grapecity/wijmo";
import { GroupRow } from '@grapecity/wijmo.grid';
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjcGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';
import * as wjcCore from '@grapecity/wijmo';

import * as wjFilter from "@grapecity/wijmo.react.grid.filter";

import Excel from '@components/Common/Excel';

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
                company : '길벗',
                prdSort : '종이책',
                stlDate:  '2023년 07월 ~ 2023년 09월',
                chkStartDate:  '2023-10-02',
                chkEndDate: "2023-10-07",
                requester: "홍길동",
                status:'검토 요청',
                work: ''
            },{   
                id: 1,
                company : '스쿨',
                prdSort : '종이책',
                stlDate:  '2023년 07월 ~ 2023년 09월',
                chkStartDate:  '2023-10-02',
                chkEndDate: "2023-10-07",
                requester: "홍길동2",
                status: '검토 완료',
                work: ''
            },
        ],
        idx: 0,
        selector:'',
        flex: null,
        //페이징
        total: 2,
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },

        detailList: [
            {
                id: 1,
                copyrighter: '(주)길벗알앤디',
                prdCode: 'GA123',
                prdName: '2023 시나공 컴퓨터활용능력',
                addData:[],
                listPrice: 15000,
                salesUpTo: 5200,
                generalSales: 200, 
                specialSales: 50,              
                totalSales: 250,
                responsiblePerson:'홍길동',
                request:'절판 후 폐기 예정',
            }, {
                id: 2,
                copyrighter: '(주)길벗알앤디',
                prdCode: 'GA123',
                prdName: '엑셀2010백과사전',
                addData:[{
                    addPrdCode:'GA123',
                    inPrdName:'엑셀2010백과사전(교판용)',
                    price:38000,
                    salesUpTo:1000,
                    generalSales: 100, 
                    specialSales: 50,
                    totalSales: 150,
                    currentSales: 1150, 
                }],
                listPrice: 38000,
                salesUpTo: 8000,
                generalSales: 100, 
                specialSales: 50,
                totalSales: 150,
                responsiblePerson:'홍길동',
                request:'선불 저작권료 반영 안됨',
            },
        ],
        grid: null,
        selectRows: [],
        sumflex:null,
        sumData:[{
            addPrdCode:'',
            inPrdName:'',
            price:'',
            salesUpTo:'',
            generalSales: '', 
            specialSales: '',
            totalSales: '',
            currentSales: '', 
        }],
        listLength:0,

        dptReviewList:[{
            dpt:'IT수험서1팀',
            date:'2023-10-02'
            }, {
            dpt:'IT수험서2팀',
            date:''
        }],
    }));


    const theGrid = React.useRef();


    const initGrid = (grid) => {
        state.flex= grid;
        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                var html = e.cell.innerHTML;
                switch (col.binding) {
                    case 'completeDept':
                    case 'reviewDept':
                        e.cell.innerHTML = '<button id="btnReviewModal" class="btnText btnLine" type="button">'+html+'</button>';
                        e.cell['dataItem'] = item;
                        break;
                    case 'work':
                        e.cell.innerHTML = '<button id="btnDetailView" class="btnText blueTxt" type="button">검토/보기</button>';
                        e.cell['dataItem'] = item;
                        break;
                }
            }
        });
        grid.addEventListener(grid.hostElement, 'click', (e) => {
            let item = wjCore.closest(e.target, '.wj-cell')?.['dataItem'];
            if (e.target instanceof HTMLButtonElement) {
                switch(e.target.id){
                    case 'btnDetailView':
                        grid.selectionMode = wjcCore.asEnum(3,item.id);
                        detailGrid();
                        break;
                    case 'btnReviewModal':
                        reviewModal()
                        break;
                }
            }
        });
    }

    const [gridVisible, setGridVisible] = useState(false);
    // 그리드 노출
    const detailGrid = () => {
        setGridVisible(true);
    }
    const closeDetailGrid = () => {
        setGridVisible(false);
    }
    const [dptReviewModalOpen, setDptReviewModalOpen] = useState(false);
    const reviewModal = () => {
        setDptReviewModalOpen(true);
    }
    const dptReviewHandleCancel = () => {
        setDptReviewModalOpen(false);
    };

    const [sumModalOpen, setSumModalOpen] = useState(false);
    state.listLength = state.list.length;

    const grouping = useCallback(async () => {
        state.detailList = new wjcCore.CollectionView(state.detailList, {
            sortDescriptions: ["copyrighter"],
            groupDescriptions: ["copyrighter"],
        });
    }, []);

    const initDetailGrid = (grid) => {
        state.grid = grid;
        grid.columnFooters.rows.push(new wjcGrid.GroupRow());
        grid.formatItem.addHandler(function (s, e) {
            const row = e.panel.rows[e.row];
            let html = e.cell.innerHTML;
            let col = s.columns[e.col];
            let item = s.rows[e.row].dataItem;
            
            if (e.panel == s.columnHeaders) {
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + ' ' + html.split('\\n')[1] + "<br/>" + html.split('\\n')[2] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    row = e.panel.rows[e.row],
                    r=s.rows[e.row],
                    group = r instanceof GroupRow ? item : null, negative = false;

                if(group){
                    var firstCellElement = e.panel.getCellElement(0, 0);
                    if(firstCellElement){
                        var cont = firstCellElement.innerHTML;
                    };
                    if(!cont)cont = html;
                    switch (col.binding) {
                        case 'copyrighter':
                        case 'department':
                        case 'prdCode':
                        case 'prdName':
                            e.cell.innerHTML = cont;
                            break;
                        case 'responsiblePerson':
                            e.cell.innerHTML = html;
                            break;
                        case 'request':
                            e.cell.innerHTML = '<input class="ant-input" name ="" value="" />';
                            break;
                    }
                }else{
                    switch (col.binding) {
                        case 'prdName':
                            if(row._data.addData[0]){
                                e.cell.innerHTML = '<button type="button" id="btnModalSum" class="btnText blueTxt btn_modalSum">합산</button> '+html;
                            }else{
                                e.cell.innerHTML = html;
                            }
                            e.cell['dataItem'] = item;
                            break;
                        case 'request':
                            e.cell.innerHTML = '<input class="ant-input" name ="'+item[col.binding]+'"'+'id="'+col.binding+'"'+'value="'+item[col.binding]+'" />';
                            break;
                    }
                }
               
            }
            //하단 합계 그룹
            if (row instanceof wjcGrid.GroupRow) {
                let col = s.columns[e.col];
                if(row._level == -1){
                    if (e.col <3) {
                        e.cell.style.textAlign = 'center';
                        e.cell.textContent = '합계';
                    }
                    switch (col.binding) {
                        case 'responsiblePerson':
                        case 'request':
                            e.cell.innerHTML = '';
                            break;
                    }
                }
                
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
              let item = wjcCore.closest(e.target, '.wj-cell')['dataItem'];
              switch (e.target.id) {
                case 'btnModalSum':
                    showModalSum(item.addData);
                  break;
              }
            }
 
        });

        grouping();
        grid.mergeManager = new CustomMergeManager();
    };

    class CustomMergeManager extends wjGrid.MergeManager {
        getMergedRange(panel, r, c, clip = true) {
            if( r==0 && c<3 ){
                //그룹 및 푸터 머지
                if(panel.cellType==1 || panel.cellType==5){
                    var rng = new wjGrid.CellRange(r, c);
                    // 좌우 확장
                    for (var i = rng.col; i < 2; i++) {
                        rng.col2 = i + 1;
                    }
                    for (var i = rng.col; i > 0; i--) {
                        rng.col = i - 1;
                    }
                    return rng;
                }
            }
        }
    }
    
    const initSumGrid = (grid) => {
        state.sumflex = grid;
        grid.formatItem.addHandler(function (s, e) {
            let html = e.cell.innerHTML;
            if (e.panel == s.columnHeaders) {
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + ' ' + html.split('\\n')[1] + "<br/>" + html.split('\\n')[2] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }
            
        });
    };

    const showModalSum = (data) => {
        state.sumData = data;
        setSumModalOpen(true);
    };
    const sumHandleOk = () => {
        setSumModalOpen(false);
    };
    const sumHandleCancel = () => {
        setSumModalOpen(false);
    };

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["copyrighter", "department", "prdCode", "prdName", "listPrice", "salesUpTo", "generalSales", "specialSales", "totalSales", "currentSales","responsiblePerson","request"];
    };
    const initSumFilter = (filter) => {
        filter.filterColumns = ["addPrdCode", "inPrdName", "price", "salesUpTo", "generalSales", "specialSales", "totalSales","currentSales"];
    };

    return (
        <>

            <Row className='gridWrap'>
                <FlexGrid
                    ref={theGrid}
                    itemsSource={state.list} 
                    stickyHeaders={true} 
                    initialized={(s) => initGrid(s)}
                    autoRowHeights={true}
                    allowMerging="ColumnHeaders"
                    isReadOnly={true}
                    headersVisibility="Column"
                    selectionMode="None"
                >
                    <FlexGridColumn header='회사' binding='company' width={90} />
                    <FlexGridColumn header='상품 종류' binding='prdSort' width={120}/>
                    <FlexGridColumn header='정산 기간' binding='stlDate' width="*" minWidth={160} align='center' />
                    <FlexGridColumn header='검토 요청일' binding='chkStartDate' width={140} align='center' />
                    <FlexGridColumn header='검토 마감일' binding='chkEndDate' width={140} align='center'/>
                    <FlexGridColumn header='요청자' binding='requester' width={100} />
                    <FlexGridColumn header='상태' binding='status' width={100} align='center'/>
                    <FlexGridColumn header='작업' binding='work' width={130} align='center'/>
                </FlexGrid>
            </Row>

            {gridVisible && (
            <>
            <Row style={{marginTop:30}}>
                <FlexGrid
                    itemsSource={state.detailList}
                    initialized={(s) => initDetailGrid(s)}
                    selectionMode="None"
                    headersVisibility="Column"
                    allowMerging="ColumnHeaders"
                    autoRowHeights={true}
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                    <FlexGridColumn binding="copyrighter" header="저작권자" width={140} />
                    <FlexGridColumn binding="prdCode" header="상품코드" width={120} />
                    <FlexGridColumn binding="prdName" header="상품명" width="*" minWidth={170} />
                    <FlexGridColumn binding="listPrice" header="정가" width={100} align="right" />
                    <FlexGridColumn binding="salesUpTo" header="전기까지\n판매량" width={120} align="right" aggregate="Sum"/>
                    <FlexGridColumn binding="generalSales" header="판매량\n(일반)" width={120} align="right" aggregate="Sum"/>
                    <FlexGridColumn binding="specialSales" header="판매량\n(특판)" width={120} align="right" aggregate="Sum"/>
                    <FlexGridColumn binding="totalSales" header="판매량\n(합계)" width={120} align="right" aggregate="Sum"/>
                    <FlexGridColumn binding="responsiblePerson" header="담당자" width={100}  aggregate="Sum" />
                    <FlexGridColumn binding="request" header="검토 의견/요청사항" width={200}  aggregate="Sum" />
                </FlexGrid>

                <Row gutter={10} className="table table_bot">
                    <Col xs={24} lg={24} className="topTable_right">
                        <Button type='primary submit' >검토 완료</Button>
                        <Button type='button' style={{marginLeft: 10}} onClick={closeDetailGrid}>취소</Button>
                    </Col>
                </Row>
            </Row>
            </>
            )}

            <Modal title="합산 세부 내역" visible={sumModalOpen} onOk={sumHandleOk} onCancel={sumHandleCancel} width={1000} footer={null}>
                <FlexGrid
                    itemsSource={state.sumData}
                    initialized={(s) => initSumGrid(s)}
                    selectionMode="None"
                    headersVisibility="Column"
                    allowMerging="ColumnHeaders"
                    autoRowHeights={true}
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initSumFilter(s)} />
                    <FlexGridColumn binding="addPrdCode" header="상품코드" width={120} />
                    <FlexGridColumn binding="inPrdName" header="상품명" width="*" minWidth={120}  />
                    <FlexGridColumn binding="price" header="정가" width={90} />
                    <FlexGridColumn binding="salesUpTo" header="전기까지\n판매량" width={90} />
                    <FlexGridColumn binding="generalSales" header="판매량\n(일반)" width={90} />
                    <FlexGridColumn binding="specialSales" header="판매량\n(특판)" width={90} />
                    <FlexGridColumn binding="totalSales" header="판매량\n(합계)" width={90} />
                    <FlexGridColumn binding="currentSales" header="당기까지\n판매량" width={90} />
                </FlexGrid>
            </Modal>

            <Modal title="부서별 검토 현황" visible={dptReviewModalOpen} onCancel={dptReviewHandleCancel} footer={null}>
                <FlexGrid
                    itemsSource={state.dptReviewList}
                    selectionMode="None"
                    headersVisibility="Column"
                    autoRowHeights={true}
                >
                    <FlexGridColumn binding="dpt" header="부서" width="*" />
                    <FlexGridColumn binding="date" header="검토 완료일" width="*"  />
                    
                </FlexGrid>
            </Modal>
            
            
        </>
    )
})

export default index;