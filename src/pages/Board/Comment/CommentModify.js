/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import { Row, Col, Form, Input, Button } from 'antd';
import styled from 'styled-components';

import useStore from '@stores/useStore';
import { validateMessages } from '@utils/customFormValidator';

const { TextArea } = Input;

const Wrapper = styled.div`
  width: 100%;
  padding-top: 20px;
`;

const CommentModify = observer(
  ({ propData = {}, post_id, parent_id, handleFinish }) => {
    const [form] = Form.useForm();
    const { commonStore } = useStore();

    const handleSubmit = useCallback(
      async (values) => {
        commonStore.loading = true;
        const data = {
          ...values,
          post_id,
        };

        if (parent_id) {
          data.parent_id = parent_id;
        }

        let title = '';
        if (propData && propData.id) {
          data.updated_userid = commonStore.user.mem_userid;
          await commonStore.handleApi({
            method: 'POST',
            url: `/comment/update`,
            data: {
              id: propData.id,
              updateData: data,
            },
          });
          title = '답글 수정이 완료되었습니다.';
        } else {
          data.created_userid = commonStore.user.mem_userid;
          await commonStore.handleApi({
            method: 'POST',
            url: `/comment/create`,
            data,
          });
          title = '답글 등록이 완료되었습니다.';
        }
        commonStore.loading = false;
        handleFinish();
        form.resetFields();
        window.success({ title });
      },
      [post_id, parent_id, propData],
    );

    useEffect(() => {
      if (form) {
        form.resetFields();
      }
    }, [form, propData]);

    return (
      <Wrapper>
        <Form
          form={form}
          name={`comment_reply_${propData.id || parent_id}`}
          preserve={false}
          initialValues={{
            content: propData.content || '',
          }}
          validateMessages={validateMessages}
          onFinish={handleSubmit}
          scrollToFirstError
          autoComplete="off"
        >
          <Row>
            <Col xs={24} lg={20}>
              <Form.Item name="content" rules={[{ required: true }]} noStyle>
                <TextArea
                  placeholder="답글을 입력해 주세요"
                  rows={3}
                  autoSize={{ minRows: 3, maxRows: 3 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} lg={4}>
              <Button
                type="primary"
                htmlType="submit"
                disabled={!Boolean(commonStore.user)}
                block
                style={{ height: '100%' }}
              >
                {propData && propData.id ? '수정' : parent_id ? '답글' : '등록'}
              </Button>
            </Col>
          </Row>
        </Form>
      </Wrapper>
    );
  },
);

export default CommentModify;
