/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Table, Space, Button, Row, Col, Modal,  Input, Drawer, Checkbox, Radio, Select, Tabs, Popover, message, Typography} from 'antd';
import { PhoneOutlined, CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import * as wjInput from '@grapecity/wijmo.react.input';
import { CollectionView } from '@grapecity/wijmo';

import * as ValidationCheck from '../validate';
import tooltipData from '@pages/tooltipData';

const { Option } = Select;
const { TabPane } = Tabs;
const { Text } = Typography;

const Wrapper = styled.div`
    width: 100%;
    `;

    const DEF_STATE = {
        // DB Data
        name: "",
        company_no: "",
        address:'',
        phone: "",
        fax: "",
        process: [],
        bank_id: "",
        account_no: "",
        depositor: "",
        memo: "",
        use_yn: "Y",
        company_managers: [],
    };

const addDrawer = observer(({type, visible, onClose, reset}) => {
    const { commonStore } = useStore();

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 

    const state = useLocalStore(() => ({
        data: [],
        drawerback : 'drawerWrap',
        regNoChk: 'N', //국세청 확인 체크
        bankOption: [], //은행리스트

        managerArr : 
            {
                name: '',
                department: '',
                company_phone: '',
                cellphone: '',
                email: '',
            }
        ,

        tooltipData : '',
    }));
    
    useEffect(() => {       
        state.type= type;
        bankData();

        if(tooltipData !== '' && tooltipData !== undefined){
            var data = []
            tooltipData.forEach((e,num) => {
                if(e.id === 'author'){
                    data = [...data, (<div dangerouslySetInnerHTML={{__html: tooltipData[num].memo}}></div>)]
                }
            });
            // var data = (<div dangerouslySetInnerHTML={{__html: tooltipData[1].memo}}></div>);
            state.tooltipData = data
        } 
    }, [type]);

    //은행
    const bankData = useCallback(async () => {
        var axios = require('axios');

        var config = {
            method: 'GET',
            url:process.env.REACT_APP_API_URL +'/api/v1/banks?bank_type_id=1&simple=Y',
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
                state.bankOption = result.data.data;       
            }
        })
        .catch(function (error) {
            console.log(error);
            if(error.response !== undefined){
                Modal.error({
                    title: '오류가 발생했습니다. 재시도해주세요.',
                    content: '오류코드:' + error.response.status,
                });
            }
            
        });  

    }, []);

    const regNoChk = useCallback(async (val) => {
        if (stateData['company_no'] == '') {
            Modal.error({
                content: '사업자번호를 등록 후 클릭해주세요.',
            });
        } else {
            if(val === ''){
                // fetchData();
            }else{
                commonStore.loading = true;
                const result = await commonStore.handleApi({
                    method: 'POST',
                    url: '/check-bizInfo',
                    data: {
                        corp_num: stateData['company_no'],
                    },
                });

                result && result.BizInfo &&
                    !result.BizInfo.companyRegNum ? 
                        Modal.warning({
                            title: (
                                <div>
                                    등록되지 않은 사업자입니다.
                                </div>
                            ),
                        })
                    :
                        Modal.success({
                            title: '국세청 확인이 완료되었습니다.',
                            onOk() {
                                state.regNoChk = 'Y';
                            },
                        })
    
                
                commonStore.loading = false;
            }        
        }
    }, []);

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


    const visibleClose = () => {
        for (const key in DEF_STATE) {
            stateData[key] = DEF_STATE[key];
        }
        onClose(false);
    };  

    const handleChangeInput = useCallback(
        (type) => (e) => {
           
            if(type === "process" || type === "bank_id"){
                stateData[type] = e; 
            }else if(type === 'company_no'){
                var company_no = e.target.value.replace(/[^0-9]/g, '');
                var tmp = '';
                if( company_no.length < 4){
                    tmp = company_no;
                }else if(company_no.length < 6){
                    tmp = company_no.substr(0, 3)+'-'+company_no.substr(3,2);
                }else{              
                    tmp = company_no.substr(0, 3)+'-'+company_no.substr(3,2)+'-'+ company_no.substr(5,12);
                }
                stateData[type] =tmp;    

            }else{
                if(type === "name"){
                    const regExp = /[^ㄱ-ㅎ|ㅏ-ㅣ|가-힣a-zA-Z]/g;
                    if (regExp.test(e.target.value)) {
                      
                    }else{
                        stateData[type] = e.target.value;   
                    }
                }else if(type === 'fax' || type === 'phone'){
                    const regExp = /[^0-9]/g;
                    if (regExp.test(e.target.value)) {
                      
                    }else{
                        stateData[type] = e.target.value;   
                    }
                }else{
                    stateData[type] = e.target.value;    
                }
                
            }  
            
        },
        [],
    );

    const handleChangeTrArr = useCallback((type) => (e) => {
        if (type === 'company_phone' || type === 'cellphone') {
            var phone = e.target.value.replace(/[^0-9]/g, '');
            var tmp = '';
            if( phone.length < 4){
                tmp = phone;
            }else if(phone.length < 7){
                tmp = phone.substr(0, 3)+'-'+phone.substr(3);
            }else if(phone.length < 11){
                tmp = phone.substr(0, 3)+'-'+phone.substr(3, 3)+'-'+phone.substr(6);
            }else{              
                tmp = phone.substr(0, 3)+'-'+phone.substr(3, 4)+'-'+ phone.substr(7);
            }
            state.managerArr = {...state.managerArr,[type] : tmp};    
        }else if(type ==='email'){
            var tmp = e.target.value.replace(/[^\.@a-z|A-Z|0-9]/g,''); 
            state.managerArr = {...state.managerArr,[type] : tmp};    
        }else{
            state.managerArr = {...state.managerArr,[type] : e.target.value};    
        }    
    },[],);

    //거래담당자
    const createBtnTrans = ()=>{
        var chkVal = true;

        if(state.managerArr.name === '' ){
            Modal.error({
                content: '거래 담당자를 모두 작성 후 등록가능합니다.',        
            });
            chkVal = false;
            return;
        }

        if(state.managerArr.department === '' ){
            Modal.error({
                content: '거래 담당자를 모두 작성 후 등록가능합니다.',        
            });
            chkVal = false;
            return;
        }

        if(state.managerArr.company_phone === '' ){
            Modal.error({
                content: '거래 담당자를 모두 작성 후 등록가능합니다.',        
            });
            chkVal = false;
            return;
        }

        if(state.managerArr.cellphone === ''){
            Modal.error({
                content: '거래 담당자를 모두 작성 후 등록가능합니다.',        
            });
            chkVal = false;
            return;
        }
        
        if(state.managerArr.email === ''){
            Modal.error({
                content: '거래 담당자를 모두 작성 후 등록가능합니다.',        
            });
            chkVal = false;
            return;
        }
        

        if(chkVal = true){
            stateData.company_managers =[...stateData.company_managers,state.managerArr] ;
            state.managerArr = {
                name: '',
                department: '',
                company_phone: '',
                cellphone: '',
                email: '',
            };
        }
        
    }
    
    //담당자 삭제
    const transactionDel = (num)=>{
        var arrList = [];
        stateData.company_managers.map((e,index) => {
            if (index !== num) {
                arrList.push(e);
            }
        });
        stateData.company_managers = arrList;
    }

    //이메일확인
    const handleEmailChk = useCallback((type,subType,num) => (e) => {
        const emailRegex =/^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
        
        if(e.target.value != ''){
            if(emailRegex.test(e.target.value) == false){
                message.warning('올바른 이메일 주소를 입력해주세요.');
                 state.managerArr.email = '';
            } else{
                state.managerArr.email = e.target.value;
            }
        } 
    },[],);

    //등록
    const handleSubmit = useCallback(async (e)=> {

        const data = toJS(stateData);
        let res_validate;
        res_validate = ValidationCheck.AddValidation(data,state.regNoChk);

        if(res_validate.states!==true){
            Modal.error({
                content: res_validate.msg,        
            });
            return;
        }
        
        if(res_validate.states === true ){
            apiSubmit();
        }       
    }, []);  

    const apiSubmit = useCallback(async ()=> {
        const data = toJS(stateData);

        // var json = JSON.stringify(data);
        // return;

        var axios = require('axios');

        var config={
            method:'POST',
            url:process.env.REACT_APP_API_URL +'/api/v1/produce-company',
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
                        // resetChk();
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
                title='제작처 등록'
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
                        사업자명 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={20}>
                        <Input name="name" value={stateData['name']} onChange={handleChangeInput('name')}/>
                    </Col>               
                    <Col xs={24} lg={4} className="label">
                        사업자등록번호 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={20}>
                        <Input.Group>
                            <Row>
                                <Col span={5} style={{padding: '0 10px 0 0'}}>
                                    <Input
                                        type="tel"
                                        name="company_no"
                                        maxLength="14"
                                        value={stateData['company_no']} 
                                        onChange={handleChangeInput('company_no')}
                                        autoComplete="off"
                                    />  
                                </Col>
                                <Col span={5} style={{padding: '0 10px 0 0'}}>
                                    <Input type="hidden" id="regNoChk" name="regNoChk" value={state.regNoChk} />    
                                    <Button type="primary" className="btn_inner" style={{ width: '143px' }} onClick={regNoChk} >
                                        국세청 확인(필수)
                                    </Button>
                                </Col>
                            </Row>
                        </Input.Group>   
                    </Col>

                    <Col xs={24} lg={4} className="label">
                        주소
                    </Col>
                    <Col xs={24} lg={20}>
                        <Input
                            name="address"
                            value={stateData.address}
                            onChange={handleChangeInput('address')}
                        />
                    </Col>
                    <Col xs={24} lg={4} className="label">
                        전화번호
                    </Col>
                    <Col xs={24} lg={8}>
                        <Input
                            type="tel"
                            name="phone"
                            maxLength="13"
                            autoComplete="off"
                            value={stateData.phone}
                            onChange={handleChangeInput('phone')}
                        />
                    </Col>
                    <Col xs={24} lg={4} className="label">
                        팩스번호
                    </Col>
                    <Col xs={24} lg={8}>
                        <Input
                            type="tel"
                            name="fax"
                            maxLength="13"
                            value={stateData.fax}
                            onChange={handleChangeInput('fax')}
                            autoComplete="off"
                        />
                    </Col>
                    
                    <Col xs={24} lg={4} className="label">
                        담당 공정 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={20}>
                        <Checkbox.Group
                            onChange={handleChangeInput('process')}
                            value={stateData.process}
                            // options={['PrePress', '종이', '인쇄', '제본', '후가공', '부속 제작', '포장']}
                        >
                            <Checkbox value="8">PrePress</Checkbox>
                            <Checkbox value="2">종이</Checkbox>
                            <Checkbox value="3">인쇄</Checkbox>
                            <Checkbox value="4">제본</Checkbox>
                            <Checkbox value="5">후가공</Checkbox>
                            <Checkbox value="7">부속 제작</Checkbox>
                            <Checkbox value="6">포장</Checkbox>
                            <Checkbox value="9">포장 물품 제작</Checkbox>
                        </Checkbox.Group>
                    </Col>
                    
                    <Col xs={24} lg={4} className="label">
                        계좌 정보 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={20}>                        
                        <Input.Group>
                            <Row>
                                <Col span={8} style={{padding: '0 10px 0 0'}}>
                                    {/* <Select
                                        placeholder="은행 선택"
                                        style={{width:'100%'}}
                                        onChange={handleChangeInput('bank_id')}
                                    >
                                        {state.bankOption.map((e) => (
                                            <Option value={e.id}>
                                                {e.name}
                                            </Option>
                                        ))}
                                    </Select> */}
                                    <wjInput.ComboBox
                                        placeholder="선택"
                                        itemsSource={new CollectionView(state.bankOption, {
                                            currentItem: null
                                        })}
                                        selectedValuePath="id"
                                        displayMemberPath="name"
                                        valueMemberPath="id"
                                        textChanged={handleChangeInput('bank_id')}
                                        style={{ width: '100%' }}
                                    />
                                </Col>

                                <Col span={8} style={{padding: '0 10px 0 0'}}>
                                    <Input
                                        name="account_no"
                                        placeholder="계좌번호 (ex.123-12-123)"
                                        autoComplete="off"
                                        maxLength="20"
                                        value={stateData.account_no}
                                        onChange={handleChangeInput('account_no')}
                                    />
                                </Col>

                                <Col span={8} style={{padding: '0 10px 0 0'}}>
                                    <Input
                                        name="depositor"
                                        placeholder="예금주"
                                        value={stateData.depositor}
                                        onChange={handleChangeInput('depositor')}
                                        autoComplete="off"
                                    />
                                </Col>                                    
                            </Row>
                        </Input.Group>   
                    </Col>

                    <Col xs={24} lg={4} className="label">
                        담당자 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={20}>
                        {stateData.company_managers.length > 0 &&
                            stateData.company_managers.map((e,index) => (
                                <div>{e.name} / {e.department} / {e.company_phone} / {e.cellphone} / {e.email}<Button shape="circle" className="btn_del" onClick={(e) => transactionDel(index)}>X</Button></div>
                            ))
                        }
                        <Input.Group>
                            <Row>
                                <Col span={4} style={stateData.company_managers.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                    <Input type="text" 
                                        name="name" 
                                        placeholder="성명" 
                                        value={state.managerArr.name} 
                                        onChange={handleChangeTrArr('name')} 
                                        autoComplete="off"
                                    />   
                                </Col>
                                <Col span={5} style={stateData.company_managers.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                    <Input type="text" 
                                        name="department" 
                                        placeholder="부서" 
                                        value={state.managerArr.department} 
                                        onChange={handleChangeTrArr('department')} 
                                        autoComplete="off"
                                    /> 
                                </Col>

                                <Col span={4} style={stateData.company_managers.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                    <Input
                                        type="tel"
                                        name="company_phone"
                                        maxLength="13"
                                        placeholder="회사 전화번호" 
                                        value={state.managerArr.company_phone} 
                                        onChange={handleChangeTrArr('company_phone')} 
                                        prefix={<PhoneOutlined  className="site-form-item-icon" />}
                                        autoComplete="off"
                                    /> 
                                </Col>

                                <Col span={4} style={stateData.company_managers.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                    <Input
                                        type="tel"
                                        name="cellphone"
                                        maxLength="13"
                                        placeholder="휴대폰 번호" 
                                        value={state.managerArr.cellphone} 
                                        onChange={handleChangeTrArr('cellphone')} 
                                        prefix={<PhoneOutlined  className="site-form-item-icon" />}
                                        autoComplete="off"
                                    /> 
                                </Col>

                                <Col span={6} style={stateData.company_managers.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                    <Input 
                                        type="text" 
                                        name="email" 
                                        value={state.managerArr.email} 
                                        onChange={handleChangeTrArr('email')}
                                        onBlur={handleEmailChk('email')} 
                                        placeholder="이메일" 
                                        autoComplete="off"
                                    /> 
                                </Col>

                                <Col span={1} style={stateData.company_managers.length > 0 ? {padding: '10px 10px 0 0'} : {padding: '0 10px 0 0'} }>
                                    <Button className="btn btn-primary btn_add" shape="circle" onClick={createBtnTrans}>+</Button>
                                </Col>
                            </Row>
                        </Input.Group> 
                    </Col>

                    <Col xs={24} lg={4} className="label">
                        기타 참고사항
                    </Col>
                    <Col xs={24} lg={20}>
                        <Input.TextArea
                            name="memo"
                            value={stateData.memo}
                            onChange={handleChangeInput('memo')}
                            rows={4}
                        />
                    </Col>
                </Row>
                <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                    <Col>
                        <Button type="primary" onClick={handleSubmit} >
                            확인
                        </Button>
                    </Col>
                    <Col>
                        <Button htmlType="button" onClick={visibleClose} >
                            취소
                        </Button>
                    </Col>
                </Row>
            </Drawer>
        </Wrapper>
    );
});

export default addDrawer;