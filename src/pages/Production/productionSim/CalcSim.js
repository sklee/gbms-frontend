import axios from 'axios';

const DEF_DETAILS = {
    basic: null,
    cover: 0,
    content: 0,
    end_paper: 0,
    binding: 0,
    book_band: 0,
    adjuncts: 0,
    packing: 0,
    sum: 0,
    product_cost: 0,
    work_status: null,
};

const DEF_PROCESS = {
    basic: null,
    paper: 0,
    print: 0,
    binding: 0,
    postprocess: 0,
    adjuncts: 0,
    packing: 0,
    sum: 0,
    product_cost: 0,
    work_status: null,
};

let produce_format = null;
let simulation_paper = null;
let simulation_print = null;

export function getCalcTemplate (stateData,qty,a,b,c){
    //종이 소요량 계산
    const text_subdivision = a; //본문 절수(produce-formats)
    const cover_subdivision = b; //전지 구분값(표지)
    const paper_subdivision = c; //전지 구분값(본문)
    
    const apply_subdivison = text_subdivision / paper_subdivision  ; //본문 적용 절수
    const paper_unit1 = stateData.cmyk1 / (apply_subdivison * 2)  ; //종이 대수 (1도)
    const paper_unit2 = stateData.cmyk2 / (apply_subdivison * 2)  ; //종이 대수 (2도)
    const paper_unit4 = stateData.cmyk4 / (apply_subdivison * 2)  ; //종이 대수 (4도)
    const paper_net_main = (paper_unit1 + paper_unit2 + paper_unit4) * qty / 500  ; //종이 정미 (본문)
    const paper_extra1 = paper_unit1 * 190 / 500  ; //여분 (1도)
    const paper_extra2 = paper_unit2 * 190 / 500  ; //여분 (2도)
    const paper_extra4 = paper_unit4 * 250 / 500  ; //여분 (4도)
    const paper_quantity = Math.ceil((paper_net_main + (paper_extra1 + paper_extra2 + paper_extra4))* 2 ) / 2  ; //종이 수량 (본문)

    const cover_plate = stateData.tab_yn=='Y' ? 4 : 6  ; //표지 판걸이수
    const etc_plate = 4; //기타 판걸이수
    const paper_net_cover = qty / cover_plate * cover_subdivision / 500  ;//종이 정미 (표지)
    const paper_net_sub = qty / etc_plate * cover_subdivision / 500  ;//종이 정미 (기타)
    const paper_quantity_cover = Math.ceil((paper_net_cover + 0.5)* 2 ) / 2  ; //종이 수량 (표지)
    const paper_quantity_sub = Math.ceil((paper_net_sub + 0.5)* 2 ) / 2  ; //종이 수량 (기타)


    //인쇄 소요량 계산
    const print_unit1 = stateData.cmyk1 / (text_subdivision * 2)  ;//인쇄 대수 (1도)
    const print_unit2 = stateData.cmyk2 / (text_subdivision * 2)  ;//인쇄 대수 (2도)
    const print_unit4 = stateData.cmyk4 / (text_subdivision * 2)  ;//인쇄 대수 (4도)
    const print_net_main1 = print_unit1 * qty / 500  ;//인쇄 정미 (본문 - 1도)
    const print_net_main2 = print_unit2 * qty / 500  ;//인쇄 정미 (본문 - 2도)
    const print_net_main4 = print_unit4 * qty / 500  ;//인쇄 정미 (본문 - 4도)
    const print_net_sub = Math.ceil(qty / (cover_plate * cover_subdivision) / 500) ;//인쇄 정미 (본문 외)
    const print_quantity = (print_net_main1 * 1) + (print_net_main2 * 2) + (print_net_main4 * 4)  ;//인쇄 수량 (본문)
    const print_quantity_sub = print_net_sub * (stateData.cmyk_front+stateData.cmyk_back)  ;//인쇄 수량 (본문 외)

    return {
        text_subdivision,
        cover_subdivision,
        paper_subdivision,
        apply_subdivison,
        paper_unit1,
        paper_unit2,
        paper_unit4,
        paper_net_main,
        paper_extra1,
        paper_extra2,
        paper_extra4,
        paper_quantity,
        cover_plate,
        etc_plate,
        paper_net_cover,
        paper_net_sub,
        paper_quantity_cover,
        paper_quantity_sub,
        print_unit1,
        print_unit2,
        print_unit4,
        print_net_main1,
        print_net_main2,
        print_net_main4,
        print_net_sub,
        print_quantity,
        print_quantity_sub,
    };
};

