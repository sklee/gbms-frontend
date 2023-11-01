import React, { useCallback, useEffect } from "react";
import {Row, Col, Button, Radio, Select, Table, Input, Popover, Modal} from 'antd'
import { observer, useLocalStore } from 'mobx-react';
import { QuestionOutlined } from '@ant-design/icons';
import axios from 'axios';
import { toJS } from 'mobx';

import tooltipData from '@pages/tooltipData';

const DEF_STATE = {
    basic : null,   //수정/삭제용 임시 ID, api에 전달 x

    composition: null, //구성 정보 - 기본 구성 ('본책','별책','합본')
    produce_format_id: null, //구성 정보 - 판형
    type: 3, //합본 - 합본 방식
    tab_yn: null, //표지 - 날개 ('Y','N')
    paper_information_id: null, //표지 - 종이 (표지 체크된 종이)
    cmyk_front: null, //1, 2, 4 도
    cmyk_back: null, //0, 1, 2, 4 도
    produce_process_id: null, //표지 - 후가공 > 공정 (그룹)
    paper_standard_id : null, //표지 - 후가공 > 종이규격 (그룹)
    endpaper_yn: null, //없음 인쇄영역 숨김
    print_yn: null, //있음 : 종이, 인쇄, 제본 | 없음 : 종이, 제본
    text_paper_information_id: null, //'제작 시뮬레이션 기준 > 종이'에서 사용 가능 대상에 '본문' 체크된 종이
    cmyk1: null,
    cmyk2: null,
    cmyk4: null,
    binding_produce_process_id: null, //제본 - 제본 방식 > 공정 (그룹)
    binding_produce_format_id: null, //제본 - 제본 방식 > 판형 (그룹)
    etc_accessory_produce_process_id: null, //기타 - 부속물 (그룹)
    cover_yn: 'N',
    etc_cover_paper_information_id: null, //기타 - 커버지 있음 선택시 선택(paper_information_id)
    belt_yn: 'N',
    etc_belt_paper_information_id: null, //기타 - 띠지 있음 선택시 선택(paper_information_id)
    etc_packing_produce_process_id: null, //기타 - 포장 (그룹)
    compilation_print_binding_processing : null, //합본 - 인쇄 / 제본/ 후가공
    results: null
};

