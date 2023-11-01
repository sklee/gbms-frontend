/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect,useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Breadcrumb, Form, Row, Col, Input, Space , Tabs, Radio, Button, Checkbox, Modal, Drawer,Dropdown,Menu,Select,DatePicker } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import { toJS } from 'mobx';
import moment from 'moment';

import useStore from '@stores/useStore';

import { FlexGrid,FlexGridColumn  } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { FlexGridFilter } from "@grapecity/wijmo.react.grid.filter";
import { Selector } from "@grapecity/wijmo.grid.selector";

import * as wjCore from '@grapecity/wijmo';
import { CellMaker } from "@grapecity/wijmo.grid.cellmaker";

import * as FlexLayout from "flexlayout-react";
import "/node_modules/flexlayout-react/style/light.css";

import {
    VerticalRightOutlined,
    LeftOutlined,
    RightOutlined,
    VerticalLeftOutlined,
    SearchOutlined,
    CalendarOutlined,
    SettingOutlined,
  } from '@ant-design/icons';

import AddDrawer from './addDrawer';
import IdAddDrawer from './idAddDrawer';

const Wrapper = styled.div`
    width: 100%;
`;

const { Option } = Select;

const Adm_authority = observer(() => {
    const { commonStore } = useStore();
    const state = useLocalStore(() => ({
        list: [],

        theGrid : React.createRef(),
        theSearch : React.createRef(),

        selectedRowKeys : [],
        selectedRows : [],
        selector: null,
        selectedItems: [], 
        idAddChk: '', 
        viewIdx: '', 
        total: '', 
        modelKey: '', 
        dateType: '', 
        startDate: moment().subtract(30, 'd'), 
        endDate: moment(), 
        column: [], 

        pageArr : [{
            pageCnt : 50,   //리스트 총 갯수
            page : 1,       //현재페이지
            lastPage : 0,   //마지막페이지
            pageText : '',  //페이지 정보
        }],
    }));

    const [srchInput, srchSwitch] = useState(true);
    const [calVisible, modalCalVisible] = useState(false);
    const [modelVisible, setModelVisible] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    // //검색
    // useEffect(() => {        
    //     let theGrid = state.theGrid.current.control;
    //     let theSearch = state.theSearch.current.control;
    //     theSearch.grid = theGrid;
    // }, [state.theSearch]);
    

    //add drawer
    const [visible, setVisible] = useState(false);
    //id add drawer
    const [chkVisible, setChkVisible] = useState(false);
    
    const showDrawer = () => {
         setVisible(true);
    };
 
    const onClose = () => {
         setVisible(false);
    };

    const chkOnClose = () => {
        setChkVisible(false);
    };
 
    //리스트
    const fetchData = useCallback(async (val) => {
        commonStore.loading = true;

        const result = await commonStore.handleApi({
            method: 'POST',
            url: 'admin/authority_list',
            data : {
                page : val,
                pageCnt : state.pageArr[0].pageCnt
            },
        });

        if (result) {
            console.log(result);          

            state.list = result.data;
            state.total = result.meta.total;
            state.pageArr[0].lastPage = result.meta.last_page;
            state.pageArr[0].page = result.meta.current_page;

            state.pageArr[0].pageText = wjCore.format('{index:n0} / {count:n0}', {
                index: state.pageArr[0].page,
                count: state.pageArr[0].lastPage
            })  
            
        }
        commonStore.loading = false;
    }, []);

    //삭제
    const delData = useCallback(async () => {
        commonStore.loading = true;
        const result = await commonStore.handleApi({
          method: 'POST',
          url: 'admin/authority_del',
          data : {
              data : state.selectedRows,
          },
        });

        if(result.auth_id){
          Modal.success({
              content: result.result,
              onOk() {
                if(state.pageArr[0].page){
                    var page = state.pageArr[0].page;
                }
                fetchData(page);
              },
          });
        }else{
          Modal.error({
              content: '삭제시 문제가 발생하였습니다. 재시도해주세요.',        
          });       
        }

        commonStore.loading = false;
    }, []);    

    const handelDate = useCallback(async () => {
        commonStore.loading = true;

        let chkVal = true;
        
        if(state.startDate == ""){
            state.startDate =moment().subtract(30, 'd'); 
        }
        if(state.endDate == ""){
            state.endDate =moment(); 
        }

        if(state.dateType == "" ){
            Modal.error({
                content: '기간 적용 대상 항목을 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(chkVal == true){
            const result = await commonStore.handleApi({
                method: 'POST',
                url: 'admin/authority_list',
                data : {
                    page : '',
                    pageCnt : state.pageArr[0].pageCnt,
                    startDate :state.startDate,
                    endDate :state.endDate,
                },
            });

            if (result) {
                console.log(result);          

                state.list = result.data;
                state.total = result.meta.total;
                state.pageArr[0].lastPage = result.meta.last_page;
                state.pageArr[0].page = result.meta.current_page;

                state.pageArr[0].pageText = wjCore.format('{index:n0} / {count:n0}', {
                    index: state.pageArr[0].page,
                    count: state.pageArr[0].lastPage
                })  

                //state.dateType = '';

                modalCalVisible(false);
                
            }
            commonStore.loading = false;
        }
    }, []);

    const handleChangeInput = useCallback(
        (type) => (e) => {
            console.log(e);
            if(type === "pageCnt"){
                state.pageArr[0].pageCnt = e.target.value;    
            }else if(type === "dateType" || type==="startDate" || type==="endDate"){
                state[type] = e; 
            }else{
                state[type] = e.target.value;  
            }
              
        },
      [],
    );
    

    const handleChangeDate = useCallback((type, val) => {
        console.log(type +'/ '+ val);
            state[type] = val.value;      
        },[],
    );

    function handleModelSubmit(e) {
        if(e === "2"){
            fetchData();
        }else{

        }
        setModelVisible(false);

    }

    function handleMenuClick(e) {
        console.log('click', e);
        state.modelKey = e.key;
        setModelVisible(true);

    }
    const menu = (
        <Menu onClick={handleMenuClick}>
        <Menu.Item key="1">열 선택</Menu.Item>
        <Menu.Item key="2">리스트 보기 수</Menu.Item>
        <Menu.Item key="3">필터 저장 켜기</Menu.Item>
        </Menu>
    );

    //위즈모 체크박스 선택
    const initGrid = (grid) => {
        console.log(grid);
        state.filter = grid.columns;
        state.selector = new Selector(grid,{
          itemChecked: (s, e) => {
              state.selectedItems= grid.rows.filter(r => r.isSelected);
              let i = 0;
              let text = [];   
              for(i=0; i < state.selectedItems.length ; i++){
              text[i] = state.selectedItems[i].dataItem;
              }
              state.selectedRows = text;
          }
        });      
        
    };


    //페이징
    const onGotoPageClick = (command) => {   
        if (command === 'first') {
            if(state.pageArr[0].page > 1){
                fetchData(1);
            }
        }
        else if (command === 'previous') {
            if(state.pageArr[0].page > 1){
                let limit=(state.pageArr[0].page-1);
                fetchData(limit);
            }
        }
        else if (command === 'next') {
            if(state.pageArr[0].lastPage > state.pageArr[0].page){
                let limit=(state.pageArr[0].page+1) ;
                fetchData(limit);
            }            
        }
        else if (command === 'last') {
            if(state.pageArr[0].page != state.pageArr[0].lastPage){
                fetchData(state.pageArr[0].lastPage);
            }
        }
    };

    

    const chkIdx = (idx) => {   
        state.idx = idx;
        state.idAddChk = "Y";
        setChkVisible(true);
    };

    const view = (idx) => {   
        state.viewIdx = idx;
        setVisible(true);
    };

    const handelReset = ()=>{
        fetchData();
        modalCalVisible(false);
        state.dateType='';
        state.startDate=moment().subtract(30, 'd');
        state.endDate=moment();
    }

    

    return (
        <Wrapper>
            <Row className="topTableInfo" justify="space-around">
                <Col span={12} className="topTable_left">
                    <Button className="btn-cal" type="button" icon={<CalendarOutlined /> } onClick={() => {modalCalVisible(true);}}></Button>
                    <Modal
                        visible={calVisible}
                        onOk={() => {handelDate()}}
                        onCancel={() => {handelReset()}}
                        okText="적용"
                        cancelText="초기화"
                    >
                        <Select style={{ width: '80%' }} onChange={handleChangeInput('dateType')} value={state.dateType}>
                            <Option value="">기간 적용 대상 항목</Option>
                            <Option value="updated_at">최종 업데이트</Option>
                        </Select>
                        <DatePicker value={state.startDate} name="start_date" onChange={handleChangeInput('startDate')}  /> ~ <DatePicker value={state.endDate}  name="end_date" onChange={handleChangeInput('endDate')} />
                    </Modal> 
                    
                    <Dropdown.Button overlay={menu} placement="bottomLeft" className="btn-setting" icon={<SettingOutlined />}></Dropdown.Button>
                    <div className={ srchInput ? 'srch_wrap' : 'srch_wrap on' }>
                        <Button className="btn-srch" type="button" icon={<SearchOutlined />} onClick={() => {srchSwitch(!srchInput);}}></Button>
                        <FlexGridSearch ref={state.theSearch}  placeholder='리스트 내 검색' /> 
                    </div>
                </Col>
                <Col span={12} className="topTable_right">
                    {state.selectedItems.length > 0
                        ? <Button className="btn-del btn-primary" type="button" onClick={delData}>삭제</Button>
                        : <Button className="btn-add btn-primary" type="button" onClick={showDrawer}>+<span className="hiddentxt">추가</span></Button>
                    }
                </Col>
            </Row>

            <Row id="gridWrap" className="gridWrap">
                <FlexGrid ref={state.theGrid} itemsSource={state.list} isReadOnly={true} stickyHeaders={true} initialized={s => initGrid(s)} >
                    <FlexGridFilter />
                    <FlexGridColumn binding="name" header="권한명" width={300} align="left" cellTemplate={CellMaker.makeButton({
                        click: (e, ctx) => view(ctx.item.id)
                    })}/>
                    <FlexGridColumn binding="description" header="설명" width="*" align="left" />
                    <FlexGridColumn binding="updated_at" header="최종 업데이트"  width={200} align="center"  />
                    <FlexGridColumn binding="member_count" header="할당 계정 수"  width={200} align="right" cellTemplate={CellMaker.makeButton({
                        click: (e, ctx) => chkIdx(ctx.item.id)
                    })}/>
                </FlexGrid> 
            </Row>
   
            <div className="btn-group">
                <button type="button" className="btn" onClick={e => onGotoPageClick('first')}>
                    <span className="glyphicon glyphicon-fast-backward"><VerticalRightOutlined /></span>
                </button>
                <button type="button" className="btn" onClick={e => onGotoPageClick('previous')}>
                    <span className="glyphicon glyphicon-step-backward"><LeftOutlined /></span>
                </button>

                <button type="button" className="btn" disabled style={{ width: "100px" }} dangerouslySetInnerHTML={{ __html: state.pageArr[0].pageText }}></button>

                <button type="button" className="btn" onClick={e => onGotoPageClick('next')}>
                    <span className="glyphicon glyphicon-step-forward"><RightOutlined /></span>
                </button>
                <button type="button" className="btn" onClick={e => onGotoPageClick('last')}>
                    <span className="glyphicon glyphicon-fast-forward"><VerticalLeftOutlined /></span>
                </button>
            </div> 
            
            <AddDrawer visible={visible} onClose={onClose} viewIdx={state.viewIdx}/>
            { state.idAddChk == "Y" &&
                <IdAddDrawer chkVisible={chkVisible} chkOnClose={chkOnClose} idx={state.idx}/>
            }

            {modelVisible === true &&
                <Modal
                    visible={modelVisible}
                    onOk={() => {handleModelSubmit(state.modelKey)}}
                    onCancel={() => {setModelVisible(false)}}
                    okText="현재 설정 저장"
                    cancelText="닫기"
                >
                    {state.modelKey ==="1" 
                        ?   <Checkbox.Group 
                                style={{ width: '100%' }} 
                                onChange={handleChangeInput('filter')}
                            >
                                
                                {state.column.map((item) => (                 
                                    <Checkbox value={item['binding']} >
                                       {item['header']}
                                    </Checkbox>
                                ))}
                            
                            </Checkbox.Group>
                        :   <Radio.Group
                                value={state.pageArr[0].pageCnt}
                                onChange={handleChangeInput('pageCnt')}
                                required
                                >
                                <Radio value="50">50개</Radio>
                                <Radio value="100" >100개</Radio>
                                <Radio value="150" >150개</Radio>
                                <Radio value="200" >200개</Radio>
                            </Radio.Group>            
                    }
                    
                </Modal> 
            }
            

        </Wrapper>
    );
});


export default Adm_authority;
