import React from 'react';
import BaseClientForm from './BaseClientForm';
import { useParams } from 'react-router-dom';
import { findClient } from '../../../../common-utils/LocalStorage';

const EditClientForm = () => {
    const { id } = useParams();

    return <BaseClientForm client={findClient(id)} />;
};

export default EditClientForm;
