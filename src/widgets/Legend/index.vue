<template>
  <div>
    <div class="legend-box" v-if="legendState=='max' && legendList.length > 0">
      <div class="legend-title">
        <label>图例</label>
        <span @click="legendMin">
          <a-icon type="down" />
        </span>
      </div>
      <div class="lengend-list vscroll" v-show="isLegendShow">
        <div v-for="legend in legendList" :key="legend.id">
          <div v-if="legend.islyChecked">
            <div class="lengend-list-title" @click="toggleList(legend)">{{legend.title}}</div>
            <div class="legend-img" v-show="legend.isShow">
              <label v-if="legend.type=='imgSrc'">
                <img :src="legend.lengendData" style="width:90%;height:90%;margin:5%" />
              </label>
              <ul v-else-if="legend.type=='list'">
                <li v-for="item in legend.lengendData" :key="item.value">
                  <span v-if="!item.style && !item.lineType" :style="{background:item.material}"></span>
                  <span v-if="!item.style && item.lineType && item.lineType=='PolylineArrow'" class="legend-line">
                    <a-icon type="arrow-right" :style="{color:item.material}" />
                  </span>
                  <span v-if="item.style" :style="item.style"></span>
                  <label>{{item.value}}</label>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="legend-box legend-box-min" v-else-if="legendState=='min' && legendList.length > 0">
      <div class="legend-title">
        <label>图例</label>
        <span @click="legendMax">
          <a-icon type="up" />
        </span>
      </div>
    </div>
  </div>
</template>
<script>
import legend from "./js/legend";
export default {
  data() {
    return {
      isLegendShow: true,
      legendList: [],
      legendState: "max",
    };
  },
  mounted() {
    setTimeout(() => {
      let all = CIM.layerTree._layerTreeData;
      let ids = [];
      for (let o in all) {
        //WFS图层有图例
        if ("040003" === all[o].layerType) {
          ids.push(o);
        }
      }
      this.setLegenData(ids);
    }, 500);
  },
  methods: {
    closeSelf() {
      this.isLegendShow = false;
    },
    toggleList(legend) {
      legend.isShow = !legend.isShow;
    },
    setLegenData(ids) {
      this.isLegendShow = true;
      for (var i = 0; i < ids.length; i++) {
        legend.parentVue = this;
        legend.legendList = [];
        legend.initializeLayerHandler();
      }
    },
    legendMax() {
      this.legendState = "max";
    },
    legendMin() {
      this.legendState = "min";
    },
  },
};
</script>
<style scoped>
.legend-box {
  right: 20px;
  position: fixed;
  bottom: 20px;
  height: 200px;
  min-width: 150px;
  background-color: rgba(255, 255, 255, 0.863);
  border-radius: 4px;
  box-shadow: 1px 3px 6px 1px rgba(63, 63, 63, 0.425);
  color: black;
  z-index: 1;
}
.legend-box .legend-title {
  width: 100%;
  height: 25px;
  line-height: 23px;
  padding: 0 5px;
}
.legend-box.legend-box-min {
  height: 26px;
  width: 66px;
}
.legend-box .legend-title span {
  padding: 0 5px;
  cursor: pointer;
  float: right;
}

.legend-box .legend-title span:hover {
  background-color: aquamarine;
}
.lengend-list {
  height: calc(100% - 24px);
  overflow-y: auto;
  padding: 0 10px;
}
.lengend-list-title {
  padding-left: 10px;
  cursor: pointer;
  /* height: 25px; */
  line-height: 25px;
}
.legend-img {
  height: calc(100% - 21px);
}
.legend-box ul {
  padding: 3px;
  height: 100%;
  overflow-y: auto;
  margin-bottom: 5px;
}
.legend-box li {
  list-style: none;
  padding: 1px 5px;
  font-size: 12px;
  margin: 0;
  line-height: 15px;
}
.legend-box li span {
  width: 20px;
  height: 4px;
  display: inline-block;
  margin-right: 5px;
  vertical-align: middle;
}
.legend-box li span.polyline {
  height: 4px;
}
.legend-box li span.polygon {
  height: 20px;
}
.legend-box li span.legend-line {
  margin-right: 10px;
  /* width: 20px; */
  height: 20px;
  /* margin-top: -10px; */
}
.legend-line .anticon {
  font-size: 18px;
  width: 100%;
  float: left;
}
</style>