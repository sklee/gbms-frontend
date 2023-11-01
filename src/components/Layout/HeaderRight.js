/* eslint-disable react-hooks/exhaustive-deps*/
import React, {
    useEffect,
    useCallback,
    useState,
    useLayoutEffect,
    useContext,
} from 'react';
import { Link, useLocation, Redirect } from 'react-router-dom';
import { Space, Button, Menu, Dropdown, Modal } from 'antd';
import { HomeOutlined, UserOutlined } from '@ant-design/icons';
import { inject, observer, useLocalStore } from 'mobx-react';
import { toJS } from 'mobx';
import styled from 'styled-components';
import { loadJWT, clearState } from '../../common-utils/LocalStorage';
import Cookies from 'js-cookie';
import axios from 'axios'; //21.11.15 khl add
import useStore from '@stores/useStore';
// import { application } from 'express';

const Wrapper = styled.div`
    width: 100%;
    text-align: right;
`;

const SiteMenus = (
    <Menu className='page'>
        <Menu.Item key="site_link_0">
            <a href="https://www.gilbut.co.kr/" target="_blank">
                길벗·이지톡
            </a>
        </Menu.Item>
        <Menu.Item key="site_link_1">
            <a href="https://school.gilbut.co.kr/" target="_blank">
                길벗스쿨
            </a>
        </Menu.Item>
        <Menu.Item key="site_link_2">
            <a href="https://sinagong.gilbut.co.kr/it/" target="_blank">
                시나공 IT
            </a>
        </Menu.Item>
    </Menu>
);

const HeaderLeft = (props) => {
    const { commonStore } = useStore();
    const router = useLocation();
    const state = useLocalStore(() => ({
        siteVisible: true,
        configVisible: false,
        name: '',
    }));

    const handleChangeVisible = useCallback(
        (type) => (visible) => {
            state[type] = visible;
        },
        [],
    );

    // const nameChk = async () => {
    //   await axios.post(process.env.PUBLIC_URL+'/member/session')
    //   .then(function(response) {
    //     state.name = response.data
    //   }).catch(function(error) {
    //     console.log(error);
    //   })
    // }

    const name = window.localStorage.getItem('name');
    useEffect(() => {}, [router]);

    // 로그아웃 처리
    // const [isAuthenticated, setIsAuthenticated] = useState(!!loadJWT());
    // const onLogout = () => {
    //   clearState();
    //   setIsAuthenticated(false);
    //   Cookies.remove('jwt');
    //   sessionFinish(); //khl add
    //   window.location.reload();
    //   //return <Redirect to="/" />
    // };

    const sessionFinish = useCallback(async (values) => {
        const session_del = await axios.get('member2/session_del');
    });

    const ConfigMenus = () => {
        return (
            <Menu className="setting">
                <Menu.Item key="config_0">
                    <Button type="text">설정변경</Button>
                </Menu.Item>
                <Menu.Item key="config_1">
                    <Button type="text" onClick={props.commonStore.logout}>
                        로그아웃
                    </Button>
                </Menu.Item>
            </Menu>
        );
    };

    return (
        <Wrapper>
            <Space className="iconMenu">
                <Dropdown
                    overlay={SiteMenus}
                    trigger={['click']}
                >
                    <a
                        className="ant-dropdown-link"
                        onClick={(e) => e.preventDefault()}
                    >
                        <HomeOutlined />
                    </a>
                </Dropdown>
                <Dropdown
                    overlay={ConfigMenus}
                    trigger={['click']}
                >
                    <a
                        className="ant-dropdown-link"
                        onClick={(e) => e.preventDefault()}
                    >
                        {/* 허두영{' '} {name}*/}
                        <UserOutlined />
                    </a>
                </Dropdown>
            </Space>
        </Wrapper>
    );
};

export default inject('commonStore')(observer(HeaderLeft))
