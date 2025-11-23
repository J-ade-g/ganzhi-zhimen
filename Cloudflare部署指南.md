# 🌐 Cloudflare Pages 部署指南

## 为什么选择Cloudflare Pages？

- ✅ **在中国访问稳定** - 不会被墙
- ✅ **完全免费** - 无限流量
- ✅ **速度快** - 全球CDN
- ✅ **简单** - 5分钟完成

---

## 🚀 部署步骤

### 第一步：注册Cloudflare账号

1. 访问：https://dash.cloudflare.com/sign-up
2. 使用邮箱注册（免费）
3. 验证邮箱

### 第二步：创建Pages项目

1. 登录后，点击左侧 **"Workers & Pages"**
2. 点击 **"Create application"**
3. 选择 **"Pages"** 标签
4. 点击 **"Connect to Git"**

### 第三步：连接GitHub

1. 选择 **"GitHub"**
2. 授权Cloudflare访问你的GitHub
3. 选择仓库：**ganzhi-zhimen**
4. 点击 **"Begin setup"**

### 第四步：配置构建

```
Project name: ganzhi-zhimen
Production branch: main
Build command: (留空)
Build output directory: public
```

**重要：Build command留空！**

### 第五步：部署

1. 点击 **"Save and Deploy"**
2. 等待1-2分钟
3. 完成！

### 第六步：获取网址

部署成功后，你会得到一个网址：
```
https://ganzhi-zhimen.pages.dev
```

---

## 📱 测试

### 在中国测试
1. 用手机4G/5G网络访问
2. 用WiFi访问
3. 应该都能正常打开！

### 功能测试
1. 注册登录
2. 创建记录
3. 上传图片
4. 录音功能

---

## 🎯 自定义域名（可选）

如果你有域名：

1. 在Cloudflare Pages项目中
2. 点击 **"Custom domains"**
3. 点击 **"Set up a custom domain"**
4. 输入你的域名
5. 按提示配置DNS
6. 完成！

---

## 🔄 更新应用

当你修改代码后：

```bash
git add .
git commit -m "更新"
git push
```

Cloudflare会自动重新部署！

---

## ⚡ Cloudflare vs Vercel

| 特性 | Cloudflare Pages | Vercel |
|------|------------------|--------|
| 中国访问 | ✅ 稳定 | ⚠️ 不稳定 |
| 速度 | ⚡ 很快 | ⚡ 很快 |
| 免费额度 | ♾️ 无限 | ✅ 充足 |
| 部署难度 | ⭐ 简单 | ⭐ 简单 |
| Serverless | ✅ Workers | ✅ Functions |

---

## 🎉 完成后

你的应用将：
- ✅ 在中国稳定访问
- ✅ 支持手机和电脑
- ✅ 全球CDN加速
- ✅ 自动HTTPS
- ✅ 完全免费

---

## 📞 需要帮助？

如果遇到问题：
1. 检查GitHub仓库是否公开
2. 确认构建配置正确
3. 查看Cloudflare部署日志
4. 联系我获取支持

立即开始部署吧！🚀
