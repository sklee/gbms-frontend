import React, { useState } from 'react'
import { Drawer, Row, Button } from 'antd'
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { inject, observer, useLocalStore } from 'mobx-react';

import styled from 'styled-components';

const Wrapper = styled.div`
    width: 100%;
`;

const Fabrication = ({ commonStore, viewVisible, visibleClose }) => {

    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                prdName: '[상품코드1]상품명1',
                palte: '초판/2쇄',
                progress: '사양 확정',
                registrant: '이진혁',
                registrationDate:  '2023.05.10',
                ref: '',
                status: '',
            },
            {
                id: 2,
                prdName: '[상품코드2]상품명2',
                palte: '개정판/1쇄',
                progress: '편집 마감 완료',
                registrant: '김명자',
                registrationDate:  '2023.05.02',
                ref: '',
                status: '',
            },
            {
                id: 3,
                prdName: '[상품코드3]상품명3',
                palte: '초판/5쇄',
                progress: '편집 마감 완료',
                registrant: '이준호',
                registrationDate:  '2023.05.07',
                ref: '',
                status: '',
            }
        ],
        drawerback: 'drawerWrap'
    }));

    const handelDel = () =>{
        
    }

    const initGrid = (grid) => {

        grid.formatItem.addHandler(function (s, e) {

            // if(e.panel._ct == 4){
            //     e.cell.innerHTML = '<div class="v-center">순서</div>';
            // }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                // create buttons for items not being edited
                switch (col.binding) {
                    case 'id':
                        e.cell.innerHTML = e.row + 1;
                        break;
                    case 'ref':
                        e.cell.innerHTML = '<input id="' + col.binding + '" class="ant-input" />';
                        break;
                    case 'status':
                        e.cell.innerHTML = '<button id="btnDel" class="btnText redTxt">삭제</button>';
                        break;

                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                switch (e.target.id) {
                    case 'btnDel':
                        break;
                }
            }
        });
    };


    const fetchData = () => {
        commonStore.handleApi({
            url : `/productions-priority`
        })
        .then((result) => {
            console.log(result.data)
        })
    }

    React.useEffect(() => {
        fetchData()
    })

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
                title='우선 순위'
                placement='right'
                onClose={()=>{visibleClose('priority')}}
                visible={viewVisible}
                className={state.drawerback}
                closable={false}
                keyboard={false}
                extra={
                    <>
                        <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={()=>{visibleClose('priority')}}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >
                <Row id="gridWrap" className="gridWrap">
                    <FlexGrid
                        itemsSource={state.list}
                        initialized={initGrid}
                        autoRowHeights={true}
                        allowSorting={false}
                        allowMerging="ColumnHeaders"
                        selectionMode="None"
                        allowDragging="Both"
                        headersVisibility="Column"
                    >
                        <FlexGridColumn header="순번" binding="id" width={80} align="center"/>
                        <FlexGridColumn header="상품명" binding="prdName" width={150}/>
                        <FlexGridColumn header="판/쇄" binding="palte" width={150}/>
                        <FlexGridColumn header="진행 상태" binding="progress" width="*" minWidth={150}/>
                        <FlexGridColumn header="등록자" binding="registrant" width={150}/>
                        <FlexGridColumn header="등록일" binding="registrationDate" width={150}/>
                        <FlexGridColumn header="참고 사항" binding="ref" width={150}/>
                        <FlexGridColumn header="작업" binding="status" width={100} align="center"/>
                    </FlexGrid>
                </Row>
                <Row gutter={[10, 10]} justify="center" style={{border: 0, marginTop: 20}}>
                    <Button type="primary" htmlType="button">현재 제작 건을 추가</Button>
                    <Button type="primary" htmlType="button" style={{marginLeft: 10}}>확인</Button>
                    <Button htmlType="button" style={{marginLeft: 10}} onClick={()=>{visibleClose('priority')}}>취소</Button>
                </Row>
            </Drawer>
        </Wrapper>
    )
}

export default inject('commonStore')(observer(Fabrication))
