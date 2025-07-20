import { $get, $post } from "../utils/request";

export const $add = async (data: object) => {
  try {
    let ret = await $post("/order/add", data);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || "添加订单失败",
    };
  }
};

export const $list = async (data: object) => {
  try {
    let ret = await $get("/order/list", data);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || "获取订单列表失败",
    };
  }
};

export const $getDetail = async (data: object) => {
  try {
    let ret = await $get("/order/detail", data);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || "获取订单详情失败",
    };
  }
};

export const $liveIn = async (data: object) => {
  try {
    let ret = await $post("/order/live", data);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || "删除订单失败",
    };
  }
};

export const $update = async (data: object) => {
  try {
    let ret = await $post("/order/update", data);
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || "更新订单失败",
    };
  }
};