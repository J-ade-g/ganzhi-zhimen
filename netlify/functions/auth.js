// Netlify Function for Authentication
const db = require('../../database');

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
    const path = req.url;

    try {
        // 登录
        if (path.includes('/login') && method === 'POST') {
            const { username, password } = body;
            
            const user = db.findUser({ username, email: username });
            if (user && user.password === password) {
                res.status(200).json({ 
                    success: true, 
                    user: { 
                        id: user.id, 
                        username: user.username, 
                        email: user.email 
                    } 
                });
            } else {
                res.status(401).json({ success: false, error: '用户名或密码错误' });
            }
            return;
        }

        // 注册
        if (path.includes('/register') && method === 'POST') {
            const userData = body;
            
            const existingUser = db.findUser({ username: userData.username, email: userData.email });
            if (existingUser) {
                res.status(400).json({ success: false, error: '用户名或邮箱已存在' });
                return;
            }
            
            const newUser = db.addUser(userData);
            res.status(200).json({ 
                success: true, 
                user: { 
                    id: newUser.id, 
                    username: newUser.username, 
                    email: newUser.email 
                } 
            });
            return;
        }

        res.status(404).json({ error: 'Not found' });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: '服务器错误' });
    }
};
