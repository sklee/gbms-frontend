import React, { useState } from 'react'
import { Row, Col, Button, Space, Modal } from 'antd'

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { observer, useLocalStore } from 'mobx-react';

const previewOrder = observer((props) => {
    return (
        <>
            <Row gutter={10} className="table">
                <Col xs={14} lg={14} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <h3>(주)도서출판 길벗 - 제작 발주서</h3>
                </Col>
                <Col xs={10} lg={10} style={{display: 'flex', flexWrap: 'wrap', border: 0}} className='innerCol'>
                    <div className="ant-col label ant-col-xs-24 ant-col-lg-6">편집 담당</div>
                    <div className="ant-col ant-col-xs-24 ant-col-lg-18">홍길동 / 02-330-9876 / 010-1234-1234</div>
                    <div className="ant-col label ant-col-xs-24 ant-col-lg-6">제작 담당</div>
                    <div className="ant-col ant-col-xs-24 ant-col-lg-18">손일순 / 02-330-9761 / 010-2657-8160</div>
                </Col>
            </Row>

            <div style={{margin: '20px 0'}}>
                <Row gutter={10} className="table" >
                    <Col xs={12} lg={2} className="label">상품코드</Col>
                    <Col xs={12} lg={2}>BO1A2B</Col>
                    <Col xs={12} lg={2} className="label">상품명</Col>
                    <Col xs={12} lg={4}>2023 시나공 정보처리기능사 필기</Col>
                    <Col xs={12} lg={2} className="label">기본 판형</Col>
                    <Col xs={12} lg={3}>46배 변형</Col>
                    <Col xs={12} lg={2} className="label">크기</Col>
                    <Col xs={12} lg={3}>188*243mm</Col>
                    <Col xs={12} lg={2} className="label">쇄</Col>
                    <Col xs={12} lg={2}>2쇄-1</Col>
                    <Col xs={12} lg={2} className="label">발주 수량</Col>
                    <Col xs={12} lg={2}>4,000</Col>
                    <Col xs={12} lg={2} className="label">구성방식</Col>
                    <Col xs={12} lg={4}>본책+별책(분리형 책속의 책)&lt;2권용&gt;</Col>
                    <Col xs={12} lg={2} className="label">발주일</Col>
                    <Col xs={12} lg={3}>2023.05.13</Col>
                    <Col xs={12} lg={2} className="label">편집 마감 예정일</Col>
                    <Col xs={12} lg={3}>188*243mm</Col>
                    <Col xs={12} lg={2} className="label">창고 입고 요청일</Col>
                    <Col xs={12} lg={2}>2023.05.25</Col>
                </Row>
            </div>
            <PaperGrid />
            <div style={{margin: '20px 0'}}>
                <PrintGrid />
            </div>
            <BookbindingGrid />
            <div style={{margin: '20px 0'}}>
                <PostprocessGrid />
            </div>
            <PackingGrid />
            <div style={{margin: '20px 0'}}>
                <InsertGrid />
            </div>        
            <Row gutter={10} className="table marginTop">
                <div className="table_title">
                    <h4>주의/요청사항</h4>
                </div>
                <Col xs={24} lg={24}>
                    1. 작업 후 샘플 1부 보내주세요.
                </Col>
            </Row>
            <Row gutter={10} justify="center" style={{margin: '20px 0'}}>
                <Button htmlType="button">엑셀 다운로드</Button>
            </Row>
        </>
        
      );
})

