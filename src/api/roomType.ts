import { $get, $post, $postDelay, showLoading, hideLoading } from '../utils/request';

// 获取房型列表
export const $list = async () => {
  try {
    let ret = await $get('/roomType/list');
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '获取房型列表失败'
    };
  }
};

// 添加房型
export const $add = async (data: object) => {
  try {
    showLoading();
    let ret = await $postDelay('/roomType/add', data);
    hideLoading();
    return ret;
  } catch (error: any) {
    hideLoading();
    return {
      success: false,
      message: error.response?.data?.message || error.message || '添加房型失败'
    };
  }
};

// 修改房型
export const $update = async (data: object) => {
  try {
    showLoading();
    let ret = await $postDelay('/roomType/update', data);
    hideLoading();
    return ret;
  } catch (error: any) {
    hideLoading();
    return {
      success: false,
      message: error.response?.data?.message || error.message || '修改房型失败'
    };
  }
};

// 删除房型
export const $delete = async (data: object) => {
  try {
    let ret = await $post('/roomType/delete', data);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '删除房型失败'
    };
  }
};

// 获取房型详情
export const $getDetail = async (data: object) => {
  try {
    let ret = await $get('/roomType/detail', data);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '获取房型详情失败'
    };
  }
};