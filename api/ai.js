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
    console.log('开始调用通义千问API...');
    console.log('API Key存在:', !!QWEN_API_KEY);
    
    if (!QWEN_API_KEY) {
        console.error('错误：未配置QWEN_API_KEY环境变量');
        throw new Error('未配置通义千问API Key');
    }

    const requestData = {
        model: requestBody.model || 'qwen-turbo',
        input: requestBody.input,
        parameters: {
            temperature: requestBody.temperature || 0.7,
            top_p: requestBody.top_p || 0.8,
            max_tokens: requestBody.max_tokens || 1024
        }
    };
    
    console.log('请求数据:', JSON.stringify(requestData, null, 2));

    try {
        const response = await fetch(QWEN_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${QWEN_API_KEY}`,
                'X-DashScope-SSE': 'disable'
            },
            body: JSON.stringify(requestData)
        });

        console.log('API响应状态:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API错误响应:', errorText);
            let error;
            try {
                error = JSON.parse(errorText);
            } catch (e) {
                error = { message: errorText };
            }
            throw new Error(`通义千问调用失败 (${response.status}): ${error.message || error.code || '未知错误'}`);
        }

        const result = await response.json();
        console.log('API成功响应:', JSON.stringify(result, null, 2));
        return result;
    } catch (error) {
        console.error('调用通义千问时发生错误:', error);
        throw error;
    }
}
