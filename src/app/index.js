import React from 'react';
import Pages from '@pages';
import axios from 'axios';
import { BrowserRouter, useHistory } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  // 기존 axios 코드 모두 commonStore로 적응한 뒤엔 삭제할 코드
  axios.defaults.withCredentials = true;
  return (
    <BrowserRouter>
      <Pages/>
    </BrowserRouter>
  );
}

export default App;
