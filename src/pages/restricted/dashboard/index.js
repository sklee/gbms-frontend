import React from 'react';
import DashboardMenu from './Menu';
import {BrowserRouter as Router} from 'react-router-dom';
import Routes from '../../../components/routing/Routes';

const Dashboard = ({logout}) => {

    return (
        <Router>
            <>
                <DashboardMenu logout={logout}/>
                <Routes/>
            </>
        </Router>
    )
};

export default Dashboard;
