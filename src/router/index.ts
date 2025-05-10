import { createRouter, createWebHashHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    meta: { titile: '登录' },
    component: () => import('../views/Login.vue')
  },
  {
    path: '/index',
    meta: { titile: 'Leo酒店信息综合平台' },
    component: () => import('../views/Index.vue'),
    children: [
      {
        path: '', // 默认子路由
        meta: { titile: '首页' },
        component: () => import('../views/Home.vue')
      },
      {
        path: '/mail',
        meta: { titile: '邮件' },
        component: () => import('../views/Mail.vue')
      },
      {
        path: '/message',
        meta: { titile: '消息' },
        component: () => import('../views/Message.vue')
      },
      {
        path: '/mine',
        meta: { titile: '个人中心' },
        component: () => import('../views/user/Mine.vue')
      },
      {
        path: '/setpwd',
        meta: { titile: '修改密码' },
        component: () => import('../views/user/SetPwd.vue')
      },
      {
        path: 'role',
        meta: { titile: '角色管理' },
        component: () => import('../views/user/Role.vue')
      },
      {
        path: 'user',
        meta: { titile: '用户管理' },
        component: () => import('../views/user/User.vue')
      },
      {
        path: 'roomtype',
        meta: {titile: '房型管理'},
        component: () => import('../views/room/RoomType.vue')
      },
      {
        path: 'room',
        meta: {titile: '房间管理'},
        component: () => import('../views/room/Room.vue')
      },
      {
        path: 'checkin',
        meta: {titile: '入住管理'},
        component: () => import('../views/custom/CheckIn.vue')
      },
      {
        path: 'order',
        meta: {titile: '订单管理'},
        component: () => import('../views/custom/Order.vue')
      },
      {
        path: 'menu',
        meta: {titile: '菜单管理'},
        component: () => import('../views/system/Menu.vue')
      },
      {
        path: 'dict',
        meta: {titile: '字典管理'},
        component: () => import('../views/system/Dict.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  NProgress.start();
  next();
})
router.afterEach((to, from)=>{
  if (to.meta && (to.meta as { titile?: string }).titile) {
    document.title = (to.meta as { titile: string }).titile;
  }
  NProgress.done();
})


export default router