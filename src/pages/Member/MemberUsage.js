/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback, useEffect, useMemo } from 'react';
import { Table, Form, Drawer, Button } from 'antd';
import { observer, useLocalStore } from 'mobx-react';
import { toJS } from 'mobx';
import moment from 'moment';

import useStore from '@stores/useStore';
import { validateMessages } from '@utils/customFormValidator';


const MemberUsage = observer(
  ({ usageOpen, refetch, propData = {}, handleUsage, setLoading }) => {
    // const [form] = Form.useForm();

    const { commonStore } = useStore();
    const state = useLocalStore(() => ({
      list:  [],
      categories: [],
      get categoriesVal() {
        return toJS(state.categories);
      },
    }));

    const handleClose_dr = useCallback(() => {
      // form.resetFields();
      handleUsage(false)();
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
          title: '작업구분',
          dataIndex: 'GML_WORK',
          key: 'mem_work',
          align: 'center',
        },
        {
          title: '작업 일시',
          dataIndex: 'GML_WORK_DT',
          key: 'mem_work_tile',
          align: 'center',
        },
        {
          title: 'IP',
          dataIndex: 'GML_IP',
          key: 'mem_ip_addr',
          align: 'center',
        },
      ],
      [],
    );

    return (
      <Drawer
        title={`사용 기록`}
        visible={usageOpen}
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

export default MemberUsage;
