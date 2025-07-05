import axios from "axios";
import { baseURL_dev } from '../config/baseURL'
import { ElLoading } from 'element-plus'
import router from "../router";

// 初始化一个axios对象
const instance = axios.create({
  baseURL: baseURL_dev,
  timeout: 1000,
});

// 全局加载实例
let loadingInstance: any = null;

// 显示加载状态
export const showLoading = () => {
  if (!loadingInstance) {
    loadingInstance = ElLoading.service({
      lock: true,
      text: '正在处理中...',
      background: 'rgba(0, 0, 0, 0.7)',
    });
  }
};

// 隐藏加载状态
export const hideLoading = () => {
  if (loadingInstance) {
    loadingInstance.close();
    loadingInstance = null;
  }
};

// get请求方法
export const $get = async (url:string, params?:object) => {
  let { data } = await instance.get(url, { params: params });
  return data;
};

// post请求方法
export const $post = async (url:string, params?:object) => {
  let { data } = await instance.post(url, params);
  return data;
};

// 拦截器
// 请求拦截器
instance.interceptors.request.use(function (config){
  // 在发送请求之前做些什么
  // 每次发送请求之前都要判断是否有 token，如果有就将 token 添加到请求头中
  config.headers['Authorization'] = sessionStorage.getItem('token') || ''; // 设置请求头
  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});

// 响应拦截器
instance.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  return response;
}, function (error) {
  // 对响应错误做点什么
  if (error.response.status === 401) {
    // token 过期
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    router.push('/login');
  }
  return Promise.reject(error);
});
