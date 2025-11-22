// 后台管理系统JavaScript

let allUsers = [];
let allRecords = [];

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    loadAllData();
    showSection('overview');
});

// 加载所有数据
async function loadAllData() {
    try {
        // 首先尝试从localStorage加载真实数据
        const localUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
        const localRecords = JSON.parse(localStorage.getItem('allRecords') || '[]');
        
        if (localUsers.length > 0 || localRecords.length > 0) {
            console.log('从localStorage加载真实数据:', { users: localUsers.length, records: localRecords.length });
            allUsers = localUsers;
            allRecords = localRecords;
        } else {
            // 尝试从API获取数据
            const usersResponse = await fetch('/api/admin/users');
            allUsers = await usersResponse.json();
            
            const recordsResponse = await fetch('/api/admin/records');
            allRecords = await recordsResponse.json();
            
            console.log('从API加载数据:', { users: allUsers.length, records: allRecords.length });
        }
        
        // 更新所有视图
        updateOverview();
        updateUsersAnalysis();
        updateRecordsAnalysis();
        updateTrendsAnalysis();
        
    } catch (error) {
        console.error('加载数据失败:', error);
        // 如果都失败，生成演示数据
        loadDemoData();
    }
    
    // 设置定时刷新（每30秒刷新一次数据）
    setInterval(() => {
        const newLocalUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
        const newLocalRecords = JSON.parse(localStorage.getItem('allRecords') || '[]');
        
        if (newLocalUsers.length !== allUsers.length || newLocalRecords.length !== allRecords.length) {
            console.log('检测到数据更新，刷新显示');
            allUsers = newLocalUsers;
            allRecords = newLocalRecords;
            updateOverview();
            updateUsersAnalysis();
            updateRecordsAnalysis();
        }
    }, 30000); // 30秒刷新一次
}

// 加载演示数据（当API不可用时）
function loadDemoData() {
    // 从localStorage加载真实用户数据
    const localUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const localRecords = JSON.parse(localStorage.getItem('allRecords') || '[]');
    
    if (localUsers.length > 0 || localRecords.length > 0) {
        console.log('从localStorage加载数据:', { users: localUsers.length, records: localRecords.length });
        allUsers = localUsers;
        allRecords = localRecords;
    } else {
        // 如果没有真实数据，生成演示数据
        console.log('生成演示数据');
        allUsers = generateDemoUsers(20);
        allRecords = generateDemoRecords(100);
    }
    
    updateOverview();
    updateUsersAnalysis();
    updateRecordsAnalysis();
    updateTrendsAnalysis();
}

