import React, { useState } from 'react';
import { Row, Col, Drawer, Button, Radio } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { observer, useLocalStore } from 'mobx-react';

import styled from 'styled-components';

const Wrapper = styled.div`
    width: 100%;
`;

const prepress = observer(({ viewVisible, visibleClose }) => {
    React.useEffect(() => {
        theSearch.current.control.grid = theGrid.current.control;
    }, [])

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    const state = useLocalStore(() => ({
        list: [
            {
                id: 0,
                businessName: '경문제책사',
                regiNumber: '123-12-12345',
                process: '인쇄, 제본',
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
                    case 'status':
                        let btn = '<button id="btnAdd" class="btnText blueTxt">추가</button>';
                        e.cell.innerHTML = btn;
                        break;
                }                         
            }
        });
    };

    const [vendorVal, setVendorVal] = useState(2);
    const changeVal = (event) => {
        setVendorVal(event.target.value);
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

    return(
        <Wrapper>
            <Drawer 
                title='납품처 선택'
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
                    <Col lg={24}>
                        <Radio.Group value={vendorVal}>
                            <Radio value={1} onChange={changeVal}>제작처와 같음</Radio>
                            <Radio value={2} onChange={changeVal}>PrePress</Radio>
                            <Radio value={3} onChange={changeVal}>종이</Radio>
                            <Radio value={4} onChange={changeVal}>인쇄</Radio>
                            <Radio value={5} onChange={changeVal}>제본</Radio>
                            <Radio value={6} onChange={changeVal}>후가공</Radio>
                            <Radio value={7} onChange={changeVal}>포장</Radio>
                            <Radio value={8} onChange={changeVal}>부속 제작</Radio>
                            <Radio value={9} onChange={changeVal}>라임북(창고)</Radio>
                        </Radio.Group> 
                    </Col>
                </Row>
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
                        <FlexGridColumn header="사업자명" binding="businessName" width={200}/>
                        <FlexGridColumn header="사업자등록번호" binding="regiNumber" width={200}/>
                        <FlexGridColumn header="담당 공정" binding="process" width="*" minWidth={200}/>
                        <FlexGridColumn header="작업" binding="status" width={100} align="center"/>
                    </FlexGrid>
                </Row>
                <Row gutter={10} className="table_bot">
                    <span>행 개수 : {state.list.length}</span>
                </Row>
            </Drawer>
        </Wrapper>
    )
})


export default prepress;