import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Row, Col, DatePicker, Button } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import { observer, useLocalStore, inject } from 'mobx-react';
import { Form, Formik } from 'formik';
import { FormikContainer, FormikInput } from '@components/form/CustomInput'
import SplitPane from "react-split-pane";
import styled from 'styled-components';
import moment from 'moment';
import ObjectGridNew from './objectGridNew';
import ObjectList from './objectList'

const Wrapper = styled.div` 
    width: 100%;
`;

const index = inject('commonStore')(observer(({ drawerVisible, drawerClose, drawerChk, processingState, openPosition, commonStore, selectRowId }) => {    
    const dateFormat = 'YYYY-MM-DD';
    const [formikFieldDefault, setFormikFieldDefault] = React.useState({
        company: '',
        progress: '',
        searchCriteria: '',
        inquiryPeriod : '',
    });

    const foldTable = useRef();
    const [ folded, setFolded ] = useState(false);
    const [gridHeight, setGridHeight] = useState(350);
    const [selectedRowData, setSelectedRowData] = useState([]);

    const foldingHandler = () => {
        setFolded(prev => !prev);

        if(!folded){
            foldTable.current.classList.add('folded');
            setGridHeight(250);
        } else {
            foldTable.current.classList.remove('folded');
            setGridHeight(350);
        }
    }
  
    return(
        <Wrapper className='flexcontWrap'>
            <Formik
                enableReinitialize={true} 
                initialValues={formikFieldDefault}
                onSubmit = {(values) => { // 선택한 검색 항목 values
                    // console.log(values) 
                    const { company, progress, searchCriteria, inquiryPeriod } = values;
                    setFormikFieldDefault({
                        company: values.company,
                        progress: values.progress,
                        searchCriteria: values.searchCriteria,
                        inquiryPeriod: values.inquiryPeriod,
                    });
                }}
            >
                {(props)=>(
                    <Form >
                        <Row className="table search_table" ref={foldTable}>
                            <FormikContainer type={'radio'} perRow={2} label={'회사'} name={'company'}
                                data = {{
                                    radioData : [{
                                        label : '전체 ', 
                                        value: 'A',
                                        defaultChecked: true,
                                    }, {
                                        label : '도서출판 길벗', 
                                        value: 'G'
                                    }, {
                                        label : '길벗스쿨',
                                        value : 'S',
                                    }]
                                }}
                            />
                            <FormikContainer type={'radio'} perRow={2} label={'진행 상태'} name={'progress'}
                                data = {{
                                    radioData : [{
                                        label : '전체 ', 
                                        value: 1
                                    }, {
                                        label : '주문 등록',
                                        value: 2,
                                        defaultChecked: true,                                  
                                    }, {
                                        label : '출고 요청',
                                        value : 3,
                                    }]
                                }}
                            />
                            <FormikContainer type={'etc'} perRow={1} label={'조회 기준과 기간'} name={'inquiry'}>
                                <>
                                    <FormikInput type={'radio'} name={'searchCriteria'}
                                        data = {{
                                            radioData : [{
                                                label : '주문 등록일', 
                                                value: 1,
                                                defaultChecked: true,
                                            }, {
                                                label : '출고 요청일',
                                                value : 2,
                                            }]
                                        }}
                                    />
                                    <FormikInput type={'datepicker'} name={'inquiryPeriod'} data={'range'} dateValue={[moment("2023-09-01T14:43:09.590Z").format('YYYY-MM-DD'), moment()]} />
                                    {/* <FormikInput type={'datepicker'} name={'inquiryPeriod'} data={'range'} dateValue={[moment(), moment()]} /> */}
                                </>
                            </FormikContainer>
                        </Row>
                        <Row justify='center' style={{margin: 30}}>
                            <Button type='primary submit' onClick={props.handleSubmit} >검색</Button>
                            <Button className="btn btn-primary btn_add" shape="circle" onClick={foldingHandler} style={{marginLeft: 20}}>
                                { folded ? <DownOutlined /> : <UpOutlined />}
                            </Button>
                        </Row>
                    </Form>
                )}
            </Formik>
        
            <SplitPane
                split="vertical"
                minSize={100}
                defaultSize={"50%"}
            >
                <ObjectGridNew gridHeight={gridHeight} formikFieldDefault={formikFieldDefault} />
                <ObjectList gridHeight={gridHeight} selectedRowData={selectedRowData} />
            </SplitPane>
        </Wrapper>
    );
}));

export default index;