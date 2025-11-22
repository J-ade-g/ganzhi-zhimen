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

document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成');
    
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

    // 绑定事件监听器
    bindEventListeners();
});

function bindEventListeners() {
    console.log('绑定事件监听器');
    
    // 登录/注册表单
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const userForm = document.getElementById('userForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    if (userForm) {
        userForm.addEventListener('submit', handleUserFormSubmit);
    }
    
    // 登录/注册标签切换
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('auth-tab')) {
            switchAuthTab(e.target.dataset.tab);
        }
    });

    // 动态按钮事件委托
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('door-btn')) {
            console.log('点击了感知之门按钮');
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
    
    if (startRecordingBtn) startRecordingBtn.addEventListener('click', startRecordingFixed);
    if (pauseRecordingBtn) pauseRecordingBtn.addEventListener('click', pauseRecordingFixed);
    if (resumeRecordingBtn) resumeRecordingBtn.addEventListener('click', resumeRecordingFixed);
    if (stopRecordingBtn) stopRecordingBtn.addEventListener('click', stopRecordingFixed);

    // 图片预览和拍照功能
    const imageUpload = document.getElementById('imageUpload');
    const cameraBtn = document.getElementById('cameraBtn');
    if (imageUpload) imageUpload.addEventListener('change', previewImages);
    if (cameraBtn) cameraBtn.addEventListener('click', toggleCamera);
}

// 表单提交处理函数
function handleUserFormSubmit(e) {
    console.log('表单提交事件触发');
    e.preventDefault();
    
    // 收集用户数据
    userData = {
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

    // 保存到本地存储
    localStorage.setItem('userData', JSON.stringify(userData));
    console.log('用户数据已保存到本地存储');
    
    // 同时保存到服务器（用于后台管理）
    fetch('/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    }).then(response => {
        console.log('用户信息已同步到服务器');
    }).catch(error => {
        console.error('同步到服务器失败:', error);
    });
    
    // 显示主应用
    console.log('准备显示主应用');
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
    
    // 显示欢迎用户名
    const welcomeUsername = document.getElementById('welcomeUsername');
    if (welcomeUsername && currentUser) {
        welcomeUsername.textContent = currentUser.username;
    }
}

function showMainApp() {
    console.log('显示主应用');
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
        currentTaskDiv.innerHTML = `<strong>当前感知之门：</strong>${currentTask.title}<br><small>${currentTask.description}</small>`;
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

// 更新欢迎信息和统计数据
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
        const stats = calculateUserStats(records);
        
        userStatsDiv.innerHTML = `
            <div class="stat-item">
                <div class="stat-number">${stats.totalRecords}</div>
                <div class="stat-label">总记录</div>
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
        console.error('未找到任务容器');
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
            <button class="door-btn" data-task-index="${index}">开启此门</button>
        `;
        container.appendChild(taskDiv);
    });
    
    console.log('任务选项生成完成，共', tasks.length, '个任务');
}

function generateSimpleTasks(user) {
    const allTasks = [
        {
            title: '身边的绿色',
            description: '找到你周围3种不同的绿色，用手机拍下来或画下来。',
            duration: '3分钟',
            difficulty: '简单',
            type: 'color_observation'
        },
        {
            title: '声音收集',
            description: '静坐2分钟，记录你听到的所有声音。',
            duration: '2分钟',
            difficulty: '简单',
            type: 'sound_collection'
        },
        {
            title: '触感体验',
            description: '用手触摸3种不同质感的自然物体，描述感受。',
            duration: '3分钟',
            difficulty: '简单',
            type: 'touch_experience'
        },
        {
            title: '天空观察',
            description: '抬头看天空1分钟，描述云朵的形状。',
            duration: '1分钟',
            difficulty: '简单',
            type: 'sky_watching'
        },
        {
            title: '气味探索',
            description: '闻一闻周围的气味，记录最特别的一种。',
            duration: '2分钟',
            difficulty: '简单',
            type: 'smell_exploration'
        }
    ];

    // 基于用户兴趣添加特定任务
    if (user.interests && user.interests.includes('植物识别')) {
        allTasks.push({
            title: '叶子形状',
            description: '找一片叶子，仔细观察它的形状和纹理。',
            duration: '3分钟',
            difficulty: '简单',
            type: 'plant_observation'
        });
    }

    if (user.interests && user.interests.includes('摄影')) {
        allTasks.push({
            title: '光影捕捉',
            description: '拍一张有趣光影效果的照片。',
            duration: '5分钟',
            difficulty: '简单',
            type: 'photography'
        });
    }

    // 随机选择3个任务
    const shuffled = allTasks.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
}

