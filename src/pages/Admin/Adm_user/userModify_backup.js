/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect } from 'react';
import { Form, Input, Switch, DatePicker, Radio, InputNumber, Drawer, Button, Col, Checkbox, Row, TimePicker, Select } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { toJS } from 'mobx';
import moment from 'moment';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import { validateMessages } from '@utils/customFormValidator';
// import MemberChanged from './MemberChanged';
// import MemberUsage from './MemberUsage';

import {
  PART_DATA,
  RESPONSIBILITIES_DATA,
  FLOOR_DATA,
} from '@shared/constants';

// import CustomModal from '@components/CustomModal';

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
const { Option } = Select;

const UserModify = observer(
  ({ modifyOpen, refetch, propData = {}, handleModify, setLoading }) => {
    const [form] = Form.useForm();

    const { commonStore } = useStore();
    const state = useLocalStore(() => ({
      logs: [],
      usage_logs: [],
      partGrid: null,
      responsibilities: [],
      changeOpen : false,
      usageOpen : false,
      categories: [],
      get categoriesVal() {
        return toJS(state.categories);
      },
    }));

    const handleClose = useCallback(() => {
      form.resetFields();
      handleModify(false)();
    }, []);

    const handleValidate = useCallback(async () => {
      return form
        .validateFields()
        .then((values) => {
          handleSubmit(values);
        })
        .catch((errorInfo) => {
          if (errorInfo.errorFields[0]) {
            form.scrollToField(errorInfo.errorFields[0].name);
          }
        });
    }, [propData]);

    const handleSubmit = useCallback(
      async (values) => {
        setLoading(true);
        const data = {
          ...values,
        };

        if (data.GM_BIRTHDATE) {
          data.GM_BIRTHDATE = moment(data.GM_BIRTHDATE).format('YYYY-MM-DD');
        }
        if (data.password && !data.password.length) {
          delete data.password;
        }

        let title = '';

        if (propData.user_id) {
          const result = await commonStore.handleApi({
            method: 'POST',
            url: 'member/update',
            data: { user_id: propData.user_id, updateData: data },
          });
          if (result.error) {
            title = result.error;
            window.alert({ title });
          } else {
            title = `${propData.user_id} 회원정보가 수정되었습니다.`;
            if (refetch) {
              await refetch();
            }
            form.resetFields();
            setLoading(false);
            window.success({ title });
            handleClose();
          }
          
        } else {
          const result = await commonStore.handleApi({
            method: 'POST',
            url: 'member/create',
            data : data
          });
          if (result.error) {
            title = result.error;
            window.alert({ title });
          } else {
            title = `${values.GM_ID} 회원이 등록되었습니다.`;
            if (refetch) {
              await refetch();
            }
            form.resetFields();
            setLoading(false);
            window.success({ title });
            handleClose();
          }
        }
      },
      [propData],
    );

    const handlechange = useCallback(
      (drawerOpen, data) => async() => {
        if (drawerOpen && propData.user_id) {
          state.selectedData_dr = propData;

          commonStore.loading = true;
          const result = await commonStore.handleApi({
            method: 'POST',
            url: 'member/changeHistory',
            data : { GM_ID : propData.user_id, }
          });

          if (result) {
            state.logs = result;
          }
          commonStore.loading = false;
        } else {
          state.selectedData_dr = {};
        }
        state.changeOpen = drawerOpen;
      },
      [propData],
    );

    const handleUsage = useCallback(
      (drawerOpen, data) => async() => {
        if (drawerOpen && propData.user_id) {
          state.selectedData_dr = propData;

          commonStore.loading = true;
          const result = await commonStore.handleApi({
            method: 'POST',
            url: 'member/usageHistory',
            data : { GM_ID : propData.user_id, }
          });

          if (result) {
            state.usage_logs = result;
          }
          commonStore.loading = false;
        } else {
          state.selectedData_dr = {};
        }
        state.usageOpen = drawerOpen;
      },
      [propData],
    );

    const handleChangePart = useCallback((e) => {
      state.mei_part = e.panel.grid.getCellData(e.row, e.col);
    }, []);

    useEffect(() => {
      if (form) {
        form.resetFields();
      }
    }, [propData, form]);

    return (
      <Drawer
        title={<Col>
                <Button onClick={handleClose} type="primary">기본 정보</Button>
                <Button onClick={handlechange(true,propData)} disabled={propData.user_id ? false : true}>변경 이력</Button>
                <Button onClick={handleUsage(true)} disabled={propData.user_id ? false : true}>사용 기록</Button>
            </Col>
        }
        visible={modifyOpen}
        width='1560'
        onClose={handleClose}
        forceRender={true}
        zIndex='1'
        keyboard={false}
      >
        <Wrapper>
        <Form
          form={form}
          layout="horizontal"
          name="member_modify"
          preserve={false}
          initialValues={{
            user_id: propData.user_id || '',
            password: '',
            email: propData.email || '',
            user_name: propData.user_name || '',
            phone: propData.phone || '',
            birthday: moment(propData.birthday) || null,
            gender : propData.gender || 1,
            is_admin: propData.is_admin || 0,
          }}
          validateMessages={validateMessages}
          scrollToFirstError
        >

          <Row gutter={10} >
            <Col span={12} >
              <Form.Item
                name="GM_ACCOUNT_TYPE"
                label="계정 구분"
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  <Radio value="GOOGLE">회사 구글 계정 연결</Radio>
                  <Radio value="ACCOUNT">계정 생성</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={10} >
            <Col span={12} >
              <Form.Item
                name="GM_GOOGLE_ACCOUNT"
                label="회사 구글 계정"
                rules={[{ required: true }]}
              >
                <Input suffix="@gilbut.co.kr" addonAfter={<Button type="primary">연결</Button>}/>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={10} >
            <Col span={4} >
              <Form.Item
                name="user_id"
                label="아이디"
                rules={[{ required: true }]}
              >
                <Input disabled={Boolean(propData.user_id)} />
              </Form.Item>
            </Col>
            <Col span={4} >
              <Form.Item
                name="password"
                label="비밀번호"
                rules={[{ required: propData.password ? false : true }]}
              >
                <Input.Password
                  placeholder={propData.user_id ? '입력 시 비밀번호 변경' : ''}
                />
              </Form.Item>
            </Col>
            <Col span={4} >
              <Form.Item
                name="email"
                label="E-Mail"
                rules={[
                  {
                    required: true,
                    pattern: /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i,
                  },
                ]}
              >
                <Input disabled={Boolean(propData.user_id)} />
              </Form.Item>
              </Col>
          </Row>

          <Row gutter={10} >
            <Col span={4} >
              <Form.Item
                name="user_name"
                label="이름"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={4} >
              <Form.Item
                name="user_nick_name"
                label="별명"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={10} >
            <Col span={6} >
              <Form.Item
                name="office_phone"
                label="회사 전화번호"
                rules={[{ required: true, pattern: /^010-\d{4}-\d{4}$/ }]}
              >
                <Input placeholder="010-0000-0000" />
              </Form.Item>
            </Col>
            <Col span={6} >
              <Form.Item
                name="phone"
                label="핸드폰"
                rules={[{ required: true, pattern: /^010-\d{4}-\d{4}$/ }]}
              >
                <Input placeholder="010-0000-0000" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={10} >
            <Col span={6} >
              <Form.Item
                name="company"
                label="소속 회사"
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  <Radio value="출판">도서출판 길벗</Radio>
                  <Radio value="스쿨">길벗스쿨</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={6} >
              <Form.Item
                name="GM_POSITION"
                label="직급"
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  <Radio value="대표">대표</Radio>
                  <Radio value="이사">이사</Radio>
                  <Radio value="부장">부장</Radio>
                  <Radio value="차장">차장</Radio>
                  <Radio value="과장">과장</Radio>
                  <Radio value="대리">대리</Radio>
                  <Radio value="사원">사원</Radio>
                  <Radio value="인턴">인턴</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={10} >
            <Col span={6} >
              <Form.Item
                name="GM_DEPARTMENT"
                label="부서"
                // rules={[{ required: true }]}
              >
                <FlexGrid
                  initialized={(grid) => (propData.GM_DEPARTMENT = grid)}
                  itemsSource={PART_DATA}
                  headersVisibility="None"
                  childItemsPath={'children'}
                  selectionMode="Row"
                  onSelectionChanged={handleChangePart}
                >
                  <FlexGridColumn binding="label" dataType="String" width="*" />
                </FlexGrid>
              </Form.Item>
            </Col>
            <Col span={6} >
              <Form.Item
                name="GM_DEPARTMENT_ROLE"
                label="부서 내 역할"
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  <Radio value="부서책임자">부서 책임자</Radio>
                  <Radio value="책임대행">책임 대행</Radio>
                  <Radio value="파트장">파트장</Radio>
                  <Radio value="팀원">팀원</Radio>
                  <Radio value="인턴">인턴</Radio>
                </Radio.Group> 
              </Form.Item>
              <Form.Item
                name="GM_RESPONSIBILITIES"
                label="담당 업무"
                rules={[{ required: true }]}
              >
                <Checkbox.Group
                    options={RESPONSIBILITIES_DATA}
                    value={toJS(state.responsibilities)}
                  />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={10} >
            <Col span={6} >
              <Form.Item
                name="GM_ENTRY_DAY"
                label="입사일"
                rules={[{ required: true }]}
              >
                <DatePicker />
              </Form.Item>
            </Col>
            <Col span={6} >
              <Form.Item label="근무 형태">
                <Input.Group compact>
                  <Form.Item
                    name={'GM_WORK_TYPE'}
                    noStyle
                    label="근무 형태"
                    rules={[{ required: true }]}
                  >
                    <Radio.Group>
                      <Radio value="정규직">정규직</Radio>
                      <Radio value="계약직">계약직</Radio>
                    </Radio.Group> 
                  </Form.Item>
                  (
                  <Form.Item
                    name={'GM_WORK_MONTH'}
                    noStyle
                  >
                    <InputNumber style={{ width: '50%' }} disabled={true} />
                  </Form.Item>
                  )개월
                </Input.Group>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={10} >
          <Col span={6} >
              <Form.Item label="근무시간과 장소">
                <Input.Group compact>
                  <Form.Item
                    name={'GM_TIME'}
                    noStyle
                    label="근무시간"
                    rules={[{ required: true }]}
                  > 
                    <TimePicker.RangePicker format={'HH:mm'} />
                  </Form.Item>
                  <Form.Item
                    name={'GM_PLACE'}
                    noStyle
                    label="근무장소"
                    rules={[{ required: true }]}
                  >
                    <Select style={{ width: 120 }} >
                      <Option value="none">근무장소</Option>
                      <Option value="본사 1층">본사 1층</Option>
                      <Option value="본사 2층">본사 2층</Option>
                      <Option value="###빌딩 3층">###빌딩 3층</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name={'GM_CONTACT_MONTH'}
                    noStyle
                  >
                    <InputNumber disabled />
                  </Form.Item>
                </Input.Group>
              </Form.Item>
            </Col>
            <Col span={6} >
              <Form.Item label="생일">
                <Input.Group compact>
                  <Form.Item
                    name={'GM_BIRTHDATE'}
                    label="생년월일"
                    noStyle
                    rules={[{ required: true }]}
                  > 
                    <DatePicker />
                  </Form.Item>
                  <Form.Item
                    name={'GM_CALENDER'}
                    noStyle
                    label="양력,음력"
                    rules={[{ required: true }]}
                  >
                    <Radio.Group>
                      <Radio value="양력">양력</Radio>
                      <Radio value="음력">음력</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Input.Group>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={10} >
            <Col span={6} >          
              <Form.Item
                name="GM_GENDER"
                label="성별"
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  <Radio value={1}>남</Radio>
                  <Radio value={2}>여</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={6} >              
              <Form.Item
                name="GM_MBTI"
                label="MBTI"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={10} >
            <Col span={6} >
              <Form.Item name="GM_LEVEL" label="등급" rules={[{ required: true }]}>
                <InputNumber />
              </Form.Item>
            </Col>
            <Col span={6} > 
              <Form.Item
                name="GM_ADMIN"
                label="관리자여부"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={10} >
            <Col span={6} > 
              <Form.Item
                name="GM_PROFILE"
                label="공개용 프로필"
              >
                <Input.TextArea rows={4} />
              </Form.Item>
            </Col>
            <Col span={6} >
              <Form.Item
                name="GM_ADMIN_MEMO"
                label="관리용 메모"
              >
                <Input.TextArea rows={4} />
              </Form.Item>
            </Col>
          </Row>


          <Form.Item>
            <Button onClick={handleClose}>취소</Button>
            <Button onClick={handleValidate} type="primary">
            확인
            </Button>
          </Form.Item>
        </Form>
        </Wrapper>

        {/* <MemberChanged
          changeOpen={state.changeOpen}
          propData={toJS(state.logs)}
          handlechange={handlechange}
          setLoading={state.setLoading}
        /> */}

        {/* <MemberUsage
          usageOpen={state.usageOpen}
          refetch={refetch}
          propData={state.usage_logs}
          handleUsage={handleUsage}
          setLoading={state.setLoading}
        /> */}
      </Drawer>
    );
  },
);

export default UserModify;
