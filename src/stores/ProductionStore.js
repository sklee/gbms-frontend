import { observable, action } from 'mobx';

class ProductionStore {
    @observable data = '짜잔! ';
    @observable stateData = {
        //id 값이 있으면 수정 없으면 입력
        title: null,
        product_id: null,
        product_grade: null,
        product_qty: null,
        product_date: null,
        department_code_id: null,
        results: [
            {
                price: null,
                supply_price: null,//공급가 (price * 0.64)
                royalty: null,
                logistics_price: null,
                development_price: null,
                production_price: null,
                all_rate: null,
                production_rate: null,
                sales: null,
                sales_amount: null,
                year1: null,
                year2: null,
                year3: null
            }
        ],
        development: {
            editing: null,
            translation: null,
            proofread: null,
            typeset: null,
            ctp: null,
            film: null,
            planning: null,
            supervise: null,
            add_content: null,
            editing_data: null,
            design: null,
            cover: null,
            text: null,
            output: null,
            design_data: null,
            ad: null,
            presentation_qty: null,
            presentation_price: null,
            operating_cost: null,
            results: null
        },
        production: [{
            basic : null,
            composition: null, //구성 정보 - 기본 구성 ('본책','별책','합본')
            produce_format_id: null, //구성 정보 - 판형
            type: null, //구분/합본 방식 1:일반, 2양장, 3:합본 표지 제작, 4:커버지 씌움, 5:분권형 책속의 책, 6:포장만 함
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
            binding_produce_format_id: null, //제본 - 제본 방식 > 판형 (그룹)y
            etc_accessory_produce_process_id: null, //기타 - 부속물 (그룹)
            cover_yn: null,
            etc_cover_paper_information_id: null, //기타 - 커버지 있음 선택시 선택(paper_information_id)
            belt_yn: null,
            etc_belt_paper_information_id: null, //기타 - 띠지 있음 선택시 선택(paper_information_id)
            etc_packing_produce_process_id: null, //기타 - 포장 (그룹)
            compilation_print_binding_processing : null, //합본 - 인쇄 / 제본/ 후가공
            results: null
        }],
        share: []
    };
    @observable results = [];
    @observable development = {};
    @observable production = [];
    @observable share = [];
    @observable detailsList = [];
    @observable processList = [];
    @observable qty = 100;
    @observable contracts = {};
    @observable productGrade = null;
    
    constructor() {
    }

    @action
    resetData(){
        this.results = [];
        this.development = {};
        this.production = [];
        this.share = [];
        this.detailsList = [];
        this.processList = [];
        this.qty = 100;
        this.contracts = {};
        this.productGrade = null;
    }
}

export default ProductionStore;