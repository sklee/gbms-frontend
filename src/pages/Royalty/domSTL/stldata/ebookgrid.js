import React, {useCallback, useState} from 'react';
import { Row, Col, Modal, Button, Input } from 'antd';
import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import { format, SortDescription } from "@grapecity/wijmo";
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import * as wjcGrid from '@grapecity/wijmo.grid';
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjcCore from '@grapecity/wijmo';
import * as wjCore from '@grapecity/wijmo';
import { GroupRow } from '@grapecity/wijmo.grid';

import { observer, useLocalStore } from 'mobx-react';
import Excel from '@components/Common/Excel';

const EbookGrid = observer(( props ) =>{

    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                copyrighter: '(주)길벗알앤디',
                department: 'IT수험서1팀',
                prdCode: 'GA123',
                prdName: '2023 시나공 컴퓨터활용능력',
                addData:[],
                listPrice: 12000,
                generalSales: 0, 
                specialSales: 500000,              
                e8:0,
                e9:500000,
                e12:0,
                e13:'',
                e14:'',
                salesUpTo: '',
                totalSales: '',
                currentSales: '', 
                salesRevenue:'',
                publisherPayout:'',
                settlRatio:'',
                e17:'',
                e18:'',
                e19:'',
                e20:'',
                exception:'계좌 오류로 2023.01부터 미지급 중',
            }, {
                id: 2,
                copyrighter: '(주)길벗알앤디',
                department: 'IT수험서1팀',
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
                listPrice: 20000,
                generalSales: 1000000, 
                specialSales: 0,              
                e8:500000,
                e9:500000,
                e12:500000,
                e13:'',
                e14:'',
                salesUpTo: '',
                totalSales: '',
                currentSales: '', 
                salesRevenue:'',
                publisherPayout:'',
                settlRatio:'',
                e17:'',
                e18:'',
                e19:'',
                e20:'',
                exception:'계좌 오류로 2023.01부터 미지급 중',
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
        modifyData:null,
        listLength:0
    }));

    const [sumModalOpen, setSumModalOpen] = useState(false);
    const [exceptionModalOpen, setExceptionModalOpen] = useState(false);

    state.listLength = state.list.length;

    console.log(state.listLength);

    const grouping = useCallback(async () => {
        state.list = new wjcCore.CollectionView(state.list, {
            sortDescriptions: ["copyrighter"],
            groupDescriptions: ["copyrighter"],
        });
    }, []);

    const initGrid = (grid) => {
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
                        case 'listPrice':
                            e.cell.innerHTML = ''
                            break;
                        
                        case 'exception':
                            let dataTxt = group._items[0].exception;
                            e.cell.innerHTML = '<input class="ant-input" name ="" id="input_issue" value="'+dataTxt+'" readonly/>';
                            e.cell['dataItem'] = dataTxt;
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
                        case 'exception':
                            e.cell.innerHTML = ''
                            break;
                    }
                }
                
            }

            if (row instanceof wjcGrid.GroupRow) {
                let col = s.columns[e.col];
                if(row._level == -1){
                    if (e.col <4) {
                        e.cell.style.textAlign = 'center';
                        e.cell.textContent = '합계';
                    }
                    switch (col.binding) {
                        case 'listPrice':
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
            if (e.target instanceof HTMLInputElement) { 
                let item = wjcCore.closest(e.target, '.wj-cell')['dataItem'];
                switch (e.target.id) {
                    case 'input_issue':
                        modalOpen(item);
                        break;
                }    
            }    
        });

        grouping();
        grid.mergeManager = new CustomMergeManager();
    };

    class CustomMergeManager extends wjGrid.MergeManager {
        getMergedRange(panel, r, c, clip = true) {
            if( r==0 && c<4 ){
                //그룹 및 푸터 머지
                if(panel.cellType==1 || panel.cellType==5){
                    var rng = new wjGrid.CellRange(r, c);
                    // 좌우 확장
                    for (var i = rng.col; i < 3; i++) {
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

    const modalOpen = (dataTxt) => {
        console.log(dataTxt)
        state.modifyData = dataTxt;
        setExceptionModalOpen(true);
    }
    const exceptionHandleOk = () => {
        setExceptionModalOpen(false);
    };
    const exceptionHandleCancel = () => {
        setExceptionModalOpen(false);
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
        filter.filterColumns = ["copyrighter", "department", "prdCode", "prdName", "salesUpTo", "totalSales", "currentSales", "salesRevenue", "publisherPayout", "settlRatio", "e8", "e9","e12","e13","e14","e17","e18","e19","e20","exception"];
    };
    const initSumFilter = (filter) => {
        filter.filterColumns = ["addPrdCode", "inPrdName", "price", "salesUpTo", "generalSales", "specialSales", "totalSales","currentSales"];
    };



    return(
        <>
            <FlexGrid
                itemsSource={state.list}
                initialized={(s) => initGrid(s)}
                selectionMode="None"
                headersVisibility="Column"
                allowMerging="ColumnHeaders"
                autoRowHeights={true}
            >
                <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                <FlexGridColumn binding="copyrighter" header="저작권자" width={140} />
                <FlexGridColumn binding="department" header="부서" width={100} />
                <FlexGridColumn binding="prdCode" header="상품코드" width={100} />
                <FlexGridColumn binding="prdName" header="상품명" width={200} />
                <FlexGridColumn binding="listPrice" header="정가" width={120} align="right" aggregate="Sum" />
                <FlexGridColumn binding="e8" header="전기까지 발생\n정기 저작권료" width={120} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="e9" header="선불\n저작권료" width={120} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="e12" header="전기까지 지급\n정기 저작권료" width={120} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="e13" header="전기까지 지급\n전체 저작권료" width={120} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="e14" header="전기 미지급\n저작권료" width={100} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="salesUpTo" header="전기까지\n판매량" width={100} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="totalSales" header="판매량" width={100} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="currentSales" header="당기까지\n판매량" width={100} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="salesRevenue" header="매출액" width={100} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="publisherPayout" header="출판사\n정산액" width={100} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="settlRatio" header="정산 비율" width={100} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="e17" header="발생 정기\n저작권료" width={100} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="e18" header="지급 대상\n정기 저자권료" width={100} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="e19" header="당기까지 발생\n정기 저작권료" width={100} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="e20" header="지급 가능\n정기 저작권료" width={100} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="exception" header="저작권자 특이사항" width={180} align="right"  />
            </FlexGrid>

            <Row gutter={10} className="table table_bot">
                <Col xs={16} lg={16}>
                    <div className="btn-group">
                        <span>행 개수 : {state.listLength}</span>
                    </div>
                </Col>
                <Excel />
            </Row>

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

            <Modal title="저작권자 특이사항" visible={exceptionModalOpen} onOk={exceptionHandleOk} onCancel={exceptionHandleCancel} >
                <Input defaultValue={state.modifyData} />
            </Modal>
            
        </>
    );
});

export default EbookGrid;