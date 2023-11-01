/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Table, Space, Button, Row, Col, Modal,  Input, Drawer, Search, Checkbox, Radio, Select, Tabs, DatePicker, InputNumber, TimePicker,Tree} from 'antd';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';
import { PhoneOutlined, CloseOutlined } from '@ant-design/icons';
import { FlexGrid,FlexGridColumn,FlexGridCellTemplate  } from '@grapecity/wijmo.react.grid';

import {
    ComboBox,
    InputMask,
    InputDate,
    InputTime,
} from '@grapecity/wijmo.react.input';

import moment from 'moment';
import {TreeView} from '@grapecity/wijmo.react.nav';

 import qs from "qs";
import { map } from 'styled-components-breakpoint';
// import { useGoogleApi  } from 'react-gapi';

//import {google}  from 'googleapis';





const { Option } = Select;
const { TabPane } = Tabs;

const Wrapper = styled.div`
    width: 100%;
    `;

const formItemLayout = {
    labelCol: {
        xs: {
        span: 24,
        },
        sm: {
        span: 4,
        },
    },
    wrapperCol: {
        xs: {
        span: 24,
        },
        sm: {
        span: 20,
        },
    },
};
const tailBtnLayout = {
    wrapperCol: {
        xs: {
        span: 24,
        offset: 0,
        },
        sm: {
        span: 20,
        offset: 4,
        },
    },
};

const DEF_STATE = {
    // DB Data
    userid: '',
    name: '',
    google_account_id: '',
    email: '',
    password: '',
    is_admin: '',   //관리자 여부 (추우에 바뀔수있음 일단 0으로 전송)

    phone: '',
    office_phone: '',
    birthday: moment().toDate(),
    birthday_lunar: '',
    gender: '',    
    profile_content: '',
    memo: '',
    work_state: '',
    work_type: '',
    work_period: '',
    join_date: moment().toDate(),
    company: '',
    department: '',     //트리구조인 부서 항목중 하나 (department > part > team)
    part: '',           //트리구조인 부서 항목중 하나   
    team: '',
    class: '',
    role: '',
    team_ord: '',       //트리구조인 부서 항목중 하나(팀내 순번 항목 추후에 수정 일단 0으로)
    start_time: moment().set({ hour: 9, minute: 0 }).toDate(),
    end_time: moment().set({ hour: 18, minute: 0 }).toDate(),
    work_place: '',
    mbti: '',
    account_type : 'G'
    
};

