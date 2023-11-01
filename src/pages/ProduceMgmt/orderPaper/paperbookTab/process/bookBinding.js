import React from 'react'
import { Row, Col, Button, DatePicker, Table, Modal, Typography } from 'antd'
import FormikInput from '@components/form/CustomInput';
import PrdBookBinding from './prdDrawer/bookBinding' // 제본 제작처(공정) 검색
import PrdBookBindingProcess from './prdDrawer/bookBindingAdd' // 제본 추가 작업 제작체(공정) 검색
import Vendor from './vendorDrawer/index'  // 납품처 검색
import { FormikContext, FormikProvider, useFormik } from 'formik';
import { PaperBookContext } from '..';
import { isEmpty, moneyComma } from '@components/Common/Js';

const BookBinding = () => {
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
        binding_attacheds           : [], 
        delivery_produce_company_id : null,
        produce_company_id          : null,
        produce_process_id          : null,
        delivery_produce_company    : {}, 
        produce_company             : {}, 
        produce_process             : {}, 
        page_number_sum             : 0,
        price                       : 0,
        supply_price                : 0,
        vat                         : 0,
        vat_yn                      : 'Y',
        total_amount                : 0,
        memo                        : ''
    }
    // const validationSchema = {}
    const onSubmit = (submitData) => {
        // 기본 구성 입력 값을 전체 데이터에 추가/수정한다.
        var targetIndex = 0
        // 수정인지 추가인지 확인
        // 추가라면
        if ( mode === 'create' ) {
            // details가 배열인지 확인 (초기 값이 없을 수 있음)
            if (Array.isArray(formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].bindings)) {
                // 있으면 Index 추가
                targetIndex = formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].bindings.length
            }
            else {
                // 초기 값이 없으면
                targetIndex = 0
            }
            // dataIndex 입력
            formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.bindings.${targetIndex}.dataIndex`, providerData.dataIndexs?.binding?.current)
        }
        // 수정이면
        else {
            // 목록에 선택되어 있는 index 지정
            targetIndex = selectedRowIndex
        }
        // 제작처
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.bindings.${targetIndex}.produce_company_id`, submitData.produce_company_id)
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.bindings.${targetIndex}.produce_company`, submitData.produce_company)
        // 납품처
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.bindings.${targetIndex}.delivery_produce_company_id`, submitData.delivery_produce_company_id)
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.bindings.${targetIndex}.delivery_produce_company`, submitData.delivery_produce_company)
        // 공정
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.bindings.${targetIndex}.produce_process_id`, submitData.produce_process_id)
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.bindings.${targetIndex}.produce_process`, submitData.produce_process)
        // 쪽수 합계
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.bindings.${targetIndex}.page_number_sum`, submitData.page_number_sum)
        // 단가
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.bindings.${targetIndex}.price`, submitData.price)
        // 공급가
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.bindings.${targetIndex}.supply_price`, submitData.supply_price)
        // 부가세
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.bindings.${targetIndex}.vat`, submitData.vat)
        //부가세 체크 (Y, N)
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.bindings.${targetIndex}.vat_yn`, submitData.vat_yn)
        // 합계
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.bindings.${targetIndex}.total_amount`, submitData.total_amount)
        // 제본 추가작업
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.bindings.${targetIndex}.binding_attacheds`, submitData.binding_attacheds)
        // 전달 사항
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.bindings.${targetIndex}.memo`, submitData.memo)// 비용 귀속일
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.prepresses.${targetIndex}.cost_attribution_date`,       submitData.cost_attribution_date)
        // 추가인 경우 추가된 Row가 선택된 상태로 전환
        if ( mode === 'create' ) {
            setSelectedRowKeys([providerData.dataIndexs.binding.current])
        }
        // 보기 화면으로 전환
        setMode('view')
        providerData.dataIndexs.binding.current++
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
                formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.bindings`, formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex].bindings.filter((row, index) => index !== selectedRowIndex))
            }
        })
    }
    // formik Hook 선언
    const formikDetailHook = useFormik({ initialValues, onSubmit })
    // Table Select Options
    const columns = [{
        dataIndex : ["produce_process", "name"], 
        title     : '공정', 
        width     : 120, 
    }, {
        dataIndex : "quantity", 
        title     : '전체 합계', 
        width     : 100, 
        align     : 'right',
        render    : (text, record, index) => {
            var totalData = 0
            if (record?.binding_attacheds?.total_amount !== null && record?.binding_attacheds?.total_amount !== undefined ) {
                totalData += record?.binding_attacheds?.total_amount
            }
            if (record?.total_amount !== null && record?.total_amount !== undefined) {
                totalData += record?.total_amount
            }
            return (
                <>{moneyComma(totalData)}</>
            )
        }
    }, {
        dataIndex : "binding_attacheds", 
        title     : '제본 합계', 
        width     : 80,
        align     : 'right',
        render    : (text, record, index) => {
            var totalData = 0
            // totalData += 
            for( var i = 0; i < record?.binding_attacheds.length; i++) {
                totalData += record?.binding_attacheds[i]?.total_amount * 1
            }
            return (
                <>{(totalData !== null && totalData !== undefined) ? moneyComma(totalData) : 0}</>
            )
        }
    }, {
        dataIndex : "total_amount", 
        title     : '추가작업 합계', 
        width     : 100, 
        align     : 'right',
        render    : text => moneyComma(text)
    }, {
        dataIndex : ["produce_company", "name"], 
        title     : '제작처', 
        width     : 120, 
    }, {
        dataIndex : ["delivery_produce_company", "name"], 
        title     : '납품처', 
        width     : 120, 
    }, {
        dataIndex : "cost_attribution_date", 
        title     : '비용 귀속일', 
        width     : 120, 
    },]
    // Drawer Open/Close
    const prdDrawerOpen = () => setPrdDrawer(true);
    const prdDrawerClose = () => setPrdDrawer(false);
    const vendDrawerOpen = () => setVendDrawer(true);
    const vendDrawerClose = () => setVendDrawer(false);
    // Drawer에서 제작처 선택 후 데이터 fetch
    const setBindingDrawerData = (rowData) => {
        // 제작처
        formikDetailHook.setFieldValue(`produce_company_id`, rowData.produce_company_id)
        formikDetailHook.setFieldValue(`produce_company`,    {id : rowData.produce_company_id, name : rowData.produce_company})
        // 공정
        formikDetailHook.setFieldValue(`produce_process_id`, rowData.produce_process_id)
        formikDetailHook.setFieldValue(`produce_process`,    {id : rowData.produce_process_id, name : rowData.produce_process, process_unit : rowData.process_unit})
        // 단가
        formikDetailHook.setFieldValue(`price`,              rowData.price)
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
        setSelectedRowIndex(formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.bindings.indexOf(selectedRow))
    }, [selectedRow])
    // 수정/추가/취소 등 버튼 클릭 후 액션
    React.useEffect(() => {
        if (mode === 'view') {
            // 수정완료, 취소, 
            if (selectedRowIndex !== -1) {
                formikDetailHook.setValues(formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.bindings[selectedRowIndex])
            }
        }
        else if (mode === 'modify') {
            // target을 해당 메뉴로 잡는다
            providerData.setActiveMenuTarget('binding')
        }
        else if (mode === 'create') {
            // 선택된 값 초기화
            setSelectedRowKeys([])
            // 비어있는 초기값을 집어넣어
            formikDetailHook.setValues(initialValues)
            // 쪽수 합계 >> 세부 값에서 가져온다. 
            var total_page_data = 0
            for ( var i = 0; i < formikHook.values?.defaults[providerData.defaultRowIndex]?.details.length; i++ ) {
                total_page_data += formikHook.values?.defaults[providerData.defaultRowIndex]?.details[i].page_number
            }
            formikDetailHook.setFieldValue('page_number_sum', total_page_data)
            // target을 해당 메뉴로 잡는다
            providerData.setActiveMenuTarget('binding')
        }
    }, [formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.bindings[selectedRowIndex], mode])
    // 다른 메뉴에서 수정/추가 버튼을 클릭했을 때 초기화
    React.useEffect(() => {
        if (providerData.activeMenuTarget !== 'binding') {
            setMode('view')
        }
    }, [providerData.activeMenuTarget])
    // 선택한 Row가 달라지면 오른쪽 내용 재구성
    React.useEffect(() => {
        setSelectedRow(formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.bindings.filter(row => row.dataIndex == selectedRowKeys[0])[0] ) 
    }, [selectedRowKeys])
    // 제작 수량, 단가 변경 시 공급가 변경
    // 단가 * 제작 수량 => 공급가
    React.useEffect(() => {
        formikDetailHook.setFieldValue(
            `supply_price`, 
            formikDetailHook.values?.page_number_sum * 
            formikDetailHook.values?.price
        )
    }, [formikDetailHook.values?.page_number_sum, 
        formikDetailHook.values?.price
    ])
    // 공급가, 부가세(체크) 변경되면 부가세 변경
    // 공급가 * 0.1 => 부가세
    React.useEffect(() => {
        console.log("YYY")
        console.log(formikDetailHook.values?.supply_price)
        console.log(formikDetailHook.values?.vat_yn)
        console.log("NNN")
        if (formikDetailHook.values?.vat_yn == 'Y') formikDetailHook.setFieldValue( `vat`, Math.round( formikDetailHook.values?.supply_price * 0.1 ) )
        else                                        formikDetailHook.setFieldValue( `vat`, 0 )
    }, [formikDetailHook.values?.supply_price, 
        formikDetailHook.values?.vat_yn
    ])
    // 공급가, 부가세 변경되면 합계 변경
    // 공급가 + 부가세 => 합계
    React.useEffect(() => {
        if (formikDetailHook.values?.total_amount !== undefined) {
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
                        dataSource  = { providerData.detailRowIndex !== -1 ? formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.bindings : [] }
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
                            <Row style={{border: 0, margin: '10px 0'}}>
                                <Col xs={3} lg={3} className="label">공정</Col>
                                <Col xs={9} lg={5} className="input_box">{formikDetailHook.values?.produce_process?.name}</Col>
                                <Col xs={3} lg={3} className="label">쪽수 합계</Col>
                                <Col xs={9} lg={5} className="input_box">{formikDetailHook.values?.page_number_sum}</Col>
                                <Col xs={3} lg={3} className="label">단가 <span className="spanStar">*</span></Col>
                                <Col xs={9} lg={5} className="input_box"><FormikInput name={`price`} disabled={mode === 'view' ? true : false}/></Col>
                                <Col xs={3} lg={3} className="label">공급가</Col>
                                <Col xs={9} lg={5} className="input_box">{moneyComma(formikDetailHook.values?.supply_price)}</Col>
                                <Col xs={3} lg={3} className="label">부가세 <FormikInput type={'checkbox'} name={`vat_yn`} style={{marginLeft : 5}} data={{checkboxData : [{value : 'Y'}]}} disabled={mode === 'view' ? true : false}/></Col>
                                <Col xs={9} lg={5} className="input_box"><FormikInput name={`vat`} disabled={mode === 'view' ? true : false}/></Col>
                                <Col xs={3} lg={3} className="label">합계</Col>
                                <Col xs={9} lg={5} className="input_box">{moneyComma(formikDetailHook.values?.total_amount)}</Col>
                            </Row>

                            <Row style={{border: 0}}>
                                <Col xs={3} lg={3} className="label">제본<br />추가작업</Col>
                                <Col xs={9} lg={21} style={{padding: 0}}>
                                    <ProcessGrid 
                                        mode       = {mode}
                                        detailHook = {formikDetailHook} 
                                        disabled   = {mode !== 'view' ? false : true}
                                    />
                                </Col>
                            </Row>

                            <Row style={{border: 0, margin: '10px 0'}}>
                                <Col xs={3} lg={3} className="label">전달 사항</Col>
                                <Col xs={9} lg={21} className="input_box"><FormikInput type={'textarea'} name={`memo`} disabled={mode === 'view' ? true : false}/></Col>
                            </Row>

                            <Row style={{border: 0}}>
                                <Col xs={3} lg={3} className="label">비용 귀속일</Col>
                                <Col xs={9} lg={21} className="input_box"><FormikInput type={'datepicker'} name={`cost_attribution_date`} disabled={mode === 'view' ? true : false}/></Col>
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
                {/* Drawer Side */}
            </FormikProvider>
            {prdDrawer  ? <PrdBookBinding viewVisible={prdDrawer}  visibleClose={prdDrawerClose}  setBindingDrawerData={setBindingDrawerData}/> : ''}
            {vendDrawer ? <Vendor         viewVisible={vendDrawer} visibleClose={vendDrawerClose} setVendorDrawerData ={setVendorDrawerData} drawerVendorTarget={'bookBinding'} produceTargetId={formikDetailHook.values.produce_company_id}/> : ''}
        </Row>
    )
}

const ProcessGrid = ({detailHook, mode, disabled}) => {
    const providerData  = React.useContext(PaperBookContext)
    const [ prdDrawer,    setPrdDrawer   ] = React.useState(false);
    const [ rowEditing,   setRowEditing  ] = React.useState('')
    const [ editingType,  setEditingType ] = React.useState('')
    const lastIndex                        = React.useRef(0)
    const isEditing                        = record => record.dataIndex === rowEditing
    // Drawer Open/Close
    const prdDrawerOpen = () => setPrdDrawer(true);
    const prdDrawerClose = () => setPrdDrawer(false);
    // providerData.bindingAttached
    const onSubmit = (submitData) => {
        // 확인 버튼을 클릭했을 때
        // formData를 detailHook... 의 데이터 setFieldValue로 처리한다. 
        // dataIndex로 처리
        if (editingType === 'edit') {
            const targetIndex = detailHook.values.binding_attacheds.findIndex(unit => unit.dataIndex === rowEditing)
            detailHook.setFieldValue(`binding_attacheds[${targetIndex}]`, submitData)
        }
        else if (editingType === 'add') {
            submitData.dataIndex = rowEditing
            detailHook.setFieldValue(`binding_attacheds[${detailHook.values?.binding_attacheds.length}]`, submitData)
        }
        formikHook.setValues(formikHook.initialValues)
        setEditingType('')
        setRowEditing('')
    }
    const formikHook = useFormik({
        initialValues : {
            qty     : 0, 
            price   : 0, 
            vat     : 0
        }, 
        onSubmit : onSubmit,
    })
    // 추가 버튼 클릭 시
    const add = () => {
        setEditingType('add')
        formikHook.setFieldValue('binding_attacheds', [formikHook.initialValues, ...detailHook.values.binding_attacheds])
        formikHook.setValues(formikHook.initialValues)
        setRowEditing(providerData.dataIndexs.bindingAttached.current)
        providerData.dataIndexs.bindingAttached.current ++
    }
    // 저장 버튼 클릭 시
    const save = (record) => {
        formikHook.handleSubmit()
    }
    // 취소 버튼 클릭 시
    const cancel = (record) => {
        // 새로 추가한 거인데 그룹명을 입력 안했으면 해당 Row 삭제
        record && record.id == '' && record.name == '' && 
        detailHook.setFieldValue(
            'binding_attacheds', 
            detailHook.values.binding_attacheds.filter(item => item.dataIndex !== record.dataIndex)
        )
        setRowEditing('')
        setEditingType('')
        formikHook.setValues(formikHook.initialValues)
    }
    // 수정 버튼 클릭 시
    const edit = (record) => {
        setRowEditing(record.dataIndex)
        setEditingType('edit')
        formikHook.setValues(record)
    }
    // 삭제 버튼 클릭 시
    const remove = (record) => {
        setRowEditing('')
        setEditingType('')
        // record.dataIndex &&
        detailHook.setFieldValue(
            'binding_attacheds', 
            detailHook.values.binding_attacheds.filter(item => item.dataIndex !== record.dataIndex)
        )
        formikHook.setValues(formikHook.initialValues)
    }
    // Drawer에서 제작처 선택 후 데이터 fetch
    const setBindingProcessDrawerData = (rowData) => {
        // 공정
        formikHook.setFieldValue(`produce_process_id`,           rowData.produce_process_id)
        formikHook.setFieldValue(`produce_process.id`,           rowData.produce_process_id)
        formikHook.setFieldValue(`produce_process.name`,         rowData.produce_process)
        formikHook.setFieldValue(`produce_process.process_unit`, rowData.produce_process_unit)
        formikHook.setFieldValue(`process_unit`,                 rowData.produce_process_unit)
        formikHook.setFieldValue(`price`,                        rowData.price)
    }
    const columns = [{
        dataIndex : ["produce_process", "name"],
        title     : "제본 추가작업", 
        ellipsis  : true, 
        width     : 200, 
        render    : (text, record, index) => 
            isEditing(record) ? 
            <Row onClick={prdDrawerOpen} >
                <FormikInput name={'produce_process.name'} readOnly={true}/>
            </Row> : 
            text
    }, {
        dataIndex : "qty", 
        title     : "수량", 
        align     : "right",
        width     : 80, 
        render    : (text, record, index) => isEditing(record) ? <FormikInput name={'qty'}/> : moneyComma(text)
    }, {
        dataIndex : ["produce_process", "process_unit"], 
        title     : "단가 기준", 
        width     : 80,
        render    : (text, record, index) => isEditing(record) ? <FormikInput name={'produce_process.process_unit'} readOnly={true}/> : text
    }, {
        dataIndex : "price", 
        title     : "단가", 
        align     : "right", 
        width     : 80, 
        render    : (text, record, index) => isEditing(record) ? <FormikInput name={'price'}/> : moneyComma(text)
    }, {
        dataIndex : "supply_price", 
        title     : "공급가", 
        align     : "right", 
        width     : 80, 
        render    : (text, record, index) => isEditing(record) ? <FormikInput name={'supply_price'}/> : moneyComma(text)
    }, {
        dataIndex : "vat", 
        title     : "부가세", 
        align     : "right", 
        width     : 80, 
        render    : (text, record, index) => isEditing(record) ? <FormikInput name={'vat'}/> : moneyComma(text)
    }, {
        dataIndex : "total_amount", 
        title     : "합계", 
        align     : "right", 
        width     : 80, 
        render    : (text, record, index) => isEditing(record) ? <FormikInput name={'total_amount'}/> : moneyComma(text)
    }, {
        dataIndex : 'work',
        title     : '작업',
        width     : 100, 
        align     : 'center', 
        fixed     : 'right',
        hidden    : mode !== 'view' ? false : true, 
        render    : (text, record, index) => 
        mode !== 'view' ? 
        isEditing(record) ? (
            <>
                <Typography.Link onClick={() => save(record)} style={{marginRight: 8}}>저장</Typography.Link>
                <Typography.Link onClick={() => cancel(record)}>취소</Typography.Link>
            </>
        ) : (
            <>
                <Typography.Link onClick={() => edit(record)} style={{marginRight: 8}}>수정</Typography.Link>
                <Typography.Link onClick={() => remove(record)}>삭제</Typography.Link>
            </>
        ) : <></>
    }].filter(column => !column.hidden)
    // 단가, 수량 변경 시 공급가 변경
    React.useEffect(() => {
        formikHook.setFieldValue('supply_price', formikHook.values?.qty * formikHook.values?.price)
    }, [formikHook.values?.qty, formikHook.values?.price])
    // 공급가 변경 시 부가세 변경
    React.useEffect(() => {
        formikHook.setFieldValue('vat', formikHook.values?.supply_price * 0.1)
    }, [formikHook.values?.supply_price])
    // 부가세 변경 시 합계 변경
    React.useEffect(() => {
        formikHook.setFieldValue('total_amount', formikHook.values?.supply_price + formikHook.values?.vat)
    }, [formikHook.values?.vat])

    if (detailHook.values !== undefined) {
        return (
            <>
                <FormikProvider value={formikHook}>
                    <Table 
                        rowKey      = { 'dataIndex' }
                        dataSource  = { detailHook.values?.binding_attacheds !== undefined ? 
                            detailHook.values?.binding_attacheds : 
                            [] 
                        }
                        columns     = { columns }
                        size        = { 'middle' }
                        bordered    = { true }
                        style       = {{ padding: 0, flex: 1}}
                        scroll      = {{ x : 800, y: 600}}
                        pagination  = { false }
                        summary={() => (
                            <Table.Summary fixed={'top'}>
                                <Table.Summary.Row>
                                    {/* 제본 추가 작업 */}
                                    <Table.Summary.Cell index={0}>
                                        {
                                        // 수정 혹은 추가 상태인지
                                        mode !== 'view' ?
                                        // 추가 클릭한 상태라면
                                        editingType === 'add' ? 
                                        formikHook.values?.produce_process ? 
                                        // 선택한 추가 작업이 있다면.. 
                                        <Row 
                                            style={{cursor:'pointer', textDecoration: 'underline', textUnderlinePosition: 'under'}}
                                            onClick={prdDrawerOpen} 
                                        >
                                            {formikHook.values?.produce_process?.name }
                                        </Row> : 
                                        // 선택한 추가 작업이 없다면 버튼 노출
                                        <Row style={{justifyContent:'center'}}>
                                            <Button className="btn btn-primary btn_add" shape="circle" onClick={prdDrawerOpen}>+</Button>
                                        </Row> : 
                                        <></> : 
                                        <></>
                                        }
                                    </Table.Summary.Cell>
                                    {/* 수량 */}
                                    <Table.Summary.Cell index={1} align='right'>
                                        {editingType === 'add' ? 
                                        <FormikInput name={'qty'}/> :
                                        <></>
                                        }
                                    </Table.Summary.Cell>
                                    {/* 단가 기준 */}
                                    <Table.Summary.Cell index={2}>
                                        {editingType === 'add' && 
                                        formikHook.values?.process_unit ? 
                                        formikHook.values?.process_unit :
                                        <>{/* 단가 기준 */}</>
                                        }
                                    </Table.Summary.Cell>
                                    {/* 단가 */}
                                    <Table.Summary.Cell index={3} align='right'>
                                        {editingType === 'add' ? 
                                        <FormikInput name={'price'}/> :
                                        <></>
                                        }
                                    </Table.Summary.Cell>
                                    {/* 공급가 */}
                                    <Table.Summary.Cell index={4} align='right'>
                                        {editingType === 'add' && formikHook.values.supply_price ? 
                                        moneyComma(formikHook.values.supply_price) : 
                                        <></>
                                        }
                                    </Table.Summary.Cell>
                                    {/* 부가세 */}
                                    <Table.Summary.Cell index={5} align='right'>
                                        {editingType === 'add' ? 
                                        <FormikInput name={'vat'} readOnly={true}/> :
                                        <></>
                                        }
                                    </Table.Summary.Cell>
                                    {/* 합계 */}
                                    <Table.Summary.Cell index={6} align='right'>
                                        {editingType === 'add' && formikHook.values.total_amount ? 
                                        moneyComma(formikHook.values.total_amount) : 
                                        <></>
                                        }
                                    </Table.Summary.Cell>
                                    {/* 작업 */}
                                    <Table.Summary.Cell index={7} align='center'>
                                        {
                                        mode !== 'view' ?
                                        editingType === 'add' ? 
                                        <>
                                            <Typography.Link onClick={() => save()} style={{marginRight: 8}}>저장</Typography.Link>
                                            <Typography.Link onClick={() => cancel()}>취소</Typography.Link>
                                        </> :
                                        <Typography.Link onClick={add}> 추가 </Typography.Link> :
                                        <></>
                                        }
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            </Table.Summary>
                        )}
                    />
                    {prdDrawer ? <PrdBookBindingProcess viewVisible={prdDrawer} visibleClose={prdDrawerClose} setBindingProcessDrawerData={setBindingProcessDrawerData}/> : ''}
                </FormikProvider>
            </>
        )
    }
    else {
        return <></>
    }
}

export default BookBinding