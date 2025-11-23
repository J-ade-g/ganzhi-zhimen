# 🗄️ MongoDB + Railway 完整部署指南

## 📋 准备工作检查清单

- [ ] MongoDB Atlas账号已注册
- [ ] 数据库集群已创建
- [ ] 数据库用户已创建
- [ ] 网络访问已设置（0.0.0.0/0）
- [ ] 连接字符串已获取

---

## 第一步：MongoDB Atlas设置（已完成？）

如果还没完成，请按以下步骤操作：

### 1. 注册MongoDB Atlas
访问：https://www.mongodb.com/cloud/atlas/register

### 2. 创建免费集群
- 选择 M0 Free 套餐
- 区域：Singapore 或 Hong Kong
- 集群名称：Cluster0（默认）

### 3. 创建数据库用户
- Username: `ganzhi_user`
- Password: （自动生成并记下来）

### 4. 设置网络访问
- Network Access → Add IP Address
- 选择 "Allow Access from Anywhere"
- IP: 0.0.0.0/0

### 5. 获取连接字符串
- Database → Connect → Connect your application
- 复制连接字符串：
  ```
  mongodb+srv://ganzhi_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
  ```
- 替换 `<password>` 为你的实际密码

---

## 第二步：部署到Railway

### 1. 注册Railway
访问：https://railway.app/

- 用GitHub账号登录（推荐）
- 完全免费，每月$5额度

### 2. 创建新项目
- 点击 "New Project"
- 选择 "Deploy from GitHub repo"
- 选择 `ganzhi-zhimen` 仓库

### 3. 配置环境变量
在Railway项目中：
- 点击项目
- 点击 "Variables" 标签
- 添加环境变量：

```
MONGODB_URI=mongodb+srv://ganzhi_user:你的密码@cluster0.xxxxx.mongodb.net/ganzhi_zhimen?retryWrites=true&w=majority
PORT=8080
```

**重要：** 
- 把 `你的密码` 替换成实际密码
- 确保连接字符串末尾添加了数据库名 `/ganzhi_zhimen`

### 4. 部署
- Railway会自动检测到Node.js项目
- 自动安装依赖
- 自动启动服务器
- 等待1-2分钟

### 5. 获取网址
- 部署成功后，点击 "Settings"
- 找到 "Domains"
- 点击 "Generate Domain"
- 你会得到一个网址，如：
  ```
  https://ganzhi-zhimen-production.up.railway.app
  ```

---

## 第三步：更新前端API地址

### 方法A：使用Railway域名（推荐）

前端代码已经配置为使用相对路径 `/api/*`，所以：

1. **将前端部署到Railway的public文件夹**（已配置）
2. **访问Railway提供的域名**
3. **完成！**

### 方法B：前端和后端分离部署

如果你想前端部署到GitHub Pages，后端在Railway：

1. 修改 `public/script-new.js` 中的API地址：
   ```javascript
   const API_BASE = 'https://你的railway域名.up.railway.app';
   
   fetch(`${API_BASE}/api/auth/login`, {
       // ...
   })
   ```

2. 在Railway的server.js中确保CORS允许你的前端域名

---

## 第四步：测试

### 1. 访问应用
打开Railway提供的网址

### 2. 测试注册
- 注册一个新用户
- 应该能成功

### 3. 测试登录
- 用刚注册的账号登录
- 应该能进入应用

### 4. 测试记录
- 创建一条记录
- 上传图片
- 录音

### 5. 测试后台管理
- 访问 `你的网址/admin.html`
- 用demo/123456登录
- 应该能看到所有用户数据

### 6. 验证数据库
- 回到MongoDB Atlas
- 点击 "Browse Collections"
- 应该能看到：
  - users 集合（用户数据）
  - profiles 集合（用户资料）
  - records 集合（记录数据）

---

## 🎯 完成后你将拥有

- ✅ 全球可访问的网址
- ✅ 所有用户数据集中存储在MongoDB
- ✅ 你可以在后台查看所有数据
- ✅ 数据永久保存，不会丢失
- ✅ 支持手机和电脑访问
- ✅ 完全免费（MongoDB 512MB + Railway $5/月额度）

---

## 🔧 常见问题

### Q1: Railway部署失败？
**A:** 检查：
- package.json中是否有mongodb依赖
- 环境变量MONGODB_URI是否正确设置
- 查看Railway的部署日志

### Q2: 无法连接数据库？
**A:** 检查：
- MongoDB网络访问是否设置为0.0.0.0/0
- 连接字符串中的密码是否正确
- 连接字符串末尾是否有数据库名

### Q3: 在中国访问慢？
**A:** 
- MongoDB选择Singapore或Hong Kong区域
- Railway自动使用全球CDN
- 如果还是慢，考虑使用国内服务器

### Q4: 如何备份数据？
**A:** 
- 在MongoDB Atlas中可以设置自动备份
- 或在后台管理页面导出数据

---

## 📞 需要帮助？

如果遇到问题：
1. 检查Railway部署日志
2. 检查MongoDB连接状态
3. 查看浏览器控制台错误
4. 联系我获取支持

---

## 🎉 恭喜！

完成这些步骤后，你的应用就完全部署好了！

所有用户的数据都会安全地存储在MongoDB云数据库中，你可以随时在后台管理系统中查看和导出数据。
