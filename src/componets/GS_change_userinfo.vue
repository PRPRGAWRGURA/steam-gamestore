<script setup>
import normalUserAPI from '@/utils/normalUserAPI';
import { useUserStore } from '@/stores/userStore';
import { computed, ref, reactive } from 'vue';

const userStore = useUserStore();

// 使用computed从Pinia store获取当前用户信息
const currentUser = computed(() => {
  return userStore.currentUser || null;
});

// 当前用户名
const currentUsername = computed(() => {
  return userStore.currentUser?.user_name || '';
});

// 修改密码表单数据
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 密码可见性状态
const showPasswords = reactive({
  oldPassword: false,
  newPassword: false,
  confirmPassword: false
});

// 密码验证错误信息
const passwordValidationErrors = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 操作状态和消息
const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// 修改头像相关状态
const avatarFile = ref(null);
const avatarPreview = ref('');
const isUploading = ref(false);

// 修改用户名相关状态
const changeNameForm = reactive({
  newUserName: ''
});
const isChangingName = ref(false);
const nameValidationErrors = reactive({
  newUserName: ''
});

// 初始化头像预览
if (currentUser.value?.user_image) {
  avatarPreview.value = currentUser.value.user_image;
}

/**
 * 验证密码格式
 * @param {string} password - 要验证的密码
 * @returns {string} 错误信息，为空表示验证通过
 */
const validatePassword = (password) => {
  // 检查长度
  if (password.length < 8) {
    return '密码长度至少为8个字符';
  }
  if (password.length > 25) {
    return '密码长度不能超过25个字符';
  }
  
  // 检查是否包含字母
  if (!/[a-zA-Z]/.test(password)) {
    return '密码必须包含至少一个字母';
  }
  
  // 检查是否包含数字
  if (!/[0-9]/.test(password)) {
    return '密码必须包含至少一个数字';
  }
  
  // 检查是否包含特殊字符
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return '密码必须包含至少一个特殊字符';
  }
  
  return '';
};

/**
 * 验证确认密码是否与新密码一致
 * @returns {string} 错误信息，为空表示验证通过
 */
const validateConfirmPassword = () => {
  if (passwordForm.newPassword && 
      passwordForm.confirmPassword !== passwordForm.newPassword) {
    return '两次输入的新密码不一致';
  }
  return '';
};

/**
 * 处理密码输入，实时验证
 * @param {string} field - 字段名
 * @param {string} value - 输入值
 */
const handlePasswordInput = (field, value) => {
  passwordForm[field] = value;
  
  // 根据字段类型进行验证
  if (field === 'newPassword') {
    passwordValidationErrors.newPassword = validatePassword(value);
    // 重新验证确认密码
    passwordValidationErrors.confirmPassword = validateConfirmPassword();
  } else if (field === 'confirmPassword') {
    passwordValidationErrors.confirmPassword = validateConfirmPassword();
  }
};

/**
 * 切换密码可见性
 * @param {string} field - 字段名
 */
const togglePasswordVisibility = (field) => {
  showPasswords[field] = !showPasswords[field];
};

/**
 * 重置密码表单
 */
const resetPasswordForm = () => {
  passwordForm.oldPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
  
  passwordValidationErrors.oldPassword = '';
  passwordValidationErrors.newPassword = '';
  passwordValidationErrors.confirmPassword = '';
};

/**
 * 提交修改密码表单
 */
