import axios from "axios";
import { baseURL_dev } from '../config/baseURL'
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import router from "../router";
import  useUser  from "../store/user";

// 初始化一个axios对象
const instance = axios.create({
  baseURL: baseURL_dev,
  timeout: 1000,
});

// 全局加载实例
let loadingInstance: any = null;

const userStore = useUser();

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
  // 2xx 状态码会执行这里
  // 例如：200 成功、201 创建成功等
  return response;
}, function (error) {
  // 非 2xx 状态码或网络错误会执行这里
  // 例如：401 未授权、404 未找到、500 服务器错误、网络超时等
  
  // 检查是否是登录请求的401错误
  if (error.config && error.config.url === '/admin/login' && error.response && error.response.status === 401) {
    // 登录失败的401错误，不需要弹出"登录过期"提示，直接传递错误
    return Promise.reject(error);
  }
  
  if (error.response && error.response.status === 401) {
    // 其他请求的token过期
    sessionStorage.removeItem('token');
    exit();
    return Promise.reject(error);
  }
  
  return Promise.reject(error);
});

// 退出系统标记，防止短时间内多次弹出
let exitDialogShowing = false;

// 退出系统
let exit = () => {
  // 如果对话框已经显示，则不再重复显示
  if (exitDialogShowing) {
    return;
  }
  
  exitDialogShowing = true;
  
  // 弹出通知框
  ElMessageBox.alert(
    '登录过期, 请重新登录',
    '系统提示',
    {
      confirmButtonText: '确定',
      type: 'warning',
      closeOnClickModal: false, // 禁止点击遮罩关闭
      showCancelButton: false, // 不显示取消按钮
    }
  ).then(() => {
    // 确定退出，清除用户信息，并跳转到登录页面
    userStore.clearUser();
    router.push('/');
    ElMessage({
      type: 'success',
      message: '退出成功',
    })
  }).catch(() => {
    // 处理取消或关闭的情况，也执行退出逻辑
    userStore.clearUser();
    router.push('/');
  }).finally(() => {
    // 重置标记
    exitDialogShowing = false;
  })
};
