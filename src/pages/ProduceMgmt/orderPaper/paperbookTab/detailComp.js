import React from 'react'
import { inject, observer } from 'mobx-react'
import { Row, Col, Button, Table, Modal } from 'antd'
import { FormikContext, FormikProvider, useFormik } from 'formik'
import { isEmpty } from '@components/Common/Js'
import FormikInput from '@components/form/CustomInput'
import { PaperBookContext } from '.'
import * as Yup from 'yup'

const DetailComp = ({ commonStore }) => {
    const formikHook    = React.useContext(FormikContext)
    const providerData  = React.useContext(PaperBookContext)
    // 추가/수정/보기 상태, create/modify/view
    const [mode,            setMode             ] = React.useState('view')
    const [selectedRowKeys, setSelectedRowKeys  ] = React.useState([])
    // SelectBox Options (fetchData 에서 가져온)
    const [selectboxProduceCodeDetails, setSelectboxProduceCodeDetails ] = React.useState([])
    const [selectboxPaperStandards,     setSelectboxPaperStandards     ] = React.useState([])
    const [selectboxPaperInformations,  setSelectboxPaperInformations  ] = React.useState([])
    // formik 기본 값 Not necessary
    const initialValues = {}
    // formik 유효성 검사. required만 먼저
    const validationSchema      = Yup.object().nullable().shape({
        produce_code_detail_id  : Yup.number().nullable().label('세부 구성').required(),
        page_number             : Yup.string().nullable().label('쪽수').required(), 
        paper_standard_id       : Yup.number().nullable().label("종이 규격").required(),
        main_outside            : Yup.string().nullable().label('적용 절수').required(), 
        width                   : Yup.string().nullable().label('가로').required(),
        height                  : Yup.string().nullable().label('세로').required(),
        memo                    : Yup.string().nullable().label('판걸이 설명'),
        paper_information_id    : Yup.number().nullable().label('인쇄 종이').required(),
        front_primary_color     : Yup.string().nullable().label('원색'),
        front_spot_color        : Yup.string().nullable().label('별색'),
        front_background_color  : Yup.string().nullable().label('바탕 별색'),
        front_cmyk              : Yup.string().nullable().label('앞면 도수'),
        back_primary_color      : Yup.string().nullable().label('배면 원색'),
        back_spot_color         : Yup.string().nullable().label('배면 별색'),
        back_background_color   : Yup.string().nullable().label('배면 바탕 별색'),
        back_cmyk               : Yup.string().nullable().label('배면 도수'),
        produce_code_detail     : Yup.object().nullable().shape({
            name                : Yup.string().nullable().label('표지'), 
            print_unit          : Yup.string().nullable().label('인쇄 적용 단가'), 
        }),
        paper_information       : Yup.object().nullable().shape({
            paper_name          : Yup.string().nullable().label("인쇄 종이")
        }),
        paper_standard          : Yup.object().nullable().shape({
            paper_name          : Yup.string().nullable().label("종이 규격")
        }),
    })
    // 수정/추가 이후 확인 버튼 클릭했을 때 액션
    const onSubmit = (submitData) => {
        // 기본 구성 입력 값을 전체 데이터에 추가/수정한다.
        var targetIndex = 0
        // 수정인지 추가인지 확인
        // 추가라면
        if ( mode === 'create' ) {
            // details가 배열인지 확인 (초기 값이 없을 수 있음)
            if (Array.isArray(formikHook.values?.defaults[providerData.defaultRowIndex]?.details)) {
                // 있으면 Index 추가
                targetIndex = formikHook.values?.defaults[providerData.defaultRowIndex]?.details.length
            }
            else {
                // 초기 값이 없으면
                targetIndex = 0
            }
            formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.dataIndex`,   providerData.dataIndexs.detail.current)
            formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.prepresses`,  [])
            formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.papers`,      [])
            formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.prints`,      [])
            formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.bindings`,    [])
            formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.processings`, [])
            formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.packings`,    [])
            formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.accessories`, [])
        }
        // 수정이면
        else {
            // 목록에 선택되어 있는 index 지정
            targetIndex = providerData.detailRowIndex
        }
        // 상품 세부 구성
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.produce_code_detail_id`,   submitData.produce_code_detail_id)
        // 상품 세부 구성 (상세)
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.produce_code_detail`,      submitData.produce_code_detail)
        // 쪽수
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.page_number`,              submitData.page_number)
        // 종이 규격
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.paper_standard_id`,        submitData.paper_standard_id)
        // 종이 규격 (상세)
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.paper_standard`,           submitData.paper_standard)
        // 본문 또는 본문외 적용 절수
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.main_outside`,             submitData.main_outside)
        // 가로
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.width`,                    submitData.width)
        // 세로
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.height`,                   submitData.height)
        // 인쇄 종이
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.paper_information_id`,     submitData.paper_information_id)
        // 인쇄 종이 (상세)
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.paper_information`,        submitData.paper_information)
        // 판걸이 설명
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.memo`,                     submitData.memo)
        // 원색
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.front_primary_color`,      submitData.front_primary_color)
        // 별색
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.front_spot_color`,         submitData.front_spot_color)
        // 바탕 별색
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.front_background_color`,   submitData.front_background_color)
        // 앞면 도수
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.front_cmyk`,               submitData.front_cmyk)
        // 배면 원색
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.back_primary_color`,       submitData.back_primary_color)
        // 배면 별색
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.back_spot_color`,          submitData.back_spot_color)
        // 배면 바탕 별색
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.back_background_color`,    submitData.back_background_color)
        // 뒷면 도수
        formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${targetIndex}.back_cmyk`,                submitData.back_cmyk)
        
        // 추가인 경우 추가된 Row가 선택된 상태로 전환
        if ( mode === 'create' ) {
            setSelectedRowKeys([providerData.dataIndexs.detail.current])
        }
        // 보기 화면으로 전환
        setMode('view')
        providerData.dataIndexs.detail.current++
    }
    // 삭제 버튼 클릭했을 때 액션
    const onDelete = () => {
        Modal.confirm({
            content : (<> 
                <Row>정말 삭제하시겠습니까?</Row>
                <Row>삭제 시 하위 구성 정보가 모두 삭제됩니다.</Row> 
            </>), 
            onOk : () => {
                setMode('view')
                // 선택된 Row 초기화
                providerData.setSelectedDetailsRow({})
                // 전체 데이터 중 해당 Row 제거 (index 기준)
                console.log("onOk")
                console.log(formikHook.values.defaults[providerData.defaultRowIndex]?.details.filter((row, index) => index !== providerData.detailRowIndex))
                formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details`, formikHook.values.defaults[providerData.defaultRowIndex]?.details.filter((row, index) => index !== providerData.detailRowIndex))
            }
        })
    }
    // formik Hook 선언
    const formikDetailHook = useFormik({ initialValues, onSubmit, validationSchema })
    // TABLE Setting
    const columns = [{
        dataIndex : 'produce_code_detail_id', 
        title : '구분',
        width : 120, 
        ellipsis : true, 
        render : (text, record, index) => <>{record?.produce_code_detail?.name} ({record?.front_cmyk}/{record?.back_cmyk}도)</>
    }, {
        dataIndex : "page_number", 
        title : "쪽수" , 
        width : 60, 
        align : "right", 
    }, {
        dataIndex : ["paper_standard", "name"], 
        title : "종이 규격", 
        width : 120, 
    }, {
        dataIndex : "main_outside", 
        title : "본문 적용 절수",
        width : 80,  
        align: "right"
    }, {
        dataIndex : "width", 
        title : "가로" , 
        width : 80,  
        align : "right"
    }, {
        dataIndex : "height", 
        title : "세로" , 
        width : 80,  
        align : "right"
    }, {
        dataIndex : ["paper_information", "paper_name"], 
        title : "인쇄 종이", 
        ellipsis : true, 
    }, {
        dataIndex : "memo", 
        title : "판걸이 설명", 
        width : 120, 
        ellipsis : true, 
    }, ]
    // Table Select Options
    const rowSelection = {
        type : 'radio', 
        selectedRowKeys,
        columnWidth: 0, 
        renderCell: () => <></>,
        onChange: setSelectedRowKeys,
    }
    // 도수 쪽 0~4 선택하도록.. options
    const selectNumber = [{
        label : 0, value : 0,
    }, {
        label : 1, value : 1,
    }, {
        label : 2, value : 2,
    }, {
        label : 3, value : 3,
    }, {
        label : 4, value : 4,
    }]
    // 페이지 로딩 시 select options fetch
    React.useEffect(() => {
        commonStore.handleApi({
            url : `/produce-code-details`
        })
        .then((result) => {
            setSelectboxProduceCodeDetails(result.data)
        })
        commonStore.handleApi({
            url : `/paper-standards`
        })
        .then((result) => {
            setSelectboxPaperStandards(result.data)
        })
        commonStore.handleApi({
            url : `/paper-information`
        })
        .then((result) => {
            setSelectboxPaperInformations(result.data)
        })
    }, [])
    // 수정/추가/취소 등 버튼 클릭 후 액션
    React.useEffect(() => {
        if (mode === 'view') {
            // 수정완료, 취소, 
            formikDetailHook.setValues(formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex])
        }
        else if (mode === 'modify') {
            // target을 해당 메뉴로 잡는다
            providerData.setActiveMenuTarget('detail')
        }
        else if (mode === 'create') {
            // 선택된 값 초기화
            providerData.setSelectedDetailsRow({})
            setSelectedRowKeys([])
            // 비어있는 초기값을 집어넣어
            formikDetailHook.setValues({})
            // target을 해당 메뉴로 잡는다
            providerData.setActiveMenuTarget('detail')
        }
    }, [formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex], mode])
    // 다른 메뉴에서 수정/추가 버튼을 클릭했을 때 초기화
    React.useEffect(() => {
        if (providerData.activeMenuTarget !== 'detail') {
            setMode('view')
        }
    }, [providerData.activeMenuTarget])
    // 선택한 Row가 달라지면 오른쪽 내용 재구성
    React.useEffect(() => {
        providerData.setSelectedDetailsRow(formikHook.values.defaults[providerData.defaultRowIndex]?.details.filter(row => row.dataIndex == selectedRowKeys[0])[0] ) 
    }, [selectedRowKeys])
    // 본문 적용 절수
    // (기본구성 > 본문 절수) / (세부 구성 > 종이 규격 (종이 절수))
    React.useEffect(() => {
        // 세부 구성이 본문일 때만 본문 적용 절수를 입력한다. 
        if (formikDetailHook.values?.produce_code_detail_id &&
            formikDetailHook.values?.paper_standard_id &&
            formikDetailHook.values?.produce_code_detail?.print_unit == "본문"
        ) {
            formikDetailHook.setFieldValue(`main_outside`, (formikHook.values.defaults[providerData.defaultRowIndex].paper_cutting / formikDetailHook.values?.paper_standard?.paper_cutting))
        }
    }, [formikDetailHook.values?.produce_code_detail_id, formikDetailHook.values?.paper_standard_id])
    // 도수 (앞면)
    // 원색 + 별색 + 바탕 별색
    React.useEffect(() => {
        Number.isInteger(formikDetailHook.values?.front_primary_color + formikDetailHook.values?.front_spot_color + formikDetailHook.values?.front_background_color) &&
        formikDetailHook.setFieldValue('front_cmyk', (formikDetailHook.values?.front_primary_color + formikDetailHook.values?.front_spot_color + formikDetailHook.values?.front_background_color))
    }, [formikDetailHook.values?.front_primary_color, formikDetailHook.values?.front_spot_color, formikDetailHook.values?.front_background_color])
    // 도수 (뒷면)
    // 원색 + 별색 + 바탕 별색
    React.useEffect(() => {
        Number.isInteger(formikDetailHook.values?.back_primary_color + formikDetailHook.values?.back_spot_color + formikDetailHook.values?.back_background_color) &&
        formikDetailHook.setFieldValue(`back_cmyk`, formikDetailHook.values?.back_primary_color + formikDetailHook.values?.back_spot_color + formikDetailHook.values?.back_background_color)
    }, [formikDetailHook.values?.back_primary_color, formikDetailHook.values?.back_spot_color, formikDetailHook.values?.back_background_color])
    // 공정 > 종이
    // 전지 구분 값 변경 시
    // 본문 절수 / 전지 구분 값 => 본문 적용 절수
    React.useEffect(() => {
        if (formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.paper_standard?.paper_cutting != 0) {
            formikHook.setFieldValue(
                `defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.main_outside`, 
                formikHook.values.defaults[providerData.defaultRowIndex]?.paper_cutting / 
                formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.paper_standard?.paper_cutting
            )
        }
        else {
            formikHook.setFieldValue(`defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.main_outside`, 0)
        }
    }, [formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.paper_standard])
    // 쪽수, 본문 적용 절수 변경 시
    // 쪽수 / 본문 적용절수 / 2 => 종이 대수, 인쇄 대수
    React.useEffect(() => {
        if (Array.isArray(formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.papers)) {
            for(var index = 0; index < formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.papers.length; index++) {
                if (formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.main_outside * 1 == 0 || 
                    formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.main_outside * 1 == undefined
                ) {
                    formikHook.setFieldValue(
                        `defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.papers.${index}.ds`, 
                        0
                    )
                }
                else {
                    formikHook.setFieldValue(
                        `defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.papers.${index}.ds`, 
                        formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.page_number / 
                        formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.main_outside / 
                        2 
                    )
                    formikHook.setFieldValue(
                        `defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.prints.${index}.ds`, 
                        formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.page_number / 
                        formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.main_outside / 
                        2 
                    )
                }
            }
        }
    }, [formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.page_number, 
        formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.main_outside
    ])
    // 공정 > 인쇄
    // 인쇄 정미 * 적용 도수 (앞면 + 뒷면) => 인쇄 수량
    React.useEffect(() => {
        if (Array.isArray(formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints)) {
            for(var index = 0; index < formikHook.values?.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints.length; index++) {
                if (formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.front_cmyk * 1 == 0 || 
                    formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.front_cmyk * 1 == undefined || 
                    formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.back_cmyk * 1 == 0 || 
                    formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.back_cmyk * 1 == undefined
                ) {
                    formikHook.setFieldValue(
                        `defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.prints.${index}.print_qty`, 
                        0
                    )
                }
                else {
                    formikHook.setFieldValue(
                        `defaults.${providerData.defaultRowIndex}.details.${providerData.detailRowIndex}.prints.${index}.print_qty`, 
                        formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.prints[index]?.jm_hook * 
                        (
                            formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.front_cmyk + 
                            formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.back_cmyk 
                        ) 
                    )
                }
            }
        }
    }, [formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.front_cmyk, 
        formikHook.values.defaults[providerData.defaultRowIndex]?.details[providerData.detailRowIndex]?.back_cmyk
    ])
    // Defaults (기본 구성) 중 선택된 row가 없으면 비워둔다. <></> return
    if (!isEmpty(providerData.selectedDefaultsRow) && providerData.detailRowIndex !== -2) {
        return (
            <div style={{margin: '30px 0'}}>
                <Row gutter={10} className="table">
                    <Col xs={24} lg={24} className="addLabel">세부 구성</Col>
                    <Col xs={24} lg={24} style={{display: 'flex', flexWrap: 'wrap', padding: 0, border: 0}}>
                        {/* 왼쪽 테이블 영역 */}
                        <Col xs={8} lg={8}>
                            <Table 
                                rowKey      = { 'dataIndex' }
                                dataSource  = { providerData.defaultRowIndex !== -1 ? formikHook.values?.defaults[providerData.defaultRowIndex]?.details : [] }
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
                                {(providerData.detailRowIndex !== -1 || mode === 'create') && 
                                    <>
                                        <Row style={{border: 0}}>
                                            <Col xs={6} lg={6} className="label">세부 구성 <span className="spanStar">*</span></Col>
                                            <Col xs={6} lg={18} className="input_box">
                                                <FormikInput 
                                                    name={`produce_code_detail_id`}
                                                    type={'select'}
                                                    style={{width: '100%'}}
                                                    data={{
                                                        options : selectboxProduceCodeDetails,
                                                        label : 'name', 
                                                        value : 'id', 
                                                    }}
                                                    disabled={mode === 'view' ? true : false}
                                                    onChange={selectedId => {
                                                        var selectedRow = selectboxProduceCodeDetails.filter(row => row.id == selectedId)[0]
                                                        formikDetailHook.setFieldValue('produce_code_detail.id', selectedRow?.id)
                                                        formikDetailHook.setFieldValue('produce_code_detail.name', selectedRow?.name)
                                                        formikDetailHook.setFieldValue('produce_code_detail.print_unit', selectedRow?.print_unit)
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                        <Row style={{border: 0, margin: "10px 0"}}>
                                            <Col xs={6} lg={4} className="label">쪽수 <span className="spanStar">*</span></Col>
                                            <Col xs={6} lg={4} className="input_box verCenter">
                                                <FormikInput name={`page_number`} disabled={mode === 'view' ? true : false}/>
                                            </Col>
                                            <Col xs={6} lg={4} className="label">종이 규격 <span className="spanStar">*</span></Col>
                                            <Col xs={6} lg={12} className="input_box verCenter">
                                                <FormikInput 
                                                    name={`paper_standard_id`}
                                                    type={'select'}
                                                    style={{width: '100%'}}
                                                    data={{
                                                        options : selectboxPaperStandards,
                                                        label : 'name', 
                                                        value : 'id', 
                                                    }}
                                                    disabled={mode === 'view' ? true : false}
                                                    onChange={selectedId => {
                                                        var selectedRow = selectboxPaperStandards.filter(row => row.id == selectedId)[0]
                                                        formikDetailHook.setFieldValue(`paper_standard`, { 
                                                            id : selectedRow?.id , 
                                                            name : selectedRow?.name,
                                                            paper_cutting : selectedRow?.paper_cutting
                                                        })
                                                    }}
                                                />
                                            </Col>
                                            <Col xs={6} lg={4} className="label">{formikDetailHook.values?.produce_code_detail?.print_unit == "본문" ? "본문 적용 절수" : "면지 판걸이 수" } <span className="spanStar">*</span></Col>
                                            <Col xs={6} lg={4} className="input_box verCenter">
                                                <FormikInput name={`main_outside`} disabled={mode === 'view' ? true : false}/>
                                            </Col>
                                            <Col xs={6} lg={4} className="label">가로 <span className="spanStar">*</span></Col>
                                            <Col xs={6} lg={4} className="input_box verCenter">
                                                <FormikInput name={`width`} disabled={mode === 'view' ? true : false}/>
                                            </Col>
                                            <Col xs={6} lg={4} className="label">세로 <span className="spanStar">*</span></Col>
                                            <Col xs={6} lg={4} className="input_box verCenter">
                                                <FormikInput name={`height`} disabled={mode === 'view' ? true : false}/>
                                            </Col>
                                        </Row>

                                        <Row style={{border: 0}}>
                                            <Col xs={6} lg={6} className="label">인쇄 종이 <span className="spanStar">*</span></Col>
                                            <Col xs={18} lg={18} className="input_box verCenter">
                                                <FormikInput 
                                                    name={`paper_information_id`}
                                                    type={'select'}
                                                    style={{width: '100%'}}
                                                    data={{
                                                        options : selectboxPaperInformations,
                                                        label : 'paper_name', 
                                                        value : 'id', 
                                                    }}
                                                    disabled={mode === 'view' ? true : false}
                                                    onChange={selectedId => {
                                                        var selectedRow = selectboxPaperInformations.filter(row => row.id == selectedId)[0]
                                                        formikDetailHook.setFieldValue(`paper_information`, { 
                                                            id : selectedRow?.id , 
                                                            paper_name : selectedRow?.paper_name
                                                        })
                                                    }}
                                                />
                                            </Col>
                                            <Col xs={6} lg={6} className="label">판걸이 설명</Col>
                                            <Col xs={18} lg={18} className="input_box verCenter">
                                                <FormikInput name={`memo`} disabled={mode === 'view' ? true : false}/>
                                            </Col>
                                        </Row>
        
                                        <Row style={{width: '100%', border: 0, marginTop: 10}}>
                                            <Col lg={4} className="label">색상</Col>
                                            <Col lg={5} className="label">원색</Col>
                                            <Col lg={5} className="label">별색</Col>
                                            <Col lg={5} className="label">바탕 별색</Col>
                                            <Col lg={5} className="label">도수</Col>
                                            <Col lg={4} className="label">앞면</Col>
                                            <Col lg={5} className="input_box">
                                                <FormikInput 
                                                    name={`front_primary_color`}
                                                    type={'select'}
                                                    style={{width: '100%'}}
                                                    data={{ options : selectNumber}}
                                                    disabled={mode === 'view' ? true : false}
                                                />
                                            </Col>
                                            <Col lg={5} className="input_box">
                                                <FormikInput 
                                                    name={`front_spot_color`}
                                                    type={'select'}
                                                    style={{width: '100%'}}
                                                    data={{ options : selectNumber}}
                                                    disabled={mode === 'view' ? true : false}
                                                />
                                            </Col>
                                            <Col lg={5} className="input_box">
                                                <FormikInput 
                                                    name={`front_background_color`}
                                                    type={'select'}
                                                    style={{width: '100%'}}
                                                    data={{ options : selectNumber}}
                                                    disabled={mode === 'view' ? true : false}
                                                />
                                            </Col>
                                            <Col lg={5} className="input_box" style={{alignItems: 'center'}}>
                                                <FormikInput 
                                                    name={`front_cmyk`}
                                                    style={{width: '100%'}}
                                                    disabled={mode === 'view' ? true : false}
                                                    readOnly={true}
                                                />
                                            </Col>
                                            <Col lg={4} className="label">뒷면</Col>
                                            <Col lg={5} className="input_box">
                                                <FormikInput 
                                                    name={`back_primary_color`}
                                                    type={'select'}
                                                    style={{width: '100%'}}
                                                    data={{ options : selectNumber}}
                                                    disabled={mode === 'view' ? true : false}
                                                />
                                            </Col>
                                            <Col lg={5} className="input_box">
                                                <FormikInput 
                                                    name={`back_spot_color`}
                                                    type={'select'}
                                                    style={{width: '100%'}}
                                                    data={{ options : selectNumber}}
                                                    disabled={mode === 'view' ? true : false}
                                                />
                                            </Col>
                                            <Col lg={5} className="input_box">
                                                <FormikInput 
                                                    name={`back_background_color`}
                                                    type={'select'}
                                                    style={{width: '100%'}}
                                                    data={{ options : selectNumber}}
                                                    disabled={mode === 'view' ? true : false}
                                                />
                                            </Col>
                                            <Col lg={5} className="input_box" style={{alignItems: 'center'}}>
                                                <FormikInput 
                                                    name={`back_cmyk`}
                                                    style={{width: '100%'}}
                                                    disabled={mode === 'view' ? true : false}
                                                    readOnly={true}
                                                />
                                            </Col>
                                        </Row>
                                    </>
                                }
                                {providerData.viewType !== 'view' &&
                                <Row gutter={[10, 10]} justify="center" style={{border: 0, marginTop: 20 }}>
                                    {(providerData.detailRowIndex === -1 && mode !== 'create') ?
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
                            </Col>
                        </FormikProvider>
                    </Col>
                </Row>
            </div>
        )
    }
    else {
        return <></>
    }
}

export default inject('commonStore')(observer(DetailComp))
