<!-- 热销商品统计 -->
<template>
  <div class="com_container">
    <div class="com_chart" ref="hotRef"></div>
    <span class="iconfont icon_left" :style="comStyle" @click="toLeft">&#xe6ef;</span>
    <span class="iconfont icon_right" :style="comStyle" @click="toRight">&#xe6ed;</span>
    <span class="cat_name" :style="comStyle">{{ catName }}</span>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from '../utils/theme_utils'
export default {
  name: 'Hot',
  data() {
    return {
      chartInstance: null,
      allData: null, // 服务器返回的数据
      currentIndex: 0, // 当前所展示的一级菜单
      titleFontSize: 0, // 标题的字体大小
    }
  },

  created() {
    this.$socket.registerCallBack('hotproductData', this.getData)
  },
  mounted() {
    this.initChart()
    this.$socket.send({
      action: 'getData',
      socketType: 'hotproductData',
      chartName: 'hotproduct',
      vaule: '',
    })
    window.addEventListener('resize', this.screenAdapter)
    // 在页面加载完成的时候,主动的进行屏幕的适配
    this.screenAdapter()
  },
  beforeDestroy() {
    // 组件销毁之前,将监听器取消掉
    window.removeEventListener('resize', this.screenAdapter)
    this.$socket.unRegisterCallBack('hotproductData')
  },
  methods: {
    // 初始化echartInstance对象
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.hotRef, this.theme)
      const initOption = {
        title: {
          text: '▎热销商品占比',
          left: 23,
          top: 23,
        },
        tooltip: {
          show: true,
          formatter: (arg) => {
            let thirdCateGory = arg.data.children
            // 计算出所有三级分类数值的总和
            let total = 0
            thirdCateGory.forEach((item) => {
              total += item.value
            })
            let retStr = ''
            thirdCateGory.forEach((item) => {
              const result = (item.value / total) * 100
              retStr += `${item.name}: ${result.toFixed(2) + '%'}<br/> `
            })
            return retStr
          },
        },
        legend: {
          top: '15%',
          icon: 'circle',
        },
        series: [
          {
            type: 'pie',
            label: {
              // show: false,
            },
            emphasis: {
              label: {
                show: true,
              },
              labelLine: {
                show: false,
              },
            },
          },
        ],
      }
      this.chartInstance.setOption(initOption)
    },
    // },
    // 获取服务器的数据
    async getData(ret) {
      // http://127.0.0.1:8888/api/hotproduct

      this.allData = ret
      this.updataChart()
    },
    updataChart() {
      // 获取图像的数据
      const legendData = this.allData[this.currentIndex].children.map((item) => {
        return item.name
      })
      const seriesData = this.allData[this.currentIndex].children.map((item) => {
        return {
          name: item.name,
          value: item.value,
          children: item.children,
        }
      })
      const dataOption = {
        legend: {
          data: legendData,
        },
        series: [
          {
            data: seriesData,
          },
        ],
      }
      this.chartInstance.setOption(dataOption)
    },
    screenAdapter() {
      // 和分辨率相关的配置项
      this.titleFontSize = (this.$refs.hotRef.offsetWidth / 100) * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize,
          },
        },
        series: [
          {
            radius: this.titleFontSize * 4.3,
            center: ['50%', '60%'],
          },
        ],
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 1.2,
          },
        },
      }
      this.chartInstance.setOption(adapterOption)
      // 手动的调用图表的 resize,才能产生效果
      this.chartInstance.resize()
    },
    toLeft() {
      this.currentIndex--
      if (this.currentIndex < 0) {
        this.currentIndex = this.allData.length - 1
      }
      this.updataChart()
    },
    toRight() {
      this.currentIndex++
      if (this.currentIndex > this.allData.length - 1) {
        this.currentIndex = 0
      }
      this.updataChart()
    },
  },
  computed: {
    catName() {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.currentIndex].name
      }
    },
    // 标题字体大小
    comStyle() {
      return {
        fontSize: this.titleFontSize + 'px',
        color: getThemeValue(this.theme).titleColor,
      }
    },
    ...mapState(['theme']),
  },
  watch: {
    theme() {
      this.chartInstance.dispose() // 销毁当前的图表
      this.initChart() // 重新以最新的主体名称初始化图表对象
      this.screenAdapter() // 完成图表的展示
      this.updataChart() // 更新图表的展示
    },
  },
}
</script>

<style lang="less" scoped>
.icon_left {
  position: absolute;
  left: 10%;
  top: 57%;
  transform: translateY(-50%);
  color: #fff;
  cursor: pointer;
}
.icon_right {
  position: absolute;
  right: 10%;
  top: 57%;
  transform: translateY(-50%);
  color: #fff;
  cursor: pointer;
}
.cat_name {
  position: absolute;
  bottom: 9%;
  right: 15%;
  color: #fff;
}
</style>