/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Drawer, Tabs, Row, Col} from 'antd';
import { CloseOutlined, ShrinkOutlined, ArrowsAltOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import useStore from '@stores/useStore';
import moment from 'moment';

import OverseasBasicInfo from './overseasBasicInfo';
import PrdBooks from './info/books';
import PrdEbooks from './info/ebooks';
import PrdAudios from './info/audios';
import ContFile from './contFile';


const { TabPane } = Tabs;
const DEF_STATE = {
    id: 1,
    targets: [],
    ranges: [],
    contract_files: [],
    etc_files: [],
    contract_memo: '',
    books: {},
    ebooks: {},
    audios: {},
};

const OverseasInfo = observer(({ type,contractDrawerVisible,contractDrawerClose,getowners,dataInfo,data,orgData,selType }) => {
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
                        stateData[item] = idata[item];
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
                        stateData[item] = idata[item];
                    });
                }
            }
        }

        var org_data = orgData['idx_'+dataInfo.id];
        if(org_data!==undefined){
            state.orgData={
                targets : toJS(org_data.pivot.targets.split(', ')),
                ranges : toJS(org_data.pivot.ranges.split(', '))
            };
        }else{
            state.orgData=({...DEF_STATE});
        }
        stateData.id = dataInfo.id;      
        getowners(stateData);
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
        } else if(type==='files'){
            const file_key = ['contract_files','etc_files','contract_memo']
            file_key.forEach(key=>{
                stateData[key] = data[key]?data[key]:null
            })
        }else{
            const key_list = ['targets','ranges']
            key_list.forEach(key=>{
                stateData[key] = data[key]?data[key]:null
            })
        }
        getowners(stateData);
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
                    <OverseasBasicInfo type={state.type} selType={state.selType} states={'insert'} dataInfo={dataInfo} data={stateData} orgData={state.orgData} basicVal={getData}/>
                </TabPane>
                <TabPane tab="종이책" key="paperBook" disabled={!stateData.ranges.includes('book')}>
                    <PrdBooks type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.books)} booksVal={getData} />
                </TabPane>
                <TabPane tab="전자책" key="eBook" disabled={!stateData.ranges.includes('ebook')}>
                    <PrdEbooks type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.ebooks)} ebooksVal={getData} />
                </TabPane>
                <TabPane tab="오디오북" key="audio" disabled={!stateData.ranges.includes('audio')}>
                    <PrdAudios type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData.audios)} audiosVal={getData} />
                </TabPane>
                <TabPane tab="계약서 파일과 참고사항" key="contFile">
                    <ContFile  type={state.type} selType={state.selType} states={'insert'} data={toJS(stateData)} filesVal={getData} />
                </TabPane>
            </Tabs>
            <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                <Col>
                    <Button type="primary" htmlType="button" onClick={()=>{getowners(stateData);contractDrawerClose();}}>
                        확인
                    </Button>
                </Col>
            </Row>
        </Drawer>
    );
});

export default OverseasInfo;