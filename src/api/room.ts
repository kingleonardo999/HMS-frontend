import { $get, $post } from '../utils/request'

// 房间列表
export const $list = async (params: any) => {
  try {
    let ret = await $get('/room/list', params)
    return ret
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '获取房间列表失败'
    };
  }
}

// 房间详情
export const $getDetail = async (params: any) => {
  try {
    let ret = await $get('/room/detail', params)
    return ret
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '获取房间详情失败'
    };
  }
}

// 添加房间
export const $add = async (data: any) => {
  try {
    let ret = await $post('/room/add', data)
    return ret
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '添加房间失败'
    };
  }
}

// 修改房间
export const $update = async (data: any) => {
  try {
    let ret = await $post('/room/update', data)
    return ret
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '修改房间失败'
    };
  }
}

// 删除房间
export const $delete = async (data: any) => {
  try {
    let ret = await $post('/room/delete', data)
    return ret
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '删除房间失败'
    };
  }
}

// 房间状态列表
export const $statusList = async () => {
  try {
    let ret = await $get('/room/statusList')
    return ret
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '获取房间状态列表失败'
    };
  }
}