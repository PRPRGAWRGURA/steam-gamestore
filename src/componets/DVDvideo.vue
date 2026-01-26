<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// 定义事件，用于通知父组件卸载当前组件
const emit = defineEmits(['close']);

// 点击区域卸载组件
const handleClose = () => {
  emit('close');
};

// 获取元素引用
const moveArea = ref(null);
const dvdVideo = ref(null);
const dvdImage = ref(null);

// 位置和速度
const x = ref(0);
const y = ref(0);
let dx = 2; // 初始X方向速度
let dy = 2; // 初始Y方向速度

// 颜色图片数组
const colorImages = [
  '/WebResources/DVD-Sign-blue.svg',
  '/WebResources/DVD-Sign-red.svg',
  '/WebResources/DVD-Sign-yellow.svg',
  '/WebResources/DVD-Sign-green.svg'
];

// 当前图片索引
const currentImageIndex = ref(0);

let animationFrame = null;

// 初始化动画
const initAnimation = () => {
  if (!moveArea.value || !dvdVideo.value || !dvdImage.value) return;
  
  // 获取容器和图片尺寸
  const containerWidth = moveArea.value.clientWidth;
  const containerHeight = moveArea.value.clientHeight;
  const imageWidth = dvdVideo.value.clientWidth;
  const imageHeight = dvdVideo.value.clientHeight;
  
  // 随机初始位置
  x.value = Math.random() * (containerWidth - imageWidth);
  y.value = Math.random() * (containerHeight - imageHeight);
  
  // 随机初始速度方向
  dx = Math.random() > 0.5 ? 2 : -2;
  dy = Math.random() > 0.5 ? 2 : -2;
  
  animate();
};

// 动画循环
const animate = () => {
  if (!moveArea.value || !dvdVideo.value || !dvdImage.value) return;
  
  const containerWidth = moveArea.value.clientWidth;
  const containerHeight = moveArea.value.clientHeight;
  const imageWidth = dvdVideo.value.clientWidth;
  const imageHeight = dvdVideo.value.clientHeight;
  
  // 更新位置
  x.value += dx;
  y.value += dy;
  
  // 碰撞检测和反弹
  let collided = false;
  let hitCorner = false;
  
  // 定义误差范围，用于精确检测角点碰撞
  const cornerThreshold = 10;
  
  // 检测X方向碰撞
  if (x.value <= 0 || x.value >= containerWidth - imageWidth) {
    dx = -dx; // 反转X方向
    collided = true;
  }
  
  // 检测Y方向碰撞
  if (y.value <= 0 || y.value >= containerHeight - imageHeight) {
    dy = -dy; // 反转Y方向
    collided = true;
  }
  
  // 精确检测是否碰到四个角
  // 左上角 (0, 0)
  if (Math.abs(x.value) <= cornerThreshold && Math.abs(y.value) <= cornerThreshold) {
    hitCorner = true;
  }
  // 右上角 (containerWidth - imageWidth, 0)
  else if (Math.abs(x.value - (containerWidth - imageWidth)) <= cornerThreshold && Math.abs(y.value) <= cornerThreshold) {
    hitCorner = true;
  }
  // 左下角 (0, containerHeight - imageHeight)
  else if (Math.abs(x.value) <= cornerThreshold && Math.abs(y.value - (containerHeight - imageHeight)) <= cornerThreshold) {
    hitCorner = true;
  }
  // 右下角 (containerWidth - imageWidth, containerHeight - imageHeight)
  else if (Math.abs(x.value - (containerWidth - imageWidth)) <= cornerThreshold && Math.abs(y.value - (containerHeight - imageHeight)) <= cornerThreshold) {
    hitCorner = true;
  }
  
  // 只有精确碰到角点时才切换颜色图片
  if (hitCorner) {
    // 循环切换到下一张图片
    currentImageIndex.value = (currentImageIndex.value + 1) % colorImages.length;
  }
  
  animationFrame = requestAnimationFrame(animate);
};

// 组件挂载时初始化动画
onMounted(() => {
  // 确保DOM渲染完成
  setTimeout(() => {
    initAnimation();
  }, 100);
});

// 组件卸载时清理动画
onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
});
</script>
<template>
    <div class="move-area" ref="moveArea" @click="handleClose">
        <div class="dvdvideo" ref="dvdVideo" :style="{ left: `${x}px`, top: `${y}px` }">
            <img ref="dvdImage" :src="colorImages[currentImageIndex]" alt="DVD Logo">
        </div>
    </div>
</template>
<style scoped>
.move-area {
    position: fixed;
    width: 100%;
    height: 93%;
    overflow: hidden;
    z-index: 100;
}

.dvdvideo {
    position: absolute;
    transition: all 0.016s linear;
}

.dvdvideo img {
    width: 200px;
    height: auto;
}
</style>