function openDoor(taskIndex) {
    console.log('开启感知之门，任务索引:', taskIndex);
    const tasks = generateSimpleTasks(userData);
    currentTask = tasks[taskIndex];
    console.log('选择的任务:', currentTask);
    showRecordInterface();
}

// 图片预览功能
function previewImages() {
    const files = document.getElementById('imageUpload').files;
    const preview = document.getElementById('imagePreview');
    if (!preview) return;
    
    preview.innerHTML = '';

    for (let file of files) {
        // 检查文件类型，只允许图片格式
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

// 录音相关函数
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
            // 停止计时器
            if (recordingTimer) {
                clearInterval(recordingTimer);
                recordingTimer = null;
            }
            
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // 计算实际录音时长
            const actualDuration = Math.round((Date.now() - recordingStartTime - recordingPausedTime) / 1000);
            
            // 创建音频播放器
            const audioContainer = document.createElement('div');
            audioContainer.style.marginTop = '10px';
            audioContainer.innerHTML = `
                <audio controls style="width: 100%;">
                    <source src="${audioUrl}" type="audio/wav">
                    您的浏览器不支持音频播放。
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
            
            // 重置按钮状态
            resetRecordingButtons();
        };

        mediaRecorder.start(100); // 每100ms收集一次数据
        
        // 更新按钮状态
        document.getElementById('startRecording').style.display = 'none';
        document.getElementById('pauseRecording').style.display = 'inline-block';
        document.getElementById('stopRecording').style.display = 'inline-block';
        document.getElementById('recordingTimer').style.display = 'block';
        
        // 开始计时器
        startTimer();
        
    } catch (error) {
        alert('无法访问麦克风，请检查权限设置');
        console.error('录音错误:', error);
        resetRecordingButtons();
    }
}

function pauseRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.pause();
        
        // 记录暂停时的时间点
        const pauseTime = Date.now();
        recordingPausedTime += pauseTime - recordingStartTime;
        isRecordingPaused = true;
        
        // 停止计时器
        if (recordingTimer) {
            clearInterval(recordingTimer);
            recordingTimer = null;
        }
        
        // 更新按钮状态
        document.getElementById('pauseRecording').style.display = 'none';
        document.getElementById('resumeRecording').style.display = 'inline-block';
        
        // 更新显示状态
        const timerElement = document.getElementById('recordingTimer');
        timerElement.className = 'paused';
        timerElement.innerHTML = `⏸️ 录音已暂停... <span id="timerDisplay">${document.getElementById('timerDisplay').textContent}</span>`;
    }
}

function resumeRecording() {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
        mediaRecorder.resume();
        isRecordingPaused = false;
        // 重新设置开始时间为当前时间（用于计算后续的录音时长）
        recordingStartTime = Date.now();
        
        // 更新按钮状态
        document.getElementById('resumeRecording').style.display = 'none';
        document.getElementById('pauseRecording').style.display = 'inline-block';
        
        // 重新开始计时器
        startTimer();
    }
}

function stopRecording() {
    if (mediaRecorder && (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused')) {
        mediaRecorder.stop();
        
        // 停止所有音轨
        if (mediaRecorder.stream) {
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    }
}

function startTimer() {
    recordingTimer = setInterval(() => {
        const currentTime = Date.now();
        // 修复时长计算：当前时间 - 开始时间 - 暂停的总时长
        const elapsedTime = Math.floor((currentTime - recordingStartTime - recordingPausedTime) / 1000);
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(elapsedTime);
            // 更新录音状态显示
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

// 保存记录功能
function saveRecord() {
    const record = {
        taskId: Date.now(),
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
        audioData: null,
        userId: userData.age + '_' + userData.location + '_' + userData.gender
    };

    // 处理图片
    const imageFiles = document.getElementById('imageUpload').files;
    for (let file of imageFiles) {
        record.images.push({
            name: file.name,
            size: file.size,
            url: URL.createObjectURL(file)
        });
    }

    // 处理录音数据
    if (window.currentAudioData) {
        record.audioData = {
            url: window.currentAudioData.url,
            duration: window.currentAudioData.duration,
            timestamp: new Date().toISOString()
        };
    }

    // 保存记录到本地存储
    let records = JSON.parse(localStorage.getItem('userRecords') || '[]');
    records.push(record);
    localStorage.setItem('userRecords', JSON.stringify(records));

    // 同时保存到服务器（用于后台管理）
    fetch('/api/records', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(record)
    }).then(response => {
        console.log('记录已同步到服务器');
    }).catch(error => {
        console.error('同步到服务器失败:', error);
    });

    // 显示保存成功消息
    alert('记录保存成功！你的感知体验已经记录下来了。');
    
    // 清空表单和音频数据
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
    // 更新导航按钮状态
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-view="${viewType}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // 隐藏所有视图
    document.querySelectorAll('.record-view').forEach(view => {
        view.style.display = 'none';
    });

    // 显示选中的视图
    const targetView = document.getElementById(viewType + 'View');
    if (targetView) targetView.style.display = 'block';

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
    const stats = calculateUserStats(records);
    
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
        showUserForm();
    }
}

function displayCalendarRecords(records) {
    const container = document.getElementById('calendarView');
    if (!container) return;
    
    if (records.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d;">还没有记录，快去开启你的第一扇感知之门吧！</p>';
        return;
    }

    // 按日期分组
    const groupedRecords = {};
    records.forEach(record => {
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
            html += `<div style="margin-bottom: 10px; padding: 10px; background: white; border-radius: 4px;">
                <strong>${record.task.title}</strong><br>
                <small>${record.textRecord || '无文字记录'}</small>
            </div>`;
        });
        
        html += `</div></div>`;
    });

    container.innerHTML = html;
}

function displayTextRecords(records) {
    const container = document.getElementById('textView');
    if (!container) return;
    
    const textRecords = records.filter(r => r.textRecord && r.textRecord.trim());
    
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
    
    const imageRecords = records.filter(r => r.images && r.images.length > 0);
    
    if (imageRecords.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d;">还没有图片记录</p>';
        return;
    }

    let html = '<div class="media-gallery">';
    imageRecords.forEach(record => {
        record.images.forEach(image => {
            html += `<div class="media-item">
                <img src="${image.url}" alt="感知记录">
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
    
    const audioRecords = records.filter(r => r.audioData);
    
    if (audioRecords.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d;">还没有录音记录</p>';
        return;
    }

    let html = '';
    audioRecords.forEach(record => {
        html += `<div class="record-item">
            <div class="record-date">${record.date || new Date(record.timestamp).toLocaleDateString('zh-CN')}</div>
            <strong>${record.task.title}</strong>
            <div style="margin: 10px 0;">
                <audio controls style="width: 100%;">
                    <source src="${record.audioData.url}" type="audio/wav">
                    您的浏览器不支持音频播放。
                </audio>
            </div>
            <small style="color: #6c757d;">录音时长: ${formatTime(record.audioData.duration)}</small>
            ${record.textRecord ? `<p style="margin-top: 10px;">${record.textRecord}</p>` : ''}
        </div>`;
    });

    container.innerHTML = html;
}

// 重置应用数据（调试用）
function resetApp() {
    localStorage.removeItem('userData');
    localStorage.removeItem('userRecords');
    location.reload();
}// 拍
照相关变量
let cameraStream = null;
let isCameraActive = false;

// 拍照功能
async function toggleCamera() {
    const cameraBtn = document.getElementById('cameraBtn');
    const cameraPreview = document.getElementById('cameraPreview');
    
    if (!isCameraActive) {
        // 开启摄像头
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment' // 优先使用后置摄像头
                } 
            });
            
            cameraPreview.srcObject = cameraStream;
            cameraPreview.style.display = 'block';
            cameraPreview.play();
            
            // 添加拍照按钮
            const existingControls = document.querySelector('.camera-controls');
            if (existingControls) {
                existingControls.remove();
            }
            
            const cameraControls = document.createElement('div');
            cameraControls.className = 'camera-controls';
            cameraControls.innerHTML = `
                <button type="button" id="captureBtn" class="task-btn">📸 拍照</button>
                <button type="button" id="closeCameraBtn" class="back-btn">关闭摄像头</button>
            `;
            
            cameraPreview.parentNode.insertBefore(cameraControls, cameraPreview.nextSibling);
            
            // 绑定拍照和关闭按钮事件
            document.getElementById('captureBtn').addEventListener('click', capturePhoto);
            document.getElementById('closeCameraBtn').addEventListener('click', closeCamera);
            
            cameraBtn.textContent = '📷 摄像头已开启';
            cameraBtn.disabled = true;
            isCameraActive = true;
            
        } catch (error) {
            alert('无法访问摄像头，请检查权限设置');
            console.error('摄像头错误:', error);
        }
    }
}

