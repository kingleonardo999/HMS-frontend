import { $post } from '../utils/request'

// 上传图片接口
export const $uploadImage = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return await $post('/uploads/img', formData)
}
