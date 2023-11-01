import React, { useState, useRef, useEffect }  from 'react';
import { Row, Col, Typography, Button, Modal } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import { Form, Formik } from 'formik';
import { FormikContainer, FormikInput } from '@components/form/CustomInput'
import SplitPane from "react-split-pane";
import styled from 'styled-components';
import moment from 'moment';

import Grid from './grid';

const { Text } = Typography;
const Wrapper = styled.div`
    width: 100%;
`;

const Index = observer(({ drawerVisible, drawerClose, drawerChk, processingState, openPosition }) =>{
    const dateFormat = 'YYYY-MM-DD';
    const [formikFieldDefault, setFormikFieldDefault] = React.useState({
        company: '',
        year: null,
        month: null,
        account: '',
        prdType: '',
        prdrecognition: '',
    });


    useEffect(()=>{
        let cntYear = new Date().getFullYear();
        let cntMonth = new Date().getMonth() + 1;

        if(cntMonth === 1) {
            cntYear -= 1;
            cntMonth = 12;
        }

        setFormikFieldDefault((prev)=>{
            const copy = {...prev};
            copy.year = cntYear;
            copy.month = cntMonth;
            return copy;
        });
    },[]);

    const showModal = () => {
        Modal.confirm({
            title: `'회사, 판매 기간, 상품 종류'가 모두 일치하는 매출이 등록되어 있으면 "선택한 회사, 판매 기간, 상품 종류가 일치하는 매출이 이미 등록되어 있습니다. 계속하면 기존 데이터를 삭제하고 업데이트 합니다. 계속 하시겠습니까?"`,
            onOk() {
                console.log('OK');
            }
        });
    };

    return(
        <Wrapper className='flexcontWrap'>
            <Formik
                enableReinitialize={true} 
                initialValues={formikFieldDefault}
                onSubmit = {(values) => {
                    console.log(values)
                }}
            >
                {(props)=>(
                    <Form >
                        <Row className="table">
                            <FormikContainer type={'radio'} labelWidth={3} perRow={3} label={'회사'} name={'company'} required
                                data = {{
                                    radioData : [{
                                        label : '도서출판 길벗',
                                        value : 1,
                                    }, {
                                        label : '길벗스쿨',
                                        value : 2,
                                    }]
                                }}
                            />
                            <FormikContainer type={'etc'} labelWidth={3} perRow={3} label={'판매 기간'} name={'period'} required >
                                <>
                                    <FormikInput type={'select'} name={'year'} style={{width: 95}}
                                        data = {{
                                            options : [{
                                                label : '2023년', 
                                                value: 2023
                                            }, {
                                                label : '2022년',
                                                value : 2022,
                                            }]
                                        }}
                                    />
                                    <FormikInput type={'select'} name={'month'} style={{width: 80, marginLeft: 10}}
                                        data={{
                                            options : [{
                                                value: 1,
                                                label: '1월',
                                            },{
                                                value: 2,
                                                label: '2월'
                                            },{
                                                value: 3,
                                                label: '3월'
                                            },{
                                                value: 4,
                                                label: '4월'
                                            },{
                                                value: 5,
                                                label: '5월'
                                            },{
                                                value: 6,
                                                label: '6월'
                                            },{
                                                value: 7,
                                                label: '7월'
                                            },{
                                                value: 8,
                                                label: '8월'
                                            }]
                                        }}
                                    />
                                </>
                            </FormikContainer>
                            <FormikContainer type={'select'} labelWidth={3} perRow={3} label={'거래처'} name={'account'} style={{width: '100%'}} required
                                data = {{
                                    options : [{
                                        label : "1",
                                        value: 1
                                    }, {
                                        label : "2",
                                        value : 2,
                                    }]
                                }}
                            />
                            <FormikContainer type={'radio'} labelWidth={3} perRow={1.5} label={'상품 종류'} name={'prdType'} required
                                data = {{
                                    radioData : [{
                                        label : '전자책', 
                                        value: 1
                                    }, {
                                        label : '오디오북',
                                        value : 2,
                                    }, {
                                        label : '동영상 강좌',
                                        value : 3,
                                    }, {
                                        label : '기타 2차 저작물',
                                        value : 4,
                                    }, {
                                        label : '판매용 일반 제품',
                                        value : 5,
                                    }]
                                }}
                            />
                            <FormikContainer type={'radio'} labelWidth={3} perRow={3} label={'상품 인식'} name={'prdrecognition'} required
                                data = {{
                                    radioData : [{
                                        label : "ISBN",
                                        value: 1
                                    }, {
                                        label : "거래처 상품 코드",
                                        value : 2,
                                    }]
                                }}
                            />
                        </Row>
                        <div>
                            <div>* 첫 번째 행에 열 제목이 있으면 안됩니다. 실제 판매 데이터만 남겨 주세요.</div>
                            <div>* 열에 포함할 항목: <span className='fontBold'>A(ISBN 또는 거래처 상품 코드), B(정가-옵션), C(실 판매가-옵션), D(판매 수량-옵션), E(매출액), F(정산액), G(실제 판매처-옵션)</span></div>
                            <div style={{marginLeft: 10}}>- 실제 판매처 구분: 교보문고, 예스24, 알라딘, 네이버, 리디북스, 밀리의 서재, Overdrive, 거래처와 실제 판매처가 같으면 공란</div>
                        </div>
                        <Row justify='center' style={{margin: 30}}>
                            <Button type='primary submit' onClick={showModal} >파일 등록</Button>
                        </Row>

                        <Grid account={formikFieldDefault.account}/>
                    </Form>
                )}
            </Formik>

        </Wrapper>
    );
});

export default Index;