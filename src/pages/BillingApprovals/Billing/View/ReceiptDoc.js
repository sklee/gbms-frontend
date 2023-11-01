import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {Row, Col, Drawer, Button, Modal} from 'antd'
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

const Wrapper = styled.div`
    width: 100%;
`;

const ReceiptDoc = observer(({visible, pdfClose, idx, evidencePrice, totalAmount}) => {
  const state = useLocalStore(() => ({
    data :[],
    drawerback: 'drawerWrap',
  }));

  useEffect(() =>{
      fetchData(idx);
  },[idx])

  const fetchData = useCallback(async (id) => {
      var axios = require('axios');

      var config = {
          method: 'GET',
          url:process.env.REACT_APP_API_URL +'/api/v1/receipt-submission/'+id,
          headers: {
              Accept: 'application/json',
          },
      };

      axios(config)
      .then(function (result) {
          console.log(result.data.data)
          if (result.data.success === false) {
              Modal.error({
                  title: '오류가 발생했습니다.',
                  content: '오류코드:' + result.data.message,
              });
          } else {                    

            state.data = result.data.data;
          }
      })
      .catch(function (error) {
          console.log(error);
          console.log(error.response);
          if(error.response !== undefined){
              Modal.error({
                  title: '오류가 발생했습니다. 재시도해주세요.',
                  content: '오류코드:' + error.response.status,
              });
          }
          
      });
      
  }, []);

  // 천단위 자동 콤마
  const commaNum = (num) => {
    if(num !='' && num != undefined){
        const number = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return number
    }      
  }

  const [ drawerExtended, setDrawerExtended ] = useState(false);
  const drawerSizeHandler = () => {
      if(drawerExtended){
          setDrawerExtended(false);
          state.drawerback = 'drawerWrap';
          
      } else {
          setDrawerExtended(true);
          state.drawerback = 'drawerback drawerWrap';
      }
  }

  return (
    <Wrapper>
      <Drawer
        title='영수증 제출'
        placement='right' 
        onClose={pdfClose}
        visible={visible}
        className={state.drawerback}   
        closable={false}
        keyboard={false}
        extra={
          <>
              <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                  {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
              </Button>
              <Button onClick={pdfClose}>
                  <CloseOutlined />
              </Button>
          </>
        }
      >
        <Row gutter={10} className="table">
            <Col xs={3} lg={3} className='label'>청구서 코드</Col>
            <Col xs={5} lg={5}>{state.data.billing_code}</Col>
            <Col xs={3} lg={3} className='label'>비용 귀속</Col>
            <Col xs={13} lg={13}>{state.data.company}</Col>
            <Col xs={3} lg={3} className='label'>제목</Col>
            <Col xs={21} lg={21}>{state.data.name}</Col>
            <Col xs={3} lg={3} className='label'>청구자</Col>
            <Col xs={5} lg={5}>{state.data.billed_info === '' || state.data.billed_info === undefined ? '' : state.data.billed_info.name}</Col>
            <Col xs={3} lg={3} className='label'>청구일</Col>
            <Col xs={5} lg={5}>{state.data.billed_at}</Col>
            <Col xs={3} lg={3} className='label'>결재 종료일</Col>
            <Col xs={5} lg={5}>{state.data.approval_at}</Col>
            <Col xs={3} lg={3} className='label'>증빙 대기 금액</Col>
            <Col xs={5} lg={5}>{totalAmount === '' ? 0 : commaNum(totalAmount)}</Col>
            {/* <Col xs={3} lg={3} className='label'>증빙 금액</Col>
            <Col xs={5} lg={5}>{commaNum(evidencePrice)}</Col> */}
            <Col xs={6} lg={6} className='label'>계좌 구분</Col>
            <Col xs={10} lg={10}>{state.data.account_classification}</Col>
            <Col xs={3} lg={3} className='label'>안내 사항</Col>
            <Col xs={21} lg={21}>
              * 이 문서를 출력하고, 영수증과 함께 묶어서 재무지원팀에 제출해 주세요.<br />
              * 영수증을 제출해야 입금이 되거나, 증빙 등록이 완료됩니다.
            </Col>
        </Row>
      </Drawer>
    </Wrapper>
  )
})

export default ReceiptDoc