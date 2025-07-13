import { $get, $post } from '../utils/request';

// 获取客户列表
export const $list = async (params: object) => {
  try {
    let ret = await $get('/guestRecord/list', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '获取客户列表失败',
    };
  }
};

// 添加客户
export const $add = async (params: object) => {
  try {
    let ret = await $post('/guestRecord/add', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '添加客户失败'
    };
  }
}

// 删除客户
export const $delete = async (params: object) => {
  try {
    let ret = await $post('/guestRecord/delete', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '删除客户失败'
    };
  }
}

// 获取客户信息
export const $getDetail = async (params: object) => {
  try {
    let ret = await $get('/guestRecord/detail', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '获取客户信息失败'
    };
  }
}

// 更新客户
export const $update = async (params: object) => {
  try {
    let ret = await $post('/guestRecord/update', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '更新客户失败'
    };
  }
}

// 获取房间列表
export const $getRoomList = async (params: object) => {
  try {
    let ret = await $get('/guestRecord/roomList', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '获取房间列表失败'
    };
  }
}

// 获取状态列表
export const $getStatusList = async (params: object) => {
  try {
    let ret = await $get('/guestRecord/statusList', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '获取状态列表失败'
    };
  }
}

// 结账
export const $checkout = async (params: object) => {
  try {
    let ret = await $post('/guestRecord/checkout', params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '结账失败'
    };
  }
}