import React from 'react'
import { Drawer, Button, Row, Col, Typography, Modal } from 'antd'
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { inject, observer } from 'mobx-react'
import ViewThisDrawer   from '@pages/ProduceMgmt/orderPaper/paperbookTab'
import { moneyComma } from '@components/Common/Js'

const ViewDrawer = ({commonStore, list, visible, drawerClose, status}) => {
    const [ drawerPriority, setDrawerPriority   ] = React.useState(false)
    const [ detailData,     setDetailData       ] = React.useState({})
    const [ drawerExtended, setDrawerExtended   ] = React.useState(false)
    const [ rowData,        setRowData          ] = React.useState({})
    const [ targetId,       setTargetId         ] = React.useState('')
    const [ targetViewType, setTargetViewType   ] = React.useState('')

    React.useEffect(()=>{
        if (list !== undefined && list !== '' && list !== null) {
            fetchData()
        }
    },[list])

    //리스트
    const fetchData = () => {
        commonStore.handleApi({
            url : `/productions-review-reprints/${list}`
        })
        .then(result => {
            setDetailData(result.data)
        })
    }

    const thisDrawerClose = () => {
        setDrawerPriority(false)
    }

    const openDrawer = (props) => {
        setDrawerPriority(true)
        setTargetId(props.rowData)
        setTargetViewType(props.viewType)
    }

    const cancelReview = () => {
        Modal.confirm({
            title: `제작 검토 취소 상태로 변경됩니다. 이후에도 '제작 검토 등록'은 진행할 수 있습니다.`,
            onOk() {
                commonStore.handleApi({
                    method : `POST`, 
                    url : `/productions-review-reprints-cancel/${list}`
                })
                .then(() => {
                    drawerClose()
                    Modal.success({ content: '완료되었습니다.' })
                })
            }
        })
    }

    return(
        <>
            <Drawer
                title='보기/수정'
                placement='right'
                className={drawerExtended ? `drawerWrap drawerback` : `drawerWrap`}
                visible={visible}
                onClose={drawerClose}
                closable={false}
                keyboard={false}
                extra={
                    <>
                        <Button onClick={() =>{ setDrawerExtended(!drawerExtended) }} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={drawerClose}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >
                <Row gutter={10} className="table">
                    <Col xs={24} lg={4} className="label">상품</Col>
                    <Col xs={24} lg={20}>[{detailData?.product?.product_code}] {detailData?.product?.name}</Col>
                    <Col xs={24} lg={4} className="label">현재 판/쇄</Col>
                    <Col xs={24} lg={20}>
                        <Typography.Link 
                            onClick={() => { 
                                openDrawer({
                                    viewType : `view`,
                                    rowData : detailData.production_id
                                })
                            }} 
                            style={{fontSize: 14}} 
                            underline
                        >
                            {detailData?.printing_name}
                        </Typography.Link>
                    </Col>
                    <Col xs={24} lg={4} className="label">재쇄 검토 요청</Col>
                    <Col xs={24} lg={8}>{detailData?.created_name} / {detailData?.created_at}</Col>
                    <Col xs={24} lg={4} className="label">편집 확인</Col>
                    <Col xs={24} lg={8}>{detailData?.edit_user_name} / {detailData?.editor_at}</Col>
                    <Col xs={24} lg={4} className="label">편집 마감 예정일</Col>
                    <Col xs={24} lg={8}>{detailData?.due_date}</Col>
                    <Col xs={24} lg={4} className="label">입고 요청일</Col>
                    <Col xs={24} lg={8}>{detailData?.request_date}</Col>
                    <Col xs={24} lg={4} className="label">발주 수량</Col>
                    <Col xs={24} lg={8}>{moneyComma(detailData?.product_qty)}</Col>
                    <Col xs={24} lg={4} className="label">변경 범위</Col>
                    <Col xs={24} lg={8}>{detailData?.change1 == "Y" && "데이터 변경"} {(detailData?.change1 == "Y" && detailData?.change2 == "Y") && ", "} {detailData?.change2 == "Y" && "사양 변경"}</Col>
                    <Col xs={24} lg={4} className="label">사양 변경 등 참고사항</Col>
                    <Col xs={24} lg={20}>{detailData?.memo}</Col>
                </Row>

                <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                    <Col>
                    {
                        status === `재쇄 확정` && 
                        <Button 
                            type='primary' 
                            htmlType='button' 
                            onClick={() => { 
                                openDrawer({
                                    viewType : '',
                                    rowData : ''
                                })
                            }}
                        >
                            제작 발주 등록
                        </Button>
                    }
                    {
                        status === `제작 검토 중` && 
                        <Button                 htmlType='button' onClick={cancelReview}    >제작 발주 취소</Button>
                    }
                    {
                        status === `제작 검토 완료` && 
                        <Button type='primary'  htmlType='button' onClick={() => { }}       >제작 발주 보기</Button>
                    }
                    </Col>
                </Row>

                <ViewThisDrawer 
                    rowData={targetId}
                    viewType={targetViewType}
                    visible={drawerPriority}  
                    addDrawerClose={thisDrawerClose} 
                />
            </Drawer>
        </>
    )
}

export default inject('commonStore')(observer(ViewDrawer))