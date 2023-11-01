import React from 'react'
import { inject, observer }                 from 'mobx-react';
import { Drawer, Row, Col, Button, Table, Modal }  from 'antd'
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { FormikProvider, useFormik }        from 'formik';
import moment                               from 'moment/moment';
import FormikInput                          from '@components/form/CustomInput';
import { moneyComma }                       from '@components/Common/Js';

const AccidentDetail = ({ commonStore, viewVisible, visibleClose, productionId, refreshList, rowData='' }) => {
    const [ accidentCode1,       setAccidentCode1       ] = React.useState([])
    const [ accidentCode2,       setAccidentCode2       ] = React.useState([])
    const [ accidentCode3,       setAccidentCode3       ] = React.useState([])
    const [ userData,            setUserData            ] = React.useState([])
    const [ drawerExtended,      setDrawerExtended      ] = React.useState(false)
    const [ accidentCodeOrigin2, setAccidentCodeOrigin2 ] = React.useState([])
    const [ accidentCodeOrigin3, setAccidentCodeOrigin3 ] = React.useState([])

    const initialValues = {
        level           : 'E', 
        accident_type   : 1, 
        memo            : '',
        price           : 0, 
        vat             : 0, 
        total_amount    : 0, 
        note            : '',
        vat_yn          : 'Y',
        cost_attribution_date : moment(), 
    }
    const onSubmit = (submitData) => {
        submitData.cost_attribution_date = submitData.cost_attribution_date.format('YYYY-MM-DD')
        commonStore.handleApi({
            method : `POST`, 
            url : `/productions/${productionId}/accidents`, 
            data : submitData
        })
        .then(result => {
            // 사고 목록 재구성
            refreshList()
            Modal.success({
                content : `완료되었습니다.`, 
                onOk : visibleClose
            })
        })
    }
    const onDelete = () => {
        commonStore.handleApi({
            method : `DELETE`, 
            url : `/productions/${productionId}/accidents/${rowData}`, 
        })
        .then(() => {
            // 사고 목록 재구성
            refreshList()
            Modal.success({
                content : `완료되었습니다.`, 
                onOK : visibleClose
            })
        })
    }

    const formikDetailHook = useFormik({ initialValues, onSubmit })

    React.useEffect(() => {
        // 사고 분류 - 1차
        commonStore.handleApi({
            url : `/produce-accident-codes`
        })
        .then((result) => {
            result.data.map(unit => {
                unit.label = unit?.name
                unit.value = unit?.id
            })
            setAccidentCode1(result.data)
        })
        // 사고 분류 - 2차
        commonStore.handleApi({
            url : `/produce-accidents`
        })
        .then((result) => {
            result.data.map(unit => {
                unit.label = unit?.name
                unit.value = unit?.id
            })
            setAccidentCodeOrigin2(result.data)
        })
        // 사고 내용/템플릿
        commonStore.handleApi({
            url : `/produce-accident-contents`
        })
        .then((result) => {
            result.data.map(unit => {
                unit.label = unit?.contents
                unit.value = unit?.id
            })
            setAccidentCodeOrigin3(result.data)
        })   
        // 책임자
        commonStore.handleApi({
            url : `/users`
        })
        .then((result) => {
            result.data.map(unit => {
                unit.label = unit?.name
                unit.value = unit?.id
            })
            formikDetailHook.setFieldValue(`manager_user_id`, result.data[0].value)
            setUserData(result.data)
        })


        commonStore.handleApi({
            url : `/productions/${productionId}/accidents/${rowData}`
        })
        .then((result) => {
            console.log(result)
        })
    }, [])
    // 사고 분류 1차 수정 시 2차 목록 재구성
    React.useEffect(() => {
        formikDetailHook.setFieldValue(`produce_accident_id`, ``)
        formikDetailHook.setFieldValue(`produce_accident_content_id`, ``)
        console.log(formikDetailHook.values?.produce_accident_code_id)
        setAccidentCode2(accidentCodeOrigin2.filter(unit => unit.produce_accident_code_id === formikDetailHook.values?.produce_accident_code_id))
        setAccidentCode3(accidentCodeOrigin3.filter(unit => unit.produce_accident_code_id === formikDetailHook.values?.produce_accident_code_id))
    }, [formikDetailHook.values?.produce_accident_code_id])
    // 사고 내용/템플릿 선택 시 하단에 내용 입력
    React.useEffect(() => {
        formikDetailHook.setFieldValue('memo', accidentCode3.filter(unit => unit.id === formikDetailHook.values?.produce_accident_content_id)[0]?.contents)
    }, [formikDetailHook.values?.produce_accident_content_id])
    // 사고 처리 금액 - 금액 => 부가세
    React.useEffect(() => {
        formikDetailHook.setFieldValue(
            `vat`, 
            Math.round(formikDetailHook.values?.price * 0.1)
        )
    }, [formikDetailHook.values?.price])
    // 사고 처리 금액 - 부가세 => 합계
    React.useEffect(() => {
        formikDetailHook.setFieldValue(
            `total_amount`, 
            (formikDetailHook.values?.price * 1) + (formikDetailHook.values?.vat * 1)
        )
    }, [formikDetailHook.values?.vat])
    return(
        <Drawer 
            title='사고 상세 내용'
            placement='right'
            onClose={visibleClose}
            visible={viewVisible}
            className={drawerExtended ? "drawerWrap drawerback" : "drawerWrap"}
            closable={false}
            keyboard={false}
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
            <FormikProvider value={formikDetailHook}>
                <Row className='table'>
                    <Col xs={8} lg={4} className="label">사고 수준 <span className='spanStar'>*</span></Col>
                    <Col xs={16} lg={20}>
                        <FormikInput type={'radio'} name={'level'} data={{
                            radioData : [{
                                label : '오류', 
                                value: 'E'
                            }, {
                                label : '사고',
                                value : 'A',
                            }]
                        }}/>
                    </Col>

                    <Col xs={8} lg={4} className="label">사고 분류 <span className='spanStar'>*</span></Col>
                    <Col xs={16} lg={20} style={{display: 'flex', flexDirection: 'row'}}>
                        <FormikInput 
                            type={'select'} 
                            name={'produce_accident_code_id'} 
                            placeholder={'선택해주세요'} 
                            style={{flex:1, marginRight: 15}}
                            data={{ mode : 'tags', options : accidentCode1 }}
                        />
                        <FormikInput 
                            type={'select'} 
                            name={'produce_accident_id'} 
                            data={{ mode : 'tags', options : accidentCode2 }}
                            placeholder={'선택해주세요'} 
                            style={{flex:1}}
                            disabled={
                                (formikDetailHook.values.produce_accident_code_id === null || 
                                formikDetailHook.values.produce_accident_code_id === undefined || 
                                formikDetailHook.values.produce_accident_code_id === '') ? 
                                true : false
                            }
                        />
                    </Col>

                    <Col xs={8} lg={4} className="label">사고 내용 <span className='spanStar'>*</span></Col>
                    <Col xs={16} lg={20}>
                        <>
                            <FormikInput 
                                type={'select'} 
                                placeholder={'선택해주세요'} 
                                name={'produce_accident_content_id'} 
                                style={{width : '100%', marginBottom : 5}}
                                data={{mode : 'tags', options : accidentCode3}}
                                disabled={
                                    (formikDetailHook.values.produce_accident_code_id === null || 
                                    formikDetailHook.values.produce_accident_code_id === undefined || 
                                    formikDetailHook.values.produce_accident_code_id === '') ? 
                                    true : false
                                }
                            />
                            <FormikInput type={'textarea'} name={'memo'} style={{minHeight : 'unset', height: 'unset'}}/>
                        </>
                    </Col>
                    <Col xs={8} lg={4} className="label">책임 구분 <span className='spanStar'>*</span></Col>
                    <Col xs={16} lg={8}>
                        <FormikInput type={'radio'} name={'accident_type'} data={{
                            radioData : [{
                                label : '외부', 
                                value: 1
                            }, {
                                label : '내부',
                                value : 2,
                            }]
                        }}/>
                    </Col>
                    <Col xs={8} lg={4} className="label">책임자 <span className='spanStar'>*</span></Col>
                    <Col xs={16} lg={8}>
                        <FormikInput 
                            type={'select'} 
                            name={'manager_user_id'} 
                            style={{width : '100%', marginBottom : 5}}
                            data={{ mode : 'tags', options : userData }}
                            placeholder={'선택해주세요'} 
                        />
                    </Col>
                    <Col xs={8} lg={4} className="label">사고 세부 공정 <span className='spanStar'>*</span></Col>
                    <Col xs={16} lg={20}>
                        <ProcessGrid accidentType={formikDetailHook.values?.produce_accident_code_id}/>
                    </Col>
                    <Col xs={8} lg={4} className="label">처리 및 비용 귀속일</Col>
                    <Col xs={16} lg={8}  style={{display: 'flex'}}>
                        <FormikInput type={'checkbox'} name={`vat_yn`} style={{marginRight : 10}} data={{checkboxData : [{label : '사고로 확정', value : 'Y'}]}} />
                        <FormikInput type={'datepicker'} name={'cost_attribution_date'} disabled={formikDetailHook.values?.vat_yn == 'Y' ? false : true}/>
                    </Col>
                    <Col xs={8} lg={4} className="label">사고 처리 금액</Col>
                    <Col xs={16} lg={8}>
                        <FormikInput name={'price'} style={{width: 100, marginRight: 5}}/> + 
                        <FormikInput name={'vat'} style={{width: 100, marginLeft: 5, marginRight: 5}}/> = 
                        <FormikInput name={'total_amount'} style={{width: 100, marginLeft: 5}} readOnly={true}/>
                    </Col>
                    <Col xs={8} lg={4} className="label">참고사항</Col>
                    <Col xs={16} lg={20}>
                        <FormikInput type={'textarea'} name={'note'} />
                    </Col>
                </Row>
                <Row gutter={10} justify="center" style={{margin: '20px 0'}}>
                    <Button htmlType="button" type="primary" onClick={formikDetailHook.handleSubmit}>확인</Button>
                    <Button htmlType="button"                onClick={visibleClose} style={{marginLeft: 10}} >취소</Button>
                    {rowData !== '' && 
                    <Button htmlType="button" danger                                style={{marginLeft: 10}}>삭제</Button>
                    }
                </Row>
            </FormikProvider>
        </Drawer>
    )
}

