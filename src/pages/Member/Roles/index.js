/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo } from 'react';
import { Table, Collapse, Row, Col, Select, Button, Affix } from 'antd';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';

import menuData from '@pages/menuData';

const { Panel } = Collapse;
const { Option } = Select;

const Wrapper = styled.div`
  width: 100%;
`;

const Roles = observer((props) => {
  const { commonStore } = useStore();
  const state = useLocalStore(() => ({
    menuRoles: [],
    boardRoles: [],
  }));

  const getMenus = useCallback((arr) => {
    let value = [];
    for (const item of arr) {
      value.push({ id: item.id, label: item.label });
      if (item.children) {
        value = value.concat(getMenus(item.children));
      }
    }
    return value;
  }, []);

  const fetchData = useCallback(async () => {
    commonStore.loading = true;

    const roles = toJS(commonStore.roles);

    if (menuData) {
      const menus = getMenus(menuData);
      const filteredMenuRoles = roles.filter(
        (item) => item.role_type === 'menu',
      );
      const menuRoles = [];
      for (const [idx, item] of menus.entries()) {
        const f = filteredMenuRoles.find((r) => r.menu_id === item.id);
        if (f) {
          menuRoles.push({
            rowKey: `menu_role_${idx}`,
            name: item.label,
            id: f.id,
            role_type: f.role_type,
            menu_id: f.menu_id,
            read: f.read,
            write: f.write,
          });
        } else {
          menuRoles.push({
            rowKey: `menu_role_${idx}`,
            name: item.label,
            role_type: 'menu',
            menu_id: item.id,
            read: 0,
            write: 0,
          });
        }
      }
      state.menuRoles = menuRoles;
    }

    const boards = await commonStore.handleApi({
      url: `/board/list?isAdmin=1`,
    });

    if (boards) {
      let list = [];
      for (const [idx, item] of boards.entries()) {
        if (item.boardRole && item.boardRole.id) {
          list.push({
            rowKey: `board_role_${idx}`,
            name: item.name,
            id: item.boardRole.id,
            role_type: 'board',
            board_id: item.boardRole.board_id,
            read: item.boardRole.read,
            write: item.boardRole.write,
          });
        } else {
          list.push({
            rowKey: `board_role_${idx}`,
            name: item.name,
            role_type: 'board',
            board_id: item.id,
            read: 0,
            write: 0,
          });
        }
      }
      state.boardRoles = list;
    }
    commonStore.loading = false;
  }, []);

  const handleChangeSelect = useCallback(
    (key, idx, type) => (value) => {
      const list = toJS(state[key]);
      list[idx][type] = value;
      state[key] = list;
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    commonStore.loading = true;
    const menuRoles = toJS(state.menuRoles);
    const boardRoles = toJS(state.boardRoles);
    const list = [...menuRoles, ...boardRoles];

    for (const item of list) {
      if (item.id !== undefined && item.id !== null) {
        await commonStore.handleApi({
          method: 'POST',
          url: '/role/update',
          data: {
            id: item.id,
            updateData: {
              read: item.read,
              write: item.write,
            },
          },
        });
      } else {
        const data = {
          role_type: item.role_type,
          read: item.read,
          write: item.write,
        };
        if (data.role_type === 'menu') {
          data.menu_id = item.menu_id;
        } else if (data.role_type === 'board') {
          data.board_id = item.board_id;
        }
        await commonStore.handleApi({
          method: 'POST',
          url: '/role/create',
          data,
        });
      }
    }

    await fetchData();
    commonStore.loading = false;
    window.success({ title: '권한이 저장되었습니다.' });
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const columns = useMemo(
    () => [
      {
        title: '권한명',
        dataIndex: 'name',
        key: 'name',
        align: 'center',
      },
      {
        title: '읽기등급',
        dataIndex: 'read',
        key: 'read',
        render: (_, row, idx) => (
          <Select
            value={row.read}
            onChange={handleChangeSelect(`${row.role_type}Roles`, idx, 'read')}
          >
            <Option value={0}>0</Option>
            <Option value={1}>1</Option>
            <Option value={2}>2</Option>
            <Option value={3}>3</Option>
            <Option value={4}>4</Option>
            <Option value={5}>5</Option>
          </Select>
        ),
        align: 'center',
      },
      {
        title: '쓰기등급',
        dataIndex: 'write',
        key: 'write',
        render: (_, row, idx) => (
          <Select
            value={row.write}
            onChange={handleChangeSelect(`${row.role_type}Roles`, idx, 'write')}
          >
            <Option value={0}>0</Option>
            <Option value={1}>1</Option>
            <Option value={2}>2</Option>
            <Option value={3}>3</Option>
            <Option value={4}>4</Option>
            <Option value={5}>5</Option>
          </Select>
        ),
        align: 'center',
      },
    ],
    [],
  );

  return (
    <Wrapper>
      <Row gutter={[20, 10]}>
        <Col xs={20}>
          <Collapse defaultActiveKey={['1', '2']}>
            <Panel header="메뉴 권한" key="1">
              <Table
                dataSource={toJS(state.menuRoles)}
                columns={columns}
                pagination={false}
                rowKey={(row) => row.rowKey}
              />
            </Panel>
            <Panel header="게시판 권한" key="2">
              <Table
                dataSource={toJS(state.boardRoles)}
                columns={columns}
                pagination={false}
                rowKey={(row) => row.rowKey}
              />
            </Panel>
          </Collapse>
        </Col>
        <Col xs={4}>
          <Affix offsetTop={20}>
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={!state.menuRoles.length || !state.boardRoles.length}
              block
            >
              저장
            </Button>
          </Affix>
        </Col>
      </Row>
    </Wrapper>
  );
});

export default Roles;
