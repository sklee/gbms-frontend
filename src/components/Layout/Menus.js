import React, { useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { Menu, Button } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { observer, inject } from 'mobx-react';
import { toJS } from 'mobx';
import siteMap, {getMenuData} from '@pages/menuData';
const { SubMenu } = Menu;

// 2023.05.11 조휘제
// flex Layout 관련 함수 제거
// 페이지 이동은 history push



const openMenuSet = (currentLocation) =>{
  let openMenuArr = [];
  let targetMenuData = []
  targetMenuData = siteMap.filter((item) => (currentLocation == item.link))
  if (targetMenuData.length !== 0) {
    openMenuArr.push(targetMenuData[0].key)
  }

  if (targetMenuData[0].parentId !== undefined) {
    targetMenuData = siteMap.filter((item) => (item.id == targetMenuData[0].parentId))
    if (targetMenuData.length !== 0) {
      openMenuArr.push(targetMenuData[0].key)
    }
  }

  if (targetMenuData[0].parentId !== undefined) {
    targetMenuData = siteMap.filter((item) => (item.id == targetMenuData[0].parentId))
    if (targetMenuData.length !== 0) {
      openMenuArr.push(targetMenuData[0].key)
    }
  }
  return openMenuArr
}

const linkToKey = (link) => {
  const filterArr = siteMap.filter((item) => (item.link == link))
  if (filterArr[0] !== undefined ) {
    return filterArr[0].key
  }
  else {
    return ''
  }
}

// Menu에서 NODE로 정형화된 형태(Menu.Item)를 부름
// Menu.Item 내부 공통적으로 들어가는 요소 (콜백 함수 등)을 
// object화하여 간소화
const Menus = ({commonStore}) => {
  // 페이지 이동을 위한 history Hook 호출
  const history = useHistory()
  // 현재 페이지 체크를 위한 Location Hook 호출
  const location = useLocation()
  // 마우스 in out State
  const [mouseEnterMenu, setMouseEnterMenu] = useState(null)
  // 열린 메뉴들
  const [menuOpenKeys, setMenuOpenKeys] = useState(openMenuSet(location.pathname))

  // 전체 메뉴 접근 허용된 이메일 배열
  const allowEmails = [
    'dyheo@gilbut.co.kr', 
    'withanne@gilbut.co.kr', 
    'tommy@gilbut.co.kr', 
    'kkhkg2@gilbut.co.kr', 
    'kumjoo_92@gilbut.co.kr', 
    'test300@gilbut.co.kr'
  ]

  const onSelect = ({ keyPath }) => {
    setMenuOpenKeys(keyPath);
  };

  // 2023.05.11
  // 왼쪽 메뉴를 구성할 사이트맵
  // 권한 설정과 관련있음. allowEmails에 있는 이메일의 사용자에게만
  // 전체 메뉴 공개. 이외에는 제한된 메뉴만 공개. 
  // menuData.js 참조
  let menuData             = []
  if (commonStore.user && commonStore.user.email in allowEmails) {
    menuData = getMenuData()
  }
  else {
    menuData = getMenuData(false)
  }

  // 서브 메뉴 (Menu.Item) props 구성
  const submenuPropsData = (subMenuData) => ({
    key           : subMenuData.key ,
    onMouseEnter  : () => { setMouseEnterMenu(subMenuData.key) },
    onMouseLeave  : () => { setMouseEnterMenu(null) },
    onClick       : () => { history.push(subMenuData.link) },
  })

  // NewTabContent props 구성
  const newTabPropsData = (subMenuData) => ({
    menuKey : subMenuData.key, 
    label   : subMenuData.label,
    link    : subMenuData.link
  })

  // 서브메뉴 구성
  const NewTabContent = ({menuKey, label, link}) => 
    <div className="label">
      <span>{label}</span>
      <OpenNewPage link={link} menuKey={menuKey}/>
    </div>

  // 새창으로 열기 버튼
  // path값만 전달받음
  const OpenNewPage = ({link, menuKey}) => 
    mouseEnterMenu === menuKey && 
    <Button
      type="text"
      icon={<CopyOutlined />}
      target="_blank"
      href={link}
      onClick={(e) => e.stopPropagation}
    />
  
  // menuData를 기반으로 내용물 구성
  const MenuItems = (dept1) => (
    dept1 === [] ? 
    <></> 
    : 
    dept1.children ? 
    <SubMenu 
      key={dept1.key}
      title={dept1.label}
    >
      {dept1.children.map((dept2) => 
        dept2.children ? (
          <SubMenu key={dept2.key} title={dept2.label}>
            {dept2.children.map((dept3) => (
              <Menu.Item {...submenuPropsData(dept3)}>
                <NewTabContent {...newTabPropsData(dept3)}/>
              </Menu.Item>
            ))}
          </SubMenu>
        ) : (
          <Menu.Item {...submenuPropsData(dept2)}>
            <NewTabContent {...newTabPropsData(dept2)}/>
          </Menu.Item>
        ),
      )}
    </SubMenu>
    :
    <Menu.Item {...submenuPropsData(dept1)}>
      <NewTabContent {...newTabPropsData(dept1)}/>
    </Menu.Item>
  )
  
  return (
    <Menu
      theme="light"
      mode="inline"
      inlineIndent= "15"
      subMenuCloseDelay="0"
      subMenuOpenDelay="0"
      selectable
      // 기본 열린 (활성화 시킨) key값 (array)
      defaultSelectedKeys={['dashboard']}
      // 현재 열린 페이지 key (array)
      selectedKeys={toJS(linkToKey([location.pathname]))}
      // 현재 열린 메뉴 key (array)
      openKeys={toJS(menuOpenKeys)}
      // 메뉴를 클릭했을 때 (콜백)
      onOpenChange={setMenuOpenKeys}
      // 메뉴를 클릭했을 때 해당 메뉴만 활성화
      onSelect={onSelect}
    >
      {menuData.map(MenuItems)}
    </Menu>
  )
}

export default inject('commonStore')(observer(Menus))
