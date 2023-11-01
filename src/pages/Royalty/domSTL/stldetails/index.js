import React, { useState, useRef, useEffect }  from 'react';
import { Row, Col, DatePicker, Button, Modal,message,RangePickerProps } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import { Form, Formik } from 'formik';
import { FormikContainer, FormikInput } from '@components/form/CustomInput'
import SplitPane from "react-split-pane";
import styled from 'styled-components';
import moment from 'moment';

import PaperGrid from './papergrid';
import EbookGrid from './ebookgrid';
import EtcGrid from './etcgrid';

const Wrapper = styled.div`
    width: 100%;
`;

const Index = observer(({ drawerVisible, drawerClose, drawerChk, processingState, openPosition }) =>{
    const dateFormat = 'YYYY-MM-DD';
    const [formikFieldDefault, setFormikFieldDefault] = React.useState({
        company: '',
        prdType: '',
        stlCycle:'',
        stlDate: [moment(), moment()],
    });
    
    const formikRef = useRef(null);

    const [gridVisible, setGridVisible] = useState(0);
    const [messageApi, contextHolder] = message.useMessage();

    const viewGrid = () => {
        if (formikRef.current) {
            const formik = formikRef.current;
            const values = formik.values;
            if(values.company == ''){
                messageApi.open({
                    type: 'error',
                    content: '회사를 체크해주세요.',
                });
                return false;
            }else if(values.prdType == ''){
                messageApi.open({
                    type: 'error',
                    content: '상품종류를 체크해주세요.',
                });
                return false;
            }else if(values.stlCycle == ''){
                messageApi.open({
                    type: 'error',
                    content: '정산 주기를 체크해주세요.',
                });
                return false;
            }else{
                setGridVisible(values.prdType);
            }
            
        }
        
    };

    const disabledDate = (current) => {
        return current && current < moment().endOf('day');
    };

    return(
        <Wrapper className='flexcontWrap'>
            <Formik
                enableReinitialize={true} 
                initialValues={formikFieldDefault}
                onSubmit = {(values) => {
                    console.log(values)
                }}
                innerRef={formikRef}
            >
                {(props)=>(
                    <Form >
                        <Row className="table search_table">
                            <FormikContainer type={'radio'} labelWidth={3} perRow={2} label={'회사'} name={'company'} required
                                data = {{
                                    radioData : [{
                                        label : '도서출판 길벗',
                                        value : 2,
                                    },{
                                        label : '길벗스쿨',
                                        value : 3,
                                    }]
                                }}
                            />
                            <FormikContainer type={'radio'} labelWidth={3} perRow={2} label={'상품 종류'} name={'prdType'} required
                                data = {{
                                    radioData : [{
                                        label : '종이책', 
                                        value: 1
                                    }, {
                                        label : '전자책',
                                        value : 2,
                                    }, {
                                        label : '기타',
                                        value : 3,
                                    }]
                                }}
                            />
                           
                            <FormikContainer type={'radio'} labelWidth={3} perRow={2} label={'정산 주기'} name={'stlCycle'} required
                                data = {{
                                    radioData : [{
                                        label : '본사 기준', 
                                        value: 1
                                    }, {
                                        label : '월',
                                        value : 2,
                                    }, {
                                        label : '반기',
                                        value : 3,
                                    }, {
                                        label : '1년',
                                        value : 4,
                                    }]
                                }}
                            />
                            <FormikContainer type={'datepicker'} labelWidth={3} perRow={2} label={'정산 기간'} name={'stlDate'} data={'range'} dateValue={formikFieldDefault.inquiryPeriod} />
                        </Row>
                        <Row justify='center' style={{margin: 30}}>
                            <Button type='primary submit' onClick={()=>{viewGrid()}} >검색</Button>
                        </Row>
                        {gridVisible === 1 && (
                        <>
                            <PaperGrid />
                        </>
                        )}

                        {gridVisible === 2 && (
                        <>
                            <EbookGrid />
                        </>
                        )}

                        {gridVisible === 3 && (
                        <>
                            <EtcGrid />
                        </>
                        )}
                        
                    </Form>
                )}
            </Formik>
            
            {contextHolder}

        </Wrapper>
    );
});

export default Index;