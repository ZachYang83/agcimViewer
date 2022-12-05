import axios from 'axios';
import store from '../store/index';
import qs from 'qs';
import { setCookie, getCookie } from './cookies'



let _token = getCookie('token');
let _user = getCookie('user');
if (_user) {
  _user = JSON.parse(_user)
}
// localStorage.removeItem('token');
/** 
 * 请求失败后的错误统一处理 
 * @param {Number} status 请求失败的状态码
 */
const errorHandle = (status, other) => {

  switch (status) {
    // 401: 未登录状态，跳转登录页
    case 401:
      // localStorage.removeItem('token');
      //openLogin();//401直接调登录页面


      // window.location.href = window.location.protocol + "//" + window.location.host + '/#/login'


      // toLogin();
      break;
    // 403 token过期
    // 清除token并跳转登录页
    case 403:
      // localStorage.removeItem('token');
      // store.commit('loginSuccess', null);
      // setTimeout(() => {
      //   toLogin();
      // }, 1000);
      break;
    // 404请求不存在
    case 404:
      // tip('请求的资源不存在');
      break;
    default:
  
  }
}

var instance = axios.create({
  timeout: 1000 * 10,
  withCredentials:false,
});

instance.defaults.retry = 4;
instance.defaults.retryDelay = 500;
instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset="ISO-8859-1"';
instance.defaults.headers.post['Accept'] = 'application/json; charset=utf-8';
instance.defaults.headers.common['Authorization'] = _token;


/** 
 * 请求拦截器 
 */
// instance.interceptors.request.use(
//   config => {
//     // 登录流程控制中，根据本地是否存在token判断用户的登录情况        
//     // 但是即使token存在，也有可能token是过期的，所以在每次的请求头中携带token        
//     // 后台根据携带的token判断用户的登录情况，并返回给我们对应的状态码        
//     // 而后我们可以在响应拦截器中，根据状态码进行一些统一的操作。        
//     const token = store.state.token;
//     token && (config.headers.Authorization = token);
//     return config;
//   },
//   error => Promise.error(error));


// 响应拦截器
instance.interceptors.response.use(
  res => res.status === 200 ? Promise.resolve(res.data) : Promise.reject(res),
  error => {
    const { config, code, message, response } = error
    if (response) {
      // 请求已发出，但是不在2xx的范围 
      errorHandle(response.status, response.data.message);
      return Promise.reject(response);
    } else {
      // 处理断网的情况
      // eg:请求超时或断网时，更新state的network状态
      // network状态在app.vue中控制着一个全局的断网提示组件的显示隐藏
      // 关于断网组件中的刷新重新获取数据，会在断网组件中说明
      if (code === 'ECONNABORTED' || message === 'Network Error') {
        console.warn(`请求超时，将在${instance.defaults.retryDelay / 1000 }秒后重试`)
        return new Promise(resolve => {
          setTimeout(async _ => {
            resolve(await instance.request(config))
            },instance.defaults.retryDelay) // 设置发送间隔
          })
      }else{
        return Promise.reject(error)
      }
    }
  });


export async function toLogin(param) {

  let defualtParam = {
    deviceType: "normal",
    isApp: "true",
    orgId: "A"
  };
  let p = Object.assign({}, defualtParam, param);
  let url = '/opus-front-sso/authentication/form';
  let res = await instance.post(url, qs.stringify(p), {
    headers: {
      "Authorization": 'Basic b3B1cy1yZXN0Om9wdXMtcmVzdDEyMw==',
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });

  const access_token = res.content.access_token;
  const tokenValue = res.content.token_type + " " + access_token;
  setCookie("token", tokenValue);
  setCookie("user", JSON.stringify(res.content.opusLoginUser.user));
  //設置請求頭
  instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset="ISO-8859-1"';
  instance.defaults.headers.post['Accept'] = 'application/json; charset=utf-8';
  instance.defaults.headers.common['Authorization'] = getCookie('token');
  return res
}

export async function loginOut() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setCookie("user", "", -1)
  setCookie("token", "", -1)
  location.reload();

}
export async function toRegistered(param) {
  let url = "/agcloud/agsupport/om/users/saveOpuOmUser?pId=210&type=o";
  let res = await axios.post(encodeURI(url), param);
  return res.data;
}


export default instance;