/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect } from 'react';
import { Upload, Modal, Typography, Row, Col } from 'antd';
import {
  InboxOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useLocalStore, observer } from 'mobx-react';
import { useMutation } from '@apollo/react-hooks';
import Sortable from 'sortablejs';
import styled from 'styled-components';
import { toJS } from 'mobx';

import { MULTI_FILE_UPLOAD, SINGLE_FILE_REMOVE } from '@shared/queries';

import { formatFilename } from '@utils/common';
import { checkExif } from '@utils/preUpload';
import theme from '@Admin/styled-theme';

const { Dragger } = Upload;
const { Paragraph, Text } = Typography;

const Wrapper = styled.div`
  .ant-upload-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    margin-top: 15px;
    margin-bottom: 15px;
  }
  .ant-upload-list-item {
    &:first-child {
      border: 2px dashed ${(props) => props.theme.primaryColor};
    }
  }
  .ant-upload-select-picture-card i {
    font-size: 32px;
    color: #999;
  }

  .ant-upload-select-picture-card .ant-upload-text {
    margin-top: 8px;
    color: #666;
  }
`;

const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const Dropzone = observer((props) => {
  const state = useLocalStore(() => ({
    previewVisible: false,
    previewImage: '',
    uploading: false,
    uploadFileCnt: 0,
    fileList: [],
  }));

  const [upload] = useMutation(MULTI_FILE_UPLOAD);
  const [remove] = useMutation(SINGLE_FILE_REMOVE);

  const handleCancel = useCallback(() => {
    state.previewVisible = false;
  }, []);
  const handlePreview = useCallback(async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    state.previewImage = file.url || file.preview;
    state.previewVisible = true;
  }, []);

  const onRemove = useCallback(
    async (file) => {
      if (file) {
        window.ask({
          title: '계속 진행하시겠습니까?',
          content: '해당 이미지를 삭제하시겠습니까?',
          async onOk() {
            state.uploading = true;
            const fileList = toJS(state.fileList);
            const idx = fileList.findIndex((item) => item.name === file.name);

            if (file.isPreUpload) {
              state.uploadFileCnt -= 1;
            } else {
              try {
                await remove({
                  variables: {
                    Key: state.fileList[idx].name,
                  },
                });
              } catch (err) {
                if (err && err.message) {
                  window.alert({ title: err.message });
                }
              }
            }
            state.fileList.splice(idx, 1);

            if (!file.isPreUpload) {
              await props.handleSaveData(toJS(state.fileList), props.lang);
            }
            state.uploading = false;
          },
        });
      }
    },
    [state.fileList, props],
  );

  const beforeUpload = useCallback(async (file) => {
    if (props.limit && state.uploadFileCnt >= props.limit) {
      return window.info({
        title: `${props.limit}개 까지만 업로드 가능합니다.`,
      });
    }

    try {
      const resizeFile = await checkExif(file, props.width, props.height);
      resizeFile.uid = file.uid;
      resizeFile.name = file.name;
      resizeFile.status = 'load';
      resizeFile.isPreUpload = true;
      state.fileList.push(resizeFile);
      state.uploadFileCnt += 1;
      if (props.handleParentImages) {
        props.handleParentImages(state.fileList, props.lang);
      }
    } catch (e) {
      if (e && e.message) {
        window.alert({ title: e.message });
      }
    }

    return false;
  }, []);

  const handleUpload = useCallback(() => {
    return new Promise(async (resolve) => {
      state.uploading = true;
      const uploadFiles = [];
      const uploadPath = props.uploadPath;
      const fileList = toJS(state.fileList);
      const images = [];
      for (let i = 0; i < fileList.length; i++) {
        delete fileList[i].__typename;

        if (fileList[i].isPreUpload) {
          const filename = formatFilename(fileList[i].type, uploadPath);
          fileList[i].name = filename;
          state.uploadFileCnt -= 1;
          uploadFiles.push({
            file: fileList[i],
            filename,
          });
        }
        images.push(fileList[i]);
      }

      if (uploadFiles.length) {
        try {
          const uploadRes = await upload({
            variables: {
              datas: uploadFiles,
            },
          });

          if (uploadRes.data && uploadRes.data.multiFileUpload) {
            for (const uploaded of uploadRes.data.multiFileUpload) {
              const fIdx = images.findIndex(
                (item) => item.name === uploaded.name,
              );
              if (fIdx !== -1) {
                images[fIdx] = uploaded;
              }
            }
          }
        } catch (err) {
          return window.alert({ title: err.message });
        }
      }
      resolve(images);
      state.uploading = false;
    });
  }, [props, state.fileList]);

  useEffect(() => {
    if (props.id) {
      const el = document.querySelector(`#${props.id} .ant-upload-list`);
      Sortable.create(el, {
        onEnd: (evt) => {
          const fileList = window.toJS(state.fileList);
          state.fileList = [];
          const newData = fileList[evt.oldIndex];
          fileList.splice(evt.oldIndex, 1);
          fileList.splice(evt.newIndex, 0, newData);
          state.fileList = fileList;
        },
      });
    } else {
      window.alert({ title: 'Dropzone의 id를 입력하세요.' });
    }
  }, [props.id]);

  useEffect(() => {
    state.uploadFileCnt = props.images.length || 0;
    state.fileList = props.images;
  }, [props.images]);

  useEffect(() => {
    props.setHandleUpload(handleUpload, props.lang);
  }, []);

  return (
    <div className="clearfix">
      <Wrapper id={props.id}>
        <Dragger
          multiple={props.multiple}
          accept="image/*"
          listType="picture-card"
          fileList={state.fileList}
          onPreview={handlePreview}
          onRemove={onRemove}
          beforeUpload={beforeUpload}
          customRequest={() => {
            return;
          }}
          disabled={props.disabled}
        >
          <p className="ant-upload-drag-icon">
            {props.disabled ? (
              <CloseCircleOutlined style={{ color: '#e74c3c' }} />
            ) : (
              <InboxOutlined style={{ color: theme.primaryColor }} />
            )}
          </p>
          {props.disabled ? (
            <p className="ant-upload-text">사용할 수 없는 상태입니다.</p>
          ) : (
            <>
              <p className="ant-upload-text">
                클릭 or 이미지를 여기로 드래그 하세요.
              </p>
              <p className="ant-upload-hint">
                아래에 로딩된 이미지들을 드래그하여 순서를 바꿀 수 있습니다.
              </p>
            </>
          )}
        </Dragger>

        {state.fileList && state.fileList.length ? (
          <Row>
            <Col xs={24}>
              {props.descriptions &&
                props.descriptions.map((text, idx) => (
                  <Paragraph key={`dropzone_description_${idx}`}>
                    <InfoCircleOutlined style={{ color: theme.primaryColor }} />
                    &nbsp;
                    <Text strong={true}>{text}</Text>
                  </Paragraph>
                ))}
            </Col>
          </Row>
        ) : null}

        <Modal
          visible={state.previewVisible}
          footer={null}
          onCancel={handleCancel}
          centered={true}
          bodyStyle={{ paddingTop: '50px' }}
        >
          <img alt="" style={{ width: '100%' }} src={state.previewImage} />
        </Modal>
      </Wrapper>
    </div>
  );
});

export default Dropzone;
