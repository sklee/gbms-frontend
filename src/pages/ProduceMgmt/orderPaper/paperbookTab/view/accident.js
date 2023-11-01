import React from 'react'
import { Drawer, Row, Button, Table } from 'antd'
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons'
import { inject, observer } from 'mobx-react'
import AccidentDetail from './addidentDetail' // 사고 상세 내용
import { FormikContext } from 'formik';
import { moneyComma } from '@components/Common/Js'

const Accident = ({ commonStore, viewVisible, visibleClose, rowData}) => {
    const [ accDrawer,       setAccDrawer        ] = React.useState(false);
    const [ drawerExtended,  setDrawerExtended   ] = React.useState(false)
    const [ listData,        setListData         ] = React.useState([])
    const [ selectedRowKeys, setSelectedRowKeys  ] = React.useState([])
    const [ thisAccId,       setThisAccId        ] = React.useState('')

    const formikHook = React.useContext(FormikContext)
    const fetchData = () => {
        if (rowData?.id !== undefined) {
            commonStore.handleApi({
                url : `/productions/${rowData?.id}/accidents`
            })
            .then((result) => {
                setListData(result.data)
            })
        }
        else {
            commonStore.handleApi({
                url : `/productions/${formikHook.values?.id}/accidents`
            })
            .then((result) => {
                setListData(result.data)
            })
        }
    }
    React.useEffect(() => {
        fetchData()
    }, [])
    const columns = [{
        dataIndex   : 'code', 
        title       : '사고 코드', 
        width       : 120
    },{
        dataIndex   : 'level', 
        title       : '사고 수준', 
        width       : 100
    },{
        dataIndex   : 'accident_code_name', 
        title       : '사고 공정', 
        width       : 100
    },{
        dataIndex   : 'accident_name', 
        title       : '사고 분류', 
        width       : 150
    },{
        dataIndex   : 'accident_type', 
        title       : '책임 구분', 
        width       : 100
    },{
        dataIndex   : 'manager_user_name', 
        title       : '책임자', 
        width       : 150
    },{
        dataIndex   : 'accident_target_price', 
        title       : '사고 대상 금액', 
        width       : 120, 
        render      : text => moneyComma(text !== null ? text : 0), 
        align       : 'right'
    },{
        dataIndex   : 'accident_handel_price', 
        title       : '사고 처리 금액', 
        width       : 120, 
        render      : text => moneyComma(text), 
        align       : 'right'
    },{
        dataIndex   : 'created_at', 
        title       : '등록일', 
        width       : 120
    },{
        dataIndex   : 'created_info', 
        title       : '등록자', 
        width       : 100
    },{
        dataIndex   : 'accident_yn', 
        title       : '처리 상태', 
        width       : 100
    }]
    const accDrawerOpen = () => {
        setAccDrawer(true)
    }
    const accDrawerClose = () => {
        setAccDrawer(false)
    }

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys)
    }
    
    const rowSelection = {
        type : 'radio', 
        fixed : true, 
        columnWidth : 0, 
        renderCell: () => <></>,
        selectedRowKeys,
        onChange: onSelectChange,
    }

    return (
        <Drawer 
            title='사고 현황 및 등록'
            placement='right'
            onClose={()=>{visibleClose('accident')}}
            visible={viewVisible}
            className={drawerExtended ? 'drawerWrap drawerback' : 'drawerWrap'}
            closable={false}
            keyboard={false}
            extra={
                <>
                    <Button onClick={() =>{ setDrawerExtended(!drawerExtended) }} style={{marginRight: 10}}>
                        {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                    </Button>
                    <Button onClick={()=>{visibleClose('accident')}}>
                        <CloseOutlined />
                    </Button>
                </>
            }
        >
            <Row className="gridWrap" style={{margin: '20px 0'}}>
                <Table
                    rowKey      = {'id'}
                    dataSource  = {listData}
                    columns     = {columns}
                    size        = {'middle'}
                    style       = {{ minHeight: '700px', padding: 0}}
                    bordered    = {true}
                    // rowSelection= { rowSelection }
                    // onRow       = {(record, rowIndex) => ({
                    //     onClick : (event) => {
                    //         setThisAccId(record.id)
                    //         accDrawerOpen()
                    //         onSelectChange([record.id])
                    //     }
                    // })}
                />
            </Row>

            <Row gutter={10} justify="center" style={{margin: '20px 0'}}>
                <Button type="primary" htmlType="button" onClick={() => {setThisAccId(''); accDrawerOpen(); onSelectChange([])}}>사고 등록</Button>
            </Row>

            {accDrawer ? <AccidentDetail viewVisible={accDrawer} visibleClose={accDrawerClose} rowData={thisAccId} productionId={rowData?.id !== undefined ? rowData?.id : formikHook.values.id} refreshList={fetchData}/> : ''}
        </Drawer>
    )
}

export default inject('commonStore')(observer(Accident))