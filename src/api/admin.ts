import { $get, $post, $postDelay } from '../utils/request';
import { md5 } from 'md5js';
import { ElNotification } from 'element-plus'

interface LoginParams {
  loginId: string; // 登录名
  loginPwd: string; // 登录密码
}

interface LoginResponse {
  success: boolean; // 是否登录成功
  message: string; // 提示信息
  [key:string]: any; // 提示信息
}

// 登录方法
export const $login = async (params:LoginParams) => {
  // 对密码进行 md5 加密
  params.loginPwd = md5(md5(params.loginPwd, 32).split('').reverse().join(''), 32);
  let ret:LoginResponse = await $post('/admin/login', params);
  if (ret.success) {
    // 登录成功后将 token 存入浏览器缓存中
    sessionStorage.setItem('token', ret.token);
    // sessionStorage.setItem 在浏览器关闭后会自动清除
    // localStorage.setItem 永久存储
    ElNotification({
      title: '通知',
      message: ret.message,
      type: 'success',
    });
  } else {
    ElNotification({
      title: '通知',
      message: ret.message,
      type: 'error',
    })
  }
  return ret.success;
}

// 获取用户信息
export const $getOne = async (params:object) => {
  let ret = await $get('/admin/getOne', params);
  return ret;
}

// 获取用户列表
export const $userList = async (params:object) => {
  let ret = await $get('/admin/list', params);
  return ret;
}

interface addParams {
  loginId: string; // 登录名
  loginPwd: string; // 登录密码
}
// 添加角色
export const $add = async (params: addParams) => {
  // 加密密码
  params.loginPwd = md5(md5(params.loginPwd, 32).split('').reverse().join(''), 32);
  let ret = await $postDelay('/admin/add', params);
  return ret;
}

// 删除角色
export const $delete = async (params: object) => {
  let ret = await $post('/admin/delete', params);
  return ret;
}

// 更新角色
export const $update = async (params: object) => {
  let ret = await $postDelay('/admin/update', params);
  return ret;
}