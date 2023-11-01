import React from 'react';
import { Row, DatePicker } from 'antd';
import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { CollectionView } from '@grapecity/wijmo';
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import * as wjCore from '@grapecity/wijmo';
import { observer, useLocalStore } from 'mobx-react';

const index = observer(( props ) =>{

    const state = useLocalStore(() => ({
        list: [
            {
                id: 1,
                serialNumber: 37,
                company: '길벗',
                LogisticsCode: '301-180',
                accountName: '중부서적판매주식회사',
                prdCode: 'GA203',
                prdName: 'SNS웹툰무작정따라하기',
                price: '18,000',
                amount: 1,
                classify: '폐기 대기',
                returnDate: '2023-02-20',
                receivingDate: '2023-02-28',
                processingDate: '2023-03-06',
                registrationDate: '2023-03-07',
                collectionDate: '2023-03-07'
            },
        ],
        grid: null,
        dateItemName: [{id: 1, name: '적용일'}],
    }));

    React.useEffect(() => {
        theSearch.current.control.grid = theGrid.current.control;
    }, [])

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    const initGrid = (grid) => {
        state.grid = grid;

        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + ' ' + html.split('\\n')[1] + "<br/>" + html.split('\\n')[2] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }
        });


        grid.addEventListener(grid.hostElement, 'click', (e) => {
            let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
            if (e.target instanceof HTMLButtonElement) {
                switch(e.target.id){
                }
            }
        });
    };

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["serialNumber", "company", "LogisticsCode", "accountName", "prdCode", "prdName", "amount", "classify", "returnDate", "receivingDate", "processingDate", "registrationDate", "collectionDate"];
    };

    return(
        <>
            <Row className="topTableInfo">
                <wjInput.ComboBox
                    itemsSource={new CollectionView(state.dateItemName, {
                        currentItem: null
                    })}
                    selectedValuePath="id"
                    displayMemberPath="name"
                    valueMemberPath="id"
                    placeholder="항목"
                    style={{width: 120}}
                />
                <DatePicker.RangePicker 
                    style={{ margin: '0 20px 0 5px'}}
                />
                <FlexGridSearch ref={theSearch} placeholder='검색' />
            </Row>

            <FlexGrid
                ref={theGrid}
                itemsSource={state.list}
                initialized={(s) => initGrid(s)}
                headersVisibility="Column"
                allowMerging="ColumnHeaders"
                allowDragging="Both"
                selectionMode="None"
                isReadOnly={true}
                allowSorting={false}
                autoRowHeights={true}
            >
                <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                <FlexGridColumn binding="serialNumber" header="일련\n번호" width={80}/>
                <FlexGridColumn binding="company" header="회사" width={70} />
                <FlexGridColumn binding="LogisticsCode" header="물류코드" width={90} />
                <FlexGridColumn binding="accountName" header="거래처명" width={120} />
                <FlexGridColumn binding="prdCode" header="상품코드" width={90} />
                <FlexGridColumn binding="prdName" header="상품명" width="*" minWidth={150} />
                <FlexGridColumn binding="price" header="정가" width={90} align="right"/>
                <FlexGridColumn binding="amount" header="수량" width={70} align="right"/>
                <FlexGridColumn binding="classify" header="상태\n구분" width={100} />
                <FlexGridColumn binding="returnDate" header="거래처\n반품일" width={100} />
                <FlexGridColumn binding="receivingDate" header="입고일" width={100} />
                <FlexGridColumn binding="processingDate" header="라임북\n처리일" width={100} />
                <FlexGridColumn binding="registrationDate" header="라임북\n등록일" width={100} />
                <FlexGridColumn binding="collectionDate" header="길벗\n수집일" width={100} />
            </FlexGrid>

            <Row className='table_bot'>
                <div className='btn-group'>
                    <span>행 개수 : {state.list.length}</span>
                </div>
            </Row>
        </>
        
    );
});

export default index;