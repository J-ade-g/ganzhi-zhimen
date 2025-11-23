// 全局变量
let userData = {};
let currentUser = null;
let currentTask = {};
let mediaRecorder;
let audioChunks = [];
let recordingStartTime = 0;
let recordingPausedTime = 0;
let recordingTimer = null;
let isRecordingPaused = false;

// 调试日志函数
function debugLog(message) {
    console.log(message);
    const debugDiv = document.getElementById('debugLog');
    if (debugDiv) {
        debugDiv.style.display = 'block';
        const time = new Date().toLocaleTimeString();
        debugDiv.innerHTML = `${time}: ${message}<br>` + debugDiv.innerHTML;
    }
}

// 直接调用的登录函数
window.doLogin = function() {
    debugLog('登录按钮被点击');
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    debugLog('用户名: ' + username);
    
    if (!username || !password) {
        alert('请填写用户名和密码');
        debugLog('登录失败：字段为空');
        return;
    }
    
    debugLog('开始发送登录请求...');
    
    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        debugLog('收到服务器响应: ' + response.status);
        return response.json();
    })
    .then(data => {
        debugLog('登录响应数据: ' + JSON.stringify(data));
        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            debugLog('登录成功，用户: ' + currentUser.username);
            
            // 检查是否已有用户资料
            const userProfile = localStorage.getItem(`userProfile_${currentUser.id}`);
            if (userProfile) {
                userData = JSON.parse(userProfile);
                debugLog('找到用户资料，进入主应用');
                showMainApp();
            } else {
                debugLog('需要填写个人信息');
                showUserInfoForm();
            }
        } else {
            alert(data.error || '登录失败');
            debugLog('登录失败: ' + (data.error || '未知错误'));
        }
    })
    .catch(error => {
        console.error('登录错误:', error);
        alert('登录失败，请检查网络连接');
        debugLog('登录错误: ' + error.message);
    });
};

// 直接调用的注册函数
window.doRegister = function() {
    debugLog('注册按钮被点击');
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    debugLog('注册信息: ' + username + ', ' + email);
    
    if (!username || !email || !password || !confirmPassword) {
        alert('请填写所有必填字段');
        debugLog('注册失败：字段为空');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('两次输入的密码不一致');
        debugLog('注册失败：密码不一致');
        return;
    }
    
    debugLog('开始发送注册请求...');
    
    fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            id: 'user_' + Date.now(),
            username, 
            email, 
            password,
            createdAt: new Date().toISOString()
        })
    })
    .then(response => {
        debugLog('收到服务器响应: ' + response.status);
        return response.json();
    })
    .then(data => {
        debugLog('注册响应数据: ' + JSON.stringify(data));
        if (data.success) {
            alert('注册成功！请登录');
            debugLog('注册成功，切换到登录');
            testClick('login');
        } else {
            alert(data.error || '注册失败');
            debugLog('注册失败: ' + (data.error || '未知错误'));
        }
    })
    .catch(error => {
        console.error('注册错误:', error);
        alert('注册失败，请检查网络连接');
        debugLog('注册错误: ' + error.message);
    });
};

// 测试点击函数
function testClick(tab) {
    console.log('testClick被调用，tab:', tab);
    
    // 执行标签切换
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.style.display = 'none');
    
    const targetTab = document.querySelector(`[data-tab="${tab}"]`);
    const targetForm = document.getElementById(tab + 'Form');
    
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    if (targetForm) {
        targetForm.style.display = 'block';
    }
    
    const title = document.getElementById('authTitle');
    if (title) {
        title.textContent = tab === 'login' ? '用户登录' : '用户注册';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成');
    
    // 先绑定事件监听器
    bindEventListeners();
    
    // 检查用户登录状态
    const currentSession = localStorage.getItem('currentUser');
    if (currentSession) {
        currentUser = JSON.parse(currentSession);
        console.log('找到用户会话:', currentUser);
        
        // 检查是否已完成个人信息收集
        const userProfile = localStorage.getItem(`userProfile_${currentUser.id}`);
        if (userProfile) {
            userData = JSON.parse(userProfile);
            console.log('找到用户资料:', userData);
            showMainApp();
        } else {
            console.log('需要完善个人信息');
            showUserInfoForm();
        }
    } else {
        console.log('用户未登录，显示登录界面');
        showAuthForm();
    }
});

