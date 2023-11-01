/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {  Space, Button, Drawer} from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';

import ContractsAdd from './contractsAdd';
import OverseasAdd from './overseasAdd';

const Wrapper = styled.div`
    width: 100%;
    `;

const addDrawer = observer(({type, visible, onClose, reset, drawerChk} ) => {
    const { commonStore } = useStore();
    const state = useLocalStore(() => ({
        type : '',
        idx: '',
        title : '',
        drawerback : 'drawerWrap',
    }));

    useEffect(() => {   
        state.type = type;
        if(type === 'contracts'){
            state.title = '저작권 계약 등록';
        }else if(type === 'overseas'){
            state.title = '저작권 계약 등록';
        }
    }, [type]);

    const addOnClose = ()=>{
        onClose(false);
    }

    const addReset = (val)=>{
        if(val === true){
            reset();
        }       
    }

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

    return (
        <Wrapper>
            <Drawer
                title={state.title}
                placement='right'
                onClose={addOnClose}
                closable={false}
                visible={visible}
                className={state.drawerback}
                keyboard={false}
                extra={
                    <>
                        <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={addOnClose}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
                
            >
            {state.type === 'contracts' ?
                <ContractsAdd type={state.type} onClose={addOnClose} reset={addReset} drawerClass={drawerClass} drawerChk={drawerChk}/>
                : (state.type === 'overseas' ?
                    <OverseasAdd type={state.type} onClose={addOnClose} reset={addReset} drawerClass={drawerClass} drawerChk={drawerChk}/>
                    :<></>
                )
            }
            </Drawer>
        </Wrapper>
    );
});

export default addDrawer;