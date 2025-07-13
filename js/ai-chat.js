// AI聊天功能的前端实现

class AIChatUI {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendMessage');
        this.messageHistory = [];

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

        // 添加初始欢迎消息
        this.addMessage({
            role: 'assistant',
            content: '你好！我是AI助手，有什么我可以帮你的吗？'
        });
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

        // 创建消息元素
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.role}`;

        const avatarElement = document.createElement('div');
        avatarElement.className = 'message-avatar';
        avatarElement.innerHTML = message.role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';
        contentElement.textContent = message.content;

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