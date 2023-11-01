/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Drawer } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';

import sessionChk from "@components/Common/Js/sessionChk";

import CpyrightsAdd from './copyrightsAdd';
import OwnersAdd from './ownersAdd';
import ContributorsAdd from './contributorsAdd';
import BrokersAdd from './brokersAdd';

const Wrapper = styled.div`
    width: 100%;
    `;

const addDrawer = observer(({type, visible, onClose, reset} ) => {
    const { commonStore } = useStore();
    const state = useLocalStore(() => ({
        type : '',
        idx: '',
        title : '',
        drawerback : 'drawerWrap',
    }));

    
    useEffect(() => {   
        sessionChk('authorAdd');    
        state.type = type;
        if(type === 'copyrights'){
            state.title = '저작권자 등록';
        }else if(type === 'contributors'){
            state.title = '기여자 등록';
        }else if(type === 'brokers'){
            state.title = '중개자 등록';
        }else if(type === 'owners'){
            state.title = '해외 수입 권리자 등록';
        }else{
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

    const classChk=(val)=>{
        if(val === 'Y'){
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
              
            {state.type === 'copyrights'
                ? <CpyrightsAdd type={state.type} onClose={addOnClose} reset={addReset} classChk={classChk}/>
                
                : state.type === 'contributors'
                    ? <ContributorsAdd type={state.type} onClose={addOnClose} reset={addReset} classChk={classChk}/>
                    : state.type === 'brokers'
                        ? <BrokersAdd type={state.type} onClose={addOnClose} reset={addReset} classChk={classChk}/>
                        : <OwnersAdd type={state.type} onClose={addOnClose} reset={addReset} classChk={classChk}/>
            }

            </Drawer>
        </Wrapper>
    );
});

export default addDrawer;