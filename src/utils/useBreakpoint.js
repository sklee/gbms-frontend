import { useState, useEffect } from 'react';
import throttle from 'lodash.throttle';

const getDeviceConfig = (width) => {
  const value = {
    xs: false,
    sm: false,
    md: false,
    lg: false,
    xl: false,
    xxl: false,
  };
  if (width < 576) {
    value.xs = true;
  } else if (width >= 576 && width < 768) {
    value.sm = true;
  } else if (width >= 768 && width < 992) {
    value.sm = true;
    value.md = true;
  } else if (width >= 992 && width < 1440) {
    value.sm = true;
    value.md = true;
    value.lg = true;
  } else if (width >= 1440 && width < 1600) {
    value.sm = true;
    value.md = true;
    value.lg = true;
    value.xl = true;
  } else if (width >= 1600) {
    value.sm = true;
    value.md = true;
    value.lg = true;
    value.xl = true;
    value.xxl = true;
  }
  return value;
};

const useBreakpoint = () => {
  const [brkPnt, setBrkPnt] = useState(() =>
    getDeviceConfig(window.innerWidth),
  );

  useEffect(() => {
    const calcInnerWidth = throttle(function () {
      setBrkPnt(getDeviceConfig(window.innerWidth));
    }, 200);
    window.addEventListener('resize', calcInnerWidth);
    return () => window.removeEventListener('resize', calcInnerWidth);
  }, []);

  return brkPnt;
};
export default useBreakpoint;
