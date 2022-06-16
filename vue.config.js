const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,  //关闭语法检查,
  devServer: {
    port: 8999, //  端口号的配置
  }

})
