import { Button, Upload } from "antd";
import { UploadOutlined } from '@ant-design/icons';

import React, { useCallback } from "react";
import { inject, observer } from "mobx-react";

const FileUploadTest = ({commonStore}) => {
    const [testVal, setTestVal] = React.useState(1)
    let refData = React.useRef(1)

    React.useEffect(() => {

    }, [])


    console.log("RENDERING!!")
    return (
        <>
            {/* <Upload multiple={true}
                beforeUpload = {false}
                data = {(data) => {
                    console.log(data)
                    commonStore.handleApi({
                        method: 'POST', 
                        url : '/file-upload',
                        data : {
                            'file'      : data,
                            'folder'    : 'test'
                        },
                        headers : {'Content-Type': 'multipart/form-data; charset=UTF-8'},
                    })
                }}
            >
                <Button icon={<UploadOutlined />}>파일</Button>
            </Upload> */}

            {/* <input type='button' onClick={() => {}}>TEST BTN</input> */}

            <Button onClick={() => {setTestVal(testVal + 1)}}> State +1</Button>
            {testVal}
            <br/>
            <Button onClick={() => {refData.current += 1}}> REF +1</Button>
            {refData.current}



            <input 
                type="file"
                onChange={(data) => {
                    const form = new FormData()
                    let thisFile = data.target.files[0]
                    form.append('file', thisFile)
                    form.append('folder', 'test')
                    commonStore.handleApi({
                        method  : 'POST', 
                        url     : '/file-upload',
                        headers : {'Content-Type': 'multipart/form-data; charset=UTF-8'},
                        data    : form,
                    })
                }}
            />
        </>
    )

}

// // 연결 시도
// let response = await fetch(apiRootURL + apiRootPath + targetUrl,
//     {
//         method: 'post',
//         mode: 'cors',
//         credentials: 'same-origin',
//         body: form,
//         headers: {
//         'Content-Type': 'multipart/form-data; charset=UTF-8',
//         },
//     }
// )

export default inject('commonStore')(observer(FileUploadTest))