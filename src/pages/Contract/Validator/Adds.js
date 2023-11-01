import { toJS } from 'mobx';

export function AddValidation (data,idx, file) {
    var msg = '';
    var states = false;

    //공통 정보
    if(data.company === ''){
        msg  = '계약 회사를 선택하세요.';
        return {states : states, msg : msg};
    }
    if(data.type === ''){
        msg  = '저작권 구분을 선택하세요.';
        return {states : states, msg : msg};
    }
    if(data.name === ''){
        msg  = '계약명을 입력하세요.';
        return {states : states, msg : msg};
    }

    //세부 계약의 기본 정보
    if(idx === undefined || idx === null || idx === ''){
        msg  = '저작권자를 선택하세요.';
        return {states : states, msg : msg};
    }
    if(data.copyrights.length < 1 || data.copyrights===undefined){
        msg  = '저작권자 정보를 입력하세요.';
        return {states : states, msg : msg};
    }

    // var sel = data.copyrights['idx_'+idx];
    var sel = data.copyrights[idx];
    if(sel['targets'].length < 1){
        msg  = '저작권 대상을 하나 이상 선택하세요.';
        return {states : states, msg : msg};
    }
    if(sel['ranges'].length < 1){
        msg  = '계약 범위를 하나 이상 선택하세요.';
        return {states : states, msg : msg};
    }
    if(sel.contract_transfer === ''){
        msg  = '저작권 양도 계약을 설정하세요.';
        return {states : states, msg : msg};
    }
    if(sel.copyright_fee_lump_sum === ''){
        msg  = '저작권료 일괄 지급(매절) 여부를 선택하세요.';
        return {states : states, msg : msg};
    }

    if(sel.copyright_fee_lump_sum!=='Y'){
        var loopchk = false;
        //종이책
        if(sel.ranges.includes('book')){
            var books = sel.books;
            if(Object.keys(books).length < 1){
                msg  = '종이책 정보를 입력하세요.';
                return {states : states, msg : msg};
            }
            if(books.start_date === '' || books.end_date === '' || books.extension_year === ''){
                msg  = '종이책 계약 기간을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(books.royalty_term_type === '' ){
                msg  = '저작권료 지급 기간을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(books.prepaid_royalty === '' ){
                msg  = '선불 저작권료(계약금)을 입력하세요.';
                return {states : states, msg : msg};
            }else if(books.prepaid_royalty != 0 && books.prepaid_royalty_date=== '' ){
                msg  = '선불 저작권료(계약금) 지급일을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(books.first_royalty_yn === '' ){
                msg  = '초판 저작권료를 선택하세요.';
                return {states : states, msg : msg};
            }
            if(books.first_royalty_yn =='Y' && books.exemption_royalty_qty === '' ){
                msg  = '저작권료 면제 부수를 입력하세요.';
                return {states : states, msg : msg};
            }
            if(books.special_royalty1 === '' || books.special_royalty2 === ''){
                msg  = '특판 저작권료를 입력하세요.';
                return {states : states, msg : msg};
            }else if(books.special_royalty1 === 0 || books.special_royalty2 === 0){
                if(books.special_royalty1 != books.special_royalty2){
                    msg  = '특판 저작권료의 계약 내용이 없을 경우 모두 0으로 입력하세요.';
                    return {states : states, msg : msg};
                }
            }
            if(books.fixed_royalties[books.fixed_royalties.length-1].end_yn != 'Y'){
                msg  = '정기 저작권료의 끝까지 항목을 체크해주세요.';
                return {states : states, msg : msg};
            }
            books.fixed_royalties.forEach((item) => {
                if(item.qty ==='' && item.end_yn != 'Y'){
                    msg  = '정기 저작권료를 공란없이 입력해주세요.';
                    loopchk = true;
                }
                if(item.percent === ''){
                    msg  = '정기 저작권료를 공란없이 입력해주세요.';
                    loopchk = true;
                }
            });
            if(loopchk){
                return {states : states, msg : msg};
            }
            books.fixed_royalties.forEach((item,index) => {
                if(index==0){
                    if(item.end_yn !='Y'){
                        if(isNaN(item.qty) || item.qty <= 1){
                            msg  = '유효한 부수 범위를 입력해주세요.';
                            loopchk = true;
                        }
                    }
                }else{
                    if(item.end_yn !='Y'){
                        if(isNaN(item.qty) || Number(item.qty) <= Number(books.fixed_royalties[index-1]['qty'])+1){
                            msg  = '유효한 부수 범위를 입력해주세요.';
                            loopchk = true;
                        }
                    }
                }
            });
            if(loopchk){
                return {states : states, msg : msg};
            }
            //종이책 - 중개 계약 정보
            if(books.brokers.length>0){
                books.brokers.forEach(item=>{
                    if(item.broker_id!=''){
                        if(item.current_unit === '' ){
                            msg  = '종이책 - 중개 계약 통화 단위를 선택하세요.';
                            loopchk = true;
                        }
                        if(item.settlement_cycle === '' ){
                            msg  = '종이책 - 중개 계약 정산 보고 주기를 선택하세요.';
                            loopchk = true;
                        }
                        // if(item.payment_scope1 === '' ){
                        //     msg  = '종이책 - 중개 계약 지급 범위를 선택하세요.';
                        //     loopchk = true;
                        // }else if(item.payment_scope1 != 'A'){
                        //     if(item.payment_scope2 === ''){
                        //         msg  = '종이책 - 중개 계약 지급 범위 수수료를 입력하세요.';
                        //         loopchk = true;
                        //     }
                        // }
                    }else {
                        msg  = '종이책 - 유효하지 않은 중개자가 있습니다.';
                        loopchk = true;
                    }
                });
            }
            if(loopchk){
                return {states : states, msg : msg};
            }
        }

        //전자책
        if(sel.ranges.includes('ebook')){
            var ebooks = sel.ebooks;
            if(Object.keys(ebooks).length < 1){
                msg  = '전자책 정보를 입력하세요.';
                return {states : states, msg : msg};
            }
            if(ebooks.start_date === '' || ebooks.end_date === '' || ebooks.extension_year === ''){
                msg  = '전자책 계약 기간을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(ebooks.royalty_term_type === '' ){
                msg  = '저작권료 지급 기간을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(ebooks.prepaid_royalty === '' ){
                msg  = '선불 저작권료(계약금)을 입력하세요.';
                return {states : states, msg : msg};
            }else if(ebooks.prepaid_royalty != 0 && ebooks.prepaid_royalty_date=== '' ){
                msg  = '선불 저작권료(계약금) 지급일을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(ebooks.fixed_royalty === ''){
                msg  = '정기 저작권료를 입력하세요.';
                return {states : states, msg : msg};
            }
            if(ebooks.rental_type === ''){
                msg  = '대여/구독 가능 여부를 선택하세요.';
                return {states : states, msg : msg};
            }
            //전자책 - 중개 계약 정보
            if(ebooks.brokers.length>0){
                ebooks.brokers.forEach(item=>{
                    if(item.broker_id!=''){
                        if(item.current_unit === '' ){
                            msg  = '전자책 - 중개 계약 통화 단위를 선택하세요.';
                            loopchk = true;
                        }
                        if(item.settlement_cycle === '' ){
                            msg  = '전자책 - 중개 계약 정산 보고 주기를 선택하세요.';
                            loopchk = true;
                        }
                        // if(item.payment_scope1 === '' ){
                        //     msg  = '전자책 - 중개 계약 지급 범위를 선택하세요.';
                        //     loopchk = true;
                        // }else if(item.payment_scope1 != 'A'){
                        //     if(item.payment_scope2 === ''){
                        //         msg  = '전자책 - 중개 계약 지급 범위 수수료를 입력하세요.';
                        //         loopchk = true;
                        //     }
                        // }
                    }
                });
            }
            if(loopchk){
                return {states : states, msg : msg};
            }
        }

        //오디오북
        if(sel.ranges.includes('audio')){
            var audios = sel.audios;
            if(Object.keys(audios).length < 1){
                msg  = '오디오북 정보를 입력하세요.';
                return {states : states, msg : msg};
            }
            if(audios.start_date === '' || audios.end_date === '' || audios.extension_year === ''){
                msg  = '오디오북 계약 기간을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(audios.royalty_term_type === '' ){
                msg  = '저작권료 지급 기간을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(audios.prepaid_royalty === '' ){
                msg  = '선불 저작권료(계약금)을 입력하세요.';
                return {states : states, msg : msg};
            }else if(audios.prepaid_royalty != 0 && audios.prepaid_royalty_date=== '' ){
                msg  = '선불 저작권료(계약금) 지급일을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(audios.fixed_royalty1 === '' || audios.fixed_royalty2 === ''){
                msg  = '정기 저작권료를 입력하세요.';
                return {states : states, msg : msg};
            }
            if(audios.rental_type === ''){
                msg  = '대여/구독 가능 여부를 선택하세요.';
                return {states : states, msg : msg};
            }
            //오디오북 - 중개 계약 정보
            if(audios.brokers.length>0){
                audios.brokers.forEach(item=>{
                    if(item.broker_id!=''){
                        if(item.current_unit === '' ){
                            msg  = '오디오북 - 중개 계약 통화 단위를 선택하세요.';
                            loopchk = true;
                        }
                        if(item.settlement_cycle === '' ){
                            msg  = '오디오북 - 중개 계약 정산 보고 주기를 선택하세요.';
                            loopchk = true;
                        }
                        // if(item.payment_scope1 === '' ){
                        //     msg  = '오디오북 - 중개 계약 지급 범위를 선택하세요.';
                        //     loopchk = true;
                        // }else if(item.payment_scope1 != 'A'){
                        //     if(item.payment_scope2 === ''){
                        //         msg  = '오디오북 - 중개 계약 지급 범위 수수료를 입력하세요.';
                        //         loopchk = true;
                        //     }
                        // }
                    }else {
                        msg  = '오디오북 - 유효하지 않은 중개자가 있습니다.';
                        loopchk = true;
                    }
                });
            }
            if(loopchk){
                return {states : states, msg : msg};
            }
        }

        //2차 저작권
        if(sel.ranges.includes('other')){
            var others = sel.others;
            if(Object.keys(others).length < 1){
                msg  = '2차 저작권 정보를 입력하세요.';
                return {states : states, msg : msg};
            }
            if(others.start_date === '' || others.end_date === '' || others.extension_year === ''){
                msg  = '2차 저작권 계약 기간을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(others.royalty_term_type === '' ){
                msg  = '저작권료 지급 기간을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(others.deduction_rate === '' || others.payment_rate === '' ){
                msg  = '제 3자 저작권료을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(others.company_use_yn === '' ){
                msg  = '본사 저작권료를 입력하세요.';
                return {states : states, msg : msg};
            }else if(others.company_use_yn === 'Y'){
                if(others.company_use_rate===''){
                    msg  = '본사 저작권료를 입력하세요.';
                return {states : states, msg : msg};
                }
            }
        }

        //수출 저작권
        if(sel.ranges.includes('export')){
            var exports = sel.exports;
            if(Object.keys(exports).length < 1){
                msg  = '수출 저작권 정보를 입력하세요.';
                return {states : states, msg : msg};
            }
            if(exports.start_date === '' || exports.end_date === '' || exports.extension_year === ''){
                msg  = '2차 저작권 계약 기간을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(exports.royalty_term_type === '' ){
                msg  = '저작권료 지급 기간을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(exports.deduction_rate === '' || exports.payment_rate === '' ){
                msg  = '저작권료을 입력하세요.';
                return {states : states, msg : msg};
            }
        }
    }

    //매절
    if(sel.copyright_fee_lump_sum === 'Y'){
        if(sel.total_amount === '' ){
            msg  = '전체 금액을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(sel.payment === '' ){
            msg  = '매절 계약금을 입력하세요.';
            return {states : states, msg : msg};
        }else if(sel.payment != 0 && sel.payment_date === '' ){
            msg  = '매절 계약금 지급 기한을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(sel.payment_timing_type === '' ){
            msg  = '전체 금액 지급 시기를 선택해주세요.';
            return {states : states, msg : msg};
        }else if(sel.payment_timing_type === '1' || sel.payment_timing_type === '2' || sel.payment_timing_type === '3'){
            if(sel.payment_timing_content ===''){
                msg  = '전체 금액 지급 시기를 선택해주세요.';
                return {states : states, msg : msg};
            }
        }
    }

    //계약서 파일과 참고사항
    if(sel?.contract_files === undefined){
        msg  = '계약서 파일을 업로드 해주세요.';
        return {states : states, msg : msg};
    }
    if(Object.keys(toJS(sel?.contract_files)).length < 1){
        msg  = '계약서 파일을 업로드 해주세요.';
        return {states : states, msg : msg};
    }

    states = true;
    return {states : states, msg : msg};
}


