import React, { Fragment } from 'react';
import { Field, FieldArray, useField} from 'formik';
import { Row, Col, Input, Button, Checkbox, Upload, Select, Radio, DatePicker, Popover, Table} from 'antd';
import { UploadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { inject, observer } from 'mobx-react';
import moment from 'moment/moment';
// import { VariableSizeGrid as Grid } from 'react-window';

export const FormikContainer = (props) => (<>
    <Col xs={24/props.perRow} lg={props.labelWidth ? props.labelWidth : 4} className='label'>{props.label} {props.required && <span className='spanStar'>*</span> }
        {props.tooltip && 
            <Popover content={props.tooltip}>
                <Button
                    shape="circle"
                    size="small" 
                    className="btn_popover"
                    style={{ marginLeft: '5px' }}
                >?</Button>
            </Popover>
        }
    </Col>
    <Col className={(props && props.type == 'select' || (props.children && props.children.props && props.children.props.type == 'select')) || props.escapeVerCenter ? '' : 'verCenter'} xs={24/props.perRow} lg={24/props.perRow - (props.labelWidth ? props.labelWidth : 4)} >{!props.children ? <FormikInput {...props}/> : props.children}</Col>
</>)

export const ArrayHelper = React.createContext(null)

export const TableArrayContainer = ({name, children}) => (
    <FieldArray
        name={name}
        render={arrayHelpers => (
            <ArrayHelper.Provider 
                value={{
                    arrayHelpers : arrayHelpers, 
                    name : name
                }}
            >
                {children}
            </ArrayHelper.Provider>
        )}
    />
)

export const FormikInput = inject('commonStore')(observer(({
    commonStore, 
    type = "text",
    required = false,
    label = "",
    perRow = 1,
    placeholder = "",
    readOnly = false,
    disabled = false,
    onChange = () => {},
    onBlur = () => {},
    value, 
    style,
    data,
    name,
    dateValue,
    disabledDate,
    extraCompo,
    customCompo, 
    children, 
    fontStyle,
    btnType,
    contentCnt = 1,
}) => {
    const [instantData, setInstantData] = React.useState([])
    const [field] = useField(name)
    const dateFormat = 'YYYY-MM-DD';

    // select options api 처리
    React.useEffect(() => {
        if (type === 'select') {
            if (data.optionApiUrl && instantData.length === 0) {
                commonStore.handleApi({url : data.optionApiUrl})
                .then((result) => {
                    let optionsData = []
                    result.data.map((unit) => {
                        let optionNode = {}
                        optionNode[data.value]  = unit[data.optionsApiValue]
                        optionNode[data.label]  = unit[data.optionsApiLabel]
                        optionsData.push(optionNode)
                    })
                    setInstantData(optionsData)
                })
            }
        }
    }, [])

    switch (type) {
        case 'file': 
        return (
            <Field name={name}>
                {({field, form, meta}) => {
                    return (
                        <>
                            <Upload 
                                maxCount={contentCnt}
                                multiple={true}
                                withCredentials={true}
                                onPreview   = {(file) => {
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

                                onRemove    = {(file) => {
                                    if (file instanceof File) {
                                        form.setFieldValue(field.name, field.value.filter(unit => unit.uid !== file.uid))
                                    }
                                    else {
                                        let removedFileData = field.value.map(unit => {
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
        
                                        form.setFieldValue(field.name, removedFileData)
                                    }
                                    return false
                                }}

                                beforeUpload = {(file, fileList) => {
                                    form.setFieldValue(field.name, [...field.value, ...fileList])
                                    return false
                                }}

                                fileList={field?.value}
                                onChange={optionsValue => {
                                    onChange && onChange(optionsValue);
                                }}
                            >
                                {btnType === 'circle' ? (
                                    <Button className="btn btn-primary btn_add" shape="circle">+</Button>
                                ) : (
                                    <Button icon={<UploadOutlined />}>파일</Button>
                                )}
                                
                            </Upload>
                            <span className='accessFile'><ExclamationCircleOutlined/> 업로드 가능 확장자: png, pdf,xlsx | 용량 최대: 20MB</span>
                        </>

                    )
                }}
            </Field>

        )

        case 'address': 
        return (
        <>
            <Field name={`${name}.fullAddress`}>
                {({field, form : {touched, errors, setFieldValue, setFieldTouched}}) => (
                    <>
                        <Button
                            danger={(touched && touched[name] && errors && errors[name] && errors[name].fullAddress) && (errors[name].fullAddress.zipcode !== undefined ) ? true : false}
                            style={{marginRight: 10}}
                            onClick={() => {
                                setFieldTouched(`${name}.fullAddress`, true)
                                commonStore.postVisible = true;
                                commonStore.setFormAddressFunc = (value) => setFieldValue(`${name}.fullAddress`, value)
                            }}
                        >
                            검색
                        </Button>
                        <font color='#cf1613'>{(touched && touched[name] && errors && errors[name] && errors[name].fullAddress && errors[name].fullAddress.fullAddress) && errors[name].fullAddress.fullAddress}</font>
                    </>
                )}
            </Field> 
            {field.value?.fullAddress?.fullAddress && `[ ${field.value?.fullAddress?.zipcode} ] ${field.value?.fullAddress?.fullAddress}`}
            {field.value?.fullAddress?.fullAddress && 
                <Field name={`${name}.detailAddress`}>
                    {({field, form: { touched, errors }}) => (
                    <>
                        <Input 
                            status={(touched && touched[name] && errors && errors[name] && errors[name].detailAddress) !== undefined ? 'error' : ''}
                            style={{marginTop:10}} 
                            type='text' 
                            {...field}
                        />
                        <font color='#cf1613'>{(touched && touched[name] && errors && errors[name] && errors[name].detailAddress) && errors[name].detailAddress}</font>
                    </>
                    )}
                </Field>

            }
        </>)

        case 'select' : 
        return (
            <Field name={name}>
                {({field, form : {touched, errors, setFieldValue}}) => (
                    <>
                        <>
                            <Select 
                                status      = {(touched && touched[field.name] && errors && errors[field.name]) ? 'error' : ''}
                                mode        = {data.mode === 'multiple' ? 'multiple' : ''}
                                allowClear  = {data.mode === 'multiple' ? true : false}
                                showSearch  = {true}
                                placeholder = {placeholder}
                                style       = {style}
                                options     = {data.options ? data.options : data.optionApiUrl ? instantData : []}
                                fieldNames  = {{
                                    value   : data.value ? data.value : 'value', 
                                    label   : data.label ? data.label : 'label'
                                }}
                                defaultValue= {data.defaultValue}
                                optionFilterProp = {data.label ? data.label : 'label'}
                                name        = {field.name}
                                disabled    = {disabled}
                                onBlur      = {field.onBlur}
                                value       = {field.value}
                                onChange    = {optionsValue => {
                                    setFieldValue(field.name, optionsValue); 
                                    onChange && onChange(optionsValue);
                                }}
                            />
                            {extraCompo && extraCompo}
                        </>
                        <Row style={{border: 0}}>
                            <font color='#cf1613'>{(touched && touched[field.name] && errors && errors[field.name]) && errors[field.name]}</font>
                        </Row>
                    </>
                )}
            </Field>
        )

        case 'checkbox' : return (
            <Field name={name}>
                {({field, form : {touched, errors, setFieldValue}, meta}) => (
                    <>
                        <Checkbox.Group
                            {...field}
                            disabled={disabled}
                            onChange={(e) => {
                                setFieldValue(field.name, e)
                                onChange && onChange(e)
                            }}
                            value={value ? value : field.value}
                        >
                            {data.checkboxData.map((unit, index) => (
                                <Checkbox key={index} value={unit.value}>{unit.label && unit.label}</Checkbox>
                            ))}
                        </Checkbox.Group>
                        {extraCompo && extraCompo}
                        {(touched && touched[field.name] && errors && errors[field.name]) && 
                        <Row>
                            <font color='#cf1613' style={{paddingTop: 5}}>{errors[field.name]}</font>
                        </Row>
                        }
                    </>
                )}
            </Field>
        )

        case 'radio' : 
        
        return (
            <Field name={name}>
                {({field, form : {touched, errors, setFieldValue}}) => (
                    <>
                        <Radio.Group
                            disabled = {disabled}
                            style={data.align == 'column' ? { width: '100%', textAlign: 'center' } : {}}
                            value={value}
                            {...field}
                            onChange={(e) => {
                                setFieldValue(field.name, e.target.value)
                                onChange && onChange(e)
                            }}
                        >
                            {data.radioData.map((unit, index) => (
                                <Fragment key={index}>
                                    <Radio 
                                        key={index} 
                                        value={unit.value} 
                                        style={data.align == 'column' && data.radioData.length-1 !== index ? {marginBottom: 5} : {}} >{unit.label}</Radio> 
                                    {data.align == 'column' && data.radioData.length-1 !== index && <br/>}
                                </Fragment>
                            ))}
                        </Radio.Group>
                        {(touched && touched[field.name] && errors && errors[field.name]) && <font color='#cf1613'>{errors[field.name]}</font>}
                    </>
                )}
            </Field>
        )

        case 'datepicker' : 
        if (data &&  data == 'range') {
            return (
                <Field name={name}>
                {({field, form : {touched, errors, setFieldValue}}) => (
                    <>
                        <DatePicker.RangePicker
                            {...field}
                            style={style}
                            format={dateFormat}
                            defaultValue={dateValue}
                            disabledDate={disabledDate??false}
                            onChange={(datejs) => { 
                                setFieldValue(field.name, datejs)
                                onChange && onChange(datejs)
                            }}
                        />
                        <font color='#cf1613'>{(touched && touched[field.name] && errors && errors[field.name]) && errors[field.name]}</font>
                    </>
                )}
                </Field>
            )
        }
        else {
            return (
                <Field name={name}>
                {({field, form : {touched, errors, setFieldValue}}) => (
                    <>
                        <DatePicker
                            {...field}
                            style = {style}
                            disabled={disabled}
                            disabledDate={disabledDate??false}
                            onChange={(datejs) => {
                                setFieldValue(field.name, datejs)
                                onChange && onChange(datejs)
                            }}
                            value={moment.isMoment(field.value) ? field.value : (field.value === null || field.value === undefined || field.value === '') ? moment() : moment(field.value, 'YYYY-MM-DD')}
                            
                        />
                        <font color='#cf1613'>{(touched && touched[field.name] && errors && errors[field.name]) && errors[field.name]}</font>
                    </>
                    
                )}
                </Field>
            )
        }

        case 'etc' : return (<>{children}</>)

        case 'textarea': 
        return (
            <Field name={name}>
                {({field, form: { touched, errors, setFieldValue}, meta}) => (
                <>
                    <Input.TextArea
                        style = {{...{minHeight: '60px', height: '100%'}, ...style}}
                        placeholder = {placeholder}
                        readOnly = {readOnly}
                        disabled = {disabled}
                        {...field}
                        onChange={(e) => {
                            setFieldValue(field.name, e.target.value)
                            onChange && onChange(e)
                        }}
                    />
                    {extraCompo && extraCompo}
                </>
                )}
            </Field>
        )

        default:
        return (
            <Field name={name}>
                {({field, form : {touched, errors}, meta}) => (
                <>
                    <Input 
                        name = {field.name}
                        status = {(touched && touched[field.name] && errors && errors[field.name]) !== undefined ? 'error' : ''}
                        readOnly = {readOnly}
                        disabled = {disabled}
                        style = {style}
                        placeholder = {placeholder}
                        value       = {value}
                        {...field}
                        onChange={(val) => {
                            onChange == (() => {}) ? onChange(val) : field.onChange(val)
                        }}
                    />
                    {extraCompo && extraCompo}
                    <font style={fontStyle} color='#cf1613'>{(touched && touched[field.name] && errors && errors[field.name]) && errors[field.name]}</font>
                </>
                )}
            </Field>
        )
    }
}))

export const transformAddress = (data, zipcode, address, detailAddress) => {
    let addressData = {
        fullAddress : {
            zipcode : '',
            fullAddress : ''
        },
        detailAddress : ''
    }
    addressData.fullAddress.zipcode = data[zipcode] ? data[zipcode] : ''
    addressData.fullAddress.fullAddress = data[address] ? data[address] : ''
    addressData.detailAddress = data[detailAddress] ? data[detailAddress] : ''

    data[address] = addressData
    delete data[zipcode]
    delete data[detailAddress]

    return data
}

export const decodeTransformAddress = (data, zipcode, address, detailAddress) => {
    data[zipcode] = data[address].fullAddress.zipcode
    data[detailAddress] = data[address].detailAddress
    data[address] = data[address].fullAddress.fullAddress

    return data
}

// export const VirtualTable = (props) => {
//     console.log(props)
//     const { columns, scroll} = props;
//     const [tableWidth, setTableWidth] = React.useState(500);
//     const widthColumnCount = columns.filter(({ width }) => !width).length;
//     const gridRef = React.useRef();
//     const mergedColumns = columns.map((column) => {
//       if (column.width) {
//         return column;
//       }
//       return {
//         ...column,
//         width: Math.floor(tableWidth / widthColumnCount),
//       };
//     });
//     const [connectObject] = React.useState(() => {
//       const obj = {};
//       Object.defineProperty(obj, 'scrollLeft', {
//         get: () => {
//           if (gridRef.current) {
//             return gridRef.current?.state?.scrollLeft;
//           }
//           return null;
//         },
//         set: (scrollLeft) => {
//           if (gridRef.current) {
//             gridRef.current.scrollTo({
//               scrollLeft,
//             });
//           }
//         },
//       });
//       return obj;
//     });
//     const resetVirtualGrid = () => {
//       gridRef.current.resetAfterIndices({
//         columnIndex: 0,
//         shouldForceUpdate: true,
//       })
//     };
//     React.useEffect(() => resetVirtualGrid, [tableWidth]);
//     const renderVirtualList = (rawData, { scrollbarSize, ref, onScroll }) => {
//         console.log("rawData", rawData)
//         console.log("scrollbarSize", scrollbarSize)


        
//       ref.current = connectObject;
//       const totalHeight = rawData.length * 54;
//       return (
//         <Grid
//           ref={gridRef}
//           className="virtual-grid"
//           columnCount={mergedColumns.length}
//           columnWidth={(index) => {
//             const { width } = mergedColumns[index];
//             return totalHeight > scroll?.y && index === mergedColumns.length - 1
//               ? width - scrollbarSize - 1
//               : width;
//           }}
//           height={scroll.y}
//           rowCount={rawData.length}
//           rowHeight={() => 54}
//           width={tableWidth}
//           onScroll={({ scrollLeft }) => {
//             onScroll({
//               scrollLeft,
//             });
//           }}
//         >
//           {({ columnIndex, rowIndex, style }) => (
//             <div
//               style={{
//                 ...style,
//                 boxSizing: 'border-box',
//               }}
//             >
//               {rawData[rowIndex][mergedColumns[columnIndex].dataIndex]}
//             </div>
//           )}
//         </Grid>
//       );
//     };
//     return (
//             <Table
//                 {...props}
//                 className="virtual-table"
//                 columns={columns}
//                 pagination={false}
//                 components={{
//                     body: renderVirtualList,
//                 }}
//             />
//     )
//   }

export default FormikInput
