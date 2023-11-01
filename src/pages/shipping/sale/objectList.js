import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Button } from 'antd';
import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import { FlexGridFilter } from '@grapecity/wijmo.react.grid.filter';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { CollectionView } from '@grapecity/wijmo';
import * as wjCore from '@grapecity/wijmo';
import * as wijmo from '@grapecity/wijmo';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import { observer, useLocalStore, inject } from 'mobx-react';


const index = inject('commonStore')(observer(({ gridHeight, commonStore, selectedRowData }) => {
    
    const state = useLocalStore(() => ({
        list: [
            // {
            //     id: 2,
            //     cnt: '',
            //     select: '',
            //     company: '길벗',
            //     AccountCode: 'SADC230010',
            //     logisticsCode: '110-510',
            //     connectionName: '영풍문고',
            //     orderClassification: '서점 SCM',
            //     fedCondition: '위탁',
            //     amount: 20,
            //     supplyPrice: 180000,
            //     average: 75,
            //     forwardingStatus: '출고 요청',
            //     registrationDate: '2023.06.01',
            //     requestDate: '2023.06.01',
            //     forwardingDate: '',
            // },
            // {
            //     id: 1,
            //     cnt: '',
            //     select: '',
            //     company: '스쿨',
            //     AccountCode: 'SADC220010',
            //     logisticsCode: '090-923',
            //     connectionName: '디엠도서유통',
            //     orderClassification: '주문 SCM',
            //     fedCondition: '납품',
            //     amount: 1,
            //     supplyPrice: 13200,
            //     average: 60,
            //     forwardingStatus: '주문 등록',
            //     registrationDate: '2023.06.01',
            //     requestDate: '',
            //     forwardingDate: '',
            // },
                ],
        grid: null,
    }));

     useEffect(() => {
        // Update list in commonStore when selectedRowData changes
        if (selectedRowData) {
        commonStore.updateShipSaleObjectList(selectedRowData.details);
        } else {
            // 초기 렌더링 시 selectedRowData가 없을 때 빈 데이터 또는 기본 데이터로 설정
            commonStore.updateShipSaleObjectList([]); // 빈 데이터 또는 기본 데이터로 설정
        }
    }, [commonStore, selectedRowData]);

    const initGrid = (grid) => {
        state.grid = grid;

        grid.formatItem.addHandler(function (s, e) {
            
            // if (e.panel == s.columnHeaders) {
            //     var html = e.cell.innerHTML;
            //     if(html.split('\\n').length > 1){
            //         e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + ' ' + html.split('\\n')[1] + "<br/>" + html.split('\\n')[2] + '</div>';
            //     }else{
            //         e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
            //     }
            // }
            // if (e.panel == s.cells) {
            //     let col = s.columns[e.col],
            //         item = s.rows[e.row].dataItem;
            //     switch (col.binding) {
            //         case 'status':
            //             e.cell.innerHTML = '<button id="btnDel" class="btnText redTxt">삭제</button>';
            //             e.cell['dataItem'] = item;
            //             break;
            //     }
            // }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];

                switch(e.target.id){
                }
            }
        });
    };

    const [dataList, setDataList] = useState({
        data: null,
        itemCount: null,
    });

    let view = new CollectionView(state.list, {
        collectionChanged: (s)=>{
            // console.log(s._view, s.totalItemCount);
            // setDataList((prev) => ({
            //     ...prev,
            //     data: s._view, 
            //     itemCount: s.totalItemCount
            // }));
        }
    });

    // console.log(view);

    const [searchText, setSearchText] = useState('');

    const theGrid = useRef();
    const theSearch = useRef();

    // console.log(theGrid.current, theSearch.current);

    useEffect(()=>{
        
    },[]);

    const handleSearch = (event) => {
        event.inputElement.addEventListener('keyup',function(e){
            setSearchText(e.target.value);
        })
    };
    
    return(
        <Row className="table">
            <Col className="label" span={24} style={{justifyContent: "space-between"}}>
                <FlexGridSearch
                    ref={theSearch}
                    placeholder='검색'
                    grid={theGrid.current ? theGrid.current.control : null}
                    quickFind={true}
                    initialized={handleSearch} />
                <Button className="btn btn-primary btn_add" shape="circle" >+</Button>
            </Col>
            <Col span={24}>
                <FlexGrid
                    ref={theGrid}
                    itemsSource={commonStore.shipSaleObjectList}
                    initialized={(s) => initGrid(s)}
                    headersVisibility="Column"
                    isReadOnly={true}
                    style={{ minHeight: `calc(100vh - ${gridHeight}px)`, maxHeight: `calc(100vh - ${gridHeight}px)` }}
                >
                    {/* <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} /> */}
                    <FlexGridColumn binding="id" header="순번" width={80} />
                    <FlexGridColumn binding="product_name" header="상품명(내부)" width={80} />
                    <FlexGridColumn binding="product_code" header="상품 코드" width={80} />
                    <FlexGridColumn binding="isbn" header="ISBN" width={120} />
                    <FlexGridColumn binding="shipping_qty" header="출고 수량" width={150} />
                    <FlexGridColumn binding="logisticsCode" header="가용재고(정품)" width={100} />
                    <FlexGridColumn binding="fixed_price" header="정가" width="*" minWidth={120} />
                    <FlexGridColumn binding="rate" header="공급률" width={120} />
                    <FlexGridColumn binding="unit_price" header="공급 단가" width={80} align="right"/>
                    <FlexGridColumn binding="order_amount" header="공급 금액" width={120} />
                    {/* <FlexGridColumn binding="amount" header="수량" width={80} align="right"/>
                    <FlexGridColumn binding="forwardingStatus" header="출고 상태" width={120} />
                    <FlexGridColumn binding="registrationDate" header="주문 등록일" width={120} />
                    <FlexGridColumn binding="requestDate" header="출고 요청일" width={120} />
                    <FlexGridColumn binding="forwardingDate" header="출고일" width={80} /> */}
                </FlexGrid>
            </Col>
            
        </Row>
    );
}));

export default index;