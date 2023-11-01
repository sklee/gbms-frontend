/* eslint-disable react-hooks/exhaustive-deps*/
import React from 'react';
import { Modal } from 'antd';

const globalModal = () => {
  window.alert = (props) => Modal.error({ ...props, zIndex: 9999 });
  window.ask = (props) => Modal.confirm({ ...props, zIndex: 9999 });
  window.info = (props) => Modal.info({ ...props, zIndex: 9999 });
  window.success = (props) => Modal.success({ ...props, zIndex: 9999 });
  window.warning = (props) => Modal.warning({ ...props, zIndex: 9999 });
};

export default globalModal;
