import React, { useCallback, useEffect } from 'react';
import {Row, Col, Button, Radio, Select, Table, Input, Popover, Modal} from 'antd'
import { observer, useLocalStore } from 'mobx-react';
import { QuestionOutlined } from '@ant-design/icons';
import * as wjInput from '@grapecity/wijmo.react.input';
import axios from 'axios';
import { toJS, computed } from 'mobx';

import tooltipData from '@pages/tooltipData';

const DEF_STATE = {
    basic : null,   //수정/삭제용 임시 ID, api에 전달 x

    composition: null, //구성 정보 - 기본 구성 ('본책','별책','합본')
    produce_format_id: null, //구성 정보 - 판형
    type: null, //표지 - 구분 ('일반','양장')
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

const AddBookTable = observer(({onClose,qty,getBook,basic,modData}) =>{
    const { Option } = Select;

    const stateData = useLocalStore(() => ({ ...DEF_STATE }));
    const { confirm } = Modal;

    const state = useLocalStore(() => ({
        qty:0,
        sourceData : null,
        cover_print : 0,
        text_print : 0,
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

    const calcTemplate = useLocalStore(()=>({
        //종이 소요량 계산
        text_subdivision : 1, //본문 절수(produce-formats)
        cover_subdivision : 1, //전지 구분값(표지)
        paper_subdivision : 1, //전지 구분값(본문)
        cover_adjust : 1, //조정 (표지)
        paper_adjust : 1, //조정 (본문)
        
        get apply_subdivison() { return this.text_subdivision / this.paper_subdivision }, //본문 적용 절수
        get paper_unit1() { return stateData.cmyk1 / (this.apply_subdivison * 2) }, //종이 대수 (1도)
        get paper_unit2() { return stateData.cmyk2 / (this.apply_subdivison * 2) }, //종이 대수 (2도)
        get paper_unit4() { return stateData.cmyk4 / (this.apply_subdivison * 2) }, //종이 대수 (4도)
        get paper_net_main() { return (this.paper_unit1 + this.paper_unit2 + this.paper_unit4) * state.qty / 500 }, //종이 정미 (본문)
        get paper_extra1() { return this.paper_unit1 * 190 / 500 }, //여분 (1도)
        get paper_extra2() { return this.paper_unit2 * 190 / 500 }, //여분 (2도)
        get paper_extra4() { return this.paper_unit4 * 250 / 500 }, //여분 (4도)
        get paper_quantity() { return Math.ceil((this.paper_net_main + (this.paper_extra1 + this.paper_extra2 + this.paper_extra4))* 2 ) / 2 }, //종이 수량 (본문)

        get cover_plate() { return stateData.tab_yn=='Y' ? 4 : 6 }, //표지 판걸이수
        etc_plate : 4, //기타 판걸이수
        get paper_net_cover() { return state.qty / this.cover_plate * this.cover_subdivision / 500 },//종이 정미 (표지)
        get paper_net_sub() { return state.qty / this.etc_plate * this.cover_subdivision / 500 },//종이 정미 (기타)
        get paper_quantity_cover() { return Math.ceil((this.paper_net_cover + 0.5)* 2 ) / 2 }, //종이 수량 (표지)
        get paper_quantity_sub() { return Math.ceil((this.paper_net_sub + 0.5)* 2 ) / 2 }, //종이 수량 (기타)


        //인쇄 소요량 계산
        get print_unit1() { return stateData.cmyk1 / (this.text_subdivision * 2) },//인쇄 대수 (1도)
        get print_unit2() { return stateData.cmyk2 / (this.text_subdivision * 2) },//인쇄 대수 (2도)
        get print_unit4() { return stateData.cmyk4 / (this.text_subdivision * 2) },//인쇄 대수 (4도)
        get print_net_main1() { return this.print_unit1 * state.qty / 500 },//인쇄 정미 (본문 - 1도)
        get print_net_main2() { return this.print_unit2 * state.qty / 500 },//인쇄 정미 (본문 - 2도)
        get print_net_main4() { return this.print_unit4 * state.qty / 500 },//인쇄 정미 (본문 - 4도)
        get print_net_sub() { 
            var temp = state.qty / (this.cover_plate * this.cover_subdivision) / 500;
            // if(temp < 1){
            //     return 1;
            // }else{
            //     return temp;
            // }
            return Math.ceil(temp);
        },//인쇄 정미 (본문 외)
        get print_quantity() { return (this.print_net_main1 * 1) + (this.print_net_main2 * 2) + (this.print_net_main4 * 4) },//인쇄 수량 (본문)
        get print_quantity_sub() { return this.print_net_sub * (stateData.cmyk_front+stateData.cmyk_back) },//인쇄 수량 (본문 외)
    }));

    useEffect(() => {
        state.qty = qty;
        if(basic){
            stateData.basic = basic.basic;
            stateData.composition = basic.composition;
        }
        getFormats().then(e=>{
            if(!modData && basic.produce_format_id){
                stateData['produce_format_id'] = basic.produce_format_id;
                state.selected['produce_format_id'] = toJS(state.produce_format.find(item2=>item2.id == stateData['produce_format_id']))?.paper_standard;
                calcTemplate.text_subdivision = toJS(state.produce_format.find(item3=>item3.id == stateData.produce_format_id))?.paper_cutting;
                getSimPaper();
                getSimBinding();
            }
        });
        getSimPostprocess();
        getSimEndpaper();
        getSimAccesory();
        getSimPackage();
        getSimPrinting().then(e=>{
            setPrintPrice('표지');
            setPrintPrice('본문');
        });

        state.sourceData = [];
        const temp_list = ['paper','print','binding','postprocess','adjuncts','packing','prdCost'];
        data.map((row,index) => {
            var temp = {};
            temp_list.map(item => {
                temp[item] = row[item];
            })
            state.sourceData = [...state.sourceData, temp];
        });

        if(modData){    //수정
            var temp_type = Object.keys(DEF_STATE);
            temp_type = temp_type.filter(e=> e!=='results');
            temp_type.forEach((item)=>{
                stateData[item] = modData[item];
            });
            temp_type.forEach((item)=>{
                // stateData[item] = modData[item];
                if (item === 'type') {
                    getSimBinding();
                }else if (item === 'produce_format_id') {
                    getFormats().then((data) => {
                        state.selected[item] = toJS(state.produce_format.find(item2=>item2.id == stateData[item]))?.paper_standard;
                        calcTemplate.text_subdivision = toJS(state.produce_format.find(item3=>item3.id == stateData.produce_format_id))?.paper_cutting;
                        getSimPaper().then(() => {
                            var tab = state.simulation_paper.find(e=>e.id == stateData.paper_information_id)?.paper_standard;
                            if(tab){
                                if(tab.includes('반절')){
                                    calcTemplate.cover_subdivision = 2;
                                }else{
                                    calcTemplate.cover_subdivision = 1;
                                }
                            }
                            tab = state.simulation_paper.find(e=>e.id == stateData.text_paper_information_id)?.paper_standard;
                            if(tab){
                                if(tab.includes('반절')){
                                    calcTemplate.paper_subdivision = 2;
                                }else{
                                    calcTemplate.paper_subdivision = 1;
                                }
                            }
                        });
                    });
                    getSimBinding();
                }else if (item === 'produce_process_id') {
                }else if(item === 'paper_information_id'){
                    // var tab = state.simulation_paper.find(e=>e.id == stateData.paper_information_id)?.paper_standard;
                    // if(tab.includes('반절')){
                    //     calcTemplate.cover_subdivision = 2;
                    // }else{
                    //     calcTemplate.cover_subdivision = 1;
                    // }
                }else if(item === 'text_paper_information_id'){
                    // var tab = state.simulation_paper.find(e=>e.id == stateData.text_paper_information_id)?.paper_standard;
                    //본문 인쇄
                    // if(tab.includes('반절')){
                    //     calcTemplate.paper_subdivision = 2;
                    // }else{
                    //     calcTemplate.paper_subdivision = 1;
                    // }
                }else if (item === 'binding_produce_process_id') {
                    getSimBindingAttached();
                }else if (item === 'cover_yn') {
                    if(stateData.cover_yn == 'Y'){
                        getSimBelt();
                    }
                }else if (item === 'belt_yn') {
                    if(stateData.belt_yn == 'Y'){
                        getSimBelt();
                    }
                }
            });
        }
        if(tooltipData){
            state.tooltipData = tooltipData.filter(e=>e.key==='simulation_1').map(item => {
                return <div dangerouslySetInnerHTML={{__html: item.memo}}></div>
            });
        }
    }, [qty, basic]);

    const getFormats = useCallback(async () =>{
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/produce-formats',
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            },
        );
        state.produce_format = result.data.data;
        return (state.produce_format.length > 0);
    },[]);

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
        state.simulation_paper = result.data.data.filter(e=> e.paper_standard == state.selected['produce_format_id']);
    },[]);

    const getSimPrinting = useCallback(async (type) =>{
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

    const getSimEndpaper = useCallback(async () =>{
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/simulation-endpaper?display=100&page=1&sort_by=date&order=desc',
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            },
        );
        state.simulation_endpaper = result.data.data[0];
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
        state.simulation_binding = result.data.data.filter(e=>{
            if(e.produce_format_id==stateData.produce_format_id){
                if(stateData.type=='1'){
                    return (e.normal == 'Y');
                }else if(stateData.type=='2'){
                    return (e.hardcover == 'Y');
                }else{
                    return false;
                }
            }else{
                return false;
            }
        });
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

    const getSimAccesory = useCallback(async () =>{
        const result = await axios.get(
            process.env.REACT_APP_API_URL +'/api/v1/simulation-accessory?display=100&page=1&sort_by=date&order=desc',
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            },
        );
        state.simulation_accessory = result.data.data;
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
        state.simulation_belt = result.data.data;
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

    const handleChangeInput = useCallback(
        (type) => (e) => {
            if (type === 'type') {
                stateData[type] = e.target.value;
                stateData['binding_produce_process_id'] = null;
                stateData['binding_produce_format_id'] = null;
                getSimBinding();
            }else if (type === 'produce_format_id') {
                if(stateData['produce_format_id']){
                    confirm({
                        title: '판형을 변경하면 대부분의 사양이 변경되기 때문에 현재 입력/선택값은 초기화 됩니다.',
                        content: '계속하시겠습니까?',
                        onOk() {
                            //초기화
                            var temp_type = Object.keys(DEF_STATE);
                            temp_type = temp_type.filter(e=> e!=='basic' && e!=='composition');
                            temp_type.map(e=>stateData[e] = DEF_STATE[e]);

                            //재등록
                            stateData[type] = e;
                            state.selected[type] = toJS(state.produce_format.find(item=>item.id == e))?.paper_standard;
                            calcTemplate.text_subdivision = toJS(state.produce_format.find(item=>item.id == e))?.paper_cutting;
                            getSimPaper();
                            getSimBinding();
                        },
                        onCancel(){

                        },
                    });
                }else{
                    stateData[type] = e;
                    state.selected[type] = toJS(state.produce_format.find(item=>item.id == e))?.paper_standard;
                    calcTemplate.text_subdivision = toJS(state.produce_format.find(item=>item.id == e))?.paper_cutting;
                    getSimPaper();
                    getSimBinding();
                }
            }else if(type === 'paper_information_id'){
                stateData[type] = e;
                var tab = state.simulation_paper.find(e=>e.id == stateData.paper_information_id)?.paper_standard;
                if(tab){
                    if(tab.includes('반절')){
                        calcTemplate.cover_subdivision = 2;
                    }else{
                        calcTemplate.cover_subdivision = 1;
                    }
                }else{
                    calcTemplate.cover_subdivision = 1;
                }
            }else if(type === 'text_paper_information_id'){
                stateData[type] = e;
                var tab = state.simulation_paper.find(e=>e.id == stateData.text_paper_information_id)?.paper_standard;
                //본문 인쇄
                if(tab){
                    if(tab.includes('반절')){
                        calcTemplate.paper_subdivision = 2;
                    }else{
                        calcTemplate.paper_subdivision = 1;
                    }
                }else{
                    calcTemplate.paper_subdivision = 1;
                }
            }else if (type === 'produce_process_id') {
                stateData[type] = e;
                stateData['paper_standard_id'] = state.simulation_postprocess.find(item=>item.produce_process_id==e).paper_standard_id;
            }else if (type === 'binding_produce_process_id') {
                stateData[type] = e;
                stateData['binding_produce_format_id'] = state.simulation_binding.find(item=>item.produce_process_id == e)?.produce_format_id;
                getSimBindingAttached();
            }else if (type === 'cover_yn') {
                stateData[type] = e.target.value;
                if(e.target.value == 'Y'){
                    getSimBelt();
                }else{
                    stateData['etc_cover_paper_information_id'] = null;
                }
            }else if (type === 'belt_yn') {
                stateData[type] = e.target.value;
                if(e.target.value == 'Y'){
                    getSimBelt();
                }else{
                    stateData['etc_belt_paper_information_id'] = null;
                }
            }else if(!e.target){
                stateData[type] = e;
            }else{
                stateData[type] = e.target.value;
            }
            // console.log('handleChange',type,toJS(stateData[type]));
        },[],
    );

    const setPrintPrice = (type) =>{
        if(state.qty){
            if(type=== '표지'){
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
            }else if(type=== '본문'){
                var price = state.simulation_print.find(e=>e.print_unit == '본문')?.price;
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
                    state.text_print =  apply_price;
                }else{
                    state.text_print = 0;
                }
            }
        }else{
            state.cover_print = 0;
            state.text_print = 0;
        }
    }

    const columns = [
        {
            title: '구성',
            dataIndex: 'composition',
            key: 'composition',
            onCell: (_, index) => {
                if (index === 0) {
                    return {rowSpan: 5};
                } 
                if (index > 0 && index < 5) {
                    return {rowSpan: 0};
                }
                if (index === 6) {
                    return {rowSpan: 4};
                }
                if (index > 6 && index < 10) {
                    return {rowSpan: 0};
                }
                if (index === 10) {
                    return {rowSpan: 2};
                } 
                if (index === 11) {
                    return {rowSpan: 0};
                }
                if (index === 12) {
                    return {rowSpan: 4};
                } 
                if (index > 12 && index < 16) {
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
            title: <>
                단가
                <Popover content={state.tooltipData[0]}>
                    <Button
                        shape="circle"
                        icon={
                            <QuestionOutlined
                                style={{ fontSize: '11px' }}
                            />
                        }
                        size="small"
                        style={{ marginLeft: '5px' }}
                    />
                </Popover>
            </>,
            children:[
                {
                    title: '종이',
                    dataIndex: 'paper',
                    key: 'paper',
                    align: 'right',
                    render :(text,record)=>{
                        data[record.key-1].paper = text;
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
                        data[record.key-1].print = text;
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
                        data[record.key-1].binding = text;
                        if(state.sourceData){
                            state.sourceData[record.key-1].binding = text;
                        }
                        return text;
                    },
                },
                {
                    title: '(후가공)',
                    dataIndex: 'postprocess',
                    key: 'postprocess',
                    align: 'right',
                    render :(text,record)=>{
                        data[record.key-1].postprocess = text;
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
                        data[record.key-1].adjuncts = text;
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
                        data[record.key-1].packing = text;
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
            render: (text, record) => {
                const { paper, print, binding, postprocess, adjuncts, packing } = record;
                if(state.sourceData){
                    if(record.key-1 == 2){          //표지 - 종이
                        var res = Math.floor(paper * calcTemplate.paper_quantity_cover * 1.1);
                    }else if(record.key-1 == 3){    //표지 - 인쇄
                        var res = Math.floor(print * calcTemplate.print_quantity_sub * 1.1);
                    }else if(record.key-1 == 6){    //본문 - 종이
                        var res = Math.floor(paper * calcTemplate.paper_quantity * 1.1);
                    }else if(record.key-1 == 7){    //본문 - 인쇄 1도
                        var res = Math.floor(print * calcTemplate.print_net_main1 * 1 * 1.1);
                    }else if(record.key-1 == 8){    //본문 - 인쇄 2도
                        var res = Math.floor(print * calcTemplate.print_net_main2 * 2 * 1.1);
                    }else if(record.key-1 == 9){    //본문 - 인쇄 4도
                        var res = Math.floor(print * calcTemplate.print_net_main4 * 4 * 1.1);
                    }else if(record.key-1 == 10){    //본문 - 제본 방식
                        var res = Math.floor(binding * (Number(stateData.cmyk1|| 0) + Number(stateData.cmyk2|| 0) + Number(stateData.cmyk4|| 0)) * 1.1);
                    }else if(record.key-1 == 13 || record.key-1 == 14){    //본문 - 커버지/띠지
                        const total = print + binding + postprocess + adjuncts + packing;
                        var res = Math.floor(paper * calcTemplate.paper_quantity_sub * 1.1) + Math.floor(total * state.qty * 1.1);
                    }else{
                        const total = paper + print + binding + postprocess + adjuncts + packing;
                        var res = Math.floor(total * state.qty * 1.1);
                    }
                    data[record.key-1].prdCost = res;
                    state.sourceData[record.key-1].prdCost = res;
                }
                return res;
            },
        },
    ];

    const data =[
        {
            key: 1,
            composition: '표지',
            specifications: <>구분 <span className="spanStar">*</span></>,
            value: <>
                <Radio.Group value={stateData.type} onChange={handleChangeInput('type')}>
                    <Radio value={'1'}>일반</Radio>
                    <Radio value={'2'}>양장(싸바리 표지 사양 추가 선택)</Radio>
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
            composition: '표지',
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
            composition: '표지',
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
            prdCost:0,
        },
        {
            key: 4,
            composition: '표지',
            specifications: <>인쇄 <span className="spanStar">*</span></>,
            value: <>
                <span style={{marginRight: 10}}>앞면</span>
                <Radio.Group value={stateData.cmyk_front} onChange={handleChangeInput('cmyk_front')}>
                    <Radio value={1}>1도</Radio>
                    <Radio value={2}>2도</Radio>
                    <Radio value={4}>4도</Radio>
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
            composition: '표지',
            specifications: '후가공',
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
            composition: '면지',
            specifications: <>구분 <span className="spanStar">*</span></>,
            value: <>
                <span style={{marginRight: 10}}>면지</span>
                <Radio.Group value={stateData.endpaper_yn} onChange={handleChangeInput('endpaper_yn')}>
                    <Radio value={'Y'}>있음</Radio>
                    <Radio value={'N'}>없음</Radio>
                </Radio.Group>
                <br/>
                {stateData.endpaper_yn !== 'Y' ? '' : (
                    <>
                        <span style={{marginRight: 10}}>인쇄</span>
                        <Radio.Group value={stateData.print_yn} onChange={handleChangeInput('print_yn')}>
                            <Radio value={'Y'}>있음</Radio>
                            <Radio value={'N'}>없음</Radio>
                        </Radio.Group>
                    </>
                )}
            </>,
            paper: stateData.endpaper_yn=='Y'?state.simulation_endpaper?.paper_price:0,
            print: (stateData.endpaper_yn=='Y' && stateData.print_yn=='Y')?state.simulation_endpaper?.print_price:0,
            binding: stateData.endpaper_yn=='Y'?state.simulation_endpaper?.bind_price:0,
            postprocess: 0,
            adjuncts: 0,
            packing: 0,
            prdCost: 0,
        },
        {
            key: 7,
            composition: '본문',
            specifications: '종이',
            value: <Select placeholder="선택해 주세요." value={stateData.text_paper_information_id} onChange={handleChangeInput('text_paper_information_id')}>
                        {state.simulation_paper.filter(e=>e.text=='Y').map((item) => (
                                <Option key={item['id']} value={item['id']}>{item['paper_name']}({item['apply_price']}원)</Option>
                            ))}
                    </Select>,
            paper: stateData.text_paper_information_id?state.simulation_paper.find(e=>e.id == stateData.text_paper_information_id)?.apply_price:0,
            print: 0,
            binding: 0,
            postprocess: 0,
            adjuncts: 0,
            packing: 0,
            prdCost: 0,
        },
        {
            key: 8,
            composition: '본문',
            specifications: '인쇄',
            value: <Row>
                <Col span={2}>1도</Col>
                <Col span={4}><Input value={stateData.cmyk1} onChange={handleChangeInput('cmyk1')} /></Col>
                <Col span={2}>쪽</Col>
            </Row>,
            paper: 0,
            print: state.text_print,
            binding: 0,
            postprocess: 0,
            adjuncts: 0,
            packing: 0,
            prdCost: 0,
        },
        {
            key: 9,
            composition: '본문',
            specifications: '인쇄',
            value: <Row>
                <Col span={2}>2도</Col>
                <Col span={4}><Input value={stateData.cmyk2} onChange={handleChangeInput('cmyk2')} /></Col>
                <Col span={2}>쪽</Col>
            </Row>,
            paper: 0,
            print: state.text_print,
            binding: 0,
            postprocess: 0,
            adjuncts: 0,
            packing: 0,
            prdCost: 0,
        },
        {
            key: 10,
            composition: '본문',
            specifications: '인쇄',
            value: <Row>
                <Col span={2}>4도</Col>
                <Col span={4}><Input value={stateData.cmyk4} onChange={handleChangeInput('cmyk4')} /></Col>
                <Col span={2}>쪽</Col>
            </Row>,
            paper: 0,
            print: state.text_print,
            binding: 0,
            postprocess: 0,
            adjuncts: 0,
            packing: 0,
            prdCost: 0,
        },
        {
            key: 11,
            composition: '제본',
            specifications: <>제본 방식 <span className="spanStar">*</span></>,
            value: <Select placeholder="선택해 주세요." value={stateData.binding_produce_process_id} onChange={handleChangeInput('binding_produce_process_id')}>
                    {state.simulation_binding.map((item) => (
                            <Option key={item['produce_process_id']} value={item['produce_process_id']}>{item.produce_format}</Option>
                        ))}
                </Select>,
            paper: 0,
            print: 0,
            binding: stateData.binding_produce_process_id?state.simulation_binding.find(e=>e.produce_process_id == stateData.binding_produce_process_id)?.apply_price2:0,
            postprocess: 0,
            adjuncts: 0,
            packing: 0,
            prdCost: 0,
        },
        {
            key: 12,
            composition: '제본',
            specifications: '제본 부속',
            value: state.simulation_binding_attached.produce_process,
            paper: 0,
            print: 0,
            binding: stateData.binding_produce_process_id?state.simulation_binding_attached?.apply_price:0,
            postprocess: 0,
            adjuncts: 0,
            packing: 0,
            prdCost: 0,
        },
        {
            key: 13,
            composition: '기타',
            specifications: '부속물',
            value: <Select placeholder="선택해 주세요." value={stateData.etc_accessory_produce_process_id} onChange={handleChangeInput('etc_accessory_produce_process_id')}>
                    {state.simulation_accessory.map((item) => (
                            <Option key={item['produce_process_id']} value={item['produce_process_id']}>{item.produce_process}</Option>
                        ))}
                </Select>,
            paper: 0,
            print: 0,
            binding: 0,
            postprocess: 0,
            adjuncts: stateData.etc_accessory_produce_process_id?state.simulation_accessory.find(e=>e.produce_process_id == stateData.etc_accessory_produce_process_id)?.apply_price:0,
            packing: 0,
            prdCost: 0,
        },
        {
            key: 14,
            composition: '기타',
            specifications: '커버지',
            value: <>
                <Radio.Group value={stateData.cover_yn} onChange={handleChangeInput('cover_yn')}>
                    <Radio value={'N'}>없음</Radio>
                    <Radio value={'Y'}>있음</Radio>
                </Radio.Group>
                <br/>
                <Select placeholder="선택해 주세요." disabled={stateData.cover_yn !== 'Y' ? true : false} value={stateData.etc_cover_paper_information_id} onChange={handleChangeInput('etc_cover_paper_information_id')}>
                    {state.simulation_belt.map((item) => (
                            <Option key={item['id']} value={item['id']}>{item.paper_name}</Option>
                        ))}
                </Select>
            </>,
            paper: (stateData.cover_yn=='Y' && stateData.etc_cover_paper_information_id)?state.simulation_paper.find(e=>e.id == stateData.etc_cover_paper_information_id)?.apply_price:0,
            print: (stateData.cover_yn=='Y' && stateData.etc_cover_paper_information_id)?state.simulation_belt.find(e=>e.id == stateData.etc_cover_paper_information_id)?.print_price2:0,
            binding: (stateData.cover_yn=='Y' && stateData.etc_cover_paper_information_id)?state.simulation_belt.find(e=>e.id == stateData.etc_cover_paper_information_id)?.bind_price2:0,
            postprocess: (stateData.cover_yn=='Y' && stateData.etc_cover_paper_information_id)?state.simulation_belt.find(e=>e.id == stateData.etc_cover_paper_information_id)?.processing_price2:0,
            adjuncts: 0,
            packing: 0,
            prdCost: 0,
        },
        {
            key: 15,
            composition: '기타',
            specifications: '띠지',
            value: <>
                <Radio.Group value={stateData.belt_yn} onChange={handleChangeInput('belt_yn')}>
                    <Radio value={'N'}>없음</Radio>
                    <Radio value={'Y'}>있음</Radio>
                </Radio.Group>
                <br/>
                <Select placeholder="선택해 주세요." disabled={stateData.belt_yn !== 'Y' ? true : false} value={stateData.etc_belt_paper_information_id} onChange={handleChangeInput('etc_belt_paper_information_id')}>
                    {state.simulation_belt.map((item) => (
                            <Option key={item['id']} value={item['id']}>{item.paper_name}</Option>
                        ))}
                </Select>
            </>,
            paper: (stateData.belt_yn=='Y' && stateData.etc_belt_paper_information_id)?state.simulation_paper.find(e=>e.id == stateData.etc_belt_paper_information_id)?.apply_price:0,
            print: (stateData.belt_yn=='Y' && stateData.etc_belt_paper_information_id)?state.simulation_belt.find(e=>e.id == stateData.etc_belt_paper_information_id)?.print_price1:0,
            binding: (stateData.belt_yn=='Y' && stateData.etc_belt_paper_information_id)?state.simulation_belt.find(e=>e.id == stateData.etc_belt_paper_information_id)?.bind_price1:0,
            postprocess: (stateData.belt_yn=='Y' && stateData.etc_belt_paper_information_id)?state.simulation_belt.find(e=>e.id == stateData.etc_belt_paper_information_id)?.processing_price1:0,
            adjuncts: 0,
            packing: 0,
            prdCost: 0,
        },
        {
            key: 16,
            composition: '기타',
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
            <div style={{marginBottom: 20}}>
                <Row gutter={10} className="table marginTop">
                    <div className="table_title">구성 정보</div>
                    <Col xs={24} lg={4} className="label">기본 구성</Col>
                    <Col xs={24} lg={8}>{stateData.basic}</Col>
                    <Col xs={24} lg={4} className="label">판형 <span className="spanStar">*</span></Col>
                    <Col xs={24} lg={8}>
                        <Select placeholder="선택해 주세요." value={stateData.produce_format_id} onChange={handleChangeInput('produce_format_id')}>
                            {state.produce_format.map((item) => (
                                <Option key={item['id']} value={item['id']}>{item['name']}({item['width']}x{item['height']},{item['reference_standard']})</Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
            </div>
            
            <div className="ant-row table" style={{position: 'sticky', top: -24, zIndex: 1}}>
                <div className="ant-col addLabel ant-col-xs-24 ant-col-lg-24" style={{paddingLeft: 5, paddingRight: 5, border: 0, }}>구성별 사양과 단가, 제작비</div>
            </div>
            
            {stateData.produce_format_id &&
                <Table
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    className="prdCostTable"
                />
            }

            <Row gutter={[10, 10]} justify="center" style={{marginTop: 20}}>
                <Col>
                    <Button htmlType='button' className='ant-btn-etc' onClick={handleSubmit}>적용</Button>
                    <Button htmlType='button' style={{marginLeft: 10}} onClick={onClose}>취소</Button>
                </Col>
            </Row>
        </>
    );
})

export default AddBookTable;