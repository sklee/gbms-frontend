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

import AddHolder from '../Search';
import OverseasInfo from './overseasInfo';
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
    product_name: '',
    product_eng_name: '',
    author_name: '',
    producer: '',
    isbn: '',
    etc_memo: '',
    owners: []
};

const contractsDrawer = observer(({idx, type, onClose, reset, drawerClass, drawerChk}) => {
    const { commonStore } = useStore();

    const { confirm } = Modal;
    
    const { Text } = Typography;
    const { Option } = Select;

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 
    const stateFile = useLocalStore(() => ([])); 

    const state = useLocalStore(() => ({
        idx: '',
        type: '',               //api 타입            
        owners : [],        //저작권자/권리자 리스트
        created_info:'',         //등록자
        check_info:'',         //검수자
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
            stateData.product_name = result.data.data.product_name;
            stateData.product_eng_name = result.data.data.product_eng_name;
            stateData.author_name = result.data.data.author_name;
            stateData.producer = result.data.data.producer;
            stateData.isbn = result.data.data.isbn;
            stateData.etc_memo = result.data.data.etc_memo;
            result.data.data.owners.forEach((e) =>{
                // stateData.owners['idx_'+e.id] = e;
                // state.orgData['idx_'+e.id] = e;
                // state.owners = state.owners.concat({id:e.id,name:e.name});
                // var temp_type = Object.keys(stateData.owners['idx_'+e.id].pivot);
                // var temp_arr = {};
                // temp_type.forEach((item)=>{
                //     temp_arr[item] = stateData.owners['idx_'+e.id].pivot[item];
                //     if(item ==='id'){
                //         // temp_arr['id'] = stateData.owners['idx_'+e.id].pivot['owner_id'];
                //         temp_arr['id'] = stateData.owners['idx_'+e.id].pivot['copyright_id'];
                //     }
                // });
                // temp_arr['ranges'] = toJS(temp_arr['ranges'].split(', '));
                // temp_arr['targets'] = toJS(temp_arr['targets'].split(', '));
                // stateData.owners['idx_'+e.id] = toJS(temp_arr);
                // stateFile['idx_'+e.id] = {contract_files:undefined,etc_files:undefined};

                stateData.owners['idx_'+e.id] = e;
                state.orgData['idx_'+e.id] = e;
                // state.owners = state.owners.concat({id:e.id,name:e.name});
                state.owners = [...state.owners,{id:e.id,name:e.name}];
            });
            state.showDetails = result.data.data.owners[0].id;
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
        stateData.owners['idx_'+data.id] = toJS(data);
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

    //영문 입력 확인
    const handleEngChk = useCallback(
        (type) => (e) => {
            const engRegex =/^[a-zA-Z0-9~!@#$%^&*()-=_+|<>,.'"`’/?:{}\[\]|\s]*$/;

            if (e.target.value != '') {
                if (engRegex.test(e.target.value) == false) {
                    message.warning('영문,숫자 및 특수문자만 입력해주세요.');
                    stateData[type] = '';
                } else {
                    stateData[type] = e.target.value;
                }
            }
        },
        [],
    );

    //파일
    const getCopyrightsFiles = (file) => {
        stateFile['idx_'+file.id] = file;
    };

    const fileUpload = useCallback(async (file) => {
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
                    var temp_arr = stateData.owners['idx_'+state.showDetails].contract_files;
                    temp_arr = temp_arr.filter(x =>x.use_yn && x.use_yn=='N');
                    var temp_res = res.data.contract_files;
                    temp_res.forEach(e => {
                        var temp = {'file_path':e.file_path,'file_name':e.file_name}
                        temp_arr = [...temp_arr,temp];
                    });
                    stateData.owners['idx_'+state.showDetails].contract_files = temp_arr;
                }

                if(res.data.etc_files !== undefined){
                    var temp_arr2 = stateData.owners['idx_'+state.showDetails].etc_files;
                    temp_arr = temp_arr.filter(x =>x.use_yn && x.use_yn=='N');
                    var temp_res2 = res.data.etc_files;
                    temp_res2.forEach(e => {
                        var temp2 = {'file_path':e.file_path,'file_name':e.file_name}
                        temp_arr2 = [...temp_arr2,temp2];
                    });
                    stateData.owners['idx_'+state.showDetails].etc_files = temp_arr2;
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
        // const file = {
        //     'contract_files':toJS(stateData.owners['idx_'+state.showDetails]?.contract_files??undefined),
        //     'etc_files':toJS(stateData.owners['idx_'+state.showDetails]?.etc_files??undefined)
        // };
        const file = {
            'contract_files':toJS(stateFile['idx_'+state.showDetails]?.contract_files??undefined),
            'etc_files':toJS(stateFile['idx_'+state.showDetails]?.etc_files??undefined)
        };
        data.owners = toJS(stateData.owners['idx_'+state.showDetails]) ?? []; //보고있는 페이지만 입력/수정

        data.owners.ranges.forEach((item)=>{
            if(data.owners[item+'s'][0]!==undefined && data.owners[item+'s'][0]!==null){
                data.owners[item+'s'] = data.owners[item+'s'][0];
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
            
            // fileUpload(file);
            if(file_cnt > 0 ){
                fileUpload(file);
            }else{
                if(state.submitType==='T'){
                    apiSubmit();
                }else if(state.submitType==='C'){
                    complete_apiSubmit();
                }
            }
        } 

    }, []);  

    const apiSubmit = useCallback(async ()=> {
        const data = toJS(stateData);
        // data.owners = toJS(stateData.owners['idx_'+state.showDetails]) ?? [];

        //전체 데이터 배열 재정렬
        // data.owners = [];
        // state.owners.map(e => {
        //     var temp = toJS(stateData.owners['idx_'+e.id])??[];
        //     temp.ranges.forEach((item)=>{
        //         if(temp[item+'s'][0]!==undefined && temp[item+'s'][0]!==null){
        //             temp[item+'s'] = temp[item+'s'][0];
        //         }
        //     });
        //     data.owners = [...data.owners,temp];
        // });

        //보고 있는 페이지만 등록
        data.owners = toJS(stateData.owners['idx_'+state.showDetails]) ?? [];
        data.owners.check_status = 'Y';
        data.owners.ranges.forEach((item)=>{
            if(data.owners[item+'s'][0]!==undefined && data.owners[item+'s'][0]!==null){
                data.owners[item+'s'] = data.owners[item+'s'][0];
            }
        });

        //날짜 표준시가 맞지않아 날짜타입 데이터를 강제로 문자열로 치환
        if(Object.keys(data.owners.books).length){
            data.owners.books.start_date = moment(data.owners.books.start_date).format('YYYY-MM-DD');
            data.owners.books.end_date = moment(data.owners.books.end_date).format('YYYY-MM-DD');
            data.owners.books.sale_date = data.owners.books.sale_date?moment(data.owners.books.sale_date).format('YYYY-MM-DD'):'';
        }

        if(Object.keys(data.owners.ebooks).length){
            data.owners.ebooks.start_date = moment(data.owners.ebooks.start_date).format('YYYY-MM-DD');
            data.owners.ebooks.end_date = moment(data.owners.ebooks.end_date).format('YYYY-MM-DD');
            data.owners.ebooks.sale_date = data.owners.ebooks.sale_date?moment(data.owners.ebooks.sale_date).format('YYYY-MM-DD'):'';
        }

        if(Object.keys(data.owners.audios).length){
            data.owners.audios.start_date = moment(data.owners.audios.start_date).format('YYYY-MM-DD');
            data.owners.audios.end_date = moment(data.owners.audios.end_date).format('YYYY-MM-DD');
            data.owners.audios.sale_date = data.owners.audios.sale_date?moment(data.owners.audios.sale_date).format('YYYY-MM-DD'):'';
        }

        // var json = JSON.stringify(toJS(data));

        // console.log(toJS(data));
        // return false;

        if(state.submitType==='T'){
            var typeUrl = process.env.REACT_APP_API_URL +'/api/v1/overseas-check/'+stateData.id;
        }else{
            var typeUrl = process.env.REACT_APP_API_URL +'/api/v1/overseas-check-complete/'+stateData.id;
        }

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
        var typeUrl = process.env.REACT_APP_API_URL +'/api/v1/overseas-check-complete/'+stateData.id;

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
            <Row gutter={10} className="table marginTop">
                    <div className="table_title">원상품(원서) 정보</div>
                    <Col xs={5} lg={5} className="label">
                        상품명(원어 표기) <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Input type="text" name="product_name" value={stateData.product_name} onChange={handleChangeInput('product_name')} autoComplete="off" style={{width:'100%'}}/>
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        상품명(영어 표기) <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Input 
                            type="text" 
                            name="product_eng_name" 
                            value={stateData.product_eng_name} 
                            onChange={handleChangeInput('product_eng_name')} 
                            onBlur={handleEngChk('product_eng_name')}
                            autoComplete="off" 
                            style={{width:'100%'}}
                        />
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        저자/소유자(영어 표기) <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Input 
                            type="text" 
                            name="author_name" 
                            value={stateData.author_name} 
                            onChange={handleChangeInput('author_name')} 
                            onBlur={handleEngChk('author_name')}
                            autoComplete="off" 
                            style={{width:'50%'}}
                        />
                        &nbsp;(확인 불가능한 경우 ‘확인 안됨' 등으로 입력)
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        출판사/생산자 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Input type="text" name="producer" value={stateData.producer} onChange={handleChangeInput('producer')} autoComplete="off" style={{width:'50%'}}/>
                        &nbsp;(확인 불가능한 경우 ‘확인 안됨' 등으로 입력)
                    </Col>
                    <Col xs={5} lg={5} className="label">
                        원상품 ISBN/코드 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={19} lg={19}>
                        <Input type="text" name="isbn" value={stateData.isbn} onChange={handleChangeInput('isbn')} autoComplete="off" style={{width:'50%'}}/>
                    </Col>

                    <Col xs={5} lg={5} className="label">
                        기타 참고사항
                    </Col>
                    <Col xs={19} lg={19}>
                        <Input.TextArea
                            name="etc_memo"
                            rows={4}
                            onChange={handleChangeInput('etc_memo')}
                            value={stateData.etc_memo}
                            autoComplete="off"

                        />
                    </Col>
                </Row>  
            {/* ================================================= 해외 수입  ====================================================================== */}
            {state.type ==='overseas-check'
                ?
                <div>
                <Space>
                    {state.owners.map((item)=>(
                        <div style={{display : 'inline-flex', margin: '10px 0'}}>
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
                {state.owners.map((item)=>{
                    if(state.showDetails === item.id){
                        return (
                            <OverseasInfo 
                                type={state.type}
                                selType={stateData.type} 
                                dataInfo={{id:item,data:state.owners.filter((element)=>(element.id != item.id))}} 
                                data={stateData.owners} 
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
            {/* ================================================= 해외 수입 end ==================================================================== */}
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