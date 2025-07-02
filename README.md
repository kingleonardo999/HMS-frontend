# 酒店管理系统

## 项目介绍

酒店管理系统是一个基于 Vite、TypeScript 和 Vue 构建的前端应用。该系统旨在提供酒店运营管理解决方案，包括客房管理、预订系统等基础功能模块。

## 当前功能

- **用户认证与授权**：基础的登录系统和权限控制
- **角色管理**：设置和分配不同的用户角色
- **用户管理**：查看、添加、编辑和删除用户，以及通过角色进行筛选
- **个人中心**：用户个人信息查看
- **房型管理**：支持富文本编辑器，用于绘声绘色描述房型
- **房间管理**：支持一键导出excel文件的功能，同样支持富文本编辑器
## 运行界面展示

-   登录

	![登录](https://imgs.161517.xyz/2025/05/24/PixPin_2025-05-24_15-42-47.gif)
	
-   添加角色，编辑角色和添加角色大同小异

    ![添加用户](https://imgs.161517.xyz/2025/05/24/PixPin_2025-05-24_15-44-48.gif)

-   删除用户

    ![删除用户](https://imgs.161517.xyz/2025/05/24/PixPin_2025-05-24_15-48-12.gif)

-   添加用户，编辑用户类似，删除用户同删除角色

    ![添加用户](https://imgs.161517.xyz/2025/05/24/PixPin_2025-05-24_15-51-30.gif)

-   筛选用户

    ![筛选用户](https://imgs.161517.xyz/2025/05/24/PixPin_2025-05-24_15-53-10.gif)

-   个人信息展示

    ![个人信息](https://imgs.161517.xyz/2025/05/24/PixPin_2025-05-24_15-53-47.png)
    
-   富文本编辑器展示

    ![富文本编辑器](https://imgs.161517.xyz/2025/05/25/PixPin_2025-05-25_20-57-52.gif)

-   一键导出excel，事实上即使没有执行查询，导出时也会根据筛选条件选择性导出

    ![导出excel](https://imgs.161517.xyz/2025/05/25/PixPin_2025-05-25_20-59-06.gif)

## 技术栈

- **前端框架**：Vue.js
- **构建工具**：Vite
- **编程语言**：TypeScript
- **UI 组件库**：Element Plus、WangEditor
- **路由管理**：Vue Router
- **API 通信**：Axios
- **样式方案**：CSS/SCSS

## 安装指南

### 前提条件

- Node.js (>=14.0.0)
- npm 或 yarn 或 pnpm

### 安装步骤

1. 克隆代码仓库
```bash
git clone https://github.com/kingleonardo999/hotel-management-system.git
cd hotel-management-system
```

2. 安装依赖
```bash
npm install
# 或使用 yarn
yarn
# 或使用 pnpm
pnpm install
```

3. 启动开发服务器
```bash
npm run dev
# 或使用 yarn
yarn dev
# 或使用 pnpm
pnpm dev
```

应用将在 http://localhost:5173 运行（或控制台输出的其他端口）。

## 项目构建

```bash
npm run build
# 或使用 yarn
yarn build
# 或使用 pnpm
pnpm build
```

编译后的文件将存放在 `dist` 目录下，可以部署到任何静态文件服务器。

## 项目结构

```
hotel-management-system/
├── public/              # 静态资源
├── src/                 # 源代码
│   ├── api/             # API 请求
│   ├── assets/          # 资源文件
│   ├── components/      # 共用组件
│   ├── router/          # 路由配置
│   ├── store/           # 状态管理
│   ├── utils/           # 工具函数
│   ├── views/           # 页面视图
│   ├── App.vue          # 应用入口组件
│   └── main.ts          # 应用入口文件
├── index.html           # HTML 模板
├── package.json         # 项目依赖和脚本
├── tsconfig.json        # TypeScript 配置
├── vite.config.ts       # Vite 配置
└── .env                 # 环境变量配置
```

## 开发计划

- 完善剩余的模块功能
- 增强用户权限控制
- 优化响应式设计

## 贡献指南

1. Fork 该仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add some feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 许可证

[MIT](./LICENSE)

## 联系方式

项目维护者：Leonardo King - kingleonardo320@gmail.com
