/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Space, Button, Row, Col,  Modal, Breadcrumb, Input, Upload,  message, Radio, Popover, Select, Typography, Checkbox, DatePicker} from 'antd';
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

import PopupPostCode from '@components/Common/DaumAddress';

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

const overseasInfo = observer(({type,selType,dataInfo,data,getowners,getownersFiles}) => {
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
        oldFile:[],
        delFile:[],
        addFile:[],

        selectedFile2:[],
        oldFile2:[],
        delFile2:[],
        addFile2:[],
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
            }else{
                stateData[type] = e.target.value;
            }               
            getowners(stateData);
        },[],
    );

    const getData = (type,data) => {
        if(type==='books'){
            stateData.books = toJS(data);
        } else if(type==='ebooks'){
            stateData.ebooks = toJS(data);
        } else if(type==='audios'){
            stateData.audios = toJS(data);
        }
        if(state.set_init.range){
            handleInit(type,data);
        }else{
            state.set_init.range = type.slice(0, -1);
            handleInit(type,data);
        }
        getowners(stateData);
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
        getowners(stateData);
    };

    //파일 업로드
    const [fileList, setFileList] = useState([]);
    const props = {
        onRemove: (file) => {
            const index = state.selectedFile.indexOf(file);
            state.delFile = [...state.delFile, state.selectedFile[index]]

            const newFileList = state.selectedFile.slice();
            newFileList.splice(index, 1);
            state.selectedFile = newFileList;           
            setFileList(newFileList);

            //새파일등록 재배열
            var arr = [];
            state.selectedFile.forEach(e => {
                state.addFile.forEach(a=> {
                    if(e.uid === a.uid){
                        arr = [...arr , a]
                    }
                });
            });
            state.addFile = arr;
            getownersFiles({id:stateData.id,contract_files:state.addFile,etc_files:state.addFile2});
        },
        beforeUpload: (file) => {
            state.selectedFile = [...state.selectedFile, file];
            state.addFile = [...state.addFile, file];
            setFileList(state.selectedFile);
            getownersFiles({id:stateData.id,contract_files:state.addFile,etc_files:state.addFile2});
            return false;
        },
        fileList,       
    };

    //파일 업로드
    const [fileList2, setFileList2] = useState([]);
    const props2 = {
        onRemove: (file) => {
            const index = state.selectedFile2.indexOf(file);
            state.delFile2 = [...state.delFile2, state.selectedFile2[index]]

            const newFileList2 = state.selectedFile2.slice();
            newFileList2.splice(index, 1);
            state.selectedFile2 = newFileList2;           
            setFileList2(newFileList2);

            //새파일등록 재배열
            var arr = [];
            state.selectedFile2.forEach(e => {
                state.addFile2.forEach(a=> {
                    if(e.uid === a.uid){
                        arr = [...arr , a]
                    }
                });
            });
            state.addFile2 = arr;
            getownersFiles({id:stateData.id,contract_files:state.addFile,etc_files:state.addFile2});
        },
        beforeUpload: (file) => {
            state.selectedFile2 = [...state.selectedFile2, file];
            state.addFile2 = [...state.addFile2, file];
            setFileList2(state.selectedFile2);
            getownersFiles({id:stateData.id,contract_files:state.addFile,etc_files:state.addFile2});
            return false;
        },
        fileList2,       
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
        {/* ================================================= 해외 수입 ======================================================================= */}
        {state.type ==='overseas'                     
                ?
                <Wrapper>
                    <Row gutter={10} className="table marginTop">
                        <div className="table_title">세부 계약의 기본 정보</div>
                        <Col xs={5} lg={5} className="label">
                            권리자
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
                            </Select> */}
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

                <Row gutter={10} className="table marginTop">
                    <div className="table_title">계약서 파일과 참고사항</div>
                    <Col xs={5} lg={5} className="label">
                        계약서 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Upload {...props} multiple={true} onPreview={fileReturn}>
                            <Button className='ant-btn-etc-single' icon={<UploadOutlined />}>파일</Button>
                        </Upload>
                        <span className='accessFile'><ExclamationCircleOutlined/> 업로드 가능 확장자: png, pdf,xlsx | 용량 최대: 20MB</span>
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        기타 참고 파일
                    </Col>
                    <Col xs={19} lg={19}>
                        <Upload {...props2} multiple={true} onPreview={fileReturn}>
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

export default overseasInfo;