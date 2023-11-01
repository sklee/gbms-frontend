/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Row, Col, Modal,  Input, Checkbox, Radio, Select, InputNumber,DatePicker, TimePicker, Tree} from 'antd';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';

//import { GoogleLogin } from 'react-google-login';
import { FlexGrid, FlexGridColumn } from '@grapecity/wijmo.react.grid';


import { PhoneOutlined } from '@ant-design/icons';
import {TreeView} from '@grapecity/wijmo.react.nav';

import moment from 'moment';
import axios from 'axios';
import { map } from 'styled-components-breakpoint';



//구글 로그인 연동 ID
const clientId = "229873503608-i1609kqlrp60durr6slf0nfpi890r7i6.apps.googleusercontent.com";

const { Option } = Select;

const Wrapper = styled.div`
  width: 100%;
`;

const DEF_STATE = {
    // DB Data
    id: '',
    userid: '',
    name: '',
    email: '',
    phone: '',
    office_phone: '',
    birthday:  '',
    birthday_lunar: '',
    gender: '',
    is_admin: '',   //관리자 여부 (추후에 바뀔수있음 일단 0으로 전송)
    profile_content: '',
    admin_memo: '',
    work_state: '',
    work_type: '',
    work_period: '',
    join_date: '',
    company: '',
    department: '',     //트리구조인 부서 항목중 하나 (department > part > team)
    part: '',           //트리구조인 부서 항목중 하나   
    team: '',
    class: '',
    role: '',
    team_ord: '',       //트리구조인 부서 항목중 하나(팀내 순번 항목 추후에 수정 일단 0으로)
    start_time: '',
    end_time: '',
    work_place: '',
    memo: '',
    mbti: '',
    work : [],
    created_id : '',

};

