import React                    from 'react'
import moment                   from 'moment/moment';
import { Row, Col, Drawer, Space, Button, Modal, Table } from 'antd'
import { FormikContext, FormikProvider, useFormik } from 'formik'
import { inject, observer }     from 'mobx-react';
import PrdOrder                 from './prdOrder' // 제작 발주
import ChkProduct               from './chkProduct' // 상품
import PrdDrawer                from './prdDrawer' // 제작처
import VendorDrawer             from './vendorDrawer' // 납품처
import Accident                 from '@pages/ProduceMgmt/orderPaper/paperbookTab/view/accident';
import FormikInput              from '@components/form/CustomInput'
import { isEmpty, moneyComma }  from '@components/Common/Js';
import { ArrowsAltOutlined, CloseOutlined, ShrinkOutlined } from '@ant-design/icons';

const AddDrawer = ({ commonStore, addVisible, drawerClose, drawerChk, rowData, refreshList }) => {
    const [ userList,       setUserList         ] = React.useState([])
    const [ orderDrawer,    setOrderDrawer      ] = React.useState(false)
    const [ accidentDrawer, setAccidentDrawer   ] = React.useState(false)
    const [ drawerExtended, setDrawerExtended   ] = React.useState(false)
    const lastIndex = React.useRef(0)
    const orderDrawerOpen = () => {
        setOrderDrawer(true)
    }
    const orderDrawerClose = () => {
        setOrderDrawer(false)
    }
    const accidentDrawerOpen = () => {
        setAccidentDrawer(true)
    }
    const accidentDrawerClose = () => {
        setAccidentDrawer(false)
    }    
    const initialValues = {
        cost_attribution_date : moment(),
        details : [],
    }
    const onSubmit = (submitData) => {
        delete submitData.order
        delete submitData.order_date
        delete submitData.order_request_date
        delete submitData.productionUser
        for (const unit of submitData?.details) {
            delete unit.dataIndex
            unit.ordnum = 0
            if (moment.isMoment(unit.cost_attribution_date)) {
                unit.cost_attribution_date = moment(unit.cost_attribution_date, 'YYYY-MM-DD')
            }
        }
        commonStore.handleApi({
            method : 'POST', 
            url : `/packings`,
            data : submitData
        })
        .then(() => {
            Modal.success({
                content: '등록이 완료되었습니다.',
                onOk() {
                    drawerClose()
                    refreshList()
                },
            })
        })
    }
    const onDelete = () => {
        Modal.confirm({
            content : '정말 삭제하시겠습니까?', 
            onOk : () => {
                commonStore.handleApi({
                    method : 'DELETE', 
                    url : `/packings/${rowData?.id}`
                })
                drawerClose()
            }
        })
    }
    const formikHook = useFormik({ initialValues, onSubmit })

    React.useEffect(() => {
        if (!isEmpty(rowData)) {
            commonStore.handleApi({
                url : `/packings/${rowData?.id}`
            })
            .then(result => {
                result.data.details.map(unit => {
                    unit.dataIndex = lastIndex.current
                    lastIndex.current++
                })
                formikHook.setValues(result.data) 
            })
        }
        commonStore.handleApi({
            url : `/users`
        })
        .then(result => {
            result.data.map(unit => {
                unit.label = unit.name
                unit.value = unit.id
            })
            setUserList(result.data)
        })
    }, [])

    return(
        <Drawer 
            title='포장 물품'
            placement='right'
            className={drawerExtended ? 'drawerWrap drawerback' : 'drawerWrap'}
            onClose={drawerClose}
            visible={addVisible}
            closable={false}
            keyboard={false}
            extra={
                <Space>
                    <Button onClick={() =>{ setDrawerExtended(!drawerExtended) }} style={{marginRight: 10}}>
                        {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                    </Button>
                    <Button onClick={drawerClose}>
                        <CloseOutlined />
                    </Button>
                </Space>
            }
        >
            <FormikProvider value={formikHook}>
                <Row className='table'>
                    <Col xs={24} lg={24} className="addLabel">공통 정보</Col>
                    <Col xs={12} lg={3} className="label">비용 귀속 <span className='spanStar'>*</span></Col>
                    <Col xs={12} lg={9}>
                        <FormikInput 
                            name={`company`} 
                            type={`radio`} 
                            data={{ radioData : [{
                                label : '도서출판 길벗', 
                                value: 'G'
                            }, {
                                label : '길벗스쿨',
                                value : 'S'
                            }] }}
                        />
                    </Col>
                    <Col xs={12} lg={3} className="label">제작 담당자 <span className='spanStar'>*</span></Col>
                    <Col xs={12} lg={9}>
                        <FormikInput 
                            name={`production_user_id`} 
                            type={`select`} 
                            style={{ width: '100%' }}
                            data={{
                                allowClear      : true, 
                                options         : userList
                            }}
                        />
                    </Col>
                    <Col xs={12} lg={3} className="label">기본/세부 구성</Col>
                    <Col xs={12} lg={9} style={{display : `flex`}}>
                        포장 물품 /&nbsp;
                        <FormikInput 
                            name={`produce_code2_id`} 
                            type={`select`} 
                            style={{ width: 200 }}
                            data={{
                                allowClear      : true, 
                                options         : [{
                                    value: 1,
                                    label: '도서출판 길벗'
                                },{
                                    value: 2,
                                    label: '길벗스쿨'
                                }]
                            }}
                        />
                    </Col>
                    <Col xs={12} lg={3} className="label">발주일</Col>
                    <Col xs={12} lg={3}>
                        <button className='btnLink' onClick={(event) => {orderDrawerOpen()}}>{formikHook.values?.order_request_date}</button>
                    </Col>
                    <Col xs={12} lg={3} className="label">창고 입고 요청일</Col>
                    <Col xs={12} lg={3}>
                        {formikHook.values?.order_request_date}
                    </Col>
                </Row>

                <PrdOrder viewVisible={orderDrawer} visibleClose={orderDrawerClose} drawerChk={drawerChk} rowData={rowData}/>

                <div style={{margin: '20px 0 30px'}}>
                    <Row className='table'>
                        <Col xs={24} lg={24} className="addLabel">상품과 공정</Col>
                        <LeftTable lastIndex={lastIndex}/>
                    </Row>
                </div>
                

                {/* 확인, 취소 ... 버튼들 */}
                <Row gutter={[10, 10]} justify="center" style={{border: 0 }}>
                    <Button type="primary" onClick={formikHook.handleSubmit} htmlType="button">확인</Button>
                    <Button className='bgWhite' htmlType="button" onClick={drawerClose} style={{marginLeft: 10, padding: '4px 15px', backgroundColor: '#fff'}}>취소</Button>
                    {!isEmpty(rowData) && 
                    <>
                        <Button className='bgWhite' type="primary" htmlType="button" style={{marginLeft: 10, padding: '4px 15px'}}>복사</Button>
                        <Button className='bgWhite' type="primary" htmlType="button" onClick={accidentDrawerOpen} style={{marginLeft: 10, padding: '4px 15px'}}>사고</Button>
                        <Button className='bgWhite' danger htmlType="button" onClick={onDelete} style={{marginLeft: 10, padding: '4px 15px', backgroundColor: '#fff'}}>삭제</Button>
                    </>
                    }
                </Row>
                {!isEmpty(rowData) && <Accident viewVisible={accidentDrawer} visibleClose={accidentDrawerClose} drawerChk='Y' rowData={rowData}/> }
            </FormikProvider>
        </Drawer>
    )
}

const LeftTable = ({lastIndex}) =>{
    const formikHook                               = React.useContext(FormikContext)
    const [ mode,            setMode             ] = React.useState('view')
    const [selectedRow,      setSelectedRow      ] = React.useState({})
    const [selectedRowIndex, setSelectedRowIndex ] = React.useState(-1)
    const [selectedRowKeys,  setSelectedRowKeys  ] = React.useState([])
    const [prdDrawer,        setPrdDrawer        ] = React.useState(false)
    const [vendDrawer,       setVendDrawer       ] = React.useState(false)
    const [chkProDrawer,     setChkProDrawer     ] = React.useState(false)

    const initialValues = {
        product_qty : 0,
        price : 0, 
        supply_price : 0, 
        vat : 0, 
        vat_yn : 'Y', 
        total_amount : 0, 
        memo : '', 
        cost_attribution_date : moment()
    }
    const onSubmit = (submitData) => {
        var targetIndex = 0
        // 수정인지 추가인지 확인
        // 추가라면
        if ( mode === 'create' ) {
            // details가 배열인지 확인 (초기 값이 없을 수 있음)
            if (Array.isArray(formikHook.values?.details)) {
                // 있으면 Index 추가
                targetIndex = formikHook.values?.details.length
            }
            else {
                // 초기 값이 없으면
                targetIndex = 0
            }
            // dataIndex 입력
            formikHook.setFieldValue(`details.${targetIndex}.dataIndex`, lastIndex.current)
        }
        // 수정이면
        else {
            // 목록에 선택되어 있는 index 지정
            targetIndex = selectedRowIndex
        }
        // 상품
        formikHook.setFieldValue(`details.${targetIndex}.product`,                     submitData.product)
        formikHook.setFieldValue(`details.${targetIndex}.product_id`,                  submitData.product_id)
        // 제작처
        formikHook.setFieldValue(`details.${targetIndex}.produce_company`,             submitData.produce_company)
        formikHook.setFieldValue(`details.${targetIndex}.produce_company_id`,          submitData.produce_company_id)
        // 공정
        formikHook.setFieldValue(`details.${targetIndex}.produce_process_id`,          submitData.produce_process_id)
        formikHook.setFieldValue(`details.${targetIndex}.produce_process`,             submitData.produce_process)
        // 납품처
        formikHook.setFieldValue(`details.${targetIndex}.delivery_produce_company`,    submitData.delivery_produce_company)
        formikHook.setFieldValue(`details.${targetIndex}.delivery_produce_company_id`, submitData.delivery_produce_company_id)
        // 발주 수량
        formikHook.setFieldValue(`details.${targetIndex}.product_qty`,                 submitData.product_qty)
        // 단가
        formikHook.setFieldValue(`details.${targetIndex}.price`,                       submitData.price)
        // 공급가
        formikHook.setFieldValue(`details.${targetIndex}.supply_price`,                submitData.supply_price)
        // 부가세
        formikHook.setFieldValue(`details.${targetIndex}.vat`,                         submitData.vat)
        //부가세 체크 (Y, N)
        formikHook.setFieldValue(`details.${targetIndex}.vat_yn`,                      submitData.vat_yn)
        // 합계
        formikHook.setFieldValue(`details.${targetIndex}.total_amount`,                submitData.total_amount)
        // 전달 사항
        formikHook.setFieldValue(`details.${targetIndex}.memo`,                        submitData.memo)
        // 비용 귀속일
        formikHook.setFieldValue(`details.${targetIndex}.cost_attribution_date`,       submitData.cost_attribution_date)
        
        // 추가인 경우 추가된 Row가 선택된 상태로 전환
        if ( mode === 'create' ) {
            setSelectedRowKeys([lastIndex.current])
        }
        // 보기 화면으로 전환
        setMode('view')
        lastIndex.current++
    }
    const formikDetailHook = useFormik({initialValues, onSubmit})
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
                formikHook.setFieldValue(`details`, formikHook.values?.details.filter((row, index) => index !== selectedRowIndex))
            }
        })
    }

    const columns = [{
        dataIndex   : ['product', 'name'], 
        title       : `상품`,  
        width       : 200, 
        ellipsis    : true
    }, {
        dataIndex   : ['produce_process', 'name'], 
        title       : `공정`, 
        width       : 200,  
        ellipsis    : true
    }, {
        dataIndex   : 'product_qty', 
        title       : `발주 수량`,  
        width       : 100, 
        align       : 'right',
        render      : text => moneyComma(text)
    }, {
        dataIndex   : 'price', 
        title       : `단가`,  
        width       : 100, 
        align       : 'right',
        render      : text => {moneyComma(text)}
    }, {
        dataIndex   : 'total_amount', 
        title       : `합계`,  
        width       : 100, 
        align       : 'right',
        render      : text => {moneyComma(text)}
    }, {
        dataIndex   : ['produce_company', 'name'], 
        title       : `제작처`,  
        width       : 120, 
    }, {
        dataIndex   : ['delivery_produce_company', 'name'], 
        title       : `납품처`,  
        width       : 120, 
    }, {
    //     dataIndex   : 'incomingDate', 
    //     title       : `입고일`,  
    //     width       : 120, 
    // }, {
    //     dataIndex   : 'incomingQuantity', 
    //     title       : `입고 수량`,  
    //     width       : 100, 
    //     align       : 'right'
    // }, {
        dataIndex   : 'cost_attribution_date', 
        title       : `비용 귀속일`,  
        width       : 100, 
    }, ]
    // Drawer Open/Close
    const chkProDrawerOpen  = () => setChkProDrawer(true)
    const chkProDrawerClose = () => setChkProDrawer(false)
    const prdDrawerOpen     = () => setPrdDrawer(true)
    const prdDrawerClose    = () => setPrdDrawer(false)
    const vendDrawerOpen    = () => setVendDrawer(true)
    const vendDrawerClose   = () => setVendDrawer(false)
    // Drawer에서 제작처 선택 후 데이터 fetch
    const setChkProDrawerData = rowData => {
        // 상품
        formikDetailHook.setFieldValue(`product_id`,  rowData.id)
        formikDetailHook.setFieldValue(`product`,     {
            id           : rowData.id, 
            name         : rowData.name,
            company      : rowData.company, 
            product_code : rowData.product_code,
        })
    }
    const setProductDrawerData = rowData => {
        // 제작처
        formikDetailHook.setFieldValue(`produce_company_id`,  rowData.produce_company_id)
        formikDetailHook.setFieldValue(`produce_company`,     {id : rowData.produce_company_id, name : rowData.produce_company})
        // 공정
        formikDetailHook.setFieldValue(`produce_process_id`,  rowData.produce_process_id)
        formikDetailHook.setFieldValue(`produce_process`,     {id : rowData.produce_process_id, name : rowData.produce_process})
        // 단가
        formikDetailHook.setFieldValue(`price`,               rowData.price)
    }
    // Drawer에서 납품처 선택 후 데이터 fetch
    const setVendorDrawerData = rowData => {
        // 납품처
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
            // 납품처
            formikDetailHook.setFieldValue(`delivery_produce_company_id`,  '')
            formikDetailHook.setFieldValue(`delivery_produce_company`,     {})
        }
        // 상품 X
        else if (target === 'product') {
            formikDetailHook.setFieldValue(`produce_company_id`,  '')
            formikDetailHook.setFieldValue(`product`,             {})
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
        setSelectedRowIndex(formikHook.values?.details.indexOf(selectedRow))
    }, [selectedRow])
    // 수정/추가/취소 등 버튼 클릭 후 액션
    React.useEffect(() => {
        if (mode === 'view') {
            // 수정완료, 취소,
            if (selectedRowIndex !== -1) {
                formikDetailHook.setValues(formikHook.values.details[selectedRowIndex])
            }
        }
        else if (mode === 'modify') {
        }
        else if (mode === 'create') {
            // 선택된 값 초기화
            setSelectedRowKeys([])
            // 비어있는 초기값을 집어넣어
            formikDetailHook.setValues(initialValues)
        }
    }, [selectedRowIndex, mode])
    // 선택한 Row가 달라지면 오른쪽 내용 재구성
    React.useEffect(() => {
        if (formikHook.values?.details.filter(row => row.dataIndex == selectedRowKeys[0])[0] !== undefined ) {
            setSelectedRow(formikHook.values?.details.filter(row => row.dataIndex == selectedRowKeys[0])[0] ) 
        }
        else {
            setSelectedRow(initialValues)
        }
    }, [selectedRowKeys])
    // 발주 수량, 단가 변경 시 공급가 변경
    // 단가 * 제작 수량 => 공급가
    React.useEffect(() => {
        formikDetailHook.setFieldValue(
            `supply_price`, 
            formikDetailHook.values?.product_qty * 
            formikDetailHook.values?.price
        )
    }, [formikDetailHook.values?.product_qty, 
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
            <FormikProvider value={formikDetailHook}>
                <Col xs={8} lg={8} >
                    <Table
                        rowKey      = {'dataIndex'}
                        dataSource  = {formikHook.values?.details}
                        columns     = {columns}
                        size        = {'middle'}
                        bordered    = {true}
                        style       = {{ padding: 0, flex: 1 }}
                        scroll      = {{ x : 500, y: 500 }}
                        pagination  = { false }
                        onRow       = {(record) => ({
                            onClick : (event) => { setSelectedRowKeys([record.dataIndex]) }
                        })}
                        rowSelection= { rowSelection }
                    />
                </Col>
                <Col xs={16} lg={16} style={{background: '#ddd'}}>
                    {selectedRowIndex !== -1 || mode === 'create' ?  
                        <>
                            <Row style={{border: 0}}>
                                <Col xs={6} lg={4} className="label">상품 <span className="spanStar">*</span></Col>
                                <Col xs={6} lg={20} className="input_box">
                                {   
                                    isEmpty(formikDetailHook.values?.product) ? 
                                    (mode === 'create' || mode === 'modify') ?
                                    <Button className="btn btn-primary btn_add" shape="circle" onClick={chkProDrawerOpen}>+</Button> : <></>
                                    :
                                    <>{formikDetailHook.values?.product?.name} {mode === 'create' || mode === 'modify' ? <Button shape="circle" className="btn_del" onClick={() => btnDel('product')}>X</Button> : <></>}</>
                                }
                                </Col>
                                <Col xs={3} lg={4} className="label">제작처 <span className="spanStar">*</span></Col>
                                <Col xs={9} lg={8} className="input_box">
                                {   
                                    isEmpty(formikDetailHook.values?.produce_company) ? 
                                    (mode === 'create' || mode === 'modify') ?
                                    <Button className="btn btn-primary btn_add" shape="circle" onClick={prdDrawerOpen}>+</Button> : <></>
                                    :
                                    <>{formikDetailHook.values?.produce_company?.name} {mode === 'create' || mode === 'modify' ? <Button shape="circle" className="btn_del" onClick={() => btnDel('produce')}>X</Button> : <></>}</>
                                }
                                </Col>
                                <Col xs={3} lg={4} className="label">납품처 <span className="spanStar">*</span></Col>
                                <Col xs={9} lg={8} className="input_box">
                                {
                                    isEmpty(formikDetailHook.values?.delivery_produce_company) ? 
                                    (mode === 'create' || mode === 'modify') && 
                                    <Button className="btn btn-primary btn_add" shape="circle" onClick={vendDrawerOpen}>+</Button>
                                    :
                                    <>{formikDetailHook.values?.delivery_produce_company?.name} {mode === 'create' || mode === 'modify' ? <Button shape="circle" className="btn_del" onClick={() => btnDel('delivery')}>X</Button> : <></>}</>
                                }
                                </Col>
                            </Row>

                            <Row style={{margin: '10px 0'}}>
                                <Col xs={6} lg={4} className='label'>공정</Col>
                                <Col xs={6} lg={8} className='input_box'>{formikDetailHook.values?.produce_process?.name}</Col>
                                <Col xs={6} lg={4} className='label'>발주 수량 <span className='spanStar'>*</span></Col>
                                <Col xs={6} lg={8} className='input_box'><FormikInput name={`product_qty`} disabled={mode === 'view' ? true : false}/></Col>
                                <Col xs={6} lg={4} className='label'>단가 <span className='spanStar'>*</span></Col>
                                <Col xs={6} lg={8} className='input_box'><FormikInput name={`price`} disabled={mode === 'view' ? true : false}/></Col>
                                <Col xs={6} lg={4} className='label'>공급가 <span className='spanStar'>*</span></Col>
                                <Col xs={6} lg={8} className='input_box'>{moneyComma(formikDetailHook.values?.supply_price)}</Col>
                                <Col xs={6} lg={4} className='label'>부가세<FormikInput type={'checkbox'} name={`vat_yn`} style={{marginLeft : 5}} data={{checkboxData : [{value : 'Y'}]}} disabled={mode === 'view' ? true : false}/></Col>
                                <Col xs={6} lg={8} className='input_box'><FormikInput name={`vat`} disabled={mode === 'view' ? true : false}/></Col>
                                <Col xs={6} lg={4} className='label'>합계</Col>
                                <Col xs={6} lg={8} className='input_box'>{moneyComma(formikDetailHook.values?.total_amount)}</Col>
                                <Col xs={6} lg={4} className='label'>전달 사항</Col>
                                <Col xs={6} lg={20} className='input_box'><FormikInput type={'textarea'} name={`memo`} disabled={mode === 'view' ? true : false}/></Col>
                            </Row>

                            <Row>
                                <Col xs={8} lg={4} className='label'>비용 귀속일</Col>
                                <Col xs={16} lg={20} className='input_box'><FormikInput type={'datepicker'} name={`cost_attribution_date`} disabled={mode === 'view' ? true : false}/></Col>
                            </Row>

                            <Row gutter={[10, 10]} justify="center" style={{border: 0, marginTop: 20 }}>
                                { selectedRowIndex === -1 && mode !== 'create' ?
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
                        </>
                        :
                        <Row gutter={[10, 10]} justify="center" style={{border: 0, marginTop: 20 }}>
                            <Button type='primary' htmlType="button" style={{marginLeft: 10, padding: '4px 15px', backgroundColor: '#fff'}} onClick={() => setMode('create')}>추가</Button>
                        </Row>
                    }
                    {/* Drawer Side */}
                    {chkProDrawer ? <ChkProduct  viewVisible={chkProDrawer} visibleClose={chkProDrawerClose} setProductDrawerData ={setChkProDrawerData} /> : ''}
                    {prdDrawer  ? <PrdDrawer     viewVisible={prdDrawer}    visibleClose={prdDrawerClose}    setProductDrawerData={setProductDrawerData} selectedRow={selectedRowIndex}/> : ''}
                    {vendDrawer ? <VendorDrawer  viewVisible={vendDrawer}   visibleClose={vendDrawerClose}   setVendorDrawerData={setVendorDrawerData} drawerVendorTarget={'stock'} produceTargetId={formikDetailHook.values?.produce_company_id}/> : ''}
                </Col>
            </FormikProvider>
        </Row>
    )
}

export default inject('commonStore')(observer(AddDrawer))
