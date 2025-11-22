# 🌿 感知之门 - 自然探索应用

一个帮助用户通过个性化任务探索自然、记录感官体验的Web应用。

## ✨ 功能特性

### 用户功能
- **多用户系统**：注册/登录，独立的用户数据
- **个性化任务**：基于用户资料推荐感知任务
- **多媒体记录**：文字、图片、录音记录
- **拍照功能**：直接调用摄像头拍照
- **数据统计**：个人探索数据统计

### 管理员功能
- **实时数据监控**：查看所有用户数据
- **用户行为分析**：年龄分布、兴趣热度等
- **数据导出**：完整数据JSON导出
- **统计图表**：可视化数据分析

## 🚀 部署方式

### 方式1：Vercel部署（推荐）

1. **准备GitHub仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用户名/ganzhi-zhimen.git
   git push -u origin main
   ```

2. **部署到Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用GitHub账号登录
   - 点击"New Project"
   - 选择你的GitHub仓库
   - 点击"Deploy"

3. **访问应用**
   - 用户端：`https://你的项目名.vercel.app`
   - 管理后台：`https://你的项目名.vercel.app/admin`

### 方式2：本地运行

```bash
# 安装依赖
npm install

# 启动应用
npm start

# 访问地址
# 用户端：http://localhost:8080
# 管理后台：http://localhost:8080/admin
```

## 📱 使用说明

### 用户使用流程
1. **注册账号**：填写用户名、邮箱、密码
2. **完善资料**：年龄、居住地、兴趣等信息
3. **选择任务**：从3个个性化任务中选择
4. **记录体验**：文字、图片、录音记录感受
5. **查看统计**：个人探索数据和历史记录

### 管理员使用
1. **访问后台**：`/admin` 路径
2. **查看数据**：用户统计、记录分析
3. **导出数据**：JSON格式完整数据导出

## 🛠️ 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **后端**：Node.js, Express.js
- **数据存储**：内存数据库（可扩展为MongoDB/MySQL）
- **部署**：Vercel (支持自动部署)

## 📊 数据结构

### 用户数据
```json
{
  "id": "用户ID",
  "username": "用户名",
  "email": "邮箱",
  "createdAt": "注册时间",
  "profile": {
    "age": 25,
    "gender": "性别",
    "location": "居住地类型",
    "interests": ["兴趣标签"]
  }
}
```

### 记录数据
```json
{
  "id": "记录ID",
  "userId": "用户ID",
  "task": "任务信息",
  "textRecord": "文字记录",
  "images": ["图片信息"],
  "audioData": "录音信息",
  "timestamp": "记录时间"
}
```

## 🔒 隐私保护

- 用户密码采用明文存储（演示版本，生产环境应加密）
- 媒体文件使用Blob URL，仅在当前会话有效
- 用户数据按ID隔离，互不干扰

## 📈 扩展计划

- [ ] 真实数据库集成（MongoDB/PostgreSQL）
- [ ] 用户密码加密
- [ ] 媒体文件云存储
- [ ] 实时通知系统
- [ ] 移动端APP
- [ ] 社交分享功能

## 📞 联系方式

如有问题或建议，请联系开发团队。

---

**感知之门** - 让每个人都能重新发现自然的美好 🌿