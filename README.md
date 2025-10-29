# 简化版 Web 应用

这是一个简单的全栈 Web 应用，包含 Node.js 后端和前端界面。

## 功能特性

- Express.js 后端服务器
- 静态文件服务
- RESTful API 接口
- 响应式前端界面
- 实时数据交互

## 运行方法

### 1. 安装依赖
```bash
npm install
```

### 2. 启动应用
```bash
npm start
```

### 3. 开发模式（自动重启）
```bash
npm run dev
```

## 访问应用

启动后在浏览器中访问：http://localhost:3000

## 项目结构

```
简化版/
├── package.json          # 项目配置和依赖
├── server.js            # Express 服务器
├── README.md           # 项目说明
└── public/             # 静态文件目录
    ├── index.html      # 主页面
    ├── style.css       # 样式文件
    └── script.js       # 前端脚本
```

## API 接口

- `GET /api/hello` - 获取问候消息
- `GET /api/time` - 获取当前时间