const PaperGrid = () =>{
    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                composition: '본책',
                prdComp: '한솔피엔에스',
                vendor: '금강인쇄',
                class: '표지',
                detail:{
                    printing:'도수(5/4)',
                    pages: '쪽수(2)'
                },
                printPaper: {
                    paper: '250g(한솔제지) 백색 S/W',
                    size: '939*636(횡)'
                },
                paperCont: 2,
                spare: 0.5,
                paperCnt: 2.5,
                message: '',
            },
            {
                id: 2,
                composition: '본책',
                prdComp: '한솔피엔에스',
                vendor: '금강인쇄',
                class: '본문',
                detail:{
                    printing:'도수(4/4)',
                    pages: '쪽수(16'
                },
                printPaper: {
                    paper: '80g(한솔제지) 백색 플러스',
                    size: '788*520(횡)'
                },
                paperCont: 8,
                spare: 0.5,
                paperCnt: 8.5,
                message: '',
            },
            {
                id: 3,
                composition: '본책',
                prdComp: '한솔피엔에스',
                vendor: '금강인쇄',
                class: '본문',
                detail:{
                    printing:'도수(2/2)',
                    pages: '쪽수(384)'
                },
                printPaper: {
                    paper: '70g(한솔제지) 백색 플러스',
                    size: '788*545(횡)'
                },
                paperCont: 192,
                spare: 9.5,
                paperCnt: 201.5,
                message: '',
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
                    case 'detail':
                        let box = `
                            <div>${item.detail.printing}</div>
                            <div>${item.detail.pages}</div>
                        `;
                        e.cell.innerHTML = box;
                        break;
                    case 'printPaper':
                        let box1 = `
                            <div>${item.printPaper.paper}</div>
                            <div>${item.printPaper.size}</div>
                        `;
                        e.cell.innerHTML = box1;
                        break;
                }
            }
        });
    };
    return (
        <Row className="table marginTop">
            <div className="table_title">
                <h4>1. 종이</h4>
            </div>
            <FlexGrid
                itemsSource={state.list}
                initialized={(s) => initGrid(s)}
                autoRowHeights={true}
                allowSorting={false}
                selectionMode="None"
                allowMerging="Cells"
                headersVisibility="Column" 
            >
                <FlexGridColumn header="기본 구성" binding="composition" width={100} align="left" allowMerging={true}/>
                <FlexGridColumn header="제작처(지업사)" binding="prdComp" width={150} align="left"/>
                <FlexGridColumn header="납품처" binding="vendor" width={120} align="left"/>
                <FlexGridColumn header="구분" binding="class" width={100} align="left"/>
                <FlexGridColumn header="도수/쪽수" binding="detail" width={120} align="left"/>
                <FlexGridColumn header="인쇄 종이(지종)" binding="printPaper" width="*" minWidth={150} align="left"/>
                <FlexGridColumn header="종이 정미" binding="paperCont" width={100} align="center"/>
                <FlexGridColumn header="여분+조정" binding="spare" width={100} align="center"/>
                <FlexGridColumn header="종이 수량" binding="paperCnt" width={100} align="center"/>
                <FlexGridColumn header="전달 사항" binding="message" width={150} align="center"/>
            </FlexGrid>
        </Row>
    )
}

const PrintGrid = () =>{
    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                composition: '본책',
                prdComp: '금강인쇄',
                vendor: '경문제책사',
                class: '표지',
                fullSize: '391*243',
                backBook: '15',
                standard: '국반절/2판',
                detail:{
                    printing:'도수(5/4)',
                    pages: '쪽수(2)'
                },
                printPaper: {
                    paper: '250g(한솔제지) 백색',
                    size: 'S/W 939*636(횡)'
                },
                request_at:'2023.05.15',
                ref: {
                    first: '표지 별색',
                    sec: '국반절/2판으로 인쇄입니다.',
                    third: '수정 있습니다.'
                },
            }
        ],
    }));

    const initGrid = (grid) => {
        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
                let col = s.columns[e.col];
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' +html.split('\\n')[0] + "<br/>" + html.split('\\n')[1] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                // create buttons for items not being edited
                switch (col.binding) {
                    case 'detail':
                        let box = `
                            <div>${item.detail.printing}</div>
                            <div>${item.detail.pages}</div>
                        `;
                        e.cell.innerHTML = box;
                        break;
                    case 'printPaper':
                        let box1 = `
                            <div>${item.printPaper.paper}</div>
                            <div>${item.printPaper.size}</div>
                        `;
                        e.cell.innerHTML = box1;
                        break;
                    case 'ref':
                        let cnt = 0;
                        let box2 = '';
                        for(let key in item.ref){
                            cnt++;
                            box2 += `<div>${cnt}. ${item.ref[key]}</div>`
                        }
                        e.cell.innerHTML = box2;
                        break;
                }
                
            }
        });
    };
    return (
        <Row className="table marginTop">
            <div className="table_title">
                <h4>2. 인쇄</h4>
            </div>
            <FlexGrid
                itemsSource={state.list}
                initialized={(s) => initGrid(s)}
                autoRowHeights={true}
                selectionMode="None"
                headersVisibility="Column" 
            >
                <FlexGridColumn header="기본 구성" binding="composition" width={100} align="left"/>
                <FlexGridColumn header="제작처(인쇄소)" binding="prdComp" width={150} align="left"/>
                <FlexGridColumn header="납품처" binding="vendor" width={120} align="left"/>
                <FlexGridColumn header="구분" binding="class" width={150} align="left"/>
                <FlexGridColumn header="전체 크기\n(mm)" binding="fullSize" width={100} align="center"/>
                <FlexGridColumn header="책등\n(mm)" binding="backBook" width={80} align="center"/>
                <FlexGridColumn header="규격\n(판걸이 설명)" binding="standard" width={100} align="center"/>
                <FlexGridColumn header="도수/쪽수" binding="detail" width={100} align="left"/>
                <FlexGridColumn header="인쇄 종이(지종)" binding="printPaper" width={150} align="left"/>
                <FlexGridColumn header="인쇄 완료\n요청일" binding="request_at" width={100} align="center"/>
                <FlexGridColumn header="전달 사항" binding="ref" width="*" minWidth={150} align="left"/>
            </FlexGrid>
        </Row>
    )
}

