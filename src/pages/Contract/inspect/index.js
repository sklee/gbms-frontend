/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Drawer} from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';

import ContractsCheck from './contractsCheck';
import OverseasCheck from './overseasCheck';

const Wrapper = styled.div`
    width: 100%;
    `;

const addDrawer = observer(({idx, type, visible, onClose, reset} ) => {
    const { commonStore } = useStore();
    const state = useLocalStore(() => ({
        type : '',
        idx: '',
        title : '',
        drawerback : 'drawerWrap',
    }));

    
    useEffect(() => {    
        state.idx = idx;
        state.type = type;
        if(type === 'contracts-check'){
            state.title = '저작권 계약 검수';
        }else if(type === 'overseas-check'){
            state.title = '해외수입 계약 검수';
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
            {visible === true ? (
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
                
                {state.type === 'contracts-check' ?
                    <ContractsCheck idx={state.idx} type={state.type} onClose={addOnClose} reset={addReset} drawerClass={drawerClass} drawerChk="Y"/>
                    : (state.type === 'overseas-check' ?
                        <OverseasCheck idx={state.idx} type={state.type} onClose={addOnClose} reset={addReset} drawerClass={drawerClass} drawerChk="Y"/>
                        :<></>
                    )
                }
                </Drawer>    
            ) : (
                <>
                    {state.type === 'contracts-check' ?
                        <ContractsCheck idx={state.idx} type={state.type} onClose={addOnClose} reset={addReset} drawerClass={drawerClass} drawerChk="Y"/>
                        : (state.type === 'overseas-check' ?
                            <OverseasCheck idx={state.idx} type={state.type} onClose={addOnClose} reset={addReset} drawerClass={drawerClass} drawerChk="Y"/>
                            :<></>
                        )
                    }
                </>
            )}
        
        </Wrapper>
    );
});

export default addDrawer;