const submitChangePassword = async () => {
  // 清空之前的消息
  successMessage.value = '';
  errorMessage.value = '';
  
  // 验证旧密码不为空
  if (!passwordForm.oldPassword) {
    passwordValidationErrors.oldPassword = '请输入当前密码';
    return;
  }
  
  // 验证新密码
  passwordValidationErrors.newPassword = validatePassword(passwordForm.newPassword);
  if (passwordValidationErrors.newPassword) {
    return;
  }
  
  // 验证确认密码
  passwordValidationErrors.confirmPassword = validateConfirmPassword();
  if (passwordValidationErrors.confirmPassword) {
    return;
  }
  
  // 检查新旧密码是否相同
  if (passwordForm.oldPassword === passwordForm.newPassword) {
    errorMessage.value = '新密码不能与当前密码相同';
    return;
  }
  
  try {
    isSubmitting.value = true;
    
    // 检查用户名是否存在
    if (!currentUsername.value) {
      errorMessage.value = '未找到当前登录用户信息';
      console.error('当前用户名为空');
      return;
    }
    
    console.log('开始验证旧密码，用户:', currentUsername.value);
    
    // 验证旧密码是否正确（通过登录接口验证）
    const loginResult = await normalUserAPI.login(currentUsername.value, passwordForm.oldPassword);
    
    // 添加详细的调试信息
    console.log('登录验证结果:', loginResult);
    
    if (!loginResult.success) {
      errorMessage.value = '当前密码错误，请重新输入';
      passwordValidationErrors.oldPassword = '密码错误';
      console.error('密码验证失败:', loginResult.error);
      return;
    }
    
    console.log('旧密码验证成功，准备更新密码');
    
    // 更新密码
    const updateResult = await normalUserAPI.updateUserByName(
      currentUsername.value, 
      { password: passwordForm.newPassword }
    );
    
    console.log('密码更新结果:', updateResult);
    
    if (updateResult.success) {
      successMessage.value = '密码修改成功！';
      
      // 重置密码表单
      resetPasswordForm();
    } else {
      errorMessage.value = updateResult.error || '密码修改失败，请稍后重试';
      console.error('密码更新失败:', updateResult.error);
    }
  } catch (err) {
    console.error('修改密码时发生错误:', err);
    errorMessage.value = '修改密码时发生未知错误，请稍后重试';
  } finally {
    isSubmitting.value = false;
  }
};

// ---------------- 头像上传相关函数 ----------------

/**
 * 处理文件选择
 * @param {Event} event - 文件选择事件
 */
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    avatarFile.value = file;
    // 预览图片
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

/**
 * 上传头像
 */
const uploadAvatar = async () => {
  if (!avatarFile.value) {
    errorMessage.value = '请选择要上传的头像';
    return;
  }

  try {
    isUploading.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    // 调用API更新头像
    const result = await normalUserAPI.updateUserByName(
      currentUsername.value,
      { avatar_file: avatarFile.value }
    );

    if (result.success) {
      // 更新用户存储中的头像
      userStore.currentUser.user_image = result.data.user_image;
      // 更新本地预览
      avatarPreview.value = result.data.user_image;
      successMessage.value = '头像更新成功';
      // 清空文件输入
      avatarFile.value = null;
    } else {
      errorMessage.value = result.error || '头像更新失败';
    }
  } catch (err) {
    errorMessage.value = '上传过程中发生错误';
    console.error('上传头像失败:', err);
  } finally {
    isUploading.value = false;
  }
};

// ---------------- 修改用户名相关函数 ----------------

/**
 * 验证修改用户名表单
 * @returns {boolean} 表单是否有效
 */
const validateChangeNameForm = () => {
  let isValid = true;
  nameValidationErrors.newUserName = '';

  if (!changeNameForm.newUserName.trim()) {
    nameValidationErrors.newUserName = '请输入新用户名';
    isValid = false;
  }

  return isValid;
};

/**
 * 修改用户名
 */
const changeUserName = async () => {
  if (!validateChangeNameForm()) {
    return;
  }

  if (changeNameForm.newUserName === currentUsername.value) {
    errorMessage.value = '新用户名与当前用户名相同';
    return;
  }

  try {
    isChangingName.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    const result = await normalUserAPI.changeUserName(
      currentUsername.value,
      changeNameForm.newUserName
    );

    if (result.success) {
      // 更新用户存储中的用户名
      userStore.currentUser.user_name = result.data.user_name;
      // 重置表单
      changeNameForm.newUserName = '';
      successMessage.value = '用户名修改成功';
    } else {
      errorMessage.value = result.error || '用户名修改失败';
    }
  } catch (err) {
    errorMessage.value = '修改用户名过程中发生错误';
    console.error('修改用户名失败:', err);
  } finally {
    isChangingName.value = false;
  }
};
</script>

