/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback } from 'react';
import { Form, Input, Button, Checkbox, Row, Col, Image, Typography } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, EllipsisOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import Cookies from 'js-cookie';


import useStore from '@stores/useStore';
import { GoogleLogin } from 'react-google-login'; //21.11.18 khl add

//21.11.15 khl add / validator: 문자열 검증 (isEmail: 이메일 검증 isLength: 문자열 길이 검증 isAlphanumeric: 숫자 혹은 알파벳으로 이뤄졌는지 검증)
import {isEmail, isLength, isAlphanumeric} from 'validator';

//구글 로그인 연동 ID
const clientId = "213375444905-n35e6c7oqhsegs11p8svvn33mks0mula.apps.googleusercontent.com";


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

  .btn_google_login{width:100%;margin-bottom:10px}

`;


export default observer(({ onSocial }) => {
    //useStore Hook 은 컴포넌트 내에서 store 를 사용 할 수 있게 해줍니다.
  const { commonStore } = useStore();

  //useCallback()은 함수를 메모이제이션(memoization : 재사용)하기 위해서 사용되는 hook 함수입니다.
  const onFinish = useCallback(async (values) => {
    commonStore.loading = true;
    
    if (values.session_id) {
      //Cookies.set('session_id', values.session_id);
    }

    if(values.user_id == ""){
        window.alert({ title: '아이디를 입력해주세요.' });
    } else if(values.password == ""){
        window.alert({ title: '비밀번호를 입력해주세요.' });
    }else{

        const result = await commonStore.handleApi({
        method: 'POST',
        url: `member2/login`,
        data: {
            GM_ID: values.user_id,
            GM_PASS: values.password,
        },
        });

        commonStore.loading = false;
        // console.log(result);
        if (result.error) {
            return window.alert({ title: result.error });
        } else {
            console.log(result);
            localStorage.setItem('user_id', result.user.user_id);
            commonStore.user = result.user;
        }
    }
  }, []); 

  const onSuccess = async(response) => {
    commonStore.loading = true;
    
     const result = await commonStore.handleApi({
      method: 'POST',
      url: 'member2/mem_select',
      data: {
        mem_userid: response.googleId,
        mem_email: response.profileObj.email
      },
    });

     commonStore.loading = false;
     
    if (result.error) { //구글 아이디가 DB에 없을 경우 insert
      
      const result_insert = await commonStore.handleApi({
        method: 'POST',
        url: 'member2/create',
        data: {
          GM_NAME: response.profileObj.name,
          GM_ID: response.googleId,
          GM_EMAIL: response.profileObj.email,
          GM_NICK_NAME: response.profileObj.name,    
          login_chk : 'Y',     
        },
      });

      if (result_insert.error) {
        return window.alert({ title: result_insert.error });
      } else {
        commonStore.user = result_insert.user;
        localStorage.setItem('user_id', result_insert.user.user_id);
        //Cookies.set('session_id', result_insert.session_id);
      }

    } else {      
      if(result.error != ""){
        commonStore.user = result.user;
        localStorage.setItem('user_id', result.user.user_id);
        //Cookies.set('session_id', result.session_id);
      }else{
        return window.alert({ title: result.message });
      }      
    }   
     
  }

  const onFailure = (error) => {
      console.log(error);
      return window.alert({ title: '구글 로그인시 오류가 발생되었습니다. 재시도해주세요.' });
  }

 
  return (
    <Wrapper>
      <Row className="row" gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>       
        <Col className="form-wrapper">
        {/*Form, Form.Item 등 : antd 에서 지원하는 레이아웃 
            initialValues : 각 필드의 초기 값을 설명하는 객체(Formik에서 감시 할 입력 필드의 이름 값과 일치해야합니다.)
        */}
          <Form
            layout="vertical"
            {...layout}
            name="login"
            initialValues={{
                user_id: '',
                password: '',
              }}
            onFinish={onFinish}

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
                onFailure={onFailure} className="btn_google_login">구글계정 연동 로그인</GoogleLogin>

            <div className={"dotline"}>
              <EllipsisOutlined style={{fontSize:"36px",color:"#999"}} block="true"/>
            </div>

            <Form.Item
              name="user_id"
              rules={[{ message: '아이디를 입력해 주세요!' }]}
            >
              <Input prefix={<UserOutlined className="site-form-item-icon" style={{ color: '#ccc' }} />} placeholder="아이디" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ message: '비밀번호를 입력해 주세요!' }]}
            >
              <Input prefix={<LockOutlined className="site-form-item-icon" style={{ color: '#ccc' }} />} type="password" placeholder="비밀번호" />
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
  );
});
