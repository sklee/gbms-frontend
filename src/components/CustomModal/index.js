import React from 'react';
import { Modal } from 'antd';
import { observer } from 'mobx-react';
import styled from 'styled-components';

const StyledModal = styled(Modal)`
  min-width: 800px;

  ${(props) => props.theme.breakpoint('xs', 'lg')`
    min-width: 100%;
  `}
`;

const CustomModal = observer((props) => {
  return <StyledModal {...props}>{props.children}</StyledModal>;
});

export default CustomModal;
