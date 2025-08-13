<template>
  <div class="setpwd">
    <div class="password-change-container">
      
      <div class="form-container">
        <el-form
          ref="formRef"
          :model="formData"
          status-icon
          :rules="rules"
          label-width="0"
          class="password-form"
        >
          <el-form-item prop="loginPwd">
            <div class="input-group">
              <label class="input-label">
                <el-icon class="label-icon">
                  <Key />
                </el-icon>
                原密码
              </label>
              <el-input
                v-model="formData.loginPwd"
                type="password"
                show-password
                placeholder="请输入原密码"
                size="large"
                class="password-input"
              />
            </div>
          </el-form-item>
          
          <el-form-item prop="newLoginPwd">
            <div class="input-group">
              <label class="input-label">
                <el-icon class="label-icon">
                  <Lock />
                </el-icon>
                新密码
              </label>
              <el-input
                v-model="formData.newLoginPwd"
                type="password"
                show-password
                placeholder="请输入新密码"
                size="large"
                class="password-input"
              />
            </div>
          </el-form-item>
          
          <el-form-item prop="confirmPwd">
            <div class="input-group">
              <label class="input-label">
                <el-icon class="label-icon">
                  <Unlock />
                </el-icon>
                确认密码
              </label>
              <el-input
                v-model="formData.confirmPwd"
                type="password"
                show-password
                placeholder="请再次输入新密码"
                size="large"
                class="password-input"
                @input="checkPassword"
              />
              <div v-if="passwordMismatch" class="error-tip">
                <el-icon class="error-icon">
                  <Warning />
                </el-icon>
                两次输入的密码不一致
              </div>
            </div>
          </el-form-item>
          
          <div class="button-group">
            <el-button 
              type="primary" 
              size="large"
              class="submit-btn"
              @click="submitForm(formRef)"
              :loading="loading"
            >
              <el-icon class="btn-icon">
                <Check />
              </el-icon>
              确认修改
            </el-button>
            <el-button 
              size="large"
              class="cancel-btn"
              @click="resetForm(formRef)"
            >
              <el-icon class="btn-icon">
                <Close />
              </el-icon>
              取消
            </el-button>
          </div>
        </el-form>
      </div>
      
      <div class="security-tips">
        <h4>
          <el-icon class="tips-icon">
            <InfoFilled />
          </el-icon>
          安全提示
        </h4>
        <ul>
          <li>密码长度建议8位以上，包含字母、数字和特殊字符</li>
          <li>请勿使用生日、姓名等容易被猜测的密码</li>
          <li>定期更换密码，确保账户安全</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox, ElNotification, type FormInstance, type FormRules } from 'element-plus';
import { ref } from 'vue';
import { $resetPwd } from '../../api/admin';
import useUser from '../../store/user';
import { Lock, Key, Unlock, Warning, Check, Close, InfoFilled } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const userStore = useUser();
const formRef = ref<FormInstance>();
const loading = ref(false);
const router = useRouter();

let formData = ref({
  loginId: userStore.user.loginId,
  loginPwd: '',
  newLoginPwd: '',
  confirmPwd: '',
});

// 校验确认密码
const validateConfirmPwd = (rule: any, value: string, callback: any) => {
  if (value !== formData.value.newLoginPwd) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const passwordMismatch = ref(false);

// 检查密码是否一致
const checkPassword = () => {
  passwordMismatch.value = formData.value.newLoginPwd !== formData.value.confirmPwd;
};

const rules = ref<FormRules>({
  loginId: [
    { required: true, message: '', trigger: 'blur' },
  ],
  loginPwd: [
    { required: true, message: '请输入密码', trigger: 'blur' },
  ],
  newLoginPwd: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
  ],
  confirmPwd: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPwd, trigger: 'blur' } // 新增确认密码的校验规则
  ],
});

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  
  const valid = await formEl.validate().catch(() => false);
  if (!valid) return;
  
  loading.value = true;
  try {
    let ret = await $resetPwd(formData.value);
    if (ret.success) {
      ElNotification({
        title: '提示',
        message: ret.message,
        type: 'success',
      });
      resetForm(formEl);
      // 清除登录状态，跳转到登录页面
      userStore.clearUser();
      // 1s 后在中央弹出请重新登录，在确认或者取消后跳转
      setTimeout(() => {
        ElMessageBox.confirm('密码修改成功，请重新登录', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          router.replace('/login');
        }).catch(() => {
          router.replace('/login');
        });
      }, 1000);
    } else {
      ElNotification({
        title: '提示',
        message: ret.message,
        type: 'error',
      });
    }
  } finally {
    loading.value = false;
  }
};

