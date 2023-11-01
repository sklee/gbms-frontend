import React, { useState, useCallback } from 'react';
import { Row, Col, Input, Radio, Select} from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

const Wrapper = styled.div`
    width: 100%;
    margin: 30px 0;
`;
const { TextArea } = Input;

const index = observer((props) => {

    const state = useLocalStore(() => ({
        memberOption:[
            {value: 1, label: '편집자1'},
            {value: 2, label: '편집자2'},
            {value: 3, label: '편집자3'},
            {value: 4, label: '편집자4'},
        ],
    }));

    const [manager, setManager] = useState([]);
    const handleChangeSelect = useCallback( (e) => {
        setManager(e);
    });

    return (
        <Wrapper>
            <Row className='table marginTop'>
                <div className="table_title">입고 처리</div>
                <Col xs={12} lg={4} className='label'>처리자</Col>
                <Col xs={12} lg={8}>김명자</Col>

                <Col xs={12} lg={4} className='label'>처리일시</Col>
                <Col xs={12} lg={8}>2023.08.10. 10:25</Col>

                <Col xs={12} lg={4} className='label'>입고 처리 수량 <span className='spanStar'>*</span></Col>
                <Col xs={12} lg={8}>
                    <Input />
                </Col>

                <Col xs={12} lg={4} className='label'>처리 후 입고 잔여</Col>
                <Col xs={12} lg={8}>0</Col>

                <Col xs={12} lg={4} className='label'>물류 환산 수량 <span className='spanStar'>*</span></Col>
                <Col xs={12} lg={8}>
                    <Input />
                </Col>

                <Col xs={12} lg={4} className='label'>입고 상태 <span className='spanStar'>*</span></Col>
                <Col xs={12} lg={8}>
                    <Radio.Group value={1}>
                        <Radio value={1}>입고(완료)</Radio>
                        <Radio value={2} >입고(부분)</Radio>
                        <Radio value={3} >재입고 요청</Radio>
                    </Radio.Group> 
                </Col>

                <Col xs={12} lg={4} className='label'>알림 메일 대상</Col>
                <Col xs={12} lg={20}>
                    <Select 
                        value={manager} 
                        mode="multiple" 
                        showArrow 
                        style={{ width: '100%' }} 
                        placeholder="담당자를 선택하세요." 
                        onChange={handleChangeSelect} 
                        options={state.memberOption}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </Col>

                <Col xs={12} lg={4} className='label'>참고 사항</Col>
                <Col xs={12} lg={20}>
                    <TextArea style={{height: '100%'}} />
                </Col>
            </Row>

        </Wrapper>
    );

});

export default index;