async function getFormats(){
    const result = await axios.get(
        process.env.REACT_APP_API_URL +'/api/v1/produce-formats',
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        },
    );
    // return result.data.data.find(e=>e.id == stateData.produce_format_id);
    return result.data.data;
}

async function getSimPrint(){
    const result = await axios.get(
        process.env.REACT_APP_API_URL +'/api/v1/simulation-printing?display=100&page=1&sort_by=date&order=desc',
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        },
    );
    return result.data.data;
}

async function getSimPaper(){
    const result = await axios.get(
        process.env.REACT_APP_API_URL +'/api/v1/simulation-paper?display=100&page=1&sort_by=date&order=desc',
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        },
    );
    return result.data.data;
}

function getAllApis () {
    return Promise.all([getFormats(),getSimPrint(),getSimPaper()]).then(data=>{
        produce_format = data[0];
        simulation_print = data[1];
        simulation_paper = data[2];

        return true;
    }).catch(err=> {return false});
}

// export function CalcDevCostBook (stateData,qty) {
const CalcDevCostBook = (stateData,qty) => {

    //부수 범위에 따른 단가 재정의
    var cover_print = 0;
    var text_print = 0;

    var price = simulation_print.find(e=>e.print_unit == '표지')?.price;
    if(price){
        var apply_price = null;
        price.map(f=>{
            if(!apply_price && f.qty >= qty){
                apply_price = f.price;
            }
        });
        if(!apply_price){
            apply_price = price.find(g=>g.end_yn=='Y').price;
        }
        cover_print =  apply_price;
    }else{
        cover_print = 0;
    }

    var price = simulation_print.find(e=>e.print_unit == '본문')?.price;
    if(price){
        var apply_price = null;
        price.map(f=>{
            if(!apply_price && f.qty >= qty){
                apply_price = f.price;
            }
        });
        if(!apply_price){
            apply_price = price.find(g=>g.end_yn=='Y').price;
        }
        text_print =  apply_price;
    }else{
        text_print = 0;
    }

    //판형 설정
    var format = produce_format.find(e=>e.id == stateData.produce_format_id);

    // get 본문 절수
    var text_subdivision,cover_subdivision,paper_subdivision;
    var calcTemplate = null;
    text_subdivision = format.paper_cutting;
    if(format.paper_standard.includes('반절')){
        cover_subdivision = 2;
    }else{
        cover_subdivision = 1;
    }
    if(format.paper_standard.includes('반절')){
        paper_subdivision = 2;
    }else{
        paper_subdivision = 1;
    }

    calcTemplate = getCalcTemplate(stateData,qty,text_subdivision,cover_subdivision,paper_subdivision);

    if(typeof stateData.results === 'string'){
        var jsonArr = JSON.parse(stateData.results);
        var arr = Array.isArray(jsonArr) ? jsonArr : [];
    }else{
        var arr = stateData.results;
    }

    const calc_res = arr.map((item,index) => {
        const { paper, print, binding, postprocess, adjuncts, packing } = item;
        if(index == 2){          //표지 - 종이
            var res = Math.floor(paper * calcTemplate.paper_quantity_cover * 1.1);
        }else if(index == 3){    //표지 - 인쇄
            var res = Math.floor(cover_print * calcTemplate.print_quantity_sub * 1.1);
        }else if(index == 6){    //본문 - 종이
            var res = Math.floor(paper * calcTemplate.paper_quantity * 1.1);
        }else if(index == 7){    //본문 - 인쇄 1도
            var res = Math.floor(text_print * calcTemplate.print_net_main1 * 1 * 1.1);
        }else if(index == 8){    //본문 - 인쇄 2도
            var res = Math.floor(text_print * calcTemplate.print_net_main2 * 2 * 1.1);
        }else if(index == 9){    //본문 - 인쇄 4도
            var res = Math.floor(text_print * calcTemplate.print_net_main4 * 4 * 1.1);
        }else if(index == 10){    //본문 - 제본 방식
            var res = Math.floor(binding * (Number(stateData.cmyk1|| 0) + Number(stateData.cmyk2|| 0) + Number(stateData.cmyk4|| 0)) * 1.1);
        }else if(index == 13 || index == 14){    //본문 - 커버지/띠지
            const total = print + binding + postprocess + adjuncts + packing;
            var res = Math.floor(paper * calcTemplate.paper_quantity_sub * 1.1) + Math.floor(total * qty * 1.1);
        }else{
            const total = paper + print + binding + postprocess + adjuncts + packing;
            var res = Math.floor(total * qty * 1.1);
        }
        item.prdCost = res;
        return item;
    });

    return calc_res;
}

