<script>
import { normalUserAPI } from '@/utils/normalUserAPI'
export default {
    data() {
        return {
            activeTab: 'login', // 当前激活的选项卡：'login' 或 'register'
            // 登录表单数据
            loginData: {
                username: '',
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
            }
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
        
        // 验证用户名
        validateUsername(username) {
            if (username.length > 12) {
                return '账号名称不能超过12个字符';
            }
            return '';
        },
        
        // 验证密码
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
            if (!this.loginData.username || !this.loginData.password) {
                alert('请输入账号和密码');
                return;
            }
            const user = await normalUserAPI.login(this.loginData.username, this.loginData.password)
            if(user.success){
                alert('登录成功！');
                localStorage.setItem('user', JSON.stringify(user.data))
                // 修复记住我功能：直接保存用户名和密码，而不是JSON格式
                if (this.rememberMe) {
                    localStorage.setItem('rememberedUsername', this.loginData.username);
                    localStorage.setItem('rememberedPassword', this.loginData.password);
                } else {
                    localStorage.removeItem('rememberedUsername');
                    localStorage.removeItem('rememberedPassword');
                }
                this.$router.push('/')
            }else{
                this.errorMsg = user.error
                alert('登录失败:' + this.errorMsg);
            }
        },
        
        // 注册提交
        async handleRegister() {
            // 验证注册表单
            this.validationErrors.regUsername = this.validateUsername(this.registerData.username);
            this.validationErrors.regPassword = this.validatePassword(this.registerData.password);
            
            // 如果有验证错误，不提交表单
            if (this.validationErrors.regUsername || this.validationErrors.regPassword) {
                alert('请检查输入是否符合要求');
                return;
            }
            
            const user = await normalUserAPI.register(this.registerData.username, this.registerData.password)
            if(user.success){
                alert('注册成功！');
                localStorage.setItem('user', JSON.stringify(user.data))
                this.$router.push('/')
            }else{
                this.errorMsg = user.error
                alert('注册失败:' + this.errorMsg);
            }
        },
        
        // 切换登录密码可见性
        toggleLoginPasswordVisibility() {
            this.showLoginPassword = !this.showLoginPassword;
        },
        
        // 切换注册密码可见性
        toggleRegisterPasswordVisibility() {
            this.showRegisterPassword = !this.showRegisterPassword;
        }
    },
    // 在组件挂载时检查是否有记住的用户信息
    mounted() {
        // 修复：直接获取字符串值，不需要JSON.parse
        const rememberedUsername = localStorage.getItem('rememberedUsername');
        const rememberedPassword = localStorage.getItem('rememberedPassword');
        
        if (rememberedUsername) {
            this.loginData.username = rememberedUsername;
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
                        <label for="login-username">账号</label>
                        <input 
                            type="text" 
                            id="login-username" 
                            v-model="loginData.username" 
                            required
                            placeholder="请输入账户名称"
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
                        <button type="button" @click="handleLogin">登录</button>
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
                        <button type="button" @click="handleRegister">注册</button>
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
        height: 100%;
        background-color: #181a21;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .GS_login_bg{
        width: 1200px;
        height: 800px;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
        background-color: rgba(24, 26, 33, 0.95);
    }
    
    /* 使用伪元素创建背景层 */
    .GS_login_bg::before {
        content: '';
        position: absolute;
        background: url('/WebResources/login_bg.png') center/cover;
        filter: blur(3px) brightness(0.25);
        transform: rotate(-30deg);
        transform-origin: center;
        width: 140%;
        height: 140%;
        left: -20%;
        top: -20%;
        z-index: 0;
    }
    .GS_login_box {
        position: absolute;
        z-index: 1;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 620px;
        height: 400px;
        
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
        height: 350px;
        position: relative;
        z-index: 1;
        background-color: #181a21;
        display: flex;
        flex-direction: column;
        align-items: center;
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
</style>