function bindEventListeners() {
    console.log('绑定事件监听器');
    
    // 登录/注册表单
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const userForm = document.getElementById('userForm');
    
    console.log('找到的表单元素:', {
        loginForm: !!loginForm,
        registerForm: !!registerForm,
        userForm: !!userForm
    });
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('登录表单事件已绑定');
    } else {
        console.error('未找到登录表单！');
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        console.log('注册表单事件已绑定');
    } else {
        console.error('未找到注册表单！');
    }
    
    if (userForm) {
        userForm.addEventListener('submit', handleUserFormSubmit);
        console.log('用户信息表单事件已绑定');
    }
    
    // 登录/注册标签切换
    document.addEventListener('click', function(e) {
        console.log('点击事件触发:', e.target);
        if (e.target.classList.contains('auth-tab')) {
            console.log('点击了auth-tab:', e.target.dataset.tab);
            switchAuthTab(e.target.dataset.tab);
        }
    });

    // 动态按钮事件委�?
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('door-btn')) {
            console.log('点击了感知之门按�?);
            const taskIndex = parseInt(e.target.dataset.taskIndex);
            openDoor(taskIndex);
        }
        if (e.target.classList.contains('nav-btn')) {
            const viewType = e.target.dataset.view;
            if (viewType) {
                switchRecordView(viewType);
            }
        }
    });

    // 其他按钮事件
    const refreshTasksBtn = document.getElementById('refreshTasks');
    const viewRecordsBtn = document.getElementById('viewRecords');
    const saveRecordBtn = document.getElementById('saveRecord');
    const backToMainBtn = document.getElementById('backToMain');
    const backToMainFromRecordsBtn = document.getElementById('backToMainFromRecords');

    if (refreshTasksBtn) refreshTasksBtn.addEventListener('click', generateMultipleTasks);
    if (viewRecordsBtn) viewRecordsBtn.addEventListener('click', showRecordsView);
    if (saveRecordBtn) saveRecordBtn.addEventListener('click', saveRecord);
    if (backToMainBtn) backToMainBtn.addEventListener('click', showMainApp);
    if (backToMainFromRecordsBtn) backToMainFromRecordsBtn.addEventListener('click', showMainApp);

    // 录音功能
    const startRecordingBtn = document.getElementById('startRecording');
    const pauseRecordingBtn = document.getElementById('pauseRecording');
    const resumeRecordingBtn = document.getElementById('resumeRecording');
    const stopRecordingBtn = document.getElementById('stopRecording');
    
    if (startRecordingBtn) startRecordingBtn.addEventListener('click', startRecording);
    if (pauseRecordingBtn) pauseRecordingBtn.addEventListener('click', pauseRecording);
    if (resumeRecordingBtn) resumeRecordingBtn.addEventListener('click', resumeRecording);
    if (stopRecordingBtn) stopRecordingBtn.addEventListener('click', stopRecording);

    // 图片预览和拍照功�?
    const imageUpload = document.getElementById('imageUpload');
    const cameraBtn = document.getElementById('cameraBtn');
    if (imageUpload) imageUpload.addEventListener('change', previewImages);
    if (cameraBtn) cameraBtn.addEventListener('click', toggleCamera);
}

// 登录注册功能
function handleLogin(e) {
    console.log('handleLogin函数被调用');
    e.preventDefault();
    console.log('已阻止表单默认提交');
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    console.log('登录信息:', { username, password: '***' });
    
    if (!username || !password) {
        alert('请填写用户名和密码');
        return;
    }
    
    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // 检查是否已有用户资�?
            const userProfile = localStorage.getItem(`userProfile_${currentUser.id}`);
            if (userProfile) {
                userData = JSON.parse(userProfile);
                showMainApp();
            } else {
                showUserInfoForm();
            }
        } else {
            alert(data.error || '登录失败');
        }
    })
    .catch(error => {
        console.error('登录错误:', error);
        alert('登录失败，请检查网络连�?);
    });
}

function handleRegister(e) {
    console.log('handleRegister函数被调用');
    e.preventDefault();
    console.log('已阻止表单默认提交');
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    console.log('注册信息:', { username, email, password: '***' });
    
    if (!username || !email || !password || !confirmPassword) {
        alert('请填写所有必填字段');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('两次输入的密码不一�?);
        return;
    }
    
    fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            id: 'user_' + Date.now(),
            username, 
            email, 
            password,
            createdAt: new Date().toISOString()
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('注册成功！请登录');
            switchAuthTab('login');
        } else {
            alert(data.error || '注册失败');
        }
    })
    .catch(error => {
        console.error('注册错误:', error);
        alert('注册失败，请检查网络连�?);
    });
}

// 确保函数在全局作用域中可用
window.switchAuthTab = function(tab) {
    console.log('switchAuthTab被调用，tab:', tab);
    
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.style.display = 'none');
    
    const targetTab = document.querySelector(`[data-tab="${tab}"]`);
    const targetForm = document.getElementById(tab + 'Form');
    
    console.log('目标标签:', targetTab);
    console.log('目标表单:', targetForm);
    
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    if (targetForm) {
        targetForm.style.display = 'block';
    }
    
    const title = document.getElementById('authTitle');
    if (title) {
        title.textContent = tab === 'login' ? '用户登录' : '用户注册';
    }
    
    console.log('标签切换完成');
}

