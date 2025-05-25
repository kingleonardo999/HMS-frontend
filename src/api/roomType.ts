import { $get, $post, $postDelay, showLoading, hideLoading } from '../utils/request';

// 获取房型列表
export const $list = async () => {
  let ret = await $get('/roomType/list');
  return ret;
};

// 添加房型
export const $add = async (data: object) => {
  showLoading();
  let ret = await $postDelay('/roomType/add', data);
  hideLoading();
  return ret;
};

// 修改房型
export const $update = async (data: object) => {
  showLoading();
  let ret = await $postDelay('/roomType/update', data);
  hideLoading();
  return ret;
};

// 删除房型
export const $delete = async (data: object) => {
  let ret = await $post('/roomType/delete', data);
  return ret;
};

// 获取房型详情
export const $getDetail = async (data: object) => {
  let ret = await $get('/roomType/detail', data);
  return ret;
};