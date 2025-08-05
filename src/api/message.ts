import { $get, $post } from '../utils/request'

export const $add = async (data: object) => {
  try {
    let ret = await $post("/message/add", data);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || "添加消息失败",
    };
  }
};

export const $list = async (data: object) => {
  try {
    let ret = await $get("/message/list", data);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || "获取消息列表失败",
    };
  }
};

export const $delete = async (data: object) => {
  try {
    let ret = await $post("/message/delete", data);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || "删除消息失败",
    };
  }
};