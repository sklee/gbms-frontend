import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const PageTitle = (props) => {
  return (
    <Title level={2} {...props}>
      {props.children}
    </Title>
  );
};

export default PageTitle;
