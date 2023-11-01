/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Space, Button, Row, Col, Modal, Breadcrumb, Input, InputNumber, Drawer, Checkbox, message, Radio, Popover, Select, Typography, DatePicker, TimePicker, Tree} from 'antd';
import { PhoneOutlined, QuestionOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';
import moment from 'moment';
import * as wjNav from '@grapecity/wijmo.react.nav';
import * as wjInput from '@grapecity/wijmo.react.input';
import { CollectionView } from '@grapecity/wijmo';

import { forEach } from 'jszip';

import dayjs from 'dayjs';


const { Option } = Select;
const { Text } = Typography;

const Wrapper = styled.div`
    width: 100%;
    .inner_dv {display:flex;flex-wrap:wrap}
    // .inner_dv .dvInline{display:block;margin:2px 10px 2px 0;}
    .inner_dv .dvInline{display:inline-block;margin:2px 10px 2px 0;}
    .inner_dv .dvInline .ant-btn{padding:0;}
    `;

const DEF_STATE = {
    // DB Data
  
    email: "",
    name: "",
    work_state: '',
    office_phone: "",
    phone: "",
    company: "",
    position: "",
    department: "",
    part: "",
    team: "",
    role: "",
    join_date: "",
    work_type: "",
    work_period: "",
    start_time: "",
    end_time: "",
    work_place: "",
    birthday: "",
    birthday_lunar: "",
    gender: "",
    mbti: "",
    profile_content: "",
    memo: "",
    is_admin: "",
    use_yn: "",
    created_id: "",
    updated_id: "",
    created_at: "",
    updated_at: "",
    tasks: [],
    changed_at:'',

};

const infoDrawer = observer(({ idx, popoutCloseVal, drawerChk, popoutChk, drawerClass, viewData}) => {
    const { commonStore } = useStore();

    const { Option } = Select;

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 

    const state = useLocalStore(() => ({
        data: [],
        dataOld: [],
        upData: {},
        drawerback : 'drawerWrap', //drawer class name
        showAllTree: false,
        roleGrid: null,

        companyOption : [],
        positionOption : [],
        roleOption : [],
        taskOption : [],
        work_placeOption : [],
        work_stateOption : [],
        work_typeOption : [],
        departmentOption : [],


        googleAuth : '',
        spanLabel:4,
        spanVal:20,
        spanVal2:8,
        mtSpanVal:12,
        innerSpanLabel:8,
        innerSpanVal:16,

        emailApiChk : false,          //이메일 중복체크
        emailTypeChk : false,           //이메일 영문숫자특수문자 체크
        departmentName : '',

    }));
    
    useEffect(() => { 
        handleCodeType();        
        handleCodeDepartment();        
    }, []);

    useEffect(() => {       
        state.popoutChk = popoutChk;
        fetchData(idx);
    }, [idx]);

    if(drawerChk !== 'Y'){
        state.spanLabel = 6;
        state.spanVal = 18;
        state.spanVal2 = 18;
        state.mtSpanVal = 24;
        state.innerSpanLabel = 6;
        state.innerSpanVal = 18;
    }

    const fetchData = useCallback(async (id) => {
        var axios = require('axios');

        var config = {
            method: 'GET',
            url:process.env.REACT_APP_API_URL +'/api/v1/users/'+id,
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
                var tasks =  result.data.data.tasks;
                var tasksArr = [];
                tasks.forEach(e => {
                    tasksArr = [...tasksArr, e.id]
                });

                if(result.data.data.changed_at === '' || result.data.data.changed_at === undefined || result.data.data.changed_at === null){
                    result.data.data.changed_at = moment().add(1,'days').toDate()
                }

                for (const key in result.data.data) {
                    for (const key2 in stateData) {
                        if(key == key2){
                            stateData[key] = result.data.data[key];
                        }                       
                    }
                }

                stateData.tasks = tasksArr
                state.departmentName = result.data.data.department_info.name
                state.dataOld = stateData
            }
        })
        .catch(function (error) {
            console.log(error);
            console.log(error.response);
            if(error.response !== undefined){
                Modal.error({
                    title: '오류가 발생했습니다. 재시도해주세요.',
                    content: '오류코드:' + error.response.status,
                });
            }
            
        });
        
    }, []);

    const handleCodeType = useCallback(async () => {
        var axios = require('axios');

        var config = {
            method: 'GET',
            url: process.env.REACT_APP_API_URL +'/api/v1/users-common-code',
            headers: {
                Accept: 'application/json',
            },
        };

        
        axios(config)
        .then(function (response) {     
            state.companyOption = response.data.company;
            state.positionOption= response.data.position;
            state.roleOption= response.data.role;
            state.taskOption = response.data.task;
            state.work_placeOption= response.data.work_place;
            state.work_stateOption = response.data.work_state;
            state.work_typeOption = response.data.work_type;
            
        })
        .catch(function (error) {
            console.log(error.response);
            if(error.response !== undefined){
                if (error.response.status === 401) {
                    Modal.error({
                        title : '문제가 발생하였습니다.',
                        content : '오류코드:'+error.response.status
                    });  
                } 
            }
            
        });
    }, []);

    const handleCodeDepartment = useCallback(async () => {
        var axios = require('axios');

        var config = {
            method: 'GET',
            // url: process.env.REACT_APP_API_URL +'/api/v1/select-department-codes?cost_attribution_company=2',
            url: process.env.REACT_APP_API_URL +'/api/v1/department-codes',
            headers: {
                Accept: 'application/json',
            },
        };

        
        axios(config)
        .then(function (response) {     

            state.departmentOption = response.data.data;
            
        })
        .catch(function (error) {
            console.log(error.response);
            if(error.response !== undefined){
                if (error.response.status === 401) {
                    Modal.error({
                        title : '문제가 발생하였습니다.',
                        content : '오류코드:'+error.response.status
                    });  
                } 
            }
            
        });
    }, []);


    
    const popoutClose = (val) => {
        popoutCloseVal(val);
    };    

    const classChkBtn = (val)=>{
        drawerClass(val)     
    }

    //drawer add
    const [addVisible, setAddVisible] = useState(false);
    const chkDrawer = (type) => {
        
        if(drawerChk === 'Y'){
            classChkBtn('drawerback');
        }
        setAddVisible(true);
        state.typeChk = type;
    };

    const handleChangeInput = useCallback(
        (type) => (e) => {
            var engChk = /[^a-z|A-Z ]/g;
            var emailChk = /[^a-z|A-Z|^0-9|@.]/g;

            if(type === "work_state"){
                stateData[type] = e.selectedValue; 
                dataChange(type,  e.selectedValue);
            } else if (type === "work_place"){
                stateData[type] = e; 
                dataChange(type,  e);
            } else {
                if(type === 'office_phone' || type === 'phone'){
                    var phone = e.target.value.replace(/[^0-9]/g, '');
                    var tmp = '';
                    if (phone.length <= 4) {
                        tmp = phone;
                    } else if (phone.length < 7) {
                        tmp = phone.substr(0, 3) + '-' + phone.substr(3);
                    } else if (phone.length === 9) {
                        tmp =
                            phone.substr(0, 2) +
                            '-' +
                            phone.substr(2, 3) +
                            '-' +
                            phone.substr(5);
                    } else if (phone.length === 10) {
                        tmp =
                            phone.substr(0, 3) +
                            '-' +
                            phone.substr(3, 3) +
                            '-' +
                            phone.substr(6);
                    } else {
                        tmp =
                            phone.substr(0, 3) +
                            '-' +
                            phone.substr(3, 4) +
                            '-' +
                            phone.substr(7);
                    }
                    stateData[type] = tmp;
                    dataChange(type,  tmp) 

                }else if(type === 'work_period'){
                    stateData[type] = e
                    dataChange(type,  e) 
                }else if(type === 'mbti'){                    
                    if(engChk.test(e.target.value)){
                        Modal.warning({
                            content: '영문만 입력 가능합니다.',        
                        });
                    }else{
                        stateData[type] = e.target.value.replace(/[^a-z|A-Z ]/g,'');   
                        dataChange(type,  e.target.value.replace(/[^a-z|A-Z|@.]/g,'')) 
                    } 
                    
                }else if(type === 'email'){
                    if(emailChk.test(e.target.value)){
                        Modal.warning({
                            content: '영문 또는 숫자 또는 특수문자(@.)만 입력 가능합니다.',        
                        });
                        state.emailTypeChk = true;
                    }else{
                        var data = e.target.value.replace(/[^a-z|A-Z|^0-9|@.]/g,'');
                        stateData[type] = data;     
                        dataChange(type, data)   
                        state.emailTypeChk = false;               
                    } 
                }else{
                    stateData[type] = e.target.value;    
                    dataChange(type, e.target.value) 
                }              
            }  
        },
        [],
    );

    const handleChangeCheckbox = useCallback(
        (type) => (value) => {
            stateData[type] = value;
            dataChange(type, value)      
        },[],
    );
    const handleChangeDate = useCallback((type, val) => {
        if(type === "birthday" || type === "join_date" || type ==="changed_at"){
            stateData[type] = moment(val).format('yyyy-MM-DD');       
            dataChange(type, moment(val).format('yyyy-MM-DD'))        
        }else{
            stateData[type] = moment(val).format('HH:mm:ss');  
            dataChange(type, moment(val).format('HH:mm:ss')) 
        }           
        
        },[],
    );

     //이메일확인
     const handleEmailChk = useCallback(
        (type) => (e) => {
            const emailRegex =
                /^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;

            if (e.target.value != '' && state.emailTypeChk === false ) {
                if (emailRegex.test(e.target.value) == false) {
                    // message.warning('올바른 이메일 주소를 입력해주세요.');
                    Modal.error({
                        content: '올바른 이메일 주소를 입력해주세요.',        
                    });
                    // stateData[type] = '';
                } else {
                    stateData[type] = e.target.value;
                    dataChange(type, e.target.value)   
                    handleEmailChkAPI()
                }
            }
        },
        [],
    );

    const handleEmailChkAPI = useCallback(async () => {
        if(stateData.email !== '' && stateData.email !== undefined){
            const emailRegex =
                /^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;

            if (emailRegex.test(stateData.email) == false) {
                // message.warning('올바른 이메일 주소를 입력해주세요.');
                Modal.error({
                    content: '올바른 이메일 주소를 입력해주세요.',        
                });
                stateData.email = '';
            } else {
               
                if(state.emailTypeChk === false ){
                    const result = await axios.get(
                        process.env.REACT_APP_API_URL +'/api/v1/users?display=50&page=1&sort_by=date&order=desc&email='+stateData.email,
                        {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        },
                    )
            
                    var cnt = result.data.data.length;
                    if(cnt > 0){
                        Modal.error({
                            content: '이미 사용중인 이메일입니다.',        
                        });
                        // stateData.email = '';
                        state.emailApiChk = true
                        
                    }else{
                        state.emailApiChk = false
                    }
                }                
            }
            
        }   else{
            Modal.error({
                content: '회사 구글 계정을 작성해주세요.',        
            });
        }     
    }, []);

    //수정 데이터 담기
    const dataChange=(type, val)=>{
        state.upData[type] = val
        console.log(toJS(state.upData))

    }

    const disabledDate =(current)=>{
        return current < moment().add(-1,'days').toDate();
    }

    const initTreeView= (ctl) => {
        console.log(ctl);
    }

    const onItemClicked=(s) =>{
        if (s.selectedNode.hasChildren === false) {
            console.log( s.selectedItem)
            stateData.department = s.selectedItem.id
            state.departmentName = s.selectedItem.name
            dataChange('department' , s.selectedItem.id)
        } else {
            stateData.department = '';
            state.departmentName = '';
            dataChange('department' , '')   
        }
    }

    //구글 API    
    const API_KEY = "AIzaSyAja4O_40TGq1BAMOrybZb-WGHdjHiadMU";
    const CLIENT_ID = "229873503608-i1609kqlrp60durr6slf0nfpi890r7i6.apps.googleusercontent.com";
    const CLIENT_KEY = "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";
   
    useEffect(() => {
        const script = document.createElement("script");
        script.async = true;
        script.defer = true;
        script.src = "https://apis.google.com/js/api.js";

        document.body.appendChild(script);

        script.addEventListener("load", () => {
            window.gapi.load("client:auth2", function() {
                window.gapi.auth2.init({client_id: "229873503608-i1609kqlrp60durr6slf0nfpi890r7i6.apps.googleusercontent.com"});
            });            
         });

    }, []);


    function authenticate() {
        return window.gapi.auth2.getAuthInstance()
        .signIn({scope: "https://www.googleapis.com/auth/admin.directory.user https://www.googleapis.com/auth/admin.directory.user.readonly https://www.googleapis.com/auth/cloud-platform"})
        .then(function() {  },
                function(err) { console.error("Error signing in", err); });
    }

    function loadClient() {
        window.gapi.client.setApiKey("AIzaSyAja4O_40TGq1BAMOrybZb-WGHdjHiadMU");
        return window.gapi.client.load("https://admin.googleapis.com/$discovery/rest?version=directory_v1")
            .then(function() {  execute();  },
                  function(err) { console.error("Error loading window.gapi client for API", err); });
    }


    function execute() {        
        return window.gapi.client.directory.users.list({
          "domain": "gilbut.co.kr",
          "projection": "basic",
          "query": stateData.email
        })
        .then(function(response) {
            // Handle the results here (response.result has the parsed body).
            console.log(response.result.users);
            if(response.result.users == '' || response.result.users == undefined){
                Modal.error({
                    content: '구글 계정 정보를 찾을 수 없습니다.' ,        
                });  
            }else{
                var user = response.result.users[0];
                stateData.name = user.name.fullName;
    
                user.phones.forEach(e => {
                    if(e.type === 'work'){
                        stateData.office_phone = e.value;
                    }else{
                        stateData.phone = e.value;
                    }
                });    
            }           
            
        },
        function(err) { console.error("Execute error", err); });
    }
    const googleChk = useCallback(async () => {
        commonStore.loading = true;

        if(stateData.email!== "" && stateData.email !== undefined){
            if(state.emailTypeChk === false && state.emailApiChk === false){
                authenticate().then(loadClient);
            }else{
                if(state.emailTypeChk === true){
                    Modal.warning({
                        content: '영문 또는 숫자 또는 특수문자(@.)만 입력 가능합니다.',        
                    });
                }else{
                    Modal.error({
                        content: '이미 사용중인 이메일입니다.',        
                    });
                }
            }
    
        }else{
            Modal.error({
                content: '회사 구글 계정을 작성후 연결 버튼을 눌러주세요.' ,        
            });  
        }
        
        commonStore.loading = false;
    }, []);
    
    const handleSubmit = useCallback(async (e)=> {
        let chkVal = true;


        if(stateData['email'] ==='' ){
            Modal.error({
                content: '회사 구글 계정을 입력해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData['password']== ""){
            Modal.error({
                content: '비밀번호를 입력해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData['name']== ""){
            Modal.error({
                content: '이름을 입력해주세요.',        
            });
            chkVal = false;
            return;
        }


        if(stateData['work_state']== ""){
            Modal.error({
                content: '근무 상태를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData['company']== ""){
            Modal.error({
                content: '소속 회사를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData['position']== ""){
            Modal.error({
                content: '직책을 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData['department']== ""){
            Modal.error({
                content: '부서를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData['role']== ""){
            Modal.error({
                content: '부서 내 역활을 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData['tasks'].length == 0){
            Modal.error({
                content: '담당 업무를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData['join_date']== ""){
            Modal.error({
                content: '입사일을 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData['work_type']== ""){
            Modal.error({
                content: '근무 형태를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }else{
            if(stateData['work_period']== "" && stateData['work_type']== 67){
                Modal.error({
                    content: '계약직 근무기간을 작성해주세요.',        
                });
                chkVal = false;
                return;
            }
        }

        if(stateData['start_time']== ""){
            Modal.error({
                content: '근무 시간를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData['end_time']== "" ){
            Modal.error({
                content: '근무 시간를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData['work_place']== ""){
            Modal.error({
                content: '근무 장소를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData['birthday']== ""){
            Modal.error({
                content: '생일을 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData['birthday_lunar']== ""){
            Modal.error({
                content: '생일을 선택해주세요.',        
            });
            chkVal = false;
            return;
        }
        

        if(stateData['gender']== "" ){
            Modal.error({
                content: '성별을 선택해주세요.',        
            });
            chkVal = false;
            return;
        }    

        if(chkVal == true){
            console.log(toJS(state.upData))

            var config={
                method:'PUT',
                url:process.env.REACT_APP_API_URL +'/api/v1/users/'+idx,
                headers:{
                    'Accept':'application/json',
                },
                    data:state.upData
                };
                
            axios(config)
            .then(function(response){
                if(response.data.id != ''){
                    Modal.success({
                        title: response.data.result,
                        onOk(){
                            state.upData = {};
                            fetchData(idx)
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
                console.log(error.response) 
                Modal.error({
                    title: '오류가 발생했습니다. 재시도해주세요.',
                    content: '오류코드:'+error.response.status,  
                });  
            });
        }
       
    }, []);

    const onInitialized=(sender)=> {
        console.log(sender.value)
    }

    return (
        <Wrapper>
            <Row gutter={10} className="table">
                <Col xs={24} lg={state.spanLabel} className="label">
                    회사 구글 계정 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={state.spanVal2}>
                    <Space direction='horizontal' >
                        <Input
                            name="email"
                            value={stateData['email']}
                            onChange={handleChangeInput('email')} 
                            onBlur={handleEmailChk('email')}
                            autoComplete='off'    
                        /> 
                        {/* <Button type="primary" onClick={googleChk} >연결</Button> */}
                    </Space>
                </Col>
                
                <Col xs={24} lg={state.spanLabel} className="label">
                    비밀번호 변경 
                </Col>
                <Col xs={24} lg={state.spanVal2}>
                    <Input.Password
                        name="password"
                        autoComplete='new-password'
                        value={stateData['password']}
                        onChange={handleChangeInput('password')} />
                </Col>
            
                <Col xs={24} lg={state.spanLabel} className="label">
                    이름 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={state.spanVal2}>
                    <Input
                        name="name"
                        value={stateData['name']}
                        onChange={handleChangeInput('name')}
                    />
                </Col>
                
                <Col xs={24} lg={4} className="label">
                    근무 상태 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={8}>                        
                    {/* <Select
                        style={{ width: '100%' }}
                        value={stateData.work_state ==='' ? '선택': stateData.work_state}
                        onChange={handleChangeInput('work_state')}
                    >
                        { state.work_stateOption.map((e) => (
                            <Option value={e.id}  >
                                {e.name}
                            </Option>
                        ))}
                    </Select> */}
                    <wjInput.ComboBox
                        itemsSource={new CollectionView(state.work_stateOption, {
                            currentItem: null
                        })}
                        textChanged={handleChangeInput('work_state')}
                        style={{ width: '100%' }}
                        placeholder="선택"
                        selectedValuePath="id"
                        displayMemberPath="name"
                        selectedValue={stateData.work_state}
                    />
                </Col>

                <Col xs={24} lg={4} className="label">
                    회사 전화번호
                </Col>
                <Col xs={24} lg={8}>
                    <Input
                        type="tel"
                        name="office_phone"
                        maxLength="13"
                        value={stateData.office_phone}
                        prefix={<PhoneOutlined  className="site-form-item-icon" />}
                        onChange={handleChangeInput('office_phone')}
                    />
                </Col>


                <Col xs={24} lg={4} className="label">
                    휴대폰 번호
                </Col>
                <Col xs={24} lg={8}>
                    <Input
                        type="tel"
                        name="phone"
                        maxLength="13"
                        value={stateData.phone}
                        prefix={<PhoneOutlined  className="site-form-item-icon" />}
                        onChange={handleChangeInput('phone')}
                    />
                </Col>

                <Col xs={24} lg={4} className="label">
                    소속 회사 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={8}>
                    <Radio.Group
                        value={stateData['company']}
                        onChange={handleChangeInput('company')}
                        required
                    >
                        { state.companyOption.map((e) => (
                            <Radio value={e.id} >
                                {e.name}
                            </Radio>
                        ))}                            
                    </Radio.Group>
                </Col>

                <Col xs={24} lg={4} className="label">
                    직책 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={8}>
                    <Radio.Group
                        value={stateData['position']}
                        onChange={handleChangeInput('position')}
                        required
                    >
                        { state.positionOption.map((e) => (
                            <Radio value={e.id} >
                                {e.name}
                            </Radio>
                        ))}   
                    </Radio.Group>
                </Col>

                <Col xs={24} lg={4} className="label">
                    부서 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={8}>
                    {/* <Tree
                        // treeData={treeData}
                        treeData={state.departmentOption}
                        onSelect={onSelect}
                        checkable
                    /> */}
                    <wjNav.TreeView itemsSource={state.departmentOption} displayMemberPath="name" childItemsPath={'child,children'.split(',')}
                    itemClicked={onItemClicked.bind(this)}
                    // showCheckboxes={true} 
                    // checkedItemsChanged={onCheckedItemsChanged.bind(this)} 
                    // isCheckedChanging={isCheckedChanging.bind(this)}
                    initialized={initTreeView.bind(this)}></wjNav.TreeView>
                    {/* <span style={{display:stateData.department !=='' ? 'block' : 'none'}}>{stateData.department}가 선택되었습니다.</span> */}
                    <span style={{marginLeft:5, fontWeight:600, display:stateData.department !=='' ? 'block' : 'none'}}>부서 선택 : {state.departmentName}</span>

                </Col>
                <Col xs={24} lg={12} className="innerCol">
                    <Row>
                        <Col xs={24} lg={8} className="label">
                            부서 내 역할 <span className="spanStar">*</span>
                        </Col>
                        <Col xs={24} lg={16}>
                                <Radio.Group
                                value={stateData['role']}
                                onChange={handleChangeInput('role')}
                                required
                            >
                                { state.roleOption.map((e) => (
                                    <Radio value={e.id} >
                                        {e.name}
                                    </Radio>
                                ))}                            
                            </Radio.Group>
                        </Col>
                        <Col xs={24} lg={8} className="label">
                            담당 업무 <span className="spanStar">*</span>
                        </Col>
                        <Col xs={24} lg={16}>
                            <Checkbox.Group style={{ width: '100%' }} onChange={handleChangeCheckbox('tasks')} value={stateData.tasks}>
                            { state.taskOption.map((e) => (
                                <Checkbox value={e.id} >
                                    {e.name}
                                </Checkbox>
                            ))}
                            </Checkbox.Group>
                        </Col>
                    </Row>
                </Col>
                
                <Col xs={24} lg={4} className="label">
                    입사일 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={8}>
                    <DatePicker onChange={handleChangeDate.bind(this,'join_date')} defaultValue={moment(stateData['join_date'])} value={moment(stateData['join_date'])} />
                </Col>

                <Col xs={24} lg={4} className="label">
                    근무 형태 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={8}>
                    <Input.Group compact>
                        <Space direction='horizontal'>
                            <Radio.Group
                                value={stateData['work_type']}
                                onChange={handleChangeInput('work_type')}
                                required
                            >
                                { state.work_typeOption.map((e) => (
                                    e.id === 67 ? 
                                        <><Radio value={e.id} >                                       
                                            {e.name}(<InputNumber 
                                                disabled={stateData.work_type === 67 ? false : true}
                                                value={stateData['work_period']}
                                                onChange={handleChangeInput('work_period')} />)개월                                            
                                        </Radio></>

                                    :   <><Radio value={e.id} >                                       
                                            {e.name}                                        
                                        </Radio></>
                                ))}  
                            </Radio.Group>
                        </Space>
                    </Input.Group>
                </Col>

                <Col xs={24} lg={4} className="label">
                    근무시간과 장소 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={8}>
                    <Space direction='horizontal' style={{width:'100%',marginBottom:'5px'}}>
                        {/* <TimePicker format="HH:mm" defaultValue={moment(stateData.start_time)} onChange={handleChangeDate.bind(this,'start_time')} /> */}
                        {/* <TimePicker format="HH:mm" onChange={handleChangeDate.bind(this,'start_time')}  value={dayjs(stateData.start_time, 'HH:mm')} /> */}
                        <TimePicker format="HH:mm" onChange={handleChangeDate.bind(this,'start_time')}  value={moment(stateData.start_time, 'HH:mm')} />
                        <Text> ~ </Text>
                        <TimePicker format="HH:mm" onChange={handleChangeDate.bind(this,'end_time')}  value={moment(stateData.end_time, 'HH:mm')}/>
                    
                        <Select
                            style={{ width: 150 }}
                            value={stateData.work_place ==='' ? '선택': stateData.work_place}
                            onChange={handleChangeInput('work_place')}
                        >
                            { state.work_placeOption.map((e) => (
                                <Option value={e.id}  >
                                    {e.name}
                                </Option>
                            ))}
                        </Select>
                    </Space>
                </Col>
    
                <Col xs={24} lg={4} className="label">
                    생일 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={8}>
                    <Space direction='horizontal'>
                        <DatePicker onChange={handleChangeDate.bind(this,'birthday')} defaultValue={moment(stateData['birthday'])} value={moment(stateData['birthday'])} />
                        <Radio.Group
                            value={stateData['birthday_lunar']}
                            onChange={handleChangeInput('birthday_lunar')}
                            required
                        >
                            <Radio value="양력">양력</Radio>
                            <Radio value="음력">음력</Radio>
                        </Radio.Group>        
                    </Space>
                </Col>

                <Col xs={24} lg={4} className="label">
                    성별 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={8}>
                    <Radio.Group
                        value={stateData['gender']}
                        onChange={handleChangeInput('gender')}
                        required
                    >                           
                        <Radio value="남성" >남성 </Radio>
                        <Radio value="여성" >여성 </Radio>
                    </Radio.Group>
                </Col>

                <Col xs={24} lg={4} className="label">
                    MBTI
                </Col>
                <Col xs={24} lg={8}>
                    <Input
                        name="mbti"
                        value={stateData['mbti']}
                        maxLength = "4"
                        onChange={handleChangeInput('mbti')}
                    />
                </Col>
                
                <Col xs={24} lg={4} className="label">
                    공개용 프로필
                </Col>
                <Col xs={24} lg={8}>
                    <Input.TextArea
                        name="profile_content"
                        rows={4}
                        value={stateData['profile_content']}
                        onChange={handleChangeInput('profile_content')} />
                </Col>

                <Col xs={24} lg={4} className="label">
                    관리용 메모
                </Col>
                <Col xs={24} lg={8}>
                    <Input.TextArea
                        name="memo"
                        rows={4}
                        value={stateData['memo']}
                        onChange={handleChangeInput('memo')} />
                </Col>

                <Col xs={24} lg={state.spanLabel} className="label">
                    변경적용일 <span className="spanStar">*</span>
                </Col>
                <Col xs={24} lg={state.spanVal}>
                    <DatePicker disabledDate={disabledDate} onChange={handleChangeDate.bind(this,'changed_at')} defaultValue={moment(stateData['changed_at'])} value={moment(stateData['changed_at'])} />
                </Col>
            </Row>
            <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                <Col>
                    {state.popoutChk === 'Y'
                        ?<>
                            <Button type="button" htmlType="button"  onClick={e => popoutClose('Y')} style={{marginLeft:'10px'}}> 닫기</Button>
                        </>

                        : <>
                            <Button type="primary" htmlType="button" onClick={handleSubmit}> 확인</Button>
                            {drawerChk == "Y" && state.adminChk === true && 
                                <Button htmlType="button" onClick={e => popoutClose('Y')} style={{marginLeft:'10px'}}> 취소 </Button>
                            }     
                        </>                    
                    }     
                </Col>
            </Row>

        </Wrapper>
    );
});

export default infoDrawer;