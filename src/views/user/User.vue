<template>
  <div class="User">
    <div class="search">
      <el-button type="primary" size="small" @click="handleAdd">添加</el-button>
    </div>
    <el-table :data="showUsers" style="width: 100%">
    <el-table-column prop="loginId" label="账号" width="100" />
    <el-table-column prop="name" label="名字" width="100"/>
    <el-table-column prop="phone" label="电话" width="150"/>
    <el-table-column prop="roleName" label="角色" width="150"/>
    <el-table-column label="头像" width="100">
      <template #default="scope">
        <img :src="scope.row.photo" alt="头像" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover;">
      </template>
    </el-table-column>
    <el-table-column label="操作">
      <template #default="scope">
        <el-button size="small" @click="handleEdit(scope.row.loginId)">
          编辑
        </el-button>
        <el-button
          size="small"
          type="danger"
          @click="handleDelete(scope.row.loginId)"
        >
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination style="margin-top: 5px;" small background layout="prev, pager, next" :total="users.length" v-model:current-page="pageIndex" />
  <EditUser ref="editRef" @sync-list="loadUsers"></EditUser>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { $list, $delete, $getOne } from '../../api/admin';
import { ElMessage, ElMessageBox } from 'element-plus';
import EditUser from '../../components/user/EditUser.vue';

type User = {
  id: number;
  name: string;
  phone: string;
  photo: string;
  roleName: string;
};

// 从api中获取的用户列表
let users = ref<User[]>([]);

// 分页
let pageIndex = ref<number>(1);
// 每页条数
let pageSize = 10;
let showUsers = computed(() => {
  return users.value.slice((pageIndex.value - 1) * pageSize, pageIndex.value * pageSize);
});
// 加载所有用户
const loadUsers = async () => {
  users.value = await $list();
}

// 添加用户
const handleAdd = () => {
  editRef.value.initFormData(); // 初始化 formData 为空
  editRef.value.drawer = true;
};

// 编辑用户
const handleEdit = async (loginId: string) => {
  let ret = await $getOne({loginId: loginId});
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

// 删除用户
const handleDelete = (loginId: string) => {
  // 弹出确认框
  ElMessageBox.confirm(
    '确定删除该用户吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      // 确定删除，调用接口
      let ret = await $delete({'roleId': loginId});
      if (ret.success) {
        ElMessage({
          type: 'success',
          message: ret.message,
        });
        // 重新加载列表
        loadUsers();
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
  loadUsers();
});

</script>

<style lang="scss" scoped>
.search {
  margin-top: 5px;
  margin-left: 5px;
}
</style>