/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect } from 'react';
import { Form, Input, Button, Row, Col, Select, Tag, Space } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import moment from 'moment';
import { toJS } from 'mobx';

import useStore from '@stores/useStore';
import { validateMessages } from '@utils/customFormValidator';

import CustomModal from '@components/CustomModal';
import Editor from '@components/Editor';

const { Option } = Select;

const PostModify = observer(
  ({ modifyOpen, refetch, propData = {}, handleModify, boards, boardData }) => {
    const [form] = Form.useForm();

    const { commonStore } = useStore();
    const state = useLocalStore(() => ({
      file1: null,
      file2: null,

      preSave: null,
      setPreSave(preSave) {
        state.preSave = preSave;
      },
    }));

    const handleClose = useCallback(() => {
      state.file1 = null;
      state.file2 = null;
      form.resetFields();
      handleModify(false)();
    }, []);

    const handleChangeFile = useCallback(
      (type) => async (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          file.status = 'load';
          e.target.value = '';

          if (state[type] && state[type].id) {
            window.ask({
              title: '계속 진행하시겠습니까?',
              content: `파일을 변경하시면 기존 파일은 삭제됩니다.`,
              async onOk() {
                await commonStore.handleApi({
                  method: 'POST',
                  url: 'file/remove',
                  data: {
                    id: state[type].id,
                  },
                });

                state[type] = file;
              },
            });
          } else {
            state[type] = file;
          }
        }
      },
      [],
    );

    const saveFile = useCallback((file, uploadUrl) => {
      return new Promise(async (resolve) => {
        const formData = new FormData();
        formData.append('uploadUrl', uploadUrl ? uploadUrl : '');
        formData.append('files', file, file.name);
        const result = await commonStore.handleApi({
          method: 'POST',
          url: 'file/uploadFile',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (result.ok && result.data && result.data[0]) {
          resolve(result.data[0]);
        } else {
          resolve(null);
        }
      });
    }, []);

    const handleRemoveFile = useCallback(
      (type) => () => {
        if (state[type] && state[type].id) {
          return window.ask({
            title: '계속 진행하시겠습니까?',
            content: `${
              state[type].name || state[type].originalname
            } 파일을 삭제하시겠습니까?`,
            async onOk() {
              await commonStore.handleApi({
                method: 'POST',
                url: 'file/remove',
                data: {
                  id: state[type].id,
                },
              });
              state[type] = null;
            },
          });
        } else {
          state[type] = null;
        }
      },
      [],
    );

    const handleValidate = useCallback(async () => {
      const value = await state.preSave(true);
      const val = value.replace(/(<p>)|(<br>)|(<\/p>)|(<br\/>)|\s/g, '');
      const content = val.length ? value : '';
      form.setFieldsValue({
        content,
      });
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
    }, [propData, state.preSave]);

    const handleSubmit = useCallback(
      async (values) => {
        commonStore.loading = true;
        const [content, contentImages] = await state.preSave();

        const data = {
          ...values,
          content,
          contentImages,
        };

        if (state.file1 && state.file1.status === 'load') {
          data.file1 = await saveFile(
            toJS(state.file1),
            `post/${data.board_id}`,
          );
        }
        if (state.file2 && state.file1.status === 'load') {
          data.file1 = await saveFile(
            toJS(state.file2),
            `post/${data.board_id}`,
          );
        }

        let title = '';

        let result;
        if (propData.id) {
          data.updated_userid = commonStore.user.mem_userid;
          result = await commonStore.handleApi({
            method: 'POST',
            url: 'post/update',
            data: {
              id: propData.id,
              updateData: data,
            },
          });
          title = `${propData.title} 게시글이 수정되었습니다.`;
        } else {
          data.created_userid = commonStore.user.mem_userid;
          result = await commonStore.handleApi({
            method: 'POST',
            url: 'post/create',
            data,
          });
          title = `${values.title} 게시글이 등록되었습니다.`;
        }

        form.resetFields();
        if (refetch) {
          await refetch();
        }
        window.success({ title });
        commonStore.loading = false;
        handleClose();
      },
      [propData, state.preSave, refetch],
    );

    useEffect(() => {
      if (propData.files) {
        if (propData.files[0]) {
          state.file1 = propData.files[0];
        }
        if (propData.files[1]) {
          state.file2 = propData.files[1];
        }
      }
      if (form) {
        form.resetFields();
      }
    }, [propData, form]);

    return (
      <CustomModal
        title={`${boardData ? boardData.name : ''} 게시글 ${
          propData.id ? '수정' : '추가'
        }`}
        visible={modifyOpen}
        onOk={handleValidate}
        onCancel={handleClose}
        forceRender={true}
        maskClosable={true}
      >
        <Form
          form={form}
          layout="vertical"
          name="post_modify"
          preserve={false}
          initialValues={{
            board_id: propData.board_id
              ? propData.board_id
              : boardData
              ? boardData.id
              : '',
            title: propData.title || '',
            content: propData.content || '',
          }}
          validateMessages={validateMessages}
          scrollToFirstError
        >
          {boards && boards.length ? (
            <Form.Item
              name="board_id"
              label="게시판 구분"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select placeholder="선택" style={{ width: 200 }}>
                {boards.map((item, idx) => (
                  <Option value={item.id} key={`board_${idx}`}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <Form.Item name="board_id" hidden>
              <div />
            </Form.Item>
          )}

          <Form.Item
            name="title"
            label="게시글 제목"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item shouldUpdate noStyle>
            {() => (
              <Form.Item
                name="content"
                label="게시글 내용"
                rules={[{ required: true }]}
              >
                <Editor
                  setPreSave={state.setPreSave}
                  preSave={state.preSave}
                  uploadUrl={`post/${form.getFieldValue('board_id')}`}
                  content={propData.content}
                  images={propData.contentImages ? propData.contentImages : []}
                />
              </Form.Item>
            )}
          </Form.Item>

          <Form.Item label="첨부파일1">
            <input
              id="file1"
              type="file"
              onChange={handleChangeFile('file1')}
              style={{ display: 'none' }}
            />
            <Space>
              <Button onClick={() => document.querySelector(`#file1`).click()}>
                파일
              </Button>
              {state.file1 && (
                <>
                  <span>{state.file1.name || state.file1.originalname}</span>
                  <CloseCircleOutlined onClick={handleRemoveFile('file1')} />
                </>
              )}
            </Space>
          </Form.Item>

          <Form.Item label="첨부파일2">
            <input
              id="file2"
              type="file"
              onChange={handleChangeFile('file2')}
              style={{ display: 'none' }}
            />
            <Space>
              <Button onClick={() => document.querySelector(`#file2`).click()}>
                파일
              </Button>
              {state.file2 && (
                <>
                  <span>{state.file2.name || state.file2.originalname}</span>
                  <CloseCircleOutlined onClick={handleRemoveFile('file2')} />
                </>
              )}
            </Space>
          </Form.Item>
        </Form>

        {propData.id && (
          <>
            <Row gutter={[10, 10]} justify="end">
              <Col>
                입력자:{' '}
                <Tag>
                  {propData.createdByUser
                    ? propData.createdByUser.mem_username
                    : ''}
                </Tag>
                입력일시:{' '}
                <Tag>
                  {moment(propData.created_at).format('YYYY-MM-DD HH:mm:ss')}
                </Tag>
              </Col>
            </Row>
            <Row gutter={[10, 10]} justify="end">
              <Col>
                수정자:{' '}
                <Tag>
                  {propData.updatedByUser
                    ? propData.updatedByUser.mem_username
                    : ''}
                </Tag>
                수정일시:{' '}
                <Tag>
                  {moment(propData.updated_at).format('YYYY-MM-DD HH:mm:ss')}
                </Tag>
              </Col>
            </Row>
          </>
        )}
      </CustomModal>
    );
  },
);

export default PostModify;
