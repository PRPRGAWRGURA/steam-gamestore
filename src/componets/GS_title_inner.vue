<script>
export default {
    props: {
        title: {
            type: String,
            required: true, // 改为必需，因为每个标题都应该有值
        },
        index: {
            type: Number,
            required: true,
        },
        active: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        handleClick() {
            this.$emit('title-click', this.index);
        },
    },
}
</script>
<template>
    <span class="GS_title_text" @click="handleClick">
        <span class="text_inner" :class="{active}">{{ title }}</span>
        <img src="/WebResources/lower_mark.svg" :class="{active}">
    </span>
</template>
<style scoped>
    /* 现有样式保持不变 */
    .GS_title_text{
        margin-right: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 3px;
        height: 100%;
        width: 70px;
        cursor: pointer;
    }
    .GS_title_text .text_inner{
        height: 20px;
        color: rgb(255, 255, 255);
        font-size: 12px;
        box-sizing: border-box;
        transition: all 0.2s ease-in-out;
    }
    .GS_title_text .text_inner.active {
        color: #1a9efe;
        border-bottom: 3px solid #1a9efe;
    }
    
    .GS_title_text img{
        filter: brightness(0) invert(1);
        width: 12px;
        height: auto;
        transform: translateY(1px);
        transition: transform 0.2s ease-in-out, filter 0.2s ease-in-out;
    }
    
    .GS_title_text img.active {
        transform: rotate(45deg);
        filter: brightness(0) saturate(100%) invert(40%) sepia(99%) saturate(1442%) hue-rotate(192deg) brightness(100%) contrast(96%);
    }
</style>