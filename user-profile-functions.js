// ===================== 用户个人中心完整功能 =====================

// 显示编辑资料模态框
function showEditProfileModal() {
    const user = currentUser || {};
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content profile-edit-modal">
            <div class="modal-header">
                <h3>✏️ 编辑个人资料</h3>
                <button class="close-btn" onclick="hideEditProfileModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="profile-edit-form">
                    <div class="avatar-section">
                        <div class="avatar-container">
                            <img src="${user.picture || 'https://via.placeholder.com/80x80?text=👤'}" 
                                 alt="头像" class="profile-avatar" id="profileAvatar">
                            <div class="avatar-overlay" onclick="changeAvatar()">
                                <span>📷 更换</span>
                            </div>
                        </div>
                        <input type="file" id="avatarInput" accept="image/*" style="display: none;" onchange="handleAvatarChange(event)">
                    </div>
                    
                    <div class="form-group">
                        <label>👤 用户名</label>
                        <input type="text" id="editUsername" value="${user.name || ''}" placeholder="请输入用户名">
                    </div>
                    
                    <div class="form-group">
                        <label>📧 邮箱</label>
                        <input type="email" id="editEmail" value="${user.email || ''}" placeholder="请输入邮箱" readonly>
                        <small class="form-help">邮箱不能修改</small>
                    </div>
                    
                    <div class="form-group">
                        <label>📱 手机号</label>
                        <input type="tel" id="editPhone" value="${user.phone || ''}" placeholder="请输入手机号">
                    </div>
                    
                    <div class="form-group">
                        <label>🎂 生日</label>
                        <input type="date" id="editBirthday" value="${user.birthday || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label>👫 性别</label>
                        <select id="editGender">
                            <option value="">请选择</option>
                            <option value="male" ${user.gender === 'male' ? 'selected' : ''}>👨 男</option>
                            <option value="female" ${user.gender === 'female' ? 'selected' : ''}>👩 女</option>
                            <option value="other" ${user.gender === 'other' ? 'selected' : ''}>🤝 其他</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>📝 个人简介</label>
                        <textarea id="editBio" placeholder="介绍一下自己..." rows="3">${user.bio || ''}</textarea>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="hideEditProfileModal()">取消</button>
                <button class="btn btn-primary" onclick="saveProfile()">💾 保存</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.onclick = (e) => e.target === modal && hideEditProfileModal();
}

// 隐藏编辑资料模态框
function hideEditProfileModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// 更换头像
function changeAvatar() {
    document.getElementById('avatarInput').click();
}

// 处理头像更换
function handleAvatarChange(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) { // 2MB限制
            showMessage('头像文件大小不能超过2MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profileAvatar').src = e.target.result;
            showMessage('头像已选择，请记得保存', 'info');
        };
        reader.readAsDataURL(file);
    }
}

// 保存个人资料
async function saveProfile() {
    const formData = {
        name: document.getElementById('editUsername').value.trim(),
        phone: document.getElementById('editPhone').value.trim(),
        birthday: document.getElementById('editBirthday').value,
        gender: document.getElementById('editGender').value,
        bio: document.getElementById('editBio').value.trim(),
        avatar: document.getElementById('profileAvatar').src
    };

    // 验证必填字段
    if (!formData.name) {
        showMessage('请输入用户名', 'error');
        return;
    }

    try {
        // 显示保存动画
        const saveBtn = document.querySelector('.modal-footer .btn-primary');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '💾 保存中...';
        saveBtn.disabled = true;

        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 更新本地用户数据
        if (typeof currentUser !== 'undefined' && currentUser) {
            Object.assign(currentUser, formData);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            if (typeof updateUserDisplay === 'function') {
                updateUserDisplay();
            }
        }

        showMessage('个人资料已更新！', 'success');
        hideEditProfileModal();
        
    } catch (error) {
        showMessage('保存失败，请重试', 'error');
        console.error('保存个人资料失败:', error);
    }
}

// ===================== 用户设置功能 =====================

