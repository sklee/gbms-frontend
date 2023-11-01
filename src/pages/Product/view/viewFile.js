import React from 'react';
import { Button, Row, Col, Popover, Upload, Spin, Modal} from 'antd';
import { UploadOutlined, QuestionOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { inject, observer, useLocalStore } from 'mobx-react';

import tooltipData from '@pages/tooltipData';
import { uploadDataInsert } from '@components/Common/Js';

const ViewFile = ({ commonStore, idx,popoutCloseVal,drawerChk, popoutChk, viewData}) => {
    const [ loading,         setLoading         ] = React.useState(false); //로딩
    const [ manuscriptFiles, setManuscriptFiles ] = React.useState([])
    const [ editFiles,       setEditFiles       ] = React.useState([])
    const [ pdfFiles,        setPdfFiles        ] = React.useState([])
    const [ ebookFiles,      setEbookFiles      ] = React.useState([])
    const [ audioFiles,      setAudioFiles      ] = React.useState([])
    const [ etcFiles,        setEtcFiles        ] = React.useState([])
    const [ coverFiles,      setCoverFiles      ] = React.useState([])
    const [ previewFiles,    setPreviewFiles    ] = React.useState([])
    const [ etc2Files,       setEtc2Files       ] = React.useState([])

    const state = useLocalStore(() => ({
        popoutChk : 'N',        //팝업체크
        adminChk : true,        //관리자여부
        dataOld : [],
        addFile : [],
        fileCntChk : 0,
        fileUpdataChk : 0,
        
        tooltipData : '',
    }));
    
    React.useEffect(() => {
        state.popoutChk = popoutChk;
        viewDataList(idx);
        if(tooltipData !== '' && tooltipData !== undefined){
            var data = []
            tooltipData.forEach((e,num) => {
                if(e.id === 'productFile'){
                    data = [...data, (<div dangerouslySetInnerHTML={{__html: tooltipData[num].memo}}></div>)]
                }
            })
            state.tooltipData = data
        }   
    }, [idx])

    const popoutClose = (val) => { //팝업체크
        popoutCloseVal(val)
    };
    //상세정보
    const viewDataList = async (idx) => {
        commonStore.handleApi({
            method  : `GET`, 
            url     : `/products/${idx}/file-data`
        })
        .then(result => {
            fileNameList.forEach(listName => {
                result.data[fileListObj[listName].key].forEach(data => {
                    data.name = data.file_name
                    data.url  = data.file_path
                    delete data.created_at
                    delete data.created_id
                    delete data.file_name
                    delete data.file_path
                    delete data.updated_at
                    delete data.updated_id
                })
                fileListObj[listName].set(result.data[fileListObj[listName].key])
            })
        })
    }
    // 저장
    const apiSubmit = async () => {
        const form = new FormData()
        let deleteFileList = []
        let isNewUpload = false
        fileNameList.forEach(listName => { 
            fileListObj[listName].get.map(fileUnit => {
                // 새로 업로드한 File인지 체크
                if (fileUnit instanceof File) {
                    isNewUpload = true
                    form.append(listName + '[]', fileUnit)
                }
                // 삭제 버튼 클릭했는지 체크
                else if (fileUnit?.status === 'error') {
                    deleteFileList.push(fileUnit.id)
                }
            })
        })

        if (isNewUpload) {
            form.append('folder', 'product')
            commonStore.handleApi({
                method  : `POST`, 
                url     : `/products/${idx}/file-data`, 
                data    : form
            })
        }
        if (deleteFileList.length !== 0) {
            deleteFileList.forEach(file_id => {
                commonStore.handleApi({
                    method  : `DELETE`, 
                    url     : `/products/${idx}/file-data/${file_id}`, 
                    data    : form
                })
            })
        }
        Modal.success({
            content: '수정이 완료되었습니다.',
            onOk: () => {
                viewDataList(idx)
                setLoading(false)
            }
        })
    }

    const fileNameList = [
        'manuscript_files', 
        'edit_files', 
        'pdf_files', 
        'ebook_files', 
        'audio_files', 
        'etc_files', 
        'cover_files', 
        'preview_files', 
        'etc2_files'
    ]

    const fileListObj = {
        manuscript_files : {
            label   : "원고", 
            key     : "manuscriptFiles", 
            get     : manuscriptFiles, 
            set     : (arr) => { setManuscriptFiles(arr) }
        }, 
        edit_files : {
            label   : "편집 데이터", 
            key     : "editFiles", 
            get     : editFiles, 
            set     : (arr) => { setEditFiles(arr) }
        }, 
        pdf_files : {
            label   : "PDF", 
            key     : "pdfFiles", 
            get     : pdfFiles, 
            set     : (arr) => { setPdfFiles(arr) }
        }, 
        ebook_files : {
            label   : "전자책", 
            key     : "ebookFiles", 
            get     : ebookFiles, 
            set     : (arr) => { setEbookFiles(arr) }
        }, 
        audio_files : {
            label   : "오디오북", 
            key     : "audioFiles", 
            get     : audioFiles, 
            set     : (arr) => { setAudioFiles(arr) }
        }, 
        etc_files : {
            label   : "기타", 
            key     : "etcFiles", 
            get     : etcFiles, 
            set     : (arr) => { setEtcFiles(arr) }
        }, 
        cover_files : {
            label   : "웹용 표지", 
            key     : "coverFiles", 
            get     : coverFiles, 
            set     : (arr) => { setCoverFiles(arr) }
        }, 
        preview_files : {
            label   : "본문 미리보기(PDF)", 
            key     : "previewFiles", 
            get     : previewFiles, 
            set     : (arr) => { setPreviewFiles(arr) }
        }, 
        etc2_files : {
            label   : "기타", 
            key     : "etc2Files", 
            get     : etc2Files, 
            set     : (arr) => { setEtc2Files(arr) }
        }
    }

    const StateFileComponent = ({stateName}) => (
        <>
            <Col xs={24} lg={4} className="label">
                {fileListObj[stateName]?.label}
            </Col>
            <Col xs={24} lg={20}>
                <Upload 
                    maxCount={5}
                    multiple={true}
                    withCredentials={true}
                    onPreview   = {file => {
                        if (file instanceof File) {
                            const downLoad = document.createElement('a')
                            const url = URL.createObjectURL(new Blob([file]))
                            downLoad.href = url
                            downLoad.download = file.name
                            downLoad.click()
                            downLoad.remove()
                            URL.revokeObjectURL(url)
                        }
                        else {
                            window.location.href = `https://gbms-api.gilbut.co.kr/api/v1/file-download?file=${file.url}&name=${file.name}`
                        }
                    }}
                    onRemove    = {file => {
                        if (file instanceof File) {
                            fileListObj[stateName].set(fileListObj[stateName].get.filter(unit => unit.uid !== file.uid))
                        }
                        else {
                            let removedFileData = fileListObj[stateName].get.map(unit => {
                                if (unit.uid === file.uid) {
                                    if (unit?.status === 'error') {
                                        if(unit.response==='삭제 대기'){
                                            delete unit.status
                                            delete unit.response
                                        }
                                    }
                                    else {
                                        unit.status     = 'error'
                                        unit.response   = '삭제 대기'
                                    }
                                }
                                return unit
                            })

                            fileListObj[stateName].set(removedFileData)
                        }
                        return false
                    }}
                    beforeUpload = {(file, fileList) => {
                        fileListObj[stateName].set(fileListObj[stateName].get.concat(fileList))
                        return false
                    }}
                    fileList = {fileListObj[stateName].get}
                >
                    <Button icon={<UploadOutlined />}>파일</Button>
                </Upload>
                <span className='accessFile'><ExclamationCircleOutlined/> 용량 최대: 20MB</span>
            </Col>
        </>
    )
    return (
        <Spin spinning={loading} delay={500}>               
            {/* 원본/제작용 데이터 */}
            <Row gutter={10} className="table marginTop">
                <div className="table_title">
                    원본/제작용 데이터
                    <Popover content={state.tooltipData[0]}>
                        <Button shape="circle" icon={<QuestionOutlined style={{fontSize: "11px"}} />} size="small" style={{marginLeft: '5px'}} />
                    </Popover>
                </div>
                <StateFileComponent stateName={fileNameList[0]}/>
                <StateFileComponent stateName={fileNameList[1]}/>
                <StateFileComponent stateName={fileNameList[2]}/>
                <StateFileComponent stateName={fileNameList[3]}/>
                <StateFileComponent stateName={fileNameList[4]}/>
                <StateFileComponent stateName={fileNameList[5]}/>
            </Row>         
            {/* 사내 공유용 데이터 */}
            <Row gutter={10} className="table marginTop">
                <div className="table_title">
                    사내 공유용 데이터
                    <Popover content={state.tooltipData[1]}>
                        <Button shape="circle" icon={<QuestionOutlined style={{fontSize: "11px"}} />} size="small" style={{marginLeft: '5px'}} />
                    </Popover>
                </div>
                <StateFileComponent stateName={fileNameList[6]}/>
                <StateFileComponent stateName={fileNameList[7]}/>
                <StateFileComponent stateName={fileNameList[8]}/>
            </Row>
            {/* 확인 */}
            <Row gutter={[10, 10]} justify="center" style={{ marginTop: 20 }}>
                <Col> 
                {state.popoutChk === 'Y' ?
                    <Button type="primary" htmlType="button"  onClick={e => popoutClose('Y')} style={{marginLeft:'10px'}}>닫기</Button> : 
                    <>
                        <Button type="primary" htmlType="button" onClick={apiSubmit}>확인</Button>
                        { drawerChk == "Y" && state.adminChk === true && <Button htmlType="button" onClick={e => popoutClose('Y')} style={{marginLeft:'10px'}}>취소</Button> }     
                    </>
                }
                </Col>
            </Row>
        </Spin>
    )
}

export default inject('commonStore')(observer(ViewFile))