const addDrawer = observer(({ visible,onClose,reset, id }) => {
    const { commonStore } = useStore();

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 

    const state = useLocalStore(() => ({
        data: [],
        id : '',          
        drawerback : '', 
        showAllTree: false,
        roleGrid: null,

        companyType : [],          
        classType : [],          
        teamType : [],          
        roleType : [],          
        workType2 : [],          
        workStateType : [],          
        workPlaceType : [],          
        workType : [],          
        genderType : [],          
        accountType : [],          
        googleAuth : '',          
    }));

    useEffect(() => { 
        state.id = id;
    }, [id]);

    useEffect(() => { 
        handleCodeType();        
    }, []);

    useEffect(() => {
        if(state.roleGrid){
          state.roleGrid.rows.forEach((row) => {
            row.isReadOnly = false;
            if (row.level >= 1) {
              row.isCollapsed = true;
            }
          });
        }
        
    }, [state.roleGrid]);


    const visibleClose = () => {
        for (const key in DEF_STATE) {
            stateData[key] = DEF_STATE[key];
        }
        onClose(false);
    };  

    const handleCodeType = useCallback(async () => {
        commonStore.loading = true;
        const result = await commonStore.handleApi({
          url: 'member/code_type',
        });
    
        console.log(result);

        state['companyType'] = result.company;   //회사
        state['classType'] = result.class;   //직급
        state['teamType'] = result.team_view;   //부서
        state['roleType'] = result.role;  //부서 내 역할
        state['workType2'] = result.work; //담당 업무
        state['workStateType'] = result.work_state; //근무상태
        state['workPlaceType'] = result.work_place; //근무장소
        state['genderType'] = result.gender; //성별
        state['workType'] = result.work_type; //근무형태
        //state['accountType'] = result.account_type; //계정형태
    
        commonStore.loading = false;
    }, []);

        
    const handleChangeInput = useCallback(
        (type) => (e) => {
            // if (type === 'phone' || type === 'office_phone') {
            //     stateData[type] = e.rawValue;
            // // }else{ if(type === 'work_state'){
            // //     stateData[type] = e.checkedItems;
            if(type === "work_state" || type === "work_place"){
                //console.log(e);
                stateData[type] = e; 
            }else{
                if(type === "userid"){
                    const regExp = /[^0-9a-zA-Z]/g;
                    if (regExp.test(e.target.value)) {
                      
                    }else{
                        stateData[type] = e.target.value;   
                    }
                }else if(type === "name"){
                    const regExp = /[^ㄱ-ㅎ|ㅏ-ㅣ|가-힣a-zA-Z]/g;
                    if (regExp.test(e.target.value)) {
                      
                    }else{
                        stateData[type] = e.target.value;   
                    }
                }else if(type === 'office_phone' || type === 'phone'){
                    const regExp = /[^0-9]/g;
                    if (regExp.test(e.target.value)) {
                      
                    }else{
                        stateData[type] = e.target.value;   
                    }
                // }else if(type === 'pwd' ){
                //     var pwdChk = isPwd(data['pwd']);
                //     if(pwdChk == false){                    
                      
                //     }else{
                //         stateData[type] = e.target.value;   
                //     }
                }else{
                    stateData[type] = e.target.value;    
                }
                
            }  
            
        },
        [],
    );

    const handleChange = useCallback(
        (type) => (e) => {
            handleChkID(type, e.target.value);
        },
        [],
    );

    const [idChk, setIdChk] = useState('');
    const [emailChk, setEmailChk] = useState('');

    const handleChkID = useCallback(async (type,val) => {
        if(val){

            if(type == 'email'){
                var text = '&email='+val
            }else{
                var text = '&userid='+val
            }

            const result = await axios.get(
                process.env.REACT_APP_API_URL +'/api/v1/users?display=50&page=1&sort_by=date&order=desc'+text,
                {
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  },
                },
            )
    
            var cnt = result.data.data.length;
            if(cnt > 0){
                if(type === "userid"){
                    setIdChk('* 이미 사용중인 아이디입니다.');
                }else{
                    setEmailChk('* 이미 사용중인 이메일입니다.');
                }
                stateData[type] = '';
                
            }else{
                if(type === "userid"){
                    setIdChk('');
                }else{
                    setEmailChk('');
                }
            }
        }        
    }, []);

    const handleChangeCheckbox = useCallback(
        (type) => (value) => {
            stateData[type] = value;
        },
        [],
    );

    const handleChangeDate = useCallback((type, val) => {
        if(type === "birthday" || type === "join_date"){
            //stateData[type] = val.text;      
            stateData[type] = val.value;      
        }else{
            stateData[type] = moment(val.value).format('HH:mm');   
        }
                
        },[],
    );

    const handleChangePart = useCallback((e) => {
        stateData['team'] = e.panel.grid.selectedRows[0].dataItem.code;
        console.log(stateData['team']);
    }, []);

    //이메일확인
    const isEmail = (email) => {
        const emailRegex =
          /^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
    
        return emailRegex.test(email);
    };

    // 비밀번호 확인
    const isPwd = (pwd) => {
        console.log(pwd);
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

    const handleSubmit = useCallback(async (e)=> {
        const data = toJS(stateData);
        console.log(data);

        
        if( data['is_admin']== ''){
            data['is_admin']=0;
        }

        let chkVal = true;

        if( data['account_type'] == 'G' ){
            if(data['email']== "" ){
                Modal.error({
                    content: '회사 구글 계정을 입력해주세요.',        
                });
                chkVal = false;
                return;
            }
            
        }else{
            if(data['email']== "" ){
                Modal.error({
                    content: '이메일을 입력해주세요.',        
                });
                chkVal = false;
                return;
            }else{
                var emailChk = isEmail(data['email']);
                if(emailChk == false){
                    Modal.error({
                        content: '이메일 형식이 아닙니다. 재입력해주세요.',        
                    });
                    chkVal = false;
                    return;
                }
            }

        }

        

        if(data['userid']== ""){
            Modal.error({
                content: '아이디를 입력해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(data['password']== ""){
            Modal.error({
                content: '비밀번호를 입력해주세요.',        
            });
            chkVal = false;
            return;
        }else{
            var pwdChk = isPwd(data['password']);
            if(pwdChk == false){
                Modal.error({
                    content: '영문, 숫자, 특수문자 조합으로 8자리 이상 입력해주세요.',        
                });
                chkVal = false;
                return;
            }
        }
        

        if(data['name']== ""){
            Modal.error({
                content: '이름을 입력해주세요.',        
            });
            chkVal = false;
            return;
        }


        if(data['work_state']== ""){
            Modal.error({
                content: '근무 상태를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(data['company']== ""){
            Modal.error({
                content: '소속 회사를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(data['class']== ""){
            Modal.error({
                content: '직급을 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(data['team']== ""){
            Modal.error({
                content: '부서를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(data['role']== ""){
            Modal.error({
                content: '부서 내 역활을 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(data['work']== ""){
            Modal.error({
                content: '담당 업무를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(data['join_date']== ""){
            Modal.error({
                content: '입사일을 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(data['work_type']== ""){
            Modal.error({
                content: '근무 형태를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }else{
            if(data['work_period']== "" && data['work_type']== "C"){
                Modal.error({
                    content: '계약직 근무기간을 작성해주세요.',        
                });
                chkVal = false;
                return;
            }
        }

        if(data['start_time']== ""){
            Modal.error({
                content: '근무 시간를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(data['end_time']== "" ){
            Modal.error({
                content: '근무 시간를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(data['work_place']== ""){
            Modal.error({
                content: '근무 장소를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(data['birthday']== ""){
            Modal.error({
                content: '생일을 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(data['birthday_lunar']== ""){
            Modal.error({
                content: '생일을 선택해주세요.',        
            });
            chkVal = false;
            return;
        }
        

        if(data['gender']== "" ){
            Modal.error({
                content: '성별을 선택해주세요.',        
            });
            chkVal = false;
            return;
        }    

        if(chkVal == true){
            if(data['account_type'] == 'G' ){
                data['email'] = data['email']+'@gilbut.co.kr';
            }
            const result = await axios.post(
                process.env.REACT_APP_API_URL +'/api/v1/users',
                {
                    userid: data['userid'],
                    name: data['name'],
                    email: data['email'],
                    password: data['password'],
                    is_admin: data['is_admin'],
                
                    phone: data['phone'],
                    office_phone: data['office_phone'],
                    birthday: moment(data['birthday']).format('YYYY-MM-DD'),
                    birthday_lunar: data['birthday_lunar'],
                    gender: data['gender'],    
                    profile_content: data['profile_content'],
                    memo: data['memo'],
                    work_state: data['work_state'],
                    work_type: data['work_type'],
                    work_period: data['work_period'],
                    join_date: moment(data['join_date']).format('YYYY-MM-DD'),
                    company: data['company'],
                    department: data['department'],
                    part: data['part'],
                    team: data['team'],
                    class: data['class'],
                    role: data['role'],
                    team_ord: data['team_ord'],
                    start_time: moment(data['start_time']).format('HH:mm:ss'),
                    end_time: moment(data['end_time']).format('HH:mm:ss'),
                    work_place:data['work_place'],
                    mbti: data['mbti'],
                    headers: {
                        'Content-type': 'application/json',
                    },
                },
            )

          
            if(result.data.success != false){
                Modal.success({
                    content: '사용자 추가가 완료되었습니다.',
                    onOk() {
                        reset();
                        visibleClose();
                    },
                });
            }else{
                var error = JSON.stringify(result.data.data);
                Modal.error({
                    //content: '등록시 문제가 발생하였습니다. 재시도해주세요. 오류코드 : '+result.data.message + error,        
                    content: '등록시 문제가 발생하였습니다. 재시도해주세요. 오류코드 : '+ error,        
                });      
            }
        }
       
    }, []);

    const initTreeView= (ctl) => {
        console.log(ctl);
    }

    const onCheckedItemsChanged= (items) => {
        console.log(items);
        stateData['team'] = items.selectedItem.code;
       // let items = this._wjTreeViewControl.checkedItems;
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
        if(stateData['email']!= ""){
            authenticate().then(loadClient);
    
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
        console.log(stateData['team']);
    };


    return (
        <Wrapper>
            <Drawer
                title="사용자관리 > 추가"
                placement='right'
                onClose={visibleClose}
                visible={visible}
                className={state.drawerback == '' ? 'drawerWrap' : 'drawerback drawerWrap'}
                keyboard={false}
                extra={
                    <Button>
                        <CloseOutlined />
                    </Button>
                }
            >

                <Row gutter={10} className="table">
                    <Col xs={8} lg={4} className="label">
                        계정 구분 *
                    </Col>
                    <Col xs={28} lg={20}>
                        <Radio.Group
                            value={stateData.account_type}
                            onChange={handleChangeInput('account_type')}
                            required
                        >                            
                            <Radio value='G' >회사 구글 계정</Radio>
                            <Radio value='A' >일반</Radio>
                        </Radio.Group>
                    </Col>                

                    {stateData.account_type == "G" ? 
                        <><Col xs={8} lg={4} className="label">
                                회사 구글 계정 *
                            </Col><Col xs={16} lg={8}>
                                    <Input
                                        name="email"
                                        value={stateData['email']}
                                        onChange={handleChangeInput('email')} />@gilbut.co.kr
                                        <Button htmlType="button" onClick={googleChk} >연결</Button>
                                </Col>
                                <Col xs={8} lg={4} className="label">
                                    추가 아이디 *
                                </Col><Col xs={16} lg={8}>
                                        <Input
                                            name="userid"
                                            value={stateData['userid']}
                                            onChange={handleChangeInput('userid')} 	onBlur={handleChange('userid')}/>
                                        {idChk}
                                </Col><Col xs={8} lg={4} className="label">
                                    비밀번호 *
                                </Col><Col xs={16} lg={8}>
                                        <Input.Password
                                            name="password"
                                            autoComplete='new-password'
                                            value={stateData['password']}
                                            onChange={handleChangeInput('password')} />
                                </Col></>
                    :
                        <><Col xs={8} lg={4} className="label">
                                아이디 *
                            </Col><Col xs={16} lg={8}>
                                    <Input
                                        name="userid"
                                        value={stateData['userid']}
                                        onChange={handleChangeInput('userid')} 	onBlur={handleChange('userid')}/>
                                    {idChk}
                                </Col><Col xs={8} lg={4} className="label">
                                    비밀번호 *
                                </Col><Col xs={16} lg={8}>
                                        <Input.Password
                                            name="password"
                                            value={stateData['password']}
                                            autoComplete='new-password'
                                            onChange={handleChangeInput('password')} />
                                </Col><Col xs={8} lg={4} className="label">
                                    이메일 주소 *
                                </Col>
                                <Col xs={16} lg={8}>
                                    <Input
                                        name="email"
                                        value={stateData['email']}
                                        onChange={handleChangeInput('email')}
                                        onBlur={handleChange('email')}                            
                                    />
                                    {emailChk}
                                </Col></>
                    }

                    
                </Row>

                <Row gutter={10} className="table">
                    <Col xs={8} lg={4} className="label">
                        이름 *
                    </Col>
                    <Col xs={16} lg={8}>
                        <Input
                            name="name"
                            value={stateData['name']}
                            onChange={handleChangeInput('name')}
                        />
                    </Col>
                    
                    <Col xs={8} lg={4} className="label">
                        근무 상태 *
                    </Col>
                    <Col xs={16} lg={8}>                        
                        <Select
                            showSearch
                            style={{ width: 200 }}
                            placeholder="선택"
                            optionFilterProp="children"
                            filterOption={true}
                            onChange={handleChangeInput('work_state')}
                        >
                            {state.workStateType.map((item) => (
                                <Option value={item['code']} key={item['code']} >
                                    {item['name']}
                                </Option>
                            ))}
                            {/* <Option value="Y" key="work_state_Y" checked={stateData['work_state'] == "Y"? true : false}>재직중</Option>
                            <Option value="N" key="work_state_N" checked={stateData['work_state'] == "N"? true : false}>퇴사</Option> */}
                        </Select>
                    </Col>

                    <Col xs={8} lg={4} className="label">
                        회사 전화번호
                    </Col>
                    <Col xs={16} lg={8}>
                        <Input
                            type="tel"
                            name="office_phone"
                            maxLength="11"
                            value={stateData.office_phone}
                            prefix={<PhoneOutlined  className="site-form-item-icon" />}
                            onChange={handleChangeInput('office_phone')}
                        />
                    </Col>

                    <Col xs={8} lg={4} className="label">
                        휴대폰 번호
                    </Col>
                    <Col xs={16} lg={8}>
                        <Input
                            type="tel"
                            name="phone"
                            maxLength="11"
                            value={stateData.phone}
                            prefix={<PhoneOutlined  className="site-form-item-icon" />}
                            onChange={handleChangeInput('phone')}
                        />
                    </Col>

                    <Col xs={8} lg={4} className="label">
                        소속 회사 *
                    </Col>
                    <Col xs={16} lg={8}>
                        <Radio.Group
                            value={stateData['company']}
                            onChange={handleChangeInput('company')}
                            required
                        >
                            {state.companyType.map((item) => (
                                <Radio value={item['code']} >
                                    {item['name']}
                                </Radio>
                            ))}
                        </Radio.Group>
                    </Col>

                    <Col xs={8} lg={4} className="label">
                        직급 *
                    </Col>
                    <Col xs={16} lg={8}>
                        <Radio.Group
                            value={stateData['class']}
                            onChange={handleChangeInput('class')}
                            required
                        >
                            {state.classType.map((item) => (
                                <Radio value={item['code']} >
                                    {item['name']}
                                </Radio>
                            ))}
                        </Radio.Group>
                    </Col>

                    <Col xs={8} lg={4} className="label">
                        부서 *
                    </Col>
                    <Col xs={16} lg={8}>
                        <Tree
                            treeData={treeData}
                            onSelect={onSelect}
                        />
                        {/* <TreeView itemsSource={state.teamType} displayMemberPath="name" childItemsPath="children" showCheckboxes={true} checkedItemsChanged={onCheckedItemsChanged.bind(this)} initialized={initTreeView.bind(this)}></TreeView> */}
                        {/* <FlexGrid
                            initialized={(grid) => (state.roleGrid = grid)}
                            itemsSource={state.teamType}
                            headersVisibility="Column"
                            //beginningEdit={onBeginningEdit}
                            childItemsPath={'children'}
                            selectionMode="Row"
                            allowDragging={false}
                            allowResizing={false}
                            allowSorting={false}
                            isReadOnly={true}
                            onSelectionChanged={handleChangePart}                            
                        >
                            <FlexGridColumn binding="name" dataType="String" width="*" >
                                <FlexGridCellTemplate
                                    cellType="ColumnHeader"
                                    template={(context) => {
                                        return (
                                        <Space>
                                            <Button
                                            type="text"
                                            size="small"
                                            onClick={handleChangeShowAllTree}
                                            >
                                            {state.showAllTree ? '[원래대로]' : '[전체 펼치기]'}
                                            </Button>
                                            <span>부서명</span>
                                        </Space>
                                        );
                                    }}
                                    />
                            </FlexGridColumn>
                            <FlexGridColumn binding="name" dataType="String" width="*" />
                            <FlexGridColumn binding="chkbox" header="선택"></FlexGridColumn>
                            <FlexGridCellTemplate cellType="ColumnFooter" template={null} />
                        </FlexGrid> */}
                    </Col>

                    <Col xs={8} lg={4} className="label">
                        부서 내 역할 *
                    </Col>
                    <Col xs={16} lg={8}>
                        <Radio.Group
                            value={stateData['role']}
                            onChange={handleChangeInput('role')}
                            required
                        >
                            {state.roleType.map((item) => (
                                <Radio value={item['code']} >
                                    {item['name']}
                                </Radio>
                            ))}
                        </Radio.Group>
                    </Col>

                    <Col xs={8} lg={4} className="label">
                        담당 업무 *
                    </Col>
                    <Col xs={16} lg={8}>
                        <Checkbox.Group style={{ width: '100%' }} onChange={handleChangeCheckbox('work')} >
                            {state.workType2.map((item) => (
                                <Checkbox value={item['code']} >
                                    {item['name']}
                                </Checkbox>
                            ))}
                        </Checkbox.Group>
                    </Col>

                    <Col xs={8} lg={4} className="label">
                        입사일 *
                    </Col>
                    <Col xs={16} lg={8}>
                        <InputDate
                            value={stateData['join_date']}
                            valueChanged={handleChangeDate.bind(this,'join_date')}
                        />
                    </Col>

                    <Col xs={8} lg={4} className="label">
                        근무 형태 *
                    </Col>
                    <Col xs={16} lg={8}>
                        <Input.Group compact>
                            <Radio.Group
                                value={stateData['work_type']}
                                onChange={handleChangeInput('work_type')}
                                required
                            >
                                {state.workType.map((item) => (
                                    <Radio value={item['code']} >
                                        {item['name']}
                                    </Radio>
                                ))}
                            </Radio.Group> 
                            {stateData.work_type == "P010204C0002" &&
                                <>(<InputNumber 
                                    style={{ width: '20%' }} 
                                    disabled={true} 
                                    value={stateData['work_period']}
                                    onChange={handleChangeInput('work_period')} />)개월</>
                            }

                            
                        </Input.Group> 
                    </Col>

                    <Col xs={8} lg={4} className="label">
                        근무시간과 장소 *
                    </Col>
                    <Col xs={16} lg={8}>
                        <Input.Group compact>
                            <InputTime
                                style={{width:110}}
                                value={stateData.start_time}
                                valueChanged={handleChangeDate.bind(this,'start_time')} 
                            /> ~ 
                            <InputTime
                                style={{width:110}}
                                value={stateData.end_time}
                                valueChanged={handleChangeDate.bind(this,'end_time')}
                            />

                            <Select
                                showSearch
                                style={{ width: '40%' }}
                                placeholder="근무 장소"
                                optionFilterProp="children"
                                filterOption={true}
                                onChange={handleChangeInput('work_place')}
                            >
                                {state.workPlaceType.map((item) => (
                                    <Option value={item['code']} key={item['code']} >
                                        {item['name']}
                                    </Option>
                                ))}
                            </Select>

                        </Input.Group>
                    </Col>
        
                    <Col xs={8} lg={4} className="label">
                        생일 *
                    </Col>
                    <Col xs={16} lg={8}>
                        <InputDate
                            style={{width:150}}
                            value={stateData['birthday']}
                            valueChanged={handleChangeDate.bind(this,'birthday')}
                        />
                        <Radio.Group
                            value={stateData['birthday_lunar']}
                            onChange={handleChangeInput('birthday_lunar')}
                            required
                        >
                            <Radio value="N">양력</Radio>
                            <Radio value="Y">음력</Radio>
                        </Radio.Group>
                    </Col>


                    <Col xs={8} lg={4} className="label">
                        성별 *
                    </Col>
                    <Col xs={16} lg={8}>
                        <Radio.Group
                            value={stateData['gender']}
                            onChange={handleChangeInput('gender')}
                            required
                        >
                            {state.genderType.map((item) => (
                                <Radio value={item['code']} >
                                    {item['name']}
                                </Radio>
                            ))}
                        </Radio.Group>
                    </Col>

                    <Col xs={8} lg={4} className="label">
                        MBTI
                    </Col>
                    <Col xs={16} lg={8}>
                        <Input
                            name="mbti"
                            value={stateData['mbti']}
                            onChange={handleChangeInput('mbti')}
                        />
                    </Col>
                    
                    <Col xs={8} lg={4} className="label">
                        공개용 프로필
                    </Col>
                    <Col xs={16} lg={8}>
                        <Input.TextArea
                            name="profile_content"
                            rows={4}
                            value={stateData['profile_content']}
                            onChange={handleChangeInput('profile_content')} />
                    </Col>

                    <Col xs={8} lg={4} className="label">
                        관리용 메모
                    </Col>
                    <Col xs={16} lg={8}>
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