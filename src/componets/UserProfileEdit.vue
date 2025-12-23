<script setup>
import normalUserAPI from '@/utils/api/normalUserAPI';
import { useUserStore } from '@/stores/userStore';
import { computed, ref, reactive } from 'vue';
// 导入验证工具函数
import {
  validatePassword,
  validateConfirmPassword,
  validateUsername,
  validateIntroduction,
  validateImageFile
} from '@/utils/tools/validation';

// 导入头像裁剪组件
import AvatarCropper from './AvatarCropper.vue';

const userStore = useUserStore();

// 使用computed从Pinia store获取当前用户信息
const currentUser = computed(() => {
  return userStore.currentUser || null;
});

// 当前用户名
const currentUsername = computed(() => {
  return userStore.currentUser?.user_name || '';
});

// 当前用户ID
const currentUserId = computed(() => {
  return userStore.currentUser?.id || '';
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
const croppedAvatar = ref(null);
const openCropper =() => {
  if (avatarFile.value) {
    croppedAvatar.value = avatarPreview.value;
  } else {
    return;
  }
}
const closeCropper =() => {
  croppedAvatar.value = null;
}
const avatarFile = ref(null);
const avatarPreview = ref('');
const isUploading = ref(false);

// 处理裁剪确认事件
const handleCropConfirm = (cropResult) => {
  // 将裁剪后的图片设置为新的头像预览
  avatarPreview.value = cropResult.dataURL;
  // 使用裁剪结果中的File对象
  avatarFile.value = cropResult.file;
  // 关闭裁剪界面
  closeCropper();
};

// 修改用户名相关状态
const isEditingName = ref(false); // 控制是否处于编辑模式
const tempUserName = ref(''); // 临时存储新用户名
const isChangingName = ref(false);
const nameValidationErrors = reactive({
  newUserName: ''
});

// 修改简介相关状态
const isEditingIntroduction = ref(false); // 控制是否处于编辑简介模式
const introductionForm = reactive({
  newIntroduction: currentIntroduction.value
});
const isUpdatingIntroduction = ref(false);
const introductionValidationErrors = reactive({
  newIntroduction: ''
});
const remainingChars = computed(() => {
  return introductionForm.newIntroduction.length;
});

// 初始化头像预览
if (currentUser.value?.user_image) {
  avatarPreview.value = currentUser.value.user_image;
}

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
    passwordValidationErrors.confirmPassword = validateConfirmPassword(
      passwordForm.newPassword, 
      passwordForm.confirmPassword
    );
  } else if (field === 'confirmPassword') {
    passwordValidationErrors.confirmPassword = validateConfirmPassword(
      passwordForm.newPassword, 
      passwordForm.confirmPassword
    );
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
    // 验证图片文件
    const validationError = validateImageFile(file, 5); // 限制5MB
    if (validationError) {
      errorMessage.value = validationError;
      return;
    }
    
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
      // 清空文件输入框
      const fileInput = document.getElementById('avatarFile');
      if (fileInput) {
        fileInput.value = '';
      }
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



/**
 * 取消上传头像
 */
const cancelUploadAvatar = () => {
  // 清空文件输入
  avatarFile.value = null;
  // 重置头像预览为当前用户头像
  avatarPreview.value = userStore.currentUser?.user_image || '';
  // 清空文件输入框
  const fileInput = document.getElementById('avatarFile');
  if (fileInput) {
    fileInput.value = '';
  }
  // 清空相关消息
  errorMessage.value = '';
  successMessage.value = '';
};

// ---------------- 修改用户名相关函数 ----------------

/**
 * 开始编辑用户名
 */
const startEditName = () => {
  // 初始化临时用户名为当前用户名
  tempUserName.value = currentUsername.value;
  // 清除之前的错误信息
  nameValidationErrors.newUserName = '';
  // 进入编辑模式
  isEditingName.value = true;
};

/**
 * 取消编辑用户名
 */
const cancelEditName = () => {
  // 退出编辑模式
  isEditingName.value = false;
  // 清除临时用户名
  tempUserName.value = '';
  // 清除错误信息
  nameValidationErrors.newUserName = '';
};

/**
 * 验证用户名
 * @returns {boolean} 用户名是否有效
 */
const validateUsernameInput = () => {
  let isValid = true;
  nameValidationErrors.newUserName = validateUsername(tempUserName.value);
  
  if (nameValidationErrors.newUserName) {
    isValid = false;
  }

  return isValid;
};

/**
 * 保存新用户名
 */
const saveUserName = async () => {
  // 验证用户名
  if (!validateUsernameInput()) {
    return;
  }

  // 检查新用户名是否与当前用户名相同
  if (tempUserName.value === currentUsername.value) {
    errorMessage.value = '新用户名与当前用户名相同';
    return;
  }

  try {
    isChangingName.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    const result = await normalUserAPI.changeUserName(
      currentUsername.value,
      tempUserName.value
    );

    if (result.success) {
      // 更新用户存储中的用户名，替换整个currentUser对象以确保响应式更新
      userStore.currentUser = { ...userStore.currentUser, ...result.data };
      // 将更新后的用户信息保存到localStorage
      localStorage.setItem('user', JSON.stringify(userStore.currentUser));
      successMessage.value = '用户名修改成功';
      // 退出编辑模式
      isEditingName.value = false;
      // 清除临时用户名
      tempUserName.value = '';
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
 * 开始编辑简介
 */
const startEditIntroduction = () => {
  // 初始化编辑内容为当前简介
  introductionForm.newIntroduction = currentIntroduction.value;
  // 清除之前的错误信息
  introductionValidationErrors.newIntroduction = '';
  // 进入编辑模式
  isEditingIntroduction.value = true;
};

/**
 * 取消编辑简介
 */
const cancelEditIntroduction = () => {
  // 退出编辑模式
  isEditingIntroduction.value = false;
  // 重置编辑内容为当前简介
  introductionForm.newIntroduction = currentIntroduction.value;
  // 清除错误信息
  introductionValidationErrors.newIntroduction = '';
};

/**
 * 更新用户简介
 */
const updateIntroduction = async () => {
  // 验证简介长度
  introductionValidationErrors.newIntroduction = validateIntroduction(
    introductionForm.newIntroduction, 
    200
  );
  
  if (introductionValidationErrors.newIntroduction) {
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
      // 退出编辑模式
      isEditingIntroduction.value = false;
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
          <img :src="currentUser?.user_image" alt="当前用户头像" class="UserAvatarImage" />
        </div>
      </div>
      <div class="UserInfoRight">
        <div class="UserInfoItem">
          <span class="UserInfoLabel">用户名:</span>
          <div class="UsernameEditContainer">
            <!-- 静态显示模式 -->
            <div v-if="!isEditingName" class="UsernameStatic">
              <span class="UserInfoValue">{{ currentUsername }}</span>
              <button type="button" class="ChangeBtn" @click="startEditName">修改</button>
            </div>
            <!-- 编辑模式 -->
            <div v-else class="UsernameEdit">
              <input
                v-model="tempUserName"
                type="text"
                class="EditInput"
                :class="{ 'error': nameValidationErrors.newUserName }"
                placeholder="请输入新用户名"
                autofocus
              />
              <div class="EditArea">
                <button type="button" class="SaveBtn" @click="saveUserName" :disabled="isChangingName">
                  {{ isChangingName ? '处理中...' : '保存' }}
                </button>
                <button type="button" class="UnsaveBtn" @click="cancelEditName">取消</button>
              </div>
              <div v-if="nameValidationErrors.newUserName" class="ErrorText">
                {{ nameValidationErrors.newUserName }}
              </div>
            </div>
          </div>
        </div>
        <div class="UserInfoItem">
          <span class="UserInfoLabel">账户状态:</span>
          <span class="UserInfoValue status-active">正常</span>
        </div>
        <div class="UserInfoItem">
          <span class="UserInfoLabel">用户ID:</span>
          <span class="UserInfoValue">{{ currentUserId }}</span>
        </div>
        <div class="UserInfoItem">
          <span class="UserInfoLabel">注册时间:</span>
          <span class="UserInfoValue">{{ currentRegisterTime }}</span>
        </div>
      </div>
      <div class="UserInfoItem full-width">
          <span class="UserInfoLabel">个人简介:</span>
          <div class="IntroductionEditContainer">
            <!-- 静态显示模式 -->
            <div 
              v-if="!isEditingIntroduction" 
              class="UserInfoValue introduction" 
              @click="startEditIntroduction"
            >
              {{ currentIntroduction || '暂无简介' }}
              <div class="EditHint">点击编辑简介</div>
            </div>
            <!-- 编辑模式 -->
            <div v-else class="IntroductionEdit">
              <textarea
                v-model="introductionForm.newIntroduction"
                :class="{ 'error': introductionValidationErrors.newIntroduction }"
                placeholder="请输入个人简介（最多200字）"
                rows="4"
                maxlength="200"
                autofocus
                class="IntroductionTextarea"
              ></textarea>
              <div class="IntroductionEditFooter">
                <div class="CharCount" :class="{ 'char-normal': remainingChars <= 100 ,'char-limit': remainingChars > 100 && remainingChars <= 150 ,'char-max': remainingChars > 150 }">
                  {{ remainingChars }}/200
                </div>
                <div class="IntroductionButtons">
                  <button 
                    type="button" 
                    class="SaveBtn" 
                    @click="updateIntroduction"
                    :disabled="isUpdatingIntroduction"
                  >
                    {{ isUpdatingIntroduction ? '处理中...' : '保存' }}
                  </button>
                  <button 
                    type="button" 
                    class="UnsaveBtn" 
                    @click="cancelEditIntroduction"
                  >
                    取消
                  </button>
                </div>
              </div>
              <div v-if="introductionValidationErrors.newIntroduction" class="ErrorText">
                {{ introductionValidationErrors.newIntroduction }}
              </div>
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
      <div class="AvatarPreview" @click="openCropper">
        <div class="AvatarPreviewBorder">{{ !!avatarFile ? '点击裁剪头像':'预览头像' }}</div>
        <img :src="avatarPreview" alt="裁剪头像" class="AvatarImage" />
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
          <button
            type="button"
            class="CancelBtn"
            @click="cancelUploadAvatar"
            :disabled="isUploading || !avatarFile"
          >
            取消上传
          </button>
        </div>
        
        <div class="AvatarActionButtons">
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
  </div>
  <!-- 头像裁剪区域 -->
  <AvatarCropper
    v-if="croppedAvatar"
    :image-url="croppedAvatar"
    @confirm="handleCropConfirm"
    @cancel="closeCropper"
  />





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
.CropperAvatarContainer {
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
.ChangePasswordSection:hover {
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
  width: 160px;
  height: 160px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(66, 153, 225, 0.3);
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
  width: 100%;
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

/* 用户名编辑样式 */
.UsernameEditContainer {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 10px;
  position: relative;
}

.UsernameStatic {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.UsernameEdit {
  display: flex;
  flex-direction: row;
  gap: 8px;
  flex: 1;
}

.EditInput {
  padding: 8px 12px;
  height: 29.46px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 14px;
  transition: all 0.3s ease;
  width: 30%;
  box-sizing: border-box;
}

.EditInput:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  background: rgba(255, 255, 255, 0.08);
}

.EditInput.error {
  border-color: #e74c3c;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
}

.EditArea {
  display: flex;
  align-items: center;
  gap: 5px;
}

.SaveBtn,
.UnsaveBtn,
.ChangeBtn {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.SaveBtn:hover,
.UnsaveBtn:hover,
.ChangeBtn:hover {
  background: rgba(66, 153, 225, 0.2);
  border-color: rgba(66, 153, 225, 0.4);
  color: #4299e1;
  transform: translateY(-1px);
}

/* 简介编辑样式 */
.IntroductionEditContainer {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
  position: relative;
}

.IntroductionEditContainer .UserInfoValue.introduction {
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  word-break: break-word;
  white-space: normal;
}

.IntroductionEditContainer .UserInfoValue.introduction:hover {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.EditHint {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 25px;
  width: 80px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  background: rgba(0, 0, 0, 0.826);
  color: rgba(255, 255, 255, 0.898);
  padding: 4px 8px;
  border-radius: 5px;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.IntroductionEditContainer .UserInfoValue.introduction:hover .EditHint {
  opacity: 1;
}

.IntroductionEdit {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.IntroductionTextarea {
  width: 100%;
  text-align: left;
  line-height: 1.6;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  box-sizing: border-box;
  border-radius: 6px;
  border: 1px solid transparent;
  border-left: 3px solid #4299e1;
  color: white;
  font-size: 15px;
  min-height: 80px;
  resize: none;
  max-height: 200px;
  transition: all 0.3s ease;
  font-family: inherit;
  word-break: break-word;
  white-space: normal;
  
}

.IntroductionTextarea:focus {
  outline: none;
  border-color: transparent;
  border-left: 3px solid #4299e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.08);
}

.IntroductionTextarea.error {
  border-color: transparent;
  border-left: 3px solid #e74c3c;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
}

.IntroductionEditFooter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
  flex-wrap: wrap;
  gap: 10px;
}

.IntroductionButtons {
  display: flex;
  gap: 10px;
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
  word-break: break-word;
  white-space: normal;
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
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
  text-align: right;
  transition: color 0.3s ease;
}

.CharCount.char-normal {
  color: rgba(33, 247, 65, 0.6);
}

.CharCount.char-limit {
  color: #f59e0b;
}

.CharCount.char-max {
  color: #e74c3c;
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
.FileLabel,
.cropping {
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
.UploadBtn::before,
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

.SubmitBtn:hover::before,
.UploadBtn:hover::before,
.cropping:hover::before {
  left: 100%;
}

.SubmitBtn,
.UploadBtn,
.cropping {
  background: linear-gradient(45deg, #4299e1 0%, #6366f1 100%);
  color: white;
  flex: 1;
  min-width: 120px;
}

.SubmitBtn:hover:not(:disabled),
.UploadBtn:hover:not(:disabled),
.cropping:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(66, 153, 225, 0.4);
  background: linear-gradient(45deg, #3182ce 0%, #4f46e5 100%);
}

.SubmitBtn:active:not(:disabled),
.UploadBtn:active:not(:disabled),
.cropping:active:not(:disabled) {
  transform: translateY(0);
}

.SubmitBtn:disabled,
.UploadBtn:disabled,
.cropping:disabled {
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

.CancelBtn {
  position: relative;
  top: -16.5px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: none;
  text-align: center;
  height: 43.5px;
  line-height: 43.5px;
  min-width: 240px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  margin-left: 10px;
}

.CancelBtn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(231, 76, 60, 0.3);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
}

.CancelBtn:disabled {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.1);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.AvatarActionButtons {
  display: flex;
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
  color: rgb(255, 255, 255);
  font-size: 16px;
  font-weight: 500;
}

.AvatarImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
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
  min-width: 200px;
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