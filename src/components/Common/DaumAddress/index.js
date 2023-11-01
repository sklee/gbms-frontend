/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useCallback ,useEffect} from 'react';
import DaumPostcode from 'react-daum-postcode';

import { Button,Space } from 'antd';
import { inject, observer, useLocalStore } from 'mobx-react';
import styled from 'styled-components';

import CustomModal from '@components/Common/CustomModal';

const Wrapper = styled.div`
  width: 100%;
  margin-top: 30px;
`;

const DaumAddress = ({ commonStore }) => {
  const handleClose = useCallback(() => {
    commonStore.postVisible = false
  }, []);

  const handleComplete = useCallback((data) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress +=
          extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }

    commonStore.setFormAddressFunc({
      "zipcode"     : data.zonecode, 
      "fullAddress" : fullAddress
    })

    handleClose()
  },[],);

  console.log(commonStore.postVisible)
  return (
    <>
      <Space/>
      <CustomModal visible={commonStore.postVisible} onCancel={handleClose} footer={null}>
        <Wrapper>
          <DaumPostcode onComplete={handleComplete}/> 
        </Wrapper>
      </CustomModal>
    </>
  );
}

export default inject('commonStore')(observer(DaumAddress))
