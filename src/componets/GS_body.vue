<script>

</script>

<template>
    <div class="GS_body">  
        <slot></slot>
    </div>
</template>

<style scoped>
    .GS_body {
        position: relative;
        z-index: 1;
        width: 100%;
        height: 200vh;
        /* 使用多重径向渐变创建点光源效果 */
        background: 
            /* 蓝色点光源 - 位于左上方 */
            radial-gradient(circle at 30% 0%, #1b566293 5%, transparent 65%),
            /* 紫色点光源 - 位于右上方 */
            radial-gradient(circle at 70% 0%, #372f8382 5%, transparent 65%),
            /* 底部黑色背景 */
            linear-gradient(to bottom, #1b2838 0%, #1b2838 100%);
        /* 确保渐变覆盖整个元素 */
        background-size: 100% 100%;  
    }
   
</style>