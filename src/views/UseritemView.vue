<script>
import GS_body from '../componets/GS_body.vue';
import GS_container from '../componets/GS_container.vue';
import normalUserAPI from '@/utils/normalUserAPI';

export default {
  name: 'UseritemView',
  components: {
    GS_body,
    GS_container,
  },
  data() {
    return {
      // 当前登录的用户名（现在从user对象中获取）
      currentUser: null,
      // 修改密码表单数据
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      // 密码可见性状态
      showPasswords: {
        oldPassword: false,
        newPassword: false,
        confirmPassword: false
      },
      // 验证错误信息
      validationErrors: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      // 操作状态和消息
      isSubmitting: false,
      successMessage: '',
      errorMessage: ''
    };
  },
  computed: {
    // 获取当前用户名
    currentUsername() {
      return this.currentUser && this.currentUser.user_name ? this.currentUser.user_name : '';
    }
  },
  methods: {
    /**
     * 验证密码格式
     * @param {string} password - 要验证的密码
     * @returns {string} 错误信息，为空表示验证通过
     */
    validatePassword(password) {
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
    },

    /**
     * 验证确认密码是否与新密码一致
     * @returns {string} 错误信息，为空表示验证通过
     */
    validateConfirmPassword() {
      if (this.passwordForm.newPassword && 
          this.passwordForm.confirmPassword !== this.passwordForm.newPassword) {
        return '两次输入的新密码不一致';
      }
      return '';
    },

    /**
     * 处理密码输入，实时验证
     * @param {string} field - 字段名
     * @param {string} value - 输入值
     */
    handlePasswordInput(field, value) {
      this.passwordForm[field] = value;
      
      // 根据字段类型进行验证
      if (field === 'newPassword') {
        this.validationErrors.newPassword = this.validatePassword(value);
        // 重新验证确认密码
        this.validationErrors.confirmPassword = this.validateConfirmPassword();
      } else if (field === 'confirmPassword') {
        this.validationErrors.confirmPassword = this.validateConfirmPassword();
      }
    },

    /**
     * 切换密码可见性
     * @param {string} field - 字段名
     */
    togglePasswordVisibility(field) {
      this.showPasswords[field] = !this.showPasswords[field];
    },

    /**
     * 重置表单
     */
    resetForm() {
      this.passwordForm = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      this.validationErrors = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      this.successMessage = '';
      this.errorMessage = '';
    },

    /**
     * 检查并加载用户信息
     */
    checkUserLogin() {
      console.log('检查用户登录状态...');
      const userStr = localStorage.getItem('user');
      console.log('从localStorage获取的user值:', userStr);
      
      if (userStr) {
        try {
          this.currentUser = JSON.parse(userStr);
          console.log('解析后的用户信息:', this.currentUser);
        } catch (e) {
          console.error('解析用户信息失败:', e);
          localStorage.removeItem('user');
        }
      } else {
        console.log('localStorage中未找到用户信息');
      }
    },

    /**
     * 提交修改密码表单
     */
    async submitChangePassword() {
      // 清空之前的消息
      this.successMessage = '';
      this.errorMessage = '';
      
      // 验证旧密码不为空
      if (!this.passwordForm.oldPassword) {
        this.validationErrors.oldPassword = '请输入当前密码';
        return;
      }
      
      // 验证新密码
      this.validationErrors.newPassword = this.validatePassword(this.passwordForm.newPassword);
      if (this.validationErrors.newPassword) {
        return;
      }
      
      // 验证确认密码
      this.validationErrors.confirmPassword = this.validateConfirmPassword();
      if (this.validationErrors.confirmPassword) {
        return;
      }
      
      // 检查新旧密码是否相同
      if (this.passwordForm.oldPassword === this.passwordForm.newPassword) {
        this.errorMessage = '新密码不能与当前密码相同';
        return;
      }
      
      try {
        this.isSubmitting = true;
        
        // 检查用户名是否存在
        if (!this.currentUsername) {
          this.errorMessage = '未找到当前登录用户信息';
          console.error('当前用户名为空');
          return;
        }
        
        console.log('开始验证旧密码，用户:', this.currentUsername);
        
        // 验证旧密码是否正确（通过登录接口验证）
        const loginResult = await normalUserAPI.login(this.currentUsername, this.passwordForm.oldPassword);
        
        // 添加详细的调试信息
        console.log('登录验证结果:', loginResult);
        
        if (!loginResult.success) {
          this.errorMessage = '当前密码错误，请重新输入';
          this.validationErrors.oldPassword = '密码错误';
          console.error('密码验证失败:', loginResult.error);
          return;
        }
        
        console.log('旧密码验证成功，准备更新密码');
        
        // 更新密码
        const updateResult = await normalUserAPI.updateUserByName(
          this.currentUsername, 
          { password: this.passwordForm.newPassword }
        );
        
        console.log('密码更新结果:', updateResult);
        
        if (updateResult.success) {
          this.successMessage = '密码修改成功！';
          
          // 如果更新成功，更新localStorage中的用户信息，但不包含密码
          if (updateResult.data) {
            const updatedUser = {
              ...this.currentUser
              // 移除密码字段，不在前端存储密码
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
          
          this.resetForm();
        } else {
          this.errorMessage = updateResult.error || '密码修改失败，请稍后重试';
          console.error('密码更新失败:', updateResult.error);
        }
      } catch (err) {
        console.error('修改密码时发生错误:', err);
        this.errorMessage = '修改密码时发生未知错误，请稍后重试';
      } finally {
        this.isSubmitting = false;
      }
    },
    
    /**
     * 处理storage变化事件
     */
    handleStorageChange(event) {
      if (event.key === 'user') {
        this.checkUserLogin();
      }
    }
  },
  mounted() {
    // 组件挂载时检查用户登录状态
    this.checkUserLogin();
    
    // 监听storage变化，以便在其他标签页修改用户信息时更新状态
    window.addEventListener('storage', this.handleStorageChange);
  },
  beforeUnmount() {
    // 清理事件监听
    window.removeEventListener('storage', this.handleStorageChange);
  }
}
</script>

<template>
  <GS_body>
    <GS_container>
      <div class="UserItemBox">
        <div class="UserItemHeader">
          <div class="UserItemHeaderTitle">
            个人资料
          </div>
          
          <!-- 修改密码区域 -->
          <div class="ChangePasswordSection">
            <h3 class="SectionTitle">修改密码</h3>
            
            <!-- 消息提示区域 -->
            <div v-if="successMessage" class="SuccessMessage">
              {{ successMessage }}
            </div>
            <div v-if="errorMessage" class="ErrorMessage">
              {{ errorMessage }}
            </div>
            
            <form @submit.prevent="submitChangePassword" class="PasswordForm">
              <!-- 当前密码 -->
              <div class="FormGroup">
                <label for="oldPassword">当前密码</label>
                <div class="PasswordInputContainer">
                  <input
                    id="oldPassword"
                    v-model="passwordForm.oldPassword"
                    :type="showPasswords.oldPassword ? 'text' : 'password'"
                    :class="{ 'error': validationErrors.oldPassword }"
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
                <div v-if="validationErrors.oldPassword" class="ErrorText">
                  {{ validationErrors.oldPassword }}
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
                    :class="{ 'error': validationErrors.newPassword }"
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
                <div v-if="validationErrors.newPassword" class="ErrorText">
                  {{ validationErrors.newPassword }}
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
                    :class="{ 'error': validationErrors.confirmPassword }"
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
                <div v-if="validationErrors.confirmPassword" class="ErrorText">
                  {{ validationErrors.confirmPassword }}
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
                  @click="resetForm"
                  :disabled="isSubmitting"
                >
                  重置
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </GS_container>
  </GS_body>
</template>

<style scoped>
.GS_body {
  min-height: 100vh;
}

.UserItemBox {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px 0;
}

.UserItemHeader {
  width: 1100px;
  background-color: #1b2838;
  border-radius: 8px;
  padding: 20px;
  color: white;
}

.UserItemHeaderTitle {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 30px;
  color: white;
}

/* 修改密码区域样式 */
.ChangePasswordSection {
  background-color: #2a475e;
  border-radius: 6px;
  padding: 20px;
  margin-top: 20px;
}

.SectionTitle {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #ffffff;
}

/* 消息提示样式 */
.SuccessMessage {
  background-color: rgba(46, 204, 113, 0.2);
  border: 1px solid #2ecc71;
  color: #2ecc71;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 14px;
}

.ErrorMessage {
  background-color: rgba(231, 76, 60, 0.2);
  border: 1px solid #e74c3c;
  color: #e74c3c;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 14px;
}

/* 表单样式 */
.PasswordForm {
  display: flex;
  flex-direction: column;
  gap: 15px;
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

.PasswordInputContainer {
  position: relative;
  display: flex;
  align-items: center;
}

.PasswordInputContainer input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #385169;
  border-radius: 4px;
  background-color: #1b2838;
  color: white;
  font-size: 14px;
  transition: border-color 0.3s;
}

.PasswordInputContainer input:focus {
  outline: none;
  border-color: #66c0f4;
  box-shadow: 0 0 0 2px rgba(102, 192, 244, 0.2);
}

.PasswordInputContainer input.error {
  border-color: #e74c3c;
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

.ErrorText {
  font-size: 12px;
  color: #e74c3c;
  margin-top: 4px;
}

.PasswordHint {
  font-size: 12px;
  color: #8f98a0;
  margin-top: 4px;
  line-height: 1.4;
}

/* 按钮样式 */
.ButtonGroup {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.SubmitBtn,
.ResetBtn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.SubmitBtn {
  background-color: #66c0f4;
  color: #1b2838;
  flex: 1;
}

.SubmitBtn:hover:not(:disabled) {
  background-color: #5aa9e6;
}

.SubmitBtn:disabled {
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
</style>