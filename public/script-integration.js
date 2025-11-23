// 感知之门 - 功能集成脚本

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    
    // 监听个人资料导航按钮
    document.addEventListener('click', function(e) {
        // 处理个人资料标签点击
        if (e.target.classList.contains('nav-btn') && e.target.dataset.view === 'profile') {
            e.preventDefault();
            // 移除所有active类
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            // 添加active类到当前按钮
            e.target.classList.add('active');
            // 显示个人资料
            if (typeof showProfileView === 'function') {
                showProfileView();
            }
        }
    });
    
    // 重写保存记录函数，添加自然连接感数据
    const originalSaveRecord = document.getElementById('saveRecord');
    if (originalSaveRecord) {
        originalSaveRecord.addEventListener('click', function() {
            const natureConnection = getNatureConnectionScore();
            if (natureConnection === null) {
                alert('请选择自然连接感评分');
                return false;
            }
            // 将评分添加到记录数据中
            window.currentRecordNatureConnection = natureConnection;
        });
    }
    
    // 使用个性化推荐替换任务生成
    const refreshTasksBtn = document.getElementById('refreshTasks');
    if (refreshTasksBtn) {
        refreshTasksBtn.addEventListener('click', function() {
            const tasks = getPersonalizedTasks();
            displayTasks(tasks);
        });
    }
});

// 显示任务列表
function displayTasks(tasks) {
    const container = document.getElementById('tasksContainer');
    if (!container) return;
    
    container.innerHTML = tasks.map(task => `
        <div class="task-card" onclick="selectTask(${JSON.stringify(task).replace(/"/g, '&quot;')})">
            <div class="task-icon">${task.icon}</div>
            <div class="task-title">${task.title}</div>
            <div class="task-description">${task.description}</div>
        </div>
    `).join('');
}

// 选择任务
function selectTask(task) {
    window.currentTask = task;
    // 触发原有的任务选择逻辑
    if (typeof showRecordInterface === 'function') {
        showRecordInterface();
    }
}


// 显示AI助手按钮（当用户登录后）
function showAIAssistantButton() {
    const aiBtn = document.getElementById('aiAssistantBtn');
    if (aiBtn) {
        aiBtn.style.display = 'block';
    }
}

// 隐藏AI助手按钮
function hideAIAssistantButton() {
    const aiBtn = document.getElementById('aiAssistantBtn');
    if (aiBtn) {
        aiBtn.style.display = 'none';
    }
}

// 监听界面切换，确保AI按钮在正确的时机显示
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        // 检查主应用是否显示
        const mainApp = document.getElementById('mainApp');
        const recordInterface = document.getElementById('recordInterface');
        const recordsView = document.getElementById('recordsView');
        
        if (mainApp && mainApp.style.display !== 'none') {
            showAIAssistantButton();
        } else if (recordInterface && recordInterface.style.display !== 'none') {
            showAIAssistantButton();
        } else if (recordsView && recordsView.style.display !== 'none') {
            showAIAssistantButton();
        }
    });
});

// 开始观察
setTimeout(function() {
    const container = document.querySelector('.container');
    if (container) {
        observer.observe(container, {
            attributes: true,
            childList: true,
            subtree: true,
            attributeFilter: ['style']
        });
    }
}, 1000);

// 导出函数
window.showAIAssistantButton = showAIAssistantButton;
window.hideAIAssistantButton = hideAIAssistantButton;
