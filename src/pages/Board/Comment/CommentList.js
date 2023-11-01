/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useEffect, useCallback } from 'react';
import { Button, Comment, Collapse, Tooltip, Tag } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import { toJS } from 'mobx';
import styled from 'styled-components';
import moment from 'moment';

import useStore from '@stores/useStore';

import CommentModify from './CommentModify';

const { Panel } = Collapse;

const Wrapper = styled.div`
  width: 100%;

  .content {
    padding-top: 15px;
    padding-bottom: 10px;
  }

  .ant-comment-content-author-time {
    display: flex;
    align-items: center;
  }
`;

const CommentList = observer(({ list = [], refetch }) => {
  const { commonStore } = useStore();
  const state = useLocalStore(() => ({
    modifyIdx: -1,
    modifyChildIdx: -1,
  }));

  const handleModify = useCallback(
    (idx, isChild) => (e) => {
      if (isChild) {
        if (state.modifyChildIdx === idx) {
          state.modifyChildIdx = -1;
        } else {
          state.modifyChildIdx = idx;
        }
      } else {
        if (state.modifyIdx === idx) {
          state.modifyIdx = -1;
        } else {
          state.modifyIdx = idx;
        }
      }
    },
    [],
  );
  const handleFinish = useCallback(
    async (e) => {
      state.modifyIdx = -1;
      state.modifyChildIdx = -1;
      if (refetch) {
        await refetch();
      }
    },
    [refetch],
  );

  const handleRemove = useCallback(
    (id) => (e) => {
      window.ask({
        title: '계속 진행하시겠습니까?',
        content: '선택하신 댓글을 삭제하시겠습니까?',
        async onOk() {
          await commonStore.handleApi({
            method: 'POST',
            url: `/comment/remove`,
            data: {
              id,
            },
          });
          if (refetch) {
            await refetch();
          }
        },
      });
    },
    [refetch],
  );

  useEffect(() => {
    if (list) {
      state.modifyIdx = -1;
      state.modifyChildIdx = -1;
    }
  }, [list]);

  return (
    <Wrapper>
      {list.map((item, idx) => (
        <div key={`comment_${item.id}`}>
          <Comment
            actions={[
              commonStore.user &&
                commonStore.user.mem_userid === item.created_userid && (
                  <Button
                    type="default"
                    onClick={handleModify(idx)}
                    style={{ marginRight: '1rem' }}
                  >
                    {state.modifyIdx === idx ? '취소' : '수정'}
                  </Button>
                ),
              commonStore.user &&
                commonStore.user.mem_userid === item.created_userid && (
                  <Button type="default" onClick={handleRemove(item.id)} danger>
                    삭제
                  </Button>
                ),
            ]}
            author={
              <Tag
                color={item.createdByUser.mem_is_admin ? '#55a8f4' : null}
                style={{
                  color: item.createdByUser.mem_is_admin ? '#fff' : '#333',
                }}
              >
                {item.createdByUser.mem_username}
              </Tag>
            }
            content={
              <div className="content">
                {state.modifyIdx === idx ? (
                  <CommentModify
                    post_id={item.post_id}
                    propData={item}
                    handleFinish={handleFinish}
                  />
                ) : (
                  <pre>{item.content}</pre>
                )}
              </div>
            }
            datetime={
              <span style={{ marginLeft: 5 }}>
                {moment(item.created_at).format('YYYY-MM-DD HH:mm:ss')} (
                {moment(item.created_at).fromNow()})
              </span>
            }
          >
            {item.children
              ? item.children.map((c, cIdx) => (
                  <Comment
                    key={`reply_${item.id}_${c.id}`}
                    actions={[
                      commonStore.user &&
                        commonStore.user.mem_userid === c.created_userid && (
                          <Button
                            type="default"
                            onClick={handleModify(cIdx, true)}
                            style={{ marginRight: '1rem' }}
                          >
                            {state.modifyChildIdx === cIdx ? '취소' : '수정'}
                          </Button>
                        ),
                      commonStore.user &&
                        commonStore.user.mem_userid === c.created_userid && (
                          <Button
                            type="default"
                            onClick={handleRemove(c.id)}
                            danger
                          >
                            삭제
                          </Button>
                        ),
                    ]}
                    author={c.createdByUser.mem_username}
                    content={
                      state.modifyChildIdx === cIdx ? (
                        <CommentModify
                          post_id={c.post_id}
                          propData={c}
                          parent={item.id}
                          handleFinish={handleFinish}
                        />
                      ) : (
                        <pre>{c.content}</pre>
                      )
                    }
                    datetime={
                      <Tooltip
                        title={moment(c.created_at).format(
                          'YYYY-MM-DD HH:mm:ss',
                        )}
                      >
                        <span>{moment(c.created_at).fromNow()}</span>
                      </Tooltip>
                    }
                  />
                ))
              : null}
          </Comment>

          <Collapse defaultActiveKey={[]} ghost>
            <Panel header="답글" key="1">
              <CommentModify
                post_id={item.post_id}
                parent_id={item.id}
                handleFinish={handleFinish}
              />
            </Panel>
          </Collapse>
        </div>
      ))}
    </Wrapper>
  );
});

export default CommentList;
