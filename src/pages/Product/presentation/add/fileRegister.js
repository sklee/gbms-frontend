import React, { useState } from 'react';
import { Row, Col, Drawer, Button, Typography, Upload } from 'antd';
import { ExclamationCircleOutlined, UploadOutlined, CloseOutlined, ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';

import { FlexGrid, FlexGridColumn } from "@grapecity/wijmo.react.grid";
import useStore from '@stores/useStore';

import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

const Wrapper = styled.div`
    width: 100%;
`;
const { Text } = Typography;

const FileRegister = observer(({ drawerVisible, drawerClose, setDetails }) =>{
    const { commonStore } = useStore();
    const state = useLocalStore(() => ({
        drawerback : 'drawerWrap', //drawer class name
        err_list : [],
    }));

    const [errorGridVisible, setErrorGridVisible] = useState(false);

    const [fileList, setFileList] = useState([]);

    const props = {
        beforeUpload: (file) => {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const allowedExtensions = ['xlsx'];

            if (!allowedExtensions.includes(fileExtension)) {
                alert('엑셀 파일만 업로드 가능합니다.');
                setFileList([]);
                return false;
            }
            setFileList([...fileList,file])
            
            uploadExcel([file])
            return false
        },
        onRemove: (file) => {
            setFileList([]);
        },
        onError : (error) => {
            console.log(error)
        },
        fileList
    };

    const uploadExcel = async(file) =>{
        const formData = new FormData()
        formData.append('company', 'G')
        formData.append('excel_file', file[0])

        const result = await commonStore.handleApi({
            url: '/product-presentations/upload',
            method : 'POST',
            headers: {'Content-Type': 'multipart/form-data',},
            data:formData,
            afterAjaxSuccessFunction : (res) =>{
                return res.data
            }
        });

        if(result.success){
            setDetails(result.data)
        }else{
            const errList = result.data.map((e,idx)=>{
                return {id:idx,row:e[0],errorCont:e[1]}
            })
            state.err_list = errList
            setErrorGridVisible(true)
        }
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
        <Wrapper>
            <Drawer 
                title='파일로 등록'
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
                {errorGridVisible ? (
                    <Grid data={state.err_list}/>
                ) : (
                    <Row>
                        <Col span={24}>
                            <Text><ExclamationCircleOutlined /> 샘플 파일과 형식이 같아야 하며, 파일명 규칙은 없습니다.</Text>
                        </Col>
                        <Col span={24}>
                            <Text><ExclamationCircleOutlined /> 상품은 <span style={{color: 'red'}}>귀속 회사가 같은 것만 포함</span>시켜 주세요.</Text>
                        </Col>
                        <Col span={24} style={{marginTop: 20}}>
                            <a 
                                href='https://docs.google.com/spreadsheets/d/1D7JbvQAA5Ww1J3IV3kFd7IeVvEFDY3Qi/edit#gid=1873090785'
                                className='ant-btn ant-btn-etc' 
                                target='_blank'
                            >샘플 파일</a>
                            <Upload {...props} >
                                <Button
                                    className='ant-btn-etc'
                                    icon={<UploadOutlined />}
                                    style={{marginLeft: 10}}
                                    // onClick={() => setErrorGridVisible(true)}
                                >파일 등록</Button>
                            </Upload>
                            <span style={{marginTop: 10}}>
                                <ExclamationCircleOutlined/> 업로드 가능 확장자: xlsx
                            </span>
                        </Col>
                    </Row>
                )}
            </Drawer>
        </Wrapper>
    );
})

export default FileRegister;

const Grid = observer(( prop ) =>{
    const state = useLocalStore(() => ({
        list: prop.data,
    }));

    const initGrid = (grid) => {
        state.grid = grid

        grid.formatItem.addHandler(function (s, e) {
            if (e.panel == s.cells) {
                let col = s.columns[e.col],
                    item = s.rows[e.row].dataItem;

                switch (col.binding) {
                    case 'status':
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
            }
        });
    };


    return (
        <Row className="gridWrap" style={{marginTop: 10}}>
            <Col span={24}>
                <Text><ExclamationCircleOutlined /> 등록한 파일에 잘못된 정보가 있습니다.<br />&nbsp;&nbsp;&nbsp;&nbsp;이 레이어를 닫고 수정한 파일을 다시 등록해 주세요.</Text>
            </Col>
            <Col span={24} style={{marginTop: 10}}>
                <FlexGrid
                    itemsSource={state.list}
                    initialized={(s) => initGrid(s)}
                    headersVisibility="Column"
                >
                    <FlexGridColumn binding="row" header="행" width={120} />
                    <FlexGridColumn binding="errorCont" header="오류 내용" width="*" minWidth={150} />
                </FlexGrid>
            </Col>
            
        </Row>
    );
});