const ProcessGrid = inject('commonStore')(observer(({ commonStore, accidentType }) => {

    const [ selectedRowKeys, setSelectedRowKeys ] = React.useState('')
    const [ prepressList,    setPrepressList    ] = React.useState([])
    const [ paperList,       setPaperList       ] = React.useState([])
    const [ printingList,    setPrintingList    ] = React.useState([])
    const [ bindingList,     setBindingList     ] = React.useState([])
    const [ postpressList,   setPostpressList   ] = React.useState([])
    const [ packingList,     setPackingList     ] = React.useState([])
    const [ accessoryList,   setAccessoryList   ] = React.useState([])

    // Table Select Options
    const rowSelection = {
        type : 'radio', 
        selectedRowKeys,
        columnWidth: 0, 
        renderCell: () => <></>,
        onChange: setSelectedRowKeys,
    }
    // prepress
    const prepressColumns = [{ 
        title : "세부 구성", 
        dataIndex : "composition", 
        width : 100,
        ellipsis  : true, 
        render    : (text, record) => (
            <>
                {/* 세부 구성 (ex. 표지, 본문) */}
                {record?.produce_code_detail} 
                {/* 앞면 도수 */}
                ({record?.front_cmyk} / 
                {/* 뒷면 도수 */}
                {record?.back_cmyk})
            </>
        )
    }, { 
        dataIndex : ["produce_process", "name"], 
        title     : "공정", 
        width     : 120, 
    }, { 
        dataIndex : "qty", 
        title     : "수량", 
        width     : 70, 
        align     : "right" 
    }, { 
        dataIndex : "price", 
        title     : "단가", 
        width     : 90, 
        align     : "right" 
    }, { 
        dataIndex : "total_amount", 
        title     : "합계", 
        width     : 80, 
        align     : "right" 
    }, { 
        dataIndex : ["produce_company", "name"], 
        title     : "제작처", 
        width     : 120,
    }, { 
        dataIndex : ["delivery_produce_company", "name"], 
        title     : "납품처", 
        width     : 120, 
    }, { 
        dataIndex : "cost_attribution_date", 
        title     : "비용 귀속일", 
        width     : 100 
    },]
    // paper
    const paperColumns = [{
        dataIndex : "Composition", 
        title     : '세부 구성', 
        width     : 100, 
        ellipsis  : true, 
        render    : (text, record) => (
            <>
                {/* 세부 구성 (ex. 표지, 본문) */}
                {record?.produce_code_detail} 
                {/* 앞면 도수 */}
                ({record?.front_cmyk} / 
                {/* 뒷면 도수 */}
                {record?.back_cmyk})
            </>
        )
    }, {
        dataIndex : "printPaper", 
        title     : '인쇄 종이', 
        width     : 120,
        ellipsis  : true, 
        render    : (text, record) => <>{record?.paper_information_name}</>
    }, {
        dataIndex : "paper_qty", 
        title     : '종이 수량', 
        width     : 80, 
        align     : 'right'
    }, {
        dataIndex : "price", 
        title     : '단가', 
        width     : 100, 
        align     : 'right'
    }, {
        dataIndex : "total_amount", 
        title     : '합계', 
        width     : 100, 
        align     : 'right'
    }, {
        dataIndex : "produce_company_id", 
        title     : '제작처', 
        width     : 120, 
        ellipsis  : true, 
        render    : (text, record, index) => <>{record?.produce_company?.name}</>
    }, {
        dataIndex : "delivery_produce_company_id", 
        title     : '납품처', 
        ellipsis  : true, 
        render    : (text, record, index) => <>{record?.delivery_produce_company?.name}</>
    }, {
        dataIndex : "cost_attribution_date", 
        title     : '비용 귀속일', 
        width     : '120', 
        ellipsis  : true, 
    }]
    // print
    const printingColumns = [{
        dataIndex : "Composition", 
        title : "세부 구성", 
        width : 100,
        render : (text, record) => (
            <>
                {/* 세부 구성 (ex. 표지, 본문) */}
                {record?.produce_code_detail} 
                {/* 앞면 도수 */}
                ({record?.front_cmyk} / 
                {/* 뒷면 도수 */}
                {record?.back_cmyk})
            </>
        )
    }, {
        dataIndex   : "type", 
        title       : "공정", 
        width       : 80,
        render      : (text, record, index) => <> {record.type == 1 ? '인쇄' : '인쇄판'} </>
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
    // binding
    const bindingColumns = [{
        dataIndex : ["produce_process", "name"], 
        title     : '공정', 
        width     : 100, 
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
        width     : 100,
        align     : 'right',
        render    : (text, record, index) => {
            var totalData = 0
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
        width     : 100, 
    }, {
        dataIndex : "cost_attribution_date", 
        title     : '비용 귀속일', 
        width     : 100, 
    },]
    // postpress
    const postpressColumns = [{
        dataIndex : "Composition", 
        title     : "세부 구성", 
        width     : 100,
        render    : (text, record) => (
            <>
                {/* 세부 구성 (ex. 표지, 본문) */}
                {record?.produce_code_detail} 
                {/* 앞면 도수 */}
                ({record?.front_cmyk} / 
                {/* 뒷면 도수 */}
                {record?.back_cmyk})
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
    }, {
        dataIndex : "price", 
        title     : "단가", 
        width     : 120,
        align     : "right", 
    }, {
        dataIndex : "total_amount", 
        title     : "합계", 
        width     : 120,
        align     : "right", 
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
    // packing
    const packingColumns = [{
        dataIndex : ["produce_process", "name"], 
        title : "공정", 
        width : 150
    }, {
        dataIndex : "work_qty", 
        title : "작업 수량", 
        width : 100, 
        align : "right"
    }, {
        dataIndex : "price", 
        title : "단가", 
        width : 120, 
        align : "right"
    }, {
        dataIndex : "total_amount", 
        title : "합계", 
        width : 120, 
        align : "right"
    }, {
        dataIndex : ["produce_company", "name"], 
        title : "제작처", 
        width : 120
    }, {
        dataIndex : ["delivery_produce_company", "name"], 
        title : "납품처", 
        width : 120
    }, {
        dataIndex : "cost_at", 
        title : "비용 귀속일", 
        width : 120
    }, ]
    // insert
    const accessoryColumns = [{
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
    
    React.useEffect(() => {
        commonStore.handleApi({
            url : `/productions/14`
        })
        .then((result) => {
            var prepressData  = []
            var paperData     = []
            var printingData  = []
            var bindingData   = []
            var postpressData = []
            var packingData   = []
            var accessoryData = []
            var dataIndex = 0
            var details_produce_name = ''
            var details_front_cmyk = 0
            var details_back_cmyk = 0

            for(let defaultData of result.data.defaults) {
                for(let detailData of defaultData.details) {
                    details_produce_name = detailData?.produce_code_detail?.name
                    details_front_cmyk   = detailData?.front_cmyk
                    details_back_cmyk    = detailData?.back_cmyk
                    for(let unit of detailData.prepresses) {
                        unit.dataIndex = dataIndex
                        unit.produce_code_detail = details_produce_name
                        unit.front_cmyk          = details_front_cmyk
                        unit.back_cmyk           = details_back_cmyk
                        prepressData.push(unit)
                        dataIndex++
                    }
                    for(let unit of detailData.papers) {
                        unit.dataIndex = dataIndex
                        unit.produce_code_detail = details_produce_name
                        unit.front_cmyk          = details_front_cmyk
                        unit.back_cmyk           = details_back_cmyk
                        paperData.push(unit)
                        dataIndex++
                    }
                    for(let unit of detailData.prints) {
                        unit.dataIndex = dataIndex
                        unit.produce_code_detail = details_produce_name
                        unit.front_cmyk          = details_front_cmyk
                        unit.back_cmyk           = details_back_cmyk
                        printingData.push(unit)
                        dataIndex++
                    }
                    for(let unit of detailData.bindings) {
                        unit.dataIndex = dataIndex
                        unit.produce_code_detail = details_produce_name
                        unit.front_cmyk          = details_front_cmyk
                        unit.back_cmyk           = details_back_cmyk
                        bindingData.push(unit)
                        dataIndex++
                    }
                    for(let unit of detailData.processings) {
                        unit.dataIndex = dataIndex
                        unit.produce_code_detail = details_produce_name
                        unit.front_cmyk          = details_front_cmyk
                        unit.back_cmyk           = details_back_cmyk
                        postpressData.push(unit)
                        dataIndex++
                    }
                    for(let unit of detailData.packings) {
                        unit.dataIndex = dataIndex
                        unit.produce_code_detail = details_produce_name
                        unit.front_cmyk          = details_front_cmyk
                        unit.back_cmyk           = details_back_cmyk
                        packingData.push(unit)
                        dataIndex++
                    }
                    for(let unit of detailData.accessories) {
                        unit.dataIndex = dataIndex
                        unit.produce_code_detail = details_produce_name
                        unit.front_cmyk          = details_front_cmyk
                        unit.back_cmyk           = details_back_cmyk
                        accessoryData.push(unit)
                        dataIndex++
                    }
                }
            }
            setPrepressList(prepressData)
            setPaperList(paperData)
            setPrintingList(printingData)
            setBindingList(bindingData)
            setPostpressList(postpressData)
            setPackingList(packingData)
            setAccessoryList(accessoryData)
        })
    }, [])


    return (
        <Row style={{margin: 0}}>
        {
            // prepress
            accidentType == 8 ? 
            <Table 
                rowKey      = { 'dataIndex' }
                dataSource  = { prepressList }
                columns     = { prepressColumns }
                size        = { 'middle' }
                bordered    = { true }
                style       = {{ padding: 0, flex: 1}}
                scroll      = {{ x : 800, y: 600}}
                pagination  = { false }
                onRow       = {(record) => ({
                    onClick : () => { setSelectedRowKeys([record.dataIndex]) }
                })}
                rowSelection= { rowSelection }
            />
            :
            // 종이
            accidentType == 2 ? 
            <Table 
                rowKey      = { 'dataIndex' }
                dataSource  = { paperList }
                columns     = { paperColumns }
                size        = { 'middle' }
                bordered    = { true }
                style       = {{ padding: 0, flex: 1}}
                scroll      = {{ x : 800, y: 600}}
                pagination  = { false }
                onRow       = {(record) => ({
                    onClick : () => { setSelectedRowKeys([record.dataIndex]) }
                })}
                rowSelection= { rowSelection }
            />
            :
            // 인쇄
            accidentType == 3 ? 
            <Table 
                rowKey      = { 'dataIndex' }
                dataSource  = { printingList }
                columns     = { printingColumns }
                size        = { 'middle' }
                bordered    = { true }
                style       = {{ padding: 0, flex: 1}}
                scroll      = {{ x : 800, y: 600}}
                pagination  = { false }
                onRow       = {(record) => ({
                    onClick : () => { setSelectedRowKeys([record.dataIndex]) }
                })}
                rowSelection= { rowSelection }
            />
            :
            // 제본
            accidentType == 4 ? 
            <Table 
                rowKey      = { 'dataIndex' }
                dataSource  = { bindingList }
                columns     = { bindingColumns }
                size        = { 'middle' }
                bordered    = { true }
                style       = {{ padding: 0, flex: 1}}
                scroll      = {{ x : 800, y: 600}}
                pagination  = { false }
                onRow       = {(record) => ({
                    onClick : () => { setSelectedRowKeys([record.dataIndex]) }
                })}
                rowSelection= { rowSelection }
            />
            :
            // 후가공
            accidentType == 5 ? 
            <Table 
                rowKey      = { 'dataIndex' }
                dataSource  = { postpressList }
                columns     = { postpressColumns }
                size        = { 'middle' }
                bordered    = { true }
                style       = {{ padding: 0, flex: 1}}
                scroll      = {{ x : 800, y: 600}}
                pagination  = { false }
                onRow       = {(record) => ({
                    onClick : () => { setSelectedRowKeys([record.dataIndex]) }
                })}
                rowSelection= { rowSelection }
            />
            :
            // 포장
            accidentType == 6 ? 
            <Table 
                rowKey      = { 'dataIndex' }
                dataSource  = { packingList }
                columns     = { packingColumns }
                size        = { 'middle' }
                bordered    = { true }
                style       = {{ padding: 0, flex: 1}}
                scroll      = {{ x : 800, y: 600}}
                pagination  = { false }
                onRow       = {(record) => ({
                    onClick : () => { setSelectedRowKeys([record.dataIndex]) }
                })}
                rowSelection= { rowSelection }
            />
            :
            // 부속 제작
            accidentType == 7 ? 
            <Table 
                rowKey      = { 'dataIndex' }
                dataSource  = { accessoryList }
                columns     = { accessoryColumns }
                size        = { 'middle' }
                bordered    = { true }
                style       = {{ padding: 0, flex: 1}}
                scroll      = {{ x : 800, y: 600}}
                pagination  = { false }
                onRow       = {(record) => ({
                    onClick : () => { setSelectedRowKeys([record.dataIndex]) }
                })}
                rowSelection= { rowSelection }
            />
            :
            <></>
        }
        </Row>
    )
}))

export default inject('commonStore')(observer(AccidentDetail))


