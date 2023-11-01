import React from 'react';
import { Row, Col } from 'antd';
import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import * as wjcGrid from '@grapecity/wijmo.grid';
import * as wjGrid from '@grapecity/wijmo.grid';
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
                releaseDate: '2023-05-01',
                release: '출시',
                unstoring: '가능',
                sum: 1830,
                genuine: 1230,
                equipment: 500,
                disposal: 100,
                average: 100,
                remainingDays: 12.2,
            }, {
                id: 1,
                company: '길벗',
                department: '수험서1팀',
                prdCode: 'GA123',
                prdName: '2023 시나공 컴퓨터활용능력 1급 실기',
                releaseDate: '2023-05-01',
                release: '출시',
                unstoring: '가능',
                sum: 100,
                genuine: 100,
                equipment: 100,
                disposal: 100,
                average: 100,
                remainingDays: 12.2,
            },
        ],
        grid: null,
        selectRows: [],
    }));

    const initGrid = (grid) => {
        state.grid = grid;

        grid.columnFooters.rows.push(new wjcGrid.GroupRow());

        let extraRow = new wjGrid.Row();
        extraRow.allowMerging = true;
        let panel = grid.columnHeaders;
        panel.rows.splice(0, 0, extraRow);

        for (let colIndex = 0; colIndex <= 12; colIndex++) {
            if(colIndex >= 5 && colIndex <= 6){ 
                panel.setCellData(0, colIndex, '상품 상태');
            } else if(colIndex >= 7 && colIndex <= 10){
                panel.setCellData(0, colIndex, '재고');
            } else if(colIndex >= 11 && colIndex <= 12){
                panel.setCellData(0, colIndex, '분석');
            } else {
                let col = grid.getColumn(colIndex);
                col.allowMerging = true;
                panel.setCellData(0, colIndex, col.header);
            }            
        }

        grid.formatItem.addHandler(function (s, e) {
            const row = e.panel.rows[e.row];
            let html = e.cell.innerHTML;
            let col = s.columns[e.col];
            let item = s.rows[e.row].dataItem;

            if (e.panel == s.columnHeaders) {
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + "<br/>" + html.split('\\n')[1] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }

            if (e.panel == s.cells) {
                switch (col.binding) {
                    case 'cnt':
                        break;
                }
            }

            if (row instanceof wjcGrid.GroupRow) {
                if (e.col < 6) {
                    e.cell.style.borderRight = 'none';
                }
                if (e.col === 3) {
                    e.cell.style.textAlign = 'center';
                    e.cell.textContent = '합계';
                }
            }
        });
    };

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["company", "department", "prdCode", "prdName", "releaseDate", "release", "unstoring", "sum", "genuine", "equipment", "disposal", "average", "remainingDays"];
    };

    return(
        <>
            <FlexGrid
                itemsSource={state.list}
                initialized={(s) => initGrid(s)}
                selectionMode="None"
                headersVisibility="Column"
                allowMerging="ColumnHeaders"
            >
                <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                <FlexGridColumn binding="company" header="회사" width={70} />
                <FlexGridColumn binding="department" header="부서" width={100} />
                <FlexGridColumn binding="prdCode" header="상품코드" width={90} />
                <FlexGridColumn binding="prdName" header="상품명(내부)" width="*" minWidth={120} />
                <FlexGridColumn binding="releaseDate" header="출시일" width={100} />
                <FlexGridColumn binding="release" header="출시" width={70} />
                <FlexGridColumn binding="unstoring" header="출고" width={70} />
                <FlexGridColumn binding="sum" header="합계" width={90} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="genuine" header="정품" width={90} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="equipment" header="비품" width={90} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="disposal" header="폐기대기" width={90} align="right" aggregate="Sum"/>
                <FlexGridColumn binding="average" header="평균 출고" width={80} align="right"/>
                <FlexGridColumn binding="remainingDays" header="잔여일" width={80} align="right"/>
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