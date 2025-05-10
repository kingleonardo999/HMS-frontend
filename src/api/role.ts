import { $get, $post } from '../utils/request'

// 返回角色列表
export const $list = async () => {
  let ret = await $get('/role/list')
  return ret.data;
}

// 添加角色
export const $add = async (params: object) => {
  let ret = await $post('/role/add', params);
  return ret;
}

// 删除角色
export const $delete = async (params: object) => {
  let ret = await $post('/role/delete', params);
  return ret;
}

// 获取角色信息
export const $getOne = async (params: object) => {
  let ret = await $get('/role/getOne', params);
  return ret;
}

// 更新角色
export const $update = async (params: object) => {
  let ret = await $post('/role/update', params);
  return ret;
}