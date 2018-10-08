const root=document.createElement('div');
document.body.appendChild(root);

import Vue from "vue";

import router from "./router"; // 路由
import store from "./store"; // 状态管理

import App from "App"; // 导入App组件（为什么这样导入？请看第四段中的第7）

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount(root);
