import * as Yup from 'yup'

// src/index.js 에서 호출 중
// Yup default Error message Custom setting
export const validationSetting = () => {
    Yup.setLocale({
        mixed : {
            required : '${label}은(는) 필수 값입니다.', 
            notType: ({ path, type, value, originalValue }) => {
                if (type !== 'mixed') {
                    switch (type) {
                        case 'number':
                            return '숫자만 입력할 수 있습니다.';
                        case 'string':
                            return '글자만 입력할 수 있습니다.';
                        default:
                            break;
                    }
                }
                else {
                    return `${path} must match the configured type. The validated value was`
                }
            },
        },
        string : {
            min : '최소 ${min}자 이상이어야 합니다.',
            max : '최대 ${max}자까지 입력 가능합니다.',
            email : '잘못된 이메일 형식입니다.'
        }, 
        number : {
            min : '최소 ${min}자 이상이어야 합니다.',
            max : '최대 ${max}자까지 입력 가능합니다.'
        }, 
        array : {
            min : '최소 ${min}개 이상 선택해야 합니다.',
            max : '최대 ${max}개까지 선택 가능합니다.'
        }, 

        
    })

    // Yup.addMethod(Yup.string, 'numberWithBar', function (args) {
    //     console.log(args)
    //     return Yup.string().test({
            
    //         name: 'number-with-bar',
    //         params: { 
    //           reference: args.path
    //         },
    //         test(value) {
    //           const { path, createError, resolve } = this;
    
    //         //   if (someConditionFails) {
    //             return createError({ 
    //               path, 
    //               message: '${path} must be after ${reference}'
    //             });
    //         //   }
    
    //           return true;
    //         }
    //     }
            
    //         // 'number-with-bar', 
    //         // '숫자와 -만 입력할 수 있습니다.', 
    //         // (val) => {
                
    //         //     // const { path, createError } = this;
    //         //     // const { message } = args;

    //         //     console.log("return", val && val !== '' ? val.match(/\d|[-]/) : true)
                
    //         //     return val && val.match(/\d|[-]/)
    //         // }
    //     )
    // })

    
}