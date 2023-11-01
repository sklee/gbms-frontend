import React from 'react'
import { Drawer, Row, Col, Button, Modal } from 'antd'
import FormikInput from '@components/form/CustomInput'
import { FormikContext, FormikProvider, useFormik } from 'formik'
import { inject, observer } from 'mobx-react'
import { ArrowsAltOutlined, CloseOutlined, ShrinkOutlined } from '@ant-design/icons'

const Reprinting = ({ commonStore, viewVisible, visibleClose }) => {
    const formikHook = React.useContext(FormikContext)
    const [ drawerExtended, setDrawerExtended ] = React.useState(false)
    const initialValues = {
        product_qty  : 0, 
        request_date : formikHook.values?.request_date, 
        memo         : '', 
    } 
    const onSubmit = (submitData) => {
        // submitData.request_date = submitData.request_date.format('YYYY-MM-DD')
        commonStore.handleApi({
            method  : `POST`, 
            url     : `/productions/${formikHook?.values?.id}/reprints`, 
            data    : submitData
        })
        .then(() => {
            Modal.success({
                content: '등록이 완료되었습니다.',
                onOk() {
                    visibleClose('reprinting')
                },
            })
        })
    }
    // formik Hook 선언
    const formikDetailHook = useFormik({ initialValues, onSubmit })
    return (
        <Drawer 
            title='재쇄 검토 요청'
            placement='right'
            onClose={()=>{visibleClose('reprinting')}}
            visible={viewVisible}
            className={drawerExtended ? 'drawerWrap drawerback' : 'drawerWrap'}
            closable={false}
            keyboard={false}
            extra={
                <>
                    <Button onClick={() =>{ setDrawerExtended(!drawerExtended) }} style={{marginRight: 10}}>
                        {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                    </Button>
                    <Button onClick={()=>{visibleClose('reprinting')}}>
                        <CloseOutlined />
                    </Button>
                </>
            }
        >
            <FormikProvider value={formikDetailHook}>
                <Row className='table'>
                    <Col xs={12} lg={6} className="label">발주 수량 <span className='spanStar'>*</span></Col>
                    <Col xs={12} lg={6}>
                        <FormikInput name={'product_qty'} />
                    </Col>
                    <Col xs={12} lg={6} className="label">입고 요청일 <span className='spanStar'>*</span></Col>
                    <Col xs={12} lg={6}>
                        <FormikInput name={'request_date'} type={'datepicker'}/>
                    </Col>
                    <Col xs={12} lg={6} className="label">참고 사항</Col>
                    <Col xs={24} lg={18}>
                        <FormikInput name={'memo'} type={'textarea'}/>
                    </Col>
                </Row>

                <Row gutter={10} justify="center" style={{ paddingTop : 30 }}>
                    <Col>
                        <Button type="primary" htmlType="button" style={{ marginLeft: '10px' }} onClick={formikDetailHook.handleSubmit} > 확인 </Button>
                        <Button htmlType="button" style={{ marginLeft: '10px' }} onClick={() => visibleClose('reprinting')} > 취소 </Button>
                    </Col>
                </Row>
            </FormikProvider>
        </Drawer>
    )
}

export default inject('commonStore')(observer(Reprinting))