// export function CalcDevCostCombine (stateData,qty) {
const CalcDevCostCombine = (stateData,qty) => {
    //부수 범위에 따른 단가 재정의
    var cover_print = 0;

    var price = simulation_print.find(e=>e.print_unit == '표지')?.price;
    if(price){
        var apply_price = null;
        price.map(f=>{
            if(!apply_price && f.qty >= qty){
                apply_price = f.price;
            }
        });
        if(!apply_price){
            apply_price = price.find(g=>g.end_yn=='Y').price;
        }
        cover_print =  apply_price;
    }else{
        cover_print = 0;
    }

    var text_subdivision,cover_subdivision,paper_subdivision;
    var calcTemplate = null;

    // get 전지 구분값(표지)
    var tab = simulation_paper.find(e=>e.id == stateData.paper_information_id)?.paper_standard;
    if(tab.includes('반절')){
        cover_subdivision = 2;
    }else{
        cover_subdivision = 1;
    }

    calcTemplate = getCalcTemplate(stateData,qty,1,cover_subdivision,1);
    var jsonArr = JSON.parse(stateData.results);
    var arr = Array.isArray(jsonArr) ? jsonArr : [];

    const calc_res = arr.map((item,index) => {
        const { paper, print, binding, postprocess, adjuncts, packing } = item;
        if(index == 2){          //표지 - 종이
            var res = Math.floor(paper * calcTemplate.paper_quantity_cover * 1.1);
        }else if(index == 3){    //표지 - 인쇄
            var res = Math.floor(cover_print * calcTemplate.print_quantity_sub * 1.1);
        }else if(index == 6){    //표지 - 커버지/띠지
            const total = print + binding + postprocess + adjuncts + packing;
            // var res = Math.floor(total / 3 * qty * 1.1);
            var res = Math.floor(paper * calcTemplate.paper_quantity_sub * 1.1) + Math.floor(total * qty * 1.1);
        }else{
            const total = paper + print + binding + postprocess + adjuncts + packing;
            var res = Math.round(total * qty * 1.1);
        }
        item.prdCost = res;
        return item;
    });

    return calc_res;
}


