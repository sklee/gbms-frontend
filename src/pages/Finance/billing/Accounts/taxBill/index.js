import React, {useMemo} from 'react';
import {Drawer, Row, Col, Space, Button, Input, Typography, Table} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';



const Wrapper = styled.div`
    width: 100%;
`;

const taxbill = observer(({visible, onClose})=>{
    const { Text } = Typography;

    const state = useLocalStore(() => ({
        drawerback: 'drawerWrap',
        evidenceViewType:'X',
        evidenceDate:0,
        evidenceType:0,
        list: [
            {
                id:0,
                supply:'(주)네이버',
                businessNum:'123-12-1234',
                issueDate:'2022.11.02',
                item:'온라인 광고 충전 외 2건',
                total:3500000
            },
            {
                id:1,
                supply:'(주)네이버',
                businessNum:'123-12-1234',
                issueDate:'2022.11.02',
                item:'온라인 광고 충전 외 2건',
                total:-3500000
            }
        ],
        listData : [],
        firstItemName : '', //첫번째 품목명
        totalAmount : 0,    //승인번호조회 합계
        chkTotalPay : true,    //승인번호조회시 합계 체크

        files:[],
        files_add:[],
    }));

    // 테이블
    const column = useMemo(() => [
        {
            title: '공급/발행자',
            dataIndex: 'invoicerCorpName',
            key:  'invoicerCorpName',
            render: (_, row) => <div style={{textAlign:'left'}}>{row.invoicerCorpName}</div>,
            align: 'center',
        },
        {
            title: '사업자등록번호',
            dataIndex: 'invoicerCorpNum ',
            key:  'invoicerCorpNum',
            render: (_, row) => <div style={{textAlign:'center'}}>{row.invoicerCorpNum}</div>,
            align: 'center',
        },
        {
            title: '발행/사용일',
            dataIndex:  'evidence_issueDate',
            key: 'evidence_issueDate',
            render: (_, row) => <div style={{textAlign:'center'}}>{row.issueDate}</div>,
            align: 'center',
        },
        {
            title: '품목',
            dataIndex: 'evidence_itemName',
            key: 'evidence_itemName',
            // render: (_, row) => <div style={{textAlign:'left'}}>{row.itemName}</div>,
            render: (_, row) => <div style={{textAlign:'left'}}>{state.listData.length > 1  ? state.firstItemName+' 외 '+state.listData.length+'건' : row.itemName}</div>,
            align: 'center',
        },
        {
            title: '합계',
            dataIndex: 'evidence_totalAmount',
            key: 'evidence_totalAmount',
            render: (_, row) => <div style={{textAlign:'right'}}>{row.totalAmount !='' && row.totalAmount != undefined ? commaNum(row.totalAmount) : ''}</div>,
            align: 'center',
        },    
    ],[state.listData],);

    const commaNum = (num) => {
        const number = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return number
    }

    const [ drawerExtended, setDrawerExtended ] = useState(false);
    const drawerSizeHandler = () => {
        if(drawerExtended){
            setDrawerExtended(false);
            state.drawerback = 'drawerWrap';
            
        } else {
            setDrawerExtended(true);
            state.drawerback = 'drawerback drawerWrap';
        }
    }

    return(
        <Wrapper>
            <Drawer
                title='세금계산서 확인'
                placement='right'
                className={state.drawerback}
                visible={visible}
                onClose={onClose}
                closable={false}
                keyboard={false}
                extra={
                    <>
                        <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={onClose}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >
                <Row gutter={10} className="table">
                    <Col xs={24} lg={5} className="label">
                        승인번호 조회 <span className="spanStar">*</span>   
                    </Col>
                    <Col xs={24} lg={19}>
                        {/* <SelectTax />     */}
                        <Input
                            name="taxNumber"
                            // onChange={handleChangeEvidence('taxNumber')}
                            autoComplete="off"
                            maxLength="24"
                        />                      
                    </Col>
                </Row>

                <>
                    <Space style={{marginTop: '10px',marginBottom:'20px'}}  direction="vertical">
                        <Text>* 수정(마이너스) 세금계산서가 발행된 경우 최초, 수정, 최종 증빙을 모두 조회해서 추가해 주세요.</Text>
                    </Space>
                    <Table
                        dataSource={state.listData}
                        columns={column}
                    />
                </>
                <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                    <Col>
                        <Button type="primary" htmlType="button" onClick={onClose}>확인</Button>
                    </Col>
                </Row>
            </Drawer>
        </Wrapper>
    );
})

export default taxbill;