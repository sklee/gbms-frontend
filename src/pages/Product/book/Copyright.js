/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useState } from 'react';
import { Row, Col, Radio, Checkbox, Button, Space, Typography, Input, Drawer, Table, DatePicker, Select } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import { ComboBox, InputMask, InputDate, InputTime } from '@grapecity/wijmo.react.input';
import { Control, isUndefined } from '@grapecity/wijmo';
import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { toJS } from 'mobx';
import moment from 'moment';
import '@grapecity/wijmo.cultures/wijmo.culture.ko';

import useStore from '@stores/useStore';
//import Router from "next/router";

import CopyPaySumInfo from './contract/copyPaySumInfo';
import CopyPayDate from './contract/copyPayDate';
import CopyPayInfo from './contract/copyPayInfo';

import {
  PART_DATA,
  RESPONSIBILITIES_DATA,
  FLOOR_DATA,
} from '@shared/constants';

const Wrapper = styled.div`
  width: 100%;
  .intxtBox{margin-top:20px;overflow:hidden}
  .btn_authorsrch{float:right}
`;




const paperBook = observer(({ setData, handleChangeStep }) => {
    const listColumns = [
        {
            title: '선택',
            dataIndex: 'select',
            width:'80px',
            align:'center',
            render: (text) => <Checkbox></Checkbox>,
            onCell: (_, index) => {
                if (index === 1) {
                    return {
                    rowSpan: 2,
                    };
                } // These two are merged into above cell
                if (index === 2) {
                    return {
                    rowSpan: 0,
                    };
                }
                return {};
            },
        },
        {
            title: '저작권자 성명/사업자명',
            dataIndex: 'name',
            width:"*",
        },
        {
            title: '주민번호/사업자번호',
            dataIndex: 'num',
        },
        {
            title: '기여 구분',
            dataIndex: 'sort',
        },
        {
            title: '저작권 대상',
            dataIndex: 'target',
            width:'120px',
            align:'center',
            onCell: (_, index) => {
                if (index === 1) {
                    return {
                    rowSpan: 2,
                    };
                } // These two are merged into above cell
                if (index === 2) {
                    return {
                    rowSpan: 0,
                    };
                }
                return {};
            },
        },
        {
            title: '계약 정보',
            dataIndex: 'info',
            width:'120px',
            align:'center',
            render: (text) => <Button type="link">{text}</Button>,
            onCell: (_, index) => {
                if (index === 1) {
                    return {
                    rowSpan: 2,
                    };
                } // These two are merged into above cell
                if (index === 2) {
                    return {
                    rowSpan: 0,
                    };
                }
                return {};
            },
        },
    ];
    const listData = [
        {
            key: '1',
            name: '홍길동',
            num: '720619-*******',
            sort: '저자',
            target: '본문',
            info: '수정',
        },
        {
            key: '2',
            name: '김가영',
            num: '801212-*******',
            sort: '저작권 양도',
            target: '번역',
            info: '수정',
        },
        {
            key: '3',
            name: '도서출판 길벗',
            num: '105-81-69021',
            sort: '저작권 양수',
            target: '번역',
            info: '수정',
        },
    ];
    const columns = [
        {
            title: '성명/사업자명',
            dataIndex: 'name',
            align:'center',
        },
        {
            title: '주민번호/사업자번호',
            dataIndex: 'num',
            align:'center',
        },
        {
            title: '최근 저작권자 지정 상품',
            dataIndex: 'prd',
            width:'*',
            align:'center',
            render: (text) => <Button style={{backgroundColor:'#f8f8f8'}}>{text}</Button>,
        },
        {
            title: '계약 정보',
            dataIndex: 'info',
            width:'150px',
            align:'center',
            render: (text) => <Button type="link"  onClick={chkListDrawer}>{text}</Button>,
        },
    ];
    const data = [
        {
            key: '1',
            name: '홍길동',
            num: '720619-*******',
            prd: '주식투자 무작정 따라하기',
            info: '입력',
        },
        {
            key: '2',
            name: '',
            num: '105-81-69021',
            prd: '',
            info: '입력',
        },
    ];

    const { commonStore } = useStore();
    const state = useLocalStore(() => ({ 
        drawerback : 'drawerWrap', 
        drawerPaycnt:0,
    }));
    const state_search = useLocalStore(() => ({
        list: [],
    }));

    const [visible, setVisible] = useState(false);
    const [chkVisible, setChkVisible] = useState(false);
    const [size, setSize] = useState();

    const showDrawer = () => {
        setVisible(true);
    };
    
    const onClose = () => {
        setVisible(false);
    };
    

    const [linkPrd_chk, setLinkPrdChk] = useState(false);
    const dateFormat = 'YYYY-MM-DD';
    const { Text, Link } = Typography;


    const chkListDrawer = () => {
        state.drawerback = 'drawerback';
        setChkVisible(true);
    };
    const chkOnClose = () => {
        state.drawerback = '';
        setChkVisible(false);
    };

    const [bookDisabled, setbookDisabled] = useState(false);
    const { Option } = Select;
    const onChange = (checkedValues) => {
        if(checkedValues.includes('ebook') || checkedValues.includes('audio') ){
            if(!checkedValues.includes('paper'))setbookDisabled(true);
        }else{
            setbookDisabled(false);
        }
    };
    const [assignmentInfo, setAssignmentInfo] = useState(false);
    const [copyPayInfo, setCopyPayInfo] = useState(false);
    const onChangeAssignment = (e) => {
        setAssignmentInfo( e.target.value);
        state.drawerPaycnt++;
    };
    const onChangeCopyPay = (e) => {
        setCopyPayInfo( e.target.value);
        state.drawerPaycnt++
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
            <Row gutter={10} className="table">
                <Col xs={4} lg={4} className="label">
                    상품명
                </Col>
                <Col xs={20} lg={20} >
                    <Input name="bookName" placeholder="" />
                </Col>
                <Col xs={4} lg={4} className="label">
                    저작권 구분 *
                </Col>
                <Col xs={20} lg={20} >
                    <Radio.Group name="radiogroup" defaultValue={1}>
                        <Radio value={1}>국내</Radio>
                        <Radio value={2}>해외(수입)</Radio>
                    </Radio.Group>
                </Col>
            </Row>
            <div className="intxtBox">
                <Space direction="vertical">
                    <Text type="">* <Text type="danger">세금/계좌 정보도 등록된</Text> 기여자/저작권자만 지정할 수 있습니다. <Text type="danger">신규 등록은 ‘기여자/저작권자 - 국내’ 메뉴를 이용</Text>해 주세요.</Text>
                    <Text type="">* 저작권 양도 계약을 체결한 경우에는 양도자를 저작권자로 지정하고, 계약 정보에서 양도 계약으로 등록하면 됩니다.</Text>
                    <Text type="">* 저작권자가 여러 명이면 <Text type="danger">배분 비율을 정확하게 계산해서 입력</Text>해 주세요. 저작권자마다 조건이 다를 수 있어서 합산을 보여드리기 어렵습니다.</Text>
                </Space>
                <Button className="btn-primary btn_authorsrch" type="button" onClick={showDrawer}>+</Button>
            </div>

            <div style={{marginTop:'20px'}}>
                <Table columns={listColumns} dataSource={listData} />
            </div>  

            <Drawer
                title="국내 기여자/저작권자 검색"
                placement='right'
                closable={false}
                onClose={onClose}
                visible={visible}
                className={state.drawerback}
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
                <div>
                    <Space direction="vertical">
                        <Text type="">* 계약 정보 입력 후 추가하면 반영됩니다. 계약 정보 입력 전에는 추가할 수 없습니다.</Text>
                    </Space>
                    <div style={{marginTop:'20px'}}>
                        <Table columns={columns} dataSource={data} />
                    </div>
                </div>

                <Drawer
                    title="계약 정보 입력"
                    closable={false}
                    visible={chkVisible}   
                    onClose={chkOnClose}    
                    className={state.drawerback}
                    keyboard={false}
                    extra={
                        <>
                            <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                                {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                            </Button>
                            <Button onClick={chkOnClose}>
                                <CloseOutlined />
                            </Button>
                        </>
                    }
                >
                    <Row gutter={10} className="table">
                        <Col xs={4} lg={8} xl={4} className="label">
                            계약 정보 복사
                        </Col>
                        <Col xs={20} lg={16} xl={20}>
                             <Space direction="vertical">
                                <Select placeholder="선택해 주세요.">
                                    <Option value="">저작권자1</Option>
                                </Select>
                                <Text type="">* 이 상품의 다른 저작권자의 계약 정보를 불러와서 수정할 수 있습니다.</Text>
                            </Space>
                        </Col>
                        <Col xs={4} lg={8} xl={4} className="label">
                            저작권 대상 *
                        </Col>
                        <Col xs={20} lg={16} xl={20}>
                            <Radio.Group>
                                <Radio value={1}>본문</Radio>
                                <Radio value={2}>번역</Radio>
                                <Radio value={3}>삽화</Radio>
                                <Radio value={4}>사진</Radio>
                            </Radio.Group>
                        </Col>
                        <Col xs={4} lg={8} xl={4} className="label">
                            계약 범위 *
                        </Col>
                        <Col xs={20} lg={16} xl={20}>
                            <Checkbox.Group
                                style={{
                                  width: '100%',
                                }}
                                onChange={onChange}
                            >
                                <Checkbox value="paper" disabled={bookDisabled}>종이책</Checkbox>
                                <Checkbox value="ebook">전자책</Checkbox>
                                <Checkbox value="audio">오디오북 </Checkbox>
                                <Checkbox value="etc">기타 2차 저작권</Checkbox>
                                <Checkbox value="export">수출 저작권</Checkbox>
                            </Checkbox.Group>
                        </Col>
                        <Col xs={4} lg={8} xl={4} className="label">
                            계약 체결일 *
                        </Col>
                        <Col xs={20} lg={16} xl={20}>
                            <DatePicker name="GPC_DUE_DT" format={dateFormat} />
                        </Col>
                        <Col xs={4} lg={8} xl={4} className="label">
                            저작권 양도 계약 *
                        </Col>
                        <Col xs={20} lg={16} xl={20}>
                            <Radio.Group
                                onChange={onChangeAssignment}
                            >
                                <Radio value={false}>아님(No)</Radio>
                                <Radio value={true}>맞음(Yes)</Radio>
                            </Radio.Group>
                        </Col>
                        <Col xs={4} lg={8} xl={4} className="label">
                            저작권료 일괄 지급(매절) *
                        </Col>
                        <Col xs={20} lg={16} xl={20}>
                            <Radio.Group
                                onChange={onChangeCopyPay}
                            >
                                <Radio value={false}>아님(No)</Radio>
                                <Radio value={true}>맞음(Yes)</Radio>
                            </Radio.Group>
                        </Col>
                    </Row>
                    {state.drawerPaycnt > 1 &&
                        <>
                        {assignmentInfo === true ? (
                            <>
                                {copyPayInfo === true ? (
                                    <>
                                        <CopyPaySumInfo />
                                    </>
                                    ):(
                                    <>
                                        <CopyPayDate />
                                        <CopyPayInfo />
                                    </>
                                )}
                            </>
                            ):(
                            <>
                                {copyPayInfo === true ? (
                                    <>
                                        <CopyPayDate type="all" />
                                        <CopyPaySumInfo />
                                    </>
                                    ):(
                                    <>
                                        <CopyPayDate type="all" />
                                        <CopyPayInfo />
                                    </>
                                )}
                            </>
                        )} 
                        </>
                    }

                    <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                        <Col>
                            <Button type="primary">확인</Button>
                        </Col>
                    </Row>
                </Drawer>
            </Drawer>

            

           
        </Wrapper>
    );
});

export default paperBook;
