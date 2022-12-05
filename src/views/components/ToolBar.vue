<template>
  <div>
    <div class="tool-bar">
      <search-md></search-md>
      <div class="rt-box">
        <a-popover placement="bottom">
          <template slot="content">
            <setting></setting>
          </template>
          <div class="icon-box"><i class="icon-setting"></i> 设置</div>
        </a-popover>
        <a-popover placement="bottom" @visibleChange="visibleChange">
          <template slot="content">
            <ul class="tool-box">
              <li v-for="item in toolList" :key="item.id" @click="changeToolState(item)" :class="{'t_active': item.visiable}">
                <i class="icon">
                  <i class="icon" :class="item.iconClass"></i>
                </i>
                <p>{{ item.name }}</p>
              </li>
            </ul>
          </template>
          <div class="icon-box"><i class="icon-tool"></i> 工具</div>
        </a-popover>
        <a-popover trigger="click" placement="bottomRight" :getPopupContainer="
            (triggerNode) => {
              return triggerNode.parentNode;
            }
          ">
          <template slot="content">
            <layer-tree @onShow="changeWidget"></layer-tree>
          </template>
          <div class="icon-box"><i class="icon-layer"></i> 图层</div>
        </a-popover>
        <a-popover @visibleChange="visibleChange" placement="bottomRight">
          <template slot="content">
            <custom-baselayer></custom-baselayer>
          </template>
          <div class="icon-box"><i class="icon-baselayer"></i> 底图</div>
        </a-popover>
        <!-- <div class="icon-box" @click.stop="onScreen">
          <i
            class="icon-fullscreen"
            :class="isFullscreen ? 'icon-fullscreen1' : ''"
          ></i>
          全屏
        </div> -->
      </div>
    </div>
  </div>
</template>
<script>
import SearchMd from "./SearchMd.vue";
import LayerTree from "@/widgets/LayerTree/index";
import Setting from "@/widgets/SceneSetting/index";
import BaseLayerSwitcher from "@/widgets/BaseLayerSwitcher/index";
export default {
  props: {
    toolList: { type: Array },
  },
  components: {
    "search-md": SearchMd,
    "layer-tree": LayerTree,
    "setting": Setting,
    "custom-baselayer": BaseLayerSwitcher,
  },
  data() {
    return {
      isFullscreen: false,
      clientHeight: document.body.clientHeight,
    };
  },
  mounted() {
    const vm = this;
    window.onresize = () => {
      return (() => {
        window.clientHeight = document.body.clientHeight;
        vm.clientHeight = window.clientHeight;
      })();
    };
  },
  methods: {
    visibleChange(e) {
      this.$emit("visibleChange", e);
    },
    changeToolState(o) {
      this.$set(o, "visiable", !o.visiable);
      this.$emit("changeToolState", o);
    },
    changeWidget(o) {
      this.$emit("changeWidget", o);
    },
    onScreen() {
      if (this.isFullscreen) {
        Cesium.Fullscreen.exitFullscreen();
      } else {
        Cesium.Fullscreen.requestFullscreen(document.body);
      }
    },
  },
  watch: {
    clientHeight: function () {
      this.isFullscreen = Cesium.Fullscreen.fullscreen;
    },
  },
};
</script>
<style scoped>
.tool-bar {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 3;
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.6);
  padding: 0 15px;
  height: 36px;
  line-height: 36px;
}
.rt-box {
  position: absolute;
  top: 0;
  right: 20px;
  height: 100%;
}
.icon-layer {
  display: inline-block;
  width: 18px;
  height: 18px;
  background: url(../../assets/img/tool/sys-layer.png) no-repeat;
  background-size: 100%;
  vertical-align: -4px;
}
.map-tool {
  display: inline-block;
  width: 48px;
  height: 48px;
  position: absolute;
  top: 120px;
  right: 12px;
  z-index: 3;
  background: rgba(0, 0, 0, 0);
  color: white;
}

.tool-bar ul .icon {
  margin-right: 10px;
  vertical-align: -2px;
}
.ant-dropdown {
  margin-top: 10px;
  margin-left: -15px;
}
.ant-dropdown-link {
  color: rgba(255, 255, 255, 0.5);
}
.ant-dropdown-menu {
  background: rgba(0, 0, 0, 0.3);
}

.icon-box {
  display: inline-block;
  cursor: pointer;
  vertical-align: text-bottom;
  margin-left: 20px;
}
.icon-box i {
  opacity: 0.8;
}
.icon-box:hover {
  color: #fff;
}
.icon-box:hover i {
  opacity: 1;
}
.icon-setting {
  display: inline-block;
  width: 18px;
  height: 18px;
  background: url(../../assets/img/tool/sys-setting.png) no-repeat;
  background-size: 100%;
  vertical-align: -4px;
}

