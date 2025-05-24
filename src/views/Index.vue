<template>
  <div class="index">
    <div class="left">
      <h2>Leo酒店综合平台</h2>
      <el-menu 
      :default-active="activeMenu"
      router
      active-text-color="#ffd04b" 
      background-color="#142334" 
      class="el-menu-vertical-demo" 
      text-color="#fff">
        <el-sub-menu index="1">
          <template #title>
            <el-icon><User /></el-icon>
            <span>账户管理</span>
          </template>
          <el-menu-item index="/index/role">角色管理</el-menu-item>
          <el-menu-item index="/index/user">用户管理</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="2">
          <template #title>
            <el-icon><House /></el-icon>
            <span>客房管理</span>
          </template>
          <el-menu-item index="/index/roomtype">房型管理</el-menu-item>
          <el-menu-item index="/index/room">房间管理</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="3">
          <template #title>
            <el-icon><Service /></el-icon>
            <span>客户管理</span>
          </template>
          <el-menu-item index="/index/checkin">入住管理</el-menu-item>
          <el-menu-item index="/index/order">用户订单</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="4">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/index/menu">菜单管理</el-menu-item>
          <el-menu-item index="/index/dict">字典管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>
    <div class="right">
      <div class="top">
        <el-menu
          :default-active="activeMenu"
          router
          :ellipsis="false"
          mode="horizontal"
          background-color="#142334"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <el-menu-item index="/index">
            <el-icon><HomeFilled /></el-icon>
            首页
          </el-menu-item>
          <el-menu-item index="/mail">
            <el-icon><Message /></el-icon>
            邮件
          </el-menu-item>
          <el-menu-item index="/message">
            <el-icon><ChatDotRound /></el-icon>
            消息
          </el-menu-item>
          <el-sub-menu index="admin">
            <template #title>
              <el-icon><Avatar /></el-icon>
              {{userStore.user.name}}
            </template>
            <el-menu-item index="/mine">个人中心</el-menu-item>
            <el-menu-item index="/setpwd">修改密码</el-menu-item>
            <el-menu-item index="" @click="exit">退出系统</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
      <div class="content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  User,
  House,
  Service,
  Setting,
  HomeFilled,
  Message,
  ChatDotRound,
  Avatar,
} from '@element-plus/icons-vue';
import { onMounted, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter, useRoute } from 'vue-router';
import useUser from '../store/user';
let userStore = useUser();
let router = useRouter();
// route是获取当前路由对象，用于获取当前路由的路径
let route = useRoute();
const activeMenu = ref('');

// 监听路由变化，更新 activeMenu，然后在两个 el-menu 中绑定 :default-active="activeMenu"
watch(() => route.path, (newPath) => {
  activeMenu.value = newPath;
}, { immediate: true });


onMounted(() => {
  if(!userStore.user.loginId){
    router.push('/')
  }
})

// 退出系统
let exit = () => {
  // 弹出确认框
  ElMessageBox.confirm(
    '是否退出系统？',
    '系统提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 确定退出，清除用户信息，并跳转到登录页面
    userStore.clearUser();
    router.push('/');
    ElMessage({
      type: 'success',
      message: '退出成功',
    })
  }).catch(() => {
    // 取消退出，不做任何操作
  })
};
</script>

<style scoped>
.index {
  width: 100vw;
  height: 100vh;
  display: flex;

  .left {
    width: 200px;
    background-color: #142334;
    color: white;
    h2 {
      font-size: 20px;
      font-family: hetang;
      text-align: center;
      height: 60px;
      line-height: 60px;
    }
    .el-menu{
      border-right: none;
    }
  }

  .right {
    flex: 1;
    display: flex;
    flex-direction: column;

    .top {
      height: 60px;
      background-color: #142334;
      color: white;
      display: flex;
      justify-content: flex-end;
      .el-menu{
        border: none;
      }
    }

    .content {
      flex: 1;
    }
  }
}
</style>