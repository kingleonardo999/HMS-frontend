<template>
  <el-drawer
    size="30%"
    v-model="drawer"
    :title="isEditing ? '修改用户' : '添加用户'"
    direction="rtl"
    :before-close="closeDrawer"
  >
    <el-form
      size="small"
      ref="formRef"
      :model="formData"
      status-icon
      :rules="rules"
      label-width="70px"
    >
      <el-form-item v-if="!isEditing" label="用户账号" prop="loginId">
        <el-input v-model="formData.loginId" />
      </el-form-item>
      <el-form-item v-if="!isEditing" label="密码" prop="loginPwd">
        <el-input
          v-model="formData.loginPwd"
          type="password"
          show-password
          placeholder="请输入密码"
        />
      </el-form-item>
      <el-form-item v-if="!isEditing" label="确认密码" prop="confirmPwd">
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
      <el-form-item label="用户名称" prop="name">
        <el-input v-model="formData.name" />
      </el-form-item>
      <el-form-item label="电话号码" prop="phone">
        <el-input v-model="formData.phone" />
      </el-form-item>
      <el-form-item label="角色" prop="roleName">
        <el-select
          v-model="formData.roleName"
          placeholder="user"
          style="width: 240px"
        >
          <el-option
            v-for="item in props.roleList"
            :key="item.roleId"
            :label="item.roleName"
            :value="item.roleName"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="头像" prop="photo">
        <el-upload
          class="avatar-uploader"
          :action="baseURL_dev + '/admin/uploadImg'"
          :show-file-list="false"
          :on-success="uploadSuccess"
          :before-upload="beforeUpload"
        >
          <img v-if="formData.photo" :src=formData.photo class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm(formRef)">{{ isEditing ? '修改' : '添加' }}</el-button>
        <el-button @click="resetForm(formRef)">取消</el-button>
      </el-form-item>
      <el-form-item>
        <div style="color: #909399; font-size: 12px;">
          带 * 号的为必填选项
        </div>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup lang="ts">
import { ElNotification, type FormInstance, type FormRules, type UploadProps } from 'element-plus';
import { reactive, ref } from 'vue';
import { $add, $update } from '../../api/admin';
import { Plus } from '@element-plus/icons-vue'
import { baseURL_dev } from '../../config/baseURL';

const emit = defineEmits(['sync-list']);

// 抽屉变量
const drawer = ref(false);

// 是否处于编辑状态
const isEditing = ref(false);

// 是否显示密码不匹配的错误提示
const passwordMismatch = ref(false);

// 关闭抽屉
const closeDrawer = () => {
  // 抽屉关闭时清空所有数据
  if (formRef.value) {
    formRef.value.resetFields();
  }
  
  // 重置为空表单
  formData.value = { ...emptyForm };
  originalUserData.value = null;
  isEditing.value = false; // 重置编辑状态
  passwordMismatch.value = false;
  
  drawer.value = false;
};

// 定义表单数据类型
interface EditUser {
  name: string;
  phone: string;
  photo: string;
  roleName: string;
  loginId: string;
}

// 定义表单数据类型
interface UserFormData extends EditUser {
  loginPwd: string;
  confirmPwd: string;
}

// 定义一个响应式对象，绑定表单数据
const formData = ref();

// 定义一个ref对象，绑定表单
const formRef = ref<FormInstance>();

// 校验确认密码
const validateConfirmPwd = (rule: any, value: string, callback: any) => {
  if (value !== formData.value.loginPwd) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

// 检查密码是否一致
const checkPassword = () => {
  passwordMismatch.value = formData.value.loginPwd !== formData.value.confirmPwd;
};

// 验证对象
const rules = reactive<FormRules<typeof formData>>({
  loginId: [{ required: true, message: '请输入用户账号', trigger: 'blur' }],
  loginPwd: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPwd: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPwd, trigger: 'blur' } // 新增确认密码的校验规则
  ],
  name: [{ required: true, message: '请输入名字', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入电话号码', trigger: 'blur' }],
});

// 定义角色类型
interface Role {
  roleId: number;
  roleName: string;
}

// 定义角色列表
const props = defineProps({
  roleList: Array<Role>, // 通过 props 接收角色列表
});

// 空表单对象
const emptyForm = {
  loginId: '',
  loginPwd: '',
  confirmPwd: '',
  name: '',
  phone: '',
  photo: '',
  roleName: '',
};

// 保存原始用户数据，用于"取消"操作时恢复
const originalUserData = ref();

// 初始化表单数据
const initFormData = (data?: UserFormData) => {
  if (data) {
    // 深拷贝一份数据，以便在取消时恢复
    originalUserData.value = JSON.parse(JSON.stringify(data));
    formData.value = { ...data };
    isEditing.value = true; // 如果传入了数据，则设置为编辑模式
  } else {
    originalUserData.value = { ...emptyForm };
    formData.value = { ...emptyForm };
    isEditing.value = false; // 如果没有传入数据，则设置为添加模式
  }
  
  // 重置密码不匹配的提示
  passwordMismatch.value = false;
};

// 上传头像成功的回调函数
const uploadSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  let {url, success, message} = response;
  if(success) {
    ElNotification({
      title: '提示',
      message: message,
      type: 'success',
    })
    // 获取到返回的图片地址
    if(url.startsWith('http') || url.startsWith('https')) {
      // 如果是完整的URL，则直接使用
      formData.value.photo = url;
    } else {
      formData.value.photo = baseURL_dev + url;
    }
  }
}

// 上传头像之前的校验函数
const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  let imgTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!imgTypes.includes(rawFile.type)) {
    ElNotification({
      title: '提示',
      message: '请上传标准的图片文件!',
      type: 'error',
    })
    return false
  } else if (rawFile.size / 1024 / 1024 > 5) {
    ElNotification({
      title: '提示',
      message: '文件大小不能超过5MB!',
      type: 'error',
    })
    return false
  }
  return true
}

// 提交表单
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      if (isEditing.value) {
        // 修改用户
        let ret = await $update(formData.value);
        if (ret.success) {
          ElNotification({
            title: '提示',
            message: ret.message,
            type: 'success',
          });
          // resetForm(formRef.value);
          // 通知父组件更新列表
          emit('sync-list');
        } else {
          ElNotification({
            title: '提示',
            message: ret.message,
            type: 'error',
          });
        }
      } else {
        let ret = await $add(formData.value);
        if (ret.success) {
          ElNotification({
            title: '提示',
            message: ret.message,
            type: 'success',
          });
          resetForm(formRef.value);
          // 通知父组件更新列表
          emit('sync-list');
        } else {
          ElNotification({
            title: '提示',
            message: ret.message,
            type: 'error',
          });
        }
      }
    }
  });
};

// 重置表单（取消按钮的处理逻辑）
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  
  if (isEditing.value && originalUserData.value) {
    // 在编辑模式下，恢复原始数据
    formData.value = { ...originalUserData.value };
  } else {
    // 在添加模式下，清空表单
    formData.value = { ...emptyForm };
  }
  
  // 确保重置密码不匹配的提示
  passwordMismatch.value = false;
};

// 导出
defineExpose({
  drawer,
  initFormData,
});
</script>

<style lang="scss" scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.avatar-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>