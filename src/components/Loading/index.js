/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useEffect, memo } from 'react';
import { observer, useLocalStore } from 'mobx-react';
import LoadingOverlay from 'react-loading-overlay';
import styled from 'styled-components';

import useStore from '@stores/useStore';

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

const Loading = memo(
  observer(() => {
    const { commonStore } = useStore();

    const state = useLocalStore(() => ({
      loading: false,
    }));

    useEffect(() => {
      state.loading = commonStore.loading;
    }, [commonStore.loading]);

    return (
      <StyledLoader
        active={state.loading}
        spinner
        text={commonStore.loadingText ? commonStore.loadingText : 'Loading'}
      />
    );
  }),
);

export default Loading;
