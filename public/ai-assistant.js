// AI助手模块 - 接入国内大模型

// ==================== 配置 ====================

const AI_CONFIG = {
    // 选择使用的AI服务商
    provider: 'qwen', // 使用通义千问
    
    // API配置（需要在环境变量中设置）
    apiKey: '', // 从环境变量获取
    apiUrl: '',
    
    // 功能开关
    enableTaskRecommendation: false, // 暂不启用（成本考虑）
    enableRecordAnalysis: true,      // 启用记录分析
    enableChatAssistant: true,       // 启用聊天助手
    enableImageRecognition: false    // 暂不启用
};

// ==================== 1. AI任务推荐 ====================

/**
 * 使用AI生成个性化任务推荐
 * @param {Object} userProfile - 用户资料
 * @param {Array} historyRecords - 历史记录
 * @returns {Promise<Array>} 推荐的任务列表
 */
async function getAITaskRecommendations(userProfile, historyRecords) {
    if (!AI_CONFIG.enableTaskRecommendation) {
        return null;
    }
    
    const prompt = `
你是一个自然感知体验的专家。请根据用户的资料和历史记录，推荐3个适合的自然感知任务。

用户资料：
- 年龄：${userProfile.age}岁
- 居住地：${userProfile.location}
- 绿色含量：${userProfile.greenLevel}
- 兴趣：${userProfile.interests?.join('、') || '无'}
- 历史记录数：${historyRecords.length}条

请以JSON格式返回，每个任务包含：
{
    "title": "任务名称",
    "description": "任务描述（20字内）",
    "icon": "emoji图标",
    "category": "类别（visual/auditory/tactile/olfactory）",
    "difficulty": "难度（easy/medium/hard）",
    "reason": "推荐理由"
}

只返回JSON数组，不要其他文字。
`;

    try {
        const response = await callAIAPI(prompt);
        return JSON.parse(response);
    } catch (error) {
        console.error('AI任务推荐失败:', error);
        return null;
    }
}

// ==================== 2. 记录分析与反馈 ====================

/**
 * 分析用户的感知记录，提供反馈
 * @param {Object} record - 用户记录
 * @returns {Promise<Object>} 分析结果
 */
async function analyzeRecord(record) {
    if (!AI_CONFIG.enableRecordAnalysis) {
        return null;
    }
    
    const prompt = `
你是一个自然感知体验的分析师。请分析用户的这条记录，提供鼓励性的反馈。

任务：${record.task?.title}
文字记录：${record.textRecord || '无'}
视觉感受：${record.sensoryExperience?.visual || '无'}
听觉感受：${record.sensoryExperience?.auditory || '无'}
触觉感受：${record.sensoryExperience?.tactile || '无'}
嗅觉感受：${record.sensoryExperience?.olfactory || '无'}
自然连接感：${record.natureConnection}/5分

请提供：
1. 简短的鼓励评语（30字内）
2. 感知深度评分（1-5分）
3. 一个具体的改进建议（20字内）

以JSON格式返回：
{
    "encouragement": "鼓励评语",
    "depthScore": 评分数字,
    "suggestion": "改进建议"
}
`;

    try {
        const response = await callAIAPI(prompt);
        return JSON.parse(response);
    } catch (error) {
        console.error('记录分析失败:', error);
        return null;
    }
}

// ==================== 3. 智能问答助手 ====================

/**
 * AI聊天助手
 * @param {string} userMessage - 用户消息
 * @param {Array} chatHistory - 聊天历史
 * @returns {Promise<string>} AI回复
 */
async function chatWithAI(userMessage, chatHistory = []) {
    if (!AI_CONFIG.enableChatAssistant) {
        return '抱歉，AI助手功能暂未启用。';
    }
    
    const systemPrompt = `
你是"感知之门"应用的AI助手，专注于帮助用户更好地感知和连接自然。
你的回答应该：
1. 简洁明了（50字内）
2. 富有启发性
3. 鼓励用户亲身体验
4. 避免过于学术化的语言
`;

    const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory,
        { role: 'user', content: userMessage }
    ];
    
    try {
        const response = await callAIAPI(messages, true);
        return response;
    } catch (error) {
        console.error('AI对话失败:', error);
        return '抱歉，我暂时无法回答。请稍后再试。';
    }
}

// ==================== 4. 图片识别辅助 ====================

/**
 * 识别图片中的自然元素
 * @param {string} imageBase64 - 图片的Base64编码
 * @returns {Promise<Object>} 识别结果
 */
