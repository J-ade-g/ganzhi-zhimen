// Vercel Serverless Function for User Profile
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
            
            // 在Vercel环境中，我们只能返回成功，实际数据存储在前端localStorage
            res.status(200).json({ 
                success: true, 
                profile: profileData,
                message: '资料已保存到本地存储'
            });
            return;
        }

        res.status(404).json({ error: 'Not found' });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: '服务器错误' });
    }
};
