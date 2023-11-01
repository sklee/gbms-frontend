/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useState } from 'react';
import { Row, Col, Radio, Checkbox, Button, Space, Typography, Input, Drawer, Table, Popover } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import { QuestionOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import styled from 'styled-components';
// import {
//   ComboBox,
//   InputMask,
//   InputDate,
//   InputTime,
// } from '@grapecity/wijmo.react.input';
// import { Control, isUndefined } from '@grapecity/wijmo';
// import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
// import { CellRange } from '@grapecity/wijmo.grid';
// import { toJS } from 'mobx';
// import moment from 'moment';
import '@grapecity/wijmo.cultures/wijmo.culture.ko';

import useStore from '@stores/useStore';
//import Router from "next/router";


import {
  PART_DATA,
  RESPONSIBILITIES_DATA,
  FLOOR_DATA,
} from '@shared/constants';

const Wrapper = styled.div`
  width: 100%;
  .intxtBox{margin-top:20px;overflow:hidden}
  .btn_authorsrch{float:right}
  .tableWrapper{position:relative;margin-top:20px;}
  .tableWrapper .setpopover{position:absolute;top:10px;right:10px;z-index:10;}
`;

const DEF_STATE = {
    drawerback : 'drawerback', 
};



const paperBook = observer(({ setData, handleChangeStep }) => {
    const listColumns = [
        {
            title: '선택',
            dataIndex: 'select',
            width:'80px',
            align:'center',
            render: (text) => <Checkbox></Checkbox>,
        },
        {
            title: '성명/사업자명(실명)',
            dataIndex: 'name',
            width:"*",
        },
        {
            title: '성명/사업자명(공개용)',
            dataIndex: 'openname',
        },
        {
            title: '유형',
            width:'80px',
            dataIndex: 'categories',
        },
        {
            title: '기여 구분',
            dataIndex: 'sort',
            width:'120px',
            align:'center',
            render: (text) => <Button type="link" onClick={chkListDrawer}>{text}</Button>,
        },
        {
            title: '저작권자로 지정',
            dataIndex: 'set',
            width:'220px',
            align:'center',
            render: (text) => (
                <span>
                    {text===''?<Checkbox></Checkbox>:text}
                </span>
            ),
        },
    ];
    const listData = [
        {
            key: '1',
            name: '김미영',
            openname: '김덕후',
            categories: '개인',
            sort: '삽화',
            set: '',
        },
        {
            key: '2',
            name: 'Trish Hall',
            openname: 'Trish Hall(트리시 홀)',
            categories: '개인',
            sort: '저자, 편집',
            set: '세금/계좌 정보 미등록',
        },
        
    ];
    const columns = [
        {
        title: '성명/사업자명(실명)',
        dataIndex: 'name',
        },
        {
        title: '성명/사업자명(공개용)',
        dataIndex: 'openname',
        },
        {
        title: '통합전산망 기여자 번호',
        dataIndex: 'num',
        align:'center',
        },
        {
        title: '유형',
        dataIndex: 'sort',
        align:'center',
        },
        {
        title: '최근 기여자 지정 상품',
        dataIndex: 'contribute',
        align:'center',
        render: (text) => <Button style={{backgroundColor:'#f8f8f8'}}>{text}</Button>,
        },
        {
        title: '소개글',
        dataIndex: 'intro',
        align:'center',
        render: (text) => <Button type="link">{text}</Button>,
        },
        {
        title: '기여 구분',
        dataIndex: 'coPart',
        align:'center',
        render: (text) => <Button type="link" onClick={chkListDrawer}>{text}</Button>,
        },
        {
        title: '작업',
        dataIndex: 'work',
        align:'center',
        render: (text) => <Button type="link">{text}</Button>,
        },
    ];
    const data = [
        {
        key: '1',
        name: '김미영',
        openname: '김덕후',
        num: 'BNK20211012101903141396',
        sort: '개인',
        contribute: '주식투자 무작정 따라하기',
        intro: '보기',
        coPart: '입력해 주세요',
        work : '',
        },
        {
        key: '2',
        name: '김미영',
        openname: '김덕후',
        num: 'BNK20211012101903141396',
        sort: '개인',
        contribute: '주식투자 무작정 따라하기',
        intro: '',
        coPart: '저자, 편집',
        work: '추가',
        },
    ];

    const { commonStore } = useStore();
    const state = useLocalStore(() => ({ ...DEF_STATE }));
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

    const popContent = (
      <div>
        <Space direction="vertical">
        <Text type="secondary">-기여자이면서 저작권료를 받는 저작권자라면 체크해 주세요. ‘저작권자’ 지정 화면에 반영됩니다.</Text>
        <Text type="secondary">-세금/계좌 정보가 등록되어 있어야 저작권자로 지정할 수 있습니다.</Text>
        </Space>
      </div>
    );

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
            </Row>
            <div className="intxtBox">
                <Space direction="vertical">
                    <Text type="">* 이곳에서는 이미 등록된 기여자만 지정할 수 있습니다. <Text type="danger">신규 등록은 ‘기여자/저작권자 - 국내 또는 해외’ 메뉴를 이용</Text>해 주세요.</Text>
                    <Text type="">* 해외(수입) 저작권 관련 권리자, 중개자(에이전시)는 ‘저작권자'에서 지정합니다. 이곳에는 기여자만 지정해 주세요.</Text>
                </Space>
                <Button className="btn-primary btn_authorsrch" type="button" onClick={showDrawer}>+</Button>
            </div>

            <div className="tableWrapper">
                <Popover placement="leftBottom" content={popContent} className="setpopover">
                    <Button className="btn-popover" shape="circle" icon={<QuestionOutlined style={{fontSize: "11px"}} />} size="small" />
                </Popover>
                <Table columns={listColumns} dataSource={listData} />
            </div>

            <Drawer
                title="기여자/저작권자 검색"
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
                    <Table columns={columns} dataSource={data} />
                </div>
            </Drawer>

            <Drawer
                title="기여 구분 선택"
                placement='right'
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
                        <Button onClick={onClose}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >
                <div>
                    <Radio.Group name="radiogroup" defaultValue={1}>
                        <Radio value={1}>저자</Radio>
                        <Radio value={2}>번역</Radio>
                        <Radio value={3}>감수</Radio>
                        <Radio value={4}>삽화</Radio>
                        <Radio value={5}>사진</Radio>
                        <Radio value={6}>기획</Radio>
                        <Radio value={7}>편집</Radio>
                    </Radio.Group>
                </div>

                <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                    <Col>
                        <Button type="primary">확인</Button>
                    </Col>
                </Row>
            </Drawer>
        </Wrapper>
    );
});

export default paperBook;
