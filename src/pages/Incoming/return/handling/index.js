import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Button } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import { Form, Formik } from 'formik';
import { FormikContainer, FormikInput } from '@components/form/CustomInput'
import SplitPane from "react-split-pane";
import moment from 'moment';
import styled from 'styled-components';

import ObjectGrid from './objectGrid';
import DetailGrid from './detailGrid';

const Wrapper = styled.div`
    width: 100%;
`;

const index = observer((props) => {

    const [formikFieldDefault, setFormikFieldDefault] = React.useState({
        company: '',
        progress: '',
        inquiryStandard: '',
        inquiryPeriod : [moment(), moment()],
    });

    const foldTable = useRef();
    const [ folded, setFolded ] = useState(false);
    const [ gridHeight, setGridHeight ] = useState(450);

    const foldingHandler = () => {
        setFolded(prev => !prev);

        if(!folded){
            foldTable.current.classList.add('folded');
            setGridHeight(350);
        } else {
            foldTable.current.classList.remove('folded');
            setGridHeight(450);
        }
    }

    return (
        <Wrapper className='flexcontWrap'>
            <Formik
                enableReinitialize={true} 
                initialValues={formikFieldDefault}
                onSubmit = {(values) => {
                    console.log(values)
                }}
            >
                {(props)=>(
                    <Form>
                        <Row className='table search_table' ref={foldTable}>
                            <FormikContainer type={'radio'} perRow={2} label={'회사'} name={'company'}
                                data = {{
                                    radioData : [{
                                        label : '전체', 
                                        value: 0
                                    },{
                                        label : '도서출판 길벗', 
                                        value: 1
                                    }, {
                                        label : '길벗스쿨',
                                        value : 2
                                    }]
                                }}
                            />
                            <FormikContainer type={'radio'} perRow={2} label={'진행 상태'} name={'progress'}
                                data = {{
                                    radioData : [{
                                        label : '전체', 
                                        value: 0
                                    },{
                                        label : '반품 입고 중', 
                                        value: 1
                                    }, {
                                        label : '반품 입고 완료',
                                        value : 2
                                    }]
                                }}
                            />
                            <FormikContainer type={'etc'} perRow={1} label={'조회 기준과 기간'} name={'inquiry'}>
                                <>
                                    <FormikInput type={'radio'} name={'inquiryStandard'}
                                        data = {{
                                            radioData : [{
                                                label : '거래처 반품일', 
                                                value: 1
                                            }, {
                                                label : '입고일',
                                                value : 2,
                                            }, {
                                                label : '라임북 처리일',
                                                value : 3,
                                            }, {
                                                label : '반품 입고일',
                                                value : 4,
                                            },]
                                        }}
                                    />
                                    <FormikInput type={'datepicker'} name={'inquiryPeriod'} data={'range'} dateValue={formikFieldDefault.inquiryPeriod} />
                                </>
                            </FormikContainer>
                        </Row>

                        <Row justify='center' style={{margin: 30}}>
                            <Button type='primary submit' onClick={props.handleSubmit}>검색</Button>
                            <Button className="btn btn-primary btn_add" shape="circle" onClick={foldingHandler} style={{marginLeft: 20}}>
                                { folded ? <DownOutlined /> : <UpOutlined />}
                            </Button>
                        </Row>

                        <SplitPane
                            split="vertical"
                            minSize={100}
                            defaultSize={"50%"}
                        >
                            <ObjectGrid gridHeight={gridHeight}/>
                            <DetailGrid gridHeight={gridHeight}/>
                        </SplitPane>

                    </Form>
                )}
                
            </Formik>
        </Wrapper>
        
    );

});

export default index;