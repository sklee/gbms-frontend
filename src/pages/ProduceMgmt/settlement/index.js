import React, { useState, useEffect, useRef } from 'react';
import { Row, Modal, Button } from 'antd';
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
        year: null,
        month: null,
        company: null,
        account: null,
        prdType : null,
    });

    const foldTable = useRef();
    const [ folded, setFolded ] = useState(false);
    const [ gridHeight, setGridHeight ] = useState(390);

    const foldingHandler = () => {
        setFolded(prev => !prev);

        if(!folded){
            foldTable.current.classList.add('folded');
            setGridHeight(290);
        } else {
            foldTable.current.classList.remove('folded');
            setGridHeight(390);
        }
    };

    const showModal = () => {
        Modal.confirm({
            title: '정산 완료로 처리하면 되돌릴 수 없습니다. 계속하시겠습니까?',
            onOk() {
                console.log('OK');
            }
        });
    };

    const [ selectRowType, setSelectRowTypeHandler ] = useState(null);
    const seletedRowTypeHandler = (rowData) =>  setSelectRowTypeHandler(rowData?.[0]?.process);

    useEffect(()=>{
        document.querySelector('.css-glamorous-div--jgd0xx').childNodes[0].style.flex = '52300 1 0';
        document.querySelector('.css-glamorous-div--jgd0xx').childNodes[2].style.flex = '86600 1 0';
    },[])

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
                            <FormikContainer type={'etc'} labelWidth={3} perRow={2} label={'정산 마감 연월'} name={'settlement'} required >
                                <>
                                    <FormikInput type={'select'} name={'year'} style={{width: 100}}
                                        data = {{
                                            options : [{
                                                label : '2023년', 
                                                value: 2023
                                            }, {
                                                label : '2022',
                                                value : 2022,
                                            }]
                                        }}
                                    />
                                    <FormikInput type={'select'} name={'month'} style={{width: 80, margin: '0 10px'}}
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
                                            }]
                                        }}
                                        extraCompo={<Button type='primary' onClick={showModal}>선택 기간의 정산 완료 처리</Button>}
                                    />
                                </>
                            </FormikContainer>
                            <FormikContainer type={'radio'} labelWidth={3} perRow={2} label={'회사'} name={'company'} required
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
                            <FormikContainer type={'input'} labelWidth={3} perRow={2} label={'거래처'} name={'account'} />
                            <FormikContainer type={'radio'} labelWidth={3} perRow={2} label={'상품 종류'} name={'prdType'} required
                                data = {{
                                    radioData : [{
                                        label : '판매용', 
                                        value: 1
                                    }, {
                                        label : '비매품',
                                        value : 2,
                                    }, {
                                        label : '포장 물품',
                                        value : 3,
                                    }]
                                }}
                            /> 

                        </Row>

                        <Row justify='center' style={{margin: 30}}>
                            <Button type='primary submit' onClick={props.handleSubmit}>검색</Button>
                            <Button className="btn btn-primary btn_add" shape="circle" onClick={foldingHandler} style={{marginLeft: 20}}>
                                { folded ? <DownOutlined /> : <UpOutlined />}
                            </Button>
                        </Row>

                        <SplitPane
                            split="vertical"
                        >   
                            <ObjectGrid gridHeight={gridHeight} seletedRowTypeHandler={seletedRowTypeHandler}/>
                            <DetailGrid gridHeight={gridHeight} selectRowType={selectRowType}/>
                        </SplitPane>
                    </Form>
                )}
            </Formik>
        </Wrapper>
        
    );

});

export default index;