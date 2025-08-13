<template>
  <div class="login">
    <div class="background-overlay"></div>
    <div class="login-container">
      <div class="login-card">
        <div class="card-header">
          <div class="logo-section">
            <div class="logo-icon">
              <el-icon class="hotel-icon">
                <House />
              </el-icon>
            </div>
            <h1>酒店管理系统</h1>
            <p>Hotel Management System</p>
          </div>
        </div>

        <div class="card-body">
          <el-form ref="formRef" :model="formData" status-icon :rules="rules" label-width="0" class="login-form"
            @keyup.enter="submitForm(formRef)">
            <el-form-item prop="loginId">
              <div class="input-wrapper">
                <el-icon class="input-icon">
                  <User />
                </el-icon>
                <el-input v-model="formData.loginId" placeholder="请输入账号" size="large" class="login-input" />
              </div>
            </el-form-item>

            <el-form-item prop="loginPwd">
              <div class="input-wrapper">
                <el-icon class="input-icon">
                  <Lock />
                </el-icon>
                <el-input v-model="formData.loginPwd" type="password" show-password placeholder="请输入密码" size="large"
                  class="login-input" />
              </div>
            </el-form-item>

            <el-form-item class="form-actions">
              <el-button type="primary" size="large" class="login-btn" @click="submitForm(formRef)" :loading="loading">
                <el-icon class="btn-icon" v-if="!loading">
                  <Right />
                </el-icon>
                {{ loading ? '登录中...' : '立即登录' }}
              </el-button>
              <el-button size="large" class="cancel-btn" @click="resetForm(formRef)">
                取消
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="card-footer">
          <div class="footer-links">
            <span class="link-item">忘记密码?</span>
            <span class="link-divider">|</span>
            <span class="link-item">联系管理员</span>
          </div>
          <p class="copyright">
            © 2025 Hotel Management System.
            <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer" class="icp-link">
              蜀ICP备2025157168号
            </a>
          </p>
        </div>
      </div>

      <div class="welcome-section">
        <div class="welcome-content">
          <h2>欢迎使用</h2>
          <h3>酒店信息管理平台</h3>
          <div class="feature-list">
            <div class="feature-item">
              <el-icon class="feature-icon">
                <Check />
              </el-icon>
              <span>高效的房间管理</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon">
                <Check />
              </el-icon>
              <span>智能的订单处理</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon">
                <Check />
              </el-icon>
              <span>完善的客户服务</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon">
                <Check />
              </el-icon>
              <span>实时的数据分析</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 导入组合式API
import { onMounted, reactive, ref, onUnmounted } from 'vue'
// 导入路由器
import { useRouter } from 'vue-router'
// 导入全局状态管理
import useUser from '../store/user'
// 导入element-plus的类型和消息组件
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
// 导入图标
import { House, User, Lock, Right, Check } from '@element-plus/icons-vue'

import { $getOne, $login } from '../api/admin'

// 返回路由器对象
const router = useRouter()

// 定义一个用户状态管理对象
const userStore = useUser()

// 定义一个ref对象，绑定表单
const formRef = ref<FormInstance>()

// 登录加载状态
const loading = ref(false)

// 定义一个响应式对象，绑定表单数据
const formData = reactive({
  loginId: '',
  loginPwd: '',
})

// 验证账号
const validateLoginId = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入账号'))
  } else {
    callback()
  }
}

// 验证密码
const validateLoginPwd = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    callback()
  }
}

// 验证对象
const rules = reactive<FormRules<typeof formData>>({
  loginId: [{ validator: validateLoginId, trigger: 'blur' }],
  loginPwd: [{ validator: validateLoginPwd, trigger: 'blur' }],
})

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  const valid = await formEl.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    let ret = await $login(formData)
    if (ret) {
      // 登录成功后获取用户信息
      let userInfo = await $getOne({ loginId: formData.loginId })
      if (userInfo && userInfo.success && userInfo.data) {
        userStore.setUser(userInfo.data)
        router.push('/index')
      } else {
        // 获取用户信息失败
        console.error('获取用户信息失败:', userInfo?.message)
        ElMessage.error('获取用户信息失败，请重新登录')
      }
    }
    // 如果ret为false，$login函数已经显示了错误信息，这里不需要额外处理
  } catch (error) {
    console.error('登录过程中发生错误:', error)
    ElMessage.error('登录过程中发生错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

// 处理窗口大小变化
const handleResize = () => {
  // 强制重新计算布局
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  document.documentElement.style.setProperty('--vw', `${window.innerWidth * 0.01}px`);
};

onMounted(() => {
  if (userStore.user.loginId) {
    router.push('/index')
  }

  // 初始化视口单位
  handleResize();
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
})

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener('resize', handleResize);
})
</script>

