import React from 'react';
import {Link} from 'react-router-dom';

const PageNotFound = () => {
    return (
        <div className='wrap'>
            <h1>404 - Not Found</h1>
            <p>요청한 페이지를 찾을 수 없습니다.</p>
            <Link to={'/'}>시작 페이지로 이동</Link>
        </div>
    );
};

export default PageNotFound;
