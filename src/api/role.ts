import { $get, $post } from '../utils/request'

// 返回角色列表
export const $list = async () => {
  let ret = await $get('/role/list')
  return ret.data;
}

// 添加角色
export const $add = async (params: any) => {
  let ret = await $post('/role/add', params);
  return ret;
}