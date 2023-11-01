/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Table, Space, Button, Select, Input, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import moment from 'moment';
import styled from 'styled-components';

import useStore from '@stores/useStore';

import Loading from '@components/Loading';
import PageTitle from '@components/PageTitle';

import PostModify from './PostModify';

const { Option } = Select;
const { Search } = Input;

const Wrapper = styled.div`
  width: 100%;

  .ant-table-tbody {
    .ant-table-row {
      cursor: pointer;
    }
  }
`;

const Post = observer(({ match }) => {
  const router = useHistory();
  const { commonStore } = useStore();

  const state = useLocalStore(() => ({
    modifyOpen: false,
    selectedData: {},

    searchType: 'title',

    boardData: null,
    list: [],

    setLoading(value) {
      this.loading = value;
    },
  }));

  const fetchBoard = useCallback(async () => {
    commonStore.loading = true;
    const idx = match.url.lastIndexOf('/');
    const boardId = match.url.substring(idx + 1);

    const result = await commonStore.handleApi({
      url: `board?id=${boardId}`,
    });

    if (result) {
      state.boardData = result;
    }
    fetchData();
  }, [match]);

  const fetchData = useCallback(async (findQuery = {}) => {
    commonStore.loading = true;

    findQuery.board_id = state.boardData.id;

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

  const handleChangeSelect = useCallback(
    (type) => (value) => {
      state[type] = value;
    },
    [],
  );

  const handleSearch = useCallback((value) => {
    const findQuery = {};
    if (state.searchType && state.searchType.length && value && value.length) {
      findQuery.like = {
        [state.searchType]: value,
      };
    }
    fetchData(findQuery);
  }, []);

  useEffect(() => {
    fetchBoard();
  }, [match]);

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
          row.createdByUser ? row.createdByUser.mem_username : '',
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
    ],
    [],
  );

  return (
    <Wrapper>
      {state.boardData && <PageTitle>{state.boardData.name}</PageTitle>}

      <Row justify="space-between" gutter={16} style={{ marginBottom: 15 }}>
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
        {state.boardData &&
          commonStore.checkRole(toJS(state.boardData.boardRole), 'write') && (
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
          )}
      </Row>

      <Table
        dataSource={toJS(state.list)}
        columns={columns}
        scroll={{ x: 992, y: 400 }}
        rowKey={(row) => row.id}
        onRow={(row, idx) => {
          return {
            onClick: (e) => {
              router.push(`/post/${row.id}`);
            },
          };
        }}
      />

      <PostModify
        modifyOpen={state.modifyOpen}
        refetch={fetchData}
        propData={toJS(state.selectedData)}
        handleModify={handleModify}
        boardData={toJS(state.boardData)}
        setLoading={state.setLoading}
      />
    </Wrapper>
  );
});

export default Post;
