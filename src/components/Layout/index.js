/* eslint-disable react-hooks/exhaustive-deps*/
import React from 'react';
import { Layout } from 'antd';
import { observer, inject } from 'mobx-react';
import styled from 'styled-components';
import HeaderLeft from '@components/Layout/HeaderLeft'
import TabHeader from '@components/Layout/TabHeader'
import "/node_modules/flexlayout-react/style/light.css";
import '../../app/Layout.css';
import { useLocation,  useHistory } from 'react-router-dom/cjs/react-router-dom';
import Cookies from 'js-cookie';
import Loading from '@components/Loading/index2';
import DaumAddress from '@components/Common/DaumAddress';

const { Content } = Layout;

const Wrapper = styled(Layout)``;

const LayoutContainer = ({commonStore, children, tabStore}) => {
  const [chkIsLogin, setChkIsLogin] = React.useState(false)
  const history = useHistory()
  let location = useLocation()
  // 로그인 쿠키 체크 (interval key를 저장하여 반복 해제할 수 있도록 한다.)
  // 5분마다 한번씩 점검
  React.useEffect(() => {
    if (location.pathname !== "/Login" && Cookies.get('logincheck') !== undefined) {
      commonStore.setCookieCheckIntervalKey(setInterval(() => {
        if (!commonStore.checkCookie()) {
          commonStore.logout()
        }
      }, 5 * 60 * 1000))
    }
  }, [])

  // 사용자 정보 검증 > api처리가 필요할 수도 있어서 비동기 처리
  const awaitCheckUserData = () => {
    const userDataCheckApi = () => {
      return new Promise(async (resolve) => {
        let result = await commonStore.checkUserData()
        resolve(await result)
      })
    }

    return new Promise(async (resolve) => {
      // 사용자 정보를 갖고 있는지? 
      // 있으면 바로 통과 
      if (commonStore.user && commonStore.user.email) {
        setChkIsLogin(true)
        // 사용자 정보를 가지고 쿠키를 안 물고 있을 수도 있으니
        commonStore.refreshCookie()
      }
      // 사용자 정보는 없어도 logincheck 쿠키를 가지고 있는지
      else if (commonStore.checkCookie()) {
        // user data를 가져와본다.
        
        await userDataCheckApi()
        .then((result) => {
          if (result) {
            // 로딩창 풀고 로그인 완료 처리
            // commonStore.user에 api 결과 값을 할당
            commonStore.user = result
            resolve(true)
          }
          else {
            // 리턴 못 받아왔을 경우
            resolve(false)
          }
        })
        .catch(() => {
          // 터졌을 때
          resolve(false)
        })
      }
      // 둘 다 없으면 chkIsLogin false
      else {
        resolve(false)
      }
    })
  }
  
  if (!commonStore.user || !commonStore.user.email) {
    awaitCheckUserData()
    .then((result) => {
      // 이건 위 검증이 종료된 뒤 수행되어야 해
      if (result) {
        if (result.message === "Unauthenticated.") {
          if (location.pathname !== '/Login') {
            history.replace('/Login')
          }
        }
        else {
          setChkIsLogin(true)
          if (location.pathname === '/Login') {
            if (Cookies.get('viewTabKey') !== undefined) {
              history.replace(Cookies.get('viewTabKey'))
            }
            else {
              history.replace('/')
            }
          }

        }
      }
      else {
        if (location.pathname !== '/Login') {
          history.replace('/Login')
        }
      }
    })
  }
  else {
    !chkIsLogin && setChkIsLogin(true)
  }

  if (!chkIsLogin && location.pathname !== "/Login") {
    return <Loading/>
  }
  else {
    if (location.pathname === "/Login") {
      return (
        <>
          {children}
        </>
      )
    }
    else {
      return (
        <Wrapper collapsed={tabStore.menuCollapsing ? 1 : 0}>
          <HeaderLeft/>
          <Layout className="content-layout">
            <div className="contents-wrap" id="contentsWrap">
              <Content className="content">
                <TabHeader renderPage={children}/>
              </Content>
            </div>
          </Layout>
          {commonStore.postVisible && <DaumAddress/>}
        </Wrapper>
      )
    }
  }
}

export default inject('commonStore', 'tabStore')(observer(LayoutContainer));
