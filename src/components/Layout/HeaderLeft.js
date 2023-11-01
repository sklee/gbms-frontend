import React, {createElement, useState, useCallback} from 'react';
import { Space, Row, Col, Badge, Button, Layout } from 'antd';
import { RightOutlined, LeftOutlined, BellOutlined, NotificationOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import {toggle} from './TabHeader';
import HeaderRight from './HeaderRight';
import Menus from './Menus';
const { Sider } = Layout;
const StyledSider = styled(Sider)``;

const HeaderLeft = () => {
  const [menuCollapsing, setMenuCollapsing] = useState(false)
  const onClickCollapsingBtn = useCallback(() => {
    setMenuCollapsing(toggle(menuCollapsing))
  })

  return (
    <StyledSider trigger={null} collapsible collapsed={menuCollapsing} width={ 230 }> 
        <Row
          gutter={[10, 10]}
          justify="center"
          align="middle"
        >
          {!menuCollapsing && 
          <>
            <span className="asideTitle">길벗출판사 업무시스템</span>
            <Row className="asideIcon">
              <Col className="alarm">
                <Button
                  type="text"
                  icon={
                    <Badge count={9} size="small">
                      <BellOutlined style={{ fontSize: '1.1rem' }} />
                    </Badge>
                  }
                />
                <Button
                  type="text"
                  icon={
                    <Badge count={2} size="small">
                      <NotificationOutlined style={{ fontSize: '1.1rem' }} />
                    </Badge>
                  }
                />
              </Col>
              <Col>
                <HeaderRight />
              </Col>
            </Row>
          </>
          }

        </Row>
        <Space className="asideMenu">
          <Menus/>
        </Space>
        <Row
          gutter={[10, 10]}
          justify="center"
          align="middle"
        >
          <Col>
            <Space className="asideNav">
              {createElement(
                menuCollapsing ? RightOutlined : LeftOutlined,
                {
                  className: 'trigger',
                  onClick: onClickCollapsingBtn,
                },
              )}
            </Space>
          </Col>
        </Row>
      </StyledSider>
  );
}

export default HeaderLeft
