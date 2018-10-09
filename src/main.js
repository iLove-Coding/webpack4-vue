const root=document.getElementById('app');

import Vue from "vue";

import router from "./router"; // 路由
import store from "./store"; // 状态管理

import App from "App"; // 导入App组件

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount(root);
