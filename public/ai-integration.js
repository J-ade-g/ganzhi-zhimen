// AI功能集成脚本

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    
    // 监听保存记录按钮，添加AI分析
    const saveRecordBtn = document.getElementById('saveRecord');
    if (saveRecordBtn) {
        // 保存原始的点击事件
        const originalOnClick = saveRecordBtn.onclick;
        
        // 重写点击事件
        saveRecordBtn.onclick = async function() {
            // 先执行原始保存逻辑
            if (originalOnClick) {
                originalOnClick.call(this);
            }
            
            // 等待一小段时间确保记录已保存
            setTimeout(async () => {
                // 获取刚保存的记录数据
                const recordData = {
                    task: window.currentTask,
                    textRecord: document.getElementById('textRecord')?.value,
                    sensoryExperience: {
                        visual: document.getElementById('visual')?.value,
                        auditory: document.getElementById('auditory')?.value,
                        tactile: document.getElementById('tactile')?.value,
                        olfactory: document.getElementById('olfactory')?.value
                    },
                    natureConnection: getNatureConnectionScore()
                };
                
                // 如果有文字记录，进行AI分析
                if (recordData.textRecord && recordData.textRecord.trim()) {
                    await showRecordAnalysis(recordData);
                }
            }, 500);
        };
    }
});

// 显示记录分析结果
async function showRecordAnalysis(recordData) {
    // 显示加载提示
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'aiAnalysisLoading';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 2000;
        text-align: center;
    `;
    loadingDiv.innerHTML = `
        <div style="font-size: 40px; margin-bottom: 15px;">🤖</div>
        <div style="font-size: 16px; color: #333;">AI正在分析你的感知体验...</div>
        <div style="margin-top: 15px; color: #666; font-size: 14px;">这可能需要几秒钟</div>
    `;
    document.body.appendChild(loadingDiv);
    
    try {
        // 调用AI分析
        const analysis = await analyzeRecord(recordData);
        
        // 移除加载提示
        loadingDiv.remove();
        
        if (analysis) {
            // 显示分析结果
            showAnalysisModal(analysis);
        }
    } catch (error) {
        console.error('AI分析失败:', error);
        loadingDiv.remove();
        
        // 显示错误提示（可选）
        // alert('AI分析暂时不可用，但你的记录已成功保存！');
    }
}

// 显示分析结果模态框
function showAnalysisModal(analysis) {
    const modal = document.createElement('div');
    modal.id = 'aiAnalysisModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            padding: 30px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        ">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 48px; margin-bottom: 10px;">✨</div>
                <h2 style="margin: 0; color: #333; font-size: 24px;">AI分析反馈</h2>
            </div>
            
            <div style="background: #f0f9f4; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <div style="font-size: 16px; color: #333; line-height: 1.6;">
                    ${analysis.encouragement || '很棒的感知体验！'}
                </div>
            </div>
            
            <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                <div style="flex: 1; background: #e8f5e9; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 14px; color: #666; margin-bottom: 5px;">感知深度</div>
                    <div style="font-size: 32px; color: #52b788; font-weight: bold;">
                        ${analysis.depthScore || 0}/5
                    </div>
                </div>
                <div style="flex: 1; background: #fff3e0; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 14px; color: #666; margin-bottom: 5px;">自然连接感</div>
                    <div style="font-size: 32px; color: #ff9800; font-weight: bold;">
                        ${analysis.connectionScore || 0}/5
                    </div>
                </div>
            </div>
            
            ${analysis.suggestion ? `
                <div style="background: #fff8e1; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="font-size: 14px; color: #666; margin-bottom: 5px;">💡 改进建议</div>
                    <div style="font-size: 15px; color: #333;">
                        ${analysis.suggestion}
                    </div>
                </div>
            ` : ''}
            
            <button onclick="closeAnalysisModal()" style="
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, #52b788, #40916c);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                transition: transform 0.2s;
            " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                知道了
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 点击背景关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeAnalysisModal();
        }
    });
}

// 关闭分析模态框
window.closeAnalysisModal = function() {
    const modal = document.getElementById('aiAnalysisModal');
    if (modal) {
        modal.remove();
    }
};
