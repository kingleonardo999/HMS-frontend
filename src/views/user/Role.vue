<template>
  <div class="role">
    <div class="search">
      <el-button type="primary" size="small" @click="handleAdd">添加</el-button>
    </div>
    <el-table :data="showRoles" style="width: 100%">
    <el-table-column prop="roleId" label="编号" width="100" />
    <el-table-column prop="roleName" label="名称" width="180"/>
    <el-table-column label="操作">
      <template #default="scope">
        <el-button size="small" @click="handleEdit(scope.row.roleId)">
          编辑
        </el-button>
        <el-button
          size="small"
          type="danger"
          @click="handleDelete(scope.row.roleId)"
        >
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination style="margin-top: 5px;" small background layout="prev, pager, next" :total="roles.length" v-model:current-page="pageIndex" />
  <EditRole ref="editRef" @sync-list="loadRoles"></EditRole>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { $list, $delete, $getOne } from '../../api/role';
import EditRole from '../../components/user/EditRole.vue';
import { ElMessage, ElMessageBox } from 'element-plus';

type Role = {
  roleId: number;
  roleName: string;
};

// 从api中获取的角色列表
let roles = ref<Role[]>([]);

// 分页
let pageIndex = ref<number>(1);
// 每页条数
let pageSize = 10;
let showRoles = computed(() => {
  return roles.value.slice((pageIndex.value - 1) * pageSize, pageIndex.value * pageSize);
});
// 加载所有角色
const loadRoles = async () => {
  roles.value = await $list();
}

// 添加角色
const handleAdd = () => {
  editRef.value.initFormData(); // 初始化 formData 为空
  editRef.value.drawer = true;
};

// 编辑角色
const handleEdit = async (roleId: number) => {
  let ret = await $getOne({roleId: roleId});
  if (ret.success) {
    editRef.value.initFormData(ret.data); // 使用初始化方法设置 formData
    editRef.value.drawer = true;
  } else {
    ElMessage({
      type: 'error',
      message: ret.message,
    });
  }
};

// 删除角色
const handleDelete = (roleId: number) => {
  // 弹出确认框
  ElMessageBox.confirm(
    '确定删除该角色吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      // 确定删除，调用接口
      let ret = await $delete({'roleId': roleId});
      if (ret.success) {
        ElMessage({
          type: 'success',
          message: ret.message,
        });
        // 重新加载角色列表
        loadRoles();
      } else {
        ElMessage({
          type: 'error',
          message: ret.message,
        });
      }
    })
    .catch(() => {
      // 取消退出，不做任何操作
    })
};

// 定义编辑组件ref
let editRef = ref();

onMounted(() => {
  loadRoles();
});
</script>

<style lang="scss" scoped>
.search {
  margin-top: 5px;
  margin-left: 5px;
}
</style>