// 显示设置模态框
function showSettingsModal() {
    const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content settings-modal">
            <div class="modal-header">
                <h3>⚙️ 账户设置</h3>
                <button class="close-btn" onclick="hideSettingsModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="settings-tabs">
                    <button class="settings-tab active" onclick="switchSettingsTab('notifications')">🔔 通知</button>
                    <button class="settings-tab" onclick="switchSettingsTab('privacy')">🔒 隐私</button>
                    <button class="settings-tab" onclick="switchSettingsTab('security')">🛡️ 安全</button>
                </div>
                
                <div class="settings-content">
                    <!-- 通知设置 -->
                    <div id="notifications-settings" class="settings-section active">
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-title">推送通知</div>
                                <div class="setting-desc">接收积分奖励和活动通知</div>
                            </div>
                            <div class="setting-control">
                                <label class="switch">
                                    <input type="checkbox" ${settings.pushNotifications !== false ? 'checked' : ''} 
                                           onchange="updateSetting('pushNotifications', this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-title">邮件通知</div>
                                <div class="setting-desc">重要更新和安全提醒</div>
                            </div>
                            <div class="setting-control">
                                <label class="switch">
                                    <input type="checkbox" ${settings.emailNotifications !== false ? 'checked' : ''} 
                                           onchange="updateSetting('emailNotifications', this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-title">短信通知</div>
                                <div class="setting-desc">验证码和安全相关短信</div>
                            </div>
                            <div class="setting-control">
                                <label class="switch">
                                    <input type="checkbox" ${settings.smsNotifications !== false ? 'checked' : ''} 
                                           onchange="updateSetting('smsNotifications', this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 隐私设置 -->
                    <div id="privacy-settings" class="settings-section">
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-title">公开个人资料</div>
                                <div class="setting-desc">其他用户可以查看你的基本信息</div>
                            </div>
                            <div class="setting-control">
                                <label class="switch">
                                    <input type="checkbox" ${settings.publicProfile !== false ? 'checked' : ''} 
                                           onchange="updateSetting('publicProfile', this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-title">显示在线状态</div>
                                <div class="setting-desc">朋友可以看到你的在线状态</div>
                            </div>
                            <div class="setting-control">
                                <label class="switch">
                                    <input type="checkbox" ${settings.showOnlineStatus !== false ? 'checked' : ''} 
                                           onchange="updateSetting('showOnlineStatus', this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-title">数据分析</div>
                                <div class="setting-desc">帮助我们改进产品体验</div>
                            </div>
                            <div class="setting-control">
                                <label class="switch">
                                    <input type="checkbox" ${settings.dataAnalytics !== false ? 'checked' : ''} 
                                           onchange="updateSetting('dataAnalytics', this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 安全设置 -->
                    <div id="security-settings" class="settings-section">
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-title">双重验证</div>
                                <div class="setting-desc">登录时需要额外验证</div>
                            </div>
                            <div class="setting-control">
                                <label class="switch">
                                    <input type="checkbox" ${settings.twoFactorAuth === true ? 'checked' : ''} 
                                           onchange="updateSetting('twoFactorAuth', this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-title">登录提醒</div>
                                <div class="setting-desc">新设备登录时发送通知</div>
                            </div>
                            <div class="setting-control">
                                <label class="switch">
                                    <input type="checkbox" ${settings.loginAlerts !== false ? 'checked' : ''} 
                                           onchange="updateSetting('loginAlerts', this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-title">自动锁定</div>
                                <div class="setting-desc">长时间不活动时自动登出</div>
                            </div>
                            <div class="setting-control">
                                <label class="switch">
                                    <input type="checkbox" ${settings.autoLock !== false ? 'checked' : ''} 
                                           onchange="updateSetting('autoLock', this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-title">修改密码</div>
                                <div class="setting-desc">定期更新密码保护账户安全</div>
                            </div>
                            <div class="setting-control">
                                <button class="btn btn-outline-primary btn-sm" onclick="changePassword()">修改</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="version-info">
                    积分宝 v1.0.0 | © 2024 积分宝团队
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.onclick = (e) => e.target === modal && hideSettingsModal();
}

