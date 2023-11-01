/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Row, Col,  Modal, Input,  message, Radio} from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import { isEmpty, uploadDataInsert } from '@components/Common/Js'
import styled, { ServerStyleSheet } from 'styled-components';
import useStore from '@stores/useStore';
import moment from 'moment';

// import OverseasInfo from './overseasInfo copy';
import AddHolder from '../Search';
import RightHolderGrid from './rightHolderGrid';
import * as ValidationCheck from '../Validator/Adds.js';

const Wrapper = styled.div`
    width: 100%;
    `;

const DEF_STATE = {
    // DB Data
    company: '',
    type: 'I',
    name: '',
    product_name: '',
    product_eng_name: '',
    author_name: '',
    producer: '',
    isbn: '',
    etc_memo: '',
    owners: []
};

const ownersDrawer = observer(({type, onClose, reset, drawerClass, drawerChk}) => {
    const { commonStore } = useStore();
    const { confirm } = Modal;

    const stateData = useLocalStore(() => ({ ...DEF_STATE }));

    const state = useLocalStore(() => ({
        type: '',               //api 타입            
        owners : [],        //저작권자/권리자 리스트
        showDetails : '',       //선택된 저작권자
        search_type : '',       //저작권 구분
        reset : true,
    }));
    
    useEffect(() => {
        state.type= type;
    }, [type]);

    const showConfirm = (idx) => {
        confirm({
            title: '계약 정보를 삭제하시겠습니까?',
            icon: <ExclamationCircleFilled />,
            content: '삭제시 입력한 정보가 삭제됩니다.',
            onOk() {
                delowners(idx);
            },
            onCancel() {
                
            },
        });
    };

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

    //drawer class
    const classChkBtn = (val)=>{
        drawerClass(val)     
    }

    const [viewSearchVisible, setViewSearchVisible] = useState(false);
    //검색
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
        state.owners = state.owners.concat(details);
        state.showDetails = details.id;
    };

    const getowners = (data) => {
        stateData.owners['idx_'+data.id] = toJS(data);
    };
    const delowners = (idx) => {
        delete stateData.owners['idx_'+idx];
        state.owners = state.owners.filter((item)=> item.id != idx);
        if(state.showDetails == idx){
            state.showDetails = '';
        }
    };

    const fetchData = () => {};

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
            }
        })
        data['check_status'] = e

        if(e !=='I'){
            let res_validate = {states : false, msg : "권리자를 한 명 이상 등록/수정하세요."}
            for (let i = 0; i < data.owners.length; i++) {
                res_validate = ValidationCheck.AddOverseasValidation(data,i);
                if(res_validate?.states!==true)break;
            }
            if(res_validate.states!==true){
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

        apiSubmit(data)
    }, []);  

    const apiSubmit = useCallback(async (stateData)=> {
        const promises = stateData.owners.map(async (data) => {
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

    const showModal = () => {
        Modal.confirm({
            title: '삭제하면 되돌릴 수 없습니다. 계속 하시겠습니까?',
            onOk() {
                console.log('OK');
            }
        });
    };

    return (
        <Wrapper>
            <Row gutter={10} className="table marginTop">
                <div className="table_title">공통 정보</div>
                <Col xs={5} lg={5} className="label">
                    계약 회사 <span className="spanStar">*</span>
                </Col>
                <Col xs={19} lg={19}>
                    <Radio.Group
                        value={stateData['company']}
                        onChange={handleChangeInput('company')}
                    >
                    <Radio value="G">도서출판 길벗</Radio>
                    <Radio value="S">길벗스쿨</Radio>

                    </Radio.Group>
                </Col>

                <Col xs={5} lg={5} className="label">
                    계약명 <span className="spanStar">*</span>
                </Col>
                
                <Col xs={19} lg={19}>
                    <Input type="text" name="name" value={stateData.name} onChange={handleChangeInput('name')} autoComplete="off" style={{width:'100%'}}/>   
                </Col>               
            </Row>
            {/* ================================================= 해외 수입  ====================================================================== */}
            {state.type ==='overseas' ?
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
                        type={state.type}
                        selType={stateData.type}
                        searchDrawerOpen={showSearchDrawer}
                        gridList={state.owners}
                        contractDrawerVisible={contractDrawerVisible}
                        contractDrawerOpen={contractDrawerOpen} 
                        contractDrawerClose={contractDrawerClose} 
                        getowners={getowners}
                        data={stateData.owners}
                    />
                </div>
                :<></> 
            }          
            {/* ================================================= 해외 수입 end ==================================================================== */}
            
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

export default ownersDrawer;