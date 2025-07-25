<template>
  <div class="dict">
    <div class="search">
      <el-select v-model="selectedType" placeholder="请选择字典" style="width: 150px" size="small" @change="handleTypeChange">
        <el-option v-for="item in dictTypes" :key="item" :label="item"
          :value="item" />
      </el-select>
      <el-button style="margin-left: 10px;" type="primary" size="small" @click="handleAdd" :disabled="!selectedType">
        添加
      </el-button>
    </div>
    
    <el-table :data="dictList" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="编号" width="100" />
      <el-table-column prop="name" label="字典名称" width="200" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">
            编辑
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-pagination 
      style="margin-top: 5px;" 
      small 
      background 
      layout="prev, pager, next" 
      v-if="dictList.length > 0"
    />

    <!-- 添加/编辑字典对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑字典' : '新增字典'"
      width="500px"
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
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { $dictlist, $list, $add, $update, $delete } from '../../api/dict';

// 响应式数据
const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const selectedType = ref('');

type Dict = {
  id: number;
  name: string;
};
// 字典列表和类型
const dictList = ref<Dict[]>([]);
const dictTypes = ref<string[]>([]);

// 表单数据
const formData = reactive({
  id: null,
  name: ''
});

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入字典名称', trigger: 'blur' }
  ]
};

// 初始化
onMounted(() => {
  loadDictTypes();
});

// 加载字典类型
const loadDictTypes = async () => {
  try {
    const result = await $dictlist();
    if (result.success && result.data) {
      dictTypes.value = result.data;
    }
  } catch (error) {
    console.error('加载字典类型失败:', error);
  }
};

// 类型改变
const handleTypeChange = (type: string) => {
  selectedType.value = type;
  if (type) {
    loadDictList();
  }
};

// 加载字典列表
const loadDictList = async () => {
  if (!selectedType.value) return;
  
  loading.value = true;
  try {
    const result = await $list(selectedType.value);
    if (result.success) {
      dictList.value = result.data || [];
    } else {
      ElMessage.error(result.message);
    }
  } catch (error) {
    ElMessage.error('加载字典列表失败');
  } finally {
    loading.value = false;
  }
};

// 添加字典
const handleAdd = () => {
  if (!selectedType.value) {
    ElMessage.warning('请先选择字典类型');
    return;
  }
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

// 编辑字典
const handleEdit = (row: any) => {
  isEdit.value = true;
  Object.assign(formData, row);
  dialogVisible.value = true;
};

// 删除字典
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除字典"${row.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const result = await $delete(selectedType.value, { id: row.id });
      if (result.success) {
        ElMessage.success('删除成功');
        loadDictList();
      } else {
        ElMessage.error(result.message);
      }
    } catch (error) {
      ElMessage.error('删除失败');
    }
  });
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
      loadDictList();
    } else {
      ElMessage.error(result.message);
    }
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '添加失败');
  } finally {
    submitLoading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: null,
    name: ''
  });
  nextTick(() => {
    formRef.value?.clearValidate();
  });
};
</script>

<style lang="scss" scoped>
.search {
  margin-top: 5px;
  margin-left: 5px;

  span {
    font-size: 14px;
    font: "Noto Sans SC";
    color: #909399;
    margin-left: 10px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>