// Vercel Serverless Function for Records
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
            // 保存记录
            const recordData = body;
            recordData.id = Date.now().toString();
            recordData.createdAt = new Date().toISOString();
            
            res.status(200).json({ 
                success: true, 
                record: recordData,
                message: '记录已保存到本地存储'
            });
            return;
        }

        res.status(404).json({ error: 'Not found' });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: '服务器错误' });
    }
};
