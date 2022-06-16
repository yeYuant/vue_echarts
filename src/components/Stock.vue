 <!-- 库存销量分析 -->
<template>
  <div class="com_container">
    <div class="com_chart" ref="stockRef"></div>
  </div>
</template>

<script>
export default {
  name: 'Stock',
  data() {
    return {
      chartInstance: null,
      allData: null, // 服务器返回的数据
      currentIndex: 0, // 控制页码数
      timeId: null, //定时器的标识
    }
  },
  created() {
    this.$socket.registerCallBack('stockData', this.getData)
  },
  mounted() {
    this.initChart()
    this.$socket.send({
      action: 'getData',
      socketType: 'stockData',
      chartName: 'stock',
      vaule: '',
    })
    window.addEventListener('resize', this.screenAdapter)
    // 在页面加载完成的时候,主动的进行屏幕的适配
    this.screenAdapter()
  },
  beforeDestroy() {
    // 组件销毁之前,将监听器取消掉
    window.removeEventListener('resize', this.screenAdapter)
    clearInterval(this.timeId)
  },
  methods: {
    // 初始化echartInstance对象
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.stockRef, 'chalk')
      const initOption = {
        title: {
          text: '▎库存和销量分析',
          top: 23,
          left: 23,
        },
      }
      this.chartInstance.setOption(initOption)
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timeId)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // },
    // 获取服务器的数据
    async getData(ret) {
      // http://127.0.0.1:8888/api/stock
      this.allData = ret
      this.updataChart() // 在更新完currentIndex之后,需要更新页面
      this.startInterval()
    },
    updataChart() {
      const centerArr = [
        ['18%', '40%'],
        ['50%', '40%'],
        ['82%', '40%'],
        ['34%', '75%'],
        ['66%', '75%'],
      ]
      const colorArr = [
        ['#4FF778', '#0BA82C'],
        ['#E5DD45', '#E8B11C'],
        ['#E8821C', '#E55445'],
        ['#5052EE', '#AB6EE5'],
        ['#23E5E5', '#2E72BF'],
      ]
      // 获取图像的数据
      const start = this.currentIndex * 5
      const end = (this.currentIndex + 1) * 5
      const showData = this.allData.slice(start, end)
      const seriesArr = showData.map((item, index) => {
        return {
          type: 'pie',
          center: centerArr[index],
          hoverAnimation: false, //关闭鼠标移入饼图时的动画效果
          labelLine: {
            show: false, //隐藏指示线
          },
          label: {
            position: 'center',
            color: colorArr[index][0],
          },
          data: [
            {
              name: item.name + '\n' + item.sales,
              value: item.sales,
              itemStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0, [
                  {
                    offset: 0,
                    color: colorArr[index][0],
                  },
                  {
                    offset: 1,
                    color: colorArr[index][1],
                  },
                ]),
              },
            },
            {
              value: item.stock,
              itemStyle: {
                color: '#333843',
              },
            },
          ],
        }
      })
      const dataOption = {
        series: seriesArr,
      }
      this.chartInstance.setOption(dataOption)
    },
    screenAdapter() {
      // 和分辨率相关的配置项
      const titleFontSize = (this.$refs.stockRef.offsetWidth / 100) * 3.6
      const innerRadius = titleFontSize * 2
      const outterRadius = innerRadius * 1.125
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        series: [
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2,
            },
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2,
            },
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2,
            },
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2,
            },
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2,
            },
          },
        ],
      }
      this.chartInstance.setOption(adapterOption)
      // 手动的调用图表的 resize,才能产生效果
      this.chartInstance.resize()
    },
    startInterval() {
      if (this.timeId) {
        clearInterval(this.timeId)
      }
      this.timeId = setInterval(() => {
        this.currentIndex++
        if (this.currentIndex > 1) {
          this.currentIndex = 0
        }
        this.updataChart()
      }, 3000)
    },
  },
}
</script>

<style>
</style>