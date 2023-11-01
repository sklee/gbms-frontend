/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState,useRef } from 'react';
import {Table,Space, Button,Row,Col,Modal,Input,Upload,InputNumber,Radio,Popover,Select,Checkbox,Typography,Drawer,message} from 'antd';
// import {SelectProps} from '@type/antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';

import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';

import multer from 'multer';
import { countBy } from 'lodash';




const Wrapper = styled.div`
    width: 100%;
`;

const detailsList = observer(({  detailsData,detailsVisible,detailsOnClose, drawerChk, detailsTabledata, classData, chkDataNum}) => {
    const { Text } = Typography;

  
    const state = useLocalStore(() => ({
       
        selectCode1:[], //비용청구분류 1depth
        selectCode2:[], //비용청구분류 2depth
        selectCode3:[], //비용청구분류 3depth
        code1Data:[],   //비용청구분류 1depth 선택값
        code2Data:[],   //비용청구분류 2depth 선택값
        code3Data:[],   //비용청구분류 3depth 선택값

        drawerback: 'drawerInnerWrap',
    }));

    useEffect(() => {
        if(drawerChk !== 'Y'){
            state.drawerback = 'drawerWrap'
        }        
        console.log(toJS(classData[chkDataNum]))
    }, [detailsData]);


    //drawer 닫기
    const visibleClose = () => {
        detailsOnClose();
    };

    const commaNum = (num) => {  
        if(num){
            const number = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return number
        }else{
            return 0;
        }
    }    

    const column = useMemo(() => [
        {
            title: '비용 분류',
            dataIndex: 'billing_sort',
            key:  'billing_sort',
            render: (_, row) => <div>{row.detailsClassText}</div>,
            align: 'left',
            width: '30%',
        },
        {
            title: '비용 귀속 대상 상품, 부서/회사',
            dataIndex: 'billing_target',
            key:  'billing_target',
            render: (_, row) => <div>{row.attributionTargetsText}</div>,
            align: 'left',
            width: '40%',
        },
        {
            title: '통화 단위',
            dataIndex:  'billing_current_unit',
            key: 'billing_current_unit',
            render: (_, row) => <div>
                {row.current_unit =='KRW' ? '원화(KRW)' : row.current_unit =='USD' ? '달러(USD)' : row.current_unit =='EUR' ? '유로(EUR)' : row.current_unit =='GBP' ? '파운드(GBP)' : 
                row.current_unit =='JPY' ? '엔(JPY)' : '위안(CNY)'}
            </div>,
            align: 'left',
            width: '20%',
        },
        {
            title: '합계',
            dataIndex: 'billing_cost',
            key: 'billing_cost',
            render: (_, row) => <div>{row.total_amount !='' && row.total_amount !=undefined ? commaNum(row.total_amount) : '' }</div>,
            align: 'right',
            width: '10%',
        } 
    ],[detailsTabledata]);

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
                title='청구 내용'
                placement='right'
                visible={detailsVisible}  
                onClose={visibleClose}  
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

                <Row gutter={10} className="table marginTop">
                    <div className="table_title">청구 내용</div>
                    <Col xs={24} lg={5} className="label">
                        비용 귀속 회사
                    </Col>
                    <Col xs={24} lg={19}>
                        <Radio.Group name="company" value={detailsData.company} readOnly={true}>
                            <Radio value='G'>도서출판 길벗</Radio>
                            <Radio value='S'>길벗스쿨</Radio>
                        </Radio.Group> 
                    </Col>
                    <Col xs={24} lg={5} className="label">
                        비용 청구 분류
                    </Col>
                    <Col xs={24} lg={19}>
                        <Input.Group>
                            <Row gutter={8}>
                                <Col span={8}>
                                    <Input className="" type="text" name="class1_name" autoComplete="off" readOnly={true} value={classData[chkDataNum].class1}/> 
                                </Col>
                                <Col span={8}>
                                    <Input className="" type="text" name="class2_name" autoComplete="off" readOnly={true} value={classData[chkDataNum].class2}/> 
                                </Col>
                                <Col span={8}>
                                    <Input className="" type="text" name="class3_name" autoComplete="off" readOnly={true} value={classData[chkDataNum].class3}/> 
                                </Col>
                            </Row>
                        </Input.Group>                        
                    </Col>

                    <Col xs={24} lg={5} className="label">
                        비용 귀속 대상
                    </Col>
                    <Col xs={24} lg={19}>                        
                        <Row style={{ marginTop: 10 }}> 
                            <Col xs={24} lg={24}>
                                <Radio.Group value={detailsData.details[chkDataNum].target } readOnly={true}>
                                    <Radio value="1">상품</Radio>
                                    <Radio value="2">부서/회사</Radio>
                                </Radio.Group>
                            </Col>
                        </Row>
                        <Row style={{ marginTop: 10 }}> 
                            <Col xs={24} lg={24}>
                                <div className="inner_dv">
                                    { state.contributors != '' && state.contributors != undefined &&
                                        state.contributors.map((e) => (
                                            <span className="dvInline">{e.name}</span>
                                        ))
                                    } 
                                </div>                                            
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={24} lg={5} className="label">
                        통화 단위
                    </Col>
                    <Col xs={24} lg={19}>
                        <Radio.Group value={detailsData.details[chkDataNum].current_unit} readOnly={true}>
                            <Radio value='KRW'>원화(KRW)</Radio>
                            <Radio value='USD'>달러(USD)</Radio>
                            <Radio value='EUR'>유로(EUR)</Radio>
                            <Radio value='GBP'>파운드(GBP)</Radio>
                            <Radio value='JPY'>엔(JPY)</Radio>
                            <Radio value='CNY'>위안(CNY)</Radio>
                        </Radio.Group>
                    </Col>

                    <Col xs={24} lg={5} className="label">
                        단위
                    </Col>
                    <Col xs={24} lg={3}>
                        <Input className="" type="text" name="unit" autoComplete="off" readOnly={true} value={detailsData.details[chkDataNum].unit}/> 
                    </Col>
                    <Col xs={24} lg={5} className="label">
                        단가
                    </Col>
                    <Col xs={24} lg={3}>
                        <Input value={detailsData.details[chkDataNum].unit_price!='' && detailsData.details[chkDataNum].unit_price != undefined ? commaNum(detailsData.details[chkDataNum]['unit_price']) : ''} readOnly={true}  />
                    </Col>
                    <Col xs={24} lg={5} className="label">
                        수량
                    </Col>
                    <Col xs={24} lg={3}>                   
                        <Input value={detailsData.details[chkDataNum]['qty']} readOnly={true}
                        />
                    </Col>

                    <Col xs={24} lg={5} className="label">
                        환급 대상 여부
                    </Col>
                    <Col xs={24} lg={19}> 
                        <Radio.Group name="refund_target_yn" value={detailsData.details[chkDataNum].refund_target_yn} readOnly={true}>
                            <Radio value="N">환급 대상 아님</Radio>
                            <Radio value="Y">환급 대상</Radio>
                        </Radio.Group>
                    </Col>

                    <Col xs={24} lg={5} className="label">
                        공급가
                    </Col>
                    <Col xs={24} lg={3}>
                        <Input className="" type="text" name="amount" autoComplete="off" readOnly={true} 
                        value={detailsData.details[chkDataNum].amount!='' && detailsData.details[chkDataNum].amount != undefined ? commaNum(detailsData.details[chkDataNum].amount) : ''}/> 
                    </Col>
                    <Col xs={24} lg={5} className="label">
                        부가세(적용 <Checkbox name="vat_yn" readOnly={true} checked={detailsData.details[chkDataNum].vat_yn!='' && detailsData.details[chkDataNum].vat_yn != undefined ? true : false}></Checkbox>)
                    </Col>
                    <Col xs={24} lg={3}>
                        <Input className="" type="text" name="vat"
                        value={detailsData.details[chkDataNum].vat!=='' && detailsData.details[chkDataNum].vat !== undefined ? commaNum(detailsData.details[chkDataNum].vat) : ''} 
                        readOnly={true} /> 
                    </Col>
                    <Col xs={24} lg={5} className="label">
                        합계 
                    </Col>
                    <Col xs={24} lg={3}>
                        <Input className="" type="text" readOnly={true}
                        value={detailsData.details[chkDataNum].total_amount!='' && detailsData.details[chkDataNum].total_amount != undefined ? commaNum(detailsData.details[chkDataNum].total_amount) : ''}/>
                    </Col>

                    <Col xs={24} lg={5} className="label">
                        세부 내용
                    </Col>
                    <Col xs={24} lg={19}>
                        <Input.TextArea name="remark" rows={4} autoComplete="off" readOnly={true} value={detailsData.details[chkDataNum].remark}/>
                    </Col>
                </Row>
                <div style={{marginTop: '10px',marginBottom:'20px',fontWeight: '600'}}>
                    * <Text type="danger">입금 받을 거래처가 같을 때</Text>만 청구 내용을 추가해 주세요.(거래처가 다르면 새로 청구 추가해야 함)
                </div>

                <div style={{ marginTop: 40, marginBottom: 40 }}>
                    <Table
                        dataSource={detailsTabledata}
                        columns={column}
                        rowKey={(row) => row.num}    
                        pagination={false} 
                        summary={pageData => {
                            let totalCost = 0;
                            let currency= "원화(KRW)"; 
                            
                            if(pageData != '' && pageData != undefined){
                                if(pageData[0].current_unit =='KRW'){ 
                                    currency = '원화(KRW)';
                                }else if(pageData[0].current_unit =='USD'){
                                    currency = '달러(USD)';
                                }else if(pageData[0].current_unit =='EUR'){
                                    currency = '유로(EUR)';
                                }else if(pageData[0].current_unit =='GBP'){
                                    currency = '파운드(GBP)';
                                }else if(pageData[0].current_unit =='JPY'){
                                    currency = '엔(JPY)';
                                }else if(pageData[0].current_unit =='CNY'){
                                    currency = '위안(CNY)';
                                } else{
                                    currency= "원화(KRW)"; 
                                }
                                
                                pageData.forEach(e => {
                                    totalCost += Number(e.total_amount);
                                });

                            }
                            return (
                                <>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={2} align={'center'}><Text strong>청구 합계</Text></Table.Summary.Cell>
                                        <Table.Summary.Cell index={2} align={'left'}>{currency}</Table.Summary.Cell>
                                        <Table.Summary.Cell index={3} align={'right'}><Text strong>{commaNum(totalCost)}</Text></Table.Summary.Cell>
                                    </Table.Summary.Row>
                                </>
                            );
                        }}
                    />
                </div>
            </Drawer>
        </Wrapper>
    );
});

export default detailsList;