import React from 'react'
import { Drawer, Row, Button, Space, Modal, Table } from 'antd'
import { inject, observer } from 'mobx-react';
import PreviewPdf from './previewPdf';  // 제작 발주서(pdf파일) 미리보기
import PreviewOrder from './previewOrder';  // 제작 발주서
import OrderSend from './orderSend';  // 제작 발주서 발송
import { ArrowsAltOutlined, CloseOutlined, ShrinkOutlined } from '@ant-design/icons';

const Order = ({ commonStore, viewVisible, visibleClose, drawerChk, rowData }) => {
    const [ listData, setListData ] = React.useState([])
    const [ infoModal, setInfoModal ] = React.useState(false);
    const [ prevOrdDrawer, setPrevOrdDrawer ] = React.useState(false);
    const [ prevPdfDrwer, setPrevPdfDrawer ] = React.useState(false);
    const [ sendDrawer, setSendDrawer ] = React.useState(false);
    const [ drawerExtended, setDrawerExtended   ] = React.useState(false)

    const columns = [{
        dataIndex : `created_at`, 
        title : `발주(발송)일시`, 
        width : 120
    }, {
        dataIndex : `created_id`, 
        title : `발주자`, 
        width : 120
    }, {
        dataIndex : `file_name`, 
        title : `제작 발주서`, 
        width : 120, 
        align : `center`
    }, {
        dataIndex : `mail_results`, 
        title : `발송 결과(성공/대상)`, 
        width : 150
    }, {
        dataIndex : `memo`, 
        title : `참고 사항`, 
        width : 200
    }]

    const drawerOpen = (type) =>{
        if(type == 'prev'){
            if(drawerChk === 'Y'){
                // drawerClass('drawerback');
            }
            setPrevPdfDrawer(true);
        } else if(type == 'order'){
            setPrevOrdDrawer(true);
            setInfoModal(false)
        } else if(type == 'send'){
            if(drawerChk === 'Y'){
                // drawerClass('drawerback');
            }
            setSendDrawer(true);
        }
    }

    const drawerClose = (type) =>{
        if(type == 'prev'){
            // if(drawerChk === 'Y'){
            //     drawerClass();
            // }
            setPrevPdfDrawer(false);
        } else if(type == 'order'){
            setPrevOrdDrawer(false);
        } else if(type == 'send'){
            // if(drawerChk === 'Y'){
            //     drawerClass();
            // }
            setSendDrawer(false);
        }
    }



    React.useEffect(() => {
        commonStore.handleApi({
            // url : `/packings/${rowData?.id}/orders`
            url : `/packings/1/orders`
        })
        .then(result => {
            setListData(result.data)
        })
    }, [])
    return (
        <Drawer 
            title='제작 발주'
            placement='right'
            className={drawerExtended ? 'drawerWrap drawerback' : 'drawerWrap'}
            onClose={()=>{visibleClose()}}
            visible={viewVisible}
            closable={false}
            keyboard={false}
            extra={
                <Space>
                    <Button onClick={() =>{ setDrawerExtended(!drawerExtended) }} style={{marginRight: 10}}>
                        {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                    </Button>
                    <Button onClick={visibleClose}>
                        <CloseOutlined />
                    </Button>
                </Space>
            }
        >
            <Row className="gridWrap">
                <Table
                    rowKey      = {'id'}
                    dataSource  = {listData}
                    columns     = {columns}
                    size        = {'middle'}
                    bordered    = {true}
                    style       = {{ padding: 0, flex: 1 }}
                    scroll      = {{ x : 500, y: 500 }}
                    pagination  = { false }
                    // onRow       = {(record) => ({
                    //     onClick : (event) => { setSelectedRowKeys([record.dataIndex]) }
                    // })}
                    // rowSelection= { rowSelection }
                />
            </Row>
            <Row gutter={10} justify="center" style={{margin: '20px 0'}}>
                <Button type="primary" htmlType="button" onClick={()=>{setInfoModal(true)}}>제작 발주서 미리보기</Button>
            </Row>
            <Row gutter={10} justify="center" style={{margin: '20px 0'}}>
                <Button type="primary" htmlType="button" onClick={() => {drawerOpen('send')}}>제작 발주(발송)</Button>
            </Row>

            {prevOrdDrawer ? <PreviewOrder /> : ''}
            {prevPdfDrwer ? <PreviewPdf viewVisible={prevPdfDrwer} visibleClose={drawerClose} drawerChk={drawerChk}/> : ''}
            {sendDrawer ? <OrderSend viewVisible={sendDrawer} visibleClose={drawerClose} drawerChk={drawerChk}/> : ''}
            <Modal
                visible={infoModal}
                onOk={() => {drawerOpen('order')}}
                onCancel={()=>{setInfoModal(false)}}
                okText="확인"
                cancelText="취소"
            >
                <p>제작 발주 수정사항을 저장하고 진행할 수 있습니다. 계속하시겠습니까?</p>
            </Modal> 
        </Drawer>
    )
}

export default inject('commonStore')(observer(Order))