function capturePhoto() {
    const cameraPreview = document.getElementById('cameraPreview');
    const canvas = document.getElementById('photoCanvas');
    const preview = document.getElementById('imagePreview');
    
    if (!canvas || !cameraPreview) return;
    
    // 设置canvas尺寸
    canvas.width = cameraPreview.videoWidth;
    canvas.height = cameraPreview.videoHeight;
    
    // 绘制当前视频帧到canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(cameraPreview, 0, 0);
    
    // 转换为blob并创建预览
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        
        // 创建图片预览
        const img = document.createElement('img');
        img.src = url;
        img.style.width = '100px';
        img.style.height = '100px';
        img.style.objectFit = 'cover';
        img.style.margin = '5px';
        img.style.borderRadius = '4px';
        img.style.border = '2px solid #52b788';
        
        preview.appendChild(img);
        
        // 创建一个虚拟的File对象来模拟文件上传
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        // 将文件添加到文件输入框（用于后续保存）
        const dt = new DataTransfer();
        const existingFiles = document.getElementById('imageUpload').files;
        
        // 保留现有文件
        for (let i = 0; i < existingFiles.length; i++) {
            dt.items.add(existingFiles[i]);
        }
        
        // 添加新拍摄的照片
        dt.items.add(file);
        document.getElementById('imageUpload').files = dt.files;
        
        console.log('照片已拍摄并添加到预览');
        
    }, 'image/jpeg', 0.8);
}

