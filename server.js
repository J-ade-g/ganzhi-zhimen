const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;

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

// 保存用户信息
app.post('/api/users', (req, res) => {
  try {
    const userData = req.body;
    userData.id = Date.now().toString();
    userData.createdAt = new Date().toISOString();
    
    const users = readJSONFile(USERS_FILE);
    users.push(userData);
    
    if (writeJSONFile(USERS_FILE, users)) {
      res.json({ success: true, userId: userData.id });
    } else {
      res.status(500).json({ error: '保存用户信息失败' });
    }
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
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
    
    const records = readJSONFile(RECORDS_FILE);
    records.push(recordData);
    
    if (writeJSONFile(RECORDS_FILE, records)) {
      res.json({ success: true, recordId: recordData.id });
    } else {
      res.status(500).json({ error: '保存记录失败' });
    }
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
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

// 默认路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🌿 感知之门应用运行在 http://localhost:${PORT}`);
  console.log('数据存储目录:', DATA_DIR);
});