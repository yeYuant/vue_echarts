<!--销量趋势统计图表-->
<template>
  <div class="com_container">
    <div class="title" :style="comStyle">
      <span>{{ '▎' + showTitile }}</span>
      <span class="iconfont title_icon" :style="comStyle" @click="showChoice = !showChoice">&#xe6eb;</span>
      <div class="select_con" v-if="showChoice" :style="marginStyle">
        <div class="select_item" v-for="item in selectTypes" :key="item.key" @click="handleSelect(item.key)">
          {{ item.text }}
        </div>
      </div>
    </div>

    <div class="com_chart" ref="trendRef"></div>
  </div>
</template>

<script>
export default {
  name: 'Trend',
  data() {
    return {
      chartInstance: null,
      allData: null, // 服务器返回的数据
      showChoice: false, // 是否显示可选项
      choiceTtype: 'map', // 显示的数据类型
      titleFontSize: 0, // 图表文字的大小
    }
  },
  created() {
    this.$socket.registerCallBack('trendData', this.getData)
  },
  mounted() {
    this.initChart()
    this.$socket.send({
      action: 'getData',
      socketType: 'trendData',
      chartName: 'trend',
      vaule: '',
    })
    window.addEventListener('resize', this.screenAdapter)
    // 在页面加载完成的时候,主动的进行屏幕的适配
    this.screenAdapter()
  },
  beforeDestroy() {
    // 组件销毁之前,将监听器取消掉
    window.removeEventListener('resize', this.screenAdapter)
    this.$socket.unRegisterCallBack('trendData')
  },
  methods: {
    // 初始化echartInstance对象
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.trendRef, 'chalk')
      const initOption = {
        grid: {
          top: '25%',
          right: '2%',
          bottom: '2%',
          left: '1%',
          containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          left: 20,
          top: '13%',
          icon: 'circle',
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
        },
        yAxis: {
          type: 'value',
        },
      }
      this.chartInstance.setOption(initOption)
    },
    // },
    // 获取服务器的数据

    getData(ret) {
      // http://127.0.0.1:8888/api/trend
      this.allData = ret
      this.updataChart()
    },
    updataChart() {
      // 半透明的颜色值
      const colorArr1 = ['rgba(11, 168, 44, 0.5)', 'rgba(44, 110, 255, 0.5)', 'rgba(22, 242, 217, 0.5)', 'rgba(254, 33, 30, 0.5)', 'rgba(250, 105, 0, 0.5)']
      // 全透明的颜色值
      const colorArr2 = ['rgba(11, 168, 44, 0)', 'rgba(44, 110, 255, 0)', 'rgba(22, 242, 217, 0)', 'rgba(254, 33, 30, 0)', 'rgba(250, 105, 0, 0)']

      // 类目轴的数据
      const timeArr = this.allData.common.month
      //   y轴的数据 series之下的数据
      const valueArr = this.allData[this.choiceTtype].data
      const serisArr = valueArr.map((item, index) => {
        return {
          name: item.name,
          type: 'line',
          data: item.data,
          stack: this.choiceTtype, // 设置 折线图堆叠
          areaStyle: {
            color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                // 百分之0 的颜色值
                offset: 0,
                color: colorArr1[index],
              },
              {
                // 百分之100 的颜色值
                offset: 1,
                color: colorArr2[index],
              },
            ]),
          },
        }
      })
      //   图例的数据
      const legendArr = valueArr.map((item) => {
        return item.name
      })
      const dataOption = {
        xAxis: {
          data: timeArr,
        },
        series: serisArr,
        legend: {
          data: legendArr,
        },
      }
      this.chartInstance.setOption(dataOption)
    },
    screenAdapter() {
      // 和分辨率相关的配置项
      this.titleFontSize = (this.$refs.trendRef.offsetWidth / 100) * 3.6
      const adapterOption = {
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize,
          textStyle: {
            fontSize: this.titleFontSize / 2,
          },
        },
      }
      this.chartInstance.setOption(adapterOption)
      // 手动的调用图表的 resize,才能产生效果
      this.chartInstance.resize()
    },
    handleSelect(currentType) {
      this.choiceTtype = currentType
      this.updataChart()
      //   每点击一次选项后,隐藏选项框
      this.showChoice = false
    },
  },
  computed: {
    selectTypes() {
      if (!this.allData) {
        return []
      } else {
        return this.allData.type.filter((item) => {
          return item.key != this.choiceTtype
        })
      }
    },
    // 图表的显示标题根据数据的titile值进行改变
    showTitile() {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.choiceTtype].title
      }
    },
    // 标题的字体大小
    comStyle() {
      return {
        fontSize: this.titleFontSize + 'px',
      }
    },
    marginStyle() {
      return {
        marginLeft: this.titleFontSize / 1.7 + 'px',
      }
    },
  },
}
</script>
<style lang="less" scoped>
.title {
  position: absolute;
  left: 28px;
  top: 13px;
  font-weight: 600;
  z-index: 99;
  color: #fff;
  .title_icon {
    margin-left: 7px;
    cursor: pointer;
  }
  .select_item {
    cursor: pointer;
  }
  .select_con {
    background-color: #222733;
  }
}
</style>