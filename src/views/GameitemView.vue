<script>
import GS_body from '@/componets/GS_body.vue';
import GS_container from '@/componets/GS_container.vue';
export default {
    name: 'GameitemView',
    data() {
        return {
            gameitem: {
                name: '游戏名称',
                description: '游戏描述'
            }
        }
    }
}
</script>
<template>
    <GS_body>
        <GS_container>
            <div class="gameitem-container">
                <div class="gameitem-info">
                    <h1>{{ gameitem.name }}</h1>
                    <p>{{ gameitem.description }}</p>
                </div>
            </div>
        </GS_container>
    </GS_body>
</template>
<style scoped>
    .gameitem-container {
        padding: 20px;
    }
    .gameitem-info {
        margin-bottom: 20px;
    }
</style>