/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo } from 'react';
import { Table, Form, Drawer, Button } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import { toJS } from 'mobx';
import moment from 'moment';

import useStore from '@stores/useStore';
import { validateMessages } from '@utils/customFormValidator';


const MemberChanged = observer(
  ({ changeOpen, refetch, propData = {}, handlechange, setLoading }) => {
    // const [form] = Form.useForm();

    const { commonStore } = useStore();
    const state = useLocalStore(() => ({
      categories: [],
      get categoriesVal() {
        return toJS(state.categories);
      },
    }));

    const handleClose_dr = useCallback(() => {
      // form.resetFields();
      handlechange(false)();
    }, []);

    const columns = useMemo(
      () => [
        {
          title: '이름',
          dataIndex: 'GM_NAME',
          key: 'mem_userid',
          align: 'center',
        },
        {
          title: '계정',
          dataIndex: 'GM_EMAIL',
          key: 'mem_email',
          align: 'center',
        },
        {
          title: '항목명',
          dataIndex: 'GMU_ITEM',
          key: 'mem_item',
          align: 'center',
        },
        {
          title: '변경전',
          dataIndex: 'GMU_BEFORE',
          key: 'mem_before',
          align: 'center',
        },
        {
          title: '변경후',
          dataIndex: 'GMU_AFTER',
          key: 'mem_after',
          align: 'center',
        },
        {
          title: '변경 적용일',
          dataIndex: 'GMU_UPD_DT',
          key: 'mem_upd_dt',
          align: 'center',
        },
        {
          title: '작업자',
          dataIndex: 'GMU_MANAGER',
          key: 'mem_upd_manager',
          align: 'center',
        },
      ],
      [],
    );

    return (
      <Drawer
        title={`변경 이력`}
        visible={changeOpen}
        closable={true}
        width='1560'
        onClose={handleClose_dr}
        forceRender={true}
        zIndex='2'
        keyboard={false}
      >
        <Table
            dataSource={propData}
            columns={columns}
            scroll={{ x: 1200 }}
            pagination={false}
            rowKey={(row) => row.mem_id}
        />
      </Drawer>
    );
  },
);

export default MemberChanged;
