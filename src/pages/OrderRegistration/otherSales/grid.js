import React from 'react';
import { Row, Col, Button, Modal } from 'antd';
import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import * as wjcGrid from '@grapecity/wijmo.grid';
import * as wjGrid from '@grapecity/wijmo.grid';
import { observer, useLocalStore } from 'mobx-react';


const Index = observer(( {account} ) =>{
    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                code: 'KPC1000132592',
                isbn: '9791164062768',
                prdname: '한 권으로 끝내는 종이접기(개정판)',
                price: 10240,
                confirmedPrice: 10240,
                sellingPrice: 7168,
                salesVolume: 3,
                sales: 21504,
                adjustedAmount: 19893,
                store: '교보문고',
            },
            {
                id: 2,
                code: 'KPC1000134960',
                isbn: '',
                prdname: '',
                price: 9600,
                confirmedPrice: 9800,
                sellingPrice: 6720,
                salesVolume: 4,
                sales: 26880,
                adjustedAmount: 24830,
                store: '',
            },
        ],
        grid: null,
        selectRows: [],
        orangeCell: false,
    }));

    const initGrid = (grid) => {
        state.grid = grid;

        grid.columnFooters.rows.push(new wjcGrid.GroupRow());

        grid.formatItem.addHandler(function (s, e) {
            const row = e.panel.rows[e.row];
            let html = e.cell.innerHTML;
            let col = s.columns[e.col];
            let item = s.rows[e.row]?.dataItem;

            if (e.panel == s.columnHeaders) {
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + "" + html.split('\\n')[1] + "<br/>" + html.split('\\n')[2] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }

            if (e.panel == s.cells) {
                switch (col.binding) {
                    case 'isbn':
                    case 'prdname':
                        if(item[col.binding] == ''){
                            e.cell.classList.add('orangeBg');
                            state.orangeCell = true;
                        }
                        break;
                    case 'store':
                        if(item[col.binding] == ''){
                            e.cell.classList.add('orangeBg');
                            state.orangeCell = true;
                            e.cell.innerHTML= account;
                        }
                        break;
                    case 'confirmedPrice':
                        if(item.confirmedPrice != item.price || item.price == null){
                            e.cell.classList.add('blueBg');
                        }
                        break;
                }
            }
        });
    };

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["code", "isbn", "prdname", "price", "confirmedPrice", "sellingPrice", "salesVolume", "sales", "adjustedAmount", "store"];
    };

    const showModal = () => {
        Modal.info({
            title: `매출이 등록되었습니다.`,
            onOk() {
                console.log('OK');
            }
        });
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
                <FlexGridColumn binding="code" header="등록한 상품\n인식 코드" width={120} />
                <FlexGridColumn binding="isbn" header="확인된 ISBN" width={120} />
                <FlexGridColumn binding="prdname" header="확인된 상품명" width="*" minWidth={120} />
                <FlexGridColumn binding="price" header="등록한 정가" width={100} align="right"/>
                <FlexGridColumn binding="confirmedPrice" header="확인된 정가" width={100} align="right"/>
                <FlexGridColumn binding="sellingPrice" header="실 판매가" width={100} align="right"/>
                <FlexGridColumn binding="salesVolume" header="판매 수량" width={100} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="sales" header="매출액" width={100} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="adjustedAmount" header="정산액" width={100} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="store" header="실제 판매처" width={100}/>
            </FlexGrid>

            <Row gutter={10}>
                <Col xs={16} lg={8}>
                    <div className="btn-group">
                        <span>행 개수 : {state.list.length}</span>
                    </div>
                </Col>
            </Row>

            <Row justify='center' style={{margin: 30}}>
                <Button type='primary submit' disabled={state.orangeCell} onClick={showModal}>확인</Button>
                <Button style={{marginLeft: 10}}>취소</Button>
            </Row>
        </>
    );
});

export default Index;