// 保持原有的函数定义以兼容其他调用
function switchAuthTab(tab) {
    window.switchAuthTab(tab);
}

// 表单提交处理函数
function handleUserFormSubmit(e) {
    console.log('表单提交事件触发');
    e.preventDefault();
    
    // 收集用户数据
    userData = {
        userId: currentUser ? currentUser.id : 'guest_' + Date.now(),
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        location: document.getElementById('location').value,
        greenLevel: document.getElementById('greenLevel').value,
        terrain: document.getElementById('terrain').value,
        growthEnv: document.getElementById('growthEnv').value,
        contactFreq: document.getElementById('contactFreq').value,
        interests: []
    };

    // 收集兴趣标签
    const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        userData.interests.push(checkbox.value);
    });

    console.log('收集到的用户数据:', userData);

    // 保存到本地存�?
    localStorage.setItem('userData', JSON.stringify(userData));
    if (currentUser) {
        localStorage.setItem(`userProfile_${currentUser.id}`, JSON.stringify(userData));
    }
    console.log('用户数据已保存到本地存储');
    
    // 同时保存到服务器
    fetch('/api/users/profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    }).then(response => response.json())
    .then(data => {
        console.log('用户信息已同步到服务�?', data);
    }).catch(error => {
        console.error('同步到服务器失败:', error);
    });
    
    // 显示主应�?
    console.log('准备显示主应�?);
    showMainApp();
}

// 界面切换函数
function showAuthForm() {
    console.log('显示登录/注册界面');
    document.getElementById('authForm').style.display = 'block';
    document.getElementById('userInfoForm').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('recordInterface').style.display = 'none';
    document.getElementById('recordsView').style.display = 'none';
}

function showUserInfoForm() {
    console.log('显示用户信息收集表单');
    document.getElementById('authForm').style.display = 'none';
    document.getElementById('userInfoForm').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('recordInterface').style.display = 'none';
    document.getElementById('recordsView').style.display = 'none';
    
    // 显示欢迎用户�?
    const welcomeUsername = document.getElementById('welcomeUsername');
    if (welcomeUsername && currentUser) {
        welcomeUsername.textContent = currentUser.username;
    }
}

function showMainApp() {
    console.log('显示主应�?);
    document.getElementById('authForm').style.display = 'none';
    document.getElementById('userInfoForm').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('recordInterface').style.display = 'none';
    document.getElementById('recordsView').style.display = 'none';
    
    updateWelcomeMessage();
    generateMultipleTasks();
}

function showRecordInterface() {
    console.log('显示记录界面');
    document.getElementById('userInfoForm').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('recordInterface').style.display = 'block';
    document.getElementById('recordsView').style.display = 'none';
    
    const currentTaskDiv = document.getElementById('currentTask');
    if (currentTaskDiv && currentTask) {
        currentTaskDiv.innerHTML = `<strong>当前感知之门�?/strong>${currentTask.title}<br><small>${currentTask.description}</small>`;
    }
}

function showRecordsView() {
    console.log('显示记录查看界面');
    document.getElementById('userInfoForm').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('recordInterface').style.display = 'none';
    document.getElementById('recordsView').style.display = 'block';
    
    loadRecords();
}

// 更新欢迎信息和统计数�?
function updateWelcomeMessage() {
    console.log('更新欢迎信息');
    const userInfoDiv = document.getElementById('userInfo');
    const userStatsDiv = document.getElementById('userStats');
    
    if (userInfoDiv) {
        userInfoDiv.innerHTML = `选择你的感知之门`;
    }
    
    if (userStatsDiv) {
        // 计算统计信息
        const records = JSON.parse(localStorage.getItem('userRecords') || '[]');
        const userRecords = currentUser ? records.filter(r => r.userId === currentUser.id) : records;
        const stats = calculateUserStats(userRecords);
        
        console.log('更新统计数据:', stats, '用户记录�?', userRecords.length);
        
        userStatsDiv.innerHTML = `
            <div class="stat-item">
                <div class="stat-number">${stats.totalRecords}</div>
                <div class="stat-label">总记�?/div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.totalDays}</div>
                <div class="stat-label">探索天数</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.textRecords}</div>
                <div class="stat-label">文字记录</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.imageRecords}</div>
                <div class="stat-label">图片记录</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.audioRecords}</div>
                <div class="stat-label">录音记录</div>
            </div>
        `;
    }
}

function calculateUserStats(records) {
    return {
        totalRecords: records.length,
        totalDays: new Set(records.map(r => r.date || new Date(r.timestamp).toLocaleDateString('zh-CN'))).size,
        textRecords: records.filter(r => r.textRecord && r.textRecord.trim()).length,
        imageRecords: records.filter(r => r.images && r.images.length > 0).length,
        audioRecords: records.filter(r => r.audioData).length
    };
}

// 生成多个任务选项
function generateMultipleTasks() {
    console.log('生成任务选项');
    const tasks = generateSimpleTasks(userData);
    const container = document.getElementById('tasksContainer');
    
    if (!container) {
        console.error('未找到任务容�?);
        return;
    }
    
    container.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-option';
        taskDiv.innerHTML = `
            <h3>🚪 ${task.title}</h3>
            <p>${task.description}</p>
            <div style="margin-top: 10px;">
                <small>⏱️ ${task.duration} | 🌟 ${task.difficulty}</small>
            </div>
            <button class="door-btn" data-task-index="${index}">开启此�?/button>
        `;
        container.appendChild(taskDiv);
    });
    
    console.log('任务选项生成完成，共', tasks.length, '个任�?);
}

function generateSimpleTasks(user) {
    const allTasks = [
        {
            title: '身边的绿�?,
            description: '找到你周�?种不同的绿色，用手机拍下来或画下来�?,
            duration: '3分钟',
            difficulty: '简�?,
            type: 'color_observation'
        },
        {
            title: '声音收集',
            description: '静坐2分钟，记录你听到的所有声音�?,
            duration: '2分钟',
            difficulty: '简�?,
            type: 'sound_collection'
        },
        {
            title: '触感体验',
            description: '用手触摸3种不同质感的自然物体，描述感受�?,
            duration: '3分钟',
            difficulty: '简�?,
            type: 'touch_experience'
        },
        {
            title: '天空观察',
            description: '抬头看天�?分钟，描述云朵的形状�?,
            duration: '1分钟',
            difficulty: '简�?,
            type: 'sky_watching'
        },
        {
            title: '气味探索',
            description: '闻一闻周围的气味，记录最特别的一种�?,
            duration: '2分钟',
            difficulty: '简�?,
            type: 'smell_exploration'
        }
    ];

    // 基于用户兴趣添加特定任务
    if (user.interests && user.interests.includes('植物识别')) {
        allTasks.push({
            title: '叶子形状',
            description: '找一片叶子，仔细观察它的形状和纹理�?,
            duration: '3分钟',
            difficulty: '简�?,
            type: 'plant_observation'
        });
    }

    if (user.interests && user.interests.includes('摄影')) {
        allTasks.push({
            title: '光影捕捉',
            description: '拍一张有趣光影效果的照片�?,
            duration: '5分钟',
            difficulty: '简�?,
            type: 'photography'
        });
    }

    // 随机选择3个任�?
    const shuffled = allTasks.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
}

function openDoor(taskIndex) {
    console.log('开启感知之门，任务索引:', taskIndex);
    const tasks = generateSimpleTasks(userData);
    currentTask = tasks[taskIndex];
    console.log('选择的任�?', currentTask);
    showRecordInterface();
}

// 图片预览功能
function previewImages() {
    const files = document.getElementById('imageUpload').files;
    const preview = document.getElementById('imagePreview');
    if (!preview) return;
    
    preview.innerHTML = '';

    for (let file of files) {
        // 检查文件类型，只允许图片格�?
        if (!file.type.startsWith('image/')) {
            alert(`文件 "${file.name}" 不是图片格式，只能上传图片文件（jpg, png, gif, webp等）`);
            continue;
        }

        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.style.width = '100px';
        img.style.height = '100px';
        img.style.objectFit = 'cover';
        img.style.margin = '5px';
        img.style.borderRadius = '4px';
        preview.appendChild(img);
    }
}

// 录音功能
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        recordingStartTime = Date.now();
        recordingPausedTime = 0;
        isRecordingPaused = false;

        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            // 停止计时�?
            if (recordingTimer) {
                clearInterval(recordingTimer);
                recordingTimer = null;
            }
            
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // 计算实际录音时长
            const actualDuration = Math.round((Date.now() - recordingStartTime - recordingPausedTime) / 1000);
            
            // 创建音频播放�?
            const audioContainer = document.createElement('div');
            audioContainer.style.marginTop = '10px';
            audioContainer.innerHTML = `
                <audio controls style="width: 100%;">
                    <source src="${audioUrl}" type="audio/wav">
                    您的浏览器不支持音频播放�?
                </audio>
                <div style="margin-top: 5px; font-size: 12px; color: #6c757d;">
                    录音时长: ${formatTime(actualDuration)}
                </div>
            `;
            
            const preview = document.getElementById('audioPreview');
            preview.innerHTML = '';
            preview.appendChild(audioContainer);
            
            // 保存音频数据到全局变量
            window.currentAudioData = {
                blob: audioBlob,
                url: audioUrl,
                duration: actualDuration
            };
            
            // 重置按钮状�?
            resetRecordingButtons();
        };

        mediaRecorder.start(100); // �?00ms收集一次数�?
        
        // 更新按钮状�?
        document.getElementById('startRecording').style.display = 'none';
        document.getElementById('pauseRecording').style.display = 'inline-block';
        document.getElementById('stopRecording').style.display = 'inline-block';
        document.getElementById('recordingTimer').style.display = 'block';
        
        // 开始计时器
        startTimer();
        
    } catch (error) {
        alert('无法访问麦克风，请检查权限设�?);
        console.error('录音错误:', error);
        resetRecordingButtons();
    }
}

function pauseRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.pause();
        
        // 记录暂停时的时间�?
        const pauseTime = Date.now();
        recordingPausedTime += pauseTime - recordingStartTime;
        isRecordingPaused = true;
        
        // 停止计时�?
        if (recordingTimer) {
            clearInterval(recordingTimer);
            recordingTimer = null;
        }
        
        // 更新按钮状�?
        document.getElementById('pauseRecording').style.display = 'none';
        document.getElementById('resumeRecording').style.display = 'inline-block';
        
        // 更新显示状�?
        const timerElement = document.getElementById('recordingTimer');
        timerElement.className = 'paused';
        timerElement.innerHTML = `⏸️ 录音已暂�?.. <span id="timerDisplay">${document.getElementById('timerDisplay').textContent}</span>`;
    }
}

function resumeRecording() {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
        mediaRecorder.resume();
        isRecordingPaused = false;
        // 重新设置开始时间为当前时间（用于计算后续的录音时长�?
        recordingStartTime = Date.now();
        
        // 更新按钮状�?
        document.getElementById('resumeRecording').style.display = 'none';
        document.getElementById('pauseRecording').style.display = 'inline-block';
        
        // 重新开始计时器
        startTimer();
    }
}

function stopRecording() {
    if (mediaRecorder && (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused')) {
        mediaRecorder.stop();
        
        // 停止所有音�?
        if (mediaRecorder.stream) {
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    }
}

function startTimer() {
    recordingTimer = setInterval(() => {
        const currentTime = Date.now();
        // 修复时长计算：当前时�?- 开始时�?- 暂停的总时�?
        const elapsedTime = Math.floor((currentTime - recordingStartTime - recordingPausedTime) / 1000);
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(elapsedTime);
            // 更新录音状态显�?
            const timerContainer = document.getElementById('recordingTimer');
            timerContainer.className = 'recording';
            timerContainer.innerHTML = `🔴 录音�?.. <span id="timerDisplay">${formatTime(elapsedTime)}</span>`;
        }
    }, 1000);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function resetRecordingButtons() {
    document.getElementById('startRecording').style.display = 'inline-block';
    document.getElementById('pauseRecording').style.display = 'none';
    document.getElementById('resumeRecording').style.display = 'none';
    document.getElementById('stopRecording').style.display = 'none';
    document.getElementById('recordingTimer').style.display = 'none';
}

// 拍照功能
let cameraStream = null;
let cameraVideo = null;

async function toggleCamera() {
    const cameraBtn = document.getElementById('cameraBtn');
    const cameraContainer = document.getElementById('cameraContainer');
    
    if (!cameraContainer) {
        // 创建相机容器
        const container = document.createElement('div');
        container.id = 'cameraContainer';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;
        
        container.innerHTML = `
            <video id="cameraVideo" autoplay playsinline style="max-width: 90%; max-height: 70%; border-radius: 8px;"></video>
            <div style="margin-top: 20px;">
                <button id="captureBtn" style="margin: 0 10px; padding: 10px 20px; font-size: 16px;">📸 拍照</button>
                <button id="closeCameraBtn" style="margin: 0 10px; padding: 10px 20px; font-size: 16px;">�?关闭</button>
            </div>
            <canvas id="captureCanvas" style="display: none;"></canvas>
        `;
        
        document.body.appendChild(container);
        
        // 绑定事件
        document.getElementById('captureBtn').addEventListener('click', capturePhoto);
        document.getElementById('closeCameraBtn').addEventListener('click', closeCamera);
        
        cameraVideo = document.getElementById('cameraVideo');
    }
    
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } // 优先使用后置摄像�?
        });
        cameraVideo.srcObject = cameraStream;
        document.getElementById('cameraContainer').style.display = 'flex';
    } catch (error) {
        alert('无法访问摄像头，请检查权限设�?);
        console.error('摄像头错�?', error);
    }
}

