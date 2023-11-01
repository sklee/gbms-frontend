/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useContext, useEffect, useRef } from 'react';
import { Button, Row, Col } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import moment from 'moment';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { tabCloseContext } from '../viewContracts';

const Wrapper = styled.div`
    width: 100%;    
    `;
const ContractsDrawer = ({type,states,contInfo,data,onClose}) => {
    const onTabClose = useContext(tabCloseContext)
    const state = useLocalStore(() => ({
        type: '',               //api 타입           
        sel_type : '',          //저작권 구분
        states : '',            //상태 (등록,수정,조회 etc)
        brokers : [],           //중개자 정보
        drawerback : 'drawerWrap',
    }));
    
    useEffect(() => {       
        state.type= type;
        state.states= states;
    }, [type]);

    const handleTabClose = () => {
        onTabClose(false)
    }

    const componentRef = useRef(null);

    const handleDownloadPDF2 = () => {
        const input = componentRef.current;

        const pdfWidth = 595.28;
        const pdfHeight = 841.89;

        const scale = Math.min((pdfWidth) / input.offsetWidth, (pdfHeight-80),input.offsetHeight)

        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'pt', [pdfWidth, pdfHeight]);
            pdf.addImage(imgData, 'PNG', 0, 0, input.offsetWidth*scale, input.offsetHeight*scale);

            pdf.save('document.pdf');
        });
    };

    // 페이지 추가 기능 테스트
    const handleDownloadPDF3 = () => {
        const input = componentRef.current;

        const pdfWidth = 595.28;
        const pdfHeight = 841.89;
        const marginBottom = 80;

        html2canvas(input).then(async (canvas) => {
            const totalHeight = canvas.height;
            const scale = pdfWidth / input.offsetWidth;
            const initialYOffset = 0;

            let yOffset = initialYOffset;

            while (yOffset < totalHeight) {
                const remainingHeight = totalHeight - yOffset;
                const pageHeight = Math.min(pdfHeight - marginBottom, remainingHeight);
                const imgData = canvas.toDataURL('image/png');

                const pdf = new jsPDF('p', 'pt', [pdfWidth, pdfHeight]);
                pdf.addImage(imgData, 'PNG', 0, -yOffset, pdfWidth, totalHeight, null, 'NONE');

                pdf.save(`document_page_${yOffset / pdfHeight}.pdf`);
                yOffset += pageHeight;
            }
        });
    };

    //다수 페이지의 pdf 생성이 제대로 안 됨
    //일단 보류
    const handleDownloadPDF = () => {
        const input = componentRef.current;

        const pdfWidth = 595.28;
        const pdfHeight = 841.89;

        html2canvas(input).then(async (canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const scale = pdfWidth / input.offsetWidth;
            const scaleHeight = input.offsetHeight * (pdfWidth / 1200)

            const pdf = new jsPDF('p', 'pt', [pdfWidth, pdfHeight]);

            let offsetY = 0;
            while (offsetY < scaleHeight) {
                const remainingHeight = scaleHeight - offsetY;
                const currentHeight = remainingHeight > pdfHeight ? pdfHeight : remainingHeight;
                console.log(remainingHeight,currentHeight)

                pdf.addImage(imgData, 'PNG', 0, offsetY, input.offsetWidth * scale, currentHeight);
                // pdf.addImage(imgData, 'PNG', 0, -currentPage * maxPageHeight, input.offsetWidth * scale, currentHeight);
                offsetY += currentHeight;
                if (offsetY < scaleHeight) {
                    pdf.addPage();
                }
            }

            pdf.save('document.pdf');
        });
    };

    return (
        <>
            <Wrapper className='pdf' ref={componentRef} style={{minWidth: 595, minHeight: 841, padding: 40}}>
                    <Row gutter={10} className="table">
                        <Col className='title' span={10} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10}}>
                            <h2 className='fontBold'>저작권 계약 해지<br/> 처리 보고서</h2>
                        </Col>
                        <Col span={14} className='innerCol'>
                            <Row>
                                <Col span={6} className='innerCol'>
                                    <Col span={24} className="label">담당</Col>
                                    <Col span={24}></Col>
                                </Col>
                                <Col span={6} className='innerCol'>
                                    <Col span={24} className="label">팀장</Col>
                                    <Col span={24}></Col>
                                </Col>
                                <Col span={6} className='innerCol'>
                                    <Col span={24} className="label">실장</Col>
                                    <Col span={24}></Col>
                                </Col>
                                <Col span={6} className='innerCol'>
                                    <Col span={24} className="label">본부장</Col>
                                    <Col span={24}></Col>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row gutter={10} className="table marginUD">
                        <Col xs={24} lg={24} className="addLabel" >계약 정보</Col>
                        <Col xs={6} lg={6} className="label">
                            계약 담당자
                        </Col>
                        <Col xs={18} lg={18}>
                            {contInfo.created_name}
                        </Col>
                        <Col xs={6} lg={6} className="label">
                            계약명(계약코드)
                        </Col>
                        <Col xs={18} lg={18}>
                            {contInfo.name}({contInfo.contract_code})
                        </Col>
                        <Col xs={6} lg={6} className="label">
                            계약 등록일
                        </Col>
                        <Col xs={18} lg={18}>
                            {contInfo.created_at}
                        </Col>
                        <Col xs={6} lg={6} className="label">
                            저작권자
                        </Col>
                        <Col xs={18} lg={18}>
                            {contInfo.copyright_name}
                        </Col>
                        <Col xs={6} lg={6} className="label">
                            저작권 대상
                        </Col>
                        <Col xs={18} lg={18}>
                            {contInfo.ranges}
                        </Col>
                        <Col xs={6} lg={6} className="label">
                            계약 범위
                        </Col>
                        <Col xs={18} lg={18}>
                            {contInfo.targets}
                        </Col>
                    </Row>

                    <Row gutter={10} className="table">
                        <Col xs={24} lg={24} className="addLabel" >해지 관련 사항</Col>
                        <Col xs={6} lg={6} className="label">
                            해지 적용일
                        </Col>
                        <Col xs={18} lg={18}>
                            {data.end_date ? moment(data.end_date).format('YYYY-MM-DD') : ''}
                        </Col>
                        <Col xs={6} lg={6} className="label">
                            해지 책임(귀속)
                        </Col>
                        <Col xs={18} lg={18}>
                            {data.type === "1" ? '본사' : null}
                            {data.type === "2" ? '저작권자' : null}
                            {data.type === "3" ? '공동/합의' : null}
                        </Col>
                        <Col xs={6} lg={6} className="label">
                            저작권료/비용 정산
                        </Col>
                        <Col xs={18} lg={18}>
                            {data.settlement_copyright_fee_type === "1" ? '지급한 금액 손실 처리' : null}
                            {data.settlement_copyright_fee_type === "2" ? '본사가 지급할 금액 있음' : null}
                            {data.settlement_copyright_fee_type === "3" ? '본사가 회수할 금액 있음' : null}
                            {data.settlement_copyright_fee_type === "4" ? '정산할 금액 없음' : null}
                        </Col>
                        <Col xs={6} lg={6} className="label">
                            해지 사유
                        </Col>
                        <Col xs={18} lg={18}>
                            {/* {data.reason_memo} */}
                            {data.reason_memo.split("\n").map((e,index)=>{
                                return (index===0?e : <><br/>{e}</>) 
                            })}
                        </Col>
                        <Col xs={6} lg={6} className="label">
                            진행 경과
                        </Col>
                        <Col xs={18} lg={18}>
                            {/* {data.progress_memo} */}
                            {data.progress_memo.split("\n").map((e,index)=>{
                                return (index===0?e : <><br/>{e}</>) 
                            })}
                        </Col>
                        <Col xs={6} lg={6} className="label" style={{height: 'auto'}}>
                            손실 처리할 금액과<br/>세부 내역
                        </Col>
                        <Col xs={18} lg={18} style={{display: 'flex', height: 'auto', alignItems: 'center'}}>
                            <p style={{margin: 0}}>{data.loss_price}원</p><br/>
                            {data.detail_memo.split("\n").map((e,index)=>{
                                return (index===0?e : <><br/>{e}</>) 
                            })}
                        </Col>
                    </Row>

                    <div className='ref_desc' style={{marginTop: 20}}>
                        <p style={{margin: 0}}>* 결재 후 담당자는 아래 작업을 꼭 진행해 주세요.</p>
                        <p style={{margin: '0 0 0 10px'}}> - 저작권 계약 화면에서 해지 확정으로 변경하고, 결재 문서를 재무지원팀에 제출</p>
                        <p style={{margin: '0 0 0 10px'}}> - 해지 계약서를 ‘계약서 파일과 참고사항'에 등록</p>
                    </div>
            </Wrapper>

            <Button style={{margin: '20 0 0 50'}} onClick={handleDownloadPDF}>Download as PDF</Button>
        </>
    );
};

export default ContractsDrawer;