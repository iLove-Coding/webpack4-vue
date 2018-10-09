<template>
     <div class="loggin-from--big">
        <input class="loggin-from__input"/>
        <button class="loggin-from__confim">确定</button>
        {{userInfo.username}}
        {{userInfo.sex}}
    </div>
</template>
<script>
export default {
    data() {
        return {
            userInfo: {}
        }
    },
    created() {
        $http.get('/api/user').then((res) => {
            this.userInfo = res.data;
        })
    }
}
</script>
<style lang="sass" scoped>
    .loggin-from--big {
        .loggin-from__input {
            background-color: yellow;
        }
        .loggin-from__confim {
            background-color: pink;
        }
    }
</style>
