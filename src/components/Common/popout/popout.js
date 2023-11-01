import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import ReactDOM from "react-dom";
import { copyStyles } from "./copy_styles";
// import CommonView from '../../../pages/Author/view';

// const Popout = observer(({children, closeWindowPortal, idx, type}) => {
const Popout = observer(({children, closeWindowPortal, idx, scaleSet}) => {

    const scaleWidth = scaleSet?.width?scaleSet.width:600
    const scaleHeight = scaleSet?.height?scaleSet.height:750
    const scaleLeft = scaleSet?.left?scaleSet.left:200
    const scaleTop = scaleSet?.top?scaleSet.top:150
    const externalWindow = useRef(
        window.open("", "", `width=${scaleWidth},height=${scaleHeight},left=${scaleLeft},top=${scaleTop}`)
    )
    // const externalWindow = useRef(
    //     window.open("", "", "width=600,height=750,left=200,top=150")
    // );

    const containerEl = document.createElement("div");
    containerEl.id = 'popup';

    useEffect(() => {
        const currentWindow = externalWindow.current;
        return () => currentWindow.close();
    }, []);

    externalWindow.current.document.title = "보기/수정";
    externalWindow.current.document.body.appendChild(containerEl);
    externalWindow.current.document.body.style.overflowY = 'auto';
    copyStyles(document, externalWindow.current.document);

    externalWindow.current.addEventListener("beforeunload", () => {
        closeWindowPortal();
    });
    
    return ReactDOM.createPortal(children, containerEl);
});

export default Popout;
