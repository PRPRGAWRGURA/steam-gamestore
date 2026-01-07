<script>
import { normalUserAPI } from '@/utils/api/normalUserAPI'
import { useUserStore } from '@/stores/userStore'
// 导入验证工具函数
import {
  validatePassword,
  validateUsername
} from '@/utils/tools/validation'
export default {
    data() {
        return {
            activeTab: 'login', // 当前激活的选项卡：'login' 或 'register'
            // 登录表单数据
            loginData: {
                loginIdentifier: '',
                password: '',
            },
            // 添加记住我状态
            rememberMe: false,
            // 注册表单数据
            registerData: {
                username: '',
                password: '',
            },
            errorMsg: '',
            // 控制密码可见性的状态
            showLoginPassword: false,
            showRegisterPassword: false,
            // 跟踪输入框焦点状态
            focusStates: {
                regUsername: false,
                regPassword: false
            },
            // 验证错误信息
            validationErrors: {
                regUsername: '',
                regPassword: ''
            },
            // 防重复提交状态
            loading: false,
            // 账号预览相关状态
            preview: {
                loading: false, // 预览加载状态
                userInfo: null, // 用户信息
                error: null, // 错误信息
                show: false // 是否显示预览
            },
            // 防抖定时器
            debounceTimer: null
        }
    },
    setup() {
        const userStore = useUserStore()
        return {
            userStore
        }
    },
    methods: {
        // 切换选项卡
        switchTab(tabName) {
            this.activeTab = tabName;
            // 重置验证错误信息
            this.resetValidationErrors();
        },
        
        // 重置验证错误信息
        resetValidationErrors() {
            this.validationErrors = {
                regUsername: '',
                regPassword: ''
            };
        },
        
        // 设置焦点状态
        setFocusState(field, isFocused) {
            this.focusStates[field] = isFocused;
        },
        
        // 直接使用导入的验证函数，不再需要本地实现
        
        // 验证用户名 - 使用导入的验证函数
        validateUsername(username) {
            const error = validateUsername(username);
            // 额外添加账号长度限制（不超过12个字符）
            if (!error && username.length > 12) {
                return '账号名称不能超过12个字符';
            }
            return error;
        },
        
        // 验证密码 - 直接使用导入的验证函数
        validatePassword(password) {
            return validatePassword(password);
        },
        
        // 处理用户名输入
        handleUsernameInput(field, value) {
            this.validationErrors[field] = this.validateUsername(value);
        },
        
        // 处理密码输入
        handlePasswordInput(field, value) {
            this.validationErrors[field] = this.validatePassword(value);
        },
        
        // 登录提交
        async handleLogin() {
            // 防止重复提交
            if (this.loading) {
                return;
            }
            
            if (!this.loginData.loginIdentifier || !this.loginData.password) {
                alert('请输入账号和密码');
                return;
            }
            
            try {
                // 开始加载
                this.loading = true;
                
                const user = await normalUserAPI.login(this.loginData.loginIdentifier, this.loginData.password)
                if(user.success){
                    // 使用Pinia store保存用户信息
                    this.userStore.login(this.loginData.loginIdentifier, this.loginData.password, this.rememberMe)
                    // 记住我功能由store内部处理
                    this.$router.push('/')
                }else{
                    this.errorMsg = user.error
                    alert('登录失败:' + this.errorMsg);
                }
            } catch (error) {
                console.error('登录过程中发生错误:', error);
                alert('登录过程中发生错误，请稍后重试');
            } finally {
                // 结束加载
                this.loading = false;
            }
        },
        
        // 注册提交
        async handleRegister() {
            // 防止重复提交
            if (this.loading) {
                return;
            }
            
            // 验证注册表单
            this.validationErrors.regUsername = this.validateUsername(this.registerData.username);
            this.validationErrors.regPassword = this.validatePassword(this.registerData.password);
            
            // 如果有验证错误，不提交表单
            if (this.validationErrors.regUsername || this.validationErrors.regPassword) {
                alert('请检查输入是否符合要求');
                return;
            }
            
            try {
                // 开始加载
                this.loading = true;
                
                const user = await normalUserAPI.register(this.registerData.username, this.registerData.password)
                if(user.success){
                    // 使用Pinia store保存用户信息
                    this.userStore.login(this.registerData.username, this.registerData.password, true)
                    this.$router.push('/')
                }else{
                    this.errorMsg = user.error
                    alert('注册失败:' + this.errorMsg);
                }
            } catch (error) {
                console.error('注册过程中发生错误:', error);
                alert('注册过程中发生错误，请稍后重试');
            } finally {
                // 结束加载
                this.loading = false;
            }
        },
        
        // 切换登录密码可见性
        toggleLoginPasswordVisibility() {
            this.showLoginPassword = !this.showLoginPassword;
        },
        
        // 切换注册密码可见性
        toggleRegisterPasswordVisibility() {
            this.showRegisterPassword = !this.showRegisterPassword;
        },
        
        // 防抖处理函数
        debounce(func, delay) {
            return (...args) => {
                if (this.debounceTimer) {
                    clearTimeout(this.debounceTimer);
                }
                this.debounceTimer = setTimeout(() => {
                    func.apply(this, args);
                }, delay);
            };
        },
        
        // 获取用户预览信息
        async fetchUserPreview() {
            const identifier = this.loginData.loginIdentifier.trim();
            
            if (!identifier) {
                this.preview.show = false;
                this.preview.userInfo = null;
                this.preview.error = null;
                return;
            }
            
            try {
                this.preview.loading = true;
                this.preview.error = null;
                
                let userData;
                
                // 尝试将登录标识转换为数字，如果成功则作为ID查询，否则作为用户名查询
                const numericId = parseInt(identifier);
                if (!isNaN(numericId)) {
                    // 是有效数字，作为ID查询
                    userData = await normalUserAPI.getUserById(numericId, ['id', 'user_name', 'user_image']);
                }
                
                // 如果ID查询失败，或者登录标识不是有效数字，则作为用户名查询
                if (!userData) {
                    userData = await normalUserAPI.getUserByName(identifier, ['id', 'user_name', 'user_image']);
                }
                
                if (userData) {
                    this.preview.userInfo = userData;
                    this.preview.show = true;
                } else {
                    this.preview.userInfo = null;
                    this.preview.show = true;
                    this.preview.error = '未找到该用户';
                }
            } catch (error) {
                console.error('获取用户预览信息失败:', error);
                this.preview.error = '获取用户信息失败';
                this.preview.userInfo = null;
                this.preview.show = true;
            } finally {
                this.preview.loading = false;
            }
        },
        
        // 处理登录标识符输入
        handleLoginIdentifierInput() {
            // 使用500ms防抖处理
            this.debounce(this.fetchUserPreview, 500)();
        }
    },
    // 在组件挂载时检查是否有记住的用户信息
    mounted() {
        // 修复：直接获取字符串值，不需要JSON.parse
        const rememberedLoginIdentifier = localStorage.getItem('rememberedUsername');
        const rememberedPassword = localStorage.getItem('rememberedPassword');
        
        if (rememberedLoginIdentifier) {
            this.loginData.loginIdentifier = rememberedLoginIdentifier;
        }
        if (rememberedPassword) {
            this.loginData.password = rememberedPassword;
            this.rememberMe = true; // 如果有保存的密码，自动勾选记住我
        }
    }
}
</script>
<template>
    <div class="GS_login">
        <div class="GS_login_bg">
            <div class="GS_login_box">
                <!-- 选项卡切换器 -->
                <div class="GS_login_tabs">
                    <button 
                        :class="['tab-button', { active: activeTab === 'login' }]"
                        @click="switchTab('login')"
                    >
                        登录
                    </button>
                    <button 
                        :class="['tab-button', { active: activeTab === 'register' }]"
                        @click="switchTab('register')"
                    >
                        注册
                    </button>
                </div>
                
                <!-- 登录表单 -->
                <div class="GS_login_form" v-show="activeTab === 'login'">
                    <div class="GS_login_form_item">
                        <!-- 账号预览区域 -->
                        <div class="user-preview" v-if="preview.show">
                            <!-- 加载中状态 -->
                            <div class="preview-loading" v-if="preview.loading">
                                <span class="loading-spinner"></span>
                                <span>正在加载...</span>
                            </div>
                            <!-- 有数据状态 -->
                            <div class="preview-content" v-else-if="preview.userInfo">
                                <img 
                                    :src="preview.userInfo.user_image" 
                                    :alt="preview.userInfo.user_name" 
                                    class="user-avatar"
                                >
                                <div class="user-info">
                                    <span class="user-name">{{ preview.userInfo.user_name }}</span>
                                    <span class="user-id">ID: {{ preview.userInfo.id }}</span>
                                </div>
                            </div>
                            <!-- 无数据状态 -->
                            <div class="preview-error" v-else-if="preview.error">
                                <span>{{ preview.error }}</span>
                            </div>
                        </div>
                        <label for="login-identifier">账号/ID</label>
                        <input 
                            type="text" 
                            id="login-identifier" 
                            v-model="loginData.loginIdentifier" 
                            required
                            placeholder="请输入账户名称或ID"
                            @input="handleLoginIdentifierInput"
                        >
                    </div>
                    <div class="GS_login_form_item">
                        <label for="login-password">密码</label>
                        <div class="password-input-container">
                            <input 
                                :type="showLoginPassword ? 'text' : 'password'" 
                                id="login-password" 
                                v-model="loginData.password" 
                                required
                                placeholder="请输入密码"
                            >
                            <div 
                                class="toggle-password-btn"
                                @click="toggleLoginPasswordVisibility"
                            >
                                {{ showLoginPassword ? '隐藏' : '显示' }}
                            </div>
                        </div>
                    </div>    
                    <div class="remember-me-container">
                        <label class="remember-me-label">
                            <input 
                                type="checkbox" 
                                v-model="rememberMe"
                            >
                            <span>记住我</span>
                        </label>
                    </div>
                    <div class="GS_login_form_item">
                        <button type="button" @click="handleLogin" :disabled="loading">
                            {{ loading ? '登录中...' : '登录' }}
                        </button>
                    </div>
                </div>
                
                <div class="GS_login_form" v-show="activeTab === 'register'">
                    <div class="GS_login_form_item">
                        <label for="reg-username">账号</label>
                        <input 
                            type="text" 
                            id="reg-username" 
                            v-model="registerData.username" 
                            required
                            placeholder="请设置账户名称"
                            @focus="setFocusState('regUsername', true)"
                            @blur="setFocusState('regUsername', false)"
                            @input="handleUsernameInput('regUsername', $event.target.value)"
                        >
                        <div 
                            class="input-hint" 
                            v-if="focusStates.regUsername && !validationErrors.regUsername"
                        >
                            账号名称不得超过12个字符
                        </div>
                        <div 
                            class="validation-error" 
                            v-if="validationErrors.regUsername"
                        >
                            {{ validationErrors.regUsername }}
                        </div>
                    </div>
                    <div class="GS_login_form_item">
                        <label for="reg-password">密码</label>
                        <div class="password-input-container">
                            <input 
                                :type="showRegisterPassword ? 'text' : 'password'" 
                                id="reg-password" 
                                v-model="registerData.password" 
                                required
                                placeholder="请设置密码"
                                @focus="setFocusState('regPassword', true)"
                                @blur="setFocusState('regPassword', false)"
                                @input="handlePasswordInput('regPassword', $event.target.value)"
                            >
                            <div 
                                class="toggle-password-btn"
                                @click="toggleRegisterPasswordVisibility"
                            >
                                {{ showRegisterPassword ? '隐藏' : '显示' }}
                            </div>
                        </div>
                        <div 
                            class="input-hint" 
                            v-if="focusStates.regPassword && !validationErrors.regPassword"
                        >
                            密码必须包含至少8个字符，包括字母、数字和特殊字符，且不超过25个字符
                        </div>
                        <div 
                            class="validation-error" 
                            v-if="validationErrors.regPassword"
                        >
                            {{ validationErrors.regPassword }}
                        </div>
                    </div>
                    <div class="GS_login_form_item">
                        <button type="button" @click="handleRegister" :disabled="loading">
                            {{ loading ? '注册中...' : '注册' }}
                        </button>
                    </div>
                </div>
            </div>            
        </div>
        <div class="GS_login_welcome">
            <p>创建账号既免费又简单。探索成千上万款游戏，</p>
            <p>与数百万新朋友一起畅玩吧</p>
        </div>
    </div>
