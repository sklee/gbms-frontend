import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Button, Modal, Input, Select } from 'antd';
import { FlexGrid, FlexGridColumn, FlexGridCellTemplate } from "@grapecity/wijmo.react.grid";
import { Selector } from "@grapecity/wijmo.grid.selector";
import * as wjcGrid from '@grapecity/wijmo.grid';
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjcCore from '@grapecity/wijmo';
import useStore from '@stores/useStore';
import { CollectionView } from "@grapecity/wijmo";  
import { observer, useLocalStore, inject } from 'mobx-react';
import { FormikContext} from 'formik';
import { toJS } from 'mobx';

const index = observer((props) => {
    // console.log("props id: ", props.gridDetails)
    const formikHook    = React.useContext(FormikContext)
    const [supplyRate, setSupplyRate] = useState('');
    const [selectorIdArr, setSelectorIdArr] = useState([]);
    const [productOptions, setProductOptions] = useState([]);
    const { Option } = Select;    
    const { commonStore } = useStore();
    const { companyName, rowId } = props;
    const theGrid = React.useRef();

    const state = useLocalStore(() => ({
        grid: null,
        selectRows: [],
        list: props.gridDetails,
        // list: [{id: 1, name : '테스트',  type : 1, user : [25], userID : 25}],
        // list: commonStore.shipSaleViewGrid,
        // list: viewVisible,
        addCnt: 1,
        addBtn: true,
        currentEditItem: null,
        modify: true
    }));

        // fetch 함수 분리 및 간소화
    const fetchData = () => {
        commonStore.handleApi({
            method: 'GET',
            url: `/product-search`,
            data : {
                company : (companyName == '길벗' || companyName == '도서출판 길벗') ? 'G' : 'S', 
                sales_account_id : rowId, 
                keyword : `컴퓨터`
            }
        })
        .then (result => {
            setProductOptions(result.data.map(item => ({
                value       : item.id,
                label       : item.name,
                product_code: item.product_code,
                isbn        : item.isbn,
                fixed_price : item.price,
                rate        : item.supply_rate1,
            })))
        })
    }

    useEffect(() => {
        state.list = props.gridDetails;
        props?.gridDetails !== undefined && fetchData()
    }, [props?.gridDetails])

    /*
    useEffect(() => {
        if (props !== undefined) {
            state.list = props.gridDetails;
        }

        const fetchProductData = async () => {

            let companyCode;

            if (companyName == '길벗' || companyName == '도서출판 길벗') {
                companyCode = 'G';
            } else if (companyName == '스쿨') {
                companyCode = 'S';
            }
            
            const result = await commonStore.handleApi({
                method: 'GET',
                url: `/product-search?company=${companyCode}&sales_account_id=${rowId}&keyword=컴퓨터`,
                // url: `/product-search?company=G&sales_account_id=19&keyword=컴퓨터`,
                // url: `/codes?parent_code=3193`,
            });
            const options = result.data.map(item => ({
                // value: item.product_code,
                value: item.product_code,
                label: item.name,
                isbn: item.isbn,
                fixed_price: item.price,
                rate: item.supply_rate1,
            }));
            setProductOptions(options);
            return result.data;
        };

        const fetchData = async () => {
            try {
                const [warehouseData] = await Promise.all([
                    fetchProductData(),
                ]);
                // formikHook.setValues({ ...warehouseData });
            } catch (error) {
                console.error("API 호출에서 오류가 발생했습니다:", error);
            }
        };

        fetchData();
    }, [props.gridDetails]);
    */
    // }, [commonStore, props, state]);

    const updateProductName = (selectedValue, selectedLabel) => {
        // console.log("selectedValue: ", selectedValue)
        if (state.currentEditItem) {
            state.currentEditItem.product_name = selectedLabel;
            state.currentEditItem.product_id = selectedValue;
            
            // 선택한 옵션 id값을 가지고 다른 항목 데이터를 가져오기 위한 로직
            const selectedOption = productOptions.find(option => option.value === selectedValue);
            
            if (selectedOption) {
                state.currentEditItem.product_code = selectedOption.product_code;                 
                state.currentEditItem.isbn = selectedOption.isbn; 
                state.currentEditItem.fixed_price = selectedOption.fixed_price; 
                state.currentEditItem.rate = selectedOption.rate;                 
            }
            // console.log("selectedOption: ", selectedOption)
            console.log("currentEditItem: ", state.currentEditItem)
        }
    };

    const [selectorState, setSelectorState] = useState({
        view: new CollectionView(state.list),
        selectedItems: []
    });

    const initGrid = (grid) => {
        state.grid = grid;

        let extraRow = new wjGrid.Row();
        extraRow.allowMerging = true;
        var panel = grid.columnHeaders;
        panel.rows.splice(0, 0, extraRow);

        // grid.selectionChanged.addHandler(function (s, e) {
        //     const rowIndex = e.row;
        //     const colIndex = e.col;

        //     // 페이지 초기 진입 시 grid null 체크
        //     if (!s || !s.collectionView) return; 
            
        //     // 선택한 행의 데이터를 가져온다.
        //     const selectedRowData = s.collectionView.currentItem;
        //     console.log("selectedRowData: ", selectedRowData)
        // });

        state.selectRows = new Selector(grid, {
            itemChecked: (s, e) => {
                var selectedItem = grid.rows.filter(r => r.isSelected)
                // setSelectorState({
                //     selectedItems: grid.rows.filter(r => r.isSelected)
                // });
                var chk = 0;
                var arr = [];

                for (let i = 0; i < grid.rows.length; i++) {
                    if (grid.rows[i].isSelected) {
                        arr.push(i);
                    }
                }
                // selectedItem.forEach(e => {
                //     arr = [...arr, e.dataItem['product_id']]
                //     if(e.dataItem.payment_status !== '회송'){
                //         chk++                    
                //     }else{                       
                //         arr = [...arr,e.dataItem['payments.id']]  
                //     }
                // });
                // state.selectorIdChk = chk;
                // state.selectorId = arr;
                setSelectorIdArr(arr);
            }
        })

        state.selectRows._col.allowMerging = true;
        state.selectRows.column = grid.columns[0];

        for (let colIndex = 0; colIndex <= 13; colIndex++) {
            if (colIndex >= 5 && colIndex <= 8) {
                panel.setCellData(0, colIndex, '출고 수량');
            } else {
                let col = grid.getColumn(colIndex);
                col.allowMerging = true;
                panel.setCellData(0, colIndex, col.header);
            }
        }

        grid.columnFooters.rows.push(new wjcGrid.GroupRow());

        grid.formatItem.addHandler(function (s, e) {
            // if(e.panel._ct == 4){
            //     e.cell.innerHTML = '<div class="v-center">순서</div>';
            // }
            // if(e.panel == s.rowHeaders){
            //     e.cell.innerHTML = e.row + 1;
            // }            
            if (e.panel == s.columnHeaders) { // 컬럼 헤더 속성 정의
                var html = e.cell.innerHTML;
                let col = s.columns[e.col];
                switch (col.binding) {
                    case 'chk':
                        e.cell.classList.add("headCenter")
                        break;
                    case 'rate':
                        e.cell.innerHTML = `<div class="v-center"><div>공급률</div> <button class="ant-btn" id="btnModify">수정</button></div>`;
                        break;
                    case 'work':
                        if (state.addBtn === true) {
                            e.cell.innerHTML = `<div class="v-center"><div>작업</div> <button class="ant-btn" id="btnAdd">추가</button></div>`;
                        } else {
                            e.cell.innerHTML = `<div class="v-center"><div>작업</div> <button class="ant-btn" id="btnAdd">취소</button></div>`;
                        }
                        break;
                    default:
                        if (html.split('\\n').length > 1) {
                            e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + "<br/>" + html.split('\\n')[1] + '</div>';
                        } else {
                            e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                        }
                }
            }

           
            if (e.panel == s.cells) { // 세부 cell 속성 정의
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                if (item == state.currentEditItem) {
                    switch (col.binding) {
                        case 'deliveryQuantity':
                            break;
                        case 'select':
                            e.cell.innerHTML = `<input type="checkbox" ${item.select ? "checked" : ""} />`;
                            break;
                        case 'prdName':
                        // let name = '<button id="btnLink" class="btnLink">' + item.prdName + '</button>';
                        // e.cell.innerHTML = name + ' ' + document.getElementById('tplBtnViewMode').innerHTML;
                        // e.cell['dataItem'] = item;
                        // break;
                        case 'isbn':                           
                        case 'shipping_qty_1':
                        case 'shipping_qty_2':
                        case 'shipping_qty_3':
                        case 'rate':
                            // e.cell.innerHTML = `<input class="ant-input" name="rate" value="${item.rate}" />`;
                            e.cell.innerHTML = '<input class="ant-input" name ="' + (item[col.binding] || '') + '"' + 'id="' + col.binding + '"' + 'value="' + (item[col.binding] || '') + '"/>';
                            // e.cell['dataItem'] = item;
                            break;
                        case 'equipment':
                        case 'disuse':
                            if (item.example == '회송') {
                                e.cell.innerHTML = item[col.binding];
                            } else {
                                e.cell.innerHTML = '<input class="ant-input" name ="' + item[col.binding] + '"' + 'id="' + col.binding + '"' + 'value="' + item[col.binding] + '"/>';
                            }
                            e.cell['dataItem'] = item;
                            break;
                        case 'work':
                            if (item.example != '회송') {
                                // e.cell.innerHTML = '<button id="btnDataAdd" class="btnText blueTxt">추가</button>';
                                e.cell.innerHTML = '<button id="btnOk" class="btnText blueTxt">확인</button><button id="btnCancel" class="btnText btn_cancel grayTxt">취소</button>';
                                e.cell['dataItem'] = item;
                            }
                            break;
                    }
                } else {
                    switch (col.binding) {
                        case 'disuse':
                            if (item.example == '회송') {
                                e.cell.innerHTML = item[col.binding];
                            } else {
                                e.cell.innerHTML = '<input class="ant-input" name ="' + item[col.binding] + '"' + 'id="' + col.binding + '"' + 'value="' + item[col.binding] + '"/>';
                            }
                            e.cell['dataItem'] = item;
                            break;
                        case 'work':
                            if (item.product_name != '회송') {
                            // if (item.product_name.includes('아이랑')) {
                                e.cell.innerHTML = '<button id="btnEdit" class="btnText blueTxt">수정</button><button id="btnDel" class="btnText redTxt">삭제</button>';
                                e.cell['dataItem'] = item;
                                break;
                            }
                    }
                }
                
            }
        });


        grid.addEventListener(grid.hostElement, 'click', (e) => {
            let item = wjcCore.closest(e.target, '.wj-cell')?.['dataItem'];
            if (e.target instanceof HTMLButtonElement) {
                // const item = e.cell.dataItem;
                // let ht = grid.hitTest(e);  // hitTest 메서드를 사용하여 히트 테스트 정보를 가져옵니다.               
                // let item = grid.itemsSource[ht.row];
                // console.log()
                switch (e.target.id) {
                    case 'btnModify': // 공급률 수정
                        modalOpen();
                        break;
                    case 'btnAdd': // 컬럼(작업) 헤더 추가
                        rowAdd(state.addBtn);
                        break;
                    case 'btnEdit': // cell 수정
                        editItem(item);
                        break;
                    case 'btnDel': // cell 삭제
                        // rowDel(item.id);
                        rowDel(item);
                        break; 
                    case 'btnCancel':                    
                        break;
                    case 'btnOk':
                        commitEdit();
                        break;
                }
            }
        });
        
        //변경값 UI 적용
        grid.addEventListener(grid.hostElement, 'change', (e) => {
            if(e.target instanceof HTMLInputElement) {
                if(e.target.id === 'rate'){
                    state.currentEditItem[e.target.id] = Number(e.target.value);
                } else {
                    state.currentEditItem[e.target.id] = e.target.value;
                }
                
            }
        });
    };

    const [modalRateModify, setModalRateModify] = useState(false);
    const modalOpen = () => setModalRateModify(true);
    const modalClose = () => setModalRateModify(false);

    //추가 버튼
    const rowAdd = (e) => {
        if (e === true) { //행추가일때            
            state.addCnt = state.addCnt - 1;
            state.currentEditItem = {
                // id: state.addCnt,
                chk: '',
                product_name: '',
                product_id: '',
                id: '',
                isbn: '',
                distribution_qty: '',
                shipping_qty: '',
                shipping_qty_1: '',
                shipping_qty_2: '',
                shipping_qty_3: '',
                fixed_price: '',
                rate: '',
                unit_price: '',
                order_amount: '',
                sum: '',
                work: '',
                genuine: '',
                equipment: '',
                disuse: '',
                price: '',
                supplyRate: '',
                supplyUnit: '',
                supplyPrice: '',
                isNew: true, // 추가된 항 식별자
                modify: true,
                remove: false
            };
            let view = new CollectionView(state.list);
            view.sourceCollection.splice(0, 0, state.currentEditItem); //값 삽입
            state.grid.collectionView.refresh(state.currentEditItem); // 삽입된 값 그리드에 반영         
            state.addBtn = false;
        } else { //행추가를 취소할때
            state.addCnt = state.addCnt + 1;
            state.grid.collectionView.remove(state.currentEditItem);
            state.addBtn = true;
        }
    }
    const deletedItems = [];
    //셀삭제
    const rowDel = (item) => {
        /* 1nd  삭제 후 추가 시 삭제 row 사라지는 이슈*/
        // item.remove = true;
        // state.list = state.list.filter(row => row.id != item.id);
        // formikHook.setFieldValue("details", state.grid.itemsSource);

        // deletedItems.push(item);
        // const mergedItemsSource = [...state.grid.itemsSource, ...deletedItems];
        // console.log("mergedItemsSource: ", mergedItemsSource)

        // formikHook.setFieldValue("slip_out_sale_details", mergedItemsSource);

        /* 2nd  삭제 후 추가 시 삭제 row 사라지는 이슈*/
        item.remove = true;
        // 병합된 리스트를 생성 (deletedItems에는 삭제된 항목을 추가하지 않음)
        const mergedItemsSource = state.grid.itemsSource.filter(row => row.id !== item.id);

        formikHook.setFieldValue("gridDtldData", mergedItemsSource);

        deletedItems.push(item);
        formikHook.setFieldValue("details", deletedItems);
    }

    //수정 버튼 
    const editItem = (item) => {
        state.currentEditItem = item;
        state.currentEditItem.modify = true;
        state.grid.invalidate()
        state.grid.collectionView.refresh();
    }

    //확인 버튼
    const commitEdit = (idx) => {
        // 배본수량, 합계
        const qty1 = parseInt(state.currentEditItem.shipping_qty_1, 10) || 0;
        const qty2 = parseInt(state.currentEditItem.shipping_qty_2, 10) || 0;
        const qty3 = parseInt(state.currentEditItem.shipping_qty_3, 10) || 0;
        const total = qty1 + qty2 + qty3;
        state.currentEditItem.distribution_qty = total;
        state.currentEditItem.shipping_qty = total;

        // 공급 단가, 공급 금액
        const unit_price = state.currentEditItem.fixed_price * (state.currentEditItem.rate / 100);
        const order_amount = unit_price * state.currentEditItem.shipping_qty;
        state.currentEditItem.unit_price = unit_price;
        state.currentEditItem.order_amount = order_amount;

        // 결과 업데이트
        state.currentEditItem.modify = false;
        state.currentEditItem = null;
        state.grid.invalidate();
        state.grid.collectionView.refresh();
        state.addBtn = true;


        const updatedItems = state.grid.itemsSource;

        const mergedItems = updatedItems.concat(deletedItems);
        // 여기서 updatedItems를 slip_out_sale_details에 추가하려면 formikHook를 사용  
        formikHook.setFieldValue("gridDtldData", updatedItems);
        formikHook.setFieldValue("details", mergedItems);

    }

    // 취소 버튼
    const cancelEdit = () => {
        if (state.currentEditItem) {
            if (state.currentEditItem.addCode === '') { //행추가 취소시 행 삭제
                state.addCnt = state.addCnt + 1;
                state.flex.collectionView.remove(state.currentEditItem);
                state.addBtn = true;
            }
            state.currentEditItem.modify = false;
            state.currentEditItem = null;
            state.flex.invalidate();
            state.flex.collectionView.refresh();
        }
    }

    const handleApplyClick = () => {
        // 공급률 변경 로직 
        updateOrderAmount(supplyRate, selectorIdArr);
        modalClose('modify');
    };

    const [updatedList, setUpdatedList] = useState([]);

    const updateOrderAmount = (rate, selectedIds) => {
        const updatedRate = parseFloat(rate);

        if (isNaN(updatedRate)) {
            alert("유효한 숫자를 입력하세요.");
            return;
        }

        // state.list를 복제하여 업데이트
        const updatedList = [...state.list];
        
        selectedIds.forEach(index => {
            const item = updatedList[index];
            if (item) {
                item.rate = updatedRate;
            }
            const row = state.grid.rows[index];
            if (row) {
                const itemRow = { ...row.dataItem, rate: updatedRate };
                updatedList[index] = itemRow;
            }
        });

        // MobX 상태 업데이트
        state.list = updatedList;

        // console.log("updatedList: ", updatedList);

        // 만약 grid가 observable object라면 refresh와 같은 행동을 수행해야 할 수도 있습니다.
        // 하지만, 주어진 코드에서는 state.grid.refresh()에 대한 정확한 동작을 모르므로 주석 처리합니다.
        // state.grid.refresh();

        formikHook.setFieldValue('details', updatedList);

        // formikHook의 상태가 정상적으로 업데이트되었는지 확인
        // console.log("Formik details field value: ", formikHook.values.details);
    };


    return (
        <>
            <FlexGrid
                ref={theGrid}
                itemsSource={state.list}
                initialized={(s) => initGrid(s)}
                style={{ maxHeight: '500px' }}
                isReadOnly={true}
                selectionMode="Row"
                allowMerging="ColumnHeaders"
                headersVisibility="Column"
                allowSorting={false}
                allowDragging="Both"
                autoRowHeights={true}
                newRowAtTop={true}
                allowAddNew={true}
            >
                <FlexGridColumn binding="chk" header=" " width={50} align="center" cssClass="chk" />
                {/* <FlexGridColumn binding="select" header="선택" width={50} align="center" cssClass="select" />
                <FlexGridColumn binding="b" header="b" width={50} align="center" cssClass="chk" /> */}
                <FlexGridColumn binding="product_name" header="상품명(내부)" width="*" minWidth={150} >
                    <FlexGridCellTemplate
                        cellType="Cell"
                        template={(cell) => {
                            if(cell.item.modify) {
                                return (                
                                    <Select style={{ width: '100%' }}
                                        placeholder="선택"
                                        onChange={(selectedValue, option) => {
                                            const selectedLabel = option.children;
                                            // console.log("selectedLabel: ", selectedLabel)
                                            updateProductName(selectedValue, selectedLabel);
                                            // state.currentEditItem.product_name = selectedValue;
                                        }}
                                    >
                                        {productOptions.map((option, index) => (
                                            <Option key={index} value={option.value}>
                                                {option.label}
                                            </Option>
                                        ))}
                                    </Select>
                                );
                            } else {
                                return cell.item.product_name;
                            }
                            
                        }}
                    />
                </FlexGridColumn>
                <FlexGridColumn binding="product_code" header="상품코드" width="*" minWidth={150} />                    
                <FlexGridColumn binding="isbn" header="ISBN" width={90} />
                <FlexGridColumn binding="distribution_qty" header="배본\n수량" width={70} align="right" aggregate="Sum" />
                <FlexGridColumn binding="shipping_qty" header="합계" width={70} align="right" aggregate="Sum" />
                <FlexGridColumn binding="shipping_qty_1" header="정품" width={80} align="right" aggregate="Sum" />
                <FlexGridColumn binding="shipping_qty_2" header="비품" width={80} align="right" aggregate="Sum" />
                <FlexGridColumn binding="shipping_qty_3" header="폐기대기" width={85} align="right" aggregate="Sum" />
                <FlexGridColumn binding="fixed_price" header="정가" width={90} align="right" />
                <FlexGridColumn binding="rate" header="공급률" width={80} align="right" />
                <FlexGridColumn binding="unit_price" header="공급 단가" width={90} align="right" />
                <FlexGridColumn binding="order_amount" header="공급 금액" width={90} align="right" aggregate="Sum" />
                <FlexGridColumn binding="work" header="작업" width={100} align="center" />
                <FlexGridColumn binding="remove" header="삭제여부" visible={false} />
            </FlexGrid>
            <div id="tplBtnViewMode">
                <div className="btnLayoutWrap">
                    <button id="btnNew" className="btn-layout ant-btn ant-btn-circle">N</button>
                </div>
            </div>

            <Modal
                title={"공급률 수정"}
                visible={modalRateModify}
                onCancel={(e) => { modalClose('modify') }}
                footer={
                    <Button key="submit" type="primary" onClick={handleApplyClick}>
                        일괄 적용
                    </Button>
                }
            >
                선택 건의 공급률을
                {/* <Input style={{ width: '80px' }} /> % */}
                <Input
                    style={{ width: '80px' }}
                    value={supplyRate}
                    onChange={(e) => setSupplyRate(e.target.value)}
                /> %
            </Modal>
        </>
    );
    // });
});
// export default inject('commonStore')(observer(Index))
export default index;