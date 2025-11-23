// ==================== 全局变量 ====================
let userData = {};
let currentUser = null;
let currentTask = {};
let mediaRecorder;
let audioChunks = [];
let recordingStartTime = 0;
let recordingPausedTime = 0;
let recordingTimer = null;
let isRecordingPaused = false;

// ==================== 登录注册功能 ====================

// 登录函数
window.doLogin = function() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        alert('请填写用户名和密码');
        return;
    }
    
    fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
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
    .catch(err => {
        alert('登录失败，请检查网络连接');
        console.error(err);
    });
};

// 注册函数
window.doRegister = function() {
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!username || !password || !confirmPassword) {
        alert('请填写用户名和密码');
        return;
    }
    
    if (!email && !phone) {
        alert('请至少填写邮箱或手机号其中一项');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
    }
    
    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
        alert('请输入正确的11位手机号');
        return;
    }
    
    fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            id: 'user_' + Date.now(),
            username, 
            email: email || '', 
            phone: phone || '',
            password,
            createdAt: new Date().toISOString()
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // 注册成功后直接登录
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            alert('注册成功！');
            showUserInfoForm();
        } else {
            alert(data.error || '注册失败');
        }
    })
    .catch(err => {
        alert('注册失败，请检查网络连接');
        console.error(err);
    });
};

// 标签切换
window.switchAuthTab = function(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.style.display = 'none');
    
    const targetTab = document.querySelector(`[data-tab="${tab}"]`);
    const targetForm = document.getElementById(tab + 'Form');
    
    if (targetTab) targetTab.classList.add('active');
    if (targetForm) targetForm.style.display = 'block';
    
    const title = document.getElementById('authTitle');
    if (title) title.textContent = tab === 'login' ? '用户登录' : '用户注册';
};

// ==================== 页面初始化 ====================

document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    const currentSession = localStorage.getItem('currentUser');
    if (currentSession) {
        currentUser = JSON.parse(currentSession);
        const userProfile = localStorage.getItem(`userProfile_${currentUser.id}`);
        if (userProfile) {
            userData = JSON.parse(userProfile);
            showMainApp();
        } else {
            showUserInfoForm();
        }
    } else {
        showAuthForm();
    }
    
    // 绑定其他事件
    bindEventListeners();
});

function bindEventListeners() {
    // 用户信息表单
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', handleUserFormSubmit);
    }
    
    // 主应用按钮
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

    // 图片和拍照
    const imageUpload = document.getElementById('imageUpload');
    const cameraBtn = document.getElementById('cameraBtn');
    if (imageUpload) imageUpload.addEventListener('change', previewImages);
    if (cameraBtn) cameraBtn.addEventListener('click', toggleCamera);
    
    // 动态按钮事件委托
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('door-btn')) {
            const taskIndex = parseInt(e.target.dataset.taskIndex);
            openDoor(taskIndex);
        }
        if (e.target.classList.contains('nav-btn')) {
            const viewType = e.target.dataset.view;
            if (viewType) switchRecordView(viewType);
        }
    });
}

// ==================== 界面切换函数 ====================

function showAuthForm() {
    document.getElementById('authForm').style.display = 'block';
    document.getElementById('userInfoForm').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('recordInterface').style.display = 'none';
    document.getElementById('recordsView').style.display = 'none';
}

function showUserInfoForm() {
    document.getElementById('authForm').style.display = 'none';
    document.getElementById('userInfoForm').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('recordInterface').style.display = 'none';
    document.getElementById('recordsView').style.display = 'none';
    
    const welcomeUsername = document.getElementById('welcomeUsername');
    if (welcomeUsername && currentUser) {
        welcomeUsername.textContent = currentUser.username;
    }
}

function showMainApp() {
    document.getElementById('authForm').style.display = 'none';
    document.getElementById('userInfoForm').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('recordInterface').style.display = 'none';
    document.getElementById('recordsView').style.display = 'none';
    
    updateWelcomeMessage();
    generateMultipleTasks();
    
    // 检查是否是管理员，控制后台管理按钮显示
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        // 管理员用户名列表
        const adminUsers = ['admin', 'demo'];
        if (currentUser && adminUsers.includes(currentUser.username)) {
            adminBtn.style.display = 'inline-block';
        } else {
            adminBtn.style.display = 'none';
        }
    }
}