const BoundVolumes = observer(({onClose,qty,getBook,basic,modData}) =>{
    const { Option } = Select;

    const stateData = useLocalStore(() => ({ ...DEF_STATE }));
    const { confirm } = Modal;

    const state = useLocalStore(() => ({
        wayValue : 3,

        qty:0,
        sourceData : null,
        basicCount : null,
        cover_print : 0,
        tooltipData :'',

        selected : {},
        produce_format : [],
        simulation_paper  : [],             //종이
        simulation_print : [],              //인쇄
        simulation_postprocess : [],        //후가공
        simulation_endpaper : [],           //면지
        simulation_binding  : [],           //제본
        simulation_accessory : [],          //부속 제작
        simulation_belt : [],               //띠지/커버지
        simulation_package : [],            //포장
        simulation_binding_attached : [],   //제본 추가
    }));

    useEffect(() => {
        state.qty = qty;
        if(basic){
            stateData.basic = basic.basic;
            stateData.composition = basic.composition;
            state.basicCount = basic.count;
        }

        getSimPaper();
        getSimPrinting();
        getSimBinding();
        getSimPostprocess();
        getSimPackage();

        state.sourceData = [];
        const temp_list = ['paper','print','binding','postprocess','adjuncts','packing','prdCost'];
        returnData(3).map((row,index) => {
            var temp = {};
            temp_list.map(item => {
                temp[item] = row[item];
            })
            state.sourceData = [...state.sourceData, temp];
            if(index === 0){    //전체 항목 크기 맞추기 (인쇄/제본/후가공 영역 추가)
                state.sourceData = [...state.sourceData, temp];
            }
        });

        if(modData){    //수정
            var temp_type = Object.keys(DEF_STATE);
            temp_type = temp_type.filter(e=> e!=='results');
            temp_type.forEach((item)=>{
                stateData[item] = modData[item];
            });
            temp_type.forEach((item)=>{
                // stateData[item] = modData[item];
                if (item === 'paper_information_id') {
                    getSimBelt();
                }
            });
        }

        if(tooltipData){
            state.tooltipData = tooltipData.filter(e=>e.key==='simulation_2').map(item => {
                return <div dangerouslySetInnerHTML={{__html: item.memo}}></div>
            });
        }

    }, [qty, basic]);

    const calcTemplate = useLocalStore(()=>({
        //종이 소요량 계산
        text_subdivision : 1, //본문 절수(produce-formats)
        cover_subdivision : 1, //전지 구분값(표지)
        
        get apply_subdivison() { return this.text_subdivision / this.paper_subdivision }, //본문 적용 절수
        get cover_plate() { return stateData.tab_yn=='Y' ? 4 : 6 }, //표지 판걸이수
        etc_plate : 4, //기타 판걸이수
        get paper_net_cover() { return state.qty / this.cover_plate * this.cover_subdivision / 500 },//종이 정미 (표지)
        get paper_net_sub() { return state.qty / this.etc_plate * this.cover_subdivision / 500 },//종이 정미 (기타)
        get paper_quantity_cover() { return Math.ceil((this.paper_net_cover + 0.5)* 2 ) / 2 }, //종이 수량 (표지)
        get paper_quantity_sub() { return Math.ceil((this.paper_net_sub + 0.5)* 2 ) / 2 }, //종이 수량 (기타)

        //인쇄 소요량 계산
        get print_net_sub() { 
            var temp = state.qty / (this.cover_plate * this.cover_subdivision) / 500;
            return Math.ceil(temp);
        },//인쇄 정미 (본문 외)
        get print_quantity_sub() { return this.print_net_sub * (stateData.cmyk_front+stateData.cmyk_back) },//인쇄 수량 (본문 외)
    }));

    const getSimPaper = useCallback(async () =>{
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/simulation-paper?display=100&page=1&sort_by=date&order=desc',
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            },
        );
        state.simulation_paper = result.data.data;
    },[]);

    const getSimPrinting = useCallback(async () =>{
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/simulation-printing?display=100&page=1&sort_by=date&order=desc',
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            },
        );
        state.simulation_print = result.data.data;

        if(state.qty){
            var price = state.simulation_print.find(e=>e.print_unit == '표지')?.price;
            if(price){
                var apply_price = null;
                price.map(f=>{
                    if(!apply_price && f.qty >= state.qty){
                        apply_price = f.price;
                    }
                });
                if(!apply_price){
                    apply_price = price.find(g=>g.end_yn=='Y').price;
                }
                state.cover_print =  apply_price;
            }else{
                state.cover_print = 0;
            }
        }else{
            state.cover_print = 0;
        }

    },[]);

    const getSimPostprocess = useCallback(async () =>{
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/simulation-processing?display=100&page=1&sort_by=date&order=desc',
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            },
        );
        state.simulation_postprocess = result.data.data.filter(e=> (e.produce_process_unit == '연'||e.produce_process_unit == '개'));
    },[]);

    const getSimBinding = useCallback(async () =>{
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/simulation-binding?display=100&page=1&sort_by=date&order=desc',
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            },
        );
        // state.simulation_binding = result.data.data.filter(e=>e.produce_process == '합본용 무선제본');
        state.simulation_binding = result.data.data.filter(e=>e.produce_process == '합본용 좌철무선제본');
        stateData.binding_produce_format_id = state.simulation_binding[0].produce_format_id;
        stateData.binding_produce_process_id = state.simulation_binding[0].produce_process_id;
        // getSimBindingAttached();
    },[]);

    const getSimBindingAttached = useCallback(async () =>{
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/simulation-binding-attached?display=100&page=1&sort_by=date&order=desc',
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            },
        );
        state.simulation_binding_attached = result.data.data.find(e=>(e.produce_process_id==stateData.binding_produce_process_id));
    },[]);

    const getSimBelt = useCallback(async () =>{
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/simulation-belt?display=100&page=1&sort_by=date&order=desc',
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            },
        );
        state.simulation_belt = result.data.data.find(e => e.id == stateData.paper_information_id);
    },[]);

    const getSimPackage = useCallback(async () =>{
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/simulation-packing?display=100&page=1&sort_by=date&order=desc',
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            },
        );
        state.simulation_package = result.data.data;
    },[]);

    const wayValChange = (e) =>{
        stateData.type = e.target.value;

        var temp_source = [];
        const temp_list = ['paper','print','binding','postprocess','adjuncts','packing','prdCost'];
        returnData(3).map((row,index) => {
            var temp = {};
            temp_list.map(item => {
                temp[item] = 0;     //result 값 강제 Reset
            })
            temp_source = [...temp_source, temp];
            if(index === 0){    //전체 항목 크기 맞추기 (인쇄/제본/후가공 영역 추가)
                temp_source = [...temp_source, temp];
            }
        });

        state.sourceData = [...temp_source];
    }

    const handleChangeInput = useCallback(
        (type) => (e) => {
            if (type === 'type') {
                stateData[type] = e.target.value;
                stateData['binding_produce_process_id'] = null;
                stateData['binding_produce_format_id'] = null;
                getSimBinding();
            }else if (type === 'produce_format_id') {
                stateData[type] = e;
                state.selected[type] = toJS(state.produce_format.find(item=>item.id == e))?.paper_standard;
                getSimPaper();
                getSimPrinting();
                getSimBinding();
            }else if (type === 'paper_information_id') {
                stateData[type] = e;
                getSimBelt();
            }else if (type === 'produce_process_id') {
                stateData[type] = e;
                stateData['paper_standard_id'] = state.simulation_postprocess.find(item=>item.produce_process_id==e).paper_standard_id;
            }else if (type === 'binding_produce_process_id') {
                stateData[type] = e;
                stateData['binding_produce_format_id'] = state.simulation_binding.find(item=>item.produce_process_id == e)?.produce_format_id;
                // getSimBindingAttached();
            }else if(!e.target){
                stateData[type] = e;
            }else{
                stateData[type] = e.target.value;
            }
            console.log('handleChange',type,toJS(stateData[type]));
        },[],
    );

    const returnData = (val) => {
        switch(val){
            case 3:
                return boundData;
                break;
            case 4:
                return coverData;
                break;
            case 5:
                return divideData;
                break;
            case 6:
                return packingData;
                break;
        }
    }

    const columns = [
        {
            title: '구성',
            dataIndex: 'composition',
            key: 'composition',
            onCell: (_, index) => {
                if (index === 0) {
                    return {rowSpan: 7};
                } 
                if (index > 0 && index < 7) {
                    return {rowSpan: 0};
                }
            },
            align: 'center',
        },
        {
            title: '사양',
            dataIndex: 'specifications',
            key: 'specifications',
            colSpan: 2,
            align: 'center',
        },
        {
            title: '',
            dataIndex: 'value',
            key: 'value',
            colSpan: 0,
        },
        {
            title: '단가',
            children:[
                {
                    title: '종이',
                    dataIndex: 'paper',
                    key: 'paper',
                    align: 'right',
                    render :(text,record)=>{
                        // data[record.key-1].paper = text;
                        if(state.sourceData){
                            state.sourceData[record.key-1].paper = text;
                        }
                        return text;
                    },
                },
                {
                    title: '인쇄',
                    dataIndex: 'print',
                    key: 'print',
                    align: 'right',
                    render :(text,record)=>{
                        // data[record.key-1].print = text;
                        if(state.sourceData){
                            state.sourceData[record.key-1].print = text;
                        }
                        return text;
                    },
                },
                {
                    title: '제본',
                    dataIndex: 'binding',
                    key: 'binding',
                    align: 'right',
                    render :(text,record)=>{
                        // data[record.key-1].binding = text;
                        if(state.sourceData){
                            state.sourceData[record.key-1].binding = text;
                        }
                        return text;
                    },
                },
                {
                    title: '(후가공)',
                    dataIndex: 'postprocess',
                    key: 'pappostprocesser',
                    align: 'right',
                    render :(text,record)=>{
                        // data[record.key-1].postprocess = text;
                        if(state.sourceData){
                            state.sourceData[record.key-1].postprocess = text;
                        }
                        return text;
                    },
                },
                {
                    title: '(부속물)',
                    dataIndex: 'adjuncts',
                    key: 'adjuncts',
                    align: 'right',
                    render :(text,record)=>{
                        // data[record.key-1].adjuncts = text;
                        if(state.sourceData){
                            state.sourceData[record.key-1].adjuncts = text;
                        }
                        return text;
                    },
                },
                {
                    title: '(포장)',
                    dataIndex: 'packing',
                    key: 'packing',
                    align: 'right',
                    render :(text,record)=>{
                        // data[record.key-1].packing = text;
                        if(state.sourceData){
                            state.sourceData[record.key-1].packing = text;
                        }
                        return text;
                    },
                },
            ]
        },
        {
            title: '제작비',
            dataIndex: 'prdCost',
            key: 'prdCost',
            align: 'right',
            // render: (text, record) => {
            //     const { paper, print, binding, postprocess, adjuncts, packing } = record;
            //     const total = paper + print + binding + postprocess + adjuncts + packing;
            //     var res = Math.floor(total * state.qty * 1.1);
            //     // data[record.key-1].prdCost = res;
            //     if(state.sourceData){
            //         state.sourceData[record.key-1].prdCost = res;
            //     }
            //     return res;
            // },
            render: (text, record) => {
                const { paper, print, binding, postprocess, adjuncts, packing } = record;
                if(state.sourceData){
                    if(record.key-1 == 2){          //표지 - 종이
                        var res = Math.floor(paper * calcTemplate.paper_quantity_cover * 1.1);
                    }else if(record.key-1 == 3){    //표지 - 인쇄
                        var res = Math.floor(print * calcTemplate.print_quantity_sub * 1.1);
                    }
                    else if(record.key-1 == 6){    //표지 - 커버지/띠지
                        const total = print + binding + postprocess + adjuncts + packing;
                        // console.log(paper,calcTemplate.paper_quantity_sub,Math.floor(paper * calcTemplate.paper_quantity_sub * 1.1),res)
                        var res = Math.floor(paper * calcTemplate.paper_quantity_sub * 1.1) + Math.floor(total * state.qty * 1.1);
                        // var res = Math.floor(total * state.qty * 1.1);
                    }else{
                        const total = paper + print + binding + postprocess + adjuncts + packing;
                        var res = Math.round(total * state.qty * 1.1);
                    }
                    // data[record.key-1].prdCost = res;
                    state.sourceData[record.key-1].prdCost = res;
                }
                return res;
            },
        },
    ];

    const boundData =[
        {
            key: 1,
            composition: '합본',
            specifications: <>합본 방식 <span className="spanStar">*</span></>,
            value: <>
                <Radio.Group value={stateData.type} onChange={wayValChange}>
                    <Radio value={3}>합본 표지 제작</Radio>
                    <Radio value={4}>커버지로 씌움</Radio>
                    <Radio value={5}>분권형 책속의 책</Radio>
                    <Radio value={6}>포장만 함</Radio>
                </Radio.Group>
            </>,
            paper: 0,
            print: 0,
            binding: 0,
            postprocess: 0,
            adjuncts: 0,
            packing: 0,
            prdCost: 0,
        },
        {
            key: 2,
            composition: '합본',
            specifications: <>날개 <span className="spanStar">*</span></>,
            value: <>
                <Radio.Group value={stateData.tab_yn} onChange={handleChangeInput('tab_yn')}>
                    <Radio value={'Y'}>있음</Radio>
                    <Radio value={'N'}>없음</Radio>
                </Radio.Group>
            </>,
            paper: 0,
            print: 0,
            binding: 0,
            postprocess: 0,
            adjuncts: 0,
            packing: 0,
            prdCost: 0,
        },
        {
            key: 3,
            composition: '합본',
            specifications: <>종이 <span className="spanStar">*</span></>,
            value: <Select placeholder="선택해 주세요." value={stateData.paper_information_id} onChange={handleChangeInput('paper_information_id')}>
                {state.simulation_paper.filter(e=>e.cover=='Y').map((item) => (
                    <Option key={item['id']} value={item['id']}>{item['paper_name']}({item['apply_price']}원)</Option>
                ))}
                </Select>,
            paper: stateData.paper_information_id?state.simulation_paper.find(e=>e.id == stateData.paper_information_id)?.apply_price:0,
            print: 0,
            binding: 0,
            postprocess: 0,
            adjuncts: 0,
            packing: 0,
            prdCost: 0,
        },
        {
            key: 4,
            composition: '합본',
            specifications: <>인쇄 <span className="spanStar">*</span></>,
            value: <>
                <span style={{marginRight: 10}}>앞면</span>
                <Radio.Group value={stateData.cmyk_front} onChange={handleChangeInput('cmyk_front')}>
                    <Radio value={1}>1도</Radio>
                    <Radio value={2}>2도</Radio>
                    <Radio value={3}>3도</Radio>
                </Radio.Group>
                <br/>
                <span style={{marginRight: 10}}>뒷면</span>
                <Radio.Group value={stateData.cmyk_back} onChange={handleChangeInput('cmyk_back')}>
                    <Radio value={0}>0도</Radio>
                    <Radio value={1}>1도</Radio>
                    <Radio value={2}>2도</Radio>
                    <Radio value={4}>4도</Radio>
                </Radio.Group>
            </>,
            paper: 0,
            print: state.cover_print,
            binding: 0,
            postprocess: 0,
            adjuncts: 0,
            packing: 0,
            prdCost: 0,
        },
        {
            key: 5,
            composition: '합본',
            specifications: <>후가공 <span className="spanStar">*</span></>,
            value: <Select placeholder="선택해 주세요." value={stateData.produce_process_id} onChange={handleChangeInput('produce_process_id')}>
                        {state.simulation_postprocess.map((item) => (
                                <Option key={item['produce_process_id']} value={item['produce_process_id']}>{item['produce_process']}({item['apply_price']}원)</Option>
                            ))}
                    </Select>,
            paper: 0,
            print: 0,
            binding: 0,
            postprocess: stateData.produce_process_id?state.simulation_postprocess.find(e=>e.produce_process_id == stateData.produce_process_id)?.apply_price:0,
            adjuncts: 0,
            packing: 0,
            prdCost: 0,
        },
        {
            key: 6,
            composition: '합본',
            specifications: '제본',
            value: '(합본용 표지제본 기본 적용)',
            paper: 0,
            print: 0,
            binding: stateData.binding_produce_process_id?state.simulation_binding.find(e=>e.produce_process_id == stateData.binding_produce_process_id)?.apply_price2:0,
            postprocess: 0,
            adjuncts: 0,
            packing: 0,
            prdCost: 0,
        },
        {
            key: 8,
            composition: '합본',
            specifications: '포장',
            value: <Select placeholder="선택해 주세요." value={stateData.etc_packing_produce_process_id} onChange={handleChangeInput('etc_packing_produce_process_id')}>
                        {state.simulation_package.map((item) => (
                                <Option key={item['id']} value={item['id']}>{item.produce_process}</Option>
                            ))}
                    </Select>,
            paper: 0,
            print: 0,
            binding: 0,
            postprocess: 0,
            adjuncts: 0,
            packing: stateData.etc_packing_produce_process_id?state.simulation_package.find(e=>e.id == stateData.etc_packing_produce_process_id)?.apply_price:0,
            prdCost: 0,
        }
    ];

    const coverData = [
        {
            key: 1,
            composition: '합본',
            specifications: <>합본 방식 <span className="spanStar">*</span></>,
            value: <>
                <Radio.Group value={stateData.type} onChange={wayValChange}>
                    <Radio value={3}>합본 표지 제작</Radio>
                    <Radio value={4}>커버지로 씌움</Radio>
                    <Radio value={5}>분권형 책속의 책</Radio>
                    <Radio value={6}>포장만 함</Radio>
                </Radio.Group>
            </>,
            paper: 0,
            print: 0,
            binding: 0,
            postprocess: 0,
            adjuncts: 0,
            packing: 0,
            prdCost: 0,
        },
        {
            key: 3,
            composition: '합본',
            specifications: <>종이 <span className="spanStar">*</span></>,
            value: <Select placeholder="선택해 주세요." value={stateData.paper_information_id} onChange={handleChangeInput('paper_information_id')}>
                    {state.simulation_paper.filter(e=>e.cover=='Y').map((item) => (
                        <Option key={item['id']} value={item['id']}>{item['paper_name']}({item['apply_price']}원)</Option>
                    ))}
                    </Select>,
            paper: stateData.paper_information_id?state.simulation_paper.find(e=>e.id == stateData.paper_information_id)?.apply_price:0,
            print: 0,
            binding: 0,
            postprocess: 0,
            adjuncts: 0,
            packing: 0,
            prdCost: 0,
        },
        {
            key: 7,
            composition: '합본',
            specifications: '인쇄/제본/후가공',
            value: '(평균적인 제작비로 기본 적용)',
            paper: (stateData.type==4 && stateData.paper_information_id)?state.simulation_paper.find(e=>e.id == stateData.paper_information_id)?.apply_price:0,
            print: (stateData.type==4 && stateData.paper_information_id)?state.simulation_belt?.print_price3:0,
            binding: (stateData.type==4 && stateData.paper_information_id)?state.simulation_belt?.bind_price3:0,
            postprocess: (stateData.type==4 && stateData.paper_information_id)?state.simulation_belt?.processing_price3:0,
            adjuncts: 0,
            packing: 0,
            prdCost: 0,
        },
        {
            key: 8,
            composition: '합본',
            specifications: '포장',
            value: <Select placeholder="선택해 주세요." value={stateData.etc_packing_produce_process_id} onChange={handleChangeInput('etc_packing_produce_process_id')}>
                    {state.simulation_package.map((item) => (
                            <Option key={item['id']} value={item['id']}>{item.produce_process}</Option>
                        ))}
                </Select>,
            paper: 0,
            print: 0,
            binding: 0,
            postprocess: 0,
            adjuncts: 0,
            packing: stateData.etc_packing_produce_process_id?state.simulation_package.find(e=>e.id == stateData.etc_packing_produce_process_id)?.apply_price:0,
            prdCost: 0,
        },
    ];

    const divideData = [
        {
            key: 1,
            composition: '합본',
            specifications: <>합본 방식 <span className="spanStar">*</span></>,
            value: <>
                <Radio.Group value={stateData.type} onChange={wayValChange}>
                    <Radio value={3}>합본 표지 제작</Radio>
                    <Radio value={4}>커버지로 씌움</Radio>
                    <Radio value={5}>분권형 책속의 책</Radio>
                    <Radio value={6}>포장만 함</Radio>
                </Radio.Group>
            </>,
            paper: 0,
            print: 0,
            binding: 0,
            postprocess: 0,
            adjuncts: 0,
            packing: 0,
            prdCost: 0,
        },
        {
            key: 6,
            composition: '합본',
            specifications: '제본',
            value: '(평균적인 제본비로 기본 적용)',
            paper: 0,
            print: 0,
            binding: state.basicCount-1,
            postprocess: 0,
            adjuncts: 0,
            packing: 0,
            prdCost: 0,
        },
        {
            key: 8,
            composition: '합본',
            specifications: '포장',
            value: <Select placeholder="선택해 주세요." value={stateData.etc_packing_produce_process_id} onChange={handleChangeInput('etc_packing_produce_process_id')}>
                    {state.simulation_package.map((item) => (
                            <Option key={item['id']} value={item['id']}>{item.produce_process}</Option>
                        ))}
                </Select>,
            paper: 0,
            print: 0,
            binding: 0,
            postprocess: 0,
            adjuncts: 0,
            packing: stateData.etc_packing_produce_process_id?state.simulation_package.find(e=>e.id == stateData.etc_packing_produce_process_id)?.apply_price:0,
            prdCost: 0,
        },
    ];

    const packingData = [
        {
            key: 1,
            composition: '합본',
            specifications: <>합본 방식 <span className="spanStar">*</span></>,
            value: <>
                <Radio.Group value={stateData.type} onChange={wayValChange}>
                    <Radio value={3}>합본 표지 제작</Radio>
                    <Radio value={4}>커버지로 씌움</Radio>
                    <Radio value={5}>분권형 책속의 책</Radio>
                    <Radio value={6}>포장만 함</Radio>
                </Radio.Group>
            </>,
            paper: 0,
            print: 0,
            binding: 0,
            postprocess: 0,
            adjuncts: 0,
            packing: 0,
            prdCost: 0,
        },
        {
            key: 8,
            composition: '합본',
            specifications: '포장',
            value: <Select placeholder="선택해 주세요." value={stateData.etc_packing_produce_process_id} onChange={handleChangeInput('etc_packing_produce_process_id')}>
                    {state.simulation_package.map((item) => (
                            <Option key={item['id']} value={item['id']}>{item.produce_process}</Option>
                        ))}
                </Select>,
            paper: 0,
            print: 0,
            binding: 0,
            postprocess: 0,
            adjuncts: 0,
            packing: stateData.etc_packing_produce_process_id?state.simulation_package.find(e=>e.id == stateData.etc_packing_produce_process_id)?.apply_price:0,
            prdCost: 0,
        },
    ];

    //등록
    const handleSubmit = useCallback(async (e)=> {      
        const temp_list = ['paper','print','binding','postprocess','adjuncts','packing','prdCost'];
        var submit = state.sourceData;
        var arr = []
        submit.map((row) => {
            var temp = {};
            temp_list.map(item => {
                temp[item] = row[item];
            })
            arr = [...arr, temp];
        });
        stateData.results = toJS(arr);

        // console.log('submit',toJS(stateData));
        // return false;
        getBook(toJS(stateData));
    }, []);

    return(
        <>
            <Row gutter={10} className="table marginTop">
                <div className="table_title">
                    구성별 사양과 단가, 제작비
                    <Popover content={state.tooltipData[0]}>
                        <Button
                            shape="circle"
                            icon={
                                <QuestionOutlined
                                    style={{ fontSize: '11px' }}
                                />
                            }
                            size="small"
                            style={{ marginLeft: 5, marginTop: 0 }}
                        />
                    </Popover>
                </div>
            </Row>
            
            <Table
                columns={columns}
                dataSource={returnData(stateData.type)}
                pagination={false}
                className="prdCostTable"
                style={{marginBottom: 20}}
            />

            <Row gutter={[10, 10]} justify="center" style={{marginTop: 20}}>
                <Col>
                    <Button className='ant-btn-etc' htmlType='button' onClick={handleSubmit}>적용</Button>
                    <Button htmlType='button' style={{marginLeft: 10}} onClick={onClose}>취소</Button>
                </Col>
            </Row>
        </>
    );
});

export default BoundVolumes;