function closeCamera() {
    const cameraBtn = document.getElementById('cameraBtn');
    const cameraPreview = document.getElementById('cameraPreview');
    const cameraControls = document.querySelector('.camera-controls');
    
    // 停止摄像头流
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    // 隐藏预览
    cameraPreview.style.display = 'none';
    cameraPreview.srcObject = null;
    
    // 移除控制按钮
    if (cameraControls) {
        cameraControls.remove();
    }
    
    // 重置按钮状态
    cameraBtn.textContent = '📷 拍照';
    cameraBtn.disabled = false;
    isCameraActive = false;
}

// 修复录音时长计算问题
let totalRecordingTime = 0;

function startRecordingFixed() {
    // 重置总录音时间
    totalRecordingTime = 0;
    recordingStartTime = Date.now();
    recordingPausedTime = 0;
    
    // 调用原始的开始录音函数
    startRecording();
}

// 重写暂停录音函数以正确计算时长
function pauseRecordingFixed() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.pause();
        
        // 累加这次录音的时长
        const currentSegmentTime = Date.now() - recordingStartTime;
        totalRecordingTime += currentSegmentTime;
        
        isRecordingPaused = true;
        
        // 停止计时器
        if (recordingTimer) {
            clearInterval(recordingTimer);
            recordingTimer = null;
        }
        
        // 更新按钮状态
        document.getElementById('pauseRecording').style.display = 'none';
        document.getElementById('resumeRecording').style.display = 'inline-block';
        
        // 更新显示状态
        const timerElement = document.getElementById('recordingTimer');
        timerElement.className = 'paused';
        const currentTime = Math.floor(totalRecordingTime / 1000);
        timerElement.innerHTML = `⏸️ 录音已暂停... <span id="timerDisplay">${formatTime(currentTime)}</span>`;
    }
}

function resumeRecordingFixed() {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
        mediaRecorder.resume();
        isRecordingPaused = false;
        
        // 重新设置开始时间
        recordingStartTime = Date.now();
        
        // 更新按钮状态
        document.getElementById('resumeRecording').style.display = 'none';
        document.getElementById('pauseRecording').style.display = 'inline-block';
        
        // 重新开始计时器
        startTimerFixed();
    }
}

function startTimerFixed() {
    recordingTimer = setInterval(() => {
        const currentTime = Date.now();
        const currentSegmentTime = currentTime - recordingStartTime;
        const totalTime = totalRecordingTime + currentSegmentTime;
        const elapsedSeconds = Math.floor(totalTime / 1000);
        
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(elapsedSeconds);
            // 更新录音状态显示
            const timerContainer = document.getElementById('recordingTimer');
            timerContainer.className = 'recording';
            timerContainer.innerHTML = `🔴 录音中... <span id="timerDisplay">${formatTime(elapsedSeconds)}</span>`;
        }
    }, 1000);
}