function showRecordInterface() {
    document.getElementById('userInfoForm').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('recordInterface').style.display = 'block';
    document.getElementById('recordsView').style.display = 'none';
    
    const currentTaskDiv = document.getElementById('currentTask');
    if (currentTaskDiv && currentTask) {
        currentTaskDiv.innerHTML = `<strong>当前感知之门：</strong>${currentTask.title}<br><small>${currentTask.description}</small>`;
    }
}

function showRecordsView() {
    document.getElementById('userInfoForm').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('recordInterface').style.display = 'none';
    document.getElementById('recordsView').style.display = 'block';
    
    loadRecords();
}

// ==================== 用户信息表单处理 ====================

function handleUserFormSubmit(e) {
    e.preventDefault();
    
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

    const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        userData.interests.push(checkbox.value);
    });

    localStorage.setItem('userData', JSON.stringify(userData));
    if (currentUser) {
        localStorage.setItem(`userProfile_${currentUser.id}`, JSON.stringify(userData));
    }
    
    fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    }).then(res => res.json())
    .then(data => console.log('用户信息已同步到服务器', data))
    .catch(err => console.error('同步失败:', err));
    
    showMainApp();
}

// ==================== 主应用功能 ====================

function updateWelcomeMessage() {
    const userInfoDiv = document.getElementById('userInfo');
    
    if (userInfoDiv) {
        // 根据用户资料生成个性化欢迎语
        let welcomeMsg = '选择你的感知之门';
        
        if (userData && userData.location) {
            const timeOfDay = new Date().getHours();
            let greeting = timeOfDay < 12 ? '早安' : timeOfDay < 18 ? '午好' : '晚安';
            
            if (userData.greenLevel === '自然环境') {
                welcomeMsg = `${greeting}，自然的孩子`;
            } else if (userData.greenLevel === '丰富绿色') {
                welcomeMsg = `${greeting}，绿意环绕着你`;
            } else if (userData.location === '大城市中心') {
                welcomeMsg = `${greeting}，在钢筋森林中寻找自然`;
            } else {
                welcomeMsg = `${greeting}，${currentUser ? currentUser.username : '探索者'}`;
            }
        }
        
        userInfoDiv.innerHTML = welcomeMsg;
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

function generateMultipleTasks() {
    const tasks = generateSimpleTasks(userData);
    const container = document.getElementById('tasksContainer');
    
    if (!container) return;
    
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
            <button class="door-btn" data-task-index="${index}">开启此门</button>
        `;
        container.appendChild(taskDiv);
    });
}

function generateSimpleTasks(user) {
    const allTasks = [];
    
    // 基础任务池
    const baseTasks = [
        {
            title: '绿色寻觅',
            description: '寻找身边五种不同深浅的绿，感受生命的层次',
            duration: '3分钟',
            difficulty: '简单',
            type: 'color_observation',
            tags: ['视觉', '色彩']
        },
        {
            title: '声音冥想',
            description: '闭眼静坐，让声音的波纹在心中荡漾',
            duration: '2分钟',
            difficulty: '简单',
            type: 'sound_collection',
            tags: ['听觉', '冥想']
        },
        {
            title: '触感之旅',
            description: '用指尖感受三种质地，记录它们的温度与纹理',
            duration: '3分钟',
            difficulty: '简单',
            type: 'touch_experience',
            tags: ['触觉', '感知']
        },
        {
            title: '云的诗篇',
            description: '仰望天空，为云朵写一首无字的诗',
            duration: '1分钟',
            difficulty: '简单',
            type: 'sky_watching',
            tags: ['视觉', '想象']
        },
        {
            title: '气息追踪',
            description: '捕捉空气中最微妙的气味，它来自哪里',
            duration: '2分钟',
            difficulty: '简单',
            type: 'smell_exploration',
            tags: ['嗅觉', '探索']
        },
        {
            title: '光影游戏',
            description: '观察光与影的对话，记录这一刻的明暗',
            duration: '3分钟',
            difficulty: '简单',
            type: 'light_shadow',
            tags: ['视觉', '光影']
        },
        {
            title: '风的轨迹',
            description: '感受风的方向，它带来了什么消息',
            duration: '2分钟',
            difficulty: '简单',
            type: 'wind_feeling',
            tags: ['触觉', '感知']
        }
    ];
    
    // 根据用户环境推荐
    if (user.greenLevel === '自然环境' || user.greenLevel === '丰富绿色') {
        allTasks.push({
            title: '树的呼吸',
            description: '靠近一棵树，感受它的生命节奏',
            duration: '5分钟',
            difficulty: '简单',
            type: 'tree_connection',
            tags: ['自然', '连接'],
            weight: 3
        });
    }
    
    if (user.location === '大城市中心') {
        allTasks.push({
            title: '城市缝隙',
            description: '在混凝土间寻找生命的倔强',
            duration: '4分钟',
            difficulty: '简单',
            type: 'urban_nature',
            tags: ['城市', '发现'],
            weight: 3
        });
    }
    
    if (user.terrain === '山地' || user.terrain === '丘陵') {
        allTasks.push({
            title: '山的回声',
            description: '聆听山谷的声音，它在诉说什么',
            duration: '3分钟',
            difficulty: '简单',
            type: 'mountain_echo',
            tags: ['听觉', '山地'],
            weight: 2
        });
    }
    
    if (user.terrain === '沿海' || user.terrain === '河流湖泊') {
        allTasks.push({
            title: '水的韵律',
            description: '观察水面的波纹，感受流动的诗意',
            duration: '4分钟',
            difficulty: '简单',
            type: 'water_rhythm',
            tags: ['视觉', '水'],
            weight: 2
        });
    }
    
    // 根据兴趣推荐
    if (user.interests && user.interests.includes('植物识别')) {
        allTasks.push({
            title: '叶脉密语',
            description: '选一片叶子，追溯它的生命纹路',
            duration: '4分钟',
            difficulty: '简单',
            type: 'plant_observation',
            tags: ['植物', '观察'],
            weight: 3
        });
    }
    
    if (user.interests && user.interests.includes('摄影')) {
        allTasks.push({
            title: '瞬间永恒',
            description: '用镜头捕捉光影交织的那一刻',
            duration: '5分钟',
            difficulty: '简单',
            type: 'photography',
            tags: ['摄影', '艺术'],
            weight: 3
        });
    }
    
    if (user.interests && user.interests.includes('观鸟')) {
        allTasks.push({
            title: '羽翼之歌',
            description: '寻找一只鸟，观察它的姿态与鸣唱',
            duration: '6分钟',
            difficulty: '中等',
            type: 'bird_watching',
            tags: ['观鸟', '动物'],
            weight: 3
        });
    }
    
    // 合并所有任务
    allTasks.push(...baseTasks);
    
    // 根据权重排序（有权重的优先）
    allTasks.sort((a, b) => (b.weight || 1) - (a.weight || 1));
    
    // 随机选择前6个，然后取3个
    const topTasks = allTasks.slice(0, 6);
    const shuffled = topTasks.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
}

function openDoor(taskIndex) {
    const tasks = generateSimpleTasks(userData);
    currentTask = tasks[taskIndex];
    showRecordInterface();
}

// ==================== 记录功能 ====================

function previewImages() {
    const files = document.getElementById('imageUpload').files;
    const preview = document.getElementById('imagePreview');
    if (!preview) return;
    
    preview.innerHTML = '';

    for (let file of files) {
        if (!file.type.startsWith('image/')) {
            alert(`文件 "${file.name}" 不是图片格式`);
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
            if (event.data.size > 0) audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            if (recordingTimer) {
                clearInterval(recordingTimer);
                recordingTimer = null;
            }
            
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const actualDuration = Math.round((Date.now() - recordingStartTime - recordingPausedTime) / 1000);
            
            const audioContainer = document.createElement('div');
            audioContainer.style.marginTop = '10px';
            audioContainer.innerHTML = `
                <audio controls style="width: 100%;">
                    <source src="${audioUrl}" type="audio/wav">
                </audio>
                <div style="margin-top: 5px; font-size: 12px; color: #6c757d;">
                    录音时长: ${formatTime(actualDuration)}
                </div>
            `;
            
            const preview = document.getElementById('audioPreview');
            preview.innerHTML = '';
            preview.appendChild(audioContainer);
            
            window.currentAudioData = { blob: audioBlob, url: audioUrl, duration: actualDuration };
            resetRecordingButtons();
        };

        mediaRecorder.start(100);
        
        document.getElementById('startRecording').style.display = 'none';
        document.getElementById('pauseRecording').style.display = 'inline-block';
        document.getElementById('stopRecording').style.display = 'inline-block';
        document.getElementById('recordingTimer').style.display = 'block';
        
        startTimer();
        
    } catch (error) {
        alert('无法访问麦克风，请检查权限设置');
        console.error(error);
        resetRecordingButtons();
    }
}

function pauseRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.pause();
        const pauseTime = Date.now();
        recordingPausedTime += pauseTime - recordingStartTime;
        isRecordingPaused = true;
        
        if (recordingTimer) {
            clearInterval(recordingTimer);
            recordingTimer = null;
        }
        
        document.getElementById('pauseRecording').style.display = 'none';
        document.getElementById('resumeRecording').style.display = 'inline-block';
        
        const timerElement = document.getElementById('recordingTimer');
        timerElement.className = 'paused';
        timerElement.innerHTML = `⏸️ 录音已暂停... <span id="timerDisplay">${document.getElementById('timerDisplay').textContent}</span>`;
    }
}

function resumeRecording() {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
        mediaRecorder.resume();
        isRecordingPaused = false;
        // 不要重置recordingStartTime，而是记录恢复时间
        const resumeTime = Date.now();
        recordingStartTime = resumeTime - (recordingPausedTime); // 修正时间计算
        recordingPausedTime = 0; // 重置暂停时间
        
        document.getElementById('resumeRecording').style.display = 'none';
        document.getElementById('pauseRecording').style.display = 'inline-block';
        
        startTimer();
    }
}

function stopRecording() {
    if (mediaRecorder && (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused')) {
        mediaRecorder.stop();
        if (mediaRecorder.stream) {
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    }
}

function startTimer() {
    recordingTimer = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = Math.floor((currentTime - recordingStartTime - recordingPausedTime) / 1000);
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(elapsedTime);
            const timerContainer = document.getElementById('recordingTimer');
            timerContainer.className = 'recording';
            timerContainer.innerHTML = `🔴 录音中... <span id="timerDisplay">${formatTime(elapsedTime)}</span>`;
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
let currentFacingMode = 'environment'; // 默认后置摄像头

async function toggleCamera() {
    const cameraBtn = document.getElementById('cameraBtn');
    const cameraContainer = document.getElementById('cameraContainer');
    
    if (!cameraContainer) {
        const container = document.createElement('div');
        container.id = 'cameraContainer';
        container.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); z-index: 1000;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
        `;
        
        container.innerHTML = `
            <video id="cameraVideo" autoplay playsinline style="max-width: 90%; max-height: 70%; border-radius: 8px;"></video>
            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button id="switchCameraBtn" style="padding: 10px 20px; font-size: 16px; background: #74c69d; color: white; border: none; border-radius: 8px; cursor: pointer;">🔄 切换镜头</button>
                <button id="captureBtn" style="padding: 10px 20px; font-size: 16px; background: #52b788; color: white; border: none; border-radius: 8px; cursor: pointer;">📸 拍照</button>
                <button id="closeCameraBtn" style="padding: 10px 20px; font-size: 16px; background: #dc3545; color: white; border: none; border-radius: 8px; cursor: pointer;">❌ 关闭</button>
            </div>
            <canvas id="captureCanvas" style="display: none;"></canvas>
        `;
        
        document.body.appendChild(container);
        
        document.getElementById('switchCameraBtn').addEventListener('click', switchCamera);
        document.getElementById('captureBtn').addEventListener('click', capturePhoto);
        document.getElementById('closeCameraBtn').addEventListener('click', closeCamera);
        
        cameraVideo = document.getElementById('cameraVideo');
    }
    
    try {
        await startCamera(currentFacingMode);
        document.getElementById('cameraContainer').style.display = 'flex';
    } catch (error) {
        alert('无法访问摄像头，请检查权限设置');
        console.error(error);
    }
}

async function startCamera(facingMode) {
    // 停止当前摄像头
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
    
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: facingMode } 
        });
        cameraVideo.srcObject = cameraStream;
    } catch (error) {
        console.error('启动摄像头失败:', error);
        throw error;
    }
}

