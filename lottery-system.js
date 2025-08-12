// 抽奖系统模块

// 抽奖配置
const lotteryConfig = {
    dailyFreeSpins: 3,           // 每日免费次数
    pointsPerSpin: 100,          // 每次抽奖消耗积分
    vipBonusSpins: 2,           // VIP用户额外次数
    membershipMultiplier: {     // 会员倍率
        bronze: 1,
        silver: 1.2,
        gold: 1.5,
        platinum: 2.0
    }
};

// 奖品配置
const lotteryPrizes = [
    { id: 1, name: "100积分", value: 100, type: "points", probability: 30, color: "#FEF3C7", icon: "💰" },
    { id: 2, name: "50积分", value: 50, type: "points", probability: 25, color: "#DBEAFE", icon: "💎" },
    { id: 3, name: "VIP体验卡", value: 7, type: "vip_trial", probability: 15, color: "#F3E8FF", icon: "👑" },
    { id: 4, name: "200积分", value: 200, type: "points", probability: 10, color: "#ECFDF5", icon: "🎁" },
    { id: 5, name: "500积分", value: 500, type: "points", probability: 8, color: "#FEF2F2", icon: "💸" },
    { id: 6, name: "抽奖券x3", value: 3, type: "lottery_tickets", probability: 7, color: "#F0F9FF", icon: "🎫" },
    { id: 7, name: "1000积分", value: 1000, type: "points", probability: 3, color: "#FFFBEB", icon: "🏆" },
    { id: 8, name: "谢谢参与", value: 0, type: "empty", probability: 2, color: "#F9FAFB", icon: "😊" }
];

// 抽奖状态
let lotteryState = {
    isSpinning: false,
    dailySpins: 0,
    totalSpins: 0,
    lastSpinDate: null,
    inventory: JSON.parse(localStorage.getItem('lottery_inventory') || '{}')
};

// 显示抽奖系统
function showLotterySystem() {
    loadLotteryState();
    const lotteryContent = createLotteryView();
    
    const modal = document.createElement('div');
    modal.className = 'lottery-modal';
    modal.innerHTML = lotteryContent;
    document.body.appendChild(modal);
    
    // 初始化转盘
    initLotteryWheel();
    updateLotteryUI();
}

