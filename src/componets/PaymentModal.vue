<template>
  <div class="payment-modal-overlay" v-if="visible">
    <div class="payment-modal">
      <!-- 支付进度指示器 -->
      <div class="payment-header">
        <h3>确认支付</h3>
        <div class="progress-container">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: progressWidth + '%' }"
            ></div>
          </div>
          <div class="progress-steps">
            <div 
              class="progress-step" 
              :class="{ active: currentStep >= 1 }"
            >
              选择付款方式
            </div>
            <div 
              class="progress-step" 
              :class="{ active: currentStep >= 2 }"
            >
              付款中
            </div>
            <div 
              class="progress-step" 
              :class="{ active: currentStep >= 3 }"
            >
              付款完成
            </div>
          </div>
        </div>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <!-- 支付内容 -->
      <div class="payment-content">
        <!-- 选择付款方式 -->
        <div v-if="currentStep === 1" class="payment-step">
          <h4>选择付款方式</h4>
          <div class="payment-methods">
            <div 
              class="payment-method" 
              v-for="method in paymentMethods" 
              :key="method.id"
              :class="{ selected: selectedMethod === method.id }"
              @click="selectMethod(method.id)"
            >
              <div class="method-icon">{{ method.icon }}</div>
              <div class="method-info">
                <div class="method-name">{{ method.name }}</div>
                <div class="method-desc">{{ method.description }}</div>
              </div>
              <div class="method-select">
                <div v-if="selectedMethod === method.id" class="selected-indicator">✓</div>
              </div>
            </div>
          </div>
          <div class="order-summary">
            <h5>订单摘要</h5>
            <div class="order-item" v-for="item in currentOrderItems" :key="item.orderId">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-price">¥{{ item.price.toFixed(2) }}</div>
            </div>
            <div class="order-total">
              <div class="total-label">总计</div>
              <div class="total-price">¥{{ totalPrice.toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <!-- 付款中 -->
        <div v-if="currentStep === 2" class="payment-step">
          <h4>付款中</h4>
          <div class="payment-processing">
            <div class="qr-code-container">
              <div class="qr-code">
                <!-- 这里可以放置实际的二维码图片 -->
                <div class="qr-placeholder">
                  <canvas ref="qrcodeCanvas" width="200" height="200"></canvas>
                </div>
                <div class="qr-amount">¥{{ totalPrice.toFixed(2) }}</div>
              </div>
              <div class="payment-info">
                <p>请使用 {{ selectedMethodName }} 扫描二维码付款</p>
                <p class="payment-note">付款完成后点击下方按钮确认</p>
              </div>
            </div>
            <div class="loading-spinner" v-if="isProcessing">
              <div class="spinner"></div>
              <p>处理中，请稍候...</p>
            </div>
          </div>
        </div>

        <!-- 付款完成 -->
        <div v-if="currentStep === 3" class="payment-step">
          <h4>付款完成</h4>
          <div class="payment-success">
            <div class="success-icon">✓</div>
            <h5>感谢购买！</h5>
            <p>您的订单已支付成功</p>
            <p class="success-note">游戏已添加到您的游戏库</p>
          </div>
        </div>
      </div>

      <!-- 支付按钮 -->
      <div class="payment-footer">
        <button 
          v-if="currentStep === 1" 
          class="cancel-btn" 
          @click="closeModal"
        >
          取消
        </button>
        <button 
          v-if="currentStep === 1" 
          class="continue-btn" 
          :disabled="!selectedMethod"
          @click="goToNextStep"
        >
          继续付款
        </button>
        <button 
          v-if="currentStep === 2" 
          class="cancel-btn" 
          @click="goToPreviousStep"
        >
          上一步
        </button>
        <button 
          v-if="currentStep === 2" 
          class="continue-btn" 
          :disabled="isProcessing"
          @click="confirmPayment"
        >
          {{ isProcessing ? '处理中...' : '确认支付' }}
        </button>
        <button 
          v-if="currentStep === 3" 
          class="finish-btn" 
          @click="closeModal"
        >
          完成
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { gameitemAPI } from '@/utils/api/gameitemAPI'
import QRCode from 'qrcode'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  orderItems: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['close', 'confirm'])

// 响应式数据
const currentStep = ref(1)
const selectedMethod = ref(null)
const isProcessing = ref(false)
const isRefreshingPrice = ref(false)
const currentOrderItems = ref([])
const qrCodeData = ref('')
const qrcodeCanvas = ref(null)
const paymentMethods = ref([
  {
    id: 'alipay',
    name: '支付宝',
    description: '推荐使用支付宝APP扫码付款',
    icon: '💳'
  },
  {
    id: 'wechat',
    name: '微信支付',
    description: '使用微信APP扫码付款',
    icon: '💚'
  },
  {
    id: 'creditcard',
    name: '信用卡',
    description: '支持Visa、MasterCard、银联等',
    icon: '💳'
  }
])

// 计算属性
const progressWidth = computed(() => {
  return ((currentStep.value - 1) / 2) * 100
})

const totalPrice = computed(() => {
  return currentOrderItems.value.reduce((sum, item) => sum + item.price, 0)
})

const selectedMethodName = computed(() => {
  const method = paymentMethods.value.find(m => m.id === selectedMethod.value)
  return method ? method.name : ''
})

// 方法
const closeModal = () => {
  resetState()
  emit('close')
}

const selectMethod = (methodId) => {
  selectedMethod.value = methodId
}

const goToNextStep = async () => {
  if (!selectedMethod.value) return
  
  // 再次刷新价格，确保进入付款中状态时显示的是最新价格
  await refreshPrices()
  // 先设置 currentStep 为 2，这样 canvas 元素会渲染到 DOM 中
  currentStep.value = 2
  // 等待 DOM 更新，确保 canvas 元素已渲染
  await nextTick()
  // 生成新的二维码
  await generateQRCode()
  isProcessing.value = false
}

const goToPreviousStep = () => {
  currentStep.value = 1
  isProcessing.value = false
}

const confirmPayment = async () => {
  if (isProcessing.value) return
  
  isProcessing.value = true
  
  // 模拟支付处理
  setTimeout(async () => {
    try {
      // 触发支付确认
      emit('confirm')
      currentStep.value = 3
    } catch (error) {
      console.error('支付失败:', error)
      alert('支付失败，请重试')
      currentStep.value = 2
    } finally {
      isProcessing.value = false
    }
  }, 2000)
}

// 刷新价格函数
const refreshPrices = async () => {
  if (props.orderItems.length === 0) {
    currentOrderItems.value = []
    return
  }
  
  try {
    isRefreshingPrice.value = true
    
    // 获取每个游戏的当前价格
    const updatedItems = await Promise.all(
      props.orderItems.map(async (item) => {
        const gameResult = await gameitemAPI.getGameById(item.gameId)
        if (gameResult.success && typeof gameResult.data.game_price === 'number') {
          const currentPrice = gameResult.data.game_price * (gameResult.data.game_discount || 1)
          return {
            ...item,
            price: currentPrice
          }
        }
        return item
      })
    )
    
    currentOrderItems.value = updatedItems
  } catch (error) {
    console.error('刷新价格失败:', error)
    // 失败时使用原始价格
    currentOrderItems.value = [...props.orderItems]
  } finally {
    isRefreshingPrice.value = false
  }
}

// 生成随机二维码数据
const generateQRCode = async () => {
  // 生成随机的支付链接或订单号
  const orderId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  const amount = totalPrice.value.toFixed(2)
  const timestamp = Date.now()
  const method = selectedMethod.value || 'alipay'
  
  // 构造模拟的支付链接
  const paymentUrl = `${method}://pay?orderId=${orderId}&amount=${amount}&time=${timestamp}&merchant=gamestore`
  
  // 存储二维码数据
  qrCodeData.value = paymentUrl
  
  // 等待DOM更新后生成二维码
  await nextTick()
  
  // 生成真实的二维码
  try {
    if (qrcodeCanvas.value) {
      await QRCode.toCanvas(qrcodeCanvas.value, paymentUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
    }
  } catch (error) {
    console.error('生成二维码失败:', error);
  }
}

const resetState = () => {
  currentStep.value = 1
  selectedMethod.value = null
  isProcessing.value = false
  currentOrderItems.value = [...props.orderItems]
  // 不要在这里调用 generateQRCode，因为此时 canvas 元素还没有渲染
}

// 监听可见性变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    resetState()
    refreshPrices()
  }
})

