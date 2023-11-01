/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect } from 'react';
import { Pagination, Button, Row, Col, message, Modal, Select} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { FlexGrid, FlexGridColumn  } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import * as wjcInput from '@grapecity/wijmo.input';
import * as wjcGrid from '@grapecity/wijmo.grid';
import * as wjcCore from '@grapecity/wijmo';

import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';


import styled from 'styled-components';

import useStore from '@stores/useStore';
import axios from 'axios';
import Excel from '@components/Common/Excel';


const Wrapper = styled.div`
    width: 100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
    #tplBtnViewMode, #tplBtnEditMode {display:none}
`;



const billingClassCodeList = observer(({tab}) => {
    const { commonStore } = useStore();
    
    const { Option } = Select;    
    const { confirm } = Modal;

    const state = useLocalStore(() => ({
        type : '',                  //길벗, 스쿨 타입
        currentEditItem : null,     //row data
        grid:'',                    //grid데이터
        // allowAddNew: false,         

        data:[],                    //등록 데이터
        list: [],                   //리스트 데이터        

        addBtn : true,              //추가버튼 활성화
        chkAccountCode1 : '',
        chkAccountCode2 : '',
        
        //페이징
        total: 0,
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },
       
    }));
    
    useEffect(() => { 
        state.tab = tab;
        if(tab == 'billingClassCode'){
            fetchData();
        }
    }, [tab]);

    useEffect(() => {
        theSearch.current.control.grid = theGrid.current.control;
    }, [])

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    const handleReset = useCallback(() => {
        confirm({
            icon: <ExclamationCircleOutlined />,
            title: '이 창의 입력 내용이 삭제됩니다.',
            content: '그래도 계속 하시겠습니까?',
            onOk() {
                state.data = [];
                fetchData();
            },
            onCancel() {
              
            },
        });
        // return window.ask({
        //     title: `이 창의 입력 내용이 삭제됩니다.`,
        //     content: `그래도 계속 하시겠습니까?`,
        //         async onOk() {
        //             state.data = [];
        //             fetchData();
        //         },
        //     });
    }, []);

    const pageChange = (num)=>{
        let FLEXLAYOUT = document.querySelectorAll(".flexlayout__tab");
        FLEXLAYOUT.forEach((item)=>{
            item.scrollTo(0, 0);
        })
        fetchData(num);
    }
    
    //리스트
    const fetchData = useCallback(async (val) => {    
        
        if (val == '' || val == '0' || val == undefined) {
            var page = 1;
        } else {
            var page = val;
        }
    
        var config = {
            method: 'GET',
            url:process.env.REACT_APP_API_URL +'/api/v1/billing-classification-list?display='+state.pageArr.pageCnt+'&page='+page +'&sort_by=date&order=desc',
            headers: {
                Accept: 'application/json',
            },
        };

        axios(config)
            .then(function (result) {
                if (result.data.success === false) {
                    Modal.error({
                        title: '오류가 발생했습니다.',
                        content: '오류코드:' + result.data.message,
                    });
                } else {
                    state.list = result.data.data;
                    state.total = result.data.meta.total;
                    state.pageArr.page = result.data.meta.current_page;
                    state.pageArr.pageCnt = result.data.meta.per_page;

                    //그룹화
                    state.list = new wjcCore.CollectionView(state.list, {
                        sortDescriptions: ["class1.name", "class2.name"],
                        groupDescriptions: ["class1.name", "class2.name"]

                        
                    })                

                }
            })
            .catch(function (error) {
                console.log(error.response);
                Modal.error({
                    title: '오류가 발생했습니다. 재시도해주세요.',
                    content: '오류코드:' + error.response.status,
                });
            });
        
    }, []);


    const initGrid = (grid) => {           
        state.grid= grid;

        //header 합치기
        grid.rowHeaders.columns.splice(0, 1); // no extra columns

        var extraRow = new wjcGrid.Row();
        extraRow.allowMerging = true;

        var panel = grid.columnHeaders;
        panel.rows.splice(0, 0, extraRow);

        for (let colIndex = 0; colIndex <= 8; colIndex++) {
            if(colIndex >= 3 && colIndex <= 4  ){
                panel.setCellData(0, colIndex, '계정 코드');
            }else if(colIndex >= 5 && colIndex <= 7  ){
                panel.setCellData(0, colIndex, '비용 청구에서의 사용 여부');
            }else{
                let col = grid.getColumn(colIndex);
                col.allowMerging = true;
                panel.setCellData(0, colIndex, col.header);
            }            
        }

        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.columnHeaders && e.range.rowSpan > 1) {
                var html = e.cell.innerHTML;
                e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
            }
        });
        grid.autoGenerateColumns = false;
        grid.itemsSource = state.list;

        //그룹화
        grid.select(new wjcGrid.CellRange(0, 0), true);

        // 한번 클릭시 수정
        grid.selectionChanged.addHandler(function (s, e) {
            if(e.col == 3 || e.col == 4){
                grid.startEditing(true, e.row, e.col);
            }
            // console.log(s)
            // console.log(e)
           
        });

        // 체크박스
        grid.formatItem.addHandler((s, e) => {
            if (e.panel == s.cells) {
                let col = s.columns[e.col], item = s.rows[e.row].dataItem;

                // create buttons for items not being edited
                switch (col.binding) {
                    case 'account_code1':
                        e.cell['dataItem'] = item;
                        break;
                    case 'account_code2':
                        e.cell['dataItem'] = item;
                        break;
                    case 'product_use_yn':
                        if(item.product_use_yn == "Y" ){
                            var checked = 'checked="checked"';
                        }else{
                            var checked = '';
                        }
                        e.cell.innerHTML = '<input id="' + col.binding + '" type="checkbox" name= "'+item.id+'" value="'+item.product_use_yn+'" '+checked+' />';
                        e.cell['dataItem'] = item;
                        break;

                    case 'department_use_yn':
                        if(item.department_use_yn == "Y" ){
                            var checked = 'checked="checked"';
                        }else{
                            var checked = '';
                        }
                        e.cell.innerHTML = '<input id="' + col.binding + '" type="checkbox" name= "'+item.id+'" value="'+item.department_use_yn+'" '+checked+' />';
                        e.cell['dataItem'] = item;
                        break;

                    case 'unitprice_use_yn':
                        if(item.unitprice_use_yn == "Y" ){
                            var checked = 'checked="checked"';
                        }else{
                            var checked = '';
                        }
                        e.cell.innerHTML = '<input id="' + col.binding + '" type="checkbox" name= "'+item.id+'" value="'+item.unitprice_use_yn+'" '+checked+'/>';
                        e.cell['dataItem'] = item;
                        break;
                }
                    
            }
        });

        // 체크박스 clicks
        grid.addEventListener(grid.hostElement, 'change', (e) => {
            if (e.target instanceof HTMLInputElement) {
                let item = wjcCore.closest(e.target, '.wj-cell')['dataItem'];
                state.chkAccountCode1 = item.account_code1;
                state.chkAccountCode2 = item.account_code2;

                if(e.target.id == "product_use_yn"){
                    switch (e.target.id) {
                        case 'product_use_yn':
                            if(e.target.checked === false){
                                item.product_use_yn = 'N'
                            }else{
                                item.product_use_yn = 'Y'
                            }
                            
                            // if(item.product_use_yn === 'Y'){
                                // console.log(grid.hostElement.querySelector('#product_use_yn').value)
                                // item.product_use_yn = grid.hostElement.querySelector('#product_use_yn').value
                            // if(grid.hostElement.querySelector('#product_use_yn').value === 'Y'){
                            //     grid.hostElement.querySelector('#product_use_yn').value='N';
                            //     item.product_use_yn = 'N'
                            // }else{
                            //     grid.hostElement.querySelector('#product_use_yn').value='Y';
                            //     item.product_use_yn = 'Y'
                            // }
                            break;
                    }
                }        
                if(e.target.id == "department_use_yn"){
                    switch (e.target.id) {
                        case 'department_use_yn':
                            if(e.target.checked === false){
                                item.department_use_yn = 'N'
                            }else{
                                item.department_use_yn = 'Y'
                            }
                            // if(grid.hostElement.querySelector('#department_use_yn').value === 'Y'){
                            //     grid.hostElement.querySelector('#department_use_yn').value='N';
                            //     item.department_use_yn = 'N'
                            // }else{
                            //     grid.hostElement.querySelector('#department_use_yn').value='Y';
                            //     item.department_use_yn = 'Y'
                            // }
                            break;
                    }
                }   
                if(e.target.id == "unitprice_use_yn"){
                    switch (e.target.id) {
                        case 'unitprice_use_yn':
                            if(e.target.checked === false){
                                item.unitprice_use_yn = 'N'
                            }else{
                                item.unitprice_use_yn = 'Y'
                            }
                            // if(grid.hostElement.querySelector('#unitprice_use_yn').value === 'Y'){
                            //     grid.hostElement.querySelector('#unitprice_use_yn').value='N';
                            //     item.unitprice_use_yn = 'N'
                            // }else{
                            //     grid.hostElement.querySelector('#unitprice_use_yn').value='Y';
                            //     item.unitprice_use_yn = 'Y'
                            // }
                            break;
                    }
                }   
                dataChange(item)
            } 
        });    
        
        grid.cells.hostElement.addEventListener('keyup',(e)=>{
            let item = wjcCore.closest(e.target, '.wj-cell')['dataItem'];

            if(grid.activeEditor){
                var value=grid.activeEditor.value;
                var numChk = /[^\/0-9]/g;
                
                if(grid.columns[grid.editRange.col].binding ==="account_code1" ){ // country에 바인딩되어 있고 값에 e가 포함된 경우,
                    if(numChk.test(value)){
                        message.warning('숫자와 특수문자(/)만 입력 가능합니다.');
                        e.srcElement.value = state.chkAccountCode1;
                    }else{
                        state.chkAccountCode1= value
                    }
                    item.account_code1 = e.srcElement.value
                }

                if(grid.columns[grid.editRange.col].binding ==="account_code2" ){ // country에 바인딩되어 있고 값에 e가 포함된 경우,
                    if(numChk.test(value)){
                        message.warning('숫자와 특수문자(/)만 입력 가능합니다.');
                        e.srcElement.value = state.chkAccountCode2;
                    }else{
                        state.chkAccountCode2= value
                    }
                    item.account_code2 = e.srcElement.value
                }

                dataChange(item)
            }
        },true);               

        grid.formatItem.addHandler((s, e) => {
            
            if(s.columns[e.col].binding === "approval_line"){
                // console.log("E")
                // console.log(e)
                // console.log("E.CELL")
                // // console.log(e.cell)
                // e.cell = () => (<div>Text_Div</div>)
                // grid.startEditing(true, e.row, e.col);
                // e.cell.innerHTML = '<input id="' + col.binding + '" type="checkbox" name= "'+item.id+'" value="'+item.product_use_yn+'" '+checked+' />';
                // e.cell['dataItem'] = item;
            }
            // console.log(s)
            // console.log(e)
           
        });
        // <wjInput.ComboBox
        // itemsSource={state.effectived_list} 
        // isAnimated={false} 
        // isDroppedDown={false}
        // placeholder="선택하세요."
        // selectedValue={stateData.effectivedListVal}
        // // selectedIndexChanged={handleChangeDate.bind(this,'effectived_list')}
        // selectedIndexChanged={handleChangeDate('effectived_list')}
        // />
    };

    const dataChange = (item)=>{        
        if(state.data.length > 0){
            var chk = true;
            state.data.map((e) => {     
                if(e.id === item.id){
                    e.billing_use_yn = item.billing_use_yn          
                    e.product_use_yn = item.product_use_yn          
                    e.department_use_yn = item.department_use_yn          
                    e.unitprice_use_yn = item.unitprice_use_yn          
                    e.account_code1 = item.account_code1          
                    e.account_code2 = item.account_code2   
                    chk =false      
                }
            })
            if(chk == true){
                state.data = [...state.data,{id :item.id, unitprice_use_yn : item.unitprice_use_yn, product_use_yn : item.product_use_yn,department_use_yn : item.department_use_yn,
                    account_code1 : item.account_code1,account_code2 : item.account_code2}]
            }
        }else{
            state.data =[{id :item.id, unitprice_use_yn : item.unitprice_use_yn, product_use_yn : item.product_use_yn,department_use_yn : item.department_use_yn,
                            account_code1 : item.account_code1,account_code2 : item.account_code2
                        }];
        }     

        console.log(toJS(state.data))
    }
    
    //등록
    const handleSubmit = useCallback(async (e)=> {        
        console.log(toJS(state.data));
        // console.log(toJS(state.data.length));
        // return;
        if(state.data.length > 0){
            var config={
                method:'POST',
                url:process.env.REACT_APP_API_URL +'/api/v1/billing-classification-list',
                headers:{
                    'Accept':'application/json',
                },
                    data:state.data
                };
                
            axios(config)
            .then(function(response){
                // console.log(response);
                if(response.data.success !== false){
                    Modal.success({
                        title: response.data.result,
                        onOk(){
                            fetchData();
                            state.data = [];
                        },
                    });
                }else{
                    Modal.error({
                        content:(<div>
                                    <p>등록시 문제가 발생하였습니다.</p>
                                    <p>재시도해주세요.</p>
                                    <p>오류코드: {response.data.error}</p>
                                </div>)
                    });  
                }
            })
            .catch(function(error){
                console.log(error.response);
                Modal.error({
                    title : '등록시 문제가 발생하였습니다.',
                    content : '오류코드:'+error.response.status
                });  
            });
        }else{
            Modal.warning({
                title: '등록할 데이터가 없습니다.',
            });  
        }
        
    }, []);         
    

    const testSelectBoxData = [
        ["0번째"], ["1번째"], ["2번째"], ["3번째"], ["4번째"], ["5번째"]
    ]

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["class1.name", "class2.name", "name", "account_code1", "account_code2", "product_use_yn", "department_use_yn", "unitprice_use_yn", "approval_line" ];
    };

    return (
        <Wrapper>
            <Row className="topTableInfo">
                <FlexGridSearch ref={theSearch} placeholder='검색' />
            </Row>
            <Row className="gridWrap">       
                <FlexGrid 
                    ref={theGrid}
                    itemsSource={state.list} 
                    stickyHeaders={true} 
                    allowMerging="ColumnHeaders" 
                    headersVisibility="Column"
                    initialized={initGrid}
                    alternatingRowStep={1} 
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                    <FlexGridColumn binding="class1.name" header="1차" width={200} isReadOnly={true} allowMerging={true}/>
                    <FlexGridColumn binding="class2.name" header="2차" width={180} isReadOnly={true} allowMerging={true} />
                    <FlexGridColumn binding="name" header="3차" width={'*'} minWidth={180} isReadOnly={true} allowMerging={true} />
                    <FlexGridColumn binding="account_code1" header="도서출판 길벗" width={120} format="n2" />
                    <FlexGridColumn binding="account_code2" header="길벗스쿨" width={120} format="n2" />
                    <FlexGridColumn binding="product_use_yn" header="상품 선택" width={100} align='center' format="n3"/>
                    <FlexGridColumn binding="department_use_yn" header="회사/부서 선택" width={120} align='center' format="n3"/>
                    <FlexGridColumn binding="unitprice_use_yn" header="단가 관리" width={100} align='center' format="n3"/>
                    <FlexGridColumn binding="approval_line" header="결재선 지정" width={100} align='center' allowMerging={false}
                        editor={new wjcInput.ComboBox(document.createElement('div'), {
                            itemsSource: testSelectBoxData
                        })}
                        />
                </FlexGrid>     
            </Row>

            <Row gutter={10} className="table table_bot">
                <Col xs={16} lg={16}>
                    <div className="btn-group">
                        <Pagination defaultCurrent={1} defaultPageSize={state.pageArr.pageCnt} current={state.pageArr.page} total={state.total} showSizeChanger={false} onChange={pageChange}/>
                        <span style={{marginLeft: 20}}>행 개수 : {state.total}</span>
                    </div>
                </Col>
                <Excel />
            </Row>

            <Row gutter={[10, 10]}  justify="center" style={{ marginTop: 20 }}>
                <Col>
                    <Button id="btn" type="primary" htmlType="button" onClick={()=>handleSubmit()}>확인</Button>
                </Col>
                <Col>
                    <Button htmlType="button" onClick={handleReset}>취소</Button>
                </Col>
            </Row>

        </Wrapper>
    );
});

export default billingClassCodeList;
