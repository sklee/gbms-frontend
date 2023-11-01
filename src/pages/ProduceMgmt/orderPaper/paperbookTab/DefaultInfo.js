import React from "react"
import { inject, observer } from "mobx-react"
import { Row, Col, Button, Popover } from 'antd'
import { FormikContext } from 'formik'
import FormikInput, { FormikContainer } from '@components/form/CustomInput'
import { moneyComma, isEmpty } from "@components/Common/Js"
import { PaperBookContext } from "."
import Priority     from './view/priority'     // 우선 순위
import Fabrication  from './view/Fabrication'  // 제작상태
import Order        from './view/order'        // 제작 발주
import ChkProduct   from "./chkProduct"

const DefaultInfo = ({commonStore}) => {
    const formikHook = React.useContext(FormikContext)
    const providerData = React.useContext(PaperBookContext)
    const [ searchedProduct,    setSearchedProduct  ] = React.useState(formikHook.values.product)
    const [ chkProduct,         setChkProduct       ] = React.useState(false)
    const [ fabDrawer,          setFabDrawer        ] = React.useState(false)
    const [ priorityDrawer,     setPriorityDrawer   ] = React.useState(false)
    const [ orderDrawer,        setOrderDrawer      ] = React.useState(false)
    const [ userList,           setUserList         ] = React.useState([])
    const [ productList,        setProductList      ] = React.useState([])
    const [ configList,         setConfigList       ] = React.useState([])
    // select box 데이터 가져온다.
    React.useEffect(() => {
        commonStore.handleApi({
            url : `/users`, 
        })
        .then((result) => {
            result.data.map(unit => {
                unit.label = unit.name
                unit.value = unit.id
            })
            setUserList(result.data)
        })

        commonStore.handleApi({
            url : `/produce-company`, 
        })
        .then((result) => {
            result.data.map(unit => {
                unit.label = unit.name
                unit.value = unit.id
            })
            setProductList(result.data)
        })
        
        commonStore.handleApi({
            url : `/produce-configs`, 
        })
        .then((result) => {
            result.data.map(unit => {
                unit.label = unit.name
                unit.value = unit.id
            })
            setConfigList(result.data)
        })
    }, [])

    // Drawer 열기 (우선순위, 제작상태 등)
    const drawerOpen = (type) =>{
        if (type == 'chkProduct') {
            setChkProduct(true)
        } else if(type == 'fabrication'){
            setFabDrawer(true)
        } else if(type == 'priority'){
            setPriorityDrawer(true)
        } else if(type == 'order'){
            setOrderDrawer(true)
        } 
    }

    // Drawer 닫기 (우선순위, 제작상태 등)
    const drawerClose = (type) =>{
        if (type == 'chkProduct') {
            setChkProduct(false)
        } else if(type == 'fabrication'){
            setFabDrawer(false);
        } else if(type == 'priority'){
            setPriorityDrawer(false);
        } else if(type == 'order'){
            setOrderDrawer(false);
        }
    }

    React.useEffect(() => {
        formikHook.setFieldValue('product', searchedProduct)
        formikHook.setFieldValue('product_id', searchedProduct?.id)
    }, [searchedProduct])

    const tooltipText = (
        <div>
            <p>공급가는 상품 귀속 부서의 평균 공급가를 표시합니다.</p>
        </div>
    )

    const tooltipText1 = (
        <div>
            <p>정확한 제작비는 정산이 끝나야 확정됩니다. <br />구분을 위해 정산 전에는 푸른색으로 표시합니다.</p>
        </div>
    )

    const editabled = true

    const btnDel = () => {
        formikHook.setFieldValue('product', {})
    }
    // 공통 > 발주 수량 변경 시 종이 정미, 인쇄 정미 변경
    React.useEffect(() => {
        var defaultsLength = 0
        var detailsLength  = 0
        var papersLength   = 0
        var printsLength   = 0
        
        if (Array.isArray(formikHook.values.defaults)) defaultsLength = formikHook.values.defaults.length
        for (var i = 0; i < defaultsLength; i++) {
            if (Array.isArray(formikHook.values.defaults[i].details)) detailsLength = formikHook.values.defaults[i].details.length
            for (var j = 0; j < detailsLength; j++) {
                // 종이
                if (Array.isArray(formikHook.values.defaults[i].details[j].papers)) papersLength = formikHook.values.defaults[i].details[j].papers.length
                for (var l = 0; l < papersLength; l++) {
                    // 종이 > 종이 정미
                    formikHook.setFieldValue(
                        `defaults.${i}.details.${j}.papers.${l}.jm`,
                        formikHook.values?.product_qty * 
                        formikHook.values?.defaults[i]?.details[j]?.papers[l]?.ds / 
                        500
                    )
                }
                // 인쇄
                if (Array.isArray(formikHook.values.defaults[i].details[j].prints)) printsLength = formikHook.values.defaults[i].details[j].prints.length
                for (var l = 0; l < printsLength; l++) {
                    // 인쇄 > 인쇄 정미
                    formikHook.setFieldValue(
                        `defaults.${i}.details.${j}.prints.${l}.jm`,
                        formikHook.values?.product_qty * 
                        formikHook.values?.defaults[i]?.details[j]?.prints[l]?.ds / 
                        500
                    )
                }
            }
        }
    }, [formikHook.values?.product_qty])
    
    return (
        <>
            {/* 최상단 상품, 판/쇄 */}            
            <Row gutter={10} className="table">
                <Col xs={24} lg={3} className="label">상품 <span className="spanStar">*</span></Col>
                <Col xs={24} lg={9} className="verCenter">
                    {isEmpty(formikHook.values?.product) ? (
                        <Button className="btn btn-primary btn_add" shape="circle" onClick={() => drawerOpen('chkProduct')}>+</Button>
                    ) : (
                        <>
                            [{formikHook.values?.product?.product_code}] {formikHook.values?.product?.internal_name}
                            {(!providerData.editabled && providerData.viewType !== 'view') &&
                                <Button shape="circle" className="btn_del" onClick={btnDel}>X{providerData.viewType}</Button>
                            }
                        </>
                    )}
                </Col>
                <Col xs={24} lg={3} className="label">판/쇄 <span className="spanStar">*</span></Col>
                <Col xs={24} lg={9} className="verCenter">
                    <>
                        초판
                        <FormikInput 
                            name='printing'
                            style={{textAlign: 'center', width: 50, marginLeft: 10, marginRight: 10}} 
                            fontStyle={{width: 'none'}}
                            readOnly={ providerData.editabled || providerData.viewType === 'view' }
                        />
                        쇄 (표기 
                        <FormikInput 
                            name='printing_name'
                            style={{textAlign: 'center', width: 80, marginLeft: 10, marginRight: 10}} 
                            fontStyle={{width: 'none'}}
                            readOnly={providerData.editabled || providerData.viewType === 'view'}
                        />)
                    </>
                </Col>
            </Row>

            {/* 등록, 검토 정보 섹션 */}

            <div style={{margin: '20px 0'}}>
                <Row gutter={10} className="table on">
                    <Col xs={24} lg={24}> 등록, 검토 정보 </Col>
                    <div className="acc_cont" style={{display: 'flex', flexWrap: 'wrap', padding: 0, border: 0}}>
                        <Col lg={3} className="label">상품 종류</Col>
                        <Col lg={9}>
                            {
                                formikHook.values?.product?.product_type == 1 ? `종이책(단권)` : 
                                formikHook.values?.product?.product_type == 2 ? `종이책(세트)` : 
                                formikHook.values?.product?.product_type == 3 ? `전자책` : 
                                formikHook.values?.product?.product_type == 4 ? `오디오북` : 
                                formikHook.values?.product?.product_type == 5 ? `동영상 강좌` : 
                                formikHook.values?.product?.product_type == 6 ? `기타 2차 저작물` : 
                                formikHook.values?.product?.product_type == 7 ? `비매품` : 
                                formikHook.values?.product?.product_type == 8 ? `판매용 일반 제품` : ''
                            }
                        </Col>
                        <Col lg={3} className="label">부서</Col>
                        <Col lg={9}>{formikHook.values?.department?.name}</Col>
                        <FormikContainer 
                            label={'등록자'} 
                            labelWidth={3} 
                            perRow={2} 
                            name={'created_info.name'} 
                            style={{padding: '4px 11px'}} 
                            disabled={true}
                        />
                        <FormikContainer 
                            label={'편집 담당자'} 
                            labelWidth={3} 
                            perRow={2} 
                            name={'edit_user_id'} 
                            type={'select'} 
                            required 
                            style={{width: '100%'}}
                            data={{ options : userList }}
                            disabled={providerData.editabled || providerData.viewType === 'view'}
                        />
                        <FormikContainer 
                            label={'제작 담당자'} 
                            labelWidth={3} 
                            perRow={2} 
                            name={'produce_config_id'} 
                            type={'select'} 
                            required 
                            style={{width: '100%'}} 
                            data={{ options : userList }}
                            disabled={providerData.editabled || providerData.viewType === 'view'}
                        />

                        <FormikContainer 
                            label={'편집 마감 예정일'} 
                            labelWidth={3} 
                            perRow={2} 
                            name={'due_date'} 
                            required 
                            style={{padding: '4px 11px', flex: 1}} 
                            type={'datepicker'}
                            disabled={providerData.editabled || providerData.viewType === 'view'}
                        />
                        <FormikContainer 
                            label={'입고 요청일'} 
                            labelWidth={3} 
                            perRow={2} 
                            name={'request_date'} 
                            type={'datepicker'}
                            required 
                            style={{padding: '4px 11px', flex: 1}} 
                            disabled={providerData.editabled || providerData.viewType === 'view'}
                        />
                        <FormikContainer 
                            label={'발주 수량'} 
                            labelWidth={3} 
                            perRow={2} 
                            name={'product_qty'} 
                            required 
                            style={{padding: '4px 11px'}} 
                            readOnly={providerData.editabled || providerData.viewType === 'view'}
                        />
                        <Col lg={3} className="label">등록 시 재고 수량</Col>
                        <Col lg={9}>{formikHook.values?.stock_qty}</Col>
                        <Col lg={3} className="label">등록 시 재고 소진일</Col>
                        <Col lg={9}>{formikHook.values?.stock_date}</Col>
                    </div>
                </Row>
            </div>

            {/* 제작, 입고, 비용 정보 */}
            <Row gutter={10} className="table on">
                <Col xs={24} lg={24} style={{ position: "relative"}}>
                    <div
                        style={{
                            position: "absolute",
                            top: 10,
                            right: 10
                        }}
                    >
                        {
                            providerData.viewType === 'view' ? 
                            `우선 순위`
                            :
                            <button className='btnLink' onClick={()=>{drawerOpen('priority')}}>우선 순위 : {formikHook.values?.prioriy?.ordnum}</button>
                        }
                    </div>
                    제작, 입고, 비용 정보
                </Col>
                <div className="acc_cont" style={{display: 'flex', flexWrap: 'wrap', padding: 0, border: 0}}>
                    <Col xs={12} lg={3} className="label">제작 구분</Col>
                    <Col xs={12} lg={3} className="verCenter">
                        <FormikInput 
                            name={'production_type'}
                            type={'select'} 
                            style={{ width: '100%' }}
                            data={{ 
                                defaultValue : '신간', 
                                options : [{
                                    value : '신간', 
                                    label : '신간'
                                }, {
                                    value : '재쇄', 
                                    label : '재쇄'
                                } ], 
                            }}
                            disabled={providerData.editabled || providerData.viewType === 'view'}
                        />
                    </Col>
                    <Col xs={12} lg={3} className="label">제작 상태</Col>
                    <Col xs={12} lg={3} className="verCenter">
                        {   
                            providerData.viewType === 'view' ? 
                            `제작 검토 중`
                            :
                            formikHook.values?.status?.name ? 
                            <button className='btnLink' onClick={()=>(drawerOpen('fabrication'))}>
                                {formikHook.values?.status?.name}
                            </button>
                            :
                            `제작 검토 중`
                        }
                    </Col>
                    <Col xs={12} lg={3} className="label">제작처(인쇄) <span className="spanStar">*</span></Col>
                    <Col xs={12} lg={3}>
                        <FormikInput 
                            name={'print_produce_company_id'}
                            type={'select'} 
                            style={{ width: '100%' }}
                            data={{ options : productList }}
                            disabled={providerData.editabled || providerData.viewType === 'view'}
                        />
                    </Col>
                    <Col xs={12} lg={3} className="label">제작처(제본) <span className="spanStar">*</span></Col>
                    <Col xs={12} lg={3}>
                        <FormikInput 
                            name={'binding_produce_company_id'}
                            type={'select'} 
                            style={{ width: '100%' }}
                            data={{ options : productList }}
                            disabled={providerData.editabled || providerData.viewType === 'view'}
                        />
                    </Col>
                    <Col xs={12} lg={3} className="label">상품 구성 방식 <span className="spanStar">*</span></Col>
                    <Col xs={12} lg={9}>
                        <FormikInput 
                            name={'produce_config_id'}
                            type={'select'} 
                            style={{ width: '100%' }}
                            data={{ options : configList }}
                            disabled={providerData.editabled || providerData.viewType === 'view'}
                        />
                    </Col>
                    <Col xs={12} lg={3} className="label">최종 업데이트</Col>
                    <Col xs={12} lg={3} className="verCenter">API 개발 후 진행</Col>
                    <Col xs={12} lg={3} className="label">발주일</Col>
                    <Col xs={12} lg={3} className="verCenter">
                        {providerData.viewType !== 'view' ? 
                        <button className='btnLink' onClick={()=>(drawerOpen('order'))}>
                            API 개발 후 진행
                            {/* {productionData?.request_date} */}
                        </button>
                        :
                        ''
                        }
                    </Col>

                    <FormikContainer 
                        label={'참고 사항'} 
                        labelWidth={3} 
                        perRow={2} 
                        type={'textarea'}
                        name={'memo'} 
                        readOnly={providerData.editabled || providerData.viewType === 'view'}
                        required 
                        style={{padding: '4px 11px'}} 
                    />
                    {/* <Col xs={24} lg={3} className="label"></Col>
                    <Col xs={24} lg={9}><Input.TextArea style={{height: '100%'}}/></Col> */}
                    <Col xs={24} lg={12} style={{padding: 0}}><Row>
                        <Col lg={6} style={{paddingLeft: 5}} className="label">창고 입고 요청일</Col>
                        <Col lg={6} style={{paddingLeft: 5}} className="verCenter">API 개발 후 진행</Col>
                        <Col lg={6} style={{paddingLeft: 5}} className="label">입고 예정일</Col>
                        <Col lg={6} style={{paddingLeft: 5}} >API 개발 후 진행</Col>
                        <Col lg={6} style={{paddingLeft: 5}} className="label">마지막 입고일</Col>
                        <Col lg={6} style={{paddingLeft: 5}} >API 개발 후 진행</Col>
                        <Col lg={6} style={{paddingLeft: 5}} className="label">입고 수량 합계</Col>
                        <Col lg={6} style={{paddingLeft: 5}} >API 개발 후 진행</Col>
                    </Row></Col>
                    <Col xs={12} lg={3} className="label">
                        정가/공급가
                        <Popover content={tooltipText}>
                            <Button
                                shape="circle"
                                size="small"
                                className="btn_popover"
                                style={{ marginLeft: '5px' }}
                            >?</Button>
                        </Popover>
                    </Col>
                    <Col xs={12} lg={3}>{moneyComma(formikHook.values?.price)}<span style={{marginLeft: 5, marginRight: 5}}>/</span>{moneyComma(formikHook.values?.supply_price)}</Col>
                    <Col xs={12} lg={3} className="label">
                        제작비
                        <Popover content={tooltipText1}>
                            <Button
                                shape="circle"
                                size="small"
                                className="btn_popover"
                                style={{ marginLeft: '5px' }}
                            >?</Button>
                        </Popover>
                    </Col>
                    <Col xs={12} lg={3}>{moneyComma(formikHook.values?.production_cost)}</Col>
                    <Col xs={12} lg={3} className="label">상품당 제작비</Col>
                    <Col xs={12} lg={3}>{moneyComma(formikHook.values?.production_per_cost)}</Col>
                    <Col xs={12} lg={3} className="label">제작비 비율</Col>
                    <Col xs={12} lg={3}>{formikHook.values?.production_cost_rate}</Col>
                </div>
            </Row>

            {chkProduct && <ChkProduct chkVisible={chkProduct} visibleClose={drawerClose} searchedProduct={setSearchedProduct} />}
            {fabDrawer ? <Fabrication viewVisible={fabDrawer}  visibleClose={drawerClose}/> : ''}
            {priorityDrawer ? <Priority viewVisible={priorityDrawer}  visibleClose={drawerClose}/> : ''}
            {orderDrawer ? <Order viewVisible={orderDrawer}  visibleClose={drawerClose} drawerChk='Y'/> : ''}
        </>
    )
}

export default inject('commonStore')(observer(DefaultInfo)) 