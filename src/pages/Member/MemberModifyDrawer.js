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
import MemberChanged from './MemberChanged';
import MemberUsage from './MemberUsage';

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

const MemberModifyDrawer = observer(
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

    const handleCategory = useCallback(
      (type, idx) => (value) => {
        const categories = toJS(state.categories);
        if (type === 'add') {
          const f = categories.find((item) => item === value);
          if (!f) {
            categories.push(value);
          }
          form.setFieldsValue({ category: '' });
        } else {
          value.preventDefault();
          categories.splice(idx, 1);
        }
        state.categories = categories;
      },
      [],
    );

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

        if (data.birthday) {
          data.birthday = moment(data.birthday).format('YYYY-MM-DD');
        }
        if (data.join_date) {
          data.join_date = moment(data.join_date).format('YYYY-MM-DD');
        }
        if (data.start_time) {
          data.start_time = moment(data.start_time).format('HH:mm');
        }
        if (data.end_time) {
          data.end_time = moment(data.end_time).format('HH:mm');
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
            title = `${values.user_id} 회원이 등록되었습니다.`;
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
          initialValues={
            (propData.user_id=='undefined'||propData.user_id==null) ? {} :
            {
              account_type: propData.user_id? 'Y' : 'N',
              google_account: propData.user_id || '',
              user_id: propData.user_id || '',
              email: propData.email || '',
              user_name: propData.user_name || '',
              phone: propData.phone || '',
              office_phone: propData.office_phone || '',
              birthday: moment(propData.birthday) || '',
              birthday_lunar: propData.birthday_lunar || '',
              gender: propData.gender.code || '',
              use_yn: propData.use_yn || '',
              is_admin: propData.is_admin || '',
              profile_content: propData.profile_content || '',
              admin_memo: propData.admin_memo || '',
              work_state: propData.work_state.code || '',
              work_type: propData.work_type.code || '',
              work_period: propData.work_period || '',
              join_date: moment(propData.join_date) || '',
              company: propData.company.code || '',
              // department_data: propData.department_data || '',
              // user_id: propData.user_id || '',
              // user_id: propData.user_id || '',
              // user_id: propData.user_id || '',
              // user_id: propData.user_id || '',
              // user_id: propData.user_id || '',
              class: propData.class.code || '',
              role: propData.role.code || '',
              team_ord: propData.team_ord || '',
              start_time: moment(propData.start_time) || '',
              end_time: moment(propData.end_time) || '',
              work_place: propData.work_place.code || '',
              mbti: propData.mbti || '',
            }
          }
          validateMessages={validateMessages}
          scrollToFirstError
        >

          <Row gutter={10} >
            <Col span={12} >
              <Form.Item
                name="account_type"
                label="계정 구분"
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  <Radio value="Y">회사 구글 계정 연결</Radio>
                  <Radio value="N">계정 생성</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={10} >
            <Col span={12} >
              <Form.Item
                name="google_account"
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
                <Input disabled={Boolean(propData.GM_ID)} />
              </Form.Item>
            </Col>
            <Col span={4} >
              <Form.Item
                name="password"
                label="비밀번호"
                // rules={[{ required: propData.GM_ID ? false : true }]}
              >
                <Input.Password
                  placeholder={propData.GM_ID ? '입력 시 비밀번호 변경' : ''}
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
                <Input />
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
            {/* <Col span={4} >
              <Form.Item
                name="GM_NICK_NAME"
                label="별명"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col> */}
          </Row>

          <Row gutter={10} >
            <Col span={6} >
              <Form.Item
                name="office_phone"
                label="회사 전화번호"
                rules={[{ required: true, pattern: /^\d{4}$/ }]}
              >
                <Input placeholder="0000" />
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
                  <Radio value="P010101C0001">도서출판 길벗</Radio>
                  <Radio value="P010101C0003">길벗스쿨</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={6} >
              <Form.Item
                name="class"
                label="직급"
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  <Radio value="P010203C0001">사장</Radio>
                  <Radio value="P010203C0002">임원</Radio>
                  <Radio value="P010201C0007">부장</Radio>
                  <Radio value="P010201C0006">차장</Radio>
                  <Radio value="P010201C0005">과장</Radio>
                  <Radio value="P010201C0004">대리</Radio>
                  <Radio value="P010201C0003">사원</Radio>
                  <Radio value="P010201C0001">인턴</Radio>
                  <Radio value="P010201C0002">연구원</Radio>
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
                name="role"
                label="부서 내 역할"
                // rules={[{ required: true }]}
              >
                <Radio.Group>
                  <Radio value="P010202C0001">부서 책임자</Radio>
                  <Radio value="P010202C0002">책임 대행</Radio>
                  <Radio value="P010202C0003">파트장</Radio>
                  <Radio value="P010202C0004">팀원</Radio>
                  <Radio value="P010202C0005">인턴</Radio>
                </Radio.Group> 
              </Form.Item>
              <Form.Item
                name="responsibilities"
                label="담당 업무"
                // rules={[{ required: true }]}
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
                name="join_date"
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
                    name={'work_type'}
                    noStyle
                    label="근무 형태"
                    rules={[{ required: true }]}
                  >
                    <Radio.Group>
                      <Radio value="F">정규직</Radio>
                      <Radio value="C">계약직</Radio>
                    </Radio.Group> 
                  </Form.Item>
                  (
                  <Form.Item
                    name={'work_period'}
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
                    name={'work_time'}
                    noStyle
                    label="근무시간"
                    rules={[{ required: true }]}
                  > 
                    <TimePicker.RangePicker defaultValue={[moment(propData.start_time,"HH:mm"), moment(propData.end_time,"HH:mm")]} 
                      format={'HH:mm'} onClick={(e)=>{console.log(e.target.value);}}/>
                  </Form.Item>
                  <Form.Item
                    name={'work_place'}
                    noStyle
                    label="근무장소"
                    rules={[{ required: true }]}
                  >
                    <Select style={{ width: 120 }} >
                      <Option value="P010205C0001">본사 1층</Option>
                      <Option value="P010205C0002">본사 2층</Option>
                      <Option value="P010205C0003">본사 3층</Option>
                      <Option value="P010205C0004">본사 4층</Option>
                      <Option value="P010205C0005">본사 5층</Option>
                      <Option value="P010205C0006">본사 6층</Option>
                      <Option value="P010205C0007">본사 7층</Option>
                      <Option value="P010205C0008">스쿨 2층</Option>
                      <Option value="P010205C0009">스쿨 3층</Option>
                    </Select>
                  </Form.Item>
                  {/* <Form.Item
                    name={'GM_CONTACT_MONTH'}
                    noStyle
                  >
                    <InputNumber disabled />
                  </Form.Item> */}
                </Input.Group>
              </Form.Item>
            </Col>
            <Col span={6} >
              <Form.Item label="생일">
                <Input.Group compact>
                  <Form.Item
                    name={'birthday'}
                    label="생년월일"
                    noStyle
                    rules={[{ required: true }]}
                  > 
                    <DatePicker />
                  </Form.Item>
                  <Form.Item
                    name={'birthday_lunar'}
                    noStyle
                    label="양력,음력"
                    rules={[{ required: true }]}
                  >
                    <Radio.Group>
                      <Radio value="N">양력</Radio>
                      <Radio value="Y">음력</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Input.Group>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={10} >
            <Col span={6} >          
              <Form.Item
                name="gender"
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
                name="mbti"
                label="MBTI"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {/* <Row gutter={10} >
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
          </Row> */}

          <Row gutter={10} >
            <Col span={6} > 
              <Form.Item
                name="profile_content"
                label="공개용 프로필"
              >
                <Input.TextArea rows={4} />
              </Form.Item>
            </Col>
            <Col span={6} >
              <Form.Item
                name="admin_memo"
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

        <MemberChanged
          changeOpen={state.changeOpen}
          propData={toJS(state.logs)}
          handlechange={handlechange}
          setLoading={state.setLoading}
        />

        <MemberUsage
          usageOpen={state.usageOpen}
          refetch={refetch}
          propData={state.usage_logs}
          handleUsage={handleUsage}
          setLoading={state.setLoading}
        />
      </Drawer>
    );
  },
);

export default MemberModifyDrawer;
