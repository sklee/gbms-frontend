import React, { useState } from 'react';
import { Row, Col, Drawer, Space, Button, DatePicker, Checkbox, Input, Popover, Modal } from 'antd';
import { QuestionOutlined, CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import * as wjCore from '@grapecity/wijmo';
import { InputDate } from '@grapecity/wijmo.input';
import { observer, useLocalStore } from 'mobx-react';

import styled from 'styled-components';

const Wrapper = styled.div`
    width: 100%;
`;

const index = observer(({ viewVisible, visibleClose, setGoods }) => {

    const {TextArea} = Input;
    const isSetGoods = setGoods;
    const state = useLocalStore(() => ({
        drawerback: 'drawerWrap'
    }));

    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const tooltipText =(
        <div>
            <p>공급가는 상품 귀속 부서의 평균 공급가를 표시합니다.</p>
        </div>
    );

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
                {isSetGoods ? (
                    <Row className="table">
                        <Col xs={12} lg={4} className="label">상품</Col>
                        <Col xs={12} lg={20}>[상품코드]상품명(공식) / 상품명(내부용)</Col>
                        <Col xs={12} lg={4} className="label">현재 쇄</Col>
                        <Col xs={12} lg={20}>2쇄</Col>
                        <Col xs={12} lg={4} className="label">재쇄 검토 요청</Col>
                        <Col xs={12} lg={8}>김명자 / 2023.08.01</Col>
                        <Col xs={12} lg={4} className="label">편집 확인</Col>
                        <Col xs={12} lg={8}>홍길동 / 2023.08.02</Col>
                        <Col xs={12} lg={4} className="label">발주 수량</Col>
                        <Col xs={12} lg={8}>1,000</Col>
                        <Col xs={12} lg={4} className="label">입고 요청일</Col>
                        <Col xs={12} lg={8}>2023.08.15</Col>
                        <Col xs={12} lg={4} className="label">구성 상품</Col>
                        <Col xs={12} lg={20}>
                            <GoodsGrid />
                        </Col>
                        <Col xs={12} lg={4} className="label">사양 변경 등 참고사항</Col>
                        <Col xs={12} lg={20}>
                            <TextArea placeholder='변경 사항이 있으면 최대한 자세하게 적어주세요.(데이터 변경 쪽수, 변경하기 원하는 사양에 대한 정보 등)' />
                        </Col>
                    </Row>
                ) : (
                    <Row className="table">
                        <Col xs={12} lg={4} className="label">상품</Col>
                        <Col xs={12} lg={20}>[상품코드]상품명(공식) / 상품명(내부용)</Col>
                        <Col xs={12} lg={4} className="label">현재 쇄</Col>
                        <Col xs={12} lg={20}>2쇄</Col>
                        <Col xs={12} lg={4} className="label">재쇄 검토 요청</Col>
                        <Col xs={12} lg={8}>김명자 / 2023.08.01</Col>
                        <Col xs={12} lg={4} className="label">편집 확인</Col>
                        <Col xs={12} lg={8}>홍길동 / 2023.08.02</Col>
                        <Col xs={12} lg={4} className="label">편집 마감 예정일 <span className='spanStar'>*</span></Col>
                        <Col xs={12} lg={8}>
                            <DatePicker />
                        </Col>
                        <Col xs={12} lg={4} className="label">입고 요청일</Col>
                        <Col xs={12} lg={8}>2023.08.10</Col>
                        <Col xs={12} lg={4} className="label">발주 수량</Col>
                        <Col xs={12} lg={8}>1,000</Col>
                        <Col xs={12} lg={4} className="label">변경 범위
                            <Popover content={tooltipText}>
                                <Button
                                    shape="circle"
                                    icon={
                                        <QuestionOutlined
                                            style={{ fontSize: '11px' }}
                                        />
                                    }
                                    size="small"
                                    style={{ marginLeft: '5px' }}
                                />
                            </Popover>
                        </Col>
                        <Col xs={12} lg={8}>
                            <Checkbox>데이터 변경</Checkbox>
                            <Checkbox>사양 변경</Checkbox>
                        </Col>
                        <Col xs={12} lg={4} className="label">사양 변경 등 참고사항</Col>
                        <Col xs={12} lg={20}>
                            <TextArea placeholder='변경 사항이 있으면 최대한 자세하게 적어주세요.(데이터 변경 쪽수, 변경하기 원하는 사양에 대한 정보 등)' />
                        </Col>
                    </Row>
                )}

                <Row gutter={[10, 10]} justify='center' style={{marginTop: 30}}>
                    <Button type='primary' htmlType="button" style={{ marginLeft: '10px' }}>확인</Button>
                    <Button htmlType="button" style={{ marginLeft: '10px' }}>취소</Button>
                    <Button htmlType="button" style={{ marginLeft: '10px' }} onClick={showModal}>재쇄 취소</Button>
                </Row>

                <Modal title={null} visible={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                    <p>취소하면 되돌릴 수 없습니다. 재쇄를 취소하시겠습니까?</p>
                </Modal>
            </Drawer>
        </Wrapper>
    )
})

const GoodsGrid = () =>{
    const state ={
        list: [
            {   
                id: 0,
                productCode : 'GA0',
                productName : '상품명1 ',
                deadline:  new Date('2023-02-08'),
                range: '',
                workState: '',
            }
        ],
        idx: '',    
        grid:'',
        setGoods: null,
    };

    const initGrid = (grid) => {
        state.grid= grid;

        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.columnHeaders) {
                let html = e.cell.innerHTML;
                let col = s.columns[e.col];
                if(col.binding == 'chk'){
                    e.cell.classList.add("headCenter")
                }else{
                    if(html.split('\\n').length > 1){
                        e.cell.innerHTML = '<div class="v-center">' +html.split('\\n')[0] + "<br/>" + html.split('\\n')[1] + '</div>';

                    }else{
                        e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                    }
                }
            }

            if (e.panel == s.cells) {
                let item = s.rows[e.row].dataItem;
                let col = s.columns[e.col];
                switch (col.binding) {
                    case 'range':
                        let chkBox = `<input id="${col.binding+item.id}" type="checkbox" name= "${item.id}" >데이터 변경</input> `;
                        chkBox += `<input id="${col.binding+item.id}" type="checkbox" name= "${item.id}" >사양 변경</input>`;
                        e.cell.innerHTML = chkBox;
                        break;
                    case 'workState':
                        e.cell.innerHTML = '<button class="btnText blueTxt">전체 적용</button>'
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                switch (e.target.id) {
                    case 'btnLink':
                        break;
                }
            }
        });
    }

    return(
        <Row className='gridWrap'>
            <FlexGrid
                itemsSource={state.list} 
                initialized={(s) => initGrid(s)}
                headersVisibility="Column"
                autoRowHeights={true}
                showMarquee={true}
                alternatingRowStep={0}
                selectionMode="MultiRange"
            >
                <FlexGridColumn header='상품 코드' binding='productCode' width={100} />
                <FlexGridColumn header='상품명' binding='productName'width="*" minWidth={120} />
                <FlexGridColumn header='편집 마감 예정일' binding='deadline' width={150} format="d" editor={new InputDate(document.createElement('div'))}/> 
                <FlexGridColumn header='변경 범위' binding='range' width={220} />
                <FlexGridColumn header='작업' binding='workState' width={100} />
            </FlexGrid>
        </Row>
    );
}


export default index;