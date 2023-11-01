import React from 'react';
import axios from 'axios';

export const LoginChk=()=> {
    var axios = require('axios');

    var config = {
        method: 'POST',
        url: process.env.REACT_APP_API_URL +'/api/v1/login-check',
        headers: {
            'Content-type': 'application/json',
        },
    };

    axios(config)
    .then(function (result) {
        // console.log(result.data)
        return(result.data.data);
    })
    .catch(function (error) {
        return(error);        
    });
}

  
export default LoginChk;