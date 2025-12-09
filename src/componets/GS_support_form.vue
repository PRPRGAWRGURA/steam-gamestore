<script>
import { ref, reactive, computed } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { supportAPI } from '@/utils/supportAPI';
export default {
  name: 'GS_support_form',
  props: {
    isDeveloperApplication: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const store = useUserStore()

    // 表单数据
    const formData = reactive({
      description: '',
      attachments: []
    });

    // 表单验证状态
    const formErrors = reactive({
      description: ''
    });

    // 上传文件状态
    const isUploading = ref(false);
    const uploadProgress = ref(0);

    // 提交状态
    const isSubmitting = ref(false);
    const submitSuccess = ref(false);
    
    // 发行商申请限制：24小时内只能提交一次
    const canSubmitDeveloperApplication = ref(true);
    const lastSubmitTime = ref(null);
    const countdown = ref(0);
    
    // 检查是否可以提交发行商申请
    const checkDeveloperApplicationLimit = () => {
      if (!props.isDeveloperApplication) return;
      
      // 从本地存储获取最后提交时间
      const storedTime = localStorage.getItem('developer_application_last_submit');
      if (storedTime) {
        const now = Date.now();
        const diff = now - parseInt(storedTime);
        const oneDay = 24 * 60 * 60 * 1000;
        
        if (diff < oneDay) {
          // 24小时内已提交过
          canSubmitDeveloperApplication.value = false;
          lastSubmitTime.value = parseInt(storedTime);
          // 计算剩余时间（毫秒）
          countdown.value = oneDay - diff;
        } else {
          // 超过24小时，可以提交
          canSubmitDeveloperApplication.value = true;
          localStorage.removeItem('developer_application_last_submit');
        }
      }
    };
    
    // 开始倒计时
    const startCountdown = () => {
      if (canSubmitDeveloperApplication.value) return;
      
      const timer = setInterval(() => {
        countdown.value -= 1000;
        
        if (countdown.value <= 0) {
          // 倒计时结束，可以重新提交
          canSubmitDeveloperApplication.value = true;
          lastSubmitTime.value = null;
          countdown.value = 0;
          localStorage.removeItem('developer_application_last_submit');
          clearInterval(timer);
        }
      }, 1000);
      
      // 组件卸载时清除定时器
      return () => clearInterval(timer);
    };
    
    // 格式化倒计时时间为 HH:MM:SS
    const formattedCountdown = computed(() => {
      if (countdown.value <= 0) return '';
      
      const hours = Math.floor(countdown.value / (1000 * 60 * 60));
      const minutes = Math.floor((countdown.value % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((countdown.value % (1000 * 60)) / 1000);
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    });
    
    // 初始化检查
    checkDeveloperApplicationLimit();
    // 开始倒计时
    startCountdown();

    // 表单验证
    const validateForm = () => {
      // 发行商申请不需要验证，直接通过
      if (props.isDeveloperApplication) {
        return true;
      }
      
      let isValid = true;

      // 重置错误信息
      formErrors.description = '';

      // 验证描述
      if (!formData.description.trim()) {
        formErrors.description = '请输入问题描述';
        isValid = false;
      }
      return isValid;
    };

    // 文件选择处理
    const handleFileChange = (event) => {
      const files = event.target.files;
      if (files.length > 0) {
        formData.attachments = Array.from(files);
      }
    };

    // 移除附件
    const removeAttachment = (index) => {
      formData.attachments.splice(index, 1);
    };

    // 提交表单
    const submitForm = async () => {
  // 检查发行商申请限制
  if (props.isDeveloperApplication && !canSubmitDeveloperApplication.value) {
    return;
  }
  
  // 发行商申请：自动设置描述为"申请发行商账号"
  if (props.isDeveloperApplication) {
    formData.description = '申请发行商账号';
  }
  
  if (!validateForm()) {
    return;
  }

  if(!store.currentUser) {
    alert('请先登录后再提交工单')
    return
  }

  const currentUser = store.currentUser

  isSubmitting.value = true;

  try {
    
    const response = await supportAPI.createTicket({
      user_id: currentUser.user_name,
      description: formData.description,
      attachments: props.isDeveloperApplication ? [] : formData.attachments, // 发行商申请不需要附件
      type: props.isDeveloperApplication ? '发行商申请' : undefined
    });

    if (response.success) {
      console.log('发布成功:', response.data);
      // 提交成功
      submitSuccess.value = true;
      
      // 如果是发行商申请，保存提交时间到本地存储
      if (props.isDeveloperApplication) {
        const now = Date.now();
        localStorage.setItem('developer_application_last_submit', now.toString());
        checkDeveloperApplicationLimit(); // 更新提交限制状态
      }

      // 重置表单
      setTimeout(() => {
        formData.description = '';
        formData.attachments = [];
        submitSuccess.value = false;
      }, 3000);
    } else {
      console.log('发布失败:', response.message || '未知错误');
    }
  } catch (error) {
    console.error('提交失败:', error);
    // 这里可以添加错误处理
  } finally {
    isSubmitting.value = false;
  }
};

    return {
      formData,
      formErrors,
      isUploading,
      uploadProgress,
      isSubmitting,
      submitSuccess,
      canSubmitDeveloperApplication,
      formattedCountdown,
      validateForm,
      handleFileChange,
      removeAttachment,
      submitForm
    };
  }
};
</script>

<template>
  <div class="gs-support-form">
    <h2 class="support-form-title">{{ isDeveloperApplication ? '提交发行者账号申请' : '提交支持请求' }}</h2>
    
    <!-- 成功提示 -->
    <div v-if="submitSuccess" class="success-message">
      <div class="success-icon">✅</div>
      <h3>提交成功！</h3>
      <p>我们已收到您的请求，将尽快处理。</p>
    </div>

    <!-- 表单 -->
    <form v-else class="support-form" @submit.prevent="submitForm">
      <!-- 发行商申请特殊处理：只显示提交按钮 -->
      <template v-if="isDeveloperApplication">
        <div class="developer-application-info">
          <p v-if="canSubmitDeveloperApplication">点击下方按钮提交发行商账号申请，我们将尽快处理您的请求。</p>
          <p v-else class="countdown-info">
            您已提交过发行商申请，请在 <span class="countdown-time">{{ formattedCountdown }}</span> 后再次尝试。
          </p>
        </div>
      </template>
      
      <!-- 普通支持请求：显示完整表单 -->
      <template v-else>
        <!-- 问题描述 -->
        <div class="form-group">
          <label for="description" class="form-label">问题描述 <span class="required">*</span></label>
          <textarea 
            id="description" 
            v-model="formData.description" 
            class="form-textarea"
            :class="{ 'error': formErrors.description }"
            rows="6"
            placeholder="请详细描述您遇到的问题，包括发生时间、具体表现等"
          ></textarea>
          <span v-if="formErrors.description" class="error-message">{{ formErrors.description }}</span>
        </div>

        <!-- 附件上传 -->
        <div class="form-group">
          <label class="form-label">附件上传（可选）</label>
          <div class="file-upload-area">
            <input 
              type="file" 
              id="attachments" 
              multiple 
              class="file-input"
              @change="handleFileChange"
            >
            <label for="attachments" class="file-input-label">
              <span class="upload-icon"></span>
              <span>点击此处上传</span>
            </label>
          </div>

          <!-- 已选择附件列表 -->
          <div v-if="formData.attachments.length > 0" class="attachments-list">
            <h4>已选择的附件：</h4>
            <div 
              v-for="(file, index) in formData.attachments" 
              :key="index"
              class="attachment-item"
            >
              <span class="attachment-name">{{ file.name }}</span>
              <span class="attachment-size">({{ (file.size / 1024).toFixed(2) }} KB)</span>
              <button 
                type="button" 
                class="remove-attachment"
                @click="removeAttachment(index)"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- 提交按钮 -->
      <div class="form-actions">
        <button 
          type="submit" 
          class="submit-button"
          :disabled="isSubmitting || (isDeveloperApplication && !canSubmitDeveloperApplication)"
        >
          <span v-if="isSubmitting" class="loading">⏳</span>
          {{ isSubmitting ? '提交中...' : 
             (isDeveloperApplication ? 
               (canSubmitDeveloperApplication ? '提交发行商申请' : '申请已提交，请稍后再试') : 
               '提交请求') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.gs-support-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.support-form-title {
  font-size: 2rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 30px;
  color: white;
  background: linear-gradient(45deg, #4299e1 0%, #6366f1 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.success-message {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.success-message h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.support-form {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 30px;
}

.form-group {
  margin-bottom: 25px;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: white;
  font-size: 0.95rem;
}



.required {
  color: #ef4444;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.form-input.error,
.form-select.error,
.form-textarea.error {
  border-color: #ef4444;
}

.form-textarea {
  resize: none;
  min-height: 150px;
}

.error-message {
  display: block;
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 5px;
}

.file-upload-area {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.03);
}

.file-upload-area:hover {
  border-color: #4299e1;
  background: rgba(66, 153, 225, 0.05);
}

.file-input {
  display: none;
}

.file-input-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
}

.upload-icon {
  width: 40px;
  height: 40px;
  background: url('/WebResources/file.svg') center/cover;
  font-size: 2.5rem;
}

.attachments-list {
  margin-top: 20px;
}

.attachments-list h4 {
  font-size: 1rem;
  margin-bottom: 10px;
  color: white;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-bottom: 10px;
}

.attachment-name {
  flex: 1;
  font-size: 0.95rem;
  color: white;
}

.attachment-size {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

.remove-attachment {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-attachment:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: #ef4444;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.submit-button {
  background: linear-gradient(45deg, #4299e1 0%, #6366f1 100%);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 40px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 6px rgba(66, 153, 225, 0.3);
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(66, 153, 225, 0.4);
  background: linear-gradient(45deg, #3182ce 0%, #4f46e5 100%);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading {
  animation: spin 1s linear infinite;
}

.developer-application-info {
  background: rgba(66, 153, 225, 0.1);
  border: 1px solid rgba(66, 153, 225, 0.3);
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  margin-bottom: 30px;
}

.developer-application-info p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  line-height: 1.6;
}

.countdown-info {
  color: rgba(239, 68, 68, 0.9);
  font-weight: 600;
}

.countdown-time {
  color: #f59e0b;
  font-size: 1.2rem;
  font-weight: 700;
  background: rgba(245, 158, 11, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

@keyframes spin {
  from { transform: rotate(0deg); }  to { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .gs-support-form {
    padding: 10px;
  }

  .support-form {
    padding: 20px;
  }

  .support-form-title {
    font-size: 1.5rem;
  }

  .file-upload-area {
    padding: 20px;
  }

  .file-input-label {
    font-size: 1rem;
  }

  .upload-icon {
    font-size: 2rem;
  }
}
</style>