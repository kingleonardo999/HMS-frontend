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

    <!-- 添加/编辑字典组件 -->
    <EditDict ref="editRef" @sync-list="loadDictList" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { $dictlist, $list, $delete } from '../../api/dict';
import EditDict from '../../components/system/EditDict.vue';

// 响应式数据
const loading = ref(false);
const selectedType = ref('');

type Dict = {
  id: number;
  name: string;
};

// 字典列表和类型
const dictList = ref<Dict[]>([]);
const dictTypes = ref<string[]>([]);

// 编辑组件引用
const editRef = ref();

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
  editRef.value.initFormData(selectedType.value);
};

// 编辑字典
const handleEdit = (row: any) => {
  editRef.value.initFormData(selectedType.value, row);
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
</style>