async function switchCamera() {
    // 切换前后摄像头
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    
    try {
        await startCamera(currentFacingMode);
    } catch (error) {
        alert('切换摄像头失败');
        console.error(error);
        // 切换失败，恢复原来的模式
        currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
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
        const dt = new DataTransfer();
        dt.items.add(file);
        
        const imageUpload = document.getElementById('imageUpload');
        imageUpload.files = dt.files;
        previewImages();
        closeCamera();
        alert('照片已添加到记录中');
    }, 'image/jpeg', 0.8);
}

function closeCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    const container = document.getElementById('cameraContainer');
    if (container) container.style.display = 'none';
}

// 保存记录
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

    const imageFiles = document.getElementById('imageUpload').files;
    const imagePromises = [];
    
    for (let file of imageFiles) {
        const promise = new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({ name: file.name, size: file.size, type: file.type, data: e.target.result });
            };
            reader.readAsDataURL(file);
        });
        imagePromises.push(promise);
    }

    Promise.all(imagePromises).then(images => {
        record.images = images;

        if (window.currentAudioData) {
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
    let records = JSON.parse(localStorage.getItem('userRecords') || '[]');
    records.push(record);
    localStorage.setItem('userRecords', JSON.stringify(records));

    fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
    }).then(res => res.json())
    .then(data => console.log('记录已同步到服务器', data))
    .catch(err => console.error('同步失败:', err));

    alert('记录保存成功！');
    clearRecordForm();
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
    window.currentAudioData = null;
}

