/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo } from 'react';
import { Table, Space, Button, Row, Col, Checkbox } from 'antd';
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

import Loading from '@components/Loading';

import MemberModify from './MemberModify';

import MemberModifyDrawer from './MemberModifyDrawer';

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

const MemberList = observer((props) => {
  const { commonStore } = useStore();
  const state = useLocalStore(() => ({
    list: [],
    tot_list: [],

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
      state.list = result[1].res_data;
      state.tot_list = result[0].paging_info;
      console.log(toJS(state.list));
      console.log(toJS(state.tot_list.total));
    }
    commonStore.loading = false;
  }, []);

  const handleModify = useCallback(
    (modalOpen, data) => async() => {
      if (modalOpen && data) {
        commonStore.loading = true;
        const result = await commonStore.handleApi({
          method: 'POST',
          url: 'member/details',
          data : { user_id : data.user_id, }
        });
        if (result) {
          state.selectedData = result;
          console.log(toJS(state.selectedData));
        }

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
        content: `${row.GM_ID}(${row.GM_NAME}) 회원이 삭제됩니다.`,
        async onOk() {
          commonStore.loading = true;
          let title_str = `${row.GM_ID}(${row.GM_NAME}) 회원이 삭제되었습니다.`;
          const result = await commonStore.handleApi({
            method: 'POST',
            url: 'member/delete',
            data: {
              GM_ID: row.GM_ID,
            },
          });
          commonStore.loading = false;
          if (result.ok) {
            window.alert({ title: title_str });
          } else {
            window.alert({ title: `회원을 삭제하지 못했습니다.` });
          }
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
        title: '아이디',
        dataIndex: 'user_id',
        key: 'mem_userid',
        align: 'center',
      },
      {
        title: 'E-Mail',
        dataIndex: 'GM_EMAIL',
        key: 'mem_email',
        align: 'center',
      },
      {
        title: '이름',
        dataIndex: 'user_name',
        key: 'mem_username',
        align: 'center',
      },
      {
        title: '닉네임',
        dataIndex: 'GM_NICK_NAME',
        key: 'mem_nickname',
        align: 'center',
      },
      {
        title: '핸드폰',
        dataIndex: 'GM_HP',
        key: 'mem_phone',
        align: 'center',
      },
      {
        title: '등급',
        dataIndex: 'GM_LEVEL',
        key: 'mem_level',
        align: 'center',
      },
      {
        title: '관리자여부',
        dataIndex: 'GM_ADMIN',
        key: 'mem_is_admin',
        render: (_, row) => (row.mem_is_admin == 1 ? 'Y' : 'N'),
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

  const columns_test = useMemo(
    () => [
      {
        title: '이름',
        dataIndex: 'user_name',
        key: 'mem_username',
        align: 'center',
      },
      {
        title: '계정',
        dataIndex: 'user_id',
        key: 'mem_userid',
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
        title: '근무 상태',
        dataIndex: 'work_state',
        key: 'work_state',
        align: 'center',
      },
      {
        title: '사용 여부',
        dataIndex: 'use_yn',
        key: 'use_yn',
        render: (_, row) => (<Checkbox
          checked={row.use_yn == 'Y' ? true : false}
        ></Checkbox>),
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
      <Row
        justify="space-between"
        gutter={[10, 10]}
        style={{ marginBottom: 10 }}
      >
        <Col xs={24} lg={12}>
          <TotalStatus>
            총 <span className="cnt">{toJS(state.tot_list.total)}</span> 명의 회원
          </TotalStatus>
        </Col>
        <Col xs={24} lg={12}>
          <Button
            className="add-btn"
            type="primary"
            onClick={handleModify(true)}
            icon={<PlusOutlined />}
          >
            회원등록
          </Button>
        </Col>
      </Row>

      <Table
        dataSource={toJS(state.list)}
        columns={columns_test}
        scroll={{ x: 1200 }}
        pagination={false}
        rowKey={(row) => row.user_id}
      />

      {/* <MemberModify
        modifyOpen={state.modifyOpen}
        propData={toJS(state.selectedData)}
        refetch={fetchData}
        handleModify={handleModify}
        setLoading={state.setLoading}
      /> */}

      <MemberModifyDrawer
        modifyOpen={state.modifyOpen}
        propData={toJS(state.selectedData)}
        refetch={fetchData}
        handleModify={handleModify}
        setLoading={state.setLoading}
      />
    </Wrapper>
  );
});

export default MemberList;
