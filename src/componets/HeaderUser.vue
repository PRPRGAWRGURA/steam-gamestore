<script>
import { useUserStore } from '@/stores/userStore';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
export default {
    data() {
        return {
            isHover: false,
        }
    },
    setup() {
        const userStore = useUserStore();
        const router = useRouter();
        
        // 从Pinia store获取用户信息
        const currentUser = computed(() => userStore.currentUser);
        
        const logout = () => {
            // 清除所有相关缓存
            if (userStore.currentUser) {
                // 清除用户点赞状态缓存
                localStorage.removeItem(`liked_posts_${userStore.currentUser.user_name}`);
            }
            // 清除社区帖子缓存
            localStorage.removeItem('community_posts');
            localStorage.removeItem('community_posts_time');
            // 清除用户数量缓存
            localStorage.removeItem('user_count');
            // 调用userStore的logout方法，清除用户信息
            userStore.logout();
            router.push('/login');
        };
        
        return {
            currentUser,
            logout,
            userStore
        }
    }
}
</script>

<template>
    <div class="GS_header_right">
        <!-- 未登录时显示登录按钮 -->
        <router-link  class="GS_header_right_login" v-if="!currentUser" to="/login">登录</router-link>
        
        <!-- 已登录时显示用户头像和用户名 -->
        <div v-else class="user-profile" @mouseenter="isHover = true" @mouseleave="isHover = false">
            <img 
                :src="currentUser.user_image" 
                alt="用户头像" 
                class="user-avatar"
            >
            <span class="user-name" >{{ currentUser.user_name }}</span>
            <div class="dropdown" v-if="isHover">
                <router-link  class="dropdown-item" to="/useritem">查看个人资料</router-link>
                <div class="dropdown-item" @click="logout">退出登录</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.GS_header_right {
    flex: 1;
    position: relative;
    display: flex;
    justify-content: flex-end;
    align-items: start;
    padding-right: 10px;
}

.GS_header_right_login {
    position: relative;
    text-decoration: none;
    text-align: center;
    line-height: 30px;
    top: 1.5px;
    width: 60px;
    height: 30px;
    border: none;
    background-color: #5b7e10e4;
    color: rgba(255, 255, 255, 0.797);
    font-size: 15px;
    transition: all 0.3s ease-in-out;
}
.GS_header_right_login:hover {
    background-color: #5c7e10;
    color: rgb(255, 255, 255);
}

/* 用户头像和用户名样式 */
.user-profile {
    width: 120px;
    top: 1.5px;
    display: flex;
    align-self: flex-start;
    position: relative;
    background-color: #78787868;   
}
.user-avatar {
    width: 30px;
    height: 30px;
    cursor: pointer;
    object-fit: cover;
    border: 1.5px solid transparent;
    box-sizing: border-box;
}
.user-name {
    width: 100%;
    border-left: #1a9efe 3px solid;
    box-sizing: border-box;
    padding-left: 8px;
    padding-top: 5px;
    color: #1a9efe;
    font-weight: bold;
    font-size: 14px;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: all 0.3s ease-in-out;
}
.user-name:hover {
    background-color: #2ba7ff2a;
}

.dropdown {
    position: absolute;
    display: flex;
    flex-direction: column;
    top: 30px;
    right: 0;
    border-left: 3px solid #1a9efe;
    border-top: #555555 1px solid;
    box-sizing: border-box;
    width: 90px;
    height: 55px;
    background-color: #78787868;
    font-size: 12px;
    transition: all 0.3s ease-in-out;
    cursor: pointer;
}
.dropdown-item {
    flex: 1;
    box-sizing: border-box;
    color: rgba(255, 255, 255, 0.707);
    padding-left: 8px;
    padding-top: 5px;
    text-decoration: none;
    transition: background-color 0.3s ease-in-out;
}
.dropdown-item:hover {
    color: rgb(255, 255, 255);
    background-color: #2ba7ff2a;
}

</style>