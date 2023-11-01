import React, { useState } from 'react';
import { Drawer, Row, Button, Space, Modal, Table, Typography } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { inject, observer, useLocalStore }  from 'mobx-react';

import PreviewPdf   from '@pages/ProduceMgmt/orderPaper/paperbookTab/view/orderSend'  // 제작 발주서(pdf파일) 미리보기
import OrderSend    from '@pages/ProduceMgmt/orderPaper/paperbookTab/view/orderSend' // 제작 발주서 발송
import PreviewOrder from '@pages/ProduceMgmt/orderPaper/paperbookTab/view/previewOrder'  // 제작 발주서

const Order = ({ viewVisible, visibleClose, drawerChk }) => {
    const [ infoModal, setInfoModal ]           = React.useState(false);
    const [ prevOrdDrawer, setPrevOrdDrawer ]   = React.useState(false);
    const [ prevPdfDrwer, setPrevPdfDrawer ]    = React.useState(false);
    const [ sendDrawer, setSendDrawer ]         = React.useState(false);

    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                order_at: '2023.05.02. 15:32',
                orderingBody: '홍길동',
                purchaseOrder: '',
                result: '확인 중',
                ref: '',
            }
        ],
        drawerback : 'drawerWrap', //drawer class name
    }))

    const drawerClass=(data)=>{
        if(data === 'drawerback'){
            state.drawerback = 'drawerback drawerWrap';
        }else{
            state.drawerback = 'drawerWrap';
        }          
    }

    const drawerOpen = (type) =>{
        if(type == 'prev'){
            if(drawerChk === 'Y'){
                drawerClass('drawerback');
            }
            setPrevPdfDrawer(true);
        } else if(type == 'order'){
            setPrevOrdDrawer(true);
            setInfoModal(false)
        } else if(type == 'send'){
            if(drawerChk === 'Y'){
                drawerClass('drawerback');
            }
            setSendDrawer(true);
        }
    }

    const drawerClose = (type) =>{
        if(type == 'prev'){
            if(drawerChk === 'Y'){
                drawerClass();
            }
            setPrevPdfDrawer(false);
        } else if(type == 'order'){
            setPrevOrdDrawer(false);
        } else if(type == 'send'){
            if(drawerChk === 'Y'){
                drawerClass();
            }
            setSendDrawer(false);
        }
    }

    const columns = [{
        dataIndex : "order_at" ,
        title : "발주(발송)일시" ,
        width : 200,
    }, {
        dataIndex : "orderingBody",
        title : "발주자",
        width : 120, 
    }, {
        dataIndex : "purchaseOrder",
        title : "제작 발주서",
        width : 120,
        align : "center", 
        render: () => <Typography.Link onClick={() => { drawerOpen('prev') }}>보기</Typography.Link>
    }, {
        dataIndex : "result",
        title : "발송 결과(성공/대상)",
        width : 150, 
        align : "center", 
    }, {
        dataIndex : "ref",
        title : "참고 사항",
    }]

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
        <>
            <Drawer 
                title='제작 발주'
                placement='right'
                onClose={() => visibleClose('order')}
                visible={viewVisible}
                className={state.drawerback}
                closable={false}
                keyboard={false}
                extra={
                    <>
                        <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={() => visibleClose('order')}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >
                <Row id="gridWrap" className="gridWrap">
                    

                    <Table
                        bordered
                        rowKey = {'id'}
                        size = {'small'}
                        style = {{padding: 0}}
                        sticky = {{ offsetHeader : -20 }}
                        dataSource = {state.list}
                        columns = {columns}
                    />


                </Row>

                <Row gutter={10} justify="center" style={{margin: '20px 0'}}>
                    <Button type="primary" htmlType="button" onClick={()=>setInfoModal(true)}>제작 발주서 미리보기</Button>
                </Row>


                <Row gutter={10} justify="center" style={{margin: '20px 0'}}>
                    <Button type="primary" htmlType="button" onClick={() => drawerOpen('send')}>제작 발주 (발송)</Button>
                </Row>

                <Modal
                    visible={infoModal}
                    onOk={() => {drawerOpen('order')}}
                    onCancel={()=>{setInfoModal(false)}}
                    okText="확인"
                    cancelText="취소"
                    >
                    <p>제작 발주 수정사항을 저장하고 진행할 수 있습니다. 계속하시겠습니까?</p>
                </Modal> 


                

                {prevOrdDrawer ? <PreviewOrder /> : ''}
                {/* <PreviewPdf viewVisible={prevPdfDrwer}  visibleClose={() => drawerClose('prev')} /> */}
                <OrderSend  viewVisible={sendDrawer}    visibleClose={() => drawerClose('send')} drawerChk={drawerChk} drawerClass={drawerClass}/>

            </Drawer>

            <Drawer 
                    title='제작 발주'
                    placement='right'
                    onClose={() => drawerClose('prev')}
                    visible={prevPdfDrwer}
                    // className={state.drawerback}
                    className={drawerExtended ? 'drawerWrap drawerback' : 'drawerWrap'}
                    closable={false}
                    keyboard={false}
                    extra={
                        <>
                            <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                                {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                            </Button>
                            <Button onClick={() => drawerClose('prev')}>
                                <CloseOutlined />
                            </Button>
                        </>
                    }
                >
                    TEST
            </Drawer>
        </>
    )
}

export default inject('commonStore')(observer(Order))
