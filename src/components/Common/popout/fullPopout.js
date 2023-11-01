import React, {  useEffect,  useRef,useState } from 'react';
import {  Space, Button, Row, Col,  Modal, Input, message, Radio,  Popover, Select, Typography} from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import ReactDOM from "react-dom";
import { copyStyles } from "./copy_styles";
// import CommonView from '../../../pages/Author/view';

const Wrapper = styled.div`
    width: 100%;
`;
// const Popout = observer(({children, closeWindowPortal, idx, type}) => {
const Popout = observer(({children, closeWindowPortal}) => {

    const externalWindow = useRef(
        window.open("", "", "width=1200,height=750,left=200,top=150")
    );
    
    // const containerEl = document.getElementById('popup');
    const containerEl = document.createElement("div");
    // containerEl.className = 'popup';
    containerEl.id = 'popup';
    
    useEffect(() => {
        const currentWindow = externalWindow.current;
        return () => currentWindow.close();
    }, []);
    console.log(externalWindow.current);
    externalWindow.current.document.title = "추가/보기/수정";
    externalWindow.current.document.body.appendChild(containerEl);
    copyStyles(document, externalWindow.current.document);

    externalWindow.current.addEventListener("beforeunload", () => {
        closeWindowPortal();
    });
    
    return ReactDOM.createPortal(children, containerEl);


    
});

export default Popout;
