/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useEffect, useCallback, useState ,useLayoutEffect} from 'react';
import { Button, Col, Select} from 'antd';
import { observer } from 'mobx-react';
import moment from 'moment';

import * as wjcGridXlsx from '@grapecity/wijmo.grid.xlsx';

import { CellMaker } from "@grapecity/wijmo.grid.cellmaker";

import * as wjcCore from '@grapecity/wijmo';
import * as wjcGrid from '@grapecity/wijmo.react.grid';
import * as wjGrid from '@grapecity/wijmo.grid';
import * as wjcXlsx from '@grapecity/wijmo.xlsx';


const ExcelList = observer((props) => {
    //엑셀다운
    const handleExcel= ()=> {
        var today = moment().format('YYYY-MM-DD');

        if(props.type === "owners"){
            var text = "해외 수입 권리자";
        }else if( props.type ==="brokers"){
            var text = "중개자";
        }else if( props.type ==="contributors"){
            var text = "기여자";
        }else if(props.type ==="copyrights"){
            var text = "국내, 해외 직계약 저작권자";
        }else{
            var text = props.type
        }

        wjcGridXlsx.FlexGridXlsxConverter.saveAsync(props.excelData, {
            includeColumnHeaders: true,
            includeStyles: true,
        }, text+' 리스트_'+today+'.xlsx');
    }  
    
    //drive 엑셀
    const handleDrive= ()=> {
        var today = moment().format('YYYY-MM-DD');

        // var theGrid = new wjGrid.FlexGrid('#gridWrap', {
        //   itemsSource: state.excelData
        // });

        // var rng = new wjGrid.CellRange(0, 0, theGrid.rows.length - 1, theGrid.columns.length - 1),
        //     csv = theGrid.getClipString(rng, true, true);
        // exportFile(csv, '사용자관리 리스트_'+today+'.csv');
        //  console.log(state.excelData);
        //  var data = state.excelData.rows.dataItem;

        //  // export grid to CSV
        //   var rng = new wjGrid.CellRange(0, 0, state.excelData.rows.length - 1, state.excelData.columns.length - 1),
        //       csv = data.getClipString(rng, true, true);
        //     exportFile(csv, '사용자관리 리스트_'+today+'.csv');
    
    }

    // function exportFile(csv, fileName) {
    //     var fileType = 'txt/csv;charset=utf-8';
    //     if (navigator.msSaveBlob) { // IE 
    //         navigator.msSaveBlob(new Blob([csv], {
    //         type: fileType
    //         }), fileName);
    //     } 
    //     else {
    //         var e = document.createElement('a');
    //         e.setAttribute('href', 'data:' + fileType + ',' + encodeURIComponent(csv));
    //         e.setAttribute('download', fileName);
    //         e.style.display = 'none';
    //         document.body.appendChild(e);
    //         e.click();
    //         document.body.removeChild(e);
    //     }
    // }
    return (
        <Col xs={8} lg={8} className="topTable_right">
            {/* <Button className='ant-btn-etc' onClick={handleDrive} >Drive</Button> */}
            <Select
                defaultValue='cntPage'
                style={{width: 120}}
                options={[
                    {
                        value: 'cntPage',
                        label: '현재 페이지',
                    },
                    {
                        value: 'allPage',
                        label: '전체 페이지',
                    },
                ]}
            />
            
            <Button className='ant-btn-etc' onClick={handleExcel} style={{marginLeft:'10px'}}>다운로드</Button>
        </Col>
    );
});

export default ExcelList;
