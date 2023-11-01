import React, { useState } from 'react';
import {Row, Col, Button, Drawer, Radio} from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

const Wrapper = styled.div`
    width: 100%;height:100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
    #tplBtnViewMode {
        display: none;
    }
`;

export default function Approval({visibleClose, visible}) {
    const state = useLocalStore(() => ({
        drawerback : 'drawerWrap',
    }));

    const [value, setValue] = useState(1);

    const onChange = (e) => {
        setValue(e.target.value);
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
            <Drawer
                title='입금 승인'
                placement='right'
                onClose={visibleClose}
                visible={visible}
                closable={false}
                keyboard={false}
                className={state.drawerback}
                extra={
                    <>
                        <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={visibleClose}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >
                <Row>
                    <Col span={24}>
                        <Radio.Group onChange={onChange} value={value}>
                            <Radio value={1}>담당 단계만 승인</Radio>
                            <Radio value={2}>1, 2차 모두 승인</Radio>
                        </Radio.Group>
                    </Col>
                </Row>

                <Row justify='center' style={{marginTop: 25}}>
                    <Button>확인</Button>
                </Row>
            </Drawer>
        </Wrapper>
    )
}
