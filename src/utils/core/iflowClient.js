/**
 * 心流开放平台客户端配置
 * 用于管理心流平台的API调用
 */

// 从环境变量获取配置
const iflowConfig = {
  // 从环境变量获取API密钥
  apiKey: import.meta.env.VITE_IFLOW_API_KEY,
  // 使用Vite代理地址，解决CORS问题
  apiUrl: '/iflow-api/v1/chat/completions',
  // 官网配置的OpenAi Base URL
  openAiBaseUrl: 'https://apis.iflow.cn/v1',
  // 使用指令指定的模型：deepseek-v3.2
  defaultModel: 'deepseek-v3.2',
  // 默认API参数
  defaultParams: {
    temperature: 0.7,
    max_tokens: 500
  }
};

/**
 * 检查心流配置是否完整
 * @returns {boolean} 配置是否完整
 */
export function checkIflowConfig() {
  return !!iflowConfig.apiKey && !!iflowConfig.apiUrl;
}

/**
 * 调用心流API生成内容
 * @param {Array} messages 对话消息数组
 * @param {Object} params API参数
 * @returns {Promise<Object>} API响应结果
 */
export async function callIflowApi(messages, params = {}) {
  try {
    // 检查配置
    if (!checkIflowConfig()) {
      throw new Error('心流API配置不完整');
    }

    // 合并默认参数和自定义参数
    const apiParams = {
      ...iflowConfig.defaultParams,
      ...params,
      model: params.model || iflowConfig.defaultModel,
      messages
    };

    // 调用API
    const response = await fetch(iflowConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${iflowConfig.apiKey}`
      },
      body: JSON.stringify(apiParams)
    });

    // 检查响应状态
    if (!response.ok) {
      throw new Error(`API调用失败: ${response.statusText}`);
    }

    // 返回响应数据
    return await response.json();
  } catch (error) {
    console.error('心流API调用失败:', error);
    throw error;
  }
}

/**
 * 调用心流平台的自定义指令
 * @param {string} commandName 指令名称（不带.toml扩展名）
 * @param {Object} variables 指令中需要替换的变量，例如 { gameName: "xxx", gameDescription: "xxx" }
 * @param {Object} params API参数
 * @returns {Promise<Object>} API响应结果
 */
export async function callIflowCommand(commandName, variables = {}, params = {}) {
  try {
    // 根据指令名称构建prompt
    let promptTemplate = '';
    let description = '';

    switch (commandName) {
      case 'gameserver':
        description = '你是一位精通游戏行业和玩家心理的资深编辑。请综合以下所有信息，为该游戏生成5条能吸引目标玩家的核心特色。这些特色应结合游戏自身描述，并借鉴同类游戏的成熟设计亮点。';
        promptTemplate = `基于以下游戏信息，生成5条吸引人的游戏特色：
- 游戏名称：{gameName}
- 游戏描述：{gameDescription}
- 游戏标签：{gameTags}

要求：
1. 每条特色简洁有力，突出游戏核心亮点
2. 语言风格符合游戏类型
3. 返回格式为JSON数组，例如：["特色1", "特色2", "特色3", "特色4", "特色5"]
4. 禁止输出任何JSON格式之外的额外说明、道歉或总结文字`;
        break;
      default:
        throw new Error(`未知的指令名称: ${commandName}`);
    }

    // 替换变量
    let prompt = promptTemplate;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      prompt = prompt.replace(regex, value || '');
    }

    // 构建消息
    const messages = [
      {
        role: 'system',
        content: description
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    // 调用chat completions API
    return await callIflowApi(messages, params);
  } catch (error) {
    console.error('心流指令调用失败:', error);
    throw error;
  }
}

// 导出配置
export default iflowConfig