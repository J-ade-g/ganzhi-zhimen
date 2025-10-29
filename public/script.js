// 全局变量
let userData = {};
let currentTask = {};

document.addEventListener('DOMContentLoaded', function() {
    // 检查是否已有用户数据
    const savedUserData = localStorage.getItem('userData');
    if (savedUserData) {
        userData = JSON.parse(savedUserData);
        showMainApp();
    } else {
        showUserForm();
    }

    // 绑定事件监听器
    bindEventListeners();
});

function bindEventListeners() {
    // 用户信息表单提交
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', handleUserFormSubmit);
    }

    // 任务相关按钮
    const startTaskBtn = document.getElementById('startTask');
    const changeTaskBtn = document.getElementById('changeTask');
    const saveRecordBtn = document.getElementById('saveRecord');
    const backToMainBtn = document.getElementById('backToMain');

    if (startTaskBtn) startTaskBtn.addEventListener('click', startTask);
    if (changeTaskBtn) changeTaskBtn.addEventListener('click', generateNewTask);
    if (saveRecordBtn) saveRecordBtn.addEventListener('click', saveRecord);
    if (backToMainBtn) backToMainBtn.addEventListener('click', showMainApp);
}

function showUserForm() {
    document.getElementById('userInfoForm').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('recordInterface').style.display = 'none';
}

function showMainApp() {
    document.getElementById('userInfoForm').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('recordInterface').style.display = 'none';
    
    updateWelcomeMessage();
    generateNewTask();
}

function showRecordInterface() {
    document.getElementById('userInfoForm').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('recordInterface').style.display = 'block';
    
    document.getElementById('currentTask').innerHTML = `<strong>当前任务：</strong>${currentTask.description}`;
}

function handleUserFormSubmit(e) {
    e.preventDefault();
    
    // 收集用户数据
    userData = {
        age: parseInt(document.getElementById('age').value),
        location: document.getElementById('location').value,
        growthEnv: document.getElementById('growthEnv').value,
        contactFreq: document.getElementById('contactFreq').value,
        interests: []
    };

    // 收集兴趣标签
    const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        userData.interests.push(checkbox.value);
    });

    // 保存到本地存储
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // 显示主应用
    showMainApp();
}

function updateWelcomeMessage() {
    const welcomeDiv = document.getElementById('userWelcome');
    const interests = userData.interests.length > 0 ? userData.interests.join('、') : '探索自然';
    welcomeDiv.innerHTML = `
        <strong>欢迎回来！</strong><br>
        ${userData.age}岁的自然探索者，居住在${userData.location}，对${interests}感兴趣
    `;
}

function generateNewTask() {
    // 根据用户数据生成个性化任务
    const task = generatePersonalizedTask(userData);
    currentTask = task;
    
    document.getElementById('taskContent').innerHTML = `
        <h3>🎯 ${task.title}</h3>
        <p>${task.description}</p>
        <small style="color: #666;">预计用时：${task.duration}</small>
    `;
}

function generatePersonalizedTask(user) {
    const tasks = [];

    // 基于居住地和兴趣的任务
    if (user.location === '城市' && user.interests.includes('植物识别')) {
        tasks.push({
            title: '城市植物探索',
            description: '识别你通勤路上最常见的3种行道树，并记录其中一种叶片的形状、颜色和触感。',
            duration: '15-20分钟'
        });
    }

    if (user.growthEnv === '乡村' && user.age >= 50) {
        tasks.push({
            title: '回忆中的自然智慧',
            description: '回忆并记录一条你小时候长辈教你的、关于天气或农作的谚语，并验证它现在的准确性。',
            duration: '10-15分钟'
        });
    }

    if (user.contactFreq === '很少' || user.contactFreq === '每月') {
        tasks.push({
            title: '身边的自然声音',
            description: '今晚下班后，在你家附近找一个有绿植的地方静坐5分钟，记录你听到的3种不同声音。',
            duration: '10分钟'
        });
    }

    if (user.interests.includes('摄影')) {
        tasks.push({
            title: '微距摄影挑战',
            description: '拍摄一组能体现当前季节特色的微距照片（如露珠、叶片纹理、花朵细节）。',
            duration: '20-30分钟'
        });
    }

    if (user.interests.includes('观鸟')) {
        tasks.push({
            title: '鸟类观察日记',
            description: '在你能到达的自然环境中，观察并记录至少3种鸟类的行为、叫声和外观特征。',
            duration: '30-45分钟'
        });
    }

    // 通用任务
    const generalTasks = [
        {
            title: '感官全开体验',
            description: '选择一个自然环境，用5分钟时间专注体验：看到的颜色、听到的声音、闻到的气味、感受到的温度和质感。',
            duration: '10分钟'
        },
        {
            title: '自然色彩收集',
            description: '收集你今天遇到的5种不同的自然色彩，可以是拍照、画画或文字描述。',
            duration: '15分钟'
        },
        {
            title: '天空观察者',
            description: '观察今天的天空15分钟，记录云朵的形状变化、光线的变化，以及你的感受。',
            duration: '15分钟'
        }
    ];

    tasks.push(...generalTasks);

    // 随机选择一个任务
    return tasks[Math.floor(Math.random() * tasks.length)];
}

function startTask() {
    showRecordInterface();
}

function saveRecord() {
    const record = {
        taskId: Date.now(),
        task: currentTask,
        timestamp: new Date().toISOString(),
        textRecord: document.getElementById('textRecord').value,
        sensoryExperience: {
            visual: document.getElementById('visual').value,
            auditory: document.getElementById('auditory').value,
            tactile: document.getElementById('tactile').value,
            olfactory: document.getElementById('olfactory').value
        },
        userId: userData.age + '_' + userData.location // 简单的用户标识
    };

    // 保存记录到本地存储
    let records = JSON.parse(localStorage.getItem('userRecords') || '[]');
    records.push(record);
    localStorage.setItem('userRecords', JSON.stringify(records));

    // 显示保存成功消息
    alert('记录保存成功！你的感知体验已经记录下来了。');
    
    // 清空表单
    document.getElementById('textRecord').value = '';
    document.getElementById('visual').value = '';
    document.getElementById('auditory').value = '';
    document.getElementById('tactile').value = '';
    document.getElementById('olfactory').value = '';

    // 返回主页
    showMainApp();
    
    // 生成新任务
    generateNewTask();
}

// 重置应用数据（调试用）
function resetApp() {
    localStorage.removeItem('userData');
    localStorage.removeItem('userRecords');
    location.reload();
}