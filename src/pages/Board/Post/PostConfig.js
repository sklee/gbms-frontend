/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo } from 'react';
import {
  Table, Space, Button, Select, Input, Row, Col, Tag, Empty,
} from 'antd';
import {
  FileSearchOutlined,
  PlusOutlined,
  EditOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import moment from 'moment';
import styled from 'styled-components';

import useStore from '@stores/useStore';

import CustomModal from '@components/CustomModal';
import Loading from '@components/Loading';

import PostModify from './PostModify';

const { Option } = Select;
const { Search } = Input;

const Wrapper = styled.div`
  width: 100%;
  .add-btn {
    z-index: 1;
    float: right;
  }
`;

const DetailView = styled.div`
  width: 100%;
  overflow: auto;
  margin-top: 1rem;
`;

const PostConfig = observer((props) => {
  const { commonStore } = useStore();

  const state = useLocalStore(() => ({
    viewOpen: false,
    modifyOpen: false,
    selectedData: {},
    selectedDetail: null,

    searchType: 'title',

    board: null,
    boards: [],
    list: [],
  }));

  const fetchBoards = useCallback(async () => {
    commonStore.loading = true;
    const result = await commonStore.handleApi({
      url: `board/list?isAdmin=${commonStore.user.mem_is_admin}`,
    });

    if (result) {
      if (commonStore.user.mem_is_admin) {
        state.board = null;
      } else if (result[0]) {
        state.board = result[0].id;
      }
      state.boards = result;
    }
    commonStore.loading = false;
  }, []);

  const fetchData = useCallback(async (findQuery = {}) => {
    commonStore.loading = true;
    const result = await commonStore.handleApi({
      method: 'POST',
      url: `post/list`,
      data: findQuery,
    });

    if (result) {
      state.list = result;
    }
    commonStore.loading = false;
  }, []);

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
  const handleClickView = useCallback(
    (row) => () => {
      state.selectedDetail = row;
      state.viewOpen = true;
    },
    [],
  );
  const handleCloseView = useCallback(() => {
    state.viewOpen = false;
  }, []);

  const handleChangeSelect = useCallback(
    (type) => (value) => {
      state[type] = value;

      if (type === 'board') {
        handleSearch();
      }
    },
    [],
  );

  const handleSearch = useCallback((value) => {
    const findQuery = {};
    if (state.board) {
      findQuery.board_id = state.board;
    }

    if (state.searchType && state.searchType.length && value && value.length) {
      findQuery.like = {
        [state.searchType]: value,
      };
    }
    fetchData(findQuery);
  }, []);

  const handleRemove = useCallback(
    (row) => () => {
      // console.log('row', row);
      return window.ask({
        title: `계속 진행하시겠습니까?`,
        content: `${row.title} 게시글이 삭제됩니다.`,
        async onOk() {
          commonStore.loading = true;
          let title_str = `${row.title} 게시글이 삭제되었습니다.`;
          const result = await commonStore.handleApi({
            method: 'POST',
            url: 'post/remove',
            data: {
              id: row.id,
            },
          });
          commonStore.loading = false;
          if (result.ok) {
            window.alert({ title: title_str });
          } else {
            window.alert({ title: `게시글을 삭제하지 못했습니다.` });
          }
          await handleSearch();
        },
      });
    },
    [],
  );

  useEffect(() => {
    fetchBoards();
    fetchData();
  }, []);

  const columns = useMemo(
    () => [
      {
        title: '번호',
        dataIndex: 'title',
        key: 'title',
        render: (_, row, idx) => idx + 1,
        align: 'center',
        width: 100,
      },
      {
        title: '제목',
        dataIndex: 'title',
        key: 'title',
        ellipsis: true,
      },
      {
        title: '등록일',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (created_at) => moment(created_at).format('YYYY-MM-DD'),
        width: 140,
      },
      {
        title: '등록자',
        dataIndex: 'createdByUser',
        key: 'createdByUser',
        render: (_, row) =>
          // row.createdByUser ? row.createdByUser.mem_username : '',
          row.mem_username ? row.mem_username : '',
        ellipsis: true,
        width: 140,
      },
      {
        title: '조회수',
        dataIndex: 'views',
        key: 'views',
        width: 100,
        align: 'center',
      },
      {
        title: '댓글수',
        dataIndex: 'comments',
        key: 'comments',
        render: (_, row) => (row.comments ? row.comments.length : 0),
        width: 100,
        align: 'center',
      },
      {
        title: '내용',
        key: 'content',
        dataIndex: 'content',
        render: (content, row) => (
          <Button
            type="primary"
            icon={<FileSearchOutlined />}
            onClick={handleClickView(row)}
          >
            내용보기
          </Button>
        ),
        width: 140,
        align: 'center',
      },
      {
        title: '',
        key: 'action',
        render: (_, row) => (
          <Space size="middle">
            <Button
              type="link"
              onClick={handleModify(true, row)}
              icon={<EditOutlined />}
            >
              수정
            </Button>
            <Button
              type="link"
              onClick={handleRemove(row)}
              danger
              icon={<MinusOutlined />}
            >
              삭제
            </Button>
          </Space>
        ),
        width: 200,
        align: 'center',
      },
    ],
    [],
  );

  if (!commonStore.loading && !state.boards.length) {
    return <Empty description="게시판관리에서 게시판을 추가해 주세요" />;
  }

  return (
    <Wrapper>
      <Row justify="space-between" gutter={16} style={{ marginBottom: 15 }}>
        <Col>
          <Row gutter={[32, 10]}>
            <Col>
              <Space>
                <span>게시판</span>
                <Select
                  value={state.board}
                  placeholder="선택"
                  onChange={handleChangeSelect('board')}
                  style={{ width: 200 }}
                >
                  {commonStore.user.mem_is_admin && (
                    <Option value={null}>전체</Option>
                  )}

                  {toJS(state.boards).map((item, idx) => (
                    <Option value={item.id} key={`board_${idx}`}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Space>
            </Col>
            <Col>
              <Space>
                <Select
                  value={state.searchType}
                  placeholder="검색구분"
                  onChange={handleChangeSelect('searchType')}
                  style={{ width: 120 }}
                >
                  <Option value="title">제목</Option>
                  <Option value="content">내용</Option>
                </Select>
                <Search
                  placeholder="검색어 입력"
                  onSearch={handleSearch}
                  enterButton
                />
              </Space>
            </Col>
          </Row>
        </Col>
        <Col>
          <Button
            className="add-btn"
            type="primary"
            onClick={handleModify(true, null)}
            icon={<PlusOutlined />}
          >
            글쓰기
          </Button>
        </Col>
      </Row>

      <Table
        dataSource={toJS(state.list)}
        columns={columns}
        scroll={{ x: 992, y: 400 }}
        rowKey={(row) => row.id}
      />

      <CustomModal
        title={`${
          state.selectedDetail ? state.selectedDetail.title : ''
        } 게시글 내용`}
        visible={state.viewOpen}
        onCancel={handleCloseView}
        footer={null}
      >
        {state.selectedDetail && (
          <>
            <DetailView
              dangerouslySetInnerHTML={{ __html: state.selectedDetail.content }}
            />
            <Row gutter={[10, 10]} justify="end" style={{ marginTop: 15 }}>
              <Col>
                입력자:{' '}
                <Tag>{
                  // state.selectedDetail.createdByUser.mem_username
                  state.selectedDetail.mem_username
                  }
                </Tag>
                입력일시:{' '}
                <Tag>
                  {moment(state.selectedDetail.created_at).format(
                    'YYYY-MM-DD HH:mm:ss',
                  )}
                </Tag>
              </Col>
            </Row>
            <Row gutter={[10, 10]} justify="end">
              <Col>
                수정자:{' '}
                <Tag>{
                  // state.selectedDetail.updatedByUser.mem_username
                  state.selectedDetail.mem_username
                  }</Tag>
                수정일시:{' '}
                <Tag>
                  {moment(state.selectedDetail.updated_at).format(
                    'YYYY-MM-DD HH:mm:ss',
                  )}
                </Tag>
              </Col>
            </Row>
          </>
        )}
      </CustomModal>

      <PostModify
        modifyOpen={state.modifyOpen}
        refetch={fetchData}
        propData={toJS(state.selectedData)}
        handleModify={handleModify}
        boards={toJS(state.boards)}
      />
    </Wrapper>
  );
});

export default PostConfig;
