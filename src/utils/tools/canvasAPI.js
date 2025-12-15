// canvasAPI.js - Canvas相关工具函数封装

/**
 * 图片裁剪工具类
 */
export class ImageCropper {
  constructor() {
    // 裁剪相关状态
    this.cropParams = { x: 0, y: 0, width: 200, height: 200 };
    this.imageInfo = { width: 0, height: 0, displayWidth: 0, displayHeight: 0, offsetX: 0, offsetY: 0, scale: 1 };
    this.containerInfo = { width: 0, height: 0 };
    
    // 回调函数
    this.onCropUpdate = null;
  }

  /**
   * 初始化裁剪参数
   * @param {HTMLImageElement} imageElement - 图片元素
   * @param {HTMLElement} containerElement - 容器元素
   */
  init(imageElement, containerElement) {
    if (!imageElement || !containerElement) {
      console.error('图片元素或容器元素不能为空');
      return;
    }

    // 获取图片实际尺寸
    this.imageInfo = {
      width: imageElement.naturalWidth,
      height: imageElement.naturalHeight
    };
    
    // 获取容器尺寸
    this.containerInfo = {
      width: containerElement.clientWidth,
      height: containerElement.clientHeight
    };
    
    // 计算图片在容器中的缩放比例
    const scale = Math.min(
      this.containerInfo.width / this.imageInfo.width,
      this.containerInfo.height / this.imageInfo.height
    );
    
    // 更新图片实际显示尺寸和偏移量
    this.imageInfo.displayWidth = this.imageInfo.width * scale;
    this.imageInfo.displayHeight = this.imageInfo.height * scale;
    this.imageInfo.offsetX = (this.containerInfo.width - this.imageInfo.displayWidth) / 2;
    this.imageInfo.offsetY = (this.containerInfo.height - this.imageInfo.displayHeight) / 2;
    this.imageInfo.scale = scale;
    
    // 初始化裁剪框位置和大小
    const initialSize = Math.min(200, this.containerInfo.width * 0.6, this.containerInfo.height * 0.6);
    this.cropParams = {
      x: (this.containerInfo.width - initialSize) / 2,
      y: (this.containerInfo.height - initialSize) / 2,
      width: initialSize,
      height: initialSize
    };
  }

  /**
   * 重置裁剪参数
   */
  reset() {
    const initialSize = Math.min(200, this.containerInfo.width * 0.6, this.containerInfo.height * 0.6);
    this.cropParams = {
      x: (this.containerInfo.width - initialSize) / 2,
      y: (this.containerInfo.height - initialSize) / 2,
      width: initialSize,
      height: initialSize
    };
  }

