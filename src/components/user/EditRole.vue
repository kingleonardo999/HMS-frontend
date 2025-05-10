<template>
  <el-drawer
    size="30%"
    v-model="drawer"
    title="添加角色"
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
          <el-button type="primary" @click="submitForm(formRef)">提交</el-button>
          <el-button @click="resetForm(formRef)">取消</el-button>
        </el-form-item>
      </el-form>
  </el-drawer>
</template>

<script setup lang="ts">
// 引入组件
import { ElNotification, type FormInstance, type FormRules } from 'element-plus';
import { reactive, ref } from 'vue';
import { $add } from '../../api/role';

const emit = defineEmits(['sync-list'])

// 抽屉变量
const drawer = ref(false)

// 关闭抽屉
const closeDrawer = () => {
  resetForm(formRef.value)
  drawer.value = false
}

// 定义一个响应式对象，绑定表单数据
const formData = reactive({
  roleName: '',
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

// 提交表单
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (valid) {
      let ret = await $add(formData)
      if (ret.success){
        ElNotification({
          title: '提示',
          message: ret.message,
          type: 'success',
        });
        resetForm(formRef.value)
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
  })
}

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

// 导出
defineExpose({
  drawer,
})
</script>

<style lang="scss" scoped>
</style>