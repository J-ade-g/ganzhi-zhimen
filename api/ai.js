// AI服务API - 调用国内大模型

// ==================== 配置 ====================

// 智谱AI配置
const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY || '';
const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

// 通义千问配置
const QWEN_API_KEY = process.env.QWEN_API_KEY || '';
const QWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

module.exports = async (req, res) => {
    // 设置CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { method, body } = req;
    const path = req.url;

    try {
        // 智谱AI接口
        if (path.includes('/zhipu') && method === 'POST') {
            const result = await callZhipuAI(body);
            res.status(200).json(result);
            return;
        }

        // 通义千问接口
        if (path.includes('/qwen') && method === 'POST') {
            const result = await callQwenAI(body);
            res.status(200).json(result);
            return;
        }

        res.status(404).json({ error: 'Not found' });
    } catch (error) {
        console.error('AI API Error:', error);
        res.status(500).json({ error: '服务器错误', details: error.message });
    }
};

// ==================== 智谱AI调用 ====================

async function callZhipuAI(requestBody) {
    if (!ZHIPU_API_KEY) {
        throw new Error('未配置智谱AI API Key');
    }

    const response = await fetch(ZHIPU_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ZHIPU_API_KEY}`
        },
        body: JSON.stringify({
            model: requestBody.model || 'glm-4',
            messages: requestBody.messages,
            temperature: requestBody.temperature || 0.7,
            top_p: requestBody.top_p || 0.7,
            max_tokens: requestBody.max_tokens || 1024
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`智谱AI调用失败: ${error.error?.message || '未知错误'}`);
    }

    return await response.json();
}

// ==================== 通义千问调用 ====================

async function callQwenAI(requestBody) {
    if (!QWEN_API_KEY) {
        throw new Error('未配置通义千问API Key');
    }

    const response = await fetch(QWEN_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${QWEN_API_KEY}`,
            'X-DashScope-SSE': 'disable'
        },
        body: JSON.stringify({
            model: requestBody.model || 'qwen-turbo',
            input: requestBody.input,
            parameters: {
                temperature: requestBody.temperature || 0.7,
                top_p: requestBody.top_p || 0.8,
                max_tokens: requestBody.max_tokens || 1024
            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`通义千问调用失败: ${error.message || '未知错误'}`);
    }

    return await response.json();
}
