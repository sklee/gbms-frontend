import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Row, Col, Button, Modal } from 'antd';
import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import * as wjcGrid from '@grapecity/wijmo.grid';
import * as wjCore from '@grapecity/wijmo';
import { observer, useLocalStore, inject } from 'mobx-react';

import AddDrawer from './add'
import ViewDrawer from './view'
import ObjectList from './objectList'
import moment from 'moment';
const { confirm } = Modal;


// inject commstore 주입, FileUploadTest 의존성 형성
//위 코드에서 inject('commonStore')로 commonStore를 주입하고,
//observer로 컴포넌트를 관찰 가능하게 만들었습니다.이제 commonStore의 함수와 상태에 접근할 수 있어야 합니다.
//반드시 컴포넌트가 렌더링 될 때 commonStore를 주입해야 합니다.
//이렇게 하면 commonStore에 정의된 함수 및 상태에 접근할 수 있게 됩니다.
const index = inject('commonStore')(observer(({ gridHeight, commonStore, formikFieldDefault }) => {

    const [addVisible, setAddVisible] = useState(false);
    const addDrawerOpen = () => setAddVisible(true);
    const addDrawerClose = () => setAddVisible(false);
    const [viewVisible, setViewVisible] = useState(false);
    const viewDrawerOpen = () => setViewVisible(true);
    const viewDrawerClose = () => setViewVisible(false);
    const [searchData, setSearchData] = useState([]); 
    const [detailData, setDetailData] = useState([]);
    const [selectedRowData, setSelectedRowData] = useState([]);
    const [detailId, setDetailId] = useState(null);

    const theGrid = useRef();
    const theSearch = useRef();

    const [detailGrid, setDetailGrid] = React.useState();
    const [source, setSource] = React.useState(new wjCore.CollectionView([], {}));

    const today = new Date();
    const year = today.getFullYear(); // 연도를 가져옵니다.
    const month = String(today.getMonth() + 1).padStart(2, '0'); // 월을 가져옵니다. (0부터 시작하므로 +1)
    const day = String(today.getDate()).padStart(2, '0'); // 일을 가져옵니다.

    const todayDate = `${year}-${month}-${day}`;

    React.useEffect(() => {
        if (theGrid.current && theGrid.current.control && theGrid.current.control.hostElement) {
                theGrid.current.control.hostElement.key = Math.random();
        }
    });

    const state = useLocalStore(() => ({
        data: [],
        grid: null,
        selectRows: [],
    })); 

    const dateArray = [formikFieldDefault.inquiryPeriod[0], formikFieldDefault.inquiryPeriod[1]]
    const formattedDates = dateArray.map(dateStr => moment(dateStr).format('YYYY-MM-DD'));    

    useEffect(() => {
        const shippingListData = async (conditions) => {
            commonStore.loading = true;
            const result = await commonStore.handleApi({
                method: 'GET',
                url: '/slip-out-sales',
                data: {
                    company: conditions.company || 'A',
                    status: conditions.progress || 1,
                    period: conditions.searchCriteria || 1,
                    // start_date: formattedDates[0] || todayDate,
                    // end_date: formattedDates[1] || todayDate,
                    start_date: '2023-07-01',
                    end_date: '2024-09-01',
                },
            });
            if (result) {
                // FlexGrid 인자값으로 전달 할 State(호환되는 Type: CollectionView, Array)
                setSource(new wjCore.CollectionView(result.data, {}))
                // console.log("result.data: ", result.data)
                // 화면 처음 랜더링 시 detailGrid FlexGrid를 초기화함
                if (result && result.data && result.data.length > 0) {
                    commonStore.updateShipSaleObjectList(result.data[0].details || []);
                } else {
                    console.log("No detial data found in the result.");
                    commonStore.updateShipSaleObjectList([]);
                }
                // commonStore.updateList(result.data[0].details || []);
            }
            commonStore.loading = false;
        };
        shippingListData(formikFieldDefault);
    }, [formikFieldDefault]);

    
    const initGrid = (s) => {
        state.grid = s;     
        
        if (source && source.sourceCollection && source.sourceCollection.length > 0
            && source.sourceCollection[0].dataArr) {
            setDetailGrid(source.sourceCollection[0].dataArr); // 초기 데이터셋
        }       
        
        s.selectionChanged.addHandler(function (s, e) {
            const rowIndex = e.row;
            const colIndex = e.col;

            // getCellData를 사용하여 셀의 데이터를 가져온다.
            // const cellData = s.getCellData(rowIndex, colIndex, true); 

            // 페이지 초기 진입 시 grid null 체크
            if (!s || !s.collectionView) return; 
            
            // 선택한 행의 데이터를 가져온다.
            const selectedRowData = s.collectionView.currentItem;
            setDetailGrid(selectedRowData);            

            // if (source !== null && source.sourceCollection !== null) {
                // var key = s.getCellData(rowIndex, colIndex);
                //console.log("key: ", key)
                // selectedRowData.forEach((item) => {
                //     if (item.id == key) {
                //         setDetailGrid(item.dataArr);
                //     }
                // });
            // }
        });

        s.columnFooters.rows.push(new wjcGrid.GroupRow());
        s.formatItem.addHandler(function (s, e) { // Grid 셋팅
            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
                let col = s.columns[e.col];
                switch(col.binding){
                    case 'chk':
                        e.cell.classList.add("headCenter")
                        break;
                    default:
                        if(html.split('\\n').length > 1){
                            e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + "<br/>" + html.split('\\n')[1] + '</div>';
                        }else{
                            e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                        }
                }
            }
            if (e.panel === s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                switch (col.binding) {
                    case 'rowNumber':
                        e.cell.innerHTML = e.row + 1;  // 0-based index이므로 1을 더합니다.
                        break;
                    case 'select':
                        e.cell.innerHTML = `<input type="checkbox" ${item.select ? "checked" : ""} />`;
                        break;
                    case 'sales_account_name':
                        let name = '<button type="button" id="btnLink" class="btnLink">'+item.sales_account_name+'</button>';
                        e.cell.innerHTML = name+' '+document.getElementById('tplBtnViewMode').innerHTML;
                        e.cell['dataItem'] = item;
                        break;


                    // case 'sales_account_name':
                    //     let name = '<button id="btnLink" class="btnLink">' + item.connectionName + '</button>';
                    //     e.cell.innerHTML = name + ' ' + document.getElementById('tplBtnViewMode').innerHTML;
                    //     e.cell['dataItem'] = item;
                    //     break;
                    // case 'cnt':
                    //     e.cell.classList.add('cell_blue_bg');
                    //     e.cell.innerHTML = e.row + 1;
                    //     e.cell['dataItem'] = item;
                    //     break;
                    // case 'id':
                    //     if (item.progress === '주문') {
                    //         if (item.select) {
                    //             e.cell.innerHTML = '<input id="iptSelect" type="checkbox" name= "' + col.binding + item.id + '" value="' + item.select + '" checked/>';
                    //         } else {
                    //             if (state.selectRows[0]) {
                    //                 if (state.selectRows[0].connectionName === item.connectionName &&
                    //                     state.selectRows[0].orderSource === item.orderSource &&
                    //                     state.selectRows[0].fedCondition === item.fedCondition) {
                    //                     e.cell.innerHTML = '<input id="iptSelect" type="checkbox" name= "' + col.binding + item.id + '" value="' + item.select + '" />';
                    //                 } else {
                    //                     e.cell.innerHTML = '<input id="iptSelect" type="checkbox" name= "' + col.binding + item.id + '" value="' + item.select + '" disabled />';
                    //                 }
                                    
                    //             } else {
                    //                 e.cell.innerHTML = '<input id="iptSelect" type="checkbox" name= "' + col.binding + item.id + '" value="' + item.select + '" />';
                    //             }
                    //         }
                    //     }
                    //     e.cell['dataItem'] = item;
                    //     break;
                }
            }
        });
        
        s.addEventListener(s.hostElement, 'click', (e) => {

            if (e.target instanceof HTMLButtonElement) {
                switch(e.target.id){
                    case 'btnLink' :
                        viewDrawerOpen();
                        break;
                }
            }
            if(e.target instanceof HTMLInputElement) {
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                switch(e.target.id){
                    case 'iptSelect':
                        break;
                }
            }
            //각 행을 클릭할 때 행을 선택 또는 선택 해제합니다.
            // let item = wjCore.closest(e.target, '.wj-row')['dataItem'];
            // let ht = grid.hitTest(e);
            // let row = ht.row;

            // if (row > -1) {
            //     let item = grid.rows[row].dataItem;                
            //     if (item) {                    
            //         setDetailId(item.id);
            //     }
            // }
            // if (item) {
            //     if (state.selectRows.includes(item)) {
            //         state.selectRows = state.selectRows.filter(selRow => selRow.id !== item.id);
            //     } else {
            //         state.selectRows.push(item);
            //     }
            //     state.grid.collectionView.refresh();
            // }
            // if (e.target instanceof HTMLButtonElement) {
            //     switch (e.target.id) {
            //         case 'btnLink':
            //             viewDrawerOpen();
            //             break;
            //     }
            // }
            // if (e.target instanceof HTMLInputElement) {
            //     let item3 = wjCore.closest(e.target, '.wj-cell')['dataItem'];
            //     switch (e.target.id) {
            //         case 'iptSelect':
            //             if (e.target.checked) {
            //                 state.selectRows = state.selectRows.concat(item);
            //             } else {
            //                 state.selectRows = state.selectRows.filter(selRow => selRow.id !== item.id);
            //             }
            //             item.select = e.target.checked;
            //             state.grid.collectionView.refresh();
            //             break;
            //     }
            // }
        });
    };

    const mergeHandler = () => {
        confirm({
            title: '선택한 출고를 합치면서 주문일은 오늘로, 주문 등록자는 본인으로 변경합니다.',
            onOk() {
                console.log('OK');
            },
            onCancel() {
                console.log('Cancel ');
            },
        });
    }

    const initFilter = (filter) => {
        // filter.filterColumns = ["slip_code", "company_name", "sales_account_code", "logistics_code", "sales_account_name", "sales_account_branch_name", "order_source_name", "order_type_name", "settlement_type_name", "warehouse_name", "order_quantity", "order_amount","status_name","order_date","ship_date","slip_note"];
        filter.filterColumns = ["slip_code", "company_name", "sales_account_code", "logistics_code", "sales_account_name"];
    };
    
    return (
        <Row className="table" style={{ height: '100%' }}>
            <Col className="label" span={24} style={{justifyContent: "space-between"}}>
                <FlexGridSearch
                    ref={theSearch}
                    placeholder='검색'
                    grid={theGrid.current ? theGrid.current.control : null}
                    quickFind={true}/>
                
                {state.selectRows[0] ? <Button type='primary' onClick={mergeHandler}>출고 병합</Button> : <Button className="btn btn-primary btn_add" shape="circle" onClick={addDrawerOpen}>+</Button>}
            </Col>
            <Col span={24} style={{ height: 'calc(100% - 53px)', paddingBottom: 0 }} >
                <div className='scroll-box'>
                    <FlexGrid
                        className="scroll"
                        ref={theGrid}
                        itemsSource={source}
                        initialized={(s) => initGrid(s)}
                        isReadOnly={true}
                        headersVisibility="Column"
                        selectionMode="Row"
                        style={{ minHeight: `calc(100vh - ${gridHeight}px)`, maxHeight: `calc(100vh - ${gridHeight}px)` }}
                    >
                        <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                        <FlexGridColumn binding="rowNumber" header="순번" width={50} align="center" cssClass="rowNumber" />
                        <FlexGridColumn binding="id" width={50} align="center" cssClass="id" visible={false}/>
                        <FlexGridColumn binding="select" header="선택" width={50} align="center" cssClass="select" />
                        <FlexGridColumn binding="slip_code" header="전표 코드" width={90} align="center" cssClass="slip_code" />
                        <FlexGridColumn binding="company_name" header="회사" width={100} align="center" cssClass="company_name" />
                        <FlexGridColumn binding="sales_account_code" header="거래처 코드" width={90} align="center" cssClass="sales_account_code" />
                        <FlexGridColumn binding="logistics_code" header="물류 코드" width={90} align="center" cssClass="logistics_code" />
                        <FlexGridColumn binding="sales_account_name" header="거래처명" width={100} align="center" cssClass="sales_account_name" />
                        <FlexGridColumn binding="sales_account_branch_name" header="거래처 지점명" width={100} align="center" cssClass="sales_account_name" />
                        <FlexGridColumn binding="order_source_name" header="주문 출처" width={100} align="center" cssClass="sales_account_name" />
                        <FlexGridColumn binding="order_type_name" header="주문유형" width={100} align="center" cssClass="sales_account_name" />
                        <FlexGridColumn binding="settlement_type_name" header="결제유형" width={100} align="center" cssClass="sales_account_name" />
                        <FlexGridColumn binding="warehouse_name" header="창고명" width={100} align="center" cssClass="sales_account_name" />
                        <FlexGridColumn binding="order_quantity" header="주문수량" width={100} align="center" cssClass="sales_account_name" />
                        <FlexGridColumn binding="order_amount" header="주문금액" width={100} align="center" cssClass="sales_account_name" />
                        <FlexGridColumn binding="status_name" header="진행 상태" width={100} align="center" cssClass="sales_account_name" />
                        <FlexGridColumn binding="order_date" header="주문 등록일" width={100} align="center" cssClass="sales_account_name" />
                        <FlexGridColumn binding="ship_date" header="출고 요청일" width={100} align="center" cssClass="sales_account_name" />
                        <FlexGridColumn binding="slip_note" header="전표비고" width={100} align="center" cssClass="sales_account_name" />
                    </FlexGrid>
                </div>
                <div id="tplBtnViewMode"> 
                    <div className="btnLayoutWrap">
                        <button id="btnNew" className="btn-layout ant-btn ant-btn-circle">N</button>
                    </div>
                </div>
            </Col>            
            {addVisible && <AddDrawer drawerVisible={addVisible} drawerClose={addDrawerClose} />}
            {detailGrid && <ObjectList selectedRowData={detailGrid} />}
            {viewVisible && <ViewDrawer drawerVisible={viewVisible} drawerClose={viewDrawerClose} rowId={detailGrid.id} companyName={detailGrid.company_name} />}
        </Row>
    );
}));

export default index;