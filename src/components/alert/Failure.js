import React from 'react';
import {UncontrolledAlert} from 'reactstrap';

const FailureAlert = ({errors}) => {
    return (
        <UncontrolledAlert color='danger'>
            <h4 className='alert-heading'>요청 실패</h4>
            <hr/>
            <ul className='plainList'>
                {Object.values(errors).map((error, index) => {
                    return <li key={index}>{error}</li>
                })}
            </ul>
        </UncontrolledAlert>
    )
}

export default FailureAlert;
