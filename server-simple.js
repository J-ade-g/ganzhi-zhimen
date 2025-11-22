const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// 中间件
app.use(express.static('public'));

// 默认路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🌿 感知之门应用运行在 http://localhost:${PORT}`);
});