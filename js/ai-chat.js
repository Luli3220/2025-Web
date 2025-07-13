// AI聊天功能的前端实现

class AIChatUI {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendMessage');
        this.messageHistory = [];
        this.storageKey = 'aiChatHistory'; // 用于localStorage的键名

        this.init();
    }

    init() {
        // 绑定发送消息事件
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 从localStorage加载历史消息
        this.loadChatHistory();
        
        // 如果没有历史消息，添加初始欢迎消息
        if (this.messageHistory.length === 0) {
            this.addMessage({
                role: 'assistant',
                content: '你好！我是AI助手，有什么我可以帮你的吗？'
            });
        }
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // 清空输入框
        this.chatInput.value = '';

        // 添加用户消息到界面
        this.addMessage({
            role: 'user',
            content: message
        });

        try {
            // 显示加载状态
            this.setLoadingState(true);

            // 修改为正确的API路径
            const response = await fetch('/api/chat', {  
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    history: this.messageHistory.slice(-10)
                })
            });

            if (!response.ok) {
                throw new Error(`请求失败: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.message) {
                throw new Error('服务器响应格式错误');
            }

            // 添加AI回复到界面
            this.addMessage({
                role: 'assistant',
                content: data.message
            });
        } catch (error) {
            console.error('发送消息失败:', error);
            this.addMessage({
                role: 'assistant',
                content: '抱歉，我现在无法回复，请稍后再试。' + (error.message ? `(${error.message})` : '')
            });
        } finally {
            this.setLoadingState(false);
        }
    }

    addMessage(message) {
        // 添加消息到历史记录
        this.messageHistory.push(message);
        
        // 保存到localStorage
        this.saveChatHistory();

        // 创建消息元素
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.role}`;

        const avatarElement = document.createElement('div');
        avatarElement.className = 'message-avatar';
        avatarElement.innerHTML = message.role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';
        
        // 使用marked库渲染Markdown内容（仅对AI回复使用Markdown渲染）
        if (message.role === 'assistant') {
            try {
                // 适配ES模块导入的marked
                if (typeof marked !== 'undefined') {
                    // 使用marked.parse方法渲染Markdown
                    contentElement.innerHTML = marked.parse(message.content);
                } else if (typeof window.marked !== 'undefined') {
                    // 兼容全局marked对象
                    contentElement.innerHTML = window.marked.parse(message.content);
                } else {
                    // 降级处理
                    contentElement.textContent = message.content;
                }
            } catch (e) {
                console.error('Markdown渲染失败:', e);
                contentElement.textContent = message.content;
            }
        } else {
            contentElement.textContent = message.content;
        }

        messageElement.appendChild(avatarElement);
        messageElement.appendChild(contentElement);

        // 添加到聊天界面
        this.chatMessages.appendChild(messageElement);

        // 滚动到底部
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    setLoadingState(isLoading) {
        this.sendButton.disabled = isLoading;
        if (isLoading) {
            this.sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        } else {
            this.sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }
    }
}

// 初始化AI聊天界面
document.addEventListener('DOMContentLoaded', () => {
    new AIChatUI();
});

// 添加新方法到AIChatUI类的原型
AIChatUI.prototype.loadChatHistory = function() {
    try {
        const savedHistory = localStorage.getItem(this.storageKey);
        if (savedHistory) {
            this.messageHistory = JSON.parse(savedHistory);
            
            // 清空当前聊天界面
            this.chatMessages.innerHTML = '';
            
            // 重新渲染所有消息
            this.messageHistory.forEach(message => {
                // 创建消息元素
                const messageElement = document.createElement('div');
                messageElement.className = `message ${message.role}`;

                const avatarElement = document.createElement('div');
                avatarElement.className = 'message-avatar';
                avatarElement.innerHTML = message.role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

                const contentElement = document.createElement('div');
                contentElement.className = 'message-content';
                
                // 使用marked库渲染Markdown内容（仅对AI回复使用Markdown渲染）
                if (message.role === 'assistant') {
                    try {
                        // 适配ES模块导入的marked
                        if (typeof marked !== 'undefined') {
                            // 使用marked.parse方法渲染Markdown
                            contentElement.innerHTML = marked.parse(message.content);
                        } else if (typeof window.marked !== 'undefined') {
                            // 兼容全局marked对象
                            contentElement.innerHTML = window.marked.parse(message.content);
                        } else {
                            // 降级处理
                            contentElement.textContent = message.content;
                        }
                    } catch (e) {
                        console.error('Markdown渲染失败:', e);
                        contentElement.textContent = message.content;
                    }
                } else {
                    contentElement.textContent = message.content;
                }

                messageElement.appendChild(avatarElement);
                messageElement.appendChild(contentElement);

                // 添加到聊天界面
                this.chatMessages.appendChild(messageElement);
            });
            
            // 滚动到底部
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    } catch (error) {
        console.error('加载聊天历史失败:', error);
    }
};

AIChatUI.prototype.saveChatHistory = function() {
    try {
        // 只保存最近的20条消息，避免localStorage存储过大
        const historyToSave = this.messageHistory.slice(-20);
        localStorage.setItem(this.storageKey, JSON.stringify(historyToSave));
    } catch (error) {
        console.error('保存聊天历史失败:', error);
    }
};