// 创建抽奖视图
function createLotteryView() {
    const userSpins = getUserDailySpins();
    const canSpin = userSpins.remaining > 0 || (currentUser?.points || 0) >= lotteryConfig.pointsPerSpin;
    
    return `
        <div class="lottery-container">
            <div class="lottery-header">
                <h2>🎰 幸运抽奖</h2>
                <button class="close-btn" onclick="closeLotteryModal()">✕</button>
            </div>
            
            <div class="lottery-content">
                <!-- 用户信息区域 -->
                <div class="lottery-user-info">
                    <div class="user-stats">
                        <div class="stat-item">
                            <span class="stat-label">当前积分</span>
                            <span class="stat-value">${currentUser?.points || 0}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">今日剩余</span>
                            <span class="stat-value" id="remainingSpins">${userSpins.remaining}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">总抽奖次数</span>
                            <span class="stat-value">${lotteryState.totalSpins}</span>
                        </div>
                    </div>
                </div>
                
                <!-- 转盘区域 -->
                <div class="lottery-wheel-container">
                    <div class="wheel-wrapper">
                        <canvas id="lotteryWheel" width="300" height="300"></canvas>
                        <div class="wheel-pointer">📍</div>
                    </div>
                    
                    <div class="lottery-controls">
                        <button 
                            id="spinButton" 
                            class="spin-btn ${canSpin ? '' : 'disabled'}"
                            onclick="startLottery()"
                            ${!canSpin ? 'disabled' : ''}
                        >
                            ${userSpins.remaining > 0 ? '免费抽奖' : `消耗${lotteryConfig.pointsPerSpin}积分抽奖`}
                        </button>
                        
                        <div class="spin-cost">
                            ${userSpins.remaining > 0 ? 
                                `免费次数剩余: ${userSpins.remaining}` : 
                                `需要积分: ${lotteryConfig.pointsPerSpin}`
                            }
                        </div>
                    </div>
                </div>
                
                <!-- 奖品展示 -->
                <div class="lottery-prizes">
                    <h3>🎁 奖品一览</h3>
                    <div class="prizes-grid">
                        ${lotteryPrizes.map(prize => `
                            <div class="prize-item" style="background-color: ${prize.color}">
                                <div class="prize-icon">${prize.icon}</div>
                                <div class="prize-name">${prize.name}</div>
                                <div class="prize-rate">${prize.probability}%</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- 我的奖品 -->
                <div class="lottery-inventory">
                    <h3>📦 我的奖品</h3>
                    <div class="inventory-content">
                        ${createInventoryView()}
                    </div>
                </div>
                
                <!-- 抽奖记录 -->
                <div class="lottery-history">
                    <h3>📋 抽奖记录</h3>
                    <div class="history-content">
                        ${createLotteryHistory()}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 初始化转盘
function initLotteryWheel() {
    const canvas = document.getElementById('lotteryWheel');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 140;
    
    // 绘制转盘
    drawLotteryWheel(ctx, centerX, centerY, radius);
}

// 绘制转盘
function drawLotteryWheel(ctx, centerX, centerY, radius) {
    const totalPrizes = lotteryPrizes.length;
    const anglePerPrize = (2 * Math.PI) / totalPrizes;
    
    // 清空画布
    ctx.clearRect(0, 0, 300, 300);
    
    // 绘制每个扇形
    lotteryPrizes.forEach((prize, index) => {
        const startAngle = index * anglePerPrize - Math.PI / 2;
        const endAngle = (index + 1) * anglePerPrize - Math.PI / 2;
        
        // 绘制扇形背景
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = prize.color;
        ctx.fill();
        
        // 绘制边框
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制文字
        const textAngle = startAngle + anglePerPrize / 2;
        const textX = centerX + Math.cos(textAngle) * (radius * 0.7);
        const textY = centerY + Math.sin(textAngle) * (radius * 0.7);
        
        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(textAngle + Math.PI / 2);
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(prize.icon, 0, -10);
        
        ctx.font = '10px Arial';
        ctx.fillText(prize.name, 0, 5);
        ctx.restore();
    });
    
    // 绘制中心圆
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎰', centerX, centerY + 5);
}

// 开始抽奖
async function startLottery() {
    if (lotteryState.isSpinning) return;
    
    const userSpins = getUserDailySpins();
    const needPoints = userSpins.remaining <= 0;
    
    // 检查是否可以抽奖
    if (needPoints && (currentUser?.points || 0) < lotteryConfig.pointsPerSpin) {
        showMessage('积分不足，无法抽奖！', 'error');
        return;
    }
    
    // 消耗积分或免费次数
    if (needPoints) {
        currentUser.points -= lotteryConfig.pointsPerSpin;
        localStorage.setItem('user_profile', JSON.stringify(currentUser));
        updateUserInterface();
    } else {
        lotteryState.dailySpins++;
    }
    
    lotteryState.isSpinning = true;
    
    // 更新UI状态
    const spinButton = document.getElementById('spinButton');
    spinButton.disabled = true;
    spinButton.textContent = '抽奖中...';
    
    try {
        // 执行抽奖逻辑
        const result = await performLottery();
        
        // 转盘动画
        await spinWheel(result);
        
        // 处理奖品
        await handleLotteryResult(result);
        
    } catch (error) {
        console.error('抽奖失败:', error);
        showMessage('抽奖失败，请稍后重试', 'error');
    } finally {
        lotteryState.isSpinning = false;
        updateLotteryUI();
    }
}

// 执行抽奖逻辑
async function performLottery() {
    // 根据概率计算中奖结果
    const random = Math.random() * 100;
    let cumulativeProbability = 0;
    
    for (const prize of lotteryPrizes) {
        cumulativeProbability += prize.probability;
        if (random <= cumulativeProbability) {
            // 记录抽奖结果
            const lotteryRecord = {
                id: Date.now(),
                prize_id: prize.id,
                prize_name: prize.name,
                prize_value: prize.value,
                prize_type: prize.type,
                created_at: new Date().toISOString(),
                user_id: currentUser?.sub || 'anonymous'
            };
            
            // 保存到本地存储
            const lotteryHistory = JSON.parse(localStorage.getItem('lottery_history') || '[]');
            lotteryHistory.unshift(lotteryRecord);
            localStorage.setItem('lottery_history', JSON.stringify(lotteryHistory.slice(0, 50))); // 保留最近50条
            
            // 更新统计
            lotteryState.totalSpins++;
            saveLotteryState();
            
            // 发送到后端
            await recordLotteryResult(lotteryRecord);
            
            return prize;
        }
    }
    
    // 默认返回第一个奖品（不应该到达这里）
    return lotteryPrizes[0];
}

// 转盘旋转动画
function spinWheel(targetPrize) {
    return new Promise((resolve) => {
        const canvas = document.getElementById('lotteryWheel');
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 140;
        
        // 计算目标角度
        const prizeIndex = lotteryPrizes.findIndex(p => p.id === targetPrize.id);
        const anglePerPrize = (2 * Math.PI) / lotteryPrizes.length;
        const targetAngle = (prizeIndex * anglePerPrize) + (anglePerPrize / 2);
        
        // 动画参数
        let currentAngle = 0;
        const totalRotations = 5; // 转5圈
        const finalAngle = totalRotations * 2 * Math.PI + (2 * Math.PI - targetAngle);
        const duration = 3000; // 3秒
        const startTime = Date.now();
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用缓动函数
            const easeOut = 1 - Math.pow(1 - progress, 3);
            currentAngle = finalAngle * easeOut;
            
            // 重绘转盘
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(currentAngle);
            ctx.translate(-centerX, -centerY);
            
            drawLotteryWheel(ctx, centerX, centerY, radius);
            
            ctx.restore();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                resolve();
            }
        }
        
        animate();
    });
}

