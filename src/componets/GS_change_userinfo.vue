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

// 当前用户简介
const currentIntroduction = computed(() => {
  return userStore.currentUser?.introduction || '';
});

//当前用户注册时间
const currentRegisterTime = computed(() => {
  return new Date(userStore.currentUser?.created_at).toLocaleString('zh-CN') || '';
})

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

// 修改简介相关状态
const introductionForm = reactive({
  newIntroduction: currentIntroduction.value
});
const isUpdatingIntroduction = ref(false);
const introductionValidationErrors = reactive({
  newIntroduction: ''
});
const remainingChars = computed(() => {
  return 200 - introductionForm.newIntroduction.length;
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
      // 更新用户存储中的头像，替换整个currentUser对象以确保响应式更新
      userStore.currentUser = { ...userStore.currentUser, ...result.data };
      // 将更新后的用户信息保存到localStorage
      localStorage.setItem('user', JSON.stringify(userStore.currentUser));
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
      // 更新用户存储中的用户名，替换整个currentUser对象以确保响应式更新
      userStore.currentUser = { ...userStore.currentUser, ...result.data };
      // 将更新后的用户信息保存到localStorage
      localStorage.setItem('user', JSON.stringify(userStore.currentUser));
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

/**
 * 更新用户简介
 */
const updateIntroduction = async () => {
  // 验证简介长度
  if (introductionForm.newIntroduction.length > 200) {
    introductionValidationErrors.newIntroduction = '简介不能超过200字';
    return;
  }
  
  try {
    isUpdatingIntroduction.value = true;
    successMessage.value = '';
    errorMessage.value = '';
    introductionValidationErrors.newIntroduction = '';
    
    // 更新简介
    const result = await normalUserAPI.updateUserByName(
      currentUsername.value,
      { introduction: introductionForm.newIntroduction }
    );
    
    if (result.success) {
      // 更新用户存储中的简介，替换整个currentUser对象以确保响应式更新
      userStore.currentUser = { ...userStore.currentUser, ...result.data };
      // 将更新后的用户信息保存到localStorage，解决刷新后简介不更新的问题
      localStorage.setItem('user', JSON.stringify(userStore.currentUser));
      successMessage.value = '简介更新成功';
    } else {
      errorMessage.value = result.error || '简介更新失败';
    }
  } catch (err) {
    errorMessage.value = '更新简介过程中发生错误';
    console.error('更新简介失败:', err);
  } finally {
    isUpdatingIntroduction.value = false;
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

  <!-- 用户信息展示区域 -->
  <div class="UserInfoSection">
    <h3 class="SectionTitle">当前用户信息</h3>
    <div class="UserInfoContainer">
      <div class="UserInfoLeft">
        <div class="UserAvatar">
          <img :src="avatarPreview" alt="当前用户头像" class="UserAvatarImage" />
        </div>
      </div>
      <div class="UserInfoRight">
        <div class="UserInfoItem">
          <span class="UserInfoLabel">用户名:</span>
          <span class="UserInfoValue">{{ currentUsername }}</span>
        </div>
        <div class="UserInfoItem">
          <span class="UserInfoLabel">账户状态:</span>
          <span class="UserInfoValue status-active">已激活</span>
        </div>
        <div class="UserInfoItem">
          <span class="UserInfoLabel">最后登录:</span>
          <span class="UserInfoValue">{{ new Date().toLocaleString() }}</span>
        </div>
        <div class="UserInfoItem">
          <span class="UserInfoLabel">注册时间:</span>
          <span class="UserInfoValue">{{ currentRegisterTime }}</span>
        </div>
        <div class="UserInfoItem full-width">
          <span class="UserInfoLabel">个人简介:</span>
          <div class="UserInfoValue introduction">
            {{ currentIntroduction || '暂无简介' }}
          </div>
        </div>
      </div>
    </div>
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

  <!-- 修改简介区域 -->
  <div class="ChangeIntroductionSection">
    <h3 class="SectionTitle">修改简介</h3>
    
    <form @submit.prevent="updateIntroduction" class="IntroductionForm">
      <!-- 新简介 -->
      <div class="FormGroup">
        <label for="newIntroduction">个人简介</label>
        <textarea
          id="newIntroduction"
          v-model="introductionForm.newIntroduction"
          :class="{ 'error': introductionValidationErrors.newIntroduction }"
          placeholder="请输入个人简介（最多200字）"
          rows="4"
          maxlength="200"
        ></textarea>
        <div class="CharCount" :class="{ 'char-limit': remainingChars < 50 }">
          {{ remainingChars }}/200
        </div>
        <div v-if="introductionValidationErrors.newIntroduction" class="ErrorText">
          {{ introductionValidationErrors.newIntroduction }}
        </div>
      </div>
      
      <!-- 按钮区域 -->
      <div class="ButtonGroup">
        <button
          type="submit"
          class="SubmitBtn"
          :disabled="isUpdatingIntroduction"
        >
          {{ isUpdatingIntroduction ? '处理中...' : '更新简介' }}
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
  background: rgba(46, 204, 113, 0.1);
  border: 1px solid #2ecc71;
  color: #2ecc71;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 25px;
  font-size: 14px;
  backdrop-filter: blur(10px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease-out;
}

.GlobalErrorMessage {
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid #e74c3c;
  color: #e74c3c;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 25px;
  font-size: 14px;
  backdrop-filter: blur(10px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease-out;
}

/* 区域通用样式 */
.UserInfoSection,
.ChangeAvatarSection,
.ChangeNameSection,
.ChangePasswordSection,
.ChangeIntroductionSection {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 25px;
  backdrop-filter: blur(10px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  animation: fadeIn 0.5s ease-out;
}

.UserInfoSection:hover,
.ChangeAvatarSection:hover,
.ChangeNameSection:hover,
.ChangePasswordSection:hover,
.ChangeIntroductionSection:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(66, 153, 225, 0.3);
}

/* 用户信息展示区域样式 */
.UserInfoContainer {
  display: flex;
  align-items: center;
  gap: 30px;
  flex-wrap: wrap;
}

.UserInfoLeft {
  flex-shrink: 0;
}

.UserAvatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 3px solid rgba(66, 153, 225, 0.3);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.UserAvatar:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(66, 153, 225, 0.5);
}

.UserAvatarImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.UserInfoRight {
  flex: 1;
  min-width: 250px;
}

.UserInfoItem {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.UserInfoItem:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.UserInfoLabel {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  min-width: 80px;
}

.UserInfoValue {
  font-size: 16px;
  font-weight: 500;
  color: white;
}

.UserInfoValue.status-active {
  color: #2ecc71;
  font-weight: 600;
}

.UserInfoValue.status-active::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #2ecc71;
  border-radius: 50%;
  margin-right: 8px;
  animation: pulse 2s ease-in-out infinite;
}

/* 个人简介展示样式 */
.UserInfoItem.full-width {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding-top: 15px;
}

.UserInfoValue.introduction {
  width: 100%;
  text-align: left;
  line-height: 1.6;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  box-sizing: border-box;
  border-radius: 6px;
  border-left: 3px solid #4299e1;
  font-size: 15px;
  min-height: 80px;
  display: flex;
  align-items: center;
}

/* 简介表单样式 */
.IntroductionForm {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 500px;
}

/* 文本域样式 */
.FormGroup textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 14px;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  resize: none;
  font-family: inherit;
  line-height: 1.6;
}

.FormGroup textarea:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  background: rgba(255, 255, 255, 0.08);
}

.FormGroup textarea.error {
  border-color: #e74c3c;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
}

/* 字符计数样式 */
.CharCount {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
  text-align: right;
  transition: color 0.3s ease;
}

.CharCount.char-limit {
  color: #f59e0b;
  font-weight: 600;
}

.CharCount::before {
  content: '';
  display: block;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin-bottom: 4px;
}

.SectionTitle {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 25px;
  color: white;
  background: linear-gradient(45deg, #4299e1 0%, #6366f1 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* 表单通用样式 */
.PasswordForm,
.ChangeNameForm {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 500px;
}

.FormGroup {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.FormGroup label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  transition: color 0.3s;
}

.FormGroup input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 14px;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.FormGroup input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  background: rgba(255, 255, 255, 0.08);
}

.FormGroup input.error {
  border-color: #e74c3c;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
}

.ErrorText {
  font-size: 12px;
  color: #e74c3c;
  margin-top: 4px;
  font-weight: 500;
}

/* 密码输入容器样式 */
.PasswordInputContainer {
  position: relative;
  display: flex;
  align-items: center;
}

.TogglePasswordBtn {
  position: absolute;
  right: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #4299e1;
  cursor: pointer;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.TogglePasswordBtn:hover {
  background: rgba(66, 153, 225, 0.2);
  border-color: rgba(66, 153, 225, 0.4);
  color: #6366f1;
}

.PasswordHint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 6px;
  line-height: 1.5;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  border-left: 3px solid #4299e1;
}

/* 按钮通用样式 */
.ButtonGroup {
  display: flex;
  gap: 15px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.SubmitBtn,
.ResetBtn,
.UploadBtn,
.FileLabel {
  padding: 12px 25px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.SubmitBtn::before,
.UploadBtn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.SubmitBtn:hover::before,
.UploadBtn:hover::before {
  left: 100%;
}

.SubmitBtn,
.UploadBtn {
  background: linear-gradient(45deg, #4299e1 0%, #6366f1 100%);
  color: white;
  flex: 1;
  min-width: 120px;
}

.SubmitBtn:hover:not(:disabled),
.UploadBtn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(66, 153, 225, 0.4);
  background: linear-gradient(45deg, #3182ce 0%, #4f46e5 100%);
}

.SubmitBtn:active:not(:disabled),
.UploadBtn:active:not(:disabled) {
  transform: translateY(0);
}

.SubmitBtn:disabled,
.UploadBtn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.ResetBtn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 12px 25px;
  min-width: 100px;
}

.ResetBtn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(66, 153, 225, 0.3);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
}

.ResetBtn:disabled {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.1);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 头像上传样式 */
.AvatarUploadContainer {
  display: flex;
  align-items: center;
  gap: 40px;
  flex-wrap: wrap;
}

/* 头像预览 */
.AvatarPreview {
  width: 180px;
  height: 180px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.AvatarPreview:hover {
  border-color: rgba(66, 153, 225, 0.5);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  transform: scale(1.05);
}

.AvatarPreviewBorder {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50px;
  line-height: 60px;
  text-align: center;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%);
  box-sizing: border-box;
  color: white;
  font-size: 14px;
  font-weight: 500;
  opacity: 0.8;
}

.AvatarImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.AvatarPreview:hover .AvatarImage {
  transform: scale(1.1);
}

.AvatarPlaceholder {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  text-align: center;
  padding: 20px;
}

/* 上传控件 */
.AvatarUploadControls {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  max-width: 500px;
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
  background: linear-gradient(45deg, #6b7280 0%, #4b5563 100%);
  color: white;
  text-align: center;
  min-width: 150px;
  transition: all 0.3s ease;
  border: none;
}

.FileLabel:hover {
  background: linear-gradient(45deg, #4b5563 0%, #374151 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .AvatarUploadContainer {
    flex-direction: column;
    align-items: stretch;
  }
  
  .AvatarPreview {
    width: 150px;
    height: 150px;
    margin: 0 auto;
  }
  
  .PasswordForm,
  .ChangeNameForm {
    max-width: 100%;
  }
  
  .ButtonGroup {
    flex-direction: column;
  }
  
  .SubmitBtn,
  .ResetBtn,
  .UploadBtn {
    min-width: auto;
  }
}
</style>