<template>
  <!-- 消息提示区域 - 全局消息，显示在最顶部 -->
  <div v-if="successMessage" class="GlobalSuccessMessage">
    {{ successMessage }}
  </div>
  <div v-if="errorMessage" class="GlobalErrorMessage">
    {{ errorMessage }}
  </div>

  <!-- 修改头像区域 -->
  <div class="ChangeAvatarSection">
    <h3 class="SectionTitle">修改头像</h3>
    
    <div class="AvatarUploadContainer">
      <!-- 头像预览 -->
      <div class="AvatarPreview">
        <div class="AvatarPreviewBorder">预览头像</div>
        <img :src="avatarPreview" alt="头像预览" class="AvatarImage" />
      </div>
      
      <!-- 上传控件 -->
      <div class="AvatarUploadControls">
        <div class="FileInputContainer">
          <input
            type="file"
            id="avatarFile"
            accept="image/*"
            @change="handleFileChange"
            class="FileInput"
          />
          <label for="avatarFile" class="FileLabel">
            选择头像
          </label>
        </div>
        
        <button
          type="button"
          class="UploadBtn"
          @click="uploadAvatar"
          :disabled="isUploading"
        >
          {{ isUploading ? '上传中...' : '上传头像' }}
        </button>
      </div>
    </div>
  </div>

  <!-- 修改用户名区域 -->
  <div class="ChangeNameSection">
    <h3 class="SectionTitle">修改用户名</h3>
    
    <form @submit.prevent="changeUserName" class="ChangeNameForm">
      <!-- 新用户名 -->
      <div class="FormGroup">
        <label for="newUserName">新用户名</label>
        <input
          id="newUserName"
          v-model="changeNameForm.newUserName"
          type="text"
          :class="{ 'error': nameValidationErrors.newUserName }"
          placeholder="请输入新用户名"
        />
        <div v-if="nameValidationErrors.newUserName" class="ErrorText">
          {{ nameValidationErrors.newUserName }}
        </div>
      </div>
      
      <!-- 按钮区域 -->
      <div class="ButtonGroup">
        <button
          type="submit"
          class="SubmitBtn"
          :disabled="isChangingName"
        >
          {{ isChangingName ? '处理中...' : '确认修改' }}
        </button>
      </div>
    </form>
  </div>

  <!-- 修改密码区域 -->
  <div class="ChangePasswordSection">
    <h3 class="SectionTitle">修改密码</h3>
    
    <form @submit.prevent="submitChangePassword" class="PasswordForm">
      <!-- 当前密码 -->
      <div class="FormGroup">
        <label for="oldPassword">当前密码</label>
        <div class="PasswordInputContainer">
          <input
            id="oldPassword"
            v-model="passwordForm.oldPassword"
            :type="showPasswords.oldPassword ? 'text' : 'password'"
            :class="{ 'error': passwordValidationErrors.oldPassword }"
            placeholder="请输入当前密码"
            @input="handlePasswordInput('oldPassword', $event.target.value)"
          />
          <button
            type="button"
            class="TogglePasswordBtn"
            @click="togglePasswordVisibility('oldPassword')"
            aria-label="切换密码可见性"
          >
            {{ showPasswords.oldPassword ? '隐藏' : '显示' }}
          </button>
        </div>
        <div v-if="passwordValidationErrors.oldPassword" class="ErrorText">
          {{ passwordValidationErrors.oldPassword }}
        </div>
      </div>
      
      <!-- 新密码 -->
      <div class="FormGroup">
        <label for="newPassword">新密码</label>
        <div class="PasswordInputContainer">
          <input
            id="newPassword"
            v-model="passwordForm.newPassword"
            :type="showPasswords.newPassword ? 'text' : 'password'"
            :class="{ 'error': passwordValidationErrors.newPassword }"
            placeholder="请输入新密码"
            @input="handlePasswordInput('newPassword', $event.target.value)"
          />
          <button
            type="button"
            class="TogglePasswordBtn"
            @click="togglePasswordVisibility('newPassword')"
            aria-label="切换密码可见性"
          >
            {{ showPasswords.newPassword ? '隐藏' : '显示' }}
          </button>
        </div>
        <div v-if="passwordValidationErrors.newPassword" class="ErrorText">
          {{ passwordValidationErrors.newPassword }}
        </div>
        <div class="PasswordHint">
          密码必须包含至少8个字符，最多25个字符，必须包含字母、数字和特殊字符。
        </div>
      </div>
      
      <!-- 确认新密码 -->
      <div class="FormGroup">
        <label for="confirmPassword">确认新密码</label>
        <div class="PasswordInputContainer">
          <input
            id="confirmPassword"
            v-model="passwordForm.confirmPassword"
            :type="showPasswords.confirmPassword ? 'text' : 'password'"
            :class="{ 'error': passwordValidationErrors.confirmPassword }"
            placeholder="请再次输入新密码"
            @input="handlePasswordInput('confirmPassword', $event.target.value)"
          />
          <button
            type="button"
            class="TogglePasswordBtn"
            @click="togglePasswordVisibility('confirmPassword')"
            aria-label="切换密码可见性"
          >
            {{ showPasswords.confirmPassword ? '隐藏' : '显示' }}
          </button>
        </div>
        <div v-if="passwordValidationErrors.confirmPassword" class="ErrorText">
          {{ passwordValidationErrors.confirmPassword }}
        </div>
      </div>
      
      <!-- 按钮区域 -->
      <div class="ButtonGroup">
        <button
          type="submit"
          class="SubmitBtn"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? '处理中...' : '确认修改' }}
        </button>
        <button
          type="button"
          class="ResetBtn"
          @click="resetPasswordForm"
          :disabled="isSubmitting"
        >
          重置
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
/* 全局消息提示样式 */
.GlobalSuccessMessage {
  background-color: rgba(46, 204, 113, 0.2);
  border: 1px solid #2ecc71;
  color: #2ecc71;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.GlobalErrorMessage {
  background-color: rgba(231, 76, 60, 0.2);
  border: 1px solid #e74c3c;
  color: #e74c3c;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

/* 区域通用样式 */
.ChangeAvatarSection,
.ChangeNameSection,
.ChangePasswordSection {
  background-color: #2a475e;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 20px;
}

.SectionTitle {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #ffffff;
}

/* 表单通用样式 */
.PasswordForm,
.ChangeNameForm {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 400px;
}

.FormGroup {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.FormGroup label {
  font-size: 14px;
  font-weight: 500;
  color: #c7d5e0;
}

.FormGroup input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #385169;
  border-radius: 4px;
  background-color: #1b2838;
  color: white;
  font-size: 14px;
  transition: border-color 0.3s;
}

.FormGroup input:focus {
  outline: none;
  border-color: #66c0f4;
  box-shadow: 0 0 0 2px rgba(102, 192, 244, 0.2);
}

.FormGroup input.error {
  border-color: #e74c3c;
}

.ErrorText {
  font-size: 12px;
  color: #e74c3c;
  margin-top: 4px;
}

/* 密码输入容器样式 */
.PasswordInputContainer {
  position: relative;
  display: flex;
  align-items: center;
}

.TogglePasswordBtn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: #66c0f4;
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 2px;
  transition: background-color 0.3s;
}

