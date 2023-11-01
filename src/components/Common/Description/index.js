import React from 'react';
import { Typography } from 'antd';
import { InfoCircleTwoTone } from '@ant-design/icons';
import styled from 'styled-components';
import theme from '@utils/styled-theme';

const { Text } = Typography;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Description = (props) => (
  <Wrapper {...props}>
    <InfoCircleTwoTone twoToneColor={theme.primaryColor} />
    &nbsp;
    <Text>{props.text}</Text>
  </Wrapper>
);

export default Description;
