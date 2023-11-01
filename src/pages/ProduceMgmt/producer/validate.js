import { toJS } from 'mobx';

export function AddValidation (data,regChk) {
    var msg = '';
    var states = false;
    console.log('validate');
    //기본 정보
    if(data.name === ''){
        msg  = '사업자명을 입력하세요.';
        return {states : states, msg : msg};
    }
    if(data.company_no === ''){
        msg  = '사업자 등록 번호를 입력하세요.';
        return {states : states, msg : msg};
    }else{
        if(regChk!=='Y'){
            msg  = '국세청 확인을 해주세요.';
            return {states : states, msg : msg};
        }
    }
    if(data.taxation_type === ''){
        msg  = '과세 구분을 선택하세요.';
        return {states : states, msg : msg};
    }
    if(data['process'].length < 1){
        msg  = '담당 공정을 선택하세요.';
        return {states : states, msg : msg};
    }

    //계좌 정보
    if(data.bank_id === ''){
        msg  = '은행을 선택하세요.';
        return {states : states, msg : msg};
    }
    if(data.account_no === ''){
        msg  = '계좌번호를 입력하세요.';
        return {states : states, msg : msg};
    }
    if(data.depositor === ''){
        msg  = '예금주를 선택하세요.';
        return {states : states, msg : msg};
    }

    //담당자
    if(data['company_managers'].length < 1){
        msg  = '담당자 정보를 입력하세요.';
        return {states : states, msg : msg};
    }

    var loopchk = false;
    data.company_managers.forEach((item) => {
        if(item.name ==='' || item.department ==='' || item.company_phone ==='' || item.cellphone ==='' || item.email ===''){
            msg  = '담당자 정보를 공란없이 입력해주세요.';
            loopchk = true;
        }
    });

    if(loopchk){
        return {states : states, msg : msg};
    }

    states = true;
    return {states : states, msg : msg};
}

