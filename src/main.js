import Vue from 'vue'
import App from './App.vue'
// 导入路由组件
import router from './router/router'
// 引入全局样式文件
import './assets/css/global.css'
// 导入字体图标
import './assets/font/iconfont.css'
// 导入 axios
import axios from 'axios'

// 配置 axios的请求基准路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/'
// 将 axios挂载到Vue的原型对象上
Vue.prototype.$axios = axios

// 将全局 echarts对象挂载到 Vue的原型对象上
Vue.prototype.$echarts = window.echarts

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  render: h => h(App),
})
