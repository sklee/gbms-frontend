import React from 'react'
import { Drawer, Row, Button, Table } from 'antd'
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { inject, observer } from 'mobx-react';
import FormikInput from '@components/form/CustomInput';
import { FormikContext, FormikProvider, useFormik } from 'formik';

const Fabrication = ({ commonStore, viewVisible, visibleClose }) => {
    const formikHook = React.useContext(FormikContext)
    const [ listData,       setListData         ] = React.useState([])
    const [ drawerExtended, setDrawerExtended   ] = React.useState(false)
    const fetchData = () => {
        commonStore.handleApi({
            url : `/productions/${formikHook.values?.id}/status`
        }).then((result) => {
            result.data.map((unit, index) => {
                formikDetailHook.setFieldValue(`check_yn[${index}]`, unit.check_yn)
                formikDetailHook.setFieldValue(`memo[${index}]`, unit.memo)
            })
            setListData(result.data)
        })
    }
    const initialValues = {}
    const onSubmit = () => {}
    const formikDetailHook = useFormik({initialValues, onSubmit})

    React.useEffect(() => {
        fetchData()
    }, [])

    const columns = [
        {
            title : '제작 상태', 
            dataIndex : 'name', 
            width : 100, 
            align : 'left'
        }, {
            title : '변경일', 
            dataIndex : 'updated_at', 
            width : 100, 
            align : 'center'
        }, {
            title : '작업자', 
            dataIndex : 'updated_id', 
            width : 70, 
            align : 'center'
        }, {
            title : '[ 담당부서 ] 필요 작업', 
            dataIndex : 'check_yn', 
            width : 400, 
            align : 'left', 
            render : (text, record, index) =>
            <FormikInput 
                type='checkbox' 
                name={`check_yn[${index}]`} 
                data={{checkboxData : [{label : record.work, value : 'R'}]}} 
                onChange={(e) => {formikDetailHook.setFieldValue(`check_yn[${index}]`, e)}}
            />
        }, {
            title : '참고 사항', 
            dataIndex : 'memo', 
            width : 150, 
            align : 'left',
            render : (text, record, index) => <FormikInput name={`memo[${index}]`}/>
        }, 
    ]
    return (
        <Drawer 
            title='제작 상태'
            placement='right'
            onClose={()=>{visibleClose('fabrication')}}
            visible={viewVisible}
            className={drawerExtended ? 'drawerWrap drawerback' : 'drawerWrap'}
            closable={false}
            keyboard={false}
            extra={
                <>
                    <Button onClick={() =>{ setDrawerExtended(!drawerExtended) }} style={{marginRight: 10}}>
                        {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                    </Button>
                    <Button onClick={()=>{visibleClose('fabrication')}}>
                        <CloseOutlined />
                    </Button>
                </>
            }
        >
            <Row className="gridWrap">
                <FormikProvider value={formikDetailHook}>
                    <Table
                        rowKey      = {'id'}
                        dataSource  = {listData}
                        columns     = {columns}
                        size        = {'middle'}
                        style       = {{ minHeight: '700px', padding: 0}}
                        bordered    = {true}
                        pagination  = {false}
                    />
                </FormikProvider>
            </Row>
            <Row gutter={10} justify="center" style={{margin: '20px 0'}}>
                <Button type="primary" htmlType="button">확인</Button>
                <Button htmlType="button" style={{marginLeft: 10}} onClick={() => {visibleClose('fabrication')}}>취소</Button>
            </Row>
        </Drawer>
    )
}

export default inject('commonStore')(observer(Fabrication))
