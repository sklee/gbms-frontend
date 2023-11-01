import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Drawer, Button, Space } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import moment from 'moment';

import useStore from '@stores/useStore';

import ApprovalsInfo from './approvalsInfo';

const Wrapper = styled.div`
    width: 100%;
`;

const ApprovalsView = observer(({idx,  popoutChk ,viewVisible, drawerChk, onClose, viewData, drawerResetChk, typeChk, typeChkType}) =>{
    const state = useLocalStore(() => ({
        drawerback : 'drawerWrap', //drawer class name
        title : ''
    }));

    useEffect(() => {
        if(typeChk === 'payments' || typeChk === 'evidences'){
            state.title = '청구서 보기/수정, 청구 취소'
        }else if(typeChk === 'billingPay'){
            state.title = '청구서 보기'
        }else{
            state.title = '열람/결재'
        }
    }, [typeChk]);

    const visibleClose = () => {
        onClose(false);
    };

    const drawerResetClose = (val) => {
        drawerResetChk(val);
    };

    const drawerClass=(data)=>{
        if(data === 'drawerback'){
            state.drawerback = 'drawerback drawerWrap';
        }else{
            state.drawerback = 'drawerWrap';
        }          
    }

    const [ drawerExtended, setDrawerExtended ] = useState(false);
    const drawerSizeHandler = () => {
        if(drawerExtended){
            setDrawerExtended(false);
            state.drawerback = 'drawerWrap';
            
        } else {
            setDrawerExtended(true);
            state.drawerback = 'drawerback drawerWrap';
        }
    }

    return(
        <Wrapper>
            {drawerChk === 'Y' ?
                <><Drawer 
                    title={state.title}
                    placement='right'
                    onClose={visibleClose}
                    visible={viewVisible}
                    className={state.drawerback}
                    closable={false}
                    keyboard={false}
                    extra={
                        <>
                            <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                                {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                            </Button>
                            <Button onClick={visibleClose}>
                                <CloseOutlined />
                            </Button>
                        </>
                    }
                > 
                    <ApprovalsInfo 
                        idx={idx}
                        viewVisible={viewVisible}
                        popoutChk={popoutChk}
                        drawerChk={drawerChk}
                        viewData={viewData} 
                        drawerClass={drawerClass}
                        drawerResetChk={drawerResetClose}
                        typeChk={typeChk}
                        typeChkType={typeChkType}
                        />

                </Drawer>
                </>
            :
            <>
                <ApprovalsInfo 
                    idx={idx}
                    viewVisible={viewVisible}
                    popoutChk={popoutChk}
                    viewData={viewData} 
                    typeChk={typeChk}
                    typeChkType={typeChkType}
                    />
            </>

            }
          
        </Wrapper>
    );
})

export default ApprovalsView;