const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 8080;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// 数据存储文件路径
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const RECORDS_FILE = path.join(DATA_DIR, 'records.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// 确保媒体目录存在
const MEDIA_DIR = path.join(__dirname, 'media');
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR);
}

// 静态文件服务 - 媒体文件
app.use('/media', express.static(MEDIA_DIR));

// 初始化数据文件
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, '[]');
}
if (!fs.existsSync(RECORDS_FILE)) {
  fs.writeFileSync(RECORDS_FILE, '[]');
}

// 工具函数：读取JSON文件
function readJSONFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取文件错误:', error);
    return [];
  }
}

// 工具函数：写入JSON文件
function writeJSONFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('写入文件错误:', error);
    return false;
  }
}

// API 路由

// 用户注册
app.post('/api/auth/register', (req, res) => {
  try {
    const userData = req.body;
    
    // 检查用户是否已存在
    const existingUser = db.findUser({ username: userData.username, email: userData.email });
    if (existingUser) {
      return res.status(400).json({ error: '用户名或邮箱已存在' });
    }
    
    const newUser = db.addUser(userData);
    res.json({ success: true, user: { id: newUser.id, username: newUser.username, email: newUser.email } });
  } catch (error) {
    res.status(500).json({ error: '注册失败' });
  }
});

// 用户登录
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = db.findUser({ username, email: username });
    if (user && user.password === password) {
      res.json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
    } else {
      res.status(401).json({ error: '用户名或密码错误' });
    }
  } catch (error) {
    res.status(500).json({ error: '登录失败' });
  }
});

// 保存用户资料
app.post('/api/users/profile', (req, res) => {
  try {
    const profileData = req.body;
    
    // 保存到JSON文件
    let profiles = readJSONFile(path.join(DATA_DIR, 'profiles.json')) || [];
    
    // 查找是否已存在该用户的资料
    const existingIndex = profiles.findIndex(p => p.userId === profileData.userId);
    if (existingIndex >= 0) {
      profiles[existingIndex] = { ...profiles[existingIndex], ...profileData };
    } else {
      profiles.push(profileData);
    }
    
    writeJSONFile(path.join(DATA_DIR, 'profiles.json'), profiles);
    
    res.json({ success: true, profile: profileData });
  } catch (error) {
    console.error('保存用户资料错误:', error);
    res.status(500).json({ error: '保存用户资料失败' });
  }
});

// 获取个性化任务
app.post('/api/tasks/generate', (req, res) => {
  try {
    const userData = req.body;
    const task = generatePersonalizedTask(userData);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: '生成任务失败' });
  }
});

// 保存用户记录
app.post('/api/records', (req, res) => {
  try {
    const recordData = req.body;
    recordData.id = Date.now().toString();
    recordData.createdAt = new Date().toISOString();
    
    const savedRecord = db.addRecord(recordData);
    res.json({ success: true, record: savedRecord });
  } catch (error) {
    res.status(500).json({ error: '保存记录失败' });
  }
});

// 获取用户记录
app.get('/api/records/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const records = readJSONFile(RECORDS_FILE);
    const userRecords = records.filter(record => record.userId === userId);
    res.json(userRecords);
  } catch (error) {
    res.status(500).json({ error: '获取记录失败' });
  }
});

// 获取统计数据
app.get('/api/stats/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const records = readJSONFile(RECORDS_FILE);
    const userRecords = records.filter(record => record.userId === userId);
    
    const stats = {
      totalRecords: userRecords.length,
      totalDays: new Set(userRecords.map(r => r.createdAt.split('T')[0])).size,
      sensoryChannels: {
        text: userRecords.filter(r => r.textRecord && r.textRecord.trim()).length,
        visual: userRecords.filter(r => r.sensoryExperience?.visual).length,
        auditory: userRecords.filter(r => r.sensoryExperience?.auditory).length,
        tactile: userRecords.filter(r => r.sensoryExperience?.tactile).length,
        olfactory: userRecords.filter(r => r.sensoryExperience?.olfactory).length
      }
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

// 管理员API - 获取所有用户数据
app.get('/api/admin/users', (req, res) => {
  try {
    const users = db.getAllUsers();
    const profiles = db.profiles;
    
    // 合并用户信息和资料
    const usersWithProfiles = users.map(user => {
      const profile = profiles.find(p => p.userId === user.id);
      return {
        ...user,
        profile: profile || null
      };
    });
    
    res.json(usersWithProfiles);
  } catch (error) {
    res.status(500).json({ error: '获取用户数据失败' });
  }
});

// 管理员API - 获取所有记录数据
app.get('/api/admin/records', (req, res) => {
  try {
    const records = db.getAllRecords();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: '获取记录数据失败' });
  }
});

// 管理员API - 获取统计数据
app.get('/api/admin/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

// 管理员后台页面
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// 任务生成逻辑
function generatePersonalizedTask(user) {
  const tasks = [];

  // 基于用户数据的个性化任务
  if (user.location === '城市' && user.interests.includes('植物识别')) {
    tasks.push({
      title: '城市植物探索',
      description: '识别你通勤路上最常见的3种行道树，并记录其中一种叶片的形状、颜色和触感。',
      duration: '15-20分钟',
      type: 'plant_identification'
    });
  }

  if (user.growthEnv === '乡村' && user.age >= 50) {
    tasks.push({
      title: '回忆中的自然智慧',
      description: '回忆并记录一条你小时候长辈教你的、关于天气或农作的谚语，并验证它现在的准确性。',
      duration: '10-15分钟',
      type: 'cultural_memory'
    });
  }

  if (user.contactFreq === '很少' || user.contactFreq === '每月') {
    tasks.push({
      title: '身边的自然声音',
      description: '今晚下班后，在你家附近找一个有绿植的地方静坐5分钟，记录你听到的3种不同声音。',
      duration: '10分钟',
      type: 'sound_exploration'
    });
  }

  if (user.interests.includes('摄影')) {
    tasks.push({
      title: '微距摄影挑战',
      description: '拍摄一组能体现当前季节特色的微距照片（如露珠、叶片纹理、花朵细节）。',
      duration: '20-30分钟',
      type: 'photography'
    });
  }

  // 通用任务
  const generalTasks = [
    {
      title: '感官全开体验',
      description: '选择一个自然环境，用5分钟时间专注体验：看到的颜色、听到的声音、闻到的气味、感受到的温度和质感。',
      duration: '10分钟',
      type: 'sensory_experience'
    },
    {
      title: '自然色彩收集',
      description: '收集你今天遇到的5种不同的自然色彩，可以是拍照、画画或文字描述。',
      duration: '15分钟',
      type: 'color_collection'
    }
  ];

  tasks.push(...generalTasks);
  
  // 随机选择任务
  const selectedTask = tasks[Math.floor(Math.random() * tasks.length)];
  selectedTask.id = Date.now().toString();
  
  return selectedTask;
}

// 测试页面路由
app.get('/test.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'test.html'));
});

// 调试页面路由
app.get('/debug.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'debug.html'));
});

// 默认路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🌿 感知之门应用运行在端口 ${PORT}`);
  console.log('数据存储目录:', DATA_DIR);
});

// 导出app供Vercel使用
module.exports = app;