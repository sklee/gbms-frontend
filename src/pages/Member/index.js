/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Tabs } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';

import MemberList from './MemberList';
import Roles from './Roles';

const { TabPane } = Tabs;

const Wrapper = styled.div`
  width: 100%;
`;

const Member = observer(() => {
  const router = useHistory();
  const { commonStore } = useStore();
  const state = useLocalStore(() => ({
    isRender: false,
    tab: '1',
  }));

  const handleChangeTab = useCallback((key) => {
    state.tab = key;
  }, []);

  useEffect(() => {
    if (router.location.query && router.location.query.tab) {
      state.tab = `${router.location.query.tab}`;
    }
  }, [router.location]);

  useEffect(() => {
    console.log(commonStore.user);
     //if (!commonStore.user || !commonStore.user.mem_is_admin) {
    //  if (!commonStore.user ) {
    //    window.alert({ title: '권한이 없습니다.' });
    //  } else {
      state.isRender = true;
    //}
  }, []);

  return (
    <Wrapper>
      {state.isRender && (
        <Tabs activeKey={state.tab} onChange={handleChangeTab}>
          <TabPane tab="회원리스트" key="1">
            <MemberList />
          </TabPane>
          <TabPane tab="권한관리" key="3">
            <Roles />
          </TabPane>
        </Tabs>
      )}
    </Wrapper>
  );
});

export default Member;
