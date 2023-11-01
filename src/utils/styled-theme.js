import { createBreakpoint } from 'styled-components-breakpoint';

const primaryColor = '#1014d1';
const primaryTextColor = '#fff';
const secondaryColor = '#121212';
const secondaryTextColor = '#fff';

const theme = {
  primaryColor,
  primaryTextColor,
  secondaryColor,
  secondaryTextColor,
  greyColor: '#b3b3b3',
  lightGreyColor: '#e0e0e0',
  greyIconColor: 'rgba(0,0,0,.25)',
  errColor: '#e74c3c',
  shadow: `
  -webkit-box-shadow: 0px 4px 10px 0px rgba(170, 170, 170, 1);
  -moz-box-shadow: 0px 4px 10px 0px rgba(170, 170, 170, 1);
  box-shadow: 0px 4px 10px 0px rgba(170, 170, 170, 1);
  `,
  breakpoint: createBreakpoint({
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1440,
    xxl: 1600,
    // xs: 0,
    // sm: 576,
    // md: 768,
    // lg: 992,
    // xl: 1200,
  }),

  headerFooterBg: secondaryColor,
  headerLabel: '#fff',
  dfBorder: `2px solid ${primaryColor}`,
  darkBorder: `2px solid ${secondaryColor}`,
  mainBorder: '1px solid #d5d5d5',
  contentWidth: 1020,
  bgGreyColor: '#95a5a6',
};

export default theme;
