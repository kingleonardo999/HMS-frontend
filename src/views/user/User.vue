<template>
  <div class="User">
    <div class="search">
      <span>角色：</span>
      <el-select
          v-model="roleId"
          placeholder="user"
          style="width: 150px"
          size="small"
        >
          <el-option
            v-for="item in roleList_sql"
            :key="item.roleId"
            :label="item.roleName"
            :value="item.roleId"
          />
        </el-select>
      <el-button style="margin-left: 10px;" @click="loadUsers" type="success" size="small">查询</el-button>
      <el-button type="primary" size="small" @click="handleAdd">添加</el-button>
    </div>
    <el-table :data="users" style="width: 100%">
    <el-table-column prop="loginId" label="账号" width="100" />
    <el-table-column prop="name" label="名字" width="100"/>
    <el-table-column prop="phone" label="电话" width="150"/>
    <el-table-column prop="roleName" label="角色" width="150"/>
    <el-table-column label="头像" width="100">
      <template #default="scope">
        <img :src="getDisplayImageUrl(scope.row.photo)" alt="头像" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover;">
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
  <el-pagination style="margin-top: 5px;" small background layout="prev, pager, next" 
  :total="total" v-model:current-page="pageIndex" @current-change="loadUsers"/>
  <EditUser ref="editRef" :roleList="roleList" @sync-list="loadUsers"></EditUser>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { $list, $delete, $getOne } from '../../api/admin';
import { ElMessage, ElMessageBox } from 'element-plus';
import EditUser from '../../components/user/EditUser.vue';
import { $list as $roleList } from '../../api/role';
import type { Role } from '../../views/user/Role.vue';
import { baseURL_dev } from '../../config/baseURL';
import { useRoute } from 'vue-router';

const route = useRoute();

type User = {
  id: number;
  name: string;
  phone: string;
  photo: string;
  roleName: string;
};

// 从api中获取的用户列表
let users = ref<User[]>([]);
// 总数量
let total = ref(0);
// 分页
let pageIndex = ref<number>(1);
// 每页条数
let pageSize = ref<number>(10);

// 存储角色列表
const roleList = ref<Role[]>([]);
const roleList_sql = ref<Role[]>([]); // 角色列表
// 加载角色列表
const loadRoleList = async () => {
  const ret = await $roleList();
  roleList.value = ret;
  // 深拷贝
  roleList_sql.value = JSON.parse(JSON.stringify(ret));
  roleList_sql.value.unshift({ roleId: 0, roleName: '全部' }); // 添加默认选项
};

// 根据roleId查询
let roleId = ref<number>(0); // 角色ID

// 加载所有用户
const loadUsers = async () => {
  let ret = await $list({
    pageIndex:pageIndex.value,
    pageSize:pageSize.value,
    roleId: roleId.value
  });
  users.value = ret.data;
  total.value = ret.count;
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
      let ret = await $delete({'loginId': loginId});
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

// 处理图片URL显示
const getDisplayImageUrl = (photo: string): string => {
  if (!photo) {
    return ''; // 如果没有头像，返回空字符串
  }
  
  // 判断是否为完整URL
  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo;
  }
  
  // 如果不是完整URL，拼接baseURL
  return baseURL_dev + '/' + photo.replace(/^\//, '');
};

// 定义编辑组件ref
let editRef = ref();

onMounted(async () => {
  await loadUsers();
  await loadRoleList();
  
  // 检查是否有编辑用户的查询参数
  const editUserLoginId = route.query.editUser as string;
  if (editUserLoginId) {
    // 自动调用编辑用户功能
    handleEdit(editUserLoginId);
  }
});

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