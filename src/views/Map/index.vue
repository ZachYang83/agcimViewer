<template>
  <div class="map">
    <div id="containCesium">
      <tool-bar
        :toolList="toolList"
        @changeToolState="changeToolState"
        @visibleChange="visibleChange"
        @changeWidget="changeWidget"
      ></tool-bar>
      <!-- 工具列表 -->
      <div v-for="item in curToolList" :key="item.code">
        <component v-bind:is="item.app" @close="changeToolState"></component>
      </div>
      <!-- 其他地图微件 start -->
      <div v-for="item in curMapWdList" :key="item.code">
        <component
          v-bind:is="item.app"
          @close="changeWidget"
          :ref="item.code"
        ></component>
      </div>
    </div>
    <!-- 其他工具列表 -->
    <div v-for="item in curToolList1" :key="item.code">
      <component v-bind:is="item.app" @close="changeToolState"></component>
    </div>
  </div>
</template>
<script>
import * as agcim from "@/sdk/index.js";
window.agcim = agcim;
// window.agcim = { ...Cesium, ...agcim };

import AgcimLayerTree from "@/sdk/scene/layerTree";
import ToolBar from "@/views/components/ToolBar.vue";
import serverData4Config from "@/views/js/net/serverData4Config";
import MapInit from "./js/index";
import { mapWdList } from "./js/config";

let tApps = {};
let wApps = {};
let curMapWdList = [
  { code: "SurroundObservation" },
  { code: "Legend" },
  { code: "CesiumNavigation" },
]; //默认开启
export default {
  components: {
    "tool-bar": ToolBar,
  },
  props: {
    toolList: { type: Array },
    // mapWdList: { type: Array }, //可后台配
  },
  data() {
    return {
      //当前打开的工具
      curToolList: [],
      //当前打开的工具，需要在地图之外
      curToolList1: [],
      //地图上的微件，可默认，可调用时开启
      curMapWdList: [],
    };
  },
  mounted() {
    this.initMap();
  },
  methods: {
    initMap: function() {
      let _t = this;
      if (!window.CIM.layerTree) {
        window.CIM.layerTree = new AgcimLayerTree();
      }
      var res = _t.getLayerTreeData();
      res
        .then(function(data) {
          MapInit.creatMap("containCesium", data);
          _t.initWidgets(curMapWdList);
        })
        .catch(function(error) {
          return;
        });
    },
    initWidgets(arr) {
      let vm = this;
      mapWdList.forEach((item) => {
        let app = item.code;
        wApps[app] = require(`@/widgets/${app}/index.vue`).default;
      });
      this.$nextTick(() => {
        if (arr && wApps) {
          for (let i = 0; i < arr.length; i++) {
            let o = arr[i];
            for (let i = 0; i < this.curMapWdList.length; i++) {
              if (this.curMapWdList[i].code === o.code) {
                return this.curMapWdList.splice(i, 1);
              }
            }
            if (!o.app) {
              o.app = wApps[o.code];
            }
            this.curMapWdList.push(o);
          }
        }
      });
    },
    changeWidget(o) {
      let vm = this;
      for (let i = 0; i < vm.curMapWdList.length; i++) {
        if (vm.curMapWdList[i].code === o.code) {
          return vm.$refs[o.code][0].onShow(o);
        }
      }
      if (!o.app) {
        let newO = {
          code: o.code,
          app: wApps[o.code],
        };
        vm.curMapWdList.push(newO);
      }
      vm.$nextTick(() => {
        vm.$refs[o.code][0].onShow(o);
      });
    },

    visibleChange(e) {
      if (e && this.isEmptyObject(tApps)) {
        this.toolList.forEach((item) => {
          let app = item.code;
          tApps[app] = require(`@/widgets/${app}/index.vue`).default;
        });
      }
    },
    //打开工具
    changeToolState(o) {
      for (let i = 0; i < this.curToolList.length; i++) {
        if (this.curToolList[i].code === o.code) {
          //去掉打开状态
          for (let j = 0; j < this.toolList.length; j++) {
            if (this.toolList[j].code === o.code) {7
              this.toolList[j].visiable = false;
            }
          }
          return this.curToolList.splice(i, 1);
        }
      }

      for (let i = 0; i < this.curToolList1.length; i++) {
        if (this.curToolList1[i].code === o.code) {
          //去掉打开状态
          for (let j = 0; j < this.toolList.length; j++) {
            if (this.toolList[j].code === o.code) {
              this.toolList[j].visiable = false;
            }
          }
          if (o.code == "MultiScreenLinkage") {
            //可待某个字段区分
            document.getElementById("fastNav").style.right = "585px";
          }
          return this.curToolList1.splice(i, 1);
        }
      }

      if (!o.app) {
        o.app = tApps[o.code];
      }
      if (o.code == "MultiScreenLinkage") {
        this.curToolList1.push(o);
        this.$nextTick(() => {
          let mc = document.getElementById("modelContainer");
          document.getElementById("fastNav").style.right =
            mc.offsetWidth + 585 + "px";
        });
      } else {
        this.curToolList.push(o);
      }
    },
    isEmptyObject(e) {
      for (let t in e) return !1;
      return !0;
    },
    //获取图层树数据
    async getLayerTreeData() {
      let p = {
        projectName: CIM_LAYERTREE_NAME,
        userId: this.$store.state.user.userId,
      };
      let data = await serverData4Config.getLayerTreeData(p);
      return data;
    },
  },
};
</script>
<style scoped>
.map {
  position: relative;
  display: flex;
  height: 100%;
}
.map #containCesium {
  position: relative;
  height: 100%;
  flex: 1;
}
.map > div {
  flex: 1;
  height: 100%;
}
.map /deep/ .cesium-viewer-toolbar {
  top: 70px;
}
</style>
