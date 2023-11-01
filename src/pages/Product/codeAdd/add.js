/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Row, Col,  Modal, Breadcrumb, Input, Drawer, Radio, Popover, Select, Typography, DatePicker} from 'antd';
import { CloseOutlined, ExclamationCircleOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';
import moment from 'moment';
import * as wjInput from '@grapecity/wijmo.react.input';
import { CollectionView } from '@grapecity/wijmo';

import ChkAuthor from './chkAuthor';
import ChkProduct from './chkProduct';
import tooltipData from '@pages/tooltipData';


const Wrapper = styled.div`
    width: 100%;
    `;

const DEF_STATE = {
    // DB Data
    contract_type:'',
    contracts_id:'',
    company: '',
    brand: '',
    product_type: '',
    connection_id:'',  
    connection_type:'', 
    name: '',
    //internal_name: '',
    expected_release_date: '',
    memo: '' ,
    
};

const addDrawer = observer(({ visible, onClose, reset}) => {
    const { commonStore } = useStore();

    const { Text } = Typography;
    const { Option } = Select;
    const { confirm } = Modal;

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 

    const state = useLocalStore(() => ({
        drawerback : 'drawerWrap', //drawer class name
        // brandOldOption : [],
        // brandOption : [],
        // companyOption : [],
        // proOption : [],
        bankOption: [
            {id: 1, text: '개정판'},
            {id: 2, text: '증보판'},
            {id: 3, text: '개정증보판'},
            {id: 4, text: '전자책/오디오북(단권)'},
            {id: 5, text: '전자책/오디오북(분권)'},
            {id: 6, text: '동영상 강좌'},
            {id: 7, text: '부속 상품'},
            {id: 8, text: '종이책'}
        ],

        nameChk : false,   //상품명 중복 확인여부     
        typeChk: false,     //저작권 계약 있는 상품 체크 여부

        prdData:'',         //연결상품
        contracts_name:'',      //저작권 계약

        authorType : '',
        productChkType : '',
        tooltipData : '',

    }));
    
    useEffect(() => {   
        if(tooltipData !== '' && tooltipData !== undefined){
            var data = []
            tooltipData.forEach((e,num) => {
                if(e.id === 'product'){
                    data = [...data, (<div dangerouslySetInnerHTML={{__html: tooltipData[num].memo}}></div>)]
                }
            });
            state.tooltipData = data
        }   

    }, []);


    const visibleClose = () => {
        //데이터 초기화
        for (const key in DEF_STATE) {
            stateData[key] = DEF_STATE[key];
        }
        state.nameChk = false;
        state.typeChk= false;    
        state.prdData='';
        state.contracts_name='';
        
        onClose(false);       
    };    
  
    const classChk=(val)=>{
        if(val === 'Y'){
            state.drawerback = 'drawerback drawerWrap';
        }else{
            state.drawerback = 'drawerWrap';
        }
    }

    //drawer class
    const classChkBtn = (val)=>{
        if(val === 'drawerback'){
            //classChk('Y');
            state.drawerback = 'drawerback drawerWrap';
        }else{
            // classChk('N');
            state.drawerback = 'drawerWrap';
        }        
    }

    //저작권 계약 검색
    const [chkVisible, setChkVisible] = useState(false);
    const chkAuthor = (type) => {
        classChkBtn('drawerback');
        setChkVisible(true);
    };

    //저작권 계약 검색 닫기
    const chkOnClose = (val) => {
        classChkBtn();
        if(val !== 'Y'){
            stateData.contract_type = '';
        }        

        setChkVisible(false);
    };

    //저작권 계약
    const authorData =(data,code)=>{
        console.log(data);
        state.typeChk = true;
        stateData.contracts_id= data.id;
        state.contracts_name = data.name;
        stateData.company = data.company;

        if(code === 'books'){
            state.productChkType = '1';
        }else if(code === 'ebooks'){
            state.productChkType = '2';
        }else if(code === 'audios'){
            state.productChkType = '3';
        }else{
            state.productChkType = '4';
        }
    }

    //상품 검색    
    const [chkProduct, setChkProduct] = useState(false);
    const chkProDrawer = () => {
        classChkBtn('drawerback');
        setChkProduct(true);
    };

    //상품검색 닫기
    const chkProOnClose = () => {
        classChkBtn();
        setChkProduct(false);
    };

    //연결 상품
    const proData =(code,name,id)=>{
        console.log(id)
        stateData['connection_id'] = id;
        state.prdData = {code : code, name: name, id:id};
        if(name){
            stateData.name = name;
            chkData(name)
        }
    }

    //연결 상품 삭제
    const btnDel = (num)=>{
        if(num === 'author'){ // 저작권 계약 삭제시
            state.typeChk = false;
            state.contracts_name = '';
            stateData.contracts_id ='';
            stateData.company ='';
            state.productChkType = '';
            stateData.contract_type = '';
            stateData.brand = '';
        }else{
            state.prdData = '';
            stateData.connection_id = '';
        }
    }

    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback((type) => (e) => {
        if(type ==='expected_release_date'){
            if(e){
                stateData[type] = e.format('YYYY-MM-DD');  
            }            
        }else if(type === 'contract_type'){
            stateData[type] = e.target.value;
            if(e.target.value === '1' || e.target.value === '2'){
                chkAuthor(e.target.value);                
            }else{
                state.typeChk = false;
                state.authorData ='';
            }
            stateData[type] = e.target.value
        }else if(type === 'connection_type'){
            stateData[type] = e.selectedValue;
        }else{  
            stateData[type] = e.target.value;                                
        }                 
    },[],);

    //상품명 확인
    const handleChk = useCallback(
        (type) => (e) => {
            if(type === 'name'){
                chkData(e.target.value);
            }
    },[],);    

    //중복체크
    const chkData = useCallback(async (name) => {
        if (name !== '') {
            var keyword = '&keyword=' +name;
        } 

        if (name) {
            var axios = require('axios');

            var config = {
                method: 'GET',
                url:process.env.REACT_APP_API_URL +'/api/v1/products-code?display=100&page=1&sort_by=date&order=desc' +keyword,
                headers: {
                    Accept: 'application/json',
                },
            };

            axios(config)
                .then(function (result) {
                    if (result.data.success === false) {
                        Modal.error({
                            title: '오류가 발생했습니다.',
                            content: '오류코드:' + result.data.message,
                        });
                    } else {
                        if (result.data.data.length > 0) {                           
                            state.nameChk = true;
                        }else{
                            state.nameChk = false;
                        }
                    }
                })
                .catch(function (error) {
                    console.log(error.response);
                    Modal.error({
                        title: '오류가 발생했습니다. 재시도해주세요.',
                        content: '오류코드:' + error.response.status,
                    });
                });
        }
    }, []);   

    
      
    //등록
    const handleChkData = useCallback(async (e)=> {
        const data = toJS(stateData);
console.log(data)
        let chkVal = true;

        if(stateData['contract_type']=== ""){
            Modal.error({
                content: '저작권 계약 여부를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData['company'] === ""){
            Modal.error({
                content: '회사 선택해주세요.',        
            });
            chkVal = false;
            return;
        } 

        if(stateData['brand'] === ""){
            Modal.error({
                content: '브랜드를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData['product_type'] === ""){
            Modal.error({
                content: '상품 종류를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData['name'] === ""){
            Modal.error({
                content: '상품명을 작성해주세요.',        
            });
            chkVal = false;
            return;
        }
                       
        if(chkVal == true){
            if(stateData['connection_id'] === ''){
                confirm({
                    title: "연결 상품이 지정되지 않았습니다.",
                    // content: "없는 것이 확실하면 '확인' 버튼을, 지정하려면 '취소'버튼을  클릭해 주세요.",
                    content: (<div>
                                <p>없는 것이 확실하면 '확인' 버튼을,<br/> 지정하려면 '취소'버튼을  클릭해 주세요.</p>
                            </div>)
                    ,
                    onOk() {
                        handleSubmit(data);
                    }
                });

            }else{
                handleSubmit(data);
            }      
        }       
    }, []);      

    //등록
    const handleSubmit = useCallback(async (data)=> {        
        var axios = require('axios');

        var config={
            method:'POST',
            url:process.env.REACT_APP_API_URL +'/api/v1/products-code',
            headers:{
                'Accept':'application/json',
            },
                data:data
            };
            
        axios(config)
        .then(function(response){
            console.log(response);
            if(response.data.id != ''){
                Modal.success({
                    title: '담당 부서 확인 후 승인되면 알림을 받을 수 있습니다.',
                    onOk(){
                        visibleClose();
                        reset();
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
            console.log(error.response.status);
            Modal.error({
                title : '등록시 문제가 발생하였습니다.',
                content : '오류코드:'+error.response.status
            });  
        });
       
    }, []);      

    const [ drawerExtended, setDrawerExtended ] = useState(false);
    const drawerSizeHandler = () => {
        if(drawerExtended){
            setDrawerExtended(false);
            state.drawerback = 'drawerWrap';
            
        } else {
            setDrawerExtended(true);
            state.drawerback = 'drawerback drawerWrap';
        }
    }

    return (
        <Wrapper>
            <Drawer
                title='상품 코드 신청'
                placement='right'
                onClose={visibleClose}
                visible={visible}
                className={state.drawerback}
                closable={false}
                keyboard={false}
                extra={
                    <>
                        <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                            {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        </Button>
                        <Button onClick={visibleClose}>
                            <CloseOutlined />
                        </Button>
                    </>
                }
            >
                <Row gutter={10} className="table">       
                    <Col xs={24} lg={4} className="label">
                        저작권 계약 여부 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={20}>
                        {state.typeChk === false &&
                            <Radio.Group
                                value={stateData['contract_type']}
                                onChange={handleChangeInput('contract_type')}
                                required
                            >
                                <Radio value="1">저작권 계약 있는 상품(국내/직계약)</Radio>
                                <Radio value="2">저작권 계약 있는 상품(해외 수입)</Radio>
                                <Radio value="3">저작권 없는 상품(비매품 등)</Radio>
                            </Radio.Group>
                        }

                        {state.contracts_name !== '' &&
                            <Row>
                                <div>{state.contracts_name}<Button shape="circle" className="btn_del" onClick={(e) => btnDel('author')}>X</Button></div>
                            </Row>  
                        }                                              
                    </Col>

                    <Col xs={24} lg={4} className="label">
                        회사 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={20}>
                        <Radio.Group
                            value={stateData['company']}
                            onChange={handleChangeInput('company')}
                            disabled={stateData['contract_type'] === '1' || stateData['contract_type'] === '2' ? true : false}
                            required
                        >
                            {/* {state.companyOption.map((e) => (
                                <Radio value={e.code}>{e.name}</Radio>
                            ))} */}
                            <Radio value="G">도서출판 길벗</Radio>
                            <Radio value="S">길벗스쿨</Radio>
                        </Radio.Group>
                    </Col>

                    <Col xs={24} lg={4} className="label">
                        브랜드 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={20}>
                        <Radio.Group
                            value={stateData['brand']}
                            onChange={handleChangeInput('brand')}
                            // disabled={stateData['contract_type'] === '1' || stateData['contract_type'] === '2' ? true : false}
                            required
                        >
                            <Radio value='1' disabled={stateData.company === 'G' || stateData.company === '' ? false : true}>도서출판 길벗</Radio>
                            <Radio value='2' disabled={stateData.company === 'G' || stateData.company === '' ? false : true}>이지톡</Radio>
                            <Radio value='3' disabled={stateData.company === 'G' || stateData.company === '' ? false : true}>더퀘스트</Radio>
                            <Radio value='4' disabled={stateData.company === 'G' || stateData.company === '' ? false : true}>길벗캠퍼스</Radio>
                            <Radio value='5' disabled={stateData.company === 'S' || stateData.company === '' ? false : true}>길벗스쿨</Radio>
                        </Radio.Group>
                    </Col>

                    <Col xs={24} lg={4} className="label">
                        상품 종류 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={20}>
                        <Radio.Group
                            value={stateData['product_type']}
                            onChange={handleChangeInput('product_type')}
                            required
                        >
                             {/* {state.proOption.map((e) => (
                                <Radio value={e.code}>{e.name}</Radio>
                            ))} */}
                            <Radio value="1" disabled={state.productChkType === '1' || state.productChkType === '' ? false : true}>종이책(단권)</Radio>
                            <Radio value="2" disabled={state.productChkType === '1' || state.productChkType === '' ? false : true}>종이책(세트)</Radio>
                            <Radio value="3" disabled={state.productChkType === '2' || state.productChkType === '' ? false : true}>전자책</Radio>
                            <Radio value="4" disabled={state.productChkType === '3' || state.productChkType === '' ? false : true}>오디오북</Radio>
                            <Radio value="5" disabled={state.productChkType === '4' || state.productChkType === '' ? false : true}>동영상 강좌</Radio>
                            <Radio value="6" disabled={state.productChkType === '4' || state.productChkType === '' ? false : true}>기타 2차 저작물</Radio>
                            <Radio value="7" disabled={state.productChkType === '' ? false : true}>비매품</Radio>
                            <Radio value="8" disabled={state.productChkType === '' ? false : true}>판매용 일반 제품</Radio>

                        </Radio.Group>
                    </Col>

                    <Col xs={24} lg={4} className="label">
                        연결 상품
                        <Popover content={state.tooltipData[0]}>
                            <Button
                                shape="circle"
                                size="small"
                                className="btn_popover"
                                style={{ marginLeft: '5px' }}
                            >?</Button>
                        </Popover>
                    </Col>
                    <Col xs={24} lg={20}>
                        <Row> 
                            <Col>             
                                {stateData.connection_id !== '' &&
                                    <div>[{state.prdData.code}]{state.prdData.name}<Button shape="circle" className="btn_del" onClick={(e) => btnDel('pro')}>X</Button></div>
                                }                           
                                {state.prdData === '' &&
                                    <Button className="btn btn-primary btn_add" shape="circle" onClick={(e)=> {chkProDrawer()}}>+</Button>
                                } 
                            </Col>                           
                        </Row>
                        {state.prdData !== '' &&
                            <>신청하는 상품은 위 연결 상품의 
                            {/* <Select
                                style={{ width: '25%' , marginLeft: '3px'}}
                                placeholder="선택해주세요."
                                value={stateData.connection_type}
                                onChange={handleChangeInput('connection_type')}
                            > */}
                                {/* {state.bankOption.map((e) => ( 
                                    <Option value={'a'}>
                                        a
                                    </Option>
                                 ))} */}

                                {/* <Option value=''>선택해주세요.</Option>
                                <Option value='1'>개정판</Option>
                                <Option value='2'>증보판</Option>
                                <Option value='3'>개정증보판</Option>
                                <Option value='4'>전자책/오디오북(단권)</Option>
                                <Option value='5'>전자책/오디오북(분권)</Option>
                                <Option value='6'>동영상 강좌</Option>
                                <Option value='7'>부속 상품</Option>
                                <Option value='8'>종이책</Option>
                            </Select> */}
                            <wjInput.ComboBox
                                placeholder={"선택"}
                                itemsSource={new CollectionView(state.bankOption, {
                                    currentItem: null
                                })}
                                selectedValuePath="id"
                                displayMemberPath="text"
                                valueMemberPath="id"
                                selectedValue={stateData.connection_type}
                                textChanged={handleChangeInput('connection_type')}
                                style={{ width: '25%' , marginLeft: '3px'}}
                            />
                            입니다. ('종이책(세트)' 상품은 지정하지 않아도 됩니다.)  </>   
                        }
                    </Col>
                    
                    <Col xs={24} lg={4} className="label">
                        상품명 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={20}>
                        <Input className="tableInput" type="text" name="name" value={stateData.name} onChange={handleChangeInput('name')} onBlur={handleChk('name')} autoComplete="off" /> 
                        {state.nameChk === true && <span className="spanLeftRed"><ExclamationCircleOutlined /> 같은 상품명이 있습니다. 사용할 수 있지만, 중복 여부를 확인해 주세요.</span>}
                    </Col>

                    <Col xs={24} lg={4} className="label">
                       출시 예정(목표)일
                    </Col>
                    <Col xs={24} lg={20}>
                        {/* <DatePicker defaultValue={moment()} format={'YYYY-MM-DD'} onChange={handleChangeInput('expected_release_date')}  /> */}
                        <DatePicker format={'YYYY-MM-DD'} onChange={handleChangeInput('expected_release_date')}  />
                        <span className='spanLeft'><ExclamationCircleOutlined /> 등록해 주시면 연관 부서의 후속조치 계획 수립 등에 큰 도움이 됩니다.</span>
                    </Col>

                    <Col xs={24} lg={4} className="label"  style={{textAlign:'center'}}>
                        상품 코드 관련<br/>
                        요청/참고 사항
                    </Col>
                    <Col xs={24} lg={20}>
                        <Input.TextArea name="memo" rows={4} value={stateData.memo} onChange={handleChangeInput('memo')} autoComplete="off"/>
                    </Col>              
                </Row>          
                
                <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                    <Col>
                        <Button type="primary" htmlType="button" onClick={handleChkData}>
                            확인
                        </Button>
                        <Button htmlType="button" onClick={visibleClose} style={{marginLeft:'10px'}}>
                            취소
                        </Button>                        
                    </Col>
                </Row> 
            
                
                { chkVisible === true &&
                    <ChkAuthor  
                        chkVisible={chkVisible}
                        chkOnClose={chkOnClose}
                        authorData={authorData}
                        authorType={stateData.contract_type}
                    />           
                }            

                   
                { chkProduct === true &&
                    <ChkProduct  
                        chkVisible={chkProduct}
                        chkProOnClose={chkProOnClose}
                        proData={proData}
                        companyType={stateData.company}
                    />           
                }            


            </Drawer>
        </Wrapper>
    );
});

export default addDrawer;