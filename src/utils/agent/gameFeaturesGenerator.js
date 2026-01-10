import { checkIflowConfig, callIflowCommand } from '@/utils/core/iflowClient';

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

    // 调用.iflow目录下的GameServer指令
    const response = await callIflowCommand('gameserver', variables);
    
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
            // 方式1: 提取JSON数组
            const jsonMatch = aiResponse.match(/\[.*?\]/s);
            if (jsonMatch) {
              features = JSON.parse(jsonMatch[0]);
              console.log('=== 解析结果 ===');
              console.log('通过提取JSON数组解析成功:', features);
            } 
            // 方式2: 直接解析整个内容
            else if (aiResponse.trim().startsWith('[')) {
              features = JSON.parse(aiResponse);
              console.log('=== 解析结果 ===');
              console.log('通过直接解析整个内容解析成功:', features);
            }
            // 方式3: 按行解析
            else {
              features = parseFeaturesFromText(aiResponse);
              console.log('=== 解析结果 ===');
              console.log('通过按行解析:', features);
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


