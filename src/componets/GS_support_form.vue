<script>
import { ref, reactive } from 'vue';

export default {
  name: 'GS_support_form',
  setup() {
    // 表单数据
    const formData = reactive({
      issueType: '',
      title: '',
      description: '',
      attachments: []
    });

    // 表单验证状态
    const formErrors = reactive({
      issueType: '',
      title: '',
      description: ''
    });

    // 上传文件状态
    const isUploading = ref(false);
    const uploadProgress = ref(0);

    // 提交状态
    const isSubmitting = ref(false);
    const submitSuccess = ref(false);

    // 问题类型选项
    const issueTypes = [
      { value: 'account', label: '账户问题' },
      { value: 'game', label: '游戏相关' },
      { value: 'payment', label: '支付问题' },
      { value: 'technical', label: '技术支持' },
      { value: 'other', label: '其他问题' }
    ];

    // 表单验证
    const validateForm = () => {
      let isValid = true;

      // 重置错误信息
      formErrors.issueType = '';
      formErrors.title = '';
      formErrors.description = '';

      // 验证问题类型
      if (!formData.issueType) {
        formErrors.issueType = '请选择问题类型';
        isValid = false;
      }

      // 验证标题
      if (!formData.title.trim()) {
        formErrors.title = '请输入问题标题';
        isValid = false;
      } else if (formData.title.length < 5) {
        formErrors.title = '标题至少需要5个字符';
        isValid = false;
      }

      // 验证描述
      if (!formData.description.trim()) {
        formErrors.description = '请输入问题描述';
        isValid = false;
      } else if (formData.description.length < 20) {
        formErrors.description = '描述至少需要20个字符';
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
      if (!validateForm()) {
        return;
      }

      isSubmitting.value = true;

      try {
        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 这里可以添加实际的API调用
        // 例如：await api.submitSupportTicket(formData);

        // 提交成功
        submitSuccess.value = true;

        // 重置表单
        setTimeout(() => {
          formData.issueType = '';
          formData.title = '';
          formData.description = '';
          formData.attachments = [];
          submitSuccess.value = false;
        }, 3000);
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
      issueTypes,
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
    <h2 class="support-form-title">提交支持请求</h2>
    
    <!-- 成功提示 -->
    <div v-if="submitSuccess" class="success-message">
      <div class="success-icon">✅</div>
      <h3>提交成功！</h3>
      <p>我们已收到您的请求，将尽快处理。</p>
    </div>

    <!-- 表单 -->
    <form v-else class="support-form" @submit.prevent="submitForm">
      <!-- 问题类型 -->
      <div class="form-group">
        <label for="issueType" class="form-label">问题类型 <span class="required">*</span></label>
        <select 
          id="issueType" 
          v-model="formData.issueType" 
          class="form-select"
          :class="{ 'error': formErrors.issueType }"
        >
          <option value="">请选择问题类型</option>
          <option 
            v-for="type in issueTypes" 
            :key="type.value" 
            :value="type.value"
          >
            {{ type.label }}
          </option>
        </select>
        <span v-if="formErrors.issueType" class="error-message">{{ formErrors.issueType }}</span>
      </div>

      <!-- 问题标题 -->
      <div class="form-group">
        <label for="title" class="form-label">问题标题 <span class="required">*</span></label>
        <input 
          type="text" 
          id="title" 
          v-model="formData.title" 
          class="form-input"
          :class="{ 'error': formErrors.title }"
          placeholder="请简要描述您的问题"
        >
        <span v-if="formErrors.title" class="error-message">{{ formErrors.title }}</span>
      </div>

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
            <span class="upload-icon">📎</span>
            <span>点击或拖拽文件到此处上传</span>
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

      <!-- 提交按钮 -->
      <div class="form-actions">
        <button 
          type="submit" 
          class="submit-button"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" class="loading">⏳</span>
          {{ isSubmitting ? '提交中...' : '提交请求' }}
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
  resize: vertical;
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

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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