<template>
  <div class="mine">
    
    <div class="profile-card">
      <div class="avatar-section">
        <div class="avatar-container">
          <img :src="userStore.user.photo || '/default-avatar.png'" alt="头像" class="avatar">
          <div class="avatar-overlay">
            <el-icon class="edit-icon">
              <Edit />
            </el-icon>
          </div>
        </div>
        <div class="user-basic">
          <h3>{{ userStore.user.name || '未设置姓名' }}</h3>
          <p class="role-tag">{{ userStore.user.roleName || '普通用户' }}</p>
        </div>
      </div>
      
      <div class="info-section">
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">
              <el-icon class="info-icon">
                <User />
              </el-icon>
              <span>账号</span>
            </div>
            <div class="info-value">{{ userStore.user.loginId || '未设置' }}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">
              <el-icon class="info-icon">
                <UserFilled />
              </el-icon>
              <span>姓名</span>
            </div>
            <div class="info-value">{{ userStore.user.name || '未设置' }}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">
              <el-icon class="info-icon">
                <Medal />
              </el-icon>
              <span>角色</span>
            </div>
            <div class="info-value">
              <el-tag :type="getRoleTagType(userStore.user.roleName)" effect="light">
                {{ userStore.user.roleName || '普通用户' }}
              </el-tag>
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-label">
              <el-icon class="info-icon">
                <Phone />
              </el-icon>
              <span>电话</span>
            </div>
            <div class="info-value">{{ userStore.user.phone || '未设置' }}</div>
          </div>
        </div>
        
        <div class="actions">
          <el-button type="primary" :icon="Edit" @click="goToEditProfile">编辑资料</el-button>
          <el-button type="default" :icon="Key" @click="goToSetPassword">修改密码</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useUser from '../../store/user'
import { Edit, User, UserFilled, Medal, Phone, Key } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const userStore = useUser();
const router = useRouter();

// 根据角色名称返回对应的标签类型
const getRoleTagType = (roleName: string) => {
  switch (roleName) {
    case '管理员':
    case 'admin':
      return 'danger'
    case '前台':
    case 'reception':
      return 'warning'
    case '客服':
    case 'service':
      return 'success'
    default:
      return 'info'
  }
}

// 跳转到修改密码页面
const goToSetPassword = () => {
  router.push('/setpwd')
}

// 跳转到用户管理页面并编辑当前用户
const goToEditProfile = () => {
  // 跳转到用户管理页面，并传递当前用户的 loginId 作为参数
  router.push({
    path: '/index/user',
    query: { editUser: userStore.user.loginId }
  })
}
</script>

<style lang="scss" scoped>
.mine {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100%;
}

.profile-header {
  text-align: center;
  margin-bottom: 30px;
  
  h2 {
    color: #2c3e50;
    margin: 0 0 10px 0;
    font-size: 28px;
    font-weight: 600;
  }
  
  p {
    color: #7f8c8d;
    margin: 0;
    font-size: 16px;
  }
}

.profile-card {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
}

.avatar-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 30px;
  text-align: center;
  color: white;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }
  
  .avatar-container {
    position: relative;
    display: inline-block;
    margin-bottom: 20px;
    
    .avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 4px solid rgba(255, 255, 255, 0.3);
      object-fit: cover;
      transition: all 0.3s ease;
      position: relative;
      z-index: 2;
      
      &:hover {
        transform: scale(1.05);
        border-color: rgba(255, 255, 255, 0.5);
      }
    }
    
    .avatar-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: all 0.3s ease;
      cursor: pointer;
      z-index: 3;
      
      &:hover {
        opacity: 1;
      }
      
      .edit-icon {
        font-size: 24px;
        color: white;
      }
    }
  }
  
  .user-basic {
    position: relative;
    z-index: 2;
    
    h3 {
      margin: 0 0 10px 0;
      font-size: 24px;
      font-weight: 600;
    }
    
    .role-tag {
      background: rgba(255, 255, 255, 0.2);
      padding: 6px 16px;
      border-radius: 20px;
      display: inline-block;
      font-size: 14px;
      margin: 0;
      backdrop-filter: blur(10px);
    }
  }
}

.info-section {
  padding: 40px 30px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.info-item {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;
  
  &:hover {
    background: #e3f2fd;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }
  
  .info-label {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    color: #5a6c7d;
    font-weight: 500;
    font-size: 14px;
    
    .info-icon {
      margin-right: 8px;
      color: #667eea;
      font-size: 16px;
    }
  }
  
  .info-value {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    
    .el-tag {
      font-weight: 500;
    }
  }
}

.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  
  .el-button {
    padding: 12px 24px;
    font-size: 16px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
    
    &.el-button--primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      }
    }
    
    &.el-button--default {
      border: 2px solid #e1e8ed;
      color: #5a6c7d;
      
      &:hover {
        border-color: #667eea;
        color: #667eea;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .mine {
    padding: 10px;
  }
  
  .profile-card {
    margin: 0 10px;
  }
  
  .avatar-section {
    padding: 30px 20px;
    
    .avatar-container .avatar {
      width: 100px;
      height: 100px;
    }
    
    .user-basic h3 {
      font-size: 20px;
    }
  }
  
  .info-section {
    padding: 30px 20px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .actions {
    flex-direction: column;
    align-items: center;
    
    .el-button {
      width: 100%;
      max-width: 200px;
    }
  }
}

// 动画效果
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.profile-card {
  animation: fadeInUp 0.6s ease-out;
}

.info-item {
  animation: fadeInUp 0.6s ease-out;
  
  @for $i from 1 through 4 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.1}s;
    }
  }
}
</style>