// ==================== 记录查看功能 ====================

function loadRecords() {
    const records = JSON.parse(localStorage.getItem('userRecords') || '[]');
    const userRecords = currentUser ? records.filter(r => r.userId === currentUser.id) : records;
    
    // 默认显示个人信息视图
    switchRecordView('profile');
}

function switchRecordView(viewType) {
    // 切换导航按钮状态
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === viewType) {
            btn.classList.add('active');
        }
    });
    
    // 隐藏所有视图
    document.querySelectorAll('.record-view').forEach(view => {
        view.style.display = 'none';
    });
    
    // 显示目标视图
    const targetView = document.getElementById(viewType + 'View');
    if (targetView) {
        targetView.style.display = 'block';
    }
    
    // 加载对应内容
    const records = JSON.parse(localStorage.getItem('userRecords') || '[]');
    const userRecords = currentUser ? records.filter(r => r.userId === currentUser.id) : records;
    
    switch(viewType) {
        case 'profile':
            loadProfileView();
            break;
        case 'calendar':
            loadCalendarView(userRecords);
            break;
        case 'text':
            loadTextView(userRecords);
            break;
        case 'images':
            loadImagesView(userRecords);
            break;
        case 'audio':
            loadAudioView(userRecords);
            break;
    }
}

function loadProfileView() {
    const profileView = document.getElementById('profileView');
    if (!profileView || !currentUser) return;
    
    const profile = userData || {};
    
    profileView.innerHTML = `
        <div class="profile-container">
            <div class="profile-header">
                <div class="profile-avatar">👤</div>
                <div class="profile-basic">
                    <h2>${currentUser.username}</h2>
                    <p class="profile-email">${currentUser.email}</p>
                </div>
                <button onclick="logout()" class="logout-btn">🚪 退出登录</button>
            </div>
            
            ${profile.age || profile.gender || profile.location ? `
                <div class="profile-section">
                    <h3>📋 基本信息</h3>
                    <div class="profile-grid">
                        ${profile.age ? `<div class="profile-item"><span class="label">年龄</span><span class="value">${profile.age} 岁</span></div>` : ''}
                        ${profile.gender ? `<div class="profile-item"><span class="label">性别</span><span class="value">${profile.gender}</span></div>` : ''}
                        ${profile.location ? `<div class="profile-item"><span class="label">居住地类型</span><span class="value">${profile.location}</span></div>` : ''}
                    </div>
                </div>
            ` : ''}
            
            ${profile.greenLevel || profile.terrain || profile.growthEnv ? `
                <div class="profile-section">
                    <h3>🌿 环境信息</h3>
                    <div class="profile-grid">
                        ${profile.greenLevel ? `<div class="profile-item"><span class="label">绿色含量</span><span class="value">${profile.greenLevel}</span></div>` : ''}
                        ${profile.terrain ? `<div class="profile-item"><span class="label">常见地貌</span><span class="value">${profile.terrain}</span></div>` : ''}
                        ${profile.growthEnv ? `<div class="profile-item"><span class="label">成长环境</span><span class="value">${profile.growthEnv}</span></div>` : ''}
                        ${profile.contactFreq ? `<div class="profile-item"><span class="label">自然接触频率</span><span class="value">${profile.contactFreq}</span></div>` : ''}
                    </div>
                </div>
            ` : ''}
            
            ${profile.interests && profile.interests.length > 0 ? `
                <div class="profile-section">
                    <h3>❤️ 兴趣爱好</h3>
                    <div class="interest-tags">
                        ${profile.interests.map(interest => `<span class="interest-tag">${interest}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function loadCalendarView(records) {
    const calendarView = document.getElementById('calendarView');
    if (!calendarView) return;
    
    if (records.length === 0) {
        calendarView.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 40px;">暂无记录</p>';
        return;
    }
    
    // 按日期分组
    const recordsByDate = {};
    records.forEach(record => {
        const date = record.date || new Date(record.timestamp).toLocaleDateString('zh-CN');
        if (!recordsByDate[date]) {
            recordsByDate[date] = [];
        }
        recordsByDate[date].push(record);
    });
    
    let html = '<div class="calendar-records">';
    Object.keys(recordsByDate).sort().reverse().forEach(date => {
        const dateRecords = recordsByDate[date];
        const recordCount = dateRecords.length;
        const imageCount = dateRecords.reduce((sum, r) => sum + (r.images ? r.images.length : 0), 0);
        const audioCount = dateRecords.filter(r => r.audioData).length;
        
        html += `<div class="date-card" onclick="viewDateDetails('${date}')">
            <div class="date-header">
                <h3>${date}</h3>
                <span class="record-count">${recordCount} 条记录</span>
            </div>
            <div class="date-summary">
                <span class="summary-item">📝 ${recordCount} 个任务</span>
                ${imageCount > 0 ? `<span class="summary-item">📷 ${imageCount} 张图片</span>` : ''}
                ${audioCount > 0 ? `<span class="summary-item">🎵 ${audioCount} 段录音</span>` : ''}
            </div>
            <div class="date-preview">
                ${dateRecords.slice(0, 2).map(r => 
                    `<div class="preview-task">🚪 ${r.task ? r.task.title : '未知任务'}</div>`
                ).join('')}
                ${recordCount > 2 ? `<div class="preview-more">还有 ${recordCount - 2} 条记录...</div>` : ''}
            </div>
        </div>`;
    });
    html += '</div>';
    
    calendarView.innerHTML = html;
}

// 查看某日详情
window.viewDateDetails = function(date) {
    const records = JSON.parse(localStorage.getItem('userRecords') || '[]');
    const userRecords = currentUser ? records.filter(r => r.userId === currentUser.id) : records;
    const dateRecords = userRecords.filter(r => {
        const recordDate = r.date || new Date(r.timestamp).toLocaleDateString('zh-CN');
        return recordDate === date;
    });
    
    let html = `
        <div class="date-detail-view">
            <div class="detail-header">
                <button onclick="switchRecordView('calendar')" class="back-btn">← 返回日历</button>
                <h2>${date}</h2>
            </div>
            <div class="detail-content">
    `;
    
    dateRecords.forEach((record, index) => {
        html += `
            <div class="detail-record-card">
                <div class="record-header">
                    <h3>🚪 ${record.task ? record.task.title : '未知任务'}</h3>
                    <span class="record-time">${new Date(record.timestamp).toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'})}</span>
                </div>
                
                ${record.textRecord ? `
                    <div class="record-section">
                        <h4>📝 文字记录</h4>
                        <p class="record-text">${record.textRecord}</p>
                    </div>
                ` : ''}
                
                ${record.sensoryExperience && (record.sensoryExperience.visual || record.sensoryExperience.auditory || record.sensoryExperience.tactile || record.sensoryExperience.olfactory) ? `
                    <div class="record-section">
                        <h4>🌟 感官体验</h4>
                        <div class="sensory-grid">
                            ${record.sensoryExperience.visual ? `<div class="sensory-item"><strong>👁️ 视觉：</strong>${record.sensoryExperience.visual}</div>` : ''}
                            ${record.sensoryExperience.auditory ? `<div class="sensory-item"><strong>👂 听觉：</strong>${record.sensoryExperience.auditory}</div>` : ''}
                            ${record.sensoryExperience.tactile ? `<div class="sensory-item"><strong>✋ 触觉：</strong>${record.sensoryExperience.tactile}</div>` : ''}
                            ${record.sensoryExperience.olfactory ? `<div class="sensory-item"><strong>👃 嗅觉：</strong>${record.sensoryExperience.olfactory}</div>` : ''}
                        </div>
                    </div>
                ` : ''}
                
                ${record.images && record.images.length > 0 ? `
                    <div class="record-section">
                        <h4>📷 图片记录 (${record.images.length})</h4>
                        <div class="detail-image-gallery">
                            ${record.images.map(img => `
                                <img src="${img.data}" alt="记录图片" onclick="viewImage('${img.data}')" class="detail-image">
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${record.audioData ? `
                    <div class="record-section">
                        <h4>🎵 录音记录</h4>
                        <audio controls style="width: 100%; margin-top: 10px;">
                            <source src="${record.audioData.data}" type="audio/wav">
                        </audio>
                        <div class="audio-info">时长: ${formatTime(record.audioData.duration)}</div>
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    const calendarView = document.getElementById('calendarView');
    if (calendarView) {
        calendarView.innerHTML = html;
    }
};

function loadTextView(records) {
    const textView = document.getElementById('textView');
    if (!textView) return;
    
    const textRecords = records.filter(r => r.textRecord && r.textRecord.trim());
    
    if (textRecords.length === 0) {
        textView.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 40px;">暂无文字记录</p>';
        return;
    }
    
    let html = '<div class="text-records-grid">';
    textRecords.forEach(record => {
        const date = record.date || new Date(record.timestamp).toLocaleDateString('zh-CN');
        const time = new Date(record.timestamp).toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'});
        html += `
            <div class="text-record-card">
                <div class="text-record-header">
                    <div class="text-record-date">
                        <span class="date-text">${date}</span>
                        <span class="time-text">${time}</span>
                    </div>
                    <span class="task-badge">🚪 ${record.task ? record.task.title : '未知任务'}</span>
                </div>
                <div class="text-record-content">
                    ${record.textRecord}
                </div>
                ${record.sensoryExperience && (record.sensoryExperience.visual || record.sensoryExperience.auditory || record.sensoryExperience.tactile || record.sensoryExperience.olfactory) ? `
                    <div class="text-record-sensory">
                        ${record.sensoryExperience.visual ? `<div class="mini-sensory">👁️ ${record.sensoryExperience.visual}</div>` : ''}
                        ${record.sensoryExperience.auditory ? `<div class="mini-sensory">👂 ${record.sensoryExperience.auditory}</div>` : ''}
                        ${record.sensoryExperience.tactile ? `<div class="mini-sensory">✋ ${record.sensoryExperience.tactile}</div>` : ''}
                        ${record.sensoryExperience.olfactory ? `<div class="mini-sensory">👃 ${record.sensoryExperience.olfactory}</div>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    });
    html += '</div>';
    
    textView.innerHTML = html;
}

function loadImagesView(records) {
    const imagesView = document.getElementById('imagesView');
    if (!imagesView) return;
    
    const imageRecords = records.filter(r => r.images && r.images.length > 0);
    
    if (imageRecords.length === 0) {
        imagesView.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 40px;">暂无图片记录</p>';
        return;
    }
    
    let html = '<div class="images-gallery-grid">';
    imageRecords.forEach(record => {
        const date = record.date || new Date(record.timestamp).toLocaleDateString('zh-CN');
        const time = new Date(record.timestamp).toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'});
        record.images.forEach((img, index) => {
            html += `
                <div class="image-card">
                    <div class="image-wrapper" onclick="viewImage('${img.data}')">
                        <img src="${img.data}" alt="记录图片">
                        <div class="image-overlay">
                            <span class="view-icon">🔍 查看大图</span>
                        </div>
                    </div>
                    <div class="image-info">
                        <div class="image-date">
                            <span class="date-text">${date}</span>
                            <span class="time-text">${time}</span>
                        </div>
                        <div class="image-task">🚪 ${record.task ? record.task.title : '未知任务'}</div>
                    </div>
                </div>
            `;
        });
    });
    html += '</div>';
    
    imagesView.innerHTML = html;
}

function loadAudioView(records) {
    const audioView = document.getElementById('audioView');
    if (!audioView) return;
    
    const audioRecords = records.filter(r => r.audioData);
    
    if (audioRecords.length === 0) {
        audioView.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 40px;">暂无录音记录</p>';
        return;
    }
    
    let html = '<div class="audio-records-grid">';
    audioRecords.forEach(record => {
        const date = record.date || new Date(record.timestamp).toLocaleDateString('zh-CN');
        const time = new Date(record.timestamp).toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'});
        html += `
            <div class="audio-record-card">
                <div class="audio-record-header">
                    <div class="audio-icon">🎵</div>
                    <div class="audio-info-header">
                        <div class="audio-task">🚪 ${record.task ? record.task.title : '未知任务'}</div>
                        <div class="audio-date">
                            <span class="date-text">${date}</span>
                            <span class="time-text">${time}</span>
                        </div>
                    </div>
                    <div class="audio-duration">${formatTime(record.audioData.duration)}</div>
                </div>
                <div class="audio-player-wrapper">
                    <audio controls>
                        <source src="${record.audioData.data}" type="audio/wav">
                    </audio>
                </div>
                ${record.textRecord ? `
                    <div class="audio-text-preview">
                        <div class="preview-label">📝 文字记录</div>
                        <div class="preview-content">${record.textRecord.substring(0, 100)}${record.textRecord.length > 100 ? '...' : ''}</div>
                    </div>
                ` : ''}
            </div>
        `;
    });
    html += '</div>';
    
    audioView.innerHTML = html;
}

// 查看大图
window.viewImage = function(src) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
    `;
    modal.innerHTML = `<img src="${src}" style="max-width: 90%; max-height: 90%; border-radius: 8px;">`;
    modal.onclick = () => modal.remove();
    document.body.appendChild(modal);
};

// 退出登录
window.logout = function() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('currentUser');
        currentUser = null;
        userData = {};
        alert('已退出登录');
        location.reload();
    }
};
