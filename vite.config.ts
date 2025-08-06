import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',   // 允许外部设备访问
    port: 5137,         // 如果需要，设置端口为你希望使用的端口
    strictPort: true,   // 确保端口已被占用时不切换端口
    allowedHosts: [
      'king',  // 允许 "king" 主机
    ],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000', // 开发时后端地址
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '') // 去掉 /api 前缀
      }
    }
  }
})
