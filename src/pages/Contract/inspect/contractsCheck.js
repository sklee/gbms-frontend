/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Space, Button, Row, Col,  Modal, Breadcrumb, Input, Upload,  message, Radio, Popover, Select, Typography, Checkbox, DatePicker} from 'antd';
import { PhoneOutlined ,QuestionOutlined, UploadOutlined, PlusOutlined, CloseOutlined  } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled, { ServerStyleSheet } from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';
import moment from 'moment';

import ContractInfo from './contInfo';
import AddHolder from '../Search';
import * as ValidationCheck from '../Validator/inspect.js';
import { ExceptionMap } from 'antd/lib/result';

const Wrapper = styled.div`
    width: 100%;
    `;

const DEF_STATE = {
    // DB Data
    id : '',
    company: '',
    type: '',
    name: '',
    copyrights: []
};

const contractsDrawer = observer(({idx, type, onClose, tabChk, reset, drawerClass, drawerChk}) => {
    const { commonStore } = useStore();

    const { confirm } = Modal;
    
    const { Text } = Typography;
    const { Option } = Select;

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 
    const stateFile = useLocalStore(() => ([])); 

    const state = useLocalStore(() => ({
        idx: '',
        type: '',               //api 타입            
        copyrights : [],        //저작권자/권리자 리스트
        created_info:'',         //등록자
        check_info:'',         //검수자
        memberOption: [],       //담당자 회원 리스트
        showDetails : '',       //선택된 저작권자
        search_type : '',       //저작권 구분
        reset : true,
        data : {},
        orgData : {},

        submitType : 'T',
    }));
    
    useEffect(() => {       
        state.idx = idx;
        state.type= type;
        fetchData(state.idx);
    }, [type]);

    const fetchData = useCallback(async (idx) => {
        if(state.type==='contracts-check'){
            var api_url = 'contracts';
        }else if(state.type==='overseas-check'){
            var api_url = 'overseas';
        }else{
            var api_url = state.type;
        }

        const result = await axios.get(
          process.env.REACT_APP_API_URL +'/api/v1/'+api_url+'/'+idx,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          },
        )
        if (result.data.data) {      
            state.data = result.data.data;
            state.created_info = result.data.data.created_info.name;
            state.check_info = result.data.data.check_info.name;
            stateData.id = result.data.data.id;
            stateData.type = result.data.data.type;
            stateData.name = result.data.data.name;
            stateData.company = result.data.data.company;
            result.data.data.copyrights.forEach((e) =>{
                // stateData.copyrights['idx_'+e.id] = e;
                // state.orgData['idx_'+e.id] = e;
                // state.copyrights = state.copyrights.concat({id:e.id,name:e.name});
                // var temp_type = Object.keys(stateData.copyrights['idx_'+e.id].pivot);
                // var temp_arr = {};
                // temp_type.forEach((item)=>{
                //     temp_arr[item] = stateData.copyrights['idx_'+e.id].pivot[item];
                //     if(item ==='id'){
                //         temp_arr['id'] = stateData.copyrights['idx_'+e.id].pivot['copyright_id'];
                //     }
                // });
                // temp_arr['ranges'] = toJS(temp_arr['ranges'].split(', '));
                // temp_arr['targets'] = toJS(temp_arr['targets'].split(', '));
                // stateData.copyrights['idx_'+e.id] = toJS(temp_arr);
                // stateFile['idx_'+e.id] = {contract_files:undefined,etc_files:undefined};

                stateData.copyrights['idx_'+e.id] = e;
                state.orgData['idx_'+e.id] = e;
                // state.copyrights = state.copyrights.concat(state.copyrights,{id:e.id,name:e.name});
                state.copyrights = [...state.copyrights,{id:e.id,name:e.name}];
            });
            state.showDetails = result.data.data.copyrights[0].id;
            // state.showDetails = '';
        }
      }, []);

    const visibleClose = () => {
        //데이터 초기화
        for (const key in DEF_STATE) {
            stateData[key] = DEF_STATE[key];
        }
        onClose(false);
    };    
    //추가 후 리스트 리셋
    const resetChk = ()=>{
        reset(true);
    }

    const [viewSearchVisible, setViewSearchVisible] = useState(false);

    const getCopyrights = (data) => {
        stateData.copyrights['idx_'+data.id] = toJS(data);
    };

     //search drawer 닫기
    const addOnClose = () => {
        setViewSearchVisible(false);
    };

    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback(
        (type) => (e) => {
            stateData[type] = e.target.value;
            if(type==='type'){
                state.showDetails = '';
            }
        },[],
    );

    //파일
    const getCopyrightsFiles = (file) => {
        stateFile['idx_'+file.id] = file;
    };

    const fileUpload = useCallback(async (file,idx) => {
        const formData = new FormData();
        formData.append('type', state.type);
        if(file.contract_files.length>0){
            toJS(file.contract_files).forEach((item) => {
                formData.append('files[]', item);
            });
        }
        if(file.etc_files.length>0){
            toJS(file.etc_files).forEach((item2) => {
                formData.append('files_etc[]', item2);
            });
        }

        var axios = require('axios');

        var config = {
            method: 'POST',
            url: '/contract/file_upload',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            data: formData,
        };

        axios(config)
        .then((res) => {
            if(res.data.length === 0 || (res.data.error !== '' && res.data.error !== undefined)){
                Modal.error({
                    title: '파일 등록시 오류가 발생하였습니다.',
                    content: res.data.error,
                });
            }else{
                if(res.data.contract_files !== undefined){
                    var temp_arr = stateData.copyrights['idx_'+state.showDetails].contract_files;
                    temp_arr = temp_arr.filter(x =>x.use_yn && x.use_yn=='N');
                    var temp_res = res.data.contract_files;
                    temp_res.forEach(e => {
                        var temp = {'file_path':e.file_path,'file_name':e.file_name}
                        temp_arr = [...temp_arr,temp];
                    });
                    stateData.copyrights['idx_'+state.showDetails].contract_files = temp_arr;
                }

                if(res.data.etc_files !== undefined){
                    var temp_arr2 = stateData.copyrights['idx_'+state.showDetails].etc_files;
                    temp_arr = temp_arr.filter(x =>x.use_yn && x.use_yn=='N');
                    var temp_res2 = res.data.etc_files;
                    temp_res2.forEach(e => {
                        var temp2 = {'file_path':e.file_path,'file_name':e.file_name}
                        temp_arr2 = [...temp_arr2,temp2];
                    });
                    stateData.copyrights['idx_'+state.showDetails].etc_files = temp_arr2;
                }

                // apiSubmit();
                if(state.submitType==='T'){
                    apiSubmit();
                }else if(state.submitType==='C'){
                    complete_apiSubmit();
                }
            }   
            
        })
        .catch((error)=> {
            console.log(error);
            Modal.error({
                content: '파일 등록시 오류가 발생하였습니다. 재시도해주세요.',
            });
        })
        .finally(() => {
        });
    }, []);

    const handleTemporarySubmit = () => {
        state.submitType = 'T';
        handleSubmit();
    };

    const handleCompleteSubmit = () => {
        confirm({
            title: '검수 완료',
            content: "검수 완료로 변경되면서 '저작권 계약 검수' 리스트에서는 삭제됩니다.",    
            onOk() {
                state.submitType = 'C';
                handleSubmit();
            },    
            onCancel() {
                return false;      
            },
        });
    };

    //등록
    const handleSubmit = useCallback(async (e)=> {
        const data = toJS(stateData);
        const file = {
            'contract_files':toJS(stateFile['idx_'+state.showDetails]?.contract_files??undefined),
            'etc_files':toJS(stateFile['idx_'+state.showDetails]?.etc_files??undefined)
        };
        data.copyrights = toJS(stateData.copyrights['idx_'+state.showDetails]) ?? []; //보고있는 페이지만 입력/수정
        data.copyrights.ranges.forEach((item)=>{
            if(data.copyrights[item+'s'][0]!==undefined && data.copyrights[item+'s'][0]!==null){
                data.copyrights[item+'s'] = data.copyrights[item+'s'][0];
            }
        });

        let res_validate;
        if(state.type === 'contracts-check'){
            res_validate = ValidationCheck.ModValidation(data,state.showDetails,file);
        }else if(state.type ==='overseas-check'){
            res_validate = ValidationCheck.ModOverseasValidation(data,state.showDetails,file);
        }else{
            return false;
        }

        if(res_validate.states!==true){
            Modal.error({
                content: res_validate.msg,        
            });
            return;
        }
        
        if(res_validate.states === true ){
            var file_cnt = Number(toJS(stateFile['idx_'+state.showDetails].contract_files).length) + Number(toJS(stateFile['idx_'+state.showDetails].etc_files).length);
            
            if(file_cnt > 0 ){
                fileUpload(file);
            }else{
                // apiSubmit();
                if(state.submitType==='T'){
                    apiSubmit();
                }else if(state.submitType==='C'){
                    complete_apiSubmit();
                }
            }
        } 
    }, []);  

    //임시 저장
    const apiSubmit = useCallback(async ()=> {
        const data = toJS(stateData);

        //보고 있는 페이지만 등록
        data.copyrights = toJS(stateData.copyrights['idx_'+state.showDetails]) ?? [];
        data.copyrights.check_status = 'Y';
        data.copyrights.ranges.forEach((item)=>{
            if(data.copyrights[item+'s'][0]!==undefined && data.copyrights[item+'s'][0]!==null){
                data.copyrights[item+'s'] = data.copyrights[item+'s'][0];
            }
        });

        //날짜 표준시가 맞지않아 날짜타입 데이터를 강제로 문자열로 치환
        if(Object.keys(data.copyrights.books).length){
            data.copyrights.books.start_date = moment(data.copyrights.books.start_date).format('YYYY-MM-DD');
            data.copyrights.books.end_date = moment(data.copyrights.books.end_date).format('YYYY-MM-DD');
            data.copyrights.books.prepaid_royalty_date = data.copyrights.books.prepaid_royalty_date?moment(data.copyrights.books.prepaid_royalty_date).format('YYYY-MM-DD'):'';
        }

        if(Object.keys(data.copyrights.ebooks).length){
            data.copyrights.ebooks.start_date = moment(data.copyrights.ebooks.start_date).format('YYYY-MM-DD');
            data.copyrights.ebooks.end_date = moment(data.copyrights.ebooks.end_date).format('YYYY-MM-DD');
            data.copyrights.ebooks.prepaid_royalty_date = data.copyrights.ebooks.prepaid_royalty_date?moment(data.copyrights.ebooks.prepaid_royalty_date).format('YYYY-MM-DD'):'';
        }

        if(Object.keys(data.copyrights.audios).length){
            data.copyrights.audios.start_date = moment(data.copyrights.audios.start_date).format('YYYY-MM-DD');
            data.copyrights.audios.end_date = moment(data.copyrights.audios.end_date).format('YYYY-MM-DD');
            data.copyrights.audios.prepaid_royalty_date = data.copyrights.audios.prepaid_royalty_date?moment(data.copyrights.audios.prepaid_royalty_date).format('YYYY-MM-DD'):'';
        }

        if(Object.keys(data.copyrights.exports).length){
            data.copyrights.exports.start_date = moment(data.copyrights.exports.start_date).format('YYYY-MM-DD');
            data.copyrights.exports.end_date = moment(data.copyrights.exports.end_date).format('YYYY-MM-DD');
        }

        if(Object.keys(data.copyrights.others).length){
            data.copyrights.others.start_date = moment(data.copyrights.others.start_date).format('YYYY-MM-DD');
            data.copyrights.others.end_date = moment(data.copyrights.others.end_date).format('YYYY-MM-DD');
        }

        var json = JSON.stringify(data);
        // console.log(toJS(data));
        // return false;

        var typeUrl = process.env.REACT_APP_API_URL +'/api/v1/contracts-check/'+stateData.id;

        var axios = require('axios');

        var config={
            method:'PUT',
            url:typeUrl,
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
                        resetChk();
                        visibleClose();
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

    //검수 완료
    const complete_apiSubmit = useCallback(async ()=> {
        // const data = toJS(stateData);
        const data = {check_status:'C'}

        // var json = JSON.stringify(data);
        var typeUrl = process.env.REACT_APP_API_URL +'/api/v1/contracts-check-complete/'+stateData.id;

        var axios = require('axios');

        var config={
            method:'PUT',
            url:typeUrl,
            headers:{
                'Accept':'application/json',
            },
                data
            };
            
        axios(config)
        .then(function(response){
            if(response.data.id != ''){
                // Modal.success({
                //     title: response.data.result,
                //     onOk(){
                //         resetChk();
                //         visibleClose();
                //     },
                // });
                resetChk();
                visibleClose();
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


    return (
        <Wrapper>
            <Row gutter={10} className="table marginTop">
                <div className="table_title">공통 정보</div>
                <Col xs={5} lg={5} className="label">
                    계약 회사
                </Col>
                <Col xs={19} lg={19}>
                    {stateData.company==='G' ? '도서출판 길벗' : (stateData.company==='S' ? '길벗스쿨' : '')}
                </Col>
                <Col xs={5} lg={5} className="label">
                    저작권 구분
                </Col>
                <Col xs={19} lg={19}>
                {stateData.type==='K' ? '국내' : (stateData.type==='D' ? '해외 직계약' : (stateData.type==='I'?'해외 수입':''))}
                </Col>

                <Col xs={5} lg={5} className="label">
                    계약명
                </Col>
                <Col xs={19} lg={19}>
                    {stateData.name}
                </Col>    
                <Col xs={5} lg={5} className="label">
                    등록일
                </Col>
                <Col xs={19} lg={19}>
                    {state.data.created_at}
                </Col>
                <Col xs={5} lg={5} className="label">
                    등록자
                </Col>
                <Col xs={19} lg={19}>
                    {state.created_info}
                </Col>
            </Row>

            {/* ================================================= 국내 / 해외 직계약  ========================================================== */}
            {state.type ==='contracts-check'
                ?
                    <div>
                        <Space style={{margin: '10px 0'}}>
                            {state.copyrights.map((item)=>(
                                <div style={{display : 'inline-flex'}}>
                                <Button block type={state.showDetails === item.id ? 'primary' : 'default'}
                                onClick={(e) => {
                                    state.showDetails = item.id;
                                }}
                                
                                >
                                    {item.name}
                                </Button>
                                </div>
                            ))}
                        </Space>
                        {state.copyrights.map((item)=>{
                            if(state.showDetails === item.id){
                                return (
                                <ContractInfo 
                                    type={state.type}
                                    selType={stateData.type}  
                                    dataInfo={{id:item,data:state.copyrights.filter((element)=>(element.id != item.id))}} 
                                    data={stateData.copyrights} 
                                    fileData={stateFile['idx_'+item.id]}
                                    getCopyrights={getCopyrights} 
                                    getCopyrightsFiles={getCopyrightsFiles}
                                    orgData={state.orgData['idx_'+item.id]}
                                    drawerClass={drawerClass}
                                    drawerChk={drawerChk}
                                />
                                );
                            }
                        })}
                    </div>
                :<></> 
            }          
            {/* ================================================= 국내 / 해외 직계약 end ========================================================== */}
            <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                <Col>
                    <Button type="primary" htmlType="button" onClick={handleTemporarySubmit}>
                        선택 저작권자 임시 저장
                    </Button>
                    <Button type="primary" htmlType="button" style={{marginLeft:'10px'}} onClick={handleCompleteSubmit}>
                        검수 완료
                    </Button>
                    <Button htmlType="button" onClick={visibleClose} style={{marginLeft:'10px'}}>
                        취소
                    </Button>                        
                </Col>
            </Row>
        </Wrapper>
    );
});

export default contractsDrawer;