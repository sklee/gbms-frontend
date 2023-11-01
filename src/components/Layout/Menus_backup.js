/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Space, Button } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import { toJS } from 'mobx';
import styled from 'styled-components';

import useStore from '@stores/useStore';

import menuData from '@pages/menuData';

const { SubMenu } = Menu;

const Wrapper = styled.div`
`;

const rootSubmenuKeys = ['admin', 'ProductAll', 'author','BillingApprovals','finance','produceMgmt','production','salesMgmt'];

const Menus = observer(({  addTab, userInfo, viewTab }) => {
  const location = useLocation();
  const { commonStore } = useStore();
  const state = useLocalStore(() => ({
    mouseEnterMenu: null,
    menuOpenBl:false,
    menuData : [],
  }));

  const onOpenChange = useCallback((openKeys) => {
    const latestOpenKey = openKeys.slice(-1)[0];
    if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      commonStore.menuOpenKeys = openKeys;
    } else {
      latestOpenKey ? commonStore.menuOpenKeys = [latestOpenKey] : commonStore.menuOpenKeys = [];
    }
  }, []);
  const onSelect = useCallback(({ key }) => {
    commonStore.menuSelectedKeys = [key];
  }, []);
  const handleMouseEnter = useCallback(
    (key) => () => {
      state.mouseEnterMenu = key;
    },
    [],
  );
  const handleMouseLeave = useCallback(() => {
    state.mouseEnterMenu = null;
  }, []);
  
  const handleOnClick = useCallback((name,key) => {
    addTab(name,key);
  }, []);

  const openMenuSet = (targetKey) =>{
    let openMenuArr = [];
    for (const item of menuData) {
      if (item.key === targetKey) {
        openMenuArr = [item.key];
        break;
      }
      if (item.children) {
        for (const c of item.children) {
          if (c.key === targetKey) {
            openMenuArr = [item.key, c.key];
            break;
          }
          if (c.children) {
            for (const cc of c.children) {
              if (cc.key === targetKey) {
                openMenuArr = [item.key, c.key, cc.key];
                break;
              }
            }
          }
        }
      }
    }
    return openMenuArr;
  }

  useEffect(() => {
    console.log('viewtab : '+viewTab)
    if(viewTab =='fst'){
      let value = [];
      let isFind = false;
      let tabName = "";
      for (const item of menuData) {
        if (item.link === location.pathname) {
          value = [item.key];
          tabName = item.label;
          break;
        }
        if (item.children) {
          for (const c of item.children) {
            if (c.link === location.pathname) {
              value = [item.key, c.key];
              isFind = true;
              tabName = item.label + ' > ' + c.label;
              break;
            }
            if (c.children) {
              for (const cc of c.children) {
                if (cc.link === location.pathname) {
                  value = [item.key, c.key, cc.key];
                  isFind = true;
                  tabName = item.label + ' > ' + c.label + ' > ' + cc.label;
                  break;
                }
              }
            }
          }
        }
        if (isFind) {
          break;
        }
      }
      commonStore.menuTabname = tabName;
      commonStore.menuOpenKeys = value;
      commonStore.menuSelectedKeys = value;
      commonStore.menuKey = value[value.length - 1];
      addTab(commonStore.menuTabname,commonStore.menuKey);
    }else{
      commonStore.menuSelectedKeys = openMenuSet(viewTab);
      commonStore.menuOpenKeys = openMenuSet(viewTab);
    }


    if(userInfo !== '' && userInfo !== undefined){
      var data = ''
      if( userInfo.email ===  'dyheo@gilbut.co.kr' || userInfo.email ===  'withanne@gilbut.co.kr' || userInfo.email ===  'tommy@gilbut.co.kr' 
        || userInfo.email ===  'kkhkg2@gilbut.co.kr' || userInfo.email === 'kumjoo_92@gilbut.co.kr' | userInfo.email === 'test300@gilbut.co.kr') {
          data = menuData
      }else{       
        menuData.forEach(e => {        
          if(e.key === 'ProductAll' || e.key === 'author' || e.key === 'BillingApprovals' || e.key === 'finance'){
            if(e.key === 'finance'){
              var children = []
              e.children.forEach(a => {       
                if(a.key !== 'billingAccounts' && a.key !== 'financeEvidence'){
                  children = [...children, a]
                }
              });
              e.children = children
            }            
            data = [...data,e]
          }
        });
      }

      state.menuData = data
    }
  }, [location, viewTab]);

  const menuItems = (item) => {
    return item.children ? (
        <SubMenu key={item.key} icon={item.Icon()} title={item.label} >
          {item.children.map((c) =>
            c.children ? (
              <SubMenu key={c.key} title={c.label}>
                {c.children.map((cc) => (
                  <Menu.Item
                    className="depth3"
                    key={cc.key}
                    onMouseEnter={handleMouseEnter(cc.key)}
                    onMouseLeave={handleMouseLeave}
                    onClick={(e)=>{handleOnClick(item.label+' > '+c.label+' > '+cc.label, cc.key)}}
                  >
                    <div className="label">
                      <span>{cc.label}</span>
                      {/* <Link to={cc.link} onClick={(e)=>{handleOnClick(cc.label)}}>{cc.label}</Link>*/}
                      {state.mouseEnterMenu === cc.key && (
                        <Button
                          type="text"
                          icon={<CopyOutlined />}
                          target="_blank"
                          href={cc.link}
                          onClick={(e)=>{e.stopPropagation();}}
                        />
                      )}
                    </div>
                  </Menu.Item>
                ))}
              </SubMenu>
            ) : (
              <Menu.Item
                key={c.key}
                onMouseEnter={handleMouseEnter(c.key)}
                onMouseLeave={handleMouseLeave}
                onClick={(e)=>{handleOnClick(item.label+' > '+c.label, c.key)}}
              >
                <div className="label">
                  <span>{c.label}</span>
                  {/* <Link to={c.link} onClick={(e)=>{handleOnClick(c.label)}}>{c.label}</Link>*/}
                  {state.mouseEnterMenu === c.key && (
                    <Button
                      type="text"
                      icon={<CopyOutlined />}
                      target="_blank"
                      href={c.link}
                      onClick={(e)=>{e.stopPropagation();}}
                    />
                  )}
                </div>
              </Menu.Item>
            ),
          )}
        </SubMenu>
    ) : (
        <Menu.Item
          key={item.key}
          icon={item.Icon()}
          onMouseEnter={handleMouseEnter(item.key)}
          onMouseLeave={handleMouseLeave}
          onClick={(e)=>{handleOnClick(item.label,item.key )}}
        >
          <div className="label">
            <span>{item.label}</span>
            {/* <Link to={item.link} >{item.label}</Link> */}
            {/* {item.label} */}
            {state.mouseEnterMenu === item.key && (
              <Button
                type="text"
                icon={<CopyOutlined />}
                target="_blank"
                href={item.link}
                onClick={(e)=>{e.stopPropagation();}}
              />
            )}
          </div>
        </Menu.Item>
    );
  };

  return (
    <Wrapper>
      <Menu
        theme="light"
        mode="inline"
        inlineIndent= "15"
        openKeys={toJS(commonStore.menuOpenKeys)}
        selectedKeys={toJS(commonStore.menuSelectedKeys)}
        defaultSelectedKeys={['dashboard']}
        onOpenChange={onOpenChange}
        onSelect={onSelect}
        subMenuCloseDelay="0"
        subMenuOpenDelay="0"
        selectable
      >
        {/* {menuData.map((item) => menuItems(item))} */}
        {state.menuData.map((item) => menuItems(item))}
      </Menu>
    </Wrapper>
  );
});

export default Menus;
