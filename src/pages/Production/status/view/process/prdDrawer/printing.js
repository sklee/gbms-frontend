import React, { useState } from 'react';
import { Row, Drawer, Button } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { observer, useLocalStore } from 'mobx-react';

import styled from 'styled-components';

const Wrapper = styled.div`
    width: 100%;
`;

const printing = observer(({ viewVisible, visibleClose }) => {
    React.useEffect(() => {
        theSearch.current.control.grid = theGrid.current.control;
    }, [])

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    const state = useLocalStore(() => ({
        list: [
            {
                id: 0,
                prdComp: '아람미디어',
                frequency: '1도, 2도',
                Range_price: '신국판',
                effective_at: '2022.09.01',
                ref: '',
                status: ''
            },
        ],
        drawerback: 'drawerWrap',
    }));

    const initGrid = (grid) => {
        grid.formatItem.addHandler((s, e) => {
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                // create buttons for items not being edited
                switch (col.binding) {
                    case 'Range_price':
                        // let refBox = '<button class="btnLink title btn_price_modify">' + item.Range_price + '</button>';
                        // let refBox = `
                        //     <div>
                        //         <p>1~1,000: <button class="btnLink title btn_price_modify">3,000원</button></P>
                        //         <p>1,001~2,000: <button class="btnLink title btn_price_modify">2,900원</button></P>
                        //         <p>2,001~: <button class="btnLink title btn_price_modify">2,800원</button></P>
                        //     </div>`;
                        
                        let refBox = '<div>1~1,000: <button class="btnText title btn_price_modify">3,000원</button></div>';
                        refBox += '<div>1,001~2,000: <button class="btnText title btn_price_modify">2,900원</button></div>';
                        refBox += '<div>2,001~: <button class="btnText title btn_price_modify">2,800원</button></div>';
                        e.cell.innerHTML = refBox;
                        break;               
                    case 'status':
                        let btn = '<button id="btnAdd" class="btnText blueTxt">추가</button>';
                        e.cell.innerHTML = btn;
                        break;
                }                         
            }
        });
    }

    const [ drawerExtended, setDrawerExtended ] = useState(false);
    const drawerSizeHandler = () => {
        if(drawerExtended){
            setDrawerExtended(false);
            state.drawerback = 'drawerWrap';
            
        } else {
            setDrawerExtended(true);
            state.drawerback = 'drawerback drawerWrap';
        }
    }

    return(
        <Wrapper>
            <Drawer 
                title='제작처(공정) 선택'
                placement='right'
                onClose={visibleClose}
                visible={viewVisible}
                className={state.drawerback}
                closable={false}
                keyboard={false}
                extra={
                    <>
                        <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={visibleClose}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >
                <Row className="topTableInfo">
                    <FlexGridSearch ref={theSearch} placeholder='검색' />
                </Row>
                <Row id="gridWrap" className="gridWrap">
                    <FlexGrid
                        ref={theGrid}
                        itemsSource={state.list}
                        initialized={(s) => initGrid(s)}
                        autoRowHeights={true}
                        headersVisibility="Column"
                    >
                        <FlexGridColumn header="제작처" binding="prdComp" width={120}/>
                        <FlexGridColumn header="인쇄 도수" binding="frequency" width={120}/>
                        <FlexGridColumn header="부수 범위와 단가" binding="Range_price" width="*"/>
                        <FlexGridColumn header="단가 적용일" binding="effective_at" width={150}/>
                        <FlexGridColumn header="참고사항" binding="ref" width={150}/>
                        <FlexGridColumn header="작업" binding="status" width={80} align="center"/>
                    </FlexGrid>
                </Row>
                <Row gutter={10} className="table_bot">
                    <span>행 개수 : {state.list.length}</span>
                </Row>
            </Drawer>
        </Wrapper>
    )
})


export default printing;