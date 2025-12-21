<script>
export default {
    data() {
        return {
            searchText: '',
            cartCount: 0,
        }
    },
    methods: {
        handleSearch() {
            console.log(this.searchText);
        }
    }
}
</script>

<template>
    <span class="GS_title_search">
        <input type="text" placeholder="搜索商店" v-model.lazy="searchText">
        <button type="submit" @click="handleSearch"><img src="/WebResources/serch.svg" alt=""></button>
    </span>
    <router-link v-show="cartCount > 0" to="/shoppingcart" class="GS_shoppingcart">
        <img src="/WebResources/shoppingcart.svg" alt="">
        <span>购物车</span>
        <span>{{ cartCount }}</span>
    </router-link>
</template>

<style scoped>
    .GS_title_search{
        width: 460px;
        height: 75%;
        padding: 0 10px;
        position: relative;
    }
    .GS_title_search input{
        position: absolute;
        left: 0;
        width: 440px;
        height: 100%;
        border: none;
        border: 0.5px solid #ffffff4e;
        color: #fbfbfb;
        font-size: small;
        border-radius: 2px 0 0 2px;
        box-sizing: border-box;
        background-color: rgba(96, 96, 96, 0.516);
        font-size: 16px;
        padding: 0 12px;
    }
    .GS_title_search input:hover{
        border: 0.5px solid #1aa0ffae;
    }
    .GS_title_search input:focus{
        outline: none;
        border: 0.5px solid #1a9fff;
        background-color: rgba(56, 56, 56, 0.516);
    }
    .GS_title_search input::placeholder{
        font-style: italic;
        font-size: 13px;
        color: #efeded91;
    }
    .GS_title_search input:hover::placeholder{
        color: #ffffff;
    }
    .GS_title_search button{
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        right: 10px;   
        width: 35px;
        height: 100%;
        border: none;
        border-radius: 0 2px 2px 0;
        background-color: #1a9fff;
        color: #fff;
        font-size: 16px;
        padding: 0 10px;
    }
    .GS_title_search:hover button{
        background-color: #2ba7ff;
    }
        .GS_title_search button img{
            filter: brightness(10);
            width: 22px;
            height: auto;
            transition: all 0.3s ease-in-out;
        }
        .GS_title_search:hover button img{
            transform: scale(1.05);
        }
    .GS_shoppingcart {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 10px;
        text-decoration: none;
        height: 75%;
        background-color: #1a9fff;
    }
    .GS_shoppingcart span{
        font-size: 16px;
        line-height: 20px;
        color: white;
    }
    .GS_shoppingcart:hover {
        background-color: #2ba7ff;
    }
    .GS_shoppingcart:hover img {
        transform: scale(1.05);
    }
    .GS_shoppingcart img{
        margin-right: 5px;
        width: 20px;
        height: auto;
        object-fit: contain;
        transition: all 0.3s ease-in-out;
    }
</style>