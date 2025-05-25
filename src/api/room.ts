import { $get, $post, $postDelay, showLoading, hideLoading } from '../utils/request'

// 房间列表
export const $list = async (params: any) => {
  let ret = await $get('/room/list', params)
  return ret
}

// 房间详情
export const $getDetail = async (params: any) => {
  let ret = await $get('/room/detail', params)
  return ret
}

// 添加房间
export const $add = async (data: any) => {
  showLoading()
  let ret = await $postDelay('/room/add', data)
  hideLoading()
  return ret
}

// 修改房间
export const $update = async (data: any) => {
  showLoading()
  let ret = await $postDelay('/room/update', data)
  hideLoading()
  return ret
}

// 删除房间
export const $delete = async (data: any) => {
  let ret = await $post('/room/delete', data)
  return ret
}

// 房间状态列表
export const $statusList = async () => {
  let ret = await $get('/room/statusList')
  return ret
}