.TogglePasswordBtn:hover {
  background-color: rgba(102, 192, 244, 0.1);
}

.PasswordHint {
  font-size: 12px;
  color: #8f98a0;
  margin-top: 4px;
  line-height: 1.4;
}

/* 按钮通用样式 */
.ButtonGroup {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.SubmitBtn,
.ResetBtn,
.UploadBtn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.SubmitBtn,
.UploadBtn {
  background-color: #66c0f4;
  color: #1b2838;
  flex: 1;
}

.SubmitBtn:hover:not(:disabled),
.UploadBtn:hover:not(:disabled) {
  background-color: #5aa9e6;
}

.SubmitBtn:disabled,
.UploadBtn:disabled {
  background-color: #385169;
  color: #8f98a0;
  cursor: not-allowed;
}

.ResetBtn {
  background-color: #385169;
  color: #c7d5e0;
  padding: 10px 15px;
}

.ResetBtn:hover:not(:disabled) {
  background-color: #4b6988;
}

.ResetBtn:disabled {
  background-color: #2a475e;
  color: #666;
  cursor: not-allowed;
}

/* 头像上传样式 */
.AvatarUploadContainer {
  display: flex;
  align-items: center;
  gap: 30px;
}

/* 头像预览 */
.AvatarPreview {
  width: 150px;
  height: 150px;
  overflow: hidden;
  background-color: #1b2838;
  border: 2px solid #385169;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.AvatarPreviewBorder {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40px;
  line-height: 50px;
  text-align: center;
  background: linear-gradient(to top, #000000aa 0%, #00000000 100%);
  box-sizing: border-box;
}

.AvatarImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.AvatarPlaceholder {
  color: #8f98a0;
  font-size: 14px;
  text-align: center;
  padding: 20px;
}

/* 上传控件 */
.AvatarUploadControls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex: 1;
  max-width: 400px;
}

.FileInputContainer {
  position: relative;
}

.FileInput {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.FileLabel {
  display: inline-block;
  background-color: #385169;
  color: #c7d5e0;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s;
  text-align: center;
  border: 1px solid #4b6988;
}

.FileLabel:hover {
  background-color: #4b6988;
}
</style>