<script>
import GS_header_user from './GS_header_user.vue';
import { useUserStore } from '../stores/userStore';
import { computed } from 'vue';
export default {
    components: {
        GS_header_user
    },
    setup() {
        const userStore = useUserStore();
        // 初始化加载用户信息
        userStore.initUser();
        
        return {
            userStore
        }
    },
    data() {
        return {
            activeIndex: 0,
            navItems: [
                { text: '商店', href: '/' },
                { text: '社区', href: '/community' },
                { text: '关于', href: '/about' },
                { text: '客服', href: '/support' },
                { text: '库', href: '/gamebar' },
            ],
        }
    },
    computed: {
        currentUser() {
            return this.userStore?.currentUser;
        },
        isLoggedIn() {
            const items = [...this.navItems];
            if (this.currentUser && this.currentUser.user_name) {
                items.push({ text: this.currentUser.user_name, href: '/useritem' });
            }
            return items;
        }
    },
    watch: {
        // 监听路由变化，更新activeIndex
        $route(to) {
            const index = this.isLoggedIn.findIndex(item => item.href === to.path)
            if (index !== -1) {
                this.activeIndex = index
            }
        }
    },
    mounted() {
        // 初始化时根据当前路由设置activeIndex
        const index = this.navItems.findIndex(item => item.href === this.$route.path)
        if (index !== -1) {
            this.activeIndex = index
        }
    }
}
</script>

<template>
    <div class="GS_header_container">
        <div class="GS_header">
            <div class="GS_header_left">
                <div class="STEAM">
                    <img src="/WebResources/STEAM.png" alt=""><a href="/">STEAM™</a>
                </div>
                <div class="GS_header_left_nav">
                    <router-link 
                        v-for="(item, index) in isLoggedIn.filter(i => i.text !== '库' || currentUser)" 
                        :key="index" 
                        :to="item.href" 
                        :class="{active: activeIndex === index}"
                    >{{ item.text }}</router-link>
                </div>
            </div>
            <GS_header_user />
        </div>
    </div>
</template>

<style scoped>
.GS_header_container{
        width: 100%;
        height: 100px;
        background-color: #171a21;
        box-shadow: 0 3px 5px rgba(8, 8, 8, 0.465);
        z-index: 10000;
        position: relative;
        display: flex;
        justify-content: center;
    }
    .GS_header{
        width: 1220px;
        height: 100%;
        display: flex;        
    }
    .GS_header_left{
        flex: 1;
        display: flex;
        justify-content: start;
        align-items: center;
        gap: 50px;
    }
    .GS_header_left .STEAM{  
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .GS_header_left .STEAM img{
        width: 60px;
        height: 60px;
        border-radius: 50%;
    }
    .GS_header_left .STEAM a{
        font-size: 24px;
        font-weight: bold;
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
    }
    .GS_header_left_nav a,
    .GS_header_left_nav router-link{
        margin-left: 10px;
        font-size: 16px;
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        display: inline-block;
    }
    .GS_header_left_nav a.active,
    .GS_header_left_nav router-link.active{
        color: #1a9efe;
        border-bottom: 3px solid #1a9efe;
        box-sizing: border-box;
    }
</style>