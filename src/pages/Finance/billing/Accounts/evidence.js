/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Table, Space, Button, Row, Col, Modal, Input, Select, Typography, Drawer } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import axios from 'axios';
import styled from 'styled-components';
import useStore from '@stores/useStore';

const Wrapper = styled.div`
    width: 100%;
    `;

const DEF_STATE = {
    // DB Data
    details: [              // 증빙 상세(세금계산서)
        // {
        //     approval_no: '',    // 승인번호
        //     publisher: "",      // 공급/발행자
        //     person_no: "",      // 사업자 등록번호
        //     published_at: "",   // 발행/사용일
        //     item: "",           // 품목
        //     total_amount: ""    // 합계
        // }
    ],

};

const evidenceDrawer = observer(({ visible,onClose,evidenceData }) => {
    const { commonStore } = useStore();
    const { Text } = Typography;
    const { Title } = Typography;
    const { Option } = Select;
    const { Search } = Input;

    const stateData = useLocalStore(() => ({ ...DEF_STATE }));

    const state = useLocalStore(() => ({
        listData : [],
        firstItemName : '', //첫번째 품목명
        totalAmount : 0,    //승인번호조회 합계
        drawerback: 'drawerWrap'
    }));

    //승인번호조회시 합계 체크
    const [chkTotalPay, setChkTotalPay] = useState(true);
    

    //add evidenceList 값 넘기기
    const chkEvidencDataParent = ()=>{
        let chkVal = true;    
        if(stateData.details == '' || stateData.details == undefined){
            Modal.error({
                content: '승인번호 조회를 해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(chkVal == true){
            evidenceData(toJS(stateData))
            visibleClose()
        }
        
    }

    //drawer 닫기
    const visibleClose = () => {
        onClose();
    };

    const handleChangeEvidence = useCallback((type) => (e) => {
        if(type == 'taxNumber'){
            console.log('taxNumber',e.target.value.length)
            if(e.target.value.length ==24){
                fetch(e.target.value);
            }
        }else{
            // if(stateData[type] == 'type'){
            if(type === 'type'){
                if(e.target.value =='1' || e.target.value =='2' ||e.target.value =='3'){
                    stateData.files = [];
                    stateData.scope = '';
                    stateData.receipt_submission = '';
                    if(stateData.submission_timing === '1'){
                        setChkTotalPay(false);
                    }                    
                }else if(e.target.value =='4'){
                    stateData.details = [];
                    stateData.files = [];
                    stateData.scope = '';
                    if(stateData.submission_timing === '1'){
                        setChkTotalPay(true);
                    } 
                }else {
                    stateData.details = [];
                    stateData.files = [];
                    stateData.receipt_submission = '';
                    if(stateData.submission_timing === '1'){
                        setChkTotalPay(true);
                    } 
                }
            }     

            stateData[type] = e.target.value;
            // chkEvidencDataParent();
        }
       
    },[],);


    // 테이블
    const column = useMemo(() => [
        {
            title: '공급/발행자',
            dataIndex: 'invoicerCorpName',
            key:  'invoicerCorpName',
            render: (_, row) => <div style={{textAlign:'left'}}>{row.invoicerCorpName}</div>,
            align: 'center',
        },
        {
            title: '사업자등록번호',
            dataIndex: 'invoicerCorpNum ',
            key:  'invoicerCorpNum',
            render: (_, row) => <div style={{textAlign:'center'}}>{row.invoicerCorpNum}</div>,
            align: 'center',
        },
        {
            title: '발행/사용일',
            dataIndex:  'evidence_issueDate',
            key: 'evidence_issueDate',
            render: (_, row) => <div style={{textAlign:'center'}}>{row.issueDate}</div>,
            align: 'center',
        },
        {
            title: '품목',
            dataIndex: 'evidence_itemName',
            key: 'evidence_itemName',
            render: (_, row) => <div style={{textAlign:'left'}}>{state.listData.length > 1  ? state.firstItemName+' 외 '+state.listData.length+'건' : row.itemName}</div>,
            align: 'center',
        },
        {
            title: '합계',
            dataIndex: 'evidence_totalAmount',
            key: 'evidence_totalAmount',
            render: (_, row) => <div style={{textAlign:'right'}}>{row.totalAmount !='' && row.totalAmount != undefined ? commaNum(row.totalAmount) : ''}</div>,
            align: 'center',
        },    
    ],[state.listData],);
    
    const commaNum = (num) => {
        const number = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return number
    }

    const fetch = (value) => {

        if(value){           
            var axios = require('axios');

            var config = {
                method: 'GET',
                url:process.env.REACT_APP_API_URL +'/api/v1/tax-invoice/'+value,
                headers: {
                    Accept: 'application/json',
                },
            };
    
            axios(config)
            .then(function (result) {
                if (result.data.Taxinvoice !='' ) {
                    var data = result.data.Taxinvoice;
                    if(state.listData != '' && state.listData != undefined){
                        state.listData = [...state.listData, data];                        
                    }else{
                        state.listData = [data];
                        state.firstItemName = data.itemName ;
                    }    
                    stateData.details = [...stateData.details, 
                        { approval_no: data.ntsconfirmNum,publisher: data.invoicerCorpName,person_no: data.invoicerCorpNum,
                            published_at: data.issueDate,item: data.id,total_amount: data.totalAmount ,amount:data.supplyCostTotal, vat: data.taxTotal}];
                    
                    console.log(toJS(stateData.details))
                }else{
                    Modal.error({
                        title: '발행된 내역이 없습니다. ',
                        content: '승인번호를 다시 확인하거나, 국세청에서 내역을 받아오기 위해 1시간 정도 뒤에 다시 시도해 주세요.',
                    });
                }
            })
            .catch(function (error) {
                if(error.response != undefined && error.response != ''){
                    console.log(error.response);
                    if(error.response.status == 500){
                        Modal.error({
                            title: error.response.data.message,
                        });
                    }else if(error.response.status == 409){
                        Modal.error({
                            title: error.response.data.message,
                        });
                    }else{
                        Modal.error({
                            title: '오류가 발생했습니다. 재시도해주세요.',
                            content: '오류코드:' + error.response.status,
                        });
                    }
                    
                }
            });
        }            
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
                title='세금계산서 확인'
                placement='right'
                visible={visible}   
                onClose={onClose}     
                className={state.drawerback}
                closable={false}
                keyboard={false}
                extra={
                    <>
                        <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={onClose}>
                            <CloseOutlined />
                        </Button>
                    </>
                }        
            >
                <Row gutter={10} className="table">
                    <Col xs={24} lg={5} className="label">
                        승인번호 조회 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={19}>
                        <Input
                            name="taxNumber"
                            onChange={handleChangeEvidence('taxNumber')}
                            autoComplete="off"
                            maxLength="24"
                        />                      
                    </Col>
                </Row>
                <Space style={{marginTop: '10px',marginBottom:'20px'}}  direction="vertical">
                    <Text>* 수정(마이너스) 세금계산서가 발행된 경우 최초, 수정, 최종 증빙을 모두 조회해서 추가해 주세요.</Text>
                </Space>
                <div  style={{ marginBottom: 40 }}>
                    <Table
                        dataSource={state.listData}
                        columns={column}
                        rowKey={(row) => row.id}    
                        pagination={false} 
                        summary={pageData => {
                            let totalPay = 0;                                    
                            let totalAmount = 0;                                    
                            let totalVat = 0;                                    
                            pageData.forEach(e => {
                                totalPay += Number(e.totalAmount);
                                totalAmount += Number(e.supplyCostTotal);
                                totalVat += Number(e.taxTotal);
                            });
                            state.totalAmount = totalPay;
                            return (
                                <></>
                            )                    
                        }}
                    />
                </div>

                <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                    <Col>
                        <Button
                            type="primary"
                            htmlType="button"
                            onClick={(e)=>chkEvidencDataParent()}
                        >
                            확인
                        </Button>                       
                    </Col>
                </Row>
            </Drawer>
        </Wrapper>
    );
});

export default evidenceDrawer;