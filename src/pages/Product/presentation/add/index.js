import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Drawer, Button, Modal } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { Form, Formik } from 'formik';
import { FormikContainer } from '@components/form/CustomInput'
import * as Yup from 'yup';
import { observer, useLocalStore } from 'mobx-react';

import ApprovalsList from '@pages/BillingApprovals/Billing/Add/approvalsList';
import tooltipData from '@pages/tooltipData';
import FileRegister from './fileRegister';
import ParcelGrid from './ParcelGrid';
import HqGrid from './hqGrid';

import useStore from '@stores/useStore';

const { confirm } = Modal;

const index = observer(({ drawerVisible, drawerClose, drawerChk, processingState}) =>{
    const { commonStore } = useStore();
    const [formikFieldDefault, setFormikFieldDefault] = useState({
        status :'',
        company:  '',
        register : 'direct',
        present_type : '',
        details : [],
        default_approval: false, 
        approvals : [],
    });
    const [defaultApproval, setDefaultApproval] = useState([])
    const [memberOption, setMemberOption] = useState([])
    const [tooltip, setTooltip] = useState([])
    const [companyList, setCompanyList] = useState([])

    const state = useLocalStore(() => ({
        drawerback : 'drawerWrap', //drawer class name
        tooltipData : [],
        defaultApproval : [],
        memberOption : [],
        company : [],
    }));

    useEffect(() => {
        if(tooltipData !== '' && tooltipData !== undefined){
            let data = []
            tooltipData.forEach((e,num) => {
                if(e.id === 'billingApprovals'){
                    data = [...data, (<div dangerouslySetInnerHTML={{__html: tooltipData[num].memo}}></div>)]
                }
            });
            setTooltip(data)
        }
        memberData()

        if(processingState){
            viewData(processingState.id)
            getProducts(processingState.company)
        }else{
            defaultapprovalApi(commonStore.user.id)
        }
    }, []);

    const viewData = useCallback((id) => {
        commonStore.handleApi({
            url : '/product-presentations/'+id,
        })
        .then((result) => {
            const approvalsMap = {}
            result.data.approvals.forEach(item=>{
                const {id,step,type,approval_user_id} = item
                const key = `${step}-${type}`
                if(!approvalsMap[key]){
                    approvalsMap[key] = {id:id,step:step,type:type,approval_user_id_list:[approval_user_id]}
                }else{
                    approvalsMap.approval_user_id_list.push(approval_user_id)
                }
            })
            setFormikFieldDefault({...result.data,register : 'direct',approvals:Object.values(approvalsMap)})
            setDefaultApproval({default_approval : result.data.default_approval, approvalsLogin: Object.values(approvalsMap)})
        })
    },[])

    const validationSchema = Yup.object().shape({
        company :      Yup.string().label("회사").required(),
        present_type:  Yup.string().label("입고처").required(),
        details:       Yup.array().min(1,'1개 이상 등록').required(),
        // approvals:      Yup.array().of(
            // Yup.object().shape({
                // step:                       Yup.string().required(),
                // type:                       Yup.string().required(),
                // approval_user_id_list:      Yup.array().min(1,'').required(),
            // })
        // ).min(1,'').required(),
    });

    //결재선 지정
    const approvalsDataReturn = (props) => (data)=>{
        props.setFieldValue('default_approval',data.default_approval)
        props.setFieldValue('approvals',data.approvals)
    };

    const defaultapprovalApi = useCallback(async (id) => {
        const result = await commonStore.handleApi({
            url: '/product-presentation-default-approvals/'+id,
        });

        if (result.success === false) {
            Modal.error({
                title: '오류가 발생했습니다.',
                content: '오류코드:' + result.message,
            });
        } else {
            //결재선 기본 저장값 같이 담아서 보내기          
            if(result.data !='' && result.data != undefined){
                setFormikFieldDefault({...formikFieldDefault,default_approval:true,approvals:result.data})
                setDefaultApproval({default_approval : true, approvalsLogin: result.data})
            }else{
                // stateData.default_approval = false;
            }
            return {default_approval : true, approvalsLogin: result.data}
        }
    }, []);

    const memberData = useCallback(async () => {
        //재직중인 사람만 불러오기
        const result = await commonStore.handleApi({
            url: '/users',
            data : {
                display : 500,
                page : 1,
                sort_by : 'date',
                order : 'desc',
                work_state : 33
            }
        });

        const options = []
        result.data.forEach(e=>{
            options.push({
                label: e.name+"("+e.department+"/"+e.position+")",
                value: Number(e.id),
            })
        })
        setMemberOption(options)
    }, []);

    const getProducts = useCallback(async (val) => {
        const result = await commonStore.handleApi({
            url: '/product-search',
            data:{
                company:val,
                is_new:true,
            }
        })
        if(result.data.length > 0){
            // state.company = [...result.data]
            setCompanyList([...result.data])
        }else{
            // state.company = null
            setCompanyList([])
        }
    }, [])

    const drawerClass=(data)=>{
        if(data === 'drawerback'){
            state.drawerback = 'drawerback drawerWrap';
        }else{
            state.drawerback = 'drawerWrap';
        }
    };

    const [fileDrawer, setFileDrawer] = useState(false);
    const fileDrawerOpen = () => { 
        if(drawerChk === 'Y'){
            drawerClass('drawerback');
        }
        setFileDrawer(true) 
    };
    const fileDrawerClose = () => { 
        if(drawerChk === 'Y'){
            drawerClass();
        }
        setFileDrawer(false) 
    };

    const changeHandle = (e) => {
        if(e.target.name == 'register') {
            e.target.value === 'file' ? fileDrawerOpen() : fileDrawerClose();
        }
        // setFormikFieldDefault({
        //     ...formikFieldDefault,
        //     present_type : e.target.value,
        // });
    };

    const handleSubmit = (data) =>{
        delete data.register    //방법 파라미터 삭제

        let api_set = null;
        if(data.id){
            api_set = {
                method : 'PUT',
                url : `/product-presentations/${data.id}`,
                data : data
            }
        }else{
            api_set = {
                method : 'POST',
                url : `/product-presentations`,
                data : data
            }
        }
        commonStore.handleApi(api_set)
        .then((result) => {
            Modal.success({
              content: result.result,
            })
            drawerClose()
        })
    }

    const [ drawerExtended, setDrawerExtended ] = useState(false);
    const drawerSizeHandler = () => {
        if(drawerExtended){
            setDrawerExtended(false);
            state.drawerback = 'drawerWrap';
            
        } else {
            setDrawerExtended(true);
            state.drawerback = 'drawerback drawerWrap';
        }
    }

    return(
        <Drawer 
            title='증정 신청'
            placement='right'
            onClose={drawerClose}
            visible={drawerVisible}
            className={state.drawerback}
            closable={false}
            keyboard={false}
            extra={
                <>
                    <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                        {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                    </Button>
                    <Button onClick={drawerClose}>
                        <CloseOutlined />
                    </Button>
                </>
            }
        >
            <Formik
                enableReinitialize={true} 
                initialValues={formikFieldDefault}
                validationSchema={validationSchema}
                onSubmit = {(values) => {
                    handleSubmit(values)
                }}
            >
                {(props) => (
                    <Form>
                        <Row className='table marginTop'>
                            <div className="table_title">증정 정보</div>
                            <FormikContainer type={'radio'} perRow={2} label={'회사'} name={'company'} required
                                data = {{
                                    radioData : [{
                                        label : '도서출판 길벗', 
                                        value: 'G'
                                    }, {
                                        label : '길벗스쿨',
                                        value : 'S',
                                    }]
                                }}
                                onChange = {(e)=>{getProducts(e.target.value);props.setFieldValue('details',[]);}}
                            />
                            <FormikContainer type={'radio'} perRow={2} label={'입고처'} name={'present_type'} onChange={changeHandle} required 
                                data = {{
                                    radioData : [{
                                        label : '본사', 
                                        value : '1',
                                    }, {
                                        label : '택배',
                                        value : '2',
                                    }]
                                }}
                            />
                            
                            {props.values.present_type === '2' ? (
                                <FormikContainer type={'radio'} perRow={1} label={'등록 방법'} name={'register'} onChange={changeHandle} required 
                                    data = {{
                                        radioData : [{
                                            label : '직접 입력', 
                                            value : 'direct',
                                        }, {
                                            label : '엑셀 파일로 등록(용도 분류, 상품, 수령자가 복수인 경우)',
                                            value : 'file',
                                        }]
                                    }}
                                />
                            ) : ''}

                            <FormikContainer type={'etc'} perRow={1} label={'세부 정보'} name={'details'} required >
                                {props.values.company ? props.values.present_type === '2' && props.values.register === 'direct' && <ParcelGrid key={props.values.company} {...props.values} company_list={companyList} setDetails={e=>props.setFieldValue('details',e)}/>:<></>}
                                {props.values.company ? props.values.present_type === '1' && <HqGrid {...props.values} company_list={companyList} setDetails={e=>props.setFieldValue('details',e)}/>:<></>}
                            </FormikContainer>
                        </Row>

                        <ApprovalsList 
                            approvalsData={defaultApproval}
                            approvalsDataReturn={approvalsDataReturn(props)}
                            tooltip={[tooltip[4],tooltip[5]]}
                            memberOption={memberOption}
                            openPosition="presentation"
                        />

                        <Row gutter={[10, 10]}  justify="center" style={{ marginTop: 20 }}>
                            <Col>
                                <Button type='primary' htmlType="button" onClick={e=>{props.setFieldValue('status',1);props.handleSubmit();}}>임시 저장</Button>
                            </Col>
                            <Col>
                                <Button onClick={() => {
                                    if (props.values?.details.length === 0) {
                                        alert('상품과 수령자는 반드시 한 건 이상 등록해야 합니다.')
                                    }
                                    else {
                                        props.setFieldValue('status',2)
                                        props.handleSubmit()
                                    }
                                }} type="primary submit" htmlType="button">제출</Button>
                            </Col>
                            <Col>
                                <Button htmlType="button" onClick={drawerClose} >취소</Button>
                            </Col>
                        </Row>
                        { fileDrawer && <FileRegister drawerVisible={fileDrawer} drawerClose={fileDrawerClose} setDetails={e=>{
                                props.setFieldValue('details',e)
                                fileDrawerClose()
                                props.setFieldValue('register','direct')
                            }}/> }
                    </Form>
                )}
            </Formik>
        </Drawer>
    );
})

export default index;


