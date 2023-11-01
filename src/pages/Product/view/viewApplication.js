/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useEffect, useState } from 'react';
import { Row, Button, Modal } from 'antd';
import { toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import useStore from '@stores/useStore';

import { Form, Formik } from 'formik';
import { FormikContainer } from '@components/form/CustomInput'

const ApplicationDrawer = ( props ) => {
    const { commonStore } = useStore();
    const [formikFieldDefault, setFormikFieldDefault] = useState({
        product_name : null, //*상품명(원어 표기)
        product_eng_name : null, //*상품명(영어 표기)
        author_name : null, //*저자/소유자(영어 표기)
        producer : null, //*출판사/생산자
        isbn : null, //*원상품 isbn/코드
        etc_memo : null //*기타 참고사항
    });

    useEffect(() => { 
        if(props?.viewData?.contractable){
            const temp ={}
            Object.keys(formikFieldDefault).forEach(key=>{
                temp[key] = toJS(props.viewData.contractable[key])
            })
            setFormikFieldDefault(temp)
        }
    }, []);

    const handleSubmit = (data) =>{
        commonStore.handleApi({
            url: `/products/${props.viewData.id}/original-book`,
            method: 'PUT',
            data:data
        }).then((result)=>{
            Modal.success({
                content: '저장 되었습니다.',
                onOk() {

                },
            })
        })
    }

    return (
        <Formik
            enableReinitialize={true} 
            initialValues={formikFieldDefault}
            onSubmit = {handleSubmit}
        >
            {(props)=>(
                <Form >
                    <Row className="table search_table">
                        <FormikContainer type={'input'}     perRow={1} label={'상품명(원어)'}       name={'product_name'} />
                        <FormikContainer type={'input'}     perRow={1} label={'상품명(영어)'}       name={'product_eng_name'} />
                        <FormikContainer type={'input'}     perRow={1} label={'저자/소유자(영어)'}  name={'author_name'} />
                        <FormikContainer type={'input'}     perRow={1} label={'출판자/생산자'}      name={'producer'} />
                        <FormikContainer type={'input'}     perRow={1} label={'원상품 ISBN/코드'}   name={'isbn'} />
                        <FormikContainer type={'textarea'}  perRow={1} label={'기타 참고사항'}      name={'etc_memo'} />
                    </Row>
                    <Row justify='center' style={{margin: 30}}>
                        <Button type='primary submit' onClick={props.handleSubmit} >확인</Button>
                        <Button type='button' style={{marginLeft: 10}}>취소</Button>
                    </Row>
                </Form>
            )}
        </Formik>
    );
};

export default observer(ApplicationDrawer);