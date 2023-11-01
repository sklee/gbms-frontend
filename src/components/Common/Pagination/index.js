/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useEffect } from 'react';
import { observer, useLocalStore } from 'mobx-react';
import {Col, Button, Pagination} from 'antd';
import { toJS } from 'mobx';
import * as wjCore from '@grapecity/wijmo';

import {
  VerticalRightOutlined,
  LeftOutlined,
  RightOutlined,
  VerticalLeftOutlined,
} from '@ant-design/icons';


const PaginationList = observer(({ pageData, listReset }) => {
  const state = useLocalStore(() => ({
    pageCnt : 30,   //리스트 총 갯수
    page : 1,       //현재페이지
    lastPage : 0,   //마지막페이지
    pageText : '',  //페이지 정보
    total : 0,
  }));


  useEffect(() => {
    state.pageCnt = pageData.pageCnt;
    state.page = pageData.page;
    state.lastPage = pageData.lastPage;
    state.pageText = pageData.pageText;
    state.total = pageData.total;

    state.pageText = wjCore.format('{index:n0} / {count:n0}', {
        index: state.page,
        count: state.lastPage
    })
  }, [pageData]);


  //페이징
  const onGotoPageClick = (command) => {   
    if (command === 'first') {
        if(state.page > 1){
          listReset(1);
        }
    }
    else if (command === 'previous') {
        if(state.page > 1){
            let limit=(state.page-1);
            listReset(limit);
        }
    }
    else if (command === 'next') {
        if(state.lastPage > state.page){
            let limit=(state.page+1) ;
            listReset(limit);
        }            
    }
    else if (command === 'last') {
        if(state.page != state.lastPage){
          listReset(state.lastPage);
        }
    }
  };

  const pageChange = (num)=>{
    listReset(num);
  }


  return (
    <Col xs={16} lg={8}>
      <div className="btn-group">
          {/* <button type="button" className="btn" onClick={e => onGotoPageClick('first')}>
              <span className="glyphicon glyphicon-fast-backward"><VerticalRightOutlined /></span>
          </button>
          <button type="button" className="btn" onClick={e => onGotoPageClick('previous')}>
              <span className="glyphicon glyphicon-step-backward"><LeftOutlined /></span>
          </button>

          <button type="button" className="btn" disabled style={{ width: "100px" }} dangerouslySetInnerHTML={{ __html: state.pageText }}></button>

          <button type="button" className="btn" onClick={e => onGotoPageClick('next')}>
              <span className="glyphicon glyphicon-step-forward"><RightOutlined /></span>
          </button>
          <button type="button" className="btn" onClick={e => onGotoPageClick('last')}>
              <span className="glyphicon glyphicon-fast-forward"><VerticalLeftOutlined /></span>
          </button> */}

          {/* <Button
              icon={<VerticalRightOutlined style={{ fontSize: '11px' }} />}
              size="small"
              onClick={e => onGotoPageClick('first')}
              className="paginationBtn"
          />
          <Button
              icon={<LeftOutlined style={{ fontSize: '11px' }} />}
              size="small"
              onClick={e => onGotoPageClick('previous')}
              className="paginationBtn"
          />

          <button type="button" className="btn" disabled style={{ width: "100px" }} dangerouslySetInnerHTML={{ __html: state.pageText }}></button>
          
          <Button
              icon={<RightOutlined style={{ fontSize: '11px' }} />}
              size="small"
              onClick={e => onGotoPageClick('next')}
              className="paginationBtn"
          />
          <Button
              icon={<VerticalLeftOutlined style={{ fontSize: '11px' }} />}
              size="small"
              onClick={e => onGotoPageClick('last')}
              className="paginationBtn"
          /> */}

          <Pagination defaultCurrent={1} current={state.page} total={state.total} onChange={pageChange}/>
          
      </div> 
    </Col> 
  );
});

export default PaginationList;
