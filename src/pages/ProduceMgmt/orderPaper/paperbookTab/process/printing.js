import React from 'react'
import { Row, Col, Button, Checkbox, DatePicker, Table, Modal } from 'antd'
import { FormikContext, FormikProvider, useFormik } from 'formik';
import FormikInput          from '@components/form/CustomInput';
import { PaperBookContext } from '..';
import PrdPrinting          from './prdDrawer/printing' // printing제작처(공정) 검색
import PrdPrintingPlate     from './prdDrawer/printingPlate' // printingPlate 제작처(공정) 검색
import Vendor               from './vendorDrawer/index'  // 납품처 검색
import { isEmpty, moneyComma } from '@components/Common/Js';

const Printing = () => {
    const formikHook    = React.useContext(FormikContext)
    const providerData  = React.useContext(PaperBookContext)
    // 추가/수정/보기 상태, create/modify/view
    const [targetType,       setTargetType       ] = React.useState(1)
    const [mode,             setMode             ] = React.useState('view')
    const [selectedRow,      setSelectedRow      ] = React.useState({})
    const [selectedRowIndex, setSelectedRowIndex ] = React.useState(-1)
    const [selectedRowKeys,  setSelectedRowKeys  ] = React.useState([])
    const [prdDrawer,        setPrdDrawer        ] = React.useState(false)
    const [vendDrawer,       setVendDrawer       ] = React.useState(false)
    const [prdPlateDrawer,   setPrdPlateDrawer   ] = React.useState(false)
    // formik 기본 값 Not necessary
    const initialValues = {
        type : 1, 
        ds : 0, 
        jm_hook : 0, 
        print_qty : 0, 
        price : 0, 
        supply_price : 0, 
        vat : 0, 
        vat_yn : 0, 
        total_amount : 0, 
        memo : '', 
        printable_id : null, 
        produce_company_id : null, 
        produce_company : 0, 
        delivery_produce_company_id : null, 
        delivery_produce_company : 0, 
    }
    // const validationSchema = {}
    const onSubmit = submitData => {
        // 기본 구성 입력 값을 전체 데이터에 추가/수정한다.
        var targetIndex = 0
        // 수정인지 추가인지 확인
        // 추가라면
        if ( mode === 'create' ) {
            // details가 배열인지 확인 (초기 값이 없을 수 있음)
            if (Array.isArray(formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].prints)) {
                // 있으면 Index 추가
                targetIndex = formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].prints.length
            }
            else {
                // 초기 값이 없으면
                targetIndex = 0
            }
            // dataIndex 입력
            formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.prints.${targetIndex}.dataIndex`,               providerData.dataIndexs?.print?.current)
        }
        // 수정이면
        else {
            // 목록에 선택되어 있는 index 지정
            targetIndex = selectedRowIndex
        }
        // 제작처
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.prints.${targetIndex}.produce_company`,             submitData.produce_company)
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.prints.${targetIndex}.produce_company_id`,          submitData.produce_company_id)
        // 납품처
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.prints.${targetIndex}.delivery_produce_company`,    submitData.delivery_produce_company)
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.prints.${targetIndex}.delivery_produce_company_id`, submitData.delivery_produce_company_id)
        // 공정
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.prints.${targetIndex}.produce_process`,             submitData.produce_process)
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.prints.${targetIndex}.produce_process_id`,          submitData.produce_process_id)
        // 인쇄 대수/인쇄판 대수
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.prints.${targetIndex}.ds`,                          submitData.ds)
        // 인쇄 정미/같이 걸이
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.prints.${targetIndex}.jm_hook`,                     submitData.jm_hook)
        // 인쇄 수량/인쇄판 수량
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.prints.${targetIndex}.print_qty`,                   submitData.print_qty)
        // 단가
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.prints.${targetIndex}.price`,                       submitData.price)
        // 공급가
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.prints.${targetIndex}.supply_price`,                submitData.supply_price)
        // 부가세
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.prints.${targetIndex}.vat`,                         submitData.vat)
        //부가세 체크 (Y, N)
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.prints.${targetIndex}.vat_yn`,                      submitData.vat_yn)
        // 합계
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.prints.${targetIndex}.total_amount`,                submitData.total_amount)
        // 전달 사항
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.prints.${targetIndex}.memo`,                        submitData.memo)
        // 비용 귀속일
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.prepresses.${targetIndex}.cost_attribution_date`,       submitData.cost_attribution_date)
        // 추가인 경우 추가된 Row가 선택된 상태로 전환
        if ( mode === 'create' ) {
            setSelectedRowKeys([providerData.dataIndexs.print.current])
        }
        // 보기 화면으로 전환
        setMode('view')
        providerData.dataIndexs.print.current++
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
                formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.prints`, formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].prints.filter((row, index) => index !== selectedRowIndex))
            }
        })
    }
    // formik Hook 선언
    const formikDetailHook = useFormik({ initialValues, onSubmit })
    // Table Select Options
    const columns = [{
        dataIndex : "Composition", 
        title : "세부 구성", 
        width : 100,
        render : () => (
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
        dataIndex   : "type", 
        title       : "공정", 
        width       : 80,
        render      : (text, record, index) => (
            <>
                {record.type == 1 ? 
                    '인쇄'
                    :
                    '인쇄판'
                }
            </>
        )
    }, {
        dataIndex   : "ds", 
        title       : "인쇄(판) 대수", 
        width       : 120, 
        align       : "right", 
        render      : text => moneyComma(Math.round(text))
    }, {
        dataIndex   : "jm_hook", 
        title       : "인쇄 정미", 
        width       : 100, 
        align       : "right", 
        render      : text => moneyComma(Math.round(text))
    }, {
        dataIndex   : "print_qty", 
        title       : "인쇄(판) 수량", 
        width       : 120, 
        align       : "right", 
        render      : text => moneyComma(Math.round(text))
    }, {
        dataIndex   : "price", 
        title       : "단가", 
        width       : 120, 
        align       : "right", 
    }, {
        dataIndex   : "total_amount", 
        title       : "합계", 
        width       : 120, 
        align       : "right", 
        render      : text => moneyComma(Math.round(text))
    }, {
        dataIndex   : "printable_id", 
        title       : "제작처", 
        width       : 120,
        render      : (text, record, index) => <>{record?.produce_company?.name}</>
    }, {
        dataIndex   : "produce_company_id",
        title       : "납품처", 
        width       : 120,
        render      : (text, record, index) => <>{record?.delivery_produce_company?.name}</>
    }, {
        dataIndex   : "cost_attribution_date", 
        title       : "비용 귀속일", 
        width       : 120,
    }]
    // Drawer Open/Close
    const prdDrawerOpen = () => setPrdDrawer(true)
    const prdDrawerClose = () => setPrdDrawer(false)
    const vendDrawerOpen = () => setVendDrawer(true)
    const vendDrawerClose = () => setVendDrawer(false)
    const prdPlateDrawerOpen = () => setPrdPlateDrawer(true)
    const prdPlateDrawerClose = () => setPrdPlateDrawer(false)
    // Drawer에서 제작처 선택 후 데이터 fetch
    const setPrintDrawerData = (rowData) => {
        // 제작처
        formikDetailHook.setFieldValue(`produce_company_id`,  rowData.produce_company_id)
        formikDetailHook.setFieldValue(`produce_company`,     {id : rowData.produce_company_id, name : rowData.produce_company})
        formikDetailHook.setFieldValue(`price`,               rowData.price)
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
        }
        // 납품처 X
        else if (target === 'delivery'){
            // 납품처
            formikDetailHook.setFieldValue(`delivery_produce_company_id`,  '')
            formikDetailHook.setFieldValue(`delivery_produce_company`,     {})
        }
    }
    // Table Select Options
    const rowSelection = {
        type : 'radio', 
        selectedRowKeys,
        columnWidth : 0, 
        renderCell: () => <></>,
        onChange: setSelectedRowKeys,
    }
    // selectedRow 에 따라 Index 저장
    React.useEffect(() => {
        setSelectedRowIndex(formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints.indexOf(selectedRow))
    }, [selectedRow])
    // 수정/추가/취소 등 버튼 클릭 후 액션
    React.useEffect(() => {
        if (mode === 'view') {
            // 수정완료, 취소, 
            if (selectedRowIndex !== -1) {
                formikDetailHook.setValues(formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].prints[selectedRowIndex])
            }
        }
        else if (mode === 'modify') {
            // target을 해당 메뉴로 잡는다
            providerData.setActiveMenuTarget('printing')
        }
        else if (mode === 'create') {
            // 선택된 값 초기화
            setSelectedRowKeys([])
            // 비어있는 초기값을 집어넣어
            formikDetailHook.setValues(initialValues)
            // 인쇄인지 인쇄판인지 집어넣는다. 
            formikDetailHook.setFieldValue('type', targetType)
            // 인쇄 대수 값은 집어넣어야 해 (useEffect 작동을 위해)
            formikDetailHook.setFieldValue(
                'ds', 
                formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.page_number / 
                formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.main_outside / 
                2 
            )
            // target을 해당 메뉴로 잡는다
            providerData.setActiveMenuTarget('printing')
        }
    }, [formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].prints[selectedRowIndex], mode])
    // 다른 메뉴에서 수정/추가 버튼을 클릭했을 때 초기화
    React.useEffect(() => {
        if (providerData.activeMenuTarget !== 'printing') {
            setMode('view')
        }
    }, [providerData.activeMenuTarget])
    // 선택한 Row가 달라지면 오른쪽 내용 재구성
    React.useEffect(() => {
        setSelectedRow(formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].prints.filter(row => row.dataIndex == selectedRowKeys[0])[0] ) 
    }, [selectedRowKeys])
    // 인쇄 대수 변경되면 인쇄 정미 변경
    // 인쇄 대수 * 발주 수량 / 500 => 인쇄 정미
    React.useEffect(() => {
        console.log("is it run??")
        formikDetailHook.setFieldValue(
            `jm_hook`, 
            formikDetailHook.values?.ds * 
            formikHook.values?.product_qty / 
            500
        )
    }, [formikDetailHook.values?.ds])
    // 인쇄 정미 변경되면 인쇄 수량 변경
    // 인쇄 정미 * 적용 도수 (앞 + 뒷) => 인쇄 수량
    // 인쇄판이라면 + 같이걸이
    React.useEffect(() => {
        formikDetailHook.setFieldValue(
            `print_qty`, 
            formikDetailHook.values?.jm_hook * (
                formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.front_cmyk * 1 + 
                formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.back_cmyk * 1
            )
        )
    }, [formikDetailHook.values?.jm_hook])
    // 종이 수량, 단가 변경 시 공급가 변경
    // 단가 * 인쇄 수량 => 공급가
    React.useEffect(() => {
        formikDetailHook.setFieldValue(
            `supply_price`, 
            formikDetailHook.values?.print_qty * 
            formikDetailHook.values?.price
        )
    }, [formikDetailHook.values?.print_qty, 
        formikDetailHook.values?.price
    ])
    // 공급가, 부가세(체크) 변경되면 부가세 변경
    // 공급가 * 0.1 => 부가세
    React.useEffect(() => {
        if (formikDetailHook.values?.vat_yn == 'Y') formikDetailHook.setFieldValue( `vat`, Math.round( formikDetailHook.values?.supply_price * 0.1 ) )
        else                                        formikDetailHook.setFieldValue( `vat`, 0 )
    }, [formikDetailHook.values?.supply_price, 
        formikDetailHook.values?.vat_yn
    ])
    // 공급가, 부가세 변경되면 합계 변경
    // 공급가 + 부가세 => 합계
    React.useEffect(() => {
        formikDetailHook.setFieldValue(
            `total_amount`, 
            formikDetailHook.values?.supply_price * 1  + 
            formikDetailHook.values?.vat * 1 
        )
    }, [formikDetailHook.values?.supply_price, 
        formikDetailHook.values?.vat
    ])
    return(
        <Row>
            {/* 왼쪽 테이블 영역 */}
            <Col xs={8} lg={8}>
                <Table
                    rowKey      = { 'dataIndex' }
                    dataSource  = { providerData.detailRowIndex !== -1 ? 
                        formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints 
                        : 
                        [] 
                    }
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
            <FormikProvider value={formikDetailHook}>
                <Col xs={16} lg={16} style={{backgroundColor: '#ddd'}}>
                    {(selectedRowIndex !== undefined && selectedRowIndex !== -1) || mode === 'create' ? 
                        <>
                            <Row style={{border: 0}}>
                                <Col xs={3} lg={3} className="label">제작처 <span className="spanStar">*</span></Col>
                                <Col xs={9} lg={9} className="input_box">
                                {
                                    isEmpty(formikDetailHook.values?.produce_company) ? 
                                    (mode === 'create' || mode === 'modify') &&
                                    <Button className="btn btn-primary btn_add" shape="circle" onClick={ formikDetailHook.values?.type === 1 ? prdDrawerOpen : prdPlateDrawerOpen}>+</Button>
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

                            {formikDetailHook.values?.type === 1 ? 
                                <Row style={{border: 0, margin: '10px 0'}}>
                                    <Col xs={3} lg={3} className="label">인쇄 완료<br/>요청일 <span className="spanStar">*</span></Col>
                                    <Col xs={9} lg={9} className="input_box"><DatePicker /></Col>
                                    <Col xs={3} lg={3} className="label">인쇄 대수</Col>
                                    <Col xs={9} lg={9} className="input_box">{moneyComma(Math.round(formikDetailHook.values?.ds))}</Col>
                                    <Col xs={3} lg={3} className="label">인쇄 정미</Col>
                                    <Col xs={9} lg={9} className="input_box">{moneyComma(Math.round(formikDetailHook.values?.jm_hook))}</Col>
                                    <Col xs={3} lg={3} className="label">인쇄 수량</Col>
                                    <Col xs={9} lg={9} className="input_box">{moneyComma(Math.round(formikDetailHook.values?.print_qty))}</Col>
                                </Row>
                                : 
                                <Row style={{border: 0, margin: '10px 0'}}>
                                    <Col xs={3} lg={3} className="label">인쇄판 대수</Col>
                                    <Col xs={9} lg={9} className="input_box">{moneyComma(Math.round(formikDetailHook.values?.ds))}</Col>
                                    <Col xs={3} lg={3} className="label">같이걸이</Col>
                                    <Col xs={9} lg={9} className="input_box">{moneyComma(Math.round(formikDetailHook.values?.jm_hook))}</Col>
                                    <Col xs={3} lg={3} className="label">인쇄판 수량</Col>
                                    <Col xs={9} lg={21} className="input_box">{moneyComma(Math.round(formikDetailHook.values?.print_qty))}</Col>
                                </Row>
                            }
                            <Row style={{border: 0}}>
                                <Col xs={3} lg={3} className="label">단가 <span className="spanStar">*</span></Col>
                                <Col xs={9} lg={9} className="input_box"><FormikInput name={`price`} disabled={mode === 'view' ? true : false}/></Col>
                                <Col xs={3} lg={3} className="label">공급가</Col>
                                <Col xs={9} lg={9} className="input_box">{moneyComma(Math.round(formikDetailHook.values?.supply_price))}</Col>
                                <Col xs={3} lg={3} className="label">부가세 <FormikInput type={'checkbox'} name={`vat_yn`} style={{marginLeft : 5}} data={{checkboxData : [{value : 'Y'}]}} disabled={mode === 'view' ? true : false}/></Col>
                                <Col xs={9} lg={9} className="input_box"><FormikInput name={`vat`} disabled={mode === 'view' ? true : false}/></Col>
                                <Col xs={3} lg={3} className="label">합계</Col>
                                <Col xs={9} lg={9} className="input_box">{moneyComma(Math.round(formikDetailHook.values?.total_amount))}</Col>
                            </Row>
                            <Row style={{border: 0}}>
                                <Col xs={3} lg={3} className="label">전달 사항</Col>
                                <Col xs={9} lg={21} className="input_box"><FormikInput type={'textarea'} name={`memo`} disabled={mode === 'view' ? true : false}/></Col>
                            </Row>
                            <Row style={{border: 0, margin: '10px 0'}}>
                                <Col xs={3} lg={3} className="label">비용 귀속일</Col>
                                <Col xs={9} lg={21} className="input_box"><FormikInput type={'datepicker'} name={`cost_attribution_date`} disabled={mode === 'view' ? true : false}/></Col>
                            </Row>
                            
                            {providerData.viewType !== 'view' &&
                            <Row gutter={[10, 10]} justify="center" style={{border: 0, marginTop: 20 }}>
                                {
                                mode === 'view' ? 
                                <>
                                    <Button type="primary" htmlType="button" style={{padding: '4px 15px'}}                 onClick={() => {setMode('create'); setTargetType(1)}}>인쇄 추가</Button>
                                    <Button type="primary" htmlType="button" style={{marginLeft: 10, padding: '4px 15px'}} onClick={() => {setMode('create'); setTargetType(2)}}>인쇄판 추가</Button>
                                    <Button type="primary" htmlType="button" style={{marginLeft: 10, padding: '4px 15px'}} onClick={() => setMode('modify')}>수정</Button>
                                    <Button danger         htmlType="button" style={{marginLeft: 10, padding: '4px 15px'}} onClick={() => onDelete()}>삭제</Button>
                                </>
                                :
                                <>
                                    <Button type="primary" htmlType="button" style={{padding: '4px 15px'}} onClick={formikDetailHook.handleSubmit}>확인</Button>
                                    <Button type="primary" htmlType="button" style={{marginLeft: 10, padding: '4px 15px'}} onClick={() => setMode('view')}>취소</Button>
                                </>
                                }
                            </Row>
                            }
                        </>
                    :
                        providerData.viewType !== 'view' &&
                        <Row gutter={[10, 10]} justify="center" style={{border: 0, marginTop: 20 }}>
                            <Button type="primary" htmlType="button" style={{padding: '4px 15px'}}                 onClick={() => {setMode('create'); setTargetType(1)}}>인쇄 추가</Button>
                            <Button type="primary" htmlType="button" style={{marginLeft: 10, padding: '4px 15px'}} onClick={() => {setMode('create'); setTargetType(2)}}>인쇄판 추가</Button>
                        </Row>
                    }
                </Col>
            </FormikProvider>
            {/* Drawer Side */}
            {prdDrawer      ? <PrdPrinting      viewVisible={prdDrawer}      visibleClose={prdDrawerClose}      setPrintDrawerData={setPrintDrawerData}/> : ''}
            {prdPlateDrawer ? <PrdPrintingPlate viewVisible={prdPlateDrawer} visibleClose={prdPlateDrawerClose} setPrintDrawerData={setPrintDrawerData}/> : ''}
            {vendDrawer     ? <Vendor           viewVisible={vendDrawer}     visibleClose={vendDrawerClose}     setVendorDrawerData={setVendorDrawerData} drawerVendorTarget={'printing'} produceTargetId={formikDetailHook.values.produce_company_id}/> : ''}
        </Row>
    )
}

export default Printing;