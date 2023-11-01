import React from 'react'
import { Row, Col, Button, Checkbox, DatePicker, Table, Modal } from 'antd'
import { FormikContext, FormikProvider, useFormik } from 'formik';
import FormikInput from '@components/form/CustomInput';
import PrdInsert from './prdDrawer/insert' // 부속제작 제작처(공정) 검색
import Vendor from './vendorDrawer/index'  // 납품처 검색
import { PaperBookContext } from '..';
import { isEmpty, moneyComma } from '@components/Common/Js';

const Insert = () => {
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
    const initialValues = {
        produce_company_id : null, 
        delivery_produce_company_id : null, 
        produce_process_id : null, 
        process_unit : 0, 
        need_qty : 0, 
        spare : 0, 
        production_qty : 0, 
        price : 0, 
        supply_price : 0, 
        vat : 0, 
        vat_yn : "N", 
        total_amount : 0, 
        memo : "", 
        produce_company : {}, 
        delivery_produce_company : {}, 
        produce_process : {} 
    }
    // const validationSchema = {}
    const onSubmit = (submitData) => {
        // 기본 구성 입력 값을 전체 데이터에 추가/수정한다.
        var targetIndex = 0
        // 수정인지 추가인지 확인
        // 추가라면
        if ( mode === 'create' ) {
            // details가 배열인지 확인 (초기 값이 없을 수 있음)
            if (Array.isArray(formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].accessories)) {
                // 있으면 Index 추가
                targetIndex = formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].accessories.length
            }
            else {
                // 초기 값이 없으면
                targetIndex = 0
            }
            // dataIndex 입력
            formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.accessories.${targetIndex}.dataIndex`,               providerData.dataIndexs?.accessory?.current)
        }
        // 수정이면
        else {
            // 목록에 선택되어 있는 index 지정
            targetIndex = selectedRowIndex
        }
        // 제작처
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.accessories.${targetIndex}.produce_company`,             submitData.produce_company)
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.accessories.${targetIndex}.produce_company_id`,          submitData.produce_company_id)
        // 납품처
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.accessories.${targetIndex}.delivery_produce_company`,    submitData.delivery_produce_company)
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.accessories.${targetIndex}.delivery_produce_company_id`, submitData.delivery_produce_company_id)
        // 공정 ID
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.accessories.${targetIndex}.produce_process`,             submitData.produce_process)
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.accessories.${targetIndex}.produce_process_id`,          submitData.produce_process_id)
        // 단가 기준 
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.accessories.${targetIndex}.process_unit`,                submitData.process_unit)
        // 필요 수량 
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.accessories.${targetIndex}.need_qty`,                    submitData.need_qty)
        // 여분 
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.accessories.${targetIndex}.spare`,                       submitData.spare)
        // 제작 수량 
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.accessories.${targetIndex}.production_qty`,              submitData.production_qty)
        // 단가
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.accessories.${targetIndex}.price`,                       submitData.price)
        // 공급가
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.accessories.${targetIndex}.supply_price`,                submitData.supply_price)
        // 부가세
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.accessories.${targetIndex}.vat`,                         submitData.vat)
        //부가세 체크 (Y, N)
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.accessories.${targetIndex}.vat_yn`,                      submitData.vat_yn)
        // 합계
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.accessories.${targetIndex}.total_amount`,                submitData.total_amount)
        // 전달 사항 
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.accessories.${targetIndex}.memo`,                        submitData.memo)
        // 비용 귀속일 
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.accessories.${targetIndex}.cost_attribution_date`,       submitData.cost_attribution_date)
        // 추가인 경우 추가된 Row가 선택된 상태로 전환
        if ( mode === 'create' ) {
            setSelectedRowKeys([providerData.dataIndexs.prepress.current])
        }
        // 보기 화면으로 전환
        setMode('view')
        providerData.dataIndexs.prepress.current++
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
                formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.accessories`, formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].accessories.filter((row, index) => index !== selectedRowIndex))
            }
        })
    }
    // formik Hook 선언
    const formikDetailHook = useFormik({ initialValues, onSubmit })
    // Table Select Options
    const columns = [{
        dataIndex : ["produce_process", "name"], 
        title : '공정', 
        width : 150, 
    }, {
        dataIndex : "production_qty", 
        title : '작업 수량', 
        width : 100, 
        align : "right"
    }, {
        dataIndex : "price", 
        title : '단가', 
        width : 120,  
        align : "right", 
        render: text => moneyComma(text)
    }, {
        dataIndex : "total_amount", 
        title : '합계', 
        width : 120, 
        align : "right", 
        render: text => moneyComma(text)
    }, {
        dataIndex : ["produce_company", "name"], 
        title : '제작처', 
        width : 120, 
    }, {
        dataIndex : ["delivery_produce_company", "name"], 
        title : '납품처', 
        minWidth : 120
    }, {
        dataIndex : "cost_attribution_date", 
        title : '비용 귀속일', 
        width : 120, 
    }]
    // Drawer Open/Close
    const prdDrawerOpen = () => setPrdDrawer(true);
    const prdDrawerClose = () => setPrdDrawer(false);
    const vendDrawerOpen = () => setVendDrawer(true);
    const vendDrawerClose = () => setVendDrawer(false);
    // Drawer에서 제작처 선택 후 데이터 fetch
    const setInsertDrawerData = (rowData) => {
        // 제작처
        formikDetailHook.setFieldValue(`produce_company_id`,  rowData.produce_company_id)
        formikDetailHook.setFieldValue(`produce_company`,     {id : rowData.produce_company_id, name : rowData.produce_company})
        // 공정
        formikDetailHook.setFieldValue(`produce_process_id`,  rowData.produce_process_id)
        formikDetailHook.setFieldValue(`produce_process`,     {id : rowData.produce_process_id, name : rowData.produce_process, process_unit : rowData.produce_process_unit})
    }
    // Drawer에서 납품처 선택 후 데이터 fetch
    const setVendorDrawerData = (rowData) => {
        formikDetailHook.setFieldValue(`delivery_produce_company_id`,  rowData.delivery_produce_company_id)
        formikDetailHook.setFieldValue(`delivery_produce_company`,     {id : rowData.delivery_produce_company_id, name : rowData.delivery_produce_company})
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
            // 단가 기준
            formikDetailHook.setFieldValue(`produce_process_unit`, '')
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
        setSelectedRowIndex(formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.accessories.indexOf(selectedRow))
    }, [selectedRow])
    // 수정/추가/취소 등 버튼 클릭 후 액션
    React.useEffect(() => {
        if (mode === 'view') {
            // 수정완료, 취소, 
            if (selectedRowIndex !== -1) {
                formikDetailHook.setValues(formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].accessories[selectedRowIndex])
            }
        }
        else if (mode === 'modify') {
            // target을 해당 메뉴로 잡는다
            providerData.setActiveMenuTarget('accessory')
        }
        else if (mode === 'create') {
            // 선택된 값 초기화
            setSelectedRowKeys([])
            // 비어있는 초기값을 집어넣어
            formikDetailHook.setValues(initialValues)
            // 종이 대수 값은 집어넣어야 해 (useEffect 작동을 위해)
            // formikDetailHook.setFieldValue(
            //     'ds', 
            //     formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.page_number / 
            //     formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.main_outside / 
            //     2 
            // )
            // target을 해당 메뉴로 잡는다
            providerData.setActiveMenuTarget('accessory')
        }
    }, [formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].accessories[selectedRowIndex], mode])
    // 다른 메뉴에서 수정/추가 버튼을 클릭했을 때 초기화
    React.useEffect(() => {
        if (providerData.activeMenuTarget !== 'accessory') {
            setMode('view')
        }
    }, [providerData.activeMenuTarget])
    // 선택한 Row가 달라지면 오른쪽 내용 재구성
    React.useEffect(() => {
        if (formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].accessories.filter(row => row.dataIndex == selectedRowKeys[0])[0] !== undefined ) {
            setSelectedRow(formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].accessories.filter(row => row.dataIndex == selectedRowKeys[0])[0] ) 
        }
        else {
            setSelectedRow(initialValues)
        }
    }, [selectedRowKeys])
    // 필요 수량 + 여분 => 제작 수량
    React.useEffect(() => {
        formikDetailHook.setFieldValue('production_qty', (formikDetailHook.values?.need_qty * 1)  + (formikDetailHook.values?.spare * 1))
    }, [formikDetailHook.values?.need_qty, formikDetailHook.values?.spare])
    // 제작 수량 * 단가 => 공급가
    React.useEffect(() => {
        formikDetailHook.setFieldValue('supply_price', formikDetailHook.values?.production_qty * formikDetailHook.values?.price)
    }, [formikDetailHook.values?.production_qty, formikDetailHook.values?.price])
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
            <FormikProvider value={formikDetailHook}>
                {/* 왼쪽 테이블 영역 */}
                <Col xs={8} lg={8}>
                    <Table 
                        rowKey      = { 'dataIndex' }
                        dataSource  = { providerData.detailRowIndex !== -1 ? formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.accessories : [] }
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
                <Col xs={16} lg={16} style={{backgroundColor: '#ddd'}}>
                    {(selectedRowIndex !== undefined && selectedRowIndex !== -1) || mode === 'create' ? 
                        <>
                            <Row style={{border: 0}}>
                                <Col xs={3} lg={3} className="label">제작처 <span className="spanStar">*</span></Col>
                                <Col xs={9} lg={9} className="input_box">
                                {   
                                    isEmpty(formikDetailHook.values?.produce_company) ? 
                                    (mode === 'create' || mode === 'modify') ?
                                    <Button className="btn btn-primary btn_add" shape="circle" onClick={prdDrawerOpen}>+</Button> : <></>
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
                                <Col xs={3} lg={3} className="label">공정</Col>
                                <Col xs={21} lg={21} className="input_box">{formikDetailHook.values?.produce_process?.name}</Col>
                            </Row>
                            <Row style={{border: 0}}>
                                <Col xs={6} lg={3} className="label">단가 기준</Col>
                                <Col xs={6} lg={3} className="input_box">{formikDetailHook.values?.produce_process?.process_unit}</Col>
                                <Col xs={6} lg={3} className="label">필요 수량</Col>
                                <Col xs={6} lg={3} className="input_box"><FormikInput name={`need_qty`} disabled={mode === 'view' ? true : false}/></Col>
                                <Col xs={6} lg={3} className="label">여분</Col>
                                <Col xs={6} lg={3} className="input_box">{formikDetailHook.values?.spare}</Col>
                                <Col xs={6} lg={3} className="label">제작 수량</Col>
                                <Col xs={6} lg={3} className="input_box">{formikDetailHook.values?.production_qty}</Col>
                                <Col xs={3} lg={3} className="label">단가 <span className="spanStar">*</span></Col>
                                <Col xs={9} lg={3} className="input_box"><FormikInput name={`price`} disabled={mode === 'view' ? true : false}/></Col>
                                <Col xs={3} lg={3} className="label">공급가</Col>
                                <Col xs={9} lg={3} className="input_box">{moneyComma(formikDetailHook.values?.supply_price)}</Col>
                                <Col xs={3} lg={3} className="label">부가세 <FormikInput type={'checkbox'} name={`vat_yn`} style={{marginLeft : 5}} data={{checkboxData : [{value : 'Y'}]}} disabled={mode === 'view' ? true : false}/></Col>
                                <Col xs={9} lg={3} className="input_box"><FormikInput name={`vat`} disabled={mode === 'view' ? true : false}/></Col>
                                <Col xs={3} lg={3} className="label">합계</Col>
                                <Col xs={9} lg={3} className="input_box">{moneyComma(formikDetailHook.values?.total_amount)}</Col>
                            </Row>

                            <Row style={{border: 0, margin: '10px 0'}}>
                                <Col xs={3} lg={3} className="label">전달 사항</Col>
                                <Col xs={9} lg={21} className="input_box"><FormikInput type={'textarea'} name={`memo`}/></Col>
                            </Row>
                            <Row style={{border: 0}}>
                                <Col xs={3} lg={3} className="label">비용 귀속일</Col>
                                <Col xs={9} lg={3} className="input_box"><FormikInput type={'datepicker'} name={`cost_attribution_date`} disabled={mode === 'view' ? true : false}/></Col>
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
            </FormikProvider>
            {/* Drawer Side */}
            {prdDrawer  ? <PrdInsert viewVisible={prdDrawer}    visibleClose={prdDrawerClose}  setInsertDrawerData={setInsertDrawerData} /> : ''}
            {vendDrawer ? <Vendor    viewVisible={vendDrawer}   visibleClose={vendDrawerClose} setVendorDrawerData={setVendorDrawerData} drawerVendorTarget={'insert'}/> : ''}
        </Row>
    )
}

export default Insert