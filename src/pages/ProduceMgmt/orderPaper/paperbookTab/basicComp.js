import React from 'react'
import { Row, Col, Button, Table, Modal } from 'antd'
import { inject, observer } from 'mobx-react';
import { FormikContext, FormikProvider, useFormik } from 'formik';
import FormikInput from '@components/form/CustomInput';
import { PaperBookContext } from '.';
import * as Yup from 'yup'

const BasicComp = ({commonStore}) => {
    const formikHook    = React.useContext(FormikContext)
    const providerData  = React.useContext(PaperBookContext)
    // 추가/수정/보기 상태, create/modify/view
    const [mode,            setMode             ] = React.useState('view')
    const [selectedRowKeys, setSelectedRowKeys  ] = React.useState([])
    // SelectBox Options (fetchData 에서 가져온)
    const [selectboxProduceCode1, setSelectboxProduceCode1] = React.useState([])
    const [selectboxProduceCode2, setSelectboxProduceCode2] = React.useState([])
    const [selectboxProduceCode3, setSelectboxProduceCode3] = React.useState([])
    const [selectboxProduceCodeOrigin2, setSelectboxProduceCodeOrigin2] = React.useState([])
    // formik 기본 값 Not necessary
    const initialValues = {}
    // formik 유효성 검사. required만 먼저
    const validationSchema  = Yup.object().nullable().shape({
        produce_code1_id    : Yup.number().nullable().label('기본 구성').required(),
        produce_code2_id    : Yup.number().nullable().label('기본 구성').required(),
        produce_format_id   : Yup.number().nullable().label('판형').required(),
        width               : Yup.string().nullable().label('가로').required(),
        height              : Yup.string().nullable().label('세로').required(),
        flap_front          : Yup.string().nullable().label('앞날개'),
        flap_back           : Yup.string().nullable().label('뒷날개'),
        spine               : Yup.string().nullable().label('책등').required(),
        paper_cutting       : Yup.string().nullable().label('본문 절수').required(),
        paper_holder        : Yup.string().nullable().label('면지 판걸이 수').required(),
        paper_standard_id   : Yup.string().nullable().label('종이 규격'),
        produce_code1       : Yup.object().nullable().shape({
        }),
        produce_code2       : Yup.object().nullable().shape({
        }),
        produce_format      : Yup.object().nullable().shape({
        }),
        paper_standard      : Yup.object().nullable().shape({
        }),
    })
    // 수정/추가 이후 확인 버튼 클릭했을 때 액션
    const onSubmit = async (submitData) => {
        // 기본 구성 입력 값을 전체 데이터에 추가/수정한다.
        var targetIndex = 0
        // 수정인지 추가인지 확인
        // 추가라면
        if ( mode === 'create' ) {
            // defaults가 배열인지 확인 (초기 값이 없을 수 있음)
            if (Array.isArray(formikHook.values?.defaults)) {
                // 있으면 Index 추가
                targetIndex = formikHook.values?.defaults.length
            }
            else {
                // 초기 값이 없으면
                targetIndex = 0
            }
            formikHook.setFieldValue(`defaults.${targetIndex}.dataIndex`, providerData.dataIndexs.default.current)
            formikHook.setFieldValue(`defaults.${targetIndex}.details`, [])
        }
        // 수정이면
        else {
            // 목록에 선택되어 있는 index 지정
            targetIndex = providerData.defaultRowIndex
        }
        // 기본구성 1차
        formikHook.setFieldValue(`defaults.${targetIndex}.produce_code1`,     submitData.produce_code1)
        formikHook.setFieldValue(`defaults.${targetIndex}.produce_code1_id`,  submitData.produce_code1_id)
        // 기본구성 2차
        formikHook.setFieldValue(`defaults.${targetIndex}.produce_code2`,     submitData.produce_code2)
        formikHook.setFieldValue(`defaults.${targetIndex}.produce_code2_id`,  submitData.produce_code2_id)
        // 판형
        formikHook.setFieldValue(`defaults.${targetIndex}.produce_format`,    submitData.produce_format)
        formikHook.setFieldValue(`defaults.${targetIndex}.produce_format_id`, submitData.produce_format_id)
        // 가로
        formikHook.setFieldValue(`defaults.${targetIndex}.width`,             submitData.width)
        // 세로
        formikHook.setFieldValue(`defaults.${targetIndex}.height`,            submitData.height)
        // 앞날개
        formikHook.setFieldValue(`defaults.${targetIndex}.flap_front`,        submitData.flap_front)
        // 뒷날개
        formikHook.setFieldValue(`defaults.${targetIndex}.flap_back`,         submitData.flap_back)
        // 책등
        formikHook.setFieldValue(`defaults.${targetIndex}.spine`,             submitData.spine)
        // 본문 절수
        formikHook.setFieldValue(`defaults.${targetIndex}.paper_cutting`,     submitData.paper_cutting)
        // 면지 판걸이 수
        formikHook.setFieldValue(`defaults.${targetIndex}.paper_holder`,      submitData.paper_holder)
        // 종이 규격
        formikHook.setFieldValue(`defaults.${targetIndex}.paper_standard`,    submitData.paper_standard)
        formikHook.setFieldValue(`defaults.${targetIndex}.paper_standard_id`, submitData.paper_standard_id)
        // 추가인 경우 추가된 Row가 선택된 상태로 전환
        if ( mode === 'create' ) {
            setSelectedRowKeys([providerData.dataIndexs.default.current])
        }
        // 보기 화면으로 전환
        setMode('view')
        providerData.dataIndexs.default.current++
    }
    // 삭제 버튼 클릭했을 때 액션
    const onDelete = () => {
        Modal.confirm({
            content : (<> 
                <Row>정말 삭제하시겠습니까?</Row>
                <Row>삭제 시 하위 구성 정보가 모두 삭제됩니다.</Row> 
            </>), 
            onOk : () => {
                // 선택된 Row 초기화
                providerData.setSelectedDefaultsRow({})
                // 전체 데이터 중 해당 Row 제거 (index 기준)
                formikHook.setFieldValue(`defaults`, formikHook.values.defaults.filter((row, index) => index !== providerData.defaultRowIndex))
            }
        })
    }
    // formik Hook 선언
    const formikDetailHook = useFormik({ initialValues, onSubmit, validationSchema })
    // TABLE Setting
    const columns = [{
        dataIndex : [`produce_code2`, `name`], 
        title : "구분", 
        width : 80,
    }, {
        dataIndex : [`produce_format`, `name`],
        title : "판형", 
        width : 120,
    }, {
        dataIndex : "width", 
        title : "가로", 
        width : 80, 
        align : "right",
    }, {
        dataIndex : "height", 
        title : "세로", 
        width : 80, 
        align : "right",
    }, {
        dataIndex : "spine", 
        title : "책등", 
        width : 80, 
        align : "right",
    }, {
        dataIndex : [`paper_standard`, `name`], 
        title : "종이 규격", 
        width : 120,
    }, {
        dataIndex : "paper_cutting", 
        title : "본문 절수", 
        width : 80, 
        align : "right",
    }, {
        dataIndex : "paper_holder", 
        title : "면지 판걸이 수", 
        width : 80, 
        align : "right",
        ellipsis : true
    }, ]
    // Table Select Options
    const rowSelection = {
        type : 'radio', 
        selectedRowKeys,
        columnWidth: 0, 
        renderCell: () => <></>,
        onChange: setSelectedRowKeys,
    }
    // 페이지 로딩 시 select options fetch
    React.useEffect(() => {
        commonStore.handleApi({
            url : `/produce-code1`
        })
        .then((result) => {
            setSelectboxProduceCode1(result.data)
        })

        commonStore.handleApi({
            url : `/produce-code2`
        })
        .then((result) => {
            setSelectboxProduceCodeOrigin2(result.data)
            setSelectboxProduceCode2(result.data)
        })

        commonStore.handleApi({
            url : `/produce-formats`
        })
        .then((result) => {
            setSelectboxProduceCode3(result.data)
        })
    }, [])
    // 수정/추가/취소 등 버튼 클릭 후 액션
    React.useEffect(() => {
        if (mode === 'view') {
            // 수정완료, 취소, 
            formikDetailHook.setValues(formikHook.values.defaults[providerData.defaultRowIndex])
        }
        else if (mode === 'modify') {
            // target을 해당 메뉴로 잡는다
            providerData.setActiveMenuTarget('basic')
        }
        else if (mode === 'create') {
            // 선택된 값 초기화
            providerData.setSelectedDefaultsRow({})
            setSelectedRowKeys([])
            // 비어있는 초기값을 집어넣어
            formikDetailHook.setValues({})
            // target을 해당 메뉴로 잡는다
            providerData.setActiveMenuTarget('basic')
        }
    }, [formikHook.values.defaults[providerData.defaultRowIndex], mode])
    // 다른 메뉴에서 수정/추가 버튼을 클릭했을 때 초기화
    React.useEffect(() => {
        if (providerData.activeMenuTarget !== 'basic') {
            setMode('view')
        }
    }, [providerData.activeMenuTarget])
    // 기본 구성 (1차 변경 시 2차 재구성)
    React.useEffect(() => {
        setSelectboxProduceCode2(selectboxProduceCodeOrigin2.filter(row => row.produce_code1_id === formikDetailHook.values?.produce_code1_id))
        // formikDetailHook.setFieldValue(`produce_code2_id`, selectboxProduceCodeOrigin2.filter(row => row.produce_code1_id === formikDetailHook.values?.produce_code1_id)[0]?.id)
    }, [formikDetailHook.values?.produce_code1_id])
    // 선택한 Row가 달라지면 오른쪽 내용 재구성
    React.useEffect(() => {
        providerData.setSelectedDefaultsRow(formikHook.values.defaults.filter(row => row.dataIndex == selectedRowKeys[0])[0] ) 
    }, [selectedRowKeys])
    
    return(
        <div>
            <Row gutter={10} className="table">
                <Col xs={24} lg={24} className="addLabel">
                    기본 구성
                </Col>
                <Col xs={24} lg={24} style={{display: 'flex', flexWrap: 'wrap', padding: 0, border: 0}}>
                    {/* 왼쪽 테이블 영역 */}
                    <Col xs={8} lg={8}>
                        <Table 
                            rowKey      = { 'dataIndex' }
                            dataSource  = { formikHook.values.defaults }
                            columns     = { columns }
                            size        = { 'middle' }
                            bordered    = { true }
                            style       = {{ padding: 0, flex: 1, minHeight : 200}}
                            sticky      = {{ offsetHeader : -20 }}
                            scroll      = {{ x : 800, y: 600}}
                            pagination  = { false }
                            onRow       = {(record) => ({
                                onClick : () => { setSelectedRowKeys([record.dataIndex]) }
                            })}
                            rowSelection= { rowSelection }
                        />                        
                    </Col>
                    {/* 오른쪽 폼 영역 */}
                    <FormikProvider value={formikDetailHook}>
                        <Col xs={16} lg={16} style={{backgroundColor: '#ddd'}}>
                            {(providerData.defaultRowIndex !== -1 || mode === 'create') &&
                                <>
                                    <Row style={{border: 0}}>
                                        <Col xs={6} lg={3} className="label">기본 구성 <span className="spanStar">*</span></Col>
                                        <Col xs={6} lg={21} className="input_box">
                                            <div style={{flexDirection: 'row', display: 'flex'}}>
                                                <div style={{flex: 3, marginRight: 10}}>
                                                    <FormikInput 
                                                        name={`produce_code1_id`}
                                                        type={'select'}
                                                        style={{width: '100%'}}
                                                        data={{
                                                            options : selectboxProduceCode1,
                                                            label : 'name', 
                                                            value : 'id', 
                                                        }}
                                                        disabled={mode === 'view' ? true : false}
                                                        onChange={selectedId => {
                                                            var selectedRow = selectboxProduceCode1.filter(row => row.id == selectedId)[0]
                                                            formikDetailHook.setFieldValue(`produce_code1`, { 
                                                                id : selectedRow?.id , 
                                                                name : selectedRow?.name 
                                                            })
                                                        }}
                                                    />
                                                </div>
                                                <div style={{flex:5}}>
                                                    <FormikInput 
                                                        name={`produce_code2_id`}
                                                        type={'select'}
                                                        style={{width: '100%'}}
                                                        data={{
                                                            options : selectboxProduceCode2,
                                                            label : 'name', 
                                                            value : 'id', 
                                                        }}
                                                        disabled={mode === 'view' ? true : false}
                                                        onChange={selectedId => {
                                                            var selectedRow = selectboxProduceCode2.filter(row => row.id == selectedId)[0]
                                                            formikDetailHook.setFieldValue(`produce_code2`, { 
                                                                id : selectedRow?.id , 
                                                                name : selectedRow?.name 
                                                            })
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>

                                    <Row style={{border: 0, margin: '10px 0'}}>
                                        <Col xs={6} lg={4} className="label">판형 <span className="spanStar">*</span></Col>
                                        <Col xs={6} lg={4} className="input_box">
                                            <FormikInput 
                                                name={`produce_format_id`}
                                                type={'select'}
                                                style={{width: '100%'}}
                                                data={{
                                                    options : selectboxProduceCode3,
                                                    label : 'name', 
                                                    value : 'id', 
                                                }}
                                                onChange={ selectedId => {
                                                    var selectedRow = selectboxProduceCode3.filter(row => row.id == selectedId)[0]
                                                    formikDetailHook.setFieldValue(`produce_format`, { 
                                                        id : selectedRow?.id , 
                                                        name : selectedRow?.name 
                                                    })
                                                    formikDetailHook.setFieldValue(`paper_standard`, selectedRow?.paper_standard)
                                                    formikDetailHook.setFieldValue(`paper_cutting`, selectedRow?.paper_cutting)
                                                    formikDetailHook.setFieldValue(`paper_holder`, selectedRow?.paper_holder)
                                                }}
                                                disabled={mode === 'view' ? true : false}
                                            />
                                        </Col>
                                        <Col xs={6} lg={4} className="label">가로 <span className="spanStar">*</span></Col>
                                        <Col xs={6} lg={4} className="input_box">
                                            <FormikInput name={`width`} disabled={mode === 'view' ? true : false}/>
                                        </Col>
                                        <Col xs={6} lg={4} className="label">세로 <span className="spanStar">*</span></Col>
                                        <Col xs={6} lg={4} className="input_box">
                                            <FormikInput name={`height`} disabled={mode === 'view' ? true : false}/>
                                        </Col>
                                        <Col xs={6} lg={4} className="label">책등 <span className="spanStar">*</span></Col>
                                        <Col xs={6} lg={4} className="input_box">
                                            <FormikInput name={`spine`} disabled={mode === 'view' ? true : false}/>
                                        </Col>
                                        <Col xs={6} lg={4} className="label">앞날개</Col>
                                        <Col xs={6} lg={4} className="input_box">
                                            <FormikInput name={`flap_front`} disabled={mode === 'view' ? true : false}/>
                                        </Col>
                                        <Col xs={6} lg={4} className="label">뒷날개</Col>
                                        <Col xs={6} lg={4} className="input_box">
                                            <FormikInput name={`flap_back`} disabled={mode === 'view' ? true : false}/>
                                        </Col>
                                    </Row>
                                    
                                    <Row style={{border: 0}}>
                                        <Col xs={6} lg={4} className="label">종이 규격</Col>
                                        <Col xs={6} lg={4} className="input_box">{formikDetailHook.values?.paper_standard?.name}</Col>
                                        <Col xs={6} lg={4} className="label">본문 절수 <span className="spanStar">*</span></Col>
                                        <Col xs={6} lg={4} className="input_box"><FormikInput name={`paper_cutting`} disabled={mode === 'view' ? true : false}/></Col>
                                        <Col xs={6} lg={4} className="label">면지 판걸이 수 <span className="spanStar">*</span></Col>
                                        <Col xs={6} lg={4} className="input_box"><FormikInput name={`paper_holder`} disabled={mode === 'view' ? true : false}/></Col>
                                    </Row>
                                </>
                            }
                            {providerData.viewType !== 'view' &&
                            <Row gutter={[10, 10]} justify="center" style={{border: 0, marginTop: 20 }}>
                                {(providerData.defaultRowIndex === -1 && mode !== 'create') ? 
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
                                        <Button type="primary" htmlType="button" style={{marginLeft: 10, padding: '4px 15px'}} onClick={() => formikDetailHook.handleSubmit()}>확인</Button>
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

export default inject ('commonStore')(observer(BasicComp))