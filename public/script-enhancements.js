// 感知之门 - 功能增强模块

// ==================== 个人资料管理 ====================

// 显示个人资料编辑界面
function showProfileEdit() {
    const profileContent = document.querySelector('#recordsView .records-content');
    
    // 获取当前用户资料
    const profile = userData || {};
    
    profileContent.innerHTML = `
        <div class="profile-edit-section">
            <h3>📝 编辑个人信息</h3>
            
            <div class="profile-field">
                <label>用户名</label>
                <div class="value">${currentUser.username}</div>
            </div>
            
            <div class="profile-field">
                <label>邮箱</label>
                <input type="email" id="editEmail" value="${currentUser.email || ''}" placeholder="请输入邮箱">
            </div>
            
            <div class="profile-field">
                <label>手机号</label>
                <input type="tel" id="editPhone" value="${currentUser.phone || ''}" placeholder="请输入手机号" pattern="[0-9]{11}">
            </div>
            
            <div class="profile-field">
                <label>年龄</label>
                <input type="number" id="editAge" value="${profile.age || ''}" min="1" max="120">
            </div>
            
            <div class="profile-field">
                <label>性别</label>
                <select id="editGender">
                    <option value="">请选择</option>
                    <option value="男" ${profile.gender === '男' ? 'selected' : ''}>男</option>
                    <option value="女" ${profile.gender === '女' ? 'selected' : ''}>女</option>
                    <option value="其他" ${profile.gender === '其他' ? 'selected' : ''}>其他</option>
                </select>
            </div>
            
            <div class="profile-field">
                <label>居住地类型</label>
                <select id="editLocation">
                    <option value="">请选择</option>
                    <option value="大城市中心" ${profile.location === '大城市中心' ? 'selected' : ''}>大城市中心</option>
                    <option value="城市郊区" ${profile.location === '城市郊区' ? 'selected' : ''}>城市郊区</option>
                    <option value="小城镇" ${profile.location === '小城镇' ? 'selected' : ''}>小城镇</option>
                    <option value="乡村" ${profile.location === '乡村' ? 'selected' : ''}>乡村</option>
                    <option value="山区" ${profile.location === '山区' ? 'selected' : ''}>山区</option>
                </select>
            </div>
            
            <div class="edit-actions">
                <button class="submit-btn" onclick="saveProfileChanges()">保存修改</button>
                <button class="back-btn" onclick="showProfileView()">取消</button>
            </div>
        </div>
        
        <div class="profile-edit-section" style="margin-top: 20px;">
            <h3>🔒 修改密码</h3>
            
            <div class="profile-field">
                <label>当前密码</label>
                <input type="password" id="currentPassword" placeholder="请输入当前密码">
            </div>
            
            <div class="profile-field">
                <label>新密码</label>
                <input type="password" id="newPassword" placeholder="至少6个字符" minlength="6">
            </div>
            
            <div class="profile-field">
                <label>确认新密码</label>
                <input type="password" id="confirmNewPassword" placeholder="再次输入新密码">
            </div>
            
            <div class="edit-actions">
                <button class="submit-btn" onclick="changePassword()">修改密码</button>
            </div>
        </div>
    `;
}

// 保存个人资料修改
window.saveProfileChanges = async function() {
    const updatedProfile = {
        userId: currentUser.id,
        email: document.getElementById('editEmail').value,
        phone: document.getElementById('editPhone').value,
        age: parseInt(document.getElementById('editAge').value),
        gender: document.getElementById('editGender').value,
        location: document.getElementById('editLocation').value
    };
    
    // 验证邮箱或手机号至少填一个
    if (!updatedProfile.email && !updatedProfile.phone) {
        alert('请至少填写邮箱或手机号其中一项');
        return;
    }
    
    try {
        // 更新用户基本信息
        currentUser.email = updatedProfile.email;
        currentUser.phone = updatedProfile.phone;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // 更新用户资料
        const response = await fetch('/api/users/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProfile)
        });
        
        const data = await response.json();
        if (data.success) {
            userData = updatedProfile;
            localStorage.setItem(`userProfile_${currentUser.id}`, JSON.stringify(userData));
            alert('个人信息修改成功！');
            showProfileView();
        } else {
            alert('修改失败：' + (data.error || '未知错误'));
        }
    } catch (error) {
        console.error('保存失败:', error);
        alert('保存失败，请检查网络连接');
    }
};

// 修改密码
window.changePassword = async function() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        alert('请填写所有密码字段');
        return;
    }
    
    if (currentPassword !== currentUser.password) {
        alert('当前密码不正确');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('新密码至少需要6个字符');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        alert('两次输入的新密码不一致');
        return;
    }
    
    // 更新密码
    currentUser.password = newPassword;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // TODO: 调用API更新数据库中的密码
    
    alert('密码修改成功！');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
};

