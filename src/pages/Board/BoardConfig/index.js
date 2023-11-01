/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo } from 'react';
import { Table, Space, Button, Tag } from 'antd';
import { PlusOutlined, EditOutlined, MinusOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';

import BoardModify from './BoardModify';

const Wrapper = styled.div`
  width: 100%;
  .add-btn {
    z-index: 1;
    float: right;
    margin-bottom: 0.5rem;
  }
`;

const BoardConfig = observer((props) => {
  const { commonStore } = useStore();

  const state = useLocalStore(() => ({
    list: [],

    modifyOpen: false,
    selectedData: {},
  }));

  const fetchData = useCallback(async () => {
    const result = await commonStore.handleApi({
      url: `board/list?isAdmin=${commonStore.user.mem_is_admin}`,
    });

    if (result) {
      state.list = result;
    }
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

  const handleRemove = useCallback(
    (row) => () => {
      return window.ask({
        title: `계속 진행하시겠습니까?`,
        content: `${row.name} 게시판이 삭제됩니다.`,
        async onOk() {
          await commonStore.handleApi({
            method: 'POST',
            url: 'board/remove',
            data: {
              id: row.id,
            },
          });
          await fetchData();
        },
      });
    },
    [],
  );

  useEffect(() => {
    fetchData();
  }, []);

  const columns = useMemo(
    () => [
      {
        title: '게시판명',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '순서',
        dataIndex: 'order',
        key: 'order',
        width: 120,
        align: 'center',
      },
      {
        title: '사용여부',
        dataIndex: 'isActivated',
        key: 'isActivated',
        render: (isActivated) => (isActivated ? 'Y' : 'N'),
        width: 120,
        align: 'center',
      },
      {
        title: '등록자',
        dataIndex: 'createdByUser',
        key: 'createdByUser',
        render: (_, row) =>
          row.createdByUser ? row.createdByUser.mem_username : '',
        width: 120,
        align: 'center',
      },
      {
        title: '수정자',
        dataIndex: 'updatedByUser',
        key: 'updatedByUser',
        render: (_, row) =>
          row.updatedByUser ? row.updatedByUser.mem_username : '',
        width: 120,
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

  return (
    <Wrapper>
      <Button
        className="add-btn"
        type="primary"
        onClick={handleModify(true, null)}
        icon={<PlusOutlined />}
      >
        추가
      </Button>

      <Table
        dataSource={toJS(state.list)}
        columns={columns}
        scroll={{ x: 992, y: 400 }}
        rowKey={(row) => row.id}
      />

      <BoardModify
        modifyOpen={state.modifyOpen}
        refetch={fetchData}
        propData={toJS(state.selectedData)}
        handleModify={handleModify}
      />
    </Wrapper>
  );
});

export default BoardConfig;
