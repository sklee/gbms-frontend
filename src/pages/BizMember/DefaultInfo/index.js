/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect } from 'react';
import { Row, Col, Radio, Checkbox, Button, Space, Input } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
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
import {
  PART_DATA,
  RESPONSIBILITIES_DATA,
  FLOOR_DATA,
} from '@shared/constants';

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
  userIdType: 'email',
  email: '',
  userPart: '부서책임자',
  responsibilities: [],
  partGrid: null,

  // DB Data
  mem_username: '',
  mem_userid: '',
  mem_email: '',
  mem_password: '',
  mei_department: '출판',
  mei_class: '대표',
  mei_part: '대표',
  mei_call_num: '',
  mem_phone: '',
  mem_enter_date: moment().toDate(),
  mem_birthday: moment()
    .subtract(30, 'years')
    .set({ month: 0, date: 1 })
    .toDate(),
  mei_start_time: moment().set({ hour: 9, minute: 0 }).toDate(),
  mei_end_time: moment().set({ hour: 18, minute: 0 }).toDate(),
  mei_floor: 1,
  mei_mbti: '',
  mei_memo: '',
  mem_adminmemo: '',
};

const DefaultInfo = observer(({ setData, handleChangeStep }) => {
  const { commonStore } = useStore();

  const state = useLocalStore(() => ({ ...DEF_STATE }));

  const handleChangeSelect = useCallback(
    (type) => (e) => {
      state[type] = e.selectedValue;
    },
    [],
  );

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

  const handleChangeInput = useCallback(
    (type) => (e) => {
      if (type === 'mei_call_num' || type === 'mem_phone') {
        state[type] = e.rawValue;
      } else if (type === 'mei_memo' || type === 'mem_adminmemo') {
        state[type] = e.target.value;
      } else {
        state[type] = e.selectedValue;
      }
    },
    [],
  );

  const handleCheckEmail = useCallback(async (e) => {
    // const res = await commonStore.handleApi({
    //   method: 'POST',
    //   url: '/member/checkEmail',
    //   data: { email: state.email },
    // });
    // console.log(res);
  }, []);

  const handleChangePart = useCallback((e) => {
    state.mei_part = e.panel.grid.getCellData(e.row, e.col);
  }, []);

  const handleChangeDate = useCallback(
    (type) => (date) => {
      state[type] = date.value;
    },
    [],
  );

  const handleSubmit = useCallback((e) => {
    const data = toJS(state);
    data.partLabel = data.mei_part;

    let isFind = false;
    for (const item of PART_DATA) {
      if (item.label === data.mei_part) {
        data.mei_part = item.value;
        break;
      }
      if (item.children) {
        for (const c of item.children) {
          if (c.label === data.mei_part) {
            data.mei_part = c.value;
            isFind = true;
            break;
          }

          if (c.children) {
            for (const cc of c.children) {
              if (cc.label === data.mei_part) {
                data.mei_part = c.value;
                isFind = true;
                break;
              }
            }
          }

          if (isFind) {
            break;
          }
        }
      }

      if (isFind) {
        break;
      }
    }

    const value = {
      mem: {},
      mei: {},
    };
    for (const key in data) {
      if (key === 'partGrid') {
        continue;
      }
      if (/^mem/.test(key)) {
        value.mem[key] = data[key];
      } else if (/^mei/.test(key)) {
        value.mei[key] = data[key];
      } else {
        value[key] = data[key];
      }
    }

    setData('defaultData', value, 1);
  }, []);

  const handleReset = useCallback(() => {
    return window.ask({
      title: `이 창의 입력 내용이 삭제됩니다.`,
      content: `그래도 계속 하시겠습니까?`,
      async onOk() {
        for (const key in DEF_STATE) {
          if (key === 'partGrid') {
            continue;
          }
          if (key === 'mei_part') {
            state.partGrid.select(new CellRange(0, 0));
          }
          state[key] = DEF_STATE[key];
        }
      },
    });
  }, []);

  useEffect(() => {}, []);

  return (
    <Wrapper>
      <Row gutter={[10, 10]} align="middle" style={{ marginBottom: 15 }}>
        <Col xs={24} lg={6}>
          <Radio.Group
            value={state.userIdType}
            onChange={handleChangeRadio('userIdType')}
          >
            <Radio value="email">회사 메일로 추가</Radio>
          </Radio.Group>
        </Col>
        <Col xs={24} lg={9}>
          <Space>
            <ComboBox
              selectedValue={state.email}
              textChanged={handleChangeInput('email')}
              isDisabled={state.userIdType !== 'email'}
              trimText={true}
            />
            <Button
              onClick={handleCheckEmail}
              disabled={state.userIdType !== 'email'}
            >
              확인
            </Button>
          </Space>
        </Col>
        <Col xs={24} lg={8}>
          <Radio.Group
            value={state.userIdType}
            onChange={handleChangeRadio('userIdType')}
          >
            <Radio value="userid">아이디/비밀번호로 추가</Radio>
          </Radio.Group>
        </Col>
      </Row>

      <Row gutter={10} className="table">
        <Col xs={8} lg={4} className="label">
          이름
        </Col>
        <Col xs={16} lg={8}>
          <ComboBox
            name="mem_username"
            selectedValue={state.mem_username}
            textChanged={handleChangeInput('mem_username')}
          />
        </Col>
        <Col xs={8} lg={4} className="label">
          아이디
        </Col>
        <Col xs={16} lg={8}>
          <ComboBox
            name="mem_userid"
            selectedValue={state.mem_userid}
            textChanged={handleChangeInput('mem_userid')}
          />
        </Col>
        <Col xs={8} lg={4} className="label">
          메일
        </Col>
        <Col xs={16} lg={8}>
          <ComboBox
            name="mem_email"
            selectedValue={state.mem_email}
            textChanged={handleChangeInput('mem_email')}
          />
        </Col>
        <Col xs={8} lg={4} className="label">
          비밀번호
        </Col>
        <Col xs={16} lg={8}>
          <ComboBox
            name="mem_password"
            selectedValue={state.mem_password}
            textChanged={handleChangeInput('mem_password')}
          />
        </Col>
        <Col xs={8} lg={4} className="label">
          소속회사
        </Col>
        <Col xs={16} lg={8}>
          <Radio.Group
            name="mei_department"
            value={state.mei_department}
            onChange={handleChangeRadio('mei_department')}
          >
            <Radio value="출판">도서출판 길벗</Radio>
            <Radio value="스쿨">길벗스쿨</Radio>
          </Radio.Group>
        </Col>
        <Col xs={8} lg={4} className="label">
          직급
        </Col>
        <Col xs={16} lg={8}>
          <Radio.Group
            name="mei_class"
            value={state.mei_class}
            onChange={handleChangeRadio('mei_class')}
          >
            <Radio value="대표">대표</Radio>
            <Radio value="이사">이사</Radio>
            <Radio value="부장">부장</Radio>
            <Radio value="차장">차장</Radio>
            <Radio value="과장">과장</Radio>
            <Radio value="대리">대리</Radio>
            <Radio value="사원">사원</Radio>
            <Radio value="인턴">인턴</Radio>
          </Radio.Group>
        </Col>
        <Col xs={8} lg={4} className="label">
          부서
        </Col>
        <Col xs={16} lg={8}>
          <FlexGrid
            initialized={(grid) => (state.partGrid = grid)}
            itemsSource={PART_DATA}
            headersVisibility="None"
            childItemsPath={'children'}
            selectionMode="Row"
            onSelectionChanged={handleChangePart}
          >
            <FlexGridColumn binding="label" dataType="String" width="*" />
          </FlexGrid>
        </Col>
        <Col xs={24} lg={12} style={{ padding: 0 }}>
          <Row style={{ height: '100%' }}>
            <Col xs={8} className="label">
              역할
            </Col>
            <Col xs={16}>
              <Radio.Group
                value={state.userPart}
                onChange={handleChangeRadio('userPart')}
              >
                <Radio value="부서책임자">부서 책임자</Radio>
                <Radio value="책임대행">책임 대행</Radio>
                <Radio value="팀원">팀원</Radio>
              </Radio.Group>
            </Col>
            <Col xs={8} className="label">
              담당업무
            </Col>
            <Col xs={16}>
              <Checkbox.Group
                options={RESPONSIBILITIES_DATA}
                value={toJS(state.responsibilities)}
                onChange={handleChangeCheckbox('responsibilities')}
              />
            </Col>
          </Row>
        </Col>
        <Col xs={8} lg={4} className="label">
          내선
        </Col>
        <Col xs={16} lg={8}>
          <InputMask
            name="mei_call_num"
            mask="0000"
            rawValue={state.mei_call_num}
            valueChanged={handleChangeInput('mei_call_num')}
          />
        </Col>
        <Col xs={8} lg={4} className="label">
          휴대폰
        </Col>
        <Col xs={16} lg={8}>
          <InputMask
            name="mem_phone"
            mask="000-0000-0000"
            rawValue={state.mem_phone}
            valueChanged={handleChangeInput('mem_phone')}
          />
        </Col>
        <Col xs={8} lg={4} className="label">
          입사일
        </Col>
        <Col xs={16} lg={8}>
          <InputDate
            value={state.mem_enter_date}
            valueChanged={handleChangeDate('mem_enter_date')}
          />
        </Col>
        <Col xs={8} lg={4} className="label">
          생일
        </Col>
        <Col xs={16} lg={8}>
          <InputDate
            value={state.mem_birthday}
            valueChanged={handleChangeDate('mem_birthday')}
          />
        </Col>
        <Col xs={8} lg={4} className="label">
          근무시간과 위치
        </Col>
        <Col xs={16} lg={8}>
          <Space style={{ display: 'flex', flexWrap: 'wrap' }}>
            <InputTime
              value={state.mei_start_time}
              valueChanged={handleChangeDate('mei_start_time')}
            />
            <span>~</span>
            <InputTime
              value={state.mei_end_time}
              valueChanged={handleChangeDate('mei_end_time')}
            />
            <ComboBox
              name="mei_floor"
              itemsSource={FLOOR_DATA}
              selectedValue={state.mei_floor}
              selectedIndexChanged={handleChangeSelect('mei_floor')}
              displayMemberPath="label"
              selectedValuePath="value"
            />
          </Space>
        </Col>
        <Col xs={8} lg={4} className="label">
          MBTI
        </Col>
        <Col xs={16} lg={8}>
          <ComboBox
            name="mei_mbti"
            selectedValue={state.mei_mbti}
            textChanged={handleChangeInput('mei_mbti')}
          />
        </Col>
        <Col xs={8} lg={4} className="label">
          공개 메모
        </Col>
        <Col xs={16} lg={8}>
          <Input.TextArea
            name="mei_memo"
            rows={4}
            value={state.mei_memo}
            onChange={handleChangeInput('mei_memo')}
          />
        </Col>
        <Col xs={8} lg={4} className="label">
          관리 메모
        </Col>
        <Col xs={16} lg={8}>
          <Input.TextArea
            name="mem_adminmemo"
            rows={4}
            value={state.mem_adminmemo}
            onChange={handleChangeInput('mem_adminmemo')}
          />
        </Col>
      </Row>

      <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
        <Col>
          <Button type="primary" onClick={handleSubmit}>
            저장 후 다음
          </Button>
        </Col>
        <Col>
          <Button htmlType="button" onClick={handleReset}>
            취소
          </Button>
        </Col>
      </Row>
    </Wrapper>
  );
});

export default DefaultInfo;