  /**
   * 计算拖拽后的裁剪框位置
   * @param {number} deltaX - X轴拖拽距离
   * @param {number} deltaY - Y轴拖拽距离
   * @returns {Object} 更新后的裁剪参数
   */
  calculateDragPosition(deltaX, deltaY) {
    // 计算新位置
    let newX = this.cropParams.x + deltaX;
    let newY = this.cropParams.y + deltaY;
    
    // 限制裁剪框不超出图片实际显示范围
    const minX = this.imageInfo.offsetX;
    const minY = this.imageInfo.offsetY;
    const maxX = this.imageInfo.offsetX + this.imageInfo.displayWidth - this.cropParams.width;
    const maxY = this.imageInfo.offsetY + this.imageInfo.displayHeight - this.cropParams.height;
    
    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));
    
    // 更新裁剪参数
    this.cropParams = {
      ...this.cropParams,
      x: newX,
      y: newY
    };
    
    return this.cropParams;
  }

  /**
   * 计算调整大小后的裁剪框参数
   * @param {number} deltaX - X轴调整距离
   * @param {number} deltaY - Y轴调整距离
   * @param {string} handle - 调整手柄位置 (top-left, top-right, bottom-left, bottom-right)
   * @returns {Object} 更新后的裁剪参数
   */
  calculateResizeParams(deltaX, deltaY, handle) {
    // 根据不同手柄位置调整delta方向
    let adjustedDeltaX = deltaX;
    let adjustedDeltaY = deltaY;
    
    // 左上角和左下角手柄：向左/上移动应该增大裁剪框
    if (handle.includes('left')) {
      adjustedDeltaX = -deltaX;
    }
    // 左上角和右上角手柄：向上移动应该增大裁剪框
    if (handle.includes('top')) {
      adjustedDeltaY = -deltaY;
    }
    
    // 计算新的宽度和高度（保持1:1比例）
    const deltaSize = Math.abs(adjustedDeltaX) > Math.abs(adjustedDeltaY) ? adjustedDeltaX : adjustedDeltaY;
    let newWidth = this.cropParams.width + deltaSize;
    let newHeight = this.cropParams.height + deltaSize;
    
    // 限制最小和最大尺寸
    const minSize = 50;
    const maxSize = Math.min(this.containerInfo.width, this.containerInfo.height);
    newWidth = Math.max(minSize, Math.min(newWidth, maxSize));
    newHeight = newWidth; // 保持1:1比例
    
    // 根据拖拽的手柄调整位置
    let newX = this.cropParams.x;
    let newY = this.cropParams.y;
    
    if (handle.includes('left')) {
      newX += this.cropParams.width - newWidth;
    }
    if (handle.includes('top')) {
      newY += this.cropParams.height - newHeight;
    }
    
    // 限制裁剪框不超出图片实际显示范围
    const minX = this.imageInfo.offsetX;
    const minY = this.imageInfo.offsetY;
    const maxX = this.imageInfo.offsetX + this.imageInfo.displayWidth - newWidth;
    const maxY = this.imageInfo.offsetY + this.imageInfo.displayHeight - newHeight;
    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));
    
    // 再次检查并限制最大尺寸，确保不超出图片范围
    const actualMaxWidth = this.imageInfo.displayWidth - (newX - this.imageInfo.offsetX);
    const actualMaxHeight = this.imageInfo.displayHeight - (newY - this.imageInfo.offsetY);
    const finalMaxSize = Math.min(newWidth, actualMaxWidth, actualMaxHeight);
    newWidth = finalMaxSize;
    newHeight = finalMaxSize;
    
    // 更新裁剪参数
    this.cropParams = {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight
    };
    
    return this.cropParams;
  }

  /**
   * 执行图片裁剪
   * @param {HTMLImageElement} imageElement - 图片元素
   * @returns {string} 裁剪后的图片DataURL
   */
  cropImage(imageElement) {
    if (!imageElement) {
      console.error('图片元素不能为空');
      return null;
    }
    
    // 创建canvas用于裁剪
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置canvas尺寸为裁剪框尺寸
    canvas.width = this.cropParams.width;
    canvas.height = this.cropParams.height;
    
    // 计算裁剪区域在原始图片中的位置和尺寸
    // 考虑图片在容器中的偏移量和缩放比例
    const relativeX = this.cropParams.x - this.imageInfo.offsetX;
    const relativeY = this.cropParams.y - this.imageInfo.offsetY;
    
    // 计算原始图片上的坐标
    const sourceX = relativeX / this.imageInfo.scale;
    const sourceY = relativeY / this.imageInfo.scale;
    const sourceWidth = this.cropParams.width / this.imageInfo.scale;
    const sourceHeight = this.cropParams.height / this.imageInfo.scale;
    
    // 执行裁剪
    ctx.drawImage(
      imageElement,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, this.cropParams.width, this.cropParams.height
    );
    
    // 将裁剪结果转换为dataURL
    return canvas.toDataURL('image/jpeg', 0.82);
  }

  /**
   * 将DataURL转换为File对象
   * @param {string} dataURL - 图片DataURL
   * @param {string} filename - 文件名
   * @returns {File} File对象
   */
  dataURLtoFile(dataURL, filename) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  /**
   * 获取当前裁剪参数
   * @returns {Object} 裁剪参数
   */
  getCropParams() {
    return { ...this.cropParams };
  }

  /**
   * 设置裁剪更新回调
   * @param {Function} callback - 回调函数
   */
  setOnCropUpdate(callback) {
    this.onCropUpdate = callback;
  }
}



/**
 * 将File对象转换为DataURL
 * @param {File} file - 文件对象
 * @returns {Promise<string>} DataURL
 */
export const fileToDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

/**
 * 获取图片信息
 * @param {HTMLImageElement} imageElement - 图片元素
 * @returns {Object} 图片信息
 */
export const getImageInfo = (imageElement) => {
  if (!imageElement) {
    return null;
  }
  return {
    width: imageElement.naturalWidth,
    height: imageElement.naturalHeight
  };
};