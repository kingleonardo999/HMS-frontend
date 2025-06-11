import { ElNotification, type UploadProps } from 'element-plus'
import { $uploadImage } from '../api/file'
import { baseURL_dev } from '../config/baseURL'

// 图片URL缓存
const imageUrlCache = new Map<string, string>()

// 文件类型校验
export const validateImageFile = (file: File): boolean => {
  const imgTypes = ['image/jpeg', 'image/png', 'image/gif']
  
  if (!imgTypes.includes(file.type)) {
    ElNotification({
      title: '提示',
      message: '请上传标准的图片文件!',
      type: 'error',
    })
    return false
  }
  
  if (file.size / 1024 / 1024 > 5) {
    ElNotification({
      title: '提示',
      message: '文件大小不能超过5MB!',
      type: 'error',
    })
    return false
  }
  
  return true
}

// 判断是否为完整URL
const isFullUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://')
}

// 处理图片URL，返回完整的URL
export const processImageUrlSync = (imageData: string | number | undefined): string => {
  if (!imageData) return ''
  
  // 转换为字符串
  const imageStr = imageData.toString()
  
  // 如果是完整URL，直接返回
  if (isFullUrl(imageStr)) {
    return imageStr
  }
  
  // 直接拼接baseURL
  return baseURL_dev + '/' + imageStr.replace(/^\//, '')
}

// 清除图片URL缓存
export const clearImageUrlCache = () => {
  imageUrlCache.clear()
}

// 统一的图片上传处理函数 - 用于富文本编辑器
export const handleRichTextImageUpload = async (file: File, insertFn: Function): Promise<void> => {
  try {
    // 校验文件
    if (!validateImageFile(file)) {
      return
    }
    
    // 上传文件
    const response = await $uploadImage(file)
    const { img, success, message } = response
    
    if (success && img) {
      ElNotification({
        title: '提示',
        message: message,
        type: 'success',
      })
      
      const { id, url } = img
      let imageUrl
      
      // 判断URL是否为完整URL
      if (isFullUrl(url)) {
        imageUrl = url
      } else {
        imageUrl = baseURL_dev + '/' + url.replace(/^\//, '')
      }
      
      // 缓存URL
      const cacheKey = `img_${id}`
      imageUrlCache.set(cacheKey, imageUrl)
      
      // 插入图片到富文本编辑器
      insertFn(imageUrl, file.name, '')
    } else {
      ElNotification({
        title: '图片上传失败',
        message: message || '上传失败，请重试',
        type: 'error',
      })
    }
  } catch (error) {
    console.error('图片上传错误:', error)
    ElNotification({
      title: '图片上传失败',
      message: '网络错误，请重试',
      type: 'error',
    })
  }
}

// 创建富文本编辑器配置
export const createRichTextEditorConfig = () => {
  return {
    placeholder: '请输入内容...',
    MENU_CONF: {
      uploadImage: {
        // 自定义上传
        async customUpload(file: File, insertFn: Function) {
          await handleRichTextImageUpload(file, insertFn)
        },
        
        // 单个文件的最大体积限制，默认为 2M
        maxFileSize: 5 * 1024 * 1024, // 5M
        
        // 最高可上传几个文件，默认为 100
        maxNumberOfFiles: 10,
        
        // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
        allowedFileTypes: ['image/*'],
      }
    }
  }
}

// 统一的上传成功回调 - 用于 el-upload 组件
export const createUploadSuccessHandler = (formDataRef: any, imageUrlRef?: any): UploadProps['onSuccess'] => {
  return (response: any, uploadFile: any) => {
    const { img, success, message } = response
    if (success && img) {
      ElNotification({
        title: '提示',
        message: message,
        type: 'success',
      })
      
      const { id, url } = img
      
      // 缓存URL
      const cacheKey = `img_${id}`
      let finalUrl = url
      if (!isFullUrl(url)) {
        finalUrl = baseURL_dev + '/' + url.replace(/^\//, '')
      }
      imageUrlCache.set(cacheKey, finalUrl)
      
      // 保存ID到表单数据
      formDataRef.value.imgId = id
      
      // 如果提供了imageUrlRef，则同时更新图片URL用于显示
      if (imageUrlRef) {
        imageUrlRef.value = finalUrl
      }
    } else {
      ElNotification({
        title: '提示',
        message: message || '上传失败',
        type: 'error',
      })
    }
  }
}

// 统一的上传前校验 - 用于 el-upload 组件
export const beforeUploadHandler: UploadProps['beforeUpload'] = (rawFile) => {
  return validateImageFile(rawFile)
}

// 获取上传组件的请求头
export const getUploadHeaders = () => {
  return {
    'Authorization': sessionStorage.getItem('token') || ''
  }
}
