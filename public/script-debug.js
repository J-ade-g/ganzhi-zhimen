// 调试信息显示函数
function showDebugInfo(message) {
    const debugDiv = document.getElementById('debugInfo');
    if (debugDiv) {
        const time = new Date().toLocaleTimeString();
        debugDiv.innerHTML += '<br>' + time + ': ' + message;
        console.log(time + ': ' + message);
    }
}

// 页面加载时的调试信息
document.addEventListener('DOMContentLoaded', function() {
    showDebugInfo('页面DOM加载完成');
    showDebugInfo('JavaScript调试文件已加载');
    
    // 检查关键元素是否存在
    const loginTab = document.querySelector('[data-tab="login"]');
    const registerTab = document.querySelector('[data-tab="register"]');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    showDebugInfo('登录标签: ' + (loginTab ? '存在' : '不存在'));
    showDebugInfo('注册标签: ' + (registerTab ? '存在' : '不存在'));
    showDebugInfo('登录表单: ' + (loginForm ? '存在' : '不存在'));
    showDebugInfo('注册表单: ' + (registerForm ? '存在' : '不存在'));
    
    // 为按钮添加直接的点击事件监听器
    if (loginTab) {
        loginTab.addEventListener('click', function(e) {
            showDebugInfo('登录按钮被点击了！');
            e.preventDefault();
            switchTab('login');
        });
    }
    
    if (registerTab) {
        registerTab.addEventListener('click', function(e) {
            showDebugInfo('注册按钮被点击了！');
            e.preventDefault();
            switchTab('register');
        });
    }
    
    // 测试按钮点击检测
    document.addEventListener('click', function(e) {
        showDebugInfo('检测到点击事件，目标: ' + e.target.tagName + ' ' + (e.target.className || ''));
    });
});

// 简化的标签切换函数
function switchTab(tab) {
    showDebugInfo('开始切换到标签: ' + tab);
    
    try {
        // 移除所有标签的active类
        const allTabs = document.querySelectorAll('.auth-tab');
        allTabs.forEach(t => {
            t.classList.remove('active');
            t.style.backgroundColor = ''; // 重置背景色
            showDebugInfo('移除标签active类: ' + t.textContent);
        });
        
        // 隐藏所有表单
        const allForms = document.querySelectorAll('.auth-form');
        allForms.forEach(f => {
            f.style.display = 'none';
            showDebugInfo('隐藏表单: ' + f.id);
        });
        
        // 激活目标标签
        const targetTab = document.querySelector(`[data-tab="${tab}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
            targetTab.style.backgroundColor = '#52b788'; // 添加明显的背景色
            targetTab.style.color = 'white'; // 白色文字
            showDebugInfo('激活目标标签成功，添加了绿色背景');
        } else {
            showDebugInfo('未找到目标标签: ' + tab);
        }
        
        // 显示目标表单
        const targetForm = document.getElementById(tab + 'Form');
        if (targetForm) {
            targetForm.style.display = 'block';
            targetForm.style.border = '3px solid #52b788'; // 添加明显的边框
            targetForm.style.backgroundColor = '#f0fff0'; // 浅绿色背景
            showDebugInfo('显示目标表单成功: ' + targetForm.id + '，添加了绿色边框和背景');
        } else {
            showDebugInfo('未找到目标表单: ' + tab + 'Form');
        }
        
        // 更新标题
        const title = document.getElementById('authTitle');
        if (title) {
            title.textContent = tab === 'login' ? '用户登录' : '用户注册';
            title.style.color = '#52b788'; // 绿色标题
            showDebugInfo('更新标题成功: ' + title.textContent + '，标题变为绿色');
        }
        
        // 添加成功提示
        alert('标签切换成功！当前显示: ' + (tab === 'login' ? '登录' : '注册') + '表单');
        
        showDebugInfo('标签切换完成');
        
    } catch (error) {
        showDebugInfo('切换标签时发生错误: ' + error.message);
        alert('切换失败: ' + error.message);
    }
}

// 全局函数，供HTML onclick调用
window.testClick = function(tab) {
    showDebugInfo('testClick函数被调用，参数: ' + tab);
    switchTab(tab);
};

// 表单提交处理
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showDebugInfo('登录表单提交');
            alert('登录功能暂时禁用，这是调试模式');
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showDebugInfo('注册表单提交');
            alert('注册功能暂时禁用，这是调试模式');
        });
    }
});