/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Space, Button, Row, Col,  Modal, Breadcrumb, Input, Upload,  message, Radio, Popover, Select, Typography, Checkbox, DatePicker, InputNumber} from 'antd';
import { PhoneOutlined ,QuestionOutlined, UploadOutlined, ExclamationCircleOutlined  } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';
import * as wjInput from '@grapecity/wijmo.react.input';
import { CollectionView } from '@grapecity/wijmo';

import tooltipData from '@pages/tooltipData';

// import AddHolder from '../../Search';
import PrdAudios from './Product/audios';
import PrdBooks from './Product/books';
import PrdEbooks from './Product/ebooks';
import PrdOthers from './Product/others';
import PrdExports from './Product/exports';

import PopupPostCode from '@components/Common/DaumAddress';

const Wrapper = styled.div`
    width: 100%;
    `;

const DEF_STATE = {
    // DB Data
    id: 1,
    contract_transfer: '',
    copyright_fee_lump_sum: '',
    total_amount: '',
    payment: '',
    payment_date: '',
    payment_timing_type: '',
    payment_timing_content: '',
    targets: [],
    ranges: [],
    contract_files: [],
    etc_files: [],
    contract_memo: '',
    books: {},
    ebooks: {},
    audios: {},
    others: {},
    exports: {}
};