// 生成演示用户数据
function generateDemoUsers(count) {
    const users = [];
    const locations = ['大城市中心', '城市郊区', '小城镇', '乡村', '山区'];
    const genders = ['男', '女', '其他'];
    const greenLevels = ['很少绿色', '少量绿色', '适中绿色', '丰富绿色', '自然环境'];
    const interests = ['观鸟', '植物识别', '地质', '农耕文化', '摄影', '徒步'];
    
    for (let i = 0; i < count; i++) {
        users.push({
            id: `user_${i + 1}`,
            age: Math.floor(Math.random() * 60) + 18,
            gender: genders[Math.floor(Math.random() * genders.length)],
            location: locations[Math.floor(Math.random() * locations.length)],
            greenLevel: greenLevels[Math.floor(Math.random() * greenLevels.length)],
            interests: interests.slice(0, Math.floor(Math.random() * 4) + 1),
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
    }
    return users;
}

// 生成演示记录数据
function generateDemoRecords(count) {
    const records = [];
    const taskTypes = ['身边的绿色', '声音收集', '触感体验', '天空观察', '气味探索'];
    
    for (let i = 0; i < count; i++) {
        const userId = `user_${Math.floor(Math.random() * 50) + 1}`;
        records.push({
            id: `record_${i + 1}`,
            userId: userId,
            task: {
                title: taskTypes[Math.floor(Math.random() * taskTypes.length)],
                type: 'demo_task'
            },
            textRecord: Math.random() > 0.3 ? '这是一个演示记录' : '',
            images: Math.random() > 0.6 ? [{ name: 'demo.jpg' }] : [],
            audioData: Math.random() > 0.8 ? { duration: 30 } : null,
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
    }
    return records;
}

// 显示指定部分
function showSection(sectionName) {
    // 隐藏所有部分
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // 更新导航按钮状态
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示选中部分
    document.getElementById(sectionName).style.display = 'block';
    event.target.classList.add('active');
}

// 更新数据概览
function updateOverview() {
    const stats = calculateOverallStats();
    const container = document.getElementById('overviewStats');
    
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-number">${stats.totalUsers}</div>
            <div class="stat-label">总用户数</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.totalRecords}</div>
            <div class="stat-label">总记录数</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.activeUsers}</div>
            <div class="stat-label">活跃用户</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.avgRecordsPerUser}</div>
            <div class="stat-label">人均记录数</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.textRecords}</div>
            <div class="stat-label">文字记录</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.imageRecords}</div>
            <div class="stat-label">图片记录</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.audioRecords}</div>
            <div class="stat-label">录音记录</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.completionRate}%</div>
            <div class="stat-label">任务完成率</div>
        </div>
    `;
    
    // 更新活跃度图表
    updateActivityChart();
}

// 计算整体统计数据
function calculateOverallStats() {
    const totalUsers = allUsers.length;
    const totalRecords = allRecords.length;
    const activeUsers = new Set(allRecords.map(r => r.userId)).size;
    const avgRecordsPerUser = totalUsers > 0 ? Math.round(totalRecords / totalUsers * 10) / 10 : 0;
    
    const textRecords = allRecords.filter(r => r.textRecord && r.textRecord.trim()).length;
    const imageRecords = allRecords.filter(r => r.images && r.images.length > 0).length;
    const audioRecords = allRecords.filter(r => r.audioData).length;
    
    const completionRate = totalRecords > 0 ? Math.round((textRecords + imageRecords + audioRecords) / (totalRecords * 3) * 100) : 0;
    
    return {
        totalUsers,
        totalRecords,
        activeUsers,
        avgRecordsPerUser,
        textRecords,
        imageRecords,
        audioRecords,
        completionRate
    };
}

// 更新活跃度图表
function updateActivityChart() {
    const chartContainer = document.getElementById('activityChart');
    
    // 按用户记录数分组
    const recordCounts = {};
    allRecords.forEach(record => {
        recordCounts[record.userId] = (recordCounts[record.userId] || 0) + 1;
    });
    
    const distribution = {
        '0记录': allUsers.length - Object.keys(recordCounts).length,
        '1-5记录': 0,
        '6-10记录': 0,
        '11-20记录': 0,
        '20+记录': 0
    };
    
    Object.values(recordCounts).forEach(count => {
        if (count <= 5) distribution['1-5记录']++;
        else if (count <= 10) distribution['6-10记录']++;
        else if (count <= 20) distribution['11-20记录']++;
        else distribution['20+记录']++;
    });
    
    let html = '';
    Object.entries(distribution).forEach(([label, count]) => {
        const percentage = allUsers.length > 0 ? Math.round(count / allUsers.length * 100) : 0;
        html += `
            <div style="margin: 10px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>${label}</span>
                    <span>${count}人 (${percentage}%)</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    });
    
    chartContainer.innerHTML = html;
}

// 更新用户分析
function updateUsersAnalysis() {
    updateAgeDistribution();
    updateLocationDistribution();
    updateInterestHeatmap();
    updateUsersTable();
}