async function recognizeNatureImage(imageBase64) {
    if (!AI_CONFIG.enableImageRecognition) {
        return null;
    }
    
    const prompt = `
请识别这张图片中的自然元素，包括：
1. 主要对象（植物、动物、地质等）
2. 可能的物种名称
3. 简短的描述

以JSON格式返回：
{
    "mainObject": "主要对象",
    "species": "物种名称（如果能识别）",
    "description": "简短描述"
}
`;

    try {
        const response = await callAIAPIWithImage(prompt, imageBase64);
        return JSON.parse(response);
    } catch (error) {
        console.error('图片识别失败:', error);
        return null;
    }
}

// ==================== API调用封装 ====================

/**
 * 调用AI API的通用函数
 * @param {string|Array} prompt - 提示词或消息数组
 * @param {boolean} isChat - 是否为对话模式
 * @returns {Promise<string>} AI响应
 */
async function callAIAPI(prompt, isChat = false) {
    // 这里需要根据选择的AI服务商实现具体的API调用
    
    // 示例：智谱AI (GLM-4)
    if (AI_CONFIG.provider === 'zhipu') {
        return await callZhipuAI(prompt, isChat);
    }
    
    // 示例：通义千问
    if (AI_CONFIG.provider === 'qwen') {
        return await callQwenAI(prompt, isChat);
    }
    
    throw new Error('未配置AI服务商');
}

/**
 * 调用智谱AI
 */
async function callZhipuAI(prompt, isChat) {
    const response = await fetch('/api/ai/zhipu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'glm-4',
            messages: isChat ? prompt : [{ role: 'user', content: prompt }],
            temperature: 0.7
        })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * 调用通义千问
 */
async function callQwenAI(prompt, isChat) {
    try {
        const response = await fetch('/api/ai/qwen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen-turbo',
                input: {
                    messages: isChat ? prompt : [{ role: 'user', content: prompt }]
                }
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API响应错误:', response.status, errorText);
            throw new Error(`API调用失败: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API返回数据:', data);
        
        // 检查返回数据结构
        if (data.output && data.output.text) {
            return data.output.text;
        } else if (data.choices && data.choices[0]) {
            return data.choices[0].message.content;
        } else {
            console.error('未知的返回数据格式:', data);
            throw new Error('API返回数据格式错误');
        }
    } catch (error) {
        console.error('调用通义千问失败:', error);
        throw error;
    }
}

/**
 * 带图片的API调用
 */
async function callAIAPIWithImage(prompt, imageBase64) {
    // 实现多模态API调用
    // 需要支持图片输入的模型，如GLM-4V、Qwen-VL等
    throw new Error('图片识别功能待实现');
}

// ==================== UI集成 ====================

/**
 * 显示AI助手对话界面
 */
function showAIChatInterface() {
    const chatHTML = `
        <div class="ai-chat-container" id="aiChatContainer">
            <div class="ai-chat-header">
                <h3>🤖 AI助手</h3>
                <button onclick="closeAIChat()">✕</button>
            </div>
            <div class="ai-chat-messages" id="aiChatMessages">
                <div class="ai-message">
                    你好！我是感知之门的AI助手。有什么关于自然感知的问题吗？
                </div>
            </div>
            <div class="ai-chat-input">
                <input type="text" id="aiChatInput" placeholder="输入你的问题...">
                <button onclick="sendAIMessage()">发送</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', chatHTML);
}

/**
 * 发送消息给AI
 */
async function sendAIMessage() {
    const input = document.getElementById('aiChatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // 显示用户消息
    addChatMessage(message, 'user');
    input.value = '';
    
    // 显示加载状态
    addChatMessage('思考中...', 'ai', true);
    
    // 调用AI
    const response = await chatWithAI(message);
    
    // 移除加载状态，显示AI回复
    removeChatLoading();
    addChatMessage(response, 'ai');
}

/**
 * 添加聊天消息
 */
function addChatMessage(message, sender, isLoading = false) {
    const messagesContainer = document.getElementById('aiChatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `${sender}-message ${isLoading ? 'loading' : ''}`;
    messageDiv.textContent = message;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * 移除加载状态
 */
function removeChatLoading() {
    const loading = document.querySelector('.loading');
    if (loading) loading.remove();
}

/**
 * 关闭AI对话
 */
function closeAIChat() {
    const container = document.getElementById('aiChatContainer');
    if (container) container.remove();
}

// ==================== 导出函数 ====================

window.getAITaskRecommendations = getAITaskRecommendations;
window.analyzeRecord = analyzeRecord;
window.chatWithAI = chatWithAI;
window.recognizeNatureImage = recognizeNatureImage;
window.showAIChatInterface = showAIChatInterface;
window.sendAIMessage = sendAIMessage;
window.closeAIChat = closeAIChat;
