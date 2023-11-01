/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useEffect, useCallback, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { observer, useLocalStore } from 'mobx-react';

import globalModal from '@utils/global-modals';

// 외주 개발자 코드
import Pages from '@pages';
import Login from '@pages/Login/index'; // 기존 로그인
import Login2 from '@pages/Login/index2'; //21.11.12 khl add
import axios from 'axios'; //21.11.15 khl add 
import useStore from '@stores/useStore';


// 튜토리얼 코드
import {clearState, loadJWT} from '../common-utils/LocalStorage';
import Authentication from '../pages/authentication/Authentication';
// import Dashboard from '../pages/restricted/dashboard';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

globalModal();


const App = observer(() => {
  const { commonStore } = useStore();
  const [session_id, setSession] = useState('');
  console.log(commonStore.user);
  console.log(session_id);

  //21.11.15 khl add
  // window.onbeforeunload = function() {
  //   localStorage.removeItem('user_id');
  //   return '';
  // };  

  //ip 체크
  // useEffect( () => {
  //   if( ip == "112.220.196.146"){
  //     console.log('ip return');
  //     return;
  //   }else{
  //     console.log('ip chk');
  //     getIpClient();
  //   }
    
  // }, [])

  getIpClient();
  

  // const user_id = localStorage.getItem("user_id");
  // console.log(user_id);
  // if(user_id != ""){
  //  commonStore.user = user_id;
  //  //sessionChk();
  // }

  const [ip, setIP] = useState('');

  async function getIpClient() {
    
    const ip_chk = await axios.get('https://ipinfo.io/json');
    console.log(ip_chk.data.ip);
    setIP(ip_chk.data.ip);

    if(commonStore.user ==""){
      sessionChk();
    }
    
    // try {
    //   const ip_chk = await axios.get('https://ipinfo.io/json');
    //   console.log(ip_chk.data.ip);
    //   setIP(ip_chk.data.ip);
    // } catch (error) {
    //   console.error(error);
    // }
  }

 
  

  async function sessionChk() {
    
   //try {
      const session_chk = await axios.get('member2/session_chk');
      console.log('2');
      console.log(session_chk.data);
      
      if(session_chk.data.user  != "" ){
        //if(session_chk.data.user.user_id == user_id){
          console.log(session_chk.data.user);
          setSession(session_chk.data.user.user_id);
          commonStore.user = session_chk.data.user;
       // }else{
          commonStore.user = '';
        //}
      }else{
        commonStore.user = '';
      }
  //  } catch (error) {
  //     console.error(error);
  //  }
  }


  // axios({ 
  //   method: 'get', 
  //   url: 'member2/session_chk', 
  //   params: { 
  //   } 
  // }) 
  // .then(function (response) { 
  //   console.log(response); 
  // }) 
  // .catch(function (error) {
  //   console.error(error);
  //  });




  

  //현재 url정보
  const current = decodeURI(window.location.href);

  // useEffect( () => {
  //   sessionChk();
  // }, [current])



  //end

  /*
  ////////////////////////////////////////
  // 튜토리얼 코드 - 시작
  const [isAuthenticated, setIsAuthenticated] = useState(!!loadJWT());
  console.log('[main index] isAuthenticated:', isAuthenticated);

  const onLogin = () => {
      setIsAuthenticated(true);
  };

  const onLogout = () => {
      clearState();
      setIsAuthenticated(false);
  };

  return !isAuthenticated ?
        <Authentication
            setIsAuthenticated={onLogin}
        />
        :
        <BrowserRouter>
          <Pages />
        </BrowserRouter>;
  // 튜토리얼 코드 - 끝
  ////////////////////////////////////////
  */

  // 외주 개발자 코드
  return (
    <>
      {commonStore.user ? (
        <BrowserRouter>
          <Pages />
        </BrowserRouter>
      ) : (
          <Login2 />
      )}  

      {/* 21.11.15 khl 수정 */}
      {/* {ip === "112.220.196.146" ? (
        //  commonStore.user ?
         commonStore.user ?
          <BrowserRouter>
            <Pages />
          </BrowserRouter>
        :
          <Login2 />

      ) : (
        commonStore.user ?
          <BrowserRouter>
            <Pages />
          </BrowserRouter>
         :
           <Login />
      )} */}
      {/* {commonStore.user ? (
        <BrowserRouter>
          <Pages />
        </BrowserRouter>
      ) : (
        ip === "112.220.196.146" ?
          <Login2 />
        :
          <Login />

      )} */}
    </>
  );
});

export default App;
