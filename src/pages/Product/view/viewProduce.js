/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Row, Table, Typography, Input } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import useStore from '@stores/useStore';


const ProduceDrawer = observer(( props ) => {
    const { Text } = Typography;
    const { Search } = Input;
    const state = useLocalStore(() => ({
        type: 'paperbook',
    }));
    
    const [paperBookData, setPaperBookData] = useState([{
        step: 1,                   
        printing: '1',
        prdDivision: '신간',
        prdStatus: '입고(완료)',
        orderDate: '2022-05-20',
        orderQuantity: 3000,
        incomingQuantity: 3120,
        receivingDate: '2022-06-03',
    },]);

    const paperBook_column = useMemo(() => [
        {
            title: '쇄',
            dataIndex: 'printing',
            key:  'printing',
            render: (_, row) => <div>{row.printing}</div>,
            align: 'right',
            width:'80px',
        },
        {
            title: '제작 구분',
            dataIndex: 'prdDivision',
            key:  'prdDivision',
            render: (_, row) => <div>{row.prdDivision}</div>,
            align: 'left',
            width:'80px',
        },
        {
            title: '제작 상태',
            dataIndex: 'prdStatus',
            key:  'prdStatus',
            render: (_, row) => <div>{row.prdStatus}</div>,
            align: 'left',
            width:'80px',
        },
        {
            title: '제작 발주일',
            dataIndex: 'orderDate',
            key:  'orderDate',
            render: (_, row) => <div>{row.orderDate}</div>,
            align: 'left',
            width:'100px',
        },
        {
            title: '발주 수량',
            dataIndex: 'orderQuantity',
            key:  'orderQuantity',
            render: (_, row) => <div>{row.orderQuantity}</div>,
            align: 'right',
            width:'80px',
        },
        {
            title: '입고 수량',
            dataIndex: 'incomingQuantity',
            key:  'incomingQuantity',
            render: (_, row) => <div>{row.incomingQuantity}</div>,
            align: 'right',
            width:'80px',
        },
        {
            title: '입고일',
            dataIndex: 'receivingDate',
            key:  'receivingDate',
            render: (_, row) => <div>{row.receivingDate}</div>,
            align: 'left',
            width:'100px',
        },   
    ]);

    const [packingData, setPackingData] = useState([{
        step: 1,                   
        printing: '1',
        prdDivision: '신간',
        prdStatus: '입고(완료)',
        orderDate: '2022-05-20',
        orderQuantity: 3000,
        incomingQuantity: 3120,
        receivingDate: '2022-06-03',
    },]);

    const packing_column = useMemo(() => [
        {
            title: '제작 발주일',
            dataIndex: 'orderDate',
            key:  'orderDate',
            render: (_, row) => <div>{row.orderDate}</div>,
            align: 'left',
            width: '25%',
        },
        {
            title: '발주 수량',
            dataIndex: 'orderQuantity',
            key:  'orderQuantity',
            render: (_, row) => <div>{row.orderQuantity}</div>,
            align: 'right',
            width: '25%',
        },
        {
            title: '입고 수량',
            dataIndex: 'incomingQuantity',
            key:  'incomingQuantity',
            render: (_, row) => <div>{row.incomingQuantity}</div>,
            align: 'right',
            width: '25%',
        },
        {
            title: '입고일',
            dataIndex: 'receivingDate',
            key:  'receivingDate',
            render: (_, row) => <div>{row.receivingDate}</div>,
            align: 'left',
            width: '25%',
        },   
    ]);

        

    return (
        <>

            <Table
                dataSource={state.type == 'paperbook' ? paperBookData : packingData}
                columns={state.type == 'paperbook' ? paperBook_column : packing_column}
                rowKey={(row) => row.step}    
                pagination={false} 
                summary={ pageData => {
                    let orderTotal = 0;
                    let incomingTotal = 0;

                    pageData.forEach(e => {
                        orderTotal += Number(e.orderQuantity);
                        incomingTotal += Number(e.incomingQuantity);
                    });

                    return state.type == 'paperbook' ? (
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={4} align={'center'}><Text strong>합계</Text></Table.Summary.Cell>
                            <Table.Summary.Cell index={4} align={'right'}><Text strong>{orderTotal}</Text></Table.Summary.Cell>
                            <Table.Summary.Cell index={5} align={'right'}><Text strong>{incomingTotal}</Text></Table.Summary.Cell>
                            <Table.Summary.Cell index={6}></Table.Summary.Cell>
                        </Table.Summary.Row>
                    ) : (
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} align={'center'}><Text strong>합계</Text></Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align={'right'}><Text strong>{orderTotal}</Text></Table.Summary.Cell>
                            <Table.Summary.Cell index={2} align={'right'}><Text strong>{incomingTotal}</Text></Table.Summary.Cell>
                            <Table.Summary.Cell index={3}></Table.Summary.Cell>
                        </Table.Summary.Row>
                    )
                }}
            />

            <Row gutter={10} className="table_bot">
                <span>행 개수 : {paperBookData.length}</span>
            </Row>
        </>
    );
});

export default ProduceDrawer;