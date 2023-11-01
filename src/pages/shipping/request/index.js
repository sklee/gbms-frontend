import React, { useState, useRef, useCallback } from 'react';
import { Row, Col, Tabs, Button } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import { Form, Formik } from 'formik';
import { FormikContainer, FormikInput } from '@components/form/CustomInput'
import styled from 'styled-components';

import SalesRelease from './salesRelease';

const Wrapper = styled.div`
    width: 100%;
`;
const { TabPane } = Tabs;

const index = observer(({ drawerVisible, drawerClose, drawerChk, processingState, openPosition }) =>{
    const [formikFieldDefault, setFormikFieldDefault] = React.useState({
        company: '',
        progress: '',
        searchCriteria: '',
        inquiryPeriod : '',
    });

    const [tabKey, setTabKey] = useState('salesRelease');
    const handleChangeTab = useCallback((key) => {
        setTabKey(key);
    }, []);

    const foldTable = useRef();
    const [ folded, setFolded ] = useState(false);
    const [ gridHeight, setGridHeight ] = useState(450);

    const foldingHandler = () => {
        setFolded(prev => !prev);

        if(!folded){
            foldTable.current.classList.add('folded');
            setGridHeight(400);
        } else {
            foldTable.current.classList.remove('folded');
            setGridHeight(500);
        }
    }
    
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
                        <Row className="table search_table" ref={foldTable}>
                            <FormikContainer type={'radio'} labelWidth={3} perRow={3} label={'회사'} name={'company'}
                                data = {{
                                    radioData : [{
                                        label : '도서출판 길벗', 
                                        value: 1
                                    }, {
                                        label : '길벗스쿨',
                                        value : 2
                                    }]
                                }}
                            />
                            <FormikContainer type={'datepicker'} labelWidth={3} perRow={3} label={'주문/출고 등록일'} name={'registrationDate'} />
                            <FormikContainer type={'radio'} labelWidth={3} perRow={3} label={'출고/출하 창고'} name={'warehouse'}
                                data = {{
                                    radioData : [{
                                        label : '라임북(정품)', 
                                        value: 1
                                    }, {
                                        label : '라임북(반품)',
                                        value : 2
                                    }]
                                }}
                            />
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

            <Tabs activeKey={tabKey} onChange={handleChangeTab} >
                <TabPane tab="판매 출고" key="salesRelease">
                    <SalesRelease tab={tabKey} gridHeight={gridHeight}/>
                </TabPane>
                <TabPane tab="증정 출고" key="presentationRelease">
                    <SalesRelease tab={tabKey} gridHeight={gridHeight}/>
                </TabPane>
                <TabPane tab="기타 출고" key="etcRelease">
                    <SalesRelease tab={tabKey} gridHeight={gridHeight}/>
                </TabPane>
            </Tabs>
        </Wrapper>
    );
});

export default index;