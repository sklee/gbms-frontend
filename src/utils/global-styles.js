import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  a{
    color: inherit;
    text-decoration: none;
  }
  input, button, div, span {
    &:focus, &:active {
      outline: none;
    }
  }
  pre {
    overflow: hidden;
    white-space: pre-line;
    background: none !important;
    border: none !important;
    font-family: inherit !important;
    color: #808080 !important;
  }

  .ql-editor{
    min-height: 200px !important;
    max-height: 400px;
  }
 
  ${(props) => props.theme.breakpoint('xs', 'lg')`

  `}
`;

export default GlobalStyle;
