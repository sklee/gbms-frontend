/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect } from 'react';
import { Steps, Grid, Row, Col, Card } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import { toJS } from 'mobx';

import useStore from '@stores/useStore';
import useBreakpoint from '@utils/useBreakpoint';

import Loading from '@components/Common/Loading';

import DefaultInfo from './DefaultInfo';
import AdditionalInfo from './AdditionalInfo';
import RoleConfig from './RoleConfig';

const { Step } = Steps;

const Wrapper = styled.div`
  width: 100%;

  .ant-card {
    margin-top: 20px;
  }
`;

const StyledSteps = styled(Steps)`
  width: 400px;

  ${(props) => props.theme.breakpoint('xs', 'lg')`
    width: 100%;
  `}
`;

const StyledRow = styled(Row)`
  ${(props) =>
    props.current === 0
      ? `
    .step-0 {
      display: block;
    }
    .step-2 {
      display: none;
    }
  `
      : props.current === 1 || props.current === 2
      ? `
    .step-0 {
      display: none;
    }
    .step-2 {
      display: block;
    }
  `
      : null}

  ${(props) => props.theme.breakpoint('xs', 'xl')`
    ${(props) =>
      props.current === 0
        ? `
      .step-0 {
        display: block;
      }
      .step-1, .step-2 {
        display: none;
      }
    `
        : props.current === 1
        ? `
      .step-1 {
        display: block;
      }
      .step-0, .step-2 {
        display: none;
      }
    `
        : `
      .step-2 {
        display: block;
      }
      .step-0, .step-1 {
        display: none;
      }
    `}
  `}
`;

export default observer(() => {
  const screen = useBreakpoint();
  const { commonStore } = useStore();

  const state = useLocalStore(() => ({
    loading: false,
    current: 0,
    isResetAll: false,

    defaultData: null,
    additionalData: null,
  }));

  const saveFile = useCallback((file) => {
    return new Promise(async (resolve) => {
      const formData = new FormData();
      formData.append('file', file);
      const result = await commonStore.handleApi({
        method: 'POST',
        url: '/upload/memberFile',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(result);

      resolve(result);
    });
  }, []);

  const handleSubmitFinal = useCallback(async (value) => {
    state.loading = true;
    const defaultData = toJS(state.defaultData);
    const additionalData = toJS(state.additionalData);
    const data = {
      ...defaultData,
      ...additionalData,
      ...value,
    };
    console.log(data);

    if (data.file1) {
      data.file1 = await saveFile(data.file1);
    }
    if (data.file2) {
      data.file1 = await saveFile(data.file2);
    }

    const result = await commonStore.handleApi({
      method: 'POST',
      url: '/member/create',
      data,
    });

    state.isResetAll = true;
    setTimeout(() => {
      state.defaultData = null;
      state.additionalData = null;
      state.isResetAll = false;
      handleChangeStep(0);
      state.loading = false;
    }, 10);
  }, []);

  const setData = useCallback((type, value, step) => {
    state[type] = value;
    handleChangeStep(step);
  }, []);

  const handleChangeStep = useCallback((value) => {
    setTimeout(() => {
      state.current = value;
    }, 100);
  }, []);

  return (
    <Wrapper>
      <Loading loading={state.loading} />

      {/*<StyledSteps
        size="small"
        current={state.current}
        onChange={handleChangeStep}
      >
        <Step title="기본정보입력" disabled={true} />
        <Step title="추가정보입력" disabled={true} />
        <Step title="권한설정" disabled={true} />
      </StyledSteps>*/}

      <Steps size="small" current={state.current} onChange={handleChangeStep}>
        <Step title="기본정보입력" />
        <Step title="추가정보입력" />
        <Step title="권한설정" />
      </Steps>

      <StyledRow gutter={[20, 20]} current={state.current} screen={screen}>
        <Col xs={24} xl={12} className="step-0">
          <Card>{!state.isResetAll && <DefaultInfo setData={setData} />}</Card>
        </Col>
        <Col xs={24} xl={12} className="step-1">
          <Card>
            {!state.isResetAll && (
              <AdditionalInfo
                current={state.current}
                setData={setData}
                defaultData={toJS(state.defaultData)}
                handleChangeStep={handleChangeStep}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} xl={12} className="step-2">
          <Card>
            {!state.isResetAll && (
              <RoleConfig
                current={state.current}
                defaultData={toJS(state.defaultData)}
                handleSubmitFinal={handleSubmitFinal}
                handleChangeStep={handleChangeStep}
              />
            )}
          </Card>
        </Col>
      </StyledRow>
    </Wrapper>
  );
});
