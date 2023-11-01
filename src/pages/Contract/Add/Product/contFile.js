import React, { useState, useEffect } from 'react';
import { Row} from 'antd';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import { FormikContainer } from '@components/form/CustomInput';
import { Form, Formik } from 'formik';

const ContractFile = observer(({ data, filesVal}) => {
    const [formikFieldDefault, setFormikFieldDefault] = useState({
        contract_files : [], 
        etc_files : [], 
        contract_memo : '',
    })
    const state = useLocalStore(() => ({
        type: '',               //api 타입           
        dataInfo: '',           //저작권자 정보
        selType : '',           //저작권 구분
    }));

    useEffect(()=>{
        const initFile = {
            contract_files : toJS(data.contract_files),
            etc_files : toJS(data.etc_files),
            contract_memo : toJS(data.contract_memo)
        }
        setFormikFieldDefault(initFile)
    },[])

    const onSubmit = (formData) => {
        filesVal('files',formData)
    }

    return (
        <Formik
            enableReinitialize={true}
            initialValues={formikFieldDefault}
            onSubmit = {onSubmit}
        >
        {(props) => (
            <Form>
            <Row gutter={10} className="table marginUp">
                <div className="table_title">계약서 파일과 참고사항</div>
                <FormikContainer type={'file'}      perRow={1} label={'계약서'}        name={'contract_files'} onChange={(e)=>{props.handleSubmit()}} required/>
                <FormikContainer type={'file'}      perRow={1} label={'기타 참고 파일'} name={'etc_files'}      onChange={(e)=>{props.handleSubmit()}}/>
                <FormikContainer type={'textarea'}  perRow={1} label={'계약 참고사항'}  name={'contract_memo'}  onChange={(e)=>{props.handleSubmit()}}/>
            </Row>
            </Form>
        )}
        </Formik>
    );
})

export default ContractFile;

