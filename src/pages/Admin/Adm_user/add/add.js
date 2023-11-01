/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Table, Space, Button, Row, Col, Modal,  Input, Drawer, message, Checkbox, Radio, Select, Tabs, DatePicker, InputNumber, TimePicker, Tree, Typography} from 'antd';
import { PhoneOutlined, CloseOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';
import moment from 'moment';
import { ComboBox, InputMask, InputDate, InputTime, } from '@grapecity/wijmo.react.input';
import * as wjNav from '@grapecity/wijmo.react.nav';
import * as wjInput from '@grapecity/wijmo.react.input';
import { CollectionView } from '@grapecity/wijmo';

const { Option } = Select;
const { TabPane } = Tabs;
const { Text } = Typography;

const Wrapper = styled.div`
    width: 100%;
    `;

    const DEF_STATE = {
        // DB Data
        email: '',
        password: '',
        name: '',
        work_state : '',
        office_phone: '',
        phone: '',
        company: '',
        position:'',
        department: '',
        role: '',
        // join_date: moment().toDate(),
        join_date: '',
        work_type: '',
        work_period: '',
        // start_time: moment().set({ hour: 9, minute: 0 }).toDate(),
        start_time: '',
        // end_time: moment().set({ hour: 18, minute: 0 }).toDate(),
        end_time:'',
        work_place: '',
        birthday: '',
        birthday_lunar: '',
        gender: '',    
        mbti: '',
        profile_content: '',
        memo: '',
        tasks: [],
        use_yn:''
    };

const addDrawer = observer(({ visible, onClose, reset, id}) => {
    const { commonStore } = useStore();

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 

    const state = useLocalStore(() => ({
        
        data: [],
        id : '',          
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
        emailApiChk : false,          
        emailTypeChk : false,          
        departmentName : '',
    }));

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

    useEffect(() => { 
        state.id = id;
    }, [id]);

    useEffect(() => { 
        handleCodeType();        
        handleCodeDepartment();        
    }, []);

    // useEffect(() => {
    //     if(state.roleGrid){
    //       state.roleGrid.rows.forEach((row) => {
    //         row.isReadOnly = false;
    //         if (row.level >= 1) {
    //           row.isCollapsed = true;
    //         }
    //       });
    //     }
        
    // }, [state.roleGrid]);


    const visibleClose = () => {
        for (const key in DEF_STATE) {
            stateData[key] = DEF_STATE[key];
        }
        onClose(false);
    };  

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

        
    const handleChangeInput = useCallback(
        (type) => (e) => {
            var engChk = /[^a-z|A-Z ]/g;
            var emailChk = /[^a-z|A-Z|^0-9|@.]/g;

            if(type === "work_state"){
                stateData[type] = e.selectedValue; 
            } else if(type === "work_place") {
                stateData[type] = e; 
            } else{
                // if(type === "name"){
                //     const regExp = /[^ㄱ-ㅎ|ㅏ-ㅣ|가-힣a-zA-Z]/g;
                //     if (regExp.test(e.target.value)) {
                      
                //     }else{
                //         stateData[type] = e.target.value;   
                //     }
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


                // }else if(type === 'pwd' ){
                //     var pwdChk = isPwd(data['pwd']);
                //     if(pwdChk == false){                    
                      
                //     }else{
                //         stateData[type] = e.target.value;   
                //     }
                }else if(type === 'work_period'){
                    stateData[type] = e
                }else if(type === 'mbti'){                    
                    // stateData[type] = e.target.value.replace(/[^a-z|A-Z]/g, '');
                    if(engChk.test(e.target.value)){
                        // message.warning('영문만 입력 가능합니다.');
                        Modal.warning({
                            content: '영문만 입력 가능합니다.',        
                        });
                    }else{
                        stateData[type] = e.target.value.replace(/[^a-z|A-Z ]/g,'');                   
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
                        state.emailTypeChk = false;               
                    } 

                }else{
                    stateData[type] = e.target.value;    
                }
                
            }  
            
        },
        [],
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

    const handleChangeCheckbox = useCallback(
        (type) => (value) => {
            stateData[type] = value;
        },
        [],
    );

    const handleChangeDate = useCallback((type, val) => {
        if(type === "birthday" || type === "join_date" ){
            stateData[type] = moment(val).format('yyyy-MM-DD');              
        }else{
            stateData[type] = moment(val).format('HH:mm:ss');   
        }
                
        },[],
    );

    const handleChangePart = useCallback((e) => {
        stateData['team'] = e.panel.grid.selectedRows[0].dataItem.code;
    }, []);

    //이메일확인
    const isEmail = (email) => {
        const emailRegex =
          /^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
    
        return emailRegex.test(email);
    };

    // 비밀번호 확인
    const isPwd = (pwd) => {
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/;
        //const passwordCurrent = e.target.value
        //setPassword(passwordCurrent)
        return passwordRegex.test(pwd);
        // if (!passwordRegex.test(passwordCurrent)) {
        //     setPasswordMessage('영문, 숫자, 특수문자 조합으로 8자리 이상 입력해주세요.');
        //     setIsPassword(false);
        // } else {
        //     setPasswordMessage('');
        //     setIsPassword(true);
        // }
    };

    const initTreeView= (ctl) => {

    }

    const onItemClicked=(s) =>{

        if (s.selectedNode.hasChildren === false) {
            // stateData.department = s.selectedItem.name
            stateData.department = s.selectedItem.id
            state.departmentName = s.selectedItem.name
           
        } else {
            stateData.department = '';
            state.departmentName = '';
        }
    }

    const onCheckedItemsChanged= (items) => {

        stateData.department= items.selectedItem.id;
        // uncheck all other nodes when one is checked
        const checkedItems = items.checkedItems;
        for (let i = 0; i < checkedItems.length; i++) {
            const item = checkedItems[i];
            if (item && item.isChecked && item[i].id !== stateData.department) {
                item.isChecked = false;
            }
        }
        
    }

    const isCheckedChanging= (items) => {
        
        
    }

    //구글 API    
    const API_KEY = "AIzaSyAja4O_40TGq1BAMOrybZb-WGHdjHiadMU";
    const CLIENT_ID = "229873503608-i1609kqlrp60durr6slf0nfpi890r7i6.apps.googleusercontent.com";
   
    useEffect(() => {
        const script = document.createElement("script");
        script.async = true;
        script.defer = true;
        script.src = "https://apis.google.com/js/api.js";

        document.body.appendChild(script);

        script.addEventListener("load", () => {
            window.gapi.load("client:auth2", function() {
                // window.gapi.auth2.init({client_id: "229873503608-i1609kqlrp60durr6slf0nfpi890r7i6.apps.googleusercontent.com"});
                window.gapi.auth2.init({client_id: CLIENT_ID});
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
        // window.gapi.client.setApiKey("AIzaSyAja4O_40TGq1BAMOrybZb-WGHdjHiadMU");
        window.gapi.client.setApiKey(API_KEY);
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
    

    const treeData = state.teamType;

    const onSelect = (keys) => {
        stateData['team'] = keys[0];
    };


    const handleSubmit = useCallback(async (e)=> {
        // const data = toJS(stateData);
        // console.log(data);

        
        // if( data['is_admin']== ''){
        //     data['is_admin']=0;
        // }

        let chkVal = true;


        if(stateData['email']== "" ){
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
            var data = {name: stateData['name'],
                        email: stateData['email'],
                        password: stateData['password'],
                        phone: stateData['phone'],
                        office_phone: stateData['office_phone'],
                        birthday: moment(stateData['birthday']).format('YYYY-MM-DD'),
                        birthday_lunar: stateData['birthday_lunar'],
                        gender: stateData['gender'],    
                        profile_content: stateData['profile_content'],
                        memo: stateData['memo'],
                        work_state: stateData['work_state'],
                        work_type: stateData['work_type'],
                        work_period: stateData['work_period'],
                        join_date: moment(stateData['join_date']).format('YYYY-MM-DD'),
                        company: stateData['company'],
                        department: stateData['department'],
                        position: stateData['position'],
                        role: stateData['role'],
                        tasks: stateData['tasks'],
                        start_time: stateData['start_time'],
                        end_time: stateData['end_time'],
                        work_place:stateData['work_place'],
                        mbti: stateData['mbti']
                    }

            // return         


            var config={
                method:'POST',
                url:process.env.REACT_APP_API_URL +'/api/v1/users',
                headers:{
                    'Accept':'application/json',
                },
                    data:data
                };
                
            axios(config)
            .then(function(response){
                //console.log(response);
                if(response.data.success !== false){
                    Modal.success({
                        title: response.data.result,
                        onOk(){
                            reset();
                            visibleClose();
                        },
                    });
                }else{
                    Modal.error({
                        content:(<div>
                                    <p>등록시 문제가 발생하였습니다.</p>
                                    <p>재시도해주세요.</p>
                                    <p>오류코드: {response.data.message}</p>
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

    //트리뷰 모두 펼치기
    const onExpandedItem =(s, e) => {
        s.collapseToLevel(10);
    }
    
    return (
        <Wrapper>
            <Drawer
                title='사용자 추가'
                placement='right'
                onClose={visibleClose}
                visible={visible}
                className={state.drawerback}
                closable={false}
                keyboard={false}
                extra={
                    <Button>
                        <CloseOutlined />
                    </Button>
                }
            >
                <Row gutter={10} className="table">
                    <Col xs={24} lg={4} className="label">
                        회사 구글 계정 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Space direction='horizontal' >
                            <Input
                                name="email"
                                value={stateData['email']}
                                onChange={handleChangeInput('email')} 
                                onBlur={handleEmailChk('email')}
                                autoComplete='off'    
                            /> 
                            <Button type="primary" onClick={(e)=>googleChk()} >연결</Button>
                        </Space>
                    </Col>

                    <Col xs={24} lg={4} className="label">
                            비밀번호 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Input.Password
                            name="password"
                            value={stateData['password']}
                            autoComplete='new-password'
                            onChange={handleChangeInput('password')} />
                    </Col>

                    <Col xs={24} lg={4} className="label">
                        이름 <span className="spanStar">*</span>
                    </Col>
                    <Col xs={24} lg={8}>
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
                            placeholder={"선택"}
                            itemsSource={new CollectionView(state.work_stateOption, {
                                currentItem: null
                            })}
                            selectedValuePath="id"
                            displayMemberPath="name"
                            valueMemberPath="id"
                            selectedValue={stateData.work_state}
                            textChanged={handleChangeInput('work_state')}
                            style={{ width: '100%' }}
                            
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
                        // loadedItems={onExpandedItem.bind(this)}
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
                                <Checkbox.Group style={{ width: '100%' }} onChange={handleChangeCheckbox('tasks')} >
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
                        <DatePicker onChange={handleChangeDate.bind(this,'join_date')}  />
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
                                                    style={{width: 90}}
                                                    disabled={stateData.work_type === 67 ? false : true}
                                                    value={stateData['work_period']}
                                                    onChange={handleChangeInput('work_period')}
                                                    />)개월            
                                                    
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
                            <TimePicker format="HH:mm"  onChange={handleChangeDate.bind(this,'start_time')} />
                            <Text> ~ </Text>
                            <TimePicker format="HH:mm"  onChange={handleChangeDate.bind(this,'end_time')} />
                        
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
                            {/* <DatePicker defaultValue={moment(stateData['birthday'])} onChange={handleChangeDate.bind(this,'birthday')} />     */}
                            <DatePicker onChange={handleChangeDate.bind(this,'birthday')} />    
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