import React from 'react'
import { Row, Col, Button, Input, Checkbox, DatePicker, Table, Modal } from 'antd'
import PrdPostprocess from './prdDrawer/postprocess' // 후가공 제작처(공정) 검색
import Vendor from './vendorDrawer/index'  // 납품처 검색
import { FormikContext, FormikProvider, useFormik } from 'formik';
import { PaperBookContext } from '..';
import FormikInput from '@components/form/CustomInput';
import { isEmpty, moneyComma } from '@components/Common/Js';

const Postprocess = () => {
    const formikHook    = React.useContext(FormikContext)
    const providerData  = React.useContext(PaperBookContext)
    // 추가/수정/보기 상태, create/modify/view
    const [mode,             setMode             ] = React.useState('view')
    const [selectedRow,      setSelectedRow      ] = React.useState({})
    const [selectedRowIndex, setSelectedRowIndex ] = React.useState(-1)
    const [selectedRowKeys,  setSelectedRowKeys  ] = React.useState([])
    const [prdDrawer,        setPrdDrawer        ] = React.useState(false);
    const [vendDrawer,       setVendDrawer       ] = React.useState(false);
    // formik 기본 값 Not necessary
    const initialValues = {}
    // const validationSchema = {}
    const onSubmit = (submitData) => {
        // 기본 구성 입력 값을 전체 데이터에 추가/수정한다.
        var targetIndex = 0
        // 수정인지 추가인지 확인
        // 추가라면
        if ( mode === 'create' ) {
            // details가 배열인지 확인 (초기 값이 없을 수 있음)
            if (Array.isArray(formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].processings)) {
                // 있으면 Index 추가
                targetIndex = formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].processings.length
            }
            else {
                // 초기 값이 없으면
                targetIndex = 0
            }
            // dataIndex 입력
            formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.processings.${targetIndex}.dataIndex`,               providerData.dataIndexs?.processing?.current)
        }
        // 수정이면
        else {
            // 목록에 선택되어 있는 index 지정
            targetIndex = selectedRowIndex
        }
        // 제작처
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.processings.${targetIndex}.produce_company_id`,           submitData.produce_company_id)
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.processings.${targetIndex}.produce_company`,              submitData.produce_company)
        // 납품처
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.processings.${targetIndex}.delivery_produce_company_id`,  submitData.delivery_produce_company_id)
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.processings.${targetIndex}.delivery_produce_company`,     submitData.delivery_produce_company)
        // 공정
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.processings.${targetIndex}.produce_process_id`,           submitData.produce_process_id)
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.processings.${targetIndex}.produce_process`,              submitData.produce_process)
        // 단가 기준 
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.processings.${targetIndex}.process_unit`,                 submitData.process_unit)
        // 인쇄 정미 
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.processings.${targetIndex}.jm`,                           submitData.jm)
        // 후가공 수량 
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.processings.${targetIndex}.qty`,                          submitData.qty)
        // 단가
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.processings.${targetIndex}.price`,                        submitData.price)
        // 공급가
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.processings.${targetIndex}.supply_price`,                 submitData.supply_price)
        // 부가세
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.processings.${targetIndex}.vat`,                          submitData.vat)
        // 부가세 체크 (Y, N)
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.processings.${targetIndex}.vat_yn`,                       submitData.vat_yn)
        // 합계
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.processings.${targetIndex}.total_amount`,                 submitData.total_amount)
        // 전달 사항
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.processings.${targetIndex}.memo`,                         submitData.memo)// 비용 귀속일
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.prepresses.${targetIndex}.cost_attribution_date`,       submitData.cost_attribution_date)
        // 추가인 경우 추가된 Row가 선택된 상태로 전환
        if ( mode === 'create' ) {
            setSelectedRowKeys([providerData.dataIndexs.processing.current])
        }
        // 보기 화면으로 전환
        setMode('view')
        providerData.dataIndexs.processing.current++
    }
    // 삭제 버튼 클릭했을 때 액션
    const onDelete = () => {
        Modal.confirm({
            content : (<> 
                <Row>정말 삭제하시겠습니까?</Row>
            </>), 
            onOk : () => {
                setMode('view')
                // 선택된 Row 초기화
                setSelectedRow({})
                // 전체 데이터 중 해당 Row 제거 (index 기준)
                formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.processings`, formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].processings.filter((row, index) => index !== selectedRowIndex))
            }
        })
    }
    // formik Hook 선언
    const formikDetailHook = useFormik({ initialValues, onSubmit })
    // Table Select Options
    const columns = [{
        dataIndex : "Composition", 
        title     : "세부 구성", 
        width     : 100,
        render    : () => (
            <>
                {/* 세부 구성 (ex. 표지, 본문) */}
                {formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.produce_code_detail?.name} 
                {/* 앞면 도수 */}
                ({formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.front_cmyk} / 
                {/* 뒷면 도수 */}
                {formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.back_cmyk})
            </>
        )
    }, {
        dataIndex : ["produce_process", "name"], 
        title     : "공정", 
        width     : 120,
    }, {
        dataIndex : "qty", 
        title     : "후가공 수량", 
        width     : 120,
        align     : "right", 
        render    : text => moneyComma(text)
    }, {
        dataIndex : "price", 
        title     : "단가", 
        width     : 120,
        align     : "right", 
        render    : text => moneyComma(text)
    }, {
        dataIndex : "total_amount", 
        title     : "합계", 
        width     : 120,
        align     : "right", 
        render    : text => moneyComma(text)
    }, {
        dataIndex : ["produce_company", "name"], 
        title     : "제작처", 
        width     : 120,
    }, {
        dataIndex : ["delivery_produce_company", "name"], 
        title     : "납품처", 
        width     : 120,
    }, {
        dataIndex : "cost_at", 
        title     : "비용 귀속일", 
        width     : 120,
    }, ]
    // Drawer Open/Close
    const prdDrawerOpen = () => setPrdDrawer(true);
    const prdDrawerClose = () => setPrdDrawer(false);
    const vendDrawerOpen = () => setVendDrawer(true);
    const vendDrawerClose = () => setVendDrawer(false);
    // Drawer에서 제작처 선택 후 데이터 fetch
    const setProcessingDrawerData = (rowData) => {
        // 제작처
        formikDetailHook.setFieldValue(`produce_company_id`,  rowData.produce_company_id)
        formikDetailHook.setFieldValue(`produce_company`,     {id : rowData.produce_company_id, name : rowData.produce_company})
        // 공정
        formikDetailHook.setFieldValue(`produce_process_id`,  rowData.produce_process_id)
        formikDetailHook.setFieldValue(`produce_process`,     {id : rowData.produce_process_id, name : rowData.produce_process, process_unit : rowData.process_unit})
    }
    // Drawer에서 납품처 선택 후 데이터 fetch
    const setVendorDrawerData = (rowData) => {
        formikDetailHook.setFieldValue(`delivery_produce_company_id`,  rowData.id)
        formikDetailHook.setFieldValue(`delivery_produce_company`,     {id : rowData.id, name : rowData.name})
    }
    // X 버튼 클릭했을 때
    const btnDel = (target) => {
        // 제작처 X
        if (target === 'produce') {
            // 제작처
            formikDetailHook.setFieldValue(`produce_company_id`,  '')
            formikDetailHook.setFieldValue(`produce_company`,     {})
            // 공정
            formikDetailHook.setFieldValue(`produce_process_id`,  '')
            formikDetailHook.setFieldValue(`produce_process`,     {})
        }
        // 납품처 X
        else if (target === 'delivery'){
            formikDetailHook.setFieldValue(`delivery_produce_company_id`,  '')
            formikDetailHook.setFieldValue(`delivery_produce_company`,     {})
        }
    }
    // Table Select Options
    const rowSelection = {
        type : 'radio', 
        selectedRowKeys,
        columnWidth: 0, 
        renderCell: () => <></>,
        onChange: setSelectedRowKeys,
    }
    // selectedRow 에 따라 Index 저장
    React.useEffect(() => {
        setSelectedRowIndex(formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.processings.indexOf(selectedRow))
    }, [selectedRow])
    // 수정/추가/취소 등 버튼 클릭 후 액션
    React.useEffect(() => {
        if (mode === 'view') {
            // 수정완료, 취소, 
            formikDetailHook.setValues(formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].processings[selectedRowIndex])
        }
        else if (mode === 'modify') {
            // target을 해당 메뉴로 잡는다
            providerData.setActiveMenuTarget('postprocess')
        }
        else if (mode === 'create') {
            // 선택된 값 초기화
            setSelectedRowKeys([])
            // 비어있는 초기값을 집어넣어
            formikDetailHook.setValues({})
            // target을 해당 메뉴로 잡는다
            providerData.setActiveMenuTarget('postprocess')
        }
    }, [formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].processings[selectedRowIndex], mode])
    // 다른 메뉴에서 수정/추가 버튼을 클릭했을 때 초기화
    React.useEffect(() => {
        if (providerData.activeMenuTarget !== 'postprocess') {
            setMode('view')
        }
    }, [providerData.activeMenuTarget])
    // 선택한 Row가 달라지면 오른쪽 내용 재구성
    React.useEffect(() => {
        setSelectedRow(formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].processings.filter(row => row.dataIndex == selectedRowKeys[0])[0] ) 
    }, [selectedRowKeys])
    // 제작 수량, 단가 변경 시 공급가 변경
    // 단가 * 제작 수량 => 공급가
    React.useEffect(() => {
        if (formikDetailHook.values.supply_price !== undefined) {
            formikDetailHook.setFieldValue(
                `supply_price`, 
                formikDetailHook.values?.qty * 
                formikDetailHook.values?.price
            )
        }
    }, [formikDetailHook.values?.qty, 
        formikDetailHook.values?.price
    ])
    // 공급가, 부가세(체크) 변경되면 부가세 변경
    // 공급가 * 0.1 => 부가세
    React.useEffect(() => {
        if (formikDetailHook.values.vat !== undefined) {
            if (formikDetailHook.values?.vat_yn == 'Y') formikDetailHook.setFieldValue( `vat`, Math.round( formikDetailHook.values?.supply_price * 0.1 ) )
            else                                        formikDetailHook.setFieldValue( `vat`, 0 )
        }
    }, [formikDetailHook.values?.supply_price, 
        formikDetailHook.values?.vat_yn
    ])
    // 공급가, 부가세 변경되면 합계 변경
    // 공급가 + 부가세 => 합계
    React.useEffect(() => {
        if (formikDetailHook.values.total_amount !== undefined) {
            formikDetailHook.setFieldValue(
                `total_amount`, 
                formikDetailHook.values?.supply_price * 1  + 
                formikDetailHook.values?.vat * 1 
            )
        }
    }, [formikDetailHook.values?.supply_price, 
        formikDetailHook.values?.vat
    ])
    return(
        <Row>
            <FormikProvider value={formikDetailHook}>
                {/* 왼쪽 테이블 영역 */}
                <Col xs={8} lg={8}>
                    <Table 
                        rowKey      = { 'dataIndex' }
                        dataSource  = { providerData.detailRowIndex !== -1 ? formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.processings : [] }
                        columns     = { columns }
                        size        = { 'middle' }
                        bordered    = { true }
                        style       = {{ padding: 0, flex: 1, minHeight : 300}}
                        sticky      = {{ offsetHeader : -20 }}
                        scroll      = {{ x : 800, y: 600}}
                        pagination  = { false }
                        onRow       = {(record) => ({
                            onClick : (event) => { setSelectedRowKeys([record.dataIndex]) }
                        })}
                        rowSelection= { rowSelection }
                    />
                </Col>
                {/* 오른쪽 폼 영역 */}
                <Col xs={16} lg={16} style={{backgroundColor: '#ddd'}}>
                    { (selectedRowIndex !== undefined && selectedRowIndex !== -1) || mode === 'create' ? 
                        <>
                            <Row style={{border: 0}}>
                                <Col xs={3} lg={3} className="label">제작처 <span className="spanStar">*</span></Col>
                                <Col xs={9} lg={9} className="input_box">
                                {
                                    isEmpty(formikDetailHook.values?.produce_company) ? 
                                    (mode === 'create' || mode === 'modify') &&
                                    <Button className="btn btn-primary btn_add" shape="circle" onClick={prdDrawerOpen}>+</Button>
                                    :
                                    <>{formikDetailHook.values?.produce_company?.name} {mode === 'create' || mode === 'modify' ? <Button shape="circle" className="btn_del" onClick={() => btnDel('produce')}>X</Button> : <></>}</>
                                }
                                </Col>
                                <Col xs={3} lg={3} className="label">납품처 <span className="spanStar">*</span></Col>
                                <Col xs={9} lg={9} className="input_box">
                                {
                                    isEmpty(formikDetailHook.values?.delivery_produce_company) ? 
                                    (mode === 'create' || mode === 'modify') &&
                                    <Button className="btn btn-primary btn_add" shape="circle" onClick={vendDrawerOpen}>+</Button>
                                    :
                                    <>{formikDetailHook.values?.delivery_produce_company?.name} {mode === 'create' || mode === 'modify' ? <Button shape="circle" className="btn_del" onClick={() => btnDel('delivery')}>X</Button> : <></>}</>
                                }
                                </Col>
                            </Row>
                            <Row style={{border: 0, marginTop: 10}}>
                                <Col xs={6} lg={3} className="label">공정</Col>
                                <Col xs={6} lg={9} className="input_box">{formikDetailHook.values?.produce_process?.name}</Col>
                                <Col xs={6} lg={3} className="label">단가 기준</Col>
                                <Col xs={6} lg={9} className="input_box">{formikDetailHook.values?.process_unit}</Col>
                                <Col xs={6} lg={3} className="label">인쇄 정미</Col>
                                <Col xs={6} lg={9} className="input_box">{formikDetailHook.values?.jm}</Col>
                                <Col xs={6} lg={3} className="label">후가공 수량 <span className="spanStar">*</span></Col>
                                <Col xs={6} lg={9} className="input_box">{formikDetailHook.values?.qty}</Col>
                            </Row>
                            <Row style={{border: 0}}>
                                <Col xs={6} lg={3} className="label">단가 <span className="spanStar">*</span></Col>
                                <Col xs={6} lg={9} className="input_box"><FormikInput name={`price`} disabled={mode === 'view' ? true : false}/></Col>
                                <Col xs={6} lg={3} className="label">공급가</Col>
                                <Col xs={6} lg={9} className="input_box">{formikDetailHook.values?.supply_price}</Col>
                                <Col xs={6} lg={3} className="label">부가세 <FormikInput name={`vat_yn`} type='checkbox' data={{checkboxData : [{values : 'Y'}]}} disabled={mode === 'view' ? true : false}/></Col>
                                <Col xs={6} lg={9} className="input_box"><FormikInput name={`vat`} disabled={mode === 'view' ? true : false}/></Col>
                                <Col xs={6} lg={3} className="label">합계</Col>
                                <Col xs={6} lg={9} className="input_box">{formikDetailHook.values?.total_amount}</Col>
                            </Row>
                            <Row style={{border: 0, marginTop: 10}}>
                                <Col xs={6} lg={3} className="label">전달 사항</Col>
                                <Col xs={18} lg={21} className="input_box"><FormikInput type={'textarea'} name={`memo`} disabled={mode === 'view' ? true : false}/></Col>
                            </Row>
                            <Row style={{border: 0, margin: '10px 0'}}>
                                <Col xs={6} lg={3} className="label">비용 귀속일</Col>
                                <Col xs={18} lg={21} className="input_box"><FormikInput type={'datepicker'} name={`cost_attribution_date`} disabled={mode === 'view' ? true : false}/></Col>
                            </Row>
                            
                            {providerData.viewType !== 'view' &&
                            <Row gutter={[10, 10]} justify="center" style={{border: 0, marginTop: 20 }}>
                                { providerData.detailRowIndex === -1 && mode !== 'create' ?
                                    <Button type="primary" htmlType="button" style={{padding: '4px 15px'}} onClick={() => setMode('create')}>추가</Button>
                                : 
                                    mode === 'view' ? 
                                    <>
                                        <Button type="primary" htmlType="button" style={{marginLeft: 10, padding: '4px 15px'}} onClick={() => setMode('create')}>추가</Button>
                                        <Button type="primary" htmlType="button" style={{marginLeft: 10, padding: '4px 15px'}} onClick={() => setMode('modify')}>수정</Button>
                                        <Button danger htmlType="button" style={{marginLeft: 10, padding: '4px 15px'}} onClick={onDelete}>삭제</Button>
                                    </>
                                    :
                                    <>
                                        <Button type="primary" htmlType="button" style={{marginLeft: 10, padding: '4px 15px'}} onClick={formikDetailHook.handleSubmit}>확인</Button>
                                        <Button type="primary" htmlType="button" style={{marginLeft: 10, padding: '4px 15px'}} onClick={() => setMode('view')}>취소</Button>
                                    </>
                                }
                            </Row>
                            }
                        </>
                    :    
                        providerData.viewType !== 'view' &&
                        <Row gutter={[10, 10]} justify="center" style={{border: 0, marginTop: 20 }}>
                            <Button type='primary' htmlType="button" style={{marginLeft: 10, padding: '4px 15px', backgroundColor: '#fff'}} onClick={() => setMode('create')}>추가</Button>
                        </Row>
                    }
                </Col>
                {prdDrawer ? <PrdPostprocess viewVisible={prdDrawer}  visibleClose={prdDrawerClose}  setProcessingDrawerData={setProcessingDrawerData}  /> : ''}
                {vendDrawer ? <Vendor        viewVisible={vendDrawer} visibleClose={vendDrawerClose} setVendorDrawerData={setVendorDrawerData}          drawerVendorTarget={'postprocess'} produceTargetId={formikDetailHook.values.produce_company_id}/> : ''}
            </FormikProvider>
        </Row>
    )
}

export default Postprocess