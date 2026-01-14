import { checkIflowConfig, callIflowCommand } from '@/utils/core/iflowClient';

// 游戏特色生成指令配置
const gameFeaturesCommandConfig = {
  description: '你是一位精通游戏行业和玩家心理的资深编辑。请综合以下所有信息，为该游戏生成5条能吸引目标玩家的核心特色。这些特色应结合游戏自身描述，并借鉴同类游戏的成熟设计亮点。',
  promptTemplate: `
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
   d. **避免重复**：所有特色必须不同，不能有重复的内容。
   e. **避免使用专业术语**：特色应避免使用专业术语，如“毫秒级”、“物理引擎”等。
   f. **控制字数**：每条特色应保持在40-50个中文字符内，避免过长。

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
- 游戏标签：{gameTags}`
};

/**
 * 生成游戏特色列表
 * @param {Object} gameInfo 游戏信息
 * @param {string} gameInfo.gameName 游戏名称
 * @param {string} gameInfo.gameDescription 游戏描述
 * @param {Array} gameInfo.gameTags 游戏标签数组
 * @returns {Promise<Array>} 游戏特色列表
 */
export async function generateGameFeatures(gameInfo) {
  try {
    // 验证输入参数
    if (!gameInfo || !gameInfo.gameName) {
      throw new Error('缺少必要的游戏信息');
    }

    // 检查心流配置
    if (!checkIflowConfig()) {
      console.warn('心流API配置不完整，使用默认游戏特色');
      return getDefaultGameFeatures();
    }

    // 构建指令变量
    const variables = {
      gameName: gameInfo.gameName || '',
      gameDescription: gameInfo.gameDescription || '',
      gameTags: Array.isArray(gameInfo.gameTags) ? gameInfo.gameTags.join(',') : (gameInfo.gameTags || ''),
      similarGames: gameInfo.similarGames || '',
      gameFeatures: gameInfo.gameFeatures || '',
      playerReviews: gameInfo.playerReviews || ''
    };

    // 调用游戏特色生成指令
    const response = await callIflowCommand(gameFeaturesCommandConfig, variables);
    
    // 输出完整响应到控制台
    console.log('=== 心流API完整响应 ===');
    console.log('响应状态:', response.status || '无状态');
    console.log('响应头:', response.headers || '无响应头');
    console.log('响应数据:', JSON.stringify(response, null, 2));
    console.log('=== 心流API完整响应结束 ===');
    
    // 解析响应
    let features = [];
    try {
      // 检查响应基本结构
      if (response && response.choices && Array.isArray(response.choices) && response.choices.length > 0) {
        const firstChoice = response.choices[0];
        if (firstChoice.message && firstChoice.message.content) {
          const aiResponse = firstChoice.message.content;
          console.log('=== AI生成的原始内容 ===');
          console.log(aiResponse);
          console.log('=== AI生成内容结束 ===');
          
          try {
            // 尝试多种解析方式
            let parsedFeatures = [];
            let parseMethod = '';
            
            // 方式1: 直接解析整个内容（优先）
            if (aiResponse.trim().startsWith('[')) {
              parsedFeatures = JSON.parse(aiResponse);
              parseMethod = '直接解析整个内容';
            } 
            // 方式2: 提取完整JSON数组（使用贪婪匹配）
            else {
              // 使用贪婪匹配，确保匹配到完整的数组
              const jsonMatch = aiResponse.match(/\[.*\]/s);
              if (jsonMatch) {
                parsedFeatures = JSON.parse(jsonMatch[0]);
                parseMethod = '提取完整JSON数组';
              } else {
                // 方式3: 按行解析
                parsedFeatures = parseFeaturesFromText(aiResponse);
                parseMethod = '按行解析';
              }
            }
            
            // 处理嵌套数组情况（例如：[["特色1"], ["特色2"]]）
            if (Array.isArray(parsedFeatures) && parsedFeatures.length > 0) {
              // 检查是否是嵌套数组
              if (Array.isArray(parsedFeatures[0])) {
                // 将嵌套数组扁平化为一维数组
                features = parsedFeatures.flat();
                console.log('=== 解析结果 ===');
                console.log(`通过${parseMethod}解析成功，处理了嵌套数组:`, features);
              } else {
                // 已经是一维数组，直接使用
                features = parsedFeatures;
                console.log('=== 解析结果 ===');
                console.log(`通过${parseMethod}解析成功:`, features);
              }
            } else {
              // 解析结果无效，使用按行解析
              features = parseFeaturesFromText(aiResponse);
              console.log('=== 解析结果 ===');
              console.log('解析结果无效，使用按行解析:', features);
            }
          } catch (parseError) {
            console.error('解析游戏特色失败:', parseError);
            console.error('原始输出:', aiResponse);
            features = getDefaultGameFeatures();
            console.log('使用默认游戏特色:', features);
          }
        } else {
          console.warn('响应缺少message.content字段');
          features = getDefaultGameFeatures();
        }
      } else {
        console.warn('响应缺少有效choices数组');
        features = getDefaultGameFeatures();
      }
    } catch (error) {
      console.error('处理响应时发生错误:', error);
      features = getDefaultGameFeatures();
    }

    // 验证结果格式
    if (!Array.isArray(features) || features.length === 0) {
      console.warn('游戏特色生成结果无效，使用默认特色');
      features = getDefaultGameFeatures();
    }

    return features;
  } catch (error) {
    console.error('生成游戏特色失败:', error);
    // 返回默认特色列表
    return getDefaultGameFeatures();
  }
}



/**
 * 从文本中解析游戏特色
 * @param {string} text AI返回的文本
 * @returns {Array} 游戏特色列表
 */
function parseFeaturesFromText(text) {
  // 简单的文本解析逻辑，根据实际情况调整
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('```') && !line.startsWith('JSON'));
  
  // 取前5条
  return lines.slice(0, 5);
}

/**
 * 获取默认游戏特色列表
 * @returns {Array} 默认游戏特色列表
 */
function getDefaultGameFeatures() {
  return [
    '精美的游戏画面',
    '流畅的游戏体验',
    '丰富的游戏内容',
    '多种游戏模式',
    '支持多人联机'
  ];
}


