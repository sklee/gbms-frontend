/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState, useRef, } from 'react';
import { Button, Row, Col, Modal, Pagination, DatePicker } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';



import { FlexGrid, FlexGridColumn, } from '@grapecity/wijmo.react.grid';
import { FlexGridSearch } from '@grapecity/wijmo.react.grid.search';
import { FlexGridDetail } from '@grapecity/wijmo.react.grid.detail';
import { CollectionView } from '@grapecity/wijmo';
import * as wjFilter from "@grapecity/wijmo.react.grid.filter";
import * as wjInput from '@grapecity/wijmo.react.input';
import * as wjCore from '@grapecity/wijmo';


import Excel from '@components/Common/Excel';
import ContractView from '../../Contract/view';
import ProductView from '../view';

import moment from 'moment';

const Wrapper = styled.div`
    width: 100%;
    .wj-flexgrid .wj-state-sticky .wj-header {
        opacity: unset;
    }
    #tplBtnViewMode {
        display: none;
    }
`;

const productCodeList = observer((props) => {
  const { commonStore } = useStore();

  const { confirm } = Modal;

  const state = useLocalStore(() => ({
      list: [],      
      total: 0,
      grid: '',

      //저작권 계약 정보
      contract_id : '',
      contract_type : '',

      //페이징
      pageArr: {
          pageCnt: 50, //리스트 총 갯수
          page: 1, //현재페이지
      },

      proVewIdx:'' , //연결상품 idx
      contractType:'' , //연결상품 contractType
      viewData:'' , //연결상품 viewData
      gridFilter: null,
      dateItemName: [{id: 1, name: '신청일'}],
  }));

  useEffect(() => {
      fetchData();
      theSearch.current.control.grid = theGrid.current.control;
  }, []);

  //페이징 데이터
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
    console.log(state.pageArr.pageCnt)

      if (val == '' || val == '0' || val == undefined) {
          var page = 1;
      } else {
          var page = val;
      }

      var axios = require('axios');

      var config = {
          method: 'GET',
          url: process.env.REACT_APP_API_URL +'/api/v1/products-code?display='+state.pageArr.pageCnt+'&page='+page +'&sort_by=date&order=desc',
          headers: {
              Accept: 'application/json',
          },
      };

      axios(config)
          .then(function (response) {                              
            console.log(response.data)
              var result_page =
                  (page - 1) * state.pageArr.pageCnt;
              var str_no = response.data.meta.total - result_page;

              response.data.data.map((e, number) => {
                  e.cnt = str_no - number;
                  if(e.created_at){
                    e.created_at =e.created_at.substring(0,10);
                  }
                  if(e.approved_at){
                    e.approved_at =e.approved_at.substring(0,10);
                  }
              });
              
              state.list = response.data.data;
              state.total = response.data.meta.total;
              state.pageArr.page = response.data.meta.current_page;
              state.pageArr.pageCnt = response.data.meta.per_page;

              //정렬
              // var sd = new wijmo.collections.SortDescription(approved_at, asc);
              // var sd = new wijmo.SortDescription('approved_at', true);
              // var sd = new wijmo.SortDescription('approved_name', 'asc');
              // state.list = new wijmo.CollectionView( state.list );
              // state.list.sortDescriptions.push(sd);

              //재정렬
              // var waitingIndex = 0;
              // for (var i = 0; i < state.grid.collectionView.items.length; i++) {
              //   // approved_at 값이 '대기중' 인 열을 그리드의 상단으로 위치를 변경합니다.
              //   if (state.grid.collectionView.items[i].approved_at == "대기 중") {
                  
              //     state.grid.collectionView.items.splice(
              //       waitingIndex,
              //       0,
              //       state.grid.collectionView.items[i]
              //     );
              //     state.grid.collectionView.items.splice(i + 1, 1);
              //     waitingIndex++;
              //   }
          
              //   // // approved_at 값이 '취소' 인 열을 approved_at 값이 '대기중' 인 열의 하단으로 위치를 변경합니다.
              //   // if (grid.collectionView.items[i].approved_at == "취소") {
              //   //   grid.collectionView.items.splice(
              //   //     waitingIndex + cancelIndex,
              //   //     0,
              //   //     grid.collectionView.items[i]
              //   //   );
              //   //   grid.collectionView.items.splice(i + 1, 1);
              //   //   cancelIndex++;
              //   // }
              // }
              // state.grid.collectionView.refresh();
          
              // // 재정렬된 열을 고정시킵니다.
              // for (var i = 0; i < waitingIndex; i++) {
              //   state.grid.collectionView.items[i].pinnedRow = true;
              // }
          
              // state.grid.collectionView.sortConverter = function (sd, item, val) {
              //   if (!item["pinnedRow"] || sd.property !== "approved_at") {
              //     return val;
              //   }
              //   // 고정된 열의 차순을 무한대로 지정합니다.
              //   return sd.ascending ? -Infinity : Infinity;
              // };
              // state.list.sortDescriptions.clear();
              // state.list.sortDescriptions.push(new wjCore.SortDescription("approved_at", true));
          })
          .catch(function (error) {
              console.log(error.response);              
          });
  }, []);  

  const [source, setSource] = useState(new wjCore.CollectionView(state.list));
  // const [source, setSource] = useState([]);

  //필터
  const initFilter = (filter) => {
    filter.filterColumns = ["company", "brand", "product_type", "name", "created_at", "created_name", "approved_at", "product_code", "approved_name", "code_btn"];
  };

  //위즈모 체크박스 선택
  const initGrid = (grid) => {  
    state.grid = grid;

    //버튼 추가
    grid.formatItem.addHandler((s, e) => {
      if (e.panel == s.columnHeaders) {
        let html = e.cell.innerHTML;
        if(html.split('\\n').length > 1){
          e.cell.innerHTML = '<div class="v-center">' + html.split('\\n')[0] + html.split('\\n')[1] + "<br/>" + html.split('\\n')[2] + '</div>';
        }else{
          e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
        }
      }

      if (e.panel == s.cells) {
        let col = s.columns[e.col], item = s.rows[e.row].dataItem;
        // create buttons for items not being edited
        switch (col.binding) {
          case 'cnt':
            // console.log(item)
            // console.log(col.binding)
            if(item !=='' && item !== null && item != undefined){
              let num = item[col.binding];
              e.cell.innerHTML = num;
              e.cell['dataItem'] = item;
            }          
           
            break;
          case 'created_at':
          case 'approved_at':
            const momentObj = moment(item[col.binding],'YYYY-MM-DD');
            const isValidDate = momentObj.isValid();
            if(isValidDate){
                e.cell.innerHTML = momentObj.format('YYYY-MM-DD');
            }else{
                e.cell.innerHTML=item[col.binding];
            }
            break;
          case 'code_btn':
            if(item.product_code != '' && item.product_code != '대기 중'){
              var btn = '';              
            }else if(item.approved_at === '취소'){
              var btn = '';        
            }else{
              var btn = '<button id="btnAdd" class="ant-btn ant-btn-primary ant-btn-sm" type="button" >발급</button> <button id="btnDel" class="ant-btn ant-btn-defau ant-btn-sm"  type="button">취소</button>';             
            }            
            e.cell.innerHTML = btn;
            e.cell['dataItem'] = item;
          break;
          case 'company':
            if (item.company == '도서출판 길벗'){
                e.cell.innerHTML = '길벗'
            } else if (item.company == '길벗스쿨'){
                e.cell.innerHTML = '스쿨'
            } else {
                e.cell.innerHTML = item.company;
            }
            break;
          case 'brand':
            if (item.brand == '도서출판 길벗'){
                e.cell.innerHTML = '길벗'
            } else if (item.brand == '길벗스쿨'){
                e.cell.innerHTML = '스쿨'
            } else {
                e.cell.innerHTML = item.brand;
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
        console.log(item);
        switch (e.target.id) {
          case 'btnDel':
            console.log(item)
            showModal(item.id,'del');
            break;
        }
        switch (e.target.id) {
          case 'btnAdd':
            showModal(item.id,'add');
            break;
        }
      }   
    });


  };

  const showModal = (data, type) => {
    console.log(data);
    if(data != '' && type === 'del'){
      confirm({
        title: '신청자와 미리 협의된 경우에만 취소해주세요.',
        icon: <ExclamationCircleOutlined />,
        content: '신청 내역을 취소하시겠습니까?',    
        onOk() {
          changeData(type, data);
        },    
        onCancel() {          
        },
      });
    }else{
      confirm({
        icon: <ExclamationCircleOutlined />,
        content: '신청을 승인하면서 상품코드를 발급하시겠습니까?',    
        onOk() {
          changeData(type, data);
        },    
        onCancel() {          
        },
      });
    }
  };

  //발급&취소
  const changeData = useCallback(async (type, idx) => {
    if(type === 'del'){
      var allow_yn = 'N'
    }else{
      var allow_yn = 'Y'
    }

    var axios = require('axios');

    var config = {
        method: 'PUT',
        url: process.env.REACT_APP_API_URL +'/api/v1/products-code/'+idx,
        headers: {
            Accept: 'application/json',
        },
        data:{
          allow_yn : allow_yn
        }
    };

    axios(config)
        .then(function (response) {                              
          fetchData();            
        })
        .catch(function (error) {
            console.log(error.response);
            if (error.response.status === 401) {
                // Modal.warning({
                //     title: (
                //         <div>
                //             세션이 만료되었습니다.
                //             <br />
                //             재로그인을 해주세요.
                //         </div>
                //     ),
                //     onOk() {
                //         axios.post(
                //             process.env.PUBLIC_URL +
                //                 '/member/session_logout',
                //         );
                //         window.location.href =
                //             process.env.PUBLIC_URL + '/Login';
                //         window.localStorage.clear();
                //     },
                // });
            } else {
                //console.log(error.response)
            }
        });
}, []);

const [visible, setVisible] = useState(false);
//view drawer open
const contractableBtn=(idx,type)=>{

  state.contract_id = idx;
  if(type=='K' || type=='D'){
    state.contract_type = 'contracts';
  }else if(type =='I'){
    state.contract_type = 'overseas';
  }
  setVisible(true);
}
//view drawer 닫기
const viewOnClose = () => {
  setVisible(false);
};

//연결상품 보기수정
const [productView, setProductView] = useState(false);
const productViewLink=(val)=>{
  console.log(val)
  state.proVewIdx = val.id
  viewData()  
}
const proViewOnClose = () => {
  setProductView(false);
};

//연결상품 상세정보
const viewData = useCallback(async () => {    
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
          <Row className="topTableInfo">
            <Col span={24}>
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
            </Col>
          </Row>
          <Row id="gridWrap" className="gridWrap" ref={tabRef}>
            {/* <FlexGrid ref={state.theGrid} itemsSource={state.list} isReadOnly={true} stickyHeaders={true} initialized={s => initGrid(s)} showMarquee={true}> */}
            <FlexGrid ref={theGrid} itemsSource={state.list} isReadOnly={true} stickyHeaders={true} initialized={s => initGrid(s)} selectionMode="None" allowSorting={false} autoRowHeights={true}>
                <wjFilter.FlexGridFilter initialized={(s) => initFilter(s)} />
                {/* <FlexGridColumn binding="cnt" header="순번" width={70} align="center"/> */}
                <FlexGridColumn binding="company" header="회사" width={60} />
                <FlexGridColumn binding="brand" header="브랜드" width={90} />
                <FlexGridColumn binding="product_type" header="상품 종류" width={110} />
                <FlexGridColumn binding="name" header="상품명" width="*" minWidth={200}/>
                <FlexGridColumn binding="created_at" header="신청일" width={100} format="YYYY-MM-DD"/>
                <FlexGridColumn binding="created_name" header="신청자" width={70}/>
                <FlexGridColumn binding="approved_at" header="상품코드\n발급일" width={100}/>
                <FlexGridColumn binding="product_code" header="상품코드" width={100}/>
                <FlexGridColumn binding="approved_name" header="처리자" width={70}/>
                <FlexGridColumn binding="code_btn" header="작업" width={120} align="center"/>
                <FlexGridDetail isAnimated template={ctx => 
                  (<React.Fragment>
                      <div className='codeProcessDiv'>- 저작권 계약 : {(ctx.item.contractable.id !== null && ctx.item.contractable.id !== undefined) &&
                        // <Button className='btnLink' onClick={(e) =>contractableBtn(ctx.item.contractable.id)} style={{textDecoration: 'underline', textUnderlinePosition:'under'}}>{ctx.item.contractable.name}</Button>}
                        // <a href='' onClick={(e) =>{
                        //   e.preventDefault();
                        //   // contractableBtn(ctx.item.contractable.id,ctx.item.contractable.type);
                        // }} style={{textDecoration: 'underline', textUnderlinePosition:'under'}}>{ctx.item.contractable.name}</a>}
                        ctx.item.contractable.name}
                      </div>
                      {(ctx.item.connection_product.id !== ''  && ctx.item.connection_product.id !== undefined && ctx.item.connection_product.id !== null) ?
                        <><div className='codeProcessDiv'>- 연결 상품 :
                          <Button style={{marginLeft: '3px'}} onClick={(e) =>productViewLink(ctx.item)} >{ctx.item.connection_product.name}</Button> 의 {ctx.item.connection_type}
                          </div></>
                        :<>
                          <div className='codeProcessDiv'>- 연결 상품 : 없음 </div>
                        </>
                      }
                      <div className='codeProcessDiv'>- 출시 예정(목표일) : {ctx.item.expected_release_date}</div>
                      <div>- 요청/참고사항 : </div><div className="inmemo" style={{marginLeft: '3px'}}>{ctx.item.memo}</div>
                  </React.Fragment>)}/>                  
            </FlexGrid>

          </Row>

          <Row gutter={10} className="table table_bot">
              <Col xs={24} lg={16}>
                  <div className="btn-group">
                      <Pagination defaultCurrent={1} defaultPageSize={state.pageArr.pageCnt} current={state.pageArr.page} total={state.total} onChange={pageChange}/>
                      <span style={{marginLeft: 20}}>행 개수 : {state.total}</span>
                  </div>
              </Col>
              <Excel />
          </Row>

          {visible === true && (
                <ContractView
                    idx={state.contract_id}
                    type={state.contract_type}
                    viewVisible={visible}
                    popoutChk='N'
                    drawerChk='Y'
                    viewOnClose={viewOnClose}
                    refChK='Y'
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

export default productCodeList;