// 隐藏设置模态框
function hideSettingsModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// 切换设置标签
function switchSettingsTab(tabName) {
    // 切换标签激活状态
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 切换内容显示
    document.querySelectorAll('.settings-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(tabName + '-settings').classList.add('active');
}

// 更新设置
function updateSetting(key, value) {
    const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    settings[key] = value;
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    // 显示提示
    showMessage(`设置已更新`, 'success');
}

// 修改密码
function changePassword() {
    showMessage('密码修改功能正在开发中，请联系客服协助修改', 'info');
}

// ===================== 积分历史功能 =====================

// 显示积分历史
function showPointsHistory() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content profile-edit-modal">
            <div class="modal-header">
                <h3>📊 积分历史</h3>
                <button class="close-btn" onclick="hidePointsHistoryModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="points-history-content">
                    <div class="points-summary">
                        <div class="points-stat">
                            <span class="stat-label">总积分：</span>
                            <span class="stat-value">${(currentUser?.points || 0).toLocaleString()}</span>
                        </div>
                        <div class="points-stat">
                            <span class="stat-label">今日获得：</span>
                            <span class="stat-value">+2,340</span>
                        </div>
                        <div class="points-stat">
                            <span class="stat-label">本月获得：</span>
                            <span class="stat-value">+45,670</span>
                        </div>
                    </div>
                    
                    <div class="history-list">
                        <div class="history-item">
                            <div class="history-icon">🎮</div>
                            <div class="history-info">
                                <div class="history-title">完成游戏：拼图大师</div>
                                <div class="history-time">2024-01-10 14:30</div>
                            </div>
                            <div class="history-points">+20,000</div>
                        </div>
                        
                        <div class="history-item">
                            <div class="history-icon">📺</div>
                            <div class="history-info">
                                <div class="history-title">观看广告视频</div>
                                <div class="history-time">2024-01-10 14:25</div>
                            </div>
                            <div class="history-points">+50,000</div>
                        </div>
                        
                        <div class="history-item">
                            <div class="history-icon">💰</div>
                            <div class="history-info">
                                <div class="history-title">每日签到奖励</div>
                                <div class="history-time">2024-01-10 09:00</div>
                            </div>
                            <div class="history-points">+10,000</div>
                        </div>
                        
                        <div class="history-item">
                            <div class="history-icon">📱</div>
                            <div class="history-info">
                                <div class="history-title">下载推荐应用</div>
                                <div class="history-time">2024-01-09 20:15</div>
                            </div>
                            <div class="history-points">+30,000</div>
                        </div>
                        
                        <div class="history-item">
                            <div class="history-icon">🎁</div>
                            <div class="history-info">
                                <div class="history-title">新用户注册奖励</div>
                                <div class="history-time">2024-01-09 18:30</div>
                            </div>
                            <div class="history-points">+100,000</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="hidePointsHistoryModal()">关闭</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.onclick = (e) => e.target === modal && hidePointsHistoryModal();
}

// 隐藏积分历史模态框
function hidePointsHistoryModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// ===================== 提现申请功能 =====================

// 显示提现申请
function showWithdrawalRequest() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content profile-edit-modal">
            <div class="modal-header">
                <h3>💰 申请提现</h3>
                <button class="close-btn" onclick="hideWithdrawalModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="withdrawal-form">
                    <div class="balance-info">
                        <div class="balance-title">可提现积分</div>
                        <div class="balance-amount">${(currentUser?.points || 0).toLocaleString()}</div>
                        <div class="balance-note">1积分 = $0.001</div>
                    </div>
                    
                    <div class="form-group">
                        <label>💰 提现金额</label>
                        <div class="amount-input-group">
                            <span class="currency">$</span>
                            <input type="number" id="withdrawAmount" placeholder="0.00" min="10" step="0.01">
                        </div>
                        <small class="form-help">最低提现金额：$10.00</small>
                    </div>
                    
                    <div class="form-group">
                        <label>🏦 提现方式</label>
                        <select id="withdrawMethod">
                            <option value="">请选择提现方式</option>
                            <option value="paypal">PayPal</option>
                            <option value="bank">银行转账</option>
                            <option value="alipay">支付宝</option>
                            <option value="wechat">微信支付</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>📧 收款账户</label>
                        <input type="text" id="withdrawAccount" placeholder="请输入收款账户信息">
                        <small class="form-help">请确保账户信息准确无误</small>
                    </div>
                    
                    <div class="withdrawal-info">
                        <div class="info-item">
                            <span>手续费：</span>
                            <span>$0.50</span>
                        </div>
                        <div class="info-item">
                            <span>到账时间：</span>
                            <span>1-3个工作日</span>
                        </div>
                        <div class="info-item total">
                            <span>实际到账：</span>
                            <span id="actualAmount">$0.00</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="hideWithdrawalModal()">取消</button>
                <button class="btn btn-primary" onclick="submitWithdrawal()">提交申请</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.onclick = (e) => e.target === modal && hideWithdrawalModal();
    
    // 绑定金额输入事件
    document.getElementById('withdrawAmount').addEventListener('input', function() {
        const amount = parseFloat(this.value) || 0;
        const fee = 0.50;
        const actual = Math.max(0, amount - fee);
        document.getElementById('actualAmount').textContent = `$${actual.toFixed(2)}`;
    });
}

// 隐藏提现模态框
function hideWithdrawalModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// 提交提现申请
function submitWithdrawal() {
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const method = document.getElementById('withdrawMethod').value;
    const account = document.getElementById('withdrawAccount').value.trim();
    
    // 验证
    if (!amount || amount < 10) {
        showMessage('提现金额不能少于$10.00', 'error');
        return;
    }
    
    if (!method) {
        showMessage('请选择提现方式', 'error');
        return;
    }
    
    if (!account) {
        showMessage('请输入收款账户', 'error');
        return;
    }
    
    // 模拟提交
    showMessage('提现申请已提交，请等待审核', 'success');
    hideWithdrawalModal();
}

// 通用消息提示函数（如果不存在的话）
if (typeof showMessage !== 'function') {
    function showMessage(message, type = 'info') {
        const colors = {
            success: '#22c55e',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}
