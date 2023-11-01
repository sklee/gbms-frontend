/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { Layout, Steps, Grid, Row, Col, Button, Card, Space, Breadcrumb, Modal, message } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';

import useStore from '@stores/useStore';
import useBreakpoint from '@utils/useBreakpoint';

import Loading from '@components/Common/Loading';

import DefaultInfo from './DefaultInfo';
import AuthorInfo from './AuthorInfo';
import Copyright from './Copyright';

const { Step } = Steps;
const steps = [
  {
    title: '기본 정보',
    key:'step1',
  },
  {
    title: '기여자',
    key:'step2',
  },
  {
    title: '저작권자',
    key:'step3',
  },
  {
    title: '출시 정보',
    key:'step4',
  },
  {
    title: '홈페이지 정보',
    key:'step5',
  },
];
const { Content } = Layout;

const Wrapper = styled.div`
  width: 100%;

  .ant-card {
    margin-top: 20px;
  }
`;
const DEF_STATE = {
    loading: false,
    current: 0,
    isResetAll: false,

    defaultData: null,
    additionalData: null,
};

export default observer(() => {
    const screen = useBreakpoint();
    const { commonStore } = useStore();

    const state = useLocalStore(() => ({ ...DEF_STATE }));


    const setData = useCallback((type, value, step) => {
        state[type] = value;
    }, []);

    const [current, setCurrent] = useState(0);
    const { confirm } = Modal;


    const next = () => {
        if(current===0) {
            var tit = '저장했습니다. ‘저자/기여자’ 정보를 입력해 주세요.';
        }else if(current===1){
            var tit = '저장했습니다. ‘저작권자’ 정보를 입력해 주세요.';
        }
        confirm({
            title: tit,
            icon: <ExclamationCircleOutlined />,
            onOk() {
              setCurrent(current + 1);
            },
            onCancel() {
              console.log('Cancel');
            },
        });
    };

    const prev = () => {
        setCurrent(current - 1);
    };

    const handleReset = useCallback(() => {
        message.info('입력이 취소됐습니다.');
    }, []);

    return (
        <Wrapper>
            
            <Row justify="space-between" align="bottom">
                <Col span={16}>
                    <Steps current={current} size="small" style={{maxWidth:800}}>
                        {steps.map((item) => (
                            <Step key={item.key} title={item.title} />
                        ))}
                    </Steps>
                </Col>
                <Col span={4}>
                  <Button className="btn_info" style={{float: 'right'}}>제작/입고 정보</Button>
                </Col>
            </Row>
            <Card>
                <div className="steps-content">
                    {!state.isResetAll &&
                        <>
                    {
                    current === 0
                    ? <DefaultInfo setData={setData} />
                    : ( current === 1
                        ? <AuthorInfo setData={setData} />
                        : ( current === 2
                            ? <Copyright setData={setData} />
                            : <DefaultInfo setData={setData} />
                          )
                      )
                    }
                        </>
                    }
                </div>
                <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                    <Col>
                        {current < steps.length - 1 && (
                            <Button type="primary" onClick={() => next()}>
                                확인
                            </Button>
                        )}
                        {current === steps.length - 1 && (
                            <Button type="primary" onClick={() => message.success('Processing complete!')}>
                                확인
                            </Button>
                        )}
                        <Button htmlType="button" onClick={handleReset} style={{marginLeft:'10px'}}>취소</Button>
                    </Col>
                </Row>
            </Card> 
        </Wrapper>
    );
});