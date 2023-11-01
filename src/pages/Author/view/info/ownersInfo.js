/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {  Space, Button, Row, Col,  Modal, Input,   message, Radio,  Popover, Select, Typography} from 'antd';
import { PhoneOutlined ,QuestionOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';

import PopupPostCode from '@components/Common/DaumAddress';

const Wrapper = styled.div`
    width: 100%;
    `;


const DEF_STATE = {
    // DB Data
    type: '',
    name: '',
    country: '',
    address: '',
    memo: '',    
    managers: '',    
    tax_rate: '',    
};

const ownersView = observer(({idx,type,popoutCloseVal,popoutChk,drawerChk}) => {
    const { commonStore } = useStore();

    const { Text } = Typography;
    const { Option } = Select;

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 

    const state = useLocalStore(() => ({
        idx: '',
        type: '',
        popoutChk:'',       //팝업체크
        drawerback : '',    //오른쪽 class

        dataOld : [],
        updata:'',          //수정된 데이터
        
        memberOption: [],   //담당자 회원 리스트
        create_info:'',     //등록자

        adminChk : true,
    }));
    
    useEffect(() => {       
        state.type= type;
        state.idx= idx;
        state.popoutChk= popoutChk;

        viewData(idx,type);
        memberData();
    }, [idx]);

    const popoutClose = (val) => {
        popoutCloseVal(val);
    };

    //데이터 초기화
    const reset =() =>{
        for (const key in state.dataOld) {
            stateData[key] = state.dataOld[key];
        }
        state.updata = '';
        
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
        console.log(result);
        if(data == ''){
            Modal.error({
            content: '문제가 발생하였습니다. 재시도해주세요.' ,        
            }); 
        }else{
            var data = result.data.data;
            state.dataOld = data;
            state.create_info = data.created_info;

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
            stateData.managers = managerData;
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
            //state.updata = {...state.updata, 'managers': data.created_info.id};
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
        //             console.log(num);
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
        },[],
    );  

    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback(
        (type) => (e) => {           
            var korChk =/[^ㄱ-ㅎ|가-힣]/g;
            var addressChk =/[^\s|.,|a-z|A-Z|0-9]/g;
            var taxrateChk =/[^\.0-9]/g;

            var key = type+'error'

            if(type ==='address'){
                if(addressChk.test(e.target.value)){
                    message.warning({ content: '영문과 숫자, 일부 특수문자만 입력 가능합니다.', key});      
                }else{
                    stateData[type] = e.target.value.replace(  /[^\s|.,|a-z|A-Z|0-9]/g, '');
                }               
            }else if (type === 'country'){
                if(korChk.test(e.target.value)){
                    message.warning({ content: '한글만 입력 가능합니다.', key});   
                }else{
                    stateData[type] = e.target.value.replace(/[^ㄱ-ㅎ|가-힣]/g, '');
                } 
            }else if(type === 'tax_rate'){
                if(taxrateChk.test(e.target.value)){
                    message.warning({ content: '숫자와 일부 특수문자만 입력 가능합니다.', key});    
                }else{
                    var tax_rate = e.target.value.replace(/[^\.0-9]/g, '');
                    
                    var tmp = '';
                    if(tax_rate.length > 2){
                        tax_rate = tax_rate.replace('.', '');
                        tmp =  tax_rate.substr(0, 2) +'.'+ tax_rate.substr(2, 1);
                    }else{
                        tax_rate = tax_rate.replace('.', '');
                        tmp =  tax_rate
                    }
                    stateData[type] =tmp
                }           
            }else{                   
                stateData[type] = e.target.value;
            }      
        },
        [],
    );


    //등록
    const handleSubmit = useCallback(async (e)=> {

        let chkVal = true;

        if(stateData.managers == '' ||  stateData.managers.length  === 0 ){
            Modal.error({
                content: '담당자를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }
                    
        if(stateData.country == ""){
            Modal.error({
                content: '국적을 작성해주세요.',        
            });
            chkVal = false;
            return;   
        }

        if(stateData.address == ""){
            Modal.error({
                content: '법적주소를 작성해주세요.',        
            });
            chkVal = false;
            return;   
        }

        if(chkVal == true){
            var axios = require('axios');
            var updata = {
                country: stateData.country,
                address: stateData.address,
                memo:stateData.memo,
                managers: stateData.managers,
                tax_rate: stateData.tax_rate,
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
                console.log(error.response.status);
                Modal.error({
                    title : '등록시 문제가 발생하였습니다.',
                    content : '오류코드:'+error.response.status
                });   
            });
        }       
    }, []);  


    return (
        <Wrapper>
            <Row gutter={10} className="table"> 
                <Col xs={6} lg={6} className="label">
                    성명/사업자명
                </Col>
                <Col xs={18} lg={18}>
                   {stateData['name']}
                </Col>

                <Col xs={6} lg={6} className="label">
                    유형
                </Col>
                <Col xs={18} lg={18}>
                    {stateData['type'] === '6'
                        ? '개인'
                        : '기관'
                    }                    
                </Col>

                <Col xs={6} lg={6} className="label">
                    국적{ state.adminChk === true && state.popoutChk !== 'Y'&& <>(한국어)<span className="spanStar">*</span></> }
                </Col>
                <Col xs={18} lg={18}>
                    { state.adminChk === true && state.popoutChk !== 'Y'                                
                        ?   <Input className="tableInput" type="text" name="country" value={stateData.country} onChange={handleChangeInput('country')}  autoComplete="off"/>   
                        :   stateData.country
                    } 
                </Col>

                <Col xs={6} lg={6} className="label">
                    원천징수 세율
                </Col>
                <Col xs={18} lg={18}>
                    { state.adminChk === true && state.popoutChk !== 'Y'                                
                        ? <><Input className="tableInput" type="text" name="tax_rate" value={stateData.tax_rate} onChange={handleChangeInput('tax_rate')}  autoComplete="off" maxLength={4} /> 
                            <span style={{marginLeft:'3px'}}>% (정보가 없으면 입력하지 않아도 됩니다.) </span> </>
                        :   (stateData.tax_rate !== ''&& stateData.tax_rate !== null && stateData.tax_rate !== undefined) && stateData.tax_rate+'%' 
                    }
                </Col>

                <Col xs={6} lg={6} className="label">
                    법적 주소 {state.adminChk === true && state.popoutChk !== 'Y' && <>(영어) <span className="spanStar">*</span></>}
                </Col>
                <Col xs={18} lg={18}>
                    {state.adminChk === true && state.popoutChk !== 'Y'
                        ? <Input
                            name="address"
                            placeholder ="주소"
                            value={stateData['address']}
                            onChange={handleChangeInput('address')}
                        />
                            
                        :   stateData['address']
                    
                    }
                    
                </Col>
                <Col xs={6} lg={6} className="label">
                    등록자
                </Col>
                <Col xs={18} lg={18}>
                    {state.create_info.name}
                </Col>

                <Col xs={6} lg={6} className="label">
                    담당자 {state.adminChk === true && state.popoutChk !== 'Y'&& <span className="spanStar">*</span>}
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

                <Col xs={6} lg={6} className="label">
                    기타 참고사항
                </Col>
                <Col xs={18} lg={18}>
                    {state.adminChk === true && state.popoutChk !== 'Y'
                        ?   <Input.TextArea name="memo" rows={4} value={stateData.memo} onChange={handleChangeInput('memo')} autoComplete="off"/>
                        :   stateData.memo
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

export default ownersView;