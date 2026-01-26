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
    top: 0px;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    z-index: 10001;
    background-color: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    /* 电磁波噪点雪花效果 */
    background-image: 
        /* 噪点纹理 */
        repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 2px),
        repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 2px),
        /* 扫描线 */
        repeating-linear-gradient(0deg, transparent 0px, rgba(0,0,0,0.1) 1px, transparent 2px);
    background-size: 
        /* 噪点大小 */
        5px 5px,
        7px 7px,
        /* 扫描线间隔 */
        100% 2px;
    background-position: 0 0;
    animation: 
        /* 电磁波噪点随机闪烁 - 放慢到0.5秒 */
        noise 5s infinite,
        /* 扫描线滚动 */
        scanline 8s linear infinite,
        /* 信号干扰 - 放慢到5秒 */
        interference 5s linear infinite;
    /* 添加电视信号干扰效果 */
    filter: contrast(1.2) brightness(0.9);
}

/* 电磁波噪点随机闪烁 */
@keyframes noise {
    0% {
        background-position: 
            0px 0px,
            0px 0px,
            0px 0px;
        opacity: 0.9;
    }
    10% {
        background-position: 
            1px 1px,
            -1px -1px,
            0px 20px;
        opacity: 0.85;
    }
    20% {
        background-position: 
            -1px 0px,
            2px 0px,
            0px 40px;
        opacity: 0.92;
    }
    30% {
        background-position: 
            2px -1px,
            -2px 1px,
            0px 60px;
        opacity: 0.88;
    }
    40% {
        background-position: 
            -1px 2px,
            1px -2px,
            0px 80px;
        opacity: 0.95;
    }
    50% {
        background-position: 
            1px -2px,
            -1px 2px,
            0px 100px;
        opacity: 0.9;
    }
    60% {
        background-position: 
            -2px -1px,
            2px 1px,
            0px 120px;
        opacity: 0.93;
    }
    70% {
        background-position: 
            2px 2px,
            -2px -2px,
            0px 140px;
        opacity: 0.87;
    }
    80% {
        background-position: 
            -1px 1px,
            1px -1px,
            0px 160px;
        opacity: 0.91;
    }
    90% {
        background-position: 
            1px -1px,
            -1px 1px,
            0px 180px;
        opacity: 0.94;
    }
    100% {
        background-position: 
            0px 0px,
            0px 0px,
            0px 200px;
        opacity: 0.9;
    }
}

/* 扫描线滚动效果 */
@keyframes scanline {
    0% {
        background-position-y: 
            0%,
            0%,
            0%;
    }
    100% {
        background-position-y: 
            0%,
            0%,
            100vh;
    }
}

/* 信号干扰效果 */
@keyframes interference {
    0%, 100% {
        filter: contrast(1.2) brightness(0.9);
    }
    10% {
        filter: contrast(1.5) brightness(1.1) hue-rotate(5deg);
    }
    20% {
        filter: contrast(0.9) brightness(0.8) saturate(0.8);
    }
    30% {
        filter: contrast(1.3) brightness(1.0) hue-rotate(-3deg);
    }
    40% {
        filter: contrast(1.1) brightness(0.95) saturate(1.1);
    }
    50% {
        filter: contrast(1.4) brightness(1.05) hue-rotate(2deg);
    }
    60% {
        filter: contrast(0.85) brightness(0.85) saturate(0.9);
    }
    70% {
        filter: contrast(1.25) brightness(1.0) hue-rotate(-5deg);
    }
    80% {
        filter: contrast(1.15) brightness(0.9) saturate(1.05);
    }
    90% {
        filter: contrast(1.35) brightness(1.1) hue-rotate(3deg);
    }
}

.dvdvideo {
    width: 180px;
    height: 120px;
    position: absolute;
    transition: all 0.016s linear;
    display: flex;
    justify-content: center;
    align-items: center;
}

.dvdvideo img {
    width: 200px;
    height: auto;
}
</style>