import React, {useState} from 'react'
import { Drawer, Row, Col, Button, Input, DatePicker, Select, Popover, Space, Tabs, Modal } from 'antd'
import { DownOutlined, CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore, inject } from 'mobx-react';
import { FormikProvider, useFormik } from 'formik';
import { isEmpty } from '@components/Common/Js';
import moment from 'moment';
import DefaultInfo  from './DefaultInfo';   // 기본 정보
import BasicComp    from './basicComp';     // 기본구성
import DetailComp   from './detailComp';    // 세부구성
import Process      from './process';       //공정
// Drawer
import Reprinting   from './view/reprinting'   // 재쇄
import Accident     from './view/accident'     // 사고

export const PaperBookContext = React.createContext(null)

const PaperBookTab = ({ visible, addDrawerClose, commonStore, rowData, listRefresh, editabled=false, viewType='' }) => {
    const defaultLastIndex          = React.useRef(0)
    const detailLastIndex           = React.useRef(0)
    const prepressLastIndex         = React.useRef(0)
    const paperLastIndex            = React.useRef(0)
    const printLastIndex            = React.useRef(0)
    const bindingLastIndex          = React.useRef(0)
    const processingLastIndex       = React.useRef(0)
    const packingLastIndex          = React.useRef(0)
    const accessoryLastIndex        = React.useRef(0)
    const bindingAttachedLastIndex  = React.useRef(0)
    const [ tab,                 setTab                 ] = React.useState('businPerson')
    const [ reprintingDrawer,    setReprintingDrawer    ] = React.useState(false)
    const [ accidentDrawer,      setAccidentDrawer      ] = React.useState(false)
    const [ selectedDefaultsRow, setSelectedDefaultsRow ] = React.useState({})
    const [ selectedDetailsRow,  setSelectedDetailsRow  ] = React.useState({})
    const [ activeMenuTarget,    setActiveMenuTarget    ] = React.useState('')
    const [ drawerExtended,      setDrawerExtended      ] = React.useState(false)
    // Defaults (기본 구성) 중 선택된 row의 index
    // 선택된 row가 없으면 -1 return
    const [defaultRowIndex, setDefaultRowIndex] = React.useState(-1)
    // Details (세부 구성) 중 선택된 row의 index
    // Details (세부 구성) 중 선택된 row가 없으면 -1 return
    // Defaults (기본 구성) 중 선택된 row가 없으면 -2 return
    const [detailRowIndex, setDetailRowIndex] = React.useState(-2)
    // Drawer 열기 (재쇄, 사고)
    const drawerOpen = (type) =>{
        if(type == 'reprinting') {
            setReprintingDrawer(true)
        } else if(type == 'accident'){
            setAccidentDrawer(true)
        }
    }
    // Drawer 닫기 (재쇄, 사고)
    const drawerClose = (type) =>{
        if(type == 'reprinting') {
            setReprintingDrawer(false)
        } else if(type == 'accident'){
            setAccidentDrawer(false)
        }
    }
    // API 호출
    const fetchData = () => {
        commonStore.handleApi({
            url : `/productions/${rowData}`
        })
        .then((result) => {
            // formikInput type='date' 에 넣기 위한 전조치. 생략할 수 있으면 좋겠다.
            result.data.due_date                 = moment(result.data.due_date)
            result.data.request_date             = moment(result.data.request_date)
            result.data.receiving_scheduled_date = moment(result.data.receiving_scheduled_date)
            result.data.defaults.map((defaultUnit) => {
                defaultUnit.dataIndex = defaultLastIndex.current
                defaultLastIndex.current++
                defaultUnit.details.map((detailUnit) => {
                    detailUnit.dataIndex = detailLastIndex.current
                    detailLastIndex.current++
                    detailUnit.prepresses.map(prepressUnit => {
                        prepressUnit.dataIndex = prepressLastIndex.current
                        prepressUnit.cost_attribution_date = moment(prepressUnit.cost_attribution_date)
                        prepressLastIndex.current++
                    })
                    detailUnit.papers.map(paperUnit => {
                        paperUnit.dataIndex = paperLastIndex.current
                        paperUnit.cost_attribution_date = moment(paperUnit.cost_attribution_date)
                        paperLastIndex.current++
                    })
                    detailUnit.prints.map(printUnit => {
                        printUnit.dataIndex = printLastIndex.current
                        printUnit.cost_attribution_date = moment(printUnit.cost_attribution_date)
                        printLastIndex.current++
                    })
                    detailUnit.bindings.map(bindingUnit => {
                        bindingUnit.binding_attacheds.map((bindingAttachedsUnit) => {
                            bindingAttachedsUnit.dataIndex = bindingAttachedLastIndex.current
                            bindingAttachedsUnit.cost_attribution_date = moment(bindingAttachedsUnit.cost_attribution_date)
                            bindingAttachedLastIndex.current++
                        })
                        bindingUnit.dataIndex = bindingLastIndex.current
                        bindingUnit.cost_attribution_date = moment(bindingUnit.cost_attribution_date)
                        bindingLastIndex.current++
                    })
                    detailUnit.processings.map(processingUnit => {
                        processingUnit.dataIndex = processingLastIndex.current
                        processingUnit.cost_attribution_date = moment(processingUnit.cost_attribution_date)
                        processingLastIndex.current++
                    })
                    detailUnit.packings.map(packingUnit => {
                        packingUnit.dataIndex = packingLastIndex.current
                        packingUnit.cost_attribution_date = moment(packingUnit.cost_attribution_date)
                        packingLastIndex.current++
                    })
                    detailUnit.accessories.map(accessoryUnit => {
                        accessoryUnit.dataIndex = accessoryLastIndex.current
                        accessoryUnit.cost_attribution_date = moment(accessoryUnit.cost_attribution_date)
                        accessoryLastIndex.current++
                    })

                })
            })
            setTab('businPerson')
            formikHook.setValues(result.data)
            
        })
    }
    React.useEffect(() => {
        if (rowData !== '') {
            fetchData()
        }
        else {
            // 부서 ID : initialValues.department.id
            commonStore.handleApi({
                url : `/select-department-codes`
            })
            .then(result => {
                formikHook.setFieldValue('department.name', result.data.filter(unit => unit.id === commonStore.user.team)[0]?.name ) 
            })
            formikHook.setValues(initialValues)
        }
    }, [rowData])
    // [ 기본 정보 ] / [ 구성/공정 정보 탭 변경됐을 때 초기화 ]
    React.useEffect(() => {
        if (tab === 'businPerson') {
            setSelectedDefaultsRow({})
            setSelectedDetailsRow({})
        }
    }, [tab])
    // 기본 구성 Row 변경될 때 index 갱신
    React.useEffect(() => {
        setDefaultRowIndex((!isEmpty(formikHook.values) && Object.entries(initialValues).toString() !== Object.entries(formikHook.values).toString())? formikHook.values?.defaults?.indexOf(selectedDefaultsRow) : -1)
    }, [selectedDefaultsRow])
    // 기본 구성 Row가 변경되거나 세부 구성 Row가 변경됐을 때 index 갱신
    React.useEffect(() => {
        setDetailRowIndex(defaultRowIndex !== -1 ? formikHook.values?.defaults[defaultRowIndex]?.details?.indexOf(selectedDetailsRow) !== undefined ? formikHook.values?.defaults[defaultRowIndex]?.details?.indexOf(selectedDetailsRow) : -2 : -2)
    }, [defaultRowIndex, selectedDetailsRow])
    // 기본정보 <-> 구성/공정 정보 탭 변경
    const handleChangeTab = React.useCallback(setTab)
    // formik Hook 구성
    const initialValues = {
        defaults : [], 
        created_info : {
            id : commonStore?.user?.id, 
            name : commonStore?.user?.name
        }, 
        department : {
            id : commonStore?.user?.team
        }, 
        department_code_id : commonStore?.user?.team, 
        request_date : '', 
        due_date : '', 
    }
    // 수정, 저장
    const onSubmit = (submitData) => {
        const momentDefaultArray    = [`due_date`, `request_date`, `receiving_scheduled_date`]
        const detailsSectionArray   = [`prepresses`, `papers`, `prints`, `bindings`, `processings`, `packings`, `accessories`]

        for (const unitDefault of submitData?.defaults) {
            delete unitDefault.dataIndex
            unitDefault.ordnum = 0
            for (const momentColumn of momentDefaultArray) {
                if (moment.isMoment(unitDefault[momentColumn])) {
                    unitDefault[momentColumn] = moment(unitDefault[momentColumn]).format('YYYY-MM-DD')
                }
            }
            for (const unitDetail of unitDefault?.details) {
                delete unitDetail.dataIndex
                unitDetail.ordnum = 0
                for (const detailSection of detailsSectionArray) {
                    for (const targetDetail of unitDetail[detailSection]) {
                        delete targetDetail.dataIndex
                        targetDetail.ordnum = 0
                        if (moment.isMoment(targetDetail.cost_attribution_date)) {
                            if (targetDetail.cost_attribution_date !== '' && targetDetail.cost_attribution_date !== undefined) {
                                targetDetail.cost_attribution_date = moment(targetDetail.cost_attribution_date).format('YYYY-MM-DD')
                            }
                            else {
                                targetDetail.cost_attribution_date = moment().format('YYYY-MM-DD')
                            }
                        }
                        if (detailSection === 'prints') {
                            if (moment.isMoment(targetDetail.request_complete_date)) {
                                targetDetail.request_complete_date = moment(targetDetail.request_complete_date).format('YYYY-MM-DD')
                            }
                        }
                    }
                }
            }
        }
        commonStore.handleApi({
            method : 'POST', 
            url : `/productions`,
            data : submitData
        })
        .then(() => {
            Modal.success({
                content: '등록이 완료되었습니다.',
                onOk() {
                    addDrawerClose()
                    listRefresh()
                    setTab('businPerson')
                },
            })
        })
    }
    // 삭제
    const onDelete = () => {
        Modal.confirm({
            content : (<> 
                <Row>정말 삭제하시겠습니까?</Row>
            </>), 
            onOk : () => {
                // drawer 닫고 삭제 처리
                commonStore.handleApi({
                    method : `DELETE`, 
                    url : `/productions/${formikHook.values?.id}`,
                })
                .then(result => {
                    addDrawerClose()
                    listRefresh()
                })

            }
        })
    }
    // formik Hook 선언
    const formikHook = useFormik({ initialValues, onSubmit })

    if (defaultRowIndex !== undefined && detailRowIndex !== undefined) {
        return (
            <PaperBookContext.Provider value={{
                selectedDefaultsRow     : selectedDefaultsRow,
                setSelectedDefaultsRow  : setSelectedDefaultsRow,
                selectedDetailsRow      : selectedDetailsRow,
                setSelectedDetailsRow   : setSelectedDetailsRow,
                defaultRowIndex         : defaultRowIndex,
                detailRowIndex          : detailRowIndex,
                dataIndexs              : {
                    default             : defaultLastIndex,
                    detail              : detailLastIndex,
                    prepress            : prepressLastIndex,
                    paper               : paperLastIndex,
                    print               : printLastIndex,
                    binding             : bindingLastIndex,
                    bindingAttached     : bindingAttachedLastIndex, 
                    processing          : processingLastIndex,
                    packing             : packingLastIndex,
                    accessory           : accessoryLastIndex,
                }, 
                activeMenuTarget        : activeMenuTarget, 
                setActiveMenuTarget     : setActiveMenuTarget, 
                editabled               : editabled, 
                viewType                : viewType
            }}>
            {/* 전체 JSON 컨트롤을 위한 Provider 구성 */}
                <Drawer
                    title='제작 발주 (종이책)'
                    placement='right'
                    className={drawerExtended ? 'drawerWrap drawerback' : 'drawerWrap'}
                    onClose={addDrawerClose}
                    visible={visible}
                    closable={false}
                    keyboard={false}
                    width={'90% !important'}
                    extra={
                        <>
                            <Button onClick={() =>{ setDrawerExtended(!drawerExtended) }} style={{marginRight: 10}}>
                                {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                            </Button>
                            <Button onClick={addDrawerClose}>
                                <CloseOutlined />
                            </Button>
                        </>
                    }
                >
                    <FormikProvider value={formikHook}>
                        {/* 기본 구성, 구성/공정 정보 탭 구성 */}
                        <Tabs activeKey={tab} onChange={handleChangeTab}>
                            <Tabs.TabPane tab="기본 정보" key="businPerson">
                                <DefaultInfo/>
                            </Tabs.TabPane>
    
                            <Tabs.TabPane tab="구성/공정 정보" key="tradeInfo">
                                { tab !== 'businPerson'  ? <BasicComp/>  : <></> }
                                { defaultRowIndex !== -1 ? <DetailComp/> : <></> }
                                { (defaultRowIndex !== -1 && detailRowIndex  !== -1) ? <Process/>    : <></> }
                            </Tabs.TabPane>
                        </Tabs>
    
                        {/* 확인 버튼으로 Submit해야하므로 FormikProvider로 함께 감싼다. */}
                        {viewType !== 'view' && 
                        <Row gutter={10} justify="center" style={{ paddingTop : 30 }}>
                            {/* 확인 ~ 삭제 버튼 */}
                            <Col>
                                <Button
                                    type="primary"
                                    htmlType="button"
                                    onClick={formikHook.handleSubmit}
                                    style={{ marginLeft: '10px' }}
                                >
                                    확인
                                </Button>
                                <Button  
                                    onClick={addDrawerClose}
                                    htmlType="button"
                                    style={{ marginLeft: '10px' }}
                                >
                                    취소
                                </Button>
                                {rowData !== '' && 
                                    <Button  
                                        type="primary"
                                        htmlType="button"
                                        style={{ marginLeft: '10px' }}
                                    >
                                        복사
                                    </Button>
                                }
                                {rowData !== '' && 
                                    <Button  
                                        type="primary"
                                        htmlType="button"
                                        style={{ marginLeft: '10px' }}
                                        onClick={() => (drawerOpen('reprinting'))}
                                    >
                                        재쇄
                                    </Button>
                                }
                                {rowData !== '' && 
                                    <Button 
                                        type="primary"
                                        htmlType="button"
                                        style={{ marginLeft: '10px' }}
                                        onClick={() => (drawerOpen('accident'))}
                                    >
                                        사고
                                    </Button>
                                }
                                {rowData !== '' && 
                                    <Button  
                                        danger
                                        htmlType="button"
                                        style={{ marginLeft: '10px' }}
                                        onClick={onDelete}
                                    >
                                        삭제
                                    </Button>
                                }
                            </Col>
                        </Row>
                        }
                        {/* 재쇄, 사고 Drawer */}
                        {reprintingDrawer ? <Reprinting viewVisible={reprintingDrawer}  visibleClose={drawerClose}/> : ''}
                        {accidentDrawer ? <Accident viewVisible={accidentDrawer}  visibleClose={drawerClose} drawerChk='Y'/> : ''}
                    </FormikProvider>
                </Drawer>
            </PaperBookContext.Provider>
        )
    }
    else {
        return <></>
    }
}

export default inject('commonStore')(observer(PaperBookTab))