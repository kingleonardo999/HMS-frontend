<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑字典' : '新增字典'"
    width="500px"
    :before-close="closeDialog"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="字典类型">
        <el-input :value="selectedType" disabled />
      </el-form-item>
      
      <el-form-item label="字典名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入字典名称"
          clearable
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { $add, $update } from '../../api/dict';

const emit = defineEmits(['sync-list']);

// 对话框可见性
const dialogVisible = ref(false);

// 是否处于编辑状态
const isEdit = ref(false);

// 加载状态
const submitLoading = ref(false);

// 当前选中的字典类型
const selectedType = ref('');

// 定义字典数据类型
interface DictData {
  id?: number;
  name: string;
}

// 表单数据
const formData = reactive<DictData>({
  name: ''
});

// 表单引用
const formRef = ref<FormInstance>();

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入字典名称', trigger: 'blur' }
  ]
};

// 空表单对象
const emptyForm: DictData = {
  name: ''
};

// 保存原始数据，用于"取消"操作时恢复
const originalData = ref<DictData | null>(null);

// 初始化表单数据
const initFormData = (type: string, data?: DictData) => {
  selectedType.value = type;
  
  if (data) {
    // 编辑模式 - 深拷贝一份数据，以便在取消时恢复
    originalData.value = JSON.parse(JSON.stringify(data));
    Object.assign(formData, data);
    isEdit.value = true;
  } else {
    // 添加模式
    originalData.value = { ...emptyForm };
    Object.assign(formData, emptyForm);
    isEdit.value = false;
  }
  
  dialogVisible.value = true;
  nextTick(() => {
    formRef.value?.clearValidate();
  });
};

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false;
  resetFormData();
};

// 重置表单数据
const resetFormData = () => {
  Object.assign(formData, emptyForm);
  originalData.value = null;
  isEdit.value = false;
  selectedType.value = '';
  
  nextTick(() => {
    formRef.value?.clearValidate();
  });
};

// 取消按钮处理
const handleCancel = () => {
  if (isEdit.value && originalData.value) {
    // 在编辑模式下，恢复原始数据
    Object.assign(formData, originalData.value);
  } else {
    // 在添加模式下，清空表单
    Object.assign(formData, emptyForm);
  }
  
  dialogVisible.value = false;
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  
  submitLoading.value = true;
  try {
    const result = isEdit.value 
      ? await $update(selectedType.value, formData) 
      : await $add(selectedType.value, formData);
      
    if (result.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '添加成功');
      dialogVisible.value = false;
      // 通知父组件更新列表
      emit('sync-list');
    } else {
      ElMessage.error(result.message);
    }
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '添加失败');
  } finally {
    submitLoading.value = false;
  }
};

// 导出方法供父组件调用
defineExpose({
  dialogVisible,
  initFormData,
});
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
