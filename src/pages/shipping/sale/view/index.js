import React, { useState, useEffect } from 'react';
import { Row, Button, Drawer, Select, Modal } from 'antd';
import { CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { observer, useLocalStore, inject } from 'mobx-react';
import { FormikProvider, useFormik } from 'formik';
import { FormikContainer, FormikInput } from '@components/form/CustomInput'
import Grid from './grid';

const { confirm } = Modal;

export const PaperBookContext = React.createContext(null)

// const index = inject('commonStore')(observer(({ drawerVisible, commonStore, drawerClose, rowId }) => {
const Index = ({ drawerVisible, commonStore, drawerClose, rowId, companyName, visible, addDrawerClose, rowData, listRefresh, editabled = false, viewType = '' }) => {
    console.log("rowId: ", rowId)
    const [selectedDefaultsRow, setSelectedDefaultsRow] = React.useState({})    
    const [slipOutSalesData, setSlipOutSalesData] = useState(null);
    const [warehouseListOptions, setWarehouseListOptions] = useState([]);
    const [salesAccountOptions, setSalesAccountOptions] = useState([]);

    // const [formikFieldDefault, setFormikFieldDefault] = React.useState({
    //     // branchNumber: '',
    //     // branchName: '',
    //     // company: '',
    //     // progress: '',
    //     // searchCriteria: '',
    //     // inquiryPeriod: '',
    //     id: '',
    // });

    const state = useLocalStore(() => ({
        isRender: false,
        tab: 'info',
        drawerback: 'drawerWrap', //drawer class name
        idx: '',
    }));

    const deleteHandle = () => {
        confirm({
            title: '삭제하면 되돌릴 수 없습니다. 계속하시겠습니까?',
            onOk() {
                handleDelete()
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const handleDelete = () => {
        commonStore.handleApi({
            method : 'DELETE',
            url : '/slip-out-sales/'+rowId,
        })
        .then((result) => {
            Modal.success({
                content: '삭제되었습니다..',
                onOk : drawerClose
            })
            // visibleClose();
        })
    };

    const [drawerExtended, setDrawerExtended] = useState(false);
    const drawerSizeHandler = () => {
        if (drawerExtended) {
            setDrawerExtended(false);
            state.drawerback = 'drawerWrap';
            
        } else {
            setDrawerExtended(true);
            state.drawerback = 'drawerback drawerWrap';
        }
    }

    // useEffect(() => {
    //     // 각 API 호출 후의 로직을 처리하는 함수들
    //     const handleSalesData = (data) => {
    //         setSlipOutSalesData(data);
    //         formikHook.setValues(data);
    //     };

    //     const handleWarehouseData = (data) => {
    //         const options = data.map(item => ({
    //             value: item.id,
    //             label: item.name
    //         }));
    //         setWarehouseListOptions(options);
    //         // formikHook.setValues(data);
    //     };

    //     const handleSalesAccountData = (data) => {
    //         const options = data.map(item => ({
    //             value: item.logistics_code,
    //             label: item.name
    //         }));
    //         setSalesAccountOptions(options);
    //         // formikHook.setValues(data);
    //     };

    //     // 단일 비동기 함수로 각 API 호출을 순차적으로 처리
    //     const fetchData = async () => {
    //         try {
    //             // 1. Sales Data Fetching
    //             const salesDataResult = await commonStore.handleApi({
    //                 method: 'GET',
    //                 url: `/slip-out-sales/${rowId}`,
    //             });
    //             handleSalesData(salesDataResult.data);
                
    //             // 2. Warehouse Data Fetching
    //             const warehouseDataResult = await commonStore.handleApi({
    //                 method: 'GET',
    //                 url: `/codes?parent_code=3193`,
    //             });
    //             handleWarehouseData(warehouseDataResult.data);
                
    //             // 3. Sales Account Data Fetching
    //             const salesAccountDataResult = await commonStore.handleApi({
    //                 method: 'GET',
    //                 url: `/select-sales-accounts`,
    //             });
    //             handleSalesAccountData(salesAccountDataResult.data);
                
    //         } catch (error) {
    //             console.error("API 호출에서 오류가 발생했습니다:", error);
    //             // 오류 상태 업데이트 로직 (예: setErrorState(error))
    //         }
    //     };

    //     fetchData();
    // // }, [rowId, drawerVisible, commonStore, formikHook, setSlipOutSalesData, setWarehouseListOptions, setSalesAccountOptions]);
    // }, [rowId, drawerVisible, commonStore, formikHook]);


    useEffect(() => {
        // 각각의 데이터 핸들링 로직은 별도의 async 함수로 분리됩니다.
        const fetchSalesData = async () => {
            const result = await commonStore.handleApi({
                method: 'GET',
                url: `/slip-out-sales/${rowId}`,
            });
            return result.data;
        };

        const fetchWarehouseData = async () => {
            const result = await commonStore.handleApi({
                method: 'GET',
                url: `/codes?parent_code=3193`,
            });
            const options = result.data.map(item => ({
                value: item.id,
                label: item.name
            }));
            setWarehouseListOptions(options);
                        
            return result.data;
        };

        const fetchSalesAccountData = async () => {
            const result = await commonStore.handleApi({
                method: 'GET',
                url: `/select-sales-accounts`,
            });

             // 'id' 키의 이름을 'sales_account_branch_id'로 변경
            const renamedData = result.data.map(item => {
                const { id, ...rest } = item;
                return {
                    sales_account_branch_id: id,
                    ...rest
                };
            });
            const options = renamedData.map(item => ({
                value: item.sales_account_branch_id,
                label: item.name
            }));
            setSalesAccountOptions(options);
            
            return renamedData;
        };

        const fetchData = async () => {
            try {
                const [salesData, warehouseData, salesAccountData] = await Promise.all([
                    fetchSalesData(),
                    fetchWarehouseData(),
                    fetchSalesAccountData(),
                ]);
                
                const additionData = {                                                                                                                                                                                                                                                                                                                 
                    gridDtldData: salesData.details,
                };

                const updateSalesData = { ...salesData, ...additionData };
                const defaultSalesAccountId = salesAccountData[0]?.sales_account_branch_id;

                formikHook.setValues({
                    ...updateSalesData,
                    ...warehouseData,
                    sales_account_branch_id: defaultSalesAccountId,
                    salesAccountData: salesAccountData
                });


            } catch (error) {
                console.error("API 호출에서 오류가 발생했습니다:", error);
            }
        };

        fetchData();
    }, [rowId, formikHook]);
    // }, [rowId, drawerVisible, commonStore, formikHook]);

    const initialValues = {
        defaults: [],
        created_info: {
            id: commonStore?.user?.id,
            name: commonStore?.user?.name
        },
        department: {
            id: commonStore?.user?.team
        },
        department_code_id: commonStore?.user?.team,
        request_date: '',
        due_date: '',
        // sales_account_branch_id: salesAccountData[0]?.sales_account_branch_id,
        // order_type: '',
    }
    // 수정, 저장
    const onSubmit = (submitData) => {
        // const momentDefaultArray = [`due_date`, `request_date`, `receiving_scheduled_date`]
        // const detailsSectionArray = [`prepresses`, `papers`, `prints`, `bindings`, `processings`, `packings`, `accessories`]

        console.log("submitData: ", submitData)

        commonStore.handleApi({
            method : 'PUT', 
            url : `/slip-out-sales/${rowId}`,
            data : submitData
        })
        .then(result => {
            // 사고 목록 재구성
            // refreshList()
            Modal.success({
                content : `완료되었습니다.`, 
                onOk : drawerClose
            })
        })

        // for (const unitDefault of submitData?.defaults) {
        //     delete unitDefault.dataIndex
        //     unitDefault.ordnum = 0
        //     for (const momentColumn of momentDefaultArray) {
        //         if (moment.isMoment(unitDefault[momentColumn])) {
        //             unitDefault[momentColumn] = moment(unitDefault[momentColumn]).format('YYYY-MM-DD')
        //         }
        //     }
        //     for (const unitDetail of unitDefault?.details) {
        //         delete unitDetail.dataIndex
        //         unitDetail.ordnum = 0
        //         for (const detailSection of detailsSectionArray) {
        //             for (const targetDetail of unitDetail[detailSection]) {
        //                 delete targetDetail.dataIndex
        //                 targetDetail.ordnum = 0
        //                 if (moment.isMoment(targetDetail.cost_attribution_date)) {
        //                     if (targetDetail.cost_attribution_date !== '' && targetDetail.cost_attribution_date !== undefined) {
        //                         targetDetail.cost_attribution_date = moment(targetDetail.cost_attribution_date).format('YYYY-MM-DD')
        //                     }
        //                     else {
        //                         targetDetail.cost_attribution_date = moment().format('YYYY-MM-DD')
        //                     }
        //                 }
        //                 if (detailSection === 'prints') {
        //                     if (moment.isMoment(targetDetail.request_complete_date)) {
        //                         targetDetail.request_complete_date = moment(targetDetail.request_complete_date).format('YYYY-MM-DD')
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }
    }



    const formikHook = useFormik({ initialValues, onSubmit })


    return (
        <PaperBookContext.Provider value={{
            selectedDefaultsRow: selectedDefaultsRow
        }}>
            
        
        <Drawer
            title='주문/출고 내용'
            placement='right'
            onClose={drawerClose}
            visible={drawerVisible}
            className={state.drawerback}
            closable={false}
            keyboard={false}
            extra={
                <>
                    <Button onClick={drawerSizeHandler} style={{ marginRight: 10 }}>
                        {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                    </Button>
                    <Button onClick={drawerClose}>
                        <CloseOutlined />
                    </Button>
                </>
            }
        >
            <FormikProvider value={formikHook}>               
                    {                        
                        formikHook.values && (
                            <>
                                <Row className="table">                
                                    <FormikContainer type={'etc'} perRow={2} label={'주문 출처'} >{formikHook.values?.order_source_name}</FormikContainer>
                                    <FormikContainer type={'etc'} perRow={2} label={'진행 상태'} >{formikHook.values?.status_name}</FormikContainer>
                                    <FormikContainer type={'etc'} perRow={2} label={'주문일시'} >{formikHook.values?.order_date}</FormikContainer>
                                    <FormikContainer type={'etc'} perRow={2} label={'주문 등록자'} >{formikHook.values?.order_user_name}</FormikContainer>
                                    <FormikContainer type={'etc'} perRow={2} label={'출고 요청일시'} >{formikHook.values?.ship_date}</FormikContainer>
                                    <FormikContainer type={'etc'} perRow={2} label={'회사'} >{formikHook.values?.company_name}</FormikContainer>
                                    <FormikContainer type={'etc'} perRow={2} label={'거래처(본점)'} >{formikHook.values?.sales_account_name}</FormikContainer>
                                    <FormikContainer
                                        perRow={2}
                                        label={'지점'}
                                        style={{ width: '100%' }}
                                    >
                                        <FormikInput
                                            name={'sales_account_branch_id'}
                                            type={'select'}
                                            style={{ width: '100%' }}
                                            data={{
                                                // defaultValue: '가람비엔에프',
                                                // defaultValue: salesAccountData[0]?.name,
                                                options: salesAccountOptions,
                                            }}
                                        />
                                    </FormikContainer>
                                </Row>

                                <Row className="table marginUD">
                                    <FormikContainer
                                        perRow={3}
                                        label={'주문 구분'}
                                        style={{ width: '100%' }}
                                    >
                                        <FormikInput
                                            name={'order_type'}
                                            type={'select'}
                                            style={{ width: '100%' }}
                                            data={{
                                                defaultValue: '신간',
                                                options: [{
                                                    value: '1',
                                                    label: '신간'
                                                }, {
                                                    value: '2',
                                                    label: '재쇄'
                                                }],
                                            }}
                                        // disabled={providerData.editabled || providerData.viewType === 'view'}
                                        />
                                    </FormikContainer>
                
                                    <FormikContainer
                                        perRow={3}
                                        label={'공급 조건'}
                                        style={{ width: '100%' }}
                                    >
                                        <FormikInput
                                            name={'settlement_type'}
                                            type={'select'}
                                            style={{ width: '100%' }}
                                            data={{
                                                defaultValue: '위탁',
                                                options: [{
                                                    value: '1',
                                                    label: '위탁'
                                                }, {
                                                    value: '2',
                                                    label: '납품'
                                                }, {
                                                    value: '3',
                                                    label: '매절'
                                                }, {
                                                    value: '4',
                                                    label: '현매'
                                                }, {
                                                    value: '5',
                                                    label: '기타'
                                                }],
                                            }}
                                        />
                                    </FormikContainer>
        
                                    <FormikContainer
                                        perRow={3}
                                        label={'창고'}
                                        style={{ width: '100%' }}
                                    >
                                        <FormikInput
                                            name={'warehouse_id'}
                                            type={'select'}
                                            style={{ width: '100%' }}
                                            data={{
                                                defaultValue: '라임북(정품)',
                                                options: warehouseListOptions,
                                            }}
                                        />
                                    </FormikContainer>
        
                                    <FormikContainer
                                        perRow={3}
                                        label={'배송 구분'}
                                        style={{ width: '100%' }}
                                    >
                                        <FormikInput
                                            name={'delivery_type'}
                                            type={'select'}
                                            style={{ width: '100%' }}
                                            data={{
                                                defaultValue: '위탁배송',
                                                options: [{
                                                    value: '1',
                                                    label: '위탁배송'
                                                }, {
                                                    value: '2',
                                                    label: '직접배송'
                                                }],
                                            }}
                                        />
                                    </FormikContainer>
        
                                    <FormikContainer
                                        perRow={3}
                                        label={'배송 방법'}
                                        style={{ width: '100%' }}
                                    >
                                        <FormikInput
                                            name={'delivery_method'}
                                            type={'select'}
                                            style={{ width: '100%' }}
                                            data={{
                                                defaultValue: '시내',
                                                options: [
                                                    { value: '1', label: '시내' },
                                                    { value: '2', label: '지방' },
                                                    { value: '3', label: '화물' },
                                                    { value: '4', label: '택배' },
                                                    { value: '5', label: '택배/퀵' },
                                                    { value: '6', label: '기타' },
                                                    { value: '7', label: '기타' }
                                                    
                                                ],
                                            }}
                                        />
                                    </FormikContainer>
        
                                    <FormikContainer
                                        type={'etc'}
                                        perRow={3}
                                        label={'전표 코드'}>
                                        {formikHook.values?.slip_code}
                                    </FormikContainer>
                                    <FormikContainer type={'input'} perRow={3} label={'전표 차수'} name={'slip_seq'} />
                                    <FormikContainer type={'input'} perRow={3} label={'적요 구분'} name={'ledger_remark_type'} />
                                    <FormikContainer type={'input'} perRow={3} label={'적요 내용'} name={'ledger_remark_type_name'} />
                                    <FormikContainer type={'input'} perRow={1} label={'비고'} name={'ledger_remark'} />
                                </Row>

                                {/* 필요없는 리랜더링 확인  */}
                                {/* {<Grid gridDetails={formikHook.values?.details} rowId={rowId} companyName={companyName}/> } */}
                                <Grid gridDetails={formikHook.values?.gridDtldData} rowId={rowId} companyName={companyName}/> 
                                <Row className='table marginUD'>
                                    <FormikContainer type={'textarea'} perRow={1} label={'참고 사항'} name={'remark'} />
                                    <FormikContainer type={'etc'} perRow={2} label={'수정 일시'}>{formikHook.values?.updated_at}</FormikContainer>
                                    <FormikContainer type={'etc'} perRow={2} label={'수정자'}>{formikHook.values?.updated_user_name}</FormikContainer>
                                </Row>

                                <Row gutter={[10, 10]} justify='center'>
                                    <Button
                                        type='primary submit'
                                        htmlType="button"
                                        onClick={formikHook.handleSubmit}
                                    >
                                        확인
                                    </Button>
                                    <Button style={{ margin: '0 10px' }}>취소</Button>
                                    <Button onClick={deleteHandle}>삭제</Button>
                                </Row>
                            </>
                        )
                    }
            </FormikProvider>
        </Drawer>
    </PaperBookContext.Provider>
    );
    // }));
}
export default inject('commonStore')(observer(Index))
// export default index;