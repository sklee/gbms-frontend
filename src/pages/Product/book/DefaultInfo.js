/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { Card, Form, Row, Col, Radio, Checkbox, Button, Space, Typography, Input, Drawer, Table, Search, DatePicker, Modal, Steps, Popover, message } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import Icon, { QuestionOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import {
  ComboBox,
  InputMask,
  InputDate,
  InputTime,
} from '@grapecity/wijmo.react.input';
import { Control, isUndefined } from '@grapecity/wijmo';
import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { CellRange } from '@grapecity/wijmo.grid';
import { toJS } from 'mobx';
import moment from 'moment';
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
`;

const DEF_STATE = {

};


const paperBook = observer(({ setData, handleChangeStep }) => {
    const { commonStore } = useStore();

    const state = useLocalStore(() => ({ ...DEF_STATE }));

    const state_search = useLocalStore(() => ({
        list: [],
    }));

    

    

    const [linkPrd_chk, setLinkPrdChk] = useState(false);
    const dateFormat = 'YYYY-MM-DD';
    const { Text, Link } = Typography;



    const popContent = (
      <div>
        <Space direction="vertical">
        <Text type="secondary">-서점, 홈페이지 등에서 공식적으로 사용되는 상품명입니다.</Text>
        <Text type="secondary">-나중에 출시 단계에서 수정할 수도 있으니, 임시 상품명을 적어도 됩니다.</Text>
        </Space>
      </div>
    );

    const popContent2 = (
      <div>
        <Text type="secondary">-내부 관리용 상품명으로, 마케팅부서에서 사용하니 상품 담당자는 수정하지 않아도 됩니다.</Text>
      </div>
    );


    return (
        <Wrapper>
            <Row gutter={10} className="table">
                <Col xs={4} lg={8} xl={4} className="label">
                    회사
                </Col>
                <Col xs={20} lg={16} xl={8}>
                    도서출판 길벗
                </Col>
                <Col xs={4} lg={8} xl={4} className="label">
                    브랜드
                </Col>
                <Col xs={20} lg={16} xl={8}>
                    도서출판 길벗
                </Col>
                <Col xs={4} lg={8} xl={4} className="label">
                    상품 종류
                </Col>
                <Col xs={20} lg={16} xl={8}>
                    종이책(단독)
                </Col>
                <Col xs={4} lg={8} xl={4} className="label">
                    상품 코드
                </Col>
                <Col xs={20} lg={16} xl={8}>
                    GBO1A2B
                </Col>
                <Col xs={4} lg={8} xl={4} className="label">
                    상품명(공식) * 
                    <Popover content={popContent}>
                        <Button className="btn-popover" shape="circle" icon={<QuestionOutlined style={{fontSize: "11px"}} />} size="small" style={{marginLeft: '5px'}} />
                    </Popover>
                </Col>
                <Col xs={20} lg={16} xl={8}>
                    <Input name="bookName" placeholder="" />
                </Col>
                <Col xs={4} lg={8} xl={4} className="label">
                    상품명(내부용) * 
                    <Popover content={popContent2}>
                        <Button className="btn-popover" shape="circle" icon={<QuestionOutlined style={{fontSize: "11px"}} />} size="small" style={{marginLeft: '5px'}} />
                    </Popover>
                </Col>
                <Col xs={20} lg={16} xl={8}>
                    <Input name="internalName" placeholder="" />
                </Col>
                <Col xs={4} lg={8} xl={4} className="label">
                    출시 예정(목표)일
                </Col>
                <Col xs={20} lg={16} xl={8}>
                    <Space direction="vertical">
                        <DatePicker name="GPC_DUE_DT" format={dateFormat} />
                        <Text type="danger">* 등록해 주시면 연관 부서의 후속조치 계획 수립 등에 큰 도움이 됩니다.</Text>
                    </Space>
                </Col>
            </Row>
        </Wrapper>
    );
});

export default paperBook;
