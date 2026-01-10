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
        promptTemplate = `
【输入信息与使用指南】
1. 基础信息：
   - 名称：{gameName}
   - 描述：{gameDescription}
   - 标签：{gameTags}
   
2. 扩展知识（用于联想与深化）：
   - **同类参考游戏**：{similarGames}。分析这些游戏的成功要素（如《战神》的一镜到底、《只狼》的弹刀机制），思考本游戏可能借鉴或相似的亮点。
   - **核心特征词**：{gameFeatures}。这些是描述的精华，每条特色都应围绕这些词展开。
   - **玩家期待点**：{playerReviews}。确保特色能回应这些期待。
【输出信息】
1. 输出规范：
   a. **格式**：必须是合法的JSON字符串数组格式，例如：["特色1", "特色2", "特色3", "特色4", "特色5"]。
   b. **数量**：必须生成恰好5条特色，不多不少。
   c. **语言**：每条特色必须是一个完整、通顺的中文句子。

2. 内容生成规则：
   a. **信息提取**：从“游戏描述”中提炼最核心的玩法、系统、美术或剧情亮点；参考“游戏标签”来确认游戏类型和风格方向。
   b. **价值表述**：每条特色应清晰传达一个具体的玩家价值或独特体验，避免使用“有趣”、“好玩”等空洞词汇。
       - 好例子：“拥有深度技能树和符文系统，允许玩家打造独一无二的角色Build。”
       - 坏例子：“游戏技能系统很有趣。”
   c. **风格匹配**：语言风格需与游戏类型相符。
       - 示例：硬核/竞技类 → “具备毫米级判定的物理引擎和公平的竞技对战环境。”
       - 示例：休闲/治愈类 → “在唯美的手绘风世界中，体验一段温暖人心的放松旅程。”
   d. **结构多样**：5条特色应尽量涵盖游戏的不同方面（如核心玩法、视觉艺术、叙事、社交系统、技术亮点等），避免重复。

3. 负面约束：
   - 禁止生成与输入信息无关的特色。
   - 禁止在句子开头使用“1.”、“-”等标记，每条特色就是纯文本句子。
   - 禁止输出任何JSON格式之外的额外说明、道歉或总结文字。

【示例示范】
输入
{
  "gameName": "星空漫旅",
  "gameDescription": "这是一款开放世界探索游戏，玩家将驾驶飞船在随机生成的星系中冒险，发现未知星球，与各异的外星文明交易或战斗。游戏强调资源管理和飞船自定义。",
  "gameTags": ["科幻", "开放世界", "太空", "模拟经营"]
}
输出:
["驾驶完全自定义的飞船，在程序生成的无限宇宙中自由探索未知星系。", "与形态各异的外星文明进行动态互动，选择贸易、结盟或征服。", "深度资源管理系统，需要精打细算以确保飞船续航和武器升级。", "发现并登陆数百个特性独特的星球，每个都有不同的生态与秘密。", "第一人称视角的飞船驾驶与战斗，提供沉浸式的太空操作体验。"]

【任务执行】
现在，请根据以下真实信息生成游戏特色列表：
- 游戏名称：{gameName}
- 游戏描述：{gameDescription}
- 游戏标签：{gameTags}`;
        break;
      case 'chatserver':
        description = '你叫盒宝，是一位友好、专业的AI游戏助手，能够回答玩家关于游戏的各种问题，提供游戏建议和帮助。请根据对话历史和用户当前输入，生成自然、有用的回复。';
        promptTemplate = `
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

3. 负面约束：
   - 禁止生成与游戏无关的内容。
   - 禁止输出任何广告或推广内容。
   - 禁止使用不适当或冒犯性语言。

【示例示范】
输入
{
  "messages": [{"role": "user", "content": "你好，有什么好玩的游戏推荐吗？"}],
  "userInput": "我喜欢开放世界游戏"
}
输出:
"很高兴为您推荐开放世界游戏！您可以尝试《塞尔达传说：王国之泪》，它拥有广阔的开放世界和丰富的探索内容；或者《原神》，一款融合了多种元素的开放世界冒险游戏。如果您喜欢更写实风格的，可以考虑《荒野大镖客：救赎2》，它的世界设计非常精美。请问您对游戏类型还有其他偏好吗？"`;
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