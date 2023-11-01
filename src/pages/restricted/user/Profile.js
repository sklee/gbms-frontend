// 튜토리얼 - 로컬스토리지 저장된 프로필 조회. 미사용.
import React from 'react'; 
import { loadUser } from '../../../common-utils/LocalStorage'; 
import { Card, CardBody, CardImg, CardText, CardTitle } from 'reactstrap'; 
import { formatDate } from '../../../common-utils/Formatter';

const UserProfile = () => { 
    const { user } = loadUser(); 
    console.log('[profile] user:', user);

    return (
        <div>
        {user.name} 
        {user.email} 
        Account created on {formatDate(user.created_at)}
        </div>
    ); 
}; 

export default UserProfile;