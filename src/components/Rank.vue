<!--地区销售排行图表 -->
<template>
  <div class="com_container">
    <div class="com_chart" ref="rankRef"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  nmae: 'Rank',
  data() {
    return {
      chartInstance: null,
      allData: null, // 服务器返回的数据
      startValue: 0, // 区域缩放的起点值
      endValue: 9, //区域缩放的终点值
      timerId: null, // 定时器的标识
    }
  },

  created() {
    this.$socket.registerCallBack('rankData', this.getData)
  },
  mounted() {
    this.initChart()
    this.$socket.send({
      action: 'getData',
      socketType: 'rankData',
      chartName: 'rank',
      vaule: '',
    })
    window.addEventListener('resize', this.screenAdapter)
    // 在页面加载完成的时候,主动的进行屏幕的适配
    this.screenAdapter()
  },
  beforeDestroy() {
    // 组件销毁之前,将监听器取消掉
    window.removeEventListener('resize', this.screenAdapter)
    clearInterval(this.timerId)
    this.$socket.unRegisterCallBack('rankData')
  },
  methods: {
    // 初始化echartInstance对象
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.rankRef, this.theme)
      const initOption = {
        title: {
          text: '▎地区销售排行',
          left: 23,
          top: 23,
        },

        grid: {
          top: '28%',
          right: '5%',
          bottom: '5%',
          left: '3%',
          containLabel: true, // 开启后,在坐标轴移动时,文字也能移动
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            z: 0,
            lineStyle: {
              color: '#2D3443',
            },
            itemStyle: {
              // 指明颜色渐变的方向
              // 指明不同百分比之下的颜色的值
              color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
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
        },
        xAxis: {
          type: 'category',
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            type: 'bar',
            label: {
              show: true,
              position: 'top',
              textStyle: {
                color: 'white',
              },
            },
          },
        ],
      }
      this.chartInstance.setOption(initOption)
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // },
    // 获取服务器的数据
    async getData(ret) {
      // http://127.0.0.1:8888/api/rank
      this.allData = ret
      //   // 对数据进行排序
      this.allData.sort((a, b) => {
        return b.value - a.value // 从大到小排序
      })
      this.updataChart()
      this.startInterval()
    },
    updataChart() {
      const colorArr = [
        ['#0BA82C', '#4FF778'],
        ['#2E72BF', '#23E5E5'],
        ['#5052EE', '#AB6EE5'],
      ]
      //   图例的数据
      //   所有省份形成的数组
      const rankNames = this.allData.map((item) => {
        return item.name
      })
      //   所有省份销售金额的数组
      const rankValues = this.allData.map((item) => {
        return item.value
      })

      const dataOption = {
        xAxis: {
          data: rankNames,
        },
        dataZoom: {
          show: false,
          startValue: this.startValue,
          endValue: this.endValue,
        },
        series: [
          {
            data: rankValues,
            itemStyle: {
              color: (arg) => {
                let targetColorArr = null
                if (arg.value > 280) {
                  targetColorArr = colorArr[0]
                } else if (arg.value > 170) {
                  targetColorArr = colorArr[1]
                } else {
                  targetColorArr = colorArr[2]
                }
                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: targetColorArr[0],
                  },
                  {
                    offset: 1,
                    color: targetColorArr[1],
                  },
                ])
              },
            },
          },
        ],
      }
      this.chartInstance.setOption(dataOption)
    },
    screenAdapter() {
      // 和分辨率相关的配置项
      const titleFontSize = (this.$refs.rankRef.offsetWidth / 100) * 3.6
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
              barBorderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0],
            },
          },
        ],
      }
      this.chartInstance.setOption(adapterOption)
      // 手动的调用图表的 resize,才能产生效果
      this.chartInstance.resize()
    },
    startInterval() {
      if (this.timerId) {
        clearInterval(this.timerId)
      }
      this.timerId = setInterval(() => {
        this.startValue++
        this.endValue++
        if (this.endValue > this.allData.length - 1) {
          this.startValue = 0
          this.endValue = 9
        }
        this.updataChart()
      }, 2000)
    },
  },
  computed: {
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

<style>
</style>