<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { ImageCropper } from '@/utils/tools/canvasAPI';

// 组件属性
const props = defineProps({
  // 原始图片URL
  imageUrl: {
    type: String,
    required: true
  },
  // 裁剪框初始大小
  initialSize: {
    type: Number,
    default: 200
  }
});

// 组件事件
const emit = defineEmits(['confirm', 'cancel']);

// 裁剪相关状态
const croppedImage = ref(null);
const previewImage = ref(null);
const imageContainer = ref(null);
const isDragging = ref(false);
const isResizing = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const resizeStart = ref({ x: 0, y: 0 });
const cropParams = ref({ x: 0, y: 0, width: props.initialSize, height: props.initialSize });
const resizeHandle = ref('');

// 创建裁剪器实例
const cropper = new ImageCropper();

// 初始化裁剪参数
const resetCropParams = () => {
  cropper.reset();
  cropParams.value = {
    x: 0,
    y: 0,
    width: props.initialSize,
    height: props.initialSize
  };
  isDragging.value = false;
  isResizing.value = false;
  resizeHandle.value = '';
};

// 监听图片URL变化，重置裁剪参数
watch(
  () => props.imageUrl,
  () => {
    resetCropParams();
  }
);

// 监听图片加载完成事件
const onImageLoad = () => {
  if (croppedImage.value && imageContainer.value) {
    // 使用裁剪器初始化
    cropper.init(croppedImage.value, imageContainer.value);
    // 更新裁剪参数
    cropParams.value = cropper.getCropParams();
    // 更新预览
    updateCropPreview();
  }
};

// 开始拖拽
const startDrag = (e) => {
  isDragging.value = true;
  dragStart.value = {
    x: e.clientX - cropParams.value.x,
    y: e.clientY - cropParams.value.y
  };
  
  // 添加全局事件监听
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

// 拖拽中
const onDrag = (e) => {
  if (!isDragging.value) return;
  
  // 计算拖拽距离
  const deltaX = e.clientX - (dragStart.value.x + cropParams.value.x);
  const deltaY = e.clientY - (dragStart.value.y + cropParams.value.y);
  
  // 使用裁剪器计算新位置
  const newParams = cropper.calculateDragPosition(deltaX, deltaY);
  cropParams.value = newParams;
  
  // 更新预览
  updateCropPreview();
};

// 停止拖拽
const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
};

// 开始调整大小
const startResize = (e) => {
  isResizing.value = true;
  resizeStart.value = {
    x: e.clientX,
    y: e.clientY
  };
  resizeHandle.value = e.target.dataset.handle;
  
  // 添加全局事件监听
  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', stopResize);
};

// 调整大小中
const onResize = (e) => {
  if (!isResizing.value) return;
  
  // 计算调整距离
  const deltaX = e.clientX - resizeStart.value.x;
  const deltaY = e.clientY - resizeStart.value.y;
  
  // 使用裁剪器计算新尺寸
  const newParams = cropper.calculateResizeParams(deltaX, deltaY, resizeHandle.value);
  cropParams.value = newParams;
  
  // 更新预览
  updateCropPreview();
  
  // 更新起始位置
  resizeStart.value = {
    x: e.clientX,
    y: e.clientY
  };
};

// 停止调整大小
const stopResize = () => {
  isResizing.value = false;
  resizeHandle.value = '';
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);
};

// 更新裁剪预览
const updateCropPreview = () => {
  if (!croppedImage.value || !previewImage.value) return;
  
  // 使用裁剪器执行裁剪
  const croppedDataURL = cropper.cropImage(croppedImage.value);
  if (croppedDataURL) {
    previewImage.value.src = croppedDataURL;
  }
};

// 确认裁剪
const confirmCrop = () => {
  if (!croppedImage.value) return;
  
  // 使用裁剪器执行最终裁剪
  const croppedDataURL = cropper.cropImage(croppedImage.value);
  if (!croppedDataURL) return;
  
  // 使用裁剪器将DataURL转换为File对象
  const timestamp = Date.now();
  const filename = `avatar_${timestamp}.jpg`;
  const croppedFile = cropper.dataURLtoFile(croppedDataURL, filename);
  
  // 发送确认事件，传递裁剪结果
  emit('confirm', {
    dataURL: croppedDataURL,
    file: croppedFile
  });
};

// 取消裁剪
const cancelCrop = () => {
  emit('cancel');
};

// 组件卸载时清理事件监听
onUnmounted(() => {
  // 清理拖拽和调整大小的事件监听
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);
});
</script>