// 更新年龄分布
function updateAgeDistribution() {
    const container = document.getElementById('ageDistribution');
    const ageGroups = {
        '18-25': 0,
        '26-35': 0,
        '36-50': 0,
        '50+': 0
    };
    
    allUsers.forEach(user => {
        if (user.age <= 25) ageGroups['18-25']++;
        else if (user.age <= 35) ageGroups['26-35']++;
        else if (user.age <= 50) ageGroups['36-50']++;
        else ageGroups['50+']++;
    });
    
    let html = '';
    Object.entries(ageGroups).forEach(([group, count]) => {
        const percentage = allUsers.length > 0 ? Math.round(count / allUsers.length * 100) : 0;
        html += `
            <div style="margin: 10px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>${group}岁</span>
                    <span>${count}人 (${percentage}%)</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 更新居住地分布
function updateLocationDistribution() {
    const container = document.getElementById('locationDistribution');
    const locationCounts = {};
    
    allUsers.forEach(user => {
        locationCounts[user.location] = (locationCounts[user.location] || 0) + 1;
    });
    
    let html = '';
    Object.entries(locationCounts).forEach(([location, count]) => {
        const percentage = allUsers.length > 0 ? Math.round(count / allUsers.length * 100) : 0;
        html += `
            <div style="margin: 10px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>${location}</span>
                    <span>${count}人 (${percentage}%)</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 更新兴趣热度图
function updateInterestHeatmap() {
    const container = document.getElementById('interestHeatmap');
    const interestCounts = {};
    
    allUsers.forEach(user => {
        if (user.interests) {
            user.interests.forEach(interest => {
                interestCounts[interest] = (interestCounts[interest] || 0) + 1;
            });
        }
    });
    
    let html = '';
    Object.entries(interestCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([interest, count]) => {
            const percentage = allUsers.length > 0 ? Math.round(count / allUsers.length * 100) : 0;
            html += `
                <div style="margin: 10px 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>${interest}</span>
                        <span>${count}人 (${percentage}%)</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        });
    
    container.innerHTML = html;
}

// 更新用户表格
function updateUsersTable() {
    const tbody = document.querySelector('#usersTable tbody');
    
    let html = '';
    allUsers.forEach(user => {
        const userRecords = allRecords.filter(r => r.userId === user.id);
        const lastActivity = userRecords.length > 0 ? 
            new Date(Math.max(...userRecords.map(r => new Date(r.timestamp)))).toLocaleDateString('zh-CN') : 
            '无记录';
        
        html += `
            <tr>
                <td>${user.id}</td>
                <td>${user.age}岁</td>
                <td>${user.gender || '未知'}</td>
                <td>${user.location}</td>
                <td>${user.greenLevel || '未知'}</td>
                <td>${userRecords.length}</td>
                <td>${lastActivity}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// 更新记录分析
function updateRecordsAnalysis() {
    updateRecordTypeChart();
    updateTaskCompletionChart();
    updateSensoryUsageChart();
    updateRecordsTable();
}

// 更新记录类型图表
function updateRecordTypeChart() {
    const container = document.getElementById('recordTypeChart');
    
    const typeCounts = {
        '仅文字': 0,
        '文字+图片': 0,
        '文字+录音': 0,
        '完整记录': 0,
        '其他': 0
    };
    
    allRecords.forEach(record => {
        const hasText = record.textRecord && record.textRecord.trim();
        const hasImages = record.images && record.images.length > 0;
        const hasAudio = record.audioData;
        
        if (hasText && hasImages && hasAudio) {
            typeCounts['完整记录']++;
        } else if (hasText && hasImages) {
            typeCounts['文字+图片']++;
        } else if (hasText && hasAudio) {
            typeCounts['文字+录音']++;
        } else if (hasText) {
            typeCounts['仅文字']++;
        } else {
            typeCounts['其他']++;
        }
    });
    
    let html = '';
    Object.entries(typeCounts).forEach(([type, count]) => {
        const percentage = allRecords.length > 0 ? Math.round(count / allRecords.length * 100) : 0;
        html += `
            <div style="margin: 10px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>${type}</span>
                    <span>${count}条 (${percentage}%)</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 更新任务完成图表
function updateTaskCompletionChart() {
    const container = document.getElementById('taskCompletionChart');
    const taskCounts = {};
    
    allRecords.forEach(record => {
        const taskTitle = record.task?.title || '未知任务';
        taskCounts[taskTitle] = (taskCounts[taskTitle] || 0) + 1;
    });
    
    let html = '';
    Object.entries(taskCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([task, count]) => {
            const percentage = allRecords.length > 0 ? Math.round(count / allRecords.length * 100) : 0;
            html += `
                <div style="margin: 10px 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>${task}</span>
                        <span>${count}次 (${percentage}%)</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        });
    
    container.innerHTML = html;
}

// 更新感官使用图表
function updateSensoryUsageChart() {
    const container = document.getElementById('sensoryUsageChart');
    
    const sensoryCounts = {
        '视觉': 0,
        '听觉': 0,
        '触觉': 0,
        '嗅觉': 0
    };
    
    allRecords.forEach(record => {
        if (record.sensoryExperience) {
            if (record.sensoryExperience.visual) sensoryCounts['视觉']++;
            if (record.sensoryExperience.auditory) sensoryCounts['听觉']++;
            if (record.sensoryExperience.tactile) sensoryCounts['触觉']++;
            if (record.sensoryExperience.olfactory) sensoryCounts['嗅觉']++;
        }
    });
    
    let html = '';
    Object.entries(sensoryCounts).forEach(([sense, count]) => {
        const percentage = allRecords.length > 0 ? Math.round(count / allRecords.length * 100) : 0;
        html += `
            <div style="margin: 10px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>${sense}记录</span>
                    <span>${count}次 (${percentage}%)</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 更新记录表格
function updateRecordsTable() {
    const tbody = document.querySelector('#recordsTable tbody');
    
    let html = '';
    allRecords.slice(0, 50).forEach(record => { // 只显示前50条记录
        const user = allUsers.find(u => u.id === record.userId);
        const userName = user ? `${user.age}岁${user.gender || ''}` : record.userId;
        
        html += `
            <tr>
                <td>${record.id}</td>
                <td>${userName}</td>
                <td>${record.task?.title || '未知'}</td>
                <td>${new Date(record.timestamp).toLocaleDateString('zh-CN')}</td>
                <td>${record.textRecord ? '✓' : '✗'}</td>
                <td>${record.images?.length || 0}</td>
                <td>${record.audioData ? '✓' : '✗'}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// 更新趋势分析
function updateTrendsAnalysis() {
    updateUserGrowthTrend();
    updateRecordActivityTrend();
    updateFeatureUsageTrend();
}

// 更新用户增长趋势
function updateUserGrowthTrend() {
    const container = document.getElementById('userGrowthTrend');
    container.innerHTML = '<p>用户增长趋势图（需要更多历史数据）</p>';
}

// 更新记录活跃度趋势
function updateRecordActivityTrend() {
    const container = document.getElementById('recordActivityTrend');
    container.innerHTML = '<p>记录活跃度趋势图（需要更多历史数据）</p>';
}

// 更新功能使用趋势
function updateFeatureUsageTrend() {
    const container = document.getElementById('featureUsageTrend');
    container.innerHTML = '<p>功能使用趋势图（需要更多历史数据）</p>';
}

// 应用用户筛选
function applyUserFilters() {
    // 这里可以实现筛选逻辑
    console.log('应用筛选条件');
}

// 导出数据
function exportData() {
    const exportUsers = document.getElementById('exportUsers').checked;
    const exportRecords = document.getElementById('exportRecords').checked;
    const exportStats = document.getElementById('exportStats').checked;
    
    const data = {};
    
    if (exportUsers) data.users = allUsers;
    if (exportRecords) data.records = allRecords;
    if (exportStats) data.stats = calculateOverallStats();
    
    // 创建下载链接
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `感知之门数据导出_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}