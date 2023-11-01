import React, {useState} from 'react';
import { Row, Col, Drawer, Button } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';

import PrdInfo from './prdInfo';  // 상품/발주 정보
import IncomingInfo from './incomingInfo'; // 입고 정보
import AccInfo from './accInfo'; // 사고 정보
import Receiving from './receivingProcessing' // 입고 처리

const index = observer(({viewVisible, onClose, drawerChk}) =>{
    const state = useLocalStore(() => ({
        drawerback : 'drawerWrap', //drawer class name
    }));

    const visibleClose = () => {
        onClose();
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
        <Drawer 
            title='입고/처리'
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
            <PrdInfo drawerChk={drawerChk} drawerClass={drawerClass}/>
            <IncomingInfo />
            <AccInfo />
            <Receiving />

            <Row gutter={[10, 10]} justify="center">
                    <Col>
                        <Button type="primary">확인</Button>
                    </Col>
                    <Col>
                        <Button htmlType="button">취소</Button>
                    </Col>
                </Row>
        </Drawer>
    )
})

export default index;