// 监听订单项目变化
watch(() => props.orderItems, (newVal) => {
  if (newVal && newVal.length !== currentOrderItems.value.length) {
    refreshPrices()
  }
}, { deep: true })
</script>

<style scoped>
.payment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.payment-modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.payment-header {
  position: relative;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.payment-header h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.progress-container {
  margin-bottom: 10px;
}

.progress-bar {
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: #4CAF50;
  transition: width 0.3s ease;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.progress-step {
  flex: 1;
  text-align: center;
  padding: 5px;
  transition: all 0.3s ease;
}

.progress-step.active {
  color: #4CAF50;
  font-weight: bold;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background: #f0f0f0;
}

.payment-content {
  padding: 20px;
}

.payment-step h4 {
  margin: 0 0 20px 0;
  color: #333;
}

.payment-methods {
  margin-bottom: 20px;
}

.payment-method {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-method:hover {
  border-color: #4CAF50;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.1);
}

.payment-method.selected {
  border-color: #4CAF50;
  background: rgba(76, 175, 80, 0.05);
}

.method-icon {
  font-size: 24px;
  margin-right: 15px;
}

.method-info {
  flex: 1;
}

.method-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.method-desc {
  font-size: 12px;
  color: #666;
}

.method-select {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.payment-method.selected .method-select {
  background: #4CAF50;
  border-color: #4CAF50;
  color: white;
}

.selected-indicator {
  font-weight: bold;
}

.order-summary {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
}

.order-summary h5 {
  margin: 0 0 10px 0;
  color: #333;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.order-total {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
  font-weight: bold;
  font-size: 16px;
}

.qr-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.qr-code {
  text-align: center;
  margin-bottom: 20px;
}

.qr-placeholder {
  width: 200px;
  height: 200px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
}

.qr-amount {
  font-weight: bold;
  font-size: 18px;
  color: #333;
}

.payment-info {
  text-align: center;
  color: #666;
}

.payment-note {
  font-size: 12px;
  margin-top: 5px;
  color: #999;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.payment-success {
  text-align: center;
  padding: 20px;
}

.success-icon {
  width: 60px;
  height: 60px;
  background: #4CAF50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 20px;
}

.payment-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #f9f9f9;
}

.continue-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background: #4CAF50;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.continue-btn:hover:not(:disabled) {
  background: #45a049;
}

.continue-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.finish-btn {
  padding: 10px 30px;
  border: none;
  border-radius: 4px;
  background: #4CAF50;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.finish-btn:hover {
  background: #45a049;
}

.payment-success h5 {
  margin: 0 0 10px 0;
  color: #333;
}

.success-note {
  font-size: 12px;
  color: #666;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .payment-modal {
    width: 95%;
    margin: 20px;
  }
  
  .payment-method {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .method-select {
    align-self: flex-end;
    margin-top: -30px;
  }
}
</style>