import { Table, Row, Typography } from "antd"
import { inject, observer, useLocalStore } from "mobx-react"
import React, { Fragment } from "react"
import { VariableSizeGrid  as Grid } from 'react-window';
import FormikInput from '@components/form/CustomInput';
import { useFormik, FormikProvider } from "formik";


import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import * as wjcCore from "@grapecity/wijmo";
import * as wjCore from '@grapecity/wijmo';

const HugeDataListTest = ({ commonStore }) => {
    const [listData, setListData] = React.useState([])
    const [rowEditing, setRowEditing] = React.useState('')
    const isEditing = (record) => record.dataIndex === rowEditing;

    const gridRef = React.useRef();
    const lastIndex = React.useRef(0)
    const thisScroll = React.useRef(0)



    React.useEffect(() => {
        fetchListData()


        console.log(state.flex.rows)
    }, [])

    const fetchListData = () => {
        commonStore.handleApi({
            method : 'GET', 
            url : `/sales-transaction-policy-group-products/10`,
        })
        .then((result) => {
            var testData = []

            for(var i = 0; i < 10; i++) {
                testData = testData.concat(result.data)
            }

            testData.map((item) => {
                item.dataIndex = lastIndex.current
                lastIndex.current += 1
            })

            setListData(testData)
        })
    }

    const initialValues = {
        department_id : '',
        department_name : '',
        supply_rate1 : '0',
        supply_rate2 : '0',
        supply_rate3 : '0',
        supply_rate4 : '0',
        supply_rate5 : '0',
        buyout_quantity : '0',
        supply_yn : 'Y',
    }

    const onSubmit = (e) => console.log(e)

    const formikHook = useFormik({
        initialValues : initialValues, 
        onSubmit : onSubmit
    })
    
    const columns = [
        {
            dataIndex : 'department_name', 
            title : "부서",
            width : 100,
            editable: true,
            ellipsis: true,
            style: {alignItems: 'flex-start', paddingLeft: 10}
        }, {
            dataIndex : 'product_id', 
            title : "상품코드",
            width : 100,
            editable: true,
            ellipsis: true,
            align : 'center',
            style: {alignItems: 'flex-end', paddingRight: 10}
        }, {
            dataIndex : 'product_name', 
            title : "상품명",
            width : 420,
            editable: true,
            ellipsis: true,
            style: {alignItems: 'flex-start', paddingLeft: 10}
        }, {
            dataIndex : 'isbn', 
            title : "ISBN",
            width : 160,
            editable: true,
            align : 'center',
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'isbn'}/> : <>{text}</>
        }, {
            dataIndex : 'go_date', 
            title : "출시일",
            width : 120,
            editable: true,
            align : 'center',
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'isbn'}/> : <>{text}</>
        }, {
            dataIndex : 'supply_rate1', 
            title : "위탁",
            width : 60,
            editable: true,
            align : 'center',
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'supply_rate1'}/> : <>{text}</>
        }, {
            dataIndex : 'supply_rate2', 
            title : "현매",
            width : 60,
            editable: true,
            align : 'center',
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'supply_rate2'}/> : <>{text}</>
        }, {
            dataIndex : 'supply_rate3', 
            title : "매절",
            width : 60,
            editable: true,
            align : 'center',
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'supply_rate3'}/> : <>{text}</>
        }, {
            dataIndex : 'supply_rate4', 
            title : "납품",
            width : 60,
            editable: true,
            align : 'center',
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'supply_rate4'}/> : <>{text}</>
        }, {
            dataIndex : 'supply_rate5', 
            title : "기타",
            width : 60,
            editable: true,
            align : 'center',
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'supply_rate5'}/> : <>{text}</>
        }, {
            dataIndex : 'buyout_quantity', 
            title : "매절",
            width : 60,
            editable: true,
            align : 'center',
            render : (text, record, index) => isEditing(record) ? <FormikInput name={'buyout_quantity'}/> : <>{text}</>
        }, {
            dataIndex : 'supply_yn', 
            title : "공급 여부",
            width : 80,
            editable: true,
            align : 'center',
            render : (text, record, index) => isEditing(record) ? 
                <FormikInput style={{justifyContent : 'center'}} type={'checkbox'} name={'supply_yn'} data={{checkboxData : [{value : 'Y'}]}}/>
                : 
                <FormikInput style={{justifyContent : 'center'}} type={'checkbox'} name={`supply_yn.${index}`} disabled value={text} data={{checkboxData : [{value : 'Y'}]}}/>
        }, {
            dataIndex : 'work', 
            title : "작업",
            width : 80,
            align : 'center',
            render: (text, record, index) => isEditing(record) ? (
                <div style={{textAlign: 'center'}}>
                    <Typography.Link onClick={() => save(record)} style={{marginRight: 5}}>저장</Typography.Link>
                    <Typography.Link onClick={cancel}>취소</Typography.Link>
                </div>
            ) : (
                <div style={{textAlign: 'center', width: '100%'}}>
                    <Typography.Link disabled={rowEditing !== ''} onClick={() => edit(record)}>수정</Typography.Link>
                </div>
            )
        }
    ]

    const edit = (record) => {

        console.log(record.dataIndex)
        console.log()
        setRowEditing(record.dataIndex)
        gridRef.current.scrollToItem({ columnIndex : 1, rowIndex: record.dataIndex })
        formikHook.setValues(record)
    }
    
    const cancel = (record) => {
        formikHook.setValues(formikHook.initialValues)
        isEditing !== '' && gridRef.current.scrollToItem({ columnIndex : 1, rowIndex: record.dataIndex })
        setRowEditing('')
    }

    const save = async (e) => {
        isEditing !== '' && gridRef.current.scrollToItem({ columnIndex : 1, rowIndex: e.dataIndex })
        formikHook.handleSubmit()
    }



    const state = useLocalStore(() => ({}))
    
    const initGrid = (grid) => {
        state.flex = grid;
        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
                let col = s.columns[e.col];
                e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
            }
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                // create buttons for items not being edited
                switch (col.binding) {
                    // case 'department_id':
                    //     e.cell.innerHTML = '<input id="' + col.binding + '" type="checkbox" name= "'+col.binding+item.id+'" value="'+item.supplyStatus+'" />';
                        // break;
                    case 'work':
                        e.cell.innerHTML = `<button id="btnModify" class="btnText blueTxt">수정</button>`
                        break;
                }
            }




        });
        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                // get button's data item
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                // handle buttons
                state.idx = item.id;
                switch (e.target.id) {
                    case 'btnLink':
                        // proViewOpen();
                        break;
                }
            }
        });
        
    };

    const VirtualTable = (props) => {
        const { columns, scroll } = props;

        console.log(scroll)
        const [tableWidth, setTableWidth] = React.useState(1660);
        const widthColumnCount = columns.filter(({ width }) => !width).length;
        var totalColumnWidth = 0
        columns.map((column) => totalColumnWidth += column.width)

        const mergedColumns = columns.map((column) => {
            if (column.width) {
                return {
                    ...column,
                    width: Math.floor(tableWidth / totalColumnWidth * column.width),
                }
            }
            return {
                ...column,
                width: Math.floor(tableWidth / widthColumnCount),
            }
        })
        const RenderVirtualList = (rawData, asdasd) => {
            const totalHeight = rawData.length * 54

            React.useEffect(() => {
                if (thisScroll !== 0 && thisScroll.current !== gridRef.current.state.scrollTop) {
                    gridRef.current.scrollTo({scrollLeft : 0, scrollTop : thisScroll.current})
                }
            }, [])

            return (
                <Grid
                    ref={gridRef}
                    className="virtual-grid"
                    columnCount={mergedColumns.length}
                    columnWidth={(index) => {
                        const { width } = mergedColumns[index];

                        return totalHeight > scroll?.y && index === mergedColumns.length - 1
                        ? width - 10 - 1
                        : width;
                    }}
                    height={scroll.y}
                    rowCount={rawData.length}
                    rowHeight={() => 38}
                    width={tableWidth}
                    onScroll={(props) => {
                        if (props.scrollTop !== 0) {
                            thisScroll.current = props.scrollTop
                        }
                    }}
                >
                    {({ columnIndex, rowIndex, style }) => {
                        return (
                        <div
                            style={{
                                ...style,
                                boxSizing: 'border-box',

                                borderLeftWidth: '0.1px',
                                borderBottomWidth: '0.1px',
                                borderRightWidth: '0px',
                                borderTopWidth: '0px',
                                borderStyle: 'solid', 
                                borderColor: '#eee',
                                display: 'flex',
                                alignItems: 'center', 
                                flexDirection: 'column',
                                justifyContent: 'center',
                                ...mergedColumns[columnIndex].style ? mergedColumns[columnIndex].style : {}
                            }}
                        >
                            {
                            mergedColumns[columnIndex].render ? 
                                mergedColumns[columnIndex].render(rawData[rowIndex][mergedColumns[columnIndex].dataIndex], rawData[rowIndex], rowIndex)
                                : 
                                rawData[rowIndex][mergedColumns[columnIndex].dataIndex]
                            }
                        </div>
                    )}}
                </Grid>
            )
        }

        return (
            <Table
                {...props}
                className="virtual-table"
                columns={mergedColumns}
                pagination={false}
                components={{
                    body: RenderVirtualList,
                }}
            />
        )
    }

    return <>
        <FormikProvider value={formikHook}>
            <VirtualTable
                columns={columns}
                dataSource={listData}
                scroll={{
                    x : 1660, 
                    y : 300
                }}
            />
        </FormikProvider>

        <div style={{margin: 10}}>
            
        </div>

        <Row className="gridWrap" style={{ width: 1630, height:300 }}>
            <FlexGrid 
                itemsSource={listData} 
                initialized={(s) => initGrid(s)}
                headersVisibility="Column"
                allowMerging="ColumnHeaders"
            >
                <FlexGridColumn binding="department_name" header="부서" width={120} />
                <FlexGridColumn binding="product_id" header="상품코드" width={120} />
                <FlexGridColumn binding="product_name" header="상품명" width="*" minWidth={150} />
                <FlexGridColumn binding="" header="ISBN" width={180} />
                <FlexGridColumn binding="" header="출시일" width={120} />
                <FlexGridColumn binding="supply_rate1" header="위탁" width={70} align="right"/>
                <FlexGridColumn binding="supply_rate2" header="현매" width={70} align="right"/>
                <FlexGridColumn binding="supply_rate3" header="매절" width={70} align="right"/>
                <FlexGridColumn binding="supply_rate4" header="납품" width={70} align="right"/>
                <FlexGridColumn binding="supply_rate5" header="기타" width={70} align="right"/>
                <FlexGridColumn binding="buyout_quantity" header="매절 부수" width={70} align="right"/>
                <FlexGridColumn binding="supply_yn" header="공급 여부" width={80} align="center"/>
                <FlexGridColumn binding="" header="작업" width={80} align="center"/>
            </FlexGrid>     
        </Row>
    </>
}

export default inject('commonStore')(observer(HugeDataListTest)) 