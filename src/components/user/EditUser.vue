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
      <el-form-item label="角色" prop="roleId">
        <el-select
          v-model="formData.roleId"
          placeholder="admin"
          style="width: 240px"
        >
          <el-option
            v-for="item in props.roleList"
            :key="item.roleId"
            :label="item.roleName"
            :value="item.roleId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="头像" prop="imgId">
        <el-upload
          class="avatar-uploader"
          :action="'/api/uploads/img'"
          :show-file-list="false"
          :on-success="uploadSuccess"
          :before-upload="beforeUpload"
          :headers="uploadHeaders"
        >
          <img v-if="imageUrl" :src="imageUrl" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm(formRef)">{{ isEditing ? '修改' : '添加' }}</el-button>
        <el-button @click="resetForm(formRef)">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup lang="ts">
import { ElNotification, type FormInstance, type FormRules, type UploadProps } from 'element-plus';
import { reactive, ref } from 'vue';
import { $add, $update } from '../../api/admin';
import { Plus } from '@element-plus/icons-vue';
import { createUploadSuccessHandler, beforeUploadHandler, getUploadHeaders, processImageUrlSync } from '../../utils/file';

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
  imageUrl.value = ''; // 清空图片URL
  
  drawer.value = false;
};

// 定义表单数据类型
interface EditUser {
  name: string;
  phone: string;
  imgId?: number; // 用于提交到服务器
  roleId: number;
  loginId: string;
  roleName?: string; // 添加可选的roleName字段，用于从后端获取数据时的转换
  photo?: string; // 添加photo字段，用于从后端获取数据
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

// 验证电话号，且以1开头
const validatePhone = (rule: any, value: string, callback: any) => {
  const phoneRegex = /^1\d{10}$/; // 正则表达式
  if (value === '') {
    callback(new Error('请输入电话号码'));
  } else if (!phoneRegex.test(value)) {
    callback(new Error('请输入有效的电话号码'));
  } else {
    callback();
  }
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
  phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
  roleId: [{ required: true, message: '请选择角色', trigger: 'blur' }],
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
  imgId: undefined,
  roleId: 1, // 默认角色ID为1（admin）
};

// 保存原始用户数据，用于"取消"操作时恢复
const originalUserData = ref();

// 初始化表单数据
const initFormData = (data?: UserFormData) => {
  if (data) {
    // 深拷贝一份数据，以便在取消时恢复
    originalUserData.value = JSON.parse(JSON.stringify(data));
    
    // 处理角色ID转换
    const processedData = { ...data };
    
    // 如果数据中包含roleName但没有roleId，需要根据roleName找到对应的roleId
    if (!processedData.roleId && processedData.roleName && props.roleList) {
      const matchedRole = props.roleList.find(role => role.roleName === processedData.roleName);
      if (matchedRole) {
        processedData.roleId = matchedRole.roleId;
      }
    }
    
    // 处理图片数据 - 直接处理photo字段
    if (processedData.photo) {
      // 直接设置图片URL用于显示
      imageUrl.value = processImageUrlSync(processedData.photo)
    }
    
    // 确保必要的字段存在（编辑模式下不需要密码）
    if (!processedData.loginPwd) {
      processedData.loginPwd = '';
    }
    if (!processedData.confirmPwd) {
      processedData.confirmPwd = '';
    }
    
    formData.value = processedData;
    isEditing.value = true; // 如果传入了数据，则设置为编辑模式
  } else {
    originalUserData.value = { ...emptyForm };
    formData.value = { ...emptyForm };
    isEditing.value = false; // 如果没有传入数据，则设置为添加模式
    imageUrl.value = '' // 清空图片URL
  }
  
  // 重置密码不匹配的提示
  passwordMismatch.value = false;
};

// 图片URL状态
const imageUrl = ref('')

// 上传头像成功的回调函数（使用工具函数）
const uploadSuccess = createUploadSuccessHandler(formData, imageUrl) // 传入 imageUrl 引用

// 上传头像之前的校验函数（使用工具函数）
const beforeUpload = beforeUploadHandler

// 上传组件的请求头配置（使用工具函数）
const uploadHeaders = getUploadHeaders()

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
    // 恢复图片显示
    if (originalUserData.value.photo) {
      imageUrl.value = processImageUrlSync(originalUserData.value.photo);
    } else {
      imageUrl.value = '';
    }
  } else {
    // 在添加模式下，清空表单
    formData.value = { ...emptyForm };
    imageUrl.value = '';
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