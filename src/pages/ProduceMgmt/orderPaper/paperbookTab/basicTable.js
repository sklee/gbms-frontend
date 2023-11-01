import React, { useState } from 'react'
import { Row, Col, Button, Input, DatePicker, Popover } from 'antd'
import { DownOutlined } from '@ant-design/icons';

import { observer, useLocalStore } from 'mobx-react';
import * as wjInput from '@grapecity/wijmo.react.input';
import { CollectionView } from '@grapecity/wijmo';

import ChkProduct from './chkProduct'; // 상품 검색

import Priority from './view/priority'; // 우선 순위
import Fabrication from './view/Fabrication'; // 제작상태
import Order from './view/order'; // 제작 발주

import Reprinting from './view/reprinting';
import Accident from './view/accident';

const index = observer((props) => {
    const state = useLocalStore(() => ({
        searchedProduct:{
            code: null,
            name: null,
            id: null,
        },
        option:[
            {id: 0, name: 0}
        ]
    }));

    const [chkProduct, setChkProduct] = useState(false);
    const chkProDrawer = () => { setChkProduct(true); };
    const chkProOnClose = () => { setChkProduct(false); };

    const btnDel = () => {
        state.searchedProduct.code = null;
        state.searchedProduct.name = null;
        state.searchedProduct.id = null;
        state.connection_type= null;
    }

    const searchedProduct = (code, name, id) => {
        state.searchedProduct.code = code;
        state.searchedProduct.name = name;
        state.searchedProduct.id = id;
    }

    const [ accValue, setAccValue ] = useState(true);

    const accordionToggle = (event) =>{
        let tableEl = event.target.parentNode;
        setAccValue( prev => !prev );
        if(tableEl.classList.contains('on')){
            tableEl.classList.remove('on');
        } else {
            tableEl.classList.add('on');
        }
    }

    const [ fabDrawer, setFabDrawer ] = useState(false);
    const [ priorityDrawer, setPriorityDrawer ] = useState(false);
    const [ orderDrawer, setOrderDrawer ] = useState(false);
    const [ reprintingDrawer, setReprintingDrawer ] = useState(false);
    const [ accidentDrawer, setAccidentDrawer ] = useState(false);

    const drawerOpen = (type) =>{
        if(type == 'fabrication'){
            setFabDrawer(true);
        } else if(type == 'priority'){
            setPriorityDrawer(true);
        } else if(type == 'order'){
            setOrderDrawer(true);
        } else if(type == 'reprinting') {
            setReprintingDrawer(true);
        } else if(type == 'accident'){
            setAccidentDrawer(true);
        }
    }
    const drawerClose = (type) =>{
        if(type == 'fabrication'){
            setFabDrawer(false);
        } else if(type == 'priority'){
            setPriorityDrawer(false);
        } else if(type == 'order'){
            setOrderDrawer(false);
        } else if(type == 'reprinting') {
            setReprintingDrawer(false);
        } else if(type == 'accident'){
            setAccidentDrawer(false);
        }
    }

    const tooltipText =(
        <div>
            <p>공급가는 상품 귀속 부서의 평균 공급가를 표시합니다.</p>
        </div>
    );
    const tooltipText1 =(
        <div>
            <p>정확한 제작비는 정산이 끝나야 확정됩니다. <br />구분을 위해 정산 전에는 푸른색으로 표시합니다.</p>
        </div>
    );


    return (
        <>
            <Row gutter={10} className="table">
                <Col xs={24} lg={3} className="label">상품 <span className="spanStar">*</span></Col>
                <Col xs={24} lg={11}>
                    {state.searchedProduct.name === null ? (
                        <Button className="btn btn-primary btn_add" shape="circle" onClick={(event)=>{chkProDrawer()}}>+</Button>
                    ) : (
                        <div>[{state.searchedProduct.code}]{state.searchedProduct.name}<Button shape="circle" className="btn_del" onClick={(event) => btnDel()}>X</Button></div>
                    )}
                </Col>
                <Col xs={24} lg={3} className="label">판/쇄 <span className="spanStar">*</span></Col>
                <Col xs={24} lg={7}>
                    <span>초판 / <Input style={{width: 50}}/> 쇄 (표기 <Input style={{width: 50}}/>)</span>
                </Col>
            </Row>

            <div style={{margin: '30px 0'}}>
                <Row gutter={10} className="table on">
                    <Col xs={24} lg={24} className="addLabel acc_btn" onClick={(event) => accordionToggle(event)}>
                        등록, 검토 정보 <DownOutlined />
                    </Col>
                    <div className="acc_cont" style={{display: 'flex', flexWrap: 'wrap', padding: 0, border: 0}}>
                        <Col xs={12} lg={2} className="label">상품 종류</Col>
                        <Col xs={12} lg={3}>종이책(단권)</Col>
                        <Col xs={12} lg={2} className="label">부서</Col>
                        <Col xs={12} lg={3}>수험서팀</Col>

                        <Col xs={12} lg={2} className="label">등록자</Col>
                        <Col xs={12} lg={2}>홍길동</Col>

                        <Col xs={12} lg={2} className="label">편집 담당자 <span className="spanStar">*</span></Col>
                        <Col xs={12} lg={3}><Input /></Col>
                        <Col xs={12} lg={2} className="label">제작 담당자 <span className="spanStar">*</span></Col>
                        <Col xs={12} lg={3}><Input /></Col>

                        <Col xs={12} lg={2} className="label">편집 마감 예정일 <span className="spanStar">*</span></Col>
                        <Col xs={12} lg={3}><DatePicker /></Col>
                        <Col xs={12} lg={2} className="label">입고 요청일 <span className="spanStar">*</span></Col>
                        <Col xs={12} lg={3}><DatePicker /></Col>

                        <Col xs={12} lg={2} className="label">발주 수량 <span className="spanStar">*</span></Col>
                        <Col xs={12} lg={2}><Input /></Col>

                        <Col xs={12} lg={2} className="label">등록 시 재고 수량</Col>
                        <Col xs={12} lg={3}>532</Col>
                        <Col xs={12} lg={2} className="label">등록 시 재고 소진일</Col>
                        <Col xs={12} lg={3}>5.7</Col>
                    </div>
                </Row>
            </div>

            <Row gutter={10} className="table on">
                <Col xs={24} lg={24} className="addLabel acc_btn" onClick={(event) => accordionToggle(event)} style={{ position: "relative"}}>
                    <div
                        style={{
                            position: "absolute",
                            top: 10,
                            right: 10
                        }}
                    >
                        <button className='btnLink' onClick={()=>{drawerOpen('priority')}}>우선 순위 : 3</button>
                    </div>
                    제작, 입고, 비용 정보 <DownOutlined />
                </Col>
                <div className="acc_cont" style={{display: 'flex', flexWrap: 'wrap', padding: 0, border: 0}}>
                    <Col xs={12} lg={3} className="label">제작 구분</Col>
                    <Col xs={12} lg={3}>
                        <wjInput.ComboBox
                            placeholder="선택"
                            itemsSource={new CollectionView(state.option, {
                                currentItem: null
                            })}
                            selectedValuePath="id"
                            displayMemberPath="name"
                            valueMemberPath="id"
                            // selectedValue={stateData.work_state}
                            // textChanged={handleChangeInput('work_state')}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={12} lg={3} className="label">제작 상태</Col>
                    <Col xs={12} lg={3}>
                        <button className='btnLink' onClick={()=>(drawerOpen('fabrication'))}>제작팀장 확인 대기</button>
                    </Col>
                    <Col xs={12} lg={3} className="label">제작처(인쇄) <span className="spanStar">*</span></Col>
                    <Col xs={12} lg={3}>
                        {/* <Select style={{width : '100%'}} placeholder="선택">
                            <Option value="Option1">Option1</Option>
                        </Select> */}
                        <wjInput.ComboBox
                            placeholder="선택"
                            itemsSource={new CollectionView(state.option, {
                                currentItem: null
                            })}
                            selectedValuePath="id"
                            displayMemberPath="name"
                            valueMemberPath="id"
                            // selectedValue={stateData.work_state}
                            // textChanged={handleChangeInput('work_state')}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={12} lg={3} className="label">제작처(제본) <span className="spanStar">*</span></Col>
                    <Col xs={12} lg={3}>
                        {/* <Select style={{width : '100%'}} placeholder="선택">
                            <Option value="Option1">Option1</Option>
                        </Select> */}
                        <wjInput.ComboBox
                            placeholder="선택"
                            itemsSource={new CollectionView(state.option, {
                                currentItem: null
                            })}
                            selectedValuePath="id"
                            displayMemberPath="name"
                            valueMemberPath="id"
                            // selectedValue={stateData.work_state}
                            // textChanged={handleChangeInput('work_state')}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={12} lg={3} className="label">상품 구성 방식 <span className="spanStar">*</span></Col>
                    <Col xs={12} lg={9}>
                        {/* <Select style={{width : '100%'}} placeholder="선택">
                            <Option value="Option1">Option1</Option>
                        </Select> */}
                        <wjInput.ComboBox
                            placeholder="선택"
                            itemsSource={new CollectionView(state.option, {
                                currentItem: null
                            })}
                            selectedValuePath="id"
                            displayMemberPath="name"
                            valueMemberPath="id"
                            // selectedValue={stateData.work_state}
                            // textChanged={handleChangeInput('work_state')}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={12} lg={3} className="label">최종 업데이트</Col>
                    <Col xs={12} lg={3}>2023.05.02. 15:30</Col>
                    <Col xs={12} lg={3} className="label">발주일</Col>
                    <Col xs={12} lg={3}>
                        <button className='btnLink' onClick={()=>(drawerOpen('order'))}>2023.05.02</button>
                    </Col>
                    <Col xs={12} lg={3} className="label">참고 사항</Col>
                    <Col xs={12} lg={9}><Input.TextArea style={{height: 70}}/></Col>
                    <Col xs={24} lg={12} style={{display: 'flex', flexWrap: 'wrap', padding: 0, border: 0}}>
                        <div className="ant-col ant-col-xs-12 ant-col-lg-6 label" style={{padding: '10px 5px'}}>창고 입고 요청일</div>
                        <div className="ant-col ant-col-xs-12 ant-col-lg-6" style={{padding: '10px 5px'}}>2023.05.20</div>
                        <div className="ant-col ant-col-xs-12 ant-col-lg-6 label" style={{padding: '10px 5px'}}>입고 예정일</div>
                        <div className="ant-col ant-col-xs-12 ant-col-lg-6" style={{padding: '10px 5px'}}><DatePicker /></div>
                        <div className="ant-col ant-col-xs-12 ant-col-lg-6 label" style={{padding: '10px 5px'}}>마지막 입고일</div>
                        <div className="ant-col ant-col-xs-12 ant-col-lg-6" style={{padding: '10px 5px'}}>2023.05.21</div>
                        <div className="ant-col ant-col-xs-12 ant-col-lg-6 label" style={{padding: '10px 5px'}}>입고 수량 합계</div>
                        <div className="ant-col ant-col-xs-12 ant-col-lg-6" style={{padding: '10px 5px'}}>3,100</div>
                    </Col>
                    <Col xs={12} lg={3} className="label">
                        정가/공급가
                        <Popover content={tooltipText}>
                            <Button
                                shape="circle"
                                size="small"
                                className="btn_popover"
                                style={{ marginLeft: '5px' }}
                            >?</Button>
                        </Popover>
                    </Col>
                    <Col xs={12} lg={3}>15,000/9,000</Col>
                    <Col xs={12} lg={3} className="label">
                        제작비
                        <Popover content={tooltipText1}>
                            <Button
                                shape="circle"
                                size="small"
                                className="btn_popover"
                                style={{ marginLeft: '5px' }}
                            >?</Button>
                        </Popover>
                    </Col>
                    <Col xs={12} lg={3}>9,000,000</Col>
                    <Col xs={12} lg={3} className="label">상품당 제작비</Col>
                    <Col xs={12} lg={3}>3,000</Col>
                    <Col xs={12} lg={3} className="label">제작비 비율</Col>
                    <Col xs={12} lg={3}>20%</Col>
                </div>
            </Row>

            <Row gutter={10} justify="center" style={{ padding: "30px 0 50px" }}>
                <Col>
                    <Button
                        type="primary"
                        htmlType="button"
                        style={{ marginLeft: '10px' }}
                    >
                        확인
                    </Button>
                    <Button  
                        htmlType="button"
                        style={{ marginLeft: '10px' }}
                    >
                        취소
                    </Button>
                    <Button  
                        type="primary"
                        htmlType="button"
                        style={{ marginLeft: '10px' }}
                    >
                        복사
                    </Button>
                    <Button  
                        type="primary"
                        htmlType="button"
                        style={{ marginLeft: '10px' }}
                        onClick={() => (drawerOpen('reprinting'))}
                    >
                        재쇄
                    </Button>
                    <Button 
                        type="primary"
                        htmlType="button"
                        style={{ marginLeft: '10px' }}
                        onClick={() => (drawerOpen('accident'))}
                    >
                        사고
                    </Button>
                    <Button  
                        danger
                        htmlType="button"
                        style={{ marginLeft: '10px' }}
                    >
                        삭제
                    </Button>
                </Col>
            </Row>
            
            { chkProduct === true &&
                <ChkProduct  
                    chkVisible={chkProduct}
                    chkProOnClose={chkProOnClose}
                    searchedProduct={searchedProduct}
                />           
            }
            {fabDrawer ? <Fabrication viewVisible={fabDrawer}  visibleClose={drawerClose}/> : ''}
            {priorityDrawer ? <Priority viewVisible={priorityDrawer}  visibleClose={drawerClose}/> : ''}
            {orderDrawer ? <Order viewVisible={orderDrawer}  visibleClose={drawerClose} drawerChk='Y'/> : ''}
            {reprintingDrawer ? <Reprinting viewVisible={reprintingDrawer}  visibleClose={drawerClose}/> : ''}
            {accidentDrawer ? <Accident viewVisible={accidentDrawer}  visibleClose={drawerClose} drawerChk='Y'/> : ''}
        </>
    );

});

export default index;

