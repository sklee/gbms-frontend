/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, memo } from 'react';
import { Row, Col, Radio, Checkbox, Button, Space } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';
import {
  FlexGrid,
  FlexGridColumn,
  FlexGridCellTemplate,
} from '@grapecity/wijmo.react.grid';
import { toJS } from 'mobx';
import moment from 'moment';

import useStore from '@stores/useStore';
import { RESPONSIBILITIES_DATA } from '@shared/constants';

const Wrapper = styled.div`
  width: 100%;

  .table {
    width: 100%;
    margin: 0 !important;

    .ant-col {
      padding: 10px;
      border: 1px solid #eee;
      border-collapse: collapse;
    }
    .label {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #fafafa;
    }
  }
`;

const DEF_STATE = {
  roleGrid: null,
  showAllTree: false,
};

const RoleGrid = memo(
  observer(({ disabled, setRoleData }) => {
    const { commonStore } = useStore();
    const state = useLocalStore(() => ({ ...DEF_STATE }));

    const onBeginningEdit = useCallback(
      (flexGird, e) => {
        let binding = flexGird.columns[e.col].binding;
        if (!(binding in flexGird.rows[e.row].dataItem)) {
          // property not on this item?
          e.cancel = true; // can't edit!
          return;
        }

        setTimeout(() => {
          const row = flexGird.rows[e.row];
          if (row.dataItem.children && row.dataItem.children.length) {
            for (let i = row.index + 1; i < flexGird.rows.length; i++) {
              let childRow = flexGird.rows[i];
              if (childRow.level <= row.level) {
                break;
              }
              flexGird.setCellData(i, e.col, row.dataItem[binding]);
            }
          }

          if (row.index > 0) {
            const parentData = flexGird.getCellData(row.index - 1, e.col);
            if (parentData !== row.dataItem[binding]) {
              for (let i = row.index - 1; i >= 0; i--) {
                let parentRow = flexGird.rows[i];
                if (parentRow.level > row.level) {
                  break;
                }
                flexGird.setCellData(i, e.col, false);
              }
            }
          }

          setTimeout(() => {
            let value = [];
            for (let i = 0; i < flexGird.rows.length; i++) {
              value.push(flexGird.rows[i].dataItem);
            }
            if (setRoleData) {
              setRoleData(value);
            }
          }, 10);
        }, 10);
      },
      [setRoleData],
    );

    const handleChangeShowAllTree = useCallback((e) => {
      state.showAllTree = !state.showAllTree;

      if (state.showAllTree) {
        state.roleGrid.rows.forEach((row) => {
          row.isCollapsed = false;
        });
      } else {
        state.roleGrid.rows.forEach((row) => {
          if (row.level >= 1) {
            row.isCollapsed = true;
          }
        });
      }
    }, []);

    useEffect(() => {
      state.roleGrid.rows.forEach((row) => {
        row.isReadOnly = disabled ? true : false;
        if (row.level >= 1) {
          row.isCollapsed = true;
        }
      });
    }, [disabled]);

    return (
      <Wrapper>
        <FlexGrid
          initialized={(grid) => (state.roleGrid = grid)}
          itemsSource={[
            {
              label: '상품',
              readRole: false,
              writeRole: false,
              children: [
                {
                  label: '도서',
                  readRole: false,
                  writeRole: false,
                  children: [
                    { label: '종이책', readRole: false, writeRole: false },
                  ],
                },
              ],
            },
            { label: '저작권자', readRole: false, writeRole: false },
            { label: '거래처', readRole: false, writeRole: false },
          ]}
          headersVisibility="Column"
          beginningEdit={onBeginningEdit}
          childItemsPath={'children'}
          selectionMode="Row"
          allowDragging={false}
          allowResizing={false}
          allowSorting={false}
        >
          <FlexGridColumn binding="label" dataType="String" width="*">
            <FlexGridCellTemplate
              cellType="ColumnHeader"
              template={(context) => {
                return (
                  <Space>
                    <Button
                      type="text"
                      size="small"
                      onClick={handleChangeShowAllTree}
                    >
                      {state.showAllTree ? '[원래대로]' : '[전체 펼치기]'}
                    </Button>
                    <span>메뉴와 탭</span>
                  </Space>
                );
              }}
            />
          </FlexGridColumn>

          <FlexGridColumn binding="readRole" header="읽기"></FlexGridColumn>
          <FlexGridColumn binding="writeRole" header="쓰기"></FlexGridColumn>
          <FlexGridCellTemplate cellType="ColumnFooter" template={null} />
        </FlexGrid>
      </Wrapper>
    );
  }),
);

export default RoleGrid;
