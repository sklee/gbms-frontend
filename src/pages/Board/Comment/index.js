/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect } from 'react';
import { observer, useLocalStore } from 'mobx-react';
import { Row, Col, Form, Input, Button, Divider } from 'antd';
import styled from 'styled-components';
import { toJS } from 'mobx';

import useStore from '@stores/useStore';
import { validateMessages } from '@utils/customFormValidator';

import CommentList from './CommentList';

const { TextArea } = Input;

const Wrapper = styled.div`
  width: 100%;
`;

const Comment = observer(({ post_id }) => {
  const [form] = Form.useForm();
  const { commonStore } = useStore();
  const state = useLocalStore(() => ({
    list: [],
    get listVal() {
      return toJS(this.list);
    },
  }));

  const fetchData = useCallback(async () => {
    commonStore.loading = true;
    const result = await commonStore.handleApi({
      url: `/comment/list?post_id=${post_id}`,
    });

    if (result) {
      state.list = result;
    }
    commonStore.loading = false;
  }, [post_id]);

  const handleSubmit = useCallback(
    async (values) => {
      commonStore.loading = true;
      const data = {
        ...values,
        post_id,
        created_userid: commonStore.user.mem_userid,
      };
      await commonStore.handleApi({
        method: 'POST',
        url: `/comment/create`,
        data,
      });
      await fetchData();
      form.resetFields();
      commonStore.loading = false;
      window.success({ title: '댓글 등록이 완료되었습니다.' });
    },
    [post_id],
  );

  useEffect(() => {
    fetchData();
  }, [post_id]);

  return (
    <Wrapper>
      <Form
        form={form}
        name="comment_form"
        preserve={false}
        initialValues={{
          content: '',
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
                placeholder="댓글을 입력해 주세요"
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
              등록
            </Button>
          </Col>
        </Row>
      </Form>

      {state.listVal.length ? (
        <>
          <CommentList list={state.listVal} refetch={fetchData} />
          <Divider />
        </>
      ) : null}
    </Wrapper>
  );
});

export default Comment;
