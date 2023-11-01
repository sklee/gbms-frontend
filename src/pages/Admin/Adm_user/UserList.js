/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo,useState ,useRef} from 'react';
import { Breadcrumb, Table, Radio, Button, Row, Col, Checkbox,Modal,Select,DatePicker,Menu,Dropdown } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  MinusOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { set, toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import useStore from '@stores/useStore';
import moment from 'moment';
import axios from 'axios';

import * as wijmo from '@grapecity/wijmo';

import { FlexGrid,FlexGridColumn  } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { FlexGridFilter } from "@grapecity/wijmo.react.grid.filter";
import { ListBox } from '@grapecity/wijmo.react.input';
import { Selector } from "@grapecity/wijmo.grid.selector";

import * as wjcCore from '@grapecity/wijmo';
import * as wjcGrid from '@grapecity/wijmo.react.grid';
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjcXlsx from '@grapecity/wijmo.xlsx';
import * as wjcGridXlsx from '@grapecity/wijmo.grid.xlsx';
import * as wjGridFilter from '@grapecity/wijmo.grid.filter';

import * as wjCore from '@grapecity/wijmo';
import { CellMaker } from "@grapecity/wijmo.grid.cellmaker";
import { CellRange } from "@grapecity/wijmo.grid";
import {  saveFile } from "@grapecity/wijmo";

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
  QuestionCircleOutlined,
  CloseOutlined
} from '@ant-design/icons';

import ViewDrawer from './addDrawer';
import CommonView from './viewTab';
import Popout from '@components/Common/popout/popout';

const Wrapper = styled.div`
  width: 100%;
  .add-btn {
    float: right;
  }
  .wj-flexgrid .wj-state-sticky .wj-header {opacity : unset;}
  #tplBtnViewMode {
    display:none;
  }
`;

const { Option } = Select;

const TotalStatus = styled.div`
  .cnt {
    color: ${(props) => props.theme.primaryColor};
    font-size: 1.2rem;
  }
`;

