/* eslint-disable react-hooks/exhaustive-deps*/
import React from 'react';
import styled from 'styled-components';
import { LoadingOutlined } from '@ant-design/icons';

const LoadingBg = styled.div`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgb(0, 0, 0, .5) !important;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    font-size: 35px;
    color: #fff;
    text-align: center;
    p{margin-top: 10px; font-size: 20px;}
    
`;

const Loading = () => {

    return(
        <LoadingBg>
            {/* <img 
                className='loadingBar'
                src="/images/preload.svg"
            /> */}
            <div>
                <LoadingOutlined />
                <p>Loading</p>
            </div>
            
        </LoadingBg>
        
    );
}


export default Loading;
