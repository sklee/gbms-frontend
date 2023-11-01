import React from 'react';
import { Row, Col } from 'antd';
import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import * as wjcGrid from '@grapecity/wijmo.grid';
import { observer, useLocalStore } from 'mobx-react';
import Excel from '@components/Common/Excel';

const Index = observer(( props ) =>{
    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                company: '길벗',
                department: '수험서1팀',
                prdCode: 'GA123',
                prdName: '2023 시나공 컴퓨터활용능력 1급 실기',
                a1: -100,
                a2: 100000,
                a3: 100000,
                a4: 100000,
                b1: 100000,
                b2: 100000,
                b3: 100000,
                b4: 100000,
                c1: 100000,
                c2: 100000,
                c3: 100000,
                c4: 100000,
                d1: 100000,
                d2: 100000,
                d3: 100000,
                d4: 100000,
                e1: 100000,
                e2: 100000,
                e3: 100000,
                e4: 100000,
                f1: 100000,
                f2: 100000,
                f3: 100000,
                f4: 100000,
                g1: 100000,
                g2: 100000,
                g3: 100000,
                g4: 100000,
                h1: 100000,
                h2: 100000,
                h3: 100000,
                h4: 100000,
                i1: 100000,
                i2: 100000,
                i3: 100000,
                i4: 100000,
                j1: 100000,
                j2: 100000,
                j3: 100000,
                j4: 100000,
                k1: 100000,
                k2: 100000,
                k3: 100000,
                k4: 100000,
                l1: 100000,
                l2: 100000,
                l3: 100000,
                l4: 100000,
                n1: 100000,
                n2: 100000,
                n3: 100000,
                n4: 100000,
                m1: 100000,
                m2: 100000,
                m3: 100000,
                m4: 100000,
                o1: 100000,
                o2: 100000,
                o3: 100000,
                o4: 100000,
                p1: 100000,
                p2: 100000,
                p3: 100000,
                p4: 100000,
                q1: 100000,
                q2: 100000,
                q3: 100000,
                q4: 100000,
            }
        ],
        grid: null,
        selectRows: [],
    }));

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
                switch(col.binding){
                    case 'company':
                    case 'department':
                    case 'prdCode':
                    case 'prdName':
                        break;
                    default:
                        if (item[col.binding] < 0) {
                            e.cell.innerHTML = '<span class="redTxt">' + item[col.binding] + '</span>'
                        }
                }
            }

            if (row instanceof wjcGrid.GroupRow) {
                if (e.col < 3) {
                    e.cell.style.borderRight = 'none';
                }
                if (e.col === 2) {
                    e.cell.style.textAlign = 'center';
                    e.cell.textContent = '합계';
                }
            }
        });
    };

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["company", "department", "prdCode", "prdName", "a1", "a2", "a3", "a4", "b1", "b2", "b3", "b4", "c1", "c2", "c3", "c4", "d1", "d2", "d3", "d4", 
        "e1", "e2", "e3", "e4", "f1", "f2", "f3", "f4", "g1", "g2", "g3", "g4", "h1", "h2", "h3", "h4", "i1", "i2", "i3", "i4", "j1", "j2", "j3", "j4", "k1", "k2", "k3", "k4", 
        "l1", "l2", "l3", "l4", "n1", "n2", "n3", "n4", "m1", "m2", "m3", "m4", "o1", "o2", "o3", "o4", "p1", "p2", "p3", "p4", "q1", "q2", "q3", "q4"];
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
                <FlexGridColumn binding="company" header="회사" width={70} />
                <FlexGridColumn binding="department" header="부서" width={100} />
                <FlexGridColumn binding="prdCode" header="상품코드" width={90} />
                <FlexGridColumn binding="prdName" header="상품명(내부)" width="*" minWidth={120} />
                <FlexGridColumn binding="a1" header="기초 재고\n(합계)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="a2" header="기초 재고\n(정품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="a3" header="기초 재고\n(비품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="a4" header="기초 재고\n(폐기대기)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="b1" header="전체 입고\n(합계)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="b2" header="전체 입고\n(정품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="b3" header="전체 입고\n(비품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="b4" header="전체 입고\n(폐기대기)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="c1" header="제작 입고\n(합계)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="c2" header="제작 입고\n(정품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="c3" header="제작 입고\n(비품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="c4" header="제작 입고\n(폐기대기)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="d1" header="반품 입고\n(합계)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="d2" header="반품 입고\n(정품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="d3" header="반품 입고\n(비품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="d4" header="반품 입고\n(폐기대기)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="e1" header="회송 입고\n(합계)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="e2" header="회송 입고\n(정품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="e3" header="회송 입고\n(비품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="e4" header="회송 입고\n(폐기대기)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="f1" header="재생 입고\n(합계)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="f2" header="재생 입고\n(정품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="f3" header="재생 입고\n(비품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="f4" header="재생 입고\n(폐기대기)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="g1" header="기타 입고\n(합계)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="g2" header="기타 입고\n(정품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="g3" header="기타 입고\n(비품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="g4" header="기타 입고\n(폐기대기)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="h1" header="전체 출고\n(합계)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="h2" header="전체 출고\n(정품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="h3" header="전체 출고\n(비품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="h4" header="전체 출고\n(폐기대기)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="i1" header="판매 출고\n(합계)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="i2" header="판매 출고\n(정품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="i3" header="판매 출고\n(비품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="i4" header="판매 출고\n(폐기대기)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="j1" header="증정 출고\n(합계)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="j2" header="증정 출고\n(정품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="j3" header="증정 출고\n(비품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="j4" header="증정 출고\n(폐기대기)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="k1" header="기타 출고\n(합계)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="k2" header="기타 출고\n(정품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="k3" header="기타 출고\n(비품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="k4" header="기타 출고\n(기타대기)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="l1" header="폐기 출고\n(합계)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="l2" header="폐기 출고\n(정품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="l3" header="폐기 출고\n(비품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="l4" header="폐기 출고\n(폐기대기)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="n1" header="재고 이동\n(합계)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="n2" header="재고 이동\n(정품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="n3" header="재고 이동\n(비품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="n4" header="재고 이동\n(폐기대기)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="m1" header="상태 변경\n(합계)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="m2" header="상태 변경\n(정품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="m3" header="상태 변경\n(비품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="m4" header="상태 변경\n(폐기대기)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="o1" header="재고 조정\n(합계)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="o2" header="재고 조정\n(정품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="o3" header="재고 조정\n(비품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="o4" header="재고 조정\n(폐기대기)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="p1" header="재고 증감\n(합계)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="p2" header="재고 증감\n(정품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="p3" header="재고 증감\n(비품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="p4" header="재고 증감\n(폐기대기)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="q1" header="기말 재고\n(합계)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="q2" header="기말 재고\n(정품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="q3" header="기말 재고\n(비품)" width={80} aggregate="Sum"/>
                <FlexGridColumn binding="q4" header="기말 재고\n(폐기대기)" width={80} aggregate="Sum"/>
            </FlexGrid>
            <Row gutter={10} className="table table_bot">
                <Col xs={16} lg={16}>
                    <div className="btn-group">
                        <span>행 개수 : {state.list.length}</span>
                    </div>
                </Col>
                <Excel />
            </Row>
        </>

    );
});

export default Index;