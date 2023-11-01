import React from 'react'
import { Row, Col, Button, Checkbox, Table, Input } from 'antd'
import { observer, inject } from 'mobx-react'
import AddDrawer from './add/index'
import Excel from '@components/Common/Excel';

const Account = ({ commonStore }) => {
    // 현재 페이지 넘버
    // const [thisPage, setThisPage] = React.useState(1)
    // 페이지당 표시할 데이터 수
    // const [pageCnt, setPageCnt] = React.useState(50)

    // 목록 데이터
    const [listData, setListData] = React.useState([])
    // 상세보기 1개 페이지 데이터
    const [targetData, setTargetData] = React.useState(null)

    const [addDrawer, setAddDrawer] = React.useState(false)

    const { Search } = Input;

    React.useEffect(() => {
        fetchData()
    },[])
    
    //리스트
    const fetchData = () => {
        commonStore.handleApi({
            url : '/sales-accounts',
            // data : {
            //     display     : pageCnt, 
            //     page        : thisPage,
            //     sort_by     : 'date', 
            //     order       : 'desc'
            // }
        })
        .then((result) => {
            setListData(result.data)
        })
    }

    const drawerOpen = React.useCallback((rowId='', rowTargetComp='')=>{
        setTargetData({id : rowId, targetCompany : rowTargetComp})
        setAddDrawer(true)
    }, [addDrawer])
    
    const drawerClose = React.useCallback(()=>{
        setTargetData(null)
        setAddDrawer(false)
        fetchData()
    }, [addDrawer])

    const columns = [{
        dataIndex : 'account_code',
        title : '거래처 코드(내부)', 
        width: 100,
    }, {
        title : '거래처 코드(회계)', 
        children : [{
            dataIndex : 'account_code1',
            title : '도서출판 길벗', 
            width: 100,
        }, {
            dataIndex : 'account_code2',
            title : '길벗스쿨', 
            width: 100
        }, ]
    }, {
        dataIndex : 'business_name_internal',
        title : '사업자명(내부)', 
        ellipsis: true,
        minWidth : 150, 
        width: '*',
        render: (data, rowData) => ( <div style={{cursor: 'pointer'}} > {data} </div> )
    }, {
        dataIndex : 'business_number',
        title : '사업자등록번호', 
        width: 100
    }, {
        dataIndex : 'sales_classification_str',
        title : '판매 구분', 
        width: 100
    }, {
        dataIndex : 'sales_managers',
        title : '영업 담당자', 
        ellipsis: true,
        width: 100
    }, {
        dataIndex : 'trading_status_str',
        title : '거래 상태', 
        width: 100
    }, {
        dataIndex : 'targetComp',
        title : '거래 대상 회사', 
        width: 150
    }, {
        dataIndex : 'trade_products_str',
        title : '거래 상품 종류', 
        width: 150, 
        // render: (content) => (
        //     <Tooltip placement="topLeft" title={content}>
        //         {content}
        //     </Tooltip>
        // ),
    }]

    //검색
    const handleSearch = (data) => {
        console.log(data)
        // fetchData(state.pageArr.page, data)
    } 

    return (
        <>
            <Row className="topTableInfo">
                <Col span={12}>
                    <Search
                        placeholder="검색어 입력"
                        onSearch={handleSearch}
                        enterButton
                        allowClear
                        style={{width: 200 }}
                    />
                </Col>
                <Col span={12} className="topTable_right">
                    <span style={{marginTop: 5}}>보기 설정</span>
                    <Checkbox style={{margin: '5px 10px 0'}}>거래 중단 제외</Checkbox>
                    <Button className="btn btn-primary btn_add" shape="circle" onClick={() => drawerOpen()}>+</Button>
                </Col>
            </Row>
            <Row className="gridWrap">       
                <Table
                    rowKey      = { 'id' }
                    dataSource  = { listData }
                    columns     = { columns }
                    bordered    = { true }
                    size        = { 'large' }
                    sticky      = {{ offsetHeader : -20 }}
                    style       = {{ padding: 0 }}
                    scroll      = {{ x : 700 }}
                    pagination  = {{ position : ['bottomLeft'] }}
                    onRow       = {( record ) => ({ onClick : () => drawerOpen(record.id, record.trading_target_company) })}
                />
            </Row>

            <Row className='table_bot'>
                <Col xs={16} lg={16}>
                    <div className='btn-group'>
                        <span>행 개수 : {listData.length}</span>
                    </div>
                </Col>
                <Excel />
            </Row>


            {addDrawer && <AddDrawer drawerVisible={addDrawer} drawerClose={drawerClose} data={targetData}/>}
        </>
        
    )
}

export default inject('commonStore')(observer(Account))