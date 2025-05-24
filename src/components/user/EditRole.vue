<template>
  <el-drawer
    size="30%"
    v-model="drawer"
    :title="isEditing ? '修改角色' : '添加角色'"
    direction="rtl"
    :before-close="closeDrawer"
  >
  <el-form 
      size="small" 
      ref="formRef" 
      :model="formData" 
      status-icon 
      :rules="rules" 
      label-width="60px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="formData.roleName" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm(formRef)">{{isEditing ? '修改' : '添加'}}</el-button>
          <el-button @click="resetForm(formRef)">取消</el-button>
        </el-form-item>
      </el-form>
  </el-drawer>
</template>

<script setup lang="ts">
// 引入组件
import { ElNotification, type FormInstance, type FormRules } from 'element-plus';
import { reactive, ref } from 'vue';
import { $add, $update } from '../../api/role';

const emit = defineEmits(['sync-list'])

// 抽屉变量
const drawer = ref(false)

// 是否处于编辑状态
const isEditing = ref(false);

// 空表单对象
const emptyForm = {
  roleName: '',
  roleId: undefined,
};

// 保存原始角色数据，用于"取消"操作时恢复
const originalRoleData = ref();

// 关闭抽屉
const closeDrawer = () => {
  // 抽屉关闭时清空所有数据
  if (formRef.value) {
    formRef.value.resetFields();
  }
  
  // 重置为空表单
  formData.value = { ...emptyForm };
  originalRoleData.value = null;
  isEditing.value = false; // 重置编辑状态
  
  drawer.value = false;
}

// 定义表单数据类型
interface RoleFormData {
  roleName: string;
  roleId?: number;
}

// 定义一个响应式对象，绑定表单数据
const formData = ref<RoleFormData>({
  roleName: '',
  roleId: undefined,
})

// 定义一个ref对象，绑定表单
const formRef = ref<FormInstance>()

// 验证角色名称
const validateRoleName = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入角色名称'))
  } else {
    callback()
  }
}

// 验证对象
const rules = reactive<FormRules<typeof formData>>({
  roleName: [{ validator: validateRoleName, trigger: 'blur' }],
})

// 初始化表单数据
const initFormData = (data?: RoleFormData) => {
  if (data) {
    // 深拷贝一份数据，以便在取消时恢复
    originalRoleData.value = JSON.parse(JSON.stringify(data));
    formData.value = { ...data };
    isEditing.value = true; // 如果传入了数据，则设置为编辑模式
  } else {
    originalRoleData.value = { ...emptyForm };
    formData.value = { ...emptyForm };
    isEditing.value = false; // 如果没有传入数据，则设置为添加模式
  }
};

// 提交表单
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      if (isEditing.value) {
        // 修改角色
        let ret = await $update(formData.value);
        if (ret.success) {
          ElNotification({
            title: '提示',
            message: ret.message,
            type: 'success',
          });
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

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  
  if (isEditing.value && originalRoleData.value) {
    // 在编辑模式下，恢复原始数据
    formData.value = { ...originalRoleData.value };
  } else {
    // 在添加模式下，清空表单
    formData.value = { ...emptyForm };
  }
};

// 导出
defineExpose({
  drawer,
  initFormData,
});
</script>

<style lang="scss" scoped>
</style>