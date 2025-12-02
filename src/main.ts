import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./style.css";
//加入渲染markdown文本的vue库，2025/11/18
import ElementPlusX from "vue-element-plus-x";
import App from "./App.vue";

const app = createApp(App);
app.use(ElementPlus);
app.mount("#app");
