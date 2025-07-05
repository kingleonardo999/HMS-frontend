import { $get, $post } from '../utils/request';
import { ElNotification } from 'element-plus'

interface LoginParams {
  loginId: string; // 登录名
  loginPwd: string; // 登录密码
}

interface LoginResponse {
  success: boolean; // 是否登录成功
  message: string; // 提示信息
  token?: string; // 登录成功后返回的 token
}

// 登录方法
export const $login = async (params:LoginParams) => {
  try {
    let ret:LoginResponse = await $post('/admin/login', params);
    if (ret.success) {
      // 登录成功后将 token 存入浏览器缓存中
      sessionStorage.setItem('token', ret.token? ret.token : '');
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
  } catch (error: any) {
    ElNotification({
        title: '通知',
        message: error.response?.data?.message || error.message || '请求失败',
        type: 'error',
      })
    return false;
  }
}

// 获取用户信息
export const $getOne = async (params:object) => {
  try {
    let ret = await $get('/admin/getOne', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '获取用户信息失败'
    };
  }
}

// 获取用户列表
export const $list = async (params:object) => {
  try {
    let ret = await $get('/admin/list', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '获取用户列表失败'
    };
  }
}

interface addParams {
  loginId: string; // 登录名
  loginPwd: string; // 登录密码
}
// 添加用户
export const $add = async (params: addParams) => {
  try {
    let ret = await $post('/admin/add', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '网络请求失败'
    };
  }
}

// 删除用户
export const $delete = async (params: object) => {
  try {
    let ret = await $post('/admin/delete', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '删除用户失败'
    };
  }
}

// 更新用户
export const $update = async (params: object) => {
  try {
    let ret = await $post('/admin/update', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '网络请求失败'
    };
  }
}

interface resetPwdParams {
  loginId: string; // 登录名
  loginPwd: string; // 登录密码
  newLoginPwd: string; // 新登录密码
}
// 修改密码
export const $resetPwd = async (params: resetPwdParams) => {
  try {
    let ret = await $post('/admin/resetPwd', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '修改密码失败'
    };
  }
}