export const CalcDevCost = (setData,qty) => {
    var result = null;

    const res = getAllApis().then((values) => {
        if(setData && setData.length){
            result = setData.map(data=>{
                var temp_basic = data.basic;
                var prdCost = 0;
                if(data.composition !== '합본'){
                    data.results = CalcDevCostBook(data,qty);
                }else{
                    data.results = CalcDevCostCombine(data,qty);
                }


                //set process list
                var temp_process = { ...DEF_PROCESS };
                if(data.composition !== '합본'){
                    data.results.map((e,index) => {
                        if(index === 5)temp_process.paper += parseFloat(e.paper); // 종이
                        if(index === 5 || index === 13 || index === 14)temp_process.print += parseFloat(e.print); // 인쇄
                        if(index !== 10)temp_process.binding += parseFloat(e.binding); // 제본
                        temp_process.postprocess += parseFloat(e.postprocess); // 후가공
                        temp_process.adjuncts += parseFloat(e.adjuncts); // 부속물
                        temp_process.packing += parseFloat(e.packing); // 포장
                        prdCost += parseFloat(e.prdCost); // 합계
                    });
                    temp_process['basic'] = temp_basic;
                    temp_process.paper *= qty * 1.1;
                    temp_process.paper += data.results[2].prdCost;
                    temp_process.paper += data.results[6].prdCost;
                    temp_process.paper += data.results[13].prdCost - ((data.results[13].print+data.results[13].binding+data.results[13].postprocess)*qty*1.1);
                    temp_process.paper += data.results[14].prdCost - ((data.results[14].print+data.results[14].binding+data.results[14].postprocess)*qty*1.1);
                    
                    temp_process.print *= qty * 1.1;
                    temp_process.print += data.results[3].prdCost;
                    temp_process.print += data.results[7].prdCost;
                    temp_process.print += data.results[8].prdCost;
                    temp_process.print += data.results[9].prdCost;
                    
                    temp_process.binding *= qty * 1.1;
                    temp_process.binding += data.results[10].prdCost;

                    temp_process.postprocess *= qty * 1.1;
                    temp_process.adjuncts *= qty * 1.1;
                    temp_process.packing *= qty * 1.1;
                }else{
                    data.results.map((e,index) => {
                        if(index !== 2 && index !== 6)temp_process.paper += parseFloat(e.paper); // 종이
                        if(index !== 3)temp_process.print += parseFloat(e.print); // 인쇄
                        temp_process.binding += parseFloat(e.binding); // 제본
                        temp_process.postprocess += parseFloat(e.postprocess); // 후가공
                        temp_process.adjuncts += parseFloat(e.adjuncts); // 부속물
                        temp_process.packing += parseFloat(e.packing); // 포장
                        prdCost += parseFloat(e.prdCost); // 합계
                    });
                    temp_process['basic'] = temp_basic;
                    temp_process.paper *= qty * 1.1;
                    temp_process.paper += data.results[2].prdCost;
                    temp_process.paper += data.results[6].prdCost - ((data.results[6].print+data.results[6].binding+data.results[6].postprocess)*qty*1.1);

                    temp_process.print *= qty * 1.1;
                    temp_process.print += data.results[3].prdCost;

                    temp_process.binding *= qty * 1.1;
                    temp_process.postprocess *= qty * 1.1;
                    temp_process.adjuncts *= qty * 1.1;
                    temp_process.packing *= qty * 1.1;
                }
                temp_process.paper = Math.round(temp_process.paper);
                temp_process.print = Math.floor(temp_process.print);
                temp_process.binding = Math.floor(temp_process.binding);
                temp_process.postprocess = Math.floor(temp_process.postprocess);
                temp_process.adjuncts = Math.floor(temp_process.adjuncts);
                temp_process.packing = Math.floor(temp_process.packing);

                temp_process.sum = prdCost;
                temp_process.product_cost = Math.floor(prdCost / qty);

                //set details list
                if(data.composition !== '합본'){
                    var temp_details = { ...DEF_DETAILS };
                    temp_details.cover += (parseFloat(data.results[2].prdCost) + parseFloat(data.results[3].prdCost) + parseFloat(data.results[4].prdCost)); // 표지
                    temp_details.end_paper += (parseFloat(data.results[5].prdCost)); // 면지
                    temp_details.content += (parseFloat(data.results[6].prdCost) + parseFloat(data.results[7].prdCost) + parseFloat(data.results[8].prdCost) + parseFloat(data.results[9].prdCost)); // 본문
                    temp_details.binding += (parseFloat(data.results[10].prdCost) + parseFloat(data.results[11].prdCost)); // 제본
                    temp_details.adjuncts += (parseFloat(data.results[12].prdCost)); // 부속물
                    temp_details.book_band += (parseFloat(data.results[13].prdCost) + parseFloat(data.results[14].prdCost)); // 띠지/커버지
                    temp_details.packing += (parseFloat(data.results[15].prdCost)); // 포장
                    temp_details['basic'] = temp_basic;
                    temp_details.sum = prdCost;
                    temp_details.product_cost = Math.floor(prdCost / qty);
                }else{
                    var temp_details = { ...DEF_DETAILS };
                    temp_details.cover += (parseFloat(data.results[2].prdCost) + parseFloat(data.results[3].prdCost) + parseFloat(data.results[4].prdCost) + parseFloat(data.results[6].prdCost)
                    - Math.floor(parseFloat((data.results[6].binding) * qty * 1.1))); // 표지
                    temp_details.binding += (parseFloat(data.results[5].prdCost + Math.floor(parseFloat((data.results[6].binding) * qty * 1.1)))); // 제본
                    // temp_details.book_band += (parseFloat(data.results[6].prdCost)); // 띠지/커버지
                    temp_details.packing += (parseFloat(data.results[7].prdCost)); // 포장
                    temp_details['basic'] = temp_basic;
                    temp_details.sum = prdCost;
                    temp_details.product_cost = Math.floor(prdCost / qty);
                }

                return {processList:temp_process,detailsList:temp_details}
            });
            return result;
        }
    })
    return res;
}