<template>
  <div class="base-page">
    <ag-header></ag-header>
    <div class="main">
      <base-menu
        @openMainBox="openMainBox"
        :sidebarList="sidebarList"
      ></base-menu>
      <fast-nav
        @openMainBox="openMainBox"
        :fastnavList="fastnavList"
        @changeToolState="changeToolState"
      ></fast-nav>
      <div
        class="main-box"
        id="mainBox"
        v-bind:class="{ active: $store.state.mainBoxState }"
      >
        <workbench ref="workbench"></workbench>
      </div>
      <!-- 专题应用 -->
      <component
        v-bind:is="currentTabComponent"
        class="fullscreen-box"
      ></component>
      <!-- 地图 -->
      <!-- <a-spin size="large" :spinning="$store.state.loadingState"> -->
      <ag-map :toolList="toolList" ref="agMap"></ag-map>
      <!-- </a-spin> -->
    </div>
  </div>
</template>
<script>
import base from "./js/index";
import serverData4Config from "@/views/js/net/serverData4Config";
export default {
  name: "App",
  components: base,
  data() {
    return {
      curFuncObj: {},
      sidebarList: [],
      toolList: [],
      fastnavList: [],
      currentTabComponent: "",
    };
  },
  created() {
    setTimeout(() => {
      this.findFuncByUser();
    }, 1000);
  },
  methods: {
    //菜单
    async findFuncByUser() {
      let res = await serverData4Config.getFunctionData(
        this.$store.state.user.userId
      );
      if (res.content.length) {
        for (let key in res.content) {
          let list = res.content[key].childrenList;
          switch (res.content[key].code) {
            case "ag-sidebar": //左侧侧边栏
              this.sidebarList = list;
              this.addRouters(list);
              break;
            case "ag-toolbox": //工具栏
              this.toolList = list;
              break;
            case "ag-fastnav": //快捷栏
              this.fastnavList = list;
              break;
          }
        }
      } else {
        this.$message.error("接口超时，刷新浏览器再试试。");
      }
    },
    // 按后台配的数据添加路由
    addRouters(arr) {
      let vm = this;
      for (let i = 0; i < arr.length; i++) {
        let config = arr[i].childrenList;
        if (config) {
          for (let j = 0; j < config.length; j++) {
            if (
              !config[j].funcInvokeUrl ||
              config[j].funcInvokeUrl == "/" ||
              config[j].code.indexOf("-fullscreen") > -1
            ) {
              continue;
            } else {
              let comp = {
                path: config[j].funcInvokeUrl,
                name: config[j].code,
                component: () =>
                  import(
                    "../widgets/" + config[j].funcInvokeUrl + "/index.vue"
                  ),
                meta: {
                  keepAlive: true,
                },
              };
              vm.$router.options.routes[0].children.push(comp);
            }
          }
        }
      }
      vm.$router.addRoutes(vm.$router.options.routes);
    },
    //左边menu 打开当前功能区
    openMainBox(val) {
      if (!this.$store.state.mainBoxState) {
        this.currentTabComponent = "";
        this.$nextTick(() => {
          this.$store.state.mainBoxState = true;
        });
      }

      if (val.code.indexOf("-fullscreen") > -1) {
        this.showFullScreenWidgets(val);
      } else {
        this.$refs.workbench.onShow(val);
      }
    },
    showFullScreenWidgets(val) {
      this.$nextTick(() => {
        this.$store.state.mainBoxState = false;
      });
      this.currentTabComponent = require(`@/widgets/${val.funcInvokeUrl}/index.vue`).default;
    },
    //快捷键 工具
    changeToolState(o) {
      this.$refs.agMap.visibleChange(true);
      this.$refs.agMap.changeToolState(o);
    },
  },
};
</script>
<style scoped>
.base-page {
  height: 100%;
  width: 100%;
}
.main {
  position: relative;
  height: calc(100% - 57px);
}
.right {
  width: 100%;
  height: 100%;
}
#containCesium {
  width: 100%;
  height: 100%;
}
.fullscreen-box {
  position: absolute;
  padding-top: 50px;
  z-index: 4;
  box-sizing: border-box;
}
.main-box {
  position: absolute;
  top: 0;
  left: 142px;
  z-index: 5;
  background: rgba(255, 255, 255, 0.8);
  width: 0;
  height: 100%;
  transition: width 0.25s;
  overflow: hidden;
}
.main-box.active {
  width: 320px;
}

.cesium-infoBox-title {
  background: #3b72a8;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.cesium-infoBox {
  right: 5px;
  top: 60px;
  /* width: 400px; */
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #3b72a8;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  z-index: 999;
}

button.cesium-infoBox-camera {
  display: none;
}
</style>

<style>
/* ant spin自定义样式 防止高度100%丢失，背景透明度抹除*/
/* .ant-spin-nested-loading {
  height: 100%;
  max-height: 100% !important;
}
.ant-spin-container {
  height: 100%;
}
.ant-spin {
  background-color: #ffffff;
  height: 100%;
}
.ant-spin-nested-loading > div > .ant-spin {
  max-height: 100% !important;
} */
</style>