// 重置表单（取消按钮的处理逻辑）
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  formData.value = {
    loginId: '',
    loginPwd: '',
    newLoginPwd: '',
    confirmPwd: '',
  };
  passwordMismatch.value = false;
};
</script>

<style lang="scss" scoped>
.setpwd {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100%;
  box-sizing: border-box;
}

.password-change-container {
  max-width: 500px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out;
}

.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 40px 30px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }
  
  .icon-container {
    position: relative;
    z-index: 2;
    margin-bottom: 20px;
    
    .lock-icon {
      font-size: 48px;
      background: rgba(255, 255, 255, 0.2);
      padding: 20px;
      border-radius: 50%;
      backdrop-filter: blur(10px);
    }
  }
  
  h2 {
    position: relative;
    z-index: 2;
    margin: 0 0 10px 0;
    font-size: 28px;
    font-weight: 600;
  }
  
  p {
    position: relative;
    z-index: 2;
    margin: 0;
    opacity: 0.9;
    font-size: 14px;
  }
}

.form-container {
  padding: 40px 30px;
}

.password-form {
  .el-form-item {
    margin-bottom: 25px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.input-group {
  width: 100%;
  
  .input-label {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    color: #5a6c7d;
    font-weight: 500;
    font-size: 14px;
    
    .label-icon {
      margin-right: 8px;
      color: #667eea;
      font-size: 16px;
    }
  }
  
  .password-input {
    width: 100%;
    
    :deep(.el-input__wrapper) {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border: 2px solid transparent;
      transition: all 0.3s ease;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
      }
      
      &.is-focus {
        border-color: #667eea;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
      }
    }
    
    :deep(.el-input__inner) {
      padding: 0 15px;
      font-size: 16px;
    }
  }
  
  .error-tip {
    display: flex;
    align-items: center;
    color: #f56565;
    font-size: 12px;
    margin-top: 8px;
    
    .error-icon {
      margin-right: 4px;
      font-size: 14px;
    }
  }
}

.button-group {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  
  .el-button {
    flex: 1;
    height: 48px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.3s ease;
    
    .btn-icon {
      margin-right: 8px;
    }
    
    &.submit-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
      }
      
      &:active {
        transform: translateY(0);
      }
    }
    
    &.cancel-btn {
      background: #f8f9fa;
      border: 2px solid #e1e8ed;
      color: #5a6c7d;
      
      &:hover {
        border-color: #667eea;
        color: #667eea;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
      }
    }
  }
}

.security-tips {
  background: #f8f9fa;
  padding: 25px 30px;
  border-top: 1px solid #e1e8ed;
  
  h4 {
    display: flex;
    align-items: center;
    margin: 0 0 15px 0;
    color: #2d3748;
    font-size: 16px;
    font-weight: 600;
    
    .tips-icon {
      margin-right: 8px;
      color: #667eea;
      font-size: 18px;
    }
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    
    li {
      color: #5a6c7d;
      font-size: 13px;
      line-height: 1.6;
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .setpwd {
    padding: 10px;
  }
  
  .password-change-container {
    max-width: 100%;
    margin: 0;
  }
  
  .header-section {
    padding: 30px 20px;
    
    .icon-container .lock-icon {
      font-size: 40px;
      padding: 15px;
    }
    
    h2 {
      font-size: 24px;
    }
  }
  
  .form-container {
    padding: 30px 20px;
  }
  
  .security-tips {
    padding: 20px;
  }
  
  .button-group {
    flex-direction: column;
    
    .el-button {
      width: 100%;
    }
  }
}

// 动画效果
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 输入框焦点动画
.password-input {
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
</style>