<style scoped lang="scss">
.login {
  width: 100vw;
  height: 100vh;
  min-width: 100vw;
  min-height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.login-container {
  display: flex;
  max-width: 1200px;
  width: 100%;
  height: 600px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: relative;
  z-index: 1;
  animation: slideInUp 0.8s ease-out;
}

.login-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  text-align: center;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
  }

  .logo-section {
    position: relative;
    z-index: 2;

    .logo-icon {
      margin-bottom: 20px;

      .hotel-icon {
        font-size: 48px;
        background: rgba(255, 255, 255, 0.2);
        padding: 20px;
        border-radius: 50%;
        backdrop-filter: blur(10px);
      }
    }

    h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: 600;
      font-family: 'hetang', sans-serif;
    }

    p {
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
      letter-spacing: 1px;
    }
  }
}

.card-body {
  flex: 1;
  padding: 40px;
  display: flex;
  align-items: center;
}

.login-form {
  width: 100%;

  .el-form-item {
    margin-bottom: 25px;

    &.form-actions {
      margin-bottom: 0;
      margin-top: 30px;

      :deep(.el-form-item__content) {
        display: flex;
        gap: 15px;
      }
    }
  }
}

.input-wrapper {
  position: relative;
  width: 100%;

  .input-icon {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #a0aec0;
    font-size: 18px;
    z-index: 2;
  }

  .login-input {
    width: 100%;

    :deep(.el-input__wrapper) {
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      border: 2px solid transparent;
      transition: all 0.3s ease;
      width: 100%;

      &:hover {
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.15);
      }

      &.is-focus {
        border-color: #667eea;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.25);
      }
    }

    :deep(.el-input__inner) {
      padding-left: 45px;
      font-size: 16px;
    }
  }
}

.login-btn {
  flex: 1;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;

  .btn-icon {
    margin-right: 8px;
    font-size: 18px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

.cancel-btn {
  flex: 1;
  height: 50px;
  border-radius: 12px;
  background: #f8f9fa;
  border: 2px solid #e1e8ed;
  color: #5a6c7d;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
}

.card-footer {
  padding: 20px 40px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;

  .footer-links {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 15px;

    .link-item {
      color: #667eea;
      font-size: 14px;
      cursor: pointer;
      transition: color 0.3s ease;

      &:hover {
        color: #764ba2;
      }
    }

    .link-divider {
      margin: 0 15px;
      color: #cbd5e0;
    }
  }

  .copyright {
    text-align: center;
    color: #a0aec0;
    font-size: 12px;
    margin: 0;
  }
}

.welcome-section {
  flex: 1;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="welcome-pattern" width="50" height="50" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="2" fill="%23667eea" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23welcome-pattern)"/></svg>');
  }

  .welcome-content {
    text-align: center;
    position: relative;
    z-index: 2;

    h2 {
      color: #2d3748;
      font-size: 36px;
      font-weight: 700;
      margin: 0 0 10px 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    h3 {
      color: #4a5568;
      font-size: 20px;
      font-weight: 500;
      margin: 0 0 40px 0;
      font-family: 'hetang', sans-serif;
    }

    .feature-list {
      .feature-item {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin-bottom: 20px;

        .feature-icon {
          color: #667eea;
          font-size: 18px;
          margin-right: 12px;
          background: rgba(102, 126, 234, 0.1);
          padding: 8px;
          border-radius: 50%;
        }

        span {
          color: #4a5568;
          font-size: 16px;
          font-weight: 500;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .login-container {
    max-width: 90%;
    height: auto;
    flex-direction: column;
  }

  .welcome-section {
    order: -1;
    min-height: 200px;

    .welcome-content {
      h2 {
        font-size: 28px;
      }

      h3 {
        font-size: 18px;
        margin-bottom: 20px;
      }

      .feature-list {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;

        .feature-item {
          margin-bottom: 0;
          justify-content: center;
        }
      }
    }
  }

  .card-header {
    padding: 30px;

    .logo-section {
      .logo-icon .hotel-icon {
        font-size: 40px;
        padding: 15px;
      }

      h1 {
        font-size: 24px;
      }
    }
  }

  .card-body {
    padding: 30px;
  }

  .card-footer {
    padding: 20px 30px;
  }
}

@media (max-width: 768px) {
  .login {
    padding: 20px;
  }

  .login-container {
    max-width: 100%;
    border-radius: 15px;
  }

  .welcome-section .welcome-content .feature-list {
    grid-template-columns: 1fr;
  }
}

// 动画效果
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 输入框焦点动画
.input-wrapper .login-input {
  :deep(.el-input__wrapper) {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 12px;
      opacity: 0;
      background: linear-gradient(135deg, #667eea, #764ba2);
      z-index: -1;
      transition: opacity 0.3s ease;
    }

    &.is-focus::before {
      opacity: 0.1;
    }
  }
}

.copyright {
  text-align: center;
  color: #a0aec0;
  font-size: 12px;
  margin: 0;
  
  .icp-link {
    color: #667eea;
    text-decoration: none;
    transition: all 0.3s ease;
    
    &:hover {
      color: #667eea;
      text-decoration: underline;
    }
  }
}
</style>