import { observable, action } from 'mobx';
import axios from 'axios';
import moment from 'moment';
import Cookies from 'js-cookie';
import { toJS } from 'mobx';
import { Modal } from 'antd';

class CommonStore {
  @observable baseApiUrl = '/';
  @observable user = null;
  @observable menus = [];
  @observable menuOpenKeys = [];
  @observable menuSelectedKeys = ['home'];
  @observable loading = false;
  @observable roles = [];
  @observable apiURL = process.env.REACT_APP_API_URL +'/api/v1';
  @observable cookieCheckIntervalKey = '';
  @observable postVisible = false;
  @observable setFormAddressFunc = () => { };
  @observable shipSaleViewGrid = [];
  @observable shipSaleObjectList = [];
  
  constructor() {
    if (process.env.NODE_ENV === 'production') {
      this.baseApiUrl = '/';
    }
  }
  
  @action updateShipSaleObjectList = (newData) => {
    this.shipSaleObjectList = newData;
  }
  @action updateShipSaleViewGrid = (newData) => {
    this.shipSaleViewGrid = newData;
  }

  @action setCookieCheckIntervalKey = (value) => {
    this.cookieCheckIntervalKey = value
  }

  /** JSON type
   * method = 'GET',
   * url,
   * data,
   * responseType,
   * headers = {'Content-type' : 'application/json'}, 
   * withCredentials = true, 
   * afterAjaxSuccessFunction = false, 
   * afterAjaxErrorFunction = false */
  @action handleApi = ({
    method = 'GET',
    url,
    data,
    responseType,
    headers = {'Content-type' : 'application/json'}, 
    withCredentials = true, 
    afterAjaxSuccessFunction = false, 
    afterAjaxErrorFunction = false
  }) => {
    return new Promise(async (resolve) => {
      const opt = { 
        method : method, 
        url: `${this.apiURL}${url}` , 
        withCredentials : withCredentials
      }

      if (method) {
        opt.method = method
      }
      if (data) {
        // GET 방식의 경우 받아온 데이터를 직렬화하여 url에 추가한다. 
        if (method === 'GET') {
          opt.url += '?'
          Object.entries(data).forEach(dataArr => {
            opt.url += `${dataArr[0]}=${dataArr[1]}&`
          })
        }
        // POST는 그냥 보낸다.
        else {
          opt.data = data;
        }
      }
      if (responseType) {
        opt.responseType = responseType;
      }
      if (headers) {
        opt.headers = headers;
      } 
      else {
        opt.headers = {};
      }
      if(url.includes('http')){
        opt.url = url;
      }
      
      const res = await axios(opt).catch(function (error) {

        if (afterAjaxErrorFunction) {
          afterAjaxErrorFunction(error)
        }
        else {
          // catch 발생 시 modal창으로 표시
          Modal.error({
            title: '오류가 발생했습니다. 재시도해주세요.',
            content: '오류코드:' + error.response.status,
          })
        }
      })
      if (res) {
        // 일단 api 호출에 성공했으면 login check는 재생성 (로그아웃 api일 때는 ㄴㄴ)
        opt.url !== '/Logout' && this.refreshCookie()
        
        if (afterAjaxSuccessFunction) {
          resolve(afterAjaxSuccessFunction(res))
        }
        else {
          // api 서버단 오류도 modal창 표시
          if (res.data.success === false) {
            Modal.error({
              title: '오류가 발생했습니다.',
              content: '오류코드:' + res.data.message,
            });
          }
          else {
            resolve(res.data);
          }
        }
      }
    })
  }

  @action refreshCookie = () => {
    // 백엔드에서 세션 유지가 2시간동안 된다고 하니까
    // 쿠키 (재)생성 - 1시간 40분짜리 (2시간 - 체크 주기 10분 - 오차범위 10분)
    let settingDate = new Date().getTime()
    settingDate += 100 * 60 * 1000
    Cookies.set('logincheck', 'Y', { expires: new Date(settingDate) } )
    //쿠키로 로그인체크하기(y)
  }

  @action checkCookie = () => {
    // 현재 components/layout/index.js 에서 interval 기동 중
    if (Cookies.get('logincheck') === undefined) {
      clearInterval(this.cookieCheckIntervalKey)
      return false
    }
    else {
      return true
    }
  }

  @action checkUserData = async () => {
    return await this.handleApi({
      method : 'POST', 
      url : '/login-check', 
      afterAjaxSuccessFunction : (res) => {
        if (res.status === 200) {
          if (res.statusText !== "OK") {
            return false
          }
          else if (res?.data?.message == 'Unauthenticated.') {
            return false
          }
          else {
            return res.data
          }
        }
        else {
          return false
        }
      }, 
      afterAjaxErrorFunction : () => {
        console.log("ERROR EXCEPTION")
      }
    })
    .then((result) => {
      return result
    })
    .catch(() => {
      return false
    })
  }

  @action logout = () => {
    // 로그인 쿠키가 없다면 api 호출 시 오류 발생한다. 
    // logout api 실행하지 않음 (다시 로그인하면 갱신되니까)
    if (Cookies.get('logincheck') === undefined) {
      clearInterval(this.cookieCheckIntervalKey)
      // 로그아웃 Modal 띄운다.
      Modal.success({
        content: '로그아웃 되었습니다.',
        onOk() {
          // 로그인 화면으로 이동
          window.location.replace('/Login');
        },
      });
    }
    else {
      // 서버에 유지 중일 수 있는 로그인 세션 해제 api 호출
      this.handleApi({
        method : 'POST', 
        url : '/logout',
        headers : {
            'Content-type'  : 'application/json',
            'Accept'        : 'application/json'
        }, 
        withCredentials : true
      }).then(() => {
        // 남아 있을 수 있는 Cookie 해제
        Cookies.remove('logincheck');
        clearInterval(this.cookieCheckIntervalKey)
        // 로그아웃 Modal 띄운다.
        Modal.success({
          content: '로그아웃 되었습니다.',
          onOk() {
            // 로그인 화면으로 이동
            window.location.replace('/Login');
          },
        });
      })
    }
  }

  @action getServerNow = async () => {
    const res = await axios.get(`${this.baseApiUrl}/getServerNow`);
    return res ? moment(res.data) : moment();
  }

  @action checkRole = (item, checkType) => {
    if (this.user && this.user.mem_is_admin) {
      return true;
    }

    const roles = toJS(this.roles);

    let f;
    if (item.role_type === 'menu') {
      f = roles.find((m) => m.menu_id === item.id);
    } else if (item.role_type === 'board') {
      f = roles.find((m) => m.board_id === item.board_id);
    }

    if (f) {
      if (this.user && this.user.mem_level >= f[checkType]) {
        return true;
      }
    }
    return false;
  }
}

export default CommonStore;
