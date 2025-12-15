<script>
import TitleInner from './TitleInner.vue';
import TitleSearch from './TitleSearch.vue';
import TitleExpand from './TitleExpand.vue';
export default {
    components: {
        TitleInner,
        TitleSearch,
        TitleExpand,
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
            activeIndex: -1,
        }
    },
    computed: {
        isExpanded() {
            return this.activeIndex !== -1;
        }
    },
    methods: {
        handleTitleClick(index) {
            // 切换展开/折叠状态
            this.activeIndex = this.activeIndex === index ? -1 : index;
        },
    },
}
</script>

<template>
    <div class="GS_title_container">
        <div class="GS_title">
            <div class="GS_title_box">
                <div class="box-left">
                    <TitleInner v-for="item in titles" 
                    :key="item.id" 
                    :index="item.id" 
                    :title="item.name"
                    :active="activeIndex === item.id"
                    @title-click="handleTitleClick"/>
                </div>
                <div class="box-right">
                    <TitleSearch/>
                </div>
            </div>
            <transition name="expand">
                <div class="box-bottom" v-show="isExpanded">
                    <TitleExpand :active-index="activeIndex"/>
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
        overflow: hidden;
    }
    .expand-enter-active {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-height: 1000px;
    }
    .expand-leave-active {
        transition: none;
    }
    .expand-enter-from, .expand-leave-to {
        max-height: 0;
        overflow: hidden;
        opacity: 0;
    }
</style>