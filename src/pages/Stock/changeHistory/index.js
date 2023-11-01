import React, { useState, useRef }  from 'react';
import { Row, Button } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import { Form, Formik } from 'formik';
import { FormikContainer, FormikInput } from '@components/form/CustomInput'
import SplitPane from "react-split-pane";
import styled from 'styled-components';
import moment from 'moment';

import Grid from './grid';

const Wrapper = styled.div`
    width: 100%;
`;

const Index = observer(({ drawerVisible, drawerClose, drawerChk, processingState, openPosition }) =>{
    const dateFormat = 'YYYY-MM-DD';
    const [formikFieldDefault, setFormikFieldDefault] = React.useState({
        variableDate: [moment(), moment()],
        prdType: '',
        company: '',
        storage : '',
        statusYN : '',
        department: null,
        prdGroup : null,
        stockYN : '',
        period : 30,
        unit : 'day'
    });

    const foldTable = useRef();
    const [ folded, setFolded ] = useState(false);

    const foldingHandler = () => {
        setFolded(prev => !prev);
        if(!folded){
            foldTable.current.classList.add('folded');
        } else {
            foldTable.current.classList.remove('folded');
        }
    }    

    const disabledDate = (current) => {
        return current && current > moment();
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
                        <Row className="table search_table" ref={foldTable}>
                            <FormikContainer 
                                type={'datepicker'} 
                                labelWidth={3} 
                                perRow={2} 
                                label={'변동일'} 
                                name={'variableDate'} 
                                dateValue={formikFieldDefault.variableDate} 
                                required 
                                data={'range'}
                                disabledDate={disabledDate}
                            />
                            <FormikContainer type={'radio'} labelWidth={3} perRow={2} label={'상품 종류'} name={'prdType'} required
                                data = {{
                                    radioData : [{
                                        label : '종이책(전체)', 
                                        value: 1
                                    }, {
                                        label : '종이책(단권)',
                                        value : 2,
                                    }, {
                                        label : '종이책(세트)',
                                        value : 3,
                                    }, {
                                        label : '비매품',
                                        value : 4,
                                    }, {
                                        label : '판매용 일반 제품',
                                        value : 5,
                                    }]
                                }}
                            />
                            <FormikContainer type={'radio'} labelWidth={3} perRow={2} label={'회사'} name={'company'} required
                                data = {{
                                    radioData : [{
                                        label : '전체', 
                                        value: 1
                                    }, {
                                        label : '도서출판 길벗',
                                        value : 2,
                                    }, {
                                        label : '길벗스쿨',
                                        value : 3,
                                    }]
                                }}
                            />
                            <FormikContainer type={'radio'} labelWidth={3} perRow={2} label={'창고'} name={'storage'} required
                                data = {{
                                    radioData : [{
                                        label : '전체', 
                                        value: 1
                                    }, {
                                        label : '라임북(정품)',
                                        value : 2,
                                    }, {
                                        label : '라임북(반품)',
                                        value : 3,
                                    }, {
                                        label : '본사',
                                        value : 4,
                                    }, {
                                        label : '기타',
                                        value : 5,
                                    }, {
                                        label : '판권반품',
                                        value : 6,
                                    }]
                                }}
                            />
                            <FormikContainer type={'select'} labelWidth={3} perRow={2} label={'부서'} name={'department'} placeholder={'선택해주세요.'} style={{width: '100%'}}
                                data = {{
                                    options : [{
                                        label : 1,
                                        value: 1
                                    }, {
                                        label : 2,
                                        value : 2,
                                    }, {
                                        label : 3,
                                        value : 3,
                                    }]
                                }}
                            />
                            <FormikContainer type={'select'} labelWidth={3} perRow={2} label={'상품 그룹'} name={'prdGroup'} placeholder={'선택해주세요.'} style={{width: '100%'}}
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
                            <FormikContainer type={'checkbox'} labelWidth={3} perRow={2} label={'상태별 노출 여부'} name={'statusYN'}
                                data = {{
                                    checkboxData : [{
                                        label : "'출시' 상태인 것만",
                                        value: 1
                                    }, {
                                        label : "'출고 가능'한 것만",
                                        value : 2,
                                    }]
                                }}
                            />

                            <FormikContainer type={'radio'} labelWidth={3} perRow={2} label={'재고별 노출 여부'} name={'stockYN'}
                                data = {{
                                    radioData : [{
                                        label : '전체', 
                                        value: 1
                                    }, {
                                        label : '재고 있음',
                                        value : 2,
                                    }, {
                                        label : '재고 없음(0 이하)',
                                        value : 3,
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

                        <Grid />
                    </Form>
                )}
            </Formik>

        </Wrapper>
    );
});

export default Index;