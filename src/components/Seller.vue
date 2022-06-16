<!-- 商家销量统计的横向柱状图 -->
<template>
  <div class="com_container">
    <div class="com_chart" ref="sellerRef"></div>
  </div>
</template>

<script>
export default {
  name: 'Seller',
  data() {
    return {
      chartInstance: null,
      allData: null, // 服务器返回的数据
      currentPage: 1, // 当前显示的页码数
      totalPage: 0, // 总共的页码数量
      timerId: null, // 定时器的标识
    }
  },
  mounted() {
    this.initChart()
    this.getData()
    window.addEventListener('resize', this.screenAdapter)
    // 在页面加载完成的时候,主动的进行屏幕的适配
    this.screenAdapter()
  },
  beforeDestroy() {
    clearInterval(this.timerId)
    // 组件销毁之前,将监听器取消掉
    window.removeEventListener('resize', this.screenAdapter)
  },
  methods: {
    // 初始化echartInstance对象
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.sellerRef, 'chalk')
      // 对图表初始化配置的控制
      const initOption = {
        title: {
          text: '▎商家销售统计',
          left: 23,
          top: 23,
        },
        grid: {
          top: '17%',
          right: '2%',
          bottom: '2%',
          left: '1%',
          containLabel: true, // 开启后,在坐标轴移动时,文字也能移动
        },
        xAxis: {
          type: 'value',
        },
        yAxis: {
          type: 'category',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            z: 0,
            lineStyle: {
              color: '#2D3443',
            },
          },
        },
        series: [
          {
            type: 'bar',
            label: {
              show: true,
              position: 'right',
              textStyle: {
                color: 'white',
              },
            },
            itemStyle: {
              // 指明颜色渐变的方向
              // 指明不同百分比之下的颜色的值
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                // 百分之0状态之下的颜色值
                {
                  offset: 0,
                  color: '#5052EE',
                },
                // 百分之100状态之下的颜色值
                {
                  offset: 1,
                  color: '#AB6EE5',
                },
              ]),
            },
          },
        ],
      }
      this.chartInstance.setOption(initOption)
      // 对图像进行鼠标移入移出的事件监听
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // 获取服务器的数据
    async getData() {
      // http://127.0.0.1:8888/api/seller
      const { data: ret } = await this.$axios.get('seller')
      this.allData = ret
      // 对数据进行排序
      this.allData.sort((a, b) => {
        return a.value - b.value // 从小到大排序
      })
      // 如果每页显示5条数据,总的页码数
      this.totalPage = this.allData.length % 5 === 0 ? this.allData.length / 5 : this.allData.length / 5 + 1
      this.updateChart()
      this.startInterval()
    },
    // 更新图表
    updateChart() {
      // 对数据进行每页显示5条的限制
      const start = (this.currentPage - 1) * 5
      const end = this.currentPage * 5
      const showData = this.allData.slice(start, end)
      const sellerNames = showData.map((item) => {
        return item.name
      })
      const sellerValues = showData.map((item) => {
        return item.value
      })
      const dataOption = {
        yAxis: {
          data: sellerNames,
        },
        series: [
          {
            data: sellerValues,
          },
        ],
      }
      this.chartInstance.setOption(dataOption)
    },
    startInterval() {
      if (this.timerId) {
        clearInterval(this.timerId)
      }
      this.timerId = setInterval(() => {
        // 让页码每3秒进行一次切换
        this.currentPage++
        if (this.currentPage > this.totalPage) {
          // 页码切换完毕之后重新回到第一页进行循环
          this.currentPage = 1
        }
        this.updateChart()
      }, 3000)
    },
    // 当浏览器的大小发生改变时,会调用此方法,来进行屏幕的适配
    screenAdapter() {
      // 和分辨率相关的配置项
      const titleFontSize = (this.$refs.sellerRef.offsetWidth / 100) * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize,
            },
          },
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0],
            },
          },
        ],
      }
      this.chartInstance.setOption(adapterOption)
      // 手动的调用图表的 resize,才能产生效果
      this.chartInstance.resize()
    },
  },
}
</script>

<style lang="less" scoped>
</style>
