/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Drawer, Tabs} from 'antd';
import { CloseOutlined, ShrinkOutlined, ArrowsAltOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import moment from 'moment';

import BasicContent from './contents/basicContent';
import PrdAudios from './contents/audios';
import PrdBooks from './contents/books';
import PrdEbooks from './contents/ebooks';
import PrdOthers from './contents/others';
import PrdExports from './contents/exports';
import ContractFile from './contFile';

import PrdAddBooks from './info/books';
import PrdAddAudios from './info/audios';
import PrdAddEbooks from './info/ebooks';
import PrdAddOthers from './info/others';
import PrdAddExports from './info/exports';


const { TabPane } = Tabs;

const DEF_STATE = {
    // DB Data
    id: 1,
    contract_transfer: '',
    copyright_fee_lump_sum: '',
    total_amount: '',
    payment: '',
    payment_date: '',
    payment_timing_type: '',
    payment_timing_content: '',
    targets: [],
    ranges: [],
    contract_files: [],
    etc_files: [],
    contract_memo: '',
    books: {},
    ebooks: {},
    audios: {},
    others: {},
    exports: {}
};

const ContractInfo = observer(({ idx,type,contractDrawerVisible,contractDrawerClose,getCopyrights,dataInfo,data,orgData,selType } ) => {
    const { commonStore } = useStore();
    const stateData = useLocalStore(() => ({ ...DEF_STATE })); 
    const state = useLocalStore(() => ({
        type : '',
        dataInfo: '',           //저작권자 정보
        selType : '',           //저작권 구분  

        chkData : [],       //계약범위 데이터  

        drawerback : 'drawerWrap',
        tab: 'basicInfo',

        set_init : {
            range : null,
            start_date:null,
            end_date:null,
            extension_year:null,
            brokers:[]
        }, //기본값 공유
    }));

    useEffect(()=>{
        state.type = type;
        state.dataInfo= dataInfo;
        state.selType= selType;
        if(data['idx_'+dataInfo.id]!==undefined){
            var idata = data['idx_'+dataInfo.id].pivot;
            if(idata !== null && idata !== undefined){
                if(Object.keys(idata).length > 0 && idata.id !== undefined){
                    var temp_type = Object.keys(DEF_STATE);
                    temp_type.forEach((item)=>{
                        if(item === 'payment_date')  {
                            if(idata[item]===null){
                                stateData[item] = '';
                            }else{
                                stateData[item] = moment(idata[item]);
                            }
                        }else if (item === 'payment_timing_content'){
                            if(stateData['payment_timing_type']==="1"){
                                if(idata[item]===null){
                                    stateData[item] = '';
                                }else{
                                    stateData[item] = moment(idata[item]);
                                }
                            }else if(stateData['payment_timing_type']=== "2" || stateData['payment_timing_type']=== "3" ){
                                stateData[item] = idata[item];
                            }
                        }else{
                            stateData[item] = idata[item];
                        }
                    });
                }

                stateData.contract_files = idata.contract_files.map(fileData=>{
                    fileData.uid  = fileData.id
                    fileData.url  = fileData.file_path
                    fileData.name = fileData.file_name
                    fileData['status'] = 'error'
                    fileData['response'] = '수정 불가'

                    delete fileData.file_column
                    delete fileData.file_name
                    delete fileData.file_path
                    delete fileData.fileable_id
                    delete fileData.fileable_type
                    return fileData
                })

                stateData.etc_files = idata.etc_files.map(fileData=>{
                    fileData.uid  = fileData.id
                    fileData.url  = fileData.file_path
                    fileData.name = fileData.file_name
                    fileData['status'] = 'error'
                    fileData['response'] = '수정 불가'

                    delete fileData.file_column
                    delete fileData.file_name
                    delete fileData.file_path
                    delete fileData.fileable_id
                    delete fileData.fileable_type
                    return fileData
                })
        
                stateData['ranges'] = toJS(idata['ranges'].split(', '));
                stateData['targets'] = toJS(idata['targets'].split(', '));
            }else{
                var idata = data['idx_'+dataInfo.id];
                if(idata !== null && idata !== undefined){
                    if(Object.keys(idata).length > 0 && idata.id !== undefined){
                        var temp_type = Object.keys(DEF_STATE);
                        temp_type.forEach((item)=>(
                            stateData[item] = idata[item]
                        ));
                    }
                }
                if(orgData!==undefined?true:false){
                    const test = orgData['idx_'+dataInfo.id].pivot.contract_files.map(fileData=>{
                        fileData.uid  = fileData.id
                        fileData.url  = fileData.file_path
                        fileData.name = fileData.file_name
                        fileData['status'] = 'error'
                        fileData['response'] = '수정 불가'
    
                        delete fileData.file_column
                        delete fileData.file_name
                        delete fileData.file_path
                        delete fileData.fileable_id
                        delete fileData.fileable_type
                        return fileData
                    })

                    const test2 = orgData['idx_'+dataInfo.id].pivot.etc_files.map(fileData=>{
                        fileData.uid  = fileData.id
                        fileData.url  = fileData.file_path
                        fileData.name = fileData.file_name
                        fileData['status'] = 'error'
                        fileData['response'] = '수정 불가'
    
                        delete fileData.file_column
                        delete fileData.file_name
                        delete fileData.file_path
                        delete fileData.fileable_id
                        delete fileData.fileable_type
                        return fileData
                    })
                }
            }
        }else{
            var idata = data['idx_'+dataInfo.id];
            if(idata !== null && idata !== undefined){
                if(Object.keys(idata).length > 0 && idata.id !== undefined){
                    var temp_type = Object.keys(DEF_STATE);
                    temp_type.forEach((item)=>{
                        // stateData[item] = idata[item]
                        if(item === 'payment_date')  {
                            if(idata[item]===null){
                                stateData[item] = '';
                            }else{
                                stateData[item] = moment(idata[item]);
                            }
                        }else if (item === 'payment_timing_content'){
                            if(stateData['payment_timing_type']==="1"){
                                if(idata[item]===null){
                                    stateData[item] = '';
                                }else{
                                    stateData[item] = moment(idata[item]);
                                }
                                // stateData[type] = moment(idata[item]);
                            }else if(stateData['payment_timing_type']=== "2" || stateData['payment_timing_type']=== "3" ){
                                stateData[item] = idata[item];
                            }
                        }else{
                            stateData[item] = idata[item];
                        }
                    });
                }
            }
        }

        var org_data = orgData['idx_'+dataInfo.id];
        if(org_data!==undefined){
            state.orgData={
                ...org_data,
                targets : toJS(org_data.pivot.targets.split(', ')),
                ranges : toJS(org_data.pivot.ranges.split(', '))
            };
        }else{
            state.orgData=({...DEF_STATE});
        }
        stateData.id = dataInfo.id;
        getCopyrights(stateData);
    },[type]);

    const handleChangeTab = useCallback((key) => {
        state.tab = key;
    }, []);

    const getData = (type,data) => {
        if(type==='books'){
            stateData.books = toJS(data);
        } else if(type==='ebooks'){
            stateData.ebooks = toJS(data);
        } else if(type==='audios'){
            stateData.audios = toJS(data);
        } else if(type==='others'){
            stateData.others = toJS(data);
        } else if(type==='exports'){
            stateData.exports = toJS(data);
        } else if(type==='files'){
            const file_key = ['contract_files','etc_files','contract_memo']
            file_key.forEach(key=>{
                stateData[key] = data[key]?data[key]:null
            })
        }else{
            const key_list = ['targets','ranges','contract_transfer','copyright_fee_lump_sum','total_amount','payment','payment_date','payment_timing_type','payment_timing_content']
            key_list.forEach(key=>{
                stateData[key] = data[key]?data[key]:null
            })
        }
    };

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

    return (
        <Drawer
            title={'계약 정보'}
            placement='right'
            onClose={contractDrawerClose}
            closable={false}
            visible={contractDrawerVisible}
            className={state.drawerback}
            keyboard={false}
            extra={
                <>
                    <Button onClick={drawerSizeHandler} style={{marginRight: 10}}>
                        {drawerExtended ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                    </Button>
                    <Button onClick={contractDrawerClose}>
                        <CloseOutlined />
                    </Button>
                </>
            }
        >
                    <Tabs activeKey={state.tab} onChange={handleChangeTab}>
                        <TabPane tab="기본 정보" key="basicInfo">
                            <BasicContent idx={idx} type={state.type} selType={state.selType} states={'insert'} dataInfo={dataInfo} data={stateData} orgData={state.orgData} basicVal={getData}/>
                        </TabPane>

                        <TabPane tab="종이책" key="paperBook" disabled={stateData.copyright_fee_lump_sum!=='N' || !stateData.ranges.includes('book')}>
                            {!stateData.books?.id ? (
                                <PrdAddBooks 
                                    idx={idx}
                                    type={state.type} 
                                    selType={state.selType} 
                                    states={'insert'} 
                                    data={toJS(stateData.books)} 
                                    copyId={{id:idx,copy_id:stateData.id}}
                                    booksVal={getData}
                                />
                            ) : (<>
                                <PrdBooks
                                    idx={idx}
                                    type={state.type} 
                                    selType={state.selType} 
                                    states={state.close_state} 
                                    data={toJS(stateData.books)} 
                                    copyId={{id:idx,copy_id:stateData.id}}
                                    booksVal={getData}
                                />
                                {state.orgData?.pivot.books_old && state.orgData?.pivot.books_old.map(obj => {
                                    return (
                                        <PrdBooks
                                            idx={idx}
                                            type={state.type} 
                                            selType={state.selType} 
                                            states={state.close_state} 
                                            copyId={{id:idx,copy_id:stateData.id}}
                                            data={toJS(obj)} 
                                            // booksVal={getData}
                                        />
                                    );
                                })}
                                </>
                            )}
                        </TabPane>

                        <TabPane tab="전자책" key="eBook" disabled={stateData.copyright_fee_lump_sum!=='N' || !stateData.ranges.includes('ebook')}>
                            {!stateData.ebooks?.id ? (
                                    <PrdAddEbooks
                                        idx={idx}
                                        type={state.type} 
                                        selType={state.selType} 
                                        states={'insert'} 
                                        data={toJS(stateData.ebooks)} 
                                        copyId={{id:idx,copy_id:stateData.id}}
                                        ebooksVal={getData}
                                    />
                                ) : (<>
                                    <PrdEbooks
                                        idx={idx}
                                        type={state.type} 
                                        selType={state.selType} 
                                        states={state.close_state} 
                                        data={toJS(stateData.ebooks)} 
                                        copyId={{id:idx,copy_id:stateData.id}}
                                        ebooksVal={getData}
                                    />
                                    {state.orgData?.pivot.ebooks_old && state.orgData?.pivot.ebooks_old.map(obj => {
                                        return (
                                            <PrdEbooks
                                                idx={idx}
                                                type={state.type} 
                                                selType={state.selType} 
                                                states={state.close_state} 
                                                copyId={{id:idx,copy_id:stateData.id}}
                                                data={toJS(obj)} 
                                                // ebooksVal={getData}
                                            />
                                        );
                                    })}
                                    </>
                                )}
                        </TabPane>

                        <TabPane tab="오다오북" key="audio" disabled={stateData.copyright_fee_lump_sum!=='N' || !stateData.ranges.includes('audio')}>
                            {!stateData.audios?.id ? (
                                <PrdAddAudios
                                    idx={idx}
                                    type={state.type} 
                                    selType={state.selType} 
                                    states={'insert'} 
                                    data={toJS(stateData.audios)} 
                                    copyId={{id:idx,copy_id:stateData.id}}
                                    audiosVal={getData}
                                />
                            ) : (<>
                                <PrdAudios
                                    idx={idx}
                                    type={state.type} 
                                    selType={state.selType} 
                                    states={state.close_state} 
                                    data={toJS(stateData.audios)} 
                                    copyId={{id:idx,copy_id:stateData.id}}
                                    audiosVal={getData}
                                />
                                {state.orgData?.pivot.audios_old && state.orgData?.pivot.audios_old.map(obj => {
                                    return (
                                        <PrdAudios
                                            idx={idx}
                                            type={state.type} 
                                            selType={state.selType} 
                                            states={state.close_state} 
                                            copyId={{id:idx,copy_id:stateData.id}}
                                            data={toJS(obj)} 
                                            // audiosVal={getData}
                                        />
                                    );
                                })}
                                </>
                            )}
                        </TabPane>

                        <TabPane tab="2차 저작권" key="other" disabled={stateData.copyright_fee_lump_sum!=='N' || !stateData.ranges.includes('other')}>
                            {!stateData.others?.id ? (
                                <PrdAddOthers
                                    idx={idx}
                                    type={state.type} 
                                    selType={state.selType} 
                                    states={'insert'} 
                                    data={toJS(stateData.others)} 
                                    copyId={{id:idx,copy_id:stateData.id}}
                                    othersVal={getData}
                                />
                            ) : (<>
                                <PrdOthers
                                    idx={idx}
                                    type={state.type} 
                                    selType={state.selType} 
                                    states={state.close_state} 
                                    data={toJS(stateData.others)} 
                                    copyId={{id:idx,copy_id:stateData.id}}
                                    othersVal={getData}
                                />
                                {state.orgData?.pivot.others_old && state.orgData?.pivot.others_old.map(obj => {
                                    return (
                                        <PrdOthers
                                            idx={idx}
                                            type={state.type} 
                                            selType={state.selType} 
                                            states={state.close_state} 
                                            copyId={{id:idx,copy_id:stateData.id}}
                                            data={toJS(obj)} 
                                            // othersVal={getData}
                                        />
                                    );
                                })}
                                </>
                            )}
                        </TabPane>

                        <TabPane tab="수출 저작권" key="export" disabled={stateData.copyright_fee_lump_sum!=='N' || !stateData.ranges.includes('export')}>
                            {!stateData.exports?.id ? (
                                <PrdAddExports
                                    idx={idx}
                                    type={state.type} 
                                    selType={state.selType} 
                                    states={'insert'} 
                                    data={toJS(stateData.exports)} 
                                    copyId={{id:idx,copy_id:stateData.id}}
                                    exportsVal={getData}
                                />
                            ) : (<>
                                <PrdExports
                                    idx={idx}
                                    type={state.type} 
                                    selType={state.selType} 
                                    states={state.close_state} 
                                    data={toJS(stateData.exports)} 
                                    copyId={{id:idx,copy_id:stateData.id}}
                                    exportsVal={getData}
                                />
                                {state.orgData?.pivot.exports_old && state.orgData?.pivot.exports_old.map(obj => {
                                    return (
                                        <PrdExports
                                            idx={idx}
                                            type={state.type} 
                                            selType={state.selType} 
                                            states={state.close_state} 
                                            copyId={{id:idx,copy_id:stateData.id}}
                                            data={toJS(obj)} 
                                            // exportsVal={getData}
                                        />
                                    );
                                })}
                                </>
                            )}
                        </TabPane>

                        <TabPane tab="계약서 파일과 참고사항" key="contractFile">
                            <ContractFile type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData)} filesVal={getData}/>
                        </TabPane>
                    </Tabs>
        </Drawer>
    );
});

export default ContractInfo;