<template>
  <div class="cropper-avatar-section">
    <div class="cropper-avatar-container">
      <div class="container-left" ref="imageContainer">
        <img 
          :src="imageUrl" 
          class="cropped-avatar-image" 
          ref="croppedImage"
          @load="onImageLoad"
        />
        <div 
          class="crop-frame" 
          :style="{
            left: cropParams.x + 'px',
            top: cropParams.y + 'px',
            width: cropParams.width + 'px',
            height: cropParams.height + 'px'
          }"
          @mousedown="startDrag"
        >
          <div 
            class="crop-handle top-left" 
            data-handle="top-left"
            @mousedown.stop="startResize"
          ></div>
          <div 
            class="crop-handle top-right" 
            data-handle="top-right"
            @mousedown.stop="startResize"
          ></div>
          <div 
            class="crop-handle bottom-left" 
            data-handle="bottom-left"
            @mousedown.stop="startResize"
          ></div>
          <div 
            class="crop-handle bottom-right" 
            data-handle="bottom-right"
            @mousedown.stop="startResize"
          ></div>
        </div>
      </div>
      <div class="container-right">
        <button @click="cancelCrop" class="action-btn">
          <img src="/WebResources/close.svg" class="icon action" alt="">
          <img src="/WebResources/close_red.svg" class="icon close" alt="">
        </button>
        <div class="cropper-preview">
          <img 
            class="cropped-preview-image" 
            ref="previewImage"
          />
          <div class="crop-info1">
            裁剪区域：{{ cropParams.width }}px x {{ cropParams.height }}px
          </div>
          <div class="crop-info2">
            裁剪位置：{{ cropParams.x }}px, {{ cropParams.y }}px
          </div>
        </div>
        <button class="cropping" @click="confirmCrop">
          确认裁剪
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cropper-avatar-section {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.599);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.cropper-avatar-container {
  margin-top: 100px;
  padding: 0;
  position: relative;
  display: flex;
  width: 1220px;
  height: 900px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.container-left {
  flex: 2;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  background-color: rgba(0, 0, 0, 0.8);
}

.cropped-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* 禁止图片被选中和拖动 */
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  pointer-events: none;
}

.container-right {
  background-color: #1b2838;
  flex: 1;
  height: 100%;
  position: relative;
}

/* 裁剪框样式 */
.crop-frame {
  position: absolute;
  border: 2px solid #1a9efe;
  background-color: rgba(255, 255, 255, 0.1);
  cursor: move;
  box-sizing: border-box;
}

/* 裁剪手柄样式 */
.crop-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: #1a9efe;
  border: 2px solid white;
  border-radius: 50%;
  cursor: nwse-resize;
  box-sizing: border-box;
  z-index: 10;
}

/* 四个角的手柄位置 */
.crop-handle.top-left {
  top: -6px;
  left: -6px;
}

.crop-handle.top-right {
  top: -6px;
  right: -6px;
}

.crop-handle.bottom-left {
  bottom: -6px;
  left: -6px;
}

.crop-handle.bottom-right {
  bottom: -6px;
  right: -6px;
}

/* 预览区域样式 */
.cropper-preview {
  width: 380px;
  height: 380px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
  border-radius: 8px;
  position: relative;
  top: 45%;
  margin: 0 auto;
  transform: translateY(-50%);
  text-align: center;
  line-height: 700px;
  font-size: 24px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
}

/* 预览图片样式 */
.cropped-preview-image {
  width: 100%;
  height: 100%;
}

.crop-info1 {
  position: absolute;
  bottom: 10px;
  left: 10px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.crop-info2 {
  position: absolute;
  bottom: -10px;
  left: 10px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.action-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: white;
  transition: color 0.3s ease;
}

.icon {
  width: 30px;
  height: 30px;
}

.icon.action {
  display: block;
}

.icon.close {
  display: none;
}

.action-btn:hover .icon.action {
  display: none;
}

.action-btn:hover .icon.close {
  display: block;
}

.cropping {
  position: absolute;
  bottom: 20px;
  width: 300px;
  left: calc(50% - 150px);
  padding: 12px 25px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  background: linear-gradient(45deg, #4299e1 0%, #6366f1 100%);
  color: white;
}

.cropping::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.cropping:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(66, 153, 225, 0.4);
  background: linear-gradient(45deg, #3182ce 0%, #4f46e5 100%);
}

.cropping:hover::before {
  left: 100%;
}

.cropping:active:not(:disabled) {
  transform: translateY(0);
}
</style>
