/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Space, Button, Row, Col,  Modal, Breadcrumb, Input, Upload,  message, Radio, Popover, Select, Typography, Checkbox} from 'antd';
import { PhoneOutlined ,QuestionOutlined, ExclamationCircleOutlined, PlusOutlined, CloseOutlined  } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled, { ServerStyleSheet } from 'styled-components';
import { isEmpty, uploadDataInsert } from '@components/Common/Js'
import useStore from '@stores/useStore';
import axios from 'axios';
import moment from 'moment';

// import ContractInfo from './contInfo';
import OverseasInfo from './overseasInfo';
import OverseasContents from './overseasContents';
import AddHolder from '../Search';
import * as ValidationCheck from '../Validator/Adds.js';

import RightHolderGrid from '../Add/rightHolderGrid';

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

const contractsDrawer = observer(({idx, type, onClose, tabChk, reset, drawerClass, drawerChk }) => {
    const { commonStore } = useStore();

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
        memberOption: [],       //담당자 회원 리스트
        showDetails : '',       //선택된 저작권자
        search_type : '',       //저작권 구분
        reset : true,
        data : {},
        orgData : {},
        check_status : '',      //검수 완료 계약인지 구분

        submitType : 'T',
    }));
    
    useEffect(() => {       
        state.idx = idx;
        state.type= type;
        memberData();
        fetchData(state.idx);
    }, [type]);

    const fetchData = useCallback(async (idx) => {
        if(state.type==='contracts'){
            var api_url = 'contracts';
        }else if(state.type==='overseas'){
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
            state.created_info = result.data.data.created_info.name;  // api 수정 후 주석 제거
            state.check_info = result.data.data.check_info.name; // api 수정 후 주석 제거
            state.check_status = result.data.data.check_status;
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
                stateData.owners['idx_'+e.id] = e;
                state.orgData['idx_'+e.id] = e;
                let temp = {id:'',name:'',status:'',book:'',ebook:'',audio:''}
                temp.id = e.id
                temp.name = e.name
                const key_list = ['book','ebook','audio']
                key_list.forEach(item=>{
                    if(e.pivot.ranges.includes(item)){
                        if(e.pivot[item+'s'].length>0){
                            //저작권자 리스트 생성
                            temp[item] = e.pivot[item+'s'].find(ex=> (['N','A','R']).includes(ex.contract_end_yn))?.end_date

                            //저작권자 계약 범위 데이터 파싱
                            if(result.data.data.check_status==='C'){
                                stateData.owners['idx_'+e.id].pivot[item+'s_old'] = [...e.pivot[item+'s'].filter(ex=> !(['N','A','R']).includes(ex.contract_end_yn))]
                            }
                            stateData.owners['idx_'+e.id].pivot[item+'s'] = {...e.pivot[item+'s'].find(ex=> (['N','A','R']).includes(ex.contract_end_yn))}
                        }else{
                            temp[item] = '등록 필요'
                        }
                    }else{
                        temp[item] = '-'
                    }
                })
                if(result.data.data.check_status==='T'){
                    temp.status = '임시 저장'
                }else if(result.data.data.check_status==='W'){
                    temp.status = '대기'
                }else if(result.data.data.check_status==='C'){
                    temp.status = '완료'
                }
                state.owners = [...state.owners,{id:e.id,name:e.name}];
                // memberData(e.id);
            });
        }

        //담당자      
        if(result.data.data.managers.length > 0){
            var managerData = [];
            var managerText = [];
        
            result.data.data.managers.forEach(e => {
                managerData = [...managerData, e.id];
                if(e.teams){
                    managerText = [...managerText, e.name+'('+e.teams.name+')'];
                }else{
                    managerText = [...managerText, e.name+'(-)'];
                }
                
            });          
            stateData.managers = managerData;
            // state.dataOld.managers =managerData;
            setManager(managerData);
            setManagerTxt(managerText);
        }else{
            setManager([result.data.data.created_info.id]);
            if(result.data.data.created_info.teams){
                setManagerTxt(result.data.data.created_info.name+'('+result.data.data.created_info.teams.name+')');
            }else{    
                setManagerTxt(result.data.data.created_info.name+'(-)');
            }          
            //state.updata = {...state.updata, 'managers': data.created_info.id};
            stateData.managers = {...stateData.managers, 'managers': result.data.data.created_info.id};
            // state.dataOld.managers = [result.data.data.created_info.id];
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
        // reset(true);
    }
    //담당자
    const memberData = useCallback(async () => {
        const result = await axios.get(
        process.env.REACT_APP_API_URL +'/api/v1/users?display=100&page=1&sort_by=date&order=desc',
        {
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            },
        },
        )
        const options = [];
        result.data.data.forEach(e=>{
            options.push({
                label: e.name+"("+e.department+")",
                value: Number(e.id),
            });
        });
        state.memberOption = options;
        
        // state.memberOption = result.data.data;

    }, []);

    //담당자 추가
    const [manager, setManager] = useState([]);
    const [managerTxt, setManagerTxt] = useState('');
    const handleChangeSelect = useCallback( (e) => {
        setManager(e);
        stateData.managers = e;
    },[],);  

    //drawer class
    const classChkBtn = (val)=>{
        drawerClass(val)     
    }

    const [viewSearchVisible, setViewSearchVisible] = useState(false);
    //search drawer 열기
    const showSearchDrawer = (search_type) => {
        state.search_type = search_type;
        if(drawerChk === 'Y'){
            classChkBtn('drawerback');
        }       
        setViewSearchVisible(true);
    };
    //search drawer 닫기
    const addOnClose = () => {
        if(drawerChk === 'Y'){
            classChkBtn();
        }
        setViewSearchVisible(false);
    };

    const [contractDrawerVisible, setContractDrawerVisible] = useState(false);
    const contractDrawerOpen = () => {
        if(drawerChk === 'Y'){
            classChkBtn('drawerback');
        }
        setContractDrawerVisible(true);
    }
    const contractDrawerClose = () => {
        if(drawerChk === 'Y'){
            classChkBtn();
        }
        setContractDrawerVisible(false);
    }

    const overlapSearch = (details) => {
        // state.owners = state.owners.concat(details);
        // state.owners = [...state.owners,details];
        var temp = details;
        temp['add_chk'] = true;
        state.owners = [...state.owners,temp];

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
    //등록
    const handleSubmit = useCallback(async (e)=> {

        const data = toJS(stateData);
        state.owners.map(item=>{
            const prod = stateData.owners['idx_'+item.id]
            if(prod && !prod.pivot){
                data.owners = [...data.owners, prod]
                data.owners.map(e=>{
                    e.ranges.forEach(range=>{
                        if(e[range+'s'].length > 0){
                            //유효한 계약만 변경 : N:신규, A:자동 연장, R:재계약, Y:계약 종료, T:해지
                            e[range+'s'] = e[range+'s'].find(idx => (['N','A','R']).includes(idx.contract_end_yn))??[]
                        }
                    })
                })
            }
        })
        data['check_status'] = e

        if(e !=='I'){
            let res_validate = {states : false, msg : "권리자를 한 명 이상 등록/수정하세요."}
            for (let i = 0; i < data.owners.length; i++) {
                res_validate = ValidationCheck.ModOverseasValidation(data,i);
                if(res_validate?.states!==true)break;
            }

            if(res_validate?.states!==true){
                Modal.error({
                    content: res_validate.msg,        
                });
                return;
            }
        }else{
            if(stateData.company===''){
                Modal.error({
                    content: '공통정보-계약 회사를 입력하세요.',        
                });
                return;
            }
            if(stateData.type===''){
                Modal.error({
                    content: '공통정보-저작권 구분을 입력하세요.',        
                });
                return;
            }
            if(stateData.name===''){
                Modal.error({
                    content: '공통정보-계약명을 입력하세요.',        
                });
                return;
            }
        }

        apiSubmit(data);
    }, []);  

    const apiSubmit = useCallback(async (stateData)=> {
        const promises = stateData.copyrights.map(async (data) => {
            //날짜 표준시가 맞지않아 날짜타입 데이터를 강제로 문자열로 치환
            if(Object.keys(data.books).length){
                data.books.start_date = moment(data.books.start_date).format('YYYY-MM-DD');
                data.books.end_date = moment(data.books.end_date).format('YYYY-MM-DD');
                data.books.prepaid_royalty_date = data.books.prepaid_royalty_date?moment(data.books.prepaid_royalty_date).format('YYYY-MM-DD'):'';
            }

            if(Object.keys(data.ebooks).length){
                data.ebooks.start_date = moment(data.ebooks.start_date).format('YYYY-MM-DD');
                data.ebooks.end_date = moment(data.ebooks.end_date).format('YYYY-MM-DD');
                data.ebooks.prepaid_royalty_date = data.ebooks.prepaid_royalty_date?moment(data.ebooks.prepaid_royalty_date).format('YYYY-MM-DD'):'';
            }

            if(Object.keys(data.audios).length){
                data.audios.start_date = moment(data.audios.start_date).format('YYYY-MM-DD');
                data.audios.end_date = moment(data.audios.end_date).format('YYYY-MM-DD');
                data.audios.prepaid_royalty_date = data.audios.prepaid_royalty_date?moment(data.audios.prepaid_royalty_date).format('YYYY-MM-DD'):'';
            }

            if(Object.keys(data.exports).length){
                data.exports.start_date = moment(data.exports.start_date).format('YYYY-MM-DD');
                data.exports.end_date = moment(data.exports.end_date).format('YYYY-MM-DD');
            }

            if(Object.keys(data.others).length){
                data.others.start_date = moment(data.others.start_date).format('YYYY-MM-DD');
                data.others.end_date = moment(data.others.end_date).format('YYYY-MM-DD');
            }

            //파일 업로드 후 리스트만 목록에 구성
            if(data.contract_files.length > 0)data.contract_files = await uploadDataInsert(data.contract_files, 'contract', commonStore)
            if(data.etc_files.length > 0)data.etc_files = await uploadDataInsert(data.etc_files, 'contract', commonStore)
        })

        //비동기 동작 이후 submit
        await Promise.all(promises);

        commonStore.handleApi({
            method : 'POST',
            url : '/overseas',
            data : stateData
        })
        .then((result) => {
            Modal.success({
                content: '수정이 완료되었습니다.',
            })
            visibleClose();
        })
    }, []);

    const getowners = (data) => {
        stateData.owners['idx_'+data.id] = toJS(data);
    };

    const showModal = () => {
        Modal.confirm({
            title: '삭제하면 되돌릴 수 없습니다. 계속 하시겠습니까?',
            onOk() {
                handleDelete();
            }
        });
    };

    const handleDelete = () => {
        commonStore.handleApi({
            method : 'DELETE',
            url : '/contracts/'+idx,
        })
        .then((result) => {
            Modal.success({
                content: '삭제되었습니다..',
            })
            visibleClose();
        })
    };

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
                <Col xs={5} lg={5} className="label">
                    담당자
                </Col>
                <Col xs={19} lg={19}>
                    {/* <Select value={manager} mode="multiple" showArrow style={{ width: '100%' }} placeholder="담당자를 선택하세요." onChange={handleChangeSelect}>
                        {state.memberOption.map((item) => (
                            <Option value={item['id']} key={item['id']} >
                                {item['name']}({item['team']})
                            </Option>
                        ))}
                    </Select> */}
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
                <Col xs={5} lg={5} className="label">
                    검수
                </Col>
                <Col xs={19} lg={19}>
                    {state.check_info===undefined ? '대기' : state.check_info}
                </Col>      
            </Row>

            {/* ================================================= 해외 수입  ====================================================================== */}
            {state.type ==='overseas' ? 
                state.check_status !== 'C' ? (
                    <div>
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

                        <RightHolderGrid 
                            idx={state.idx}
                            checkStatus={state.check_status}
                            viewPage={true}
                            type={state.type} 
                            searchDrawerOpen={showSearchDrawer} 
                            gridList={state.owners} 
                            contractDrawerVisible={contractDrawerVisible}
                            contractDrawerOpen={contractDrawerOpen} 
                            contractDrawerClose={contractDrawerClose} 
                            getowners={getowners}
                            data={stateData.owners} 
                            selType={stateData.type}
                            orgData={state.orgData}
                        />
                    </div> 
                ) : (
                    <div>
                        <Row gutter={10} className="table marginTop">
                            <div className="table_title">원상품(원서) 정보 (계약 내용)</div>
                            <Col xs={5} lg={5} className="label">
                                상품명(원어 표기) <span className="spanStar">*</span>
                            </Col>
                            <Col xs={19} lg={19}>
                                {stateData.product_name}
                            </Col>
                            <Col xs={5} lg={5} className="label">
                                상품명(영어 표기) <span className="spanStar">*</span>
                            </Col>
                            <Col xs={19} lg={19}>
                                {stateData.product_eng_name}
                            </Col>
                            <Col xs={5} lg={5} className="label">
                                저자/소유자(영어 표기) <span className="spanStar">*</span>
                            </Col>
                            <Col xs={19} lg={19}>
                                {stateData.author_name}
                            </Col>
                            <Col xs={5} lg={5} className="label">
                                출판사/생산자 <span className="spanStar">*</span>
                            </Col>
                            <Col xs={19} lg={19}>
                                {stateData.producer}
                            </Col>
                            <Col xs={5} lg={5} className="label">
                                원상품 ISBN/코드 <span className="spanStar">*</span>
                            </Col>
                            <Col xs={19} lg={19}>
                                {stateData.isbn}
                            </Col>

                            <Col xs={5} lg={5} className="label">
                                계약 참고사항
                            </Col>
                            <Col xs={19} lg={19}>
                                {stateData.etc_memo}
                            </Col>
                        </Row>

                        <RightHolderGrid 
                            idx={state.idx}
                            checkStatus={state.check_status}
                            viewPage={true}
                            type={state.type} 
                            searchDrawerOpen={showSearchDrawer} 
                            gridList={state.owners} 
                            contractDrawerVisible={contractDrawerVisible}
                            contractDrawerOpen={contractDrawerOpen} 
                            contractDrawerClose={contractDrawerClose} 
                            getowners={getowners}
                            data={stateData.owners} 
                            selType={stateData.type}
                            orgData={state.orgData}
                        />
                    </div>
                ) : <></> 
            } 

            <Row gutter={[10, 10]} justify="center" style={{ marginTop: 30 }}>
                <Col>
                    <Button type="primary" htmlType="button" onClick={()=>{handleSubmit('I')}}>임시 저장</Button>
                    <Button type="primary" htmlType="button" style={{margin: '0 10px'}} onClick={()=>{handleSubmit('W')}}>검수 요청</Button>
                    <Button htmlType="button" onClick={showModal}>삭제</Button>
                </Col>
            </Row>
            {viewSearchVisible === true && (
                <AddHolder
                    type={state.search_type}
                    visible={viewSearchVisible}
                    onClose={addOnClose}
                    overlapSearch={overlapSearch}
                    reset={fetchData}
                />
            )}
        </Wrapper>
    );
});

export default contractsDrawer;