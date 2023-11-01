import React, { useState } from 'react'
import { Drawer, Row, Col, Button, DatePicker, Input  } from 'antd'
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { Selector } from "@grapecity/wijmo.grid.selector";
import { CollectionView } from "@grapecity/wijmo";
import * as wjCore from '@grapecity/wijmo';

import moment from 'moment';

import styled from 'styled-components';

const Wrapper = styled.div`
    width: 100%;

`;
const { TextArea } = Input;

const OrderSend = observer(({ viewVisible, visibleClose, drawerChk }) => {

    const [ directorDrawer, setDirectorDrawer ] = useState(false);

    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                process: '종이',
                prdComp: '대림지업',
                director: '',
                email: '',
            },
            {
                id: 2,
                process: '인쇄',
                prdComp: '아람미디어',
                director: ['홍길동'],
                email: 'hong@a.com',
            },
            {
                id: 2,
                process: '제본',
                prdComp: '경문제책사',
                director: ['홍길동2', '홍길동3'],
                email: 'hong@a.com',
            },
        ],
        selector:'',
        flex: null,
        requestDate: moment().add(14, 'days'),
        drawerback : 'drawerWrap', //drawer class name
    }));

    const [selectorState, setSelectorState] = useState({
        view: new CollectionView(state.list),
        selectedItems: []
    });

    const directorDelHandle = (id) => {
        console.log(id);
    }

    const directorAddHandle = () => {

    }

    const initGrid = (grid) => {
        state.flex = grid;
        state.selector = new Selector(grid, {
            itemChecked: (s, e) => {
                setSelectorState({
                    selectedItems: grid.rows.filter(r => r.isSelected)
                });
            }
        });

        grid.formatItem.addHandler(function (s, e) {

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                // create buttons for items not being edited
                switch (col.binding) {
                    case 'director':
                        let btn = '';
                        if(typeof item.director == 'object'){
                            for(let i = 0; i < item.director.length; i++){
                                btn += `<span style="margin-right: 10px;">${item.director[i]}<button type="button" id="btnDel" class="ant-btn ant-btn-circle ant-btn-default ant-btn-sm btn_del "><span>X</span></button></span>`;
                            }
                        } else {
                            btn += `<button id="btnAdd" type="button" class="ant-btn ant-btn-circle ant-btn-default btn btn-primary btn_add"><span>+</span></button>`;
                        }
                        e.cell['dataItem'] = item;
                        e.cell.innerHTML = btn;
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                // get button's data item
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                var name = item.name;
                // handle buttons
                state.idx = item.id;

                switch (e.target.id) {
                    case 'btnDel':
                        directorDelHandle(item.id);
                        break;
                    case 'btnAdd':
                        drawerOpen()
                }
            }
        });
    };

    const drawerClass=(data)=>{
        if(data === 'drawerback'){
            state.drawerback = 'drawerback drawerWrap';
        }else{
            state.drawerback = 'drawerWrap';
        }          
    }

    const drawerOpen = () => {
        if(drawerChk === 'Y'){
            drawerClass('drawerback');
        }       
        setDirectorDrawer(true);
    };

    const drawerClose = () => {
        if(drawerChk === 'Y'){
            drawerClass();
        }
        setDirectorDrawer(false);
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
        <Drawer 
            title='제작 발주서 발송'
            placement='right'
            onClose={()=>{visibleClose('send')}}
            visible={viewVisible}
            className={state.drawerback}
            closable={false}
            keyboard={false}
            extra={
                <>
                    <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                        {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                    </Button>
                    <Button onClick={()=>{visibleClose('send')}}>
                        <CloseOutlined />
                    </Button>
                </>
            }
        >
            <Row className="table" style={{border: 'unset !important'}}>
                <Col xs={12} lg={6} className='label' style={{borderTop: '1px solid #eee'}}>창고 입고 요청일 <span className='spanStar'>*</span></Col>
                <Col xs={12} lg={18} style={{borderTop: '1px solid #eee'}}>
                    <DatePicker format={'YYYY-MM-DD'} value={moment(state.requestDate)}/>
                </Col>
            </Row>

            <Row id="gridWrap" className="gridWrap" style={{margin: '20px 0'}}>
                <FlexGrid
                    itemsSource={state.list}
                    initialized={initGrid}
                    autoRowHeights={true}
                    allowSorting={false}
                    selectionMode="None"
                >
                    <FlexGridColumn header="공정" binding="process" width={150} />
                    <FlexGridColumn header="제작처" binding="prdComp" width={200} />
                    <FlexGridColumn header="담당자" binding="director" width="*" minWidth={150} />
                    <FlexGridColumn header="이메일" binding="email" width={200}/>
                </FlexGrid>
            </Row>

            <Row className="table marginTop">
                <div className="table_title">발주서에 추가할 주의/요청사항</div>
                <Col xs={24} lg={24}><TextArea /></Col>
            </Row>
            
            <div style={{margin: '20px 0'}}>
                <Row className="table marginTop">
                    <div className="table_title">메일에 추가할 내용</div>
                    <Col xs={24} lg={24}><TextArea /></Col>
                </Row>
            </div>

            <Row gutter={10} justify="center" style={{margin: '20px 0'}}>
                <Button type="primary" htmlType="button">확인</Button>
                <Button htmlType="button" style={{marginLeft: 10}} onClick={() => {visibleClose('send')}}>취소</Button>
            </Row>
            
            {directorDrawer ? <Director viewVisible={directorDrawer} visibleClose={drawerClose}/> : ''}
        </Drawer>
    )
})

const Director = observer(({ viewVisible, visibleClose }) => {

    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                name: '김영희',
                department: 'A팀',
                compNumper: '02-123-1234',
                phoneNumber: '010-5678-5678',
                email: 'kim@a.com',
                status: '',
            },
            {
                id: 2,
                name: '김영희2',
                department: 'B팀',
                compNumper: '02-123-1124',
                phoneNumber: '010-54538-5678',
                email: 'kim@a.com',
                status: '',
            },
        ],
    }));

    const initGrid = (grid) => {

        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                // create buttons for items not being edited
                switch (col.binding) {
                    case 'status':
                        let btn = `<button id="btnAdd" class="btnText">추가</button>`
                        e.cell.innerHTML = btn;
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                // get button's data item
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                var name = item.name;
                // handle buttons
                state.idx = item.id;
                switch (e.target.id) {
                    
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

    return(
        <Wrapper>
            <Drawer 
                title='제작처 담당자'
                placement='right'
                onClose={()=>{visibleClose('send')}}
                visible={viewVisible}
                className={state.drawerback}
                closable={false}
                keyboard={false}
                extra={
                    <>
                        <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={()=>{visibleClose('send')}}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >
                <Row id="gridWrap" className="gridWrap">
                    <FlexGrid
                        itemsSource={state.list}
                        initialized={(s) => initGrid(s)}
                        autoRowHeights={true}
                        allowSorting={false}
                        selectionMode="None"
                        headersVisibility="Column"
                    >
                        <FlexGridColumn header="성명" binding="name" width={150} />
                        <FlexGridColumn header="부서" binding="department" width={200} />
                        <FlexGridColumn header="회사 전화번호" binding="compNumper" width="*" minWidth={150} />
                        <FlexGridColumn header="휴대폰 번호" binding="phoneNumber" width={200} />
                        <FlexGridColumn header="이메일" binding="email" width={200}/>
                        <FlexGridColumn header="작업" binding="status" width={200} align="center"/>
                    </FlexGrid>
                </Row>
            </Drawer>
        </Wrapper>
    );
});


export default OrderSend;