const BookbindingGrid = () =>{
    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                composition: '본책',
                prdComp: '경문제책사',
                vendor: '라임북',
                bindingSystem: '분리용 좌철문선제본',
                contPage: '400',
                endPaper: '있음',
                wing: '없음',
                Additional: `별책 1개 분권작업(분권형 책속의책) ▶ 1 간지 접지작업 ▶ 1 간지(접지포함) 같이제본 ▶ 1`,
                ref: {
                    first: '분리형 책속의 책 입니다.',
                    sec: '삼방재단시 2권씩 재단해야합니다.(책등 터짐으로인해)',
                    third: '검정댐지 중으로 포장해주세요.'
                },
            }
        ],
    }));

    const initGrid = (grid) => {
        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                // create buttons for items not being edited
                switch (col.binding) {
                    case 'ref':
                        let cnt = 0;
                        let box = '';
                        for(let key in item.ref){
                            cnt++;
                            box += `<div>${cnt}. ${item.ref[key]}</div>`
                        }
                        e.cell.innerHTML = box;
                        break;
                }
                
            }
        });
    };
    return (
        <Row className="table marginTop">
            <div className="table_title">
                <h4>3. 제본</h4>
            </div>
            <FlexGrid
                itemsSource={state.list}
                initialized={(s) => initGrid(s)}
                autoRowHeights={true}
                selectionMode="None"
                headersVisibility="Column" 
            >
                <FlexGridColumn header="기본 구성" binding="composition" width={100} align="left"/>
                <FlexGridColumn header="제작처(제본소)" binding="prdComp" width={150} align="left"/>
                <FlexGridColumn header="납품처" binding="vendor" width={120} align="left"/>
                <FlexGridColumn header="제본 방식" binding="bindingSystem" width={150} align="left" wordWrap={true}/>
                <FlexGridColumn header="본문 쪽수" binding="contPage" width={100} align="center"/>
                <FlexGridColumn header="면지" binding="endPaper" width={80} align="center"/>
                <FlexGridColumn header="날개" binding="wing" width={100} align="center"/>
                <FlexGridColumn header="제본 추가작업" binding="Additional" width={150} align="left" wordWrap={true}/>
                <FlexGridColumn header="전달 사항" binding="ref" width="*" minWidth={150} align="left"/>
            </FlexGrid>
        </Row>
    )
}