export function AddOverseasValidation (data,idx, file) {
    var msg = '';
    var states = false;

    //공통 정보
    if(data.company === ''){
        msg  = '계약 회사를 선택하세요.';
        return {states : states, msg : msg};
    }
    if(data.type === ''){
        msg  = '저작권 구분을 선택하세요.';
        return {states : states, msg : msg};
    }
    if(data.name === ''){
        msg  = '계약명을 입력하세요.';
        return {states : states, msg : msg};
    }
    if(data.product_name === ''){
        msg  = '상품명(원어 표기)를 입력하세요.';
        return {states : states, msg : msg};
    }
    if(data.product_eng_name === ''){
        msg  = '상품명(영어 표기)를 입력하세요.';
        return {states : states, msg : msg};
    }
    if(data.author_name === ''){
        msg  = '저자/소유자(영어 표기)를 입력하세요.';
        return {states : states, msg : msg};
    }if(data.producer === ''){
        msg  = '출판사/생산자를 입력하세요.';
        return {states : states, msg : msg};
    }
    if(data.isbn === ''){
        msg  = 'ISBN/코드를 입력하세요.';
        return {states : states, msg : msg};
    }

    //세부 계약의 기본 정보
    if(idx === undefined || idx === null || idx === ''){
        msg  = '권리자를 선택하세요.';
        return {states : states, msg : msg};
    }
    if(data.owners.length < 1 || data.owners===undefined){
        msg  = '권리자 정보를 입력하세요.';
        return {states : states, msg : msg};
    }
    var sel = data.owners[idx];
    if(sel['targets'].length < 1){
        msg  = '저작권 대상을 하나 이상 선택하세요.';
        return {states : states, msg : msg};
    }
    if(sel['ranges'].length < 1){
        msg  = '계약 범위를 하나 이상 선택하세요.';
        return {states : states, msg : msg};
    }

    var loopchk = false;
    //종이책
    if(sel.ranges.includes('book')){
        var books = sel.books;
        if(Object.keys(books).length < 1){
            msg  = '종이책 정보를 입력하세요.';
            return {states : states, msg : msg};
        }
        if(books.start_date === '' || books.end_date === '' ){
            msg  = '종이책 계약 기간을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(books.sale_date === '' ){
            msg  = '판매 기한을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(books.prepaid_royalty === '' ){
            msg  = '선불 저작권료(계약금)을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(books.royalty_unit === '' ){
            msg  = '저작권료 정산 단위를 입력하세요.';
            return {states : states, msg : msg};
        }
        if(books.fixed_royalties[books.fixed_royalties.length-1].end_yn != 'Y'){
            msg  = '정기 저작권료의 끝까지 항목을 체크해주세요.';
            return {states : states, msg : msg};
        }
        books.fixed_royalties.forEach((item) => {
            if(item.qty ==='' && item.end_yn != 'Y'){
                msg  = '정기 저작권료를 공란없이 입력해주세요.';
                loopchk = true;
            }
            if(item.percent === ''){
                msg  = '정기 저작권료를 공란없이 입력해주세요.';
                loopchk = true;
            }
        });
        if(loopchk){
            return {states : states, msg : msg};
        }
        books.fixed_royalties.forEach((item,index) => {
            if(index==0){
                if(item.end_yn !='Y'){
                    if(isNaN(item.qty) || item.qty <= 1){
                        msg  = '유효한 부수 범위를 입력해주세요.';
                        loopchk = true;
                    }
                }
            }else{
                if(item.end_yn !='Y'){
                    if(isNaN(item.qty) || Number(item.qty) <= Number(books.fixed_royalties[index-1]['qty'])+1){
                        msg  = '유효한 부수 범위를 입력해주세요.';
                        loopchk = true;
                    }
                }
            }
        });
        if(loopchk){
            return {states : states, msg : msg};
        }
        if(books.address === ''){
            msg  = '증정본 발송 주소를 입력하세요.';
            return {states : states, msg : msg};
        }
        //종이책 - 중개 계약 정보
        if(books.brokers.length>0){
            books.brokers.forEach(item=>{
                if(item.broker_id!=''){
                    if(item.current_unit === '' ){
                        msg  = '종이책 - 중개 계약 통화 단위를 선택하세요.';
                        loopchk = true;
                    }
                    if(item.settlement_cycle === '' ){
                        msg  = '종이책 - 중개 계약 정산 보고 주기를 선택하세요.';
                        loopchk = true;
                    }
                    // if(item.payment_scope1 === '' ){
                    //     msg  = '종이책 - 중개 계약 지급 범위를 선택하세요.';
                    //     loopchk = true;
                    // }else if(item.payment_scope1 != 'A'){
                    //     if(item.payment_scope2 === ''){
                    //         msg  = '종이책 - 중개 계약 지급 범위 수수료를 입력하세요.';
                    //         loopchk = true;
                    //     }
                    // }
                }else {
                    msg  = '종이책 - 유효하지 않은 중개자가 있습니다.';
                    loopchk = true;
                }
            });
        }else{
            msg  = '종이책 - 중개 계약자를 등록해 주세요.';
            loopchk = true;
        }
        if(loopchk){
            return {states : states, msg : msg};
        }
    }

    //전자책
    if(sel.ranges.includes('ebook')){
        var ebooks = sel.ebooks;
        if(Object.keys(ebooks).length < 1){
            msg  = '전자책 정보를 입력하세요.';
            return {states : states, msg : msg};
        }
        if(ebooks.start_date === '' || ebooks.end_date === ''){
            msg  = '전자책 계약 기간을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(ebooks.sale_date === '' ){
            msg  = '판매 기한을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(ebooks.prepaid_royalty === '' ){
            msg  = '선불 저작권료(계약금)을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(ebooks.fixed_royalty === ''){
            msg  = '정기 저작권료를 입력하세요.';
            return {states : states, msg : msg};
        }
        if(ebooks.rental_type === ''){
            msg  = '대여/구독 가능 여부를 선택하세요.';
            return {states : states, msg : msg};
        }
        //전자책 - 중개 계약 정보
        if(ebooks.brokers.length>0){
            ebooks.brokers.forEach(item=>{
                if(item.broker_id!=''){
                    if(item.current_unit === '' ){
                        msg  = '전자책 - 중개 계약 통화 단위를 선택하세요.';
                        loopchk = true;
                    }
                    if(item.settlement_cycle === '' ){
                        msg  = '전자책 - 중개 계약 정산 보고 주기를 선택하세요.';
                        loopchk = true;
                    }
                    // if(item.payment_scope1 === '' ){
                    //     msg  = '전자책 - 중개 계약 지급 범위를 선택하세요.';
                    //     loopchk = true;
                    // }else if(item.payment_scope1 != 'A'){
                    //     if(item.payment_scope2 === ''){
                    //         msg  = '전자책 - 중개 계약 지급 범위 수수료를 입력하세요.';
                    //         loopchk = true;
                    //     }
                    // }
                }
            });
        }else{
            msg  = '전자책 - 중개 계약자를 등록해 주세요.';
            loopchk = true;
        }
        if(loopchk){
            return {states : states, msg : msg};
        }
    }

    //오디오북
    if(sel.ranges.includes('audio')){
        var audios = sel.audios;
        if(Object.keys(audios).length < 1){
            msg  = '오디오북 정보를 입력하세요.';
            return {states : states, msg : msg};
        }
        if(audios.start_date === '' || audios.end_date === ''){
            msg  = '오디오북 계약 기간을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(audios.sale_date === '' ){
            msg  = '판매기한을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(audios.prepaid_royalty === '' ){
            msg  = '선불 저작권료(계약금)을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(audios.fixed_royalty === ''){
            msg  = '정기 저작권료를 입력하세요.';
            return {states : states, msg : msg};
        }
        if(audios.rental_type === ''){
            msg  = '대여/구독 가능 여부를 선택하세요.';
            return {states : states, msg : msg};
        }
        //오디오북 - 중개 계약 정보
        if(audios.brokers.length>0){
            audios.brokers.forEach(item=>{
                if(item.broker_id!=''){
                    if(item.current_unit === '' ){
                        msg  = '오디오북 - 중개 계약 통화 단위를 선택하세요.';
                        loopchk = true;
                    }
                    if(item.settlement_cycle === '' ){
                        msg  = '오디오북 - 중개 계약 정산 보고 주기를 선택하세요.';
                        loopchk = true;
                    }
                    // if(item.payment_scope1 === '' ){
                    //     msg  = '오디오북 - 중개 계약 지급 범위를 선택하세요.';
                    //     loopchk = true;
                    // }else if(item.payment_scope1 != 'A'){
                    //     if(item.payment_scope2 === ''){
                    //         msg  = '오디오북 - 중개 계약 지급 범위 수수료를 입력하세요.';
                    //         loopchk = true;
                    //     }
                    // }
                }else {
                    msg  = '오디오북 - 유효하지 않은 중개자가 있습니다.';
                    loopchk = true;
                }
            });
        }else{
            msg  = '오디오북 - 중개 계약자를 등록해 주세요.';
            loopchk = true;
        }
        if(loopchk){
            return {states : states, msg : msg};
        }
    }

    //계약서 파일과 참고사항
    if(sel?.contract_files === undefined ){
        msg  = '계약서 파일을 업로드 해주세요.';
        return {states : states, msg : msg};
    }
    if(Object.keys(toJS(sel?.contract_files)).length < 1){
        msg  = '계약서 파일을 업로드 해주세요.';
        return {states : states, msg : msg};
    }

    states = true;
    return {states : states, msg : msg};
}

