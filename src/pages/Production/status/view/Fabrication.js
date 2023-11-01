import React, { useState } from 'react';
import { Drawer, Row, Button } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { observer, useLocalStore } from 'mobx-react';

import styled from 'styled-components';

const Wrapper = styled.div`
    width: 100%;
`;

const Fabrication = observer(({ viewVisible, visibleClose }) => {
    const state = useLocalStore(() => ({
        list: [
            {
                id:1,
                fabrication: '제작 검토 요청',
                changeDate: '2023.05.02',
                worker: '홍길동',
                necessaryWork:  '[제작] 제작팀장 확인 요청',
                ref: ''
            },
            {
                id:2,
                fabrication: '제작 검토 중',
                changeDate: '2023.05.02',
                worker: '홍길동',
                necessaryWork:  '[제작] 제작팀장 확인 요청',
                ref: ''
            },
            {
                id: 3,
                fabrication: '제작팀장 확인 요청',
                changeDate: '',
                worker: '',
                necessaryWork:  '',
                ref: ''
            },
            {
                id: 4,
                fabrication: '사양 확정 요청',
                changeDate: '',
                worker: '',
                necessaryWork:  '',
                ref: ''
            },
            {
                id: 5,
                fabrication: '사양 확정',
                changeDate: '',
                worker: '',
                necessaryWork:  '',
                ref: ''
            },
            {
                id: 6,
                fabrication: '편집 마감 완료',
                changeDate: '',
                worker: '',
                necessaryWork:  '',
                ref: ''
            },
            {
                id: 7,
                fabrication: '발주 완료',
                changeDate: '',
                worker: '',
                necessaryWork:  '',
                ref: ''
            },
            {
                id: 8,
                fabrication: '인쇄 샘플 도착',
                changeDate: '',
                worker: '',
                necessaryWork:  '',
                ref: ''
            },
            {
                id: 9,
                fabrication: '인쇄 샘플 검수 완료',
                changeDate: '',
                worker: '',
                necessaryWork:  '',
                ref: ''
            },
            {
                id: 10,
                fabrication: '제본 샘플 도착',
                changeDate: '',
                worker: '',
                necessaryWork:  '',
                ref: ''
            },
            {
                id: 11,
                fabrication: '제본 샘플 검수 완료',
                changeDate: '',
                worker: '',
                necessaryWork:  '',
                ref: ''
            },
            {
                id: 12,
                fabrication: '재입고 요청',
                changeDate: '',
                worker: '',
                necessaryWork:  '',
                ref: ''
            },
            {
                id: 13,
                fabrication: '입고 (부분)',
                changeDate: '',
                worker: '',
                necessaryWork:  '',
                ref: ''
            },
            {
                id: 14,
                fabrication: '입고 (완료)',
                changeDate: '',
                worker: '',
                necessaryWork:  '',
                ref: ''
            },
        ],
        drawerback: 'drawerWrap'
    }));

    const initGrid = (grid) => {
        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                // create buttons for items not being edited
                switch (col.binding) {
                    case 'fabrication' :
                        if(item.changeDate == ''){
                            let desc = `<span class="font_gr">${item.fabrication}</span>`;
                            e.cell.innerHTML = desc;
                        }
                        break;
                    case 'necessaryWork':
                        if(item.necessaryWork != "" ){
                            var checked = '';
                            e.cell.innerHTML = '<input id="' + col.binding + '" type="checkbox" name= "'+item.id+'" value="'+item.necessaryWork+'" '+checked+'>'+ item.necessaryWork +'</input>';
                        }
                        break;
                    case 'ref':
                        if(item.changeDate != ''){
                            let input = '<input type="text" class="ant-input" />';
                            e.cell.innerHTML = input;
                        }
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                switch (e.target.id) {
                    case 'chkBox':
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
                title='제작 상태'
                placement='right'
                onClose={()=>{visibleClose('fabrication')}}
                visible={viewVisible}
                className={state.drawerback}
                closable={false}
                keyboard={false}
                extra={
                    <>
                        <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={()=>{visibleClose('fabrication')}}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >
                <Row id="gridWrap" className="gridWrap">
                    <FlexGrid
                        itemsSource={state.list}
                        initialized={(s) => initGrid(s)}
                        style={{ minHeight: '700px' }}
                        autoRowHeights={true}
                        headersVisibility="Column"
                    >
                        <FlexGridColumn header="제작 상태" binding="fabrication" width={150}/>
                        <FlexGridColumn header="변경일" binding="changeDate" width={150}/>
                        <FlexGridColumn header="작업자" binding="worker" width={150}/>
                        <FlexGridColumn header="[담당 부서] 필요 작업 *" binding="necessaryWork" width="*" minWidth={150} align="center"/>
                        <FlexGridColumn header="참고 사항" binding="ref" width={150}/>
                    </FlexGrid>
                </Row>
                <Row gutter={10} justify="center" style={{margin: '20px 0'}}>
                    <Button type="primary" htmlType="button">확인</Button>
                    <Button htmlType="button" style={{marginLeft: 10}} onClick={() => {visibleClose('fabrication')}}>취소</Button>
                </Row>
            </Drawer>
        </Wrapper>
    )
})

export default Fabrication;
