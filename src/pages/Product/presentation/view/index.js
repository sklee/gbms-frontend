import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Row, Col, Drawer, Button, Table, Modal } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { Form, Formik } from 'formik';
import { FormikContainer } from '@components/form/CustomInput';
import * as Yup from 'yup';
import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import { observer, useLocalStore } from 'mobx-react';
import useStore from '@stores/useStore';

import ParcelGrid from './parcelGrid';
import HqGrid from './hqGrid';
import ModifyDrawer from '../add';
import ApprovalRegistration from './ApprovalRegistration';


const PresentationView = ({ drawerVisible, drawerClose, drawerChk, processingState, openPosition }) =>{
    const { commonStore } = useStore()

    const [presentations, setPresentations] = useState([])
    const [details, setDetails] = useState([])
    const [approvals, setApprovals] = useState([])
    const [approverList, setApproverList] = useState([])
    const [formikFieldDefault, setFormikFieldDefault] = useState({
        company: '',
        seal: '',
        classification: '',
        detailed_use: '',
        receiving_location: '',
        receiver: '',
    });

    const state = useLocalStore(() => ({
        drawerback : 'drawerWrap', //drawer class name
        userData : {},
    }));

    useEffect(() => {
        if(processingState){
            state.userData = commonStore.user
            viewData(processingState.id)
        }
    }, []);

    const viewData = useCallback((id) => {
        let apply_url = ''
        if(openPosition === 'request'){
            apply_url = '/product-presentations/'
        }else if(openPosition === 'approval'){
            apply_url = '/product-presentation-approvals/'
        }else if(openPosition === 'status'){
            apply_url = '/product-presentations/'
        }
        commonStore.handleApi({
            url : apply_url+id,
        })
        .then((result) => {
            setPresentations(result.data)
            setDetails(result.data.details)
            setApprovals(result.data.approvals)
            const tab = result.data.approvals.map(item => item.approval_user_id)
            const uniqueData = [...new Set([result.data.applicant_id,...tab])]
            setApproverList(uniqueData)
        })
    },[])

    const drawerClass=(data)=>{
        if(data === 'drawerback'){
            state.drawerback = 'drawerback drawerWrap';
        }else{
            state.drawerback = 'drawerWrap';
        }          
    }

    // 수정 Drawer
    const [modifyDrawer, setModifyDrawer] = useState(false);
    const modifyDrawerOpen = () => { 
        if(drawerChk === 'Y'){
            drawerClass('drawerback');
        }
        setModifyDrawer(true);
    };
    const modifyDrawerClose = () => { 
        if(drawerChk === 'Y'){
            drawerClass();
        }
        setModifyDrawer(false);
        viewData(processingState.id)
    };

    // 등록 Drawer
    const [registerDrawer, setRegisterDrawer] = useState(false);
    const registerDrawerOpen = () => { 
        if(drawerChk === 'Y'){
            drawerClass('drawerback');
        }
        setRegisterDrawer(true);
    };
    const registerDrawerClose = () => { 
        if(drawerChk === 'Y'){
            drawerClass();
        }
        setRegisterDrawer(false); 
        viewData(processingState.id)
    };

    const collectHandle = () => {
        Modal.warning({
            title: "회수했습니다. 삭제하거나 수정 후 다시 제출할 수도 있습니다.",
            onOk() {
                withdraw(3)
            },
        });
    }

    const withdraw = (val) => {
        // 3: 회수
        // 6: 신청 취소
        commonStore.handleApi({
            url : `/product-presentations/${presentations.id}`,
            method : 'PUT',
            data :{
                status : val
            }
        })
        .then((result) => {
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
                onSubmit = {(values) => {
                    console.log(values)
                }}
            >
                {(props) => (
                    <Form>
                        <Row className='table marginTop'>
                            <div className="table_title">증정 정보</div>
                            <FormikContainer type={'etc'} perRow={2} label={'신청'} name={'reportingDate'}>
                                {presentations.application_date ?
                                    <>{presentations.application_date+' / '+presentations.applicant_name}</>
                                :
                                    <>{presentations.applicant_name}</>
                                }
                            </FormikContainer>
                            <FormikContainer type={'etc'} perRow={2} label={'처리 상태'} name={'applicant'}>
                                <>{presentations.status_name}</>
                            </FormikContainer>
                            <FormikContainer type={'etc'} perRow={2} label={'회사'} name={'company'}>
                                <>{presentations.company_name}</>
                            </FormikContainer>
                            <FormikContainer type={'etc'} perRow={2} label={'입고처'} name={'seal'}>
                                <>{presentations.present_type_name}</>
                            </FormikContainer>
                            <FormikContainer type={'etc'} perRow={1} label={'세부 정보'} name={'classification'}>
                                {processingState?.present_type == 1 && <HqGrid details={details} />}
                                {processingState?.present_type == 2 && <ParcelGrid details={details} />}
                            </FormikContainer>
                        </Row>

                        {openPosition == 'status' && !approverList.includes(state.userData?.id) ? <></> : (
                            <div style={{marginTop: 30}}>
                                <ApprovalList approvals={approvals} />
                            </div>
                        )}

                        {openPosition == 'request' ? (
                            <Row gutter={[10, 10]} justify="center" style={{marginTop: 30}}>
                                {(presentations.status == 1 || presentations.status == 3) && (
                                    <Col>
                                        <Button type='primary' htmlType="button" onClick={modifyDrawerOpen}>수정</Button>
                                    </Col>
                                )}
                                {(presentations.status == 2) && (
                                    <Col>
                                        <Button type='primary' htmlType="button" onClick={collectHandle}>회수</Button>
                                    </Col>
                                )}
                                {(presentations.status == 3) && (
                                    <Col>
                                        <Button type='primary' htmlType="button" onClick={withdraw(6)}>신청 취소</Button>
                                    </Col>
                                )}
                            </Row>
                        ) : openPosition == 'approval' ? (
                            <Row gutter={[10, 10]} justify="center" style={{marginTop: 30}}>
                                <Button type='primary' htmlType="button" onClick={registerDrawerOpen}>승인/반려</Button>
                            </Row>
                        ) : <></>}
                    </Form>
                )}
            </Formik>
            {modifyDrawer && <ModifyDrawer drawerVisible={modifyDrawer} drawerClose={modifyDrawerClose} processingState={presentations} />}
            {registerDrawer && <ApprovalRegistration visible={registerDrawer} visibleClose={registerDrawerClose} idx={processingState.id}/>}
        </Drawer>
    );
}

export default observer(PresentationView);

const DEF_STATE = {
    approvals:[],
}

const ApprovalList = observer(( prop ) => {
    const stateData = useLocalStore(() => ({ ...DEF_STATE }));

    useEffect(() => {
        if(prop.approvals){
            stateData.approvals = prop.approvals
        }
    }, [prop.approvals]);

    const approval_column = useMemo(() => [
        {
            title: '단계',
            dataIndex: 'step',
            key:  'step',
            render: (_, row) => <div>{row.step}</div>,
            align: 'center',
            width:'5%',
        },
        {
            title: '결재 구분',
            dataIndex: 'type',
            key:  'type',
            render: (_, row) => <div> {row.type == 1 ? '승인' : row.type == 2 ? '참조' : row.type == 3 ? '청구자': '재무팀'}</div>,
            align: 'left',
            width:'8%',
        },
        {
            title: '결재자',
            dataIndex:  'approval_user_id',
            key: 'approval_user_id',
            render: (_, row) => <div>{row.approval_user_info.name}
            ({row.approval_user_info.team_info.name}/{row.approval_user_info.position_info.name})</div>,
            align: 'left',
            width: '19%',
        },
        {
            title: '결과',
            dataIndex:  'approval_result',
            key: 'approval_result',
            render: (_, row) => <div>{row.approval_result == 1 ? '승인' : row.approval_result == 2 ? '반려' : row.approval_result == 3 ?  '취소' : ''}
            {row.approval_result !='' && row.approval_result != undefined && '('+row.approval_at.substring(0,10)+')'}</div>,
            align: 'left',
            width: '19%',
        },
        {
            title: '검토내용',
            dataIndex: 'remark',
            key: 'remark',
            render: (_, row) => <div>{row.remark}</div>,
            align: 'center',
            width:'50%',
        },    
    ],[],);

    return (
        <Row gutter={10} className="table marginTop">
            <div className="table_title">결재 현황</div>
            <Col xs={24} lg={24} style={{padding: 0}} className='innerCol'>
                <Table
                    dataSource={stateData.approvals}
                    columns={approval_column}
                    rowKey={(row) => row.approval_user_id}    
                    pagination={false} 
                />
            </Col>
        </Row>
    );
})