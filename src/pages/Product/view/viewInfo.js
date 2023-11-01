/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Space, Button, Row, Col,  Modal, Breadcrumb, Input, Drawer,  message, Radio, Popover, Select, Typography, DatePicker, InputNumber} from 'antd';
import { PhoneOutlined ,QuestionOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { inject, observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import axios from 'axios';
import moment from 'moment';


import AddDrawer from './addDrawer';
import { forEach } from 'jszip';


const Wrapper = styled.div`
    width: 100%;
    .inner_dv {display:flex;flex-wrap:wrap}
    // .inner_dv .dvInline{display:block;margin:2px 10px 2px 0;}
    .inner_dv .dvInline{display:inline-block;margin:2px 10px 2px 0;}
    .inner_dv .dvInline .ant-btn{padding:0;}
    `;

const DEF_STATE = {
    // DB Data
    connection_id : '',
    connection_type : '',
    name: '',
    internal_name: '',
    subtitle: '' ,
    code_type : '',
    code_number : '',
    add_sign : '',
    price: '' ,
    price_date: '' ,   
    taxation_type : '',
    non_type: '' ,
    expected_release_date: '',
    release_date: '',
    managers : [],  
    sets : [],
    contributors : [],

    id: '',
    product_status: '',
    product_code: '',
    contract_type: '',
    company: '',
    brand: '',
    product_type: '',
    connect_product: '',
    contractable:[],
    department_code_id:'',
    departments:[],
    

};

const InfoDrawer = ({ idx,popoutCloseVal,drawerChk, popoutChk, drawerClass, viewData, pageChke}) => {
    const { commonStore } = useStore();

    const { Option } = Select;

    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 

    const state = useLocalStore(() => ({
        idx : '',
        popoutChk : 'N',    //팝업체크
        adminChk : true,        //관리자여부
        today : moment().format('YYYY-MM-DD'),  //현재날짜

        dataOld : [],
        memberOption : [],
        departmentsOption : [],

        sets:[],             
        contributors:[],             

        create_info:'',         //등록자           

        typeChk : '',           //addDrawer 타입
        releaseDateChk : 0,     //출시 발행일 필수값 체크여부
        inputChk: 1,            //필수 입력 체크( 상품명+1)
        nameChk : false,        //상품명 중복 확인여부   
        //출시상태가 출시취소, 단종일때 수정 불가

    }));
    
    useEffect(() => {
        if(pageChke === 'codeProcess'){
            state.adminChk = false
        } 
        state.popoutChk = popoutChk;
        state.idx = idx;
        view(viewData);
        memberData();
        fetch();
    }, [idx]);

    
    const popoutClose = (val) => {
        popoutCloseVal(val);
    };

    //데이터 초기화
    const reset =() =>{
        for (const key in DEF_STATE) {
            stateData[key] = DEF_STATE[key];
        }
    }
  
    //상세정보
    // const viewData = useCallback(async (idx) => {    
    //     const result = await axios.get(
    //       process.env.REACT_APP_API_URL +'/api/v1/products/'+idx,
    //       {
    //         headers: {
    //           'Accept': 'application/json',
    //           'Content-Type': 'application/json',
    //         },
    //       },
    //     )
    //     console.log(result.data)
    //     var data = result.data;
    //     state.dataOld = data;
    //     state.create_info = data.created_info;

    //     if(data == ''){
    //         Modal.error({
    //             content: '문제가 발생하였습니다. 재시도해주세요.' ,        
    //         }); 
    //     }else{
    //         for (const key in stateData) {
    //             for (const key2 in data) {
    //                 if(key === key2){
    //                     stateData[key] = data[key];
    //                 }                
    //             }                
    //         } 
    //         // stateData.connection_product = data.connection_product;
    //         // // stateData.sets = data.sets;
    //         // stateData.sets = data.sets;
    //         // stateData.connection_product = data.connection_product;
    //     } 

    //     //도서 상품(종이,오디오,전자책)은 면세 고정
    //     if(stateData.product_type <= '4'){
    //         stateData.taxation_type = '1';
    //         stateData.code_type = '1';

    //         //바코드 필수입력, 과세필수입력, 기여자 필수입력
    //         state.releaseDateChk = 3;

    //         //세트 필수
    //         if(stateData.product_type === '2'){
    //             state.releaseDateChk++;
    //         }
    //     }else if(stateData.product_type === '7'){ //비매품 필수
    //         state.releaseDateChk++;
    //     }

    //     console.log(state.releaseDateChk)


    const view=(data)=>{
        state.dataOld = data;
        state.create_info = data?.created_info;

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


            if(data?.sets){ //연결상품
                stateData.sets = []; //초기화
                data.sets.forEach(e => {
                    stateData.sets = [...stateData.sets, e.id];
                    state.sets = [...state.sets, {'id':e.id,'name':e.name}];
                });
            }


            if(data?.contributors){ //기여자
                stateData.contributors = []; //초기화
                data.contributors.forEach(e => {
                    state.contributors = [...state.contributors, {'id':e.id,'name':e.name+'('+e.pivot.contributes+')'}];
                    var contributesText = e.pivot.contributes.split(',');
                    stateData.contributors = [...stateData.contributors, {'id':e.id,'contributes':contributesText}]
                });
            }

            if(data?.contractable !== '' && data?.contractable !== undefined){
                var contractable = data.contractable
            }else{
                var contractable = []
            }

            stateData.contractable = contractable;
            // if(data.departments !== '' && data.departments !== undefined){
            //     var departments = data.departments
            // }else{
            //     var departments = []
            // }

            if(data?.departments?.length > 0 ){
                stateData.departments = data.departments[0].id;
                setDepartments(data.departments[0].id)
                setDepartmentsTxt(data.departments[0].name)
            }else{
                stateData.department_code_id = data?.created_info.department;
                setDepartments(data?.created_info.department)
                setDepartmentsTxt(data?.created_info.department_info.name)
            }
            
            // if(data.department_code_id !== '' && data.department_code_id !== undefined && data.department_code_id !== null){
            //     stateData.department_code_id = data.department_code_id;
            //     setDepartments(data.department_code_id)
            //     // setDepartmentsTxt(data)
            //     console.log(data.department_code_id)
            // }else{
            //     stateData.department_code_id = data.created_info.department;
            //     setDepartments(data.created_info.department)
            //     // setDepartmentsTxt(data.created_info.department)
            //     console.log(data.created_info.department)
            // }

            // var managers_arr = [];
            // data.managers.forEach(e => {
            //     managers_arr = [...managers_arr, e.id]
            // });
            // stateData.managers = data.managers;
        } 

        //필수값 체크 (상품명)
        state.releaseDateChk = 1;

        //도서 상품(종이,오디오,전자책)은 면세 고정
        if(stateData.product_type <= '4'){
            //필수값 체크 (상품명, isbn&바코드, 과세)
            state.releaseDateChk = 3;

            stateData.taxation_type = '1';
            stateData.code_type = '1';
            state.inputChk = state.inputChk+2;  //과세,바코드 +2

            //기여자 필수입력,  
            state.releaseDateChk++;
            // if(data.contributors.length > 0){
            //     // state.inputChk++;
            //     inputChk(true)
            // }

            //세트 필수
            if(stateData.product_type === '2'){
                if(data.sets.length > 0){
                    // state.inputChk++;
                    inputChk(true)
                }
                state.releaseDateChk++;
            }
        }else if(stateData.product_type === '7'){ //비매품 필수
            state.releaseDateChk++;
        }

        if(stateData.sets.length > 0){
            state.prdData = stateData.sets;            
        }


        //담당자      
        if(data?.managers.length > 0){
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
            stateData.managers = managerData
            state.dataOld.managers =managerData;
            setManager(managerData);
            setManagerTxt(managerText);
            
        }    
        
    }

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
                label: e.name+"("+e.team+")",
                value: Number(e.id),
            });
        });

        state.memberOption = options;

    }, []);

    //담당자 추가
    const [manager, setManager] = useState([]);
    const [managerTxt, setManagerTxt] = useState('');
    const handleChangeSelect = useCallback( (e) => {        
        setManager(e);
        stateData.managers = e;
    },[],);  


    //drawer class
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

    //drawer add 닫기
    const addOnClose = () => {
        if(drawerChk === 'Y'){
            classChkBtn();
        }
        setAddVisible(false);
    };   

    //drawer data
    const addData =(data,type)=>{
        if(type === 'product'){ //세트상품
            if(stateData.sets.length === 0){
                inputChk(true)
            }            
            stateData.sets = [...stateData.sets, data.id];
            state.sets = [...state.sets, {'id':data.id,'name':data.name}];
        }else if(type === 'price'){ //정가
            stateData.price = data.price;
            stateData.price_date = data.price_date;
        }else{  //기여자
            if(stateData.contributors.length === 0){
                inputChk(true)
            }

            var authorType = ''
            if(data[0].authorType.length > 0){
                var authorType = data[0].authorType.join(", ")
            }else{
                var authorType = data[0].authorType[0]
            }
            stateData.contributors = [...stateData.contributors, {'id':data[0].id,'contributes': data[0].authorType}];
            state.contributors = [...state.contributors, {'id':data[0].id,'name':data[0].name+'('+authorType+')'}];

        }
    }

    //input 데이터 stateData 추가  
    const handleChangeInput = useCallback((type) => (e) => {
        if(type ==='expected_release_date' || type === 'release_date'){
            stateData[type] = e.format('YYYY-MM-DD');  
        }else if(type === 'price'){
            stateData[type] = e.target.value.replace(/\$\s?|(,*)/g, '')
        }else{               
            if(type ==='code_type' || type ==='non_type' || type === 'name' ){  //바코드, 비매품
                if(e.target.value){
                    inputChk(true)
                }else{
                    inputChk(false)
                }                
            }
            
            if(type ==='code_number'){
                if(stateData.code_type==='1'){
                    stateData[type] = e.target.value.replace(/[^0-9]/g, '').slice(0, 13);
                }
            }else if(type === 'add_sign'){
                stateData[type] = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
            }else{
                stateData[type] = e.target.value;
            }
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
                        state.nameChk = false;
                        Modal.error({
                            title: '오류가 발생했습니다.',
                            content: '오류코드:' + result.data.message,
                        });
                    } else {
                        if (result.data.data.length > 0) {                           
                            state.nameChk = true;
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



    // 세트, 기여자 삭제
    const btnDel = (type,num)=>{
        var arrList = [];

        if(type === 'author'){ // 저작권 계약 삭제시
            state.typeChk = false;
            if(stateData.contributors.length == 1){
                stateData.contributors =[];
                state.contributors = [];
                inputChk(false)
            }else{
                stateData.contributors.map((e,index) => {
                    if (index !== num) {
                        arrList.push(e);
                    }
                });
                stateData.contributors = arrList;
                state.contributors =arrList;
                if(stateData.contributors.length === 0){
                    inputChk(false)
                }

            }
            
        }else{
            if(stateData.sets.length == 1){
                stateData.sets = [];
                state.sets = [];
                inputChk(false)
            }else{
                stateData.sets.map((e,index) => {
                    if (index !== num) {
                        arrList.push(e);
                    }
                });
                stateData.sets = arrList;
                state.sets = arrList;
                if(stateData.sets.length === 0){
                    inputChk(false)
                }
            }
            
        }
        
    }

    const commaNum = (num) => {  
        if(num){
            const number = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return number
        }else{
            return 0;
        }

    } 

    //필수 체크
    const inputChk=(val)=>{
        if(val === false){
            state.inputChk--;
        }else{
            state.inputChk++;
        }

        if(state.inputChk !== state.releaseDateChk){
            stateData.release_date = null;
        }
    }

     //담당 부서
     //담당자 추가
    const [departments, setDepartments] = useState([]);
    const [departmentsTxt, setDepartmentsTxt] = useState('');
    const handleChangeSelect2 = useCallback( (e) => {        
        setDepartments(e);
        stateData.departments = e;
    },[],);  

     const fetch = (value, setData) => {
        // if(value){           
            var axios = require('axios');

            var config = {
                method: 'GET',
                // url:process.env.REACT_APP_API_URL +'/api/v1/select-department-codes?keyword='+value,
                url:process.env.REACT_APP_API_URL +'/api/v1/select-department-codes',
                headers: {
                    Accept: 'application/json',
                },
            };
    
            axios(config)
            .then(function (result) {
                if (result.data.data !='' ) {
                    // console.log(result.data.data)
                    // var data = result.data.data;
                    // var arr = [];
                    // data.forEach(item => {
                    //     arr = [...arr, { value: Number(item.id), label: item.name}]
                    // });                    
                    // setData(arr)
                    var options = []
                    result.data.data.forEach(e=>{
                        options.push({
                            label: e.name,
                            value: Number(e.id),
                        });
                    });
            
                    state.departmentsOption = options;
                }
            })
            .catch(function (error) {
                console.log(error.response);
                Modal.error({
                    title: '오류가 발생했습니다. 재시도해주세요.',
                    content: '오류코드:' + error.response.status,
                });
            });
        // }            
    };
    // const SearchInput = (props) => {
    //     const [data, setData] = useState([]);
    //     const [value, setValue] = useState();
      
    //     const handleSearch = (newValue) => {
    //       if (newValue) {
    //         fetch(newValue, setData);
    //       } else {
    //         setData([]);
    //       }
    //     };
      
    //     const handleChange = (id, val) => {    
    //         stateData.departments = id
    //         setValue(id);
    //     };
      
    //     return (
    //       <Select
    //         showSearch
    //         value={value}
    //         placeholder={props.placeholder}
    //         style={props.style}
    //         defaultActiveFirstOption={false}
    //         showArrow={false}
    //         filterOption={false}
    //         onSearch={handleSearch}
    //         onChange={handleChange}
    //         notFoundContent={null}
    //         options={data}
    //         disabled={state.adminChk === true && state.popoutChk !== 'Y' ? false: true}
    //       />
    //     );
    // };
    // const TargetSelect= () => <SearchInput placeholder="" style={{ width: 330 }} />;
    
      
    //등록
    const handleSubmit = useCallback(async (e)=> {
         let chkVal = true;

        if(stateData['name']=== ""){
            Modal.error({
                content: '상품명(공식)을 작성해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData['code_type'] === "" && stateData.product_type <= '4'){
            Modal.error({
                content: '"ISBN/바코드 번호"는 필수 입력입니다.',        
            });
            chkVal = false;
            return;
        } else{
            // if(stateData['code_type'] === "2" && stateData.product_type <= '4'){
            if(stateData.product_type <= '4'){
                if(stateData.code_number === '' || stateData.code_number === undefined || stateData.code_number === null){
                    Modal.error({
                        content: '"ISBN/바코드 번호"는 필수 입력입니다.',        
                    });
                    chkVal = false;
                    return;
                }
            }
        }

        if(stateData['price'] === "" || stateData['price'] === null || stateData['price'] === undefined){
            Modal.error({
                content: '정가를 입력해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData['taxation_type'] === ""){
            Modal.error({
                content: '과세 구분을 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData['non_type'] === ""  && stateData.product_type === '7'){
            Modal.error({
                content: '비매품 종류를 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        if(stateData.sets.length === 0 && stateData.product_type === '2'){
            Modal.error({
                content: '세트 구성 상품을 선택해주세요.',        
            });
            chkVal = false;
            return;
        }

        // if(stateData.contributors.length === 0 && stateData.product_type <= '4'){
        //     Modal.error({
        //         content: '기여자를 등록해주세요.',        
        //     });
        //     chkVal = false;
        //     return;
        // }
                       
        if(chkVal == true){
            var updata = [];
 
            updata = {
                name: stateData.name,
                subtitle: stateData.subtitle,
                code_type: stateData.code_type,                
                code_number: stateData.code_number,                
                add_sign: stateData.add_sign,                
                taxation_type: stateData.taxation_type,
                managers: stateData.managers,
                expected_release_date: stateData.expected_release_date,
                release_date: stateData.release_date,
                departments : stateData.departments
                // id: idx,
            }
            if(stateData.price){
                // updata = {...updata,price: stateData.price.replace(/\$\s?|(,*)/g, '')}
                updata = {...updata,price: stateData.price}
            }
            if(stateData.price_date){
                updata = {...updata,price_date: stateData.price_date}
            }
            if(stateData.product_type <= 4){
                updata = {...updata, contributors: stateData.contributors}
                if(stateData.product_type === '2'){
                    updata = {...updata, sets: stateData.sets}
                }
            }else if(stateData.product_type === '7'){
                updata = {...updata,non_type: stateData.non_type}
            }
            // return
            var axios = require('axios');

            var config={               
                // method:'POST',
                // url:process.env.REACT_APP_API_URL +'/api/v1/products',
                method:'PUT',
                url:process.env.REACT_APP_API_URL +'/api/v1/products/'+state.idx,
                headers:{
                    'Accept':'application/json',
                },
                    data:updata
                };
                
            axios(config)
            .then(function(response){
                //console.log(response);
                if(response.data.data.id != ''){
                    // Modal.success({
                    //     title: '담당 부서 확인 후 승인되면 알림을 받을 수 있습니다.',
                    //     onOk(){
                    //         for (const key in stateData) {
                    //             state.dataOld[key] = stateData[key];
                    //         }
                    //         popoutClose('Y')
                    //     },
                    // });
                    for (const key in stateData) {
                        state.dataOld[key] = stateData[key];
                    }
                    popoutClose('Y')
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
        }            
    }, []);      

    return (
        <Wrapper>

            <Row gutter={10} className="table marginTop">
                <div className="table_title">기본 정보</div>
                <Col xs={6} lg={5} className="label">
                    상품 코드
                </Col>
                <Col xs={6} lg={7}>
                    {stateData.product_code === 'C' ? '취소' :stateData.product_code === 'W' ? '대기중': stateData.product_code}                                            
                </Col>

                <Col xs={6} lg={5} className="label">
                    상품 종류
                </Col>
                <Col xs={6} lg={7}>
                    {stateData.product_type == '1'
                        ? '종이책(단권)'
                        : stateData.product_type == '2'    
                            ? '종이책(세트)'
                            : stateData.product_type == '3'    
                                ? '전자책'
                                : stateData.product_type == '4'    
                                    ? '오디오북'
                                    : stateData.product_type == '5'    
                                        ? '동영상 강좌'
                                        : stateData.product_type == '6'    
                                            ? '기타 2차 저작물'
                                            : stateData.product_type == '7'    
                                                ? '비매품'
                                                : '판매용 일반 제품'
                    } 
                </Col>

                <Col xs={6} lg={5} className="label">
                    상품명 {state.adminChk === true && state.popoutChk !== 'Y' && <span className="spanStar">*</span>}
                </Col>
                <Col xs={18} lg={19}>
                    {state.adminChk === true && state.popoutChk !== 'Y' 
                    // && state.today < stateData.release_date
                        ? <>
                            <Input type="text" name="name" value={stateData.name} onChange={handleChangeInput('name')} onBlur={handleChk('name')} autoComplete="off" /> 
                            {state.nameChk === true && <span className="spanLeftRed">* 같은 상품명이 있습니다. 사용할 수 있지만, 중복 여부를 확인해주세요.</span>}
                        </>
                        :  stateData.name
                    }                    
                </Col>

                {/* <Col xs={6} lg={5} className="label">
                    상품명(내부용)
                </Col>
                <Col xs={18} lg={19}>
                    {stateData.internal_name}                                            
                </Col> */}

                <Col xs={6} lg={5} className="label">
                    부제목
                </Col>
                <Col xs={18} lg={19}>
                    {state.adminChk === true && state.popoutChk !== 'Y'
                        ? <Input className="tableInput" type="text" name="subtitle" value={stateData.subtitle} onChange={handleChangeInput('subtitle')} autoComplete="off" /> 
                        :  stateData.subtitle
                    }                    
                </Col>

                <Col xs={6} lg={5} className="label">
                    ISBN/바코드 번호 {(state.adminChk === true && state.popoutChk !== 'Y' && stateData.product_type <= 4 ) && <span className="spanStar">*</span>}
                </Col>
                <Col xs={6} lg={7}>
                    {state.adminChk === true && state.popoutChk !== 'Y' 
                        ? <>
                            <Radio.Group
                                value={stateData['code_type']}
                                onChange={handleChangeInput('code_type')}
                                disabled={stateData.product_type <= 4 && 'disabled'}
                                required
                                className="textAble"
                            >
                                <Radio value='1'>ISBN</Radio>
                                <Radio value='2'>바코드 번호</Radio>
                            </Radio.Group>
                            {/* {stateData.code_type === '2' && */}
                                <Input type="text" name="code_number" value={stateData.code_number} onChange={handleChangeInput('code_number')} style={{width: '200px'}} autoComplete="off" /> 
                            {/* } */}
                            
                        </>
                        : stateData.code_type === '1' ? 'ISBN' :  stateData.code_type === '2' ? '바코드 번호 ('+stateData.code_number+')' : ''

                    }
                
                </Col>

                <Col xs={6} lg={5} className="label">
                    부가기호
                </Col>
                <Col xs={6} lg={7}>
                    {state.adminChk === true && state.popoutChk !== 'Y' 
                        ? <Input className="tableInput" type="text" name="add_sign" value={stateData.add_sign} onChange={handleChangeInput('add_sign')}  autoComplete="off" /> 
                        :  stateData.add_sign
                    }                    
                </Col>

                <Col xs={6} lg={5} className="label">
                    정가 {(state.adminChk === true && state.popoutChk !== 'Y') && <span className="spanStar">*</span>}
                </Col>
                <Col xs={6} lg={7}>
                    {state.adminChk === true && state.popoutChk !== 'Y' ?
                        // <><InputNumber
                        //         value={stateData.price}
                        //         onChange={handleChangeInput('price')}
                        //         formatter={value => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        //         parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        //         controls={false}
                        //         autoComplete="off"
                        //     />
                        // </>
                        <><Input className="tableInput" type="text" name="price" value={stateData.price === 0 ? 0 : commaNum(stateData.price)} onChange={handleChangeInput('price')}  autoComplete="off" /></> 
                    //  {state.adminChk === true && state.popoutChk !== 'Y' 
                    //     && <><Button className='spanLeft' type="primary" htmlType="button" onClick={(e)=>chkDrawer('price')}>변경</Button>
                    //         <span className='spanLeft'>* '과세' 상품인 경우 부가세 포함 가격</span> </>
                    // }               
                    :   stateData.price
                    }
                </Col>

                <Col xs={6} lg={5} className="label">
                    과세 구분 {(state.adminChk === true && state.popoutChk !== 'Y' && stateData.product_type <= 4 ) && <span className="spanStar">*</span>}
                </Col>
                <Col xs={6} lg={7}>
                    {state.adminChk === true && state.popoutChk !== 'Y'
                        ? <>
                            <Radio.Group
                                value={stateData['taxation_type']}
                                onChange={handleChangeInput('taxation_type')}
                                required
                                Disabled = {stateData.product_type <= 4 ? true : false}
                            >
                                <Radio value='1'>면세</Radio>
                                <Radio value='2'>과세</Radio>                                
                            </Radio.Group>
                        </>

                        : stateData.taxation_type === '1' ? '면세' : '과세'
                    }                    
                </Col>

                <Col xs={6} lg={5} className="label">
                    회사
                </Col>
                <Col xs={6} lg={7}>
                    {stateData.company =='G' ? '도서출판 길벗' :stateData.company =='E' ? '이지톡' : '길벗스쿨' }
                </Col>

                <Col xs={6} lg={5} className="label">
                    브랜드
                </Col>
                <Col xs={6} lg={7}>
                    {stateData.brand == '1'
                        ? '도서출판 길벗'
                        : stateData.brand == '2'    
                            ? '이지톡'
                            : stateData.brand == '3'    
                                ? '더퀘스트'
                                : stateData.brand == '4'    
                                    ? '길벗캠퍼스'
                                    : stateData.brand == '5' 
                                        ? '길벗스쿨'
                                        :''
                    } 

                </Col>


                <Col xs={6} lg={5} className="label">
                    담당 부서
                </Col>
                <Col xs={6} lg={7}>
                    {state.adminChk === true && state.popoutChk !== 'Y' 
                        // ? <TargetSelect />      
                        ?   <Select 
                                value={departments} 
                                mode="multiple" 
                                showArrow 
                                style={{ width: '100%' }} 
                                placeholder="담당부서를 선택하세요." 
                                onChange={handleChangeSelect2} 
                                options={state.departmentsOption}
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                            >
                            </Select>
                        // : stateData.departments.length > 0 ? stateData.departments[0].name : ''
                        : departmentsTxt
                    }       
                </Col>
                
                {stateData.product_type === '7' &&
                    <><Col xs={6} lg={5} className="label">
                        비매품 종류 {(state.adminChk === true && state.popoutChk !== 'Y' && stateData.product_type === '7') && <span className="spanStar">*</span>}
                    </Col>
                    <Col xs={6} lg={7}>
                        {state.adminChk === true && state.popoutChk !== 'Y' && stateData.product_type === '7'
                            ? <>
                                <Radio.Group
                                    value={stateData['non_type']}
                                    onChange={handleChangeInput('non_type')}
                                    required
                                >
                                    <Radio value='1'>부록</Radio>
                                    <Radio value='2'>교사/납품용 도서</Radio>
                                    <Radio value='3'>사은품</Radio>
                                    <Radio value='4'>포장물품</Radio>
                                </Radio.Group>
                            </>

                            : stateData.non_type === '1' ? '부록' : stateData.non_type === '2' ? '교사/납품용 도서' : stateData.non_type === '3' ? '사은품'  : stateData.non_type === '4' ? '포장물품' : ''
                        }                    
                    </Col></>
                }

                <Col xs={6} lg={5} className="label">
                    연결 상품
                </Col>
                <Col xs={6} lg={7}>
                    {stateData.connect_product !== '' && stateData.connect_product !== null &&
                        // <Button className='btnLink'>{stateData.connect_product.name}</Button> 
                        stateData.connect_product.name
                    }                    
                </Col>

                {stateData.product_type === '2' && 
                    <><Col xs={6} lg={5} className="label">
                        세트 구성 상품 {(state.adminChk === true && state.popoutChk !== 'Y' && stateData.product_type === '2') && <span className="spanStar">*</span>}
                    </Col>
                    <Col xs={6} lg={7}>
                        {(state.adminChk === true && state.popoutChk !== 'Y' && stateData.product_type === '2')
                            ? <>    
                                <Row>
                                    <Col>   
                                        <div className="inner_dv">
                                            {state.sets.map((e,index)=>(
                                                <span className="dvInline">{e.name}
                                                <Button className="btn_del" onClick={(e) => btnDel('product',index)}>X</Button></span>
                                            ))}                        
                                        </div> 
                                        <Button className="btn btn-primary btn_add" shape="circle" onClick={(e)=> chkDrawer('product')}>+</Button>
                                    </Col>
                                </Row>
                            
                            </>

                            : ''              

                        }
                    </Col></>
                }
                
                <Col xs={6} lg={5} className="label">
                    출시 예정(목표)일 
                </Col>
                <Col xs={6} lg={7}>
                    {state.adminChk === true && state.popoutChk !== 'Y' ?
                        <DatePicker format={'YYYY-MM-DD'} value={stateData.expected_release_date ? moment(stateData.expected_release_date): null} onChange={handleChangeInput('expected_release_date')} disabled={stateData.release_date ? state.today > stateData.release_date ? true : false : false} />
                        : ''
                    }
                </Col>

                <Col xs={6} lg={5} className="label">
                    출시(발행)일
                </Col>
                <Col xs={6} lg={7}>
                    {state.adminChk === true && state.popoutChk !== 'Y' ?
                        <><DatePicker format={'YYYY-MM-DD'} value={stateData.release_date ? moment(stateData.release_date) : null} onChange={handleChangeInput('release_date')}  disabled={state.releaseDateChk === state.inputChk ? false : true}/>
                        <span className="spanLeft"><ExclamationCircleOutlined /> 필수 정보를 등록해야 설정 가능합니다.</span></>
                        : ''
                    }
                </Col>

                <Col xs={6} lg={5} className="label">
                    등록자
                </Col>
                <Col xs={6} lg={7}>
                    {state.create_info?.name}
                </Col>

                <Col xs={6} lg={5} className="label">
                    담당자 
                </Col>
                <Col xs={6} lg={7}>
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
                            >
                            </Select>
                        : managerTxt 
                    }                    
                </Col>

                { stateData.product_type !== '7' &&
                    <><Col xs={6} lg={5} className="label">
                        저작권자/권리자
                    </Col>
                    <Col xs={6} lg={7}>
                        {stateData.contractable !== '' && stateData.contractable !== undefined && stateData.contractable !== null  ? 
                            stateData.contractable.copyrights !== ''&& stateData.contractable.copyrights !== undefined &&
                            // stateData.contractable.copyrights.length > 0 &&
                            stateData.contractable.copyrights.map((e,index)=>(
                                <div className="inner_dv" key={`copyrighter_${index}`}><span className="dvInline">{e.name}</span></div>
                            ))   

                            : ''
                        } 
                        {/* <Button type="primary" htmlType="button" className='spanLeft'>저작권자1</Button>
                        <Button type="primary" htmlType="button" className='spanLeft'>저작권자2</Button> */}
        
                    </Col>

                    <Col xs={6} lg={5} className="label">
                        기여자 
                        {/* {(state.adminChk === true && state.popoutChk !== 'Y' && stateData.product_type <= 4) && <span className="spanStar">*</span>} */}
                    </Col>
                    <Col xs={6} lg={7}>
                        {state.adminChk === true && state.popoutChk !== 'Y' && stateData.product_type <= 4
                            ? <>    
                                <Row>    
                                    <Col>        
                                        <div className="inner_dv">
                                            {state.contributors.map((e,index)=>(
                                                <span key={`contributor_span_${index}`} className="dvInline">{e.name}
                                                <Button key={`contributor_${index}`} className="btn_del" onClick={(a) => btnDel('author',index)}>X</Button></span>
                                            ))}        
                                        </div>                                            
                                        <Button className="btn btn-primary btn_add" shape="circle" onClick={(e)=> {chkDrawer('contributors')}}>+</Button>
                                    </Col>
                                </Row>
                            
                            </>
                            // :<><div className="inner_dv"><span className="dvInline"><a href='' >기여자</a><Button className="btn_del">x</Button></span></div></>
                            : <Row>    
                                    <Col>        
                                        {state.contributors !== '' && 
                                            state.contributors.map((e,index)=>(
                                                <div key={`contributor_${index}`} className="inner_dv"><span className="dvInline">{e.name}</span></div>
                                            ))   
                                        }                                                
                                    </Col>
                                </Row>
                        }
                </Col></>
                }
                    

            </Row>         
            
            {/* 
                최종 쇄 / 저작권 종료일 / 제작 상태 / 정품 재고 
                출시 상태 / 출고 상태 > 설정일
                api 개발 및 적용 필요
            */}
            <Row gutter={10} className="table marginTop">
                <div className="table_title">상태 정보</div>
                <Col xs={6} lg={5} className="label">
                    최종 쇄
                </Col>
                <Col xs={6} lg={7}>
                    {stateData.code}                                            
                </Col>

                <Col xs={6} lg={5} className="label">
                    저작권 종료일
                </Col>
                <Col xs={6} lg={7}>
                    {state.today > stateData.date 
                        ?   <span style={{color:'red'}}>{stateData.date }</span>
                        :   stateData.date 
                    }                                            
                </Col>

                <Col xs={6} lg={5} className="label">
                    출시 상태
                </Col>
                <Col xs={6} lg={7}>
                    {viewData?.distribution?.release_status === 2 ? <>출시/출간(출시일: {viewData.distribution.release_date})</>
                        :
                        viewData?.distribution?.release_status === 3 ? <>출시/출간 취소(설정일: )</>
                            :
                            viewData?.distribution?.release_status === 4 ? <>단종/절판(설정일: )</>
                            :
                        <></>
                    }
                </Col>

                <Col xs={6} lg={5} className="label">
                    제작 상태
                </Col>
                <Col xs={6} lg={7}>
                    초판/3쇄 발주 완료(2099.99.99)
                </Col>

                <Col xs={6} lg={5} className="label">
                    출고 상태
                </Col>
                <Col xs={6} lg={7}>
                    {viewData?.distribution?.shipping_status === 1 ? <>최초 입고 전</>
                        :
                        viewData?.distribution?.shipping_status === 2 ? <>가능</>
                            :
                            viewData?.distribution?.shipping_status === 3 ? <>중단(재고 부족)</>
                                :
                                viewData?.distribution?.shipping_status === 4 ? <>중단 (해제일: {viewData.distribution.shipping_date})</>
                                    :
                                    viewData?.distribution?.shipping_status === 5 ? <>중단(설정일: ) / 해제 예정일: {viewData.distribution.shipping_date}</>
                                        :
                        <></>
                    }
                    {viewData?.distribution?.shipping_discontinuation_reason &&
                        <div>* 사유 : {viewData.distribution.shipping_discontinuation_reason}</div>
                    }
                </Col>

                <Col xs={6} lg={5} className="label">
                    정품 재고
                </Col>
                <Col xs={6} lg={7}>
                    {stateData.product_type}
                </Col>           
            </Row>         
            <div style={{marginTop: '10px',fontWeight: '600'}}><ExclamationCircleOutlined /> 출시/출고 상태 변경은 영업관리팀에 요청해 주세요.</div>               
            
            <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                <Col> 
                    {state.popoutChk === 'Y'
                        ?<>
                            <Button type="button" htmlType="button"  onClick={e => popoutClose('Y')} style={{marginLeft:'10px'}}> 닫기</Button>
                        </>

                        : state.adminChk === true && state.popoutChk !== 'Y' ? 
                            <>
                                <Button type="primary" htmlType="button" onClick={handleSubmit}> 확인</Button>
                                {drawerChk == "Y" && state.adminChk === true && 
                                    <Button htmlType="button" onClick={e => popoutClose('Y')} style={{marginLeft:'10px'}}> 취소 </Button>
                                }     
                            </>        
                            : <Button htmlType="button" onClick={e => popoutClose('Y')} style={{marginLeft:'10px'}}> 취소 </Button>       
                    }     
                </Col>
            </Row> 
       
            { addVisible === true &&
                <AddDrawer  
                    addVisible={addVisible}
                    addOnClose={addOnClose}
                    addData={addData}
                    typeChk={state.typeChk}
                    drawerChk={drawerChk}
                />           
            }            


        </Wrapper>
    );
};

export default inject('commonStore')(observer(InfoDrawer));