</template>
<style scoped>
    .GS_login{
        width: 100%;
        min-height: 2000px;
        height: 100vh;
        background-color: #181a21;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .GS_login_bg{
        width: 100%;
        height: 800px;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
        background: url('/WebResources/login_bg.jpg') center/cover;
    }
    .GS_login_box {
        position: absolute;
        border: 0.1px solid transparent;
        border-image: linear-gradient(135deg, #36a4da87, #6046f386) 1;
        z-index: 1;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 620px;
        min-height: 400px;
        height: auto;
    }
    /* 选项卡样式 */
    .GS_login_tabs {
        display: flex;
        flex-direction: row;
        position: relative;
        z-index: 1;
    }
    
    .tab-button {
        flex: 1;
        padding: 12px 20px;
        background-color: #181a21;
        border: none;
        color: #999;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        box-sizing: border-box;
        border-bottom: 2px solid transparent;
    }
    
    .tab-button:first-child {
        border-radius: 5px 0 0 0;
    }
    
    .tab-button:last-child {
        border-radius: 0 5px 0 0;
    }
    
    .tab-button:hover {
        background-color: #20222a;
        color: #ccc;
    }
    
    .tab-button.active {
        color: #fff;
        border-bottom-color: #1a9efe;
    }
    
    .GS_login_form {
        width: 100%;
        min-height: 350px;
        height: auto;
        position: relative;
        z-index: 1;
        background-color: #181a21;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-bottom: 20px;
    }
    .GS_login_form_item {
        width: 80%;
        margin-top: 25px;
        display: flex;   
        flex-wrap: wrap;
        justify-content: flex-end;
    }
    .GS_login_form_item label {
        display: block;
        width: 100%;
        font-size: 16px;
        font-weight: bold;
        color: #ccc;
        margin-bottom: 8px;
    }
    
    .GS_login_form_item input {
        width: 100%;
        font-size: 16px;
        box-sizing: border-box;
        padding: 10px 12px;
        border-radius: 5px;
        border: 1px solid #444;
        background-color: rgba(0, 0, 0, 0.3);
        color: #fff;
        transition: border-color 0.3s ease;
    }
    
    .GS_login_form_item input:focus {
        outline: none;
        border-color: #1a9efe;
    }
    
    .GS_login_form_item input::placeholder {
        color: #666;
    }
    
    /* 密码输入框容器样式 */
    .password-input-container {
        position: relative;
        width: 100%;
    }
    
    /* 输入提示样式 */
    .input-hint {
        width: 100%;
        font-size: 12px;
        color: #999;
        margin-top: 5px;
        text-align: left;
    }
    
    /* 验证错误提示样式 */
    .validation-error {
        width: 100%;
        font-size: 12px;
        color: #ff6b6b;
        margin-top: 5px;
        text-align: left;
    }
    
    .GS_login_form_item button {
        width: 100%;
        margin-top: 30px;
        box-sizing: border-box;
        font-size: 16px;
        padding: 12px;
        border-radius: 5px;
        border: none;
        background-color: #1a9efe;
        color: #fff;
        cursor: pointer;
        font-weight: bold;
        transition: background-color 0.3s ease;
    }
    
    .GS_login_form_item button:hover {
        background-color: #178ee9;
    }
    
    .GS_login_form_item button:active {
        background-color: #147ec6;
    }
    .GS_login_welcome{
        color: white;
        width: 80%;
        height: 100px;
        margin-top: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
        /* 显示/隐藏密码按钮样式 */
    .toggle-password-btn {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        border-left: 2px solid #bebebe5b;
        border-right: none;
        border-top: none;
        border-bottom: none;
        background: #11121700;
        text-align: end;
        color: #d5d5d5;
        font-size: 16px;
        cursor: pointer;
    }
    
    .toggle-password-btn:hover {
        color: #147ec6;
    }
    
    /* 记住我复选框样式 */
    .remember-me-container {
        width: 80%;
        margin-top: 10px;
        display: flex;
        justify-content: flex-end;
    }
    
    .remember-me-label {
        display: flex;
        align-items: center;
        cursor: pointer;
        color: #ccc;
        font-size: 14px;
    }
    
    .remember-me-label input[type="checkbox"] {
        margin-right: 8px;
        cursor: pointer;
        width: 16px;
        height: 16px;
    }
    
    .remember-me-label span {
        user-select: none;
    }
    
    /* 账号预览样式 */
    .user-preview {
        width: 100%;
        margin-bottom: 10px;
        padding: 15px;
        border-radius: 5px;
        background: linear-gradient(135deg, rgba(26, 158, 254, 0.1) 0%, rgba(26, 158, 254, 0.05) 100%);
        border: 1px solid rgba(26, 158, 254, 0.3);
        display: flex;
        align-items: center;
        transform: translateY(-10px);
        opacity: 0;
        animation: slideIn 0.3s ease forwards;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    
    /* 滑入动画 */
    @keyframes slideIn {
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    /* 加载中状态 */
    .preview-loading {
        display: flex;
        align-items: center;
        gap: 15px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        width: 100%;
    }
    
    /* 加载骨架屏 */
    .loading-spinner {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(90deg, rgba(26, 158, 254, 0.2) 25%, rgba(26, 158, 254, 0.4) 50%, rgba(26, 158, 254, 0.2) 75%);
        background-size: 200% 100%;
        animation: loadingPulse 1.5s ease-in-out infinite;
        flex-shrink: 0;
    }
    
    /* 骨架屏闪烁动画 */
    @keyframes loadingPulse {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }
    
    /* 有数据状态 */
    .preview-content {
        display: flex;
        align-items: center;
        gap: 15px;
        width: 100%;
    }
    
    /* 用户头像 */
    .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid rgba(26, 158, 254, 0.5);
        box-shadow: 0 2px 6px rgba(26, 158, 254, 0.3);
        flex-shrink: 0;
    }
    
    /* 用户信息容器 */
    .user-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
    }
    
    /* 用户名 */
    .user-name {
        color: rgba(255, 255, 255, 0.95);
        font-size: 16px;
        font-weight: 500;
    }
    
    /* 用户ID */
    .user-id {
        color: rgba(255, 255, 255, 0.6);
        font-size: 12px;
    }
    
    /* 无数据状态 */
    .preview-error {
        color: rgba(255, 107, 107, 0.9);
        font-size: 14px;
        width: 100%;
        text-align: center;
    }
</style>