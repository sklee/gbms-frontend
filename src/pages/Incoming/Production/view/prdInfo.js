import React, { useState } from 'react';
import { Row, Col } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import * as wjCore from '@grapecity/wijmo';

import PrdView from '../../../Product/view/index'


const Wrapper = styled.div`
    width: 100%;
    #tplBtnViewMode {
        display: none;
    }
    .table .btnLink{text-decoration: none}
    .wj-content{margin-bottom: -7px}
`;

const index = observer(({drawerChk, drawerClass}) => {

    const state = useLocalStore(() => ({
        list: [
            {
                id: 0,
                company: '도서출판 길벗',
                prdCode: 'GA02B',
                prdName: '상품명 ',
                prdType: '종이책(단권)',
                prdClass: '신간',
                printing: '1쇄',
                prdComp: '카카오',
                moq: 2500,
            },
        ],
        grid: null,
    }));

    //위즈모 체크박스 선택
    const initGrid = (grid) => {
        state.grid =grid;

        //버튼 추가
        grid.formatItem.addHandler((s, e) => {
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                switch (col.binding) {
                    case 'prdName':
                        let prdName = '<button id="btnLink" class="btnLink">'+item.prdName+'</button>';
                        e.cell.innerHTML = prdName+' '+document.getElementById('tplBtnViewMode').innerHTML;
                        e.cell['dataItem'] = item;
                        break;
                }
            }
        });

        // handle button clicks
        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                // get button's data item
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                switch (e.target.id) {
                    // start editing this item
                    case 'btnLink':
                        viewDrawerOpen();
                        break;
                }
            }
        });
    };

    //drawer class check
    const classChkBtn = (val)=>{
        drawerClass(val)     
    }

    const [viewVisible, setViewVisble] = useState(false);
    const viewDrawerOpen = () => {
        if(drawerChk === 'Y'){
            classChkBtn('drawerback');
        }
        setViewVisble(true);
    };
    const viewDrawerClose = () => { 
        if(drawerChk === 'Y'){
            classChkBtn();
        }
        setViewVisble(false);
    };

    return (
        <Wrapper>
            <Row className='table marginTop'>
                <div className="table_title">상품/발주 정보</div>
                <Col span={24} className='innerCol'>
                    <FlexGrid
                        itemsSource={state.list}
                        headersVisibility="Column" 
                        initialized={(s) => initGrid(s)}
                        isReadOnly={true}
                    >
                        <FlexGridColumn binding="company" header="회사" width={120} />
                        <FlexGridColumn binding="prdCode" header="상품 코드" width={120} />
                        <FlexGridColumn binding="prdName" header="상품명" width="*" minWidth={120} />
                        <FlexGridColumn binding="prdType" header="상품 종류" width={100} />
                        <FlexGridColumn binding="prdClass" header="제작 구분" width={100} />
                        <FlexGridColumn binding="printing" header="쇄" width={80} />
                        <FlexGridColumn binding="prdComp" header="제작처" width={120} />
                        <FlexGridColumn binding="moq" header="발주 수량" align="right" width={100} />
                    </FlexGrid>
                </Col>
            </Row>

            <div id="tplBtnViewMode">
                <div className="btnLayoutWrap">
                    <button id="btnNew" className="btn-layout ant-btn ant-btn-circle" >N</button>
                </div>
            </div>

            { viewVisible && (
                <PrdView 
                    viewVisible={viewVisible} 
                    viewOnClose={viewDrawerClose}
                    drawerChk={drawerChk}
                />
            )}
        </Wrapper>
    );

});

export default index;