export function ModValidation (data,idx, file) {
    var msg = '';
    var states = false;

    //공통 정보
    if(data.company === ''){
        msg  = '계약 회사를 선택하세요.';
        return {states : states, msg : msg};
    }
    if(data.type === ''){
        msg  = '저작권 구분을 선택하세요.';
        return {states : states, msg : msg};
    }
    if(data.name === ''){
        msg  = '계약명을 입력하세요.';
        return {states : states, msg : msg};
    }

    //세부 계약의 기본 정보
    if(idx === undefined || idx === null || idx === ''){
        msg  = '저작권자를 선택하세요.';
        return {states : states, msg : msg};
    }
    if(data.copyrights.length < 1 || data.copyrights===undefined){
        msg  = '저작권자 정보를 입력하세요.';
        return {states : states, msg : msg};
    }

    // var sel = data.copyrights['idx_'+idx];
    var sel = data.copyrights[idx];
    if(sel['targets'].length < 1){
        msg  = '저작권 대상을 하나 이상 선택하세요.';
        return {states : states, msg : msg};
    }
    if(sel['ranges'].length < 1){
        msg  = '계약 범위를 하나 이상 선택하세요.';
        return {states : states, msg : msg};
    }
    if(sel.contract_transfer === ''){
        msg  = '저작권 양도 계약을 설정하세요.';
        return {states : states, msg : msg};
    }
    if(sel.copyright_fee_lump_sum === ''){
        msg  = '저작권료 일괄 지급(매절) 여부를 선택하세요.';
        return {states : states, msg : msg};
    }

    if(sel.copyright_fee_lump_sum!=='Y'){
        var loopchk = false;
        //종이책
        if(sel.ranges.includes('book')){
            var books = sel.books;
            if(Object.keys(books).length < 1){
                msg  = '종이책 정보를 입력하세요.';
                return {states : states, msg : msg};
            }
            if(books.start_date === '' || books.end_date === '' || books.extension_year === ''){
                msg  = '종이책 계약 기간을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(books.royalty_term_type === '' ){
                msg  = '저작권료 지급 기간을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(books.prepaid_royalty === '' ){
                msg  = '선불 저작권료(계약금)을 입력하세요.';
                return {states : states, msg : msg};
            }else if(books.prepaid_royalty != 0 && books.prepaid_royalty_date=== '' ){
                msg  = '선불 저작권료(계약금) 지급일을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(books.first_royalty_yn === '' ){
                msg  = '초판 저작권료를 선택하세요.';
                return {states : states, msg : msg};
            }
            if(books.first_royalty_yn =='Y' && books.exemption_royalty_qty === '' ){
                msg  = '저작권료 면제 부수를 입력하세요.';
                return {states : states, msg : msg};
            }
            if(books.special_royalty1 === '' || books.special_royalty2 === ''){
                msg  = '특판 저작권료를 입력하세요.';
                return {states : states, msg : msg};
            }else if(books.special_royalty1 === 0 || books.special_royalty2 === 0){
                if(books.special_royalty1 != books.special_royalty2){
                    msg  = '특판 저작권료의 계약 내용이 없을 경우 모두 0으로 입력하세요.';
                    return {states : states, msg : msg};
                }
            }
            if(books.fixed_royalties[books.fixed_royalties.length-1].end_yn != 'Y'){
                msg  = '정기 저작권료의 끝까지 항목을 체크해주세요.';
                return {states : states, msg : msg};
            }
            books.fixed_royalties.forEach((item) => {
                if(item.qty ==='' && item.end_yn != 'Y'){
                    msg  = '정기 저작권료를 공란없이 입력해주세요.';
                    loopchk = true;
                }
                if(item.percent === ''){
                    msg  = '정기 저작권료를 공란없이 입력해주세요.';
                    loopchk = true;
                }
            });
            if(loopchk){
                return {states : states, msg : msg};
            }
            books.fixed_royalties.forEach((item,index) => {
                if(index==0){
                    if(item.end_yn !='Y'){
                        if(isNaN(item.qty) || item.qty <= 1){
                            msg  = '유효한 부수 범위를 입력해주세요.';
                            loopchk = true;
                        }
                    }
                }else{
                    if(item.end_yn !='Y'){
                        if(isNaN(item.qty) || Number(item.qty) <= Number(books.fixed_royalties[index-1]['qty'])+1){
                            msg  = '유효한 부수 범위를 입력해주세요.';
                            loopchk = true;
                        }
                    }
                }
            });
            if(loopchk){
                return {states : states, msg : msg};
            }
            //종이책 - 중개 계약 정보
            if(books.brokers.length>0){
                books.brokers.forEach(item=>{
                    if(item.broker_id!=''){
                        if(item.current_unit === '' ){
                            msg  = '종이책 - 중개 계약 통화 단위를 선택하세요.';
                            loopchk = true;
                        }
                        if(item.settlement_cycle === '' ){
                            msg  = '종이책 - 중개 계약 정산 보고 주기를 선택하세요.';
                            loopchk = true;
                        }
                        // if(item.payment_scope1 === '' ){
                        //     msg  = '종이책 - 중개 계약 지급 범위를 선택하세요.';
                        //     loopchk = true;
                        // }else if(item.payment_scope1 != 'A'){
                        //     if(item.payment_scope2 === ''){
                        //         msg  = '종이책 - 중개 계약 지급 범위 수수료를 입력하세요.';
                        //         loopchk = true;
                        //     }
                        // }
                    }else {
                        msg  = '종이책 - 유효하지 않은 중개자가 있습니다.';
                        loopchk = true;
                    }
                });
            }
            if(loopchk){
                return {states : states, msg : msg};
            }
        }

        //전자책
        if(sel.ranges.includes('ebook')){
            var ebooks = sel.ebooks;
            if(Object.keys(ebooks).length < 1){
                msg  = '전자책 정보를 입력하세요.';
                return {states : states, msg : msg};
            }
            if(ebooks.start_date === '' || ebooks.end_date === '' || ebooks.extension_year === ''){
                msg  = '전자책 계약 기간을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(ebooks.royalty_term_type === '' ){
                msg  = '저작권료 지급 기간을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(ebooks.prepaid_royalty === '' ){
                msg  = '선불 저작권료(계약금)을 입력하세요.';
                return {states : states, msg : msg};
            }else if(ebooks.prepaid_royalty != 0 && ebooks.prepaid_royalty_date=== '' ){
                msg  = '선불 저작권료(계약금) 지급일을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(ebooks.fixed_royalty === ''){
                msg  = '정기 저작권료를 입력하세요.';
                return {states : states, msg : msg};
            }
            if(ebooks.rental_type === ''){
                msg  = '대여/구독 가능 여부를 선택하세요.';
                return {states : states, msg : msg};
            }
            //전자책 - 중개 계약 정보
            if(ebooks.brokers.length>0){
                ebooks.brokers.forEach(item=>{
                    if(item.broker_id!=''){
                        if(item.current_unit === '' ){
                            msg  = '전자책 - 중개 계약 통화 단위를 선택하세요.';
                            loopchk = true;
                        }
                        if(item.settlement_cycle === '' ){
                            msg  = '전자책 - 중개 계약 정산 보고 주기를 선택하세요.';
                            loopchk = true;
                        }
                        // if(item.payment_scope1 === '' ){
                        //     msg  = '전자책 - 중개 계약 지급 범위를 선택하세요.';
                        //     loopchk = true;
                        // }else if(item.payment_scope1 != 'A'){
                        //     if(item.payment_scope2 === ''){
                        //         msg  = '전자책 - 중개 계약 지급 범위 수수료를 입력하세요.';
                        //         loopchk = true;
                        //     }
                        // }
                    }
                });
            }
            if(loopchk){
                return {states : states, msg : msg};
            }
        }

        //오디오북
        if(sel.ranges.includes('audio')){
            var audios = sel.audios;
            if(Object.keys(audios).length < 1){
                msg  = '오디오북 정보를 입력하세요.';
                return {states : states, msg : msg};
            }
            if(audios.start_date === '' || audios.end_date === '' || audios.extension_year === ''){
                msg  = '오디오북 계약 기간을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(audios.royalty_term_type === '' ){
                msg  = '저작권료 지급 기간을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(audios.prepaid_royalty === '' ){
                msg  = '선불 저작권료(계약금)을 입력하세요.';
                return {states : states, msg : msg};
            }else if(audios.prepaid_royalty != 0 && audios.prepaid_royalty_date=== '' ){
                msg  = '선불 저작권료(계약금) 지급일을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(audios.fixed_royalty1 === '' || audios.fixed_royalty2 === ''){
                msg  = '정기 저작권료를 입력하세요.';
                return {states : states, msg : msg};
            }
            if(audios.rental_type === ''){
                msg  = '대여/구독 가능 여부를 선택하세요.';
                return {states : states, msg : msg};
            }
            //오디오북 - 중개 계약 정보
            if(audios.brokers.length>0){
                audios.brokers.forEach(item=>{
                    if(item.broker_id!=''){
                        if(item.current_unit === '' ){
                            msg  = '오디오북 - 중개 계약 통화 단위를 선택하세요.';
                            loopchk = true;
                        }
                        if(item.settlement_cycle === '' ){
                            msg  = '오디오북 - 중개 계약 정산 보고 주기를 선택하세요.';
                            loopchk = true;
                        }
                        // if(item.payment_scope1 === '' ){
                        //     msg  = '오디오북 - 중개 계약 지급 범위를 선택하세요.';
                        //     loopchk = true;
                        // }else if(item.payment_scope1 != 'A'){
                        //     if(item.payment_scope2 === ''){
                        //         msg  = '오디오북 - 중개 계약 지급 범위 수수료를 입력하세요.';
                        //         loopchk = true;
                        //     }
                        // }
                    }else {
                        msg  = '오디오북 - 유효하지 않은 중개자가 있습니다.';
                        loopchk = true;
                    }
                });
            }
            if(loopchk){
                return {states : states, msg : msg};
            }
        }

        //2차 저작권
        if(sel.ranges.includes('other')){
            var others = sel.others;
            if(Object.keys(others).length < 1){
                msg  = '2차 저작권 정보를 입력하세요.';
                return {states : states, msg : msg};
            }
            if(others.start_date === '' || others.end_date === '' || others.extension_year === ''){
                msg  = '2차 저작권 계약 기간을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(others.royalty_term_type === '' ){
                msg  = '저작권료 지급 기간을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(others.deduction_rate === '' || others.payment_rate === '' ){
                msg  = '제 3자 저작권료을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(others.company_use_yn === '' ){
                msg  = '본사 저작권료를 입력하세요.';
                return {states : states, msg : msg};
            }else if(others.company_use_yn === 'Y'){
                if(others.company_use_rate===''){
                    msg  = '본사 저작권료를 입력하세요.';
                return {states : states, msg : msg};
                }
            }
        }

        //수출 저작권
        if(sel.ranges.includes('export')){
            var exports = sel.exports;
            if(Object.keys(exports).length < 1){
                msg  = '수출 저작권 정보를 입력하세요.';
                return {states : states, msg : msg};
            }
            if(exports.start_date === '' || exports.end_date === '' || exports.extension_year === ''){
                msg  = '2차 저작권 계약 기간을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(exports.royalty_term_type === '' ){
                msg  = '저작권료 지급 기간을 입력하세요.';
                return {states : states, msg : msg};
            }
            if(exports.deduction_rate === '' || exports.payment_rate === '' ){
                msg  = '저작권료을 입력하세요.';
                return {states : states, msg : msg};
            }
        }
    }

    //매절
    if(sel.copyright_fee_lump_sum === 'Y'){
        if(sel.total_amount === '' ){
            msg  = '전체 금액을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(sel.payment === '' ){
            msg  = '매절 계약금을 입력하세요.';
            return {states : states, msg : msg};
        }else if(sel.payment != 0 && sel.payment_date === '' ){
            msg  = '매절 계약금 지급 기한을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(sel.payment_timing_type === '' ){
            msg  = '전체 금액 지급 시기를 선택해주세요.';
            return {states : states, msg : msg};
        }else if(sel.payment_timing_type === '1' || sel.payment_timing_type === '2' || sel.payment_timing_type === '3'){
            if(sel.payment_timing_content ===''){
                msg  = '전체 금액 지급 시기를 선택해주세요.';
                return {states : states, msg : msg};
            }
        }
    }

    //계약서 파일과 참고사항
    if(sel?.contract_files === undefined){
        msg  = '계약서 파일을 업로드 해주세요.';
        return {states : states, msg : msg};
    }
    // if(Object.keys(toJS(sel?.contract_files)).length < 1){
    //     msg  = '계약서 파일을 업로드 해주세요.';
    //     return {states : states, msg : msg};
    // }
    var filechk = sel?.contract_files.filter(x => x.use_yn!='N');

    if(filechk.length < 1){
        msg  = '계약서 파일을 업로드 해주세요.';
        return {states : states, msg : msg};
    }
    
    states = true;
    return {states : states, msg : msg};
}