function capturePhoto() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('captureCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob(blob => {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        // 创建一个临时的文件输入来模拟文件选择
        const dt = new DataTransfer();
        dt.items.add(file);
        
        const imageUpload = document.getElementById('imageUpload');
        imageUpload.files = dt.files;
        
        // 触发预览
        previewImages();
        
        // 关闭相机
        closeCamera();
        
        alert('照片已添加到记录�?);
    }, 'image/jpeg', 0.8);
}

function closeCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    const container = document.getElementById('cameraContainer');
    if (container) {
        container.style.display = 'none';
    }
}

// 保存记录功能
function saveRecord() {
    if (!currentUser) {
        alert('请先登录');
        return;
    }

    const record = {
        id: Date.now().toString(),
        userId: currentUser.id,
        task: currentTask,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('zh-CN'),
        textRecord: document.getElementById('textRecord').value,
        sensoryExperience: {
            visual: document.getElementById('visual').value,
            auditory: document.getElementById('auditory').value,
            tactile: document.getElementById('tactile').value,
            olfactory: document.getElementById('olfactory').value
        },
        images: [],
        audioData: null
    };

    // 处理图片 - 转换为base64以便存储
    const imageFiles = document.getElementById('imageUpload').files;
    const imagePromises = [];
    
    for (let file of imageFiles) {
        const promise = new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    data: e.target.result
                });
            };
            reader.readAsDataURL(file);
        });
        imagePromises.push(promise);
    }

    Promise.all(imagePromises).then(images => {
        record.images = images;

        // 处理录音数据
        if (window.currentAudioData) {
            // 转换音频为base64
            const reader = new FileReader();
            reader.onload = () => {
                record.audioData = {
                    data: reader.result,
                    duration: window.currentAudioData.duration,
                    timestamp: new Date().toISOString()
                };
                
                saveRecordToStorage(record);
            };
            reader.readAsDataURL(window.currentAudioData.blob);
        } else {
            saveRecordToStorage(record);
        }
    });
}

