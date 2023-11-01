import React from "react"
import { Table, Radio } from 'antd'
import { moneyComma } from "@components/Common/Js"

const DevCost = ({viewData}) =>{
    const [insideVal, setInsideVal] = React.useState(null)
    viewData.editing_total_price    = 0
    viewData.editing_total_price    += viewData.editing
    viewData.editing_total_price    += viewData.translation
    viewData.editing_total_price    += viewData.proofread
    viewData.editing_total_price    += viewData.typeset
    viewData.editing_total_price    += viewData.ctp
    viewData.editing_total_price    += viewData.film
    viewData.editing_total_price    += viewData.planning
    viewData.editing_total_price    += viewData.supervise
    viewData.editing_total_price    += viewData.add_content
    viewData.editing_total_price    += viewData.editing_data

    viewData.design_total_price     = 0
    viewData.design_total_price     += viewData.cover
    viewData.design_total_price     += viewData.text
    viewData.design_total_price     += viewData.output
    viewData.design_total_price     += viewData.design_data

    viewData.etc_total_price        = 0
    viewData.etc_total_price        += viewData.ad
    viewData.etc_total_price        += viewData.presentation_price
    viewData.etc_total_price        += viewData.operating_cost

    viewData.total_price            = 0
    viewData.total_price            += viewData.editing_total_price
    viewData.total_price            += viewData.design_total_price
    viewData.total_price            += viewData.etc_total_price

    const columns = [
        {
            title: '구분',
            dataIndex: 'separation',
            onCell: (_, index) => {
                if (index === 0) {
                    return {rowSpan: 11}
                } 
                if (index > 0 && index < 11) {
                    return {rowSpan: 0}
                }
                if (index === 11){
                    return {rowSpan: 6}
                }
                if (index > 11 && index < 17) {
                    return {rowSpan: 0}
                }
                if (index === 17){
                    return {rowSpan: 4}
                }
                if (index > 17 && index < 21) {
                    return {rowSpan: 0}
                }
            },
            width: '10%',
        },
        {
            title: '항목',
            dataIndex: 'article',
            width: '20%',
        },
        {
            title: '입력/선택/참고사항',
            dataIndex: 'notes',
            width: '30%',
        },
        {
            title: '금액',
            dataIndex: 'price',
            width: '20%',
            align: 'right',
        },
        {
            title: '상품당 개발비/기타',
            dataIndex: 'devCost',
            width: '20%',
            align: 'right',
        },

    ]
    
    const data = [
        {
            key: 0,
            separation: '기획/편집',
            article: '편집 진행',
            notes: '',
            price: moneyComma(viewData?.editing),
            devCost: '',
        },
        {
            key: 1,
            separation: '기획/편집',
            article: '번역',
            notes: '',
            price: moneyComma(viewData?.translation),
            devCost: '',
        },
        {
            key: 2,
            separation: '기획/편집',
            article: '교정교열',
            notes: '',
            price: moneyComma(viewData?.proofread),
            devCost: ''
        },
        {
            key: 3,
            separation: '기획/편집',
            article: '조판',
            notes: '',
            price: moneyComma(viewData?.typeset),
            devCost: ''
        },
        {
            key: 4,
            separation: '기획/편집',
            article: '출력 - CTP',
            notes: '',
            price: moneyComma(viewData?.ctp),
            devCost: ''
        },
        {
            key: 5,
            separation: '기획/편집',
            article: '출력 - 필름',
            notes: '',
            price: moneyComma(viewData?.film),
            devCost: ''
        },
        {
            key: 6,
            separation: '기획/편집',
            article: '도서 기획',
            notes: '',
            price: moneyComma(viewData?.planning),
            devCost: ''
        },
        {
            key: 7,
            separation: '기획/편집',
            article: '감수/추천사/원고 의뢰',
            notes: '',
            price: moneyComma(viewData?.supervise),
            devCost: ''
        },
        {
            key: 8,
            separation: '기획/편집',
            article: '부가 콘텐츠 개발/제작',
            notes: '',
            price: moneyComma(viewData?.add_content),
            devCost: ''
        },
        {
            key: 9,
            separation: '기획/편집',
            article: '편집 자료 구매(도서 제외)',
            notes: '',
            price: moneyComma(viewData?.editing_data),
            devCost: ''
        },
        {
            key: 10,
            separation: '기획/편집',
            article: '소계',
            notes: '',
            price: moneyComma(viewData.editing_total_price),
            devCost: ''
        },
        {
            key: 11,
            separation: '디자인',
            article: '디자인 진행',
            notes: 
            <Radio.Group value={viewData?.design} disabled={true}>
                <Radio value={'내부'}>내부</Radio>
                <Radio value={'외부'}>외부</Radio>
            </Radio.Group>
            ,
            price: '',
            devCost: ''
        },
        {
            key: 12,
            separation: '디자인',
            article: '표지',
            notes: insideVal === 1 ? "‘내부’ 선택 시 고정" : '',
            price: moneyComma(viewData?.cover),
            devCost: ''
        },
        {
            key: 13,
            separation: '디자인',
            article: '본문',
            notes: insideVal === 1 ? "‘내부’ 선택 시 고정" : '',
            price: moneyComma(viewData?.text),
            devCost: ''
        },
        {
            key: 14,
            separation: '디자인',
            article: '출력',
            notes: insideVal === 1 ? "‘내부’ 선택 시 고정" : '',
            price: moneyComma(viewData?.output),
            devCost: ''
        },
        {
            key: 15,
            separation: '디자인',
            article: '디자인 자료 구매(도서 제외)',
            notes: '',
            price: moneyComma(viewData?.design_data),
            devCost: ''
        },
        {
            key: 16,
            separation: '디자인',
            article: '소계',
            notes: '',
            price: moneyComma(viewData.design_total_price),
            devCost: ''
        },
        {
            key: 17,
            separation: '기타',
            article: '광고/홍보',
            notes: '',
            price: moneyComma(viewData?.ad),
            devCost: ''
        },
        {
            key: 18,
            separation: '기타',
            article: '증정',
            notes: <div style={{textAlign: 'right'}}>{moneyComma(viewData?.presentation_qty)}</div>,
            price: moneyComma(viewData?.presentation_price),
            devCost: ''
        },
        {
            key: 19,
            separation: '기타',
            article: '경상비',
            notes: '최근 평균 비용, 예상 출시 종수 등을 고려해서 회사에서 지정',
            price: moneyComma(viewData?.operating_cost),
            devCost: ''
        },
        {
            key: 20,
            separation: '기타',
            article: '소계',
            notes: '',
            price: moneyComma(viewData.etc_total_price),
            devCost: ''
        },
        {
            key: 21,
            separation: '',
            article: '',
            notes: '합계',
            price: moneyComma(viewData.total_price),
            devCost: ''
        }
    ]

    return (
        <>
            <Table 
                rowKey      = {'key'}
                columns     = { columns } 
                dataSource  = { data } 
                pagination  = { false } 
                className   = "devCostTable" 
                style       = {{ marginTop: 20 }} 
            />
        </>
    )
}

export default DevCost