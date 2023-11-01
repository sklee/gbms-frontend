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

const packing = observer(({ viewVisible, visibleClose }) => {
    React.useEffect(() => {
        theSearch.current.control.grid = theGrid.current.control;
    }, [])

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    const state = useLocalStore(() => ({
        list: [
            {
                id: 0,
                prdComp: '서울코팅',
                process: '부분UV 코팅',
                priceStandard: '연',
                price: 30000,
                price_at: '2022.09.01',
                ref: '',
                status: '',
            }
        ],
        drawerback: 'drawerWrap'
    }));

    const initGrid = (grid) => {
        grid.formatItem.addHandler((s, e) => {
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                // create buttons for items not being edited
                switch (col.binding) {
                    case 'price':
                        let priceWrap = '<button class="btnText title btnRed btn_price_modify">' + commaNum(item.price) + '</button>';
                        e.cell.innerHTML = priceWrap;
                        break;               
                    case 'status':
                        let btn = '<button id="btnAdd" class="btnText blueTxt">추가</button>';
                        e.cell.innerHTML = btn;
                        break;
                }                         
            }
        });
    };

    const commaNum = (num) => {
        const number = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return number
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
                        headersVisibility="Column"
                    >
                        <FlexGridColumn header="제작처" binding="prdComp" width={150}/>
                        <FlexGridColumn header="공정" binding="process" width={150}/>
                        <FlexGridColumn header="단가 기준" binding="priceStandard" width={100}/>
                        <FlexGridColumn header="단가" binding="price" width={100} align="right"/>
                        <FlexGridColumn header="단가 적용일" binding="price_at" width={120}/>
                        <FlexGridColumn header="참고사항" binding="ref" width="*" minWidth={100}/>
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


export default packing;