// 更新录音停止时的时长计算
function stopRecordingFixed() {
    if (mediaRecorder && (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused')) {
        // 如果正在录音，累加最后一段时间
        if (mediaRecorder.state === 'recording') {
            const currentSegmentTime = Date.now() - recordingStartTime;
            totalRecordingTime += currentSegmentTime;
        }
        
        mediaRecorder.stop();
        
        // 停止所有音轨
        if (mediaRecorder.stream) {
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    }
}

// 重写mediaRecorder.onstop事件处理
function setupMediaRecorderEvents() {
    if (mediaRecorder) {
        mediaRecorder.onstop = () => {
            // 停止计时器
            if (recordingTimer) {
                clearInterval(recordingTimer);
                recordingTimer = null;
            }
            
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // 使用累计的总时长
            const actualDuration = Math.floor(totalRecordingTime / 1000);
            
            // 创建音频播放器
            const audioContainer = document.createElement('div');
            audioContainer.style.marginTop = '10px';
            audioContainer.innerHTML = `
                <audio controls style="width: 100%;">
                    <source src="${audioUrl}" type="audio/wav">
                    您的浏览器不支持音频播放。
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
            
            // 重置按钮状态
            resetRecordingButtons();
        };
    }
}// 登录/
注册相关函数
function switchAuthTab(tabType) {
    console.log('切换到', tabType, '标签');
    
    // 更新标签状态
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabType}"]`).classList.add('active');
    
    // 切换表单显示
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTitle = document.getElementById('authTitle');
    
    if (tabType === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        authTitle.textContent = '用户登录';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        authTitle.textContent = '用户注册';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    console.log('处理登录');
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    // 从本地存储中查找用户
    const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const user = users.find(u => 
        (u.username === username || u.email === username) && u.password === password
    );
    
    if (user) {
        // 登录成功
        currentUser = {
            id: user.id,
            username: user.username,
            email: user.email
        };
        
        // 保存用户会话
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        console.log('登录成功:', currentUser);
        
        // 检查是否已完成个人信息收集
        const userProfile = localStorage.getItem(`userProfile_${user.id}`);
        if (userProfile) {
            userData = JSON.parse(userProfile);
            showMainApp();
        } else {
            showUserInfoForm();
        }
        
        // 同步到服务器
        try {
            await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
        } catch (error) {
            console.error('服务器同步失败:', error);
        }
        
    } else {
        alert('用户名或密码错误！');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    console.log('处理注册');
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // 验证密码
    if (password !== confirmPassword) {
        alert('两次输入的密码不一致！');
        return;
    }
    
    // 检查用户名和邮箱是否已存在
    const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const existingUser = users.find(u => u.username === username || u.email === email);
    
    if (existingUser) {
        alert('用户名或邮箱已存在！');
        return;
    }
    
    // 创建新用户
    const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password, // 实际应用中应该加密
        createdAt: new Date().toISOString()
    };
    
    // 保存到本地存储
    users.push(newUser);
    localStorage.setItem('allUsers', JSON.stringify(users));
    
    // 设置当前用户
    currentUser = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    console.log('注册成功:', currentUser);
    
    // 同步到服务器
    try {
        await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });
    } catch (error) {
        console.error('服务器同步失败:', error);
    }
    
    // 跳转到个人信息收集
    showUserInfoForm();
}

// 更新用户信息提交处理
function handleUserFormSubmit(e) {
    console.log('表单提交事件触发');
    e.preventDefault();
    
    if (!currentUser) {
        alert('用户未登录！');
        return;
    }
    
    // 收集用户数据
    userData = {
        userId: currentUser.id,
        username: currentUser.username,
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        location: document.getElementById('location').value,
        greenLevel: document.getElementById('greenLevel').value,
        terrain: document.getElementById('terrain').value,
        growthEnv: document.getElementById('growthEnv').value,
        contactFreq: document.getElementById('contactFreq').value,
        interests: [],
        completedAt: new Date().toISOString()
    };

    // 收集兴趣标签
    const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        userData.interests.push(checkbox.value);
    });

    console.log('收集到的用户数据:', userData);

    // 保存用户资料（按用户ID分别存储）
    localStorage.setItem(`userProfile_${currentUser.id}`, JSON.stringify(userData));
    console.log('用户资料已保存');
    
    // 同步到服务器
    fetch('/api/users/profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    }).then(response => {
        console.log('用户资料已同步到服务器');
    }).catch(error => {
        console.error('同步到服务器失败:', error);
    });
    
    // 显示主应用
    console.log('准备显示主应用');
    showMainApp();
}

