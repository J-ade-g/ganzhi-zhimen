// Vercel Serverless Function for Admin
const db = require('../database-mongodb');

module.exports = async (req, res) => {
    // 设置CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { method } = req;
    const path = req.url;

    try {
        // 获取所有用户
        if (path.includes('/users') && method === 'GET') {
            const users = await db.getAllUsers();
            res.status(200).json({ success: true, users });
            return;
        }

        // 获取所有记录
        if (path.includes('/records') && method === 'GET') {
            const records = await db.getAllRecords();
            res.status(200).json({ success: true, records });
            return;
        }

        // 获取统计数据
        if (path.includes('/stats') && method === 'GET') {
            const stats = await db.getStats();
            res.status(200).json({ success: true, stats });
            return;
        }

        res.status(404).json({ error: 'Not found' });
    } catch (error) {
        console.error('Admin API Error:', error);
        res.status(500).json({ error: '服务器错误' });
    }
};
