<template>
  <div class="developer-layout">
    <!-- React应用容器 -->
    <div id="react-app-container" style="width: 100%; height: 100vh;"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { loadMicroApp } from 'qiankun'

// 存储微应用实例
const microAppRef = ref(null)

onMounted(() => {
  // 手动加载React微应用
  loadReactMicroApp()
})

onUnmounted(() => {
  // 卸载微应用
  if (microAppRef.value) {
    microAppRef.value.unmount()
  }
})

function loadReactMicroApp() {
  // 创建微应用实例
  microAppRef.value = loadMicroApp({
    name: 'react-developer-app',
    // 直接使用绝对路径加载构建后的JS文件
    entry: {
      scripts: ['/GS_Developer/dist/assets/index-dCxVwryB.js']
    },
    container: '#react-app-container',
    props: {
      message: 'Hello from Vue App',
      routerBase: '/developer'
    }
  })
}
</script>

<style scoped>
.developer-layout {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>