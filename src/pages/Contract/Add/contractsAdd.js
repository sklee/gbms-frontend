/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Row, Col,  Modal, Input, Radio} from 'antd';
import { ExclamationCircleFilled, CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import { isEmpty, uploadDataInsert } from '@components/Common/Js'
import styled, { ServerStyleSheet } from 'styled-components';
import useStore from '@stores/useStore';
import moment from 'moment';

import ContractInfo from './contInfo';
import AddHolder from '../Search';
import * as ValidationCheck from '../Validator/Adds.js';
import CopyrightGrid from './copyrightGrid';

const Wrapper = styled.div`
    width: 100%;
    `;

const DEF_STATE = {
    // DB Data
    company: '',
    type: '',
    name: '',
    copyrights: []
};


const contractsDrawer = observer(({type, onClose, reset, drawerClass, drawerChk}) => {
    const { commonStore } = useStore();
    const { confirm } = Modal;

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 

    const state = useLocalStore(() => ({
        type: '',               //api 타입            
        copyrights : [],        //저작권자/권리자 리스트
        showDetails : '',       //선택된 저작권자
        search_type : '',       //저작권 구분
        reset : true,
    }));
    
    useEffect(() => {       
        state.type= type;
    }, [type]);


    const visibleClose = () => {
        //데이터 초기화
        for (const key in DEF_STATE) {
            stateData[key] = DEF_STATE[key];
        }

        onClose(false);
    };    

    const showConfirm = (idx) => {
        confirm({
            title: '계약 정보를 삭제하시겠습니까?',
            icon: <ExclamationCircleFilled />,
            content: '삭제시 입력한 정보가 삭제됩니다.',
            onOk() {
                delCopyrights(idx);
            },
            onCancel() {
            },
        });
    };

    //추가 후 리스트 리셋
    const resetChk = ()=>{
        reset(true);
    }

    //drawer class
    const classChkBtn = (val)=>{
        drawerClass(val)     
    }

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
    const searchDrawerClose = () => {
        if(drawerChk === 'Y'){
            classChkBtn();
        }
        setViewSearchVisible(false);
    };

    const overlapSearch = (details) => {
        state.copyrights = state.copyrights.concat(details);
        state.showDetails = details.id;
    };

    const getCopyrights = (data) => {
        stateData.copyrights['idx_'+data.id] = toJS(data);
    };
    const delCopyrights = (idx) => {
        delete stateData.copyrights['idx_'+idx];
        state.copyrights = state.copyrights.filter((item)=> item.id != idx);
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

    //등록
    const handleSubmit = useCallback(async (e)=> {

        const data = toJS(stateData);

        state.copyrights.map(item=>{
            const prod = stateData.copyrights['idx_'+item.id]
            if(!prod.pivot){
                data.copyrights = [...data.copyrights, prod]
            }
        })
        data['check_status'] = e

        if(e !=='I'){
            let res_validate = {states : false, msg : "저작권자를 한 명 이상 등록/수정하세요."}
            for (let i = 0; i < data.owners.length; i++) {
                res_validate = ValidationCheck.AddValidation(data,i);
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
            url : '/contracts',
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
                    저작권 구분 <span className="spanStar">*</span>
                </Col>
                <Col xs={19} lg={19}>
                    {state.type === 'contracts' ?
                    <Radio.Group
                        value={stateData['type']}
                        onChange={handleChangeInput('type')}
                    >
                    <Radio value="K">국내</Radio>
                    <Radio value="D">해외 직계약</Radio>
                    </Radio.Group>
                    :
                    <Radio.Group
                        value={stateData['type']}
                        onChange={handleChangeInput('type')}
                    >
                    <Radio value="I">해외 수입</Radio>
                    </Radio.Group>
                    }
                </Col>

                <Col xs={5} lg={5} className="label">
                    계약명 <span className="spanStar">*</span>
                </Col>
                
                <Col xs={19} lg={19}>
                    <Input type="text" name="name" value={stateData.name} onChange={handleChangeInput('name')} autoComplete="off" style={{width:'100%'}}/>   
                </Col>               
            </Row>

            {/* ================================================= 국내 / 해외 직계약  ========================================================== */}
            {state.type ==='contracts' ? 
                <>
                    <CopyrightGrid 
                        type={state.type} 
                        searchDrawerOpen={showSearchDrawer} 
                        gridList={state.copyrights} 
                        contractDrawerVisible={contractDrawerVisible}
                        contractDrawerOpen={contractDrawerOpen} 
                        contractDrawerClose={contractDrawerClose} 
                        getCopyrights={getCopyrights}
                        data={stateData.copyrights} 
                        selType={stateData.type}
                    />
                </>
            : ''}

            {/* ================================================= 국내 / 해외 직계약 end ========================================================== */}
            <Row gutter={[10, 10]} justify="center" style={{ marginTop: 30 }}>
                <Col>
                    <Button type="primary" htmlType="button" onClick={()=>{handleSubmit('I')}}>임시 저장</Button>
                    <Button type="primary" htmlType="button" style={{margin: '0 10px'}} onClick={()=>{handleSubmit('W')}}>검수 요청</Button>
                </Col>
            </Row>


            {viewSearchVisible === true && (
                <AddHolder
                    type={state.search_type}
                    visible={viewSearchVisible}
                    onClose={searchDrawerClose}
                    overlapSearch={overlapSearch}
                    reset={fetchData}
                />
            )}
        </Wrapper>
    );
});

export default contractsDrawer;