const PostprocessGrid = () =>{
    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                composition: '본책',
                division: '표지',
                process: '박인쇄(일반)',
                prdComp: '대명금박',
                vendor: '금강인쇄',
                print: 2,
                amount: 4000,
                ref: {
                    first: '박NO : 260T투명홀로',
                },
            }
        ],
    }));

    const initGrid = (grid) => {
        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                // create buttons for items not being edited
                switch (col.binding) {
                    case 'ref':
                        let cnt = 0;
                        let box = '';
                        for(let key in item.ref){
                            cnt++;
                            box += `<div>${cnt}. ${item.ref[key]}</div>`
                        }
                        e.cell.innerHTML = box;
                        break;
                }
                
            }
        });
    };
    return (
        <Row className="table marginTop">
            <div className="table_title">
                <h4>4. 후가공</h4>
            </div>
            <FlexGrid
                itemsSource={state.list}
                initialized={(s) => initGrid(s)}
                autoRowHeights={true}
                selectionMode="None"
                headersVisibility="Column" 
            >
                <FlexGridColumn header="기본 구성" binding="composition" width={100} align="left"/>
                <FlexGridColumn header="구분" binding="division" width={150} align="left"/>
                <FlexGridColumn header="공정" binding="process" width={120} align="left"/>
                <FlexGridColumn header="제작처" binding="prdComp" width={150} align="left"/>
                <FlexGridColumn header="납품처" binding="vendor" width={120} align="left"/>
                <FlexGridColumn header="인쇄 정미" binding="print" width={150} align="left" wordWrap={true}/>
                <FlexGridColumn header="후가공 수량" binding="amount" width={100} align="center"/>
                <FlexGridColumn header="전달 사항" binding="ref" width="*" minWidth={150} align="left"/>
            </FlexGrid>
        </Row>
    )
}

const PackingGrid = () =>{
    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                process: '랩핑 작업(도서. 46배판 이상)',
                prdComp: '유진인터내셔널',
                vendor: '유진인터내셔널',
                amount: 3000,
                ref: {
                    first: '랩핑 한 위에 스티커(바코드)부착있습니다.',
                    sec: '스티커(바코드)는 길벗에서 제공합니다.'
                },
            }
        ],
    }));

    const initGrid = (grid) => {
        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                // create buttons for items not being edited
                switch (col.binding) {
                    case 'ref':
                        let cnt = 0;
                        let box = '';
                        for(let key in item.ref){
                            cnt++;
                            box += `<div>${cnt}. ${item.ref[key]}</div>`
                        }
                        e.cell.innerHTML = box;
                        break;
                }
                
            }
        });
    };
    return (
        <Row className="table marginTop">
            <div className="table_title">
                <h4>5. 포장</h4>
            </div>
            <FlexGrid
                itemsSource={state.list}
                initialized={(s) => initGrid(s)}
                autoRowHeights={true}
                selectionMode="None"
                headersVisibility="Column" 
            >
                <FlexGridColumn header="공정" binding="process" width={180} align="left"/>
                <FlexGridColumn header="제작처" binding="prdComp" width={150} align="left"/>
                <FlexGridColumn header="납품처" binding="vendor" width={150} align="left"/>
                <FlexGridColumn header="작업 수량" binding="amount" width={100} align="center"/>
                <FlexGridColumn header="전달 사항" binding="ref" width="*" minWidth={150} align="left"/>
            </FlexGrid>
        </Row>
    )
}

const InsertGrid = () =>{
    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                process: 'CD 제작',
                prdComp: '와이알미디어',
                vendor: '경문제책사',
                amount: 3050,
                ref: {},
            }
        ],
    }));

    const initGrid = (grid) => {
        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                // create buttons for items not being edited
                switch (col.binding) {
                    case 'ref':
                        let cnt = 0;
                        let box = '';
                        for(let key in item.ref){
                            cnt++;
                            box += `<div>${cnt}. ${item.ref[key]}</div>`
                        }
                        e.cell.innerHTML = box;
                        break;
                }
                
            }
        });
    };
    return (
        <Row className="table marginTop">
            <div className="table_title">
                <h4>6. 부속제작</h4>
            </div>
            <FlexGrid
                itemsSource={state.list}
                initialized={(s) => initGrid(s)}
                autoRowHeights={true}
                selectionMode="None"
                headersVisibility="Column" 
            >
                <FlexGridColumn header="공정" binding="process" width={180} align="left"/>
                <FlexGridColumn header="제작처" binding="prdComp" width={150} align="left"/>
                <FlexGridColumn header="납품처" binding="vendor" width={150} align="left"/>
                <FlexGridColumn header="작업 수량" binding="amount" width={100} align="center"/>
                <FlexGridColumn header="전달 사항" binding="ref" width="*" minWidth={150} align="left"/>
            </FlexGrid>
        </Row>
    )
}

export default previewOrder;