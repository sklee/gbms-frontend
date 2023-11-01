/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect } from 'react';
import { Form, Input, Row, Col, InputNumber, Switch } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import { toJS } from 'mobx';

import useStore from '@stores/useStore';
import { validateMessages } from '@utils/customFormValidator';

import CustomModal from '@components/CustomModal';

const BoardModify = observer(
  ({ modifyOpen, refetch, propData = {}, handleModify }) => {
    const [form] = Form.useForm();

    const { commonStore } = useStore();
    const state = useLocalStore(() => ({}));

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
        commonStore.loading = true;

        const data = {
          ...values,
        };

        let title = '';

        if (propData.id) {
          data.updated_userid = commonStore.user.mem_userid;
          await commonStore.handleApi({
            method: 'POST',
            url: `board/update`,
            data: {
              id: propData.id,
              updateData: data,
            },
          });
          title = `${propData.name} 게시판이 수정되었습니다.`;
        } else {
          data.created_userid = commonStore.user.mem_userid;
          await commonStore.handleApi({
            method: 'POST',
            url: `board/create`,
            data,
          });
          title = `${values.name} 게시판이 추가되었습니다.`;
        }
        if (refetch) {
          await refetch();
        }
        form.resetFields();
        commonStore.loading = false;
        window.success({ title });
        handleClose();
      },
      [propData, refetch],
    );

    useEffect(() => {
      if (form) {
        form.resetFields();
      }
    }, [propData, form]);

    return (
      <CustomModal
        title={`게시판 ${propData.id ? '수정' : '추가'}`}
        visible={modifyOpen}
        onOk={handleValidate}
        onCancel={handleClose}
        forceRender={true}
      >
        <Form
          form={form}
          layout="vertical"
          name="board_modify"
          preserve={false}
          initialValues={{
            isActivated:
              propData.isActivated !== undefined ? propData.isActivated : true,
            name: propData.name || '',
            order: propData.order || 1,
          }}
          validateMessages={validateMessages}
          scrollToFirstError
        >
          <Row gutter={32}>
            <Col>
              <Form.Item
                name="isActivated"
                label="사용여부"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="order" label="게시판 순서">
                <InputNumber min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="name" label="게시판명" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </CustomModal>
    );
  },
);

export default BoardModify;
