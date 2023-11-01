import React, { useState } from 'react'
import { Drawer, Row, Button } from 'antd'
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';

import styled from 'styled-components';

const Wrapper = styled.div`
    width: 100%;
`;

const previewPdf = observer(({ viewVisible, visibleClose }) => {

    const state = useLocalStore(() => ({
        drawerback : 'drawerWrap', //drawer class name
    }));

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
                title='미리 보기'
                placement='right'
                onClose={()=>{visibleClose('prev')}}
                visible={viewVisible}
                className={state.drawerback}
                closable={false}
                keyboard={false}
                extra={
                    <>
                        <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={()=>{visibleClose('prev')}}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >
                <Row>
                    <embed src="https://drive.google.com/viewerng/viewer?embedded=true&url=abc.pdf" width="100%" height="600" />
                </Row>

                <Row gutter={[10, 10]} justify="center" style={{border: 0, marginTop: 20}}>
                    <Button type="primary" htmlType="button">다운로드</Button>
                </Row>
            </Drawer>
        </Wrapper>
    )
})

export default previewPdf;
