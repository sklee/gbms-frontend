/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect } from 'react';
import { Row, Col, Button, Space } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import { toJS } from 'mobx';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import useStore from '@stores/useStore';
import Loading from '@components/Common/Loading';

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

  .drag-row {
    height: 40px;
    border: 1px solid #aaa;
    background-color: #f0f0f0;

    .ant-col {
      padding: 0;
      padding-left: 15px;
      padding-right: 15px;
    }
  }
`;

const DEF_STATE = {
  loading: false,
  list: [],

  file1: null,
  file2: null,
};

const AdditionalInfo = observer(
  ({ current, setData, defaultData, handleChangeStep }) => {
    const { commonStore } = useStore();

    const state = useLocalStore(() => ({ ...DEF_STATE }));

    const fetchData = useCallback(async () => {
      state.loading = true;
      state.list = [];

      const resData = await commonStore.handleApi({
        url: `/member/getUsersWithPart?mei_part=${defaultData.mei.mei_part}`,
      });

      const list = [...resData];
      list.push({
        ...defaultData.mei,
        members: {
          ...defaultData.mem,
        },
      });

      state.list = list;
      state.loading = false;
    }, [defaultData]);

    const handleDragEnd = useCallback((result) => {
      // dropped outside the list
      if (!result.destination) {
        return;
      }
    }, []);

    const handleChangeFile = useCallback(
      (type) => async (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          e.target.value = '';

          if (state[type] && state[type].url) {
            window.ask({
              title: '계속 진행하시겠습니까?',
              content: `파일을 변경하시면 기존 파일은 삭제됩니다.`,
              async onOk() {},
            });
          } else {
            file.status = 'load';
            state[type] = file;
          }
        }
      },
      [],
    );

    const handleSubmit = useCallback(async (e) => {
      const value = {
        partOrderList: toJS(state.list),
        file1: toJS(state.file1),
        file2: toJS(state.file2),
      };
      setData('additionalData', value, 2);
    }, []);

    const handleReset = useCallback(() => {
      return window.ask({
        title: `이 창의 입력 내용이 삭제됩니다.`,
        content: `그래도 계속 하시겠습니까?`,
        async onOk() {
          for (const key in DEF_STATE) {
            state[key] = DEF_STATE[key];
          }
          handleChangeStep(0);
        },
      });
    }, []);

    useEffect(() => {
      if (defaultData && defaultData.mei) {
        fetchData();
      }
    }, [defaultData]);

    return (
      <Wrapper>
        <Loading loading={state.loading} />

        <Row gutter={10} className="table">
          <Col xs={8} lg={4} className="label">
            부서 내 표시 순서
          </Col>
          <Col xs={16} lg={8}>
            {state.list.length ? (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="droppable">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      // style={getListStyle(snapshot.isDraggingOver)}
                    >
                      {toJS(state.list).map((item, index) => (
                        <Draggable
                          key={`user_part_drag_${index}`}
                          draggableId={`user_part_drag_${index}`}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Row
                              className="drag-row"
                              align="middle"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              // style={getItemStyle(
                              //   snapshot.isDragging,
                              //   provided.draggableProps.style,
                              // )}
                            >
                              <Col xs={24}>
                                <Space>
                                  <span>{item.mei_class}</span>
                                  <span>{item.members.mem_username}</span>
                                </Space>
                              </Col>
                            </Row>
                          )}
                        </Draggable>
                      ))}

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : null}
          </Col>

          <Col xs={24} lg={12} style={{ padding: 0 }}>
            <Row style={{ height: '100%' }}>
              <Col xs={8} className="label">
                첨부파일1
              </Col>
              <Col xs={16}>
                <input
                  id="file1"
                  type="file"
                  onChange={handleChangeFile('file1')}
                  style={{ display: 'none' }}
                />
                <Space>
                  <Button
                    onClick={() => document.querySelector(`#file1`).click()}
                    disabled={current !== 1}
                  >
                    파일
                  </Button>
                  {state.file1 && (
                    <>
                      <span>{state.file1.name}</span>
                      <CloseCircleOutlined
                        onClick={() => (state.file1 = null)}
                      />
                    </>
                  )}
                </Space>
              </Col>
              <Col xs={8} className="label">
                첨부파일2
              </Col>
              <Col xs={16}>
                <input
                  id="file2"
                  type="file"
                  onChange={handleChangeFile('file2')}
                  style={{ display: 'none' }}
                />
                <Space>
                  <Button
                    onClick={() => document.querySelector(`#file2`).click()}
                    disabled={current !== 1}
                  >
                    파일
                  </Button>
                  {state.file2 && (
                    <>
                      <span>{state.file2.name}</span>
                      <CloseCircleOutlined
                        onClick={() => (state.file2 = null)}
                      />
                    </>
                  )}
                </Space>
              </Col>
            </Row>
          </Col>
        </Row>

        <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
          <Col>
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={current !== 1}
            >
              저장 후 다음
            </Button>
          </Col>
          <Col>
            <Button onClick={handleReset} disabled={current !== 1}>
              취소
            </Button>
          </Col>
        </Row>
      </Wrapper>
    );
  },
);

export default AdditionalInfo;