function saveRecordToStorage(record) {
    // 保存记录到本地存�?
    let records = JSON.parse(localStorage.getItem('userRecords') || '[]');
    records.push(record);
    localStorage.setItem('userRecords', JSON.stringify(records));

    // 同时保存到服务器
    fetch('/api/records', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(record)
    }).then(response => response.json())
    .then(data => {
        console.log('记录已同步到服务�?', data);
    }).catch(error => {
        console.error('同步到服务器失败:', error);
    });

    // 显示保存成功消息
    alert('记录保存成功！你的感知体验已经记录下来了�?);
    
    // 清空表单和音频数�?
    clearRecordForm();
    window.currentAudioData = null;

    // 返回主页
    showMainApp();
}

function clearRecordForm() {
    document.getElementById('textRecord').value = '';
    document.getElementById('visual').value = '';
    document.getElementById('auditory').value = '';
    document.getElementById('tactile').value = '';
    document.getElementById('olfactory').value = '';
    document.getElementById('imageUpload').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('audioPreview').innerHTML = '';
    resetRecordingButtons();
}

// 记录查看相关函数
function loadRecords() {
    const records = JSON.parse(localStorage.getItem('userRecords') || '[]');
    
    // 默认显示个人信息视图
    switchRecordView('profile');
}

function switchRecordView(viewType) {
    // 更新导航按钮状�?
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-view="${viewType}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // 隐藏所有视�?
    document.querySelectorAll('.record-view').forEach(view => {
        view.style.display = 'none';
    });

    // 显示选中的视�?
    const targetView = document.getElementById(viewType + 'View');
    if (targetView) targetView.style.display = 'block';

    // 加载对应数据
    const records = JSON.parse(localStorage.getItem('userRecords') || '[]');
    
    switch(viewType) {
        case 'profile':
            displayProfileView();
    // 加载对应数据
    const records = JSON.parse(localStorage.getItem('userRecords') || '[]');
    
    switch(viewType) {
        case 'profile':
            displayProfileView();
            break;
        case 'calendar':
            displayCalendarRecords(records);
            break;
        case 'text':
            displayTextRecords(records);
            break;
        case 'images':
            displayImageRecords(records);
            break;
        case 'audio':
            displayAudioRecords(records);
            break;
    }
}

function displayProfileView() {
    const container = document.getElementById('profileView');
    if (!container) return;
    
    const records = JSON.parse(localStorage.getItem('userRecords') || '[]');
    const userRecords = currentUser ? records.filter(r => r.userId === currentUser.id) : records;
    const stats = calculateUserStats(userRecords);
    
    const interests = userData.interests && userData.interests.length > 0 ? userData.interests.join('、') : '无';
    
    container.innerHTML = `
        <div class="record-item" style="background: linear-gradient(135deg, #f8fff8 0%, #e8f5e8 100%); border-left: 4px solid #2d5016;">
            <h3 style="color: #0d3b2e; margin-bottom: 20px;">个人信息 <button class="edit-profile-btn" onclick="editProfile()">编辑</button></h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; line-height: 2;">
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 3px solid #52b788;">
                    <strong style="color: #0d3b2e;">基本信息</strong><br><br>
                    <strong>年龄:</strong> ${userData.age}岁<br>
                    <strong>性别:</strong> ${userData.gender || '未设置'}<br>
                    <strong>自然接触频率:</strong> ${userData.contactFreq}
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 3px solid #52b788;">
                    <strong style="color: #0d3b2e;">环境信息</strong><br><br>
                    <strong>居住地类型:</strong> ${userData.location}<br>
                    <strong>绿色含量:</strong> ${userData.greenLevel || '未设置'}<br>
                    <strong>常见地貌:</strong> ${userData.terrain || '未设置'}<br>
                    <strong>成长环境:</strong> ${userData.growthEnv}
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 3px solid #52b788;">
                    <strong style="color: #0d3b2e;">兴趣爱好</strong><br><br>
                    <strong>兴趣标签:</strong><br>${interests}
                </div>
            </div>
        </div>
        
        <div class="record-item">
            <h3>探索统计</h3>
            <div class="user-stats" style="margin-top: 15px;">
                <div class="stat-item">
                    <div class="stat-number">${stats.totalRecords}</div>
                    <div class="stat-label">总记录数</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${stats.totalDays}</div>
                    <div class="stat-label">探索天数</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${stats.textRecords}</div>
                    <div class="stat-label">文字记录</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${stats.imageRecords}</div>
                    <div class="stat-label">图片记录</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${stats.audioRecords}</div>
                    <div class="stat-label">录音记录</div>
                </div>
            </div>
        </div>
    `;
}

function editProfile() {
    const isEditing = confirm('确定要重新设置个人信息吗？这将返回到初始设置页面。');
    if (isEditing) {
        localStorage.removeItem('userData');
        showUserInfoForm();
    }
}

function displayCalendarRecords(records) {
    const container = document.getElementById('calendarView');
    if (!container) return;
    
    // 过滤当前用户的记录
    const userRecords = currentUser ? records.filter(r => r.userId === currentUser.id) : records;
    
    if (userRecords.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d;">还没有记录，快去开启你的第一扇感知之门吧！</p>';
        return;
    }

    // 按日期分组
    const groupedRecords = {};
    userRecords.forEach(record => {
        const date = record.date || new Date(record.timestamp).toLocaleDateString('zh-CN');
        if (!groupedRecords[date]) {
            groupedRecords[date] = [];
        }
        groupedRecords[date].push(record);
    });

    let html = '';
    Object.keys(groupedRecords).sort().reverse().forEach(date => {
        html += `<div class="record-item">
            <div class="record-date">${date}</div>
            <div>`;
        
        groupedRecords[date].forEach(record => {
            const hasText = record.textRecord && record.textRecord.trim();
            const hasImages = record.images && record.images.length > 0;
            const hasAudio = record.audioData;
            
            html += `<div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 8px; border-left: 3px solid #52b788;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong style="color: #0d3b2e;">${record.task.title}</strong>
                    <div style="display: flex; gap: 5px;">
                        ${hasText ? '<span style="background: #e8f5e8; color: #2d5016; padding: 2px 6px; border-radius: 3px; font-size: 12px;">📝 文字</span>' : ''}
                        ${hasImages ? '<span style="background: #e3f2fd; color: #1565c0; padding: 2px 6px; border-radius: 3px; font-size: 12px;">📷 图片</span>' : ''}
                        ${hasAudio ? '<span style="background: #fce4ec; color: #c2185b; padding: 2px 6px; border-radius: 3px; font-size: 12px;">🎤 录音</span>' : ''}
                    </div>
                </div>
                
                ${hasText ? `<div style="margin-bottom: 10px;"><strong>文字记录：</strong><br><span style="color: #555;">${record.textRecord}</span></div>` : ''}
                
                ${record.sensoryExperience && (record.sensoryExperience.visual || record.sensoryExperience.auditory || record.sensoryExperience.tactile || record.sensoryExperience.olfactory) ? `
                <div style="margin-bottom: 10px;">
                    <strong>感官体验：</strong><br>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 5px; margin-top: 5px;">
                        ${record.sensoryExperience.visual ? `<small>👁️ 视觉: ${record.sensoryExperience.visual}</small>` : ''}
                        ${record.sensoryExperience.auditory ? `<small>👂 听觉: ${record.sensoryExperience.auditory}</small>` : ''}
                        ${record.sensoryExperience.tactile ? `<small>✋ 触觉: ${record.sensoryExperience.tactile}</small>` : ''}
                        ${record.sensoryExperience.olfactory ? `<small>👃 嗅觉: ${record.sensoryExperience.olfactory}</small>` : ''}
                    </div>
                </div>
                ` : ''}
                
                ${hasImages ? `
                <div style="margin-bottom: 10px;">
                    <strong>图片记录：</strong><br>
                    <div style="display: flex; gap: 5px; margin-top: 5px; flex-wrap: wrap;">
                        ${record.images.map(image => `
                            <img src="${image.data || image.url}" alt="记录图片" 
                                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; cursor: pointer;"
                                 onclick="showImageModal('${image.data || image.url}')">
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${hasAudio ? `
                <div style="margin-bottom: 10px;">
                    <strong>录音记录：</strong><br>
                    <audio controls style="width: 100%; margin-top: 5px;">
                        <source src="${record.audioData.data || record.audioData.url}" type="audio/wav">
                        您的浏览器不支持音频播放。
                    </audio>
                    <small style="color: #6c757d;">时长: ${formatTime(record.audioData.duration)}</small>
                </div>
                ` : ''}
                
                <small style="color: #6c757d;">记录时间: ${new Date(record.timestamp).toLocaleString('zh-CN')}</small>
            </div>`;
        });
        
        html += `</div></div>`;
    });

    container.innerHTML = html;
}

function displayTextRecords(records) {
    const container = document.getElementById('textView');
    if (!container) return;
    
    const userRecords = currentUser ? records.filter(r => r.userId === currentUser.id) : records;
    const textRecords = userRecords.filter(r => r.textRecord && r.textRecord.trim());
    
    if (textRecords.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d;">还没有文字记录</p>';
        return;
    }

    let html = '';
    textRecords.forEach(record => {
        html += `<div class="record-item">
            <div class="record-date">${record.date || new Date(record.timestamp).toLocaleDateString('zh-CN')}</div>
            <strong>${record.task.title}</strong>
            <p>${record.textRecord}</p>
        </div>`;
    });

    container.innerHTML = html;
}

function displayImageRecords(records) {
    const container = document.getElementById('imagesView');
    if (!container) return;
    
    const userRecords = currentUser ? records.filter(r => r.userId === currentUser.id) : records;
    const imageRecords = userRecords.filter(r => r.images && r.images.length > 0);
    
    if (imageRecords.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d;">还没有图片记录</p>';
        return;
    }

    let html = '<div class="media-gallery">';
    imageRecords.forEach(record => {
        record.images.forEach(image => {
            const imageSrc = image.data || image.url || '';
            html += `<div class="media-item">
                <img src="${imageSrc}" alt="感知记录" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; cursor: pointer;"
                     onclick="showImageModal('${imageSrc}')">
                <div style="padding: 10px;">
                    <strong>${record.task.title}</strong><br>
                    <small>${record.date || new Date(record.timestamp).toLocaleDateString('zh-CN')}</small>
                </div>
            </div>`;
        });
    });
    html += '</div>';

    container.innerHTML = html;
}

function displayAudioRecords(records) {
    const container = document.getElementById('audioView');
    if (!container) return;
    
    const userRecords = currentUser ? records.filter(r => r.userId === currentUser.id) : records;
    const audioRecords = userRecords.filter(r => r.audioData);
    
    if (audioRecords.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d;">还没有录音记录</p>';
        return;
    }

    let html = '';
    audioRecords.forEach(record => {
        const audioSrc = record.audioData.data || record.audioData.url || '';
        html += `<div class="record-item">
            <div class="record-date">${record.date || new Date(record.timestamp).toLocaleDateString('zh-CN')}</div>
            <strong>${record.task.title}</strong>
            <audio controls style="width: 100%; margin-top: 10px;">
                <source src="${audioSrc}" type="audio/wav">
                您的浏览器不支持音频播放。
            </audio>
            <div style="margin-top: 5px; font-size: 12px; color: #6c757d;">
                录音时长: ${formatTime(record.audioData.duration)}
            </div>
        </div>`;
    });

    container.innerHTML = html;
}

// 图片模态框显示功能
function showImageModal(imageSrc) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    `;
    
    modal.innerHTML = `
        <img src="${imageSrc}" style="max-width: 90%; max-height: 90%; border-radius: 8px;">
        <div style="position: absolute; top: 20px; right: 20px; color: white; font-size: 24px; cursor: pointer;">✕</div>
    `;
    
    // 点击关闭模态框
    modal.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.body.appendChild(modal);
}