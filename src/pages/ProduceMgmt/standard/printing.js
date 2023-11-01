/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pagination, Button, Row, Col, Modal, Select, DatePicker,Checkbox, Input, Space} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';
import moment from 'moment';

import '@grapecity/wijmo.touch'; // support drag/drop on touch devices
import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { CollectionView } from '@grapecity/wijmo';
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjCore from '@grapecity/wijmo';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";

import Excel from '@components/Common/Excel';
import '/node_modules/flexlayout-react/style/light.css';


const Wrapper = styled.div`
    width: 100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
    #tplBtnViewMode, #tplBtnEditMode {display:none}
`;
const DEF_STATE = {
    // DB Data
    id:"",
    apply_date:"",
    fixed_royalties: [{
        qty:0,
        end_yn:'',
        price:''
    }],
};
const DEF_ROYALTY = {
    qty:'',
    end_yn:'',
    price:''
};

const printingSimList = observer(({tab}) => {
    const { commonStore } = useStore();
    const { Option } = Select;    
    const { confirm } = Modal;

    const stateData = useLocalStore(() => ({...DEF_STATE})); 
    const state = useLocalStore(() => ({
        type : 'simulation-printing',
        list: [],
        selPriceInfo:[],
        historyList:[],

        data:[],

        today: moment().format('YYYY-MM-DD'),

        addBtn : true,              //추가버튼 활성화          
        currentEditItem : null,     //row data
        sel:'',
        flex:'',
        prInp:false,
        gridFilter: null,
        total: 0,

        //페이징
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },
        dateItemName: [{id: 1, name: '적용일'}],
    }));    
    
    useEffect(() => { 
        viewData();
        theSearch.current.control.grid = theGrid.current.control;
    }, []);

    const theGrid = React.useRef();
    const theSearch = React.useRef();

    //리스트
    const viewData = useCallback(async (val) => {
        if (val == '' || val == '0' || val == undefined) var page = 1;
        else var page = val;
        var axios = require('axios');

        var config = {
            method: 'GET',
            url:
                process.env.REACT_APP_API_URL +'/api/v1/' +
                state.type +
                '?display=' +
                state.pageArr.pageCnt +
                '&page=' +
                page +
                '&sort_by=date&order=desc',
            headers: {
                Accept: 'application/json',
            },
        };

        axios(config)
            .then(function (response) {
                state.list = response.data.data;
                state.total = response.data.meta.total;
                state.pageArr.page = response.data.meta.current_page;
                state.pageArr.pageCnt = response.data.meta.per_page;
            })
            .catch(function (error) {
                console.log(error.response);
                if (error.response?.status === 401) {
                    Modal.warning({
                        title: (
                            <div>
                                세션이 만료되었습니다.
                                <br />
                                재로그인을 해주세요.
                            </div>
                        ),
                        onOk() {
                            axios.post(
                                process.env.PUBLIC_URL +
                                    '/member/session_logout',
                            );
                            window.location.href =
                                process.env.PUBLIC_URL + '/Login';
                            window.localStorage.clear();
                        },
                    });
                } else {
                    //console.log(error.response)
                }
            });
    }, []);

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["produce_company", "print_unit", "paper_standard", "frequency", "price", "apply_price", "apply_date", "buttons"];
    };

    const initGrid = (grid) => {    
        state.flex= grid;

        // let extraRow = new wjGrid.Row();
        // extraRow.allowMerging = true;
        // var panel = grid.columnHeaders;
        // panel.rows.splice(0, 0, extraRow);

        // state.sel = new Selector(grid, {})
        // state.sel._col.allowMerging = true;

        // for (let colIndex = 0; colIndex <= 12; colIndex++) {
        //     if(colIndex >= 4 && colIndex <= 8){ 
        //         panel.setCellData(0, colIndex, '1대당 종이 여분 매수');
        //     } else {
        //         let col = grid.getColumn(colIndex);
        //         col.allowMerging = true;
        //         panel.setCellData(0, colIndex, col.header);
        //     }            
        // }
           
        grid.formatItem.addHandler(function (s, e) {
            if(e.panel._ct == 4){
                e.cell.innerHTML = '<div class="v-center">순서</div>';
            }

            if(e.panel == s.rowHeaders){
                e.cell.innerHTML = e.row + 1;
            }

            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
                let col = s.columns[e.col];
                if(col.binding == 'chk'){
                    e.cell.classList.add("headCenter")
                }else{
                    if(html.split('\\n').length > 1){
                        e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + ' ' + html.split('\\n')[1] + "<br/>" + html.split('\\n')[2] + '</div>';
                    }else{
                        e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                    }
                }
            }
            
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                // create buttons for items not being edited
                switch (col.binding) {
                    case 'paper_standard':
                        var inhtml = '';
                        if(item.paper_standard){
                            inhtml = item.paper_standard.name;
                        }

                        e.cell.innerHTML = inhtml;
                        break;
                    case 'frequency':
                        var inhtml = '';
                        const {cmyk1,cmyk2,cmyk3,cmyk4} = item;
                        var temp = [];
                        if(cmyk1 == 'Y'){
                            temp = [...temp, '1도'];
                        }
                        if(cmyk2 == 'Y'){
                            temp = [...temp, '2도'];
                        }
                        if(cmyk3 == 'Y'){
                            temp = [...temp, '3도'];
                        }
                        if(cmyk4 == 'Y'){
                            temp = [...temp, '4도'];
                        }

                        inhtml = temp.join(', ');

                        e.cell.innerHTML = inhtml;
                        break;
                    case 'price':
                        var data = item.price,
                            inhtml = '';
                        for (let index = 0; index < data.length; index++) {
                            const obj = data[index];
                            if(index === 0){
                                inhtml +='<div>1 ~ ' + obj.qty + ' : ' + commaNum(obj.price) + ' 원</div>';
                            }else if(index == data.length-1){
                                inhtml +='<div>' + data[index-1].qty + ' ~ 끝까지 : ' + commaNum(obj.price) + ' 원 </div>';
                            }else{
                                inhtml +='<div>' + data[index-1].qty + ' ~ ' + obj.qty + ' : ' + commaNum(obj.price) + ' 원</div>';
                            }
                        }
                        e.cell.innerHTML = inhtml;
                        break;
                    case 'apply_price':
                        var data = item.apply_price,
                            inhtml = '';
                        for (let index = 0; index < data.length; index++) {
                            const obj = data[index];
                            if(index === 0){
                                inhtml +='<div>1 ~ ' + obj.qty + ' : <button class="btnText title btnRed btn_price">' + commaNum(obj.price) +' 원</button></div>';
                            }else if(index == data.length-1){
                                inhtml +='<div>' + data[index-1].qty + ' ~ 끝까지 : <button class="btnText title btnRed btn_price">' + commaNum(obj.price) + ' 원</button></div>';
                            }else{
                                inhtml +='<div>'+ data[index-1].qty +' ~ ' + obj.qty + ' : <button class="btnText title btnRed btn_price">' + commaNum(obj.price) +' 원</button></div>';
                            }
                        }
                        e.cell.innerHTML = inhtml;
                        e.cell['dataItem'] = item;
                        break;
                    case 'buttons':
                        let btn = '<button class="btnText btn_modify blueTxt">수정</button>';
                        e.cell.innerHTML = btn;
                        e.cell['dataItem'] = item;
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                // get button's data item
                if(e.target.classList.contains('btn_price')){
                    modalOpen('history',wjCore.closest(e.target, '.wj-cell')['dataItem']);
                }
                if(e.target.classList.contains('btn_modify')){
                    let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                    console.log('mod open',toJS(item));
                    modalOpen('modify',wjCore.closest(e.target, '.wj-cell')['dataItem']);
                }
               
            }
        });
        grid.autoGenerateColumns = false;
        grid.itemsSource = state.list;
        grid.selectionMode = 0;
        grid.virtualizationThreshold = 20;
    };

    const initHistoryGrid = (grid) => {    
        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                switch (col.binding) {
                    case 'price':
                        var data = item.price,
                            inhtml = '';
                        for (let index = 0; index < data.length; index++) {
                            const obj = data[index];
                            if(index == 0){
                                inhtml +='<div> 1 ~ '+obj.qty+' : '+ commaNum(obj.price) +' 원 </div>';
                            }else if(index ==data.length-1){
                                inhtml +='<div> '+data[index-1].qty+' ~ 끝까지 : '+commaNum(obj.price)+' 원 </div>';
                            }else{
                                inhtml +='<div> '+data[index-1].qty+' ~ '+obj.qty+' : '+commaNum(obj.price)+' 원 </div>';
                            }
                        }
                        e.cell.innerHTML = inhtml;
                        break;
                }
            }
        });
        grid.collectionView.refresh();
    };

    const [modalPriceModify, setModalPriceModify] = useState(false);
    const [modalPriceHistory, setModalPriceHistory] = useState(false);
    const modalClose= (obj)=> {
        if(obj == 'history'){
            setModalPriceHistory(false);
        }
        if(obj == 'modify'){
            state.prInp=false;
            setModalPriceModify(false);
        }
    }

    const modifyOk= (obj,e)=> {
        if(obj == 'modify'){
            var valid = stateData.fixed_royalties;
            var validate = true;
            var msg = "";
            if(stateData.apply_date =="" || stateData.apply_date == null){
                msg = "적용일을 입력하세요.";
                validate = false;
            }else if(valid[valid.length-1].end_yn != 'Y'){
                msg  = '부수 범위의 끝까지 항목을 체크해주세요.';
                validate = false;
            }

            if(validate!==true){
                Modal.error({
                    content: msg,        
                });
                return false;
            }

            var loopchk = false;
            valid.forEach((item) => {
                if(item.qty ==='' && item.end_yn != 'Y'){
                    msg  = '부수 범위를 공란없이 입력해주세요.';
                    loopchk = true;
                }
                if(item.price === ''){
                    msg  = '단가를 공란없이 입력해주세요.';
                    loopchk = true;
                }
            });
            if(loopchk!==false){
                Modal.error({
                    content: msg,
                });
                return false;
            }

            var temp_prices = {}
            temp_prices['id'] = stateData.id;
            temp_prices['prices']={
                apply_date : stateData.apply_date,
                price_sub : stateData.fixed_royalties
            }

            state.data = [...state.data, toJS(temp_prices)];

            stateData.id = "";
            stateData.apply_date = "";
            stateData.fixed_royalties = [DEF_ROYALTY];

            //modalclose
            setModalPriceModify(false);
        }
        if(obj == 'history'){
            setModalPriceHistory(false);
        }
    }

    const modalOpen = (obj,item) => {
        if(obj == 'history'){
            var temp_history = [];
            toJS(item.apply_prices).map(e=>{
                temp_history = [...temp_history,{price:e.apply_price_sub,apply_date:e.apply_date,worker:e.created_info?.name}];
            })
            state.historyList = temp_history;
            setModalPriceHistory(true);
        }
        if(obj == 'ipt'){
            state.prInp=true;
            stateData.apply_date = moment().add(1,'M').startOf('month');
            stateData.fixed_royalties = [DEF_ROYALTY];
            setModalPriceModify(true);
        }
        if(obj == 'modify'){
            state.prInp=false;
            // stateData.apply_date = state.flex.hostElement.querySelector('#apply_date').value!=""?moment(state.flex.hostElement.querySelector('#apply_date').value):moment().add(1,'M').startOf('month');
            // if(item.price && item.price.length > 0){
            //     stateData.fixed_royalties = toJS(tempData.fixed_royalties);
            // }
            stateData.id = item.id;
            stateData.apply_date = item.apply_date?moment(item.apply_date):moment().add(1,'M').startOf('month');
            stateData.fixed_royalties = item.apply_price;

            setModalPriceModify(true);
        }
    }

    const handlePriceInput = (type) => (e) => {
        if(type === "apply_date"){
            stateData[type] = e; 
        }else if(type === "price"){
            if(e.target.value){
                var regnum = Number(Math.round(e.target.value + "e+2")  + "e-2");
                stateData[type] = regnum;
            }else{
                stateData[type] = e.target.value;
            }
        }else{
            stateData[type] = e.target.value;
        }
    }

    const handleChangeRoyalty = useCallback(
        (idx,type) => (e) => {
            if(type === 'end_yn'){
                stateData['fixed_royalties'][idx][type] = e.target.checked ? 'Y' : 'N';
                if(e.target.checked){
                    stateData['fixed_royalties'] = toJS(stateData['fixed_royalties']).filter((item,index) => index <= idx);
                }
            }else{
                stateData['fixed_royalties'][idx][type] = e.target.value;
            }
        },[],
    );
    const handleInputRoyalty = useCallback(
        () => (e) => {
            stateData['fixed_royalties'] = [...toJS(stateData['fixed_royalties']),DEF_ROYALTY];
        },[],
    );
    const handleDeleteRoyalty = useCallback(
        (idx) => (e) => {
            stateData['fixed_royalties'].filter((item) => item.id !== idx);
        },[],
    );

    const handleReset = useCallback(() => {
        return confirm({
            title: `이 창의 입력 내용이 삭제됩니다.`,
            content: `그래도 계속 하시겠습니까?`,
                async onOk() {
                    viewData();
                    state.data = [];
                },
            });
    }, []);

    //등록
    const handleSubmit = useCallback(async (e)=> {      
        
        
        var data =[];
        data = state.data;

        // console.log('submit',toJS(data));
        console.log('submit',JSON.stringify(toJS(data)[0]));
        // return false;

        if(state.data.length > 0){
            var axios = require('axios');

            var config={
                method:'POST',
                url:process.env.REACT_APP_API_URL +'/api/v1/'+state.type,
                headers:{
                    'Accept':'application/json',
                },
                    data:data[0]
                };
                
            axios(config)
            .then(function(response){
                if(response.data.success !== false){
                    Modal.success({
                        title: response.data.result,
                        onOk(){
                            viewData();
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

    // 천단위 자동 콤마
    const commaNum = (num) => {
        if(num){
            const number = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return number
        }else{
            return 0;
        }      
    }

    return (
        <Wrapper>
            <Row className="topTableInfo" >
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
                {/* <Col span={24} className="topTable_right">
                    <Button
                        type='primary'
                        onClick={(e) => {modalOpen('modify')}}
                    >
                        적용 단가 일괄수정
                    </Button>
                </Col> */}
            </Row>

            <Row className="gridWrap">       
                <FlexGrid 
                    ref={theGrid}
                    itemsSource={state.list} 
                    stickyHeaders={true} 
                    initialized={(s) => initGrid(s)}
                    allowSorting={false}
                    allowMerging="ColumnHeaders"
                    selectionMode="None"
                    allowDragging="Both"
                    newRowAtTop={true}
                    autoRowHeights={true}
                >
                    <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                    <FlexGridColumn binding="produce_company" header="제작처" width={'*'} minWidth={200} />
                    <FlexGridColumn binding="print_unit" header="인쇄단가\n적용" width={100} />
                    <FlexGridColumn binding="paper_standard" header="종이\n규격" width={120} />
                    <FlexGridColumn binding="frequency" header="인쇄\n도수" width={140} />
                    {/* <FlexGridColumn binding="cmyk0" header="0도" width={65} align="right" />
                    <FlexGridColumn binding="cmyk1" header="1도" width={65} align="right" />
                    <FlexGridColumn binding="cmyk2" header="2도" width={65} align="right" />
                    <FlexGridColumn binding="cmyk3" header="3도" width={65} align="right" />
                    <FlexGridColumn binding="cmyk4" header="4도" width={65} align="right" /> */}
                    <FlexGridColumn binding="price" header="실제 부수 범위와 단가" width={200} />
                    <FlexGridColumn binding="apply_price" header="적용 부수 범위와 단가" width={200} />
                    <FlexGridColumn binding="apply_date" header="적용일" width={100} />
                    <FlexGridColumn binding="buttons" header="작업" width={100} align="center" />
                </FlexGrid>     
            </Row>

            <Row gutter={10} className="table table_bot">
                <Col xs={16} lg={16}>
                    <div className="btn-group">
                        <Pagination defaultCurrent={1} defaultPageSize={state.pageArr.pageCnt} current={state.pageArr.page} total={state.total} showSizeChanger={false}/>
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

            <Modal 
                title={state.prInp===true ? "단가 입력" : "단가 수정" } 
                visible={modalPriceModify} 
                onCancel={(e) => {modalClose('modify')}}
                footer={
                    [
                    <Button key="back" onClick={(e) => modalClose('modify')}>취소</Button>,
                    <Button key="submit" type="primary" onClick={(e) => modifyOk('modify')}>확인</Button>,
                    state.prInp===false && <Button key="printingNew" onClick={(e) => {modalClose('modify');modalOpen('ipt');}} >새로 입력</Button>,
                    ]
                }
            >
                <Row gutter={10} className="table">
                    <Col xs={24} lg={8} className="label">
                        적용일 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={16}>
                        <DatePicker name="apply_date" onChange={handlePriceInput('apply_date')} value={stateData.apply_date}/>
                    </Col> 
                    <Col xs={24} lg={24} className="label">
                        부수 범위와 단가 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={24}>
                        {state.prInp === true 
                            ?
                            <>
                            {stateData.fixed_royalties.map((item,index) => (
                                <Space>
                                    {index==0 ? 1 : (stateData.fixed_royalties[index-1].qty !== '' ? (parseInt(stateData.fixed_royalties[index-1].qty)+1) : 'n')}부 ~ 
                                    <Input type="number" min="0" name="qty" value={item.index} onChange={handleChangeRoyalty(index,'qty')} autoComplete="off" style={{width:'80px'}} />부 또는 
                                    <Checkbox defaultChecked={false} name="end_yn" onChange={handleChangeRoyalty(index,'end_yn')}/> 끝까지 : 
                                    <Input type="number" min="0" name="price" value={item.price} onChange={handleChangeRoyalty(index,'price')} autoComplete="off" style={{width:'100px'}} /> 원
                                    {stateData.fixed_royalties.length == index+1 && item.end_yn !== 'Y' &&
                                    <Button
                                        shape="circle"
                                        icon={
                                            <PlusOutlined
                                                style={{ fontSize: '11px' }}
                                            />
                                        }
                                        size="small"
                                        onClick={handleInputRoyalty()}
                                        style={{ marginLeft: '5px' }}
                                    />
                                    }
                                </Space>
                            ))}
                            </>
                            :
                            <>
                            {stateData.fixed_royalties.map((item,index) => (
                                <Row>
                                    <>
                                    <Col xs={24} lg={8} align={'right'} style={{paddingRight:'10px'}}>
                                    {index==0 ? 1 : (stateData.fixed_royalties[index-1].qty !== '' ? (parseInt(stateData.fixed_royalties[index-1].qty)+1) : 'n')}부 ~ 
                                    {index === stateData.fixed_royalties.length-1 ? "끝까지" : item.qty+" 부" } :  
                                    </Col>
                                    <Col xs={24} lg={16} style={{padding:'2px 5px'}}>
                                    <Input type="number" min="0" name="price" value={item.price} onChange={handleChangeRoyalty(index,'price')} autoComplete="off" style={{width:'100px'}} /> 원
                                    </Col>
                                    </>
                                </Row>
                                ))} 
                            </>
                        }
                        
                    </Col> 
                </Row>
            </Modal>

            <Modal title="단가 변경 이력" visible={modalPriceHistory} onCancel={(e) => {modalClose('history')}} footer={null}>
                <FlexGrid 
                    itemsSource={state.historyList} 
                    initialized={(s) => initHistoryGrid(s)}
                    headersVisibility="Column"
                    autoRowHeights={true}
                >
                    <FlexGridColumn binding="price" header="부수 범위와 단가" width={'*'} />
                    <FlexGridColumn binding="apply_date" header="단가 적용일" width={120} />
                    <FlexGridColumn binding="worker" header="작업자" width={120} />
                </FlexGrid>
            </Modal>

        </Wrapper>
    );
});

export default printingSimList;
