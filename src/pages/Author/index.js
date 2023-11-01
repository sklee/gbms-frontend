/* eslint-disable react-hooks/exhaustive-deps*/
import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
    useRef,
} from 'react';
import { Button, Row, Col, Modal,Pagination } from 'antd';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';

import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import * as wjCore from '@grapecity/wijmo';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";

import * as FlexLayout from 'flexlayout-react';
import '/node_modules/flexlayout-react/style/light.css';

import CommonView from './view';
import AddPrd from './Add';

import Popout from '@components/Common/popout/popout';
import Excel from '@components/Common/Excel';
import ProductView from '../Product/view';

// import Pagination from '@components/Common/Pagination';

// import NewWindow from 'react-new-window'

const Wrapper = styled.div`
    width: 100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
    #tplBtnViewMode {
        display: none;
    }
`;

const commonList = observer((props) => {
    const { commonStore } = useStore();

    //flexLayout
    var json = {
        global: {},
        borders: [],
        layout: {
            type: 'row',
            weight: 100,
            children: [
                {
                    type: 'tabset',
                    id: 'view-area',
                    weight: 100,
                    enableDeleteWhenEmpty: true,
                    children: [
                        {
                            type: 'tab',
                            name: 'tab',
                            id: 'init',
                            component: 'init',
                            enableDrag: false,
                        },
                    ],
                    active: true,
                },
            ],
        },
    };

    const state = useLocalStore(() => ({
        //flexLayout
        model: FlexLayout.Model.fromJson(json),
        tabLen: 1,
        tabInit: false,

        type: '',
        list: [],
        total: 0,
        idx: '',

        //엑셀
        excelData: '', //리스트 데이터
        column: '', //필터 컬럼

        //페이징
        pageArr: {
            pageCnt: 50, //리스트 총 갯수
            page: 1, //현재페이지
        },

        proVewIdx : '', //연결상품 id
        contractType:'' , //연결상품 contractType
        viewData : [], //연결상품 상세정보
        gridFilter: null,
    }));

    useEffect(() => {
        state.type = props.type;
        fetchData();
        theSearch.current.control.grid = theGrid.current.control;
        console.log(theSearch, theGrid);
    }, [props]);

    //페이징 데이터
    // const [pageArr, setPageArr] = useState([]);
    // const listReset = (val) => {
    //     fetchData(val);
    // };
    const pageChange = (num)=>{
        let FLEXLAYOUT = document.querySelectorAll(".flexlayout__tab");
        FLEXLAYOUT.forEach((item)=>{
            item.scrollTo(0, 0);
        })
        fetchData(num);
    }

    //현재 리스트  dom확인
    const tabRef = useRef();
    const theGrid = useRef();
    const theSearch = useRef();

    //리스트
    const fetchData = useCallback(async (val) => {
        if (state.type === 'brokersOverseas') {
            state.type = 'brokers';
        }
        if (val == '' || val == '0' || val == undefined) {
            var page = 1;
        } else {
            var page = val;
        }

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
                if(state.type == 'copyrights' ){
                    response.data.data.forEach((e) => {
                        if (e.type === '한국인' || e.type === '한국 거주 외국인' ) {
                            if(e.person_no !== '' && e.person_no !== undefined && e.person_no !== null){
                                e.person_no = e.person_no.substring(0,7)+'*******';
                            }else{
                                e.person_no = ''
                            }   
                           
                        }
                    });
                }                

                var result_page =
                    (page - 1) * state.pageArr.pageCnt;
                var str_no = response.data.meta.total - result_page;

                response.data.data.map((e, number) => {
                    e.cnt = str_no - number;
                });

                state.list = response.data.data;
                state.total = response.data.meta.total;
                state.pageArr.page = response.data.meta.current_page;
                state.pageArr.pageCnt = response.data.meta.per_page;
                console.log(state.total)
                // setPageArr({
                //     lastPage: response.data.meta.last_page,
                //     page: response.data.meta.current_page,
                //     total: response.data.meta.total,
                // });
            })
            .catch(function (error) {
                console.log(error)
                Modal.error({
                    title: '오류가 발생했습니다. 재시도해주세요.',
                    content: '오류코드:'+error.response.status,  
                });

            });
    }, []);

    //drawer
    const [viewAddVisible, setViewAddVisible] = useState(false);
    const [visible, setVisible] = useState(false);

    //add drawer open
    const showDrawer = () => {
        setViewAddVisible(true);
    };

    //view drawer open
    const viewChk = (idx) => {
        state.idx = idx;
        setVisible(true);
    };

    //view drawer 닫기
    const viewOnClose = () => {
        setVisible(false);
    };

    //add drawer 닫기
    const addOnClose = () => {
        setViewAddVisible(false);
    };

    //필터
    const initFilter = (filter) => {
        filter.filterColumns = ["name", "code", "company_no", "product_cnt", "registrant", "manager", "public_name", "regist_date", "regist_expiry", "country", "person_no", "type", "email", "latest_product", "latest_products", "product_expired"];
    };

    //위즈모 체크박스 선택
    const initGrid = (grid) => {
        //엑셀
        state.excelData = grid;
        if (state.column == '') {
            var columnData = JSON.parse(grid.columnLayout);
            state.column = columnData.columns;
        }

        //버튼 추가
        grid.formatItem.addHandler((s, e) => {
            if (e.panel == s.columnHeaders) {
                var html = e.cell.innerHTML;
                if(html.split('\\n').length > 1){
                    e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + ' ' + html.split('\\n')[1] + "<br/>" + html.split('\\n')[2] + '</div>';
                }else{
                    e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
                }
            }
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;
                // create buttons for items not being edited
                switch (col.binding) {
                    case 'name':
                        let name = '<button id="btnLink" class="btnLink title">' + item.name + '</button>';
                        e.cell.innerHTML ='<div class="incell">'+name +' ' +document.getElementById('tplBtnViewMode').innerHTML+'</div>';
                        e.cell['dataItem'] = item;
                        break;
                }
                switch (col.binding) {
                    case 'public_name':
                        let name ='<button id="btnLink" class="btnLink title">' + item.public_name +'</button>';
                        e.cell.innerHTML ='<div class="incell">'+name +' ' +document.getElementById('tplBtnViewMode').innerHTML+'</div>';
                        e.cell['dataItem'] = item;
                        break;
                }
                switch (col.binding) {
                    case 'latest_products':
                        if (item.latest_products.length > 0) {
                            var btn = '';
                            item.latest_products.forEach((e, num) => {
                                btn += '<button type="button" id="proBtn" class="'+e.id+'">'+e.name+'</button>'
                            });

                            e.cell.innerHTML = btn;
                            e.cell['dataItem'] = item;
                        }
                        break;
                }
                switch (col.binding) {
                    case 'latest_product':
                        if (item.latest_product.length > 0) {
                            var btn = '';
                            item.latest_product.forEach((e, num) => {
                                btn += '<button type="button" id="proBtn" class="'+e.id+'">'+e.name+'</button>'
                            });

                            e.cell.innerHTML = btn;
                            e.cell['dataItem'] = item;
                        }
                        break;
                }
            }
        });

        // handle button clicks
        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                // get button's data item
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                var name = item.name;
                // handle buttons
                state.idx = item.id;

                switch (e.target.id) {
                    // start editing this item
                    case 'btnLink':
                        viewChk(item.id);
                        break;
                    // remove this item from the collection
                    case 'btnDivide':
                        dividelayout(item.id, name);
                        break;
                    // remove this item from the collection
                    case 'btnNew':
                        //state.window = 'Y';
                        setPopoutOpen(true);
                        break;

                    case 'proBtn':
                        console.log(e)
                        productViewLink(e.target.className)
                        break;
                }
            }
        });
    };

    //flexlayout 분활
    const dividelayout = (item, tit) => {
        const btnEl = tabRef.current.classList;

        btnEl.forEach((e) => {
            if (e != 'divide') {
                tabRef.current.classList.add('divide');
            }
        });
        addTab(tit);
    };

    const addTab = (tit) => {
        state.tabLen++;
        var tabsetId;
        var tabidx;
        if (state.model.getActiveTabset() == undefined) {
            for (const [key, value] of Object.entries(state.model._idMap)) {
                if (value._attributes.type == 'tabset') {
                    tabsetId = value._attributes.id;
                    break;
                }
            }
        } else {
            tabsetId = state.model.getActiveTabset().getId();
        }
        state.model.doAction(
            FlexLayout.Actions.addNode(
                {
                    type: 'tab',
                    name: tit,
                    component: 'workspace',
                    //id : state.idx,
                    config: { idx: state.idx },
                },
                tabsetId,
                FlexLayout.DockLocation.CENTER,
                -1,
            ),
        );

        if (state.tabInit == false) {
            state.model.doAction(FlexLayout.Actions.deleteTab('init'));
            state.tabInit = true;
        }
    };

    const factory = (node) => {
        node.setEventListener('close', (p) => {
            state.tabLen--;
            if (state.tabLen == 0) {
                tabRef.current.classList.remove('divide');

                node.removeEventListener('close');
            }
        });

        var component = node.getComponent();
        //var tabIdx = node.getId();
        var tabIdx = node.getConfig();
        if (tabIdx) {
            tabIdx = tabIdx.idx;
        }

        if (component === 'workspace') {
            return (
                <CommonView
                    idx={tabIdx}
                    type={state.type}
                    popoutClose={gridEl}
                    popoutChk="N"
                />
            );
        }
    };

    const gridEl = () => {
        // state.tabLen--;
        // if(state.tabLen == 0){
        //     const gridEl = document.getElementById("gridWrap");
        //     gridEl.classList.remove('divide');
        // }
    };

    //팝업
    const [popout, setPopoutOpen] = useState(false);
    const closeWindowPortal = () => {
        setPopoutOpen(false);
    };

    //연결상품 보기수정
    const [productView, setProductView] = useState(false);
    const productViewLink=(idx)=>{
        state.proVewIdx = idx
        viewData()  
    }
    const proViewOnClose = () => {
        setProductView(false);
    };

    //연결상품 상세정보
    const viewData = useCallback(async (type,tit) => {    
    const result = await axios.get(
        process.env.REACT_APP_API_URL +'/api/v1/products/'+state.proVewIdx,
        {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        },
    )
        state.viewData = result.data.data;
        state.contractType =result.data.data.contract_type;
        setProductView(true);
    }) 


    return (
        <Wrapper>
            <Row className="topTableInfo" justify="space-around">
                <Col span={20}>
                    <FlexGridSearch ref={theSearch} placeholder='검색' />
                </Col>
                <Col span={4} className="topTable_right">
                    {/* <Button
                        className="btn-add btn-primary"
                        type="button"
                        onClick={showDrawer}
                    >
                        +<span className="hiddentxt">추가</span>
                    </Button> */}
                    <Button className="btn btn-primary btn_add" shape="circle" onClick={showDrawer}>+</Button>
                </Col>
            </Row>
            <Row id="gridWrap" className="gridWrap" ref={tabRef}>
                {state.type === 'copyrights' ? (
                    //국내/직계약 저작권자
                    <FlexGrid
                        ref={theGrid}
                        itemsSource={state.list}
                        isReadOnly={true}
                        stickyHeaders={true}
                        autoRowHeights={true}
                        headersVisibility="Column" 
                        initialized={(s) => initGrid(s)}
                        allowSorting={false}
                    >
                        <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                        {/* <FlexGridColumn
                            binding="cnt"
                            header="순번"
                            width={60}
                            align="center"
                            isReadOnly={true}
                        /> */}
                        <FlexGridColumn
                            binding="name"
                            header="성명/사업자명"
                            width={360} minWidth={200}
                        />
                        <FlexGridColumn
                            binding="person_no"
                            header="주민 / 외국인 /\n사업자번호"
                            width={150} 
                        />
                        <FlexGridColumn
                            binding="type"
                            header="유형"
                            width={130}
                        />
                        <FlexGridColumn
                            binding="email"
                            header="이메일"
                            width={180} 
                        />
                        <FlexGridColumn
                            binding="latest_products"
                            header="최근 기여자/저작권자 지정 상품"
                            width="*" minWidth={200}
                        />

                        {/* <FlexGridColumn binding="latest_product" header="Custom Button" width={150} cellTemplate={CellMaker.makeButton({
                        text: '<b>${item.latest_product}</b> Button',
                        click: (e, ctx) => alert('Clicked Button ** ' + ctx.item.country + ' **')
                    })}/> */}
                    </FlexGrid>
                ) : state.type === 'contributors' ? (
                    //기여자
                    <FlexGrid
                        ref={theGrid}
                        itemsSource={state.list}
                        isReadOnly={true}
                        stickyHeaders={true}
                        autoRowHeights={true}
                        headersVisibility="Column" 
                        initialized={(s) => initGrid(s)}
                        // style={{ minHeight: '700px' }}
                        allowSorting={false}
                    >
                        <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                        {/* <FlexGridColumn
                            binding="cnt"
                            header="순번"
                            width={60}
                            align="center"
                            isReadOnly={true}
                        /> */}
                        <FlexGridColumn
                            binding="name"
                            header="성명/사업자명(실명)"
                            width={360} minWidth={200} 
                        />
                        <FlexGridColumn
                            binding="public_name"
                            header="성명/사업자명(공개용)"
                            width={360} minWidth={200} 
                        />
                        <FlexGridColumn
                            binding="type"
                            header="유형"
                            width={100}
                        />
                        <FlexGridColumn
                            binding="email"
                            header="이메일"
                            width={180} 
                        />
                        <FlexGridColumn
                            binding="latest_product"
                            header="최근 기여자 지정 상품"
                            width="*" minWidth={200}
                        />
                    </FlexGrid>
                ) : state.type === 'owners' ? (
                    //해외 수입 권리자
                    <FlexGrid
                        ref={theGrid}
                        itemsSource={state.list}
                        isReadOnly={true}
                        stickyHeaders={true}
                        autoRowHeights={true}
                        headersVisibility="Column" 
                        initialized={(s) => initGrid(s)}
                        // style={{ minHeight: '700px' }}
                        allowSorting={false}
                    >
                        <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                        {/* <FlexGridColumn
                            binding="cnt"
                            header="순번"
                            width={60}
                            align="center"
                            isReadOnly={true}
                        /> */}
                        <FlexGridColumn
                            binding="name"
                            header="성명/사업자명"
                            width={360} minWidth={200} 
                        />
                        <FlexGridColumn
                            binding="type"
                            header="유형"
                            width={100}
                        />
                        <FlexGridColumn
                            binding="country"
                            header="국적"
                            width={120}
                        />
                        <FlexGridColumn
                            binding="latest_products"
                            header="최근 권리 지정 상품"
                            width="*" minWidth={300}
                        />
                    </FlexGrid>
                ) : state.type === 'brokers' ? (
                    //중개자
                    <FlexGrid
                        ref={theGrid}
                        itemsSource={state.list}
                        isReadOnly={true}
                        stickyHeaders={true}
                        autoRowHeights={true}
                        headersVisibility="Column" 
                        initialized={(s) => initGrid(s)}
                        // style={{ minHeight: '700px' }}
                        allowSorting={false}
                    >
                        <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                        {/* <FlexGridColumn
                            binding="cnt"
                            header="순번"
                            width={60}
                            align="center"
                        /> */}
                        <FlexGridColumn
                            binding="name"
                            header="성명/사업자명"
                            width="*" minWidth={300} 
                        />
                        <FlexGridColumn
                            binding="type"
                            header="유형"
                            width={100}
                        />
                        <FlexGridColumn
                            binding="company_no"
                            header="사업자등록번호"
                            width={140} 
                        />
                        <FlexGridColumn
                            binding="product_cnt"
                            header="중개자 지정 상품 수"
                            width={200}
                        />
                        <FlexGridColumn
                            binding="product_expired"
                            header="90일 내 만료 예정 상품 수"
                            width={200}
                        />
                    </FlexGrid>
                ) : (
                    //저작권 계약
                    <FlexGrid
                        ref={theGrid}
                        itemsSource={state.list}
                        isReadOnly={true}
                        stickyHeaders={true}
                        headersVisibility="Column" 
                        initialized={(s) => initGrid(s)}
                        autoRowHeights={true}
                        // style={{ minHeight: '700px' }}
                        allowSorting={false}
                    >
                        <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                        {/* <FlexGridColumn
                            binding="cnt"
                            header="순번"
                            width={60}
                            align="center"
                            isReadOnly={true}
                        /> */}
                        <FlexGridColumn
                            binding="code"
                            header="계약 코드"
                            width={100}
                        />
                        <FlexGridColumn
                            binding="name"
                            header="계약명"
                            width="*" minWidth={200} 
                        />
                        <FlexGridColumn
                            binding="type"
                            header="유형"
                            width={70}
                        />
                        <FlexGridColumn
                            binding="registrant"
                            header="등록자"
                            width={80}
                        />
                        <FlexGridColumn
                            binding="manager"
                            header="담당자"
                            width={100}
                        />
                        <FlexGridColumn
                            binding="regist_date"
                            header="계약 등록일"
                            width={100}
                        />
                        <FlexGridColumn
                            binding="regist_expiry"
                            header="30일내 계약 종료"
                            width={180}
                        />
                        <FlexGridColumn
                            binding="recent"
                            header="최근 등록 상품"
                            width="*" 
                            minWidth={200} 
                        />
                    </FlexGrid>
                )}

                <div className="panelWrap">
                    <FlexLayout.Layout
                        model={state.model}
                        factory={factory.bind(this)}
                    />
                </div>
            </Row>

            <div id="tplBtnViewMode">
                <div className="btnLayoutWrap">
                    {/* <button
                        id="btnDivide"
                        className="btn-layout ant-btn ant-btn-circle"
                    >
                        D
                    </button> */}
                    <button
                        id="btnNew"
                        className="btn-layout ant-btn ant-btn-circle"
                    >
                        N
                    </button>
                </div>
            </div>

            <Row gutter={10} className="table table_bot">
                {/* <Pagination
                    pageData={pageArr}
                    listReset={listReset}
                /> */}
                <Col xs={24} lg={16}>
                    <div className="btn-group">
                        <Pagination defaultCurrent={1} defaultPageSize={state.pageArr.pageCnt} current={state.pageArr.page} total={state.total} onChange={pageChange}/>
                        <span style={{marginLeft: 20}}>행 개수 : {state.total}</span>
                    </div>
                </Col>
                <Excel excelData={state.excelData} type={state.type} />
            </Row>

            {viewAddVisible === true && (
                <AddPrd
                    type={state.type}
                    visible={viewAddVisible}
                    onClose={addOnClose}
                    reset={fetchData}
                />
            )}

            {
                popout && (
                    <Popout closeWindowPortal={closeWindowPortal}>
                        {/* <CommonView
                            idx={state.idx}
                            type={state.type}
                            popoutClose={closeWindowPortal}
                            popoutChk="Y"
                        /> */}
                        <CommonView
                            idx={state.idx}
                            type={state.type}
                            popoutChk='Y'
                            drawerChk='N'
                            popoutClose={closeWindowPortal}
                        />
                    </Popout>
                )
            }

            {visible === true && (
                <CommonView
                    idx={state.idx}
                    type={state.type}
                    viewVisible={visible}
                    popoutChk='N'
                    drawerChk='Y'
                    viewOnClose={viewOnClose}
                />
            )}

            {productView === true && (
                <ProductView
                    idx={state.proVewIdx}
                    viewVisible={productView}
                    popoutChk='N'
                    drawerChk='Y'
                    viewOnClose={proViewOnClose}
                    viewData={state.viewData}
                    contractType={state.contractType}
                    pageChke = 'codeProcess'
                />

            )}
        </Wrapper>
    );
});

export default React.memo(commonList);
//export default commonList;
