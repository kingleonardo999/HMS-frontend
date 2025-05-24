<template>
  <div class="mine">
    <div class="left">
      <img :src="userStore.user.photo" alt="头像">
    </div>
    <div class="right">
      <p>账号：{{ userStore.user.loginId }}</p>
      <p>姓名：{{ userStore.user.name }}</p>
      <p>角色：{{ userStore.user.roleName }}</p>
      <p>电话：{{ userStore.user.phone }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import useUser from '../../store/user'
const userStore = useUser();
</script>

<style lang="scss" scoped>
.mine {
  display: flex;
  .left {
    img{
      width: 200px;
      height: 200px;
    }
  }
  .right {
    margin-left: 20px;
    p{
      font-size: 20px;
      padding: 10px 0;
    }
  }
}
</style>