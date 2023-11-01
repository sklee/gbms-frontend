import React from 'react';
import {Form, Formik} from 'formik';
import * as Yup from 'yup';
import CustomInput from '../../components/form/CustomInput';
import {Button, FormGroup} from 'reactstrap';

const Login = ({submitCallback}) => {
    const initialValues = {
        email: '',
        password: '',
    };

    const validationSchema = Yup.object({
        email: Yup.string()
            .email('잘못된 이메일 주소입니다.')
            .min(6, '이메일은 6자 이상이어야 합니다.')
            .max(50, '이메일은 50자를 초과할 수 없습니다.')
            .required('이메일 주소는 필수 항목입니다.'),
        password: Yup.string()
            .min(8, '비밀번호는 8자 이상이어야 합니다.')
            .required('비밀번호를 선택해주세요.')
    });

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={submitCallback}>
            <Form>
                <FormGroup row>
                    <CustomInput
                        name={'email'}
                        label={'이메일 주소'}
                        type={'email'}
                    />
                </FormGroup>
                <FormGroup row>
                    <CustomInput
                        name={'password'}
                        label={'비밀번호'}
                        type={'password'}
                    />
                </FormGroup>
                <Button
                    block
                    type='submit'
                    color={'danger'}>
                    Submit
                </Button>
            </Form>
        </Formik>
    );
};
export default Login;
