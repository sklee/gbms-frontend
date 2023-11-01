import React, {useEffect, useState} from 'react';
import {DropdownItem, DropdownMenu, DropdownToggle, NavLink, Table, UncontrolledButtonDropdown,} from 'reactstrap';
import {formatCurrency, formatDate} from '../../../common-utils/Formatter';
import {makeRequest} from '../../../common-utils/Api';
import {loadJWT, saveClients, clearState} from '../../../common-utils/LocalStorage';
import SuccessAlert from '../../../components/alert/Success';
import LoadingAlert from '../../../components/alert/Loading';
import {Link, Redirect} from 'react-router-dom';

const ClientsTable = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [clients, setClients] = useState([]);
    const [responseMessage, setResponseMessage] = useState('');
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(!!loadJWT());

    const onTimeout = () => {
        setShowSuccessAlert(false);
    };

    const updateClients = (clients) => {
        setClients(clients);
        saveClients(clients);
    };

    const onLogout = () => {
        clearState();
        setIsAuthenticated(false);
    };

    const deleteClient = (clientId) => {
        makeRequest({
            url: `client/${clientId}`,
            successCallback: (data) => {
                setResponseMessage(data.message);
                updateClients(clients.filter(({id}) => id !== clientId));
                setShowSuccessAlert(true);
            },
            failureCallback: (error) => {
                console.log(error);
            },
            requestType: 'DELETE',
            authorization: loadJWT(),
        });
    };

    useEffect(() => {
        const token = loadJWT();
        // console.log('[token]', token);
        makeRequest({
            url: 'client',
            successCallback: (data) => {
                const {message, clients} = data;
                updateClients(clients);
                setIsLoading(false);
                setShowSuccessAlert(true);
                setResponseMessage(message);
            },
            failureCallback: (error) => {
                console.log('[error]', error);
                onLogout();
                window.location.reload();
            },
            requestType: 'GET',
            authorization: loadJWT(),
        });
    }, []);

    return isLoading ? (
        <LoadingAlert/>
    ) : (
        <>
            {showSuccessAlert && (
                <SuccessAlert {...{message: responseMessage, onTimeout}} />
            )}
            <div style={{textAlign: 'center', margin: '20px'}}>
                <h1> 거래처 목록</h1>
            </div>
            <Table responsive hover>
                <thead>
                <tr>
                    <th>#</th>
                    <th>이름</th>
                    <th>이메일 주소</th>
                    <th>계약 시작일자</th>
                    <th>계약 금액</th>
                    <th>작업</th>
                </tr>
                </thead>
                <tbody>
                {clients.map((client, index) => (
                    <tr key={client.id}>
                        <th scope='row'>{index + 1}</th>
                        <td>{client.name}</td>
                        <td>{client.email}</td>
                        <td>{formatDate(client.created_at)}</td>
                        <td>{formatCurrency(client.retainer_fee)}</td>
                        <td>
                            <UncontrolledButtonDropdown>
                                <DropdownToggle caret>Actions</DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem>
                                        <NavLink
                                            tag={Link}
                                            to={`/client/view/${client.id}`}>
                                            View Client
                                        </NavLink>
                                    </DropdownItem>
                                    <DropdownItem divider/>
                                    <DropdownItem>
                                        <NavLink
                                            tag={Link}
                                            to={`/client/edit/${client.id}`}>
                                            Edit Client
                                        </NavLink>
                                    </DropdownItem>
                                    <DropdownItem divider/>
                                    <DropdownItem
                                        onClick={() => {
                                            deleteClient(client.id);
                                        }}
                                    >
                                        Delete Client
                                    </DropdownItem>
                                </DropdownMenu>
                            </UncontrolledButtonDropdown>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
            <Link to='/client/add'>
                <button>거래처 추가</button>
            </Link>
            
        </>
    );
};

export default ClientsTable;