const contractsDrawer = observer(({type,selType,dataInfo,data,getCopyrights,getCopyrightsFiles}) => {
    const { commonStore } = useStore();

    const { Text } = Typography;
    const { Option } = Select;

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

        //파일정보
        selectedFile:[],

        selectedFile2:[],
    }));
    
    useEffect(() => {
        state.type= type;
        state.dataInfo= dataInfo;
        state.selType= selType;
        stateData.id = dataInfo.id.id;
        var idata = data['idx_'+dataInfo.id.id];
        if(idata !== null && idata !== undefined){
            if(Object.keys(idata).length > 0 && idata.id !== undefined){
                var temp_type = Object.keys(DEF_STATE);
                temp_type.forEach((item)=>(
                    stateData[item] = idata[item]
                ));
            }
        }
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
                var temp_ranges = ['book','ebook','audio','other','export'];
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
            }else if (type === 'payment_date'){
                stateData[type] = e;
            }else if(type === 'payment_timing_type'){
                stateData['payment_timing_content'] = '';
                stateData[type] = e.target.value;
            }else if (type === 'payment_timing_content'){
                if(stateData['payment_timing_type']==="1"){
                    stateData[type] = e;
                }else if(stateData['payment_timing_type']=== "2" || stateData['payment_timing_type']=== "3" ){
                    stateData[type] = e.target.value;
                }
            }else if(type === 'total_amount' || type === 'payment'){
                stateData[type] = e.target.value.replace(/([^0-9])/g, '');
            }else if(type === 'copyright_fee_lump_sum'){
                stateData[type] = e.target.value;
                if(stateData.copyright_fee_lump_sum=='Y'){
                    var temp_ranges = ['book','ebook','audio','other','export'];
                    temp_ranges.forEach((item)=>{
                        stateData[item+'s'] = {};
                    });
                }else{
                    stateData.total_amount= '';
                    stateData.payment= '';
                    stateData.payment_date= '';
                    stateData.payment_timing_type= '';
                    stateData.payment_timing_content= '';
                }
            }else{
                stateData[type] = e.target.value;
            }
        },[],
    );

    const getData = (type,data) => {
        if(type==='books'){
            stateData.books = toJS(data);
        } else if(type==='ebooks'){
            stateData.ebooks = toJS(data);
        } else if(type==='audios'){
            stateData.audios = toJS(data);
        } else if(type==='others'){
            stateData.others = toJS(data);
        } else{
            stateData.exports = toJS(data);
        }
        if(state.set_init.range){
            handleInit(type,data);
        }else{
            state.set_init.range = type.slice(0, -1);
            handleInit(type,data);
        }
        getCopyrights(stateData);
    };

    const handleInit = (type,data) => {
        if(state.set_init.range+'s' == type){
            if(data.start_date){
                state.set_init.start_date = data.start_date;
            }
            if(data.extension_year){
                state.set_init.extension_year = data.extension_year;
            }
            if(data.end_date){
                state.set_init.end_date = data.end_date;
            }
            if(data.brokers){
                state.set_init.brokers = toJS(data.brokers);
            }
        }
    }

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
        stateData.id = dataInfo.id.id;
        getCopyrights(stateData);
    };

    //파일 업로드
    const [fileList, setFileList] = useState([]);
    const props = {
        onRemove: (file) => {
            const index = state.selectedFile.indexOf(file);
            const newFileList = state.selectedFile.slice();
            newFileList.splice(index, 1);
            state.selectedFile = newFileList;
            setFileList(state.selectedFile);
            stateData.contract_files = toJS(state.selectedFile);
            getCopyrights(stateData);
        },
        beforeUpload: (file) => {
            state.selectedFile = [...state.selectedFile, file];
            setFileList(state.selectedFile);
            stateData.contract_files = toJS(state.selectedFile);
            getCopyrights(stateData);
            return false;
        },
        fileList,      
    };

    //파일 업로드
    const [fileList2, setFileList2] = useState([]);
    const props2 = {
        onRemove: (file) => {
            const index = state.selectedFile2.indexOf(file);
            const newFileList = state.selectedFile2.slice();
            newFileList.splice(index, 1);
            state.selectedFile2 = newFileList;
            setFileList2(state.selectedFile2);
            stateData.etc_files = toJS(state.selectedFile2);
            getCopyrights(stateData);
        },
        beforeUpload: (file) => {
            state.selectedFile2 = [...state.selectedFile2, file];
            setFileList2(state.selectedFile2)
            stateData.etc_files = toJS(state.selectedFile2);
            getCopyrights(stateData);
            return false;
        },
        fileList2,      
    };

    return (
        <Wrapper>
            {/* ================================================= 국내 / 해외 직계약  ========================================================== */}
            {state.type ==='contracts'                     
                ?
                <Wrapper>
                    <Row gutter={10} className="table marginTop">
                        <div className="table_title">세부 계약의 기본 정보</div>
                        <Col xs={5} lg={5} className="label">
                            저작권자
                        </Col>
                        <Col xs={19} lg={19}>
                            {state.dataInfo.id.name}
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
                            {/* <Select style={{ width: 240 }} placeholder="선택해 주세요." onChange={(e)=>{copyContracts(e)}}>
                                {state.dataInfo.data.map((item) => (
                                    <Option value={item['id']}>{item['name']}</Option>
                                ))}
                                <Option value={state.dataInfo['id']}>{state.dataInfo['name']}</Option>
                            </Select>   */}
                            {/* * 이 계약에 등록된 다른 저작권자의 세부 계약 정보를 불러와서 수정할 수 있습니다. */}
                            <wjInput.ComboBox
                                placeholder="선택"
                                itemsSource={new CollectionView(state.dataInfo.data, {
                                    currentItem: null
                                })}
                                selectedValuePath="id"
                                displayMemberPath="name"
                                valueMemberPath="id"
                                // selectedValue={stateData.work_state}
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
                                {/* {state.column.map((item) => (                 
                                    <Checkbox value={item['binding']} >
                                        {item['header']}
                                    </Checkbox>
                                ))} */}
                                <Checkbox value="본문" >본문</Checkbox>
                                <Checkbox value="번역" >번역</Checkbox>
                                <Checkbox value="삽화" >삽화</Checkbox>
                                <Checkbox value="사진" >사진</Checkbox>
                                <Checkbox value="동영상강좌" >동영상 강좌</Checkbox>
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
                                <Checkbox value="other" >2차 저작권(동영상 강좌 포함)</Checkbox>
                                <Checkbox value="export" >수출 저작권</Checkbox>
                            </Checkbox.Group>
                        </Col>
                        <Col xs={5} lg={5} className="label">
                            저작권 양도 계약 <span className="spanStar">*</span>
                        </Col>
                        <Col xs={19} lg={19}>
                            <Radio.Group
                                value={stateData['contract_transfer']}
                                onChange={handleChangeInput('contract_transfer')}
                            >
                            <Radio value="N">아님(No)</Radio>
                            <Radio value="Y">맞음(Yes)</Radio>

                            </Radio.Group>
                        </Col>
                        <Col xs={5} lg={5} className="label">
                            저작권료 일괄 지급(매절) <span className="spanStar">*</span>
                        </Col>
                        <Col xs={19} lg={19}>
                            <Radio.Group
                                value={stateData['copyright_fee_lump_sum']}
                                onChange={handleChangeInput('copyright_fee_lump_sum')}
                            >
                            <Radio value="N">아님(No)</Radio>
                            <Radio value="Y">맞음(Yes)</Radio>

                            </Radio.Group>
                        </Col>
                    </Row>    
            {stateData.copyright_fee_lump_sum !== 'Y' ?
                <>
                {stateData.ranges.includes('book')
                    ?
                <PrdBooks type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.books)} booksVal={getData} init={state.set_init}/> : <></>
                }

                {stateData.ranges.includes('ebook')
                    ?
                <PrdEbooks type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.ebooks)} ebooksVal={getData} init={state.set_init}/> : <></>
                }

                {stateData.ranges.includes('audio')
                    ?
                <PrdAudios type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.audios)} audiosVal={getData} init={state.set_init}/> : <></>
                }

                {stateData.ranges.includes('other')
                    ?
                <PrdOthers type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.others)} othersVal={getData} init={state.set_init}/> : <></>
                }

                {stateData.ranges.includes('export')                   
                    ?
                <PrdExports type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.exports)} exportsVal={getData} init={state.set_init}/> : <></>
                }
                </>
                :
                <></>
            }
                {stateData.copyright_fee_lump_sum ==='Y'                     
                    ?
                <Row gutter={10} className="table marginTop">
                    <div className="table_title">저작권료 일괄 지급(매절) 정보</div>
                    <Col xs={5} lg={5} className="label">
                        전체 금액 <span className="spanStar">*</span>     
                    </Col>
                    <Col xs={19} lg={19}>
                        <Input type="text" name="total_amount" value={stateData.total_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={handleChangeInput('total_amount')} autoComplete="off" style={{width:'20%'}}/>원
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        계약금과 지급 기한 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Input type="text" name="payment" value={stateData.payment.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={handleChangeInput('payment')} autoComplete="off" style={{width:'20%'}}/>원을 &nbsp;
                        <DatePicker value={stateData.payment_date} name="payment_date" onChange={handleChangeInput('payment_date')}  />까지 지급(계약금 없으면 0원으로 입력)
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        전체 금액 지급 시기 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Radio.Group
                            value={stateData['payment_timing_type']}
                            onChange={handleChangeInput('payment_timing_type')}
                            style={{width: '100%'}}
                        >
                            <Radio value="1" style={{width: 125, paddingBottom: 10}}>특정날짜
                            </Radio>
                            {stateData['payment_timing_type'] === "1" &&
                                <DatePicker value={stateData.payment_timing_content} name="payment_timing_content" onChange={handleChangeInput('payment_timing_content')} style={{width: 125}}/>
                            }
                            <br/>
                            <Radio value="2" style={{width: 125, paddingBottom: 10}}>작업물 수령 후
                            </Radio>
                            {stateData['payment_timing_type'] === "2" && <>
                                <Input type="number" min="0" name="payment_timing_content" value={stateData.payment_timing_content} onChange={handleChangeInput('payment_timing_content')} autoComplete="off" style={{width: 125}} /><span style={{fontSize: 14}}>일 이내</span>
                            </>
                            }
                            <br/>
                            <Radio value="3" style={{width: 125, paddingBottom: 10}}>상품 출시 후
                            </Radio>
                            {stateData['payment_timing_type'] === "3" && <>
                                <Input type="number" min="0" name="payment_timing_content" value={stateData.payment_timing_content} onChange={handleChangeInput('payment_timing_content')} autoComplete="off" style={{width: 125}}/><span style={{fontSize: 14}}>일 이내</span>
                            </>}
                            <br/>
                            <Radio value="4">기타</Radio>
                        </Radio.Group>
                    </Col>
                </Row>  
                :<></> 
                }

                <Row gutter={10} className="table marginTop">
                    <div className="table_title">계약서 파일과 참고사항</div>
                    <Col xs={5} lg={5} className="label">
                        계약서 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Upload {...props} multiple={true}>
                            <Button className='ant-btn-etc-single' icon={<UploadOutlined />}>파일</Button>
                        </Upload>
                        <span className='accessFile'><ExclamationCircleOutlined/> 업로드 가능 확장자: png, pdf,xlsx | 용량 최대: 20MB</span>
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        기타 참고 파일
                    </Col>
                    <Col xs={19} lg={19}>
                        <Upload {...props2} multiple={true}>
                            <Button className='ant-btn-etc-single' icon={<UploadOutlined />}>파일</Button>
                        </Upload>
                        <span className='accessFile'><ExclamationCircleOutlined/> 업로드 가능 확장자: png, pdf,xlsx | 용량 최대: 20MB</span>
                    </Col>

                    <Col xs={5} lg={5} className="label">
                        계약 참고사항
                    </Col>
                    <Col xs={19} lg={19}>
                        <Input.TextArea
                            name="memo"
                            rows={4}
                            onChange={handleChangeInput('memo')}
                            value={stateData.memo}
                            autoComplete="off"
                        />
                    </Col>
                </Row>
                
            </Wrapper>
            :<></>
            
        }
        {/* ================================================= 국내 / 해외 직계약 end ========================================================== */}
        {/* ================================================= 해외 수입 ======================================================================= */}
        {state.type ==='overseas'                     
                ?
                <Wrapper>
                    <Row gutter={10} className="table marginTop">
                        <div className="table_title">세부 계약의 기본 정보</div>
                        <Col xs={5} lg={5} className="label">
                            저작권자
                        </Col>
                        <Col xs={19} lg={19}>
                            {state.dataInfo.id.name}
                        </Col>
                        <Col xs={5} lg={5} className="label">
                            계약 정보 복사
                        </Col>
                        <Col xs={19} lg={19}>
                            {/* <Select style={{ width: 240 }} placeholder="선택해 주세요.">
                                {state.dataInfo.map((item) => (
                                    <Option value={item['id']}>{item['name']}</Option>
                                ))}
                                <Option value={state.dataInfo.id['id']}>{state.dataInfo.id['name']}</Option>
                            </Select>  
                            * 이 계약에 등록된 다른 저작권자의 세부 계약 정보를 불러와서 수정할 수 있습니다. */}
                            <wjInput.ComboBox
                                placeholder="선택"
                                itemsSource={new CollectionView(state.dataInfo, {
                                    currentItem: null
                                })}
                                selectedValuePath="id"
                                displayMemberPath="name"
                                valueMemberPath="id"
                                // selectedValue={stateData.work_state}
                                // textChanged={handleChangeInput('work_state')}
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
                                {/* {state.column.map((item) => (                 
                                    <Checkbox value={item['binding']} >
                                        {item['header']}
                                    </Checkbox>
                                ))} */}
                                <Checkbox value="본문" >본문</Checkbox>
                                <Checkbox value="번역" >번역</Checkbox>
                                <Checkbox value="삽화" >삽화</Checkbox>
                                <Checkbox value="사진" >사진</Checkbox>
                                <Checkbox value="동영상강좌" >동영상 강좌</Checkbox>
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
                                <Checkbox value="other" >2차 저작권(동영상 강좌 포함)</Checkbox>
                                <Checkbox value="export" >수출 저작권</Checkbox>
                            </Checkbox.Group>
                        </Col>
                        <Col xs={5} lg={5} className="label">
                            저작권 양도 계약 <span className="spanStar">*</span>
                        </Col>
                        <Col xs={19} lg={19}>
                            <Radio.Group
                                value={stateData['contract_transfer']}
                                onChange={handleChangeInput('contract_transfer')}
                            >
                            <Radio value="N">아님(No)</Radio>
                            <Radio value="Y">맞음(Yes)</Radio>

                            </Radio.Group>
                        </Col>
                        <Col xs={5} lg={5} className="label">
                            저작권료 일괄 지급(매절) <span className="spanStar">*</span>
                        </Col>
                        <Col xs={19} lg={19}>
                            <Radio.Group
                                value={stateData['copyright_fee_lump_sum']}
                                onChange={handleChangeInput('copyright_fee_lump_sum')}
                            >
                            <Radio value="N">아님(No)</Radio>
                            <Radio value="Y">맞음(Yes)</Radio>

                            </Radio.Group>
                        </Col>
                    </Row>    

                {stateData.ranges.includes('book')
                    ?
                <PrdBooks type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.books)} booksVal={getData} /> : <></>
                }

                {stateData.ranges.includes('ebook')
                    ?
                <PrdEbooks type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.ebooks)} ebooksVal={getData} /> : <></>
                }

                {stateData.ranges.includes('audio')
                    ?
                <PrdAudios type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.audios)} audiosVal={getData} /> : <></>
                }

                {stateData.ranges.includes('other')
                    ?
                <PrdOthers type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.others)} othersVal={getData} /> : <></>
                }

                {stateData.ranges.includes('export')                   
                    ?
                <PrdExports type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.exports)} exportsVal={getData} /> : <></>
                }

                <Row gutter={10} className="table marginTop">
                    <div className="table_title">계약서 파일과 참고사항</div>
                    <Col xs={5} lg={5} className="label">
                        계약서 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Upload {...props} multiple={true}>
                            <Button className='ant-btn-etc-single' icon={<UploadOutlined />}>파일</Button>
                        </Upload>
                        <span className='accessFile'><ExclamationCircleOutlined/> 업로드 가능 확장자: png, pdf,xlsx | 용량 최대: 20MB</span>
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        기타 참고 파일
                    </Col>
                    <Col xs={19} lg={19}>
                        <Upload {...props2} multiple={true}>
                            <Button className='ant-btn-etc-single' icon={<UploadOutlined />}>파일</Button>
                        </Upload>
                        <span className='accessFile'><ExclamationCircleOutlined/> 업로드 가능 확장자: png, pdf,xlsx | 용량 최대: 20MB</span>
                    </Col>

                    <Col xs={5} lg={5} className="label">
                        계약 참고사항
                    </Col>
                    <Col xs={19} lg={19}>
                        <Input.TextArea
                            name="memo"
                            rows={4}
                            onChange={handleChangeInput('memo')}
                            value={stateData.memo}
                            autoComplete="off"
                        />
                    </Col>
                </Row>
                
            </Wrapper>
            :<></>
        }
        {/* ================================================= 해외 수입 end =================================================================== */}
        </Wrapper>
    );
});

export default contractsDrawer;