export function ModOverseasValidation (data,idx, file) {
    var msg = '';
    var states = false;

    //공통 정보
    if(data.company === ''){
        msg  = '계약 회사를 선택하세요.';
        return {states : states, msg : msg};
    }
    if(data.type === ''){
        msg  = '저작권 구분을 선택하세요.';
        return {states : states, msg : msg};
    }
    if(data.name === ''){
        msg  = '계약명을 입력하세요.';
        return {states : states, msg : msg};
    }
    if(data.product_name === ''){
        msg  = '상품명(원어 표기)를 입력하세요.';
        return {states : states, msg : msg};
    }
    if(data.product_eng_name === ''){
        msg  = '상품명(영어 표기)를 입력하세요.';
        return {states : states, msg : msg};
    }
    if(data.author_name === ''){
        msg  = '저자/소유자(영어 표기)를 입력하세요.';
        return {states : states, msg : msg};
    }
    if(data.producer === ''){
        msg  = '출판사/생산자를 입력하세요.';
        return {states : states, msg : msg};
    }
    if(data.isbn === ''){
        msg  = 'ISBN/코드를 입력하세요.';
        return {states : states, msg : msg};
    }

    //세부 계약의 기본 정보
    if(idx === undefined || idx === null || idx === ''){
        msg  = '권리자를 선택하세요.';
        return {states : states, msg : msg};
    }
    if(data.owners.length < 1 || data.owners===undefined){
        msg  = '권리자 정보를 입력하세요.';
        return {states : states, msg : msg};
    }
    var sel = data.owners[idx];
    if(sel['targets'].length < 1){
        msg  = '저작권 대상을 하나 이상 선택하세요.';
        return {states : states, msg : msg};
    }
    if(sel['ranges'].length < 1){
        msg  = '계약 범위를 하나 이상 선택하세요.';
        return {states : states, msg : msg};
    }
    var loopchk = false;
    //종이책
    if(sel.ranges.includes('book')){
        var books = sel.books;
        if(Object.keys(books).length < 1){
            msg  = '종이책 정보를 입력하세요.';
            return {states : states, msg : msg};
        }
        if(books.start_date === '' || books.end_date === '' ){
            msg  = '종이책 계약 기간을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(books.sale_date === '' ){
            msg  = '판매 기한을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(books.prepaid_royalty === '' ){
            msg  = '선불 저작권료(계약금)을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(books.royalty_unit === '' ){
            msg  = '저작권료 정산 단위를 입력하세요.';
            return {states : states, msg : msg};
        }
        if(books.fixed_royalties[books.fixed_royalties.length-1].end_yn != 'Y'){
            msg  = '정기 저작권료의 끝까지 항목을 체크해주세요.';
            return {states : states, msg : msg};
        }
        books.fixed_royalties.forEach((item) => {
            if(item.qty ==='' && item.end_yn != 'Y'){
                msg  = '정기 저작권료를 공란없이 입력해주세요.';
                loopchk = true;
            }
            if(item.percent === ''){
                msg  = '정기 저작권료를 공란없이 입력해주세요.';
                loopchk = true;
            }
        });
        if(loopchk){
            return {states : states, msg : msg};
        }
        books.fixed_royalties.forEach((item,index) => {
            if(index==0){
                if(item.end_yn !='Y'){
                    if(isNaN(item.qty) || item.qty <= 1){
                        msg  = '유효한 부수 범위를 입력해주세요.';
                        loopchk = true;
                    }
                }
            }else{
                if(item.end_yn !='Y'){
                    if(isNaN(item.qty) || Number(item.qty) <= Number(books.fixed_royalties[index-1]['qty'])+1){
                        msg  = '유효한 부수 범위를 입력해주세요.';
                        loopchk = true;
                    }
                }
            }
        });
        if(loopchk){
            return {states : states, msg : msg};
        }
        if(books.address === ''){
            msg  = '증정본 발송 주소를 입력하세요.';
            return {states : states, msg : msg};
        }
        //종이책 - 중개 계약 정보
        if(books.brokers.length>0){
            books.brokers.forEach(item=>{
                if(item.broker_id!=''){
                    if(item.current_unit === '' ){
                        msg  = '종이책 - 중개 계약 통화 단위를 선택하세요.';
                        loopchk = true;
                    }
                    if(item.settlement_cycle === '' ){
                        msg  = '종이책 - 중개 계약 정산 보고 주기를 선택하세요.';
                        loopchk = true;
                    }
                    // if(item.payment_scope1 === '' ){
                    //     msg  = '종이책 - 중개 계약 지급 범위를 선택하세요.';
                    //     loopchk = true;
                    // }else if(item.payment_scope1 != 'A'){
                    //     if(item.payment_scope2 === ''){
                    //         msg  = '종이책 - 중개 계약 지급 범위 수수료를 입력하세요.';
                    //         loopchk = true;
                    //     }
                    // }
                }else {
                    msg  = '종이책 - 유효하지 않은 중개자가 있습니다.';
                    loopchk = true;
                }
            });
        }else{
            msg  = '종이책 - 중개 계약자를 등록해 주세요.';
            loopchk = true;
        }
        if(loopchk){
            return {states : states, msg : msg};
        }
    }

    //전자책
    if(sel.ranges.includes('ebook')){
        var ebooks = sel.ebooks;
        if(Object.keys(ebooks).length < 1){
            msg  = '전자책 정보를 입력하세요.';
            return {states : states, msg : msg};
        }
        if(ebooks.start_date === '' || ebooks.end_date === ''){
            msg  = '전자책 계약 기간을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(ebooks.sale_date === '' ){
            msg  = '판매 기한을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(ebooks.prepaid_royalty === '' ){
            msg  = '선불 저작권료(계약금)을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(ebooks.fixed_royalty === ''){
            msg  = '정기 저작권료를 입력하세요.';
            return {states : states, msg : msg};
        }
        if(ebooks.rental_type === ''){
            msg  = '대여/구독 가능 여부를 선택하세요.';
            return {states : states, msg : msg};
        }
        //전자책 - 중개 계약 정보
        if(ebooks.brokers.length>0){
            ebooks.brokers.forEach(item=>{
                if(item.broker_id!=''){
                    if(item.current_unit === '' ){
                        msg  = '전자책 - 중개 계약 통화 단위를 선택하세요.';
                        loopchk = true;
                    }
                    if(item.settlement_cycle === '' ){
                        msg  = '전자책 - 중개 계약 정산 보고 주기를 선택하세요.';
                        loopchk = true;
                    }
                    // if(item.payment_scope1 === '' ){
                    //     msg  = '전자책 - 중개 계약 지급 범위를 선택하세요.';
                    //     loopchk = true;
                    // }else if(item.payment_scope1 != 'A'){
                    //     if(item.payment_scope2 === ''){
                    //         msg  = '전자책 - 중개 계약 지급 범위 수수료를 입력하세요.';
                    //         loopchk = true;
                    //     }
                    // }
                }
            });
        }else{
            msg  = '전자책 - 중개 계약자를 등록해 주세요.';
            loopchk = true;
        }
        if(loopchk){
            return {states : states, msg : msg};
        }
    }

    //오디오북
    if(sel.ranges.includes('audio')){
        var audios = sel.audios;
        if(Object.keys(audios).length < 1){
            msg  = '오디오북 정보를 입력하세요.';
            return {states : states, msg : msg};
        }
        if(audios.start_date === '' || audios.end_date === ''){
            msg  = '오디오북 계약 기간을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(audios.sale_date === '' ){
            msg  = '판매기한을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(audios.prepaid_royalty === '' ){
            msg  = '선불 저작권료(계약금)을 입력하세요.';
            return {states : states, msg : msg};
        }
        if(audios.fixed_royalty === ''){
            msg  = '정기 저작권료를 입력하세요.';
            return {states : states, msg : msg};
        }
        if(audios.rental_type === ''){
            msg  = '대여/구독 가능 여부를 선택하세요.';
            return {states : states, msg : msg};
        }
        //오디오북 - 중개 계약 정보
        if(audios.brokers.length>0){
            audios.brokers.forEach(item=>{
                if(item.broker_id!=''){
                    if(item.current_unit === '' ){
                        msg  = '오디오북 - 중개 계약 통화 단위를 선택하세요.';
                        loopchk = true;
                    }
                    if(item.settlement_cycle === '' ){
                        msg  = '오디오북 - 중개 계약 정산 보고 주기를 선택하세요.';
                        loopchk = true;
                    }
                    // if(item.payment_scope1 === '' ){
                    //     msg  = '오디오북 - 중개 계약 지급 범위를 선택하세요.';
                    //     loopchk = true;
                    // }else if(item.payment_scope1 != 'A'){
                    //     if(item.payment_scope2 === ''){
                    //         msg  = '오디오북 - 중개 계약 지급 범위 수수료를 입력하세요.';
                    //         loopchk = true;
                    //     }
                    // }
                }else {
                    msg  = '오디오북 - 유효하지 않은 중개자가 있습니다.';
                    loopchk = true;
                }
            });
        }else{
            msg  = '오디오북 - 중개 계약자를 등록해 주세요.';
            loopchk = true;
        }
        if(loopchk){
            return {states : states, msg : msg};
        }
    }

    //계약서 파일과 참고사항
    if(sel?.contract_files === undefined ){
        msg  = '계약서 파일을 업로드 해주세요.';
        return {states : states, msg : msg};
    }
    // if(Object.keys(toJS(sel?.contract_files)).length < 1){
    //     msg  = '계약서 파일을 업로드 해주세요.';
    //     return {states : states, msg : msg};
    // }
    var filechk = sel?.contract_files.filter(x => x.use_yn!='N');
    
    if(filechk.length < 1){
        msg  = '계약서 파일을 업로드 해주세요.';
        return {states : states, msg : msg};
    }

    states = true;
    return {states : states, msg : msg};
}