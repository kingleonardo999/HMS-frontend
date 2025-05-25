<template>
  <div class="setpwd">
    <el-form
      size="small"
      ref="formRef"
      :model="formData"
      status-icon
      :rules="rules"
      label-width="70px"
    >
      <el-form-item label="原密码" prop="loginPwd">
        <el-input
          v-model="formData.loginPwd"
          type="password"
          show-password
          placeholder="请输入原密码"
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newLoginPwd">
        <el-input
          v-model="formData.newLoginPwd"
          type="password"
          show-password
          placeholder="请输入新密码"
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPwd">
        <el-input
          v-model="formData.confirmPwd"
          type="password"
          show-password
          placeholder="请再次输入密码"
          @input="checkPassword"
        />
        <div v-if="passwordMismatch" style="color: red; font-size: 12px;">
          两次输入的密码不一致
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm(formRef)">修改密码</el-button>
        <el-button @click="resetForm(formRef)">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox, ElNotification, type FormInstance, type FormRules } from 'element-plus';
import { ref } from 'vue';
import { $resetPwd } from '../../api/admin';
import useUser from '../../store/user';

const userStore = useUser();
const formRef = ref<FormInstance>();
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
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
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
            window.location.href = '/login';
          }).catch(() => {
            window.location.href = '/login';
          });
        }, 1000);
      } else {
        ElNotification({
          title: '提示',
          message: ret.message,
          type: 'error',
        });
      }
    }
  });
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
  margin-top: 10px;
  margin-left: 10px;
  width: 300px;
}
</style>