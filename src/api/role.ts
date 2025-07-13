import { $get, $post, } from '../utils/request'

// 返回角色列表
export const $list = async () => {
  try {
    let ret = await $get('/role/list')
    return ret.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '获取角色列表失败'
    };
  }
}

// 添加角色
export const $add = async (params: object) => {
  try {
    let ret = await $post('/role/add', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '添加角色失败'
    };
  }
}

// 删除角色
export const $delete = async (params: object) => {
  try {
    let ret = await $post('/role/delete', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '删除角色失败'
    };
  }
}

// 获取角色信息
export const $getOne = async (params: object) => {
  try {
    let ret = await $get('/role/getOne', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '获取角色信息失败'
    };
  }
}

// 更新角色
export const $update = async (params: object) => {
  try {
    let ret = await $post('/role/update', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '更新角色失败'
    };
  }
}