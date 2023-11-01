import React from 'react'
import { Row, Table }   from 'antd';
import { observer }     from 'mobx-react';
import { moneyComma }   from '@components/Common/Js';

const ResultTable = ({viewData}) =>{
    const columns = [{
        title : '가격',
        children : [
            {
                title       : '정가', 
                dataIndex   : 'price', 
                width       : 50, 
                align       : 'right', 
                render      : text => moneyComma(text)
            }, {
                title       : '공급가', 
                dataIndex   : 'supply_price', 
                width       : 70, 
                align       : 'right', 
                render      : text => moneyComma(text)
            }
        ]
    }, {
        title : '비용과 비율',
        children : [{
            title       : '저작권료', 
            dataIndex   : 'royalty', 
            width       : 70, 
            align       : 'right', 
            render      : text => moneyComma(text)
        }, {
            title       : '물류비', 
            dataIndex   : 'logistics_price', 
            width       : 70, 
            align       : 'right', 
            render      : text => moneyComma(text)
        }, {
            title       : '개발비/기타', 
            dataIndex   : 'development_price', 
            width       : 70, 
            align       : 'right', 
            render      : text => moneyComma(text)
        }, {
            title       : '제작비', 
            dataIndex   : 'production_price', 
            width       : 70, 
            align       : 'right', 
            render      : text => moneyComma(text)
        }, {
            title       : '전체 비용 비율', 
            dataIndex   : 'all_rate', 
            width       : 70, 
            align       : 'right', 
        }, {
            title       : '제작비 비율', 
            dataIndex   : 'production_rate', 
            width       : 70, 
            align       : 'right', 
        }, ]
    }, {
        title : '손익분기점', 
        children : [{
            title       : '판매량', 
            dataIndex   : 'sales',
            width       : 70, 
            align       : 'right', 
            render      : text => moneyComma(text)
        }, {
            title       : '매출액', 
            dataIndex   : 'sales_amount', 
            width       : 70, 
            align       : 'right', 
            render      : text => moneyComma(text)
        }]
    }, {
        title : '손익분기 달성을 위한 목표 판매량', 
        children : [{
            title       : '1년차', 
            dataIndex   : 'year1', 
            width       : 70, 
            align       : 'right', 
            render      : text => moneyComma(text)
        }, {
            title       : '2년차', 
            dataIndex   : 'year2', 
            width       : 70, 
            align       : 'right', 
            render      : text => moneyComma(text)
        }, {
            title       : '3년차', 
            dataIndex   : 'year3', 
            width       : 70, 
            align       : 'right', 
            render      : text => moneyComma(text)
        }]
    }]

    return (
        <div style={{marginTop: 40, marginBottom: 40}}>
            <Row gutter={10} className="table marginTop">
                <div className="table_title">시뮬레이션 결과</div>
            </Row>
            <Row className='gridWrap'>
                <Table
                    rowKey      = {'id'}
                    dataSource  = {viewData}
                    columns     = {columns}
                    size        = {'middle'}
                    style       = {{padding: 0, minWidth: 700}}
                    bordered    = {true}
                    scroll      = {{ x: 500, y: 300 }}
                    pagination  = {false}
                />
            </Row>
        </div>
    )
}

export default observer(ResultTable)