import React from 'react';
import {Row, Col, Drawer, Space, Button} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

const Wrapper = styled.div`
    width: 100%;
`;

const ReceiptDoc = observer(({visible, visibleClose}) => {
  const state = useLocalStore(() => ({
    drawerback : 'drawerWrap', //drawer class name

  }));

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
        title='영수증 제출 다운로드 우선 보이게 설정 해놨어요.(PDF다운로드)'
        placement='right' 
        onClose={visibleClose}
        visible={visible}
        className={state.drawerback}
        closable={false}
        keyboard={false}
        extra={
            <>
                <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                    {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                </Button>
                <Button onClick={visibleClose}>
                    <CloseOutlined />
                </Button>
            </>
        }
      >
        <Row gutter={10} className="table">
            <Col xs={3} lg={3} className='label'>청구서 코드</Col>
            <Col xs={5} lg={5}></Col>
            <Col xs={3} lg={3} className='label'>비용 귀속</Col>
            <Col xs={13} lg={13}></Col>
            <Col xs={3} lg={3} className='label'>제목</Col>
            <Col xs={21} lg={21}></Col>
            <Col xs={3} lg={3} className='label'>청구자</Col>
            <Col xs={5} lg={5}></Col>
            <Col xs={3} lg={3} className='label'>청구일</Col>
            <Col xs={5} lg={5}></Col>
            <Col xs={3} lg={3} className='label'>결재 종료일</Col>
            <Col xs={5} lg={5}></Col>
            <Col xs={3} lg={3} className='label'>증빙 대기 금액</Col>
            <Col xs={5} lg={5}></Col>
            <Col xs={3} lg={3} className='label'>증빙 금액</Col>
            <Col xs={5} lg={5}></Col>
            <Col xs={3} lg={3} className='label'>계좌 구분</Col>
            <Col xs={5} lg={5}></Col>
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