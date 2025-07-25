import { $get, $post } from "../utils/request";

export const $dictlist = async () => {
  try {
    let ret = await $get("/dict/list");
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || "获取字典列表失败",
    };
  }
};

export const $list = async (type: string, params?: object) => {
  try {
    let ret = await $get(`/dict/${type}`, params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || "获取字典列表失败",
    };
  }
};

export const $add = async (type: string, params: object) => {
  try {
    let ret = await $post(`/dict/add${type}`, params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || "添加字典失败",
    };
  }
};

export const $delete = async (type: string, params: object) => {
  try {
    let ret = await $post(`/dict/delete${type}`, params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || "删除字典失败",
    };
  }
};

export const $update = async (type: string, params: object) => {
  try {
    let ret = await $post(`/dict/update${type}`, params);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || "更新字典失败",
    };
  }
};
