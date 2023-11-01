/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Space, Button, Row, Col,  Modal, Breadcrumb, Input, Upload,  message, Radio, Popover, Select, Typography, Checkbox, DatePicker} from 'antd';
import { UploadOutlined, ExclamationCircleOutlined  } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';
import moment from 'moment';

import PrdAudios from './info/audios';
import PrdBooks from './info/books';
import PrdEbooks from './info/ebooks';
import PrdOthers from './info/others';
import PrdExports from './info/exports';

import PopupPostCode from '@components/Common/DaumAddress';

const Wrapper = styled.div`
    width: 100%;
    `;

const DEF_STATE = {
    // DB Data
    id: '',
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

const contractsDrawer = observer(({type,selType,dataInfo,data,fileData,getCopyrights,getCopyrightsFiles,orgData, drawerClass, drawerChk}) => {
    const { commonStore } = useStore();

    const { Text } = Typography;
    const { Option } = Select;

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
    }));
    
    useEffect(() => {
        state.type= type;
        state.dataInfo= dataInfo;
        state.selType= selType;
        if(data['idx_'+dataInfo.id.id]!==undefined){
            var idata = data['idx_'+dataInfo.id.id].pivot;
            if(idata !== null && idata !== undefined){
                if(Object.keys(idata).length > 0 && idata.id !== undefined){
                    var temp_type = Object.keys(DEF_STATE);
                    temp_type.forEach((item)=>{
                        // stateData[item] = idata[item]
                        if(item === 'payment_date')  {
                            if(idata[item]===null){
                                stateData[item] = '';
                            }else{
                                stateData[item] = moment(idata[item]);
                            }
                        }else if (item === 'payment_timing_content'){
                            if(stateData['payment_timing_type']==="1"){
                                if(idata[item]===null){
                                    stateData[item] = '';
                                }else{
                                    stateData[item] = moment(idata[item]);
                                }
                                // stateData[type] = moment(idata[item]);
                            }else if(stateData['payment_timing_type']=== "2" || stateData['payment_timing_type']=== "3" ){
                                stateData[item] = idata[item];
                            }
                        }else{
                            stateData[item] = idata[item];
                        }
                    });
                }

                // 파일 컨트롤 패러미터
                // 보이는 파일 리스트(프론트) : state.selectedFile
                // 삭제 리스트(submit) : stateData.contract_files
                // 저장 리스트(백엔드) : state.addFile
                
                idata.contract_files.forEach(e => {
                    state.selectedFile = [ ...state.selectedFile, {uid: e.uid, id: e.id, name: e.file_name, file_path: e.file_path, url : '#'}]
                    stateData.contract_files = [{id:e.id, file_name: e.file_name, file_path: e.file_path, use_yn:'Y'}]
                });
                setFileList(state.selectedFile);
        
                idata.etc_files.forEach(e => {
                    state.selectedFile2 = [ ...state.selectedFile2, {uid: e.uid, id: e.id, name: e.file_name, file_path: e.file_path, url : '#'}]
                    stateData.etc_files = [{id:e.id, file_name: e.file_name, file_path: e.file_path, use_yn:'Y'}]
                });
                setFileListEtc(state.selectedFile2);
        
                stateData['ranges'] = toJS(idata['ranges'].split(', '));
                stateData['targets'] = toJS(idata['targets'].split(', '));
            }else{
                var idata = data['idx_'+dataInfo.id.id];
                if(idata !== null && idata !== undefined){
                    if(Object.keys(idata).length > 0 && idata.id !== undefined){
                        var temp_type = Object.keys(DEF_STATE);
                        temp_type.forEach((item)=>(
                            stateData[item] = idata[item]
                        ));
                    }
                }

                if(orgData!==undefined?true:false){
                    orgData.pivot.contract_files.forEach(e => {
                        state.selectedFile = [ ...state.selectedFile, {uid: e.uid, id: e.id, name: e.file_name, file_path: e.file_path, url : '#'}]
                    });
                    if(fileData){
                        fileData.contract_files.forEach(e=>{
                            state.selectedFile = [ ...state.selectedFile, e];
                        })
                        stateData.contract_files = idata.contract_files;
                        state.addFile = fileData.contract_files;

                        setFileList(state.selectedFile);
                    }

                    orgData.pivot.etc_files.forEach(e => {
                        state.selectedFile2 = [ ...state.selectedFile2, {uid: e.uid, id: e.id, name: e.file_name, file_path: e.file_path, url : '#'}]
                    });
                    if(fileData){
                        fileData.etc_files.forEach(e=>{
                            state.selectedFile2 = [ ...state.selectedFile2, e];
                        })
                        stateData.etc_files = idata.etc_files;
                        state.addFile2 = fileData.etc_files;
                        setFileListEtc(state.selectedFile2);
                    }
                }
            }
        }else{
            var idata = data['idx_'+dataInfo.id.id];
            if(idata !== null && idata !== undefined){
                if(Object.keys(idata).length > 0 && idata.id !== undefined){
                    var temp_type = Object.keys(DEF_STATE);
                    temp_type.forEach((item)=>{
                        // stateData[item] = idata[item]
                        if(item === 'payment_date')  {
                            if(idata[item]===null){
                                stateData[item] = '';
                            }else{
                                stateData[item] = moment(idata[item]);
                            }
                        }else if (item === 'payment_timing_content'){
                            if(stateData['payment_timing_type']==="1"){
                                if(idata[item]===null){
                                    stateData[item] = '';
                                }else{
                                    stateData[item] = moment(idata[item]);
                                }
                                // stateData[type] = moment(idata[item]);
                            }else if(stateData['payment_timing_type']=== "2" || stateData['payment_timing_type']=== "3" ){
                                stateData[item] = idata[item];
                            }
                        }else{
                            stateData[item] = idata[item];
                        }
                    });
                }
            }
        }

        if(orgData!==undefined){
            state.orgData={
                targets : toJS(orgData.pivot.targets.split(', ')),
                ranges : toJS(orgData.pivot.ranges.split(', '))
            };
        }else{
            state.orgData=({...DEF_STATE});
        }
        stateData.id = dataInfo.id.id;      
        getCopyrights(stateData);
        getCopyrightsFiles({id:stateData.id,contract_files:state.addFile,etc_files:state.addFile2});
    }, [type]);

    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback(
        (type) => (e) => {
            if (type === 'ranges') {
                stateData[type] = e;
                var temp_ranges = ['book','ebook','audio','other','export'];
                temp_ranges = temp_ranges.filter(x => !stateData[type].includes(x));
                temp_ranges.forEach((item)=>(
                    stateData[item+'s'] = {}
                ));
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
            getCopyrights(stateData);
        },[],
    );

    const getData = (type,data) => {
        if(type==='books'){
            stateData.books = [toJS(data)];
        } else if(type==='ebooks'){
            stateData.ebooks =[ toJS(data)];
        } else if(type==='audios'){
            stateData.audios = [toJS(data)];
        } else if(type==='others'){
            stateData.others = [toJS(data)];
        } else{
            stateData.exports = [toJS(data)];
        }
        getCopyrights(stateData);
    };

    //파일 업로드
    const [fileListEtc, setFileListEtc] = useState([]);
    const [fileList, setFileList] = useState([]);
    const props = {
        onRemove: (file) => {
            //새파일등록 재배열
            var arr = [];
            state.selectedFile.forEach(e => {
                    if(e.uid !== file.uid){
                        arr = [...arr , e]
                    }else{
                        if(e.id){
                            const element = stateData.contract_files.find(item => item.id ===e.id);
                            if(element){
                                element['use_yn'] = 'N';
                            }
                        }else{
                            stateData.contract_files = stateData.contract_files.filter(item=> item.uid !== file.uid);
                        }
                    }
            });
            state.selectedFile = arr;

            arr = [];
            state.addFile.forEach(e=> {
                if(e.uid !== file.uid){
                    arr = [...arr , e];
                }
            });
            state.addFile = arr;

            setFileList(state.selectedFile);
            getCopyrights(stateData);
            getCopyrightsFiles({id:stateData.id,contract_files:state.addFile,etc_files:state.addFile2});
        },
        beforeUpload: (file) => {
            state.selectedFile = [...state.selectedFile, file];
            state.addFile = [...state.addFile, file];

            var temp_arr = [];
            state.selectedFile.forEach(e => {
                if(e.file_path !== '' && e.file_path !== undefined){
                    temp_arr = [...temp_arr,{id: e.id, file_path : e.file_path, file_name : e.name, use_yn:'Y'}];
                }else{
                    temp_arr = [...temp_arr,e];
                }
            });
            stateData.contract_files = temp_arr;

            setFileList(state.selectedFile);
            getCopyrights(stateData);
            getCopyrightsFiles({id:stateData.id,contract_files:state.addFile,etc_files:state.addFile2});
            return false;
        },     
        fileList:fileList,
    };
    //파일 업로드
    const props2 = {
        onRemove: (file) => {
            //새파일등록 재배열
            var arr = [];
            state.selectedFile2.forEach(e => {
                    if(e.uid !== file.uid){
                        arr = [...arr , e]
                    }else{
                        if(e.id){
                            const element = stateData.etc_files.find(item => item.id ===e.id);
                            if(element){
                                element['use_yn'] = 'N';
                            }
                        }else{
                            stateData.etc_files = stateData.etc_files.filter(item=> item.uid !== file.uid);
                        }
                    }
            });
            state.selectedFile2 = arr;

            arr = [];
            state.addFile2.forEach(e=> {
                if(e.uid !== file.uid){
                    arr = [...arr , e];
                }
            });
            state.addFile2 = arr;
            setFileListEtc(state.selectedFile2);
            getCopyrights(stateData);
            getCopyrightsFiles({id:stateData.id,contract_files:state.addFile,etc_files:state.addFile2});
        },
        beforeUpload: (file) => {
            state.selectedFile2 = [...state.selectedFile2, file];
            state.addFile2 = [...state.addFile2, file];

            var temp_arr = [];
            state.selectedFile2.forEach(e => {
                if(e.file_path !== '' && e.file_path !== undefined){
                    temp_arr = [...temp_arr,{id: e.id, file_path : e.file_path, file_name : e.name, use_yn:'Y'}];
                }else{
                    temp_arr = [...temp_arr,e];
                }
            });
            stateData.etc_files = temp_arr;

            setFileListEtc(state.selectedFile2);
            getCopyrights(stateData);
            getCopyrightsFiles({id:stateData.id,contract_files:state.addFile,etc_files:state.addFile2});
            return false;
        },
        fileList:fileListEtc,     
    };

    //파일다운
    const fileReturn = (file) => {
        fileDown(file)
    } 
    const fileDown = useCallback(async (data)=> {    

        var axios = require('axios');                  

        var config={
            method:'POST',
            url:'/contract/fileDown',
            responseType: 'blob',
            headers:{
                'Content-Type': 'multipart/form-data',
            },
                data:data
            };
                        
        axios(config)
        .then(function(response){
            const blob = new Blob([response.data]);
            // 특정 타입을 정의해야 경우에는 옵션을 사용해 MIME 유형을 정의 할 수 있습니다.
            // const blob = new Blob([this.content], {type: 'text/plain'})

            // blob을 사용해 객체 URL을 생성합니다.
            const fileObjectUrl = window.URL.createObjectURL(blob);

            // blob 객체 URL을 설정할 링크를 만듭니다.
            const link = document.createElement("a");
            link.href = fileObjectUrl;
            link.style.display = "none";

            // 다운로드 파일 이름을 지정 할 수 있습니다.
            // 일반적으로 서버에서 전달해준 파일 이름은 응답 Header의 Content-Disposition에 설정됩니다.
            link.download = data.name;
            document.body.appendChild(link);
            link.click();
            link.remove();

            // 다운로드가 끝난 리소스(객체 URL)를 해제합니다.
            window.URL.revokeObjectURL(fileObjectUrl);
        })
        .catch(function(error){
            console.log(error.response) 
            Modal.error({
                title: '오류가 발생했습니다. 재시도해주세요.',
                content: '오류코드:'+error.response.status,  
            });
           
        });

    }, []); 

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
                            저작권 대상 <span className="spanStar">*</span>
                        </Col>
                        <Col xs={19} lg={19}>  
                            <Checkbox.Group 
                                style={{ width: '100%' }} 
                                onChange={handleChangeInput('targets')}
                                value={stateData.targets}
                            >
                                <Checkbox value="본문" disabled={toJS(state.orgData.targets).includes('본문')}>본문</Checkbox>
                                <Checkbox value="번역" disabled={toJS(state.orgData.targets).includes('번역')}>번역</Checkbox>
                                <Checkbox value="삽화" disabled={toJS(state.orgData.targets).includes('삽화')}>삽화</Checkbox>
                                <Checkbox value="사진" disabled={toJS(state.orgData.targets).includes('사진')}>사진</Checkbox>
                                <Checkbox value="동영상강좌" disabled={toJS(state.orgData.targets).includes('동영상강좌')}>동영상 강좌</Checkbox>
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
                                <Checkbox value="book" disabled={toJS(state.orgData.ranges).includes('book')}>종이책</Checkbox>
                                <Checkbox value="ebook" disabled={toJS(state.orgData.ranges).includes('ebook')}>전자책</Checkbox>
                                <Checkbox value="audio" disabled={toJS(state.orgData.ranges).includes('audio')}>오디오북</Checkbox>
                                <Checkbox value="other" disabled={toJS(state.orgData.ranges).includes('other')}>2차 저작권(동영상 강좌 포함)</Checkbox>
                                <Checkbox value="export" disabled={toJS(state.orgData.ranges).includes('export')}>수출 저작권</Checkbox>
                            </Checkbox.Group>
                        </Col>
                        <Col xs={5} lg={5} className="label">
                            저작권 양도 계약 <span className="spanStar">*</span>
                        </Col>
                        <Col xs={19} lg={19}>
                            {dataInfo.id.add_chk ? 
                            <Radio.Group
                                value={stateData['contract_transfer']}
                                onChange={handleChangeInput('contract_transfer')}
                            >
                            <Radio value="N">아님(No)</Radio>
                            <Radio value="Y">맞음(Yes)</Radio>

                            </Radio.Group>
                            :
                            <>{stateData.contract_transfer==='Y'?'맞음(Yes)':'아님(No)'}</>
                            }
                        </Col>
                        <Col xs={5} lg={5} className="label">
                            저작권료 일괄 지급(매절) <span className="spanStar">*</span>
                        </Col>
                        <Col xs={19} lg={19}>
                            {dataInfo.id.add_chk ? 
                            <Radio.Group
                                value={stateData['copyright_fee_lump_sum']}
                                onChange={handleChangeInput('copyright_fee_lump_sum')}
                            >
                            <Radio value="N">아님(No)</Radio>
                            <Radio value="Y">맞음(Yes)</Radio>

                            </Radio.Group>
                            :
                            <>{stateData.copyright_fee_lump_sum==='Y'?'맞음(Yes)':'아님(No)'}</>
                            }
                        </Col>
                    </Row>

            {stateData.copyright_fee_lump_sum !== 'Y' ?
                <>
                {stateData.ranges.includes('book')
                    ?
                <PrdBooks type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.books[0])} booksVal={getData} drawerClass={drawerClass} drawerChk={drawerChk}/> : <></>
                }

                {stateData.ranges.includes('ebook')
                    ?
                <PrdEbooks type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.ebooks[0])} ebooksVal={getData} drawerClass={drawerClass} drawerChk={drawerChk}/> : <></>
                }

                {stateData.ranges.includes('audio')
                    ?
                <PrdAudios type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.audios[0])} audiosVal={getData} drawerClass={drawerClass} drawerChk={drawerChk}/> : <></>
                }

                {stateData.ranges.includes('other')
                    ?
                <PrdOthers type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.others[0])} othersVal={getData} /> : <></>
                }

                {stateData.ranges.includes('export')                   
                    ?
                <PrdExports type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.exports[0])} exportsVal={getData} /> : <></>
                }
                </>
                :
                <></>
            }
                {stateData.copyright_fee_lump_sum ==='Y' ?
                    <Row gutter={10} className="table marginTop">
                        <div className="table_title">저작권료 일괄 지급(매절) 정보</div>
                        <Col xs={5} lg={5} className="label">
                            전체 금액 <span className="spanStar">*</span>     
                        </Col>
                        <Col xs={19} lg={19}>
                            <Input type="text" name="total_amount" value={stateData.total_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={handleChangeInput('total_amount')} autoComplete="off" style={{width:'10%'}}/>원
                        </Col>
                        <Col xs={5} lg={5} className="label">
                            계약금과 지급 기한 <span className="spanStar">*</span>
                        </Col>
                        <Col xs={19} lg={19}>
                            <Input type="text" name="payment" value={stateData.payment.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={handleChangeInput('payment')} autoComplete="off" style={{width:'10%'}}/>원을 &nbsp;
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
                        <Upload multiple={true} onPreview={fileReturn} {...props}>
                            <Button className='ant-btn-etc-single' icon={<UploadOutlined />}>파일</Button>
                        </Upload>
                        <span className='accessFile'><ExclamationCircleOutlined/> 업로드 가능 확장자: png, pdf,xlsx | 용량 최대: 20MB</span>
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        기타 참고 파일
                    </Col>
                    <Col xs={19} lg={19}>
                        <Upload multiple={true} onPreview={fileReturn} {...props2}>
                            <Button className='ant-btn-etc-single' icon={<UploadOutlined />}>파일</Button>
                        </Upload>
                        <span className='accessFile'><ExclamationCircleOutlined/> 업로드 가능 확장자: png, pdf,xlsx | 용량 최대: 20MB</span>
                    </Col>

                    <Col xs={5} lg={5} className="label">
                        계약 참고사항
                    </Col>
                    <Col xs={19} lg={19}>
                        <Input.TextArea
                            name="contract_memo"
                            rows={4}
                            onChange={handleChangeInput('contract_memo')}
                            value={stateData.contract_memo}
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

                {/* {stateData.ranges.includes('book')
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
                } */}
                {stateData.copyright_fee_lump_sum ==='Y'                     
                    ?
                <Row gutter={10} className="table marginTop">
                    <div className="table_title">저작권료 일괄 지급(매절) 정보</div>
                    <Col xs={5} lg={5} className="label">
                        전체 금액 <span className="spanStar">*</span>     
                    </Col>
                    <Col xs={19} lg={19}>
                        <Input type="text" name="total_amount" value={stateData.total_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={handleChangeInput('total_amount')} autoComplete="off" style={{width:'10%'}}/>원
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        계약금과 지급 기한 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Input type="text" name="payment" value={stateData.payment.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={handleChangeInput('payment')} autoComplete="off" style={{width:'10%'}}/>원을 &nbsp;
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
                        <Upload {...props} multiple={true} onPreview={fileReturn} >
                            <Button className='ant-btn-etc-single' icon={<UploadOutlined />}>파일</Button>
                        </Upload>
                        <span className='accessFile'><ExclamationCircleOutlined/> 업로드 가능 확장자: png, pdf,xlsx | 용량 최대: 20MB</span>
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        기타 참고 파일
                    </Col>
                    <Col xs={19} lg={19}>
                        <Upload {...props2} multiple={true} onPreview={fileReturn} >
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