<script>
import { ref, onMounted, nextTick } from 'vue';
import { generateChatResponse } from '@/utils/agent/aiChatGenerator';

export default {
    setup() {
        const isExpanded = ref(true); // 控制小助手展开/收起状态
        const isTyping = ref(false); // 控制AI正在输入状态
        const messages = ref([ // 对话消息列表
            {
                id: 1,
                content: '您好！我是盒宝，有什么可以帮助您的吗？',
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString()
            }
        ]);
        const inputContent = ref(''); // 输入框内容
        const messagesContainer = ref(null); // 消息容器引用，用于滚动到底部
        
        // 切换展开/收起状态
        const toggleExpand = () => {
            isExpanded.value = !isExpanded.value;
        };
        
        // 发送消息
        const sendMessage = async () => {
            if (!inputContent.value.trim()) return;
            
            // 添加用户消息
            const userMessage = {
                id: Date.now(),
                content: inputContent.value.trim(),
                sender: 'user',
                timestamp: new Date().toLocaleTimeString()
            };
            messages.value.push(userMessage);
            
            // 清空输入框
            inputContent.value = '';
            
            // 滚动到底部
            scrollToBottom();
            
            // 设置AI正在输入状态
            isTyping.value = true;
            
            // 添加AI正在输入的临时消息
            const typingMessage = {
                id: Date.now() + 1,
                content: '正在思考...',
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString(),
                isTyping: true
            };
            messages.value.push(typingMessage);
            scrollToBottom();
            
            try {
                // 调用真实的AI对话API
                const aiResponse = await generateChatResponse({
                    messages: messages.value.filter(msg => !msg.isTyping).map(msg => ({
                        role: msg.sender === 'user' ? 'user' : 'assistant',
                        content: msg.content
                    })),
                    userInput: userMessage.content
                });
                
                // 移除正在输入的临时消息
                messages.value = messages.value.filter(msg => !msg.isTyping);
                
                // 添加真实的AI回复
                const finalAiMessage = {
                    id: Date.now() + 2,
                    content: aiResponse,
                    sender: 'ai',
                    timestamp: new Date().toLocaleTimeString()
                };
                messages.value.push(finalAiMessage);
            } catch (error) {
                console.error('AI对话失败:', error);
                
                // 移除正在输入的临时消息
                messages.value = messages.value.filter(msg => !msg.isTyping);
                
                // 添加错误回复
                const errorMessage = {
                    id: Date.now() + 2,
                    content: '抱歉，我暂时无法回答您的问题，请稍后再试。',
                    sender: 'ai',
                    timestamp: new Date().toLocaleTimeString()
                };
                messages.value.push(errorMessage);
            } finally {
                // 关闭正在输入状态
                isTyping.value = false;
                scrollToBottom();
            }
        };
        
        // 滚动到底部
        const scrollToBottom = async () => {
            await nextTick();
            if (messagesContainer.value) {
                messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
            }
        };
        
        // 监听回车键发送消息
        const handleKeyPress = (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        };
        
        // 组件挂载时滚动到底部
        onMounted(() => {
            scrollToBottom();
        });
        
        return {
            isExpanded,
            isTyping,
            toggleExpand,
            messages,
            inputContent,
            messagesContainer,
            sendMessage,
            handleKeyPress
        };
    }
};
</script>
<template>
    <!-- AI助手容器 -->
    <div class="sider-agent" :class="{ 'expanded': isExpanded }">
        <!-- 展开/收起状态 -->
        <div v-if="isExpanded" class="agent-container">
            <!-- 头部 -->
            <div class="agent-header">
                <h3>AI助手</h3>
                <button class="toggle-btn" @click="toggleExpand" title="收起">
                    <span class="toggle-icon">−</span>
                </button>
            </div>
            
            <!-- 对话消息区域 -->
            <div class="agent-messages" ref="messagesContainer">
                <!-- 消息列表 -->
                <div 
                    v-for="message in messages" 
                    :key="message.id" 
                    class="message-item" 
                    :class="message.sender === 'user' ? 'user-message' : 'ai-message'"
                >
                    <div class="message-content">
                        <div class="message-text">{{ message.content }}</div>
                        <div class="message-time">{{ message.timestamp }}</div>
                    </div>
                </div>
            </div>
            
            <!-- 输入区域 -->
            <div class="agent-input-area">
                <textarea
                    v-model="inputContent"
                    class="message-input"
                    placeholder="输入您的问题..."
                    rows="1"
                    @keypress="handleKeyPress"
                ></textarea>
                <button class="send-btn" @click="sendMessage" title="发送消息">
                    <span class="send-icon">➤</span>
                </button>
            </div>
        </div>
        
        <!-- 收起状态 -->
        <div v-else class="agent-collapsed">
            <button class="expand-btn" @click="toggleExpand" title="展开AI助手">
                <FontAwesomeIcon icon="robot" class="expand-icon" />
                <span class="expand-text">Al助手</span>
            </button>
        </div>
    </div>
