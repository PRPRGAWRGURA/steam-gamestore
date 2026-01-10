import { checkIflowConfig, callIflowCommand, callIflowApi } from '@/utils/core/iflowClient';

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
    
    // 解析响应
    let features = [];
    if (response && response.choices && response.choices[0] && response.choices[0].message) {
      const aiResponse = response.choices[0].message.content;
      
      try {
        const jsonMatch = aiResponse.match(/\[.*?\]/s);
        if (jsonMatch) {
          features = JSON.parse(jsonMatch[0]);
        } else {
          features = parseFeaturesFromText(aiResponse);
        }
      } catch (parseError) {
        console.error('解析游戏特色失败:', parseError);
        console.error('原始输出:', aiResponse);
        features = getDefaultGameFeatures();
      }
    } else {
      console.warn('API响应格式异常，使用默认特色');
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
 * 生成提示词
 * @param {Object} gameInfo 游戏信息
 * @returns {string} 提示词
 */
function generatePrompt(gameInfo) {
  const { gameName, gameDescription, gameTags } = gameInfo;
  const gameTagsStr = Array.isArray(gameTags) ? gameTags.join(',') : gameTags || '';

  return `基于以下游戏信息，生成5条吸引人的游戏特色：
- 游戏名称：${gameName}
- 游戏描述：${gameDescription}
- 游戏标签：${gameTagsStr}

要求：
1. 每条特色简洁有力，不超过20字
2. 突出游戏核心亮点
3. 语言风格符合游戏类型
4. 返回格式为JSON数组，例如：["特色1", "特色2", "特色3", "特色4", "特色5"]
5. 禁止输出任何JSON格式之外的额外说明、道歉或总结文字`;
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


