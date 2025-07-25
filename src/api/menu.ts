import { $get, $post } from '../utils/request'

export const $list = async (params: object) => {
  try {
    let ret = await $get('/menu/list', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '获取菜单列表失败'
    };
  }
}

export const $add = async (params: object) => {
  try {
    let ret = await $post('/menu/add', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '添加菜单失败'
    };
  }
}

export const $delete = async (params: object) => {
  try {
    let ret = await $post('/menu/delete', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '删除菜单失败'
    };
  }
}

export const $update = async (params: object) => {
  try {
    let ret = await $post('/menu/update', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '更新菜单失败'
    };
  }
}

export const $getDetail = async (params: object) => {
  try {
    let ret = await $get('/menu/detail', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '获取菜单详情失败'
    };
  }
}

export const $menuType = async (params: object) => {
  try {
    let ret = await $get('/menu/typeList', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '获取菜单树失败'
    };
  }
}