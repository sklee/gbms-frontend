import React, { useEffect } from 'react';
import { Row } from 'antd';
import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import { observer, useLocalStore } from 'mobx-react';

const HqGrid = observer(( props ) =>{
    const state = useLocalStore(() => ({
        list: [],
    }));

    useEffect(() => {
        state.list = props.details
    }, [props.details]);

    const initGrid = (grid) => {
        state.grid = grid
        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                switch (col.binding) {
                    case 'stamp' :
                        if(item.stamp == 1){
                            e.cell.innerHTML ='<div>날인</div>';
                        }else if(item.stamp == 2){
                            e.cell.innerHTML ='<div>제외</div>';
                        }else{ 
                            e.cell.innerHTML ='<div>' + item.stamp + '</div>';
                        }
                        break;
                }
            }
        });
    };

    return (
        <Row className="gridWrap" style={{width: '100%', marginTop: 10}}>
            <FlexGrid
                itemsSource={state.list}
                initialized={(s) => initGrid(s)}
                headersVisibility="Column"
                isReadOnly={true}
            >
                <FlexGridColumn binding="product_code" header="상품코드" width={100} />
                <FlexGridColumn binding="product_name" header="상품명" width="*" minWidth={150} />
                <FlexGridColumn binding="qty" header="수량" width={80} align="right" />
                <FlexGridColumn binding="stamp" header="기증 도장" width={100} />
                <FlexGridColumn binding="usage_name" header="용도 분류" width={100} />
                <FlexGridColumn binding="detail_info" header="상세 용도" width={100} />
            </FlexGrid>
        </Row>
    );
});

export default HqGrid;