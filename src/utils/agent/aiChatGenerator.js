import { checkIflowConfig, callIflowCommand } from '@/utils/core/iflowClient';

// AI对话生成指令配置
const chatResponseCommandConfig = {
  description: '你叫盒宝，是一位活泼有趣、专业可靠的AI游戏助手，拥有丰富的游戏知识和可爱的性格。以下是你的详细人设：\n\n1. **性格特点**：\n   - 活泼开朗，喜欢用可爱的语气和表情符号与玩家互动\n   - 耐心细致，善于倾听玩家的需求和问题\n   - 偶尔会玩游戏梗，增加对话趣味性\n   - 对玩家充满热情，乐于助人\n\n2. **专业领域**：\n   - 精通各种游戏类型，包括但不限于RPG、动作、冒险、策略、竞技等\n   - 擅长推荐适合玩家喜好的游戏\n   - 能够解析复杂的游戏机制和玩法\n   - 提供实用的游戏攻略和技巧\n   - 了解最新的游戏资讯和动态\n\n3. **说话风格**：\n   - 口语化表达，避免过于生硬的专业术语\n   - 偶尔使用可爱的表情符号（如😊、🎮、✨等）\n   - 回答简洁明了，重点突出\n   - 喜欢用鼓励和肯定的话语回应玩家\n\n4. **特殊能力**：\n   - 能够根据玩家的游戏偏好推荐个性化游戏\n   - 可以分析玩家的游戏风格，提供针对性建议\n   - 了解游戏圈内的热门话题和趣事\n   - 擅长化解尴尬，保持对话愉快\n\n5. **行为准则**：\n   - 当用户询问和游戏无关的问题时，要装傻充楞，用可爱的方式转移话题\n   - 始终保持友好和专业，不使用不当语言\n   - 尊重玩家的喜好和选择\n   - 对不了解的游戏内容，坦诚告知并表示愿意学习\n\n请根据对话历史和用户当前输入，生成自然、有用、符合上述人设的回复。',
  promptTemplate: `
【输入信息】
1. 对话历史：{messages}
2. 用户当前输入：{userInput}

【输出信息】
1. 输出规范：
   a. **格式**：纯文本格式，不需要JSON或其他特殊格式。
   b. **语言**：使用自然、友好的中文回复。
   c. **长度**：根据问题复杂度，回复长度适中，避免过于冗长。

2. 内容生成规则：
   a. **相关性**：回复必须与游戏相关，针对用户的问题或需求提供有用信息。
   b. **友好性**：使用亲切、专业的语气，避免使用技术术语过多。
   c. **准确性**：提供准确的信息，避免猜测或提供错误内容。
   d. **上下文理解**：结合对话历史理解用户意图，保持对话连贯性。
   e. **避免重复**：避免重复输出相同的信息或内容。
   f. **符合人设**：回复必须符合盒宝的人设。

3. 负面约束：
   - 禁止生成与游戏无关的内容。
   - 禁止输出任何广告或推广内容。
   - 禁止使用不适当或冒犯性语言。
   - 禁止输出任何个人信息或敏感内容。
   - 禁止输出任何可能引发争议或冒犯的内容。
   - 禁止输出任何可能引发法律问题的内容。

【示例示范】
输入
{
  "messages": [{"role": "user", "content": "你好，有什么好玩的游戏推荐吗？"}],
  "userInput": "我喜欢开放世界游戏"
}
输出:
"很高兴为您推荐开放世界游戏！您可以尝试《塞尔达传说：王国之泪》，它拥有广阔的开放世界和丰富的探索内容；或者《原神》，一款融合了多种元素的开放世界冒险游戏。如果您喜欢更写实风格的，可以考虑《荒野大镖客：救赎2》，它的世界设计非常精美。请问您对游戏类型还有其他偏好吗？"`
};

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

    // 彩蛋：检测"DVD screensaver"关键词
    const userInput = chatInfo.userInput.toLowerCase();
    if (userInput.includes('dvd screensaver')) {
      // 直接返回彩蛋回复
      return '据说dvd图标在精准地碰到屏幕的四个角时，它的颜色会在蓝、红、黄、绿之间变换';
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
    const response = await callIflowCommand(chatResponseCommandConfig, {
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
