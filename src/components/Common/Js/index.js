export const getCurrentDate = () => {
    let currentDate = new Date()
    let returnValue = ''
    returnValue = 
        currentDate.getFullYear() + "-" +
        ("0" + (currentDate.getMonth()+1)).slice(-2) + "-" + 
        ("0" + (currentDate.getDate())).slice(-2) + " " + 
        ("0" + currentDate.getHours()).slice(-2) + ":" + 
        ("0" + currentDate.getMinutes()).slice(-2)
    return returnValue
}

export const getCurrentYmd = () => {
    let currentDate = new Date()
    let returnValue = ''
    returnValue = 
        currentDate.getFullYear() + "-" +
        ("0" + (currentDate.getMonth()+1)).slice(-2) + "-" + 
        ("0" + (currentDate.getDate())).slice(-2)
    return returnValue
}

export const isEmpty = (obj) => {
    for (const prop in obj) {
        if (Object.hasOwn(obj, prop)) {
            return false;
        }
    }
    return true;
}

export const dateFormatYMD = (dateText, seperateWith) => {
    let thisDate = new Date(dateText)
    return thisDate.getFullYear() + seperateWith + ( (thisDate.getMonth()+1) < 9 ? "0" + (thisDate.getMonth()+1) : (thisDate.getMonth()+1) ) + seperateWith + ( (thisDate.getDate()) < 9 ? "0" + (thisDate.getDate()) : (thisDate.getDate()) )
}

export const moneyComma = (money) => {

    if (typeof money === 'string' || typeof money === 'number') {
        const pattern = /(-?\d+)(\d{3})/
        money = money.toString()
        while (pattern.test(money))
            money = money.replace(pattern, "$1,$2")

        return money
    }
    else {
        return 0
    }
        
}

/** 
 * 파일 업로드 및 파일 데이터 입력
 * (file List, folder name, commonStore)
**/
export const uploadDataInsert = async (formData, folder, commonStore) => {
    let isFiles = false
    // form 선언
    const form = new FormData()
    // form에 폴더 경로 append
    form.append('folder', folder)
    // file List 중 이번에 insert된 파일은 form에 append
    formData.map((fileData) => {
        if (fileData instanceof File) {
            isFiles = true
            form.append('file[]', fileData)
        }
    })
    // file List에서 insert된 파일 제거
    formData = formData.filter((fileData) => !(fileData instanceof File))

    if (isFiles) {
        // 서버에 파일 업로드
        const fileReturnData = await commonStore.handleApi({
            method  : 'POST', 
            url     : '/file-upload',
            headers : {'Content-Type': 'multipart/form-data; charset=UTF-8'},
            data    : form,
        })
        // 업로드 후 return받은 file, name을 file List에 push
        // status는 이후 구분을 위해 'uploaded' 로 추가
        await fileReturnData.map((fileUnit) => {
            formData.push({
                file_path : fileUnit.file, 
                file_name : fileUnit.name,
                status    : 'uploaded'
            })
        })
        // status가 error, uploaded인 것만 남기고 필터
        formData = formData.filter(fileData => (fileData?.status == 'error' || fileData?.status == 'uploaded'))
    }
    // error는 삭제, uploaded는 추가로 formData를 맞춤
    formData = formData.map((fileData) => {
        if (fileData.status == 'error') {
            return {
                id : fileData.uid, 
                // use_yn : 'N'
                remove : true
            }
        }
        else if (fileData.status == 'uploaded') {
            return {
                file_name : fileData.file_name, 
                file_path : fileData.file_path
            }
        }
    })
    // file List 리턴
    return await formData
}