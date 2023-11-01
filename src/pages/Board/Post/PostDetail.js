/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Row, Col, Space, Select, Tag } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import moment from 'moment';
import { toJS } from 'mobx';

import useStore from '@stores/useStore';

import CustomModal from '@components/CustomModal';

import Comment from '../Comment';
import PostModify from './PostModify';

const { Option } = Select;

const Wrapper = styled.div`
  width: 100%;
  .post-title {
    margin-top: 20px;
    padding: 10px;
    padding-top: 15px;
    padding-bottom: 15px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }
  .post-info {
    padding: 10px;
    padding-top: 15px;
    padding-bottom: 15px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }
  .files {
    padding: 10px;
    padding-top: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }
  .post-content {
    padding: 10px;
    padding-top: 30px;
    padding-bottom: 20px;
    margin-bottom: 20px;
    border-bottom: 2px solid rgba(0, 0, 0, 0.06);

    p {
      display: flex;
      flex-direction: column;
    }
  }
`;

const PostDetail = observer(({ match, isAdmin }) => {
  const router = useHistory();
  const { commonStore } = useStore();

  const state = useLocalStore(() => ({
    post: null,
    prev: null,
    next: null,

    modifyOpen: false,
    selectedData: {},
  }));

  // const postRes = useQuery(POST, {
  //   variables: { id: match.params.id },
  // });
  // const prevNextRes = useQuery(PREV_NEXT_POST, {
  //   variables: { id: match.params.id, board },
  // });

  const fetchData = useCallback(async () => {
    commonStore.loading = true;

    const idx = match.url.lastIndexOf('/');
    const id = match.url.substring(idx + 1);

    const result = await commonStore.handleApi({
      url: `post?id=${id}`,
    });

    if (result) {
      state.post = result.post;
      state.prev = result.prev;
      state.next = result.next;
    }
    commonStore.loading = false;
  }, [match]);

  const handleRemove = useCallback(
    (id, title) => () => {
      return window.ask({
        title: `계속 진행하시겠습니까?`,
        content: `${title} 게시글이 삭제됩니다.`,
        async onOk() {
          await commonStore.handleApi({
            method: 'POST',
            url: 'post/remove',
            data: {
              id,
            },
          });
          router.push('/post');
        },
      });
    },
    [],
  );

  const handleModify = useCallback(
    (modalOpen, data) => () => {
      if (modalOpen && data) {
        state.selectedData = data;
      } else {
        state.selectedData = {};
      }
      state.modifyOpen = modalOpen;
    },
    [],
  );

  const handleGoTo = useCallback((url) => {
    commonStore.loading = true;
    setTimeout(() => {
      router.push(url);
    }, 50);
  }, []);

  useEffect(() => {
    fetchData();
  }, [match]);

  return (
    <Wrapper>
      {state.post && (
        <>
          <div className="post-title">
            <Space size={10}>
              <strong>제목</strong>
              <span>{state.post.title}</span>
            </Space>
          </div>
          <Row className="post-info" align="middle" gutter={16}>
            <Col xs={24} lg={state.post.author ? 5 : 3}>
              <Space size={10}>
                <strong>작성자</strong>
                <span>{state.post.createdByUser.mem_username}</span>
              </Space>
            </Col>
            <Col xs={24} lg={5}>
              <Space size={10}>
                <strong>날짜</strong>
                <span>
                  {moment(state.post.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </span>
              </Space>
            </Col>
            <Col xs={24} lg={3}>
              <Space size={10}>
                <strong>조회수</strong>
                <span>{state.post.views ? state.post.views : 0}</span>
              </Space>
            </Col>
          </Row>
          {state.post.files && state.post.files.length ? (
            <Row className="files" align="middle" gutter={[16, 16]}>
              {toJS(state.post.files).map((item, idx) => (
                <Col xs={24} key={`post_file_${item.id}`}>
                  <Space size={10}>
                    <strong>파일{idx + 1}</strong>
                    <Button
                      type="link"
                      htmlType="button"
                      href={item.url}
                      download
                    >
                      {item.originalname}
                    </Button>
                  </Space>
                </Col>
              ))}
            </Row>
          ) : null}

          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: state.post.content }}
          />

          {state.post && <Comment post_id={state.post.id} />}

          <Row justify="space-between" align="middle" style={{ marginTop: 20 }}>
            <Col>
              <Space size={10}>
                {state.post && state.post.board && (
                  <Button
                    onClick={() => router.push(`/board/${state.post.board.id}`)}
                  >
                    목록
                  </Button>
                )}

                {state.prev && state.prev.id && (
                  <Button onClick={() => handleGoTo(`/post/${state.prev.id}`)}>
                    이전글
                  </Button>
                )}
                {state.next && state.next.id && (
                  <Button onClick={() => handleGoTo(`/post/${state.next.id}`)}>
                    다음글
                  </Button>
                )}
              </Space>
            </Col>

            {state.post &&
              state.post.board &&
              commonStore.checkRole(
                toJS(state.post.board.boardRole),
                'write',
              ) && (
                <Col>
                  <Space size={10}>
                    {(commonStore.user.mem_is_admin ||
                      commonStore.user.mem_id ===
                        state.post.createdByUser.mem_id) && (
                      <Space size={10}>
                        <Button onClick={handleModify(true, toJS(state.post))}>
                          수정
                        </Button>
                        <Button
                          onClick={handleRemove(
                            state.post.id,
                            state.post.title,
                          )}
                          danger
                        >
                          삭제
                        </Button>
                      </Space>
                    )}

                    <Button type="primary" onClick={handleModify(true)}>
                      글쓰기
                    </Button>
                  </Space>
                </Col>
              )}
          </Row>

          <PostModify
            modifyOpen={state.modifyOpen}
            refetch={fetchData}
            propData={toJS(state.selectedData)}
            handleModify={handleModify}
            boardData={
              state.post && state.post.board ? toJS(state.post.board) : null
            }
          />
        </>
      )}
    </Wrapper>
  );
});

export default PostDetail;
