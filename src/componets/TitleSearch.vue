<script>
export default {
    data() {
        return {
            searchText: '',
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
    .GS_title_search button:hover{
        background-color: #2ba7ff;
    }
        .GS_title_search button img{
            position: absolute;
            filter: brightness(10);
            width: 60%;
            height: 60%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            transition: all 0.3s ease-in-out;
        }
        .GS_title_search button img:hover{
            width: 70%;
            height: 70%;
        }
</style>