// 显示个人资料查看界面
function showProfileView() {
    const profileContent = document.querySelector('#recordsView .records-content');
    const profile = userData || {};
    
    profileContent.innerHTML = `
        <div class="profile-edit-section">
            <h3>👤 个人信息</h3>
            
            <div class="profile-field">
                <label>用户名</label>
                <div class="value">${currentUser.username}</div>
            </div>
            
            <div class="profile-field">
                <label>邮箱</label>
                <div class="value">${currentUser.email || '未填写'}</div>
            </div>
            
            <div class="profile-field">
                <label>手机号</label>
                <div class="value">${currentUser.phone || '未填写'}</div>
            </div>
            
            <div class="profile-field">
                <label>年龄</label>
                <div class="value">${profile.age || '未填写'}${profile.age ? '岁' : ''}</div>
            </div>
            
            <div class="profile-field">
                <label>性别</label>
                <div class="value">${profile.gender || '未填写'}</div>
            </div>
            
            <div class="profile-field">
                <label>居住地类型</label>
                <div class="value">${profile.location || '未填写'}</div>
            </div>
            
            <div class="edit-actions">
                <button class="submit-btn" onclick="showProfileEdit()">编辑信息</button>
            </div>
        </div>
    `;
}

// ==================== 自然连接感数据收集 ====================

// 在保存记录时收集自然连接感评分
function getNatureConnectionScore() {
    const selected = document.querySelector('input[name="natureConnection"]:checked');
    return selected ? parseInt(selected.value) : null;
}

// ==================== 个性化推荐机制 ====================

// 根据用户资料和历史记录推荐任务
function getPersonalizedTasks() {
    const allTasks = [
        {
            title: '身边的绿色',
            description: '寻找并记录你周围的绿色植物',
            icon: '🌿',
            category: 'visual',
            difficulty: 'easy'
        },
        {
            title: '声音收集',
            description: '聆听并记录自然的声音',
            icon: '🎵',
            category: 'auditory',
            difficulty: 'easy'
        },
        {
            title: '触感体验',
            description: '触摸不同的自然材质，感受它们的质地',
            icon: '✋',
            category: 'tactile',
            difficulty: 'medium'
        },
        {
            title: '天空观察',
            description: '观察天空的变化，云朵的形状',
            icon: '☁️',
            category: 'visual',
            difficulty: 'easy'
        },
        {
            title: '气味探索',
            description: '闻一闻周围的自然气味',
            icon: '👃',
            category: 'olfactory',
            difficulty: 'medium'
        },
        {
            title: '水的观察',
            description: '观察水的流动、倒影、波纹',
            icon: '💧',
            category: 'visual',
            difficulty: 'medium'
        },
        {
            title: '昆虫观察',
            description: '寻找并观察昆虫的活动',
            icon: '🐛',
            category: 'visual',
            difficulty: 'hard'
        },
        {
            title: '树木拥抱',
            description: '拥抱一棵树，感受它的能量',
            icon: '🌳',
            category: 'tactile',
            difficulty: 'medium'
        },
        {
            title: '光影游戏',
            description: '观察光线在自然中的变化',
            icon: '☀️',
            category: 'visual',
            difficulty: 'medium'
        },
        {
            title: '赤足行走',
            description: '脱掉鞋子，感受大地的触感',
            icon: '👣',
            category: 'tactile',
            difficulty: 'hard'
        }
    ];
    
    // 根据用户资料进行推荐
    let recommendedTasks = [...allTasks];
    
    if (userData) {
        // 根据绿色含量调整任务
        if (userData.greenLevel === '很少绿色' || userData.greenLevel === '少量绿色') {
            // 城市环境，推荐简单的观察任务
            recommendedTasks = recommendedTasks.filter(t => 
                t.difficulty === 'easy' || t.category === 'visual'
            );
        }
        
        // 根据兴趣标签推荐
        if (userData.interests && userData.interests.includes('观鸟')) {
            recommendedTasks.unshift({
                title: '鸟类观察',
                description: '观察并记录你看到的鸟类',
                icon: '🐦',
                category: 'visual',
                difficulty: 'medium'
            });
        }
        
        if (userData.interests && userData.interests.includes('植物识别')) {
            recommendedTasks.unshift({
                title: '植物识别',
                description: '识别并记录周围的植物种类',
                icon: '🌺',
                category: 'visual',
                difficulty: 'medium'
            });
        }
    }
    
    // 随机选择6个任务
    return recommendedTasks.sort(() => Math.random() - 0.5).slice(0, 6);
}

// 导出函数供主脚本使用
window.showProfileEdit = showProfileEdit;
window.showProfileView = showProfileView;
window.getNatureConnectionScore = getNatureConnectionScore;
window.getPersonalizedTasks = getPersonalizedTasks;
