import { $get, $post } from "../utils/request";


export const $totalTypePrice = async () => {
  try {
    let ret = await $get('/billing/list');
    return ret;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '获取房型总价失败'
    };
  }
}