.icon-tool {
  display: inline-block;
  width: 14px;
  height: 14px;
  background: url(../../assets/img/tool/sys-tool.png) no-repeat;
  background-size: 100%;
  vertical-align: -2px;
}
.icon-baselayer {
  display: inline-block;
  width: 18px;
  height: 18px;
  background: url(../../assets/img/tool/sys-baselayer.png) no-repeat;
  background-size: 100%;
  vertical-align: -4px;
}
.icon-fullscreen {
  display: inline-block;
  width: 16px;
  height: 16px;
  background: url(../../assets/img/tool/sys-fullscreen.png) no-repeat;
  background-size: 100%;
  vertical-align: -3px;
}
.icon-box .icon-fullscreen1 {
  background: url(../../assets/img/tool/sys-fullscreen1.png) no-repeat;
  background-size: 100%;
}
.tool-box {
  list-style: none;
  padding: 0;
  width: 140px;
  margin: 0 auto;
  font-size: 0;
  text-align: center;
}
.tool-box li {
  display: inline-block;
  margin: 8px 0;
  width: 68px;
  font-size: 12px;
  line-height: 1.2;
}

.tool-box li p {
  margin: 0;
}
.tool-box li .anticon {
  font-size: 16px;
}
.anticon-setting {
  font-size: 18px;
  vertical-align: -3px;
  margin-right: 5px;
}
.icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  overflow: hidden;
}
.tool-box li:hover,
.tool-box li.t_active {
  cursor: pointer;
  color: #1890ff;
}
.tool-box li:hover .icon > .icon,
.tool-box li.t_active .icon > .icon {
  position: relative;
  left: -14px;
  -webkit-filter: drop-shadow(14px 0 0 #1890ff);
  filter: drop-shadow(14px 0 0 #1890ff);
}
.icon-above {
  background: url("../../assets/img/tool/list/sys-above.png") no-repeat center;
  background-size: 100%;
}
.icon-area {
  background: url("../../assets/img/tool/list/sys-area.png") no-repeat center;
  background-size: 100%;
}
.icon-camera {
  background: url("../../assets/img/tool/list/sys-camera.png") no-repeat center;
  background-size: 100%;
}
.icon-coor {
  background: url("../../assets/img/tool/list/sys-coor.png") no-repeat center;
  background-size: 100%;
}
.icon-distance {
  background: url("../../assets/img/tool/list/sys-distance.png") no-repeat center;
  background-size: 100%;
}
.icon-linked {
  background: url("../../assets/img/tool/list/sys-linked.png") no-repeat center;
  background-size: 100%;
}
.icon-property {
  background: url("../../assets/img/tool/list/sys-property.png") no-repeat center;
  background-size: 100%;
}
.icon-slice {
  background: url("../../assets/img/tool/list/sys-slice.png") no-repeat center;
  background-size: 100%;
}
.icon-slicebox {
  background: url("../../assets/img/tool/list/sys-box.png") no-repeat center;
  background-size: 100%;
}
.icon-sun {
  background: url("../../assets/img/tool/list/sys-sun.png") no-repeat center;
  background-size: 100%;
}
.icon-positon {
  background: url("../../assets/img/tool/list/sys-positon.png") no-repeat center;
  background-size: 100%;
}
.icon-hawkeye {
  background: url("../../assets/img/tool/list/sys-hawkeye.png") no-repeat center;
  background-size: 100%;
}
.icon-label {
  background: url("../../assets/img/tool/list/sys-label.png") no-repeat center;
  background-size: 100%;
}
.icon-flatten {
  background: url("../../assets/img/tool/list/sys-flatten.png") no-repeat center;
  background-size: 100%;
}
.icon-terrain {
  background: url("../../assets/img/tool/list/sys-terrain.png") no-repeat center;
  background-size: 100%;
}
.icon-bloom {
  background: url("../../assets/img/tool/list/sys-bloom.png") no-repeat center;
  background-size: 100%;
}
.icon-sys-weather {
  background: url("../../assets/img/tool/list/sys-weather.png") no-repeat center;
  background-size: 100%;
}
.icon-sys-firstview {
  background: url("../../assets/img/tool/list/sys-firstview.png") no-repeat center;
  background-size: 100%;
}
.icon-sys-handyroam {
  background: url("../../assets/img/tool/list/sys-handyroam.png") no-repeat center;
  background-size: 100%;
}

</style>
<style>
.ant-popover .ant-popover-inner {
  background-color: rgba(255, 255, 255, 0.8);
}
.tool-bar .ant-popover-inner-content {
  padding: 10px 0px;
}
</style>