</template>
<style scoped>
/* 基础容器样式 */
.sider-agent {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999;
    transition: all 0.3s ease;
}

/* 展开状态容器 */
.agent-container {
    width: 320px;
    height: 450px;
    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.3s ease;
}

/* 头部样式 */
.agent-header {
    padding: 16px 20px;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.agent-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    position: relative;
    color: rgba(255, 255, 255, 0.1);
    background: linear-gradient(
        45deg,
        #ffffff 0%,
        #ffd7ff 20%,
        #e6ffff 40%,
        #ffffe6 60%,
        #ffe6ff 80%,
        #ffffff 100%
    );
    background-size: 300% 300%;
    background-clip: text;
    -webkit-background-clip: text;
    animation: laserShine 2s ease-in-out infinite;
    filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.3));
}

/* 镭射贴纸光效动画关键帧 */
@keyframes laserShine {
    0%, 100% {
        background-position: 0% 50%;
    }
    25% {
        background-position: 100% 50%;
    }
    50% {
        background-position: 100% 100%;
    }
    75% {
        background-position: 0% 100%;
    }
}

/* 切换按钮样式 */
.toggle-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: white;
    font-size: 20px;
    line-height: 1;
    padding: 0;
}

.toggle-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
}

.toggle-btn:active {
    transform: scale(0.95);
}

/* 对话消息区域 */
.agent-messages {
    flex: 1;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

/* 消息项 */
.message-item {
    display: flex;
    max-width: 100%;
}

/* 用户消息 */
.user-message {
    justify-content: flex-end;
}

/* AI消息 */
.ai-message {
    justify-content: flex-start;
}

/* 消息内容 */
.message-content {
    max-width: 85%;
    padding: 12px 16px;
    border-radius: 18px;
    position: relative;
    word-wrap: break-word;
    word-break: break-word;
}

/* 用户消息内容 */
.user-message .message-content {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border-bottom-right-radius: 4px;
}

/* AI消息内容 */
.ai-message .message-content {
    background: rgba(255, 255, 255, 0.9);
    color: #333;
    border-bottom-left-radius: 4px;
}

/* 消息文本 */
.message-text {
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 4px;
}

/* 消息时间 */
.message-time {
    font-size: 11px;
    opacity: 0.7;
    text-align: right;
}

/* 输入区域 */
.agent-input-area {
    padding: 15px;
    background: rgba(0, 0, 0, 0.2);
    display: flex;
    gap: 10px;
    align-items: flex-end;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 消息输入框 */
.message-input {
    flex: 1;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 20px;
    padding: 10px 15px;
    font-size: 14px;
    resize: none;
    min-height: 40px;
    max-height: 120px;
    line-height: 1.5;
    outline: none;
    transition: all 0.2s ease;
}

.message-input:focus {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* 发送按钮 */
.send-btn {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: white;
    font-size: 16px;
    flex-shrink: 0;
}

.send-btn:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    transform: scale(1.1);
}

.send-btn:active {
    transform: scale(0.95);
}

/* 收起状态 */
.agent-collapsed {
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 展开按钮样式 */
.expand-btn {
    background: #1e3a8a;
    border: 1px solid #3b82f6;
    border-radius: 8px;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
    color: white;
    font-weight: 600;
    font-size: 14px;
    position: relative;
    overflow: hidden;
}

/* 高光扫过动画效果 */
.expand-btn::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -120%;
    width: 100%;
    height: 200%;
    background: linear-gradient(
        to right,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
    );
    transform: rotate(30deg);
    transition: left 0.4s ease;
}

.expand-btn:hover::before {
    left: 100%;
}

.expand-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
    background: #2563eb;
}

.expand-btn:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgba(59, 130, 246, 0.3);
}

/* 展开按钮图标 */
.expand-icon {
    font-size: 20px;
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
}

.expand-btn:hover .expand-icon {
    transform: scale(1.1) rotate(5deg);
    color: #f0f9ff;
}

/* 展开按钮文字 */
.expand-text {
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
}

.expand-btn:hover .expand-text {
    color: #f0f9ff;
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

/* Firefox滚动条样式 */
.agent-messages {
    scrollbar-width: thin;
    scrollbar-color: rgba(10, 63, 112, 0.6) rgba(5, 36, 53, 0.268);
}
</style>