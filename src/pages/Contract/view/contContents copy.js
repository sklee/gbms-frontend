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

import PrdAddBooks from './info/books';
import PrdAddAudios from './info/audios';
import PrdAddEbooks from './info/ebooks';
import PrdAddOthers from './info/others';
import PrdAddExports from './info/exports';

import PrdAudios from './contents/audios';
import PrdBooks from './contents/books';
import PrdEbooks from './contents/ebooks';
import PrdOthers from './contents/others';
import PrdExports from './contents/exports';

import ContCancel from './contents/closes';

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
    books: [],
    ebooks: [],
    audios: [],
    others: [],
    exports: []
};

const CLOSE_STATE = {
    // DB Data
    end_date: "",
    close_type: "",
    settlement_copyright_fee_type: "",
    reason_memo: "",
    progress_memo: "",
    loss_price: "",
    detail_memo: "",
    created_at:"",
    contract_managers:[]
};

const contractsDrawer = observer(({idx,type,selType,dataInfo,data,fileData,getCopyrights,getCopyrightsFiles,orgData,drawerClass,drawerChk}) => {
    const { commonStore } = useStore();
    const { confirm } = Modal;

    const { Text } = Typography;
    const { Option } = Select;

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 
    const closeData = useLocalStore(() => ({ ...CLOSE_STATE })); 

    const state = useLocalStore(() => ({
        type: '',           //api 타입           
        dataInfo: '',       //저작권자 정보
        selType : '',       //저작권 구분    
        chkData : [],       //계약범위 데이터
        close_state : '',

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
        state.close_state = orgData?.pivot.contract_close_yn ? orgData.pivot.contract_close_yn : 'N';
        if(data['idx_'+dataInfo.id.id]!==undefined){
            var idata = data['idx_'+dataInfo.id.id].pivot;
            if(idata !== null && idata !== undefined){
                //수정 페이지 초기화
                if(Object.keys(idata).length > 0 && idata.id !== undefined){
                    var temp_type = Object.keys(DEF_STATE);
                    temp_type.forEach((item)=>(
                        stateData[item] = idata[item]
                    ));
                }
                idata.contract_files.forEach(e => {
                    state.selectedFile = [ ...state.selectedFile, {uid: e.uid, id: e.id, name: e.file_name, file_path: e.file_path, url : '#',status:'error',response:'수정불가'}]
                    stateData.contract_files = [{id:e.id, file_name: e.file_name, file_path: e.file_path, use_yn:'Y'}]
                });
                setFileList(state.selectedFile);
        
                idata.etc_files.forEach(e => {
                    state.selectedFile2 = [ ...state.selectedFile2, {uid: e.uid, id: e.id, name: e.file_name, file_path: e.file_path, url : '#',status:'error',response:'수정불가'}]
                    stateData.etc_files = [{id:e.id, file_name: e.file_name, file_path: e.file_path, use_yn:'Y'}]
                });
                setFileListEtc(state.selectedFile2);
        
                stateData['ranges'] = toJS(idata['ranges'].split(', '));
                stateData['targets'] = toJS(idata['targets'].split(', '));
            }else{
                //수정 페이지 재호출
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
                        state.selectedFile = [ ...state.selectedFile, {uid: e.uid, id: e.id, name: e.file_name, file_path: e.file_path, url : '#',status:'error',response:'수정불가'}]
                    });
                    fileData.contract_files.forEach(e=>{
                        state.selectedFile = [ ...state.selectedFile, e];
                    })
                    stateData.contract_files = idata.contract_files;
                    state.addFile = fileData.contract_files;
    
                    setFileList(state.selectedFile);

                    orgData.pivot.etc_files.forEach(e => {
                        state.selectedFile2 = [ ...state.selectedFile2, {uid: e.uid, id: e.id, name: e.file_name, file_path: e.file_path, url : '#',status:'error',response:'수정불가'}]
                    });
                    fileData.etc_files.forEach(e=>{
                        state.selectedFile2 = [ ...state.selectedFile2, e];
                    })
                    stateData.etc_files = idata.etc_files;
                    state.addFile2 = fileData.etc_files;
                    setFileListEtc(state.selectedFile2);
                }
            }
        }else{
            //첫 등록
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
                        }else if (type === 'payment_timing_content'){
                            if(stateData['payment_timing_type']==="1"){
                                stateData[type] = moment(idata[item]);;
                            }else if(stateData['payment_timing_type']=== "2" || stateData['payment_timing_type']=== "3" ){
                                stateData[type] = idata[item];
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
        if(orgData?.pivot.contract_close_yn!=='N'){
            closeApiData(idx);
        }
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
                    stateData[item+'s'] = []
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
            }else{
                stateData[type] = e.target.value;
            }
            getCopyrights(stateData);
        },[],
    );

    const getData = (type,data) => {
        if(stateData[type].length===0||stateData[type].length===undefined){
            stateData[type] = [toJS(data)];
        }else{
            stateData[type].map((obj,idx) => {
                if(obj.id===data.id){
                    stateData[type][idx]=[toJS(data)];
                }
            });
        }

        getCopyrights(stateData);
    };

    //해지 정보
    const closeApiData = useCallback(async (idx) => {
        const data = {copyright_id:stateData.id};

        // var json = JSON.stringify(data);

        var axios = require('axios');
        var config={
            method:'GET',
            url:process.env.REACT_APP_API_URL +'/api/v1/contracts-close/'+idx,
            headers:{
                'Accept':'application/json',
            },
            params: data,
            };
        axios(config)
        .then(function(response){
            if(response.data.data.id != ''){
                var temp_type = Object.keys(CLOSE_STATE);
                temp_type.forEach((item)=>{
                    if(item === 'contract_managers'){
                        var temp_type2 = ['id','name','team'];
                        response.data.data.contract_managers.map((obj)=>{
                            var temp_manager = {};
                            temp_type2.forEach((item2)=>{
                                temp_manager[item2] = obj[item2];
                            });
                            closeData.contract_managers = [...closeData.contract_managers,temp_manager];
                        });
                    }else{
                        closeData[item] = response.data.data[item];
                    }
                });
            }else{
                Modal.error({
                    content:(<div>
                                <p>호출시 문제가 발생하였습니다.</p>
                                <p>재시도해주세요.</p>
                                <p>오류코드: {response.data.error}</p>
                            </div>)
                });  
            }
        })
        .catch(function(error){
            console.log(error);
            Modal.error({
                title : (<div>호출시 문제가 발생하였습니다.<br/>재시도해주세요.</div>)
            });  
        });  

    }, []);

    const handleCheck = (e) => {
        var chk = e.target.value;
        if(chk==='Y'){
            confirm({
                title: '해지 확정',
                content: "결재까지 모두 끝났나요? 해지를 확정하면 취소할 수 없습니다. 계속하려면 '확인'을 선택해 주세요.",    
                onOk() {
                    apiClose(chk);
                },    
                onCancel() {
                    return false;      
                },
            });
        }else if(chk==='N'){
            confirm({
                title: '해지 취소',
                content: "해지 등록한 내용이 모두 삭제됩니다. 계속하려면 ‘확인'을 선택해 주세요.",    
                onOk() {
                    apiClose(chk);
                },    
                onCancel() {
                    return false;      
                },
            });
        }else{

        }
    };

    const apiClose = useCallback(async (e)=> {
        const data = {copyright_id:'',contract_close_yn:''};
        data.copyright_id=stateData.id;
        data.contract_close_yn = e;

        // var json = JSON.stringify(data);

        var axios = require('axios');

        var config={
            method:'POST',
            url:process.env.REACT_APP_API_URL +'/api/v1/contracts-close/'+idx,
            headers:{
                'Accept':'application/json',
            },
                data:data
            };
            
        axios(config)
        .then(function(response){
            if(response.data.id != ''){
                Modal.success({
                    title: response.data.result,
                    onOk(){
                        addOnCancelClose();
                    },
                });
            }else{
                Modal.error({
                    content:(<div>
                                <p>등록시 문제가 발생하였습니다.</p>
                                <p>재시도해주세요.</p>
                                <p>오류코드: {response.data.error}</p>
                            </div>)
                });  
            }
        })
        .catch(function(error){
            console.log(error);
            Modal.error({
                title : (<div>등록시 문제가 발생하였습니다.<br/>재시도해주세요.</div>)
            });  
        });   
    }, []);

    const [viewCancelVisible, setViewCancelVisible] = useState(false);
    //재계약
    const showCancelDrawer = (e) => {
        setViewCancelVisible(true);
        // state.search_type = search_type;
    };

    const addOnCancelClose = () => {
        setViewCancelVisible(false);
        stateData.id = '';
        getCopyrights(stateData);
    };

    //파일 업로드
    const [fileListEtc, setFileListEtc] = useState([]);
    const [fileList, setFileList] = useState([]);
    const props = {
        onRemove: (file) => {
            if(file.status==='error'){
                return false;
            }
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
            if(file.status==='error'){
                return false;
            }
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
                        <div className="table_title">세부 계약의 기본 정보 (계약 내용)</div>
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
                                disabled={state.close_state==='N'?false:true}
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
                                disabled={state.close_state==='N'?false:true}
                            >
                                <Checkbox value="book" disabled={toJS(state.orgData.ranges).includes('book')}>종이책</Checkbox>
                                <Checkbox value="ebook" disabled={toJS(state.orgData.ranges).includes('ebook')}>전자책</Checkbox>
                                <Checkbox value="audio" disabled={toJS(state.orgData.ranges).includes('audio')}>오디오북</Checkbox>
                                <Checkbox value="other" disabled={toJS(state.orgData.ranges).includes('other')}>2차 저작권(동영상 강좌 포함)</Checkbox>
                                <Checkbox value="export" disabled={toJS(state.orgData.ranges).includes('export')}>수출 저작권</Checkbox>
                            </Checkbox.Group>
                        </Col>
                        <Col xs={5} lg={5} className="label">
                            저작권 양도 계약
                        </Col>
                        <Col xs={19} lg={19}>
                            {stateData.contract_transfer==='Y'?'맞음(Yes)':'아님(No)'}
                        </Col>
                        <Col xs={5} lg={5} className="label">
                            저작권료 일괄 지급(매절)
                        </Col>
                        <Col xs={19} lg={19}>
                            {stateData.copyright_fee_lump_sum==='Y'?'맞음(Yes)':'아님(No)'}
                        </Col>
                        {state.close_state==='N' &&
                            <Col xs={5} lg={5} className="label">
                                계약 변경
                            </Col>
                        }
                        {state.close_state==='N' &&
                            <Col xs={19} lg={19}>
                            <Radio.Group
                            >
                            <Radio value="cancel" onClick={e=>showCancelDrawer()}>이 저작권자의 계약 해지</Radio>
                            </Radio.Group>
                            </Col>
                        }
                    </Row>    

                {stateData.ranges.includes('book')
                    ? stateData.books.length===0||stateData.books.length===undefined?
                        <PrdAddBooks type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.books)} booksVal={getData} drawerClass={drawerClass} drawerChk={drawerChk}/>
                    :   stateData.books.map(obj => {
                            return <PrdBooks type={state.type} selType={state.selType} states={state.close_state} copyId={{id:idx,copy_id:stateData.id}} data={toJS(obj)} booksVal={getData} drawerClass={drawerClass} drawerChk={drawerChk}/>;
                        })
                    :<></>
                }

                {stateData.ranges.includes('ebook')
                    ? stateData.ebooks.length===0||stateData.ebooks.length===undefined?
                        <PrdAddEbooks type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.ebooks)} ebooksVal={getData} drawerClass={drawerClass} drawerChk={drawerChk}/>
                    :   stateData.ebooks.map(obj => {
                            return <PrdEbooks type={state.type} selType={state.selType} states={state.close_state} copyId={{id:idx,copy_id:stateData.id}} data={toJS(obj)} ebooksVal={getData} drawerClass={drawerClass} drawerChk={drawerChk}/>;
                        })
                    :<></>
                // <PrdEbooks type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.ebooks[0])} ebooksVal={getData} /> : <></>
                }

                {stateData.ranges.includes('audio')
                    ? stateData.audios.length===0||stateData.audios.length===undefined?
                        <PrdAddAudios type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.audios)} audiosVal={getData} drawerClass={drawerClass} drawerChk={drawerChk}/>
                    :   stateData.audios.map(obj => {
                            return <PrdAudios type={state.type} selType={state.selType} states={state.close_state} copyId={{id:idx,copy_id:stateData.id}} data={toJS(obj)} audiosVal={getData} drawerClass={drawerClass} drawerChk={drawerChk}/>;
                        })
                    :<></>
                // <PrdAudios type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.audios[0])} audiosVal={getData} /> : <></>
                }

                {stateData.ranges.includes('other')
                    ? stateData.others.length===0||stateData.others.length===undefined?
                        <PrdAddOthers type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.others)} othersVal={getData} />
                    :   stateData.others.map(obj => {
                            return <PrdOthers type={state.type} selType={state.selType} states={state.close_state} copyId={{id:idx,copy_id:stateData.id}} data={toJS(obj)} othersVal={getData} />;
                        })
                    :<></>
                // <PrdOthers type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.others[0])} othersVal={getData} /> : <></>
                }

                {stateData.ranges.includes('export')                   
                    ? stateData.exports.length===0||stateData.exports.length===undefined?
                        <PrdAddExports type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.exports)} exportsVal={getData} />
                    :   stateData.exports.map(obj => {
                            return <PrdExports type={state.type} selType={state.selType} states={state.close_state} copyId={{id:idx,copy_id:stateData.id}} data={toJS(obj)} exportsVal={getData} />;
                        })
                    :<></>
                // <PrdExports type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.exports[0])} exportsVal={getData} /> : <></>
                }
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
                        <Upload multiple={true} onPreview={fileReturn} {...props}>
                            {state.close_state==='N' &&
                            <Button className='ant-btn-etc-single' icon={<UploadOutlined />}>파일</Button>
                            }
                        </Upload>
                        <span className='accessFile'><ExclamationCircleOutlined/> 업로드 가능 확장자: png, pdf,xlsx | 용량 최대: 20MB</span>
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        기타 참고 파일
                    </Col>
                    <Col xs={19} lg={19}>
                        <Upload multiple={true} onPreview={fileReturn} {...props2}>
                            {state.close_state==='N' &&
                            <Button className='ant-btn-etc-single' icon={<UploadOutlined />}>파일</Button>
                            }
                        </Upload>
                        <span className='accessFile'><ExclamationCircleOutlined/> 업로드 가능 확장자: png, pdf,xlsx | 용량 최대: 20MB</span>
                    </Col>

                    <Col xs={5} lg={5} className="label">
                        계약 참고사항
                    </Col>
                    {state.close_state==='N'?
                    <Col xs={19} lg={19}>
                        <Input.TextArea
                            name="contract_memo"
                            rows={4}
                            onChange={handleChangeInput('contract_memo')}
                            value={stateData.contract_memo}
                            autoComplete="off"
                        />
                    </Col>
                    :
                    <Col xs={19} lg={19}>
                        {stateData.contract_memo}
                    </Col>
                    }
                </Row>

                <Row gutter={10} className="table marginTop">
                    <div className="table_title">검수, 정산 정보</div>
                    <Col xs={5} lg={5} className="label">
                        기타 참고사항
                    </Col>
                    {state.close_state==='N'?
                    <Col xs={19} lg={19}>
                        <Input.TextArea
                            name="check_memo"
                            rows={4}
                            onChange={handleChangeInput('check_memo')}
                            value={stateData.check_memo}
                            autoComplete="off"
                        /> 
                    </Col>   
                    :
                    <Col xs={19} lg={19}>
                        {stateData.check_memo} 
                    </Col> 
                    }
                </Row>

                {orgData?.pivot.contract_close_yn==='Y' || orgData?.pivot.contract_close_yn==='W' &&
                <Row gutter={10} className="table marginTop">
                    <div className="table_title">계약 해지 정보</div>
                    <Col xs={5} lg={5} className="label">
                            해지 적용일
                        </Col>
                    <Col xs={19} lg={19}>
                        {closeData.end_date}
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        해지 사유 책임(귀속)
                    </Col>
                    <Col xs={19} lg={19}>
                        {closeData.close_type==='1'?'본사':null}
                        {closeData.close_type==='2'?'저작권자':null}
                        {closeData.close_type==='3'?'공동/합의':null}
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        저작권료/비용 정산
                    </Col>
                    <Col xs={19} lg={19}>
                        {closeData.settlement_copyright_fee_type==='1'?'지급한 금액 손실 처리':null}
                        {closeData.settlement_copyright_fee_type==='2'?'본사가 지급할 금액 있음':null}
                        {closeData.settlement_copyright_fee_type==='3'?'본사가 회수할 금액 있음':null}
                        {closeData.settlement_copyright_fee_type==='3'?'정산할 금액 없음':null}
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        해지 사유
                    </Col>
                    <Col xs={19} lg={19}>
                        {closeData.reason_memo}
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        진행 경과
                    </Col>
                    <Col xs={19} lg={19}>
                        {closeData.progress_memo}
                    </Col>
                    {closeData.settlement_copyright_fee_type!=='4'?
                        <Col xs={5} lg={5} className="label">
                            {closeData.settlement_copyright_fee_type==='1'?'손실 처리할 금액과 세부 내역':null}
                            {closeData.settlement_copyright_fee_type==='2'?'본사가 지급할 금액과 세부 내역':null}
                            {closeData.settlement_copyright_fee_type==='3'?'본사가 회수할 금액과 세부 내역':null}
                        </Col>
                        :<></>}
                    {closeData.settlement_copyright_fee_type!=='4'?
                    <Col xs={19} lg={19}>
                        {closeData.loss_price}원 <br/>
                        {closeData.detail_memo}
                    </Col>
                    :<></>}
                    <Col xs={5} lg={5} className="label">
                        담당자와 등록일  
                    </Col>
                    <Col xs={19} lg={19}>
                    {closeData.contract_managers.map((e)=>(e.name+"  "))}
                    ({closeData.created_at})
                    </Col>
                    {orgData?.pivot.contract_close_yn==='W' &&
                    <Col xs={5} lg={5} className="label">
                        해지 등록 처리 
                    </Col>
                    }
                    {orgData?.pivot.contract_close_yn==='W' &&
                    <Col xs={19} lg={19}>
                        <Radio.Group>
                            <Radio value="Y" onClick={(e)=>handleCheck(e)}>확정</Radio>
                            <Radio value="N" onClick={(e)=>handleCheck(e)}>해지 등록 취소</Radio>
                        </Radio.Group>
                    </Col>
                    }
                </Row>
                }
                {viewCancelVisible === true && (
                    <ContCancel
                        idx={idx}
                        type={state.type} 
                        // selType={state.sel_type} 
                        // states={'insert'}
                        data={stateData}
                        visible={viewCancelVisible}
                        onClose={addOnCancelClose}
                    />
                )}
            </Wrapper>
            :<></>
        }
        {/* ================================================= 국내 / 해외 직계약 end ========================================================== */}
        </Wrapper>
    );
});

export default contractsDrawer;