const UserList = observer((props) => {
  const { commonStore } = useStore();

  var json = {
    global: {},
    borders: [], 
    layout: {
      type: "row",
      weight: 100,
      children: [
        {
          type: "tabset",
          id: "view-area",
          weight: 100,
          enableDeleteWhenEmpty:true,
          children: [
            {
              type: "tab",
              name: "tab",
              id:"init",
              component: "init",
              enableDrag: false,
            }
          ],
          active: true,
        }
      ]
    }
  };


  const state = useLocalStore(() => ({
    model: FlexLayout.Model.fromJson(json),
    tabLen:1,
    tabInit:false,

    list: [],

    total: 0,
    selectedRowKeys : [],
    selectedRows : [],
    selector: null,
    selectedDel: [], 
    selectedUpdate: [], 
    theGrid : React.createRef(),
    theSearch : React.createRef(),
    id : '',
    

    modifyOpen: false,
    selectedData: {},

    excelData: '',
    rowLength : 0,
    columnLength: 0,

    modelKey: '', 
    column: '',    
    columnOld: '',    
    filter: '', 
    flexGrid : null,
    gridFilter: null,
    filterOption: false,
    filterText:[],
    sortDescriptions:[],
    sortText:[],

    dragSrc : null,
    dragDst : null,
    columnPicker : '',
    isDragEnabled : false,

    filterData : '',

    //드라이브
    grid : null,

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
  const [columnType, setColumnType] = useState([]);
  //필터끄기 기본
  // const [filterOption, setfilterOption] = useState(false);
  const [filterOptionCancel, setFilterOptionCancel] = useState(false);

  //검색
  const [searchBox, setSearchBox] = useState(false);

  useEffect(() => {
    fetchData();
    gridList();
    let Tooltip = new wijmo.Tooltip();

    Tooltip.setTooltip('.filterText span .icon', '필터를 설정한 다음, 항목명을 드래그 앤 드랍으로 이곳에 끌어놓으면 저장됩니다.');

  }, []);

  //검색
  useEffect(() => {        
    let theGrid = state.theGrid.current.control;
    let theSearch = state.theSearch.current.control;
    
    theSearch.grid = theGrid;
  }, [state.theSearch]);

 


  const fetchData = useCallback(async (val) => {
    commonStore.loading = true;
    // const result = await commonStore.handleApi({
    //   method: 'POST',
    //   url: 'member/list',
    //   data : {
    //     page : val,
    //     pageCnt : state.pageArr[0].pageCnt,
    //     grid_page : "/Admin/Admin_user/list",
    //   },
    // });

    if(val == "" || val == "0" || val == undefined){
      var page = 1;
    }else{
      var page = val;
    }
    const result = await axios.get(
      process.env.REACT_APP_API_URL +'/api/v1/users?display='+state.pageArr[0].pageCnt+'&page='+page+'&sort_by=date&order=desc',
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
    )

    if (result) {
      //정렬
      
      // let data = new wijmo.CollectionView(result.data);
      // //let sd = new wijmo.SortDescription("work_state", true);
      // let sd = new wijmo.SortDescription("name", true);

      // data.sortDescriptions.push(sd);
     
      // let data = new wijmo.CollectionView(result.data, {
      //     sortDescriptions: [new wijmo.SortDescription("name", false)]
      // });

      var result_page = (state.pageArr[0].page-1)*state.pageArr[0].pageCnt;
      var str_no = result.data.meta.total - result_page;

      // result.data.data.forEach(e => {
      //   console.log(index);
      //    // e.cnt = str_no - e;
      // });

      result.data.data.map((e, number) => {
          e.cnt = str_no - number;
      });

      state.list = result.data.data;
      state.total = result.data.meta.total;

      state.pageArr[0].lastPage = result.data.meta.last_page;
      state.pageArr[0].page = result.data.meta.current_page;

      state.pageArr[0].pageText = wjCore.format('{index:n0} / {count:n0}', {
        index: state.pageArr[0].page,
        count: state.pageArr[0].lastPage
      })   

     

      //그리드
//       console.log(result);
//       if (result.grid != "") {
//         var data = JSON.parse(result.grid.filter);
//         console.log(data);
//         // restore column layout (order/width)
//         //state.flexGrid.columnLayout = data.columns;
//         // restore filter definitions
//         state.gridFilter.filterDefinition = data.filterDefinition;
//         state.sortDescriptions = JSON.parse(result.grid.sort);

//         var filterDefinition = JSON.parse(data.filterDefinition);
//         var filters = filterDefinition.filters;
//         console.log(state.column);
// console.log(filters);
        
//         if(filters.length > 0){
//           for (var j = 0; j < filters.length; j++) {
//             for (var i = 0; i < state.column.length; i++) {
            
//               if(state.column[i]['binding'] == filters[j]['binding']){
//                 state.filterText[j] = state.column[i];
//               }
//             }
           
//           }
//           console.log(state.filterText);
//         }else{
//           var sortText = {binding:state.sortDescriptions.property}
//           state.filterText[0] = sortText;
//         }
        
        

//         // restore sort state
//         var view = state.flexGrid.collectionView;

//         if(view){
//           view.deferUpdate(function () {
//             view.sortDescriptions.clear();
//             for (var i = 0; i < state.sortDescriptions.length; i++) {
//                 var sortDesc = state.sortDescriptions[i];
//                 view.sortDescriptions.push(new wjcCore.SortDescription(sortDesc.property, sortDesc.ascending));
//             }
//           });
//         }
        
//       }
      
    }
    commonStore.loading = false;
  }, []);

  const gridList = useCallback(async (val) => {
    commonStore.loading = true;
    const result = await commonStore.handleApi({
      method: 'POST',
      url: 'topMenu/list',
      data : {
        page : val,
        pageCnt : state.pageArr[0].pageCnt,
        grid_page : "/Admin/Admin_user/list",
      },
    });

   
      //그리드
      console.log(result);
      if (result.grid != "") {
        var data = JSON.parse(result.grid.filter);
        var sort = JSON.parse(result.grid.sort);

        // restore filter definitions
        state.gridFilter.filterDefinition = data.filterDefinition;
        //state.filterData = data.filterDefinition;

        console.log(state.gridFilter);
        console.log(state.gridFilter.filterDefinition);


        // restore sort state
        var view = state.flexGrid.collectionView;
        view.deferUpdate(function () {
            view.sortDescriptions.clear();

            for (var i = 0; i < sort.sortDescriptions.length; i++) {
                var sortDesc = sort.sortDescriptions[i];
                view.sortDescriptions.push(new wjcCore.SortDescription(sortDesc.property, sortDesc.ascending));
            }
        });

       console.log(state.flexGrid.collectionView);


   
    }
    commonStore.loading = false;
  }, []);


  //삭제
  const handleRemove = useCallback(async (id,val) => {
     axios.delete (process.env.REACT_APP_API_URL +'/api/v1/users/'+id, {
        data: {
          'use_yn' : val,
        },
        headers: {
          'Content-type': 'application/json',
          'Accept': 'application/json',
        },
      })
      .then(function (response) {
        console.log(response);
        if(response.data.id !=''){
          if(state.pageArr[0].page){
            var page = state.pageArr[0].page;
          }
          fetchData(page);
        }else{
          Modal.error({
            content: '삭제시 문제가 발생하였습니다. 재시도해주세요.',        
          });  
        }
        
      }).catch(function (error) {
        Modal.error({
          content: '삭제시 문제가 발생하였습니다. 재시도해주세요.',        
        });  
      });

  }, []);

  const handelColumnList = useCallback(async () => {
    commonStore.loading = true;
    const result = await commonStore.handleApi({
      method: 'POST',
      url: 'topMenu/grid_list',
      data : {
        page : "/Admin/Admin_user/list",
      },
    });
    
    if(result.error == ''){
      if(result.grid){
        if(result.grid.columns){
          console.log(result.grid.columns);
          var data = result.grid.columns;
          state.flexGrid.columnLayout = data;
        }
        if(result.grid.pageCnt){
          state.pageArr[0].pageCnt =result.grid.pageCnt;
          fetchData();          
        }       
      }
      state.filterOption = true;
    }else{
      Modal.error({
          content: '저장된 보기 설정이 없습니다.',        
      });       
    }

    commonStore.loading = false;
  }, []);

  const handelColumnSubmit = useCallback(async (val,type) => {
    commonStore.loading = true;

    if(type=='pageCnt'){
      var data = val;    
    }else{
      var data = JSON.stringify(val);    
    }
    
    const result = await commonStore.handleApi({
      method: 'POST',
      url: 'topMenu/grid_insert',
      data : {
        page : "/Admin/Admin_user/list",
        data : data,
        type : type,
      },
    });

    if(result.error == ''){
      if(state.filterOption == true){
        handelColumnList();
      }
    }else{
      Modal.error({
          content: '문제가 발생하였습니다. 재시도해주세요.',        
      });       
    }

    commonStore.loading = false;
  }, []);

  

  const handelFilterDel = useCallback(async () => {
    commonStore.loading = true;
    const result = await commonStore.handleApi({
      method: 'POST',
      url: 'topMenu/grid_del',
      data : {
        page : "/Admin/Admin_user/list",
      },
    });

    if(result.error == ''){
      state.flexGrid.columnLayout  =state.columnOld;
      state.pageArr[0].pageCnt ="50";
      fetchData();
      //setColumnType([]); 
      state.filterOption = false;
      setFilterOptionCancel(false);
    }else{
      Modal.error({
          content: '문제가 발생하였습니다. 재시도해주세요.',        
      });       
    }

    commonStore.loading = false;
  }, []);

  function handleModelSubmit(e,type) {
    if(type === "cancel"){
      if(e === "2"){
        fetchData();
      }else{
        setColumnType(state.filter);
        state.flexGrid.columnLayout  =JSON.stringify( state.filter) ;   
      }
      setModelVisible(false);
    }else{
      if(e === "2"){
        handelColumnSubmit(state.pageArr[0].pageCnt,'pageCnt');
        //fetchData();
      }else{
        handelColumnSubmit(state.filter,'column');
        //setColumnType(state.filter);
      }
      setModelVisible(false);
    }    

  }

  
  const handleChangeInput = useCallback(
    (type) => (e) => {
      console.log(e);
        if(type === "pageCnt"){
            state.pageArr[0].pageCnt = e.target.value;    
        }else{
          state[type] = {'columns' : e};
          console.log(state[type]);
        }
    },[],
  );

  function handleMenuClick(e) {
    state.modelKey = e.key;
    
    if(e.key == "3"){
      if(state.filterOption == false){
        handelColumnList();
      }else{        
        setFilterOptionCancel(true);   
      }
    }else{
      setModelVisible(true);
    }
  }
  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">열 선택</Menu.Item>
      <Menu.Item key="2">리스트 보기 수</Menu.Item>
      <Menu.Item key="3">보기 저장 {state.filterOption ===false ? '켜기': '끄기'}</Menu.Item>
    </Menu>
  );
  
 
  //drawer
  const [visible, setVisible] = useState(false);
  const [viewVisible, setViewVisible] = useState(false);
  const showDrawer = () => {
      setVisible(true);
  };

  const onClose = () => {
      setVisible(false);
  };

  const viewChk = (id) => {
    state.id=id
     setViewVisible(true);
  }

  const viewOnClose = () => {
      setViewVisible(false);
  };

  const handelCheckbox = (id,userYn) => {
    if(id != ""){
      if(userYn == "Y"){
        var userYn = "N";
      }else{
        var userYn = "Y";
      }
      handleRemove(id, userYn);
    }
    
  };


  //위즈모 
  const initGrid = (grid) => {     
    state.grid = grid;
    state.excelData = grid;
    if(state.column == ""){
      var columnData = JSON.parse(grid.columnLayout);
      state.column = columnData.columns;      
    }
    
    state.flexGrid = grid;
    state.columnOld = state.flexGrid.columnLayout;

    state.gridFilter =new wjGridFilter.FlexGridFilter(state.flexGrid);
    

    //버튼 추가
    grid.formatItem.addHandler((s, e) => {
      if (e.panel == s.cells) {
        let col = s.columns[e.col], item = s.rows[e.row].dataItem;
        // create buttons for items not being edited
        switch (col.binding) {
          case 'name':
            let name = '<button id="btnLink" class="btnLink">'+item.name+'</button>';
            e.cell.innerHTML = name+' '+document.getElementById('tplBtnViewMode').innerHTML;
            e.cell['dataItem'] = item;
          break;
          case 'use_yn':
            if(item.use_yn == "Y" ){
              var text = '<input id="checkbox" type="checkbox" name= "use_yn" checked="checked" />';
            }else{
              var text = '<input id="checkbox" type="checkbox" name= "use_yn" />';
            }
            
            e.cell.innerHTML = text;
            e.cell['dataItem'] = item;
          break;
          
        }        
      }
    });

    // handle button clicks
    grid.addEventListener(grid.hostElement, 'click', (e) => {
      if (e.target instanceof HTMLButtonElement) {
        // get button's data item
        let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
        var name = '';
        // handle buttons
        name = item.name;
        state.id = item.id;

        switch (e.target.id) {
          // start editing this item
          case 'btnLink':
              viewChk(item.id);
              //handleModify(true, row)
              break;
          // remove this item from the collection
          case 'btnDivide':
              dividelayout(state.id,name);
              break;
          // remove this item from the collection
          case 'btnNew':
              //state.window = 'Y';
              setPopoutOpen(true);
              break;
        }
      }   
      if (e.target instanceof HTMLInputElement) {
        if(e.target.id == "checkbox"){
          // get button's data item
          let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
          // handle buttons
          switch (e.target.id) {
            case 'checkbox':
                handelCheckbox(item.id,item.use_yn);
                break;
          }
        }        
      }     
    });
  };

  const tabRef = useRef();
  const dividelayout = (item, tit) => {
    const btnEl = tabRef.current.classList;    
    btnEl.forEach((e) => {        
      if(e != 'divide'){
            tabRef.current.classList.add('divide');
      }
    });
    addTab(tit);
  } 

  const addTab = (tit) => {
    state.tabLen++;
    var tabsetId;
    if(state.model.getActiveTabset()==undefined){
      for (const [key, value] of Object.entries(state.model._idMap)) {
        if(value._attributes.type=='tabset'){
          tabsetId = value._attributes.id;
          break;
        }
      }
    }else{
      tabsetId = state.model.getActiveTabset().getId();
    }
    state.model.doAction(
      FlexLayout.Actions.addNode(
        {
          type: "tab",
          name: tit,
          component: "workspace"
        },
        tabsetId,
        FlexLayout.DockLocation.CENTER,
        0
      )
    );
    

    if(state.tabInit == false){
      state.model.doAction(
        FlexLayout.Actions.deleteTab("init")
      )
      state.tabInit = true;
    }       
  }; 


  const factory = (node) => {
    node.setEventListener('close', (p) => {
      state.tabLen--;
      if(state.tabLen==0){
        tabRef.current.classList.remove('gridWrap');
        node.removeEventListener('close');
      }        
    })

    var component = node.getComponent();
    if (component === "workspace") {
        return (               
            <CommonView id={state.id} popoutClose={gridEl} popoutChk="N" />
        );
    }

  };

  const gridEl=()=>{
    // state.tabLen--;
    // if(state.tabLen == 0){
    //     const gridEl = document.getElementById("gridWrap");
    //     gridEl.classList.remove('divide');
    // }   
  }

  //팝업
  const [popout, setPopoutOpen] = useState(false);
  //팝업 닫기
  const closeWindowPortal=()=>{
    setPopoutOpen(false);
  }



  //페이징
  const onGotoPageClick = (command) => {   
    console.log(command);
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

  //엑셀다운
  const handleExcel= ()=> {
    var today = moment().format('YYYY-MM-DD');

    wjcGridXlsx.FlexGridXlsxConverter.saveAsync(state.excelData, {
        includeColumnHeaders: true,
        includeStyles: true,
    }, '사용자관리 리스트_'+today+'.xlsx');
  }

  function exportFile(csv, fileName) {
    var fileType = 'txt/csv;charset=utf-8';
    if (navigator.msSaveBlob) { // IE 
        navigator.msSaveBlob(new Blob([csv], {
        type: fileType
        }), fileName);
    } 
    else {
        var e = document.createElement('a');
        e.setAttribute('href', 'data:' + fileType + ',' + encodeURIComponent(csv));
        e.setAttribute('download', fileName);
        e.style.display = 'none';
        document.body.appendChild(e);
        e.click();
        document.body.removeChild(e);
    }
  }
  
  //드라이브 엑셀
  const handleDrive= ()=> {
     var today = moment().format('YYYY-MM-DD');

    //  let rng = selection
    //       ? null // selection plus extended selection
    //       : new CellRange(0, 0, grid.rows.length - 1, grid.columns.length - 1);
    //   let csv = grid.getClipString(rng, true, true);
    //   exportFile(csv, '사용자관리 리스트_'+today+'.csv');

    // var theGrid = new wjGrid.FlexGrid('#gridWrap', {
    //   itemsSource: state.excelData
    // });

    var rng = new CellRange(0, 0, state.excelData.rows.length - 1, state.excelData.columns.length - 1),
        csv = state.excelData.getClipString(rng, true, true);
        saveFile(csv, '사용자관리 리스트_'+today+'.csv');
   
   //var data = JSON.stringify(state.excelData.itemsSource);
  // console.log(toJS(state.excelData.itemsSource));
   //console.log(data);
   // export grid to CSV
    // var rng = new wjGrid.CellRange(0, 0, state.excelData.rows.length - 1, state.excelData.columns.length - 1),
    //      csv = data.getClipString(rng, true, true);
    // exportFile(csv, '사용자관리 리스트_'+today+'.csv');
 
  }

  //필터 저장
  const onSaveStateClick = (e)=>{  
    var data = {
      filterDefinition: state.gridFilter.filterDefinition
    };

    var sort = {
      sortDescriptions: state.flexGrid.collectionView.sortDescriptions.map(function (sortDesc) {
        return { property: sortDesc.property, ascending: sortDesc.ascending };
      })
    }

    handelFilterGridSubmit(JSON.stringify(data),JSON.stringify(sort));
  }

  
  const handelFilterGridSubmit = useCallback(async (val,sort) => {
    commonStore.loading = true;
    console.log(val);
    const result = await commonStore.handleApi({
      method: 'POST',
      url: 'topMenu/filter_grid_insert',
      data : {
        page : "/Admin/Admin_user/list",
        data: val,
        sort_data: sort,
      },
    });

    if(result.error == ''){
      
    }else{
      Modal.error({
          content: '문제가 발생하였습니다. 재시도해주세요.',        
      });       
    }

    commonStore.loading = false;
  }, []);


  const handelDelFiltersText = (e)=>{
    console.log(e);
    console.log(e['binding']);

    var filterDefinition = JSON.parse(state.gridFilter.filterDefinition);
    var filters = filterDefinition.filters;
    var filtersUpdate = {"filterDefinition": {"defaultFilterType":3,"filters":[]} };
    var sortUpdate = {sortDescriptions:[]};

    console.log(filters);
    console.log(filterDefinition);
    console.log(toJS(state.sortDescriptions));

    if(state.sortDescriptions.length > 0){
      if(e['binding'] == state.sortDescriptions['property']){
        sortUpdate.sortDescriptions = '';
        if(filters.length == 0){
          state.sortText =[];          
        }
      }else{
        state.sortText = state.sortDescriptions;
      }
    }

    var filterText = [];
    if(filters.length > 0){
      var i = 0;
      for (var j = 0; j < filters.length; j++) {
        if(e['binding'] != filters[j]['binding']){
          filtersUpdate.filterDefinition.filters[i] = filters[j];   
          i++;       
        }       
      }   
      
      for (var j = 0; j < state.filterText.length; j++) {
        if(e['binding'] != state.filterText[j]['binding']){
          filterText[filterText.length] = state.filterText[j];   
          i++;       
        }       
      }  
    }

    state.filterText = filterText;

    if(state.sortText.length > 0 ){
      if(state.filterText.length > 0){
        var cnt =state.filterText.length;
       
        for (var j = 0; j < state.filterText.length; j++) {
          if(state.sortText['property'] != state.filterText[j]['binding']){
            state.filterText[cnt] = state.sortText;
          }
        }
      }
    }
    
    console.log(toJS(state.filterText));
    console.log(JSON.stringify(JSON.stringify(filtersUpdate)));  
    handelFilterGridSubmit(JSON.stringify(filtersUpdate),JSON.stringify(sortUpdate));
    
  }

 
  return (
    <Wrapper>
      <Row className="topTableInfo" justify="space-around">
        <Col span={12} className="topTable_left">
          {/* <Button className="btn-cal" type="button" icon={<CalendarOutlined /> } onClick={() => {modalCalVisible(!calVisible);}}></Button> */}
          <Modal
            visible={calVisible}
            onOk={() => {modalCalVisible(true)}}
            onCancel={() => {modalCalVisible(false)}}
            okText="적용"
            cancelText="초기화"
          >
            <Select defaultValue="기간 적용 대상 항목" style={{ width: '80%' }}>
              <Option value="test">test</Option>
            </Select>
            <DatePicker defaultValue={moment().subtract(30, 'd')} name="start_date" /> ~ <DatePicker defaultValue={moment()} name="end_date"/>
          </Modal> 
            
          <Dropdown.Button overlay={menu} placement="bottomLeft" className="btn-setting" icon={<SettingOutlined />}></Dropdown.Button>
          <div className={ srchInput ? 'srch_wrap' : 'srch_wrap on' }>
            <Button className="btn-srch" type="button" icon={<SearchOutlined />} onClick={() => {srchSwitch(!srchInput);}}></Button>
            <FlexGridSearch ref={state.theSearch}  placeholder='리스트 내 검색' /> 
          </div>
        </Col>
        <Col span={12} className="topTable_right">
            <Button className="btn-add btn-primary" type="button" onClick={showDrawer}>+<span className="hiddentxt">추가</span></Button>
        </Col>
      </Row>
      <Row>
        <Col span={12} className="topTable_left">
            <button className="btn btn-default" onClick={onSaveStateClick.bind(this)} style={{width:100}}>필터 저장</button>
            <div className="filterText" >
            {/* <div className="filterText" style={ state.filterOption === true ? {display: 'none'} : {display: 'block'}}> */}
              <span >저장된 필터 <QuestionCircleOutlined className='icon'/></span>
              {state.filterText.length > 0 &&
                state.filterText.map((item) => (    
                  <button className="btn btn-default" onClick={(e)=>{handelDelFiltersText(item)}}>{item.header} <CloseOutlined /></button>
                ))
              }
              <div></div>
            </div>
          </Col>
      </Row>

      <Row id="gridWrap" className="gridWrap"  ref={tabRef}>       
          <FlexGrid ref={state.theGrid} itemsSource={state.list} stickyHeaders={true} headersVisibility="Column" initialized={s => initGrid(s)} >
              {/* <FlexGridFilter/> */}
              <FlexGridColumn binding="cnt" header="순번" width={80} align="left" isReadOnly={true}/>
              <FlexGridColumn binding="name" header="이름" width={200} align="left" isReadOnly={true}/>
              <FlexGridColumn binding="userid" header="계정"  width={200} align="left" isReadOnly={true} />
              <FlexGridColumn binding="company" header="소속 회사"  width={200} align="center" isReadOnly={true} />
              <FlexGridColumn binding="team" header="부서"  width={300} align="center" isReadOnly={true} />
              <FlexGridColumn binding="role" header="부서 내 역할"  width="*" align="center" isReadOnly={true}/>
              <FlexGridColumn binding="class" header="직급"  width={100} align="center" isReadOnly={true}/>
              <FlexGridColumn binding="work_state" header="근무 상태"  width={200} align="center" isReadOnly={true}/>
              <FlexGridColumn binding="use_yn" header="사용 여부"  width={100} align="center" />
          </FlexGrid>

        <div className="panelWrap">
          <FlexLayout.Layout model={state.model} factory={factory.bind(this)}/>
        </div>
      </Row>

      <div id="tplBtnViewMode">
        <div className="btnLayoutWrap">
            <button id="btnDivide" className="btn-layout ant-btn ant-btn-circle">D</button>
            <button id="btnNew" className="btn-layout ant-btn ant-btn-circle">N</button>
        </div>
      </div>

      <Row gutter={10} className="table">
        <Col xs={16} lg={8}>
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
        </Col> 
      
        <Col xs={16} lg={8}>
          <Button onClick={handleDrive} >Drive</Button>
          {/* <Button onClick={() => handleDrive(state.grid, false)} className="btn btn-default">Drive</Button> */}
          <Button onClick={handleExcel} type="primary" >Excel</Button>
        </Col>      
      </Row>
     


      {popout  &&
          <Popout closeWindowPortal={closeWindowPortal} > 
              <CommonView id={state.id} popoutClose={closeWindowPortal} popoutChk="Y"/> 
          </Popout>
        
      }

      {viewVisible &&      
          <CommonView         
              id={state.id}
              viewVisible={viewVisible}
              viewOnClose={viewOnClose}
          /> 
      }

      {visible === true && 
        <ViewDrawer visible={visible} onClose={onClose} reset={fetchData}/>
      }      

      {modelVisible === true &&
        <Modal
            visible={modelVisible}
            onOk={() => {handleModelSubmit(state.modelKey,'ok')}}
            onCancel={() => {handleModelSubmit(state.modelKey,'cancel')}}
            okText="현재 설정 저장"
            cancelText="닫기"
        >
            {state.modelKey ==="1" 
                ?   <Checkbox.Group 
                        style={{ width: '100%' }} 
                        onChange={handleChangeInput('filter')}
                    >                           
                        {state.column.map((item) => (    
                          //console.log(item)                                 
                            <Checkbox value={item} >
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

      <Modal
          visible={filterOptionCancel}
          onOk={() => {handelFilterDel()}}
          onCancel={() => {setFilterOptionCancel(false)}}
          okText="확인"
          cancelText="취소"
      >
        저장된 보기 옵션이 모두 삭제됩니다. 계속하시겠습니까?
      </Modal> 

    </Wrapper>
  );
});

export default UserList;
