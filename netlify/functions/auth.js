// Netlify Function for Authentication
const db = require('../../database');

exports.handler = async (event, context) => {
    // 设置CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    // 处理OPTIONS请求
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const path = event.path;

        // 登录
        if (path.includes('/login') || event.httpMethod === 'POST') {
            const { username, password } = body;
            
            const user = db.findUser({ username, email: username });
            if (user && user.password === password) {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ 
                        success: true, 
                        user: { 
                            id: user.id, 
                            username: user.username, 
                            email: user.email 
                        } 
                    })
                };
            } else {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ success: false, error: '用户名或密码错误' })
                };
            }
        }

        // 注册
        if (path.includes('/register')) {
            const userData = body;
            
            const existingUser = db.findUser({ username: userData.username, email: userData.email });
            if (existingUser) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ success: false, error: '用户名或邮箱已存在' })
                };
            }
            
            const newUser = db.addUser(userData);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true, 
                    user: { 
                        id: newUser.id, 
                        username: newUser.username, 
                        email: newUser.email 
                    } 
                })
            };
        }

        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Not found' })
        };
    } catch (error) {
        console.error('Function Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: '服务器错误: ' + error.message })
        };
    }
};
