/* eslint-disable react-hooks/exhaustive-deps*/
import React from 'react';
import { Form, Input, Button, Checkbox, Row, Col, Image, Typography,Modal } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, EllipsisOutlined } from '@ant-design/icons';
import { useLocalStore, inject, observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import Cookies from 'js-cookie';
import axios from 'axios';
import { GoogleLogin } from 'react-google-login';

//구글 로그인 연동 ID
const clientId = "229873503608-i1609kqlrp60durr6slf0nfpi890r7i6.apps.googleusercontent.com";

const layout = {
  // labelCol: { span: 8 },
  // wrapperCol: { span: 16 },
};

const { Title } = Typography;

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  .row {height: 100vh;}
  .form-wrapper {display: flex;justify-content: center;align-items: center;background-image: url('/images/bg.jpg');background-repeat: no-repeat;width: 100%;height: 100%;background-size: cover;background-position: center;}
  #login{width:400px;padding: 50px;background-color:rgba(255,255,255,.5);border-radius:20px;}
  .logo,
  .dotline{text-align:center}
  .anticon svg{vertical-align:top;}
  .ant-input-affix-wrapper,
  .ant-btn,
  .ant-input{border-radius:2px;}
  .ant-form-item{margin-bottom:15px;}
  .ant-form-item:last-child{margin-bottom:0;}

  .btn_google_login{width:100%;margin-bottom:10px;border:1px solid #ddd !important;box-shadow:none !important}

`;

const Login = ({commonStore}) => {
  const history = useHistory()
  const state = useLocalStore(() => ({    
    email : '',
    password : '',    
  }))
  
  const onFinish = async (values) => {
    // commonStore.loading = true;

    let chkVal = true;

    if(values.email == ""){
      Modal.error({
          content: '아이디를 입력해주세요.',        
      });
      chkVal = false;
      return;
    }
    else{
      var emailChk = isEmail(values.email);
      if(emailChk == false){
        Modal.error({
            content: '이메일 형식이 아닙니다. 재입력해주세요.',        
        });
        chkVal = false;
        return;
      }
    }    

    if(values.password == ""){
      Modal.error({
          content: '비밀번호를 입력해주세요.',
      })
      chkVal = false;
      return;
    }
    
    if(chkVal == true) {
      return new Promise((resolve) => {
        commonStore.handleApi({
          method : 'POST', 
          url : '/login',
          data : {
            email     : values.email,
            password  : values.password,
          }
        })
        .then((result) => {
          if (result.data == "Success") {
            commonStore.refreshCookie()
            commonStore.handleApi({
              method : 'POST', 
              url : '/login-check',
            })
            .then((result) => {
              // 사용자 정보 중 중요 정보 및 필요없는 값 커팅
              let garbageKey = ['id', 'start_time', 'end_time', 'created_id', 'updated_id', 'changed_at', 'created_at', 'updated_at']
              garbageKey.forEach(element => delete result[element])
              commonStore.user = result
              // commonStore.loading = false;

              resolve(true)
            })
          }
          else if (result?.data === 'Failed') {
            Modal.error({
              content: '로그인 정보가 일치하지 않습니다. 재시도해주세요.',
            })
            resolve(false)
          }
          else {
            resolve(false)
          }
        })
        .catch(() => { resolve (false) })
      })
    }
  }

  const isEmail = (email) => {
    const emailRegex =
      /^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;

    return emailRegex.test(email);
  }

  // ID/PW input Callback
  const handleChangeInput = (type) => (e) => {
    state[type] = e.target.value;
  }

  // Google 로그인 성공
  const onSuccess = async(response) => {
    axios.post(process.env.REACT_APP_API_URL +'/api/v1/login/google', {
      'id_token' : response.tokenId,
      headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json',
      },
    })
    .then(function (response) {
      if(response.data.data == "Success"){
        //쿠키로 로그인체크하기(y)
        // Cookies.set('logincheck', 'Y');
        commonStore.refreshCookie()
        commonStore.handleApi({
          method : 'POST', 
          url : '/login-check',
        })
        .then((result) => {
          console.log('setting USER')
          commonStore.user = result
        })
        .then((result) => {
          if (Cookies.get('viewTabKey') !== undefined) {
            history.push(Cookies.get('viewTabKey'))
          }
          else {
            history.push('/')
          }
        })
      }
      else{
        Modal.error({
          content: '로그인 정보가 일치하지 않습니다. 재시도해주세요.', 
        })
      }
    })
    .catch(function (error) {
      Modal.error({
        content: '회원가입이 필요합니다.',        
      })
    })
  }

  // Google 로그인 실패
  const onFailure = (error) => {
    if (error.error !== 'popup_closed_by_user') {
      Modal.error({
        content: '오류가 발생했습니다. 재시도해주세요. 에러코드 : '+error.error,
      })
    }
  }

  return (
    <Wrapper>
      <Row className="row" gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
        <Col className="form-wrapper">
          <Form
            layout="vertical"
            {...layout}
            name="login"
            onFinish={(value) => {
              onFinish(value)
              .then((result) => {
                if (result) {
                  if (Cookies.get('viewTabKey') !== undefined) {
                    history.push(Cookies.get('viewTabKey'))
                  }
                  else {
                    history.push('/')
                  }
                }
              })
            }}
          >
            <div className={"logo"}>
              <Image
                width={80}
                src="/images/logo.png"
              />
              <Title level={4} style={{ margin: '10px auto 30px' }}>길벗 업무시스템</Title>
            </div>         
          
            <GoogleLogin
              clientId={clientId}
              responseType={"id_token"}
              onSuccess={onSuccess}
              onFailure={onFailure} 
              className="btn_google_login"
            >
              회사 Google 계정으로 로그인
            </GoogleLogin>

            <div className={"dotline"}>
              <EllipsisOutlined style={{fontSize:"36px",color:"#999"}} block="true"/>
            </div>

            <Form.Item
              name="email"
              rules={[{ message: '아이디를 입력해 주세요!' }]}
            >
              <Input 
                prefix={
                  <UserOutlined 
                    className="site-form-item-icon" 
                    style={{ color: '#ccc' }} 
                  />} 
                placeholder="아이디" 
                onChange={handleChangeInput('email')}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ message: '비밀번호를 입력해 주세요!' }]}
            >
              <Input 
                prefix={
                  <LockOutlined 
                    className="site-form-item-icon" 
                    style={{ color: '#ccc' }} 
                  />
                } 
                type="password" 
                placeholder="비밀번호" 
                onChange={handleChangeInput('password')}
              />
            </Form.Item>

            <Form.Item >
              <Button type="primary" htmlType="submit" block size="middle">
                로그인
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>

    </Wrapper>
  )
}

export default inject('commonStore')(observer(Login))
