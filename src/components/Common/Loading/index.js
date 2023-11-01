/* eslint-disable react-hooks/exhaustive-deps*/
import React from 'react';
import LoadingOverlay from 'react-loading-overlay';
import styled from 'styled-components';

const StyledLoader = styled(LoadingOverlay)`
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: ${(props) => (props.active ? 2147483647 : -1)};
  overflow: hidden;
  .MyLoader_overlay {
    background: rgba(255, 0, 0, 0.5);
  }
  &.MyLoader_wrapper--active {
    overflow: hidden;
  }
`;

const Loading = ({ loading, text, children }) => {
  return (
    <StyledLoader active={loading} spinner text={text ? text : 'Loading'}>
      {children}
    </StyledLoader>
  );
};

export default Loading;
