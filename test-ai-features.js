import { exec } from 'node:child_process';

// 测试游戏数据
const testGame = {
  gameName: "星空漫旅",
  gameDescription: "这是一款开放世界探索游戏，玩家将驾驶飞船在随机生成的星系中冒险，发现未知星球，与各异的外星文明交易或战斗。游戏强调资源管理和飞船自定义。",
  gameTags: ["科幻", "开放世界", "太空", "模拟经营"]
};

// 构建iflow命令
const command = `iflow --prompt "使用/gameserver命令生成游戏特色，参数：${JSON.stringify(testGame)}"`;

console.log('运行命令:', command);

// 执行命令
exec(command, { cwd: 'e:\\web集中营\\GameStore\\GS_User' }, (error, stdout, stderr) => {
  if (error) {
    console.error(`执行错误: ${error}`);
    return;
  }
  if (stderr) {
    console.error(`命令错误: ${stderr}`);
    return;
  }
  console.log('生成结果:');
  console.log(stdout);
});