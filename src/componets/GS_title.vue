<script>
import GS_title_inner from './GS_title_inner.vue';
import GS_title_search from './GS_title_search.vue';
import GS_title_expand from './GS_title_expand.vue';
export default {
    components: {
        GS_title_inner,
        GS_title_search,
        GS_title_expand,
    },
    data() {
        return {
            titles: [
                { id: 0, name: '浏览' },
                { id: 1, name: '推荐' },
                { id: 2, name: '类别' },
                { id: 3, name: '畅玩方式' },
                { id: 4, name: '特别栏目' }
            ],
            activeIndex: null,
        }
    },
    computed: {
        isExpanded() {
            return this.activeIndex !== null;
        }
    },
    methods: {
        handleTitleClick(index) {
            // 切换展开/折叠状态
            this.activeIndex = this.activeIndex === index ? null : index;
        },
    },
}
</script>

<template>
    <div class="GS_title_container">
        <div class="GS_title">
            <div class="GS_title_box">
                <div class="box-left">
                    <GS_title_inner v-for="item in titles" 
                    :key="item.id" 
                    :index="item.id" 
                    :title="item.name"
                    :active="activeIndex === item.id"
                    @title-click="handleTitleClick"/>
                </div>
                <div class="box-right">
                    <GS_title_search/>
                </div>
            </div>
            <transition name="expand">
                <div class="box-bottom" v-show="isExpanded">
                    <GS_title_expand :active-index="activeIndex"/>
                </div>
            </transition>
        </div>
    </div>
</template>

<style scoped>
    .GS_title_container{
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        height: 100%;
        z-index: 50;
        pointer-events: none;
    }
    .GS_title{
        color: white;
        width: 100%;
        top: 0;
        position: sticky;
        background-color: #18273890;
        backdrop-filter: blur(10px);
        box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        pointer-events: auto;
    }
    .GS_title_box{
        display: flex;
        justify-content:flex-start;
        align-items: center;
        width: 1220px;
        height: 48px;
    }
    .box-left{
        flex: 1;
        width: 50%;
        display: flex;
        justify-content:flex-start;
        align-items: center;
        height: 100%;
    }
    .box-right{
        flex: 1;
        width: 50%;
        display: flex;
        justify-content:flex-end;
        align-items: center;
        height: 100%;
    }
    .box-bottom {
        width: 1220px;
    }
    .expand-enter-active {
        transition: all 0.3s ease-in-out;
    }
    .expand-enter-from, .expand-leave-to {
        opacity: 0;
        transform: translateY(-10px);
    }
</style>