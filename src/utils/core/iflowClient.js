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
    temperature: 0.85,
    max_tokens: 500
  }
};

/**
 * 检查心流配置是否完整
 * @returns {boolean} 配置是否完整
 */
export function checkIflowConfig() {
  return !!iflowConfig.apiKey;
}

/**
 * 判断是否为可重试的错误类型
 * @param {Error} error - 错误对象
 * @returns {boolean} 是否可重试
 */
function isRetryableError(error) {
  // 网络错误、超时、服务器错误等可以重试
  return error.message.includes('Network Error') || 
         error.message.includes('timeout') || 
         error.message.includes('Failed to fetch') ||
         (error.message.startsWith('API调用失败:') && 
          error.message.includes('50') || 
          error.message.includes('Internal Server Error') ||
          error.message.includes('Service Unavailable') ||
          error.message.includes('Gateway Timeout'));
}

/**
 * 调用心流API生成内容
 * @param {Array} messages 对话消息数组
 * @param {Object} params API参数
 * @param {number} [retryCount=3] 重试次数
 * @returns {Promise<Object>} API响应结果
 */
export async function callIflowApi(messages, params = {}, retryCount = 3) {
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
    
    // 如果还有重试次数且是可重试的错误类型，进行重试
    if (retryCount > 0 && isRetryableError(error)) {
      const remainingRetries = retryCount - 1;
      console.log(`心流API调用失败，将在1秒后重试，剩余重试次数: ${remainingRetries}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return callIflowApi(messages, params, remainingRetries);
    }
    
    throw error;
  }
}

/**
 * 调用心流平台的自定义指令
 * @param {Object} commandConfig 指令配置
 * @param {string} commandConfig.description 系统角色描述
 * @param {string} commandConfig.promptTemplate 提示词模板
 * @param {Object} variables 指令中需要替换的变量，例如 { gameName: "xxx", gameDescription: "xxx" }
 * @param {Object} params API参数
 * @returns {Promise<Object>} API响应结果
 */
export async function callIflowCommand(commandConfig, variables = {}, params = {}) {
  try {
    // 验证配置
    if (!commandConfig || !commandConfig.description || !commandConfig.promptTemplate) {
      throw new Error('缺少必要的指令配置');
    }

    // 替换变量
    let prompt = commandConfig.promptTemplate;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      prompt = prompt.replace(regex, value || '');
    }

    // 构建消息
    const messages = [
      {
        role: 'system',
        content: commandConfig.description
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