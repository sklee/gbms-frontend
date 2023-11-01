import React, { useEffect, useRef, useState } from 'react';
import { Row, Col } from 'antd';
import { observer, useLocalStore } from 'mobx-react';

import { FlexGrid, FlexGridColumn, FlexGridCellTemplate } from "@grapecity/wijmo.react.grid";
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import * as wjcGrid from '@grapecity/wijmo.grid';

import Drawer from '@pages/ProduceMgmt/orderPaper/paperbookTab';


const ObjectGrid = ({ gridHeight, selectRowType }) => {
    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                prdCode: 'GA123',
                prdName: '상품명 ',
                impression: '1쇄',
                orderQuantity: 3000,
                basics: '본책1',
                detailed: '표지',
                orderDate: '2023-10-20',
                attributionDate: '2023-11-20',
                price: 3000,
                supplyPrice: 3000000,
                vat: 300000,
                amount: 3300000,
                detailedProcess: '에폭시 판비',
                prdQuantity: 1,
                paperName: '동250g(한솔제지) 백색 S/W 939*636(횡)',
                paperQuantity: 568,
                officialPrice: 5000,
                discountRate: 48,
                printQuantity: 568,
                cmyk: 8,
                bookSize: '46배 변형판',
                pageTotal: 432,
                basePrice: '개',
                postprocessQuantity: 1.0,
                useYN: '있음',
                workQuantity: 1000,
            },
        ],
        grid: null,
        totalReturnMaterials: null,
    }));

    const [ drawerVisible, setDrawerVisible ] = useState(false);
    const drawerOpen = () => setDrawerVisible(true);
    const drawerClose = () => setDrawerVisible(false);

    const initGrid = (grid) => {
        state.grid = grid;

        grid.columnFooters.rows.push(new wjcGrid.GroupRow());

        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
                let col = s.columns[e.col];
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + "<br/>" + html.split('\\n')[1] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;

                switch (col.binding) {
                    case 'prdName':
                        let name = '<button type="button" id="btnLink" class="btnLink">'+item.prdName+'</button>';
                        e.cell.innerHTML = name+' '+document.getElementById('tplBtnViewMode').innerHTML;
                        e.cell['dataItem'] = item;
                        break;
                    case 'returnMaterials':
                    case 'processedQuantity':
                        if(item.returnMaterials !== item.processedQuantity){
                            e.cell.innerHTML = `<span class="redTxt fontBold">${item[col.binding]}</span>`
                        }
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                switch(e.target.id){
                    case 'btnLink' :
                        drawerOpen();
                        break;
                }
            }
        });
    };

    const theGrid = useRef();
    const theSearch = useRef();
    let gridFormat;

    useEffect(()=>{
        let Grid = theGrid.current.control;
        let search = theSearch.current.control;
        search.grid = Grid;
    },[]);

    (function gridTemplate(){
        switch(selectRowType){
            case 'PrePress':
                gridFormat = <>
                    <FlexGridColumn binding="detailedProcess" header="세부 공정" width={100} />
                    <FlexGridColumn binding="prdQuantity" header="제작\n수량" width={70} />
                </>;
                break;
            case '종이':
                gridFormat = <>
                    <FlexGridColumn binding="paperName" header="종이명" width="*" minWidth={150} />
                    <FlexGridColumn binding="paperQuantity" header="종이\n수량" width={80} />
                    <FlexGridColumn binding="officialPrice" header="고시가" width={80} />
                    <FlexGridColumn binding="discountRate" header="할인율" width={80} />
                </>;
                break;
            case '인쇄':
            case '인쇄판':
                gridFormat = <>
                    <FlexGridColumn binding="detailedProcess" header="세부 공정" width={100} />
                    <FlexGridColumn binding="paperName" header="종이명" width="*" minWidth={150} />
                    <FlexGridColumn binding="printQuantity" header="인쇄(판)\n수량" width={90} />
                    <FlexGridColumn binding="cmyk" header="도수" width={70} />
                </>;
                break;
            case '제본':
            case '제본 추가작업':
                gridFormat = <>
                    <FlexGridColumn binding="bookSize" header="판형" width={120} />
                    <FlexGridColumn binding="detailedProcess" header="세부 공정" width={120} />
                    <FlexGridColumn binding="pageTotal" header="쪽수 합계" width={100} />
                </>;
                break;
            case '후가공':
                gridFormat = <>
                    <FlexGridColumn binding="detailedProcess" header="세부 공정" width={150} />
                    <FlexGridColumn binding="basePrice" header="단가\n기준" width={80} />
                    <FlexGridColumn binding="postprocessQuantity" header="후가공\n수량" width={80} />
                </>;
                break;
            case '포장':
                gridFormat = <>
                    <FlexGridColumn binding="detailedProcess" header="세부 공정" width={150} />
                    <FlexGridColumn binding="basePrice" header="단가\n기준" width={70} />
                    <FlexGridColumn binding="useYN" header="집책\n여부" width={80} />
                    <FlexGridColumn binding="workQuantity" header="작업 수량" width={100} />
                </>;
                break;
            case '부속 제작':
                gridFormat = <>
                    <FlexGridColumn binding="detailedProcess" header="세부 공정" width={120} />
                    <FlexGridColumn binding="basePrice" header="단가\n기준" width={80} />
                    <FlexGridColumn binding="prdQuantity" header="제작\n수량" width={80} />
                </>;
                break;
            case '포장물품 제작':
                gridFormat = <FlexGridColumn binding="detailedProcess" header="세부 공정" width={120} />;
                break;
        }
    })()

    return (
        <>
            <Row className='table'>
                <Col className="label" span={24} style={{justifyContent: 'flex-start'}}>
                    <FlexGridSearch ref={theSearch} placeholder='검색'/>
                </Col>
                <Col span={24}>
                    <FlexGrid
                        ref={theGrid}
                        itemsSource={state.list}
                        initialized={(s) => initGrid(s)}
                        headersVisibility="Column"
                        isReadOnly={true}
                        selectionMode="None"
                        autoRowHeights={true}
                        allowMerging="ColumnHeaders"
                        style={{ minHeight: `calc(100vh - ${gridHeight}px)`, maxHeight: `calc(100vh - ${gridHeight}px)` }}
                    >
                        <FlexGridColumn binding="prdCode" header="상품코드" width={100} />
                        <FlexGridColumn binding="prdName" header="상품명" width="*" minWidth={120} />
                        <FlexGridColumn binding="impression" header="쇄" width={70} />
                        <FlexGridColumn binding="orderQuantity" header="발주\n수량" width={80} aggregate="Sum"/>
                        <FlexGridColumn binding="basics" header="기본 구성" width={90} />
                        <FlexGridColumn binding="detailed" header="세부 구성" width={90} />
                        <FlexGridColumn binding="orderDate" header="발주일" width={100} />
                        <FlexGridColumn binding="attributionDate" header="비용 귀속일" width={100} />
                        {gridFormat && gridFormat.props.children.map((item) => {
                            return item;
                        })}
                        <FlexGridColumn binding="price" header="단가" width={90} />
                        <FlexGridColumn binding="supplyPrice" header="공급가" width={90} aggregate="Sum"/>
                        <FlexGridColumn binding="vat" header="부가세" width={90} aggregate="Sum"/>
                        <FlexGridColumn binding="amount" header="합계" width={100} aggregate="Sum"/>
                    </FlexGrid>

                    <div id="tplBtnViewMode">
                        <div className="btnLayoutWrap">
                            <button id="btnNew" className="btn-layout ant-btn ant-btn-circle">N</button>
                        </div>
                    </div>
                </Col>
                <Drawer  visible={drawerVisible} addDrawerClose={drawerClose} tabKey={"tradeInfo"}/>
            </Row>
        </>
    );
}

export default ObjectGrid;