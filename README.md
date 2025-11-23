# 🌿 感知之门 - 自然探索应用

一个帮助人们重新连接自然、记录感知体验的Web应用。

## ✨ 功能特点

- 🚪 **个性化感知之门**：根据用户环境和兴趣推荐任务
- 📝 **多维度记录**：文字、图片、录音、感官体验
- 📊 **数据可视化**：按日历查看、统计分析
- 🎨 **空灵设计**：优雅的用户界面
- 📱 **移动端优化**：支持手机访问和拍照录音

## 🚀 快速开始

### 本地运行

```bash
# 安装依赖
npm install

# 启动服务器
npm start

# 访问应用
# 主应用：http://localhost:8080
# 后台管理：http://localhost:8080/admin.html
```

### 部署到线上

**最简单的方式：一键部署到Vercel**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/你的用户名/你的仓库名)

或者手动部署：

```bash
# 安装Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel
```

详细部署指南请查看 [部署指南.md](./部署指南.md)

## 📱 移动端使用

1. 在手机浏览器打开部署后的网址
2. 点击浏览器菜单
3. 选择"添加到主屏幕"
4. 像APP一样使用！

## 🔐 管理员账号

默认管理员账号：
- 用户名：`demo`
- 密码：`123456`

**⚠️ 部署后请立即修改密码！**

## 📂 项目结构

```
简化版/
├── public/              # 前端文件
│   ├── index.html      # 主页面
│   ├── script-new.js   # 主应用逻辑
│   ├── admin.js        # 后台管理逻辑
│   └── style.css       # 样式文件
├── server.js           # 后端服务器
├── database.js         # 数据库模块
├── vercel.json         # Vercel配置
└── package.json        # 项目配置
```

## 🛠️ 技术栈

- **前端**：原生JavaScript、HTML5、CSS3
- **后端**：Node.js、Express
- **部署**：Vercel
- **存储**：LocalStorage（可升级为MongoDB）

## 📊 后台管理

访问 `/admin.html` 查看：
- 📈 用户统计分析
- 📝 记录数据管理
- 📉 趋势分析
- 💾 数据导出

## 🔄 升级到数据库版本

如需所有用户数据集中管理：

1. 注册MongoDB Atlas（免费）
2. 获取连接字符串
3. 在Vercel中设置环境变量
4. 联系开发者获取数据库版本代码

## 📝 开发计划

- [ ] 添加数据库支持
- [ ] 用户数据导出功能
- [ ] 社区分享功能
- [ ] 离线模式支持
- [ ] 多语言支持

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 💬 联系方式

如有问题或建议，欢迎联系！
