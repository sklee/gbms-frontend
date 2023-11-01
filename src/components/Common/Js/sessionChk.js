import React from 'react';
import { Modal } from 'antd';
import axios from 'axios';

export default function sessionChk(type) {
    var config = {
        method: 'POST',
        url: process.env.REACT_APP_API_URL +'/api/v1/login-check',
        headers: {
            'Content-type': 'application/json',
        },
    };

    axios(config)
        .then(function (result) {
            console.log(type);
            if (result.data.message == 'Unauthenticated.') {
                if (type.pathname === '/Login') {
                } else {
                    // Modal.error({
                    //     title: (
                    //         <div>
                    //             세션이 만료되었습니다.
                    //             <br />
                    //             재로그인을 해주세요.
                    //         </div>
                    //     ),
                    //     onOk() {
                    //         axios.post(
                    //             process.env.PUBLIC_URL +
                    //                 '/member/session_logout',
                    //         );
                    //         window.location.href =
                    //             process.env.PUBLIC_URL + '/Login';
                    //         window.localStorage.clear();
                    //     },
                    // });
                    axios.post(
                        process.env.PUBLIC_URL +
                            '/member/session_logout',
                    );
                    window.location.href =
                        process.env.PUBLIC_URL + '/Login';
                    window.localStorage.clear();
                }
            } else {
                if (type.pathname === '/Login') {
                    // Modal.warning({
                    //     title: <div>이미 로그인이 되어있습니다.</div>,
                    //     onOk() {
                    //         window.location.href = '/';
                    //     },
                    // });
                    window.location.href = '/';
                } else {
                    //window.location.href='/';
                    window.localStorage.setItem('name', result.data.name);
                    axios.post(process.env.PUBLIC_URL + '/member/session_chk', {
                        data: result.data,
                    });
                }
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}
