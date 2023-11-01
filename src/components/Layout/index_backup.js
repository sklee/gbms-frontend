/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Layout, Row, Col, Space, Button, Badge, Input, Image } from 'antd';
import {
  RightOutlined,
  LeftOutlined,
  BellOutlined,
  NotificationOutlined,
} from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import { toJS } from 'mobx';
import styled from 'styled-components';

import Menus from './Menus';
import HeaderLeft from './HeaderLeft';
import HeaderRight from './HeaderRight';

import '../../app/Layout.css';

const { Header, Sider, Content } = Layout;

const Wrapper = styled(Layout)``;

const StyledSider = styled(Sider)``;

const LayoutContainer = observer((props) => {
  const state = useLocalStore(() => ({
    collapsed: false,
  }));

  const toggle = useCallback(() => {
    state.collapsed = !state.collapsed;
  }, []);

  return (
    <Wrapper collapsed={state.collapsed ? 1 : 0}>
      <StyledSider trigger={null} collapsible collapsed={state.collapsed} style={{ width: 250 }}> 
        <Row
          gutter={[10, 10]}
          justify="center"
          align="middle"
        >
          {!state.collapsed && <span className="asideTitle">길벗출판사 업무시스템</span>}
          <Col className="alarm">
            <Button
              type="text"
              icon={
                <Badge count={9} size="small">
                  <BellOutlined style={{ fontSize: '1rem' }} />
                </Badge>
              }
            />
            <Button
              type="text"
              icon={
                <Badge count={2} size="small">
                  <NotificationOutlined style={{ fontSize: '1rem' }} />
                </Badge>
              }
            />
          </Col>

        </Row>
        <Space className="asideMenu">
          <Menus />
        </Space>
        <Row
          gutter={[10, 10]}
          justify="center"
          align="middle"
        >
          <Col>
            <Space className="asideNav">
              {React.createElement(
                state.collapsed ? RightOutlined : LeftOutlined,
                {
                  className: 'trigger',
                  onClick: toggle,
                },
              )}
            </Space>
          </Col>
        </Row>
      </StyledSider>

      <Layout className="content-layout">
        <Header className="header">
          <HeaderLeft />
          <HeaderRight />
        </Header>
        <div className="contents-wrap">
          <Content className="content">{props.children}</Content>
        </div>
        {/* <Footer className="footer">© 2021. Gilbut. ALL RIGHTS RESERVED.</Footer> */}
      </Layout>
    </Wrapper>
  );
});

export default LayoutContainer;
