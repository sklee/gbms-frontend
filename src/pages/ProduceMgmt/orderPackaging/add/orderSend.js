import React from 'react'
import { Drawer, Row, Col, Button, Table  } from 'antd'
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { inject, observer, useLocalStore } from 'mobx-react';
import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import * as wjCore from '@grapecity/wijmo';
import { FormikProvider, useFormik } from 'formik';
import FormikInput from '@components/form/CustomInput';

const OrderSend = ({ commonStore, viewVisible, visibleClose, drawerChk }) => {
    const [ listData,        setListData        ] = React.useState([])
    const [ directorDrawer,  setDirectorDrawer  ] = React.useState(false)
    const [ selectedRowKeys, setSelectedRowKeys ] = React.useState([])
    const [ drawerExtended,  setDrawerExtended  ] = React.useState(false)
    const drawerClass=(data)=>{
        // if(data === 'drawerback'){
        //     state.drawerback = 'drawerback drawerWrap';
        // }else{
        //     state.drawerback = 'drawerWrap';
        // }          
    }
    const drawerOpen = () => {
        if(drawerChk === 'Y'){
            drawerClass('drawerback');
        }       
        setDirectorDrawer(true);
    }
    const drawerClose = () => {
        if(drawerChk === 'Y'){
            drawerClass();
        }
        setDirectorDrawer(false);
    }

    const initialValues = {}
    const onSubmit = () => {}
    const formikHook = useFormik({initialValues, onSubmit})
    // Table Select Options
    const rowSelection = {
        type : 'radio', 
        selectedRowKeys,
        columnWidth: 30, 
        // renderCell: () => <></>,
        onChange: setSelectedRowKeys,
    }

    const columns = [{
        dataIndex : `produce_process`, 
        title : `공정`, 
        width : 150, 
    }, {
        dataIndex : `produce_company`, 
        title : `제작처`, 
        width : 200, 
    }, {
        dataIndex : `manager`, 
        title : `담당자`, 
        width : 150, 
    }, {
        dataIndex : `email`, 
        title : `이메일`, 
        width : 200, 
    }]

    React.useEffect(() => {
        commonStore.handleApi({
            // url : `/packings/1/orders-preview`
            url : `/packings/1`
        })
        .then(result => {
            setListData(result.data)
        })

    }, [])

    return (
        <Drawer 
            title='제작 발주서 발송'
            placement='right'
            onClose={()=>{visibleClose('send')}}
            visible={viewVisible}
            className={drawerExtended ? 'drawerWrap drawerback' : 'drawerWrap'}
            closable={false}
            keyboard={false}
            extra={
                <>
                    <Button onClick={() =>{ setDrawerExtended(!drawerExtended) }} style={{marginRight: 10}}>
                        {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                    </Button>
                    <Button onClick={()=>{visibleClose('send')}}>
                        <CloseOutlined />
                    </Button>
                </>
            }
        >
            <FormikProvider value={formikHook}>
                <Row className="table" style={{border: 'unset !important'}}>
                    <Col xs={12} lg={6} className='label' style={{borderTop: '1px solid #eee'}}>창고 입고 요청일 <span className='spanStar'>*</span></Col>
                    <Col xs={12} lg={18} style={{borderTop: '1px solid #eee'}}>
                        <FormikInput name={`request_date`} type={`datepicker`}/>
                    </Col>
                </Row>

                <Row className="gridWrap" style={{margin: '20px 0'}}>
                    <Table
                        rowKey      = {'id'}
                        // dataSource  = {listData}
                        dataSource  = {[{
                            id              : 1, 
                            produce_process : '목록은',
                            produce_company : 'API 추가 개발 이후',
                            manager         : '개발할 예정'
                        },{
                            id: 2, 
                            produce_process : '2',
                            produce_company : '2',
                        },{
                            id: 3, 
                            produce_process : '3',
                            produce_company : '3',
                        },{
                            id: 4, 
                            produce_process : '4',
                            produce_company : '4',
                        },]}
                        columns     = {columns}
                        size        = {'middle'}
                        bordered    = {true}
                        style       = {{ padding: 0, flex: 1 }}
                        scroll      = {{ x : 500, y: 500 }}
                        pagination  = { false }
                        onRow       = {(record) => ({
                            onClick : (event) => { setSelectedRowKeys([record.id]) }
                        })}
                        rowSelection= { rowSelection }
                    />
                </Row>

                <Row className="table">
                    <Col xs={24} lg={24} className='addLabel'>발주서에 추가할 주의/요청사항</Col>
                    <Col xs={24} lg={24}><FormikInput name={`request_memo`} type={`textarea`} /></Col>
                </Row>
                
                <div style={{margin: '20px 0'}}>
                    <Row className="table">
                        <Col xs={24} lg={24} className='addLabel'>메일에 추가할 내용</Col>
                        <Col xs={24} lg={24}><FormikInput name={`mail_add_memo`} type={`textarea`} /></Col>
                    </Row>
                </div>

                <Row gutter={10} justify="center" style={{margin: '20px 0'}}>
                    <Button type="primary" htmlType="button" onClick={formikHook.handleSubmit}>확인</Button>
                    <Button htmlType="button" style={{marginLeft: 10}} onClick={()=>{visibleClose('send')}}>취소</Button>
                </Row>
                {directorDrawer ? <Director viewVisible={directorDrawer} visibleClose={drawerClose}/> : ''}
            </FormikProvider>
        </Drawer>
    )
}

const Director = observer(({ viewVisible, visibleClose }) => {
    const [ drawerExtended, setDrawerExtended   ] = React.useState(false)
    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                name: '김영희',
                department: 'A팀',
                compNumper: '02-123-1234',
                phoneNumber: '010-5678-5678',
                email: 'kim@a.com',
                status: '',
            },
            {
                id: 2,
                name: '김영희2',
                department: 'B팀',
                compNumper: '02-123-1124',
                phoneNumber: '010-54538-5678',
                email: 'kim@a.com',
                status: '',
            },
        ],
    }));

    const initGrid = (grid) => {

        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                // create buttons for items not being edited
                switch (col.binding) {
                    case 'status':
                        let btn = `<button id="btnAdd" class="btnText blueTxt">추가</button>`
                        e.cell.innerHTML = btn;
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                // get button's data item
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                var name = item.name;
                // handle buttons
                state.idx = item.id;
                switch (e.target.id) {
                    
                }
            }
        });
    }

    return(
        <Drawer 
            title='제작처 담당자'
            placement='right'
            onClose={()=>{visibleClose('send')}}
            visible={viewVisible}
            className={drawerExtended ? 'drawerWrap drawerback' : 'drawerWrap'}
            closable={false}
            keyboard={false}
            extra={
                <>
                    <Button onClick={() =>{ setDrawerExtended(!drawerExtended) }} style={{marginRight: 10}}>
                        {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                    </Button>
                    <Button onClick={()=>{visibleClose('send')}}>
                        <CloseOutlined />
                    </Button>
                </>
            }
        >
            <Row id="gridWrap" className="gridWrap">
                <FlexGrid
                    itemsSource={state.list}
                    initialized={(s) => initGrid(s)}
                    autoRowHeights={true}
                    allowSorting={false}
                    selectionMode="None"
                    headersVisibility="Column"
                >
                    <FlexGridColumn header="성명" binding="name" width={150} />
                    <FlexGridColumn header="부서" binding="department" width={200} />
                    <FlexGridColumn header="회사 전화번호" binding="compNumper" width="*" minWidth={150} />
                    <FlexGridColumn header="휴대폰 번호" binding="phoneNumber" width={200} />
                    <FlexGridColumn header="이메일" binding="email" width={200} />
                    <FlexGridColumn header="작업" binding="status" width={200} align="center"/>
                </FlexGrid>
            </Row>
        </Drawer>
    )
})

export default inject('commonStore')(observer(OrderSend))
