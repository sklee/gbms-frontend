/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect } from 'react';
import { Form, Input, Switch, DatePicker, Radio, InputNumber } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import { toJS } from 'mobx';
import moment from 'moment';

import useStore from '@stores/useStore';
import { validateMessages } from '@utils/customFormValidator';

import CustomModal from '@components/CustomModal';

const MemberModify = observer(
  ({ modifyOpen, refetch, propData = {}, handleModify, setLoading }) => {
    const [form] = Form.useForm();

    const { commonStore } = useStore();
    const state = useLocalStore(() => ({
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

        if (data.GM_BIRTHDATE) {
          data.GM_BIRTHDATE = moment(data.GM_BIRTHDATE).format('YYYY-MM-DD');
        }
        if (data.password && !data.password.length) {
          delete data.password;
        }

        let title = '';

        if (propData.GM_ID) {
          const result = await commonStore.handleApi({
            method: 'POST',
            url: 'member/update',
            data: { GM_ID: propData.GM_ID, updateData: data },
          });
          if (result.error) {
            title = result.error;
            window.alert({ title });
          } else {
            title = `${propData.GM_ID} 회원정보가 수정되었습니다.`;
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

    useEffect(() => {
      if (form) {
        form.resetFields();
      }
    }, [propData, form]);

    return (
      <CustomModal
        title={`회원 ${propData.GM_ID ? '수정' : '추가'}`}
        visible={modifyOpen}
        onOk={handleValidate}
        onCancel={handleClose}
        forceRender={true}
      >
        <Form
          form={form}
          layout="vertical"
          name="member_modify"
          preserve={false}
          initialValues={{
            GM_ID: propData.GM_ID || '',
            GM_PASS: '',
            GM_EMAIL: propData.GM_EMAIL || '',
            GM_NAME: propData.GM_NAME || '',
            GM_NICK_NAME: propData.GM_NICK_NAME || '',
            GM_HP: propData.GM_HP || '',
            GM_BIRTHDATE: moment(propData.GM_BIRTHDATE) || null,
            GM_GENDER: propData.GM_GENDER || 1,
            GM_LEVEL: propData.GM_LEVEL || 0,
            GM_ADMIN: propData.GM_ADMIN || false,
          }}
          validateMessages={validateMessages}
          scrollToFirstError
        >
          <Form.Item
            name="GM_ID"
            label="아이디"
            rules={[{ required: true }]}
          >
            <Input disabled={Boolean(propData.GM_ID)} />
          </Form.Item>

          <Form.Item
            name="GM_PASS"
            label="비밀번호"
            rules={[{ required: propData.GM_ID ? false : true }]}
          >
            <Input.Password
              placeholder={propData.GM_ID ? '입력 시 비밀번호 변경' : ''}
            />
          </Form.Item>

          <Form.Item
            name="GM_EMAIL"
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

          <Form.Item
            name="GM_NAME"
            label="이름"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="GM_NICK_NAME"
            label="별명"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="GM_HP"
            label="핸드폰"
            rules={[{ required: true, pattern: /^010-\d{4}-\d{4}$/ }]}
          >
            <Input placeholder="010-0000-0000" />
          </Form.Item>

          <Form.Item
            name="GM_BIRTHDATE"
            label="생년월일"
            rules={[{ required: true }]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item name="GM_LEVEL" label="등급" rules={[{ required: true }]}>
            <InputNumber />
          </Form.Item>

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

          <Form.Item
            name="GM_ADMIN"
            label="관리자여부"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </CustomModal>
    );
  },
);

export default MemberModify;
