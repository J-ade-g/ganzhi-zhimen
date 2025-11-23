// 感知之门 - 功能集成脚本

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    
    // 监听个人资料导航按钮
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('nav-btn') && e.target.dataset.view === 'profile') {
            showProfileView();
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
