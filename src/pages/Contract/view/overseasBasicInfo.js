/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect } from 'react';
import { Row, Col, Checkbox } from 'antd';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';

const DEF_STATE = {
    // DB Data
    id: '',
    targets: [],
    ranges: [],
};

const OverseasBasicInfo = observer(( {type, selType, dataInfo, data, orgData, basicVal} ) => {
    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 
    const state = useLocalStore(() => ({
        type: '',               //api 타입           
        dataInfo: '',           //저작권자 정보
        selType : '',           //저작권 구분    

        chkData : [],       //계약범위 데이터  

        //파일정보
        selectedFile:[],
        addFile:[],

        selectedFile2:[],
        addFile2:[],

        orgData : {
            targets: [],
            ranges: [],
        }
    }));

    useEffect(()=>{
        state.dataInfo= dataInfo;
        state.type = type
        state.selType = selType
        if(orgData){
            state.orgData = orgData
        }
        const key_list = ['targets','ranges']
        key_list.forEach(key=>{
            stateData[key] = data[key]?data[key]:''
        })
    },[type]);

    const handleChangeInput = useCallback(
        (type) => (e) => {
            if (type === 'ranges') {
                stateData[type] = e;
                var temp_ranges = ['book','ebook','audio'];
                temp_ranges = temp_ranges.filter(x => !stateData[type].includes(x));
                temp_ranges.forEach((item)=>(
                    stateData[item+'s'] = {}
                ));
            }else if (type === 'targets'){
                stateData[type] = e;
            }else{
                stateData[type] = e.target.value;
            }
            basicVal('basic',stateData)
        },[],
    );

    return (
        <>
            <Row gutter={10} className="table marginUp">
                <div className="table_title">기본 정보</div>
                <Col xs={5} lg={5} className="label">
                    권리자
                </Col>
                <Col xs={19} lg={19}>
                    {state.dataInfo.name}
                </Col>
                <Col xs={5} lg={5} className="label">
                    저작권 대상 <span className="spanStar">*</span>
                </Col>
                <Col xs={19} lg={19}>  
                    <Checkbox.Group 
                        style={{ width: '100%' }} 
                        onChange={handleChangeInput('targets')}
                        value={stateData.targets}
                    >
                        <Checkbox 
                            value="본문" 
                            disabled={toJS(state.orgData.targets).includes('본문')}
                        >본문</Checkbox>
                        <Checkbox 
                            value="번역" 
                            disabled={toJS(state.orgData.targets).includes('번역')}
                        >번역</Checkbox>
                        <Checkbox 
                            value="삽화" 
                            disabled={toJS(state.orgData.targets).includes('삽화')}
                        >삽화</Checkbox>
                        <Checkbox 
                            value="사진" 
                            disabled={toJS(state.orgData.targets).includes('사진')}
                        >사진</Checkbox>
                    </Checkbox.Group>
                </Col>
                <Col xs={5} lg={5} className="label">
                    계약 범위 <span className="spanStar">*</span>
                </Col>
                <Col xs={19} lg={19}>
                    <Checkbox.Group 
                        style={{ width: '100%' }} 
                        onChange={handleChangeInput('ranges')}
                        value={stateData.ranges}
                    >
                        <Checkbox 
                            value="book" 
                            disabled={toJS(state.orgData.ranges).includes('book')}
                        >종이책</Checkbox>
                        <Checkbox 
                            value="ebook" 
                            disabled={toJS(state.orgData.ranges).includes('ebook')}
                        >전자책</Checkbox>
                        <Checkbox 
                            value="audio" 
                            disabled={toJS(state.orgData.ranges).includes('audio')}
                        >오디오북</Checkbox>
                    </Checkbox.Group>
                </Col>
            </Row>
        </>
    );
})

export default OverseasBasicInfo;