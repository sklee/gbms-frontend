/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Space, Button, Row, Col,  Modal, Breadcrumb, Input, Upload,  message, Radio, Popover, Select, Typography, Checkbox, DatePicker} from 'antd';
import { PhoneOutlined ,QuestionOutlined, UploadOutlined, PlusOutlined  } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import * as wjInput from '@grapecity/wijmo.react.input';

import tooltipData from '@pages/tooltipData';

const Wrapper = styled.div`
    width: 100%;
    `;

const DEF_STATE = {
    // DB Data
    id: 1,
    targets: [],
    ranges: [],
    contract_files: [],
    etc_files: [],
    contract_memo: '',
    books: {},
    ebooks: {},
    audios: {},
};

const overseasInfo = observer(({ type, selType, dataInfo, data, basicVal }) => {
    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 
    const state = useLocalStore(() => ({
        type: '',               //api 타입           
        dataInfo: '',           //저작권자 정보
        selType : '',           //저작권 구분    

        chkData : [],       //계약범위 데이터  
        tooltipData :'',

        set_init : {
            range : null,
            start_date:null,
            end_date:null,
            extension_year:null,
            brokers:[]
        }, //기본값 공유
    }));
    
    useEffect(() => {       
        state.type= type;
        state.dataInfo= dataInfo;
        const key_list = ['targets','ranges']
        key_list.forEach(key=>{
            stateData[key] = data[key]?data[key]:''
        })
        if(tooltipData){
            state.tooltipData = tooltipData.filter(e=>e.key==='contract_3').map(item => {
                return <div dangerouslySetInnerHTML={{__html: item.memo}}></div>
            });
        }
    }, [type,dataInfo]);

    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback(
        (type) => (e) => {
            if (type === 'ranges') {
                stateData[type] = e;
                if(!state.set_init.range){
                    state.set_init.range = e[0];
                }

                var temp_ranges = ['book','ebook','audio'];
                temp_ranges = temp_ranges.filter(x => !stateData[type].includes(x));
                temp_ranges.forEach((item)=>{
                    stateData[item+'s'] = {};
                    if(item==state.set_init.range){
                        state.set_init = {
                            range : null,
                            start_date:null,
                            end_date:null,
                            extension_year:null,
                            brokers:[]
                        };
                    }
                });
            }else if (type === 'targets'){
                stateData[type] = e;
            }else{
                stateData[type] = e.target.value;
            }
            basicVal('basic',stateData)         
        },[],
    );

    const copyContracts = (idx) => {
        var idata = data['idx_'+idx];
        if(idata !== null && idata !== undefined){
            if(Object.keys(idata).length > 0 && idata.id !== undefined){
                var temp_type = Object.keys(DEF_STATE);
                temp_type.forEach((item)=>(
                    stateData[item] = idata[item]
                ));
            }
        }
        basicVal('basic',stateData)
    };

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
                    계약 정보 복사
                    <Popover content={state.tooltipData[0]}>
                        <Button
                            shape="circle"
                            icon={
                                <QuestionOutlined
                                    style={{ fontSize: '11px' }}
                                />
                            }
                            size="small"
                            style={{ marginLeft: '5px' }}
                        />
                    </Popover>
                </Col>
                <Col xs={19} lg={19}>
                    <wjInput.ComboBox
                        placeholder="선택"
                        selectedValuePath="id"
                        displayMemberPath="name"
                        valueMemberPath="id"
                        textChanged={(e)=>{copyContracts(e)}}
                        style={{ width: 240 }}
                    />
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
                        <Checkbox value="본문" >본문</Checkbox>
                        <Checkbox value="번역" >번역</Checkbox>
                        <Checkbox value="삽화" >삽화</Checkbox>
                        <Checkbox value="사진" >사진</Checkbox>
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
                        <Checkbox value="book" >종이책</Checkbox>
                        <Checkbox value="ebook" >전자책</Checkbox>
                        <Checkbox value="audio" >오디오북</Checkbox>
                    </Checkbox.Group>
                </Col>
            </Row>
        </>
    );
});

export default overseasInfo;