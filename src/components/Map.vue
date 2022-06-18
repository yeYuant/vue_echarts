<!--商家地图分布图表-->
<template>
  <div class="com_container" @dblclick="reverMap">
    <div class="com_chart" ref="mapRef"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'
import { getProvinceMapInfo } from '../utils/map_utils'
export default {
  name: 'Map',
  data() {
    return {
      chartInstance: null,
      allData: null, // 服务器返回的数据
      mapData: {}, // 对当前点击的省份的地图矢量数据的缓存
      ProControl: true, //   定义一个控制点击省份时双击事件失效的值
    }
  },

  created() {
    this.$socket.registerCallBack('mapData', this.getData)
  },
  mounted() {
    this.initChart()
    this.$socket.send({
      action: 'getData',
      socketType: 'mapData',
      chartName: 'map',
      vaule: '',
    })
    window.addEventListener('resize', this.screenAdapter)
    // 在页面加载完成的时候,主动的进行屏幕的适配
    this.screenAdapter()
  },
  beforeDestroy() {
    // 组件销毁之前,将监听器取消掉
    window.removeEventListener('resize', this.screenAdapter)
    this.$socket.unRegisterCallBack('mapData')
  },
  methods: {
    // 初始化echartInstance对象
    async initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.mapRef, this.theme)
      const ret = await axios.get('http://localhost:8999/static/map/china.json')
      this.$echarts.registerMap('china', ret.data)
      const initOption = {
        title: {
          text: '▎商家分布',
          top: 23,
          left: 23,
        },
        geo: {
          type: 'map',
          map: 'china',
          top: '5%',
          bottom: '5%',
          itemStyle: {
            areaColor: '#2E72BF',
            borderColor: '#333',
          },
          label: {
            show: true,
            color: '#fff',
          },
        },
        legend: {
          bottom: '8%',
          left: '3%',
          orient: 'vertical',
        },
      }
      this.chartInstance.setOption(initOption)
      this.chartInstance.on('click', async (arg) => {
        //   当我们点击地图之后,arg.name所打印的数据是我们当前所点击的省份,省份的名称是中文
        const provinceInfo = getProvinceMapInfo(arg.name)
        // 判断当前所点击的省份de地图的矢量数据是否在 this.mapData中存在
        if (!this.mapData[provinceInfo.key]) {
          // 获取省份对应的地图的矢量数据
          const ret = await axios.get('http://localhost:8999/' + provinceInfo.path)
          this.mapData[provinceInfo.key] = ret.data
          this.$echarts.registerMap(provinceInfo.key, ret.data)
        }
        const changeOption = {
          geo: {
            map: provinceInfo.key,
          },
        }
        this.chartInstance.setOption(changeOption)
      })
    },
    // 获取服务器的数据,对dataAll进行赋值后,使用 updataChart()更新图表
    async getData(ret) {
      // http://127.0.0.1:8888/api/map

      this.allData = ret
      this.updataChart()
    },
    updataChart() {
      const legendArr = this.allData.map((item) => {
        return item.name
      })
      const seriesArr = this.allData.map((item) => {
        // return 的这个对象就代表的是一个类别下的所有散点数据
        // 如果想在地图中显示散点的数据,我们就需要给散点的图表增加一个配置, coordinateSyetem:geo
        return {
          type: 'effectScatter',
          name: item.name,
          data: item.children,
          coordinateSystem: 'geo',
          //设置圆圈大小
          symbolSize: 14,
          rippleEffect: {
            scale: 6, //缩放 涟漪动画范围大小
            brushType: 'stroke',
          },
        }
      })
      const dataOption = {
        legend: {
          data: legendArr,
        },
        series: seriesArr,
      }
      this.chartInstance.setOption(dataOption)
    },
    screenAdapter() {
      // 和分辨率相关的配置项
      const titleFontSize = (this.$refs.mapRef.offsetWidth / 100) * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        legend: {
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2,
          },
        },
      }
      this.chartInstance.setOption(adapterOption)
      // 手动的调用图表的 resize,才能产生效果
      this.chartInstance.resize()
    },
    // 点击省份地图,回到中国地图
    reverMap() {
      const reverOption = {
        geo: {
          map: 'china',
        },
      }
      this.chartInstance.setOption(reverOption)
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