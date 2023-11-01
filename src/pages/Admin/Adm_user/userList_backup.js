/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo } from 'react';
import { Breadcrumb, Table, Space, Button, Row, Col, Checkbox } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  MinusOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';

import UserModify from './UserModify';

const Wrapper = styled.div`
  width: 100%;
  .add-btn {
    float: right;
  }
`;

const TotalStatus = styled.div`
  .cnt {
    color: ${(props) => props.theme.primaryColor};
    font-size: 1.2rem;
  }
`;

const UserList = observer((props) => {
  const { commonStore } = useStore();
  const state = useLocalStore(() => ({
    list: [],

    modifyOpen: false,
    selectedData: {},

    setLoading(value) {
      this.loading = value;
    },
  }));

  const fetchData = useCallback(async (findQuery = {}) => {
    commonStore.loading = true;
    const result = await commonStore.handleApi({
      url: 'member/list',
    });

    if (result) {
      state.list = result;
    }
    console.log(result);
    commonStore.loading = false;
  }, []);

  const handleModify = useCallback(
    (modalOpen, data) => async() => {
      if (modalOpen && data) {
        state.selectedData = data;

        commonStore.loading = true;
        const result = await commonStore.handleApi({
          method: 'POST',
          url: 'member/details',
          data : { user_id : data.user_id, }
        });

        if (result) {
          state.selectedData = result;
          console.log(result);
        }
        commonStore.loading = false;
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
        content: `${row.user_id}(${row.user_name}) 회원이 삭제됩니다.`,
        async onOk() {
          commonStore.loading = true;
          let title_str = `${row.user_id}(${row.user_name}) 회원이 삭제되었습니다.`;
          // const result = await commonStore.handleApi({
          //   method: 'POST',
          //   url: 'member/delete',
          //   data: {
          //     GM_ID: row.GM_ID,
          //   },
          // });
          // commonStore.loading = false;
          // if (result.ok) {
          //   window.alert({ title: title_str });
          // } else {
          //   window.alert({ title: `회원을 삭제하지 못했습니다.` });
          // }
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
        title: '이름',
        dataIndex: 'user_name',
        key: 'user_name',
        align: 'center',
      },
      {
        title:'',
        render: (_, row) => (
          <Space size="middle">
            [
            <Button
              size="small"
              type="link"
              onClick={handleModify(true, row)}
            >
              D
            </Button>
            /
            <Button
              size="small"
              type="link"
              onClick={handleModify(true, row)}
              danger
            >
              N
            </Button>
            ]
          </Space>
        ),
      },
      {
        title: '계정',
        dataIndex: 'user_id',
        key: 'user_id',
        align: 'center',
      },
      {
        title: '소속 회사',
        dataIndex: 'company',
        key: 'company',
        align: 'center',
      },
      {
        title: '부서',
        dataIndex: 'team',
        key: 'team',
        align: 'center',
      },
      {
        title: '부서 내 역할',
        dataIndex: 'role',
        key: 'role',
        align: 'center',
      },
      {
        title: '직급',
        dataIndex: 'class',
        key: 'class',
        align: 'center',
      },
      {
        title: '근무상태',
        dataIndex: 'work_state',
        key: 'work_state',
        render: (_, row) => (row.work_state == 'Y' ? '재직중' : '퇴사'),
        align: 'center',
      },
      {
        title: '사용여부',
        key: 'action',
        render: (_, row) => (
          <Space size="middle">
            <Checkbox
              onChange={handleRemove(row)}
              checked={(row.use_yn == 'Y' ? true : false )}
            >
            </Checkbox>
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
      <Breadcrumb>
        <Breadcrumb.Item>Home</Breadcrumb.Item>
        <Breadcrumb.Item>관리</Breadcrumb.Item>
        <Breadcrumb.Item>공통코드</Breadcrumb.Item>
      </Breadcrumb>
      <Row
        justify="space-between"
        gutter={[10, 10]}
        style={{ marginBottom: 10 }}
      >
        <Col xs={24} lg={12}>
          <TotalStatus>
            총 <span className="cnt">{state.list.length}</span> 명
          </TotalStatus>
        </Col>
        <Col xs={24} lg={12}>
          <Button
            className="add-btn"
            type="primary"
            onClick={handleModify(true)}
            icon={<PlusOutlined />}
          >
            사용자 추가
          </Button>
        </Col>
      </Row>

      <Table
        dataSource={toJS(state.list)}
        columns={columns}
        scroll={{ x: 1200 }}
        pagination={false}
        rowKey={(row) => row.mem_id}
      />

      <UserModify
        modifyOpen={state.modifyOpen}
        propData={toJS(state.selectedData)}
        refetch={fetchData}
        handleModify={handleModify}
        setLoading={state.setLoading}
      />
    </Wrapper>
  );
});

export default UserList;
