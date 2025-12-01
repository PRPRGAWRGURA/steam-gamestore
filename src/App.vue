<script>
import GS_header from './componets/GS_header.vue';
import GS_bottom from './componets/GS_bottom.vue';
export default {
    components: {
        GS_header,
        GS_bottom,
    },
}
</script>

<template>
    <GS_header></GS_header>
    <router-view></router-view>
    <GS_bottom></GS_bottom>
</template>

<style>
    body{
    font-family: 'Motiva Sans', Arial, sans-serif; 
    min-height: 100vh;
    background-color: #000000;
    padding: 0;
    margin: 0;
    }
</style>


