<template>
  <div class="role">
    <div class="search">
      <el-button type="primary" size="small" @click="editRef.drawer=true">添加</el-button>
    </div>
    <el-table :data="roles" style="width: 100%">
    <el-table-column prop="roleId" label="编号" width="100" />
    <el-table-column prop="roleName" label="名称" width="180"/>
    <el-table-column label="操作">
      <template #default="scope">
        <el-button size="small" @click="handleEdit(scope.row.id)">
          编辑
        </el-button>
        <el-button
          size="small"
          type="danger"
          @click="handleDelete(scope.row.id)"
        >
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <EditRole ref="editRef" @sync-list="loadRoles"></EditRole>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { $list } from '../../api/role';
import EditRole from '../../components/user/EditRole.vue';

let roles = ref([]);
// 加载所有角色
const loadRoles = async () => {
  roles.value = await $list()
}

// 编辑角色
const handleEdit = (rowId: number) => {
  console.log('Edit', rowId);
};

// 删除角色
const handleDelete = (rowId: number) => {
  console.log('Delete', rowId);
};

// 定义编辑组件ref
let editRef = ref();

onMounted(() => {
  loadRoles();
});
</script>

<style lang="scss" scoped>
.search {
  margin: 5px;
}
</style>