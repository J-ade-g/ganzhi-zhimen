// Vercel Serverless Function for User Profile
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

    const { method, body } = req;

    try {
        if (method === 'POST') {
            // 保存用户资料
            const profileData = body;
            const savedProfile = await db.saveProfile(profileData);
            
            res.status(200).json({ 
                success: true, 
                profile: savedProfile
            });
            return;
        }

        if (method === 'GET') {
            // 获取用户资料
            const userId = req.query.userId;
            if (!userId) {
                res.status(400).json({ error: '缺少userId参数' });
                return;
            }
            
            const profile = await db.getProfile(userId);
            res.status(200).json({ 
                success: true, 
                profile: profile || null
            });
            return;
        }

        res.status(404).json({ error: 'Not found' });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: '服务器错误' });
    }
};
