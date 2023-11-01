/* eslint-disable no-template-curly-in-string*/
export const validateMessages = {
  required: '${label} 항목은 필수 입력사항입니다.',
  types: {
    email: '${label} 항목이 이메일 양식이 아닙니다.',
    number: '${label} 항목은 숫자만 입력해 주세요.',
  },
  number: {
    range: '${min} ~ ${max} 사이의 숫자만 입력해 주세요.',
  },
  string: {
    len: '${label} must be exactly ${len} characters',
    min: '최소 ${min}자 이상 입력해 주세요.',
    max: '${min}자 까지만 입력해 주세요.',
    range: '${min} ~ ${max} 사이의 숫자만 입력해 주세요.',
  },
  array: {
    len: '${label} must be exactly ${len} in length',
    min: '최소 ${min}개 이상 선택해 주세요.',
    max: '${min}개 까지만 선택해 주세요.',
    range: '${min} ~ ${max} 사이의 숫자만 입력해 주세요.',
  },
  pattern: { mismatch: '${label} 항목을 정확하게 입력해 주세요.' },
};
