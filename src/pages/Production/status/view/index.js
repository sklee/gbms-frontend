import React from 'react'
import { Drawer, Row, Col, Button } from 'antd'
import { DownOutlined, CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';

import { inject, observer } from 'mobx-react';

import ChkProduct   from './chkProduct';    // 상품검색
import BasicComp    from './basicComp';     // 기본구성
import DetailComp   from './detailComp';    // 세부구성
import Fabrication  from './Fabrication';   // 제작 상태
import Process      from './process';       // 공정
import { isEmpty, moneyComma } from '@components/Common/Js';

export const ViewContext = React.createContext(null)

const StatusView = ({commonStore, chkVisible , visibleClose, drawerChk}) => {
    const [productionData, setProductionData] = React.useState([])
    const [ selectedDefaultsRow, setSelectedDefaultsRow ] = React.useState({})
    const [ selectedDetailsRow,  setSelectedDetailsRow  ] = React.useState({})
    // Defaults (기본 구성) 중 선택된 row의 index
    // 선택된 row가 없으면 -1 return
    const [defaultRowIndex, setDefaultRowIndex] = React.useState(-1)
    // Details (세부 구성) 중 선택된 row의 index
    // Details (세부 구성) 중 선택된 row가 없으면 -1 return
    // Defaults (기본 구성) 중 선택된 row가 없으면 -2 return
    const [detailRowIndex, setDetailRowIndex] = React.useState(-2)

    const [ drawerExtended, setDrawerExtended   ] = React.useState(false)

    const drawerOpen = () => {}

    React.useEffect(() => {
        commonStore.handleApi({
            url : `/productions/2`
        })
        .then((result) => {
            setProductionData(result.data)
        })
    }, [])

    // 기본 구성 Row 변경될 때 index 갱신
    React.useEffect(() => {
        setDefaultRowIndex((!isEmpty(productionData) && Object.entries({}).toString() !== Object.entries(productionData).toString())? productionData?.defaults?.indexOf(selectedDefaultsRow) : -1)
    }, [selectedDefaultsRow])
    // 기본 구성 Row가 변경되거나 세부 구성 Row가 변경됐을 때 index 갱신
    React.useEffect(() => {
        setDetailRowIndex(defaultRowIndex !== -1 ? productionData?.defaults[defaultRowIndex]?.details?.indexOf(selectedDetailsRow) !== undefined ? productionData?.defaults[defaultRowIndex]?.details?.indexOf(selectedDetailsRow) : -2 : -2)
    }, [defaultRowIndex, selectedDetailsRow])

    return (
        <ViewContext.Provider value={{
            selectedDefaultsRow     : selectedDefaultsRow,
            setSelectedDefaultsRow  : setSelectedDefaultsRow,
            selectedDetailsRow      : selectedDetailsRow,
            setSelectedDetailsRow   : setSelectedDetailsRow,
            defaultRowIndex         : defaultRowIndex,
            detailRowIndex          : detailRowIndex,
        }}>
            <Drawer
                title='보기/수정'
                placement='right'
                visible={chkVisible}
                onClose={visibleClose}
                className={drawerExtended ? 'drawerWrap drawerback' : 'drawerWrap'}
                closable={false}
                keyboard={false}
                width={'90% !important'}
                extra={
                    <>
                        <Button onClick={() =>{ setDrawerExtended(!drawerExtended) }} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={visibleClose}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >
                <>
                    {/* 최상단 상품, 판/쇄 */}
                    <Row gutter={10} className="table on" style={{marginLeft: 0, marginRight: 0}}>
                        <Col xs={24} lg={3} className="label">상품</Col>
                        <Col xs={24} lg={9} className="verCenter"><>[{productionData?.product?.product_code}] {productionData?.product?.internal_name}</></Col>
                        <Col xs={24} lg={3} className="label">판/쇄</Col>
                        <Col xs={24} lg={9} className="verCenter"><>초판 {productionData?.printing} 쇄 (표기 {productionData?.printing_name})</></Col>
                    </Row>
                    {/* 등록, 검토 정보 섹션 */}
                    <div style={{marginTop: 20, marginBottom: 20}}>
                        <Row gutter={10} className="table on">
                            <Col xs={24} lg={24}> 등록, 검토 정보 </Col>
                            <Col xs={24} lg={3} className="label">편집 마감 예정일</Col>
                            <Col xs={24} lg={9} className="verCenter">{productionData?.due_date}</Col>
                            <Col xs={24} lg={3} className="label">입고 요청일</Col>
                            <Col xs={24} lg={9} className="verCenter">{productionData?.request_date}</Col>
                            <Col xs={24} lg={3} className="label">발주 수량</Col>
                            <Col xs={24} lg={21} className="verCenter">{moneyComma(productionData?.product_qty)}</Col>
                            <Col xs={24} lg={3} className="label">등록 시 재고 수량</Col>
                            <Col xs={24} lg={9} className="verCenter">{moneyComma(productionData?.stock_qty)}</Col>
                            <Col xs={24} lg={3} className="label">등록 시 재고 소진일</Col>
                            <Col xs={24} lg={9} className="verCenter">{productionData?.stock_date}</Col>
                        </Row>
                    </div>
                    {/* 제작, 입고, 비용 정보 */}
                    <Row gutter={10} className="table on">
                        <Col xs={24} lg={24} style={{ position: "relative"}}>제작, 입고, 비용 정보</Col>
                        <Col xs={12} lg={3} className="label">제작 구분</Col>
                        <Col xs={12} lg={9} className="verCenter">{productionData?.production_type}</Col>
                        <Col xs={12} lg={3} className="label">제작 상태</Col>
                        <Col xs={12} lg={9} className="verCenter"> {productionData?.status?.name ? <Button className='btnLink' onClick={()=>(drawerOpen('fabrication'))}> {productionData?.status?.name} </Button> : `제작 검토 중`}</Col>
                        <Col xs={12} lg={3} className="label">제작처(인쇄)</Col>
                        <Col xs={12} lg={9}>{productionData?.print_produce_company_id}</Col>
                        <Col xs={12} lg={3} className="label">제작처(제본)</Col>
                        <Col xs={12} lg={9}>{productionData?.binding_produce_company_id}</Col>
                    </Row>
                </>
                <BasicComp productionData={productionData}/>
                { defaultRowIndex !== -1 ? <DetailComp productionData={productionData}/> : <></> }
                { (defaultRowIndex !== -1 && detailRowIndex  !== -1) ? <Process productionData={productionData}/> : <></> }
            </Drawer>
        </ViewContext.Provider>
    )
}

export default inject('commonStore')(observer(StatusView)) 