// 处理抽奖结果
async function handleLotteryResult(prize) {
    // 添加到库存
    if (prize.type !== 'empty') {
        addToInventory(prize);
    }
    
    // 立即发放积分类奖品
    if (prize.type === 'points') {
        const multiplier = getMembershipMultiplier();
        const finalValue = Math.floor(prize.value * multiplier);
        
        currentUser.points = (currentUser.points || 0) + finalValue;
        localStorage.setItem('user_profile', JSON.stringify(currentUser));
        updateUserInterface();
        
        showMessage(`🎉 恭喜获得 ${finalValue} 积分！${multiplier > 1 ? `(会员加成${multiplier}x)` : ''}`, 'success');
    } else if (prize.type === 'vip_trial') {
        showMessage(`🎉 恭喜获得 ${prize.name}！已添加到我的奖品中`, 'success');
    } else if (prize.type === 'lottery_tickets') {
        showMessage(`🎉 恭喜获得 ${prize.name}！已添加到我的奖品中`, 'success');
    } else if (prize.type === 'empty') {
        showMessage('😊 谢谢参与，再接再厉！', 'info');
    }
    
    // 显示详细结果
    setTimeout(() => {
        showLotteryResultModal(prize);
    }, 1000);
}

// 显示抽奖结果模态框
function showLotteryResultModal(prize) {
    const modal = document.createElement('div');
    modal.className = 'lottery-result-modal';
    modal.innerHTML = `
        <div class="result-container">
            <div class="result-header">
                <h2>🎉 抽奖结果</h2>
            </div>
            <div class="result-content">
                <div class="prize-display" style="background-color: ${prize.color}">
                    <div class="prize-icon-large">${prize.icon}</div>
                    <div class="prize-name-large">${prize.name}</div>
                    ${prize.type === 'points' ? `<div class="prize-value">+${prize.value}积分</div>` : ''}
                </div>
                <div class="result-actions">
                    <button onclick="closeResultModal()" class="claim-btn">确定</button>
                    <button onclick="closeResultModal(); startLottery()" class="again-btn">再抽一次</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// 关闭结果模态框
function closeResultModal() {
    const modal = document.querySelector('.lottery-result-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// 添加到库存
function addToInventory(prize) {
    const key = `${prize.type}_${prize.id}`;
    if (!lotteryState.inventory[key]) {
        lotteryState.inventory[key] = {
            prize: prize,
            count: 0,
            obtained_at: new Date().toISOString()
        };
    }
    lotteryState.inventory[key].count++;
    saveLotteryState();
}

// 获取用户每日抽奖次数
function getUserDailySpins() {
    const today = new Date().toDateString();
    const lastSpinDate = lotteryState.lastSpinDate;
    
    // 如果不是今天，重置每日次数
    if (lastSpinDate !== today) {
        lotteryState.dailySpins = 0;
        lotteryState.lastSpinDate = today;
        saveLotteryState();
    }
    
    let totalFreeSpins = lotteryConfig.dailyFreeSpins;
    
    // VIP用户额外次数
    if (currentUser?.is_vip) {
        totalFreeSpins += lotteryConfig.vipBonusSpins;
    }
    
    const remaining = Math.max(0, totalFreeSpins - lotteryState.dailySpins);
    
    return {
        used: lotteryState.dailySpins,
        remaining: remaining,
        total: totalFreeSpins
    };
}

// 获取会员加成倍率
function getMembershipMultiplier() {
    if (!currentUser?.membership_level) return 1;
    return lotteryConfig.membershipMultiplier[currentUser.membership_level] || 1;
}

// 创建库存视图
function createInventoryView() {
    const inventory = Object.values(lotteryState.inventory).filter(item => item.count > 0);
    
    if (inventory.length === 0) {
        return '<div class="empty-inventory">暂无奖品，快去抽奖吧！</div>';
    }
    
    return inventory.map(item => `
        <div class="inventory-item">
            <div class="item-icon">${item.prize.icon}</div>
            <div class="item-info">
                <div class="item-name">${item.prize.name}</div>
                <div class="item-count">x${item.count}</div>
            </div>
            ${item.prize.type !== 'points' ? 
                `<button class="use-btn" onclick="useInventoryItem('${item.prize.type}_${item.prize.id}')">使用</button>` :
                '<span class="auto-used">已自动使用</span>'
            }
        </div>
    `).join('');
}

// 创建抽奖历史
function createLotteryHistory() {
    const history = JSON.parse(localStorage.getItem('lottery_history') || '[]');
    
    if (history.length === 0) {
        return '<div class="empty-history">暂无抽奖记录</div>';
    }
    
    return history.slice(0, 10).map(record => `
        <div class="history-item">
            <div class="history-time">${new Date(record.created_at).toLocaleString()}</div>
            <div class="history-prize">${record.prize_name}</div>
            <div class="history-icon">${lotteryPrizes.find(p => p.id === record.prize_id)?.icon || '🎁'}</div>
        </div>
    `).join('');
}

// 使用库存物品
async function useInventoryItem(itemKey) {
    const item = lotteryState.inventory[itemKey];
    if (!item || item.count <= 0) return;
    
    const prize = item.prize;
    
    try {
        switch(prize.type) {
            case 'vip_trial':
                // 激活VIP体验
                currentUser.is_vip = true;
                currentUser.vip_expires_at = new Date(Date.now() + prize.value * 24 * 60 * 60 * 1000).toISOString();
                localStorage.setItem('user_profile', JSON.stringify(currentUser));
                showMessage(`🎉 VIP体验卡已激活，有效期${prize.value}天！`, 'success');
                break;
                
            case 'lottery_tickets':
                // 增加免费抽奖次数
                lotteryState.dailySpins = Math.max(0, lotteryState.dailySpins - prize.value);
                showMessage(`🎫 抽奖券已使用，增加${prize.value}次免费抽奖机会！`, 'success');
                break;
                
            default:
                showMessage('该物品暂时无法使用', 'info');
                return;
        }
        
        // 减少库存
        item.count--;
        if (item.count <= 0) {
            delete lotteryState.inventory[itemKey];
        }
        
        saveLotteryState();
        updateLotteryUI();
        updateUserInterface();
        
    } catch (error) {
        console.error('使用物品失败:', error);
        showMessage('使用失败，请稍后重试', 'error');
    }
}

// 更新抽奖UI
function updateLotteryUI() {
    const userSpins = getUserDailySpins();
    const canSpin = userSpins.remaining > 0 || (currentUser?.points || 0) >= lotteryConfig.pointsPerSpin;
    
    // 更新剩余次数
    const remainingElement = document.getElementById('remainingSpins');
    if (remainingElement) {
        remainingElement.textContent = userSpins.remaining;
    }
    
    // 更新抽奖按钮
    const spinButton = document.getElementById('spinButton');
    if (spinButton) {
        spinButton.disabled = !canSpin || lotteryState.isSpinning;
        spinButton.className = `spin-btn ${canSpin && !lotteryState.isSpinning ? '' : 'disabled'}`;
        
        if (lotteryState.isSpinning) {
            spinButton.textContent = '抽奖中...';
        } else {
            spinButton.textContent = userSpins.remaining > 0 ? '免费抽奖' : `消耗${lotteryConfig.pointsPerSpin}积分抽奖`;
        }
    }
    
    // 更新库存显示
    const inventoryContent = document.querySelector('.inventory-content');
    if (inventoryContent) {
        inventoryContent.innerHTML = createInventoryView();
    }
    
    // 更新历史记录
    const historyContent = document.querySelector('.history-content');
    if (historyContent) {
        historyContent.innerHTML = createLotteryHistory();
    }
}

// 记录抽奖结果到后端
async function recordLotteryResult(record) {
    try {
        if (!authToken) return;
        
        const response = await fetch(`${API_BASE}/lottery/record`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(record)
        });
        
        if (response.ok) {
            console.log('✅ 抽奖记录已同步到服务器');
        }
    } catch (error) {
        console.error('❌ 同步抽奖记录失败:', error);
    }
}

// 加载抽奖状态
function loadLotteryState() {
    const saved = localStorage.getItem('lottery_state');
    if (saved) {
        const savedState = JSON.parse(saved);
        lotteryState = { ...lotteryState, ...savedState };
    }
}

// 保存抽奖状态
function saveLotteryState() {
    localStorage.setItem('lottery_state', JSON.stringify(lotteryState));
    localStorage.setItem('lottery_inventory', JSON.stringify(lotteryState.inventory));
}

// 关闭抽奖模态框
function closeLotteryModal() {
    const modal = document.querySelector('.lottery-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// 导出功能供外部使用
window.showLotterySystem = showLotterySystem;
window.closeLotteryModal = closeLotteryModal;
window.startLottery = startLottery;
window.useInventoryItem = useInventoryItem;
window.closeResultModal = closeResultModal;
