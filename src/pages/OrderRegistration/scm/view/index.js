import React, {useState} from 'react'
import {Row, Drawer, Button} from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import * as wjCore from '@grapecity/wijmo';

import styled from 'styled-components';

const Wrapper = styled.div`width: 100%;`;

const index = observer(( { drawerVisible, drawerClose } ) => {
    React.useEffect(() => {
        theSearch.current.control.grid = theGrid.current.control;
    }, [])

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    const state = useLocalStore(() => ({
        drawerback : 'drawerWrap',
        list: [
            {
                prdCode: 'GA01',
                prdName: '나는경매로1년만에인생을역전했다',
                isbn: '9791140703128',
                price: 20000,
                volumeOrders: 200,
                inventory: 1231,
                SupplyRate: 50,
                SupplyPrice: 2000000,
            }
        ],
    }));

    const initGrid = (grid) => {    
        state.flex= grid;

        grid.formatItem.addHandler(function (s, e) {            
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                switch (col.binding) {
                    case 'prdCode':
                        e.cell.innerHTML = '<div>['+item.prdCode+ ']'+ item.prdName + '</div>';
                        break;
                }
            }
        });
        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                // get button's data item
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                switch (e.target.id) {
                    // start editing this item
                    case 'btnLink':
                        break;
                }
            }
        });
    };

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

    return (
        <Wrapper>
            <Drawer
                title='주문 내역'
                placement='right'
                onClose={drawerClose}
                visible={drawerVisible}
                className={state.drawerback}
                closable={false}
                keyboard={false}
                extra={
                    <>
                        <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={drawerClose}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >
                <Row className="topTableInfo">
                    <FlexGridSearch ref={theSearch} placeholder='검색' />
                </Row>
                <Row className="gridWrap">       
                    <FlexGrid
                        ref={theGrid}
                        itemsSource={state.list} 
                        initialized={(s) => initGrid(s)}
                        headersVisibility="Column" 
                    >
                        <FlexGridColumn binding="prdCode" header="[상품코드]상품명" width="*" minWidth={150} />
                        <FlexGridColumn binding="prdName" header="상품명(서점)" width="*" minWidth={150} />
                        <FlexGridColumn binding="isbn" header="ISBN" width={150} align="right"/>
                        <FlexGridColumn binding="price" header="정가" width={100} align="right"/>
                        <FlexGridColumn binding="volumeOrders" header="주문량" width={100} align="right"/>
                        <FlexGridColumn binding="inventory" header="가용재고" width={100} align="right"/>
                        <FlexGridColumn binding="SupplyRate" header="공급률" width={100} align="right"/>
                        <FlexGridColumn binding="SupplyPrice" header="공급 금액" width={100} align="right"/>
                    </FlexGrid>     
                </Row>
                <Row className='table_bot'>
                    <div className='btn-group'>
                        <span>행 개수 : {state.list.length}</span>
                    </div>
                </Row>
            </Drawer>
        </Wrapper>
        
    )
})

export default index;