const ViewInfo = observer(({ id,  popoutCloseVal,popoutChk }) => {
    const { commonStore } = useStore();

    const stateData = useLocalStore(() => ({ ...DEF_STATE }));

    const state = useLocalStore(() => ({
        data: '',
        //formData: new FormData(),
        popoutChk: '',

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
        checkedItems : [], 
        
        //teamParent : '', 

    }));

    const dateFormat = 'yyyy-MM-dd';

    useEffect(() => { 
        state.id = id;
        state.popoutChk = popoutChk;
        fetchData(id);  
        //handleCodeType();       
    }, [id,popoutChk]);

    useEffect(() => { 
        handleCodeType(); 
        //fetchData();      
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

    const popoutClose = (val) => {
        state.data='';
        popoutCloseVal(val);
    };

    const [account_type, setAccountType] = useState('G');

    const fetchData = useCallback(async (id) => {

        if(state.id){
            axios.get(process.env.REACT_APP_API_URL +'/api/v1/users/'+state.id, {
                headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
                },
            })
            .then(function (response) {
            console.log(response);

                for (const key in response.data.data) {
                    stateData[key] = response.data.data[key];
                } 
                setTeam(stateData['team']);
                console.log(stateData);
                var emailChk = stateData['email'].split('@');

                if(emailChk[1] !="gilbut.co.kr"){
                    setAccountType('A');
                }else{
                    setAccountType('G');
                }
                if(stateData['join_date'] == ""){
                    stateData['join_date'] = moment().toDate();
                }

                state.checkedItems = stateData['team'];
                //state.data = response.data.data;

                // if(stateData['team']){
                //     teamParentChk(stateData['team']);
                // }
                
            }).catch(function (error) {
                Modal.error({
                    content: '문제가 발생하였습니다. 재시도해주세요.' ,        
                }); 
            });
        }
    }, []);

    //const [teamParent, setTeamParent] = useState('');

    // const teamParentChk = useCallback(async (val) => {
    //     commonStore.loading = true;
    //     const result = await commonStore.handleApi({
    //       method: 'POST',
    //       url: 'member/team_parent_chk',
    //       data: {'team' : val},
    //     });
        
    //     console.log(result);
    //     if(result){
    //         //setTeamParent(result);
    //         state.teamParent = result;
    //     }

    //     commonStore.loading = false;
    // }, []);

    const handleCodeType = useCallback(async () => {
        commonStore.loading = true;
        const result = await commonStore.handleApi({
          url: 'member/code_type',
        });
    
        state['companyType'] = result.company;   //회사
        state['classType'] = result.class;   //직급
        //state['teamType'] = JSON.stringify(result.team_view);   //부서
        state['teamType'] = result.team_view;   //부서
        //state['teamType'] = result.team;   //부서
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
            var cnt = state.data.length;
            // if (type === 'phone' || type === 'office_phone') {
            //     stateData[type] = e.rawValue;
            // // }else{ if(type === 'work_state'){
            // //     stateData[type] = e.checkedItems;
            if(type === "work_state" || type === "work_place"){
                //console.log(e);
                stateData[type] = e; 
                state.data = {...state.data, [type]:e};
                //state.formData= {...state.data, [type]:e};
            }else if(type == 'ccount_type'){
                setAccountType(e);
            }else{
                if(type === "userid"){
                    const regExp = /[^0-9a-zA-Z]/g;
                    if (regExp.test(e.target.value)) {
                      
                    }else{
                        stateData[type] = e.target.value;   
                        state.data = {...state.data, [type]:e.target.value};
                        //state.formData.append(type, e.target.value);
                    }
                }else if(type === "name"){
                    const regExp = /[^ㄱ-ㅎ|ㅏ-ㅣ|가-힣a-zA-Z]/g;
                    if (regExp.test(e.target.value)) {
                      
                    }else{
                        stateData[type] = e.target.value;   
                        state.data = {...state.data, [type]:e.target.value};
                        //state.formData.append(type, e.target.value);
                    }
                }else if(type === 'office_phone' || type === 'phone'){
                    const regExp = /[^0-9]/g;
                    if (regExp.test(e.target.value)) {
                      
                    }else{
                        stateData[type] = e.target.value;   
                        state.data = {...state.data, [type]:e.target.value};
                        //state.formData.append(type, e.target.value);
                    }
                // }else if(type === 'pwd' ){
                //     var pwdChk = isPwd(data['pwd']);
                //     if(pwdChk == false){                    
                      
                //     }else{
                //         stateData[type] = e.target.value;   
                //     }
                }else{
                    if(type === 'account_type'){
                        setAccountType(e.target.value);
                    }
                    stateData[type] = e.target.value;    
                    state.data = {...state.data, [type]:e.target.value};
                    //state.formData= {...state.data, [type]:e.target.value};
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
            var cnt = state.data.length;
            stateData[type] = value;
            state.data = {...state.data, [type]:value};
        },
        [],
    );

    const handleChangeDate = useCallback((type) =>  (value) => {
        var cnt = state.data.length;

        if(value != ''){
            if(type === "birthday" || type === "join_date"){
                stateData[type] = moment(value).format('YYYY-MM-DD');      
                //state.data[cnt] = {[type]:moment(value).format('YYYY-MM-DD')};      
                state.data = {...state.data, [type]:moment(value).format('YYYY-MM-DD')};
            }else{
                stateData[type] = moment(value).format('HH:mm')+':00';   
               // state.data[cnt] = {[type]:moment(value).format('HH:mm')+':00'};  
               state.data = {...state.data, [type]:moment(value).format('HH:mm')+':00'};
            }  
        }
               
        },[],
    );

    const handleChangePart = useCallback((e) => {
        stateData['team'] = e.panel.grid.selectedRows[0].dataItem.code;
        console.log(stateData['team']);
        state.data = {...state.data, 'team':e.panel.grid.selectedRows[0].dataItem.code};
    }, []);


    const handleChangeShowAllTree = useCallback((e) => {
        state.showAllTree = !state.showAllTree;
  
        if (state.showAllTree) {
          state.roleGrid.rows.forEach((row) => {
            row.isCollapsed = false;
          });
        } else {
            state.roleGrid.rows.forEach((row) => {
            if (row.level >= 1) {
              row.isCollapsed = true;
            }
          });
        }
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
        if(state.data == "" || state.data == undefined){
            Modal.error({
                content: '수정할 내용이 없습니다.' ,        
            }); 
        }else{
            var axios = require('axios');
            var data = JSON.stringify(state.data);

            var config={
                method:'put',
                url:process.env.REACT_APP_API_URL +'/api/v1/users/'+state.id,
                headers:{
                    'Accept':'application/json',
                    'Content-Type':'application/json',
                },
                    data:data
                };
                
            axios(config)
            .then(function(response){
                console.log(JSON.stringify(response.data));
                if(response.data.user != '' && response.data.info != ''){
                    Modal.success({
                        content: '수정이 완료되었습니다.',
                    });
                }else{
                    Modal.error({
                        content: '수정시 문제가 발생하였습니다. 재시도해주세요. ',        
                    });  
                }
            })
            .catch(function(error){
                Modal.error({
                    content: '수정시 문제가 발생하였습니다. 재시도해주세요. ',        
                });
            });
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

    const google_change = ()=>{
        setAccountType('G');
        stateData['email'] = stateData['userid'];
        //googleChk();
    }


    const onChange = (type,value)=>{
        console.log(type, value);
    }

    
    const treeData = state.teamType;
    // console.log("treeData : " + JSON.stringify(treeData))
    const [team, setTeam] = useState('');

    const onSelect = (keys) => {
        stateData['team'] = keys[0];
        state.data = {...state.data, ['team']: keys[0]};
        console.log(stateData['team']);
    };

    return (
        <Wrapper>
        
            <Row gutter={10} className="table">
                {/* <Col xs={8} lg={4} className="label">
                    계정 구분 *
                </Col>
                <Col xs={28} lg={20}>
                    <Radio.Group
                        value={account_type}
                        onChange={handleChangeInput('account_type')}
                        required
                    >                            
                        <Radio value='G' >회사 구글 계정</Radio>
                        <Radio value='A' >일반</Radio>
                    </Radio.Group>
                </Col>                 */}

                {account_type == "G" ? 
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
                            비밀번호 
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
                            <Button htmlType="button" onClick={google_change} >구글 계정으로 전환</Button>
                            {idChk}
                        </Col><Col xs={8} lg={4} className="label">
                            비밀번호 
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
                        value={stateData['work_state']}
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
                            <Radio value={item['code']} key={item['code']} checked={stateData['company'] == item['code'] ? true : false}>
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
                            <Radio value={item['code']} checked={stateData['class'] == item['name'] ? true : false}>
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
                        onSelect={onSelect}
                        //defaultExpandedKeys={['P010103C0001','P010103C0002']}
                        defaultExpandedKeys={[team]}
                        defaultSelectedKeys={[team]}
                        //defaultExpandAll='true'
                        //expandedKeys={[state.teamParent]}
                        //expandedKeys={['P010103C0001','P010103C0002']}
                        //defaultSelectedKeys={[team]}
                        //selectedKeys={[team]}
                        treeData={state.teamType}
                    />
                    {/* <FlexGrid
                        //initialized={(grid) => (state.partGrid = grid)}
                        itemsSource={state.teamType}
                        headersVisibility="None"
                        childItemsPath={'children'}
                        selectionMode="Row"
                        //onClick={(e)=>{handleChangePart()}}
                       onSelectionChanged={handleChangePart}
                    >
                        <FlexGridColumn binding="name" dataType="String" width="*" />
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
                            <Radio value={item['code']} checked={stateData['role'] == item['code'] ? true : false}>
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
                            <Checkbox value={item['code']} checked={stateData['work'] == item['code'] ? true : false}>
                                {item['name']}
                            </Checkbox>
                        ))}
                    </Checkbox.Group>
                </Col>

                <Col xs={8} lg={4} className="label">
                    입사일 *
                </Col>
                <Col xs={16} lg={8}>
                    <DatePicker onChange={handleChangeDate('join_date')} value={moment(stateData['join_date'])}/>
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
                        <TimePicker  onChange={handleChangeDate('start_time')} value={moment(stateData['start_time'], 'HH:mm')} format='HH:mm' />
                        <TimePicker  onChange={handleChangeDate('end_time')} value={moment(stateData['end_time'],'HH:mm')} format='HH:mm'/>
                        <Select
                            style={{ width: '40%' }}
                            placeholder="근무 장소"
                            onChange={handleChangeInput('work_place')}
                            value={stateData['work_place']}
                            defaultValue={stateData['work_place'] ? '' : '근무 장소'} 
                        >
                            {state.workPlaceType.map((item) => (
                                <Option value={item['code']} key={item['code']} checked={stateData['work_place'] == item['code'] ? true : false}>
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
                    <DatePicker onChange={handleChangeDate('birthday')} value={moment(stateData['birthday'])}/>
                    <Radio.Group
                        value={stateData['birthday_lunar']}
                        onChange={handleChangeInput('birthday_lunar')}
                        required
                    >
                        <Radio value="N" key="birthday_lunar_N" >양력</Radio>
                        <Radio value="Y" key="birthday_lunar_Y">음력</Radio>
                    </Radio.Group>
                </Col>


                <Col xs={8} lg={4} className="label">
                    성별 *
                </Col>
                <Col xs={16} lg={8}>
                    <Radio.Group
                        value={stateData.gender}
                        onChange={handleChangeInput('gender')}
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
                        name="admin_memo"
                        rows={4}
                        value={stateData['admin_memo']}
                        onChange={handleChangeInput('admin_memo')} />
                </Col>

                <Col xs={8} lg={4} className="label">
                    변경 적용일
                </Col>
                <Col xs={16} lg={8}>
                    컬럼명 아직 안나옴
                    {/* <InputDate
                        format={dateFormat}
                        //value={stateData['join_date']}
                        valueChanged={handleChangeDate.bind(this,'join_date')}
                    /> */}
                    {/* <DatePicker onChange={handleChangeDate('update')} value={moment(stateData['update'])}/> */}
                </Col>
            </Row>
            <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                <Col>
                    <Button type="primary" onClick={handleSubmit} >
                        확인
                    </Button>
                </Col>
                {/* <Col>
                    <Button htmlType="button" onClick={popoutClose} >
                        취소
                    </Button>
                </Col> */}               
                
                {stateData.popoutChk == "Y" 
                    ? <Col><Button htmlType="button" onClick={e => popoutClose('Y')} > 취소 </Button> </Col>
                    : <Col><Button htmlType="button" onClick={popoutClose} > 취소 </Button> </Col>
                }
                   
            </Row>

        </Wrapper>
    );
});

export default ViewInfo;