// 更新保存记录功能，关联用户ID
function saveRecord() {
    if (!currentUser) {
        alert('用户未登录！');
        return;
    }
    
    const record = {
        id: Date.now().toString(),
        userId: currentUser.id,
        username: currentUser.username,
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
        audioData: null,
        sessionDuration: calculateSessionDuration()
    };

    // 处理图片
    const imageFiles = document.getElementById('imageUpload').files;
    for (let file of imageFiles) {
        record.images.push({
            name: file.name,
            size: file.size,
            url: URL.createObjectURL(file),
            type: file.type
        });
    }

    // 处理录音数据
    if (window.currentAudioData) {
        record.audioData = {
            url: window.currentAudioData.url,
            duration: window.currentAudioData.duration,
            timestamp: new Date().toISOString()
        };
    }

    // 保存到用户专属的记录存储
    let userRecords = JSON.parse(localStorage.getItem(`userRecords_${currentUser.id}`) || '[]');
    userRecords.push(record);
    localStorage.setItem(`userRecords_${currentUser.id}`, JSON.stringify(userRecords));
    
    // 同时保存到全局记录（用于管理员查看）
    let allRecords = JSON.parse(localStorage.getItem('allRecords') || '[]');
    allRecords.push(record);
    localStorage.setItem('allRecords', JSON.stringify(allRecords));

    // 同步到服务器
    fetch('/api/records', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(record)
    }).then(response => {
        console.log('记录已同步到服务器');
    }).catch(error => {
        console.error('同步到服务器失败:', error);
    });

    // 显示保存成功消息
    alert('记录保存成功！你的感知体验已经记录下来了。');
    
    // 清空表单和音频数据
    clearRecordForm();
    window.currentAudioData = null;

    // 返回主页
    showMainApp();
}

// 计算会话时长
function calculateSessionDuration() {
    const sessionStart = localStorage.getItem('sessionStartTime');
    if (sessionStart) {
        return Math.floor((Date.now() - parseInt(sessionStart)) / 1000);
    }
    return 0;
}

// 更新统计数据获取（使用用户专属数据）
function calculateUserStats(records) {
    if (!currentUser) return { totalRecords: 0, totalDays: 0, textRecords: 0, imageRecords: 0, audioRecords: 0 };
    
    const userRecords = JSON.parse(localStorage.getItem(`userRecords_${currentUser.id}`) || '[]');
    
    return {
        totalRecords: userRecords.length,
        totalDays: new Set(userRecords.map(r => r.date || new Date(r.timestamp).toLocaleDateString('zh-CN'))).size,
        textRecords: userRecords.filter(r => r.textRecord && r.textRecord.trim()).length,
        imageRecords: userRecords.filter(r => r.images && r.images.length > 0).length,
        audioRecords: userRecords.filter(r => r.audioData).length
    };
}

// 更新记录查看功能
function loadRecords() {
    if (!currentUser) return;
    
    const userRecords = JSON.parse(localStorage.getItem(`userRecords_${currentUser.id}`) || '[]');
    
    // 默认显示个人信息视图
    switchRecordView('profile');
}

// 添加登出功能
function logout() {
    const confirmLogout = confirm('确定要退出登录吗？');
    if (confirmLogout) {
        // 清除用户会话
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionStartTime');
        
        // 重置全局变量
        currentUser = null;
        userData = {};
        
        // 显示登录界面
        showAuthForm();
        
        console.log('用户已退出登录');
    }
}

// 在页面加载时记录会话开始时间
document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('sessionStartTime')) {
        localStorage.setItem('sessionStartTime', Date.now().toString());
    }
});

// 添加主页面的用户信息显示和登出按钮
function updateWelcomeMessage() {
    console.log('更新欢迎信息');
    const userInfoDiv = document.getElementById('userInfo');
    const userStatsDiv = document.getElementById('userStats');
    
    if (userInfoDiv && currentUser) {
        userInfoDiv.innerHTML = `
            <div class="user-info-header">
                <span>选择你的感知之门</span>
                <div>
                    <span style="color: #52b788; font-weight: 600;">欢迎，${currentUser.username}</span>
                    <button class="logout-btn" onclick="logout()">退出登录</button>
                </div>
            </div>
        `;
    }
    
    if (userStatsDiv) {
        // 计算统计信息
        const stats = calculateUserStats();
        
        userStatsDiv.innerHTML = `
            <div class="stat-item">
                <div class="stat-number">${stats.totalRecords}</div>
                <div class="stat-label">总记录</div>
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