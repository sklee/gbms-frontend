import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'mobx-react-lite/batchingForReactDom';
import 'moment/locale/ko';

import React from 'react';
import ReactDOM from 'react-dom';
import { ConfigProvider } from 'antd';
import ko_KR from 'antd/es/locale/ko_KR';
import { Provider as MobxProvider } from 'mobx-react';
import { ThemeProvider } from 'styled-components';
import moment from 'moment';
import * as wjcCore from '@grapecity/wijmo';
import '@grapecity/wijmo.cultures/wijmo.culture.ko';

import initializeStore from '@stores';
import theme from '@utils/styled-theme';
import GlobalStyle from '@utils/global-styles';
import * as serviceWorker from './serviceWorker';
import {validationSetting} from '@components/form/ValidationSetting'

import App from './app';

import 'react-quill/dist/quill.snow.css';
import '@node_modules/swiper/swiper-bundle.min.css';
import 'flexlayout-react/style/light.css';
import '@grapecity/wijmo.styles/wijmo.css';

moment.locale('ko');
validationSetting()

wjcCore.setLicenseKey(
  'jinear@naver.com,E723876215667293#B0Kc6Jye0ICbuFkI1pjIEJCLi4TPBd6dxRWeRpVNjlEarcHONV6QnZDOENXZBBTOEBlQmV4SjVUONxmR9lWZNFlU95mRTBTQqVmcrpnZqh6TvJURxYDUqJ6T6oHZLFENQllVSxWZa56TGNXdDdDcoZTOvZHdq5mRxE5MY3ya8gURt3mYlFEWqZlRXFHRl54b9FmUFhFVyskUz3SYShkMzIneUt4TplzLlh7a7o7Rv56RUlGdXl4Vh9UU72mWmhVQFZnZ63WVDREV5ZUcM3SR9IjapVXVzgFcpZkRhZlU98EMB5EbS9EeDZ6bVFEayRTcFdXNUBjb8kXT4NFSwNlbTFke9ZVZBpXTU9EayYnaV3SNldFMR56LyQ5TBB5QaJ6ZJFTOT3GVJpUc7YFS72mNxgjVMFTNvF7QHp4d42SU9MncWtWMvhnSTJVbrUEa4EkbhllVWhlNOZGTwIWS4R7KxFUS8dGRsZmURlVTiojITJCLiQUM7ITOwkzNiojIIJCLxcDO4EzN6ADO0IicfJye#4Xfd5nIJBjMSJiOiMkIsIibvl6cuVGd8VEIgQXZlh6U8VGbGBybtpWaXJiOi8kI1xSfiUTSOFlI0IyQiwiIu3Waz9WZ4hXRgAicldXZpZFdy3GclJFIv5mapdlI0IiTisHL3JyS7gDSiojIDJCLi86bpNnblRHeFBCI73mUpRHb55EIv5mapdlI0IiTisHL3JCNGZDRiojIDJCLi86bpNnblRHeFBCIQFETPBCIv5mapdlI0IiTisHL3JyMDBjQiojIDJCLiUmcvNEIv5mapdlI0IiTisHL3JSV8cTQiojIDJCLi86bpNnblRHeFBCI4JXYoNEbhl6YuFmbpZEIv5mapdlI0IiTis7W0ICZyBlIsIiMxMTN5ADI5IzMwEjMwIjI0ICdyNkIsICNyQDMxIDMyIiOiAHeFJCLi46bj9iclZXYuBkchVmbppmI0ISYONkIsUWdyRnOiwmdFJCLiMTOycjN6UTMyYzN8MjM7IiOiQWSiwSfiEjdxIDMyIiOiIXZ6JCLlNHbhZIOMI',
);

ReactDOM.render(
  // <React.StrictMode>
    <MobxProvider {...initializeStore()}>
      <ConfigProvider locale={ko_KR}>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <App />
        </ThemeProvider>
      </ConfigProvider>
    </MobxProvider>,
  // </React.StrictMode>,
  
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
