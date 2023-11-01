import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Drawer, Button } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import moment from 'moment';

import useStore from '@stores/useStore';

import BillingInfo from './billingInfo';

const Wrapper = styled.div`
    width: 100%;
`;

const BillingView = observer(({idx,  popoutClose, popoutChk ,viewVisible, drawerChk, onClose, viewData, drawerResetChk, pageChk}) =>{
    const state = useLocalStore(() => ({
        drawerback : 'drawerWrap', //drawer class name

    }));


    const visibleClose = (val) => {
        onClose(val);
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

    //팝업 close
    const popoutCloseVal = (val) => {
        if(val == "Y"){
            popoutClose();
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
                <>
                    <Drawer 
                        title='보기/수정'
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
                        <BillingInfo 
                            idx={idx}
                            // viewVisible={viewVisible}
                            popoutCloseVal={visibleClose}
                            popoutChk={popoutChk}
                            drawerChk={drawerChk}
                            onClose={visibleClose}
                            viewData={viewData} 
                            drawerClass={drawerClass}
                            drawerResetChk={drawerResetClose}
                            pageChk={pageChk}
                            />
                    </Drawer>
                </>
            :
            <>
                <BillingInfo 
                    idx={idx}
                    popoutCloseVal={popoutCloseVal}
                    viewVisible={viewVisible}
                    popoutChk={popoutChk}
                    // drawerChk={drawerChk}
                    // onClose={viewOnClose}
                    viewData={viewData} />
            </>

            }
          
        </Wrapper>
    );
})

export default BillingView;