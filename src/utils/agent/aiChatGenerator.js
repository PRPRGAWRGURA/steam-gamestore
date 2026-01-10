import { checkIflowConfig, callIflowCommand } from '@/utils/core/iflowClient';

/**
 * 生成AI对话回复
 * @param {Object} chatInfo 对话信息
 * @param {Array} chatInfo.messages 对话历史消息数组
 * @param {string} chatInfo.userInput 用户当前输入
 * @returns {Promise<string>} AI回复内容
 */
export async function generateChatResponse(chatInfo) {
  try {
    // 验证输入参数
    if (!chatInfo || !chatInfo.userInput) {
      throw new Error('缺少必要的对话信息');
    }

    // 检查心流配置
    if (!checkIflowConfig()) {
      console.warn('心流API配置不完整，使用默认回复');
      return getDefaultResponse();
    }

    // 构建对话历史
    const messages = chatInfo.messages || [];
    const currentMessages = [...messages, {
      role: 'user',
      content: chatInfo.userInput
    }];

    // 调用AI对话指令
    const response = await callIflowCommand('chatserver', {
      messages: JSON.stringify(currentMessages),
      userInput: chatInfo.userInput
    });
    
    // 解析响应
    let aiResponse = '';
    try {
      // 检查响应基本结构
      if (response && response.choices && Array.isArray(response.choices) && response.choices.length > 0) {
        const firstChoice = response.choices[0];
        if (firstChoice.message && firstChoice.message.content) {
          aiResponse = firstChoice.message.content;
          console.log('=== AI生成的对话回复 ===');
          console.log(aiResponse);
          console.log('=== AI生成对话回复结束 ===');
        } else {
          console.warn('响应缺少message.content字段');
          aiResponse = getDefaultResponse();
        }
      } else {
        console.warn('响应缺少有效choices数组');
        aiResponse = getDefaultResponse();
      }
    } catch (error) {
      console.error('处理对话响应时发生错误:', error);
      aiResponse = getDefaultResponse();
    }

    return aiResponse;
  } catch (error) {
    console.error('生成AI对话回复失败:', error);
    // 返回默认回复
    return getDefaultResponse();
  }
}

/**
 * 获取默认回复
 * @returns {string} 默认回复内容
 */
function getDefaultResponse() {
  return '我是您的AI助手，很高兴为您服务！目前我的功能正在完善中，敬请期待更多精彩内容。';
}
