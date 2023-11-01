import React from 'react';
import { Drawer, Button, Row, Col, Modal } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { inject, observer } from 'mobx-react';
import { moneyComma }       from '@components/Common/Js';
import ResultTable          from '@pages/ProduceMgmt/review/newBook/view/resultTable'    // 시뮬레이션 결과
import DevCost              from '@pages/ProduceMgmt/review/newBook/view/devCost'        // 개발비/기타
import PrdCost              from '@pages/ProduceMgmt/review/newBook/view/prdCost'        // 제작비
import PaperbookTab         from '@pages/ProduceMgmt/orderPaper/paperbookTab'

const ViewDrawer = ({commonStore, visible, setVisible, drawerClose, rowData}) =>{
    const [viewData,         setViewData]         = React.useState({})
    const [tabBtnLeft,       setTabBtnLeft]       = React.useState(true)
    const [paperBookVisible, setPaperBookVisible] = React.useState(false)
    const [ drawerExtended,  setDrawerExtended  ] = React.useState(false);

    const fetchData = () => {
        commonStore.handleApi({ 
            url : `/productions-review-simulations/${rowData}` 
        })
        .then((result) => {
            setViewData(result.data)
        })
    }
    const tabValChange = (type) => {
        if(type == 'Dev'){
            setTabBtnLeft(true)
        }else {
            setTabBtnLeft(false)
        }
    }

    const cancelNewBook = () => {
        Modal.confirm({
            title: `제작 검토 취소 상태로 변경됩니다. 이후에도 '제작 검토 등록'은 진행할 수 있습니다.`,
            onOk() {
                commonStore.handleApi({
                    method : `POST`, 
                    url : `/productions-review-simulations-cancel/${rowData}`
                })
                .then(() => {
                    setVisible(false)
                    Modal.success({ content: '완료되었습니다.' })
                })
            }
        })
    }

    React.useEffect(() => {
        if (rowData !== undefined && rowData !== null && rowData !== '') {
            fetchData()
        }
    }, [rowData])

    return (
        <>
        {Object.keys(viewData).length !== 0 ? 
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
                        <Button onClick={() => {setDrawerExtended(!drawerExtended)}} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={drawerClose}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >
                <Row gutter={10} className="table marginTop">
                    <div className="table_title">기본 정보</div>
                    <Col xs={24} lg={4} className="label">제목</Col>
                    <Col xs={24} lg={20}>{viewData.title}</Col>
                    <Col xs={24} lg={4} className="label">작성자</Col>
                    <Col xs={24} lg={8}>{viewData.created_info.name}</Col>
                    <Col xs={24} lg={4} className="label">부서</Col>
                    <Col xs={24} lg={8}>{viewData.created_info?.team_info?.name}</Col>
                    <Col xs={24} lg={4} className="label">시뮬레이션 코드</Col>
                    <Col xs={24} lg={8}>{viewData.simulation_code}</Col>
                    <Col xs={24} lg={4} className="label">진행 상태</Col>
                    {/* 1: 등록, 2: 제작 검토 요청, 3: 제작 검토 중, 4: 제작 검토 완료, 5: 제작 검토 취소 */}
                    <Col xs={24} lg={8}>
                    {
                        viewData.status == 1 ? '등록' : 
                        viewData.status == 2 ? '제작 검토 요청' : 
                        viewData.status == 3 ? '제작 검토 중' : 
                        viewData.status == 4 ? '제작 검토 완료' : 
                        viewData.status == 5 ? '제작 검토 취소' : ''
                    }
                    </Col>
                    <Col xs={24} lg={4} className="label">최초 등록</Col>
                    <Col xs={24} lg={8}>{viewData.created_at}</Col>
                    <Col xs={24} lg={4} className="label">업데이트</Col>
                    <Col xs={24} lg={8}>{viewData.updated_at}</Col>
                    <Col xs={24} lg={4} className="label">공유</Col>
                    <Col xs={24} lg={20}></Col>
                </Row>
                {/* 시뮬레이션 결과 */}
                <ResultTable viewData={viewData.results}/>
                {/* 상품 정보 */}
                <div style={{marginBottom: 40}}>
                    <Row gutter={10} className="table marginTop">
                        <div className="table_title">상품 정보</div>
                        <Col xs={24} lg={4} className="label">상품</Col>
                        <Col xs={24} lg={8}>[ {viewData.product?.product_code} ] {viewData.product?.name}</Col>
                        <Col xs={24} lg={4} className="label">상품 등급</Col>
                        <Col xs={24} lg={8} >{viewData.product_grade}</Col>
                        <Col xs={24} lg={4} className="label">발주 수량</Col>
                        <Col xs={24} lg={8} >{moneyComma(viewData.product_qty)}</Col>
                        <Col xs={24} lg={4} className="label">예상 제작일</Col>
                        <Col xs={24} lg={8} >{viewData.product_date}</Col>
                    </Row>
                </div>
                {/* 탭 구성 */}
                <Row style={{marginBottom: 20}} >
                    <Col>
                        <Button className='tab_btn' type={tabBtnLeft ? 'primary' : ''} htmlType='button' onClick={(e) => tabValChange('Dev')}>개발비/기타</Button>
                        <Button className='tab_btn' type={tabBtnLeft ? '' : 'primary'} htmlType='button' onClick={(e) => tabValChange('Prd')}>제작비</Button>
                    </Col>
                </Row>

                { tabBtnLeft ? <DevCost viewData={viewData.development}/> : <PrdCost viewData={viewData.request_review}/> }
                {/* 버튼 */}
                <Row gutter={[10, 10]} justify="center" style={{ marginTop: 40, marginBottom: 80}}>
                    <Col>
                        {/* 제작 검토 요청 상태 시 */}
                        {viewData.status == '2' && <Button type='primary' htmlType='button' onClick={() => {setPaperBookVisible(true)}}>제작 발주 등록</Button>}
                        {/* 검토 중에는 취소 가능 */}
                        {/* 제작 검토 취소 가능 */}
                        {viewData.status == '3' && <Button htmlType='button' style={{marginLeft: 10}} onClick={cancelNewBook}>제작 검토 취소</Button>}
                        {/* 제작 검토 완료 상태 시 */}
                        {viewData.status == '4' && <Button type='primary' htmlType='button' onClick={() => {setPaperBookVisible(true)}} style={{marginLeft: 10}}>제작 발주 보기</Button>}
                    </Col>
                </Row>

                {/* 제작 발주 클릭 시 노출되는 추가 > 단권 탭  */}
                <PaperbookTab
                    rowData={``} 
                    visible = {paperBookVisible} 
                    addDrawerClose = {() => setPaperBookVisible(false)} 
                    listRefresh={()=>{}}
                />

            </Drawer>
            :
            <></>
        }
        </>
    )
}

export default inject('commonStore')(observer(ViewDrawer))