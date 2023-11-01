/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect } from 'react';
import { Pagination, message, Button, Row, Col, Modal, Select } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { FlexGrid, FlexGridColumn  } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import { AutoComplete } from '@grapecity/wijmo.input';
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjcCore from "@grapecity/wijmo";
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';

import styled from 'styled-components';
import useStore from '@stores/useStore';
import Excel from '@components/Common/Excel';


const Wrapper = styled.div`
    width: 100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
`;

const accountsCodeList = observer(({tab}) => {
    const { commonStore } = useStore();
    
    const { Option } = Select;    
    const { confirm } = Modal;

    const state = useLocalStore(() => ({
        grid : '',
        data:[],
        list: [],
        oldData: [],
        bankOption:[],
        
        theGrid : React.createRef(),
        theSearch : React.createRef(),

        flexGrid : null,

        //페이징
        total: 0,
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },
        
    }));
    
    useEffect(() => { 
        state.tab = tab;
        if(tab == 'accountsCode'){
            viewData();
            bankData();
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
                state.list = state.oldData;
                state.data = [];
                viewData();
            },
            onCancel() {
              
            },
        });
        // return window.ask({
        //     title: `이 창의 입력 내용이 삭제됩니다.`,
        //     content: `그래도 계속 하시겠습니까?`,
        //         async onOk() {
        //             state.list = state.oldData;
        //             state.data = [];
        //             viewData();
        //         },
        //     });
    }, []);

    //은행
    const bankData = useCallback(async () => {
        var axios = require('axios');

        var config = {
            method: 'GET',
            url:process.env.REACT_APP_API_URL +'/api/v1/banks?bank_type_id=1&simple=Y',
            headers: {
                Accept: 'application/json',
            },
        };

        axios(config)
        .then(function (result) {
            console.log(result)
            if (result.data.success === false) {
                Modal.error({
                    title: '오류가 발생했습니다.',
                    content: '오류코드:' + result.data.message,
                });
            } else {                    
                state.bankOption = result.data.data;       
            }
        })
        .catch(function (error) {
            console.log(error);
            // console.log(error.response);
            // if(error.response !== undefined){
            //     Modal.error({
            //         title: '오류가 발생했습니다. 재시도해주세요.',
            //         content: '오류코드:' + error.response.status,
            //     });
            // }
            
        });
        
    }, []);

    //페이징
    const pageChange = (num)=>{
        let FLEXLAYOUT = document.querySelectorAll(".flexlayout__tab");
        FLEXLAYOUT.forEach((item)=>{
            item.scrollTo(0, 0);
        })
        viewData(num);
    }
    const onShowSizeChange = (current, pageSize) => {
        state.pageArr.pageCnt = pageSize;
        viewData(current);
    };

    //상세정보
    const viewData = useCallback(async (val) => {    
        
        if (val == '' || val == '0' || val == undefined) {
            var page = 1;
        } else {
            var page = val;
        }
    
        var axios = require('axios');

        var config = {
            method: 'GET',
            url:process.env.REACT_APP_API_URL +'/api/v1/user-accounts?display='+state.pageArr.pageCnt+'&page='+page +'&sort_by=date&order=desc',
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
                    var result_page = (page - 1) * state.pageArr.pageCnt;
                    var str_no = result.data.meta.total - result_page;

                    result.data.data.map((e, number) => {
                        e.cnt = str_no - number;
                    });
                    state.list = result.data.data;
                    state.oldData = result.data.data;

                    state.total = result.data.meta.total;
                    state.pageArr.page = result.data.meta.current_page;
                    state.pageArr.pageCnt = result.data.meta.per_page;

                }
            })
            .catch(function (error) {
                console.log(error.response);
                // Modal.error({
                //     title: '오류가 발생했습니다. 재시도해주세요.',
                //     content: '오류코드:' + error.response.status,
                // });
            });
        
    }, []);


    const initGrid = (grid) => {  
        state.grid =grid;

        // 한번 클릭시 수정
        grid.selectionChanged.addHandler(function (s, e) {
            grid.startEditing(true, e.row, e.col);
        });

        //header 합치기
        grid.rowHeaders.columns.splice(0, 1); // no extra columns
        
        var extraRow = new wjGrid.Row();
        extraRow.allowMerging = true;

        var panel = grid.columnHeaders;
        panel.rows.splice(0, 0, extraRow);

        for (let colIndex = 0; colIndex <= 7; colIndex++) {
            if(colIndex >= 3 && colIndex <= 4  ){
                panel.setCellData(0, colIndex, '급여 계좌');
            }else if(colIndex >= 5 && colIndex <= 6){
                panel.setCellData(0, colIndex, '개인 비용 계좌');
            }else{
                let col = grid.getColumn(colIndex);
                col.allowMerging = true;
                panel.setCellData(0, colIndex, col.header);
            }            
        }      

        grid.autoGenerateColumns = false;
        grid.itemsSource = state.list;


        //dataItem 추가
        grid.formatItem.addHandler((s, e) => {
            if (e.panel == s.columnHeaders) {
                let html = e.cell.innerHTML;
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + "<br/>" + html.split('\\n')[1] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }

            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;

                // create buttons for items not being edited
                switch (col.binding) {     
                    case 'user_account.bank_id1':
                        e.cell['dataItem'] = item;
                        break;
                    case 'user_account.bank_id2':
                        e.cell['dataItem'] = item;
                        break;

                    case 'user_account.account_no1':
                        e.cell['dataItem'] = item;
                        break;

                    case 'user_account.account_no2':
                        e.cell['dataItem'] = item;
                        break;

                    case 'user_account.account_code':
                        if(item.user_account.account_code !== '' && item.user_account.account_code !== undefined){
                            e.cell.innerHTML = item.user_account.account_code;
                        }else{
                            e.cell.innerHTML = '';    
                        }                        
                        e.cell['dataItem'] = item;
                        break;
                }
            }
        });

        // grid.hostElement.addEventListener("click",function(e){
        //     grid.finishEditing(true);
        // })

        grid.cells.hostElement.addEventListener('keyup',(e)=>{
            let item = wjcCore.closest(e.target, '.wj-cell')['dataItem'];

            if(item.user_account === null || item.user_account === undefined){
                item.user_account ={user_account_id : 0, use_yn : 'Y', bank_id1:'', account_no1:'', bank_id2:'', account_no2:''};
            }
            
            if(grid.activeEditor){
                var value=grid.activeEditor.value;
                var numChk = /[^\-0-9]/g;
                
                if(grid.columns[grid.editRange.col].binding ==="user_account.account_no1" ){ // country에 바인딩되어 있고 값에 e가 포함된 경우,
                    if(numChk.test(value)){
                        message.warning('숫자와 특수문자(-)만 입력 가능합니다.');
                        // e.srcElement.value = value.replace('/[^\-0-9]/g', '');
                        e.srcElement.value = '';
                    }else{
                        if(value.length > 20){
                            // message.warning('20자리까지 입력가능합니다.');
                            e.srcElement.value = value.substring(0,20)
                        }else{
                            e.srcElement.value = value;
                        }
                    }
                    item.user_account.account_no1 = e.srcElement.value
                }

                if(grid.columns[grid.editRange.col].binding ==="user_account.account_no2" ){ // country에 바인딩되어 있고 값에 e가 포함된 경우,
                    if(numChk.test(value)){
                        message.warning('숫자와 특수문자(-)만 입력 가능합니다.');
                        // e.srcElement.value = value.replace('/[^\-0-9]/g', '');
                        e.srcElement.value = '';
                    }else{
                        if(value.length > 20){
                            // message.warning('20자리까지 입력가능합니다.');
                            e.srcElement.value = value.substring(0,20)
                        }else{
                            e.srcElement.value = value;
                        }
                        
                    }
                    item.user_account['account_no2'] = e.srcElement.value
                }

                dataChange(item)
            }
        },true);            
           
    };

     //콤보박스일 경우
     const selectChanged = (s,type)=>{       
        if(s.selectedValue !== null && s.selectedValue !== undefined){
            state.grid.selectedItems.forEach((e)=>{
                if(e.user_account === null || e.user_account === undefined){
                    e.user_account ={user_account_id : 0, use_yn : 'Y', bank_id1:'', account_no1:'', bank_id2:'', account_no2:''};
                }
                    
                e.user_account[type] = s.selectedValue;            
            })          
            dataChange(state.grid.selectedItems[0])
        } 
    }

    const dataChange = (item)=>{
        state.oldData.map((e) => {     
            var chk = 0;          
            if(e.user_id === item.user_id){
                //기존 데이터에 값이 없었을 경우 추가
                if(e.user_account!== '' && e.user_account !== null &&  e.user_account !== undefined){
                    if(e.user_account.bank_id1 !== '' && e.user_account.account_no1 !== '' ){
                        item.user_account.depositor1 = '수정'
                        chk++;
                    }

                    if(e.user_account.bank_id2 !== '' && e.user_account.account_no2 !== ''){
                        item.user_account.depositor2 ='수정'
                        chk++;
                    }
                }else{
                    if(item.user_account.bank_id1 !== '' && item.user_account.account_no1 !== '' ){
                        item.user_account.depositor1 = '추가'
                    }

                    if(item.user_account.bank_id2 !== '' && item.user_account.account_no2 !== ''){
                        item.user_account.depositor2 ='추가'
                    }
                }

                if(chk > 0){
                    item.user_account.user_account_id = e.user_account.user_account_id
                    item.user_account.use_yn = e.user_account.use_yn                    
                }else{
                    item.user_account.user_account_id = 0
                    item.user_account.use_yn ='Y'
                }
                
                
            }
        })

        var arr = [];
        //배열 재정렬 ( 추가일 경우 id : 0, 수정일 경우 id:user_account.user_account_id *api참고)           
        arr = {
            id: item.user_account.user_account_id, 
            user_id: item.user_id, 
            bank_id1: item.user_account.bank_id1, 
            account_no1: item.user_account.account_no1,
            depositor1: item.user_account.depositor1,
            bank_id2: item.user_account.bank_id2,
            account_no2: item.user_account.account_no2,
            depositor2: item.user_account.depositor2,
            use_yn: item.user_account.use_yn 
        }

       
        if(state.data.length >0){
            var chk = true
            state.data.forEach((e) => {                        
                //기존 배열에 들어간 user_id와 같으면 값 수정
                if(e.user_id === arr.user_id){
                    e.bank_id1= arr.bank_id1
                    e.account_no1= arr.account_no1
                    e.depositor1 = arr.depositor1
                    e.bank_id2= arr.bank_id2
                    e.account_no2= arr.account_no2
                    e.depositor2 = arr.depositor2
                    e.id = arr.id
                    chk = false
                }
            })

            if(chk === true){
                state.data = [...state.data, arr];
            }
            
        }else{                    
            state.data = [...state.data,arr]                
        }

        console.log(toJS(state.data))
    }


    //등록
    const handleSubmit = useCallback(async (e)=> {        
        // console.log(toJS(state.data));
        // return;
        if(state.data.length > 0){
            var axios = require('axios');

            var config={
                method:'POST',
                url:process.env.REACT_APP_API_URL +'/api/v1/user-accounts/',
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
                            state.oldData = state.list;
                            state.data = [];
                            viewData();
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
                console.log(error.response.status);
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

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["name", "department", "work_state", "user_account.bank_id1", "user_account.account_no1", "user_account.bank_id2", "user_account.account_no2", "user_account.account_code" ];
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
                    initialized={(s) => initGrid(s)}
                    allowMerging="ColumnHeaders"
                    selectionMode ="ListBox"
                    alternatingRowStep={1}
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                    {/* <FlexGridColumn binding="cnt" header="순번" width={70} align="center" isReadOnly={true}  allowMerging={true}/> */}
                    <FlexGridColumn binding="name" header="이름" width={90} isReadOnly={true} allowMerging={true}/>
                    <FlexGridColumn binding="department" header="부서" width={120} isReadOnly={true} allowMerging={true}/>
                    <FlexGridColumn binding="work_state" header="근무\n상태" width={60} isReadOnly={true} allowMerging={true}/>
                    <FlexGridColumn binding="user_account.bank_id1" header="은행" width={'*'} minWidth={130}
                        dataMap={new wjGrid.DataMap(state.bankOption, 'id', 'name')}                        
                        editor={new AutoComplete(document.createElement('div'), {
                            itemsSource :state.bankOption,
                            selectedValuePath: 'id',
                            displayMemberPath: 'name',
                            placeholder:'선택해주세요.',
                            selectedIndexChanged  : (s,e) => {selectChanged(s,'bank_id1')}   
                        })}
                        // cssMatch="border"
                    />
                    <FlexGridColumn binding="user_account.account_no1" header="계좌번호"  width='*'  minWidth={130} />
                    
                    <FlexGridColumn binding="user_account.bank_id2" header="은행"  width='*'  minWidth={200} 
                        dataMap={new wjGrid.DataMap(state.bankOption, 'id', 'name')}
                        editor={new AutoComplete(document.createElement('div'), {
                            itemsSource :state.bankOption,
                            selectedValuePath: 'id',
                            displayMemberPath: 'name',
                            placeholder:'선택해주세요.',
                            selectedIndexChanged  : (s,e) => {selectChanged(s,'bank_id2')}   
                        })}
                    />
                    <FlexGridColumn binding="user_account.account_no2" header="계좌번호"  width='*'  minWidth={200}/>
                    <FlexGridColumn binding="user_account.account_code" header="거래처 코드\n(회계)" width={120} />
                </FlexGrid>     
            </Row>

            <Row gutter={10} className="table table_bot">
                <Col xs={16} lg={16}>
                    <div className="btn-group">
                        {/* <Pagination defaultCurrent={1} defaultPageSize={state.pageArr.pageCnt} current={state.pageArr.page} total={state.total} onShowSizeChange={onShowSizeChange} onChange={pageChange}/> */}
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

export default accountsCodeList;
