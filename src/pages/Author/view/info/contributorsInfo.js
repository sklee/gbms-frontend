/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {  Space, Button, Row, Col,  Modal, Input,   message, Radio,  Popover, Select, Typography} from 'antd';
import { PhoneOutlined ,QuestionOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';

const Wrapper = styled.div`
    width: 100%;
    `;


const DEF_STATE = {
    // DB Data
    type:'',
    name:'',
    public_name: '',
    email: '',
    introduction: '',
    memo: '', 
};


const contributorsView = observer(({idx,type,popoutCloseVal,popoutChk,drawerChk}) => {
    const { commonStore } = useStore();

    const { Text } = Typography;
    const { Option } = Select;

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 

    const state = useLocalStore(() => ({
        idx: '',
        type: '',
        popoutChk:'',       //팝업체크

        drawerback : '',    //오른쪽 class
        memberOption: [],   //담당자 회원 리스트

        create_info:'',     //등록자
        dataOld : [],       //기존 데이터
        updata:'',          //수정된 데이터

        adminChk : true,
    }));
    
    useEffect(() => {       
        state.type= type;
        state.idx= idx;
        state.popoutChk= popoutChk;

        memberData();
        viewData(idx,type);
    }, [idx]);

    const popoutClose = (val) => {
        popoutCloseVal(val);
    };

    //데이터 초기화
    const reset =() =>{
        for (const key in state.dataOld) {
            stateData[key] = state.dataOld[key];
        }

        var managerData = [];
        state.dataOld.managers.forEach(e => {
            managerData = [...managerData, e];          
        });                  
        setManager(managerData);

        if(state.dataOld.created_info.teams){
            setManagerTxt(state.dataOld.created_info.name+'('+state.dataOld.created_info.teams.name+')');
        }else{    
            setManagerTxt(state.dataOld.created_info.name+'(-)');
        }
    }

    //상세정보
    const viewData = useCallback(async (idx,type) => {    
        const result = await axios.get(
          process.env.REACT_APP_API_URL +'/api/v1/'+type+'/'+idx,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          },
        )
        var data = result.data.data;
        state.dataOld = data;
        state.create_info = data.created_info;

        if(data == ''){
            Modal.error({
                content: '문제가 발생하였습니다. 재시도해주세요.' ,        
            }); 
        }else{
            for (const key in stateData) {
                for (const key2 in data) {
                    if(key === key2){
                        stateData[key] = data[key];
                    }                
                }                
            } 
        } 

        //담당자      
        if(data.managers.length > 0){
          var managerData = [];
          var managerText = [];
    
          data.managers.forEach(e => {
            managerData = [...managerData, e.id];
            if(e.teams){
                managerText = [...managerText, e.name+'('+e.teams.name+')'];
            }else{
                managerText = [...managerText, e.name+'(-)'];
            }
            
          });          
          state.dataOld.managers =managerData;
          state.dataOld.managers =managerData;
          setManager(managerData);
          setManagerTxt(managerText);
          
        }else{
            setManager([data.created_info.id]);
            if(data.created_info.teams){
                setManagerTxt(data.created_info.name+'('+data.created_info.teams.name+')');
            }else{    
                setManagerTxt(data.created_info.name+'(-)');
            }          
            // state.updata = {...state.updata, 'managers': data.created_info.id};
            state.dataOld.managers = [data.created_info.id];
            stateData.managers = [data.created_info.id];
        } 
        
      }, []);    

   
    //담당자
    const memberData = useCallback(async () => {
         const result = await axios.get(
        process.env.REACT_APP_API_URL +'/api/v1/users?display=500&page=1&sort_by=date&order=desc',
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

        // state.memberOption = result.data.data;
        state.memberOption = options;

    }, []);

    //담당자 추가
    const [manager, setManager] = useState([]);
    const [managerTxt, setManagerTxt] = useState('');
    const handleChangeSelect = useCallback( (e) => {
        stateData.managers =  e;
        setManager(e);
        // var num = 0;
        // if(state.dataOld.managers.length > 0){
        //     state.dataOld.managers.forEach((val,index) => {
        //         if(val === e[index]){
        //             num++;
        //         }
        //     });
        // }

        // setManager(e);
        // if(state.dataOld.managers.length !== num){
        //     if(e.length > 0){
        //         state.updata =  {...state.updata, 'managers': e};
        //     }else{
        //         state.updata =  {...state.updata, 'managers': ''};
        //     }
        // } else{
        //     if(state.updata.managers === ''){
        //         var text = '';
        //         for(const key in state.updata){
        //             if(key !== 'managers'){
        //                 text = {...text, [key] : state.updata[key]}
        //             }
        //         }
        //         state.updata = text
        //     }
        // }
    },[],);  

    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback(
        (type) => (e) => {             
            if(type === 'email'){
                stateData[type] = e.target.value.replace(/[^\.@a-z|A-Z|0-9]/g,'',);
            } else{
                stateData[type] = e.target.value;                
            }
            
        },
        [],
    );


    //이메일확인
    const handleChange = useCallback((type) => (e) => {
        const emailRegex =/^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;

        if(e.target.value != ''){
            if(emailRegex.test(e.target.value) == false){
                message.warning('올바른 이메일 주소를 입력해주세요.');
                stateData[type] ='';
            } else{
                stateData[type] = e.target.value;
            }
        }  
                
    },[],);


    //등록
    const handleSubmit = useCallback(async (e)=> {

        let chkVal = true;

        // //기존 데이터와 비교하여 업뎃할 항목재배열
        // for (const key in stateData) { 
        //     if(stateData[key] !== state.dataOld[key]){
        //         state.updata = {...state.updata,[key]: stateData[key]};
        //     }
        // }

        // console.log(state.updata);
        //         return;


        if(stateData.managers == '' ){
            Modal.error({
                content: '담당자를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }
    
        if(stateData.public_name == ""){
            Modal.error({
                content: '성명/사업자명(공개용)을 작성해주세요.',        
            });
            chkVal = false;
            return;
        }


        if(chkVal == true){
            var axios = require('axios');
            var updata = {
                public_name: stateData.public_name,
                email: stateData.email,
                memo:stateData.memo,
                introduction:stateData.introduction,
                managers: stateData.managers,
                id:idx
            }

            var config={
                method:'POST',
                url:process.env.REACT_APP_API_URL +'/api/v1/'+state.type,
                headers:{
                    'Accept':'application/json',
                },
                    data:updata
                };
                
            axios(config)
            .then(function(response){
                console.log(response);
                if(response.data.id != ''){
                    Modal.success({
                        title: response.data.result,
                        onOk(){
                            for (const key in stateData) {
                                state.dataOld[key] = stateData[key];
                            }
                            state.dataOld.managers = stateData.managers;
                        },
                    });
                }else{
                    Modal.error({
                        content:(<div>
                                    <p>수정시 문제가 발생하였습니다.</p>
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


    return (
        <Wrapper>
            <Row gutter={10} className="table"> 
                <Col xs={6} lg={6} className="label">
                    성명/사업자명(실명)
                </Col>
                <Col xs={18} lg={18}>
                    {stateData.name}
                </Col>

                <Col xs={6} lg={6} className="label">
                    성명/사업자명(공개용)  { state.adminChk === true && state.popoutChk !== 'Y'&& <span className="spanStar">*</span> }
                </Col>
                <Col xs={18} lg={18}>
                    { state.adminChk === true && state.popoutChk !== 'Y'
                        ? <Input className="tableInput" type="text" name="public_name" value={stateData.public_name} onChange={handleChangeInput('public_name')} autoComplete="off"/> 
                        : stateData.public_name
                    }
                </Col>
                <Col xs={6} lg={6} className="label">
                    유형
                </Col>
                <Col xs={18} lg={18}>
                    {stateData['type'] === '1'
                        ? '개인'
                        : '사업자'
                    }                    
                </Col>
                <Col xs={6} lg={6} className="label">
                    이메일
                </Col>
                <Col xs={18} lg={18}>
                    { state.adminChk === true && state.popoutChk !== 'Y'
                        ? <Input className="tableInput" type="text" name="email" value={stateData.email} onChange={handleChangeInput('email')}  onBlur={handleChange('email')}   autoComplete="off"/> 
                        : stateData.email
                    }
                </Col>
                <Col xs={6} lg={6} className="label">
                    등록자
                </Col>
                <Col xs={18} lg={18}>
                    {state.create_info.name}
                </Col>

                <Col xs={6} lg={6} className="label">
                    담당자 { state.adminChk === true && state.popoutChk !== 'Y'&& <span className="spanStar">*</span> }
                </Col>
                <Col xs={18} lg={18}>
                    
                    {state.adminChk === true && state.popoutChk !== 'Y'
                        ?   <Select 
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
                        : managerTxt 
                    }                    
                </Col>

                <Col xs={6} lg={6} className="label" style={{textAlign:'center'}}>
                    기본 소개글<br/>
                    (서점, 홈페이지용)
                </Col>
                <Col xs={18} lg={18}>
                    { state.adminChk === true && state.popoutChk !== 'Y'
                        ?<Input.TextArea name="introduction" rows={4} value={stateData.introduction} onChange={handleChangeInput('introduction')} autoComplete="off"/>
                        : stateData.introduction
                    }
                </Col>

                <Col xs={6} lg={6} className="label">
                    기타 참고사항
                </Col>
                <Col xs={18} lg={18}>
                     { state.adminChk === true && state.popoutChk !== 'Y'
                        ?<Input.TextArea name="memo" rows={4}  onChange={handleChangeInput('memo')} value={stateData.memo} autoComplete="off"/>
                        : stateData.memo
                    }
                </Col>
            </Row>

            <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                <Col>
                    {state.popoutChk === 'Y'
                        ?<>
                            <Button type="button" htmlType="button"  onClick={e => popoutClose('Y')} style={{marginLeft:'10px'}}>
                                닫기
                            </Button>
                        </>

                        : <>
                            <Button type="primary" htmlType="button" onClick={handleSubmit}>
                                확인
                            </Button>
                            {drawerChk == "Y" && state.adminChk === true
                                && <>
                                    <Button htmlType="button" onClick={e => popoutClose('Y')} style={{marginLeft:'10px'}}>
                                        취소
                                    </Button>
                                    {/* <Button type="text" htmlType="button" onClick={reset} style={{marginLeft:'10px'}} danger>
                                        초기화
                                    </Button> */}
                                </>
                                // : state.adminChk === true &&
                                //     <Button type="text" htmlType="button" onClick={reset} style={{marginLeft:'10px'}} danger>
                                //         초기화
                                //     </Button>
                            }     
                        </>
                    }
                </Col>
            </Row>              

        </Wrapper>
    );
});

export default contributorsView;