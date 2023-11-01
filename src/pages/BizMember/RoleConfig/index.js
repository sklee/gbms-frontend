/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect } from 'react';
import { Row, Col, Radio, Checkbox, Button, Space } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import {
  FlexGrid,
  FlexGridColumn,
  FlexGridCellTemplate,
} from '@grapecity/wijmo.react.grid';
import { toJS } from 'mobx';
import moment from 'moment';

import useStore from '@stores/useStore';
import { RESPONSIBILITIES_DATA } from '@shared/constants';

import RoleGrid from './RoleGrid';

const Wrapper = styled.div`
  width: 100%;

  .table {
    width: 100%;
    margin: 0 !important;

    .ant-col {
      padding: 10px;
      border: 1px solid #eee;
      border-collapse: collapse;
    }
    .label {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #fafafa;
    }
  }
`;

const DEF_STATE = {
  userPart: '',
  responsibilities: [],
  roleData: null,
  roleType: '일반',

  isReset: false,
};

const RoleConfig = observer(
  ({ current, defaultData, handleChangeStep, handleSubmitFinal }) => {
    const { commonStore } = useStore();

    const state = useLocalStore(() => ({ ...DEF_STATE }));

    const handleChangeCheckbox = useCallback(
      (type) => (value) => {
        state[type] = value;
      },
      [],
    );

    const handleChangeRadio = useCallback(
      (type) => (e) => {
        state[type] = e.target.value;
      },
      [],
    );

    const setRoleData = useCallback((value) => {
      state.roleData = value;
    }, []);

    const handleSubmit = useCallback((e) => {
      const value = {
        userPart: state.userPart,
        responsibilities: toJS(state.responsibilities),
        roleData: toJS(state.roleData),
        roleType: state.roleType,
      };
      handleSubmitFinal(value);
    }, []);

    const handleReset = useCallback((e) => {
      return window.ask({
        title: `이 창의 입력 내용이 삭제됩니다.`,
        content: `그래도 계속 하시겠습니까?`,
        async onOk() {
          state.isReset = true;
          setTimeout(() => {
            for (const key in DEF_STATE) {
              state[key] = DEF_STATE[key];
            }
            handleChangeStep(1);
          }, 10);
        },
      });
    }, []);

    useEffect(() => {
      if (defaultData) {
        if (defaultData.userPart) {
          state.userPart = defaultData.userPart;
        }
        if (defaultData.responsibilities) {
          state.responsibilities = defaultData.responsibilities;
        }
      }
    }, [defaultData]);

    return (
      <Wrapper>
        <Row gutter={[10, 10]} style={{ marginBottom: 15 }}>
          <Col xs={24}>
            <Radio.Group
              value={state.roleType}
              onChange={handleChangeRadio('roleType')}
              buttonStyle="solid"
              disabled={current !== 2}
            >
              <Radio.Button value="일반">일반</Radio.Button>
              <Radio.Button value="주문SCM">주문SCM</Radio.Button>
              <Radio.Button value="관리">관리</Radio.Button>
            </Radio.Group>
          </Col>
          <Col xs={24}>
            <Radio.Group
              value={state.userPart}
              onChange={handleChangeRadio('userPart')}
              disabled={current !== 2}
            >
              <Radio value="부서책임자">부서 책임자</Radio>
              <Radio value="책임대행">책임 대행</Radio>
              <Radio value="팀원">팀원</Radio>
            </Radio.Group>
          </Col>
          <Col xs={24}>
            <Checkbox.Group
              options={RESPONSIBILITIES_DATA}
              value={toJS(state.responsibilities)}
              onChange={handleChangeCheckbox('responsibilities')}
              disabled={current !== 2}
            />
          </Col>
        </Row>

        {!state.isReset && (
          <RoleGrid disabled={current !== 2} setRoleData={setRoleData} />
        )}

        <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
          <Col>
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={current !== 2}
            >
              최종 저장
            </Button>
          </Col>
          <Col>
            <Button
              htmlType="button"
              disabled={current !== 2}
              onClick={handleReset}
            >
              취소
            </Button>
          </Col>
        </Row>
      </Wrapper>
    );
  },
);

export default RoleConfig;
